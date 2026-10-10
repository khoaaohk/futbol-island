'use client';
import {useCallback,useEffect,useLayoutEffect,useRef,useState,type CSSProperties,type FocusEvent,type ReactNode} from 'react';
import {springEasing} from './timeline/wall';
import styles from './ExperienceStage.module.css';
/**
 * The museum's one doorway (Oct 9 2026; "the connective tissue that makes the museum feel like one coherent visit"). Every
 * exhibit is its own art style, so the way in and out is the same everywhere: a lacquer curtain in the gallery's colour springs
 * up, says where you are going (year, title, gallery, your passport stamp), the experience mounts behind it, and the curtain
 * lifts away once the experience is on screen. Leaving drops the curtain first, then hands over (onClose), and the hall fades
 * back in under ExperienceAfterglow. Going from one experience straight to another (timeline → exhibit, Back → timeline)
 * starts already covered, so the hall never flashes in between.
 *
 * Heat: one-shot Web Animations on transform/opacity only (spring easings sampled once by springEasing), a MutationObserver
 * that disconnects as soon as the experience appears, and timeouts; no rAF. Reduced motion: no curtain at all.
 */
export type StageInfo={id:string;year:string;title:string;gallery:string;color:string;
 /** The passport line on the curtain, e.g. "Stamp 3 of 12" or "New stamp!". */
 note?:string};
type Phase='in'|'hold'|'out'|'live'|'leave';
const reduced=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const UP=springEasing(210,24),LIFT=springEasing(150,22);
const TABBABLE='a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex]';

