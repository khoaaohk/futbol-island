/**
 * Paper pop-up mechanics (original). Pages are rigid or curling leaves hinged on the spine (the z axis).
 * Cut-out plates are thin double-sided paper planes: printed art on the front, cream stock on the back.
 *
 * Mechanisms:
 *  - stand: a cut-out glued along a hinge line on a page, facing the reader. It stands as its spread opens and
 *    folds backward flat (never squashed) as the spread closes or the turning page comes down on it.
 *  - vfold: a two-panel backdrop glued across the gutter. Its panels are solved exactly from both page angles
 *    (a 90° paper corner), so the fold rises, leans and collapses like a real V-fold.
 *  - flat: a piece lying on the page that rotates about a spine-parallel hinge (drawbridge halves).
 *  - children: brad-jointed arms/legs, hinged flaps, slot sliders and lifts on any plate.
 */
import * as THREE from 'three';
import {paintPlate,paintSheet,type Kit,type PlateSpec,type PersonOpts,ARM_PIVOT_Y,JOINTS,personSpec,armSpec,legSpec,INK} from './popupPlates';

export const PAGE_W=5,PAGE_D=6.4,PRINT_PX=150,PERSON_SCALE=1.22;
const HALF_PI=Math.PI/2;
export const clamp01=(v:number)=>v<0?0:v>1?1:v;
export const smooth=(v:number)=>{v=clamp01(v);return v*v*(3-2*v);};
/** 0→1 between two narration times, eased. */
export const beat=(t:number,a:number,b:number)=>smooth((t-a)/Math.max(.001,b-a));
/** 0→1→0 pulse between a and b. */
export const pulse=(t:number,a:number,b:number)=>{const v=clamp01((t-a)/Math.max(.001,b-a));return Math.sin(v*Math.PI);};
/** Deterministic wave for gestures while a beat is active (freezes cleanly on pause/seek). */
export const wave=(t:number,a:number,b:number,hz=1.4)=>t<a||t>b?0:Math.sin((t-a)*hz*Math.PI*2)*Math.min(1,(t-a)*3,(b-t)*3);

