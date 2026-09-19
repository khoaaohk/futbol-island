import * as T from 'three';
import {BALL_COLORS,type CharacterCustomization} from '../town/customization';
export const BALL_STUN_DURATION=3.6;
export type BallHitTarget={id:string;x:number;y:number;z:number};
export type BallReactions=ReturnType<typeof createBallReactions>;
type Movement={canMove:(x:number,z:number)=>boolean;move:(x:number,z:number)=>void};
export function createBallReactions(scene:T.Scene){
 const root=new T.Group();root.name='ball-hit-stars';scene.add(root);
 const shape=new T.Shape();for(let i=0;i<10;i++){const a=i*Math.PI/5,r=i%2?.07:.16;i?shape.lineTo(Math.cos(a)*r,Math.sin(a)*r):shape.moveTo(Math.cos(a)*r,Math.sin(a)*r);}shape.closePath();
 const geometry=new T.ShapeGeometry(shape),material=new T.MeshBasicMaterial({color:'#ffe17b',side:T.DoubleSide,depthWrite:false});
 const ringGeometry=new T.RingGeometry(.8,1,32),sparkGeometry=new T.IcosahedronGeometry(.12,0);
 const states=new Map<string,BallHitTarget&{age:number;cause?:'truck';yaw:number;stars:T.Group;rig?:T.Object3D;ball:CharacterCustomization['ball'];originX:number;originZ:number;distance:number;travel:number;movement?:Movement;pulse:T.Group;pulseMaterial:T.MeshBasicMaterial}>();
 let reducedMotion=false;
 const popHeight=(ball:CharacterCustomization['ball'],age:number,reduced:boolean)=>!reduced&&(ball==='sunset'||ball==='solar')?Math.sin(Math.min(1,age/.8)*Math.PI)*(ball==='solar'?1:.8):0;
 const fall=(age:number)=>age<.35?T.MathUtils.smoothstep(age,0,.35):age<1.15?1:1-T.MathUtils.smoothstep(age,1.15,1.85);
 function hit(target:BallHitTarget,vx:number,vz:number,ball:CharacterCustomization['ball']='classic',movement?:Movement,cause?:'truck'){
  if(states.has(target.id)||Math.hypot(vx,vz)<1)return false;
  const stars=new T.Group();for(let i=0;i<3;i++)stars.add(new T.Mesh(geometry,material));root.add(stars);
  const pulse=new T.Group();pulse.name='ball-impact-'+ball;pulse.position.set(target.x,target.y+.12,target.z);root.add(pulse);
  const pulseMaterial=new T.MeshBasicMaterial({color:BALL_COLORS[ball],transparent:true,opacity:.8,side:T.DoubleSide,depthWrite:false,toneMapped:false});
  const ring=new T.Mesh(ringGeometry,pulseMaterial);ring.rotation.x=-Math.PI/2;pulse.add(ring);
  for(let i=0;i<(ball==='sunset'||ball==='solar'?12:ball==='frost'?8:6);i++)pulse.add(new T.Mesh(ball==='cosmic'?geometry:sparkGeometry,pulseMaterial));
  states.set(target.id,{...target,age:0,cause,yaw:Math.atan2(vx,vz),stars,ball,originX:target.x,originZ:target.z,distance:cause==='truck'?3.3:ball==='neon'?4.5:ball==='sunset'?1.5:ball==='frost'?2:ball==='solar'?1.1:ball==='cosmic'?1.8:.65,travel:0,movement,pulse,pulseMaterial});return true;
 }
 function update(dt:number,camera:T.Camera,reduced:boolean,visible:boolean){
  reducedMotion=reduced;root.visible=visible;
  for(const [id,state] of states){state.age+=dt;
   if(state.age>=(state.ball==='frost'?4.2:BALL_STUN_DURATION)){if(state.rig){state.rig.rotation.x=0;state.rig.rotation.z=0;}state.stars.removeFromParent();state.pulse.removeFromParent();state.pulseMaterial.dispose();states.delete(id);continue;}
   const targetTravel=state.distance*(1-Math.pow(1-Math.min(1,state.age/(state.ball==='frost'?1:.65)),3)),distance=targetTravel-state.travel;
   if(distance>0){const steps=Math.max(1,Math.ceil(distance/.12));for(let i=0;i<steps;i++){const travelYaw=state.yaw+(state.ball==='cosmic'?Math.sin(state.travel/1.8*Math.PI*2)*.8:0),x=state.x+Math.sin(travelYaw)*distance/steps,z=state.z+Math.cos(travelYaw)*distance/steps;if(state.movement&&!state.movement.canMove(x,z)){state.distance=state.travel;break;}state.x=x;state.z=z;state.travel+=distance/steps;state.movement?.move(x,z);}}
   const pop=popHeight(state.ball,state.age,reduced),down=fall(state.age);
   state.stars.position.set(state.x,state.y+2.05-down*1.35+pop,state.z+down*.55);
   state.stars.children.forEach((star,i)=>{const angle=i*Math.PI*2/3+(reduced?0:state.age*4);star.position.set(Math.cos(angle)*.5,reduced?0:Math.sin(angle*2)*.1,Math.sin(angle)*.35);star.quaternion.copy(camera.quaternion);});
   const t=Math.min(1,state.age/.7);state.pulse.visible=t<1;if(t===1)continue;
   const radius=reduced?.7:.3+t*(state.ball==='neon'?3.8:state.ball==='sunset'?2.3:state.ball==='solar'?2:state.ball==='cosmic'?1.7:state.ball==='frost'?1.5:1.1);state.pulse.visible=t<1;state.pulseMaterial.opacity=(1-t)*.85;
   state.pulse.children[0].scale.setScalar(radius);
   for(let j=1;j<state.pulse.children.length;j++){const spark=state.pulse.children[j],i=j-1;spark.visible=!reduced;const angle=i/(state.pulse.children.length-1)*Math.PI*2+(state.ball==='cosmic'?t*3:0);spark.position.set(Math.cos(angle)*radius,Math.sin(t*Math.PI)*(state.ball==='sunset'?1.5:state.ball==='frost'?.7:state.ball==='cosmic'?1:.3),Math.sin(angle)*radius);spark.scale.setScalar((1-t)*(state.ball==='sunset'||state.ball==='cosmic'?1.4:1));if(state.ball==='frost')spark.scale.y*=2.2;if(state.ball==='cosmic')spark.quaternion.copy(camera.quaternion);}
  }
 }
 function apply(id:string,rig:T.Object3D,reduced:boolean){const state=states.get(id);if(!state)return;state.rig=rig;reduced=reduced||reducedMotion;const down=fall(state.age),pop=popHeight(state.ball,state.age,reduced);rig.position.set(state.x,state.y+down*.12+pop,state.z);rig.rotation.order='YXZ';rig.rotation.y=state.yaw;rig.rotation.x=down*(reduced?.65:1.48);rig.rotation.z=state.ball==='solar'&&state.age<.8&&!reduced?Math.sin(state.age/.8*Math.PI)*Math.PI*2:state.age>1.85&&!reduced?Math.sin(state.age*9)*.11:0;}
 return{root,states,hit,get:(id:string)=>states.get(id),update,apply,dispose(){for(const state of states.values())state.pulseMaterial.dispose();states.clear();root.removeFromParent();geometry.dispose();material.dispose();ringGeometry.dispose();sparkGeometry.dispose();}};
}
