'use client';
/**
 * Holo foil overlay for the large PlayerCard (card lab, Oct 8 2026; off in the live game). PlayerCard mounts it in place of its
 * CSS `.foil` when its `holo` prop is set, and drives it from its own tilt spring: `handleRef.current.draw()` runs inside the
 * spring's frame, `settle()` when the spring sleeps, `rest()` when the card goes flat. The only frames this component schedules
 * itself are one arrival glint (GLINT_MS) per player. Hidden or off-screen it draws nothing.
 * Falls back to the CSS foil (the `fallback` node) when WebGL2 is missing, the context is lost or taken by another holo card,
 * or the viewer prefers reduced motion.
 */
import {useEffect,useLayoutEffect,useRef,useState,type MutableRefObject,type ReactNode} from 'react';
import {photoFor,playerMaskUrl} from './PlayerArt';
import cardStyles from './PlayerCard.module.css';
import artStyles from './PlayerArt.module.css';
import styles from './HoloFoil.module.css';
import {GLINT_MS,PATTERN_INTENSITY,holoDpr,type HoloPattern,type HoloTier} from '@/lib/graphics/holoFoil/patterns';
import {createHoloLoop,REST_POSE,type HoloLoop,type HoloPose,type LoopStats} from '@/lib/graphics/holoFoil/loop';
import {claimHoloContext,createHoloRenderer,holoSupport,releaseHoloContext,type FallbackReason,type HoloLayout,type HoloRenderer,type Rect} from '@/lib/graphics/holoFoil/renderer';

/** `intensity` defaults to the user's per-pattern setting (PATTERN_INTENSITY). */
export type HoloFoilConfig={pattern:HoloPattern;tier:HoloTier;intensity?:number};
export type HoloFoilHandle={draw(pose:HoloPose):void;settle():void;rest():void;glint():void};
export type HoloStats=LoopStats&{mode:'webgl2'|'css';reason:FallbackReason|null;cpuMs:number;gpuMs:number|null;gpuTimer:boolean;dpr:number;canvasPx:[number,number]};
type Props=HoloFoilConfig&{name:string;handleRef:MutableRefObject<HoloFoilHandle|null>;fallback:ReactNode;className?:string;onStats?:(stats:HoloStats)=>void};

const TOUCH='(hover: none), (pointer: coarse)';
const useIsoLayoutEffect=typeof window==='undefined'?useEffect:useLayoutEffect;
/** Layout offsets (transform-free), so a tilted card measures the same as a flat one. */
function offsetRect(el:HTMLElement|null,face:HTMLElement):Rect|null{
 if(!el)return null;let x=0,y=0,n:HTMLElement|null=el;
 while(n&&n!==face){x+=n.offsetLeft;y+=n.offsetTop;n=n.offsetParent as HTMLElement|null;}
 return n===face?[x,y,el.offsetWidth,el.offsetHeight]:null;
}
/** The text panel: the name plate (name, role · nation) through the bio (tag chip and text), as one box, 3 px larger all round. */
function textPanel(a:Rect|null,b:Rect|null):Rect|null{const rs=[a,b].filter((r):r is Rect=>!!r&&r[2]>0);if(!rs.length)return null;
 const x0=Math.min(...rs.map(r=>r[0])),y0=Math.min(...rs.map(r=>r[1])),x1=Math.max(...rs.map(r=>r[0]+r[2])),y1=Math.max(...rs.map(r=>r[1]+r[3]));return [x0-3,y0-3,x1-x0+6,y1-y0+6];}
function measure(face:HTMLElement):HoloLayout{
 const cs=getComputedStyle(face),border=parseFloat(cs.borderTopWidth)||0;
 const r=(v:string)=>Math.max(0,(parseFloat(v)||0)-border);
 const q=(sel:string)=>face.querySelector<HTMLElement>(sel);
 const w=face.clientWidth,h=face.clientHeight,none:Rect=[-999,-999,0,0];
 const win=offsetRect(q(`.${cardStyles.window}`),face)??[w*.05,h*.1,w*.9,h*.5];
 return {w,h,radii:[r(cs.borderTopLeftRadius),r(cs.borderTopRightRadius),r(cs.borderBottomRightRadius),r(cs.borderBottomLeftRadius)],
  win,winR:parseFloat(getComputedStyle(q(`.${cardStyles.window}`)??face).borderTopLeftRadius)||16,
  text:[textPanel(offsetRect(q(`.${cardStyles.plate}`),face),offsetRect(q(`.${cardStyles.bio}`),face))??none,none],
  mask:offsetRect(q(`.${artStyles.riso}>.${artStyles.ink}`),face),paper:offsetRect(q(`.${artStyles.riso}>.${artStyles.paper}`),face)};
}

