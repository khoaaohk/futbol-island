import * as T from 'three';
import {pinballCounterLane,pinballWillPass,type PinballState} from './soccerPinball';
import {CREST_POSTS,CREST_TOP,CREST_BOT,CREST_LANES,WALL_Y,WALL_X,WALL_HALF,FLAGS,FLAG_LETTERS,SLINGS,CONES,CONE_R,SPINNER,DUGOUT,SAVER,PINBALL_MODES,TRAINING_GOAL} from './soccerPinballTable';

/* Futbol Pinball playfield pieces, built once:
 *   wall players (2 instanced draws), posts + corner-flag poles + saver post
 *   (1), flags (1), kickboards (1 merged extrude), kickboard rubbers (1),
 *   cones (1) + cone skirts (1), dribble-gate spinner (1), dugout (1),
 *   lamp inserts (1 instanced disc mesh) and a label decal painted once (1).
 * ~12 draw calls, no lights, no shadows. update() writes matrices/colours only
 * when a value actually changes, and active() lets the frame loop sleep. */

const LIT={gold:new T.Color('#ffe86d'),cyan:new T.Color('#73fff1'),pink:new T.Color('#ff62c2'),green:new T.Color('#8dff9e'),coral:new T.Color('#ff7a6b'),white:new T.Color('#fff6dc'),dim:new T.Color('#24425a'),dimWarm:new T.Color('#4a3a46')};

