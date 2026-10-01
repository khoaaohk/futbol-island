'use client';
/**
 * Gentle fuel notes (low tank, out of fuel, a ride refused) in the HUD stack's toast slot through the shared toast lane
 * (docs/ui/HUD_STACK.md, lib/ui/toastLane.ts): same pattern and style as RideUnlockToast. Each note shows once; nothing repeats
 * while the tank stays low. Event-driven: the store only publishes a note when fuel crosses a line or a ride is refused.
 */
import {useEffect,useRef,useState} from 'react';
import {useFuelNotice} from '@/lib/town/fuelStore';
import type {FuelNotice} from '@/lib/town/fuel';
import styles from './CostumeMilestoneToast.module.css';
import HudSlot from './HudStack';
import {toastLane,useToastLaneBusy} from '@/lib/ui/toastLane';

export default function FuelToast({blocked:held}:{blocked:boolean}){
 const busy=useToastLaneBusy('fuel'),notice=useFuelNotice();
 const [shown,setShown]=useState<FuelNotice|null>(null),done=useRef(0);
 // Show the newest unseen note once the lane is free (a note made while a lesson was open waits for the island). A newer fuel
 // note replaces the one on screen at once (it already holds the lane).
 useEffect(()=>{if(!notice||notice.id<=done.current||held)return;if(!shown&&(busy||!toastLane.request('fuel')))return;done.current=notice.id;setShown(notice);},[notice,held,busy,shown]);
 useEffect(()=>{if(!shown)return;const t=setTimeout(()=>setShown(null),6000);return ()=>clearTimeout(t);},[shown]);
 useEffect(()=>{if(!shown)toastLane.release('fuel');},[shown]);
 useEffect(()=>()=>toastLane.release('fuel'),[]);
 if(!shown)return null;
 return <HudSlot><button type="button" className={styles.toast} data-hud-slot="toast" role="status" aria-live="polite" data-fuel-toast={shown.kind} onClick={()=>setShown(null)}>
  <b>{shown.title}</b><span>{shown.detail}</span>
 </button></HudSlot>;
}
