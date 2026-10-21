/**
 * Bug squad catching rules (catching lane, Oct 20 2026; docs/island-jobs.md §15 "Catching"). User: "it needs to be more like animal
 * crossing and the bugs are flying around smoothly. the net needs to have a swing, the net animation and catching animation ...
 * make the radius for catching the bug bigger". Pure: no three.js, no React. The runtime (jobScene.ts) reads the island's bug swarm
 * (lib/graphics/bugSwarm.ts: query / startle / catch / pin / position) and applies these rules.
 *
 *  - A swing: wind-up, a sweeping arc (the swoosh trail), the catch window at the hit frame, then the recovery. Any bug inside the
 *    sweep volume at the hit frame is caught; else it is a miss and the nearest bug startles.
 *  - Generous on purpose (kids, phones): the sweep volume is about twice the first lane's reach, the swing auto-aims at the nearest
 *    bug in a wide cone in front, and a tap on the screen near a bug swings at it from further away.
 *  - Net down (the stalk, jobRules.STALK) widens the sweep a little more and keeps its calm-bugs bonus.
 *  - Rides (user: "allow to switch to scooter, bike riding, and moped with the net. not flying"): the Bug squad keeps those three;
 *    the jetpack waits until the shift ends. Leaving Summit Isle ends the shift.
 */
import {BUG_SPECIES,FIREFLY_SET,pickBugsOnMap,bugRotationSeed} from './bugSpecies';

/** The first lane's hold-still reach (jobCatalog radius 1.7 m around a bug's spot, i.e. ~1.2 m of real net reach). */
export const NET_BASE_REACH=1.2;
/** The sweep volume: a sphere this far round the sweep centre (about 2 × the first lane's reach). */
/* Oct 20 2026 (user playtest: "catch radius is smaller. need to increase it"): 2.4 → 3.5 m, vertical 2.6 → 4 m, auto-aim 5 → 8 m all
   round (nearest uncaught first), tap 6.5 → 10 m with a wider slop; a locked target holds still until the hit frame. */
/* Oct 21 2026 (user: "you can catch bugs just by swinging near it, decrease the radius, you have to be closer"): the sweep, auto-aim, tap and lunge reaches are pulled in (3.5 / 8 / 10 / 5.6 -> 2.2 / 4.2 / 5.5 / 3.4 m) */
export const NET_SWEEP_RADIUS=2.2;
/** The sweep centre: this far in front of the player, at this height (the hoop's path at the hit frame). */
export const NET_SWEEP_AHEAD=1.3;
export const NET_SWEEP_HEIGHT=1;
/** Bugs this much above / below the sweep centre still count (they hover and hop). */
export const NET_SWEEP_VERTICAL=2.6;
/** Net down (the stalk): the sweep reaches a little further. */
export const NET_STALK_REACH=1.15;
/** Auto-aim: the swing turns to the nearest bug within this range and this half-angle in front of the player. */
export const AUTO_AIM_RANGE=4.2;
export const AUTO_AIM_HALF_ANGLE=Math.PI;
/** Tap near a bug on the screen: it must be within this many metres of the player, and the tap within this share of the screen. */
export const TAP_RANGE=5.5;
/** A locked swing (auto-aim or tap) lunges: its sweep centre moves out toward the bug, up to this far in front. */
export const LUNGE_MAX=3.4;
export const TAP_SCREEN_SLOP=.24;
/** A locked target (auto-aim or tap) counts as caught if it is within this many sweep radii of the sweep centre at the hit frame. */
export const LOCKED_SLACK=1.35;
/** Swing timeline (seconds): wind-up, the sweep (hit frame inside it), recovery. One swing at a time. */
/* Oct 20 2026 (user: the swing was too fast): about twice as slow so the arc and the catch read clearly. */
export const SWING={windup:.3,hit:.58,sweepEnd:.85,end:1.25} as const;
/** Catch zoom (seconds): ease in, hold (wiggle, name, burst), ease out; total ≤ 4.2 s. Tap skips; reduced motion = no zoom. */
/* Oct 20 2026 (user: show it more, and it was too zoomed in): a longer, wider framing. */
export const ZOOM={in:1.3,hold:2,out:.9} as const;
/** The catch stage (Oct 21 2026, user: "this needs to zoom in on the character first then show the actual catching ... an isolated
 *  animation to show the catch, it doesn't need to have the background"). A swing that will connect plays as a short cinematic:
 *  the follow camera pushes in on the character (`pushIn`), the island dissolves into a plain stage (`dissolve`), and on the stage the
 *  whole catch plays live: settle, the swing (wind-up, sweep), a 70 ms hit-stop, the bug sucked into the hoop with a spiral, the bag
 *  flipping closed, the net raised with a hop, the hold (wiggle, name, burst), the story card, then the stage dissolves back.
 *  Seconds, stage-local (0 = the stage shows). Reduced motion: no stage (the quick catch). */
