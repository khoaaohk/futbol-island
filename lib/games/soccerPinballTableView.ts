import * as T from 'three';
import {GOAL_LEFT,GOAL_RIGHT,pinballCounterLane,pinballWillPass,type PinballState} from './soccerPinball';
import {PINBALL_BLOOM,printLampMaterial} from './soccerPinballCabinet';
import {inkedPart,partAt,bakeParts} from '../arcade/comic/ink';
import {CREST_LANES,WALL_Y,WALL_X,WALL_HALF,FLAGS,FLAG_LETTERS,SLINGS,CONE_R,coneX,coneY,SPINNER,DUGOUT,SAVER,PINBALL_MODES,TRAINING_GOAL} from './soccerPinballTable';

/* Futbol Pinball playfield pieces (comic house style), built once:
 *   wall players (1 instanced draw), posts + corner-flag poles + saver post
 *   (1), flags (1), slingshot rubbers (1), pop bumpers (1) + their print
 *   skirts (1), dribble-gate spinner (1), state lamps (1
 *   instanced disc mesh sharing the table's print-lamp shader).
 * No lights, no textures. Standing parts carry their ink outline as an
 * inverted hull in the same geometry. update() writes matrices/colours only
 * when a value actually changes, and active() lets the frame loop sleep. */

// Lamp colours as linear hue x heat for the print-lamp shader (soccerPinballCabinet.ts printLampMaterial): a lit lamp is flat
// saturated colour with a Ben-Day ring, `dim` (black) prints nothing. The last four are plain flat colours of unlit parts.
const LIT={gold:new T.Color(1.45,.74,.1),cyan:new T.Color(.22,.7,1.5),pink:new T.Color(1.5,.2,.1),green:new T.Color(.24,1.35,.4),coral:new T.Color(1.5,.36,.16),white:new T.Color(1.25,1.05,.72),dim:new T.Color(0,0,0),dimWarm:new T.Color('#d9cda8'),rubber:new T.Color('#f0452e'),flash:new T.Color('#fff3d6'),skirt:new T.Color(.3,.15,.016),flag:new T.Color('#ffc83a'),saver:new T.Color('#3fcf7a'),post:new T.Color('#ffffff')};

