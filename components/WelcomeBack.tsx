'use client';
import {useEffect,useState} from 'react';
import {checkWelcomeBack} from '@/lib/town/welcomeBack';
import {suggestedNextStep,PATH_LAST_OPENED_KEY,savedLastOpened} from '@/lib/paths/pathContinue';
import {FORMAT_PATH_LAUNCH,FORMAT_PATHS,lessonEvidence} from '@/lib/paths/formatPaths';
import {useQuestEvidence} from '@/lib/town/questProgress';
import {useQuizCompletions} from '@/lib/town/quizProgress';
import {DAILY_PLAY_COINS,DAILY_PLAY_SECONDS} from '@/lib/town/dailyPlay';
import {useDueReviewCount,openLearningReview} from '@/lib/learning/reviewStore';
import toast from './CostumeMilestoneToast.module.css';
import styles from './WelcomeBack.module.css';
import HudSlot from './HudStack';
/**
 * Welcome-back card (G-10, lib/town/welcomeBack.ts). Shown once on the first load of a new day, after the island is ready and
 * nothing else is open. Static: no timers, no animation loop (the toast's one entrance animation only). Tap Go (or Warm-up) or Later; every button is a 44 px target.
 */
let decided:boolean|null=null,shown=false;
export default function WelcomeBack({blocked}:{blocked:boolean}){
 const [due,setDue]=useState(false),[open,setOpen]=useState(false);
 const evidence=useQuestEvidence(),answers=useQuizCompletions(),reviews=useDueReviewCount();
 // Decided once per page load (checkWelcomeBack also records today, so a second call, e.g. React's dev double effect, says no).
 useEffect(()=>{if(decided===null){let storage:Storage|null=null;try{storage=localStorage;}catch{}decided=checkWelcomeBack(storage);}if(decided&&!shown)setDue(true);},[]);
 useEffect(()=>{if(due&&!blocked){shown=true;setOpen(true);setDue(false);}},[due,blocked]);
 if(!open||blocked)return null;
 let storage:Storage|null=null;try{storage=localStorage;}catch{}
 const steps=new Set(evidence.steps),target=suggestedNextStep(storage,steps,answers);
 const go=()=>{setOpen(false);if(target.kind!=='lesson')return;const path=FORMAT_PATHS.find(p=>p.format===target.format)!,s=lessonEvidence(path.format,target.lesson,steps,answers);
  try{localStorage.setItem(PATH_LAST_OPENED_KEY,JSON.stringify({...savedLastOpened(localStorage),[target.format]:target.lesson.id}));}catch{}
  window.dispatchEvent(new CustomEvent(FORMAT_PATH_LAUNCH,{detail:{format:target.format,lessonId:target.lesson.id,step:s.step,quiz:s.quiz,question:s.question,nonce:Date.now()}}));};
 const title=target.kind==='lesson'?`${FORMAT_PATHS.find(p=>p.format===target.format)?.title??target.format} · ${target.index+1}. ${target.lesson.name}`:null;
 return <HudSlot><section className={`${toast.toast} ${styles.card}`} role="status" aria-label="Welcome back" data-hud-slot="guide" data-welcome-back>
  <b>Welcome back!</b>
  {title?<span>Next up: {title}</span>:<span>Every starter path is done. Replay a favourite or go deeper!</span>}
  <span className={styles.note}>Walk, ride or fly for {DAILY_PLAY_SECONDS} seconds today for a {DAILY_PLAY_COINS}-coin bonus.</span>
  <div className={styles.actions}>
   {title&&<button type="button" className={styles.go} data-welcome-go onClick={go}>Go</button>}
   {reviews>0&&<button type="button" className={styles.later} data-welcome-warmup onClick={()=>{setOpen(false);openLearningReview('review');}}>Warm-up</button>}
   {/* QA11 C-6: My football is always one tap away from the welcome-back card (not only through a due warm-up). */}
   <button type="button" className={styles.later} data-welcome-myfootball onClick={()=>{setOpen(false);openLearningReview('mastery');}}>My football</button>
   <button type="button" className={styles.later} onClick={()=>setOpen(false)}>Later</button>
  </div>
 </section></HudSlot>;
}
