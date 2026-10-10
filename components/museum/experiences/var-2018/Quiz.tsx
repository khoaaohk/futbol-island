'use client';
import {useEffect,useRef,useState} from 'react';
import {museumSfx,unlockMuseumAudio} from '@/lib/museum/museumSound';
import {FLIP_SPRING,springEasing} from './motion';
import {QUIZ} from './content';
import styles from './var.module.css';

/**
 * var-2018 · "Quick check" (Oct 9 2026): the last job in the VAR room. Four questions, one per idea the room taught (who decides,
 * what VAR may check, the whole ball over the whole line, arms don't count), drawn as a blueprint test card. A right answer
 * locks in green; a wrong one gives a hint and you go again. On the last one the host stamps the monitor (onDone) with the score.
 *
 * Motion: each card arrives on the room's FLIP spring (sampled linear(), WAAPI, finite); a wrong answer uses the chips' CSS nudge.
 * Nothing runs at rest. Reduced motion: no movement.
 */
const reduced=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion:reduce)').matches;
export default function Quiz({onDone}:{onDone:(score:number,of:number)=>void}){
 const [i,setI]=useState(0),[picked,setPicked]=useState<number|null>(null),[missed,setMissed]=useState<number[]>([]);
 const [score,setScore]=useState(0),[done,setDone]=useState(false);
 const card=useRef<HTMLDivElement>(null),first=useRef(true);
 const Q=QUIZ[i],right=picked===Q.answer;
 useEffect(()=>{if(first.current){first.current=false;return;}const el=card.current;if(!el||reduced()||typeof el.animate!=='function')return;
  const e=springEasing(FLIP_SPRING),ok=typeof CSS!=='undefined'&&CSS.supports?.('animation-timing-function','linear(0, 1)');
  try{el.animate([{transform:'translateY(16px) scale(.97)',opacity:0},{opacity:1,offset:.35},{transform:'none',opacity:1}],{duration:ok?e.duration:360,easing:ok?e.easing:'cubic-bezier(.2,.9,.3,1.1)'});}catch{}},[i,done]);
 const pick=(k:number)=>{unlockMuseumAudio();if(right)return;setPicked(k);
  if(k===Q.answer){if(!missed.length)setScore(s=>s+1);museumSfx.reveal();return;}
  if(!missed.includes(k))setMissed(m=>[...m,k]);museumSfx.card();};
 const next=()=>{if(i<QUIZ.length-1){setI(i+1);setPicked(null);setMissed([]);museumSfx.tick();}else{setDone(true);museumSfx.whistle();onDone(score,QUIZ.length);}};
 const again=()=>{setI(0);setPicked(null);setMissed([]);setScore(0);setDone(false);};

 if(done)return <div ref={card} className={styles.quiz} data-done data-feedback>
  <p className={styles.eyebrow}>Quick check · complete</p>
  <p className={styles.quizBig}>{score}/{QUIZ.length} right first time</p>
  <p>{score===QUIZ.length?'Perfect. You’d be welcome in any VAR room.':'Good work. Every VAR checks twice, so try once more?'}</p>
  <button type="button" className={styles.secondary} onClick={again}>Take the check again</button>
 </div>;
 return <div ref={card} className={styles.quiz} role="group" aria-labelledby="var-quiz-q" data-feedback>
  <p className={styles.eyebrow}>Quick check · {i+1}/{QUIZ.length}</p>
  <p id="var-quiz-q" className={styles.lead}>{Q.q}</p>
  <div className={styles.quizOpts}>
   {Q.options.map((o,k)=>{const st=right&&k===Q.answer?'right':missed.includes(k)?'wrong':undefined;
    return <button key={o} type="button" className={styles.quizOpt} data-state={st} disabled={right&&k!==Q.answer} data-museum-own-cue onClick={()=>pick(k)}>
     <span>{o}</span>{st&&<em>{st==='right'?'✓ Correct':'✗ Look again'}</em>}</button>;})}
  </div>
  <p className={styles.quizWhy} aria-live="polite" data-state={right?'right':picked!=null?'wrong':undefined}>{right?Q.why:picked!=null?Q.hint:null}</p>
  {right&&<button type="button" className={styles.primary} onClick={next}>{i<QUIZ.length-1?'Next question':'Finish the shift'}</button>}
 </div>;
}
