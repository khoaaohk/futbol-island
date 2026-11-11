'use client';
import {useEffect,useState} from 'react';
import {Icon} from '../Icon';
import {PINBALL_DIVISIONS} from '@/lib/games/soccerPinball';
import {loadPinballStars,starCount} from '@/lib/games/soccerPinballTable';
import {PINBALL_TIERS,PINBALL_TIER_IDS,pinballTiersOpen,pinballTipOnly,readPinballTiers,type PinballTierProgress} from '@/lib/games/soccerPinballTiers';
import {ComicButton,comicLettering,comicNumeral} from './comic';
import styles from './PinballCard.module.css';

/* Futbol Pinball start / pause / full-time card (round 3, Oct 26 2026, docs/ARCADE_PINBALL_R3_OCT26.md). Nov 10 2026: drawn as a
 * comic page from the arcade kit (components/games/comic: ComicButton, lettering, numerals, --cm-* tokens on the game root).
 * One big Play button, the six divisions as a compact ladder (1-4, then HARD 5-6), small icon buttons for the
 * leaderboard, options (gear) and leaving. Options hold the nudge switch and the controls help. Fits a 390x844
 * phone without scrolling. Static UI: no animation loop. Prefs are per-device conveniences in localStorage. */

/** Nov 8 2026: `tier` 0 = the classic ladder, 1 Derby Night, 2 World Final (lib/games/soccerPinballTiers.ts, own boards). */
export type PinballPrefs={level:number;nudge:boolean;tier:number};
const PREFS_KEY='fi2-pinball-prefs-v1',TUTORIAL_KEY='fi2-pinball-tutorial-v1';
export function readPinballPrefs():PinballPrefs{try{const v=JSON.parse(localStorage.getItem(PREFS_KEY)||'{}');return{level:Number.isFinite(v.level)?Math.max(1,Math.min(6,Math.floor(v.level))):1,nudge:v.nudge!==false,tier:v.tier===1||v.tier===2?v.tier:0};}catch{return{level:1,nudge:true,tier:0};}}
/** The tier the card has picked (for the leaderboard button and the board session), 0 when none or locked. */
export function selectedPinballTier(unlocked:number,stars:readonly number[]){const p=readPinballPrefs(),open=pinballTiersOpen(pinballLadderTop(unlocked,stars),readPinballTiers());return p.tier===2&&open.final?2:p.tier===1&&open.derby?1:0;}
export function savePinballPrefs(p:PinballPrefs){try{localStorage.setItem(PREFS_KEY,JSON.stringify(p));}catch{}}
export function pinballTutorialSeen(){try{return localStorage.getItem(TUTORIAL_KEY)==='1';}catch{return true;}}
export function markPinballTutorialSeen(){try{localStorage.setItem(TUTORIAL_KEY,'1');}catch{}}
/** Highest division a player may start in: the saved record, or the hard tier once Complete Forward has its goals star. */
export function pinballLadderTop(unlocked:number,stars:readonly number[]){return Math.max(1,Math.min(6,Math.max(unlocked,stars[3]&1?5:0,stars[4]&1?6:0)));}
/** New players (no real score yet) get the longer ball save in the first two divisions. */
export const pinballBeginner=(best:number)=>best<4000;

const Stars=({n}:{n:number})=><i className={styles.stars} aria-hidden="true">{'★'.repeat(n)}<b>{'★'.repeat(3-n)}</b></i>;
const Lock=()=><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round"/></svg>;

type Props={phase:'ready'|'paused'|'over';score:string;detail:string;takeaway?:string;ended?:string;fresh?:boolean;best:number;unlocked:number;pending:boolean;status?:string;help:string;
 onPlay:(prefs:PinballPrefs)=>void;onBoards:()=>void;onExit:()=>void};
