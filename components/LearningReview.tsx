'use client';
/**
 * Daily warm-up + My football (docs/learning/spaced-review.md). One drawer with two views:
 *  - Warm-up: one short visual question per lesson due for review (at most 3), reusing the lesson's own VisualQuestion.
 *    The first answer moves the lesson along its review boxes; retries are practice. Right answers pay LEARN_COINS.review,
 *    at most REVIEW_PAID_PER_DAY a day.
 *  - My football: every format's lessons with their mastery stage (Introduced → Practicing → Applied → Remembered), what is
 *    due, and progress bars. It also hosts the three pilot "new situation" journeys (LearningJourneys), unreachable before.
 * Heat: static DOM + the static SVG mini pitch; lesson JSON loads only for the formats a warm-up needs (cached by loadCatalog).
 */
import {useEffect,useMemo,useRef,useState} from 'react';
import {DoneButton} from './DoneButton';
import VisualQuestion from './VisualQuestion';
import LearningJourneys from './LearningJourneys';
import shell from './ModalShell.module.css';
import styles from './LearningReview.module.css';
import {loadCatalog,type FieldLesson} from '@/lib/town/formatLessons';
import {isVisual,visualHint,type VisualFieldQuestion} from '@/lib/town/visualQuiz';
import {FORMAT_PATHS,lessonEvidence,type PathLesson} from '@/lib/paths/formatPaths';
import {useQuestEvidence} from '@/lib/town/questProgress';
import {useQuizCompletions} from '@/lib/town/quizProgress';
import {getDueReviews,answerReviewQuestion,useReviewState,syncReviews,openPathLesson,type LearningReviewView} from '@/lib/learning/reviewStore';
import type {DueReview} from '@/lib/learning/reviewStoreCore';
import {STAGES,STAGE_LABEL,STAGE_DETAIL,stageOf,dueLabel,nextDue,localDaysBetween,REVIEW_PAID_PER_DAY,type Stage} from '@/lib/learning/review';
import {conceptsForLesson,conceptWords} from '@/lib/learning/conceptMap';
import {LEARN_COINS} from '@/lib/town/learnCoins';
import type {Format} from '@/lib/town/venues';

const FORMAT_LABEL:Record<string,string>={futsal:'Futsal','7v7':'7v7','9v9':'9v9','11v11':'11v11'};
/** Rotate through the lesson's visual questions, so each review is a different picture. */
export function reviewQuestionIndex(lesson:FieldLesson,seen:number){const v=lesson.questions.map((q,i)=>isVisual(q)?i:-1).filter(i=>i>=0);return v.length?v[seen%v.length]:-1;}

export default function LearningReview({open,view,onView,onClose}:{open:boolean;view:LearningReviewView;onView:(v:LearningReviewView)=>void;onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null),close=useRef<HTMLButtonElement>(null),restore=useRef<HTMLElement|null>(null);
 const [leaving,setLeaving]=useState(false),closing=useRef(false),timer=useRef<ReturnType<typeof setTimeout>>();
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
 const requestClose=()=>{if(closing.current)return;closing.current=true;if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){onClose();return;}setLeaving(true);timer.current=setTimeout(onClose,240);};
 useEffect(()=>{const el=dialog.current;if(!el)return;if(open&&!el.open){closing.current=false;setLeaving(false);restore.current=document.activeElement instanceof HTMLElement?document.activeElement:null;el.showModal();close.current?.focus();}else if(!open&&el.open){el.close();restore.current?.focus({preventScroll:true});}},[open]);
 return <dialog ref={dialog} className={`${styles.dialog} ${leaving?styles.leaving:styles.entering}`} aria-labelledby="learning-review-title" data-learning-review={view} onCancel={e=>{e.preventDefault();requestClose();}} onClick={e=>{if(e.target===e.currentTarget)requestClose();}} onKeyDown={e=>e.stopPropagation()} onKeyUp={e=>e.stopPropagation()}>
  <section className={`${styles.panel} ${shell.shell} ${shell.drawer}`}>
   <header className={`${shell.header} ${styles.header}`}><div><h2 id="learning-review-title">{view==='review'?'Daily warm-up':'My football'}</h2></div><DoneButton ref={close} onDone={requestClose}/></header>
   <div className={shell.body}>
    <nav className={styles.tabs} aria-label="Learning views"><button type="button" aria-pressed={view==='review'} onClick={()=>onView('review')}>Warm-up</button><button type="button" aria-pressed={view==='mastery'} onClick={()=>onView('mastery')}>My football</button></nav>
    {open&&(view==='review'?<WarmUp key="review" onMastery={()=>onView('mastery')} onDone={requestClose}/>:<Mastery key="mastery" onReview={()=>onView('review')}/>)}
   </div>
  </section>
 </dialog>;
}

