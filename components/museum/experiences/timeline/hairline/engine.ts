/**
 * Hairline's drawing core, ported for the museum timeline (Oct 5 2026).
 *
 * @lucasmarkes/hairline (MIT © Lucas Marques, https://github.com/lucasmarkes/hairline) ships twenty-seven figures but no public
 * API for new ones: its iso camera, plate solids, springs and the shared rAF loop are internal to dist/index.js. So the football
 * figures here run on a faithful TypeScript port of those internals (src/core/iso.ts, motion.ts, stage.ts in the package), kept
 * to the same numbers: a 400×320 viewBox, Cam(45°, k 0.5), plates as the hull of two rounded rings (bright silhouette, one dim
 * crease), the 240 Hz sub-stepped spring, the 700 ms cubic-bezier(.32,.72,0,1) lift, and ONE requestAnimationFrame loop shared
 * by every figure that stops when nothing moves, skips figures off screen (IntersectionObserver) and snaps under reduced motion.
 * The package itself still draws the Padlock on locked eras (its own engine and loop; both sleep at rest).
 */
export type Pt=[number,number];
export type V3=[number,number,number];
export type RingPt={u:number;v:number;nu:number;nv:number};
export type Camera={az:number;k:number;S:number;ox:number;oy:number};
export type Proj=(x:number,y:number,z:number)=>Pt;

// ---- iso.ts ----
export const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
export const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
export const rad=(d:number)=>d*Math.PI/180;
export const r2=(n:number)=>Math.round(n*100)/100;
export const poly=(pts:readonly Pt[])=>pts.length<2?'':'M'+pts.map(p=>r2(p[0])+' '+r2(p[1])).join('L')+'Z';
export const seg=(a:Pt,b:Pt)=>`M${r2(a[0])} ${r2(a[1])}L${r2(b[0])} ${r2(b[1])}`;
export const open=(pts:readonly Pt[])=>pts.length<2?'':'M'+pts.map(p=>r2(p[0])+' '+r2(p[1])).join('L');
export const Cam=(azDeg:number,k:number,S:number):Camera=>({az:rad(azDeg),k,S,ox:0,oy:0});
export function proj(C:Camera):Proj{
 const c=Math.cos(C.az),s=Math.sin(C.az),zf=Math.sqrt(1-C.k*C.k);
 return (x,y,z)=>{const X=x*c-y*s,Y=x*s+y*c;return [C.ox+C.S*X,C.oy+C.S*(Y*C.k-z*zf)];};
}
export function unproj(C:Camera,sx:number,sy:number,z:number):Pt{
 const c=Math.cos(C.az),s=Math.sin(C.az),zf=Math.sqrt(1-C.k*C.k);
 const X=(sx-C.ox)/C.S,Y=((sy-C.oy)/C.S+z*zf)/C.k;return [X*c+Y*s,-X*s+Y*c];
}
/** Centre a set of world points on (cx, cy). */
export function fit(C:Camera,pts:readonly V3[],cx:number,cy:number){
 C.ox=0;C.oy=0;const P=proj(C);let a=1e9,b=-1e9,c=1e9,d=-1e9;
 for(const p of pts){const q=P(p[0],p[1],p[2]);a=Math.min(a,q[0]);b=Math.max(b,q[0]);c=Math.min(c,q[1]);d=Math.max(d,q[1]);}
 C.ox=cx-(a+b)/2;C.oy=cy-(c+d)/2;
}
export function rrect(u0:number,v0:number,u1:number,v1:number,r:number,n=4):RingPt[]{
 r=Math.max(0,Math.min(r,(u1-u0)/2,(v1-v0)/2));const out:RingPt[]=[];
 for(const [cu,cv,a0] of [[u1-r,v1-r,0],[u0+r,v1-r,90],[u0+r,v0+r,180],[u1-r,v0+r,270]] as const)
  for(let k=0;k<=n;k++){const a=rad(a0+90*k/n),ca=Math.cos(a),sa=Math.sin(a);out.push({u:cu+r*ca,v:cv+r*sa,nu:ca,nv:sa});}
 return out;
}
export function circ(R:number,n=96,cu=0,cv=0):RingPt[]{
 const out:RingPt[]=[];for(let k=0;k<n;k++){const a=k/n*Math.PI*2,ca=Math.cos(a),sa=Math.sin(a);out.push({u:cu+R*ca,v:cv+R*sa,nu:ca,nv:sa});}return out;
}
export function hull(input:readonly Pt[]):Pt[]{
 const pts=input.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
 const x=(o:Pt,a:Pt,b:Pt)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);const lo:Pt[]=[],up:Pt[]=[];
 for(const p of pts){while(lo.length>1&&x(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p);}
 for(let i=pts.length-1;i>=0;i--){const p=pts[i];while(up.length>1&&x(up[up.length-2],up[up.length-1],p)<=0)up.pop();up.push(p);}
 lo.pop();up.pop();return lo.concat(up);
}
export const ringAt=(P:Proj,ring:readonly RingPt[],z:number)=>ring.map(q=>P(q.u,q.v,z));
export const facing=(C:Camera)=>{const s=Math.sin(C.az),c=Math.cos(C.az);return (q:RingPt)=>q.nu*s+q.nv*c>=-1e-6;};
export function run(ring:readonly RingPt[],keep:(q:RingPt)=>boolean):RingPt[]{
 const n=ring.length;let s=-1;
 for(let i=0;i<n;i++)if(keep(ring[i])&&!keep(ring[(i+n-1)%n])){s=i;break;}
 if(s<0)return keep(ring[0])?ring.slice():[];
 const out:RingPt[]=[];for(let k=0;k<n&&keep(ring[(s+k)%n]);k++)out.push(ring[(s+k)%n]);return out;
}
export type Solid={sil:string;crease:string};
/** A plate: the hull of its top and bottom rings (silhouette), plus the front run of the inner ring on top (the one dim crease). */
export function prism(P:Proj,front:(q:RingPt)=>boolean,ring:readonly RingPt[],inner:readonly RingPt[]|null,z0:number,z1:number):Solid{
 return {sil:poly(hull(ringAt(P,ring,z1).concat(ringAt(P,ring,z0)))),crease:inner?open(ringAt(P,run(inner,front),z1)):''};
}
export const rings=(x0:number,y0:number,x1:number,y1:number,r:number,b:number)=>[rrect(x0,y0,x1,y1,r),rrect(x0+b,y0+b,x1-b,y1-b,Math.max(.3,r-b))] as const;
export function fillet(pts:readonly Pt[],rs:readonly number[],n=4):Pt[]{
 const m=pts.length,out:Pt[]=[];
 for(let i=0;i<m;i++){const a=pts[(i+m-1)%m],p=pts[i],b=pts[(i+1)%m];
  const la=Math.hypot(a[0]-p[0],a[1]-p[1]),lb=Math.hypot(b[0]-p[0],b[1]-p[1]),t=Math.min(rs[i],la/2,lb/2);
  const p1:Pt=[p[0]+(a[0]-p[0])/la*t,p[1]+(a[1]-p[1])/la*t],p2:Pt=[p[0]+(b[0]-p[0])/lb*t,p[1]+(b[1]-p[1])/lb*t];
  for(let k=0;k<=n;k++){const s=k/n,w=1-s;out.push([w*w*p1[0]+2*w*s*p[0]+s*s*p2[0],w*w*p1[1]+2*w*s*p[1]+s*s*p2[1]]);}}
 return out;
}
/** The faint reflection under a plinth: its front edge dropped by `depth`, faded out by a mask. */
export function ghost(P:Proj,front:(q:RingPt)=>boolean,ring:readonly RingPt[],z0:number,depth:number){
 const f=run(ring,front),lowP=ringAt(P,f,z0-depth);
 return {d:open(lowP)+[f[0],f[f.length-1]].map(q=>seg(P(q.u,q.v,z0),P(q.u,q.v,z0-depth))).join(''),
  y0:Math.min(...ringAt(P,f,z0).map(p=>p[1])),y1:Math.max(...lowP.map(p=>p[1]))+2};
}

