import {onFerryBoarding} from './ferryBoarding';
import {onIsland} from './shoreline';
import {onCayLand,CAY_FLIGHT_BOUNDS} from './coralCay';
// Summit Isle (Oct 12 2026): walkable like the cay; its sea sets the world's south-east corner.
import {onSummitLand,onSummitGround,SUMMIT_FLIGHT_BOX} from './summitIsle';
import {onLandableDeck} from './landableDecks';
import './eastPier'; // Registers the East Pier's walkway and head as landable decks (static; eastPier.ts).
import { TRAVEL_MODES, type TravelMode } from './travelModes';
export const ISLAND_BOUNDS={minX:-102,maxX:250,minZ:-253,maxZ:226} as const;
/** Offshore room round the main island (50 m since Sep 29 2026); it sets the world rectangle's west and north edges. Since Oct 12
 *  2026 the whole rectangle is flyable (flightBlocked). */
export const FLIGHT_WATER_MARGIN=50;
/** The main island's own flight rectangle (its coast plus the 35 m water margin). */
export const MAIN_FLIGHT_BOUNDS={minX:ISLAND_BOUNDS.minX-FLIGHT_WATER_MARGIN,maxX:ISLAND_BOUNDS.maxX+FLIGHT_WATER_MARGIN,minZ:ISLAND_BOUNDS.minZ-FLIGHT_WATER_MARGIN,maxZ:ISLAND_BOUNDS.maxZ+FLIGHT_WATER_MARGIN};
/** The playable world: the main island's rectangle joined with Coral Cay's and Summit Isle's seas. The maps use it as their extent. */
export const FLIGHT_BOUNDS={minX:Math.min(MAIN_FLIGHT_BOUNDS.minX,CAY_FLIGHT_BOUNDS.minX),maxX:Math.ceil(Math.max(MAIN_FLIGHT_BOUNDS.maxX,CAY_FLIGHT_BOUNDS.maxX,SUMMIT_FLIGHT_BOX.maxX)),minZ:Math.min(MAIN_FLIGHT_BOUNDS.minZ,CAY_FLIGHT_BOUNDS.minZ),maxZ:Math.ceil(Math.max(MAIN_FLIGHT_BOUNDS.maxZ,CAY_FLIGHT_BOUNDS.maxZ,SUMMIT_FLIGHT_BOX.maxZ))};
/** Soft corners of the flyable rectangle (m), so the edge nudge turns smoothly round them. */
export const FLIGHT_CORNER=60;
/** The playable world is the map's rectangle (Oct 12 2026, user: "the border is the edge of the map"): everywhere the travel map
 *  shows sea can be flown to, up to its frame (FLIGHT_BOUNDS, which the map draws with an 8 m rim), with rounded corners. Four
 *  comparisons and, near a corner, one distance. Walking still follows the coastlines (blocked). */
export function flightBlocked(x:number,z:number){
 const b=FLIGHT_BOUNDS;if(x<b.minX||x>b.maxX||z<b.minZ||z>b.maxZ)return true;
 const r=FLIGHT_CORNER,cx=Math.min(Math.max(x,b.minX+r),b.maxX-r),cz=Math.min(Math.max(z,b.minZ+r),b.maxZ-r);
 return (x-cx)**2+(z-cz)**2>r*r;
}
export type District = 'coast' | 'oldtown' | 'lights';
export type Obstacle = { x: number; z: number; w: number; d: number; cornerRadius?:number; stepAccess?:boolean; dynamic?:boolean };
export const DISTRICTS = {
  coast: { name: 'Palm Coast', subtitle: 'SALT IN THE AIR. BALL AT YOUR FEET.', x: -7, z: 14 },
  oldtown: { name: 'Old Town', subtitle: 'EVERY WALL HAS A STORY.', x: -6, z: -10 },
  lights: { name: 'After Hours', subtitle: 'THE SUN SETS. THE GAME DOESN’T.', x: -6, z: -37 },
};
export function districtAt(z: number): District { return z < -24 ? 'lights' : z < 1 ? 'oldtown' : 'coast'; }
/** Trees, palms and bushes are solid (Oct 13 2026, user: "don't allow going into trees and bushes"): round colliders (a box whose
 *  corner radius is half its size). A trunk's radius plus TRUNK_CLEARANCE; a bush at 70% of its canopy, fair to brush past. The
 *  walker's or ride's own radius is added on top by blocked(), and stepPlayer slides round them. */
