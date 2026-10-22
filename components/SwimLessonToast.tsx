'use client';
import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import {SWIM_LESSON,SWIM_LESSON_KEY,waterStore} from '@/lib/town/water/waterHud';
import {SHARK_LESSON,SHARK_LESSON_KEY} from '@/lib/town/water/sharks';
import {RIDE_LESSON,RIDE_LESSON_KEY} from '@/lib/town/water/animalRides';
import {DIVE_LESSON,DIVE_LESSON_KEY} from '@/lib/town/water/diveSession';
import {countSwimLesson,countDiveLesson} from '@/lib/analytics/waterEvents';
import styles from './CostumeMilestoneToast.module.css';
import HudSlot from './HudStack';
import {toastLane,useToastLaneBusy} from '@/lib/ui/toastLane';

const readShown=(key:string)=>{try{return localStorage.getItem(key)==='1';}catch{return true;}};
const saveShown=(key:string)=>{try{localStorage.setItem(key,'1');}catch{}};
/** The same toast for the sharks' football hook (water P1a, `which="shark"`): its own key, bumped by waterStore.sharkLesson. */
const LESSONS={swim:{lesson:SWIM_LESSON,key:SWIM_LESSON_KEY,count:countSwimLesson},shark:{lesson:SHARK_LESSON,key:SHARK_LESSON_KEY,count:()=>{}},ride:{lesson:RIDE_LESSON,key:RIDE_LESSON_KEY,count:()=>{}},dive:{lesson:DIVE_LESSON,key:DIVE_LESSON_KEY,count:countDiveLesson}} as const;

/**
 * The swim lesson (Oct 15 2026, docs/swimming-research.md §3; AGENTS.md: every feature teaches football): one short line the
 * first time the player swims, once per device. The same toast pattern as RideUnlockToast: it waits behind any dialog
 * (`blocked`) and the HUD stack's toast lane, shows for a few seconds, a tap hides it. The island's loop bumps
 * waterStore.lesson when a swim starts (components/Town.tsx); no timers run at rest.
 */
export default function SwimLessonToast({blocked:held,which='swim'}:{blocked:boolean;which?:'swim'|'shark'|'ride'|'dive'}){
 const L=LESSONS[which],busy=useToastLaneBusy(which),blocked=held||busy;
 const due=useSyncExternalStore(waterStore.subscribe,()=>which==='shark'?waterStore.get().sharkLesson:which==='ride'?waterStore.get().rideLesson:which==='dive'?waterStore.get().reefLesson:waterStore.get().lesson,()=>0);
 const [shown,setShown]=useState(false),timer=useRef<ReturnType<typeof setTimeout>>();
 useEffect(()=>{if(!due||shown||readShown(L.key))return;toastLane.want(which);if(blocked)return;
  timer.current=setTimeout(()=>{if(!toastLane.request(which))return;saveShown(L.key);L.count();setShown(true);},500);
  return ()=>clearTimeout(timer.current);},[due,blocked,shown,L,which]);
 useEffect(()=>{if(!shown)return;const t=setTimeout(()=>setShown(false),5000);return ()=>{clearTimeout(t);toastLane.release(which);};},[shown,which]);
 if(!shown)return null;
 return <HudSlot><button type="button" className={styles.toast} data-hud-slot="toast" role="status" data-swim-lesson={which} onClick={()=>setShown(false)}>
  <b>{L.lesson.title}</b><span className={styles.list}>{L.lesson.text}</span><span>{L.lesson.kind}</span>
 </button></HudSlot>;
}
