// Riding Summit Isle's slopes (Oct 13 2026, user: "also allow to ride bikes, scooters, and mopeds up and down the mountain").
// Rides already go wherever walking does (simulation.ts blocked: the island's walkable ground, so any slope up to
// SUMMIT_WALK_SLOPE, ~32°, the carved trail to the summit, the beaches and the sandbar from Coral Cay; cliffs and the steep upper
// faces stay blocked). This adds what makes it feel like riding a hill:
//  - rideSlopeScale: the top speed drops uphill (most for the kick scooter, least for the moped) and rises a little downhill,
//    capped, so no ride runs away down the mountain. The grade comes from the 2 m height grid (summitGridGround), sampled
//    2.5 m either side of the rider: two bilinear reads, and none off the island.
//  - createRideSuspension: the ride's drawn height follows the wheels' ground through a stiff, critically damped spring, never
//    more than RIDE_SUSPENSION_TRAVEL m from it, and the pitch eases to the slope, so the 1 m trail grid, the switchback
//    corners and the ridge crests read as a ride over a hill instead of a judder. Drawing only: the physics height is unchanged.
import {SUMMIT_BOX,summitGridGround} from './summitIsle';
import {TRAVEL_MODES,type TravelMode} from './travelModes';

/** Speed change per unit of grade: uphill divides by (1 + up·grade), downhill multiplies by (1 + down·grade) up to maxDown. */
export const RIDE_CLIMB:Record<'scooter'|'bike'|'moped',{up:number;down:number;maxDown:number}>={
 scooter:{up:2.4,down:.6,maxDown:1.15},
 bike:{up:2,down:.5,maxDown:1.15},
 moped:{up:1.4,down:.25,maxDown:1.08},
};
/** True near Summit Isle (its box plus 4 m): the only place with slopes to ride. */
export const nearSummit=(x:number,z:number)=>x>=SUMMIT_BOX.minX-4&&x<=SUMMIT_BOX.maxX+4&&z>=SUMMIT_BOX.minZ-4&&z<=SUMMIT_BOX.maxZ+4;
/** Grade (rise per metre, + uphill) along the unit direction (dx, dz) at (x, z); 0 away from the island. */
export function summitGrade(x:number,z:number,dx:number,dz:number){
 if(!nearSummit(x,z))return 0;
 return (summitGridGround(x+dx*2.5,z+dz*2.5)-summitGridGround(x-dx*2.5,z-dz*2.5))/5;
}
/** Top-speed multiplier for a ride on this grade (1 for walking, the jetpack and level ground). */
export function rideSlopeScale(mode:TravelMode,grade:number){
 if(mode!=='scooter'&&mode!=='bike'&&mode!=='moped'||!grade)return 1;
 const c=RIDE_CLIMB[mode];
 return grade>0?1/(1+c.up*grade):Math.min(c.maxDown,1-c.down*grade);
}
// ---------------------------------------------------------------------------------------------------------------
// Hill assist (Oct 13 2026, user: "still stuck and can't go up the mountain with the bike", then "some areas can't go down"). The
// whole island is ground now (summitIsle.ts onSummitGround), so nothing in the grass is a wall; instead:
//  - Head-on climbs are capped at RIDE_MAX_CLIMB (rise per metre along the heading). Steering straight up anything steeper,
//    the heading turns across the slope just enough to climb at that grade (a natural switchback line), keeping to the side the
//    stick leans to (and, when it points straight up, to the side it last took, so the line never flickers).
//  - Uphill the top speed drops (rideSlopeScale) but never below RIDE_CRAWL m/s: a ride always keeps moving.
//  - Downhill the small boost stays capped (RIDE_CLIMB maxDown), and past a grade of DESCENT_BRAKE_FROM the ride brakes, so a steep
//    descent is a controlled roll, never a runaway.
//  - Walking only gets the across-the-slope turn (its own WALK_MAX_CLIMB); its speed is unchanged.
// Cost per tick near the island: four bilinear reads of the 2 m height grid.
/** Steepest grade taken head-on (m per m): bike ~37°, moped ~40°, scooter ~35°, walking ~31° (the old walk limit). */
export const RIDE_MAX_CLIMB:Record<'walk'|'scooter'|'bike'|'moped',number>={walk:.6,scooter:.7,bike:.75,moped:.85};
/** The slowest a ride ever goes with the stick held (m/s), however steep. */
export const RIDE_CRAWL:Record<'scooter'|'bike'|'moped',number>={scooter:2.4,bike:2.8,moped:3.4};
const DESCENT_BRAKE_FROM=.55,DESCENT_BRAKE=1.3,GRAD_E=2;
/** Ground gradient (rise per metre in x and z) from the 2 m grid, written into `out`; zero away from the island. */
export function summitGradient(x:number,z:number,out:{gx:number;gz:number}){
 if(!nearSummit(x,z)){out.gx=out.gz=0;return out;}
 out.gx=(summitGridGround(x+GRAD_E,z)-summitGridGround(x-GRAD_E,z))/(2*GRAD_E);out.gz=(summitGridGround(x,z+GRAD_E)-summitGridGround(x,z-GRAD_E))/(2*GRAD_E);return out;
}
/** Top-speed multiplier on a grade, hill assist included: rideSlopeScale, braked on steep descents, never under the crawl. */
export function hillSpeedScale(mode:TravelMode,grade:number){
 if(mode!=='scooter'&&mode!=='bike'&&mode!=='moped')return 1;
 let s=rideSlopeScale(mode,grade);if(grade<-DESCENT_BRAKE_FROM)s/=1+DESCENT_BRAKE*(-grade-DESCENT_BRAKE_FROM);
 return Math.max(s,RIDE_CRAWL[mode]/TRAVEL_MODES[mode].maxSpeed);
}
/** Per player: steer(mode, x, z, ix, iz) returns the stick turned across the slope where it points up a climb steeper than the
 *  limit (same length), the grade along the heading actually taken, and the top-speed multiplier for it. */
