'use client';
import {useEffect,useRef,useState} from 'react';
import type {RunnerGame} from '@/lib/arcade/runnerGame';
import {RUNNER_MODES,RUNNER_MODE_ORDER,defaultRunnerMode,isRunnerModeOpen,readRunnerRoutes,recordRunnerStars,readRunnerDaily,rememberRunnerMode,runnerKeepsOwnBest,runnerModeLockHint,runnerTierBest,selectRunnerMode,selectedRunnerMode,type RunnerModeId} from '@/lib/arcade/runnerModes';
import {runnerFinishLine,runnerLessonTakeaway,runnerLossLine} from '@/lib/arcade/runnerHud';
import {RunnerMissionCard} from './RunnerMissionCard';
import styles from './RunnerMenu.module.css';
import {takeTodayLaunch} from '@/lib/arcade/arcadeToday';
/** Nov 10 2026: a "Today in the arcade" row opens the menu on the Daily Run (when it is open), once per tap. */
const todayRun=(recordStage:number)=>{const ok=takeTodayLaunch('runner')&&isRunnerModeOpen('daily',recordStage);if(ok)rememberRunnerMode('daily');return ok;};

type Phase='ready'|'playing'|'paused'|'over';
const HINT_KEY='fi2-runner-hint-v1';
const starRow=(n:number)=>'★'.repeat(n)+'☆'.repeat(3-n);

/**
 * Breakaway Run start / full-time card. Simplified Nov 8 2026 (owner: "a simplified UI"):
 *  - Start: pick a route (six: Warm-up … Legend, stars and locks), one line about it, one big Play. Two small buttons: Missions, Scores.
 *    Keyboard players see one line of keys; touch players need none (every pad button is labelled). Enter also plays.
 *  - Full time: the score (and a NEW BEST pill), the route's stars, ONE line on why the run ended (the tackle's own tip) or how
 *    the route went, one takeaway. One primary Retry (Enter / R too) and a secondary Back (to the routes); Scores beside it.
 *  The arcade bar keeps its own Arcade button, so the card no longer repeats it. Nothing scrolls on a 390 px phone.
 */
