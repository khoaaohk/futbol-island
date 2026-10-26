/**
 * East Jetty lighthouse spiral staircase (Oct 26 2026, owner: "the lighthouse needs a spiraling staircase up to the top").
 *
 * An open-tread iron-and-stone stair wraps the OUTSIDE of the tower: two full turns in a 1.6 m wide band (radius 3.3 → 4.9 m
 * from the tower's axis), from the plaza (south side, y 0) up to the gallery (y 13.6), then a short flat landing that opens onto
 * a widened gallery (radius 3.2 m, railed all round except that opening). Outside, not inside: the tower is only 2.3 → 1.35 m in
 * radius, too tight for a ride, and the fixed follow camera sees an outside stair.
 *
 * Physics, pure and allocation-free (rooftopTravel.ts, Town.tsx and the tests call these):
 *  - lighthouseFloor(x, z, from): a LEVEL-AWARE floor. The band overlaps itself in plan (two turns, plus the plaza under it), so
 *    the floor is the highest stair / gallery level no more than `reach` above `from` (the rider's own height; Infinity = from
 *    the sky). The ramp is continuous (rise 1.08 m per radian, grade ≈ 0.26 on the walking line): rides climb a smooth ramp while
 *    the drawn treads step ~0.17 m, so wheels never catch a riser and nothing launches.
 *  - lighthouseConstrain(): the rails. Projects the rider back into the allowed region at its height (band between the rails,
 *    gallery ring between the lantern and its railing, the opening between them, the landing's end wall), keeping the tangential
 *    velocity, so a ride slides along the curved rails without jitter. At plaza level the stair's side (where it is 0.45–2.4 m
 *    above the rider) is a wall; under a higher flight there is headroom to walk under.
 *  - createLighthouseAssist(): thumb-friendly steering. Once the stick picks a direction along the stair (up or down), holding it
 *    anywhere keeps following the helix (the radial part still picks a lane); a firm push the other way reverses. Rides are
 *    slowed on the climb and capped at LIGHTHOUSE_STAIRS.maxRideSpeed (the moped's 28 m/s would spin round a 4 m tower).
 *  - lighthouseLanding(): a jetpack landing over the lighthouse lands on the gallery ring only (never inside the tower, never on
 *    the stair band); lighthouseSolid(): the tower, corbel, gallery, lantern, treads and rails for the ball and jet dashes.
 */
import {JETTY_BEACON} from './eastPier';

const TAU=Math.PI*2;
export const LIGHTHOUSE_STAIRS={
 cx:JETTY_BEACON.x,cz:JETTY_BEACON.z,
 /** The stair band's inner and outer edge (m from the axis) and the gallery's railing radius. */
 rIn:3.3,rOut:4.9,galleryR:3.2,
 /** The lantern room's collider radius on the gallery. */
 lanternR:1.25,
 /** Gallery floor height; the cap's top (a landing from the sky over the lantern sees this floor). */
 top:13.6,capTop:16.8,
 /** Where the climb starts (bearing, radians: 0 = +x east, π/2 = +z south) and how many turns it takes; the climb runs toward
  *  increasing bearing (south → west → north → east), so it is above the keeper's hut (east) by 4.6 m. */
 theta0:Math.PI/2,turns:2,
 /** Flat landing at the top (radians of bearing) and how far before it the gallery's railing opens (radians). */
 landing:.6,openBefore:.25,
 /** Floor reach (step up per tick, m), the height where rails start (m), headroom under the stair (m), rail height (m). */
 reach:.6,upFrom:.45,head:2.4,railH:1,
 /** Ride top speed on the stair (m/s). */
 maxRideSpeed:6.5,
 /** Tower: plinth radius / height, base and top radius, top height (eastPierWorld.ts draws the same numbers). */
 plinthR:3.05,plinthH:1,towerR0:JETTY_BEACON.r,towerTopR:1.35,towerTopY:13.4,
} as const;
const L=LIGHTHOUSE_STAIRS;
/** Bearing span of the climb, of the climb plus the landing, and the rise per radian of bearing. */
export const STAIR_SPAN=L.turns*TAU,STAIR_END=STAIR_SPAN+L.landing,STAIR_RISE=L.top/STAIR_SPAN;
/** The stair's walking height at bearing parameter φ (0 at the foot, STAIR_SPAN at the top, flat to STAIR_END). */
export const stairHeight=(phi:number)=>phi<=0?0:phi>=STAIR_SPAN?L.top:phi*STAIR_RISE;
/** First bearing parameter where the side rails stand (the stair is upFrom high there). */
export const STAIR_RAIL_FROM=L.upFrom/STAIR_RISE;
const near=(dx:number,dz:number,pad:number)=>dx<=L.rOut+pad&&dx>=-L.rOut-pad&&dz<=L.rOut+pad&&dz>=-L.rOut-pad;
/** Bearing parameter of a point in [0, 2π): its bearing minus theta0. */
function base(dx:number,dz:number){let a=Math.atan2(dz,dx)-L.theta0;a%=TAU;if(a<0)a+=TAU;return a;}
/** Is bearing parameter p0 (in [0, 2π)) inside the gallery's opening (the landing plus openBefore), shrunk by margin m (rad)? */
function inOpening(p0:number,m=0){for(let p=p0;p<=STAIR_END+1e-6;p+=TAU)if(p>=STAIR_SPAN-L.openBefore+m&&p<=STAIR_END-m)return true;return false;}
/** True within the lighthouse's square of interest (the stair band plus `pad` m). */
export const nearLighthouse=(x:number,z:number,pad=1.5)=>near(x-L.cx,z-L.cz,pad);

