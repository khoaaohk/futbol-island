'use client';
/**
 * The Fishbook (docs/fishing.md): every species, caught or not yet, biggest size, and the full club fact with its source.
 * Opened from the small fishing HUD; fishing itself plays live in the island (no dialog).
 */
import {useEffect,useRef,useState} from 'react';
import {DoneButton} from './DoneButton';
import FishArt from './FishArt';
import shell from './ModalShell.module.css';
import styles from './Fishbook.module.css';
import {FISH,KEEPER_LESSONS,RARITY_LABEL,SHADOW_LABEL} from '@/lib/town/fishing/fishCatalog';
import {speciesCaught,spotsFor} from '@/lib/town/fishing/fishingCore';
import {useFishbook} from '@/lib/town/fishing/fishingStore';
/** Plain credit name for a source URL. Kids see no clickable external links (user, Sep 27 2026); the URLs stay in the data and docs. */
const host=(url:string)=>{try{const h=new URL(url).hostname.replace(/^www\./,'');return /(^|\.)wikipedia\.org$/.test(h)?'Wikipedia':h;}catch{return url;}};

export default function Fishbook({open,onClose}:{open:boolean;onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null),close=useRef<HTMLButtonElement>(null),restore=useRef<HTMLElement|null>(null);
 const book=useFishbook(),caught=speciesCaught(book);
 const [leaving,setLeaving]=useState(false),closing=useRef(false),timer=useRef<ReturnType<typeof setTimeout>>();
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
 const requestClose=()=>{if(closing.current)return;closing.current=true;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){onClose();return;}
  setLeaving(true);timer.current=setTimeout(onClose,240);
 };

 useEffect(()=>{const el=dialog.current;if(!el)return;if(open&&!el.open){closing.current=false;setLeaving(false);restore.current=document.activeElement instanceof HTMLElement?document.activeElement:null;el.showModal();close.current?.focus();}else if(!open&&el.open){el.close();restore.current?.focus({preventScroll:true});}},[open]);
 return <dialog ref={dialog} className={`${styles.dialog} ${leaving?styles.leaving:styles.entering}`} aria-labelledby="fishbook-title" data-fishbook onCancel={e=>{e.preventDefault();requestClose();}} onClick={e=>{if(e.target===e.currentTarget)requestClose();}} onKeyDown={e=>e.stopPropagation()} onKeyUp={e=>e.stopPropagation()}>
  <section className={`${styles.panel} ${shell.shell} ${shell.drawer}`}>
   <header className={`${shell.header} ${styles.header}`}><div><h2 id="fishbook-title">Fishbook</h2></div><DoneButton ref={close} onDone={requestClose}/></header>
   <div className={shell.body}>{open&&<div className={styles.book}>
    <p className={styles.intro}><b>{caught} / {FISH.length} species</b>{book.total} caught in total. Every species links to a real club from a port or with a sea-creature nickname.</p>
    <ul className={styles.grid}>{FISH.map(f=>{const e=book.species[f.id];return <li key={f.id} data-caught={!!e}>
     <FishArt fish={f} hidden={!e} size={92}/>
     {e?<><h3>{f.name}</h3><p className={styles.eyebrow}>{RARITY_LABEL[f.rarity]} · {SHADOW_LABEL[f.shadow]}</p><p>Caught {e.count} · biggest {e.biggest} cm · {f.price} coins at Rosa&apos;s stand</p>
      <div className={styles.fact}><span className={styles.tag}>Real football fact · {f.club.link}</span><p className={styles.club}><b>{f.club.name}</b>{f.club.nickname?` · “${f.club.nickname}”`:''}</p><p>{f.club.fact}</p><small className={styles.credit}>Source: {host(f.club.source)}</small></div></>
      :<><h3>Not caught yet</h3><p className={styles.eyebrow}>{SHADOW_LABEL[f.shadow]}</p><p>Try: {spotsFor(f.id).map(s=>s.name).join(', ')}</p></>}
    </li>;})}</ul>
    <section className={styles.keeper}><h3>The keeper&apos;s lesson</h3><p><b>{KEEPER_LESSONS.nibble.title}.</b> {KEEPER_LESSONS.nibble.text}</p><small className={styles.credit}>Source: Bar-Eli et al. (2007), Journal of Economic Psychology</small></section>
    <p className={styles.help}>Club facts are real football history. The fishing spots, their stories and which fish live where are island stories (game fiction).</p>
   </div>}</div>
  </section>
 </dialog>;
}
