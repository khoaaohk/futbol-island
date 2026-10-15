'use client';
/**
 * Beachcombing HUD (Oct 14 2026, docs/beachcombing.md): the world-anchored "Pick up the scallop shell" prompt (placed by
 * lib/graphics/beachFinds.ts like the other island prompts; E works too), the notes after a find (the HUD stack's toast slot,
 * through the shared toast lane, merged like garden picks), and the Shellbook (opened from the pocket, the stand or here).
 * Event-driven: the store changes only on a find; one timeout only while a note is on screen.
 */
import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import {beachStore,beachActions,OPEN_SHELLBOOK} from '@/lib/town/beachcombing';
import {pushToast,toastDuration,type HudToast} from '@/lib/ui/hudStack';
import {toastLane,useToastLaneBusy} from '@/lib/ui/toastLane';
import HudSlot from './HudStack';
import Shellbook from './Shellbook';
import styles from './CostumeMilestoneToast.module.css';

export default function BeachcombHud({blocked}:{blocked:boolean}){
 const v=useSyncExternalStore(beachStore.subscribe,beachStore.get,beachStore.server);
 const laneBusy=useToastLaneBusy('beach'),held=blocked||laneBusy;
 const [queue,setQueue]=useState<HudToast[]>([]),seen=useRef(v.notes);
 const [book,setBook]=useState(false),[bookLoaded,setBookLoaded]=useState(false);
 useEffect(()=>{if(!v.note||v.notes===seen.current)return;seen.current=v.notes;const n=v.note,title=n.title;
  setQueue(q=>pushToast(q,{title,detail:n.detail,merge:n.merge,retitle:n.merge?count=>title.replace(/^\+1 /,`+${count} `):undefined}));},[v.notes,v.note]);
 const toast=queue[0];
 useEffect(()=>{if(toast&&!held)toastLane.request('beach');else toastLane.release('beach');},[toast,held]);
 useEffect(()=>{if(!toast||held)return;const t=setTimeout(()=>setQueue(q=>q.slice(1)),toastDuration(queue.length-1));return()=>clearTimeout(t);},[toast,held,queue.length]);
 useEffect(()=>()=>toastLane.release('beach'),[]);
 useEffect(()=>{const open=()=>{setBookLoaded(true);setBook(true);};window.addEventListener(OPEN_SHELLBOOK,open);return()=>window.removeEventListener(OPEN_SHELLBOOK,open);},[]);
 return <>
  <button type="button" className="store-enter-prompt" data-beach-find aria-label={v.label} hidden onClick={()=>beachActions.take()}>{v.label}</button>
  {toast&&!held&&<HudSlot><button type="button" className={styles.toast} data-hud-slot="toast" role="status" aria-live="polite" data-beach-note onClick={()=>setQueue(q=>q.slice(1))}>
   <b>{toast.title}</b><span>{toast.detail}</span>
  </button></HudSlot>}
  {bookLoaded&&<Shellbook open={book} onClose={()=>setBook(false)}/>}
 </>;
}