export const TRUNK_CLEARANCE=.3;
export function trunkCollider(x:number,z:number,trunkRadius:number):Obstacle{const r=trunkRadius+TRUNK_CLEARANCE;return {x,z,w:2*r,d:2*r,cornerRadius:r};}
export function bushCollider(x:number,z:number,canopyRadius:number):Obstacle{const r=canopyRadius*.7;return {x,z,w:2*r,d:2*r,cornerRadius:r};}
export function insideObstacle(x:number,z:number,o:Obstacle,padding=0){
  if(o.w<=0||o.d<=0)return false;
  const dx=Math.abs(x-o.x),dz=Math.abs(z-o.z),r=o.cornerRadius??0;
  if(!r)return dx<o.w/2+padding&&dz<o.d/2+padding;
  const qx=Math.max(0,dx-(o.w/2-r)),qz=Math.max(0,dz-(o.d/2-r));
  return Math.hypot(qx,qz)<Math.max(0,r+padding);
}
export function blocked(x: number, z: number, obstacles: Obstacle[], radius = .32) {
  // Causeway, sandbar stops and Coral Cay (a single x comparison rejects this for every main-island point west of the beach).
  if(onCayLand(x,z)||onLandableDeck(x,z)||onSummitLand(x,z))return obstacles.some(o => insideObstacle(x,z,o,radius));
  return (!onIsland(x,z)&&!onFerryBoarding(x,z)) || x < ISLAND_BOUNDS.minX || x > ISLAND_BOUNDS.maxX || z < ISLAND_BOUNDS.minZ || z > ISLAND_BOUNDS.maxZ || obstacles.some(o => insideObstacle(x,z,o,radius));
}
/** blocked() for moving over the ground (walking and riding, stepPlayer): the same everywhere except Summit Isle, where the whole
 *  island inside its waterline is ground at any slope (onSummitGround; the hill assist in rideSlope.ts handles steep climbs), so
 *  the grass never walls anyone in. Only colliders (trees, bushes, rocks, the fence) and the sea stop a move there. */
export function groundBlocked(x:number,z:number,obstacles:Obstacle[],radius=.32){
  if(onSummitGround(x,z))return obstacles.some(o=>insideObstacle(x,z,o,radius));
  return blocked(x,z,obstacles,radius);
}
/** A travel arrival that is itself free (Oct 3 2026 play-through: map travel to 7v7 put the player inside the Old Town Ground
 *  vending machine, hidden and unable to move). Returns (x, z) when it is clear, else the nearest clear point on rings 0.75 m
 *  apart up to `maxRadius`, trying the camera side (+z, so the player stands in front of what was in the way) first. Called
 *  once per travel, never per frame. Falls back to (x, z) when nothing nearby is clear. */
export function clearSpotNear(x:number,z:number,obstacles:Obstacle[],radius=.5,maxRadius=8):{x:number;z:number}{
  if(!blocked(x,z,obstacles,radius))return {x,z};
  for(let r=.75;r<=maxRadius;r+=.75){const n=Math.max(8,Math.ceil(r*2*Math.PI/.75));
    for(let i=0;i<n;i++){const k=i&1?(i+1)/2:-i/2,a=Math.PI/2+k*2*Math.PI/n,nx=x+Math.cos(a)*r,nz=z+Math.sin(a)*r;if(!blocked(nx,nz,obstacles,radius))return {x:nx,z:nz};}}
  return {x,z};
}
const RIDES_SLIDE:Record<TravelMode,boolean>={walk:false,scooter:true,bike:true,moped:true,jetpack:false};
const SLIDE_TURNS=[.5,-.5,1,-1,1.57,-1.57];
/** The ride's slide round a collider: the step turned 30°, 57° or 90° either side and slowed with the turn (at least 40%); a turn
 *  whose way on is also clear 0.8 m further is preferred (so it goes round the side that opens up, not into a corner). Only on a
 *  blocked step. */