// ---- motion.ts ----
let reduced=false;
export const reducedMotion=()=>reduced;
export type Spring={x:number;v:number;t:number;k:number;c:number;m:number;eps:number};
export function spring(x:number,o:Partial<Pick<Spring,'k'|'c'|'m'|'eps'>>={}):Spring{return {x,v:0,t:x,k:o.k??100,c:o.c??18,m:o.m??1,eps:o.eps??.01};}
/** Semi-implicit Euler at 240 Hz sub-steps; returns true while moving. Reduced motion lands at once. */
export function stepS(sp:Spring,dt:number){
 if(reduced){sp.x=sp.t;sp.v=0;return false;}
 const n=Math.max(1,Math.ceil(dt*240)),h=dt/n;
 for(let i=0;i<n;i++){const a=(-sp.k*(sp.x-sp.t)-sp.c*sp.v)/sp.m;sp.v+=a*h;sp.x+=sp.v*h;}
 if(Math.abs(sp.x-sp.t)<sp.eps&&Math.abs(sp.v)<sp.eps*10){sp.x=sp.t;sp.v=0;return false;}
 return true;
}

// ---- stage.ts ----
const NS='http://www.w3.org/2000/svg';
export function mk<K extends keyof SVGElementTagNameMap>(tag:K,attrs?:Record<string,string|number>|null,parent?:Element|null):SVGElementTagNameMap[K]{
 const e=document.createElementNS(NS,tag);if(attrs)for(const k in attrs)e.setAttribute(k,String(attrs[k]));if(parent)parent.appendChild(e);return e;
}
export type SolidEl={g:SVGGElement;sil:SVGPathElement;cr:SVGPathElement};
export function solid(parent:Element,cls=''):SolidEl{const g=mk('g',cls?{class:cls}:{},parent);return {g,sil:mk('path',{class:'sil'},g),cr:mk('path',{class:'nf lo'},g)};}
export const put=(el:SolidEl,s:Solid)=>{el.sil.setAttribute('d',s.sil);el.cr.setAttribute('d',s.crease);};
let fid=0;
export function fadeMask(svg:SVGSVGElement,y0:number,y1:number,a0=.7){
 const id='tl-fd'+ ++fid,defs=mk('defs',{},svg);
 const lg=mk('linearGradient',{id:id+'g',gradientUnits:'userSpaceOnUse',x1:0,y1:r2(y0),x2:0,y2:r2(y1)},defs);
 mk('stop',{offset:0,'stop-color':'#fff','stop-opacity':a0},lg);mk('stop',{offset:1,'stop-color':'#fff','stop-opacity':0},lg);
 const m=mk('mask',{id,maskUnits:'userSpaceOnUse',x:0,y:0,width:400,height:320},defs);mk('rect',{x:0,y:0,width:400,height:320,fill:`url(#${id}g)`},m);
 return `url(#${id})`;
}

