'use client';
import {useEffect,useState} from 'react';
import {checkWelcomeBack,markWelcomeBackSeen,welcomeBackLine,WELCOME_BACK_SHOW_MS} from '@/lib/town/welcomeBack';
import {useGraduations} from '@/lib/endgame/graduationStore';
import {ferryUnlocked,finaleComplete} from '@/lib/endgame/graduationModel';
import {suggestedNextStep} from '@/lib/paths/pathContinue';
import {useQuestEvidence} from '@/lib/town/questProgress';
import {useQuizCompletions} from '@/lib/town/quizProgress';
import {DAILY_PLAY_COINS,DAILY_PLAY_SECONDS} from '@/lib/town/dailyPlay';
import toast from './CostumeMilestoneToast.module.css';
import styles from './WelcomeBack.module.css';
import HudSlot from './HudStack';
import {SAVE_CODE_KEY,SAVE_NUDGE_KEY} from '@/lib/saves/snapshot';
import {toastLane,useToastLaneOwned} from '@/lib/ui/toastLane';
/** One message at a time (Nov 11 2026, owner: "don't show something shimmers and welcome back at the same time. welcome back first. the
 *  shimmer shows later"): the first moments after arriving are quiet for every lane note (ARRIVE_QUIET_MS); Welcome back opens
 *  only when no note owns the lane, HOLDS the lane while it is open (lib/ui/toastLane.ts: no note starts), then leaves a short gap
 *  (WELCOME_GAP_MS) before the next note (the reef hint, a coin note) takes its turn. Two quiet timeouts, no loop. */
export const ARRIVE_QUIET_MS=4000,WELCOME_GAP_MS=3000;
/**
 * Welcome-back card (G-10, lib/town/welcomeBack.ts). Shown once on the first load of a new day, after the island is ready and
 * nothing else is open. A note, not a menu (user, Oct 1 2026): no buttons. It hides on its own after WELCOME_BACK_SHOW_MS, or
 * on a tap. The dwell only runs while the card is on screen: while `blocked` (a lesson, a job, a modal) or `held` (the HUD stack
 * is covered) its timer is cleared, and it gets a fresh dwell when it comes back, the same rule as IslandJobs' notes.
 * One timeout, no loop; the toast's one entrance animation only. The next lesson itself stays one tap away in Paths (Continue).
 */
let decided:boolean|null=null,shown=false;
/** Test-only: e2e tests that interact with the card can hold it longer (window.__fi2WelcomeMs). Honoured in a dev build, or in a
 *  production build driven by automation (navigator.webdriver: Playwright against `next start`, FI_URL). Before Oct 15 2026 it was
 *  dev-only, so against a production build the card left after 6 s while a test was still reaching for it ("element was detached
 *  from the DOM" on desktop-chromium: part of the dwell is spent inside the boot helper). A player's browser never sets webdriver:
 *  players always get WELCOME_BACK_SHOW_MS. */
const welcomeDwellMs=()=>{if(typeof window!=='undefined'&&(process.env.NODE_ENV!=='production'||navigator.webdriver===true)){const v=(window as unknown as {__fi2WelcomeMs?:number}).__fi2WelcomeMs;if(typeof v==='number'&&v>0)return v;}return WELCOME_BACK_SHOW_MS;};
export default function WelcomeBack({blocked,held=false}:{blocked:boolean;held?:boolean}){
 const [due,setDue]=useState(false),[open,setOpen]=useState(false),[nudge,setNudge]=useState(false);
 const laneOwned=useToastLaneOwned();
 useEffect(()=>{toastLane.quiet('arrive',ARRIVE_QUIET_MS);},[]);
 const waiting=due||open;// due (not yet shown) or open: every lane note waits for it
 useEffect(()=>{if(!waiting)return;toastLane.hold('welcome',true);return()=>{toastLane.hold('welcome',false);if(shown)toastLane.quiet('welcome-gap',WELCOME_GAP_MS);};},[waiting]);
 const evidence=useQuestEvidence(),answers=useQuizCompletions(),graduations=useGraduations();
 // Decided once per page load (the module-level `decided` makes React's dev double effect a no-op). Today is recorded only when
 // the card actually shows, so a day it stayed blocked is offered again on the next load (bug audit B14).
 useEffect(()=>{if(decided===null){let storage:Storage|null=null;try{storage=localStorage;}catch{}decided=checkWelcomeBack(storage);}if(decided&&!shown)setDue(true);},[]);
 useEffect(()=>{if(due&&!blocked&&!laneOwned){shown=true;let storage:Storage|null=null;try{storage=localStorage;}catch{}
  // Save codes (Oct 10 2026, doc §3.1 "A later nudge"): once, after a first card or graduation earned without a code. Never again.
  try{if(storage?.getItem(SAVE_NUDGE_KEY)==='due'&&!storage.getItem(SAVE_CODE_KEY)){storage.setItem(SAVE_NUDGE_KEY,'shown');setNudge(true);}}catch{}
  markWelcomeBackSeen(storage);setOpen(true);setDue(false);}},[due,blocked,laneOwned]);
 const onScreen=open&&!blocked&&!held;
 useEffect(()=>{if(!onScreen)return;const t=setTimeout(()=>setOpen(false),welcomeDwellMs());return()=>clearTimeout(t);},[onScreen]);
 // Mounted once (Oct 15 2026): while blocked (a job, a lesson, a modal) the card stays in the DOM, `hidden` (display:none in the
 // stack), and the same node comes back after, instead of unmounting and remounting a new button each time `blocked` flips.
 if(!open)return null;
 let storage:Storage|null=null;try{storage=localStorage;}catch{}
 const target=suggestedNextStep(storage,new Set(evidence.steps),answers);
 const title=target.kind==='lesson'?target.lesson.name:null;
 return <HudSlot><button type="button" className={`${toast.toast} ${styles.card}`} role="status" data-hud-slot="guide" data-welcome-back hidden={blocked} onClick={()=>setOpen(false)}>
  <b>Welcome back!</b>
  <span>{welcomeBackLine(title,ferryUnlocked(graduations),finaleComplete(graduations))}</span>
  <span className={styles.note}>Move for {DAILY_PLAY_SECONDS} seconds today: +{DAILY_PLAY_COINS} coins.</span>
  {nudge&&<span className={styles.note} data-save-nudge>Want to keep this? Get a save code in Settings.</span>}
 </button></HudSlot>;
}