/* ───────────── plate textures, shared materials ───────────── */
export type PlateRes={tex:THREE.CanvasTexture;mat:THREE.MeshLambertMaterial;w:number;h:number;pad:number;refs:number};
const BACK=new THREE.Color(INK.stock);
function paperMaterial(tex:THREE.Texture){
 const m=new THREE.MeshLambertMaterial({map:tex,side:THREE.DoubleSide,alphaTest:.5,transparent:false});
 m.alphaToCoverage=true;
 // The unprinted back of a cut-out is cream stock, not a mirrored print.
 m.onBeforeCompile=s=>{s.uniforms.backStock={value:BACK};s.fragmentShader='uniform vec3 backStock;\n'+s.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\nif(!gl_FrontFacing){diffuseColor.rgb=backStock*(0.93+0.07*diffuseColor.a);}');};
 m.customProgramCacheKey=()=>'book-paper-cutout';
 return m;
}
/** px: plate print density (pixels per world unit). Phones use less: the book is drawn smaller there, and painting
 * (per-pixel ink grain) is the main cost of building a spread. */
export function createPlateCache(px=PRINT_PX){
 const map=new Map<string,PlateRes>();
 const get=(spec:PlateSpec)=>{let r=map.get(spec.key);if(!r){const p=paintPlate({px,...spec});const tex=new THREE.CanvasTexture(p.canvas);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=4;tex.generateMipmaps=true;tex.minFilter=THREE.LinearMipmapLinearFilter;r={tex,mat:paperMaterial(tex),w:p.w,h:p.h,pad:p.pad,refs:0};map.set(spec.key,r);}r.refs++;return r;};
 const release=(key:string)=>{const r=map.get(key);if(!r)return;if(--r.refs<=0){r.mat.dispose();r.tex.dispose();(r.tex.image as HTMLCanvasElement).width=1;map.delete(key);}};
 const dispose=()=>{for(const r of map.values()){r.mat.dispose();r.tex.dispose();(r.tex.image as HTMLCanvasElement).width=1;}map.clear();};
 return {get,release,dispose,size:()=>map.size};
}
export type PlateCache=ReturnType<typeof createPlateCache>;
/** Plane whose origin is the art's anchor: 'bottom' (hinge line centre), 'bl'/'br' (V-fold crease), 'pivot' (brad at top). */
function plateMesh(r:PlateRes,anchor:'bottom'|'bl'|'br'|'pivot'|'center'|'top'){
 const W=r.w+r.pad*2,H=r.h+r.pad*2,g=new THREE.PlaneGeometry(W,H);
 const ox=anchor==='bl'?r.w/2:anchor==='br'?-r.w/2:0;
 const oy=anchor==='pivot'?-(r.h/2-ARM_PIVOT_Y):anchor==='center'?0:anchor==='top'?-r.h/2:r.h/2;
 g.translate(ox,oy,0);
 const m=new THREE.Mesh(g,r.mat);m.castShadow=true;m.receiveShadow=true;return m;
}

/* ───────────── surfaces (pages) ───────────── */
export type Surface={angle:(u:number)=>number;point:(u:number,out:THREE.Vector2)=>THREE.Vector2;lift:number};
export const RIGHT_FLAT:Surface={angle:()=>0,point:(u,o)=>o.set(u,0),lift:0};
export const LEFT_FLAT:Surface={angle:()=>Math.PI,point:(u,o)=>o.set(-u,0),lift:0};
export const rigidSurface=(tau:number,lift=0):Surface=>({angle:()=>tau,point:(u,o)=>o.set(Math.cos(tau)*u,Math.sin(tau)*u),lift});
/** A thin page turning over the spine: arc-length samples of a curling curve. */
export function leafSurface(tau:number,curl:number,lift=.012):Surface{
 const N=24,xs=new Float64Array(N+1),ys=new Float64Array(N+1),as=new Float64Array(N+1);const du=PAGE_W/N;
 const ang=(u:number)=>tau+curl*Math.pow(u/PAGE_W,1.6);
 for(let i=0;i<=N;i++){as[i]=ang(i*du);if(i){const a=(as[i]+as[i-1])/2;xs[i]=xs[i-1]+Math.cos(a)*du;ys[i]=ys[i-1]+Math.sin(a)*du;}}
 const at=(u:number,arr:Float64Array)=>{const f=Math.max(0,Math.min(N,u/du)),i=Math.min(N-1,Math.floor(f)),t=f-i;return arr[i]+(arr[i+1]-arr[i])*t;};
 return {angle:u=>at(u,as),point:(u,o)=>o.set(at(u,xs),at(u,ys)),lift};
}

/* ───────────── pieces ───────────── */
type Anim={x:number;z:number;s:number;lean:number;yaw:number;dx:number;dy:number;dz:number;rot:number;scale:number;visible:boolean};
export type Part={group:THREE.Group;rot:number;dx:number;dy:number;dz:number;flip:number;s:number;scale:number;visible:boolean;kind:'spin'|'flap';axis:'x'|'y'|'z'};
export type Piece=Anim&{spinG?:THREE.Group;side:'L'|'R';layer:number;height:number;kind:'stand'|'flat';hinge:number;anchor:THREE.Group;yawG:THREE.Group;hingeG:THREE.Group;content:THREE.Group;parts:Part[];
 arm:(spec:PlateSpec,x:number,y:number,o?:{z?:number;rot?:number})=>Part;
 flap:(spec:PlateSpec,x:number,y:number,o?:{z?:number;anchor?:'top'|'bottom'|'bl'|'br';axis?:'x'|'y'})=>Part;
 add:(spec:PlateSpec,x:number,y:number,o?:{z?:number;anchor?:'bottom'|'center'|'pivot'|'top'})=>Part;};
export type Person={body:Piece;armL:Part;armR:Part;leg?:Part;h:number};
export type VFold={zApex:number;alpha:number;left:THREE.Mesh;right:THREE.Mesh;group:THREE.Group;extra:{mesh:THREE.Object3D;side:'L'|'R';along:number;up:number;out:number}[];add:(spec:PlateSpec,side:'L'|'R',along:number,up:number,o?:{out?:number})=>Part};
export type Mark={kind:'tab'|'slot';x:number;z:number;x2?:number;z2?:number;w?:number};
export type Beat={t:number;duration:number;action:number;playing:boolean;narrated:boolean};
/** pose() may return a camera focus: -1 (left page) … 0 (whole spread) … 1 (right page); used on narrow screens. */
export type SpreadDef={id:string;/** narration time shown when Coach Bella is not narrating: the full scene just before its main action */rest:number;left:(k:Kit)=>void;right:(k:Kit)=>void;build:(b:Builder)=>(beat:Beat)=>number|void};
export type Builder=ReturnType<typeof builder>['B'];

function builder(cache:PlateCache,root:THREE.Group,keys:string[]){
 const pieces:Piece[]=[],vfolds:VFold[]=[],marks:Mark[]=[],parts:Part[]=[],faces:{armL:Part;armR:Part;joy:Part}[]=[];
 const res=(spec:PlateSpec)=>{keys.push(spec.key);return cache.get(spec);};
 const part=(parent:THREE.Object3D,spec:PlateSpec,x:number,y:number,anchor:'bottom'|'center'|'pivot'|'top'|'bl'|'br',z:number,kind:'spin'|'flap'):Part=>{
  const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);g.add(plateMesh(res(spec),anchor));
  const q:Part={group:g,rot:0,dx:0,dy:0,dz:0,flip:0,s:1,scale:1,visible:true,kind,axis:kind==='flap'?'x':'z'};g.userData.base=g.position.clone();parts.push(q);return q;};
 const piece=(spec:PlateSpec,x:number,z:number,o:{layer?:number;lean?:number;yaw?:number;tab?:boolean;s?:number;kind?:'stand'|'flat';hinge?:number;anchor?:'bottom'|'center'|'bl'|'br'}={}):Piece=>{
  const r=res(spec),anchor=new THREE.Group(),yawG=new THREE.Group(),hingeG=new THREE.Group(),content=new THREE.Group();
  root.add(anchor);anchor.add(yawG);yawG.add(hingeG);hingeG.add(content);
  // A rolling ball spins about its centre (so it never swings into the ground); everything else pivots on its base hinge.
  let spinG:THREE.Group|undefined;
  if(spec.roll&&(o.anchor??'bottom')==='bottom'){spinG=new THREE.Group();spinG.position.y=r.h/2;content.add(spinG);const m=plateMesh(r,'center');spinG.add(m);}
  else content.add(plateMesh(r,o.anchor??'bottom'));
  const p:Piece={spinG,side:x<0?'L':'R',layer:o.layer??2,height:r.h,kind:o.kind??'stand',hinge:o.hinge??0,anchor,yawG,hingeG,content,parts:[],
   x,z,s:o.s??1,lean:o.lean??0,yaw:o.yaw??0,dx:0,dy:0,dz:0,rot:0,scale:1,visible:true,
   arm:(sp,ax,ay,oo={})=>{const q=part(content,sp,ax,ay,'pivot',oo.z??.012,'spin');q.rot=oo.rot??0;p.parts.push(q);return q;},
   flap:(sp,ax,ay,oo={})=>{const q=part(content,sp,ax,ay,oo.anchor??'top',oo.z??.014,'flap');q.axis=oo.axis??'x';p.parts.push(q);return q;},
   add:(sp,ax,ay,oo={})=>{const q=part(content,sp,ax,ay,oo.anchor??'bottom',oo.z??.01,'spin');p.parts.push(q);return q;}};
  if(o.tab!==false&&(o.kind??'stand')==='stand')marks.push({kind:'tab',x,z,w:Math.min(r.w*.5,.6)});
  pieces.push(p);return p;
 };
 const B={
  stand:(spec:PlateSpec,x:number,z:number,o:Parameters<typeof piece>[3]={})=>piece(spec,x,z,o),
  /** A piece lying on the page, hinged along a spine-parallel edge (edge 'left' = its left edge is the hinge). */
  flat:(spec:PlateSpec,x:number,z:number,o:{hinge?:number;layer?:number;edge?:'left'|'right'}={})=>piece(spec,x,z,{...o,kind:'flat',tab:false,anchor:o.edge==='right'?'br':'bl'}),
  person:(key:string,x:number,z:number,h:number,o:PersonOpts&{layer?:number;holdL?:'suitcase'|'ball'|'glove'|'none';holdR?:'suitcase'|'ball'|'glove'|'none';yaw?:number}):Person=>{
   h*=PERSON_SCALE;const body=piece(personSpec(key,h,o),x,z,{layer:o.layer??3,yaw:o.yaw});
   const w=h*320/512,jx=(j:number[])=>(j[0]/320-.5)*w,jy=(j:number[])=>h*(1-j[1]/512);
   const armL=body.arm(armSpec(`${key}-armL`,h,{shirt:o.shirt,skin:o.skin,hold:o.holdL??'none',adult:o.adult}),jx(JOINTS.shoulderL),jy(JOINTS.shoulderL));
   const armR=body.arm(armSpec(`${key}-armR`,h,{shirt:o.shirt,skin:o.skin,hold:o.holdR??'none',adult:o.adult}),jx(JOINTS.shoulderR),jy(JOINTS.shoulderR));
   armL.rot=-.12;armR.rot=.12;
   let leg:Part|undefined;if(o.legs==='kick'){leg=body.arm(legSpec(`${key}-leg`,h,{shirt:o.shirt,skin:o.skin}),jx(JOINTS.hipR),jy(JOINTS.hipR),{z:-.006});}
   // Expression swap: a head-only plate with a grin, shown whenever the figure celebrates (both arms raised).
   if((o.face??'smile')!=='grin'){const joy=body.add(personSpec(`${key}-joy`,h,{...o,face:'grin',headOnly:true}),0,0,{z:.004});joy.visible=false;faces.push({armL,armR,joy});}
   return {body,armL,armR,leg,h};
  },
  /** Two-panel backdrop glued across the gutter with apex at z. alpha = angle of each glue line from the spine. */
  vfold:(specL:PlateSpec,specR:PlateSpec,zApex:number,alpha:number):VFold=>{
   const g=new THREE.Group();root.add(g);
   const left=plateMesh(res(specL),'br'),right=plateMesh(res(specR),'bl');left.matrixAutoUpdate=right.matrixAutoUpdate=false;g.add(left,right);
   const v:VFold={zApex,alpha,left,right,group:g,extra:[],add:(spec,side,along,up,oo={})=>{const q=part(side==='L'?left:right,spec,(side==='L'?-1:1)*along,up,'bottom',oo.out??.02,'spin');return q;}};
   vfolds.push(v);return v;
  },
  slot:(x:number,z:number,x2:number,z2:number)=>{marks.push({kind:'slot',x,z,x2,z2});},
  mark:(m:Mark)=>marks.push(m),
 };
 return {B,pieces,vfolds,marks,parts,faces};
}

