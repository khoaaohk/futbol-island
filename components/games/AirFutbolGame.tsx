'use client';
/**
 * Air Futbol (Nov 11 2026, docs/arcade-aaa/airhockey-direction.md): the arcade room's air hockey table as the seventh game. Rules
 * and physics: lib/arcade/airhockey/core.ts (pure, seeded, fixed 120 Hz steps). Drawing: view.ts (2D canvas, static table + moving
 * layer, drawn between steps). Sound: audio.ts. Fingers: touch.ts. This shell owns the loop, the pointers and keys and the cards.
 * One player against the machine: an endless line of named opponents, three lives, its own board. (Two players on one device
 * was removed by the owner on Nov 11 2026; online play will not be built.)
 * Heat: the rAF loop runs ONLY while phase === 'playing' AND something moves (the game sleeps while the puck waits for a serve
 * touch with no finger down; start card, pause, results and a hidden tab draw nothing); 60 fps cap; DPR cap 2, dropped to 1.5 when
 * frames run long; the HUD re-renders only when a score, a life or a flag changes; the table hum stops with the loop.
 * Teaches (AGENTS.md): angles and rebounds, the goalkeeper's rule (stay between ball and goal), the counter-attack after a save.
 */
import {useCallback,useEffect,useRef,useState} from 'react';
import dynamic from 'next/dynamic';
import {ArcadeTopBar} from '../arcade/ArcadeTopBar';
import {ArcadePauseCard} from '../arcade/ArcadePauseCard';
import {arcadeSkin} from './skins';
import {comicRoot,comicNumeral,ComicButton,ComicCard,ComicPanel,ComicStat,ComicBurst} from './comic';
import styles from './AirFutbolGame.module.css';
import {createAirFutbol,AH,RAMP,type AirFutbol,type AirEvent} from '@/lib/arcade/airhockey/core';
import {createAirView,toTableX,toTableY,type AirView} from '@/lib/arcade/airhockey/view';
import {createAirAudio,type AirAudio} from '@/lib/arcade/airhockey/audio';
import {createStrikerTouches,type StrikerTouches} from '@/lib/arcade/airhockey/touch';
import {readAirSave,writeAirSave,settleAir,nearLine,emptyAirSave,type AirSave,type AirSettled} from '@/lib/arcade/airhockey/save';
import {arcadeFeedback} from '@/lib/arcade/arcadeFeedback';
import {useArcadeEntry} from '@/lib/arcade/useArcadeEntry';
import {creditRun,arcadeCoinTarget} from '@/lib/arcade/arcadeWallet';
import {saveArcadeRecord} from '@/lib/arcade/arcadeRecords';
import {beginBoardSession} from '@/lib/arcade/boardClient';
import {noteArcadeToday} from '@/lib/arcade/arcadeToday';
import {frameCapSlot} from '@/lib/town/frameCap';
import {requestAnyOrientation} from '@/lib/orientationMode';
const HighScoreEntry=dynamic(()=>import('../arcade/HighScoreEntry'),{ssr:false});
const AirFutbolScores=dynamic(()=>import('./AirFutbolScores'),{ssr:false});

type Phase='menu'|'playing'|'paused'|'over';
/** wait: the puck is waiting for a serve touch. between: the next opponent is walking on. first: nobody has served yet. */
type Hud={score:number;level:number;lives:number;g0:number;g1:number;wait:boolean;between:boolean;first:boolean};
type Result={score:number;level:number;wins:number;bank:number;saves:number;settled:AirSettled;near:string;coins:number};
export const AIR_COIN_REASON='Air Futbol: goals and matches won';
const FRAME_MS=1000/60,KEY_SPEED=250;
/** The arrow keys (or W A S D) drive the striker. */
const KEYS:Record<string,readonly [number,number]>={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],KeyW:[0,-1],KeyS:[0,1],KeyA:[-1,0],KeyD:[1,0]};

