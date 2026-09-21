'use client';
import {DoneButton} from './DoneButton';
import shell from './ModalShell.module.css';
import {useEffect,useRef} from 'react';
import notice from './VenueNotice.module.css';
import styles from './CoachesCentre.module.css';
export default function FerryPreview({open,onOpenChange}:{open:boolean;onOpenChange:(open:boolean)=>void}){
 const dialog=useRef<HTMLDialogElement>(null),close=useRef<HTMLButtonElement>(null),restore=useRef<HTMLElement|null>(null);
 useEffect(()=>{const el=dialog.current;if(!el)return;if(open&&!el.open){restore.current=document.activeElement instanceof HTMLElement?document.activeElement:null;el.showModal();close.current?.focus();}else if(!open&&el.open){el.close();restore.current?.focus({preventScroll:true});}},[open]);
 return <dialog ref={dialog} className={styles.dialog} aria-labelledby="ferry-title" onCancel={e=>{e.preventDefault();onOpenChange(false);}} onClick={e=>{if(e.target===e.currentTarget)onOpenChange(false);}} onKeyDown={e=>e.stopPropagation()} onKeyUp={e=>e.stopPropagation()}>
  <section className={`${styles.panel} ${shell.shell} `}><header className={shell.header}><div><h2 id="ferry-title">Matchday Ferry</h2></div><DoneButton ref={close} onDone={()=>onOpenChange(false)}/></header><div className={`${shell.body} ${notice.body}`}>
   <div className={`${styles.details} ${notice.card}`}><span className={styles.badge}>Coming soon</span><h3>Your next island awaits</h3><p>Complete all four starter paths and collect every hidden ball to prepare for your next journey.</p><p>The ferry will unlock at a future date, when the academy island is ready. There, you’ll develop as an academy player and work toward the first team.</p><p>For now, keep exploring and learning here. Your progress saves as you go.</p></div>
  </div></section>
 </dialog>;
}
