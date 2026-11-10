'use client';
/**
 * The Toy Shelf (round 3A, Nov 8 2026): every gashapon machine's six toys, grouped by machine. Found toys are tiles with a
 * small flat icon drawn in CSS from the toy's two colours (no WebGL per tile); tapping one opens the 3D viewer. Toys not found
 * yet are grey silhouettes with "?" and their name hidden. Opened from the gashapon panel; the same grid (ToyShelfGrid) lives
 * inline in the backpack's Toys section (Nov 9 2026) (lib/gashapon/gashaponBrowser.ts openToyShelf).
 */
import {useEffect,useRef} from 'react';
import {NavigationButton} from './DoneButton';
import {GASHAPON_MACHINES} from '@/lib/gashapon/machines';
import {shelfCounts,toysIn} from '@/lib/gashapon/toys';
import {openToyViewer,toyOverlay,useGashapon,useToyOverlay} from '@/lib/gashapon/gashaponBrowser';
import {countShelfOpen} from '@/lib/analytics/gashaponEvents';
import {holdIslandCover} from '@/lib/videoPlayback';
import ToyIcon from './ToyIcon';
import styles from './GashaponToyShelf.module.css';

/**
 * The toy grid itself (Nov 9 2026, owner: "the gashapon toys should live in the backpack"): one section per machine, six tiles
 * each. The full-screen shelf (opened from the gashapon panel) and the backpack's Toys section (components/Backpack.tsx) both
 * render it, so they never drift. Static tiles: each toy's inline SVG icon (ToyIcon), no WebGL per tile.
 */
export function ToyShelfGrid({heading='h3',idPrefix='shelf'}:{heading?:'h3'|'h5';idPrefix?:string}){
 const save=useGashapon(),{per}=shelfCounts(save.owned),Heading=heading;
 return <>
   {GASHAPON_MACHINES.map(m=><section key={m.id} className={styles.machine} aria-labelledby={`${idPrefix}-${m.id}`} data-shelf-machine={m.id} style={{'--machine':m.color} as React.CSSProperties}>
    <div className={styles.machineHead}><Heading id={`${idPrefix}-${m.id}`}>{m.name}</Heading><span>{per[m.id]} / 6</span></div>
    <ul className={styles.grid} role="list">{toysIn(m.id).map(t=>{const have=save.owned[t.id];
     return <li key={t.id}>{have
      ?<button type="button" className={styles.tile} data-shelf-toy={t.id} data-rarity={t.rarity} onClick={()=>openToyViewer(t.id,'shelf')/* the backpack's Toys too: back returns to where you were */} aria-label={`${t.name}, ${t.rarity}, ${have.n} owned. Open to play with it.`}>
        <span className={styles.icon} aria-hidden="true"><ToyIcon id={t.id} size={56}/></span>
        <span className={styles.toyName}>{t.name}</span>{have.n>1&&<span className={styles.times}>×{have.n}</span>}
       </button>
      :<div className={styles.tile} data-shelf-missing={t.id} data-off aria-label="Not found yet"><span className={styles.icon} aria-hidden="true"><b>?</b></span><span className={styles.toyName}>Not found yet</span></div>}</li>;})}</ul>
   </section>)}
 </>;
}

export default function GashaponToyShelf({onClose}:{onClose:()=>void}){
 const save=useGashapon(),overlay=useToyOverlay(),{found,total}=shelfCounts(save.owned);
 const root=useRef<HTMLElement>(null),closeRef=useRef<HTMLButtonElement>(null),closeNow=useRef(onClose);closeNow.current=onClose;
 // The shelf covers the whole screen, so the island sleeps under it too (lib/videoPlayback.ts holdIslandCover).
 useEffect(()=>{const release=holdIslandCover(),before=document.activeElement as HTMLElement|null;closeRef.current?.focus({preventScroll:true});countShelfOpen(shelfCounts(save.owned).found);return()=>{release();before?.focus?.({preventScroll:true});};
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);
 // Keys while the shelf is on top (the viewer, when open over it, takes them first and stops them).
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(toyOverlay.get().toy)return;
   if(e.key==='Escape'){e.preventDefault();closeNow.current();}
   else if(e.key==='Tab'){const f=[...(root.current?.querySelectorAll<HTMLElement>('button:not([disabled])')??[])];if(f.length){const i=f.indexOf(document.activeElement as HTMLElement),n=e.shiftKey?(i<=0?f.length-1:i-1):(i<0||i===f.length-1?0:i+1);e.preventDefault();f[n].focus();}}
   e.stopPropagation();};
  window.addEventListener('keydown',key,true);return()=>window.removeEventListener('keydown',key,true);},[]);
 return <section ref={root} className={styles.root} role="dialog" aria-modal="true" aria-labelledby="toy-shelf-title" data-toy-shelf={found} aria-hidden={overlay.toy?true:undefined}>
  <header className={styles.header}>
   <NavigationButton ref={closeRef} back label="Back" data-toy-shelf-close onNavigate={()=>closeNow.current()}/>
   <h2 id="toy-shelf-title" className={styles.title}>Toy Shelf</h2>
   <p className={styles.count} data-toy-shelf-count>{found} / {total}</p>
  </header>
  <div className={styles.scroll}>
   {found===0&&<p className={styles.empty}>Spin a gashapon machine to find your first toy. Each machine has six.</p>}
   <ToyShelfGrid/>
  </div>
 </section>;
}
