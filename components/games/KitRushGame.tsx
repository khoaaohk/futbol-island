'use client';
/**
 * Kit Rush (Nov 10 2026, docs/arcade-aaa/kitrush-direction.md): the upright swipe cabinet that took Island Strikers' place in the
 * arcade. Rules: lib/arcade/kitrush/core.ts (pure, seeded). Drawing: view.ts (2D canvas, static scene + moving layer).
 * Sound: audio.ts. This shell owns the loop, the pointers, the HUD and the cards.
 * Heat: the rAF loop runs ONLY while phase === 'playing' (start card, pause, results and a hidden tab draw nothing); 60 fps cap;
 * DPR cap 2, dropped to 1.5 when frames run long; the HUD re-renders only when score, lives, kit or an effect flag changes.
 * Teaches (AGENTS.md): know your team at a glance (colour and pattern), scan before you act, react to a switch.
 */
import {useCallback,useEffect,useRef,useState,type CSSProperties} from 'react';
import dynamic from 'next/dynamic';
import {ArcadeTopBar} from '../arcade/ArcadeTopBar';
import {ArcadePauseCard} from '../arcade/ArcadePauseCard';
import {arcadeSkin} from './skins';
import {comicRoot,comicNumeral,ComicButton,ComicCard,ComicPanel,ComicStat,ComicBurst} from './comic';
import styles from './KitRushGame.module.css';
import {createKitRush,kitRushDailySeed,kitRushFieldH,medalFor,KR,KIND,TEAMS,MEDAL_NAMES,type KitRush,type KitEvent,type KitStats} from '@/lib/arcade/kitrush/core';
import {createKitRushView,type KitRushView} from '@/lib/arcade/kitrush/view';
import {createKitRushAudio,type KitRushAudio} from '@/lib/arcade/kitrush/audio';
import {readKitRushSave,writeKitRushSave,settleKitRush,nearMissLine,coachLine,liveStreak,emptyKitRushSave,type KitRushSave,type KitRushSettled} from '@/lib/arcade/kitrush/save';
import {arcadeFeedback} from '@/lib/arcade/arcadeFeedback';
import {useArcadeEntry} from '@/lib/arcade/useArcadeEntry';
import {creditRun,arcadeCoinTarget} from '@/lib/arcade/arcadeWallet';
import {saveArcadeRecord} from '@/lib/arcade/arcadeRecords';
import {beginBoardSession} from '@/lib/arcade/boardClient';
import {noteArcadeToday,takeTodayLaunch} from '@/lib/arcade/arcadeToday';
import {localPlayDay} from '@/lib/town/dailyPlay';
import {frameCapSlot} from '@/lib/town/frameCap';
import type {BoardGame} from '@/lib/arcade/leaderboard';
const HighScoreEntry=dynamic(()=>import('../arcade/HighScoreEntry'),{ssr:false});
const KitRushScores=dynamic(()=>import('./KitRushScores'),{ssr:false});

type Phase='menu'|'playing'|'paused'|'over';
type Hud={score:number;lives:number;team:number;fx:''|'frenzy'|'slow'|'armband'};
type Result={score:number;daily:boolean;stats:KitStats;settled:KitRushSettled;near:string;coach:string;coins:number};
export const KITRUSH_COIN_REASON='Kit Rush: kit struck clean';
const FRAME_MS=1000/60;

