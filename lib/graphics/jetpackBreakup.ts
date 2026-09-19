import * as T from 'three';

/** Detached ride pieces keep moving independently while the rider falls. */
export function createJetpackBreakup(){
 const root=new T.Group();root.name='jetpack-breakup';root.visible=false;
 const pieces:{mesh:T.Object3D;velocity:T.Vector3;spin:T.Vector3;materials:T.Material[];resting:boolean}[]=[];
 let age=Infinity;
 const clear=()=>{for(const p of pieces){p.mesh.removeFromParent();p.materials.forEach(m=>m.dispose());}pieces.length=0;};
 return {root,trigger(vehicle:T.Group,reduced:boolean){
  clear();age=0;root.visible=true;vehicle.updateWorldMatrix(true,true);
  const source=vehicle.children.find(group=>group.visible&&['jetpack','helicopter-pack','flying-car','ironman','rocketboard','mini-plane'].includes(group.name));if(!source)return;
  source.children.filter(part=>part.visible).forEach((part,i)=>{
   const mesh=part.clone(true),materials:T.Material[]=[];
   part.matrixWorld.decompose(mesh.position,mesh.quaternion,mesh.scale);
   mesh.traverse(object=>{if(object instanceof T.Mesh){const copy=(material:T.Material)=>{const next=material.clone();next.transparent=true;materials.push(next);return next;};object.material=Array.isArray(object.material)?object.material.map(copy):copy(object.material);}});
   const angle=i*2.399+vehicle.rotation.y,speed=reduced?1:4+i%3*2;
   pieces.push({mesh,materials,resting:false,velocity:new T.Vector3(Math.cos(angle)*speed,reduced?2:8+i%4*1.4,Math.sin(angle)*speed),spin:new T.Vector3(reduced?0:2+i*.2,reduced?0:3-i*.15,reduced?0:4-i*.3)});root.add(mesh);
  });
 },update(dt:number,surface:(x:number,z:number)=>number,visible:boolean){
  age+=dt;root.visible=age<5&&visible;if(age>=5){if(pieces.length)clear();return;}
  for(const piece of pieces){const {mesh,velocity,spin}=piece;
   if(!piece.resting){velocity.y-=14*dt;mesh.position.addScaledVector(velocity,dt);mesh.rotateX(spin.x*dt);mesh.rotateY(spin.y*dt);mesh.rotateZ(spin.z*dt);const floor=surface(mesh.position.x,mesh.position.z)+.25;if(mesh.position.y<floor&&velocity.y<0){mesh.position.y=floor;velocity.y*=-.25;velocity.x*=.5;velocity.z*=.5;spin.multiplyScalar(.5);if(velocity.y<.7)piece.resting=true;}}
   for(const material of piece.materials)material.opacity=T.MathUtils.clamp((5-age)/.8,0,1);
  }
 },dispose(){clear();root.removeFromParent();}};
}