export default function HoloFoil({name,pattern,tier,intensity=PATTERN_INTENSITY[pattern],handleRef,fallback,className='',onStats}:Props){
 const canvas=useRef<HTMLCanvasElement>(null);
 const [reason,setReason]=useState<FallbackReason|null>(()=>typeof window==='undefined'?'no-webgl2':holoSupport(window));
 const live=useRef<{renderer:HoloRenderer;loop:HoloLoop;dpr:number}|null>(null);
 const statsCb=useRef(onStats);statsCb.current=onStats;
 const look=useRef({pattern,tier,intensity});look.current={pattern,tier,intensity};
 const report=(r:FallbackReason|null)=>{const l=live.current,t=l?.renderer.timing();
  statsCb.current?.({...(l?.loop.stats()??{frames:0,interactions:0,currentFrames:0,lastInteractionFrames:0,lastGlintFrames:0,looping:false,lastFrameAt:0}),
   mode:l?'webgl2':'css',reason:r,cpuMs:t?.cpuMs??0,gpuMs:t?.gpuMs??null,gpuTimer:t?.gpuTimer??false,dpr:l?.dpr??0,canvasPx:l?[...l.renderer.canvasPx] as [number,number]:[0,0]});};
 // Reduced motion can change while the card is open.
 useEffect(()=>{const mq=window.matchMedia('(prefers-reduced-motion: reduce)');const on=()=>{if(mq.matches)setReason('reduced-motion');};mq.addEventListener?.('change',on);return ()=>mq.removeEventListener?.('change',on);},[]);
 useEffect(()=>{if(reason){handleRef.current=null;report(reason);}},[reason]);// eslint-disable-line react-hooks/exhaustive-deps

 // The context, the loop and the observers: once per mounted canvas.
 useIsoLayoutEffect(()=>{const el=canvas.current,face=el?.parentElement;if(reason||!el||!face)return;
  const renderer=createHoloRenderer(el,()=>setReason('context-lost'));
  if(!renderer){setReason('no-webgl2');return;}
  let taken=false;const holder={release:()=>{taken=true;setReason('taken');}};claimHoloContext(holder);
  let lastReport=0;
  const loop=createHoloLoop({raf:cb=>requestAnimationFrame(cb),caf:id=>cancelAnimationFrame(id),now:()=>performance.now()},
   (pose,glint)=>{renderer.draw(pose,glint);const now=performance.now();if(now-lastReport>250){lastReport=now;report(null);}},
   ()=>{lastReport=performance.now();report(null);});
  const dpr=holoDpr(window.devicePixelRatio,window.matchMedia(TOUCH).matches);
  live.current={renderer,loop,dpr};
  renderer.setLook(look.current);
  const fit=()=>{renderer.resize(measure(face),dpr);};fit();
  handleRef.current={draw:pose=>loop.drive(pose),settle:()=>loop.settle(),rest:()=>loop.rest(),glint:()=>loop.glint(GLINT_MS)};
  // Visibility: a hidden tab or a card scrolled away draws nothing; the next visible moment puts up one still frame.
  let inView=true;const sync=()=>loop.setVisible(inView&&!document.hidden);
  const io=typeof IntersectionObserver==='undefined'?null:new IntersectionObserver(entries=>{inView=entries[entries.length-1].isIntersecting;sync();});io?.observe(el);
  document.addEventListener('visibilitychange',sync);
  // Size changes (a resize, the bio reflowing): re-measure and put up one still frame. No loop.
  const ro=typeof ResizeObserver==='undefined'?null:new ResizeObserver(()=>{fit();loop.still();});ro?.observe(face);
  report(null);
  return ()=>{handleRef.current=null;io?.disconnect();ro?.disconnect();document.removeEventListener('visibilitychange',sync);loop.dispose();releaseHoloContext(holder);
   // A card that lost its context to another holo card frees the GPU at once; a plain unmount leaves it to the GC (React's dev
   // double mount re-uses this canvas, and a lost context could not be revived on it).
   renderer.dispose(taken);live.current=null;};
 },[reason]);// eslint-disable-line react-hooks/exhaustive-deps

 // Look changes: one still frame.
 useEffect(()=>{const l=live.current;if(!l)return;l.renderer.setLook({pattern,tier,intensity});l.loop.still();},[pattern,tier,intensity]);
 // The player's mask, uploaded once per player, then the arrival glint.
 useEffect(()=>{const l=live.current;if(!l)return;let done=false;const photo=photoFor(name);
  const arrive=()=>{if(done)return;const face=canvas.current?.parentElement;if(face)l.renderer.resize(measure(face),l.dpr);
   if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)l.loop.still();else l.loop.glint(GLINT_MS);};
  if(!photo){l.renderer.setMask(null);arrive();return ()=>{done=true;};}
  const img=new Image();img.decoding='async';const src=playerMaskUrl(photo.slug);
  if(/^https?:/.test(src)&&new URL(src).origin!==location.origin)img.crossOrigin='anonymous';
  img.onload=()=>{if(done)return;try{l.renderer.setMask(img);}catch{l.renderer.setMask(null);}arrive();};
  img.onerror=()=>{if(done)return;l.renderer.setMask(null);arrive();};
  img.src=src;
  return ()=>{done=true;img.onload=img.onerror=null;};
 },[name,reason]);
 // Ownership lost (another holo card), context lost, no WebGL2 or reduced motion: the CSS foil, exactly as before.
 if(reason)return <>{fallback}</>;
 return <canvas ref={canvas} className={`${styles.canvas} ${className}`} aria-hidden="true" data-holo-foil={pattern} data-holo-tier={tier}/>;
}
export {REST_POSE};
