'use client';
/**
 * Hold the Line (Nov 21 2026, docs/arcade-aaa/holdtheline-direction.md): you are the defence. Rules: lib/arcade/holdtheline/core.ts
 * (pure, seeded, fixed 1/60 s steps). Drawing: view.ts (canvas 2D, comic print). Sound: audio.ts. This shell owns the thumb, the
 * keys and the cards.
 * One thumb: DRAG anywhere to move the whole back line (up = step up, down = drop, left / right = slide across). TAP one of your
 * defenders to send him to press the player on the ball.
 * Keys: W-S / up-down step up and drop, A-D / left-right slide, 1-4 press that defender (Space = the nearest). P / Escape pauses.
 * Heat: the loop runs only while a wave is on (menu, team card, pause, results and a hidden tab draw nothing). 30 draws a second on
 * phones, 60 on desktop. HUD state at most 10 times a second. One static canvas + one moving canvas, no particles, no timers.
 * Teaches (AGENTS.md): the offside rule in action (the line is the second-last defender; it is judged when the ball is PLAYED),
 * stepping up together, staying compact, dropping, sliding to the ball side, when to press and what it costs.
 */
import React,{useCallback,useEffect,useRef,useState} from 'react';
import dynamic from 'next/dynamic';
import {retryImport} from '@/lib/retryImport';
import {ArcadeTopBar} from '../arcade/ArcadeTopBar';
import {ArcadePauseCard} from '../arcade/ArcadePauseCard';
import {BoardDialog} from '../arcade/BoardsPanel';
import {arcadeSkin} from './skins';
import {comicRoot,comicNumeral,ComicButton,ComicCard,ComicPanel,ComicStat,ComicBurst,ComicMedalTrack} from './comic';
import styles from './HoldTheLineGame.module.css';
import {createHoldTheLine,holdthelineDailySeed,medalFor,tuning,HL,TEAMS,DAILY_TEAM,LEAGUES,HL_FEATS,MEDAL_NAMES,GOAL_WHYS,STOP_KINDS,OFFSIDE_REASONS,type HoldTheLine,type HlEvent,type WaveKind,type FeatId,type Phase as CorePhase} from '@/lib/arcade/holdtheline/core';
import {createHoldthelineView,VENUES,type HoldthelineView} from '@/lib/arcade/holdtheline/view';
import {createHoldthelineAudio,type HoldthelineAudio} from '@/lib/arcade/holdtheline/audio';
import {frameCapSlot} from '@/lib/town/frameCap';
import {readHoldthelineSave,writeHoldthelineSave,settleHoldtheline,nearMissLine,coachLine,emptyHoldthelineSave,nextMatch,leagueOpen,matchOpen,matchesWon,seasonStars,WHY_LINE,type HoldthelineSave,type HoldthelineSettled} from '@/lib/arcade/holdtheline/save';
import {arcadeFeedback} from '@/lib/arcade/arcadeFeedback';
import {useArcadeEntry} from '@/lib/arcade/useArcadeEntry';
import {creditRun,arcadeCoinTarget} from '@/lib/arcade/arcadeWallet';
import {saveArcadeRecord} from '@/lib/arcade/arcadeRecords';
import {beginBoardSession} from '@/lib/arcade/boardClient';
import {noteLastScore} from '@/lib/arcade/lastScore';
import {localPlayDay} from '@/lib/town/dailyPlay';
const HighScoreEntry=dynamic(()=>retryImport(()=>import('../arcade/HighScoreEntry')),{ssr:false});
const HoldTheLineScores=dynamic(()=>retryImport(()=>import('./HoldTheLineScores')),{ssr:false});

type Phase='menu'|'playing'|'paused'|'over';
type Hud={score:number;goals:number;wave:number;stops:number;streak:number;cp:CorePhase;log:string};
type Result={score:number;daily:boolean;league:number;match:number;won:boolean;stars:number;goals:number;stops:number;offsides:number;tackles:number;bestRow:number;limit:number;settled:HoldthelineSettled;line:string;coach:string;coins:number};
type Word={id:number;text:string;pts:number;tone:'sun'|'red'|'teal'|'paper';teach:boolean};
export const HOLDTHELINE_COIN_REASON='Hold the Line: match';
/** a drag starts after this many px; a touch that moved less and was shorter than TAP_MS is a tap (press) */
const DRAG=10,TAP_MS=450;
const STOP_WORD=['OFFSIDE!','TACKLE!','BLOCKED!','SWEPT UP!','SHUT OUT!','SAVED!'];
/** The first time a kind of attack comes: one line on what to do. */
const KIND_HINT:Record<WaveKind,string>={
 thru:'Through ball: when the passer’s leg goes back, drag UP to step up.',
 decoy:'One runner checks short, one goes. Step up on the wind-up all the same.',
 deep:'A runner from deep: he can still be caught offside if you step up during the wind-up.',
 long:'The passer is far back in his own half: a long ball. Drag DOWN to drop.',
 wide:'Ball out wide: drag ACROSS so your line is on the ball side.',
 switch:'A switch of play is coming. Slide ACROSS to the far side when it is hit.',
 heavy:'A heavy touch! TAP your nearest defender to press and win the ball.',
 bend:'The captain bends her run to stay level. TAP a defender to press the passer.',
 double:'A pass to feet, then a ball in behind. Step, stop, then step again.'};
const REASON_NOTE=['Past your line when the ball was played: OFFSIDE!','Level with your line when the ball was played. Level is onside.','Behind your line when the ball was played: onside.','In his own half when the ball was played. He cannot be offside.','Behind the ball: onside.'];

