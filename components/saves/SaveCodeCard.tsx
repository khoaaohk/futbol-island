'use client';
/**
 * Settings → "My save code" (docs/accounts-design.md §3.2; Oct 10 2026). Loaded only when Settings opens. One status GET the
 * first time; then it only reacts to taps and to the save client's own change event (no timers).
 */
import {useEffect,useState} from 'react';
import {SAVE_CHANGED,SAVE_CONFLICT,getLocalCode,saveStatus,savingStatus,swapBackup,undoSwap,type SaveStatus} from '@/lib/saves/client';
import ParentGate from '../ParentGate';
import CodeTiles from './CodeTiles';
import SaveCodeCreate,{CodeShown} from './SaveCodeCreate';
import SaveCodeRestore from './SaveCodeRestore';
import {DeleteSave,EmailCode} from './SaveActions';
import styles from './SaveCode.module.css';

type View='main'|'create'|'restore'|'show'|'gate-delete'|'delete'|'gate-email'|'email';
const STATUS:Record<SaveStatus,string>={none:'',saved:'Saved ✓',saving:'Saving…',failed:'Not saved yet. We’ll try again.',conflict:'Two islands found. Pick one.'};

export default function SaveCodeCard({grownups=false}:{grownups?:boolean}){
 const [avail,setAvail]=useState<{saving:boolean;email:boolean}|null>(null);
 const [code,setCode]=useState<string|null>(null),[status,setStatus]=useState<SaveStatus>('none'),[view,setView]=useState<View>('main'),[backup,setBackup]=useState(false);
 useEffect(()=>{let live=true;savingStatus().then(s=>{if(live)setAvail(s);});
  const sync=()=>{setCode(getLocalCode());setStatus(saveStatus());setBackup(!!swapBackup());};sync();
  window.addEventListener(SAVE_CHANGED,sync);return()=>{live=false;window.removeEventListener(SAVE_CHANGED,sync);};},[]);
 const back=()=>setView('main');
 const body=(()=>{
  if(!avail)return <p className={styles.status} role="status">Getting ready…</p>;
  if(!avail.saving&&!code)return <p className={styles.copy} data-save-unavailable>Saving isn’t ready yet — you can still play.</p>;
  if(view==='create')return <SaveCodeCreate headless showNotNow autoStart onDone={()=>setView('main')}/>;
  if(view==='restore')return <SaveCodeRestore headless onCancel={back} onDone={restored=>{if(!restored)back();}}/>;
  if(view==='show'&&code)return <CodeShown code={code} headless doneLabel="Hide my code" onDone={back}/>;
  if(view==='gate-delete')return <ParentGate reason="Deleting the save is for a parent, carer or coach." onCancel={back} onPass={()=>setView('delete')}/>;
  if(view==='delete')return <DeleteSave onCancel={back} onDone={back}/>;
  if(view==='gate-email')return <ParentGate reason="Sending the code by email is for a parent, carer or coach." onCancel={back} onPass={()=>setView('email')}/>;
  if(view==='email')return <EmailCode onDone={back}/>;
  if(!code)return <>
   <p className={styles.copy}>Get a secret save code to keep your coins, cards and lessons on another phone or tablet. No name or email.</p>
   <div className={styles.row}><button type="button" className={styles.primary} data-get-code onClick={()=>setView('create')}>Get my code</button>
    <button type="button" className={styles.secondary} data-have-code onClick={()=>setView('restore')}>I have a save code</button></div>
   {backup&&<UndoSwap/>}
  </>;
  return <>
   <CodeTiles code={code} masked/>
   <p className={`${styles.saved} ${status==='saved'?'':styles.off}`} role="status" data-save-status={status}>{STATUS[status]}</p>
   {status==='conflict'&&<div className={styles.row}><button type="button" className={styles.primary} onClick={()=>window.dispatchEvent(new Event(SAVE_CONFLICT))}>Choose an island</button></div>}
   <div className={styles.row}><button type="button" className={styles.primary} data-show-code onClick={()=>setView('show')}>Show my code</button>
    <button type="button" className={styles.secondary} data-print-code onClick={()=>{void import('@/lib/saves/printCard').then(m=>m.printCodeCard(code));}}>Print a code card</button></div>
   <div className={styles.row}><button type="button" className={styles.secondary} data-use-other-code onClick={()=>setView('restore')}>Use a different code</button>
    {avail.email&&<button type="button" className={styles.secondary} data-email-code onClick={()=>setView(grownups?'email':'gate-email')}>Send my code to a grown-up</button>}
    <button type="button" className={styles.secondary} data-delete-save onClick={()=>setView(grownups?'delete':'gate-delete')}>Delete my save</button></div>
   {backup&&<UndoSwap/>}
  </>;
 })();
 return <div className={styles.box} data-save-card>{body}</div>;
}

function UndoSwap(){
 const b=swapBackup();if(!b)return null;
 const left=Math.max(1,Math.ceil((b.at+7*864e5-Date.now())/864e5));
 return <div className={styles.row}><button type="button" className={styles.quiet} data-undo-swap onClick={()=>undoSwap()}>Undo swap</button><span className={styles.small}>Your other island is kept for {left} more day{left===1?'':'s'}.</span></div>;
}