/** The solid radius of the tower at height y (plinth, tapered tower, corbel under the gallery, gallery deck, lantern, cap). */
export function towerSolidRadius(y:number){
 if(y<-.5)return 0;if(y<L.plinthH)return L.plinthR;
 if(y<11.46)return L.towerR0-(L.towerR0-L.towerTopR)*(y-1)/12.4;
 if(y<13.36)return 1.5+(L.galleryR-.05-1.5)*(y-11.46)/1.9;
 if(y<L.top)return L.galleryR;if(y<15.35)return 1.12;if(y<16.65)return 1.35*(16.65-y)/1.3;if(y<L.capTop+.1)return .18;return 0;
}

/**
 * The stair / gallery floor at (x, z) for something at height `from`: the highest level ≤ from + reach, or -Infinity where the
 * lighthouse has none (the plaza and anything else decide). From the sky (Infinity) over the lantern: the cap's top.
 */
export function lighthouseFloor(x:number,z:number,from:number,reach:number=L.reach){
 const dx=x-L.cx,dz=z-L.cz;if(!near(dx,dz,0))return -Infinity;
 const r=Math.hypot(dx,dz);if(r>L.rOut)return -Infinity;
 const lim=from+reach,p0=base(dx,dz);
 if(r<L.rIn){
  if(from===Infinity&&r<L.lanternR+.05)return L.capTop;
  return (r<L.galleryR||inOpening(p0))&&L.top<=lim?L.top:-Infinity;
 }
 let best=-Infinity;for(let p=p0;p<=STAIR_END+1e-6;p+=TAU){const h=stairHeight(p);if(h<=lim&&h>best)best=h;}
 return best;
}

/** Bearing parameter of the stair level nearest height h at bearing parameter p0 (−1 when no level is within `within` m). */
function levelNear(p0:number,h:number,within:number){let best=-1,d=within;for(let p=p0;p<=STAIR_END+1e-6;p+=TAU){const e=Math.abs(stairHeight(p)-h);if(e<=d){d=e;best=p;}}return best;}

/** Plaza level: is the stair's side a wall at (dx, dz) for a walker at height h (a level 0.45–2.4 m above it)? */
function groundWall(dx:number,dz:number,h:number){
 const p0=base(dx,dz);for(let p=p0;p<=STAIR_END+1e-6;p+=TAU){const k=stairHeight(p)-h;if(k>L.upFrom&&k<L.head)return true;}return false;
}
/** Up on the stair or gallery (height h > upFrom): may a rider of radius rad stand at (dx, dz) from the axis? */
function allowedUp(dx:number,dz:number,h:number,rad:number){
 const r=Math.hypot(dx,dz);if(r<L.lanternR+rad||r>L.rOut-rad)return false;
 const p0=base(dx,dz);
 if(h>=L.top-.3){if(r<=L.galleryR-rad)return true;if(inOpening(p0,rad/r))return true;}
 if(r<L.rIn+rad)return false;
 const p=levelNear(p0,h,.35);return p>=0&&p<=STAIR_END-rad/r;
}

