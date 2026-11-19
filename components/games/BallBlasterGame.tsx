'use client';
/**
 * Ball Blaster (Nov 17 2026, docs/arcade-aaa/ballblaster-direction.md): the football gallery shooter. Rules: lib/arcade/ballblaster/core.ts
 * (pure, seeded, fixed 1/120 s steps). Drawing: view.ts (three.js, comic print shading). Sound: audio.ts. This shell owns the thumb, the keys
 * and the cards.
 * One thumb anywhere: press to aim (the ring sits a little above a finger so the finger never hides it), drag to move it, let go to kick.
 * Hold longer = more power (a full-power shot hits twice as hard). A quick sideways flick as you let go curls the ball.
 * Keys: arrows move the ring, Space holds and kicks, hold Q or E while letting go of Space to curl. P / Escape pauses.
 * Heat: the loop runs only while playing (menu, pause, results and a hidden tab draw nothing). At most 60 draws a second. HUD state at
 * most 10 times a second.
 * Teaches (AGENTS.md): "Pick your target. Strike through the ball."
 */
import React,{useCallback,useEffect,useRef,useState} from 'react';
import dynamic from 'next/dynamic';
import {retryImport} from '@/lib/retryImport';
import {ArcadeTopBar} from '../arcade/ArcadeTopBar';
import {ArcadePauseCard} from '../arcade/ArcadePauseCard';
import {arcadeSkin} from './skins';
import {comicRoot,comicNumeral,ComicButton,ComicCard,ComicPanel,ComicStat,ComicBurst} from './comic';
import styles from './BallBlasterGame.module.css';
import {createBallBlaster,ballblasterDailySeed,medalFor,multFor,BB,K,MEDAL_NAMES,P_WORD,type BallBlaster,type BlastEvent} from '@/lib/arcade/ballblaster/core';
import {createBallblasterView,type BallblasterView} from '@/lib/arcade/ballblaster/view';
import {createBallblasterAudio,type BallblasterAudio} from '@/lib/arcade/ballblaster/audio';
import {frameCapSlot} from '@/lib/town/frameCap';
import {readBallblasterSave,writeBallblasterSave,settleBallblaster,nearMissLine,coachLine,liveStreak,emptyBallblasterSave,type BallblasterSave,type BallblasterSettled} from '@/lib/arcade/ballblaster/save';
import {arcadeFeedback} from '@/lib/arcade/arcadeFeedback';
import {useArcadeEntry} from '@/lib/arcade/useArcadeEntry';
import {creditRun,arcadeCoinTarget} from '@/lib/arcade/arcadeWallet';
import {saveArcadeRecord} from '@/lib/arcade/arcadeRecords';
import {beginBoardSession} from '@/lib/arcade/boardClient';
import {noteLastScore} from '@/lib/arcade/lastScore';
import {localPlayDay} from '@/lib/town/dailyPlay';
const HighScoreEntry=dynamic(()=>retryImport(()=>import('../arcade/HighScoreEntry')),{ssr:false});
const BallBlasterScores=dynamic(()=>retryImport(()=>import('./BallBlasterScores')),{ssr:false});

type Phase='menu'|'playing'|'paused'|'over';
type Hud={score:number;hearts:number;rack:number;wave:number;combo:number;power:number;powerN:number;slow:boolean;
 /** the super meter in twentieths, ready, a machine near the goal line, target practice seconds left (0 = none) */sup:number;supReady:boolean;danger:boolean;bonus:number};
type Result={score:number;daily:boolean;wave:number;breaks:number;accuracy:number;tricks:number;bestTrick:number;settled:BallblasterSettled;line:string;coach:string;coins:number};
type Word={id:number;text:string;pts:number;tone:'sun'|'red'|'teal'|'paper';teach:boolean;x:number;y:number;fx:number;fy:number};
export const BALLBLASTER_COIN_REASON='Ball Blaster: run';
/** a finger covers what it presses: on touch the ring sits this far above it */
const TOUCH_LIFT=64,FLICK_PX_S=900,FLICK_LOOK=90;
/** a kick asked for with the rack empty waits this long for the next ball (ms); a machine this close to the line is a danger (m) */
const KICK_BUFFER=320,DANGER_Z=-9;
const SMASH=['POW!','CRASH!','BONK!','SMASH!','CLANG!','KA-BLAM!'],CRACK=['CRACK!','CRUNCH!','THUD!','CRASH!'];

