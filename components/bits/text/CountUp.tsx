'use client';
/**
 * CountUp. Adapted from React Bits "Count Up" / "Counter" by David Haz (https://reactbits.dev/text-animations/count-up).
 * MIT + Commons Clause, Copyright (c) 2026 David Haz: components/bits/LICENSE-react-bits.md, docs/third-party.md.
 *
 * Futbol Island: no motion/react. A bounded rAF tween that runs only for `duration` ms and stops (0 rAF at rest).
 *  - trigger 'change' (default, coins): the first value shows at once; later changes count from the shown number, with an
 *    optional pop (WAAPI scale on the compositor) when it goes up.
 *  - 'view' / 'mount' / 'manual' (museum stats): counts from `from` to `value` when triggered (410 → 595 g).
 *  - Reduced motion or a hidden tab: the new number at once. Tabular figures so the width does not jump.
 *  - Screen readers get the final value (an SR-only copy); a host that labels itself (the island wallet button) passes srText={false}.
 */
import {useEffect,useRef,useState,type ElementType} from 'react';
import {SR_ONLY,prefersReducedMotion,useOneShot,type Trigger} from '../motion';
import s from './text.module.css';

export type CountUpProps={value:number;from?:number;/** ms */duration?:number;trigger?:'change'|Trigger;play?:unknown;decimals?:number;
 format?:(n:number)=>string;as?:ElementType;className?:string;pop?:boolean;srText?:boolean;onDone?:()=>void};

export const easeOutCubic=(t:number)=>1-Math.pow(1-t,3);
/** The number shown at time t (ms) of a tween; exported for tests. */
export function countAt(from:number,to:number,t:number,duration:number,decimals=0){
 const p=duration<=0?1:Math.min(1,Math.max(0,t/duration)),v=from+(to-from)*easeOutCubic(p),f=10**decimals;return Math.round(v*f)/f;
}

export default function CountUp({value,from=0,duration=700,trigger='change',play,decimals=0,format,as:Tag='span',className='',pop=false,srText=true,onDone}:CountUpProps){
 const ref=useRef<HTMLElement>(null);
 const [shown,setShown]=useState(trigger==='change'?value:from);
 const shownRef=useRef(shown),raf=useRef(0),lastRun=useRef(0),done=useRef(onDone);done.current=onDone;
 const run=useOneShot(ref,{trigger:trigger==='change'?'manual':trigger,play:trigger==='change'?undefined:play});
 const started=trigger==='change'||run>0;
 useEffect(()=>()=>cancelAnimationFrame(raf.current),[]);
 useEffect(()=>{
  if(!started)return;
  // A replay (manual / view again) restarts from `from`.
  if(trigger!=='change'&&run>1&&run!==lastRun.current)shownRef.current=from;
  lastRun.current=run;
  const start=shownRef.current,el=ref.current;
  if(start===value)return;
  cancelAnimationFrame(raf.current);raf.current=0;
  const set=(n:number)=>{shownRef.current=n;setShown(n);};
  if(prefersReducedMotion()||document.hidden||duration<=0){set(value);done.current?.();return;}
  if(pop&&value>start&&el?.animate)el.animate([{transform:'scale(1)'},{transform:'scale(1.22)'},{transform:'scale(1)'}],{duration:420,easing:'cubic-bezier(.2,.8,.2,1)'});
  let t0=0;
  const frame=(t:number)=>{if(!t0)t0=t;const n=countAt(start,value,t-t0,duration,decimals);set(n);
   if(t-t0<duration)raf.current=requestAnimationFrame(frame);else{raf.current=0;set(value);done.current?.();}};
  raf.current=requestAnimationFrame(frame);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[value,started,run]);
 const text=format?format(shown):shown.toFixed(decimals);
 return <Tag ref={ref} className={`${s.count} ${className}`} data-counting={shown!==value||undefined}>
  {srText?<><span aria-hidden="true">{text}</span><span style={SR_ONLY}>{format?format(value):value.toFixed(decimals)}</span></>:text}
 </Tag>;
}
