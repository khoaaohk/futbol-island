'use client';
/**
 * Keeps a save code's island in step (docs/accounts-design.md §4.3–§4.4; Oct 10 2026). Mounted beside the island (app/page.tsx,
 * app/island-return) and in the arcade, Konbini and museum rooms with `boot={false}` (they only save when hidden).
 *
 * Heat: no polling, no timers, no loops. Listeners only: the tab hiding (visibilitychange / pagehide, keepalive), the
 * milestones the stores already announce (at most one save per 2 minutes), another tab swapping islands (it reloads this one),
 * and, once on start, one `check` when this device has a code. Nothing at all happens on a device without a code, except a
 * single status GET the first time a card or graduation is earned (for the one-time "Want to keep this?" note), and one on the
 * island's start while it has no code (a code is required before playing: the "Save your island" prompt).
 */
import dynamic from 'next/dynamic';
import {useCallback,useEffect,useRef,useState} from 'react';
import {SAVE_CONFLICT,SAVE_MILESTONES,bootCheck,codeRequired,deviceHasProgress,getLocalCode,savingStatus,syncNow,takeSaveFragment} from '@/lib/saves/client';
import {SAVE_APPLIED_KEY,SAVE_NUDGE_KEY} from '@/lib/saves/snapshot';
import {shouldShowIslandOnboarding} from '@/lib/town/onboarding';
import styles from './SaveCode.module.css';

const IslandChooser=dynamic(()=>import('./IslandChooser'),{ssr:false});
const SaveCodeRestore=dynamic(()=>import('./SaveCodeRestore'),{ssr:false});
const RequiredSave=dynamic(()=>import('./RequiredSave'),{ssr:false});
/** Milestones that may earn the one-time nudge for a player without a code (doc §3.1 "A later nudge"). */
const NUDGE_EVENTS=['fi2-card-added','fi2-graduations-changed'];

export default function SaveSync({boot=true}:{boot?:boolean}){
 const [dialog,setDialog]=useState<null|{kind:'conflict'}|{kind:'restore';code:string}|{kind:'required'}>(null);
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{
  const hide=()=>{if(document.visibilityState==='hidden')void syncNow('hide');};
  const pagehide=()=>{void syncNow('hide');};
  const milestone=()=>{void syncNow('milestone');};
  const nudge=()=>{
   // Only for a card or graduation really earned (not the starter kit handed out on a first visit).
   if(getLocalCode()||shouldShowIslandOnboarding()||!deviceHasProgress())return;
   try{if(localStorage.getItem(SAVE_NUDGE_KEY))return;}catch{return;}
   void savingStatus().then(s=>{if(s.saving&&!getLocalCode())try{if(!localStorage.getItem(SAVE_NUDGE_KEY))localStorage.setItem(SAVE_NUDGE_KEY,'due');}catch{}});
  };
  const conflict=()=>setDialog({kind:'conflict'});
  const otherTab=(e:StorageEvent)=>{if(e.key===SAVE_APPLIED_KEY&&e.newValue)location.reload();};
  document.addEventListener('visibilitychange',hide);window.addEventListener('pagehide',pagehide);
  for(const ev of SAVE_MILESTONES)window.addEventListener(ev,milestone);
  for(const ev of NUDGE_EVENTS)window.addEventListener(ev,nudge);
  window.addEventListener(SAVE_CONFLICT,conflict);window.addEventListener('storage',otherTab);
  if(boot){
   const code=takeSaveFragment();
   // On a device that is about to see the welcome, the welcome's own "I have a save code" screen takes the code.
   if(code&&!shouldShowIslandOnboarding())setDialog({kind:'restore',code});
   // A code is required before playing (user decision, Oct 9 2026). A player who already has an island but no code (they
   // started before codes, or saving was down last time) is asked on the island's start, once per visit, until they have one.
   // New players get the same step inside the welcome. One status GET; nothing when saving is not set up or is down.
   else if(!shouldShowIslandOnboarding()&&codeRequired())void savingStatus().then(s=>{if(s.saving&&codeRequired())setDialog(d=>d??{kind:'required'});});
   void bootCheck();
  }
  return()=>{document.removeEventListener('visibilitychange',hide);window.removeEventListener('pagehide',pagehide);
   for(const ev of SAVE_MILESTONES)window.removeEventListener(ev,milestone);
   for(const ev of NUDGE_EVENTS)window.removeEventListener(ev,nudge);
   window.removeEventListener(SAVE_CONFLICT,conflict);window.removeEventListener('storage',otherTab);};
 },[boot]);
 useEffect(()=>{const el=ref.current;if(!el)return;if(dialog&&!el.open)el.showModal();else if(!dialog&&el.open)el.close();},[dialog]);
 const close=useCallback(()=>setDialog(null),[]);
 if(!dialog)return null;
 return <dialog ref={ref} className={styles.dialog} data-save-dialog={dialog.kind} aria-label={dialog.kind==='conflict'?'Which island do you want?':dialog.kind==='required'?'Save your island':'Type your save code'}
  onCancel={e=>{e.preventDefault();if(dialog.kind==='restore')close();}} onKeyDown={e=>e.stopPropagation()} onKeyUp={e=>e.stopPropagation()} onPointerDown={e=>e.stopPropagation()}>
  {/* A div, not a section: the phone rule in globals.css turns a dialog's first section into a full-screen drawer; this stays a card. */}
  <div className={styles.card}>
   {dialog.kind==='conflict'?<IslandChooser onDone={close}/>:dialog.kind==='required'?<RequiredSave onDone={close}/>:<SaveCodeRestore initialCode={dialog.code} onCancel={close} onDone={r=>{if(!r)close();}}/>}
  </div>
 </dialog>;
}