/** The idea in one small drawing: a shot off the side board goes round the keeper. */
function BankDiagram(){
 return <svg viewBox="0 0 120 84" width="150" height="105" aria-hidden="true" className={styles.diagram}>
  <rect x="3" y="3" width="114" height="78" fill="#4aa868" stroke="#231a2e" strokeWidth="3"/><path d="M60 3V81M3 28H14V56H3M117 28H106V56H117" fill="none" stroke="#fff3d6" strokeWidth="1.6"/><circle cx="60" cy="42" r="10" fill="none" stroke="#fff3d6" strokeWidth="1.6"/>
  <path d="M30 56 L74 6 L110 38" fill="none" stroke="#231a2e" strokeWidth="2.6" strokeDasharray="5 4" strokeLinecap="round"/><path d="M103 30 L111 39 L100 41" fill="none" stroke="#231a2e" strokeWidth="2.8" strokeLinejoin="round" strokeLinecap="round"/>
  <circle cx="22" cy="62" r="8.5" fill="#19b5a5" stroke="#231a2e" strokeWidth="2.6"/><circle cx="98" cy="48" r="8.5" fill="#f0452e" stroke="#231a2e" strokeWidth="2.6"/><circle cx="31" cy="55" r="4.4" fill="#fff3d6" stroke="#231a2e" strokeWidth="2.2"/>
 </svg>;
}

