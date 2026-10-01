import {applyTruckProtest} from '../graphics/truckReactions';
import {createLiveFieldFrame} from './liveFieldFrame';
import {createMatchUpdateClock} from './matchUpdateClock';
import {positionLabel,positionInfo,type PositionSelection} from './playerPositions';
import {recordQuestStep} from './questProgress';
import * as T from 'three';
import type {BallReactions} from '../graphics/ballReactions';
import {createLiveBallPhysics} from './liveBallPhysics';
import {createMatchEffects,type MatchEvent} from './matchEffects';
import {createLessonCues} from './lessonCues';
import {playerBatch} from '../graphics/playerBatch';
import {teachingMotion} from './teachingMotion';
import {createPlayer,profileFor,PLAYER_KICK_CONTACT,type PlayerRig,type PlayerMotion} from '../graphics/player';
import {createChoreo,windupTurnShare} from './match/choreo';
import {createComboView} from './match/combos'; // [combos] skill poses for combination plays
import {classicShirtNumber} from '../graphics/shirtNumbers';
import {fieldTokenDress} from './beanLooks';
import {createMatchBallTexture} from '../graphics/matchBallTexture';
import {MatchSim,ROLE_MOVEMENT} from './match/matchSim';
import {VENUES,LIVE_VENUES,liveWorldX,liveWorldZ,liveWorldYaw,type Venue,type LiveVenue,type LiveFormat} from './venues';
import {BEACH_MATCH_KITS} from './beanLooks';
import {quizOutcomeStep,lessonPositions,lessonVisualFrame,lessonStepSeconds,type FieldSession} from './formatLessons';
// Movement and ball share a per-format clock; the compact futsal court needs a brisker pace.
export const LIVE_GAME_SPEED=.32;
export const liveGameSpeed=(format:LiveFormat)=>format==='futsal'||format==='beach'?.48:LIVE_GAME_SPEED;
/** Sand (the Coral Cay beach court): a soft, low bounce instead of the grass pitches' .53 (liveBallPhysics). */
export const SAND_RESTITUTION=.3;
/** Live pace (sim speed / 84) above which no player holds the defensive ready stance. */
export const READY_MAX_PACE=.35;
/** The tactical countdown lasts .45 simulation seconds; visual recovery uses real time.
 * Recover the visible strike in .32 real seconds so the moving passer can run. */
