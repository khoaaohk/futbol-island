'use client';
import {useCallback,useEffect,useMemo,useRef,type KeyboardEvent as RKeyboardEvent,type MouseEvent as RMouseEvent,type PointerEvent as RPointerEvent,type RefObject} from 'react';
import {useReduced} from '../modern/hooks';
import {createPlayLoop,type PlayLoop,type Tick} from './loop';
import type {StageApi} from './Stage';

/**
 * pixeliso · input and loop hooks (Oct 10 2026): drag, tap, hold-to-charge, keys, the sleep-aware loop and a live readout.
 * Every handler works in BUFFER pixels (the art grid), so a scene's maths never sees CSS pixels or the device ratio.
 */
export {useReduced};

/**
 * The play loop as a hook: created once, observed by an IntersectionObserver on `el` (asleep off-screen), switched to the
 * instant (reduced-motion) mode live, disposed on unmount. The tick reads the latest closure.
 */
export function usePlayLoop(tick:Tick,{el,fps=60}:{el?:RefObject<Element|null>;fps?:number}={}):PlayLoop{
 const reduced=useReduced(),latest=useRef(tick);latest.current=tick;const red=useRef(reduced);red.current=reduced;
 const cur=useRef<PlayLoop|null>(null);
 // Created in an effect (not useMemo) so React's dev double-mount gets a fresh loop after the first one is disposed.
 useEffect(()=>{const l=createPlayLoop((dt,now)=>latest.current(dt,now),{fps,reduced:red.current});cur.current=l;const un=l.observe(el?.current??null);
  return()=>{un();l.dispose();if(cur.current===l)cur.current=null;};},[fps,el]);
 useEffect(()=>{cur.current?.setReduced(reduced);},[reduced]);
 return useMemo(()=>proxy(cur),[]);
}
/** A stable PlayLoop handle that forwards to whichever loop is alive (none after unmount: every call is a no-op). */
function proxy(cur:{current:PlayLoop|null}):PlayLoop{
 return {wake:()=>cur.current?.wake(),stop:()=>cur.current?.stop(),setVisible:v=>cur.current?.setVisible(v),setReduced:r=>cur.current?.setReduced(r),
  observe:el=>cur.current?.observe(el)??(()=>{}),dispose:()=>cur.current?.dispose(),
  get running(){return !!cur.current?.running;},get frames(){return cur.current?.frames??0;},get asleep(){return cur.current?.asleep??true;}};
}

export type DragPoint={x:number;y:number;/** velocity, buffer px / s */vx:number;vy:number;/** total drag from the start */dx:number;dy:number;t:number};
/**
 * Drag on the stage (pointer capture, touch-action: none on the canvas). onStart returns false to refuse (e.g. not on the
 * ball). Velocity is smoothed for flicks; a long pause before release zeroes it.
 */
export function useDrag(stage:RefObject<StageApi|null>,h:{onStart?:(p:DragPoint)=>boolean|void;onMove?:(p:DragPoint)=>void;onEnd?:(p:DragPoint,cancelled:boolean)=>void;disabled?:boolean}){
 const cur=useRef<{id:number;x0:number;y0:number;p:DragPoint}|null>(null),H=useRef(h);H.current=h;
 const at=(e:RPointerEvent)=>stage.current?.local(e.clientX,e.clientY)??[0,0];
 const onPointerDown=useCallback((e:RPointerEvent<Element>)=>{if(H.current.disabled||cur.current||e.button>0)return;const [x,y]=at(e);
  const p:DragPoint={x,y,vx:0,vy:0,dx:0,dy:0,t:e.timeStamp};if(H.current.onStart?.(p)===false)return;
  cur.current={id:e.pointerId,x0:x,y0:y,p};try{e.currentTarget.setPointerCapture(e.pointerId);}catch{/* not capturable */}},[]);// eslint-disable-line react-hooks/exhaustive-deps
 const onPointerMove=useCallback((e:RPointerEvent<Element>)=>{const c=cur.current;if(!c||c.id!==e.pointerId)return;const [x,y]=at(e),dt=Math.max(.008,(e.timeStamp-c.p.t)/1000);
  c.p={x,y,vx:c.p.vx*.6+(x-c.p.x)/dt*.4,vy:c.p.vy*.6+(y-c.p.y)/dt*.4,dx:x-c.x0,dy:y-c.y0,t:e.timeStamp};H.current.onMove?.(c.p);},[]);// eslint-disable-line react-hooks/exhaustive-deps
 const end=useCallback((e:RPointerEvent<Element>)=>{const c=cur.current;if(!c||c.id!==e.pointerId)return;cur.current=null;
  const p=e.timeStamp-c.p.t>90?{...c.p,vx:0,vy:0}:c.p;H.current.onEnd?.(p,e.type==='pointercancel');},[]);
 return {onPointerDown,onPointerMove,onPointerUp:end,onPointerCancel:end};
}