function Star({on,size=20}:{on:boolean;size?:number}){return <svg className={styles.star} width={size} height={size} viewBox="0 0 24 24" data-on={on||undefined} aria-hidden="true"><path d="M12 2.5l2.9 6.2 6.6.8-4.9 4.6 1.3 6.6L12 17.4l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"/></svg>;}
function Stars({n,size}:{n:number;size?:number}){return <span className={styles.stars} role="img" aria-label={`${n} of 3 stars`}>{[0,1,2].map(i=><Star key={i} on={i<n} size={size}/>)}</span>;}
/** The assistant referee's flag: the trap book's pages and the HUD's marks. */
function Flag({color,off,size=20}:{color?:string;off?:boolean;size?:number}){
 return <svg className={styles.flag} width={size} height={size} viewBox="0 0 24 24" data-off={off||undefined} aria-hidden="true"><path d="M5 22V3" /><path d="M5 3.5h14v10H5z" fill={off?'none':color??'#ffc83a'}/>{!off&&<path d="M5 3.5h7v5H5zM12 8.5h7v5h-7z" fill="#231a2e" fillOpacity=".28" stroke="none"/>}</svg>;
}
/** The start card's picture: the line steps up, the runner is left behind it, the flag is up. */
function TrapArt(){
 const bean=(x:number,c:string,back=true)=><g key={x} transform={`translate(${x} 0)`}><ellipse cx="1" cy="1" rx="11" ry="4" fill="#231a2e" fillOpacity=".3"/><path d="M-8 -6v-16a8 8 0 0 1 16 0v16a8 8 0 0 1-16 0z" fill={c} stroke="#231a2e" strokeWidth="2.5"/><circle cx="0" cy="-22" r="6.6" fill={back?'#231a2e':'#f2b98a'}/>{!back&&<><circle cx="-2.6" cy="-21" r="1.2" fill="#231a2e"/><circle cx="2.6" cy="-21" r="1.2" fill="#231a2e"/></>}</g>;
 return <svg className={styles.art} viewBox="0 0 240 96" aria-hidden="true">
  <rect x="2" y="2" width="236" height="92" fill="#56aa55" stroke="#231a2e" strokeWidth="3"/><path d="M2 32h236M2 62h236" stroke="#62b85f" strokeWidth="30" strokeOpacity=".55"/>
  <rect x="3.5" y="52" width="233" height="40.5" fill="#f0452e" fillOpacity=".28"/><path d="M2 52h236" stroke="#231a2e" strokeWidth="7"/><path d="M2 52h236" stroke="#f0452e" strokeWidth="3.5"/>
  <g transform="translate(118 30)">{bean(-18,'#f0452e',false)}</g><g transform="translate(150 84)">{bean(0,'#f0452e',false)}</g>
  <path d="M40 34h132" stroke="#231a2e" strokeWidth="6"/><path d="M40 34h132" stroke="#fff3d6" strokeWidth="3"/>
  <g transform="translate(40 52)">{[0,44,88,132].map(x=>bean(x,'#19b5a5'))}</g>
  <g transform="translate(214 56)">{bean(0,'#231a2e',false)}<path d="M-6 -12V-44" stroke="#231a2e" strokeWidth="3"/><path d="M-24 -44h18v13h-18z" fill="#ffc83a" stroke="#231a2e" strokeWidth="2"/><path d="M-24 -44h9v6.5h-9zM-15 -37.5h9v6.5h-9z" fill="#f0452e"/></g>
 </svg>;
}

