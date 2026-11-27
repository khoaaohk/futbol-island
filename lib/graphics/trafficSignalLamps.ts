// The lamps of every traffic signal on the island (Nov 18 2026): ONE instanced draw of flat six-sided discs, three per signal
// head, coloured through the instance colour. They replace the three always-lit lens cylinders per head that lived in the static
// chunk batches and their shadow batches (40 triangles each, now 4, and no shadow). Unlit (MeshBasicMaterial: cheaper than the
// standard material the lenses used), so a lit lamp reads by day and glows at night with no real light. Colours are uploaded only
// when a lamp changes (a few times per cycle); nothing here runs per frame. The lamps skip tone mapping and fog (less fragment work,
// and a lit lamp keeps its full colour: under the scene's ACES curve red washed out to salmon at night); at night the unlit lamps
// go darker so the lit one stands out. A kicked signal sways for under a second (lib/graphics/propReactions.ts): its three lamps
// follow through `sway` (three instance positions re-uploaded per frame of the sway, nothing otherwise).
import * as T from 'three';
import {softOn} from './softBox';
import {RED,YELLOW,GREEN,type SignalHead,type SignalLight} from '../town/trafficSignals';
const LIT=['#ff3b2f','#ffc21f','#2ff27c'],DIM=.13,DIM_NIGHT=.055;
export function createTrafficSignalLamps(scene:T.Scene,heads:readonly SignalHead[]){
 const shape=new T.Shape();for(let k=0;k<6;k++){const t=k/6*Math.PI*2;if(k)shape.lineTo(Math.cos(t)*.215,Math.sin(t)*.215);else shape.moveTo(.215,0);}
 const geometry=softOn()?new T.CircleGeometry(.215,14):new T.ShapeGeometry(shape),material=new T.MeshBasicMaterial({toneMapped:false,fog:false}),mesh=new T.InstancedMesh(geometry,material,Math.max(1,heads.length*3));
 mesh.name='traffic-signal-lamps';mesh.count=heads.length*3;mesh.castShadow=mesh.receiveShadow=false;mesh.matrixAutoUpdate=false;
 const lit=LIT.map(c=>new T.Color(c)),dim=lit.map(c=>c.clone().multiplyScalar(DIM)),base=new Float32Array(heads.length*9),moved={x:0,y:0,z:0},m=new T.Matrix4(),q=new T.Quaternion(),p=new T.Vector3(),one=new T.Vector3(1,1,1),up=new T.Vector3(0,1,0);
 /** What each head shows: RED / YELLOW / GREEN, or -1 for all dark (the off half of a flashing yellow). */
 const shown=new Int8Array(heads.length).fill(-2);
 heads.forEach((h,i)=>{q.setFromAxisAngle(up,h.yaw);for(let lamp=0;lamp<3;lamp++){p.set(0,.64-lamp*.64,.372).applyQuaternion(q);p.x+=h.x;p.y+=h.y;p.z+=h.z;base.set([p.x,p.y,p.z],(i*3+lamp)*3);mesh.setMatrixAt(i*3+lamp,m.compose(p,q,one));mesh.setColorAt(i*3+lamp,dim[lamp]);}});
 mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();mesh.computeBoundingBox();scene.add(mesh);
 const stats={uploads:0,sways:0};
 return {mesh,stats,shown,
  /** Top lamp red, middle yellow, bottom green. Returns true when the head changed. */
  set(index:number,light:SignalLight|-1){if(shown[index]===light)return false;shown[index]=light;
   mesh.setColorAt(index*3,light===RED?lit[0]:dim[0]);mesh.setColorAt(index*3+1,light===YELLOW?lit[1]:dim[1]);mesh.setColorAt(index*3+2,light===GREEN?lit[2]:dim[2]);return true;},
  /** Night: the unlit lamps darken (the lit ones are already at full colour). Repainted at the next paint. */
  setNight(night:boolean){const k=night?DIM_NIGHT:DIM;dim.forEach((c,i)=>c.copy(lit[i]).multiplyScalar(k));shown.fill(-2);},
  /** The head is swaying (a kicked signal): put its three lamps where `move` says their rest positions are now; null = back at rest. */
  sway(index:number,move:((x:number,y:number,z:number,out:{x:number;y:number;z:number})=>void)|null){const a=mesh.instanceMatrix.array;
   for(let k=index*3;k<index*3+3;k++){moved.x=base[k*3];moved.y=base[k*3+1];moved.z=base[k*3+2];if(move)move(moved.x,moved.y,moved.z,moved);a[k*16+12]=moved.x;a[k*16+13]=moved.y;a[k*16+14]=moved.z;}
   mesh.instanceMatrix.addUpdateRange(index*48,48);mesh.instanceMatrix.needsUpdate=true;stats.sways++;},
  /** Call once after a batch of set() calls that returned true. */
  commit(){if(mesh.instanceColor){mesh.instanceColor.needsUpdate=true;stats.uploads++;}},
  dispose(){mesh.removeFromParent();geometry.dispose();material.dispose();mesh.dispose();}};
}
