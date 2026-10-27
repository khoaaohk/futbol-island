'use client';
import {useEffect,useState} from 'react';
import {TENNIS_COURTS,tennisTakeaway,type TennisState} from '@/lib/games/soccerTennis';
import {readTennisStars} from '@/lib/arcade/tennisFeel';
import type {ArcadeHUD} from '@/lib/arcade/arcadeGames';
import {Icon} from '../Icon';
import {TennisCourtPicker,TennisHowTo,tennisStarText} from './TennisCourtPicker';
import styles from './TennisCourtPicker.module.css';

/** Futbol Tennis start / pause / full-time card (round 3, Oct 26 2026). One big primary button, small icon buttons
 * underneath, the court row on the start card and "How to play" behind one chevron. Nothing scrolls on a 390×844
 * phone. The first-time hint shows once (localStorage), never again. */
export const TENNIS_HINT_KEY='fi2-tennis-r3-hint-v1';
type Phase='ready'|'paused'|'over';
type Props={phase:Phase;hud:ArcadeHUD;tennis:TennisState|undefined;unlocked:number;best:number;touch:boolean;help:string;pending:boolean;status?:string;
 cardClass:string;primaryClass:string;onStart:()=>void;onBoards:()=>void;onExit:()=>void;onPick:(level:number)=>void;onCourts:()=>void};

