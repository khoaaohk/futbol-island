'use client';
/// <reference types="react-dom/canary" />
import {useEffect,useLayoutEffect,useRef,useState,type CSSProperties} from 'react';
import styles from './IslandLoading.module.css';
import LoadingIslandArt,{LOADING_LAND_PATH} from './LoadingIslandArt';
import LoadingBeanCast from './LoadingBeanCast';

/** sessionStorage → <html data-island-handoff> before first paint (the /start hand-off after a full reload; key shared with
 *  components/landing/handoffMotion.ts HANDOFF_STORAGE_KEY). */
const HANDOFF_BOOT="try{var v=sessionStorage.getItem('fi2-island-handoff');if(v){sessionStorage.removeItem('fi2-island-handoff');document.documentElement.dataset.islandHandoff=v==='tan'?'tan':'reload'}}catch(e){}";

/** Static artwork: the island can finish loading without another rendering loop. */
export default function IslandLoading({exiting=false}:{exiting?:boolean}){
  const screen=useRef<HTMLDivElement>(null),[land,setLand]=useState<{viewBox:string;style:CSSProperties}|null>(null);
  useLayoutEffect(()=>{if(!exiting||!screen.current)return;const root=screen.current,shape=Array.from(root.querySelectorAll<SVGPathElement>('[data-loading-tan-land]')).find(p=>p.getBoundingClientRect().width>0);if(!shape)return;const r=shape.getBoundingClientRect(),container=root.getBoundingClientRect(),b=shape.getBBox();setLand({viewBox:`${b.x} ${b.y} ${b.width} ${b.height}`,style:{'--land-x':`${r.left-container.left+r.width/2}px`,'--land-y':`${r.top-container.top+r.height/2}px`,'--land-w':`${r.width}px`,'--land-h':`${r.height}px`,'--land-dx':`${container.width/2-(r.left-container.left+r.width/2)}px`,'--land-dy':`${container.height/2-(r.top-container.top+r.height/2)}px`,'--land-sx':container.width*2/r.width,'--land-sy':container.height*2/r.height} as CSSProperties});},[exiting]);
  useEffect(()=>{
    // Small shared UI assets only; leave films, audio and lesson catalogs on demand. The Settings and Coaches dialog backdrops
    // (settings-coast.svg, coaches-coast.svg, ~28 KB each) are no longer warmed here (Oct 7 2026): their CSS loads them when the
    // dialog opens, so a visit that never opens them doesn't fetch them.
    const images=['/stories/films/assets/entry-grain.png','/stories/paths/abstract-island.svg?v=diagonal-2','/stories/paths/island-mark.svg'].map(src=>{
      const image=new Image();image.decoding='async';image.src=src;void image.decode().catch(()=>{});return image;
    });
    void document.fonts?.load('24px IslandBrush').catch(()=>{});
    return()=>{images.length=0;};
  },[]);
  // Hand-off from the /start title screen (Oct 9 2026, components/landing/handoffMotion.ts). /start morphs into this exact screen and
  // sets <html data-island-handoff="<track start time>"> before the route switches, so this loader starts SETTLED (no coast-arrive /
  // cast-pop replay; CSS below) and its track runs on the same timeline. A full reload (a restored save) passes the flag through
  // sessionStorage; the inline script turns it into the same attribute before first paint. The flag is removed when this loader
  // has finished. Without the flag (every normal cold start) nothing here does anything.
  // data-island-handoff="tan" (the /start water-loader hand-off): /start ends on a full tan sheet (its island's sand expanded to the
  // whole screen), so this loader starts as that same plain tan sheet (CSS below) and, when the island is ready, fades away exactly
  // as its normal exit ends: no art, characters or title in between.
  useLayoutEffect(()=>{const start=Number(document.documentElement.dataset.islandHandoff);if(!Number.isFinite(start)||start<=1)return;
    screen.current?.querySelector('.island-loading-track>span')?.getAnimations().forEach(a=>{a.startTime=start;});},[]);
  // The flag ends with the game's loader: removed when a loader that has run its exit unmounts (a loader that never exits, e.g. an
  // overlay copy on /start, leaves it for the game's own loader).
  const exited=useRef(false);exited.current=exiting;
  useEffect(()=>()=>{if(exited.current)delete document.documentElement.dataset.islandHandoff;},[]);
  return <div ref={screen} data-main-island-loading className={`town-loading ${styles.screen} ${exiting?styles.exiting:''}`} role="status">
    <script dangerouslySetInnerHTML={{__html:HANDOFF_BOOT}}/>
    <div className={styles.art} aria-hidden="true"><LoadingIslandArt/></div>
    {land&&<svg data-island-tan-wipe className={styles.tanWipe} viewBox={land.viewBox} style={land.style} preserveAspectRatio="none" aria-hidden="true"><path d={LOADING_LAND_PATH} fill="#dfc587"/></svg>}
    <LoadingBeanCast/>
    <div className={styles.copy}>
      <span className={styles.eyebrow}>PLAY · LEARN · GROW</span>
      <h2>Futbol Island</h2>
      <span className="island-loading-track" aria-hidden="true"><span/></span>
    </div>
  </div>;
}
