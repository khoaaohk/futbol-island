import * as T from 'three';
import {createNeonSpill} from './neonSpill';
import {createGlassFloor} from './glassFloor';
import {createArcadeStage} from './arcadeStage';
import type {ArcadePoseOptions} from './arcadePlayerMotion';
import {sideGameDress,teamBodyColour,type BeanDress} from '../town/beanLooks';
import {TENNIS,TENNIS_COURTS,createTennis,tennisNeedsFrames,beginTennis,resetTennis,tickTennis,setTennisTarget,setTennisMovement,canTennisKick,canTennisPerfect,canTennisSlam,canTennisHeader,canTennisScissor,tennisReceivingPoint,requestTennisKick,type TennisShot} from '@/lib/games/soccerTennis';
import {createPinballState,stepPinball,launchPinball,nudgePinball,tapPinballFlipper,pinballDivision,pinballDefenders,pinballFlippers,pinballReadyFoot,plungerPull} from '@/lib/games/soccerPinball';
import {JUMP_V} from '../../components/games/runnerPhysics';
import {createRunnerGame,tickRunner,runnerJump,runnerSlide,runnerShoot,runnerCharge,runnerRelease,runnerMultiplier,RUNNER_STRIKE_X} from './runnerGame';
export type ArcadeKind='tennis'|'pinball'|'runner';
export type ArcadeInput={x:number;y:number;left:boolean;right:boolean;charge:boolean};
export type ArcadeHUD={score:string;detail:string;message:string;over:boolean;ready:boolean;headerReady?:boolean;scissorReady?:boolean;leftReady?:boolean;rightReady?:boolean;nudgeReady?:boolean;nextLabel?:string};
export function createArcadeGame(canvas:HTMLCanvasElement,kind:ArcadeKind,onSound:(goal:boolean,cue?:string)=>void){
 const stage=createArcadeStage(canvas),tennis=createTennis(),pinball=createPinballState(),runner=createRunnerGame();
 const ball=stage.football(kind==='pinball'?7/30:kind==='tennis'?.3:.22);let elapsed=0,event=0;
 const cameraHome=new T.Vector3(),cameraRotation=new T.Quaternion(),shotLook=new T.Vector3(),shotCamera=new T.Vector3(),shotRotation=new T.Quaternion();let cinema=0,cinemaKick=0,pointSound=0,cameraFocus=0,chargeTone=0,notedLevel=1;
 function cameraBeat(dt:number){const camera=stage.camera;cinema=Math.max(0,cinema-dt);let focus=0;if(!stage.reduced){if(kind==='tennis')focus=Math.sin(Math.PI*Math.min(1,cinema/.62));else if(kind==='runner')focus=T.MathUtils.clamp((runner.charge-.2)/.8,0,1)*.65;}
  camera.position.copy(cameraHome);camera.quaternion.copy(cameraRotation);
  if(kind==='runner'){cameraFocus=dt>0?T.MathUtils.damp(cameraFocus,focus,10,dt):0;focus=cameraFocus;}
  if(focus>0){const x=kind==='tennis'?tennis.you.x:runner.x,z=kind==='tennis'?tennis.you.y:0;shotLook.set(x,.9,z);shotCamera.set(x+7,7,z+10);camera.position.lerp(shotCamera,focus*.78);camera.lookAt(shotLook);shotRotation.copy(camera.quaternion);camera.quaternion.copy(cameraRotation).slerp(shotRotation,focus);}
  camera.updateMatrixWorld();
 }
 const players=[stage.player('#efbd58',sideGameDress('arcade-0','home')),...[1,2,3].map(i=>stage.player('#b492d0',sideGameDress('arcade-'+i,'away')))];
 players.forEach(p=>p.root.visible=false);
 let glassFloor:ReturnType<typeof createGlassFloor>|null=null;
 const strips:T.Mesh[]=[],flippers:T.Group[]=[],runnerObjects:T.Group[]=[],shadow=new T.Mesh(new T.CircleGeometry(.28,24),new T.MeshBasicMaterial({color:'#183f45',transparent:true,opacity:.25,depthWrite:false}));shadow.rotation.x=-Math.PI/2;stage.scene.add(shadow);
 let tennisGuide:T.Mesh|null=null,tennisContact:T.Mesh|null=null,tennisAim:T.Mesh|null=null,tennisCountdown:T.Mesh|null=null,tennisReadAt=0,tennisLandTime=0;const tennisAimMarks:T.Mesh[]=[];
 const tennisTrail:T.Mesh[]=[],tennisTrailPoints=new Float32Array(42);let tennisTrailHead=0,tennisTrailCount=0,tennisTrailClock=0,tennisPoseRest=0;const tennisPose:ArcadePoseOptions[]=[{vx:0,vz:0,anticipate:0,celebrate:0},{vx:0,vz:0,anticipate:0,celebrate:0}];const tennisVolley:Array<NonNullable<ArcadePoseOptions['move']>>=[{kind:'volley',progress:0,side:1,height:0},{kind:'volley',progress:0,side:1,height:0}];let tennisTrailColor='';let tennisImpact:T.Mesh|undefined;
 let pinballFloor:T.InstancedMesh|null=null;const floorColor=new T.Color(),floorBase=new T.Color('#102b44'),floorCyan=new T.Color('#38ffee'),floorPink=new T.Color('#ff58c9'),floorGold=new T.Color('#ffe86d'),floorEnergy=new Float32Array(112);let floorWave=0,floorHitX=0,floorHitZ=0;
 const pinballGlow:T.Mesh<T.BufferGeometry,T.MeshBasicMaterial>[]=[],flipperLights:T.Mesh<T.BufferGeometry,T.MeshBasicMaterial>[]=[],flipperPivots:T.Mesh[]=[];
 const flipperPrevious=[0,0],flipperSnap=[0,0];
 const pinballStars:T.Group[]=[];const pinballTargets:T.Mesh[]=[],pinballBumpers:T.Mesh[]=[],pinballLamps:T.Mesh[]=[],pinballCharge:T.Mesh[]=[];const pinballTrailPoints=new Float32Array(18);let pinballTrailCount=0,pinballTrailHead=0,pinballWasPlaying=false;let pinballPlunger:T.Mesh|undefined,pinballTrail:T.InstancedMesh|undefined;const pinballTrailMatrix=new T.Object3D();const pinballRolling=new T.Group(),pinballPatrol=new Float32Array(6),pinballDive={progress:0,dir:1 as -1|1,height:0,kind:'side' as const,outcome:'parry' as const},pinballStandingSave={progress:0,dir:1 as -1|1,height:0,kind:'stand' as const,outcome:'parry' as const},pinballPose=Array.from({length:4},()=>({vx:0,vz:0,anticipate:0,stun:0,celebrate:0,keeper:0,dive:undefined as typeof pinballDive|typeof pinballStandingSave|undefined,actionKind:'pass' as 'pass'|'shot',shotPower:.2,strikeZ:.65,receive:0,receiveProgress:0}));let pinballImpact=0,pinballImpactEvents=0,pinballImpactClock=0;let pinballNet:T.LineSegments|undefined,pinballNetBase:Float32Array|undefined,pinballNetDirty=false,pinballRoll=0,pinballSave=0,pinballSaveEvent=0;
 const px=(x:number)=>(x-180)/30,pz=(y:number)=>(y-310)/30;
 if(kind==='tennis'){
  glassFloor=createGlassFloor(stage.scene,9.8,15.8,8,14,.018);
  stage.box(0,-.06,0,11,.12,17,'#588f88').castShadow=false;
  for(let side of[-1,1]){stage.box(0,.004,side*4,9.9,.016,7.9,side===1?'#338e7c':'#367f7b').castShadow=false;stage.box(0,.023,side*8,10.1,.012,.095,'#fff0cf').castShadow=false;stage.box(side*5,.023,0,.095,.012,16.1,'#fff0cf').castShadow=false;stage.cylinder(side*5.3,.66,0,.07,1.32,'#fff0cf');}
  // Sparse painted placement marks give the player an explicit opposite-court target.
  for(const x of[-3.7,0,3.7]){const mark=stage.ring(x,-5.2,.58,'#78aaa0');tennisAimMarks.push(mark);}
  tennisAim=stage.ring(0,-5.2,.7,'#ffe084');tennisAim.name='tennis-shot-target';
  tennisCountdown=stage.ring(0,0,.64,'#ef987a');tennisCountdown.name='tennis-bounce-countdown';tennisCountdown.visible=false;tennisImpact=stage.ring(0,0,.5,'#ffe084');tennisImpact.name='tennis-aerial-impact';tennisImpact.visible=false;
  stage.bar(-5.3,0,5.3,0,1.1,.035,'#fff4df');const net:number[]=[];for(let x=-5.25;x<=5.3;x+=.3)net.push(x,.08,0,x,1.1,0);for(let y=.08;y<=1.1;y+=.2)net.push(-5.3,y,0,5.3,y,0);const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(net,3));stage.scene.add(new T.LineSegments(geo,new T.LineBasicMaterial({color:'#e7eee0',transparent:true,opacity:.55})));
  players[0].root.visible=players[1].root.visible=true;players[0].root.scale.setScalar(1.25);players[1].root.scale.setScalar(1.25);players[0].root.name='tennis-player-you';players[1].root.name='tennis-player-rival';
  tennisGuide=stage.ring(0,0,.68,'#fff0af');tennisGuide.name='tennis-landing';tennisContact=stage.ring(0,0,.9,'#ffe084');tennisContact.name='tennis-contact';tennisGuide.visible=tennisContact.visible=false;
  // A small fixed trail pool makes shot speed readable without runtime geometry.
  for(let i=0;i<14;i++){const dot=stage.sphere(0,0,0,.065,'#ffe084');dot.castShadow=false;dot.visible=false;tennisTrail.push(dot);}
 }else if(kind==='pinball'){
  ball.name='pinball-ball';pinballRolling.name='pinball-rolling';for(const child of [...ball.children])pinballRolling.add(child);ball.add(pinballRolling);
  // Layered light pools reuse the box geometry; no bloom, dynamic lights or shadows.
  const glow=createNeonSpill(13.5,21.8,-.085,'#ca65ff');glow.name='pinball-underglow';stage.scene.add(glow);pinballGlow.push(glow);
  for(const side of [-1,1]){stage.box(side*6.28,-.035,0,.045,.045,19.7,side<0?'#73fff1':'#ff62c2').castShadow=false;}
  stage.box(0,-.18,0,12.7,.35,21,'#467f7b').castShadow=false;stage.box(-.25,.005,-.1,10.5,.015,18.5,'#348a70').castShadow=false;
  const tileGeometry=new T.PlaneGeometry(10.5/8-.045,18.5/14-.045),tileMaterial=new T.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.76,depthWrite:false,toneMapped:false});
  pinballFloor=new T.InstancedMesh(tileGeometry,tileMaterial,112);pinballFloor.name='pinball-reactive-glass-floor';pinballFloor.instanceMatrix.setUsage(T.StaticDrawUsage);const tile=new T.Object3D();tile.rotation.x=-Math.PI/2;
  for(let row=0;row<14;row++)for(let col=0;col<8;col++){const index=row*8+col;tile.position.set(-.25+(col-3.5)*10.5/8,.018,-.1+(row-6.5)*18.5/14);tile.updateMatrix();pinballFloor.setMatrixAt(index,tile.matrix);pinballFloor.setColorAt(index,floorBase);}pinballFloor.instanceColor!.setUsage(T.DynamicDrawUsage);stage.scene.add(pinballFloor);
  const glass=new T.Mesh(new T.PlaneGeometry(10.5,18.5),new T.MeshStandardMaterial({color:'#b1cfff',transparent:true,opacity:.09,roughness:.15,metalness:.25,depthWrite:false}));glass.name='pinball-glass';glass.rotation.x=-Math.PI/2;glass.position.set(-.25,.02,-.1);stage.scene.add(glass);
  const walls=[[20,45,100,45],[260,45,318,45],[100,30,100,53],[260,30,260,53],[318,45,352,60],[352,60,366,108],[20,45,20,455],[366,108,366,599],[341,150,341,402],[341,455,341,594],[20,455,99,535],[338,458,261,535],[344,599,364,599]];
  for(const [a,b,c,d]of walls)stage.bar(px(a),pz(b),px(c),pz(d),.18,.13,'#fff0cf');
  stage.ring(-.3,0,1.8,'#e4edce');stage.bar(-5.3,0,5.3,0,.03,.025,'#e4edce');const goal=stage.goal(0,pz(45),160/30);goal.traverse(o=>{if(o instanceof T.LineSegments){pinballNet=o;o.name='pinball-net';pinballNetBase=new Float32Array(o.geometry.attributes.position.array);}});
  for(const side of[0,1]){const group=new T.Group();stage.scene.add(group);stage.box(1.05,0,0,2.1,.25,.46,side?'#ed9f87':'#eec55d',group);
   const light=stage.box(1.05,.135,0,1.85,.02,.13,'#fff0cf',group);light.castShadow=false;(light as T.Mesh).material=new T.MeshBasicMaterial({color:side?'#ffb4eb':'#fff6ac',transparent:true,opacity:.55});flipperLights.push(light as unknown as T.Mesh<T.BufferGeometry,T.MeshBasicMaterial>);
   const pivot=stage.ring(0,0,.33,side?'#ff62c2':'#ffee68');flipperPivots.push(pivot);flippers.push(group);}
  // Post pockets are visible scoring targets; a corner finish rewards placing
  // the shot beyond the keeper rather than repeatedly driving at his body.
  for(const x of[118,242]){const target=stage.ring(px(x),pz(47),.43,'#ffe18b');target.geometry.dispose();target.geometry=new T.RingGeometry(.29,.43,32);pinballTargets.push(target);}
  for(let i=0;i<3;i++){const ring=stage.ring(0,0,(i?17:18)/30,'#edaa87');pinballBumpers.push(ring);}
  // Three inset lamps tell the build-up story on the playing surface.
  for(let i=0;i<3;i++){stage.cylinder(px(148+i*32),.035,pz(396),.27,.035,'#245f59');pinballLamps.push(stage.cylinder(px(148+i*32),.06,pz(396),.18,.025,'#ffe28b'));}
  // The launch lane has a physical power ladder, legible without a HUD meter.
  for(let i=0;i<7;i++)pinballCharge.push(stage.box(px(354),.055,pz(560-i*15),.3,.03,.21,'#ffe28b'));
  for(const side of[-1,1]){const x=180+side*60;stage.bar(px(x),pz(472),px(x+side*22),pz(442),.026,.035,'#fff0cf');stage.bar(px(x+side*22),pz(442),px(x+side*9),pz(448),.026,.035,'#fff0cf');}
  // A visible drain mouth makes the failure boundary explicit.
  stage.bar(px(156),pz(606),px(204),pz(606),.04,.11,'#de947c');
  pinballPlunger=stage.box(px(354),.24,pz(585),.38,.3,.55,'#f9d275');
  pinballTrail=new T.InstancedMesh(new T.SphereGeometry(1,8,6),new T.MeshBasicMaterial({color:'#ffe5a3',transparent:true,opacity:.32,depthWrite:false}),6);pinballTrail.count=0;pinballTrail.frustumCulled=false;stage.scene.add(pinballTrail);
  const starShape=new T.Shape();for(let j=0;j<10;j++){const angle=j*Math.PI/5+Math.PI/2,r=j%2?.065:.15,x=Math.cos(angle)*r,y=Math.sin(angle)*r;if(j===0)starShape.moveTo(x,y);else starShape.lineTo(x,y);}starShape.closePath();
  const starGeometry=new T.ShapeGeometry(starShape),starMaterial=new T.MeshBasicMaterial({color:'#ffe073',side:T.DoubleSide});
  for(let i=0;i<3;i++){const halo=new T.Group();halo.name=`pinball-dazed-${i}`;halo.visible=false;for(let j=0;j<3;j++)halo.add(new T.Mesh(starGeometry,starMaterial));stage.scene.add(halo);pinballStars.push(halo);}
  players[0].root.name='pinball-keeper';players[0].root.visible=true;players[0].root.scale.setScalar(.9);
  for(let i=1;i<4;i++){players[i].root.name=`pinball-defender-${i-1}`;players[i].root.scale.setScalar(.95);}
 }else{
  ball.name='runner-ball';
  stage.box(0,-.07,-24,8.8,.12,76,'#367e70').castShadow=false;
  for(const side of[-1,1])stage.bar(side*4.4,8,side*4.4,-62,.03,.06,'#fce8ba');glassFloor=createGlassFloor(stage.scene,8.6,76,6,32,.018);glassFloor.root.position.z=-24;
  players[0].root.visible=true;players[0].root.scale.setScalar(1.15);players[0].root.name='runner-player';players[0].useMainAppearance();players[0].root.userData.motion=players[0].motion;
  for(let i=0;i<30;i++){const g=new T.Group();g.visible=false;stage.scene.add(g);runnerObjects.push(g);}
 }
 let runnerAimEnd:T.Mesh|undefined,runnerLaneMarks:T.LineSegments|undefined;
 if(kind==='runner'){
  // One geometry for painted lane dashes, instead of dozens of individual meshes.
  const marks:number[]=[];for(const x of[-1.2,1.2])for(let z=-62;z<8;z+=4)marks.push(x,.026,z,x,.026,z+2);
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(marks,3));runnerLaneMarks=new T.LineSegments(geometry,new T.LineBasicMaterial({color:'#fff0cf',transparent:true,opacity:.5}));stage.scene.add(runnerLaneMarks);
  runnerAimEnd=stage.ring(0,-.8,.38,'#ffe084');runnerAimEnd.visible=false;
 }
 const runnerDribble=new T.Vector3();
 const runnerVolley:NonNullable<ArcadePoseOptions['move']>={kind:'volley',progress:0,side:1,height:1};
 const runnerPose={move:undefined as ArcadePoseOptions['move'],strikeX:-RUNNER_STRIKE_X/1.15,strikeZ:.9/1.15,jumpProgress:undefined as number|undefined,dribbling:true,charge:0,vx:0,vz:-6,slide:0,anticipate:0,stun:0,celebrate:0,stride:0};
 const runnerShotMatrix=new T.Object3D();let runnerShotTrail:T.InstancedMesh|undefined;
 if(kind==='runner'){runnerShotTrail=new T.InstancedMesh(new T.SphereGeometry(1,8,6),new T.MeshBasicMaterial({color:'#ffe4a1',transparent:true,opacity:.28,depthWrite:false}),20);runnerShotTrail.count=0;runnerShotTrail.frustumCulled=false;stage.scene.add(runnerShotTrail);}
 let runnerBlastAge=0,runnerBlastPower=0;
 const runnerBlastRings=kind==='runner'?['#ffe86d','#ff62c2'].map((color,i)=>{const ring=stage.ring(0,0,1,color);ring.name='runner-blast-ring-'+i;ring.material.transparent=true;ring.material.depthWrite=false;ring.visible=false;return ring;}):[];
 const runnerShots=kind==='runner'?runner.shots.map(()=>{const m=stage.football(.22);m.visible=false;return m;}):[];
 // Role colours belong to the visible bean outfit, not the hidden classic jersey.
 // Cache dresses once; pooled defenders only update appearance when their role changes.
 const runnerDresses=kind==='runner'?Object.fromEntries((['jockey','tackler','sweeper'] as const).map((role,i)=>{
  const dress=sideGameDress(`runner-${role}`,'away',i+2),shirt=['#9478c1','#dd7157','#498fa7'][i];
  dress.outfit={...dress.outfit,shirt,shirt2:'#fff0cf',shorts:'#293b43',socks:shirt};
  dress.look={...dress.look,body:teamBodyColour(dress.outfit),build:role==='tackler'?'wide':role==='sweeper'?'tall':'regular'};
  return[role,dress];
 })) as Record<'jockey'|'tackler'|'sweeper',BeanDress>:null;
 const poolKinds=new Map<T.Group,string>(),used=new Set<T.Group>();
 function decorate(g:T.Group,type:string){if(poolKinds.get(g)===type)return;g.clear();poolKinds.set(g,type);if(type==='coin'){const m=stage.football(.27);stage.scene.remove(m);m.position.y=.38;g.add(m);const ring=stage.ring(0,0,.45,'#ffe084');stage.scene.remove(ring);g.add(ring);}else if(type==='cone'){const m=new T.Mesh(new T.ConeGeometry(.42,.9,8),new T.MeshStandardMaterial({color:'#e89470',roughness:.8}));m.position.y=.45;m.castShadow=true;g.add(m);}else if(type==='defender'){const p=stage.player('#db7863',runnerDresses!.jockey);stage.scene.remove(p.root);g.add(p.root);g.userData.rig=p;const warning=stage.ring(0,0,.62,'#ef9a78');stage.scene.remove(warning);g.add(warning);g.userData.warning=warning;}else{const goal=stage.goal(0,0,7.6);stage.scene.remove(goal);g.add(goal);const net=goal.children.find(c=>c instanceof T.LineSegments) as T.LineSegments;g.userData.net=net;g.userData.netBase=new Float32Array(net.geometry.attributes.position.array);prepareGoalBurst(g,goal,net);const caught=stage.football(.22);stage.scene.remove(caught);caught.visible=false;g.add(caught);g.userData.caught=caught;const marker=new T.Group();marker.name='open-lane';g.add(marker);for(const x of[-.86,.86])stage.box(x,.9,.06,.08,1.8,.08,'#ffe084',marker).castShadow=false;stage.box(0,1.78,.06,1.8,.08,.08,'#ffe084',marker).castShadow=false;stage.box(0,.025,1,1.7,.025,2,'#f7d979',marker).castShadow=false;for(const lane of[-1,0,1]){const blocker=stage.player('#db7863',runnerDresses!.tackler);stage.scene.remove(blocker.root);blocker.root.position.set(lane*2.4,0,.12);blocker.root.scale.setScalar(1.12);blocker.root.name=`blocked-${lane}`;blocker.root.userData.rig=blocker;blocker.root.userData.blockPose={vx:0,vz:0,anticipate:.65,skill:undefined};blocker.root.userData.blockSkill={type:'blockTackle',progress:0,side:lane>0?-1:1};g.add(blocker.root);}}}
 function prepareGoalBurst(g:T.Group,goal:T.Group,net:T.LineSegments){
  const intact=goal.children.filter(part=>part===net||Math.abs(part.position.y-2.1)<.01),pieces=goal.children.filter(part=>!intact.includes(part));
  const vertices=net.geometry.attributes.position.array,originalCount=pieces.length;
  for(let panel=0;panel<3;panel++){
   const points:number[]=[],left=-3.8+panel*7.6/3,right=left+7.6/3;
   for(let j=0;j<vertices.length;j+=6){const x=vertices[j],dx=vertices[j+3]-x;let lo=0,hi=1;if(Math.abs(dx)<1e-6){if(x<left||x>right)continue;}else{const a=(left-x)/dx,b=(right-x)/dx;lo=Math.max(0,Math.min(a,b));hi=Math.min(1,Math.max(a,b));if(hi<=lo)continue;}for(const t of[lo,hi])for(let k=0;k<3;k++)points.push(vertices[j+k]+(vertices[j+3+k]-vertices[j+k])*t);}
   const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(points,3));const fragment=new T.LineSegments(geo,net.material);fragment.visible=false;fragment.userData.burstSide=panel===0?-1:1;goal.add(fragment);pieces.push(fragment);
   const bar=stage.box((panel-1)*2.54,2.1,0,2.5,.13,.13,'#fff4da',goal);bar.visible=false;pieces.push(bar);
  }
  g.userData.burst={intact,pieces:pieces.map((part,i)=>({part,position:part.position.clone(),rotation:part.rotation.clone(),scale:part.scale.clone(),side:part.userData.burstSide??(part.position.x===0?(i%2?-1:1):Math.sign(part.position.x))})),originalCount};
 }
 // Construct reusable runner visuals once; no geometry creation during play.
 if(kind==='runner')for(let i=0;i<26;i++)decorate(runnerObjects[i],i<6?'defender':i<12?'cone':i<24?'coin':'goal');
 function fit(){stage.fit(kind==='pinball'?12.8:kind==='tennis'?(stage.mobile?11.05:11.4):10,kind==='pinball'?21.2:kind==='tennis'&&stage.mobile?17.1:17.6,kind==='runner',kind==='tennis');cameraHome.copy(stage.camera.position);cameraRotation.copy(stage.camera.quaternion);cinema=0;}
 function reset(){if(kind==='tennis'){resetTennis(tennis);beginTennis(tennis);tennisReadAt=0;tennisTrailCount=0;tennisTrailClock=0;tennisPoseRest=0;ball.rotation.set(0,0,0);}else if(kind==='pinball'){Object.assign(pinball,createPinballState());pinballTrailCount=pinballTrailHead=0;pinballWasPlaying=false;pinballRoll=pinballSave=pinballSaveEvent=0;pinballPatrol.fill(0);pinballImpact=pinballImpactEvents=pinballImpactClock=0;canvas.style.transform="";}else Object.assign(runner,createRunnerGame());elapsed=event=0;cinema=cinemaKick=pointSound=chargeTone=cameraFocus=0;notedLevel=1;cameraBeat(0);stage.resetPlayers();}
 function action(id:number){if(kind==='tennis')requestTennisKick(tennis,undefined,(['auto','lob','drop','header','scissor'] as TennisShot[])[id]??'auto');else if(kind==='pinball'){if(id===0||id===1)tapPinballFlipper(pinball,id);else if(pinball.phase==='ready')launchPinball(pinball);else if(id===2&&nudgePinball(pinball))onSound(false,'nudge');}else if(id===3)runnerCharge(runner,true);else if(id===4)runnerRelease(runner);else if(id===5)runnerCharge(runner,false);else if(id===0)runnerShoot(runner);else if(id===1)runnerJump(runner);else runnerSlide(runner);}
 function target(x:number,y:number){const p=stage.pick(x,y);if(p&&kind==='tennis'){if(p.z<0)tennis.shotAim=T.MathUtils.clamp(p.x/3.7,-1,1);else setTennisTarget(tennis,p.x,p.z);}}
 function update(dt:number,input:ArcadeInput){elapsed+=dt;
  if(kind==='tennis'){
   setTennisMovement(tennis,input.x,input.y);tickTennis(tennis,cinema>0&&!stage.reduced?dt*.32:dt);
   if(tennis.kickCount!==cinemaKick){cinemaKick=tennis.kickCount;if(!stage.reduced&&tennis.lastKicker==='you'&&['slam','scissor'].includes(tennis.lastShot))cinema=.62;}
   const points=tennis.score.you+tennis.score.rival;if(points!==pointSound){pointSound=points;onSound(tennis.pointWinner==='you',tennis.pointWinner==='you'?'goal':'miss');}
  }else if(kind==='pinball')stepPinball(pinball,{left:input.left,right:input.right,charge:input.charge},dt);
  else{if(input.x)runner.lane=T.MathUtils.clamp(Math.round(input.x),-1,1);tickRunner(runner,dt);}
  const level=kind==='runner'?runner.level:kind==='pinball'?pinball.level:tennis.level;if(level>notedLevel)onSound(true,'level');notedLevel=level;
  const tone=kind==='runner'&&runner.charging?Math.floor(runner.charge*3):0;if(tone>chargeTone)onSound(false,'charge'+tone);chargeTone=tone;
  sync(kind==='tennis'&&cinema>0&&!stage.reduced?dt*.32:dt);cameraBeat(dt);stage.effects(dt);stage.lighting(elapsed);
 }
 function sync(dt:number){
  if(kind==='tennis'){
   const b=tennis.ball;
   for(let i=0;i<2;i++){
    const p=i?tennis.rival:tennis.you,rig=players[i],speed=Math.hypot(p.vx,p.vy),remaining=p.kick/p.kickSpan;
    // Contact starts at full extension; load comes from the visible incoming ball,
    // then a smooth recovery keeps the strike facing stable as the ball leaves.
    const follow=remaining*remaining*(3-2*remaining),receiving=tennis.phase==='rally'&&b.last===(i?'you':'rival');
    const distance=Math.hypot(b.x-p.x,b.y-p.y),anticipate=receiving?Math.max(0,1-distance/3.4)*Math.max(.15,1-Math.max(0,b.z-1.4)*.3):0;
    const looking=Math.atan2(b.x-p.x,b.y-p.y),travel=Math.atan2(p.vx,p.vy),home=i?0:Math.PI;
    const returnAngle=Math.atan2((i?0:tennis.shotAim*3.7)-p.x,(i?5.2:-5.2)-p.y),open=Math.max(0,1-distance/2)*.8;
    const receiveFacing=looking+Math.atan2(Math.sin(returnAngle-looking),Math.cos(returnAngle-looking))*open;
    const facing=p.kick>0?p.kickFacing:receiving?receiveFacing:speed>.5?travel:home;
    const pose=tennisPose[i];pose.vx=p.vx;pose.vz=p.vy;pose.anticipate=anticipate;pose.celebrate=tennis.phase==='point'&&tennis.pointWinner===(i?'rival':'you')?Math.max(0,1-tennis.phaseTime/.7):0;
    const scale=Math.max(.1,rig.root.scale.x);
    // Rig-local native reach: preserve lateral contact without overstretching
    // the planted leg for the arcade's generous edge-of-reach returns.
    pose.strikeX=T.MathUtils.clamp(p.kickContactX/scale,-.45,.45);pose.strikeZ=T.MathUtils.clamp(p.kickContactZ/scale,-.2,.9);
    pose.shotPower=p.kickPower;pose.actionKind=p.kickKind;
    const volley=tennisVolley[i];volley.kind=p.kickStyle===4?'scissor':'volley';volley.progress=(p.kickStyle===4?.33:.42)+(1-remaining)*(p.kickStyle===4?.67:.58);volley.side=p.kickContactX<0?-1:1;volley.height=T.MathUtils.clamp((p.kickHeight-.45)/1.25,0,1);
    pose.move=(p.kickStyle===2||p.kickStyle===4)&&p.kick>0?volley:undefined;
    pose.reaction=p.kickStyle===3&&p.kick>0?'header':undefined;pose.reactionProgress=.46+(1-remaining)*.54;
    pose.jumpProgress=p.kickStyle===3&&p.kick>0?.47+(1-remaining)*.53:undefined;pose.jumpHeight=p.kickStyle===3?Math.min(.42,Math.max(.1,p.kickHeight-1.8)):0;
    rig.root.position.x=p.x;rig.root.position.z=p.y;
    // The native volley plants its support foot; a second generic jump overlay
    // would bend those solved joints again and break the authored contact.
    rig.pose(dt,speed,facing,p.kickStyle>=3?0:follow*(p.kickStyle===0?.55:1),0,p.vx*.08,pose);
   }
   tennisPoseRest=Math.hypot(tennis.you.vx,tennis.you.vy,tennis.rival.vx,tennis.rival.vy)>.025||tennis.you.kick>0||tennis.rival.kick>0?.2:Math.max(0,tennisPoseRest-dt);
   glassFloor?.update(dt,ball.position.x,ball.position.z,0,Math.max(tennis.you.kick,tennis.rival.kick));
   const actionColor=tennis.perfectFlash>0?'#73fff1':tennis.lastShot==='scissor'?'#ff7659':tennis.lastShot==='header'?'#74d6f2':'#ffe084';
   if(actionColor!==tennisTrailColor){tennisTrailColor=actionColor;for(const dot of tennisTrail)(dot.material as T.MeshStandardMaterial).color.set(actionColor);}
   if(tennisImpact){tennisImpact.visible=!stage.reduced&&tennis.fxSlam>0;tennisImpact.position.set(tennis.fxSlamX,.05,tennis.fxSlamY);tennisImpact.scale.setScalar(1+(1-tennis.fxSlam/.65)*2);(tennisImpact.material as T.MeshBasicMaterial).color.set(actionColor);}
   ball.position.set(b.x,Math.max(.3,b.z+.13),b.y);ball.rotation.x=b.rot;ball.rotation.z+=b.wz*dt*.12;
   const squash=b.z<.5?Math.min(.22,b.squash*1.4):0;ball.scale.set(1+squash,1-squash,1+squash);
   if(tennis.kickCount!==event){event=tennis.kickCount;tennisTrailCount=0;tennisTrailClock=0;stage.burst(ball.position.x,ball.position.y,ball.position.z,tennis.lastShot==='slam'?1.5:tennis.lastShot==='drop'?.65:1);onSound(false,tennis.perfectFlash>0?'perfect':tennis.lastShot);}
   if(tennis.phase==='rally'&&dt>0){tennisTrailClock+=dt;if(tennisTrailClock>=1/30){tennisTrailClock%=1/30;const n=tennisTrailHead*3;tennisTrailPoints[n]=b.x;tennisTrailPoints[n+1]=b.z+.13;tennisTrailPoints[n+2]=b.y;tennisTrailHead=(tennisTrailHead+1)%14;tennisTrailCount=Math.min(14,tennisTrailCount+1);}}else if(tennis.phase!=='rally')tennisTrailCount=0;
   for(let i=0;i<14;i++){const dot=tennisTrail[i];dot.visible=!stage.reduced&&i<tennisTrailCount-1&&Math.hypot(b.vx,b.vy,b.vz)>2;if(dot.visible){const index=((tennisTrailHead-2-i+28)%14)*3;dot.position.fromArray(tennisTrailPoints,index);dot.scale.setScalar(.1*(1-i/14)*(tennis.lastShot==='scissor'?2:tennis.lastShot==='header'?1.35:tennis.lastShot==='slam'?1.6:1));}}
   if(tennisGuide&&tennisContact){
    tennisGuide.visible=tennis.phase==='rally'&&b.last==='rival';
    if(tennisGuide.visible&&tennis.clock>=tennisReadAt){const land=tennisReceivingPoint(tennis);tennisReadAt=tennis.clock+.1;tennisLandTime=land.time;tennisGuide.position.set(land.x,.035,land.y);}
    (tennisGuide.material as T.MeshBasicMaterial).color.set(b.bounces>0?'#73fff1':'#fff0af');
    tennisGuide.visible=tennisGuide.visible&&tennisGuide.position.z>0&&tennisGuide.position.z<8&&Math.abs(tennisGuide.position.x)<5;
    const aerial=canTennisScissor(tennis,'you'),heading=canTennisHeader(tennis,'you'),high=canTennisSlam(tennis,'you'),ready=high||canTennisKick(tennis,'you');tennisContact.visible=tennis.phase==='rally'&&b.last==='rival';tennisContact.position.set(tennis.you.x,.045,tennis.you.y);
    const perfect=canTennisPerfect(tennis);tennisContact.scale.setScalar(perfect?1.12:ready?1:.78);(tennisContact.material as T.MeshBasicMaterial).color.set(perfect?'#73fff1':aerial?'#ff7659':heading?'#74d6f2':high?'#ff8867':ready?'#ffe084':'#88b8a4');
    if(tennisCountdown){tennisCountdown.visible=tennisGuide.visible;tennisCountdown.position.copy(tennisGuide.position);tennisCountdown.position.y=.045;tennisCountdown.scale.setScalar(.25+Math.min(1,Math.max(0,tennisLandTime-(tennis.clock-tennisReadAt+.1)))*1.1);}
    if(tennisAim){tennisAim.visible=tennis.phase==='serve'||tennis.phase==='rally'&&b.last==='rival';tennisAim.position.x=tennis.shotAim*3.7;tennisAim.scale.setScalar(ready?1.2:1);}
    for(const mark of tennisAimMarks)mark.visible=tennis.phase!=='over';
   }
  }else if(kind==='pinball'){
   const speed=Math.hypot(pinball.ball.vx,pinball.ball.vy);
   pinballSave=Math.max(0,pinballSave-dt);if(pinball.sfx.keeper>pinballSaveEvent)pinballSave=.4;pinballSaveEvent=pinball.sfx.keeper;
   const b=pinball.ball,goalAge=pinball.phase==='goal'?1.5-pinball.timer:0,contact=stage.reduced?0:b.contact;
   ball.position.set(px(b.x),7/30,pz(b.y));
   if(goalAge>0&&!stage.reduced){ball.position.z-=.7*(1-Math.exp(-goalAge*12));ball.position.y+=Math.abs(Math.sin(goalAge*14))*.16*Math.exp(-goalAge*3);}
   // Orient the outer shell along contact/flight; roll the markings inside it.
   ball.rotation.set(0,-Math.atan2(contact>.2?b.contactY:b.vy,contact>.2?b.contactX:b.vx),0);
   pinballRoll+=speed*dt/7;pinballRolling.rotation.set(b.spin*.2,0,pinballRoll+b.spin*.3);
   const stretch=stage.reduced?0:Math.min(.13,speed/10000);
   ball.scale.set(1+stretch-contact*.22,1-stretch*.35+contact*.08,1-stretch*.35+contact*.15);
   const readyFoot=pinballReadyFoot(pinball),f=pinballFlippers(pinball);f.forEach((p,i)=>{const press=i?pinball.right:pinball.left,delta=press-flipperPrevious[i];if(dt>0){flipperSnap[i]=Math.max(flipperSnap[i]*Math.exp(-dt*14),Math.abs(delta)*2);flipperPrevious[i]=press;}
    const pulse=Math.min(1,flipperSnap[i]+pinball.flipperCooldown[i]*5),recoil=stage.reduced?0:Math.sin(pinball.flipperCooldown[i]*Math.PI*20)*pinball.flipperCooldown[i]*.35;
    flippers[i].position.set(px(p.x),.2+(stage.reduced?0:pulse*.035),pz(p.y));flippers[i].rotation.y=-p.angle;flippers[i].rotation.x=recoil;flippers[i].scale.y=1+(stage.reduced?0:pulse*.12);
    flipperLights[i].material.opacity=Math.min(1,.45+press*.35+pulse*.2+(readyFoot===i?.4:0));flipperPivots[i].position.set(px(p.x),.055,pz(p.y));flipperPivots[i].scale.setScalar(1+(stage.reduced?0:pulse*.4)+(readyFoot===i?.55:0));
   });
   for(let i=0;i<pinballGlow.length;i++){const pulse=stage.reduced?0:(Math.sin(elapsed*2.4-i*.7)+1)*.025+Math.max(flipperSnap[0],flipperSnap[1])*.07+pinballImpact*.1+pinball.plunger*.045;pinballGlow[i].material.opacity=.4+pulse*1.8;}

   const keeperPose=pinballPose[0],incoming=pinball.phase==='playing'&&b.vy<-100&&b.y<290;
   keeperPose.vx=pinball.phase==='playing'?pinball.keeperVelocity/30:0;keeperPose.anticipate=incoming?Math.max(0,1-(b.y-83)/220):0;keeperPose.stun=0;
   keeperPose.keeper=1;pinballDive.progress=1-pinball.keeperCommit/.65;pinballDive.dir=pinball.keeperDirection<0?-1:1;pinballStandingSave.progress=.3+(1-pinballSave/.4)*.7;keeperPose.dive=pinball.keeperCommit>0?pinballDive:pinballSave>0?pinballStandingSave:undefined;
   players[0].root.position.set(px(pinball.keeper),0,pz(83));players[0].pose(dt,Math.abs(keeperPose.vx)*2.4,0,0,0,0,keeperPose);
   const impacts=pinball.sfx.wall+pinball.sfx.bumper+pinball.sfx.flipper+pinball.sfx.keeper;
   if(dt>0){if(impacts>pinballImpactEvents)pinballImpact=Math.min(1,pinballImpact+.35+Math.min(1,b.contact)*.4);pinballImpactEvents=impacts;pinballImpact*=Math.exp(-dt*15);pinballImpactClock+=dt;}
   const shake=stage.reduced?0:pinballImpact;canvas.style.transform=shake>.005?`translate(${Math.sin(pinballImpactClock*107)*shake*2.5}px,${Math.cos(pinballImpactClock*91)*shake*1.6}px) rotate(${Math.sin(pinballImpactClock*73)*shake*.12}deg)`:'';
   const defenders=pinball.phase==='playing'?pinball.defenders:pinballDefenders(pinball.time,pinball.defs,pinball.defJoin,pinball.defs-1,pinball.defenders);
   for(let i=0;i<3;i++){const rig=players[i+1],ring=pinballBumpers[i],stars=pinballStars[i];stars.visible=false;rig.root.visible=ring.visible=i<defenders.length;if(i<defenders.length){
    const p=defenders[i],ai=pinball.defenderAI[i];if(pinball.phase!=='playing'){p.x+=ai.offset;if(ai.dazed>0){const t=Math.max(0,1-ai.dazed/.4),stand=t*t*(3-2*t);p.x=ai.hitX+(p.x-ai.hitX)*stand;p.y=ai.hitY+(p.y-ai.hitY)*stand;}}const block=ai.block>0?Math.sin(Math.PI*(1-ai.block/.38)):0,kick=Math.max(block,pinball.bumperCooldown[i]*6),x=px(p.x),z=pz(p.y),pose=pinballPose[i+1];
    pose.vx=dt>0&&pinballPatrol[i*2]!==0?(x-pinballPatrol[i*2])/dt:0;pose.vz=dt>0&&pinballPatrol[i*2+1]!==0?(z-pinballPatrol[i*2+1])/dt:0;pinballPatrol[i*2]=x;pinballPatrol[i*2+1]=z;
    pose.actionKind=pinball.cue==='attack'?'shot':'pass';pose.shotPower=pinball.cue==='attack'?.65:.2;
    pose.receive=pinball.possession===i?Math.max(0,(pinball.possessionTime-.4)/.32):0;pose.receiveProgress=1-pose.receive;
    pose.anticipate=pinball.possession===i?Math.min(1,1-pinball.possessionTime/.72):pinball.phase==='playing'?Math.max(0,1-Math.hypot(b.x-p.x,b.y-p.y)/100)*.6:0;pose.stun=ai.dazed>0?Math.min(1,ai.dazed):0;pose.strikeZ=.6/rig.root.scale.x;
    rig.root.position.set(x,0,z);rig.pose(dt,Math.min(7,Math.hypot(pose.vx,pose.vz)*3),ai.block>0||pinball.possession===i?ai.aim:Math.hypot(pose.vx,pose.vz)>.08?Math.atan2(pose.vx,pose.vz):Math.atan2(ball.position.x-x,ball.position.z-z),ai.dazed>0?0:kick,0,pose.vx*.12,pose);
    if(ai.dazed>0){const fall=Math.min(1,(2-ai.dazed)/.13,ai.dazed/.4);rig.root.rotation.y=ai.fallYaw;rig.body.rotation.x=-fall*1.4;rig.body.position.y+=fall*.15;rig.legs[0].knee.rotation.x+=fall*.5;rig.legs[1].knee.rotation.x+=fall*.8;ring.visible=false;
     rig.finalizePose();stars.visible=true;rig.head.getWorldPosition(stars.position);stars.position.y+=.35;
     for(let j=0;j<3;j++){const star=stars.children[j],a=j*Math.PI*2/3+(stage.reduced?0:pinball.time*3);star.position.set(Math.cos(a)*.4,stage.reduced?0:Math.sin(a*2)*.07,Math.sin(a)*.22);star.rotation.set(-.65,0,stage.reduced?0:pinball.time*1.5+j);star.scale.setScalar(Math.min(1,ai.dazed/.25));}
    }
    const owns=pinball.possession===i;(ring.material as T.MeshBasicMaterial).color.setHex(owns?0xfff18a:(pinball.passTarget===i||pinball.possession>=0&&pinball.attackReceiver===i)?0x83fff1:0xedaa87);
    ring.position.set(x,.035,z);ring.scale.setScalar(1+(stage.reduced?0:owns?.12+Math.sin((1-pinball.possessionTime/.72)*Math.PI)*.12:kick*.22));
   }}
   if(!stage.reduced&&pinballNet&&pinballNetBase&&(goalAge>0||pinballNetDirty)){
    const positions=pinballNet.geometry.attributes.position as T.BufferAttribute,netHit=stage.reduced?0:Math.sin(Math.min(1,goalAge/.18)*Math.PI*.5)*Math.exp(-goalAge*3);
    for(let i=0;i<positions.count;i++){const j=i*3,x=pinballNetBase[j],y=pinballNetBase[j+1],z=pinballNetBase[j+2],weight=Math.max(0,1-Math.abs(x-px(b.x))/2.4)*Math.max(0,1-y/2.2);positions.setZ(i,z-(z<-.5?netHit*weight*.65:0));}
    positions.needsUpdate=true;pinballNetDirty=goalAge>0;
   }
   if(pinballFloor){
    // One bounded instanced surface; smooth pulses retain the ball/line contrast.
    if(dt>0){if(pinballImpact>.2&&floorWave<=0){floorWave=1;floorHitX=ball.position.x;floorHitZ=ball.position.z;}floorWave=Math.max(0,floorWave-dt*1.5);}
    for(let row=0;row<14;row++)for(let col=0;col<8;col++){const index=row*8+col,x=-.25+(col-3.5)*10.5/8,z=-.1+(row-6.5)*18.5/14;
     const nearBall=pinball.phase==='playing'?Math.max(0,1-Math.hypot(x-ball.position.x,z-ball.position.z)/2.3)*.32:0;
     const ripple=stage.reduced?0:floorWave*Math.max(0,1-Math.abs(Math.hypot(x-floorHitX,z-floorHitZ)-(1-floorWave)*10)/1.6)*.65;
     const left=Math.max(0,1-Math.hypot(x+2.7,z-7.5)/6)*Math.min(1,pinball.left*.4+flipperSnap[0]),right=Math.max(0,1-Math.hypot(x-2.7,z-7.5)/6)*Math.min(1,pinball.right*.4+flipperSnap[1]);
     const charge=pinball.phase==='ready'&&row>=14-Math.ceil(pinball.plunger*14)?pinball.plunger*.5:0;
     const goal=pinball.phase==='goal'?(stage.reduced?.25:(.5+.5*Math.sin(elapsed*5-row*.55))*.5):0;
     const energy=Math.min(.8,nearBall+ripple+left+right+charge+goal);floorEnergy[index]+=(energy-floorEnergy[index])*(dt>0?1-Math.exp(-dt*12):1);
     floorColor.copy(floorBase).lerp(charge>0||goal>0?floorGold:right>left?floorPink:floorCyan,floorEnergy[index]);pinballFloor.setColorAt(index,floorColor);
    }pinballFloor.instanceColor!.needsUpdate=true;
   }
   const chance=pinball.moveTime>0,celebrating=pinball.phase==='goal';
   for(const target of pinballTargets){target.scale.setScalar(chance?1.45:1);target.position.y=chance?.08:.035;(target.material as T.MeshBasicMaterial).color.set(chance?'#ffd35d':'#fff0cf');}
   const lit=celebrating?3:chance?2:pinball.combination>0?1:0;
   for(let i=0;i<3;i++)pinballLamps[i].visible=i<lit;
   for(let i=0;i<7;i++)pinballCharge[i].visible=pinball.phase==='ready'&&i<Math.ceil(plungerPull(pinball.plunger)*7);
   if(pinballPlunger)pinballPlunger.position.z=pz(585+pinball.plunger*11-pinball.plungerSnap*6);
   if(pinballTrail){
    const playing=pinball.phase==='playing';if(!playing||!pinballWasPlaying)pinballTrailCount=pinballTrailHead=0;
    if(playing&&dt>0){const j=pinballTrailHead*3;pinballTrailPoints[j]=px(pinball.ball.x);pinballTrailPoints[j+1]=.2;pinballTrailPoints[j+2]=pz(pinball.ball.y);pinballTrailHead=(pinballTrailHead+1)%6;pinballTrailCount=Math.min(6,pinballTrailCount+1);}
    pinballWasPlaying=playing;pinballTrail.count=playing&&speed>350&&!stage.reduced?Math.min(stage.mobile?3:6,pinballTrailCount):0;
    for(let i=0;i<pinballTrail.count;i++){const j=((pinballTrailHead-1-i+6)%6)*3;pinballTrailMatrix.position.fromArray(pinballTrailPoints,j);pinballTrailMatrix.scale.setScalar((7/30)*(1-(i+1)/8));pinballTrailMatrix.updateMatrix();pinballTrail.setMatrixAt(i,pinballTrailMatrix.matrix);}if(pinballTrail.count)pinballTrail.instanceMatrix.needsUpdate=true;
   }
   if(event!==pinball.hitId){event=pinball.hitId;stage.burst(px(pinball.hitX),.4,pz(pinball.hitY),pinball.phase==='goal'?2:pinball.cue==='strike'?1.3:pinball.cue==='control'?.25:pinball.cue==='pass'?.45:1);onSound(pinball.phase==='goal',pinball.phase==='goal'?'goal':pinball.cue);}
  }else{
   stage.scrollScenery(runner.distance);if(glassFloor){glassFloor.root.position.z=-24+runner.distance%(76/32);glassFloor.update(dt,runner.x,-.5,runner.charge,runner.kick);}if(runnerLaneMarks)runnerLaneMarks.position.z=runner.distance%4;strips.forEach((m,i)=>m.position.z=7-i*4+runner.distance%4);
   players[0].root.position.x=runner.x;
   const kick=runner.kick>0?Math.sin(runner.kick/.3*Math.PI/2):0;
   runnerPose.dribbling=runner.balls>0&&!runner.charging&&runner.kick<=0&&runner.y<.05&&runner.slidePose<.1;runnerPose.charge=runner.charge;runnerPose.stride=runner.stride;runnerPose.vx=runner.vx;runnerPose.vz=runner.boost>0?-8:-6;runnerPose.slide=runner.slidePose;
   runnerVolley.progress=1-runner.kick/.3;runnerVolley.height=runner.y*.65+.4;runnerPose.move=runner.lastVolley&&runner.kick>0?runnerVolley:undefined;
   runnerPose.jumpProgress=runner.jumping?.24+.46*T.MathUtils.clamp((JUMP_V-runner.vy)/(2*JUMP_V),0,1):runner.landing>0?.7+.3*(1-runner.landing/.2):undefined;
   runnerPose.anticipate=Math.max(runner.jumpPrep/.09,runner.landing/.2)*.7;runnerPose.stun=runner.hurt>0?Math.max(0,(runner.hurt-.9)/.3):0;runnerPose.celebrate=runner.celebrate;
   players[0].pose(dt,runner.lives?(runner.boost>0?8:6)*(1-runner.slidePose*.85)*(1-kick*.5):0,Math.PI-Math.atan2(runner.vx,22)*.25,kick,runner.y*.65,runner.lean,runnerPose);
   // Recovery stays visible; weight and the stagger pose communicate the hit.
   players[0].root.visible=true;
   if(runnerAimEnd){runnerAimEnd.visible=runner.charging;runnerAimEnd.position.set(runner.x,.04,-.8);runnerAimEnd.scale.setScalar(1+runner.charge*.9);}
   const touch=Math.sin(runner.stride),push=(1-Math.cos(runner.stride*2))*.5;
   ball.visible=runner.balls>0&&runner.kick<.14;ball.scale.setScalar(1+runner.charge*.16);
   ball.position.set(runner.x+touch*.15*(1-runner.slidePose),.24+push*.09+runner.y*.18,-.66-push*.32-runner.slidePose*.45);if(runnerPose.dribbling){players[0].dribbleContact(runnerDribble);ball.position.x=runnerDribble.x;ball.position.z=runnerDribble.z;}if(runner.charging){const load=Math.min(1,runner.charge*8);ball.position.x=T.MathUtils.lerp(ball.position.x,runner.x+RUNNER_STRIKE_X,load);ball.position.z=T.MathUtils.lerp(ball.position.z,-.9,load);}ball.rotation.x=-runner.distance/.22;ball.rotation.z=-runner.x/.22;
   if(runnerShotTrail)runnerShotTrail.count=0;
   runnerShots.forEach((mesh,i)=>{const shot=runner.shots[i];mesh.visible=shot.active;if(shot.active){
    const height=.28+Math.max(0,(shot.height??.28)-.28)*(1-Math.min(1,shot.age/1.8))+Math.sin(Math.min(1,shot.age/1.8)*Math.PI)*.3;mesh.position.set(shot.x,height,shot.z);mesh.rotation.x+=dt*(shot.returning?35:-35);mesh.scale.setScalar(1+(shot.returning?.2:(shot.blast??0)*.95));
    if(runnerShotTrail&&!stage.reduced&&!shot.returner)for(let j=0;j<(stage.mobile?3:5);j++){const behind=(j+1)*.38*(shot.returning?-1:1);if(!shot.returning&&shot.z+behind>-.9)continue;runnerShotMatrix.position.set(shot.x,height,shot.z+behind);runnerShotMatrix.scale.setScalar((.16+(shot.blast??0)*.3)*(1-j/6));runnerShotMatrix.updateMatrix();runnerShotTrail.setMatrixAt(runnerShotTrail.count++,runnerShotMatrix.matrix);}
   }});
   if(runnerShotTrail&&runnerShotTrail.count)runnerShotTrail.instanceMatrix.needsUpdate=true;
   runnerObjects.forEach(g=>g.visible=false);used.clear();
   for(const o of runner.objects){const g=runnerObjects.find(g=>!used.has(g)&&poolKinds.get(g)===o.kind);if(!g)continue;used.add(g);g.visible=true;g.rotation.set(0,0,0);g.scale.setScalar(1);g.position.set(o.x??o.lane*2.4,0,o.z);
    if(o.knock){const k=1-o.knock/.65,side=o.lane<0?-1:1;g.position.x+=side*k*4;g.position.y=Math.sin(k*Math.PI)*1.1;g.rotation.z=side*k*2.5;g.scale.setScalar(1-k*.6);}else if(o.passed&&o.kind!=='goal'&&!(o.kind==='defender'&&(o.tackle??0)>0&&(o.tackle??0)<1.05)){g.visible=false;continue;}
    if(o.kind==='coin'){g.rotation.y=elapsed*2;g.position.y=Math.sin(elapsed*4+o.z)*.07;}
    if(o.kind==='goal'&&o.z>1){g.visible=false;continue;}
    if(o.kind==='goal'){const burst=g.userData.burst,age=o.goalBurst??0;for(const part of burst.intact)part.visible=!o.scored;for(let bi=0;bi<burst.pieces.length;bi++){const p=burst.pieces[bi],part=p.part;part.position.copy(p.position);part.rotation.copy(p.rotation);part.scale.copy(p.scale);part.visible=o.scored?age<1.2:bi<burst.originalCount;if(o.scored){const fly=stage.reduced?.12:age;part.position.x+=p.side*fly*(6+bi*.17);part.position.y+=stage.reduced?0:Math.sin(Math.min(1,age/1.2)*Math.PI)*(1.4+(bi%3)*.35);part.position.z-=fly*(1.4+bi%3);if(!stage.reduced){part.rotation.z+=p.side*age*(1.3+bi*.13);part.rotation.x+=age*(bi%2?-.7:.7);}part.scale.multiplyScalar(Math.max(.05,1-Math.max(0,age-.75)*1.8));}}if(o.scored&&age>=1.2){g.visible=false;continue;}const caught=g.userData.caught as T.Group;caught.visible=!!o.scored&&(o.netHit??0)>0;if(caught.visible){const age=.65-(o.netHit??0);caught.position.set(o.hitX??0,.25+Math.sin(age/.65*Math.PI)*.28,-.3-Math.sin(Math.min(1,age/.25)*Math.PI/2)*.65);caught.rotation.x+=dt*12;}if(g.userData.net&&((o.netHit??0)>0||g.userData.netDirty)){const net=g.userData.net as T.LineSegments,attr=net.geometry.attributes.position as T.BufferAttribute,base=g.userData.netBase as Float32Array,hit=o.netHit??0;for(let n=0;n<attr.count;n++){const j=n*3,weight=Math.max(0,1-Math.abs(base[j]-(o.hitX??0))/2);attr.setZ(n,base[j+2]-(stage.reduced?0:Math.sin((.65-hit)*20)*hit*.65*weight));}attr.needsUpdate=hit>0||g.userData.netDirty;g.userData.netDirty=hit>0;}const aperture=g.getObjectByName('open-lane')!;aperture.visible=!o.scored;aperture.position.x=o.openLane*2.4;aperture.scale.setScalar(!stage.reduced&&!o.scored&&o.z> -22&&o.z< -8?1+Math.sin(elapsed*8)*.05:1);g.scale.z=o.scored?1+Math.sin(runner.celebrate*20)*runner.celebrate*.12:1;for(const lane of[-1,0,1]){const keeper=g.getObjectByName(`blocked-${lane}`)!;keeper.visible=lane!==o.openLane&&!o.scored;if(keeper.visible){const save=Math.abs(lane*2.4-(o.hitX??99))<1.2?(o.reaction??0):0;const pose=keeper.userData.blockPose,skill=keeper.userData.blockSkill;skill.progress=.36+(1-save/.5)*.64;pose.skill=save>0?skill:undefined;keeper.userData.rig.pose(dt,0,Math.atan2(runner.x-lane*2.4,-o.z),0,0,0,pose);}}}
    if(o.kind==='defender'&&!o.knock){const role=o.role??'jockey',rig=g.userData.rig,pose=g.userData.pose??(g.userData.pose={vx:0,vz:0,anticipate:0,slide:0}),t=o.tackle??0,attack=t>.08&&t<.7?1:t>0&&t<=.08?t/.08:t>=.7?Math.max(0,1-(t-.7)/.35):0;
     if(g.userData.role!==role){rig.setDress(runnerDresses![role]);g.userData.role=role;}
     rig.root.scale.setScalar(1); // Bean build provides the silhouette without distorting its leg solver.
     const tackleSkill=g.userData.tackleSkill??(g.userData.tackleSkill={type:'pokeTackle',progress:0,side:1});tackleSkill.type=role==='sweeper'?'blockTackle':'pokeTackle';tackleSkill.side=o.lane>0?-1:1;
     // Front-load the foot extension into the collision tell, hold through its
     // active reach, then recover with the same .7–1.05 s simulation window.
     tackleSkill.progress=t<.08?t/.08*.34:t<.7?.34+(t-.08)/.62*.2:.54+Math.min(1,(t-.7)/.35)*.46;pose.skill=t>0&&t<1.05&&role!=='tackler'?tackleSkill:undefined;
     const held=runner.shots.find(shot=>shot.active&&shot.returner===o);pose.charge=held?Math.min(1,1-(held.windup??0)/.3)*.55:0;pose.actionKind='pass';pose.shotPower=.6;pose.strikeX=.2;pose.strikeZ=.6;if(held||(o.returnKick??0)>0)pose.skill=undefined;
     pose.vx=o.vx??0;pose.vz=0;pose.jockey=.8;pose.anticipate=(o.read??0)<(role==='tackler'?.65:.5)?(o.reaction??0)*.9:0;pose.slide=role==='tackler'?Math.max(attack*.95,pose.anticipate*.3):0;
     rig.pose(dt,Math.abs(o.vx??0),(held||(o.returnKick??0)>0)?(o.returnAim??0):Math.atan2((runner.x-(o.x??o.lane*2.4))*.3,Math.max(4,-o.z)),(o.returnKick??0)/.46,0,(o.vx??0)*.2,pose);
     // The island slide solver now lowers the bean, extends its leading boot and
     // grounds every limb. Post-solver hip/torso edits bypass that ground guard.
     rig.root.position.z=role==='tackler'?attack*.7:0;
     if(t>.7)g.position.x+=Math.sign(o.lane||1)*Math.min(1,(t-.7)/.35)*.55;
     g.userData.warning.scale.set(role==='sweeper'?1+attack*.5:1,role==='tackler'?1+attack*1.3:1,1);g.userData.warning.visible=o.read!==undefined&&!o.passed;
    }
   }
   runnerBlastAge=Math.max(0,runnerBlastAge-dt);runnerBlastRings.forEach((ring,i)=>{ring.visible=runnerBlastAge>0&&!stage.reduced;const t=1-runnerBlastAge/.6;ring.scale.setScalar(.5+t*(2+runnerBlastPower*5)*(i? .75:1));ring.material.opacity=(1-t)*.8;});
   if(event!==runner.event){event=runner.event;if(['shot','clear','goal'].includes(runner.eventKind)&&runner.lastBlast>.25){runnerBlastAge=.6;runnerBlastPower=runner.lastBlast;for(const ring of runnerBlastRings)ring.position.set(runner.eventX,.08,runner.eventZ);}stage.burst(runner.eventX,.4,runner.eventZ,runner.eventKind==='goal'?2:['shot','clear'].includes(runner.eventKind)&&runner.lastBlast>=.8?3:1);onSound(runner.eventKind==='goal',runner.eventKind);}

  }
  shadow.visible=ball.visible;shadow.position.set(ball.position.x,.04,ball.position.z);const h=ball.position.y;shadow.scale.setScalar(1+h*.2);(shadow.material as T.MeshBasicMaterial).opacity=.3/(1+h*.4);
 }
 function hud():ArcadeHUD{if(kind==='tennis')return{nextLabel:tennis.winner==='you'?(tennis.level<5?'Next court':'Defend the title'):'Retry court',score:`${tennis.score.you} : ${tennis.score.rival}`,headerReady:canTennisHeader(tennis,'you'),scissorReady:canTennisScissor(tennis,'you'),detail:tennis.phase==='over'?`Court ${tennis.level} · ${TENNIS_COURTS[tennis.level-1].name} · ${tennis.cleanReturns} returns · best rally ${tennis.bestRally}`:canTennisPerfect(tennis)?'PERFECT WINDOW · kick now':canTennisScissor(tennis,'you')?(canTennisHeader(tennis,'you')?'HIGH BALL · Header or Scissor':'SCISSOR · strike the dropping ball'):canTennisHeader(tennis,'you')?'HEADER · meet it above you':canTennisSlam(tennis,'you')?'HIGH BALL · Volley now':canTennisKick(tennis,'you')?'IN REACH · Plant & kick':`Court ${tennis.level} · Rally ${tennis.rally} · Aim ${tennis.shotAim<-.25?'left':tennis.shotAim>.25?'right':'middle'}`,message:tennis.message,over:tennis.phase==='over',ready:tennis.phase==='serve'&&tennis.server==='you'};if(kind==='pinball')return{leftReady:pinballReadyFoot(pinball)===0,rightReady:pinballReadyFoot(pinball)===1,nudgeReady:pinball.phase==='playing'&&pinball.nudges>0&&pinball.nudgeCooldown<=0&&pinball.ball.x<341,score:String(pinball.score),detail:`DIV ${pinball.level} · ${pinball.goals} goals · ${pinball.balls} balls`,message:pinball.cue==='rescue'?'BALL SAVED · a fresh launch. Wait for the ball to reach your flipper.':pinball.phase==='ready'?(pinball.plunger>.02?`Launch power · ${Math.round(plungerPull(pinball.plunger)*100)}%`:`${pinballDivision(pinball).name} · ${pinballDivision(pinball).objective}`):pinball.phase==='goal'?`${pinball.lastChallengeBonus?`CHALLENGE +${pinball.lastChallengeBonus} · `:''}${pinball.lastGoalBonus?'MOVE COMPLETE':pinball.cue==='corner'?'CORNER FINISH':'GOAL'}! +${pinball.lastGoalPoints} · ${pinball.lastGoalBonus?'Both feet made that chance.':pinball.defs<3?'Another defender joins.':'You beat the back three!'}`:pinball.phase==='lost'?(pinball.cue==='concede'?'RIVAL GOAL · read the wind-up and time your return.':'Find your timing: let the ball reach the flipper before you strike.'):pinball.cue==='nudge'?'NUDGE! Switch flippers to earn another rescue.':pinball.cue==='dazed'?'DEFENDER DAZED · attack the open space!':pinball.cue==='block'?'FOOT BLOCK · switch the angle.':pinball.cue==='control'?'DEFENDER IN CONTROL · watch the next pass.':pinball.cue==='pass'?'ONE–TWO · get your flippers ready!':pinball.cue==='attack'?'COUNTER SHOT · time your return!':pinball.moveTime>0?`FINISH! ${Math.ceil(pinball.moveTime)}s · Lit goal +${750+Math.min(3,pinball.moves)*250} · Corners +150`:pinball.cue==='save'?'SAVED! Aim for the gold pockets beside the posts.':pinball.cue==='strike'?(pinball.combination>1?`${pinball.combination}× COMBINATION! +${pinball.combination*25} · Alternate feet to keep the move alive.`:'BUILD! Use the other flipper to light the goal.'):'BUILD → SWITCH → FINISH · Link both feet, then score.',over:pinball.phase==='over',ready:pinball.phase==='ready'};const threat=runner.objects.find(o=>o.kind==='defender'&&!o.passed&&o.z> -24&&Math.abs(runner.x-(o.x??o.lane*2.4))<1.4);return{score:String(runner.score),detail:`${runner.lives} chances · ⚽ ${runner.balls}/5 · ${runnerMultiplier(runner)>1?`×${runnerMultiplier(runner)} CLEAN RUN`:`${Math.floor(runner.distance)} m`} · ${runner.boost>0?'POWER RUN':`STAGE ${runner.level} · ${runner.stageName}`}`,message:runner.shots.some(p=>p.active&&(p.returner||p.returning))?'RETURN BALL · jump or change lanes':runner.charging?(runner.charge>=.8?'BLAST READY · release to break through':`HOLD TO CHARGE · ${Math.round(runner.charge*100)}%`):threat?(threat.role==='tackler'?'CORAL TACKLER · jump, shoot or cut away':threat.role==='sweeper'?'BLUE SWEEPER · change lanes or slide past':'PURPLE JOCKEY · shoot or slip past'):runner.objects.some(o=>o.kind==='goal'&&!o.passed&&o.z> -22&&o.z< -8&&Math.abs(runner.x-o.openLane*2.4)<.65)?'FINISH NOW · timed shots earn +150':runner.message,over:runner.lives<=0,ready:false};}
 sync(0);fit();stage.render();return{needsFrames:()=>cinema>0||stage.effectsActive()||(kind==='tennis'?(tennisNeedsFrames(tennis)||tennis.phase==='serve'&&tennisPoseRest>0):kind==='pinball'?(pinball.phase!=='ready'&&pinball.phase!=='over'||pinball.defJoin>0||pinball.defenderAI.some(ai=>ai.dazed>0)||pinball.flipperPulse[0]>0||pinball.flipperPulse[1]>0||pinball.plunger>.002||pinball.plungerSnap>.002||pinball.left>.004||pinball.right>.004||flipperSnap.some(value=>value>.005)||floorWave>0||floorEnergy.some(value=>value>.005)):runner.lives>0),stage,update,reset,action,target,hud,fit,state:{tennis,pinball,runner}};
}
