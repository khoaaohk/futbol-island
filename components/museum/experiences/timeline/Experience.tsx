'use client';
import {useCallback,useEffect,useMemo,useRef,useState,type CSSProperties,type KeyboardEvent as ReactKeyboardEvent,type PointerEvent as ReactPointerEvent} from 'react';
import {Padlock} from '@lucasmarkes/hairline/react';
import ExperienceBack from '../ExperienceBack';
import type {ExperienceProps} from '../types';
import {exhibitState,galleryOf} from '@/lib/endgame/museum';
import {useMuseumCounts} from '@/lib/museum/useMuseumCounts';
import {museumSfx} from '@/lib/museum/museumSound';
import FigureSlot from './FigureSlot';
import {eras} from './eras';
import styles from './Experience.module.css';

/**
 * The timeline wall, stepped inside (Oct 5 2026; user: a full-screen Museum timeline built with hairline,
 * https://github.com/lucasmarkes/hairline). Every case in the museum is an era on one wall, oldest first (timelineOrder()). Each
 * era is an isometric hairline figure on its plate: the active one rises and answers the finger, its neighbours recede, and the
 * case's own year, title and one quoted fact arrive underneath. Scrub the year rule (drag, keys, or swipe the wall on a phone);
 * "Visit this case" closes the wall and takes the hall to that case (props.onVisit; without it, Back).
 *
 * Heat: SVG only (no canvas, so no DPR cost; strokes are non-scaling). Figures share ONE rAF loop that runs only while a spring
 * moves and stops at rest (hairline/engine.ts); only the active era and its two neighbours have figures, and a figure is
 * destroyed when it leaves that window. No timers run at rest; motion is finite CSS; reduced motion lands everything at once.
 */
