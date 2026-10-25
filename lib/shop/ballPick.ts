/**
 * Ball studio · Draw step picking and edge turn (Oct 24 2026, docs/BALL_STUDIO_AUDIT_OCT24.md P0.4). Pure math, no three.js,
 * so the node tests run it for real.
 *
 *  - pickSphere: the unit ball under a camera ray. Off the silhouette (up to `maxR` ball radii from the centre) the pick is
 *    clamped to the rim the camera actually sees (the tangent point, nudged 0.02 rad to the front so the ink shows), so a
 *    stroke that slides off the edge keeps painting along the rim instead of lifting the pen.
 *  - edgeTurnRate: while painting in the outer 15% of the radius (or past the rim) the ball turns toward the finger at up to
 *    1.4 rad/s, eased in over 200 ms, so a line can go all the way round. Reduced motion: the studio never asks for it.
 */
export type V3=[number,number,number];
export const EDGE_IN=.85,EDGE_MAX_RATE=1.4,EDGE_EASE_MS=200,RIM_MAX=1.3;
const dot=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const nrm=(a:V3):V3=>{const l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l];};

/** World-space hit of the ray o + t·d (d unit) on the unit sphere at c. `r` is the ray's miss distance from the centre in
 *  ball radii (≈ the screen distance / R; ≤ 1 on the ball), `rim` says the point was clamped. null past `maxR`. */
export function pickSphere(o:V3,d:V3,c:V3,maxR=1):{dir:V3;r:number;rim:boolean}|null{
 const oc:V3=[o[0]-c[0],o[1]-c[1],o[2]-c[2]],b=dot(oc,d),L2=dot(oc,oc),m2=Math.max(0,L2-b*b),r=Math.sqrt(m2);
 if(m2<=1&&b<0){const t=-b-Math.sqrt(1-m2);return {dir:nrm([oc[0]+d[0]*t,oc[1]+d[1]*t,oc[2]+d[2]*t]),r,rim:false};}
 if(r>maxR||b>=0||L2<=1)return null;
 // The silhouette point in the plane of the camera, the centre and the ray: acos(1/D) from the camera axis, toward the ray.
 const D=Math.sqrt(L2),u:V3=[oc[0]/D,oc[1]/D,oc[2]/D],p:V3=[oc[0]-d[0]*b,oc[1]-d[1]*b,oc[2]-d[2]*b],pu=dot(p,u);
 const w=nrm([p[0]-u[0]*pu,p[1]-u[1]*pu,p[2]-u[2]*pu]),a=Math.acos(Math.min(1,1/D))-.02,ca=Math.cos(a),sa=Math.sin(a);
 return {dir:[u[0]*ca+w[0]*sa,u[1]*ca+w[1]*sa,u[2]*ca+w[2]*sa],r,rim:true};}

/** Turn speed (rad/s) for a finger `r` ball radii from the centre that has been in the edge zone for `ms`. */
export function edgeTurnRate(r:number,ms:number):number{if(!(r>EDGE_IN))return 0;
 const k=Math.min(1,(r-EDGE_IN)/(1-EDGE_IN)),e=Math.min(1,Math.max(0,ms)/EDGE_EASE_MS);return EDGE_MAX_RATE*k*e*e;}

/** Axis and angle that turn the world direction w toward the camera direction v by at most `max` radians (null: already there). */
export function turnTowardAxis(w:V3,v:V3,max:number):{axis:V3;angle:number}|null{
 const x:V3=[w[1]*v[2]-w[2]*v[1],w[2]*v[0]-w[0]*v[2],w[0]*v[1]-w[1]*v[0]],s=Math.hypot(x[0],x[1],x[2]);if(s<1e-6||max<=0)return null;
 return {axis:[x[0]/s,x[1]/s,x[2]/s],angle:Math.min(max,Math.atan2(s,dot(w,v)))};}
