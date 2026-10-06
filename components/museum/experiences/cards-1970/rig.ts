/**
 * cards-1970 · a tiny side-view silhouette rig (no dependencies, so tests/museum-exp-cards-1970.cjs can run it in Node).
 * A figure is a hip, a torso and head, two arms (upper + fore) and two legs (thigh + shin + foot), posed with joint angles.
 * Every limb angle is in degrees from "pointing straight down", positive = swung toward the way the figure faces; the second
 * number of a pair is the bend added for the lower segment (knees bend back: negative; elbows bend forward: positive).
 * The rig grounds itself: whatever the pose, its lowest point rests on the ground (minus `lift` for jumps), so a run bobs, a
 * slide sits on the hip and a fall lies flat without hand-placed heights. "L" limbs are the far side (drawn first, lighter).
 */
export type Limb=readonly [number,number];
export type Pose={lean:number;head?:number;aL:Limb;aR:Limb;lL:Limb;lR:Limb};
export type Key={t:number;x:number;lift?:number;pose:Pose};
export type Pt=readonly [number,number];
export type Rig={hip:Pt;shoulder:Pt;head:Pt;far:{elbow:Pt;hand:Pt;knee:Pt;ankle:Pt;toe:Pt};near:{elbow:Pt;hand:Pt;knee:Pt;ankle:Pt;toe:Pt}};

export const BODY={torso:58,neck:5,head:12,upperArm:28,foreArm:26,thigh:40,shin:40,foot:13,sole:5};
export const GROUND=330;

const RAD=Math.PI/180;
const add=(a:Pt,b:Pt):Pt=>[a[0]+b[0],a[1]+b[1]];

/** Solve a pose at x (hip), facing dir, standing on `ground`. */
export function solve(p:Pose,x:number,lift:number,dir:1|-1,ground=GROUND):Rig{
 const v=(a:number,l:number):Pt=>[Math.sin(a*RAD)*dir*l,Math.cos(a*RAD)*l];
 const up=(a:number,l:number):Pt=>[Math.sin(a*RAD)*dir*l,-Math.cos(a*RAD)*l];
 const shoulder=up(p.lean,BODY.torso),head=add(shoulder,up(p.lean+(p.head??0),BODY.neck+BODY.head));
 const arm=(a:Limb)=>{const elbow=add(shoulder,v(a[0],BODY.upperArm));return {elbow,hand:add(elbow,v(a[0]+a[1],BODY.foreArm))};};
 const leg=(l:Limb)=>{const knee=v(l[0],BODY.thigh),ankle=add(knee,v(l[0]+l[1],BODY.shin));return {knee,ankle,toe:add(ankle,v(l[0]+l[1]+90,BODY.foot))};};
 const far={...arm(p.aL),...leg(p.lL)},near={...arm(p.aR),...leg(p.lR)};
 const pts:Pt[]=[[0,0],shoulder,[head[0],head[1]+BODY.head],far.elbow,far.hand,far.knee,far.ankle,far.toe,near.elbow,near.hand,near.knee,near.ankle,near.toe];
 const lowest=Math.max(...pts.map(q=>q[1]));
 const o:Pt=[x,ground-BODY.sole-lowest-lift],m=(q:Pt)=>add(q,o);
 const mm=(s:typeof far)=>({elbow:m(s.elbow),hand:m(s.hand),knee:m(s.knee),ankle:m(s.ankle),toe:m(s.toe)});
 return {hip:o,shoulder:m(shoulder),head:m(head),far:mm(far),near:mm(near)};
}

const smooth=(u:number)=>u*u*(3-2*u);
const lerp=(a:number,b:number,u:number)=>a+(b-a)*u;
const lerpL=(a:Limb,b:Limb,u:number):Limb=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)];
/** The figure's pose at time t: x moves linearly between keys, the joints ease (smoothstep). */
export function sample(keys:readonly Key[],t:number):{x:number;lift:number;pose:Pose}{
 if(t<=keys[0].t)return {x:keys[0].x,lift:keys[0].lift??0,pose:keys[0].pose};
 for(let i=0;i<keys.length-1;i++){const a=keys[i],b=keys[i+1];if(t<b.t){const u=(t-a.t)/(b.t-a.t),s=smooth(u),pa=a.pose,pb=b.pose;
  return {x:lerp(a.x,b.x,u),lift:lerp(a.lift??0,b.lift??0,s),pose:{lean:lerp(pa.lean,pb.lean,s),head:lerp(pa.head??0,pb.head??0,s),aL:lerpL(pa.aL,pb.aL,s),aR:lerpL(pa.aR,pb.aR,s),lL:lerpL(pa.lL,pb.lL,s),lR:lerpL(pa.lR,pb.lR,s)}};}}
 const z=keys[keys.length-1];return {x:z.x,lift:z.lift??0,pose:z.pose};
}
/** The ball (x, height above the ground) at time t, linear between keys. */
export function sampleBall(keys:readonly {t:number;x:number;y:number}[],t:number){
 if(t<=keys[0].t)return keys[0];
 for(let i=0;i<keys.length-1;i++){const a=keys[i],b=keys[i+1];if(t<b.t){const u=(t-a.t)/(b.t-a.t);return {t,x:lerp(a.x,b.x,u),y:lerp(a.y,b.y,u)};}}
 return keys[keys.length-1];
}
