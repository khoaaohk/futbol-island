'use client';
import {useCallback,useEffect,useRef,useState,type MutableRefObject} from 'react';
import {museumSfx} from '@/lib/museum/museumSound';
import {QUIZ,TAKE_IT} from './data';
import {crescent,sawRing} from './papercut';
import {pop} from './spring';
import {FirstStar,Again} from './icons';
import styles from './wwc.module.css';

/**
 * Beat 5, "Cut your star" (Oct 9 2026): the quick check and the payoff. A five-point star is drawn in pencil on a red sheet; each
 * right answer cuts one point free (it lifts and lands with a spring pop: one-shot WAAPI, no loop). Five points cut and the
 * sheet becomes the first star, ignited like the 1991 one. A wrong answer says why and lets you try again (the point waits).
 * Heat: no rAF at all; reduced motion: the points simply appear.
 */
const N=QUIZ.length,R=44,r=18;
const at=(k:number,rr:number)=>{const a=-Math.PI/2+k*Math.PI*2/N;return [Math.cos(a)*rr,Math.sin(a)*rr] as const;};
const f=(n:number)=>n.toFixed(2);
/** One point of the star: the centre, the inner corner before, the tip, the inner corner after. */
const point=(k:number)=>{const [ax,ay]=at(k-.5,r),[tx,ty]=at(k,R),[bx,by]=at(k+.5,r);return `M0 0L${f(ax)} ${f(ay)}L${f(tx)} ${f(ty)}L${f(bx)} ${f(by)}Z`;};
const hub=Array.from({length:N},(_,k)=>{const [x,y]=at(k+.5,r);return (k?'L':'M')+f(x)+' '+f(y);}).join('')+'Z';

export type Quiz=ReturnType<typeof useQuiz>;
export function useQuiz(reduced:MutableRefObject<boolean>){
 const [i,setI]=useState(0),[picked,setPicked]=useState<number|null>(null),[wrong,setWrong]=useState<number[]>([]),[first,setFirst]=useState(0);
 const cut=Math.min(i+(picked!==null&&picked===QUIZ[Math.min(i,N-1)].right?1:0),N),done=i>=N;
 const answer=useCallback((c:number)=>{if(done||picked!==null)return;const q=QUIZ[i];
  if(c===q.right){setPicked(c);if(!wrong.length)setFirst(n=>n+1);try{museumSfx.stamp();}catch{}}
  else{setWrong(w=>w.includes(c)?w:[...w,c]);try{museumSfx.look();}catch{}}},[done,picked,i,wrong.length]);
 const next=useCallback(()=>{setPicked(null);setWrong([]);setI(n=>{const m=n+1;if(m>=N)try{museumSfx.reveal();}catch{}return m;});try{museumSfx.flap();}catch{}},[]);
 const reset=useCallback(()=>{setI(0);setPicked(null);setWrong([]);setFirst(0);},[]);
 return {i,picked,wrong,first,cut,done,answer,next,reset,reduced};
}

export function QuizStage({q}:{q:Quiz}){
 // A newly cut point lifts off the sheet and lands with a spring (one-shot WAAPI, after React has drawn it).
 const shown=useRef(q.cut);
 useEffect(()=>{if(q.cut>shown.current&&!q.reduced.current)pop(document.querySelector(`[data-wwc-point="${q.cut-1}"]`),.25,340,16);shown.current=q.cut;},[q.cut,q.reduced]);
 return <div className={styles.quizStage} data-done={q.done||undefined}>
  <p className={styles.beatKick}>Beat 5 · Cut your star</p>
  {q.done?<div className={styles.quizWin}><FirstStar className={`${styles.quizBig} ${styles.ignite}`}/>
   <p className={styles.quizWinLine}>Your star is cut!</p></div>
  :<svg className={styles.quizStar} viewBox="-56 -56 112 112" role="img" aria-label={`A paper star: ${q.cut} of ${N} points cut.`}>
   <path d={sawRing(0,0,53,2.4,48)} fill="#fbf3e2" stroke="#c8102e33" strokeWidth=".5"/>
   {Array.from({length:N},(_,k)=>{const on=k<q.cut;return <g key={k}>
    <path d={point(k)} className={styles.quizPencil}/>
    {on&&<path data-wwc-point={k} d={point(k)+crescent(...at(k,R*.62),2.6,-Math.PI/2+k*Math.PI*2/N,.5)} fillRule="evenodd" className={styles.quizPoint}/>}
    {!on&&k===q.i&&<circle cx={at(k,R*.6)[0]} cy={at(k,R*.6)[1]} r={3} className={styles.quizNext}/>}
   </g>;})}
   <path d={hub} className={q.cut?styles.quizHub:styles.quizPencil}/>
  </svg>}
  <ol className={styles.quizDots} aria-hidden="true">{QUIZ.map((_,k)=><li key={k} data-on={k<q.cut||undefined} data-now={k===q.i&&!q.done||undefined}/>)}</ol>
 </div>;
}

export function QuizPanel({q,onAgain}:{q:Quiz;onAgain:()=>void}){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{ref.current?.querySelector<HTMLElement>('button')?.focus({preventScroll:true});},[q.i]);
 if(q.done)return <div>
  <p className={styles.eyebrow}>All five points cut</p>
  <p className={styles.lead}><b>{q.first===N?'Five out of five, first time!':`${q.first} of ${N} right first time.`}</b> You know how the first Women’s World Cup happened: shut out for years, then 12 teams in China, and Akers’s winner.</p>
  <p className={styles.take} data-on><b>Take it to your game</b>{TAKE_IT}</p>
  <div className={styles.row}><button type="button" className={styles.btn} data-museum-own-cue onClick={q.reset}><Again/>Try the quiz again</button>
   <button type="button" className={styles.btn} data-museum-own-cue onClick={onAgain}>Start the story again</button></div>
 </div>;
 const c=QUIZ[q.i],ok=q.picked!==null;
 return <div ref={ref} key={q.i}>
  <p className={styles.eyebrow}>Question {q.i+1} of {N}</p>
  <p className={styles.quizQ}>{c.q}</p>
  <div className={styles.quizChoices} role="group" aria-label="Answers">
   {c.choices.map((t,k)=><button key={t} type="button" className={styles.btn} data-museum-own-cue data-a={ok&&k===c.right?'right':q.wrong.includes(k)?'wrong':undefined}
    disabled={ok||q.wrong.includes(k)} onClick={()=>q.answer(k)}>{t}</button>)}
  </div>
  <p className={styles.quizWhy} role="status" aria-live="polite">{ok?<><b>Yes!</b> {c.why}</>:q.wrong.length?<><b>Not quite.</b> Look back at the story, or try another answer.</>:'Pick an answer. Each right one cuts a point of your star.'}</p>
  {ok&&<div className={styles.row}><span className={styles.grow}/><button type="button" className={`${styles.btn} ${styles.gold} ${styles.pop}`} data-museum-own-cue onClick={q.next}>{q.i+1<N?'Next question →':'Finish the star →'}</button></div>}
 </div>;
}
