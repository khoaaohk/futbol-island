'use client';
import {useEffect,useRef,useState} from 'react';
import {museumSfx,unlockMuseumAudio} from '@/lib/museum/museumSound';
import styles from './Experience.module.css';
import {springSamples} from './spring';

/**
 * backpass-1992 · "Ref's call" (Oct 9 2026): the quick check at the end of the tape. Four calls, one at a time, read off the VCR's
 * green display like a quiz on late-night TV: the kicked back-pass, the headed one (allowed: the law is about kicks), the WHY
 * (time-wasting) and the 1997 throw-in add-on. A right call lights green; a wrong one shows a hint and you call again. The payoff
 * is a "● REC · TAPE SAVED" card with the score.
 *
 * Motion: each call slides in on a sampled spring (WAAPI, finite), a wrong call jolts sideways like a tracking glitch. No loop and
 * nothing at rest. Reduced motion: no movement; colour, text and sound still say it.
 */
export type Call={q:string;options:readonly string[];answer:number;why:string;hint:string};
export const CALLS:readonly Call[]=[
 {q:'Your team-mate KICKS the ball back to the keeper on purpose. Can the keeper pick it up?',options:['Yes, hands are fine','No: feet only'],answer:1,
  why:'Since 1992 the keeper must play it with the feet. If he handles it, the other team gets an indirect free kick.',hint:'Think of the 1992 tape: what did the keeper have to use?'},
 {q:'Your team-mate HEADS the ball back to the keeper. Can the keeper pick it up?',options:['Yes','No'],answer:0,
  why:'Yes! The law is about kicks, so a header or a chest pass back is allowed. A trick, like flicking it up to head it back, is not.',hint:'Read the law again: it talks about a ball that is KICKED back.'},
 {q:'Why was the law changed in 1992?',options:['To give keepers a rest','To stop teams wasting time','To score more headers'],answer:1,
  why:'Under the old law a keeper could hold the ball while nobody was allowed to tackle him. The new law kept the ball moving.',hint:'Look at the “seconds wasted” meters.'},
 {q:'1997: a team-mate takes a throw-in straight to the keeper. Can he catch it?',options:['Yes','No'],answer:1,
  why:'No. In 1997 the law grew: a throw-in from a team-mate can’t be handled by the keeper either.',hint:'The law only ever grew stricter on keepers’ hands.'},
];
const reduced=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Quiz(){
 const [i,setI]=useState(0),[picked,setPicked]=useState<number|null>(null),[missed,setMissed]=useState<number[]>([]);
 const [score,setScore]=useState(0),[done,setDone]=useState(false);
 const card=useRef<HTMLDivElement>(null),first=useRef(true);
 const C=CALLS[i],right=picked===C.answer;
 // each call (and the final card) slides in on a sampled spring
 useEffect(()=>{if(first.current){first.current=false;return;}const el=card.current;if(!el||reduced()||typeof el.animate!=='function')return;
  const {frames,ms}=springSamples(240,19);
  try{el.animate(frames.map(f=>({transform:`translateX(${((1-f.p)*28).toFixed(2)}px)`,opacity:Math.min(1,f.p*1.8),offset:f.offset})),{duration:ms});}catch{}},[i,done]);
 const pick=(k:number,el:HTMLElement)=>{unlockMuseumAudio();if(right)return;setPicked(k);
  if(k===C.answer){if(!missed.length)setScore(s=>s+1);museumSfx.net();return;}
  if(!missed.includes(k))setMissed(m=>[...m,k]);museumSfx.whistle();
  if(!reduced()&&typeof el.animate==='function')try{el.animate([{transform:'translateX(0)',filter:'none'},{transform:'translateX(-5px)',filter:'hue-rotate(90deg)'},{transform:'translateX(4px)'},{transform:'none',filter:'none'}],{duration:260,easing:'steps(4,end)'});}catch{}};
 const next=()=>{if(i<CALLS.length-1){setI(i+1);setPicked(null);setMissed([]);museumSfx.tick();}else{setDone(true);museumSfx.reveal();}};
 const again=()=>{setI(0);setPicked(null);setMissed([]);setScore(0);setDone(false);};

 if(done)return <div ref={card} className={styles.quiz} data-done>
  <p className={styles.quizOsd}><span className={styles.quizRec} aria-hidden="true"/>REC · TAPE SAVED</p>
  <p className={styles.quizBig}>{score}/{CALLS.length} calls right first time{score===CALLS.length?': you know the law!':'.'}</p>
  <p className={styles.quizWhy}>Kicked back: feet only. Headed back: hands are fine. And it all started to stop the time-wasting.</p>
  <button type="button" className={styles.storyBtn} onClick={again}>Make the calls again</button>
 </div>;
 return <div ref={card} className={styles.quiz} role="group" aria-labelledby="bp-quiz-q">
  <p className={styles.quizOsd}>REF’S CALL · {i+1}/{CALLS.length}<span className={styles.quizPips} aria-hidden="true">{CALLS.map((_,k)=><i key={k} data-on={k<i||(k===i&&right)||undefined}/>)}</span></p>
  <p id="bp-quiz-q" className={styles.quizQ}>{C.q}</p>
  <div className={styles.quizOpts}>
   {C.options.map((o,k)=>{const st=right&&k===C.answer?'right':missed.includes(k)?'wrong':undefined;
    return <button key={o} type="button" className={styles.quizOpt} data-state={st} disabled={right&&k!==C.answer} data-museum-own-cue onClick={e=>pick(k,e.currentTarget)}>{o}</button>;})}
  </div>
  <p className={styles.quizWhy} aria-live="polite" data-state={right?'right':picked!=null?'wrong':undefined}>
   {right?<><b>Right call.</b> {C.why}</>:picked!=null?<><b>Whistle! Not that one.</b> {C.hint}</>:null}
  </p>
  {right&&<button type="button" className={styles.quizNext} onClick={next}>{i<CALLS.length-1?'Next call ►':'Finish ■'}</button>}
 </div>;
}
