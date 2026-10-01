'use client';
import {forwardRef,useImperativeHandle,useRef,type ReactNode} from 'react';
import styles from './BinderLeaf.module.css';

/** Drives a leaf imperatively (no React render per frame): p = 0 lying on its own side, 1 turned over onto the other side. */
export type LeafHandle={pose:(p:number)=>void;
 /** Shows a leaf prebuilt hidden (see `hidden`), without a React render. */reveal:()=>void;
 /** Plays a whole turn on the compositor: `ps` are the poses (p) sampled evenly across `duration`, played as linear
  * keyframes after `delay`. Returns the animations (they hold their last pose until the leaf unmounts). */
 play:(ps:number[],timing:{duration:number;delay:number})=>Animation[]};
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
 /** A phone's single page: past this p the sheet has fallen over the hinge onto the off-screen side, and all that would show
  * of it is a sliver of 1–6 px over the binder's left edge and rings, which then vanished when the turn settled (the
  * end-of-turn snap). From there it is hidden the same way as a prebuilt sheet (opacity .001, tiles kept), at the pose
  * where that sliver is thinnest (the lifted hinge edge projects just off the binder). */away?:number;
};

/**
 * A two-sided binder sheet that bends as it turns: a chain of vertical strips, each rotateY'd a little more than the one
 * before it (the free edge leads), so the sleeve curls like flexing plastic. Front and back are real pages; each strip
 * shows its slice of both. Per-strip shade (the fold darkens as it turns edge-on) and a glossy highlight that sweeps across
 * the plastic are opacity only. pose() writes transforms and opacities directly (a drag); play() hands a whole turn to the
 * compositor as Web Animations keyframes sampled from the same poses (arrows, keys, corners, tabs, riffles). No React renders.
 * At p = 0 and p = 1 the sheet is flat and lies exactly on the page box it hands over to.
 */
const BinderLeaf=forwardRef<LeafHandle,Props>(function BinderLeaf({hinge,offset,width,height,strips,front,back,left,z=0,bend=78,lift=34,hidden=false,away},ref){
 const gone=useRef(false),root=useRef<HTMLDivElement>(null),strip=useRef<(HTMLDivElement|null)[]>([]),shade=useRef<(HTMLSpanElement|null)[]>([]),shadeB=useRef<(HTMLSpanElement|null)[]>([]),gloss=useRef<(HTMLSpanElement|null)[]>([]);
 // Whole-pixel strips (the last takes the remainder): every slice's content sits on the same pixel grid as the resting page.
 const n=Math.max(1,strips),s=Math.floor(width/n),sign=hinge==='left'?-1:1,steps=n*(n-1)/2||1;
 const sw=(i:number)=>i<n-1?s:width-s*(n-1);
 // One pose of the sheet: every strip's transform, shade and gloss opacity at p (shared by pose() and play(), so a
 // keyframed turn shows exactly the frames the per-frame turn did).
 const frame=(p:number)=>{
  // The curl peaks early (c ≈ 0.4): the free edge leads as the sheet peels up, then the sheet flattens as it lands.
  const c=Math.min(1,Math.max(0,p)),curl=Math.sin(Math.PI*Math.pow(c,.8))*bend*(n>1?1:0);
  const up=Math.sin(Math.PI*c)*lift;
  let angle=sign*(180*p-curl*.45);const out:{transform:string;dark:string;gloss:string}[]=[];
  for(let i=0;i<n;i++){
   const d=i===0?angle:sign*curl*i/steps;if(i>0)angle+=d;
   const a=Math.abs(angle),edgeOn=Math.abs(Math.sin(a*Math.PI/180)),facing=a<=90?a:180-a;
   // Flat at rest (p = 0 or 1): no shade at all, so the landed sheet matches the resting page pixel for pixel.
   out.push({transform:i===0?`translateZ(${(z+up).toFixed(2)}px) rotateY(${d.toFixed(2)}deg)`:`rotateY(${d.toFixed(2)}deg)`,
    dark:(.38*Math.pow(edgeOn,1.4)).toFixed(3),gloss:(.55*Math.pow(Math.max(0,Math.cos((facing-46)*Math.PI/180)),14)*(c>0&&c<1?1:0)).toFixed(3)});
  }
  return out;};
 useImperativeHandle(ref,()=>({reveal(){const el=root.current;if(el?.hasAttribute('data-prep')){el.style.opacity=gone.current?'.001':'';el.removeAttribute('data-prep');}},pose(p){
  // Off the page (a phone's sheet past `away`): hidden; a prebuilt sheet keeps its own .001 until reveal().
  const off=away!==undefined&&p>=away,el=root.current;if(off!==gone.current){gone.current=off;if(el&&!el.hasAttribute('data-prep'))el.style.opacity=off?'.001':'';}
  frame(p).forEach((f,i)=>{const st=strip.current[i];if(st)st.style.transform=f.transform;const sh=shade.current[i],sb=shadeB.current[i],gl=gloss.current[i];
   if(sh)sh.style.opacity=f.dark;if(sb)sb.style.opacity=f.dark;if(gl)gl.style.opacity=f.gloss;});
 },play(ps,timing){
  // The same poses as keyframes (linear between samples taken a 60 Hz frame apart): the compositor plays them, with no
  // style writes, style recalcs or paints per frame. fill 'both': holds the first pose through a riffle's delay and the
  // last one through the end-of-turn handover, exactly as the per-frame loop left them.
  const opts:KeyframeAnimationOptions={...timing,easing:'linear',fill:'both'},frames=ps.map(frame),anims:Animation[]=[];
  const run=(el:Element|null|undefined,kf:Keyframe[])=>{if(el)anims.push(el.animate(kf,opts));};
  for(let i=0;i<n;i++){run(strip.current[i],frames.map(f=>({transform:f[i].transform})));
   const dark=frames.map(f=>({opacity:f[i].dark}));run(shade.current[i],dark);run(shadeB.current[i],dark);run(gloss.current[i],frames.map(f=>({opacity:f[i].gloss})));}
  // A phone's sheet past `away` is hidden (opacity .001 on the leaf, tiles kept) when the turn's clock reaches the first
  // sample past it (or, for a back turn, shown again at the first one before it), as pose() did. A one-off timer on the
  // turn's own clock, not an opacity animation: animating the leaf's opacity would flatten its 3D (opacity is a grouping
  // property) and animating the faces' would give each face its own layer, re-rasterised at every turn start.
  const first=anims[0];
  if(away!==undefined&&first){const k=ps.findIndex(p=>(p>=away)!==(ps[0]>=away));
   if(k>0){const at=timing.delay+timing.duration*k/Math.max(1,ps.length-1),off=ps[k]>=away;let id=0;
    const check=()=>{if(first.playState==='idle'){return;}const now=Number(first.currentTime??0);
     if(now>=at||first.playState==='finished'){const el=root.current;gone.current=off;if(el&&!el.hasAttribute('data-prep'))el.style.opacity=off?'.001':'';return;}
     id=window.setTimeout(check,first.playState==='running'?Math.max(4,at-now):50);};
    first.ready.then(check,()=>{});first.addEventListener('cancel',()=>window.clearTimeout(id));}}
  return anims;
 }}),[n,sign,steps,bend,lift,z,away]);
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
