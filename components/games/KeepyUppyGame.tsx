'use client';
/**
 * Keepy-Uppy Beat (Nov 21 2026, docs/arcade-aaa/keepyuppy-direction.md): a rhythm game about juggling a football. Rules:
 * lib/arcade/keepyuppy/core.ts (pure, deterministic, driven by song time). Charts and music patterns: charts.ts. Drawing: view.ts
 * (canvas 2D, comic print). Sound: audio.ts (the music is scheduled on the AudioContext clock). This shell owns the thumbs, the keys,
 * the clock and the cards.
 * Thumbs: four pads along the bottom (left foot, thigh, head, right foot); the whole column above a pad counts. Tap when the ball
 * lands in the ring. Tricks: hold the head pad for a Neck Stall, swipe on a foot pad for Around the World (a circle), Heel Flick (up)
 * and Crossover (sideways). Multi-touch safe: every pointer is its own touch.
 * Keys: D F J K (or left, down, up, right) = left foot, thigh, head, right foot; hold Space with a foot key for a swipe; hold the key
 * for a stall. P / Escape pauses.
 * Time: a tap is judged at its own event time on the song clock (the audio clock when sound is on, the performance clock when it is
 * off), minus the speaker latency the browser reports, minus the player's own offset from the one-time "tap when the ball lands" check.
 * Heat: the loop runs only while a ball is in the air (start card, stage cards, pause, results and a hidden tab draw nothing, and the
 * AudioContext is suspended on pause). The moving canvas is drawn at up to 60 a second on phones too (a rhythm game's cues must move
 * smoothly; the cost of a frame is measured and written in the direction doc); reduced motion draws 30. HUD state at most 10 a second.
 * Teaches (AGENTS.md): a soft touch buys time, eyes on the ball, both feet, juggling rhythm, the names of real tricks.
 */
import React,{useCallback,useEffect,useRef,useState} from 'react';
import dynamic from 'next/dynamic';
import {retryImport} from '@/lib/retryImport';
import {ArcadeTopBar} from '../arcade/ArcadeTopBar';
import {ArcadePauseCard} from '../arcade/ArcadePauseCard';
import {BoardDialog} from '../arcade/BoardsPanel';
import {arcadeSkin} from './skins';
import {comicRoot,comicNumeral,ComicButton,ComicCard,ComicPanel,ComicStat,ComicBurst,ComicMedalTrack} from './comic';
import styles from './KeepyUppyGame.module.css';
import {createKeepy,keepyDailySeed,dailyPick,calibOffset,medalFor,timeOfBeat,beatAtTime,trickInfo,twistInfo,clean,KU,TRICKS,MEDAL_NAMES,KU_FEATS,type Keepy,type KuEvent,type TrickId,type TwistId,type Foot,type Grade,type Dir,type FeatId} from '@/lib/arcade/keepyuppy/core';
import {TRACKS} from '@/lib/arcade/keepyuppy/charts';
import {createKeepyView,type KeepyView} from '@/lib/arcade/keepyuppy/view';
import {createKeepyAudio,type KeepyAudio} from '@/lib/arcade/keepyuppy/audio';
import {createSongClock} from '@/lib/arcade/keepyuppy/music';
import {frameCapSlot} from '@/lib/town/frameCap';
import {readKeepySave,writeKeepySave,settleKeepy,nearMissLine,coachLine,emptyKeepySave,totalStars,trackOpen,cardFull,cardsFull,type KeepySave,type KeepySettled} from '@/lib/arcade/keepyuppy/save';
import {arcadeFeedback} from '@/lib/arcade/arcadeFeedback';
import {useArcadeEntry} from '@/lib/arcade/useArcadeEntry';
import {creditRun,arcadeCoinTarget} from '@/lib/arcade/arcadeWallet';
import {saveArcadeRecord} from '@/lib/arcade/arcadeRecords';
import {beginBoardSession} from '@/lib/arcade/boardClient';
import {noteLastScore} from '@/lib/arcade/lastScore';
import {localPlayDay} from '@/lib/town/dailyPlay';
const HighScoreEntry=dynamic(()=>retryImport(()=>import('../arcade/HighScoreEntry')),{ssr:false});
const KeepyUppyScores=dynamic(()=>retryImport(()=>import('./KeepyUppyScores')),{ssr:false});

type Phase='menu'|'playing'|'paused'|'over';
/** A run is a short list of stages: the one-time tap-timing check, a 10-second lesson for each trick not learned yet, then the track. */
type Stage={kind:'calib'}|{kind:'lesson';trick:TrickId}|{kind:'track'};
type Hud={score:number;lives:number;weak:boolean;fast:boolean};
type Result={score:number;daily:boolean;track:number;twist:TwistId|'';stars:number;acc:number;weak:number;out:boolean;sweet:number;bestCombo:number;tricks:number;settled:KeepySettled;line:string;coach:string;coins:number};
type Word={id:number;text:string;pts:number;tone:'sun'|'red'|'teal'|'paper'};
export const KEEPYUPPY_COIN_REASON='Keepy-Uppy Beat: run';
/** a swipe is this many px of thumb travel; the default tap offset (touch screens answer a little late) in seconds */
const SWIPE=24,DEFAULT_OFFSET=.02;
const swipeDir=(dx:number,dy:number):Dir=>dy<0&&-dy>=Math.abs(dx)*.7?'up':'side';

