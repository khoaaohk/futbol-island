'use client';
import {useEffect,useRef,useState} from 'react';
import {markPillReload,markTanHandoff,runPillExit,runWaterFill} from './waterLaunch';
import {trackStart} from '@/lib/analytics/startEvents';
import {enterGame,rememberInGame} from '@/lib/rootView';
import {bootMark} from '@/lib/boot/perfMarks';
import {markIslandCover} from '@/components/islandLoadingBoot';
import {warmIsland} from '../root/islandPreload';
import styles from './Title.module.css';

/**
 * The big gold pill that takes a player into the game (user, Oct 9 2026). Pressed (or started by the save flow), it becomes a
 * water loader: the links and other buttons fade, water rises inside the pill while the game's code loads (waterLaunch.ts), then
 * `/` switches to the game in place under the title screen, which fades straight into the island once it is drawn (Nov 4 2026:
 * no tan sheet before the island; enterGame → components/root/RootSwitch.tsx; no navigation, the URL stays `/`). `apply`: a restored save, applied at the end; its reload lands in the game
 * (rememberInGame) and starts as the same sea + "Loading…" pill the title screen ended on (runPillExit / markPillReload).
 * Keeps data-landing-play inside the data-title-card container for start-page analytics.
 */
export default function WaterPill({label='Play',sub,card,autoStart=false,apply}:{label?:string;sub?:string;card:string;autoStart?:boolean;apply?:()=>void}){
 const button=useRef<HTMLButtonElement>(null),fill=useRef<HTMLElement>(null),wrap=useRef<HTMLDivElement>(null);
 const [loading,setLoading]=useState(false),[level,setLevel]=useState(0);
 const started=useRef(false);
 const go=()=>{
  if(started.current||!fill.current)return;started.current=true;setLoading(true);bootMark('play');
  // Build the island while the water rises (a restore's Play reloads the page, so it only needs the code in the HTTP cache).
  warmIsland(apply?'restore':'play');
  const screen=document.querySelector<HTMLElement>('[data-title-scene]');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  screen?.setAttribute('data-launch','');
  void runWaterFill(fill.current,{reduced,onLevel:setLevel})
   // A restore reloads the page (Nov 5 2026: no tan sheet): the title fades to its sea with only the full "Loading…" pill left,
   // and the reload's loader paints exactly that (data-island-handoff="pill") before it fades into the island. Play does not reload
   // (Nov 4 2026): the title screen stays up as the cover over the game while Town builds and fades straight into the island.
   .then(()=>screen&&apply?runPillExit(screen,wrap.current,{reduced}):null)
   .then(box=>{bootMark('tan-full');if(apply){rememberInGame();markPillReload(box);apply();}else{markTanHandoff();markIslandCover();enterGame();}});
 };
 // The save flow hands over straight into loading (a new code saved, or a restored island): no second tap.
 useEffect(()=>{if(!autoStart)return;const t=setTimeout(()=>{if(card!=='restored')trackStart(`st:play_${card}`);go();},reducedNow()?0:420);return()=>clearTimeout(t);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[autoStart]);
 return <div ref={wrap} className={styles.pillWrap}>
  <button ref={button} type="button" className={`${styles.start} ${styles.waterPill}`} data-landing-play="hero" data-loading={loading||autoStart||undefined}
   aria-busy={loading||autoStart||undefined} aria-label={loading||autoStart?`Loading the island: ${level}%`:undefined} disabled={loading||autoStart} onClick={go}>
   <i className={styles.water} aria-hidden="true"><i ref={fill} className={styles.waterFill}>
    <svg className={`${styles.waterCrest} ${styles.waterCrestBack}`} viewBox="0 0 240 24" preserveAspectRatio="none" focusable="false"><path d="M0 12C20 4 40 4 60 12S100 20 120 12 160 4 180 12 220 20 240 12V24H0Z"/></svg>
    <svg className={styles.waterCrest} viewBox="0 0 240 24" preserveAspectRatio="none" focusable="false"><path d="M0 12C20 4 40 4 60 12S100 20 120 12 160 4 180 12 220 20 240 12V24H0Z"/></svg>
   </i></i>
   {/* Nov 8 2026 (owner): a pill the save flow starts by itself (autoStart: a new code, a restored island) says "Loading…" from its
       first frame. It used to land as a second "Play" (right after the sheet's own Play) and then switch label. */}
   <span data-long={label.length>10?'':undefined}>{loading||autoStart?'Loading…':label}</span>{sub&&!loading&&!autoStart&&<small>{sub}</small>}
  </button>
 </div>;
}
const reducedNow=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
