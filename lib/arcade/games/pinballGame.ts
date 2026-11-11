/** Futbol Pinball 3D runtime (scene dressing, per-frame sync, camera beats, HUD read). Owned by the Futbol Pinball builder, together with
 * lib/arcade/looks/pinball.ts. Split out of lib/arcade/arcadeGames.ts on Nov 10 2026 by constant-folding `kind`; behaviour unchanged.
 * The returned object must keep the shape components/games/ArcadeGame3D.tsx reads (state.{tennis,pinball,runner}, action, reset,
 * hud, fit, update, charge*, pinballCamera/pinballCinema, dispose): that is why idle states of the other two games are still built. */
import * as T from 'three';
import {createPinballCabinet,PINBALL_INSERTS,lampStep} from '@/lib/games/soccerPinballCabinet';
import {comicMaterial,aimComicSun} from '../comic/shading';
import {createArcadeStage} from '../arcadeStage';
import {pinballLook,PINBALL_BULBS as BULB,PINBALL_INK as INK} from '../looks/pinball';
import {sideGameDress} from '../../town/beanLooks';
import {createTennis} from '@/lib/games/soccerTennis';
import {createPinballState,stepPinball,launchPinball,skipPinballBeat,nudgePinball,tapPinballFlipper,pinballDivision,pinballDefenders,pinballFlippers,pinballReadyFoot,plungerPull,pinballMinute} from '@/lib/games/soccerPinball';
import {createPinballFeel,resetPinballFeel,stepPinballFeel,pinballTimeScale,pinballFeelActive,pinballFeelMessage} from '@/lib/games/soccerPinballFeel';
import {createPinballFx} from '@/lib/games/soccerPinballFx';
import {pinballRollSound} from '@/lib/games/soccerPinballAudio';
import {pinballCrewPose} from '@/lib/games/soccerPinballCrew';
import {createPinballTableView} from '@/lib/games/soccerPinballTableView';
import {createPinballCamera} from '@/lib/games/soccerPinballCamera';
import {mergePinballStatic} from '@/lib/games/soccerPinballMerge';
import {pinballStarTotal} from '@/lib/games/soccerPinballTable';
import {createPinballPatternWatch,resetPinballPatternWatch,watchPinballPatterns,pinballPatternShown} from '@/lib/games/soccerPinballPatterns';
import {createPinballCinema,resetPinballCinema,stepPinballCinema,watchPinballCinema,cinemaTimeScale,cinemaActive,skipCinema} from '@/lib/games/soccerPinballCinema';
import {createPinballHype} from '@/lib/games/soccerPinballHype';
import {SWEEPER_Y} from '@/lib/games/soccerPinballMissions';
import {pinballStreakBadge,pinballTierMult,pinballTierOf,pinballEndReason} from '@/lib/games/soccerPinballTiers';
import {pinballLevelLabel} from '@/lib/games/soccerPinballEndless';
import {createRunnerGame,freshRunnerSeed} from '../runnerGame';
import type {ArcadeInput,ArcadeHUD} from '../arcadeGameTypes';
export function createPinballGame(canvas:HTMLCanvasElement,onSound:(goal:boolean,cue?:string)=>void,audioContext:()=>AudioContext|null=()=>null){
 // Nov 10 2026: every browser session plays fresh courses (tests keep the deterministic default seeds): tennis starts from a random
 // seed, Breakaway runs ask freshRunnerSeed, and the tennis/pinball cabinets build an idle runner that never uses a run id.
 
 const stage=createArcadeStage(canvas,pinballLook),tennis=createTennis(freshRunnerSeed()),pinball=createPinballState(),runner=createRunnerGame({idle:true});
 const px=(x:number)=>(x-180)/30,pz=(y:number)=>(y-310)/30;
 // The beach board (playfield print, kerbs, coast, print lamps, the comic football) and the game's one comic uniform set: lib/games/soccerPinballCabinet.ts.
 const cabinet=createPinballCabinet(stage.scene,stage.scenery,px,pz,stage.mobile,stage.renderer),ball=cabinet.ball,ink=cabinet.ink,sunDir=new T.Vector3(...pinballLook.sun.position).normalize();let elapsed=0,event=0;
 const cameraHome=new T.Vector3(),cameraRotation=new T.Quaternion(),shotLook=new T.Vector3(),shotCamera=new T.Vector3(),shotRotation=new T.Quaternion();let cinema=0,cinemaKick=0,pointSound=0,cameraFocus=0,chargeTone=0,notedLevel=1;
 function cameraBeat(dt:number){if(pinballCam){pinballCam.update(dt,pinball,pinballCine);return;}const camera=stage.camera;cinema=Math.max(0,cinema-dt);let focus=0;/* round 3: lib/arcade/tennisCinema.ts owns the tennis beats (reduced motion → 0) */if(!stage.reduced){}
  camera.position.copy(cameraHome);camera.quaternion.copy(cameraRotation);
  
  // Tennis push-in: a small dolly toward the action (≤10%, no FOV punch), then the 3/4 close-up below.
  
  if(focus>0){const x=(runner.x),z=(0);shotLook.set(x,.9,z);shotCamera.set(x+7,7,z+10);
   // Tennis strike beat: a closer 3/4 shot behind your shoulder; the look target whips from you to the ball as it leaves.
   camera.position.lerp(shotCamera,focus*.78);camera.lookAt(shotLook);shotRotation.copy(camera.quaternion);camera.quaternion.copy(cameraRotation).slerp(shotRotation,focus);}
  camera.updateMatrixWorld();
 }
 const players=[stage.player('#efbd58',sideGameDress('arcade-0','home')),...[1,2,3].map(i=>stage.player('#b492d0',sideGameDress('arcade-'+i,'away')))];
 players.forEach(p=>p.root.visible=false);
 
 const flippers:T.Group[]=[];
 let tennisReadAt=0,tennisLandTime=0;
 const tennisTrailPoints=new Float32Array(42),tennisTrailM=new T.Matrix4(),tennisTrailP=new T.Vector3(),tennisTrailS=new T.Vector3(),tennisTrailQ=new T.Quaternion();let tennisTrailHead=0,tennisTrailCount=0,tennisTrailClock=0,tennisPoseRest=0;
 let beatPoint=0,beatMilestone=0,beatMatch=-1;
 // Print lamps over the inserts and the page tone: the stage's lights never change (the comic bands are cut from them); a drain,
 // a goal and full time tint the two bands instead (the light band falls to dusk violet, a goal prints it hot).
 const insertN=PINBALL_INSERTS.length,insertX=new Float32Array(insertN),insertZ=new Float32Array(insertN),floorEnergy=new Float32Array(insertN);let floorWave=0,floorHitX=0,floorHitZ=0,giHeat=1,giTarget=1;
 const toneLight=ink.uInkLight.value.clone(),toneShade=ink.uInkShade.value.clone(),toneDusk=new T.Color().setRGB(.7,.6,.88),toneDeep=new T.Color().setRGB(.4,.33,.62),toneHot=new T.Color().setRGB(1.14,1.1,.98),toneTier=new T.Color();
 const pinballGlow:T.Mesh<T.BufferGeometry,T.MeshBasicMaterial>[]=[],flipperLights:T.Mesh<T.BufferGeometry,T.MeshBasicMaterial>[]=[],flipperPivots:T.Mesh[]=[];
 const flipperPrevious=[0,0],flipperSnap=[0,0];
 const pinballFeel=createPinballFeel(),pinballCine=createPinballCinema(stage.reduced),pinballPatterns=createPinballPatternWatch();let pinballHype:ReturnType<typeof createPinballHype>|undefined,pinballHypeLive=false,pinballSweeper:ReturnType<typeof stage.player>|undefined;const pinballSweeperPose={vx:0,vz:0,anticipate:0,stun:0,celebrate:0,keeper:1,dive:undefined,actionKind:'pass' as 'pass'|'shot',shotPower:.2,strikeZ:.65,receive:0,receiveProgress:0};let pinballFx:ReturnType<typeof createPinballFx>|undefined,pinballTable:ReturnType<typeof createPinballTableView>|undefined,pinballCam:ReturnType<typeof createPinballCamera>|undefined;
const toyMats=new Map<T.Material,T.Material>(),mountDummy=new T.Object3D(),toyHsl={h:0,s:0,l:0};
 // Pass 3: the keeper and defenders are MACHINE figures. One instanced low-poly proxy (a peg body and a head, 44 triangles each, colour
 // writes off) casts all their shadows; each figure stands rigid on its mount and is moved by a motor: no run cycle, the facing turns
 // in eighth steps, and every start, stop and reversal rocks it on its base peg (a damped spring, ~4 Hz) before it settles.
 const toyShadows=new T.InstancedMesh((()=>{const body=new T.CylinderGeometry(.17,.25,.72,6).translate(0,.5,0).toNonIndexed(),head=new T.SphereGeometry(.27,6,4).translate(0,1.06,0).toNonIndexed(),g=new T.BufferGeometry(),n=body.attributes.position.count+head.attributes.position.count,pos=new Float32Array(n*3);pos.set(body.attributes.position.array,0);pos.set(head.attributes.position.array,body.attributes.position.count*3);g.setAttribute('position',new T.BufferAttribute(pos,3));body.dispose();head.dispose();return g;})(),new T.MeshBasicMaterial({colorWrite:false,depthWrite:false}),5);
 toyShadows.name='pinball-figure-shadows';toyShadows.castShadow=true;toyShadows.frustumCulled=false;toyShadows.count=0;stage.scene.add(toyShadows);
 const toyRock=new Float32Array(10),toyRockV=new Float32Array(10),toyAt=new Float32Array(10),toySpeed=new Float32Array(10);
 /** Rock figure `i` (0 keeper, 1-3 defenders, 4 sweeper) on its base peg from its motor's changes of speed. `lean` adds a held tilt (the keeper's lunge). */
 function toyMotor(i:number,root:T.Object3D,x:number,z:number,dt:number,lean=0,nod=0){const j=i*2,still=stage.reduced||pinball.phase==='ready'||pinball.phase==='over';
  if(still||dt<=0){if(still){toyRock[j]=toyRock[j+1]=toyRockV[j]=toyRockV[j+1]=toySpeed[j]=toySpeed[j+1]=0;}toyAt[j]=x;toyAt[j+1]=z;}
  else for(let a=0;a<2;a++){const p=a?z:x,v=Math.max(-9,Math.min(9,(p-toyAt[j+a])/dt)),dv=v-toySpeed[j+a];toySpeed[j+a]=v;toyAt[j+a]=p;toyRockV[j+a]-=dv*.34;
   for(let n=0,h=dt/2;n<2;n++){toyRockV[j+a]+=(-676*toyRock[j+a]-8.4*toyRockV[j+a])*h;toyRock[j+a]+=toyRockV[j+a]*h;}
   if(Math.abs(toyRock[j+a])>.2){toyRock[j+a]=Math.sign(toyRock[j+a])*.2;toyRockV[j+a]*=.5;}}
  root.rotation.z=(stage.reduced?0:toyRock[j])+lean;root.rotation.x=stage.reduced?0:-toyRock[j+1]+nod;}
 const toyFacing=(a:number)=>Math.round(a/(Math.PI/4))*(Math.PI/4);let toyify:(root:T.Object3D)=>void=()=>{},mountN=0;const mountAt=(x:number,z:number)=>{mountDummy.position.set(x,0,z);mountDummy.updateMatrix();toyShadows.setMatrixAt(mountN,mountDummy.matrix);cabinet.mounts.setMatrixAt(mountN++,mountDummy.matrix);};
 // Pass 2 light shows: a bounded chase across the insert lamps on launch, goal, drain, a mode / multiball start and a nudge.
 const SHOW_LIFE=[0,0,1.1,1.5,1.2,2.2,.22,1.4];let ballYaw=0,floorMoving=false,showKind=0,showT=0,showPhase:string=pinball.phase,showMode=0,showCue='';const startShow=(k:number)=>{if(stage.reduced&&k!==3&&k!==4&&k!==7)return;showKind=k;showT=stage.reduced&&k===7?.8:SHOW_LIFE[k];};
 // Pass 3: ONE formula for the running light show, sampled by every lamp on the machine: the under-playfield inserts here, the state
 // lamps (soccerPinballTableView.ts) and the 26 rail bulbs (soccerPinballHype.ts), so they all join the same chase.
 // 2 launch: a chase out of the plunger lane. 3 goal: every lamp, then rows running at the net. 4 drain: the lamps go out from the goal
 // down to the flippers. 5 mode / multiball: a two-arm spiral. 6 nudge: every lamp prints once. 7 game over: two full flashes, then
 // the lamps clear row by row from the flippers up to the goal, a bright edge leading. Every level is cut into printed steps by the lamp shader.
 let showSk=0,showAge=0;
 function showAt(x:number,z:number):number{const age=showAge;switch(showSk){
  case 2:{const d=(6.2-x)*.55+(9.6-z)*.45;return Math.max(0,1-Math.abs(d-age*20)/2.4);}
  case 3:return stage.reduced?.6:age<.2?1:.5+.5*Math.sin(age*16+z*1.1);
  case 4:return z>-9.6+age*17?.5:0;
  case 5:{const a=Math.atan2(z,x-.4),r=Math.hypot(x-.4,z);return Math.max(0,Math.sin(a*2-age*11+r*.7))**2*Math.min(1,showT/.4);}
  case 6:return .75;
  case 7:{if(stage.reduced)return .5;if(age<.28)return Math.sin(age*Math.PI/.07)>0?1:.1;const front=9.9-(age-.28)*18.5;return z<front?(z>front-1.7?1:.5):0;}
  default:return 0;}}
 /** The game-over sequence (the GAME OVER burst + the lamps going out) plays before the shell is told the run is over: hud().over waits for
  * it. Owner (Nov 10 2026): it must read as an ending, not a freeze: 1.4 s in all (was 2.8 s), and any flipper press after the first
  * .35 s skips straight to the results. */
 const overShow=()=>pinball.phase==='over'&&showKind===7&&showT>0;
 const pinballStars:T.Group[]=[];const pinballTargets:T.Mesh[]=[],pinballBumpers:T.Mesh[]=[],pinballLamps:T.Mesh[]=[],pinballCharge:T.Mesh[]=[];const pinballTrailPoints=new Float32Array(18);let pinballTrailCount=0,pinballTrailHead=0,pinballWasPlaying=false;let pinballPlunger:T.Mesh|undefined,pinballTrail:T.InstancedMesh|undefined;const pinballTrailMatrix=new T.Object3D();const pinballRolling=new T.Group(),pinballPatrol=new Float32Array(6),pinballDive={progress:0,dir:1 as -1|1,height:0,kind:'side' as const,outcome:'parry' as const},pinballStandingSave={progress:0,dir:1 as -1|1,height:0,kind:'stand' as const,outcome:'parry' as const},pinballPose=Array.from({length:4},()=>({vx:0,vz:0,anticipate:0,stun:0,celebrate:0,keeper:0,dive:undefined as typeof pinballDive|typeof pinballStandingSave|undefined,actionKind:'pass' as 'pass'|'shot',shotPower:.2,strikeZ:.65,receive:0,receiveProgress:0}));let pinballImpact=0,pinballImpactEvents=0,pinballImpactClock=0;let pinballNet:T.LineSegments|undefined,pinballNetBase:Float32Array|undefined,pinballNetDirty=false,pinballRoll=0,pinballSave=0,pinballSaveEvent=0;

 {
  PINBALL_INSERTS.forEach(([x,y],i)=>{insertX[i]=px(x);insertZ[i]=pz(y);});








  const walls=[[20,45,100,45],[260,45,318,45],[100,30,100,53],[260,30,260,53],[318,45,352,60],[352,60,366,108],[20,45,20,455],[366,108,366,599],[341,150,341,402],[341,455,341,594],[20,455,99,535],[338,458,261,535],[344,599,364,599]];
  // Static rails, inlane arrows and lamp bases are baked into two merged meshes (was 20 draw calls).
  const pinballRails=walls.map(([a,b,c,d])=>stage.bar(px(a),pz(b),px(c),pz(d),.18,.13,INK.rail)),pinballLampBases:T.Mesh[]=[];
  const goal=stage.goal(0,pz(45),160/30);goal.traverse(o=>{if(o instanceof T.LineSegments){pinballNet=o;(o.material as T.LineBasicMaterial).color.set(INK.paper);o.name='pinball-net';pinballNetBase=new Float32Array(o.geometry.attributes.position.array);}});
  // The goal frame's seven posts and bars are one draw (and one shadow draw), not seven.
  mergePinballStatic(goal.children.filter((o):o is T.Mesh=>(o as T.Mesh).isMesh),'pinball-goal-frame');
  // Flippers: a tapered paper bat in a tackle-red rubber ring (2 draws each, sun rim + ink edge), a read-colour stripe on top and a ring at the pivot.
  const batShape=(r0:number,r1:number,len:number)=>{const s=new T.Shape();s.moveTo(0,r0);s.lineTo(len,r1);s.absarc(len,0,r1,Math.PI/2,-Math.PI/2,true);s.lineTo(0,-r0);s.absarc(0,0,r0,-Math.PI/2,Math.PI/2,true);return s;};
  const batGeo=new T.ExtrudeGeometry(batShape(.27,.13,2.02),{depth:.25,bevelEnabled:true,bevelSize:.03,bevelThickness:.03,bevelSegments:1,curveSegments:6});batGeo.rotateX(-Math.PI/2);batGeo.translate(0,-.125,0);
  const rubberGeo=new T.ExtrudeGeometry(batShape(.34,.2,2.02),{depth:.13,bevelEnabled:false,curveSegments:6});rubberGeo.rotateX(-Math.PI/2);rubberGeo.translate(0,-.08,0);
  const batMat=comicMaterial(new T.MeshLambertMaterial({color:INK.paper}),{uniforms:ink,rim:true,inkWidth:1.3}),rubberMat=comicMaterial(new T.MeshLambertMaterial({color:INK.rubber}),{uniforms:ink,rim:true,inkWidth:1.3});
  for(const side of[0,1]){const group=new T.Group();stage.scene.add(group);const bat=new T.Mesh(batGeo,batMat);bat.castShadow=true;group.add(bat);group.add(new T.Mesh(rubberGeo,rubberMat));
   const light=stage.box(1,.166,0,1.25,.012,.1,INK.paper,group);light.castShadow=false;(light as T.Mesh).material=new T.MeshBasicMaterial({color:side?BULB.blue:BULB.amber,transparent:true,opacity:.55,toneMapped:false});flipperLights.push(light as unknown as T.Mesh<T.BufferGeometry,T.MeshBasicMaterial>);
   const pivot=stage.ring(0,0,.42,side?BULB.blue:BULB.amber);flipperPivots.push(pivot);flippers.push(group);}
  // Post pockets are visible scoring targets; a corner finish rewards placing
  // the shot beyond the keeper rather than repeatedly driving at his body.
  for(const x of[118,242]){const target=stage.ring(px(x),pz(47),.43,BULB.amber);target.geometry.dispose();target.geometry=new T.RingGeometry(.29,.43,32);pinballTargets.push(target);}
  for(let i=0;i<3;i++){const ring=stage.ring(0,0,(i?17:18)/30,INK.ink);pinballBumpers.push(ring);}
  // Three inset lamps tell the build-up story on the playing surface.
  for(let i=0;i<3;i++){pinballLamps.push(stage.cylinder(px(148+i*32),.06,pz(396),.18,.025,BULB.white));}
  // The launch lane has a physical power ladder, legible without a HUD meter.
  for(let i=0;i<7;i++)pinballCharge.push(stage.box(px(354),.055,pz(560-i*15),.3,.03,.21,BULB.amber));
  // Pass 2: the inlane guides are bent chrome wire forms in the cabinet's trim mesh (soccerPinballCabinet.ts).
  mergePinballStatic(pinballRails,'pinball-rails');
  // Lamps are light sources: they never cast shadows (saves up to 10 shadow-pass draws while the ladder is lit).
  for(const m of [...pinballCharge,...pinballLamps])m.castShadow=false;
  // A visible drain mouth makes the failure boundary explicit.
  stage.bar(px(156),pz(606),px(204),pz(606),.04,.11,INK.rubber);
  // Pass 2: the plunger (tip, rod, knob, working spring) is built by the cabinet; cabinet.setPlunger() moves it.
  pinballTrail=new T.InstancedMesh(new T.SphereGeometry(1,8,6),new T.MeshBasicMaterial({color:INK.paper,transparent:true,opacity:.42,depthWrite:false}),6);pinballTrail.count=0;pinballTrail.frustumCulled=false;stage.scene.add(pinballTrail);
  const starShape=new T.Shape();for(let j=0;j<10;j++){const angle=j*Math.PI/5+Math.PI/2,r=j%2?.065:.15,x=Math.cos(angle)*r,y=Math.sin(angle)*r;if(j===0)starShape.moveTo(x,y);else starShape.lineTo(x,y);}starShape.closePath();
  const starGeometry=new T.ShapeGeometry(starShape),starMaterial=new T.MeshBasicMaterial({color:BULB.amber,side:T.DoubleSide});
  for(let i=0;i<3;i++){const halo=new T.Group();halo.name=`pinball-dazed-${i}`;halo.visible=false;for(let j=0;j<3;j++)halo.add(new T.Mesh(starGeometry,starMaterial));stage.scene.add(halo);pinballStars.push(halo);}
  players[0].root.name='pinball-keeper';players[0].root.visible=true;players[0].root.scale.setScalar(.9);
  for(let i=1;i<4;i++){players[i].root.name=`pinball-defender-${i-1}`;players[i].root.scale.setScalar(.95);}
  // The keeper and defenders are comic figures: the shared rig modules are untouched; inside this scene their materials are cloned
  // once as matte flat colour with the kit's bands, sun rim and ink edge. They stand on paper mounts (cabinet.mounts).
  toyify=(root:T.Object3D)=>root.traverse(o=>{const m=o as T.Mesh;if(!m.isMesh||Array.isArray(m.material))return;const src=m.material as T.MeshStandardMaterial;if(/shirt-number/.test(m.name)){m.layers.set(31);return;}/* off the camera's layer: the rig may toggle .visible */// no printed number: one 880 x 128 texture and its draws saved
    if(typeof src.roughness!=='number')return;
    m.castShadow=false;// the figures' shadows come from one low-poly proxy draw (toyShadows), not from ~5k triangles of limbs each
    let made=toyMats.get(src);if(!made){const c=src.clone();c.roughness=.9;c.metalness=0;c.envMap=null;
     // Print colour: each zone is one flat, saturated ink (lightness snapped to five steps); the bands and the rim do the modelling.
     if(!c.map&&!c.vertexColors){c.color.getHSL(toyHsl);c.color.setHSL(toyHsl.h,Math.min(1,toyHsl.s*1.2+.04),Math.max(.08,Math.round(toyHsl.l*5)/5));}made=comicMaterial(c,{uniforms:ink,rim:true,inkWidth:1.2});toyMats.set(src,made);}m.material=made;});
  players.forEach(p=>toyify(p.root));
  pinballFx=createPinballFx(stage.scene,stage.camera,px,pz,stage.mobile);pinballTable=createPinballTableView(stage.scene,px,pz,stage.mobile,stage.reduced);pinballCam=createPinballCamera(stage.camera,stage.mobile,stage.reduced);
  // Round 3: chase lights + hot zone (2 draws) and the Champions Night sweeper-keeper (hidden below division 6).
  pinballHype=createPinballHype(stage.scene,px,pz,stage.mobile,stage.reduced);pinballSweeper=stage.player('#57e38f',sideGameDress('arcade-4','home'));pinballSweeper.root.name='pinball-sweeper';pinballSweeper.root.scale.setScalar(.88);pinballSweeper.root.visible=false;toyify(pinballSweeper.root);
  // Comic pass over everything the stage built (rails, goal frame, lane lamps, drain bar): bands, sun rim and ink edge. The rigs are
  // skipped (their materials were cloned above; the shared ones must stay untouched for the other games).
  {const rigs=new Set<T.Object3D>([...players.map(p=>p.root),pinballSweeper!.root]),walk=(o:T.Object3D)=>{if(rigs.has(o))return;const m=(o as T.Mesh).material as T.Material|T.Material[]|undefined;if(m&&!Array.isArray(m)&&((m as T.MeshStandardMaterial).isMeshStandardMaterial||(m as T.MeshLambertMaterial).isMeshLambertMaterial))comicMaterial(m,{uniforms:ink,rim:true});for(const c of o.children)walk(c);};walk(stage.scene);}
  aimComicSun(ink,sunDir,stage.camera);
 }
 
 
 
 
 
 
 
 let runnerBlastAge=0,runnerBlastPower=0;
 
 
 // Role colours belong to the visible bean outfit, not the hidden classic jersey.
 // Cache dresses once; pooled defenders only update appearance when their role changes.
 
 
 
 
 // Construct reusable runner visuals once; no geometry creation during play.
 
 // Breakaway feel layer (runnerFx) and synthesized soundtrack (runnerAudio): pooled, runner-only.
 
 
 function fit(){stage.fit((12.8),(21.2),false,false,true);if(pinballCam){pinballCam.fit(canvas.clientWidth,canvas.clientHeight);pinballCam.snap(pinball);}cameraHome.copy(stage.camera.position);cameraRotation.copy(stage.camera.quaternion);cinema=0;aimComicSun(ink,sunDir,stage.camera);}
 function reset(){Object.assign(pinball,createPinballState());pinballTrailCount=pinballTrailHead=0;pinballWasPlaying=false;pinballRoll=pinballSave=pinballSaveEvent=0;pinballPatrol.fill(0);pinballImpact=pinballImpactEvents=pinballImpactClock=0;resetPinballFeel(pinballFeel);resetPinballCinema(pinballCine);resetPinballPatternWatch(pinballPatterns);canvas.style.transform="";pinballCam?.snap(pinball);elapsed=event=0;showKind=showT=showMode=0;showPhase='';showCue='';giHeat=giTarget=1;floorEnergy.fill(0);cinema=cinemaKick=pointSound=chargeTone=cameraFocus=0;notedLevel=1;cameraBeat(0);stage.resetPlayers();}
 function action(id:number){if(overShow()&&SHOW_LIFE[7]-showT>.35){showT=0;return;}if(id===0||id===1){skipCinema(pinballCine);tapPinballFlipper(pinball,id);}else if(pinball.phase==='ready')launchPinball(pinball);else if(id===2&&skipPinballBeat(pinball)){/* no dead time: Launch ends the last part of a goal or lost-ball beat */}else if(id===2&&nudgePinball(pinball))onSound(false,'nudge');}
 function target(x:number,y:number){const p=stage.pick(x,y);}
 function update(dt:number,input:ArcadeInput){elapsed+=dt;
  if(input.left||input.right)skipCinema(pinballCine);if((input.left||input.right)&&overShow()&&SHOW_LIFE[7]-showT>.35)showT=0;stepPinballCinema(pinballCine,dt,pinball);stepPinball(pinball,{left:input.left,right:input.right,charge:input.charge},dt*pinballTimeScale(pinballFeel)*cinemaTimeScale(pinballCine));stepPinballFeel(pinballFeel,pinball,dt,onSound);watchPinballCinema(pinballCine,pinball);watchPinballPatterns(pinballPatterns,pinball,dt);
  // The ball rolling on wood: one self-stopping voice that follows ball speed (silent in the plunger lane's wait and on menus).
  {const rolling=pinball.phase==='playing'?Math.hypot(pinball.ball.vx,pinball.ball.vy):0;if(rolling>40)pinballRollSound(audioContext(),rolling);}
  const level=((pinball.level));if(level>notedLevel)onSound(true,'level');notedLevel=level;
  const tone=(0);if(tone>chargeTone)onSound(false,'charge'+tone);chargeTone=tone;
  sync((dt));cameraBeat(dt);aimComicSun(ink,sunDir,stage.camera);stage.effects(dt);stage.lighting(elapsed);
 }
 function sync(dt:number){
  {
   const speed=Math.hypot(pinball.ball.vx,pinball.ball.vy);
   pinballSave=Math.max(0,pinballSave-dt);if(pinball.sfx.keeper>pinballSaveEvent)pinballSave=.4;pinballSaveEvent=pinball.sfx.keeper;
   const b=pinball.ball,goalAge=pinball.phase==='goal'?1.5-pinball.timer:0,contact=stage.reduced||speed<14?0:b.contact;// pass 3: a resting ball (cradled) shows no contact squash or heading flicker
   ball.position.set(px(b.x),7/30,pz(b.y));
   if(goalAge>0&&!stage.reduced){ball.position.z-=.7*(1-Math.exp(-goalAge*12));ball.position.y+=Math.abs(Math.sin(goalAge*14))*.16*Math.exp(-goalAge*3);}
   // Orient the outer shell along contact/flight; roll the markings inside it.
   // Pass 3: a ball at rest (cradled on a held flipper, waiting on the plunger) keeps its heading; the old per-frame atan2 of a near-zero
    // velocity spun the engraving at random. Steel has weight: the roll only turns with real travel (above 14 units/s).
    if(speed>14)ballYaw=-Math.atan2(contact>.2?b.contactY:b.vy,contact>.2?b.contactX:b.vx);ball.rotation.set(0,ballYaw,0);
   pinballRoll+=(speed>14?speed:0)*dt/7;cabinet.rolling.rotation.set(b.spin*.2,0,pinballRoll+b.spin*.3);
   const stretch=stage.reduced?0:Math.min(.035,speed/30000);// pass 3: a steel ball barely deforms (was up to 13% stretch, 22% squash: rubber)
   ball.scale.set(1+stretch-contact*.05,1-stretch*.35+contact*.02,1-stretch*.35+contact*.035);
   const readyFoot=pinballReadyFoot(pinball),f=pinballFlippers(pinball),reach=f[0].length/63;f.forEach((p,i)=>{const press=i?pinball.right:pinball.left,delta=press-flipperPrevious[i];if(dt>0){flipperSnap[i]=Math.max(flipperSnap[i]*Math.exp(-dt*14),Math.abs(delta)*2);flipperPrevious[i]=press;}
    const pulse=Math.min(1,flipperSnap[i]+pinball.flipperCooldown[i]*5),recoil=stage.reduced?0:Math.sin(pinball.flipperCooldown[i]*Math.PI*20)*pinball.flipperCooldown[i]*.35;
    flippers[i].position.set(px(p.x),.2+(stage.reduced?0:pulse*.035),pz(p.y));flippers[i].rotation.y=-p.angle;flippers[i].rotation.x=recoil;flippers[i].scale.y=1+(stage.reduced?0:pulse*.12);flippers[i].scale.x=reach;
    flipperLights[i].material.opacity=Math.min(1,.45+press*.35+pulse*.2+(readyFoot===i?.4:0));flipperPivots[i].position.set(px(p.x),.055,pz(p.y));flipperPivots[i].scale.setScalar(1+(stage.reduced?0:pulse*.4)+(readyFoot===i?.55:0));
   });
   // Page tone: the light band falls to dusk violet on a drain and at full time, and prints hot for a beat on a goal, in printed steps
   // (quarters), never a fade. The lights themselves never change. Elite tiers print the evening in their own light.
   {giTarget=pinball.phase==='lost'?.3:pinball.phase==='over'?.42:1;if(dt>0)giHeat=lampStep(giHeat,giTarget,dt*.4);const dusk=Math.round(Math.max(0,Math.min(1,(1-giHeat)/.7))*4)/4,hot=pinball.phase==='goal'&&!stage.reduced&&goalAge<.5?(Math.floor(goalAge*12)%2?0:1):0;
    toneTier.copy(toneLight);if(pinball.tier===2)toneTier.setRGB(1,.99,.97);else if(pinball.tier===1)toneTier.setRGB(1,.84,.7);else if(pinball.level>=5)toneTier.setRGB(1,.91,.76);
    ink.uInkLight.value.copy(toneTier).lerp(toneDusk,dusk).lerp(toneHot,hot);ink.uInkShade.value.copy(toneShade).lerp(toneDeep,dusk*.8);}

   const keeperPose=pinballPose[0],incoming=pinball.phase==='playing'&&b.vy<-100&&b.y<290;
   keeperPose.vx=pinball.phase==='playing'?pinball.keeperVelocity/30:0;keeperPose.anticipate=incoming?Math.max(0,1-(b.y-83)/220):0;keeperPose.stun=0;
   keeperPose.keeper=1;pinballDive.progress=1-pinball.keeperCommit/.65;pinballDive.dir=pinball.keeperDirection<0?-1:1;pinballStandingSave.progress=.3+(1-pinballSave/.4)*.7;keeperPose.dive=pinball.keeperCommit>0?pinballDive:pinballSave>0?pinballStandingSave:undefined;
   const keeperHop=pinballCrewPose(pinballFeel.crew,pinball,0,keeperPose,stage.reduced);// goal/drain/save reactions + kick-off set
   mountN=0;mountAt(px(pinball.keeper),pz(83));players[0].root.position.set(px(pinball.keeper),0,pz(83));// Pass 3: a motor-driven figure. The dive is a rigid lunge on the mount (a tilt toward the committed side), not a flying body; the
    // crew hop is a nod; the run cycle is off (speed 0) and the slide's stops and reversals rock him on the peg.
    {const lunge=pinball.keeperCommit>0&&stage.reduced?-.42*pinballDive.dir/* reduced motion: the committed side is a held lean, no swing */:pinball.keeperCommit>0?Math.sin(Math.min(1,pinballDive.progress*2.2)*Math.PI/2)*(1-Math.max(0,pinballDive.progress-.7)/.3)*.5*-pinballDive.dir:0;if(pinball.keeperCommit>0)keeperPose.dive=undefined;keeperPose.vx=0;
     players[0].pose(dt,0,0,0,0,0,keeperPose);toyMotor(0,players[0].root,px(pinball.keeper),pz(83),dt,lunge,keeperHop*.9);}
   const impacts=pinball.sfx.wall+pinball.sfx.bumper+pinball.sfx.flipper+pinball.sfx.keeper;
   if(dt>0){if(impacts>pinballImpactEvents)pinballImpact=Math.min(1,pinballImpact+.35+Math.min(1,b.contact)*.4);pinballImpactEvents=impacts;pinballImpact*=Math.exp(-dt*15);pinballImpactClock+=dt;}
   const shake=stage.reduced?0:pinballFeel.shake;canvas.style.transform=shake>.005?`translate(${Math.sin(pinballImpactClock*107)*shake*2.5}px,${Math.cos(pinballImpactClock*91)*shake*1.6}px) rotate(${Math.sin(pinballImpactClock*73)*shake*.12}deg)`:'';
   const defenders=pinball.phase==='playing'?pinball.defenders:pinballDefenders(pinball.time,pinball.defs,pinball.defJoin,pinball.defs-1,pinball.defenders);
   for(let i=0;i<3;i++){const rig=players[i+1],ring=pinballBumpers[i],stars=pinballStars[i];stars.visible=false;rig.root.visible=ring.visible=i<defenders.length;if(i<defenders.length){
    const p=defenders[i],ai=pinball.defenderAI[i];if(pinball.phase!=='playing'){p.x+=ai.offset;if(ai.dazed>0){const t=Math.max(0,1-ai.dazed/.4),stand=t*t*(3-2*t);p.x=ai.hitX+(p.x-ai.hitX)*stand;p.y=ai.hitY+(p.y-ai.hitY)*stand;}}const block=ai.block>0?Math.sin(Math.PI*(1-ai.block/.38)):0,kick=Math.max(block,pinball.bumperCooldown[i]*6),x=px(p.x),z=pz(p.y),pose=pinballPose[i+1];
    pose.vx=dt>0&&pinballPatrol[i*2]!==0?(x-pinballPatrol[i*2])/dt:0;pose.vz=dt>0&&pinballPatrol[i*2+1]!==0?(z-pinballPatrol[i*2+1])/dt:0;pinballPatrol[i*2]=x;pinballPatrol[i*2+1]=z;
    pose.actionKind=pinball.cue==='attack'?'shot':'pass';pose.shotPower=pinball.cue==='attack'?.65:.2;
    pose.receive=pinball.possession===i?Math.max(0,(pinball.possessionTime-.4)/.32):0;pose.receiveProgress=1-pose.receive;
    pose.anticipate=pinball.possession===i?Math.min(1,1-pinball.possessionTime/.72):pinball.phase==='playing'?Math.max(0,1-Math.hypot(b.x-p.x,b.y-p.y)/100)*.6:0;pose.stun=ai.dazed>0?Math.min(1,ai.dazed):0;pose.strikeZ=.6/rig.root.scale.x;
    const hop=pinballCrewPose(pinballFeel.crew,pinball,i+1,pose,stage.reduced);
    mountAt(x,z);rig.root.position.set(x,0,z);{const face=toyFacing(ai.block>0||pinball.possession===i?ai.aim:Math.hypot(pose.vx,pose.vz)>.08?Math.atan2(pose.vx,pose.vz):Math.atan2(ball.position.x-x,ball.position.z-z));pose.vx=pose.vz=0;
      rig.pose(dt,0,face,ai.dazed>0?0:kick,0,0,pose);toyMotor(i+1,rig.root,x,z,dt,0,ai.dazed>0?0:hop*.9);}
    if(ai.dazed>0){const fall=Math.min(1,(2-ai.dazed)/.13,ai.dazed/.4);rig.root.rotation.y=ai.fallYaw;rig.body.rotation.x=-fall*1.4;rig.body.position.y+=fall*.15;rig.legs[0].knee.rotation.x+=fall*.5;rig.legs[1].knee.rotation.x+=fall*.8;ring.visible=false;
     rig.finalizePose();stars.visible=true;rig.head.getWorldPosition(stars.position);stars.position.y+=.35;
     for(let j=0;j<3;j++){const star=stars.children[j],a=j*Math.PI*2/3+(stage.reduced?0:pinball.time*3);star.position.set(Math.cos(a)*.4,stage.reduced?0:Math.sin(a*2)*.07,Math.sin(a)*.22);star.rotation.set(-.65,0,stage.reduced?0:pinball.time*1.5+j);star.scale.setScalar(Math.min(1,ai.dazed/.25));}
    }
    const owns=pinball.possession===i;(ring.material as T.MeshBasicMaterial).color.setHex(owns?0xffc83a:(pinball.passTarget===i||pinball.possession>=0&&pinball.attackReceiver===i)?0x4aa3e8:0x231a2e);
    ring.position.set(x,.035,z);ring.scale.setScalar(1+(stage.reduced?0:owns?.12+Math.sin((1-pinball.possessionTime/.72)*Math.PI)*.12:kick*.22));
   }}
   if(!stage.reduced&&pinballNet&&pinballNetBase&&(goalAge>0||pinballNetDirty)){
    const positions=pinballNet.geometry.attributes.position as T.BufferAttribute,netHit=stage.reduced?0:Math.sin(Math.min(1,goalAge/.18)*Math.PI*.5)*Math.exp(-goalAge*3);
    for(let i=0;i<positions.count;i++){const j=i*3,x=pinballNetBase[j],y=pinballNetBase[j+1],z=pinballNetBase[j+2],weight=Math.max(0,1-Math.abs(x-px(b.x))/2.4)*Math.max(0,1-y/2.2);positions.setZ(i,z-(z<-.5?netHit*weight*.65:0));}
    positions.needsUpdate=true;pinballNetDirty=goalAge>0;
   }
   pinballHypeLive=!!pinballHype?.update(pinball,dt,showT>0&&showSk?showAt:null);
   if(pinballSweeper){const on=pinball.level>=6&&pinball.phase!=='over';pinballSweeper.root.visible=on;if(on){pinballSweeperPose.vx=pinball.phase==='playing'?pinball.keeper2Velocity/30:0;mountAt(px(pinball.keeper2),pz(SWEEPER_Y));pinballSweeper.root.position.set(px(pinball.keeper2),0,pz(SWEEPER_Y));pinballSweeperPose.vx=0;pinballSweeper.pose(dt,0,0,0,0,0,pinballSweeperPose);toyMotor(4,pinballSweeper.root,px(pinball.keeper2),pz(SWEEPER_Y),dt);}}
   cabinet.mounts.count=toyShadows.count=mountN;cabinet.mounts.instanceMatrix.needsUpdate=toyShadows.instanceMatrix.needsUpdate=true;
   {// Print lamps over the inserts: each level eases (fast to print, slow to clear) and the shader cuts it into dots and flat colour. One instanced draw.
    const ladder=pinball.phase==='ready'?pinball.plunger:0;
    if(dt>0){if(pinballImpact>.2&&floorWave<=0){floorWave=1;floorHitX=ball.position.x;floorHitZ=ball.position.z;}floorWave=Math.max(0,floorWave-dt*1.5);
     const ph=pinball.phase;if(ph!==showPhase){if(ph==='goal')startShow(3);else if(ph==='over')startShow(7);else if(ph==='lost')startShow(4);else if(ph==='playing'&&showPhase==='ready')startShow(2);showPhase=ph;}
     const modeNow=(pinball.table.mode!=='none'?1:0)+(pinball.extraLive?2:0);if(modeNow>showMode)startShow(5);showMode=modeNow;
     if(pinball.cue==='nudge'&&showCue!=='nudge')startShow(6);showCue=pinball.cue;showT=Math.max(0,showT-dt);}
    // Attract: while the ball waits on the plunger every other insert is lit, a still pattern that costs no frames (the ready table
    // must sleep until input: scripts/check-soccer-pinball-browser.cjs); the chase starts with the launch.
    const sk=showT>0?showKind:0,age=SHOW_LIFE[sk]-showT,waiting=pinball.phase==='ready';floorMoving=false;showSk=sk;showAge=age;
    for(let i=0;i<insertN;i++){const x=insertX[i],z=insertZ[i];
     const nearBall=pinball.phase==='playing'?Math.max(0,1-Math.hypot(x-ball.position.x,z-ball.position.z)/2.6)*.9:0;
     const ripple=stage.reduced?0:floorWave*Math.max(0,1-Math.abs(Math.hypot(x-floorHitX,z-floorHitZ)-(1-floorWave)*10)/1.8)*.8;
     const left=Math.max(0,1-Math.hypot(x+2.7,z-7.5)/6)*Math.min(1,pinball.left*.4+flipperSnap[0]),right=Math.max(0,1-Math.hypot(x-2.7,z-7.5)/6)*Math.min(1,pinball.right*.4+flipperSnap[1]);
     const charge=ladder>0&&z>9.4-ladder*19?ladder*.9:0;
     let show=0,boost=charge>0?.5:0;
     if(sk)show=showAt(x,z);if(sk===3)boost=age<.3?1:.35;else if(sk===7)boost=age<.28?.7:0;
     const hold=pinball.phase==='goal'&&sk!==3?.5:0;
     const energy=Math.min(1,nearBall+ripple+left+right+charge+show+hold+(waiting?(i%2?.46:.14):0));floorEnergy[i]=dt>0&&!waiting?lampStep(floorEnergy[i],energy,dt):energy;if(Math.abs(floorEnergy[i]-energy)>.006)floorMoving=true;
     cabinet.setInsert(i,floorEnergy[i],boost);
    }cabinet.flush();
   }
   const chance=pinball.moveTime>0,celebrating=pinball.phase==='goal';
   for(const target of pinballTargets){target.scale.setScalar(chance?1.45:1);target.position.y=chance?.08:.035;(target.material as T.MeshBasicMaterial).color.set(chance?BULB.white:INK.ink);}
   const lit=celebrating?3:chance?2:pinball.combination>0?1:0;
   for(let i=0;i<3;i++)pinballLamps[i].visible=i<lit;
   for(let i=0;i<7;i++)pinballCharge[i].visible=pinball.phase==='ready'&&i<Math.ceil(plungerPull(pinball.plunger)*7);
   cabinet.setPlunger(pz(585+pinball.plunger*11-pinball.plungerSnap*6));
   if(pinballTrail){
    const playing=pinball.phase==='playing';if(!playing||!pinballWasPlaying)pinballTrailCount=pinballTrailHead=0;
    if(playing&&dt>0){const j=pinballTrailHead*3;pinballTrailPoints[j]=px(pinball.ball.x);pinballTrailPoints[j+1]=.2;pinballTrailPoints[j+2]=pz(pinball.ball.y);pinballTrailHead=(pinballTrailHead+1)%6;pinballTrailCount=Math.min(6,pinballTrailCount+1);}
    pinballWasPlaying=playing;pinballTrail.count=playing&&speed>350&&!stage.reduced?Math.min(stage.mobile?3:6,pinballTrailCount):0;
    for(let i=0;i<pinballTrail.count;i++){const j=((pinballTrailHead-1-i+6)%6)*3;pinballTrailMatrix.position.fromArray(pinballTrailPoints,j);pinballTrailMatrix.scale.setScalar((7/30)*(1-(i+1)/8));pinballTrailMatrix.updateMatrix();pinballTrail.setMatrixAt(i,pinballTrailMatrix.matrix);}if(pinballTrail.count)pinballTrail.instanceMatrix.needsUpdate=true;
   }
   pinballFx?.update(pinballFeel,pinball,dt,stage.reduced);pinballTable?.update(pinball,dt,showT>0&&showSk?showAt:null);
   if(event!==pinball.hitId){event=pinball.hitId;stage.burst(px(pinball.hitX),.4,pz(pinball.hitY),pinball.phase==='goal'?2:pinball.cue==='strike'?1.3:pinball.cue==='control'?.25:pinball.cue==='pass'?.45:1);onSound(pinball.phase==='goal',pinball.phase==='goal'?'goal':pinball.cue);}
  }
 }
 function hud():ArcadeHUD{return{pinballStreak:pinballStreakBadge(pinball.timing.streak),pinballPattern:pinballPatternShown(pinballPatterns)?.label,pinballPatternWhy:pinballPatternShown(pinballPatterns)?.why,pinballPatternOn:pinballPatterns.kind!==null,pinballBalls:pinball.balls,pinballClock:pinballMinute(pinball),pinballLate:pinball.stoppage>=0||pinball.clock>=270,pinballMult:pinballTierMult(pinball.tier),pinballEnd:pinball.phase==='over'?pinballEndReason(pinball,pinballMinute(pinball)):undefined,leftReady:pinballReadyFoot(pinball)===0,rightReady:pinballReadyFoot(pinball)===1,nudgeOff:!pinball.nudgeOn,nudgeReady:pinball.nudgeOn&&pinball.phase==='playing'&&pinball.nudges>0&&pinball.nudgeCooldown<=0&&pinball.ball.x<341,score:String(pinball.score),detail:`${pinball.rush>0&&pinball.phase==='playing'?`RUSH ${Math.ceil(pinball.rush)}s`:pinballMinute(pinball)} · ${pinball.tier?pinballTierOf(pinball.tier)!.name:`DIV ${pinball.level}`} · ${pinball.goals} goal${pinball.goals===1?'':'s'} · ${pinball.phase==='over'?`${pinballStarTotal(pinball.table.stars)}/${pinball.table.stars.length*3} ★${pinballFeel.runBestCombo>1?` · best ${pinballFeel.runBestCombo}× combo`:''}`:`${pinball.balls} ball${pinball.balls===1?'':'s'}`} · ${pinballLevelLabel(pinball.match)}`,message:overShow()?'GAME OVER · '+pinball.score:pinballFeelMessage(pinballFeel,pinball)??(pinball.cue==='rescue'?'BALL SAVED · a fresh launch. Wait for the ball to reach your flipper.':pinball.phase==='ready'?(pinball.plunger>.02?`Launch power · ${Math.round(plungerPull(pinball.plunger)*100)}%`:`${pinballDivision(pinball).name} · ${pinballDivision(pinball).objective}`):pinball.phase==='goal'?`${pinball.lastChallengeBonus?`CHALLENGE +${pinball.lastChallengeBonus} · `:''}${pinball.lastGoalBonus?'MOVE COMPLETE':pinball.cue==='corner'?'CORNER FINISH':'GOAL'}! +${pinball.lastGoalPoints} · ${pinball.lastGoalBonus?'Both feet made that chance.':pinball.defs<3?'Another defender joins.':'You beat the back three!'}`:pinball.phase==='lost'?(pinball.cue==='concede'?'RIVAL GOAL · read the wind-up and time your return.':'Find your timing: let the ball reach the flipper before you strike.'):pinball.cue==='hotZone'?'IN THE SPACE! Attack the open grass, not the defender.':pinball.cue==='nudge'?'NUDGE! Switch flippers to earn another rescue.':pinball.cue==='dazed'?'DEFENDER DAZED · attack the open space!':pinball.cue==='block'?'FOOT BLOCK · switch the angle.':pinball.cue==='control'?'DEFENDER IN CONTROL · watch the next pass.':pinball.cue==='pass'?'ONE–TWO · get your flippers ready!':pinball.cue==='attack'?'COUNTER SHOT · time your return!':pinball.moveTime>0?`FINISH! ${Math.ceil(pinball.moveTime)}s · Lit goal +${750+Math.min(3,pinball.moves)*250} · Corners +150`:pinball.cue==='save'?'SAVED! Aim for the lit rings beside the posts.':pinball.cue==='strike'?(pinball.combination>1?`${pinball.combination}× COMBINATION! +${pinball.combination*25} · Alternate feet to keep the move alive.`:'BUILD! Use the other flipper to light the goal.'):'BUILD → SWITCH → FINISH · Link both feet, then score.'),over:pinball.phase==='over'&&!overShow(),ready:pinball.phase==='ready'};}
 sync(0);fit();stage.render();return{needsFrames:()=>cinema>0||stage.effectsActive()||((((!!pinballCam?.moving()||pinball.phase!=='ready'&&pinball.phase!=='over'||pinball.defJoin>0||pinball.defenderAI.some(ai=>ai.dazed>0)||pinball.flipperPulse[0]>0||pinball.flipperPulse[1]>0||pinball.plunger>.002||pinball.plungerSnap>.002||pinball.left>.004||pinball.right>.004||flipperSnap.some(value=>value>.005)||showT>0||floorWave>0||floorMoving||Math.abs(giHeat-giTarget)>.01||pinballFeelActive(pinballFeel)||!!pinballTable?.active()||cinemaActive(pinballCine)||pinballHypeLive)))),stage,update,reset,action,target,hud,fit,pinballCamera:()=>pinballCam?.info(),/** Debug/QA: what is keeping the frame loop awake. */pinballAwake:()=>({camera:!!pinballCam?.moving(),show:showT>0,floor:floorWave>0||floorMoving,gi:Math.abs(giHeat-giTarget)>.01,feel:pinballFeelActive(pinballFeel),table:!!pinballTable?.active(),cinema:cinemaActive(pinballCine),hype:pinballHypeLive,effects:stage.effectsActive(),snap:flipperSnap.some(value=>value>.005)}),pinballCinema:pinballCine,state:{tennis,pinball,runner},
  /** Futbol Tennis hold-to-power: 0 Kick, 1 Lob, 2 Drop. Start winds up, release strikes, cancel drops it. */
  chargeStart(id:number){return false;},
  chargeRelease(){return false;},
  chargeCancel(){},
  /** Debug/QA read of the dynamic tennis camera (zoom, serve blend, focus). */
  tennisCamera(){return null;},
  /** Debug/QA read of the tennis cinematic beat (scale, close-up, follow, push, flash). */
  tennisBeat(){return null;},
  /** Tear down: game-specific module state first (runnerTrack's renderer hold), then the stage. */
  dispose(){toyMats.forEach(m=>m.dispose());stage.dispose();}};
}
