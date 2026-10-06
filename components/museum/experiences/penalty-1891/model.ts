/**
 * penalty-1891 · the shot model (pure, no DOM: tests/museum-exp-penalty-1891.cjs runs it in Node).
 *
 * Real measurements (IFAB Laws 1 and 14): the goal is 7.32 m wide and 2.44 m high, the penalty mark is 11 m from the goal line.
 * In 1891 the goalkeeper could come out up to 6 yards (5.5 m); since 1905 the keeper has had to stay on the line.
 *
 * Everything about the keeper's reach and the kicker's wobble is a SIMPLE TEACHING MODEL (labelled as such in the UI), not data:
 *  - the ball flies in a straight line at the chosen speed, so the keeper gets (distance ÷ speed) seconds;
 *  - the keeper's reach is an oval round his middle (1 m up) that grows with the time he has (react, then dive);
 *  - the keeper guesses: 47% dives to your left, 47% to your right, 6% stays (Bar-Eli et al. 2007: keepers dived 94% of the time);
 *  - your shot lands near where you aim, but not exactly: harder shots wobble more.
 * Coordinates on the goal plane: x across (0 = middle, negative = your left), y up from the grass, in metres.
 */
export const GOAL_W=7.32,GOAL_H=2.44,MARK=11,BALL_R=0.11,SIX_YARDS=5.5,KEEPER_H=1.88,HUB_Y=1.0;
export const POST_X=GOAL_W/2;
export type Era='1891'|'today';
export type Power='soft'|'firm'|'blast';
export type Dive='left'|'right'|'stay';
export const POWERS:Record<Power,{label:string;kmh:number;wobble:number}>={
 soft:{label:'Soft',kmh:60,wobble:.28},
 firm:{label:'Firm',kmh:80,wobble:.45},
 blast:{label:'Blast',kmh:100,wobble:.72},
};
export const DIVE_ODDS:Record<Dive,number>={left:.47,right:.47,stay:.06};
/** Seconds for the ball to travel 11 m at this power. */
export const flightTime=(p:Power)=>MARK/(POWERS[p].kmh/3.6);
/** How far out from the goal line the keeper stands (1891: up to 6 yards; today: on the line). */
export const keeperDepth=(era:Era)=>era==='1891'?SIX_YARDS:0;
/** Seconds before the ball reaches the keeper. */
export const keeperTime=(era:Era,p:Power)=>(MARK-keeperDepth(era))/(POWERS[p].kmh/3.6);
/** The keeper's reach oval (half-width a, half-height b, centred 1 m up) for the time he has. */
export function reach(t:number){const a=.95+4.1*Math.max(0,t-.15);return {a,b:a*.72};}
/** Where the ball's path crosses the keeper's plane, for a ball heading to goal point (x, y). */
export function atKeeper(era:Era,x:number,y:number){const f=(MARK-keeperDepth(era))/MARK;return {x:x*f,y:BALL_R+(y-BALL_R)*f};}
/** Goal-plane point of a keeper-plane point (the keeper's "shadow" as you see it from the ball). */
export function toGoal(era:Era,x:number,y:number){const f=MARK/(MARK-keeperDepth(era));return {x:x*f,y:BALL_R+(y-BALL_R)*f};}

export function canSave(era:Era,p:Power,dive:Dive,x:number,y:number){
 const k=atKeeper(era,x,y),{a,b}=reach(keeperTime(era,p)),dx=k.x/a,dy=(k.y-HUB_Y)/b;
 if(dive==='stay')return Math.hypot(k.x,k.y-HUB_Y)<=1.05;
 if(dx*dx+dy*dy>1)return false;
 // A diving keeper leaves the middle: his body goes with the dive.
 return dive==='left'?k.x<=-.15:k.x>=.15;
}
/** Inside the oval the keeper could get to (if he guessed the right way). */
export function inReach(era:Era,p:Power,x:number,y:number){const k=atKeeper(era,x,y),{a,b}=reach(keeperTime(era,p)),dx=k.x/a,dy=(k.y-HUB_Y)/b;return dx*dx+dy*dy<=1;}

export type Result='goal'|'saved'|'post'|'bar'|'wide'|'over';
export function onTargetResult(x:number,y:number):Result|null{
 const ax=Math.abs(x);
 if(ax>POST_X+BALL_R)return 'wide';
 if(y>GOAL_H+BALL_R)return 'over';
 if(ax>POST_X-BALL_R)return 'post';
 if(y>GOAL_H-BALL_R)return 'bar';
 return null;
}
export function shotResult(era:Era,p:Power,dive:Dive,x:number,y:number):Result{return onTargetResult(x,y)??(canSave(era,p,dive,x,y)?'saved':'goal');}

/** Fixed, seeded wobble samples (Box–Muller), so the live numbers don't flicker while you drag. */
const N=360;
export const WOBBLE:ReadonlyArray<readonly [number,number]>=(()=>{let s=1891;const r=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return (s+.5)/4294967296;};
 const out:[number,number][]=[];for(let i=0;i<N;i++){const u=r(),v=r(),m=Math.sqrt(-2*Math.log(u));out.push([m*Math.cos(2*Math.PI*v),m*Math.sin(2*Math.PI*v)]);}return out;})();
/** Where a shot aimed at (x, y) lands, for one wobble sample. The ball can't go below the grass. */
export function landing(aimX:number,aimY:number,p:Power,w:readonly [number,number]){const s=POWERS[p].wobble;return {x:aimX+w[0]*s,y:Math.max(BALL_R,aimY+w[1]*s*.8)};}

/** Live numbers for the aim: how often it's on target, how often the keeper could reach it, and the goal chance. */
export function odds(era:Era,p:Power,aimX:number,aimY:number){
 let on=0,reachable=0,goal=0;
 for(const w of WOBBLE){const l=landing(aimX,aimY,p,w);if(onTargetResult(l.x,l.y))continue;on++;
  if(inReach(era,p,l.x,l.y))reachable++;
  let save=0;for(const d of ['left','right','stay'] as Dive[])if(canSave(era,p,d,l.x,l.y))save+=DIVE_ODDS[d];goal+=1-save;}
 return {onTarget:on/N,reach:on?reachable/on:0,goal:goal/N};
}
export function pickDive(r:number):Dive{return r<DIVE_ODDS.left?'left':r<DIVE_ODDS.left+DIVE_ODDS.right?'right':'stay';}

export type Zone='outside'|'top-corner'|'low-corner'|'middle'|'near';
export function zoneOf(x:number,y:number):Zone{const ax=Math.abs(x);
 if(ax>POST_X||y>GOAL_H)return 'outside';
 if(ax>2.3&&y>1.55)return 'top-corner';
 if(ax>2.3&&y<.95)return 'low-corner';
 if(ax<1.1)return 'middle';
 return 'near';}
/** The angle of the goal mouth seen from the mark: 2·atan(3.66 / 11) ≈ 36.8°. */
export const GOAL_ANGLE_DEG=2*Math.atan(POST_X/MARK)*180/Math.PI;
