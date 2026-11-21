'use client';
/**
 * Safe Hands (Nov 21 2026, docs/arcade-aaa/safehands-direction.md): you are the goalkeeper. Rules: lib/arcade/safehands/core.ts (pure,
 * seeded, fixed 1/120 s steps). Drawing: view.ts (canvas 2D, comic print). Sound: audio.ts. This shell owns the thumb, the keys and the cards.
 * One thumb: before the kick DRAG to set your position (left-right along the line, up to step off it). After the whistle one SWIPE is
 * your move: left / right = dive low, up-left / up-right = dive high, up = tip over, no swipe = stay and catch. Decisions (the wall,
 * a cross, a loose ball) are big buttons.
 * Keys: A-D / arrows shuffle, W-S / up-down step out and back; after the whistle left / right dive low, Q / E dive high, up tips over,
 * Space dives on a loose ball; 2-4 pick the wall, 1-3 answer a cross. P / Escape pauses.
 * Heat: the loop runs only while a shot is on (menu, round cards, pause, results and a hidden tab draw nothing). 30 draws a second on
 * phones, 60 on desktop. HUD state at most 10 times a second. One static canvas + one moving canvas, no particles, no timers.
 * Teaches (AGENTS.md): set position, narrow the angle, stay big, read the striker's body, catch vs parry vs punch, command your
 * area, the wall.
 */
import React,{useCallback,useEffect,useRef,useState} from 'react';
import dynamic from 'next/dynamic';
import {retryImport} from '@/lib/retryImport';
import {ArcadeTopBar} from '../arcade/ArcadeTopBar';
import {ArcadePauseCard} from '../arcade/ArcadePauseCard';
import {BoardDialog} from '../arcade/BoardsPanel';
import {arcadeSkin} from './skins';
import {comicRoot,comicNumeral,ComicButton,ComicCard,ComicPanel,ComicStat,ComicBurst,ComicMedalTrack} from './comic';
import styles from './SafeHandsGame.module.css';
import {createSafeHands,safehandsDailySeed,dailyTakers,medalFor,SH,TIERS,STRIKERS,SH_FEATS,MEDAL_NAMES,KIND_NAME,SAVE_KINDS,GOAL_WHYS,type SafeHands,type ShEvent,type Act,type Phase as CorePhase,type Kind,type Decision,type FeatId} from '@/lib/arcade/safehands/core';
import {createSafehandsView,VENUES,type SafehandsView} from '@/lib/arcade/safehands/view';
import {createSafehandsAudio,type SafehandsAudio} from '@/lib/arcade/safehands/audio';
import {frameCapSlot} from '@/lib/town/frameCap';
import {readSafehandsSave,writeSafehandsSave,settleSafehands,nearMissLine,coachLine,emptySafehandsSave,habitKnown,cardsStarted,WHY_LINE,SCOUT_NEED,type SafehandsSave,type SafehandsSettled,type ScoutNote} from '@/lib/arcade/safehands/save';
import {arcadeFeedback} from '@/lib/arcade/arcadeFeedback';
import {useArcadeEntry} from '@/lib/arcade/useArcadeEntry';
import {creditRun,arcadeCoinTarget} from '@/lib/arcade/arcadeWallet';
import {saveArcadeRecord} from '@/lib/arcade/arcadeRecords';
import {beginBoardSession} from '@/lib/arcade/boardClient';
import {noteLastScore} from '@/lib/arcade/lastScore';
import {localPlayDay} from '@/lib/town/dailyPlay';
const HighScoreEntry=dynamic(()=>retryImport(()=>import('../arcade/HighScoreEntry')),{ssr:false});
const SafeHandsScores=dynamic(()=>retryImport(()=>import('./SafeHandsScores')),{ssr:false});

type Phase='menu'|'playing'|'paused'|'over';
type Hud={score:number;lives:number;tier:number;shotN:number;streak:number;cp:CorePhase;kind:Kind|'';loose:boolean;decided:boolean;log:string};
type Result={score:number;daily:boolean;rounds:number;won:boolean;saves:number;shots:number;held:number;fingertips:number;bestStreak:number;early:number;dailySaves:number;settled:SafehandsSettled;line:string;coach:string;coins:number};
type Word={id:number;text:string;pts:number;tone:'sun'|'red'|'teal'|'paper';teach:boolean;x:number;y:number};
export const SAFEHANDS_COIN_REASON='Safe Hands: run';
/** a swipe is this many px; a thumb that was dragging at the whistle must flick this fast (px/s) to count as a dive */
const SWIPE=22,CARRY_SPEED=700;
const SAVE_WORD=['SAFE HANDS!','SAVE!','FINGERTIPS!','TIPPED OVER!','BLOCKED!','GOT IT!','KEEPER’S!','PUNCHED CLEAR!'];
/** The first time a kind of shot comes: one line on what to do. */
const KIND_HINT:Record<Kind,string>={
 pen:'Penalty: stay on your line. Watch her planted foot, then swipe to dive.',
 one:'One on one: drag up to come out and make the goal small. Stay big.',
 far:'Long shot: drag up two or three steps to narrow the angle.',
 free:'Free kick: the wall guards one side. Stand in the open side.',
 cross:'Cross: catch it if you are free, punch it in a crowd, stay if it is far.',
 head:'Header! Watch which way the head turns.',reb:'Rebound! Get up and save again.'};
const classify=(dx:number,dy:number):Act=>Math.abs(dx)>=Math.abs(dy)*.6?((dx<0?'L':'R')+(-dy>Math.abs(dx)*.45?'H':'')) as Act:dy<0?'up':'down';

