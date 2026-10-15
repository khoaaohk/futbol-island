/**
 * The Summit Isle activities' static props (Oct 12 2026): the Summit Kick start post by the pitch's gate. Built inside buildTown
 * like the island itself, so the pieces join the same 50 m static batches (no animation, no per-frame work) and their footprints
 * become obstacles. Placement is computed from summitIsle.ts at build time (lib/town/summitKick.ts kickLayout), the same function
 * the runtime (lib/graphics/summitActivities.ts) uses for its prompt. The lookout telescope's stand was removed (Oct 14 2026, user:
 * "let's remove the telescope entirely"); the zipline's tower stands on its spot (lib/town/ziplineWorld.ts).
 */
import * as T from 'three';
import type {Obstacle} from './simulation';
import {kickLayout} from './summitKick';
import {summitGround} from './summitIsle';
import {buildBallCannonProps} from './ballCannonWorld';

type Mesh=T.Mesh;
export type SummitActivityTools={
 box:(w:number,h:number,d:number,c:string,x:number,y:number,z:number)=>Mesh;
 cylinder:(r:number,h:number,c:string,x:number,y:number,z:number)=>Mesh;
 put:(g:T.BufferGeometry,c:string,x:number,y:number,z:number)=>Mesh;
 sign:(text:string,w:number,h:number,x:number,y:number,z:number,bg?:string,ink?:string,rotation?:number)=>Mesh;
 obstacles:Obstacle[];
};
const POST='#8b6a4a',GREEN='#294f43',SUNSET='#ef7d3c';

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
 // ---- The Ball Cannon above the north beach (Oct 14 2026, ballCannonWorld.ts): its deck, seat, barrel post and clay trap.
 const cannon=buildBallCannonProps({box,cylinder,put,obstacles});
 return {kickPost:k,cannon};
}
