'use client';
/**
 * Daily warm-up (docs/learning/spaced-review.md): one short visual question per lesson due for review (at most 3), reusing the
 * lesson's own VisualQuestion. The first answer moves the lesson along its review boxes; retries are practice. Right answers pay
 * LEARN_COINS.review, at most REVIEW_PAID_PER_DAY a day. (The mastery view that shared this drawer was removed by the user on
 * Oct 1 2026, docs/learning/spaced-review.md; the drawer now holds the warm-up only.)
 * Heat: static DOM; lesson JSON loads only for the formats a warm-up needs (cached by loadCatalog).
 */
import {useEffect,useRef,useState} from 'react';
import {DoneButton} from './DoneButton';
import VisualQuestion from './VisualQuestion';
import shell from './ModalShell.module.css';
import styles from './LearningReview.module.css';
import {loadCatalog,type FieldLesson} from '@/lib/town/formatLessons';
import {isVisual,visualHint,type VisualFieldQuestion} from '@/lib/town/visualQuiz';
import {getDueReviews,answerReviewQuestion,useReviewState,syncReviews,openPathLesson} from '@/lib/learning/reviewStore';
import type {DueReview} from '@/lib/learning/reviewStoreCore';
import {nextDue,localDaysBetween,REVIEW_PAID_PER_DAY} from '@/lib/learning/review';
import {conceptsForLesson,conceptWords} from '@/lib/learning/conceptMap';
import {LEARN_COINS} from '@/lib/town/learnCoins';
import type {Format} from '@/lib/town/venues';

const FORMAT_LABEL:Record<string,string>={futsal:'Futsal','7v7':'7v7','9v9':'9v9','11v11':'11v11'};
/** Rotate through the lesson's visual questions, so each review is a different picture. */
export function reviewQuestionIndex(lesson:FieldLesson,seen:number){const v=lesson.questions.map((q,i)=>isVisual(q)?i:-1).filter(i=>i>=0);return v.length?v[seen%v.length]:-1;}

export default function LearningReview({open,onClose}:{open:boolean;onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null),close=useRef<HTMLButtonElement>(null),restore=useRef<HTMLElement|null>(null);
 const [leaving,setLeaving]=useState(false),closing=useRef(false),timer=useRef<ReturnType<typeof setTimeout>>();
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
 const requestClose=()=>{if(closing.current)return;closing.current=true;if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){onClose();return;}setLeaving(true);timer.current=setTimeout(onClose,240);};
 useEffect(()=>{const el=dialog.current;if(!el)return;if(open&&!el.open){closing.current=false;setLeaving(false);restore.current=document.activeElement instanceof HTMLElement?document.activeElement:null;el.showModal();close.current?.focus();}else if(!open&&el.open){el.close();restore.current?.focus({preventScroll:true});}},[open]);
 return <dialog ref={dialog} className={`${styles.dialog} ${leaving?styles.leaving:styles.entering}`} aria-labelledby="learning-review-title" data-learning-review="review" onCancel={e=>{e.preventDefault();requestClose();}} onClick={e=>{if(e.target===e.currentTarget)requestClose();}} onKeyDown={e=>e.stopPropagation()} onKeyUp={e=>e.stopPropagation()}>
  <section className={`${styles.panel} ${shell.shell} ${shell.drawer}`}>
   <header className={`${shell.header} ${styles.header}`}><div><h2 id="learning-review-title">Warm-up</h2></div><DoneButton ref={close} onDone={requestClose}/></header>
   <div className={shell.body}>
    {open&&<WarmUp onDone={requestClose}/>}
   </div>
  </section>
 </dialog>;
}

