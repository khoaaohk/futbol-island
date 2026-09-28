'use client';
import {useEffect,useRef,useState} from 'react';
import {CUSTOMIZATION_OPTIONS} from '@/lib/town/customization';
import {RIDE_CATEGORIES,ridesOpenedBy,useFinishedPaths,PATH_COUNT} from '@/lib/town/rideUnlocks';
import {readCardOffers} from '@/lib/town/cardRewardStore';
import styles from './CostumeMilestoneToast.module.css';

/** The finished-path count already announced (so old progress never replays a toast). */
const KEY='fi2-ride-unlock-announced-v1';
const readAnnounced=()=>{try{const v=localStorage.getItem(KEY);return v===null?null:Number(v)||0;}catch{return 0;}};
const saveAnnounced=(n:number)=>{try{localStorage.setItem(KEY,String(n));}catch{}};

/** Ride labels opened by paths (from, to], one or two per category, in category order. */
function openedLabels(from:number,to:number){
 const labels:string[]=[];
 for(let n=from+1;n<=to;n++){const opened=ridesOpenedBy(n);for(const c of RIDE_CATEGORIES)for(const id of opened[c]){const label=CUSTOMIZATION_OPTIONS[c].find(o=>o.id===id)?.label;if(label)labels.push(label);}}
 return labels;
}

/**
 * "New rides unlocked!" (user, Sep 25 2026: each finished path unlocks the next ride in every category, lib/town/rideUnlocks.ts).
 * Same pattern as CostumeMilestoneToast: it waits behind the path's card offer and any dialog (`blocked`, plus a pending offer),
 * then shows for a few seconds; a tap hides it. The first run only records paths already finished. No timers run at rest.
 */
export default function RideUnlockToast({blocked}:{blocked:boolean}){
 const finished=useFinishedPaths();
 const [shown,setShown]=useState<{from:number;to:number}|null>(null),timer=useRef<ReturnType<typeof setTimeout>>();
 useEffect(()=>{const announced=readAnnounced();if(announced===null){saveAnnounced(finished);return;}
  if(finished<=announced||blocked||shown!==null)return;
  timer.current=setTimeout(()=>{if(readCardOffers().length>0)return;saveAnnounced(finished);setShown({from:announced,to:finished});},700);
  return ()=>clearTimeout(timer.current);},[finished,blocked,shown]);
 useEffect(()=>{if(shown===null)return;const t=setTimeout(()=>setShown(null),7000);return ()=>clearTimeout(t);},[shown]);
 if(shown===null)return null;
 const labels=openedLabels(shown.from,shown.to);
 return <button type="button" className={styles.toast} role="status" data-ride-toast="" onClick={()=>setShown(null)}>
  <b>New rides unlocked!</b>{labels.length>0&&<span className={styles.list}>{labels.join(' · ')}</span>}<span>{Math.min(shown.to,PATH_COUNT)}/{PATH_COUNT} paths finished · find them in the vending machines</span>
 </button>;
}
