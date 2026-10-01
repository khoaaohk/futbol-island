'use client';
/**
 * Gentle fuel notes (low tank, out of fuel, a ride refused) in the HUD stack's toast slot through the shared toast lane
 * (docs/ui/HUD_STACK.md, lib/ui/toastLane.ts): same pattern and style as RideUnlockToast. Each note shows once; nothing repeats
 * while the tank stays low. Event-driven: the store only publishes a note when fuel crosses a line or a ride is refused.
 */
import {useEffect,useState} from 'react';
import {useFuelNotice,fuelStore} from '@/lib/town/fuelStore';
import {noticeApplies,type FuelNotice} from '@/lib/town/fuel';
import styles from './CostumeMilestoneToast.module.css';
import HudSlot from './HudStack';
import {toastLane,useToastLaneBusy} from '@/lib/ui/toastLane';

/** The newest note already shown, kept for the page's life (bug S1): the store's note outlives this component, so a remount (the
 *  HUD toggling back on) must not replay it. */
let shownId=0;
export const FUEL_TOAST_MS=6000;

export default function FuelToast({blocked:held}:{blocked:boolean}){
 const busy=useToastLaneBusy('fuel'),notice=useFuelNotice();
 const [shown,setShown]=useState<FuelNotice|null>(null);
 // Show the newest unseen note once the lane is free (a note made while a lesson was open waits for the island). A newer fuel
 // note replaces the one on screen at once (it already holds the lane). A low / empty note that stopped being true while it
 // waited (the player ate) is dropped, never shown late (bug A3).
 useEffect(()=>{if(!notice||notice.id<=shownId||held)return;
  if(!noticeApplies(notice,fuelStore.read().fuel)){shownId=notice.id;return;}
  if(!shown&&(busy||!toastLane.request('fuel')))return;shownId=notice.id;setShown(notice);},[notice,held,busy,shown]);
 // The timer runs only while the note can be seen: an overlay (the pocket, a lesson, settings) pauses it, like the other notes.
 useEffect(()=>{if(!shown||held)return;const t=setTimeout(()=>setShown(null),FUEL_TOAST_MS);return ()=>clearTimeout(t);},[shown,held]);
 // Eating (or a new day) while the note shows: a note that is no longer true goes away.
 useEffect(()=>{if(shown&&notice!==shown&&!noticeApplies(shown,fuelStore.read().fuel))setShown(null);},[notice,shown]);
 useEffect(()=>{if(!shown)toastLane.release('fuel');},[shown]);
 useEffect(()=>()=>toastLane.release('fuel'),[]);
 if(!shown||held)return null;
 return <HudSlot><button type="button" className={styles.toast} data-hud-slot="toast" role="status" aria-live="polite" data-fuel-toast={shown.kind} onClick={()=>setShown(null)}>
  <b>{shown.title}</b><span>{shown.detail}</span>
 </button></HudSlot>;
}
