'use client';
import {DoneButton} from './DoneButton';
import shell from './ModalShell.module.css';
import {useEffect,useRef} from 'react';
import {Icon} from './Icon';
import styles from './CoachesCentre.module.css';
export default function CoachesCentre({open,onOpenChange}:{open:boolean;onOpenChange:(open:boolean)=>void}){
 const dialog=useRef<HTMLDialogElement>(null),close=useRef<HTMLButtonElement>(null),restore=useRef<HTMLElement|null>(null);
 useEffect(()=>{const el=dialog.current;if(!el)return;if(open&&!el.open){restore.current=document.activeElement instanceof HTMLElement?document.activeElement:null;el.showModal();close.current?.focus();}else if(!open&&el.open){el.close();restore.current?.focus({preventScroll:true});}},[open]);
 return <dialog ref={dialog} className={styles.dialog} aria-labelledby="coaches-title" onCancel={e=>{e.preventDefault();onOpenChange(false);}} onClick={e=>{if(e.target===e.currentTarget)onOpenChange(false);}} onKeyDown={e=>e.stopPropagation()} onKeyUp={e=>e.stopPropagation()}>
  <section className={`${styles.panel} ${shell.shell} `}><header className={shell.header}><div><h2 id="coaches-title">Coaches Centre</h2></div><DoneButton ref={close} onDone={()=>onOpenChange(false)}/></header><div className={shell.body}>
   <p className={styles.intro}>A home for coaching and player development.</p>
   <div className={styles.content}>
    <article className={styles.card}><div className={styles.art}><svg viewBox="0 0 240 150" fill="none" aria-hidden="true"><rect x="66" y="16" width="108" height="124" rx="12" fill="#fff9e9" stroke="#477c6a" strokeWidth="3"/><rect x="99" y="9" width="42" height="17" rx="6" fill="#477c6a"/><circle cx="97" cy="52" r="7" fill="#d6b976"/><path d="M115 52h38M89 81l6 6 11-13M115 82h38M89 111l6 6 11-13M115 112h30" stroke="#477c6a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg></div><div className={styles.details}><span className={styles.badge}>Coming soon</span><h3>IDP</h3><strong>Individual Development Plan</strong><p>Set personal goals and plan the next steps in your development.</p></div></article>
    <article className={styles.card}><div className={`${styles.art} ${styles.board}`}><svg viewBox="0 0 240 150" fill="none" aria-hidden="true"><rect x="24" y="18" width="192" height="114" rx="9" fill="#477c6a"/><path d="M120 18v114M24 50h30v50H24M216 50h-30v50h30" stroke="#f7f0db" strokeWidth="2"/><circle cx="120" cy="75" r="21" stroke="#f7f0db" strokeWidth="2"/><path d="M76 105l39-53 47 41" stroke="#e6c477" strokeWidth="3" strokeDasharray="5 5"/><path d="m152 92 13 3-3-13" stroke="#e6c477" strokeWidth="3" strokeLinecap="round"/><circle cx="76" cy="105" r="7" fill="#f0d18c"/><circle cx="115" cy="52" r="7" fill="#f0d18c"/><circle cx="166" cy="98" r="7" fill="#f0d18c"/></svg></div><div className={styles.details}><span className={styles.badge}>Coming soon</span><h3>Coaches Board</h3><strong>Draw up plays</strong><p>Sketch formations, map player movement and share your ideas.</p></div></article>
   </div>
  </div></section>
 </dialog>;
}
