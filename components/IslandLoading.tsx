'use client';
import {useEffect} from 'react';
import styles from './IslandLoading.module.css';
import LoadingIslandArt from './LoadingIslandArt';

/** Static artwork: the island can finish loading without another rendering loop. */
export default function IslandLoading({exiting=false}:{exiting?:boolean}){
  useEffect(()=>{
    // Small shared UI assets only; leave films, audio and lesson catalogs on demand.
    const images=['/stories/films/assets/entry-grain.png','/stories/paths/abstract-island.svg?v=diagonal-2','/stories/paths/island-mark.svg','/stories/paths/settings-coast.svg','/stories/paths/coaches-coast.svg'].map(src=>{
      const image=new Image();image.decoding='async';image.src=src;void image.decode().catch(()=>{});return image;
    });
    void document.fonts?.load('24px IslandBrush').catch(()=>{});
    return()=>{images.length=0;};
  },[]);
  return <div className={`town-loading ${styles.screen} ${exiting?styles.exiting:''}`} role="status">
    <div className={styles.art} aria-hidden="true"><LoadingIslandArt/></div>
    <div className={styles.landingSurface} aria-hidden="true"/>
    <div className={styles.copy}>
      <span className={styles.eyebrow}>PLAY · LEARN · GROW</span>
      <h2>Futbol Island</h2>
      <span className="island-loading-track" aria-hidden="true"><span/></span>
    </div>
  </div>;
}
