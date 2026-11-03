'use client';
import {useEffect,useRef,useState} from 'react';
import s from './learn.module.css';

/**
 * "Play with friends", the one pinned feature chapter on /learn (Nov 3 2026, Apple-style restyle). Server-rendered with all three
 * steps and every picture in the HTML. On wide screens the picture column stays pinned (CSS position: sticky) while the three
 * steps scroll past; an IntersectionObserver on the steps (a thin band in the middle of the screen) picks the active step, and
 * the matching picture crossfades in (opacity only). No scroll listeners, no layout reads. On phones the steps are a calm list
 * under the picture and the picture fades through them on a timer (loops). JS off: step 1 and its picture show, every step's words are in the HTML.
 * `panelOf[i]` is the index of the picture for step i (steps without their own real shot share the chapter's shot).
 * Changing step fires `learn:panel` on the page root so LearnEnhance re-checks which clips may play (hidden panels never play).
 */
/** Hyphenated words ("grown-up", "6-character") never break at the hyphen (audit Nov 3: "grown- | up check" on phones). */
const noHyphenBreak=(t:string)=>t.split(/(\S+-\S+)/).map((x,i)=>i%2?<span key={i} className={s.nowrap}>{x}</span>:x);

export default function FriendSteps({steps,panels,panelOf,note}:{steps:string[];panels:React.ReactNode[];panelOf:number[];note?:string}){
 const [cur,setCur]=useState(0);
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const el=ref.current;if(!el)return;
  const items=[...el.querySelectorAll<HTMLElement>('[data-step]')];
  const phone=matchMedia('(max-width: 899px)');
  const io=new IntersectionObserver(es=>{if(phone.matches)return;for(const e of es)if(e.isIntersecting)setCur(Number((e.target as HTMLElement).dataset.step)||0);},{rootMargin:'-46% 0px -46% 0px'});
  items.forEach(i=>io.observe(i));
  // Phones (owner, Nov 3): the picture sits above the list, so scrolling can't pick the step; it fades through all the steps by itself,
  // 4.5 s each, and starts over. Only while the chapter is on screen and the tab is visible; calm mode keeps step 1.
  let timer=0,seen=false;
  const calm=()=>!!el.closest('[data-calm]')||matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stop=()=>{clearInterval(timer);timer=0;};
  const run=()=>{stop();if(!phone.matches||!seen||document.hidden||calm())return;timer=window.setInterval(()=>setCur(c=>(c+1)%items.length),4500);};
  const vis=new IntersectionObserver(es=>{seen=es[es.length-1].isIntersecting;run();},{threshold:.25});
  vis.observe(el);
  document.addEventListener('visibilitychange',run);phone.addEventListener('change',run);
  return ()=>{io.disconnect();vis.disconnect();stop();document.removeEventListener('visibilitychange',run);phone.removeEventListener('change',run);};
 },[]);
 useEffect(()=>{ref.current?.dispatchEvent(new CustomEvent('learn:panel',{bubbles:true}));},[cur]);
 const on=panelOf[cur]??0;
 return <div className={s.feature} ref={ref}>
  <div className={s.pin}>
   <div className={s.pinFrame}>
    {panels.map((p,i)=><div key={i} className={s.panel} data-panel="" data-on={i===on?'':undefined} aria-hidden={i===on?undefined:true}>{p}</div>)}
   </div>
  </div>
  <div className={s.stepCol}>
   <h3 className={s.stepsTitle} id="friend-steps">Play with a friend in 3 steps</h3>
   <ol className={s.stepList} aria-labelledby="friend-steps">
    {steps.map((line,i)=><li key={i} className={s.step} data-step={i} data-on={i===cur?'':undefined}>
     <span className={s.stepNum} aria-hidden="true">{i+1}</span><p className={s.stepLine}><span className={s.srOnly}>Step {i+1}: </span>{noHyphenBreak(line)}</p>
    </li>)}
   </ol>
   {note&&<p className={s.note}>{note}</p>}
  </div>
 </div>;
}
