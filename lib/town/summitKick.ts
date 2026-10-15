/**
 * Sunset kick challenge on the Summit 5s (Oct 12 2026; user: "Sunset kick challenge: an empty 5v5 pitch with target hoops in
 * the goal. Hit 5 targets to earn coins, with a best score on its own leaderboard using the new arcade boards").
 * Pure rules, no three.js and no DOM, so tests/summit-kick.cjs drives them directly; the 3D side is lib/graphics/summitActivities.ts.
 *
 * Teaching: picking a corner. Keepers stand in the middle, so the hardest shots to save go low or high into the corners; the
 * hoops sit in the four corners and under the bar, and a hoop only counts from behind the chalk line (a real shooting distance).
 *
 * Layout is never hard-coded: the pitch, goal and ground height are read from summitIsle.ts at call time (SUMMIT_PITCH,
 * SUMMIT_FENCE, SUMMIT_LANDMARKS, summitGround, onSummitIsle), so the hoops follow the island's final shape.
 */
import {SUMMIT_PITCH,SUMMIT_FENCE,SUMMIT_LANDMARKS,SUMMIT_OBSTACLES,summitGround,onSummitIsle} from './summitIsle';
import {SUMMIT_KICK_COINS} from '../economy';

export type KickVec={x:number;y:number;z:number};
/** A hoop: centre, radius, and the unit normal pointing back toward the kicker (a ball passing against it is a hit). */
export type KickHoop={id:string;label:string;x:number;y:number;z:number;r:number;nx:number;nz:number};
export type KickLayout={
 /** The goal line the hoops stand in (x), which end (-1 west, +1 east) and the ground height on the pitch. */
 goalX:number;side:-1|1;ground:number;
 hoops:KickHoop[];
 /** Where a round starts (the penalty-ish spot, facing the goal) and the start post by the gate. */
 spot:{x:number;z:number;yaw:number};post:{x:number;z:number};
 /** The chalk line: shots count from this x or further from the goal. */
 lineX:number;
 /** The pitch rectangle (the round ends if the player walks out of the fenced area). */
 pitch:{x0:number;x1:number;z0:number;z1:number};
};

/** Round rules: 8 balls, 90 s at most, shots count from 8 m or further. */
export const KICK_RULES={kicks:8,seconds:90,minDistance:7,spotDistance:12,hoopRadius:.45,ballRadius:.19,
 /** After the last kick (or the last hoop), the round waits this long for the ball to finish its flight. */
 settle:2.2} as const;
/** Hoop centres in the goal mouth: across (+ = the goal's right as the kicker sees it) and up from the ground (m). */
export const HOOP_SLOTS=[
 {id:'low-left',label:'Low left corner',across:-1.28,up:.52},
 {id:'low-right',label:'Low right corner',across:1.28,up:.52},
 {id:'top-left',label:'Top left corner',across:-1.28,up:1.3},
 {id:'top-right',label:'Top right corner',across:1.28,up:1.3},
 {id:'top-middle',label:'Under the bar',across:0,up:1.36},
] as const;
export const HOOP_COUNT=HOOP_SLOTS.length;

/** The sunset end: the west goal (the island's sun sets in the west, behind it). */
export const KICK_GOAL_SIDE:-1|1=-1;

/** First walkable spot on a small ring round (x, z) (or (x, z) itself), clear of the pitch's fence and goals. */
export function walkableNear(x:number,z:number,ok:(x:number,z:number)=>boolean=(a,b)=>onSummitIsle(a,b)){
 const clear=(a:number,b:number)=>ok(a,b)&&!SUMMIT_OBSTACLES.some(o=>Math.abs(a-o.x)<o.w/2+.55&&Math.abs(b-o.z)<o.d/2+.55);
 if(clear(x,z))return {x,z};
 for(const r of [1,2,3,4.5])for(let k=0;k<16;k++){const a=k/16*Math.PI*2,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;if(clear(px,pz))return {x:px,z:pz};}
 return {x,z};
}

