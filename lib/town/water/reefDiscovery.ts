/**
 * Reef discovery (Oct 21 2026, user: "the jetpack badge on the map for the three far zones, discovery hints for the zones").
 * Pure (no three.js, no React): which Explore zones are too far to swim to, which ones the player has already explored, the nearest
 * one still to find, and the once-per-zone-per-visit "Something shimmers over there" hint.
 *
 *  - FAR: a zone is "fly there" when even the nearest point of its blob outline (diveSpots.ts diveBlobR) is farther than the swim
 *    range (waterDepth.ts SWIM_RANGE) from land. Computed from the zone data (72 outline samples, once), so a zone moved later is
 *    classified again on its own. Today: Kelp Forest Wreck (~90 m), Ball Crate Reef (~89 m), Moon Arch (~69 m).
 *  - DISCOVERED: read from the existing dive saves, no new key: a zone with a saved find (fi2-dive-finds-v1) or a collected pickup /
 *    restore (fi2-dive-reef-v1) has been explored. Entering a zone this visit also counts (markReefDiscovered, Town.tsx at the HUD tick).
 *  - HINT: while flying or swimming (never in a job, lesson, room or the dive itself), the first time per visit the player comes
 *    within REEF_HINT_RANGE m of an undiscovered zone's edge, ONE short toast (components/ReefHintToast.tsx, the shared toast lane)
 *    points at it. Checked at REEF_HINT_HZ (a few distance tests, no allocation).
 * tests/reef-discovery.cjs pins all of this; tests/map-markers.cjs the map badges.
 */
import {DIVE_SPOTS,diveBlobR,inDiveBlob,type DiveSpot} from './diveSpots';
import {SWIM_RANGE} from './waterDepth';
import {distanceToLand} from '../landmass';
import {DIVE_REEF_KEY} from './diveJourney';

/** Mirrors diveSession.ts DIVE_FINDS_KEY (not imported: that module is the dive runtime's). tests/reef-discovery.cjs keeps them equal. */
export const DIVE_FINDS_SAVE_KEY='fi2-dive-finds-v1';
export {DIVE_REEF_KEY};

/** Metres from the zone's nearest outline point to land (72 samples round the blob). */
export function diveEdgeToLand(spot:Pick<DiveSpot,'x'|'z'|'radius'|'blob'>,distance:(x:number,z:number)=>number=distanceToLand){
 let best=Infinity;for(let i=0;i<72;i++){const a=i/72*Math.PI*2,r=diveBlobR(spot,a);best=Math.min(best,distance(spot.x+Math.cos(a)*r,spot.z+Math.sin(a)*r));}
 return best;
}
/** Too far to swim to: the whole outline is beyond the swim range from land, so the jetpack is the way there. */
export const diveSpotFar=(spot:Pick<DiveSpot,'x'|'z'|'radius'|'blob'>,distance?:(x:number,z:number)=>number)=>diveEdgeToLand(spot,distance)>SWIM_RANGE;
let farIds:ReadonlySet<string>|null=null;
/** The far zones' ids (built once from the data). */
export function farDiveSpotIds():ReadonlySet<string>{return farIds??=new Set(DIVE_SPOTS.filter(s=>diveSpotFar(s)).map(s=>s.id));}

/** The zones explored in the saves (any saved find, collected pickup or restore). `get` is localStorage.getItem (or a test stub). */
export function discoveredFromSaves(get:(key:string)=>string|null,spots:readonly DiveSpot[]=DIVE_SPOTS):Set<string>{
 const out=new Set<string>(),known=new Set(spots.map(s=>s.id));
 const read=(k:string)=>{try{const v=JSON.parse(get(k)??'null');return v&&typeof v==='object'?v as Record<string,unknown>:null;}catch{return null;}};
 const finds=read(DIVE_FINDS_SAVE_KEY)?.spots;
 if(finds&&typeof finds==='object')for(const [id,v] of Object.entries(finds as Record<string,unknown>))if(known.has(id)&&Array.isArray(v)&&v.length)out.add(id);
 const reef=read(DIVE_REEF_KEY);
 const zones=reef?.zones;if(zones&&typeof zones==='object')for(const [id,v] of Object.entries(zones as Record<string,unknown>))if(known.has(id)&&Array.isArray(v)&&v.length)out.add(id);
 const restored=reef?.restored;if(Array.isArray(restored))for(const id of restored)if(typeof id==='string'&&known.has(id))out.add(id);
 return out;
}

/** Metres from (x, z) to the zone's blob edge (0 inside). One atan2. */
export function diveEdgeDistance(spot:Pick<DiveSpot,'x'|'z'|'radius'|'blob'>,x:number,z:number){
 const dx=x-spot.x,dz=z-spot.z;return Math.max(0,Math.hypot(dx,dz)-diveBlobR(spot,Math.atan2(dz,dx)));
}
/** The nearest zone not yet explored, with its distance to the edge (m), or null when every zone is explored. */
export function nearestUndiscovered(x:number,z:number,discovered:ReadonlySet<string>,spots:readonly DiveSpot[]=DIVE_SPOTS):{spot:DiveSpot;distance:number}|null{
 let best:DiveSpot|null=null,bd=Infinity;for(const s of spots){if(discovered.has(s.id))continue;const d=diveEdgeDistance(s,x,z);if(d<bd){bd=d;best=s;}}
 return best?{spot:best,distance:bd}:null;
}

