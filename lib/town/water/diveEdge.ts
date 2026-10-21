/**
 * Seamless Explore (Oct 21 2026, user: "when diving and outside of the explore, allow swimming right into it. when in the explore and
 * exiting the boundary exit out and show diving outside ... without having to tap explore"). The zone's edge is a doorway both ways:
 *  - IN: duck-diving (under the water, waterState.ts DIVE) and crossing DIVE_EDGE.enterIn m inside a zone's blob (diveSpots.ts
 *    diveBlobR, the patch the Explore pill uses) enters that zone's reef room at the matching room point (island -> room: the layout's
 *    mapping, room = (island - centre) / scale, held DIVE_EDGE.placeIn m inside the room's rim), keeping the heading, speed and the
 *    shared breath;
 *  - OUT: in the room, swimming DIVE_EDGE.exitOut m past the rim (the blob outline in room metres, diveLayout.ts `outline`, capped at
 *    DIVE_EDGE.rimMax so the built room still surrounds it) leaves to the island DIVE_EDGE.landOut m outside the blob along the same
 *    bearing, still under the water (the duck-dive), heading on outward.
 * Hysteresis: in needs 1 m inside the blob, the way out drops you 3 m outside it (a 4 m swim back in), and the room's exit is 2 m past
 * a rim you arrive 1.5 m inside (3.5 m). Each crossing starts a DIVE_EDGE.cooldown s wait before the next, so swimming along the edge
 * never toggles.
 *
 * Pure: no three.js, no DOM, no allocation (out objects). Tests: tests/dive-edge.cjs.
 */
import {DIVE_ROOM_R,DIVE_SPOTS,diveBlobR,diveWreckIslandScale,type DiveSpot} from './diveSpots';

export const DIVE_EDGE={enterIn:1,placeIn:1.5,exitOut:2,landOut:3,cooldown:1.5,rimMax:DIVE_ROOM_R-2,
 /** The way out looks for water this many metres further along the bearing (in steps of `step`) when the first point will not do. */
 search:12,step:1.5,
 /** Below this breath (0..1) the edge does not take you in (the duck-dive is about to pop up anyway). */
 minBreath:.03} as const;
/** How the island's duck-dive depth (m under the swim line, waterState.ts DIVE.depth at most) maps onto the room's water column
 *  (diveSession.ts depthT): a deeper island dive arrives lower over the reef. */
export const DIVE_EDGE_DEPTH={top:.2,span:.4,islandMax:1.6} as const;

type Spot=Pick<DiveSpot,'id'|'x'|'z'|'radius'|'blob'>;
/** The room's rim at a bearing (room metres; angle = atan2(z, x), the same in both frames: island = centre + room × scale). */
export function diveEdgeRim(spot:Pick<DiveSpot,'radius'|'blob'>,angle:number){return Math.min(DIVE_EDGE.rimMax,diveBlobR(spot,angle)/diveWreckIslandScale(spot));}
/** How far (island m) a point is inside the zone's blob (negative: outside). One atan2 and three sines. */
export function diveEdgeInside(spot:Spot,x:number,z:number){const dx=x-spot.x,dz=z-spot.z;return diveBlobR(spot,Math.atan2(dz,dx))-Math.hypot(dx,dz);}
/** How far (room m) a room point is past the rim (negative: inside). */
export function diveEdgeBeyond(spot:Pick<DiveSpot,'radius'|'blob'>,x:number,z:number){return Math.hypot(x,z)-diveEdgeRim(spot,Math.atan2(z,x));}
/** The zone a diver at island (x, z) swims into: inside a blob by DIVE_EDGE.enterIn (a quick distance reject first), else null. */
export function diveEdgeSpotAt<S extends Spot>(x:number,z:number,spots:readonly S[]=DIVE_SPOTS as unknown as readonly S[]):S|null{
 for(const s of spots){const dx=x-s.x,dz=z-s.z,rm=s.radius*1.45;if(dx*dx+dz*dz>rm*rm)continue;if(diveEdgeInside(s,x,z)>=DIVE_EDGE.enterIn)return s;}
 return null;
}
const wrap=(a:number)=>Math.atan2(Math.sin(a),Math.cos(a));
/** Island -> room: where the diver arrives (room x, z) and the facing (forward = (sin yaw, cos yaw), both frames). The island point
 *  maps straight through (room = (island - centre) / scale), held DIVE_EDGE.placeIn m inside the rim; the heading carries on unless it
 *  points back out (arriving at the rim), then it turns inward. */
