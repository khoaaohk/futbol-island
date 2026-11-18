'use client';
/**
 * Street Dash (Nov 17 2026, docs/arcade-aaa/streetdash-direction.md): the side-scrolling cabinet. Rules: lib/arcade/streetdash/core.ts
 * (pure, seeded, fixed 1/120 s steps). Drawing: view.ts (one 2D canvas). Sound: audio.ts. This shell owns the thumb, the keys and the cards.
 * One thumb anywhere: tap = jump (hold = higher), swipe down = slide (fast fall in the air), tap the glowing SHOOT target = volley.
 * A touch waits up to 55 ms to tell a tap from a swipe; that wait is handed to the core, which stretches its ledge grace by it.
 * Heat: the loop runs only while playing (menu, pause, results and a hidden tab draw nothing). DPR cap 2. HUD state at most 10 times a second.
 * Teaches (AGENTS.md): "Keep the ball close. Look up early."
 */
import {useCallback,useEffect,useRef,useState} from 'react';
import dynamic from 'next/dynamic';
import {retryImport} from '@/lib/retryImport';
import {ArcadeTopBar} from '../arcade/ArcadeTopBar';
import {ArcadePauseCard} from '../arcade/ArcadePauseCard';
import {arcadeSkin} from './skins';
import {comicRoot,comicNumeral,ComicButton,ComicCard,ComicPanel,ComicStat,ComicBurst} from './comic';
import styles from './StreetDashGame.module.css';
import {createStreetDash,streetdashDailySeed,medalFor,SD,HZ_NAME,MEDAL_NAMES,type StreetDash,type DashEvent} from '@/lib/arcade/streetdash/core';
import {createStreetdashView,type StreetdashView} from '@/lib/arcade/streetdash/view';
import {createStreetdashAudio,type StreetdashAudio} from '@/lib/arcade/streetdash/audio';
import {readStreetdashSave,writeStreetdashSave,settleStreetdash,nearMissLine,coachLine,liveStreak,emptyStreetdashSave,type StreetdashSave,type StreetdashSettled} from '@/lib/arcade/streetdash/save';
import {arcadeFeedback} from '@/lib/arcade/arcadeFeedback';
import {useArcadeEntry} from '@/lib/arcade/useArcadeEntry';
import {creditRun,arcadeCoinTarget} from '@/lib/arcade/arcadeWallet';
import {saveArcadeRecord} from '@/lib/arcade/arcadeRecords';
import {beginBoardSession} from '@/lib/arcade/boardClient';
import {noteLastScore} from '@/lib/arcade/lastScore';
import {localPlayDay} from '@/lib/town/dailyPlay';
const HighScoreEntry=dynamic(()=>retryImport(()=>import('../arcade/HighScoreEntry')),{ssr:false});
const StreetDashScores=dynamic(()=>retryImport(()=>import('./StreetDashScores')),{ssr:false});

type Phase='menu'|'playing'|'paused'|'over';
type Hud={score:number;dist:number;hearts:number;streak:number};
type Result={score:number;daily:boolean;dist:number;stars:number;targets:number;goals:number;near:number;streak:number;settled:StreetdashSettled;line:string;coach:string;coins:number};
type Word={id:number;text:string;pts:number;tone:'sun'|'red'|'teal'|'paper';teach:boolean};
export const STREETDASH_COIN_REASON='Street Dash: run';
const TAP_WAIT=55,SWIPE_PX=16;

