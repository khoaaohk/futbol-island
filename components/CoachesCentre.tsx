'use client';
import {DoneButton} from './DoneButton';
import {BackButton} from './BackButton';
import dynamicImport from 'next/dynamic';
import ParentGate from './ParentGate';
import {openGrownUps} from '@/lib/grownups/prefs';
import {FORMAT_PATH_LAUNCH} from '@/lib/paths/formatPaths';
/** The coach plan loads only when opened (heat: static UI, lazy). */
const IdpPlan=dynamicImport(()=>import('./IdpPlan'),{ssr:false});
/** Lane 4 (Sep 30 2026, G-09): the IDP is on, behind the shared grown-up check (ParentGate). Set false to hide it again. */
export const IDP_ENABLED=true;
import shell from './ModalShell.module.css';
import {useEffect,useRef,useState} from 'react';
import {Icon} from './Icon';
import styles from './CoachesCentre.module.css';
/** Lane 2 (Sep 30 2026): the Coaches Board is live: badges, next goals and pinned team shapes (components/CoachesBoard.tsx). */
const CoachesBoard=dynamicImport(()=>import('./CoachesBoard'),{ssr:false});
export default function CoachesCentre({open,onOpenChange}:{open:boolean;onOpenChange:(open:boolean)=>void}){
 const [view,setView]=useState<'home'|'idp'|'board'>('home');
 const dialog=useRef<HTMLDialogElement>(null),close=useRef<HTMLButtonElement>(null),restore=useRef<HTMLElement|null>(null);
 // A lesson launched from the plan (or the grown-ups area on top) closes the centre so the lesson is visible.
 useEffect(()=>{const done=()=>onOpenChange(false);window.addEventListener(FORMAT_PATH_LAUNCH,done);return()=>window.removeEventListener(FORMAT_PATH_LAUNCH,done);},[onOpenChange]);
 useEffect(()=>{const el=dialog.current;if(!el)return;if(open&&!el.open){restore.current=document.activeElement instanceof HTMLElement?document.activeElement:null;el.showModal();close.current?.focus();}else if(!open&&el.open){el.close();setView('home');restore.current?.focus({preventScroll:true});}},[open]);
 return <dialog ref={dialog} className={styles.dialog} aria-labelledby="coaches-title" onCancel={e=>{e.preventDefault();if(view!=='home')setView('home');else onOpenChange(false);}} onClick={e=>{if(e.target===e.currentTarget)onOpenChange(false);}} onKeyDown={e=>e.stopPropagation()} onKeyUp={e=>e.stopPropagation()}>
  <section className={`${styles.panel} ${shell.shell} `}><header className={shell.header}>{view!=='home'&&<BackButton ref={close} autoFocus onBack={()=>setView('home')}/>}<div className={styles.titleWrap}><h2 id="coaches-title">{view==='idp'?'My Development Plan':view==='board'?'Coaches Board':'Coaches Centre'}</h2></div>{view==='home'&&<DoneButton ref={close} onDone={()=>onOpenChange(false)}/>}</header><div className={shell.body}>
   {view==='board'?<CoachesBoard/>:IDP_ENABLED&&view==='idp'?<ParentGate.Guard reason="The development plan is set up with a parent, carer or coach." onCancel={()=>setView('home')}><IdpPlan onLaunch={()=>onOpenChange(false)}/></ParentGate.Guard>:<>
   <p className={styles.intro}>A home for coaching and player development. <button type="button" className={styles.grownupsLink} data-open-grownups onClick={()=>openGrownUps()}>For grown-ups: progress &amp; report</button></p>
   <div className={styles.content}>
    {IDP_ENABLED?<button type="button" className={`${styles.card} ${styles.cardButton}`} onClick={()=>setView('idp')}><div className={styles.art}><svg viewBox="0 0 240 150" fill="none" aria-hidden="true"><rect x="66" y="16" width="108" height="124" rx="12" fill="#fff9e9" stroke="#477c6a" strokeWidth="3"/><rect x="99" y="9" width="42" height="17" rx="6" fill="#477c6a"/><circle cx="97" cy="52" r="7" fill="#d6b976"/><path d="M115 52h38M89 81l6 6 11-13M115 82h38M89 111l6 6 11-13M115 112h30" stroke="#477c6a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg></div><div className={styles.details}><span className={styles.badge}>New</span><h3>IDP</h3><strong>Individual Development Plan</strong><p>Choose one thing to improve, watch it on the island, try it at training and note what you noticed.</p></div></button>:<article className={styles.card}><div className={styles.art}><svg viewBox="0 0 240 150" fill="none" aria-hidden="true"><rect x="66" y="16" width="108" height="124" rx="12" fill="#fff9e9" stroke="#477c6a" strokeWidth="3"/><rect x="99" y="9" width="42" height="17" rx="6" fill="#477c6a"/><circle cx="97" cy="52" r="7" fill="#d6b976"/><path d="M115 52h38M89 81l6 6 11-13M115 82h38M89 111l6 6 11-13M115 112h30" stroke="#477c6a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg></div><div className={styles.details}><span className={styles.badge}>Coming soon</span><h3>IDP</h3><strong>Individual Development Plan</strong><p>Choose one thing to improve, watch it on the island, try it at training and note what you noticed.</p></div></article>}
    <button type="button" className={`${styles.card} ${styles.cardButton}`} data-coaches-board-card onClick={()=>setView('board')}><div className={`${styles.art} ${styles.board}`}><svg viewBox="0 0 240 150" fill="none" aria-hidden="true"><rect x="24" y="18" width="192" height="114" rx="9" fill="#477c6a"/><path d="M120 18v114M24 50h30v50H24M216 50h-30v50h30" stroke="#f7f0db" strokeWidth="2"/><circle cx="120" cy="75" r="21" stroke="#f7f0db" strokeWidth="2"/><path d="M76 105l39-53 47 41" stroke="#e6c477" strokeWidth="3" strokeDasharray="5 5"/><path d="m152 92 13 3-3-13" stroke="#e6c477" strokeWidth="3" strokeLinecap="round"/><circle cx="76" cy="105" r="7" fill="#f0d18c"/><circle cx="115" cy="52" r="7" fill="#f0d18c"/><circle cx="166" cy="98" r="7" fill="#f0d18c"/></svg></div><div className={styles.details}><span className={styles.badge}>Your board</span><h3>Coaches Board</h3><strong>Badges, goals and team shapes</strong><p>See your graduation badges, your next lesson on every path and the team shapes you have learned.</p></div></button>
   </div></>}
  </div></section>
 </dialog>;
}
