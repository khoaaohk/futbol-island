'use client';
/**
 * Settings → "My save code" (docs/accounts-design.md §3.2; Oct 10 2026). Loaded only when Settings opens. One status GET the
 * first time; then it only reacts to taps and to the save client's own change event (no timers).
 */
import {useEffect,useState} from 'react';
import {SAVE_CHANGED,getLocalCode,saveStatus,savingStatus,swapBackup,undoSwap,type SaveStatus} from '@/lib/saves/client';
import {summaryLine} from '@/lib/saves/summary';
import ParentGate from '../ParentGate';
import CodeTiles from './CodeTiles';
import SaveCodeCreate,{CodeShown,SAVE_CODE_WHAT} from './SaveCodeCreate';
import SaveCodeRestore from './SaveCodeRestore';
import {DeleteSave,EmailCode} from './SaveActions';
import styles from './SaveCode.module.css';

type View='main'|'create'|'restore'|'show'|'gate-delete'|'delete'|'gate-email'|'email'|'gate-other'|'other';
const STATUS:Record<SaveStatus,string>={none:'',saved:'Saved ✓',saving:'Saving…',failed:'Not saved yet. We’ll try again.'};

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
  if(view==='gate-other')return <ParentGate reason="Bringing back the other island is for a parent, carer or coach." onCancel={back} onPass={()=>setView('other')}/>;
  if(view==='other')return <OtherIsland onCancel={back}/>;
  if(!code)return <>
   <p className={styles.copy} data-save-explainer>A save code is the key to your island. Get one to keep your coins, cards and lessons on another phone or tablet. No name or email.</p>
   <div className={styles.row}><button type="button" className={styles.primary} data-get-code onClick={()=>setView('create')}>Get my code</button>
    <button type="button" className={styles.secondary} data-have-code onClick={()=>setView('restore')}>I have a save code</button></div>
   {backup&&<OtherIslandLink onOpen={()=>setView(grownups?'other':'gate-other')}/>}
  </>;
  return <>
   <p className={styles.copy} data-save-explainer>{SAVE_CODE_WHAT}</p>
   <CodeTiles code={code} masked/>
   <p className={`${styles.saved} ${status==='saved'?'':styles.off}`} role="status" data-save-status={status}>{STATUS[status]}</p>
   <div className={styles.row}><button type="button" className={styles.primary} data-show-code onClick={()=>setView('show')}>Show my code</button>
    <button type="button" className={styles.secondary} data-print-code onClick={()=>{void import('@/lib/saves/printCard').then(m=>m.printCodeCard(code));}}>Print code</button></div>
   <div className={styles.row}><button type="button" className={styles.secondary} data-use-other-code onClick={()=>setView('restore')}>Use a different code</button>
    {avail.email&&<button type="button" className={styles.secondary} data-email-code onClick={()=>setView(grownups?'email':'gate-email')}>Send my code to a grown-up</button>}
    <button type="button" className={styles.secondary} data-delete-save onClick={()=>setView(grownups?'delete':'gate-delete')}>Delete my save</button></div>
   {backup&&<OtherIslandLink onOpen={()=>setView(grownups?'other':'gate-other')}/>}
  </>;
 })();
 return <div className={styles.box} data-save-card>{body}</div>;
}

const day=(t:number)=>new Date(t).toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'});
/**
 * When two copies of the island met, the one played last was kept and the other set aside on this device for 7 days
 * (doc §4.4). Kids never choose: a grown-up can bring the other one back, behind the gate.
 */
function OtherIslandLink({onOpen}:{onOpen:()=>void}){
 const b=swapBackup();if(!b)return null;
 return <div className={styles.row}><button type="button" className={styles.quiet} data-other-island onClick={onOpen}>Restore the other island from {day(b.playedOn)}</button></div>;
}
function OtherIsland({onCancel}:{onCancel:()=>void}){
 const b=swapBackup();if(!b)return null;
 const left=Math.max(1,Math.ceil((b.at+7*864e5-Date.now())/864e5));
 return <div className={styles.box} data-other-island-confirm>
  <p className={styles.copy}>This device also kept another copy of this island, last played {day(b.playedOn)}: {summaryLine(b.summary)}.</p>
  <p className={styles.small}>Bringing it back puts the island you have now in its place, so you can switch back the same way. It is kept for {left} more day{left===1?'':'s'}.</p>
  <div className={styles.row}><button type="button" className={styles.primary} data-undo-swap onClick={()=>undoSwap()}>Restore the other island</button>
   <button type="button" className={styles.secondary} onClick={onCancel}>Keep this one</button></div>
 </div>;
}
