'use client';
import {useEffect,useRef,type ReactNode} from 'react';
import {DoneButton} from './DoneButton';
import {BackButton} from './BackButton';
import shell from './ModalShell.module.css';
import styles from './Endgame.module.css';

/**
 * The full-screen venue dialog every endgame place shares (graduation, Matchday Ferry, History Museum), built like the
 * Coaches Centre: a native <dialog> in the top layer (so it also opens above Make it yours when a certificate is viewed from
 * the backpack), ModalShell header, Done or Back. The island sleeps behind it (Town counts it as an open modal).
 */
export default function EndgameDialog({open,onClose,onBack,title,label,children}:{open:boolean;onClose:()=>void;onBack?:()=>void;title:string;label:string;children:ReactNode}){
 const dialog=useRef<HTMLDialogElement>(null),close=useRef<HTMLButtonElement>(null),restore=useRef<HTMLElement|null>(null),body=useRef<HTMLDivElement>(null);
 useEffect(()=>{const el=dialog.current;if(!el)return;
  if(open&&!el.open){restore.current=document.activeElement instanceof HTMLElement?document.activeElement:null;el.showModal();close.current?.focus({preventScroll:true});}
  else if(!open&&el.open){el.close();restore.current?.focus({preventScroll:true});}},[open]);
 // A new view starts at the top.
 useEffect(()=>{body.current?.scrollTo?.({top:0});},[title,onBack]);
 return <dialog ref={dialog} className={styles.dialog} aria-labelledby={`${label}-title`} onCancel={e=>{e.preventDefault();if(onBack)onBack();else onClose();}} onKeyDown={e=>e.stopPropagation()} onKeyUp={e=>e.stopPropagation()}>
  <section className={`${styles.panel} ${shell.shell}`}>
   <header className={shell.header}>{onBack&&<BackButton ref={close} onBack={onBack}/>}<div><h2 id={`${label}-title`}>{title}</h2></div>{!onBack&&<DoneButton ref={close} onDone={onClose}/>}</header>
   <div ref={body} className={shell.body}>{open&&children}</div>
  </section>
 </dialog>;
}