export const CATCH_STAGE={pushIn:.6,dissolve:.22,settle:.25,hitStop:.07,suck:.4,flip:.3,raise:.45,hold:1,card:.8,out:.5} as const;
export type CatchStagePhase='settle'|'swing'|'hitstop'|'suck'|'flip'|'raise'|'hold'|'card'|'out'|'done';
/** Stage-local phase starts (s): the swing's hit frame lands at settle + SWING.hit. */
export const CATCH_STAGE_AT=(()=>{const C=CATCH_STAGE,swing=C.settle,hit=swing+SWING.hit,hitStop=hit,suck=hit+C.hitStop,flip=suck+C.suck,raise=flip+C.flip,
 hold=raise+C.raise,card=hold+C.hold,out=card+C.card,done=out+C.out;return {settle:0,swing,hit,hitStop,suck,flip,raise,hold,card,out,done} as const;})();
/** The order the phases play in (tests check the starts only ever increase). */
export const CATCH_STAGE_ORDER:readonly CatchStagePhase[]=['settle','swing','hitstop','suck','flip','raise','hold','card','out','done'];
/** Phase at stage time t (s) and its progress 0..1. */
export function catchStagePhase(t:number):{phase:CatchStagePhase;k:number}{const A=CATCH_STAGE_AT;
 const seg=(phase:CatchStagePhase,a:number,b:number)=>({phase,k:b>a?Math.max(0,Math.min(1,(t-a)/(b-a))):1});
 if(t<A.swing)return seg('settle',0,A.swing);if(t<A.hit)return seg('swing',A.swing,A.hit);if(t<A.suck)return seg('hitstop',A.hitStop,A.suck);
 if(t<A.flip)return seg('suck',A.suck,A.flip);if(t<A.raise)return seg('flip',A.flip,A.raise);if(t<A.hold)return seg('raise',A.raise,A.hold);
 if(t<A.card)return seg('hold',A.hold,A.card);if(t<A.out)return seg('card',A.card,A.out);if(t<A.done)return seg('out',A.out,A.done);return {phase:'done',k:1};}
/** The swing's own clock (bugNet / the netswing pose) at stage time t: it runs from the swing start, freezes for the hit-stop, then
 *  carries on to the end of the sweep while the bug is sucked in. */
export function stageSwingTime(t:number){const A=CATCH_STAGE_AT;if(t<A.swing)return -1;if(t<A.hit)return t-A.swing;if(t<A.suck)return SWING.hit;
 return Math.min(SWING.sweepEnd,SWING.hit+(t-A.suck));}
