'use client';
import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import {waterStore} from '@/lib/town/water/waterHud';
import {RAY_LESSONS,RAY_LESSON_KIND,rayLessonFor,type RaySpecies} from '@/lib/town/seaLifeAreas';
import styles from './CostumeMilestoneToast.module.css';
import HudSlot from './HudStack';
import {toastLane,useToastLaneBusy} from '@/lib/ui/toastLane';

/**
 * The ray lesson (Oct 20 2026): the swim-lesson toast (SwimLessonToast.tsx), the first time each ray kind (manta, eagle, sting)
 * is spotted in a visit (seaLifeAreas.ts RAY_LESSONS; Town.tsx bumps waterStore.rayLesson with the kind). Per visit, so nothing
 * is saved; a bump that arrives while another toast holds the lane waits for it, and a newer bump replaces an unshown one.
 * One wait and one hide timeout, no loop.
 */
export default function RayLessonToast({blocked:held}:{blocked:boolean}){
 const busy=useToastLaneBusy('ray'),blocked=held||busy;
 const due=useSyncExternalStore(waterStore.subscribe,()=>waterStore.get().rayLesson,()=>0);
 const kind=useSyncExternalStore(waterStore.subscribe,()=>waterStore.get().rayKind,()=>null);
 const [shown,setShown]=useState<{title:string;text:string}|null>(null),done=useRef(0),timer=useRef<ReturnType<typeof setTimeout>>();
 useEffect(()=>{if(!due||shown||done.current>=due||!kind||!(kind in RAY_LESSONS))return;toastLane.want('ray');if(blocked)return;
  timer.current=setTimeout(()=>{if(!toastLane.request('ray'))return;done.current=due;setShown(rayLessonFor(kind as RaySpecies,due-1));},500);
  return ()=>clearTimeout(timer.current);},[due,kind,blocked,shown]);
 useEffect(()=>{if(!shown)return;const t=setTimeout(()=>setShown(null),5000);return ()=>{clearTimeout(t);toastLane.release('ray');};},[shown]);
 if(!shown)return null;
 return <HudSlot><button type="button" className={styles.toast} data-hud-slot="toast" role="status" data-swim-lesson="ray" data-ray-kind={kind??undefined} onClick={()=>setShown(null)}>
  <b>{shown.title}</b><span className={styles.list}>{shown.text}</span><span>{RAY_LESSON_KIND}</span>
 </button></HudSlot>;
}
