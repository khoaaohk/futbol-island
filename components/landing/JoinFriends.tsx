'use client';
import {useEffect,useState} from 'react';
import CodeBoxes from '../party/CodeBoxes';
import {CODE_LENGTH} from '../../multiplayer/protocol';
import {NOT_IN_CODES_HINT,clearPendingParty,groupCode,readPendingParty,setPendingParty} from '@/lib/multiplayer/invite';
import {multiplayerEnabled} from '@/lib/multiplayer/config';
import {multiplayerAllowed,subscribeMultiplayerAllowed} from '@/lib/multiplayerAllowed';
import styles from './JoinFriends.module.css';

/**
 * "Join friends" on the title screen (user, Oct 22 2026: "remembering that link is a hassle, can we place that on the main login
 * screen?"). A friend types the 6-character party code here, no link needed. It does NOT connect: it stores the code as the
 * pending party (the same sessionStorage store the invite link uses) and continues into the game exactly as Play / Start would;
 * PartyHost then waits for the island and the intro, runs the grown-up check and the animal picker, and joins.
 * Rendered by TitleActions only when multiplayerEnabled(); this component also hides while the grown-up switch is Off.
 * Only the six code boxes take text. The code is never logged and never sent to analytics (no analytics import here).
 */
export default function JoinFriends({onContinue}:{onContinue:()=>void}){
 const [on,setOn]=useState(false),[open,setOpen]=useState(false),[pending,setPending]=useState<string|null>(null);
 const [code,setCode]=useState(''),[hint,setHint]=useState(false),[gone,setGone]=useState(false);
 useEffect(()=>{
  const sync=()=>{const ok=multiplayerEnabled()&&multiplayerAllowed();setOn(ok);setPending(ok?readPendingParty():null);};
  sync();return subscribeMultiplayerAllowed(sync);
 },[]);
 useEffect(()=>{
  if(!open)return;
  const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();setOpen(false);}};
  window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);
 },[open]);
 if(!on||gone)return null;
 const join=(c:string)=>{
  const stored=setPendingParty(c);
  if(!stored){setHint(false);return;}
  setPending(stored);setOpen(false);setGone(true);onContinue();
 };
 return <>
  <div className={styles.stack} data-title-join-stack>
  {pending&&<p className={styles.waiting} data-party-waiting role="status">
   <span>Party code waiting: <b>{groupCode(pending)}</b></span>
   <button type="button" className={styles.clear} aria-label="Forget the party code" onClick={()=>{clearPendingParty();setPending(null);}}>
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
   </button>
  </p>}
  <button type="button" className={styles.join} data-title-join onClick={()=>{setCode('');setHint(false);setOpen(true);}}>
   <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3.2"/><circle cx="17" cy="9.5" r="2.4"/><path d="M3 19c0-3.2 2.7-5.2 6-5.2s6 2 6 5.2M15.5 14.4c3 0 5.5 1.6 5.5 4.6"/></svg>
   Join friends
  </button>
  </div>
  {open&&<div className={styles.wrap} data-title-join-card>
   <div className={styles.backdrop} onClick={()=>setOpen(false)} aria-hidden="true"/>
   <section className={styles.card} role="dialog" aria-modal="true" aria-labelledby="title-join-h">
    <h2 id="title-join-h">Join friends</h2>
    <CodeBoxes onChange={(c,rejected)=>{setCode(c);setHint(rejected);}} onEnter={join}/>
    <p className={styles.status} role="status" aria-live="polite">{hint?NOT_IN_CODES_HINT:'Ask your friend for their code.'}</p>
    <div className={styles.row}>
     <button type="button" className={styles.cancel} onClick={()=>setOpen(false)}>Cancel</button>
     <button type="button" className={styles.go} disabled={code.length!==CODE_LENGTH} onClick={()=>join(code)}>Join</button>
    </div>
   </section>
  </div>}
 </>;
}