export function createHillAssist(){
 const g={gx:0,gz:0},out={x:0,z:0,grade:0,scale:1,assisted:false};let side=0;
 return {out,steer(mode:TravelMode,x:number,z:number,ix:number,iz:number){
  out.x=ix;out.z=iz;out.grade=0;out.scale=1;out.assisted=false;
  const il=Math.hypot(ix,iz);if(mode==='jetpack'||il<.01)return out;
  summitGradient(x,z,g);const m=Math.hypot(g.gx,g.gz);if(m<1e-6)return out;
  const dx=ix/il,dz=iz/il,lim=RIDE_MAX_CLIMB[mode];let grade=dx*g.gx+dz*g.gz;
  if(grade>lim){const nx=g.gx/m,nz=g.gz/m,along=dz*nx-dx*nz;// + = the contour to the right of uphill (−nz, nx)
   if(!side||Math.abs(along)>.2)side=along>=0?1:-1;
   const c=lim/m,s=Math.sqrt(Math.max(0,1-c*c)),tx=-nz*side,tz=nx*side;
   out.x=(c*nx+s*tx)*il;out.z=(c*nz+s*tz)*il;grade=lim;out.assisted=true;}
  else if(grade<lim*.7)side=0;
  out.grade=grade;out.scale=hillSpeedScale(mode,grade);return out;}};
}
/** Furthest the drawn ride may sit above or below its wheels' ground (m); under Town's 0.2 m stair-pose threshold. */
export const RIDE_SUSPENSION_TRAVEL=.18;
const SUSPENSION_W=25,SOFT=.08,PITCH_RATE=9,CLIMB_RATE=25;
/** The ride's drawn height and pitch on the slopes. update() returns the eased values; reset() snaps to the ground next frame. */
export function createRideSuspension(){
 let y=NaN,v=0,pitch=0,last=0,climb=0;const out={y:0,pitch:0};
 return {reset(){y=NaN;v=0;},
  update(dt:number,ground:number,slopePitch:number){
   if(!Number.isFinite(y)||Math.abs(y-ground)>1||!(dt>0)){if(!Number.isFinite(y))pitch=slopePitch;y=ground;v=climb=0;}
   else{// The spring acts on the offset from the ground and on the speed relative to its eased climb rate (so a steady climb has
    // no lag, and a kink in the ground is not passed straight through).
    const n=Math.max(1,Math.ceil(dt*240-1e-9)),h=dt/n,w2=SUSPENSION_W*SUSPENSION_W,c=2*SUSPENSION_W;climb+=((ground-last)/dt-climb)*(1-Math.exp(-dt*CLIMB_RATE));const gv=climb;
    for(let k=1;k<=n;k++){const g=last+(ground-last)*k/n,off=y-g,extra=Math.abs(off)>SOFT?(Math.abs(off)-SOFT)/(RIDE_SUSPENSION_TRAVEL-SOFT):0;
     const a=-w2*(1+6*extra*extra)*off-c*(v-gv);v+=a*h;y+=v*h;}// stiffer toward the end of its travel (a soft stop)
    if(y>ground+RIDE_SUSPENSION_TRAVEL){y=ground+RIDE_SUSPENSION_TRAVEL;v=Math.min(v,gv);}else if(y<ground-RIDE_SUSPENSION_TRAVEL){y=ground-RIDE_SUSPENSION_TRAVEL;v=Math.max(v,gv);}
    pitch+=(slopePitch-pitch)*(1-Math.exp(-dt*PITCH_RATE));}
   last=ground;
   out.y=y;out.pitch=pitch;return out;}};
}