/** The ONE shared loop: ticks only figures that are visible and awake, and stops itself when none is moving. */
type Board={stage:Element;tick:(dt:number,now:number)=>boolean;vis:boolean;awake:boolean};
let boards:Board[]=[];const byStage=new Map<Element,Board>();
let raf=0,last=0,io:IntersectionObserver|null=null,rm:MediaQueryList|null=null;
/** Frames the loop has run since load (tests read it to prove the loop sleeps). */
export const loopStats={frames:0};
function frame(now:number){
 const dt=Math.min(.05,Math.max(0,(now-last)/1e3));last=now;let any=false;loopStats.frames++;
 for(const b of boards.slice())if(b.vis&&b.awake&&!document.hidden){b.awake=!!b.tick(dt,now);any=any||b.awake;}
 raf=any?requestAnimationFrame(frame):0;
}
function wake(b:Board){b.awake=true;if(!raf&&b.vis&&!document.hidden){last=performance.now();raf=requestAnimationFrame(frame);}}
const onMotion=()=>{reduced=!!rm?.matches;boards.forEach(wake);};
const onVis=()=>{if(!document.hidden)boards.forEach(b=>{if(b.awake)wake(b);});};
function start(){
 if(io)return;
 io=new IntersectionObserver(es=>{for(const e of es){const b=byStage.get(e.target);if(!b)continue;b.vis=e.isIntersecting;if(b.vis)wake(b);}},{rootMargin:'80px'});
 rm=matchMedia('(prefers-reduced-motion: reduce)');reduced=rm.matches;rm.addEventListener('change',onMotion);document.addEventListener('visibilitychange',onVis);
}
function stop(){if(raf)cancelAnimationFrame(raf);raf=0;io?.disconnect();io=null;rm?.removeEventListener('change',onMotion);rm=null;document.removeEventListener('visibilitychange',onVis);}
export function register(stage:Element,tick:(dt:number,now:number)=>boolean){
 start();const b:Board={stage,tick,vis:false,awake:true};boards.push(b);byStage.set(stage,b);io!.observe(stage);tick(0,performance.now());let gone=false;
 return {wake:()=>{if(!gone)wake(b);},unregister:()=>{if(gone)return;gone=true;boards=boards.filter(x=>x!==b);if(byStage.get(stage)===b){byStage.delete(stage);io?.unobserve(stage);}if(!boards.length)stop();}};
}
/** Pointer in viewBox units; a touch "leaves" 1.4 s after the finger lifts (as in the package). */
export function pointer(stage:HTMLElement,on:{move:(p:Pt,e:PointerEvent)=>void;leave:(e:PointerEvent)=>void}){
 let tm=0;let rect:DOMRect|null=null;
 const pt=(e:PointerEvent):Pt=>{const r=rect??(rect=stage.getBoundingClientRect());return [(e.clientX-r.left)/r.width*400,(e.clientY-r.top)/r.height*320];};
 const move=(e:PointerEvent)=>{clearTimeout(tm);on.move(pt(e),e);};
 const down=(e:PointerEvent)=>{clearTimeout(tm);rect=null;on.move(pt(e),e);};
 const leave=(e:PointerEvent)=>{clearTimeout(tm);rect=null;tm=window.setTimeout(()=>on.leave(e),e.pointerType==='mouse'?0:1400);};
 const up=(e:PointerEvent)=>{if(e.pointerType!=='mouse')leave(e);};
 const enter=()=>{rect=null;};
 stage.addEventListener('pointermove',move);stage.addEventListener('pointerdown',down);stage.addEventListener('pointerenter',enter);
 stage.addEventListener('pointerleave',leave);stage.addEventListener('pointerup',up);stage.addEventListener('pointercancel',leave);
 return ()=>{clearTimeout(tm);stage.removeEventListener('pointermove',move);stage.removeEventListener('pointerdown',down);stage.removeEventListener('pointerenter',enter);
  stage.removeEventListener('pointerleave',leave);stage.removeEventListener('pointerup',up);stage.removeEventListener('pointercancel',leave);};
}
