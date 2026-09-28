/**
 * Pass Puzzle world core: plain-data state + a fixed-step tick. Pure, deterministic
 * (no Math.random, no clocks). The world is frozen while aiming; the action clock
 * runs only during windup and flight, so scripted runs start when play starts.
 */
import type {Scenario,Kick,PuzzleState,PuzzleEvent,PuzzleEventType,Vec2,Vec3,AttackerState,DefenderState,KeeperState,FailReason,Touch} from './types';
import {STEP,G,R,ROLL,geoOf,stepBall,solveLaunch,solveLob,groundSpeedFor,hyp,F_GOAL,F_OUT,type Geo} from './physics';

/* ── tuning (metres, seconds) ── */
export const ATT_SPEED=6.6, MEET_SPEED=7.0, DEF_SPEED=6.3, DEF_JOG=5.4, ACCEL=11;
export const REACT=0.28, ATT_REACT=0.08, GK_REACT=0.2;
export const DEF_REACH=0.75, DEF_HEIGHT=2.05, SLIDE_REACH=1.35, SLIDE_HEIGHT=0.35;
export const ATT_REACH=0.85, ATT_HEIGHT=2.25, CHEST_Y=1.35, HEAD_LO=1.3;
export const GK_SPEED=6.2, GK_SET=3.0, GK_REACH=0.9, GK_DIVE=0.9, GK_HEIGHT=2.5, GK_AREA_DEPTH=5.5, GK_AREA_WIDE=6;
export const PARRY_SPEED=22, PARRY_DIVING=16, HEAVY_FEET=18, HEAVY_BODY=13, HEAVY_HEAD=24;
export const FIRST_TIME=1.5, SAMPLE=4, SPIN_MAX=10, HEAD_Y=1.85, MARK_GAP=1.3, PLAN_EVERY=12;
export const ADT=2*STEP; // players step at 60 Hz (every other tick)
export const MEET_MAX=2.5, REST_FAIL=2.5, FLIGHT_MAX=8, KICKER_IGNORE=0.3, HEADER_WINDUP=0.4;

export type Ctx={sc:Scenario;geo:Geo};
export type Emit=(e:PuzzleEvent)=>void;

export const clamp=(v:number,a:number,b:number)=>v<a?a:v>b?b:v;
export function wrapAngle(a:number){while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;return a;}
export function windupSeconds(turnRadians:number):number{return 0.26+Math.abs(turnRadians)/Math.PI*0.3;}
/** Time to cover d metres from rest with top speed v and ACCEL. */
export function travel(d:number,v:number):number{
  if(d<=0)return 0;const dAcc=v*v/(2*ACCEL);
  return d<dAcc?Math.sqrt(2*d/ACCEL):d/v+v/(2*ACCEL);
}

/** Like travel(), but already moving toward the point at u0 m/s (a runner in stride). */
export function travelFrom(d:number,u0:number,v:number):number{
  if(d<=0)return 0;u0=clamp(u0,0,v);
  const dAcc=(v*v-u0*u0)/(2*ACCEL);
  if(d>=dAcc)return (v-u0)/ACCEL+(d-dAcc)/v;
  return (-u0+Math.sqrt(u0*u0+2*ACCEL*d))/ACCEL;
}

export function makeCtx(sc:Scenario):Ctx{return {sc,geo:geoOf(sc)};}

export function initialState(ctx:Ctx):PuzzleState{
  const sc=ctx.sc,g=ctx.geo;
  const attackers:AttackerState[]=sc.attackers.map(a=>({p:{x:a.x,z:a.z},v:{x:0,z:0},facing:Math.atan2(-a.x,g.goalZ-a.z),mode:'idle',runT:0,runLeg:0}) as AttackerState);
  const c=attackers[sc.carrier];c.mode='hold';c.facing=0;
  const defenders:DefenderState[]=sc.defenders.map(d=>({p:{x:d.x,z:d.z},v:{x:0,z:0},facing:Math.PI,mode:d.press?'press':d.mark!=null?'mark':'hold',react:0}));
  const keeper:KeeperState|null=sc.keeper?{p:{x:sc.keeper.x,z:sc.keeper.z},v:{x:0,z:0},facing:Math.PI,mode:'set',react:0,dive:0,diveDir:0}:null;
  const s:PuzzleState={
    tick:0,t:0,phase:'aiming',attempt:1,attemptsLeft:Math.max(0,sc.attempts-1),passes:0,carrier:sc.carrier,aimTime:0,
    ball:{p:{x:0,y:R,z:0},v:{x:0,y:0,z:0},spin:0,owner:sc.carrier,atHead:false,lastTouch:{side:'att',i:sc.carrier},still:0},
    attackers,defenders,keeper,pending:null,flight:null,chain:[],result:null,path:null,
  };
  placeBallAtFeet(s,sc.carrier);
  return s;
}