function Stars({n,big,label}:{n:number;big?:boolean;label?:string}){return <span className={styles.stars} data-big={big||undefined} role="img" aria-label={label??`${n} of 3 stars`}>{[0,1,2].map(i=><i key={i} data-on={i<n||undefined}/>)}</span>;}
/** The start card's picture: the bean with the ball on its way up, boots in the pad colours. */
function JuggleArt(){
 return <svg className={styles.art} viewBox="0 0 220 84" aria-hidden="true">
  <rect x="0" y="70" width="220" height="14" fill="#62b85f" stroke="#231a2e" strokeWidth="3"/>
  <path d="M132 20q18 6 20 30" fill="none" stroke="#231a2e" strokeWidth="3" strokeDasharray="2 7" strokeLinecap="round"/>
  <path d="M96 62V32a14 14 0 0 1 28 0v30q0 6-14 6t-14-6z" fill="#19b5a5" stroke="#231a2e" strokeWidth="3"/><path d="M96 46V32a14 14 0 0 1 28 0v14z" fill="#f2b98a" stroke="#231a2e" strokeWidth="3"/><path d="M96 30h28" stroke="#8f78b8" strokeWidth="5"/>
  <circle cx="105" cy="38" r="2.6" fill="#231a2e"/><circle cx="116" cy="38" r="2.6" fill="#231a2e"/>
  <path d="M104 66v6M118 64l14-8 12 6" fill="none" stroke="#231a2e" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"/><path d="M104 66v6M118 64l14-8 12 6" fill="none" stroke="#f2b98a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
  <ellipse cx="103" cy="74" rx="9" ry="5" fill="#19b5a5" stroke="#231a2e" strokeWidth="2.5"/><ellipse cx="148" cy="61" rx="9" ry="5" fill="#f0452e" stroke="#231a2e" strokeWidth="2.5" transform="rotate(-20 148 61)"/>
  <circle cx="130" cy="16" r="9" fill="#fffaf0" stroke="#231a2e" strokeWidth="2.5"/><path d="M127 12l5 0 2 4-4 3-4-3z" fill="#231a2e"/>
  <path d="M40 30l6-10 6 10M34 46h24M70 22l5 5-5 5M176 34l8-4M178 46h10M172 22l6-7" stroke="#231a2e" strokeWidth="3" strokeLinecap="round" fill="none"/>
 </svg>;
}

