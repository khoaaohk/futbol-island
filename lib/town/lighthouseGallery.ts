/**
 * East Jetty lighthouse gallery (Oct 26 2026). The spiral stair added earlier that day was removed the same day (owner: it looked
 * too busy); what stays is the widened top: a 3.2 m gallery on a flared corbel with a white railing, which you reach by FLYING
 * (jetpack or parachute landing) and stand or walk round on. It is landing-only: you leave with Fly, or by walking out through
 * the one opening in the railing (west, over the plaza), which drops you to the plaza like any roof edge (rooftopTravel's fall).
 *
 * Physics, pure and allocation-free (rooftopTravel.ts, Town.tsx and tests/lighthouse-gallery.cjs call these):
 *  - lighthouseFloor(x, z, from): the gallery deck is a floor only for something already at its height (from + reach ≥ 13.6 m)
 *    or from the sky (over the lantern from the sky: the cap's top, so findLanding moves you onto the ring). -Infinity elsewhere,
 *    so at the plaza the lighthouse is a plain tower (its round footprint obstacle in eastPierWorld.ts).
 *  - lighthouseConstrain(): up on the gallery, keeps the rider between the lantern room and the railing, except through the opening.
 *  - lighthouseLanding(): a jetpack landing over the lighthouse lands on the gallery ring only (never on the lantern / in the tower).
 *  - lighthouseSolid(): the tower by height, the gallery and its railing (not the opening), for the ball and jet dashes.
 *  - lighthouseHides(): the tower hides the rider from the camera (the hidden-player marker shows).
 */
import {JETTY_BEACON} from './eastPier';

const TAU=Math.PI*2;
export const LIGHTHOUSE={
 cx:JETTY_BEACON.x,cz:JETTY_BEACON.z,
 /** The gallery railing's radius and the lantern room's collider radius on the gallery (m from the axis). */
 galleryR:3.2,lanternR:1.25,
 /** Gallery floor height; the cap's top (a landing from the sky over the lantern sees this floor). */
 top:13.6,capTop:16.8,
 /** The railing's one opening (the safe way down on foot): its centre bearing (radians: 0 = +x east, π = west, over the plaza
  *  where the walkway arrives) and half width (radians: 1.44 m of rail at 3.2 m). */
 openAt:Math.PI,openHalf:.225,
 /** Floor reach (step up per tick, m) and rail height (m). */
 reach:.6,railH:1,
 /** Ride top speed on the gallery (m/s): a 2 m wide ring. */
 maxRideSpeed:6.5,
 /** Tower: plinth radius / height, base and top radius, top height (eastPierWorld.ts draws the same numbers). */
 plinthR:3.05,plinthH:1,towerR0:JETTY_BEACON.r,towerTopR:1.35,towerTopY:13.4,
 /** Half size of the square of interest round the axis (the gallery plus a margin). */
 nearR:3.4,
} as const;
const L=LIGHTHOUSE;
const near=(dx:number,dz:number,pad:number)=>dx<=L.nearR+pad&&dx>=-L.nearR-pad&&dz<=L.nearR+pad&&dz>=-L.nearR-pad;
/** Is the bearing of (dx, dz) inside the railing's opening, shrunk by margin m (radians)? */
function inOpening(dx:number,dz:number,m=0){let a=Math.atan2(dz,dx)-L.openAt;a-=TAU*Math.round(a/TAU);return Math.abs(a)<=L.openHalf-m;}
/** True within the lighthouse's square of interest (plus `pad` m). */
export const nearLighthouse=(x:number,z:number,pad=1.5)=>near(x-L.cx,z-L.cz,pad);

/** The solid radius of the tower at height y (plinth, tapered tower, corbel under the gallery, gallery deck, lantern, cap). */
export function towerSolidRadius(y:number){
 if(y<-.5)return 0;if(y<L.plinthH)return L.plinthR;
 if(y<11.46)return L.towerR0-(L.towerR0-L.towerTopR)*(y-1)/12.4;
 if(y<13.36)return 1.5+(L.galleryR-.05-1.5)*(y-11.46)/1.9;
 if(y<L.top)return L.galleryR;if(y<15.35)return 1.12;if(y<16.65)return 1.35*(16.65-y)/1.3;if(y<L.capTop+.1)return .18;return 0;
}

/** The gallery floor at (x, z) for something at height `from`: 13.6 m within the railing when from + reach reaches it, the cap's
 *  top over the lantern from the sky, else -Infinity (the plaza and anything else decide). */
export function lighthouseFloor(x:number,z:number,from:number,reach:number=L.reach){
 const dx=x-L.cx,dz=z-L.cz;if(!near(dx,dz,0))return -Infinity;
 const r=Math.hypot(dx,dz);if(r>L.galleryR)return -Infinity;
 if(from===Infinity&&r<L.lanternR+.05)return L.capTop;
 return L.top<=from+reach?L.top:-Infinity;
}

