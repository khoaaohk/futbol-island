import {DEEP_SEA_BOATS,type DeepSeaBoat} from './deepSeaBoatData';

/**
 * The deep-sea boats' hulls as solid shapes (Nov 11 2026, owner on an iPhone: "getting stuck here with the boat"). Pure, no three.js.
 *
 * Before: only the open aft deck was a floor (landableDecks.ts); the rest of the hull (the 0.5 m topsides band round the deck, the
 * wheelhouse and the bow) was plain sea, and the deck counted as LAND for the water depth, so the sea beside the boat read as knee
 * deep shallows. A player could wade INSIDE the hull outline (half in the topsides, half on the deck edge, a wading ripple under the
 * feet), in a zone that was neither "on deck" nor "swimming", walk through the wheelhouse, and stand on the open sea beside the boat.
 * Now (one rule, run each frame only inside a boat's afloat box):
 *  - Coming from the water into the hull beside the open deck (within BOARD_REACH of it): climb aboard, onto the nearest deck point.
 *  - Coming from the water anywhere else on the hull (the wheelhouse, the bow): pushed back out to the nearest water (a wall you slide along).
 *  - Walking off the deck into the topsides band (within HOP_REACH of the outside): hop over the side into the sea.
 *  - Walking off the deck toward the wheelhouse (no side within reach): the step is refused (slide along the deck's edge).
 *  - Anything else inside the hull (a restored save, a teleport): the same rules with no previous point = from the water.
 * FLIP_S of hysteresis between a climb aboard and a hop off (no deck/water flicker with the stick held into a corner).
 * The safety net (boatUnstick): pushing the stick near a boat, off its deck, with no progress for STUCK_S seconds: out to free water.
 * Heat: a box reject per boat (two boats) when far; no allocation (module scratch objects).
 */
export const HULL_TAPER={full:2.2,mid:4.3,midBeam:.62};
/** The open deck in base boat-local metres (deepSeaBoatData.ts: x -5.0..0.2, z ±1.45; scaled by the look). */
export const DECK_LOCAL={x0:-5,x1:.2,halfBeam:1.45};
export const BOARD_REACH=.95,HOP_REACH=1.05,OUT_GAP=.35,DECK_INSET=.3,STUCK_S=1.5,STUCK_MOVE=.15,STUCK_GAP=.9;
/** No deck/water flicker: after climbing aboard a hop off waits FLIP_S seconds (the deck edge holds), and after a hop off climbing
 *  back aboard waits as long (the hull pushes out). A stick held into a corner never bounces the player on and off every frame. */
export const FLIP_S=.6;
const flip={board:-1e9,hop:-1e9};
type P={x:number;z:number};
/** The hull's half beam at boat-local x (the full beam aft of 2.2 m, tapering to 0.62 of it at 4.3 m and to the stem). */
export function hullHalfBeamAt(b:DeepSeaBoat,lx:number){
 const L=b.look.scale.length,hb=b.hull.halfBeam,full=HULL_TAPER.full*L,mid=HULL_TAPER.mid*L;
 if(lx<=full)return hb;if(lx<=mid)return hb*(1-(1-HULL_TAPER.midBeam)*(lx-full)/(mid-full));
 return Math.max(0,hb*HULL_TAPER.midBeam*(1-(lx-mid)/(b.hull.x1-mid)));
}
export const insideHullLocal=(b:DeepSeaBoat,lx:number,lz:number)=>lx>b.hull.x0&&lx<b.hull.x1&&Math.abs(lz)<hullHalfBeamAt(b,lx);
export function onDeckLocal(b:DeepSeaBoat,lx:number,lz:number){const L=b.look.scale.length,W=b.look.scale.beam;return lx>=DECK_LOCAL.x0*L&&lx<=DECK_LOCAL.x1*L&&Math.abs(lz)<=DECK_LOCAL.halfBeam*W;}
const inBox=(b:DeepSeaBoat,x:number,z:number,m=0)=>x>=b.afloat.x0-m&&x<=b.afloat.x1+m&&z>=b.afloat.z0-m&&z<=b.afloat.z1+m;
const lp={x:0,z:0},lq={x:0,z:0},tmp={x:0,z:0};
function toLocal(b:DeepSeaBoat,x:number,z:number,out:P){const C=Math.cos(b.yaw),S=Math.sin(b.yaw),dx=x-b.mooring.x,dz=z-b.mooring.z;out.x=dx*C-dz*S;out.z=dx*S+dz*C;return out;}
function toWorld(b:DeepSeaBoat,lx:number,lz:number,out:P){const C=Math.cos(b.yaw),S=Math.sin(b.yaw);out.x=b.mooring.x+lx*C+lz*S;out.z=b.mooring.z-lx*S+lz*C;return out;}
/** The nearest boat-local point just outside the hull (stern, either side, or the bow) and its distance. */
function nearestOutside(b:DeepSeaBoat,lx:number,lz:number,gap:number,out:P){
 const hb=hullHalfBeamAt(b,lx),side=hb-Math.abs(lz),stern=lx-b.hull.x0,bow=b.hull.x1-lx;let d=side;out.x=lx;out.z=(lz<0?-1:1)*(hb+gap);
 if(stern<d){d=stern;out.x=b.hull.x0-gap;out.z=lz;}
 if(bow<d){d=bow;out.x=b.hull.x1+gap;out.z=lz;}
 return d;
}
/** The nearest point on the open deck, inset from its edges, and its distance. */
function nearestDeck(b:DeepSeaBoat,lx:number,lz:number,out:P){
 const L=b.look.scale.length,W=b.look.scale.beam,i=DECK_INSET;
 out.x=Math.min(DECK_LOCAL.x1*L-i,Math.max(DECK_LOCAL.x0*L+i,lx));out.z=Math.min(DECK_LOCAL.halfBeam*W-i,Math.max(-DECK_LOCAL.halfBeam*W+i,lz));
 const ex=Math.max(0,DECK_LOCAL.x0*L-lx,lx-DECK_LOCAL.x1*L),ez=Math.max(0,Math.abs(lz)-DECK_LOCAL.halfBeam*W);return Math.hypot(ex,ez);
}
/** The boat whose hull (outside its open deck) holds (x, z), or null. Point test only. */
export function boatHullAt(x:number,z:number):DeepSeaBoat|null{
 for(const b of DEEP_SEA_BOATS){if(!inBox(b,x,z))continue;toLocal(b,x,z,lp);if(insideHullLocal(b,lp.x,lp.z)&&!onDeckLocal(b,lp.x,lp.z))return b;}
 return null;
}
export type HullResolve='board'|'hop'|'back'|'out'|null;
/**
 * Resolves a position inside a boat's hull (off its open deck): mutates `p` and says what happened. `prev` is where the player was
 * before this frame's step (null: a load or a teleport, treated as coming from the water). `deckLive(x, z)`: the deck there is a
 * registered floor right now (landableDecks.ts); boarding waits for it (otherwise out to the water). `now` (seconds; -1 = no
 * hysteresis, tests) times the FLIP_S guard.
 */
