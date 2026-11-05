// Passing assist for a human in a live match (join a live game, slice 1, Nov 4 2026; docs/join-live-game-design.md).
// Pure, allocation-free helpers the sim calls only while a human is on the ball (or presses an action), so a match
// with no human pays nothing. Kids 7-12 aim roughly: the stick picks a DIRECTION, the assist picks the open
// teammate in that cone, leads a runner into space and weights the pass so it arrives (not weak, not overhit).
// Teaching captions name the idea: "Look for the open player", "Pass into space".
// Units are sim field units (270 x 400, goal lines at y 8 / 392), velocities in units per sim second.

/** Every tunable number of the assist in one place. */
export const PASS_ASSIST={
  /** Cone half-angle (cosine) round the aim: teammates outside it are never picked when the stick points somewhere. */
  coneCos:.3,// was .42 (≈65°): ≈72° half-angle, rough aim still finds the player (kids, owner Nov 4 2026)
  /** Pass range (units). */
  minDist:8,maxDist:170,
  /** A defender closer than this to the passing lane blocks it (units); blocked lanes score far lower. */
  laneBlock:6,
  /** Score weights: aim alignment dominates, openness and progress break ties, distance costs a little. */
  wAlign:70,wOpen:1.1,wForward:.12,wDist:.05,wBlocked:55,wRunner:18,
  /** Openness is capped (units of space round the receiver) so one very open player far away does not always win. */
  openCap:30,
  /** Hysteresis: a new target must beat the shown one by this many score points to take the marker over… */
  switchMargin:12,
  /** …and the shown target is kept at least this long (s) unless it leaves the cone or becomes invalid. */
  minHold:.35,
  /** Lead: never lead a runner more than this (units) ahead of where he is. */
  maxLead:46,
  /** Ball physics as the sim runs it: exponential roll decay (MatchSim P.friction). */
  friction:2.2,
  /** Pace the ball should still have when it reaches the receiver (units/s): a controllable, firm pass. */
  arriveSpeed:118,
  /** Pass pace bounds (units/s). */
  minSpeed:190,maxSpeed:420,
  /** Forward pass (through ball): how far into space ahead of a forward-moving runner (units) and the onside margin. */
  throughSpace:22,onsideMargin:2,
  /** Shot aim assist: the most it bends your aim (units of goal-mouth x) and the goal half-width it aims inside. */
  shotMaxNudge:12,shotPostInset:.82,
  /** Tackle assist: extra reach (units) on the human's tackle, and the jockey's goal-side gap (units). */
  tackleReach:3.4,jockeyGap:7,
} as const;

export type AssistPlayer={id:string;team:string;isGK:boolean;x:number;y:number;vx:number;vy:number};
export type PassMode='short'|'forward';

/** Distance from point (px,py) to the segment a→b. */
export function segmentDistance(px:number,py:number,ax:number,ay:number,bx:number,by:number){
  const dx=bx-ax,dy=by-ay,l2=dx*dx+dy*dy;let t=l2>0?((px-ax)*dx+(py-ay)*dy)/l2:0;t=t<0?0:t>1?1:t;
  return Math.hypot(px-ax-dx*t,py-ay-dy*t);
}

/** Time (s) for a ball struck at `speed` to roll `distance` with exponential decay `k`; Infinity when it stops short. */
export function rollTime(distance:number,speed:number,k:number=PASS_ASSIST.friction){
  const f=1-k*distance/Math.max(1,speed);return f<=0?Infinity:-Math.log(f)/k;
}
/** Pace so the ball still has `arrive` units/s after `distance` (v0 = d·k + arrive), clamped. */
export function passSpeedFor(distance:number,arrive:number=PASS_ASSIST.arriveSpeed){
  const v=distance*PASS_ASSIST.friction+arrive;return v<PASS_ASSIST.minSpeed?PASS_ASSIST.minSpeed:v>PASS_ASSIST.maxSpeed?PASS_ASSIST.maxSpeed:v;
}

/** Where to play the ball for a receiver who is moving: the point he reaches when the ball does (two fixed-point
 *  iterations, capped at `maxLead`), plus `extraSpace` along his run for a through ball. Writes into `out`. */
export function leadPoint(fromX:number,fromY:number,r:{x:number;y:number;vx:number;vy:number},out:{x:number;y:number},extraSpace=0){
  let tx=r.x,ty=r.y;
  for(let i=0;i<2;i++){const d=Math.hypot(tx-fromX,ty-fromY),t=Math.min(1.6,rollTime(d,passSpeedFor(d)));tx=r.x+r.vx*t;ty=r.y+r.vy*t;}
  const sp=Math.hypot(r.vx,r.vy);
  if(extraSpace>0&&sp>8){tx+=r.vx/sp*extraSpace;ty+=r.vy/sp*extraSpace;}
  let lx=tx-r.x,ly=ty-r.y;const l=Math.hypot(lx,ly);
  if(l>PASS_ASSIST.maxLead){lx*=PASS_ASSIST.maxLead/l;ly*=PASS_ASSIST.maxLead/l;}
  out.x=Math.max(14,Math.min(256,r.x+lx));out.y=Math.max(12,Math.min(388,r.y+ly));return out;
}

