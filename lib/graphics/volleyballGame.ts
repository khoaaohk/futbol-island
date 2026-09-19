import * as T from 'three';
import {VOLLEYBALL_NPCS} from '../town/volleyballNpcs';
import {createPlayer} from './player';
import {playerBatch} from './playerBatch';
import {DEFAULT_CUSTOMIZATION} from '../town/customization';
import type {NpcDefinition} from '../town/npcDialogues';
import type {BallReactions} from './ballReactions';

/** Four locals share a deterministic rally, driven by the island's existing clock. */
export function createVolleyballGame(scene:T.Scene,reactions:BallReactions){
 const root=new T.Group();root.name='pier-volleyball-game';scene.add(root);
 // Detached rigs retain world-space picking/interaction identity; only batches draw.
 const batchScene=new T.Scene();batchScene.name='volleyball-player-batches';root.add(batchScene);
 const homes=[{x:66,z:196},{x:68,z:200},{x:78,z:200},{x:76,z:196}];
 const entries=homes.map((home,i)=>{
  const definition:NpcDefinition={id:'volleyball-'+i,...VOLLEYBALL_NPCS[i],...home,character:i%2?'male':'female',face:i===2?'deep':i===0?'light':'warm',clothing:i<2?'sunset':'coast'};
  const rig=createPlayer(definition.id,i<2?'home':'away');rig.setAppearance({...DEFAULT_CUSTOMIZATION,...{character:definition.character,face:definition.face,clothing:definition.clothing}});rig.root.name=definition.id;rig.root.traverse(o=>o.userData.volleyballNpcId=definition.id);
  const drawn=new T.Scene();batchScene.add(drawn);const batch=playerBatch(drawn,48),fallback=new T.Group();fallback.name='volleyball-edge-'+i;fallback.add(rig.root);root.add(fallback);
  return {id:definition.id,definition,rig,batch,drawn,fallback,position:{...home,y:0},home,shoulders:['left','right'].map(side=>rig.root.getObjectByName(side+'-shoulder')!),elbows:['left','right'].map(side=>rig.root.getObjectByName(side+'-elbow')!)};
 });
 const pickRoots=entries.map(e=>e.rig.root);
 function drawPlayer(e:(typeof entries)[number]){
  e.batch.begin();e.batch.draw(e.rig.root);e.batch.end();
  // Preserve separate color/shadow frustum tests; do not draw an offscreen court.
  for(const object of e.drawn.children){const mesh=object as T.InstancedMesh;if(!mesh.visible)continue;mesh.frustumCulled=true;mesh.computeBoundingSphere();}
 }
 const geometry=new T.SphereGeometry(.22,16,12),stripeGeometry=new T.TorusGeometry(.221,.025,6,32),material=new T.MeshStandardMaterial({color:'#fff4d5',roughness:.8}),stripeMaterial=new T.MeshStandardMaterial({color:'#d6a552',roughness:.8});
 const ball=new T.Mesh(geometry,material);ball.name='rally-volleyball';ball.castShadow=true;root.add(ball);
 for(let i=0;i<3;i++){const stripe=new T.Mesh(stripeGeometry,stripeMaterial);stripe.rotation.set(i*Math.PI/3,i*Math.PI/3,0);ball.add(stripe);}
 // Alternating receive, set and return sequences on each side of the net.
 const contacts=[0,2,3,2,1,0,1,3,2,3,0,1],duration=1.55;
 const stats={clock:0,paused:false,source:0,target:2};
 const from=new T.Vector3(),to=new T.Vector3(),frustum=new T.Frustum(),matrix=new T.Matrix4(),bounds=new T.Sphere(new T.Vector3(72,2,198),17);
 function update(dt:number,camera:T.Camera,enabled:boolean,reduced:boolean,hoveredId:string|null){
  camera.updateMatrixWorld();frustum.setFromProjectionMatrix(matrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));root.visible=enabled&&camera.position.distanceTo(bounds.center)<140&&frustum.intersectsSphere(bounds);if(!root.visible)return;
  stats.paused=entries.some(e=>e.id===hoveredId||reactions.get('npc:'+e.id));const step=stats.paused?0:Math.min(.05,Math.max(0,dt));stats.clock+=step;
  const leg=Math.floor(stats.clock/duration)%contacts.length,t=(stats.clock%duration)/duration,source=contacts[leg],target=contacts[(leg+1)%contacts.length],cross=(source<2)!==(target<2);stats.source=source;stats.target=target;
  let poseChanged=false;
  for(const [i,e] of entries.entries()){
   const stun=reactions.get('npc:'+e.id);if(stats.paused&&!stun)continue;poseChanged=true;
   if(!stun){e.position.x=T.MathUtils.damp(e.position.x,e.home.x+Math.sin(stats.clock*1.3+i)*.16,5,step);e.position.z=T.MathUtils.damp(e.position.z,e.home.z+Math.cos(stats.clock+i)*.18,5,step);}
   const facing=Math.atan2(72-e.position.x,198-e.position.z),receive=i===target?T.MathUtils.smoothstep(t,.58,.98):0,follow=i===source?1-T.MathUtils.smoothstep(t,0,.3):0,action=Math.max(receive,follow);
   e.rig.update(e.position.x,e.position.z,stun?0:step,stats.clock,reduced,{facing,stunAge:stun?.age});e.rig.root.position.y=0;
   if(stun){reactions.apply('npc:'+e.id,e.rig.root,reduced);continue;}
   for(let arm=0;arm<2;arm++){e.shoulders[arm].rotation.set(-.3-action*.95,0,(arm?1:-1)*(.14-action*.07));e.elbows[arm].rotation.x=-.2-action*.12;}
   // A small ready crouch and occasional hop distinguish the return from standing idle.
   if(!reduced)e.rig.root.position.y=(i===source&&cross?Math.sin(Math.min(1,t/.3)*Math.PI)*.22:0)-receive*.045;
  }
  // At a screen edge, native per-part culling avoids submitting hidden limbs.
  // Fully visible characters retain batching; fallback rigs still cast shadows.
  for(const e of entries){const p=e.rig.root.position;from.set(p.x,p.y+1,p.z);const inside=frustum.planes.every(plane=>plane.distanceToPoint(from)>2.5);if(inside&&(poseChanged||!e.drawn.visible))drawPlayer(e);e.drawn.visible=inside;e.fallback.visible=!inside;}
  const a=entries[source].position,b=entries[target].position,dx=b.x-a.x,dz=b.z-a.z,length=Math.hypot(dx,dz),reach=.43;
  from.set(a.x+dx/length*reach,1.32,a.z+dz/length*reach);to.set(b.x-dx/length*reach,1.32,b.z-dz/length*reach);
  ball.position.copy(from).lerp(to,t);ball.position.y+=Math.sin(Math.PI*t)*(cross?3.15:1.45);if(!stats.paused)ball.rotation.z+=step*3;
  root.userData.paused=stats.paused;root.userData.rallyLeg=leg;
 }
 const pick=(ray:T.Raycaster)=>{if(!root.visible)return null;const hit=ray.intersectObjects(pickRoots,true).find(h=>h.distance<90&&h.object.userData.volleyballNpcId&&!reactions.get('npc:'+h.object.userData.volleyballNpcId));return hit?entries.find(e=>e.id===hit.object.userData.volleyballNpcId)?.definition??null:null;};
 const nearest=(p:{x:number;y:number;z:number},max=6)=>{if(!root.visible)return null;return entries.filter(e=>!reactions.get('npc:'+e.id)).map(e=>({e,d:Math.hypot(e.position.x-p.x,e.position.z-p.z,p.y)})).filter(e=>e.d<max).sort((a,b)=>a.d-b.d)[0]?.e.definition??null;};
 // Initialize the players before the first visible frame, even if a modal is open.
 entries.forEach((e,i)=>{e.rig.update(e.position.x,e.position.z,0,0,true,{facing:i<2?Math.PI/2:-Math.PI/2});e.rig.root.position.y=0;});
 entries.forEach(drawPlayer);
 return {root,entries,ball,stats,update,pick,nearest,dispose(){entries.forEach(e=>{e.batch.dispose();e.rig.dispose();});root.removeFromParent();geometry.dispose();stripeGeometry.dispose();material.dispose();stripeMaterial.dispose();}};
}
