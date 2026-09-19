import * as T from 'three';
import type {CharacterCustomization} from '../town/customization';
export const FLIGHT_TRAIL_COLORS:Record<CharacterCustomization['jetpack'],string>={classic:'#b8fff0','flying-car':'#92f78b',helicopter:'#c69bff',ironman:'#91efff',rocketboard:'#ffb768','mini-plane':'#b6ddff'};
export const FLIGHT_ACTIONS:Record<CharacterCustomization['jetpack'],[string,string]>={classic:['Blast forward','Blast up and parachute'],'flying-car':['Blast forward','Blast up and parachute'],helicopter:['Blast forward','Blast up and parachute'],ironman:['Repulsor surge','Repulsor launch'],rocketboard:['Forward flip','Vertical corkscrew'],'mini-plane':['Barrel roll','Loop climb']};
/** Fixed pools follow the island clock; no emitters survive teleports or ride changes. */
export function createFlightTrail(){
 const root=new T.Group();root.name='flight-trails';
 const streakGeometry=new T.SphereGeometry(1,6,4),ringGeometry=new T.TorusGeometry(1,.045,4,24);
 const streakMaterial=new T.MeshBasicMaterial({color:'#92f78b',transparent:true,opacity:.85,depthWrite:false,toneMapped:false});
 const ringMaterial=new T.MeshBasicMaterial({color:'#c69bff',transparent:true,opacity:.4,depthWrite:false});
 const streaks=new T.InstancedMesh(streakGeometry,streakMaterial,64),rings=new T.InstancedMesh(ringGeometry,ringMaterial,64);
 streaks.name='flying-car-trail';rings.name='helicopter-wake';root.add(streaks,rings);
 for(const mesh of [streaks,rings]){mesh.count=0;mesh.frustumCulled=false;mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);}
 const pool=Array.from({length:64},()=>({x:0,y:0,z:0,yaw:0,age:2,life:0,boost:false})),dummy=new T.Object3D();
 let cursor=0,credit=0,lastX=NaN,lastY=0,lastZ=NaN,lastKind='';
 return {root,update(x:number,y:number,z:number,yaw:number,speed:number,dt:number,kind:string,enabled:boolean,boost:boolean,reduced:boolean,up=false){
  const jump=Math.hypot(x-lastX,z-lastZ)>12;
  if(kind!==lastKind)streakMaterial.color.set(FLIGHT_TRAIL_COLORS[kind as CharacterCustomization['jetpack']]??'#92f78b');
  if(kind!==lastKind||jump||reduced){pool.forEach(p=>p.life=0);credit=0;}
  const previousX=Number.isFinite(lastX)&&!jump?lastX:x,previousY=Number.isFinite(lastX)&&!jump?lastY:y,previousZ=Number.isFinite(lastZ)&&!jump?lastZ:z;lastX=x;lastY=y;lastZ=z;lastKind=kind;const helicopter=kind==='helicopter',armor=kind==='ironman',board=kind==='rocketboard',plane=kind==='mini-plane';
  if(enabled&&!reduced&&dt>0&&(speed>2||boost||helicopter||armor)){credit+=dt*(helicopter?(speed>2?18:7):48)*(boost?3:1);const count=Math.min(64,Math.floor(credit));credit-=count;
   for(let i=0;i<count;i++){const p=pool[cursor++%64],side=cursor%2?1:-1;const t=(i+1)/count,lateral=plane?1.65:board?.25:armor?.16:.53,back=plane?.55:board?1.3:armor?.05:1.2,spiral=helicopter&&boost&&!up?Math.sin(cursor*.65)*.3:0;p.x=T.MathUtils.lerp(previousX,x,t)-Math.sin(yaw)*(up?0:helicopter?.9:back)+Math.cos(yaw)*(helicopter?spiral:side*lateral);p.z=T.MathUtils.lerp(previousZ,z,t)-Math.cos(yaw)*(up?0:helicopter?.9:back)-Math.sin(yaw)*(helicopter?spiral:side*lateral);p.y=T.MathUtils.lerp(previousY,y,t)+(helicopter?(up?.35:1.8):plane?.6:armor?.05:board?.08:.24);p.yaw=yaw;p.age=0;p.life=boost?.85:helicopter?.45:.65;p.boost=boost;}
  }
  if((!enabled||reduced)&&streaks.count===0&&rings.count===0)return;
  let count=0;const mesh=helicopter?rings:streaks;streaks.count=rings.count=0;
  for(const p of pool){p.age+=dt;if(p.age>=p.life)continue;const t=p.age/p.life;dummy.position.set(p.x,p.y-(helicopter?t*1.5:armor?t*1.1:0),p.z);dummy.rotation.set(helicopter?Math.PI/2:0,p.yaw,0);
   if(helicopter){const radius=.35+t*(p.boost?1.6:.9);dummy.scale.set(radius,radius,(1-t)*.8);}else if(armor)dummy.scale.set(.055*(1-t),(.32+(p.boost?.65:0))*(1-t),.055*(1-t));else if(board){dummy.scale.set(.1*(1-t),.065*(1-t),(p.boost?1.15:.5)*(1-t));dummy.position.x+=Math.cos(p.yaw)*Math.sin(t*12)*t*.18;}else if(plane)dummy.scale.set(.065*(1-t),.065*(1-t),(p.boost?2.4:1.25)*(1-t));else dummy.scale.set(.16*(1-t),.13*(1-t),(p.boost?1.7:.85)*(1-t));
   dummy.updateMatrix();mesh.setMatrixAt(count++,dummy.matrix);
  }
  mesh.count=count;streaks.visible=streaks.count>0;rings.visible=rings.count>0;if(count){mesh.instanceMatrix.clearUpdateRanges();mesh.instanceMatrix.addUpdateRange(0,mesh.count*16);mesh.instanceMatrix.needsUpdate=true;}
 },dispose(){root.removeFromParent();streakGeometry.dispose();ringGeometry.dispose();streakMaterial.dispose();ringMaterial.dispose();streaks.dispose();rings.dispose();}};
}