export function PinballCard({phase,score,detail,takeaway,ended,fresh,best,unlocked,pending,status,help,onPlay,onBoards,onExit}:Props){
 const [stars,setStars]=useState<number[]>([0,0,0,0,0,0]),[prefs,setPrefs]=useState<PinballPrefs>({level:1,nudge:true,tier:0}),[options,setOptions]=useState(false),[tiers,setTiers]=useState<PinballTierProgress>({derby:{best:0,goals:0},final:{best:0,goals:0}});
 // localStorage after mount (server and first client render match); re-read at full time for the new stars.
 useEffect(()=>{setStars(loadPinballStars());setPrefs(readPinballPrefs());setTiers(readPinballTiers());},[phase]);
 const top=pinballLadderTop(unlocked,stars),level=Math.min(prefs.level,top),division=PINBALL_DIVISIONS[level-1];
 const open=pinballTiersOpen(top,tiers),tierId=prefs.tier===2&&open.final?'final':prefs.tier===1&&open.derby?'derby':null,tier=tierId?PINBALL_TIERS[tierId]:null;
 const pick=(n:number)=>{if(n>top)return;const next={...prefs,level:n,tier:0};setPrefs(next);savePinballPrefs(next);};
 const pickTier=(n:1|2)=>{if(!(n===1?open.derby:open.final))return;const next={...prefs,tier:prefs.tier===n?0:n};setPrefs(next);savePinballPrefs(next);};
 const setNudge=(nudge:boolean)=>{const next={...prefs,nudge};setPrefs(next);savePinballPrefs(next);};
 const paused=phase==='paused',over=phase==='over';
 return <section className={styles.card} data-pinball-card={phase} data-hard={!tier&&division.hard||undefined} data-tier={tier?.tier} aria-label="Futbol Pinball">
  <header className={styles.top}>
   <span className={styles.badge} data-fresh={over&&fresh||undefined}>{paused?'TIME OUT':over?(fresh?'NEW BEST!':'FULL TIME'):tier?tier.short:'FUTBOL PINBALL'}</span>
   {over?<><strong className={`${styles.score} ${comicNumeral}`} data-pinball-final data-fresh={fresh||undefined}>{score}</strong>{ended&&<p className={styles.line} data-pinball-ended>{ended}</p>}<p className={ended?styles.sub:styles.line}>{detail}</p>{takeaway&&<p className={styles.tip} data-pinball-takeaway>{ended?pinballTipOnly(takeaway):takeaway}</p>}</>
    :paused?<h3 className={`${styles.title} ${comicLettering}`}>Paused</h3>
    :<><h3 className={`${styles.title} ${comicLettering}`}>{tier?tier.name:division.name}</h3><p className={styles.line}>{tier?tier.objective:division.objective}</p></>}
  </header>
  {!paused&&<div className={styles.ladder} role="radiogroup" aria-label="Start division">
   {PINBALL_DIVISIONS.map((d,i)=>{const n=i+1,locked=n>top,on=n===level;
    return <button key={d.name} type="button" role="radio" aria-checked={on} aria-label={`Division ${n}: ${d.name}${d.hard?', hard':''}${locked?', locked':''}`} disabled={locked} data-on={on||undefined} data-hard={d.hard||undefined} data-division={n} onClick={()=>pick(n)}>
     {locked?<Lock/>:<em>{n}</em>}<Stars n={starCount(stars[i]??0)}/>
    </button>;})}
   <span className={styles.hardTag} aria-hidden="true">HARD</span>
  </div>}
  {!paused&&<div className={styles.tiers} role="group" aria-label="Elite tiers">
   {PINBALL_TIER_IDS.map(id=>{const t=PINBALL_TIERS[id],locked=!(id==='derby'?open.derby:open.final),on=tier?.id===id,b=tiers[id].best;
    return <button key={id} type="button" aria-pressed={on} disabled={locked} data-on={on||undefined} data-pinball-tier={t.tier} aria-label={`${t.name}: ${t.rules.join(', ')}${locked?`. Locked: ${t.unlock}`:''}`} onClick={()=>pickTier(t.tier)}>
     <strong>{locked&&<Lock/>}{t.name}</strong><span>{locked?t.unlock:b>0?`Best ${b.toLocaleString('en-US')}`:`Points ×${t.mult}`}</span>
    </button>;})}
  </div>}
  <ComicButton variant="primary" wide className={styles.play} data-pinball-play disabled={pending} onClick={()=>onPlay({...prefs,level,tier:tier?.tier??0})}><Icon name="play" size={26}/>{paused?'Resume':over?'Play again':'Play'}</ComicButton>
  <div className={styles.row}>
   {!paused&&<button type="button" aria-label="Leaderboard" onClick={onBoards}><Icon name="chart" size={22}/></button>}
   <button type="button" aria-label="Options" aria-expanded={options} data-pinball-options onClick={()=>setOptions(v=>!v)}><Icon name="settings" size={22}/></button>
   <button type="button" aria-label="Back to arcade" onClick={onExit}><Icon name="back" size={22}/></button>
  </div>
  {options&&<div className={styles.options} data-pinball-options-panel>
   <label><input type="checkbox" checked={prefs.nudge} onChange={e=>setNudge(e.target.checked)}/> Nudge button</label>
   <small>{help}</small>
  </div>}
  <p className={styles.foot}>{status??(paused?'':`Free to play${tier?(tiers[tier.id].best>0?` · Best ${tiers[tier.id].best.toLocaleString('en-US')}`:''):best>0?` · Best ${best.toLocaleString('en-US')}`:''}`)}</p>
 </section>;
}
