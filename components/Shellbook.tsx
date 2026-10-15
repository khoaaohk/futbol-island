'use client';
/**
 * The Shellbook (docs/beachcombing.md): every beach find, found or not yet, how many, where it lives, its care rule, a true sea
 * fact and a football tip. The Fishbook's look and drawer (Fishbook.module.css). Opened with OPEN_SHELLBOOK from the pocket, Rosa's
 * stand or the beach HUD. Reads the save when it opens; no timers but the close slide.
 */
import {useEffect,useRef,useState} from 'react';
import {DoneButton} from './DoneButton';
import BeachFindArt from './BeachFindArt';
import shell from './ModalShell.module.css';
import styles from './Fishbook.module.css';
import {BEACH_FINDS,BEACH_RARITY_LABEL,BEACH_TIP,emptyBeach,findPlaces,readBeach,speciesFound,type BeachCare,type BeachSave} from '@/lib/town/beachcombing';

const CARE:Record<BeachCare,string>={sell:'Empty: yours to keep or sell',putBack:'Alive: put it back gently',look:'Alive and spiny: look, don’t touch'};
const SECTIONS:{id:BeachCare;title:string}[]=[{id:'sell',title:'Shells and treasures'},{id:'putBack',title:'Living sea creatures'},{id:'look',title:'Look, don’t touch'}];

export default function Shellbook({open,onClose}:{open:boolean;onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null),close=useRef<HTMLButtonElement>(null),restore=useRef<HTMLElement|null>(null);
 const [save,setSave]=useState<BeachSave>(()=>emptyBeach(0));
 const [leaving,setLeaving]=useState(false),closing=useRef(false),timer=useRef<ReturnType<typeof setTimeout>>();
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
 const requestClose=()=>{if(closing.current)return;closing.current=true;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){onClose();return;}
  setLeaving(true);timer.current=setTimeout(onClose,240);};
 useEffect(()=>{const el=dialog.current;if(!el)return;if(open&&!el.open){closing.current=false;setLeaving(false);setSave(readBeach(Date.now()));restore.current=document.activeElement instanceof HTMLElement?document.activeElement:null;el.showModal();close.current?.focus();}
  else if(!open&&el.open){el.close();restore.current?.focus({preventScroll:true});}},[open]);
 const found=speciesFound(save),total=Object.values(save.book).reduce((n,e)=>n+e.found,0),kind=Object.values(save.book).reduce((n,e)=>n+e.putBack,0);
 return <dialog ref={dialog} className={`${styles.dialog} ${leaving?styles.leaving:styles.entering}`} aria-labelledby="shellbook-title" data-shellbook onCancel={e=>{e.preventDefault();requestClose();}} onClick={e=>{if(e.target===e.currentTarget)requestClose();}} onKeyDown={e=>e.stopPropagation()} onKeyUp={e=>e.stopPropagation()}>
  <section className={`${styles.panel} ${shell.shell} ${shell.drawer}`}>
   <header className={`${shell.header} ${styles.header}`}><div><h2 id="shellbook-title">Shellbook</h2></div><DoneButton ref={close} onDone={requestClose}/></header>
   <div className={shell.body}>{open&&<div className={styles.book}>
    <p className={styles.intro}><b>{found} / {BEACH_FINDS.length} beach finds</b>{total} found in total{kind?`, ${kind} sea creature${kind===1?'':'s'} put back gently`:''}. Look for little sparkles on the sand of Summit Isle, Coral Cay and the main island&apos;s beaches. New finds wash up every day.</p>
    {SECTIONS.map(sec=>{const list=BEACH_FINDS.filter(f=>f.care===sec.id),got=list.filter(f=>save.book[f.id]).length;return <section key={sec.id} className={styles.spot} data-shellbook-section={sec.id}>
     <h3 className={styles.spotTitle}>{sec.title} <small>{got} / {list.length}</small></h3>
     <ul className={styles.grid}>{list.map(f=>{const e=save.book[f.id];return <li key={f.id} data-caught={!!e} data-shellbook-find={f.id}>
      <BeachFindArt find={f} hidden={!e} size={72}/>
      {e?<><h3>{f.name}</h3><p className={styles.eyebrow}>{BEACH_RARITY_LABEL[f.rarity]} · {CARE[f.care]}</p><p className={styles.found}>Found at: {findPlaces(f).join(', ')}</p>
       <p>Found {e.found}{f.care==='putBack'?` · put back ${e.putBack}`:''}{f.care==='sell'?` · ${f.value} coin${f.value===1?'':'s'} at Rosa’s stand`:''}</p>
       <div className={styles.fact}><span className={styles.tag}>Sea fact</span><p>{f.fact}</p><span className={styles.tag}>Football tip</span><p>{f.football}</p></div></>
      :<><h3>Not found yet</h3><p className={styles.eyebrow}>{BEACH_RARITY_LABEL[f.rarity]}</p><p className={styles.found}>Look on: {findPlaces(f).join(', ')}</p></>}
     </li>;})}</ul>
    </section>;})}
    <section className={styles.keeper}><h3>The beach rule</h3><p><b>{BEACH_TIP}</b> A starfish, a crab or a sand dollar that is still alive belongs in the sea, and hermit crabs need empty shells for their next home.</p></section>
    <p className={styles.help}>Sea facts and the Laws of the Game are real. Which beach each find turns up on is an island story (game fiction).</p>
   </div>}</div>
  </section>
 </dialog>;
}
