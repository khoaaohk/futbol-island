import type {PinballState} from './soccerPinball';

/* Futbol Pinball round 3 (Oct 26 2026, docs/ARCADE_PINBALL_R3_OCT26.md): the living-table rules.
 *  - HOT ZONE ("find the space"): a lit circle appears on one of five open spots for a few seconds. Rolling the ball
 *    through it pays points and grows the hype. Teaches attacking the space instead of the defender.
 *  - RUSH (hard divisions): every new ball starts a short clock; a goal before it runs out pays a RUSH bonus
 *    (the counter-attack lesson: score before the defence is set).
 *  - SECOND KEEPER (Champions Night): a sweeper-keeper patrols the edge of the box, a step in front of the goal.
 *  - HYPE 0..1: rises with combos, hot zones, multiball and goals and drains slowly. The renderer uses it for the
 *    chasing rail lights and the table glow (the table "wakes up").
 * Everything is plain numbers on the state: no allocation, called from the 480 Hz tick. */

export const HOT_SPOTS=[{x:96,y:250},{x:180,y:292},{x:264,y:250},{x:128,y:176},{x:232,y:176}] as const;
export const HOT_R=20, HOT_POINTS=250;
export const SWEEPER_Y=124, SWEEPER_MIN=122, SWEEPER_MAX=238;
export type PinballHot={i:number;time:number;wait:number;n:number};
export const createPinballHot=():PinballHot=>({i:1,time:0,wait:6,n:0});
/** Seconds a hot zone stays lit (shorter at the top of the ladder). */
export const hotZoneTime=(level:number)=>level>=5?7:level>=3?9:11;
/** Hard divisions: seconds of RUSH clock per new ball. */
export const rushTime=(level:number)=>level>=6?20:level===5?25:0;
export const RUSH_BONUS=800;

export function stepPinballMissions(s:PinballState,dt:number){
 s.hype=Math.max(0,s.hype-dt*(s.extraLive?.03:.08));
 if(s.phase!=='playing')return;
 s.rush=Math.max(0,s.rush-dt);
 const h=s.hot,b=s.ball;
 if(h.time>0){
  h.time=Math.max(0,h.time-dt);
  const spot=HOT_SPOTS[h.i];
  if(b.x<341&&Math.abs(b.x-spot.x)<HOT_R&&Math.abs(b.y-spot.y)<HOT_R&&(b.x-spot.x)**2+(b.y-spot.y)**2<HOT_R*HOT_R){
   const points=(HOT_POINTS+Math.min(4,h.n)*50)*(s.level>=5?2:1);
   s.score+=points;s.table.ballBonus+=Math.round(points*.5);h.n++;h.time=0;h.wait=3.5;
   s.hype=Math.min(1,s.hype+.35);s.sfx.hot++;s.cue='hotZone';s.cueTime=1.6;s.hitX=spot.x;s.hitY=spot.y;s.hitId++;s.flash=Math.max(s.flash,.6);
  }else if(h.time===0)h.wait=4;
 }else{
  h.wait-=dt;
  if(h.wait<=0){h.i=(h.i+2)%HOT_SPOTS.length;h.time=hotZoneTime(s.level);}
 }
}
/** The sweeper-keeper (Champions Night only): shadows the ball's x at a lazy pace. */
export function stepSweeper(s:PinballState,dt:number){
 if(s.level<6){s.keeper2=180;s.keeper2Velocity=0;return 0;}
 const b=s.ball,target=Math.max(SWEEPER_MIN,Math.min(SWEEPER_MAX,b.y<SWEEPER_Y+10?180+(b.x-180)*.3:b.x)),pace=78;
 const want=Math.max(-pace,Math.min(pace,(target-s.keeper2)*6));
 s.keeper2Velocity+=Math.max(-420*dt,Math.min(420*dt,want-s.keeper2Velocity));
 const before=s.keeper2;s.keeper2=Math.max(SWEEPER_MIN,Math.min(SWEEPER_MAX,s.keeper2+s.keeper2Velocity*dt));
 return s.keeper2-before;
}
/** Bumped by strikes; a combo adds more the longer it runs. */
export function hypeStrike(s:PinballState){if(s.combination>1)s.hype=Math.min(1,s.hype+.08*s.combination);}