export function diveEdgeToRoom(spot:Spot,x:number,z:number,yaw:number,out:{x:number;z:number;yaw:number}={x:0,z:0,yaw:0}){
 const sc=diveWreckIslandScale(spot),dx=(x-spot.x)/sc,dz=(z-spot.z)/sc,r=Math.hypot(dx,dz),a=Math.atan2(dz,dx),lim=Math.max(0,diveEdgeRim(spot,a)-DIVE_EDGE.placeIn);
 const k=r>lim&&r>1e-6?lim/r:1;out.x=dx*k;out.z=dz*k;
 const ix=-Math.cos(a),iz=-Math.sin(a),atRim=k<1;
 out.yaw=atRim&&Math.sin(yaw)*ix+Math.cos(yaw)*iz<.2?Math.atan2(ix,iz):wrap(yaw);
 return out;
}
/** What the island offers at a point for the way out: 'dive' (deep enough to stay under: the duck-dive), 'swim' (water, too shallow to
 *  dive: come up and swim) or 'no' (land, a pier, another zone). */
export type DiveEdgeWater='dive'|'swim'|'no';
export type DiveEdgeExit={x:number;z:number;yaw:number;under:boolean};
/** Room -> island: the point DIVE_EDGE.landOut m outside the blob on the bearing the diver left by, facing on outward. If that point
 *  will not do (`water` says land or too shallow, or it is inside another zone with the margin), it looks further out along the bearing
 *  (DIVE_EDGE.search m); the first diveable point wins, else the first swimmable one (come up and swim), else the zone's buoy, at the
 *  surface. Two zones never hand the diver to each other: a point inside another zone's blob + landOut is skipped. */
export function diveEdgeToIsland(spot:Spot,rx:number,rz:number,yaw:number,water:(x:number,z:number)=>DiveEdgeWater,out:DiveEdgeExit={x:0,z:0,yaw:0,under:true},
 spots:readonly Spot[]=DIVE_SPOTS,buoy?:{x:number;z:number}){
 const a=Math.atan2(rz,rx),c=Math.cos(a),s=Math.sin(a),R=diveBlobR(spot,a);
 out.yaw=Math.sin(yaw)*c+Math.cos(yaw)*s<.2?Math.atan2(c,s):wrap(yaw);
 let swimX=NaN,swimZ=NaN;
 for(let d=DIVE_EDGE.landOut;d<=DIVE_EDGE.landOut+DIVE_EDGE.search+1e-6;d+=DIVE_EDGE.step){
  const x=spot.x+c*(R+d),z=spot.z+s*(R+d);let clash=false;
  for(const o of spots)if(o.id!==spot.id&&diveEdgeInside(o,x,z)>-DIVE_EDGE.landOut){clash=true;break;}
  if(clash)continue;const w=water(x,z);
  if(w==='dive'){out.x=x;out.z=z;out.under=true;return out;}
  if(w==='swim'&&Number.isNaN(swimX)){swimX=x;swimZ=z;}
 }
 if(!Number.isNaN(swimX)){out.x=swimX;out.z=swimZ;out.under=false;return out;}
 out.x=buoy?.x??spot.x;out.z=buoy?.z??spot.z;out.under=false;return out;
}
/** The island duck-dive depth (m) -> the room's water column place (depthT). */
export const diveEdgeDepthT=(islandDive:number)=>DIVE_EDGE_DEPTH.top+DIVE_EDGE_DEPTH.span*Math.max(0,Math.min(1,islandDive/DIVE_EDGE_DEPTH.islandMax));
