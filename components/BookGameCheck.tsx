'use client';
/**
 * "Take it to your game" (docs/learning/apply-in-play.md): on a pop-up book's final page, one question that turns the book's
 * message into a football decision, tied to a Paths lesson (lib/learning/bookChecks.ts). A first-try right answer counts
 * toward that lesson's review; the first right answer pays LEARN_COINS.book once per book. Static DOM, no timers.
 */
import {useEffect,useRef,useState} from 'react';
import {BOOK_CHECKS} from '@/lib/learning/bookChecks';
import {bookLesson} from '@/lib/learning/reviewStoreCore';
import {recordBookCheck,lessonName,openPathLesson} from '@/lib/learning/reviewStore';
import {conceptWords} from '@/lib/learning/conceptMap';
import {DoneButton} from './DoneButton';
import styles from './BookGameCheck.module.css';
const DONE_KEY='fi2-book-checks-v1';
/** QA11: books whose check has had its FIRST answer (right or wrong). Only that answer can count as a first try, so closing and
 * reopening the card after a wrong answer can't retake it. Books already done (DONE_KEY) count as answered too. */
const ANSWERED_KEY='fi2-book-checks-answered-v1';
const readList=(k:string):string[]=>{try{const v=JSON.parse(localStorage.getItem(k)??'[]');return Array.isArray(v)?v.filter(x=>typeof x==='string'):[];}catch{return [];}};
const readDone=()=>readList(DONE_KEY);
const wasAnswered=(bookId:string)=>readList(ANSWERED_KEY).includes(bookId)||readDone().includes(bookId);
const markAnswered=(bookId:string)=>{try{localStorage.setItem(ANSWERED_KEY,JSON.stringify([...new Set([...readList(ANSWERED_KEY),bookId])]));}catch{}};
export default function BookGameCheck({bookId,onOpenLesson}:{bookId:string;onOpenLesson?:()=>void}){
 const check=BOOK_CHECKS[bookId as keyof typeof BOOK_CHECKS],key=bookLesson(bookId);
 const [open,setOpen]=useState(false),[answer,setAnswer]=useState<number|null>(null),[tries,setTries]=useState(0),[coins,setCoins]=useState(0),[counted,setCounted]=useState(false);
 const [done,setDone]=useState(()=>typeof window!=='undefined'&&readDone().includes(bookId));
 // Bug audit B11: focus moves into the card when it opens and back to its opener when it closes. Escape and the Tab trap are
 // scoped to the card by the book's document key handler (PlayerPopUpBook), which sees [data-book-check] first.
 const opener=useRef<HTMLButtonElement>(null),card=useRef<HTMLElement>(null),wasOpen=useRef(false);
 useEffect(()=>{if(open){wasOpen.current=true;card.current?.querySelector<HTMLElement>('button:not([disabled])')?.focus({preventScroll:true});}
  else if(wasOpen.current){wasOpen.current=false;opener.current?.focus({preventScroll:true});}},[open]);
 if(!check||!key)return null;
 const words=conceptWords(check.concept,check.format),right=answer===check.answer;
 const choose=(i:number)=>{if(answer!==null)return;setAnswer(i);const correct=i===check.answer;const first=tries===0&&!wasAnswered(bookId);if(first)markAnswered(bookId);setCounted(first&&correct);setTries(t=>t+1);
  if(correct){void recordBookCheck(bookId,true,first).then(r=>setCoins(r.coins));if(!done){setDone(true);try{localStorage.setItem(DONE_KEY,JSON.stringify([...new Set([...readDone(),bookId])]));}catch{}}}};
 return <>
  <button ref={opener} type="button" className={styles.open} data-book-check-open={bookId} onClick={()=>{setOpen(true);setAnswer(null);setTries(0);setCounted(false);}}>
   <span aria-hidden="true">⚽</span>{done?'Take it to your game ✓':'Take it to your game'}</button>
  {open&&<div className={styles.backdrop} onClick={e=>{if(e.target===e.currentTarget)setOpen(false);}}>
   <section ref={card} className={styles.card} role="dialog" aria-modal="true" aria-labelledby="book-check-title" data-book-check={bookId}>
    <span className={styles.eyebrow}>Take it to your game · {words.title}</span>
    <h3 id="book-check-title">{check.q}</h3>
    <div className={styles.options} role="group" aria-label="Choose an answer">{check.options.map((o,i)=><button key={o} type="button" data-state={answer===i?(i===check.answer?'right':'wrong'):undefined} aria-pressed={answer===i} disabled={answer!==null} onClick={()=>choose(i)}><b>{'ABC'[i]}</b>{o}</button>)}</div>
    {answer!==null&&<div className={styles.feedback} data-right={right} role="status">
     <b>{right?(tries>1?'Got it!':'Yes! That’s it.'):'Not quite.'}</b>
     <p>{right?check.why:'Think about the book again, and try another answer.'}</p>
     {right&&<p className={styles.link}>{coins?`+${coins} coins. `:''}This is the idea in <b>{lessonName(key)}</b>{counted?': it counts toward that lesson’s review.':'.'}</p>}
     <div className={styles.actions}>{right?<>
      <button type="button" className={styles.primary} onClick={()=>setOpen(false)}>Back to the book</button>
      <button type="button" className={styles.secondary} onClick={()=>{setOpen(false);onOpenLesson?.();openPathLesson(key);}}>Watch the lesson</button>
     </>:<button type="button" className={styles.secondary} onClick={()=>setAnswer(null)}>Try again</button>}</div>
    </div>}
    <DoneButton className={styles.close} data-book-check-close onDone={()=>setOpen(false)}/>
   </section>
  </div>}
 </>;
}