/** The challenge's layout on the pitch as it is now (call at build/start time; cheap: a few ground queries). */
export function kickLayout():KickLayout{
 const P=SUMMIT_PITCH,F=SUMMIT_FENCE,side=KICK_GOAL_SIDE,goalX=P.x+side*P.length/2,ground=summitGround(P.x,P.z);
 // The hoops stand a hand's width in front of the goal line, facing the pitch (normal toward the kicker: -side).
 const hx=goalX-side*.3,nx=-side,nz=0;
 // "Right" as the kicker sees it: facing -x (west), right is -z; facing +x, right is +z.
 const right=side<0?-1:1;
 const hoops=HOOP_SLOTS.map(s=>({id:s.id,label:s.label,x:hx,y:ground+s.up,z:P.z+right*s.across,r:KICK_RULES.hoopRadius,nx,nz}));
 const spotX=goalX-side*KICK_RULES.spotDistance,yaw=Math.atan2(side,0);
 // East of the gate, clear of the trail's end (Oct 13 2026: 2.4 m west of it, the post and its crate blocked the walkway into the gate).
 const gate=SUMMIT_LANDMARKS.gate,post=walkableNear(gate.x+3,gate.z);
 return {goalX,side,ground,hoops,spot:{x:spotX,z:P.z,yaw},post,lineX:goalX-side*KICK_RULES.minDistance,
  pitch:{x0:P.x-F.halfX,x1:P.x+F.halfX,z0:P.z-F.halfZ,z1:P.z+F.halfZ}};
}

/**
 * Segment vs ring: did the ball's centre go from `a` to `b` through the hoop's disc, travelling against its normal (from the
 * kicker's side into the goal)? The hoop is a vertical ring whose plane passes through its centre; the crossing point must lie
 * within `r` of the centre. A ball moving along the plane (no crossing) or the wrong way never counts.
 */
export function throughHoop(a:KickVec,b:KickVec,h:KickHoop):boolean{
 const da=(a.x-h.x)*h.nx+(a.z-h.z)*h.nz,db=(b.x-h.x)*h.nx+(b.z-h.z)*h.nz;
 if(!(da>0&&db<=0))return false;
 const t=da/(da-db),x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t,z=a.z+(b.z-a.z)*t;
 return Math.hypot(x-h.x,y-h.y,z-h.z)<=h.r;
}

/** Shots count from behind the chalk line (at least KICK_RULES.minDistance from the goal line). */
export const behindLine=(layout:Pick<KickLayout,'goalX'|'side'>,x:number)=>(layout.goalX-x)*layout.side>=KICK_RULES.minDistance-.05;
export const onKickPitch=(layout:Pick<KickLayout,'pitch'>,x:number,z:number)=>x>=layout.pitch.x0-.5&&x<=layout.pitch.x1+.5&&z>=layout.pitch.z0-.5&&z<=layout.pitch.z1+.5;

/**
 * Score: 100 a hoop, plus an accuracy bonus (hoops per counted kick, up to 100) and, for all five, a speed bonus (3 a second
 * under 60 s, up to 180). The most a round can score is 780. Nothing for a round with no hoops.
 */
export const KICK_POINTS={hoop:100,accuracy:100,speedPerSecond:3,speedFrom:60} as const;
export const KICK_MAX_SCORE=HOOP_COUNT*KICK_POINTS.hoop+KICK_POINTS.accuracy+KICK_POINTS.speedPerSecond*KICK_POINTS.speedFrom;
export function kickScore({hits,kicks,seconds}:{hits:number;kicks:number;seconds:number}){
 const n=(v:number)=>Number.isFinite(v)?Math.max(0,Math.floor(v)):0,h=Math.min(HOOP_COUNT,n(hits)),k=Math.max(h,n(kicks));
 if(!h)return {total:0,hoops:0,accuracy:0,speed:0};
 const hoops=h*KICK_POINTS.hoop,accuracy=Math.round(KICK_POINTS.accuracy*h/Math.max(1,k));
 const s=Number.isFinite(seconds)?Math.max(0,seconds):Infinity;
 const speed=h===HOOP_COUNT?Math.max(0,Math.min(KICK_POINTS.speedPerSecond*KICK_POINTS.speedFrom,Math.round(KICK_POINTS.speedPerSecond*(KICK_POINTS.speedFrom-s)))):0;
 return {total:hoops+accuracy+speed,hoops,accuracy,speed};
}

/**
 * Coins: 1 a hoop and 3 more for all five (at most 8 a round; lib/economy.ts), paid as a metered island run (`summit-kick:` ids count toward
 * the daily Training meter, lib/town/dailyMeter.ts, and the island run cap). The first 5/5 ever also pays a one-off learning
 * reward (learn:explore:summit-kick-perfect).
 */
// Oct 14 2026 (docs/economy.md): 2 + 4 (max 14) → 1 + 3 (max 8), read from lib/economy.ts SUMMIT_KICK_COINS.
export const KICK_COINS=SUMMIT_KICK_COINS;
export const KICK_RUN_PREFIX='summit-kick:';
export const KICK_PERFECT_REWARD='summit-kick-perfect';
export const kickCoins=(hits:number)=>{const h=Math.min(HOOP_COUNT,Math.max(0,Math.floor(Number.isFinite(hits)?hits:0)));return h*KICK_COINS.perHoop+(h===HOOP_COUNT?KICK_COINS.perfect:0);};