export default function AirFutbolGame({onExit}:{onExit:()=>void}){
 const [phase,setPhase]=useState<Phase>('menu'),phaseRef=useRef<Phase>('menu');
 const [hud,setHud]=useState<Hud>({score:0,level:1,lives:AH.LIVES,g0:0,g1:0,wait:true,between:false,first:true}),hudRef=useRef(hud);
 const [save,setSave]=useState<AirSave>(emptyAirSave),[result,setResult]=useState<Result|null>(null);
 const [board,setBoard]=useState<{score:number}|null>(null),[scores,setScores]=useState(false),[coarse,setCoarse]=useState(false);
 const entry=useArcadeEntry('airhockey');
 const stage=useRef<HTMLDivElement>(null),bg=useRef<HTMLCanvasElement>(null),fg=useRef<HTMLCanvasElement>(null),probe=useRef<HTMLElement>(null);
 const game=useRef<AirFutbol|null>(null),view=useRef<AirView|null>(null),audio=useRef<AirAudio|null>(null),touches=useRef<StrikerTouches|null>(null);
 const raf=useRef(0),last=useRef(0),slot=useRef(0),endAt=useRef(0),run=useRef({id:'',done:true});
 const size=useRef({w:1,h:1,dpr:1,left:0,top:0}),perf=useRef({frames:0,sum:0,max:0,window:0,windowSum:0,dropped:false,sleeps:0});
 const reduced=useRef(false),fitRef=useRef<()=>void>(()=>{}),keys=useRef<Set<string>>(new Set()),keyHeld=useRef(false);

 const change=useCallback((p:Phase)=>{phaseRef.current=p;setPhase(p);},[]);
 useEffect(()=>{setCoarse(matchMedia('(pointer:coarse)').matches);setSave(readAirSave());},[]);
 useEffect(()=>requestAnyOrientation(),[]);// upright first, but a phone held sideways still plays (the table lies on its side): no rotate card

 /** The rail labels and printed score on the table follow the match. */
 const paintHud=useCallback((g:AirFutbol)=>{const s=g.state;view.current?.setHud({top:`L${s.level} ${g.opponent.name.toUpperCase()}`,bottom:'YOU',goals:[s.goals[0],s.goals[1]],lives:s.lives});},[]);
 /* ---- the run's end: save, coins, today, board (once per run) ---- */
 const finish=useCallback(()=>{
  const g=game.current,r=run.current;if(!g||r.done)return;r.done=true;const s=g.state;audio.current?.quiet();
  const score=Math.floor(s.score),stats={...s.stats},settled=settleAir(readAirSave(),{score,level:s.level,goals:[s.goals[0],s.goals[1]],stats});writeAirSave(settled.save);setSave(settled.save);
  saveArcadeRecord('airhockey',score);const coins=arcadeCoinTarget('airhockey',{points:score});if(coins>0)void creditRun(r.id,'airhockey',coins,AIR_COIN_REASON);
  void noteArcadeToday({kind:'airhockey',score,wins:stats.wins,bank:stats.bank,clean:stats.clean,level:s.level});
  setResult({score,level:s.level,wins:stats.wins,bank:stats.bank,saves:stats.saves,settled,coins,near:nearLine({score,best:settled.previousBest,newBest:settled.newBest,level:s.level,goals:[s.goals[0],s.goals[1]]})});
  if(score>0)setBoard({score});if(settled.newBest)arcadeFeedback(null,'goal');
  view.current?.clear();change('over');
 },[change]);

 /* ---- one rules event: picture, sound, haptics ---- */
 const onEvent=useCallback((e:AirEvent)=>{
  const g=game.current,a=audio.current;if(!g)return;view.current?.onEvent(e);
  switch(e.type){
   case 'hit':a?.hit(e.b,e.a);if(e.a===0)arcadeFeedback(null,e.b>220?'slam':'combo');break;
   case 'wall':a?.wall(e.b);break;
   case 'post':a?.post(e.b);break;
   case 'serve':a?.serve();break;
   case 'save':a?.save();if(e.a===0)arcadeFeedback(null,'level');break;
   case 'goal':if(e.a===0)a?.goal(e.b>0&&e.b<4);else a?.conceded();arcadeFeedback(null,'goal');paintHud(g);break;
   case 'win':a?.win();arcadeFeedback(null,'perfect');break;
   case 'lose':a?.lose();arcadeFeedback(null,'slam');break;
   case 'next':a?.next();paintHud(g);break;
   case 'life':a?.life();break;
   case 'nudge':a?.nudge();break;
   case 'ready':paintHud(g);break;
  }
 },[paintHud]);

 /* ---- the loop: alive only while playing and something moves. Physics run on the core's fixed step; the picture is drawn between steps. ---- */
 const frame=useCallback((now:number)=>{
  raf.current=0;const g=game.current,v=view.current;if(phaseRef.current!=='playing'||!g||!v)return;
  const next=frameCapSlot(now,slot.current,FRAME_MS);
  if(next>=0){slot.current=next;const dt=Math.min(.05,Math.max(0,(now-last.current)/1000));last.current=now;const t0=performance.now(),s=g.state;
   let dx=0,dy=0;for(const code of keys.current){const k=KEYS[code];if(k){dx+=k[0];dy+=k[1];}}// keys: the striker walks at a steady speed
   if(dx||dy){const turn=v.layout.side?1:0,kx=turn?-dy:dx,ky=turn?dx:dy;keyHeld.current=true;g.hold(0,true);g.aim(0,s.sx[0]+kx*KEY_SPEED*dt,s.sy[0]+ky*KEY_SPEED*dt);}else if(keyHeld.current){keyHeld.current=false;if((touches.current?.owner()??-1)<0)g.hold(0,false);}
   g.step(dt);g.drain(onEvent);v.render(g,dt);audio.current?.hum(s.phase==='play'&&!s.inGoal?Math.hypot(s.pvx,s.pvy):0);
   const h=hudRef.current,wait=s.phase==='wait'&&!s.held[0]&&!s.held[1],between=s.phase==='between',first=s.serves===0;
   if(h.score!==s.score||h.level!==s.level||h.lives!==s.lives||h.g0!==s.goals[0]||h.g1!==s.goals[1]||h.wait!==wait||h.between!==between||h.first!==first){const n={score:s.score,level:s.level,lives:s.lives,g0:s.goals[0],g1:s.goals[1],wait,between,first};hudRef.current=n;setHud(n);}
   const cost=performance.now()-t0,p=perf.current;p.frames++;p.sum+=cost;if(cost>p.max)p.max=cost;p.window++;p.windowSum+=cost;
   if(p.window>=90){if(!p.dropped&&p.windowSum/p.window>7&&size.current.dpr>1.5){p.dropped=true;fitRef.current();}p.window=0;p.windowSum=0;}
   if(s.over){if(!endAt.current)endAt.current=now+(reduced.current?300:1500);else if(now>=endAt.current){finish();return;}}
   else if(g.idle&&!v.busy()){p.sleeps++;audio.current?.quiet();return;}// everything at rest, nobody touching: stop drawing until the next touch
  }
  raf.current=requestAnimationFrame(frame);
 },[finish,onEvent]);
 const wake=useCallback(()=>{if(raf.current||phaseRef.current!=='playing')return;last.current=performance.now();slot.current=0;raf.current=requestAnimationFrame(frame);},[frame]);
 const sleep=useCallback(()=>{if(raf.current)cancelAnimationFrame(raf.current);raf.current=0;audio.current?.quiet();},[]);

 /* ---- start / restart: one tap, straight to the serve ---- */
 const start=useCallback(async()=>{
  (audio.current??=createAirAudio()).unlock();
  const id=await entry.enter();if(!id)return;
  touches.current?.clear();keys.current.clear();
  game.current=createAirFutbol({seed:1+Math.floor(Math.random()*2_000_000_000)});run.current={id,done:false};
  beginBoardSession('airhockey');
  view.current?.reset();endAt.current=0;setResult(null);setBoard(null);paintHud(game.current);
  const n:Hud={score:0,level:1,lives:AH.LIVES,g0:0,g1:0,wait:true,between:false,first:true};hudRef.current=n;setHud(n);
  change('playing');view.current?.render(game.current,0);wake();
 },[change,entry,paintHud,wake]);
 const pause=useCallback(()=>{if(phaseRef.current!=='playing')return;sleep();touches.current?.clear();keys.current.clear();change('paused');},[change,sleep]);
 const resume=useCallback(()=>{if(phaseRef.current!=='paused')return;audio.current?.unlock();change('playing');wake();},[change,wake]);
 const leave=useCallback(()=>{sleep();onExit();},[onExit,sleep]);

 /* ---- canvases, size, fingers ---- */
 useEffect(()=>{
  const el=stage.current,b=bg.current,f=fg.current;if(!el||!b||!f)return;
  reduced.current=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const v=view.current=createAirView(b,f,{reduced:reduced.current});
  // Lay out for the VISIBLE viewport: if the page box runs under the browser's bars (iOS with its toolbars), the part below
  // visualViewport is cut off the stage (--air-cut) so both goals stay in view.
  const fit=()=>{const r=el.getBoundingClientRect(),vv=window.visualViewport,cut=Math.max(0,Math.round(r.bottom-(vv?vv.offsetTop+vv.height:window.innerHeight)));el.style.setProperty('--air-cut',`${cut}px`);
   const z=size.current;z.w=Math.max(1,r.width);z.h=Math.max(1,r.height-cut);z.left=r.left;z.top=r.top;z.dpr=perf.current.dropped?1.5:Math.min(2,window.devicePixelRatio||1);
   v.resize(z.w,z.h,z.dpr,(probe.current?.offsetHeight??56)+6,8);const g=game.current;if(g&&(phaseRef.current==='paused'||(phaseRef.current==='playing'&&!raf.current)))v.render(g,0);};
  fitRef.current=fit;fit();const ro=new ResizeObserver(fit);ro.observe(el);window.visualViewport?.addEventListener('resize',fit);
  // Fingers (lib/arcade/airhockey/touch.ts): the first finger down drives the striker, anywhere on the table; palms and extra
  // fingers are ignored; a striker can never stay glued to a finger that has lifted (window listeners + touch reconciliation, the same
  // safety net as lib/arcade/stickRelease.ts, because iOS can end a touch without this element's pointerup).
  const aimAt=(cx:number,cy:number)=>{const z=size.current,L=v.layout,px=cx-z.left,py=cy-z.top;game.current?.aim(0,toTableX(L,px,py),toTableY(L,px,py));};
  const t=touches.current=createStrikerTouches(()=>{if(!keyHeld.current)game.current?.hold(0,false);},(x,y)=>{game.current?.hold(0,true);aimAt(x,y);});
  const live=()=>phaseRef.current==='playing'&&!!game.current&&!game.current.state.over;
  const take=(e:PointerEvent)=>{if(t.down(e.pointerId,e.clientX,e.clientY)){game.current!.hold(0,true);aimAt(e.clientX,e.clientY);}};
  const down=(e:PointerEvent)=>{if(phaseRef.current!=='playing'||(e.pointerType==='mouse'&&e.button!==0)||(e.target instanceof Element&&e.target.closest('button')))return;e.preventDefault();audio.current?.unlock();
   const g=game.current;if(!g)return;if(g.state.over){endAt.current=1;wake();return;}g.skip();const r=el.getBoundingClientRect();size.current.left=r.left;size.current.top=r.top;
   take(e);if(e.pointerType!=='mouse')try{el.setPointerCapture(e.pointerId);}catch{/* fine without */}wake();};
  const move=(e:PointerEvent)=>{if(!live())return;if(e.pointerType==='mouse'&&t.owner()<0)take(e);/* the mouse drives the striker without a press */if(!t.move(e.pointerId,e.clientX,e.clientY))return;e.preventDefault();aimAt(e.clientX,e.clientY);wake();};
  const up=(e:PointerEvent)=>{if(e.pointerType==='mouse'&&e.type!=='pointerleave'&&e.type!=='pointercancel')return;t.up(e.pointerId);};
  const reconcile=(e:TouchEvent)=>{const pts:number[]=[];for(let i=0;i<e.touches.length;i++)pts.push(e.touches[i].clientX,e.touches[i].clientY);t.reconcile(pts);};
  const hide=()=>t.clear();
  const opt={passive:false} as const,cap={capture:true} as const,pcap={capture:true,passive:true} as const;
  el.addEventListener('pointerdown',down,opt);el.addEventListener('pointermove',move,opt);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);el.addEventListener('pointerleave',up);
  window.addEventListener('pointerup',up,cap);window.addEventListener('pointercancel',up,cap);window.addEventListener('touchstart',reconcile,pcap);window.addEventListener('touchend',reconcile,pcap);window.addEventListener('touchcancel',reconcile,pcap);window.addEventListener('pagehide',hide);
  const noScroll=(e:TouchEvent)=>{if(phaseRef.current==='playing'&&e.cancelable)e.preventDefault();};el.addEventListener('touchmove',noScroll,opt);// no scroll, pull-to-refresh or page swipe steals a striker
  const noMenu=(e:Event)=>e.preventDefault();el.addEventListener('contextmenu',noMenu);
  if(process.env.NODE_ENV!=='production')(window as unknown as {__airhockey?:unknown}).__airhockey={get game(){return game.current;},get phase(){return phaseRef.current;},get loop(){return raf.current!==0;},perf:perf.current,size:size.current,get audio(){return audio.current;},get layout(){return view.current?.layout;},get owner(){return t.owner();},wake:()=>wake()};
  return()=>{ro.disconnect();window.visualViewport?.removeEventListener('resize',fit);el.removeEventListener('pointerdown',down);el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up);el.removeEventListener('pointerleave',up);
   window.removeEventListener('pointerup',up,cap);window.removeEventListener('pointercancel',up,cap);window.removeEventListener('touchstart',reconcile,pcap);window.removeEventListener('touchend',reconcile,pcap);window.removeEventListener('touchcancel',reconcile,pcap);window.removeEventListener('pagehide',hide);
   el.removeEventListener('touchmove',noScroll);el.removeEventListener('contextmenu',noMenu);
   if(raf.current)cancelAnimationFrame(raf.current);raf.current=0;view.current=null;game.current=null;touches.current=null;audio.current?.dispose();audio.current=null;fitRef.current=()=>{};delete (window as unknown as {__airhockey?:unknown}).__airhockey;};
 },[wake]);
 /* ---- keys; looked away: pause (RotateLock sends the same blur when a card covers the game) ---- */
 useEffect(()=>{
  const away=()=>pause(),hidden=()=>{if(document.hidden)pause();};
  const key=(e:KeyboardEvent)=>{if(e.target instanceof HTMLElement&&e.target.closest('button,input,select,textarea,a,dialog'))return;
   if(e.code==='Escape'||e.code==='KeyP'){e.preventDefault();if(phaseRef.current==='playing')pause();else if(phaseRef.current==='paused')resume();return;}
   if(KEYS[e.code]&&phaseRef.current==='playing'){e.preventDefault();audio.current?.unlock();game.current?.skip();keys.current.add(e.code);wake();}};
  const keyUp=(e:KeyboardEvent)=>{keys.current.delete(e.code);};
  window.addEventListener('blur',away);document.addEventListener('visibilitychange',hidden);window.addEventListener('keydown',key);window.addEventListener('keyup',keyUp);
  return()=>{window.removeEventListener('blur',away);document.removeEventListener('visibilitychange',hidden);window.removeEventListener('keydown',key);window.removeEventListener('keyup',keyUp);};
 },[pause,resume,wake]);

 const busy=entry.pending,live=phase==='playing'||phase==='paused',opp=RAMP[Math.min(RAMP.length,hud.level)-1],oppName=game.current?.opponent.name??opp.name;
 const tap=()=>{(audio.current??=createAirAudio()).unlock();audio.current.tap();};
 return <div className={`${styles.game} ${arcadeSkin.airhockey} ${comicRoot}`} data-game="airhockey" data-arcade-kind="airhockey" data-phase={phase} data-coarse={coarse||undefined}>
  <aside className={styles.side} data-side="left" aria-hidden="true">
   <ComicPanel tilt={-1.5} tone="paper"><b>The keeper’s rule</b><br/>Stay between the puck and your goal. Cover the near post first.</ComicPanel>
   <ComicPanel tilt={1} tone="sun"><b>Use the boards</b><br/>The angle in is the angle out: a shot off the side goes round the keeper.</ComicPanel>
   <ComicPanel tilt={-.8} tone="teal"><b>Mouse or arrow keys</b><br/>Just move the mouse: your striker follows it, no click needed.</ComicPanel>
  </aside>
  <aside className={styles.side} data-side="right" aria-hidden="true">
   <ComicPanel tilt={1.2} tone="paper" className={styles.sidePoints}><b>Points</b><span>Goal<em>{AH.pts.goal}</em></span><span>Off the boards<em>+{AH.pts.bank}</em></span><span>Quick goal<em>+{AH.pts.quick}</em></span><span>Counter<em>+{AH.pts.counter}</em></span><span>Clean sheet<em>+{AH.pts.clean}</em></span></ComicPanel>
   <ComicPanel tilt={-1} tone="red"><b>Save, then strike</b><br/>The best time to score is right after you win the puck.</ComicPanel>
  </aside>
  <div className={styles.stage} ref={stage} data-air-stage>
   <i ref={probe} className={styles.probe} aria-hidden="true"/>
   <canvas ref={bg} className={styles.scene} aria-hidden="true"/>
   <canvas ref={fg} className={styles.play} tabIndex={0} aria-label="Air Futbol table. Drag your striker to hit the puck into the other goal."/>
   {live&&<p className={styles.srOnly} aria-live="polite" data-air-score={`${hud.g0}-${hud.g1}`}>{`You ${hud.g0}, ${oppName} ${hud.g1}. Level ${hud.level}. ${hud.lives} ${hud.lives===1?'life':'lives'} left.`}</p>}
   {phase==='playing'&&hud.wait&&<div className={styles.hint} data-air-hint data-end="bottom" aria-live="polite"><b>{hud.first?(coarse?'Touch and drag your striker':'Move the mouse to drive your striker'):'Touch to serve'}</b>{hud.first&&<small>{`First to ${AH.SOLO_TO} beats ${oppName}`}</small>}</div>}
   {phase==='playing'&&hud.between&&<ComicPanel tone="paper" tilt={-1.5} className={styles.next} data-air-next={hud.level} aria-live="polite"><small>Next up · Level {hud.level}</small><strong>{oppName}</strong><span>{game.current?.opponent.tip??opp.tip}</span></ComicPanel>}
  </div>
  <ArcadeTopBar game="airhockey" className={styles.topBar} backTitle="Back to arcade" onBack={leave} value={live?hud.score:undefined} word="pts" bumpKey={hud.score} paused={phase==='paused'} canPause={live} onPause={()=>phase==='playing'?pause():resume()}/>
  {phase==='paused'&&<ArcadePauseCard game="airhockey" score={`${hud.score} pts · Level ${hud.level} · ${hud.g0}-${hud.g1} against ${oppName}`} status={entry.message||undefined} onResume={resume} onExit={leave} onRestart={()=>{void start();}} restartDisabled={busy} keys={[['Mouse','move'],['Arrows','move'],['P','pause']]}/>}
  {phase==='menu'&&<ComicCard label="Air Futbol" title="Air Futbol" badge="Football air hockey" badgeTone="teal" best={save.best>0?`Best ${save.best}`:undefined} data-air-card="start">
   <div className={styles.idea}><BankDiagram/><p className={styles.learn}>Drag your striker to hit the puck into the other goal. <b>Stay between the puck and your goal</b>, then shoot <b>off the side boards</b> to get round the keeper.</p></div>
   <div className={styles.chips}>
    <ComicStat value={save.best||'–'} label="Best"/>
    <ComicStat value={save.level||'–'} label="Top level"/>
   </div>
   {entry.message&&<p className={styles.status} role="status">{entry.message}</p>}
   <div className={styles.actions}>
    <ComicButton variant="primary" wide disabled={busy} onClick={()=>{void start();}} data-air-play autoFocus>Play<small>Beat {RAMP[0].name}, then the next one walks on</small></ComicButton>
    <ComicButton size="small" onClick={()=>{tap();setScores(true);}} data-air-scores>Scores</ComicButton>
   </div>
  </ComicCard>}
  {phase==='over'&&result&&<ComicCard label="Full time" badge="Full time" badgeTone="red" best={`Best ${result.settled.save.best}`} data-air-card="results" data-air-result={result.score}>
   <div className={styles.scoreRow}>
    <strong className={`${comicNumeral} ${styles.score}`} data-new-best={result.settled.newBest||undefined}>{result.score}</strong>
    {result.settled.newBest&&<ComicBurst word="New best!" size={17} tilt={7} className={styles.stamp}/>}
   </div>
   <ComicPanel tone="sun" tilt={-1.2} className={styles.near} data-air-near>{result.near}</ComicPanel>
   <div className={styles.hsSlot} data-hs-slot/>
   <ComicPanel tone="paper" flat className={styles.coach} data-air-coach={result.settled.coachKey}><b>Coach</b>{result.settled.coach}</ComicPanel>
   <div className={styles.chips}>
    <ComicStat value={result.level} label="Level"/>
    <ComicStat value={result.wins} label={result.wins===1?'Match won':'Matches won'}/>
    <ComicStat value={result.bank} label="Board goals" tone={result.bank>0?'teal':undefined}/>
    <ComicStat value={result.saves} label={result.saves===1?'Save':'Saves'}/>
   </div>
   {(result.coins>0||entry.message)&&<p className={styles.status} role="status">{entry.message||`+${result.coins} ${result.coins===1?'coin':'coins'}`}</p>}
   <div className={styles.actions}>
    <ComicButton variant="primary" wide disabled={busy} onClick={()=>{void start();}} data-air-again autoFocus>Play again</ComicButton>
    <ComicButton size="small" onClick={()=>{tap();setScores(true);}} data-air-scores>Scores</ComicButton>
   </div>
  </ComicCard>}
  {board&&phase==='over'&&<HighScoreEntry game="airhockey" score={board.score} detail="Points for goals, board shots, clean sheets and matches won against the machine." onClose={()=>setBoard(null)}/>}
  {scores&&<AirFutbolScores onClose={()=>setScores(false)}/>}
 </div>;
}
