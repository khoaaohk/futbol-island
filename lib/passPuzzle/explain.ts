/**
 * Pass Puzzles coaching words: the live lane read while a pass is drawn, the "why it worked" takeaway
 * after a solve, the "why it didn't" after a miss, and the replay's play-by-play calls. Pure (no DOM,
 * no three.js); everything here runs once per release, per event or per result, never per frame.
 * Players are named by their shirt number ("#4"), the same numbers the pitch shows over their heads.
 */
import type {Format,Kick,Prediction,PuzzleEvent,Scenario,Vec2} from './types';

export type LaneStatus='clear'|'tight'|'blocked'|'offside'|'save';
/** Spare time (s) under which a clean lane still counts as tight. */
export const TIGHT_SLACK=0.35;

/** Read the predicted pass the way a coach would: is the lane open, tight, or shut? */
export function laneStatus(p:Prediction|null|undefined):LaneStatus|null{
  if(!p||!p.path.length)return null;
  if(p.end==='offside')return 'offside';
  if(p.threats.length)return 'blocked';
  if(p.keeperThreat&&p.end!=='goal')return 'save';
  if(p.end==='intercept')return 'blocked';
  if(p.closest&&p.closest.slack<TIGHT_SLACK)return 'tight';
  return 'clear';
}

export type Numbers={attackers:number[];defenders:number[];keeper:number};
const young=(f:Format)=>f==='7v7';
const num=(n:number|undefined)=>n?`#${n}`:'a teammate';

/** The live line under the pitch while drawing: short, names the defender, says what to do. */
export function laneWords(status:LaneStatus,p:Prediction,nums:Numbers,f:Format):string{
  const d=(i:number|undefined)=>i===undefined||nums.defenders[i]===undefined?'A defender':`#${nums.defenders[i]}`;
  switch(status){
    case 'blocked':{const who=p.threats[0]??p.closest?.defender;return young(f)?`${d(who)} can reach that. Find another way!`:`${d(who)} can cut that out. Change the angle, lift it or bend it.`;}
    case 'save':return young(f)?'The keeper can get that one. Aim away from them.':'The keeper reaches that. Pick the far side or play another pass.';
    case 'offside':return young(f)?'Offside! Your friend is past the last defender.':'Offside! The flagged teammate is past the last defender. Pass sooner or to someone onside.';
    case 'tight':return young(f)?`Tight! ${d(p.closest?.defender).replace('A d','a d')} is close. A bit more room is safer.`:`Tight lane: ${d(p.closest?.defender)} nearly gets there. More angle makes it safe.`;
    default:return p.end==='goal'?(young(f)?'Clear shot! Let it go.':'Clear sight of goal. Release to shoot.'):(young(f)?'Clear! No one can reach it.':'Clear lane: no defender can reach it in time.');
  }
}

/** What happened at one release, kept for the takeaway (one small record per kick). */
export type PassNote={kicker:number;kind:Kick['kind'];receiver?:number;loft:number;curl:number;target:Vec2;from:Vec2;
  /** the defender who came closest and the spare time the ball had over them */
  closest?:{defender:number;slack:number};
  /** defenders the pass went past (between the kicker and the receiver, up the pitch) */
  beaten:number;
  /** a defender standing near the straight line of the pass, by index */
  inLine?:number;
  /** runs the child called before this kick */
  calls:number[];
  firstTime:boolean;
  /** offside puzzles: how far the receiver was behind the line at the release (m, >0 onside) */
  onsideBy?:number;
  keeperX?:number;
  /** teammates whose simple pass to feet was shut at this release (the scan's red lanes) */
  shut?:number[];
};

const segDist=(p:Vec2,a:Vec2,b:Vec2)=>{const dx=b.x-a.x,dz=b.z-a.z,l2=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.z-a.z)*dz)/l2));return Math.hypot(a.x+dx*t-p.x,a.z+dz*t-p.z);};

/** Build the note for a kick about to be played (call with the prediction made at the release). */
export function noteFor(state:{carrier:number;ball:{p:Vec2};attackers:{p:Vec2}[];defenders:{p:Vec2}[];keeper?:{p:Vec2}|null},k:Kick,p:Prediction|null,calls:number[],firstTime:boolean):PassNote{
  const from={x:state.ball.p.x,z:state.ball.p.z},recv=p?.receiver??k.receiver,to=p?.receiveAt?{x:p.receiveAt.x,z:p.receiveAt.z}:recv!==undefined&&state.attackers[recv]&&k.kind==='pass-feet'?state.attackers[recv].p:k.target;
  let beaten=0,inLine:number|undefined,best=2.4;
  state.defenders.forEach((d,i)=>{if(to.z-from.z>3&&d.p.z>from.z+.5&&d.p.z<to.z-.3)beaten++;const s=segDist(d.p,from,to);if(s<best){best=s;inLine=i;}});
  const n:PassNote={kicker:state.carrier,kind:k.kind,receiver:recv,loft:k.loft,curl:k.curl,target:{x:to.x,z:to.z},from,beaten,inLine,calls,firstTime,keeperX:state.keeper?.p.x};
  if(p?.closest)n.closest={defender:p.closest.defender,slack:p.closest.slack};
  if(p?.offsideLine!==undefined&&recv!==undefined&&state.attackers[recv])n.onsideBy=p.offsideLine-state.attackers[recv].p.z;
  return n;
}

