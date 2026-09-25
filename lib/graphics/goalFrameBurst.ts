import * as T from 'three';

/** Two short, pooled frame impacts: a soft ring and eight tiny sparks, no lights. */
export function createGoalFrameBurst(){
 const root=new T.Group();root.name='goal-frame-impacts';
 const ringGeometry=new T.RingGeometry(.72,1,24),sparkGeometry=new T.IcosahedronGeometry(.055,0),dummy=new T.Object3D();
 const directions=Array.from({length:8},(_,i)=>new T.Vector3(Math.cos(i*Math.PI/4),Math.sin(i*Math.PI/4),i%2?.45:-.45).normalize());
 const pool=Array.from({length:2},()=>{
  const group=new T.Group(),material=new T.MeshBasicMaterial({color:'#ffe8af',transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide,toneMapped:false});
  const ring=new T.Mesh(ringGeometry,material),sparks=new T.InstancedMesh(sparkGeometry,material,8);
  sparks.instanceMatrix.setUsage(T.DynamicDrawUsage);sparks.frustumCulled=false;
  group.add(ring,sparks);group.visible=false;root.add(group);return{group,material,ring,sparks,age:1};
 });let cursor=0;
 return{root,trigger(x:number,y:number,z:number){const b=pool[cursor++%pool.length];b.age=0;b.group.position.set(x,y,z);},clear(){for(const b of pool){b.age=1;b.group.visible=false;}},update(dt:number,camera:T.Camera,reduced:boolean){
  for(const b of pool){
   if(b.age>=.42){b.group.visible=false;continue;}
   b.age+=Math.max(0,dt);const duration=reduced?.18:.42,p=Math.min(1,b.age/duration);
   b.group.visible=p<1;if(!b.group.visible)continue;
   b.material.opacity=(reduced?.25:.62)*(1-p)*(1-p);
   b.ring.quaternion.copy(camera.quaternion);b.ring.scale.setScalar(reduced?.22:.12+p*.52);
   b.sparks.visible=!reduced;if(reduced)continue;
   for(let i=0;i<8;i++){dummy.position.copy(directions[i]).multiplyScalar(.07+p*.6);dummy.position.y-=p*p*.12;dummy.scale.setScalar(1-p*.7);dummy.updateMatrix();b.sparks.setMatrixAt(i,dummy.matrix);}
   b.sparks.instanceMatrix.needsUpdate=true;
  }
 },dispose(){root.removeFromParent();ringGeometry.dispose();sparkGeometry.dispose();for(const b of pool){b.sparks.dispose();b.material.dispose();}}};
}
