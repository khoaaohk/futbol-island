'use client';
import {useEffect,useRef,useState} from 'react';
import s from './learn.module.css';

/**
 * "Play with a friend in 3 steps" (Nov 2 2026). Server-rendered with all three steps and pictures in the HTML (the unselected
 * pictures carry `hidden`). When the strip first comes into view the three steps light up one after another (CSS, `data-lit`,
 * time-based, once); then the viewer picks a step or uses Back / Next. No timers keep running after that.
 */
export default function FriendStepper({steps,panels}:{steps:string[];panels:React.ReactNode[]}){
 const [cur,setCur]=useState(0);
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const el=ref.current;if(!el)return;
  const io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){el.setAttribute('data-lit','');io.disconnect();}},{threshold:.4});
  io.observe(el);return ()=>io.disconnect();
 },[]);
 const n=steps.length;
 return <div className={s.stepper} ref={ref}>
  <ol className={s.steps}>
   {steps.map((line,i)=><li key={i} className={s.step} style={{'--i':i} as React.CSSProperties}>
    <button type="button" className={s.stepBtn} aria-current={cur===i?'step':undefined} aria-controls={`friend-step-${i}`} onClick={()=>setCur(i)}>
     <span className={s.stepNum} aria-hidden="true">{i+1}</span><span className={s.stepLine}><span className={s.srOnly}>Step {i+1}: </span>{line}</span>
    </button>
   </li>)}
  </ol>
  <div className={s.stepPanels}>
   {panels.map((p,i)=><div key={i} id={`friend-step-${i}`} className={s.stepPanel} hidden={cur!==i}>{p}</div>)}
   <div className={s.stepNav}>
    <button type="button" className={s.ghostBtn} onClick={()=>setCur((cur+n-1)%n)} aria-label="Previous step">Back</button>
    <span className={s.stepCount} aria-live="polite">Step {cur+1} of {n}</span>
    <button type="button" className={s.ghostBtn} onClick={()=>setCur((cur+1)%n)} aria-label="Next step">Next</button>
   </div>
  </div>
 </div>;
}
