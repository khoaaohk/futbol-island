// The ball in the Summit tunnel (Tunnel ball, Nov 27 2026; owner: "kicking the ball while walking in the tunnel doesn't work. the ball
// should be bouncing all around with the correct physics"). The island ball (walkBall.ts, ISLAND_SHOT: same kick / pass / shot /
// dribble, gravity, drag, bounces) runs unchanged in the bore; this module only gives it the bore's shapes, as cheap analytic tests:
//  - the floor: tunnelWalk.floorAt across the bore (sleepers, a smooth hump over each rail, ballast, gutter, walkway) while the ball is
//    inside the bore's cross-section (from the sleeve's outer end at each mouth), whoever is near: never the hill over it;
//  - the kerb: a step up the ball cannot roll up (more than STEP_UP over its foot) is a wall (blocked → walkBall's wall bounce);
//  - the lining: vertical walls to the arch's springing, then the half-round arch (trainWorld buildLitTube's profile). A sweep that
//    leaves the section from inside returns the contact on the lining (ball radius inside it) with the inward normal and the island's
//    wall restitution (ISLAND_SHOT.wallBounce), so a kick ricochets off the walls and a lob drops off the crown;
//  - the train: a free ball on the track as a train's front reaches it is knocked on ahead and off to the nearer walkway (cartoon).
// Pure maths, no allocation (pooled outputs). Out of the mouths the island's own floor / solids take over (the hill face is summitSolid).
import {TUNNEL_BED,TUNNEL_HALF_WIDTH,leftNormal,wrapS} from './trainTrack';
import {floorAt,tunnelSpot,SPRING,WALKWAY_KERB,WALKWAY_TOP} from './tunnelWalk';

/** The ball's radius (ISLAND_SHOT.radius); the lining's restitution (ISLAND_SHOT.wallBounce: the island's wall bounce). */
export const BALL_R=.2,LINING_E=.78;
/** The lined bore starts this far out of each mouth (the stone sleeve; tunnelWalk ENTER_U). */
export const SLEEVE_U=-1.3;
/** A floor step higher than this over the ball's foot is a wall to it (the walkway kerb, 0.36 m); a rail's hump (0.14) rolls over. */
export const STEP_UP=.2;
/** Over this (m above the bed) a point is not in the bore (the hill over it): the crown + a margin. */
const TOP=SPRING+TUNNEL_HALF_WIDTH+.5;

const R=TUNNEL_HALF_WIDTH-BALL_R;
/** Is the ball centre (x, y, z) inside the bore (length from the sleeve's outer ends, the section, under the crown)? */
export function inBore(x:number,y:number,z:number){const f=tunnelSpot(x,z,TUNNEL_HALF_WIDTH);if(!f||f.u<SLEEVE_U)return false;const h=y-TUNNEL_BED;
 return h>-1&&h<TOP&&f.d<TUNNEL_HALF_WIDTH;}
/** The bore's floor under (x, z) (world y, the ball's foot), or NaN off the bore. */
export function boreFloor(x:number,z:number){const f=tunnelSpot(x,z,TUNNEL_HALF_WIDTH);return f&&f.u>=SLEEVE_U?TUNNEL_BED+floorAt(f.d):NaN;}
/** The kerb: moving the ball (centre y) to (x, z) in the bore climbs a step it cannot roll up. */
export function boreStep(x:number,z:number,y:number){const g=boreFloor(x,z);return g===g&&g+BALL_R>y+STEP_UP;}

export type BoreHit={x:number;y:number;z:number;t:number;nx:number;ny:number;nz:number;e:number;part:'wall'|'crown'};
const hit:BoreHit={x:0,y:0,z:0,t:1,nx:0,ny:0,nz:0,e:LINING_E,part:'wall'};
/** Inside the section (ball centre, lateral |v| and height h over the bed). */
const inSection=(v:number,h:number,r=R)=>h<=SPRING?v<=r:v*v+(h-SPRING)**2<=r*r;
/** The lining: a step from `from` (inside the bore) to `to` that leaves the section returns the contact (pooled) with the inward
 *  normal, else null. Only steps that start inside and head outward (the ball is never pushed in from the hill). */
