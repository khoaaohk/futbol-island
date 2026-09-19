import * as T from 'three';
/** A small reused pool follows the canopy tips, separate from jet exhaust. */
export function createParachuteTrail(){
 const geometry=new T.IcosahedronGeometry(1,0),material=new T.MeshBasicMaterial({transparent:true,opacity:.38,depthWrite:false}),root=new T.InstancedMesh(geometry,material,96);root.name='parachute-glide-trail';root.frustumCulled=false;root.count=0;root.instanceMatrix.setUsage(T.DynamicDrawUsage);
 const particles=Array.from({length:96},()=>({x:0,y:0,z:0,age:2,life:1,side:1})),dummy=new T.Object3D(),color=new T.Color();let index=0,credit=0;
 return {root,update(x:number,y:number,z:number,yaw:number,dt:number,enabled:boolean,reduced:boolean){
  if(enabled&&!reduced){credit+=dt*45;while(credit>=1){credit--;const p=particles[index++%particles.length],side=index%2?1:-1;Object.assign(p,{x:x+Math.cos(yaw)*side*2.2,y:y+5.5,z:z-Math.sin(yaw)*side*2.2,age:0,life:.85+index%3*.1,side});}}
  let count=0;for(const p of particles){p.age+=dt;if(p.age>=p.life||reduced)continue;const t=p.age/p.life;p.y+=dt*.6;dummy.position.set(p.x,p.y,p.z);dummy.scale.setScalar(.13*(1-t));dummy.updateMatrix();root.setMatrixAt(count,dummy.matrix);color.set(p.side>0?'#73edd1':'#73caff');root.setColorAt(count++,color);}root.count=count;root.visible=count>0;if(count){root.instanceMatrix.clearUpdateRanges();root.instanceMatrix.addUpdateRange(0,root.count*16);root.instanceMatrix.needsUpdate=true;if(root.instanceColor){root.instanceColor.setUsage(T.DynamicDrawUsage);root.instanceColor.clearUpdateRanges();root.instanceColor.addUpdateRange(0,root.count*3);root.instanceColor.needsUpdate=true;}}
 },dispose(){root.removeFromParent();geometry.dispose();material.dispose();root.dispose();}};
}