/** A caught bug fits the net: its longest side is at most CATCH_FIT of the hoop's diameter (and never bigger than it flew). */
export const CATCH_FIT=.6;
/** On the stage the bug flies at a believable size beside the character: its longest side at most this (m). */
export const STAGE_BUG_MAX=.5;
/** Scale for a bug model whose longest side is `longest` model units, flying at `flight` scale, so it fits a hoop of radius hoopR. */
export function catchScale(longest:number,flight:number,hoopR:number,fit=CATCH_FIT){if(!(longest>0))return flight;return Math.min(flight,fit*2*hoopR/longest);}
/** The stage's in-flight scale: the island's (readable from the follow camera) capped to STAGE_BUG_MAX. */
export function stageFlightScale(longest:number,world:number,max=STAGE_BUG_MAX){if(!(longest>0))return world;return Math.min(world,max/longest);}
type V3={x:number;y:number;z:number};
/** The stage camera: a three-quarter view from the character's front-left (the net is held on the right, so it never comes between
 *  the camera and the face), a little above, pulled back until every point of `fit` (the character's box, the net's reach, the
 *  bug) is inside the frame with `margin` to spare, and the character no taller than `maxShare` of the screen. Pure: tests check it.
 *  `yaw` = the character's facing (0 = +z). Returns the eye, the target and the vertical fov (deg). */
export function stageShot(p:V3,yaw:number,aspect:number,fit:readonly V3[],o:{height?:number;maxShare?:number;margin?:number;side?:number;fov?:number}={}){
 const H=o.height??1.5,share=o.maxShare??.48,margin=o.margin??.1,side=o.side??.62,fov=o.fov??(aspect<1?50:38);
 const fx=Math.sin(yaw),fz=Math.cos(yaw),lx=fz,lz=-fx;// forward, the character's left
 // From the front-left: forward rotated `side` rad toward the left, looking back at the character, 18° down.
 const dx=fx*Math.cos(side)+lx*Math.sin(side),dz=fz*Math.cos(side)+lz*Math.sin(side),pitch=.3;
 const target={x:p.x+fx*.35,y:p.y+H*.95,z:p.z+fz*.35};
 // View basis: look = toward the target from the eye (−d horizontally, tipped down by pitch).
 const cp=Math.cos(pitch),sp=Math.sin(pitch),look={x:-dx*cp,y:-sp,z:-dz*cp},right={x:-look.z,y:0,z:look.x};const rl=Math.hypot(right.x,right.z)||1;right.x/=rl;right.z/=rl;
 const up={x:right.y*look.z-right.z*look.y,y:right.z*look.x-right.x*look.z,z:right.x*look.y-right.y*look.x};
 const tv=Math.tan(fov*Math.PI/360),th=tv*aspect,lim=1-margin;let d=0;
 for(const q of fit){const vx=q.x-target.x,vy=q.y-target.y,vz=q.z-target.z,along=vx*look.x+vy*look.y+vz*look.z,x=vx*right.x+vy*right.y+vz*right.z,y=vx*up.x+vy*up.y+vz*up.z;
  d=Math.max(d,Math.abs(x)/(th*lim)-along,Math.abs(y)/(tv*lim)-along);}
 // The character no taller than `share` of the screen height: visible height at the target ≥ H / share.
 d=Math.max(d,H/share/(2*tv),2.2);
 return {eye:{x:target.x-look.x*d,y:target.y-look.y*d,z:target.z-look.z*d},target,fov,dist:d};
}
/** The points the stage shot keeps in frame for a character at p facing yaw with the bug at `bug`: the feet either side, the head,
 *  the raised net's top (over the right shoulder), the hoop held out in front, the bag behind the shoulders, and the bug. */
export function stageFit(p:V3,yaw:number,bug:V3):V3[]{const fx=Math.sin(yaw),fz=Math.cos(yaw),rx=-fz,rz=fx;
 return [{x:p.x+rx*.35,y:p.y,z:p.z+rz*.35},{x:p.x-rx*.35,y:p.y,z:p.z-rz*.35},{x:p.x,y:p.y+1.6,z:p.z},{x:p.x+rx*.95+fx*.3,y:p.y+3.5,z:p.z+rz*.95+fz*.3},
  {x:p.x+fx*1.9+rx*.6,y:p.y+1.5,z:p.z+fz*1.9+rz*.6},{x:p.x-fx*.6,y:p.y+1.2,z:p.z-fz*.6},bug];}
/** The push-in before the stage: the follow camera slides along its own line of sight toward the character's head (so it can never
 *  pass through anything the follow camera did not already see past), to `dist` m, never lower than `clear` m over the floor. */