function placeBallAtFeet(s:PuzzleState,i:number){
  const a=s.attackers[i],b=s.ball;
  b.p.x=a.p.x+Math.sin(a.facing)*0.35;b.p.z=a.p.z+Math.cos(a.facing)*0.35;b.p.y=b.atHead?HEAD_Y:R;
  b.v.x=b.v.y=b.v.z=0;b.spin=0;
}

/* ── kick → launch ── */
/** Apex height (m) for a lofted ball: loft 0.15 ≈ 2.2 m … loft 1 ≈ 8 m, lower for short chips. */
export function apexFor(loft:number,d:number):number{return Math.min(1.2+6.8*loft,0.9+0.3*d);}
/** Arrival pace (m/s) of a pass into space: the ball dies near the spot so a runner can collect it. */
/** Apex of a cross aimed at a head: 3.5–4.7 m (lower when short). */
export function crossApex(loft:number,d:number):number{return Math.min(3+5*Math.max(loft,0.5),8,1.5+0.3*d);}
export function spaceArrive(power:number):number{return 3+8*power;}

export function kickLaunch(geo:Geo,o:Vec3,k:Kick,fromHead:boolean):{v:Vec3;spin:number}{
  const spin=clamp(k.curl||0,-1,1)*SPIN_MAX*(fromHead?0.3:1);
  const pw=clamp(k.power||0,0,1),loft=clamp(k.loft||0,0,1);
  const d=hyp(k.target.x-o.x,k.target.z-o.z);
  // A lofted ball keeps its natural pace-driven arc unless that arc would peak above `cap`;
  // then it is re-solved as a lob that peaks at `cap` (no more 16–40 m moonballs on long passes).
  const lofted=(yT:number,h:number,cap:number):Vec3=>{
    const v=solveLaunch(o,k.target,yT,h,spin,true);
    return o.y+v.y*v.y/(2*G)>cap?solveLob(o,k.target,yT,cap,spin):v;
  };
  if(k.kind==='shot'){
    let h=15+15*pw;
    const aimed=Number.isFinite(k.shotHeight);
    if(!aimed&&loft>0.4)h+=(10-h)*((loft-0.4)/0.6);
    if(fromHead)h=Math.min(h,14);
    const yT=aimed?0.3+clamp(k.shotHeight!,0,1)*(geo.barH-0.55):Math.min(geo.barH-0.35,0.3+loft*(geo.barH-0.7));
    const v=aimed?lofted(yT,h,6.5):lofted(yT,h,Math.min(2.5+4*loft,0.9+0.3*d));
    // An aim solver must not manufacture pace to hit any distance at a low apex.
    // Long low shots can land and bounce before goal; loft trades pace for clearance.
    const speed=hyp(v.x,v.z,v.y),limit=18+20*pw;
    if(speed>limit){const scale=limit/speed;v.x*=scale;v.y*=scale;v.z*=scale;}
    return {v,spin};
  }
  let h=8+14*pw;
  if(fromHead)h=Math.min(h,12);
  if(k.kind==='header'){
    h=Math.max(7,h*(1-0.45*Math.max(loft,0.5)));
    return {v:lofted(1.75,h,Math.max(fromHead?HEAD_Y+1:3,crossApex(loft,d))),spin};
  }
  if(loft>0||fromHead){
    h=Math.max(6,Math.min(h,14-8*loft)*(1-0.3*loft));
    return {v:lofted(k.kind==='pass-feet'?0.3:R,h,fromHead?Math.max(HEAD_Y+0.5,apexFor(loft,d)):apexFor(loft,d)),spin};
  }
  if(k.kind==='pass-space'){
    return {v:solveLaunch(o,k.target,R,groundSpeedFor(d,spaceArrive(pw)),spin,false),spin};
  }
  h=Math.max(h,Math.sqrt(2*ROLL*d)*1.1+1.2);
  return {v:solveLaunch(o,k.target,R,h,spin,false),spin};
}

export function turnFor(s:PuzzleState,k:Kick):{turn:number;windup:number}{
  const a=s.attackers[s.carrier],b=s.ball.p;
  const dir=Math.atan2(k.target.x-b.x,k.target.z-b.z);
  const turn=wrapAngle(dir-a.facing);
  const w=windupSeconds(turn)*(s.ball.atHead?HEADER_WINDUP:1);
  return {turn,windup:w};
}