/**
 * The rails: after a step from (fromX, fromZ) to p at height h, moves p back into the region a rider of radius `rad` may stand in
 * and removes the velocity component into the rail. Returns true when it moved p. A few polar sums; no allocation.
 */
// Best projection candidate so far (module scratch: no allocation per call).
let candX=0,candZ=0,candD=Infinity;
function tryCandidate(cx:number,cz:number,dx:number,dz:number,h:number,rad:number){
 if(!allowedUp(cx,cz,h,rad))return;const d=(cx-dx)*(cx-dx)+(cz-dz)*(cz-dz);if(d<candD){candD=d;candX=cx;candZ=cz;}
}
function tryArc(R:number,dx:number,dz:number,h:number,rad:number){
 let a=L.theta0+STAIR_END-rad/R-1e-3;tryCandidate(Math.cos(a)*R,Math.sin(a)*R,dx,dz,h,rad);
 a=L.theta0+STAIR_SPAN-L.openBefore+rad/R+1e-3;tryCandidate(Math.cos(a)*R,Math.sin(a)*R,dx,dz,h,rad);
}
export function lighthouseConstrain(fromX:number,fromZ:number,p:{x:number;z:number},v:{x:number;z:number},h:number,rad:number){
 const dx=p.x-L.cx,dz=p.z-L.cz;if(!near(dx,dz,rad+.1))return false;
 const r=Math.hypot(dx,dz)||1e-6,ux=dx/r,uz=dz/r;
 if(h<=L.upFrom){
  if(r<=L.rIn-rad||r>=L.rOut+rad||!groundWall(dx,dz,h))return false;
  const R=L.rOut+rad+.01;candX=ux*R;candZ=uz*R;
 }else{
  if(allowedUp(dx,dz,h,rad))return false;
  candD=Infinity;
  // Radially into the band, or (at the top) into the gallery ring; along the arc to the landing's end wall or the opening's edges.
  const Rb=Math.min(L.rOut-rad-1e-3,Math.max(L.rIn+rad+1e-3,r));tryCandidate(ux*Rb,uz*Rb,dx,dz,h,rad);
  if(h>=L.top-.3){const Rg=Math.min(L.galleryR-rad-1e-3,Math.max(L.lanternR+rad+1e-3,r));tryCandidate(ux*Rg,uz*Rg,dx,dz,h,rad);}
  tryArc(r,dx,dz,h,rad);tryArc(Rb,dx,dz,h,rad);
  if(candD===Infinity){candX=fromX-L.cx;candZ=fromZ-L.cz;}
 }
 const nx=candX-dx,nz=candZ-dz,n=Math.hypot(nx,nz);
 p.x=L.cx+candX;p.z=L.cz+candZ;
 if(n>1e-9){const vn=(v.x*nx+v.z*nz)/n;if(vn<0){v.x-=vn*nx/n;v.z-=vn*nz/n;}}
 return true;
}

/** True on the climbing band itself (from its first tread to just under the gallery), at height h. */
export function onLighthouseStair(x:number,z:number,h:number){
 const dx=x-L.cx,dz=z-L.cz;if(!near(dx,dz,.1)||h<=.02||h>=L.top-.3)return false;
 const r=Math.hypot(dx,dz);return r>=L.rIn-.05&&r<=L.rOut+.05;
}

/**
 * Thumb-friendly steering on the stair. steer() returns the stick turned along the helix (same length) once a direction is
 * chosen, plus the grade along it (rise per metre, + uphill); `on` false leaves the stick alone (off the stair, at the top,
 * stick released). One per player.
 */
