/**
 * Island jobs + Community Garden in the 3D island (docs/island-jobs.md).
 * Heat: the job signs (ten) are one merged vertex-colour mesh plus one label-atlas mesh (2 draws). Job props exist only
 * while a job runs (instanced, disposed at the end). Garden produce is one InstancedMesh shown only within the garden.
 * Idle cost is one throttled distance check every 0.25 s; nothing animates unless a job is running.
 */
import * as T from 'three';
import {JOBS,REBOUND_WALL,BOARD_RANGE,jobById,type JobDef} from './jobCatalog';
import {outsideJobArea,reboundShotStart,reboundShotEnd,startRun,stepRun,reboundEvent,runProgress,runGoals,hitsReboundTarget,onReboundWall,runAction,runActions,runHint,offsideClip,trailOffset,HARVEST,pumpBall,pumpTapsLeft,pumpShown,type JobRun,type JobPhase,type JobEvent,type JobAction} from './jobRules';
import {createJobFx,wobble,ease,type Tween} from './jobFx';
import {createHarvestProps} from './harvestScene';
import {jobButtons,type JobButton} from './jobMoves';
import {createBuildingGlow} from '@/lib/graphics/buildingGlow';
import {createJobBadges} from './jobBadges';
import {readJobLedger} from './jobEconomy';
import {tapHaptic} from '../haptics';
import {OFFSIDE_PITCH,toWorld,actorAt,ballAt,secondLastDefender} from './offsideClips';
import {createShotCamera} from '../shotCamera';
import {GARDEN_SPOTS,GARDEN_CENTRE,GARDEN_RANGE,GARDEN_STORAGE_KEY,sanitizeGarden,isRipe,minutesLeft,pickSpot,markPicked,shiftRipeness,isTreeSpot,type GardenState} from './garden';
import {goodById} from '../market/goods';
import {fieldSurfaceHeight} from '../venues';
import {islandMarket} from './islandWallet';

export type JobView={
 near:string|null;
 /** Another job's sign while a job runs (Sep 30 2026 bug A2): no offer there, G explains "finish or stop your job first". */
 other:string|null;
 active:{id:string;value:number;total:number;phase:JobPhase;carrying:boolean;hint:string;actions:JobAction[];gauge:{value:number;min:number;max:number;label?:string}|null;right:boolean|null;
  /** The job's own action cluster (replaces the Kick / Juggle / Ride buttons, jobMoves.ts); null = keep the ball buttons. */
  buttons:JobButton[]|null}|null;
 /** `bag`: Harvest day's picks this shift (the farmer's share comes from these). */
 done:{id:string;seconds:number;nonce:number;bag?:string[]}|null;
 garden:string;
 pick:{good:string;nonce:number}|null;
 /** On foot at the Coral Cay farm stand with no job running: produce can be sold here too (same market rules as Rosa's). */
 stand:boolean;
};
type BallState={mode:string;wallPhase:string;wallTarget:{x:number;z:number}|null};
export type JobSceneOptions={gather?:(good:string)=>number;now?:()=>number;storage?:Pick<Storage,'getItem'|'setItem'>|null};

// ---- Runtime registry: Town creates the scene, the HUD component subscribes. ----
type Api=ReturnType<typeof createJobScene>;
let current:Api|null=null;const registry=new Set<()=>void>();
export const getJobRuntime=()=>current;
export function subscribeJobRuntime(fn:()=>void){registry.add(fn);return()=>{registry.delete(fn);};}
const EMPTY_VIEW:JobView={near:null,other:null,active:null,done:null,garden:'',pick:null,stand:false};
/** Where the farm stand's counter is served (the Harvest day drop-off, in front of FARM.stand in lib/town/coralCay.ts). */
export const FARM_STAND_SELL={x:611,z:-98.6,reach:2.8};
export const emptyJobView=()=>EMPTY_VIEW;

const floor=(x:number,z:number)=>fieldSurfaceHeight(x,z);
const cue=(name:string,detail:string)=>{try{document.dispatchEvent(new CustomEvent(name,{detail}));}catch{}};
/** Job action sounds (lib/audio/islandSound.ts 'fi2-job-cue': short tone/noise voices from the island kit, rate-limited). */
const jobCue=(kind:string)=>cue('fi2-job-cue',kind);

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