export function boreSweep(from:{x:number;y:number;z:number},to:{x:number;y:number;z:number}):BoreHit|null{
 const a=tunnelSpot(from.x,from.z,TUNNEL_HALF_WIDTH);if(!a||a.u<SLEEVE_U)return null;const ah=from.y-TUNNEL_BED;if(ah>TOP||!inSection(a.d,ah,R+.05))return null;
 const b=tunnelSpot(to.x,to.z,TUNNEL_HALF_WIDTH+2);if(!b||b.u<SLEEVE_U)return null;// out of the mouth: the island's own world
 const h=to.y-TUNNEL_BED,v=b.d;if(inSection(v,h))return null;
 const n=leftNormal(b.tx,b.tz),sx=n.x*b.side,sz=n.z*b.side;// outward across the bore at `to`
 let ox:number,oy:number;// outward unit in (across, up)
 if(h<=SPRING){ox=1;oy=0;hit.part='wall';}else{const l=Math.hypot(v,h-SPRING)||1;ox=v/l;oy=(h-SPRING)/l;hit.part='crown';}
 const nx=-sx*ox,ny=-oy,nz=-sz*ox;
 // heading outward? (the step's displacement against the inward normal)
 if((to.x-from.x)*nx+(to.y-from.y)*ny+(to.z-from.z)*nz>=0)return null;
 const cv=ox*R,ch=hit.part==='wall'?Math.min(h,SPRING):SPRING+oy*R;
 hit.x=b.cx+sx*cv;hit.z=b.cz+sz*cv;hit.y=TUNNEL_BED+Math.max(ch,floorAt(Math.min(R,cv))+BALL_R);hit.nx=nx;hit.ny=ny;hit.nz=nz;hit.e=LINING_E;hit.t=1;return hit;}

/** Leftovers A2 (owner 214 / 215, Nov 27 2026: "don't allow going through the wall for body and ball", "same with the ledge"): after
 *  every ball step (free or dribbled) a ball in the bore is held out of the lining (its centre ≥ BALL_R inside the wall / arch) and
 *  out of the walkway's kerb face (a ball under the walkway's top stays BALL_R clear of the kerb on the track side), its velocity into
 *  the face reflected (the island's wall bounce). Returns true when it moved the ball. A few float ops, near the Summit only. */
export function boreResolve(b:{x:number;y:number;z:number;vx:number;vy?:number;vz:number}):boolean{
 const f=tunnelSpot(b.x,b.z,TUNNEL_HALF_WIDTH+1);if(!f||f.u<SLEEVE_U)return false;const h=b.y-TUNNEL_BED;if(h<-1||h>TOP)return false;
 let d=f.d;const kerbIn=WALKWAY_KERB-BALL_R;
 if(h-BALL_R<WALKWAY_TOP-.02&&d>kerbIn&&d<WALKWAY_KERB+.05)d=kerbIn;// under the walkway's top: in front of the kerb face, never in it
 let lim=R;if(h>SPRING){const k=h-SPRING;lim=k<R?Math.sqrt(R*R-k*k):0;}if(d>lim)d=lim;// the lining at the ball's own height
 if(Math.abs(d-f.d)<1e-6)return false;
 const n=leftNormal(f.tx,f.tz),sx=n.x*f.side,sz=n.z*f.side;b.x=f.cx+sx*d;b.z=f.cz+sz*d;
 const out=b.vx*sx+b.vz*sz,inward=d<f.d;if(inward&&out>0){const k=(1+LINING_E)*out;b.vx-=k*sx;b.vz-=k*sz;}else if(!inward&&out<0){const k=(1+LINING_E)*out;b.vx-=k*sx;b.vz-=k*sz;}
 return true;}
/** The train knock: a free ball on the track (lateral under KNOCK_D, under the roof) as a train's front reaches it. Trains run +s. */
export const KNOCK_D=1.4+BALL_R+.1,KNOCK_TOP=4.9,KNOCK_LEAD=.08;
const knock={vx:0,vy:0,vz:0,train:-1};
/** The knock-on velocity (pooled) for a ball at (x, y, z) when a train's front reaches it this frame, else null. len: train length. */
export function trainKnock(trains:ArrayLike<{s:number;v:number}>,x:number,y:number,z:number,len:number){
 const f=tunnelSpot(x,z,TUNNEL_HALF_WIDTH);if(!f||f.u<SLEEVE_U-3||f.d>=KNOCK_D||y-TUNNEL_BED>KNOCK_TOP)return null;
 for(let i=0;i<trains.length;i++){const t=trains[i];if(t.v<.5)continue;const pre=Math.max(.6,t.v*KNOCK_LEAD),past=wrapS(t.s-f.s+pre);if(past>=len+pre)continue;
  // ahead of the nose at a little over the train's speed, off to the nearer walkway, a hop (it bounces on along the bore)
  const n=leftNormal(f.tx,f.tz),side=f.side||1,ahead=t.v*1.25+2;knock.vx=f.tx*ahead+n.x*side*6;knock.vz=f.tz*ahead+n.z*side*6;knock.vy=4.5;knock.train=i;return knock;}
 return null;}
