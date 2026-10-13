'use client';
import {useCallback,useEffect,useRef,type ReactNode} from 'react';
import m from './modern.module.css';
import p from './pieces.module.css';
/**
 * The gallery ending (docs/museum-modern-style.md): the exhibit's accent shape completes (pass `art`, drawn with the shared
 * draw-on / spring classes), a "You've seen …" line, the take-it-to-your-game sentence, and a quiet "Visited" mark.
 *
 * `onComplete` (the museum passport turns the stamp gold) runs ONCE, and only when the ending is really reached (Oct 10 2026):
 *  - `reached`: the exhibit says its end condition is met (its quick check is done) → at once;
 *  - otherwise when the ending scrolls into view (IntersectionObserver, 40% visible). An exhibit that keeps every section
 *    mounted while the kid scrolls therefore never awards the gold stamp before the kid gets here.
 * Heat: one observer, disconnected after it fires or on unmount; no timers.
 */
export default function Ending({art,seen,take,onComplete,reached=false}:{art:ReactNode;seen:ReactNode;take:ReactNode;onComplete?:()=>void;reached?:boolean}){
 const once=useRef(false),cb=useRef(onComplete),root=useRef<HTMLElement>(null);cb.current=onComplete;
 const fire=useCallback(()=>{if(once.current)return;once.current=true;cb.current?.();},[]);
 useEffect(()=>{
  if(reached){fire();return;}
  const el=root.current;
  if(!el||typeof IntersectionObserver==='undefined'){fire();return;}
  const io=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){io.disconnect();fire();}},{threshold:.4});
  io.observe(el);return()=>io.disconnect();
 },[reached,fire]);
 return <section ref={root} className={p.ending} data-museum-ending aria-label="Exhibit complete">
  <div className={p.endArt} aria-hidden="true">{art}</div>
  <div className={p.endText}>
   <span className={m.visited}><i/>Visited</span>
   <p className={p.seen}>{seen}</p>
   <p className={p.take}><b>Take it to your game:</b> {take}</p>
  </div>
 </section>;
}
