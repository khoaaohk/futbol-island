import {createSocialPose,type SocialRoutine} from './arcadeSocial';
import type {BallReactions} from '../graphics/ballReactions';
import * as T from 'three';
import {separateArcadeBody} from './arcadeBodyCollision';
import {createPlayer,profileFor,type PlayerMotion} from '../graphics/player';
import {defaultBeanLookFor,DEFAULT_CASUAL_OUTFIT} from '../graphics/beanLook';

export type ArcadeCrowdCabinet={x:number;z:number;yaw:number};
export type ArcadeCrowdBounds={minX:number;maxX:number;minZ:number;maxZ:number};
export type ArcadeCrowdOptions={scene:T.Scene;mobile:boolean;reduced?:boolean;cabinets:readonly ArcadeCrowdCabinet[];bounds:ArcadeCrowdBounds;reactions?:BallReactions};
/** Parent owns all scheduling. Room disposal removes every rig and crowd-owned resource. */
export function createArcadeRoomCrowd({scene,mobile,reduced=false,cabinets,bounds,reactions}:ArcadeCrowdOptions){
 const clampX=(x:number)=>T.MathUtils.clamp(x,bounds.minX+.35,bounds.maxX-.35),clampZ=(z:number)=>T.MathUtils.clamp(z,bounds.minZ+.35,bounds.maxZ-.35);
 const aisleX=clampX((bounds.minX+bounds.maxX)/2);
 const stations=cabinets.map((c,i)=>{const side=i%2?1:-1,s=Math.sin(c.yaw),k=Math.cos(c.yaw);return{x:clampX(c.x+s*1.8+k*.7*side),z:clampZ(c.z+k*1.8-s*.7*side),ax:clampX(c.x+s*3.05),az:clampZ(c.z+k*3.05),yaw:c.yaw+Math.PI,owner:-1};});
 const shadowGeometry=new T.CircleGeometry(.36,16),shadowMaterial=new T.MeshBasicMaterial({color:'#152e35',transparent:true,opacity:.23,depthWrite:false});
 const count=Math.min(mobile?3:5,stations.length);
 const members=Array.from({length:count},(_,i)=>{const id=`arcade-visitor-${i}`,rig=createPlayer(id,'neutral',true,true),look=defaultBeanLookFor(id),station=stations[i];rig.root.name=id;rig.setProfile(profileFor('npc',37+i));rig.setBeanLook(look,{...DEFAULT_CASUAL_OUTFIT,shirt:look.body,shirt2:'#fff0cf'});scene.add(rig.root);station.owner=i;
  const shadow=new T.Mesh(shadowGeometry,shadowMaterial);shadow.rotation.x=-Math.PI/2;shadow.position.set(station.x,.083,station.z);scene.add(shadow);
  const motion:PlayerMotion={travelMode:'walk',facing:station.yaw,lookY:1.95};
  const arms=['left','right'].map(side=>({shoulder:rig.root.getObjectByName(`${side}-shoulder`)!,elbow:rig.root.getObjectByName(`${side}-elbow`)!}));
  const entering=i===count-1,entryX=clampX(2),entryZ=clampZ(bounds.maxZ-4);if(entering)shadow.position.set(entryX,.083,entryZ);
  return{rig,shadow,motion,arms,social:null as SocialRoutine|null,socialAge:-1,socialPose:createSocialPose(),consoleBlend:0,greet:0,greetCooldown:0,playerNearby:false,x:entering?entryX:station.x,z:entering?entryZ:station.z,vx:0,vz:0,yaw:station.yaw,cabinet:i,previous:i,phase:(entering?'entry':'play') as 'entry'|'play'|'leave'|'aisle'|'cross'|'approach'|'arrive',age:0,deadline:7+i*3.7,tx:entering?aisleX:station.x,tz:entering?entryZ:station.z,visits:0,yielding:false,laneX:clampX(aisleX+(i-(count-1)/2)*1.05),detour:null as {x:number;z:number;age:number}|null,detourCooldown:0};});
 const debugStates=members.map((m,i)=>({id:i,x:m.x,z:m.z,phase:m.phase as string,cabinet:m.cabinet,yielding:false,greeting:false,visits:0,social:false,socialAge:-1,facing:0,attentive:false}));
 const contact={x:0,z:0},human={x:0,z:0};
 let disposed=false,focusedId:number|null=null;
 function update(dt:number,time:number,playerX:number,playerZ:number){
  if(disposed||dt<=0)return;dt=Math.min(dt,.1);human.x=playerX;human.z=playerZ;
  for(let i=0;i<members.length;i++){
   const m=members[i],stunned=reactions?.get(`arcade-visitor-${i}`),station=stations[m.cabinet],engaged=!!stunned||!!m.social||i===focusedId;if(!engaged)m.age+=dt;
   if(!engaged&&m.phase==='play'&&m.age>m.deadline){station.owner=-1;m.phase='leave';m.age=0;m.tx=station.ax;m.tz=station.az;m.previous=m.cabinet;}
   const playerDistance=Math.hypot(m.x-playerX,m.z-playerZ);m.yielding=playerDistance<1.25;
   m.greet=Math.max(0,m.greet-dt);m.greetCooldown=Math.max(0,m.greetCooldown-dt);
   if(playerDistance<2.6&&!m.playerNearby){m.playerNearby=true;if(m.greetCooldown===0){m.greet=1.4;m.greetCooldown=8;}}
   else if(playerDistance>3.3)m.playerNearby=false;
   let tx=m.tx,tz=m.tz;
   if(!engaged&&m.phase==='play'){
    tx=station.x;tz=station.z;
    // Leave the console centre and its approach free for the human player.
    if(Math.hypot(playerX-station.x,playerZ-station.z)<1.65){const c=cabinets[m.cabinet],side=i%2?1:-1;tx=clampX(station.x+Math.cos(c.yaw)*side*.65);tz=clampZ(station.z-Math.sin(c.yaw)*side*.65+.25);m.yielding=true;}
   }
   if(engaged){tx=m.x;tz=m.z;m.vx=m.vz=0;}
   let dx=tx-m.x,dz=tz-m.z,distance=Math.hypot(dx,dz);
   if(!engaged&&distance<.12&&m.phase!=='play'){
    if(m.phase==='entry'){m.phase='cross';m.tx=m.laneX;m.tz=station.az;}
    else if(m.phase==='leave'){m.phase='aisle';m.tx=m.laneX;m.tz=station.az;}
    else if(m.phase==='aisle'){
     let next=-1;for(let k=1;k<=stations.length;k++){const j=(m.previous+k)%stations.length;if(j!==m.previous&&stations[j].owner<0){next=j;break;}}
     if(next<0&&m.age>5)next=m.previous;
     if(next>=0&&stations[next].owner<0){m.cabinet=next;stations[next].owner=i;m.phase='cross';m.tx=m.laneX;m.tz=stations[next].az;}
    }else if(m.phase==='cross'){m.phase='approach';m.tx=stations[m.cabinet].ax;m.tz=stations[m.cabinet].az;}
    else if(m.phase==='approach'){m.phase='arrive';m.tx=stations[m.cabinet].x;m.tz=stations[m.cabinet].z;}
    else{m.phase='play';m.age=0;m.deadline=10+(i*3+m.visits*7)%11;m.visits++;}
    tx=m.tx;tz=m.tz;dx=tx-m.x;dz=tz-m.z;distance=Math.hypot(dx,dz);
   }
   let speed=Math.min(m.phase==='play'?.8:1.05,distance*3),sx=distance>.001?dx/distance:0,sz=distance>.001?dz/distance:0;
   // Commit to a passing point instead of rotating the desired heading every frame.
   // Stable priority breaks symmetric encounters; separate aisle lanes avoid shared-waypoint piles.
   m.detourCooldown=Math.max(0,m.detourCooldown-dt);
   if(engaged){m.detour=null;speed=0;}
   else if(m.phase!=='play'){
    if(m.detour){m.detour.age+=dt;if(Math.hypot(m.detour.x-m.x,m.detour.z-m.z)<.18||m.detour.age>4){m.detour=null;m.detourCooldown=.4;}}
    if(!m.detour&&m.detourCooldown===0&&distance>.2){
     let blockerX=0,blockerZ=0,nearest=Infinity;
     for(let j=0;j<=members.length;j++){
      const other=members[j];if(j===i)continue;
      if(other&&!(j<i||other.phase==='play'||other.social||j===focusedId||reactions?.get(`arcade-visitor-${j}`)))continue;
      const bx=other?other.x:playerX,bz=other?other.z:playerZ,ox=bx-m.x,oz=bz-m.z,along=sx*ox+sz*oz,across=Math.abs(sz*ox-sx*oz);
      if(along>0&&along<Math.min(1.7,distance+.2)&&across<.92&&along<nearest){nearest=along;blockerX=bx;blockerZ=bz;}
     }
     if(nearest<Infinity){
      // A blocked destination waits; it must not orbit the person occupying that spot.
      if(Math.hypot(tx-blockerX,tz-blockerZ)<.9){speed=0;m.yielding=true;}
      else{const sign=i%2?1:-1;m.detour={x:clampX(blockerX+sz*sign*1.3+sx*.45),z:clampZ(blockerZ-sx*sign*1.3+sz*.45),age:0};}
     }
    }
    if(m.detour){const ox=m.detour.x-m.x,oz=m.detour.z-m.z,d=Math.hypot(ox,oz);sx=ox/Math.max(.001,d);sz=oz/Math.max(.001,d);speed=Math.min(.9,d*3);m.yielding=true;}
   }
   const blend=1-Math.exp(-dt*9);m.vx+=(sx*speed-m.vx)*blend;m.vz+=(sz*speed-m.vz)*blend;
   let nx=clampX(m.x+m.vx*dt),nz=clampZ(m.z+m.vz*dt);
   // A positional guard closes the gap left by steering inertia. The maximum
   // travel step is 0.105m, much smaller than the 0.84m body separation.
   for(let pass=0;pass<3;pass++){contact.x=nx;contact.z=nz;separateArcadeBody(contact,human);nx=clampX(contact.x);nz=clampZ(contact.z);for(let j=0;j<members.length;j++){
    if(j===i)continue;const other=members[j],ox=nx-other.x,oz=nz-other.z,d=Math.hypot(ox,oz);
    if(d<.84){const ux=d>.0001?ox/d:Math.cos(i*2.4),uz=d>.0001?oz/d:Math.sin(i*2.4);nx=clampX(other.x+ux*.84);nz=clampZ(other.z+uz*.84);}
   }
   }
   for(let j=0;j<members.length;j++)if(j!==i&&Math.hypot(nx-members[j].x,nz-members[j].z)<.83){nx=m.x;nz=m.z;break;}
   m.vx=(nx-m.x)/dt;m.vz=(nz-m.z)/dt;m.x=nx;m.z=nz;
   const moving=Math.hypot(m.vx,m.vz)>.06,facing=engaged?Math.atan2(playerX-m.x,playerZ-m.z):moving?Math.atan2(m.vx,m.vz):stations[m.cabinet].yaw;
   m.yaw+=Math.atan2(Math.sin(facing-m.yaw),Math.cos(facing-m.yaw))*(1-Math.exp(-dt*8));
   const playing=!engaged&&m.phase==='play'&&!moving,beat=(m.age+i*.7)%6.5,pleased=playing&&beat>5.3?Math.sin((beat-5.3)/1.2*Math.PI)*.65:0;
   const greeting=engaged||m.greet>0,hello=greeting?Math.sin(m.greet/1.4*Math.PI)*.8:0;
   m.motion.facing=m.yaw;m.motion.intentHeading=moving?Math.atan2(m.vx,m.vz):undefined;m.motion.ready=playing?(reduced?.28:.32+Math.sin(time*3+i)*.07):0;m.motion.called=reduced?0:Math.max(pleased,hello);
   const cabinet=cabinets[m.cabinet];m.motion.lookX=greeting?playerX:playing?cabinet.x:m.x+Math.sin(m.yaw)*2;m.motion.lookZ=greeting?playerZ:playing?cabinet.z:m.z+Math.cos(m.yaw)*2;m.motion.lookY=greeting?1.4:1.95;m.rig.setExpression(greeting||pleased>.1?'happy':playing?'focused':'neutral');m.motion.skill=undefined;m.motion.jump=undefined;m.motion.juggle=undefined;m.motion.juggleTouch=undefined;m.motion.kickSide=undefined;if(m.social)m.socialPose(m.motion,m.social,m.socialAge,true,reduced);m.motion.stunAge=stunned?.age;m.motion.rooftopPose=stunned&&stunned.age>1.85?'dizzy':undefined;m.rig.update(m.x,m.z,dt,time,reduced,m.motion);reactions?.apply(`arcade-visitor-${i}`,m.rig.root,reduced);
   // A room-local console reach overlays only upper limbs, leaving native feet/body intact.
   m.consoleBlend+=((playing?1:0)-m.consoleBlend)*(1-Math.exp(-dt*7));
   const reach=(stunned?0:1)*m.consoleBlend*(1-Math.max(pleased,hello));for(let a=0;a<2;a++){const arm=m.arms[a],press=reduced?0:Math.sin(time*(a?5:2.3)+i)*.035;arm.shoulder.rotation.x+=(-.78+press-arm.shoulder.rotation.x)*reach;arm.elbow.rotation.x+=(-.64-press-arm.elbow.rotation.x)*reach;}
   m.shadow.position.x=m.x;m.shadow.position.z=m.z;
   const debug=debugStates[i];debug.x=m.x;debug.z=m.z;debug.phase=m.phase;debug.cabinet=m.cabinet;debug.yielding=m.yielding;debug.greeting=greeting;debug.visits=m.visits;debug.social=!!m.social;debug.socialAge=m.socialAge;debug.facing=m.yaw;debug.attentive=engaged;
  }
 }
 // Initial pose without creating an independent animation clock.
 for(const m of members)m.rig.update(m.x,m.z,0,0,reduced,m.motion);
 return{update,debugStates,jugglePoint(id:number,side:number,out:T.Vector3){const m=members[id];return out.set(m.x+Math.cos(m.yaw)*side*.108+Math.sin(m.yaw)*.45,.48,m.z-Math.sin(m.yaw)*side*.108+Math.cos(m.yaw)*.45);},focus(id:number|null){focusedId=id;},reserve(id:number,routine:SocialRoutine){const m=members[id];if(!m||disposed)return false;m.social=routine;m.socialAge=-1;m.vx=m.vz=0;return true;},setSocialAge(id:number,age:number){const m=members[id];if(m)m.socialAge=age;},release(id:number){const m=members[id];if(m){m.social=null;m.socialAge=-1;m.greetCooldown=4;m.greet=0;}},dispose(){if(disposed)return;disposed=true;for(const m of members){m.rig.dispose();m.shadow.removeFromParent();}shadowGeometry.dispose();shadowMaterial.dispose();}};
}
