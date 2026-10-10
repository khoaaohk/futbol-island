'use client';
/**
 * The goal-met moment (docs/idp/DESIGN.md §2.5): one orchestrated sequence of about two seconds, then the choice of what's next.
 *   0.00 s  the paper dims in
 *   0.10 s  the badge springs up from below (spring linear() easing)
 *   0.35 s  the ring closes, piece by piece, all the way round
 *   0.90 s  ten sparks burst once from the badge (no confetti rain, no loop)
 *   1.05 s  the "I can…" line stamps in
 *   1.60 s  the next-step buttons arrive
 * Every animation is a finite CSS keyframe; nothing loops and nothing waits on a timer. Reduced motion shows the final frame.
 */
import {useEffect,useRef,type CSSProperties} from 'react';
import type {IdpGoal} from '@/lib/coaches/idp';
import {RING_PIECES} from '@/lib/coaches/idp/journey';
import {SKILLS} from '@/lib/coaches/idp/skills';
import {prefersReducedMotion} from '@/lib/coaches/idp/motion';
import {GrowthRing} from './Art';
import s from './Idp.module.css';

export default function Celebrate({goal,pieces,onDone}:{goal:IdpGoal;pieces:number;onDone:(next:'choose'|'later')=>void}){
 const first=useRef<HTMLButtonElement>(null);
 // Focus moves to the first action once it has arrived (the sequence is visual; the status line announces it at once).
 useEffect(()=>{const el=first.current;if(!el)return;const f=()=>el.focus({preventScroll:true});if(prefersReducedMotion()){f();return;}el.addEventListener('animationend',f,{once:true});return()=>el.removeEventListener('animationend',f);},[]);
 return <div className={s.celebrate} role="dialog" aria-modal="true" aria-labelledby="idp-celebrate-title" data-celebrate>
  <div className={s.celebrateCard}>
   <div className={s.celebrateBadge}>
    <GrowthRing skill={goal.skill} pieces={RING_PIECES} from={Math.min(pieces,RING_PIECES)} grow size={168} label={`${goal.ican}: goal met`}/>
    <span className={s.sparks} aria-hidden="true">{Array.from({length:10},(_,i)=><i key={i} style={{'--a':`${i*36+8}deg`,'--d':`${56+(i%3)*14}px`,'--c':['#f9d665','#ed9dce','#beded1','#cfe3f2','#fff2cd'][i%5]} as CSSProperties}/>)}</span>
   </div>
   <p className={s.celebrateKicker}>You did it!</p>
   <h3 id="idp-celebrate-title" className={s.celebrateIcan}>“{goal.ican}”</h3>
   <p className={s.celebrateLine} role="status">This goes on your shelf of things you can do now. {SKILLS[goal.skill].kid} is yours.</p>
   <div className={s.celebrateActions}>
    <button ref={first} type="button" className={s.primary} data-celebrate-next onClick={()=>onDone('choose')}>Choose my next goal</button>
    <button type="button" className={s.ghost} onClick={()=>onDone('later')}>Later</button>
   </div>
  </div>
 </div>;
}
