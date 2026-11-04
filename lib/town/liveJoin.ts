// Join a live game (slice 1, Nov 4 2026; docs/join-live-game-design.md). Pure logic, no three.js, safe in tests:
// which formats can be joined, the walk-on countdown state machine, team and slot assignment for N humans, and the
// replaced NPC's walk to the touchline. Teaching purpose: a kid steps onto a real 7v7 match and plays a position
// (Law 3: a substitution, the player he replaces sits out and cheers; bibs tell the teams apart at a glance).
import type {LiveFormat} from './venues';
import type {HumanTeam} from './match/humanInputs';

/** Per-format switch. Slice 1 opens the 7v7 only; the others are ready to switch on (doc §1 speeds: 9v9 runs at
 *  4.9 m/s and 11v11 at 7.1 m/s against a 3.7 m/s walk, so they need a feel check and maybe the human speed cap). */
export const LIVE_JOIN_FORMATS:Record<LiveFormat,{enabled:boolean;maxHumansPerTeam:number;humanSpeedCap:number|null}>={
  '7v7':{enabled:true,maxHumansPerTeam:6,humanSpeedCap:null},
  'futsal':{enabled:false,maxHumansPerTeam:4,humanSpeedCap:null},
  '9v9':{enabled:false,maxHumansPerTeam:8,humanSpeedCap:null},
  '11v11':{enabled:false,maxHumansPerTeam:10,humanSpeedCap:.7},
  'beach':{enabled:false,maxHumansPerTeam:4,humanSpeedCap:null},
};
export const joinableFormat=(format:LiveFormat)=>LIVE_JOIN_FORMATS[format].enabled;

export const JOIN_COUNTDOWN=2;
/** World metres outside the touchline that already count as "at the edge" (the card is not shown yet; the ring arms). */
export const JOIN_EDGE_BAND=1.5;

// ---------------------------------------------------------------- countdown state machine
export type JoinPhase='idle'|'countdown'|'joined';
export type JoinState={phase:JoinPhase;t:number;/** After a leave or a cancel the kid must step off the pitch before a new countdown. */needExit:boolean};
export type JoinSignals={inField:boolean;eligible:boolean;skip:boolean;leave:boolean};
export type JoinEvent='start'|'cancel'|'join'|'leave'|null;
export const createJoinState=():JoinState=>({phase:'idle',t:0,needExit:false});
/** Advance the walk-on machine one frame. Joined is left ONLY by `leave` (walking to the touchline chasing the ball is
 *  not leaving); a countdown is cancelled by stepping back off the pitch or losing eligibility (a ride, a lesson…). */
export function stepJoin(s:JoinState,sig:JoinSignals,dt:number):JoinEvent{
  if(s.phase==='joined'){if(sig.leave){s.phase='idle';s.t=0;s.needExit=true;return 'leave';}return null;}
  if(!sig.inField)s.needExit=false;
  if(s.phase==='countdown'){
    if(!sig.inField||!sig.eligible){s.phase='idle';s.t=0;s.needExit=sig.inField;return 'cancel';}
    s.t+=dt;
    if(sig.skip||s.t>=JOIN_COUNTDOWN){s.phase='joined';s.t=JOIN_COUNTDOWN;return 'join';}
    return null;
  }
  if(sig.inField&&sig.eligible&&!s.needExit){s.phase='countdown';s.t=0;return 'start';}
  return null;
}
export const joinProgress=(s:JoinState)=>s.phase==='joined'?1:s.phase==='countdown'?Math.min(1,s.t/JOIN_COUNTDOWN):0;

// ---------------------------------------------------------------- team + slot
/** Gold attacks sim y 8 (its own goal is at y 392), blue the other way (MatchSim atkGoalY/ownGoalY). */
export const ownGoalY=(team:HumanTeam)=>team==='gold'?392:8;
/** The team a new human joins: the one with FEWER humans; on a tie the team whose own goal is nearest the point
 *  where he stepped on (he joins the side he walked into). `prefer` (party / friends, multiplayer slice) wins whenever
 *  it does not make the teams more uneven. null when both teams are full. */
export function pickJoinTeam(counts:{gold:number;blue:number},entryY:number,maxPerTeam:number,prefer?:HumanTeam|null):HumanTeam|null{
  const open=(t:HumanTeam)=>counts[t]<maxPerTeam;
  if(!open('gold')&&!open('blue'))return null;
  if(!open('gold'))return 'blue';if(!open('blue'))return 'gold';
  if(prefer&&counts[prefer]<=counts[prefer==='gold'?'blue':'gold'])return prefer;
  if(counts.gold!==counts.blue)return counts.gold<counts.blue?'gold':'blue';
  return Math.abs(entryY-ownGoalY('gold'))<=Math.abs(entryY-ownGoalY('blue'))?'gold':'blue';
}
export type SlotCandidate={id:string;team:HumanTeam;isGK:boolean;x:number;y:number};
/** The NPC a joining human replaces: the nearest OUTFIELD player of `team` to the entry point who is not already a
 *  human (`taken`). The ball carrier and the restart taker are avoided unless nobody else is left. */
export function pickSlot(players:Iterable<SlotCandidate>,team:HumanTeam,entryX:number,entryY:number,taken:ReadonlySet<string>,avoid?:ReadonlySet<string>):string|null{
  let best:string|null=null,bd=Infinity;
  for(const p of players){
    if(p.team!==team||p.isGK||taken.has(p.id))continue;
    const d=Math.hypot(p.x-entryX,p.y-entryY)+(avoid?.has(p.id)?1000:0);
    if(d<bd){bd=d;best=p.id;}
  }
  return best;
}

// ---------------------------------------------------------------- the replaced NPC (sits out, cheers)
/** Sim units outside the touchline where a sitting-out player stands (≈ 1.4 m on the 7v7). */
export const BENCH_MARGIN=10;
/** Spot on the nearest long touchline for a player leaving from sim (x, y); `index` spaces several sitting-out players. */
export function touchlineSpot(x:number,y:number,index:number,out:{x:number;y:number}){
  const side=x>=135?1:-1;out.x=135+side*(125+BENCH_MARGIN);
  out.y=Math.max(60,Math.min(340,y+index*14*(y>200?-1:1)));return out;
}
export type BenchPhase='off'|'cheer';
export type BenchWalker={id:string;phase:BenchPhase;x:number;y:number;tx:number;ty:number;age:number};
/** Sim units per second the sitting-out player walks at (≈ a jog). */
export const BENCH_SPEED=34;
/** Walk toward the touchline spot; on arrival he turns to the pitch and cheers. Returns true when the phase changes. */
export function stepBench(w:BenchWalker,dt:number):boolean{
  w.age+=dt;
  if(w.phase!=='off')return false;
  const dx=w.tx-w.x,dy=w.ty-w.y,d=Math.hypot(dx,dy),step=BENCH_SPEED*dt;
  if(d<=step||d<.5){w.x=w.tx;w.y=w.ty;w.phase='cheer';w.age=0;return true;}
  w.x+=dx/d*step;w.y+=dy/d*step;return false;
}
/** Cheer rhythm while sitting out: a 4 s cheer every 7 s (and the clock restarts on a goal), so he is not bouncing
 *  non-stop. Returns the cheer age (0..4) or -1 between cheers. */
export const CHEER_SECONDS=4;
export const cheerAge=(age:number)=>{const c=age%7;return c<CHEER_SECONDS?c:-1;};
