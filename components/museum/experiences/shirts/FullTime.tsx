'use client';
import {useState} from 'react';
import {museumSfx} from '@/lib/museum/museumSound';
import styles from './shirts.module.css';

/**
 * shirts · beat 4, "Full time" (Oct 9 2026 story pass): the Kit Room's ending, told as the last page of the fashion magazine.
 * A three-question kit quiz (one cut-out question at a time, a why after every answer) and then the payoff: a magazine cover
 * pasted together from what the visitor learned in the three beats, with their score in cut-out letters.
 * Motion: one-shot CSS keyframes on the Kit Room's spring (pieces paste in with a stagger and a tilt); none under reduced
 * motion. No loop, no timers.
 */
export type KitQ={q:string;options:readonly string[];right:number;why:string;beat:string};
export const KIT_QUIZ:readonly KitQ[]=[
 {beat:'Numbers',q:'In 1928, which number did the goalkeeper wear?',options:['9','1','11'],right:1,
  why:'Numbers counted from the back of the team: 1 the goalkeeper, then the backs, the halves and the forwards.'},
 {beat:'Decades',q:'Which came first on football shirts?',options:['Numbers on the back','Sponsors on the front','Names above the number'],right:0,
  why:'Numbers came in 1928, sponsors in 1973 and names in the Premier League in 1993.'},
 {beat:'Colours',q:'Why must the two teams wear different colours?',options:['So the shirts look nice on TV','The referee likes it','So players can tell team-mates from opponents at a glance'],right:2,
  why:'Law 4 says the teams must look different from each other and from the referees. One glance tells you who is free.'},
];

export default function FullTime({forYourGame,onRestart}:{forYourGame:string;onRestart:()=>void}){
 const [i,setI]=useState(0),[picked,setPicked]=useState<number|null>(null),[score,setScore]=useState(0);
 const done=i>=KIT_QUIZ.length,item=KIT_QUIZ[Math.min(i,KIT_QUIZ.length-1)];
 const pick=(n:number)=>{if(picked!=null)return;setPicked(n);if(n===item.right){setScore(s=>s+1);museumSfx.reveal();}else museumSfx.tick();};
 const next=()=>{museumSfx.card();setI(i+1);setPicked(null);};
 if(done)return <div className={styles.finale} data-stage="fulltime">
  <div className={styles.cover} role="img" aria-label={`Magazine cover: the Kit Room issue. You scored ${score} out of ${KIT_QUIZ.length}.`}>
   <p className={styles.coverMast} style={{['--k' as string]:0}}>KIT ROOM</p>
   <p className={styles.coverIssue} style={{['--k' as string]:1}}>The 1880 – today issue</p>
   <p className={styles.coverScore} style={{['--k' as string]:2}}>{[String(score),'/',String(KIT_QUIZ.length)].map((c,n)=><span key={n} style={{['--r' as string]:`${(n%2?3:-4)}deg`}}>{c}</span>)}</p>
   <p className={styles.coverHead} style={{['--k' as string]:3}}>{score===KIT_QUIZ.length?'You know your kit!':score>=2?'Nearly a kit expert!':'Back to the Kit Room!'}</p>
   <ul className={styles.coverLines}>
    <li style={{['--k' as string]:4}}><b>1928</b> Numbers on the back, counted from the goalkeeper</li>
    <li style={{['--k' as string]:5}}><b>1973</b> Sponsors · <b>1993</b> names</li>
    <li style={{['--k' as string]:6}}><b>Law 4</b> Colours you can’t mix up</li>
   </ul>
  </div>
  <div className={styles.finaleText}>
   <p className={styles.finaleTake}>Take it to your game</p>
   <p className={styles.lede}>{forYourGame}</p>
   <div className={styles.row}>
    <button type="button" className={styles.primary} onClick={()=>{setI(0);setPicked(null);setScore(0);museumSfx.card();}}>Quiz again</button>
    <button type="button" className={styles.ghostBtn} onClick={onRestart}>Back to the decades</button>
   </div>
  </div>
 </div>;
 return <div className={styles.finale} data-stage="fulltime">
  <div className={styles.quizCard} key={'q'+i}>
   <p className={styles.quizMeta}><span>Kit quiz · {i+1}/{KIT_QUIZ.length}</span><em>from “{item.beat}”</em></p>
   <h1 className={styles.quizQ}>{item.q}</h1>
   <div className={styles.quizOpts} role="group" aria-label={item.q}>
    {item.options.map((o,n)=><button key={o} type="button" data-museum-own-cue className={styles.quizOpt} style={{['--k' as string]:n,['--r' as string]:`${(n-1)*.6}deg`}} onClick={()=>pick(n)}
     disabled={picked!=null} aria-pressed={picked===n} data-state={picked==null?undefined:n===item.right?'right':n===picked?'wrong':undefined}>{o}</button>)}
   </div>
   {picked!=null&&<p className={styles.quizWhy} role="status"><b>{picked===item.right?'Right! ':'Not quite. '}</b>{item.why}</p>}
   {picked!=null&&<div className={styles.row}><button type="button" className={styles.primary} onClick={next}>{i+1<KIT_QUIZ.length?'Next question →':'See your cover →'}</button></div>}
  </div>
 </div>;
}
