'use client';
import {useEffect,useRef,useState} from 'react';
import {useCoinProgress} from '@/lib/town/coinProgress';
import {costumeMilestoneReached,costumesAtMilestone} from '@/lib/town/coinQuest';
import {readCardOffers} from '@/lib/town/cardRewardStore';
import styles from './CostumeMilestoneToast.module.css';
import HudSlot from './HudStack';
import {toastLane,useToastLaneBusy} from '@/lib/ui/toastLane';

/** The highest costume milestone already announced (so old progress never replays a toast). */
const KEY='fi2-costume-milestone-v1';
const readAnnounced=()=>{try{const v=localStorage.getItem(KEY);return v===null?null:Number(v)||0;}catch{return 0;}};
const saveAnnounced=(n:number)=>{try{localStorage.setItem(KEY,String(n));}catch{}};

/**
 * "3 new costumes unlocked!" (user, Sep 25 2026: every 10 balls unlocks three costumes). It waits its turn behind the ball's lesson
 * card and any card offer (`blocked`, plus a pending offer in the store), then shows for a few seconds; a tap hides it. The first
 * run only records the milestone already reached, so existing players see it at their next milestone. No timers run at rest.
 */
export default function CostumeMilestoneToast({blocked:held}:{blocked:boolean}){
 // HUD stack toast lane (docs/ui/HUD_STACK.md): wait while another note is on screen, hold the lane while this one shows.
 const busy=useToastLaneBusy('costume'),blocked=held||busy;
 const balls=useCoinProgress().collected.length,reached=costumeMilestoneReached(balls);
 const [shown,setShown]=useState<number|null>(null),timer=useRef<ReturnType<typeof setTimeout>>();
 useEffect(()=>{const announced=readAnnounced();if(announced===null){saveAnnounced(reached);return;}
  if(reached<=announced||blocked||shown!==null)return;
  // A lesson card closing lets the card offer open next: settle for a moment, then check again before taking the turn.
  timer.current=setTimeout(()=>{if(readCardOffers().length>0||!toastLane.request('costume'))return;saveAnnounced(reached);setShown(reached);},700);
  return ()=>clearTimeout(timer.current);},[reached,blocked,shown]);
 useEffect(()=>{if(shown===null)return;const t=setTimeout(()=>setShown(null),6000);return ()=>{clearTimeout(t);toastLane.release('costume');};},[shown]);
 if(shown===null)return null;
 const n=costumesAtMilestone(shown);
 return <HudSlot><button type="button" className={styles.toast} data-hud-slot="toast" role="status" onClick={()=>setShown(null)}>
  <b>{n} new costume{n===1?'':'s'} unlocked!</b><span>{shown} balls found · see them in your wardrobe</span>
 </button></HudSlot>;
}
