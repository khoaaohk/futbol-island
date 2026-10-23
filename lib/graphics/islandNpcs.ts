import {createCourtFreestyle,linkFreestylePair} from './courtFreestyle';
import {FREESTYLE_PAIRS} from './freestyleRoutine';
import {CAFE_NPC_ROUTES,onCafeRoute} from '../town/cafeRoutes';
import {applyTruckProtest} from './truckReactions';
import * as T from 'three';
import {heatOptions} from './heatTier';
import type {BallReactions} from './ballReactions';
import {createNpcRide} from './npcRide';
import {createPlayer} from './player';
import {createNpcActivity} from './npcActivity';
import {advanceNpcRoutines,createNpcRoutine,safeNpcPath} from '../town/npcBehavior';
import {DEFAULT_CUSTOMIZATION} from '../town/customization';
import {npcDress} from '../town/beanLooks';
import {NPC_DIALOGUES,type NpcDefinition} from '../town/npcDialogues';
import {pickTagFocus} from './npcTagFocus';
import {npcSeatPose} from './npcSeatPose';
import {beanShapeOf} from './beanGearFit';
import {AGE_PROFILES} from '../town/townsfolkCast';
import {applyHighFive} from './highFivePose';
import {HIGH_FIVES,highFiveSkill} from '../town/highFive';
import type {SkillMotion} from './skillMoves';
import {EMOTE,NPC_STEP_SPEED,emoteSeconds,npcStepDistance} from '../town/emoteReact';import {applyEmoteArms,applyEmoteMove,emoteBody} from './emotePose';
import {applyApplause,applyCelebrationArms,applyRideEmote} from './celebrations';import {npcIxAt,type NpcIx,type NpcScript} from '../town/npcEmoteSets';import {actorMotion,type ActorPose,type BallRigMotion} from '../town/emotePass';import {SEAT_TIMES,createSeatSM,openFront,seatFacing,standUp as seatStandUp,stepSeat} from '../town/npcStandUp';import {moveAnswerAt,moveAnswerFor,type MoveAnswer,type MoveAnswerOut} from '../town/moveEmotes';
type Position={x:number;y:number;z:number};
type Placement={isWalkable:(x:number,z:number)=>boolean;heightAt:(x:number,z:number)=>number};
/** Heat pass 5: a townsperson's appearance is set once and never takes a costume, so the classic body meshes the bean skin hides
 * (userData.beanHidden) can never show again. Their geometry data (≈ 0.37 MB per townsperson, ≈ 25 MB for the 66) is released
 * for one shared empty geometry. Picking already ignores hidden meshes; joints (Groups) and the bean meshes are untouched.
 * Heat audit Sep 30 2026: their matrices are frozen too, so the renderer's per-frame matrix refresh no longer recomposes and multiplies
 * ~3,100 of them (it still visits them; they have no children). */
const RELEASED=new T.BufferGeometry();
function releaseHiddenClassic(root:T.Object3D){root.traverse(o=>{if(o instanceof T.Mesh&&o.userData.beanHidden&&o.geometry!==RELEASED){o.geometry.dispose();o.geometry=RELEASED;o.matrixAutoUpdate=false;o.matrixWorldAutoUpdate=false;}});detachClassic(root);}
/** NPC heat fix 2 (Oct 12 2026, user-approved): the classic parts above are also taken OFF the scene graph, so the renderer's
 * matrix refresh, render-list build and shadow traversal no longer visit them (≈ 37 of a townsperson's ≈ 60 objects: the 35
 * released meshes, the hidden classic jersey with its shirt-number decal, and the classic long-hair group). A part counts as
 * classic-only when the bean skin flagged it (userData.beanHidden), or it is a hidden non-bean mesh whose children are all
 * classic-only, or it is the classic long-hair group. Joints (Groups the bean skin reads), bean meshes (userData.beanPart, even a
 * hidden bean hat) and everything added later (name tag, glow shells, activity props) stay. The detached parts keep their
 * materials in the rig's lists (rig.dispose frees them); their geometry is the shared empty RELEASED one or the rig's own spine
 * surface / number decal (also freed by rig.dispose). Nothing re-shows them: a townsperson's appearance is set once (no costume,
 * no setAppearance/setShirtNumber later), so the skin's restore never runs; picking, the name tag, npcShadowBatch (skips
 * beanHidden and hidden meshes) and the onboarding glow (shells only on what is in the graph) see only the drawn parts. */
const classicOnly=(o:T.Object3D):boolean=>o.userData.beanHidden===true||(o instanceof T.Mesh&&!o.visible&&!o.userData.beanPart&&o.children.every(classicOnly))||(o.name==='female-long-hair'&&o.children.every(classicOnly));
function detachClassic(root:T.Object3D){const off:T.Object3D[]=[];const visit=(o:T.Object3D)=>{for(const child of o.children){if(classicOnly(child))off.push(child);else visit(child);}};visit(root);for(const o of off)o.removeFromParent();return off.length;}
/** NPC heat fix 1 (Oct 12 2026, user-approved): beyond FAR_POSE metres (from the player, like the older 32 m rule) a walking or
 * idle townsperson solves its pose at 10 Hz. The ticks are phase-locked to one shared clock with a per-townsperson offset
 * (poseSlot, golden-ratio spread over the 0.1 s step), so about a third of them pose on any 30 fps frame and the spread never
 * collapses (a per-entry timer reset on pose drifts into lock-step after frame-time hiccups). The root still follows the route
 * position every frame, so it glides smoothly; only the skeletal solve is spaced out (poseDt carries the time since the last
 * solve, so gait phase is unchanged). Riders and runners (travel), stunned townsfolk, truck witnesses and anyone within FAR_POSE
 * pose every frame; court freestylers keep the older 32 m rule (their ball follows the solved feet). */