/** "Why it worked": up to `max` short reasons, most telling first. */
export function explainSuccess(notes:PassNote[],sc:Scenario,nums:Numbers,f:Format,max=2):string[]{
  const a=(i:number|undefined)=>num(i===undefined?undefined:nums.attackers[i]),d=(i:number|undefined)=>i===undefined?'the defender':`#${nums.defenders[i]}`,y=young(f);
  const out:{w:number;t:string}[]=[];
  notes.forEach((n,i)=>{
    const last=i===notes.length-1,pass=n.kind!=='shot';
    if(n.calls.length)out.push({w:9,t:y?`${a(n.calls[0])}'s run made the space before you passed.`:`Calling ${a(n.calls[0])}'s run first created the space the pass went into.`});
    if(pass&&n.loft>=.3&&n.inLine!==undefined)out.push({w:8,t:y?`You lifted it over ${d(n.inLine)}, so they could not reach it.`:`The lofted pass cleared ${d(n.inLine)}, who stood in the ground lane.`});
    else if(Math.abs(n.curl)>=.35&&n.inLine!==undefined)out.push({w:8,t:y?`You bent it around ${d(n.inLine)}.`:`The curl took the ball around ${d(n.inLine)} and back onto target.`});
    if(pass&&n.beaten>=1)out.push({w:7+n.beaten,t:y?`Your pass to ${a(n.receiver)} went past ${n.beaten===1?'a defender':`${n.beaten} defenders`} in one go.`:`The pass to ${a(n.receiver)} broke a line: ${n.beaten} defender${n.beaten===1?'':'s'} taken out with one ball.`});
    if(n.onsideBy!==undefined&&n.onsideBy>=-.1&&n.onsideBy<2.5)out.push({w:7,t:y?`${a(n.receiver)} stayed onside, just behind the last defender when you passed.`:`${a(n.receiver)} timed it: onside at the moment of the pass, then through.`});
    if(pass&&n.closest&&n.closest.slack>=TIGHT_SLACK)out.push({w:5,t:y?`${d(n.closest.defender)} was the closest defender, but too far away to reach it.`:`Safe lane: ${d(n.closest.defender)} was the nearest threat and still ${n.closest.slack.toFixed(1)} s too late.`});
    else if(pass&&n.closest&&n.closest.slack>=0)out.push({w:3,t:y?`Just in time! ${d(n.closest.defender)} nearly got there.`:`It only just got past ${d(n.closest.defender)}: more angle would make it safer.`});
    if(last&&n.kind==='shot'){
      if(n.firstTime&&notes.length>1)out.push({w:6,t:y?'You shot first time, so the keeper had no time to get ready.':'A first-time finish gave the keeper no time to set.'});
      if(n.keeperX!==undefined&&Math.sign(n.target.x)!==Math.sign(n.keeperX)&&Math.abs(n.keeperX)>.2)out.push({w:6,t:y?'You shot to the side away from the keeper.':'You placed it away from where the keeper was standing.'});
    }
  });
  // Combinations: name the pattern the child just played (give-and-go, set back, third friend, switch).
  for(let i=0;i+1<notes.length;i++){
    const p=notes[i],q=notes[i+1];if(p.kind==='shot'||q.kind==='shot'||p.receiver===undefined||q.receiver===undefined||q.kicker!==p.receiver)continue;
    const A=p.kicker,B=p.receiver,C=q.receiver;
    if(C===A){out.push({w:10,t:y?`Give-and-go! You passed to ${a(B)}, ran, and got it back.`:`A one-two: ${a(B)} played the wall and returned it into ${a(A)}'s run.`});continue;}
    // The third friend: C was shut off from A (the scan's red lane), or arrived on a run (called, or into space).
    const shut=!!p.shut?.includes(C),third=shut||p.calls.includes(C)||q.calls.includes(C)||q.kind==='pass-space',back=p.target.z>p.from.z+3&&q.target.z<=q.from.z+1;  // up to B, then square or back to C
    if(back)out.push({w:10.5,t:y?`${a(B)} passed it back to ${a(C)}, who could see the goal.`:`${a(B)} set it for ${a(C)}, who faced forward and could see the whole pitch.`});
    if(third)out.push({w:back?9:11,t:shut?(y?`${a(C)} was blocked from you, so ${a(B)} passed it on. That is the third friend!`:`Third-man move: the lane to ${a(C)} was shut, so ${a(B)} linked it and ${a(C)} arrived free.`)
      :(y?`${a(B)} passed it on to ${a(C)}, the third friend, already running.`:`Third-man move: ${a(B)} linked it and ${a(C)} arrived on the run, free.`)});
  }
  notes.forEach(n=>{if(n.kind!=='shot'&&Math.abs(n.target.x-n.from.x)>=15)out.push({w:10,t:y?`You sent it to the side with more space.`:`You switched play from the crowded side to the free side.`});});
  if(notes.length>=3)out.push({w:4,t:y?`${notes.length-1} passes moved the defenders, then you found the gap.`:`${notes.length-1} passes pulled the defence around before the finish.`});
  const seen=new Set<string>();return out.sort((p,q)=>q.w-p.w).filter(o=>!seen.has(o.t)&&!!seen.add(o.t)).slice(0,max).map(o=>o.t);
}

