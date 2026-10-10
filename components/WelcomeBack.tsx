'use client';
import {useEffect,useState} from 'react';
import {checkWelcomeBack,markWelcomeBackSeen,welcomeBackLine,WELCOME_BACK_SHOW_MS} from '@/lib/town/welcomeBack';
import {useGraduations} from '@/lib/endgame/graduationStore';
import {ferryUnlocked,finaleComplete} from '@/lib/endgame/graduationModel';
import {suggestedNextStep} from '@/lib/paths/pathContinue';
import {FORMAT_PATHS} from '@/lib/paths/formatPaths';
import {useQuestEvidence} from '@/lib/town/questProgress';
import {useQuizCompletions} from '@/lib/town/quizProgress';
import {DAILY_PLAY_COINS,DAILY_PLAY_SECONDS} from '@/lib/town/dailyPlay';
import toast from './CostumeMilestoneToast.module.css';
import styles from './WelcomeBack.module.css';
import HudSlot from './HudStack';
import {SAVE_CODE_KEY,SAVE_NUDGE_KEY} from '@/lib/saves/snapshot';
/**
 * Welcome-back card (G-10, lib/town/welcomeBack.ts). Shown once on the first load of a new day, after the island is ready and
 * nothing else is open. A note, not a menu (user, Oct 1 2026): no buttons. It hides on its own after WELCOME_BACK_SHOW_MS, or
 * on a tap. The dwell only runs while the card is on screen: while `blocked` (a lesson, a job, a modal) or `held` (the HUD stack
 * is covered) its timer is cleared, and it gets a fresh dwell when it comes back, the same rule as IslandJobs' notes.
 * One timeout, no loop; the toast's one entrance animation only. The next lesson itself stays one tap away in Paths (Continue).
 */
let decided:boolean|null=null,shown=false;
/** Dev-only: e2e tests that interact with the card can hold it longer (window.__fi2WelcomeMs); production always uses 6 s. */
const welcomeDwellMs=()=>{if(process.env.NODE_ENV!=='production'&&typeof window!=='undefined'){const v=(window as unknown as {__fi2WelcomeMs?:number}).__fi2WelcomeMs;if(typeof v==='number'&&v>0)return v;}return WELCOME_BACK_SHOW_MS;};
export default function WelcomeBack({blocked,held=false}:{blocked:boolean;held?:boolean}){
 const [due,setDue]=useState(false),[open,setOpen]=useState(false),[nudge,setNudge]=useState(false);
 const evidence=useQuestEvidence(),answers=useQuizCompletions(),graduations=useGraduations();
 // Decided once per page load (the module-level `decided` makes React's dev double effect a no-op). Today is recorded only when
 // the card actually shows, so a day it stayed blocked is offered again on the next load (bug audit B14).
 useEffect(()=>{if(decided===null){let storage:Storage|null=null;try{storage=localStorage;}catch{}decided=checkWelcomeBack(storage);}if(decided&&!shown)setDue(true);},[]);
 useEffect(()=>{if(due&&!blocked){shown=true;let storage:Storage|null=null;try{storage=localStorage;}catch{}
  // Save codes (Oct 10 2026, doc §3.1 "A later nudge"): once, after a first card or graduation earned without a code. Never again.
  try{if(storage?.getItem(SAVE_NUDGE_KEY)==='due'&&!storage.getItem(SAVE_CODE_KEY)){storage.setItem(SAVE_NUDGE_KEY,'shown');setNudge(true);}}catch{}
  markWelcomeBackSeen(storage);setOpen(true);setDue(false);}},[due,blocked]);
 const onScreen=open&&!blocked&&!held;
 useEffect(()=>{if(!onScreen)return;const t=setTimeout(()=>setOpen(false),welcomeDwellMs());return()=>clearTimeout(t);},[onScreen]);
 if(!open||blocked)return null;
 let storage:Storage|null=null;try{storage=localStorage;}catch{}
 const target=suggestedNextStep(storage,new Set(evidence.steps),answers);
 const title=target.kind==='lesson'?`${FORMAT_PATHS.find(p=>p.format===target.format)?.title??target.format} · ${target.index+1}. ${target.lesson.name}`:null;
 return <HudSlot><button type="button" className={`${toast.toast} ${styles.card}`} role="status" data-hud-slot="guide" data-welcome-back onClick={()=>setOpen(false)}>
  <b>Welcome back!</b>
  <span>{welcomeBackLine(title,ferryUnlocked(graduations),finaleComplete(graduations))}</span>
  <span className={styles.note}>Walk, ride or fly for {DAILY_PLAY_SECONDS} seconds today for a {DAILY_PLAY_COINS}-coin bonus.</span>
  {nudge&&<span className={styles.note} data-save-nudge>Want to keep this? Get a save code in Settings.</span>}
 </button></HudSlot>;
}