export default function HoldTheLineGame({onExit}:{onExit:()=>void}){
 const [phase,setPhase]=useState<Phase>('menu'),phaseRef=useRef<Phase>('menu');
 const blank:Hud={score:0,goals:0,wave:0,stops:0,streak:0,cp:'tip',log:''};
 const [hud,setHud]=useState<Hud>(blank),hudRef=useRef(hud),hudAt=useRef(0);
 const [save,setSave]=useState<HoldthelineSave>(emptyHoldthelineSave),[result,setResult]=useState<Result|null>(null),[today,setToday]=useState('');
 const [board,setBoard]=useState<{score:number}|null>(null),[scores,setScores]=useState(false),[book,setBook]=useState(false),[map,setMap]=useState(false),[mapLeague,setMapLeague]=useState(0),[words,setWords]=useState<Word[]>([]);
 const [guide,setGuide]=useState<'watch'|'step'|null>(null),guideRef=useRef<'off'|'watch'|'step'>('off');
 const [hint,setHint]=useState(''),[note,setNote]=useState(''),[tip,setTip]=useState(false),[goals,setGoals]=useState(0);
 const entry=useArcadeEntry('holdtheline');
 const stage=useRef<HTMLDivElement>(null),focusEl=useRef<HTMLDivElement>(null),bgEl=useRef<HTMLCanvasElement>(null),fgEl=useRef<HTMLCanvasElement>(null);
 const game=useRef<HoldTheLine|null>(null),view=useRef<HoldthelineView|null>(null),audio=useRef<HoldthelineAudio|null>(null);
 const raf=useRef(0),draws=useRef(0),cost=useRef({n:0,ms:0,max:0}),last=useRef(0),slot=useRef(0),urgent=useRef(false),stopUntil=useRef(0),frameMs=useRef(1000/30),endAt=useRef(0),wordId=useRef(0);
 const run=useRef<{id:string;daily:boolean;day:string;league:number;match:number;done:boolean;kinds:string[];feats:FeatId[]}>({id:'',daily:false,day:'',league:0,match:0,done:true,kinds:[],feats:[]});
 const ptr=useRef<{id:number;sx:number;sy:number;wy:number;wx:number;drag:boolean;def:number;t:number}|null>(null);
 const keys=useRef({left:false,right:false,up:false,down:false}),seen=useRef<Set<string>>(new Set()),reduced=useRef(false),frameRef=useRef<(t:number)=>void>(()=>{});

 const change=useCallback((p:Phase)=>{phaseRef.current=p;setPhase(p);},[]);
 useEffect(()=>{const s=readHoldthelineSave();setSave(s);seen.current=new Set(s.seen);setToday(localPlayDay(Date.now()));setMapLeague(leagueOpen(s,1)&&matchesWon(s,1)>0?1:0);},[]);
 useEffect(()=>{if(!hint)return;const t=setTimeout(()=>setHint(''),7000);return()=>clearTimeout(t);},[hint]);
 const kick=useCallback(()=>{if(!raf.current&&phaseRef.current==='playing'){last.current=0;slot.current=0;raf.current=requestAnimationFrame(t=>frameRef.current(t));}},[]);
 const say=useCallback((text:string,pts:number,tone:Word['tone'],teach=false)=>{const w:Word={id:++wordId.current,text,pts,tone,teach};setWords(list=>[...list.filter(x=>!(teach&&x.teach)).slice(-2),w]);},[]);
 const aidOf=useCallback(()=>({aid:guideRef.current!=='off'?2:game.current?.tn.aid??0,frozen:performance.now()<stopUntil.current||guideRef.current==='step',reduced:reduced.current}),[]);

 /* ---- the match's end: save, coins, board (once per match) ---- */
 const finish=useCallback(()=>{
  const g=game.current,r=run.current;if(!g||r.done)return;r.done=true;const s=g.state,score=s.score,stats={...s.stats};
  const settled=settleHoldtheline(readHoldthelineSave(),{score,daily:r.daily,day:r.day,league:r.league,match:r.match,won:s.won,stars:s.stars,goals:s.goals,stats,feats:s.feats,kinds:r.kinds});writeHoldthelineSave(settled.save);setSave(settled.save);
  if(!r.daily)saveArcadeRecord('holdtheline',score);else noteLastScore('holdtheline_daily',s.stars,settled.dailyStars);
  const coins=arcadeCoinTarget('holdtheline',{points:score});if(coins>0)void creditRun(r.id,'holdtheline',coins,HOLDTHELINE_COIN_REASON);
  setResult({score,daily:r.daily,league:r.league,match:r.match,won:s.won,stars:s.stars,goals:s.goals,stops:s.stops,offsides:stats.offsides,tackles:stats.tackles+stats.blocks,bestRow:stats.bestRow,limit:g.tn.limit,settled,coins,
   line:nearMissLine({daily:r.daily,won:s.won,stars:s.stars,goals:s.goals,limit:g.tn.limit,league:r.league,match:r.match,promoted:settled.promoted,opened:settled.opened,cleanRun:settled.cleanRun,book:settled.save.book.length}),coach:coachLine(stats,s.won)});
  if(score>0&&!r.daily)setBoard({score});
  if(settled.newMedal||settled.newFeats.length||settled.promoted){audio.current?.medal(Math.max(1,settled.medal));arcadeFeedback(null,'goal');}
  ptr.current=null;guideRef.current='off';setGuide(null);setWords([]);setHint('');setNote('');setTip(false);view.current?.clear();change('over');
 },[change]);

 /* ---- one rules event: sound, haptics, words ---- */
 const onEvent=useCallback((e:HlEvent)=>{
  const a=audio.current,v=view.current,g=game.current;if(!g)return;v?.onEvent(e,g);const s=g.state;
  switch(e.type){
   case 'wave':{const k=e.word as WaveKind;run.current.kinds.push(k);setNote('');if(guideRef.current==='off'&&!seen.current.has(k)){seen.current.add(k);setHint(KIND_HINT[k]);}else setHint('');/* a hint never outlives its wave */break;}
   case 'pass':a?.pass(e.word==='wide');if(e.b===1){a?.alert();arcadeFeedback(null,'collect');}break;
   case 'tell':a?.windup(s.tell?.W??.6);break;
   case 'kick':a?.pass(true);if(e.word==='shot'){a?.alert();say('SHOT!',0,'paper',true);}
    else if(e.word!=='feet'||e.a===1){setHint('');const sn=s.snap,behind=!!sn&&!sn.offside&&sn.reason!=='ownhalf'&&sn.line<s.lineY-.3;setNote(behind?'One defender was behind your line and kept him onside. Step up together!':REASON_NOTE[e.b]??'');if(e.a===0){a?.alert();if(e.word==='thru')say('THROUGH ON GOAL!',0,'paper',true);}
     // the decision moment: the world holds for a beat with the offside line drawn (early matches; the helper fades out later)
     const aid=guideRef.current!=='off'?2:g.tn.aid;if(aid>=1)stopUntil.current=performance.now()+(aid>=2?950:650);}break;
   case 'stop':{const k=STOP_KINDS[e.a];if(k==='offside'){a?.flag();a?.cheer(true);arcadeFeedback(null,'perfect');}else if(k==='swept'){a?.sweep();a?.cheer(false);arcadeFeedback(null,'combo');}else if(k==='save'){a?.tackle();a?.cheer(false);}else{a?.tackle();a?.cheer(false);arcadeFeedback(null,'combo');}
    say(STOP_WORD[e.a],e.points,k==='offside'?'red':k==='save'?'teal':'sun');
    if(k==='save')setNote('Your keeper saved you that time.');else if(k==='tackle')setNote('Pressed at the right moment. Ball won!');else if(k==='block')setNote('A brave block. No shot.');else if(k==='swept')setNote('You dropped in time and swept it up.');else if(k==='slide')setNote('The line slid across. No room out wide.');break;}
   case 'cover':a?.tap();say('COVERED!',e.points,'teal');setNote('Good slide. Stay with the ball.');break;
   case 'goal':a?.goal();arcadeFeedback(null,'slam');setGoals(n=>n+1);say('GOAL',0,'paper');setNote(WHY_LINE[GOAL_WHYS[e.a]]);break;
   case 'press':a?.press();break;
   case 'feat':a?.prize();run.current.feats.push(e.word as FeatId);break;// the new trap-book page is shown on the results card, not over the pitch
   case 'over':a?.whistle(true);a?.over(e.a===1);endAt.current=performance.now()+(reduced.current?800:1700);say(e.a===1?(e.b===3?'CLEAN SHEET!':'YOU WIN!'):'FULL TIME!',e.points,e.a===1?'red':'paper',true);break;
  }
 },[say]);

 /** the guided first step: the world is held on the wind-up until the child drags up */
 const guideCheck=useCallback(()=>{const g=game.current;if(!g||guideRef.current!=='step')return;if(g.state.wantY>g.state.lineY+.8){guideRef.current='off';setGuide(null);writeHoldthelineSave({...readHoldthelineSave(),intro:true});urgent.current=true;kick();}},[kick]);
 const press=useCallback((i:number)=>{const g=game.current;if(!g||phaseRef.current!=='playing'||guideRef.current==='step')return false;const ok=g.press(i);if(ok){urgent.current=true;setHint('');}return ok;},[]);

 /* ---- the loop: fixed steps in the core; 30 draws a second on phones, 60 on desktop; an action draws on the very next vsync ---- */
 useEffect(()=>{frameRef.current=(now:number)=>{
  raf.current=0;const g=game.current,v=view.current;if(phaseRef.current!=='playing'||!g||!v)return;
  const next=urgent.current?now:frameCapSlot(now,slot.current,frameMs.current);urgent.current=false;
  if(next<0){raf.current=requestAnimationFrame(t=>frameRef.current(t));return;}slot.current=next;
  const dt=last.current?Math.min(.1,(now-last.current)/1000):1/60;last.current=now;
  const k=keys.current,s=g.state;if((k.left||k.right||k.up||k.down)&&(s.phase==='play'||s.phase==='res'||s.phase==='gap')){g.nudge(((k.up?1:0)-(k.down?1:0))*HL.upV*1.3*dt,((k.right?1:0)-(k.left?1:0))*HL.slideV*1.3*dt);guideCheck();}
  // the guided first step: the world holds on the wind-up until the child drags up (the loop sleeps: one frame, no rAF)
  if(guideRef.current==='step'){v.render(g,now/1000,aidOf());return;}
  const c0=performance.now();if(now>=stopUntil.current){g.advance(dt);g.drain(onEvent);}
  if(guideRef.current==='watch'){const L=g.look();if(L.tell&&L.tell.kind==='thru'&&L.tell.t>=L.tell.W*.3){guideRef.current='step';setGuide('step');setHint('');v.render(g,now/1000,aidOf());return;}if(s.wave>0){guideRef.current='off';setGuide(null);}}
  v.render(g,now/1000,aidOf());draws.current++;{const c=cost.current,ms=performance.now()-c0;c.n++;c.ms+=ms;if(ms>c.max)c.max=ms;}// frame cost (rules + draw) for scripts/check-holdtheline-browser.cjs
  if(now-hudAt.current>100){const hh=hudRef.current,n:Hud={score:s.score,goals:s.goals,wave:s.wave,stops:s.stops,streak:s.streak,cp:s.phase,log:s.log};
   let diff=false;for(const key of Object.keys(n) as (keyof Hud)[])if(n[key]!==hh[key]){diff=true;break;}if(diff){hudAt.current=now;hudRef.current=n;setHud(n);}}
  if(s.over){if(endAt.current&&now>=endAt.current){finish();return;}}
  else if(s.phase==='tip')return;// the team card is up: the loop sleeps until it is read
  raf.current=requestAnimationFrame(t=>frameRef.current(t));
 };},[finish,onEvent,guideCheck,aidOf]);

 /* ---- start / restart ---- */
 const start=useCallback(async(o:{daily?:boolean;league?:number;match?:number})=>{
  (audio.current??=createHoldthelineAudio()).unlock();
  const id=await entry.enter();if(!id)return;
  const daily=!!o.daily,day=localPlayDay(Date.now()),seed=daily?holdthelineDailySeed(day):1+Math.floor(Math.random()*2_000_000_000),sv=readHoldthelineSave();
  const league=daily?0:leagueOpen(sv,o.league??0)?o.league??0:0,match=daily?0:Math.min(o.match??nextMatch(sv,league),nextMatch(sv,league));
  const intro=!daily&&league===0&&match===0&&!sv.intro&&sv.plays===0;guideRef.current=intro?'watch':'off';setGuide(intro?'watch':null);
  game.current=createHoldTheLine({seed,daily,league,match,intro});run.current={id,daily,day,league,match,done:false,kinds:[],feats:[]};stopUntil.current=0;endAt.current=0;ptr.current=null;
  if(!daily)beginBoardSession('holdtheline');
  audio.current?.hush(false);setResult(null);setBoard(null);setWords([]);setToday(day);setHint('');setNote('');setGoals(0);setMap(false);
  game.current.drain(()=>{});hudRef.current=blank;setHud(blank);setTip(true);
  change('playing');{const g=game.current,v=view.current;if(v)v.render(g,performance.now()/1000,aidOf());}focusEl.current?.focus({preventScroll:true});
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[change,entry,aidOf]);
 /** The team card is read: kick off. */
 const ack=useCallback(()=>{const g=game.current;if(!g||phaseRef.current!=='playing'||!tip)return;audio.current?.unlock();audio.current?.whistle();setTip(false);g.ack();g.drain(onEvent);kick();focusEl.current?.focus({preventScroll:true});},[kick,onEvent,tip]);
 const pause=useCallback(()=>{if(phaseRef.current!=='playing')return;if(raf.current)cancelAnimationFrame(raf.current);raf.current=0;ptr.current=null;const g=game.current;if(g?.state.over){finish();return;}audio.current?.hush(true);change('paused');},[change,finish]);
 const resume=useCallback(()=>{if(phaseRef.current!=='paused')return;audio.current?.unlock();audio.current?.hush(false);change('playing');kick();},[change,kick]);
 const leave=useCallback(()=>{if(raf.current)cancelAnimationFrame(raf.current);raf.current=0;onExit();},[onExit]);

 /* ---- the canvases, size, the thumb ---- */
 useEffect(()=>{
  const el=stage.current,bg=bgEl.current,fg=fgEl.current;if(!el||!bg||!fg)return;
  reduced.current=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile=matchMedia('(pointer: coarse)').matches;frameMs.current=1000/(mobile?30:60);
  const v=view.current=createHoldthelineView(bg,fg,{reduced:reduced.current});
  // your back line is the player's own island bean: body colour, skin and hair from their saved look (loaded on demand)
  void Promise.all([import('@/lib/town/customization'),import('@/lib/town/quizProgress')]).then(([c,q])=>{const p=q.getQuizProgress(),l=c.beanLookFor(c.loadCustomization(p.completed,p.total));v.setLook({body:l.body,skin:l.skin,hair:l.hair?.color??'#231a2e'});redraw();}).catch(()=>{});
  const idle=createHoldTheLine({seed:1});
  const redraw=()=>{const g=game.current;if(phaseRef.current==='menu'||!g)v.render(idle,0,{aid:0,frozen:false,reduced:true});else if(phaseRef.current!=='over')v.render(g,performance.now()/1000,aidOf());};
  const fit=()=>{const r=el.getBoundingClientRect(),probe=el.querySelector<HTMLElement>('[data-hl-probe]'),topClear=(probe?.offsetHeight||56)+50;v.resize(Math.max(1,r.width),Math.max(1,r.height),window.devicePixelRatio||1,topClear);redraw();};
  fit();const ro=new ResizeObserver(fit);ro.observe(el);
  const local=(e:PointerEvent)=>{const r=el.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};};
  const down=(e:PointerEvent)=>{if(phaseRef.current!=='playing'||(e.pointerType==='mouse'&&e.button!==0)||(e.target instanceof Element&&e.target.closest('button')))return;
   const g=game.current;if(!g)return;e.preventDefault();audio.current?.unlock();if(g.state.over){endAt.current=1;return;}
   const p=local(e);try{el.setPointerCapture(e.pointerId);}catch{/* fine without */}
   ptr.current={id:e.pointerId,sx:p.x,sy:p.y,wy:g.state.wantY,wx:g.state.wantX,drag:false,def:v.defAt(g,p.x,p.y),t:performance.now()};};
  const move=(e:PointerEvent)=>{const q=ptr.current,g=game.current;if(!q||!g||e.pointerId!==q.id||phaseRef.current!=='playing')return;e.preventDefault();const p=local(e),dx=p.x-q.sx,dy=p.y-q.sy;
   if(!q.drag){if(Math.hypot(dx,dy)<DRAG)return;q.drag=true;}// the whole travel from the touch-down counts (re-anchoring here lost the first 10-25 px of a quick flick)
   // the whole line follows the thumb: up the screen = up the pitch
   const gain=v.gain(g.state.lineY);g.move(q.wy-(p.y-q.sy)/gain.y*1.25,q.wx+(p.x-q.sx)/gain.x*1.25);guideCheck();};
  const up=(e:PointerEvent)=>{const q=ptr.current;if(!q||e.pointerId!==q.id)return;try{el.releasePointerCapture(e.pointerId);}catch{/* gone */}ptr.current=null;
   if(!q.drag&&q.def>=0&&performance.now()-q.t<TAP_MS&&e.type==='pointerup')press(q.def);};
  const opt={passive:false} as const;
  el.addEventListener('pointerdown',down,opt);el.addEventListener('pointermove',move,opt);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
  const noScroll=(e:TouchEvent)=>{if(phaseRef.current==='playing'&&e.cancelable)e.preventDefault();};el.addEventListener('touchmove',noScroll,opt);
  const noMenu=(e:Event)=>e.preventDefault();el.addEventListener('contextmenu',noMenu);
  if(process.env.NODE_ENV!=='production')(window as unknown as {__holdtheline?:unknown}).__holdtheline={get game(){return game.current;},get phase(){return phaseRef.current;},get loop(){return raf.current!==0;},get draws(){return draws.current;},get cost(){return cost.current;},get view(){return view.current;},get audio(){return audio.current;},get guide(){return guideRef.current;},get frozen(){return performance.now()<stopUntil.current;},get stage(){return el.getBoundingClientRect();}};
  return()=>{ro.disconnect();el.removeEventListener('pointerdown',down);el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up);el.removeEventListener('touchmove',noScroll);el.removeEventListener('contextmenu',noMenu);
   if(raf.current)cancelAnimationFrame(raf.current);raf.current=0;v.dispose();view.current=null;game.current=null;audio.current?.dispose();audio.current=null;delete (window as unknown as {__holdtheline?:unknown}).__holdtheline;};
 },[press,guideCheck,aidOf]);

 /* ---- keys; looked away: pause ---- */
 useEffect(()=>{
  const away=()=>pause(),hidden=()=>{if(document.hidden)pause();};
  const isUi=(e:KeyboardEvent)=>e.target instanceof HTMLElement&&!!e.target.closest('button,input,select,textarea,a,dialog');
  const dir:Record<string,'left'|'right'|'up'|'down'>={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down'};
  const key=(e:KeyboardEvent)=>{if(isUi(e))return;
   if(e.code==='Escape'||e.code==='KeyP'){e.preventDefault();if(phaseRef.current==='playing')pause();else if(phaseRef.current==='paused')resume();return;}
   const g=game.current;if(phaseRef.current!=='playing'||!g)return;audio.current?.unlock();const s=g.state;
   if(s.over){if(e.code==='Enter'||e.code==='Space'){e.preventDefault();endAt.current=1;}return;}
   if(s.phase==='tip'){if(e.code==='Enter'||e.code==='Space'){e.preventDefault();ack();}return;}
   if(/^(Digit|Numpad)[1-4]$/.test(e.code)){e.preventDefault();if(!e.repeat)press(Number(e.code.slice(-1))-1);return;}
   if(e.code==='Space'||e.code==='Enter'){e.preventDefault();if(!e.repeat)press(g.nearest());return;}
   const m=dir[e.code];if(m){e.preventDefault();keys.current[m]=true;if(guideRef.current==='step'&&m==='up'){g.nudge(1.2,0);guideCheck();}}};
  const keyUp=(e:KeyboardEvent)=>{const m=dir[e.code];if(m)keys.current[m]=false;};
  window.addEventListener('blur',away);document.addEventListener('visibilitychange',hidden);window.addEventListener('keydown',key);window.addEventListener('keyup',keyUp);
  return()=>{window.removeEventListener('blur',away);document.removeEventListener('visibilitychange',hidden);window.removeEventListener('keydown',key);window.removeEventListener('keyup',keyUp);};
 },[pause,resume,ack,press,guideCheck]);

 const dailyToday=save.daily.day===today?save.daily:null,busy=entry.pending,live=phase==='playing'||phase==='paused';
 const tap=()=>{(audio.current??=createHoldthelineAudio()).unlock();audio.current.tap();};
 const r=run.current,daily=r.daily&&live,team=live||phase==='over'?(r.daily?DAILY_TEAM:TEAMS[r.match]):TEAMS[0],tn=live?tuning(r.league,r.match,r.daily):tuning(0,0);
 const league=leagueOpen(save,1)?1:0,nextM=nextMatch(save,league),playing=phase==='playing'&&!tip;
 const allDone=matchesWon(save,LEAGUES.length-1)>=TEAMS.length;
 return <div className={`${styles.game} ${arcadeSkin.holdtheline} ${comicRoot}`} data-game="holdtheline" data-arcade-kind="holdtheline" data-phase={phase}>
  <aside className={styles.side} data-side="left" aria-hidden="true">
   <ComicPanel tilt={-1.5} tone="paper"><b>Move the line</b><br/>Drag up to step up, down to drop, sideways to slide. Your back line moves as one.</ComicPanel>
   <ComicPanel tilt={1} tone="sun"><b>The offside trap</b><br/>When the passer’s leg goes back, step up. A runner past your line when the ball is played is offside.</ComicPanel>
   <ComicPanel tilt={-.8} tone="teal"><b>Keys</b><br/>W-S step up and drop. A-D slide. 1-4 send that defender to press. P pauses.</ComicPanel>
  </aside>
  <aside className={styles.side} data-side="right" aria-hidden="true">
   <ComicPanel tilt={1.2} tone="paper" className={styles.sideMedals}><b>Medals</b>{HL.medals.map((m,i)=><span key={m}><i className={styles.medal} data-level={i+1} data-on/>{MEDAL_NAMES[i]}<em>{m.toLocaleString('en-US')}</em></span>)}</ComicPanel>
   <ComicPanel tilt={-1} tone="red"><b>Press with care</b><br/>Tap a defender to press a heavy touch or a passer who waits. A press leaves a gap.</ComicPanel>
   <ComicPanel tilt={.8} tone="sun"><b>Too deep?</b><br/>Drop for a long ball. But sit near your own box and they shoot from distance.</ComicPanel>
  </aside>
  <div className={styles.stage} ref={stage} data-holdtheline-stage>
   <canvas ref={bgEl} className={styles.canvas} aria-hidden="true"/>
   <canvas ref={fgEl} className={styles.canvas} aria-hidden="true"/>
   <i className={styles.probe} data-hl-probe aria-hidden="true"/>
   <div ref={focusEl} className={styles.play} tabIndex={0} role="application" aria-label="Hold the Line. Drag to move your back line: up to step up, down to drop, sideways to slide. Tap a defender to press. Keys: W and S step up and drop, A and D slide, 1 to 4 press."/>
   {live&&<div className={styles.strip} data-holdtheline-hud data-holdtheline-phase={hud.cp} data-holdtheline-wave={hud.wave} aria-live="polite" aria-label={`${hud.goals} goals against, ${tn.limit} allowed. Attack ${Math.min(HL.waves,hud.wave+1)} of ${HL.waves}. ${hud.stops} stops.`}>
    <span className={styles.lives} key={`l${goals}`} data-hit={goals>0||undefined}>{Array.from({length:tn.limit+1},(_,i)=><i key={i} data-s={i<hud.goals?'goal':undefined} data-last={i===tn.limit||undefined}/>)}</span>
    <span className={styles.stripItem}><small>{daily?'Match of the Day':team.name}</small>{Math.min(HL.waves,hud.wave+1)}/{HL.waves}</span>
    <span className={styles.stops}><Flag size={17}/>{hud.stops}</span>
   </div>}
   {playing&&goals>0&&<i className={styles.flash} key={`f${goals}`} aria-hidden="true"/>}
   {playing&&guide&&<div className={styles.guide} data-holdtheline-guide={guide} aria-live="polite">
    {guide==='watch'?<p><span aria-hidden="true">▲</span> Watch the <b>passer</b>. When the leg goes back, get ready to step up.</p>
     :<><p><b>Now step up!</b> Drag UP. The runner is left past your line: offside!</p><i className={styles.guideHand} aria-hidden="true">☝</i></>}
   </div>}
   {playing&&!guide&&(note||hint)&&<p className={styles.hint} data-holdtheline-hint data-note={note?true:undefined} key={note||hint}>{note||hint}</p>}
   <div className={styles.words} aria-live="polite">{words.map(w=><span key={w.id} className={styles.word} data-teach={w.teach||undefined} onAnimationEnd={()=>setWords(l=>l.filter(x=>x.id!==w.id))}>
    <ComicBurst word={w.text} size={w.text.length>10?19:26} tilt={w.id%2?-4:3} color={w.tone==='red'?'#f0452e':w.tone==='teal'?'#19b5a5':w.tone==='paper'?'#fff3d6':'#ffc83a'} fill={w.tone==='red'?'#fff3d6':undefined}/>
    {w.pts>0&&<b className={`${comicNumeral} ${styles.pts}`}>+{w.pts}</b>}</span>)}</div>
  </div>
  <ArcadeTopBar game="holdtheline" className={styles.topBar} backTitle="Back to arcade" onBack={leave} value={live?hud.score:undefined} word="pts" bumpKey={hud.score} paused={phase==='paused'} canPause={live} onPause={()=>phase==='playing'?pause():resume()}/>
  {phase==='paused'&&<ArcadePauseCard game="holdtheline" score={`${hud.score} pts · ${hud.goals} against · attack ${Math.min(HL.waves,hud.wave+1)} of ${HL.waves}`} status={entry.message||undefined} onResume={resume} onExit={leave} onRestart={()=>{void start({daily:r.daily,league:r.league,match:r.match});}} restartDisabled={busy} keys={[['W / S','step up, drop'],['A / D','slide'],['1 - 4','press'],['P','pause']]}/>}
  {phase==='playing'&&tip&&<ComicCard label={team.name} title={team.name} badge={daily?'Match of the Day':`${LEAGUES[r.league].name} · match ${r.match+1}`} badgeTone={daily?'teal':'red'} best={VENUES[daily?2:r.league].name} data-holdtheline-card="tip" data-holdtheline-team={team.id}>
   <p className={styles.style}><i style={{background:team.kit,borderColor:team.trim==='#231a2e'?undefined:team.trim}} aria-hidden="true"/>{team.style}{game.current&&game.current.backs===3?' · small-sided: a back three':''}</p>
   <ComicPanel tone="sun" tilt={-1} className={styles.lesson}><b>{team.lesson}</b>{team.tip}</ComicPanel>
   <p className={styles.learn}>{HL.waves} attacks. Let in <b>{tn.limit} or fewer</b> to win. No goals = a clean sheet and three stars.</p>
   <div className={styles.actions}><ComicButton variant="primary" wide onClick={ack} data-holdtheline-ack autoFocus>Kick off</ComicButton></div>
  </ComicCard>}
  {phase==='menu'&&<ComicCard label="Hold the Line" title="Hold the Line" badge="You are the defence" badgeTone="teal" best={save.best>0?`Best ${save.best}`:undefined} data-holdtheline-card="start">
   <TrapArt/>
   <p className={styles.learn}><b>Drag</b> to move your back line as one. Step up just before the pass and the runner is <b>offside</b>. <b>Tap</b> a defender to press.</p>
   {entry.message&&<p className={styles.status} role="status">{entry.message}</p>}
   <div className={styles.actions}>
    <ComicButton variant="primary" wide disabled={busy} onClick={()=>{void start({league,match:nextM});}} data-holdtheline-play autoFocus>{allDone?'Play':'Play the season'}<small>{LEAGUES[league].name} · match {nextM+1}: {TEAMS[nextM].name}</small></ComicButton>
    <ComicButton variant="teal" wide disabled={busy} onClick={()=>{void start({daily:true});}} data-holdtheline-daily>Match of the Day<small>{dailyToday?.counted?<>Today: <Stars n={dailyToday.stars} size={13}/> · play again</>:'One pattern, the same for everyone today'}</small></ComicButton>
   </div>
   <button type="button" className={styles.shelf} onClick={()=>{tap();setBook(true);}} data-holdtheline-shelf aria-label={`Trap book: ${save.book.length} of ${HL_FEATS.length} pages. Open`}>
    <span>Trap book <b>{save.book.length}/{HL_FEATS.length}</b></span>
    <span className={styles.shelfRow}>{HL_FEATS.map(f=><Flag key={f.id} color={f.color} off={!save.book.includes(f.id)} size={22}/>)}</span>
   </button>
   <p className={styles.run} data-holdtheline-run>Clean sheets in a row: <b>{save.cleanRun}</b>{save.cleanBest>0&&<> · best <b>{save.cleanBest}</b></>}</p>
   <div className={styles.actions} data-row="three">
    <ComicButton size="small" onClick={()=>{tap();setMapLeague(league);setMap(true);}} data-holdtheline-season>Season {matchesWon(save,league)}/{TEAMS.length}</ComicButton>
    <ComicButton size="small" onClick={()=>{tap();setScores(true);}} data-holdtheline-scores>Scores</ComicButton>
   </div>
  </ComicCard>}
  {phase==='over'&&result&&<ComicCard label="Full time" badge={result.daily?'Match of the Day':result.won?(result.stars===3?'Clean sheet':'You win'):'Full time'} badgeTone={result.daily?'teal':'red'} best={result.daily?undefined:result.settled.newBest?undefined:`Best ${result.settled.save.best}`} data-holdtheline-card="results" data-holdtheline-score={result.score} data-holdtheline-stars={result.stars} data-holdtheline-won={result.won?1:0}>
   <div className={styles.scoreRow}>
    <Stars n={result.stars} size={44}/>
    {result.settled.newBest&&!result.daily&&<ComicBurst word="New best!" size={17} tilt={7} className={styles.stamp}/>}
   </div>
   <strong className={`${comicNumeral} ${styles.score}`} data-new-best={result.settled.newBest||undefined}>{result.score}</strong>
   <p className={styles.versus}>{team.name}: <b>{result.goals}</b> {result.goals===1?'goal':'goals'} · your stops: <b>{result.stops}</b></p>
   {!result.daily&&<ComicMedalTrack score={result.score} best={result.settled.previousBest} medals={HL.medals} names={MEDAL_NAMES} data-holdtheline-medal={medalFor(result.score)}/>}
   <ComicPanel tone="sun" tilt={-1.2} className={styles.near} data-holdtheline-near>{result.line}</ComicPanel>
   <div className={styles.hsSlot} data-hs-slot/>
   <div className={styles.actions}>
    {result.daily?<ComicButton variant="primary" wide disabled={busy} onClick={()=>{void start({daily:true});}} data-holdtheline-again autoFocus>Play it again</ComicButton>
     :result.won&&result.settled.opened>=0?<ComicButton variant="primary" wide disabled={busy} onClick={()=>{void start({league:result.league,match:result.settled.opened});}} data-holdtheline-next autoFocus>Next match<small>{TEAMS[result.settled.opened].name}</small></ComicButton>
     :result.settled.promoted?<ComicButton variant="primary" wide disabled={busy} onClick={()=>{void start({league:1,match:0});}} data-holdtheline-next autoFocus>Play the {LEAGUES[1].name}</ComicButton>
     :<ComicButton variant="primary" wide disabled={busy} onClick={()=>{void start({league:result.league,match:result.match});}} data-holdtheline-again autoFocus>{result.won?'Play again':'Try again'}</ComicButton>}
    <ComicButton size="small" onClick={()=>{tap();setMapLeague(result.league);setMap(true);}} data-holdtheline-season>Season</ComicButton>
    <ComicButton size="small" onClick={()=>{tap();setScores(true);}}>Scores</ComicButton>
   </div>
   <div className={styles.chips}>
    <ComicStat value={result.offsides} label="Offsides"/>
    <ComicStat value={result.tackles} label="Tackles"/>
    <ComicStat value={result.bestRow} label="In a row"/>
    <ComicStat value={result.settled.cleanRun} label="Clean run"/>
   </div>
   <p className={styles.coach} data-holdtheline-coach>{result.coach}</p>
   {result.settled.newFeats.length>0&&<ComicPanel tone="teal" flat className={styles.prizes} data-holdtheline-prizes>
    {result.settled.newFeats.map(id=>{const f=HL_FEATS.find(x=>x.id===id)!;return <span key={id}><Flag color={f.color} size={24}/><em><b>New trap book page: {f.name}</b></em></span>;})}
   </ComicPanel>}
   <ComicPanel tone="paper" flat className={styles.fact} data-holdtheline-fact><b>{result.settled.tip.title}</b>{result.settled.tip.line}</ComicPanel>
   {(result.coins>0||entry.message)&&<p className={styles.status} role="status">{entry.message||`+${result.coins} ${result.coins===1?'coin':'coins'}`}</p>}
  </ComicCard>}
  {board&&phase==='over'&&<HighScoreEntry game="holdtheline" score={board.score} detail="Points for every stop: most for an offside trap, then a tackle, a block, a slide and a swept long ball. More for stops in a row, a win and a clean sheet. The Island Premier scores more." onClose={()=>setBoard(null)}/>}
  {scores&&<HoldTheLineScores onClose={()=>setScores(false)}/>}
  {book&&<BoardDialog label="Trap book" title="Trap book" onClose={()=>setBook(false)}>
   <p data-board-learn className={styles.boardLearn}>One page for each feat of defending. Fill the book!</p>
   <ul className={styles.shelfList} data-holdtheline-booklist>{HL_FEATS.map(f=>{const has=save.book.includes(f.id);return <li key={f.id} data-has={has||undefined}><Flag color={f.color} off={!has} size={34}/><span><b>{has?f.name:'Empty page'}</b>{f.how}</span></li>;})}</ul>
  </BoardDialog>}
  {map&&phase!=='playing'&&phase!=='paused'&&<BoardDialog label="Season" title={LEAGUES[mapLeague].name} onClose={()=>setMap(false)}>
   <p data-board-learn className={styles.boardLearn}>Ten teams, ten problems. Win a match to meet the next team. {seasonStars(save,mapLeague)}/{TEAMS.length*3} stars.</p>
   <div className={styles.leagues}>{LEAGUES.map((l,i)=><ComicButton key={l.id} size="small" variant={i===mapLeague?'primary':'paper'} disabled={!leagueOpen(save,i)} onClick={()=>{tap();setMapLeague(i);}} data-holdtheline-league={i}>{l.name}{!leagueOpen(save,i)&&<small>Win all ten to go up</small>}</ComicButton>)}</div>
   <ol className={styles.map} data-holdtheline-map>{TEAMS.map((t,i)=>{const open=matchOpen(save,mapLeague,i),st=save.season[mapLeague]?.[i]??0;return <li key={t.id}>
    <button type="button" disabled={!open||busy} data-open={open||undefined} data-won={st>0||undefined} onClick={()=>{void start({league:mapLeague,match:i});}} data-holdtheline-match={i}>
     <i style={{background:open?t.kit:undefined}} aria-hidden="true">{i+1}</i><span><b>{open?t.name:'Not met yet'}</b><small>{open?`${t.style} · ${t.lesson}`:'Win the match before'}</small></span><Stars n={st} size={15}/></button></li>;})}</ol>
  </BoardDialog>}
 </div>;
}
