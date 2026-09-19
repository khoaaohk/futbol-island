import * as T from 'three';
import {createPlayer} from '../graphics/player';
import {playerBatch} from '../graphics/playerBatch';
import type {BallReactions} from '../graphics/ballReactions';
import {PRACTICE_NPCS} from './practiceNpcs';
import {DEFAULT_CUSTOMIZATION} from './customization';
import type {NpcDefinition} from './npcDialogues';

type Position={x:number;y:number;z:number};
/** Existing wall drills retain their batched rendering and now support talk and ball reactions. */
export function createCoachPractice(scene:T.Scene,reactions?:BallReactions){
 const batch=playerBatch(scene,128),root=new T.Group();root.name='coaches-wall-practice';scene.add(root);
 const sphere=new T.Sphere(new T.Vector3(156,1,-20),15),frustum=new T.Frustum(),matrix=new T.Matrix4();
 const geo=new T.SphereGeometry(.21,12,8),mat=new T.MeshStandardMaterial({color:'#fff2d6',roughness:.85});
 const panelGeo=new T.CircleGeometry(.066,5),panelMat=new T.MeshStandardMaterial({color:'#34483f',roughness:1});
 const balls=[150,162].map(x=>{const b=new T.Mesh(geo,mat);b.position.set(x,.21,-20);b.castShadow=true;root.add(b);for(const xyz of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]]){const direction=new T.Vector3(...xyz),p=new T.Mesh(panelGeo,panelMat);p.position.copy(direction.clone().multiplyScalar(.212));p.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),direction);b.add(p);}return b;});
 const entries=PRACTICE_NPCS.map((definition,index)=>{
  const rig=createPlayer(index?'coach-wall-green':'coach-wall-gold',index?'away':'home',false),position={x:definition.x,y:.02,z:definition.z};rig.setAppearance({...DEFAULT_CUSTOMIZATION,character:definition.character,face:definition.face,clothing:definition.clothing,body:definition.body??'balanced'});rig.update(position.x,position.z,0,0,false,{facing:Math.PI});rig.root.position.y=position.y;rig.root.traverse(object=>{object.userData.practiceNpcId=definition.id;});
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=160;const ctx=canvas.getContext('2d')!;ctx.fillStyle='#294f43';ctx.beginPath();ctx.roundRect(3,3,506,154,44);ctx.fill();ctx.textAlign='center';ctx.fillStyle='#fff0cc';ctx.font='700 43px sans-serif';ctx.fillText(definition.name,256,66);ctx.fillStyle='#e6cb8b';ctx.font='700 29px sans-serif';ctx.fillText('WALL PRACTICE · TALK',256,115);
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;const material=new T.SpriteMaterial({map:texture,depthTest:true,depthWrite:false});const label=new T.Sprite(material);label.scale.set(3.5,1.094,1);label.position.set(position.x,2.5,position.z);label.userData.practiceNpcId=definition.id;root.add(label);
  return {id:definition.id,definition,position,offset:{x:0,z:0},rig,label,texture,material,clock:index*1.7};
 });
 const stats={visible:false,phase:[0,0],ballZ:[-20,-20]};let enabledNow=true;
 const nearest=(player:Position,maxDistance=6)=>{if(!enabledNow)return null;let best:NpcDefinition|null=null,distance=maxDistance;for(const entry of entries){if(reactions?.get('npc:'+entry.id))continue;const d=Math.hypot(entry.position.x-player.x,entry.position.y-player.y,entry.position.z-player.z);if(d<distance){distance=d;best=entry.definition;}}return best;};
 const pick=(raycaster:T.Raycaster)=>{if(!stats.visible)return null;for(const entry of entries)entry.rig.root.updateMatrixWorld(true);const hits=raycaster.intersectObjects(entries.flatMap(entry=>[entry.rig.root,entry.label]),true);const hit=hits.find(hit=>hit.distance<90&&hit.object.visible&&hit.object.userData.practiceNpcId&&!reactions?.get('npc:'+hit.object.userData.practiceNpcId));return hit?entries.find(entry=>entry.id===hit.object.userData.practiceNpcId)?.definition??null:null;};
 return {root,stats,entries,nearest,pick,update(dt:number,_time:number,camera:T.Camera,enabled:boolean,reduced=false,hoveredId:string|null=null){
  enabledNow=enabled;camera.updateMatrixWorld();frustum.setFromProjectionMatrix(matrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
  const visible=enabled&&frustum.intersectsSphere(sphere)&&camera.position.distanceTo(sphere.center)<150;root.visible=visible;stats.visible=visible;batch.begin();
  if(visible){for(let i=0;i<entries.length;i++){
    const entry=entries[i];if(entry.id===hoveredId){batch.draw(entry.rig.root);continue;}const stunned=reactions?.get('npc:'+entry.id);if(!stunned)entry.clock+=Math.min(dt,.1);const phase=entry.clock%4.8,x=entry.definition.x;
    const reset=phase>2?Math.sin((phase-2)/2.8*Math.PI):0,px=x+entry.offset.x+reset*.25,pz=-20+entry.offset.z+reset*.28;
    entry.position.x=px;entry.position.z=pz;
    entry.rig.update(px,pz,stunned?0:dt,entry.clock,reduced,{facing:Math.PI,kick:!stunned&&phase<.65?phase/.65:undefined,receive:!stunned&&phase>1.4&&phase<1.95?Math.sin((phase-1.4)/.55*Math.PI):0,stunAge:stunned?.age,rooftopPose:stunned&&stunned.age>1.85?'dizzy':undefined});entry.rig.root.position.y=.02;reactions?.apply('npc:'+entry.id,entry.rig.root,reduced);batch.draw(entry.rig.root);
    const start=-20.45,wall=-29.10;let z=start;
    if(phase>=.234&&phase<.94)z=T.MathUtils.lerp(start,wall,(phase-.234)/.706);
    else if(phase>=.94&&phase<1.64)z=T.MathUtils.lerp(wall,start,(phase-.94)/.7);
    else if(phase>=1.64)z=pz-.45;
    balls[i].position.set(phase>1.64?px:x,.235,z);balls[i].rotation.x=z/.21;stats.phase[i]=phase;stats.ballZ[i]=z;entry.label.position.set(px,2.5,pz);entry.label.visible=!stunned;
   }}batch.end();
 },dispose(){batch.dispose();entries.forEach(entry=>{entry.rig.dispose();entry.texture.dispose();entry.material.dispose();});root.removeFromParent();geo.dispose();mat.dispose();panelGeo.dispose();panelMat.dispose();}};
}