export function pushInShot(cam:V3,head:V3,floorAt:(x:number,z:number)=>number,dist=4.2,clear=.9){
 const vx=cam.x-head.x,vy=cam.y-head.y,vz=cam.z-head.z,l=Math.hypot(vx,vy,vz)||1,k=Math.min(1,dist/l);
 const eye={x:head.x+vx*k,y:head.y+vy*k,z:head.z+vz*k};eye.y=Math.max(eye.y,floorAt(eye.x,eye.z)+clear);
 return {eye,target:{x:head.x,y:head.y-.2,z:head.z}};
}
/** Each shift catches this many (or all that are out, if fewer): bugs by day, fireflies at night. Pay is per shift (unchanged). */
export const SHIFT_GOAL={bugs:6,fireflies:5} as const;
/** Coins for a species caught for the first time ever (a small learning bonus, once per species, never metered). */
export const NEW_SPECIES_COINS=1;
/** Release formation: how many bugs fly in the 20-bug formation per heat tier (0, 1, ≥ 2). */
export const FORMATION_CAP:readonly number[]=[20,14,11];
export const formationCount=(tier:number)=>FORMATION_CAP[Math.max(0,Math.min(FORMATION_CAP.length-1,Math.floor(tier)||0))];
/** Rides allowed on a Bug squad shift (never flying). */
export const BUG_RIDES:readonly string[]=['walk','scooter','bike','moped'];
export const bugRideAllowed=(mode:string)=>BUG_RIDES.includes(mode);
export const BUG_WATER_NOTE='Bug squad ended: you went into the water. Your Bug book keeps every bug you caught. Come back to the sign to start again.';
export const BUG_WALK_NOTE='Hop off to catch bugs: they are caught on foot.';
/** Leaving Summit Isle by land / air (zipline, ferry, teleport): this far past the coastline (the trail and beaches never count). */
export const BUG_ISLAND_MARGIN=25;
/** Nearest-bug hint (the pill's hint button): the guide shows this long, then cools down; it ends early within net range. */
export const HINT={show:7,cooldown:3,near:3} as const;
/** Fewer than RECALL.min bugs within RECALL.near metres (checked every RECALL.wait s): the farthest one is called over to a home spot within RECALL.within m. */
export const RECALL={near:40,min:6,wait:1.5,within:90,far:45} as const;
/** The nearest uncaught target for the hint: swarm hits first (nearest first), else the nearest home of an uncaught species.
 *  `got(id)` = caught this shift. Null when everything is caught. */
/** Will a locked swing at a target connect? The target holds still once the swing locks on (swarm.hold), so the hit test at swing
 *  start with its current position is the outcome: in the lunging sweep (LOCKED_SLACK) = a catch. Used to decide whether the swing
 *  plays as the catch stage (a hit) or as the normal swing on the island (a miss). */
export function predictCatch(px:number,py:number,pz:number,t:{x:number;y:number;z:number}|null,stalk=false){
 if(!t)return false;const c={x:0,y:0,z:0};lungeCentre(px,py,pz,t.x,t.z,c);return inSweep(c,t,stalk,LOCKED_SLACK);}
export function nearestUncaught<H extends {x:number;z:number;id:string}>(hits:readonly H[],idOf:(h:H)=>string,homes:readonly {id:string;x:number;z:number}[],got:(id:string)=>boolean,px:number,pz:number):{id:string;x:number;z:number;dist:number;live:boolean}|null{
 let best:{id:string;x:number;z:number;dist:number;live:boolean}|null=null;
 for(const h of hits){const id=idOf(h);if(got(id))continue;const d=Math.hypot(h.x-px,h.z-pz);if(!best||d<best.dist)best={id,x:h.x,z:h.z,dist:d,live:true};}
 if(best)return best;
 for(const h of homes){if(got(h.id))continue;const d=Math.hypot(h.x-px,h.z-pz);if(!best||d<best.dist)best={id:h.id,x:h.x,z:h.z,dist:d,live:false};}
 return best;
}
/** How the net is carried (catching lane): 'pack' = strapped to the side of the backpack while riding; else held in both hands. */
export type NetCarry='pack'|'carry'|'low'|'raise'|'swing';
export function netCarryMode(o:{ride:string;stalk:boolean;swinging:boolean;raised:boolean}):NetCarry{
 if(o.ride!=='walk')return 'pack';if(o.raised)return 'raise';if(o.swinging)return 'swing';return o.stalk?'low':'carry';}
