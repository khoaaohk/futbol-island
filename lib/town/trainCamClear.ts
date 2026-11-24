/**
 * The ride camera's clearance (Island Line polish, Nov 24 2026; AAA audit #8: the portrait ride camera sat inside a station house's
 * roof on the platform side). Pure (no three.js): a few analytic volumes the camera must stay out of, and a spring-arm march from the
 * rider's head to the wanted camera spot that says how far along that line the camera may go.
 *  - station houses: the tiled hip roof (soffit to tiles, eaves out over the platform) and the house walls under it, plus a margin
 *    (the platform under the eaves stays open: the camera may stand there, like someone waiting for the train);
 *  - the Summit tunnel: outside the tube (walls ±TUNNEL_HALF_WIDTH to the springing, a half-round crown) between the portal planes;
 *  - the ground (Town passes fieldSurfaceHeight: Summit Isle's hill and its cutting banks), except inside the tube;
 *  - the South Bridge's pony trusses: a lift, not a pull-in (the truss is open lattice: looking through it is fine, sitting in it is not).
 * No allocation; ~20 point tests a frame while riding (each: 5 station boxes + one track hash lookup + the ground).
 */
import {TRAIN_STATIONS,TUNNEL_BED,TUNNEL_HALF_WIDTH,SOUTH_BRIDGE,trackAt,trackNearest,leftNormal,inTunnelS,bedAt} from './trainTrack';
import {trainLayout,stationHouseFront,STATION_HOUSE_DEPTH,stationSpot} from './trainLayout';

/** Clearance kept from every surface (m); station boxes reach CLEAR_U further along the line so the arm comes in before the eave. */
export const CLEAR_M=.5,CLEAR_U=1.5,CLEAR_STEPS=20;
/** trainWorld.ts buildStation's roof: eaves ±ROOF_EW along the line, hd/2 + ROOF_ED out from the house middle, ROOF_Y0 over the
 *  platform top at the eave, rising ROOF_RISE to the ridge. trainWorld.ts bridgeTruss: TRUSS_OFFSET out, TRUSS_H over the bed. */
export const ROOF_EW=4.8,WALL_U=4,ROOF_ED=1.25,ROOF_Y0=2.9+.14,ROOF_RISE=1.9,TRUSS_OFFSET=2.05,TRUSS_H=2.5;
/** Tube: walls to SPRING over the bed, then a half round of TUNNEL_HALF_WIDTH (trainWorld.ts portalArch / the tube profile). */
const SPRING=2.4;

const HOUSES=TRAIN_STATIONS.map(st=>{const c=trackAt(st.s),n=leftNormal(c.tx,c.tz),hd=STATION_HOUSE_DEPTH(st),hv0=stationHouseFront(st);
 return {x:c.x,z:c.z,tx:c.tx,tz:c.tz,nx:n.x*st.side,nz:n.z*st.side,top:stationSpot(st,0,0).y,hm:hv0+hd/2,hd,ed:hd/2+ROOF_ED};});

export type Ground=((x:number,z:number)=>number)|null|undefined;
/** Is (x, y, z) inside (or within CLEAR_M of) something the camera must not enter? */
export function camBlocked(x:number,y:number,z:number,ground?:Ground){
 for(const h of HOUSES){const dx=x-h.x,dz=z-h.z,u=dx*h.tx+dz*h.tz;if(Math.abs(u)>ROOF_EW+CLEAR_M+CLEAR_U)continue;
  const w=Math.abs(dx*h.nx+dz*h.nz-h.hm);if(w>h.ed+CLEAR_M)continue;
  // the roof (a solid from its flat soffit up to the tiles) and, under it, the walls (the platform under the eaves stays open)
  if(y>h.top+ROOF_Y0-CLEAR_M&&y<h.top+ROOF_Y0+ROOF_RISE*Math.max(0,Math.min(1,1-w/h.ed))+CLEAR_M)return true;
  if(w<h.hd/2+CLEAR_M&&Math.abs(u)<WALL_U+CLEAR_M+CLEAR_U&&y<h.top+ROOF_Y0&&y>h.top-1)return true;}
 const hit=trackNearest(x,z,12);
 if(hit&&inTunnelS(hit.s)){const r=TUNNEL_HALF_WIDTH-CLEAR_M,yy=y-TUNNEL_BED,d=hit.d;
  // inside the tube: free (the hill's ground is overhead here); anywhere else between the portals is rock
  return !(d<r&&yy>.2&&(yy<SPRING||d*d+(yy-SPRING)*(yy-SPRING)<r*r));}
 return !!ground&&y<ground(x,z)+CLEAR_M;
}

/** Beside a station house (its side of the line, along its length plus a CEIL_RAMP m run-in) the ride camera comes down under the
 *  eaves before the arm is worked out: a person on the platform looking in through the window, not a close-up from inside the car.
 *  Returns the weight (0 … 1, smooth in x, z: no pop) and the height to come down to; `out.w` 0 almost everywhere. */
export const CEIL_RAMP=6;
export function camCeiling(x:number,z:number,out={w:0,y:0}){out.w=0;
 for(const h of HOUSES){const dx=x-h.x,dz=z-h.z,u=Math.abs(dx*h.tx+dz*h.tz),e=ROOF_EW+CLEAR_M+CLEAR_U;if(u>e+CEIL_RAMP)continue;
  const v=dx*h.nx+dz*h.nz;if(v<1||v>h.hm+h.ed+8)continue;const a=u<=e?1:1-(u-e)/CEIL_RAMP,b=Math.min(1,(v-1)/2),k=a*b,w=k*k*(3-2*k);
  if(w>out.w){out.w=w;out.y=h.top+ROOF_Y0-CLEAR_M-.15;}}
 return out;
}

/** How far (0.15 … 1) along head → camera the camera may stand: the last clear sample before the first blocked one. */
export function camClearFraction(px:number,py:number,pz:number,cx:number,cy:number,cz:number,ground?:Ground){
 const ex=cx-px,ey=cy-py,ez=cz-pz;
 for(let i=1;i<=CLEAR_STEPS;i++){const f=i/CLEAR_STEPS;if(camBlocked(px+ex*f,py+ey*f,pz+ez*f,ground))return Math.max(.15,(i-1)/CLEAR_STEPS);}
 return 1;
}

/** The South Bridge's trusses: how far (m) to lift a camera at (x, y, z) so it clears the top chord (0 almost everywhere). Smooth in
 *  x, z (full lift within 0.3 m of a truss plane, none past 0.9 m; eased over the last metre of each span end), so it never pops. */
export function trussLift(x:number,y:number,z:number){
 const hit=trackNearest(x,z,4);if(!hit)return 0;const a=SOUTH_BRIDGE.spanA,b=SOUTH_BRIDGE.spanB;if(hit.s<a-1||hit.s>b+1)return 0;
 const off=Math.abs(hit.d-TRUSS_OFFSET),wv=off<.3?1:off>.9?0:1-(off-.3)/.6,ws=Math.min(1,Math.max(0,Math.min(hit.s-(a-1),b+1-hit.s)));
 const want=bedAt(trainLayout().profile,hit.s)+TRUSS_H+.35;if(y>=want)return 0;const e=wv*ws;return (want-y)*e*e*(3-2*e);
}