export function RunnerMenu({phase,score,detail,nextLabel,state,best,recordStage,pending,message,touch,onStart,onPreview,onBoards,onRoutes,onExit}:{
 phase:Phase;score:string;detail:string;nextLabel?:string;state?:RunnerGame;best:number;recordStage:number;pending:boolean;message?:string;touch:boolean;
 onStart:()=>void;onPreview:()=>void;onBoards:()=>void;onRoutes?:()=>void;onExit:()=>void}){
 const [mode,setMode]=useState<RunnerModeId>(()=>selectedRunnerMode().id);
 const [panel,setPanel]=useState<''|'missions'>('');
 const [hint,setHint]=useState(false);
 const [result,setResult]=useState<{flags:[boolean,boolean,boolean];count:number;gained:number}|null>(null);
 const [,bump]=useState(0);
 const recorded=useRef(-1);
 // First open: the saved route (first-timers start on the Warm-up), applied to the waiting game so the scene matches.
 // The menu remounts at full time (the overlay is hidden while playing): only the ready screen may apply the default and
 // reset the waiting game, or a finished run's goals and metres are wiped before the card reads them (QA Nov 8 2026).
 useEffect(()=>{if(phase!=='ready'){setMode(selectedRunnerMode().id);}else{const id=defaultRunnerMode(best>0||recordStage>1,todayRun(recordStage));if(id!==selectedRunnerMode().id){selectRunnerMode(id);onPreview();}else selectRunnerMode(id);setMode(id);}
  try{if(!localStorage.getItem(HINT_KEY))setHint(true);}catch{/* storage optional */}
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);
 // Full time: stars for this route are saved once per run.
 useEffect(()=>{if(phase!=='over'||!state||recorded.current===state.runId)return;recorded.current=state.runId;
  const r=recordRunnerStars(state);setResult({flags:r.flags,count:r.count,gained:r.gained});bump(n=>n+1);},[phase,state]);
 useEffect(()=>{if(phase==='ready'){setResult(null);setPanel('');}},[phase]);
 const pick=(id:RunnerModeId)=>{if(!isRunnerModeOpen(id,recordStage)||id===mode)return;selectRunnerMode(id);rememberRunnerMode(id);setMode(id);onPreview();};
 const play=()=>{if(pending)return;if(hint){try{localStorage.setItem(HINT_KEY,'1');}catch{/* storage optional */}setHint(false);}selectRunnerMode(mode);onStart();};
 // Quick retry (Nov 8 2026): Enter (or R at full time) starts the next run without reaching for the mouse.
 const playRef=useRef(play);playRef.current=play;
 useEffect(()=>{if(phase!=='ready'&&phase!=='over')return;
  const key=(e:KeyboardEvent)=>{// A focused button handles its own Enter; an open dialog (high-score letters, boards) owns the keys.
   if(e.repeat||e.target instanceof HTMLElement&&e.target.closest('button,a,input,textarea,select,dialog,[role=dialog]')||document.querySelector('dialog[open],[role=dialog]'))return;
   if(e.code==='Enter'||phase==='over'&&e.code==='KeyR'){e.preventDefault();playRef.current();}};
  window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[phase]);
 const stars=readRunnerRoutes().stars,m=RUNNER_MODES[mode];
 const over=phase==='over',paused=phase==='paused',elite=runnerKeepsOwnBest(mode),daily=mode==='daily';
 // Daily Run (Nov 10 2026): the day's first finished run posts to today's board; later runs that day are practice.
 const today=daily?readRunnerDaily(over&&state?.day?state.day:undefined):null;
 // Header matches the outcome (QA Nov 8 2026): a completed route is full time with the trophy; a tackle-out is not.
 const completed=over&&!!state&&(state.finished||state.won);
 // Elite tiers race their own best (their scores never touch the classic record).
 const shownBest=elite?runnerTierBest(mode):best;
 const why=over&&state?(runnerLossLine(state)||runnerFinishLine(state)):'';
 const takeaway=over&&state?(state.bestPerfectChain>1?`Best perfect-dodge chain: ×${1+Math.min(4,state.bestPerfectChain)}`:runnerLessonTakeaway(state)||detail.split('\n').filter(Boolean).slice(-1)[0]||''):'';
 const stats=over&&state?`${state.goals} goal${state.goals===1?'':'s'} · ${Math.floor(state.distance)} m${state.perfectDodges?` · ${state.perfectDodges} perfect`:''}`:'';
 return <div className={styles.overlay} data-runner-menu={phase}>
  <section className={styles.card} aria-label="Breakaway Run menu" data-elite={elite||undefined}>
   <div className={styles.top}>
    <span className={styles.badge} data-runner-outcome={over?(completed?'finished':'tackled'):undefined}>{paused?'PAUSED':over?(completed?'FULL TIME!':state&&state.lives<=0?'TACKLED!':'RUN OVER'):'BREAKAWAY RUN'}</span>
    {!paused&&shownBest>0&&<span className={styles.best} title={`Personal best${elite?` on ${m.name}`:''}`}>Best {shownBest}</span>}
   </div>
   {over?<div className={styles.result}>
     <strong className={styles.score} data-new-best={state?.newBest||undefined}>{score}</strong>
     {state?.newBest&&<span className={styles.newBest} role="status">New best!</span>}
     {result&&<p className={styles.stars} aria-label={`${result.count} of 3 stars`}>{result.flags.map((f,i)=><span key={i} data-on={f||undefined}>{f?'★':'☆'}</span>)}{result.gained>0&&<em>+{result.gained} new!</em>}</p>}
     <p className={styles.line}>{stats}</p>
     {why&&<p className={styles.why} data-runner-why>{why}</p>}
     {takeaway&&<p className={styles.line}>{takeaway}</p>}
     {daily&&today&&<p className={styles.line} data-runner-daily-result>{today.runs<=1?'Today’s board run!':'Practice run. Your first run today counts.'}</p>}
    </div>
   :paused?<h3 className={styles.title}>Ready when you are</h3>
   :<h3 className={styles.title}>Dribble, dodge, score!</h3>}
   {phase==='ready'&&<div className={styles.routes} role="radiogroup" aria-label="Choose a route">
    {[...RUNNER_MODE_ORDER,'daily' as const].map(id=>{const r=RUNNER_MODES[id],open=isRunnerModeOpen(id,recordStage);
     return <button key={id} role="radio" aria-checked={id===mode} data-route={id} data-hard={r.hard||undefined} data-elite={r.ownBest&&id!=='daily'||undefined} data-daily={id==='daily'||undefined} disabled={!open} className={styles.route} onClick={()=>pick(id)}
      aria-label={`${r.name}${r.hard?` (${r.short.toLowerCase()})`:''}: ${open?r.line:runnerModeLockHint(id)}`}>
      <span className={styles.icon} aria-hidden="true">{open?r.icon:'🔒'}</span>
      <span className={styles.name}>{r.name}</span>
      <span className={styles.sub}>{open&&id==='daily'?'Same course for everyone today':open?<><i aria-hidden="true">{starRow(stars[id]??0)}</i>{r.hard&&<b>{r.short.toUpperCase()}</b>}</>:runnerModeLockHint(id)}</span>
     </button>;})}
   </div>}
   {phase==='ready'&&<p className={styles.lineMode} data-runner-line>{m.line}{m.finish?` · ${m.finish} m rounds, endless`:''}{daily?(today?.counted?' · Practice':' · First run counts'):elite?' · own scoreboard':''}</p>}
   {hint&&phase==='ready'&&touch&&<p className={styles.hint}>Swipe left or right (or push the stick) to change lane. Big yellow button = shoot!</p>}
   {message&&<p className={styles.status} role="status">{message}</p>}
   <button className={styles.play} disabled={pending} onClick={play} data-runner-play>{paused?'Resume':over?(nextLabel&&nextLabel!=='Play again'?nextLabel:'Retry'):'Play'}</button>
   {!paused&&<div className={styles.row}>
    {over&&onRoutes?<button key="back" className={styles.small} onClick={onRoutes} data-runner-back aria-label="Back to routes"><small>Back</small></button>
     :<button key="missions" className={styles.small} aria-expanded={panel==='missions'} onClick={()=>setPanel(p=>p==='missions'?'':'missions')}><small>Missions</small></button>}
    <button className={styles.small} onClick={onBoards}><small>Scores</small></button>
    {!onRoutes&&over&&<button className={styles.small} onClick={onExit}><small>Arcade</small></button>}
   </div>}
   {panel==='missions'&&phase==='ready'&&<RunnerMissionCard state={state} phase={phase}/>}
   {!touch&&!panel&&<p className={styles.keys}>← → lane · ↑ jump · ↓ slide · Space shoot · E skill · Enter {over?'retry':'play'}</p>}
   {phase==='ready'&&!panel&&<p className={styles.coins}>Free to play</p>}
  </section>
 </div>;
}