export function createLighthouseAssist(){
 // dir: +1 up, -1 down, 0 none yet; (refX, refZ): the stick's direction when it last agreed with dir. A stick held still never
 // reverses (half a turn on, it points against the travel); one turned well away from that and now pointing back does.
 let dir=0,refX=0,refZ=0;const out={x:0,z:0,grade:0,on:false};
 return {out,reset(){dir=0;},steer(x:number,z:number,h:number,ix:number,iz:number){
  out.x=ix;out.z=iz;out.grade=0;out.on=false;
  const il=Math.hypot(ix,iz);if(il<.05||!onLighthouseStair(x,z,h)){dir=0;return out;}
  const dx=x-L.cx,dz=z-L.cz,r=Math.hypot(dx,dz),nx=dx/r,nz=dz/r,tx=-nz,tz=nx,along=(ix*tx+iz*tz)/il,radial=(ix*nx+iz*nz)/il,sx=ix/il,sz=iz/il;
  if(dir&&along*dir<-.3&&sx*refX+sz*refZ<-.2)dir=0;
  if(!dir){if(Math.abs(along)<.25)return out;dir=along>0?1:-1;}
  if(along*dir>0){refX=sx;refZ=sz;}
  const ox=tx*dir+nx*radial*.35,oz=tz*dir+nz*radial*.35,l=Math.hypot(ox,oz);
  out.x=ox/l*il;out.z=oz/l*il;out.grade=dir*STAIR_RISE/r;out.on=true;return out;}};
}

/** Jetpack / parachute landing: null away from the lighthouse; near it, only the gallery ring from above (never in the tower,
 *  on the lantern or on the stair band). */
export function lighthouseLanding(x:number,z:number,from:number){
 const dx=x-L.cx,dz=z-L.cz;if(!near(dx,dz,.3))return null;
 const r=Math.hypot(dx,dz);if(r>L.rOut+.3)return null;
 return from>=L.top-.5&&r>=L.lanternR+.5&&r<=L.galleryR-.5;
}

/** Solid for the ball and jet dashes at (x, y, z): the tower, the gallery's railing (not its opening), the treads (a 0.45 m
 *  slab under each level) and the stair's rails. */
export function lighthouseSolid(x:number,z:number,y:number){
 const dx=x-L.cx,dz=z-L.cz;if(!near(dx,dz,.3)||y>L.capTop+.1)return false;
 const r=Math.hypot(dx,dz);if(r<towerSolidRadius(y))return true;
 if(r>L.rOut+.1)return false;
 const p0=base(dx,dz);
 if(y>=L.top&&y<=L.top+L.railH+.05&&r>=L.galleryR-.12&&r<=L.galleryR+.06&&!inOpening(p0))return true;
 if(r<L.rIn-.08)return false;
 for(let p=p0;p<=STAIR_END+.05;p+=TAU){const h=stairHeight(Math.min(p,STAIR_END));
  if(p<=STAIR_END&&r>=L.rIn&&r<=L.rOut&&y>=h-.45&&y<h)return true;
  if(y<h||y>h+L.railH+.05||p<STAIR_RAIL_FROM)continue;
  if(r>=L.rOut-.12&&p<=STAIR_END)return true;// outer rail
  if(r<=L.rIn+.12&&p<=STAIR_SPAN-L.openBefore)return true;// inner rail (open onto the gallery at the top)
  if(p>=STAIR_END-.12/r&&r>=L.rIn)return true;}// the landing's end rail
 return false;
}

function marchHidden(px:number,py:number,pz:number,ux:number,uy:number,uz:number){
 for(let s=.4;s<16;s+=.4){const x=px+ux*s,y=py+uy*s,z=pz+uz*s;if(Math.hypot(x-L.cx,z-L.cz)<towerSolidRadius(y))return true;}return false;
}
/** Is a point between the player (at height py) and the camera hidden by the tower? Both the hips and the head must be hidden
 *  (walkControl's occlusion rule). A short march toward the camera, only within 9 m of the tower. */
export function lighthouseHides(px:number,py:number,pz:number,cx:number,cy:number,cz:number){
 if(!nearLighthouse(px,pz,4))return false;
 const hx=cx-px,hy=cy-py,hz=cz-pz,l=Math.hypot(hx,hy,hz)||1,ux=hx/l,uy=hy/l,uz=hz/l;
 return marchHidden(px,py+.7,pz,ux,uy,uz)&&marchHidden(px,py+1.55,pz,ux,uy,uz);
}
/** The tower's own footprint obstacle (eastPierWorld.ts): the ball and jet use lighthouseSolid instead. */
export const TOWER_FOOT_R=3.1;
export const isLighthouseTower=(o:{x:number;z:number;cornerRadius?:number})=>o.x===L.cx&&o.z===L.cz&&o.cornerRadius===TOWER_FOOT_R;