function slideRound(position:{x:number;z:number},velocity:{x:number;z:number},px:number,pz:number,vx:number,vz:number,h:number,hit:(x:number,z:number)=>boolean){
  const sp=Math.hypot(vx,vz)||1;
  for (let pass=0; pass<2; pass++) for (const a of SLIDE_TURNS) {const c=Math.cos(a),s=Math.sin(a),k=Math.max(.4,c),rx=(vx*c-vz*s)*k,rz=(vx*s+vz*c)*k;
    if (hit(px+rx*h,pz+rz*h)) continue;
    if (!pass && hit(px+rx/(sp*k)*.8,pz+rz/(sp*k)*.8)) continue;
    position.x=px+rx*h;position.z=pz+rz*h;velocity.x=rx;velocity.z=rz;return true;}
  return false;
}
// Sliding round a round collider (Oct 14 2026, user: "when zooming fast to the mountain, it collides for a second, it should move
// smoothly up the mountain"). A ride that clipped a tree trunk or a rock used to grind round it: every blocked sub-step turned the
// step and cut the speed to 40–87% (slideRound), so a glancing touch at 20 m/s ended at walking pace or held for most of a second.
// Now a step blocked by round colliders (trees, palms, bushes, rocks, huts: cornerRadius) slides along their surface: the part of
// the step into them is dropped and the rest (the tangent) is taken. A walker meeting one off-centre (more than ~5°) keeps
// SLIDE_KEEP of its pace and steps round (one walking dead into a trunk still stops); a ride keeps at least SLIDE_KEEP of its top
// speed (a dead-centre hit goes round one side), so it brushes past instead of grinding to a halt; wedged in a notch two of them
// make (two boulders), it works its way out along the "wall" the two make. Boxes (walls, nets, posts, fences) keep the axis
// slide and the ride's turn away (slideRound), exactly as before.
const SLIDE_KEEP:Record<TravelMode,number>={walk:.5,scooter:.7,bike:.7,moped:.7,jetpack:0};
/** Outward unit normal at (x, z) of the round colliders the circle of `radius` would overlap at the probe points (summed: in a notch
 *  between two rocks it points out of it, along the "wall" they make) and how many; null when a box (or a coast, or the island's
 *  bounds) is in the way too: those keep the old response. */
function contactNormal(x:number,z:number,probes:number[],obstacles:Obstacle[],radius:number){
  let sx=0,sz=0,count=0;
  for(const o of obstacles){let touch=false;for(let i=0;i<probes.length&&!touch;i+=2)touch=insideObstacle(probes[i],probes[i+1],o,radius);if(!touch)continue;
    const r=Math.min(o.cornerRadius??0,o.w/2,o.d/2);if(!(r>0))return null;
    const hx=o.w/2-r,hz=o.d/2-r,dx=x-o.x,dz=z-o.z;let nx=dx-Math.max(-hx,Math.min(hx,dx)),nz=dz-Math.max(-hz,Math.min(hz,dz));const l=Math.hypot(nx,nz);if(l<1e-6){nx=Math.sign(dx)||1;nz=0;}else{nx/=l;nz/=l;}
    sx+=nx;sz+=nz;count++;}
  const l=Math.hypot(sx,sz);return count&&l>1e-6?{x:sx/l,z:sz/l,count}:null;
}
/** The blocked step into (tx, tz) taken round the round colliders in the way instead; false (nothing moved) when that is blocked
 *  too, or a box is in the way. (ix, iz): the stick's direction (unit, or 0); top: the top speed the stick asks for; was: the speed
 *  this tick began with. */
