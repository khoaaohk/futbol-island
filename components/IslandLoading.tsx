'use client';
/// <reference types="react-dom/canary" />
import {useEffect,useLayoutEffect,useRef,useState,type CSSProperties} from 'react';
import styles from './IslandLoading.module.css';
import LoadingIslandArt,{LOADING_LAND_PATH} from './LoadingIslandArt';
import LoadingBeanCast from './LoadingBeanCast';

/** Static artwork: the island can finish loading without another rendering loop. */
export default function IslandLoading({exiting=false}:{exiting?:boolean}){
  const screen=useRef<HTMLDivElement>(null),[land,setLand]=useState<{viewBox:string;style:CSSProperties}|null>(null);
  useLayoutEffect(()=>{if(!exiting||!screen.current)return;const root=screen.current,shape=Array.from(root.querySelectorAll<SVGPathElement>('[data-loading-tan-land]')).find(p=>p.getBoundingClientRect().width>0);if(!shape)return;const r=shape.getBoundingClientRect(),container=root.getBoundingClientRect(),b=shape.getBBox();setLand({viewBox:`${b.x} ${b.y} ${b.width} ${b.height}`,style:{'--land-x':`${r.left-container.left+r.width/2}px`,'--land-y':`${r.top-container.top+r.height/2}px`,'--land-w':`${r.width}px`,'--land-h':`${r.height}px`,'--land-dx':`${container.width/2-(r.left-container.left+r.width/2)}px`,'--land-dy':`${container.height/2-(r.top-container.top+r.height/2)}px`,'--land-sx':container.width*2/r.width,'--land-sy':container.height*2/r.height} as CSSProperties});},[exiting]);
  useEffect(()=>{
    // Small shared UI assets only; leave films, audio and lesson catalogs on demand.
    const images=['/stories/films/assets/entry-grain.png','/stories/paths/abstract-island.svg?v=diagonal-2','/stories/paths/island-mark.svg','/stories/paths/settings-coast.svg','/stories/paths/coaches-coast.svg'].map(src=>{
      const image=new Image();image.decoding='async';image.src=src;void image.decode().catch(()=>{});return image;
    });
    void document.fonts?.load('24px IslandBrush').catch(()=>{});
    return()=>{images.length=0;};
  },[]);
  return <div ref={screen} data-main-island-loading className={`town-loading ${styles.screen} ${exiting?styles.exiting:''}`} role="status">
    <div className={styles.art} aria-hidden="true"><LoadingIslandArt/></div>
    {land&&<svg data-island-tan-wipe className={styles.tanWipe} viewBox={land.viewBox} style={land.style} preserveAspectRatio="none" aria-hidden="true"><path d={LOADING_LAND_PATH} fill="#dfc587"/></svg>}
    <LoadingBeanCast/>
    <div className={styles.copy}>
      <span className={styles.eyebrow}>PLAY · LEARN · GROW</span>
      <h2>Futbol Island</h2>
      <p className={styles.tagline}>Learn football by playing</p>
      <span className="island-loading-track" aria-hidden="true"><span/></span>
    </div>
  </div>;
}