function Glove({color,off,size=20}:{color?:string;off?:boolean;size?:number}){
 return <svg className={styles.glove} width={size} height={size} viewBox="0 0 24 24" data-off={off||undefined} aria-hidden="true"><path d="M6.5 22v-8.2L4 10.6l1.6-2 2.4 2V5.2a1.5 1.5 0 0 1 3 0V4a1.5 1.5 0 0 1 3 0v1.2a1.5 1.5 0 0 1 3 0v2.3a1.5 1.5 0 0 1 3 0V15c0 4-2.2 7-6 7z" fill={off?'none':color??'#ffc83a'}/><path d="M7.5 18.5h10" /></svg>;
}
/** The start card's picture: the keeper at full stretch, fingertips on the ball. */
function SaveArt(){
 return <svg className={styles.art} viewBox="0 0 220 84" aria-hidden="true">
  <rect x="0" y="68" width="220" height="16" fill="#4fb85c" stroke="#231a2e" strokeWidth="3"/>
  <path d="M14 70V10h192v60" fill="none" stroke="#231a2e" strokeWidth="9" strokeLinejoin="round"/><path d="M14 70V10h192v60" fill="none" stroke="#fffaf0" strokeWidth="4.5" strokeLinejoin="round"/>
  <path d="M30 10v58M50 10v58M70 10v58M90 10v58M110 10v58M130 10v58M150 10v58M170 10v58M190 10v58M14 26h192M14 42h192M14 58h192" stroke="#231a2e" strokeOpacity=".22" strokeWidth="1.5"/>
  <g transform="translate(118 44) rotate(-58)"><path d="M-10 26V-4a10 10 0 0 1 20 0v30z" fill="#19b5a5" stroke="#231a2e" strokeWidth="3"/><path d="M-10 4a10 10 0 0 1 20 0z" fill="#f2b98a" stroke="#231a2e" strokeWidth="3"/><path d="M-5 -10v-16M5 -10v-16" stroke="#231a2e" strokeWidth="7" strokeLinecap="round"/><path d="M-5 -10v-16M5 -10v-16" stroke="#19b5a5" strokeWidth="3.5" strokeLinecap="round"/><circle cx="-5" cy="-29" r="5" fill="#ffc83a" stroke="#231a2e" strokeWidth="2.5"/><circle cx="5" cy="-29" r="5" fill="#ffc83a" stroke="#231a2e" strokeWidth="2.5"/><path d="M-5 26v10M5 26v10" stroke="#231a2e" strokeWidth="6" strokeLinecap="round"/></g>
  <circle cx="178" cy="24" r="9" fill="#fffaf0" stroke="#231a2e" strokeWidth="2.5"/><path d="M175 20l5 0 2 4-4 3-4-3z" fill="#231a2e"/>
  <path d="M192 12l7-6M194 24l10 0M190 36l8 5" stroke="#231a2e" strokeWidth="3" strokeLinecap="round"/>
 </svg>;
}
function Medal({level,on}:{level:number;on:boolean}){return <span className={styles.medal} data-level={level} data-on={on||undefined} aria-hidden="true"><i/></span>;}
/** The career ladder: four rounds, the ones cleared are ticked. */
function Ladder({rounds,at}:{rounds:number;at?:number}){return <ol className={styles.ladder} aria-label={`Career: ${rounds} of ${TIERS.length} rounds cleared`}>{TIERS.map((t,i)=><li key={t.id} data-done={i<rounds||undefined} data-at={i===at||undefined}><i aria-hidden="true">{i<rounds?'✓':i+1}</i>{t.name}</li>)}</ol>;}

