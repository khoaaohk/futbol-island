'use client';
/**
 * Trophy Drop (Nov 17 2026, docs/arcade-aaa/trophydrop-direction.md): the eighth arcade game, a drop-and-merge cabinet. Rules and
 * physics: lib/arcade/trophydrop/core.ts (pure, seeded, fixed 1/120 s step). Drawing: view.ts (2D canvas, static room + moving layer).
 * Sound: audio.ts. This shell owns the loop, the aim (pointer, mouse, keys) and the cards.
 * Heat: the rAF loop runs ONLY while playing AND something can change (the world is awake, an effect runs, the held item is cooling
 * down, a finger is on the glass, a key is held or items are over the top line). A settled cabinet draws nothing until the next touch;
 * 60 fps cap; DPR cap 2, dropped to 1.5 when frames run long. Teaches (AGENTS.md): small touches add up to big wins.
 */
import {useCallback,useEffect,useRef,useState} from 'react';
import dynamic from 'next/dynamic';
import {retryImport} from '@/lib/retryImport';
import {ArcadeTopBar} from '../arcade/ArcadeTopBar';
import {ArcadePauseCard} from '../arcade/ArcadePauseCard';
import {arcadeSkin} from './skins';
import {comicRoot,comicNumeral,ComicButton,ComicCard,ComicPanel,ComicStat,ComicBurst,ComicMedalTrack} from './comic';
import styles from './TrophyDropGame.module.css';
import {createTrophyDrop,trophyDailySeed,medalFor,TD,TIERS,MEDAL_NAMES,type TrophyDrop,type TrophyEvent} from '@/lib/arcade/trophydrop/core';
import {createTrophyView,type TrophyView} from '@/lib/arcade/trophydrop/view';
import {createTrophyAudio,type TrophyAudio} from '@/lib/arcade/trophydrop/audio';
import {readTrophySave,writeTrophySave,settleTrophy,nearMissLine,coachLine,liveStreak,emptyTrophySave,type TrophySave,type TrophySettled} from '@/lib/arcade/trophydrop/save';
import {arcadeFeedback} from '@/lib/arcade/arcadeFeedback';
import {useArcadeEntry} from '@/lib/arcade/useArcadeEntry';
import {creditRun,arcadeCoinTarget} from '@/lib/arcade/arcadeWallet';
import {saveArcadeRecord} from '@/lib/arcade/arcadeRecords';
import {beginBoardSession} from '@/lib/arcade/boardClient';
import {localPlayDay} from '@/lib/town/dailyPlay';
import {frameCapSlot} from '@/lib/town/frameCap';
const HighScoreEntry=dynamic(()=>retryImport(()=>import('../arcade/HighScoreEntry')),{ssr:false});
const TrophyDropScores=dynamic(()=>retryImport(()=>import('./TrophyDropScores')),{ssr:false});

type Phase='menu'|'playing'|'paused'|'over';
type Hud={score:number;level:number;daily:boolean;shakes:number};
type Result={score:number;daily:boolean;level:number;drops:number;merges:number;chain:number;streak:number;top:number;doubles:number;settled:TrophySettled;near:string;coach:string;coins:number};
export const TROPHY_COIN_REASON='Trophy Drop: cabinet filled';
const FRAME_MS=1000/60,HUD_ROOM=48,KEY_SPEED=70;

/** The tier ladder as small inked discs (the same colours the canvas badges use). */
function Ladder({upTo=-1}:{upTo?:number}){
 return <ol className={styles.ladder} aria-label="Merge two of the same to make the next one">{TIERS.map((t,i)=><li key={t.key} data-on={upTo<0||i<=upTo||undefined} title={t.name}>
  <i style={{width:10+i*3.2,height:10+i*3.2,background:t.color}}/></li>)}</ol>;
}
function Medal({level,on}:{level:number;on:boolean}){return <span className={styles.medal} data-level={level} data-on={on||undefined} aria-hidden="true"><i/></span>;}

