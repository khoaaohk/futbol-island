import * as T from 'three';

/** Twin downward plumes share a fixed pool and one draw call. */
export function createJetExhaust(){
 const geometry=new T.IcosahedronGeometry(1,0),material=new T.MeshBasicMaterial({color:'#ffffff'}),root=new T.InstancedMesh(geometry,material,112);
 root.name='jetpack-downwash';root.frustumCulled=false;root.count=0;root.instanceMatrix.setUsage(T.DynamicDrawUsage);
 const particles=Array.from({length:112},()=>({x:0,y:0,z:0,vx:0,vz:0,age:1,life:0,size:0,drop:0,floor:0}));
 const dummy=new T.Object3D(),colors=[new T.Color('#48baff'),new T.Color('#46e6b2'),new T.Color('#83dcd2')];let index=0,credit=0,lastX=NaN,lastZ=NaN;
 return {root,update(x:number,y:number,z:number,yaw:number,floor:number,dt:number,enabled:boolean,boost:boolean,reduced:boolean){
  if(Math.hypot(x-lastX,z-lastZ)>12||reduced){for(const p of particles)p.life=0;credit=0;}lastX=x;lastZ=z;
  if(enabled&&!reduced&&dt>0){credit+=dt*(boost?200:140);const emit=Math.floor(credit);credit-=emit;
   for(let i=0;i<emit;i++){const p=particles[index%112],side=index++%2?1:-1,angle=index*2.399;
    p.x=x+Math.cos(yaw)*side*.3-Math.sin(yaw)*.34;p.z=z-Math.sin(yaw)*side*.3-Math.cos(yaw)*.34;p.y=y+.82;
    const groundBoost=boost&&y-floor<2;
    p.vx=Math.cos(angle)*(groundBoost?3.5:boost?1.8:1.1);p.vz=Math.sin(angle)*(groundBoost?3.5:boost?1.8:1.1);p.age=0;p.life=boost?.53:.43;p.size=boost?.26:.2;p.drop=boost?14:10;p.floor=floor+.06;
   }
  }
  if((!enabled||reduced)&&root.count===0)return;
  let visible=0;
  for(const p of particles){p.age+=dt;if(p.age>=p.life)continue;const t=p.age/p.life;p.x+=p.vx*dt;p.z+=p.vz*dt;p.y=Math.max(p.floor,p.y-p.drop*dt);
   const size=p.size*(.45+t*2.5)*(1-t);dummy.position.set(p.x,p.y,p.z);dummy.scale.set(size,size*(t<.3?1.8:.8),size);dummy.updateMatrix();root.setMatrixAt(visible,dummy.matrix);
   root.setColorAt(visible++,colors[t<.3?0:t<.65?1:2]);
  }
  root.count=visible;root.visible=visible>0;if(visible){root.instanceMatrix.clearUpdateRanges();root.instanceMatrix.addUpdateRange(0,root.count*16);root.instanceMatrix.needsUpdate=true;if(root.instanceColor){root.instanceColor.setUsage(T.DynamicDrawUsage);root.instanceColor.clearUpdateRanges();root.instanceColor.addUpdateRange(0,root.count*3);root.instanceColor.needsUpdate=true;}}
 },dispose(){root.removeFromParent();geometry.dispose();material.dispose();}};
}