export type KickPhase='playing'|'done';
export type KickEnd='perfect'|'kicks'|'time'|'left'|'quit';
/**
 * One round. `kick` when a shot leaves the foot (counted only from behind the line), `ball` with each ball step (hoop hits),
 * `step` with the time; `end` says why it finished. Pure: the caller owns time and the ball.
 */
export function createKickRound(layout:KickLayout,startedAt:number){
 const popped=new Set<string>();
 const s={phase:'playing' as KickPhase,kicks:0,hits:0,elapsed:0,end:null as KickEnd|null,lastKickAt:-1,settleAt:-1,
  /** The current shot counts (taken from behind the line during the round). */
  live:false};
 const finish=(why:KickEnd)=>{if(s.phase==='done')return;s.phase='done';s.end=why;};
 return {
  state:s,popped,startedAt,
  get hoopsLeft(){return HOOP_COUNT-popped.size;},
  /** A new shot. Returns 'counted', 'close' (too near: the shot doesn't count) or 'none' (no balls left / round over). */
  kick(x:number):'counted'|'close'|'none'{
   if(s.phase!=='playing'||s.kicks>=KICK_RULES.kicks){s.live=false;return 'none';}
   if(!behindLine(layout,x)){s.live=false;return 'close';}
   s.kicks++;s.live=true;s.lastKickAt=s.elapsed;if(s.kicks>=KICK_RULES.kicks)s.settleAt=s.elapsed+KICK_RULES.settle;return 'counted';
  },
  /** The ball moved from a to b: the hoop it went through (popped now), or null. */
  ball(a:KickVec,b:KickVec):KickHoop|null{
   if(s.phase!=='playing'||!s.live)return null;
   for(const h of layout.hoops){if(popped.has(h.id)||!throughHoop(a,b,h))continue;popped.add(h.id);s.hits++;
    if(popped.size===HOOP_COUNT)finish('perfect');return h;}
   return null;
  },
  /** The shot is over (the ball came back): later hoops need a new kick. */
  shotOver(){s.live=false;if(s.kicks>=KICK_RULES.kicks&&s.phase==='playing')finish('kicks');},
  step(dt:number){if(s.phase!=='playing')return;s.elapsed+=Math.max(0,dt);
   if(s.elapsed>=KICK_RULES.seconds)finish('time');else if(s.settleAt>=0&&s.elapsed>=s.settleAt)finish('kicks');},
  leave(){finish('left');},quit(){finish('quit');},
  get score(){return kickScore({hits:s.hits,kicks:s.kicks,seconds:s.elapsed});},
  get timeLeft(){return Math.max(0,KICK_RULES.seconds-s.elapsed);},
 };
}
export type KickRound=ReturnType<typeof createKickRound>;

/** The device's own record (synced with the save code: SYNC_KEYS). */
export const KICK_SAVE_KEY='fi2-summit-kick-v1';
export type KickSave={version:1;best:number;rounds:number;perfect:number;bestHits:number};
export const emptyKickSave=():KickSave=>({version:1,best:0,rounds:0,perfect:0,bestHits:0});
const whole=(v:unknown,max:number)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.min(max,Math.floor(v))):0;
export function sanitizeKickSave(v:unknown):KickSave{
 if(!v||typeof v!=='object')return emptyKickSave();const o=v as Partial<KickSave>;
 return {version:1,best:whole(o.best,KICK_MAX_SCORE),rounds:whole(o.rounds,1e6),perfect:whole(o.perfect,1e6),bestHits:whole(o.bestHits,HOOP_COUNT)};
}
/** Adds a finished round (only rounds that ended by play, not by quitting, are recorded). */
export function recordKickRound(save:KickSave,r:{hits:number;score:number}):{save:KickSave;newBest:boolean}{
 const score=whole(r.score,KICK_MAX_SCORE),hits=whole(r.hits,HOOP_COUNT);
 const next={...save,rounds:save.rounds+1,perfect:save.perfect+(hits===HOOP_COUNT?1:0),best:Math.max(save.best,score),bestHits:Math.max(save.bestHits,hits)};
 return {save:next,newBest:score>save.best};
}
/** What the round's end card says (kids' words). */
export function kickEndLine(end:KickEnd|null,hits:number){
 if(end==='perfect')return 'Five out of five! Every corner, like a pro.';
 if(end==='time')return `Time’s up! ${hits} of ${HOOP_COUNT} hoops.`;
 if(end==='left')return 'You left the pitch, so the round stopped.';
 return hits>=3?`${hits} hoops! Pick a corner and keep it low or high.`:hits>0?`${hits} hoop${hits===1?'':'s'}. Aim for the corners: keepers stand in the middle.`:'No hoops this time. Tap Kick for the low ones, hold Kick a moment for the high ones.';
}
