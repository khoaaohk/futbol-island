import {applyTruckProtest} from './truckReactions';
import * as T from 'three';
import type {BallReactions} from './ballReactions';
import {createNpcRide} from './npcRide';
import {createPlayer} from './player';
import {createNpcActivity} from './npcActivity';
import {advanceNpcRoutines,createNpcRoutine,safeNpcPath} from '../town/npcBehavior';
import {DEFAULT_CUSTOMIZATION} from '../town/customization';
import {NPC_DIALOGUES,type NpcDefinition} from '../town/npcDialogues';
type Position={x:number;y:number;z:number};
type Placement={isWalkable:(x:number,z:number)=>boolean;heightAt:(x:number,z:number)=>number};
export function createIslandNpcs(scene:T.Scene,placement:Placement,reactions?:BallReactions){
 const root=new T.Group();root.name='island-townsfolk';scene.add(root);
 const textures:T.Texture[]=[],materials:T.Material[]=[];
 const canTravel=(a:{x:number;y:number;z:number},b:{x:number;y:number;z:number})=>safeNpcPath(a,b,placement.isWalkable,placement.heightAt);
 const entries=NPC_DIALOGUES.map((definition,index)=>{
  let x=definition.x,z=definition.z;
  search:for(let radius=0;radius<=12;radius+=1){for(let angle=0;angle<16;angle++){const px=definition.x+Math.cos(angle*Math.PI/8)*radius,pz=definition.z+Math.sin(angle*Math.PI/8)*radius;if(placement.isWalkable(px,pz)){x=px;z=pz;break search;}}}
  const rig=createPlayer(`town-npc-${definition.id}`,'home');rig.setAppearance({...DEFAULT_CUSTOMIZATION,character:definition.character,face:definition.face,clothing:definition.clothing,body:definition.body??'balanced'});root.add(rig.root);
  rig.root.traverse(object=>{object.userData.npcId=definition.id;});
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=160;const ctx=canvas.getContext('2d')!;
  ctx.fillStyle='#294f43';ctx.beginPath();ctx.roundRect(3,3,506,154,44);ctx.fill();ctx.textAlign='center';ctx.fillStyle='#fff0cc';ctx.font='700 43px sans-serif';ctx.fillText(definition.name,256,66);ctx.fillStyle='#e6cb8b';ctx.font='700 29px sans-serif';ctx.fillText('LET’S TALK',256,115);
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;textures.push(texture);const material=new T.SpriteMaterial({map:texture,depthTest:true,depthWrite:false});materials.push(material);
  const label=new T.Sprite(material);label.position.y=2.5;label.scale.set(3.5,1.094,1);label.userData.npcId=definition.id;rig.root.add(label);
  const position={x,y:placement.heightAt(x,z),z};rig.update(x,z,0,0,true);rig.root.position.y=position.y;
  const activity=definition.activity?createNpcActivity(definition.activity,rig):null;
  activity?.root.traverse(object=>{object.userData.npcId=definition.id;});
  const ride=definition.travel&&definition.travel!=='run'?createNpcRide(definition.travel,definition.id):null;if(ride)root.add(ride.root);
  const routine=createNpcRoutine(index,Boolean(activity),position);if(definition.travel){routine.speed=definition.travel==='run'?2.8:definition.travel==='skateboard'?3.8:4.5;routine.restDuration=.6;routine.socialCooldown=Infinity;}
  const route=[{...position}];if(!activity)for(let step=0;step<4;step++){const angle=index*.7+step*Math.PI/2,point={x:x+Math.sin(angle)*(definition.travel?6:2.5+index%3),z:z+Math.cos(angle)*(definition.travel?6:2.5+index%3),y:position.y};point.y=placement.heightAt(point.x,point.z);if(canTravel(position,point))route.push(point);}
  if(definition.travel){
   let best:{x:number;y:number;z:number}[]=[];let length=0;
   for(let direction=0;direction<8;direction++){const angle=direction*Math.PI/4;const ends=[-1,1].map(sign=>{let end={...position};for(let d=.5;d<=7;d+=.5){const next={x:x+Math.sin(angle)*d*sign,y:position.y,z:z+Math.cos(angle)*d*sign};if(!canTravel(position,next))break;end=next;}return end;});const span=Math.hypot(ends[0].x-ends[1].x,ends[0].z-ends[1].z);if(span>length){best=ends;length=span;}}
   if(length>1){route.splice(0,route.length,{...position},...best);routine.restDuration=1.2;}
  }
  return {id:definition.id,definition,rig,position,home:{x,z},label,activity,ride,lastPosition:{x,z},workTime:index*1.7,worker:Boolean(activity),route,routine,near:false,stunned:false,labelStatus:'',labelCanvas:canvas,labelTexture:texture,rigElapsed:0,distance:Infinity,leftShoulder:rig.root.getObjectByName('left-shoulder'),rightShoulder:rig.root.getObjectByName('right-shoulder'),rightElbow:rig.root.getObjectByName('right-elbow')};
 });
 const neighborhood:typeof entries=[],frozen=new Set<string>(),entryById=new Map(entries.map(entry=>[entry.id,entry]));
 const viewFrustum=new T.Frustum(),viewMatrix=new T.Matrix4(),viewSphere=new T.Sphere();
 const stats={posed:0,offscreenSkipped:0};
 const truckWitnesses=new Map<string,{remaining:number;x:number;z:number}>();
 const reactToTruck=(id:string,x:number,z:number)=>{truckWitnesses.set(id,{remaining:4.8,x,z});};
 const nearest=(player:Position,maxDistance=6)=>{let best:NpcDefinition|null=null,distance=maxDistance;for(const entry of entries){if(reactions?.get('npc:'+entry.id))continue;const d=Math.hypot(entry.position.x-player.x,entry.position.z-player.z,entry.position.y-player.y);if(d<distance){distance=d;best=entry.definition;}}return best;};
 const update=(dt:number,time:number,reduced:boolean,player:Position,paused:boolean,desktop=false,hoveredId:string|null=null,camera?:T.Camera)=>{
  stats.posed=stats.offscreenSkipped=0;if(camera){camera.updateMatrixWorld();viewMatrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);viewFrustum.setFromProjectionMatrix(viewMatrix);}
  for(const entry of entries){entry.distance=Math.hypot(entry.position.x-player.x,entry.position.z-player.z,entry.position.y-player.y);entry.near=entry.distance<7;entry.stunned=Boolean(reactions?.get('npc:'+entry.id));}
  neighborhood.length=0;frozen.clear();
  for(const entry of entries){if(entry.distance<(desktop?112:88)||entry.routine.partner!==null||entry.stunned)neighborhood.push(entry);if(hoveredId!==null&&(entry.id===hoveredId||entry.routine.partner===hoveredId))frozen.add(entry.id);}
  for(const [id,witness] of truckWitnesses){witness.remaining-=paused?0:dt;if(witness.remaining<=0)truckWitnesses.delete(id);else frozen.add(id);}
  advanceNpcRoutines(neighborhood,paused?0:dt,canTravel,frozen);
  for(const id of truckWitnesses.keys())if(id!==hoveredId)frozen.delete(id);
  for(const entry of entries){if(frozen.has(entry.id))continue;const distance=entry.distance;entry.rig.root.visible=distance<(desktop?96:72);if(entry.ride)entry.ride.root.visible=entry.rig.root.visible&&!entry.stunned;entry.rigElapsed+=paused?0:dt;if(!entry.rig.root.visible&&!entry.stunned)continue;if(camera&&!entry.near&&!entry.stunned){viewSphere.center.set(entry.position.x,entry.position.y+1.5,entry.position.z);viewSphere.radius=5+Math.max(0,entry.position.y)*1.4;if(!viewFrustum.intersectsSphere(viewSphere)){entry.rig.root.position.set(entry.position.x,entry.position.y,entry.position.z);if(entry.ride)entry.ride.root.position.copy(entry.rig.root.position);entry.label.visible=false;stats.offscreenSkipped++;continue;}}if(distance>32&&!entry.definition.travel&&!['walk','approach'].includes(entry.routine.mode)&&!entry.stunned&&entry.rigElapsed<.1)continue;const poseDt=Math.min(entry.rigElapsed,.1);entry.rigElapsed=0;const r=entry.routine,stunned=reactions?.get('npc:'+entry.id),partner=r.partner===null?undefined:entryById.get(r.partner);
   let facing=entry.near?Math.atan2(player.x-entry.position.x,player.z-entry.position.z):r.mode==='social'&&partner?Math.atan2(partner.position.x-entry.position.x,partner.position.z-entry.position.z):r.mode==='work'?entry.definition.workYaw:undefined;
   if(r.mode==='rest')facing=(entry.definition.workYaw??0)+(reduced?0:Math.sin(r.clock*.35)*.4);
   if(entry.definition.travel&&!entry.near){const dx=entry.position.x-entry.lastPosition.x,dz=entry.position.z-entry.lastPosition.z;facing=Math.hypot(dx,dz)>.0001?Math.atan2(dx,dz):entry.rig.root.rotation.y;}
   const witness=truckWitnesses.get(entry.id);if(witness)facing=Math.atan2(witness.x-entry.position.x,witness.z-entry.position.z);
   const speed=poseDt>0?Math.hypot(entry.position.x-entry.lastPosition.x,entry.position.z-entry.lastPosition.z)/poseDt:0;
   stats.posed++;entry.rig.update(entry.position.x,entry.position.z,paused||stunned?0:poseDt,witness?time:r.clock,reduced,{travelMode:entry.ride?'scooter':'walk',stunAge:stunned?.age,rooftopPose:stunned&&stunned.age>1.85?'dizzy':undefined,facing});entry.rig.root.position.y=entry.position.y;
   const working=!witness&&!paused&&!entry.near&&!stunned&&r.mode==='work';if(working)entry.workTime+=poseDt;entry.activity?.update(poseDt,entry.workTime,reduced,working);
   if(!paused&&!stunned&&!reduced&&entry.rightShoulder&&entry.rightElbow){
    if(entry.near&&r.waveTime<2.1){entry.rightShoulder.rotation.set(-.25,0,2.15+Math.sin(r.waveTime*10)*.15);entry.rightElbow.rotation.x=-.8;}
    else if(r.mode==='social'&&partner&&((Math.floor(r.age/1.5)%2===0)===(entry.id<partner.id))){entry.rightShoulder.rotation.set(-.55-Math.sin(r.age*5)*.12,0,.3);entry.rightElbow.rotation.x=-.85;}
   }
   entry.ride?.update(entry.position.x,entry.position.y,entry.position.z,entry.rig.root.rotation.y,paused?0:poseDt,speed,entry.rig.root.visible&&!stunned);entry.lastPosition.x=entry.position.x;entry.lastPosition.z=entry.position.z;
   if(entry.definition.travel==='skateboard'&&!stunned){entry.leftShoulder?.rotation.set(.15,0,-.25);entry.rightShoulder?.rotation.set(.15,0,.25);}
   if(witness&&!stunned)applyTruckProtest(entry.rig.root,time,reduced);else if(!stunned)entry.rig.root.rotation.z=0;
   reactions?.apply('npc:'+entry.id,entry.rig.root,reduced);entry.label.visible=distance<(desktop?60:45)&&!stunned&&!witness;
   const status=entry.near?'LET’S TALK':r.mode==='social'?'CATCHING UP':r.mode==='approach'?'SAYING HELLO':entry.definition.pursuit??'TAKING A BREAK';
   if(entry.label.visible&&status!==entry.labelStatus){entry.labelStatus=status;const ctx=entry.labelCanvas.getContext('2d')!;ctx.clearRect(0,0,512,160);ctx.fillStyle='#294f43';ctx.beginPath();ctx.roundRect(3,3,506,154,44);ctx.fill();ctx.textAlign='center';ctx.fillStyle='#fff0cc';ctx.font='700 43px sans-serif';ctx.fillText(entry.definition.name,256,66);ctx.fillStyle='#e6cb8b';ctx.font='700 25px sans-serif';ctx.fillText(status,256,115,470);entry.labelTexture.needsUpdate=true;}
  }
 };
 const visibleInScene=(object:T.Object3D)=>{for(let current:T.Object3D|null=object;current;current=current.parent){if(!current.visible)return false;}return true;};
 const pick=(raycaster:T.Raycaster)=>{if(!root.visible)return null;const hit=raycaster.intersectObject(root,true).find(hit=>hit.distance<90&&visibleInScene(hit.object)&&hit.object.userData.npcId&&!reactions?.get('npc:'+hit.object.userData.npcId));return hit?NPC_DIALOGUES.find(npc=>npc.id===hit.object.userData.npcId)??null:null;};
 return {reactToTruck,stats,root,entries,update,nearest,pick,dispose:()=>{entries.forEach(entry=>{entry.activity?.dispose();entry.ride?.dispose();entry.rig.dispose();});textures.forEach(texture=>texture.dispose());materials.forEach(material=>material.dispose());root.removeFromParent();}};
}
