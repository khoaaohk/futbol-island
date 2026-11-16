'use client';
import {useEffect,useRef,useState} from 'react';
import styles from '@/app/(site)/site.module.css';
/**
 * The small "Play free" bar on phones (Nov 15 2026, owner item 10) for guide, card and fish pages. Under 768 px only (CSS hides it
 * wider). It shows once the page's answer (the intro) has scrolled away, and hides again whenever an in-page Play button
 * (`data-play-cta`) or a swipe island (`data-playbar-hide`: the cards deck and game) is on screen, so there are never two Play buttons in view. One IntersectionObserver, no scroll listener, no
 * timer. While it shows, the page gets bottom padding (`data-playbar` on the reading-page root), so it never covers the last
 * lines. "Hide" keeps it away for this visit (sessionStorage, try/catch). Renders nothing on the server.
 */
const OFF_KEY='fi-playbar-off';
export default function PlayBar({href,text,lang}:{href:string;text:string;lang?:'es'}){/* lang (Nov 15 2026): the Spanish pages' words */
 const [show,setShow]=useState(false),[off,setOff]=useState(true),bar=useRef<HTMLDivElement>(null);
 useEffect(()=>{let gone=false;try{gone=sessionStorage.getItem(OFF_KEY)==='1';}catch{/* private mode */}setOff(gone);},[]);
 useEffect(()=>{
  if(off||typeof IntersectionObserver==='undefined')return;
  const watch=[...document.querySelectorAll('[data-answer],[data-play-cta],[data-playbar-hide]')];/* data-playbar-hide (Nov 16 2026): the cards deck and game, whose controls sit at the screen foot */if(!watch.length)return;
  const seen=new Set<Element>();
  const io=new IntersectionObserver(es=>{for(const e of es){if(e.isIntersecting)seen.add(e.target);else seen.delete(e.target);}
   const introBelow=watch.some(el=>el.hasAttribute('data-answer')&&el.getBoundingClientRect().top>0);
   setShow(seen.size===0&&!introBelow);});
  watch.forEach(el=>io.observe(el));return()=>io.disconnect();
 },[off]);
 useEffect(()=>{const root=bar.current?.closest('[data-reading-page]');if(!root)return;root.toggleAttribute('data-playbar',show&&!off);return()=>root.removeAttribute('data-playbar');},[show,off]);
 const hide=()=>{setOff(true);try{sessionStorage.setItem(OFF_KEY,'1');}catch{/* private mode */}};
 return <div ref={bar} className={styles.playBar} hidden={!show||off} data-play-bar="">
  <span className={styles.playBarText}>{text}</span>
  <a className={styles.playBarBtn} href={href}>{lang==='es'?'Juega gratis':'Play free'}</a>
  <button type="button" className={styles.playBarHide} onClick={hide} aria-label={lang==='es'?'Ocultar la barra de Jugar':'Hide the Play bar'}>
   <span aria-hidden="true" className={styles.playBarX}/>
  </button>
 </div>;
}