export default function Experience({exhibit,onClose,onVisit}:ExperienceProps){
 const list=useMemo(()=>eras(),[]),n=list.length;
 const [idx,setIdx]=useState(()=>Math.max(0,list.findIndex(e=>e.exhibit.id===exhibit.id)));
 const [dir,setDir]=useState(1);
 const counts=useMuseumCounts();
 const era=list[idx],e=era.exhibit,state=counts.ready?exhibitState(e,counts):null,g=galleryOf(e.gallery);
 const idxRef=useRef(idx);idxRef.current=idx;
 const go=useCallback((to:number)=>{const cur=idxRef.current,next=Math.max(0,Math.min(n-1,to));if(next===cur)return;idxRef.current=next;setDir(next>cur?1:-1);setIdx(next);museumSfx.tick();},[n]);
 const step=useCallback((d:number)=>go(idxRef.current+d),[go]);

 // Keys anywhere: Escape leaves; arrows walk the wall (the scrubber handles its own).
 useEffect(()=>{const key=(ev:KeyboardEvent)=>{if(ev.key==='Escape'){ev.preventDefault();onClose();return;}
   const t=ev.target as HTMLElement|null;if(t?.closest?.('[role="slider"]'))return;
   if(ev.key==='ArrowLeft'){ev.preventDefault();step(-1);}else if(ev.key==='ArrowRight'){ev.preventDefault();step(1);}};
  window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[onClose,step]);

 // Swipe the wall (phones): a quick horizontal flick changes era; slower moves are the figure answering the finger.
 const swipe=useRef<{x:number;y:number;t:number}|null>(null),swiped=useRef(false);
 const onDown=(ev:ReactPointerEvent)=>{swipe.current={x:ev.clientX,y:ev.clientY,t:performance.now()};swiped.current=false;};
 const onUp=(ev:ReactPointerEvent)=>{const s=swipe.current;swipe.current=null;if(!s)return;const dx=ev.clientX-s.x,dy=ev.clientY-s.y,dt=performance.now()-s.t;
  if(Math.abs(dx)>48&&Math.abs(dx)>Math.abs(dy)*1.4&&dt<650){swiped.current=true;step(dx<0?1:-1);}};

 // The scrubber: pointer-captured drag picks the nearest year as you go; keys step; the thumb glides between ticks.
 const track=useRef<HTMLDivElement>(null),thumb=useRef<HTMLSpanElement>(null),drag=useRef<{id:number;rect:DOMRect}|null>(null);
 const frac=(x:number,r:DOMRect)=>Math.max(0,Math.min(1,(x-r.left)/r.width));
 const place=(f:number|null)=>{const t=thumb.current;if(!t)return;t.style.left=f===null?'':`${(f*100).toFixed(2)}%`;t.dataset.drag=f===null?'':'1';};
 const scrubDown=(ev:ReactPointerEvent<HTMLDivElement>)=>{const r=track.current?.getBoundingClientRect();if(!r)return;ev.currentTarget.setPointerCapture(ev.pointerId);drag.current={id:ev.pointerId,rect:r};
  const f=frac(ev.clientX,r);place(f);go(Math.round(f*(n-1)));};
 const scrubMove=(ev:ReactPointerEvent<HTMLDivElement>)=>{const d=drag.current;if(!d||d.id!==ev.pointerId)return;const f=frac(ev.clientX,d.rect);place(f);go(Math.round(f*(n-1)));};
 const scrubEnd=(ev:ReactPointerEvent<HTMLDivElement>)=>{const d=drag.current;if(!d||d.id!==ev.pointerId)return;drag.current=null;place(null);};
 const scrubKey=(ev:ReactKeyboardEvent)=>{const k=ev.key,m:Record<string,number>={ArrowLeft:-1,ArrowDown:-1,ArrowRight:1,ArrowUp:1,PageDown:-3,PageUp:3};
  if(k in m){ev.preventDefault();step(m[k]);}else if(k==='Home'){ev.preventDefault();go(0);}else if(k==='End'){ev.preventDefault();go(n-1);}};

 const visit=()=>{museumSfx.look();if(onVisit)onVisit(e.id);else onClose();};
 const words=era.fact.split(/\s+/);
 const lockLine=state&&!state.open?state.lockText:'';

 return <div className={styles.root} data-museum-experience="timeline" role="dialog" aria-modal="true" aria-label="The story of football: the timeline wall">
  <ExperienceBack onClose={onClose}/>
  <header className={styles.head}>
   <span className={styles.eyebrow}>Timeline wall</span>
   <h1 className={styles.title}>The story of football</h1>
  </header>

  <div className={styles.stage} onPointerDown={onDown} onPointerUp={onUp} onPointerCancel={()=>{swipe.current=null;}}>
   {list.map((x,i)=>{const off=i-idx;if(Math.abs(off)>2)return null;
    return <FigureSlot key={x.exhibit.id} def={x.figure} offset={off} live={Math.abs(off)<=1} active={off===0} label={`${x.exhibit.year}: ${x.figure.label}`}/>;})}
   {idx>0&&<button type="button" className={`${styles.peek} ${styles.peekPrev}`} data-tl-peek="prev" aria-label={`Earlier: ${list[idx-1].exhibit.year}, ${list[idx-1].exhibit.title}`}
    onClick={()=>{if(!swiped.current)step(-1);}}/>}
   {idx<n-1&&<button type="button" className={`${styles.peek} ${styles.peekNext}`} data-tl-peek="next" aria-label={`Later: ${list[idx+1].exhibit.year}, ${list[idx+1].exhibit.title}`}
    onClick={()=>{if(!swiped.current)step(1);}}/>}
  </div>

  <section className={styles.cap} key={e.id} data-dir={dir>0?'next':'prev'} data-tl-era={e.id} aria-live="polite" style={{'--g':g.art} as CSSProperties}>
   <p className={styles.meta}><span className={styles.gallery}><i aria-hidden="true"/>{g.title}</span><span className={styles.count}>{idx+1} / {n}</span></p>
   <p className={styles.year} data-tl-year>{e.year}</p>
   <h2 className={styles.caseTitle}>{e.title}</h2>
   <p className={styles.fact} data-tl-fact>
    <span className={styles.srOnly}>{era.fact}</span>
    <span aria-hidden="true">{words.map((w,i)=><span key={i} className={styles.word} style={{'--i':Math.min(i,16)} as CSSProperties}>{w} </span>)}</span>
   </p>
   <div className={styles.actions}>
    <button type="button" className={styles.visit} data-tl-visit={e.id} onClick={visit}>Visit this case<span aria-hidden="true" className={styles.arrow}/></button>
    {lockLine&&<div className={styles.lock} data-tl-lock={e.id}><Padlock className={styles.padlock} theme="dark" intensity={.6} label="Locked case"/><span>{lockLine}</span></div>}
   </div>
  </section>

  <nav className={styles.scrub} aria-label="Years">
   <button type="button" className={styles.stepBtn} data-tl-step="prev" aria-label="Earlier era" disabled={idx===0} onClick={()=>step(-1)}><span aria-hidden="true" className={styles.chev}/></button>
   <div ref={track} className={styles.track} role="slider" tabIndex={0} aria-label="Timeline" aria-valuemin={0} aria-valuemax={n-1} aria-valuenow={idx}
    aria-valuetext={`${e.year}: ${e.title}`} data-tl-scrubber onKeyDown={scrubKey} onPointerDown={scrubDown} onPointerMove={scrubMove} onPointerUp={scrubEnd} onPointerCancel={scrubEnd} onLostPointerCapture={scrubEnd}>
    <span className={styles.rail} aria-hidden="true"><span className={styles.fill} style={{'--x':idx/(n-1)} as CSSProperties}/></span>
    {list.map((x,i)=><span key={x.exhibit.id} aria-hidden="true" className={styles.tick} data-on={i===idx||undefined} data-end={i===0?'first':i===n-1?'last':undefined} style={{'--x':i/(n-1)} as CSSProperties}>
     <i/><b>{x.tick}</b></span>)}
    <span ref={thumb} aria-hidden="true" className={styles.thumb} style={{'--x':idx/(n-1)} as CSSProperties}/>
   </div>
   <button type="button" className={styles.stepBtn} data-tl-step="next" aria-label="Later era" disabled={idx===n-1} onClick={()=>step(1)}><span aria-hidden="true" className={`${styles.chev} ${styles.chevNext}`}/></button>
  </nav>
 </div>;
}