/* ───────────── a built spread ───────────── */
export type Spread={id:string;rest:number;group:THREE.Group;leftTex:THREE.CanvasTexture;rightTex:THREE.CanvasTexture;pose:(b:Beat)=>number|void;
 place:(left:{surface:Surface;back:boolean},right:{surface:Surface;back:boolean},open:number)=>void;dispose:()=>void;pieceCount:number};
const tmp=new THREE.Vector2(),tmp2=new THREE.Vector2();
function vfoldPanels(v:VFold,rhoL:number,rhoR:number){
 // Solve in the symmetric frame (pages at ±ψ above the bisector plane), then rotate about the spine.
 const theta=Math.max(1e-4,rhoL-rhoR),psi=(Math.PI-theta)/2,m=(rhoL+rhoR)/2-HALF_PI;
 const sa=Math.sin(v.alpha),ca=Math.cos(v.alpha);
 const A=sa*Math.sin(psi),Bv=ca,phi0=Math.atan2(A,Bv),beta=phi0+HALF_PI;
 const c=new THREE.Vector3(0,Math.sin(beta),Math.cos(beta));
 const rot=new THREE.Matrix4().makeRotationZ(m),apex=new THREE.Vector3(0,0,v.zApex);
 for(const side of ['L','R'] as const){
  const sx=side==='R'?1:-1;const d=new THREE.Vector3(sx*sa*Math.cos(psi),sa*Math.sin(psi),ca);
  const e1=side==='R'?d.clone():d.clone().multiplyScalar(-1),e2=c.clone(),e3=new THREE.Vector3().crossVectors(e1,e2).normalize();
  const mesh=side==='R'?v.right:v.left;
  mesh.matrix.makeBasis(e1,e2,e3).setPosition(apex);mesh.matrix.premultiply(rot);
  mesh.matrixWorldNeedsUpdate=true;
 }
}
export function buildSpread(def:SpreadDef,cache:PlateCache,sheetPx=120):Spread{
 const group=new THREE.Group(),keys:string[]=[];group.name='spread-'+def.id;
 const {B,pieces,vfolds,marks,parts,faces}=builder(cache,group,keys);
 const pose=def.build(B);
 const paintPage=(side:'L'|'R',paint:(k:Kit)=>void)=>paintSheet(PAGE_W,PAGE_D,sheetPx,k=>{
  // World coordinates: left page x∈[-W,0], right x∈[0,W]; y = z + D/2.
  k.at(side==='L'?PAGE_W:0,0,1,()=>{paint(k);
   for(const m of marks){const inside=side==='L'?m.x<=0:m.x>=0;if(!inside)continue;
    const mz=m.z+PAGE_D/2;
    if(m.kind==='tab'){const w=m.w??.4;k.fill(`M${m.x-w/2} ${mz-.06} L${m.x+w/2} ${mz-.06} L${m.x+w/2+.05} ${mz+.05} L${m.x-w/2-.05} ${mz+.05} Z`,'#e6d7b3');k.key(`M${m.x-w/2} ${mz-.06} L${m.x+w/2} ${mz-.06}`,.012,'#8f7c58');k.key(`M${m.x-w/2-.05} ${mz+.05} L${m.x+w/2+.05} ${mz+.05}`,.008,'#b8a57f');}
    else{const x2=m.x2??m.x,z2=(m.z2??m.z)+PAGE_D/2;k.key(`M${m.x} ${mz} L${x2} ${z2}`,.07,'#3f3424');k.key(`M${m.x} ${mz} L${x2} ${z2}`,.035,'#15100a');}}
   // Printer's marks, fold crease and deckle shading make the page a physical sheet.
   const gx=side==='L'?-.18:.18;k.dots(`M0 0 L${gx*2} 0 L${gx*2} ${PAGE_D} L0 ${PAGE_D} Z`,'#7c6a48',.045,x=>.5-Math.abs(x)*1.2);
   const ex=side==='L'?-PAGE_W:PAGE_W;k.dots(`M${ex} 0 L${ex-(side==='L'?-.12:.12)} 0 L${ex-(side==='L'?-.12:.12)} ${PAGE_D} L${ex} ${PAGE_D} Z`,'#8d7a55',.04,.28);
  },side==='L'?false:false);
 });
 const leftTex=new THREE.CanvasTexture(paintPage('L',def.left)),rightTex=new THREE.CanvasTexture(paintPage('R',def.right));
 for(const t of [leftTex,rightTex]){t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;}
 const orderFor=(layer:number)=>[.42+layer*.085,.78+layer*.055] as const;
 const place:Spread['place']=(L,R,open)=>{
  const rhoL=L.surface.angle(0)+(L.back?0:0),rhoR=R.surface.angle(0);
  const theta=rhoL-rhoR;
  for(const p of pieces){
   const S=p.side==='L'?L:R,u=Math.abs(p.x);S.surface.point(u,tmp);const tau=S.surface.angle(u);
   const back=p.side==='L';const frame=back?tau-Math.PI:tau;
   // Lift the piece off the paper slightly along the page normal so it never z-fights.
   const n=back?-1:1;p.anchor.position.set(tmp.x-Math.sin(tau)*(S.surface.lift)*n,tmp.y+Math.cos(tau)*(S.surface.lift)*n,p.z);p.anchor.rotation.set(0,0,frame);p.anchor.visible=p.visible&&p.s>.015;
   p.yawG.rotation.set(0,p.yaw,0);
   const [lo,hi]=orderFor(p.layer),so=smooth((open-lo)/(hi-lo));
   let s=so*p.s;
   // The closing page presses tall pieces flat before it can touch them.
   const wedge=Math.max(.001,theta);if(wedge<HALF_PI*.98&&p.kind==='stand'){const room=Math.max(0,u*Math.tan(wedge)-.05)/Math.max(.05,p.height);s=Math.min(s,Math.asin(Math.min(1,room))/HALF_PI);}
   if(p.kind==='stand'){p.hingeG.rotation.set(-HALF_PI*(1-s)-p.lean*s,0,0);}
   else{p.hingeG.rotation.set(-HALF_PI,0,0);p.content.rotation.set(0,p.hinge*(1-p.s)*so,0);}
   p.content.position.set(p.dx,p.dy,p.dz);if(p.kind==='stand'){if(p.spinG){p.content.rotation.set(0,0,0);p.spinG.rotation.set(0,0,p.rot);}else p.content.rotation.set(0,0,p.rot);}p.content.scale.setScalar(p.scale);
  }
  for(const f of faces)f.joy.visible=f.armL.rot<-1.5&&f.armR.rot>1.5;
  for(const q of parts){q.group.visible=q.visible&&q.scale>.001;if(q.kind==='flap'){if(q.axis==='y')q.group.rotation.set(0,q.flip,0);else q.group.rotation.set(q.flip,0,q.rot);}else q.group.rotation.set(0,0,q.rot);q.group.scale.setScalar(Math.max(.001,q.scale));
   const b=q.group.userData.base as THREE.Vector3;q.group.position.set(b.x+q.dx,b.y+q.dy,b.z+q.dz);}
  for(const v of vfolds){vfoldPanels(v,rhoL,rhoR);}
  void tmp2;
 };
 let disposed=false;
 return {id:def.id,rest:def.rest,group,leftTex,rightTex,pose,place,pieceCount:pieces.length,
  dispose(){if(disposed)return;disposed=true;group.traverse(o=>{if(o instanceof THREE.Mesh)o.geometry.dispose();});for(const k of keys)cache.release(k);for(const t of [leftTex,rightTex]){t.dispose();(t.image as HTMLCanvasElement).width=1;}group.removeFromParent();}};
}