export type PassContext={
  from:AssistPlayer;
  /** Aim (any length; 0,0 = no stick). */
  aimX:number;aimY:number;
  /** +1 when the passer's team attacks toward larger y, -1 toward smaller y. */
  dirY:number;
  ids:readonly string[];players:Readonly<Record<string,AssistPlayer>>;
  mode:PassMode;
  /** Offside line as a sim y the receiver must not be beyond (dirY-relative), or null when there is no offside here. */
  offsideY:number|null;
  /** Teammates making a forward run right now (off-ball runs), preferred for a forward pass. */
  runners?:ReadonlySet<string>;
  /** Override of PASS_ASSIST.coneCos (the sim's wide fallback cone for a sloppy stick, PASS_HELP.looseCone). */
  coneCos?:number;
};
const lead={x:0,y:0};
/** Score one candidate (higher is better), or -Infinity when he cannot be the target. Pure. */
export function scorePassTarget(c:PassContext,id:string):number{
  const f=c.from,t=c.players[id];
  if(!t||id===f.id||t.team!==f.team||t.isGK)return -Infinity;
  const forward=c.mode==='forward';
  if(forward)leadPoint(f.x,f.y,t,lead,PASS_ASSIST.throughSpace);else{lead.x=t.x;lead.y=t.y;}
  const dx=lead.x-f.x,dy=lead.y-f.y,d=Math.hypot(dx,dy)||1;
  if(d<PASS_ASSIST.minDist||d>PASS_ASSIST.maxDist)return -Infinity;
  // Offside (Law 11) is judged where the receiver IS when the ball is played: never pick one beyond the line. The
  // ball itself may be played into the space behind it: that is the whole point of a run in behind.
  if(c.offsideY!==null&&(t.y-c.offsideY)*c.dirY>PASS_ASSIST.onsideMargin)return -Infinity;
  const progress=(lead.y-f.y)*c.dirY;
  if(forward&&progress<10)return -Infinity; // a forward pass goes forward
  const al=Math.hypot(c.aimX,c.aimY);
  let align=0;
  if(al>.05){align=(dx*c.aimX+dy*c.aimY)/(d*al);if(align<(c.coneCos??PASS_ASSIST.coneCos))return -Infinity;}
  let open:number=PASS_ASSIST.openCap,lane=Infinity;
  for(const fid of c.ids){const o=c.players[fid];if(!o||o.team===f.team)continue;
    const od=Math.hypot(o.x-lead.x,o.y-lead.y);if(od<open)open=od;
    if(!o.isGK&&Math.hypot(o.x-f.x,o.y-f.y)>5){const ld=segmentDistance(o.x,o.y,f.x,f.y,lead.x,lead.y);if(ld<lane)lane=ld;}}
  let s=align*PASS_ASSIST.wAlign+open*PASS_ASSIST.wOpen+progress*PASS_ASSIST.wForward*(forward||al<=.05?2:1)-d*PASS_ASSIST.wDist;
  if(lane<PASS_ASSIST.laneBlock)s-=PASS_ASSIST.wBlocked*(1-lane/PASS_ASSIST.laneBlock*.5);
  if(forward&&c.runners?.has(id))s+=PASS_ASSIST.wRunner;
  return s;
}
/** Best target for the context: aimed → the best in the cone; no stick → the most open teammate ahead. `out.score` is
 *  the winner's score (for hysteresis). Returns null when nobody qualifies. */
export function pickPassTarget(c:PassContext,out?:{score:number}):string|null{
  let best:string|null=null,bs=-Infinity;
  for(const id of c.ids){const s=scorePassTarget(c,id);if(s>bs){bs=s;best=id;}}
  if(out)out.score=bs;return best;
}

/** Marker hysteresis: the shown target only changes when the new pick clearly beats it (or it has become invalid),
 *  and not within `minHold` seconds of the last change. Mutates and returns `state.id`. */
export type StickyTarget={id:string|null;age:number};
export function stickyTarget(state:StickyTarget,dt:number,pick:string|null,pickScore:number,currentScore:number){
  state.age+=dt;
  if(state.id===pick)return state.id;
  const invalid=!Number.isFinite(currentScore);
  if(invalid||state.id===null||(state.age>=PASS_ASSIST.minHold&&pickScore>currentScore+PASS_ASSIST.switchMargin)){state.id=pick;state.age=0;}
  return state.id;
}

/** Shot aim assist: start from where the kid aims across the goal mouth (`aimX`), bend it at most `shotMaxNudge`
 *  toward the corner farther from the keeper, and keep it inside the posts. Never decides the outcome. */
export function shotAim(aimX:number,keeperX:number,goalHalf:number,centre=135){
  const lim=goalHalf*PASS_ASSIST.shotPostInset,far=keeperX>=centre?centre-lim:centre+lim;
  const nudge=Math.max(-PASS_ASSIST.shotMaxNudge,Math.min(PASS_ASSIST.shotMaxNudge,far-aimX));
  return Math.max(centre-lim,Math.min(centre+lim,aimX+nudge*.5));
}
