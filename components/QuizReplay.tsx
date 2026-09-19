'use client';
import {useEffect,useState,type MutableRefObject} from 'react';
import {quizOutcomeStep,type FieldSession} from '@/lib/town/formatLessons';
import styles from './FieldLearning.module.css';
export default function QuizReplay({session,onRetry,onNext,nextLabel}:{session:MutableRefObject<FieldSession|null>;onRetry:()=>void;onNext:()=>void;nextLabel:string}){
 const [,refresh]=useState(0);
 const s=session.current,outcome=s?quizOutcomeStep(s):undefined,progress=s?.outcomeProgress??0,paused=s?.outcomePaused??false,playing=outcome!==undefined&&progress<1&&!paused;
 useEffect(()=>{if(!playing)return;const timer=setInterval(()=>refresh(n=>n+1),150);return()=>clearInterval(timer);},[playing]);
 if(!s||!s.quiz||s.answer===null)return null;
 const q=s.lesson.questions[s.question];
 const toggle=()=>{if(playing)s.outcomePaused=true;else{if(outcome===undefined||progress>=1)s.outcomeProgress=0;s.outcomePreview=true;s.outcomePaused=false;}refresh(n=>n+1);};
 return <div className={styles.quizActions}>
 {q.outcomeStep!=null&&<button type="button" className={styles.quizSecondary} onClick={toggle}>{playing?'Pause':outcome===undefined?'Show me':progress>=1?'Replay':'Continue replay'}</button>}
 {s.answer===q.correct?<button type="button" className={styles.quizPrimary} onClick={onNext}>{nextLabel}</button>:<button type="button" className={styles.quizPrimary} onClick={onRetry}>Try again</button>}
 </div>;
}
