'use client';
/**
 * Roll It In (Nov 17 2026, docs/arcade-aaa/rollball-direction.md): you are the football. Rules and physics: lib/arcade/rollball/core.ts
 * (pure, seeded, fixed 1/120 s step). Drawing: view.ts (three.js, one canvas). Sound: audio.ts. This shell owns the thumb stick, the
 * keys, the loop and the cards.
 * Heat: one requestAnimationFrame callback only while a level is in play, capped at 60 frames a second (a 120 Hz screen draws every
 * other frame); the start card, pause, results and a hidden tab draw nothing. The HUD is written to React state only when a shown
 * number changes; the clock face is written straight to the DOM when its second changes. Pixel ratio capped in the view.
 * Teaches (AGENTS.md): "Look before you roll. Plan the next touch." Every puzzle is read first, then played.
 */
import React,{useCallback,useEffect,useRef,useState} from 'react';
import dynamic from 'next/dynamic';
import {retryImport} from '@/lib/retryImport';
import {ArcadeTopBar} from '../arcade/ArcadeTopBar';
import {ArcadePauseCard} from '../arcade/ArcadePauseCard';
import {arcadeSkin} from './skins';
import {comicRoot,comicNumeral,ComicButton,ComicCard,ComicPanel,ComicStat,ComicBurst} from './comic';
import styles from './RollBallGame.module.css';
import {createRollBall,rollballDailySeed,scriptBot,medalFor,RB,MEDAL_NAMES,THEMES,type RollBall,type RollEvent} from '@/lib/arcade/rollball/core';
import type {RollballView} from '@/lib/arcade/rollball/view';
import {createRollballAudio,type RollballAudio} from '@/lib/arcade/rollball/audio';
import {readRollballSave,writeRollballSave,settleRollball,nearMissLine,coachLine,liveStreak,emptyRollballSave,type RollballSave,type RollballSettled} from '@/lib/arcade/rollball/save';
import {useFloatingStick} from '@/lib/arcade/useFloatingStick';
import {arcadeFeedback} from '@/lib/arcade/arcadeFeedback';
import {useArcadeEntry} from '@/lib/arcade/useArcadeEntry';
import {creditRun,arcadeCoinTarget} from '@/lib/arcade/arcadeWallet';
import {saveArcadeRecord} from '@/lib/arcade/arcadeRecords';
import {beginBoardSession} from '@/lib/arcade/boardClient';
import {noteLastScore} from '@/lib/arcade/lastScore';
import {localPlayDay} from '@/lib/town/dailyPlay';
const HighScoreEntry=dynamic(()=>retryImport(()=>import('../arcade/HighScoreEntry')),{ssr:false});
const RollBallScores=dynamic(()=>retryImport(()=>import('./RollBallScores')),{ssr:false});

type Phase='menu'|'playing'|'paused'|'over';
type Hud={score:number;level:number;hearts:number;stars:number;key:boolean;streak:number;mod:number;mods:number;name:string;theme:string};
type Result={score:number;daily:boolean;level:number;levels:number;stars:number;streak:number;falls:number;why:''|'water'|'clock';settled:RollballSettled;near:string;coach:string;coins:number};
type Word={id:number;text:string;pts:number;x:number;y:number;fx:number;fy:number;tone:'sun'|'red'|'teal'|'paper'};
/** One-line lessons, each shown once a run the first time the thing happens (no text walls). */
const TIPS={cone:'Roll faster to knock the cones.',sweep:'Wait for a gap. Then go.',boost:'Arrows make you fast.',heavy:'Push the crate onto it.',clock:'Hurry. The clock is low.'} as const;
export const ROLLBALL_COIN_REASON='Roll It In: levels rolled';
const FRAME_MS=1000/61;