export const BUG_LEFT_NOTE='Bug squad ended: you left Summit Isle. Your Bug book keeps every bug you caught. Come back to the sign to start again.';
export const BUG_FLY_NOTE='No flying on a Bug squad shift: it scares the bugs. Scooter, bike and moped are fine.';

export type SwingHit={id:string;x:number;y:number;z:number};
const wrap=(a:number)=>{while(a>Math.PI)a-=Math.PI*2;while(a<-Math.PI)a+=Math.PI*2;return a;};
/** Heading (rad, 0 = +z, like the player's rotation.y) from the player to a point. */
export const headingTo=(px:number,pz:number,x:number,z:number)=>Math.atan2(x-px,z-pz);
/** Auto-aim: the nearest bug within AUTO_AIM_RANGE and the cone in front (null = swing straight ahead). `hits` nearest first. */
export function autoAim<H extends SwingHit>(hits:readonly H[],px:number,pz:number,yaw:number,range=AUTO_AIM_RANGE,skip?:(h:H)=>boolean):H|null{
 // Nearest wins, but one behind the player costs 2 m and an already-caught one 6 m (a kid presses Swing and the net turns to the bug).
 let best:H|null=null,bs=Infinity;
 for(const h of hits){const d=Math.hypot(h.x-px,h.z-pz);if(d>range)continue;const off=Math.abs(wrap(headingTo(px,pz,h.x,h.z)-yaw));
  if(d>=.6&&off>AUTO_AIM_HALF_ANGLE)continue;const sc=d+(off>Math.PI/2?2:0)+(skip&&skip(h)?6:0);if(sc<bs){bs=sc;best=h;}}
 return best;
}
/** A locked swing samples the target at these times (s) between the wind-up and the hit frame: in the sweep at any of them = caught. */
export const SWING_SAMPLES:readonly number[]=[SWING.windup,(SWING.windup+SWING.hit)/2,SWING.hit];
/** The lunging sweep centre toward a target at (tx, tz): out to the target, between NET_SWEEP_AHEAD and LUNGE_MAX. */
export function lungeCentre(px:number,py:number,pz:number,tx:number,tz:number,out:{x:number;y:number;z:number}){
 return sweepCentre(px,py,pz,headingTo(px,pz,tx,tz),out,Math.max(NET_SWEEP_AHEAD,Math.min(LUNGE_MAX,Math.hypot(tx-px,tz-pz))));}
/** The sweep centre for a player at (px, py, pz) facing yaw. */
export function sweepCentre(px:number,py:number,pz:number,yaw:number,out:{x:number;y:number;z:number},ahead=NET_SWEEP_AHEAD){
 out.x=px+Math.sin(yaw)*ahead;out.y=py+NET_SWEEP_HEIGHT;out.z=pz+Math.cos(yaw)*ahead;return out;}
/** Is a bug inside the sweep volume? `slack` widens it (a locked target), `stalk` = Net down. */
export function inSweep(c:{x:number;y:number;z:number},b:{x:number;y:number;z:number},stalk=false,slack=1){
 const r=NET_SWEEP_RADIUS*(stalk?NET_STALK_REACH:1)*slack;return Math.hypot(b.x-c.x,b.z-c.z)<=r&&Math.abs(b.y-c.y)<=NET_SWEEP_VERTICAL*slack;}
