import * as T from 'three';
/** One small, bounded draw call; only moving balls emit. */
export function createBallSparkles(){
 const geometry=new T.IcosahedronGeometry(1,0),material=new T.MeshBasicMaterial({color:'#eee4c4',transparent:true,opacity:.8,depthWrite:false,toneMapped:false});
 const root=new T.InstancedMesh(geometry,material,24);root.name='ball-sparkle-trail';root.count=0;root.visible=false;root.frustumCulled=false;root.instanceMatrix.setUsage(T.DynamicDrawUsage);
 const pool=Array.from({length:24},()=>({x:0,y:0,z:0,age:1,life:0,size:0,vx:0,vz:0})),dummy=new T.Object3D();let cursor=0,credit=0,lastX=NaN,lastY=0,lastZ=NaN,lastColor='';
 function update(dt:number,p:{x:number;y:number;z:number},shot:boolean,enabled:boolean,reduced:boolean,color:string){
  if((!enabled||reduced)&&root.count===0){lastX=p.x;lastY=p.y;lastZ=p.z;credit=0;return;}
  const distance=Math.hypot(p.x-lastX,p.y-lastY,p.z-lastZ),jump=!Number.isFinite(distance)||distance>3;
  if(color!==lastColor){material.color.set(color);lastColor=color;}
  if(jump||!enabled||reduced){for(const particle of pool)particle.life=0;credit=0;}
  if(enabled&&!reduced&&!jump&&dt>0&&distance>.008){credit+=Math.min(distance,.9)*(shot?18:11);const count=Math.min(8,Math.floor(credit));credit-=count;for(let i=0;i<count;i++){const particle=pool[cursor++%24],t=(i+1)/count,a=cursor*2.399;particle.x=T.MathUtils.lerp(lastX,p.x,t)+Math.cos(a)*.13;particle.y=T.MathUtils.lerp(lastY,p.y,t)+Math.sin(a)*.1;particle.z=T.MathUtils.lerp(lastZ,p.z,t)+Math.sin(a)*.13;particle.age=0;particle.life=shot?.5:.36;particle.size=shot?.065:.045;particle.vx=Math.cos(a)*(shot?.5:.18);particle.vz=Math.sin(a)*(shot?.5:.18);}}
  lastX=p.x;lastY=p.y;lastZ=p.z;let visible=0;
  for(const particle of pool){particle.age+=dt;if(particle.age>=particle.life)continue;particle.x+=particle.vx*dt;particle.y+=dt*.12;particle.z+=particle.vz*dt;const t=particle.age/particle.life,size=particle.size*(1-t);dummy.position.set(particle.x,particle.y,particle.z);dummy.rotation.set(t*3,t*2,0);dummy.scale.setScalar(size);dummy.updateMatrix();root.setMatrixAt(visible++,dummy.matrix);}
  root.count=visible;root.visible=visible>0;if(visible)root.instanceMatrix.needsUpdate=true;
 }
 return {root,update,dispose(){root.removeFromParent();geometry.dispose();material.dispose();root.dispose();}};
}