export function resolveBoatHull(p:P,prev:P|null,deckLive:(x:number,z:number)=>boolean,now=-1):HullResolve{
 for(const b of DEEP_SEA_BOATS){
  if(!inBox(b,p.x,p.z))continue;toLocal(b,p.x,p.z,lp);
  if(!insideHullLocal(b,lp.x,lp.z)||onDeckLocal(b,lp.x,lp.z))continue;
  const fromDeck=!!prev&&inBox(b,prev.x,prev.z)&&onDeckLocal(b,toLocal(b,prev.x,prev.z,lq).x,lq.z);
  if(fromDeck){
   if(nearestOutside(b,lp.x,lp.z,OUT_GAP,tmp)<=HOP_REACH&&(now<0||now-flip.board>=FLIP_S)){toWorld(b,tmp.x,tmp.z,p);if(now>=0)flip.hop=now;return 'hop';}
   // Toward the wheelhouse: keep whichever single axis of the step stays on the deck (a slide), else stay put.
   const px=prev!.x,pz=prev!.z;
   if(onDeckLocal(b,toLocal(b,p.x,pz,lq).x,lq.z)){p.z=pz;return 'back';}
   if(onDeckLocal(b,toLocal(b,px,p.z,lq).x,lq.z)){p.x=px;return 'back';}
   p.x=px;p.z=pz;return 'back';
  }
  if(nearestDeck(b,lp.x,lp.z,tmp)<=BOARD_REACH&&(now<0||now-flip.hop>=FLIP_S)){toWorld(b,tmp.x,tmp.z,lq);if(deckLive(lq.x,lq.z)){p.x=lq.x;p.z=lq.z;if(now>=0)flip.board=now;return 'board';}}
  nearestOutside(b,lp.x,lp.z,OUT_GAP,tmp);toWorld(b,tmp.x,tmp.z,p);return 'out';
 }
 return null;
}
/** Near any boat (its afloat box plus a margin): the per-frame gate for the rules above. */
export const nearBoat=(x:number,z:number,m=2)=>{for(const b of DEEP_SEA_BOATS)if(inBox(b,x,z,m))return true;return false;};
const stuck={t:0,x:NaN,z:NaN};
/**
 * The safety net: called each frame near a boat with whether the stick is pushed. Off the deck (in the water beside the boat), a push
 * that makes less than STUCK_MOVE m of progress for STUCK_S s moves the player STUCK_GAP m clear of the hull (true when it did).
 */
export function boatUnstick(dt:number,p:P,pushing:boolean,onDeck:boolean){
 if(!pushing||onDeck){stuck.t=0;stuck.x=NaN;return false;}
 if(!(Math.hypot(p.x-stuck.x,p.z-stuck.z)<STUCK_MOVE)){stuck.x=p.x;stuck.z=p.z;stuck.t=0;return false;}
 stuck.t+=dt;if(stuck.t<STUCK_S)return false;
 stuck.t=0;stuck.x=NaN;
 for(const b of DEEP_SEA_BOATS){if(!inBox(b,p.x,p.z,2))continue;toLocal(b,p.x,p.z,lp);
  // Clamp into the hull's band first so the nearest side is measured from inside, then out past it with the wider gap.
  const hb=hullHalfBeamAt(b,Math.min(b.hull.x1,Math.max(b.hull.x0,lp.x)));const cx=Math.min(b.hull.x1-.01,Math.max(b.hull.x0+.01,lp.x)),cz=Math.min(hb-.01,Math.max(-hb+.01,lp.z));
  nearestOutside(b,cx,cz,STUCK_GAP,tmp);toWorld(b,tmp.x,tmp.z,p);return true;}
 return false;
}
/** Tests only. */
export const resetBoatUnstick=()=>{stuck.t=0;stuck.x=NaN;flip.board=flip.hop=-1e9;};
