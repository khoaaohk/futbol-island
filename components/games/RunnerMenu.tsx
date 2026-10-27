'use client';
import {useEffect,useRef,useState} from 'react';
import type {RunnerGame} from '@/lib/arcade/runnerGame';
import {RUNNER_MODES,RUNNER_MODE_ORDER,defaultRunnerMode,isRunnerModeOpen,readRunnerRoutes,recordRunnerStars,rememberRunnerMode,runnerModeLockHint,selectRunnerMode,selectedRunnerMode,type RunnerModeId} from '@/lib/arcade/runnerModes';
import {RunnerMissionCard} from './RunnerMissionCard';
import styles from './RunnerMenu.module.css';

type Phase='ready'|'playing'|'paused'|'over';
const HINT_KEY='fi2-runner-hint-v1';
const starRow=(n:number)=>'★'.repeat(n)+'☆'.repeat(3-n);

/**
 * Breakaway Run start / pause / full-time card (round 3): one big Play button, a 2×2 route picker (Warm-up,
 * Breakaway, Night Derby, Storm Final) with stars and locks, and small icon buttons for missions, help,
 * leaderboard and back. Missions and help open in place (one at a time), so nothing scrolls on a 390×844 phone.
 */
export function RunnerMenu({phase,score,detail,nextLabel,state,best,recordStage,pending,message,touch,onStart,onPreview,onBoards,onExit}:{
 phase:Phase;score:string;detail:string;nextLabel?:string;state?:RunnerGame;best:number;recordStage:number;pending:boolean;message?:string;touch:boolean;
 onStart:()=>void;onPreview:()=>void;onBoards:()=>void;onExit:()=>void}){
 const [mode,setMode]=useState<RunnerModeId>(()=>selectedRunnerMode().id);
 const [panel,setPanel]=useState<''|'missions'|'help'>('');
 const [hint,setHint]=useState(false);
 const [result,setResult]=useState<{flags:[boolean,boolean,boolean];count:number;gained:number}|null>(null);
 const [,bump]=useState(0);
 const recorded=useRef(-1);
 // First open: the saved route (first-timers start on the Warm-up), applied to the waiting game so the scene matches.
 useEffect(()=>{const id=defaultRunnerMode(best>0||recordStage>1);if(id!==selectedRunnerMode().id){selectRunnerMode(id);onPreview();}else selectRunnerMode(id);setMode(id);
  try{if(!localStorage.getItem(HINT_KEY))setHint(true);}catch{/* storage optional */}
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);
 // Full time: stars for this route are saved once per run.
 useEffect(()=>{if(phase!=='over'||!state||recorded.current===state.runId)return;recorded.current=state.runId;
  const r=recordRunnerStars(state);setResult({flags:r.flags,count:r.count,gained:r.gained});bump(n=>n+1);},[phase,state]);
 useEffect(()=>{if(phase==='ready')setResult(null);},[phase]);
 const pick=(id:RunnerModeId)=>{if(!isRunnerModeOpen(id,recordStage)||id===mode)return;selectRunnerMode(id);rememberRunnerMode(id);setMode(id);onPreview();};
 const play=()=>{if(hint){try{localStorage.setItem(HINT_KEY,'1');}catch{/* storage optional */}setHint(false);}selectRunnerMode(mode);onStart();};
 const stars=readRunnerRoutes().stars,m=RUNNER_MODES[mode];
 const lines=phase==='over'?detail.split('\n').filter(Boolean).slice(0,3):[];
 const paused=phase==='paused';
 return <div className={styles.overlay} data-runner-menu={phase}>
  <section className={styles.card} aria-label="Breakaway Run menu">
   <div className={styles.top}>
    <span className={styles.badge}>{paused?'PAUSED':phase==='over'?'FULL TIME':'BREAKAWAY RUN'}</span>
    {!paused&&best>0&&<span className={styles.best} title="Personal best">🏆 {best}</span>}
   </div>
   {phase==='over'?<div className={styles.result}>
     <strong className={styles.score}>{score}</strong>
     {result&&<p className={styles.stars} aria-label={`${result.count} of 3 stars`}>{result.flags.map((f,i)=><span key={i} data-on={f||undefined}>{f?'★':'☆'}</span>)}{result.gained>0&&<em>+{result.gained} new!</em>}</p>}
     {lines.map(l=><p key={l} className={styles.line}>{l}</p>)}
    </div>
   :paused?<h3 className={styles.title}>Ready when you are</h3>
   :<h3 className={styles.title}>Dribble, dodge, score!</h3>}
   {!paused&&<div className={styles.routes} role="radiogroup" aria-label="Choose a route">
    {RUNNER_MODE_ORDER.map(id=>{const r=RUNNER_MODES[id],open=isRunnerModeOpen(id,recordStage);
     return <button key={id} role="radio" aria-checked={id===mode} data-route={id} data-hard={r.hard||undefined} disabled={!open} className={styles.route} onClick={()=>pick(id)}
      aria-label={`${r.name}${r.hard?' (hard)':''}: ${open?r.line:runnerModeLockHint(id)}`}>
      <span className={styles.icon} aria-hidden="true">{open?r.icon:'🔒'}</span>
      <span className={styles.name}>{r.name}</span>
      <span className={styles.sub}>{open?<><i aria-hidden="true">{starRow(stars[id])}</i>{r.hard&&<b>{r.short.toUpperCase()}</b>}</>:runnerModeLockHint(id)}</span>
     </button>;})}
   </div>}
   {!paused&&<p className={styles.lineMode}>{m.line}{m.finish?` · ${m.finish} m`:''}</p>}
   {hint&&phase==='ready'&&<p className={styles.hint}>👆 Swipe or tap the arrows to change lane. Big pink button = shoot!</p>}
   {message&&<p className={styles.status} role="status">{message}</p>}
   <button className={styles.play} disabled={pending} onClick={play} data-runner-play>{paused?'▶ Resume':phase==='over'?`▶ ${nextLabel??'Play again'}`:'▶ Play'}</button>
   <div className={styles.row}>
    {!paused&&<button className={styles.small} aria-expanded={panel==='missions'} onClick={()=>setPanel(p=>p==='missions'?'':'missions')} aria-label="Missions"><span aria-hidden="true">⭐</span><small>Missions</small></button>}
    <button className={styles.small} aria-expanded={panel==='help'} onClick={()=>setPanel(p=>p==='help'?'':'help')} aria-label="How to play"><span aria-hidden="true">?</span><small>Help</small></button>
    {!paused&&<button className={styles.small} onClick={onBoards} aria-label="Leaderboard"><span aria-hidden="true">🏅</span><small>Scores</small></button>}
    <button className={styles.small} onClick={onExit} aria-label="Back to arcade"><span aria-hidden="true">⟵</span><small>Arcade</small></button>
   </div>
   {panel==='missions'&&<RunnerMissionCard state={state} phase={phase}/>}
   {panel==='help'&&<ul className={styles.help}>
    {touch?<><li>⬅ ➡ or swipe: change lane</li><li>⤒ Jump · ⤓ Slide (swipe up / down)</li><li>⚽ Tap to shoot · hold for a power blast</li><li>Skill names the trick that beats the defender</li></>
     :<><li>A / D or ← →: change lane</li><li>W / ↑ jump · S / ↓ slide</li><li>Space: hold and let go to shoot</li><li>E: skill move</li></>}
   </ul>}
   {!paused&&!panel&&<p className={styles.coins}>3 coins per play</p>}
  </section>
 </div>;
}
