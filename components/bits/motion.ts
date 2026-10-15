'use client';
/**
 * Shared motion rules for components/bits (React Bits adaptations, docs/third-party.md):
 *  - 0 requestAnimationFrame at rest: loops run only while something is moving and stop when it settles.
 *  - One-shots start from an IntersectionObserver (once), on mount, or from an event (a changing `play` key).
 *  - prefers-reduced-motion shows the final state straight away.
 */
import {useEffect,useRef,useState,type CSSProperties,type RefObject} from 'react';

export const REDUCED_QUERY='(prefers-reduced-motion: reduce)';
export const prefersReducedMotion=()=>typeof window!=='undefined'&&!!window.matchMedia?.(REDUCED_QUERY).matches;

/** Live prefers-reduced-motion (false on the server and in the first client render). */
export function useReducedMotion(){
 const [reduced,setReduced]=useState(false);
 useEffect(()=>{const m=window.matchMedia?.(REDUCED_QUERY);if(!m)return;const on=()=>setReduced(m.matches);on();
  m.addEventListener?.('change',on);return()=>m.removeEventListener?.('change',on);},[]);
 return reduced;
}

export type Trigger='view'|'mount'|'manual';
export type OneShotOptions={trigger?:Trigger;/** Replays when it changes (manual: plays when it becomes truthy or changes). */play?:unknown;rootMargin?:string;threshold?:number};

/**
 * How many times a one-shot should have played. 0 = waiting. It increments on the first intersection (view), on mount (mount),
 * or when `play` changes (manual; or a replay after the first view). The observer disconnects after the first hit.
 */
export function useOneShot(ref:RefObject<Element>,{trigger='view',play,rootMargin='0px 0px -8% 0px',threshold=0.15}:OneShotOptions={}){
 const [run,setRun]=useState(0),started=useRef(false),firstKey=useRef(true);
 useEffect(()=>{
  if(trigger==='mount'){started.current=true;setRun(r=>r+1);return;}
  if(trigger!=='view')return;
  const el=ref.current;if(!el)return;
  if(typeof IntersectionObserver==='undefined'){started.current=true;setRun(r=>r+1);return;}
  const io=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){io.disconnect();started.current=true;setRun(r=>r+1);}},{rootMargin,threshold});
  io.observe(el);return()=>io.disconnect();
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[trigger]);
 useEffect(()=>{
  if(firstKey.current){firstKey.current=false;if(trigger==='manual'&&play!==undefined&&play!==null&&play!==false&&play!==0){started.current=true;setRun(r=>r+1);}return;}
  if(trigger==='manual'?(play!==undefined&&play!==null&&play!==false):started.current){started.current=true;setRun(r=>r+1);}
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[play]);
 return run;
}

/** A visually hidden copy of the real words, so screen readers never read scrambled or half-typed text. */
export const SR_ONLY:CSSProperties={position:'absolute',width:1,height:1,padding:0,margin:-1,overflow:'hidden',clip:'rect(0 0 0 0)',whiteSpace:'nowrap',border:0};

/** Cancel-safe timer chain (setTimeout, not rAF) for bounded text sequences. */
export function useTimers(){
 const ids=useRef<number[]>([]);
 const api=useRef({
  after(ms:number,fn:()=>void){const id=window.setTimeout(()=>{ids.current=ids.current.filter(x=>x!==id);fn();},ms);ids.current.push(id);return id;},
  clear(){ids.current.forEach(id=>clearTimeout(id));ids.current=[];},
 }).current;
 useEffect(()=>()=>api.clear(),[api]);
 return api;
}
