'use client';
import {useEffect,useRef,useState} from 'react';
import {useRouter} from 'next/navigation';
import {GAME_HREF,onIdle,warmGame} from './playLaunch';
import {markTanHandoff,markTanReload,runTanExit,runWaterFill} from './waterLaunch';
import {trackStart} from '@/lib/analytics/startEvents';
import styles from './Title.module.css';

/**
 * The big gold pill that takes a player into the game (user, Oct 9 2026). Pressed (or started by the save flow), it becomes a
 * water loader: the links and other buttons fade, water rises inside the pill while the game's code loads (waterLaunch.ts), then
 * the title screen hands off through the full-tan exit. `apply`: a restored save, applied (with its reload into `/`) at the end.
 * Keeps data-landing-play inside the data-title-card container for start-page analytics.
 */
export default function WaterPill({label='Play',sub,card,autoStart=false,apply}:{label?:string;sub?:string;card:string;autoStart?:boolean;apply?:()=>void}){
 const router=useRouter();
 const button=useRef<HTMLButtonElement>(null),fill=useRef<HTMLElement>(null),wrap=useRef<HTMLDivElement>(null);
 const [loading,setLoading]=useState(false),[level,setLevel]=useState(0);
 const started=useRef(false);
 useEffect(()=>onIdle(()=>warmGame(router)),[router]);
 const go=()=>{
  if(started.current||!fill.current)return;started.current=true;setLoading(true);
  const screen=document.querySelector<HTMLElement>('[data-title-scene]');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  screen?.setAttribute('data-launch','');router.prefetch(GAME_HREF);
  void runWaterFill(fill.current,{reduced,onLevel:setLevel})
   .then(()=>screen?runTanExit(screen,wrap.current,{reduced}):undefined)
   .then(()=>{if(apply){markTanReload();apply();}else{markTanHandoff();router.push(GAME_HREF);}});
 };
 // The save flow hands over straight into loading (a new code saved, or a restored island): no second tap.
 useEffect(()=>{if(!autoStart)return;const t=setTimeout(()=>{if(card!=='restored')trackStart(`st:play_${card}`);go();},reducedNow()?0:420);return()=>clearTimeout(t);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[autoStart]);
 return <div ref={wrap} className={styles.pillWrap}>
  <button ref={button} type="button" className={`${styles.start} ${styles.waterPill}`} data-landing-play="hero" data-loading={loading||undefined}
   aria-busy={loading||undefined} aria-label={loading?`Loading the island: ${level}%`:undefined} disabled={loading} onClick={go}>
   <i className={styles.water} aria-hidden="true"><i ref={fill} className={styles.waterFill}>
    <svg className={`${styles.waterCrest} ${styles.waterCrestBack}`} viewBox="0 0 240 24" preserveAspectRatio="none" focusable="false"><path d="M0 12C20 4 40 4 60 12S100 20 120 12 160 4 180 12 220 20 240 12V24H0Z"/></svg>
    <svg className={styles.waterCrest} viewBox="0 0 240 24" preserveAspectRatio="none" focusable="false"><path d="M0 12C20 4 40 4 60 12S100 20 120 12 160 4 180 12 220 20 240 12V24H0Z"/></svg>
   </i></i>
   <span>{loading?'Loading…':label}</span>{sub&&!loading&&<small>{sub}</small>}
  </button>
 </div>;
}
const reducedNow=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