/** Start a kick from the aiming phase. */
export function beginKick(s:PuzzleState,k:Kick):boolean{
  if(s.phase!=='aiming'||s.ball.owner==null)return false;
  const {turn,windup}=turnFor(s,k);
  const kick:Kick={kind:k.kind,target:{x:k.target.x,z:k.target.z},curl:clamp(k.curl||0,-1,1),loft:clamp(k.loft||0,0,1),power:clamp(k.power||0,0,1)};
  if(k.receiver!=null)kick.receiver=k.receiver;
  if(Number.isFinite(k.shotHeight))kick.shotHeight=clamp(k.shotHeight!,0,1);
  s.pending={kick,kicker:s.carrier,left:windup,total:windup,turn,fromHead:s.ball.atHead};
  s.phase='windup';
  return true;
}

/* ── path cache ── */
export function computePath(ctx:Ctx,s:PuzzleState){
  const b={p:{...s.ball.p},v:{...s.ball.v},spin:s.ball.spin};
  const pts:number[]=[b.p.x,b.p.y,b.p.z];
  for(let n=1;n<=600;n++){
    const f=stepBall(b,ctx.geo);
    if(n%SAMPLE===0||f&(F_GOAL|F_OUT)){pts.push(b.p.x,b.p.y,b.p.z);}
    if(f&(F_GOAL|F_OUT))break;
    if(b.p.y<=R+1e-6&&b.v.x*b.v.x+b.v.z*b.v.z<0.0025&&Math.abs(b.v.y)<1e-6)break;
  }
  s.path={tick0:s.tick,pts};
}

/** Earliest path sample the mover can reach before the ball. */
export function planOnPath(path:{tick0:number;pts:number[]},nowTick:number,p:Vec2,speed:number,reactLeft:number,reach:number,hiY:number,loY=-1,from=0,prefer?:Vec2,within?:{x:number;z:number;r:number},vel?:Vec2):{k:number;x:number;z:number;dt:number}|null{
  const pts=path.pts,n=pts.length/3,px=p.x,pz=p.z;
  let best:{k:number;x:number;z:number;dt:number}|null=null,bestD=1e18;
  const k0=Math.max(from,Math.ceil((nowTick-path.tick0)/SAMPLE));
  for(let k=k0;k<n;k++){
    const y=pts[3*k+1];
    if(y>hiY||y<loY)continue;
    const x=pts[3*k],z=pts[3*k+2];
    if(within){const wx=x-within.x,wz=z-within.z;if(wx*wx+wz*wz>within.r*within.r)continue;}
    const tk=(path.tick0+k*SAMPLE-nowTick)*STEP;
    const dx=x-px,dz=z-pz,d2=dx*dx+dz*dz;
    // cheap reject: even at top speed from the first instant it can't get there
    const bound=reach+speed*Math.max(0,tk-reactLeft);
    if(d2>bound*bound)continue;
    const d=Math.sqrt(d2);
    const need=d<=reach?0:reactLeft+(vel?travelFrom(d-reach,(vel.x*dx+vel.z*dz)/d,speed):travel(d-reach,speed));
    if(need<=tk){
      if(!prefer)return {k,x,z,dt:tk};
      const qx=x-prefer.x,qz=z-prefer.z,dp=qx*qx+qz*qz;
      if(dp<bestD){bestD=dp;best={k,x,z,dt:tk};}
    }
  }
  return best;
}

/** One scan for a defender: the earliest standing interception, else the earliest slide. */
export function planDefender(path:{tick0:number;pts:number[]},nowTick:number,p:Vec2,reactLeft:number):{x:number;z:number;dt:number;slide:boolean}|null{
  const pts=path.pts,n=pts.length/3,px=p.x,pz=p.z;
  let slide:{x:number;z:number;dt:number;slide:boolean}|null=null;
  for(let k=Math.max(0,Math.ceil((nowTick-path.tick0)/SAMPLE));k<n;k++){
    const y=pts[3*k+1];if(y>DEF_HEIGHT)continue;
    const x=pts[3*k],z=pts[3*k+2],tk=(path.tick0+k*SAMPLE-nowTick)*STEP;
    const canSlide=!slide&&y<=SLIDE_HEIGHT,reach=canSlide?SLIDE_REACH:DEF_REACH;
    const dx=x-px,dz=z-pz,d2=dx*dx+dz*dz,bound=reach+DEF_SPEED*Math.max(0,tk-reactLeft);
    if(d2>bound*bound)continue;
    const d=Math.sqrt(d2);
    if((d<=DEF_REACH?0:reactLeft+travel(d-DEF_REACH,DEF_SPEED))<=tk)return {x,z,dt:tk,slide:false};
    if(canSlide&&(d<=SLIDE_REACH?0:reactLeft+travel(d-SLIDE_REACH,DEF_SPEED))<=tk)slide={x,z,dt:tk,slide:true};
  }
  return slide;
}

