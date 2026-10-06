/** PuzzleWorld wrapper, predict() and replay() over the pure sim core. */
import type {Scenario,PuzzleWorld,PuzzleState,PuzzleEvent,PuzzleInput,PuzzleSnapshot,Kick,Prediction,Replay,Vec3} from './types';
import {STEP} from './physics';
import {makeCtx,initialState,tick,beginKick,turnFor,setCall,planOnPath,planDefender,clamp,offsideLine,type Ctx,
  REACT,GK_AREA_DEPTH,GK_AREA_WIDE,SWEEPER_DEPTH,GK_SPEED,GK_REACT,GK_REACH,GK_DIVE,GK_HEIGHT,SAMPLE} from './sim';

const clone:<T>(v:T)=>T=typeof structuredClone==='function'?v=>structuredClone(v):v=>JSON.parse(JSON.stringify(v));
const ctxs=new WeakMap<PuzzleWorld,Ctx>();

export function createPuzzle(sc:Scenario):PuzzleWorld{
  const ctx=makeCtx(sc);
  let s:PuzzleState=initialState(ctx),start=clone(s),recorded:PuzzleInput[]=[],acc=0,queue:PuzzleEvent[]=[];
  const listeners=new Set<(e:PuzzleEvent)=>void>();
  const emit=(e:PuzzleEvent)=>{if(queue.length<512)queue.push(e);listeners.forEach(l=>l(e));};
  const w:PuzzleWorld={
    scenario:sc,
    get state(){return s;},
    step(dt:number){
      acc+=clamp(dt||0,0,0.25);
      while(acc>=STEP-1e-9){acc-=STEP;tick(ctx,s,emit);}
    },
    kick(k:Kick){
      const calls=s.attackers.flatMap((a,i)=>a.call&&a.call.startAt==null?[{attacker:i,to:{x:a.call.to.x,z:a.call.to.z}}]:[]);
      if(!beginKick(s,k,sc.require.noHeading))return false;
      recorded.push(calls.length?{tick:s.tick,kick:clone(s.pending!.kick),calls}:{tick:s.tick,kick:clone(s.pending!.kick)});
      return true;
    },
    snapshot(){return {scenario:sc,state:clone(s)};},
    restore(snap:PuzzleSnapshot){s=clone(snap.state);recorded=recorded.filter(i=>i.tick<s.tick);acc=0;},
    drain(){const q=queue;queue=[];return q;},
    on(fn){listeners.add(fn);return ()=>{listeners.delete(fn);};},
    retry(){
      if(s.phase==='success'||s.attemptsLeft<=0)return false;
      const n=initialState(ctx);n.attempt=s.attempt+1;n.attemptsLeft=s.attemptsLeft-1;
      s=n;start=clone(s);recorded=[];acc=0;queue=[];
      return true;
    },
    attemptStart(){return {scenario:sc,state:clone(start)};},
    inputs(){return recorded.map(i=>clone(i));},
    turnFor(k:Kick){return turnFor(s,k);},
    callRun(i,to){return setCall(ctx,s,i,to);},
  };
  ctxs.set(w,ctx);
  return w;
}

const PREDICT_FLIGHT_TICKS=4*120;
const END_OF:Record<string,Prediction['end']|undefined>={goal:'goal',out:'out',offside:'offside',intercept:'intercept',save:'intercept',parry:'intercept',deflect:'intercept',receive:'rest',heavy_touch:'rest'};

/**
 * Bounded look-ahead: clones the frozen aiming state, runs the windup and at most
 * 4 s of one flight with the real world rules, and stops at the first touch/goal/out.
 * Threats are the defenders who could reach any path point (before the touch) first.
 */