export function TennisCard(p:Props){
 const top=Math.max(1,Math.min(TENNIS_COURTS.length,p.unlocked));
 const [level,setLevel]=useState(top),[stars,setStars]=useState<number[]>(()=>TENNIS_COURTS.map(()=>0)),[how,setHow]=useState(false),[hint,setHint]=useState(false);
 // Stars and the one-time hint live in localStorage: read after mount so server and first client render match.
 useEffect(()=>{setStars(readTennisStars());try{setHint(!localStorage.getItem(TENNIS_HINT_KEY));}catch{}},[p.phase]);
 // The card owns the chosen court and tells the game whenever it changes (and on mount), so the two never disagree.
 useEffect(()=>{if(p.phase==='ready'){setLevel(top);}},[top,p.phase]);
 useEffect(()=>{if(p.phase==='ready')p.onPick(level);},[level,p.phase]); // eslint-disable-line react-hooks/exhaustive-deps
 const play=()=>{if(hint){try{localStorage.setItem(TENNIS_HINT_KEY,'1');}catch{}}p.onStart();};
 const t=p.tennis,over=p.phase==='over'&&!!t,won=over&&t!.winner==='you',court=t?TENNIS_COURTS[t.level-1]:TENNIS_COURTS[0],drill=court.style==='drill';
 const small=<div className={styles.smallRow}>
  {p.phase!=='paused'&&<button type="button" className={styles.iconBtn} onClick={p.onBoards} aria-label="Leaderboard"><Icon name="chart" size={22}/><span>Scores</span></button>}
  {p.phase==='over'&&<button type="button" className={styles.iconBtn} onClick={p.onCourts} aria-label="Pick a court"><Icon name="ball" size={22}/><span>Courts</span></button>}
  {p.phase==='ready'&&<button type="button" className={styles.iconBtn} aria-expanded={how} onClick={()=>setHow(v=>!v)} aria-label="How to play"><Icon name="chevron" size={22} style={{rotate:how?'-90deg':'90deg'}}/><span>How</span></button>}
  <button type="button" className={styles.iconBtn} onClick={p.onExit} aria-label="Back to arcade"><Icon name="back" size={22}/><span>Arcade</span></button>
 </div>;
 if(p.phase==='ready')return <section className={`${p.cardClass} ${styles.card}`} data-tennis-card="ready">
  <h3 className={styles.title}>Futbol Tennis</h3>
  {how?<TennisHowTo level={level} touch={p.touch} help={p.help}/>:<TennisCourtPicker unlocked={p.unlocked} level={level} stars={stars} onPick={setLevel}/>}
  {hint&&!how&&<p className={styles.hint} data-tennis-hint>Tip: <b>hold</b> a shot button and let go on <b>gold</b>!</p>}
  {p.status&&<p role="status" className={styles.status}>{p.status}</p>}
  <button className={`${p.primaryClass} ${styles.play}`} disabled={p.pending} onClick={play}><Icon name="play" size={26}/>Play<small>3 coins</small></button>
  {small}
 </section>;
 if(p.phase==='paused')return <section className={`${p.cardClass} ${styles.card}`} data-tennis-card="paused">
  <h3 className={styles.title}>Time out</h3>
  <p className={styles.pauseScore}>{p.hud.score}{p.hud.tennisSets?<small>{p.hud.tennisSets}</small>:null}</p>
  <button className={`${p.primaryClass} ${styles.play}`} onClick={p.onStart}><Icon name="play" size={26}/>Resume</button>
  {small}
 </section>;
 // Full time: result, stars earned, three stat chips, one primary button.
 const earned=t?t.stars:0,unlockedNow=won&&t!.level<TENNIS_COURTS.length;
 return <section className={`${p.cardClass} ${styles.card}`} data-tennis-card="over" data-won={won||undefined}>
  <span className={styles.result}>{drill?(won?'DRILL PASSED':'DRILL DONE'):won?(t!.level===TENNIS_COURTS.length?'CHAMPION!':'COURT WON!'):'GOOD GAME!'}</span>
  <p className={styles.bigScore} aria-label={`Score ${p.hud.score}`}>{court.sets&&t?`${t.sets.you} : ${t.sets.rival}`:p.hud.score}{court.sets?<small>sets</small>:null}</p>
  <p className={styles.earned} aria-label={`${earned} of 3 stars`}>{[0,1,2].map(i=><i key={i} data-on={i<earned||undefined} style={{animationDelay:`${.15+i*.22}s`}}>★</i>)}</p>
  {t&&<ul className={styles.stats} data-tennis-summary>
   <li><b>{t.bestRally}</b><span>best rally</span></li>
   <li><b>{t.perfectTouches}</b><span>perfect</span></li>
   <li><b>{t.sweetShots}</b><span>sweet</span></li>
  </ul>}
  <p className={styles.tip}>{unlockedNow?`Next up: court ${t!.level+1}, ${TENNIS_COURTS[t!.level].name}${TENNIS_COURTS[t!.level].hard?' (HARD)':''}`:won?(earned<3?`3rd ★: ${court.star3}`:'All 3 stars. You are the champion!'):`So close! Best here ${tennisStarText(readSafe(t?.level??1))}`}</p>
  {t&&!drill&&<p className={styles.coach}>{tennisTakeaway(t)}</p>}
  {p.status&&<p role="status" className={styles.status}>{p.status}</p>}
  <button className={`${p.primaryClass} ${styles.play}`} disabled={p.pending} onClick={p.onStart}><Icon name={won?'arrow':'rotate'} size={26}/>{p.hud.nextLabel??'Play again'}</button>
  {small}
  {p.best>0&&<small className={styles.pb}>Personal best: {p.best} touch rally</small>}
 </section>;
}
/** In-play chips under the score: live rally count (glows at 5/10/15…), wind arrows, sets, and the Golden Touch meter. */
export function TennisHudChips({hud}:{hud:ArcadeHUD}){
 const rally=hud.tennisRally??0; // the Golden Touch meter already lives in the header line
 if(rally<2&&!hud.tennisWind&&!hud.tennisSets)return null;
 return <div className={styles.chips} aria-hidden="true" data-tennis-chips>
  {rally>=2&&<span className={styles.rallyChip} data-hot={rally>=10||undefined} key={rally>=5&&rally%5===0?'m'+rally:'r'}>Rally <b>{rally}</b></span>}
  {hud.tennisWind&&<span className={styles.windChip}>Wind <b>{hud.tennisWind}</b></span>}
  {hud.tennisSets&&<span className={styles.setChip}>{hud.tennisSets}</span>}
 </div>;
}
const readSafe=(level:number)=>{try{return readTennisStars()[level-1]??0;}catch{return 0;}};