export function createPinballTableView(scene:T.Scene,px:(x:number)=>number,pz:(y:number)=>number,mobile:boolean,reduced:boolean){
 const W=1/30,group=new T.Group();group.name='pinball-table-features';scene.add(group);
 const solid=(color:string,emissive=0)=>new T.MeshStandardMaterial({color,roughness:.55,emissive:emissive?color:'#000000',emissiveIntensity:emissive});
 const own=(m:T.Mesh|T.InstancedMesh,name:string)=>{m.name=name;m.castShadow=false;m.receiveShadow=false;group.add(m);return m;};
 const dummy=new T.Object3D(),tmp=new T.Color();

 // Free-kick wall: three rival players standing shoulder to shoulder.
 const wallBody=own(new T.InstancedMesh(new T.BoxGeometry(1,1,1),solid('#ffffff'),3),'pinball-wall-bodies') as T.InstancedMesh;
 const wallHead=own(new T.InstancedMesh(new T.SphereGeometry(1,12,8),solid('#f2c9a0'),3),'pinball-wall-heads') as T.InstancedMesh;
 const wallAnim=[1,1,1],wallDrawn=[-1,-1,-1];
 for(let i=0;i<3;i++)wallBody.setColorAt(i,new T.Color(i===1?'#ff5a6e':'#ff7a6b'));
 function drawWall(i:number,k:number){
  const x=px(WALL_X[i]),z=pz(WALL_Y),sink=(1-k)*.62;
  dummy.position.set(x,.3-sink,z);dummy.rotation.set(0,0,0);dummy.scale.set((WALL_HALF*2+6)*W,.56,8*W);dummy.updateMatrix();wallBody.setMatrixAt(i,dummy.matrix);
  dummy.position.set(x,.7-sink,z);dummy.scale.setScalar(.15);dummy.updateMatrix();wallHead.setMatrixAt(i,dummy.matrix);
  wallBody.instanceMatrix.needsUpdate=wallHead.instanceMatrix.needsUpdate=true;wallDrawn[i]=k;
 }
 for(let i=0;i<3;i++)drawWall(i,1);

 // Posts: crest lane guides (2), spinner frame (2), flag poles (4), saver (1).
 const posts=own(new T.InstancedMesh(new T.CylinderGeometry(1,1,1,10),new T.MeshStandardMaterial({color:'#ffffff',roughness:.4}),9),'pinball-posts') as T.InstancedMesh;
 const postAt=(i:number,x:number,y:number,r:number,h:number,color:T.Color)=>{dummy.position.set(px(x),h/2,pz(y));dummy.rotation.set(0,0,0);dummy.scale.set(r,h,r);dummy.updateMatrix();posts.setMatrixAt(i,dummy.matrix);posts.setColorAt(i,color);};
 // Crest posts are drawn as stretched pills along their capsule.
 for(let i=0;i<2;i++){const x=CREST_POSTS[i];dummy.position.set(px(x),.16,pz((CREST_TOP+CREST_BOT)/2));dummy.rotation.set(Math.PI/2,0,0);dummy.scale.set(3*W+.03,(CREST_BOT-CREST_TOP)*W,.32);dummy.updateMatrix();posts.setMatrixAt(i,dummy.matrix);posts.setColorAt(i,new T.Color('#fff0cf'));}
 postAt(2,SPINNER.x0+2,SPINNER.y,.05,.5,new T.Color('#fff0cf'));postAt(3,SPINNER.x1,SPINNER.y,.05,.5,new T.Color('#fff0cf'));
 for(let i=0;i<4;i++)postAt(4+i,FLAGS[i].x,FLAGS[i].y,.035,.78,new T.Color('#f4f1e6'));
 postAt(8,SAVER.x,SAVER.y,.12,.42,LIT.green);
 let saverShown=true;const setSaver=(on:boolean)=>{if(on===saverShown)return;saverShown=on;dummy.position.set(px(SAVER.x),.21,pz(SAVER.y));dummy.rotation.set(0,0,0);dummy.scale.set(on?.12:0,on?.42:0,on?.12:0);dummy.updateMatrix();posts.setMatrixAt(8,dummy.matrix);posts.instanceMatrix.needsUpdate=true;};
 setSaver(false);

 // Corner flags: little triangles that light up as G-O-A-L is spelled.
 const flagShape=new T.Shape();flagShape.moveTo(0,0);flagShape.lineTo(.42,-.13);flagShape.lineTo(0,-.27);flagShape.closePath();
 const flagMesh=own(new T.InstancedMesh(new T.ShapeGeometry(flagShape),new T.MeshBasicMaterial({color:'#ffffff',side:T.DoubleSide,toneMapped:false}),4),'pinball-corner-flags') as T.InstancedMesh;
 for(let i=0;i<4;i++){const f=FLAGS[i],side=f.x<180?1:-1;dummy.position.set(px(f.x),.78,pz(f.y));dummy.rotation.set(0,side>0?0:Math.PI,0);dummy.scale.setScalar(1);dummy.updateMatrix();flagMesh.setMatrixAt(i,dummy.matrix);flagMesh.setColorAt(i,LIT.dimWarm);}

 // Kickboards: both triangles in one extruded geometry, plus rubber faces.
 const shapes=SLINGS.map(k=>{const sh=new T.Shape();sh.moveTo(px(k.ax),-pz(k.ay));sh.lineTo(px(k.bx),-pz(k.by));sh.lineTo(px(k.cx),-pz(k.cy));sh.closePath();return sh;});
 const slingGeo=new T.ExtrudeGeometry(shapes,{depth:.32,bevelEnabled:false});slingGeo.rotateX(-Math.PI/2);
 own(new T.Mesh(slingGeo,solid('#2f6f9a',.15)),'pinball-kickboards');
 const rubbers=own(new T.InstancedMesh(new T.BoxGeometry(1,1,1),new T.MeshBasicMaterial({color:'#ffffff',toneMapped:false}),2),'pinball-kickboard-rubbers') as T.InstancedMesh;
 for(let i=0;i<2;i++){const k=SLINGS[i],len=Math.hypot(k.cx-k.ax,k.cy-k.ay)*W;dummy.position.set(px((k.ax+k.cx)/2),.17,pz((k.ay+k.cy)/2));dummy.rotation.set(0,-Math.atan2(k.cy-k.ay,k.cx-k.ax),0);dummy.scale.set(len,.34,.1);dummy.updateMatrix();rubbers.setMatrixAt(i,dummy.matrix);rubbers.setColorAt(i,LIT.pink);}

 // Training cones (pop bumpers) and their light skirts.
 const cones=own(new T.InstancedMesh(new T.ConeGeometry(1,1,14),solid('#ff8a2a',.25),3),'pinball-training-cones') as T.InstancedMesh;
 const skirts=own(new T.InstancedMesh(new T.RingGeometry(.72,1,24),new T.MeshBasicMaterial({color:'#ffffff',toneMapped:false,side:T.DoubleSide}),3),'pinball-cone-skirts') as T.InstancedMesh;
 const coneDrawn=[-1,-1,-1];
 function drawCone(i:number,flash:number){const c=CONES[i],squash=reduced?0:flash*.22,r=CONE_R*W*1.05;
  dummy.position.set(px(c.x),.32*(1-squash),pz(c.y));dummy.rotation.set(0,0,0);dummy.scale.set(r*(1+squash*.5),.64*(1-squash),r*(1+squash*.5));dummy.updateMatrix();cones.setMatrixAt(i,dummy.matrix);
  dummy.position.set(px(c.x),.03,pz(c.y));dummy.rotation.set(-Math.PI/2,0,0);dummy.scale.setScalar(r*1.45*(1+(reduced?0:flash*.25)));dummy.updateMatrix();skirts.setMatrixAt(i,dummy.matrix);
  skirts.setColorAt(i,tmp.copy(LIT.dim).lerp(LIT.gold,Math.min(1,.25+flash)));
  cones.instanceMatrix.needsUpdate=skirts.instanceMatrix.needsUpdate=true;skirts.instanceColor!.needsUpdate=true;coneDrawn[i]=flash;}
 for(let i=0;i<3;i++)drawCone(i,0);

 // Dribble gate: a flat plate spinning about the lane's cross axis.
 const spinner=own(new T.Mesh(new T.BoxGeometry((SPINNER.x1-SPINNER.x0-2)*W,.34,.035),solid('#73fff1',.35)),'pinball-dribble-gate') as T.Mesh;
 spinner.position.set(px((SPINNER.x0+SPINNER.x1)/2+1),.3,pz(SPINNER.y));

 // Dugout: a dark pocket with a little shelter roof behind it.
 const dugoutGeo=new T.CircleGeometry(DUGOUT.r*W*1.35,20);dugoutGeo.rotateX(-Math.PI/2);dugoutGeo.translate(px(DUGOUT.x),.027,pz(DUGOUT.y));
 const roof=new T.BoxGeometry(.95,.06,.34);roof.translate(px(DUGOUT.x+4),.42,pz(DUGOUT.y-13));
 const pillar=new T.BoxGeometry(.05,.42,.05);const pillars=[pillar.clone().translate(px(DUGOUT.x-10),.21,pz(DUGOUT.y-13)),pillar.clone().translate(px(DUGOUT.x+18),.21,pz(DUGOUT.y-13))];
 const merged=new T.BufferGeometry();{
  const parts=[dugoutGeo,roof,...pillars].map(g=>g.index?g.toNonIndexed():g),count=parts.reduce((n,g)=>n+g.attributes.position.count,0),pos=new Float32Array(count*3),nor=new Float32Array(count*3),col=new Float32Array(count*3);let o=0;
  parts.forEach((g,gi)=>{const c=new T.Color(gi===0?'#060812':'#2f6f9a');const p=g.attributes.position.array,n=g.attributes.normal.array;pos.set(p,o*3);nor.set(n,o*3);for(let v=0;v<g.attributes.position.count;v++)c.toArray(col,(o+v)*3);o+=g.attributes.position.count;});
  merged.setAttribute('position',new T.BufferAttribute(pos,3));merged.setAttribute('normal',new T.BufferAttribute(nor,3));merged.setAttribute('color',new T.BufferAttribute(col,3));
  [dugoutGeo,roof,pillar,...pillars].forEach(g=>g.dispose());
 }
 own(new T.Mesh(merged,new T.MeshStandardMaterial({vertexColors:true,roughness:.7})),'pinball-dugout');

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
 const lamps=own(new T.InstancedMesh(new T.CircleGeometry(1,18),new T.MeshBasicMaterial({color:'#ffffff',toneMapped:false}),L.count),'pinball-lamp-inserts') as T.InstancedMesh;
 lampPos.forEach(([x,y,r],i)=>{dummy.position.set(px(x),.024,pz(y));dummy.rotation.set(-Math.PI/2,0,0);dummy.scale.setScalar(r*W);dummy.updateMatrix();lamps.setMatrixAt(i,dummy.matrix);lamps.setColorAt(i,LIT.dim);});
 const lampCache=new Float32Array(L.count*3).fill(-1);

 // Labels: painted once onto a transparent decal over the playfield.
 const scale=mobile?1.2:1.6,canvas=document.createElement('canvas');canvas.width=Math.round(360*scale);canvas.height=Math.round(620*scale);
 const font=(()=>{try{return getComputedStyle(document.documentElement).getPropertyValue('--btn-font').trim();}catch{return'';}})()||'"Arial Black",Arial,sans-serif';
 const g=canvas.getContext('2d');
 if(g){g.scale(scale,scale);g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';
  const label=(text:string,x:number,y:number,size:number,color='rgba(255,246,220,.92)',stroke='rgba(8,14,30,.85)')=>{g.font=`900 ${size}px ${font}`;g.lineWidth=size*.28;g.strokeStyle=stroke;g.strokeText(text,x,y);g.fillStyle=color;g.fillText(text,x,y);};
  CREST_LANES.forEach(x=>label('★',x,76,9,'rgba(14,20,44,.9)','rgba(0,0,0,0)'));
  ['2×','3×','4×','5×'].forEach((t,i)=>label(t,153+i*18,452,6.5,'rgba(14,20,44,.95)','rgba(0,0,0,0)'));
  FLAGS.forEach((f,i)=>label(FLAG_LETTERS[i],f.x<180?44:315,f.y+.5,10,'rgba(14,20,44,.95)','rgba(0,0,0,0)'));
  ['WALL','1-2','BLOCK'].forEach((t,i)=>label(t,156+i*24,438,5.5));
  [162,180,198].forEach(x=>label('★',x,478,7,'rgba(14,20,44,.9)','rgba(0,0,0,0)'));
  label('DUGOUT',DUGOUT.x-2,DUGOUT.y+33,7);label('DRIBBLE',36,246,6);label('THE WALL',180,160,6.5);
  label('BONUS',180,465,5);label('MODES',180,413,5);
 }
 const decalTexture=new T.CanvasTexture(canvas);decalTexture.colorSpace=T.SRGBColorSpace;decalTexture.anisotropy=2;
 const decalMaterial=new T.MeshBasicMaterial({map:decalTexture,transparent:true,depthWrite:false,toneMapped:false});decalMaterial.userData.arcadeSpill=true;
 const decal=own(new T.Mesh(new T.PlaneGeometry(360*W,620*W),decalMaterial),'pinball-label-decal') as T.Mesh;decal.rotation.x=-Math.PI/2;decal.position.set(px(180),.028,pz(310));decal.renderOrder=3;

 // Counter-shot telegraph: a dashed aim line plus an arrowhead pointing at
 // the flipper lane the defender will shoot at, growing through his wind-up.
 const aimCanvas=document.createElement('canvas');aimCanvas.width=16;aimCanvas.height=64;{const a=aimCanvas.getContext('2d');if(a){a.fillStyle='#ffffff';a.fillRect(3,0,10,36);}}
 const aimTexture=new T.CanvasTexture(aimCanvas);aimTexture.wrapT=T.RepeatWrapping;
 const aimMaterial=new T.MeshBasicMaterial({map:aimTexture,color:'#ff7a8a',transparent:true,depthWrite:false,toneMapped:false});aimMaterial.userData.arcadeSpill=true;
 const aimGeo=new T.PlaneGeometry(1,1);aimGeo.rotateX(-Math.PI/2);
 const aim=own(new T.Mesh(aimGeo,aimMaterial),'pinball-counter-aim') as T.Mesh;aim.visible=false;aim.renderOrder=4;
 const headShape=new T.Shape();headShape.moveTo(0,.32);headShape.lineTo(.26,-.1);headShape.lineTo(-.26,-.1);headShape.closePath();const headGeo=new T.ShapeGeometry(headShape);headGeo.rotateX(-Math.PI/2);
 const headMaterial=new T.MeshBasicMaterial({color:'#ff7a8a',transparent:true,depthWrite:false,toneMapped:false,side:T.DoubleSide});
 const head=own(new T.Mesh(headGeo,headMaterial),'pinball-counter-aim-head') as T.Mesh;head.visible=false;head.renderOrder=4;
 let flagCache=-1,rubberCache=[-1,-1],live=false,skillDrawn=-1;
 function lamp(i:number,c:T.Color){const j=i*3;if(lampCache[j]===c.r&&lampCache[j+1]===c.g&&lampCache[j+2]===c.b)return;lampCache[j]=c.r;lampCache[j+1]=c.g;lampCache[j+2]=c.b;lamps.setColorAt(i,c);lamps.instanceColor!.needsUpdate=true;}
 const lerp=(a:T.Color,b:T.Color,k:number)=>tmp.copy(a).lerp(b,Math.max(0,Math.min(1,k)));

 function update(s:PinballState,dt:number){
  const t=s.table,time=s.time,blinkOn=reduced||Math.sin(time*Math.PI*5)>0,slow=reduced||Math.sin(time*Math.PI*2.4)>0;live=false;
  // Wall players sink and pop back up.
  for(let i=0;i<3;i++){const goal=t.wall[i];if(wallAnim[i]!==goal){wallAnim[i]=reduced?goal:goal>wallAnim[i]?Math.min(goal,wallAnim[i]+dt*6):Math.max(goal,wallAnim[i]-dt*9);live=true;}if(wallDrawn[i]!==wallAnim[i])drawWall(i,wallAnim[i]);}
  for(let i=0;i<3;i++){const f=Math.round(t.coneFlash[i]*20)/20;if(f!==coneDrawn[i])drawCone(i,f);if(f>0)live=true;}
  for(let i=0;i<2;i++){const f=Math.round(t.slingFlash[i]*20)/20;if(f!==rubberCache[i]){rubberCache[i]=f;rubbers.setColorAt(i,lerp(LIT.pink,LIT.white,f));rubbers.instanceColor!.needsUpdate=true;}if(f>0)live=true;}
  if(spinner.rotation.x!==t.spinAngle){spinner.rotation.x=t.spinAngle;live=live||t.spinOmega!==0;}
  setSaver(t.saver);
  const shooter=s.phase==='playing'&&s.possession>=0&&pinballWillPass(s)<0?s.defenders[s.possession]:null;
  aim.visible=head.visible=!!shooter;
  if(shooter){
   const lane=pinballCounterLane(s,s.possession),x0=px(shooter.x),z0=pz(shooter.y+26),x1=px(lane),z1=pz(512),dx=x1-x0,dz=z1-z0,len=Math.hypot(dx,dz),yaw=Math.atan2(dx,dz);
   const wind=Math.max(0,Math.min(1,1-s.possessionTime/.72)),grow=reduced?1:.35+.65*wind;
   aim.position.set(x0+dx*grow/2,.05,z0+dz*grow/2);aim.rotation.set(0,yaw,0);aim.scale.set(.16,1,len*grow);
   aimTexture.repeat.set(1,len*grow*1.6);aimTexture.offset.y=reduced?0:-time*2.5;aimMaterial.opacity=.45+.5*wind;
   head.position.set(x0+dx*grow,.05,z0+dz*grow);head.rotation.set(0,yaw+Math.PI,0);headMaterial.opacity=aimMaterial.opacity;
   live=true;
  }
  if(t.flags!==flagCache){flagCache=t.flags;for(let i=0;i<4;i++)flagMesh.setColorAt(i,t.flags&1<<i?LIT.gold:LIT.dimWarm);flagMesh.instanceColor!.needsUpdate=true;}
  // Inserts.
  for(let i=0;i<3;i++){const on=!!(t.crest&1<<i);lamp(L.crest+i,on?LIT.gold:lerp(LIT.dim,LIT.white,t.laneFlash[i]));}
  // Skill-shot marker: a blue halo under the target rung of the launch ladder.
  if(t.skillBand!==skillDrawn){skillDrawn=t.skillBand;dummy.position.set(px(354),.024,pz(560-t.skillBand*15));dummy.rotation.set(-Math.PI/2,0,0);dummy.scale.set(12*W,9*W,1);dummy.updateMatrix();lamps.setMatrixAt(L.skill,dummy.matrix);lamps.instanceMatrix.needsUpdate=true;}
  lamp(L.skill,s.phase==='ready'?LIT.cyan:LIT.dim);
  for(let i=0;i<4;i++)lamp(L.bonus+i,t.bonusX>=i+2?LIT.gold:LIT.dim);
  for(let i=0;i<3;i++)lamp(L.wall+i,t.wallLit>0?(blinkOn?LIT.gold:LIT.coral):t.wall[i]?LIT.dim:LIT.coral);
  for(let i=0;i<4;i++)lamp(L.flag+i,t.flags&1<<i?LIT.gold:t.saver?LIT.green:LIT.dim);
  for(let i=0;i<3;i++){const id=PINBALL_MODES[i].id,done=!!(t.modesDone&1<<i);lamp(L.mode+i,t.mode===id?(blinkOn?LIT.pink:LIT.white):done?LIT.green:t.mode==='final'?(slow?LIT.gold:LIT.pink):LIT.dim);}
  lamp(L.dugout,t.dugoutLit?(blinkOn?LIT.gold:LIT.white):lerp(LIT.dim,LIT.cyan,t.training/TRAINING_GOAL*.6));
  lamp(L.spin,t.spinOmega!==0?LIT.cyan:LIT.dim);
  const stars=t.stars[s.level-1];for(let i=0;i<3;i++)lamp(L.star+i,stars&1<<i?LIT.gold:LIT.dim);
  if(t.wallLit>0||t.dugoutLit||t.mode!=='none'||t.saver)live=live||s.phase==='playing';
 }
 return{update,active:()=>live,group};
}
