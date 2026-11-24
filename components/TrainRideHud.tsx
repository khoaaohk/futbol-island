'use client';
/**
 * The Island Line ride HUD (train Phase 3, Nov 23 2026): the world-anchored "Board" prompt on a platform (placed by
 * lib/town/trainRide.ts like the other island prompts; E works too) and the on-board announcement (the between-stops quiz is gone,
 * owner Nov 25 2026). Get off and the horn take the action cluster (Town).
 * Reads lib/town/trainRide.ts' store (written only on changes); the announcement fades by CSS, so no timers or loops here.
 */
import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import {trainRideStore,trainRideActions,TRAIN_VIEWS,TRAIN_VIEW_LABEL,type TrainView} from '@/lib/town/trainRide';
import styles from './TrainRideHud.module.css';

/** Long press (ms) on the camera button opens the view menu. */
const HOLD_MS=450;
const CamIcon=()=><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><rect x="2.5" y="7" width="13" height="10" rx="2.5"/><path d="m15.5 11 6-3.2v8.4l-6-3.2"/></svg>;
/** The ride's camera button (owner, Nov 24 2026): top left in the Paths button's place, the live-join camera button's look. A tap
 *  cycles the views (C too), a long press or right click opens a small menu to pick one; a toast names the new view. */
function TrainCamera({view,viewNo}:{view:TrainView;viewNo:number}){
 const [menu,setMenu]=useState(false),timer=useRef<ReturnType<typeof setTimeout>|null>(null),held=useRef(false),first=useRef(viewNo);
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
 useEffect(()=>{if(!menu)return;const esc=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.stopPropagation();setMenu(false);}};window.addEventListener('keydown',esc,true);return()=>window.removeEventListener('keydown',esc,true);},[menu]);
 const down=()=>{held.current=false;if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>{held.current=true;setMenu(true);},HOLD_MS);};
 const up=()=>{if(timer.current){clearTimeout(timer.current);timer.current=null;}};
 return <>
  <button type="button" className={styles.cam} data-train-cam data-view={view} title="Change camera · C (hold for the list)" aria-label={`Camera: ${TRAIN_VIEW_LABEL[view]}. Tap for the next view, hold for the list`} aria-haspopup="menu" aria-expanded={menu}
   onPointerDown={down} onPointerUp={up} onPointerLeave={up} onPointerCancel={up} onContextMenu={e=>{e.preventDefault();up();setMenu(true);}}
   onClick={()=>{if(held.current){held.current=false;return;}if(menu){setMenu(false);return;}trainRideActions.press('camera','tap');}}><CamIcon/></button>
  {menu&&<div className={styles.camMenu} role="menu" aria-label="Camera views" data-train-cam-menu>{TRAIN_VIEWS.map(id=><button key={id} type="button" role="menuitemradio" aria-checked={id===view} className={styles.camItem} onClick={()=>{setMenu(false);trainRideActions.view(id);}}>{TRAIN_VIEW_LABEL[id]}</button>)}</div>}
  {viewNo!==first.current&&<p key={viewNo} className={styles.camToast} role="status" aria-live="polite" data-train-cam-toast>{TRAIN_VIEW_LABEL[view]}</p>}
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
  {v.riding&&<TrainCamera view={v.camView} viewNo={v.viewNo}/>}
  {v.riding&&v.note&&<p key={v.notes} className={styles.note} data-train-note role="status" aria-live="polite">{v.note}</p>}
 </>;
}