/* ── movement ── */
function moveTo(a:{p:Vec2;v:Vec2;facing:number},tx:number,tz:number,max:number,brake=true){
  const dx=tx-a.p.x,dz=tz-a.p.z,d=hyp(dx,dz);
  let wx=0,wz=0;
  if(d>0.05){const sp=brake?Math.min(max,d*4):max;wx=dx/d*sp;wz=dz/d*sp;}
  let ddx=wx-a.v.x,ddz=wz-a.v.z;const dm=hyp(ddx,ddz),lim=ACCEL*ADT;
  if(dm>lim){ddx*=lim/dm;ddz*=lim/dm;}
  a.v.x+=ddx;a.v.z+=ddz;a.p.x+=a.v.x*ADT;a.p.z+=a.v.z*ADT;
  if(a.v.x*a.v.x+a.v.z*a.v.z>0.25)a.facing=Math.atan2(a.v.x,a.v.z);
}
function brakeStop(a:{p:Vec2;v:Vec2}){
  const sp=hyp(a.v.x,a.v.z),lim=ACCEL*ADT;
  if(sp<=lim){a.v.x=0;a.v.z=0;}else{a.v.x-=a.v.x/sp*lim;a.v.z-=a.v.z/sp*lim;}
  a.p.x+=a.v.x*ADT;a.p.z+=a.v.z*ADT;
}
function faceToward(a:{facing:number},x:number,z:number,px:number,pz:number,rate:number){
  const want=Math.atan2(x-px,z-pz),d=wrapAngle(want-a.facing),m=rate*ADT;
  a.facing=wrapAngle(a.facing+clamp(d,-m,m));
}

function runStep(ctx:Ctx,s:PuzzleState,i:number){
  const a=s.attackers[i],run=ctx.sc.attackers[i].run;
  if(!run||a.runLeg>=run.path.length){if(a.mode==='run')a.mode='idle';brakeStop(a);return;}
  // afterPass runs start `delay` s after this player's own pass (pass-and-move); others count from kick-off
  const startAt=run.afterPass?(a.passedAt==null?Infinity:a.passedAt+run.delay):run.delay;
  if(s.t<startAt){brakeStop(a);return;}
  a.mode='run';a.runT+=ADT;
  const wp=run.path[a.runLeg];
  const last=a.runLeg===run.path.length-1;
  moveTo(a,wp.x,wp.z,run.speed??ATT_SPEED,last);
  if(hyp(wp.x-a.p.x,wp.z-a.p.z)<(last?0.1:0.45))a.runLeg++;
}

function goalSide(ctx:Ctx,px:number,pz:number,gap:number):Vec2{
  const gx=0-px,gz=ctx.geo.goalZ-pz,d=hyp(gx,gz)||1;
  return {x:px+gx/d*gap,z:pz+gz/d*gap};
}

function defenderShape(ctx:Ctx,s:PuzzleState,j:number){
  const d=s.defenders[j],def=ctx.sc.defenders[j],b=s.ball.p;
  let t:Vec2;
  if(def.press){t=goalSide(ctx,b.x,b.z,s.ball.owner!=null?1.2:0.6);d.mode='press';}
  else if(def.mark!=null&&s.attackers[def.mark]){const m=s.attackers[def.mark];t=goalSide(ctx,m.p.x,m.p.z,MARK_GAP);d.mode='mark';}
  else{t={x:def.x+(b.x-def.x)*0.25,z:def.z};d.mode='hold';}
  moveTo(d,t.x,t.z,def.press?DEF_SPEED:DEF_JOG);
  faceToward(d,b.x,b.z,d.p.x,d.p.z,8);
}

function keeperSet(ctx:Ctx,s:PuzzleState){
  const k=s.keeper!,g=ctx.geo,b=s.ball.p;
  const dx=b.x,dz=b.z-g.goalZ,dist=hyp(dx,dz)||1;
  const dk=clamp(0.8+0.1*dist,0.8,4);
  const tx=clamp(dx/dist*dk,-(g.halfGoal-0.3),g.halfGoal-0.3),tz=g.goalZ+dz/dist*dk;
  k.mode='set';k.dive=Math.max(0,k.dive-ADT*3);
  // Honour the authored start: he holds it (set, watching) until the first ball is struck, and only
  // re-positions after reacting to a kick — at a shuffle, not a sprint.
  if(s.chain.length===0||(s.phase==='flight'&&k.react<GK_REACT)){brakeStop(k);faceToward(k,b.x,b.z,k.p.x,k.p.z,10);return;}
  moveTo(k,tx,tz,GK_SET);
  faceToward(k,b.x,b.z,k.p.x,k.p.z,10);
}

