'use client';
import {useEffect,useState} from 'react';
import {TENNIS_COURTS,TENNIS_TOURS,TENNIS_TOUR_RULES,tennisTakeaway,tennisLossLine,tennisTourUnlocked,tennisMatchName,tennisRunLives,type TennisState} from '@/lib/games/soccerTennis';
import {tennisRampRow,tennisMatchTip} from '@/lib/arcade/tennisEndless';
import {readTennisStars} from '@/lib/arcade/tennisFeel';
import type {ArcadeHUD} from '@/lib/arcade/arcadeGames';
import {Icon} from '../Icon';
import {TennisCourtPicker,TennisHowTo,tennisStarText} from './TennisCourtPicker';
import styles from './TennisCourtPicker.module.css';
import skin from './skins/tennis.module.css';
import {tennisVenueFor} from '@/lib/arcade/tennisVenues';

/** Futbol Tennis start / pause / full-time card (round 3, Oct 26 2026). One big primary button, small icon buttons
 * underneath, the court row on the start card and "How to play" behind one chevron. Nothing scrolls on a 390×844
 * phone. The first-time hint shows once (localStorage), never again. */
export const TENNIS_HINT_KEY='fi2-tennis-r3-hint-v1';
type Phase='ready'|'paused'|'over';
type Props={phase:Phase;hud:ArcadeHUD;tennis:TennisState|undefined;unlocked:number;best:number;touch:boolean;help:string;pending:boolean;status?:string;
 cardClass:string;primaryClass:string;onStart:()=>void;onBoards:()=>void;onExit:()=>void;onPick:(level:number)=>void;onCourts:()=>void;
 /** Nov 8 2026 tours: the picked tour (0 = a court), each tour's best, a new best this run, pick a tour (0 = back to the courts). */
 tour?:number;tourBest?:[number,number];newBest?:boolean;onTour?:(tour:number)=>void};