/** The start card's picture: a ball flies at a wind-up robot, pieces fly. */
function BlastArt(){
 return <svg className={styles.art} viewBox="0 0 220 84" aria-hidden="true">
  <rect x="0" y="66" width="220" height="18" fill="#4fb85c" stroke="#231a2e" strokeWidth="3"/>
  <path d="M28 62 Q 92 -6 150 34" fill="none" stroke="#231a2e" strokeWidth="2.5" strokeDasharray="4 5"/>
  <circle cx="30" cy="60" r="8" fill="#fffaf0" stroke="#231a2e" strokeWidth="2.5"/><path d="M27 56 l5 0 2 4 -4 3 -4 -3z" fill="#231a2e"/>
  <g transform="translate(150 22) rotate(-8)"><rect x="-14" y="16" width="28" height="22" fill="#e8e2d4" stroke="#231a2e" strokeWidth="3"/><rect x="-8" y="21" width="16" height="10" fill="#f0452e" stroke="#231a2e" strokeWidth="2"/>
   <rect x="-11" y="0" width="22" height="15" fill="#cfd8dc" stroke="#231a2e" strokeWidth="3"/><rect x="-7" y="5" width="14" height="5" fill="#231a2e"/><path d="M0 0 V-7" stroke="#231a2e" strokeWidth="2.5"/><circle cx="0" cy="-9" r="3" fill="#f0452e" stroke="#231a2e" strokeWidth="2"/>
   <path d="M-7 38 v8 M7 38 v8" stroke="#231a2e" strokeWidth="5" strokeLinecap="round"/></g>
  <path d="M168 10 l6 -8 M176 22 l10 -3 M132 12 l-6 -7" stroke="#231a2e" strokeWidth="3" strokeLinecap="round"/>
  <rect x="182" y="30" width="9" height="9" fill="#f0452e" stroke="#231a2e" strokeWidth="2" transform="rotate(20 186 34)"/><rect x="120" y="40" width="7" height="7" fill="#ffc83a" stroke="#231a2e" strokeWidth="2" transform="rotate(-25 123 43)"/>
 </svg>;
}
function Medal({level,on}:{level:number;on:boolean}){return <span className={styles.medal} data-level={level} data-on={on||undefined} aria-hidden="true"><i/></span>;}
function Hearts({n}:{n:number}){return <span className={styles.hearts} aria-hidden="true">{[0,1,2].map(i=><svg key={i} viewBox="0 0 20 18" data-on={i<n||undefined}><path d="M10 17 C 2 11 0 7 2 4 C 4 1 8 1 10 5 C 12 1 16 1 18 4 C 20 7 18 11 10 17 Z"/></svg>)}</span>;}

