'use client';
import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import styles from './CostumeMilestoneToast.module.css';
import HudSlot from './HudStack';
import {toastLane,useToastLaneBusy} from '@/lib/ui/toastLane';
import {REEF_HINT_MS,REEF_HINT_TITLE,reefHintText,reefStore} from '@/lib/town/water/reefDiscovery';

/**
 * The reef discovery hint (Oct 21 2026, user: "discovery hints for the zones"): "Something shimmers over there" with a small arrow
 * toward an Explore zone not yet explored, the first time per visit the player flies or swims within ~300 m of it
 * (lib/town/water/reefDiscovery.ts; Town.tsx raises it at 2 Hz). The one toast lane (HUD stack rule: one note at a time): a hint that
 * arrives while another note shows waits for it, and one that waited too long is dropped (the player has moved on). The arrow turns
 * with the camera at most twice a second (10° steps). One wait and one hide timeout, no loop; nothing saved.
 */
const STALE_MS=12000;
export default function ReefHintToast({blocked:held}:{blocked:boolean}){
 const busy=useToastLaneBusy('reef'),blocked=held||busy;
 const hint=useSyncExternalStore(reefStore.subscribe,()=>reefStore.get().hint,()=>null);
 const angle=useSyncExternalStore(reefStore.subscribe,()=>reefStore.get().angle,()=>0);
 const [shown,setShown]=useState<number>(0),done=useRef(0),since=useRef(0),timer=useRef<ReturnType<typeof setTimeout>>();
 useEffect(()=>{if(!hint||shown||done.current>=hint.n)return;if(!since.current)since.current=Date.now();
  if(Date.now()-since.current>STALE_MS){done.current=hint.n;since.current=0;reefStore.clearHint();return;}
  if(blocked)return;
  timer.current=setTimeout(()=>{if(!toastLane.request('reef'))return;done.current=hint.n;since.current=0;setShown(hint.n);},400);
  return ()=>clearTimeout(timer.current);},[hint,blocked,shown]);
 useEffect(()=>{if(!shown)return;const t=setTimeout(()=>setShown(0),REEF_HINT_MS);return ()=>{clearTimeout(t);toastLane.release('reef');reefStore.clearHint();};},[shown]);
 if(!shown||!hint||hint.n!==shown)return null;
 return <HudSlot><button type="button" className={styles.toast} data-hud-slot="toast" role="status" data-reef-hint={hint.id} data-reef-far={hint.far?'':undefined} onClick={()=>setShown(0)}>
  <b><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" style={{verticalAlign:'-4px',marginRight:6,transform:`rotate(${angle.toFixed(2)}rad)`,transition:'transform .4s ease'}}><path d="M12 3l7 9h-4.5v9h-5v-9H5z" fill="currentColor"/></svg>{REEF_HINT_TITLE}</b>
  <span className={styles.list}>{reefHintText(hint,hint.far)}</span><span>Explore · tap to close</span>
 </button></HudSlot>;
}
