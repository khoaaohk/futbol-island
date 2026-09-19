import * as T from 'three';
type Ball={x:number;z:number;vx:number;vz:number;life:number;heldBy:number};
/** Six balls share one fixed trail pool and one draw call. */
export function createKnockoutBallTrails(parent:T.Group){
 const geometry=new T.IcosahedronGeometry(1,0),material=new T.MeshBasicMaterial({color:'#fff5db',transparent:true,opacity:.55,depthWrite:false,toneMapped:false});
 const mesh=new T.InstancedMesh(geometry,material,72);mesh.name='knockout-ball-trails';mesh.count=0;mesh.visible=false;mesh.frustumCulled=false;mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);parent.add(mesh);
 const tracks=Array.from({length:6},()=>({x:NaN,z:NaN,cursor:0,credit:0}));
 const particles=Array.from({length:72},()=>({x:0,z:0,age:1,size:0}));const dummy=new T.Object3D();
 function reset(){for(const p of particles)p.age=1;for(const t of tracks){t.x=t.z=NaN;t.credit=0;}mesh.count=0;mesh.visible=false;}
 return {mesh,reset,update(dt:number,balls:Ball[],reduced:boolean){
  if(dt<=0)return;
  for(let i=0;i<Math.min(6,balls.length);i++){
   const b=balls[i],track=tracks[i],distance=Math.hypot(b.x-track.x,b.z-track.z),speed=Math.hypot(b.vx,b.vz);
   const active=!reduced&&b.heldBy<0&&b.life>0&&speed>2.5;
   if(active&&Number.isFinite(distance)&&distance<3){track.credit+=distance/.22;const count=Math.min(8,Math.floor(track.credit));track.credit-=count;
    for(let j=0;j<count;j++){const p=particles[i*12+track.cursor++%12],t=(j+1)/count;p.x=track.x+(b.x-track.x)*t;p.z=track.z+(b.z-track.z)*t;p.age=0;p.size=.1+Math.min(1,speed/19)*.065;}
   }else track.credit=0;
   track.x=b.x;track.z=b.z;
  }
  if(mesh.count===0&&particles.every(p=>p.age>=.35))return;
  let count=0;
  for(const p of particles){p.age+=dt;if(p.age>=.35)continue;dummy.position.set(p.x,.4,p.z);dummy.scale.setScalar(p.size*(1-p.age/.35));dummy.updateMatrix();mesh.setMatrixAt(count++,dummy.matrix);}
  mesh.count=count;mesh.visible=count>0;if(count)mesh.instanceMatrix.needsUpdate=true;
 },dispose(){mesh.dispose();geometry.dispose();material.dispose();mesh.removeFromParent();}};
}