/**
 * The gallery's railing and lantern wall: after a step from (fromX, fromZ) to p at height h, moves p back onto the ring a rider
 * of radius `rad` may stand on (or into the opening) and removes the velocity into the rail. Returns true when it moved p.
 * Only up at the gallery (h ≥ top − 0.3); a few sums, no allocation.
 */
export function lighthouseConstrain(fromX:number,fromZ:number,p:{x:number;z:number},v:{x:number;z:number},h:number,rad:number){
 if(h<L.top-.3)return false;
 const dx=p.x-L.cx,dz=p.z-L.cz;if(!near(dx,dz,rad+.1))return false;
 const r=Math.hypot(dx,dz)||1e-6,rMin=L.lanternR+rad,rMax=L.galleryR-rad;
 let R=r,cx=dx,cz=dz;
 if(r<rMin)R=rMin+1e-3;
 else if(r>rMax){
  if(inOpening(dx,dz,rad/r))return false;// walking out through the opening (the fall starts once past the deck's edge)
  const fx=fromX-L.cx,fz=fromZ-L.cz,fr=Math.hypot(fx,fz);
  // Coming from the opening's mouth sideways (already past the railing's line): slide back into the opening along the arc.
  if(fr>rMax-1e-3&&inOpening(fx,fz,rad/Math.max(fr,1e-6))){let a=Math.atan2(dz,dx)-L.openAt;a-=TAU*Math.round(a/TAU);const lim=L.openHalf-rad/r-1e-3,b=L.openAt+Math.max(-lim,Math.min(lim,a));cx=Math.cos(b)*r;cz=Math.sin(b)*r;}
  else R=rMax-1e-3;
 }else return false;
 if(R!==r){cx=dx/r*R;cz=dz/r*R;}
 const nx=cx-dx,nz=cz-dz,n=Math.hypot(nx,nz);
 p.x=L.cx+cx;p.z=L.cz+cz;
 if(n>1e-9){const vn=(v.x*nx+v.z*nz)/n;if(vn<0){v.x-=vn*nx/n;v.z-=vn*nz/n;}}
 return true;
}

/** Jetpack / parachute landing: null away from the lighthouse; near it, only the gallery ring from above (never in the tower or
 *  on the lantern). */
export function lighthouseLanding(x:number,z:number,from:number){
 const dx=x-L.cx,dz=z-L.cz;if(!near(dx,dz,.3))return null;
 const r=Math.hypot(dx,dz);if(r>L.galleryR+.3)return null;
 return from>=L.top-.5&&r>=L.lanternR+.5&&r<=L.galleryR-.5;
}

/** Solid for the ball and jet dashes at (x, y, z): the tower by height and the gallery's railing (not its opening). */
export function lighthouseSolid(x:number,z:number,y:number){
 const dx=x-L.cx,dz=z-L.cz;if(!near(dx,dz,.3)||y>L.capTop+.1)return false;
 const r=Math.hypot(dx,dz);if(r<towerSolidRadius(y))return true;
 return y>=L.top&&y<=L.top+L.railH+.05&&r>=L.galleryR-.12&&r<=L.galleryR+.06&&!inOpening(dx,dz);
}

function marchHidden(px:number,py:number,pz:number,ux:number,uy:number,uz:number){
 for(let s=.4;s<16;s+=.4){const x=px+ux*s,y=py+uy*s,z=pz+uz*s;if(Math.hypot(x-L.cx,z-L.cz)<towerSolidRadius(y))return true;}return false;
}
/** Is a point between the player (at height py) and the camera hidden by the tower? Both the hips and the head must be hidden
 *  (walkControl's occlusion rule). A short march toward the camera, only within ~9 m of the tower. */
export function lighthouseHides(px:number,py:number,pz:number,cx:number,cy:number,cz:number){
 if(!nearLighthouse(px,pz,5.5))return false;
 const hx=cx-px,hy=cy-py,hz=cz-pz,l=Math.hypot(hx,hy,hz)||1,ux=hx/l,uy=hy/l,uz=hz/l;
 return marchHidden(px,py+.7,pz,ux,uy,uz)&&marchHidden(px,py+1.55,pz,ux,uy,uz);
}
/** The tower's own round footprint obstacle (the plinth; eastPierWorld.ts): the ball and jet use lighthouseSolid instead. */
export const TOWER_FOOT_R=3.1;
export const isLighthouseTower=(o:{x:number;z:number;cornerRadius?:number})=>o.x===L.cx&&o.z===L.cz&&o.cornerRadius===TOWER_FOOT_R;