function slideAlong(position:{x:number;z:number},velocity:{x:number;z:number},tx:number,tz:number,h:number,obstacles:Obstacle[],radius:number,mode:TravelMode,top:number,was:number,ix:number,iz:number,hit:(x:number,z:number)=>boolean){
  const vx=velocity.x,vz=velocity.z,sp=Math.hypot(vx,vz);if(sp<1e-6)return false;
  const probes=[tx,tz],keep=SLIDE_KEEP[mode],take=(x:number,z:number,ux:number,uz:number)=>{if(hit(x,z))return false;position.x=x;position.z=z;velocity.x=ux;velocity.z=uz;return true;};
  for(let pass=0;pass<2;pass++){
    const n=contactNormal(position.x,position.z,probes,obstacles,radius);if(!n)return false;
    const into=vx*n.x+vz*n.z;if(into>=0)return false;
    let sx=vx-into*n.x,sz=vz-into*n.z,ts=Math.hypot(sx,sz);const square=ts<.35*sp;
    // The way round follows the stick where it leans along the surface (else the way already going).
    const along=-n.z*ix+n.x*iz,leans=Math.abs(along)>.15,side=leans?Math.sign(along):1;
    if(leans&&(sx*-n.z+sz*n.x)*along<0){sx=-sx;sz=-sz;}
    // The kept speed is a share of the top speed (never more than the speed this tick began with), not of the speed now, so
    // grinding round a collider tick after tick does not shrink it away. A walker walking dead into a trunk keeps nothing.
    const least=mode==='walk'&&ts<.08*sp?0:Math.min(Math.max(sp,was),keep*top);
    if(least>0&&ts<least){if(ts<1e-3*sp){sx=-n.z*side;sz=n.x*side;ts=1;}const k=least/ts;sx*=k;sz*=k;ts=least;}
    if(ts>=1e-4){
      const nx=position.x+sx*h,nz=position.z+sz*h;if(take(nx,nz,sx,sz))return true;
      // Met nearly square on and that side is shut (the sea, another rock): the other way round.
      if(square&&mode!=='walk'&&take(position.x-sx*h,position.z-sz*h,-sx,-sz))return true;
      probes.push(nx,nz);}
    // Wedged in a notch between two (the stick held into it): back out of it on the way along the wall the two make, so the rider
    // works its way out sideways (and round the end of the wall) instead of standing still.
    if(pass||n.count>1){const m=Math.max(ts,.35*Math.min(top,Math.max(sp,was)));if(m<1e-4)return false;
      let ux=ts>=1e-4?sx/ts:-n.z*side,uz=ts>=1e-4?sz/ts:n.x*side;ux+=n.x*.7;uz+=n.z*.7;const l=Math.hypot(ux,uz);ux*=m/l;uz*=m/l;
      if(take(position.x+ux*h,position.z+uz*h,ux,uz))return true;
      if(pass)return false;}
    if(ts<1e-4&&n.count<2)return false;
  }
  return false;
}
/** Out of a collider the rider already overlaps (one that turned solid under it: the hostel's wall once a ride on the outside
 *  stair is a few treads down; standing still it would never get free, every step "into" it). Moved off the nearest face of the
 *  padded outline (or the rounded edge) to just clear of it, when that spot is free; true when moved. Only colliders whose
 *  footprint the centre is outside of (inside one is not "touching" it). */