function inKeeperArea(g:Geo,x:number,z:number){return z>=g.goalZ-GK_AREA_DEPTH&&Math.abs(x)<=g.halfGoal+GK_AREA_WIDE;}

/* ── the tick ── */
export function tick(ctx:Ctx,s:PuzzleState,emit:Emit){
  s.tick++;
  if(s.phase==='aiming'){s.aimTime+=STEP;return;}
  s.t+=STEP;
  if(s.phase==='windup')return windupTick(ctx,s,emit);
  if(s.phase==='flight')return flightTick(ctx,s,emit);
  // terminal: let the ball and players settle
  if(s.tick%2===0){
    for(const a of s.attackers)brakeStop(a);
    for(const d of s.defenders)brakeStop(d);
    if(s.keeper){brakeStop(s.keeper);s.keeper.dive=Math.max(0,s.keeper.dive-ADT*3);if(s.keeper.dive===0&&s.keeper.mode==='dive')s.keeper.mode='set';}
  }
  const r=s.result?.reason;
  if(s.ball.owner==null&&r!=='save'&&r!=='intercept')stepBall(s.ball,ctx.geo,s.result?.outcome==='success'&&s.ball.p.z>ctx.geo.goalZ);
}

function ev(s:PuzzleState,type:PuzzleEventType,extra:Partial<PuzzleEvent>={}):PuzzleEvent{
  const b=s.ball;
  return {type,tick:s.tick,t:s.t,at:{x:b.p.x,y:b.p.y,z:b.p.z},speed:hyp(b.v.x,b.v.y,b.v.z),...extra};
}

function windupTick(ctx:Ctx,s:PuzzleState,emit:Emit){
  const pd=s.pending!,kk=s.attackers[pd.kicker];
  if(s.tick%2===0){ // players move at 60 Hz, the ball at 120 Hz
    for(let i=0;i<s.attackers.length;i++){if(i===pd.kicker)continue;runStep(ctx,s,i);}
    kk.v.x=kk.v.z=0;
    faceToward(kk,pd.kick.target.x,pd.kick.target.z,s.ball.p.x,s.ball.p.z,Math.abs(pd.turn)/Math.max(0.05,pd.total)*1.05+0.5);
    for(let j=0;j<s.defenders.length;j++)defenderShape(ctx,s,j);
    if(s.keeper)keeperSet(ctx,s);
  }
  pd.left-=STEP;
  if(pd.left>1e-9)return;
  // launch
  const {v,spin}=kickLaunch(ctx.geo,s.ball.p,pd.kick,pd.fromHead);
  const b=s.ball;b.v.x=v.x;b.v.y=v.y;b.v.z=v.z;b.spin=spin;b.owner=null;b.atHead=false;b.lastTouch={side:'att',i:pd.kicker};b.still=0;
  kk.mode='idle';kk.passedAt=s.t;
  if(!ctx.sc.attackers[pd.kicker].run?.afterPass)kk.runLeg=Math.max(kk.runLeg,ctx.sc.attackers[pd.kicker].run?.path.length??0);
  const firstTime=pd.fromHead||(s.chain.length>0&&s.aimTime<=FIRST_TIME);
  s.chain.push({kind:pd.kick.kind,curl:pd.kick.curl,loft:pd.kick.loft,kicker:pd.kicker,header:pd.fromHead,firstTime});
  let receiver:number|null=pd.kick.receiver??null;
  s.flight={kick:pd.kick,kicker:pd.kicker,elapsed:0,receiver,header:pd.fromHead,firstTime,dirty:false};
  s.pending=null;s.phase='flight';
  for(const d of s.defenders){d.react=0;d.target=undefined;}
  if(s.keeper){s.keeper.react=0;s.keeper.target=undefined;}
  computePath(ctx,s);
  if(receiver==null&&pd.kick.kind!=='shot')s.flight.receiver=bestChaser(s,pd.kicker);
  emit(ev(s,'kick',{attacker:pd.kicker,kind:pd.kick.kind,turn:pd.turn,windup:pd.total}));
}

function bestChaser(s:PuzzleState,exclude:number):number|null{
  if(!s.path)return null;
  let best:number|null=null,bt=1e9;
  for(let i=0;i<s.attackers.length;i++){
    if(i===exclude)continue;
    const pl=planOnPath(s.path,s.tick,s.attackers[i].p,MEET_SPEED,ATT_REACT,ATT_REACH,ATT_HEIGHT);
    if(pl&&pl.dt<bt){bt=pl.dt;best=i;}
  }
  return best;
}

