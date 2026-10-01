'use client';
/**
 * Island host for the learning loop (docs/learning/spaced-review.md, apply-in-play.md). Mounted once by Town.
 *  - Opens the Daily warm-up / My football drawer on LEARNING_REVIEW_OPEN (the welcome-back card, the Paths entry, the backpack).
 *  - Shows the live-match "Spot it!" card: lib/learning/spotIt.ts decides (event-driven, throttled); this only renders it and
 *    hides it with one timeout. No loops, no polling. The drawer's code loads on first open.
 */
import dynamic from 'next/dynamic';
import {useEffect,useState} from 'react';
import {LEARNING_REVIEW_OPEN,learnedLessonFor,openPathLesson,creditConceptTick,type LearningReviewView} from '@/lib/learning/reviewStore';
import {connectSpotIt,SPOT_IT_SHOW_MS,type SpotItOffer} from '@/lib/learning/spotIt';
import {FORMAT_PATH_LAUNCH} from '@/lib/paths/formatPaths';
import {LEARNING_LAUNCH} from '@/lib/town/learningProgress';
import styles from './LearningReview.module.css';
import HudSlot from './HudStack';
const LearningReview=dynamic(()=>import('./LearningReview'),{ssr:false});

/** Spot it sits in the HUD stack's focus slot (docs/ui/HUD_STACK.md): `onSpotChange` tells Town's arbiter an offer is waiting and
 *  `spotAllowed` says it holds the focus (a nearer Talk / Enter wins; Spot it outranks the hint and the ambient Learn card). */
export default function LearningHost({blocked=false,spotAllowed=true,onSpotChange,onOpenChange}:{blocked?:boolean;spotAllowed?:boolean;onSpotChange?:(waiting:boolean)=>void;onOpenChange?:(open:boolean)=>void}){
 const [view,setView]=useState<LearningReviewView>('review'),[open,setOpen]=useState(false),[loaded,setLoaded]=useState(false);
 const [spot,setSpot]=useState<SpotItOffer|null>(null);
 useEffect(()=>{
  const show=(e:Event)=>{const v=(e as CustomEvent<{view?:LearningReviewView}>).detail?.view;setView(v==='mastery'?'mastery':'review');setLoaded(true);setOpen(true);setSpot(null);};
  // Opening a lesson from the drawer (Watch again) or a journey closes it so the pitch is visible.
  const launched=()=>{setOpen(false);setSpot(null);};
  window.addEventListener(LEARNING_REVIEW_OPEN,show);window.addEventListener(FORMAT_PATH_LAUNCH,launched);window.addEventListener(LEARNING_LAUNCH,launched);
  const off=connectSpotIt((concept,format)=>learnedLessonFor(concept,format),offer=>setSpot(offer));
  // Dev only (HUD stack screenshots, docs/ui/HUD_STACK.md): show a Spot it card on demand.
  if(process.env.NODE_ENV!=='production')(window as unknown as {__fi2SpotIt?:(o:SpotItOffer)=>void}).__fi2SpotIt=setSpot;
  return()=>{off();window.removeEventListener(LEARNING_REVIEW_OPEN,show);window.removeEventListener(FORMAT_PATH_LAUNCH,launched);window.removeEventListener(LEARNING_LAUNCH,launched);};
 },[]);
 // QA11 H-1 (heat): the drawer covers the island, so Town sleeps its render loop while it is open (like GraduationHost).
 useEffect(()=>{onOpenChange?.(open);return()=>{if(open)onOpenChange?.(false);};},[open,onOpenChange]);
 useEffect(()=>{if(!spot)return;const t=setTimeout(()=>setSpot(null),SPOT_IT_SHOW_MS);return()=>clearTimeout(t);},[spot]);
 useEffect(()=>{onSpotChange?.(!!spot&&!open&&!blocked);},[spot,open,blocked,onSpotChange]);
 return <>
  {spot&&!open&&!blocked&&spotAllowed&&<HudSlot><div className={styles.spot} role="status" data-hud-slot="focus" data-spot-it={spot.concept}>
   <b>You learned this! {spot.title}</b><p>{spot.line}</p>
   <button type="button" className={styles.primary} onClick={()=>{creditConceptTick(spot.concept,`match:${spot.concept}`,spot.format);openPathLesson(spot.lesson);setSpot(null);}}>See the lesson</button>
   <button type="button" className={styles.dismiss} aria-label="Dismiss" onClick={()=>setSpot(null)}>×</button>
  </div></HudSlot>}
  {loaded&&<LearningReview open={open} view={view} onView={setView} onClose={()=>setOpen(false)}/>}
 </>;
}