export function pushOutOf(position:{x:number;z:number},obstacles:Obstacle[],radius:number){
  let moved=false;
  for(const o of obstacles){if(!insideObstacle(position.x,position.z,o,radius)||insideObstacle(position.x,position.z,o,0))continue;
    const r=Math.min(o.cornerRadius??0,o.w/2,o.d/2),dx=position.x-o.x,dz=position.z-o.z;let x=position.x,z=position.z;
    if(r>0){const hx=o.w/2-r,hz=o.d/2-r,qx=dx-Math.max(-hx,Math.min(hx,dx)),qz=dz-Math.max(-hz,Math.min(hz,dz)),l=Math.hypot(qx,qz);if(l<1e-6)continue;x+=qx/l*(r+radius+.01-l);z+=qz/l*(r+radius+.01-l);}
    else if(Math.abs(dx)-o.w/2>Math.abs(dz)-o.d/2)x=o.x+Math.sign(dx)*(o.w/2+radius+.01);else z=o.z+Math.sign(dz)*(o.d/2+radius+.01);
    if(Math.hypot(x-position.x,z-position.z)>radius||groundBlocked(x,z,obstacles,radius))continue;
    position.x=x;position.z=z;moved=true;}
  return moved;
}
/** `speedScale` scales the top speed (rides on Summit Isle's slopes: rideSlope.ts rideSlopeScale); 1 everywhere else. `coast` (per
 *  second, 0 = off): speed above that top speed bleeds off at this rate instead of the acceleration's (a ride's momentum carrying it
 *  up a slope, easing down to its climbing speed rather than braking hard at the foot). */
export function stepPlayer(position: {x: number; z: number}, velocity: {x: number; z: number}, input: {x: number; z: number; sprint: boolean}, dt: number, obstacles: Obstacle[], mode: TravelMode = 'walk', collisionRadius = mode==='walk'?.32:.8, speedScale = 1, coast = 0) {
  dt = Math.max(0, Math.min(dt, .25));
  const settings = TRAVEL_MODES[mode];
  const length = Math.hypot(input.x, input.z), speed = (mode === 'walk' && input.sprint ? 6 : settings.maxSpeed)*speedScale;
  const blend = 1-Math.exp(-dt*(length ? settings.acceleration : settings.braking)), was = Math.hypot(velocity.x,velocity.z), before = coast>0&&length ? was : 0;
  velocity.x += ((length ? input.x/Math.max(1,length)*speed : 0)-velocity.x)*blend;
  velocity.z += ((length ? input.z/Math.max(1,length)*speed : 0)-velocity.z)*blend;
  // The gentler rate only for a real excess (a quarter of the top speed and more), blending back to the acceleration's below that.
  if (before>speed) {const rate=coast+(settings.acceleration-coast)*Math.max(0,1-(before-speed)/(.25*speed)),after=Math.hypot(velocity.x,velocity.z),least=speed+(before-speed)*Math.exp(-dt*rate);if(after>1e-6&&after<least){velocity.x*=least/after;velocity.z*=least/after;}}
  // Sample the swept movement in steps smaller than the collision diameter.
  // Even a thin fence cannot be skipped at moped speed after a long frame.
  const steps = Math.max(1, Math.ceil(Math.hypot(velocity.x,velocity.z)*dt/.15));
  let normal:{x:number;z:number}|null|undefined;
  const hit=(x:number,z:number)=>mode==='jetpack'?flightBlocked(x,z):groundBlocked(x,z,obstacles,collisionRadius);
  for (let i=0; i<steps; i++) {
    const nx = position.x+velocity.x*dt/steps, nz = position.z+velocity.z*dt/steps;
    if (mode==='jetpack') {
      if (!flightBlocked(nx,nz)) { position.x=nx; position.z=nz; continue; }
      // Blocked: slide along the flight edge. Axis-separated resolution alone sticks on curved or slanted outlines
      // (Coral Cay's corridor and margin), so project the step onto the edge tangent first (only on blocked steps).
      if (normal===undefined) normal=flightEdgeNormal(position.x,position.z);
      if (normal && slideAlongFlightEdge(position,velocity,normal,dt/steps)) continue;
    }
    // A clear step is taken whole (checking x then z alone would stop a diagonal step whose x-only half grazes a collider it
    // already clears, the turn straight after a slide); a blocked one slides along the collider first.
    if (mode!=='jetpack') {
      if (!hit(nx,nz)) {
        // Clear: the whole step. Where only one axis of it grazes a collider (a diagonal step past a round one, the turn straight
        // after a slide) the step is still taken when what it grazes is round; a box's corner keeps the axis response below.
        if (!hit(nx,position.z)&&!hit(position.x,nz) || contactNormal(position.x,position.z,[nx,position.z,position.x,nz],obstacles,collisionRadius)) {position.x=nx;position.z=nz;continue;}
      } else if (slideAlong(position,velocity,nx,nz,dt/steps,obstacles,collisionRadius,mode,length?speed:0,was,length?input.x/length:0,length?input.z/length:0,hit)) continue;}
    const vx=velocity.x,vz=velocity.z,px=position.x,pz=position.z;
    if (!hit(nx,position.z)) position.x=nx; else velocity.x=0;
    if (!hit(position.x,nz)) position.z=nz; else velocity.z=0;
    // A ride stopped (or nearly) by a collider (a trunk, a bush, a rock, a wall) head-on slides round it instead (Oct 13 2026, user:
    // "still stuck"): the step turned up to 90° either side, slowed with the turn, the first free one taken. Only where the way
    // ahead is land (a coast or a deck edge still stops a ride, as before).
    if (RIDES_SLIDE[mode] && (vx||vz) && Math.hypot(position.x-px,position.z-pz)<Math.hypot(vx,vz)*dt/steps*.35 && !groundBlocked(nx,nz,[],collisionRadius)) slideRound(position,velocity,px,pz,vx,vz,dt/steps,hit);
  }
}

