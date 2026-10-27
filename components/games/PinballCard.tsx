'use client';
import {useEffect,useState} from 'react';
import {Icon} from '../Icon';
import {PINBALL_DIVISIONS} from '@/lib/games/soccerPinball';
import {loadPinballStars,starCount} from '@/lib/games/soccerPinballTable';
import styles from './PinballCard.module.css';

/* Futbol Pinball start / pause / full-time card (round 3, Oct 26 2026, docs/ARCADE_PINBALL_R3_OCT26.md).
 * One big Play button, the six divisions as a compact ladder (1-4, then HARD 5-6), small icon buttons for the
 * leaderboard, options (gear) and leaving. Options hold the nudge switch and the controls help. Fits a 390x844
 * phone without scrolling. Static UI: no animation loop. Prefs are per-device conveniences in localStorage. */

export type PinballPrefs={level:number;nudge:boolean};
const PREFS_KEY='fi2-pinball-prefs-v1',TUTORIAL_KEY='fi2-pinball-tutorial-v1';
export function readPinballPrefs():PinballPrefs{try{const v=JSON.parse(localStorage.getItem(PREFS_KEY)||'{}');return{level:Number.isFinite(v.level)?Math.max(1,Math.min(6,Math.floor(v.level))):1,nudge:v.nudge!==false};}catch{return{level:1,nudge:true};}}
export function savePinballPrefs(p:PinballPrefs){try{localStorage.setItem(PREFS_KEY,JSON.stringify(p));}catch{}}
export function pinballTutorialSeen(){try{return localStorage.getItem(TUTORIAL_KEY)==='1';}catch{return true;}}
export function markPinballTutorialSeen(){try{localStorage.setItem(TUTORIAL_KEY,'1');}catch{}}
/** Highest division a player may start in: the saved record, or the hard tier once Complete Forward has its goals star. */
export function pinballLadderTop(unlocked:number,stars:readonly number[]){return Math.max(1,Math.min(6,Math.max(unlocked,stars[3]&1?5:0,stars[4]&1?6:0)));}
/** New players (no real score yet) get the longer ball save in the first two divisions. */
export const pinballBeginner=(best:number)=>best<4000;

const Stars=({n}:{n:number})=><i className={styles.stars} aria-hidden="true">{'★'.repeat(n)}<b>{'★'.repeat(3-n)}</b></i>;
const Lock=()=><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round"/></svg>;

type Props={phase:'ready'|'paused'|'over';score:string;detail:string;takeaway?:string;best:number;unlocked:number;pending:boolean;status?:string;help:string;
 onPlay:(prefs:PinballPrefs)=>void;onBoards:()=>void;onExit:()=>void};
export function PinballCard({phase,score,detail,takeaway,best,unlocked,pending,status,help,onPlay,onBoards,onExit}:Props){
 const [stars,setStars]=useState<number[]>([0,0,0,0,0,0]),[prefs,setPrefs]=useState<PinballPrefs>({level:1,nudge:true}),[options,setOptions]=useState(false);
 // localStorage after mount (server and first client render match); re-read at full time for the new stars.
 useEffect(()=>{setStars(loadPinballStars());setPrefs(readPinballPrefs());},[phase]);
 const top=pinballLadderTop(unlocked,stars),level=Math.min(prefs.level,top),division=PINBALL_DIVISIONS[level-1];
 const pick=(n:number)=>{if(n>top)return;const next={...prefs,level:n};setPrefs(next);savePinballPrefs(next);};
 const setNudge=(nudge:boolean)=>{const next={...prefs,nudge};setPrefs(next);savePinballPrefs(next);};
 const paused=phase==='paused',over=phase==='over';
 return <section className={styles.card} data-pinball-card={phase} data-hard={division.hard||undefined} aria-label="Futbol Pinball">
  <header className={styles.top}>
   <span className={styles.badge}>{paused?'TIME OUT':over?'FULL TIME':'FUTBOL PINBALL'}</span>
   {over?<><strong className={styles.score} data-pinball-final>{score}</strong><p className={styles.line}>{detail}</p>{takeaway&&<p className={styles.tip} data-pinball-takeaway>{takeaway}</p>}</>
    :paused?<h3 className={styles.title}>Paused</h3>
    :<><h3 className={styles.title}>{division.name}</h3><p className={styles.line}>{division.objective}</p></>}
  </header>
  {!paused&&<div className={styles.ladder} role="radiogroup" aria-label="Start division">
   {PINBALL_DIVISIONS.map((d,i)=>{const n=i+1,locked=n>top,on=n===level;
    return <button key={d.name} type="button" role="radio" aria-checked={on} aria-label={`Division ${n}: ${d.name}${d.hard?', hard':''}${locked?', locked':''}`} disabled={locked} data-on={on||undefined} data-hard={d.hard||undefined} data-division={n} onClick={()=>pick(n)}>
     {locked?<Lock/>:<em>{n}</em>}<Stars n={starCount(stars[i]??0)}/>
    </button>;})}
   <span className={styles.hardTag} aria-hidden="true">HARD</span>
  </div>}
  <button className={styles.play} data-pinball-play disabled={pending} onClick={()=>onPlay({...prefs,level})}><Icon name="play" size={26}/>{paused?'Resume':over?'Play again':'Play'}</button>
  <div className={styles.row}>
   {!paused&&<button type="button" aria-label="Leaderboard" onClick={onBoards}><Icon name="chart" size={22}/></button>}
   <button type="button" aria-label="Options" aria-expanded={options} data-pinball-options onClick={()=>setOptions(v=>!v)}><Icon name="settings" size={22}/></button>
   <button type="button" aria-label="Back to arcade" onClick={onExit}><Icon name="back" size={22}/></button>
  </div>
  {options&&<div className={styles.options} data-pinball-options-panel>
   <label><input type="checkbox" checked={prefs.nudge} onChange={e=>setNudge(e.target.checked)}/> Nudge button</label>
   <small>{help}</small>
  </div>}
  <p className={styles.foot}>{status??(paused?'':`3 coins per play${best>0?` · Best ${best.toLocaleString('en-US')}`:''}`)}</p>
 </section>;
}

/** First-time hint, shown once ever over the waiting table: which half of the screen kicks which flipper (the tip
 * line above the Launch pill already says how to launch). */
export function PinballTutorial(){
 return <div className={styles.tutorial} data-pinball-tutorial aria-hidden="true">
  <span data-side="left"><b>Tap</b>left kick</span>
  <span data-side="right"><b>Tap</b>right kick</span>
 </div>;
}