export function createPinballTableView(scene:T.Scene,px:(x:number)=>number,pz:(y:number)=>number,mobile:boolean,reduced:boolean){
 const W=1/30,group=new T.Group();group.name='pinball-table-features';scene.add(group);
 const own=(m:T.Mesh|T.InstancedMesh,name:string)=>{m.name=name;m.castShadow=false;m.receiveShadow=false;group.add(m);return m;};
 const dummy=new T.Object3D(),tmp=new T.Color();

 const flat:T.Material=scene.userData.pinballFlat,wire:T.Material=scene.userData.pinballWire,lampMat:T.Material=scene.userData.pinballLamp;
 // The state lamps sit over lettered inserts, so they print as a thick ring round the letter (their own instance of the lamp shader).
 const ringLamp=printLampMaterial(scene.userData.pinballInk,1/PINBALL_BLOOM,.6/PINBALL_BLOOM);
 // Free-kick wall: three standing drop targets, each a printed player on a paper plate with its ink outline baked in. One
 // instanced, shadow-casting draw; a hit target drops into its printed slot.
 const wallW=(WALL_HALF*2+6)*W,wallParts:T.BufferGeometry[]=[];
 inkedPart(wallParts,new T.BoxGeometry(wallW,.66,.08),'#fff3d6',partAt(0,.33,-.035),.035);inkedPart(wallParts,new T.BoxGeometry(wallW*.8,.34,.07),'#f0452e',partAt(0,.4,.035),0);inkedPart(wallParts,new T.BoxGeometry(wallW*.8,.12,.07),'#231a2e',partAt(0,.15,.035),0);inkedPart(wallParts,new T.BoxGeometry(wallW*.22,.34,.076),'#fff3d6',partAt(0,.4,.037),0);inkedPart(wallParts,new T.SphereGeometry(.14,6,4),'#f4b98c',partAt(0,.76,.02),.03,true);
 const wallBody=own(new T.InstancedMesh(bakeParts(wallParts),flat,3),'pinball-wall-bodies') as T.InstancedMesh;wallBody.castShadow=true;
 const wallAnim=[1,1,1],wallDrawn=[-1,-1,-1];
 function drawWall(i:number,k:number){dummy.position.set(px(WALL_X[i]),-(1-k)*.9,pz(WALL_Y));dummy.rotation.set(0,0,0);dummy.scale.setScalar(1);dummy.updateMatrix();wallBody.setMatrixAt(i,dummy.matrix);wallBody.instanceMatrix.needsUpdate=true;wallDrawn[i]=k;}
 for(let i=0;i<3;i++)drawWall(i,1);

 // Posts: crest lane guides (2), spinner frame (2), flag poles (4), saver (1).
 const posts=own(new T.InstancedMesh(new T.CylinderGeometry(1,1,1,10),wire,9),'pinball-posts') as T.InstancedMesh;
 const postAt=(i:number,x:number,y:number,r:number,h:number,color:T.Color)=>{dummy.position.set(px(x),h/2,pz(y));dummy.rotation.set(0,0,0);dummy.scale.set(r,h,r);dummy.updateMatrix();posts.setMatrixAt(i,dummy.matrix);posts.setColorAt(i,color);};
 // The star-lane guides are chrome wire forms in the cabinet's trim mesh now; their two old slots stay empty.
 for(let i=0;i<2;i++){dummy.position.set(0,-2,0);dummy.scale.setScalar(0);dummy.updateMatrix();posts.setMatrixAt(i,dummy.matrix);posts.setColorAt(i,LIT.post);}
 postAt(2,SPINNER.x0+2,SPINNER.y,.06,.5,LIT.post);postAt(3,SPINNER.x1,SPINNER.y,.06,.5,LIT.post);
 for(let i=0;i<4;i++)postAt(4+i,FLAGS[i].x,FLAGS[i].y,.045,.78,LIT.post);
 postAt(8,SAVER.x,SAVER.y,.12,.42,LIT.saver);
 let saverShown=true;const setSaver=(on:boolean)=>{if(on===saverShown)return;saverShown=on;dummy.position.set(px(SAVER.x),.21,pz(SAVER.y));dummy.rotation.set(0,0,0);dummy.scale.set(on?.12:0,on?.42:0,on?.12:0);dummy.updateMatrix();posts.setMatrixAt(8,dummy.matrix);posts.instanceMatrix.needsUpdate=true;};
 setSaver(false);

 // Corner flags: little triangles that light up as G-O-A-L is spelled.
 const flagShape=new T.Shape();flagShape.moveTo(0,0);flagShape.lineTo(.42,-.13);flagShape.lineTo(0,-.27);flagShape.closePath();
 const flagMesh=own(new T.InstancedMesh(new T.ShapeGeometry(flagShape),new T.MeshBasicMaterial({color:'#ffffff',side:T.DoubleSide,toneMapped:false}),4),'pinball-corner-flags') as T.InstancedMesh;
 for(let i=0;i<4;i++){const f=FLAGS[i],side=f.x<180?1:-1;dummy.position.set(px(f.x),.78,pz(f.y));dummy.rotation.set(0,side>0?0:Math.PI,0);dummy.scale.setScalar(1);dummy.updateMatrix();flagMesh.setMatrixAt(i,dummy.matrix);flagMesh.setColorAt(i,LIT.dimWarm);}

 // Slingshots: the posts, band, plastic and kicker are in the cabinet's hardware mesh; here is only the live rubber on the long
 // face, which flashes white when it fires.
 const rubbers=own(new T.InstancedMesh(new T.BoxGeometry(1,1,1),new T.MeshBasicMaterial({color:'#ffffff',toneMapped:false}),2),'pinball-kickboard-rubbers') as T.InstancedMesh;
 for(let i=0;i<2;i++){const k=SLINGS[i],X1=px(k.ax),Z1=pz(k.ay),X2=px(k.cx),Z2=pz(k.cy),len=Math.hypot(X2-X1,Z2-Z1),mx=(X1+X2)/2,mz=(Z1+Z2)/2,CX=px((k.ax+k.bx+k.cx)/3),CZ=pz((k.ay+k.by+k.cy)/3);let nx=-(Z2-Z1)/len,nz=(X2-X1)/len;if(nx*(mx-CX)+nz*(mz-CZ)<0){nx=-nx;nz=-nz;}
  dummy.position.set(mx+nx*.118,.2,mz+nz*.118);dummy.rotation.set(0,-Math.atan2(Z2-Z1,X2-X1),0);dummy.scale.set(len,.09,.05);dummy.updateMatrix();rubbers.setMatrixAt(i,dummy.matrix);rubbers.setColorAt(i,LIT.rubber);}

 // Pop bumpers (the "training cones"): a turned body in flat print colours (red foot, paper barrel, sun ring, red cap with a paper
 // crown) with its ink hull baked in (one lathe, instanced x3, casting shadows), and a print skirt under each that fills with dots
 // and flat colour when it fires.
 const bumperGeo=(()=>{const pts:[number,number][]=[[1,0],[.74,.16],[.6,.2],[.6,.54],[1.04,.6],[1.04,.72],[.9,.84],[.5,.97],[0,1]],quad=['#8f2a3a','#fff3d6','#fff3d6','#ffc83a','#ffc83a','#f0452e','#f0452e','#fff3d6'],out:T.BufferGeometry[]=[];
  inkedPart(out,new T.LatheGeometry(pts.map(([r,y])=>new T.Vector2(r,y)),mobile?8:14),tri=>quad[(tri>>1)%8],new T.Matrix4(),.09,true);return bakeParts(out);})();
 const cones=own(new T.InstancedMesh(bumperGeo,flat,3),'pinball-training-cones') as T.InstancedMesh;cones.castShadow=true;
 const skirts=own(new T.InstancedMesh(new T.CircleGeometry(1,10),lampMat,3),'pinball-cone-skirts') as T.InstancedMesh;skirts.renderOrder=2;
 const coneDrawn=[-1,-1,-1],coneAt={coneSpin:0};let spinDrawn=0;
 function drawCone(i:number,flash:number){const cx=coneX(coneAt,i),cy=coneY(coneAt,i),squash=reduced?0:flash*.2,r=CONE_R*W*1.02;
  dummy.position.set(px(cx),0,pz(cy));dummy.rotation.set(0,0,0);dummy.scale.set(r*(1+squash*.4),.62*(1-squash),r*(1+squash*.4));dummy.updateMatrix();cones.setMatrixAt(i,dummy.matrix);
  dummy.position.set(px(cx),.02,pz(cy));dummy.rotation.set(-Math.PI/2,0,0);dummy.scale.setScalar(r*2.7*(1+(reduced?0:flash*.2)));dummy.updateMatrix();skirts.setMatrixAt(i,dummy.matrix);
  skirts.setColorAt(i,tmp.copy(LIT.skirt).lerp(LIT.gold,Math.min(1,.16+flash)));
  cones.instanceMatrix.needsUpdate=skirts.instanceMatrix.needsUpdate=true;skirts.instanceColor!.needsUpdate=true;coneDrawn[i]=flash;}
 for(let i=0;i<3;i++)drawCone(i,0);

 // Dribble gate: a flat plate spinning about the lane's cross axis.
 const spinner=own(new T.Mesh(new T.BoxGeometry((SPINNER.x1-SPINNER.x0-2)*W,.34,.035),wire),'pinball-dribble-gate') as T.Mesh;
 spinner.position.set(px((SPINNER.x0+SPINNER.x1)/2+1),.3,pz(SPINNER.y));

 // The dugout's shelter is part of the board mesh (soccerPinballCabinet.ts); its mouth is printed.
 // Lamp inserts: one instanced disc mesh. Index map:
 const L={crest:0,bonus:3,wall:7,flag:10,mode:14,dugout:17,spin:18,star:19,skill:22,count:23};
 const lampPos:[number,number,number][]=[];
 CREST_LANES.forEach(x=>lampPos.push([x,76,7]));
 [153,171,189,207].forEach(x=>lampPos.push([x,452,6]));
 WALL_X.forEach(x=>lampPos.push([x,150,6]));
 FLAGS.forEach(f=>lampPos.push([f.x<180?44:315,f.y,8]));
 [156,180,204].forEach(x=>lampPos.push([x,425,8]));
 lampPos.push([DUGOUT.x-22,DUGOUT.y+20,7]);
 lampPos.push([36,232,6]);
 [162,180,198].forEach(x=>lampPos.push([x,478,6]));
 lampPos.push([354,560,10]);
 const lamps=own(new T.InstancedMesh(new T.CircleGeometry(1,mobile?8:16),ringLamp,L.count),'pinball-lamp-inserts') as T.InstancedMesh;
 lampPos.forEach(([x,y,r],i)=>{dummy.position.set(px(x),.024,pz(y));dummy.rotation.set(-Math.PI/2,0,0);dummy.scale.setScalar(r*W*PINBALL_BLOOM);dummy.updateMatrix();lamps.setMatrixAt(i,dummy.matrix);lamps.setColorAt(i,LIT.dim);});
 const lampCache=new Float32Array(L.count*3).fill(-1),lampNow=new Float32Array(L.count*3);

 // Legends are screen-printed into the playfield texture (soccerPinballCabinet.ts): no decal draw, no second texture.
 // Counter-shot telegraph: a dashed aim line plus an arrowhead pointing at
 // the flipper lane the defender will shoot at, growing through his wind-up.
 // Pass 3: the dashes are geometry (8 quads in one unit plane), not a 16 x 64 repeat texture: one GL texture fewer.
 
 const aimMaterial=new T.MeshBasicMaterial({color:'#f0452e',transparent:true,depthWrite:false,toneMapped:false});aimMaterial.userData.arcadeSpill=true;
 const aimGeo=(()=>{const pos=new Float32Array(8*18);for(let i=0;i<8;i++){const a=-.5+i/8,b=a+.07,o=i*18;pos.set([-.5,0,a,-.5,0,b,.5,0,b,-.5,0,a,.5,0,b,.5,0,a],o);}const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));return g;})();
 const aim=own(new T.Mesh(aimGeo,aimMaterial),'pinball-counter-aim') as T.Mesh;aim.visible=false;aim.renderOrder=4;
 const headShape=new T.Shape();headShape.moveTo(0,.32);headShape.lineTo(.26,-.1);headShape.lineTo(-.26,-.1);headShape.closePath();const headGeo=new T.ShapeGeometry(headShape);headGeo.rotateX(-Math.PI/2);
 const headMaterial=new T.MeshBasicMaterial({color:'#f0452e',transparent:true,depthWrite:false,toneMapped:false,side:T.DoubleSide});
 const head=own(new T.Mesh(headGeo,headMaterial),'pinball-counter-aim-head') as T.Mesh;head.visible=false;head.renderOrder=4;
 // Goal-lit countdown: a gold bar across the goal mouth that shrinks as the
 // chance runs out ("finish before it closes"). One draw, hidden when unlit.
 const litMaterial=new T.MeshBasicMaterial({color:'#ffc83a',transparent:true,depthWrite:false,toneMapped:false});
 const litGeo=new T.PlaneGeometry(1,1);litGeo.rotateX(-Math.PI/2);
 const litBar=own(new T.Mesh(litGeo,litMaterial),'pinball-goal-lit-bar') as T.Mesh;litBar.visible=false;litBar.renderOrder=4;litMaterial.userData.arcadeSpill=true;
 // Nov 8 2026: the match clock moved off the floor (the phone camera cropped it under the left flipper pad); it is now a HUD chip beside the balls (ArcadeGame3D pbHud).
 let flagCache=-1,rubberCache=[-1,-1],live=false,skillDrawn=-1;
 function lamp(i:number,c:T.Color){const j=i*3;lampCache[j]=c.r;lampCache[j+1]=c.g;lampCache[j+2]=c.b;}
 // Filament: every insert eases toward its target colour, fast to light (~45 ms) and slow to die (~190 ms). Returns true while any bulb is still changing.
 function glow(dt:number){let moving=false;for(let j=0;j<L.count*3;j++){const d=lampCache[j]-lampNow[j];if(d===0)continue;if(dt<=0||reduced||Math.abs(d)<.004)lampNow[j]=lampCache[j];else{lampNow[j]+=d*(1-Math.exp(-dt*(d>0?22:5.2)));moving=true;}const i=(j/3)|0;{tmp.setRGB(lampNow[i*3],lampNow[i*3+1],lampNow[i*3+2]);lamps.setColorAt(i,tmp);lamps.instanceColor!.needsUpdate=true;}}return moving;}
 const lerp=(a:T.Color,b:T.Color,k:number)=>tmp.copy(a).lerp(b,Math.max(0,Math.min(1,k)));

 // Pass 3: each state lamp's own lit colour, so a light show can run through them in the right plastic.
  const lampHue:T.Color[]=[];for(let i=0;i<L.count;i++)lampHue.push(i<L.bonus?LIT.gold:i<L.wall?LIT.gold:i<L.flag?LIT.coral:i<L.mode?LIT.gold:i<L.dugout?LIT.pink:i<L.spin?LIT.cyan:i<L.star?LIT.cyan:i<L.skill?LIT.gold:LIT.cyan);
  const lampX=lampPos.map(([x])=>px(x)),lampZ=lampPos.map(([,y])=>pz(y));
  /** `show` (pass 3): the running light show's level 0..1 at a table point (lib/arcade/games/pinballGame.ts showAt), or null. The state
   * lamps join it: a lamp that is off lights in its own colour as the chase passes; one that is on is left alone. */
  function update(s:PinballState,dt:number,show:((x:number,z:number)=>number)|null=null){
  const t=s.table,time=s.time,blinkOn=reduced||Math.sin(time*Math.PI*5)>0,slow=reduced||Math.sin(time*Math.PI*2.4)>0;live=false;
  // Nov 10 2026 heat: the rules do not decay cone/kickboard flashes on the plunger or at full time, so a flash frozen there must not hold the frame loop awake (it kept a waiting table at 30 fps after any goal off a cone).
  const ticking=s.phase!=='ready'&&s.phase!=='over';
  // Wall players sink and pop back up.
  for(let i=0;i<3;i++){const goal=t.wall[i];if(wallAnim[i]!==goal){wallAnim[i]=reduced?goal:goal>wallAnim[i]?Math.min(goal,wallAnim[i]+dt*6):Math.max(goal,wallAnim[i]-dt*9);live=true;}if(wallDrawn[i]!==wallAnim[i])drawWall(i,wallAnim[i]);}
  // Rondo cones (hard tier) turn: redraw all three only when the angle moved.
  const spun=t.coneSpin!==spinDrawn;if(spun){spinDrawn=coneAt.coneSpin=t.coneSpin;live=live||s.phase==='playing';}
  for(let i=0;i<3;i++){const f=Math.round(t.coneFlash[i]*20)/20;if(spun||f!==coneDrawn[i])drawCone(i,f);if(f>0&&ticking)live=true;}
  for(let i=0;i<2;i++){const f=Math.round(t.slingFlash[i]*20)/20;if(f!==rubberCache[i]){rubberCache[i]=f;rubbers.setColorAt(i,f>.3?LIT.flash:LIT.rubber);rubbers.instanceColor!.needsUpdate=true;}if(f>0&&ticking)live=true;}
  if(spinner.rotation.x!==t.spinAngle){spinner.rotation.x=t.spinAngle;live=live||t.spinOmega!==0;}
  setSaver(t.saver);
  // The shrinking goal-lit bar.
  const lit=s.phase==='playing'&&s.moveTime>0;litBar.visible=lit;
  if(lit){const k=Math.min(1,s.moveTime/14),w=(GOAL_RIGHT-GOAL_LEFT-10)*k;litBar.position.set(px(180),.05,pz(58));litBar.scale.set(Math.max(.01,w*W),1,11*W);litMaterial.opacity=reduced?.85:.6+.35*Math.abs(Math.sin(time*(k<.3?9:4)));live=true;}
  const shooter=s.phase==='playing'&&s.possession>=0&&pinballWillPass(s)<0?s.defenders[s.possession]:null;
  aim.visible=head.visible=!!shooter;
  if(shooter){
   const lane=pinballCounterLane(s,s.possession),x0=px(shooter.x),z0=pz(shooter.y+26),x1=px(lane),z1=pz(512),dx=x1-x0,dz=z1-z0,len=Math.hypot(dx,dz),yaw=Math.atan2(dx,dz);
   const wind=Math.max(0,Math.min(1,1-s.possessionTime/.72)),grow=reduced?1:.35+.65*wind;
   aim.position.set(x0+dx*grow/2,.05,z0+dz*grow/2);aim.rotation.set(0,yaw,0);aim.scale.set(.16,1,len*grow);
   aimMaterial.opacity=(.45+.5*wind)*(reduced?1:.8+.2*Math.sin(time*18));
   head.position.set(x0+dx*grow,.05,z0+dz*grow);head.rotation.set(0,yaw+Math.PI,0);headMaterial.opacity=aimMaterial.opacity;
   live=true;
  }
  if(t.flags!==flagCache){flagCache=t.flags;for(let i=0;i<4;i++)flagMesh.setColorAt(i,t.flags&1<<i?LIT.flag:LIT.dimWarm);flagMesh.instanceColor!.needsUpdate=true;}
  // Inserts.
  for(let i=0;i<3;i++){const on=!!(t.crest&1<<i);lamp(L.crest+i,on?LIT.gold:lerp(LIT.dim,LIT.white,t.laneFlash[i]));}
  // Skill-shot marker: a blue halo under the target rung of the launch ladder.
  if(t.skillBand!==skillDrawn){skillDrawn=t.skillBand;dummy.position.set(px(354),.024,pz(560-t.skillBand*15));dummy.rotation.set(-Math.PI/2,0,0);dummy.scale.set(12*W*2,9*W*2,1);dummy.updateMatrix();lamps.setMatrixAt(L.skill,dummy.matrix);lamps.instanceMatrix.needsUpdate=true;}
  lamp(L.skill,s.phase==='ready'?LIT.cyan:LIT.dim);
  for(let i=0;i<4;i++)lamp(L.bonus+i,t.bonusX>=i+2?LIT.gold:LIT.dim);
  for(let i=0;i<3;i++)lamp(L.wall+i,t.wallLit>0?(blinkOn?LIT.gold:LIT.coral):t.wall[i]?LIT.dim:LIT.coral);
  for(let i=0;i<4;i++)lamp(L.flag+i,t.flags&1<<i?LIT.gold:t.saver?LIT.green:LIT.dim);
  for(let i=0;i<3;i++){const id=PINBALL_MODES[i].id,done=!!(t.modesDone&1<<i);lamp(L.mode+i,t.mode===id?(blinkOn?LIT.pink:LIT.white):done?LIT.green:t.mode==='final'?(slow?LIT.gold:LIT.pink):LIT.dim);}
  lamp(L.dugout,t.dugoutLit?(blinkOn?LIT.gold:LIT.white):lerp(LIT.dim,LIT.cyan,t.training/TRAINING_GOAL*.6));
  lamp(L.spin,t.spinOmega!==0?LIT.cyan:LIT.dim);
  const stars=t.stars[s.level-1];for(let i=0;i<3;i++)lamp(L.star+i,stars&1<<i?LIT.gold:LIT.dim);
  if(show){for(let i=0;i<L.skill;i++){const k=show(lampX[i],lampZ[i]),j=i*3,h=lampHue[i];if(k>0){lampCache[j]=Math.max(lampCache[j],h.r*k);lampCache[j+1]=Math.max(lampCache[j+1],h.g*k);lampCache[j+2]=Math.max(lampCache[j+2],h.b*k);}}live=true;}
   if(t.wallLit>0||t.dugoutLit||t.mode!=='none'||t.saver)live=live||s.phase==='playing';
  // Filament easing only runs while the ball is live; on the plunger and at full time the lamps snap, so a waiting table still sleeps.
  if(glow(s.phase==='playing'||s.phase==='goal'||s.phase==='lost'||show?dt:0))live=true;
 }
 return{update,active:()=>live,group};
}
