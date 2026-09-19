import * as T from 'three';
import {createCharacterGlow} from './characterGlow';
import type {createIslandNpcs} from './islandNpcs';
export type OnboardingNpcTarget={name:string;left:number;top:number;width:number;height:number};
/** Temporarily frame a real local for the conversation walkthrough. */
export function createOnboardingNpcFocus(npcs:ReturnType<typeof createIslandNpcs>){
 let selected:typeof npcs.entries[number]|undefined,glow:ReturnType<typeof createCharacterGlow>|undefined;
 let blend=0;const focusPosition=new T.Vector3(),focusQuaternion=new T.Quaternion(),focusMatrix=new T.Matrix4();
 let saved:{position:T.Vector3;quaternion:T.Quaternion}|null=null;
 const forward=new T.Vector3(16,23,33),right=new T.Vector3(33,0,-16).normalize(),up=new T.Vector3().crossVectors(forward,right).normalize();
 const restore=(camera:T.PerspectiveCamera)=>{if(saved){camera.position.copy(saved.position);camera.quaternion.copy(saved.quaternion);camera.updateMatrixWorld();saved=null;}};
 return {restore,update(camera:T.PerspectiveCamera,enabled:boolean,player:{x:number;z:number},width:number,height:number,dt:number,reduced:boolean):OnboardingNpcTarget|null{
  blend=reduced?(enabled?1:0):T.MathUtils.clamp(blend+(enabled?1:-1)*dt/.55,0,1);
  if(!enabled&&blend===0){glow?.dispose();glow=undefined;selected=undefined;return null;}
  if(!selected){selected=npcs.entries.filter(e=>!e.stunned).sort((a,b)=>Math.hypot(a.position.x-player.x,a.position.z-player.z)-Math.hypot(b.position.x-player.x,b.position.z-player.z))[0];if(selected)glow=createCharacterGlow(selected.rig.root);}
  if(!selected)return null;
  selected.rig.root.visible=true;glow?.update(true,dt,reduced);
  saved={position:camera.position.clone(),quaternion:camera.quaternion.clone()};
  const target=new T.Vector3(selected.position.x,selected.position.y+1,selected.position.z);
  if(width<=600)target.addScaledVector(up,-3.3);else target.addScaledVector(right,4.2);
  focusPosition.copy(target).addScaledVector(forward,.38);focusMatrix.lookAt(focusPosition,target,camera.up);focusQuaternion.setFromRotationMatrix(focusMatrix);
  const easing=blend*blend*(3-2*blend);camera.position.lerp(focusPosition,easing);camera.quaternion.slerp(focusQuaternion,easing);camera.updateMatrixWorld();
  if(!enabled)return null;
  const head=new T.Vector3(selected.position.x,selected.position.y+3,selected.position.z).project(camera),foot=new T.Vector3(selected.position.x,selected.position.y,selected.position.z).project(camera);
  const labelCenter=selected.label.getWorldPosition(new T.Vector3()),labelScale=selected.label.getWorldScale(new T.Vector3()),cameraRight=new T.Vector3(1,0,0).applyQuaternion(camera.quaternion);
  const labelLeft=labelCenter.clone().addScaledVector(cameraRight,-labelScale.x/2).project(camera),labelRight=labelCenter.clone().addScaledVector(cameraRight,labelScale.x/2).project(camera);
  const left=Math.min((labelLeft.x+1)*width/2,(head.x+1)*width/2-38)-8,rightEdge=Math.max((labelRight.x+1)*width/2,(head.x+1)*width/2+38)+8;
  return {name:selected.definition.name,left,top:(1-head.y)*height/2-10,width:rightEdge-left,height:Math.max(70,(head.y-foot.y)*height/2+25)};
 },dispose(){glow?.dispose();}};
}