export function TennisCard(p:Props){
 const top=Math.max(1,Math.min(TENNIS_COURTS.length,p.unlocked));
 const [level,setLevel]=useState(top),[stars,setStars]=useState<number[]>(()=>TENNIS_COURTS.map(()=>0)),[how,setHow]=useState(false),[hint,setHint]=useState(false);
 // Stars and the one-time hint live in localStorage: read after mount so server and first client render match.
 useEffect(()=>{setStars(readTennisStars());try{setHint(!localStorage.getItem(TENNIS_HINT_KEY));}catch{}},[p.phase]);
 // The card owns the chosen court and tells the game whenever it changes (and on mount), so the two never disagree.
 useEffect(()=>{if(p.phase==='ready'){setLevel(top);}},[top,p.phase]);
 useEffect(()=>{if(p.phase==='ready')p.onPick(level);},[level,p.phase]); // eslint-disable-line react-hooks/exhaustive-deps
 const play=()=>{if(hint){try{localStorage.setItem(TENNIS_HINT_KEY,'1');}catch{}}p.onStart();};
 const tour=p.tour===1||p.tour===2?p.tour:0;
 const t=p.tennis,over=p.phase==='over'&&!!t,won=over&&t!.winner==='you',court=t?TENNIS_COURTS[t.level-1]:TENNIS_COURTS[0],drill=court.style==='drill';
 const small=<div className={styles.smallRow}>
  {p.phase!=='paused'&&<button type="button" className={styles.iconBtn} onClick={p.onBoards} aria-label="Leaderboard"><Icon name="chart" size={22}/><span>Scores</span></button>}
  {p.phase==='over'&&<button type="button" className={styles.iconBtn} onClick={p.onCourts} aria-label="Pick a court"><Icon name="ball" size={22}/><span>Courts</span></button>}
  {p.phase==='ready'&&<button type="button" className={styles.iconBtn} aria-expanded={how} onClick={()=>setHow(v=>!v)} aria-label="How to play"><Icon name="chevron" size={22} style={{rotate:how?'-90deg':'90deg'}}/><span>How</span></button>}
  <button type="button" className={styles.iconBtn} onClick={p.onExit} aria-label="Back to arcade"><Icon name="back" size={22}/><span>Arcade</span></button>
 </div>;
 if(p.phase==='ready')return <section className={`${p.cardClass} ${styles.card}`} data-tennis-card="ready">
  <h3 className={styles.title}>Futbol Tennis</h3>
  {how?<TennisHowTo level={level} touch={p.touch} help={p.help}/>:<><TennisCourtPicker unlocked={p.unlocked} level={level} stars={stars} tour={tour} onPick={n=>{if(tour)p.onTour?.(0);setLevel(n);}}/>
   <TennisTours unlocked={p.unlocked} tour={tour} best={p.tourBest??[0,0]} onTour={t=>p.onTour?.(t===tour?0:t)}/></>}
  {hint&&!how&&<p className={styles.hint} data-tennis-hint>Tip: <b>hold</b> a shot button and let go on <b>gold</b>!</p>}
  {p.status&&<p role="status" className={styles.status}>{p.status}</p>}
  <button className={`${p.primaryClass} ${styles.play}`} disabled={p.pending} onClick={play}><Icon name="play" size={26}/>{tour?`Play ${TENNIS_TOURS[tour-1].name}`:'Play'}</button>
  {small}
 </section>;
 // Nov 8 2026: a confetti burst (CSS, card only, once) and a flashing personal-best line on a new best.
 const confetti=p.newBest?<div className={styles.confetti} aria-hidden="true">{CONFETTI.map((c,i)=><i key={i} style={{left:`${c[0]}%`,background:c[1],animationDelay:`${c[2]}s`}}/>)}</div>:null;
 // Tour over: the tour points, the level reached, three stat chips, why it ended, one primary button.
 if(t&&t.tour&&p.phase==='over'){const rules=TENNIS_TOUR_RULES[t.tour-1],best=(p.tourBest??[0,0])[t.tour-1],why=tennisLossLine(t);
  return <section className={`${p.cardClass} ${styles.card}`} data-tennis-card="over" data-tennis-tour-over={t.tour} data-new-best={p.newBest||undefined}>
   {confetti}
   <span className={styles.result}>{p.newBest?'NEW BEST!':`${rules.name.toUpperCase()} OVER`}</span>
   <p className={styles.bigScore} aria-label={`${t.tourScore} tour points`}>{t.tourScore}<small>tour points · level {t.tourHeat+1}</small></p>
   <p className={styles.tip} data-tennis-reached>You reached {tennisMatchName(t)}.</p>
   <ul className={styles.stats} data-tennis-summary>
    <li><b>{t.bestRally}</b><span>best rally</span></li>
    <li><b>{t.perfectTouches}</b><span>perfect</span></li>
    <li><b>×{t.bestCombo}</b><span>combo</span></li>
   </ul>
   {why&&<p className={styles.why} data-tennis-why>{why}</p>}
   <p className={styles.coach} data-tennis-tip>{tennisTakeaway(t)}</p>
   {p.status&&<p role="status" className={styles.status}>{p.status}</p>}
   <button className={`${p.primaryClass} ${styles.play}`} disabled={p.pending} onClick={p.onStart}><Icon name="rotate" size={26}/>{p.hud.nextLabel??'Play again'}</button>
   {small}
   <small className={styles.pb} data-new={p.newBest||undefined}>{p.newBest?'New personal best!':`Best: ${best} tour points`}</small>
  </section>;}
 // Endless play (Nov 10 2026): the run is over (the last ball was lost). The run's points, how far it got (the match and opponent),
 // the best stars on the court it ended on, three stat chips, why it ended, one tip, one primary button.
 const earned=t?readSafe(t.level):0,wonAny=!!t&&t.matchesWon>0;
 return <section className={`${p.cardClass} ${styles.card}`} data-tennis-card="over" data-won={wonAny||undefined}>
  <span className={styles.result}>{wonAny?`${t!.matchesWon} ${t!.matchesWon===1?'MATCH':'MATCHES'} WON!`:drill?'DRILL DONE':'GOOD GAME!'}</span>
  <p className={styles.bigScore} aria-label={`${t?.tourScore??0} points`}>{t?.tourScore??0}<small>points</small></p>
  {t&&<p className={styles.tip} data-tennis-reached>You reached {tennisMatchName(t)} on {court.name}.</p>}
  <p className={styles.earned} aria-label={`Best on this court: ${earned} of 3 stars`}>{[0,1,2].map(i=><i key={i} data-on={i<earned||undefined} style={{animationDelay:`${.15+i*.22}s`}}>★</i>)}</p>
  {t&&<ul className={styles.stats} data-tennis-summary>
   <li><b>{t.bestRally}</b><span>best rally</span></li>
   <li><b>{t.perfectTouches}</b><span>perfect</span></li>
   <li><b>{t.sweetShots}</b><span>sweet</span></li>
  </ul>}
  {t&&t.firstTouchTries>0&&<p className={styles.status} data-tennis-first-touch>First touches on target: <b>{t.firstTouchOnTarget}</b></p>}
  {confetti}
  {over&&!drill&&tennisLossLine(t!)?<p className={styles.why} data-tennis-why>{tennisLossLine(t!)}</p>:null}
  {!(over&&!drill&&tennisLossLine(t!))&&<p className={styles.tip}>{earned<3?(earned?`3rd ★: ${court.star3}`:`So close! Best here ${tennisStarText(earned)}`):'All 3 stars on this court!'}</p>}
  {t&&<p className={styles.coach} data-tennis-tip>{drill?tennisMatchTip(t.match):tennisTakeaway(t)}</p>}
  {p.status&&<p role="status" className={styles.status}>{p.status}</p>}
  <button className={`${p.primaryClass} ${styles.play}`} disabled={p.pending} onClick={p.onStart}><Icon name="rotate" size={26}/>{p.hud.nextLabel??'Play again'}</button>
  {small}
  {p.best>0&&<small className={styles.pb} data-new={p.newBest||undefined}>{p.newBest?`New personal best: ${t?.bestRally??p.best} touch rally!`:`Personal best: ${p.best} touch rally`}</small>}
 </section>;
}
/** In-play chips under the score: live rally count (glows at 5/10/15…), wind arrows, sets, and the Golden Touch meter. */
export function TennisHudChips({hud}:{hud:ArcadeHUD}){
 const rally=hud.tennisRally??0; // the Golden Touch meter already lives in the header line
 const tourOn=hud.tennisTourMax!==undefined,mult=hud.tennisMult??0,combo=hud.tennisCombo??1;
 // Tours only: one slim strip under the score (balls left, ramp level, the last touch's multiplier + combo). The classic courts keep
 // the owner's clean court (Oct 27 2026: no chips over the court; the rally/wind/set chips stay hidden by ArcadeGame3D.module.css).
 if(tourOn)return <div className={styles.tourStrip} aria-hidden="true" data-tennis-tour-strip>
  <span className={styles.livesChip} data-low={(hud.tennisTourLives??0)<=1||undefined}>{Array.from({length:hud.tennisTourMax??0},(_,i)=><i key={i} data-on={i<(hud.tennisTourLives??0)||undefined}/>)}<b>Lv {hud.tennisTourLevel??1}</b></span>
  {mult>0&&<span className={styles.multChip} data-mult={mult} key={'g'+(hud.tennisGainId??0)}><b>×{mult}</b>{MULT_WORD[mult]??''}{combo>1?<em>combo ×{combo}</em>:null}</span>}
 </div>;
 if(rally<2&&!hud.tennisWind&&!hud.tennisSets)return null;
 return <div className={styles.chips} aria-hidden="true" data-tennis-chips>
  {rally>=2&&<span className={styles.rallyChip} data-hot={rally>=10||undefined} key={rally>=5&&rally%5===0?'m'+rally:'r'}>Rally <b>{rally}</b></span>}
  {hud.tennisWind&&<span className={styles.windChip}>Wind <b>{hud.tennisWind}</b></span>}
  {hud.tennisSets&&<span className={styles.setChip}>{hud.tennisSets}</span>}
 </div>;
}
/** The touch multiplier in kid words (HUD chip on tours). */
const MULT_WORD:Record<number,string>={1:'scrappy',2:'clean',3:'perfect',4:'golden'};
/** Confetti pieces: left %, colour, delay (s). Twelve CSS pieces, one burst, card only (no canvas, no loop). */
const CONFETTI:ReadonlyArray<readonly [number,string,number]>=[[6,'#ffc83a',0],[14,'#19b5a5',.08],[23,'#f0452e',.02],[31,'#fff3d6',.12],[40,'#2f6fb0',.05],[49,'#ff8a3c',.15],[57,'#ffc83a',.03],[66,'#f0452e',.1],[74,'#19b5a5',.06],[82,'#fff3d6',.14],[90,'#ff8a3c',.04],[96,'#2f6fb0',.09]];
/** The two tours (Nov 8 2026): one row under the courts. Locked until you reach their court on the ladder; shows each tour's best. */
export function TennisTours({unlocked,tour,best,onTour}:{unlocked:number;tour:number;best:[number,number];onTour:(tour:number)=>void}){
 return <div className={styles.tours} role="group" aria-label="Tours: endless, every touch scores">
  {TENNIS_TOURS.map((c,i)=>{const n=i+1,open=tennisTourUnlocked(n,unlocked),r=TENNIS_TOUR_RULES[i];
   return <button key={c.name} type="button" className={styles.tourChip} data-tennis-tour={n} aria-pressed={tour===n} disabled={!open} onClick={()=>onTour(n)}
    aria-label={`${c.name}${open?`, ${r.lives} balls, best ${best[i]}`:`, locked: reach court ${r.unlockCourt}`}`}>
    <b>{c.name}</b><span>{open?(best[i]?`Best ${best[i]}`:`${r.lives} balls`):`Reach court ${r.unlockCourt}`}</span></button>;})}
 </div>;
}
const readSafe=(level:number)=>{try{return readTennisStars()[level-1]??0;}catch{return 0;}};