function flightTick(ctx:Ctx,s:PuzzleState,emit:Emit){
  const f=s.flight!,g=ctx.geo,b=s.ball,path=s.path!;
  f.elapsed+=STEP;
  for(const d of s.defenders)d.react+=STEP;
  if(s.keeper)s.keeper.react+=STEP;
  if(s.tick%2===0)movePlayers(ctx,s,f,path);
  // ball
  const flags=stepBall(b,g);
  if(flags&F_GOAL){
    const scorer=b.lastTouch?.side==='att'?b.lastTouch.i:f.kicker;
    emit(ev(s,'goal',{attacker:scorer}));
    const direct=ctx.sc.require.allowDirectShot===true&&ctx.sc.require.finish==='goal'&&s.passes===0&&s.chain.length===1&&f.kick.kind==='shot'&&!f.header&&!f.dirty&&b.lastTouch?.side==='att'&&b.lastTouch.i===f.kicker;
    const ok=s.passes>=ctx.sc.require.minPasses||direct;
    finish(ctx,s,ok?'success':'fail',ok?undefined:'too-few-passes',scorer);return;
  }
  if(flags&F_OUT){
    emit(ev(s,'out',{attacker:b.lastTouch?.side==='att'?b.lastTouch.i:undefined}));
    finish(ctx,s,'fail','out');return;
  }
  if(contacts(ctx,s,emit))return;
  // rest / timeout
  const sp2=b.v.x*b.v.x+b.v.z*b.v.z;
  if(b.p.y<=R+1e-6&&sp2<0.09)b.still+=STEP;else b.still=0;
  if(b.still>REST_FAIL){finish(ctx,s,'fail','rest');return;}
  if(f.elapsed>FLIGHT_MAX){finish(ctx,s,'fail','timeout');return;}
}

/** Player AI + movement for one 60 Hz actor step during a flight. */
function movePlayers(ctx:Ctx,s:PuzzleState,f:NonNullable<PuzzleState['flight']>,path:NonNullable<PuzzleState['path']>){
  const g=ctx.geo,b=s.ball;
  const replan=(s.tick-path.tick0)%PLAN_EVERY<2;
  // attackers
  for(let i=0;i<s.attackers.length;i++){
    const a=s.attackers[i];
    if(i===f.receiver){
      a.mode='meet';
      if(replan||!a.target){
        // pass-space: run onto it; header: attack the aimed spot; lofted to feet: meet it once it drops
        // to chest height; ground pass: come to meet it (earliest point you can get to first).
        const fresh=!f.dirty&&b.lastTouch?.side==='att'&&b.lastTouch.i===f.kicker,kind=f.kick.kind;
        const prefer=fresh&&(kind==='pass-space'||kind==='header')?f.kick.target:undefined;
        const hi=fresh&&kind==='pass-feet'&&f.kick.loft>0?CHEST_Y:ATT_HEIGHT,lo=fresh&&kind==='header'?HEAD_LO:-1;
        const near=fresh&&kind==='pass-feet'?{x:f.kick.target.x,z:f.kick.target.z,r:MEET_MAX}:undefined;
        const pl=(near&&planOnPath(path,s.tick,a.p,MEET_SPEED,0,ATT_REACH*0.5,hi,lo,0,undefined,near,a.v))||planOnPath(path,s.tick,a.p,MEET_SPEED,0,ATT_REACH*0.5,hi,lo,0,prefer,undefined,a.v);
        const n=path.pts.length/3-1;
        a.target=pl?{x:pl.x,z:pl.z}:{x:path.pts[3*n],z:path.pts[3*n+2]};
      }
      const t=a.target!;
      moveTo(a,t.x,t.z,MEET_SPEED,true);
      faceToward(a,b.p.x,b.p.z,a.p.x,a.p.z,10);
    }else runStep(ctx,s,i);
  }
  // defenders
  for(let j=0;j<s.defenders.length;j++){
    const d=s.defenders[j];
    if(d.react<REACT){defenderShape(ctx,s,j);continue;}
    if(replan||d.react-ADT<REACT){
      const pl=planDefender(path,s.tick,d.p,0);
      d.slide=!!pl&&pl.slide;d.target=pl?{x:pl.x,z:pl.z}:undefined;
    }
    if(d.target){d.mode='intercept';moveTo(d,d.target.x,d.target.z,DEF_SPEED,false);faceToward(d,b.p.x,b.p.z,d.p.x,d.p.z,10);}
    else defenderShape(ctx,s,j);
  }
  // keeper
  const k=s.keeper;
  if(k){
    if(k.react>=GK_REACT&&(replan||k.react-ADT<GK_REACT)){
      const pl=planOnPath(path,s.tick,k.p,GK_SPEED,0,GK_REACH+GK_DIVE,GK_HEIGHT);
      k.target=pl&&inKeeperArea(g,pl.x,pl.z)?{x:pl.x,z:pl.z}:undefined;
      if(k.target&&Math.abs(k.target.x-k.p.x)>1.0){k.mode='dive';k.diveDir=Math.sign(k.target.x-k.p.x);}
      else if(k.target)k.mode='claim';
    }
    if(k.target&&k.react>=GK_REACT){
      moveTo(k,k.target.x,k.target.z,GK_SPEED,false);
      if(k.mode==='dive')k.dive=Math.min(1,k.dive+ADT/0.35);
      faceToward(k,b.p.x,b.p.z,k.p.x,k.p.z,10);
    }else keeperSet(ctx,s);
  }
}

