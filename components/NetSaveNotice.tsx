'use client';
/**
 * Two gentle notes outside the island HUD (QA robust pass 2, Nov 14 2026, owner defaults):
 * - "Waiting for internet…" while a panel, game or lesson tapped offline waits for the connection (lib/retryImport.ts counts the
 *   waiters); it goes away by itself when the part loads (the panel then opens on its own, as before).
 * - Blocked browser storage (lib/storageFallback.ts set window.__fiNoSave): once per visit, "This browser can't save your island.
 *   Ask a grown-up, or use your save code." Game pages only (not the tour site). Tap closes it; it leaves after NO_SAVE_MS.
 * Most panels are modal <dialog>s, which sit in the browser's top layer above any z-index: while one is open the note is drawn
 * inside the topmost open dialog (a portal), so a panel waiting inside Settings still shows it.
 * Event-driven: one subscription, one hide timeout while the storage note shows. Nothing runs when storage and the network are fine.
 */
import {useEffect,useState,useSyncExternalStore} from 'react';
import {createPortal} from 'react-dom';
import {usePathname} from 'next/navigation';
import styles from './NetSaveNotice.module.css';
import {isOfflineChunkNoise,netWaitCount,subscribeNetWait} from '@/lib/retryImport';

export const NO_SAVE_MS=9000;
export const NO_SAVE_SEEN_KEY='fi2-no-save-note-v1';
export const NO_SAVE_TEXT="This browser can't save your island. Ask a grown-up, or use your save code.";
export const NET_WAIT_TITLE='Waiting for internet…';
export const NET_WAIT_TEXT="It opens by itself when you're back online.";
/** Routes that are the game (the tour site and /admin never show the storage note). */
export const GAME_PATH=/^\/(play|island-return|arcade|konbini|museum|shop)(\/|$)/;
let noSaveShown=false;
/** Whether the storage note should show now (exported for tests). */
export function wantsNoSaveNote(win:{__fiNoSave?:boolean;sessionStorage?:Storage}|undefined,pathname:string|null):boolean{
 if(noSaveShown||!win?.__fiNoSave||!pathname||!GAME_PATH.test(pathname))return false;
 try{if(win.sessionStorage?.getItem(NO_SAVE_SEEN_KEY))return false;}catch{/* memory store */}
 return true;
}
/** The topmost open modal dialog (top layer), if any. */
function topDialog():HTMLElement|null{const open=document.querySelectorAll<HTMLDialogElement>('dialog[open]');for(let i=open.length-1;i>=0;i--){try{if(open[i].matches(':modal'))return open[i];}catch{return open[i];}}return null;}
function markNoSaveSeen(win:{sessionStorage?:Storage}){noSaveShown=true;try{win.sessionStorage?.setItem(NO_SAVE_SEEN_KEY,'1');}catch{/* fine */}}

export default function NetSaveNotice(){
 const waiting=useSyncExternalStore(subscribeNetWait,netWaitCount,()=>0);
 const pathname=usePathname();
 const [noSave,setNoSave]=useState(false);
 // Offline, webpack's background chunk prefetches reject with nobody listening: mark those handled so the console stays quiet
 // (lib/retryImport.ts isOfflineChunkNoise). One listener, it only runs when a promise rejects unhandled.
 useEffect(()=>{const quiet=(ev:PromiseRejectionEvent)=>{if(isOfflineChunkNoise(ev.reason,navigator.onLine!==false))ev.preventDefault();};
  window.addEventListener('unhandledrejection',quiet);return()=>window.removeEventListener('unhandledrejection',quiet);},[]);
 useEffect(()=>{
  const w=window as unknown as {__fiNoSave?:boolean;sessionStorage?:Storage};
  if(!wantsNoSaveNote(w,pathname))return;
  markNoSaveSeen(w);setNoSave(true);
 },[pathname]);
 useEffect(()=>{if(!noSave)return;const t=setTimeout(()=>setNoSave(false),NO_SAVE_MS);return()=>clearTimeout(t);},[noSave]);
 const showing=waiting>0||noSave;
 const [host,setHost]=useState<HTMLElement|null>(null);
 useEffect(()=>{setHost(showing?topDialog():null);},[showing,waiting]);
 if(!showing)return null;
 const note=waiting>0?<div className={styles.wrap}><p className={styles.toast} role="status" data-net-wait="">
  <b>{NET_WAIT_TITLE}</b><span>{NET_WAIT_TEXT}</span></p></div>
  :<div className={styles.wrap}><button type="button" className={styles.toast} role="status" data-no-save-note="" onClick={()=>setNoSave(false)}>
  <span>{NO_SAVE_TEXT}</span></button></div>;
 return host&&host.isConnected?createPortal(note,host):note;
}