/** At the hit frame: the bug caught (the locked target if it is still close, else the nearest inside the sweep), or null = a miss. */
export function swingResult<H extends SwingHit>(hits:readonly H[],c:{x:number;y:number;z:number},locked:string|null,stalk=false):H|null{
 if(locked)for(const h of hits)if(h.id===locked&&inSweep(c,h,stalk,LOCKED_SLACK))return h;
 let best:H|null=null,bd=Infinity;for(const h of hits){if(!inSweep(c,h,stalk))continue;const d=Math.hypot(h.x-c.x,h.z-c.z);if(d<bd){bd=d;best=h;}}
 return best;
}
/** Where the swing is: 'windup' | 'sweep' | 'recover' | 'done', and the sweep's progress 0..1 (the hoop's arc). */
export function swingPhase(t:number){
 if(t<SWING.windup)return {phase:'windup' as const,k:t/SWING.windup};
 if(t<SWING.sweepEnd)return {phase:'sweep' as const,k:(t-SWING.windup)/(SWING.sweepEnd-SWING.windup)};
 if(t<SWING.end)return {phase:'recover' as const,k:(t-SWING.sweepEnd)/(SWING.end-SWING.sweepEnd)};
 return {phase:'done' as const,k:1};
}
/** How many a shift needs: SHIFT_GOAL, or every bug that is out if fewer (heat tiers put fewer on the map). */
export const shiftGoal=(set:'bugs'|'fireflies',out:number)=>Math.max(1,Math.min(SHIFT_GOAL[set],out||SHIFT_GOAL[set]));
/** A per-shift seed for pickBugsOnMap that favours species still missing from the squad: the best of a few seeds. */
export function shiftSeed(day:number,shift:number,missing:readonly string[],time:'day'|'sunset'='day',tier=0){
 let best=bugRotationSeed(day,shift),score=-1;
 for(let k=0;k<8;k++){const seed=bugRotationSeed(day,shift*8+k),list=pickBugsOnMap(seed,tier,time);const n=list.filter(b=>missing.includes(b.id)).length;
  if(n>score){score=n;best=seed;}}
 return best;
}
/** Roster index of a species id (bugs) or call id (fireflies); −1 if unknown. */
export const bugIndex=(id:string)=>BUG_SPECIES.findIndex(b=>b.id===id);
export const fireflyIndex=(id:string)=>FIREFLY_SET.findIndex(f=>f.id===id);
/** The story shown for the n-th catch of a species (1-based): rotates through its stories. */
export function storyFor(stories:readonly {text:string;source:string}[],catchCount:number){
 if(!stories.length)return null;return stories[(Math.max(1,catchCount)-1)%stories.length];}
/** 20-bug release formation: a 4-3-3 (GK, back four, three in midfield, three up front) then the bench and staff in a line behind,
 *  in metres across (x) and forward (z) of the formation's centre. Slot order follows BUG_SPECIES (role shirt numbers). */
export function formationSlots(n:number):{x:number;z:number}[]{
 const xi:[number,number][]=[[0,-4.2],[-2.4,-2.4],[-.8,-2.8],[.8,-2.8],[2.4,-2.4],[-1.6,-.6],[0,-.9],[1.6,-.6],[-2.2,1.6],[0,2.1],[2.2,1.6]];
 const out=xi.map(([x,z])=>({x,z}));const rest=Math.max(0,n-out.length);
 for(let i=0;i<rest;i++)out.push({x:(i-(rest-1)/2)*.95,z:-6.2});
 return out.slice(0,n);
}
/** BUG_SPECIES order → formation slot: starters by shirt number (1 = GK … 11), then subs, then staff. */
export function formationOrder():string[]{
 const shirtSlot:Record<number,number>={1:0,2:4,3:1,4:2,5:3,6:6,8:5,10:7,7:10,9:9,11:8};
 const xi:string[]=new Array(11).fill('');const bench:string[]=[];
 for(const b of BUG_SPECIES){const s=b.role.group==='starter'&&b.role.shirt!==undefined?shirtSlot[b.role.shirt]:undefined;if(s!==undefined&&!xi[s])xi[s]=b.id;else bench.push(b.id);}
 return [...xi.filter(Boolean),...bench];
}