/** The start card's picture: the ball on a ramp over the water, a plate and a gate. */
function RollArt(){
 return <svg className={styles.art} viewBox="0 0 220 80" aria-hidden="true">
  <rect x="0" y="58" width="220" height="22" fill="#3aa6c7"/>{[18,70,130,186].map(x=><path key={x} d={`M${x} 68 q6 -4 12 0`} fill="none" stroke="#fff3d6" strokeWidth="2.4" strokeLinecap="round"/>)}
  <path d="M6 58 L6 46 L70 46 L118 26 L118 58 Z" fill="#5fb54a" stroke="#231a2e" strokeWidth="3" strokeLinejoin="round"/><path d="M6 46 L6 58 M70 46 L70 58" stroke="#231a2e" strokeWidth="2"/>
  <path d="M146 58 L146 34 L214 34 L214 58 Z" fill="#b9b2a6" stroke="#231a2e" strokeWidth="3"/><ellipse cx="166" cy="34" rx="12" ry="3.4" fill="#ffc83a" stroke="#231a2e" strokeWidth="2.2"/>
  <rect x="190" y="12" width="7" height="22" fill="#f4f0e6" stroke="#231a2e" strokeWidth="2.4"/><path d="M190 18 l7 -4 M190 25 l7 -4 M190 32 l7 -4" stroke="#f0452e" strokeWidth="2.4"/>
  <g transform="translate(128 18)"><circle r="12" fill="#fffdf6" stroke="#231a2e" strokeWidth="3"/><path d="M0 -5 L5 -1.5 L3 5 L-3 5 L-5 -1.5 Z" fill="#231a2e"/><path d="M0 -5 L0 -12 M5 -1.5 L11.5 -4 M3 5 L7 10 M-3 5 L-7 10 M-5 -1.5 L-11.5 -4" stroke="#231a2e" strokeWidth="1.6"/></g>
  <path d="M100 26 q8 -12 18 -10" fill="none" stroke="#231a2e" strokeWidth="2.4" strokeDasharray="3 4" strokeLinecap="round"/>
 </svg>;
}
function Medal({level,on}:{level:number;on:boolean}){return <span className={styles.medal} data-level={level} data-on={on||undefined} aria-hidden="true"><i/></span>;}
function Heart({on}:{on:boolean}){return <svg className={styles.heart} data-on={on||undefined} viewBox="0 0 24 22" aria-hidden="true"><path d="M12 20 C4 14 2 10 2 7 a5 5 0 0 1 10 -1 a5 5 0 0 1 10 1 c0 3 -2 7 -10 13 Z" fill={on?'#f0452e':'#cdb99a'} stroke="#231a2e" strokeWidth="2.4" strokeLinejoin="round"/></svg>;}

