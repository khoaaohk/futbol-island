/**
 * One hairline figure on its plate: the shared frame every football figure uses (engine.ts holds the ported drawing core).
 * The frame draws the ground plate (a rounded square, its front edge reflected below and faded out), owns the springs and the
 * pointer, and hands each figure a projector that already carries the rise (the object lifts off its plate) and the turn toward
 * the pointer. A figure only builds its SVG once and rewrites path data while a spring moves; at rest nothing runs.
 */
import {Cam,clamp,facing,fadeMask,fit,ghost,mk,pointer,prism,proj,put,r2,rad,register,rings,solid,spring,stepS,unproj,
 type Camera,type Proj,type Pt,type RingPt,type V3} from './engine';

export type Ctx={
 /** Projector for the object: turned by `yaw`, lifted by the rise. */
 P:Proj;
 /** Fixed projector for the ground plate (no turn, no lift). */
 F:Proj;
 C:Camera;front:(q:RingPt)=>boolean;
 /** 0 resting low → 1 risen (the active era). */
 rise:number;
 /** Smoothed pointer, −1…1 across and down the figure; 0 at rest. */
 ax:number;ay:number;
 /** How present the pointer is, 0…1 (springs back to 0 when it leaves). */
 near:number;
 /** Units the object floats above its plate right now. */
 lift:number;
 /** The pointer on the ground plane (fixed camera) at height z, or null when it is away. */
 ground:(z:number)=>Pt|null;
 /** View direction (toward the eye) in world space, for sphere surfaces. */
 view:V3;
 yaw:number;
};
export type FigureDef={
 label:string;
 /** Ground plate half-extents (world units). */
 plate:[number,number];
 /** Extra points the object may reach (local, before lift), used to frame the figure. */
 bounds:V3[];
 /** Degrees the object turns toward the pointer at full reach (0: it doesn't turn). */
 yaw?:number;
 /** A standing turn, so a plate faces the visitor a little more. */
 baseYaw?:number;
 /** Units the active object floats above the plate. */
 lift?:number;
 /** Radius of the dashed contact ring left on the plate as it rises (0: none). */
 shadow?:number;
 build:(g:SVGGElement)=>(c:Ctx)=>void;
};
export type FigureHandle={setActive:(on:boolean)=>void;destroy:()=>void};

const NS='http://www.w3.org/2000/svg';
/** Mount a figure into `el` (a 5:4 box). `active` decides whether it is risen and answers the pointer. */
export function mountFigure(el:HTMLElement,def:FigureDef,active:boolean):FigureHandle{
 const svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox','0 0 400 320');svg.setAttribute('aria-hidden','true');el.appendChild(svg);
 const [hx,hy]=def.plate,PB=4,LIFT=def.lift??7;
 // Frame: scale so the plate and the object at full lift fill ~88% × 78% of the box, then centre like the package (200, 166).
 const C0=Cam(45,.5,1),pts:V3[]=[[-hx,-hy,-PB],[hx,-hy,-PB],[-hx,hy,-PB],[hx,hy,-PB],...def.bounds.map(([x,y,z]):V3=>[x,y,z+LIFT])];
 {fit(C0,pts,0,0);const P=proj(C0);let a=1e9,b=-1e9,c=1e9,d=-1e9;for(const p of pts){const q=P(p[0],p[1],p[2]);a=Math.min(a,q[0]);b=Math.max(b,q[0]);c=Math.min(c,q[1]);d=Math.max(d,q[1]);}
  C0.S=Math.min(372/(b-a),268/(d-c));fit(C0,pts,200,166);}
 const F=proj(C0),front0=facing(C0);
 const root=mk('g',{},svg);
 // The plate and its reflection.
 const [po,pi]=rings(-hx,-hy,hx,hy,Math.min(hx,hy)*.22,1.8);
 const gh=ghost(F,front0,po,-PB,9),ghG=mk('g',{class:'ghost',mask:fadeMask(svg,gh.y0,gh.y1)},root);mk('path',{d:gh.d},ghG);
 put(solid(root),prism(F,front0,po,pi,-PB,0));
 const shadow=def.shadow?mk('ellipse',{class:'nf lo dash',rx:r2(def.shadow*C0.S),ry:r2(def.shadow*C0.S*C0.k)},root):null;
 if(shadow){const q=F(0,0,0);shadow.setAttribute('cx',String(r2(q[0])));shadow.setAttribute('cy',String(r2(q[1])));}
 const obj=mk('g',{},root);const draw=def.build(obj);
 const rise=spring(active?1:0,{k:120,c:15,eps:.002}),ax=spring(0,{k:70,c:13,eps:.002}),ay=spring(0,{k:70,c:13,eps:.002}),near=spring(0,{k:90,c:16,eps:.002});
 let isActive=active,over:Pt|null=null;
 const zf=Math.sqrt(1-C0.k*C0.k);
 function paint(){
  const yaw=(def.baseYaw??0)+ax.x*(def.yaw??0),C:Camera={...C0,az:C0.az+rad(yaw)},Py=proj(C),lift=rise.x*LIFT;
  const P:Proj=(x,y,z)=>Py(x,y,z+lift);
  if(shadow)shadow.style.opacity=String(r2(clamp(rise.x,0,1)));
  draw({P,F,C,front:facing(C),rise:rise.x,ax:ax.x,ay:ay.x,near:clamp(near.x,0,1),lift,yaw,
   ground:z=>near.x>.001?unproj(C0,200+ax.x*150,165+ay.x*120,z):null,view:[zf*Math.sin(C.az),zf*Math.cos(C.az),C0.k]});
 }
 const loop=register(el,dt=>{let m=false;for(const s of [rise,ax,ay,near])m=stepS(s,dt)||m;paint();return m;});
 const offPointer=pointer(el,{
  move:p=>{if(!isActive)return;over=p;ax.t=clamp((p[0]-200)/150,-1,1);ay.t=clamp((p[1]-165)/120,-1,1);near.t=1;loop.wake();},
  leave:()=>{over=null;ax.t=0;ay.t=0;near.t=0;loop.wake();}});
 svg.classList.toggle('on',active);
 return {
  setActive(on){if(on===isActive)return;isActive=on;rise.t=on?1:0;if(!on){over=null;ax.t=0;ay.t=0;near.t=0;}svg.classList.toggle('on',on);loop.wake();},
  destroy(){loop.unregister();offPointer();svg.remove();},
 };
}
