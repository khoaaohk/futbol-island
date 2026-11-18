'use client';
/**
 * Clear the Box (Nov 17 2026, docs/arcade-aaa/clearbox-direction.md): the tap-out cabinet. Rules: lib/arcade/clearbox/core.ts (pure,
 * seeded). Drawing: view.ts (2D canvas, static pitch + an fg layer repainted only when something moves). Sound: audio.ts.
 * This shell owns the taps, the keys, the clock and the cards.
 * Heat: while a box is in play one requestAnimationFrame callback advances the box clock; the canvas repaints only while a runner,
 * bump, dust or slide is moving or the state changed (dirty), and the clock face is written straight to the DOM only when its tenth
 * changes. The start card, pause, results and a hidden tab run nothing. DPR cap 2.
 * Teaches (AGENTS.md): "Time your run. Make the space." A run only works into space; each bean that leaves makes space for others.
 */
import {useCallback,useEffect,useRef,useState} from 'react';
import dynamic from 'next/dynamic';
import {retryImport} from '@/lib/retryImport';
import {ArcadeTopBar} from '../arcade/ArcadeTopBar';
import {ArcadePauseCard} from '../arcade/ArcadePauseCard';
import {arcadeSkin} from './skins';
import {comicRoot,comicNumeral,ComicButton,ComicCard,ComicPanel,ComicStat,ComicBurst} from './comic';
import styles from './ClearBoxGame.module.css';
import {createClearBox,clearboxDailySeed,medalFor,CB,KIT,MEDAL_NAMES,type ClearBox,type BoxEvent} from '@/lib/arcade/clearbox/core';
import {createClearboxView,type ClearboxView} from '@/lib/arcade/clearbox/view';
import {createClearboxAudio,type ClearboxAudio} from '@/lib/arcade/clearbox/audio';
import {readClearboxSave,writeClearboxSave,settleClearbox,nearMissLine,coachLine,liveStreak,emptyClearboxSave,type ClearboxSave,type ClearboxSettled} from '@/lib/arcade/clearbox/save';
import {arcadeFeedback} from '@/lib/arcade/arcadeFeedback';
import {useArcadeEntry} from '@/lib/arcade/useArcadeEntry';
import {creditRun,arcadeCoinTarget} from '@/lib/arcade/arcadeWallet';
import {saveArcadeRecord} from '@/lib/arcade/arcadeRecords';
import {beginBoardSession} from '@/lib/arcade/boardClient';
import {noteLastScore} from '@/lib/arcade/lastScore';
import {localPlayDay} from '@/lib/town/dailyPlay';
const HighScoreEntry=dynamic(()=>retryImport(()=>import('../arcade/HighScoreEntry')),{ssr:false});
const ClearBoxScores=dynamic(()=>retryImport(()=>import('./ClearBoxScores')),{ssr:false});

type Phase='menu'|'playing'|'paused'|'over';
type Hud={score:number;level:number;whistles:number;left:number;clean:number};
type Result={score:number;daily:boolean;level:number;boxes:number;beans:number;clean:number;fouls:number;why:''|'fouls'|'clock';settled:ClearboxSettled;near:string;coach:string;coins:number};
type Word={id:number;text:string;pts:number;x:number;y:number;tone:'sun'|'red'|'teal'|'paper'};
export const CLEARBOX_COIN_REASON='Clear the Box: beans cleared';