function touchOf(y:number):Touch{return y<=0.55?'feet':y<=0.95?'thigh':y<=1.35?'chest':'header';}

function contacts(ctx:Ctx,s:PuzzleState,emit:Emit):boolean{
  const b=s.ball,f=s.flight!,y=b.p.y;
  let bestD=1e9,who:'att'|'def'|'gk'|null=null,wi=-1,slide=false;
  for(let i=0;i<s.attackers.length;i++){
    if(i===f.kicker&&f.elapsed<KICKER_IGNORE&&b.lastTouch?.side==='att'&&b.lastTouch.i===i)continue;
    if(y>ATT_HEIGHT)continue;
    // a chip to feet: the intended receiver lets it drop and takes it on the chest, thigh or foot
    if(i===f.receiver&&y>CHEST_Y&&f.kick.kind==='pass-feet'&&f.kick.loft>0&&!f.dirty)continue;
    const a=s.attackers[i],d=hyp(b.p.x-a.p.x,b.p.z-a.p.z);
    if(d<=ATT_REACH&&d<bestD){bestD=d;who='att';wi=i;}
  }
  for(let j=0;j<s.defenders.length;j++){
    const dd=s.defenders[j];if(dd.react<0)continue; // off balance after a deflection
    const d=hyp(b.p.x-dd.p.x,b.p.z-dd.p.z);
    if(y<=DEF_HEIGHT&&d<=DEF_REACH&&d<bestD){bestD=d;who='def';wi=j;slide=false;}
    else if(dd.slide&&dd.react>=REACT&&y<=SLIDE_HEIGHT&&d<=SLIDE_REACH&&d+0.4<bestD){bestD=d+0.4;who='def';wi=j;slide=true;}
  }
  const k=s.keeper;
  if(k&&k.react>=0){
    const d=hyp(b.p.x-k.p.x,b.p.z-k.p.z),reach=GK_REACH+GK_DIVE*k.dive;
    if(y<=GK_HEIGHT&&d<=reach&&d<bestD&&inKeeperArea(ctx.geo,b.p.x,b.p.z)){bestD=d;who='gk';wi=0;}
  }
  if(!who)return false;
  const sp=hyp(b.v.x,b.v.y,b.v.z);
  if(who==='att'){
    const a=s.attackers[wi],touch=touchOf(y);
    const limit=touch==='feet'?HEAVY_FEET:touch==='header'?HEAVY_HEAD:HEAVY_BODY;
    if(sp>limit){
      emit(ev(s,'heavy_touch',{attacker:wi,touch}));
      b.v.x*=0.32;b.v.z*=0.32;b.v.y=Math.max(1.2,Math.abs(b.v.y)*0.3);b.spin=0;
      b.p.x+=b.v.x*STEP*4;b.p.z+=b.v.z*STEP*4;
      b.lastTouch={side:'att',i:wi};f.receiver=wi;f.elapsed=Math.max(f.elapsed,KICKER_IGNORE);
      computePath(ctx,s);a.target=undefined;
      return true;
    }
    const cleanPass=b.lastTouch?.side==='att'&&(b.lastTouch.i===f.kicker||b.lastTouch.i===wi)&&!f.dirty;
    const counted=cleanPass&&wi!==f.kicker;
    if(counted)s.passes++;
    emit(ev(s,'receive',{attacker:wi,touch}));
    // take possession, frozen for the next aim
    a.facing=Math.atan2(-b.v.x,-b.v.z)||a.facing;
    if(hyp(b.v.x,b.v.z)<0.5)a.facing=Math.atan2(-a.p.x,ctx.geo.goalZ-a.p.z);
    a.mode='hold';if(!ctx.sc.attackers[wi].run?.afterPass)a.runLeg=ctx.sc.attackers[wi].run?.path.length??0;
    b.owner=wi;b.atHead=touch==='header';b.lastTouch={side:'att',i:wi};b.still=0;
    placeBallAtFeet(s,wi);
    s.carrier=wi;s.aimTime=0;
    for(const x of s.attackers){x.v.x=x.v.z=0;x.target=undefined;}
    for(const x of s.defenders){x.v.x=x.v.z=0;x.target=undefined;}
    if(s.keeper){s.keeper.v.x=s.keeper.v.z=0;s.keeper.target=undefined;s.keeper.mode='set';s.keeper.dive=0;}
    s.flight=null;s.path=null;
    const req=ctx.sc.require;
    if(req.finish==='reach-zone'&&req.zone&&s.passes>=req.minPasses&&hyp(a.p.x-req.zone.x,a.p.z-req.zone.z)<=req.zone.r){
      finish(ctx,s,'success',undefined,wi);return true;
    }
    s.phase='aiming';
    return true;
  }
  if(who==='def'){
    const d=s.defenders[wi];
    const reacted=d.react>=REACT;
    if(reacted&&!slide){
      emit(ev(s,'intercept',{defender:wi}));
      b.lastTouch={side:'def',i:wi};b.v.x=b.v.y=b.v.z=0;b.p.x=d.p.x;b.p.z=d.p.z;b.p.y=R;
      finish(ctx,s,'fail','intercept');return true;
    }
    // deflect: a slide or an unready body block knocks it on/away at reduced pace
    emit(ev(s,'deflect',{defender:wi}));
    const nx=b.p.x-d.p.x,nz=b.p.z-d.p.z,nl=hyp(nx,nz)||1;
    const vn=b.v.x*nx/nl+b.v.z*nz/nl;
    b.v.x=(b.v.x-(vn<0?1.6*vn*nx/nl:0))*0.45;b.v.z=(b.v.z-(vn<0?1.6*vn*nz/nl:0))*0.45;
    b.v.y=Math.abs(b.v.y)*0.4+(slide?0.5:1.5);b.spin=0;
    b.lastTouch={side:'def',i:wi};f.dirty=true;
    d.react=-0.4;d.target=undefined; // the deflector is off balance
    computePath(ctx,s);f.receiver=bestChaser(s,-1);
    for(const x of s.attackers)x.target=undefined;
    return true;
  }
  // keeper
  const reacted=k!.react>=GK_REACT;
  if(reacted&&sp<(k!.dive>0.5?PARRY_DIVING:PARRY_SPEED)){
    emit(ev(s,'save',{keeper:true}));
    b.lastTouch={side:'gk',i:0};b.v.x=b.v.y=b.v.z=0;b.p.x=k!.p.x;b.p.z=k!.p.z;b.p.y=1.0;
    finish(ctx,s,'fail','save');return true;
  }
  emit(ev(s,'parry',{keeper:true}));
  const side=Math.sign(b.p.x-k!.p.x)||(b.p.x>=0?1:-1);
  b.v.z=-Math.abs(b.v.z)*0.3;b.v.x=b.v.x*0.3+side*4;b.v.y=2;b.spin=0;
  b.p.z=Math.min(b.p.z,ctx.geo.goalZ-0.05);
  b.lastTouch={side:'gk',i:0};f.dirty=true;k!.react=-0.6;k!.target=undefined;
  computePath(ctx,s);f.receiver=bestChaser(s,-1);
  for(const x of s.attackers)x.target=undefined;
  return true;
}

function finish(ctx:Ctx,s:PuzzleState,outcome:'success'|'fail',reason?:FailReason,scorer?:number){
  s.phase=outcome;
  let bonus=false;
  const bz=ctx.sc.bonus;
  if(outcome==='success'&&bz){
    const ch=s.chain,last=ch[ch.length-1];
    if(bz.kind==='curl')bonus=ch.some(c=>Math.abs(c.curl)>=0.35);
    else if(bz.kind==='chip')bonus=ch.some(c=>c.loft>0&&c.kind!=='header'&&!c.header);
    else if(bz.kind==='header')bonus=ctx.sc.require.finish==='goal'?!!last?.header:ch.some(c=>c.header||c.kind==='header');
    else if(bz.kind==='first-time')bonus=!!last?.firstTime;
    else if(bz.kind==='scorer')bonus=scorer!=null&&scorer===bz.scorer;
  }
  s.result={outcome,reason,passes:s.passes,bonus};
}
