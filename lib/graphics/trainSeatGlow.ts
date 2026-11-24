/**
 * Island Line Gameplay 3: the free seats glow softly as you walk past them (trainRide.ts glows: up to the 8 player seats of your
 * train). ONE additive InstancedMesh (a soft round patch on the cushion, a radial canvas texture built once), drawn only while a seat
 * glows: +1 draw call while you stand in a train, nothing otherwise. No per-frame allocation, no animation of its own (the glow eases
 * in trainRide as you come near; the nearest seat in reach, the one Sit takes, is the brightest).
 */
import * as T from 'three';
import {BENCH_X,BENCH_TOP,CAR_FLOOR_Y} from '../town/trainCarModel';
import {RIDER_ROOT_X} from '../town/trainRunning';

const MAX=8,SIZE=.62,COL=new T.Color('#ffd877');
/** From the rider's root (on the floor, facing out of the window) to the cushion's middle, and its height over the floor. */
const OUT=BENCH_X-RIDER_ROOT_X,UP=BENCH_TOP-CAR_FLOOR_Y+.015;
export type SeatGlow={x:number;y:number;z:number;yaw:number;w:number};
export function createTrainSeatGlow(scene:T.Scene){
 let mesh:T.InstancedMesh|null=null;const m=new T.Matrix4(),q=new T.Quaternion(),p=new T.Vector3(),sc=new T.Vector3(SIZE,SIZE,SIZE),c=new T.Color(),flat=new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0),-Math.PI/2),yq=new T.Quaternion(),up=new T.Vector3(0,1,0);
 function build(){
  const cv=document.createElement('canvas');cv.width=cv.height=64;const g=cv.getContext('2d')!;const gr=g.createRadialGradient(32,32,2,32,32,31);
  gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.55,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);
  const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;
  const mat=new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false,fog:false});
  mesh=new T.InstancedMesh(new T.PlaneGeometry(1,1),mat,MAX);mesh.name='train-seat-glow';mesh.frustumCulled=false;mesh.renderOrder=3;mesh.count=0;
  mesh.instanceColor=new T.InstancedBufferAttribute(new Float32Array(MAX*3),3);scene.add(mesh);
 }
 return {
  /** Every frame while riding: the glowing seats (w 0 … 1); nothing glows: the mesh hides (no draw). */
  update(glows:readonly SeatGlow[]|null){
   let n=0;if(glows)for(const g of glows)if(g.w>0)n++;
   if(!n){if(mesh)mesh.visible=false;return;}
   if(!mesh)build();const M=mesh!;n=0;
   for(const g of glows!){if(g.w<=0||n>=MAX)continue;const sx=Math.sin(g.yaw),sz=Math.cos(g.yaw);
    p.set(g.x+sx*OUT,g.y+UP,g.z+sz*OUT);yq.setFromAxisAngle(up,g.yaw);q.copy(yq).multiply(flat);m.compose(p,q,sc);M.setMatrixAt(n,m);
    c.copy(COL).multiplyScalar(.85*g.w);M.setColorAt(n,c);n++;}
   M.count=n;M.visible=true;M.instanceMatrix.needsUpdate=true;if(M.instanceColor)M.instanceColor.needsUpdate=true;
  },
  dispose(){if(!mesh)return;mesh.removeFromParent();mesh.geometry.dispose();const mat=mesh.material as T.MeshBasicMaterial;mat.map?.dispose();mat.dispose();mesh=null;},
 };
}