/** The start card's picture: a bean running out of a chalk box, past a defender. */
function BoxArt(){
 return <svg className={styles.art} viewBox="0 0 220 70" aria-hidden="true">
  <rect x="4" y="6" width="150" height="58" fill="#4aa868" stroke="#231a2e" strokeWidth="3"/>
  <rect x="12" y="12" width="134" height="46" fill="none" stroke="#f4fbef" strokeWidth="2.5"/>
  {[[40,35,KIT[1]],[80,35,'#2d3a5c']].map(([x,y,c],i)=><g key={i}><ellipse cx={x as number} cy={y as number} rx="15" ry="9" fill={c as string} stroke="#231a2e" strokeWidth="2.4"/><circle cx={(x as number)+(i?0:3)} cy={y as number} r="7" fill="#ffd9a8" stroke="#231a2e" strokeWidth="2"/></g>)}
  <g><ellipse cx="176" cy="35" rx="15" ry="9" fill={KIT[0]} stroke="#231a2e" strokeWidth="2.4" transform="rotate(90 176 35)"/><circle cx="179" cy="35" r="7" fill="#ffd9a8" stroke="#231a2e" strokeWidth="2"/><circle cx="182" cy="32" r="1.3" fill="#231a2e"/><circle cx="182" cy="38" r="1.3" fill="#231a2e"/></g>
  <path d="M196 35 L214 35 M206 27 L215 35 L206 43" fill="none" stroke="#231a2e" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"/>
  {[0,1,2].map(i=><circle key={i} cx={150-i*12} cy={35+(i%2?5:-4)} r={5-i} fill="#fff3d6" stroke="#231a2e" strokeWidth="1.6"/>)}
 </svg>;
}
function Medal({level,on}:{level:number;on:boolean}){return <span className={styles.medal} data-level={level} data-on={on||undefined} aria-hidden="true"><i/></span>;}
function Whistle({on}:{on:boolean}){return <svg className={styles.whistle} data-on={on||undefined} viewBox="0 0 30 22" aria-hidden="true"><path d="M3 9 h13 a8 8 0 1 1 -2 9 L3 14 Z" fill={on?'#ffc83a':'#cdb99a'} stroke="#231a2e" strokeWidth="2.4" strokeLinejoin="round"/><circle cx="21" cy="14" r="2.6" fill="#231a2e"/></svg>;}

