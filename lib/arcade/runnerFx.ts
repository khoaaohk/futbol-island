import * as T from 'three';
import type {ArcadeStage} from './arcadeStage';
import {RUNNER_DEFENDER_REACH,RUNNER_SKILLS,RUNNER_SKILL_WINDOW,runnerContactTime,type RunnerGame,type RunnerObject} from './runnerGame';
import {skillBall,skillFrame,type SkillMove} from '../graphics/skillMoves';
import {sideGameDress} from '../town/beanLooks';
import type {ArcadePoseOptions} from './arcadePlayerMotion';
import {readRunnerProgress,runnerBallFor} from './runnerMissions';
import {districtAt,DISTRICTS,routeGrade} from '../../components/games/runnerRoute';
import {createRunnerTrack} from './runnerTrack';

/**
 * Breakaway Run presentation layer: speed lines, plant dust, goal confetti,
 * district crowd stands, tackle telegraphs and camera feel.
 *
 * Heat budget: every effect is ONE pooled draw call (instanced or a single
 * buffer), built once here; per-frame work only rewrites preallocated arrays.
 * Effects hide themselves (no draw call) while idle. Reduced motion removes
 * speed lines, confetti, crowd bob, camera follow, shake and FOV changes.
 */
export const RUNNER_ROLE_COLOURS={jockey:'#b993ff',tackler:'#ff7d5e',sweeper:'#62c9ff',presser:'#7fe08e',wall:'#ffd166',pair:'#ff9bd2',line:'#e8eef7'} as const;
const LINES=26,DUST=18,CONFETTI=42,ARC_SEGMENTS=24,STAND_PERIOD=70,STAND_LENGTH=15,FANS_PER_ROW=17,ROWS=3;
const clamp01=(v:number)=>Math.max(0,Math.min(1,v));

