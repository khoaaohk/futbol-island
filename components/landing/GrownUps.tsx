'use client';
import {useEffect,useRef,useState,type ReactNode} from 'react';
import {BackButton} from '../BackButton';
import shell from '../ModalShell.module.css';
import AboutGrownUps from '../about/AboutGrownUps';
import styles from './Title.module.css';

/** A full-screen sheet in the game's modal shell, Back top left (user, Oct 9 2026). */
function Sheet({open,onClose,title,id,children}:{open:boolean;onClose:()=>void;title:string;id:string;children:ReactNode}){
 const dialog=useRef<HTMLDialogElement>(null),body=useRef<HTMLDivElement>(null);
 // Fade in on open; on close, fade out first and only then close the dialog (reduced motion closes at once).
 useEffect(()=>{const el=dialog.current;if(!el)return;
  if(open){delete el.dataset.closing;if(!el.open){el.showModal();body.current?.scrollTo(0,0);}return;}
  if(!el.open)return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){el.close();return;}
  el.dataset.closing='';
  const done=()=>{if(el.dataset.closing!==undefined){delete el.dataset.closing;el.close();}};
  const timer=setTimeout(done,320);// fallback if animationend never fires
  el.addEventListener('animationend',done,{once:true});
  return()=>{clearTimeout(timer);el.removeEventListener('animationend',done);};
 },[open]);
 return <dialog ref={dialog} className={styles.grownDialog} aria-labelledby={id} onCancel={e=>{e.preventDefault();onClose();}}>
  <section className={`${shell.shell} ${shell.drawer} ${styles.grownSheet}`}>
   <header className={`${shell.header} ${styles.grownHeader}`}><BackButton onBack={onClose}/><h2 id={id}>{title}</h2><span aria-hidden="true"/></header>
   <div ref={body} className={`${shell.body} ${styles.grownBody}`}>{children}</div>
  </section>
 </dialog>;
}

/**
 * The title screen's bottom row: "For grown-ups" and "Privacy" each open a full-screen sheet (user, Oct 9 2026). Privacy is a plain link to the one privacy page, /privacy
 * (Nov 4 2026: the sheet copy was removed; /privacy looks like it and Back returns here).
 */
export function LegalLinks(){
 const [sheet,setSheet]=useState<null|'grown'>(null);
 const close=()=>setSheet(null);
 return <>
  <button type="button" className={`${styles.grownLink} ${styles.grownTop}`} data-track="sg:open" onClick={()=>setSheet('grown')}>For grown-ups</button>
  <a className={styles.grownLink} href="/privacy" data-track="sp:open">Privacy</a>
  <Sheet open={sheet==='grown'} onClose={close} title="For grown-ups" id="grown-ups-title">
   <AboutGrownUps donateReturn="start"/>
  </Sheet>
 </>;
}
