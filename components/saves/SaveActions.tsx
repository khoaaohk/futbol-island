'use client';
/**
 * Grown-up save actions shared by Settings' "My save code" card and For grown-ups' "Saving progress" card
 * (docs/accounts-design.md §3.2, §3.4, §4.7, phase 2a; Oct 10 2026). Each is meant to sit behind the ParentGate.
 */
import {useState} from 'react';
import {deleteSave,sendCodeToGrownup} from '@/lib/saves/client';
import styles from './SaveCode.module.css';

/** "Delete my save": hard delete on the server straight away; this device keeps its game. */
export function DeleteSave({onDone,onCancel}:{onDone:()=>void;onCancel:()=>void}){
 const [busy,setBusy]=useState(false),[err,setErr]=useState(false);
 return <div className={styles.box} data-save-delete>
  <p className={styles.copy}>This deletes your saved island from our server. This device keeps its game.</p>
  <p className={styles.small}>The code will stop working on every device. Backups clear within 7 days.</p>
  {err&&<p className={`${styles.status} ${styles.warn}`} role="status">We couldn’t reach the island. Try again in a moment.</p>}
  <div className={styles.row}><button type="button" className={styles.primary} data-confirm-delete disabled={busy} onClick={async()=>{setBusy(true);const ok=await deleteSave();setBusy(false);if(ok)onDone();else setErr(true);}}>{busy?'Deleting…':'Delete my save'}</button>
   <button type="button" className={styles.secondary} disabled={busy} onClick={onCancel}>Keep it</button></div>
 </div>;
}

/**
 * "Send my code to a grown-up" (phase 2a): one email, then the address is forgotten. The wording shown before sending is the
 * notice for the one-time contact (COPPA §312.5(c), docs/save-codes.md; [LAWYER] to confirm before launch).
 */
export function EmailCode({onDone}:{onDone:()=>void}){
 const [email,setEmail]=useState(''),[state,setState]=useState<'idle'|'sending'|'sent'|'failed'|'busy'|'bad-email'|'unavailable'>('idle');
 if(state==='sent')return <div className={styles.box} data-email-sent><p className={styles.copy} role="status">Sent. Check your inbox (and the spam folder) for “Your Futbol Island save code”.</p>
  <p className={styles.small}>We didn’t keep the address.</p><div className={styles.row}><button type="button" className={styles.secondary} onClick={onDone}>Done</button></div></div>;
 const send=async()=>{setState('sending');const r=await sendCodeToGrownup(email.trim());setState(r);if(r==='sent')setEmail('');};
 return <form className={styles.email} data-email-form onSubmit={e=>{e.preventDefault();void send();}}>
  <p className={styles.copy}>We’ll send one email with this save code to the address you type.</p>
  <p className={styles.legal} data-email-notice>We use the address only to send this one email, then forget it: we don’t store it, log it, share it or write again. The email has the code, what it is, and how to delete the save. No links, no tracking.</p>
  <label className={styles.small} htmlFor="save-email">Grown-up’s email</label>
  <input id="save-email" className={styles.input} style={{textTransform:'none'}} type="email" inputMode="email" autoComplete="off" autoCapitalize="none" spellCheck={false} maxLength={254} value={email} onChange={e=>{setEmail(e.target.value);if(state!=='sending')setState('idle');}} disabled={state==='sending'}/>
  <p className={`${styles.status} ${state==='idle'||state==='sending'?'':styles.warn}`} role="status">{state==='sending'?'Sending…':state==='bad-email'?'That email address doesn’t look right.':state==='busy'?'Lots of emails right now. Please try again later.':state==='unavailable'?'Email isn’t set up yet.':state==='failed'?'We couldn’t send it. Please try again later.':''}</p>
  <div className={styles.row}><button type="submit" className={styles.primary} data-send-email disabled={state==='sending'||email.trim().length<6}>Send the code</button>
   <button type="button" className={styles.secondary} onClick={onDone} disabled={state==='sending'}>Cancel</button></div>
 </form>;
}