export default function BallBlasterGame({onExit}:{onExit:()=>void}){
 const [phase,setPhase]=useState<Phase>('menu'),phaseRef=useRef<Phase>('menu');
 const blank:Hud={score:0,hearts:BB.hearts,rack:BB.rack,wave:0,combo:0,power:0,powerN:0,slow:false,sup:0,supReady:false,danger:false,bonus:0};
 const [hud,setHud]=useState<Hud>(blank),hudRef=useRef(hud),hudAt=useRef(0);
 const [save,setSave]=useState<BallblasterSave>(emptyBallblasterSave),[result,setResult]=useState<Result|null>(null),[today,setToday]=useState('');
 const [board,setBoard]=useState<{score:number}|null>(null),[scores,setScores]=useState(false),[words,setWords]=useState<Word[]>([]);
 const [hint,setHint]=useState(''),[charge,setCharge]=useState(-1),[empty,setEmpty]=useState(0),[leaks,setLeaks]=useState(0);
 const entry=useArcadeEntry('ballblaster');
 const stage=useRef<HTMLDivElement>(null),focusEl=useRef<HTMLDivElement>(null);
 const game=useRef<BallBlaster|null>(null),view=useRef<BallblasterView|null>(null),audio=useRef<BallblasterAudio|null>(null);
 const raf=useRef(0),last=useRef(0),slot=useRef(0),urgent=useRef(false),stopUntil=useRef(0),frameMs=useRef(1000/30),runShots=useRef(0),endAt=useRef(0),wordId=useRef(0),lastLeak=useRef(0),run=useRef({id:'',daily:false,day:'',done:true}),shots=useRef(0);
 /** a kick waiting for a ball, the crowd / danger sound clocks, the charge-full tick, the first super hint */
 const pending=useRef<{x:number;y:number;z:number;power:number;curl:number;t:number}|null>(null),crowdAt=useRef(0),dangerAt=useRef(0),full=useRef(false),superTold=useRef(false);
 /** the aim being held: screen point (already lifted on touch), when it started, the recent path (for the flick) */
 const hold=useRef<{id:number;x:number;y:number;t:number;touch:boolean;path:{t:number;x:number;y:number}[];key:boolean}|null>(null);
 const keys=useRef({left:false,right:false,up:false,down:false,q:false,e:false}),kAim=useRef({x:0,z:-18});
 const reduced=useRef(false),frameRef=useRef<(t:number)=>void>(()=>{});

 const chargeRef=useRef(-1),setCh=useCallback((v:number)=>{chargeRef.current=v;setCharge(v);},[]);
 const change=useCallback((p:Phase)=>{phaseRef.current=p;setPhase(p);},[]);
 useEffect(()=>{setSave(readBallblasterSave());setToday(localPlayDay(Date.now()));},[]);
 /* a coaching hint stays a few seconds; the first one ('Drag to aim') stays until the first kick */
 useEffect(()=>{if(!hint||hint.startsWith('Drag'))return;const t=setTimeout(()=>setHint(''),6500);return()=>clearTimeout(t);},[hint]);
 const kick=useCallback(()=>{if(!raf.current&&phaseRef.current==='playing'){last.current=0;slot.current=0;raf.current=requestAnimationFrame(t=>frameRef.current(t));}},[]);
 const say=useCallback((text:string,pts:number,tone:Word['tone'],teach=false,at?:{x:number;y:number})=>{const w:Word={id:++wordId.current,text,pts,tone,teach,x:at?.x??-1,y:at?.y??-1,fx:0,fy:0};
  // a word never lands on another: it takes the first free place above or below the bursts already there, clear of the top strip
  setWords(list=>{const keep=list.filter(x=>!(teach&&x.teach)).slice(-3);if(w.x>=0){const y0=Math.max(270,w.y),free=(y:number)=>y>=270&&!keep.some(o=>!o.teach&&o.x>=0&&Math.abs(o.x-w.x)<150&&Math.abs(o.y-y)<88);
    w.y=[0,92,-92,184].map(d=>y0+d).find(free)??y0;
    // the points fly from the burst up to the score
    w.fx=(stage.current?.clientWidth??390)/2-w.x;w.fy=44-w.y;}
   return [...keep,w];});},[]);

 /* ---- the run's end: save, coins, board (once per run) ---- */
 const finish=useCallback(()=>{
  const g=game.current,r=run.current;if(!g||r.done)return;r.done=true;const s=g.state,score=s.score,stats={...s.stats},wave=s.wave;
  const settled=settleBallblaster(readBallblasterSave(),{score,daily:r.daily,day:r.day,wave,stats});writeBallblasterSave(settled.save);setSave(settled.save);
  if(!r.daily)saveArcadeRecord('ballblaster',score);else noteLastScore('ballblaster_daily',score,settled.dailyBest);
  const coins=arcadeCoinTarget('ballblaster',{points:score});if(coins>0)void creditRun(r.id,'ballblaster',coins,BALLBLASTER_COIN_REASON);
  setResult({score,daily:r.daily,wave,breaks:stats.breaks,accuracy:stats.shots?Math.round(stats.hits/stats.shots*100):0,tricks:stats.tricks,bestTrick:stats.bestTrick,settled,coins,
   line:nearMissLine({score,best:settled.previousBest,newBest:settled.newBest,daily:r.daily,stats}),coach:coachLine(stats,lastLeak.current)});
  if(score>0&&(!r.daily||settled.dailyFirst))setBoard({score});
  if(settled.newMedal||settled.newBest){audio.current?.medal(Math.max(1,settled.medal));arcadeFeedback(null,'goal');}
  hold.current=null;view.current?.setAim(null);setCh(-1);setWords([]);setHint('');change('over');
 },[change]);

 /* ---- one rules event: sound, haptics, words ---- */
 const onEvent=useCallback((e:BlastEvent)=>{
  const a=audio.current,v=view.current;v?.onEvent(e);const at=()=>{const p=v?.project(e.x,e.y+.6,e.z),w=stage.current?.clientWidth??390;return p&&p.on?{x:Math.max(96,Math.min(w-96,p.x)),y:p.y}:undefined;};
  switch(e.type){
   case 'shot':a?.kick(e.a,e.b,e.kind===4);if(e.kind===4)arcadeFeedback(null,'goal');else if(e.a>=BB.powerShot)arcadeFeedback(null,'shot');break;
   case 'bounce':if(e.kind===1)a?.board();else a?.bounce(e.a<5);break;
   case 'hit':a?.clank();if(e.points>0)say('BONK!',e.points,'paper',false,at());break;
   case 'block':a?.block();say('TONK!',0,'teal',false,at());break;
   case 'break':a?.smash(e.kind,e.a);arcadeFeedback(null,e.kind===K.boss?'goal':'combo');
    // hit-stop: the world holds for a beat on a big break (the rules clock pauses with it)
    if(e.kind===K.boss||e.a>=3||e.kind===K.board)stopUntil.current=performance.now()+(e.kind===K.boss?170:e.a>=5?90:60);
    if(e.kind===K.boss)a?.cheer(true);
    {const word=e.kind===K.boss?'KNOCKOUT!':e.kind===K.target?'DING!':e.kind===K.glass?'TINKLE!':e.kind===K.barrel?'SPLOOSH!':e.kind<10?SMASH[(e.points+e.a)%SMASH.length]:CRACK[(e.points+e.a)%CRACK.length];
     say(e.a>=3&&e.kind!==K.boss?`${word} x${String(multFor(e.a)).replace(/\.?0+$/,'')}`:word,e.points,e.kind===K.boss?'red':e.b?'sun':e.kind<10?'sun':'paper',false,at());}break;
   case 'boom':a?.boom();arcadeFeedback(null,'slam');break;
   case 'topple':if(e.a===0)a?.topple();else say('TIMBER!',0,'paper',false,at());break;
   case 'trick':a?.trick(e.a);if(e.a>=3)a?.cheer(false);stopUntil.current=performance.now()+80;say(`${e.word} ${e.a} HITS`,e.points,'red',false,at());break;
   case 'power':a?.power();say(e.word,0,'teal',true);break;
   case 'dodge':a?.dodge();break;
   case 'leak':a?.leak();a?.groan();setLeaks(n=>n+1);arcadeFeedback(null,'slam');lastLeak.current=e.kind;say(e.kind===K.boss?'IT GOT THROUGH! BACK IT GOES':'IT GOT THROUGH!',0,'paper',true);break;
   case 'empty':a?.empty();setEmpty(n=>n+1);break;
   case 'wave':a?.wave(e.b===1);say(e.word,0,e.b===1?'red':'sun',true);break;
   case 'new':if(e.a>1)setTimeout(()=>say(e.word,0,'teal',true),900);break;
   case 'clear':a?.clear();a?.cheer(false);say(`WAVE CLEAR! ${e.b}% ON TARGET`,e.points,'sun',true);break;
   case 'boss':say(e.word,0,'red',true);break;
   case 'super':if(e.a===0){a?.superReady();arcadeFeedback(null,'perfect');say(e.word,0,'red',true);if(!superTold.current){superTold.current=true;setHint('Super shot! Hold until the bar is red. Then let go.');}}else say(e.word,0,'red',true);break;
   case 'tell':a?.tell();say('STOP IT!',0,'red',false,at());break;
   case 'dash':a?.dash();break;
   case 'shout':if(e.points>0){a?.close();say(e.word,e.points,'teal',false,at());}else{a?.setPiece();say(e.word,0,'paper',true);}break;
   case 'bonus':if(e.a===1){a?.bonus();say(e.word,0,'teal',true);}else{a?.clear();say(`${e.b} OF ${BB.bonusN} TARGETS!`,0,'sun',true);}break;
   case 'heart':a?.heart();arcadeFeedback(null,'goal');say(e.word,0,'red',true);break;
   case 'over':a?.over();arcadeFeedback(null,'slam');endAt.current=performance.now()+(reduced.current?600:1500);say('FULL TIME!',0,'paper',true);break;
  }
 },[say]);

 /* ---- aiming: the screen point -> the pitch, led onto a moving machine ---- */
 const aimFrom=useCallback((sx:number,sy:number,power:number,curl:number)=>{const g=game.current,v=view.current;if(!g||!v)return null;const p=v.pick(g,sx,sy);
  if(p.lock){const e=g.state.ents.find(x=>x.on&&x.id===p.lock);if(e&&e.speed>0){const L=[0,0,0,0,0,0,0,0];g.launch(p.x,p.y,p.z,power,curl,L);const T=Math.hypot(p.x-BB.kx,p.z-BB.kz)/(Math.hypot(L[3],L[5])||1);
   p.z=Math.min(-1.5,p.z+e.speed*(g.state.slowT>0?.4:1)*T*.85);}}
  return p;},[]);
 /** the one-line coach: after the first kick it teaches power and curl, after the second it goes */
 const shotHint=useCallback(()=>{shots.current++;const n=++runShots.current;setHint(h=>!h||n>=2?'':'Hold longer for power. Flick sideways to curl.');},[]);
 const powerAt=(t0:number,now:number)=>Math.max(0,Math.min(1,.45+.55*(now-t0-90)/650));
 const release=useCallback((x:number,y:number,curl:number)=>{const g=game.current,h=hold.current;if(!g||!h)return;hold.current=null;view.current?.setAim(null);setCh(-1);
  const power=powerAt(h.t,performance.now()),p=aimFrom(x,y,power,curl);if(!p)return;urgent.current=true;full.current=false;
  // input buffer: with the rack empty the kick waits a moment for the next ball instead of being lost
  if(g.state.rack<=0&&!g.state.over){pending.current={x:p.x,y:p.y,z:p.z,power,curl,t:performance.now()};return;}
  if(g.shoot(p.x,p.y,p.z,power,curl))shotHint();},[aimFrom,shotHint]);

 /* ---- the loop: fixed steps in the core; 30 draws a second on phones (HANDOFF's cap), 60 on desktop like the other 3D cabinets;
  a press or a kick draws on the very next vsync so the ring and the kick never wait for a slot ---- */
 useEffect(()=>{frameRef.current=(now:number)=>{
  raf.current=0;const g=game.current,v=view.current;if(phaseRef.current!=='playing'||!g||!v)return;
  const next=urgent.current?now:frameCapSlot(now,slot.current,frameMs.current);urgent.current=false;
  if(next<0){raf.current=requestAnimationFrame(t=>frameRef.current(t));return;}slot.current=next;
  const dt=last.current?Math.min(.1,(now-last.current)/1000):1/60;last.current=now;
  // keyboard aim
  const k=keys.current,ka=kAim.current;if(k.left||k.right||k.up||k.down){ka.x=Math.max(-8,Math.min(8,ka.x+((k.right?1:0)-(k.left?1:0))*7*dt));ka.z=Math.max(-46,Math.min(-3,ka.z+((k.down?1:0)-(k.up?1:0))*14*dt));}
  const frozen=now<stopUntil.current;if(!frozen){g.advance(dt);g.drain(onEvent);}
  {const q=pending.current;if(q&&(g.state.rack>0||now-q.t>KICK_BUFFER)){pending.current=null;if(g.shoot(q.x,q.y,q.z,q.power,q.curl))shotHint();}}
  // danger: a machine near the goal line (two low beeps while it lasts); the crowd murmurs on, louder as the game heats up
  let danger=false;for(const e of g.state.ents)if(e.on&&e.kind<10&&e.z>DANGER_Z){danger=true;break;}
  if(danger&&!g.state.over&&now-dangerAt.current>850){dangerAt.current=now;audio.current?.danger();}
  if(now-crowdAt.current>2400&&!g.state.over){crowdAt.current=now;audio.current?.crowd((danger?.5:0)+Math.min(.5,g.state.combo/10)+(g.state.mode==='bonus'?.3:0));}
  const h=hold.current;
  if(h){const pw=powerAt(h.t,now),curl=h.key?(k.e?1:k.q?-1:0):0;
   if(h.key)v.setAim({x:ka.x,y:.6,z:ka.z,power:pw,curl,lock:0});else{const p=aimFrom(h.x,h.y,pw,0);if(p)v.setAim({...p,power:pw,curl:0});}
   if(pw>=BB.powerShot&&!full.current){full.current=true;audio.current?.ready(g.state.supReady);arcadeFeedback(null,'collect');}
   if(Math.abs(pw-chargeRef.current)>.04)setCh(pw);}
  else if(keys.current.left||keys.current.right||keys.current.up||keys.current.down)v.setAim({x:ka.x,y:.6,z:ka.z,power:.45,curl:0,lock:0});
  v.render(g,now/1000,frozen);
  const s=g.state,hh=hudRef.current;
  if(now-hudAt.current>100){const n:Hud={score:s.score,hearts:s.hearts,rack:s.rack,wave:s.wave,combo:s.t-s.comboT<=BB.comboWin?s.combo:0,power:s.power,powerN:s.powerN,slow:s.slowT>0,
    sup:Math.round(s.sup*20),supReady:s.supReady,danger:danger&&!s.over,bonus:s.mode==='bonus'?Math.max(1,Math.ceil(BB.bonusSecs-s.bonusT)):0};
   let diff=false;for(const k of Object.keys(n) as (keyof Hud)[])if(n[k]!==hh[k]){diff=true;break;}if(diff){hudAt.current=now;hudRef.current=n;setHud(n);}}
  if(s.over&&endAt.current&&now>=endAt.current){finish();return;}
  raf.current=requestAnimationFrame(t=>frameRef.current(t));
 // eslint-disable-next-line react-hooks/exhaustive-deps
 };},[finish,onEvent,aimFrom]);

 /* ---- start / restart: one tap, straight onto the pitch ---- */
 const start=useCallback(async(daily:boolean)=>{
  (audio.current??=createBallblasterAudio()).unlock();
  const id=await entry.enter();if(!id)return;
  const day=localPlayDay(Date.now()),seed=daily?ballblasterDailySeed(day):1+Math.floor(Math.random()*2_000_000_000);
  game.current=createBallBlaster({seed,daily});run.current={id,daily,day,done:false};lastLeak.current=0;runShots.current=0;stopUntil.current=0;
  if(!daily||readBallblasterSave().daily.day!==day||!readBallblasterSave().daily.counted)beginBoardSession('ballblaster');
  view.current?.reset();audio.current?.hush(false);pending.current=null;full.current=false;crowdAt.current=0;dangerAt.current=0;setLeaks(0);endAt.current=0;hold.current=null;kAim.current={x:0,z:-18};setResult(null);setBoard(null);setWords([]);setToday(day);setCh(-1);
  setHint(readBallblasterSave().plays<3||shots.current===0?'Drag to aim. Let go to kick.':'');
  game.current.drain(()=>{});hudRef.current=blank;setHud(blank);
  change('playing');kick();focusEl.current?.focus({preventScroll:true});
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[change,entry,kick]);
 const pause=useCallback(()=>{if(phaseRef.current!=='playing')return;if(raf.current)cancelAnimationFrame(raf.current);raf.current=0;
  hold.current=null;pending.current=null;full.current=false;view.current?.setAim(null);setCh(-1);const g=game.current;if(g?.state.over){finish();return;}audio.current?.hush(true);change('paused');},[change,finish]);
 const resume=useCallback(()=>{if(phaseRef.current!=='paused')return;audio.current?.unlock();audio.current?.hush(false);change('playing');kick();},[change,kick]);
 const leave=useCallback(()=>{if(raf.current)cancelAnimationFrame(raf.current);raf.current=0;onExit();},[onExit]);

 /* ---- the 3D view, size, the thumb ---- */
 useEffect(()=>{
  const el=stage.current;if(!el)return;
  reduced.current=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile=matchMedia('(pointer: coarse)').matches;frameMs.current=1000/(mobile?30:60);
  let v:BallblasterView;try{v=view.current=createBallblasterView(el,{reduced:reduced.current,mobile});}catch{return;}
  const fit=()=>{const r=el.getBoundingClientRect(),vv=window.visualViewport,cut=Math.max(0,Math.round(r.bottom-(vv?vv.offsetTop+vv.height:window.innerHeight)));el.style.setProperty('--bb-cut',`${cut}px`);
   v.resize(Math.max(1,r.width),Math.max(1,r.height),window.devicePixelRatio||1);const g=game.current;if(g&&phaseRef.current!=='menu')v.render(g,performance.now()/1000);};
  fit();const ro=new ResizeObserver(fit);ro.observe(el);window.visualViewport?.addEventListener('resize',fit);
  // the menu shows the empty pitch once (one draw), then sleeps
  {const idle=createBallBlaster({seed:1});v.render(idle,0);}
  const local=(e:PointerEvent,touch:boolean)=>{const r=el.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top-(touch?TOUCH_LIFT:0)};};
  const down=(e:PointerEvent)=>{if(phaseRef.current!=='playing'||(e.pointerType==='mouse'&&e.button!==0)||(e.target instanceof Element&&e.target.closest('button')))return;
   const g=game.current;if(!g)return;e.preventDefault();audio.current?.unlock();if(g.state.over){endAt.current=1;return;}
   const touch=e.pointerType!=='mouse',p=local(e,touch),now=performance.now();try{el.setPointerCapture(e.pointerId);}catch{/* fine without */}
   hold.current={id:e.pointerId,x:p.x,y:p.y,t:now,touch,path:[{t:now,x:p.x,y:p.y}],key:false};full.current=false;urgent.current=true;setCh(powerAt(now,now));};
  const move=(e:PointerEvent)=>{const h=hold.current;if(!h||h.key||e.pointerId!==h.id)return;e.preventDefault();const p=local(e,h.touch),now=performance.now();h.x=p.x;h.y=p.y;h.path.push({t:now,x:p.x,y:p.y});while(h.path.length>2&&now-h.path[0].t>260)h.path.shift();};
  const up=(e:PointerEvent)=>{const h=hold.current;if(!h||h.key||e.pointerId!==h.id)return;try{el.releasePointerCapture(e.pointerId);}catch{/* gone */}
   if(e.type==='pointercancel'){hold.current=null;v.setAim(null);setCh(-1);return;}
   // a quick sideways flick at the end curls the ball; the ring stays where it was before the flick
   const now=performance.now(),path=h.path;let back=path[0];for(const q of path)if(now-q.t>=FLICK_LOOK)back=q;const dtF=Math.max(.016,(now-back.t)/1000),vx=(h.x-back.x)/dtF;
   let curl=0,x=h.x,y=h.y;if(Math.abs(vx)>FLICK_PX_S&&Math.abs(h.x-back.x)>Math.abs(h.y-back.y)){curl=Math.max(-1,Math.min(1,vx/2200));if(Math.abs(curl)<.55)curl=Math.sign(curl)*.55;x=back.x;y=back.y;}
   release(x,y,curl);};
  const opt={passive:false} as const;
  el.addEventListener('pointerdown',down,opt);el.addEventListener('pointermove',move,opt);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
  const noScroll=(e:TouchEvent)=>{if(phaseRef.current==='playing'&&e.cancelable)e.preventDefault();};el.addEventListener('touchmove',noScroll,opt);
  const noMenu=(e:Event)=>e.preventDefault();el.addEventListener('contextmenu',noMenu);
  if(process.env.NODE_ENV!=='production')(window as unknown as {__ballblaster?:unknown}).__ballblaster={get game(){return game.current;},get phase(){return phaseRef.current;},get loop(){return raf.current!==0;},get view(){return view.current;},get audio(){return audio.current;},get stage(){return el.getBoundingClientRect();}};
  return()=>{ro.disconnect();window.visualViewport?.removeEventListener('resize',fit);el.removeEventListener('pointerdown',down);el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up);el.removeEventListener('touchmove',noScroll);el.removeEventListener('contextmenu',noMenu);
   if(raf.current)cancelAnimationFrame(raf.current);raf.current=0;v.dispose();view.current=null;game.current=null;audio.current?.dispose();audio.current=null;delete (window as unknown as {__ballblaster?:unknown}).__ballblaster;};
 },[release]);

 /* ---- keys: arrows aim, Space holds and kicks (Q / E held = curl), P / Escape pause; looked away: pause ---- */
 useEffect(()=>{
  const away=()=>pause(),hidden=()=>{if(document.hidden)pause();};
  const isUi=(e:KeyboardEvent)=>e.target instanceof HTMLElement&&!!e.target.closest('button,input,select,textarea,a,dialog');
  const map:Record<string,'left'|'right'|'up'|'down'|'q'|'e'>={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',KeyQ:'q',KeyE:'e'};
  const key=(e:KeyboardEvent)=>{if(isUi(e))return;
   if(e.code==='Escape'||e.code==='KeyP'){e.preventDefault();if(phaseRef.current==='playing')pause();else if(phaseRef.current==='paused')resume();return;}
   const g=game.current;if(phaseRef.current!=='playing'||!g)return;audio.current?.unlock();
   if(g.state.over){if(e.code==='Enter'||e.code==='Space'){e.preventDefault();endAt.current=1;}return;}
   const m=map[e.code];if(m){e.preventDefault();keys.current[m]=true;return;}
   if(e.code==='Space'||e.code==='Enter'){e.preventDefault();if(!e.repeat&&!hold.current){full.current=false;hold.current={id:-1,x:0,y:0,t:performance.now(),touch:false,path:[],key:true};}}};
  const keyUp=(e:KeyboardEvent)=>{const m=map[e.code];if(m){keys.current[m]=false;return;}const g=game.current,h=hold.current;if(!g||phaseRef.current!=='playing'||!h||!h.key)return;
   if(e.code==='Space'||e.code==='Enter'){hold.current=null;view.current?.setAim(null);setCh(-1);const k=keys.current,power=powerAt(h.t,performance.now()),ka=kAim.current;urgent.current=true;if(g.shoot(ka.x,.6,ka.z,power,k.e?1:k.q?-1:0))shotHint();}};
  window.addEventListener('blur',away);document.addEventListener('visibilitychange',hidden);window.addEventListener('keydown',key);window.addEventListener('keyup',keyUp);
  return()=>{window.removeEventListener('blur',away);document.removeEventListener('visibilitychange',hidden);window.removeEventListener('keydown',key);window.removeEventListener('keyup',keyUp);};
 },[pause,resume,shotHint]);

 const streak=today?liveStreak(save,today):0,dailyToday=save.daily.day===today?save.daily:null,busy=entry.pending,live=phase==='playing'||phase==='paused';
 const tap=()=>{(audio.current??=createBallblasterAudio()).unlock();audio.current.tap();};
 const best=save.best,gap=best>0&&hud.score<best?best-hud.score:0;
 return <div className={`${styles.game} ${arcadeSkin.ballblaster} ${comicRoot}`} data-game="ballblaster" data-arcade-kind="ballblaster" data-phase={phase}>
  <aside className={styles.side} data-side="left" aria-hidden="true">
   <ComicPanel tilt={-1.5} tone="paper"><b>Aim and kick</b><br/>Press and drag to aim. Let go to kick. Hold longer for a harder shot.</ComicPanel>
   <ComicPanel tilt={1} tone="sun"><b>Curl it</b><br/>Flick sideways as you let go. The ball bends round shields.</ComicPanel>
   <ComicPanel tilt={-.8} tone="teal"><b>Keys</b><br/>Arrows aim. Space kicks. Hold Q or E for curl. P pauses.</ComicPanel>
  </aside>
  <aside className={styles.side} data-side="right" aria-hidden="true">
   <ComicPanel tilt={1.2} tone="paper" className={styles.sideMedals}><b>Medals</b>{BB.medals.map((m,i)=><span key={m}><Medal level={i+1} on/>{MEDAL_NAMES[i]}<em>{m.toLocaleString('en-US')}</em></span>)}</ComicPanel>
   <ComicPanel tilt={-1} tone="red"><b>Three hearts</b><br/>A machine that reaches your goal line costs a heart. Barrels and towers knock over what is near them.</ComicPanel>
   <ComicPanel tilt={.8} tone="sun"><b>Super shot</b><br/>Breaks fill the Super bar. When it is full, hold for full power and let go.</ComicPanel>
  </aside>
  <div className={styles.stage} ref={stage} data-ballblaster-stage>
   <div ref={focusEl} className={styles.play} tabIndex={0} role="application" aria-label="Ball Blaster. Press and drag to aim, let go to kick. Hold longer for power, flick sideways to curl. Keys: arrows aim, Space kicks, Q or E curl."/>
   {live&&<div className={styles.strip} data-ballblaster-hud aria-live="polite" aria-label={`${hud.hearts} hearts. Wave ${hud.wave}.`}>
    <span className={styles.heartsWrap} key={`h${leaks}`} data-hit={leaks>0||undefined}><Hearts n={hud.hearts}/></span>
    <span className={styles.stripItem} data-ballblaster-best><small>{gap>0?'To best':'Best'}</small>{gap>0?gap:Math.max(best,hud.score)}</span>
    {hud.combo>=2&&<span className={styles.combo} key={hud.combo} data-ballblaster-combo={hud.combo} data-hot={hud.combo>=5||undefined} style={{fontSize:13+Math.min(7,hud.combo-2)}}>x{String(multFor(hud.combo)).replace(/\.?0+$/,'')}<i aria-hidden="true" style={{animationDuration:`${BB.comboWin}s`}}/></span>}
   </div>}
   {live&&<div className={styles.rack} data-ballblaster-rack={hud.rack} data-empty={empty%2===1||undefined} key={`rack${empty}`} aria-hidden="true">
    {Array.from({length:BB.rack},(_,i)=><i key={i} data-off={i>=hud.rack||undefined}/>)}
   </div>}
   {live&&<span className={styles.super} data-ballblaster-super={hud.supReady?'ready':hud.sup*5} data-ready={hud.supReady||undefined} aria-hidden="true"><b style={{transform:`scaleX(${hud.supReady?1:hud.sup/20})`}}/><em>{hud.supReady?'Super! Hold, then kick':'Super'}</em></span>}
   {live&&hud.power>0&&<span className={styles.power} key={hud.power} data-ballblaster-power={hud.power}>{P_WORD[hud.power].replace('!','')}{hud.power!==4?` ${hud.powerN}`:''}</span>}
   {live&&hud.wave>0&&<span className={styles.wave} data-ballblaster-wave={hud.wave} data-bonus={hud.bonus>0||undefined}>{hud.bonus>0?`TARGETS ${hud.bonus}`:`WAVE ${hud.wave}`}</span>}
   {phase==='playing'&&hud.danger&&<i className={styles.alarm} data-ballblaster-danger aria-hidden="true"/>}
   {phase==='playing'&&leaks>0&&<i className={styles.flash} key={`f${leaks}`} aria-hidden="true"/>}
   {live&&charge>=0&&<span className={styles.charge} data-full={charge>=BB.powerShot||undefined} aria-hidden="true"><b style={{transform:`scaleX(${charge})`}}/></span>}
   {phase==='playing'&&hint&&<p className={styles.hint} data-ballblaster-hint>{hint}</p>}
   <div className={styles.words} aria-live="polite">{words.map(w=><span key={w.id} className={styles.word} data-teach={w.teach||undefined} data-fly={w.x>=0&&w.pts>0||undefined} style={w.x>=0?{left:w.x,top:w.y,'--bb-fx':`${w.fx}px`,'--bb-fy':`${w.fy}px`} as React.CSSProperties:undefined} onAnimationEnd={()=>setWords(l=>l.filter(x=>x.id!==w.id))}>
    <ComicBurst word={w.text} size={w.teach?26:w.text.length>8?17:21} tilt={w.id%2?-4:3} color={w.tone==='red'?'#f0452e':w.tone==='teal'?'#19b5a5':w.tone==='paper'?'#fff3d6':'#ffc83a'} fill={w.tone==='red'?'#fff3d6':undefined}/>
    {w.pts>0&&<b className={`${comicNumeral} ${styles.pts}`}>+{w.pts}</b>}</span>)}</div>
  </div>
  <ArcadeTopBar game="ballblaster" className={styles.topBar} backTitle="Back to arcade" onBack={leave} value={live?hud.score:undefined} word="pts" bumpKey={hud.score} paused={phase==='paused'} canPause={live} onPause={()=>phase==='playing'?pause():resume()}/>
  {phase==='paused'&&<ArcadePauseCard game="ballblaster" score={`${hud.score} pts · wave ${hud.wave} · ${hud.hearts} ${hud.hearts===1?'heart':'hearts'}`} status={entry.message||undefined} onResume={resume} onExit={leave} onRestart={()=>{void start(run.current.daily);}} restartDisabled={busy} keys={[['Arrows','aim'],['Space','kick'],['Q / E','curl'],['P','pause']]}/>}
  {phase==='menu'&&<ComicCard label="Ball Blaster" title="Ball Blaster" badge="Pick your target" badgeTone="red" best={best>0?`Best ${best}`:undefined} data-ballblaster-card="start">
   <BlastArt/>
   <p className={styles.learn}>Wind-up robots march at your goal. <b>Drag</b> to aim and <b>let go</b> to kick a ball at them. Hold longer for power. <b>Flick sideways</b> to curl. Break crates, barrels and towers to knock things over. Fill the <b>Super</b> bar for a shot that goes through everything.</p>
   <div className={styles.chips}>
    <ComicStat value={best||'–'} label="Best"/>
    <ComicStat value={<span className={styles.medalRow}>{[1,2,3].map(l=><Medal key={l} level={l} on={save.medal>=l}/>)}</span>} label={save.medal?MEDAL_NAMES[save.medal-1]:'No medal yet'}/>
    <ComicStat value={streak} label={streak===1?'Day in a row':'Days in a row'} tone={streak>0?'sun':undefined} data-ballblaster-streakdays={streak}/>
   </div>
   {entry.message&&<p className={styles.status} role="status">{entry.message}</p>}
   <div className={styles.actions}>
    <ComicButton variant="primary" wide disabled={busy} onClick={()=>{void start(false);}} data-ballblaster-play autoFocus>Play</ComicButton>
    <ComicButton variant="teal" wide disabled={busy} onClick={()=>{void start(true);}} data-ballblaster-daily>Daily Blast<small>{dailyToday?.counted?`Today’s best ${dailyToday.best} · practice`:'Same waves for everyone today'}</small></ComicButton>
    <ComicButton size="small" onClick={()=>{tap();setScores(true);}} data-ballblaster-scores>Scores</ComicButton>
   </div>
  </ComicCard>}
  {phase==='over'&&result&&<ComicCard label="Full time" badge={result.daily?'Daily Blast':'Full time'} badgeTone={result.daily?'teal':'red'} best={result.daily?`Today ${result.settled.dailyBest}`:`Best ${result.settled.save.best}`} data-ballblaster-card="results" data-ballblaster-score={result.score}>
   <div className={styles.scoreRow}>
    <strong className={`${comicNumeral} ${styles.score}`} data-new-best={result.settled.newBest||undefined}>{result.score}</strong>
    {result.settled.newBest&&<ComicBurst word="New best!" size={17} tilt={7} className={styles.stamp}/>}
   </div>
   <div className={styles.medalRow} data-ballblaster-medal={result.settled.medal} role="img" aria-label={result.settled.medal?`${MEDAL_NAMES[result.settled.medal-1]} medal`:'No medal this time'}>{[1,2,3].map(l=><Medal key={l} level={l} on={medalFor(result.score)>=l}/>)}<em>{result.settled.medal?MEDAL_NAMES[result.settled.medal-1]:'No medal yet'}</em></div>
   <ComicPanel tone="sun" tilt={-1.2} className={styles.near} data-ballblaster-near>{result.line}</ComicPanel>
   <div className={styles.hsSlot} data-hs-slot/>
   <div className={styles.actions}>
    <ComicButton variant="primary" wide disabled={busy} onClick={()=>{void start(result.daily);}} data-ballblaster-again autoFocus>Play again</ComicButton>
    <ComicButton size="small" disabled={busy} onClick={()=>{void start(!result.daily);}} data-ballblaster-other>{result.daily?'Endless':'Daily Blast'}</ComicButton>
    <ComicButton size="small" onClick={()=>{tap();setScores(true);}}>Scores</ComicButton>
   </div>
   <div className={styles.chips}>
    <ComicStat value={result.wave} label="Wave"/>
    <ComicStat value={result.breaks} label="Smashed"/>
    <ComicStat value={`${result.accuracy}%`} label="On target"/>
    <ComicStat value={result.bestTrick>=2?`${result.bestTrick} hits`:'–'} label="Best trick"/>
   </div>
   <p className={styles.coach}>{result.coach}</p>
   <ComicPanel tone="paper" flat className={styles.fact} data-ballblaster-fact><b>{result.settled.tip.title}</b>{result.settled.tip.line}</ComicPanel>
   {(result.coins>0||entry.message)&&<p className={styles.status} role="status">{entry.message||`+${result.coins} ${result.coins===1?'coin':'coins'}`}{result.daily&&!result.settled.dailyFirst&&!entry.message?' · practice run (your first run today is on the board)':''}</p>}
  </ComicCard>}
  {board&&phase==='over'&&<HighScoreEntry game="ballblaster" score={board.score} detail="Points for every machine and prop you break, times your combo, plus trick shots and accuracy at the end of each wave." onClose={()=>setBoard(null)}/>}
  {scores&&<BallBlasterScores onClose={()=>setScores(false)}/>}
 </div>;
}