const FAR_POSE=20,POSE_HZ=10,MOVING_RANGE=35;
/** Emote answer (user, Oct 22 2026): a raised arm for Wave / High five, a hop for Cheer / Well played; nothing while idle or with reduced motion (the bubble stays). */
const HF_SKILL={type:'highFive' as const,progress:0,side:-1 as -1|1},HF_MOTION={skill:HF_SKILL as SkillMotion};
/** The townsperson's half of Pass it / Juggle with me (lib/town/emotePass.ts): the rig's own strike (wind-up, planted foot, swing through, ball released on the contact frame), the trap and the keep-up touches. Reused object: no allocation per frame. */
const PASS_MOTION:BallRigMotion&{lookX:number;lookY:number;lookZ:number;strikeX:number;strikeZ:number}={lookX:0,lookY:.3,lookZ:0,strikeX:0,strikeZ:.5};
function npcPassMotion(a:ActorPose|null,ball:{x:number;y:number;z:number},scale:number,reduced:boolean){
 if(!a||reduced)return null;const m=PASS_MOTION;
 actorMotion(a,0,m);m.lookX=ball.x;m.lookY=ball.y;m.lookZ=ball.z;m.strikeZ=.5/Math.max(.1,scale);return m;
}
function npcEmoteMotion(fx:{kind:number;age:number;v:number},reduced:boolean):{called?:number;jump?:{progress:number;height:number};skill?:SkillMotion}|null{
 // a high five sequence poses the arms itself (lib/graphics/highFivePose.ts); its arcade windows (highFive / fistBump) go through the rig's skill layer
 if(fx.kind>=0&&!reduced&&fx.v>=0)return highFiveSkill(HF_SKILL,fx.v,1,fx.age)?HF_MOTION:null;
 if(fx.kind<0||reduced||fx.v>=0)return null;
 const b=emoteBody(fx.kind,fx.age,emoteSeconds(fx.kind));
 return b.jump?{jump:b.jump}:{called:b.called};
}
export function createIslandNpcs(scene:T.Scene,placement:Placement,reactions?:BallReactions){
 const root=new T.Group();root.name='island-townsfolk';scene.add(root);
 const textures:T.Texture[]=[],materials:T.Material[]=[];
 const canTravel=(a:{x:number;y:number;z:number},b:{x:number;y:number;z:number})=>safeNpcPath(a,b,placement.isWalkable,placement.heightAt);
 const entries=NPC_DIALOGUES.map((definition,index)=>{
  const authoredRoute=CAFE_NPC_ROUTES[definition.id];
  let x=authoredRoute?.[0].x??definition.x,z=authoredRoute?.[0].z??definition.z;
  search:for(let radius=0;radius<=12&&!authoredRoute&&!definition.pose;radius+=1){for(let angle=0;angle<16;angle++){const px=definition.x+Math.cos(angle*Math.PI/8)*radius,pz=definition.z+Math.sin(angle*Math.PI/8)*radius;if(placement.isWalkable(px,pz)){x=px;z=pz;break search;}}}
  if(definition.floor){x=definition.x;z=definition.z;} // a boat deck (Oct 15 2026): keep the exact spot, never snap ashore
  const rig=createPlayer(`town-npc-${definition.id}`,'home');rig.setAppearance({...DEFAULT_CUSTOMIZATION,character:definition.character,face:definition.face,clothing:definition.clothing,body:definition.body??'balanced'});const dress=npcDress(definition);rig.setBeanLook(dress.look,dress.outfit);releaseHiddenClassic(rig.root);root.add(rig.root);
  if(definition.age&&definition.age!=='adult')rig.setProfile(AGE_PROFILES[definition.age]); // townsfolk cast: children, teens and grandparents (townsfolkCast.ts)
  rig.root.traverse(object=>{object.userData.npcId=definition.id;});
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=160;const ctx=canvas.getContext('2d')!;
  ctx.fillStyle='#294f43';ctx.beginPath();ctx.roundRect(3,3,506,154,44);ctx.fill();ctx.textAlign='center';ctx.fillStyle='#fff0cc';ctx.font='700 43px sans-serif';ctx.fillText(definition.name,256,66);ctx.fillStyle='#e6cb8b';ctx.font='700 29px sans-serif';ctx.fillText('LET’S TALK',256,115);
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;textures.push(texture);const material=new T.SpriteMaterial({map:texture,depthTest:true,depthWrite:false});materials.push(material);
  const label=new T.Sprite(material);label.visible=false;label.position.y=2.5;label.scale.set(3.5/rig.profileScale,1.094/rig.profileScale,1);label.updateMatrix();label.matrixAutoUpdate=false;label.userData.npcId=definition.id;rig.root.add(label);
  const position={x,y:authoredRoute?.[0].y??definition.floor?.()??placement.heightAt(x,z),z};rig.update(x,z,0,0,true);rig.root.position.y=position.y;
  const freestyle=definition.freestyle===undefined?null:createCourtFreestyle(rig,definition.freestyle,definition.id);
  const activity=definition.activity?createNpcActivity(definition.activity,rig):null;
  if(freestyle)freestyle.ball.userData.npcId=definition.id;
  activity?.root.traverse(object=>{object.userData.npcId=definition.id;});
  const ride=definition.travel&&definition.travel!=='run'?createNpcRide(definition.travel,definition.id):null;if(ride)root.add(ride.root);
  const seat=definition.pose?npcSeatPose(definition.pose,rig.profileScale,beanShapeOf(rig.root)):undefined;
  const routine=createNpcRoutine(index,Boolean(activity||freestyle||seat),position);if(seat)routine.socialCooldown=Infinity;if(definition.travel){routine.speed=definition.travel==='run'?2.8:definition.travel==='skateboard'?3.8:4.5;routine.restDuration=.6;routine.socialCooldown=Infinity;}
  if(freestyle)routine.socialCooldown=Infinity;
  const route=[{...position}];if(!activity&&!freestyle&&!seat&&!definition.floor)for(let step=0;step<4;step++){const angle=index*.7+step*Math.PI/2,point={x:x+Math.sin(angle)*(definition.travel?6:2.5+index%3),z:z+Math.cos(angle)*(definition.travel?6:2.5+index%3),y:position.y};point.y=placement.heightAt(point.x,point.z);if(canTravel(position,point))route.push(point);}
  if(definition.travel){
   let best:{x:number;y:number;z:number}[]=[];let length=0;
   for(let direction=0;direction<8;direction++){const angle=direction*Math.PI/4;const ends=[-1,1].map(sign=>{let end={...position};for(let d=.5;d<=7;d+=.5){const next={x:x+Math.sin(angle)*d*sign,y:position.y,z:z+Math.cos(angle)*d*sign};if(!canTravel(position,next))break;end=next;}return end;});const span=Math.hypot(ends[0].x-ends[1].x,ends[0].z-ends[1].z);if(span>length){best=ends;length=span;}}
   if(length>1){route.splice(0,route.length,{...position},...best);routine.restDuration=1.2;}
  }
  if(authoredRoute){route.splice(0,route.length,...authoredRoute.map(p=>({...p})));routine.speed=.9;routine.socialCooldown=Infinity;
   if(definition.id==='cafe-oren'){routine.waypoint=authoredRoute.findIndex(p=>p.pause===7);Object.assign(position,route[routine.waypoint]);routine.target={...position};rig.root.position.set(position.x,position.y,position.z);}
  }
  return {routeTravel:authoredRoute?(a:Position,b:Position)=>onCafeRoute(a,b,authoredRoute,routine.waypoint):undefined,id:definition.id,definition,rig,position,home:{x,z},label,activity,freestyle,ride,lastPosition:{x,z},workTime:index*1.7,worker:Boolean(activity||freestyle||seat),seat,seatHeld:0,route,routine,near:false,stunned:false,ix:null as {s:NpcScript;age:number}|null,ixOut:{slow:1,arm:-1,armW:0,spin:0,bow:0,nod:0,hop:0,lean:0,yaw:0} as NpcIx,mx:null as {a:MoveAnswer;age:number}|null,mxOut:{slow:1,arm:-1,armW:0,nod:0,look:0} as MoveAnswerOut,head:rig.root.getObjectByName('player-head')??null,baseSpeed:routine.speed,sm:seat&&(definition.pose==='bench'||definition.pose==='sit')?createSeatSM(x,z,definition.workYaw??0):null,seatTorso:seat?seat.torsoPitch:0,fx:{kind:-1,age:0,v:-1},fxDur:0,pass:null as ActorPose|null,passBall:{x:0,y:0,z:0},duetBall:null as null|{x:number;y:number;z:number},emoteStep:null as null|{x:number;y:number;z:number},labelStatus:'',labelCanvas:canvas,labelTexture:texture,rigElapsed:0,poseSlot:(index*.618034)%1/POSE_HZ,poseBucket:-1,distance:Infinity,leftShoulder:rig.root.getObjectByName('left-shoulder'),rightShoulder:rig.root.getObjectByName('right-shoulder'),rightElbow:rig.root.getObjectByName('right-elbow')};
 });
 const neighborhood:typeof entries=[],frozen=new Set<string>(),entryById=new Map(entries.map(entry=>[entry.id,entry]));
 // Freestyle pairs on the court (freestyleRoutine.ts): one shared timeline, so the ball they pass meets both. `freestyleClock` is
 // the routines' shared clock; it stops while the island is paused (a conversation), like their tricks.
 for(const [a,b] of FREESTYLE_PAIRS){const A=entryById.get(a),B=entryById.get(b);if(A?.freestyle&&B?.freestyle)linkFreestylePair(A.freestyle,B.freestyle,A.position,B.position);}
 let freestyleClock=0,poseClock=0;
 const viewFrustum=new T.Frustum(),viewMatrix=new T.Matrix4(),viewSphere=new T.Sphere();
 const stats={posed:0,offscreenSkipped:0,slowRoutine:0,moving:0};/* Heat audit Oct 17 2026: townsfolk near, drawn and on screen that are visibly animating (see MOVING_RANGE) */const seenXZ=new Float32Array(entries.length*2).fill(1e9);
 const truckWitnesses=new Map<string,{remaining:number;x:number;z:number}>();
 const reactToTruck=(id:string,x:number,z:number)=>{truckWitnesses.set(id,{remaining:4.8,x,z});};
 // One name tag at a time (user, Oct 1 2026; lib/graphics/npcTagFocus.ts): the closest townsperson, held with the HUD arbiter's
 // 1.5 m hysteresis. `tagFocus` is that choice; `shownTag` is the one label currently visible (null while hidden by the flight /
 // vending close-up rule, a truck protest, or the tagged townsperson being off screen). Labels change visibility only on change.
 type Entry=typeof entries[number];
 let tagFocus:Entry|null=null,shownTag:Entry|null=null;
 const tagEligible=(entry:Entry)=>!entry.stunned&&!isThinned(entry)&&entry.distance<(drawLimit??Infinity);
 // Talk targets the tagged townsperson while it is in Talk range, so the tag always names the one "Talk to …" opens.
 const nearest=(player:Position,maxDistance=6)=>{if(tagFocus&&!reactions?.get('npc:'+tagFocus.id)&&!isThinned(tagFocus)&&Math.hypot(tagFocus.position.x-player.x,tagFocus.position.z-player.z,tagFocus.position.y-player.y)<maxDistance)return tagFocus.definition;let best:NpcDefinition|null=null,distance=maxDistance;for(const entry of entries){if(reactions?.get('npc:'+entry.id)||isThinned(entry))continue;const d=Math.hypot(entry.position.x-player.x,entry.position.z-player.z,entry.position.y-player.y);if(d<distance){distance=d;best=entry.definition;}}return best;};
 /** Heat pass 4 (lib/graphics/islandHeat): tier 3 / Battery saver draws and poses ambient townsfolk only within this range. */
 let drawLimit:number|null=null;
 /** Fishing focus mode (lib/graphics/focusMode.ts): townsfolk farther than r from (x, z) hold still (no routine, no posing; still drawn). */
 let focusAt:{x:number;z:number;r:number}|null=null;const heldByFocus=(e:{position:{x:number;z:number}})=>focusAt!==null&&Math.hypot(e.position.x-focusAt.x,e.position.z-focusAt.z)>focusAt.r;
 const fastRoutine:typeof entries=[],slowRoutine:typeof entries=[];let slowRoutineDt=0;
 // fewerAmbient (visible heat option, OFF by default; lib/graphics/heatTier HEAT_OPTIONS): 40% of townsfolk are not drawn, routined or talkable on phones.
 const thinAmbient=heatOptions().fewerAmbient&&typeof window!=='undefined'&&window.matchMedia('(pointer: coarse)').matches;let thinnedSet:Set<object>|null=null;const isThinned=(entry:object)=>thinAmbient&&(thinnedSet??=new Set(entries.filter((e,i)=>(i%5===1||i%5===3)&&!e.definition.floor))).has(entry);
 // Townsfolk on a moving floor (the boat captains, Oct 15 2026): their feet follow the deck's live height (two calls a frame).
 const floored=entries.filter(e=>!!e.definition.floor);
 const update=(dt:number,time:number,reduced:boolean,player:Position,paused:boolean,desktop=false,hoveredId:string|null=null,camera?:T.Camera,hideTags=false)=>{
  stats.posed=stats.offscreenSkipped=0;for(const e of floored)e.position.y=e.definition.floor!();if(camera){camera.updateMatrixWorld();viewMatrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);viewFrustum.setFromProjectionMatrix(viewMatrix);}
  for(const entry of entries){entry.distance=Math.hypot(entry.position.x-player.x,entry.position.z-player.z,entry.position.y-player.y);entry.near=entry.distance<7||entry.fx.kind>=0;
   if(entry.ix){/* a skater / scooter / juggler answers (lib/town/npcEmoteSets.ts): it keeps its route, only its speed dips and then returns */entry.ix.age+=paused?0:dt;if(entry.ix.age>=entry.ix.s.seconds){entry.ix=null;entry.routine.speed=entry.baseSpeed;entry.rig.root.rotation.x=0;}else{npcIxAt(entry.ix.s,entry.ix.age,entry.ixOut);entry.routine.speed=entry.baseSpeed*entry.ixOut.slow;}}
   if(entry.mx){entry.seatHeld=0;/* keeps a seated one posing while it answers */ /* you walked / ran past with a moving emote (lib/town/moveEmotes.ts): it keeps its route, only the run-by five dips its speed for a moment */entry.mx.age+=paused?0:dt;if(entry.mx.age>=entry.mx.a.seconds){entry.mx=null;if(!entry.ix)entry.routine.speed=entry.baseSpeed;}else{moveAnswerAt(entry.mx.a,entry.mx.age,entry.mxOut);if(!entry.ix)entry.routine.speed=entry.baseSpeed*entry.mxOut.slow;}}
   if(entry.sm&&entry.seat){/* a seated townsperson stands up for an emote and sits back down (lib/town/npcStandUp.ts) */const sm=entry.sm;if(sm.state==='reacting'||sm.state==='waiting'){sm.x=entry.position.x;sm.z=entry.position.z;}
   if(sm.state!=='seated'||sm.cool>0){stepSeat(sm,paused?0:dt,entry.fx.kind>=0,entry.distance<SEAT_TIMES.awayRange);if(sm.state!=='seated'){if(sm.state!=='reacting'&&sm.state!=='waiting'){entry.position.x=sm.x;entry.position.z=sm.z;entry.position.y=placement.heightAt(sm.x,sm.z);}entry.near=true;}}
   entry.seat.w=sm.w;entry.seat.torsoPitch=entry.seatTorso+sm.lean;}/* an answering townsperson holds still and faces you, like a near one */if(entry.emoteStep){const st=entry.emoteStep,dx=st.x-entry.position.x,dz=st.z-entry.position.z,len=Math.hypot(dx,dz),stepLen=Math.min(len,NPC_STEP_SPEED*(paused?0:dt));if(len<.05||entry.fx.kind<0)entry.emoteStep=null;else{entry.position.x+=dx/len*stepLen;entry.position.z+=dz/len*stepLen;if(!entry.definition.floor)entry.position.y=placement.heightAt(entry.position.x,entry.position.z);}}entry.stunned=Boolean(reactions?.get('npc:'+entry.id));if(entry.fx.kind>=0){entry.fx.age+=paused?0:dt;if(entry.fx.age>=(entry.fxDur>0?entry.fxDur:entry.fx.v>=0?HIGH_FIVES[entry.fx.v].duration:emoteSeconds(entry.fx.kind))||entry.stunned)entry.fx.kind=-1;}if(entry.fx.kind<0){entry.pass=null;entry.duetBall=null;entry.fxDur=0;}}
  neighborhood.length=0;frozen.clear();
  for(const entry of entries){if(isThinned(entry)||heldByFocus(entry))continue;if(entry.distance<(desktop?112:88)||entry.routine.partner!==null||entry.stunned)neighborhood.push(entry);if(hoveredId!==null&&(entry.id===hoveredId||entry.routine.partner===hoveredId))frozen.add(entry.id);}
  for(const [id,witness] of truckWitnesses){witness.remaining-=paused?0:dt;if(witness.remaining<=0)truckWitnesses.delete(id);else frozen.add(id);}
  // Heat pass 5: townsfolk off screen (frustum + margin) step their routines at 10 Hz (the stepper's own 0.1 s clamp); anyone near,
  // stunned, frozen or in a conversation, and everyone on screen, steps every frame. Posing is already skipped off screen.
  fastRoutine.length=0;slowRoutine.length=0;
  for(const entry of neighborhood){if(!camera||entry.near||entry.stunned||entry.routine.partner!==null||frozen.has(entry.id)){fastRoutine.push(entry);continue;}
   viewSphere.center.set(entry.position.x,entry.position.y+1.5,entry.position.z);viewSphere.radius=8+Math.max(0,entry.position.y)*1.4;
   (viewFrustum.intersectsSphere(viewSphere)?fastRoutine:slowRoutine).push(entry);}
  advanceNpcRoutines(fastRoutine,paused?0:dt,canTravel,frozen);
  freestyleClock+=paused?0:dt;poseClock+=paused?0:dt;slowRoutineDt+=paused?0:dt;if(slowRoutineDt>=.1||!slowRoutine.length){if(slowRoutine.length)advanceNpcRoutines(slowRoutine,slowRoutineDt,canTravel,frozen);stats.slowRoutine=slowRoutine.length;slowRoutineDt=0;}
  for(const id of truckWitnesses.keys())if(id!==hoveredId)frozen.delete(id);
  for(const entry of entries){if(frozen.has(entry.id)||heldByFocus(entry))continue;const distance=entry.distance;entry.rig.root.visible=!isThinned(entry)&&distance<(drawLimit??(desktop?96:72));if(entry.ride)entry.ride.root.visible=entry.rig.root.visible&&!entry.stunned;entry.rigElapsed+=paused?0:dt;if(!entry.rig.root.visible&&!entry.stunned)continue;if(camera&&!entry.near&&!entry.stunned){viewSphere.center.set(entry.position.x,entry.position.y+1.5,entry.position.z);viewSphere.radius=5+Math.max(0,entry.position.y)*1.4;if(!viewFrustum.intersectsSphere(viewSphere)){entry.rig.root.position.set(entry.position.x,entry.position.y,entry.position.z);if(entry.ride)entry.ride.root.position.copy(entry.rig.root.position);stats.offscreenSkipped++;continue;}}if(entry.seat&&!entry.near&&!entry.stunned&&entry.seatHeld>=2&&(!entry.sm||entry.sm.state==='seated')&&!truckWitnesses.has(entry.id)){entry.rig.root.position.set(entry.position.x,entry.position.y,entry.position.z);continue;} // a still townsperson holds its solved sit / lie pose (two solves after any wave or bump)
   const bucket=Math.floor((poseClock+entry.poseSlot)*POSE_HZ);if(bucket===entry.poseBucket&&!entry.definition.travel&&!entry.stunned&&!truckWitnesses.has(entry.id)&&(entry.freestyle?distance>32&&entry.routine.mode!=='walk'&&entry.routine.mode!=='approach':distance>FAR_POSE)){entry.rig.root.position.set(entry.position.x,entry.position.y,entry.position.z);continue;}entry.poseBucket=bucket;const poseDt=Math.min(entry.rigElapsed,.1);entry.rigElapsed=0;if(entry.seat)entry.seatHeld=entry.near||entry.stunned||truckWitnesses.has(entry.id)?0:entry.seatHeld+1;const r=entry.routine,stunned=reactions?.get('npc:'+entry.id),partner=r.partner===null?undefined:entryById.get(r.partner);
   let facing=entry.near?Math.atan2(player.x-entry.position.x,player.z-entry.position.z):r.mode==='social'&&partner?Math.atan2(partner.position.x-entry.position.x,partner.position.z-entry.position.z):r.mode==='work'?entry.definition.workYaw:undefined;
   if(r.mode==='rest')facing=(entry.definition.workYaw??0)+(reduced?0:Math.sin(r.clock*.35)*.4);
   if(entry.freestyle?.facing!==undefined)facing=entry.freestyle.facing; // a pair trick: face the partner until the rally ends
   if(entry.definition.travel&&!entry.near){const dx=entry.position.x-entry.lastPosition.x,dz=entry.position.z-entry.lastPosition.z;facing=Math.hypot(dx,dz)>.0001?Math.atan2(dx,dz):entry.rig.root.rotation.y;}
   if(entry.seat){const sf=entry.sm?seatFacing(entry.sm):'seat';if(sf==='seat')facing=entry.definition.workYaw??0;else if(sf==='walk')facing=entry.sm!.walkYaw;} // a still pose keeps its bench / towel heading, even while waving hello
   const witness=truckWitnesses.get(entry.id);if(witness)facing=Math.atan2(witness.x-entry.position.x,witness.z-entry.position.z);
   const speed=poseDt>0?Math.hypot(entry.position.x-entry.lastPosition.x,entry.position.z-entry.lastPosition.z)/poseDt:0;
   entry.freestyle?.prepare(paused||stunned?0:poseDt,!paused&&!stunned&&distance>2.2&&!entry.duetBall,reduced,freestyleClock);/* a two-ball duet with the player: the routine rests, the duet places its ball (below) */
   stats.posed++;entry.rig.update(entry.position.x,entry.position.z,paused||stunned?0:poseDt,witness?time:r.clock,reduced,{...entry.freestyle?.motion,...(entry.seat?{trick:entry.seat}:null),travelMode:entry.ride?'scooter':'walk',...(entry.pass?npcPassMotion(entry.pass,entry.passBall,entry.rig.profileScale,reduced):npcEmoteMotion(entry.fx,reduced)),stunAge:stunned?.age,rooftopPose:stunned&&stunned.age>1.85?'dizzy':undefined,facing:entry.pass&&!reduced&&facing!==undefined?facing+entry.pass.turn:facing});entry.rig.root.position.y=entry.position.y;
   const working=!witness&&!paused&&!entry.near&&!stunned&&r.mode==='work';if(working)entry.workTime+=poseDt;entry.activity?.update(poseDt,entry.workTime,reduced,working);
   if(!paused&&!stunned&&!reduced&&entry.rightShoulder&&entry.rightElbow){
    if(entry.near&&r.waveTime<2.1&&(!entry.freestyle||distance<=2.2)&&entry.definition.pose!=='lie'){entry.rightShoulder.rotation.set(-.25,0,2.15+Math.sin(r.waveTime*10)*.15);entry.rightElbow.rotation.x=-.8;}
    else if(r.mode==='social'&&partner&&((Math.floor(r.age/1.5)%2===0)===(entry.id<partner.id))){entry.rightShoulder.rotation.set(-.55-Math.sin(r.age*5)*.12,0,.3);entry.rightElbow.rotation.x=-.85;}
   }
   if(entry.fx.kind>=0&&entry.fx.v>=0&&!reduced&&!stunned)applyHighFive(entry.rig.root,entry.fx.v,1,entry.fx.age,-1,Math.atan2(player.x-entry.position.x,player.z-entry.position.z),entry.rig.profileScale,Math.hypot(player.x-entry.position.x,player.z-entry.position.z));// the townsperson's half of the player's variation, on the same clock
   if(entry.fx.kind>=0&&entry.fx.v<0&&!reduced&&!stunned&&!entry.pass)applyEmoteArms(entry.rig.root,entry.fx.kind,entry.fx.age,emoteSeconds(entry.fx.kind));
   entry.ride?.update(entry.position.x,entry.position.y,entry.position.z,entry.rig.root.rotation.y,paused?0:poseDt,speed,entry.rig.root.visible&&!stunned);entry.lastPosition.x=entry.position.x;entry.lastPosition.z=entry.position.z;
   if(entry.definition.travel==='skateboard'&&!stunned){entry.leftShoulder?.rotation.set(.15,0,-.25);entry.rightShoulder?.rotation.set(.15,0,.25);}
   if(entry.ix&&!reduced&&!stunned){const o=entry.ixOut,a=entry.ix.age;if(o.arm>=0&&o.armW>0){if(o.arm===5)applyApplause(entry.rig.root,a,o.armW);else if(o.arm===9)applyEmoteArms(entry.rig.root,EMOTE.Thanks,a,entry.ix.s.seconds);else if(o.arm===7)applyEmoteMove(entry.rig.root,EMOTE.Laugh,a,entry.ix.s.seconds);else applyRideEmote(entry.rig.root,o.arm,a,o.armW);}if(o.spin>0)entry.rig.root.rotation.y+=o.spin*Math.PI*2;entry.rig.root.rotation.y+=o.yaw;entry.rig.root.rotation.x=o.bow*.45+o.nod*.12;entry.rig.root.position.y+=o.hop;}
   if(entry.mx&&!reduced&&!stunned){const o=entry.mxOut,a=entry.mx.age;if(o.arm>=0&&o.armW>0){if(o.arm===5)applyApplause(entry.rig.root,a,o.armW);else applyRideEmote(entry.rig.root,o.arm,a,o.armW);}if(entry.head){const want=Math.atan2(player.x-entry.position.x,player.z-entry.position.z),y=entry.rig.root.rotation.y,rel=Math.atan2(Math.sin(want-y),Math.cos(want-y));entry.head.rotation.y+=Math.max(-1.05,Math.min(1.05,rel))*o.look;entry.head.rotation.x-=o.nod*.28;}}/* the head turns to you as you pass, a light answer on the arms */
   if(witness&&!stunned)applyTruckProtest(entry.rig.root,time,reduced);else if(!stunned)entry.rig.root.rotation.z=entry.ix&&!reduced?entry.ixOut.lean:0;/* a sway / wobble answer leans the rider */
   if(entry.duetBall&&entry.freestyle&&!stunned){/* the duet ball in the rig root frame (world -> local, no allocation) */const R=entry.rig.root,b=entry.duetBall,k=1/(Math.abs(R.scale.x)||1),dx=b.x-R.position.x,dy=b.y-R.position.y,dz=b.z-R.position.z,c=Math.cos(R.rotation.y),si=Math.sin(R.rotation.y);entry.freestyle.ball.position.set((c*dx-si*dz)*k,dy*k,(si*dx+c*dz)*k);}
   reactions?.apply('npc:'+entry.id,entry.rig.root,reduced);
  }
  // Heat audit Oct 17 2026: how many townsfolk within MOVING_RANGE metres are drawn, on screen and animating (route position changed, or
  // not resting: walking, talking, working, riding, freestyling, stunned). Town reads it to let a still player on foot rest at 20 fps.
  stats.moving=0;
  for(let i=0;i<entries.length;i++){const e=entries[i],k=i*2,dx=e.position.x-seenXZ[k],dz=e.position.z-seenXZ[k+1];seenXZ[k]=e.position.x;seenXZ[k+1]=e.position.z;
   if(!e.rig.root.visible||e.distance>MOVING_RANGE)continue;
   if(!(dx*dx+dz*dz>1e-6||e.stunned||e.freestyle||e.ride||e.routine.mode!=='rest'||truckWitnesses.has(e.id)))continue;
   if(camera){viewSphere.center.set(e.position.x,e.position.y+1.5,e.position.z);viewSphere.radius=3;if(!viewFrustum.intersectsSphere(viewSphere))continue;}
   stats.moving++;}
  // Name tag: only the closest townsperson's, within the tag range (desktop 14 m, phone 12 m), held with hysteresis. None while
  // flying over the island or while the camera is on a vending machine (`hideTags`: a nearby tag sat huge and clipped in the
  // machine view, the "…LK" panel of the Sep 30 E2E audit), during a truck protest, or when that townsperson is off screen.
  tagFocus=pickTagFocus(tagFocus,entries,tagEligible,desktop?14:12);
  let show=tagFocus;
  if(show&&(hideTags||truckWitnesses.has(show.id)||!show.rig.root.visible))show=null;
  if(show&&camera){viewSphere.center.set(show.position.x,show.position.y+2.5,show.position.z);viewSphere.radius=2;if(!viewFrustum.intersectsSphere(viewSphere))show=null;}
  if(show!==shownTag){if(shownTag)shownTag.label.visible=false;shownTag=show;if(show)show.label.visible=true;}
  if(shownTag){const entry=shownTag,r=entry.routine;
   const status=entry.near?'LET’S TALK':r.mode==='social'?'CATCHING UP':r.mode==='approach'?'SAYING HELLO':entry.freestyle?.tag??entry.definition.pursuit??'TAKING A BREAK';
   if(status!==entry.labelStatus){entry.labelStatus=status;const ctx=entry.labelCanvas.getContext('2d')!;ctx.clearRect(0,0,512,160);ctx.fillStyle='#294f43';ctx.beginPath();ctx.roundRect(3,3,506,154,44);ctx.fill();ctx.textAlign='center';ctx.fillStyle='#fff0cc';ctx.font='700 43px sans-serif';ctx.fillText(entry.definition.name,256,66);ctx.fillStyle='#e6cb8b';ctx.font='700 25px sans-serif';ctx.fillText(status,256,115,470);entry.labelTexture.needsUpdate=true;}}
 };
 const visibleInScene=(object:T.Object3D)=>{for(let current:T.Object3D|null=object;current;current=current.parent){if(!current.visible)return false;}return true;};
 const pick=(raycaster:T.Raycaster)=>{if(!root.visible)return null;const hit=raycaster.intersectObject(root,true).find(hit=>hit.distance<90&&visibleInScene(hit.object)&&hit.object.userData.npcId&&!reactions?.get('npc:'+hit.object.userData.npcId));return hit?NPC_DIALOGUES.find(npc=>npc.id===hit.object.userData.npcId)??null:null;};
 /** Answer a player's emote (user, Oct 22 2026): the townsperson turns to you (near ones already face the player), then waves back,
  * raises a hand for a high five (with a small spark ring), or hops and claps for a cheer. Reduced motion keeps only the bubble.
  * Returns the entry (Town anchors the pooled bubble to it) or null when it is busy. */
 const react=(id:string,emote:number,reduced:boolean,variation=-1,player?:Position,spacing?:{min:number;max:number})=>{
  const entry=entryById.get(id);if(!entry||entry.stunned||!entry.rig.root.visible)return null;
  entry.fx.kind=emote;entry.fx.age=0;entry.fx.v=variation>=0&&!reduced?variation:-1;entry.fxDur=0;entry.duetBall=null;
  if(!reduced&&emote===EMOTE.Wave&&entry.near)entry.routine.waveTime=0;// the greeting wave plays again
  if(!reduced&&emote===EMOTE.HighFive&&variation<0)sparkHook?.(entry.position.x,entry.position.y+1.6*entry.rig.profileScale,entry.position.z);
  entry.emoteStep=null;
  // A townsperson farther than ~3 m takes up to 2.5 m of steps toward you (a clear path only) so the two fit one close frame.
  if(player&&!reduced&&(!entry.seat||entry.sm?.state==='reacting')&&!entry.definition.travel&&!entry.definition.floor&&!entry.freestyle){
   const dx=player.x-entry.position.x,dz=player.z-entry.position.z,d=Math.hypot(dx,dz);
   if(spacing&&d>.05){// a ball emote wants a set gap (Pass it 3-4 m, Juggle with me 6-8 m): step toward OR away along the line, on a clear path only
    const goal=Math.min(spacing.max,Math.max(spacing.min,d));
    if(Math.abs(goal-d)>.3)for(let f=1;f>=.4;f-=.3){const g=d+(goal-d)*f,to={x:player.x-dx/d*g,y:placement.heightAt(player.x-dx/d*g,player.z-dz/d*g),z:player.z-dz/d*g};if(Math.abs(to.y-entry.position.y)<.4&&canTravel(entry.position,to)){entry.emoteStep=to;break;}}
   }
   else{const want=npcStepDistance(d);
   for(let f=1;f>=.4&&want>0;f-=.3){const s=want*f,to={x:entry.position.x+dx/d*s,y:placement.heightAt(entry.position.x+dx/d*s,entry.position.z+dz/d*s),z:entry.position.z+dz/d*s};if(Math.abs(to.y-entry.position.y)<.4&&canTravel(entry.position,to)){entry.emoteStep=to;break;}}}
  }
  return entry;
 };
 let sparkHook:((x:number,y:number,z:number)=>void)|null=null;
 /** A skater / scooter rider / juggler answers with its own short overlay (lib/town/npcEmoteSets.ts); it keeps its route. Returns the entry or null. */
 const interact=(id:string,sc:NpcScript,reduced:boolean)=>{const e=entryById.get(id);if(!e||e.stunned||!e.rig.root.visible)return null;e.ix=reduced?null:{s:sc,age:0};return e;};
 /** A ball townsperson (juggler) plays a two-ball duet with the player (lib/town/emoteDuet.ts): it holds still facing you for `seconds`; Town writes its body (`pass`) and its own ball (`duetBall`, world) every frame. Returns the entry or null. */
 const duet=(id:string,emote:number,seconds:number)=>{const e=entryById.get(id);if(!e||e.stunned||!e.rig.root.visible||!e.freestyle)return null;e.ix=null;e.emoteStep=null;e.fx.kind=emote;e.fx.age=0;e.fx.v=-1;e.fxDur=seconds;e.pass=null;e.duetBall=null;return e;};
 /** You walk / run past with a moving emote (lib/town/moveEmotes.ts): a light answer that never leaves the route (a seated one only turns its head and waves a little, no stand-up). Returns the entry (Town anchors the bubble) or null. */
 const passBy=(id:string,emote:number,reduced:boolean,seated:boolean)=>{const e=entryById.get(id),a=moveAnswerFor(emote,seated);if(!e||!a||e.stunned||!e.rig.root.visible)return null;e.mx=reduced?null:{a,age:0};return e;};
 /** A seated townsperson (bench / towel) stands up and steps off along the open front side to a clear spot; false = she stays seated (no clear spot, cooldown, stunned, reduced motion). */
 const standUp=(id:string,reduced:boolean)=>{const e=entryById.get(id);if(!e||!e.sm||reduced||e.stunned||!e.rig.root.visible)return false;const others:{x:number;z:number}[]=[];for(const o of entries)if(o!==e)others.push(o.position);const spot={x:0,z:0};return openFront(e.sm.hx,e.sm.hz,e.sm.yaw,placement.isWalkable,others,spot)&&seatStandUp(e.sm,spot.x,spot.z);};

 return {react,interact,duet,passBy,standUp,setSparkHook(fn:((x:number,y:number,z:number)=>void)|null){sparkHook=fn;},reactToTruck,stats,root,entries,update,nearest,pick,get taggedId(){return shownTag?.id??null;},setDrawDistance(metres:number|null){drawLimit=metres;},setFocus(f:{x:number;z:number;r:number}|null){focusAt=f;},dispose:()=>{entries.forEach(entry=>{entry.activity?.dispose();entry.freestyle?.dispose();entry.ride?.dispose();entry.rig.dispose();});textures.forEach(texture=>texture.dispose());materials.forEach(material=>material.dispose());root.removeFromParent();}};
}