export default function TrophyDropGame({onExit}:{onExit:()=>void}){
 const [phase,setPhase]=useState<Phase>('menu'),phaseRef=useRef<Phase>('menu');
 const [hud,setHud]=useState<Hud>({score:0,level:1,daily:false,shakes:0}),hudRef=useRef(hud);
 const [save,setSave]=useState<TrophySave>(emptyTrophySave),[result,setResult]=useState<Result|null>(null),[today,setToday]=useState('');
 const [board,setBoard]=useState<{score:number}|null>(null),[scores,setScores]=useState(false);
 const entry=useArcadeEntry('trophydrop');
 const stage=useRef<HTMLDivElement>(null),bg=useRef<HTMLCanvasElement>(null),fg=useRef<HTMLCanvasElement>(null),probe=useRef<HTMLElement>(null);
 const game=useRef<TrophyDrop|null>(null),view=useRef<TrophyView|null>(null),audio=useRef<TrophyAudio|null>(null);
 const raf=useRef(0),last=useRef(0),slot=useRef(0),endAt=useRef(0),busy=useRef(false),run=useRef({id:'',daily:false,day:'',done:true});
 const size=useRef({w:1,h:1,dpr:1}),perf=useRef({frames:0,sum:0,max:0,window:0,windowSum:0,dropped:false,sleeps:0});
 const reduced=useRef(false),holding=useRef(false),keys=useRef(new Set<string>()),fitRef=useRef<()=>void>(()=>{}),warnAt=useRef(0);
 /** hit-stop: seconds the rules stand still after a big merge (the picture keeps moving); idle: the timer of the next resting blink */
 const stopFor=useRef(0),idle=useRef<ReturnType<typeof setTimeout>|null>(null);

 const change=useCallback((p:Phase)=>{phaseRef.current=p;setPhase(p);},[]);
 useEffect(()=>{setSave(readTrophySave());setToday(localPlayDay(Date.now()));fitRef.current();},[]);

 /* ---- the run's end: save, coins, board (once per run) ---- */
 const finish=useCallback(()=>{
  const g=game.current,r=run.current;if(!g||r.done)return;r.done=true;const s=g.state,score=Math.floor(s.score),stats={...s.stats,made:[...s.stats.made]};
  const settled=settleTrophy(readTrophySave(),{score,daily:r.daily,day:r.day,stats});writeTrophySave(settled.save);setSave(settled.save);
  saveArcadeRecord('trophydrop',score);
  const coins=arcadeCoinTarget('trophydrop',{points:score});if(coins>0)void creditRun(r.id,'trophydrop',coins,TROPHY_COIN_REASON);
  setResult({score,daily:r.daily,level:s.level,drops:s.drops,merges:stats.merges,chain:stats.bestChain,streak:stats.bestStreak,top:stats.bestTier,doubles:stats.doubles,settled,coins,
   near:nearMissLine({score,best:settled.previousBest,newBest:settled.newBest,stats,daily:r.daily,dailyBest:settled.dailyBest}),coach:coachLine(stats)});
  if(score>0)setBoard({score});
  if(settled.newMedal||settled.newBest){audio.current?.medal(Math.max(1,settled.medal));arcadeFeedback(null,'goal');}
  view.current?.clear();change('over');
 },[change]);

 /* ---- one rules event: picture, sound, haptics ---- */
 const onEvent=useCallback((e:TrophyEvent)=>{
  const a=audio.current;view.current?.onEvent(e);
  switch(e.type){
   case 'drop':a?.drop(e.a);break;
   case 'land':a?.land(e.a,e.b);if(e.b>120)arcadeFeedback(null,'combo');break;
   case 'merge':a?.merge(e.a,e.c);arcadeFeedback(null,e.c>=2||e.a>=6?'perfect':'combo');if(e.a>=5&&!reduced.current)stopFor.current=Math.max(stopFor.current,.04+.012*(e.a-5));break;
   case 'double':a?.double();arcadeFeedback(null,'goal');if(!reduced.current)stopFor.current=.12;break;
   case 'streak':a?.streak(e.a,e.b);break;
   case 'miss':if(e.a>=2)a?.miss();break;
   case 'earn':a?.earn();arcadeFeedback(null,'skill');break;
   case 'shake':a?.shake();arcadeFeedback(null,'slam');break;
   case 'hit':a?.hit(e.a);break;
   case 'pop':a?.pop();arcadeFeedback(null,'skill');break;
   case 'level':a?.level();arcadeFeedback(null,'level');break;
   case 'warn':a?.warn(0);warnAt.current=performance.now();arcadeFeedback(null,'slam');break;
   case 'safe':a?.safe(e.a>=10);break;
   case 'over':a?.over();arcadeFeedback(null,'slam');break;
  }
 },[]);

 /* ---- the loop: alive only while playing and something can change ---- */
 const frame=useCallback((now:number)=>{
  raf.current=0;const g=game.current,v=view.current;if(phaseRef.current!=='playing'||!g||!v)return;
  const next=frameCapSlot(now,slot.current,FRAME_MS);
  if(next>=0){slot.current=next;const dt=Math.min(.05,Math.max(0,(now-last.current)/1000));last.current=now;const t0=performance.now();
   const k=keys.current;if(k.size){const dir=(k.has('ArrowRight')||k.has('KeyD')?1:0)-(k.has('ArrowLeft')||k.has('KeyA')?1:0);if(dir)g.aim(g.state.aim+dir*KEY_SPEED*dt);}
   if(stopFor.current>0)stopFor.current-=dt;else g.step(dt);g.drain(onEvent);busy.current=v.render(g,dt,holding.current)||stopFor.current>0;
   const s=g.state;if(s.danger>0&&now-warnAt.current>650-250*Math.min(1,s.danger/TD.overHold)){warnAt.current=now;audio.current?.warn(s.danger/TD.overHold);}// the pips come faster and higher as the clock runs
   const sc=Math.floor(s.score),h=hudRef.current;if(h.score!==sc||h.level!==s.level||h.shakes!==s.shakes){const n={score:sc,level:s.level,daily:h.daily,shakes:s.shakes};hudRef.current=n;setHud(n);}
   const cost=performance.now()-t0,p=perf.current;p.frames++;p.sum+=cost;if(cost>p.max)p.max=cost;p.window++;p.windowSum+=cost;
   if(p.window>=90){if(!p.dropped&&p.windowSum/p.window>7&&size.current.dpr>1.5){p.dropped=true;fitRef.current();}p.window=0;p.windowSum=0;}
   if(s.over){if(!endAt.current)endAt.current=now+(reduced.current?400:1100);else if(now>=endAt.current){finish();return;}}
   else if(g.idle&&!busy.current&&!holding.current&&!keys.current.size){p.sleeps++;// settled: sleep until the next touch or key
    // idle life: now and then one or two resting items blink (a handful of frames, then the loop sleeps again); never under reduced motion
    if(!idle.current&&!reduced.current)idle.current=setTimeout(()=>{idle.current=null;const gg=game.current;if(phaseRef.current==='playing'&&gg&&!document.hidden&&gg.idle&&view.current?.blink(gg))wakeRef.current();},3200+Math.random()*3600);
    return;}
  }
  raf.current=requestAnimationFrame(frame);
 },[finish,onEvent]);
 const wakeRef=useRef<()=>void>(()=>{});
 const wake=useCallback(()=>{if(raf.current||phaseRef.current!=='playing')return;last.current=performance.now();slot.current=0;raf.current=requestAnimationFrame(frame);},[frame]);
 const sleep=useCallback(()=>{if(raf.current)cancelAnimationFrame(raf.current);raf.current=0;if(idle.current){clearTimeout(idle.current);idle.current=null;}},[]);
 useEffect(()=>{wakeRef.current=wake;},[wake]);

 /* ---- start / restart: one tap, straight into play ---- */
 const start=useCallback(async(daily:boolean)=>{
  (audio.current??=createTrophyAudio()).unlock();
  const id=await entry.enter();if(!id)return;
  const day=localPlayDay(Date.now()),seed=daily?trophyDailySeed(day):1+Math.floor(Math.random()*2_000_000_000);
  game.current=createTrophyDrop({seed,daily});run.current={id,daily,day,done:false};
  beginBoardSession('trophydrop');
  view.current?.reset();endAt.current=0;holding.current=false;keys.current.clear();setResult(null);setBoard(null);setToday(day);
  const n={score:0,level:1,daily,shakes:0};hudRef.current=n;setHud(n);stopFor.current=0;change('playing');wake();
 },[change,entry,wake]);
 const pause=useCallback(()=>{if(phaseRef.current!=='playing')return;sleep();holding.current=false;keys.current.clear();change('paused');},[change,sleep]);
 const resume=useCallback(()=>{if(phaseRef.current!=='paused')return;audio.current?.unlock();change('playing');wake();},[change,wake]);
 const leave=useCallback(()=>{sleep();onExit();},[onExit,sleep]);
 const shakeNow=useCallback(()=>{const g=game.current;if(phaseRef.current!=='playing'||!g)return;audio.current?.unlock();if(g.shake())wake();else audio.current?.deny();},[wake]);
 const dropNow=useCallback(()=>{const g=game.current;if(phaseRef.current!=='playing'||!g)return;audio.current?.unlock();if(g.state.over){endAt.current=1;wake();return;}g.drop();wake();},[wake]);

 /* ---- canvases, size, aim ---- */
 useEffect(()=>{
  const el=stage.current,b=bg.current,f=fg.current;if(!el||!b||!f)return;
  reduced.current=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const v=view.current=createTrophyView(b,f,{reduced:reduced.current});
  const fit=()=>{const r=el.getBoundingClientRect(),vv=window.visualViewport,cut=Math.max(0,Math.round(r.bottom-(vv?vv.offsetTop+vv.height:window.innerHeight)));
   const z=size.current;z.w=Math.max(1,r.width);z.h=Math.max(1,r.height-cut);z.dpr=perf.current.dropped?1.5:Math.min(2,window.devicePixelRatio||1);
   el.style.setProperty('--td-cut',`${cut}px`);v.resize(z.w,z.h,z.dpr,(probe.current?.offsetHeight??56)+HUD_ROOM);el.style.setProperty('--td-strip',`${Math.round(v.layout.stripY)}px`);const g=game.current;if(g&&phaseRef.current!=='menu')v.render(g,0,false);};
  fitRef.current=fit;fit();const ro=new ResizeObserver(fit);ro.observe(el);window.visualViewport?.addEventListener('resize',fit);
  // One finger aims: touch down anywhere on the stage, slide, let go to drop. A mouse aims by hovering and drops on click.
  let id=-1;
  const aimAt=(clientX:number)=>{const g=game.current;if(!g)return;const r=el.getBoundingClientRect();g.aim(v.toWorld(clientX-r.left));wake();};
  const down=(e:PointerEvent)=>{if(phaseRef.current!=='playing'||(e.pointerType==='mouse'&&e.button!==0)||(e.target instanceof Element&&e.target.closest('button')))return;e.preventDefault();audio.current?.unlock();
   if(game.current?.state.over){endAt.current=1;wake();return;}id=e.pointerId;holding.current=true;aimAt(e.clientX);try{el.setPointerCapture(e.pointerId);}catch{/* fine without */}};
  const move=(e:PointerEvent)=>{if(phaseRef.current!=='playing')return;if(e.pointerId===id){e.preventDefault();aimAt(e.clientX);}else if(e.pointerType==='mouse'&&id<0)aimAt(e.clientX);};
  const up=(e:PointerEvent)=>{if(e.pointerId!==id)return;id=-1;try{el.releasePointerCapture(e.pointerId);}catch{/* gone */}if(holding.current&&e.type==='pointerup'){holding.current=false;aimAt(e.clientX);dropNow();}else holding.current=false;wake();};
  const opt={passive:false} as const;
  el.addEventListener('pointerdown',down,opt);el.addEventListener('pointermove',move,opt);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);el.addEventListener('lostpointercapture',up);
  const noScroll=(e:TouchEvent)=>{if(phaseRef.current==='playing'&&e.cancelable)e.preventDefault();};el.addEventListener('touchmove',noScroll,opt);
  const noMenu=(e:Event)=>e.preventDefault();f.addEventListener('contextmenu',noMenu);
  if(process.env.NODE_ENV!=='production')(window as unknown as {__trophy?:unknown}).__trophy={get game(){return game.current;},get phase(){return phaseRef.current;},get loop(){return raf.current!==0;},perf:perf.current,size:size.current,get audio(){return audio.current;},get layout(){return view.current?.layout;},get view(){return view.current;},/** a scripted change (probes, tests) wakes the sleeping loop */wake};
  return()=>{ro.disconnect();window.visualViewport?.removeEventListener('resize',fit);el.removeEventListener('pointerdown',down);el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up);el.removeEventListener('lostpointercapture',up);el.removeEventListener('touchmove',noScroll);f.removeEventListener('contextmenu',noMenu);
   if(raf.current)cancelAnimationFrame(raf.current);raf.current=0;if(idle.current){clearTimeout(idle.current);idle.current=null;}view.current=null;game.current=null;audio.current?.dispose();audio.current=null;fitRef.current=()=>{};delete (window as unknown as {__trophy?:unknown}).__trophy;};
 },[dropNow,wake]);
 /* ---- keys; looked away: pause ---- */
 useEffect(()=>{
  const away=()=>pause(),hidden=()=>{if(document.hidden)pause();};
  const key=(e:KeyboardEvent)=>{if(e.target instanceof HTMLElement&&e.target.closest('button,input,select,textarea,a,dialog'))return;
   if(e.code==='Escape'||e.code==='KeyP'){e.preventDefault();if(phaseRef.current==='playing')pause();else if(phaseRef.current==='paused')resume();return;}
   if(phaseRef.current!=='playing')return;
   if(e.code==='ArrowLeft'||e.code==='ArrowRight'||e.code==='KeyA'||e.code==='KeyD'){e.preventDefault();audio.current?.unlock();keys.current.add(e.code);wake();return;}
   if(e.code==='KeyX'||e.code==='ArrowUp'||e.code==='KeyW'){e.preventDefault();if(!e.repeat)shakeNow();return;}
   if(e.code==='Space'||e.code==='Enter'||e.code==='ArrowDown'||e.code==='KeyS'){e.preventDefault();if(!e.repeat)dropNow();}};
  const keyUp=(e:KeyboardEvent)=>{keys.current.delete(e.code);};
  window.addEventListener('blur',away);document.addEventListener('visibilitychange',hidden);window.addEventListener('keydown',key);window.addEventListener('keyup',keyUp);
  return()=>{window.removeEventListener('blur',away);document.removeEventListener('visibilitychange',hidden);window.removeEventListener('keydown',key);window.removeEventListener('keyup',keyUp);};
 },[pause,resume,dropNow,shakeNow,wake]);

 const streak=today?liveStreak(save,today):0,dailyToday=save.daily.day===today?save.daily:null,waiting=entry.pending,live=phase==='playing'||phase==='paused';
 const tap=()=>{(audio.current??=createTrophyAudio()).unlock();audio.current.tap();};
 return <div className={`${styles.game} ${arcadeSkin.trophydrop} ${comicRoot}`} data-game="trophydrop" data-arcade-kind="trophydrop" data-phase={phase}>
  <aside className={styles.side} data-side="left" aria-hidden="true">
   <ComicPanel tilt={-1.5} tone="paper"><b>Two of the same make one bigger</b><Ladder/><span className={styles.sideNote}>Size-1 ball up to the golden trophy.</span></ComicPanel>
   <ComicPanel tilt={1} tone="sun"><b>Small touches add up to big wins.</b><br/>Little balls become boots, gloves, medals and cups.</ComicPanel>
   <ComicPanel tilt={-.8} tone="teal"><b>Mouse or arrow keys</b><br/>Aim, then click or press Space to drop. Press X to shake.</ComicPanel>
  </aside>
  <aside className={styles.side} data-side="right" aria-hidden="true">
   <ComicPanel tilt={1.2} tone="paper" className={styles.sideMedals}><b>Medals</b>{TD.medals.map((m,i)=><span key={m}><Medal level={i+1} on/>{MEDAL_NAMES[i]}<em>{m}</em></span>)}</ComicPanel>
   <ComicPanel tilt={-1} tone="red"><b>Chains score double</b><br/>When a new item lands on its twin, that is a chain. Each step adds a multiplier.</ComicPanel>
   <ComicPanel tilt={.8} tone="teal"><b>Earn a Shake</b><br/>Make {TD.streakNeed} drops merge in a row. A Shake jolts the pile and stops the top line clock.</ComicPanel>
  </aside>
  <div className={styles.stage} ref={stage} data-trophy-stage>
   <i ref={probe} className={styles.probe} aria-hidden="true"/>
   <canvas ref={bg} className={styles.scene} aria-hidden="true"/>
   <canvas ref={fg} className={styles.play} tabIndex={0} aria-label="Trophy Drop cabinet. Slide to aim, let go to drop. Arrow keys aim, Space drops."/>
   {live&&<div className={styles.strip} data-trophy-strip aria-live="polite">
    <b className={styles.lv}>Level {hud.level}</b>
    {hud.daily&&<span className={styles.dailyTag}>Daily Drop</span>}
    <span className={styles.bestTag}>Best {Math.max(save.best,hud.score)}</span>
   </div>}
   {live&&<ComicButton variant="teal" size="small" className={styles.shake} disabled={phase!=='playing'||hud.shakes<1} onClick={shakeNow} data-trophy-shake data-ready={hud.shakes>0||undefined} aria-label={hud.shakes>0?'Shake the cabinet':'Shake. Make 5 drops merge in a row to earn it.'}>Shake<small>{hud.shakes>0?'Ready':'Not yet'}</small></ComicButton>}
  </div>
  <ArcadeTopBar game="trophydrop" className={styles.topBar} backTitle="Back to arcade" onBack={leave} value={live?hud.score:undefined} word="pts" bumpKey={hud.score} paused={phase==='paused'} canPause={live} onPause={()=>phase==='playing'?pause():resume()}/>
  {phase==='paused'&&<ArcadePauseCard game="trophydrop" score={`${hud.score} pts · Level ${hud.level}`} status={entry.message||undefined} onResume={resume} onExit={leave} onRestart={()=>{void start(run.current.daily);}} restartDisabled={waiting} keys={[['Slide','aim'],['Release','drop'],['Shake','jolt the pile'],['P','pause']]}/>}
  {phase==='menu'&&<ComicCard label="Trophy Drop" title="Trophy Drop" badge="Merge to the top" badgeTone="sun" best={save.best>0?`Best ${save.best}`:undefined} data-trophy-card="start">
   <Ladder/>
   <p className={styles.learn}>Slide to aim and let go to drop. <b>Two of the same</b> touch and become the next one, all the way up to the <b>golden trophy</b>. Keep the pile under the top line. Make <b>{TD.streakNeed} drops merge in a row</b> to earn a <b>Shake</b>.</p>
   <p className={styles.lesson}>Small touches add up to big wins.</p>
   <div className={styles.chips}>
    <ComicStat value={save.best||'–'} label="Best"/>
    <ComicStat value={<span className={styles.medalRow}>{[1,2,3].map(l=><Medal key={l} level={l} on={save.medal>=l}/>)}</span>} label={save.medal?MEDAL_NAMES[save.medal-1]:'No medal yet'}/>
    <ComicStat value={streak} label={streak===1?'Day in a row':'Days in a row'} tone={streak>0?'sun':undefined} data-trophy-streak={streak}/>
   </div>
   {entry.message&&<p className={styles.status} role="status">{entry.message}</p>}
   <div className={styles.actions}>
    <ComicButton variant="primary" wide disabled={waiting} onClick={()=>{void start(false);}} data-trophy-play autoFocus>Play</ComicButton>
    <ComicButton variant="teal" wide disabled={waiting} onClick={()=>{void start(true);}} data-trophy-daily>Daily Drop<small>{dailyToday?.runs?`Today’s best ${dailyToday.best}`:'Same drops for everyone today'}</small></ComicButton>
    <ComicButton size="small" onClick={()=>{tap();setScores(true);}} data-trophy-scores>Scores</ComicButton>
   </div>
  </ComicCard>}
  {phase==='over'&&result&&<ComicCard label="Cabinet full" badge={result.daily?'Daily Drop':'Cabinet full'} badgeTone={result.daily?'teal':'red'} best={`Best ${result.settled.save.best}`} data-trophy-card="results" data-trophy-score={result.score}>
   <div className={styles.scoreRow}>
    <strong className={`${comicNumeral} ${styles.score}`} data-new-best={result.settled.newBest||undefined}>{result.score}</strong>
    {result.settled.newBest&&<ComicBurst word="New best!" size={17} tilt={7} className={styles.stamp}/>}
   </div>
   <div className={styles.medalRow} data-trophy-medal={result.settled.medal} role="img" aria-label={result.settled.medal?`${MEDAL_NAMES[result.settled.medal-1]} medal`:'No medal this time'}>{[1,2,3].map(l=><Medal key={l} level={l} on={medalFor(result.score)>=l}/>)}<em>{result.settled.medal?MEDAL_NAMES[result.settled.medal-1]:'No medal yet'}</em></div>
   <ComicMedalTrack score={result.score} best={result.settled.previousBest} medals={TD.medals} names={MEDAL_NAMES} data-trophy-track/>
   <ComicPanel tone="sun" tilt={-1.2} className={styles.near} data-trophy-near>{result.near}</ComicPanel>
   <div className={styles.hsSlot} data-hs-slot/>
   <div className={styles.actions}>
    <ComicButton variant="primary" wide disabled={waiting} onClick={()=>{void start(result.daily);}} data-trophy-again autoFocus>Play again</ComicButton>
    <ComicButton size="small" disabled={waiting} onClick={()=>{void start(!result.daily);}} data-trophy-other>{result.daily?'Endless':'Daily Drop'}</ComicButton>
    <ComicButton size="small" onClick={()=>{tap();setScores(true);}}>Scores</ComicButton>
   </div>
   <ComicPanel tone="teal" flat className={styles.built} data-trophy-top={result.top}><small>Biggest you made</small><strong>{TIERS[result.top].name}</strong><Ladder upTo={result.top}/></ComicPanel>
   <div className={styles.chips}>
    <ComicStat value={result.merges} label={result.merges===1?'Merge':'Merges'}/>
    <ComicStat value={result.chain>1?`x${Math.min(TD.chainCap,result.chain)}`:'–'} label="Best chain" tone={result.chain>1?'sun':undefined}/>
    <ComicStat value={result.streak>1?result.streak:'–'} label="Touch streak" tone={result.streak>=TD.streakNeed?'teal':undefined} data-trophy-streak-best={result.streak}/>
    <ComicStat value={result.level} label="Level"/>
    {result.daily&&<ComicStat value={result.settled.streak} label={result.settled.streak===1?'Day':'Days in a row'} tone="sun"/>}
   </div>
   <p className={styles.coach}>{result.coach}</p>
   <ComicPanel tone="paper" flat className={styles.fact} data-trophy-fact><b>{result.settled.fact.title}</b>{result.settled.fact.line}</ComicPanel>
   {(result.coins>0||entry.message)&&<p className={styles.status} role="status">{entry.message||`+${result.coins} ${result.coins===1?'coin':'coins'}`}</p>}
  </ComicCard>}
  {board&&phase==='over'&&<HighScoreEntry game="trophydrop" score={board.score} detail="Points for every merge, more for bigger items and chains." onClose={()=>setBoard(null)}/>}
  {scores&&<TrophyDropScores onClose={()=>setScores(false)}/>}
 </div>;
}
