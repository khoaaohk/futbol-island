'use client';
/**
 * The Island Line ride HUD (train Phase 3, Nov 23 2026): the world-anchored "Board" prompt on a platform (placed by
 * lib/town/trainRide.ts like the other island prompts; E works too), the on-board announcement, and one quiz question per run
 * between stops (a right answer pays learning coins once per question). Get off and the horn take the action cluster (Town).
 * Reads lib/town/trainRide.ts' store (written only on changes); the announcement fades by CSS, so no timers or loops here.
 */
import {useSyncExternalStore} from 'react';
import {trainRideStore,trainRideActions} from '@/lib/town/trainRide';
import styles from './TrainRideHud.module.css';

export default function TrainRideHud(){
 const v=useSyncExternalStore(trainRideStore.subscribe,trainRideStore.get,trainRideStore.server);
 const q=v.quiz,done=!!q&&q.picked>=0,right=done&&q!.picked===q!.correct;
 return <>
  <button type="button" className={`store-enter-prompt ${styles.board}`} data-train-board aria-label="Board the train" hidden onClick={()=>trainRideActions.board()}>Board</button>
  {/* Easy exit (owner, Nov 24 2026): the big primary "Get off at <Station>" pill, bottom centre, from braking in until the doors
      close (every camera view, seated or standing); a press before the doors open waits for them ("Doors opening…"). */}
  {v.riding&&v.exitTo&&<button type="button" className={`store-enter-prompt ${styles.exit}`} data-train-exit data-closing={v.closing?'':undefined} aria-label={v.exitQueued?`Getting off at ${v.exitTo} as the doors open`:`Get off at ${v.exitTo}`} onClick={()=>trainRideActions.press('getoff','tap')}>
   <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 3h9v18H4z M13 12h7 M17 9l3 3-3 3 M8 11v.01"/></svg>
   <span>{v.exitQueued?'Doors opening…':`Get off at ${v.exitTo}`}</span></button>}
  {v.riding&&v.note&&<p key={v.notes} className={styles.note} data-train-note role="status" aria-live="polite">{v.note}</p>}
  {v.riding&&q&&<section className={styles.quiz} data-train-quiz aria-label="Train quiz">
   <p className={styles.kicker}>Quiz between stops</p>
   <p className={styles.q}>{q.q}</p>
   <div className={styles.options}>{q.options.map((o,i)=><button key={i} type="button" className={styles.option} disabled={done} data-state={done?(i===q.correct?'right':i===q.picked?'wrong':undefined):undefined} onClick={()=>trainRideActions.answer(i)}>{o}</button>)}</div>
   {done&&<p className={styles.explain} role="status">{right?'Right! ':'Not quite. '}{q.explain}</p>}
  </section>}
 </>;
}