export default function ExperienceStage({info,covered=false,onClose,children}:{info:StageInfo;
 /** Start with the curtain already down (coming from another experience). */
 covered?:boolean;onClose:()=>void;children:(close:()=>void)=>ReactNode}){
 const [phase,setPhase]=useState<Phase>(()=>reduced()?'live':covered?'hold':'in');
 const veil=useRef<HTMLDivElement>(null),host=useRef<HTMLDivElement>(null),born=useRef(0),closing=useRef(false);
 const onCloseRef=useRef(onClose);onCloseRef.current=onClose;
 useLayoutEffect(()=>{born.current=performance.now();},[]);

 // 1. The curtain springs up from the bottom (skipped when it starts covered).
 // (Runs once on mount and is only cancelled on unmount, so the phase change below never cuts the spring short.)
 useEffect(()=>{const v=veil.current;if(!v)return;const fresh=!reduced()&&!covered;
  const a=fresh?v.animate([{transform:'translate3d(0,100%,0)'},{transform:'none'}],{duration:UP.ms,easing:UP.easing}):null;
  const ws=[...v.querySelectorAll<HTMLElement>('[data-stage-rise]')].map((el,i)=>el.animate([{transform:'translate3d(0,18px,0)',opacity:0},{transform:'none',opacity:1}],{duration:UP.ms,easing:UP.easing,delay:(fresh?90:0)+i*55,fill:'backwards'}));
  // The experience mounts once the curtain is most of the way up (its first paint happens behind it).
  const t=fresh?setTimeout(()=>setPhase(p=>p==='in'?'hold':p),Math.min(260,UP.ms*.6)):0;
  return()=>{clearTimeout(t);a?.cancel();ws.forEach(x=>x.cancel());};
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);

 // 2. Hold until the experience is on screen (it marks its root data-museum-experience), at least long enough to read the title.
 useEffect(()=>{if(phase!=='hold')return;const h=host.current;let done=false,min=0;
  const lift=()=>{if(done)return;done=true;obs.disconnect();const wait=Math.max(0,born.current+620-performance.now());min=window.setTimeout(()=>setPhase('out'),wait);};
  const obs=new MutationObserver(()=>{if(h?.querySelector('[data-museum-experience]'))lift();});
  if(h){obs.observe(h,{childList:true,subtree:true});if(h.querySelector('[data-museum-experience]'))lift();}
  const cap=window.setTimeout(lift,3200);// a slow chunk: lift anyway (the loading fallback is warm, not black)
  return()=>{obs.disconnect();clearTimeout(cap);clearTimeout(min);};},[phase]);

 // 3. The curtain lifts away upward, the exhibit underneath settling in from a slight scale.
 useEffect(()=>{if(phase!=='out')return;const v=veil.current;if(!v){setPhase('live');return;}
  const a=v.animate([{transform:'none'},{transform:'translate3d(0,-100%,0)'}],{duration:LIFT.ms,easing:LIFT.easing,fill:'forwards'});
  const exp=host.current?.querySelector<HTMLElement>('[data-museum-experience]');
  const b=exp?.animate([{transform:'scale(.985)',opacity:.6},{transform:'none',opacity:1}],{duration:LIFT.ms,easing:LIFT.easing});
  a.finished.then(()=>setPhase('live'),()=>{});
  return()=>{a.cancel();b?.cancel();};},[phase]);

 // Leaving: the curtain drops from the top, then the host takes over (and fades the hall in with ExperienceAfterglow).
 const close=useCallback(()=>{if(closing.current)return;closing.current=true;if(reduced()){onCloseRef.current();return;}setPhase('leave');},[]);
 useEffect(()=>{if(phase!=='leave')return;const v=veil.current;if(!v){onCloseRef.current();return;}
  const a=v.animate([{transform:'translate3d(0,-100%,0)'},{transform:'none'}],{duration:300,easing:'cubic-bezier(.3,0,.2,1)',fill:'forwards'});
  const go=()=>onCloseRef.current();a.finished.then(go,go);return()=>a.cancel();},[phase]);

 // Modal focus (Oct 9 2026 QA: Tab escaped into the hall behind an open exhibit). The host marks the hall's content inert while a
 // stage is up (MuseumRoom); here the stage is the dialog: focus lands on the experience's Back once the curtain lifts (after the
 // experience's own mount-time focus, so it isn't stolen back), and Tab / Shift+Tab wrap inside the stage (the guards below).
 const focused=useRef(false);
 useEffect(()=>{if(focused.current||(phase!=='out'&&phase!=='live'))return;const h=host.current;if(!h)return;let t=0;
  const go=()=>{const b=h.querySelector<HTMLElement>('[data-experience-back]');if(!b)return false;obs.disconnect();
   t=window.setTimeout(()=>{if(focused.current)return;focused.current=true;if(!document.querySelector('dialog:modal'))b.focus({preventScroll:true});},40);return true;};
  const obs=new MutationObserver(()=>{go();});
  if(!go())obs.observe(h,{childList:true,subtree:true});
  return()=>{obs.disconnect();clearTimeout(t);};},[phase]);
 // Focus guards first and last in the stage: Tab past the end (or Shift+Tab past the start) lands on one and is sent round to the
 // other end, so focus never reaches the browser chrome or the hall. A guard reached from outside (e.g. focus was on the page
 // body) goes the natural way instead.
 const tabbables=()=>{const h=host.current;return h?[...h.querySelectorAll<HTMLElement>(TABBABLE)].filter(n=>n.tabIndex>=0&&!n.hasAttribute('data-stage-guard')&&!n.closest('[inert],[aria-hidden="true"]')&&n.getClientRects().length>0):[];};
 const guard=(end:boolean)=>(e:FocusEvent<HTMLSpanElement>)=>{const from=e.relatedTarget as Node|null,inside=!!from&&!!host.current?.contains(from)&&!(from as HTMLElement).hasAttribute?.('data-stage-guard');
  const nodes=tabbables(),to=end===inside?nodes[0]:nodes[nodes.length-1];if(to)to.focus({preventScroll:true});else e.currentTarget.blur();};

 const mounted=phase!=='in';
 const showVeil=phase!=='live';
 return <div ref={host} className={styles.host} data-museum-stage={info.id} data-stage-phase={phase} role="dialog" aria-modal="true" aria-label={info.title}>
  <span tabIndex={0} className={styles.guard} data-stage-guard="start" onFocus={guard(false)}/>
  {mounted&&children(close)}
  {showVeil&&<div ref={veil} className={styles.veil} aria-hidden="true" data-stage-leave={phase==='leave'||undefined} style={{'--g':info.color} as CSSProperties}>
   <div className={styles.card}>
    <span className={styles.gallery} data-stage-rise><i/>{info.gallery}</span>
    <b className={styles.year} data-stage-rise>{info.year}</b>
    <span className={styles.title} data-stage-rise>{info.title}</span>
    {info.note&&<span className={styles.note} data-stage-rise>{info.note}</span>}
   </div>
  </div>}
  <span tabIndex={0} className={styles.guard} data-stage-guard="end" onFocus={guard(true)}/>
 </div>;
}

/** The hall fading back in after an experience closes (the curtain's colour, opacity only). Gone after one animation. */
export function ExperienceAfterglow({color,onDone}:{color:string;onDone:()=>void}){
 const ref=useRef<HTMLDivElement>(null),doneRef=useRef(onDone);doneRef.current=onDone;
 useEffect(()=>{const el=ref.current;if(!el||reduced()){doneRef.current();return;}
  const a=el.animate([{opacity:1},{opacity:0}],{duration:420,easing:'cubic-bezier(.2,0,.2,1)',fill:'forwards'});
  const go=()=>doneRef.current();a.finished.then(go,go);return()=>a.cancel();},[]);
 return <div ref={ref} className={styles.afterglow} aria-hidden="true" style={{'--g':color} as CSSProperties}/>;
}
