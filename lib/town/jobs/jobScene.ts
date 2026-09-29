/**
 * Island jobs + Community Garden in the 3D island (docs/island-jobs.md).
 * Heat: the job signs (ten) are one merged vertex-colour mesh plus one label-atlas mesh (2 draws). Job props exist only
 * while a job runs (instanced, disposed at the end). Garden produce is one InstancedMesh shown only within the garden.
 * Idle cost is one throttled distance check every 0.25 s; nothing animates unless a job is running.
 */
import * as T from 'three';
import {JOBS,REBOUND_WALL,BOARD_RANGE,jobById,type JobDef} from './jobCatalog';
import {startRun,stepRun,reboundEvent,runProgress,runGoals,hitsReboundTarget,onReboundWall,runAction,runActions,runHint,offsideClip,type JobRun,type JobPhase,type JobEvent,type JobAction} from './jobRules';
import {OFFSIDE_PITCH,toWorld,actorAt,ballAt,secondLastDefender} from './offsideClips';
import {createShotCamera} from '../shotCamera';
import {GARDEN_SPOTS,GARDEN_CENTRE,GARDEN_RANGE,GARDEN_STORAGE_KEY,sanitizeGarden,isRipe,minutesLeft,pickSpot,type GardenState} from './garden';
import {goodById} from '../market/goods';
import {fieldSurfaceHeight} from '../venues';
import {islandMarket} from './islandWallet';

export type JobView={
 near:string|null;
 active:{id:string;value:number;total:number;phase:JobPhase;carrying:boolean;hint:string;actions:JobAction[];gauge:{value:number;min:number;max:number}|null;right:boolean|null}|null;
 done:{id:string;seconds:number;nonce:number}|null;
 garden:string;
 pick:{good:string;nonce:number}|null;
};
type BallState={mode:string;wallPhase:string;wallTarget:{x:number;z:number}|null};
export type JobSceneOptions={gather?:(good:string)=>number;now?:()=>number;storage?:Pick<Storage,'getItem'|'setItem'>|null};

// ---- Runtime registry: Town creates the scene, the HUD component subscribes. ----
type Api=ReturnType<typeof createJobScene>;
let current:Api|null=null;const registry=new Set<()=>void>();
export const getJobRuntime=()=>current;
export function subscribeJobRuntime(fn:()=>void){registry.add(fn);return()=>{registry.delete(fn);};}
const EMPTY_VIEW:JobView={near:null,active:null,done:null,garden:'',pick:null};
export const emptyJobView=()=>EMPTY_VIEW;

const floor=(x:number,z:number)=>fieldSurfaceHeight(x,z);
const cue=(name:string,detail:string)=>{try{document.dispatchEvent(new CustomEvent(name,{detail}));}catch{}};

/** Merge coloured parts into one non-indexed geometry with vertex colours. */
function mergeColoured(parts:{geometry:T.BufferGeometry;matrix:T.Matrix4;color:string}[]){
 const pos:number[]=[],nor:number[]=[],col:number[]=[],c=new T.Color();
 for(const p of parts){const g=(p.geometry.index?p.geometry.toNonIndexed():p.geometry.clone()).applyMatrix4(p.matrix);c.set(p.color);const a=g.getAttribute('position'),n=g.getAttribute('normal');
  for(let i=0;i<a.count;i++){pos.push(a.getX(i),a.getY(i),a.getZ(i));nor.push(n.getX(i),n.getY(i),n.getZ(i));col.push(c.r,c.g,c.b);}g.dispose();}
 const out=new T.BufferGeometry();out.setAttribute('position',new T.Float32BufferAttribute(pos,3));out.setAttribute('normal',new T.Float32BufferAttribute(nor,3));out.setAttribute('color',new T.Float32BufferAttribute(col,3));out.computeBoundingSphere();return out;
}
const m4=(x:number,y:number,z:number,yaw=0,sx=1,sy=1,sz=1,pitch=0)=>new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(pitch,yaw,0,'YXZ')),new T.Vector3(sx,sy,sz));

/** Sign label atlas: two labels per 1024-px row (10 jobs = 5 rows, 1024×640). */
const ATLAS_ROWS=Math.ceil(JOBS.length/2);
function labelAtlas(){
 if(typeof document==='undefined')return null;
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=ATLAS_ROWS*128;const g=canvas.getContext('2d');if(!g)return null;
 JOBS.forEach((job,i)=>{const x=(i%2)*512,y=Math.floor(i/2)*128,light=job.id==='line-painter'||job.id==='offside-flag';
  g.fillStyle=job.color;g.fillRect(x,y,512,128);g.fillStyle=light?'#244d40':'#fff3d1';g.fillRect(x+6,y+6,500,4);g.fillRect(x+6,y+118,500,4);
  g.textAlign='center';g.textBaseline='middle';g.font='700 24px Arial, sans-serif';g.fillText(`ISLAND JOB · ${job.role.toUpperCase()}`,x+256,y+34,480);
  g.font='900 50px Arial, sans-serif';g.fillText(job.title.toUpperCase(),x+256,y+82,480);});
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;return texture;
}

