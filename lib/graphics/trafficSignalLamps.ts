// The lamps of every traffic signal on the island (Nov 18 2026): ONE instanced draw of flat six-sided discs, three per signal
// head, coloured through the instance colour. They replace the three always-lit lens cylinders per head that lived in the static
// chunk batches and their shadow batches (40 triangles each, now 4, and no shadow). Unlit (MeshBasicMaterial: cheaper than the
// standard material the lenses used), so a lit lamp reads by day and glows at night with no real light. Colours are uploaded only
// when a lamp changes (a few times per cycle); nothing here runs per frame.
import * as T from 'three';
import {RED,YELLOW,GREEN,type SignalHead,type SignalLight} from '../town/trafficSignals';
const LIT=['#ff4a3d','#ffc533','#3fe07f'],DIM=.13;
export function createTrafficSignalLamps(scene:T.Scene,heads:readonly SignalHead[]){
 const shape=new T.Shape();for(let k=0;k<6;k++){const t=k/6*Math.PI*2;if(k)shape.lineTo(Math.cos(t)*.215,Math.sin(t)*.215);else shape.moveTo(.215,0);}
 const geometry=new T.ShapeGeometry(shape),material=new T.MeshBasicMaterial(),mesh=new T.InstancedMesh(geometry,material,Math.max(1,heads.length*3));
 mesh.name='traffic-signal-lamps';mesh.count=heads.length*3;mesh.castShadow=mesh.receiveShadow=false;mesh.matrixAutoUpdate=false;
 const lit=LIT.map(c=>new T.Color(c)),dim=lit.map(c=>c.clone().multiplyScalar(DIM)),m=new T.Matrix4(),q=new T.Quaternion(),p=new T.Vector3(),one=new T.Vector3(1,1,1),up=new T.Vector3(0,1,0);
 /** What each head shows: RED / YELLOW / GREEN, or -1 for all dark (the off half of a flashing yellow). */
 const shown=new Int8Array(heads.length).fill(-2);
 heads.forEach((h,i)=>{q.setFromAxisAngle(up,h.yaw);for(let lamp=0;lamp<3;lamp++){p.set(0,.64-lamp*.64,.372).applyQuaternion(q);p.x+=h.x;p.y+=h.y;p.z+=h.z;mesh.setMatrixAt(i*3+lamp,m.compose(p,q,one));mesh.setColorAt(i*3+lamp,dim[lamp]);}});
 mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();mesh.computeBoundingBox();scene.add(mesh);
 const stats={uploads:0};
 return {mesh,stats,shown,
  /** Top lamp red, middle yellow, bottom green. Returns true when the head changed. */
  set(index:number,light:SignalLight|-1){if(shown[index]===light)return false;shown[index]=light;
   mesh.setColorAt(index*3,light===RED?lit[0]:dim[0]);mesh.setColorAt(index*3+1,light===YELLOW?lit[1]:dim[1]);mesh.setColorAt(index*3+2,light===GREEN?lit[2]:dim[2]);return true;},
  /** Call once after a batch of set() calls that returned true. */
  commit(){if(mesh.instanceColor){mesh.instanceColor.needsUpdate=true;stats.uploads++;}},
  dispose(){mesh.removeFromParent();geometry.dispose();material.dispose();mesh.dispose();}};
}
