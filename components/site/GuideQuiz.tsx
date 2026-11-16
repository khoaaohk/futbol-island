'use client';
import {useState} from 'react';
import type {QuizQuestion} from '@/lib/site/guideQuiz';
import styles from '@/app/(site)/site.module.css';
import {ES_QUIZ} from '@/lib/i18n/es/ui';
/**
 * The end-of-guide quiz (Nov 15 2026; questions from lib/site/guideQuiz.ts). Real buttons, one tap per question, instant
 * feedback read out by an aria-live region, the score when all three are done ("3/3!"), and "Try again". State lives in this
 * component only: nothing is stored or sent. Without JavaScript the questions still read as text.
 */
/** `lang="es"` (Nov 15 2026): the Spanish pages' words (lib/i18n/es/ui.ts); English output is unchanged without it. */
export default function GuideQuiz({id,name,questions,lang}:{id:string;name:string;questions:readonly QuizQuestion[];lang?:'es'}){
 const es=lang==='es';
 const [picked,setPicked]=useState<(number|null)[]>(()=>questions.map(()=>null));
 const done=picked.every(x=>x!==null),score=picked.filter((x,i)=>x===questions[i].correct).length,total=questions.length;
 const cheer=es?ES_QUIZ.cheer(score,total):score===total?`${score}/${total}! You know your ${name}.`:score>=total-1?`${score}/${total}. So close. Read the one you missed and try again.`:`${score}/${total}. Have another read and try again.`;
 return <section className={styles.section} aria-labelledby={id} data-guide-quiz="">
  <h2 className={styles.h2} id={id}>{es?ES_QUIZ.title:'Quick quiz'}: {name}</h2>
  <ol className={styles.quiz}>{questions.map((q,i)=>{const p=picked[i],answered=p!==null,right=p===q.correct;
   return <li key={q.q} className={styles.quizItem}>
    <h3 className={styles.h3} id={`${id}-q${i}`}>{q.q}</h3>
    <div className={styles.quizOptions} role="group" aria-labelledby={`${id}-q${i}`}>
     {q.options.map((o,j)=><button key={o} type="button" className={styles.quizOption} aria-pressed={p===j} disabled={answered&&p!==j}
      data-state={!answered?undefined:j===q.correct?'right':p===j?'wrong':undefined}
      onClick={()=>{if(!answered)setPicked(s=>s.map((x,k)=>k===i?j:x));}}>{o}</button>)}
    </div>
    <p className={styles.quizFeedback} aria-live="polite">{answered?<><b>{right?(es?ES_QUIZ.yes:'Yes!'):(es?ES_QUIZ.notQuite:'Not quite.')}</b> {right?q.explain:<>{es?ES_QUIZ.answerIs:'The answer is:'} {q.explain.startsWith(q.options[q.correct])?q.explain:`${q.options[q.correct]} ${q.explain}`}</>}</>:null}</p>
   </li>;})}
  </ol>
  <div className={styles.quizScore} aria-live="polite">{done?<><p><b>{cheer}</b></p><button type="button" className={styles.quizAgain} onClick={()=>setPicked(questions.map(()=>null))}>{es?ES_QUIZ.again:'Try again'}</button></>:null}</div>
 </section>;
}