export function createJobScene(scene:T.Scene,options:JobSceneOptions={}){
 const now=options.now??(()=>Date.now()),store=options.storage===undefined?(typeof localStorage!=='undefined'?localStorage:null):options.storage;
 const root=new T.Group();root.name='island-jobs';scene.add(root);
 const disposables:{dispose:()=>void}[]=[];const keep=<X extends {dispose:()=>void}>(x:X)=>{disposables.push(x);return x;};
 const box=keep(new T.BoxGeometry(1,1,1)),cyl=keep(new T.CylinderGeometry(1,1,1,10));
 // ---- Static signs, bins, rebound-wall paint: one merged mesh. ----
 const parts:{geometry:T.BufferGeometry;matrix:T.Matrix4;color:string}[]=[];
 for(const job of JOBS){const {x,z,yaw}=job.board,y=floor(x,z),s=Math.sin(yaw),c=Math.cos(yaw);
  {
  for(const side of [-1,1])parts.push({geometry:box,matrix:m4(x+c*side*1.25,y+1.1,z-s*side*1.25,yaw,.12,2.2,.12),color:'#6e5540'});
  parts.push({geometry:box,matrix:m4(x,y+1.72,z,yaw,2.7,.72,.1),color:'#6e5540'});
  parts.push({geometry:box,matrix:m4(x,y+2.14,z,yaw,2.9,.1,.3),color:job.color});
  }
  if(job.deliver){const d=job.deliver,dy=floor(d.x,d.z),bin=job.id==='court-cleanup'?'#3d7f56':job.id==='leaf-rake'?'#7a5a3a':'#2f5c8a';
   if(job.kind==='sort'){parts.push({geometry:box,matrix:m4(d.x,dy+.4,d.z,.3,1.1,.8,.75),color:'#a67d55'});parts.push({geometry:box,matrix:m4(d.x,dy+.83,d.z,.3,1,.08,.65),color:'#f5eed5'});parts.push({geometry:box,matrix:m4(d.x,dy+.5,d.z,.3,1.14,.08,.79),color:'#7a5a3e'});}
   else if(job.kind==='carry'){parts.push({geometry:cyl,matrix:m4(d.x,dy+.02,d.z,0,.9,.03,.9),color:'#f5eed5'});parts.push({geometry:box,matrix:m4(d.x+1,dy+.25,d.z,0,.45,.5,.45),color:'#2f5c8a'});}
   else{parts.push({geometry:cyl,matrix:m4(d.x,dy+.45,d.z,0,.42,.9,.42),color:bin});parts.push({geometry:cyl,matrix:m4(d.x,dy+.92,d.z,0,.46,.06,.46),color:'#e9dfc0'});}}
 }
 // Painted target square on the practice wall and a standing box on the grass (static paint, no draw of its own).
 {const w=REBOUND_WALL,t=w.target,cx=t.x,zf=w.face+.012,mid=(t.bottom+t.top)/2,h=t.top-t.bottom,wd=t.halfWidth*2;
  for(const yy of [t.bottom,t.top])parts.push({geometry:box,matrix:m4(cx,yy,zf,0,wd,.09,.02),color:'#ffd36c'});
  for(const xx of [cx-t.halfWidth,cx+t.halfWidth])parts.push({geometry:box,matrix:m4(xx,mid,zf,0,.09,h,.02),color:'#ffd36c'});
  parts.push({geometry:box,matrix:m4(cx,mid,zf-.004,0,wd*.35,h*.35,.012),color:'#e76f51'});
  const s=JOBS[1].targets[0];for(const dz of [-1.5,1.5])parts.push({geometry:box,matrix:m4(s.x,.012,s.z+dz,0,3,.012,.08),color:'#f5eed5'});for(const dx of [-1.5,1.5])parts.push({geometry:box,matrix:m4(s.x+dx,.012,s.z,0,.08,.012,3),color:'#f5eed5'});}
 const staticMaterial=keep(new T.MeshStandardMaterial({vertexColors:true,roughness:.8}));
 const staticGeometry=keep(mergeColoured(parts));const signs=new T.Mesh(staticGeometry,staticMaterial);signs.name='job-signs';signs.matrixAutoUpdate=false;signs.castShadow=true;root.add(signs);
 // Label atlas: one quad on each face of every sign.
 const atlas=labelAtlas();
 if(atlas){keep(atlas);const pos:number[]=[],uv:number[]=[],idx:number[]=[];
  JOBS.forEach((job,i)=>{const {x,z,yaw}=job.board,y=floor(x,z)+1.72,u0=(i%2)/2,v1=1-Math.floor(i/2)/ATLAS_ROWS,v0=v1-1/ATLAS_ROWS,c=Math.cos(yaw),s=Math.sin(yaw);
   for(const face of [1,-1]){const nx=s*face*.056,nz=c*face*.056,rx=c*1.3*face,rz=-s*1.3*face,base=pos.length/3;
    for(const [k,j] of [[-1,-1],[1,-1],[1,1],[-1,1]])pos.push(x+nx+rx*k,y+j*.33,z+nz+rz*k);
    uv.push(u0,v0,u0+.5,v0,u0+.5,v1,u0,v1);idx.push(base,base+1,base+2,base,base+2,base+3);}});
  const g=keep(new T.BufferGeometry());g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeBoundingSphere();
  const labels=new T.Mesh(g,keep(new T.MeshBasicMaterial({map:atlas,side:T.FrontSide})));labels.name='job-sign-labels';labels.matrixAutoUpdate=false;root.add(labels);}
 // Offer highlight: a ground ring at the nearby sign (no animation).
 const ringMaterial=keep(new T.MeshBasicMaterial({color:'#ffd36c',transparent:true,opacity:.85,depthWrite:false}));
 const offerRing=new T.Mesh(keep(new T.RingGeometry(1.7,2.05,40)),ringMaterial);offerRing.rotation.x=-Math.PI/2;offerRing.visible=false;offerRing.name='job-offer-ring';root.add(offerRing);

 // ---- View store ----
 let view:JobView=EMPTY_VIEW,doneNonce=0,pickNonce=0;const listeners=new Set<()=>void>();
 const setView=(patch:Partial<JobView>)=>{const next={...view,...patch};if(JSON.stringify(next)===JSON.stringify(view))return;view=next;listeners.forEach(f=>f());};

 // ---- Active job props (built on start, disposed on finish) ----
 let run:JobRun|null=null,props:T.Group|null=null,propDisposables:{dispose:()=>void}[]=[],targetsMesh:T.InstancedMesh|null=null,placedMesh:T.InstancedMesh|null=null,carried:T.Mesh|null=null,beacon:T.Group|null=null,time=0;
 const hidden=new T.Matrix4().makeScale(0,0,0);
 function propGeometry(def:JobDef){const own=<G extends T.BufferGeometry>(g:G)=>{propDisposables.push(g);return g;};
  switch(def.prop){case 'leaf':return {g:own(new T.IcosahedronGeometry(.75,0)),color:'#c26a2e',scale:[1,.3,1] as const,lift:.14};
   case 'cone':return {g:own(new T.RingGeometry(.45,.62,24)),color:'#ffd36c',scale:[1,1,1] as const,lift:.03,flat:true};
   case 'peg':return {g:own(new T.RingGeometry(.32,.48,20)),color:'#ffd36c',scale:[1,1,1] as const,lift:.03,flat:true};
   case 'ball':return {g:own(new T.IcosahedronGeometry(.22,1)),color:'#f7f3e6',scale:[1,1,1] as const,lift:.22};
   case 'bottle':return {g:own(new T.CylinderGeometry(.09,.09,.36,8)),color:'#5aa7c8',scale:[1,1,1] as const,lift:.18};
   default:return {g:own(new T.BoxGeometry(1.2,.02,.22)),color:'#ffffff',scale:[1,1,1] as const,lift:.02};}}
 /** Task-job props (kit room, offside strip, pump station): built on start, all disposed by clearProps. */
 let task:{shirts?:T.Mesh[];actors?:T.InstancedMesh;ball?:T.Mesh;ring?:T.Mesh;offLine?:T.Mesh;flag?:T.Group;pumpBall?:T.Mesh;rack?:T.InstancedMesh;key?:string}={};
 const own=<X extends {dispose:()=>void}>(x:X)=>{propDisposables.push(x);return x;};
 const basic=(color:string,extra:T.MeshBasicMaterialParameters={})=>own(new T.MeshBasicMaterial({color,...extra}));
 function canvasTexture(w:number,h:number,draw:(g:CanvasRenderingContext2D)=>void){if(typeof document==='undefined')return null;const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');if(!g)return null;draw(g);const t=own(new T.CanvasTexture(c));t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t;}
 /** Painted lines as one merged vertex-colour mesh (static, one draw). */
 type Line={x:number;z:number;w:number;d:number;color?:string;
  /** Height of the box (default: a 2 cm painted line) and the height of its centre above the ground (default: resting on it). */
  h?:number;y?:number};
 function paintLines(group:T.Group,lines:Line[]){
  const parts=lines.map(l=>{const h=l.h??.02;return {geometry:box,matrix:m4(l.x,floor(l.x,l.z)+(l.y??h/2)+(l.h?0:.005),l.z,0,l.w,h,l.d),color:l.color??'#f5eed5'};});
  const mesh=new T.Mesh(own(mergeColoured(parts)),own(new T.MeshStandardMaterial({vertexColors:true,roughness:.85})));mesh.matrixAutoUpdate=false;group.add(mesh);return mesh;}
 function buildSort(def:JobDef,group:T.Group){
  if(def.task?.type!=='sort')return;const t=def.task,items=t.items;
  // Chalk outline of a small pitch around the pegs, with the goal end by the keeper's peg.
  const xs=def.targets.map(p=>p.x),zs=def.targets.map(p=>p.z),x0=Math.min(...xs)-3,x1=Math.max(...xs)+3,z0=Math.min(...zs)-2.5,z1=Math.max(...zs)+2.5,cx=(x0+x1)/2;
  const chalk='#5f8a6a';// pitch-green chalk reads on the cream paving
  paintLines(group,[{x:cx,z:z0,w:x1-x0,d:.14,color:chalk},{x:cx,z:z1,w:x1-x0,d:.14,color:chalk},{x:x0,z:(z0+z1)/2,w:.14,d:z1-z0,color:chalk},{x:x1,z:(z0+z1)/2,w:.14,d:z1-z0,color:chalk},{x:cx,z:(z0+z1)/2,w:x1-x0,d:.1,color:chalk},{x:def.targets[0].x,z:z1-1.2,w:5,d:.12,color:chalk},
   ...def.targets.flatMap(p=>[{x:p.x,z:p.z-.05,w:.14,d:.14,h:2.2,color:'#6e5540'},{x:p.x,z:p.z-.05,w:1,d:.1,h:.1,y:1.95,color:'#6e5540'},{x:p.x,z:p.z-.05,w:.7,d:.7,h:.08,color:'#6e5540'}])]);
  // Peg boards: one atlas (slot names) + one quad per peg; shirts: one small mesh per shirt, each with its own cell of the shirt atlas.
  const tex=canvasTexture(1024,256,g=>{
   t.slots.forEach((name,i)=>{const x=i*204;g.fillStyle='#244d40';g.fillRect(x+2,2,200,60);g.fillStyle='#fff1d3';g.font='800 26px Arial, sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(name,x+102,33,190);});
   items.forEach((it,i)=>{const x=i*204+22,y=80;g.fillStyle='#c8102e';g.beginPath();g.moveTo(x+40,y);g.lineTo(x+120,y);g.lineTo(x+160,y+34);g.lineTo(x+136,y+58);g.lineTo(x+124,y+50);g.lineTo(x+124,y+166);g.lineTo(x+36,y+166);g.lineTo(x+36,y+50);g.lineTo(x+24,y+58);g.lineTo(x,y+34);g.closePath();g.fill();
    g.fillStyle='#ffffff';g.fillRect(x+64,y,32,10);g.font='900 78px Arial, sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(String(it.number),x+80,y+100);});});
  if(!tex)return;
  const labelMat=own(new T.MeshBasicMaterial({map:tex,side:T.DoubleSide}));const pos:number[]=[],uv:number[]=[],idx:number[]=[];
  def.targets.forEach((p,i)=>{const y=floor(p.x,p.z)+2.45,base=pos.length/3,u0=i*204/1024,u1=(i*204+204)/1024;
   for(const [k,j] of [[-1,-1],[1,-1],[1,1],[-1,1]])pos.push(p.x+k*1.2,y+.1+j*.36,p.z+.02);uv.push(u0,1-62/256,u1,1-62/256,u1,1,u0,1);idx.push(base,base+1,base+2,base,base+2,base+3);});
  const lg=own(new T.BufferGeometry());lg.setAttribute('position',new T.Float32BufferAttribute(pos,3));lg.setAttribute('uv',new T.Float32BufferAttribute(uv,2));lg.setIndex(idx);lg.computeBoundingSphere();
  const labels=new T.Mesh(lg,labelMat);labels.name='kit-peg-labels';group.add(labels);
  task.shirts=items.map((_,i)=>{const g=own(new T.PlaneGeometry(1.15,1.15));const u=g.getAttribute('uv');for(let v=0;v<u.count;v++)u.setXY(v,(i*204+(u.getX(v)?204:0))/1024,u.getY(v)?1-72/256:1-256/256);
   const m=new T.Mesh(g,labelMat);m.visible=false;m.name='kit-shirt-'+items[i].number;group.add(m);return m;});
 }
 function buildOffside(group:T.Group){
  const P=OFFSIDE_PITCH,far=P.touchZ-P.width,midZ=P.touchZ-P.width/2,xa=P.halfX+P.ownA,xb=P.halfX+P.goalA;
  // Practice strip: touchlines, halfway line, goal line, a small goal (posts + bar) and the assistant referee's flag spot.
  paintLines(group,[{x:(xa+xb)/2,z:P.touchZ,w:xb-xa,d:.12},{x:(xa+xb)/2,z:far,w:xb-xa,d:.12},{x:P.halfX,z:midZ,w:.12,d:P.width},{x:xb,z:midZ,w:.12,d:P.width},
   {x:xb+.1,z:midZ-1.83,w:.12,d:.12,h:2.4,color:'#ffffff'},{x:xb+.1,z:midZ+1.83,w:.12,d:.12,h:2.4,color:'#ffffff'},{x:xb+.1,z:midZ,w:.12,d:3.78,h:.12,y:2.4,color:'#ffffff'}]);
  // Players: one instanced capsule mesh (attackers red, defenders blue, keeper yellow), plus the ball, a ring on the receiver and the offside line.
  const clip=OFFSIDE_CLIPS_FIRST();const g=own(new T.CapsuleGeometry(.4,1,4,10)),mat=own(new T.MeshStandardMaterial({color:'#ffffff',roughness:.6}));
  const actors=new T.InstancedMesh(g,mat,clip.actors.length);actors.frustumCulled=false;actors.name='offside-players';const c=new T.Color();
  clip.actors.forEach((x,i)=>{c.set(x.team==='att'?'#e0413f':x.team==='gk'?'#f2c230':'#2f6fb3');actors.setColorAt(i,c);});group.add(actors);task.actors=actors;
  const ball=new T.Mesh(own(new T.IcosahedronGeometry(.22,1)),own(new T.MeshStandardMaterial({color:'#f7f3e6',roughness:.5})));ball.name='offside-ball';group.add(ball);task.ball=ball;
  const ring=new T.Mesh(own(new T.RingGeometry(.62,.85,24)),basic('#ffffff',{transparent:true,opacity:.9,depthWrite:false}));ring.rotation.x=-Math.PI/2;group.add(ring);task.ring=ring;
  const line=new T.Mesh(box,basic('#ffcc00'));line.scale.set(.32,.04,P.width+1);line.visible=false;line.name='offside-line';group.add(line);task.offLine=line;
  // The assistant referee's flag: raised when you flag, lowered when you keep it down.
  const flag=new T.Group();const pole=new T.Mesh(own(new T.CylinderGeometry(.03,.03,.9,6)),basic('#3b3b3b'));pole.position.y=.45;
  const cloth=new T.Mesh(own(new T.PlaneGeometry(.42,.3)),basic('#e0413f',{side:T.DoubleSide}));cloth.position.set(.22,.75,0);flag.add(pole,cloth);flag.visible=false;flag.name='assistant-flag';group.add(flag);task.flag=flag;
 }
 function buildPump(def:JobDef,group:T.Group){
  if(def.task?.type!=='pump')return;const s=def.targets[0],y=floor(s.x,s.z);
  // Stirrup pump (base, barrel, handle) and a low bench for the ball rack.
  paintLines(group,[{x:s.x,z:s.z-1,w:.7,d:.5,h:.08,color:'#2f5c8a'},{x:s.x,z:s.z-1,w:.16,d:.16,h:1.1,color:'#2f5c8a'},{x:s.x,z:s.z-1,w:.8,d:.08,h:.08,y:1.12,color:'#244d40'},{x:s.x+1.8,z:s.z-1,w:2.6,d:.5,h:.3,color:'#a67d55'}]);
  const n=def.task.start.length,g=own(new T.IcosahedronGeometry(.22,1)),m=own(new T.MeshStandardMaterial({color:'#f7f3e6',roughness:.6}));
  const rack=new T.InstancedMesh(g,m,n);rack.frustumCulled=false;rack.name='pump-balls';group.add(rack);task.rack=rack;
  const ball=new T.Mesh(g,m);ball.name='pump-current-ball';ball.position.set(s.x-.7,y+.25,s.z-1);group.add(ball);task.pumpBall=ball;
  paintPump(def);
 }
 function paintPump(def:JobDef){if(!run||def.task?.type!=='pump'||!task.rack)return;const s=def.targets[0],y=floor(s.x,s.z),n=def.task.start.length;
  for(let i=0;i<n;i++){const done=i<run.step,cur=i===run.step&&run.phase==='pump';task.rack.setMatrixAt(i,cur?hidden:m4(s.x+.9+i*.45,y+.3+(done?.22:.12),s.z-1,0,1,done?1:.55,1));}
  task.rack.instanceMatrix.needsUpdate=true;
  if(task.pumpBall){const t=def.task,f=T.MathUtils.clamp(run.pressure/t.max,0,1.3);task.pumpBall.visible=run.phase==='pump';task.pumpBall.scale.set(1,.5+.5*Math.min(1,f),1);task.pumpBall.position.y=y+.14+.11*Math.min(1,f);}}
 const OFFSIDE_CLIPS_FIRST=()=>offsideClip(startRun(jobById('offside-flag')!));
 function buildProps(def:JobDef){
  props=new T.Group();props.name='job-props-'+def.id;root.add(props);propDisposables=[];task={};
  if(def.kind==='collect'||def.kind==='trail'||def.kind==='carry'){
   const pg=propGeometry(def),mat=new T.MeshStandardMaterial({color:'#ffffff',roughness:.7,...(def.prop==='cone'||def.prop==='peg'||def.prop==='chalk'?{transparent:true,opacity:def.prop==='chalk'?.95:.9,depthWrite:false}:{})});propDisposables.push(mat);
   targetsMesh=new T.InstancedMesh(pg.g,mat,def.targets.length);targetsMesh.frustumCulled=false;const color=new T.Color();
   def.targets.forEach((t,i)=>{const yaw=def.prop==='chalk'?Math.atan2(-(t.z-100),t.x-135)+Math.PI/2:(i*1.7)%6.28;
    targetsMesh!.setMatrixAt(i,m4(t.x,floor(t.x,t.z)+pg.lift,t.z,yaw,...pg.scale,'flat' in pg?-Math.PI/2:0));
    color.set(def.prop==='leaf'?['#c26a2e','#d9912f','#9b4b22','#b8752e'][i%4]:def.prop==='chalk'?'#8f9c86':pg.color);targetsMesh!.setColorAt(i,color);});
   props.add(targetsMesh);
   if(def.placed||def.prop==='cone'){const peg=def.prop==='peg',g=peg?new T.CylinderGeometry(.09,.05,.34,8):new T.ConeGeometry(.22,.5,10),m=new T.MeshStandardMaterial({color:peg?'#5b4a36':'#e8742c',roughness:.6});propDisposables.push(g,m);placedMesh=new T.InstancedMesh(g,m,def.targets.length);placedMesh.frustumCulled=false;for(let i=0;i<def.targets.length;i++)placedMesh.setMatrixAt(i,hidden);props.add(placedMesh);}
   if(def.kind==='carry'){carried=new T.Mesh(pg.g,new T.MeshStandardMaterial({color:'#f7f3e6',roughness:.6}));propDisposables.push(carried.material as T.Material);carried.visible=false;props.add(carried);}
  }
  else if(def.kind==='sort')buildSort(def,props);
  else if(def.kind==='offside')buildOffside(props);
  else if(def.kind==='pump')buildPump(def,props);
  beacon=new T.Group();const arrowG=new T.ConeGeometry(.32,.7,4),arrowM=new T.MeshBasicMaterial({color:'#ffd36c'}),ringG=new T.RingGeometry(.8,1,32),ringM=new T.MeshBasicMaterial({color:'#ffd36c',transparent:true,opacity:.7,depthWrite:false});propDisposables.push(arrowG,arrowM,ringG,ringM);
  const arrow=new T.Mesh(arrowG,arrowM);arrow.rotation.x=Math.PI;arrow.position.y=2.2;arrow.name='arrow';const ring=new T.Mesh(ringG,ringM);ring.rotation.x=-Math.PI/2;ring.position.y=.04;beacon.add(arrow,ring);props.add(beacon);
 }
 function clearProps(){if(props){props.removeFromParent();for(const d of propDisposables)d.dispose();}props=null;targetsMesh=placedMesh=null;carried=null;beacon=null;propDisposables=[];task={};}
 // ---- Assistant-referee camera: from behind the far touchline (over the rebound-wall lawn, nothing in the way), looking across the
 // strip toward your touchline spot, so the offside line reads as a vertical line on screen and you can see yourself flagging. ----
 const refCam=createShotCamera(1,.8);
 // The strip sits in the lower half of the frame, under the job HUD (its call buttons), with your flag spot just above it.
 const refShot=(aspect:number)=>{const P=OFFSIDE_PITCH,portrait=aspect<1,tx=P.halfX+(portrait?10:7),tz=P.touchZ+(portrait?4:3.2);
  return {target:{x:tx,y:0,z:tz},eye:{x:tx,y:portrait?34:24,z:portrait?-36:-26},fov:portrait?Math.min(72,2*Math.atan(Math.tan(Math.PI/9)*.9/aspect)*180/Math.PI):40};};
 /** Offside replay: place the players for the current clip time (only when the clip, phase or time changed). */
 function paintOffside(){
  if(!run||run.def.kind!=='offside'||!task.actors)return;const on=run.phase==='watch'||run.phase==='call'||run.phase==='explain';
  const key=`${run.step}:${run.phase}:${run.clock.toFixed(3)}`;if(key===task.key)return;task.key=key;
  task.actors.visible=on;task.ball!.visible=on;task.ring!.visible=on;task.offLine!.visible=run.phase==='explain';task.flag!.visible=run.phase==='explain';
  if(!on)return;const clip=offsideClip(run),t=run.clock;
  clip.actors.forEach((x,i)=>{const q=actorAt(x,t),w=toWorld(q.a,q.s);task.actors!.setMatrixAt(i,m4(w.x,floor(w.x,w.z)+.9,w.z));});task.actors.instanceMatrix.needsUpdate=true;
  const b=ballAt(clip,t),bw=toWorld(b.a,b.s);task.ball!.position.set(bw.x,floor(bw.x,bw.z)+.22,bw.z);
  const r=actorAt(clip.actors.find(x=>x.role==='receiver')!,t),rw=toWorld(r.a,r.s);task.ring!.position.set(rw.x,floor(rw.x,rw.z)+.03,rw.z);
  if(run.phase==='explain'){const la=secondLastDefender(clip,clip.pass),lw=toWorld(la,OFFSIDE_PITCH.width/2);task.offLine!.position.set(lw.x,floor(lw.x,lw.z)+.03,lw.z);
   const spot=run.def.targets[0],raised=run.right?clip.flag:!clip.flag;/* shows the call you made */task.flag!.position.set(spot.x+.6,floor(spot.x,spot.z),spot.z+.2);task.flag!.rotation.z=raised?0:1.2;}
 }
 function applyEvents(ev:JobEvent[]){
  if(!run||!ev.length)return;const def=run.def;
  for(const e of ev){
   if(def.kind==='sort'){
    if(e.type==='return'&&e.index!==undefined&&task.shirts){const shirt=task.shirts[run.step-1],t=def.targets[e.index];if(shirt){shirt.visible=true;shirt.position.set(t.x,floor(t.x,t.z)+1.45,t.z+.06);shirt.rotation.set(0,0,0);}}
    if(e.type==='pickup'||e.type==='return'||e.type==='wrong')cue('fi2-path-cue','path-pop');continue;
   }
   if((e.type==='collect'||e.type==='pickup')&&targetsMesh&&e.index!==undefined){
    if(def.prop==='chalk'){targetsMesh.setColorAt(e.index,new T.Color('#ffffff'));if(targetsMesh.instanceColor)targetsMesh.instanceColor.needsUpdate=true;}
    else{targetsMesh.setMatrixAt(e.index,hidden);targetsMesh.instanceMatrix.needsUpdate=true;}
    if(placedMesh){const t=def.targets[e.index];placedMesh.setMatrixAt(e.index,m4(t.x,floor(t.x,t.z)+(def.prop==='peg'?.15:.25),t.z));placedMesh.instanceMatrix.needsUpdate=true;}
    cue('fi2-path-cue','path-pop');
   }
   if(e.type==='return'||e.type==='pass'||e.type==='shot'||e.type==='deliver'||e.type==='call')cue('fi2-path-cue','path-pop');
   if(e.type==='phase')cue('fi2-path-cue','dock');
  }
  if(def.kind==='offside'&&run.phase!=='work'&&!refCam.active)refCam.begin(refShot);
  if(def.kind==='pump')paintPump(def);
  if(ev.some(e=>e.type==='done')){const seconds=run.seconds,id=def.id;run=null;clearProps();refCam.end();setView({active:null,done:{id,seconds:Math.round(seconds*10)/10,nonce:++doneNonce}});return;}
  publishActive();
 }
 function publishActive(){if(!run){setView({active:null});return;}const p=runProgress(run),t=run.def.task;
  setView({active:{id:run.def.id,value:p.value,total:p.total,phase:run.phase,carrying:run.carrying>=0,hint:runHint(run),actions:runActions(run),gauge:t?.type==='pump'&&run.phase==='pump'?{value:run.pressure,min:t.min,max:t.max}:null,right:run.right}});}
 /** A HUD button for task jobs (offside calls, pump). */
 function act(id:string){if(!run)return;applyEvents(runAction(run,id));if(run?.def.kind==='offside')paintOffside();}

 // ---- Garden ----
 const readGarden=():GardenState=>{let raw:unknown=null;try{raw=JSON.parse(store?.getItem(GARDEN_STORAGE_KEY)??'null');}catch{}return sanitizeGarden(raw,now());};
 let garden:GardenState|null=null;
 const saveGarden=(g:GardenState)=>{garden=g;try{store?.setItem(GARDEN_STORAGE_KEY,JSON.stringify(g));}catch{}};
 const fruitGeometry=keep(new T.IcosahedronGeometry(.17,1)),fruitMaterial=keep(new T.MeshStandardMaterial({color:'#ffffff',roughness:.55,emissive:'#3a2a10',emissiveIntensity:.25}));
 const fruit=new T.InstancedMesh(fruitGeometry,fruitMaterial,GARDEN_SPOTS.length);fruit.name='garden-produce';fruit.visible=false;fruit.frustumCulled=false;root.add(fruit);
 let gardenRefresh=0,inGarden=false,visitPicked=false;
 function paintGarden(){if(!garden)garden=readGarden();const t=now(),c=new T.Color();
  GARDEN_SPOTS.forEach((s,i)=>{const picked=!!garden!.picked[s.id],ripe=isRipe(s,garden!,t),scale=ripe?1:picked?.4:.65;
   fruit.setMatrixAt(i,m4(s.x,s.y,s.z,0,scale,scale,scale));c.set(ripe?goodById(s.good)?.color??'#e0413f':'#7fae4f');fruit.setColorAt(i,c);});
  fruit.instanceMatrix.needsUpdate=true;if(fruit.instanceColor)fruit.instanceColor.needsUpdate=true;}
 function updateGarden(p:{x:number;y:number;z:number}){
  const d=Math.hypot(p.x-GARDEN_CENTRE.x,p.z-GARDEN_CENTRE.z),inside=d<GARDEN_RANGE;
  if(inside!==inGarden){inGarden=inside;fruit.visible=inside;visitPicked=false;if(inside){garden=readGarden();paintGarden();gardenRefresh=0;}else setView({garden:''});}
  if(!inside)return;
  gardenRefresh+=.1;if(gardenRefresh>=5){gardenRefresh=0;paintGarden();}
  if(p.y>1.6){setView({garden:''});return;}
  const t=now();let hint=Math.hypot(p.x-GARDEN_CENTRE.x,p.z-GARDEN_CENTRE.z)<32&&!visitPicked?'Community Garden: walk up to ripe produce to pick it, then sell it at the farmers market.':'';
  for(const s of GARDEN_SPOTS){const dist=Math.hypot(p.x-s.x,p.z-s.z);if(dist>s.reach)continue;
   if(!isRipe(s,garden!,t)){hint=`Not ripe yet — this ${goodById(s.good)?.name.toLowerCase()} needs about ${minutesLeft(s,garden!,t)} more minute${minutesLeft(s,garden!,t)===1?'':'s'}.`;continue;}
   const added=(options.gather??islandMarket.gather)(s.good);
   if(!added){hint='Your basket is full! Sell your produce to Rosa at the farmers market stand.';continue;}
   const next=pickSpot(garden!,s,t);if(next){saveGarden(next);visitPicked=true;paintGarden();cue('fi2-path-cue','path-pop');setView({pick:{good:s.good,nonce:++pickNonce}});}
  }
  setView({garden:hint});
 }

 // ---- Frame update ----
 let slow=0,sceneryShown=true;
 function update(dt:number,p:{x:number;y:number;z:number},ball:BallState|null,active:boolean,visible:boolean,reduced:boolean){
  if(visible!==sceneryShown){sceneryShown=visible;root.visible=visible;}
  if(!active){return;}
  if(run){
   applyEvents(stepRun(run,p,dt,floor));
   if(run&&run.def.kind==='rebound'&&ball){if(ball.wallPhase==='receive'&&lastWallPhase!=='receive'&&ball.mode==='wall-juggle'&&onReboundWall(ball.wallTarget))applyEvents(reboundEvent(run,'pass'));lastWallPhase=ball.mode==='wall-juggle'?ball.wallPhase:'';if(ball.mode!=='shot')shotCounted=false;}
   if(run&&beacon){const goal=runGoals(run).reduce<{x:number;z:number}|null>((best,g)=>!best||Math.hypot(g.x-p.x,g.z-p.z)<Math.hypot(best.x-p.x,best.z-p.z)?g:best,null);
    beacon.visible=!!goal&&!(run.def.kind==='rebound'&&Math.hypot(p.x-goal.x,p.z-goal.z)<2);if(goal){time+=dt;beacon.position.set(goal.x,floor(goal.x,goal.z),goal.z);const arrow=beacon.getObjectByName('arrow')!;arrow.position.y=2.2+(reduced?0:Math.sin(time*3)*.18);}}
   if(run&&run.def.kind==='sort'&&task.shirts){const shirt=task.shirts[run.step];if(shirt&&run.carrying>=0){shirt.visible=true;shirt.position.set(p.x,p.y+2.35,p.z);}}
   if(run&&run.def.kind==='offside')paintOffside();
   if(run&&carried){carried.visible=run.carrying>=0;if(carried.visible)carried.position.set(p.x,p.y+1.35,p.z);}
  }
  slow+=dt;if(slow<.1)return;const tick=slow;slow=0;
  updateGarden(p);
  boardTimer+=tick;if(boardTimer<.25)return;boardTimer=0;
  let near:JobDef|null=null,best=BOARD_RANGE;
  for(const job of JOBS){const d=Math.hypot(p.x-job.board.x,p.z-job.board.z);if(d<best&&Math.abs(p.y-floor(job.board.x,job.board.z))<2){best=d;near=job;}}
  const offered=near&&run?.def.id!==near.id?near:null;
  offerRing.visible=!!offered;if(offered){offerRing.position.set(offered.board.x,floor(offered.board.x,offered.board.z)+.03,offered.board.z);}
  setView({near:offered?.id??null});
 }
 let boardTimer=0,lastWallPhase='',shotCounted=false,lastContact:{x:number;y:number;z:number}|null=null;
 /** Called from the island ball simulator when a kicked ball touches a wall or obstacle. */
 function ballContact(x:number,y:number,z:number,mode:string){
  if(!run||run.def.kind!=='rebound'||mode!=='shot'||shotCounted)return;
  lastContact={x:Math.round(x*10)/10,y:Math.round(y*10)/10,z:Math.round(z*10)/10};
  if(hitsReboundTarget(x,y,z,0)){shotCounted=true;applyEvents(reboundEvent(run,'shot'));}
 }
 function start(id:string){const def=jobById(id);if(!def)return false;quit();run=startRun(def);lastWallPhase='';shotCounted=false;buildProps(def);setView({done:null,near:null});offerRing.visible=false;publishActive();return true;}
 function quit(){refCam.end();if(!run)return;run=null;clearProps();setView({active:null});}
 const api={root,start,quit,update,ballContact,act,
  /** Call right after the follow camera is placed (like fishing.applyCamera): the assistant-referee view while flagging. */
  applyCamera:(camera:T.PerspectiveCamera,dt:number,reduced:boolean)=>refCam.apply(camera,dt,reduced),getView:()=>view,subscribe:(fn:()=>void)=>{listeners.add(fn);return()=>{listeners.delete(fn);};},dismissDone:()=>setView({done:null}),get run(){return run;},get lastContact(){return lastContact;},catalog:JOBS,garden:GARDEN_SPOTS,
  dispose(){quit();root.removeFromParent();for(const d of disposables)d.dispose();fruit.dispose();if(current===api){current=null;registry.forEach(f=>f());}}};
 current=api;registry.forEach(f=>f());
 if(typeof window!=='undefined')(window as unknown as {__fi2Jobs?:unknown}).__fi2Jobs=api;
 return api;
}
