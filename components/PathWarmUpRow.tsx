'use client';
/**
 * Paths → Warm-up row (Oct 4 2026, clear path). The spaced-review warm-up (components/LearningReview.tsx) lost its only way in
 * when the Paths Review card was removed on Oct 1; the user approved this small, permanent row near the top of Paths instead.
 * Calm on purpose: a count when lessons are due, "All caught up" otherwise; no streaks, no red. Tapping opens the unchanged
 * warm-up drawer (LearningHost), which also explains an empty or finished warm-up. Heat: static DOM, no timers; the review
 * schedule syncs once when Paths opens (enrolls lessons passed since the last visit).
 */
import {useEffect} from 'react';
import {openLearningReview,syncReviews,useReviewState} from '@/lib/learning/reviewStore';
import {warmUpRow} from '@/lib/learning/warmUpRow';
import {Icon} from './Icon';
import styles from './PathWarmUpRow.module.css';
export default function PathWarmUpRow(){
 const state=useReviewState(),row=warmUpRow(state,Date.now());
 useEffect(()=>{try{syncReviews();}catch{}},[]);
 return <button type="button" className={styles.row} data-path-warmup={row.kind} data-due={row.kind==='due'?row.due:0} onClick={()=>openLearningReview()}>
  <span className={styles.badge} data-kind={row.kind} aria-hidden="true">{row.kind==='due'?row.questions:row.kind==='caught-up'?<Icon name="check" size={16}/>:<Icon name="star" size={15}/>}</span>
  <span className={styles.copy}><span className={styles.eyebrow}>Warm-up</span><strong>{row.title}</strong><small>{row.detail}</small></span>
  <span className={styles.arrow} aria-hidden="true"><Icon name="arrow" size={20}/></span>
 </button>;
}