type Item=DueReview&{lesson?:FieldLesson;index:number};
function WarmUp({onMastery,onDone}:{onMastery:()=>void;onDone:()=>void}){
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
   {items.length?<section className={styles.card}><span className={styles.eyebrow}>Warm-up done</span><h3>{first} of {items.length} right first time</h3><p>{coins?`+${coins} coins. `:''}Each right answer moves that lesson closer to <b>Remembered</b>. Missed ones come back tomorrow, so you get another go.</p></section>
   :<section className={styles.card}><span className={styles.eyebrow}>Nothing due right now</span><h3>{days?`Your next warm-up is in ${days===1?'1 day':`${days} days`}.`:'Pass a lesson quiz to start your warm-ups.'}</h3><p>{days?'Lessons come back after 1 day, then 3, then 7. Remembering later is how football ideas stick.':'Every lesson you pass in Paths comes back here the next day for one quick question.'}</p></section>}
   <div className={styles.actions}><button type="button" className={styles.primary} onClick={onMastery}>See My football</button><button type="button" className={styles.secondary} onClick={onDone}>Back to the island</button></div>
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
    {right?<button type="button" className={styles.primary} onClick={next}>{at+1<items.length?'Next question':'Finish'}</button>:<button type="button" className={styles.secondary} onClick={()=>setAnswer(null)}>Try again</button>}
   </div>}
  </section>
  <p className={styles.note}>Right first time moves the lesson along. Up to {REVIEW_PAID_PER_DAY} right answers a day pay {LEARN_COINS.review} coins each.</p>
 </div>;
}

