/** Futbol Tennis 3D runtime (scene dressing, per-frame sync, camera beats, HUD read). Owned by the Futbol Tennis builder, together with
 * lib/arcade/looks/tennis.ts. Split out of lib/arcade/arcadeGames.ts on Nov 10 2026 by constant-folding `kind`; behaviour unchanged.
 * The returned object must keep the shape components/games/ArcadeGame3D.tsx reads (state.{tennis,pinball,runner}, action, reset,
 * hud, fit, update, charge*, pinballCamera/pinballCinema, dispose): that is why idle states of the other two games are still built. */
import * as T from 'three';
import type {TennisWorld} from '../tennisWorld';
import {createArcadeStage} from '../arcadeStage';
import {tennisLook} from '../looks/tennis';
import type {ArcadePoseOptions} from '../arcadePlayerMotion';
import {sideGameDress} from '../../town/beanLooks';
import {TENNIS_COURTS,createTennis,tennisNeedsFrames,beginTennis,resetTennis,tickTennis,setTennisTarget,setTennisMovement,canTennisKick,canTennisPerfect,canTennisSlam,canTennisHeader,canTennisScissor,tennisSweetPoint,tennisCourt,canTennisTrap,requestTennisKick,tennisTouchCall,tennisHudButton,tennisCallDetail,tennisAimX,tennisTargetShot,type TennisShot} from '@/lib/games/soccerTennis';
import {createTennisFeel} from '../tennisFeel';
import {comicMaterial,comicTree} from '../comic/shading';
import {tennisAtlas,tennisAtlasUv,TENNIS_ATLAS} from '../tennisArena';
import {createTennisCamera} from '../tennisCamera';
import {createTennisPowerFx} from '../tennisPowerFx';
import {createTennisCinema} from '../tennisCinema';
import {createTennisBounceSpot} from '../tennisBounceSpot';
import {createTennisFirstTouch} from '../tennisFirstTouch';
import {tennisMatchPoint,tennisWindArrow} from '../tennisFeel';
import {startTennisCharge,releaseTennisCharge,cancelTennisCharge,TENNIS_TOUR_RULES,tennisPointsToWin} from '@/lib/games/soccerTennis';
/** A point that would win a set (best-of-3 courts) or the match: the members get to their feet and the serve gets a push-in. */
export function tennisBigPoint(s:Parameters<typeof tennisMatchPoint>[0]&{tour?:number;level:number}):boolean{if(tennisMatchPoint(s))return true;const c=tennisCourt(s as never);if(!c||!c.sets||c.style==='drill')return false;const win=tennisPointsToWin(s.level);return s.score.you>=win-1||s.score.rival>=win-1;}
import {createPinballState} from '@/lib/games/soccerPinball';
import {createPinballCinema} from '@/lib/games/soccerPinballCinema';
import {createRunnerGame,freshRunnerSeed} from '../runnerGame';
import type {ArcadeInput,ArcadeHUD} from '../arcadeGameTypes';
export function createTennisGame(canvas:HTMLCanvasElement,onSound:(goal:boolean,cue?:string)=>void,audioContext:()=>AudioContext|null=()=>null){
 // Nov 10 2026: every browser session plays fresh courses (tests keep the deterministic default seeds): tennis starts from a random
 // seed, Breakaway runs ask freshRunnerSeed, and the tennis/pinball cabinets build an idle runner that never uses a run id.
 
 const stage=createArcadeStage(canvas,tennisLook),tennis=createTennis(freshRunnerSeed()),pinball=createPinballState(),runner=createRunnerGame({idle:true});
 const ball=stage.footballMerged(((.3)));ball.traverse(o=>{o.castShadow=false;});/* one merged draw (was 9). Its shadow is a crisp decal projected along the sun (below), not a shadow-map caster: sharper than a 1024 map can make a 30 cm ball */let elapsed=0,event=0;
 const cameraHome=new T.Vector3(),cameraRotation=new T.Quaternion(),shotLook=new T.Vector3(),shotCamera=new T.Vector3(),shotRotation=new T.Quaternion();let windNoted=0,cinema=0,cinemaKick=0,pointSound=0,cameraFocus=0,chargeTone=0,notedLevel=1;
 function cameraBeat(dt:number){const camera=stage.camera;cinema=Math.max(0,cinema-dt);let focus=0;focus=tennisBeat?.state.close??0;/* round 3: lib/arcade/tennisCinema.ts owns the tennis beats (reduced motion → 0) */if(!stage.reduced){}
  if((tennisCam)){tennisCam.update(dt,tennis,tennisGuide?.visible?camSweet:null);cameraRotation.copy(camera.quaternion);}else{camera.position.copy(cameraHome);camera.quaternion.copy(cameraRotation);}
  
  // Tennis push-in: a small dolly toward the action (≤10%, no FOV punch), then the 3/4 close-up below.
  if((tennisBeat)&&tennisBeat.state.push>0){const b=tennis.ball;shotLook.set((tennis.you.x+b.x)/2,.6,(tennis.you.y+b.y)/2);camera.position.lerp(shotLook,tennisBeat.state.push);}
  if(focus>0){const x=(tennis.you.x),z=(tennis.you.y);shotLook.set(x,.9,z);shotCamera.set(x+7,7,z+10);
   // Tennis strike beat: a closer 3/4 shot behind your shoulder; the look target whips from you to the ball as it leaves.
   if((tennisBeat)){const f=tennisBeat.state.follow,b=tennis.ball;shotCamera.set(x+4.2,4.6,z+6.6);shotLook.set(x+(b.x-x)*f,.9+(b.z-.9)*f*.6,z+(b.y-z)*f);}camera.position.lerp(shotCamera,focus*.78);camera.lookAt(shotLook);shotRotation.copy(camera.quaternion);camera.quaternion.copy(cameraRotation).slerp(shotRotation,focus);}
  camera.updateMatrixWorld();
 }
 const players=[stage.player('#efbd58',sideGameDress('arcade-0','home')),...[1,2,3].map(i=>stage.player('#b492d0',sideGameDress('arcade-'+i,'away')))];
 players.forEach(p=>p.root.visible=false);
 // Club Marea, printed (Nov 10 2026): the world (sky panel, sea, sand, court sheet, net, club, wind props, puffs) is built by the look's environment.
 const world=stage.scenery.userData.tennisWorld as TennisWorld,worldLights=()=>{let sun:T.DirectionalLight|undefined,hemi:T.HemisphereLight|undefined;for(const o of stage.scene.children){if((o as T.DirectionalLight).isDirectionalLight)sun=o as T.DirectionalLight;else if((o as T.HemisphereLight).isHemisphereLight)hemi=o as T.HemisphereLight;}return{sun:sun!,hemi:hemi!,renderer:stage.renderer,scene:stage.scene};},lights=worldLights();
 const atlas=tennisAtlas(stage.scene),decal=(size:number,cell:number,color:string,opacity:number,order=2)=>{const g=tennisAtlasUv(new T.PlaneGeometry(size,size),cell);g.rotateX(-Math.PI/2);const m=new T.Mesh(g,new T.MeshBasicMaterial({map:atlas,color,transparent:true,opacity,depthWrite:false}));m.renderOrder=order;stage.scene.add(m);return m;};
 // The ball's shadow: a crisp disc cast along the sun, so it slides away from the ball as it rises and meets it on the bounce (the timing read),
 // plus a faint contact dot at the ground point straight under the ball (where the drop-line lands).
 const shadow=decal(.78,TENNIS_ATLAS.shadow,'#2a1c44',.5,3),groundDot=decal(.42,TENNIS_ATLAS.dot,'#2a1c44',.3);shadow.name='tennis-ball-shadow';groundDot.name='tennis-ball-ground';
 // Comic house style: the stage's players and ball take the world's print bands, sun rim and ink edge (one uniform set for the game).
 for(const p of players)comicTree(p.root,world.comic());ball.traverse(o=>{const k=(o as T.Mesh).material as T.Material|undefined;if(k&&!Array.isArray(k))comicMaterial(k,world.comic(true,1.2));});
 // Court marks (aim, landing, contact, countdown, lane marks): broad paper rings with an ink keyline from the decal sheet, so they read on clay, sand, lawn, timber and tiles.
 const chalk=(x:number,z:number,r:number,color:string)=>{const m=decal(2*r/.766,TENNIS_ATLAS.ring,color,1);m.position.set(x,.03,z);return m;};
 let tennisGuide:T.Mesh|null=null,tennisContact:T.Mesh|null=null,tennisAim:T.Mesh|null=null,tennisCountdown:T.Mesh|null=null,tennisReadAt=0,tennisLandTime=0;const tennisAimMarks:T.Mesh[]=[];
 let tennisTrail:T.InstancedMesh<T.SphereGeometry,T.MeshBasicMaterial>|undefined;const tennisTrailPoints=new Float32Array(42),tennisTrailM=new T.Matrix4(),tennisTrailP=new T.Vector3(),tennisTrailS=new T.Vector3(),tennisTrailQ=new T.Quaternion();let tennisTrailHead=0,tennisTrailCount=0,tennisTrailClock=0,tennisPoseRest=0;const tennisPose:ArcadePoseOptions[]=[{vx:0,vz:0,anticipate:0,celebrate:0},{vx:0,vz:0,anticipate:0,celebrate:0}];const tennisVolley:Array<NonNullable<ArcadePoseOptions['move']>>=[{kind:'volley',progress:0,side:1,height:0},{kind:'volley',progress:0,side:1,height:0}];let tennisTrailColor='';let tennisImpact:T.Mesh|undefined;let tennisFeel:ReturnType<typeof createTennisFeel>|undefined,tennisStep=0;let tennisCam:ReturnType<typeof createTennisCamera>|undefined,tennisPowerFx:ReturnType<typeof createTennisPowerFx>|undefined,tennisFxLive=false;const camSweet={x:0,y:0};
 let tennisSpot:ReturnType<typeof createTennisBounceSpot>|undefined,tennisTouchRing:ReturnType<typeof createTennisFirstTouch>|undefined,tennisBeat:ReturnType<typeof createTennisCinema>|undefined,beatPoint=0,beatMilestone=0,beatMatch=-1;
  const pinballGlow:T.Mesh<T.BufferGeometry,T.MeshBasicMaterial>[]=[],flipperLights:T.Mesh<T.BufferGeometry,T.MeshBasicMaterial>[]=[],flipperPivots:T.Mesh[]=[];
 const flipperPrevious=[0,0],flipperSnap=[0,0];
 const pinballCine=createPinballCinema(stage.reduced);
 const pinballTargets:T.Mesh[]=[],pinballBumpers:T.Mesh[]=[],pinballLamps:T.Mesh[]=[],pinballCharge:T.Mesh[]=[];let pinballTrailCount=0,pinballTrailHead=0,pinballWasPlaying=false;const pinballRolling=new T.Group(),pinballDive={progress:0,dir:1 as -1|1,height:0,kind:'side' as const,outcome:'parry' as const},pinballStandingSave={progress:0,dir:1 as -1|1,height:0,kind:'stand' as const,outcome:'parry' as const};let pinballImpact=0,pinballImpactEvents=0,pinballImpactClock=0;let pinballNetDirty=false,pinballRoll=0,pinballSave=0,pinballSaveEvent=0;
 const px=(x:number)=>(x-180)/30,pz=(y:number)=>(y-310)/30;
 {
  // The court sheet, lines, posts, net and tape are the world's (lib/arcade/tennisWorld.ts): nothing here draws a floor.
  applyRunVenue(true);
  // Sparse chalk placement marks give the player an explicit opposite-court target.
  for(const x of[-3.7,0,3.7]){const mark=chalk(x,-5.2,.5,'#fff3d6');mark.position.y=.02;(mark.material as T.MeshBasicMaterial).opacity=.7;tennisAimMarks.push(mark);}
  tennisAim=chalk(0,-5.2,.7,'#ffc83a');tennisAim.name='tennis-shot-target';
  tennisCountdown=chalk(0,0,.64,'#19b5a5');tennisCountdown.name='tennis-bounce-countdown';tennisCountdown.visible=false;tennisImpact=chalk(0,0,.5,'#fff3d6');tennisImpact.name='tennis-aerial-impact';tennisImpact.visible=false;
  players[0].root.visible=players[1].root.visible=true;players[0].root.scale.setScalar(1.25);players[1].root.scale.setScalar(1.25);players[0].root.name='tennis-player-you';players[1].root.name='tennis-player-rival';
  tennisGuide=chalk(0,0,.68,'#fff3d6');tennisGuide.name='tennis-landing';tennisContact=chalk(0,0,.9,'#fff3d6');tennisContact.name='tennis-contact';tennisGuide.visible=tennisContact.visible=false;
  // A small fixed trail pool makes shot speed readable without runtime geometry.
  // One instanced draw (was 14 sphere meshes, up to 13 draws in flight) with its own material, so recolouring the
  // trail per shot never touches the stage's shared '#ffe084' material.
  // Comic: a paper speed streak behind the ball (plain alpha, no glow; same one draw).
  tennisTrail=new T.InstancedMesh(new T.SphereGeometry(1,5,3),new T.MeshBasicMaterial({color:'#fff3d6',transparent:true,opacity:.62,depthWrite:false}),14);tennisTrail.name='tennis-trail';tennisTrail.count=0;tennisTrail.frustumCulled=false;tennisTrail.castShadow=false;stage.scene.add(tennisTrail);
   tennisFeel=createTennisFeel(stage,tennis,cue=>onSound(false,cue)); // grades, telegraph, banners, hit-stop, tennis audio cues
   tennisCam=createTennisCamera(stage.camera,stage.mobile,stage.reduced);tennisPowerFx=createTennisPowerFx(stage); // dynamic camera; power meter, rival wind-up, bounce marks
   tennisBeat=createTennisCinema(stage.reduced); // round 3: slow-mo strike beats + push-ins (capped, skippable)
   tennisSpot=createTennisBounceSpot(stage);tennisTouchRing=createTennisFirstTouch(stage);/* Nov 10 2026: first-touch target ring (two-touch courts) */ // round 3: the exact bounce spot of the incoming ball (shrinking countdown decal)
 }
 
 
 
 
 
 
 
 let runnerBlastAge=0,runnerBlastPower=0;
 
 
 // Role colours belong to the visible bean outfit, not the hidden classic jersey.
 // Cache dresses once; pooled defenders only update appearance when their role changes.
 
 
 
 
 // Construct reusable runner visuals once; no geometry creation during play.
 
 // Breakaway feel layer (runnerFx) and synthesized soundtrack (runnerAudio): pooled, runner-only.
 
 
 function fit(){stage.fit((((stage.mobile?11.05:11.4))),((stage.mobile)?17.1:17.6),false,true,false);if((tennisCam)){tennisCam.fit(canvas.clientWidth,canvas.clientHeight);tennisCam.update(0,tennis,null,true);}cameraHome.copy(stage.camera.position);cameraRotation.copy(stage.camera.quaternion);cinema=0;world.frame(stage.camera);}
 /** Endless play (Nov 10 2026): the panel on screen. A court run shows its court's own stop, so the world moves on with every match
  * won (the level walks the nine stops). A tour starts on its own panel, then walks the stops too and is back on its own panel every
  * ninth match. The swap is the world's existing one: every stop's meshes are already built and only shown or hidden, the palette is
  * uniforms, and the one court sheet is repainted into the same canvas texture. Nothing is created, so nothing is left to dispose. */
 function applyRunVenue(force=false){return tennis.tour&&tennis.matchesWon%9!==0?world.applyVenue(tennis.venueStop,0,lights,force):world.applyVenue(tennis.level,tennis.tour,lights,force);}
 /** The seam, on the frame the next opponent walks on: swap the panel and time it (QA: `tennisSeam()`). */
 let venueMatch=1;const seamStat={count:0,last:0,max:0};
 function seamVenue(){venueMatch=tennis.match;const t0=performance.now(),v=applyRunVenue();world.frame(stage.camera);seamStat.count++;seamStat.last=performance.now()-t0;seamStat.max=Math.max(seamStat.max,seamStat.last);windNoted=0;onSound(false,`tennis:venue:${v.surf}:${v.bounce}:${Math.abs(v.breeze)}`);}
 function reset(){resetTennis(tennis);beginTennis(tennis);{const v=applyRunVenue();venueMatch=tennis.match;world.reset(tennis);windNoted=0;onSound(false,`tennis:venue:${v.surf}:${v.bounce}:${Math.abs(v.breeze)}`);}tennisPowerFx?.reset();tennisCam?.update(0,tennis,null,true);tennisReadAt=0;tennisTrailCount=0;tennisTrailClock=0;tennisPoseRest=0;ball.rotation.set(0,0,0);tennisFeel?.reset();tennisBeat?.reset();tennisSpot?.reset();tennisTouchRing?.reset();beatPoint=tennis.pointsPlayed;beatMilestone=tennis.milestoneEvents;beatMatch=-1;elapsed=event=0;cinema=cinemaKick=pointSound=chargeTone=cameraFocus=0;notedLevel=1;cameraBeat(0);world.frame(stage.camera);stage.resetPlayers();}
 function action(id:number){tennisBeat?.skip();requestTennisKick(tennis,undefined,(['auto','lob','drop','header','scissor','trap'] as TennisShot[])[id]??'auto');}
 function target(x:number,y:number){const p=stage.pick(x,y);if(p&&true){if(p.z<0)tennis.shotAim=T.MathUtils.clamp(p.x/3.7,-1,1);else setTennisTarget(tennis,p.x,p.z);}}
 function update(dt:number,input:ArcadeInput){elapsed+=dt;
  {
   setTennisMovement(tennis,input.x,input.y);const beat=tennisBeat?.update(dt,!!tennis.chargeShot,tennis.phase==='serve'&&tennis.server==='you',tennis.phase==='rally'&&tennis.ball.last==='rival'&&tennis.ball.crossed);
   tennisStep=(tennisFeel?tennisFeel.scale(dt):dt)*(beat?beat.scale:1);tickTennis(tennis,tennisStep);if(tennis.match!==venueMatch)seamVenue();
   if(beat&&beat.flash>0)tennisFeel?.flare(beat.flash);
   if(tennis.kickCount!==cinemaKick){cinemaKick=tennis.kickCount;
    // Your big strikes get the slow-mo beat (sweet power, golden, aerials, slams, clean volleys); a sliding save a push-in.
    if(tennisBeat&&tennis.lastKicker==='you'){const pg=tennis.powerGrade,sh=tennis.lastShot,strength=tennis.goldenShot||pg==='sweet'?1:sh==='bicycle'||sh==='scissor'?.9:sh==='slam'||sh==='shark'?.8:pg==='power'?.6:tennis.touchVolley?.45:0;
     if(strength>0)tennisBeat.strike(strength);else if(sh==='dive')tennisBeat.push(.6);}}
   if(tennisBeat){
    if(tennis.pointsPlayed!==beatPoint){beatPoint=tennis.pointsPlayed;if(tennis.pointWinner==='you'&&tennis.rally===1&&tennis.lastKicker==='you')tennisBeat.push(1);} // an ace
    if(tennis.milestoneEvents!==beatMilestone){beatMilestone=tennis.milestoneEvents;tennisBeat.push(.5+Math.min(.5,tennis.rallyMilestone/30));}
    if(tennis.phase==='serve'&&beatMatch!==tennis.pointsPlayed&&tennisBigPoint(tennis)){beatMatch=tennis.pointsPlayed;tennisBeat.push(tennisMatchPoint(tennis)?.8:.6);}} // match point, or set point on the best-of-3 courts
   const points=tennis.pointsPlayed;if(points!==pointSound){pointSound=points;if(!tennisFeel)onSound(tennis.pointWinner==='you',tennis.pointWinner==='you'?'goal':'miss');}
  }
  if(tennis.wind!==windNoted){windNoted=tennis.wind;onSound(false,'tennis:wind:'+Math.abs(tennis.wind).toFixed(2));}
  const level=((tennis.level));if(level>notedLevel)onSound(true,'level');notedLevel=level;
  const tone=(0);if(tone>chargeTone)onSound(false,'charge'+tone);chargeTone=tone;
  sync((tennisStep));cameraBeat(dt);world.frame(stage.camera);stage.effects(dt);stage.lighting(elapsed);
 }
 function sync(dt:number){
  {
   const b=tennis.ball;
   for(let i=0;i<2;i++){
    const p=i?tennis.rival:tennis.you,rig=players[i],speed=Math.hypot(p.vx,p.vy),remaining=p.kick/p.kickSpan;
    // Contact starts at full extension; load comes from the visible incoming ball,
    // then a smooth recovery keeps the strike facing stable as the ball leaves.
    const follow=remaining*remaining*(3-2*remaining),receiving=tennis.phase==='rally'&&b.last===(i?'you':'rival');
    const distance=Math.hypot(b.x-p.x,b.y-p.y),anticipate=receiving?Math.max(0,1-distance/3.4)*Math.max(.15,1-Math.max(0,b.z-1.4)*.3):0;
    const looking=Math.atan2(b.x-p.x,b.y-p.y),travel=Math.atan2(p.vx,p.vy),home=i?0:Math.PI;
    const returnAngle=Math.atan2((i?(tennis.rivalPlan?tennis.rivalPlanX:0):tennis.shotAim*3.7)-p.x,(i?5.2:-5.2)-p.y),open=Math.max(i&&tennis.rivalPlan?.6:0,1-distance/2)*.8; // committed rival opens its hips toward its target
    const receiveFacing=looking+Math.atan2(Math.sin(returnAngle-looking),Math.cos(returnAngle-looking))*open;
    const facing=p.kick>0?p.kickFacing:receiving?receiveFacing:speed>.5?travel:home;
    const pose=tennisPose[i];pose.vx=p.vx;pose.vz=p.vy;pose.anticipate=!i&&tennis.queuedKick>0&&p.kick<=0?Math.max(anticipate,.9):anticipate;
    // Hold-to-power wind-up: the held shot loads the body (deeper crouch as it charges); the rival loads for its telegraphed power shot.
    if(!i&&tennis.chargeShot&&p.kick<=0)pose.anticipate=Math.max(pose.anticipate,.45+.55*Math.min(1,tennis.charge));else if(i&&tennis.rivalPower>0&&tennis.rivalPlan&&b.last==='you'&&p.kick<=0)pose.anticipate=Math.max(pose.anticipate,.7);/* a pressed kick plants you at once: the press is seen before the held contact */pose.celebrate=tennis.phase==='point'&&tennis.pointWinner===(i?'rival':'you')?Math.max(0,1-tennis.phaseTime/.7):0;
    const scale=Math.max(.1,rig.root.scale.x);
    // Rig-local native reach: preserve lateral contact without overstretching
    // the planted leg for the arcade's generous edge-of-reach returns.
    pose.strikeX=T.MathUtils.clamp(p.kickContactX/scale,-.45,.45);pose.strikeZ=T.MathUtils.clamp(p.kickContactZ/scale,-.2,.9);
    pose.shotPower=p.kickPower;pose.actionKind=p.kickKind;
    const volley=tennisVolley[i];volley.kind=p.kickStyle===4?'scissor':'volley';volley.progress=(p.kickStyle===4?.33:.42)+(1-remaining)*(p.kickStyle===4?.67:.58);volley.side=p.kickContactX<0?-1:1;volley.height=T.MathUtils.clamp((p.kickHeight-.45)/1.25,0,1);
    pose.move=(p.kickStyle===2||p.kickStyle===4)&&p.kick>0?volley:undefined;
    pose.reaction=p.kickStyle===3&&p.kick>0?'header':p.kickStyle===5&&p.kick>0?'chest':undefined;pose.reactionProgress=p.kickStyle===5?1-remaining:.46+(1-remaining)*.54;
    pose.jumpProgress=p.kickStyle===3&&p.kick>0?.47+(1-remaining)*.53:undefined;pose.jumpHeight=p.kickStyle===3?Math.min(.42,Math.max(.1,p.kickHeight-1.8)):0;
    rig.root.position.x=p.x;rig.root.position.z=p.y;
    // The native volley plants its support foot; a second generic jump overlay
    // would bend those solved joints again and break the authored contact.
    rig.pose(dt,speed,facing,p.kickStyle>=3?0:follow*(p.kickStyle===0?.55:1),tennisFeel?tennisFeel.pose(i,pose,p.kick>0):0,p.vx*.08,pose);
   }
   tennisPoseRest=Math.hypot(tennis.you.vx,tennis.you.vy,tennis.rival.vx,tennis.rival.vy)>.025||tennis.you.kick>0||tennis.rival.kick>0?.2:Math.max(0,tennisPoseRest-dt);
   const powered=tennis.lastKicker==='you'?tennis.powerGrade:tennis.rivalPowerGrade;
   const actionColor=tennis.goldenShot?'#ffc83a':powered==='over'?'#f0452e':powered==='sweet'?'#ffc83a':powered==='power'?'#ff8a3c':tennis.lastShot==='drop'&&powered?'#7fd0f0':tennis.perfectFlash>0?'#ffe98a':tennis.lastShot==='scissor'?'#f0452e':tennis.lastShot==='header'?'#7fd0f0':'#fff3d6';
   if(actionColor!==tennisTrailColor&&tennisTrail){tennisTrailColor=actionColor;tennisTrail.material.color.set(actionColor);}
   if(tennisImpact){/* Nov 8 2026: the same pooled ring also ripples out from your feet for .35 s on a Perfect touch (no new mesh; +1 draw only while shown) */const perfRing=tennis.perfectFlash>.35&&tennis.fxSlam<=0;tennisImpact.visible=!stage.reduced&&(tennis.fxSlam>0||perfRing);if(perfRing){tennisImpact.position.set(tennis.you.x,.05,tennis.you.y);tennisImpact.scale.setScalar(1+(1-(tennis.perfectFlash-.35)/.35)*2.2);}else{tennisImpact.position.set(tennis.fxSlamX,.05,tennis.fxSlamY);tennisImpact.scale.setScalar(1+(1-tennis.fxSlam/.65)*2);}(tennisImpact.material as T.MeshBasicMaterial).color.set(actionColor);}
   ball.position.set(b.x,Math.max(.3,b.z+.13),b.y);ball.rotation.x=b.rot;ball.rotation.z+=b.wz*dt*.12;
   const squash=b.z<.5?Math.min(.22,b.squash*1.4):0;ball.scale.set(1+squash,1-squash,1+squash);
   if(tennis.kickCount!==event){event=tennis.kickCount;tennisTrailCount=0;tennisTrailClock=0;stage.burst(ball.position.x,ball.position.y,ball.position.z,tennis.lastShot==='slam'?1.5:tennis.lastShot==='drop'?.65:1);if(!tennisFeel)onSound(false,tennis.perfectFlash>0?'perfect':tennis.lastShot);}
   if(tennis.phase==='rally'&&dt>0){tennisTrailClock+=dt;if(tennisTrailClock>=1/30){tennisTrailClock%=1/30;const n=tennisTrailHead*3;tennisTrailPoints[n]=b.x;tennisTrailPoints[n+1]=b.z+.13;tennisTrailPoints[n+2]=b.y;tennisTrailHead=(tennisTrailHead+1)%14;tennisTrailCount=Math.min(14,tennisTrailCount+1);}}else if(tennis.phase!=='rally')tennisTrailCount=0;
   if(tennisTrail){const show=!stage.reduced&&Math.hypot(b.vx,b.vy,b.vz)>2?Math.max(0,tennisTrailCount-1):0,big=(tennis.lastShot==='scissor'?2:tennis.lastShot==='header'?1.35:tennis.lastShot==='slam'?1.6:1)*(tennis.goldenShot||tennis.lastKicker==='you'&&tennis.powerGrade==='sweet'?1.35:1);
    for(let i=0;i<show;i++){const index=((tennisTrailHead-2-i+28)%14)*3;tennisTrailP.fromArray(tennisTrailPoints,index);tennisTrailS.setScalar(.1*(1-i/14)*big);tennisTrail.setMatrixAt(i,tennisTrailM.compose(tennisTrailP,tennisTrailQ,tennisTrailS));}
    if(show||tennisTrail.count){tennisTrail.count=show;tennisTrail.instanceMatrix.needsUpdate=true;}}
   if(tennisGuide&&tennisContact){
    tennisGuide.visible=tennis.phase==='rally'&&b.last==='rival';
    if(tennisGuide.visible&&tennis.clock>=tennisReadAt){const land=tennisSweetPoint(tennis);tennisReadAt=tennis.clock+.1;tennisLandTime=land.time;tennisGuide.position.set(land.x,.035,land.y);camSweet.x=land.x;camSweet.y=land.y;}
    (tennisGuide.material as T.MeshBasicMaterial).color.set(b.bounces>0?'#ffc83a':'#fff3d6');
    tennisGuide.visible=tennisGuide.visible&&tennisGuide.position.z>0&&tennisGuide.position.z<8&&Math.abs(tennisGuide.position.x)<5;
    const aerial=canTennisScissor(tennis,'you'),heading=canTennisHeader(tennis,'you'),high=canTennisSlam(tennis,'you'),ready=high||canTennisKick(tennis,'you');tennisContact.visible=tennis.phase==='rally'&&b.last==='rival';tennisContact.position.set(tennis.you.x,.045,tennis.you.y);
    const perfect=canTennisPerfect(tennis);tennisContact.scale.setScalar(perfect?1.12:ready?1:.78);(tennisContact.material as T.MeshBasicMaterial).color.set(perfect?'#ffc83a':aerial?'#f0452e':heading?'#7fd0f0':high?'#ff8a3c':ready?'#fff3d6':'#d9c7a8');
    if(tennisCountdown){tennisCountdown.visible=tennisGuide.visible;tennisCountdown.position.copy(tennisGuide.position);tennisCountdown.position.y=.045;tennisCountdown.scale.setScalar(.25+Math.min(1,Math.max(0,tennisLandTime-(tennis.clock-tennisReadAt+.1)))*1.1);}
    // Drill: the yellow aim ring sits at the gold ring's depth and lands where the lit touch would send it, so the
    // task reads as "put yellow on gold". Matches the shot whose depth reaches the ring.
    const drill=tennisCourt(tennis).style==='drill';
    if(tennisAim){tennisAim.visible=tennis.phase==='serve'||tennis.phase==='rally'&&b.last==='rival';tennisAim.position.x=drill?tennisAimX(tennis.shotAim,tennisTargetShot(tennis)):tennis.shotAim*3.7;tennisAim.position.z=drill?tennis.targetY:-5.2;tennisAim.scale.setScalar((ready?1.2:1)*(tennis.queuedKick>0&&!stage.reduced?1.12:1));}
    // Lane marks: hidden on the drill (the gold ring is the target) and under the pink open-space ring (same spot): no extra draws.
    const spaceMark=tennisFeel?.spaceSide()??0;for(let m=0;m<3;m++)tennisAimMarks[m].visible=tennis.phase!=='over'&&!drill&&!(spaceMark&&m===(spaceMark<0?0:2));
   }
   tennisFeel?.sync(dt,tennis.ball.z);tennisFxLive=!!tennisPowerFx?.sync(dt,tennis);if(tennisSpot?.sync(dt,tennis))tennisFxLive=true;if(tennisTouchRing?.sync(dt,tennis))tennisFxLive=true;if(world.sync(dt,tennis,stage.camera,tennisBigPoint(tennis)))tennisFxLive=true;
  }
  {const h=Math.max(0,ball.position.y-.3),sun=world.sun(),k=Math.min(1.9,Math.hypot(sun.x,sun.z)/Math.max(.15,sun.y)),a=Math.atan2(-sun.x,-sun.z),evening=world.venue().lanterns>0;
   shadow.visible=groundDot.visible=ball.visible;shadow.position.set(ball.position.x+Math.sin(a)*k*h,.034,ball.position.z+Math.cos(a)*k*h);shadow.rotation.y=a;shadow.scale.set(1+h*.05,1,(1+h*.05)*(1+k*.45));(shadow.material as T.MeshBasicMaterial).opacity=(evening?.5:.62)/(1+h*.07);
   groundDot.position.set(ball.position.x,.032,ball.position.z);(groundDot.material as T.MeshBasicMaterial).opacity=.34/(1+h*1.2);}
 }
 function hud():ArcadeHUD{{const call=tennisTouchCall(tennis);return{nextLabel:tennis.tour?'Play again':'Retry court',/* endless play: a run ends only on the last ball lost, so the next run starts on the court it ended on */score:tennis.tour?String(tennis.tourScore):`${tennis.score.you} : ${tennis.score.rival}`,headerReady:canTennisHeader(tennis,'you'),scissorReady:canTennisScissor(tennis,'you'),tennisAerial:tennisCourt(tennis).aerial,tennisTrap:tennisCourt(tennis).touches>1,trapReady:canTennisTrap(tennis),bicycleReady:tennis.goldReady,tennisCall:call,tennisButton:tennisHudButton(tennis,call),detail:tennis.phase==='over'?(tennis.winner==='you'?'Full time · you won!':'Full time'):/* round 3: the full-time card shows the stars, stats and coach line (tennisOverDetail stays for tests/tools) */tennis.chargeShot?(tennis.charge>1?'OVERHIT · let go!':tennis.charge>=.8?'GOLD · let go now!':'WINDING UP · let go on gold'):tennisCallDetail(tennis,call),message:tennis.message,over:tennis.phase==='over',ready:tennis.phase==='serve'&&tennis.server==='you',
  tennisRally:tennis.phase==='rally'||tennis.phase==='point'?tennis.rally:0,tennisWind:tennisWindArrow(tennis.wind),tennisSets:tennisCourt(tennis).sets?`Sets ${tennis.sets.you} : ${tennis.sets.rival}`:'',
  tennisMult:tennis.phase==='rally'||tennis.phase==='point'?tennis.touchMult:0,...(tennis.tour?{tennisTourLives:tennis.tourLives,tennisTourMax:TENNIS_TOUR_RULES[tennis.tour-1].lives,tennisCombo:tennis.comboStep,tennisGain:tennis.tourGain,tennisGainId:tennis.tourEvents,tennisTourLevel:tennis.tourHeat+1}:{})};}}
 let awake=false;/* when the loop is about to sleep the surf bed is hushed (lib/arcade/tennisAudio.ts `tennis:hush`): no sound outlives the frames */
 sync(0);fit();stage.render();return{needsFrames:()=>{const live=cinema>0||stage.effectsActive()||(((tennisNeedsFrames(tennis)||tennis.phase==='serve'&&tennisPoseRest>0||!!tennisFeel?.active()||tennisFxLive||!!tennisCam?.moving()||!!tennis.chargeShot||!!tennisBeat?.active())));if(awake&&!live)onSound(false,'tennis:hush');awake=live;return live;},stage,update,reset,action,target,hud,fit,pinballCamera:()=>undefined,pinballCinema:pinballCine,state:{tennis,pinball,runner},
  /** Futbol Tennis hold-to-power: 0 Kick, 1 Lob, 2 Drop. Start winds up, release strikes, cancel drops it. */
  chargeStart(id:number){tennisBeat?.skip();return (startTennisCharge(tennis,(['auto','lob','drop'] as const)[id]??'auto'));},
  chargeRelease(){return (releaseTennisCharge(tennis));},
  chargeCancel(){cancelTennisCharge(tennis);},
  /** Debug/QA read of the dynamic tennis camera (zoom, serve blend, focus). */
  tennisCamera(){return tennisCam?.state()??null;},
  /** Debug/QA read of the endless venue seam: swaps done and the last / longest swap in ms. */
  tennisSeam(){return seamStat;},
  /** Debug/QA read of the tennis cinematic beat (scale, close-up, follow, push, flash). */
  tennisBeat(){return tennisBeat?.state??null;},
  /** Tear down: game-specific module state first (runnerTrack's renderer hold), then the stage. */
  dispose(){tennisTrail?.dispose();tennisSpot?.dispose();tennisTouchRing?.dispose();stage.dispose();}};
}