const EDGE_SAMPLES=8,EDGE_RADIUS=2,EDGE_REUSE=.75;
let edgeCache:{x:number;z:number;n:{x:number;z:number}|null}|null=null;
/** Outward normal of the flight edge near (x,z), estimated from a ring of flightBlocked samples (null when none are blocked).
 *  Only called on blocked jetpack steps; reused within 0.75 m so a long slide costs 8 samples every few frames. */
export function flightEdgeNormal(x:number,z:number){
  if(edgeCache&&Math.abs(edgeCache.x-x)<EDGE_REUSE&&Math.abs(edgeCache.z-z)<EDGE_REUSE)return edgeCache.n;
  let sx=0,sz=0;
  for(let i=0;i<EDGE_SAMPLES;i++){const a=i/EDGE_SAMPLES*Math.PI*2,cx=Math.cos(a),cz=Math.sin(a);if(flightBlocked(x+cx*EDGE_RADIUS,z+cz*EDGE_RADIUS)){sx+=cx;sz+=cz;}}
  const l=Math.hypot(sx,sz),n=l>1e-6?{x:sx/l,z:sz/l}:null;edgeCache={x,z,n};return n;
}
/** Moves along the edge tangent (pulled slightly inward on convex curves); drops the outward velocity so facing follows the slide. */
function slideAlongFlightEdge(position:{x:number;z:number},velocity:{x:number;z:number},n:{x:number;z:number},h:number){
  const out=velocity.x*n.x+velocity.z*n.z;if(out<=0)return false;
  const tx=velocity.x-out*n.x,tz=velocity.z-out*n.z,d=Math.hypot(tx,tz)*h;if(d<1e-4)return false;
  for(const pull of [0,.5,1]){
    const px=position.x+tx*h-n.x*d*pull,pz=position.z+tz*h-n.z*d*pull;
    if(!flightBlocked(px,pz)){position.x=px;position.z=pz;velocity.x=tx;velocity.z=tz;return true;}
  }
  return false;
}

export function crossedGoal(previous: {x:number;z:number}, current: {x:number;z:number}): boolean {
  for (const center of [15,-38]) for (const end of [-1,1]) {
    const plane=center+end*11.6;
    if ((previous.z-plane)*end >= 0 || (current.z-plane)*end < 0) continue;
    const t=(plane-previous.z)/(current.z-previous.z);
    const x=previous.x+(current.x-previous.x)*t;
    if(Math.abs(x-11)<1.91) return true;
  }
  return false;
}
