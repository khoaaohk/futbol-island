import * as T from 'three';
import {createGlassFloor} from './glassFloor';
import {createArcadeStage,type ArcadePoseOptions} from './arcadeStage';
import {STRIKER_GOAL_PAUSE,STRIKER_DIVE,STRIKER_SKILLS,STRIKER_HEAVY_TOUCH,type StrikerMatch} from './strikerMatch';
import type {SkillMotion} from '../graphics/skillMoves';
import {matchPlayerDress} from '../town/beanLooks';
import {neonColor} from './neonPalette';
export function createStrikerScene(canvas:HTMLCanvasElement,match:StrikerMatch){
 const stage=createArcadeStage(canvas);stage.scenery.visible=false;const nets:{side:number;attribute:T.BufferAttribute;rest:Float32Array;dirty:boolean}[]=[];
 stage.box(0,-.09,0,52,.16,30,'#427f6c').castShadow=false;
 const grass=new T.PlaneGeometry(1,1),grassMaterials=['#193440','#203f4c'].map(color=>new T.MeshStandardMaterial({color,roughness:1}));for(let i=0;i<10;i++){const patch=new T.Mesh(grass,grassMaterials[i%2]);patch.rotation.x=-Math.PI/2;patch.position.set(-22.5+i*5,.012,0);patch.scale.set(5,28,1);patch.receiveShadow=true;stage.scene.add(patch);}
 for(const z of [-14,14]){stage.box(0,.35,z,52,.7,.35,'#f1ce83');stage.box(0,.04,z,50,.025,.09,'#fff1d5');}
 for(const side of [-1,1]){for(const z of [-9.5,9.5])stage.box(side*25,.35,z,.35,.7,9,'#f1ce83');const goal=stage.goal(side*25,0,9.2);goal.rotation.y=-side*Math.PI/2;goal.scale.y=1.32;const net=goal.children.find(child=>child instanceof T.LineSegments) as T.LineSegments;const attribute=net.geometry.getAttribute('position') as T.BufferAttribute;nets.push({side,attribute,rest:new Float32Array(attribute.array),dirty:false});for(const z of [-5,5])stage.box(side*21,.04,z,8,.025,.09,'#fff1d5');stage.box(side*17,.04,0,.09,.025,10,'#fff1d5');}
 stage.box(0,.04,0,.08,.025,28,'#fff1d5');stage.ring(0,0,4,'#fff1d5');
 // Crowd: one instanced draw (was 120 sphere meshes). Fans jump only while
 // the crowd is excited; matrices upload during swells, never at rest.
 const fanColors=['#e8bf65','#91c3bd','#b196c8'],fanCount=120,fanGeometry=new T.SphereGeometry(1,10,6),fans=new T.InstancedMesh(fanGeometry,new T.MeshStandardMaterial({roughness:.65}),fanCount),fanBase=new Float32Array(fanCount*3),fanPhase=new Float32Array(fanCount),fanColor=new T.Color(),fanDummy=new T.Object3D();
 fans.castShadow=true;fans.instanceMatrix.setUsage(T.DynamicDrawUsage);stage.scene.add(fans);
 {let n=0;for(const side of [-1,1])for(let i=0;i<3;i++){stage.box(0,.35+i*.4,side*(16+i*1.1),56,.6,1,'#bd7e69');for(let k=0;k<20;k++,n++){fanBase.set([-24+k*2.5,.95+i*.4,side*(16+i*1.1)],n*3);fanPhase[n]=(k*.37+i*1.3+side)%(Math.PI*2);fanDummy.position.fromArray(fanBase,n*3);fanDummy.scale.setScalar(.24);fanDummy.updateMatrix();fans.setMatrixAt(n,fanDummy.matrix);fans.setColorAt(n,fanColor.set(neonColor(fanColors[k%3])));}}}
 let fanTime=0,fansMoving=false;
 const glassFloor=createGlassFloor(stage.scene,49.8,27.8,14,8,.018);
 const rigs=match.state.players.map(p=>stage.player(p.keeper?'#cf826c':p.team===0?'#f4c355':'#6099c0',matchPlayerDress('striker-'+p.id,p.team===0?'home':'away',p.keeper)));rigs.forEach(r=>r.root.scale.setScalar(stage.mobile?2.05:1.8));
 const poseOptions:ArcadePoseOptions[]=rigs.map(()=>({vx:0,vz:0,charge:0,slide:0,stun:0,celebrate:0,anticipate:0}));
 // Rig skill moves (reused objects, no per-frame allocation): dribble skills, keeper roll-out, celebrations.
 const skillPoses:SkillMotion[]=rigs.map(()=>({type:'stepover',progress:0,side:1}));
 const savePoses=rigs.map(()=>({progress:1,dir:1 as -1|1,kind:'stand' as 'stand'|'side',height:0,outcome:'parry' as 'parry'|'catch'}));
 const warnings=match.state.players.map(()=>{const r=stage.ring(0,0,1.25,'#ed8b68');r.visible=false;return r;});
 // Tackle telegraph: a flat wedge from the defender toward the latched tackle spot.
 const wedgeGeometry=new T.BufferGeometry();wedgeGeometry.setAttribute('position',new T.Float32BufferAttribute([-.6,0,.25,.6,0,.25,0,0,1],3));const wedgeMaterial=new T.MeshBasicMaterial({color:'#ff7a5c',transparent:true,opacity:.85,side:T.DoubleSide,depthWrite:false});
 const wedges=match.state.players.map(()=>{const m=new T.Mesh(wedgeGeometry,wedgeMaterial);m.visible=false;m.renderOrder=2;stage.scene.add(m);return m;});
 const ball=stage.football(.36),ring=stage.ring(0,0,.85,'#ffe36e');ring.renderOrder=3;
 const aimMaterial=new T.MeshBasicMaterial({color:'#ffe36e'}),aim=new T.Mesh(new T.BoxGeometry(1,1,1),aimMaterial);aim.scale.set(.13,.035,2.4);aim.position.y=.07;stage.scene.add(aim);
 // Goal-mouth target: where the shot crosses the line, at the height this charge would carry it.
 const target=stage.ring(0,0,.8,'#ffe36e');target.rotation.set(0,Math.PI/2,0);target.visible=false;const targetMaterial=target.material as T.MeshBasicMaterial;
 const trailMaterial=new T.MeshBasicMaterial({color:'#efc66d',transparent:true,opacity:.85,depthWrite:false});
 const trailGeometry=new T.SphereGeometry(1,10,6),trail=Array.from({length:8},()=>{const m=new T.Mesh(trailGeometry,trailMaterial);m.scale.setScalar(0);m.visible=false;stage.scene.add(m);return m;});let trailAge=0,cursor=0,lastEvent=0;
 const passMaterial=new T.MeshBasicMaterial({color:'#fff3d2'}),receiverRing=stage.ring(0,0,1.1,'#fff3d2'),passLine=new T.Mesh(new T.BoxGeometry(1,1,1),passMaterial);passLine.scale.set(.09,.02,1);stage.scene.add(passLine);receiverRing.visible=passLine.visible=false;
 const ballShadow=new T.Mesh(new T.CircleGeometry(.4,20),new T.MeshBasicMaterial({color:'#193e37',transparent:true,opacity:.35,depthWrite:false}));ballShadow.rotation.x=-Math.PI/2;stage.scene.add(ballShadow);
 const ringGold=new T.Color('#ffe36e'),ringReceive=new T.Color('#73fff1'),safeLane=new T.Color('#fff3d2'),riskyLane=new T.Color('#ff7a5c'),aimGood=new T.Color('#ffe36e'),aimOver=new T.Color('#ff5d73'),trailShot=new T.Color('#ffd25e'),trailPass=new T.Color('#7ff6ff');
 const axes={x:0,z:0};let portrait=false,focusAmount=0,shotFlash=0,goalFlash=0,punch=0,shake=0,clock=0,pop=0,lastSelected=-1,lastNearMiss=0;
 const cameraHome=new T.Vector3(),cameraFocus=new T.Vector3(),focusTarget=new T.Vector3();
 const powerRing=stage.ring(0,0,1.35,'#ffe36e');powerRing.visible=false;
 const releaseRing=stage.ring(0,0,1,'#9cecf2');releaseRing.visible=false;releaseRing.material.transparent=true;releaseRing.material.depthWrite=false;
 // Interception read: the spot a defender is racing to, so a risky pass is visible as it happens.
 const interceptRing=stage.ring(0,0,.9,'#ff7a5c');interceptRing.visible=false;
 // One-touch window: an approach ring at the receiver's feet closes as the pass arrives (rhythm-game style).
 // Tap Pass or Shoot while it glows for a perfect first touch. Hidden unless a Gold pass is travelling.
 const touchRing=stage.ring(0,0,1,'#73fff1');touchRing.visible=false;touchRing.material.transparent=true;touchRing.material.depthWrite=false;touchRing.renderOrder=3;
 // Heavy touch: the Blue carrier's ball pulses pink when it is off their foot (the moment to tackle).
 const heavyRing=stage.ring(0,0,.75,'#ff8fc8');heavyRing.visible=false;heavyRing.renderOrder=3;
 // Called run: a pulsing cyan ring under the runner while the run is on.
 const runRing=stage.ring(0,0,1.2,'#73fff1');runRing.visible=false;runRing.renderOrder=3;
 // Small goals (cup semi-final): neon blocks narrow the mouth; hidden otherwise.
 const smallPosts:T.Mesh[]=[];for(const side of [-1,1])for(const z of [-1,1]){const m=stage.box(side*25,1.25,z*3.85,.4,2.5,1.5,'#ff8fc8');m.castShadow=false;m.visible=false;smallPosts.push(m);}
 // Rain (cup quarter-final): two static layers of streaks that slide down and wrap. O(1) per frame, hidden when dry.
 const rainGeometry=new T.BufferGeometry(),rainPoints=new Float32Array(180*6);for(let i=0;i<180;i++){const x=(Math.random()-.5)*56,y=Math.random()*14,z=(Math.random()-.5)*34;rainPoints.set([x,y,z,x+.12,y-.9,z],i*6);}
 rainGeometry.setAttribute('position',new T.BufferAttribute(rainPoints,3));const rainMaterial=new T.LineBasicMaterial({color:'#bfe9ff',transparent:true,opacity:.45,depthWrite:false});
 const rain=new T.Group();for(const offset of [0,14]){const layer=new T.LineSegments(rainGeometry,rainMaterial);layer.position.y=offset;layer.frustumCulled=false;rain.add(layer);}rain.visible=false;stage.scene.add(rain);let rainY=0;
 const warnOrange=new T.Color(neonColor('#ed8b68')),spiritPink=new T.Color('#ff8fc8'),trailSpecial=new T.Color('#ff62c2');
 const touchIdle=new T.Color('#9fd8d2'),touchHot=new T.Color('#73fff1');let lastPerfect=0,perfectFlash=0;
 // Selected-player marker: a gold arrow over the head that pops on every switch.
 const marker=new T.Mesh(new T.ConeGeometry(.42,.7,4),new T.MeshBasicMaterial({color:'#ffe36e'}));marker.rotation.x=Math.PI;stage.scene.add(marker);
 // Pressure and cover (later rounds): a faint link from Blue's presser to the cover defender behind them.
 const coverMaterial=new T.MeshBasicMaterial({color:'#9cecf2',transparent:true,opacity:.35,depthWrite:false}),coverLine=new T.Mesh(new T.BoxGeometry(1,1,1),coverMaterial);coverLine.scale.set(.07,.02,1);coverLine.visible=false;stage.scene.add(coverLine);
 // Goal confetti: one pooled instanced draw, alive about two seconds per goal; hidden otherwise.
 const confettiCount=48,confetti=new T.InstancedMesh(new T.PlaneGeometry(.26,.4),new T.MeshBasicMaterial({side:T.DoubleSide}),confettiCount),bits=new Float32Array(confettiCount*7),bitLife=new Float32Array(confettiCount),bitDummy=new T.Object3D();
 confetti.instanceMatrix.setUsage(T.DynamicDrawUsage);confetti.frustumCulled=false;confetti.visible=false;stage.scene.add(confetti);
 {const colors=['#ffe36e','#73fff1','#ff62c2','#cd68ff','#ffffff'],c=new T.Color();for(let i=0;i<confettiCount;i++){confetti.setColorAt(i,c.set(colors[i%colors.length]));bitDummy.scale.setScalar(0);bitDummy.updateMatrix();confetti.setMatrixAt(i,bitDummy.matrix);}}
 function throwConfetti(x:number,z:number){if(stage.reduced)return;const side=Math.sign(x)||1;for(let i=0;i<confettiCount;i++){const o=i*7;bits[o]=side*(21+Math.random()*3.5);bits[o+1]=2+Math.random()*1.5;bits[o+2]=z+(Math.random()-.5)*7;bits[o+3]=-side*(2+Math.random()*6);bits[o+4]=5+Math.random()*5;bits[o+5]=(Math.random()-.5)*9;bits[o+6]=Math.random()*6;bitLife[i]=1.4+Math.random()*.8;}confetti.visible=true;}
 function stepConfetti(dt:number){if(!confetti.visible)return;let alive=false;for(let i=0;i<confettiCount;i++){if(bitLife[i]<=0)continue;bitLife[i]-=dt;const o=i*7;bits[o+4]-=9*dt;bits[o+3]*=Math.exp(-dt*1.5);bits[o+5]*=Math.exp(-dt*1.5);if(bits[o+4]<-1.6)bits[o+4]=-1.6;bits[o]+=bits[o+3]*dt;bits[o+1]=Math.max(.05,bits[o+1]+bits[o+4]*dt);bits[o+2]+=bits[o+5]*dt;bits[o+6]+=dt*7;
   bitDummy.position.set(bits[o]+Math.sin(bits[o+6])*.15,bits[o+1],bits[o+2]);bitDummy.rotation.set(bits[o+6],bits[o+6]*.7,0);bitDummy.scale.setScalar(bitLife[i]>0?Math.min(1,bitLife[i]*2):0);bitDummy.updateMatrix();confetti.setMatrixAt(i,bitDummy.matrix);if(bitLife[i]>0)alive=true;}
  confetti.instanceMatrix.needsUpdate=true;if(!alive)confetti.visible=false;}
 function stepFans(dt:number,energy:number){const lift=stage.reduced?0:Math.max(0,Math.min(1,(energy-.35)/.75));if(lift<=.01&&!fansMoving)return;fanTime+=dt;fansMoving=lift>.01;
  for(let n=0;n<fanCount;n++){const o=n*3,jump=Math.abs(Math.sin(fanTime*(7+lift*3)+fanPhase[n]))*lift*(.18+.22*Math.min(1,energy-.35));fanDummy.position.set(fanBase[o],fanBase[o+1]+jump,fanBase[o+2]);fanDummy.scale.set(.24,.24*(1+jump*.6),.24);fanDummy.updateMatrix();fans.setMatrixAt(n,fanDummy.matrix);}
  fans.instanceMatrix.needsUpdate=true;}
 function screenAxes(x:number,y:number){axes.x=portrait?-y:x;axes.z=portrait?x:y;return axes;}

 function fit(){const camera=stage.camera,w=canvas.clientWidth,h=canvas.clientHeight;stage.renderer.setSize(w,h,false);camera.clearViewOffset();camera.zoom=1;camera.aspect=w/Math.max(1,h);camera.updateProjectionMatrix();portrait=camera.aspect<.85;
  // Landscape phones: frame the pitch a little high so the attacked goal sits above the thumb buttons (bottom corners).
  if(stage.mobile&&!portrait){camera.setViewOffset(w,h,0,h*.075,w,h);camera.updateProjectionMatrix();}
  const corner=new T.Vector3();let low=10,high=200;for(let i=0;i<24;i++){const d=(low+high)/2;camera.position.set(portrait?-d*.52:0,d,portrait?0:d*.78);camera.lookAt(0,0,0);camera.updateMatrixWorld();let fits=true;for(const x of [-27,27])for(const z of (stage.mobile?[-14.6,14.6]:[-18,18])){corner.set(x,0,z).project(camera);if(Math.abs(corner.x)>.94||Math.abs(corner.y)>.91)fits=false;}if(fits)high=d;else low=d;}
  camera.position.set(portrait?-high*.52:0,high,portrait?0:high*.78);camera.lookAt(0,0,0);camera.updateMatrixWorld();cameraHome.copy(camera.position);const distance=camera.position.length();camera.far=distance+150;
  // Landscape phones reserve the right-hand edge for the action buttons.
  // Centre the actual pitch; controls sit at the edges of the screen.
  camera.updateProjectionMatrix();const fog=stage.scene.fog as T.Fog;fog.near=distance+35;fog.far=distance+115;
 }
 function update(dt:number){const s=match.state,celebrating=s.goalPause>0,elapsed=STRIKER_GOAL_PAUSE-s.goalPause;
  // Hit-stop: the goal frame holds still for a beat before the celebration plays.
  const anim=s.hitStop>0?0:dt*s.timeScale;clock+=dt;
  for(const p of s.players){const rig=rigs[p.id],warning=warnings[p.id],wedge=wedges[p.id],pose=poseOptions[p.id];warning.visible=p.windup>0&&!celebrating;warning.position.set(p.x,.07,p.z);warning.scale.setScalar(.7+Math.max(0,p.windup)/.26*.3);
   wedge.visible=warning.visible&&p.team===1;if(wedge.visible){const dx=p.tackleX-p.x,dz=p.tackleZ-p.z,length=Math.min(3.2,Math.hypot(dx,dz)+.8),grow=1-Math.max(0,p.windup)/.36;wedge.position.set(p.x,.08,p.z);wedge.rotation.set(0,Math.atan2(dx,dz),0);wedge.scale.set(1,1,length*(.45+grow*.55));}
   pose.keeper=p.keeper?1:0;pose.jockey=p.jockey*.8;pose.actionKind=p.strikeKind==='pass'?'pass':'shot';pose.shotPower=p.strikePower;
   const save=savePoses[p.id];save.outcome=p.caught?'catch':'parry';
   if(p.keeper&&p.dive>0){save.progress=Math.min(1,(STRIKER_DIVE-p.dive)/STRIKER_DIVE*1.4);save.dir=p.saveSide;save.kind=p.saveWide?'side':'stand';save.height=Math.min(1,p.saveHeight/2.1);pose.dive=save;}
   else if(p.keeper&&p.strikeKind==='save'&&p.kick>.01){save.progress=.3+(1-p.kick)*.7;save.dir=p.saveSide;save.kind=p.saveWide?'side':'stand';save.height=Math.min(1,p.saveHeight/2.1);pose.dive=save;}else pose.dive=undefined;
   pose.receive=p.receive/.22;pose.receiveProgress=1-p.receive/.22;pose.dribbling=s.ball.owner===p.id&&!p.keeper;pose.vx=p.vx;pose.vz=p.vz;pose.charge=s.ball.owner===p.id?s.charge:0;pose.slide=p.tackle>0?Math.sin(Math.min(1,p.tackle/.28)*Math.PI)*.8:0;pose.stun=Math.min(1,p.stun/.5);
   // Celebration: the team that scored throws its arms up; the scorer finishes with a knee slide;
   // the other side drops its heads.
   const won=celebrating&&p.team===s.ball.lastTeam;pose.celebrate=won?Math.sin(Math.min(1,elapsed/STRIKER_GOAL_PAUSE)*Math.PI):0;pose.reaction=undefined;pose.reactionProgress=undefined;
   if(celebrating&&!won){pose.reaction='dejected';pose.reactionProgress=Math.min(.9,elapsed/1.2);}
   const near=Math.max(0,1-Math.hypot(s.ball.x-p.x,s.ball.z-p.z)/7);pose.anticipate=p.windup>0||p.id===s.interceptor?.85:!celebrating&&s.ball.owner!==p.id?near*.55:0;
   const follow=p.strikeKind==='save'?0:p.kick*.8+Math.sin(p.kick*Math.PI)*.25,facing=p.keeper?Math.atan2(s.ball.x-p.x,s.ball.z-p.z):p.kick>0?p.strikeYaw:s.ball.owner===p.id&&s.charge>.18?Math.atan2(27-p.x,s.aim*4.5-p.z):p.yaw;
   // Moves vocabulary: skill moves, keeper roll-out, airplane + knee slide for the scorer, a high five from the nearest teammate,
   // chest/thigh control on high balls, headers and the chip's lofted strike.
   const sk=skillPoses[p.id];pose.skill=undefined;
   if(p.skill>0){const spec=STRIKER_SKILLS[p.skillKind];sk.type=p.skillKind;sk.progress=Math.min(1,1-p.skill/spec.seconds);sk.side=p.skillSide;pose.skill=sk;}
   else if(p.keeper&&s.ball.owner===p.id&&!celebrating){sk.type='keeperRoll';sk.progress=.12+(1-Math.max(0,Math.min(1,p.think/.75)))*.32;sk.side=1;pose.skill=sk;pose.dive=undefined;}
   else if(p.keeper&&p.kick>.05&&p.strikeKind==='pass'){sk.type='keeperRoll';sk.progress=.46+(1-p.kick)*.54;sk.side=1;pose.skill=sk;}
   else if(celebrating&&s.hitStop<=0&&!stage.reduced&&p.id===s.scorer){if(elapsed<.9){sk.type='airplane';sk.progress=Math.min(.8,elapsed/.9*.8);}else{sk.type='kneeSlide';sk.progress=Math.min(1,(elapsed-.9)/(STRIKER_GOAL_PAUSE-.9));}sk.side=1;pose.skill=sk;pose.celebrate=0;}
   else if(celebrating&&s.hitStop<=0&&!stage.reduced&&won&&s.scorer>=0&&p.id===(s.scorer%4===0?s.scorer+1:s.scorer-s.scorer%4)&&elapsed>.7){sk.type='highFive';sk.progress=Math.min(1,(elapsed-.7)/(STRIKER_GOAL_PAUSE-.7));sk.side=1;pose.skill=sk;}
   if(!pose.skill&&!celebrating){if(p.header>0){pose.reaction='header';pose.reactionProgress=1-p.header/.4;}else if(p.receive>0&&p.receiveHeight>.55){pose.reaction=p.receiveHeight>1.1?'chest':'thigh';pose.reactionProgress=1-p.receive/.22;}}
   if(p.kick>0&&p.strikeKind==='shot'&&s.chip&&p.id===s.lastKicker)pose.actionKind='loft';
   rig.root.position.set(p.x,0,p.z);rig.pose(anim,Math.hypot(p.vx,p.vz),facing,follow,stage.reduced?0:(pose.celebrate??0)*.12,p.vx*.035,pose);
  }
  const owner=s.ball.owner>=0?s.players[s.ball.owner]:null;
  let bx=s.ball.x,bz=s.ball.z,by=s.ball.y;if(owner&&owner.keeper){bx=owner.x+Math.sin(owner.yaw)*.45;bz=owner.z+Math.cos(owner.yaw)*.45;by=1.05;}else if(owner){const speed=Math.min(1,Math.hypot(owner.vx,owner.vz)/5),step=rigs[owner.id].motion.stride,cushion=owner.receive/.22,touch=Math.sin(step*2)*.095*speed*(1-cushion);bx+=(owner.x+owner.receiveX-bx)*cushion*cushion;bz+=(owner.z+owner.receiveZ-bz)*cushion*cushion;bx+=Math.sin(owner.yaw)*touch;bz+=Math.cos(owner.yaw)*touch;by+=Math.max(0,Math.sin(step*2))*.065*speed;}ball.position.set(bx,Math.max(.36,by),bz);ball.rotation.set(s.ball.spin*.7,0,s.ball.spin);
  const p=s.players[s.selected];
  if(s.selected!==lastSelected){if(lastSelected>=0)pop=1;lastSelected=s.selected;}pop=Math.max(0,pop-dt*3.2);
  ring.position.set(p.x,.065,p.z);ring.scale.setScalar(1+s.charge*.35+(stage.reduced?0:p.receive*.5+Math.sin(pop*Math.PI)*.6));ring.material.color.copy(ringGold).lerp(ringReceive,p.receive/.22);
  const head=(stage.mobile?2.05:1.8)*1.95;marker.visible=!celebrating;marker.position.set(p.x,head+(stage.reduced?0:Math.sin(clock*5)*.1+pop*.7),p.z);marker.scale.setScalar(stage.mobile?1.25:1+(stage.reduced?0:pop*.6));
  const aiming=s.charge>0&&s.ball.owner===s.selected;aim.visible=aiming;const aimX=27-p.x,aimZ=s.aim*(s.goalHalf-.1)-p.z,aimLength=Math.hypot(aimX,aimZ);aim.position.set(p.x+aimX*.5,.07,p.z+aimZ*.5);aim.rotation.y=Math.atan2(aimX,aimZ);aim.scale.z=aimLength;aim.scale.x=.1+s.charge*.08;
  // Predict the crossing height with the same numbers the shot will use.
  target.visible=aiming;if(aiming){const c=s.charge,speed=24+c*18,lift=2+c*3.2+(c>.93?(c-.93)/.07*3.4:0),zc=Math.max(-(s.goalHalf-.1),Math.min(s.goalHalf-.1,s.aim*(s.goalHalf-.1))),t=Math.hypot(25-p.x,zc-p.z)/speed,height=Math.max(.36,.3+lift*t-6*t*t),over=height>2.65;target.position.set(24.85,Math.min(3.6,height),zc);target.lookAt(stage.camera.position);target.scale.setScalar(1+c*.25);aimMaterial.color.copy(over?aimOver:aimGood);targetMaterial.color.copy(over?aimOver:aimGood);}
  // Gold corner: preview the cross from the taker to the chosen post (Q switches it).
  const cornerCross=s.setPiece.kind==='corner'&&s.setPiece.team===0,receiver=cornerCross?s.players[s.selected]:s.passTarget>=0?s.players[s.passTarget]:null;receiverRing.visible=passLine.visible=!!receiver&&!celebrating;if(receiver){receiverRing.position.set(receiver.x,.06,receiver.z);const from=cornerCross?s.players[s.setPiece.taker]:p,dx=receiver.x-from.x,dz=receiver.z-from.z;passLine.position.set((receiver.x+from.x)/2,.046,(receiver.z+from.z)/2);passLine.scale.z=Math.hypot(dx,dz);passLine.rotation.y=Math.atan2(dx,dz);
   // A defender in the lane turns the preview warm: choose another angle or move first.
   passMaterial.color.copy(safeLane).lerp(riskyLane,s.passRisk);receiverRing.material.color.copy(safeLane).lerp(riskyLane,s.passRisk);}
  const reader=s.interceptor>=0?s.players[s.interceptor]:null;interceptRing.visible=!!reader&&reader.team===1&&!celebrating;if(interceptRing.visible){interceptRing.position.set(s.interceptX,.07,s.interceptZ);interceptRing.scale.setScalar(1+(stage.reduced?0:Math.sin(clock*14)*.12));}
  {const incoming=s.ball.owner<0&&s.lastPasser>=0&&s.lastPasser<4&&s.lastPasser!==s.selected&&!celebrating,w=s.touchWindow;if(s.perfect!==lastPerfect){lastPerfect=s.perfect;perfectFlash=1;}perfectFlash=Math.max(0,perfectFlash-dt*3);
   touchRing.visible=incoming||perfectFlash>0;if(touchRing.visible){touchRing.position.set(p.x,.075,p.z);const queued=s.queuedPass>0||s.queuedShot>0;touchRing.scale.setScalar(perfectFlash>0?1+(1-perfectFlash)*1.6:1+Math.min(.7,Math.max(0,s.touchEta))/.7*1.8);touchRing.material.color.copy(touchIdle).lerp(touchHot,perfectFlash>0||queued?1:w);touchRing.material.opacity=perfectFlash>0?perfectFlash:w>0?.95:.5;}}
  {const runner=s.players.find(q=>q.team===0&&q.callRun>0);runRing.visible=!!runner&&!celebrating;if(runner){runRing.position.set(runner.x,.07,runner.z);runRing.scale.setScalar(1+(stage.reduced?0:Math.sin(clock*9)*.15));}
   for(const m of smallPosts)m.visible=s.mods.small;
   rain.visible=s.mods.rain&&!stage.reduced;if(rain.visible){rainY=(rainY+dt*16)%14;rain.position.y=-rainY;}
   // Team spirit full: the selected ring glows pink. Blue charging a Team Strike: its warning ring pulses.
   if(s.spirit[0]>=1&&!celebrating)ring.material.color.copy(spiritPink);
   for(const q of s.players){const w=warnings[q.id];if(q.strikeCharge>0){w.visible=true;w.position.set(q.x,.07,q.z);w.scale.setScalar(2.6-q.strikeCharge*1.2+(stage.reduced?0:Math.sin(clock*20)*.15));w.material.color.copy(spiritPink);}else w.material.color.copy(warnOrange);}}
  {const carrier=s.ball.owner>=4?s.players[s.ball.owner]:null;heavyRing.visible=!!carrier&&carrier.heavy>0&&!carrier.keeper&&!celebrating;if(heavyRing.visible){heavyRing.position.set(s.ball.x,.08,s.ball.z);heavyRing.scale.setScalar(1+Math.sin(carrier!.heavy/STRIKER_HEAVY_TOUCH*Math.PI)*.5);}}
  const presser=s.presser>=0?s.players[s.presser]:null,cover=s.cover>=0?s.players[s.cover]:null;coverLine.visible=!!presser&&!!cover&&s.level>=3&&!celebrating;if(presser&&cover&&coverLine.visible){const dx=cover.x-presser.x,dz=cover.z-presser.z;coverLine.position.set((cover.x+presser.x)/2,.05,(cover.z+presser.z)/2);coverLine.scale.z=Math.hypot(dx,dz);coverLine.rotation.y=Math.atan2(dx,dz);}
  ballShadow.position.set(bx,.055,bz);ballShadow.scale.setScalar(1+s.ball.y*.16);(ballShadow.material as T.MeshBasicMaterial).opacity=.4/(1+s.ball.y*.35);
  if(anim>0){trailAge+=anim;if(trailAge>.035){trailAge=0;const dot=trail[cursor++%trail.length],speed=Math.hypot(s.ball.vx,s.ball.vz),shot=speed>27;dot.position.copy(ball.position);dot.scale.setScalar(s.ball.owner<0&&speed>12&&!stage.reduced?(shot?.2:.12):0);dot.visible=true;trailMaterial.color.copy(s.teamStrike&&shot?trailSpecial:shot?trailShot:trailPass);}for(const dot of trail)dot.scale.multiplyScalar(Math.exp(-anim*4));}
  if(s.event!==lastEvent){lastEvent=s.event;if(s.eventKind==='shot'&&s.shotMoment>0){shotFlash=1;releaseRing.position.set(s.eventX,.08,s.eventZ);}if(['shot','goal','hit','post','save'].includes(s.eventKind))stage.burst(s.eventX,.6,s.eventZ,s.eventKind==='goal'?2:1);
   if(s.eventKind==='goal'){punch=1;shake=.9;goalFlash=1;throwConfetti(s.eventX,s.eventZ);}else if(s.eventKind==='save')punch=Math.max(punch,.25);else if(s.eventKind==='hit')shake=Math.max(shake,.3);}
  if(s.nearMiss!==lastNearMiss){lastNearMiss=s.nearMiss;punch=Math.max(punch,.4);shake=Math.max(shake,.35);}
  for(const net of nets){const active=celebrating&&Math.sign(s.eventX)===net.side&&!stage.reduced;if(!active&&!net.dirty)continue;const t=elapsed,amount=active?Math.sin(t*14)*Math.exp(-t*3.8)*.45:0;for(let i=0;i<net.rest.length;i+=3){const x=net.rest[i],y=net.rest[i+1],z=net.rest[i+2],falloff=Math.exp(-((x-s.eventZ*net.side)**2+(y-.8)**2)*.45);net.attribute.setZ(i/3,z+(z<-.1?-amount*falloff:0));}net.attribute.needsUpdate=true;net.dirty=active;}
  // Camera: charge focus on the shooter; a gentle push toward the scorer while celebrating.
  const scorer=celebrating&&s.scorer>=0&&s.hitStop<=0?s.players[s.scorer]:null;
  const desired=scorer?.32:s.ball.owner===s.selected?Math.max(0,Math.min(1,(s.charge-.18)/.65)):0;
  focusAmount+=(desired-focusAmount)*(1-Math.exp(-dt*(desired>focusAmount?(scorer?2.5:5):9)));
  // While charging, frame the shooter and a slice of the goal so the target stays in view.
  if(scorer)focusTarget.set(scorer.x,.8,scorer.z);else if(s.charge>0)focusTarget.set(p.x+(25-p.x)*.38,.8,p.z+(s.aim*4.5-p.z)*.38);else focusTarget.set(p.x,.8,p.z);cameraFocus.lerp(focusTarget,1-Math.exp(-dt*8));
  punch=Math.max(0,punch-dt*3.5);shake=Math.max(0,shake-dt*4);
  const motion=!stage.reduced,focus=motion?focusAmount:0,zoom=1+focus*1.65+(motion?Math.sin(Math.min(1,punch)*Math.PI*.5)*punch*.16:0);
  stage.camera.position.copy(cameraHome);stage.camera.position.x+=cameraFocus.x*focus;stage.camera.position.z+=cameraFocus.z*focus;
  if(motion&&shake>0){stage.camera.position.x+=Math.sin(clock*53)*shake*.35;stage.camera.position.y+=Math.sin(clock*61)*shake*.2;}
  stage.camera.lookAt(cameraFocus.x*focus,.8*focus,cameraFocus.z*focus);
  if(Math.abs(stage.camera.zoom-zoom)>.0001){stage.camera.zoom=zoom;stage.camera.updateProjectionMatrix();}
  powerRing.visible=s.ball.owner===s.selected&&s.charge>.18;powerRing.position.set(p.x,.065,p.z);powerRing.scale.setScalar(1+s.charge*.5+(stage.reduced?0:Math.sin(s.time*22)*s.charge*.04));
  shotFlash=Math.max(0,shotFlash-dt*2.8);releaseRing.visible=shotFlash>0&&!stage.reduced;releaseRing.scale.setScalar(1+(1-shotFlash)*7);releaseRing.material.opacity=shotFlash;
  goalFlash=Math.max(0,goalFlash-dt*.8);
  glassFloor.update(dt,s.ball.x,s.ball.z,s.charge,Math.max(shotFlash,stage.reduced?0:goalFlash));
  stepFans(dt,s.crowd);stepConfetti(anim>0?dt:0);
  stage.effects(anim>0?dt:0);stage.lighting(s.time);
  // Portrait play attacks upward; controls are transformed into this view.
 }
 fit();update(0);return{stage,fit,update,screenAxes,rigs,get portrait(){return portrait;}};
}
