'use client';
import {forwardRef,useImperativeHandle,useRef,type ReactNode} from 'react';
import styles from './BinderLeaf.module.css';

/** Drives a leaf imperatively (no React render per frame): p = 0 lying on its own side, 1 turned over onto the other side. */
export type LeafHandle={pose:(p:number)=>void;
 /** Shows a leaf prebuilt hidden (see `hidden`), without a React render. */reveal:()=>void};
/** A face's content: a node, or a render function given the slice of the page (page px, from–to) that a strip shows, so
 * each strip copy can skip the pockets it never shows (a turn mounts 2 × strips page copies: keep them light). */
export type LeafFace=ReactNode|((from:number,to:number)=>ReactNode);
const draw=(face:LeafFace,from:number,to:number)=>typeof face==='function'?face(from,to):face;
type Props={
 /** Which edge of the leaf is bound in the rings. */hinge:'left'|'right';
 /** Distance from that edge to the hinge line (half the spine), so a turned leaf lands exactly on the opposite page. */offset:number;
 width:number;height:number;
 /** Vertical strips the sheet bends through (1 = a stiff sheet). */strips:number;
 front:LeafFace;back:LeafFace;
 /** The leaf's left edge inside the pages box (px). */left:number;
 /** Stacking for a riffle of several leaves: a turned leaf's z flips sign, so the first turned lands lowest. */z?:number;
 /** Most extra curl (degrees) across the sheet at mid-turn. */bend?:number;
 /** How far (px) the sheet rises off the page at mid-turn, so the turn reads in depth. */lift?:number;
 /** Prebuilt ahead of its turn: mounted, laid out, painted and rasterized but all but transparent (opacity .001, so the
  * compositor keeps its tiles), so the turn's first frame only calls reveal(). */hidden?:boolean;
};

/**
 * A two-sided binder sheet that bends as it turns: a chain of vertical strips, each rotateY'd a little more than the one
 * before it (the free edge leads), so the sleeve curls like flexing plastic. Front and back are real pages; each strip
 * shows its slice of both. Per-strip shade (the fold darkens as it turns edge-on) and a glossy highlight that sweeps across
 * the plastic are opacity only. pose() writes transforms and opacities directly: compositor-only, no React renders.
 * At p = 0 and p = 1 the sheet is flat and lies exactly on the page box it hands over to.
 */
const BinderLeaf=forwardRef<LeafHandle,Props>(function BinderLeaf({hinge,offset,width,height,strips,front,back,left,z=0,bend=78,lift=34,hidden=false},ref){
 const root=useRef<HTMLDivElement>(null),strip=useRef<(HTMLDivElement|null)[]>([]),shade=useRef<(HTMLSpanElement|null)[]>([]),shadeB=useRef<(HTMLSpanElement|null)[]>([]),gloss=useRef<(HTMLSpanElement|null)[]>([]);
 // Whole-pixel strips (the last takes the remainder): every slice's content sits on the same pixel grid as the resting page.
 const n=Math.max(1,strips),s=Math.floor(width/n),sign=hinge==='left'?-1:1,steps=n*(n-1)/2||1;
 const sw=(i:number)=>i<n-1?s:width-s*(n-1);
 useImperativeHandle(ref,()=>({reveal(){const el=root.current;if(el?.hasAttribute('data-prep')){el.style.opacity='';el.removeAttribute('data-prep');}},pose(p){
  // The curl peaks early (c ≈ 0.4): the free edge leads as the sheet peels up, then the sheet flattens as it lands.
  const c=Math.min(1,Math.max(0,p)),curl=Math.sin(Math.PI*Math.pow(c,.8))*bend*(n>1?1:0);
  const up=Math.sin(Math.PI*c)*lift;
  let angle=sign*(180*p-curl*.45);
  for(let i=0;i<n;i++){
   const d=i===0?angle:sign*curl*i/steps;if(i>0)angle+=d;
   const el=strip.current[i];if(el)el.style.transform=i===0?`translateZ(${(z+up).toFixed(2)}px) rotateY(${d.toFixed(2)}deg)`:`rotateY(${d.toFixed(2)}deg)`;
   const a=Math.abs(angle),edgeOn=Math.abs(Math.sin(a*Math.PI/180)),facing=a<=90?a:180-a;
   const sh=shade.current[i],gl=gloss.current[i];
   // Flat at rest (p = 0 or 1): no shade at all, so the landed sheet matches the resting page pixel for pixel.
   const dark=(.38*Math.pow(edgeOn,1.4)).toFixed(3);if(sh)sh.style.opacity=dark;const sb=shadeB.current[i];if(sb)sb.style.opacity=dark;
   if(gl)gl.style.opacity=(.55*Math.pow(Math.max(0,Math.cos((facing-46)*Math.PI/180)),14)*(c>0&&c<1?1:0)).toFixed(3);
  }
 }}),[n,sign,steps,bend,lift,z]);
 const x=(i:number)=>hinge==='left'?i*s:width-i*s-sw(i);
 const build=(i:number):ReactNode=>{
  if(i>=n)return null;
  // Faces reach a pixel past both strip edges so no seam shows while the sheet bends; symmetric, so a face turned
  // round its centre (the back) stays on the same pixels.
  const own=sw(i),first=i===0,prev=i>0?sw(i-1):0;
  // Each strip hangs off the previous one's free edge; for a right-hand hinge the chain runs leftwards.
  const style:React.CSSProperties={width:own,height,left:first?(hinge==='left'?0:width-own):(hinge==='left'?prev:-own),
   transformOrigin:first?(hinge==='left'?`${-offset}px 50%`:`${own+offset}px 50%`):(hinge==='left'?'0 50%':`${own}px 50%`)};
  return <div ref={el=>{strip.current[i]=el;}} className={styles.strip} style={style}>
   <div className={styles.face}><div className={styles.slice} style={{left:1-x(i),width,height}}>{draw(front,x(i)-1,x(i)+own+1)}</div><span ref={el=>{shade.current[i]=el;}} className={styles.shade}/><span ref={el=>{gloss.current[i]=el;}} className={styles.gloss}/></div>
   <div className={`${styles.face} ${styles.back}`}><div className={styles.slice} style={{left:1-(width-x(i)-own),width,height}}>{draw(back,width-x(i)-own-1,width-x(i)+1)}</div><span ref={el=>{shadeB.current[i]=el;}} className={styles.shade}/></div>
   {build(i+1)}
  </div>;
 };
 // A picture of the pages only: never focusable or clickable (inert), hidden from assistive tech.
 return <div ref={root} className={styles.leaf} style={{left,width,height,opacity:hidden?.001:undefined}} data-prep={hidden?'':undefined} aria-hidden="true" {...({inert:''} as Record<string,string>)}>{build(0)}</div>;
});
export default BinderLeaf;