const titleCase=(s:string)=>s.toLowerCase().replace(/(^|[\s-])\S/g,m=>m.toUpperCase());
/** Comic score panel (house style, Nov 10 2026): a tilted paper caption box under the top bar. Two rows (you / the rival by name)
 * with hand-cut numerals for the points, pips for sets, a dot on the server; underneath, the live rally count and a pennant that
 * points with the wind (the same wind the flags, palms and gust lines show on court). Tours show one row: the tour points. Display only. */
export function TennisScoreboard({hud,tennis}:{hud:ArcadeHUD;tennis:TennisState|undefined}){
 if(!tennis)return null;
 const court=tennis.tour?TENNIS_TOURS[tennis.tour-1]:TENNIS_COURTS[Math.max(0,Math.min(TENNIS_COURTS.length-1,tennis.level-1))],venue=tennis.tour&&tennis.matchesWon%9!==0?tennisVenueFor(tennis.venueStop,0):tennisVenueFor(tennis.level,tennis.tour);/* endless: a tour walks the stops too */
 const rank=tennisRampRow(tennis.match).rank,balls=tennisRunLives(tennis);
 const rally=hud.tennisRally??0,wind=tennis.wind,strength=Math.abs(wind)<.2?0:Math.abs(wind)>1.1?2:1;
 const row=(side:'you'|'rival',name:string)=><div className={skin.sbRow} data-side={side} data-serving={tennis.server===side||undefined}>
  <span className={skin.sbName}>{name}</span>
  {court.sets>0?<span className={skin.sbSets}>{Array.from({length:court.sets},(_,i)=><i key={i} data-on={i<tennis.sets[side]||undefined}/>)}</span>:<span/>}
  <b className={skin.sbSlat} key={tennis.score[side]}>{tennis.score[side]}</b></div>;
 return <div className={skin.scoreboard} data-tennis-scoreboard data-venue={venue.id} role="status" aria-label={tennis.tour?`${court.name}: ${tennis.tourScore} points, ${tennisMatchName(tennis)}`:`${tennisMatchName(tennis)}. You ${tennis.score.you}, ${titleCase(court.rival)} ${tennis.score.rival}. ${tennis.tourScore} points, ${tennis.tourLives} of ${balls} balls`}>
  {/* Endless play (Nov 10 2026): the match and the opponent's rank, and on a court run the balls left (a tour shows them in its strip). */}
  <div className={skin.sbMatch} data-tennis-match={tennis.match}><span>Match {tennis.match}{rank?` · ${rank}`:''}</span>{!tennis.tour&&<span className={skin.sbBalls} data-tennis-balls={tennis.tourLives}>{Array.from({length:balls},(_,i)=><i key={i} data-on={i<tennis.tourLives||undefined}/>)}</span>}</div>
  {tennis.tour?<div className={skin.sbRow} data-side="you"><span className={skin.sbName}>{court.name}</span><span/><b className={skin.sbSlat} data-wide key={tennis.tourEvents}>{tennis.tourScore}</b></div>
   :<>{row('you','You')}{row('rival',titleCase(court.rival))}</>}
  <div className={skin.sbFoot} aria-hidden="true">
   <span className={skin.sbRally} data-on={rally>=2||undefined} data-hot={rally>=10||undefined}>Rally <b>{rally>=2?rally:0}</b></span>
   {!tennis.tour&&<span className={skin.sbRun} data-tennis-run-score><b key={tennis.tourEvents}>{tennis.tourScore}</b><small>pts</small></span>}
   <span className={skin.sbWind} data-dir={wind<0?'left':'right'} data-strength={strength} data-tennis-wind><svg viewBox="0 0 26 14" aria-hidden="true"><path d="M13 1 L25 4 L13 7 Z M12 0 h1.6 v14 h-1.6 Z"/></svg>{strength?'Wind':'Calm'}</span>
  </div>
 </div>;
}