/** "Why it didn't work" plus what to try: names the player who stopped it. */
export function explainFail(reason:string|undefined,stop:PuzzleEvent|undefined,note:PassNote|undefined,nums:Numbers,f:Format):{why:string;fix:string}|null{
  const y=young(f),d=(i:number|undefined)=>i===undefined?'A defender':`#${nums.defenders[i]}`;
  switch(reason){
    case 'intercept':{const who=stop?.defender;const inLane=note?.inLine!==undefined&&note.inLine===who;
      return{why:inLane?(y?`${d(who)} was standing in the way of your pass.`:`${d(who)} was in the passing lane.`):(y?`${d(who)} ran across and got there first.`:`${d(who)} read it and stepped across the line of the pass.`),
        fix:note&&note.kind!=='shot'&&note.loft<.3?(y?'Pass to the other side of them, or hold the tip to lift it over.':'Change the angle away from them, lift it over, or bend it round.'):(y?'Watch for red arrows while you draw. Try another friend.':'Watch the red arrows while drawing: they show who can reach the ball.')};}
    case 'save':if(note&&note.kind!=='shot')return{why:y?'The keeper ran out and grabbed your pass.':'The keeper came off the line and claimed the pass.',fix:y?'Pass wider of the keeper, or softer so your friend gets there first.':'Play it wider of the keeper, or weight it so your teammate arrives first.'};
      return{why:y?'The keeper got to it.':'The keeper reached it.',fix:y?'Shoot to the side away from the keeper, or pass to a friend first.':'Aim for the side the keeper is not covering, or move the ball to change the angle.'};
    case 'out':return{why:y?'The ball ran out of play.':'Too much on it: the ball ran out.',fix:y?'Draw a shorter line for a softer pass.':'A shorter stroke means less power.'};
    case 'rest':return{why:y?'The ball stopped before anyone got it.':'Under-hit: it died before a teammate arrived.',fix:y?'Draw a longer line for a harder pass.':'Lengthen the stroke for more pace.'};
    case 'offside':return{why:y?'Your friend was past the last defender when you passed.':'The receiver was beyond the second-last defender at the pass.',fix:y?'Pass sooner, or drag your friend back first.':'Release earlier, or drop the runner back onside first.'};
    case 'too-few-passes':return{why:y?'This puzzle needs more passes first.':'Right finish, but not enough passes for this puzzle.',fix:y?'Pass to a friend before you shoot.':'Build the move first: the brief says how many passes.'};
    case 'timeout':return{why:y?'Too slow! The defence got back.':'The defence recovered before the finish.',fix:y?'Pass forward quickly.':'Fewer, forward passes: go before they get back.'};
    default:return null;
  }
}

/** The replay commentary: one short call per event (null = no new line). */
export function replayCall(e:PuzzleEvent,nums:Numbers,receiverOf:(kickIndex:number)=>number|undefined,kickIndex:number,calls:number[]):string|null{
  const a=(i:number|undefined)=>i===undefined?'':`#${nums.attackers[i]}`,d=(i:number|undefined)=>i===undefined?'A defender':`#${nums.defenders[i]}`;
  switch(e.type){
    case 'kick':{const r=receiverOf(kickIndex),run=calls.length?`${calls.map(c=>a(c)).join(' and ')} run${calls.length===1?'s':''}… `:'';
      if(e.kind==='shot')return `${run}${a(e.attacker)} shoots!`;if(e.kind==='header')return `${run}${a(e.attacker)} heads it${r!==undefined&&r!==e.attacker?` to ${a(r)}`:''}`;
      return `${run}${a(e.attacker)} passes${r!==undefined&&r!==e.attacker?` to ${a(r)}`:''}`;}
    case 'receive':return e.touch==='chest'?`${a(e.attacker)} chests it down`:e.touch==='thigh'?`${a(e.attacker)} cushions it`:e.touch==='header'?`${a(e.attacker)} heads it`:`${a(e.attacker)} controls it`;
    case 'heavy_touch':return `Heavy touch by ${a(e.attacker)}`;
    case 'intercept':return `${d(e.defender)} cuts it out!`;
    case 'deflect':return `${d(e.defender)} blocks it`;
    case 'save':return 'The keeper saves!';
    case 'parry':return 'The keeper pushes it away';
    case 'goal':return `GOAL! ${a(e.attacker)} scores`;
    case 'offside':return `Flag up: ${a(e.attacker)} was offside`;
    case 'out':return 'Out of play';
    default:return null;
  }
}
