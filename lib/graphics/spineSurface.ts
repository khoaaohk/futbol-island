import * as T from 'three';

export const LUMBAR_HEIGHT=.12, CHEST_HEIGHT=.32, SPINE_LIMIT=.18;
const ease=(x:number)=>{x=T.MathUtils.clamp(x,0,1);return x*x*(3-2*x);};
// Smooth skin weights: waist stays on the pelvis, upper shirt follows the chest.
// Signed joint samples approximate small rotations without per-frame vertex uploads.
// The same standard morph targets render individually, instanced, and in shadows.
function surface(female:boolean){
 const radii=female?[.155,.15,.16,.222,.205,.105]:[.145,.155,.175,.245,.225,.105];
 const heights=[0,.08,.23,.38,.43,.49],profile:T.Vector2[]=[];
 for(let i=0;i<heights.length-1;i++)for(let j=0;j<3;j++)profile.push(new T.Vector2(T.MathUtils.lerp(radii[i],radii[i+1],j/3),T.MathUtils.lerp(heights[i],heights[i+1],j/3)));
 profile.push(new T.Vector2(radii[5],heights[5]));
 const g=new T.LatheGeometry(profile,20);g.scale(1,1,.64);
 g.morphTargetsRelative=true;g.morphAttributes.position=[];g.morphAttributes.normal=[];
 const base=g.getAttribute('position'),normal=g.getAttribute('normal'),v=new T.Vector3(),rotated=new T.Vector3(),q=new T.Quaternion(),axis=new T.Vector3();
 for(let joint=0;joint<2;joint++)for(let a=0;a<3;a++)for(const sign of [1,-1]){
  const copy=g.clone(),pos=copy.getAttribute('position'),pivot=joint?CHEST_HEIGHT:LUMBAR_HEIGHT;
  axis.set(a===0?1:0,a===1?1:0,a===2?1:0);q.setFromAxisAngle(axis,sign*SPINE_LIMIT);
  for(let i=0;i<base.count;i++){
   v.fromBufferAttribute(base,i);const weight=joint?ease((v.y-.2)/.18):ease((v.y-.025)/.22);
   rotated.copy(v);rotated.y-=pivot;rotated.applyQuaternion(q);rotated.y+=pivot;v.lerp(rotated,weight);pos.setXYZ(i,v.x,v.y,v.z);
  }
  copy.computeVertexNormals();const n=copy.getAttribute('normal'),dp=new Float32Array(base.count*3),dn=new Float32Array(base.count*3);
  for(let i=0;i<base.count*3;i++){dp[i]=pos.array[i]-base.array[i];dn[i]=n.array[i]-normal.array[i];}
  g.morphAttributes.position.push(new T.Float32BufferAttribute(dp,3));g.morphAttributes.normal.push(new T.Float32BufferAttribute(dn,3));copy.dispose();
 }
 g.computeBoundingSphere();g.boundingSphere!.radius+=.12;
 return g;
}
let shared:{male:T.BufferGeometry;female:T.BufferGeometry;users:number}|undefined;
export function acquireSpineSurfaces(){
 if(!shared)shared={male:surface(false),female:surface(true),users:0};
 const entry=shared;entry.users++;
 return {male:entry.male,female:entry.female,dispose(){if(--entry.users===0){entry.male.dispose();entry.female.dispose();if(shared===entry)shared=undefined;}}};
}
export function applySpineSurface(mesh:T.Mesh,lumbar:T.Euler,chest:T.Euler){
 const weights=mesh.morphTargetInfluences!;
 for(let j=0;j<2;j++){const r=j?chest:lumbar;for(let a=0;a<3;a++){
  const angle=T.MathUtils.clamp(a===0?r.x:a===1?r.y:r.z,-SPINE_LIMIT,SPINE_LIMIT),i=j*6+a*2;
  weights[i]=Math.max(0,angle)/SPINE_LIMIT;weights[i+1]=Math.max(0,-angle)/SPINE_LIMIT;
 }}
}