export default function ClearBoxGame({onExit}:{onExit:()=>void}){
 const [phase,setPhase]=useState<Phase>('menu'),phaseRef=useRef<Phase>('menu');
 const [hud,setHud]=useState<Hud>({score:0,level:1,whistles:CB.whistles,left:0,clean:0}),hudRef=useRef(hud);
 const [save,setSave]=useState<ClearboxSave>(emptyClearboxSave),[result,setResult]=useState<Result|null>(null),[today,setToday]=useState('');
 const [board,setBoard]=useState<{score:number}|null>(null),[scores,setScores]=useState(false),[words,setWords]=useState<Word[]>([]),[hint,setHint]=useState(true);
 const entry=useArcadeEntry('clearbox');
 const stage=useRef<HTMLDivElement>(null),bg=useRef<HTMLCanvasElement>(null),fg=useRef<HTMLCanvasElement>(null),probe=useRef<HTMLElement>(null);
 const clockNum=useRef<HTMLElement>(null),clockBar=useRef<HTMLElement>(null),clockBox=useRef<HTMLDivElement>(null);
 const game=useRef<ClearBox|null>(null),view=useRef<ClearboxView|null>(null),audio=useRef<ClearboxAudio|null>(null);
 const raf=useRef(0),last=useRef(0),endAt=useRef(0),wordId=useRef(0),run=useRef({id:'',daily:false,day:'',done:true}),dirty=useRef(true),moving=useRef(false),shown=useRef({tenth:-1,sec:-1});
 const cursor=useRef<{x:number;y:number}|null>(null),reduced=useRef(false),frameRef=useRef<(t:number)=>void>(()=>{});

 const change=useCallback((p:Phase)=>{phaseRef.current=p;setPhase(p);},[]);
 useEffect(()=>{setSave(readClearboxSave());setToday(localPlayDay(Date.now()));},[]);
 const kick=useCallback(()=>{if(!raf.current&&phaseRef.current==='playing'){last.current=0;raf.current=requestAnimationFrame(t=>frameRef.current(t));}},[]);

 /* ---- the run's end: save, coins, board (once per run) ---- */
 const finish=useCallback(()=>{
  const g=game.current,r=run.current;if(!g||r.done)return;r.done=true;const s=g.state,score=s.score,stats={...s.stats};
  const settled=settleClearbox(readClearboxSave(),{score,daily:r.daily,day:r.day,stats,level:s.level});writeClearboxSave(settled.save);setSave(settled.save);
  if(!r.daily)saveArcadeRecord('clearbox',score);else noteLastScore('clearbox_daily',score,settled.dailyBest);
  const coins=arcadeCoinTarget('clearbox',{points:score});if(coins>0)void creditRun(r.id,'clearbox',coins,CLEARBOX_COIN_REASON);
  setResult({score,daily:r.daily,level:s.level,boxes:stats.boxes,beans:stats.beans,clean:stats.bestClean,fouls:stats.fouls,why:s.overWhy,settled,coins,
   near:nearMissLine({score,best:settled.previousBest,newBest:settled.newBest,daily:r.daily,stats}),coach:coachLine(stats,s.overWhy)});
  if(score>0&&(!r.daily||settled.dailyFirst))setBoard({score});
  if(settled.newMedal||settled.newBest){audio.current?.medal(Math.max(1,settled.medal));arcadeFeedback(null,'goal');}
  cursor.current=null;view.current?.clear();setWords([]);change('over');
 },[change]);

 const say=useCallback((text:string,pts:number,cell:number,tone:Word['tone'])=>{const v=view.current;if(!v)return;const L=v.layout;
  const x=cell>=0?L.bx+(cell%L.cols+.5)*L.cell:L.bx+L.bw/2,y=cell>=0?L.by+(Math.floor(cell/L.cols)+.5)*L.cell:L.by-L.cell*.15;// box words sit on the goal line, clear of the new box
  const w:Word={id:++wordId.current,text,pts,x:Math.max(80,Math.min(L.w-80,x)),y,tone};setWords(list=>[...list.filter(o=>Math.abs(o.y-w.y)>30||Math.abs(o.x-w.x)>120).slice(-2),w]);},[]);

 /* ---- one rules event: picture, sound, haptics, words ---- */
 const onEvent=useCallback((e:BoxEvent)=>{
  const a=audio.current,g=game.current;if(g)view.current?.onEvent(e,g);dirty.current=true;
  switch(e.type){
   case 'run':a?.run(e.a,g?g.state.stats.beans:0);setHint(false);break;
   case 'foul':a?.foul();arcadeFeedback(null,'slam');say(e.a>0?'FOUL!':'THIRD FOUL!',0,e.cell,'red');break;
   case 'turn':a?.turn();break;
   case 'box':{const c=g?.state.clean??0;a?.box(c);arcadeFeedback(null,'goal');say(c>=2?`CLEAN x${c}!`:'BOX CLEAR!',e.points,-1,c>=2?'teal':'sun');break;}
   case 'clean':break;// named on the box word
   case 'whistleBack':a?.whistleBack();say('WHISTLE BACK!',0,-1,'teal');break;
   case 'reset':say('NEW BOX!',0,-1,'paper');break;
   case 'level':a?.slide();break;
   case 'over':a?.over();arcadeFeedback(null,'slam');endAt.current=performance.now()+(reduced.current?500:1300);say(e.b===1?'TIME!':'FULL TIME!',0,-1,'paper');break;
  }
 },[say]);
 const sync=useCallback(()=>{const g=game.current;if(!g)return;g.drain(onEvent);const s=g.state,h=hudRef.current,left=s.box.beans.filter(b=>!b.out).length;
  if(h.score!==s.score||h.level!==s.level||h.whistles!==s.whistles||h.left!==left||h.clean!==s.clean){const n={score:s.score,level:s.level,whistles:s.whistles,left,clean:s.clean};hudRef.current=n;setHud(n);}kick();},[kick,onEvent]);

 /** The clock face, written straight to the DOM (no React render a frame). */
 const paintClock=useCallback(()=>{const g=game.current;if(!g)return;const s=g.state,tenth=Math.ceil(s.clock*10),sec=Math.ceil(s.clock);if(tenth===shown.current.tenth)return;shown.current.tenth=tenth;
  if(clockNum.current)clockNum.current.textContent=s.clock<5?(Math.max(0,tenth)/10).toFixed(1):String(sec);
  if(clockBar.current)clockBar.current.style.transform=`scaleX(${Math.max(0,Math.min(1,s.clock/s.box.time))})`;
  if(clockBox.current)clockBox.current.dataset.low=s.clock<5?'1':s.clock<10?'2':'';
  if(sec!==shown.current.sec){if(sec<=5&&sec>0&&shown.current.sec>sec&&!s.over)audio.current?.tick(sec);shown.current.sec=sec;}},[]);

 /* ---- the frame: the clock runs, the canvas repaints only when it must ---- */
 useEffect(()=>{frameRef.current=(now:number)=>{
  raf.current=0;const g=game.current,v=view.current;if(phaseRef.current!=='playing'||!g||!v)return;
  const dt=last.current?Math.min(.1,(now-last.current)/1000):0;last.current=now;
  if(!g.state.over){g.tick(dt);if(g.state.over)sync();}paintClock();
  let busy=moving.current;
  if(busy||dirty.current){busy=v.render(g,cursor.current);dirty.current=false;}moving.current=busy;
  if(g.state.over&&endAt.current&&now>=endAt.current){finish();return;}
  if(busy||!g.state.over||endAt.current)raf.current=requestAnimationFrame(t=>frameRef.current(t));
 };},[finish,paintClock,sync]);

 /* ---- start / restart: one tap, straight into a box ---- */
 const start=useCallback(async(daily:boolean)=>{
  (audio.current??=createClearboxAudio()).unlock();
  const id=await entry.enter();if(!id)return;
  const day=localPlayDay(Date.now()),seed=daily?clearboxDailySeed(day):1+Math.floor(Math.random()*2_000_000_000);
  const g=game.current=createClearBox({seed,daily});run.current={id,daily,day,done:false};
  if(!daily||readClearboxSave().daily.day!==day||!readClearboxSave().daily.counted)beginBoardSession('clearbox');
  view.current?.reset(g.state.box);endAt.current=0;cursor.current=null;shown.current={tenth:-1,sec:-1};setResult(null);setBoard(null);setWords([]);setToday(day);setHint(true);
  g.drain(()=>{});const n={score:0,level:1,whistles:CB.whistles,left:g.state.box.beans.length,clean:0};hudRef.current=n;setHud(n);dirty.current=true;
  change('playing');paintClock();kick();
 },[change,entry,kick,paintClock]);
 const pause=useCallback(()=>{if(phaseRef.current!=='playing')return;if(raf.current)cancelAnimationFrame(raf.current);raf.current=0;change('paused');},[change]);
 const resume=useCallback(()=>{if(phaseRef.current!=='paused')return;audio.current?.unlock();change('playing');dirty.current=true;kick();},[change,kick]);
 const leave=useCallback(()=>{if(raf.current)cancelAnimationFrame(raf.current);raf.current=0;onExit();},[onExit]);

 /* ---- canvases, size, taps ---- */
 useEffect(()=>{
  const el=stage.current,b=bg.current,f=fg.current;if(!el||!b||!f)return;
  reduced.current=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const v=view.current=createClearboxView(b,f,{reduced:reduced.current});let left=0,top=0;
  const fit=()=>{const r=el.getBoundingClientRect(),vv=window.visualViewport,cut=Math.max(0,Math.round(r.bottom-(vv?vv.offsetTop+vv.height:window.innerHeight)));el.style.setProperty('--cb-cut',`${cut}px`);
   left=r.left;top=r.top;v.resize(Math.max(1,r.width),Math.max(1,r.height-cut),Math.min(2,window.devicePixelRatio||1),(probe.current?.offsetHeight??56)+76,44);
   const g=game.current;if(g&&phaseRef.current!=='menu'){dirty.current=true;v.render(g,cursor.current);}};
  fit();const ro=new ResizeObserver(fit);ro.observe(el);window.visualViewport?.addEventListener('resize',fit);
  const down=(e:PointerEvent)=>{if(phaseRef.current!=='playing'||(e.pointerType==='mouse'&&e.button!==0)||(e.target instanceof Element&&e.target.closest('button')))return;
   const g=game.current;if(!g)return;e.preventDefault();audio.current?.unlock();if(g.state.over){endAt.current=1;kick();return;}
   {const rr=el.getBoundingClientRect();left=rr.left;top=rr.top;}
   const cell=v.cellAt(e.clientX-left,e.clientY-top);if(!cell)return;const k=g.beanAt(cell.x,cell.y);if(k<0)return;
   cursor.current=null;g.tap(k);sync();};
  const opt={passive:false} as const;el.addEventListener('pointerdown',down,opt);
  const noScroll=(e:TouchEvent)=>{if(phaseRef.current==='playing'&&e.cancelable)e.preventDefault();};el.addEventListener('touchmove',noScroll,opt);
  const noMenu=(e:Event)=>e.preventDefault();f.addEventListener('contextmenu',noMenu);
  if(process.env.NODE_ENV!=='production')(window as unknown as {__clearbox?:unknown}).__clearbox={get game(){return game.current;},get phase(){return phaseRef.current;},get loop(){return raf.current!==0;},get layout(){return view.current?.layout;},get audio(){return audio.current;},get stage(){return el.getBoundingClientRect();},sync:()=>sync()};
  return()=>{ro.disconnect();window.visualViewport?.removeEventListener('resize',fit);el.removeEventListener('pointerdown',down);el.removeEventListener('touchmove',noScroll);f.removeEventListener('contextmenu',noMenu);
   if(raf.current)cancelAnimationFrame(raf.current);raf.current=0;v.dispose();view.current=null;game.current=null;audio.current?.dispose();audio.current=null;delete (window as unknown as {__clearbox?:unknown}).__clearbox;};
 },[kick,sync]);

 /* ---- keys: arrows move a cursor over the box, Enter or Space taps that bean; P / Escape pause; looked away: pause ---- */
 useEffect(()=>{
  const away=()=>pause(),hidden=()=>{if(document.hidden)pause();};
  const key=(e:KeyboardEvent)=>{if(e.target instanceof HTMLElement&&e.target.closest('button,input,select,textarea,a,dialog'))return;
   if(e.code==='Escape'||e.code==='KeyP'){e.preventDefault();if(phaseRef.current==='playing')pause();else if(phaseRef.current==='paused')resume();return;}
   const g=game.current;if(phaseRef.current!=='playing'||!g)return;audio.current?.unlock();
   if(g.state.over){if(e.code==='Enter'||e.code==='Space'){e.preventDefault();endAt.current=1;kick();}return;}
   const bx=g.state.box,mv:Record<string,[number,number]>={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1],KeyA:[-1,0],KeyD:[1,0],KeyW:[0,-1],KeyS:[0,1]};
   if(mv[e.code]){e.preventDefault();const c=cursor.current??{x:Math.floor(bx.w/2),y:Math.floor(bx.h/2)};if(cursor.current){c.x=Math.max(0,Math.min(bx.w-1,c.x+mv[e.code][0]));c.y=Math.max(0,Math.min(bx.h-1,c.y+mv[e.code][1]));}
    cursor.current={x:Math.min(bx.w-1,c.x),y:Math.min(bx.h-1,c.y)};dirty.current=true;kick();return;}
   if((e.code==='Enter'||e.code==='Space')&&cursor.current){e.preventDefault();const c=cursor.current;if(c.x>=bx.w||c.y>=bx.h){cursor.current={x:Math.min(bx.w-1,c.x),y:Math.min(bx.h-1,c.y)};return;}
    const k=g.beanAt(c.x,c.y);if(k>=0){const lv=g.state.level;g.tap(k);if(g.state.level!==lv)cursor.current={x:Math.floor(g.state.box.w/2),y:Math.floor(g.state.box.h/2)};sync();}}
  };
  window.addEventListener('blur',away);document.addEventListener('visibilitychange',hidden);window.addEventListener('keydown',key);
  return()=>{window.removeEventListener('blur',away);document.removeEventListener('visibilitychange',hidden);window.removeEventListener('keydown',key);};
 },[kick,pause,resume,sync]);

 const streak=today?liveStreak(save,today):0,dailyToday=save.daily.day===today?save.daily:null,busy=entry.pending,live=phase==='playing'||phase==='paused';
 const tap=()=>{(audio.current??=createClearboxAudio()).unlock();audio.current.tap();};
 const best=save.best,gap=best>0&&hud.score<best?best-hud.score:0;
 return <div className={`${styles.game} ${arcadeSkin.clearbox} ${comicRoot}`} data-game="clearbox" data-arcade-kind="clearbox" data-phase={phase}>
  <aside className={styles.side} data-side="left" aria-hidden="true">
   <ComicPanel tilt={-1.5} tone="paper"><b>Tap a bean</b><br/>It runs out the way its arrow points. Nobody may stand in its lane.</ComicPanel>
   <ComicPanel tilt={1} tone="red"><b>Foul!</b><br/>A bean that bumps into someone costs a whistle. Three fouls and the game is over.</ComicPanel>
   <ComicPanel tilt={-.8} tone="teal"><b>Keys</b><br/>Arrows move the box cursor. Enter sends that bean.</ComicPanel>
  </aside>
  <aside className={styles.side} data-side="right" aria-hidden="true">
   <ComicPanel tilt={1.2} tone="paper" className={styles.sideMedals}><b>Medals</b>{CB.medals.map((m,i)=><span key={m}><Medal level={i+1} on/>{MEDAL_NAMES[i]}<em>{m}</em></span>)}</ComicPanel>
   <ComicPanel tilt={-1} tone="sun"><b>Clean box</b><br/>No foul in a box: the box bonus grows. Three clean boxes win a whistle back.</ComicPanel>
   <ComicPanel tilt={.8} tone="paper"><b>Turners</b><br/>From box 5, beans with a yellow badge turn a quarter each time a bean leaves.</ComicPanel>
  </aside>
  <div className={styles.stage} ref={stage} data-clearbox-stage>
   <i ref={probe} className={styles.probe} aria-hidden="true"/>
   <canvas ref={bg} className={styles.scene} aria-hidden="true"/>
   <canvas ref={fg} className={styles.play} tabIndex={0} aria-label="Clear the Box. Tap a bean whose lane is free; it runs out of the box. Or use the arrow keys and Enter."/>
   {live&&<div className={styles.strip} data-clearbox-hud aria-label={`Box ${hud.level}. ${hud.left} beans left. ${hud.whistles} whistles.`}>
    <b className={styles.lv}><small>Box</small>{hud.level}</b>
    <span className={styles.whistles} data-clearbox-whistles={hud.whistles} aria-label={`${hud.whistles} whistles left`}>{Array.from({length:CB.whistles},(_,i)=><Whistle key={i} on={i<hud.whistles}/>)}</span>
    <span className={styles.stripItem}><small>Left</small>{hud.left}</span>
    <div className={styles.clock} ref={clockBox} data-clearbox-clock><b ref={clockNum} className={comicNumeral}>{30}</b><small>sec</small><i className={styles.clockTrack}><i ref={clockBar} className={styles.clockBar}/></i></div>
   </div>}
   {live&&<p className={styles.foot} data-clearbox-foot>{hint&&hud.level===1?'Tap a bean with a free lane':<>{gap>0?<>To best <b>{gap}</b></>:<>Best <b>{Math.max(best,hud.score)}</b></>}{hud.clean>=2&&<span className={styles.streak} key={hud.clean}>Clean x{hud.clean}</span>}</>}</p>}
   <div className={styles.words} aria-live="polite">{words.map(w=><span key={w.id} className={styles.word} style={{left:w.x,top:w.y}} onAnimationEnd={()=>setWords(l=>l.filter(x=>x.id!==w.id))}>
    <ComicBurst word={w.text} size={w.text.length>10?17:22} tilt={w.id%2?-4:3} color={w.tone==='red'?'#f0452e':w.tone==='teal'?'#19b5a5':w.tone==='paper'?'#fff3d6':'#ffc83a'} fill={w.tone==='red'?'#fff3d6':undefined}/>
    {w.pts>0&&<b className={`${comicNumeral} ${styles.pts}`}>+{w.pts}</b>}</span>)}</div>
  </div>
  <ArcadeTopBar game="clearbox" className={styles.topBar} backTitle="Back to arcade" onBack={leave} value={live?hud.score:undefined} word="pts" bumpKey={hud.score} paused={phase==='paused'} canPause={live} onPause={()=>phase==='playing'?pause():resume()}/>
  {phase==='paused'&&<ArcadePauseCard game="clearbox" score={`${hud.score} pts · Box ${hud.level} · ${hud.whistles} whistles`} status={entry.message||undefined} onResume={resume} onExit={leave} onRestart={()=>{void start(run.current.daily);}} restartDisabled={busy} keys={[['Tap','send a bean'],['Arrows','move'],['Enter','send'],['P','pause']]}/>}
  {phase==='menu'&&<ComicCard label="Clear the Box" title="Clear the Box" badge="Time your run" badgeTone="red" best={best>0?`Best ${best}`:undefined} data-clearbox-card="start">
   <BoxArt/>
   <p className={styles.learn}>The box is crowded. Tap a bean and it runs out the way its arrow points. If someone stands in its lane it is a <b>foul</b>. Three fouls, or the clock runs out, and the game ends.</p>
   <div className={styles.chips}>
    <ComicStat value={best||'–'} label="Best"/>
    <ComicStat value={<span className={styles.medalRow}>{[1,2,3].map(l=><Medal key={l} level={l} on={save.medal>=l}/>)}</span>} label={save.medal?MEDAL_NAMES[save.medal-1]:'No medal yet'}/>
    <ComicStat value={streak} label={streak===1?'Day in a row':'Days in a row'} tone={streak>0?'sun':undefined} data-clearbox-streakdays={streak}/>
   </div>
   {entry.message&&<p className={styles.status} role="status">{entry.message}</p>}
   <div className={styles.actions}>
    <ComicButton variant="primary" wide disabled={busy} onClick={()=>{void start(false);}} data-clearbox-play autoFocus>Play</ComicButton>
    <ComicButton variant="teal" wide disabled={busy} onClick={()=>{void start(true);}} data-clearbox-daily>Daily Drill<small>{dailyToday?.counted?`Today’s best ${dailyToday.best} · practice`:'Same boxes for everyone today'}</small></ComicButton>
    <ComicButton size="small" onClick={()=>{tap();setScores(true);}} data-clearbox-scores>Scores</ComicButton>
   </div>
  </ComicCard>}
  {phase==='over'&&result&&<ComicCard label="Full time" badge={result.daily?'Daily Drill':result.why==='clock'?'Time up':'Full time'} badgeTone={result.daily?'teal':'red'} best={result.daily?`Today ${result.settled.dailyBest}`:`Best ${result.settled.save.best}`} data-clearbox-card="results" data-clearbox-score={result.score}>
   <div className={styles.scoreRow}>
    <strong className={`${comicNumeral} ${styles.score}`} data-new-best={result.settled.newBest||undefined}>{result.score}</strong>
    {result.settled.newBest&&<ComicBurst word="New best!" size={17} tilt={7} className={styles.stamp}/>}
   </div>
   <div className={styles.medalRow} data-clearbox-medal={result.settled.medal} role="img" aria-label={result.settled.medal?`${MEDAL_NAMES[result.settled.medal-1]} medal`:'No medal this time'}>{[1,2,3].map(l=><Medal key={l} level={l} on={medalFor(result.score)>=l}/>)}<em>{result.settled.medal?MEDAL_NAMES[result.settled.medal-1]:'No medal yet'}</em></div>
   <ComicPanel tone="sun" tilt={-1.2} className={styles.near} data-clearbox-near>{result.near}</ComicPanel>
   <div className={styles.hsSlot} data-hs-slot/>
   <div className={styles.actions}>
    <ComicButton variant="primary" wide disabled={busy} onClick={()=>{void start(result.daily);}} data-clearbox-again autoFocus>Play again</ComicButton>
    <ComicButton size="small" disabled={busy} onClick={()=>{void start(!result.daily);}} data-clearbox-other>{result.daily?'Endless':'Daily Drill'}</ComicButton>
    <ComicButton size="small" onClick={()=>{tap();setScores(true);}}>Scores</ComicButton>
   </div>
   <div className={styles.chips}>
    <ComicStat value={result.boxes} label="Boxes"/>
    <ComicStat value={result.beans} label="Beans out"/>
    <ComicStat value={result.clean} label="Clean streak"/>
    <ComicStat value={result.fouls} label="Fouls"/>
   </div>
   <p className={styles.coach}>{result.coach}</p>
   <ComicPanel tone="paper" flat className={styles.fact} data-clearbox-fact><b>{result.settled.tip.title}</b>{result.settled.tip.line}</ComicPanel>
   {(result.coins>0||entry.message)&&<p className={styles.status} role="status">{entry.message||`+${result.coins} ${result.coins===1?'coin':'coins'}`}{result.daily&&!result.settled.dailyFirst&&!entry.message?' · practice run (your first run today is on the board)':''}</p>}
  </ComicCard>}
  {board&&phase==='over'&&<HighScoreEntry game="clearbox" score={board.score} detail="Points for beans cleared and boxes finished with time left. Clean boxes in a row score more." onClose={()=>setBoard(null)}/>}
  {scores&&<ClearBoxScores onClose={()=>setScores(false)}/>}
 </div>;
}