export function createRunnerFx(stage:ArcadeStage){
 const {scene,reduced}=stage;
 const dummy=new T.Object3D(),colour=new T.Color();
 let descent=0,elapsed=0,trauma=0,hitstop=0,hitstopScale=1,follow=0,fov=0,lineFlash=0,hype=0,slideDust=0,punch=0;
 const seen={event:0,cuts:0,landings:0,nearMisses:0,hurdles:0,beatScores:0,state:null as RunnerGame|null};

 /* ---------- speed lines: one quad buffer, side streaks only ---------- */
 const linePos=new Float32Array(LINES*12),lineSeed=new Float32Array(LINES*4);
 const lineIndex:number[]=[];for(let i=0;i<LINES;i++){const v=i*4;lineIndex.push(v,v+1,v+2,v,v+2,v+3);}
 for(let i=0;i<LINES;i++){const side=i%2?1:-1;lineSeed[i*4]=side*(4.9+((i*37)%23)/23*4.2);lineSeed[i*4+1]=.12+((i*53)%17)/17*2.4;lineSeed[i*4+2]=-62+((i*29)%31)/31*70;lineSeed[i*4+3]=1.4+((i*13)%7)/7*1.8;}
 const lineGeometry=new T.BufferGeometry();lineGeometry.setAttribute('position',new T.BufferAttribute(linePos,3).setUsage(T.DynamicDrawUsage));lineGeometry.setIndex(lineIndex);
 lineGeometry.boundingSphere=new T.Sphere(new T.Vector3(0,1,-27),60);
 const lineMaterial=new T.MeshBasicMaterial({color:'#c9f6ff',transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,toneMapped:false});
 const lines=new T.Mesh(lineGeometry,lineMaterial);lines.name='runner-speed-lines';lines.visible=false;lines.frustumCulled=false;scene.add(lines);

 /* ---------- pooled plant dust ---------- */
 const dust=new T.InstancedMesh(new T.IcosahedronGeometry(.13,0),new T.MeshBasicMaterial({color:'#efd9ad',transparent:true,opacity:.5,depthWrite:false}),DUST);
 dust.name='runner-dust';dust.instanceMatrix.setUsage(T.DynamicDrawUsage);dust.frustumCulled=false;dust.visible=false;scene.add(dust);
 const dustLife=new Float32Array(DUST),dustPos=new Float32Array(DUST*3),dustVel=new Float32Array(DUST*3);let dustCursor=0;
 function puff(x:number,z:number,count:number,spread:number,lift=.6){for(let n=0;n<count;n++){const i=dustCursor++%DUST,j=i*3,a=(n/count)*Math.PI*2+elapsed*7;dustLife[i]=.38+((n*7)%5)*.04;dustPos[j]=x+Math.cos(a)*.12;dustPos[j+1]=.08;dustPos[j+2]=z+Math.sin(a)*.1;dustVel[j]=Math.cos(a)*spread;dustVel[j+1]=lift*(.6+((n*3)%4)*.15);dustVel[j+2]=Math.sin(a)*spread*.5;}dust.visible=true;}

 /* ---------- goal confetti ---------- */
 const confetti=new T.InstancedMesh(new T.PlaneGeometry(.16,.1),new T.MeshBasicMaterial({side:T.DoubleSide,toneMapped:false}),CONFETTI);
 confetti.name='runner-confetti';confetti.instanceMatrix.setUsage(T.DynamicDrawUsage);confetti.frustumCulled=false;confetti.visible=false;scene.add(confetti);
 const palette=['#ffe07a','#ff7aa8','#7ff0e2','#ffffff','#b993ff','#ff9b5e'];for(let i=0;i<CONFETTI;i++)confetti.setColorAt(i,colour.set(palette[i%palette.length]));
 const confLife=new Float32Array(CONFETTI),confPos=new Float32Array(CONFETTI*3),confVel=new Float32Array(CONFETTI*3),confSpin=new Float32Array(CONFETTI*3);
 function celebrate(x:number,z:number){if(reduced)return;for(let i=0;i<CONFETTI;i++){const j=i*3,a=i*2.399,r=.3+(i%5)*.12;confLife[i]=1.25+(i%7)*.08;confPos[j]=x+Math.cos(a)*.4;confPos[j+1]=1.6+(i%3)*.25;confPos[j+2]=z;confVel[j]=Math.cos(a)*r*7;confVel[j+1]=4+(i%4)*1.1;confVel[j+2]=3+Math.sin(a)*2.5;confSpin[j]=a;confSpin[j+1]=a*1.7;confSpin[j+2]=3+(i%5);}confetti.visible=true;}

 /* ---------- crowd stands: two recycled blocks, one instanced draw each ---------- */
 // Instances per block: 3 stepped terraces + a back board per side, then fan
 // bodies and heads. aBob > 0 marks a fan (its bob phase); 0 is structure.
 const structurePerSide=ROWS+1,fansPerSide=ROWS*FANS_PER_ROW,perSide=structurePerSide+fansPerSide*2,perBlock=perSide*2;
 const crowdUniforms={uTime:{value:0},uAmp:{value:0},uRate:{value:7}};
 const crowdMaterial=new T.MeshLambertMaterial({color:'#ffffff'});
 // The bob is applied in world space through the route bend's hook (runnerTrack), so stands follow the curve.
 crowdMaterial.onBeforeCompile=shader=>{Object.assign(shader.uniforms,crowdUniforms);
  shader.vertexShader='attribute float aBob;\nuniform float uTime;uniform float uAmp;uniform float uRate;\n#define RUNNER_WORLD_HOOK rbW.y+=step(.5,aBob)*abs(sin(uTime*uRate+aBob*6.2831))*uAmp;\n'+shader.vertexShader;};
 crowdMaterial.customProgramCacheKey=()=>'runner-crowd-bob-2';
 const crowdGeometry=new T.BoxGeometry(1,1,1);const bob=new Float32Array(perBlock);
 for(let side=0;side<2;side++){const base=side*perSide;for(let f=0;f<fansPerSide;f++){const phase=1+((f*0.618)%1);bob[base+structurePerSide+f*2]=phase;bob[base+structurePerSide+f*2+1]=phase;}}
 crowdGeometry.setAttribute('aBob',new T.InstancedBufferAttribute(bob,1));
 type Stand={mesh:T.InstancedMesh;base:number;z:number};
 const stands:Stand[]=[0,1].map(i=>{const mesh=new T.InstancedMesh(crowdGeometry,crowdMaterial,perBlock);mesh.name=`runner-crowd-${i}`;mesh.castShadow=mesh.receiveShadow=false;mesh.frustumCulled=false;mesh.visible=false;scene.add(mesh);return{mesh,base:i*STAND_PERIOD/2-STAND_LENGTH/2,z:999};});
 const shirtSets=[['#ffd36e','#7ff0e2','#ffffff','#ff8fb1'],['#e8b9a6','#a8d8c8','#f3e3b4','#c4b4e8'],['#5fd6c8','#f6c453','#fff4da','#ef8a6a']];
 const terrace=['#2a3f6e','#3b3366','#24505a'];
 /** Rebuild one stand when it re-enters at the far end, under the fog. */
 function fillStand(stand:Stand,distance:number,goalNear:boolean){
  const district=districtAt(distance+60),kind=district.kind,fill=goalNear?.95:kind===0?.9:kind===1?.55:0;
  stand.mesh.visible=fill>0;if(!fill)return;
  const shirts=shirtSets[DISTRICTS.indexOf(district)%3];let n=0;
  for(const side of[-1,1]){
   for(let r=0;r<ROWS;r++){const h=.3+r*.42;dummy.position.set(side*(5.55+r*.78),h/2-.1,0);dummy.scale.set(.76,h,STAND_LENGTH);dummy.rotation.set(0,0,0);dummy.updateMatrix();stand.mesh.setMatrixAt(n,dummy.matrix);stand.mesh.setColorAt(n++,colour.set(terrace[(r+kind)%3]));}
   dummy.position.set(side*(5.55+ROWS*.78),.95,0);dummy.scale.set(.18,2.1,STAND_LENGTH);dummy.updateMatrix();stand.mesh.setMatrixAt(n,dummy.matrix);stand.mesh.setColorAt(n++,colour.set(kind===0?'#ffd36e':'#7ff0e2'));
   for(let r=0;r<ROWS;r++)for(let f=0;f<FANS_PER_ROW;f++){
    const h=.3+r*.42,x=side*(5.55+r*.78),z=-STAND_LENGTH/2+.45+f*(STAND_LENGTH-.9)/(FANS_PER_ROW-1),hash=((f*73+r*31+Math.floor(distance))%97)/97,present=hash<fill;
    dummy.position.set(x,h+.18,z);dummy.scale.set(present?.36:0,present?.46:0,present?.32:0);dummy.updateMatrix();stand.mesh.setMatrixAt(n,dummy.matrix);stand.mesh.setColorAt(n++,colour.set(shirts[(f+r*2)%shirts.length]));
    dummy.position.set(x,h+.55,z);dummy.scale.set(present?.25:0,present?.25:0,present?.25:0);dummy.updateMatrix();stand.mesh.setMatrixAt(n,dummy.matrix);stand.mesh.setColorAt(n++,colour.set(hash<.5?'#e9b48f':'#8a5a3c'));
   }
  }
  stand.mesh.instanceMatrix.needsUpdate=true;if(stand.mesh.instanceColor)stand.mesh.instanceColor.needsUpdate=true;
 }

 /* ---------- tackle telegraphs (attached once to each pooled defender) ---------- */
 const stripGeometry=new T.PlaneGeometry(1,1);stripGeometry.rotateX(-Math.PI/2);stripGeometry.translate(0,0,.5);
 type Tele={strip:T.Mesh<T.PlaneGeometry,T.MeshBasicMaterial>;arc:T.Mesh<T.RingGeometry,T.MeshBasicMaterial>;role:string};
 const defenders:T.Group[]=[];
 function prepareDefender(g:T.Group){
  if(g.userData.tele)return;defenders.push(g);
  const strip=new T.Mesh(stripGeometry,new T.MeshBasicMaterial({color:'#ff7d5e',transparent:true,opacity:0,depthWrite:false,toneMapped:false}));strip.name='runner-tackle-lane';strip.position.y=.03;strip.renderOrder=1;
  const arc=new T.Mesh(new T.RingGeometry(.7,.84,ARC_SEGMENTS,1,Math.PI/2,Math.PI*2),new T.MeshBasicMaterial({color:'#ff7d5e',transparent:true,opacity:.9,depthWrite:false,side:T.DoubleSide,toneMapped:false}));arc.name='runner-read-arc';arc.rotation.x=-Math.PI/2;arc.position.y=.045;arc.renderOrder=2;
  strip.visible=arc.visible=false;g.add(strip,arc);g.userData.tele={strip,arc,role:''} as Tele;
 }
 /** Read arc fills while the defender reads you; the lane strip shows where the
  * committed tackle will land and how far it reaches. Colour = role. */
 function defender(g:T.Group,o:RunnerObject,s:RunnerGame){
  if(g.userData.role!==(o.role??'jockey'))g.userData.bendDirty=true;
  const tele=g.userData.tele as Tele|undefined;if(!tele)return;
  const role=o.role??'jockey',t=o.tackle??0,active=o.read!==undefined&&!o.knock&&!o.beaten&&s.lives>0&&(!o.passed||t>0&&t<.7);
  // Wrong-footed by a skill move or one-two: stumble the wrong way, no telegraph.
  const pose=(g.userData.pose??(g.userData.pose={vx:0,vz:0,anticipate:0,slide:0})) as ArcadePoseOptions;
  pose.reaction=o.beaten?'stumble':undefined;pose.reactionProgress=o.beaten?Math.min(1,o.beaten/.9):undefined;
  if(o.beaten&&!reduced){const side=Math.sign((o.x??0)-s.x)||1;g.rotation.z=-side*.22*Math.min(1,o.beaten*5);}
  tele.strip.visible=tele.arc.visible=active;if(!active)return;
  if(tele.role!==role){tele.role=role;const c=RUNNER_ROLE_COLOURS[role];tele.strip.material.color.set(c);tele.arc.material.color.set(c);}
  const tell=role==='tackler'?.65:.5,read=clamp01((o.read??0)/tell),committed=(o.read??0)>tell&&o.z>-12,reach=RUNNER_DEFENDER_REACH[role];
  tele.arc.geometry.setDrawRange(0,Math.max(1,Math.round(read*ARC_SEGMENTS))*6);
  const pulse=committed&&!reduced?1+Math.sin(elapsed*22)*.08:1;tele.arc.scale.setScalar(pulse);tele.arc.visible=t<.7;
  // Skill window: the read arc flashes white while a skill move would beat this defender.
  const time=runnerContactTime(s,o),inPath=Math.abs(s.x-g.position.x)<reach.x+.35,window=inPath&&s.balls>0&&time<=RUNNER_SKILL_WINDOW.early&&time>=RUNNER_SKILL_WINDOW.late;
  if(window)tele.arc.material.color.set('#ffffff');tele.role=window?'':tele.role;
  // Closer and back line preview where they are about to step; the strip slides to the next lane first.
  const nextLane=o.closeTo!==undefined?o.closeTo:role==='line'&&o.z<-18&&((o.lineClock??0)%1.7)>1.25?(o.lane===(o.slot??0)?o.lane-1:o.lane+1):undefined;
  const ox=g.position.x,dx=nextLane!==undefined?(nextLane*2.4-ox)*.85:committed?Math.max(-1.2,Math.min(1.2,(o.aim??ox)-ox)):0,length=reach.z+.5+(o.press??0)*2.5;
  tele.strip.position.x=dx*.5;tele.strip.scale.set(reach.x*2,1,length);
  tele.strip.material.opacity=t>=.7?Math.max(0,.4*(1-(t-.7)/.3)):t>.08?.5:committed?.3+(reduced?0:Math.sin(elapsed*18)*.06):.07+read*.12;
 }


 /* ---------- round 2 depth visuals (all pooled, hidden when idle) ---------- */
 // Power-run shield: one ring at the runner's feet while it can still ride a tackle.
 const shield=new T.Mesh(new T.TorusGeometry(.62,.045,6,28),new T.MeshBasicMaterial({color:'#9ff6ff',transparent:true,opacity:.75,depthWrite:false,toneMapped:false}));
 shield.name='runner-shield';shield.rotation.x=-Math.PI/2;shield.visible=false;scene.add(shield);
 // Keeper: one pooled island rig in goalkeeper colours, shown only for keeper goals.
 const keeper=stage.player('#3fd18b',sideGameDress('runner-keeper','away',1));keeper.root.name='runner-keeper';keeper.root.visible=false;keeper.root.scale.setScalar(1.12);
 const keeperPose:ArcadePoseOptions={keeper:1,anticipate:.6,vx:0,vz:0,dive:undefined};const keeperDive={progress:0,dir:1 as -1|1};
 // Teammates for the one-two: two pooled rigs in the runner's own colours, on the wing.
 const mates=[0,1].map(i=>{const rig=stage.player('#efbd58',sideGameDress('runner-mate-'+i,'home',7+i));rig.root.name='runner-mate-'+i;rig.root.visible=false;rig.root.scale.setScalar(1.08);return{rig,pose:{vx:0,vz:0,anticipate:.4} as ArcadePoseOptions};});
 const passBall=stage.football(.22);passBall.name='runner-pass-ball';passBall.visible=false;
 const callout=new T.Mesh(new T.RingGeometry(.5,.62,24),new T.MeshBasicMaterial({color:'#efbd58',transparent:true,opacity:.8,depthWrite:false,side:T.DoubleSide,toneMapped:false}));callout.rotation.x=-Math.PI/2;callout.position.y=.04;callout.visible=false;scene.add(callout);
 // Puddles: one instanced draw for up to four flat patches.
 const MUD=4,mud=new T.InstancedMesh(new T.CircleGeometry(1,20),new T.MeshBasicMaterial({color:'#6b4a2f',transparent:true,opacity:.82,depthWrite:false}),MUD);
 mud.name='runner-mud';mud.rotation.x=0;mud.frustumCulled=false;mud.visible=false;mud.renderOrder=1;scene.add(mud);
 // Route fork: two arches with painted labels (built once).
 const fork=new T.Group();fork.name='runner-fork';fork.visible=false;scene.add(fork);
 function label(text:string,sub:string,bg:string){const c=document.createElement('canvas');c.width=256;c.height=96;const g=c.getContext('2d');if(g){g.fillStyle=bg;g.fillRect(0,0,256,96);g.fillStyle='#ffffff';g.font='bold 40px Arial';g.textAlign='center';g.fillText(text,128,46);g.font='bold 20px Arial';g.fillText(sub,128,80);}
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return new T.Mesh(new T.PlaneGeometry(2.2,.82),new T.MeshBasicMaterial({map:t,toneMapped:false,side:T.DoubleSide}));}
 if(typeof document!=='undefined'){
  const wing=label('WING','safer · cross','#2a7f9e'),middle=label('MIDDLE','busy · goals ×2','#a8406f');
  wing.position.set(-2.4,2.6,0);middle.position.set(1.2,2.6,0);middle.scale.set(1.5,1,1);fork.add(wing,middle);
  for(const x of[-3.6,-1.2,3.6])stage.box(x,1.3,0,.14,2.6,.14,x===-1.2?'#ffe084':'#fff3d9',fork).castShadow=false;
  stage.box(-2.4,2.6,-.05,2.5,.12,.12,'#7ff0e2',fork).castShadow=false;stage.box(1.2,2.6,-.05,4.9,.12,.12,'#ff7aa8',fork).castShadow=false;
  fork.children.forEach(c=>{if(c.parent!==fork){c.parent?.remove(c);fork.add(c);}});
 }
 const skillOut={x:0,y:0,z:0},frameOut={x:0,z:0,heading:0};
 const skillMotion={type:'stepover' as SkillMove,progress:0,side:1 as -1|1};
 /** Skill moves and the one-two on the runner: rig skill pose and the ball's path. */
 let ballSkin='classic';const skinMaterials=new Map<string,[T.Material,T.Material]>();
 /** The ball unlocked by missions (cosmetic): swaps the runner ball's two materials once. */
 function skinBall(ball:T.Object3D){const skin=runnerBallFor(readRunnerProgress());if(skin.id===ballSkin)return;ballSkin=skin.id;
  let mats=skinMaterials.get(skin.id);if(!mats){mats=[new T.MeshStandardMaterial({color:skin.base,roughness:.55}),new T.MeshStandardMaterial({color:skin.patch,roughness:.6})];skinMaterials.set(skin.id,mats);}
  ball.children.forEach((child,i)=>{if(child instanceof T.Mesh){if(!child.userData.baseMaterial)child.userData.baseMaterial=child.material;child.material=skin.id==='classic'?child.userData.baseMaterial:mats![i===0?0:1];}});}
 function player(s:RunnerGame,pose:ArcadePoseOptions,ball:T.Object3D){
  skinBall(ball);
  if(s.skill&&s.skill!=='chipShot'){const spec=RUNNER_SKILLS[s.skill],p=Math.min(1,s.skillT/spec.seconds);skillMotion.type=s.skill as SkillMove;skillMotion.progress=p;skillMotion.side=s.skillSide;pose.skill=skillMotion;pose.dribbling=false;
   const b=skillBall(skillMotion.type,p,skillMotion.side,skillOut),f=skillFrame(skillMotion.type,p,skillMotion.side,frameOut);
   if(b&&ball.visible){ball.position.set(s.x-(b.x-f.x)*1.15,b.y*1.15,-Math.max(-.3,Math.min(1.5,b.z-f.z))*1.15);}}
  else pose.skill=undefined;
 }
 function depth(dt:number,s:RunnerGame){
  shield.visible=s.shield&&s.lives>0;if(shield.visible){shield.position.set(s.x,.06+s.y*.65,0);const k=reduced?1:1+Math.sin(elapsed*9)*.08;shield.scale.setScalar(k);}
  // Keeper
  const goal=s.objects.find(o=>o.kind==='goal'&&o.keeper&&o.z<1.5&&!(o.scored&&(o.goalBurst??0)>1.1));
  keeper.root.visible=!!goal;
  if(goal){const out=goal.kout??0,z=goal.z+.55+out*7;keeper.root.position.set(goal.kx??0,0,z);
   const saving=(goal.reaction??0)>0;keeperPose.vx=goal.vx??0;keeperPose.vz=out>0&&out<1?7:0;keeperPose.anticipate=saving?0:.6;
   if(saving){keeperDive.progress=1-(goal.reaction??0)/.5;keeperDive.dir=(goal.hitX??0)>(goal.kx??0)?-1:1;keeperPose.dive=keeperDive;}else keeperPose.dive=undefined;
   keeper.pose(dt,Math.abs(goal.vx??0)+(out>0&&out<1?7:0),Math.atan2((s.x-(goal.kx??0))*.3,Math.max(4,-z)),0,0,(goal.vx??0)*.08,keeperPose);}
  // Teammates and the one-two ball
  let m=0;for(const o of s.objects){if(o.kind!=='mate'||o.z>3||m>=mates.length)continue;const mate=mates[m++];mate.rig.root.visible=true;mate.rig.root.position.set(o.x??o.lane*4.3,0,o.z);
   const kicking=s.pass.phase==='out'&&s.pass.t>.22||s.pass.phase==='back'&&s.pass.t<.18;mate.pose.anticipate=o.passed?.2:.6;
   mate.rig.pose(dt,0,Math.atan2(s.x-(o.x??0),Math.max(3,-o.z))+(o.passed?0:0),kicking&&o.passed?.7:0,0,0,mate.pose);
   if(!o.passed&&o.z>-26&&o.z<-3){callout.visible=s.lane===o.lane;callout.position.set(o.x??0,.04,o.z);callout.scale.setScalar(reduced?1:1+Math.sin(elapsed*7)*.1);}}
  for(;m<mates.length;m++)mates[m].rig.root.visible=false;
  if(!s.objects.some(o=>o.kind==='mate'&&!o.passed&&o.z>-26&&o.z<-3))callout.visible=false;
  passBall.visible=!!s.pass.phase;
  if(s.pass.phase){const mate=s.objects.find(o=>o.kind==='mate'&&o.passed),mx=mate?.x??s.pass.mateX,mz=mate?.z??s.pass.mateZ,p=Math.min(1,s.pass.t/.32);
   if(s.pass.phase==='out')passBall.position.set(s.x+(mx-s.x)*p,.22+Math.sin(p*Math.PI)*.35,-.7+(mz+.7)*p);
   else passBall.position.set(mx+(s.x-mx)*p,.22+Math.sin(p*Math.PI)*.35,mz+(-1.2-mz)*p);passBall.rotation.x+=dt*20;}
  // Puddles
  let n=0;for(const o of s.objects){if(o.kind!=='mud'||n>=MUD)continue;const len=o.length??2.6;if(o.z-len>4)continue;dummy.position.set(o.lane*2.4,.035,o.z-len/2);dummy.rotation.set(-Math.PI/2,0,0);dummy.scale.set(1.05,len/2,1);dummy.updateMatrix();mud.setMatrixAt(n++,dummy.matrix);}
  mud.count=n;mud.visible=n>0;if(n)mud.instanceMatrix.needsUpdate=true;
  // Fork
  const f=s.objects.find(o=>o.kind==='fork'&&o.z<4);fork.visible=!!f;if(f)fork.position.z=f.z;
 }
 /* ---------- pop words: one pooled billboard for the big moments (GOAL!, DODGED!, STEP-OVER!) ---------- */
 // Kids read one big word faster than a sentence. One plane + one canvas texture, redrawn only on an event
 // (never per frame); hidden when idle so it costs no draw call. Reduced motion: a plain fade, no pop or rise.
 const WORD_W=512,WORD_H=176;let wordCanvas:HTMLCanvasElement|undefined,wordCtx:CanvasRenderingContext2D|null=null,wordTexture:T.CanvasTexture|undefined;
 const wordMaterial=new T.MeshBasicMaterial({transparent:true,opacity:0,depthTest:false,depthWrite:false,toneMapped:false,side:T.DoubleSide});
 const word=new T.Mesh(new T.PlaneGeometry(1,WORD_H/WORD_W),wordMaterial);word.name='runner-pop-word';word.visible=false;word.renderOrder=20;word.frustumCulled=false;word.rotation.x=-.32;scene.add(word);
 if(typeof document!=='undefined'){wordCanvas=document.createElement('canvas');wordCanvas.width=WORD_W;wordCanvas.height=WORD_H;wordCtx=wordCanvas.getContext('2d');wordTexture=new T.CanvasTexture(wordCanvas);wordTexture.colorSpace=T.SRGBColorSpace;wordMaterial.map=wordTexture;}
 let wordAge=0,wordLife=0,wordSize=1,wordX=0,wordText='';
 /** Show a word (and an optional short line under it). `size` is the world width at full scale. */
 function pop(text:string,fill:string,size:number,life:number,sub=''){
  if(!wordCtx||!wordTexture)return;
  const g=wordCtx;g.clearRect(0,0,WORD_W,WORD_H);g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';
  let px=118;g.font=`${px}px Impact, "Arial Black", Arial, sans-serif`;const fit=WORD_W-40;const w=g.measureText(text).width;if(w>fit){px=Math.floor(px*fit/w);g.font=`${px}px Impact, "Arial Black", Arial, sans-serif`;}
  const y=sub?72:WORD_H/2;g.lineWidth=Math.max(8,px*.16);g.strokeStyle='#1a1036';g.strokeText(text,WORD_W/2,y);g.fillStyle=fill;g.fillText(text,WORD_W/2,y);
  if(sub){g.font='bold 30px Arial, sans-serif';g.lineWidth=8;g.strokeText(sub,WORD_W/2,148,WORD_W-24);g.fillStyle='#ffffff';g.fillText(sub,WORD_W/2,148,WORD_W-24);}
  wordTexture.needsUpdate=true;wordText=text;wordAge=0;wordLife=life;wordSize=size*(stage.mobile?1:1.3);word.visible=true;
 }
 function stepWord(dt:number,s:RunnerGame){
  if(!word.visible)return;wordAge+=dt;if(wordAge>=wordLife){word.visible=false;wordMaterial.opacity=0;return;}
  const t=wordAge/wordLife,inT=clamp01(wordAge/.2),fade=clamp01((wordLife-wordAge)/.3);
  // Ease-out-back pop, then a slow drift up; the word follows the runner a little so it stays readable.
  const back=1+2.2*Math.pow(inT-1,3)+1.2*Math.pow(inT-1,2),k=reduced?1:.35+.65*back;
  wordX+=(s.x*.45-wordX)*(1-Math.exp(-dt*6));
  word.scale.set(wordSize*k,wordSize*k,1);word.position.set(wordX,(stage.mobile?3.1:2.7)+(reduced?0:t*.5),-7);
  wordMaterial.opacity=Math.min(reduced?clamp01(wordAge/.12):1,fade);
 }
 /* ---------- per-frame ---------- */
 function update(dt:number,s:RunnerGame){
  elapsed+=dt;
  if(seen.state!==s){seen.state=s;seen.event=s.event;seen.cuts=s.cuts;seen.landings=s.landings;seen.nearMisses=s.nearMisses;seen.hurdles=s.hurdles;seen.beatScores=s.beatScores;}
  // Counters → one-shot juice. Nothing here allocates.
  if(s.cuts!==seen.cuts){seen.cuts=s.cuts;puff(s.x-s.cutDir*.25,.1,3,.9,.45);}
  if(s.landings!==seen.landings){seen.landings=s.landings;puff(s.x,0,4,1.1,.5);}
  if(s.nearMisses!==seen.nearMisses){seen.nearMisses=s.nearMisses;lineFlash=1;hitstop=.11;hitstopScale=.45;pop(s.nearStreak>2?`${s.nearStreak} IN A ROW!`:'DODGED!','#7ff0e2',3.4,.8);}
  if(s.hurdles!==seen.hurdles){seen.hurdles=s.hurdles;pop('HURDLED!','#7ff0e2',3.4,.8);}
  depth(dt,s);
  if(s.event!==seen.event){seen.event=s.event;const kind=s.eventKind;
   if(kind==='skillmove'){lineFlash=Math.max(lineFlash,.7);hitstop=.08;hitstopScale=.4;puff(s.x,-.4,4,1.2,.5);if(s.skill&&s.skill!=='chipShot')pop(`${RUNNER_SKILLS[s.skill].label.toUpperCase()}!`,s.skillPerfect?'#ffe07a':'#ffffff',3.8,1,s.skillPerfect?'PERFECT TIMING':'');}
   else if(kind==='early')pop('TOO EARLY!','#ffb27a',3,.8,'Wait until they are close');
   else if(kind==='shield'){trauma=Math.min(1,trauma+.3);hitstop=.06;hitstopScale=.2;puff(s.x,-.3,6,1.8,.8);}
   else if(kind==='mud')puff(s.x,-.2,6,1.4,.3);
   else if(kind==='onetwo'||kind==='boss'&&s.boss===0){lineFlash=1;hype=Math.max(hype,.7);}
   if(kind==='hit'){trauma=Math.min(1,trauma+(s.lives>0?.55:.8));hitstop=s.lives>0?.09:.14;hitstopScale=.06;puff(s.x,-.1,6,1.6,.9);pop(s.lives>0?'TACKLED!':'FULL TIME','#ff7d5e',3.4,1,s.lives>0?`${s.lives} chance${s.lives===1?'':'s'} left`:'');}
   else if(kind==='goal'){
    // The goal moment: a breath of slow motion as the net bursts, a camera punch-in and the word itself.
    trauma=Math.min(1,trauma+.32);hitstop=reduced?.06:.3;hitstopScale=reduced?.3:.35;celebrate(s.eventX,s.eventZ);hype=1;punch=1;
    const beatFirst=s.beatScores!==seen.beatScores;seen.beatScores=s.beatScores;
    pop('GOAL!','#ffe07a',5.2,1.5,beatFirst?'Beat the tackle, found the goal!':s.streak>1?`${Math.min(3,s.streak)} in a row!`:'');}
   else if(kind==='save')pop('SAVED!','#ff9bd2',3.2,.9,'Shoot where the keeper is not');
   else if(kind==='onetwo')pop('ONE-TWO!','#ffe07a',3.8,1);
   else if(kind==='boss'&&s.boss===0&&s.lives>0&&/BEATEN/.test(s.message))pop('BACK LINE BEATEN!','#ffe07a',4.6,1.2);
   else if(kind==='shield')pop('RODE IT!','#9ff6ff',3.4,.9);
   else if(kind==='mission')pop('★ MISSION!','#ffe07a',4,1.3);
   else if(kind==='shot'&&s.lastBlast>=.8)trauma=Math.min(1,trauma+.28);
  }
  if(s.slide>.15&&s.lives>0){slideDust-=dt;if(slideDust<=0){slideDust=.07;puff(s.x+.2,.25,1,.5,.35);}}
  hitstop=Math.max(0,hitstop-dt);trauma=Math.max(0,trauma-dt*2.4);lineFlash=Math.max(0,lineFlash-dt*2.5);punch=Math.max(0,punch-dt*1.6);stepWord(dt,s);
  const travel=s.speed*dt*(s.lives>0||s.outro>0?1:0);

  // Speed lines: invisible at kick-off pace, building with speed, boost and near misses.
  // Descents add streaks: the slope is doing the work, so speed reads as the ground falls away.
  descent+=(clamp01((-routeGrade(s.distance)-.025)/.07)*(s.lives>0?1:0)-descent)*(1-Math.exp(-dt*4));
  const strength=reduced?0:Math.min(.75,clamp01((s.speed-13.4)/4.6)*.32+(s.boost>0?.32:0)+lineFlash*.4+descent*.36);
  lineMaterial.opacity=strength;lines.visible=strength>.015;
  if(lines.visible){const stretch=.6+s.speed/9;for(let i=0;i<LINES;i++){const k=i*4;lineSeed[k+2]+=travel*1.7;if(lineSeed[k+2]>8)lineSeed[k+2]-=70;const x=lineSeed[k],y=lineSeed[k+1],z=lineSeed[k+2],len=lineSeed[k+3]*stretch,w=.022+(i%3)*.008,j=i*12;
   linePos[j]=x-w;linePos[j+1]=y;linePos[j+2]=z;linePos[j+3]=x+w;linePos[j+4]=y;linePos[j+5]=z;linePos[j+6]=x+w;linePos[j+7]=y;linePos[j+8]=z+len;linePos[j+9]=x-w;linePos[j+10]=y;linePos[j+11]=z+len;}
   lineGeometry.attributes.position.needsUpdate=true;}

  // Dust drifts back with the pitch and swells as it fades.
  if(dust.visible){let alive=false;for(let i=0;i<DUST;i++){const j=i*3;if(dustLife[i]>0){dustLife[i]-=dt;dustVel[j+1]-=dt*2.2;dustPos[j]+=dustVel[j]*dt;dustPos[j+1]=Math.max(.05,dustPos[j+1]+dustVel[j+1]*dt);dustPos[j+2]+=dustVel[j+2]*dt+travel;alive||=dustLife[i]>0;}
   const life=Math.max(0,dustLife[i]);dummy.position.fromArray(dustPos,j);dummy.rotation.set(0,0,0);dummy.scale.setScalar(life>0?(1.25-life*1.6)*Math.min(1,life*6):0);dummy.updateMatrix();dust.setMatrixAt(i,dummy.matrix);}
   dust.instanceMatrix.needsUpdate=true;dust.visible=alive;}

  if(confetti.visible){let alive=false;for(let i=0;i<CONFETTI;i++){const j=i*3;if(confLife[i]>0){confLife[i]-=dt;confVel[j+1]-=dt*7.5;const drag=Math.exp(-dt*1.6);confVel[j]*=drag;confVel[j+2]*=drag;confPos[j]+=confVel[j]*dt;confPos[j+1]=Math.max(.02,confPos[j+1]+Math.max(-2.2,confVel[j+1])*dt);confPos[j+2]+=confVel[j+2]*dt+travel;alive||=confLife[i]>0;}
   dummy.position.fromArray(confPos,j);dummy.rotation.set(confSpin[j]+elapsed*confSpin[j+2],confSpin[j+1]+elapsed*2,elapsed*confSpin[j+2]*.5);dummy.scale.setScalar(confLife[i]>0?Math.min(1,confLife[i]*3):0);dummy.updateMatrix();confetti.setMatrixAt(i,dummy.matrix);}
   confetti.instanceMatrix.needsUpdate=true;confetti.visible=alive;}

  // Crowd: recycle stands at the far end; bob harder through a goal approach.
  const goalNear=s.objects.some(o=>o.kind==='goal'&&!o.passed&&o.z>-75&&o.z<-6);
  hype+=((goalNear?.6:s.boost>0?.35:.1)-hype)*(1-Math.exp(-dt*(hype>.6?.8:2)));
  for(const stand of stands){const z=((stand.base+s.distance+62)%STAND_PERIOD+STAND_PERIOD)%STAND_PERIOD-62;if(z<stand.z-20)fillStand(stand,s.distance,goalNear);stand.z=z;stand.mesh.position.z=z;}
  crowdUniforms.uTime.value=elapsed;crowdUniforms.uAmp.value=reduced?0:.04+hype*.2;crowdUniforms.uRate.value=6+hype*6;
  track.update(dt,s,hype);
 }
 function reset(s:RunnerGame){
  trauma=hitstop=lineFlash=follow=descent=punch=0;hitstopScale=1;word.visible=false;wordMaterial.opacity=0;wordAge=wordLife=0;hype=0;track.reset();dustLife.fill(0);confLife.fill(0);dust.visible=confetti.visible=false;seen.state=null;
  shield.visible=keeper.root.visible=passBall.visible=callout.visible=mud.visible=fork.visible=false;for(const m of mates)m.rig.root.visible=false;
  for(const stand of stands){stand.z=((stand.base+s.distance+62)%STAND_PERIOD+STAND_PERIOD)%STAND_PERIOD-62;stand.mesh.position.z=stand.z;fillStand(stand,s.distance,false);}
 }
 /** Applied after the shared camera beat (which restores the home pose each frame). */
 const lookTarget=new T.Vector3();
 function camera(cam:T.PerspectiveCamera,s:RunnerGame,dt:number,baseFov:number){
  // Landscape phones: the shared runner framing leaves the runner ~20 px tall. Frame
  // closer and lower so the runner, lanes and next defender line read at a glance.
  if(stage.mobile&&cam.aspect>1.45){cam.position.set(cam.position.x,8.6,12.6);lookTarget.set(cam.position.x*.5,0,-12);cam.lookAt(lookTarget);}
  // Desktop / tablet landscape: pitch the view down a touch so the runner sits above the coaching line
  // instead of behind it (the line lives at the bottom of the screen, just above the controls).
  else if(!stage.mobile&&cam.aspect>1.2)cam.rotateX(-.055);
  // Heat: three updates every world matrix each frame, hidden or not. The runner keeps ~1,500 objects in pools
  // (six defender rigs, two exploding goal frames, spare rigs), most of them hidden. Skip hidden top-level
  // subtrees; a pool item that turns visible recomputes its whole subtree on that same frame.
  for(const child of scene.children)child.matrixWorldAutoUpdate=child.visible;
  // A role change re-dresses the pooled rig (new costume materials): bend them before their first draw.
  for(const g of defenders)if(g.userData.bendDirty){g.userData.bendDirty=false;track.patch(g);}
  if(reduced){if(stage.mobile&&cam.aspect>1.45)cam.updateMatrixWorld();if(cam.fov!==baseFov){cam.fov=baseFov;cam.updateProjectionMatrix();}track.pose(cam);return;}
  follow+=(s.x*.2-follow)*(1-Math.exp(-dt*5));cam.position.x+=follow;
  if(trauma>0){const shake=trauma*trauma*.2;cam.position.x+=Math.sin(elapsed*71.3)*shake;cam.position.y+=Math.sin(elapsed*53.1+1.7)*shake*.7;}
  const target=baseFov+clamp01((s.speed-13)/5)*2.6+(s.boost>0?2.2:0)+lineFlash*1.2+descent*1.6-Math.sin(Math.min(1,punch)*Math.PI)*5;
  if(!fov)fov=baseFov;fov+=(target-fov)*(1-Math.exp(-dt*4));if(Math.abs(cam.fov-fov)>.01){cam.fov=fov;cam.updateProjectionMatrix();}
  cam.updateMatrixWorld();track.pose(cam);
 }
 // The winding route: built last so every runner mesh above is bent too.
 const track=createRunnerTrack(stage);
 return{update,reset,camera,defender,prepareDefender,player,track,dispose:track.dispose,
  /** Simulation time scale for hit-stop: brief freezes on impact, a breath of slow-mo on near misses. */
  timeScale:()=>hitstop>0?hitstopScale:1,
  /** Any effect still animating keeps frames coming briefly after play stops. */
  active:()=>dust.visible||confetti.visible||trauma>0||hitstop>0||word.visible,
  debug:()=>({word:word.visible?wordText:'',wordOpacity:wordMaterial.opacity,punch,route:track.debug(),descent,lines:lines.visible,lineOpacity:lineMaterial.opacity,dust:dust.visible,confetti:confetti.visible,stands:stands.map(s=>s.mesh.visible),hype,trauma}),
 };
}
export type RunnerFx=ReturnType<typeof createRunnerFx>;
