import * as T from 'three';
/** Palette and particle shape are cosmetic; ground speed and handling stay consistent. */
export const GROUND_TRAILS:Record<string,{color:string;stretch:number;rise:number;spread:number;wave:number;life:number}>={
 mint:{color:'#8be2bd',stretch:1.8,rise:.1,spread:.2,wave:.7,life:.48},
 stunt:{color:'#ffd36f',stretch:.5,rise:.8,spread:.7,wave:0,life:.34},
 comet:{color:'#b1b7ff',stretch:4,rise:.2,spread:.12,wave:.3,life:.62},
 bmx:{color:'#ffad83',stretch:.7,rise:.55,spread:.35,wave:.5,life:.42},
 road:{color:'#99deff',stretch:5,rise:.03,spread:.04,wave:0,life:.38},
 mountain:{color:'#c6df75',stretch:.65,rise:.35,spread:.6,wave:0,life:.58},
 retro:{color:'#ffcec0',stretch:1,rise:.65,spread:.2,wave:1,life:.65},
 delivery:{color:'#91f0d6',stretch:1.2,rise:.22,spread:.08,wave:.8,life:.52},
 sport:{color:'#f69adb',stretch:3,rise:.16,spread:.3,wave:.15,life:.46}
};

/** One pooled draw call, updated by the island's existing render loop. */
export function createRideTrail(){
 const count=48,geometry=new T.IcosahedronGeometry(1,0),material=new T.MeshBasicMaterial({color:'#e8d4ad'});
 const root=new T.InstancedMesh(geometry,material,count);root.name='ride-dust-trail';root.frustumCulled=false;root.instanceMatrix.setUsage(T.DynamicDrawUsage);root.count=0;
 const particles=Array.from({length:count},()=>({x:0,y:0,z:0,age:1,life:0,size:0}));
 const dummy=new T.Object3D();let index=0,credit=0,lastX=NaN,lastZ=NaN,lastVariant='';
 function clear(){for(const p of particles)p.life=0;root.count=0;credit=0;}
 return {root,update(x:number,y:number,z:number,yaw:number,speed:number,dt:number,enabled:boolean,reduced:boolean,variant='classic',action=false){
  const style=GROUND_TRAILS[variant];if(lastVariant!==variant){clear();lastVariant=variant;material.color.set(style?.color??'#e8d4ad');}root.userData.style=variant;
  const distance=Math.hypot(x-lastX,z-lastZ),jump=!Number.isFinite(distance)||distance>3;
  if(jump||reduced)clear();
  if(!enabled&&root.count===0){lastX=x;lastZ=z;root.visible=false;return;}
  const strength=T.MathUtils.clamp(speed/28,0,1);
  if(enabled&&!reduced&&!jump&&(speed>1.5||action)&&dt>0){
   credit+=distance*(1.6+strength*1.5)+(action?dt*35:0);const emit=Math.min(count,Math.floor(credit));credit-=emit;
   for(let i=0;i<emit;i++){const p=particles[index++%count],t=(i+1)/emit,spread=Math.sin(index*2.4)*(.09+strength*.15+(action?.16:0))*(style?.spread??1);
    p.x=T.MathUtils.lerp(lastX,x,t)-Math.sin(yaw)*.7+Math.cos(yaw)*spread;p.z=T.MathUtils.lerp(lastZ,z,t)-Math.cos(yaw)*.7-Math.sin(yaw)*spread;p.y=y+.08;p.age=0;p.life=style?.life??(.2+strength*.35);p.size=(.08+strength*.13)*(action?1.3:1);
   }
  }
  lastX=x;lastZ=z;let visible=0;
  for(const p of particles){p.age+=dt;if(p.age>=p.life)continue;const t=p.age/p.life,size=p.size*(1-t)*(.8+t),wave=Math.sin(t*Math.PI*2)*(style?.wave??0)*.12;dummy.position.set(p.x+Math.cos(yaw)*wave,p.y+t*(style?.rise??.2),p.z-Math.sin(yaw)*wave);dummy.rotation.set(0,yaw,0);dummy.scale.set(size,size,size*(style?.stretch??1));dummy.updateMatrix();root.setMatrixAt(visible++,dummy.matrix);}
  root.count=visible;root.visible=visible>0;if(visible){root.instanceMatrix.clearUpdateRanges();root.instanceMatrix.addUpdateRange(0,root.count*16);root.instanceMatrix.needsUpdate=true;}
 },dispose(){root.removeFromParent();geometry.dispose();material.dispose();}};
}