export default function KeepyUppyGame({onExit}:{onExit:()=>void}){
 const [phase,setPhase]=useState<Phase>('menu'),phaseRef=useRef<Phase>('menu');
 const blank:Hud={score:0,lives:KU.lives,weak:false,fast:false};
 const [hud,setHud]=useState<Hud>(blank),hudRef=useRef(hud),hudAt=useRef(0);
 const [save,setSave]=useState<KeepySave>(emptyKeepySave),[result,setResult]=useState<Result|null>(null),[today,setToday]=useState('');
 const [board,setBoard]=useState<{score:number}|null>(null),[scores,setScores]=useState(false),[book,setBook]=useState(false),[words,setWords]=useState<Word[]>([]);
 /** the stage card that is up (-1 = none: a ball is in the air), the track picked on the start card, the foot question, a note under the HUD */
 const [tip,setTip]=useState(-1),[pick,setPick]=useState(-1),[askFoot,setAskFoot]=useState<null|{daily:boolean;solo:boolean}>(null),[note,setNote]=useState(''),[drops,setDrops]=useState(0),[held,setHeld]=useState('');
 const entry=useArcadeEntry('keepyuppy');
 const stage=useRef<HTMLDivElement>(null),focusEl=useRef<HTMLDivElement>(null),bgEl=useRef<HTMLCanvasElement>(null),fgEl=useRef<HTMLCanvasElement>(null);
 const game=useRef<Keepy|null>(null),view=useRef<KeepyView|null>(null),audio=useRef<KeepyAudio|null>(null);
 const clock=useRef(createSongClock(()=>performance.now()/1000,()=>audio.current?.songTime()??null));
 const raf=useRef(0),draws=useRef(0),cost=useRef({n:0,ms:0,max:0}),slot=useRef(0),frameMs=useRef(1000/60),endAt=useRef(0),wordId=useRef(0),pressed=useRef(0),lat=useRef(0),off=useRef(DEFAULT_OFFSET);
 const run=useRef<{id:string;daily:boolean;day:string;track:number;twist:TwistId|'';strong:Foot;stages:Stage[];at:number;done:boolean;solo:boolean;lessons:TrickId[];tricks:Partial<Record<TrickId,number>>}>({id:'',daily:false,day:'',track:0,twist:'',strong:'R',stages:[],at:0,done:true,solo:false,lessons:[],tricks:{}});
 const pauseRef=useRef<()=>void>(()=>{});const ptrs=useRef(new Map<number,{lane:number;sx:number;sy:number;swiped:boolean}>()),keysDown=useRef(new Set<string>()),reduced=useRef(false),frameRef=useRef<(t:number)=>void>(()=>{});

 const change=useCallback((p:Phase)=>{phaseRef.current=p;setPhase(p);},[]);
 useEffect(()=>{const s=readKeepySave();setSave(s);setToday(localPlayDay(Date.now()));},[]);
 useEffect(()=>{if(!note)return;const t=setTimeout(()=>setNote(''),5000);return()=>clearTimeout(t);},[note]);
 const kick=useCallback(()=>{if(!raf.current&&phaseRef.current==='playing'){slot.current=0;raf.current=requestAnimationFrame(t=>frameRef.current(t));}},[]);
 const say=useCallback((text:string,pts:number,tone:Word['tone'])=>{const w:Word={id:++wordId.current,text,pts,tone};setWords(list=>[...list.slice(-1),w]);},[]);
 /** song time for judging: the event's own time on the song clock, less the speaker latency and the player's offset */
 const judgeTime=useCallback((stamp:number)=>{const p=performance.now(),ms=stamp>0&&Math.abs(p-stamp)<400?stamp:p;return clock.current.at(ms/1000)-lat.current-off.current;},[]);

 /* ---- the run's end: save, coins, board (once per run) ---- */
 const finish=useCallback(()=>{
  const g=game.current,r=run.current;if(!g||r.done)return;r.done=true;const s=g.state,score=s.score,stars=g.stars(),acc=Math.round(g.accuracy()*100),weak=g.weakScore();
  for(const id of Object.keys(s.tricks) as TrickId[])r.tricks[id]=(r.tricks[id]??0)+(s.tricks[id]??0);
  const before=readKeepySave(),settled=settleKeepy(before,{track:r.track,daily:r.daily,day:r.day,score,stars,acc,weak,out:s.out,tricks:r.tricks,feats:g.feats(r.daily),lessons:r.lessons});writeKeepySave(settled.save);setSave(settled.save);
  if(!r.daily)saveArcadeRecord('keepyuppy',score);else noteLastScore('keepyuppy_daily',stars,settled.save.daily.stars);
  const coins=arcadeCoinTarget('keepyuppy',{points:score});if(coins>0)void creditRun(r.id,'keepyuppy',coins,KEEPYUPPY_COIN_REASON);
  setResult({score,daily:r.daily,track:r.track,twist:r.twist,stars,acc,weak,out:s.out,sweet:s.counts.sweet,bestCombo:s.bestCombo,tricks:Object.values(r.tricks).reduce((a,b)=>a+(b??0),0),settled,coins,
   line:nearMissLine({daily:r.daily,out:s.out,stars,acc,track:r.track,opened:settled.opened,starsTotal:totalStars(settled.save),weak,weakBefore:settled.weakBefore,newBest:settled.newBest,score,best:settled.previousBest,medalBefore:before.medal}),coach:coachLine(s.counts,s.out)});
  if(score>0&&!r.daily)setBoard({score});
  if(settled.newMedal||settled.starsGained>0||settled.newCards.length)arcadeFeedback(null,'goal');
  audio.current?.rest();ptrs.current.clear();pressed.current=0;setWords([]);setNote('');setTip(-1);view.current?.clear();change('over');
 },[change]);

 /* ---- one rules event: sound, haptics, words ---- */
 const onEvent=useCallback((e:KuEvent)=>{
  const a=audio.current,v=view.current,g=game.current;if(!g)return;v?.onEvent(e,g,clock.current.now()-lat.current);
  switch(e.type){
   case 'hit':if(e.grade==='wrong')a?.knock();else a?.touch(e.lane,e.grade==='sweet');if(g.mode==='track'&&clean(e.grade as Grade))arcadeFeedback(null,'collect');break;
   case 'press':a?.touch(e.lane,e.grade==='sweet');break;
   case 'stray':a?.knock();break;
   case 'drop':a?.drop();if(g.mode==='track'){arcadeFeedback(null,'slam');setDrops(n=>n+1);}break;
   case 'trick':a?.trick();say(`${trickInfo(TRICKS[e.a].id).name.toUpperCase()}!`,e.points,'sun');if(g.mode==='track')arcadeFeedback(null,'combo');break;
   case 'life':a?.life();say('BALL BACK!',0,'teal');break;
   case 'combo':a?.combo(e.a);say(`${e.a} IN A ROW!`,0,e.a>=50?'red':'teal');arcadeFeedback(null,'perfect');break;
   case 'over':if(g.mode==='track'){a?.over(e.a===1,g.stars());if(e.a===0){a?.stopSong();say('BALL DOWN!',0,'paper');}else say(g.stars()>=3?'BRILLIANT!':'FULL TIME!',e.points,'sun');}
    endAt.current=performance.now()+(g.mode==='track'?(reduced.current?800:1500):500);break;
  }
 },[say]);

 /** A stage starts: the game, the scene, the clock at the count-in, the music. */
 const begin=useCallback((i:number)=>{
  const r=run.current,st=r.stages[i],a=audio.current,v=view.current;if(!st)return;a?.unlock();
  const g=game.current=createKeepy({strong:r.strong,track:r.track,twist:r.twist,lesson:st.kind==='lesson'?st.trick:undefined,calib:st.kind==='calib'}),c=g.chart;
  r.at=i;endAt.current=0;ptrs.current.clear();pressed.current=0;keysDown.current.clear();v?.setScene(r.track,r.strong);
  // the tap-timing check measures the raw offset; everything else uses the saved one
  const sv=readKeepySave();off.current=st.kind==='calib'?0:sv.calibrated?sv.offset/1000:DEFAULT_OFFSET;
  a?.hush(false);a?.startSong({music:g.track.music,bars:c.bars,mode:st.kind==='calib'?'click':st.kind==='lesson'?'drums':'full',timeOf:b=>timeOfBeat(c,b),beatAt:t=>beatAtTime(c,t)},c.start);
  clock.current.start(c.start);lat.current=a?.latency??0;
  const h={...blank,lives:g.state.lives};hudRef.current=h;setHud(h);setTip(-1);setWords([]);setDrops(0);setNote(st.kind==='calib'?'Tap any pad each time the ball lands in the ring.':st.kind==='lesson'?trickInfo(st.trick).how:'');
  kick();focusEl.current?.focus({preventScroll:true});
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[kick]);
 /** A lesson or the timing check is over: keep what it gave, show the next stage's card (the loop sleeps until it is read). */
 const nextStage=useCallback(()=>{
  const g=game.current,r=run.current,st=r.stages[r.at];if(!g||!st)return;audio.current?.rest();
  if(st.kind==='calib'){const ms=calibOffset(g.state.offsets),sv=readKeepySave();if(ms!==null){const n={...sv,offset:ms,calibrated:true};writeKeepySave(n);setSave(n);setHeld(`Timing set: ${ms>0?'+':''}${ms} ms.`);}else setHeld('Not enough taps. The usual timing is used. You can try again from the start card.');}
  if(st.kind==='lesson'){if(!r.lessons.includes(st.trick))r.lessons.push(st.trick);const landed=g.state.tricks[st.trick]??0;r.tricks[st.trick]=(r.tricks[st.trick]??0)+landed;setHeld(landed>0?`You landed it ${landed===1?'once':`${landed} times`}. It is in your Trick Book.`:'It will come. Watch the ring and try it in the track.');
   const sv=readKeepySave();if(!sv.seen.includes(st.trick)){const n={...sv,seen:[...sv.seen,st.trick]};writeKeepySave(n);setSave(n);}}
  ptrs.current.clear();pressed.current=0;setWords([]);setNote('');view.current?.clear();
  if(r.at+1<r.stages.length){r.at++;setTip(r.at);}else{r.done=true;game.current=null;view.current?.render(null,0);change('menu');}
 },[change]);

 /* ---- the loop: the song clock drives the rules; the music is scheduled 0.25 s ahead on the audio clock ---- */
 useEffect(()=>{frameRef.current=(now:number)=>{
  raf.current=0;const g=game.current,v=view.current;if(phaseRef.current!=='playing'||!g||!v)return;
  if(audio.current?.lost){pauseRef.current();return;}// the browser suspended the sound mid-song: pause (see audio.ts lost)
  const next=frameCapSlot(now,slot.current,frameMs.current);
  if(next<0){raf.current=requestAnimationFrame(t=>frameRef.current(t));return;}slot.current=next;
  const c0=performance.now(),song=clock.current.now(),t=song-lat.current;audio.current?.pump(song);
  if(!g.state.over){g.advance(t-off.current);g.drain(onEvent);}
  v.render(g,t,pressed.current);draws.current++;{const c=cost.current,ms=performance.now()-c0;c.n++;c.ms+=ms;if(ms>c.max)c.max=ms;}// frame cost (rules + music scheduling + draw) for scripts/check-keepyuppy-browser.cjs
  if(now-hudAt.current>100){const s=g.state,tr=g.track,bt=beatAtTime(g.chart,t),hh=hudRef.current,n:Hud={score:s.score,lives:s.lives,weak:g.mode==='track'&&!run.current.twist&&bt>=(tr.weak[0]-1)*4-2&&bt<tr.weak[1]*4,fast:g.mode==='track'&&bt>=g.chart.speedAt};
   if(n.score!==hh.score||n.lives!==hh.lives||n.weak!==hh.weak||n.fast!==hh.fast){hudAt.current=now;hudRef.current=n;setHud(n);}}
  if(g.state.over&&endAt.current&&now>=endAt.current){if(g.mode==='track')finish();else nextStage();return;}
  raf.current=requestAnimationFrame(t2=>frameRef.current(t2));
 };},[finish,nextStage,onEvent]);

 /* ---- start / restart ---- */
 const start=useCallback(async(daily:boolean,solo=false,want=-1)=>{
  (audio.current??=createKeepyAudio()).unlock();
  const sv=readKeepySave();if(!sv.strong){setAskFoot({daily,solo});return;}
  const day=localPlayDay(Date.now()),d=dailyPick(keepyDailySeed(day)),open=TRACKS.map((_,i)=>trackOpen(sv,i)),last=open.lastIndexOf(true);
  const track=solo?0:daily?d.track:want>=0&&open[want]?want:pick>=0&&open[pick]?pick:last,twist:TwistId|''=daily&&!solo?d.twist:'';
  const stages:Stage[]=[];if(solo||!sv.calibrated&&sv.plays===0)stages.push({kind:'calib'});
  if(!solo){const probe=createKeepy({strong:sv.strong,track,twist});for(const id of probe.chart.tricks)if(!sv.seen.includes(id))stages.push({kind:'lesson',trick:id});stages.push({kind:'track'});}
  let id='solo';if(!solo){const got=await entry.enter();if(!got)return;id=got;}
  run.current={id,daily:daily&&!solo,day,track,twist,strong:sv.strong,stages,at:0,done:false,solo,lessons:[],tricks:{}};game.current=null;
  if(!daily&&!solo)beginBoardSession('keepyuppy');
  view.current?.setScene(track,sv.strong);view.current?.render(null,0);
  setResult(null);setBoard(null);setWords([]);setToday(day);setNote('');setHeld('');setHud(blank);hudRef.current=blank;setTip(0);change('playing');
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[change,entry,pick]);
 const go=useCallback(()=>{if(phaseRef.current!=='playing'||tip<0)return;(audio.current??=createKeepyAudio()).unlock();audio.current.tap();setHeld('');begin(tip);},[begin,tip]);
 /** Skip the timing check (the usual offset is used; it can be done later from the start card). */
 const skip=useCallback(()=>{const r=run.current;if(phaseRef.current!=='playing'||r.stages[r.at]?.kind!=='calib')return;if(raf.current)cancelAnimationFrame(raf.current);raf.current=0;audio.current?.stopSong();const g=game.current;if(g)g.state.offsets.length=0;
  if(!g){if(r.at+1<r.stages.length){r.at++;setTip(r.at);}else{r.done=true;change('menu');}return;}nextStage();setHeld('');},[change,nextStage]);
 const pause=useCallback(()=>{if(phaseRef.current!=='playing')return;if(raf.current)cancelAnimationFrame(raf.current);raf.current=0;ptrs.current.clear();pressed.current=0;keysDown.current.clear();const g=game.current;
  if(tip<0&&g?.state.over){if(g.mode==='track')finish();else nextStage();return;}clock.current.pause();audio.current?.hush(true);change('paused');},[change,finish,nextStage,tip]);
 useEffect(()=>{pauseRef.current=pause;},[pause]);
 /** Back from a pause: the song steps back two beats so the player hears the beat before the next ball. */
 const resume=useCallback(()=>{if(phaseRef.current!=='paused')return;const a=audio.current,g=game.current;a?.unlock();a?.hush(false);change('playing');
  if(g&&tip<0){const c=g.chart,at=Math.max(c.start,clock.current.now()-2*60/c.bpm);a?.startSong({music:g.track.music,bars:c.bars,mode:g.mode==='calib'?'click':g.mode==='lesson'?'drums':'full',timeOf:b=>timeOfBeat(c,b),beatAt:t=>beatAtTime(c,t)},at);clock.current.start(at);kick();}
  focusEl.current?.focus({preventScroll:true});},[change,kick,tip]);
 const leave=useCallback(()=>{if(raf.current)cancelAnimationFrame(raf.current);raf.current=0;audio.current?.stopSong();onExit();},[onExit]);
 const chooseFoot=useCallback((f:Foot)=>{const sv={...readKeepySave(),strong:f};writeKeepySave(sv);setSave(sv);const q=askFoot;setAskFoot(null);view.current?.setScene(0,f);view.current?.render(null,0);if(q)void start(q.daily,q.solo);},[askFoot,start]);

 /* ---- the canvases, size, the thumbs ---- */
 useEffect(()=>{
  const el=stage.current,bg=bgEl.current,fg=fgEl.current;if(!el||!bg||!fg)return;
  reduced.current=matchMedia('(prefers-reduced-motion: reduce)').matches;frameMs.current=1000/(reduced.current?30:60);
  const v=view.current=createKeepyView(bg,fg,{reduced:reduced.current,keys:!matchMedia('(pointer: coarse)').matches});
  {const s=readKeepySave();v.setScene(0,s.strong||'R');}
  // the juggler is the player's own island bean: body colour, skin and hair from their saved look (loaded on demand)
  void Promise.all([import('@/lib/town/customization'),import('@/lib/town/quizProgress')]).then(([c,q])=>{const p=q.getQuizProgress(),l=c.beanLookFor(c.loadCustomization(p.completed,p.total));v.setLook({body:l.body,skin:l.skin,hair:l.hair?.color??'#231a2e'});redraw();}).catch(()=>{});
  const redraw=()=>{const g=game.current;if(phaseRef.current==='over')return;v.render(g,g?clock.current.now()-lat.current:0,pressed.current);};
  const fit=()=>{const r=el.getBoundingClientRect(),probe=el.querySelector<HTMLElement>('[data-ku-probe]'),topClear=(probe?.offsetHeight||56)+46;v.resize(Math.max(1,el.clientWidth||r.width),Math.max(1,el.clientHeight||r.height),window.devicePixelRatio||1,topClear);redraw();};
  fit();const ro=new ResizeObserver(fit);ro.observe(el);
  const live=()=>phaseRef.current==='playing'&&!!game.current&&raf.current!==0;
  const down=(e:PointerEvent)=>{if(!live()||(e.pointerType==='mouse'&&e.button!==0)||(e.target instanceof Element&&e.target.closest('button')))return;
   const g=game.current!;e.preventDefault();audio.current?.unlock();const r=el.getBoundingClientRect(),lane=v.laneAt(e.clientX-r.left-el.clientLeft);try{el.setPointerCapture(e.pointerId);}catch{/* fine without */}
   ptrs.current.set(e.pointerId,{lane,sx:e.clientX,sy:e.clientY,swiped:false});pressed.current|=1<<lane;g.press(lane,judgeTime(e.timeStamp));g.drain(onEvent);};
  const move=(e:PointerEvent)=>{const q=ptrs.current.get(e.pointerId),g=game.current;if(!q||!g||q.swiped||!live())return;const dx=e.clientX-q.sx,dy=e.clientY-q.sy;
   if(Math.hypot(dx,dy)>=SWIPE){q.swiped=true;if(g.swipe(q.lane,swipeDir(dx,dy),judgeTime(e.timeStamp)))g.drain(onEvent);}};
  const up=(e:PointerEvent)=>{const q=ptrs.current.get(e.pointerId);if(!q)return;ptrs.current.delete(e.pointerId);try{el.releasePointerCapture(e.pointerId);}catch{/* gone */}
   let mask=0;for(const p of ptrs.current.values())mask|=1<<p.lane;pressed.current=mask;const g=game.current;if(g&&live()&&g.release(q.lane,judgeTime(e.timeStamp)))g.drain(onEvent);};
  const opt={passive:false} as const;
  el.addEventListener('pointerdown',down,opt);el.addEventListener('pointermove',move,opt);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
  const noScroll=(e:TouchEvent)=>{if(phaseRef.current==='playing'&&e.cancelable&&!(e.target instanceof Element&&e.target.closest('[data-keepyuppy-card],dialog')))e.preventDefault();};el.addEventListener('touchmove',noScroll,opt);
  const noMenu=(e:Event)=>e.preventDefault();el.addEventListener('contextmenu',noMenu);
  if(process.env.NODE_ENV!=='production')(window as unknown as {__keepyuppy?:unknown}).__keepyuppy={get game(){return game.current;},get phase(){return phaseRef.current;},get loop(){return raf.current!==0;},get draws(){return draws.current;},get cost(){return cost.current;},get view(){return view.current;},get audio(){return audio.current;},
   /** song time as the rules see it now, and the same for an event stamp */get time(){return clock.current.now()-lat.current-off.current;},get offset(){return off.current;},get latency(){return lat.current;},get run(){return run.current;},get stage(){return el.getBoundingClientRect();}};
  return()=>{ro.disconnect();el.removeEventListener('pointerdown',down);el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up);el.removeEventListener('touchmove',noScroll);el.removeEventListener('contextmenu',noMenu);
   if(raf.current)cancelAnimationFrame(raf.current);raf.current=0;v.dispose();view.current=null;game.current=null;audio.current?.dispose();audio.current=null;delete (window as unknown as {__keepyuppy?:unknown}).__keepyuppy;};
 },[judgeTime,onEvent]);

 /* ---- keys; looked away: pause ---- */
 useEffect(()=>{
  const away=()=>pause(),hidden=()=>{if(document.hidden)pause();};
  const isUi=(e:KeyboardEvent)=>e.target instanceof HTMLElement&&!!e.target.closest('button,input,select,textarea,a,dialog');
  const map:Record<string,number>={KeyD:0,KeyF:1,KeyJ:2,KeyK:3,ArrowLeft:0,ArrowDown:1,ArrowUp:2,ArrowRight:3};
  const key=(e:KeyboardEvent)=>{
   if(e.code==='Escape'||e.code==='KeyP'){if(isUi(e)&&e.code!=='Escape')return;e.preventDefault();if(phaseRef.current==='playing')pause();else if(phaseRef.current==='paused')resume();return;}
   if(isUi(e))return;const g=game.current;if(phaseRef.current!=='playing'||!g||!raf.current)return;audio.current?.unlock();const t=judgeTime(e.timeStamp);
   if(e.code==='Space'){e.preventDefault();if(e.repeat)return;keysDown.current.add('Space');for(const c of keysDown.current){const l=map[c];if(l!==undefined&&g.swipe(l,'any',t))g.drain(onEvent);}return;}
   const lane=map[e.code];if(lane===undefined)return;e.preventDefault();if(e.repeat)return;keysDown.current.add(e.code);pressed.current|=1<<lane;g.press(lane,t);if(keysDown.current.has('Space'))g.swipe(lane,'any',t);g.drain(onEvent);};
  const keyUp=(e:KeyboardEvent)=>{keysDown.current.delete(e.code);const lane=map[e.code];if(lane===undefined)return;let mask=0;for(const c of keysDown.current){const l=map[c];if(l!==undefined)mask|=1<<l;}for(const p of ptrs.current.values())mask|=1<<p.lane;pressed.current=mask;
   const g=game.current;if(g&&phaseRef.current==='playing'&&raf.current&&!(mask&(1<<lane))&&g.release(lane,judgeTime(e.timeStamp)))g.drain(onEvent);};
  window.addEventListener('blur',away);document.addEventListener('visibilitychange',hidden);window.addEventListener('keydown',key);window.addEventListener('keyup',keyUp);
  return()=>{window.removeEventListener('blur',away);document.removeEventListener('visibilitychange',hidden);window.removeEventListener('keydown',key);window.removeEventListener('keyup',keyUp);};
 },[pause,resume,judgeTime,onEvent]);

 const busy=entry.pending,live=phase==='playing'||phase==='paused',r=run.current,st=live?r.stages[tip>=0?tip:r.at]:undefined,inTrack=live&&st?.kind==='track',T=TRACKS[live?r.track:0];
 const tap=()=>{(audio.current??=createKeepyAudio()).unlock();audio.current.tap();};
 const open=TRACKS.map((_,i)=>trackOpen(save,i)),lastOpen=open.lastIndexOf(true),sel=pick>=0&&open[pick]?pick:lastOpen,stars=totalStars(save),dailyToday=save.daily.day===today?save.daily:null;
 const D=today?dailyPick(keepyDailySeed(today)):null,playing=phase==='playing'&&tip<0;
 const slotOf=(id:TrickId)=>{const n=save.tricks[id]??0;return cardFull(save,id)?'full':n>0||save.seen.includes(id)?'part':'empty';};
 return <div className={`${styles.game} ${arcadeSkin.keepyuppy} ${comicRoot}`} data-game="keepyuppy" data-arcade-kind="keepyuppy" data-phase={phase}>
  <aside className={styles.side} data-side="left" aria-hidden="true">
   <ComicPanel tilt={-1.5} tone="paper"><b>Tap when the ball lands</b><br/>Each ball falls into a ring. Tap that pad as it lands: left foot, thigh, head or right foot.</ComicPanel>
   <ComicPanel tilt={1} tone="sun"><b>Height is time</b><br/>A soft, high touch gives you longer before the next one. Quick touches stay low.</ComicPanel>
   <ComicPanel tilt={-.8} tone="teal"><b>Keys</b><br/>D F J K: left foot, thigh, head, right foot. Hold Space with a foot key to swipe. Hold a key to stall. P pauses.</ComicPanel>
  </aside>
  <aside className={styles.side} data-side="right" aria-hidden="true">
   <ComicPanel tilt={1.2} tone="paper"><b>Stars</b><br/>Finish a track for one star. Cleaner touches earn two and three. Stars open the next track.</ComicPanel>
   <ComicPanel tilt={-1} tone="teal"><b>Both feet</b><br/>Every track has a weak-foot part. It is scored on its own, so you can watch it grow.</ComicPanel>
   <ComicPanel tilt={.8} tone="red"><b>Dropped it?</b><br/>A dropped ball costs one of your balls. Eight touches that stay up win one back.</ComicPanel>
  </aside>
  <div className={styles.stage} ref={stage} data-keepyuppy-stage>
   <canvas ref={bgEl} className={styles.canvas} aria-hidden="true"/>
   <canvas ref={fgEl} className={styles.canvas} aria-hidden="true"/>
   <i className={styles.probe} data-ku-probe aria-hidden="true"/>
   <div ref={focusEl} className={styles.play} tabIndex={0} role="application" aria-label="Keepy-Uppy Beat. Four pads: left foot, thigh, head, right foot. Tap a pad when its ball lands in the ring. Keys: D, F, J and K. Hold Space with a foot key to swipe."/>
   {live&&st&&<div className={styles.strip} data-keepyuppy-hud data-keepyuppy-stage-kind={st.kind} data-keepyuppy-playing={playing||undefined} aria-live="polite" aria-label={inTrack?`${hud.lives} balls left. ${T.name}.`:st.kind==='calib'?'Timing check':'Trick lesson'}>
    {inTrack&&<span className={styles.lives} key={`l${drops}`} data-hit={drops>0||undefined} data-keepyuppy-lives={hud.lives}>{Array.from({length:T.balls},(_,i)=><i key={i} data-off={i>=hud.lives||undefined}/>)}</span>}
    <span className={styles.stripItem} style={inTrack?undefined:{paddingLeft:10}}><small>{st.kind==='calib'?'Timing check':st.kind==='lesson'?'Lesson':r.daily?'Track of the Day':`Track ${r.track+1}`}</small>{st.kind==='calib'?'8 taps':st.kind==='lesson'?trickInfo(st.trick).name:T.name}</span>
   </div>}
   {playing&&inTrack&&(hud.weak||hud.fast||r.twist)&&<span className={styles.banner} data-tone={hud.weak?undefined:'sun'} key={hud.weak?'w':hud.fast?'f':'t'} data-keepyuppy-banner>{hud.weak?'WEAK FOOT!':hud.fast?'FASTER!':twistInfo(r.twist as TwistId).name.toUpperCase()}</span>}
   {playing&&st?.kind==='calib'&&<ComicButton size="small" className={styles.skip} onClick={skip} data-keepyuppy-skip>Skip</ComicButton>}
   {playing&&drops>0&&<i className={styles.flash} key={`f${drops}`} aria-hidden="true"/>}
   {playing&&note&&<p className={styles.hint} data-keepyuppy-hint key={note}>{note}</p>}
   <div className={styles.words} aria-live="polite">{words.map(w=><span key={w.id} className={styles.word} data-teach onAnimationEnd={()=>setWords(l=>l.filter(x=>x.id!==w.id))}>
    <ComicBurst word={w.text} size={w.text.length>14?16:20} tilt={w.id%2?-4:3} color={w.tone==='red'?'#f0452e':w.tone==='teal'?'#19b5a5':w.tone==='paper'?'#fff3d6':'#ffc83a'} fill={w.tone==='red'?'#fff3d6':undefined}/>
    {w.pts>0&&<b className={`${comicNumeral} ${styles.pts}`}>+{w.pts}</b>}</span>)}</div>
  </div>
  <ArcadeTopBar game="keepyuppy" className={styles.topBar} backTitle="Back to arcade" onBack={leave} value={inTrack?hud.score:undefined} word="pts" bumpKey={hud.score} paused={phase==='paused'} canPause={live} onPause={()=>phase==='playing'?pause():resume()}/>
  {phase==='paused'&&<ArcadePauseCard game="keepyuppy" score={inTrack?`${hud.score} pts · ${T.name} · ${hud.lives} ${hud.lives===1?'ball':'balls'} left`:st?.kind==='lesson'?'Trick lesson':'Timing check'} status={entry.message||undefined} onResume={resume} onExit={leave} onRestart={()=>{void start(r.daily,r.solo,r.track);}} restartDisabled={busy} keys={[['D F J K','left foot, thigh, head, right foot'],['Space + key','swipe'],['Hold','neck stall'],['P','pause']]}/>}
  {phase==='playing'&&tip>=0&&st&&(st.kind==='calib'
   ?<ComicCard label="Timing check" title="Tap when the ball lands" badge="One time" badgeTone="teal" data-keepyuppy-card="calib">
     <p className={styles.learn}>Every phone and speaker is a little different. <b>Tap any pad each time the ball lands in the ring</b>, eight times, and the game sets itself to your taps.</p>
     <div className={styles.actions}><ComicButton variant="primary" wide onClick={go} data-keepyuppy-go autoFocus>Start</ComicButton><ComicButton size="small" wide onClick={skip} data-keepyuppy-skip>Skip for now</ComicButton></div>
    </ComicCard>
   :st.kind==='lesson'
   ?<ComicCard label={`New trick: ${trickInfo(st.trick).name}`} title={trickInfo(st.trick).name} badge="New trick" badgeTone="sun" best="10-second lesson" data-keepyuppy-card="lesson" data-keepyuppy-trick={st.trick}>
     {held&&<p className={styles.status} role="status">{held}</p>}
     <ComicPanel tone="sun" tilt={-1} className={styles.lesson}><b>How</b>{trickInfo(st.trick).how}</ComicPanel>
     <span className={styles.howKeys}>Do: {trickInfo(st.trick).keys}</span>
     <p className={styles.learn}>{trickInfo(st.trick).fact} Nothing to lose here: try it three times.</p>
     <div className={styles.actions}><ComicButton variant="primary" wide onClick={go} data-keepyuppy-go autoFocus>Try it</ComicButton></div>
    </ComicCard>
   :<ComicCard label={T.name} title={T.name} badge={r.daily?'Track of the Day':`Track ${r.track+1} of ${TRACKS.length}`} badgeTone={r.daily?'teal':'red'} best={T.venue} data-keepyuppy-card="tip" data-keepyuppy-track={r.track}>
     {held&&<p className={styles.status} role="status">{held}</p>}
     <ComicPanel tone="sun" tilt={-1} className={styles.lesson}><b>{T.tip.title}</b>{T.tip.line}</ComicPanel>
     {r.twist&&<ComicPanel tone="teal" flat className={styles.fact} data-keepyuppy-twist={r.twist}><b>Today&rsquo;s twist: {twistInfo(r.twist).name}</b>{twistInfo(r.twist).line}</ComicPanel>}
     <p className={styles.info}>{T.bpm} beats a minute · {T.balls} balls{r.twist?'':' · weak-foot part in the middle'}</p>
     <div className={styles.actions}><ComicButton variant="primary" wide onClick={go} data-keepyuppy-go autoFocus>Kick off</ComicButton></div>
    </ComicCard>)}
  {phase==='menu'&&askFoot&&<ComicCard label="Which foot do you kick with?" title="Which foot?" badge="First time" badgeTone="teal" data-keepyuppy-card="foot">
   <p className={styles.learn}>Which foot do you <b>kick with</b>? The other one is your weak foot. The game will help you train it.</p>
   <div className={styles.feet}><ComicButton variant="teal" onClick={()=>chooseFoot('L')} data-keepyuppy-foot="L">Left<small>foot</small></ComicButton><ComicButton variant="primary" onClick={()=>chooseFoot('R')} data-keepyuppy-foot="R" autoFocus>Right<small>foot</small></ComicButton></div>
   <p className={styles.info}>You can change it later on the start card.</p>
  </ComicCard>}
  {phase==='menu'&&!askFoot&&<ComicCard label="Keepy-Uppy Beat" title="Keepy-Uppy Beat" badge="Juggle to the beat" badgeTone="teal" best={stars>0?<><Stars n={0} label=""/>{` ${stars}/${TRACKS.length*3}`}</>:undefined} data-keepyuppy-card="start">
   <JuggleArt/>
   <p className={styles.learn}><b>Tap the pad when the ball lands in its ring</b>: left foot, thigh, head, right foot. A soft, high touch buys you time.</p>
   {held&&<p className={styles.status} role="status">{held}</p>}
   {entry.message&&<p className={styles.status} role="status">{entry.message}</p>}
   <ol className={styles.tracks} data-keepyuppy-tracks>{TRACKS.map((t,i)=><li key={t.id}><button type="button" disabled={!open[i]} aria-pressed={sel===i} onClick={()=>{tap();setPick(i);}} data-keepyuppy-track={i} data-open={open[i]||undefined}>
    <i aria-hidden="true">{i+1}</i><span>{t.name}<small>{open[i]?`${t.bpm} beats a minute${(save.tracks[t.id]?.weak??-1)>=0?` · weak foot ${save.tracks[t.id]!.weak}`:''}`:`Opens at ${KU.unlock[i]} ${KU.unlock[i]===1?'star':'stars'}`}</small></span>
    {open[i]?<Stars n={save.tracks[t.id]?.stars??0}/>:<span aria-hidden="true">{stars}/{KU.unlock[i]}</span>}</button></li>)}</ol>
   <div className={styles.actions}>
    <ComicButton variant="primary" wide disabled={busy} onClick={()=>{void start(false);}} data-keepyuppy-play autoFocus>Play<small>{TRACKS[sel].name}</small></ComicButton>
    <ComicButton variant="teal" wide disabled={busy} onClick={()=>{void start(true);}} data-keepyuppy-daily>Track of the Day<small>{D?`${TRACKS[D.track].name} · ${twistInfo(D.twist).name}${dailyToday?.counted?` · today ${dailyToday.stars}/3 stars`:''}`:'The same for everyone today'}</small></ComicButton>
   </div>
   <button type="button" className={styles.shelf} onClick={()=>{tap();setBook(true);}} data-keepyuppy-shelf aria-label={`Trick Book: ${cardsFull(save)} of ${TRICKS.length} cards full. Open`}>
    <span>Trick Book <b>{cardsFull(save)}/{TRICKS.length}</b></span>
    <span className={styles.shelfRow}>{TRICKS.map(t=>{const s=slotOf(t.id);return <span key={t.id} className={styles.cardSlot} data-state={s} style={{['--slot' as string]:t.color}} aria-hidden="true">{s==='empty'?'?':s==='full'?'★':`${save.tricks[t.id]??0}/${KU.trickNeed}`}</span>;})}</span>
   </button>
   <div className={styles.actions} data-row="three">
    <ComicButton size="small" onClick={()=>{tap();setScores(true);}} data-keepyuppy-scores>Scores</ComicButton>
    <ComicButton size="small" disabled={busy} onClick={()=>{void start(false,true);}} data-keepyuppy-timing>Timing{save.calibrated?`: ${save.offset>0?'+':''}${save.offset} ms`:''}</ComicButton>
    {save.strong&&<ComicButton size="small" wide onClick={()=>{tap();chooseFoot(save.strong==='R'?'L':'R');}} data-keepyuppy-footswap>Kicking foot: {save.strong==='R'?'right':'left'} (tap to change)</ComicButton>}
   </div>
  </ComicCard>}
  {phase==='over'&&result&&<ComicCard label="Full time" badge={result.daily?'Track of the Day':result.out?'Ball down':TRACKS[result.track].name} badgeTone={result.daily?'teal':'red'} best={result.settled.newBest?undefined:result.daily?`Today ${result.settled.save.daily.stars}/3 stars`:`Best ${result.settled.save.tracks[TRACKS[result.track].id]?.best??0}`} data-keepyuppy-card="results" data-keepyuppy-score={result.score} data-keepyuppy-stars={result.stars} data-keepyuppy-acc={result.acc}>
   <Stars n={result.stars} big/>
   <div className={styles.scoreRow}>
    <strong className={`${comicNumeral} ${styles.score}`} data-new-best={result.settled.newBest||undefined}>{result.score}</strong>
    {result.settled.newBest&&<ComicBurst word="New best!" size={17} tilt={7} className={styles.stamp}/>}
   </div>
   {!result.daily&&<ComicMedalTrack score={result.score} best={result.settled.previousBest} medals={KU.medals} names={MEDAL_NAMES} data-keepyuppy-medal={medalFor(result.score)}/>}
   <ComicPanel tone="sun" tilt={-1.2} className={styles.near} data-keepyuppy-near>{result.line}</ComicPanel>
   {result.weak>=0&&<p className={styles.weakLine} data-keepyuppy-weak={result.weak}>Weak foot: <b>{result.weak}</b> out of 100{result.daily?'':result.settled.weakUp?` · up from ${result.settled.weakBefore}. It is getting stronger!`:result.settled.weakBefore>result.weak?` · your best is ${result.settled.weakBefore}`:result.settled.weakBefore<0?' · your first weak-foot score':''}</p>}
   <div className={styles.hsSlot} data-hs-slot/>
   <div className={styles.actions}>
    <ComicButton variant="primary" wide disabled={busy} onClick={()=>{void start(result.daily,false,result.track);}} data-keepyuppy-again autoFocus>Play again</ComicButton>
    <ComicButton size="small" onClick={()=>{tap();setResult(null);setBoard(null);if(result.settled.opened>=0)setPick(result.settled.opened);view.current?.render(null,0);change('menu');}} data-keepyuppy-menu>{result.settled.opened>=0?'Next track':'Tracks'}</ComicButton>
    <ComicButton size="small" onClick={()=>{tap();setScores(true);}}>Scores</ComicButton>
   </div>
   <div className={styles.chips}>
    <ComicStat value={`${result.acc}%`} label="Accuracy"/>
    <ComicStat value={result.sweet} label="Sweet"/>
    <ComicStat value={result.bestCombo} label="In a row"/>
    <ComicStat value={result.tricks} label="Tricks"/>
   </div>
   <p className={styles.coach} data-keepyuppy-coach>{result.coach}</p>
   {(result.settled.newCards.length>0||result.settled.newFeats.length>0)&&<ComicPanel tone="teal" flat className={styles.prizes} data-keepyuppy-prizes>
    {result.settled.newCards.map(id=><span key={id}><i aria-hidden="true">★</i><em><b>Trick Book: {trickInfo(id).name}</b> card is full.</em></span>)}
    {result.settled.newFeats.map((id:FeatId)=>{const ft=KU_FEATS.find(x=>x.id===id)!;return <span key={id}><i aria-hidden="true">✓</i><em><b>{ft.name}:</b> {ft.how}</em></span>;})}
   </ComicPanel>}
   <ComicPanel tone="paper" flat className={styles.fact} data-keepyuppy-fact><b>{result.settled.tip.title}</b>{result.settled.tip.line}</ComicPanel>
   {(result.coins>0||entry.message)&&<p className={styles.status} role="status">{entry.message||`+${result.coins} ${result.coins===1?'coin':'coins'}`}</p>}
  </ComicCard>}
  {board&&phase==='over'&&<HighScoreEntry game="keepyuppy" score={board.score} detail="Points for every touch: more for Sweet touches, long runs of clean touches and tricks. A bonus for each star at the end of a track." onClose={()=>setBoard(null)}/>}
  {scores&&<KeepyUppyScores onClose={()=>setScores(false)}/>}
  {book&&<BoardDialog label="Trick Book" title="Trick Book" onClose={()=>setBook(false)}>
   <p data-board-learn className={styles.boardLearn}>Every trick is a real juggling move. Land one cleanly {KU.trickNeed} times to fill its card.</p>
   <ul className={styles.book} data-keepyuppy-book>{TRICKS.map(t=>{const n=save.tricks[t.id]??0,known=n>0||save.seen.includes(t.id),first=TRACKS.find(tr=>createKeepy({strong:'R',track:TRACKS.indexOf(tr)}).chart.tricks.includes(t.id));return <li key={t.id} data-full={cardFull(save,t.id)||undefined} style={{['--slot' as string]:known?t.color:undefined}}>
    <b>{known?t.name:'Empty slot'}</b>{known?<><span>{t.how}</span><em>{t.fact}</em></>:<span>A trick waits here. You learn it on {first?.name??'a later track'}.</span>}
    <span className={styles.pipsRow} aria-label={`${Math.min(n,KU.trickNeed)} of ${KU.trickNeed} clean landings`}>{Array.from({length:KU.trickNeed},(_,i)=><i key={i} data-on={i<n||undefined}/>)}{n>KU.trickNeed?` ${n} landed`:''}</span></li>;})}</ul>
  </BoardDialog>}
 </div>;
}
