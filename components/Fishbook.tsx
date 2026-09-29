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
import {FISH,FISH_SPOTS,KEEPER_LESSONS,RARITY_LABEL,SHADOW_LABEL,isExclusive,type FishSpecies} from '@/lib/town/fishing/fishCatalog';
import {speciesCaught} from '@/lib/town/fishing/fishingCore';
import {useFishbook} from '@/lib/town/fishing/fishingStore';
/** Plain credit name for a source URL. Kids see no clickable external links (user, Sep 27 2026); the URLs stay in the data and docs. */
const LANG:Record<string,string>={en:'',it:' (Italian)',es:' (Spanish)',pt:' (Portuguese)',fr:' (French)',nl:' (Dutch)',de:' (German)',ja:' (Japanese)',th:' (Thai)'};
const host=(url:string)=>{try{const h=new URL(url).hostname.replace(/^www\./,''),w=h.match(/^([a-z]+)\.wikipedia\.org$/);return w?`Wikipedia${LANG[w[1]]??''}`:h;}catch{return url;}};
const credit=(f:FishSpecies)=>f.club.credit??host(f.club.source);
/** Shared species first, then each spot's own specials (the Fishbook shows where every species lives, never how often it bites). */
const SECTIONS=[{id:'shared',title:'Found at several spots',fish:FISH.filter(f=>!isExclusive(f))},...FISH_SPOTS.map(s=>({id:s.id,title:`${s.name} specials`,fish:FISH.filter(f=>isExclusive(f)&&f.spots[0]===s.id)}))].filter(s=>s.fish.length);
const foundAt=(f:FishSpecies)=>f.spots.length>=FISH_SPOTS.length?'every fishing spot':FISH_SPOTS.filter(s=>f.spots.includes(s.id)).map(s=>s.name).join(', ');

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
    <p className={styles.intro}><b>{caught} / {FISH.length} species</b>{book.total} caught in total. Every sea animal links to a real club, team or football story from the sea. Each fishing spot has its own specials.</p>
    {SECTIONS.map(sec=>{const got=sec.fish.filter(f=>book.species[f.id]).length;return <section key={sec.id} className={styles.spot} data-fishbook-spot={sec.id}>
     <h3 className={styles.spotTitle}>{sec.title} <small>{got} / {sec.fish.length}</small></h3>
     <ul className={styles.grid}>{sec.fish.map(f=>{const e=book.species[f.id];return <li key={f.id} data-caught={!!e}>
      <FishArt fish={f} hidden={!e} size={92}/>
      {e?<><h3>{f.name}</h3><p className={styles.eyebrow}>{RARITY_LABEL[f.rarity]} · {SHADOW_LABEL[f.shadow]}</p><p className={styles.found}>Found at: {foundAt(f)}</p><p>Caught {e.count} · biggest {e.biggest} cm · {f.price} coins at Rosa&apos;s stand</p>
       <div className={styles.fact}><span className={styles.tag}>Real football fact · {f.club.link}</span><p className={styles.club}><b>{f.club.name}</b>{f.club.nickname?` · “${f.club.nickname}”`:''}</p><p>{f.club.fact}</p><small className={styles.credit}>Source: {credit(f)}</small></div></>
       :<><h3>Not caught yet</h3><p className={styles.eyebrow}>{SHADOW_LABEL[f.shadow]}</p><p className={styles.found}>Found at: {foundAt(f)}</p></>}
     </li>;})}</ul>
    </section>;})}
    <section className={styles.keeper}><h3>The keeper&apos;s lesson</h3><p><b>{KEEPER_LESSONS.nibble.title}.</b> {KEEPER_LESSONS.nibble.text}</p><small className={styles.credit}>Source: Bar-Eli et al. (2007), Journal of Economic Psychology</small></section>
    <p className={styles.help}>Club facts are real football history. The fishing spots, their stories and which fish live where are island stories (game fiction).</p>
   </div>}</div>
  </section>
 </dialog>;
}
