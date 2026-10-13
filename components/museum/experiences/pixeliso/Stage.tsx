'use client';
import {forwardRef,useCallback,useEffect,useImperativeHandle,useLayoutEffect,useRef,type HTMLAttributes,type ReactNode} from 'react';
import {Palette} from './palette';
import {Pixmap} from './raster';
import {fitGrid,type StageSize} from './iso';
import styles from './pixeliso.module.css';

/**
 * pixeliso · PixelStage (Oct 10 2026): the pixel renderer on the page. A <canvas> whose drawing buffer IS the art (one buffer
 * pixel = one art pixel), shown at a whole-number CSS scale with image-rendering: pixelated, so every pixel is a crisp square.
 *
 * The grid (same for every exhibit): pixel size P = 4, 3 or 2 CSS px (the penalty cabinet's 2–4 rule): the largest that still
 * fits the `min` art size in the box. The buffer then grows up to `max` to fill the width, so phones see the min scene at
 * P = 2 and desktops a little more world at P = 3–4. Scenes are drawn around the buffer centre (iso.centreOn).
 *
 * Drawing is on demand: invalidate() coalesces into ONE synchronous draw (a microtask, never a rAF), so a still stage costs
 * nothing. Animation comes from a PlayLoop that calls draw() each tick while something moves.
 */
export type {StageSize};
export type StageApi={
 /** Redraw soon (coalesced, microtask). */
 invalidate():void;
 /** Redraw now (inside a PlayLoop tick). */
 draw():void;
 /** Client (CSS) point → buffer pixel. */
 local(clientX:number,clientY:number):[number,number];
 readonly size:StageSize;
 readonly pixmap:Pixmap|null;
 readonly canvas:HTMLCanvasElement|null;
};
type Props={
 /** Smallest art size the scene needs (buffer px). Default 160 × 160: fits 390-px phones at P = 2. */
 min?:readonly [number,number];
 /** Largest art size (extra world on wide screens). Default = min. */
 max?:readonly [number,number];
 /**
  * Per-pixel-size cap on the art size (Oct 12 2026): when fitGrid lands on a given P, use this max instead of `max`. A compact
  * scene can let `min` drop so P = 4 fits a desktop's height, and cap the buffer at P = 4 so the bigger pixels frame the scene
  * rather than add more empty world round it. Still whole-number pixels only.
  */
 maxAt?:Partial<Record<2|3|4,readonly [number,number]>>;
 /** Upper bound for the stage height in CSS px (default: 62% of the window). */
 maxHeight?:number;
 /** Paint the frame. `pm` is cleared to `bg` first. */
 render:(pm:Pixmap,size:StageSize)=>void;
 /** Background colour (Mega Drive palette). */
 bg?:string;
 /** Accessible description of what the picture shows right now. */
 label:string;
 children?:ReactNode;
 onSize?:(s:StageSize)=>void;
}&Omit<HTMLAttributes<HTMLCanvasElement>,'children'|'onResize'>;

export {fitGrid};

const PixelStage=forwardRef<StageApi,Props>(function PixelStage({min=[160,160],max,maxAt,maxHeight,render,bg='#000048',label,children,onSize,className,...rest},ref){
 const wrap=useRef<HTMLDivElement>(null),cv=useRef<HTMLCanvasElement>(null),pmRef=useRef<Pixmap|null>(null),pal=useRef(new Palette());
 const size=useRef<StageSize>({w:min[0],h:min[1],px:2}),img=useRef<ImageData|null>(null),queued=useRef(false),alive=useRef(true);
 const renderRef=useRef(render);renderRef.current=render;const bgRef=useRef(bg);bgRef.current=bg;const onSizeRef=useRef(onSize);onSizeRef.current=onSize;
 const maxW=max?.[0]??min[0],maxH=max?.[1]??min[1],minW=min[0],minH=min[1];
 const capKey=maxAt?JSON.stringify(maxAt):'',capRef=useRef(maxAt);capRef.current=maxAt;

 const draw=useCallback(()=>{queued.current=false;const c=cv.current;if(!c||!alive.current)return;const {w,h}=size.current;
  let pm=pmRef.current;if(!pm||pm.w!==w||pm.h!==h){pm=pmRef.current=new Pixmap(w,h,pal.current);img.current=null;}
  pm.clear(bgRef.current);renderRef.current(pm,size.current);
  const g=c.getContext('2d');if(!g)return;if(!img.current||img.current.width!==w||img.current.height!==h)img.current=g.createImageData(w,h);
  pm.toRGBA(new Uint32Array(img.current.data.buffer));g.putImageData(img.current,0,0);},[]);
 const invalidate=useCallback(()=>{if(queued.current)return;queued.current=true;queueMicrotask(draw);},[draw]);

 useLayoutEffect(()=>{const el=wrap.current,c=cv.current;if(!el||!c)return;alive.current=true;
  const fit=()=>{const availW=el.clientWidth||minW*2,availH=maxHeight??Math.max(minH*2,Math.round((typeof window!=='undefined'?window.innerHeight:800)*.62));
   let s=fitGrid(availW,availH,[minW,minH],[maxW,maxH]);const cap=capRef.current?.[s.px as 2|3|4];if(cap)s=fitGrid(availW,availH,[minW,minH],[Math.max(minW,cap[0]),Math.max(minH,cap[1])]);const o=size.current;
   if(s.w!==o.w||s.h!==o.h||s.px!==o.px||c.width!==s.w){size.current=s;c.width=s.w;c.height=s.h;c.style.width=`${s.w*s.px}px`;c.style.height=`${s.h*s.px}px`;
    el.dataset.px=String(s.px);el.dataset.buffer=`${s.w}x${s.h}`;onSizeRef.current?.(s);draw();}};
  fit();const ro=typeof ResizeObserver!=='undefined'?new ResizeObserver(fit):null;ro?.observe(el);
  return()=>{alive.current=false;ro?.disconnect();};},[minW,minH,maxW,maxH,maxHeight,capKey,draw]);
 useEffect(()=>{invalidate();},[render,bg,invalidate]);

 useImperativeHandle(ref,()=>({invalidate,draw,
  local(x:number,y:number){const c=cv.current;if(!c)return [0,0];const r=c.getBoundingClientRect(),px=size.current.px;return [(x-r.left)/px,(y-r.top)/px];},
  get size(){return size.current;},get pixmap(){return pmRef.current;},get canvas(){return cv.current;}}),[invalidate,draw]);

 return <div ref={wrap} className={styles.stage} data-pixel-stage>
  <canvas ref={cv} className={`${styles.canvas} ${className??''}`} role="img" aria-label={label} {...rest}/>
  {children}
 </div>;
});
export default PixelStage;
