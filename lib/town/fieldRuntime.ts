import {applyTruckProtest} from '../graphics/truckReactions';
import {createLiveFieldFrame} from './liveFieldFrame';
import {createMatchUpdateClock} from './matchUpdateClock';
import {positionLabel,positionInfo,type PositionSelection} from './playerPositions';
import {recordQuestStep} from './questProgress';
import * as T from 'three';
import type {BallReactions} from '../graphics/ballReactions';
import {createLiveBallPhysics} from './liveBallPhysics';
import {createLiveBallSound,type LiveBallSoundPlay,type LiveBallSoundKind} from './liveBallSound';
import {createMatchEffects,type MatchEvent} from './matchEffects';
import {createPuppetTouches} from './match/puppetTouches';
import {createLessonCues} from './lessonCues';
import {playerBatch} from '../graphics/playerBatch';
import {teachingMotion} from './teachingMotion';
import {dressJoinedRig,undressJoinedRig} from './joinedRig';
import {createPlayer,profileFor,PLAYER_KICK_CONTACT,type PlayerRig,type PlayerMotion} from '../graphics/player';
import {createChoreo,windupTurnShare} from './match/choreo';
import {createComboView} from './match/combos'; // [combos] skill poses for combination plays
import {classicShirtNumber} from '../graphics/shirtNumbers';
import {fieldTokenDress,liveMatchKits,type BeanDress} from './beanLooks';
import {joinableFormat,chooseJoinTeam,pickSlot,handBack,touchlineSpot,benchMargin,clearOfFlags,stepBench,cheerAge,CHEER_SECONDS,LIVE_JOIN_FORMATS,type BenchWalker,type SlotCandidate,type JoinPick} from './liveJoin';
import {TRICK,PRESS,HUMAN_FEEL,POWER_SHOT,type HumanFrame,type TrickKind} from './match/humanInputs';
import {createBodyFx,createMoveView,fillMoveView,type HumanMoveView} from './liveBodyFx';// keeper feel + body moves (Nov 5 2026)
import {createSnapBuffer,createInAccum,accumulateIn,encodeSnap,type SnapBuffer} from './match/matchNet';
import {applyBodyEmote} from '../graphics/bodyEmotePose';
import {BODY_EMOTE} from './emoteBody';
import {createMatchBallTexture} from '../graphics/matchBallTexture';
import {createBallReset} from './ballReset';
import {createGoalReplay,replaysEnabled,type GoalReplay} from './goalReplay';
import {MatchSim,ROLE_MOVEMENT} from './match/matchSim';
import {maxTurnRate,createControlState,stepControl,settlePace,MOTION} from './match/matchMotion';
import {VENUES,LIVE_VENUES,BEACH_TOUCHLINE_FLAGS_Y,liveWorldX,liveWorldZ,liveWorldYaw,liveFieldPoint,type Venue,type LiveVenue,type LiveFormat} from './venues';
import {quizOutcomeStep,quizAnswerRevealed,lessonPositions,lessonVisualFrame,lessonStepSeconds,loftPeak,type FieldSession} from './formatLessons';
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
export function assignRigProfile(rig:PlayerRig,venue:string,id:string,role:'gk'|'def'|'mid'|'fwd'){if(rig.root.userData.profileRole===role||rig.root.userData.profileLocked)return false;rig.setProfile(profileFor(role,profileSeed(venue,id)));rig.root.userData.profileRole=role;return true;}
export const teachingPoseAdvances=(session:FieldSession,outcomeStep:number|null|undefined)=>outcomeStep!==undefined&&outcomeStep!==null?!session.outcomePaused&&(session.outcomeProgress??0)<1:session.playing;
/** A human on a live field (join a live game): his slot, team, look, and the NPC he replaced sitting out on the touchline. */
type HumanSlot={shotSeen?:number;slipSeen?:number;humanId:string;slot:string;team:'gold'|'blue';dress:BeanDress;bench:BenchWalker;benchRig:PlayerRig;benchMotion:PlayerMotion;goals:number;base?:{x:number;y:number;z:number};/** The last dribbling trick the view played (HumanInput.trickSerial). */trickSeen?:number};
/** What Town reads about a joined human each frame (one reused object, no allocation). */
export type HumanView={x:number;z:number;yaw:number;team:'gold'|'blue';onBall:boolean;/** 'mine' on the ball, 'team' a teammate has it, 'opp' the other team, 'loose' nobody. */possession:'mine'|'team'|'opp'|'loose';passX:number;passZ:number;forwardX:number;forwardZ:number;goalX:number;goalZ:number;restart:boolean;callOpen:boolean|null;inShotRange:boolean;/** In goal (human keeper, Nov 4 2026) and, on the ball, holding it in his hands. */keeper:boolean;hands:boolean;/** Trick / Press buttons (owner Nov 4 2026): cooldown left 0..1 (1 = just used) and whether the trick window / the press is on. */trickCd:number;trickOn:boolean;pressCd:number;pressOn:boolean;/** Bumps on every trick (the HUD's popup word, slow motion and zoom); the move played. */trickSerial:number;trickKind:TrickKind;/** Bumps on every shot of his (slow motion), its charge 0..1 and whether a corner was picked; bumps on every AI tackle he slips away from. */shotSerial:number;shotPw:number;shotAimed:boolean;slipSerial:number;/** Easier controls (Nov 5 2026): the carrier's distance from me (sim units, NaN when nobody else has it) and world point; my sim x and the sim x of the keeper I shoot at (NaN: none), for the tap shot's corner. */carrierD:number;carrierX:number;carrierZ:number;simX:number;keeperX:number;/** Teammates calling for the ball (MatchSim.teamCallers, Nov 5 2026), up to two: world point + weight 0..1 (NaN / 0: none). */callAX:number;callAZ:number;callAW:number;callBX:number;callBZ:number;callBW:number}&HumanMoveView;
export const createHumanView=():HumanView=>({x:0,z:0,yaw:0,team:'gold',onBall:false,possession:'loose',passX:NaN,passZ:NaN,forwardX:NaN,forwardZ:NaN,goalX:0,goalZ:0,restart:false,callOpen:null,inShotRange:false,keeper:false,hands:false,trickCd:0,trickOn:false,pressCd:0,pressOn:false,trickSerial:0,trickKind:'stepover',shotSerial:0,shotPw:0,shotAimed:false,slipSerial:0,carrierD:NaN,carrierX:NaN,carrierZ:NaN,simX:135,keeperX:NaN,callAX:NaN,callAZ:NaN,callAW:0,callBX:NaN,callBZ:NaN,callBW:0,...createMoveView()});
type Entry={/** Multiplayer slice 2: a friend's phone runs this match; the sim is a puppet fed by snapshots (null = this phone runs it). */puppet?:SnapBuffer|null;/** No snapshot sampled yet since the puppet began (its first score is the shared match's, not a goal). */puppetFresh?:boolean;/** Kick effects on a puppet: its touch ring written from the snapshots (lib/town/match/puppetTouches.ts); a rig's position lookup. */puppetTouch?:ReturnType<typeof createPuppetTouches>;at?:(id:string,out:T.Vector3)=>boolean;/** The rendered ball height last frame (m): the owner's snapshot carries it. */lastBallH?:number;/** Friends on this field: slot -> name (their name tag). */names?:Map<string,string>;humans:Map<string,HumanSlot>;slotDress:Map<string,BeanDress>;benchPool:PlayerRig[];dormant?:boolean;synced?:boolean;choreo:ReturnType<typeof createChoreo>;comboView:ReturnType<typeof createComboView>;liveFrame:ReturnType<typeof createLiveFieldFrame>;clock:ReturnType<typeof createMatchUpdateClock>;venue:LiveVenue;sim:MatchSim;root:T.Group;rigs:Map<string,PlayerRig>;ball:T.Mesh;label:Map<string,T.Sprite>;lastLesson:string;effects:ReturnType<typeof createMatchEffects>;ballPhysics:ReturnType<typeof createLiveBallPhysics>;ballSound:ReturnType<typeof createLiveBallSound>;/** Quick goal reset view (human matches): fade in the net, arrival on the centre spot. */ballReset:ReturnType<typeof createBallReset>;/** Goal replays (lib/town/goalReplay.ts): made the first time I join this field. */replay?:GoalReplay};
export type LiveMatchView={events:MatchEvent[];players:{id:string;x:number;y:number;home:boolean}[];ball:{x:number;y:number};score:{gold:number;blue:number};/** Beach only: period 1–3, 4 extra time, 5 full time. */period?:number};
/** The local human's id (liveJoinRuntime ME). */
const OWN='me';
export function createFieldRuntime(scene:T.Scene,reactions?:BallReactions){
 const batch=playerBatch(scene),cues=createLessonCues(scene),paused=new Set<LiveFormat>(),hoverPaused=new Set<LiveFormat>(),collisionPaused=new Set<LiveFormat>();
 const isPaused=(format:LiveFormat)=>paused.has(format)||hoverPaused.has(format)||collisionPaused.has(format);
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const ballMap=createMatchBallTexture(),ballGeo=new T.SphereGeometry(.19,16,12),ballMat=new T.MeshStandardMaterial({color:'#ffffff',map:ballMap,roughness:.85});
 const lineMaterial=new T.LineBasicMaterial({color:'#e9c66d'}),lineGeometry=new T.BufferGeometry(),line=new T.LineSegments(lineGeometry,lineMaterial);scene.add(line);const linePositions=new T.Float32BufferAttribute(new Float32Array(1536),3);lineGeometry.setAttribute('position',linePositions);line.frustumCulled=false;
 // The four island pitches plus the Coral Cay beach court (LIVE_VENUES): one pooled rig set, clock and sim per venue.
 const entries:Entry[]=LIVE_VENUES.map((venue,i)=>{const root=new T.Group();root.name='match-'+venue.id;root.position.y=venue.elevation??0;scene.add(root);const ball=new T.Mesh(ballGeo,ballMat);ball.castShadow=true;root.add(ball);const ballReset=createBallReset(root,ball,ballMat);const sim=new MatchSim(270+i*41,venue.id);sim.windupScale=liveGameSpeed(venue.id);sim.receiveSettle=settlePace(venue.width,liveGameSpeed(venue.id));return {humans:new Map(),slotDress:new Map(),benchPool:[],choreo:createChoreo(venue.yaw??0),comboView:createComboView(venue.yaw??0),liveFrame:createLiveFieldFrame(venue.id),clock:createMatchUpdateClock(),venue,root,sim,rigs:new Map(),ball,label:new Map(),lastLesson:'',effects:createMatchEffects(root,venue),ballPhysics:createLiveBallPhysics(liveGameSpeed(venue.id),venue,venue.sand?SAND_RESTITUTION:undefined),ballSound:createLiveBallSound(venue,liveGameSpeed(venue.id)),ballReset};});
 /** The walking ball's kick / bounce / receive sounds for the live ball (Town wires islandSound.ball; null = silent). */
 let ballSoundPlay:LiveBallSoundPlay|null=null;
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
 /** Keeper feel + body moves per field (lib/town/liveBodyFx.ts), made on first use (a field with humans). */
 const bodyFx=new Map<string,ReturnType<typeof createBodyFx>>(),bodyFxOf=(e:Entry)=>{let f=bodyFx.get(e.venue.id);if(!f){f=createBodyFx();bodyFx.set(e.venue.id,f);}return f;};
 function update(dtIn:number,time:number,camera:T.Camera,session:FieldSession|null,active:boolean,viewingFormat:LiveFormat|null=null,viewportHeight=window.innerHeight,focus?:{x:number;z:number}){
 const dt=dtIn;
 const question=session?.quiz?session.lesson.questions[session.question]:undefined;
 const outcomeStep=quizOutcomeStep(session);
 if(session){if(outcomeStep!==undefined&&outcomeStep!==null)session.outcomeProgress=Math.min(1,(session.outcomeProgress??0)+(active&&!session.outcomePaused?dt:0)/lessonStepSeconds(session.lesson.steps[outcomeStep]));else session.outcomeProgress=0;}
 const visualSession=session&&outcomeStep!==undefined&&outcomeStep!==null?{...session,step:outcomeStep,progress:session.outcomeProgress??0}:session;

 batch.begin();stats.visiblePlayers=0;stats.culledPlayers=0;stats.skippedPoses=0;stats.dormant=0;stats.ticks++;stats.matchTime=time;
 camera.updateMatrixWorld();frustum.setFromProjectionMatrix(matrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
 for(const e of entries){const v=e.venue,teaching=session?.format===v.id?session:null;
 // Goal replay (lib/town/goalReplay.ts): while one plays this field draws the replay at its rate (the rigs' dt too: real slow motion);
 // solo, the sim holds (no clock); shared, the match runs on underneath at real time.
 const rp=!teaching&&e.replay&&e.humans.has(OWN)&&e.replay.step(active?dtIn:0,!!e.puppet||e.humans.size>1,reduced,e.sim.goalHold,e.puppet?e.puppet.restart:e.sim.isRestart)?e.replay:null;
 const dt=rp?dtIn*rp.rate:dtIn;
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
 if(dormant){stats.dormant++;continue;}// a joined field is never dormant: the joiner stands on it (`focus`) and the camera shows it
 const immediate=visible||viewingFormat===v.id||camDistance<sphere.radius+45||e.humans.size>0;
 const collisionToken=reactions?.states.size?e.liveFrame.tokens.find(token=>reactions.get(e.liveFrame.rows.get(token.id)!.hitId)?.cause==='truck'):undefined;
 const collisionHit=collisionToken?reactions?.get(e.liveFrame.rows.get(collisionToken.id)!.hitId):undefined;
 if(collisionHit)collisionPaused.add(v.id);else collisionPaused.delete(v.id);
 const matchDt=e.clock.take(dtIn,immediate,active&&!teaching&&!isPaused(v.id)&&!rp?.holdSim);
 // Audit F23: the live frame only changes when the sim steps (and once for a fresh field).
 if(matchDt>0||!e.synced){e.liveFrame.sync(e.sim.players);e.synced=true;}
 if(matchDt>0&&e.puppet){/* a friend's match: sample the snapshots (no AI step); the rig clock still runs */const me=e.humans.get(OWN);if(e.puppet.sample(e.sim,performance.now(),me?e.sim.ids.indexOf(me.slot):-1,liveGameSpeed(e.venue.id)/1000)&&e.puppetFresh){/* the first frame of a friends' match: its score is not a goal here (no GOAL! card, no replay of my old match) */e.puppetFresh=false;e.effects.syncScore(e.sim);e.replay?.cancel();}e.puppetTouch?.step(e.sim,matchDt);if(e.sim.humans.size)e.sim.updateCalls(matchDt*liveGameSpeed(e.venue.id));/* teammates calling for the ball: from the snapshot's positions (no rng, no protocol) */e.sim.stats.time+=matchDt*liveGameSpeed(e.venue.id);e.liveFrame.sync(e.sim.players);}
 else if(matchDt>0){for(const token of e.liveFrame.tokens){const row=e.liveFrame.rows.get(token.id)!,p=e.sim.players[token.id];row.frozen=!!reactions?.get(row.hitId);if(row.frozen){row.x=p.x;row.y=p.y;}}e.sim.step(matchDt*liveGameSpeed(e.venue.id));for(const token of e.liveFrame.tokens){const row=e.liveFrame.rows.get(token.id)!,p=e.sim.players[token.id];if(row.frozen&&p){p.x=row.x;p.y=row.y;p.vx=p.vy=0;}}e.liveFrame.sync(e.sim.players);}
 // Touch events → reactions/squash/calls: bookkeeping only, read even offscreen so nothing replays late.
 e.choreo.consume(e.sim,teaching?0:matchDt);
 e.comboView.consume(e.sim,teaching?0:matchDt); // [combos] skill events → timed poses
 // Ball height: real gravity and bounces (render-only), stepped even offscreen so a kick is never replayed late.
 let ballHeight=e.puppet?e.puppet.ballH:e.ballPhysics.step(e.sim,matchDt*liveGameSpeed(e.venue.id),!e.sim.ball.owner,e.comboView.kickStyle(e.sim.kicks)); // [combos] chip / knuckleball render arcs; a puppet: the owner's height
 e.lastBallH=ballHeight;
 // Goal replays: keep the last ~4 s of what is drawn (only on the field I am on), and arm a replay on a goal.
 if(!teaching&&e.humans.has(OWN)){const rr=e.replay??=createGoalReplay(e.sim.ids.length);rr.record(e.sim,matchDt,ballHeight,e.ballPhysics.shotOffset);rr.watch(e.sim,active&&replaysEnabled(),active?dtIn:0);}
 // Ball sounds (walk-ball parity, Nov 4 2026): only for a running, on-screen pitch that is near, joined or being watched, never in a
 // lesson; quieter with camera distance. Touches are consumed every frame regardless, so nothing plays late.
 const hearAt=sphere.radius+35,hear=active&&!teaching&&!isPaused(v.id)&&matchDt>0&&visible&&(viewingFormat===v.id||e.humans.size>0||camDistance<hearAt);
 e.ballSound.update(e.sim,e.ballPhysics.landing,hear?ballSoundPlay:null,viewingFormat===v.id||e.humans.size>0?1:Math.max(.35,Math.min(1,1.3-camDistance/hearAt)));
 // Dribbling trick (Trick button, owner Nov 4 2026): a new trick plays its authored move on the human's rig (combos view,
 // skillMoves.ts poses + ball path) and the ball's soft touch sound. Checked only on pitches with humans; no allocation.
 if(e.humans.size)for(const hs of e.humans.values()){const h=e.sim.humans.get(hs.slot);if(h&&h.trickSerial!==(hs.trickSeen??0)){hs.trickSeen=h.trickSerial;bodyFxOf(e).trick(e,hs.slot,h,reduced);/* the move by stick direction + the beaten defender's stumble (lib/town/liveBodyFx.ts) */if(hear){ballSoundPlay?.('receive',.55);ballSoundPlay?.('kick',.18);}/* the touch + a soft whoosh */if(!reduced)e.effects.impact(e.ball.position.x,e.ball.position.y,e.ball.position.z);/* pooled sparkle at the feet */}
   // Power shot (owner Nov 4 2026): a louder strike layered on the touch-ring kick + the pooled sparkle; a slip away from an
   // AI tackle: a quick side-step wobble (the authored croqueta, short) and a soft touch. Serial-driven, no allocation.
   if(h&&h.shotSerial!==(hs.shotSeen??0)){hs.shotSeen=h.shotSerial;if(h.shotPw>=POWER_SHOT.full){if(hear){ballSoundPlay?.('kick',1);ballSoundPlay?.('bounce',.5);}if(!reduced)e.effects.impact(e.ball.position.x,e.ball.position.y,e.ball.position.z);}}
   if(h&&h.slipSerial!==(hs.slipSeen??0)){hs.slipSeen=h.slipSerial;if(!reduced)e.comboView.trick(hs.slot,'croqueta',h.moveX>=0?1:-1,.42);if(hear)ballSoundPlay?.('receive',.35);}
   if(h)bodyFxOf(e).step(e,hs.slot,h,reduced,hear,ballSoundPlay,dt);/* keeper dive + save, shield, shoulder, the cut */}
 e.root.visible=visible;e.effects.update(e.sim,active&&!isPaused(v.id)?dt:0,visible&&!teaching,reduced,visible&&!teaching&&active&&(viewingFormat===v.id||camDistance<sphere.radius+35));if(rp)e.effects.quiet();/* a goal replay: no live GOAL! card over it */if(!visible)continue; // [spot it] watching = on screen + near (lib/learning/spotIt.ts)
 // A replay frame goes into the sim for the draw below only (restored at the end of this field's draw).
 const replaying=!!rp&&rp.apply(e.sim);if(replaying)ballHeight=rp!.ballH;
 let teachingPose:ReturnType<typeof teachingMotion>|undefined;
 let emphasized=emptyIds,callouts=emptyIds;
 let poses=e.liveFrame.poses,ball:{x:number;y:number}=e.sim.ball,tokens=e.liveFrame.tokens;
 if(teaching){if(active&&teaching.playing){teaching.progress+=dt/lessonStepSeconds(teaching.lesson.steps[teaching.step]);teaching.progress=Math.min(1,teaching.progress);if(teaching.progress>=1&&!teaching.voicePending){recordQuestStep(teaching.format,teaching.lesson.id,teaching.step);if(teaching.step<teaching.lesson.steps.length-1){teaching.progress=0;teaching.step++;teaching.voicePending=true;teaching.onStep(teaching.step);}else{teaching.progress=1;teaching.playing=false;teaching.onPlaying?.(false);}}}
 const visualStep=outcomeStep!==undefined&&outcomeStep!==null?outcomeStep:teaching.step,visualProgress=outcomeStep!==undefined&&outcomeStep!==null?teaching.outcomeProgress??0:teaching.progress;
 if(visualSession){visualSession.step=visualStep;visualSession.progress=visualProgress;}
 teachingPose=teachingMotion(teaching.lesson,v as Venue,visualStep,visualProgress);
 const sampled=lessonPositions(teaching.lesson,visualStep,visualProgress);poses=sampled.positions;ball=sampled.ball;tokens=[...teaching.lesson.offense.map(p=>({...p,home:true})),...teaching.lesson.defense.map(p=>({...p,home:false}))];
 const step=lessonVisualFrame(teaching.lesson,visualStep,visualProgress).step,ids=teaching.quiz&&!quizAnswerRevealed(teaching)?[]:[...new Set([...(teaching.quiz?teaching.lesson.questions[teaching.question]?.feedback?.highlight?.flatMap(h=>h.ids)??[]:step.highlight?.flatMap(h=>h.ids)??step.focusIds??[]),...(!teaching.quiz?step.overlays?.filter(o=>o.kind==='spotlight').flatMap(o=>o.ids??[])??[]:[])])];
 emphasized=new Set(ids);callouts=new Set((teaching.quiz?(quizAnswerRevealed(teaching)?teaching.lesson.questions[teaching.question]?.feedback?.overlays:undefined):step.overlays)?.filter(o=>o.kind==='callout').map(o=>o.anchor??'')??[]);
 // Teaching highlights are drawn once by lessonCues, including quiz feedback.


 }
 const windup=!teaching?e.sim.kickWindup:null;
 const approachId=!teaching&&!e.sim.ball.owner?(e.sim.ball.intBy??e.sim.ball.target):null,approachPlayer=approachId?e.sim.players[approachId]:undefined;
 const approachPlan=approachPlayer&&!approachPlayer.isGK?e.sim.receptionPlan(approachId!):undefined;
 const approachDistance=approachPlayer?Math.hypot(e.sim.ball.x-approachPlayer.x,e.sim.ball.y-approachPlayer.y):Infinity;
 const highApproach=e.sim.ball.height>=.65,approachT=approachPlan&&e.sim.ball.height<2.2?Math.max(0,Math.min(1,(e.sim.receptionRadius*2.5-approachDistance)/(e.sim.receptionRadius*1.5))):0,approachWeight=approachT*approachT*(3-2*approachT);
 const used=teaching?new Set(tokens.map(t=>t.id)):e.liveFrame.used;for(const [id,rig] of e.rigs)rig.root.visible=used.has(id);for(const sprite of e.label.values())sprite.visible=false;
 for(const token of tokens){let rig=e.rigs.get(token.id);if(!rig){rig=createPlayer(token.id,token.home?'home':'away',false);const shirtNumber=classicShirtNumber(v.id,token.id);rig.setShirtNumber(shirtNumber);const dress=e.slotDress.get(token.id)??fieldTokenDress(v.id,token,shirtNumber,!!e.sim.players[token.id]?.isGK,liveMatchKits(v.id,!!v.sand,joinableFormat(v.id)));if(e.slotDress.has(token.id))dressJoinedRig(rig,dress);else rig.setBeanLook(dress.look,dress.outfit);e.rigs.set(token.id,rig);stats.rigs++;}rig.root.visible=true;const position=poses.get(token.id)!,px=liveWorldX(v,position.x,position.y),pz=liveWorldZ(v,position.x,position.y);const live=e.sim.players[token.id];assignRigProfile(rig,v.id,token.id,teaching?'mid':live?.role??'mid');const hitId=e.liveFrame.rows.get(token.id)?.hitId??'field:'+v.id+':'+token.id,stunned=!teaching?reactions?.get(hitId):undefined;const reception=e.sim.recv.id===token.id&&e.sim.recv.t>0?e.sim.recv:null;
 const motion:PlayerMotion=teachingPose?.motions.get(token.id)??(teaching?{}:e.liveFrame.rows.get(token.id)!.motion);
 rig.setDribbleFeel?.(!teaching);// live play only: the sole stop / drag-back / touch rhythm (lib/town/dribbleStop.ts); lessons keep their authored lane
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
   // A joined human: his plain run keeps ~80 % of the posture so the Sprint button reads (full lean, knee lift and arm
   // drive), eased by the sim's own sprint ease (no stick coupling, so no flicker).
   {const hu=e.humans.size?e.sim.humans.get(token.id):undefined;if(hu){const s=hu.sprintE*hu.sprintE*(3-2*hu.sprintE);motion.runIntensity=Math.min(1,motion.runIntensity*(.8+.2*s)+.2*s*T.MathUtils.smoothstep(pace,.5,1));}}
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
   // Kick effects (Nov 5 2026): a human's tackle lunge starts with a plant (the rig's dip-and-drive impulse: the wind-up lean), then
   // the sprint at the carrier; the win plays choreo's slide / block / poke and the loser's stumble. Humans only, no allocation.
   if(e.humans.size){const hu=e.sim.humans.get(token.id),lg=!!hu&&hu.lunge>0;if(lg&&!ud.lungeWas)motion.plant=1;ud.lungeWas=lg;
     // Body moves (Nov 5 2026, liveBodyFx): humans lean into turns and the sprint; a sharp cut on the ball dips and drives (the plant).
     motion.leanBoost=hu?1:undefined;if(hu&&bodyFxOf(e).plant(token.id))motion.plant=1;}else motion.leanBoost=undefined;
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
   // Body motion (lib/town/match/matchMotion.ts, Nov 4 2026): a speed-capped turn with a short angular acceleration (a strike or a
   // first touch turns quickly), and the receiver's control: after the first touch a slow receiver steps onto the ball (sole control).
   const speedMS=Math.hypot(live.vx*v.width/250,live.vy*v.length/380)*liveGameSpeed(v.id),acting=motion.kick!==undefined||windup?.id===token.id||!!reception||(motion.receive??0)>0;
   motion.turnRateMax=maxTurnRate(speedMS,e.humans.size&&e.sim.humans.has(token.id)&&!acting?HUMAN_FEEL.turnMul:1,acting);// a human turns snappier (kids, Nov 4 2026)motion.turnAccel=acting?MOTION.turnAccelAction:MOTION.turnAccel;
   const control=ud.control??(ud.control=createControlState());
   motion.soleControl=stepControl(control,active&&!isPaused(v.id)?dt:0,{approaching:approachId===token.id||e.sim.ball.target===token.id,cushion:!!reception,owner:e.sim.ball.owner===token.id,striking:motion.kick!==undefined||windup?.id===token.id,speed:speedMS,foot:reception?motion.kickSide??1:control.side});
   // Readable intent: called receiver, ready marker, reactions and the squash spring (choreo.ts).
   e.choreo.apply(token.id,motion,pace);
   e.comboView.apply(token.id,motion,rig.root.rotation.y);e.comboView.settle(motion); // [combos] skill moves (skillMoves.ts / lane B moves) timed to the sim's touch
   motion.keeper=live.isGK?1:0;motion.keeperReach=live.isGK?(e.sim.ball.owner===token.id?((e.puppet?e.puppet.hands:e.sim.keeperHands)?.65:0)/* 7v7 back pass: at his feet; a friend's match: the owner's hands flag */:!e.sim.ball.owner&&ballDistance<3?Math.max(0,1-ballDistance/3):0):0;
   if((e.sim.ball.target===token.id||approachId===token.id)&&!reception){if(!approachPlan)motion.facing=liveWorldYaw(v,e.sim.ball.x-live.x,e.sim.ball.y-live.y);motion.scanYaw=Math.sin(Math.PI*Math.min(1,Math.max(0,(ballDistance-3)/8)))*.35*(motion.kickSide??1);}
   if(motion.dribbling){const travelled=rig.root.userData.wasDribbling?Math.min(.5,Math.hypot(px-rig.root.position.x,pz-rig.root.position.z)):0;rig.root.userData.dribbleDistance=(rig.root.userData.dribbleDistance??0)+travelled;}else rig.root.userData.dribbleDistance=0;
   rig.root.userData.wasDribbling=motion.dribbling;
 }
 rig.root.userData.lastKick=live?.kick??0;
 const protesting=!teaching&&!stunned&&collisionPaused.has(v.id);
 if(protesting){if(collisionHit)motion.facing=Math.atan2(collisionHit.x-px,collisionHit.z-pz);motion.backpedal=motion.brake=motion.plant=0;motion.stance=undefined;motion.kick=undefined;motion.receive=undefined;motion.dribbling=false;}
 // Gate posing with the same generous shadow bounds used for drawing.
 playerView.center.set(px+1.5,(v.elevation??0)+1.5,pz-1);playerView.radius=7+Math.max(0,v.elevation??0)*2;
 const inView=!playerCulling||!!teaching||e.slotDress.has(token.id)||frustum.intersectsSphere(playerView);
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
 if(e.names?.size&&!teaching){const nm=e.names.get(token.id);if(nm){const s=label(e,'f:'+token.id,nm,token.home);s.position.set(rig.root.position.x,2.55,rig.root.position.z);s.visible=inView;}}// a friend's name tag (party nickname only)
 rig.root.userData.posed=true;rig.root.userData.poseClock=poseClock;rig.root.userData.contactSide=motion.kickSide??1;rig.root.userData.teachingMotion=teaching?motion:undefined;rig.root.userData.liveMotion=!teaching?motion:undefined;rig.root.position.y=(v.elevation??0)+.105;if(!teaching)reactions?.apply(hitId,rig.root,false);
 if(protesting)applyTruckProtest(rig.root,time,reduced);else if(!stunned)rig.root.rotation.z=0;
 // Main-character bump (lib/town/fieldCollision): render-only sidestep + lean; the sim position is untouched.
 if(!teaching&&!stunned){const nudge=rig.root.userData.fieldNudge as {x:number;z:number;lean:number}|undefined;if(nudge||rig.root.userData.fieldNudged){rig.root.position.x=px+(nudge?.x??0);rig.root.position.z=pz+(nudge?.z??0);if(nudge)rig.root.rotation.z+=nudge.lean;}rig.root.userData.fieldNudged=!!nudge;}
   // Bamboozled by a human's trick (owner Nov 4 2026): a stumbling wobble while his legs are slowed (rotation only, no allocation).
   if(!teaching&&e.sim.dazed.size){const dz=e.sim.dazed.get(token.id);if(dz!==undefined&&!reduced){const k=dz/TRICK.window;rig.root.rotation.z+=Math.sin((1-k)*Math.PI*5)*.24*k;}}
 // The live batch has no per-instance frustum culling. Retain an oversized
 // body + sunset-shadow volume; teaching always keeps every participant.
 // A joined human's rig draws like the walking avatar (own meshes in the scene, the avatar itself is hidden: net zero draw calls), so a
 // costume onesie's own material and hood show; the batch would group it under the plain body material (Nov 4 2026, zebra bug).
 if(e.slotDress.has(token.id)){if(rig.root.parent!==scene)scene.add(rig.root);rig.root.visible=inView;if(inView)stats.visiblePlayers++;else stats.culledPlayers++;}
 else if(inView){batch.draw(rig.root);stats.visiblePlayers++;}else stats.culledPlayers++;
 if(teaching){const s=label(e,token.id,token.label,token.home);s.position.set(px,2.65,pz);s.visible=teaching.quiz&&teaching.answer===null&&Boolean(question&&new RegExp('\\b'+token.label+'\\b').test(question.q));
 if(s.visible&&camera instanceof T.PerspectiveCamera){const center=s.getWorldPosition(new T.Vector3()),up=new T.Vector3(0,1,0).applyQuaternion(camera.quaternion),a=center.clone().project(camera),b=center.add(up).project(camera),unit=Math.abs(b.y-a.y)*viewportHeight/2;if(unit>.001){s.scale.set(Math.min(96,Math.max(32,token.label.length*6+14))/unit,18/unit,1);s.position.addScaledVector(up,14/unit);}}
 }}
 if(e.humans.size&&!teaching)poseBench(e,dt,time,active&&!isPaused(v.id));
 // The shot's sideways placement runs along the pitch's width axis (world x on the island pitches).
 const shotOffset=teaching?0:replaying?rp!.shotOffset:e.ballPhysics.shotOffset;
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
   // A lofted pass, cross, chip or clearance (the step's ballPathType) flies over the defenders the line says it beats, not along the grass.
   else if(teachingPose.travel>0&&teachingPose.travel<1){const peak=loftPeak(teaching.lesson.steps[visualStep]?.ballPathType,anchors.release.distanceTo(anchors.arrival));if(peak)e.ball.position.y+=peak*4*teachingPose.travel*(1-teachingPose.travel);}
 }else {const a=contact(teachingPose.source);if(a)e.ball.position.copy(a).setY(.295);
   // A turn or a shield in this step: the ball follows the move's authored path at the boot, then hands back.
   const sk=teachingPose.skill;if(sk?.ball&&sk.weight>0)e.ball.position.lerp(skillBallPoint.set(sk.ball.x,sk.ball.y,sk.ball.z),sk.weight);}
  teaching.renderedBall={x:e.ball.position.x,z:e.ball.position.z,landed:teachingPose.landed};if(visualSession)visualSession.renderedBall=teaching.renderedBall;
 }else if(e.sim.ball.owner&&e.sim.players[e.sim.ball.owner]?.isGK&&(e.puppet?e.puppet.hands:e.sim.keeperHands)){const keeper=e.rigs.get(e.sim.ball.owner);if(keeper){keeper.handPositions(keeperLeft,keeperRight);e.ball.position.copy(keeperLeft).lerp(keeperRight,.5);e.ball.position.y-=v.elevation??0;
 // [combos] a throw, roll-out or punt carries the ball on the move's authored hand path (one hand for the throw).
 if(e.comboView.holds(e.sim.ball.owner))e.comboView.ball(e.sim.ball.owner,e.ball.position,keeper.root.position,keeper.root.scale.x,.295);}}
 else if(e.sim.ball.owner){const ownerRig=e.rigs.get(e.sim.ball.owner),owner=e.sim.players[e.sim.ball.owner];if(ownerRig){
 const speed=Math.hypot(owner.vx*v.width/250,owner.vy*v.length/380)*liveGameSpeed(v.id);
 const held=groundDribbleContact(ownerRig.root.position.x,ownerRig.root.position.z,ownerRig.root.rotation.y,ownerRig.root.userData.contactSide??1,ownerRig.root.userData.dribbleDistance??0,speed,liveContact,ownerRig.root.scale.x,ownerRig.dribbleContact(receivingContact));
 if(e.humans.size&&e.sim.humans.has(e.sim.ball.owner))bodyFxOf(e).tighten(e.sim.ball.owner,held,ownerRig.root.position,Math.hypot(owner.vx,owner.vy));// momentum dribbling: tight in a cut, looser at sprint
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
 else{e.ballPhysics.roll(e.ball,ballHeight<.02,active&&!isPaused(v.id)?dt:0);if(replaying)e.ballReset.show();else e.ballReset.update(e.sim,active&&!isPaused(v.id)?dt:0,reduced);e.effects.trail(e.ball.position,camera,reduced,e.at??=(id,out)=>{const r=e.rigs.get(id);if(!r||!r.root.visible)return false;out.copy(r.root.position);return true;});if(!replaying&&e.ballPhysics.landing>0&&!reduced)e.effects.impact(e.ball.position.x,e.ball.position.y,e.ball.position.z);}
 if(replaying)rp!.restore(e.sim);
 }
 cues.update(visualSession,session?VENUES.find(v=>v.id===session.format):undefined,camera,viewportHeight);
 batch.end();
 lineGeometry.setDrawRange(0,0);line.visible=false;
 }
 // ---- Join a live game (slice 1, docs/join-live-game-design.md): humans take an outfield slot; the NPC sits out ----
 const benchPoint={x:0,y:0};
 const entryOf=(format:LiveFormat)=>entries.find(e=>e.venue.id===format);
 /** The replaced NPC: walks to the touchline, then cheers on a 7 s rhythm (and again after a goal). Drawn in the batch. */
 function poseBench(e:Entry,dt:number,time:number,running:boolean){
  const v=e.venue,goals=e.sim.score.gold+e.sim.score.blue;let i=0;
  for(const hs of e.humans.values()){const w=hs.bench,m=hs.benchMotion,rig=hs.benchRig;
   if(goals!==hs.goals){hs.goals=goals;if(w.phase==='cheer')w.age=0;}
   const step=running?dt:0;
   if(w.phase==='off'){stepBench(w,step);m.facing=liveWorldYaw(v,w.tx-w.x,w.ty-w.y);m.runIntensity=.35;}
   else{w.age+=step;m.facing=liveWorldYaw(v,135-w.x,0);m.runIntensity=0;}
   rig.update(liveWorldX(v,w.x,w.y),liveWorldZ(v,w.x,w.y),step,time,reduced,m);rig.root.position.y=(v.elevation??0)+.105;
   if(w.phase==='cheer'){const age=cheerAge(w.age);if(age>=0&&!reduced)applyBodyEmote(rig.root,BODY_EMOTE.Cheer,age,CHEER_SECONDS);}
   rig.root.visible=true;batch.draw(rig.root);i++;
  }
  return i;
 }
 /** A human joins the live match on `format` at world (x, z). Team: fewer humans, tie → the side he walked into
  *  (liveJoin.pickJoinTeam); slot: the nearest outfield NPC of that team (pickSlot). `dressFor` makes his look in the
  *  team's bib. `pick` (the join card's side + position, Nov 4 2026; multiplayer slice 2 feeds the same) chooses the
  *  team (unless full) and the role (nearest free slot in it, else nearest). Returns his slot or null (not joinable / full). */
 function joinMatch(format:LiveFormat,humanId:string,x:number,z:number,dressFor:(home:boolean,kits:ReturnType<typeof liveMatchKits>,keeper?:boolean)=>BeanDress,prefer?:'gold'|'blue'|null,pick?:JoinPick|null){
  const e=entryOf(format);if(!e||!joinableFormat(format)||e.humans.has(humanId))return e?.humans.get(humanId)?.slot??null;
  const v=e.venue,sim=e.sim,at=liveFieldPoint(v,x,z),team=chooseJoinTeam(sim.humanOn,at.y,LIVE_JOIN_FORMATS[format].maxHumansPerTeam,pick?.team,prefer);if(!team)return null;
  const avoid=new Set<string>();if(sim.ball.owner)avoid.add(sim.ball.owner);
  // A picked slot (the picker's position dropdown) when it is still free and on that side (the keeper too: human keepers,
  // MatchSim.humanKeepers); else the nearest free player in the role, else the nearest.
  const want=pick?.slot&&sim.players[pick.slot]?.team===team&&!sim.humans.has(pick.slot)&&(!sim.players[pick.slot].isGK||sim.humanKeepers)?pick.slot:null;
  const slot=want??pickSlot(Object.values(sim.players) as SlotCandidate[],team,at.x,at.y,new Set(sim.humans.keys()),avoid,pick?.role);if(!slot)return null;
  const p=sim.players[slot];
  // The NPC he replaces walks off from where he is now (no pop): a pooled bench rig in his own look takes over.
  const token=e.liveFrame.tokens.find(t=>t.id===slot)??{id:slot,home:team==='gold'};
  const kits=liveMatchKits(v.id,!!v.sand,joinableFormat(v.id)),shirt=classicShirtNumber(v.id,slot),npcDress=fieldTokenDress(v.id,token,shirt,false,kits);
  const benchRig=e.benchPool.pop()??createPlayer('bench-'+v.id+'-'+e.humans.size,team==='gold'?'home':'away',false);
  benchRig.setShirtNumber(shirt);benchRig.setBeanLook(npcDress.look,npcDress.outfit);benchRig.root.userData.npcId=slot;assignRigProfile(benchRig,v.id,slot,p.role);benchRig.root.userData.profileRole=undefined;
  touchlineSpot(p.x,p.y,e.humans.size,benchPoint,benchMargin(v.width));if(v.sand)benchPoint.y=clearOfFlags(benchPoint.y,BEACH_TOUCHLINE_FLAGS_Y);/* beach: clear of the touchline flags */// the same ~1.4 m off the line on every pitch (the rooftop futsal court is 18.5 m wide)
  const bench:BenchWalker={id:slot,phase:'off',x:p.x,y:p.y,tx:benchPoint.x,ty:benchPoint.y,age:0};
  benchRig.update(liveWorldX(v,p.x,p.y),liveWorldZ(v,p.x,p.y),0,0,reduced,{});
  const dress=dressFor(team==='gold',kits,p.isGK);// in goal: the keeper kit + gloves (matchPlayerDress keeper)
  e.humans.set(humanId,{humanId,slot,team,dress,bench,benchRig,benchMotion:{},goals:sim.score.gold+sim.score.blue});
  e.slotDress.set(slot,dress);{const r=e.rigs.get(slot);if(r)dressJoinedRig(r,dress);}
  sim.lockHuman(slot);if(!pick?.role&&!want)sim.placePlayer(slot,Math.max(10,Math.min(260,at.x)),Math.max(10,Math.min(390,at.y)));// a picked position starts where that player stands (you take his place in the shape); otherwise where you walked on
  e.dormant=false;e.synced=false;
  return slot;
 }
 /** The human leaves: the NPC comes back on from his touchline spot (the AI walks him into position) and the slot rig
  *  gets the NPC's look back. Returns the world point where the human was (his avatar appears there). */
 function leaveMatch(format:LiveFormat,humanId:string,out:{x:number;z:number},inPlace=false){
  const e=entryOf(format),hs=e?.humans.get(humanId);if(!e||!hs)return null;
  const v=e.venue,sim=e.sim,p=sim.players[hs.slot];
  if(humanId===OWN)e.replay?.cancel();
  out.x=liveWorldX(v,p.x,p.y);out.z=liveWorldZ(v,p.x,p.y);
  // Me leaving: the ball stays on the grass where I left it and the NPC comes back on from his touchline spot. A FRIEND leaving
  // (inPlace, Nov 5 2026 bot fill): the bot takes the slot where it stands, ball and all (handBack: no teleport, no dropped ball).
  handBack(sim,hs.slot,inPlace?null:hs.bench);
  e.slotDress.delete(hs.slot);e.humans.delete(humanId);
  const token=e.liveFrame.tokens.find(t=>t.id===hs.slot)??{id:hs.slot,home:hs.team==='gold'};
  const shirt=classicShirtNumber(v.id,hs.slot),npc=fieldTokenDress(v.id,token,shirt,false,liveMatchKits(v.id,!!v.sand,joinableFormat(v.id)));
  const rig=e.rigs.get(hs.slot);if(rig){if(hs.base)rig.root.scale.set(hs.base.x,hs.base.y,hs.base.z);rig.root.removeFromParent();undressJoinedRig(rig);rig.setBeanLook(npc.look,npc.outfit);if(!inPlace)rig.root.position.set(liveWorldX(v,hs.bench.x,hs.bench.y),rig.root.position.y,liveWorldZ(v,hs.bench.x,hs.bench.y));}
  hs.benchRig.root.visible=false;e.benchPool.push(hs.benchRig);e.synced=false;
  return out;
 }
 /** Uniform-change pop (Town's characterArrival scale, ~0.12 → 1) on the joined human's slot rig. Absolute (base × s),
  *  so it never compounds; the base is captured once per join (no per-frame allocation) and restored on leave. */
 /** The joined human's slot rig root (Town re-parents the worn backpack to it while joined); null when not there yet. */
 function humanRoot(format:LiveFormat,humanId:string){const e=entryOf(format),hs=e?.humans.get(humanId);return hs?e!.rigs.get(hs.slot)?.root??null:null;}
 function humanPop(format:LiveFormat,humanId:string,s:number){
  const e=entryOf(format),hs=e?.humans.get(humanId),rig=hs?e!.rigs.get(hs.slot):undefined;if(!hs||!rig)return;
  if(!hs.base){if(s>=1)return;hs.base={x:rig.root.scale.x,y:rig.root.scale.y,z:rig.root.scale.z};}
  rig.root.scale.set(hs.base.x*s,hs.base.y*s,hs.base.z*s);
 }
 /** One frame of controls for a joined human (world stick → sim space here, so callers stay in world terms). */
 const frameIn:HumanFrame={mx:0,my:0};
 function humanInput(format:LiveFormat,humanId:string,wx:number,wz:number,buttons:Omit<HumanFrame,'mx'|'my'>){
  const e=entryOf(format),hs=e?.humans.get(humanId);if(!e||!hs)return;
  const v=e.venue,c=Math.cos(v.yaw??0),s=Math.sin(v.yaw??0),sx=(wx*c-wz*s)*250/v.width,sy=(wx*s+wz*c)*380/v.length,l=Math.hypot(sx,sy),m=Math.min(1,Math.hypot(wx,wz));
  frameIn.mx=l>1e-6?sx/l*m:0;frameIn.my=l>1e-6?sy/l*m:0;
  frameIn.pass=buttons.pass;frameIn.passPower=buttons.passPower;frameIn.shoot=buttons.shoot;frameIn.shootPower=buttons.shootPower;frameIn.through=buttons.through;frameIn.tackle=buttons.tackle;frameIn.jockey=buttons.jockey;frameIn.sprint=buttons.sprint;frameIn.call=buttons.call;frameIn.save=buttons.save;frameIn.long=buttons.long;frameIn.trick=buttons.trick;frameIn.press=buttons.press;frameIn.aimX=buttons.aimX;frameIn.aimH=buttons.aimH;
  e.sim.humanInput(hs.slot,frameIn);
  if(e.puppet&&humanId===OWN)accumulateIn(netIn,frameIn);// a friend's match: my controls go to the owner (lib/multiplayer/matchLink.ts)
 }
 /** Fill `out` with what Town needs about a joined human; false when he is not in that match. */
 function humanView(format:LiveFormat,humanId:string,out:HumanView){
  const e=entryOf(format),hs=e?.humans.get(humanId);if(!e||!hs)return false;
  const v=e.venue,sim=e.sim,p=sim.players[hs.slot],rig=e.rigs.get(hs.slot);
  out.x=rig?.root.visible?rig.root.position.x:liveWorldX(v,p.x,p.y);out.z=rig?.root.visible?rig.root.position.z:liveWorldZ(v,p.x,p.y);out.yaw=rig?.root.rotation.y??0;
  out.team=hs.team;const owner=sim.ball.owner;out.onBall=owner===hs.slot;
  out.possession=out.onBall?'mine':owner?(sim.players[owner].team===hs.team?'team':'opp'):'loose';
  const pass=sim.humanTarget(hs.slot,'short'),fwd=sim.humanTarget(hs.slot,'forward');
  if(pass){const t=sim.players[pass];out.passX=liveWorldX(v,t.x,t.y);out.passZ=liveWorldZ(v,t.x,t.y);}else out.passX=out.passZ=NaN;
  if(fwd){const t=sim.players[fwd];out.forwardX=liveWorldX(v,t.x,t.y);out.forwardZ=liveWorldZ(v,t.x,t.y);}else out.forwardX=out.forwardZ=NaN;
  const gy=hs.team==='gold'?8:392;out.goalX=liveWorldX(v,135,gy);out.goalZ=liveWorldZ(v,135,gy);
  out.inShotRange=Math.abs(p.y-gy)<120;
  out.restart=e.puppet?e.puppet.restart:sim.isRestart;out.keeper=p.isGK;out.hands=out.onBall&&p.isGK&&(e.puppet?e.puppet.hands:sim.keeperHands);
  out.callOpen=sim.lastCall&&sim.lastCall.id===hs.slot&&sim.stats.time-sim.lastCall.time<1.5?sim.lastCall.open:null;
  const h=sim.humans.get(hs.slot);out.trickCd=h?h.trickCd/TRICK.cooldown:0;out.trickOn=!!h&&h.trick>0;out.pressCd=h?h.pressCd/PRESS.cooldown:0;out.pressOn=!!h&&h.pressT>0;out.trickSerial=h?h.trickSerial:0;out.trickKind=h?h.trickKind:'stepover';out.shotSerial=h?h.shotSerial:0;out.shotPw=h?h.shotPw:0;out.shotAimed=!!h&&h.shotAimed;out.slipSerial=h?h.slipSerial:0;
  if(owner&&owner!==hs.slot){const o=sim.players[owner];out.carrierD=Math.hypot(o.x-p.x,o.y-p.y);out.carrierX=liveWorldX(v,o.x,o.y);out.carrierZ=liveWorldZ(v,o.x,o.y);}else out.carrierD=out.carrierX=out.carrierZ=NaN;
  out.callAX=out.callBX=NaN;out.callAW=out.callBW=0;
  if(sim.teamCallers.size){let k=0;for(const id of sim.teamCallers){const q=sim.players[id];if(!q||q.team!==hs.team)continue;const w=sim.callWeight(id),r=e.rigs.get(id),x=r?.root.visible?r.root.position.x:liveWorldX(v,q.x,q.y),z=r?.root.visible?r.root.position.z:liveWorldZ(v,q.x,q.y);
   if(k===0){out.callAX=x;out.callAZ=z;out.callAW=w;}else{out.callBX=x;out.callBZ=z;out.callBW=w;}if(++k>1)break;}}
  out.simX=p.x;out.keeperX=NaN;for(let i=0;i<sim.ids.length;i++){const q=sim.players[sim.ids[i]];if(q.isGK&&q.team!==hs.team){out.keeperX=q.x;break;}}
  fillMoveView(out,sim,v,hs.slot,hs.team,bodyFxOf(e).seen(hs.slot));// keeper + body moves (lib/town/liveBodyFx.ts)
  return true;
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
 // ---- Multiplayer slice 2 (docs/join-live-game-design.md; lib/multiplayer/matchLink.ts drives these) ----
 const netIn=createInAccum(),netOut={x:0,z:0};
 /** A party friend takes `slot` on `team` (the relay's roster): the same path as a local join, dressed in their own look + the bib. */
 function addFriend(format:LiveFormat,humanId:string,team:'gold'|'blue',slot:string,name:string,dressFor:Parameters<typeof joinMatch>[4]){
  const e=entryOf(format);if(!e)return null;const got=joinMatch(format,humanId,e.venue.x,e.venue.z,dressFor,team,{team,slot});
  if(got){(e.names??=new Map()).set(got,name);}return got;
 }
 function dropFriend(format:LiveFormat,humanId:string){const e=entryOf(format),hs=e?.humans.get(humanId);if(!e||!hs)return;e.names?.delete(hs.slot);leaveMatch(format,humanId,netOut,true);}
 /** On: a friend runs this match (stop the AI, draw their snapshots). Off: this phone runs it again from the last snapshot. */
 function setPuppet(format:LiveFormat,on:boolean){const e=entryOf(format);if(!e||!!e.puppet===on)return;
  if(on){e.puppet=createSnapBuffer();e.puppetFresh=true;e.puppetTouch=createPuppetTouches();e.sim.enterPuppet();}else{e.puppet=null;e.puppetTouch=undefined;e.sim.leavePuppet();}e.synced=false;}
 return {entries,stats,update,joinMatch,leaveMatch,humanPop,humanRoot,humanInput,humanView,addFriend,dropFriend,setPuppet,
  isPuppet:(format:LiveFormat)=>!!entryOf(format)?.puppet,
  /** Kick effects (lib/town/kickFx.ts): the field's event serials (kick / tackle / receive) for the camera and HUD. */
  fx:(format:LiveFormat)=>entryOf(format)?.effects.kick.view??null,
  /** A live-match one-shot through the match sound hook (liveJoinRuntime: the slow-motion cue). */
  sound:(kind:LiveBallSoundKind,gain=1)=>ballSoundPlay?.(kind,gain),
  /** Town: a goal billows the goal net (lib/graphics/propReactions.ts hit), world point + velocity. */
  setNetHit(f:((x:number,y:number,z:number,vx:number,vz:number,reduced:boolean)=>void)|null){for(const e of entries)e.effects.kick.netHit=f;},
  /** Goal replays (lib/town/goalReplay.ts): the field's replay state (null before I first join it), and Skip. */
  replay:(format:LiveFormat)=>entryOf(format)?.replay??null,
  skipReplay:(format:LiveFormat)=>!!entryOf(format)?.replay?.skip(),
  /** Awake (not dormant: on screen or near the player). matchLink watches a friends' match only while its field is (Nov 5 2026). */
  awake:(format:LiveFormat)=>{const e=entryOf(format);return !!e&&!e.dormant;},
  /** A friend is on this field with me (or runs it): no solo slow motion (it would slow everyone's match). */
  shared:(format:LiveFormat)=>{const e=entryOf(format);return !!e&&(!!e.puppet||e.humans.size>1);},
  simOf:(format:LiveFormat)=>entryOf(format)?.sim??null,
  slotOf:(format:LiveFormat,humanId:string)=>entryOf(format)?.humans.get(humanId)?.slot??null,
  pushSnap(format:LiveFormat,data:readonly number[],from:number,tMs:number){const e=entryOf(format);return !!e?.puppet&&e.puppet.push(data,from,tMs);},
  resetSnaps(format:LiveFormat){entryOf(format)?.puppet?.clear();},
  encodeSnap(format:LiveFormat,field:number,seq:number,out:number[]){const e=entryOf(format);return e?encodeSnap(e.sim,field,seq,e.lastBallH??0,out):null;},
  /** A friend's controls (sim space, decoded by matchLink) into the owner's sim. */
  friendInput(format:LiveFormat,humanId:string,frame:HumanFrame){const e=entryOf(format),hs=e?.humans.get(humanId);if(e&&hs)e.sim.humanInput(hs.slot,frame);},
  /** My controls folded since the last send (a friend's match only). */
  netInput:()=>netIn,joinedFormat(humanId:string){for(const e of entries)if(e.humans.has(humanId))return e.venue.id;return null;},setPlayerCulling(value:boolean){playerCulling=value;},setBallSound(play:LiveBallSoundPlay|null){ballSoundPlay=play;},pickPlayer,setHoverPaused(format:LiveFormat|null){hoverPaused.clear();if(format)hoverPaused.add(format);},isPaused,setPaused(format:LiveFormat,value:boolean){if(value)paused.add(format);else paused.delete(format);},getView(format:LiveFormat):LiveMatchView|null{const e=entries.find(e=>e.venue.id===format);return e?{events:[...e.effects.events],players:Object.values(e.sim.players).map(p=>({id:p.id,x:p.x,y:p.y,home:p.team==='gold'})),ball:{x:e.sim.ball.x,y:e.sim.ball.y},score:{...e.sim.score},period:e.sim.isBeach?e.sim.period:undefined}:null;},pickQuiz:cues.pick,dispose(){cues.dispose();batch.dispose();for(const e of entries){e.effects.dispose();e.rigs.forEach(r=>r.dispose());e.benchPool.forEach(r=>r.dispose());e.humans.forEach(h=>h.benchRig.dispose());for(const s of e.label.values()){s.material.map?.dispose();s.material.dispose();}e.root.removeFromParent();}line.removeFromParent();[ballMap,ballGeo,ballMat,lineGeometry,lineMaterial].forEach(r=>r.dispose());}};
}
