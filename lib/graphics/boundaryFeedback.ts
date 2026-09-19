import * as T from 'three';
/** Three pooled ripples briefly reveal the invisible island limit at contact. */
export function createBoundaryFeedback(){
 const root=new T.Group();root.name='island-boundary-feedback';
 const geometry=new T.RingGeometry(.82,1,32);
 const rings=Array.from({length:3},()=>{
  const material=new T.MeshBasicMaterial({color:'#c8f3ed',transparent:true,opacity:0,side:T.DoubleSide,depthWrite:false});
  const mesh=new T.Mesh(geometry,material);mesh.visible=false;root.add(mesh);return {mesh,material,age:1,life:.8,strength:1};
 });
 let index=0,cooldown=0;
 return {root,hit(x:number,y:number,z:number,nx:number,nz:number,strength=1){
  if(cooldown>0)return;
  cooldown=.22;const ring=rings[index++%rings.length];ring.age=0;ring.strength=T.MathUtils.clamp(strength,.4,1.5);
  ring.mesh.position.set(x,y+1,z);ring.mesh.rotation.set(0,Math.atan2(nx,nz),0);ring.mesh.visible=true;
 },update(dt:number,reduced:boolean,camera?:T.Camera){
  dt=T.MathUtils.clamp(dt,0,.1);cooldown=Math.max(0,cooldown-dt);
  for(const ring of rings){ring.age+=dt;const t=ring.age/ring.life;ring.mesh.visible=t<1;
   if(t>=1)continue;
   if(camera)ring.mesh.quaternion.copy(camera.quaternion);
   ring.mesh.scale.setScalar(reduced?1.1:(.4+2.3*t)*ring.strength);
   ring.material.opacity=(reduced?.32:.65)*Math.sin(Math.PI*t);
  }
 },dispose(){root.removeFromParent();geometry.dispose();for(const ring of rings)ring.material.dispose();}};
}
