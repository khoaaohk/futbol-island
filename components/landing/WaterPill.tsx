'use client';
import {useEffect,useRef,useState} from 'react';
import {markTanHandoff,markTanReload,runTanExit,runWaterFill} from './waterLaunch';
import {trackStart} from '@/lib/analytics/startEvents';
import {enterGame,rememberInGame} from '@/lib/rootView';
import {bootMark} from '@/lib/boot/perfMarks';
import styles from './Title.module.css';

/**
 * The big gold pill that takes a player into the game (user, Oct 9 2026). Pressed (or started by the save flow), it becomes a
 * water loader: the links and other buttons fade, water rises inside the pill while the game's code loads (waterLaunch.ts), then
 * the title screen hands off through the full-tan exit and `/` switches to the game in place (enterGame → components/root/
 * RootSwitch.tsx; no navigation, the URL stays `/`). `apply`: a restored save, applied at the end; its reload lands in the game
 * (rememberInGame) and starts as the same tan sheet (markTanReload).
 * Keeps data-landing-play inside the data-title-card container for start-page analytics.
 */
export default function WaterPill({label='Play',sub,card,autoStart=false,apply}:{label?:string;sub?:string;card:string;autoStart?:boolean;apply?:()=>void}){
 const button=useRef<HTMLButtonElement>(null),fill=useRef<HTMLElement>(null),wrap=useRef<HTMLDivElement>(null);
 const [loading,setLoading]=useState(false),[level,setLevel]=useState(0);
 const started=useRef(false);
 const go=()=>{
  if(started.current||!fill.current)return;started.current=true;setLoading(true);bootMark('play');
  const screen=document.querySelector<HTMLElement>('[data-title-scene]');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  screen?.setAttribute('data-launch','');
  void runWaterFill(fill.current,{reduced,onLevel:setLevel})
   .then(()=>screen?runTanExit(screen,wrap.current,{reduced}):undefined)
   .then(()=>{bootMark('tan-full');if(apply){rememberInGame();markTanReload();apply();}else{markTanHandoff();enterGame();}});
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