/** The hint: within this many metres of an undiscovered zone's edge (well past the surface preview), checked this often, shown this long. */
export const REEF_HINT_RANGE=300,REEF_HINT_HZ=2,REEF_HINT_MS=6000;
/** Quiet seconds after a hint before the next zone's (so two zones in range never chain one toast after another). */
export const REEF_HINT_GAP=60;
export const REEF_HINT_TITLE='Something shimmers over there';
export const reefHintText=(spot:Pick<DiveSpot,'id'|'name'>,far:boolean)=>far?`A reef to explore: ${spot.name}. Too far to swim, so fly there!`:`A reef to explore: ${spot.name}. Follow the arrow!`;

/** The hint tracker for one visit: tick() at the HUD tick; returns the zone to hint (once per zone per visit) or null. */
export function createReefHints(spots:readonly DiveSpot[]=DIVE_SPOTS){
 const hinted=new Set<string>();let acc=0,aimAcc=0,wasDiving=false,wait=0;
 /** The 2 Hz test: the zone to hint (once per zone per visit) or null. `eligible`: flying or swimming, not in a job, lesson, room,
  *  menu or the dive itself. A box reject, then one atan2 per near zone; no allocation. */
 function tick(dt:number,x:number,z:number,eligible:boolean,discovered:ReadonlySet<string>):DiveSpot|null{
  wait=Math.max(0,wait-dt);acc+=dt;if(acc<1/REEF_HINT_HZ)return null;acc=0;if(!eligible||wait>0)return null;
  let best:DiveSpot|null=null,bd=REEF_HINT_RANGE;
  for(const s of spots){if(discovered.has(s.id)||hinted.has(s.id))continue;const dx=x-s.x,dz=z-s.z;if(Math.abs(dx)>bd+40||Math.abs(dz)>bd+40)continue;
   if(inDiveBlob(s,x,z))continue;const d=diveEdgeDistance(s,x,z);if(d<bd){bd=d;best=s;}}
  if(best){hinted.add(best.id);wait=REEF_HINT_GAP;}
  return best;
 }
 /** Town.tsx's one call per frame: marks the zone a dive starts in, re-reads the saves when a dive ends, raises the hint and keeps
  *  its arrow aimed (2 Hz). `m` is the camera's matrixWorld elements (forward = -column 2, right = column 0). */
 function step(dt:number,x:number,z:number,eligible:boolean,diving:boolean,diveSpot:string,m:ArrayLike<number>){
  if(diving&&diveSpot&&!reefStore.get().discovered.has(diveSpot))reefStore.mark(diveSpot);
  if(diving!==wasDiving){wasDiving=diving;if(!diving)reefStore.refresh();}
  const h=reefStore.get().hint;aimAcc+=dt;
  if(h&&aimAcc>=1/REEF_HINT_HZ){aimAcc=0;for(const s of spots)if(s.id===h.id)reefStore.aim(aimAt(m,s.x-x,s.z-z));}
  if(acc+dt>=1/REEF_HINT_HZ)reefStore.ensure();
  const s=tick(dt,x,z,eligible,reefStore.get().discovered);
  if(s)reefStore.hint(s,farDiveSpotIds().has(s.id),aimAt(m,s.x-x,s.z-z));
 }
 return {hinted,tick,step};
}
const aimAt=(m:ArrayLike<number>,dx:number,dz:number)=>{const fx=-m[8],fz=-m[10],fl=Math.hypot(fx,fz)||1,rx=m[0],rz=m[2],rl=Math.hypot(rx,rz)||1;return screenBearing(fx/fl,fz/fl,rx/rl,rz/rl,dx,dz);};
/** The arrow's screen angle (rad, 0 = up, clockwise) from the camera's forward / right on the ground plane to the zone. */
export function screenBearing(fx:number,fz:number,rx:number,rz:number,dx:number,dz:number){return Math.atan2(dx*rx+dz*rz,dx*fx+dz*fz);}

// The tiny shared store (the map's markers, the travel map's nearest line, the hint toast). Event-driven, no polling.
type ReefView={discovered:ReadonlySet<string>;hint:{id:string;name:string;far:boolean;n:number}|null;angle:number};
let view:ReefView={discovered:new Set(),hint:null,angle:0},loaded=false,hints=0;
const listeners=new Set<()=>void>();
const emit=()=>listeners.forEach(f=>f());
export const reefStore={
 get:()=>view,
 subscribe(fn:()=>void){listeners.add(fn);return()=>{listeners.delete(fn);};},
 /** Re-read the saves (on the first use, when the travel map opens, after a dive). */
 refresh(){if(typeof window==='undefined')return;loaded=true;let saved:Set<string>;try{saved=discoveredFromSaves(k=>localStorage.getItem(k));}catch{saved=new Set();}
  for(const id of view.discovered)saved.add(id);if(saved.size!==view.discovered.size){view={...view,discovered:saved};emit();}},
 ensure(){if(!loaded)reefStore.refresh();},
 mark(id:string){if(view.discovered.has(id))return;const d=new Set(view.discovered);d.add(id);view={...view,discovered:d,hint:view.hint?.id===id?null:view.hint};emit();},
 hint(spot:Pick<DiveSpot,'id'|'name'>,far:boolean,angle:number){view={...view,hint:{id:spot.id,name:spot.name,far,n:++hints},angle};emit();},
 /** The arrow while the hint shows, quantised to 10° so a 2 Hz tick re-renders only when it visibly turns. */
 aim(angle:number){const q=Math.round(angle/(Math.PI/18))*(Math.PI/18);if(q!==view.angle){view={...view,angle:q};emit();}},
 clearHint(){if(view.hint){view={...view,hint:null};emit();}},
};
