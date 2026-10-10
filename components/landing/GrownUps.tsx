'use client';
import {useEffect,useRef,useState,type ReactNode} from 'react';
import {BackButton} from '../BackButton';
import shell from '../ModalShell.module.css';
import PrivacyPolicy from '../privacy/PrivacyPolicy';
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
 * The /start bottom row: "For grown-ups" and "Privacy" each open a full-screen sheet (user, Oct 9 2026). The privacy text is the
 * shared policy (components/privacy/PrivacyPolicy.tsx), the same one /privacy shows. Without JavaScript, Privacy still links to /privacy.
 */
export function LegalLinks(){
 const [sheet,setSheet]=useState<null|'grown'|'privacy'>(null);
 const close=()=>setSheet(null);
 return <>
  <button type="button" className={styles.grownLink} data-track="sg:open" onClick={()=>setSheet('grown')}>For grown-ups</button>
  <a className={styles.grownLink} href="/privacy" data-track="sp:open" onClick={e=>{e.preventDefault();setSheet('privacy');}}>Privacy</a>
  <Sheet open={sheet==='grown'} onClose={close} title="For grown-ups" id="grown-ups-title">
   <AboutGrownUps onOpenPrivacy={()=>setSheet('privacy')} donateReturn="start"/>
  </Sheet>
  <Sheet open={sheet==='privacy'} onClose={close} title="Privacy policy" id="privacy-title"><div className={styles.grownInner}><PrivacyPolicy/></div></Sheet>
 </>;
}
