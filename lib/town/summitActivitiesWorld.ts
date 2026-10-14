/**
 * The Summit Isle activities' static props (Oct 12 2026): the Summit Kick start post by the pitch's gate and the lookout
 * telescope (a coin-operated seaside viewer on a stand) beside the summit cairn. Built inside buildTown like the island itself,
 * so the pieces join the same 50 m static batches (no animation, no per-frame work) and their footprints become obstacles.
 * Placement is computed from summitIsle.ts at build time (lib/town/summitKick.ts kickLayout, lib/town/telescope.ts
 * telescopeSpot), the same functions the runtime (lib/graphics/summitActivities.ts) uses for its prompts.
 */
import * as T from 'three';
import type {Obstacle} from './simulation';
import {kickLayout} from './summitKick';
import {telescopeSpot} from './telescope';
import {summitGround} from './summitIsle';

type Mesh=T.Mesh;
export type SummitActivityTools={
 box:(w:number,h:number,d:number,c:string,x:number,y:number,z:number)=>Mesh;
 cylinder:(r:number,h:number,c:string,x:number,y:number,z:number)=>Mesh;
 put:(g:T.BufferGeometry,c:string,x:number,y:number,z:number)=>Mesh;
 sign:(text:string,w:number,h:number,x:number,y:number,z:number,bg?:string,ink?:string,rotation?:number)=>Mesh;
 obstacles:Obstacle[];
};
const POST='#8b6a4a',GREEN='#294f43',YELLOW='#e9c75f',IRON='#3b4744',SUNSET='#ef7d3c';

export function buildSummitActivityProps(t:SummitActivityTools){
 const {box,cylinder,put,sign,obstacles}=t;
 // ---- Summit Kick start post: a timber post, a sunset-orange hoop on top and a sign facing the trail (south).
 const k=kickLayout().post,kg=summitGround(k.x,k.z);
 cylinder(.08,2.3,POST,k.x,kg+1.15,k.z);
 sign('SUMMIT KICK',1.7,.5,k.x,kg+1.72,k.z+.1,GREEN,'#ffd27a');
 {const ring=put(new T.TorusGeometry(.32,.06,6,18),SUNSET,k.x,kg+2.62,k.z);ring.castShadow=false;}
 box(.5,.36,.4,'#b98f62',k.x+.55,kg+.18,k.z+.2);// the ball crate
 for(const [dx,dz] of [[.42,.12],[.66,.3]] as const){const b=put(new T.SphereGeometry(.17,10,8),'#fff3df',k.x+dx,kg+.53,k.z+dz);b.castShadow=false;}
 obstacles.push({x:k.x,z:k.z,w:.3,d:.3},{x:k.x+.55,z:k.z+.2,w:.55,d:.45});
 // ---- Lookout telescope: base plate, post, swivel and the binocular head (yellow, like seaside viewers), facing out to sea.
 const s=telescopeSpot(),g=s.ground,yaw=s.yaw;
 box(.7,.12,.7,IRON,s.x,g+.06,s.z);
 cylinder(.08,1.05,GREEN,s.x,g+.62,s.z);
 cylinder(.15,.12,IRON,s.x,g+1.18,s.z);
 const head=box(.42,.34,.52,YELLOW,s.x,g+1.4,s.z);head.rotation.y=yaw;
 const hood=box(.46,.08,.56,GREEN,s.x,g+1.6,s.z);hood.rotation.y=yaw;
 // Two lenses forward (toward the sea) and two eyepieces behind.
 const fx=Math.sin(yaw),fz=Math.cos(yaw),rx=Math.cos(yaw),rz=-Math.sin(yaw);
 for(const side of [-1,1]){
  const lens=put(new T.CylinderGeometry(.075,.075,.16,10),IRON,s.x+fx*.33+rx*side*.11,g+1.43,s.z+fz*.33+rz*side*.11);lens.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(fx,0,fz));
  const eye=put(new T.CylinderGeometry(.05,.05,.1,8),'#1d2b28',s.x-fx*.31+rx*side*.1,g+1.45,s.z-fz*.31+rz*side*.1);eye.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(fx,0,fz));
 }
 obstacles.push({x:s.x,z:s.z,w:.55,d:.55});
 return {kickPost:k,telescope:{x:s.x,z:s.z}};
}