/** The start card's picture: the bean hops a low wall with the ball at its feet. */
function DashArt(){
 return <svg className={styles.art} viewBox="0 0 220 84" aria-hidden="true">
  <rect x="0" y="66" width="220" height="18" fill="#e9d5ad" stroke="#231a2e" strokeWidth="3"/>
  <rect x="120" y="44" width="22" height="22" fill="#e0603a" stroke="#231a2e" strokeWidth="3"/><rect x="118" y="44" width="26" height="6" fill="#b8432c" stroke="#231a2e" strokeWidth="2.5"/>
  <path d="M60 40 Q 96 2 136 22" fill="none" stroke="#231a2e" strokeWidth="2.5" strokeDasharray="4 5"/>
  <g transform="translate(80 18) rotate(10)"><rect x="-11" y="0" width="22" height="34" rx="11" fill="#19b5a5" stroke="#231a2e" strokeWidth="3"/><ellipse cx="2" cy="9" rx="9" ry="7" fill="#ffd9a8"/><circle cx="6" cy="9" r="1.8" fill="#231a2e"/>
   <path d="M-4 33 L-8 44 M5 33 L12 40" stroke="#231a2e" strokeWidth="4.5" strokeLinecap="round"/></g>
  <circle cx="98" cy="58" r="6.5" fill="#fff3d6" stroke="#231a2e" strokeWidth="2.5"/>
  <path d="M176 18 l4 9 10 1 -8 6 3 10 -9 -6 -9 6 3 -10 -8 -6 10 -1z" fill="#ffc83a" stroke="#231a2e" strokeWidth="2.5" strokeLinejoin="round"/>
 </svg>;
}
function Medal({level,on}:{level:number;on:boolean}){return <span className={styles.medal} data-level={level} data-on={on||undefined} aria-hidden="true"><i/></span>;}
function Hearts({n}:{n:number}){return <span className={styles.hearts} aria-hidden="true">{[0,1,2].map(i=><svg key={i} viewBox="0 0 20 18" data-on={i<n||undefined}><path d="M10 17 C 2 11 0 7 2 4 C 4 1 8 1 10 5 C 12 1 16 1 18 4 C 20 7 18 11 10 17 Z"/></svg>)}</span>;}