const memo=new WeakMap<PuzzleWorld,{key:string;state:PuzzleState;chain:number;out:Prediction}>();
export function predict(world:PuzzleWorld,kick:Kick):Prediction{
  // Pointer storms often repeat the same kick: while aiming the world is frozen (only tick/aimTime
  // move), so the last answer stays valid until a kick, receive, restore or retry. Don't mutate it.
  const key=kick.kind+'|'+kick.target.x+'|'+kick.target.z+'|'+kick.curl+'|'+kick.loft+'|'+kick.power+'|'+kick.receiver;
  const m=memo.get(world);
  const st=world.state;
  if(m&&m.key===key&&m.state===st&&m.chain===st.chain.length&&st.phase==='aiming')return m.out;
  const out=predictUncached(world,kick);
  memo.set(world,{key,state:st,chain:st.chain.length,out});
  return out;
}
function predictUncached(world:PuzzleWorld,kick:Kick):Prediction{
  const ctx=ctxs.get(world)??makeCtx(world.scenario);
  const empty:Prediction={path:[],end:'rest',threats:[],keeperThreat:false};
  if(world.state.phase!=='aiming')return empty;
  const s=clone(world.state);
  if(!beginKick(s,kick,ctx.sc.require.noHeading))return empty;
  const got:{e:PuzzleEvent|null;launched:boolean}={e:null,launched:false};
  const emit=(e:PuzzleEvent)=>{if(e.type==='kick'){got.launched=true;return;}if(!got.e&&END_OF[e.type])got.e=e;};
  let guard=200;
  while(!got.launched&&guard-->0)tick(ctx,s,emit);
  if(!got.launched||!s.path)return empty;
  const launchTick=s.tick,launchPath=s.path,launchOffside=s.flight?.offside.slice()??[],launchLine=ctx.sc.require.offside?offsideLine(ctx,s):undefined;
  // who threatens, from the positions at launch
  const defenders=s.defenders.map(d=>({x:d.p.x,z:d.p.z}));
  const kp=s.keeper?{x:s.keeper.p.x,z:s.keeper.p.z}:null;
  const path:Vec3[]=[{x:s.ball.p.x,y:s.ball.p.y,z:s.ball.p.z}];
  let hitsPost=false;
  for(let n=1;n<=PREDICT_FLIGHT_TICKS&&!got.e;n++){
    const vz=s.ball.v.z,vx=s.ball.v.x;
    tick(ctx,s,emit);
    if(s.phase==='flight'&&(Math.sign(vz)!==Math.sign(s.ball.v.z)||Math.sign(vx)!==Math.sign(s.ball.v.x))&&Math.abs(s.ball.p.z-ctx.geo.goalZ)<0.3)hitsPost=true;
    if(n%SAMPLE===0||got.e||s.phase!=='flight')path.push({x:s.ball.p.x,y:s.ball.p.y,z:s.ball.p.z});
    if(s.phase!=='flight')break;
  }
  const first=got.e as PuzzleEvent|null;
  const endTick=first?first.tick:s.tick;
  const limit=Math.min(launchPath.pts.length/3,Math.floor((endTick-launchTick)/SAMPLE)+1);
  const cut={tick0:launchPath.tick0,pts:launchPath.pts.slice(0,limit*3)};
  const threats:number[]=[];
  for(let j=0;j<defenders.length;j++){
    const p=defenders[j];
    if(planDefender(cut,launchTick,p,REACT))threats.push(j);
  }
  let keeperThreat=false;
  if(kp){
    const pl=planOnPath(cut,launchTick,kp,GK_SPEED,GK_REACT,GK_REACH+GK_DIVE,GK_HEIGHT);
    const sw=!!ctx.sc.keeper?.sweeper;keeperThreat=!!pl&&pl.z>=ctx.geo.goalZ-(sw?SWEEPER_DEPTH:GK_AREA_DEPTH)&&Math.abs(pl.x)<=ctx.geo.halfGoal+GK_AREA_WIDE+(sw?6:0);
  }
  const out:Prediction={path,end:first?END_OF[first.type]!:s.result?.reason==='out'?'out':'rest',threats,keeperThreat};
  if(first&&(first.type==='receive'||first.type==='heavy_touch')){out.receiver=first.attacker;out.receiveAt=first.at;}
  if(first?.type==='intercept'||first?.type==='deflect'){if(first.defender!=null&&!threats.includes(first.defender))threats.push(first.defender);}
  if(first&&(first.type==='save'||first.type==='parry'))keeperThreat=out.keeperThreat=true;
  if(out.end==='goal')out.keeperThreat=false;
  if(hitsPost)out.hitsPost=true;
  if(launchLine!==undefined){out.offside=launchOffside;out.offsideLine=launchLine;}
  if(first?.type==='offside'){out.receiver=first.attacker;out.receiveAt=first.at;}
  return out;
}

export function replay(snapshot:PuzzleSnapshot,inputs:PuzzleInput[],speed=0.38):Replay{
  const w=createPuzzle(snapshot.scenario);
  w.restore(snapshot);
  const queue=inputs.slice().sort((a,b)=>a.tick-b.tick);
  let qi=0,acc=0,done=false;
  const all:PuzzleEvent[]=[];
  w.on(e=>all.push(e));
  const s=()=>w.state;
  // Skip frozen aiming time instantly (identical ticks, nothing visible moves).
  function settleAim(){
    while(s().phase==='aiming'){
      const inp=queue[qi];
      if(!inp){done=true;return;}
      while(s().tick<inp.tick)w.step(STEP);
      for(const c of inp.calls??[])w.callRun(c.attacker,c.to);
      w.kick(inp.kick);qi++;
    }
    if(s().phase==='success'||s().phase==='fail')done=true;
  }
  function one(){settleAim();if(done)return;w.step(STEP);if(s().phase==='success'||s().phase==='fail')done=true;}
  const r:Replay={
    world:w,speed,
    get done(){return done;},
    advance(realDt:number){
      const from=all.length;
      acc+=clamp(realDt||0,0,0.25)*speed;
      while(!done&&acc>=STEP-1e-9){acc-=STEP;one();}
      return all.slice(from);
    },
    run(){let g=120*60;while(!done&&g-->0)one();return all.slice();},
  };
  return r;
}
