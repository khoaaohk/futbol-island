'use client';
/**
 * Squad Snake (Nov 10 2026, docs/arcade-aaa/snake-direction.md): the sixth arcade cabinet. Rules: lib/arcade/snake/core.ts (pure,
 * seeded, fixed tick). Drawing: view.ts (2D canvas, static scene + moving layer, interpolated between ticks). Sound: audio.ts.
 * This shell owns the loop, the swipes and keys, the team sheet and the cards.
 * Heat: the rAF loop runs ONLY while phase === 'playing' (start card, pause, results and a hidden tab draw nothing); 60 fps cap;
 * DPR cap 2, dropped to 1.5 when frames run long; the HUD re-renders only when the score, the line or a flag changes.
 * Teaches (AGENTS.md): the eleven and their jobs, reading a formation from the back, building the shape the coach asks for.
 */
import {useCallback,useEffect,useRef,useState} from 'react';
import dynamic from 'next/dynamic';
import {ArcadeTopBar} from '../arcade/ArcadeTopBar';
import {ArcadePauseCard} from '../arcade/ArcadePauseCard';
import {arcadeSkin} from './skins';
import {comicRoot,comicNumeral,ComicButton,ComicCard,ComicPanel,ComicStat,ComicBurst} from './comic';
import styles from './SquadSnakeGame.module.css';
import {createSquadSnake,snakeDailySeed,medalFor,shapeName,SN,CALLS,SHAPES,POS,POS_COLOR,POS_LABEL,MEDAL_NAMES,type SquadSnake,type SnakeEvent} from '@/lib/arcade/snake/core';
import {createSnakeView,type SnakeView} from '@/lib/arcade/snake/view';
import {createSnakeAudio,type SnakeAudio} from '@/lib/arcade/snake/audio';
import {readSnakeSave,writeSnakeSave,settleSnake,nearMissLine,coachLine,builtLine,liveStreak,emptySnakeSave,type SnakeSave,type SnakeSettled} from '@/lib/arcade/snake/save';
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
const SquadSnakeScores=dynamic(()=>import('./SquadSnakeScores'),{ssr:false});

type Phase='menu'|'playing'|'paused'|'over';
/** line: the positions joined so far, one digit each ("12223"). */
type Hud={score:number;level:number;line:string;call:number;saves:number;dash:boolean;wait:boolean};
type Result={score:number;daily:boolean;level:number;squads:number;longest:number;built:string;hasShape:boolean;called:boolean;settled:SnakeSettled;near:string;coach:string;coins:number};
export const SNAKE_COIN_REASON='Squad Snake: squad called together';
const FRAME_MS=1000/60,SWIPE_PX=22,HUD_ROOM=66;
const KEY_DIR:Record<string,number>={ArrowUp:0,KeyW:0,ArrowRight:1,KeyD:1,ArrowDown:2,KeyS:2,ArrowLeft:3,KeyA:3};

/** A bean as a small inline drawing (the same round body, kit colour and label the canvas draws). */
function Bean({pos,size=34}:{pos:number;size?:number}){
 return <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className={styles.bean}>
  <ellipse cx="11.5" cy="28.5" rx="3.4" ry="2" fill="#231a2e"/><ellipse cx="20.5" cy="28.5" rx="3.4" ry="2" fill="#231a2e"/>
  <rect x="7" y="3" width="18" height="25" rx="9" fill={POS_COLOR[pos]}/><path d="M7 14.5 Q16 16.5 25 14.5 V12 A9 9 0 0 0 7 12 Z" fill="#ffd9a8"/>
  <rect x="7" y="3" width="18" height="25" rx="9" fill="none" stroke="#231a2e" strokeWidth="2.2"/><path d="M7.5 14.6 Q16 16.6 24.5 14.6" fill="none" stroke="#231a2e" strokeWidth="1.3"/>
  <circle cx="13" cy="10.5" r="1.3" fill="#231a2e"/><circle cx="19" cy="10.5" r="1.3" fill="#231a2e"/>
 </svg>;
}
function Medal({level,on}:{level:number;on:boolean}){return <span className={styles.medal} data-level={level} data-on={on||undefined} aria-hidden="true"><i/></span>;}
const lineOf=(g:SquadSnake)=>{const s=g.state;let out='';for(let i=1;i<s.len;i++)out+=s.pos[i];return out;};

