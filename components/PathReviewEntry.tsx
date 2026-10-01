'use client';
/** Paths → "Review" entry (docs/learning/spaced-review.md): how many lessons are ready for the Daily warm-up, plus My football. */
import {useEffect} from 'react';
import {openLearningReview,syncReviews,useDueReviewCount,useReviewState} from '@/lib/learning/reviewStore';
import styles from './PathReviewEntry.module.css';
export default function PathReviewEntry(){
 const state=useReviewState(),due=useDueReviewCount();
 // Enroll lessons passed since the last visit (first review tomorrow). Once per Paths open, never on a timer.
 useEffect(()=>{syncReviews();},[]);
 const enrolled=Object.values(state.lessons).filter(r=>r.enrolled>0).length;
 return <section className={styles.entry} aria-label="Review" data-path-review={due}>
  <div><span className={styles.eyebrow}>{due?'Review · ready now':'Review'}</span>
   <strong>{due?`${due} ${due===1?'lesson':'lessons'} to warm up`:enrolled?'All caught up':'Lessons come back to review'}</strong>
   <small>{due?'One quick question each. Remembering later makes ideas stick.':enrolled?'Your next warm-up opens on a later day.':'Pass a quiz and it comes back tomorrow for one quick question.'}</small></div>
  <div className={styles.buttons}>
   {due>0&&<button type="button" className={styles.primary} onClick={()=>openLearningReview('review')}>Warm up</button>}
   <button type="button" className={styles.secondary} onClick={()=>openLearningReview('mastery')}>My football</button>
  </div>
 </section>;
}