/** A kit shirt as a small inline drawing (the same four colour + pattern kits the canvas draws). */
function KitShirt({team,size=34,crossed}:{team:number;size?:number;crossed?:boolean}){
 const t=TEAMS[team],id=`kr-clip-${team}-${size}`,d='M9 2 Q16 8 23 2 L31 7 L28 15 L24 12 L24 30 L8 30 L8 12 L4 15 L1 7 Z';
 return <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className={styles.shirt}>
  <clipPath id={id}><path d={d}/></clipPath><path d={d} fill={t.color}/>
  <g clipPath={`url(#${id})`} fill={t.dark}>{t.pattern==='hoops'&&<><rect x="0" y="8" width="32" height="4"/><rect x="0" y="16" width="32" height="4"/><rect x="0" y="24" width="32" height="4"/></>}
   {t.pattern==='stripes'&&<><rect x="10" y="0" width="3.6" height="32"/><rect x="18.4" y="0" width="3.6" height="32"/></>}
   {t.pattern==='sash'&&<path d="M-2 26 L26 -2 L32 2 L4 32 Z"/>}</g>
  <path d={d} fill="none" stroke="#231a2e" strokeWidth="2.4" strokeLinejoin="round"/>
  {crossed&&<path d="M4 4 L28 28 M28 4 L4 28" stroke="#f0452e" strokeWidth="4" strokeLinecap="round"/>}
 </svg>;
}
function WhistleIcon({size=34}:{size?:number}){
 return <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className={styles.shirt}>
  <polygon points="16,0 19,6 25,3 25,9 31,10 27,15 32,20 26,22 27,28 21,27 18,32 14,27 8,30 8,24 1,23 5,18 0,13 6,11 5,5 11,6" fill="#f0452e" stroke="#231a2e" strokeWidth="1.6" strokeLinejoin="round"/>
  <rect x="14" y="10" width="11" height="5" fill="#fff3d6" stroke="#231a2e" strokeWidth="1.6"/><circle cx="13" cy="17" r="6" fill="#fff3d6" stroke="#231a2e" strokeWidth="1.6"/><circle cx="13" cy="17" r="2" fill="#231a2e"/>
 </svg>;
}
function Medal({level,on}:{level:number;on:boolean}){return <span className={styles.medal} data-level={level} data-on={on||undefined} aria-hidden="true"><i/></span>;}