export default function StreetDashGame({onExit}:{onExit:()=>void}){
 const [phase,setPhase]=useState<Phase>('menu'),phaseRef=useRef<Phase>('menu');
 const [hud,setHud]=useState<Hud>({score:0,dist:0,hearts:SD.hearts,streak:0}),hudRef=useRef(hud),hudAt=useRef(0);
 const [save,setSave]=useState<StreetdashSave>(emptyStreetdashSave),[result,setResult]=useState<Result|null>(null),[today,setToday]=useState('');
 const [board,setBoard]=useState<{score:number}|null>(null),[scores,setScores]=useState(false),[words,setWords]=useState<Word[]>([]);
 const entry=useArcadeEntry('streetdash');
 const stage=useRef<HTMLDivElement>(null),cv=useRef<HTMLCanvasElement>(null),probe=useRef<HTMLElement>(null);
 const game=useRef<StreetDash|null>(null),view=useRef<StreetdashView|null>(null),audio=useRef<StreetdashAudio|null>(null);
 const raf=useRef(0),last=useRef(0),endAt=useRef(0),wordId=useRef(0),lastHit=useRef(''),run=useRef({id:'',daily:false,day:'',done:true});
 /** a touch not yet known as a tap or a swipe */
 const touch=useRef<{id:number;x:number;y:number;t:number;state:'wait'|'jump'|'done'}|null>(null);
 const reduced=useRef(false),frameRef=useRef<(t:number)=>void>(()=>{});

 const change=useCallback((p:Phase)=>{phaseRef.current=p;setPhase(p);},[]);
 useEffect(()=>{setSave(readStreetdashSave());setToday(localPlayDay(Date.now()));},[]);
 const kick=useCallback(()=>{if(!raf.current&&phaseRef.current==='playing'){last.current=0;raf.current=requestAnimationFrame(t=>frameRef.current(t));}},[]);
 const say=useCallback((text:string,pts:number,tone:Word['tone'],teach=false)=>{const w:Word={id:++wordId.current,text,pts,tone,teach};setWords(list=>[...list.filter(x=>x.teach!==teach||!teach).slice(-2),w]);},[]);

 /* ---- the run's end: save, coins, board (once per run) ---- */
 const finish=useCallback(()=>{
  const g=game.current,r=run.current;if(!g||r.done)return;r.done=true;const s=g.state,score=s.score,stats={...s.stats},dist=Math.floor(s.dist);
  const settled=settleStreetdash(readStreetdashSave(),{score,daily:r.daily,day:r.day,dist,stats});writeStreetdashSave(settled.save);setSave(settled.save);
  if(!r.daily)saveArcadeRecord('streetdash',score);else noteLastScore('streetdash_daily',score,settled.dailyBest);
  const coins=arcadeCoinTarget('streetdash',{points:score});if(coins>0)void creditRun(r.id,'streetdash',coins,STREETDASH_COIN_REASON);
  setResult({score,daily:r.daily,dist,stars:stats.stars,targets:stats.crates+stats.gates+stats.goals,goals:stats.goals,near:stats.near,streak:stats.bestStreak,settled,coins,
   line:nearMissLine({score,best:settled.previousBest,newBest:settled.newBest,daily:r.daily,stats}),coach:coachLine(stats,lastHit.current)});
  if(score>0&&(!r.daily||settled.dailyFirst))setBoard({score});
  if(settled.newMedal||settled.newBest){audio.current?.medal(Math.max(1,settled.medal));arcadeFeedback(null,'goal');}
  touch.current=null;setWords([]);change('over');
 },[change]);

 /* ---- one rules event: sound, haptics, words ---- */
 const onEvent=useCallback((e:DashEvent)=>{
  const a=audio.current;view.current?.onEvent(e);
  switch(e.type){
   case 'jump':a?.jump();break;
   case 'land':a?.land(e.a>.5);break;
   case 'slide':a?.slide();break;
   case 'fastfall':a?.fastfall();break;
   case 'volley':a?.volley();arcadeFeedback(null,'combo');break;
   case 'crate':a?.crate();if(e.a>=2)say(`STREAK x${(1+SD.streakStep*Math.min(SD.streakMax,e.a)).toFixed(1).replace('.0','')}`,0,'teal');break;
   case 'gate':a?.gate();break;
   case 'goal':a?.goal(e.a);arcadeFeedback(null,'goal');say('GOAL!',e.points,'red');break;
   case 'star':a?.star();break;
   case 'near':a?.near();say('NEAR MISS!',e.points,'sun');break;
   case 'hit':a?.hit(e.kind);arcadeFeedback(null,'slam');lastHit.current=HZ_NAME[e.kind]||'fall';if(e.kind===6)say('STOLEN!',0,'paper');break;
   case 'oops':a?.oops();say('TRY AGAIN!',0,'paper',true);break;
   case 'fall':a?.fall();lastHit.current='fall';break;
   case 'teach':a?.teach();say(e.word,0,'sun',true);break;
   case 'level':a?.level();break;
   case 'theme':a?.theme(e.a);say(['STREETS','ROOFTOPS','BEACH'][e.a]??'',0,'teal');break;
   case 'over':a?.over();arcadeFeedback(null,'slam');endAt.current=performance.now()+(reduced.current?500:1300);say('FULL TIME!',0,'paper');break;
  }
 },[say]);

 /* ---- the loop: fixed steps in the core, one draw a frame ---- */
 useEffect(()=>{frameRef.current=(now:number)=>{
  raf.current=0;const g=game.current,v=view.current;if(phaseRef.current!=='playing'||!g||!v)return;
  const dt=last.current?Math.min(.1,(now-last.current)/1000):1/60;last.current=now;
  const tc=touch.current;if(tc&&tc.state==='wait'&&now-tc.t>=TAP_WAIT){tc.state='jump';g.press('jump',(now-tc.t)/1000);}
  g.advance(dt);g.drain(onEvent);v.render(g,now/1000);
  const s=g.state,h=hudRef.current;
  if(now-hudAt.current>100&&(h.score!==s.score||h.hearts!==s.hearts||h.streak!==s.streak)){hudAt.current=now;const n={score:s.score,dist:Math.floor(s.dist),hearts:s.hearts,streak:s.streak};hudRef.current=n;setHud(n);}
  if(s.over&&endAt.current&&now>=endAt.current){finish();return;}
  raf.current=requestAnimationFrame(t=>frameRef.current(t));
 };},[finish,onEvent]);

 /* ---- start / restart: one tap, straight onto the street ---- */
 const start=useCallback(async(daily:boolean)=>{
  (audio.current??=createStreetdashAudio()).unlock();
  const id=await entry.enter();if(!id)return;
  const day=localPlayDay(Date.now()),seed=daily?streetdashDailySeed(day):1+Math.floor(Math.random()*2_000_000_000);
  game.current=createStreetDash({seed,daily});run.current={id,daily,day,done:false};lastHit.current='';
  if(!daily||readStreetdashSave().daily.day!==day||!readStreetdashSave().daily.counted)beginBoardSession('streetdash');
  view.current?.reset();endAt.current=0;touch.current=null;setResult(null);setBoard(null);setWords([]);setToday(day);
  game.current.drain(()=>{});const n={score:0,dist:0,hearts:SD.hearts,streak:0};hudRef.current=n;setHud(n);
  change('playing');kick();
 },[change,entry,kick]);
 const pause=useCallback(()=>{if(phaseRef.current!=='playing')return;if(raf.current)cancelAnimationFrame(raf.current);raf.current=0;
  const g=game.current;if(g&&touch.current?.state==='jump')g.press('release');touch.current=null;if(g?.state.over){finish();return;}change('paused');},[change,finish]);
 const resume=useCallback(()=>{if(phaseRef.current!=='paused')return;audio.current?.unlock();change('playing');kick();},[change,kick]);
 const leave=useCallback(()=>{if(raf.current)cancelAnimationFrame(raf.current);raf.current=0;onExit();},[onExit]);

 /* ---- canvas, size, the thumb ---- */
 useEffect(()=>{
  const el=stage.current,c=cv.current;if(!el||!c)return;
  reduced.current=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const v=view.current=createStreetdashView(c,{reduced:reduced.current});
  const fit=()=>{const r=el.getBoundingClientRect(),vv=window.visualViewport,cut=Math.max(0,Math.round(r.bottom-(vv?vv.offsetTop+vv.height:window.innerHeight)));el.style.setProperty('--sd-cut',`${cut}px`);
   v.resize(Math.max(1,r.width),Math.max(1,r.height-cut),Math.min(2,window.devicePixelRatio||1));const g=game.current;if(g&&phaseRef.current!=='menu')v.render(g,performance.now()/1000);};
  fit();const ro=new ResizeObserver(fit);ro.observe(el);window.visualViewport?.addEventListener('resize',fit);
  const onTarget=(x:number,y:number)=>{const L=v.layout,p=L.prompt,t=L.target;return (p.r>0&&Math.hypot(x-p.x,y-p.y)<=p.r*1.35)||(t.r>0&&Math.hypot(x-t.x,y-t.y)<=t.r);};
  const down=(e:PointerEvent)=>{if(phaseRef.current!=='playing'||(e.pointerType==='mouse'&&e.button!==0)||(e.target instanceof Element&&e.target.closest('button')))return;
   const g=game.current;if(!g)return;e.preventDefault();audio.current?.unlock();if(g.state.over){endAt.current=1;return;}
   const r=el.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
   if(onTarget(x,y)){g.press('volley');touch.current={id:e.pointerId,x:e.clientX,y:e.clientY,t:performance.now(),state:'done'};return;}
   try{el.setPointerCapture(e.pointerId);}catch{/* fine without */}
   if(e.pointerType==='mouse'){g.press('jump');touch.current={id:e.pointerId,x:e.clientX,y:e.clientY,t:performance.now(),state:'jump'};}
   else touch.current={id:e.pointerId,x:e.clientX,y:e.clientY,t:performance.now(),state:'wait'};};
  const move=(e:PointerEvent)=>{const tc=touch.current,g=game.current;if(!tc||!g||e.pointerId!==tc.id||tc.state==='done')return;e.preventDefault();
   const dy=e.clientY-tc.y,dx=e.clientX-tc.x;if(dy>SWIPE_PX&&dy>Math.abs(dx)&&performance.now()-tc.t<350){if(tc.state==='jump')g.press('release');g.press('slide');tc.state='done';}};
  const up=(e:PointerEvent)=>{const tc=touch.current,g=game.current;if(!tc||e.pointerId!==tc.id)return;touch.current=null;try{el.releasePointerCapture(e.pointerId);}catch{/* gone */}if(!g)return;
   if(tc.state==='wait'&&e.type==='pointerup'){g.press('jump',(performance.now()-tc.t)/1000);g.press('release');}else if(tc.state==='jump')g.press('release');};
  const opt={passive:false} as const;
  el.addEventListener('pointerdown',down,opt);el.addEventListener('pointermove',move,opt);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
  const noScroll=(e:TouchEvent)=>{if(phaseRef.current==='playing'&&e.cancelable)e.preventDefault();};el.addEventListener('touchmove',noScroll,opt);
  const noMenu=(e:Event)=>e.preventDefault();c.addEventListener('contextmenu',noMenu);
  if(process.env.NODE_ENV!=='production')(window as unknown as {__streetdash?:unknown}).__streetdash={get game(){return game.current;},get phase(){return phaseRef.current;},get loop(){return raf.current!==0;},get layout(){return view.current?.layout;},get audio(){return audio.current;},get stage(){return el.getBoundingClientRect();}};
  return()=>{ro.disconnect();window.visualViewport?.removeEventListener('resize',fit);el.removeEventListener('pointerdown',down);el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up);el.removeEventListener('touchmove',noScroll);c.removeEventListener('contextmenu',noMenu);
   if(raf.current)cancelAnimationFrame(raf.current);raf.current=0;v.dispose();view.current=null;game.current=null;audio.current?.dispose();audio.current=null;delete (window as unknown as {__streetdash?:unknown}).__streetdash;};
 },[]);

 /* ---- keys: Space / Up jump (hold = higher), Down slide, X / Enter volley, P / Escape pause; looked away: pause ---- */
 useEffect(()=>{
  const away=()=>pause(),hidden=()=>{if(document.hidden)pause();};
  const isUi=(e:KeyboardEvent)=>e.target instanceof HTMLElement&&!!e.target.closest('button,input,select,textarea,a,dialog');
  const key=(e:KeyboardEvent)=>{if(isUi(e))return;
   if(e.code==='Escape'||e.code==='KeyP'){e.preventDefault();if(phaseRef.current==='playing')pause();else if(phaseRef.current==='paused')resume();return;}
   const g=game.current;if(phaseRef.current!=='playing'||!g)return;audio.current?.unlock();
   if(g.state.over){if(e.code==='Enter'||e.code==='Space'){e.preventDefault();endAt.current=1;}return;}
   if(e.code==='Space'||e.code==='ArrowUp'||e.code==='KeyW'){e.preventDefault();if(!e.repeat)g.press('jump');}
   else if(e.code==='ArrowDown'||e.code==='KeyS'){e.preventDefault();if(!e.repeat)g.press('slide');}
   else if(e.code==='KeyX'||e.code==='Enter'){e.preventDefault();if(!e.repeat)g.press('volley');}};
  const keyUp=(e:KeyboardEvent)=>{const g=game.current;if(!g||phaseRef.current!=='playing')return;if(e.code==='Space'||e.code==='ArrowUp'||e.code==='KeyW')g.press('release');};
  window.addEventListener('blur',away);document.addEventListener('visibilitychange',hidden);window.addEventListener('keydown',key);window.addEventListener('keyup',keyUp);
  return()=>{window.removeEventListener('blur',away);document.removeEventListener('visibilitychange',hidden);window.removeEventListener('keydown',key);window.removeEventListener('keyup',keyUp);};
 },[pause,resume]);

 const streak=today?liveStreak(save,today):0,dailyToday=save.daily.day===today?save.daily:null,busy=entry.pending,live=phase==='playing'||phase==='paused';
 const tap=()=>{(audio.current??=createStreetdashAudio()).unlock();audio.current.tap();};
 const best=save.best,gap=best>0&&hud.score<best?best-hud.score:0,mult=1+SD.streakStep*Math.min(SD.streakMax,hud.streak);
 return <div className={`${styles.game} ${arcadeSkin.streetdash} ${comicRoot}`} data-game="streetdash" data-arcade-kind="streetdash" data-phase={phase}>
  <aside className={styles.side} data-side="left" aria-hidden="true">
   <ComicPanel tilt={-1.5} tone="paper"><b>Tap to jump</b><br/>Hold the tap to jump higher. Swipe down to slide.</ComicPanel>
   <ComicPanel tilt={1} tone="sun"><b>Shoot</b><br/>A target glows when the ball is at your feet. Tap it to volley.</ComicPanel>
   <ComicPanel tilt={-.8} tone="teal"><b>Keys</b><br/>Space jumps. Down slides. X shoots. P pauses.</ComicPanel>
  </aside>
  <aside className={styles.side} data-side="right" aria-hidden="true">
   <ComicPanel tilt={1.2} tone="paper" className={styles.sideMedals}><b>Medals</b>{SD.medals.map((m,i)=><span key={m}><Medal level={i+1} on/>{MEDAL_NAMES[i]}<em>{m}</em></span>)}</ComicPanel>
   <ComicPanel tilt={-1} tone="red"><b>Three hearts</b><br/>A tackle, a puddle, a dog or a gap knocks the ball loose and costs a heart.</ComicPanel>
  </aside>
  <div className={styles.stage} ref={stage} data-streetdash-stage>
   <i ref={probe} className={styles.probe} aria-hidden="true"/>
   <canvas ref={cv} className={styles.play} tabIndex={0} aria-label="Street Dash. Tap to jump, hold to jump higher, swipe down to slide, tap the glowing target to shoot. Keys: Space, Down, X."/>
   {live&&<div className={styles.strip} data-streetdash-hud aria-live="polite" aria-label={`${hud.hearts} hearts. ${hud.dist} metres.`}>
    <Hearts n={hud.hearts}/>
    <span className={styles.stripItem}><small>m</small>{hud.dist}</span>
    <span className={styles.stripItem} data-streetdash-best><small>{gap>0?'To best':'Best'}</small>{gap>0?gap:Math.max(best,hud.score)}</span>
    {hud.streak>=1&&<span className={styles.streak} key={hud.streak} data-streetdash-streak={hud.streak}>x{String(mult).replace('.0','')}</span>}
   </div>}
   <div className={styles.words} aria-live="polite">{words.map(w=><span key={w.id} className={styles.word} data-teach={w.teach||undefined} onAnimationEnd={()=>setWords(l=>l.filter(x=>x.id!==w.id))}>
    <ComicBurst word={w.text} size={w.teach?30:w.text.length>8?18:22} tilt={w.id%2?-4:3} color={w.tone==='red'?'#f0452e':w.tone==='teal'?'#19b5a5':w.tone==='paper'?'#fff3d6':'#ffc83a'} fill={w.tone==='red'?'#fff3d6':undefined}/>
    {w.pts>0&&<b className={`${comicNumeral} ${styles.pts}`}>+{w.pts}</b>}</span>)}</div>
  </div>
  <ArcadeTopBar game="streetdash" className={styles.topBar} backTitle="Back to arcade" onBack={leave} value={live?hud.score:undefined} word="pts" bumpKey={hud.score} paused={phase==='paused'} canPause={live} onPause={()=>phase==='playing'?pause():resume()}/>
  {phase==='paused'&&<ArcadePauseCard game="streetdash" score={`${hud.score} pts · ${hud.dist} m · ${hud.hearts} ${hud.hearts===1?'heart':'hearts'}`} status={entry.message||undefined} onResume={resume} onExit={leave} onRestart={()=>{void start(run.current.daily);}} restartDisabled={busy} keys={[['Space','jump'],['Down','slide'],['X','shoot'],['P','pause']]}/>}
  {phase==='menu'&&<ComicCard label="Street Dash" title="Street Dash" badge="Keep it close" badgeTone="teal" best={best>0?`Best ${best}`:undefined} data-streetdash-card="start">
   <DashArt/>
   <p className={styles.learn}>Run the streets, rooftops and beach with the ball at your feet. <b>Tap</b> to jump, hold for higher. <b>Swipe down</b> to slide. When a target glows, <b>tap it</b> to shoot. Three hits and the run ends.</p>
   <div className={styles.chips}>
    <ComicStat value={best||'–'} label="Best"/>
    <ComicStat value={<span className={styles.medalRow}>{[1,2,3].map(l=><Medal key={l} level={l} on={save.medal>=l}/>)}</span>} label={save.medal?MEDAL_NAMES[save.medal-1]:'No medal yet'}/>
    <ComicStat value={streak} label={streak===1?'Day in a row':'Days in a row'} tone={streak>0?'sun':undefined} data-streetdash-streakdays={streak}/>
   </div>
   {entry.message&&<p className={styles.status} role="status">{entry.message}</p>}
   <div className={styles.actions}>
    <ComicButton variant="primary" wide disabled={busy} onClick={()=>{void start(false);}} data-streetdash-play autoFocus>Play</ComicButton>
    <ComicButton variant="teal" wide disabled={busy} onClick={()=>{void start(true);}} data-streetdash-daily>Daily Dash<small>{dailyToday?.counted?`Today’s best ${dailyToday.best} · practice`:'Same street for everyone today'}</small></ComicButton>
    <ComicButton size="small" onClick={()=>{tap();setScores(true);}} data-streetdash-scores>Scores</ComicButton>
   </div>
  </ComicCard>}
  {phase==='over'&&result&&<ComicCard label="Full time" badge={result.daily?'Daily Dash':'Full time'} badgeTone={result.daily?'teal':'red'} best={result.daily?`Today ${result.settled.dailyBest}`:`Best ${result.settled.save.best}`} data-streetdash-card="results" data-streetdash-score={result.score}>
   <div className={styles.scoreRow}>
    <strong className={`${comicNumeral} ${styles.score}`} data-new-best={result.settled.newBest||undefined}>{result.score}</strong>
    {result.settled.newBest&&<ComicBurst word="New best!" size={17} tilt={7} className={styles.stamp}/>}
   </div>
   <div className={styles.medalRow} data-streetdash-medal={result.settled.medal} role="img" aria-label={result.settled.medal?`${MEDAL_NAMES[result.settled.medal-1]} medal`:'No medal this time'}>{[1,2,3].map(l=><Medal key={l} level={l} on={medalFor(result.score)>=l}/>)}<em>{result.settled.medal?MEDAL_NAMES[result.settled.medal-1]:'No medal yet'}</em></div>
   <ComicPanel tone="sun" tilt={-1.2} className={styles.near} data-streetdash-near>{result.line}</ComicPanel>
   <div className={styles.hsSlot} data-hs-slot/>
   <div className={styles.actions}>
    <ComicButton variant="primary" wide disabled={busy} onClick={()=>{void start(result.daily);}} data-streetdash-again autoFocus>Play again</ComicButton>
    <ComicButton size="small" disabled={busy} onClick={()=>{void start(!result.daily);}} data-streetdash-other>{result.daily?'Endless':'Daily Dash'}</ComicButton>
    <ComicButton size="small" onClick={()=>{tap();setScores(true);}}>Scores</ComicButton>
   </div>
   <div className={styles.chips}>
    <ComicStat value={`${result.dist}`} label="Metres"/>
    <ComicStat value={result.targets} label="Shots on target"/>
    <ComicStat value={result.stars} label="Stars"/>
    <ComicStat value={result.near} label="Near misses"/>
   </div>
   <p className={styles.coach}>{result.coach}</p>
   <ComicPanel tone="paper" flat className={styles.fact} data-streetdash-fact><b>{result.settled.tip.title}</b>{result.settled.tip.line}</ComicPanel>
   {(result.coins>0||entry.message)&&<p className={styles.status} role="status">{entry.message||`+${result.coins} ${result.coins===1?'coin':'coins'}`}{result.daily&&!result.settled.dailyFirst&&!entry.message?' · practice run (your first run today is on the board)':''}</p>}
  </ComicCard>}
  {board&&phase==='over'&&<HighScoreEntry game="streetdash" score={board.score} detail="A point a metre, plus stars, shots on target (times your streak) and near misses." onClose={()=>setBoard(null)}/>}
  {scores&&<StreetDashScores onClose={()=>setScores(false)}/>}
 </div>;
}