export {JOB_AREA_MARGIN} from './jobRules';
export function createJobScene(scene:T.Scene,options:JobSceneOptions={}){
 const now=options.now??(()=>Date.now()),store=options.storage===undefined?(typeof localStorage!=='undefined'?localStorage:null):options.storage;
 const root=new T.Group();root.name='island-jobs';scene.add(root);
 const fx=createJobFx(root);let lastP={x:0,y:0,z:0},reducedMotion=false;
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
  if(job.deliver){const d=job.deliver,dy=floor(d.x,d.z),bin=job.id==='court-cleanup'?'#3d7f56':job.id==='leaf-rake'?'#7a5a3a':job.id==='farm-harvest'?'#a67d55':'#2f5c8a';
   if(job.kind==='garden'){// The garden crate (Garden shift drop-off): slatted timber, a darker rim, produce peeking over the top.
    parts.push({geometry:box,matrix:m4(d.x,dy+.3,d.z,.2,1,.6,.7),color:'#a67d55'});parts.push({geometry:box,matrix:m4(d.x,dy+.61,d.z,.2,1.06,.06,.76),color:'#7a5a3e'});
    for(const y of [.16,.42])parts.push({geometry:box,matrix:m4(d.x,dy+y,d.z,.2,1.03,.05,.73),color:'#8a6a45'});
    for(const [dx,c] of [[-.25,'#e0413f'],[0,'#f08a2c'],[.25,'#ee9a3a']] as const)parts.push({geometry:box,matrix:m4(d.x+Math.cos(.2)*dx,dy+.62,d.z-Math.sin(.2)*dx,.2,.22,.12,.22),color:c});}
   else if(job.kind==='sort'){parts.push({geometry:box,matrix:m4(d.x,dy+.4,d.z,.3,1.1,.8,.75),color:'#a67d55'});parts.push({geometry:box,matrix:m4(d.x,dy+.83,d.z,.3,1,.08,.65),color:'#f5eed5'});parts.push({geometry:box,matrix:m4(d.x,dy+.5,d.z,.3,1.14,.08,.79),color:'#7a5a3e'});}
   // Ball kid (Oct 1 2026): an open-topped ball box beside the halfway line (floor, four walls, a white rim); returned balls sit in it.
   else if(job.kind==='carry'){parts.push({geometry:box,matrix:m4(d.x,dy+.04,d.z,0,1.2,.08,.8),color:'#244d40'});
    for(const sz of [-1,1])parts.push({geometry:box,matrix:m4(d.x,dy+.26,d.z+sz*.37,0,1.2,.44,.06),color:'#2f5c8a'},{geometry:box,matrix:m4(d.x+sz*.57,dy+.26,d.z,0,.06,.44,.8),color:'#2f5c8a'});
    for(const sz of [-1,1])parts.push({geometry:box,matrix:m4(d.x,dy+.5,d.z+sz*.37,0,1.24,.05,.08),color:'#f5eed5'},{geometry:box,matrix:m4(d.x+sz*.57,dy+.5,d.z,0,.08,.05,.84),color:'#f5eed5'});}
   else{parts.push({geometry:cyl,matrix:m4(d.x,dy+.45,d.z,0,.42,.9,.42),color:bin});parts.push({geometry:cyl,matrix:m4(d.x,dy+.92,d.z,0,.46,.06,.46),color:'#e9dfc0'});}}
 }
 // Painted target square on the practice wall and a standing box on the grass (static paint, no draw of its own).
 {const w=REBOUND_WALL,t=w.target,cx=t.x,zf=w.face+.012,mid=(t.bottom+t.top)/2,h=t.top-t.bottom,wd=t.halfWidth*2;
  for(const yy of [t.bottom,t.top])parts.push({geometry:box,matrix:m4(cx,yy,zf,0,wd,.09,.02),color:'#ffd36c'});
  for(const xx of [cx-t.halfWidth,cx+t.halfWidth])parts.push({geometry:box,matrix:m4(xx,mid,zf,0,.09,h,.02),color:'#ffd36c'});
  parts.push({geometry:box,matrix:m4(cx,mid,zf-.004,0,wd*.35,h*.35,.012),color:'#e76f51'});
  /* The old standing box is gone (Sep 30 2026): target shots are taken from a moving glowing circle (the job beacon's ring). */}
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
 // "JOB" badges over every sign and the Community Garden (jobBadges.ts): one instanced draw, idle when none is in range.
 // Sep 30 2026: the Community Garden's own floating badge is gone; its Garden shift sign has a normal job badge (§13).
 const badges=createJobBadges(root,JOBS.map(j=>({id:j.id,x:j.board.x,y:floor(j.board.x,j.board.z)+3.25,z:j.board.z})));
 const refreshBadges=()=>{let today:string[]=[];try{today=Object.keys(readJobLedger().today);}catch{}badges.setState(run?.def.id??null,today);};// first call on the board timer (run is declared below)
 // Offer highlight: a ground ring at the nearby sign (no animation).
 const ringMaterial=keep(new T.MeshBasicMaterial({color:'#ffd36c',transparent:true,opacity:.85,depthWrite:false}));
 // Sign glow (user, Sep 30 2026: "highlight that like the buildings"): the buildings' outline glow, one shared instance moved to the
 // sign you're standing at (posts + board: 2.7 m wide, 2.2 m tall).
 const glowRoot=new T.Group();glowRoot.name='job-sign-selection';root.add(glowRoot);const signGlow=createBuildingGlow(glowRoot,2.74,.3,2.2,'vending');disposables.push({dispose:()=>signGlow.dispose()});
 const offerRing=new T.Mesh(keep(new T.RingGeometry(1.7,2.05,40)),ringMaterial);offerRing.rotation.x=-Math.PI/2;offerRing.visible=false;offerRing.name='job-offer-ring';root.add(offerRing);

 // ---- View store ----
 let view:JobView=EMPTY_VIEW,doneNonce=0,pickNonce=0;const listeners=new Set<()=>void>();
 // Heat audit #8 (Sep 30 2026): a shallow compare of the patched fields (it was two JSON.stringify of the whole view, at 4 Hz on the
 // board tick, 10 Hz in the garden and on every publish). `done` / `pick` are new objects only when they really change (fresh nonce),
 // and `active` arrives as the same object when its content is unchanged (publishActive compares its own key).
 const setView=(patch:Partial<JobView>)=>{let changed=false;for(const k in patch){const key=k as keyof JobView;if(patch[key]!==view[key]){changed=true;break;}}
  if(!changed)return;view={...view,...patch};listeners.forEach(f=>f());};

 // ---- Active job props (built on start, disposed on finish) ----
 let run:JobRun|null=null,props:T.Group|null=null,propDisposables:{dispose:()=>void}[]=[],targetsMesh:T.InstancedMesh|null=null,placedMesh:T.InstancedMesh|null=null,carried:T.Mesh|null=null,beacon:T.Group|null=null,time=0;
 const hidden=new T.Matrix4().makeScale(0,0,0);
 function propGeometry(def:JobDef){const own=<G extends T.BufferGeometry>(g:G)=>{propDisposables.push(g);return g;};
  switch(def.prop){case 'leaf':return {g:own(new T.IcosahedronGeometry(.75,0)),color:'#c26a2e',scale:[1,.3,1] as const,lift:.14};
   case 'cone':return {g:own(new T.RingGeometry(.45,.62,24)),color:'#ffd36c',scale:[1,1,1] as const,lift:.03,flat:true};
   case 'peg':return {g:own(new T.RingGeometry(.32,.48,20)),color:'#ffd36c',scale:[1,1,1] as const,lift:.03,flat:true};
   case 'ball':return {g:own(new T.IcosahedronGeometry(.22,1)),color:'#f7f3e6',scale:[1,1,1] as const,lift:.22};
   case 'bottle':return {g:own(new T.CylinderGeometry(.09,.09,.36,8)),color:'#5aa7c8',scale:[1,1,1] as const,lift:.18};
   case 'produce':return {g:own(new T.IcosahedronGeometry(.34,0)),color:'#e8be71',scale:[1,.9,1] as const,lift:.45};
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
  if(t.style==='crates'){buildCrates(def,t,group);return;}
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
 /** Match-day snacks (Sep 29 2026): three labelled crates and one food card per item, all cells of one small canvas atlas.
  *  Built on start, disposed with the other job props; the carried card follows the player, like the kit room's shirts. */
 function buildCrates(def:JobDef,t:{slots:string[];items:{label?:string;color?:string;number:number}[]},group:T.Group){
  const n=Math.max(t.slots.length,t.items.length),cw=Math.floor(1024/n);
  paintLines(group,def.targets.flatMap(p=>[{x:p.x,z:p.z,w:1.3,d:.9,h:.6,color:'#a67d55'},{x:p.x,z:p.z,w:1.36,d:.96,h:.08,y:.6,color:'#7a5a3e'},{x:p.x,z:p.z,w:1.1,d:.7,h:.02,y:.61,color:'#5b4630'}]));
  const tex=canvasTexture(1024,256,g=>{g.textAlign='center';g.textBaseline='middle';
   t.slots.forEach((name,i)=>{const x=i*cw;g.fillStyle='#244d40';g.fillRect(x+2,2,cw-4,60);g.fillStyle='#fff1d3';g.font='800 24px Arial, sans-serif';g.fillText(name,x+cw/2,33,cw-12);});
   t.items.forEach((it,i)=>{const x=i*cw,y=72;g.fillStyle='#fff8e5';roundedRect(g,x+6,y,cw-12,176,18);g.fill();g.fillStyle=it.color??'#e8be71';g.beginPath();g.arc(x+cw/2,y+62,44,0,Math.PI*2);g.fill();
    g.strokeStyle='#294f43';g.lineWidth=4;g.stroke();g.fillStyle='#294f43';g.font='800 22px Arial, sans-serif';g.fillText((it.label??'').toUpperCase(),x+cw/2,y+142,cw-18);});});
  if(!tex)return;
  const labelMat=own(new T.MeshBasicMaterial({map:tex,side:T.DoubleSide}));const pos:number[]=[],uv:number[]=[],idx:number[]=[];
  def.targets.forEach((p,i)=>{const y=floor(p.x,p.z)+1.25,base=pos.length/3,u0=i*cw/1024,u1=(i*cw+cw)/1024;
   for(const [k,j] of [[-1,-1],[1,-1],[1,1],[-1,1]])pos.push(p.x+k*.95,y+j*.28,p.z+.5);uv.push(u0,1-62/256,u1,1-62/256,u1,1,u0,1);idx.push(base,base+1,base+2,base,base+2,base+3);});
  const lg=own(new T.BufferGeometry());lg.setAttribute('position',new T.Float32BufferAttribute(pos,3));lg.setAttribute('uv',new T.Float32BufferAttribute(uv,2));lg.setIndex(idx);lg.computeBoundingSphere();
  const labels=new T.Mesh(lg,labelMat);labels.name='snack-crate-labels';group.add(labels);
  task.shirts=t.items.map((it,i)=>{const g=own(new T.PlaneGeometry(.9,.9));const u=g.getAttribute('uv');for(let v=0;v<u.count;v++)u.setXY(v,(i*cw+(u.getX(v)?cw:0))/1024,u.getY(v)?1-72/256:1-248/256);
   const m=new T.Mesh(g,labelMat);m.visible=false;m.name='snack-card-'+it.number;group.add(m);return m;});
 }
 function roundedRect(g:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number){g.beginPath();if(g.roundRect)g.roundRect(x,y,w,h,r);else g.rect(x,y,w,h);}
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
  paintLines(group,[{x:s.x,z:s.z-1,w:.7,d:.5,h:.08,color:'#2f5c8a'},{x:s.x,z:s.z-1,w:.16,d:.16,h:.66,color:'#2f5c8a'},{x:s.x+1.8,z:s.z-1,w:2.6,d:.5,h:.3,color:'#a67d55'}]);
  const n=def.task.balls.length,g=own(new T.IcosahedronGeometry(.22,1)),m=own(new T.MeshStandardMaterial({color:'#f7f3e6',roughness:.6}));
  const rack=new T.InstancedMesh(g,m,n);rack.frustumCulled=false;rack.name='pump-balls';group.add(rack);task.rack=rack;
  const ball=new T.Mesh(g,m);ball.name='pump-current-ball';ball.position.set(s.x-.7,y+.25,s.z-1);group.add(ball);task.pumpBall=ball;
  paintPump(def);
 }
 function paintPump(def:JobDef){if(!run||def.task?.type!=='pump'||!task.rack)return;const s=def.targets[0],y=floor(s.x,s.z),n=def.task.balls.length;
  for(let i=0;i<n;i++){const done=i<run.step,cur=i===run.step&&run.phase==='pump';task.rack.setMatrixAt(i,cur?hidden:m4(s.x+.9+i*.45,y+.3+(done?.22:.12),s.z-1,0,1,done?1:.55,1));}
  task.rack.instanceMatrix.needsUpdate=true;
  if(task.pumpBall){const b=pumpBall(run)??def.task.balls[0],f=T.MathUtils.clamp(run.pressure/b.max,0,1.3);task.pumpBall.visible=run.phase==='pump';task.pumpBall.scale.set(1,.5+.5*Math.min(1,f),1);task.pumpBall.position.y=y+.14+.11*Math.min(1,f);}}
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
   if(def.kind==='carry'){carried=new T.Mesh(pg.g,new T.MeshStandardMaterial({color:'#f7f3e6',roughness:.6}));propDisposables.push(carried.material as T.Material);carried.visible=false;props.add(carried);if(run)paintBallKid(def,run);}
  }
  else if(def.kind==='sort')buildSort(def,props);
  else if(def.kind==='offside')buildOffside(props);
  else if(def.kind==='pump')buildPump(def,props);
  buildGear(def,props);
  beacon=new T.Group();const arrowG=new T.ConeGeometry(.32,.7,4),arrowM=new T.MeshBasicMaterial({color:'#ffd36c'}),ringG=new T.RingGeometry(.8,1,32),ringM=new T.MeshBasicMaterial({color:'#ffd36c',transparent:true,opacity:.7,depthWrite:false});propDisposables.push(arrowG,arrowM,ringG,ringM);
  const arrow=new T.Mesh(arrowG,arrowM);arrow.rotation.x=Math.PI;arrow.position.y=2.2;arrow.scale.setScalar(1.5);arrow.name='arrow';const ring=new T.Mesh(ringG,ringM);ring.rotation.x=-Math.PI/2;ring.position.y=.04;ring.name='beacon-ring';beacon.add(arrow,ring);props.add(beacon);
 }
 // ---- Action gear (Sep 30 2026, docs/island-jobs.md "Actions and animations"): what the player carries or swings for each job.
 // Built with the job props (a few small meshes), hidden until used, disposed at the end. Per-frame work only follows the player.
 type Gear={bag:T.Mesh|null;bagCount:number;tossing:boolean;stack:T.InstancedMesh|null;hammer:T.Group|null;marker:T.Group|null;trail:T.InstancedMesh|null;trailN:number;trailLast:{x:number;z:number}|null;
  handle:T.Mesh|null;lids:T.InstancedMesh|null;lidTilt:number[];pulse:T.Mesh|null;flash:T.Mesh|null;lift:{t:number;from:{x:number;y:number;z:number}}|null;pile:number[];pileYaw:number[];swirl:number;
  harvest:ReturnType<typeof createHarvestProps>;
  /** Held in the character's hands (Sep 30 2026, §10): the leaf rake and the assistant referee's flag. */
  rake:T.Group|null;handFlag:T.Group|null;
  /** Garden shift (§13): the basket in the left hand, its 1–3 fruit (one instanced draw, the garden's shared fruit geometry), the
   *  goods picked so far (colours) and the tip toward the crate. */
  basket:T.Group|null;basketFill:T.InstancedMesh|null;basketGoods:string[];basketTilt:number};
 const noGear=():Gear=>({bag:null,bagCount:0,tossing:false,stack:null,hammer:null,marker:null,trail:null,trailN:0,trailLast:null,handle:null,lids:null,lidTilt:[],pulse:null,flash:null,lift:null,pile:[],pileYaw:[],swirl:0,harvest:null,rake:null,handFlag:null,basket:null,basketFill:null,basketGoods:[],basketTilt:0});
 let gear:Gear=noGear();
 const TRAIL_MAX=220;
 function buildGear(def:JobDef,group:T.Group){
  gear=noGear();const std=(color:string)=>own(new T.MeshStandardMaterial({color,roughness:.7}));
  if(def.prop==='leaf'||def.prop==='bottle'||def.kind==='harvest'){
   const g=def.kind==='harvest'?own(new T.CylinderGeometry(.32,.22,.34,10)):own(new T.IcosahedronGeometry(.3,1));
   gear.bag=new T.Mesh(g,std(def.prop==='leaf'?'#8a6a45':def.prop==='bottle'?'#3d7f56':'#c9a26b'));gear.bag.name='job-bag';gear.bag.visible=false;group.add(gear.bag);}
  if(def.prop==='leaf'){gear.pile=def.targets.map(()=>1);gear.pileYaw=def.targets.map((_,i)=>(i*1.7)%6.28);}
  if(def.prop==='cone'){gear.stack=new T.InstancedMesh(own(new T.ConeGeometry(.22,.5,10)),std('#e8742c'),def.targets.length);gear.stack.name='cone-stack';gear.stack.frustumCulled=false;group.add(gear.stack);}
  if(def.prop==='peg'){const h=new T.Group();const handle=new T.Mesh(own(new T.CylinderGeometry(.045,.045,.8,6)),std('#9d805b'));handle.rotation.z=Math.PI/2;handle.position.x=-.4;
   const head=new T.Mesh(own(new T.BoxGeometry(.2,.34,.2)),std('#4a4f55'));head.position.x=-.8;h.add(handle,head);h.visible=false;h.name='job-hammer';group.add(h);gear.hammer=h;}
  if(def.prop==='chalk'){const mk=new T.Group();const body=new T.Mesh(own(new T.BoxGeometry(.42,.22,.3)),std('#2f5c8a'));body.position.y=.28;
   const wheel=new T.Mesh(own(new T.CylinderGeometry(.13,.13,.08,10)),std('#f5eed5'));wheel.rotation.x=Math.PI/2;wheel.position.set(.14,.13,0);
   const bar=new T.Mesh(own(new T.CylinderGeometry(.025,.025,.9,6)),std('#244d40'));bar.position.set(-.35,.6,0);bar.rotation.z=-.9;mk.add(body,wheel,bar);mk.visible=false;mk.name='line-marker';group.add(mk);gear.marker=mk;
   gear.trail=new T.InstancedMesh(own(new T.PlaneGeometry(.13,.42)),own(new T.MeshBasicMaterial({color:'#ffffff'})),TRAIL_MAX);gear.trail.name='line-paint';gear.trail.frustumCulled=false;gear.trail.count=0;group.add(gear.trail);}
  if(def.kind==='pump'&&def.task?.type==='pump'){const s=def.targets[0];gear.handle=new T.Mesh(own(new T.BoxGeometry(.8,.08,.08)),std('#244d40'));gear.handle.position.set(s.x,floor(s.x,s.z)+.72,s.z-1);gear.handle.name='pump-handle';group.add(gear.handle);}
  if(def.kind==='sort'&&def.task?.type==='sort'&&def.task.style==='crates'){const g=own(new T.BoxGeometry(1.3,.06,.9));g.translate(0,0,.45);
   gear.lids=new T.InstancedMesh(g,std('#8a6a45'),def.targets.length);gear.lids.name='snack-crate-lids';gear.lids.frustumCulled=false;gear.lidTilt=def.targets.map(()=>-.35);group.add(gear.lids);paintLids(def);}
  if(def.kind!=='harvest'){gear.pulse=new T.Mesh(own(new T.RingGeometry(.42,.6,32)),own(new T.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide})));gear.pulse.visible=false;gear.pulse.name='job-pulse';group.add(gear.pulse);}
  if(def.kind==='rebound'){const t=REBOUND_WALL.target;gear.flash=new T.Mesh(own(new T.PlaneGeometry(t.halfWidth*2,t.top-t.bottom)),own(new T.MeshBasicMaterial({color:'#ffe38a',transparent:true,opacity:0,depthWrite:false})));
   gear.flash.position.set(t.x,(t.top+t.bottom)/2,REBOUND_WALL.face+.03);gear.flash.visible=false;gear.flash.name='rebound-target-flash';group.add(gear.flash);}
  if(def.kind==='harvest')gear.harvest=createHarvestProps(def,group,own,floor,fx,jobCue);
  if(def.kind==='garden'){const b=new T.Group();b.rotation.order='YXZ';const wicker=std('#b88a4e');wicker.side=T.DoubleSide;
   const body=new T.Mesh(own(new T.CylinderGeometry(.17,.12,.16,10,1,true)),wicker),bottom=new T.Mesh(own(new T.CircleGeometry(.12,10)),wicker);bottom.rotation.x=-Math.PI/2;bottom.position.y=-.08;
   const handle=new T.Mesh(own(new T.TorusGeometry(.15,.012,4,12,Math.PI)),std('#8a6a45'));handle.position.y=.08;
   const fill=new T.InstancedMesh(fruitGeometry,own(new T.MeshStandardMaterial({color:'#ffffff',roughness:.55})),3);fill.name='garden-basket-fruit';fill.frustumCulled=false;fill.count=0;
   b.add(body,bottom,handle,fill);b.name='garden-basket';b.visible=false;group.add(b);gear.basket=b;gear.basketFill=fill;}
  if(def.prop==='leaf'){const r=new T.Group(),wood=std('#9d805b');const pole=new T.Mesh(own(new T.CylinderGeometry(.025,.025,1.35,6)),wood);pole.position.y=-.55;
   const head=new T.Mesh(own(new T.BoxGeometry(.5,.05,.08)),std('#5b5f63'));head.position.y=-1.22;r.add(pole,head);r.name='job-rake';group.add(r);gear.rake=r;}
  if(def.kind==='offside'){const f=new T.Group();const pole=new T.Mesh(own(new T.CylinderGeometry(.018,.018,.75,6)),std('#3b3b3b'));pole.position.y=.25;
   const cloth=new T.Mesh(own(new T.PlaneGeometry(.34,.26)),own(new T.MeshBasicMaterial({color:'#f2c230',side:T.DoubleSide})));cloth.position.set(.17,.5,0);f.add(pole,cloth);f.name='job-hand-flag';group.add(f);gear.handFlag=f;}
 }
 function paintLids(def:JobDef){const l=gear.lids;if(!l)return;def.targets.forEach((p,i)=>l.setMatrixAt(i,m4(p.x,floor(p.x,p.z)+.66,p.z-.45,0,1,1,1,gear.lidTilt[i])));l.instanceMatrix.needsUpdate=true;}
 /** A ring that grows and fades once: right/wrong feedback, a clank, a wall rebound. `wall`: stands upright facing +z. */
 function pulse(x:number,y:number,z:number,color:string,wall=false,size=1){const r=gear.pulse;if(!r)return;const mat=r.material as T.MeshBasicMaterial;mat.color.set(color);r.visible=true;r.position.set(x,y,z);r.rotation.set(wall?0:-Math.PI/2,0,0);
  if(reducedMotion){mat.opacity=.8;r.scale.setScalar(size*1.4);fx.tween(.5,()=>{},()=>{r.visible=false;});return;}
  fx.tween(.45,k=>{r.scale.setScalar(size*(.6+k*1.6));mat.opacity=.9*(1-k);},()=>{r.visible=false;});}
 let ending=0;
 /** The run that just finished (bug A9/A10, Sep 30 2026): what is in the hands keeps following them through the last pose
  *  (≤ 1.2 s wind-down), instead of freezing in mid-air where the hand was when the job ended. */
 let endingRun:JobRun|null=null;
 /** The character side (Town.tsx + jobMoves.ts) hears each job event to play its pose. */
 const eventListeners=new Set<(e:JobEvent,def:JobDef)=>void>();
 function clearProps(){fx.clear();if(flyer)flyer.visible=false;ending=0;endingRun=null;if(props){props.removeFromParent();for(const d of propDisposables)d.dispose();}props=null;targetsMesh=placedMesh=null;carried=null;beacon=null;propDisposables=[];task={};gear=noGear();}
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
 const handPos=()=>({x:lastP.x,y:lastP.y+1.1,z:lastP.z});
 /** Leaves / bottles fly from the ground into the bag at the player's side. */
 function intoBag(def:JobDef,i:number){const t=def.targets[i],y=floor(t.x,t.z),mesh=targetsMesh;if(!mesh)return;const sc=gear.pile[i]??1,yaw=gear.pileYaw[i]??0;
  const done=()=>{mesh.setMatrixAt(i,hidden);mesh.instanceMatrix.needsUpdate=true;gear.bagCount++;jobCue('bag');};
  if(reducedMotion){done();return;}
  fx.arc((x,yy,z,k)=>{const s=1-k*.6;mesh.setMatrixAt(i,def.prop==='leaf'?m4(x,yy,z,yaw+k*6,sc*.75*s,.45*s,sc*.75*s):m4(x,yy,z,k*8,s,s,s,k*5));mesh.instanceMatrix.needsUpdate=true;},{x:t.x,y:y+.2,z:t.z},{x:lastP.x-.35,y:lastP.y+.9,z:lastP.z},.9,.38,done);
  if(def.prop==='leaf')fx.burst(t.x,y+.3,t.z,'#c26a2e',6,1.4,1.4,true,1.6);}
 /** A cone drops from your hands onto its mark and settles with a wobble. */
 function dropCone(def:JobDef,i:number){const t=def.targets[i],y=floor(t.x,t.z),pm=placedMesh;if(!pm)return;
  if(targetsMesh){targetsMesh.setMatrixAt(i,hidden);targetsMesh.instanceMatrix.needsUpdate=true;}
  const set=(x:number,yy:number,z:number,tilt:number)=>{pm.setMatrixAt(i,m4(x,yy,z,0,1,1,1,tilt));pm.instanceMatrix.needsUpdate=true;};
  jobCue('place');if(reducedMotion){set(t.x,y+.25,t.z,0);return;}
  const from={x:lastP.x+.35,y:lastP.y+.9,z:lastP.z};
  fx.arc((x,yy,z)=>set(x,yy,z,0),from,{x:t.x,y:y+.25,z:t.z},.25,.28,()=>{jobCue('thud');fx.tween(.5,k=>set(t.x,y+.25,t.z,wobble(k,3)*.35));});}
 /** One hammer blow: the hammer swings down onto the peg, which sinks a notch (`value` = share of the hits done). */
 function hammerHit(def:JobDef,i:number,value:number){const t=def.targets[i],y=floor(t.x,t.z),h=gear.hammer,pm=placedMesh;if(!h||!pm)return;
  const pegAt=(v:number)=>{pm.setMatrixAt(i,m4(t.x,y+.15+(1-v)*.32,t.z));pm.instanceMatrix.needsUpdate=true;};
  const before=Math.max(0,value-1/3);h.visible=true;h.position.set(t.x+.8,y+.24+(1-value)*.32+.1,t.z);h.rotation.set(0,0,-1.1);
  if(reducedMotion){pegAt(value);jobCue(value>=1?'clank':'tap');h.rotation.z=0;if(value>=1)fx.tween(.35,()=>{},()=>{h.visible=false;});return;}
  pegAt(before);
  fx.tween(.23,k=>{h.rotation.z=-1.1*(1-ease.inOut(k));},()=>{jobCue(value>=1?'clank':'tap');fx.burst(t.x,y+.05,t.z,'#8b6a4a',4,1,1.2,false,.7);
   fx.tween(.1,k=>pegAt(before+(value-before)*k),()=>fx.tween(.3,k=>{h.rotation.z=-.5*k;},()=>{if(value>=1)h.visible=false;}));});}
 /** Ball kid: roll/throw the ball back from your spot to a player on the pitch. */
 /** Ball kid: where returned ball i rests in the ball box (two rows). */
 function boxSlot(def:JobDef,i:number){const d=def.deliver!;return {x:d.x-.36+(i%3)*.36,y:floor(d.x,d.z)+.3+(i>=3?.12:0),z:d.z+(i>=3?.16:-.14)+(i>=3?(i-3)*.02:0)};}
 /** Ball kid (Oct 1 2026): only the ball to fetch now lies out; balls already returned sit in the ball box. */
 function paintBallKid(def:JobDef,jr:JobRun){const mesh=targetsMesh;if(!mesh||def.kind!=='carry')return;
  def.targets.forEach((t,i)=>{if(jr.got[i]){const b=boxSlot(def,i);mesh.setMatrixAt(i,m4(b.x,b.y,b.z,i*1.3));}else mesh.setMatrixAt(i,i===jr.next&&jr.carrying<0?m4(t.x,floor(t.x,t.z)+.22,t.z):hidden);});
  mesh.instanceMatrix.needsUpdate=true;}
 /** The carried ball goes into the box (a short drop from the hands), then the next loose ball pops up where it lies. */
 function boxBall(def:JobDef,i:number){const mesh=targetsMesh;if(!def.deliver||!mesh)return;const to=boxSlot(def,i),jr=run;jobCue('place');
  const next=()=>{if(!run||run!==jr||run.next>=def.targets.length)return;const n=run.next,t=def.targets[n],y=floor(t.x,t.z)+.22;
   if(reducedMotion){mesh.setMatrixAt(n,m4(t.x,y,t.z));mesh.instanceMatrix.needsUpdate=true;return;}
   fx.tween(.35,k=>{const s=Math.max(.01,ease.out(k));mesh.setMatrixAt(n,m4(t.x,y,t.z,0,s,s,s));mesh.instanceMatrix.needsUpdate=true;});pulse(t.x,floor(t.x,t.z)+.05,t.z,'#ffd36c',false,1.4);};
  if(reducedMotion){mesh.setMatrixAt(i,m4(to.x,to.y,to.z));mesh.instanceMatrix.needsUpdate=true;next();return;}
  const set=(x:number,y:number,z:number,k:number)=>{mesh.setMatrixAt(i,m4(x,y,z,k*3));mesh.instanceMatrix.needsUpdate=true;};
  fx.arc(set,handPos(),to,.35,.35,()=>{jobCue('thud');set(to.x,to.y,to.z,.4);next();});}
 /** The full bag is tossed into the bin / unloaded at the stand. */
 function unloadBag(def:JobDef){const d=def.deliver,bag=gear.bag;jobCue('bag');tapHaptic();if(!d||!bag)return;const to={x:d.x,y:floor(d.x,d.z)+.9,z:d.z};
  if(reducedMotion||!bag.visible){bag.visible=false;gear.bagCount=0;return;}
  gear.tossing=true;const from={x:bag.position.x,y:bag.position.y,z:bag.position.z};
  fx.arc((x,y,z,k)=>{bag.position.set(x,y,z);bag.rotation.set(k*4,0,k*2);},from,to,.8,.45,()=>{bag.visible=false;gear.tossing=false;gear.bagCount=0;jobCue('thud');
   if(def.prop==='leaf')fx.burst(d.x,to.y+.2,d.z,'#c26a2e',8,1.2,1.8,true,1.6);});}
 function lidWobble(i:number,open:boolean){const def=run?.def??null;if(!gear.lids||!def)return;const d=def;
  if(reducedMotion){gear.lidTilt[i]=-.35;paintLids(d);return;}
  fx.tween(open?.55:.4,k=>{gear.lidTilt[i]=open?-.35-Math.sin(Math.min(1,k*1.6)*Math.PI)*.9+wobble(k,3)*.12:-.35+wobble(k,4)*.25;paintLids(d);});}
 /** Garden basket: 1, 2 or 3 fruit show after 1, 3 and 6 picks, in the colours of the latest picks. */
 function paintBasket(){const f=gear.basketFill;if(!f)return;const g=gear.basketGoods,n=g.length>=6?3:g.length>=3?2:g.length?1:0,c=new T.Color();
  for(let k=0;k<n;k++){f.setMatrixAt(k,m4((k-1)*.07,.05+(k===1?.025:0),(k%2)*.04-.02,k,.55,.55,.55));f.setColorAt(k,c.set(goodById(g[g.length-1-k])?.color??'#e0413f'));}
  f.count=n;f.instanceMatrix.needsUpdate=true;if(f.instanceColor)f.instanceColor.needsUpdate=true;}
 /** A picked garden item flies from the plant into the basket (shift) or the hands (free picking), timed with the pose's tug. */
 function flyFruit(i:number,toBasket:boolean){const s=GARDEN_SPOTS[i],col=goodById(s.good)?.color??'#e0413f';
  const land=()=>{flyer.visible=false;if(toBasket){gear.basketGoods.push(s.good);paintBasket();}};
  if(reducedMotion){paintGarden();land();return;}
  fx.tween(isTreeSpot(s)?.4:.36,()=>{},()=>{paintGarden();(flyer.material as T.MeshStandardMaterial).color.set(col);flyer.visible=true;const b=gear.basket;
   const to=toBasket&&b&&b.visible?{x:b.position.x,y:b.position.y+.1,z:b.position.z}:{x:lastP.x,y:lastP.y+1.05,z:lastP.z};
   fx.arc((x,y,z)=>flyer.position.set(x,y,z),{x:s.x,y:s.y,z:s.z},to,.15,.3,land);});}
 /** Drop in crate: the basket tips forward and the produce tumbles into the garden crate. */
 function tipIntoCrate(def:JobDef){const d=def.deliver,b=gear.basket;jobCue('bag');tapHaptic();if(!d)return;const to={x:d.x,y:floor(d.x,d.z)+.65,z:d.z};
  const col=goodById(gear.basketGoods[gear.basketGoods.length-1]??'')?.color??'#e0413f';
  if(reducedMotion||!b||!b.visible){gear.basketGoods=[];paintBasket();jobCue('thud');if(b&&!run)b.visible=false;return;}
  fx.tween(.6,k=>{gear.basketTilt=Math.sin(Math.min(1,k*1.4)*Math.PI)*1.1;},()=>{gear.basketTilt=0;});
  fx.tween(.25,()=>{},()=>{const from={x:b.position.x,y:b.position.y+.1,z:b.position.z};(flyer.material as T.MeshStandardMaterial).color.set(col);flyer.visible=true;gear.basketGoods=[];paintBasket();
   fx.arc((x,y,z)=>flyer.position.set(x,y,z),from,to,.35,.3,()=>{flyer.visible=false;jobCue('thud');fx.burst(to.x,to.y,to.z,col,5,1,1.2,false,.8);
    // The shift is over once the crate is filled: the empty basket is set down (hidden) rather than carried off.
    if(!run&&gear.basket===b)b.visible=false;});});}
 function applyEvents(ev:JobEvent[]){
  if(!run||!ev.length)return;const def=run.def;
  if(eventListeners.size)for(const e of ev)eventListeners.forEach(f=>f(e,def));
  for(const e of ev){
   if(def.kind==='garden'){
    if(e.type==='pluck'&&e.index!==undefined){const s=GARDEN_SPOTS[e.index];if(!garden)garden=readGarden();saveGarden(markPicked(garden,s,now()));flyFruit(e.index,true);jobCue(isTreeSpot(s)?'pop':'pick');tapHaptic();cue('fi2-path-cue','path-pop');}
    if(e.type==='unripe'||e.type==='wrong')jobCue('nope');
    if(e.type==='deliver')tipIntoCrate(def);
    if(e.type==='phase')cue('fi2-path-cue','dock');continue;}
   if(def.kind==='harvest'){
    if(e.type==='deliver'){unloadBag(def);continue;}
    gear.harvest?.onEvent(e,run,lastP,reducedMotion);
    if(e.type==='shake'||e.type==='tug'||e.type==='twist'||e.type==='snip'||e.type==='cut'||e.type==='pop')tapHaptic();
    if(e.type==='gather'||e.type==='twist'||e.type==='cut')gear.bagCount++;
    if(e.type==='phase')cue('fi2-path-cue','dock');continue;}
   if(def.kind==='sort'){
    const shirts=task.shirts,crates=def.task?.type==='sort'&&def.task.style==='crates';
    if(e.type==='pickup'&&def.deliver){gear.lift={t:0,from:{x:def.deliver.x,y:floor(def.deliver.x,def.deliver.z)+.9,z:def.deliver.z}};jobCue('pick');tapHaptic();}
    if(e.type==='return'&&e.index!==undefined&&shirts){const shirt=shirts[run.step-1],t=def.targets[e.index],i=e.index;if(shirt){shirt.visible=true;
      const place={x:t.x+(crates?(run.step-1)%2*.25-.12:0),y:floor(t.x,t.z)+(crates?.95:1.45),z:t.z+(crates?.1:.06)};
      const settle=()=>{shirt.position.set(place.x,place.y,place.z);shirt.rotation.set(crates?-.5:0,0,0);};
      if(reducedMotion)settle();else fx.arc((x,y,z)=>shirt.position.set(x,y,z),{x:shirt.position.x,y:shirt.position.y,z:shirt.position.z},place,.5,.35,settle);}
     lidWobble(i,true);pulse(t.x,floor(t.x,t.z)+.05,t.z,'#6fd08c');jobCue('place');tapHaptic();}
    if(e.type==='wrong'&&e.index!==undefined){const t=def.targets[e.index];lidWobble(e.index,false);pulse(t.x,floor(t.x,t.z)+.05,t.z,'#e0613f');jobCue('nope');}
    if(e.type==='pickup'||e.type==='return'||e.type==='wrong')cue('fi2-path-cue','path-pop');continue;
   }
   if(e.type==='hold'){tapHaptic();jobCue(def.prop==='chalk'?'paint':'swish');}
   if(e.type==='work'&&e.index!==undefined){tapHaptic();if(def.prop==='peg')hammerHit(def,e.index,e.value??1);}
   if(e.type==='step'&&def.prop==='leaf'&&e.stage===0){jobCue('rustle');tapHaptic();}
   if((e.type==='collect'||e.type==='pickup')&&targetsMesh&&e.index!==undefined){const i=e.index;
    if(def.prop==='chalk'){targetsMesh.setColorAt(i,new T.Color('#ffffff'));if(targetsMesh.instanceColor)targetsMesh.instanceColor.needsUpdate=true;}
    else if(def.prop==='cone')dropCone(def,i);
    else if(def.prop==='peg'){targetsMesh.setMatrixAt(i,hidden);targetsMesh.instanceMatrix.needsUpdate=true;const t=def.targets[i];pulse(t.x,floor(t.x,t.z)+.05,t.z,'#ffd36c');}
    else if(def.kind==='carry'){targetsMesh.setMatrixAt(i,hidden);targetsMesh.instanceMatrix.needsUpdate=true;const t=def.targets[i];gear.lift={t:0,from:{x:t.x,y:floor(t.x,t.z)+.22,z:t.z}};jobCue('pick');tapHaptic();}
    else if(def.prop==='leaf'||def.prop==='bottle'){intoBag(def,i);tapHaptic();}
    else{targetsMesh.setMatrixAt(i,hidden);targetsMesh.instanceMatrix.needsUpdate=true;}
    if(placedMesh&&def.prop!=='cone'&&def.prop!=='peg'){const t=def.targets[i];placedMesh.setMatrixAt(i,m4(t.x,floor(t.x,t.z)+.25,t.z));placedMesh.instanceMatrix.needsUpdate=true;}
    cue('fi2-path-cue','path-pop');
   }
   if(e.type==='return'&&def.kind==='carry'&&e.index!==undefined){boxBall(def,e.index);tapHaptic();}
   if(e.type==='deliver')unloadBag(def);
   if(e.type==='pass'){const w=lastWallTarget??{x:REBOUND_WALL.target.x,z:REBOUND_WALL.z};pulse(w.x,1,REBOUND_WALL.face+.05,'#ffffff',true,.8);jobCue('thunk');}
   if(e.type==='shot'&&gear.flash){const f=gear.flash,mat=f.material as T.MeshBasicMaterial;f.visible=true;fx.tween(.55,k=>{mat.opacity=.85*(1-k);},()=>{f.visible=false;});pulse(REBOUND_WALL.target.x,(REBOUND_WALL.target.top+REBOUND_WALL.target.bottom)/2,REBOUND_WALL.face+.05,'#ffd36c',true,1.6);jobCue('ding');tapHaptic();}
   if(e.type==='call'){const spot=def.targets[0],flagUp=e.value===1,flag=task.flag;
    if(flag&&flagUp&&!reducedMotion){fx.tween(.3,k=>{flag.rotation.z=1.2*(1-ease.out(k));});}
    if(flagUp)jobCue('whistle');pulse(spot.x,floor(spot.x,spot.z)+.05,spot.z,run.right?'#6fd08c':'#e0613f',false,1.3);jobCue(run.right?'ding':'nope');tapHaptic();}
   if(def.kind==='pump'&&def.task?.type==='pump'){const t=def.task,h=gear.handle;
    // Oct 1 2026: many rapid strokes. One handle tween at most (a new stroke restarts it from the fixed rest height, so fast taps
    // never stack tweens or let the handle creep down); crossing into too-hard hisses once.
    if(e.type==='pump'){const b=pumpBall(run);tapHaptic();jobCue(b&&(e.value??0)>b.max?'squeak':'pump');if(e.stage===1)jobCue('hiss');
     if(h&&!reducedMotion){const rest=floor(def.targets[0].x,def.targets[0].z)+.72;if(handleStroke&&handleStroke.t<handleStroke.dur)handleStroke.t=0;
      else handleStroke=fx.tween(.22,k=>{h.position.y=rest-Math.sin(k*Math.PI)*.22;},()=>{h.position.y=rest;handleStroke=null;});}}
    if(e.type==='release'){jobCue('hiss');const s=def.targets[0];if(!reducedMotion)fx.burst(s.x-.7,floor(s.x,s.z)+.35,s.z-1,'#e9f2f7',5,1.1,1.1,true,.6);}
    if(e.type==='wrong')jobCue('nope');
    if(e.type==='return'){const s=def.targets[0];pulse(s.x-.7,floor(s.x,s.z)+.05,s.z-1,'#6fd08c');jobCue('ding');}}
   if(e.type==='return'||e.type==='pass'||e.type==='shot'||e.type==='call')cue('fi2-path-cue','path-pop');
   if(e.type==='phase')cue('fi2-path-cue','dock');
  }
  if(def.kind==='offside'&&run.phase!=='work'&&!refCam.active)refCam.begin(refShot);
  if(def.kind==='pump')paintPump(def);
  if(ev.some(e=>e.type==='done')){const seconds=run.seconds,id=def.id,bag=run.harvest?[...run.harvest.bag]:run.garden?[...run.garden.bag]:undefined;endingRun=run;run=null;refCam.end();if(carried)carried.visible=false;if(reducedMotion&&gear.basket)gear.basket.visible=false;if(def.kind==='garden'&&inGarden)paintGarden();
   // Let the last throw / toss / wobble finish (at most ~1.2 s), then dispose the props (update → clearProps).
   ending=1.2;if(beacon)beacon.visible=false;setView({active:null,done:{id,seconds:Math.round(seconds*10)/10,nonce:++doneNonce,...(bag?{bag}:{})}});return;}
  publishActive();
 }
 let activeKey='',handleStroke:Tween|null=null;
 /** The pump gauge: this ball's green zone, the pressure (2 decimals) and the strokes still to go. */
 function pumpGauge(r:JobRun){const b=pumpBall(r)!,v=pumpShown(r.pressure),left=pumpTapsLeft(r),n=r.def.task?.type==='pump'?r.def.task.balls.length:5;
  return {value:v,min:b.min,max:b.max,label:`Ball ${r.step+1}/${n} · ${v.toFixed(2)} atm · green ${b.min.toFixed(2)}–${b.max.toFixed(2)}${left?` · ~${left} to go`:v>b.max?' · too hard':''}`};}
 function publishActive(){if(!run){setView({active:null});return;}const p=runProgress(run),t=run.def.task,h=run.harvest;
  const next:JobView['active']={id:run.def.id,value:p.value,total:p.total,phase:run.phase,carrying:run.carrying>=0,hint:banner||runHint(run),actions:runActions(run),
   gauge:t?.type==='pump'&&run.phase==='pump'?pumpGauge(run):h&&h.pulling>=0?{value:Math.round(h.pull*100)/100,min:HARVEST.green[0],max:HARVEST.green[1],label:'Pull strength · let go in the green'}:null,right:run.right,buttons:jobButtons(run)};
  // Only here (on a frame-key change, an event or a note), never per frame: an unchanged panel keeps the same object.
  const key=JSON.stringify(next);if(view.active&&key===activeKey)return;activeKey=key;setView({active:next});}
 /** A HUD button for task jobs and work steps (hold steps send `id` then `id:up`). */
 function act(id:string){if(!run)return;applyEvents(runAction(run,id));if(run?.def.kind==='offside')paintOffside();}

 // ---- Garden ----
 const readGarden=():GardenState=>{let raw:unknown=null;try{raw=JSON.parse(store?.getItem(GARDEN_STORAGE_KEY)??'null');}catch{}return sanitizeGarden(raw,now());};
 let garden:GardenState|null=null;
 const saveGarden=(g:GardenState)=>{garden=g;try{store?.setItem(GARDEN_STORAGE_KEY,JSON.stringify(g));}catch{}};
 const fruitGeometry=keep(new T.IcosahedronGeometry(.17,1)),fruitMaterial=keep(new T.MeshStandardMaterial({color:'#ffffff',roughness:.55,emissive:'#3a2a10',emissiveIntensity:.25}));
 const fruit=new T.InstancedMesh(fruitGeometry,fruitMaterial,GARDEN_SPOTS.length);fruit.name='garden-produce';fruit.visible=false;fruit.frustumCulled=false;root.add(fruit);
 // One flying item for picks (shift and free): the garden's shared fruit geometry, hidden when idle (no draw).
 const flyer=new T.Mesh(fruitGeometry,keep(new T.MeshStandardMaterial({color:'#e0413f',roughness:.55})));flyer.name='garden-pick-flyer';flyer.visible=false;flyer.frustumCulled=false;root.add(flyer);
 let gardenRefresh=0,inGarden=false,visitPicked=false,pickWait=0,lookedAt='';
 const gardenDef=jobById('garden-shift');
 /** A free pick (no shift) tells the character side too, so the same crouch / reach / head-shake poses play (jobMoves.ts). */
 const freeEvent=(e:JobEvent)=>{if(gardenDef&&!run)eventListeners.forEach(f=>f({...e,free:true},gardenDef));};
 function paintGarden(){if(!garden)garden=readGarden();const t=now(),c=new T.Color(),shift=run?.garden??null;
  // During a Garden shift the shift's own ripeness shows (spots made ripe so the shift can always be finished look ripe).
  GARDEN_SPOTS.forEach((s,i)=>{const picked=!!garden!.picked[s.id],ripe=shift?shift.ripe[i]&&!shift.picked[i]:isRipe(s,garden!,t),scale=ripe?1:picked?.4:.65;
   fruit.setMatrixAt(i,m4(s.x,s.y,s.z,0,scale,scale,scale));c.set(ripe?goodById(s.good)?.color??'#e0413f':'#7fae4f');fruit.setColorAt(i,c);});
  fruit.instanceMatrix.needsUpdate=true;if(fruit.instanceColor)fruit.instanceColor.needsUpdate=true;}
 function updateGarden(p:{x:number;y:number;z:number}){
  const d=Math.hypot(p.x-GARDEN_CENTRE.x,p.z-GARDEN_CENTRE.z),inside=d<GARDEN_RANGE;
  if(inside!==inGarden){inGarden=inside;fruit.visible=inside;visitPicked=false;if(inside){garden=readGarden();paintGarden();gardenRefresh=0;}else setView({garden:''});}
  if(!inside)return;
  gardenRefresh+=.1;if(gardenRefresh>=5){gardenRefresh=0;paintGarden();}
  if(p.y>1.6){setView({garden:''});return;}
  // A Garden shift picks with its own Pick button and panel: no free picking (and no double pay) while it runs.
  if(run?.garden){setView({garden:''});return;}
  pickWait=Math.max(0,pickWait-.1);
  // Free picking (kept, §13): walk up to ripe produce and it goes into your market basket, one item per pick pose.
  const t=now();let hint=Math.hypot(p.x-GARDEN_CENTRE.x,p.z-GARDEN_CENTRE.z)<32&&!visitPicked?'Community Garden: walk up to ripe produce to pick it, then sell it at the farmers market. For coins, start a Garden shift at the sign by the gate.':'',looking='';
  for(let i=0;i<GARDEN_SPOTS.length;i++){const s=GARDEN_SPOTS[i],dist=Math.hypot(p.x-s.x,p.z-s.z);if(dist>s.reach)continue;
   if(!isRipe(s,garden!,t)){hint=`Not ripe yet — this ${goodById(s.good)?.name.toLowerCase()} needs about ${minutesLeft(s,garden!,t)} more minute${minutesLeft(s,garden!,t)===1?'':'s'}.`;
    // A look and a gentle shake of the head, once each time you walk up to a green one.
    if(!looking){looking=s.id;if(lookedAt!==s.id&&!pickWait){lookedAt=s.id;pickWait=.9;freeEvent({type:'unripe',index:i,x:s.x,z:s.z,value:isTreeSpot(s)?1:0});}}continue;}
   if(pickWait>0)continue;
   const added=(options.gather??islandMarket.gather)(s.good);
   if(!added){hint='Your basket is full! Sell your produce to Rosa at the farmers market stand.';continue;}
   const next=pickSpot(garden!,s,t);if(next){saveGarden(next);visitPicked=true;pickWait=reducedMotion?.5:.8;cue('fi2-path-cue','path-pop');setView({pick:{good:s.good,nonce:++pickNonce}});
    if(gardenDef&&!run&&eventListeners.size){flyFruit(i,false);freeEvent({type:'pluck',index:i,good:s.good,x:s.x,z:s.z,value:isTreeSpot(s)?1:0});}else paintGarden();}
  }
  if(!looking)lookedAt='';
  setView({garden:hint});
 }

 // ---- Frame update ----
 let slow=0,sceneryShown=true;
 function update(dt:number,p:{x:number;y:number;z:number},ball:BallState|null,active:boolean,visible:boolean,reduced:boolean){
  if(visible!==sceneryShown){sceneryShown=visible;root.visible=visible;}
  if(!active){return;}
  lastP={x:p.x,y:p.y,z:p.z};reducedMotion=reduced;
  if(fx.busy)fx.update(dt);
  // A finished job keeps its props for its last animation (≤ 1.2 s), then disposes them.
  if(!run&&ending>0){ending-=dt;if(ending<=0||!fx.busy)clearProps();}
  // Leaving the job's area ends the shift (Sep 30 2026: the Harvest day panel followed the player to the main island). The
  // area is the sign, every target and the drop-off, plus a 45 m margin; horizontal distance only (flying over still counts).
  if(run&&outsideJobArea(run.def,p.x,p.z)){quit();return;}
  if(run){
   applyEvents(stepRun(run,p,dt,floor));
   if(run&&run.def.kind==='rebound'&&ball){if(ball.wallPhase==='receive'&&lastWallPhase!=='receive'&&ball.mode==='wall-juggle'&&onReboundWall(ball.wallTarget)){lastWallTarget=ball.wallTarget;applyEvents(reboundEvent(run,'pass'));}lastWallPhase=ball.mode==='wall-juggle'?ball.wallPhase:'';if(ball.mode!=='shot')shotCounted=false;
    // Target shots count only when struck from the glowing circle; each finished attempt from it moves the circle.
    const shooting=ball.mode==='windup'||ball.mode==='shot';if(shooting&&!lastShooting)reboundShotStart(run,p.x,p.z);else if(!shooting&&lastShooting)reboundShotEnd(run);lastShooting=shooting;}
   if(run&&beacon){const goal=runGoals(run).reduce<{x:number;z:number}|null>((best,g)=>!best||Math.hypot(g.x-p.x,g.z-p.z)<Math.hypot(best.x-p.x,best.z-p.z)?g:best,null);
    // Wall rebounds' shooting circle is the beacon's own ring, sized to the circle (one mesh, moved; the arrow hides once inside).
    const spotRing=run.def.kind==='rebound'&&run.phase==='shots',inside=!!goal&&Math.hypot(p.x-goal.x,p.z-goal.z)<(spotRing?REBOUND_WALL.spot.radius:2);
    beacon.visible=!!goal&&(spotRing||!(run.def.kind==='rebound'&&inside));arrowOn=!!goal;if(goal){arrowGoal.x=goal.x;arrowGoal.z=goal.z;time+=dt;beacon.position.set(goal.x,floor(goal.x,goal.z),goal.z);const arrow=beacon.getObjectByName('arrow')!;arrow.visible=!(spotRing&&inside);arrow.position.y=2.2+(reduced?0:Math.sin(time*3)*.18);
     const ring=beacon.getObjectByName('beacon-ring');if(ring){const s=spotRing?REBOUND_WALL.spot.radius:1;if(ring.scale.x!==s)ring.scale.set(s,s,1);}}}
   if(run&&run.def.kind==='sort'&&task.shirts){const shirt=task.shirts[run.step];if(shirt&&run.carrying>=0){shirt.visible=true;const k=liftK(dt),f=gear.lift?.from;
    if(f&&k<1)shirt.position.set(f.x+(p.x-f.x)*k,f.y+(p.y+2.35-f.y)*ease.out(k),f.z+(p.z-f.z)*k);else shirt.position.set(p.x,p.y+2.35,p.z);}}
   if(run&&run.def.kind==='offside')paintOffside();
   if(run&&carried){carried.visible=run.carrying>=0;if(carried.visible){const k=liftK(dt),f=gear.lift?.from;
    if(f&&k<1)carried.position.set(f.x+(p.x-f.x)*k,f.y+(p.y+1.35-f.y)*ease.out(k),f.z+(p.z-f.z)*k);else carried.position.set(p.x,p.y+1.35,p.z);}}
   if(run)updateGear(run,p,dt,reduced);
   if(banner){bannerAge+=dt;if(bannerAge>4){banner='';viewKey='';}}
   if(run&&frameKeyChanged(run))publishActive();
  }
  // Sign glow (bug A8): eased every frame while on or fading, like the buildings and vending machines; the board tick only
  // decides which sign. Idle cost: nothing once the fade is over.
  if(glowOn||glowFade>0){signGlow.update(glowOn&&visible,dt,reduced);if(!glowOn)glowFade-=dt;}
  slow+=dt;if(slow<.1)return;const tick=slow;slow=0;
  updateGarden(p);
  boardTimer+=tick;if(boardTimer<.25)return;boardTimer=0;refreshBadges();
  let near:JobDef|null=null,best=BOARD_RANGE;
  for(const job of JOBS){const d=Math.hypot(p.x-job.board.x,p.z-job.board.z);if(d<best&&Math.abs(p.y-floor(job.board.x,job.board.z))<2){best=d;near=job;}}
  // While a job runs no other sign offers (bug A2: G or Start job used to swap the running job away); `other` lets G explain.
  const offered=!run&&near?near:null,other=run&&near&&near.id!==run.def.id?near.id:null;
  offerRing.visible=!!offered;if(offered){offerRing.position.set(offered.board.x,floor(offered.board.x,offered.board.z)+.03,offered.board.z);}
  if(offered){glowRoot.position.set(offered.board.x,floor(offered.board.x,offered.board.z),offered.board.z);glowRoot.rotation.y=offered.board.yaw;glowRoot.updateMatrixWorld(true);}
  if(glowOn&&!offered)glowFade=GLOW_FADE;glowOn=!!offered;
  const stand=!run&&!offered&&Math.hypot(p.x-FARM_STAND_SELL.x,p.z-FARM_STAND_SELL.z)<FARM_STAND_SELL.reach&&Math.abs(p.y-floor(FARM_STAND_SELL.x,FARM_STAND_SELL.z))<1.2;
  setView({near:offered?.id??null,other,stand});
 }
 let glowOn=false,glowFade=0;const GLOW_FADE=.8;
 let lastShooting=false,boardTimer=0,lastWallPhase='',shotCounted=false,lastContact:{x:number;y:number;z:number}|null=null,lastWallTarget:{x:number;z:number}|null=null,viewKey='';
 // Heat audit #8: the per-frame panel key was a template string built every frame while a job ran. The same inputs are now compared
 // one by one against the last frame's (no string, no array); `viewKey=''` (a note, a new job) still forces a publish.
 const keyVals:(number|string|boolean|null|undefined)[]=new Array(16).fill(undefined);
 function frameKeyChanged(r:JobRun){const h=r.harvest,g=r.garden;let changed=viewKey==='';viewKey='*';
  const set=(i:number,v:number|string|boolean|null|undefined)=>{if(keyVals[i]!==v){keyVals[i]=v;changed=true;}};
  set(0,r.at);set(1,r.holding);set(2,r.note);set(3,r.def.kind==='collect'&&r.at>=0?Math.round(r.work[r.at]*20):null);
  if(h){set(4,h.near);set(5,h.pulling);set(6,Math.round(h.pull*40));set(7,h.ground.length);set(8,harvestPickableCount(r));set(9,h.snips);}
  else for(let i=4;i<=9;i++)set(i,null);
  set(10,g?g.near:null);set(11,g?g.fruit+g.veg:null);set(12,r.carrying);set(13,r.phase);set(14,r.def.id);
  // Pump: the leak moves the needle between strokes (0.02 atm steps: a few panel updates a second at most, none while idle at the start).
  set(15,r.phase==='pump'?Math.round(r.pressure*50):null);return changed;}
 /** harvestPickable(run).length without the filtered array (same test as jobRules.harvestPickable). */
 function harvestPickableCount(r:JobRun){const h=r.harvest;if(!h||r.phase!=='work')return 0;let n=0;for(const g of h.ground)if(g.age>=HARVEST.pickupDelay&&Math.hypot(r.px-g.x,r.pz-g.z)<=HARVEST.pickupButtonReach)n++;return n;}
 /** Lift progress (0–1) of a just-picked-up item (ball, snack card) rising into the player's hands. */
 function liftK(dt:number){const l=gear.lift;if(!l)return 1;l.t+=dt;const k=reducedMotion?1:Math.min(1,l.t/.3);if(k>=1)gear.lift=null;return k;}
 /** Per frame while a job runs: what the player carries follows them, and the held actions animate (rake swirl, line paint). */
 function updateGear(r:JobRun,p:{x:number;y:number;z:number},dt:number,reduced:boolean){
  const def=r.def;
  if(gear.bag&&!gear.tossing){const on=gear.bagCount>0;gear.bag.visible=on;if(on){const s=.7+Math.min(gear.bagCount,10)*.05;gear.bag.position.set(p.x-.38,p.y+.85,p.z+.05);gear.bag.scale.set(s,s*(def.kind==='harvest'?1:1.1),s);gear.bag.rotation.set(0,0,0);}}
  if(gear.stack){const left=def.targets.length-r.got.filter(Boolean).length;for(let i=0;i<def.targets.length;i++)gear.stack.setMatrixAt(i,i<left?m4(p.x+.4,p.y+.75+i*.07,p.z+.1):hidden);gear.stack.instanceMatrix.needsUpdate=true;}
  if(def.prop==='leaf'&&targetsMesh&&r.at>=0&&r.stage[r.at]===0){const i=r.at,t=def.targets[i];
   if(r.holding){gear.pileYaw[i]+=dt*(reduced?0:7);gear.pile[i]=1-.4*Math.min(1,r.work[i]);gear.swirl+=dt;
    if(gear.swirl>.22&&!reduced){gear.swirl=0;fx.burst(t.x,floor(t.x,t.z)+.25,t.z,['#c26a2e','#d9912f','#9b4b22'][Math.floor(Math.random()*3)],2,1.3,1.2,true,1.5);}
    if(gear.swirl>.45)gear.swirl=0;}
   const sc=gear.pile[i];targetsMesh.setMatrixAt(i,m4(t.x,floor(t.x,t.z)+.14*(2-sc),t.z,gear.pileYaw[i],sc,.3*(2.2-sc*1.2),sc));targetsMesh.instanceMatrix.needsUpdate=true;}
  if(gear.marker){const on=r.phase==='work';gear.marker.visible=on;if(on){gear.marker.position.set(p.x+.5,floor(p.x,p.z),p.z);const along=Math.atan2(p.z-100,p.x-135)+Math.PI/2;gear.marker.rotation.y=-along;
    const wheel=gear.marker.children[1] as T.Mesh;(wheel.material as T.MeshStandardMaterial).color.set(r.holding?'#ffffff':'#8f9c86');
    if(r.holding&&gear.trail&&trailOffset(r,p.x,p.z)<=.9){const last=gear.trailLast;if(!last||Math.hypot(p.x-last.x,p.z-last.z)>=.3){gear.trailLast={x:p.x,z:p.z};
     if(gear.trailN<TRAIL_MAX){const yaw=last?Math.atan2(p.x-last.x,p.z-last.z):along;gear.trail.setMatrixAt(gear.trailN,m4(p.x,floor(p.x,p.z)+.012,p.z,yaw,1,1,1,-Math.PI/2));gear.trailN++;gear.trail.count=gear.trailN;gear.trail.instanceMatrix.needsUpdate=true;}}}
    else if(!r.holding)gear.trailLast=null;}}
  gear.harvest?.update(dt,r,reduced);
 }
 /** Called from the island ball simulator when a kicked ball touches a wall or obstacle. */
 function ballContact(x:number,y:number,z:number,mode:string){
  if(!run||run.def.kind!=='rebound'||mode!=='shot'||shotCounted)return;
  lastContact={x:Math.round(x*10)/10,y:Math.round(y*10)/10,z:Math.round(z*10)/10};
  if(hitsReboundTarget(x,y,z,0)){shotCounted=true;applyEvents(reboundEvent(run,'shot'));}
 }
 function start(id:string){const def=jobById(id);if(!def)return false;
  // One job at a time (bug A2): starting another never silently ends the running one. Finish it or tap Stop job first.
  if(run)return false;quit();banner='';if(props)clearProps();
  // Garden shift: what is pickable this shift (ripe now, plus spots made ripe for the shift if too few are: never a dead end).
  let ripe:boolean[]|undefined;if(def.kind==='garden'){garden=readGarden();ripe=shiftRipeness(garden,now()).ripe;}
  run=startRun(def,1+Math.floor(now()%100000),ripe);if(def.kind==='garden'&&inGarden)paintGarden();viewKey='';lastShooting=false;lastWallPhase='';shotCounted=false;buildProps(def);refreshBadges();setView({done:null,near:null});offerRing.visible=false;publishActive();return true;}
 function quit(){refCam.end();if(!run){if(props&&ending>0)clearProps();return;}const wasGarden=!!run.garden;run=null;clearProps();refreshBadges();setView({active:null});if(wasGarden&&inGarden)paintGarden();}
 /** A short friendly line in the job panel (e.g. "Island jobs are on foot"): shown until the next note. */
 /** After the character is posed (Town.tsx): what the job has you carry sits in your hands. `l`/`r` = world hand points. */
 const hv=new T.Vector3(),hq=new T.Quaternion(),UP=new T.Vector3(0,1,0),DOWN=new T.Vector3(0,-1,0),NEGX=new T.Vector3(-1,0,0);
 function holdProps(l:{x:number;y:number;z:number},r:{x:number;y:number;z:number},yaw:number){
  const jr=run??(ending>0?endingRun:null);if(!jr||!props)return;const fx0=Math.sin(yaw),fz0=Math.cos(yaw),mx=(l.x+r.x)/2,my=(l.y+r.y)/2,mz=(l.z+r.z)/2,p=lastP,def=jr.def;
  const aim=(o:T.Object3D,from:T.Vector3,x:number,y:number,z:number)=>{hv.set(x-o.position.x,y-o.position.y,z-o.position.z);if(hv.lengthSq()<1e-6)return;o.quaternion.copy(hq.setFromUnitVectors(from,hv.normalize()));};
  if(carried&&carried.visible&&!gear.lift)carried.position.set(mx+fx0*.14,my+.04,mz+fz0*.14);
  if(def.kind==='sort'&&task.shirts&&jr.carrying>=0&&!gear.lift){const sh=task.shirts[jr.step];if(sh){sh.position.set(mx+fx0*.2,my+.12,mz+fz0*.2);sh.rotation.set(0,yaw,0);}}
  if(gear.stack){const left=def.targets.length-jr.got.filter(Boolean).length;for(let i=0;i<def.targets.length;i++)gear.stack.setMatrixAt(i,i<left?m4(l.x+fx0*.06,l.y+.02+i*.07,l.z+fz0*.06):hidden);gear.stack.instanceMatrix.needsUpdate=true;}
  if(gear.hammer&&def.prop==='peg'&&(run||gear.hammer.visible)){const h=gear.hammer;h.visible=true;h.position.set(r.x,r.y,r.z);aim(h,NEGX,r.x+(r.x-p.x)*.3,r.y+(r.y-(p.y+1.35))*1.2,r.z+(r.z-p.z)*.3);}
  if(gear.rake){const g=gear.rake;g.visible=jr.phase==='work';g.position.set(mx,my,mz);aim(g,DOWN,p.x+fx0*1.25,floor(p.x,p.z)+.05,p.z+fz0*1.25);}
  if(gear.handFlag){const g=gear.handFlag;g.visible=true;g.position.set(r.x,r.y,r.z);aim(g,UP,r.x+(r.x-p.x)*.4,r.y+(r.y-(p.y+1.3))*1.2,r.z+(r.z-p.z)*.4);}
  if(gear.basket&&(run||gear.basket.visible)){const b=gear.basket;b.visible=true;b.position.set(l.x,l.y-.23,l.z);b.rotation.set(gear.basketTilt,yaw,0);}
  if(gear.marker&&gear.marker.visible){gear.marker.position.set(p.x+fx0*.8,floor(p.x+fx0*.8,p.z+fz0*.8),p.z+fz0*.8);gear.marker.rotation.set(0,yaw-Math.PI/2,0);}
 }
 let banner='',bannerAge=0;
 /** Where the beacon points now (the nearest goal), for the off-screen edge arrow (Town.tsx); copied, no allocation per frame. */
 const arrowGoal={x:0,z:0};let arrowOn=false;
 function note(text:string){if(!run)return;banner=text;bannerAge=0;viewKey='';publishActive();}
 const api={root,start,quit,update,ballContact,act,note,holdProps,
  onEvent:(fn:(e:JobEvent,def:JobDef)=>void)=>{eventListeners.add(fn);return()=>{eventListeners.delete(fn);};},
  /** The run's target point by index (harvest spot or job target) and the drop-off, for the character's facing. */
  spot:(i:number)=>{const d=run?.def;if(!d)return null;const h=d.task?.type==='harvest'?d.task.spots[i]:d.targets[i];return h?{x:h.x,z:h.z}:null;},
  deliverPoint:()=>run?.def.deliver??null,
  /** Harvest day: the armed orchard tree (the Kick the tree target), or null. */
  armedTree:()=>{const h=run?.harvest,d=run?.def;if(!h||!d||d.task?.type!=='harvest'||run!.phase!=='work')return null;const s=d.task.spots[h.near];return s&&s.action==='shake'?{x:s.x,z:s.z,index:h.near}:null;},
  /** Call right after the follow camera is placed (like fishing.applyCamera): the assistant-referee view while flagging. */
  applyCamera:(camera:T.PerspectiveCamera,dt:number,reduced:boolean)=>{const r=refCam.apply(camera,dt,reduced);badges.update(camera,dt,reduced,sceneryShown,lastP);return r;},badges,getView:()=>view,subscribe:(fn:()=>void)=>{listeners.add(fn);return()=>{listeners.delete(fn);};},dismissDone:()=>setView({done:null}),get run(){return run;},
  /** A job runs, or the one that just ended is winding down (its last pose): Town keeps calling holdProps. */
  get holding(){return !!run||ending>0&&!!props;},
  /** Where the current step wants the player (the beacon's targets); read-only, for play-tests. */
  goals:()=>run?runGoals(run):[],
  /** The beacon's goal (Oct 1 2026: every job's "follow the arrow" also gets an edge arrow when it is off screen), or null. */
  get arrowGoal(){return run&&arrowOn&&beacon?.visible?arrowGoal:null;},get lastContact(){return lastContact;},catalog:JOBS,garden:GARDEN_SPOTS,
  dispose(){quit();badges.dispose();fx.dispose();root.removeFromParent();for(const d of disposables)d.dispose();fruit.dispose();if(current===api){current=null;registry.forEach(f=>f());}}};
 current=api;registry.forEach(f=>f());
 if(typeof window!=='undefined')(window as unknown as {__fi2Jobs?:unknown}).__fi2Jobs=api;
 return api;
}