export const liveKickPhase=(remaining:number,timeScale=LIVE_GAME_SPEED)=>.36+.64*Math.min(1,(1-Math.max(0,Math.min(1,remaining)))*.45/(timeScale*.32));
/** Prefer visible boot contact; retain a compact grounded fallback without a rig. */
export function groundDribbleContact(x:number,z:number,yaw:number,side:number,distance:number,speed:number,out:T.Vector3,scale=1,touch?:T.Vector3){
 if(touch)return out.copy(touch).setY(.295);
 const phase=((distance/1.1)%1+1)%1;
 // Fallback remains in front of the body without the old metre-long separation.
 const roll=Math.sin(Math.PI*phase)**2*Math.min(.12,speed*.025),forward=.5*scale+roll;
 return out.set(x+Math.sin(yaw)*forward+Math.cos(yaw)*side*.14*scale,.295,z+Math.cos(yaw)*forward-Math.sin(yaw)*side*.14*scale);
}
/** Stable per-player profile seed (venue + id), so a player's build never changes between sessions. */
export const profileSeed=(venue:string,id:string)=>{let h=2166136261;for(const c of venue+':'+id)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;};
/** Role body profile for a live rig: teaching lessons keep `mid`; applied only when the role changes (once per live rig). */
export function assignRigProfile(rig:PlayerRig,venue:string,id:string,role:'gk'|'def'|'mid'|'fwd'){if(rig.root.userData.profileRole===role)return false;rig.setProfile(profileFor(role,profileSeed(venue,id)));rig.root.userData.profileRole=role;return true;}
export const teachingPoseAdvances=(session:FieldSession,outcomeStep:number|null|undefined)=>outcomeStep!==undefined&&outcomeStep!==null?!session.outcomePaused&&(session.outcomeProgress??0)<1:session.playing;
type Entry={dormant?:boolean;synced?:boolean;choreo:ReturnType<typeof createChoreo>;comboView:ReturnType<typeof createComboView>;liveFrame:ReturnType<typeof createLiveFieldFrame>;clock:ReturnType<typeof createMatchUpdateClock>;venue:LiveVenue;sim:MatchSim;root:T.Group;rigs:Map<string,PlayerRig>;ball:T.Mesh;label:Map<string,T.Sprite>;lastLesson:string;effects:ReturnType<typeof createMatchEffects>;ballPhysics:ReturnType<typeof createLiveBallPhysics>};
export type LiveMatchView={events:MatchEvent[];players:{id:string;x:number;y:number;home:boolean}[];ball:{x:number;y:number};score:{gold:number;blue:number};/** Beach only: period 1–3, 4 extra time, 5 full time. */period?:number};
export function createFieldRuntime(scene:T.Scene,reactions?:BallReactions){
 const batch=playerBatch(scene),cues=createLessonCues(scene),paused=new Set<LiveFormat>(),hoverPaused=new Set<LiveFormat>(),collisionPaused=new Set<LiveFormat>();
 const isPaused=(format:LiveFormat)=>paused.has(format)||hoverPaused.has(format)||collisionPaused.has(format);
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const ballMap=createMatchBallTexture(),ballGeo=new T.SphereGeometry(.19,16,12),ballMat=new T.MeshStandardMaterial({color:'#ffffff',map:ballMap,roughness:.85});
 const lineMaterial=new T.LineBasicMaterial({color:'#e9c66d'}),lineGeometry=new T.BufferGeometry(),line=new T.LineSegments(lineGeometry,lineMaterial);scene.add(line);const linePositions=new T.Float32BufferAttribute(new Float32Array(1536),3);lineGeometry.setAttribute('position',linePositions);line.frustumCulled=false;
 // The four island pitches plus the Coral Cay beach court (LIVE_VENUES): one pooled rig set, clock and sim per venue.
 const entries:Entry[]=LIVE_VENUES.map((venue,i)=>{const root=new T.Group();root.name='match-'+venue.id;root.position.y=venue.elevation??0;scene.add(root);const ball=new T.Mesh(ballGeo,ballMat);ball.castShadow=true;root.add(ball);const sim=new MatchSim(270+i*41,venue.id);sim.windupScale=liveGameSpeed(venue.id);return {choreo:createChoreo(venue.yaw??0),comboView:createComboView(venue.yaw??0),liveFrame:createLiveFieldFrame(venue.id),clock:createMatchUpdateClock(),venue,root,sim,rigs:new Map(),ball,label:new Map(),lastLesson:'',effects:createMatchEffects(root,venue),ballPhysics:createLiveBallPhysics(liveGameSpeed(venue.id),venue,venue.sand?SAND_RESTITUTION:undefined)};});
 const stats={ticks:0,visiblePlayers:0,culledPlayers:0,skippedPoses:0,rigs:0,matchTime:0,dormant:0};let playerCulling=true;
 const playerView=new T.Sphere(new T.Vector3(),7);
 const frustum=new T.Frustum(),matrix=new T.Matrix4(),sphere=new T.Sphere(),emptyIds=new Set<string>(),skillBallPoint=new T.Vector3(),liveContact=new T.Vector3(),receivingContact=new T.Vector3(),keeperLeft=new T.Vector3(),keeperRight=new T.Vector3();
 const label=(entry:Entry,id:string,text:string,home:boolean)=>{let sprite=entry.label.get(id);if(!sprite){sprite=new T.Sprite(new T.SpriteMaterial({depthTest:false,depthWrite:false,toneMapped:false}));sprite.renderOrder=5;entry.root.add(sprite);entry.label.set(id,sprite);}const key=(home?'our:':'their:')+text;if(sprite.userData.text!==key){const canvas=document.createElement('canvas');const c=canvas.getContext('2d')!;c.font='bold 44px sans-serif';canvas.width=Math.ceil(c.measureText(text).width+24);canvas.height=64;c.fillStyle='#203e35';c.fillRect(0,0,canvas.width,64);c.font='bold 44px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillStyle=home?'#efbb54':'#609de3';c.fillText(text,canvas.width/2,34,canvas.width-16);sprite.material.map?.dispose();sprite.material.map=new T.CanvasTexture(canvas);sprite.material.map.colorSpace=T.SRGBColorSpace;sprite.material.needsUpdate=true;sprite.userData.text=key;}sprite.scale.set(3,.75,1);return sprite;};
 /** Commit one foot, contact offset and action for a whole strike (wind-up through follow-through). */
 function commitStrike(rig:PlayerRig,e:Entry,px:number,pz:number,strikeYaw:number,kind:'pass'|'shot'|'loft',power:number){
  const ud=rig.root.userData,scale=Math.max(.1,rig.root.scale.x);
  const bx=(e.ball.position.x-px)/scale,bz=(e.ball.position.z-pz)/scale,lateral=bx*Math.cos(strikeYaw)-bz*Math.sin(strikeYaw);
  // Commit one foot for the whole action; jittering reception plans cannot switch it mid-swing.
  ud.actionKind=kind;ud.strikePower=power;
  ud.strikeSide=Math.abs(lateral)>.04?(lateral>0?1:-1):(ud.contactSide??1);
  ud.strikeX=T.MathUtils.clamp(lateral,-.25,.25);
  ud.strikeZ=T.MathUtils.clamp(bx*Math.sin(strikeYaw)+bz*Math.cos(strikeYaw),.55,.92);
 }
 function update(dt:number,time:number,camera:T.Camera,session:FieldSession|null,active:boolean,viewingFormat:LiveFormat|null=null,viewportHeight=window.innerHeight,focus?:{x:number;z:number}){
 const question=session?.quiz?session.lesson.questions[session.question]:undefined;
 const outcomeStep=quizOutcomeStep(session);
 if(session){if(outcomeStep!==undefined&&outcomeStep!==null)session.outcomeProgress=Math.min(1,(session.outcomeProgress??0)+(active&&!session.outcomePaused?dt:0)/lessonStepSeconds(session.lesson.steps[outcomeStep]));else session.outcomeProgress=0;}
 const visualSession=session&&outcomeStep!==undefined&&outcomeStep!==null?{...session,step:outcomeStep,progress:session.outcomeProgress??0}:session;

 batch.begin();stats.visiblePlayers=0;stats.culledPlayers=0;stats.skippedPoses=0;stats.dormant=0;stats.ticks++;stats.matchTime=time;
 camera.updateMatrixWorld();frustum.setFromProjectionMatrix(matrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
 for(const e of entries){const v=e.venue,teaching=session?.format===v.id?session:null;
 sphere.center.set(v.x,1+(v.elevation??0),v.z);sphere.radius=Math.hypot(v.width,v.length)/2+2;
 const visible=(!viewingFormat||v.id===viewingFormat)&&(!session||!!teaching)&&frustum.intersectsSphere(sphere)&&(!!viewingFormat||camera.position.distanceTo(sphere.center)<240);
 // Nearby matches remain responsive to island ball hits, even just outside the view.
 const camDistance=camera.position.distanceTo(sphere.center);
 // Heat pass 5: a field that is off screen and far away is dormant: no clock, sim, bookkeeping or effects at all; it resumes exactly
 // where it paused when the camera comes back (sleep beyond radius + 60 m, wake inside radius + 50 m or as soon as it is in view — the
 // frustum + 240 m test runs before anything is drawn; the island ball-hit zone is radius + 45 m).
 // The Coral Cay beach court (QA Sep 29 2026) sleeps whenever it is off screen, at any distance: it stands alone on the cay's east
 // beach, so from the plaza (~80 m) it kept simulating unseen. It wakes the frame the frustum test sees it, exactly where it stopped.
 // QA11 (D note): with the player's position (`focus`, from Town), "near" is measured from the player, the only thing that can
 // touch an unseen match (the island ball's hit zone, radius + 45 m): sleep outside it, wake inside radius + 40 m. The camera sits
 // ~35 m ahead of the player, so from the spawn the unseen 11v11 read as "near" (77 m) and simulated for nobody.
 const near=focus?Math.hypot(focus.x-v.x,focus.z-v.z):camDistance,sleepAt=focus?45:60,wakeAt=focus?40:50;
 const dormant=!visible&&viewingFormat!==v.id&&!teaching&&(v.id==='beach'||(e.dormant?near>sphere.radius+wakeAt:near>sphere.radius+sleepAt));
 if(dormant!==e.dormant){e.dormant=dormant;if(dormant){e.root.visible=false;e.effects.update(e.sim,0,false,reduced);}}
 if(dormant){stats.dormant++;continue;}
 const immediate=visible||viewingFormat===v.id||camDistance<sphere.radius+45;
 const collisionToken=reactions?.states.size?e.liveFrame.tokens.find(token=>reactions.get(e.liveFrame.rows.get(token.id)!.hitId)?.cause==='truck'):undefined;
 const collisionHit=collisionToken?reactions?.get(e.liveFrame.rows.get(collisionToken.id)!.hitId):undefined;
 if(collisionHit)collisionPaused.add(v.id);else collisionPaused.delete(v.id);
 const matchDt=e.clock.take(dt,immediate,active&&!teaching&&!isPaused(v.id));
 // Audit F23: the live frame only changes when the sim steps (and once for a fresh field).
 if(matchDt>0||!e.synced){e.liveFrame.sync(e.sim.players);e.synced=true;}
 if(matchDt>0){for(const token of e.liveFrame.tokens){const row=e.liveFrame.rows.get(token.id)!,p=e.sim.players[token.id];row.frozen=!!reactions?.get(row.hitId);if(row.frozen){row.x=p.x;row.y=p.y;}}e.sim.step(matchDt*liveGameSpeed(e.venue.id));for(const token of e.liveFrame.tokens){const row=e.liveFrame.rows.get(token.id)!,p=e.sim.players[token.id];if(row.frozen&&p){p.x=row.x;p.y=row.y;p.vx=p.vy=0;}}e.liveFrame.sync(e.sim.players);}
 // Touch events → reactions/squash/calls: bookkeeping only, read even offscreen so nothing replays late.
 e.choreo.consume(e.sim,teaching?0:matchDt);
 e.comboView.consume(e.sim,teaching?0:matchDt); // [combos] skill events → timed poses
 // Ball height: real gravity and bounces (render-only), stepped even offscreen so a kick is never replayed late.
 const ballHeight=e.ballPhysics.step(e.sim,matchDt*liveGameSpeed(e.venue.id),!e.sim.ball.owner,e.comboView.kickStyle(e.sim.kicks)); // [combos] chip / knuckleball render arcs
 e.root.visible=visible;e.effects.update(e.sim,active&&!isPaused(v.id)?dt:0,visible&&!teaching,reduced,visible&&!teaching&&active&&(viewingFormat===v.id||camDistance<sphere.radius+35));if(!visible)continue; // [spot it] watching = on screen + near (lib/learning/spotIt.ts)
 let teachingPose:ReturnType<typeof teachingMotion>|undefined;
 let emphasized=emptyIds,callouts=emptyIds;
 let poses=e.liveFrame.poses,ball:{x:number;y:number}=e.sim.ball,tokens=e.liveFrame.tokens;
 if(teaching){if(active&&teaching.playing){teaching.progress+=dt/lessonStepSeconds(teaching.lesson.steps[teaching.step]);teaching.progress=Math.min(1,teaching.progress);if(teaching.progress>=1&&!teaching.voicePending){recordQuestStep(teaching.format,teaching.lesson.id,teaching.step);if(teaching.step<teaching.lesson.steps.length-1){teaching.progress=0;teaching.step++;teaching.voicePending=true;teaching.onStep(teaching.step);}else{teaching.progress=1;teaching.playing=false;teaching.onPlaying?.(false);}}}
 const visualStep=outcomeStep!==undefined&&outcomeStep!==null?outcomeStep:teaching.step,visualProgress=outcomeStep!==undefined&&outcomeStep!==null?teaching.outcomeProgress??0:teaching.progress;
 if(visualSession){visualSession.step=visualStep;visualSession.progress=visualProgress;}
 teachingPose=teachingMotion(teaching.lesson,v as Venue,visualStep,visualProgress);
 const sampled=lessonPositions(teaching.lesson,visualStep,visualProgress);poses=sampled.positions;ball=sampled.ball;tokens=[...teaching.lesson.offense.map(p=>({...p,home:true})),...teaching.lesson.defense.map(p=>({...p,home:false}))];
 const step=lessonVisualFrame(teaching.lesson,visualStep,visualProgress).step,ids=teaching.quiz&&teaching.answer===null?[]:[...new Set([...(teaching.quiz?teaching.lesson.questions[teaching.question]?.feedback?.highlight?.flatMap(h=>h.ids)??[]:step.highlight?.flatMap(h=>h.ids)??step.focusIds??[]),...(!teaching.quiz?step.overlays?.filter(o=>o.kind==='spotlight').flatMap(o=>o.ids??[])??[]:[])])];
 emphasized=new Set(ids);callouts=new Set((teaching.quiz?teaching.lesson.questions[teaching.question]?.feedback?.overlays:step.overlays)?.filter(o=>o.kind==='callout').map(o=>o.anchor??'')??[]);
 // Teaching highlights are drawn once by lessonCues, including quiz feedback.


 }
 const windup=!teaching?e.sim.kickWindup:null;
 const approachId=!teaching&&!e.sim.ball.owner?(e.sim.ball.intBy??e.sim.ball.target):null,approachPlayer=approachId?e.sim.players[approachId]:undefined;
 const approachPlan=approachPlayer&&!approachPlayer.isGK?e.sim.receptionPlan(approachId!):undefined;
 const approachDistance=approachPlayer?Math.hypot(e.sim.ball.x-approachPlayer.x,e.sim.ball.y-approachPlayer.y):Infinity;
 const highApproach=e.sim.ball.height>=.65,approachT=approachPlan&&e.sim.ball.height<2.2?Math.max(0,Math.min(1,(e.sim.receptionRadius*2.5-approachDistance)/(e.sim.receptionRadius*1.5))):0,approachWeight=approachT*approachT*(3-2*approachT);
 const used=teaching?new Set(tokens.map(t=>t.id)):e.liveFrame.used;for(const [id,rig] of e.rigs)rig.root.visible=used.has(id);for(const sprite of e.label.values())sprite.visible=false;
 for(const token of tokens){let rig=e.rigs.get(token.id);if(!rig){rig=createPlayer(token.id,token.home?'home':'away',false);const shirtNumber=classicShirtNumber(v.id,token.id);rig.setShirtNumber(shirtNumber);const dress=fieldTokenDress(v.id,token,shirtNumber,!!e.sim.players[token.id]?.isGK,v.sand?BEACH_MATCH_KITS:undefined);rig.setBeanLook(dress.look,dress.outfit);e.rigs.set(token.id,rig);stats.rigs++;}rig.root.visible=true;const position=poses.get(token.id)!,px=liveWorldX(v,position.x,position.y),pz=liveWorldZ(v,position.x,position.y);const live=e.sim.players[token.id];assignRigProfile(rig,v.id,token.id,teaching?'mid':live?.role??'mid');const hitId=e.liveFrame.rows.get(token.id)?.hitId??'field:'+v.id+':'+token.id,stunned=!teaching?reactions?.get(hitId):undefined;const reception=e.sim.recv.id===token.id&&e.sim.recv.t>0?e.sim.recv:null;
 const motion:PlayerMotion=teachingPose?.motions.get(token.id)??(teaching?{}:e.liveFrame.rows.get(token.id)!.motion);
 if(!teachingPose?.motions.has(token.id)){motion.stunAge=stunned?.age;motion.rooftopPose=stunned&&stunned.age>1.85?'dizzy':undefined;motion.dribbling=e.sim.ball.owner===token.id;motion.kick=live?.kick>0&&liveKickPhase(live.kick,liveGameSpeed(e.venue.id))<1?liveKickPhase(live.kick,liveGameSpeed(e.venue.id)):undefined;motion.facing=undefined;motion.receive=undefined;motion.receiveProgress=0;motion.shotPower=undefined;motion.kickSide=undefined;motion.samplePose=undefined;motion.scanYaw=undefined;motion.actionKind=undefined;motion.strikeX=motion.strikeZ=motion.intentHeading=motion.stopDistance=undefined;motion.jockey=0;motion.runIntensity=undefined;motion.keeper=0;motion.keeperReach=0;}
 if(!teaching&&reception&&windup?.id!==token.id){motion.facing=liveWorldYaw(v,reception.faceX,reception.faceY);motion.receive=Math.min(1,reception.t/Math.max(.001,reception.dur)*2);motion.receiveProgress=1-reception.t/Math.max(.001,reception.dur);motion.kickSide=reception.foot==='R'?-1:1;/* Sim right=(-faceY,faceX); rig side+= (cos(yaw),-sin(yaw)), so these signs intentionally differ. */}
 else if(!teaching&&approachId===token.id&&approachPlan){motion.facing=liveWorldYaw(v,approachPlan.faceX,approachPlan.faceY);if(!highApproach){motion.receive=approachWeight;motion.kickSide=approachPlan.foot==='R'?-1:1;}}
 else if(!teaching&&windup?.id===token.id){
 // Wind-up (CONTRACT §5): turn to face the target first, then the leg swing runs the strike from
 // phase 0 up to contact, so the live release (liveKickPhase starts at contact) continues it.
 const ud=rig.root.userData,progress=1-windup.t/Math.max(1e-6,windup.dur),share=windupTurnShare(windup.turn);
 motion.facing=liveWorldYaw(v,windup.tx-live.x,windup.ty-live.y);
 const swing=Math.max(0,Math.min(1,(progress-share)/Math.max(1e-6,1-share)));
 if(ud.windupRef!==windup){ud.windupRef=windup;ud.windupCommitted=false;}
 if(swing>0){
   if(!ud.windupCommitted){commitStrike(rig,e,px,pz,motion.facing,windup.kind==='loft'?'loft':windup.kind==='pass'?'pass':'shot',windup.kind==='shot'||windup.kind==='clear'?.85:windup.kind==='loft'?.7:.45);ud.windupCommitted=true;}
   motion.kick=PLAYER_KICK_CONTACT*swing;motion.actionKind=ud.actionKind;motion.kickSide=ud.strikeSide;motion.strikeX=ud.strikeX;motion.strikeZ=ud.strikeZ;motion.shotPower=ud.strikePower;
 }}
 else if(!teaching&&live?.kick>0){const release=e.sim.passRelease;if(live.kick>(rig.root.userData.lastKick??0)||rig.root.userData.releaseFacing===undefined)rig.root.userData.releaseFacing=release?.id===token.id?liveWorldYaw(v,release.tx-live.x,release.ty-live.y):liveWorldYaw(v,e.sim.ball.vx,e.sim.ball.vy);if(motion.kick!==undefined){
 const releaseYaw=rig.root.userData.releaseFacing,travelSpeed=Math.hypot(live.vx*v.width/250,live.vy*v.length/380)*liveGameSpeed(v.id);
 const recovery=T.MathUtils.smoothstep(motion.kick,.4,1),travelYaw=liveWorldYaw(v,live.vx,live.vy);
 motion.facing=releaseYaw+(travelSpeed>.15?Math.atan2(Math.sin(travelYaw-releaseYaw),Math.cos(travelYaw-releaseYaw))*recovery:0);
 }}
 else if(!teaching&&live&&e.sim.ball.owner!==token.id&&Math.hypot(live.vx,live.vy)<40)motion.facing=liveWorldYaw(v,e.sim.ball.x-live.x,e.sim.ball.y-live.y);
 motion.kickSide??=rig.root.userData.contactSide??1;
 if(!teaching&&live){
   if(live.kick>0){if(live.kick>(rig.root.userData.lastKick??0)){
     // A wound-up kick already committed its foot and action at the start of the swing: keep them
     // through contact (only the power follows the real ball pace). Otherwise commit now.
     const wound=rig.root.userData.windupCommitted;rig.root.userData.windupCommitted=false;rig.root.userData.windupRef=undefined;
     if(!wound)commitStrike(rig,e,px,pz,rig.root.userData.releaseFacing??rig.root.rotation.y,e.sim.ball.lofted?'loft':e.sim.passRelease?.id===token.id?'pass':'shot',0);
     rig.root.userData.strikePower=T.MathUtils.clamp(Math.hypot(e.sim.ball.vx*v.width/250,e.sim.ball.vy*v.length/380)/25,0,1);
     // Continue from the last visible boot contact instead of popping to sim root.
     if(e.root.userData.lastBallOwner===token.id&&e.sim.stats.time-(e.root.userData.lastBallTime??-Infinity)<.12){
       const release=e.sim.passRelease?.id===token.id?e.sim.passRelease:live,target=e.sim.ball.target?e.sim.players[e.sim.ball.target]:undefined,pace=Math.hypot(e.sim.ball.vx,e.sim.ball.vy);
       const flight=e.root.userData.releaseContact??(e.root.userData.releaseContact={});
       flight.x=e.ball.position.x-liveWorldX(v,release.x,release.y);flight.z=e.ball.position.z-liveWorldZ(v,release.x,release.y);flight.y=e.ball.position.y-(.295+ballHeight);flight.time=e.sim.stats.time;flight.duration=e.sim.shotActive?Math.max(.03,Math.min(.45,Math.abs((e.sim.lastKick.goalY-live.y)/(e.sim.ball.vy||1))*.6)):Math.max(.12,Math.min(1.2,target?Math.hypot(target.x-release.x,target.y-release.y)/Math.max(1,pace):.45));
     }
   }motion.actionKind=rig.root.userData.actionKind??'pass';if(motion.kick!==undefined){motion.kickSide=rig.root.userData.strikeSide??motion.kickSide;motion.strikeX=rig.root.userData.strikeX;motion.strikeZ=rig.root.userData.strikeZ;motion.shotPower=rig.root.userData.strikePower;}}
   const ballDistance=Math.hypot((e.sim.ball.x-live.x)*v.width/250,(e.sim.ball.y-live.y)*v.length/380),owner=e.sim.ball.owner?e.sim.players[e.sim.ball.owner]:undefined;
   const pace=Math.hypot(live.vx,live.vy)/84,movement=ROLE_MOVEMENT[live.role]??ROLE_MOVEMENT.mid;
   // Role pace: the same effort curve raised to 1/ROLE_MOVEMENT.speed, so a forward's run
   // reads quicker than a defender's at equal velocity while full tactical pace stays a sprint.
   motion.runIntensity=Math.pow(T.MathUtils.smoothstep(pace,.25,1),1/movement.speed);
   // Brake: the sim's per-step read is normalised to a flat-out stop (full speed × brake rate), so
   // an ordinary stop from a jog reads weak and flickers between substeps. Take the max with an
   // estimate from the sim velocity's own deceleration (sim u/s², measured between consecutive
   // sim samples only), held ~.15 s so the brake does not drop out mid-stop. Cruising and gentle
   // easing (< ~90 u/s²) never brake; the estimate fades as the player comes to rest.
   const ud=rig.root.userData,simTime=e.sim.stats.time,liveSpeed=Math.hypot(live.vx,live.vy),sampleDt=simTime-(ud.brakeSampleTime??-1);
   if(sampleDt!==0){
     // A gap (offscreen venue, reset match clock) restarts the read instead of faking a stop.
     const consecutive=sampleDt>0&&sampleDt<.05&&ud.brakeSampleSpeed!==undefined;
     const decel=consecutive?(ud.brakeSampleSpeed-liveSpeed)/sampleDt:0;
     const estimate=T.MathUtils.smoothstep(decel,90,300)*T.MathUtils.smoothstep(liveSpeed,8,24);
     ud.brakeEstimate=consecutive&&liveSpeed>4?Math.max(estimate,(ud.brakeEstimate??0)-sampleDt/.05):0;
     ud.brakeSampleTime=simTime;ud.brakeSampleSpeed=liveSpeed;
   }
   const intentX=(live.intentX??live.vx)*v.width/250,intentZ=(live.intentY??live.vy)*v.length/380;
   if(Math.hypot(intentX,intentZ)>.05)motion.intentHeading=Math.atan2(intentX,intentZ)+(v.yaw??0);
   if(live.moveDistance!==undefined)motion.stopDistance=live.moveDistance*Math.min(v.width/250,v.length/380);
   motion.brake=Math.max(live.brake,ud.brakeEstimate??0);motion.backpedal=live.backpedal;motion.plant=live.plant;
   // Jockey is a slow containing shuffle: it fades out by ~.6 pace so a chase reads as a run.
   motion.jockey=!live.isGK&&owner&&owner.team!==live.team&&ballDistance<9&&!motion.kick?Math.max(0,1-ballDistance/11)*(1-T.MathUtils.smoothstep(pace,.35,.6)):0;
   if(motion.jockey>0&&!reception&&approachId!==token.id){
     const ballYaw=liveWorldYaw(v,e.sim.ball.x-live.x,e.sim.ball.y-live.y),travelYaw=liveWorldYaw(v,live.vx,live.vy);
     // Contain facing the attacker; open the hips into a run as the pace builds (fully open
     // before the jockey fades, so the facing hands over to the travel direction seamlessly).
     const chase=T.MathUtils.smoothstep(pace,.45,.58);
     motion.facing=ballYaw+Math.atan2(Math.sin(travelYaw-ballYaw),Math.cos(travelYaw-ballYaw))*chase;
   }
   // Backpedal: retreat facing the carrier (sim faceX/faceY), not along the velocity.
   if(live.backpedal>0&&(live.faceX||live.faceY)&&!reception&&approachId!==token.id&&!motion.kick)motion.facing=liveWorldYaw(v,live.faceX,live.faceY);
   // Keepers and defenders set a ready stance when still or jockeying slowly near a live ball;
   // never at pace (a sprint in a deep crouch reads wrong).
   const ballLive=!owner||owner.team!==live.team;
   motion.stance=(live.role==='gk'||live.role==='def')&&ballLive&&!motion.kick&&!motion.dribbling&&!reception&&pace<READY_MAX_PACE&&(pace<.15||motion.jockey>0)&&ballDistance<(live.isGK?24:14)?'ready':undefined;
   // Readable intent: called receiver, ready marker, reactions and the squash spring (choreo.ts).
   e.choreo.apply(token.id,motion,pace);
   e.comboView.apply(token.id,motion,rig.root.rotation.y);e.comboView.settle(motion); // [combos] skill moves (skillMoves.ts / lane B moves) timed to the sim's touch
   motion.keeper=live.isGK?1:0;motion.keeperReach=live.isGK?(e.sim.ball.owner===token.id?.65:!e.sim.ball.owner&&ballDistance<3?Math.max(0,1-ballDistance/3):0):0;
   if((e.sim.ball.target===token.id||approachId===token.id)&&!reception){if(!approachPlan)motion.facing=liveWorldYaw(v,e.sim.ball.x-live.x,e.sim.ball.y-live.y);motion.scanYaw=Math.sin(Math.PI*Math.min(1,Math.max(0,(ballDistance-3)/8)))*.35*(motion.kickSide??1);}
   if(motion.dribbling){const travelled=rig.root.userData.wasDribbling?Math.min(.5,Math.hypot(px-rig.root.position.x,pz-rig.root.position.z)):0;rig.root.userData.dribbleDistance=(rig.root.userData.dribbleDistance??0)+travelled;}else rig.root.userData.dribbleDistance=0;
   rig.root.userData.wasDribbling=motion.dribbling;
 }
 rig.root.userData.lastKick=live?.kick??0;
 const protesting=!teaching&&!stunned&&collisionPaused.has(v.id);
 if(protesting){if(collisionHit)motion.facing=Math.atan2(collisionHit.x-px,collisionHit.z-pz);motion.backpedal=motion.brake=motion.plant=0;motion.stance=undefined;motion.kick=undefined;motion.receive=undefined;motion.dribbling=false;}
 // Gate posing with the same generous shadow bounds used for drawing.
 playerView.center.set(px+1.5,(v.elevation??0)+1.5,pz-1);playerView.radius=7+Math.max(0,v.elevation??0)*2;
 const inView=!playerCulling||!!teaching||frustum.intersectsSphere(playerView);
 if(!inView&&!stunned&&!protesting&&!reception&&!motion.kick&&!motion.dribbling){
   rig.root.position.set(px,(v.elevation??0)+.105,pz);rig.root.userData.poseSkipped=true;stats.skippedPoses++;stats.culledPlayers++;continue;
 }
 motion.resumePose=!!rig.root.userData.poseSkipped;rig.root.userData.poseSkipped=false;
 // Ball attention is selective: receivers/carriers, or focused teaching actors.
 const attending=!stunned&&!protesting&&(!!reception||motion.dribbling||!teaching&&(e.sim.ball.target===token.id||approachId===token.id)||!!teaching&&(!!motion.receive||!!motion.kick));
 motion.lookX=attending?liveWorldX(v,ball.x,ball.y):undefined;
 motion.lookZ=attending?liveWorldZ(v,ball.x,ball.y):undefined;motion.lookY=attending?.295+(teaching?0:e.sim.ball.height):undefined;
 const poseClock=protesting?time:teaching?(outcomeStep!==undefined&&outcomeStep!==null?teaching.outcomeProgress??0:teaching.step+(teaching.progress??0)):e.sim.stats.time;
 const holdLivePose=!teaching&&!stunned&&!protesting&&rig.root.userData.liveMotion&&(!active||isPaused(v.id));
 if(!holdLivePose)rig.update(px,pz,active&&!stunned&&(teaching?teachingPoseAdvances(teaching,outcomeStep):(!isPaused(v.id)||protesting&&!paused.has(v.id)&&!hoverPaused.has(v.id)))?dt:0,poseClock,reduced,motion);
 rig.root.userData.posed=true;rig.root.userData.poseClock=poseClock;rig.root.userData.contactSide=motion.kickSide??1;rig.root.userData.teachingMotion=teaching?motion:undefined;rig.root.userData.liveMotion=!teaching?motion:undefined;rig.root.position.y=(v.elevation??0)+.105;if(!teaching)reactions?.apply(hitId,rig.root,false);
 if(protesting)applyTruckProtest(rig.root,time,reduced);else if(!stunned)rig.root.rotation.z=0;
 // Main-character bump (lib/town/fieldCollision): render-only sidestep + lean; the sim position is untouched.
 if(!teaching&&!stunned){const nudge=rig.root.userData.fieldNudge as {x:number;z:number;lean:number}|undefined;if(nudge||rig.root.userData.fieldNudged){rig.root.position.x=px+(nudge?.x??0);rig.root.position.z=pz+(nudge?.z??0);if(nudge)rig.root.rotation.z+=nudge.lean;}rig.root.userData.fieldNudged=!!nudge;}
 // The live batch has no per-instance frustum culling. Retain an oversized
 // body + sunset-shadow volume; teaching always keeps every participant.
 if(inView){batch.draw(rig.root);stats.visiblePlayers++;}else stats.culledPlayers++;
 if(teaching){const s=label(e,token.id,token.label,token.home);s.position.set(px,2.65,pz);s.visible=teaching.quiz&&teaching.answer===null&&Boolean(question&&new RegExp('\\b'+token.label+'\\b').test(question.q));
 if(s.visible&&camera instanceof T.PerspectiveCamera){const center=s.getWorldPosition(new T.Vector3()),up=new T.Vector3(0,1,0).applyQuaternion(camera.quaternion),a=center.clone().project(camera),b=center.add(up).project(camera),unit=Math.abs(b.y-a.y)*viewportHeight/2;if(unit>.001){s.scale.set(Math.min(96,Math.max(32,token.label.length*6+14))/unit,18/unit,1);s.position.addScaledVector(up,14/unit);}}
 }}
 // The shot's sideways placement runs along the pitch's width axis (world x on the island pitches).
 const shotOffset=teaching?0:e.ballPhysics.shotOffset;
 if(v.yaw)e.ball.position.set(liveWorldX(v,ball.x,ball.y)+shotOffset*Math.cos(v.yaw),.295+(teaching?0:ballHeight),liveWorldZ(v,ball.x,ball.y)-shotOffset*Math.sin(v.yaw));
 else e.ball.position.set(v.x+(ball.x-135)/250*v.width+shotOffset,.295+(teaching?0:ballHeight),v.z+(ball.y-200)/380*v.length);
 if(teaching&&teachingPose){
 const contact=(id:string|undefined)=>{const rig=id?e.rigs.get(id):undefined;return rig?rig.ballContact(rig.root.userData.contactSide??1,new T.Vector3()):null;};
 if(teachingPose.pass){
   const visualStep=outcomeStep!==undefined&&outcomeStep!==null?outcomeStep:teaching.step,frame=teachingPose.contactFrame,contactClock=outcomeStep!==undefined&&outcomeStep!==null?0:visualStep;
   let anchors=e.root.userData.teachingContacts;
   if(!anchors||anchors.lesson!==teaching.lesson||anchors.step!==visualStep||anchors.beat!==frame.beat||anchors.clock!==contactClock){
     // Sample actual selected boots once per beat, then restore the current pose.
     // samplePose makes both the endpoint and restore independent of seek history.
     const sampleContact=(id:string|undefined,progress:number,fallback:{x:number;z:number})=>{
       const rig=id?e.rigs.get(id):undefined;if(!rig)return new T.Vector3(fallback.x,.295,fallback.z);
       const sampled=teachingMotion(teaching.lesson,v as Venue,visualStep,progress),at=sampled.poses.get(id!)!,motion=sampled.motions.get(id!)!,current=rig.root.userData.teachingMotion as PlayerMotion,root=teachingPose.poses.get(id!)!;
       rig.update(at.x,at.z,0,contactClock+progress,reduced,motion);rig.root.position.y=(v.elevation??0)+.105;
       const point=rig.ballContact(motion.kickSide??1,new T.Vector3());point.y=.295;
       rig.update(root.x,root.z,0,rig.root.userData.poseClock,reduced,current);rig.root.position.y=(v.elevation??0)+.105;
       return point;
     };
     // A keeper's throw or roll-out leaves from his hand, not a boot (the step's skill, teachingMotion).
     const hand=teachingPose.skill?.release;
     anchors={lesson:teaching.lesson,step:visualStep,beat:frame.beat,clock:contactClock,release:hand?new T.Vector3(hand.x,hand.y,hand.z):sampleContact(teachingPose.source,frame.releaseProgress,teachingPose.release),arrival:sampleContact(teachingPose.receiver,frame.arrivalProgress,teachingPose.arrival)};
     e.root.userData.teachingContacts=anchors;
   }
   e.ball.position.copy(anchors.release).lerp(anchors.arrival,teachingPose.travel);
   // A moving passer carries the grounded ball through preparation; only the
   // released flight freezes its origin. This joins the sampled boot at .18.
   if(teachingPose.travel===0&&teachingPose.source){const source=teachingPose.poses.get(teachingPose.source)!;e.ball.position.x+=source.x-teachingPose.releaseRoot.x;e.ball.position.z+=source.z-teachingPose.releaseRoot.z;}
   if(teachingPose.landed){const received=contact(teachingPose.receiver);if(received)e.ball.position.copy(received).setY(.295);}
   // Skills: the keeper holds the ball on the move's hand path until he lets go; an overarm throw flies in an arc.
   const sk=teachingPose.skill;
   if(sk?.ball&&sk.weight>0&&teachingPose.travel===0)e.ball.position.lerp(skillBallPoint.set(sk.ball.x,sk.ball.y,sk.ball.z),sk.weight);
   if(sk?.type==='keeperThrow'&&teachingPose.travel>0&&teachingPose.travel<1)e.ball.position.y+=1.1*4*teachingPose.travel*(1-teachingPose.travel);
 }else {const a=contact(teachingPose.source);if(a)e.ball.position.copy(a).setY(.295);
   // A turn or a shield in this step: the ball follows the move's authored path at the boot, then hands back.
   const sk=teachingPose.skill;if(sk?.ball&&sk.weight>0)e.ball.position.lerp(skillBallPoint.set(sk.ball.x,sk.ball.y,sk.ball.z),sk.weight);}
  teaching.renderedBall={x:e.ball.position.x,z:e.ball.position.z,landed:teachingPose.landed};if(visualSession)visualSession.renderedBall=teaching.renderedBall;
 }else if(e.sim.ball.owner&&e.sim.players[e.sim.ball.owner]?.isGK){const keeper=e.rigs.get(e.sim.ball.owner);if(keeper){keeper.handPositions(keeperLeft,keeperRight);e.ball.position.copy(keeperLeft).lerp(keeperRight,.5);e.ball.position.y-=v.elevation??0;
 // [combos] a throw, roll-out or punt carries the ball on the move's authored hand path (one hand for the throw).
 if(e.comboView.holds(e.sim.ball.owner))e.comboView.ball(e.sim.ball.owner,e.ball.position,keeper.root.position,keeper.root.scale.x,.295);}}
 else if(e.sim.ball.owner){const ownerRig=e.rigs.get(e.sim.ball.owner),owner=e.sim.players[e.sim.ball.owner];if(ownerRig){
 const speed=Math.hypot(owner.vx*v.width/250,owner.vy*v.length/380)*liveGameSpeed(v.id);
 const held=groundDribbleContact(ownerRig.root.position.x,ownerRig.root.position.z,ownerRig.root.rotation.y,ownerRig.root.userData.contactSide??1,ownerRig.root.userData.dribbleDistance??0,speed,liveContact,ownerRig.root.scale.x,ownerRig.dribbleContact(receivingContact));
 const recv=e.sim.recv,q=recv.id===e.sim.ball.owner?Math.min(1,recv.t/Math.max(.001,recv.dur)):0;
 if(q>0){ownerRig.ballContact(ownerRig.root.userData.contactSide??1,receivingContact);receivingContact.y=.295;held.lerp(receivingContact,q*q*(3-2*q));
 // A chest/thigh/head control: the ball falls from the touch height to the feet over the cushion.
 const drop=e.choreo.touchHeight(e.sim.ball.owner);if(drop>.05)held.y+=drop*(1-(1-q)*(1-q));}
 // A futsal flick-up lifts the ball off the boot (choreo times it to the flick's contact).
 held.y+=e.choreo.ballLift(e.sim.ball.owner);
 // [combos] during a skill the ball follows the move's authored path (its contacts are pinned to the boots)
 e.comboView.ball(e.sim.ball.owner,held,ownerRig.root.position,ownerRig.root.scale.x,.295);
 e.ball.position.copy(held);
 }}
 if(!teaching&&!e.sim.ball.owner){const flight=e.root.userData.releaseContact;if(flight){const t=Math.max(0,Math.min(1,(e.sim.stats.time-flight.time)/flight.duration)),weight=1-t*t*(3-2*t);e.ball.position.x+=flight.x*weight;e.ball.position.z+=flight.z*weight;e.ball.position.y+=(flight.y??0)*weight;if(t>=1)e.root.userData.releaseContact=undefined;}}
 else e.root.userData.releaseContact=undefined;
 if(approachWeight>0&&approachId){const receiver=e.rigs.get(approachId);if(receiver){receiver.ballContact(receiver.root.userData.contactSide??1,receivingContact);receivingContact.y=.295;const y=e.ball.position.y;e.ball.position.lerp(receivingContact,approachWeight);if(highApproach)e.ball.position.y=y;/* a high ball is met in the air, not pulled to the boot */}}
 e.root.userData.lastBallOwner=teaching?undefined:e.sim.ball.owner;e.root.userData.lastBallTime=e.sim.stats.time;
 if(teaching){e.ball.rotation.x=e.ball.position.z/.19;e.ball.rotation.z=-e.ball.position.x/.19;}
 else{e.ballPhysics.roll(e.ball,ballHeight<.02,active&&!isPaused(v.id)?dt:0);e.effects.trail(e.ball.position,camera,reduced);if(e.ballPhysics.landing>2&&!reduced)e.effects.impact(e.ball.position.x,e.ball.position.y,e.ball.position.z);}
 }
 cues.update(visualSession,session?VENUES.find(v=>v.id===session.format):undefined,camera,viewportHeight);
 batch.end();
 lineGeometry.setDrawRange(0,0);line.visible=false;
 }
 function pickPlayer(point:T.Vector2,camera:T.Camera,width:number,height:number,format?:LiveFormat|null,touch=false){
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
 return {entries,stats,update,setPlayerCulling(value:boolean){playerCulling=value;},pickPlayer,setHoverPaused(format:LiveFormat|null){hoverPaused.clear();if(format)hoverPaused.add(format);},isPaused,setPaused(format:LiveFormat,value:boolean){if(value)paused.add(format);else paused.delete(format);},getView(format:LiveFormat):LiveMatchView|null{const e=entries.find(e=>e.venue.id===format);return e?{events:[...e.effects.events],players:Object.values(e.sim.players).map(p=>({id:p.id,x:p.x,y:p.y,home:p.team==='gold'})),ball:{x:e.sim.ball.x,y:e.sim.ball.y},score:{...e.sim.score},period:e.sim.isBeach?e.sim.period:undefined}:null;},pickQuiz:cues.pick,dispose(){cues.dispose();batch.dispose();for(const e of entries){e.effects.dispose();e.rigs.forEach(r=>r.dispose());for(const s of e.label.values()){s.material.map?.dispose();s.material.dispose();}e.root.removeFromParent();}line.removeFromParent();[ballMap,ballGeo,ballMat,lineGeometry,lineMaterial].forEach(r=>r.dispose());}};
}
