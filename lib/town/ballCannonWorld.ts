/**
 * The Ball Cannon's static prop (Summit Isle, Oct 14 2026; rules: lib/town/ballCannon.ts): a round timber deck on the grass above
 * the north beach with an orange bucket seat on a post, the barrel's iron post and ball joint in front of it, a crate of footballs,
 * and the clay trap a few metres to the left (it throws away from the sandbar) with a stack of discs. Built inside buildTown from summitActivitiesWorld.ts with the
 * island's palette tools, so every piece joins the same 50 m static paint batches (no new draw call, no animation, no per-frame
 * work) and the footprints become obstacles. The barrel itself turns, so it is the one piece the runtime draws
 * (lib/graphics/ballCannon.ts: one small mesh).
 */
import * as T from 'three';
import type {Obstacle} from './simulation';
import {cannonLayout,CANNON} from './ballCannon';
import {summitGround} from './summitIsle';

type Mesh=T.Mesh;
export type BallCannonTools={
 box:(w:number,h:number,d:number,c:string,x:number,y:number,z:number)=>Mesh;
 cylinder:(r:number,h:number,c:string,x:number,y:number,z:number)=>Mesh;
 put:(g:T.BufferGeometry,c:string,x:number,y:number,z:number)=>Mesh;
 obstacles:Obstacle[];
};
/** The island palette (summitActivitiesWorld.ts): timber, green, yellow, iron, sunset orange, cream. */
export const CANNON_COLORS={timber:'#8b6a4a',deck:'#b98f62',green:'#294f43',yellow:'#e9c75f',iron:'#3b4744',seat:'#ef7d3c',cream:'#fff3df',clay:'#ef7d3c'} as const;

export function buildBallCannonProps(t:BallCannonTools){
 const {box,cylinder,put,obstacles}=t,L=cannonLayout(),C=CANNON_COLORS;
 const fx=Math.sin(L.seat.yaw),fz=Math.cos(L.seat.yaw),rx=-fz,rz=fx,yaw=L.seat.yaw;
 const at=(x:number,z:number,ahead:number,right:number)=>({x:x+fx*ahead+rx*right,z:z+fz*ahead+rz*right});
 // ---- The deck: a level round timber platform on a stone footing reaching down to the lowest ground under it.
 {let lo=Infinity;for(let a=0;a<8;a++)lo=Math.min(lo,summitGround(L.x+Math.cos(a*Math.PI/4)*CANNON.baseR,L.z+Math.sin(a*Math.PI/4)*CANNON.baseR));lo-=.08;
  const foot=put(new T.CylinderGeometry(CANNON.baseR+.05,CANNON.baseR+.12,L.deck-.08-lo,14),'#878b7e',L.x,(L.deck-.08+lo)/2,L.z);foot.castShadow=false;
  put(new T.CylinderGeometry(CANNON.baseR,CANNON.baseR,.12,18),C.deck,L.x,L.deck-.04,L.z);
  // A yellow swivel ring round the deck's edge (the turret's track).
  const ring=put(new T.TorusGeometry(CANNON.baseR-.08,.035,4,24),C.yellow,L.x,L.deck+.03,L.z);ring.rotation.x=Math.PI/2;ring.castShadow=false;}
 // ---- The seat: a post, an orange bucket (pan, back, two arms) facing out to sea, a footrest.
 {const s=L.seat,top=s.ground+CANNON.seatY;
  cylinder(.09,top-.08-L.deck,C.iron,s.x,(top-.08+L.deck)/2,s.z);
  const pan=box(.66,.1,.56,C.seat,s.x,top-.05,s.z);pan.rotation.y=yaw;
  const b=at(s.x,s.z,-.3,0),back=box(.66,.62,.1,C.seat,b.x,top+.26,b.z);back.rotation.set(0,yaw,0);back.rotateX(-.16);
  for(const side of [-1,1]){const a=at(s.x,s.z,-.02,side*.36),arm=box(.08,.22,.5,C.seat,a.x,top+.08,a.z);arm.rotation.y=yaw;}
  const h=at(s.x,s.z,-.36,0),head=box(.44,.1,.12,C.cream,h.x,top+.6,h.z);head.rotation.y=yaw;
  const f=at(s.x,s.z,.42,0),rest=box(.5,.06,.18,C.iron,f.x,L.deck+.2,f.z);rest.rotation.y=yaw;}
 // ---- The barrel's post and ball joint (the barrel, drawn by the runtime, turns about the joint).
 {const j=L.joint;cylinder(.1,j.y-.12-L.deck,C.iron,j.x,(j.y-.12+L.deck)/2,j.z);
  put(new T.CylinderGeometry(.2,.26,.12,12),C.green,j.x,L.deck+.06,j.z);
  put(new T.SphereGeometry(.16,10,8),C.yellow,j.x,j.y,j.z);}
 // ---- A crate of footballs on the deck's left side.
 {const c=at(L.x,L.z,-.15,-1.75),g=summitGround(c.x,c.z),crate=box(.56,.36,.44,C.deck,c.x,g+.18,c.z);crate.rotation.y=yaw;
  for(const [a,r] of [[-.12,-.1],[.1,.12],[.0,-.02]] as const){const p=at(c.x,c.z,a,r),ball=put(new T.SphereGeometry(.15,10,8),C.cream,p.x,g+.48+(a===0?.1:0),p.z);ball.castShadow=false;}
  obstacles.push({x:c.x,z:c.z,w:.6,d:.6});}
 obstacles.push({x:L.x,z:L.z,w:CANNON.baseR*2,d:CANNON.baseR*2,cornerRadius:CANNON.baseR});
 // ---- The clay trap: an iron box on legs, the throwing arm cocked toward the sea, a stack of orange discs on top.
 {const q=L.trap,g=q.ground,qx=Math.sin(q.yaw),qz=Math.cos(q.yaw);
  const body=box(.62,.34,.5,C.green,q.x,g+.5,q.z);body.rotation.y=q.yaw;
  for(const [a,r] of [[-.18,-.22],[-.18,.22],[.18,-.22],[.18,.22]] as const){const p={x:q.x+qx*a+qz*r,z:q.z+qz*a-qx*r};cylinder(.04,.36,C.iron,p.x,summitGround(p.x,p.z)+.17,p.z);}
  const arm=box(.08,.06,.62,C.yellow,q.x+qx*.18,g+.75,q.z+qz*.18);arm.rotation.set(0,q.yaw,0);arm.rotateX(-.45);
  for(let k=0;k<4;k++){const d=put(new T.CylinderGeometry(CANNON.discR,CANNON.discR*.86,.05,12),C.clay,q.x-qx*.12,g+.7+k*.055,q.z-qz*.12);d.castShadow=false;}
  const lever=box(.05,.42,.05,C.iron,q.x-qx*.3+qz*.22,g+.86,q.z-qz*.3-qx*.22);lever.rotation.y=q.yaw;
  obstacles.push({x:q.x,z:q.z,w:.8,d:.8});}
 return {cannon:{x:L.x,z:L.z},trap:{x:L.trap.x,z:L.trap.z}};
}
