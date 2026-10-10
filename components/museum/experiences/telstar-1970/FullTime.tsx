'use client';
import {useEffect,useRef,useState} from 'react';
import {museumSfx} from '@/lib/museum/museumSound';
import styles from './Experience.module.css';

/**
 * telstar-1970 · the ending (Oct 9 2026 story pass). The broadcast now has a cold open, a middle and a Full time:
 *  - `ColdOpen`: tonight's story in three lines (the question the visitor will answer), revealed one after another.
 *  - `EndCard`: a 1970 closedown caption on the TV itself, with the visitor's eye-test scores and then the quiz score.
 *  - `Quiz`: "Quiz of the night" in the TV guide, three quick questions with a why after every answer.
 * Motion is CSS only (staggered keyframes on a spring curve, finite, off under reduced motion): no loop, no timers.
 */
export const COLD_OPEN=[
 'Mexico, 1970. The World Cup is on television, live by satellite.',
 'But most families watch on black-and-white sets. Brown leather, green grass: on screen, both turn grey.',
 'So how could anyone follow the ball? Switch on and find out.',
] as const;

export type QuizItem={q:string;options:readonly string[];right:number;why:string};
export const QUIZ:readonly QuizItem[]=[
 {q:'On a black-and-white TV, why was the brown ball hard to follow?',options:['It turned the same grey as the grass','It was smaller than the Telstar','It moved too fast'],right:0,
  why:'Brown and green both look mid-grey without colour. The Telstar’s black and white panels stay dark and light, so your eyes can find it.'},
 {q:'How many panels does the Telstar have?',options:['20, all white','32: 12 black and 20 white','12, all black'],right:1,
  why:'12 black pentagons (5 sides) and 20 white hexagons (6 sides): 32 panels.'},
 {q:'What was the Telstar ball named after?',options:['A famous goalkeeper','A star in the night sky','A TV satellite from 1962'],right:2,
  why:'Telstar 1 was a ball-shaped satellite covered in flat panels. It sent the first live TV pictures across the Atlantic Ocean.'},
];

export function ColdOpen(){
 return <ol className={styles.coldOpen} aria-label="Tonight’s story">
  {COLD_OPEN.map((l,i)=><li key={i} style={{['--i' as string]:i}}>{l}</li>)}
 </ol>;
}

type Row={label:string;score:string};
/** The closedown caption on the TV screen. `quiz` is null until the quiz is finished. */
export function EndCard({rows,quiz}:{rows:Row[];quiz:{right:number;total:number}|null}){
 return <div className={styles.endCard} aria-hidden="true">
  <p className={styles.endHead} style={{['--i' as string]:0}}>FULL TIME</p>
  <p className={styles.endSub} style={{['--i' as string]:1}}>MEXICO 70 · YOUR EYE TEST</p>
  {rows.map((r,i)=><p key={r.label} className={styles.endRow} style={{['--i' as string]:i+2}}><span>{r.label}</span><b>{r.score}</b></p>)}
  {quiz&&<p className={styles.endQuiz} key="q"><span>QUIZ OF THE NIGHT</span><b>{quiz.right}/{quiz.total}</b></p>}
  {quiz&&<p className={styles.endBye}>GOODNIGHT</p>}
 </div>;
}

export function Quiz({onDone,onBack,forYourGame,compareLine}:{onDone:(right:number)=>void;onBack:()=>void;forYourGame:string;compareLine:string}){
 const [i,setI]=useState(0),[picked,setPicked]=useState<number|null>(null),[score,setScore]=useState(0),[done,setDone]=useState(false);
 const item=QUIZ[i],box=useRef<HTMLDivElement>(null);
 // every new question (and the score) starts at the top of the guide sheet
 useEffect(()=>{box.current?.scrollIntoView?.({block:'nearest'});},[i,done]);
 const pick=(n:number)=>{if(picked!=null)return;setPicked(n);if(n===item.right){setScore(s=>s+1);museumSfx.reveal();}else museumSfx.tick();};
 const next=()=>{museumSfx.card();if(i+1<QUIZ.length){setI(i+1);setPicked(null);}else{setDone(true);onDone(score);}};
 if(done)return <div ref={box} className={styles.quiz} data-done="true">
  <p className={styles.quizKicker}>Broadcast complete</p>
  <p className={styles.quizScore} key="s"><b>{score}</b>/{QUIZ.length}<span>{score===QUIZ.length?'Perfect reception!':score>=2?'Good picture!':'A bit fuzzy: try again!'}</span></p>
  <p className={styles.quizWhy}>{compareLine}</p>
  <p className={styles.quizTake}><b>Take it to your game:</b> {forYourGame}</p>
  <div className={styles.actions}>
   <button type="button" className={styles.action} onClick={()=>{setI(0);setPicked(null);setScore(0);setDone(false);museumSfx.card();}} data-museum-own-cue>Quiz again</button>
   <button type="button" className={styles.skip} onClick={onBack} data-museum-own-cue>Back to the match</button>
  </div>
 </div>;
 return <div ref={box} className={styles.quiz}>
  <p className={styles.quizKicker}>Quiz of the night · {i+1} of {QUIZ.length}</p>
  <p className={styles.quizQ} key={'q'+i}>{item.q}</p>
  <div className={styles.quizOpts} role="group" aria-label={item.q} key={'o'+i}>
   {item.options.map((o,n)=><button key={o} type="button" className={styles.quizOpt} style={{['--i' as string]:n}} onClick={()=>pick(n)} disabled={picked!=null&&picked!==n&&n!==item.right}
    data-state={picked==null?undefined:n===item.right?'right':n===picked?'wrong':undefined} aria-pressed={picked===n} data-museum-own-cue>
    <i aria-hidden="true">{picked!=null&&n===item.right?'✓':picked===n?'✗':String.fromCharCode(65+n)}</i>{o}</button>)}
  </div>
  {picked!=null&&<p className={styles.quizWhy} role="status" key={'w'+i}><b>{picked===item.right?'Right! ':'Not quite. '}</b>{item.why}</p>}
  <div className={styles.actions}>
   {picked!=null&&<button type="button" className={styles.action} onClick={next} data-museum-own-cue>{i+1<QUIZ.length?'Next question':'See my score'}</button>}
   {picked==null&&<button type="button" className={styles.skip} onClick={onBack} data-museum-own-cue>Back to the match</button>}
  </div>
 </div>;
}