export default function KitRushGame({onExit}:{onExit:()=>void}){
 const [phase,setPhase]=useState<Phase>('menu'),phaseRef=useRef<Phase>('menu');
 const [hud,setHud]=useState<Hud>({score:0,lives:KR.lives,team:0,fx:''}),hudRef=useRef(hud);
 const [save,setSave]=useState<KitRushSave>(emptyKitRushSave),[result,setResult]=useState<Result|null>(null),[today,setToday]=useState('');
 const [board,setBoard]=useState<{game:BoardGame;score:number}|null>(null),[scores,setScores]=useState(false),[dailyFirst,setDailyFirst]=useState(false);
 const entry=useArcadeEntry('kitrush');
 const stage=useRef<HTMLDivElement>(null),bg=useRef<HTMLCanvasElement>(null),fg=useRef<HTMLCanvasElement>(null);
 const game=useRef<KitRush|null>(null),view=useRef<KitRushView|null>(null),audio=useRef<KitRushAudio|null>(null);
 const raf=useRef(0),last=useRef(0),slot=useRef(0),endAt=useRef(0),run=useRef({id:'',daily:false,day:'',done:true,board:'kitrush' as BoardGame});
 const size=useRef({w:1,h:1,dpr:1,left:0,top:0}),perf=useRef({frames:0,sum:0,max:0,window:0,windowSum:0,dropped:false});
 const reduced=useRef(false);

 const change=useCallback((p:Phase)=>{phaseRef.current=p;setPhase(p);},[]);
 useEffect(()=>{const s=readKitRushSave();setSave(s);setToday(localPlayDay(Date.now()));setDailyFirst(takeTodayLaunch('kitrush'));},[]);

 /* ---- the round's end: save, coins, today, board (once per run) ---- */
 const finish=useCallback(()=>{
  const g=game.current,r=run.current;if(!g||r.done)return;r.done=true;const s=g.state,score=Math.floor(s.score),stats={...s.stats};
  const settled=settleKitRush(readKitRushSave(),{score,daily:r.daily,day:r.day,stats});writeKitRushSave(settled.save);setSave(settled.save);
  if(!r.daily)saveArcadeRecord('kitrush',score);
  const coins=arcadeCoinTarget('kitrush',{points:score});if(coins>0)void creditRun(r.id,'kitrush',coins,KITRUSH_COIN_REASON);
  void noteArcadeToday({kind:'kitrush',daily:r.daily,day:r.day,score,bestCombo:stats.bestCombo,clean:stats.bestClean});
  setResult({score,daily:r.daily,stats,settled,coins,near:nearMissLine({score,best:settled.previousBest,newBest:settled.newBest,stats,daily:r.daily}),coach:coachLine(stats)});
  if(score>0&&(!r.daily||settled.dailyFirst))setBoard({game:r.board,score});
  if(settled.newMedal||settled.newBest){audio.current?.medal(Math.max(1,settled.medal));arcadeFeedback(null,'goal');}
  view.current?.clear();change('over');
 },[change]);

 /* ---- one rules event: picture, sound, haptics ---- */
 const onEvent=useCallback((e:KitEvent)=>{
  const g=game.current,a=audio.current;if(!g)return;view.current?.onEvent(e,g.state);
  switch(e.type){
   case 'toss':a?.toss(e.x);break;
   case 'slice':a?.slice(e.b,e.d===-2||e.c===KIND.golden);arcadeFeedback(null,e.b>=3?'perfect':'combo');break;
   case 'call':a?.call(e.a);if(e.a>=3)arcadeFeedback(null,'perfect');break;
   case 'foul':if(e.a)a?.whistle();else a?.rival();arcadeFeedback(null,'slam');break;
   case 'switch':a?.switchTeam();arcadeFeedback(null,'level');break;
   case 'ready':a?.ready();break;
   case 'special':a?.special(e.a===KIND.golden?'golden':e.a===KIND.stopwatch?'stopwatch':'armband');arcadeFeedback(null,'skill');break;
   case 'sub':a?.sub();arcadeFeedback(null,'level');break;
   case 'miss':a?.miss();break;
   case 'effectEnd':a?.effectEnd();break;
   case 'over':a?.over();break;
  }
 },[]);

 /* ---- the loop: alive only while playing ---- */
 const frame=useCallback((now:number)=>{
  raf.current=0;const g=game.current,v=view.current;if(phaseRef.current!=='playing'||!g||!v)return;
  const next=frameCapSlot(now,slot.current,FRAME_MS);
  if(next>=0){slot.current=next;const dt=Math.min(.05,Math.max(0,(now-last.current)/1000));last.current=now;const t0=performance.now();
   g.step(dt);g.drain(onEvent);v.render(g.state,dt,now);
   const s=g.state,h=hudRef.current,fx:Hud['fx']=s.frenzy>0?'frenzy':s.slow>0?'slow':s.armband>0?'armband':'';
   if(h.score!==s.score||h.lives!==s.lives||h.team!==s.team||h.fx!==fx){const n={score:s.score,lives:s.lives,team:s.team,fx};hudRef.current=n;setHud(n);}
   const cost=performance.now()-t0,p=perf.current;p.frames++;p.sum+=cost;if(cost>p.max)p.max=cost;p.window++;p.windowSum+=cost;
   if(p.window>=90){if(!p.dropped&&p.windowSum/p.window>7&&size.current.dpr>1.5){p.dropped=true;const z=size.current;z.dpr=1.5;v.resize(z.w,z.h,1.5);}p.window=0;p.windowSum=0;}
   if(s.over){if(!endAt.current)endAt.current=now+(reduced.current?350:850);else if(now>=endAt.current){finish();return;}}
  }
  raf.current=requestAnimationFrame(frame);
 },[finish,onEvent]);
 const wake=useCallback(()=>{if(raf.current||phaseRef.current!=='playing')return;last.current=performance.now();slot.current=0;raf.current=requestAnimationFrame(frame);},[frame]);
 const sleep=useCallback(()=>{if(raf.current)cancelAnimationFrame(raf.current);raf.current=0;},[]);

 /* ---- start / restart: one tap, straight into the kick-off beat ---- */
 const start=useCallback(async(daily:boolean)=>{
  (audio.current??=createKitRushAudio()).unlock();
  const id=await entry.enter();if(!id)return;
  const day=localPlayDay(Date.now()),z=size.current,boardGame:BoardGame=daily?'kitdaily':'kitrush';
  const seed=daily?kitRushDailySeed(day):1+Math.floor(Math.random()*2_000_000_000);
  game.current=createKitRush({seed,h:kitRushFieldH(z.w,z.h),daily});run.current={id,daily,day,done:false,board:boardGame};
  if(!daily||readKitRushSave().daily.day!==day||!readKitRushSave().daily.counted)beginBoardSession(boardGame);
  view.current?.reset();endAt.current=0;setResult(null);setBoard(null);setDailyFirst(false);setToday(day);
  const s=game.current.state,n:Hud={score:0,lives:s.lives,team:s.team,fx:''};hudRef.current=n;setHud(n);
  change('playing');wake();
 },[change,entry,wake]);
 const pause=useCallback(()=>{if(phaseRef.current!=='playing')return;for(let i=0;i<4;i++)game.current?.endStroke(i);sleep();change('paused');},[change,sleep]);
 const resume=useCallback(()=>{if(phaseRef.current!=='paused')return;audio.current?.unlock();change('playing');wake();},[change,wake]);
 const leave=useCallback(()=>{sleep();onExit();},[onExit,sleep]);

 /* ---- canvases, size, pointers ---- */
 useEffect(()=>{
  const el=stage.current,b=bg.current,f=fg.current;if(!el||!b||!f)return;
  reduced.current=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const v=view.current=createKitRushView(b,f,{reduced:reduced.current});
  const fit=()=>{const r=el.getBoundingClientRect(),z=size.current;z.w=Math.max(1,r.width);z.h=Math.max(1,r.height);z.left=r.left;z.top=r.top;z.dpr=perf.current.dropped?1.5:Math.min(2,window.devicePixelRatio||1);v.resize(z.w,z.h,z.dpr);};
  fit();const ro=new ResizeObserver(fit);ro.observe(el);
  // pointers: up to four fingers, each with its own slash and combo; coalesced samples keep fast swipes exact
  const ids=[-1,-1,-1,-1],px=[0,0,0,0],py=[0,0,0,0];
  const slotOf=(id:number)=>ids.indexOf(id);
  const toField=(e:PointerEvent,out:{x:number;y:number})=>{const z=size.current,k=KR.fieldW/z.w;out.x=(e.clientX-z.left)*k;out.y=(e.clientY-z.top)*k;},pt={x:0,y:0};
  const down=(e:PointerEvent)=>{if(phaseRef.current!=='playing'||(e.pointerType==='mouse'&&e.button!==0))return;e.preventDefault();audio.current?.unlock();
   const r=el.getBoundingClientRect();size.current.left=r.left;size.current.top=r.top;
   let i=slotOf(e.pointerId);if(i<0)i=ids.indexOf(-1);if(i<0)return;ids[i]=e.pointerId;try{f.setPointerCapture(e.pointerId);}catch{/* fine without */}
   toField(e,pt);px[i]=pt.x;py[i]=pt.y;game.current?.beginStroke(i);v.trailStart(i);v.trailPoint(i,pt.x,pt.y,performance.now());};
  const move=(e:PointerEvent)=>{const i=slotOf(e.pointerId);if(i<0||phaseRef.current!=='playing')return;e.preventDefault();const g=game.current;if(!g)return;
   const list=e.getCoalescedEvents?.(),now=performance.now();
   if(list&&list.length>1){for(let k=0;k<list.length;k++){toField(list[k],pt);g.swipe(i,px[i],py[i],pt.x,pt.y);px[i]=pt.x;py[i]=pt.y;v.trailPoint(i,pt.x,pt.y,now);}}
   else{toField(e,pt);g.swipe(i,px[i],py[i],pt.x,pt.y);px[i]=pt.x;py[i]=pt.y;v.trailPoint(i,pt.x,pt.y,now);}};
  const up=(e:PointerEvent)=>{const i=slotOf(e.pointerId);if(i<0)return;ids[i]=-1;game.current?.endStroke(i);try{f.releasePointerCapture(e.pointerId);}catch{/* gone */}};
  const opt={passive:false} as const;
  f.addEventListener('pointerdown',down,opt);f.addEventListener('pointermove',move,opt);f.addEventListener('pointerup',up);f.addEventListener('pointercancel',up);f.addEventListener('lostpointercapture',up);
  const noMenu=(e:Event)=>e.preventDefault();f.addEventListener('contextmenu',noMenu);
  if(process.env.NODE_ENV!=='production')(window as unknown as {__kitrush?:unknown}).__kitrush={get game(){return game.current;},get phase(){return phaseRef.current;},get loop(){return raf.current!==0;},perf:perf.current,size:size.current,get audio(){return audio.current;}};
  return()=>{ro.disconnect();f.removeEventListener('pointerdown',down);f.removeEventListener('pointermove',move);f.removeEventListener('pointerup',up);f.removeEventListener('pointercancel',up);f.removeEventListener('lostpointercapture',up);f.removeEventListener('contextmenu',noMenu);
   if(raf.current)cancelAnimationFrame(raf.current);raf.current=0;view.current=null;game.current=null;audio.current?.dispose();audio.current=null;delete (window as unknown as {__kitrush?:unknown}).__kitrush;};
 },[]);
 /* ---- looked away: pause (RotateLock sends the same blur when a phone is turned sideways) ---- */
 useEffect(()=>{
  const away=()=>pause(),hidden=()=>{if(document.hidden)pause();};
  const key=(e:KeyboardEvent)=>{if(e.target instanceof HTMLElement&&e.target.closest('button,input,select,textarea,a,dialog'))return;
   if(e.code==='Escape'||e.code==='KeyP'){e.preventDefault();if(phaseRef.current==='playing')pause();else if(phaseRef.current==='paused')resume();}};
  window.addEventListener('blur',away);document.addEventListener('visibilitychange',hidden);window.addEventListener('keydown',key);
  return()=>{window.removeEventListener('blur',away);document.removeEventListener('visibilitychange',hidden);window.removeEventListener('keydown',key);};
 },[pause,resume]);

 const team=TEAMS[hud.team],streak=today?liveStreak(save,today):0,dailyToday=save.daily.day===today?save.daily:null,busy=entry.pending;
 const tap=()=>{(audio.current??=createKitRushAudio()).unlock();audio.current.tap();};
 return <div className={`${styles.game} ${arcadeSkin.kitrush} ${comicRoot}`} data-game="kitrush" data-arcade-kind="kitrush" data-phase={phase} data-fx={hud.fx||undefined} style={{'--kr-team':team.color,'--kr-team-dark':team.dark} as CSSProperties}>
  <aside className={styles.side} data-side="left" aria-hidden="true">
   <ComicPanel tilt={-1.5} tone="paper" className={styles.sideRow}><KitShirt team={0}/><span>Swipe through your team’s kit.</span></ComicPanel>
   <ComicPanel tilt={1} tone="paper" className={styles.sideRow}><KitShirt team={1} crossed/><span>Leave the other team’s kit alone.</span></ComicPanel>
   <ComicPanel tilt={-.8} tone="red" className={styles.sideRow}><WhistleIcon/><span>Never touch the referee’s whistle.</span></ComicPanel>
  </aside>
  <aside className={styles.side} data-side="right" aria-hidden="true">
   <ComicPanel tilt={1.2} tone="paper" className={styles.sideMedals}><b>Medals</b>{KR.medals.map((m,i)=><span key={m}><Medal level={i+1} on/>{MEDAL_NAMES[i]}<em>{m}</em></span>)}</ComicPanel>
   <ComicPanel tilt={-1} tone="teal"><b>One swipe, many kits</b><br/>2 One-two · 3 Hat-trick · 4 Tiki-taka</ComicPanel>
  </aside>
  <div className={styles.stage} ref={stage} data-kitrush-stage>
   <canvas ref={bg} className={styles.scene} aria-hidden="true"/>
   <canvas ref={fg} className={styles.play} tabIndex={0} aria-label="Kit Rush play area. Swipe through your team’s kit."/>
   <i className={styles.frame} aria-hidden="true"/>
   {(phase==='playing'||phase==='paused')&&<div className={styles.banner} data-kitrush-banner aria-live="polite" aria-label={`Your kit: ${team.name}, ${team.pattern}. Lives: ${hud.lives}`}>
    <KitShirt team={hud.team} size={30} key={hud.team}/><b>{team.name}</b>
    <span className={styles.lives} data-kitrush-lives={hud.lives}>{[0,1,2].map(i=><i key={i} data-on={i<hud.lives||undefined}/>)}</span>
   </div>}
  </div>
  <ArcadeTopBar game="kitrush" className={styles.topBar} backTitle="Back to arcade" onBack={leave} value={phase==='playing'||phase==='paused'?hud.score:undefined} word="pts" bumpKey={hud.score} paused={phase==='paused'} canPause={phase==='playing'||phase==='paused'} onPause={()=>phase==='playing'?pause():resume()}/>
  {phase==='paused'&&<ArcadePauseCard game="kitrush" score={`${hud.score} pts · ${team.name} kit · ${hud.lives} ${hud.lives===1?'life':'lives'}`} status={entry.message||undefined} onResume={resume} onExit={leave} onRestart={()=>{void start(run.current.daily);}} restartDisabled={busy} keys={[['Drag','swipe'],['P','pause']]}/>}
  {phase==='menu'&&<ComicCard label="Kit Rush" title="Kit Rush" badge="Swipe your kit" badgeTone="teal" best={save.best>0?`Best ${save.best}`:undefined} data-kitrush-card="start">
   <ul className={styles.how}>
    <li><KitShirt team={0}/><span>Swipe <b>your</b> kit</span></li>
    <li><KitShirt team={1} crossed/><span>Not <b>theirs</b></span></li>
    <li><WhistleIcon/><span>Never the <b>whistle</b></span></li>
   </ul>
   <p className={styles.learn}>Kits differ by colour and pattern. Look first, then swipe once through yours.</p>
   <div className={styles.chips}>
    <ComicStat value={save.best||'–'} label="Best"/>
    <ComicStat value={<span className={styles.medalRow}>{[1,2,3,4].map(l=><Medal key={l} level={l} on={save.medal>=l}/>)}</span>} label={save.medal?MEDAL_NAMES[save.medal-1]:'No medal yet'}/>
    <ComicStat value={streak} label={streak===1?'Day in a row':'Days in a row'} tone={streak>0?'sun':undefined} data-kitrush-streak={streak}/>
   </div>
   {entry.message&&<p className={styles.status} role="status">{entry.message}</p>}
   <div className={styles.actions}>
    <ComicButton variant={dailyFirst?'paper':'primary'} wide disabled={busy} onClick={()=>{void start(false);}} data-kitrush-play autoFocus={!dailyFirst}>Play</ComicButton>
    <ComicButton variant={dailyFirst?'primary':'teal'} wide disabled={busy} onClick={()=>{void start(true);}} data-kitrush-daily autoFocus={dailyFirst}>Daily Rush<small>{dailyToday?.counted?`Today’s best ${dailyToday.best} · practice`:'Same kit bag for everyone today'}</small></ComicButton>
    <ComicButton size="small" onClick={()=>{tap();setScores(true);}} data-kitrush-scores>Scores</ComicButton>
   </div>
  </ComicCard>}
  {phase==='over'&&result&&<ComicCard label="Full time" badge={result.daily?'Daily Rush':'Full time'} badgeTone={result.daily?'teal':'red'} best={result.daily?`Today ${result.settled.dailyBest}`:`Best ${result.settled.save.best}`} data-kitrush-card="results" data-kitrush-score={result.score}>
   <div className={styles.scoreRow}>
    <strong className={`${comicNumeral} ${styles.score}`} data-new-best={result.settled.newBest||undefined}>{result.score}</strong>
    {result.settled.newBest&&<ComicBurst word="New best!" size={17} tilt={7} className={styles.stamp}/>}
   </div>
   <div className={styles.medalRow} data-kitrush-medal={result.settled.medal} role="img" aria-label={result.settled.medal?`${MEDAL_NAMES[result.settled.medal-1]} medal`:'No medal this time'}>{[1,2,3,4].map(l=><Medal key={l} level={l} on={medalFor(result.score)>=l}/>)}<em>{result.settled.medal?MEDAL_NAMES[result.settled.medal-1]:'No medal yet'}</em></div>
   <ComicPanel tone="sun" tilt={-1.2} className={styles.near} data-kitrush-near>{result.near}</ComicPanel>
   <div className={styles.hsSlot} data-hs-slot/>
   <div className={styles.chips}>
    <ComicStat value={result.stats.bestCombo||1} label="Best swipe"/>
    <ComicStat value={result.stats.bestClean} label="Clean run"/>
    <ComicStat value={result.stats.sliced} label="Kit struck"/>
    {result.daily&&<ComicStat value={result.settled.streak} label={result.settled.streak===1?'Day':'Days in a row'} tone="sun"/>}
   </div>
   <p className={styles.coach}>{result.coach}</p>
   <ComicPanel tone="paper" flat className={styles.fact} data-kitrush-fact><b>{result.settled.fact.title}</b>{result.settled.fact.line}</ComicPanel>
   {(result.coins>0||entry.message)&&<p className={styles.status} role="status">{entry.message||`+${result.coins} ${result.coins===1?'coin':'coins'}`}{result.daily&&!result.settled.dailyFirst&&!entry.message?' · practice run (your first run today is on the board)':''}</p>}
   <div className={styles.actions}>
    <ComicButton variant="primary" wide disabled={busy} onClick={()=>{void start(result.daily);}} data-kitrush-again autoFocus>Play again</ComicButton>
    <ComicButton size="small" disabled={busy} onClick={()=>{void start(!result.daily);}} data-kitrush-other>{result.daily?'Endless Rush':'Daily Rush'}</ComicButton>
    <ComicButton size="small" onClick={()=>{tap();setScores(true);}}>Scores</ComicButton>
   </div>
  </ComicCard>}
  {board&&phase==='over'&&<HighScoreEntry game={board.game} score={board.score} detail={board.game==='kitdaily'?'Daily Rush: the same kit bag for everyone today. Your first run counts.':'Points for your own kit struck clean.'} onClose={()=>setBoard(null)}/>}
  {scores&&<KitRushScores daily={!!result?.daily} onClose={()=>setScores(false)}/>}
 </div>;
}
