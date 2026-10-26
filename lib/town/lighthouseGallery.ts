/**
 * East Jetty lighthouse gallery (Oct 26 2026). The spiral stair added earlier that day was removed the same day (owner: it looked
 * too busy); what stays is the widened top: a 3.2 m gallery on a flared corbel with a white railing, closed all round except a
 * gate where a straight ladder arrives (lighthouseLadder.ts). Up by the ladder or by flying (jetpack or parachute landing); down
 * by the ladder (at the gate: push out or tap Climb down) or with Fly. The lantern room sits on a short watch room, so the lamp
 * (and the beam's apex, LIGHTHOUSE.lampY) is well above the railing's top: the beam never crosses the railing or the deck.
 *
 * Physics, pure and allocation-free (rooftopTravel.ts, Town.tsx and tests/lighthouse-gallery.cjs call these):
 *  - lighthouseFloor(x, z, from): the gallery deck is a floor only for something already at its height (from + reach ≥ 13.6 m)
 *    or from the sky (over the lantern from the sky: the cap's top, so findLanding moves you onto the ring). -Infinity elsewhere,
 *    so at the plaza the lighthouse is a plain tower (its round footprint obstacle in eastPierWorld.ts).
 *  - lighthouseConstrain(): up on the gallery, keeps the rider between the lantern room and the railing (the gate too: you leave
 *    through it on the ladder, never by walking off).
 *  - lighthouseLanding(): a jetpack landing over the lighthouse lands on the gallery ring only (never on the lantern / in the tower).
 *  - lighthouseSolid(): the tower by height, the gallery and its railing (not the gate), for the ball and jet dashes.
 *  - lighthouseHides(): the tower hides the rider from the camera (the hidden-player marker shows).
 */
import {JETTY_BEACON} from './eastPier';

const TAU=Math.PI*2;
export const LIGHTHOUSE={
 cx:JETTY_BEACON.x,cz:JETTY_BEACON.z,
 /** The gallery railing's radius and the lantern room's collider radius on the gallery (m from the axis). */
 galleryR:3.2,lanternR:1.25,
 /** Gallery floor height; the cap's top (a landing from the sky over the lantern sees this floor). */
 top:13.6,capTop:17.8,
 /** The lamp's height (the lantern glass's middle, the beam's apex): 1 m above the railing's top (14.6 m). */
 lampY:15.6,
 /** The railing's gate where the ladder arrives (lighthouseLadder.ts): its bearing (radians: 0 = +x east, π/2 = +z south; the
  *  tower's camera side) and half width (radians: 0.9 m at 3.2 m). */
 openAt:1.05,openHalf:.14,
 /** The ladder's rails: their plane (m from the axis, just outside the deck), half their spacing, their top above the deck (m). */
 ladderR:3.42,ladderHalf:.24,ladderAbove:1.05,
 /** Floor reach (step up per tick, m) and rail height (m). */
 reach:.6,railH:1,
 /** Ride top speed on the gallery (m/s): a 2 m wide ring. */
 maxRideSpeed:6.5,
 /** Tower: plinth radius / height, base and top radius, top height (eastPierWorld.ts draws the same numbers). */
 plinthR:3.05,plinthH:1,towerR0:JETTY_BEACON.r,towerTopR:1.35,towerTopY:13.4,
 /** Half size of the square of interest round the axis (the gallery plus a margin). */
 nearR:3.6,
} as const;
const L=LIGHTHOUSE;
const near=(dx:number,dz:number,pad:number)=>dx<=L.nearR+pad&&dx>=-L.nearR-pad&&dz<=L.nearR+pad&&dz>=-L.nearR-pad;
/** Is the bearing of (dx, dz) inside the railing's gate, shrunk by margin m (radians)? */
function inOpening(dx:number,dz:number,m=0){let a=Math.atan2(dz,dx)-L.openAt;a-=TAU*Math.round(a/TAU);return Math.abs(a)<=L.openHalf-m;}
/** True within the lighthouse's square of interest (plus `pad` m). */
export const nearLighthouse=(x:number,z:number,pad=1.5)=>near(x-L.cx,z-L.cz,pad);

/** The solid radius of the tower at height y (plinth, tapered tower, corbel under the gallery, gallery deck, lantern, cap). */
export function towerSolidRadius(y:number){
 if(y<-.5)return 0;if(y<L.plinthH)return L.plinthR;
 if(y<11.46)return L.towerR0-(L.towerR0-L.towerTopR)*(y-1)/12.4;
 if(y<13.36)return 1.5+(L.galleryR-.05-1.5)*(y-11.46)/1.9;
 if(y<L.top)return L.galleryR;if(y<16.35)return 1.12;if(y<17.65)return 1.35*(17.65-y)/1.3;if(y<L.capTop+.1)return .18;return 0;
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
 * The gallery's railing and lantern wall: after a step to p at height h, moves p back onto the ring a rider of radius `rad` may
 * stand on and removes the velocity into the rail. Returns true when it moved p. The gate is closed to walking (the ladder,
 * lighthouseLadder.ts, takes you through it).
 * Only up at the gallery (h ≥ top − 0.3); a few sums, no allocation.
 */
export function lighthouseConstrain(_fromX:number,_fromZ:number,p:{x:number;z:number},v:{x:number;z:number},h:number,rad:number){
 if(h<L.top-.3)return false;
 const dx=p.x-L.cx,dz=p.z-L.cz;if(!near(dx,dz,rad+.1))return false;
 const r=Math.hypot(dx,dz)||1e-6,rMin=L.lanternR+rad,rMax=L.galleryR-rad;
 if(r>=rMin&&r<=rMax)return false;
 const R=r<rMin?rMin+1e-3:rMax-1e-3,cx=dx/r*R,cz=dz/r*R;
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

/** Solid for the ball and jet dashes at (x, y, z): the tower by height, the gallery's railing (not its gate) and the ladder (a thin
 *  slab over its width, plaza to its handles: a ball cannot pass between the rungs). */
export function lighthouseSolid(x:number,z:number,y:number){
 const dx=x-L.cx,dz=z-L.cz;if(!near(dx,dz,.5)||y>L.capTop+.1)return false;
 const r=Math.hypot(dx,dz);if(r<towerSolidRadius(y))return true;
 if(y>=L.top&&y<=L.top+L.railH+.05&&r>=L.galleryR-.12&&r<=L.galleryR+.06&&!inOpening(dx,dz))return true;
 if(y<0||y>L.top+L.ladderAbove+.05)return false;
 const ux=Math.cos(L.openAt),uz=Math.sin(L.openAt),out=dx*ux+dz*uz,side=-dx*uz+dz*ux;
 return out>L.ladderR-.1&&out<L.ladderR+.1&&Math.abs(side)<L.ladderHalf+.08;
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
