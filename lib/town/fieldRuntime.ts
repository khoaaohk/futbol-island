import {applyTruckProtest} from '../graphics/truckReactions';
import {createLiveFieldFrame} from './liveFieldFrame';
import {createMatchUpdateClock} from './matchUpdateClock';
import {positionLabel,positionInfo,type PositionSelection} from './playerPositions';
import {recordQuestStep} from './questProgress';
import * as T from 'three';
import type {BallReactions} from '../graphics/ballReactions';
import {createMatchEffects,type MatchEvent} from './matchEffects';
import {createLessonCues} from './lessonCues';
import {playerBatch} from '../graphics/playerBatch';
import {teachingMotion} from './teachingMotion';
import {createPlayer,type PlayerRig,type PlayerMotion} from '../graphics/player';
import {MatchSim} from './match/matchSim';
import {VENUES,fieldPoint,type Venue,type Format} from './venues';
import {quizOutcomeStep,lessonPositions,lessonVisualFrame,lessonStepSeconds,type FieldSession} from './formatLessons';
// Shared live-match pacing across all formats; movement and ball share this clock.
const LIVE_GAME_SPEED=.42;
type Entry={liveFrame:ReturnType<typeof createLiveFieldFrame>;clock:ReturnType<typeof createMatchUpdateClock>;venue:Venue;sim:MatchSim;root:T.Group;rigs:Map<string,PlayerRig>;ball:T.Mesh;label:Map<string,T.Sprite>;lastLesson:string;effects:ReturnType<typeof createMatchEffects>};
export type LiveMatchView={events:MatchEvent[];players:{id:string;x:number;y:number;home:boolean}[];ball:{x:number;y:number};score:{gold:number;blue:number}};
export function createFieldRuntime(scene:T.Scene,reactions?:BallReactions){
 const batch=playerBatch(scene),cues=createLessonCues(scene),paused=new Set<Format>(),hoverPaused=new Set<Format>(),collisionPaused=new Set<Format>();
 const isPaused=(format:Format)=>paused.has(format)||hoverPaused.has(format)||collisionPaused.has(format);
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const ballGeo=new T.SphereGeometry(.19,12,8),ballMat=new T.MeshStandardMaterial({color:'#fff0d1',roughness:.85});
 const lineMaterial=new T.LineBasicMaterial({color:'#e9c66d'}),lineGeometry=new T.BufferGeometry(),line=new T.LineSegments(lineGeometry,lineMaterial);scene.add(line);const linePositions=new T.Float32BufferAttribute(new Float32Array(1536),3);lineGeometry.setAttribute('position',linePositions);line.frustumCulled=false;
 const entries:Entry[]=VENUES.map((venue,i)=>{const root=new T.Group();root.name='match-'+venue.id;root.position.y=venue.elevation??0;scene.add(root);const ball=new T.Mesh(ballGeo,ballMat);ball.castShadow=true;root.add(ball);return {liveFrame:createLiveFieldFrame(venue.id),clock:createMatchUpdateClock(),venue,root,sim:new MatchSim(270+i*41,venue.id),rigs:new Map(),ball,label:new Map(),lastLesson:'',effects:createMatchEffects(root,venue)};});
 const stats={ticks:0,visiblePlayers:0,culledPlayers:0,skippedPoses:0,rigs:0,matchTime:0};let playerCulling=true;
 const playerView=new T.Sphere(new T.Vector3(),7);
 const frustum=new T.Frustum(),matrix=new T.Matrix4(),sphere=new T.Sphere(),emptyIds=new Set<string>(),liveContact=new T.Vector3();
 const label=(entry:Entry,id:string,text:string,home:boolean)=>{let sprite=entry.label.get(id);if(!sprite){sprite=new T.Sprite(new T.SpriteMaterial({depthTest:false,depthWrite:false,toneMapped:false}));sprite.renderOrder=5;entry.root.add(sprite);entry.label.set(id,sprite);}const key=(home?'our:':'their:')+text;if(sprite.userData.text!==key){const canvas=document.createElement('canvas');const c=canvas.getContext('2d')!;c.font='bold 44px sans-serif';canvas.width=Math.ceil(c.measureText(text).width+24);canvas.height=64;c.fillStyle='#203e35';c.fillRect(0,0,canvas.width,64);c.font='bold 44px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillStyle=home?'#efbb54':'#609de3';c.fillText(text,canvas.width/2,34,canvas.width-16);sprite.material.map?.dispose();sprite.material.map=new T.CanvasTexture(canvas);sprite.material.map.colorSpace=T.SRGBColorSpace;sprite.material.needsUpdate=true;sprite.userData.text=key;}sprite.scale.set(3,.75,1);return sprite;};
 function update(dt:number,time:number,camera:T.Camera,session:FieldSession|null,active:boolean,viewingFormat:Format|null=null,viewportHeight=window.innerHeight){
 const question=session?.quiz?session.lesson.questions[session.question]:undefined;
 const outcomeStep=quizOutcomeStep(session);
 if(session){if(outcomeStep!==undefined&&outcomeStep!==null)session.outcomeProgress=Math.min(1,(session.outcomeProgress??0)+(active&&!session.outcomePaused?dt:0)/lessonStepSeconds(session.lesson.steps[outcomeStep]));else session.outcomeProgress=0;}
 const visualSession=session&&outcomeStep!==undefined&&outcomeStep!==null?{...session,step:outcomeStep,progress:session.outcomeProgress??0}:session;

 batch.begin();stats.visiblePlayers=0;stats.culledPlayers=0;stats.skippedPoses=0;stats.ticks++;stats.matchTime=time;
 camera.updateMatrixWorld();frustum.setFromProjectionMatrix(matrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
 for(const e of entries){const v=e.venue,teaching=session?.format===v.id?session:null;
 sphere.center.set(v.x,1+(v.elevation??0),v.z);sphere.radius=Math.hypot(v.width,v.length)/2+2;
 const visible=(!viewingFormat||v.id===viewingFormat)&&(!session||!!teaching)&&frustum.intersectsSphere(sphere)&&(!!viewingFormat||camera.position.distanceTo(sphere.center)<240);
 // Nearby matches remain responsive to island ball hits, even just outside the view.
 const immediate=visible||viewingFormat===v.id||camera.position.distanceTo(sphere.center)<sphere.radius+45;
 const collisionToken=reactions?.states.size?e.liveFrame.tokens.find(token=>reactions.get(e.liveFrame.rows.get(token.id)!.hitId)?.cause==='truck'):undefined;
 const collisionHit=collisionToken?reactions?.get(e.liveFrame.rows.get(collisionToken.id)!.hitId):undefined;
 if(collisionHit)collisionPaused.add(v.id);else collisionPaused.delete(v.id);
 const matchDt=e.clock.take(dt,immediate,active&&!teaching&&!isPaused(v.id));
 e.liveFrame.sync(e.sim.players);
 if(matchDt>0){for(const token of e.liveFrame.tokens){const row=e.liveFrame.rows.get(token.id)!,p=e.sim.players[token.id];row.frozen=!!reactions?.get(row.hitId);if(row.frozen){row.x=p.x;row.y=p.y;}}e.sim.step(matchDt*LIVE_GAME_SPEED);for(const token of e.liveFrame.tokens){const row=e.liveFrame.rows.get(token.id)!,p=e.sim.players[token.id];if(row.frozen&&p){p.x=row.x;p.y=row.y;p.vx=p.vy=0;}}e.liveFrame.sync(e.sim.players);}
 e.root.visible=visible;e.effects.update(e.sim,active&&!isPaused(v.id)?dt:0,visible&&!teaching,reduced);if(!visible)continue;
 let teachingPose:ReturnType<typeof teachingMotion>|undefined;
 let emphasized=emptyIds,callouts=emptyIds;
 let poses=e.liveFrame.poses,ball:{x:number;y:number}=e.sim.ball,tokens=e.liveFrame.tokens;
 if(teaching){if(active&&teaching.playing){teaching.progress+=dt/lessonStepSeconds(teaching.lesson.steps[teaching.step]);teaching.progress=Math.min(1,teaching.progress);if(teaching.progress>=1&&!teaching.voicePending){recordQuestStep(teaching.format,teaching.lesson.id,teaching.step);if(teaching.step<teaching.lesson.steps.length-1){teaching.progress=0;teaching.step++;teaching.voicePending=true;teaching.onStep(teaching.step);}else{teaching.progress=1;teaching.playing=false;teaching.onPlaying?.(false);}}}
 const visualStep=outcomeStep!==undefined&&outcomeStep!==null?outcomeStep:teaching.step,visualProgress=outcomeStep!==undefined&&outcomeStep!==null?teaching.outcomeProgress??0:teaching.progress;
 if(visualSession){visualSession.step=visualStep;visualSession.progress=visualProgress;}
 teachingPose=teachingMotion(teaching.lesson,v,visualStep,visualProgress);
 const sampled=lessonPositions(teaching.lesson,visualStep,visualProgress);poses=sampled.positions;ball=sampled.ball;tokens=[...teaching.lesson.offense.map(p=>({...p,home:true})),...teaching.lesson.defense.map(p=>({...p,home:false}))];
 const step=lessonVisualFrame(teaching.lesson,visualStep,visualProgress).step,ids=teaching.quiz&&teaching.answer===null?[]:[...new Set([...(teaching.quiz?teaching.lesson.questions[teaching.question]?.feedback?.highlight?.flatMap(h=>h.ids)??[]:step.highlight?.flatMap(h=>h.ids)??step.focusIds??[]),...(!teaching.quiz?step.overlays?.filter(o=>o.kind==='spotlight').flatMap(o=>o.ids??[])??[]:[])])];
 emphasized=new Set(ids);callouts=new Set((teaching.quiz?teaching.lesson.questions[teaching.question]?.feedback?.overlays:step.overlays)?.filter(o=>o.kind==='callout').map(o=>o.anchor??'')??[]);
 // Teaching highlights are drawn once by lessonCues, including quiz feedback.


 }
 const used=teaching?new Set(tokens.map(t=>t.id)):e.liveFrame.used;for(const [id,rig] of e.rigs)rig.root.visible=used.has(id);for(const sprite of e.label.values())sprite.visible=false;
 for(const token of tokens){let rig=e.rigs.get(token.id);if(!rig){rig=createPlayer(token.id,token.home?'home':'away',false);e.rigs.set(token.id,rig);stats.rigs++;}rig.root.visible=true;const position=poses.get(token.id)!,px=v.x+(position.x-135)/250*v.width,pz=v.z+(position.y-200)/380*v.length;const live=e.sim.players[token.id],hitId=e.liveFrame.rows.get(token.id)?.hitId??'field:'+v.id+':'+token.id,stunned=!teaching?reactions?.get(hitId):undefined;const reception=e.sim.recv.id===token.id&&e.sim.recv.t>0?e.sim.recv:null;
 const motion:PlayerMotion=teachingPose?.motions.get(token.id)??(teaching?{}:e.liveFrame.rows.get(token.id)!.motion);
 if(!teachingPose?.motions.has(token.id)){motion.stunAge=stunned?.age;motion.rooftopPose=stunned&&stunned.age>1.85?'dizzy':undefined;motion.dribbling=e.sim.ball.owner===token.id;motion.kick=live?.kick>0?.36+.64*Math.max(0,Math.min(1,1-live.kick/.35)):undefined;motion.facing=undefined;motion.receive=undefined;motion.kickSide=undefined;}
 if(!teaching&&reception){motion.facing=Math.atan2(reception.faceX*v.width/250,reception.faceY*v.length/380);motion.receive=Math.min(1,reception.t/Math.max(.001,reception.dur)*2);motion.kickSide=reception.foot==='R'?-1:1;}
 else if(!teaching&&live?.kick>0){const release=e.sim.passRelease;if(live.kick>(rig.root.userData.lastKick??0)||rig.root.userData.releaseFacing===undefined)rig.root.userData.releaseFacing=release?.id===token.id?Math.atan2((release.tx-live.x)*v.width/250,(release.ty-live.y)*v.length/380):Math.atan2(e.sim.ball.vx*v.width/250,e.sim.ball.vy*v.length/380);motion.facing=rig.root.userData.releaseFacing;}
 else if(!teaching&&live&&e.sim.ball.owner!==token.id&&Math.hypot(live.vx,live.vy)<40)motion.facing=Math.atan2((e.sim.ball.x-live.x)*v.width/250,(e.sim.ball.y-live.y)*v.length/380);
 motion.kickSide??=rig.root.userData.contactSide??1;rig.root.userData.lastKick=live?.kick??0;
 const protesting=!teaching&&!stunned&&collisionPaused.has(v.id);
 if(protesting){if(collisionHit)motion.facing=Math.atan2(collisionHit.x-px,collisionHit.z-pz);motion.kick=undefined;motion.receive=undefined;motion.dribbling=false;}
 // Gate posing with the same generous shadow bounds used for drawing.
 playerView.center.set(px+1.5,(v.elevation??0)+1.5,pz-1);playerView.radius=7+Math.max(0,v.elevation??0)*2;
 const inView=!playerCulling||!!teaching||frustum.intersectsSphere(playerView);
 if(!inView&&!stunned&&!protesting&&!reception&&!motion.kick&&!motion.dribbling){
   rig.root.position.set(px,(v.elevation??0)+.105,pz);rig.root.userData.poseSkipped=true;stats.skippedPoses++;stats.culledPlayers++;continue;
 }
 motion.resumePose=!!rig.root.userData.poseSkipped;rig.root.userData.poseSkipped=false;
 // Ball attention is selective: receivers/carriers, or focused teaching actors.
 const attending=!stunned&&!protesting&&(!!reception||motion.dribbling||!!teaching&&(!!motion.receive||!!motion.kick));
 motion.lookX=attending?v.x+(ball.x-135)/250*v.width:undefined;
 motion.lookZ=attending?v.z+(ball.y-200)/380*v.length:undefined;
 const poseClock=protesting?time:teaching?(outcomeStep!==undefined&&outcomeStep!==null?teaching.outcomeProgress??0:teaching.step+(teaching.progress??0)):e.sim.stats.time;
 rig.update(px,pz,active&&!stunned&&(teaching?(teaching.playing||outcomeStep!==undefined&&outcomeStep!==null):(!isPaused(v.id)||protesting&&!paused.has(v.id)&&!hoverPaused.has(v.id)))?dt:0,poseClock,reduced,motion);
 rig.root.userData.contactSide=motion.kickSide??1;rig.root.userData.teachingMotion=teaching?motion:undefined;rig.root.userData.liveMotion=!teaching?motion:undefined;rig.root.position.y=(v.elevation??0)+.105;if(!teaching)reactions?.apply(hitId,rig.root,false);
 if(protesting)applyTruckProtest(rig.root,time,reduced);else if(!stunned)rig.root.rotation.z=0;
 // The live batch has no per-instance frustum culling. Retain an oversized
 // body + sunset-shadow volume; teaching always keeps every participant.
 if(inView){batch.draw(rig.root);stats.visiblePlayers++;}else stats.culledPlayers++;
 if(teaching){const s=label(e,token.id,token.label,token.home);s.position.set(px,2.65,pz);s.visible=teaching.quiz&&teaching.answer===null&&Boolean(question&&new RegExp('\\b'+token.label+'\\b').test(question.q));
 if(s.visible&&camera instanceof T.PerspectiveCamera){const center=s.getWorldPosition(new T.Vector3()),up=new T.Vector3(0,1,0).applyQuaternion(camera.quaternion),a=center.clone().project(camera),b=center.add(up).project(camera),unit=Math.abs(b.y-a.y)*viewportHeight/2;if(unit>.001){s.scale.set(Math.min(96,Math.max(32,token.label.length*6+14))/unit,18/unit,1);s.position.addScaledVector(up,14/unit);}}
 }}
 e.ball.position.set(v.x+(ball.x-135)/250*v.width,.295+(teaching?0:e.sim.ball.height),v.z+(ball.y-200)/380*v.length);
 if(teaching&&teachingPose){
 const contact=(id:string|undefined)=>{const rig=id?e.rigs.get(id):undefined;return rig?rig.ballContact(rig.root.userData.contactSide??1,new T.Vector3()):null;};
 const a=contact(teachingPose.source),b=contact(teachingPose.receiver),height=v.elevation??0;
  if(teachingPose.pass&&a){const source=e.rigs.get(teachingPose.source!)!,yaw=source.root.rotation.y,side=source.root.userData.contactSide??1;a.set(source.root.position.x+Math.sin(yaw)*.79+Math.cos(yaw)*side*.108,(v.elevation??0)+.295,source.root.position.z+Math.cos(yaw)*.79-Math.sin(yaw)*side*.108);const end=b??new T.Vector3(teachingPose.to.x,height+.295,teachingPose.to.z);e.ball.position.copy(a).lerp(end,teachingPose.travel);e.ball.position.y-=height;}
  else if(a)e.ball.position.copy(a).setY(a.y-height);
  teaching.renderedBall={x:e.ball.position.x,z:e.ball.position.z,landed:teachingPose.landed};if(visualSession)visualSession.renderedBall=teaching.renderedBall;
 }else if(e.sim.ball.owner&&!e.sim.players[e.sim.ball.owner]?.isGK){const ownerRig=e.rigs.get(e.sim.ball.owner),held=ownerRig?.ballContact(ownerRig.root.userData.contactSide??1,liveContact);if(held){held.y-=v.elevation??0;const recv=e.sim.recv,weight=recv.id===e.sim.ball.owner?1-Math.pow(Math.min(1,recv.t/Math.max(.001,recv.dur)),2):1;e.ball.position.lerp(held,weight);}}
 e.ball.rotation.x=e.ball.position.z/.19;e.ball.rotation.z=-e.ball.position.x/.19;
 }
 cues.update(visualSession,session?VENUES.find(v=>v.id===session.format):undefined,camera,viewportHeight);
 batch.end();
 lineGeometry.setDrawRange(0,0);line.visible=false;
 }
 function pickPlayer(point:T.Vector2,camera:T.Camera,width:number,height:number,format?:Format|null,touch=false){
  let best:(PositionSelection&{x:number;y:number;z:number;screenX:number;screenY:number})|null=null,bestDistance=touch?24:12;
  const head=new T.Vector3(),foot=new T.Vector3();
  for(const entry of entries){if(!entry.root.visible||format&&format!==entry.venue.id)continue;
   for(const [id,rig] of entry.rigs){const actor=entry.sim.players[id];if(!actor||!rig.root.visible)continue;
    head.copy(rig.root.position).add(new T.Vector3(0,1.8,0)).project(camera);foot.copy(rig.root.position).project(camera);if(head.z< -1||head.z>1)continue;
    const px=(point.x+1)*width/2,py=(1-point.y)*height/2,ax=(head.x+1)*width/2,ay=(1-head.y)*height/2,bx=(foot.x+1)*width/2,by=(1-foot.y)*height/2,dx=bx-ax,dy=by-ay;
    const t=T.MathUtils.clamp(((px-ax)*dx+(py-ay)*dy)/Math.max(1,dx*dx+dy*dy),0,1),distance=Math.hypot(px-ax-dx*t,py-ay-dy*t);
    const selection={format:entry.venue.id,id,label:positionLabel(entry.venue.id,id),team:actor.team};
    if(distance<bestDistance&&positionInfo(selection)){bestDistance=distance;best={...selection,x:rig.root.position.x,y:rig.root.position.y,z:rig.root.position.z,screenX:ax,screenY:ay};}
   }
  }return best;
 }
 return {entries,stats,update,setPlayerCulling(value:boolean){playerCulling=value;},pickPlayer,setHoverPaused(format:Format|null){hoverPaused.clear();if(format)hoverPaused.add(format);},isPaused,setPaused(format:Format,value:boolean){if(value)paused.add(format);else paused.delete(format);},getView(format:Format):LiveMatchView|null{const e=entries.find(e=>e.venue.id===format);return e?{events:[...e.effects.events],players:Object.values(e.sim.players).map(p=>({id:p.id,x:p.x,y:p.y,home:p.team==='gold'})),ball:{x:e.sim.ball.x,y:e.sim.ball.y},score:{...e.sim.score}}:null;},pickQuiz:cues.pick,dispose(){cues.dispose();batch.dispose();for(const e of entries){e.effects.dispose();e.rigs.forEach(r=>r.dispose());for(const s of e.label.values()){s.material.map?.dispose();s.material.dispose();}e.root.removeFromParent();}line.removeFromParent();[ballGeo,ballMat,lineGeometry,lineMaterial].forEach(r=>r.dispose());}};
}
