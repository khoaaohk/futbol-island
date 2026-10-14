'use client';
/**
 * Summit Isle foraging HUD (Oct 13 2026): the world-anchored "Shake the mango tree" prompt beside a fruit tree (placed by
 * lib/graphics/fruitTrees.ts like the other island prompts; E works too), and one short note after a pickup ("+1 Mango in your
 * basket", the first-time tip, basket full, today's cap). Reads lib/town/summitForage.ts' store (written only on changes); the
 * note fades out with CSS, so there are no timers or loops here.
 */
import {useSyncExternalStore} from 'react';
import {forageStore,forageActions} from '@/lib/town/summitForage';
import styles from './ForagePrompt.module.css';

export default function ForagePrompt(){
 const v=useSyncExternalStore(forageStore.subscribe,forageStore.get,forageStore.server);
 return <>
  <button type="button" className="store-enter-prompt" data-summit-forage aria-label={v.label} hidden onClick={()=>forageActions.shake()}>{v.label}</button>
  {v.note&&<p key={v.notes} className={styles.note} data-forage-note data-tip={v.tip||undefined} role="status" aria-live="polite">{v.note}</p>}
 </>;
}