/** Tap a part of the scene: the picked part id (Scene.pick through the stage's pick buffer, with finger slop). */
export function useTap(stage:RefObject<StageApi|null>,pick:(x:number,y:number,slop:number)=>string|null,onTap:(id:string|null,x:number,y:number)=>void){
 const down=useRef<{x:number;y:number;id:number}|null>(null),T=useRef(onTap);T.current=onTap;
 return {
  onPointerDown:(e:RPointerEvent<Element>)=>{down.current={x:e.clientX,y:e.clientY,id:e.pointerId};},
  onPointerUp:(e:RPointerEvent<Element>)=>{const d=down.current;down.current=null;if(!d||d.id!==e.pointerId||Math.hypot(e.clientX-d.x,e.clientY-d.y)>12)return;
   const s=stage.current;if(!s)return;const [x,y]=s.local(e.clientX,e.clientY),slop=Math.round((e.pointerType==='mouse'?6:22)/s.size.px);T.current(pick(x,y,slop),x,y);},
 };
}

/**
 * Hold to charge (the penalty cabinet's Shoot button): a press shorter than tapMs is a tap; past it the charge climbs 0 → 1
 * over chargeS seconds, onCharge(c) each frame; release fires onRelease(charge, wasTap). The charge loop runs only while held.
 * Reduced motion: no charging, every press is a tap. Keyboard Enter/Space (detail 0 click) = a tap.
 */
export function useHold({onCharge,onRelease,tapMs=170,chargeS=1.15,disabled}:{onCharge?:(c:number)=>void;onRelease:(c:number,tap:boolean)=>void;tapMs?:number;chargeS?:number;disabled?:boolean}){
 const reduced=useReduced(),held=useRef<{t0:number;id:number;c:number}|null>(null),C=useRef(onCharge),Rl=useRef(onRelease);C.current=onCharge;Rl.current=onRelease;
 const cur=useRef<PlayLoop|null>(null);
 useEffect(()=>{const l=createPlayLoop(()=>{const h=held.current;if(!h)return false;const ms=performance.now()-h.t0;
  if(ms>tapMs){h.c=Math.min(1,(ms-tapMs)/1000/chargeS);C.current?.(h.c);}return true;});cur.current=l;return()=>{l.dispose();if(cur.current===l)cur.current=null;};},[tapMs,chargeS]);
 const loop=useMemo(()=>proxy(cur),[]);
 const onPointerDown=(e:RPointerEvent<HTMLElement>)=>{if(disabled||e.button>0||held.current)return;held.current={t0:performance.now(),id:e.pointerId,c:0};
  try{e.currentTarget.setPointerCapture(e.pointerId);}catch{/* fine */}if(!reduced)loop.wake();};
 const finish=(e:RPointerEvent<HTMLElement>)=>{const h=held.current;if(!h||h.id!==e.pointerId)return;held.current=null;loop.stop();C.current?.(0);
  if(e.type==='pointerup'&&!disabled){const tap=reduced||performance.now()-h.t0<=tapMs;Rl.current(tap?0:h.c,tap);}};
 const onClick=(e:RMouseEvent<HTMLElement>)=>{if(e.detail===0&&!disabled)Rl.current(0,true);};
 return {onPointerDown,onPointerUp:finish,onPointerCancel:finish,onClick,onContextMenu:(e:RMouseEvent)=>e.preventDefault()};
}

export type KeyMap=Partial<Record<'left'|'right'|'up'|'down'|'action'|'escape',(e:RKeyboardEvent,fine:boolean)=>void>>;
/** Arrows / WASD, Enter + Space (action, not when a button has focus: it clicks itself), Escape. Shift = fine steps. */
export function useKeys(map:KeyMap){const M=useRef(map);M.current=map;
 return useCallback((e:RKeyboardEvent)=>{const k=e.key,fine=e.shiftKey;
  const name=k==='ArrowLeft'||k==='a'?'left':k==='ArrowRight'||k==='d'?'right':k==='ArrowUp'||k==='w'?'up':k==='ArrowDown'||k==='s'?'down':k==='Escape'?'escape':(k==='Enter'||k===' ')&&!(e.target instanceof HTMLButtonElement)?'action':null;
  const f=name&&M.current[name];if(!f)return;if(name!=='escape')e.preventDefault();f(e,fine);},[]);}

/** A live readout written straight to the DOM (no re-render per frame). */
export function useReadout<T extends HTMLElement=HTMLElement>(){const ref=useRef<T>(null),said=useRef('');
 const say=useCallback((text:string)=>{if(text===said.current)return;said.current=text;if(ref.current)ref.current.textContent=text;},[]);return {ref,say};}
