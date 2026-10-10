'use client';
import {useEffect,useRef,useState} from 'react';
import {isSoundEnabled} from '@/lib/games/sound';
import {museumSfx,unlockMuseumAudio} from '@/lib/museum/museumSound';
import {prefersReduced,springEase} from './spring';
import css from './futsal.module.css';

/**
 * futsal-1989 · "Quick check" (Oct 9 2026): the last page of the cordel. Four questions, one at a time, each one about the WHY
 * the visitor just played (the low ball, the touches, the spin), then the 1989 history. A right answer is stamped in red ink; a
 * wrong one points back at the lab that shows the answer and lets you try again. When all three are done the booklet ends the way every cordel ends: "FIM"
 * (the end), pressed on with a spring.
 *
 * Motion: each new question is pulled onto the paper (WAAPI, spring-sampled linear()), a wrong answer gives a small sideways
 * shake, the FIM stamp presses down and settles. All finite one-shots: no loop, nothing runs at rest. Reduced motion: none of it.
 */
export type QuizQ={q:string;options:readonly string[];answer:number;why:string;hint:string};
export const QUESTIONS:readonly QuizQ[]=[
 {q:'Why is the futsal ball made to bounce low?',options:['So it flies over the goalkeeper','So it stays near your feet on a hard floor','So it is easier to head'],answer:1,
  why:'On a hard court a bouncy ball runs away. A low ball stays down, so you can stop it with your sole.',hint:'Think of the drop test: which ball stayed down by your feet?'},
 {q:'Five a side on a small court. What happens to your touches?',options:['You get more touches','You get fewer touches','Nothing changes'],answer:0,
  why:'Small space, fewer players: the ball comes back to you again and again.',hint:'Think of the match: where did the ball find you more often?'},
 {q:'Why do futsal players spin round the fixo, ala and pivô spots?',options:['To rest their legs','So everyone learns to attack and defend','Because the referee says so'],answer:1,
  why:'Players can switch spots at any time, so every player defends and every player attacks.',hint:'Think of the spin: after three turns, who had played every spot?'},
 {q:'Who won the first FIFA Futsal World Cup in 1989?',options:['Uruguay','The Netherlands','Brazil'],answer:2,
  why:'Brazil beat the hosts, the Netherlands, 2–1 in the final in Rotterdam.',hint:'Look at the scoreboard print above.'},
];
const sfx=(f:()=>void)=>{try{if(isSoundEnabled())f();}catch{}};
const EASE=springEase(260,.55),STAMP=springEase(320,.42,1.1);

export function Quiz({onDone}:{onDone?:()=>void}){
 const [i,setI]=useState(0),[picked,setPicked]=useState<number|null>(null),[wrong,setWrong]=useState<number[]>([]);
 const [score,setScore]=useState(0),[done,setDone]=useState(false);
 const card=useRef<HTMLDivElement>(null),stamp=useRef<HTMLSpanElement>(null),first=useRef(true);
 const Q=QUESTIONS[i],right=picked===Q.answer;
 // a new question is pulled onto the paper
 useEffect(()=>{if(first.current){first.current=false;return;}const el=card.current;if(!el||prefersReduced()||!el.animate)return;
  try{el.animate([{transform:'translateY(14px) rotate(.8deg)',opacity:0},{opacity:1,offset:.3},{transform:'none',opacity:1}],{duration:620,easing:EASE});}catch{}},[i]);
 useEffect(()=>{if(!done)return;onDone?.();const el=stamp.current;if(!el||prefersReduced()||!el.animate)return;
  try{el.animate([{transform:'scale(2.4) rotate(-22deg)',opacity:0},{opacity:1,offset:.18},{transform:'scale(1) rotate(-8deg)',opacity:1}],{duration:760,easing:STAMP});}catch{}},[done,onDone]);
 const pick=(k:number,e:HTMLElement)=>{unlockMuseumAudio();if(right)return;
  if(k===Q.answer){setPicked(k);if(!wrong.length)setScore(s=>s+1);sfx(museumSfx.stamp);return;}
  setPicked(k);if(!wrong.includes(k))setWrong(w=>[...w,k]);sfx(museumSfx.card);
  if(!prefersReduced()&&e.animate)try{e.animate([{transform:'translateX(0)'},{transform:'translateX(-6px)'},{transform:'translateX(5px)'},{transform:'translateX(-2px)'},{transform:'none'}],{duration:320,easing:'ease-out'});}catch{}};
 const next=()=>{if(i<QUESTIONS.length-1){setI(i+1);setPicked(null);setWrong([]);sfx(museumSfx.flapBook);}else{setDone(true);sfx(museumSfx.reveal);}};
 const again=()=>{setI(0);setPicked(null);setWrong([]);setScore(0);setDone(false);};

 if(done)return <div className={css.quiz} data-done>
  <span ref={stamp} className={css.fim} aria-hidden="true">FIM</span>
  <p className={css.tagSm}>Quick check · done</p>
  <p className={css.big}>{score} of {QUESTIONS.length} right first time{score===QUESTIONS.length?'. Perfect!':'!'}</p>
  <p>You read the whole cordel: the court, the low ball, the touches, the spin and the first World Cup. <i>Fim</i> means “the end”: that is how every cordel finishes.</p>
  <div className={css.row}><button type="button" className={css.ghost} onClick={again}>Try the questions again</button></div>
 </div>;
 return <div ref={card} className={css.quiz} role="group" aria-labelledby="futsal-quiz-q">
  <p className={css.tagSm}>Quick check · {i+1} of {QUESTIONS.length}</p>
  <span className={css.qPips} aria-hidden="true">{QUESTIONS.map((_,k)=><i key={k} data-on={k<i||(k===i&&right)||undefined}/>)}</span>
  <p id="futsal-quiz-q" className={css.qText}>{Q.q}</p>
  <div className={css.qOpts}>
   {Q.options.map((o,k)=>{const st=picked!=null&&k===Q.answer&&right?'right':wrong.includes(k)?'wrong':undefined;
    return <button key={o} type="button" className={css.qOpt} data-state={st} aria-pressed={st==='right'||undefined} disabled={right&&k!==Q.answer} data-museum-own-cue
     onClick={e=>pick(k,e.currentTarget)}>{st==='right'?'✓ ':st==='wrong'?'✗ ':''}{o}</button>;})}
  </div>
  <p className={css.qWhy} aria-live="polite" data-state={right?'right':picked!=null?'wrong':undefined}>
   {right?<><b>Certo! Right.</b> {Q.why}</>:picked!=null?<><b>Not quite.</b> {Q.hint}</>:null}
  </p>
  {right&&<div className={css.row}><button type="button" className={css.btn} onClick={next}>{i<QUESTIONS.length-1?'Next question →':'Finish the cordel'}</button></div>}
 </div>;
}