export default function SafeHandsGame({onExit}:{onExit:()=>void}){
 const [phase,setPhase]=useState<Phase>('menu'),phaseRef=useRef<Phase>('menu');
 const blank:Hud={score:0,lives:SH.lives,tier:0,shotN:0,streak:0,cp:'tip',kind:'',loose:false,decided:false,log:''};
 const [hud,setHud]=useState<Hud>(blank),hudRef=useRef(hud),hudAt=useRef(0);
 const [save,setSave]=useState<SafehandsSave>(emptySafehandsSave),[result,setResult]=useState<Result|null>(null),[today,setToday]=useState('');
 const [board,setBoard]=useState<{score:number}|null>(null),[scores,setScores]=useState(false),[shelf,setShelf]=useState(false),[scout,setScout]=useState(false),[words,setWords]=useState<Word[]>([]);
 const [hint,setHint]=useState(''),[note,setNote]=useState(''),[tip,setTip]=useState(-1),[startTier,setStartTier]=useState(0),[goals,setGoals]=useState(0);
 const entry=useArcadeEntry('safehands');
 const stage=useRef<HTMLDivElement>(null),focusEl=useRef<HTMLDivElement>(null),bgEl=useRef<HTMLCanvasElement>(null),fgEl=useRef<HTMLCanvasElement>(null);
 const game=useRef<SafeHands|null>(null),view=useRef<SafehandsView|null>(null),audio=useRef<SafehandsAudio|null>(null);
 const raf=useRef(0),draws=useRef(0),cost=useRef({n:0,ms:0,max:0}),last=useRef(0),slot=useRef(0),urgent=useRef(false),stopUntil=useRef(0),frameMs=useRef(1000/30),endAt=useRef(0),wordId=useRef(0);
 const run=useRef<{id:string;daily:boolean;day:string;done:boolean;scout:ScoutNote[];kinds:string[];feats:FeatId[]}>({id:'',daily:false,day:'',done:true,scout:[],kinds:[],feats:[]});
 const ptr=useRef<{id:number;sx:number;sy:number;wx:number;wd:number;mode:''|'move'|'swipe';carry:boolean;t:number;done:boolean}|null>(null);
 const keys=useRef({left:false,right:false,up:false,down:false}),seen=useRef<Set<string>>(new Set()),reduced=useRef(false),frameRef=useRef<(t:number)=>void>(()=>{});

 const change=useCallback((p:Phase)=>{phaseRef.current=p;setPhase(p);},[]);
 useEffect(()=>{const s=readSafehandsSave();setSave(s);seen.current=new Set(s.seenKinds);setToday(localPlayDay(Date.now()));},[]);
 useEffect(()=>{if(!hint)return;const t=setTimeout(()=>setHint(''),7000);return()=>clearTimeout(t);},[hint]);
 const kick=useCallback(()=>{if(!raf.current&&phaseRef.current==='playing'){last.current=0;slot.current=0;raf.current=requestAnimationFrame(t=>frameRef.current(t));}},[]);
 const say=useCallback((text:string,pts:number,tone:Word['tone'],teach=false,at?:{x:number;y:number})=>{const w:Word={id:++wordId.current,text,pts,tone,teach,x:at?.x??-1,y:at?.y??-1};setWords(list=>[...list.filter(x=>!(teach&&x.teach)).slice(-2),w]);},[]);

 /* ---- the run's end: save, coins, board (once per run) ---- */
 const finish=useCallback(()=>{
  const g=game.current,r=run.current;if(!g||r.done)return;r.done=true;const s=g.state,score=s.score,stats={...s.stats},rounds=s.won?TIERS.length:s.daily?0:s.tier;
  const settled=settleSafehands(readSafehandsSave(),{score,daily:r.daily,day:r.day,rounds,won:s.won,stats,feats:s.feats,scout:r.scout,dailySaves:s.dailySaves,kinds:r.kinds});writeSafehandsSave(settled.save);setSave(settled.save);
  if(!r.daily)saveArcadeRecord('safehands',score);else noteLastScore('safehands_daily',s.dailySaves,settled.dailyBest);
  const coins=arcadeCoinTarget('safehands',{points:score});if(coins>0)void creditRun(r.id,'safehands',coins,SAFEHANDS_COIN_REASON);
  setResult({score,daily:r.daily,rounds,won:s.won,saves:stats.saves,shots:stats.shots,held:stats.held,fingertips:stats.fingertips,bestStreak:stats.bestStreak,early:stats.early,dailySaves:s.dailySaves,settled,coins,
   line:nearMissLine({score,best:settled.previousBest,newBest:settled.newBest,daily:r.daily,dailySaves:s.dailySaves,rounds,won:s.won,gloves:settled.save.gloves.length}),coach:coachLine(stats,r.daily)});
  if(score>0&&!r.daily)setBoard({score});
  if(settled.newMedal||settled.newGloves.length){audio.current?.medal(Math.max(1,settled.medal));arcadeFeedback(null,'goal');}
  ptr.current=null;setWords([]);setHint('');setNote('');setTip(-1);view.current?.clear();change('over');
 },[change]);

 /* ---- one rules event: sound, haptics, words ---- */
 const onEvent=useCallback((e:ShEvent)=>{
  const a=audio.current,v=view.current,g=game.current;if(!g)return;v?.onEvent(e,g);const s=g.state;
  const at=()=>{const r=s.res,w=stage.current?.clientWidth??390;if(!r||!v)return undefined;const p=v.project(r.x,r.y+.5,s.kd);return {x:Math.max(100,Math.min(w-100,p.x)),y:p.y-46};};
  switch(e.type){
   case 'tier':a?.round();setTip(e.a);break;
   case 'attack':{const k=e.word as Kind;if(k!=='head'&&k!=='reb')run.current.kinds.push(k);setNote('');if(!seen.current.has(k)){seen.current.add(k);setHint(KIND_HINT[k]);}else if(k==='reb'||k==='head')setHint(KIND_HINT[k]);break;}
   case 'whistle':a?.whistle(e.word==='head'||e.word==='reb');break;
   case 'touch':a?.alert();arcadeFeedback(null,'collect');say('HEAVY TOUCH!',0,'red',true);break;
   case 'strike':a?.kick(e.a/100);break;
   case 'commit':a?.dive();break;
   case 'deflect':a?.alert();say('DEFLECTED!',0,'paper',true);break;
   case 'cross':a?.kick(.45);break;
   case 'wall':setNote(e.b?'Good wall. Now stand in the open side.':'Not the best wall for this spot. Cover what it leaves open.');break;
   case 'save':{const kind=SAVE_KINDS[e.a],r=s.res;a?.glove(kind==='held'||kind==='claim'||kind==='smother'?0:kind==='fingertip'?2:kind==='tip'||kind==='punch'?3:1);a?.cheer(kind==='fingertip');arcadeFeedback(null,kind==='fingertip'?'perfect':'combo');
    // the close call: the world holds for one beat on a fingertip save (a single freeze, not a loop)
    if(kind==='fingertip'&&!reduced.current)stopUntil.current=performance.now()+340;
    say(SAVE_WORD[e.a],e.points,kind==='fingertip'?'red':kind==='held'||kind==='claim'?'teal':'sun',false,at());
    setNote(r?.early?'You read it early!':r?.right?'The right call.':r?.posOk?'Great position.':kind==='held'?'Caught and held. No rebound.':kind==='parry'?'Pushed wide, away from goal.':'');break;}
   case 'spill':a?.spill();say('SPILLED!',0,'paper',false,at());setNote(s.shot?.kind==='cross'?'A catch in a crowd is risky. Punch it next time.':'Too hard to catch. Push hard shots wide.');break;
   case 'goal':a?.goal();arcadeFeedback(null,'slam');setGoals(n=>n+1);say('GOAL',0,'paper',false,at());setNote(WHY_LINE[GOAL_WHYS[e.a]]);break;
   case 'life':if(e.b===1)say('CLEAN SHEET: +1 GLOVE',0,'teal',true);break;
   case 'clear':a?.clear();a?.cheer(true);say(`${e.word.toUpperCase()} CLEARED!`,e.points,'sun',true);break;
   case 'feat':a?.prize();run.current.feats.push(e.word as FeatId);say('NEW GLOVES!',0,'teal',true);break;
   case 'scout':run.current.scout.push({striker:e.word,bits:e.b,saved:e.points===1});break;
   case 'over':a?.over(e.b===1);endAt.current=performance.now()+(reduced.current?700:1500);if(e.b===1)say('CUP WINNERS!',e.points,'red',true);else if(s.daily)say('FULL TIME!',0,'paper',true);else if(e.a===0)say('FULL TIME!',0,'paper',true);break;
  }
 },[say]);

 const doAct=useCallback((a:Act)=>{const g=game.current;if(!g||phaseRef.current!=='playing')return false;const ok=g.act(a);if(ok){urgent.current=true;setHint('');}return ok;},[]);

 /* ---- the loop: fixed steps in the core; 30 draws a second on phones, 60 on desktop; an action draws on the very next vsync ---- */
 useEffect(()=>{frameRef.current=(now:number)=>{
  raf.current=0;const g=game.current,v=view.current;if(phaseRef.current!=='playing'||!g||!v)return;
  const next=urgent.current?now:frameCapSlot(now,slot.current,frameMs.current);urgent.current=false;
  if(next<0){raf.current=requestAnimationFrame(t=>frameRef.current(t));return;}slot.current=next;
  const dt=last.current?Math.min(.1,(now-last.current)/1000):1/60;last.current=now;
  const k=keys.current,s=g.state;if((k.left||k.right||k.up||k.down)&&(s.phase==='set'||s.phase==='wall'||s.phase==='cross'))g.nudge(((k.right?1:0)-(k.left?1:0))*SH.moveX*1.2*dt,((k.up?1:0)-(k.down?1:0))*SH.moveD*1.2*dt);
  const c0=performance.now();if(now>=stopUntil.current){g.advance(dt);g.drain(onEvent);}
  v.render(g,now/1000);draws.current++;{const c=cost.current,ms=performance.now()-c0;c.n++;c.ms+=ms;if(ms>c.max)c.max=ms;}// frame cost (rules + draw) for scripts/check-safehands-browser.cjs
  if(now-hudAt.current>100){const hh=hudRef.current,n:Hud={score:s.score,lives:s.lives,tier:s.tier,shotN:s.shotN,streak:s.streak,cp:s.phase,kind:s.shot?.kind??'',loose:!!g.looseBall(),decided:!!s.decision,log:s.dailyLog.join('')};
   let diff=false;for(const key of Object.keys(n) as (keyof Hud)[])if(n[key]!==hh[key]){diff=true;break;}if(diff){hudAt.current=now;hudRef.current=n;setHud(n);}}
  if(s.over){if(endAt.current&&now>=endAt.current){finish();return;}}
  else if(s.phase==='tip')return;// the round card is up: the loop sleeps until it is read
  raf.current=requestAnimationFrame(t=>frameRef.current(t));
 };},[finish,onEvent]);

 /* ---- start / restart ---- */
 const start=useCallback(async(daily:boolean)=>{
  (audio.current??=createSafehandsAudio()).unlock();
  const id=await entry.enter();if(!id)return;
  const day=localPlayDay(Date.now()),seed=daily?safehandsDailySeed(day):1+Math.floor(Math.random()*2_000_000_000),sv=readSafehandsSave(),tier=daily?0:Math.min(startTier,sv.rounds,TIERS.length-1);
  game.current=createSafeHands({seed,daily,startTier:tier});run.current={id,daily,day,done:false,scout:[],kinds:[],feats:[]};stopUntil.current=0;endAt.current=0;ptr.current=null;
  if(!daily)beginBoardSession('safehands');
  // the keeper wears the newest pair of gloves from the shelf
  {const lastGlove=[...SH_FEATS].reverse().find(f=>sv.gloves.includes(f.id));view.current?.setLook({glove:lastGlove?.color??'#ffc83a'});}
  audio.current?.hush(false);setResult(null);setBoard(null);setWords([]);setToday(day);setHint('');setNote('');setGoals(0);
  game.current.drain(()=>{});const h={...blank,tier:game.current.state.tier};hudRef.current=h;setHud(h);setTip(daily?99:tier);
  change('playing');{const g=game.current,v=view.current;if(v)v.render(g,performance.now()/1000);}focusEl.current?.focus({preventScroll:true});
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[change,entry,startTier]);
 /** The round card is read: the whistle. */
 const ack=useCallback(()=>{const g=game.current;if(!g||phaseRef.current!=='playing'||tip<0)return;audio.current?.unlock();audio.current?.tap();setTip(-1);g.ack();g.drain(onEvent);kick();focusEl.current?.focus({preventScroll:true});},[kick,onEvent,tip]);
 const pause=useCallback(()=>{if(phaseRef.current!=='playing')return;if(raf.current)cancelAnimationFrame(raf.current);raf.current=0;ptr.current=null;const g=game.current;if(g?.state.over){finish();return;}audio.current?.hush(true);change('paused');},[change,finish]);
 const resume=useCallback(()=>{if(phaseRef.current!=='paused')return;audio.current?.unlock();audio.current?.hush(false);change('playing');kick();},[change,kick]);
 const leave=useCallback(()=>{if(raf.current)cancelAnimationFrame(raf.current);raf.current=0;onExit();},[onExit]);
 const wall=useCallback((n:number)=>{const g=game.current;if(g?.wall(n)){audio.current?.tap();urgent.current=true;}},[]);
 const choose=useCallback((d:Decision)=>{const g=game.current;if(g?.choose(d)){urgent.current=true;setHud(h=>({...h,decided:true}));}},[]);

 /* ---- the canvases, size, the thumb ---- */
 useEffect(()=>{
  const el=stage.current,bg=bgEl.current,fg=fgEl.current;if(!el||!bg||!fg)return;
  reduced.current=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile=matchMedia('(pointer: coarse)').matches;frameMs.current=1000/(mobile?30:60);
  const v=view.current=createSafehandsView(bg,fg,{reduced:reduced.current});
  // the keeper is the player's own island bean: body colour, skin and hair from their saved look (loaded on demand)
  void Promise.all([import('@/lib/town/customization'),import('@/lib/town/quizProgress')]).then(([c,q])=>{const p=q.getQuizProgress(),l=c.beanLookFor(c.loadCustomization(p.completed,p.total));v.setLook({body:l.body,skin:l.skin,hair:l.hair?.color??'#231a2e'});redraw();}).catch(()=>{});
  const idle=createSafeHands({seed:1});
  const redraw=()=>{const g=game.current;if(phaseRef.current==='menu'||!g)v.render(idle,0);else if(phaseRef.current!=='over')v.render(g,performance.now()/1000);};
  const fit=()=>{const r=el.getBoundingClientRect(),probe=el.querySelector<HTMLElement>('[data-sh-probe]'),topClear=(probe?.offsetHeight||56)+50;v.resize(Math.max(1,r.width),Math.max(1,r.height),window.devicePixelRatio||1,topClear);redraw();};
  fit();const ro=new ResizeObserver(fit);ro.observe(el);
  const local=(e:PointerEvent)=>{const r=el.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};};
  const down=(e:PointerEvent)=>{if(phaseRef.current!=='playing'||(e.pointerType==='mouse'&&e.button!==0)||(e.target instanceof Element&&e.target.closest('button')))return;
   const g=game.current;if(!g)return;e.preventDefault();audio.current?.unlock();if(g.state.over){endAt.current=1;return;}
   const p=local(e);try{el.setPointerCapture(e.pointerId);}catch{/* fine without */}
   const cp=g.state.phase;/* the gesture starts as what the moment calls for: a drag before the whistle, a swipe after it */
   ptr.current={id:e.pointerId,sx:p.x,sy:p.y,wx:g.state.wantX,wd:g.state.wantD,mode:cp==='run'||cp==='fly'?'swipe':cp==='set'||cp==='wall'||cp==='cross'?'move':'',carry:false,t:performance.now(),done:false};};
  const move=(e:PointerEvent)=>{const q=ptr.current,g=game.current;if(!q||!g||e.pointerId!==q.id||phaseRef.current!=='playing')return;e.preventDefault();const p=local(e),cp=g.state.phase,now=performance.now();
   if(cp==='set'||cp==='wall'||cp==='cross'){if(q.mode!=='move'){q.mode='move';q.sx=p.x;q.sy=p.y;q.wx=g.state.wantX;q.wd=g.state.wantD;}const gain=v.gain;g.move(q.wx+(p.x-q.sx)/gain.x*1.15,q.wd-(p.y-q.sy)/gain.d);}
   else if(cp==='run'||cp==='fly'){if(q.mode!=='swipe'){q.carry=q.mode==='move';q.mode='swipe';q.sx=p.x;q.sy=p.y;q.t=now;}if(q.done)return;const dx=p.x-q.sx,dy=p.y-q.sy,d=Math.hypot(dx,dy);
    if(d>=SWIPE&&(!q.carry||d/Math.max(.016,(now-q.t)/1000)>=CARRY_SPEED)){q.done=true;doAct(classify(dx,dy));}
    else if(q.carry&&now-q.t>130){q.sx=p.x;q.sy=p.y;q.t=now;}}};
  const up=(e:PointerEvent)=>{const q=ptr.current;if(!q||e.pointerId!==q.id)return;try{el.releasePointerCapture(e.pointerId);}catch{/* gone */}ptr.current=null;};
  const opt={passive:false} as const;
  el.addEventListener('pointerdown',down,opt);el.addEventListener('pointermove',move,opt);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
  const noScroll=(e:TouchEvent)=>{if(phaseRef.current==='playing'&&e.cancelable)e.preventDefault();};el.addEventListener('touchmove',noScroll,opt);
  const noMenu=(e:Event)=>e.preventDefault();el.addEventListener('contextmenu',noMenu);
  if(process.env.NODE_ENV!=='production')(window as unknown as {__safehands?:unknown}).__safehands={get game(){return game.current;},get phase(){return phaseRef.current;},get loop(){return raf.current!==0;},get draws(){return draws.current;},get cost(){return cost.current;},get view(){return view.current;},get audio(){return audio.current;},get stage(){return el.getBoundingClientRect();}};
  return()=>{ro.disconnect();el.removeEventListener('pointerdown',down);el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up);el.removeEventListener('touchmove',noScroll);el.removeEventListener('contextmenu',noMenu);
   if(raf.current)cancelAnimationFrame(raf.current);raf.current=0;v.dispose();view.current=null;game.current=null;audio.current?.dispose();audio.current=null;delete (window as unknown as {__safehands?:unknown}).__safehands;};
 },[doAct]);

 /* ---- keys; looked away: pause ---- */
 useEffect(()=>{
  const away=()=>pause(),hidden=()=>{if(document.hidden)pause();};
  const isUi=(e:KeyboardEvent)=>e.target instanceof HTMLElement&&!!e.target.closest('button,input,select,textarea,a,dialog');
  const map:Record<string,'left'|'right'|'up'|'down'>={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down'};
  const dive:Record<string,Act>={ArrowLeft:'L',KeyA:'L',ArrowRight:'R',KeyD:'R',KeyQ:'LH',KeyE:'RH',ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down'};
  const key=(e:KeyboardEvent)=>{if(isUi(e))return;
   if(e.code==='Escape'||e.code==='KeyP'){e.preventDefault();if(phaseRef.current==='playing')pause();else if(phaseRef.current==='paused')resume();return;}
   const g=game.current;if(phaseRef.current!=='playing'||!g)return;audio.current?.unlock();const s=g.state;
   if(s.over){if(e.code==='Enter'||e.code==='Space'){e.preventDefault();endAt.current=1;}return;}
   if(s.phase==='tip'){if(e.code==='Enter'||e.code==='Space'){e.preventDefault();ack();}return;}
   if(s.phase==='wall'&&/^(Digit|Numpad)[234]$/.test(e.code)){e.preventDefault();wall(Number(e.code.slice(-1)));return;}
   if(s.phase==='cross'&&/^(Digit|Numpad)[123]$/.test(e.code)){e.preventDefault();choose((['claim','punch','stay'] as const)[Number(e.code.slice(-1))-1]);return;}
   if(e.code==='Space'||e.code==='Enter'){e.preventDefault();if(!e.repeat&&g.looseBall())doAct('down');return;}
   if(s.phase==='run'||s.phase==='fly'){const a=dive[e.code];if(a){e.preventDefault();if(!e.repeat)doAct(a);}return;}
   const m=map[e.code];if(m){e.preventDefault();keys.current[m]=true;}};
  const keyUp=(e:KeyboardEvent)=>{const m=map[e.code];if(m)keys.current[m]=false;};
  window.addEventListener('blur',away);document.addEventListener('visibilitychange',hidden);window.addEventListener('keydown',key);window.addEventListener('keyup',keyUp);
  return()=>{window.removeEventListener('blur',away);document.removeEventListener('visibilitychange',hidden);window.removeEventListener('keydown',key);window.removeEventListener('keyup',keyUp);};
 },[pause,resume,ack,wall,choose,doAct]);

 const dailyToday=save.daily.day===today?save.daily:null,busy=entry.pending,live=phase==='playing'||phase==='paused',best=save.best;
 const tap=()=>{(audio.current??=createSafehandsAudio()).unlock();audio.current.tap();};
 const daily=run.current.daily&&live,T=TIERS[hud.tier],cards=cardsStarted(save),unlocked=Math.min(save.rounds,TIERS.length-1),takers=today?dailyTakers(safehandsDailySeed(today)):[];
 const playing=phase==='playing'&&tip<0;
 return <div className={`${styles.game} ${arcadeSkin.safehands} ${comicRoot}`} data-game="safehands" data-arcade-kind="safehands" data-phase={phase}>
  <aside className={styles.side} data-side="left" aria-hidden="true">
   <ComicPanel tilt={-1.5} tone="paper"><b>Set your position</b><br/>Before the kick, drag to stand between the ball and the middle of your goal. Drag up to step off your line.</ComicPanel>
   <ComicPanel tilt={1} tone="sun"><b>Read, then dive</b><br/>The foot she plants next to the ball points where the shot goes. Swipe that way. Swipe up and across for a high dive.</ComicPanel>
   <ComicPanel tilt={-.8} tone="teal"><b>Keys</b><br/>A-D shuffle. W-S step out. After the whistle: left / right dive low, Q / E dive high, up tips over. P pauses.</ComicPanel>
  </aside>
  <aside className={styles.side} data-side="right" aria-hidden="true">
   <ComicPanel tilt={1.2} tone="paper" className={styles.sideMedals}><b>Medals</b>{SH.medals.map((m,i)=><span key={m}><Medal level={i+1} on/>{MEDAL_NAMES[i]}<em>{m.toLocaleString('en-US')}</em></span>)}</ComicPanel>
   <ComicPanel tilt={-1} tone="red"><b>Three goals</b><br/>Let in three goals and it is full time. A round with no goals gives one back.</ComicPanel>
   <ComicPanel tilt={.8} tone="sun"><b>Catch or push?</b><br/>Catch soft shots. Push hard shots wide: a hard shot caught in the middle is spilled.</ComicPanel>
  </aside>
  <div className={styles.stage} ref={stage} data-safehands-stage>
   <canvas ref={bgEl} className={styles.canvas} aria-hidden="true"/>
   <canvas ref={fgEl} className={styles.canvas} aria-hidden="true"/>
   <i className={styles.probe} data-sh-probe aria-hidden="true"/>
   <div ref={focusEl} className={styles.play} tabIndex={0} role="application" aria-label="Safe Hands. Before the kick, drag to set the goalkeeper's position. After the whistle, swipe to dive. Keys: A and D shuffle, W and S step out and back, arrows dive, Q and E dive high."/>
   {live&&<div className={styles.strip} data-safehands-hud data-safehands-phase={hud.cp} data-safehands-kind={hud.kind} aria-live="polite" aria-label={daily?`Shot ${Math.min(SH.dailyShots,hud.shotN+1)} of ${SH.dailyShots}`:`${hud.lives} goals left. ${T.name}, shot ${Math.min(SH.shotsPerTier,hud.shotN+1)} of ${SH.shotsPerTier}.`}>
    {daily?<span className={styles.pips}>{Array.from({length:SH.dailyShots},(_,i)=><i key={i} data-s={hud.log[i]==='1'?'save':hud.log[i]==='0'?'goal':undefined}/>)}</span>
     :<span className={styles.lives} key={`l${goals}`} data-hit={goals>0||undefined}>{Array.from({length:SH.lives},(_,i)=><Glove key={i} off={i>=hud.lives} size={19}/>)}</span>}
    <span className={styles.stripItem}><small>{daily?'Daily Shootout':T.name}</small>{daily?`${Math.min(SH.dailyShots,hud.shotN+1)}/${SH.dailyShots}`:`${Math.min(SH.shotsPerTier,hud.shotN+1)}/${SH.shotsPerTier}`}</span>
    {hud.streak>=2&&<span className={styles.streak} key={hud.streak} data-safehands-streak={hud.streak}>{hud.streak} in a row</span>}
   </div>}
   {playing&&hud.kind&&<span className={styles.kind} data-safehands-kindtag>{KIND_NAME[hud.kind as Kind]}</span>}
   {playing&&goals>0&&<i className={styles.flash} key={`f${goals}`} aria-hidden="true"/>}
   {playing&&hud.cp==='wall'&&<div className={styles.decide} data-safehands-decide="wall"><b>How many in the wall?</b><div>{[2,3,4].map(n=><ComicButton key={n} variant={n===3?'primary':'paper'} onClick={()=>wall(n)} data-safehands-wall={n}>{n}</ComicButton>)}</div><small>Ball in the middle: more. Ball out wide: fewer.</small></div>}
   {playing&&hud.cp==='cross'&&!hud.decided&&<div className={styles.decide} data-safehands-decide="cross"><b>Cross! Your call:</b><div><ComicButton variant="teal" onClick={()=>choose('claim')} data-safehands-choose="claim">Catch</ComicButton><ComicButton variant="primary" onClick={()=>choose('punch')} data-safehands-choose="punch">Punch</ComicButton><ComicButton onClick={()=>choose('stay')} data-safehands-choose="stay">Stay</ComicButton></div><small>Free in your small box: catch. A crowd: punch. Far out: stay.</small></div>}
   {playing&&hud.loose&&hud.cp==='set'&&<div className={styles.decide} data-safehands-decide="loose"><div><ComicButton variant="primary" wide onClick={()=>doAct('down')} data-safehands-smother>Dive on the ball!</ComicButton></div></div>}
   {playing&&(note||hint)&&!(hud.cp==='wall'||(hud.cp==='cross'&&!hud.decided)||(hud.loose&&hud.cp==='set'))&&<p className={styles.hint} data-safehands-hint data-note={note?true:undefined} key={note||hint}>{note||hint}</p>}
   <div className={styles.words} aria-live="polite">{words.map(w=><span key={w.id} className={styles.word} data-teach={w.teach||undefined} style={w.x>=0?{left:w.x,top:w.y}:undefined} onAnimationEnd={()=>setWords(l=>l.filter(x=>x.id!==w.id))}>
    <ComicBurst word={w.text} size={w.teach?22:w.text.length>10?17:22} tilt={w.id%2?-4:3} color={w.tone==='red'?'#f0452e':w.tone==='teal'?'#19b5a5':w.tone==='paper'?'#fff3d6':'#ffc83a'} fill={w.tone==='red'?'#fff3d6':undefined}/>
    {w.pts>0&&<b className={`${comicNumeral} ${styles.pts}`}>+{w.pts}</b>}</span>)}</div>
  </div>
  <ArcadeTopBar game="safehands" className={styles.topBar} backTitle="Back to arcade" onBack={leave} value={live?hud.score:undefined} word="pts" bumpKey={hud.score} paused={phase==='paused'} canPause={live} onPause={()=>phase==='playing'?pause():resume()}/>
  {phase==='paused'&&<ArcadePauseCard game="safehands" score={daily?`${hud.log.split('1').length-1} saved · shot ${Math.min(SH.dailyShots,hud.shotN+1)} of ${SH.dailyShots}`:`${hud.score} pts · ${T.name} · ${hud.lives} ${hud.lives===1?'goal':'goals'} left`} status={entry.message||undefined} onResume={resume} onExit={leave} onRestart={()=>{void start(run.current.daily);}} restartDisabled={busy} keys={[['A / D','shuffle'],['W / S','step out, back'],['Arrows','dive'],['Q / E','dive high'],['P','pause']]}/>}
  {phase==='playing'&&tip>=0&&(tip===99
   ?<ComicCard label="Daily Shootout" title="Daily Shootout" badge="Five penalties" badgeTone="teal" data-safehands-card="tip">
     <p className={styles.learn}>Five takers. The same five for everyone today. Stay on your line, watch the <b>planted foot</b>, then dive.</p>
     <ol className={styles.takers}>{takers.map(i=><li key={i}><i style={{background:STRIKERS[i].kit}} aria-hidden="true">{STRIKERS[i].num}</i><b>{STRIKERS[i].name}</b><small>{habitKnown(save.scout[STRIKERS[i].id],0)?STRIKERS[i].habits[0]:'Not scouted yet'}</small></li>)}</ol>
     <div className={styles.actions}><ComicButton variant="primary" wide onClick={ack} data-safehands-ack autoFocus>Kick off</ComicButton></div>
    </ComicCard>
   :<ComicCard label={TIERS[tip].name} title={TIERS[tip].name} badge={`Round ${tip+1} of ${TIERS.length}`} badgeTone="red" best={VENUES[TIERS[tip].venue].name} data-safehands-card="tip" data-safehands-tier={tip}>
     <ComicPanel tone="sun" tilt={-1} className={styles.lesson}><b>{TIERS[tip].lesson}</b>{TIERS[tip].tip}</ComicPanel>
     <p className={styles.learn}>{SH.shotsPerTier} shots: {[...new Set(TIERS[tip].kinds)].map(k=>KIND_NAME[k].toLowerCase()).join(', ')}.</p>
     <Ladder rounds={tip} at={tip}/>
     <div className={styles.actions}><ComicButton variant="primary" wide onClick={ack} data-safehands-ack autoFocus>Kick off</ComicButton></div>
    </ComicCard>)}
  {phase==='menu'&&<ComicCard label="Safe Hands" title="Safe Hands" badge="You are the keeper" badgeTone="teal" best={best>0?`Best ${best}`:undefined} data-safehands-card="start">
   <SaveArt/>
   <p className={styles.learn}><b>Drag</b> to set your position before the kick. Watch the striker: the <b>planted foot</b> points where the shot goes. Then <b>swipe</b> to dive. Catch soft shots, push hard ones wide.</p>
   <Ladder rounds={save.rounds}/>
   {entry.message&&<p className={styles.status} role="status">{entry.message}</p>}
   <div className={styles.actions}>
    <ComicButton variant="primary" wide disabled={busy} onClick={()=>{void start(false);}} data-safehands-play autoFocus>Play<small>{startTier>0&&unlocked>0?`From ${TIERS[Math.min(startTier,unlocked)].name}`:'Career: four rounds'}</small></ComicButton>
    <ComicButton variant="teal" wide disabled={busy} onClick={()=>{void start(true);}} data-safehands-daily>Daily Shootout<small>{dailyToday?.counted?`Today: ${dailyToday.saves} out of ${SH.dailyShots} · play again`:'Five penalties. Same takers for everyone today'}</small></ComicButton>
    {unlocked>0&&<ComicButton size="small" wide onClick={()=>{tap();setStartTier(t=>(Math.min(t,unlocked)+1)%(unlocked+1));}} data-safehands-from>Start at: {TIERS[Math.min(startTier,unlocked)].name}</ComicButton>}
   </div>
   <button type="button" className={styles.shelf} onClick={()=>{tap();setShelf(true);}} data-safehands-shelf aria-label={`Glove shelf: ${save.gloves.length} of ${SH_FEATS.length} pairs. Open`}>
    <span>Glove shelf <b>{save.gloves.length}/{SH_FEATS.length}</b></span>
    <span className={styles.shelfRow}>{SH_FEATS.map(f=><Glove key={f.id} color={f.color} off={!save.gloves.includes(f.id)} size={22}/>)}</span>
   </button>
   <div className={styles.actions} data-row="three">
    <ComicButton size="small" onClick={()=>{tap();setScout(true);}} data-safehands-scout>Scouting {cards}/{STRIKERS.length}</ComicButton>
    <ComicButton size="small" onClick={()=>{tap();setScores(true);}} data-safehands-scores>Scores</ComicButton>
   </div>
  </ComicCard>}
  {phase==='over'&&result&&<ComicCard label="Full time" badge={result.daily?'Daily Shootout':result.won?'Cup winners':'Full time'} badgeTone={result.daily?'teal':'red'} best={result.settled.newBest?undefined:result.daily?`Today ${result.settled.dailyBest}/${SH.dailyShots}`:`Best ${result.settled.save.best}`} data-safehands-card="results" data-safehands-score={result.score} data-safehands-saves={result.saves}>
   <div className={styles.scoreRow}>
    <strong className={`${comicNumeral} ${styles.score}`} data-new-best={result.settled.newBest||undefined}>{result.daily?`${result.dailySaves}/${SH.dailyShots}`:result.score}</strong>
    {result.settled.newBest&&<ComicBurst word="New best!" size={17} tilt={7} className={styles.stamp}/>}
   </div>
   {result.daily?<p className={styles.dailyLine}>saved today · {result.score} pts</p>
    :<ComicMedalTrack score={result.score} best={result.settled.previousBest} medals={SH.medals} names={MEDAL_NAMES} data-safehands-medal={medalFor(result.score)}/>}
   <ComicPanel tone="sun" tilt={-1.2} className={styles.near} data-safehands-near>{result.line}</ComicPanel>
   <div className={styles.hsSlot} data-hs-slot/>
   <div className={styles.actions}>
    <ComicButton variant="primary" wide disabled={busy} onClick={()=>{void start(result.daily);}} data-safehands-again autoFocus>Play again</ComicButton>
    <ComicButton size="small" disabled={busy} onClick={()=>{void start(!result.daily);}} data-safehands-other>{result.daily?'Career':'Daily Shootout'}</ComicButton>
    <ComicButton size="small" onClick={()=>{tap();setScores(true);}}>Scores</ComicButton>
   </div>
   <div className={styles.chips}>
    <ComicStat value={result.saves} label="Saves"/>
    <ComicStat value={result.held} label="Held"/>
    <ComicStat value={result.bestStreak} label="In a row"/>
    {!result.daily&&<ComicStat value={`${result.rounds}/${TIERS.length}`} label="Rounds"/>}
   </div>
   <p className={styles.coach} data-safehands-coach>{result.coach}</p>
   {(result.settled.newGloves.length>0||result.settled.newHabits.length>0)&&<ComicPanel tone="teal" flat className={styles.prizes} data-safehands-prizes>
    {result.settled.newGloves.map(id=>{const f=SH_FEATS.find(x=>x.id===id)!;return <span key={id}><Glove color={f.color} size={22}/><em><b>New gloves: {f.name}</b></em></span>;})}
    {result.settled.newHabits.map(([i,h])=><span key={`${i}-${h}`}><i style={{background:STRIKERS[i].kit}} aria-hidden="true">{STRIKERS[i].num}</i><em><b>Scouted {STRIKERS[i].name}:</b> {STRIKERS[i].habits[h]}</em></span>)}
   </ComicPanel>}
   <ComicPanel tone="paper" flat className={styles.fact} data-safehands-fact><b>{result.settled.tip.title}</b>{result.settled.tip.line}</ComicPanel>
   {(result.coins>0||entry.message)&&<p className={styles.status} role="status">{entry.message||`+${result.coins} ${result.coins===1?'coin':'coins'}`}</p>}
  </ComicCard>}
  {board&&phase==='over'&&<HighScoreEntry game="safehands" score={board.score} detail="Points for every save: more for a catch, a fingertip save, an early read, a good position and a long run of saves. Bonus for each round cleared." onClose={()=>setBoard(null)}/>}
  {scores&&<SafeHandsScores onClose={()=>setScores(false)}/>}
  {shelf&&<BoardDialog label="Glove shelf" title="Glove shelf" onClose={()=>setShelf(false)}>
   <p data-board-learn className={styles.boardLearn}>Win a pair of gloves for each feat. Your keeper wears the newest pair.</p>
   <ul className={styles.shelfList} data-safehands-shelflist>{SH_FEATS.map(f=>{const has=save.gloves.includes(f.id);return <li key={f.id} data-has={has||undefined}><Glove color={f.color} off={!has} size={34}/><span><b>{has?f.name:'Empty slot'}</b>{f.how}</span></li>;})}</ul>
  </BoardDialog>}
  {scout&&<BoardDialog label="Striker scouting cards" title="Scouting cards" onClose={()=>setScout(false)}>
   <p data-board-learn className={styles.boardLearn}>Every striker has habits. See a habit {SCOUT_NEED} times and it is written on the card.</p>
   <ul className={styles.scoutList} data-safehands-scoutlist>{STRIKERS.map(st=>{const c=save.scout[st.id],met=!!c&&c.faced>0;return <li key={st.id} data-met={met||undefined}>
    <i style={{background:met?st.kit:undefined}} aria-hidden="true">{met?st.num:'?'}</i>
    <span><b>{met?`${st.name} “${st.nick}”`:'Not met yet'}</b>{met&&<small>Faced {c.faced} · saved {c.saved}</small>}
     {met&&<ul>{st.habits.map((h,i)=>h?<li key={i} data-known={habitKnown(c,i)||undefined}>{habitKnown(c,i)?h:'? Keep watching'}</li>:null)}</ul>}</span></li>;})}</ul>
  </BoardDialog>}
 </div>;
}
