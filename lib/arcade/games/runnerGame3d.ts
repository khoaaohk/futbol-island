/** Breakaway Run 3D runtime (scene dressing, per-frame sync, camera beats, HUD read). Owned by the Breakaway Run builder, together with
 * lib/arcade/looks/runner.ts. Split out of lib/arcade/arcadeGames.ts on Nov 10 2026 by constant-folding `kind`; behaviour unchanged.
 * The returned object must keep the shape components/games/ArcadeGame3D.tsx reads (state.{tennis,pinball,runner}, action, reset,
 * hud, fit, update, charge*, pinballCamera/pinballCinema, dispose): that is why idle states of the other two games are still built. */
import * as T from 'three';
import {createArcadeStage} from '../arcadeStage';
import {runnerLook} from '../looks/runner';
import type {ArcadePoseOptions} from '../arcadePlayerMotion';
import {sideGameDress,teamBodyColour,type BeanDress} from '../../town/beanLooks';
import {createTennis} from '@/lib/games/soccerTennis';
import {createPinballState} from '@/lib/games/soccerPinball';
import {createPinballCinema} from '@/lib/games/soccerPinballCinema';
import {JUMP_V} from '../../../components/games/runnerPhysics';
import {createRunnerGame,freshRunnerSeed,setRunnerSeedSource,tickRunner,runnerJump,runnerSlide,runnerShoot,runnerCharge,runnerRelease,runnerOutro,runnerSkill,RUNNER_STRIKE_X,RUNNER_OUTRO,RUNNER_PRESS_SPEED} from '../runnerGame';
import {runnerHud} from '../runnerHud';
import {tickRunnerMissions} from '../runnerMissions';
import {selectRunnerMode,type RunnerModeId} from '../runnerModes';
import {tickRunnerCoach} from '../runnerCoach';
import {createRunnerFx} from '../runnerFx';
import {inkedPart,bakeParts,partAt} from '../runnerTrack';
import {comicStarGeometry} from '../comic/ink';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {RUNNER_INK,RUNNER_PAPER} from '../looks/runner';
import {createRunnerSoundtrack} from '../../../components/games/runnerAudio';
import type {ArcadeInput,ArcadeHUD} from '../arcadeGameTypes';
export function createRunnerGame3d(canvas:HTMLCanvasElement,onSound:(goal:boolean,cue?:string)=>void,audioContext:()=>AudioContext|null=()=>null){
 // Nov 10 2026: every browser session plays fresh courses (tests keep the deterministic default seeds): tennis starts from a random
 // seed, Breakaway runs ask freshRunnerSeed, and the tennis/pinball cabinets build an idle runner that never uses a run id.
 setRunnerSeedSource(freshRunnerSeed);
 const stage=createArcadeStage(canvas,runnerLook),tennis=createTennis(freshRunnerSeed()),pinball=createPinballState(),runner=createRunnerGame({});
 const ball=stage.football(((.22)));let elapsed=0,event=0;
 const cameraHome=new T.Vector3(),cameraRotation=new T.Quaternion(),shotLook=new T.Vector3(),shotCamera=new T.Vector3(),shotRotation=new T.Quaternion();let cinema=0,cinemaKick=0,pointSound=0,cameraFocus=0,chargeTone=0,notedLevel=1,freeze=0;
 function cameraBeat(dt:number){const camera=stage.camera;cinema=Math.max(0,cinema-dt);let focus=0;/* round 3: lib/arcade/tennisCinema.ts owns the tennis beats (reduced motion → 0) */if(!stage.reduced){focus=T.MathUtils.clamp((runner.charge-.2)/.8,0,1)*.65;}
  camera.position.copy(cameraHome);camera.quaternion.copy(cameraRotation);
  cameraFocus=dt>0?T.MathUtils.damp(cameraFocus,focus,10,dt):0;focus=cameraFocus;
  // Tennis push-in: a small dolly toward the action (≤10%, no FOV punch), then the 3/4 close-up below.
  
  if(focus>0){const x=(runner.x),z=(0);shotLook.set(x,.9,z);shotCamera.set(x+7,7,z+10);
   // Tennis strike beat: a closer 3/4 shot behind your shoulder; the look target whips from you to the ball as it leaves.
   camera.position.lerp(shotCamera,focus*.78);camera.lookAt(shotLook);shotRotation.copy(camera.quaternion);camera.quaternion.copy(cameraRotation).slerp(shotRotation,focus);}
  camera.updateMatrixWorld();
 }
 const players=[stage.player('#efbd58',sideGameDress('arcade-0','home')),...[1,2,3].map(i=>stage.player('#b492d0',sideGameDress('arcade-'+i,'away')))];
 players.forEach(p=>p.root.visible=false);
 const strips:T.Mesh[]=[],runnerObjects:T.Group[]=[],shadow=new T.Mesh(new T.CircleGeometry(.28,24),new T.MeshBasicMaterial({color:RUNNER_INK,transparent:true,opacity:.3,depthWrite:false}));shadow.rotation.x=-Math.PI/2;stage.scene.add(shadow);
 let tennisReadAt=0,tennisLandTime=0;
 const tennisTrailPoints=new Float32Array(42),tennisTrailM=new T.Matrix4(),tennisTrailP=new T.Vector3(),tennisTrailS=new T.Vector3(),tennisTrailQ=new T.Quaternion();let tennisTrailHead=0,tennisTrailCount=0,tennisTrailClock=0,tennisPoseRest=0;
 let beatPoint=0,beatMilestone=0,beatMatch=-1;
 const pinballGlow:T.Mesh<T.BufferGeometry,T.MeshBasicMaterial>[]=[],flipperLights:T.Mesh<T.BufferGeometry,T.MeshBasicMaterial>[]=[],flipperPivots:T.Mesh[]=[];
 const flipperPrevious=[0,0],flipperSnap=[0,0];
 const pinballCine=createPinballCinema(stage.reduced);
 const pinballTargets:T.Mesh[]=[],pinballBumpers:T.Mesh[]=[],pinballLamps:T.Mesh[]=[],pinballCharge:T.Mesh[]=[];let pinballTrailCount=0,pinballTrailHead=0,pinballWasPlaying=false;const pinballRolling=new T.Group(),pinballDive={progress:0,dir:1 as -1|1,height:0,kind:'side' as const,outcome:'parry' as const},pinballStandingSave={progress:0,dir:1 as -1|1,height:0,kind:'stand' as const,outcome:'parry' as const};let pinballImpact=0,pinballImpactEvents=0,pinballImpactClock=0;let pinballNetDirty=false,pinballRoll=0,pinballSave=0,pinballSaveEvent=0;
 const px=(x:number)=>(x-180)/30,pz=(y:number)=>(y-310)/30;
 
  ball.name='runner-ball';
  // The coast road itself (surface, painted lane dashes, kerbs, sea) is one mesh drawn by lib/arcade/runnerTrack.ts.
  players[0].root.visible=true;players[0].root.scale.setScalar(1.15);players[0].root.name='runner-player';players[0].useMainAppearance();players[0].root.userData.motion=players[0].motion;
  for(let i=0;i<30;i++){const g=new T.Group();g.visible=false;stage.scene.add(g);runnerObjects.push(g);}
 
 let runnerAimEnd:T.Mesh|undefined;
 {
  runnerAimEnd=stage.ring(0,-.8,.38,RUNNER_PAPER);runnerAimEnd.visible=false;
 }
 const runnerDribble=new T.Vector3();
 const runnerVolley:NonNullable<ArcadePoseOptions['move']>={kind:'volley',progress:0,side:1,height:1};
 const runnerPose={move:undefined as ArcadePoseOptions['move'],strikeX:-RUNNER_STRIKE_X/1.15,strikeZ:.9/1.15,jumpProgress:undefined as number|undefined,dribbling:true,charge:0,vx:0,vz:-6,slide:0,anticipate:0,stun:0,celebrate:0,stride:0};
 const runnerShotMatrix=new T.Object3D();let runnerShotTrail:T.InstancedMesh|undefined;
 runnerShotTrail=new T.InstancedMesh(new T.SphereGeometry(1,8,6),new T.MeshBasicMaterial({color:RUNNER_PAPER,transparent:true,opacity:.8,depthWrite:false}),20);runnerShotTrail.count=0;runnerShotTrail.frustumCulled=false;stage.scene.add(runnerShotTrail);
 let runnerBlastAge=0,runnerBlastPower=0;
 // Struck-ball impact: a comic star burst (ink star behind a sun-yellow one) that faces the camera. Two draws, only while it shows.
 const starGeo=comicStarGeometry();
 const runnerBlastRings=([RUNNER_INK,'#ffc83a'].map((color,i)=>{const ring=new T.Mesh(starGeo,new T.MeshBasicMaterial({color,transparent:true,depthWrite:false,side:T.DoubleSide}));ring.name='runner-blast-ring-'+i;ring.renderOrder=3+i;ring.visible=false;stage.scene.add(ring);return ring;}));
 const runnerShots=(runner.shots.map(()=>{const m=stage.footballMerged(.22);m.visible=false;return m;}));
 // Role colours belong to the visible bean outfit, not the hidden classic jersey.
 // Cache dresses once; pooled defenders only update appearance when their role changes.
 const runnerDresses=(Object.fromEntries((['jockey','tackler','sweeper','presser','wall','pair','line'] as const).map((role,i)=>{
  const dress=sideGameDress(`runner-${role}`,'away',i+2),shirt=['#9a6ae0','#f0452e','#2f8fd6','#19b5a5','#ffc83a','#e8569c','#4a4f72'][i];
  dress.outfit={...dress.outfit,shirt,shirt2:'#fff3d6',shorts:'#231a2e',socks:shirt};
  dress.look={...dress.look,body:teamBodyColour(dress.outfit),build:role==='tackler'?'wide':role==='sweeper'?'tall':'regular'};
  return[role,dress];
 })) as Record<'jockey'|'tackler'|'sweeper'|'presser'|'wall'|'pair'|'line',BeanDress>);
 const poolKinds=new Map<T.Group,string>(),used=new Set<T.Group>();
 function decorate(g:T.Group,type:string){if(poolKinds.get(g)===type)return;g.clear();poolKinds.set(g,type);if(type==='coin'){const m=new T.Mesh(coinGeo,coinMat);m.position.y=.38;g.add(m);const ring=stage.ring(0,0,.45,RUNNER_PAPER);stage.scene.remove(ring);g.add(ring);}else if(type==='cone'){const m=new T.Mesh(coneGeo,coneMat);m.castShadow=true;g.add(m);}else if(type==='defender'){const p=stage.player('#db7863',runnerDresses!.jockey);stage.scene.remove(p.root);g.add(p.root);g.userData.rig=p;const warning=stage.ring(0,0,.62,'#f0452e');stage.scene.remove(warning);g.add(warning);g.userData.warning=warning;const alert=new T.Mesh(alertGeo,alertMat);alert.name='runner-alert';alert.position.y=2.3;alert.renderOrder=4;alert.visible=false;g.add(alert);g.userData.alert=alert;}else{const goal=stage.goal(0,0,7.6);stage.scene.remove(goal);g.add(goal);const net=goal.children.find(c=>c instanceof T.LineSegments) as T.LineSegments;(net.material as T.LineBasicMaterial).color.set(RUNNER_PAPER);(net.material as T.LineBasicMaterial).opacity=.9;g.userData.net=net;g.userData.netBase=new Float32Array(net.geometry.attributes.position.array);prepareGoalBurst(g,goal,net);{const hull=inkHull(goal,.05);hull.name='goal-ink';g.add(hull);g.userData.ink=hull;}const caught=stage.footballMerged(.22);stage.scene.remove(caught);caught.visible=false;g.add(caught);g.userData.caught=caught;const marker=new T.Group();marker.name='open-lane';g.add(marker);for(const x of[-.86,.86])stage.box(x,.9,.06,.1,1.8,.1,'#ffc83a',marker).castShadow=false;stage.box(0,1.78,.06,1.8,.1,.1,'#ffc83a',marker).castShadow=false;stage.box(0,.025,1,1.7,.025,2,'#ffc83a',marker).castShadow=false;for(const lane of[-1,0,1]){const blocker=stage.player('#db7863',runnerDresses!.tackler);stage.scene.remove(blocker.root);blocker.root.position.set(lane*2.4,0,.12);blocker.root.scale.setScalar(1.12);blocker.root.name=`blocked-${lane}`;blocker.root.userData.rig=blocker;blocker.root.userData.blockPose={vx:0,vz:0,anticipate:.65,skill:undefined};blocker.root.userData.blockSkill={type:'blockTackle',progress:0,side:lane>0?-1:1};blocker.root.traverse(o=>{o.castShadow=false;});g.add(blocker.root);}}}
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
 // Heat (pass 2): a pick-up ball is a 320-triangle inked ball with painted patches and no shadow (the shared match ball is 1.5k
 // triangles and was drawn twice, once more into the shadow map, for each of up to twelve pick-ups).
 const coinGeo=(()=>{const g=new T.IcosahedronGeometry(.27,2).toNonIndexed(),p=g.attributes.position,n=p.count,col=new Float32Array(n*3),nor=new Float32Array(n*3),P=(1+Math.sqrt(5))/2,V=[[-1,P,0],[1,P,0],[-1,-P,0],[1,-P,0],[0,-1,P],[0,1,P],[0,-1,-P],[0,1,-P],[P,0,-1],[P,0,1],[-P,0,-1],[-P,0,1]].map(v=>new T.Vector3(v[0],v[1],v[2]).normalize()),c=new T.Vector3(),a=new T.Vector3(),paper=new T.Color('#fffaf0'),patch=new T.Color('#2b2036');
  for(let i=0;i<n;i+=3){c.set(0,0,0);for(let k=0;k<3;k++)c.add(a.fromBufferAttribute(p,i+k));c.normalize();let d=0;for(const v of V)d=Math.max(d,c.dot(v));const k=d>.93?patch:paper;
   for(let j=0;j<3;j++){a.fromBufferAttribute(p,i+j).normalize();nor.set([a.x,a.y,a.z],(i+j)*3);col.set([k.r,k.g,k.b],(i+j)*3);}}
  g.setAttribute('normal',new T.BufferAttribute(nor,3));g.setAttribute('color',new T.BufferAttribute(col,3));g.deleteAttribute('uv');return g;})(),coinMat=new T.MeshLambertMaterial({vertexColors:true});coinMat.userData.runnerRim=true;
 // Tackle alarm: three comic strokes over a defender's head the moment it commits (one shared geometry, drawn only then).
 const alertGeo=(()=>{const v:number[]=[],c:number[]=[],ink=new T.Color(RUNNER_INK),sun=new T.Color('#ffc83a');const tri=(ang:number,w:number,l0:number,l1:number,col:T.Color,z:number)=>{const dx=Math.sin(ang),dy=Math.cos(ang);v.push(dx*l0,dy*l0,z,dx*l1+dy*w,dy*l1-dx*w,z,dx*l1-dy*w,dy*l1+dx*w,z);for(let i=0;i<3;i++)c.push(col.r,col.g,col.b);};
  for(const ang of[-.7,0,.7]){tri(ang,.17,.12,.95,ink,0);tri(ang,.09,.3,.84,sun,.012);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setAttribute('color',new T.Float32BufferAttribute(c,3));return g;})(),alertMat=new T.MeshBasicMaterial({vertexColors:true,side:T.DoubleSide,depthWrite:false});
 /** Ink line for thin shared shapes (the goal frame): the parts' own geometry pushed out along its normals and drawn inside out. One draw per goal in view. */
 function inkHull(root:T.Object3D,t:number){const parts:T.BufferGeometry[]=[],inv=new T.Matrix4(),m4=new T.Matrix4();root.updateMatrixWorld(true);inv.copy(root.matrixWorld).invert();
  root.traverse(o=>{const m=o as T.Mesh;if(!m.isMesh||!m.visible)return;const src=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();src.applyMatrix4(m4.multiplyMatrices(inv,m.matrixWorld));const pos=src.attributes.position as T.BufferAttribute,nor=src.attributes.normal as T.BufferAttribute,g=new T.BufferGeometry(),out=new Float32Array(pos.count*3);
   for(let i=0;i<pos.count;i++){out[i*3]=pos.getX(i)+nor.getX(i)*t;out[i*3+1]=pos.getY(i)+nor.getY(i)*t;out[i*3+2]=pos.getZ(i)+nor.getZ(i)*t;}g.setAttribute('position',new T.BufferAttribute(out,3));src.dispose();parts.push(g);});
  const merged=mergeGeometries(parts)!;for(const g of parts)g.dispose();const hull=new T.Mesh(merged,new T.MeshBasicMaterial({color:RUNNER_INK,side:T.BackSide}));hull.castShadow=hull.receiveShadow=false;return hull;}
 // Training cone: sun-orange with a paper band and a base plate, its ink outline baked in (one draw, shared by the pool).
 const coneGeo=(()=>{const out:T.BufferGeometry[]=[];inkedPart(out,new T.BoxGeometry(.9,.07,.9),'#f0452e',partAt(0,.035,0),.045);inkedPart(out,new T.CylinderGeometry(.03,.4,.95,8,1),'#ff6a2e',partAt(0,.5,0),.05,true);inkedPart(out,new T.CylinderGeometry(.19,.27,.2,8,1,true),RUNNER_PAPER,partAt(0,.5,0),0);return bakeParts(out);})(),coneMat=new T.MeshLambertMaterial({vertexColors:true});
 // The ball reads as a character: sun-side rim and ink edge (flagged before runnerFx builds the route and patches materials).
 for(const b of [ball,runnerShots[0]])b.traverse(o=>{const m=(o as T.Mesh).material as T.Material|undefined;if(m&&!Array.isArray(m))m.userData.runnerRim=true;});
 // Heat (pass 2): the balls keep the blob shadow under them and stay out of the shadow map (1.5k triangles each, drawn twice).
 for(const b of [ball,...runnerShots])b.traverse(o=>{o.castShadow=false;});
 // Construct reusable runner visuals once; no geometry creation during play.
 for(let i=0;i<26;i++)decorate(runnerObjects[i],i<6?'defender':i<12?'cone':i<24?'coin':'goal');
 // Breakaway feel layer (runnerFx) and synthesized soundtrack (runnerAudio): pooled, runner-only.
 const runnerFx=(createRunnerFx(stage)),runnerSoundtrack=(createRunnerSoundtrack(audioContext)),runnerBaseFov=stage.camera.fov;
 if(runnerFx){for(let i=0;i<6;i++)runnerFx.prepareDefender(runnerObjects[i]);runnerFx.reset(runner);}
 function fit(){stage.fit(((10)),((17.6)),true,false,false);
  // Desktop: a lower chase view than the shared framing, so the horizon (sea, sun, headlands) sits a third down the picture.
  if(!stage.mobile){stage.camera.position.set(0,6.2,14);shotLook.set(0,1.77,-14);stage.camera.lookAt(shotLook);stage.camera.updateMatrixWorld();}
  cameraHome.copy(stage.camera.position);cameraRotation.copy(stage.camera.quaternion);cinema=0;}
 function reset(){freeze=0;Object.assign(runner,createRunnerGame());runnerFx?.reset(runner);runnerSoundtrack?.reset();elapsed=event=0;cinema=cinemaKick=pointSound=chargeTone=cameraFocus=0;notedLevel=1;cameraBeat(0);stage.resetPlayers();}
 function action(id:number){freeze=0;if(id===3)runnerCharge(runner,true);else if(id===4)runnerRelease(runner);else if(id===5)runnerCharge(runner,false);else if(id===0)runnerShoot(runner);else if(id===1)runnerJump(runner);else if(id===6)runnerSkill(runner);else runnerSlide(runner);}
 function target(x:number,y:number){const p=stage.pick(x,y);}
 function update(dt:number,input:ArcadeInput){elapsed+=dt;
  if(input.x)runner.lane=T.MathUtils.clamp(Math.round(input.x),-1,1);tickRunnerCoach(runner,dt);tickRunner(runner,dt*(runnerFx?.timeScale()??1)*runner.coachScale);tickRunnerMissions(runner);runnerOutro(runner,dt);runnerSoundtrack?.frame(dt,runner);
  const level=(runner.level);if(level>notedLevel)onSound(true,'level');notedLevel=level;
  const tone=(runner.charging)?Math.floor(runner.charge*3):0;if(tone>chargeTone)onSound(false,'charge'+tone);chargeTone=tone;
  // The strike's freeze-frame (pass 2): the printed picture holds for a beat (see the render guard below); rules, scene and sound run on.
  if(freeze>0)freeze-=dt;
  sync((dt));cameraBeat(dt);runnerFx?.camera(stage.camera,runner,dt,runnerBaseFov);stage.effects(dt);stage.lighting(elapsed);
 }
 function sync(dt:number){
  {
   strips.forEach((m,i)=>m.position.z=7-i*4+runner.distance%4);
   runnerFx?.update(dt,runner);players[0].root.position.x=runner.x;
   const kick=runner.kick>0?Math.sin(runner.kick/.3*Math.PI/2):0;
   runnerPose.dribbling=runner.balls>0&&!runner.charging&&runner.kick<=0&&runner.y<.05&&runner.slidePose<.1;runnerPose.charge=runner.charge;runnerPose.stride=runner.stride;runnerPose.vx=runner.vx;runnerPose.vz=runner.boost>0?-8:-6;runnerPose.slide=runner.slidePose;
   runnerVolley.progress=1-runner.kick/.3;runnerVolley.height=runner.y*.65+.4;runnerPose.move=runner.lastVolley&&runner.kick>0?runnerVolley:undefined;
   runnerPose.jumpProgress=runner.jumping?.24+.46*T.MathUtils.clamp((JUMP_V-runner.vy)/(2*JUMP_V),0,1):runner.landing>0?.7+.3*(1-runner.landing/.2):undefined;
   runnerPose.anticipate=Math.max(runner.jumpPrep/.09,runner.landing/.2)*.7;runnerPose.stun=runner.hurt>0?Math.max(0,(runner.hurt-.9)/.3):0;runnerPose.celebrate=runner.celebrate;
   // Full time: the stumble settles into a dejected stop while the world coasts.
   (runnerPose as ArcadePoseOptions).reaction=runner.lives<=0&&runner.hurt<.9?'dejected':undefined;(runnerPose as ArcadePoseOptions).reactionProgress=1-runner.outro/RUNNER_OUTRO;
   players[0].pose(dt,runner.lives?(runner.boost>0?8:6)*(1-runner.slidePose*.85)*(1-kick*.5):6*(runner.outro/RUNNER_OUTRO)**2,Math.PI-Math.atan2(runner.vx,22)*.25,kick,runner.y*.65,runner.lean,runnerPose);
   // Recovery stays visible; weight and the stagger pose communicate the hit.
   players[0].root.visible=true;
   if(runnerAimEnd){runnerAimEnd.visible=runner.charging;runnerAimEnd.position.set(runner.x,.04,-.8);runnerAimEnd.scale.setScalar(1+runner.charge*.9);}
   const touch=Math.sin(runner.stride),push=(1-Math.cos(runner.stride*2))*.5;
   ball.visible=runner.balls>0&&runner.kick<.14;ball.scale.setScalar(1+runner.charge*.16);
   ball.position.set(runner.x+touch*.15*(1-runner.slidePose),.24+push*.09+runner.y*.18,-.66-push*.32-runner.slidePose*.45);if(runnerPose.dribbling){players[0].dribbleContact(runnerDribble);ball.position.x=runnerDribble.x;ball.position.z=runnerDribble.z;}if(runner.charging){const load=Math.min(1,runner.charge*8);ball.position.x=T.MathUtils.lerp(ball.position.x,runner.x+RUNNER_STRIKE_X,load);ball.position.z=T.MathUtils.lerp(ball.position.z,-.9,load);}ball.rotation.x=-runner.distance/.22;ball.rotation.z=-runner.x/.22;runnerFx?.player(runner,runnerPose as ArcadePoseOptions,ball);
   if(runnerShotTrail)runnerShotTrail.count=0;
   runnerShots.forEach((mesh,i)=>{const shot=runner.shots[i];mesh.visible=shot.active;if(shot.active){
    const height=.28+Math.max(0,(shot.height??.28)-.28)*(1-Math.min(1,shot.age/1.8))+Math.sin(Math.min(1,shot.age/1.8)*Math.PI)*.3;mesh.position.set(shot.x,height,shot.z);mesh.rotation.x+=dt*(shot.returning?35:-35);mesh.scale.setScalar(1+(shot.returning?.2:(shot.blast??0)*.95));
    if(runnerShotTrail&&!stage.reduced&&!shot.returner)for(let j=0;j<(stage.mobile?3:5);j++){const behind=(j+1)*.38*(shot.returning?-1:1);if(!shot.returning&&shot.z+behind>-.9)continue;runnerShotMatrix.position.set(shot.x,height,shot.z+behind);runnerShotMatrix.scale.setScalar((.16+(shot.blast??0)*.3)*(1-j/6));runnerShotMatrix.updateMatrix();runnerShotTrail.setMatrixAt(runnerShotTrail.count++,runnerShotMatrix.matrix);}
   }});
   if(runnerShotTrail&&runnerShotTrail.count)runnerShotTrail.instanceMatrix.needsUpdate=true;
   runnerObjects.forEach(g=>g.visible=false);used.clear();
   for(const o of runner.objects){let g:T.Group|undefined;for(const c of runnerObjects)if(!used.has(c)&&poolKinds.get(c)===o.kind){g=c;break;}if(!g)continue;used.add(g);g.visible=true;g.rotation.set(0,0,0);g.scale.setScalar(1);g.position.set(o.x??o.lane*2.4,0,o.z);if(o.kind==='defender'){runnerFx?.defender(g,o,runner);if(o.knock)(g.userData.alert as T.Mesh).visible=false;}
    if(o.knock){const k=1-o.knock/.65,side=o.lane<0?-1:1;g.position.x+=side*k*4;g.position.y=Math.sin(k*Math.PI)*1.1;g.rotation.z=side*k*2.5;g.scale.setScalar(1-k*.6);}else if(o.passed&&o.kind!=='goal'&&!(o.kind==='defender'&&(o.tackle??0)>0&&(o.tackle??0)<1.05)){g.visible=false;continue;}
    if(o.kind==='coin'){g.rotation.y=elapsed*2;g.position.y=Math.sin(elapsed*4+o.z)*.07;}
    if(o.kind==='goal'&&o.z>1){g.visible=false;continue;}
    if(o.kind==='goal'){const burst=g.userData.burst,age=o.goalBurst??0;(g.userData.ink as T.Mesh).visible=!o.scored;for(const part of burst.intact)part.visible=!o.scored;for(let bi=0;bi<burst.pieces.length;bi++){const p=burst.pieces[bi],part=p.part;part.position.copy(p.position);part.rotation.copy(p.rotation);part.scale.copy(p.scale);part.visible=o.scored?age<1.2:bi<burst.originalCount;if(o.scored){const fly=stage.reduced?.12:age;part.position.x+=p.side*fly*(6+bi*.17);part.position.y+=stage.reduced?0:Math.sin(Math.min(1,age/1.2)*Math.PI)*(1.4+(bi%3)*.35);part.position.z-=fly*(1.4+bi%3);if(!stage.reduced){part.rotation.z+=p.side*age*(1.3+bi*.13);part.rotation.x+=age*(bi%2?-.7:.7);}part.scale.multiplyScalar(Math.max(.05,1-Math.max(0,age-.75)*1.8));}}if(o.scored&&age>=1.2){g.visible=false;continue;}const caught=g.userData.caught as T.Group;caught.visible=!!o.scored&&(o.netHit??0)>0;if(caught.visible){const age=.65-(o.netHit??0);caught.position.set(o.hitX??0,.25+Math.sin(age/.65*Math.PI)*.28,-.3-Math.sin(Math.min(1,age/.25)*Math.PI/2)*.65);caught.rotation.x+=dt*12;}if(g.userData.net&&((o.netHit??0)>0||g.userData.netDirty)){const net=g.userData.net as T.LineSegments,attr=net.geometry.attributes.position as T.BufferAttribute,base=g.userData.netBase as Float32Array,hit=o.netHit??0;for(let n=0;n<attr.count;n++){const j=n*3,weight=Math.max(0,1-Math.abs(base[j]-(o.hitX??0))/2);attr.setZ(n,base[j+2]-(stage.reduced?0:Math.sin((.65-hit)*20)*hit*.65*weight));}attr.needsUpdate=hit>0||g.userData.netDirty;g.userData.netDirty=hit>0;}const aperture=g.getObjectByName('open-lane')!;aperture.visible=!o.scored&&(!o.keeper||runner.level<=3&&!o.rush&&!o.cross);aperture.position.x=o.openLane*2.4;aperture.scale.setScalar(!stage.reduced&&!o.scored&&o.z> -22&&o.z< -8?1+Math.sin(elapsed*8)*.05:1);g.scale.z=o.scored?1+Math.sin(runner.celebrate*20)*runner.celebrate*.12:1;for(const lane of[-1,0,1]){const keeper=g.getObjectByName(`blocked-${lane}`)!;keeper.visible=lane!==o.openLane&&!o.scored&&!o.keeper;if(keeper.visible){const save=Math.abs(lane*2.4-(o.hitX??99))<1.2?(o.reaction??0):0;const pose=keeper.userData.blockPose,skill=keeper.userData.blockSkill;skill.progress=.36+(1-save/.5)*.64;pose.skill=save>0?skill:undefined;keeper.userData.rig.pose(dt,0,Math.atan2(runner.x-lane*2.4,-o.z),0,0,0,pose);}}}
    if(o.kind==='defender'&&!o.knock){const role=o.role??'jockey',rig=g.userData.rig,pose=g.userData.pose??(g.userData.pose={vx:0,vz:0,anticipate:0,slide:0}),t=o.tackle??0,attack=t>.08&&t<.7?1:t>0&&t<=.08?t/.08:t>=.7?Math.max(0,1-(t-.7)/.35):0;
     if(g.userData.role!==role){rig.setDress(runnerDresses![role]);g.userData.role=role;}
     // Heat (pass 2): a defender more than 24 m up the road stays out of the shadow map (its shadow there is a few pixels); the
     // meshes that cast are noted once and flipped only when it crosses the line.
     {const near=o.z>-24;if(g.userData.castNear!==near){g.userData.castNear=near;const list=(g.userData.casters??(g.userData.casters=(()=>{const a:T.Object3D[]=[];rig.root.traverse((c:T.Object3D)=>{if((c as T.Mesh).isMesh&&c.castShadow)a.push(c);});return a;})())) as T.Object3D[];for(const c of list)c.castShadow=near;}}
     rig.root.scale.setScalar(1); // Bean build provides the silhouette without distorting its leg solver.
     const tackleSkill=g.userData.tackleSkill??(g.userData.tackleSkill={type:'pokeTackle',progress:0,side:1});tackleSkill.type=role==='sweeper'?'blockTackle':'pokeTackle';tackleSkill.side=o.lane>0?-1:1;
     // Front-load the foot extension into the collision tell, hold through its
     // active reach, then recover with the same .7–1.05 s simulation window.
     tackleSkill.progress=t<.08?t/.08*.34:t<.7?.34+(t-.08)/.62*.2:.54+Math.min(1,(t-.7)/.35)*.46;pose.skill=t>0&&t<1.05&&role!=='tackler'?tackleSkill:undefined;
     let held:typeof runner.shots[number]|undefined;for(const shot of runner.shots)if(shot.active&&shot.returner===o){held=shot;break;}pose.charge=held?Math.min(1,1-(held.windup??0)/.3)*.55:0;pose.actionKind='pass';pose.shotPower=.6;pose.strikeX=.2;pose.strikeZ=.6;if(held||(o.returnKick??0)>0)pose.skill=undefined;
     pose.vx=o.vx??0;pose.vz=(o.press??0)*RUNNER_PRESS_SPEED;pose.jockey=.8;pose.anticipate=(o.read??0)<(role==='tackler'?.65:.5)?(o.reaction??0)*.9:0;
     // Wind-up (pass 2): every role has its own silhouette while it reads you, so the move is told before the telegraph colour is
     // read. Pose options plus the pooled rig's root transform only; released over the first tenth of a second of the tackle.
     const tell=role==='tackler'?.65:.5,rd=o.read??0,live=o.read!==undefined&&!o.passed&&!o.beaten&&runner.lives>0,wu=live?(t>0?Math.max(0,1-t/.1):Math.min(1,rd/tell)):0,wind=wu*wu*(3-2*wu),aimSide=Math.sign(runner.x-(o.x??o.lane*2.4))||(o.lane>0?-1:1),bob=stage.reduced?0:Math.abs(Math.sin(elapsed*9+o.z*.3));
     pose.keeper=role==='wall'?wind*.8:role==='sweeper'?wind*.9:0;pose.anticipate=Math.max(pose.anticipate,role==='tackler'?wind:wind*.45);pose.slide=role==='tackler'?Math.max(attack*.95,pose.anticipate*.3):0;
     rig.pose(dt,Math.abs(o.vx??0)+(o.press??0)*RUNNER_PRESS_SPEED,(held||(o.returnKick??0)>0)?(o.returnAim??0):Math.atan2((runner.x-(o.x??o.lane*2.4))*.3,Math.max(4,-o.z)),(o.returnKick??0)/.46,0,(o.vx??0)*.2,pose);
     // The island slide solver now lowers the bean, extends its leading boot and
     // grounds every limb. Post-solver hip/torso edits bypass that ground guard.
     rig.root.position.z=role==='tackler'?attack*.7:0;
     {const R=rig.root as T.Object3D;let sx=1,sy=1,rx=0,rz=0;
      if(wind>0){if(role==='tackler'){sx=1+.16*wind;sy=1-.22*wind;rx=-.26*wind;}else if(role==='sweeper'){sx=1+.18*wind;sy=1-.05*wind;rz=-aimSide*.15*wind;}else if(role==='presser'){sy=1-.09*wind;rx=.32*wind;}
       else if(role==='wall'){sx=1+.06*wind;sy=1+.11*wind+bob*.03*wind;}else if(role==='pair'||role==='line'){rz=-aimSide*.19*wind;sy=1-.05*wind;}else{rz=-aimSide*.1*wind;sx=1+.07*wind;sy=1-.11*wind+bob*.05*wind;}}
      else if(role==='tackler'&&attack>0){sx=1-.06*attack;sy=1+.08*attack;}
      R.rotation.x=rx;R.rotation.z=rz;R.scale.set(sx,sy,sx);
      const alert=g.userData.alert as T.Mesh,committed=live&&rd>tell&&t<.4;alert.visible=committed;if(committed){alert.position.y=1.72*sy+.12;alert.quaternion.copy(stage.camera.quaternion);alert.scale.setScalar(stage.reduced?.75:.66+.2*Math.round(Math.abs(Math.sin(elapsed*13))));}}
     if(t>.7)g.position.x+=Math.sign(o.lane||1)*Math.min(1,(t-.7)/.35)*.55;
     g.userData.warning.scale.set(role==='sweeper'?1+attack*.5:1,role==='tackler'?1+attack*1.3:1,1);g.userData.warning.visible=o.read!==undefined&&!o.passed;
    }
   }
   runnerBlastAge=Math.max(0,runnerBlastAge-dt);runnerBlastRings.forEach((ring,i)=>{ring.visible=runnerBlastAge>0&&!stage.reduced;if(!ring.visible)return;const t=1-runnerBlastAge/.6,pop=Math.min(1,t/.16),size=(.5+pop*(.9+runnerBlastPower*1.5))*(i?.8:1)*(1+Math.sin(t*40)*.04);ring.quaternion.copy(stage.camera.quaternion);ring.rotateZ(.2+i*.26+t*.5);ring.scale.setScalar(size);ring.material.opacity=t>.72?(1-t)/.28:1;});
   if(event!==runner.event){event=runner.event;if(runner.eventKind==='goal'&&!stage.reduced)freeze=.11;if(['shot','clear','goal'].includes(runner.eventKind)&&(runner.lastBlast>.25||runner.eventKind==='goal')){runnerBlastAge=.6;runnerBlastPower=Math.max(runner.lastBlast,runner.eventKind==='goal'?.55:0);for(const ring of runnerBlastRings)ring.position.set(runner.eventX,.75,runner.eventZ);}stage.burst(runner.eventX,.4,runner.eventZ,runner.eventKind==='goal'?2:['shot','clear'].includes(runner.eventKind)&&runner.lastBlast>=.8?3:1);onSound(runner.eventKind==='goal',runner.eventKind);}

  }
  shadow.visible=ball.visible;shadow.position.set(ball.position.x,.04,ball.position.z);const h=ball.position.y;shadow.scale.setScalar(1+h*.2);(shadow.material as T.MeshBasicMaterial).opacity=.3/(1+h*.4);
 }
 function hud():ArcadeHUD{return runnerHud(runner);}
 // Freeze-frame: for a tenth of a second after a goal this game's stage skips its draw, so the last frame stays on the glass while the
 // inset panel slams in. Visuals only: time, scoring and the scene graph are untouched; any input (action) or reduced motion skips it.
 {const draw=stage.render.bind(stage);stage.render=()=>{if(freeze>0&&runner.lives>0)return;draw();};}
 sync(0);fit();stage.render();return{needsFrames:()=>cinema>0||stage.effectsActive()||((((runner.lives>0&&!runner.finished)||runner.outro>0||!!runnerFx?.active()))),stage,update,reset,action,target,hud,fit,pinballCamera:()=>undefined,pinballCinema:pinballCine,state:{tennis,pinball,runner},
  /** Futbol Tennis hold-to-power: 0 Kick, 1 Lob, 2 Drop. Start winds up, release strikes, cancel drops it. */
  chargeStart(id:number){return false;},
  chargeRelease(){return false;},
  chargeCancel(){},
  /** Debug/QA read of the dynamic tennis camera (zoom, serve blend, focus). */
  tennisCamera(){return null;},
  /** Debug/QA read of the tennis cinematic beat (scale, close-up, follow, push, flash). */
  tennisBeat(){return null;},
  /** Tear down: game-specific module state first (runnerTrack's renderer hold), then the stage. */
  dispose(){runnerFx?.dispose();runnerSoundtrack?.dispose();stage.dispose();},
  /** Dev QA (window.__arcade3d only): the feel layer's debug reads and a route switch for the contact-sheet captures. */
  qa:{fx:runnerFx,mode(id:RunnerModeId){selectRunnerMode(id);reset();}}};
}