export default function SquadSnakeGame({onExit}:{onExit:()=>void}){
 const [phase,setPhase]=useState<Phase>('menu'),phaseRef=useRef<Phase>('menu');
 const [hud,setHud]=useState<Hud>({score:0,level:1,line:'',call:0,saves:1,dash:false,wait:false}),hudRef=useRef(hud);
 const [save,setSave]=useState<SnakeSave>(emptySnakeSave),[result,setResult]=useState<Result|null>(null),[today,setToday]=useState('');
 const [board,setBoard]=useState<{game:BoardGame;score:number}|null>(null),[scores,setScores]=useState(false),[dailyFirst,setDailyFirst]=useState(false);
 const entry=useArcadeEntry('snake');
 const stage=useRef<HTMLDivElement>(null),bg=useRef<HTMLCanvasElement>(null),fg=useRef<HTMLCanvasElement>(null),probe=useRef<HTMLElement>(null),padEl=useRef<HTMLDivElement>(null);
 const game=useRef<SquadSnake|null>(null),view=useRef<SnakeView|null>(null),audio=useRef<SnakeAudio|null>(null);
 const raf=useRef(0),last=useRef(0),slot=useRef(0),endAt=useRef(0),run=useRef({id:'',daily:false,day:'',done:true,board:'snake' as BoardGame});
 const size=useRef({w:1,h:1,dpr:1,left:0,top:0}),perf=useRef({frames:0,sum:0,max:0,window:0,windowSum:0,dropped:false});
 const reduced=useRef(false),pad=useRef(false),fitRef=useRef<()=>void>(()=>{});
 // Touch screens always get the d-pad (Nov 11 2026, owner: "on mobile there are no controls to move"); swipes work as well.
 const [coarse,setCoarse]=useState(false),coarseRef=useRef(false);

 const change=useCallback((p:Phase)=>{phaseRef.current=p;setPhase(p);},[]);
 useEffect(()=>{const s=readSnakeSave(),touch=matchMedia('(pointer:coarse)').matches;coarseRef.current=touch;setCoarse(touch);setSave(s);pad.current=s.pad||touch;fitRef.current();setToday(localPlayDay(Date.now()));setDailyFirst(takeTodayLaunch('snake'));},[]);

 /* ---- the run's end: save, coins, today, board (once per run) ---- */
 const finish=useCallback(()=>{
  const g=game.current,r=run.current;if(!g||r.done)return;r.done=true;const s=g.state,score=Math.floor(s.score),stats={...s.stats},line=[s.gk,s.d,s.m,s.f] as const;
  const settled=settleSnake(readSnakeSave(),{score,daily:r.daily,day:r.day,stats,joined:s.joined,line,level:s.level,cause:s.cause,call:s.call});writeSnakeSave(settled.save);setSave(settled.save);
  if(!r.daily)saveArcadeRecord('snake',score);
  const coins=arcadeCoinTarget('snake',{points:score});if(coins>0)void creditRun(r.id,'snake',coins,SNAKE_COIN_REASON);
  void noteArcadeToday({kind:'snake',daily:r.daily,day:r.day,score,squads:stats.squads,calls:stats.calls,level:s.level});
  setResult({score,daily:r.daily,level:s.level,squads:stats.squads,longest:stats.longest-1,built:builtLine(stats,line),hasShape:stats.bestCode>0,called:stats.bestCall,settled,coins,
   near:nearMissLine({score,best:settled.previousBest,newBest:settled.newBest,joined:s.joined,stats,daily:r.daily,call:s.call}),coach:coachLine(s.cause)});
  if(score>0&&(!r.daily||settled.dailyFirst))setBoard({game:r.board,score});
  if(settled.newMedal||settled.newBest){audio.current?.medal(Math.max(1,settled.medal));arcadeFeedback(null,'goal');}
  view.current?.clear();change('over');
 },[change]);

 /* ---- one rules event: picture, sound, haptics ---- */
 const onEvent=useCallback((e:SnakeEvent)=>{
  const g=game.current,a=audio.current;if(!g)return;view.current?.onEvent(e,g.state);
  switch(e.type){
   case 'ready':a?.ready();break;
   case 'turn':a?.turn(e.a);break;
   case 'pick':a?.pick(e.b);arcadeFeedback(null,'combo');break;
   case 'squad':a?.squad(e.c===1);arcadeFeedback(null,'goal');break;
   case 'level':a?.level();break;
   case 'ball':a?.ball();arcadeFeedback(null,'skill');break;
   case 'boot':a?.boot();arcadeFeedback(null,'perfect');break;
   case 'bootIn':a?.bootIn();break;
   case 'skid':a?.skid();arcadeFeedback(null,'slam');break;
   case 'save':a?.save();arcadeFeedback(null,'level');break;
   case 'card':a?.card();arcadeFeedback(null,'slam');break;
   case 'knock':a?.knock();arcadeFeedback(null,'perfect');break;
   case 'crash':a?.crash();arcadeFeedback(null,'slam');break;
  }
 },[]);

 /* ---- the loop: alive only while playing. Rules run on the core's fixed tick; the picture is drawn between ticks. ---- */
 const frame=useCallback((now:number)=>{
  raf.current=0;const g=game.current,v=view.current;if(phaseRef.current!=='playing'||!g||!v)return;
  const next=frameCapSlot(now,slot.current,FRAME_MS);
  if(next>=0){slot.current=next;const dt=Math.min(.05,Math.max(0,(now-last.current)/1000));last.current=now;const t0=performance.now();
   g.step(dt);g.drain(onEvent);v.render(g,dt);
   const s=g.state,h=hudRef.current,dash=s.dash>0;
   if(h.score!==s.score||h.level!==s.level||h.line.length!==s.len-1||h.call!==s.call||h.saves!==s.saves||h.dash!==dash||h.wait!==s.hold){const n={score:s.score,level:s.level,line:lineOf(g),call:s.call,saves:s.saves,dash,wait:s.hold};hudRef.current=n;setHud(n);}
   const cost=performance.now()-t0,p=perf.current;p.frames++;p.sum+=cost;if(cost>p.max)p.max=cost;p.window++;p.windowSum+=cost;
   if(p.window>=90){if(!p.dropped&&p.windowSum/p.window>7&&size.current.dpr>1.5){p.dropped=true;fitRef.current();}p.window=0;p.windowSum=0;}
   if(s.over){if(!endAt.current)endAt.current=now+(reduced.current?350:780);else if(now>=endAt.current){finish();return;}}
  }
  raf.current=requestAnimationFrame(frame);
 },[finish,onEvent]);
 const wake=useCallback(()=>{if(raf.current||phaseRef.current!=='playing')return;last.current=performance.now();slot.current=0;raf.current=requestAnimationFrame(frame);},[frame]);
 const sleep=useCallback(()=>{if(raf.current)cancelAnimationFrame(raf.current);raf.current=0;},[]);

 /* ---- start / restart: one tap, straight into the kick-off beat ---- */
 const start=useCallback(async(daily:boolean)=>{
  (audio.current??=createSnakeAudio()).unlock();
  const id=await entry.enter();if(!id)return;
  const day=localPlayDay(Date.now()),boardGame:BoardGame=daily?'snakedaily':'snake';
  const seed=daily?snakeDailySeed(day):1+Math.floor(Math.random()*2_000_000_000);
  game.current=createSquadSnake({seed,daily,hold:true});/* the captain waits on the spot for the first swipe or arrow */run.current={id,daily,day,done:false,board:boardGame};
  if(!daily||readSnakeSave().daily.day!==day||!readSnakeSave().daily.counted)beginBoardSession(boardGame);
  view.current?.reset();endAt.current=0;setResult(null);setBoard(null);setDailyFirst(false);setToday(day);
  const s=game.current.state,n:Hud={score:0,level:1,line:'',call:s.call,saves:s.saves,dash:false,wait:s.hold};hudRef.current=n;setHud(n);
  change('playing');wake();
 },[change,entry,wake]);
 const pause=useCallback(()=>{if(phaseRef.current!=='playing')return;sleep();change('paused');},[change,sleep]);
 const resume=useCallback(()=>{if(phaseRef.current!=='paused')return;audio.current?.unlock();change('playing');wake();},[change,wake]);
 const leave=useCallback(()=>{sleep();onExit();},[onExit,sleep]);
 /** A turn from any input. During the crash beat a press skips to the results. */
 const steer=useCallback((d:number)=>{const g=game.current;if(phaseRef.current!=='playing'||!g)return;audio.current?.unlock();if(g.state.over){endAt.current=1;return;}g.turn(d);},[]);
 const setPad=useCallback((on:boolean)=>{const s={...readSnakeSave(),pad:on};writeSnakeSave(s);setSave(s);pad.current=on||coarseRef.current;fitRef.current();},[]);

 /* ---- canvases, size, swipes ---- */
 useEffect(()=>{
  const el=stage.current,b=bg.current,f=fg.current;if(!el||!b||!f)return;
  reduced.current=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const v=view.current=createSnakeView(b,f,{reduced:reduced.current});
  // Nov 11 2026: lay out for the VISIBLE viewport. If the page box runs under the browser's bars (iOS with its toolbars), the part
  // below visualViewport is cut off the stage (--snake-cut), and the pitch makes room for the docked d-pad by measuring it.
  const fit=()=>{const r=el.getBoundingClientRect(),vv=window.visualViewport,cut=Math.max(0,Math.round(r.bottom-(vv?vv.offsetTop+vv.height:window.innerHeight)));el.style.setProperty('--snake-cut',`${cut}px`);
   const z=size.current;z.w=Math.max(1,r.width);z.h=Math.max(1,r.height-cut);z.left=r.left;z.top=r.top;z.dpr=perf.current.dropped?1.5:Math.min(2,window.devicePixelRatio||1);
   const pe=padEl.current,room=pad.current&&pe?Math.ceil(r.top+z.h-pe.getBoundingClientRect().top+8):pad.current;
   v.resize(z.w,z.h,z.dpr,(probe.current?.offsetHeight??56)+HUD_ROOM,room);const g=game.current;if(g&&phaseRef.current==='paused')v.render(g,0);};
  fitRef.current=fit;fit();const ro=new ResizeObserver(fit);ro.observe(el);window.visualViewport?.addEventListener('resize',fit);
  // one finger steers; a drag that keeps going can turn again (the origin moves to where the last turn was read). Nov 11 2026: the
  // swipe layer is the whole stage (a swipe may start on the team sheet, the hint or the sand around the d-pad; a d-pad key keeps its
  // own press), and a new finger takes over a swipe whose release iOS never delivered instead of leaving the pitch deaf.
  let id=-1,sx=0,sy=0;
  const down=(e:PointerEvent)=>{if(phaseRef.current!=='playing'||(e.pointerType==='mouse'&&e.button!==0)||(e.target instanceof Element&&e.target.closest('button')))return;e.preventDefault();audio.current?.unlock();
   if(game.current?.state.over){endAt.current=1;return;}id=e.pointerId;sx=e.clientX;sy=e.clientY;try{el.setPointerCapture(e.pointerId);}catch{/* fine without */}};
  const read=(x:number,y:number)=>{const dx=x-sx,dy=y-sy,ax=Math.abs(dx),ay=Math.abs(dy);if(Math.max(ax,ay)<SWIPE_PX||(ax>ay?ay>ax*.8:ax>ay*.8))return;game.current?.turn(ax>ay?(dx>0?1:3):(dy>0?2:0));sx=x;sy=y;};
  const move=(e:PointerEvent)=>{if(e.pointerId!==id||phaseRef.current!=='playing')return;e.preventDefault();const list=e.getCoalescedEvents?.();if(list&&list.length>1)for(let k=0;k<list.length;k++)read(list[k].clientX,list[k].clientY);else read(e.clientX,e.clientY);};
  const up=(e:PointerEvent)=>{if(e.pointerId!==id)return;id=-1;try{el.releasePointerCapture(e.pointerId);}catch{/* gone */}};
  const opt={passive:false} as const;
  el.addEventListener('pointerdown',down,opt);el.addEventListener('pointermove',move,opt);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);el.addEventListener('lostpointercapture',up);
  const noScroll=(e:TouchEvent)=>{if(phaseRef.current==='playing'&&e.cancelable)e.preventDefault();};el.addEventListener('touchmove',noScroll,opt);// no scroll, pull-to-refresh or page swipe steals a steer
  const noMenu=(e:Event)=>e.preventDefault();f.addEventListener('contextmenu',noMenu);
  if(process.env.NODE_ENV!=='production')(window as unknown as {__snake?:unknown}).__snake={get game(){return game.current;},get phase(){return phaseRef.current;},get loop(){return raf.current!==0;},perf:perf.current,size:size.current,get audio(){return audio.current;},get layout(){return view.current?.layout;}};
  return()=>{ro.disconnect();window.visualViewport?.removeEventListener('resize',fit);el.removeEventListener('pointerdown',down);el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up);el.removeEventListener('lostpointercapture',up);el.removeEventListener('touchmove',noScroll);f.removeEventListener('contextmenu',noMenu);
   if(raf.current)cancelAnimationFrame(raf.current);raf.current=0;view.current=null;game.current=null;audio.current?.dispose();audio.current=null;fitRef.current=()=>{};delete (window as unknown as {__snake?:unknown}).__snake;};
 },[]);
 /* ---- keys; looked away: pause (RotateLock sends the same blur when a phone is turned sideways) ---- */
 useEffect(()=>{
  const away=()=>pause(),hidden=()=>{if(document.hidden)pause();};
  const key=(e:KeyboardEvent)=>{if(e.target instanceof HTMLElement&&e.target.closest('button,input,select,textarea,a,dialog'))return;
   if(e.code==='Escape'||e.code==='KeyP'){e.preventDefault();if(phaseRef.current==='playing')pause();else if(phaseRef.current==='paused')resume();return;}
   const d=KEY_DIR[e.code];if(d!==undefined&&phaseRef.current==='playing'){e.preventDefault();if(!e.repeat)steer(d);}};
  window.addEventListener('blur',away);document.addEventListener('visibilitychange',hidden);window.addEventListener('keydown',key);
  return()=>{window.removeEventListener('blur',away);document.removeEventListener('visibilitychange',hidden);window.removeEventListener('keydown',key);};
 },[pause,resume,steer]);

 const streak=today?liveStreak(save,today):0,dailyToday=save.daily.day===today?save.daily:null,busy=entry.pending,call=CALLS[hud.call]??CALLS[0],callName=shapeName(call[0],call[1],call[2]);
 const live=phase==='playing'||phase==='paused',joined=hud.line.length,padOn=save.pad||coarse;
 useEffect(()=>{fitRef.current();},[padOn]);// the pitch makes room for the d-pad once it is in the page
 const tap=()=>{(audio.current??=createSnakeAudio()).unlock();audio.current.tap();};
 return <div className={`${styles.game} ${arcadeSkin.snake} ${comicRoot}`} data-game="snake" data-arcade-kind="snake" data-phase={phase} data-dash={hud.dash||undefined} data-pad={padOn||undefined}>
  <aside className={styles.side} data-side="left" aria-hidden="true">
   <ComicPanel tilt={-1.5} tone="paper" className={styles.sideRow}><Bean pos={POS.gk}/><span>Call the keeper first, then defenders, midfielders, forwards.</span></ComicPanel>
   <ComicPanel tilt={1} tone="sun" className={styles.sideRow}><b className={styles.sideShape}>4-3-3</b><span>The numbers count from the back. The keeper is never counted.</span></ComicPanel>
   <ComicPanel tilt={-.8} tone="teal"><b>Arrow keys or W A S D</b><br/>Turn early. You can line up two turns.</ComicPanel>
  </aside>
  <aside className={styles.side} data-side="right" aria-hidden="true">
   <ComicPanel tilt={1.2} tone="paper" className={styles.sideMedals}><b>Medals</b>{SN.medals.map((m,i)=><span key={m}><Medal level={i+1} on/>{MEDAL_NAMES[i]}<em>{m}</em></span>)}</ComicPanel>
   <ComicPanel tilt={-1} tone="red"><b>Mind the press</b><br/>A defender patrols the dashed lane. Cross just after they pass.</ComicPanel>
  </aside>
  <div className={styles.stage} ref={stage} data-snake-stage>
   <i ref={probe} className={styles.probe} aria-hidden="true"/>
   <canvas ref={bg} className={styles.scene} aria-hidden="true"/>
   <canvas ref={fg} className={styles.play} tabIndex={0} aria-label="Squad Snake pitch. Swipe or use the arrow keys to turn the captain."/>
   {live&&<div className={styles.sheet} data-snake-sheet data-joined={joined} aria-live="polite" aria-label={`Level ${hud.level}. ${joined} of 11 in the line. Coach’s call ${callName}.`}>
    <b className={styles.lv}>L{hud.level}</b>
    <span className={styles.slots}>{Array.from({length:SN.squad},(_,i)=>{const p=Number(hud.line[i]||0);return <i key={i} data-pos={p||undefined} style={p?{background:POS_COLOR[p]}:undefined}/>;})}</span>
    <span className={styles.call} data-snake-call={callName}><small>Coach</small>{callName}</span>
    <i className={styles.glove} data-on={hud.saves>0||undefined} title="Last-ditch save"/>
   </div>}
   {live&&hud.wait&&<div className={styles.hint} data-snake-hint aria-live="polite">
    <svg viewBox="0 0 64 40" width="64" height="40" aria-hidden="true"><path d="M6 30 Q26 30 44 14" fill="none" stroke="#231a2e" strokeWidth="3" strokeLinecap="round" strokeDasharray="5 4"/><path d="M38 8 L49 10 L45 21" fill="none" stroke="#231a2e" strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round"/><circle cx="8" cy="30" r="6.5" fill="#ffc83a" stroke="#231a2e" strokeWidth="3"/></svg>
    <b>{padOn?'Swipe or tap the arrows':'Swipe or use the arrow keys'}</b><small>to start your captain</small>
   </div>}
   {/* The d-pad (always on touch screens since Nov 11 2026; a setting on desktop): an inverted T of big inked keys docked under the pitch.
       It stays in the page while hidden so the pitch can be laid out around it. */}
   {padOn&&<div ref={padEl} className={styles.pad} data-snake-pad data-live={live||undefined} aria-hidden={!live||undefined}>
    {([[0,'Up','M12 4 L21 17 H3 Z'],[3,'Left','M4 12 L17 3 V21 Z'],[2,'Down','M12 20 L21 7 H3 Z'],[1,'Right','M20 12 L7 3 V21 Z']] as const).map(([d,name,path])=>
     <ComicButton key={d} data-dir={d} tabIndex={live?undefined:-1} aria-label={`Turn ${name.toLowerCase()}`} onPointerDown={e=>{e.preventDefault();steer(d);}}><svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true"><path d={path} fill="#231a2e" stroke="#231a2e" strokeWidth="1.5" strokeLinejoin="round"/></svg></ComicButton>)}
   </div>}
  </div>
  <ArcadeTopBar game="snake" className={styles.topBar} backTitle="Back to arcade" onBack={leave} value={live?hud.score:undefined} word="pts" bumpKey={hud.score} paused={phase==='paused'} canPause={live} onPause={()=>phase==='playing'?pause():resume()}/>
  {phase==='paused'&&<ArcadePauseCard game="snake" score={`${hud.score} pts · Level ${hud.level} · ${joined} of 11 in the line`} status={entry.message||undefined} onResume={resume} onExit={leave} onRestart={()=>{void start(run.current.daily);}} restartDisabled={busy} keys={[['Swipe','turn'],['Arrows','turn'],['P','pause']]}/>}
  {phase==='menu'&&<ComicCard label="Squad Snake" title="Squad Snake" badge="Build your eleven" badgeTone="teal" best={save.best>0?`Best ${save.best}`:undefined} data-snake-card="start">
   <ol className={styles.order} aria-label="Call the squad in this order">
    {[POS.gk,POS.def,POS.mid,POS.fwd].map(p=><li key={p}><span><Bean pos={p} size={38}/><b style={{background:POS_COLOR[p]}}>{POS_LABEL[p]}</b></span></li>)}
   </ol>
   <p className={styles.learn}>{coarse?'Swipe or tap the arrows':'Swipe or use the arrow keys'} to turn your captain. The kick-off waits for your first move. Call the keeper, then defenders, midfielders and forwards. Eleven make a <b>Full Squad</b>: build the coach’s shape for double points.</p>
   <ul className={styles.album} aria-label="Shapes you have built" data-snake-album>{SHAPES.map((sh,i)=><li key={sh} data-on={(save.shapes>>i&1)===1||undefined}>{sh}</li>)}</ul>
   <div className={styles.chips}>
    <ComicStat value={save.best||'–'} label="Best"/>
    <ComicStat value={<span className={styles.medalRow}>{[1,2,3,4].map(l=><Medal key={l} level={l} on={save.medal>=l}/>)}</span>} label={save.medal?MEDAL_NAMES[save.medal-1]:'No medal yet'}/>
    <ComicStat value={streak} label={streak===1?'Day in a row':'Days in a row'} tone={streak>0?'sun':undefined} data-snake-streak={streak}/>
   </div>
   {entry.message&&<p className={styles.status} role="status">{entry.message}</p>}
   <div className={styles.actions}>
    <ComicButton variant={dailyFirst?'paper':'primary'} wide disabled={busy} onClick={()=>{void start(false);}} data-snake-play autoFocus={!dailyFirst}>Play</ComicButton>
    <ComicButton variant={dailyFirst?'primary':'teal'} wide disabled={busy} onClick={()=>{void start(true);}} data-snake-daily autoFocus={dailyFirst}>Daily Squad<small>{dailyToday?.counted?`Today’s best ${dailyToday.best} · practice`:'Same squad list for everyone today'}</small></ComicButton>
    <ComicButton size="small" onClick={()=>{tap();setScores(true);}} data-snake-scores>Scores</ComicButton>
    {!coarse&&<ComicButton size="small" aria-pressed={save.pad} onClick={()=>{tap();setPad(!save.pad);}} data-snake-padtoggle>{save.pad?'D-pad: on':'D-pad: off'}</ComicButton>}
   </div>
  </ComicCard>}
  {phase==='over'&&result&&<ComicCard label="Full time" badge={result.daily?'Daily Squad':'Full time'} badgeTone={result.daily?'teal':'red'} best={result.daily?`Today ${result.settled.dailyBest}`:`Best ${result.settled.save.best}`} data-snake-card="results" data-snake-score={result.score}>
   <div className={styles.scoreRow}>
    <strong className={`${comicNumeral} ${styles.score}`} data-new-best={result.settled.newBest||undefined}>{result.score}</strong>
    {result.settled.newBest&&<ComicBurst word="New best!" size={17} tilt={7} className={styles.stamp}/>}
   </div>
   <div className={styles.medalRow} data-snake-medal={result.settled.medal} role="img" aria-label={result.settled.medal?`${MEDAL_NAMES[result.settled.medal-1]} medal`:'No medal this time'}>{[1,2,3,4].map(l=><Medal key={l} level={l} on={medalFor(result.score)>=l}/>)}<em>{result.settled.medal?MEDAL_NAMES[result.settled.medal-1]:'No medal yet'}</em></div>
   <ComicPanel tone="sun" tilt={-1.2} className={styles.near} data-snake-near>{result.near}</ComicPanel>
   <div className={styles.hsSlot} data-hs-slot/>
   <ComicPanel tone={result.hasShape?'teal':'paper'} flat className={styles.built} data-shape={result.hasShape||undefined}><small>{result.hasShape?'Best shape you built':'Your line'}</small><strong className={result.hasShape?comicNumeral:undefined} data-snake-built>{result.built}</strong>{result.called&&<em>Coach’s call x2</em>}</ComicPanel>
   <div className={styles.chips}>
    <ComicStat value={result.squads} label={result.squads===1?'Full Squad':'Full Squads'}/>
    <ComicStat value={result.level} label="Level"/>
    <ComicStat value={result.longest} label="Longest line"/>
    {result.daily&&<ComicStat value={result.settled.streak} label={result.settled.streak===1?'Day':'Days in a row'} tone="sun"/>}
   </div>
   <p className={styles.coach}>{result.coach}</p>
   <ComicPanel tone="paper" flat className={styles.fact} data-snake-fact><b>{result.settled.fact.title}</b>{result.settled.fact.line}</ComicPanel>
   {(result.coins>0||entry.message)&&<p className={styles.status} role="status">{entry.message||`+${result.coins} ${result.coins===1?'coin':'coins'}`}{result.daily&&!result.settled.dailyFirst&&!entry.message?' · practice run (your first run today is on the board)':''}</p>}
   <div className={styles.actions}>
    <ComicButton variant="primary" wide disabled={busy} onClick={()=>{void start(result.daily);}} data-snake-again autoFocus>Play again</ComicButton>
    <ComicButton size="small" disabled={busy} onClick={()=>{void start(!result.daily);}} data-snake-other>{result.daily?'Endless':'Daily Squad'}</ComicButton>
    <ComicButton size="small" onClick={()=>{tap();setScores(true);}}>Scores</ComicButton>
   </div>
  </ComicCard>}
  {board&&phase==='over'&&<HighScoreEntry game={board.game} score={board.score} detail={board.game==='snakedaily'?'Daily Squad: the same squad list for everyone today. Your first run counts.':'Points for team-mates called and Full Squads built.'} onClose={()=>setBoard(null)}/>}
  {scores&&<SquadSnakeScores daily={!!result?.daily} onClose={()=>setScores(false)}/>}
 </div>;
}
