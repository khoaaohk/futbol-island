'use client';
/**
 * The Island Line ride HUD (train Phase 3, Nov 23 2026): the world-anchored "Board" prompt on a platform (placed by
 * lib/town/trainRide.ts like the other island prompts; E works too) and the on-board announcement (the between-stops quiz is gone,
 * owner Nov 25 2026). Get off and the horn take the action cluster (Town).
 * Reads lib/town/trainRide.ts' store (written only on changes); no loops here (one timeout per shown toast).
 */
import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import {trainRideStore,trainRideActions,TRAIN_VIEW_LABEL,type TrainView} from '@/lib/town/trainRide';
import HudSlot from './HudStack';
import styles from './TrainRideHud.module.css';

const CamIcon=()=><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><rect x="2.5" y="7" width="13" height="10" rx="2.5"/><path d="m15.5 11 6-3.2v8.4l-6-3.2"/></svg>;
/** The ride's camera button (owner, Nov 24 2026): top left in the Paths button's place, the live-join camera button's look. RIDE 3
 *  (owner shot 42): tap only: a tap (or C) cycles the views, no hold / right-click list; a toast under the coins pill names the view. */
function TrainCamera({view}:{view:TrainView}){
 return <button type="button" className={styles.cam} data-train-cam data-view={view} title="Change camera · C" aria-label={`Camera: ${TRAIN_VIEW_LABEL[view]}. Tap for the next view`}
  onClick={()=>trainRideActions.press('camera','tap')}><CamIcon/></button>;
}
/** How long the ride's toasts stay (ms): the view name, an announcement. */
export const RIDE_VIEW_MS=1600,RIDE_NOTE_MS=7000;
/** RIDE 3 (owner shot 47): the ride's toasts (the view name, "All aboard", "Next stop…", "Doors closing"…) sit in the island HUD
 *  stack, directly under the coins pill with the island's gap (and under "New update ready" when it shows, globals.css), the view
 *  name over the announcement. Each is removed after its time (one timeout while it shows), so nothing hidden keeps its space. */
function RideToasts({view,viewNo,note,notes}:{view:TrainView;viewNo:number;note:string;notes:number}){
 const [shownView,setShownView]=useState<{label:string;n:number}|null>(null),[shownNote,setShownNote]=useState<{text:string;n:number}|null>(null),first=useRef(viewNo),firstNote=useRef(-1);
 useEffect(()=>{if(viewNo===first.current)return;setShownView({label:TRAIN_VIEW_LABEL[view],n:viewNo});const t=setTimeout(()=>setShownView(null),RIDE_VIEW_MS);return()=>clearTimeout(t);},[view,viewNo]);
 useEffect(()=>{if(!note||notes===firstNote.current)return;firstNote.current=notes;setShownNote({text:note,n:notes});const t=setTimeout(()=>setShownNote(null),RIDE_NOTE_MS);return()=>clearTimeout(t);},[note,notes]);
 return <>
  {shownView&&<HudSlot><p key={shownView.n} className={styles.camToast} data-hud-slot="ride" data-ride-order="1" role="status" aria-live="polite" data-train-cam-toast>{shownView.label}</p></HudSlot>}
  {shownNote&&<HudSlot><p key={shownNote.n} className={styles.note} data-hud-slot="ride" data-ride-order="2" data-train-note role="status" aria-live="polite">{shownNote.text}</p></HudSlot>}
 </>;
}

export default function TrainRideHud(){
 const v=useSyncExternalStore(trainRideStore.subscribe,trainRideStore.get,trainRideStore.server);
 return <>
  <button type="button" className={`store-enter-prompt ${styles.board}`} data-train-board aria-label="Board the train" hidden onClick={()=>trainRideActions.board()}>Board</button>
  {/* Easy exit (owner, Nov 24 2026): the big primary "Get off at <Station>" pill, bottom centre, from braking in until the doors
      close (every camera view, seated or standing); a press before the doors open waits for them ("Doors opening…"). */}
  {v.riding&&v.exitTo&&<button type="button" className={`store-enter-prompt ${styles.exit}`} data-train-exit data-closing={v.closing?'':undefined} aria-label={v.exitQueued?`Getting off at ${v.exitTo} as the doors open`:`Get off at ${v.exitTo}`} onClick={()=>trainRideActions.press('getoff','tap')}>
   <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 3h9v18H4z M13 12h7 M17 9l3 3-3 3 M8 11v.01"/></svg>
   <span>{v.exitQueued?'Doors opening…':`Get off at ${v.exitTo}`}</span></button>}
  {v.riding&&<TrainCamera view={v.camView}/>}
  {v.riding&&<RideToasts view={v.camView} viewNo={v.viewNo} note={v.note} notes={v.notes}/>}
 </>;
}