const STAGE_TONE:Record<Stage,string>={new:'new',introduced:'introduced',practicing:'practicing',applied:'applied',remembered:'remembered'};
function Mastery({onReview}:{onReview:()=>void}){
 const reviews=useReviewState(),evidence=useQuestEvidence(),answers=useQuizCompletions(),steps=useMemo(()=>new Set(evidence.steps),[evidence.steps]);
 useEffect(()=>{syncReviews();},[]);
 const [format,setFormat]=useState<Format>(()=>{try{const saved=localStorage.getItem('fi2-path-format-v1');if(FORMAT_PATHS.some(p=>p.format===saved))return saved as Format;}catch{}return '7v7';});
 const now=Date.now();
 const rows=(p:typeof FORMAT_PATHS[number],l:PathLesson)=>{const key=`${p.format}:${l.id}`,r=reviews.lessons[key];return {key,lesson:l,r,stage:stageOf(lessonEvidence(p.format,l,steps,answers),r),due:dueLabel(r,now)};};
 const all=FORMAT_PATHS.map(p=>({p,core:p.chapters.flatMap(c=>c.lessons).map(l=>rows(p,l)),depth:p.depth.map(l=>rows(p,l))}));
 const path=all.find(a=>a.p.format===format)!;
 const dueTotal=Object.values(reviews.lessons).filter(r=>r.enrolled>0&&r.due<=now).length;
 const counts=(list:ReturnType<typeof rows>[])=>Object.fromEntries(STAGES.map(s=>[s,list.filter(x=>x.stage===s).length])) as Record<Stage,number>;
 const c=counts(path.core);
 const depthShown=path.depth.filter(x=>x.stage!=='new');
 return <div className={styles.stack} data-mastery={format}>
  <section className={styles.card}>
   <span className={styles.eyebrow}>{dueTotal?`${dueTotal} ${dueTotal===1?'lesson is':'lessons are'} ready to review`:'All caught up'}</span>
   <h3>{dueTotal?'A quick warm-up keeps ideas fresh.':'Nothing to review today.'}</h3>
   <p>Every lesson grows through four stages. <b>Introduced</b>: you saw it. <b>Practicing</b>: you passed the quiz. <b>Applied</b>: you used it somewhere new. <b>Remembered</b>: you still knew it days later.</p>
   {dueTotal>0&&<button type="button" className={styles.primary} onClick={onReview}>Start warm-up</button>}
  </section>
  <div className={styles.formats} role="group" aria-label="Choose a format">{all.map(a=>{const done=a.core.filter(x=>x.stage!=='new'&&x.stage!=='introduced').length;return <button key={a.p.format} type="button" aria-pressed={format===a.p.format} aria-label={`${a.p.title}: ${done} of ${a.core.length} starter lessons passed`} onClick={()=>setFormat(a.p.format)}><strong>{a.p.title}</strong><small>{done}/{a.core.length} passed</small></button>;})}</div>
  <section className={styles.summary} aria-label={`${path.p.title} progress`}>
   <div className={styles.bar} role="img" aria-label={`${c.remembered} remembered, ${c.applied} applied, ${c.practicing} practicing, ${c.introduced} introduced, of ${path.core.length} starter lessons`}>{(['remembered','applied','practicing','introduced'] as Stage[]).map(s=>c[s]?<span key={s} data-stage={STAGE_TONE[s]} style={{flexGrow:c[s]}}/>:null)}{c.new?<span data-stage="new" style={{flexGrow:c.new}}/>:null}</div>
   <ul className={styles.legend}>{(['remembered','applied','practicing','introduced','new'] as Stage[]).map(s=><li key={s} data-stage={STAGE_TONE[s]}><i aria-hidden="true"/>{STAGE_LABEL[s]} <b>{c[s]}</b></li>)}</ul>
  </section>
  {path.p.chapters.map(ch=><section key={ch.title} className={styles.chapter}><h4>{ch.title}</h4><ul className={styles.lessons}>{ch.lessons.map(l=>{const x=path.core.find(r=>r.lesson.id===l.id)!;return <LessonRow key={x.key} x={x} format={format}/>;})}</ul></section>)}
  {depthShown.length>0&&<section className={styles.chapter}><h4>Go deeper</h4><ul className={styles.lessons}>{depthShown.map(x=><LessonRow key={x.key} x={x} format={format}/>)}</ul></section>}
  <section className={styles.journeys}><LearningJourneys compact/></section>
 </div>;
}
function LessonRow({x,format}:{x:{key:string;lesson:PathLesson;stage:Stage;due:string|null;r?:{ticks?:number;applied?:number}};format:Format}){
 const step=STAGES.indexOf(x.stage),concept=conceptsForLesson(x.key)[0],words=concept?conceptWords(concept,format):null;
 return <li className={styles.lesson} data-stage={STAGE_TONE[x.stage]} data-lesson={x.key}>
  <div className={styles.lessonHead}><strong>{x.lesson.name}</strong><span className={styles.chip} data-stage={STAGE_TONE[x.stage]} title={STAGE_DETAIL[x.stage]}>{STAGE_LABEL[x.stage]}</span></div>
  {words&&words.title.toLowerCase()!==x.lesson.name.toLowerCase()&&<small className={styles.idea}>{words.title}</small>}
  <div className={styles.steps} aria-hidden="true">{[1,2,3,4].map(i=><span key={i} data-on={step>=i}/>)}</div>
  <div className={styles.lessonFoot}>
   <span>{x.due?<b data-due={x.due==='Review due'}>{x.due}</b>:x.stage==='new'?'Not started':x.stage==='introduced'?'Pass the quiz to start reviews':''}{x.r?.ticks?` · Seen on the island ×${x.r.ticks}`:''}</span>
   <button type="button" className={styles.link} onClick={()=>openPathLesson(x.key)}>{x.stage==='new'?'Start':'Watch again'}</button>
  </div>
 </li>;
}
