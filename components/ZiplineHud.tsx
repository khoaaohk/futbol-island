'use client';
/**
 * The zipline's HUD (Oct 14 2026): the world-anchored "Ride the zipline" prompt by the launch tower on Summit Isle (placed by
 * lib/graphics/zipline.ts like the other island prompts; E works too) and one short note at the launch and on the hostel roof.
 * Reads lib/town/zipline.ts' store (written only on changes); the note fades out with CSS, so there are no timers or loops here.
 * The ride's three actions (Tuck · Spin · Wave) are not here: they take the action cluster's slots in Town (ZIP_BUTTONS).
 */
import {useSyncExternalStore} from 'react';
import {zipStore,zipActions} from '@/lib/town/zipline';
import styles from './ForagePrompt.module.css';

export default function ZiplineHud(){
 const v=useSyncExternalStore(zipStore.subscribe,zipStore.get,zipStore.server);
 return <>
  <button type="button" className="store-enter-prompt" data-zipline-ride aria-label="Ride the zipline to Coral Cay" hidden onClick={()=>zipActions.ride()}>Ride the zipline</button>
  {v.note&&<p key={v.notes} className={styles.note} data-zipline-note role="status" aria-live="polite">{v.note}</p>}
 </>;
}