export default function RollBallGame({onExit}:{onExit:()=>void}){
 const [phase,setPhase]=useState<Phase>('menu'),phaseRef=useRef<Phase>('menu');
 const [hud,setHud]=useState<Hud>({score:0,level:1,hearts:RB.hearts,stars:0,key:false,streak:0,mod:0,mods:1,name:'',theme:THEMES[0]}),hudRef=useRef(hud);
 const [save,setSave]=useState<RollballSave>(emptyRollballSave),[result,setResult]=useState<Result|null>(null),[today,setToday]=useState('');
 const [board,setBoard]=useState<{score:number}|null>(null),[scores,setScores]=useState(false),[words,setWords]=useState<Word[]>([]),[hint,setHint]=useState(true),[failed,setFailed]=useState(false),[tip,setTip]=useState<{id:number;text:string}|null>(null);
 const entry=useArcadeEntry('rollball');
 const stage=useRef<HTMLDivElement>(null),cv=useRef<HTMLCanvasElement>(null),clockNum=useRef<HTMLElement>(null),clockBox=useRef<HTMLDivElement>(null);
 const game=useRef<RollBall|null>(null),view=useRef<RollballView|null>(null),audio=useRef<RollballAudio|null>(null);
 const raf=useRef(0),last=useRef(0),drawn=useRef(0),endAt=useRef(0),wordId=useRef(0),run=useRef({id:'',daily:false,day:'',done:true}),shownSec=useRef(-1),holdUntil=useRef(0),told=useRef(new Set<string>()),amb=useRef(-1);
 const viewReady=useRef<{promise:Promise<void>;done:()=>void}>(null as unknown as {promise:Promise<void>;done:()=>void});if(!viewReady.current){let done=()=>{};const promise=new Promise<void>(r=>{done=r;});viewReady.current={promise,done};}
 const stick=useRef({x:0,y:0}),keys=useRef(new Set<string>()),reduced=useRef(false),frameRef=useRef<(t:number)=>void>(()=>{});

 const change=useCallback((p:Phase)=>{phaseRef.current=p;setPhase(p);if(p!=='playing')audio.current?.quiet();},[]);
 useEffect(()=>{setSave(readRollballSave());setToday(localPlayDay(Date.now()));},[]);
 const kick=useCallback(()=>{if(!raf.current&&phaseRef.current==='playing'){last.current=0;raf.current=requestAnimationFrame(t=>frameRef.current(t));}},[]);

 /* ---- the run's end: save, coins, board (once per run) ---- */
 const finish=useCallback(()=>{
  const g=game.current,r=run.current;if(!g||r.done)return;r.done=true;const s=g.state,score=s.score,stats={...s.stats};
  const settled=settleRollball(readRollballSave(),{score,daily:r.daily,day:r.day,stats,level:s.level});writeRollballSave(settled.save);setSave(settled.save);
  if(!r.daily)saveArcadeRecord('rollball',score);else noteLastScore('rollball_daily',score,settled.dailyBest);
  const coins=arcadeCoinTarget('rollball',{points:score});if(coins>0)void creditRun(r.id,'rollball',coins,ROLLBALL_COIN_REASON);
  setResult({score,daily:r.daily,level:s.level,levels:stats.levels,stars:stats.stars,streak:stats.bestStreak,falls:stats.falls,why:s.overWhy,settled,coins,
   near:nearMissLine({score,best:settled.previousBest,newBest:settled.newBest,daily:r.daily,stats}),coach:coachLine(stats,s.overWhy)});
  if(score>0&&(!r.daily||settled.dailyFirst))setBoard({score});
  if(settled.newMedal||settled.newBest){audio.current?.medal(Math.max(1,settled.medal));arcadeFeedback(null,'goal');}
  setWords([]);change('over');
 },[change]);

 const say=useCallback((text:string,pts:number,x:number,y:number,z:number,tone:Word['tone'])=>{const v=view.current,el=stage.current;if(!v||!el)return;const p=v.project(x,y+.6,z),W=el.clientWidth,H=el.clientHeight;
  const wx=Math.max(80,Math.min(W-80,p.behind?W/2:p.x)),wy=Math.max(150,Math.min(H-170,p.behind?H*.4:p.y)),w:Word={id:++wordId.current,text,pts,x:wx,y:wy,fx:W/2-wx,fy:34-wy,tone};setWords(list=>[...list.filter(o=>Math.abs(o.y-w.y)>34||Math.abs(o.x-w.x)>120).slice(-2),w]);},[]);

 /** A lesson line over the foot, once a run. */
 const teach=useCallback((k:keyof typeof TIPS)=>{if(told.current.has(k))return;told.current.add(k);setTip({id:++wordId.current,text:TIPS[k]});},[]);
 /** Hit-stop: the rules hold still for a few frames on a big hit (the picture keeps drawing). */
 const hold=useCallback((ms:number)=>{if(!reduced.current)holdUntil.current=performance.now()+ms;},[]);
 /* ---- one rules event: picture, sound, haptics, words ---- */
 const onEvent=useCallback((e:RollEvent)=>{
  const a=audio.current,g=game.current;view.current?.onEvent(e);
  switch(e.type){
   case 'land':a?.land(e.a,g?.state.ball.surf);if(e.a>7)arcadeFeedback(null,'tap');break;
   case 'wall':a?.knock(e.b,g?.state.ball.surf);break;
   case 'wobble':a?.wobble(e.b);arcadeFeedback(null,'tap');say(e.b>.78?'SO CLOSE!':'FASTER!',0,e.x,e.y,e.z,'paper');teach('cone');break;
   case 'boost':a?.boost();arcadeFeedback(null,'tap');say('ZOOM!',0,e.x,e.y,e.z,'sun');teach('boost');break;
   case 'sweep':a?.sweep();arcadeFeedback(null,'slam');say('OOF!',0,e.x,e.y+.6,e.z,'red');teach('sweep');break;
   case 'close':a?.close();arcadeFeedback(null,'goal');say('JUST IN TIME!',0,e.x,e.y,e.z,'teal');break;
   case 'respawn':a?.respawn();break;
   case 'bump':a?.bumper();arcadeFeedback(null,'tap');say('BOING!',0,e.x,e.y,e.z,'paper');break;
   case 'splash':if(e.a<0){a?.splash();arcadeFeedback(null,'slam');say('SPLASH!',0,e.x,0,e.z,'red');}else a?.splash();break;
   case 'plate':{const pl=g?.state.world.plates[e.a],P=g?.state.world.mods[g.state.mod];let lit=0;if(g&&P)for(let i=P.s0;i<P.s1;i++)if(g.state.world.sig[i])lit++;a?.plate(e.b>0,1+lit*2);/* each signal lit in a puzzle rings a step higher */
    if(pl&&e.b>0&&(pl.kind==='latch'||e.b===2))say('CLICK!',0,e.x,e.y,e.z,'sun');else if(pl&&pl.kind==='heavy'&&e.b===0){say('TOO LIGHT',0,e.x,e.y,e.z,'paper');teach('heavy');}setHint(false);break;}
   case 'order':a?.plate(true,e.b*2);say(`${e.b}!`,0,e.x,e.y,e.z,'teal');break;
   case 'wrong':a?.wrong();say('WRONG ORDER',0,e.x,e.y,e.z,'red');break;
   case 'gate':a?.gate(e.b===1);if(e.b===1){const r=g?.state.world.recvs[e.a];say(r?.kind==='drain'?'LOW TIDE!':r?.kind==='fan'?'WHOOSH!':r?.kind==='bridge'?'BRIDGE UP!':'OPEN!',0,e.x,e.y,e.z,'teal');}break;
   case 'cone':a?.cone(g?.state.stats.knocks??1);arcadeFeedback(null,'goal');hold(70);say('POW!',0,e.x,e.y,e.z,'sun');break;
   case 'switch':a?.lever(e.b===1);arcadeFeedback(null,'tap');break;
   case 'key':a?.key();say('GOT THE WHISTLE!',0,e.x,e.y,e.z,'sun');break;
   case 'lock':a?.lock(e.b===1);if(e.b===1)say('UNLOCKED!',0,e.x,e.y,e.z,'teal');else say('NEED THE WHISTLE',0,e.x,e.y,e.z,'paper');break;
   case 'star':a?.star(g?.state.stats.stars??0);say('STAR!',e.points,e.x,e.y,e.z,'sun');break;
   case 'module':if(e.points>0){a?.module();}break;
   case 'goal':{const st=g?.state.streak??0;a?.goal(st);arcadeFeedback(null,'goal');hold(110);say(g&&!g.state.lostThisLevel&&st>=2?`GOAL! x${st}`:'GOAL!',e.points,e.x,e.y,e.z,'sun');break;}
   case 'heart':a?.heart();arcadeFeedback(null,'slam');break;
   case 'timeout':say('TIME!',0,g?.state.ball.x??0,1,g?.state.ball.z??0,'red');break;
   case 'level':setHint(false);break;
   case 'over':a?.over();endAt.current=performance.now()+(reduced.current?600:1400);break;
  }
 },[say]);
 const sync=useCallback(()=>{const g=game.current;if(!g)return;g.drain(onEvent);const s=g.state,h=hudRef.current,P=s.world.mods[s.mod],mods=s.world.mods.length-1;
  const n:Hud={score:s.score,level:s.level,hearts:s.hearts,stars:s.stats.stars,key:s.ball.key,streak:s.streak,mod:Math.min(s.mod+1,mods),mods,name:P.def.id==='goal'?'Roll it in!':P.def.name,theme:THEMES[P.def.id==='goal'&&s.mod>0?s.world.mods[s.mod-1].def.theme:P.def.theme]};
  if(n.score!==h.score||n.level!==h.level||n.hearts!==h.hearts||n.stars!==h.stars||n.key!==h.key||n.streak!==h.streak||n.mod!==h.mod||n.name!==h.name){hudRef.current=n;setHud(n);}},[onEvent]);
 const paintClock=useCallback(()=>{const g=game.current;if(!g)return;const s=g.state,sec=s.clockMax?Math.ceil(s.clock):-1;if(sec===shownSec.current)return;shownSec.current=sec;
  if(clockBox.current)clockBox.current.dataset.on=sec>=0?'1':'';if(clockNum.current)clockNum.current.textContent=sec>=0?String(sec):'';if(clockBox.current)clockBox.current.dataset.low=sec>=0&&sec<=10?'1':'';
  if(sec>0&&sec<=5&&!s.over)audio.current?.tick();if(sec===10)teach('clock');},[teach]);

 /* ---- the frame: input in, fixed physics steps, one draw (60 a second at most) ---- */
 useEffect(()=>{frameRef.current=(now:number)=>{
  raf.current=0;const g=game.current,v=view.current;if(phaseRef.current!=='playing'||!g||!v)return;
  if(process.env.NODE_ENV!=='production'&&(window as unknown as {__rollball?:{manual?:boolean}}).__rollball?.manual)return;// dev: frames are stepped by hand (media capture)
  if(drawn.current&&now-drawn.current<FRAME_MS){raf.current=requestAnimationFrame(t=>frameRef.current(t));return;}drawn.current=now;
  const dt=last.current?Math.min(.1,(now-last.current)/1000):0;last.current=now;
  const k=keys.current,kx=(k.has('ArrowLeft')||k.has('KeyA')?1:0)-(k.has('ArrowRight')||k.has('KeyD')?1:0),kz=(k.has('ArrowUp')||k.has('KeyW')?1:0)-(k.has('ArrowDown')||k.has('KeyS')?1:0);
  // the camera looks along +z, so screen right is world -x
  if(kx||kz)g.input(kx,kz);else g.input(-stick.current.x,-stick.current.y);
  if(process.env.NODE_ENV!=='production'){const h=(window as unknown as {__rollball?:{useBot?:boolean;botTick?:()=>void}}).__rollball;if(h?.useBot)h.botTick?.();}// dev: the scripted bot plays (scripts/check-arcade-audio.cjs, browser checks)
  g.tick(now<holdUntil.current?0:dt);sync();paintClock();
  const b=g.state.ball,P=g.state.world.mods[g.state.mod],th=P.def.id==='goal'&&g.state.mod>0?g.state.world.mods[g.state.mod-1].def.theme:P.def.theme;if(th!==amb.current){amb.current=th;audio.current?.ambience(th);}
  audio.current?.rolling(Math.hypot(b.vx,b.vz),b.surf,!b.air&&g.state.respawnIn<=0,Math.abs(b.vy));
  v.render(g.state,now);
  if(g.state.over&&endAt.current&&now>=endAt.current){finish();return;}
  raf.current=requestAnimationFrame(t=>frameRef.current(t));
 };},[finish,paintClock,sync]);

 /* ---- start / restart: one tap, straight onto the pitch ---- */
 const start=useCallback(async(daily:boolean)=>{
  (audio.current??=createRollballAudio()).unlock();
  const id=await entry.enter();if(!id)return;
  if(!view.current)await Promise.race([viewReady.current.promise,new Promise(r=>setTimeout(r,8000))]);// the pitch (three.js) may still be loading
  if(!view.current){setFailed(true);return;}
  const day=localPlayDay(Date.now()),seed=daily?rollballDailySeed(day):1+Math.floor(Math.random()*2_000_000_000);
  const g=game.current=createRollBall({seed,daily});run.current={id,daily,day,done:false};
  if(!daily||readRollballSave().daily.day!==day||!readRollballSave().daily.counted)beginBoardSession('rollball');
  endAt.current=0;shownSec.current=-2;holdUntil.current=0;told.current.clear();amb.current=-1;setTip(null);setResult(null);setBoard(null);setWords([]);setToday(day);setHint(true);g.drain(()=>{});
  view.current.snap(g.state);hudRef.current={...hudRef.current,score:-1};sync();change('playing');paintClock();kick();
 },[change,entry,kick,paintClock,sync]);
 const pause=useCallback(()=>{if(phaseRef.current!=='playing')return;if(raf.current)cancelAnimationFrame(raf.current);raf.current=0;change('paused');},[change]);
 const resume=useCallback(()=>{if(phaseRef.current!=='paused')return;audio.current?.unlock();amb.current=-1;change('playing');kick();},[change,kick]);
 const leave=useCallback(()=>{if(raf.current)cancelAnimationFrame(raf.current);raf.current=0;onExit();},[onExit]);
 const retry=useCallback(()=>{audio.current?.unlock();audio.current?.tap();game.current?.retry();sync();},[sync]);

 /* ---- the thumb: a floating stick anywhere on the stage (also a mouse drag) ---- */
 const pad=useFloatingStick((x,y)=>{stick.current.x=x;stick.current.y=y;if(x||y){audio.current?.unlock();if(game.current?.state.over)endAt.current=1;}},()=>phaseRef.current==='playing');

 /* ---- canvas and size; the view (three.js) is loaded with the game ---- */
 useEffect(()=>{
  const el=stage.current,c=cv.current;if(!el||!c)return;let alive=true,ro:ResizeObserver|null=null,fit=()=>{};
  reduced.current=matchMedia('(prefers-reduced-motion: reduce)').matches;
  void retryImport(()=>import('@/lib/arcade/rollball/view')).then(({createRollballView})=>{if(!alive)return;
   let v:RollballView;try{v=createRollballView(c,{reduced:reduced.current,mobile:matchMedia('(pointer: coarse)').matches});}catch{setFailed(true);return;}view.current=v;viewReady.current.done();
   fit=()=>{const r=el.getBoundingClientRect();v.resize(Math.max(1,r.width),Math.max(1,r.height),Math.min(2,window.devicePixelRatio||1));if(game.current&&phaseRef.current!=='menu')v.render(game.current.state,performance.now());};
   fit();ro=new ResizeObserver(fit);ro.observe(el);window.visualViewport?.addEventListener('resize',fit);
  }).catch(()=>setFailed(true));
  const noScroll=(e:TouchEvent)=>{if(phaseRef.current==='playing'&&e.cancelable)e.preventDefault();};el.addEventListener('touchmove',noScroll,{passive:false});
  const noMenu=(e:Event)=>e.preventDefault();c.addEventListener('contextmenu',noMenu);
  if(process.env.NODE_ENV!=='production')(window as unknown as {__rollball?:unknown}).__rollball={get game(){return game.current;},get phase(){return phaseRef.current;},get loop(){return raf.current!==0;},get view(){return view.current;},get audio(){return audio.current;},sync:()=>sync(),scriptBot,useBot:false,botTick:undefined,manual:false,advance:(dt:number,now:number)=>{const g=game.current,v=view.current,h=(window as unknown as {__rollball:{useBot:boolean;botTick?:()=>void}}).__rollball;if(!g||!v)return;if(h.useBot)h.botTick?.();g.tick(dt);sync();v.render(g.state,now);},load:(plan:number[],level=1)=>{const g=game.current=createRollBall({seed:7,fixPlan:plan});g.state.level=level;view.current?.snap(g.state);sync();}};
  return()=>{alive=false;ro?.disconnect();window.visualViewport?.removeEventListener('resize',fit);el.removeEventListener('touchmove',noScroll);c.removeEventListener('contextmenu',noMenu);
   if(raf.current)cancelAnimationFrame(raf.current);raf.current=0;view.current?.dispose();view.current=null;game.current=null;audio.current?.dispose();audio.current=null;delete (window as unknown as {__rollball?:unknown}).__rollball;};
 },[sync]);

 /* ---- keys: arrows / WASD roll, R starts the puzzle again, P / Escape pause; looked away: pause ---- */
 useEffect(()=>{
  const away=()=>{keys.current.clear();pause();},hidden=()=>{if(document.hidden)pause();};
  const MOVE=new Set(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyA','KeyD','KeyW','KeyS']);
  const down=(e:KeyboardEvent)=>{if(e.target instanceof HTMLElement&&e.target.closest('button,input,select,textarea,a,dialog'))return;
   if(e.code==='Escape'||e.code==='KeyP'){e.preventDefault();if(phaseRef.current==='playing')pause();else if(phaseRef.current==='paused')resume();return;}
   if(phaseRef.current!=='playing')return;audio.current?.unlock();
   if(MOVE.has(e.code)){e.preventDefault();keys.current.add(e.code);if(game.current?.state.over)endAt.current=1;return;}
   if(e.code==='KeyR'){e.preventDefault();retry();}
  };
  const up=(e:KeyboardEvent)=>{keys.current.delete(e.code);};
  window.addEventListener('blur',away);document.addEventListener('visibilitychange',hidden);window.addEventListener('keydown',down);window.addEventListener('keyup',up);
  return()=>{window.removeEventListener('blur',away);document.removeEventListener('visibilitychange',hidden);window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);};
 },[pause,resume,retry]);

 const streak=today?liveStreak(save,today):0,dailyToday=save.daily.day===today?save.daily:null,busy=entry.pending,live=phase==='playing'||phase==='paused';
 const tap=()=>{(audio.current??=createRollballAudio()).unlock();audio.current.tap();};
 const best=save.best,gap=best>0&&hud.score<best?best-hud.score:0;
 return <div className={`${styles.game} ${arcadeSkin.rollball} ${comicRoot}`} data-game="rollball" data-arcade-kind="rollball" data-phase={phase}>
  <aside className={styles.side} data-side="left" aria-hidden="true">
   <ComicPanel tilt={-1.5} tone="paper"><b>You are the ball</b><br/>Press anywhere and push to roll. Let go and the ball slows down.</ComicPanel>
   <ComicPanel tilt={1} tone="sun"><b>Plates and gates</b><br/>Roll onto a plate to open a gate. Some plates need a crate on them. Some close again.</ComicPanel>
   <ComicPanel tilt={-1.2} tone="paper"><b>Cones</b><br/>Hit cones fast. The ring glows when you are fast enough.</ComicPanel>
   <ComicPanel tilt={-.8} tone="teal"><b>Keys</b><br/>Arrows or WASD roll. R starts the puzzle again. P pauses.</ComicPanel>
  </aside>
  <aside className={styles.side} data-side="right" aria-hidden="true">
   <ComicPanel tilt={1.2} tone="paper" className={styles.sideMedals}><b>Medals</b>{RB.medals.map((m,i)=><span key={m}><Medal level={i+1} on/>{MEDAL_NAMES[i]}<em>{m}</em></span>)}</ComicPanel>
   <ComicPanel tilt={-1} tone="red"><b>Splash!</b><br/>Fall into the water and you lose a heart. Three hearts, then the game ends.</ComicPanel>
   <ComicPanel tilt={.8} tone="paper"><b>Surfaces</b><br/>Sand and mud are slow. Wet tiles are slippery. Planks are fast but narrow.</ComicPanel>
  </aside>
  <div className={styles.stage} ref={stage} data-rollball-stage>
   <canvas ref={cv} className={styles.scene} tabIndex={0} aria-label="Roll It In. You are the football. Press and push anywhere to roll, or use the arrow keys."/>
   {live&&<div className={styles.zone} aria-hidden="true" data-rollball-stick-zone {...pad.zone}/>}
   {live&&<div className={`touch-controls ${styles.movement}`}><div ref={pad.joy} className="joystick" data-floating="true" data-rollball-stick role="group" aria-label="Roll: press anywhere and push"><i className="joystick-contact" aria-hidden="true"><i className="joystick-contact-arc"/></i><span/></div></div>}
   {live&&<div className={styles.strip} data-rollball-hud aria-label={`Level ${hud.level}. Puzzle ${hud.mod} of ${hud.mods}. ${hud.hearts} hearts. ${hud.stars} stars.`}>
    <b className={styles.lv}><small>Level</small>{hud.level}</b>
    <span className={styles.hearts} data-rollball-hearts={hud.hearts} aria-label={`${hud.hearts} hearts left`}>{Array.from({length:RB.hearts},(_,i)=><Heart key={i} on={i<hud.hearts}/>)}</span>
    <span className={styles.stripItem}><small>Stars</small>{hud.stars}</span>
    {hud.key&&<span className={styles.keyChip} data-rollball-key>Whistle</span>}
    <div className={styles.clock} ref={clockBox} data-rollball-clock><b ref={clockNum} className={comicNumeral}/><small>sec</small></div>
   </div>}
   {live&&<p className={styles.puzzle} data-rollball-puzzle key={`${hud.level}-${hud.mod}`}><b>{hud.name}</b><small>{hud.mod}/{hud.mods} · {hud.theme}</small></p>}
   {live&&<button type="button" className={styles.retry} onClick={retry} data-rollball-retry aria-label="Start this puzzle again">Retry</button>}
   {live&&<p className={styles.foot} data-rollball-foot>{hint&&hud.level===1?'Push anywhere to roll':<>{gap>0?<>To best <b>{gap}</b></>:<>Best <b>{Math.max(best,hud.score)}</b></>}{hud.streak>=2&&<span className={styles.streak} key={hud.streak}>Streak x{hud.streak}</span>}</>}</p>}
   <div className={styles.words} aria-live="polite">{words.map(w=><span key={w.id} className={styles.word} style={{left:w.x,top:w.y}} onAnimationEnd={e=>{if(e.target===e.currentTarget)setWords(l=>l.filter(x=>x.id!==w.id));}}>
    <ComicBurst word={w.text} size={w.text.length>10?17:22} tilt={w.id%2?-4:3} color={w.tone==='red'?'#f0452e':w.tone==='teal'?'#19b5a5':w.tone==='paper'?'#fff3d6':'#ffc83a'} fill={w.tone==='red'?'#fff3d6':undefined}/>
    </span>)}{words.map(w=>w.pts>0&&<b key={`p${w.id}`} className={`${comicNumeral} ${styles.pts}`} data-rollball-pts style={{left:w.x,top:w.y+30,'--fx':`${w.fx}px`,'--fy':`${w.fy-30}px`} as React.CSSProperties}>+{w.pts}</b>)}</div>
   {live&&tip&&<p className={styles.tip} key={tip.id} data-rollball-tip role="status" onAnimationEnd={()=>setTip(null)}>{tip.text}</p>}
  </div>
  <ArcadeTopBar game="rollball" className={styles.topBar} backTitle="Back to arcade" onBack={leave} value={live?hud.score:undefined} word="pts" bumpKey={hud.score} paused={phase==='paused'} canPause={live} onPause={()=>phase==='playing'?pause():resume()}/>
  {phase==='paused'&&<ArcadePauseCard game="rollball" score={`${hud.score} pts · Level ${hud.level} · ${hud.hearts} hearts`} status={entry.message||undefined} onResume={resume} onExit={leave} onRestart={()=>{void start(run.current.daily);}} restartDisabled={busy} keys={[['Push','roll'],['Arrows','roll'],['R','retry puzzle'],['P','pause']]}/>}
  {phase==='menu'&&<ComicCard label="Roll It In" title="Roll It In" badge="Look before you roll" badgeTone="teal" best={best>0?`Best ${best}`:undefined} data-rollball-card="start">
   <RollArt/>
   <p className={styles.learn}>You are the football. Roll onto plates, knock down cones and carry the whistle to open the way. Then roll it into the <b>goal</b>. Fall in the water and you lose a heart.</p>
   <div className={styles.chips}>
    <ComicStat value={best||'–'} label="Best"/>
    <ComicStat value={<span className={styles.medalRow}>{[1,2,3].map(l=><Medal key={l} level={l} on={save.medal>=l}/>)}</span>} label={save.medal?MEDAL_NAMES[save.medal-1]:'No medal yet'}/>
    <ComicStat value={streak} label={streak===1?'Day in a row':'Days in a row'} tone={streak>0?'sun':undefined} data-rollball-streakdays={streak}/>
   </div>
   {(entry.message||failed)&&<p className={styles.status} role="status">{failed?'The pitch could not load on this device.':entry.message}</p>}
   <div className={styles.actions}>
    <ComicButton variant="primary" wide disabled={busy} onClick={()=>{void start(false);}} data-rollball-play autoFocus>Play</ComicButton>
    <ComicButton variant="teal" wide disabled={busy} onClick={()=>{void start(true);}} data-rollball-daily>Daily Roll<small>{dailyToday?.counted?`Today’s best ${dailyToday.best} · practice`:'Same puzzles for everyone today'}</small></ComicButton>
    <ComicButton size="small" onClick={()=>{tap();setScores(true);}} data-rollball-scores>Scores</ComicButton>
   </div>
  </ComicCard>}
  {phase==='over'&&result&&<ComicCard label="Full time" badge={result.daily?'Daily Roll':result.why==='clock'?'Time up':'Full time'} badgeTone={result.daily?'teal':'red'} best={result.daily?`Today ${result.settled.dailyBest}`:`Best ${result.settled.save.best}`} data-rollball-card="results" data-rollball-score={result.score}>
   <div className={styles.scoreRow}>
    <strong className={`${comicNumeral} ${styles.score}`} data-new-best={result.settled.newBest||undefined}>{result.score}</strong>
    {result.settled.newBest&&<ComicBurst word="New best!" size={17} tilt={7} className={styles.stamp}/>}
   </div>
   <div className={styles.medalRow} data-rollball-medal={result.settled.medal} role="img" aria-label={result.settled.medal?`${MEDAL_NAMES[result.settled.medal-1]} medal`:'No medal this time'}>{[1,2,3].map(l=><Medal key={l} level={l} on={medalFor(result.score)>=l}/>)}<em>{result.settled.medal?MEDAL_NAMES[result.settled.medal-1]:'No medal yet'}</em></div>
   <ComicPanel tone="sun" tilt={-1.2} className={styles.near} data-rollball-near>{result.near}</ComicPanel>
   <div className={styles.hsSlot} data-hs-slot/>
   <div className={styles.actions}>
    <ComicButton variant="primary" wide disabled={busy} onClick={()=>{void start(result.daily);}} data-rollball-again autoFocus>Play again</ComicButton>
    <ComicButton size="small" disabled={busy} onClick={()=>{void start(!result.daily);}} data-rollball-other>{result.daily?'Endless':'Daily Roll'}</ComicButton>
    <ComicButton size="small" onClick={()=>{tap();setScores(true);}}>Scores</ComicButton>
   </div>
   <div className={styles.chips}>
    <ComicStat value={result.levels} label="Goals"/>
    <ComicStat value={result.stars} label="Stars"/>
    <ComicStat value={result.streak} label="Best streak"/>
    <ComicStat value={result.falls} label="Splashes"/>
   </div>
   <p className={styles.coach}>{result.coach}</p>
   <ComicPanel tone="paper" flat className={styles.fact} data-rollball-fact><b>{result.settled.tip.title}</b>{result.settled.tip.line}</ComicPanel>
   {(result.coins>0||entry.message)&&<p className={styles.status} role="status">{entry.message||`+${result.coins} ${result.coins===1?'coin':'coins'}`}{result.daily&&!result.settled.dailyFirst&&!entry.message?' · practice run (your first run today is on the board)':''}</p>}
  </ComicCard>}
  {board&&phase==='over'&&<HighScoreEntry game="rollball" score={board.score} detail="Points for puzzles solved, goals scored under par time and stars. Levels in a row without losing a heart score more." onClose={()=>setBoard(null)}/>}
  {scores&&<RollBallScores onClose={()=>setScores(false)}/>}
 </div>;
}