type Item=DueReview&{lesson?:FieldLesson;index:number};
function WarmUp({onDone}:{onDone:()=>void}){
 const reviews=useReviewState();
 // The warm-up's lessons are fixed when it opens; answering never reshuffles the list under the child's finger.
 const [items,setItems]=useState<Item[]|null>(null),[error,setError]=useState('');
 const [at,setAt]=useState(0),[answer,setAnswer]=useState<number|null>(null),[tries,setTries]=useState(0);
 const [results,setResults]=useState<{key:string;first:boolean;coins:number}[]>([]);
 useEffect(()=>{let live=true;const due=getDueReviews().items;const state=syncReviews();
  Promise.all([...new Set(due.map(d=>d.format))].map(f=>loadCatalog(f as Format).then(list=>[f,list] as const))).then(pairs=>{if(!live)return;const by=new Map(pairs);
   setItems(due.map(d=>{const lesson=by.get(d.format)?.find(l=>l.id===d.lessonId),r=state.lessons[d.key];return {...d,lesson,index:lesson?reviewQuestionIndex(lesson,(r?.right??0)+(r?.wrong??0)):-1};}).filter(i=>i.lesson&&i.index>=0));
  }).catch(e=>{if(live){setError(e instanceof Error?e.message:'Lessons could not load.');setItems([]);}});
  return()=>{live=false;};},[]);
 if(!items)return <p className={styles.note} role="status">Getting your warm-up ready…</p>;
 const done=at>=items.length;
 if(!items.length||done){
  const n=nextDue(reviews),days=n?Math.max(1,localDaysBetween(Date.now(),n)):null,coins=results.reduce((s,r)=>s+r.coins,0),first=results.filter(r=>r.first).length;
  return <div className={styles.stack} data-warmup-state={items.length?'done':'empty'}>
   {error&&<p className={styles.note} role="alert">{error}</p>}
   {items.length?<section className={styles.card}><span className={styles.eyebrow}>Warm-up done</span><h3>{first} of {items.length} right first time</h3><p>{coins?`+${coins} coins. `:''}Each right answer brings that lesson back later, so it sticks. Missed ones come back tomorrow, so you get another go.</p></section>
   :<section className={styles.card}><span className={styles.eyebrow}>Nothing due right now</span><h3>{days?`Your next warm-up is in ${days===1?'1 day':`${days} days`}.`:'Pass a lesson quiz to start your warm-ups.'}</h3><p>{days?'Lessons come back after 1 day, then 3, then 7. Remembering later is how football ideas stick.':'Every lesson you pass in Paths comes back here the next day for one quick question.'}</p></section>}
   <div className={styles.actions}><button type="button" className={styles.primary} onClick={onDone}>Back to the island</button></div>
  </div>;
 }
 const item=items[at],lesson=item.lesson!,q=lesson.questions[item.index] as VisualFieldQuestion,right=answer!==null&&answer===q.correct;
 const words=conceptsForLesson(item.key)[0];const concept=words?conceptWords(words,item.format):null;
 const choose=(i:number)=>{if(answer!==null)return;setAnswer(i);const correct=i===q.correct;
  if(tries===0){void answerReviewQuestion(item.key,correct).then(coins=>setResults(r=>[...r,{key:item.key,first:correct,coins}]));}
  setTries(t=>t+1);};
 const next=()=>{setAt(a=>a+1);setAnswer(null);setTries(0);};
 return <div className={styles.stack} data-warmup-state="question" data-warmup-lesson={item.key}>
  <div className={styles.meter} aria-label={`Question ${at+1} of ${items.length}`}>{items.map((_,i)=><span key={i} data-on={i<=at}/>)}</div>
  <section className={styles.quiz} aria-label="Warm-up question">
   <span className={styles.eyebrow}>{FORMAT_LABEL[item.format]} · {item.name}</span>
   {concept&&<p className={styles.concept}><b>{concept.title}.</b> {concept.line}</p>}
   <h3>{q.q}</h3><p className={styles.hint}>{visualHint(q)}</p>
   <VisualQuestion key={`${item.key}:${tries}`} lesson={lesson} q={q} answer={answer} onAnswer={choose}/>
   {answer!==null&&<div className={styles.feedback} data-right={right} role="status">
    <b>{right?(tries>1?'Got it!':'Yes, you remembered!'):'Not this time.'}</b>
    <p>{right?q.explain:q.choiceExplanations?.[answer]??'Look at the picture again: where is the space?'}</p>
    {right?<button type="button" className={styles.primary} onClick={next}>{at+1<items.length?'Next question':'Finish'}</button>:<div className={styles.actions}><button type="button" className={styles.secondary} onClick={()=>setAnswer(null)}>Try again</button><button type="button" className={styles.secondary} onClick={()=>{onDone();openPathLesson(item.key,q.step);}}>Watch that part</button></div>}
   </div>}
  </section>
  <p className={styles.note}>Right first time moves the lesson along. Up to {REVIEW_PAID_PER_DAY} right answers a day pay {LEARN_COINS.review} coins each.</p>
 </div>;
}
