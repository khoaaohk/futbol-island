'use client';
/**
 * Flick It shell (Nov 21 2026, docs/arcade-aaa/flickit-direction.md): the football flick game. One finger: swipe up through the ball.
 * The swipe's speed is the power, its first direction the aim, its bend the curl, its length the lift (lib/arcade/flickit/core.ts
 * flickToShot). Targets are objects in six places on the island, each seen from its own camera (lib/arcade/flickit/view.ts).
 * Tour = the six stages in order (one star to go on), its total goes on the one all-time board; a stage can be practised alone;
 * Daily Flick is one seeded stage a day, saved on the device.
 * Heat: the loop runs only while playing (30 draws a second on phones, 60 on desktop); cards and pause sleep. Slow motion and
 * hit-stop only scale the time handed to the fixed-step core. Sound starts on the first tap.
 * Keys: Left / Right aim, Up / Down lift, hold Space for power and let go to kick, Q / E curl, P or Escape pause.
 */
import React,{useCallback,useEffect,useRef,useState} from 'react';
import dynamic from 'next/dynamic';
import {retryImport} from '@/lib/retryImport';
import {ArcadeTopBar} from '../arcade/ArcadeTopBar';
import {ArcadePauseCard} from '../arcade/ArcadePauseCard';
import {arcadeSkin} from './skins';
import {comicRoot,comicNumeral,ComicButton,ComicCard,ComicPanel,ComicStat,ComicBurst} from './comic';
import styles from './FlickItGame.module.css';
import {createFlickIt,flickToShot,shotToSwipe,solveShot,predict,footFor,flickitDailySeed,starScore,starsFor,tipFor,FK,K,STAGES,type FlickIt,type FlickEvent,type FlickMode,type FlickResult,type FlickTip,type Pt,type Shot} from '@/lib/arcade/flickit/core';
import {createFlickitView,type FlickitView} from '@/lib/arcade/flickit/view';
import {createFlickitAudio,type FlickitAudio} from '@/lib/arcade/flickit/audio';
import {readFlickitSave,writeFlickitSave,settleFlickit,emptyFlickitSave,stageOpen,totalStars,liveStreak,type FlickitSave,type FlickitSettled} from '@/lib/arcade/flickit/save';
import {frameCapSlot} from '@/lib/town/frameCap';
import {arcadeFeedback} from '@/lib/arcade/arcadeFeedback';
import {useArcadeEntry} from '@/lib/arcade/useArcadeEntry';
import {creditRun,arcadeCoinTarget} from '@/lib/arcade/arcadeWallet';
import {saveArcadeRecord} from '@/lib/arcade/arcadeRecords';
import {beginBoardSession} from '@/lib/arcade/boardClient';
import {noteLastScore} from '@/lib/arcade/lastScore';
import {localPlayDay} from '@/lib/town/dailyPlay';
const HighScoreEntry=dynamic(()=>retryImport(()=>import('../arcade/HighScoreEntry')),{ssr:false});
const FlickItScores=dynamic(()=>retryImport(()=>import('./FlickItScores')),{ssr:false});

type Phase='menu'|'playing'|'paused'|'between'|'over';
type Hud={score:number;level:number;flicks:number;max:number;par:number;stage:string;ix:number};
type Word={id:number;text:string;pts:number;tone:'sun'|'red'|'teal'|'paper';teach:boolean;x:number;y:number};
type Between={result:FlickResult;tip:FlickTip;next:string;par:number;total:number};
type Result={mode:FlickMode;total:number;results:FlickResult[];last:FlickResult;par:number;tip:FlickTip;settled:FlickitSettled;coins:number;line:string};
export const FLICKIT_COIN_REASON='Flick It: run';
const FOOT={laces:'Laces',inside:'Inside of the foot',outside:'Outside of the foot'} as const;
const HIT_WORD:Record<number,string[]>={[K.can]:['CLANG!','TINK!','CLONK!'],[K.crate]:['CRASH!','CRUNCH!'],[K.bottle]:['BONK!','PLINK!'],[K.cone]:['BOP!'],[K.barrel]:['BOOM!'],[K.hoop]:['SWISH!'],[K.tyre]:['THREADED!'],[K.bin]:['IN THE BIN!'],[K.bell]:['DING!'],[K.shutter]:['BANG!'],[K.sign]:['TWEET!'],[K.trolley]:['DING DING!'],[K.bar]:['PING!'],[K.goal]:['GOAL!']};

function Stars({n,size=22}:{n:number;size?:number}){return <span className={styles.stars} role="img" aria-label={`${n} of 3 stars`}>{[1,2,3].map(i=><svg key={i} viewBox="0 0 24 24" width={size} height={size} data-on={i<=n||undefined}><path d="M12 1.6l3.1 6.6 7.2.9-5.3 5 1.4 7.2L12 17.7 5.6 21.3 7 14.1 1.7 9.1l7.2-.9z"/></svg>)}</span>;}
function FlickArt(){return <svg className={styles.art} viewBox="0 0 260 120" aria-hidden="true">
 <rect x="2" y="2" width="256" height="116" fill="#8fd4ee" stroke="#231a2e" strokeWidth="4"/><path d="M2 84h256v34H2z" fill="#57b85f" stroke="#231a2e" strokeWidth="4"/>
 <path d="M46 100C70 30 150 10 204 52" fill="none" stroke="#fff3d6" strokeWidth="5" strokeDasharray="2 11" strokeLinecap="round"/>
 <g stroke="#231a2e" strokeWidth="3"><circle cx="46" cy="98" r="12" fill="#fffaf0"/><path d="M40 94l6-5 6 5-2 7h-8z" fill="#231a2e"/>
 <rect x="190" y="62" width="14" height="18" fill="#f0452e"/><rect x="206" y="62" width="14" height="18" fill="#19b5a5"/><rect x="198" y="44" width="14" height="18" fill="#ffc83a"/><rect x="184" y="80" width="42" height="12" fill="#c98a4b"/>
 <circle cx="120" cy="34" r="15" fill="none" stroke="#f0452e" strokeWidth="6"/><circle cx="120" cy="34" r="15" fill="none"/><ellipse cx="236" cy="30" rx="11" ry="13" fill="#ff65c8"/></g></svg>;}

export default function FlickItGame({onExit}:{onExit:()=>void}){
 const [phase,setPhase]=useState<Phase>('menu'),phaseRef=useRef<Phase>('menu');
 const blank:Hud={score:0,level:0,flicks:0,max:6,par:1,stage:'',ix:0};
 const [hud,setHud]=useState<Hud>(blank),hudRef=useRef(hud);
 const [save,setSave]=useState<FlickitSave>(emptyFlickitSave),[result,setResult]=useState<Result|null>(null),[between,setBetween]=useState<Between|null>(null),[today,setToday]=useState('');
 const [board,setBoard]=useState<{score:number}|null>(null),[scores,setScores]=useState(false),[words,setWords]=useState<Word[]>([]),[pick,setPick]=useState(false);
 const [hint,setHint]=useState(''),[foot,setFoot]=useState<{id:number;text:string;sub:string;tone:string}|null>(null),[finger,setFinger]=useState<{x:number;y:number;dx:number;dy:number;ms:number}|null>(null);
 const entry=useArcadeEntry('flickit');
 const stage=useRef<HTMLDivElement>(null),focusEl=useRef<HTMLDivElement>(null),swipe=useRef<SVGPathElement>(null);
 const game=useRef<FlickIt|null>(null),view=useRef<FlickitView|null>(null),audio=useRef<FlickitAudio|null>(null);
 const raf=useRef(0),last=useRef(0),slot=useRef(0),urgent=useRef(false),stopUntil=useRef(0),slowUntil=useRef(0),frameMs=useRef(1000/30),endAt=useRef(0),wordId=useRef(0),run=useRef({id:'',mode:'tour' as FlickMode,day:'',done:true,stage:0}),kicks=useRef(0),lifeKicks=useRef(0);
 const path=useRef<Pt[]>([]),pid=useRef(-1),keys=useRef({left:false,right:false,up:false,down:false,q:false,e:false}),kAim=useRef({yaw:0,pitch:.22,t0:0,on:false}),ghostBuf=useRef(new Float32Array(78));
 const reduced=useRef(false),frameRef=useRef<(t:number)=>void>(()=>{});
 const change=useCallback((p:Phase)=>{phaseRef.current=p;setPhase(p);},[]);
 useEffect(()=>{setSave(readFlickitSave());setToday(localPlayDay(Date.now()));},[]);
 useEffect(()=>{if(!foot)return;const t=setTimeout(()=>setFoot(null),1700);return()=>clearTimeout(t);},[foot]);
 const kick=useCallback(()=>{if(!raf.current&&phaseRef.current==='playing'){last.current=0;slot.current=0;raf.current=requestAnimationFrame(t=>frameRef.current(t));}},[]);
 const say=useCallback((text:string,pts:number,tone:Word['tone'],teach=false,at?:{x:number;y:number})=>{const w:Word={id:++wordId.current,text,pts,tone,teach,x:at?.x??-1,y:at?.y??-1};
  setWords(list=>{const keep=list.filter(x=>!(teach&&x.teach)).slice(-3);if(w.x>=0){const y0=Math.max(150,w.y),free=(y:number)=>y>=150&&!keep.some(o=>!o.teach&&o.x>=0&&Math.abs(o.x-w.x)<140&&Math.abs(o.y-y)<64);w.y=[0,-70,70,-140].map(d=>y0+d).find(free)??y0;}return [...keep,w];});},[]);
 const syncHud=useCallback(()=>{const g=game.current;if(!g)return;const s=g.state,n:Hud={score:s.total+(s.phase==='done'?0:s.score),level:s.score,flicks:s.flicks,max:s.stage.flicks,par:s.par,stage:s.stage.name,ix:s.ix},h=hudRef.current;
  if(n.score!==h.score||n.level!==h.level||n.flicks!==h.flicks||n.stage!==h.stage||n.par!==h.par){hudRef.current=n;setHud(n);}},[]);

 /* the aim ghost for the first kicks: a dotted flight to the nearest thing, and a finger that shows the swipe */
 const ghost=useCallback(()=>{const g=game.current,v=view.current,el=stage.current;if(!g||!v||!el)return;const s=g.state;
  if(s.phase!=='tee'||kicks.current>=2||(lifeKicks.current>=6&&s.ix>0)||s.mode==='daily'){v.setGhost(ghostBuf.current,0);setFinger(null);return;}
  let shot:Shot|null=null;for(const e of s.ents){if(!e.need||e.done)continue;shot=solveShot(e,0,s.ents);if(shot)break;}
  if(!shot){v.setGhost(ghostBuf.current,0);setFinger(null);return;}
  v.setGhost(ghostBuf.current,predict(shot,ghostBuf.current,5));const r=el.getBoundingClientRect(),p=v.project(0,FK.R,0),sw=shotToSwipe(shot,{w:r.width,h:r.height},v.flickCam());setFinger({x:p.x,y:p.y,dx:sw.dx,dy:sw.dy,ms:sw.ms});},[]);

 /* ---- the run's end: save, coins, board (once per run) ---- */
 const finish=useCallback(()=>{
  const g=game.current,r=run.current;if(!g||r.done)return;r.done=true;const s=g.state,total=s.total,results=s.results.map(x=>({...x})),lastR=results[results.length-1];
  const settled=settleFlickit(readFlickitSave(),{mode:r.mode,day:r.day,total,results});writeFlickitSave(settled.save);setSave(settled.save);
  if(r.mode==='tour')saveArcadeRecord('flickit',total);else if(r.mode==='daily')noteLastScore('flickit_daily',total,settled.dailyBest);
  const coins=arcadeCoinTarget('flickit',{points:total});if(coins>0)void creditRun(r.id,'flickit',coins,FLICKIT_COIN_REASON);
  const par=s.par,to3=starScore(par,3)-lastR.score,line=settled.newBest&&settled.previousBest>0?`New best by ${total-settled.previousBest}. Can you do it again?`
   :r.mode==='tour'&&lastR.stars<1?`${starScore(par,1)-lastR.score} more points on ${STAGES[s.ix].name} to go on`
   :lastR.stars<3&&to3>0?`${to3} points from three stars`:r.mode==='tour'?'The whole Tour. Now beat your total.':'Three stars. Try a trick shot for more.';
  setResult({mode:r.mode,total,results,last:lastR,par,tip:tipFor(lastR.stats,lastR.cleared),settled,coins,line});
  if(r.mode==='tour'&&total>0)setBoard({score:total});
  if(settled.newBest||lastR.stars===3)arcadeFeedback(null,'goal');
  setWords([]);setHint('');setFinger(null);setBetween(null);change('over');
 },[change]);

 /* ---- one rules event: sound, haptics, words ---- */
 const onEvent=useCallback((e:FlickEvent)=>{
  const a=audio.current,v=view.current,g=game.current;if(!g)return;v?.onEvent(e,g);const now=performance.now();
  const at=()=>{const p=v?.project(e.x,e.y+.5,e.z),w=stage.current?.clientWidth??390;return p&&p.on?{x:Math.max(84,Math.min(w-84,p.x)),y:p.y}:undefined;};
  switch(e.type){
   case 'kick':a?.kick(e.a,e.b);arcadeFeedback(null,e.a>.7?'shot':'collect');urgent.current=true;break;
   case 'hit':{a?.hit(e.k,e.a);arcadeFeedback(null,e.a>1?'combo':'collect');if(!reduced.current)stopUntil.current=now+(e.k===K.goal||e.k===K.barrel||e.a>=3?90:45);
    const list=HIT_WORD[e.k]??['BONK!'],word=e.a>1?e.word:list[(e.id+e.points)%list.length];say(word,e.points,e.a>1?'red':e.k===K.goal||e.k===K.bin||e.k===K.tyre?'sun':'paper',false,at());break;}
   case 'trick':a?.trick();arcadeFeedback(null,'perfect');if(!reduced.current)slowUntil.current=now+340;say(e.word,e.points,'teal',true);break;
   case 'goal':a?.goal(e.a===1);if(e.a===1)say('TOP CORNER!',0,'red',true);break;
   case 'net':a?.net();break;
   case 'pop':a?.pop();break;
   case 'ping':a?.ping();if(e.k===K.hoop||e.k===K.tyre||e.k===K.bin)say('OFF THE RIM!',0,'paper',false,at());break;
   case 'block':a?.block();if(e.k===K.wall)say('BLOCKED! BEND IT ROUND',0,'paper',true);else if(e.k===K.fence)say('LIFT IT: LONGER SWIPE',0,'paper',true);break;
   case 'weak':a?.weak();say('TOO SOFT! SWIPE FASTER',0,'paper',true);break;
   case 'saved':a?.saved();say('SAVED!',0,'teal',false,at());break;
   case 'bounce':a?.bounce(e.a<6);break;
   case 'fall':break;
   case 'near':if(!reduced.current&&(e.a>=.25||g.state.combo>0||g.state.ents.filter(x=>x.need&&!x.done).length<=2)){slowUntil.current=now+420;a?.near();}break;
   case 'close':a?.close();say('SO CLOSE!',0,'paper',true);break;
   case 'miss':if(kicks.current<=3)setHint(g.state.shot.power<.3?'Swipe faster for more power.':'Start your swipe on the ball. Aim where you want it to go.');break;
   case 'tee':a?.tee();ghost();break;
   case 'stage':a?.stage();break;
   case 'level':a?.level(e.a);arcadeFeedback(null,e.a>0?'goal':'slam');endAt.current=now+(reduced.current?500:1300);say(e.word||(e.a>=3?'THREE STARS!':e.a>0?'LEVEL DONE!':'OUT OF FLICKS!'),0,e.a>0?'sun':'paper',true);break;
  }
 },[say,ghost]);

 /* ---- a kick ---- */
 const shoot=useCallback((shot:Shot)=>{const g=game.current;if(!g||!g.flick(shot))return;kicks.current++;lifeKicks.current++;setHint('');setFinger(null);
  const f=footFor(shot);setFoot({id:kicks.current,text:FOOT[f],sub:shot.top>=FK.dipTop?'Dipping':shot.top<=-.4?'Floating':Math.abs(shot.spin)>=.2?(shot.spin<0?'Bending left':'Bending right'):shot.power>.7?'Driven':'Placed',tone:f==='laces'?'sun':f==='inside'?'teal':'red'});},[]);

 /* ---- the loop ---- */
 useEffect(()=>{frameRef.current=(now:number)=>{
  raf.current=0;const g=game.current,v=view.current;if(phaseRef.current!=='playing'||!g||!v)return;
  const next=urgent.current?now:frameCapSlot(now,slot.current,frameMs.current);urgent.current=false;
  if(next<0){raf.current=requestAnimationFrame(t=>frameRef.current(t));return;}slot.current=next;
  const dt=last.current?Math.min(.1,(now-last.current)/1000):1/60;last.current=now;const slow=now<slowUntil.current&&g.state.phase==='fly';
  // keyboard aim: arrows turn and lift, Space held = power; the ghost shows the kick
  const k=keys.current,ka=kAim.current;if(g.state.phase==='tee'&&(k.left||k.right||k.up||k.down||ka.on)){const c=v.flickCam();ka.yaw=Math.max(-.7,Math.min(.7,ka.yaw+((k.right?1:0)-(k.left?1:0))*.7*dt));ka.pitch=Math.max(FK.pitchMin,Math.min(FK.pitchMax,ka.pitch+((k.up?1:0)-(k.down?1:0))*.5*dt));
   const power=ka.on?Math.min(1,.2+(now-ka.t0)/900):.55;v.setGhost(ghostBuf.current,predict({power,yaw:c.yaw+ka.yaw,pitch:ka.pitch,spin:k.e?.7:k.q?-.7:0,top:0},ghostBuf.current,5));}
  if(now>=stopUntil.current){g.advance(dt*(slow?.3:1));g.drain(onEvent);}
  v.render(g,now/1000,slow?1:0);syncHud();
  if(g.state.phase==='done'&&endAt.current&&now>=endAt.current){endAt.current=0;
   if(g.state.over){finish();return;}
   const s=g.state,r=s.results[s.results.length-1];setBetween({result:{...r},tip:tipFor(r.stats,r.cleared),next:STAGES[s.ix+1].name,par:s.par,total:s.total});setWords([]);setFoot(null);change('between');return;}
  raf.current=requestAnimationFrame(t=>frameRef.current(t));
 };},[finish,onEvent,syncHud,change]);

 /* ---- start / next stage ---- */
 const start=useCallback(async(mode:FlickMode,stageIx=0)=>{
  (audio.current??=createFlickitAudio()).unlock();
  const id=await entry.enter();if(!id)return;
  const day=localPlayDay(Date.now()),seed=mode==='daily'?flickitDailySeed(day):1+Math.floor(Math.random()*2_000_000_000);
  const g=game.current=createFlickIt({mode,seed,stage:stageIx});run.current={id,mode,day,done:false,stage:stageIx};kicks.current=0;stopUntil.current=0;slowUntil.current=0;endAt.current=0;
  if(mode==='tour')beginBoardSession('flickit');
  view.current?.setStage(g,true);audio.current?.hush(false);g.drain(()=>{});setResult(null);setBetween(null);setBoard(null);setWords([]);setToday(day);setFoot(null);setPick(false);kAim.current={yaw:0,pitch:.22,t0:0,on:false};
  setHint(g.state.stage.lesson);syncHud();change('playing');kick();ghost();focusEl.current?.focus({preventScroll:true});
 },[change,entry,kick,syncHud,ghost]);
 const nextStage=useCallback(()=>{const g=game.current;if(!g||phaseRef.current!=='between')return;audio.current?.unlock();if(!g.next()){finish();return;}kicks.current=0;g.drain(()=>{});view.current?.setStage(g,true);
  setBetween(null);setHint(g.state.stage.lesson);syncHud();change('playing');kick();ghost();focusEl.current?.focus({preventScroll:true});},[change,finish,kick,syncHud,ghost]);
 const pause=useCallback(()=>{if(phaseRef.current!=='playing')return;if(raf.current)cancelAnimationFrame(raf.current);raf.current=0;path.current=[];pid.current=-1;kAim.current.on=false;swipe.current?.setAttribute('d','');audio.current?.hush(true);change('paused');},[change]);
 const resume=useCallback(()=>{if(phaseRef.current!=='paused')return;audio.current?.unlock();audio.current?.hush(false);change('playing');kick();},[change,kick]);
 const leave=useCallback(()=>{if(raf.current)cancelAnimationFrame(raf.current);raf.current=0;onExit();},[onExit]);

 /* ---- the 3D view, size, the finger ---- */
 useEffect(()=>{
  const el=stage.current;if(!el)return;
  reduced.current=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile=matchMedia('(pointer: coarse)').matches;frameMs.current=1000/(mobile?30:60);
  let v:FlickitView;try{v=view.current=createFlickitView(el,{reduced:reduced.current,mobile});}catch{return;}
  const fit=()=>{const r=el.getBoundingClientRect();v.resize(Math.max(1,r.width),Math.max(1,r.height),window.devicePixelRatio||1);const g=game.current;if(g&&phaseRef.current!=='playing')v.render(g,performance.now()/1000);};
  // the menu shows the first place once (one draw), then sleeps
  {const idle=createFlickIt({mode:'stage',seed:1,stage:0});v.setStage(idle,false);fit();v.render(idle,0);}
  const ro=new ResizeObserver(fit);ro.observe(el);window.visualViewport?.addEventListener('resize',fit);
  const local=(e:PointerEvent):Pt=>{const r=el.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top,t:performance.now()};};
  const draw=()=>{const p=path.current,s=swipe.current;if(!s)return;let d='';for(let i=Math.max(0,p.length-24);i<p.length;i++)d+=`${d?'L':'M'}${p[i].x.toFixed(1)} ${p[i].y.toFixed(1)}`;s.setAttribute('d',d);s.dataset.live='1';};
  const down=(e:PointerEvent)=>{if(phaseRef.current!=='playing'||(e.pointerType==='mouse'&&e.button!==0)||(e.target instanceof Element&&e.target.closest('button')))return;
   const g=game.current;if(!g)return;e.preventDefault();audio.current?.unlock();if(g.state.phase==='done'){endAt.current=1;return;}
   try{el.setPointerCapture(e.pointerId);}catch{/* fine without */}pid.current=e.pointerId;path.current=[local(e)];draw();};
  const move=(e:PointerEvent)=>{if(e.pointerId!==pid.current)return;e.preventDefault();const p=path.current,q=local(e);p.push(q);while(p.length>2&&q.t-p[0].t>600)p.shift();draw();
   // the kicker sinks into its run-up as the finger travels (a number handed to the view; the kick itself is read on release)
   v.setCharge(Math.hypot(q.x-p[0].x,q.y-p[0].y)/(Math.max(1,Math.min(el.clientWidth,el.clientHeight*.62))*.5));};
  const up=(e:PointerEvent)=>{if(e.pointerId!==pid.current)return;pid.current=-1;try{el.releasePointerCapture(e.pointerId);}catch{/* gone */}const p=path.current;path.current=[];if(swipe.current)delete swipe.current.dataset.live;
   if(e.type==='pointercancel'||phaseRef.current!=='playing'){v.setCharge(0);return;}p.push(local(e));const g=game.current;if(!g||g.state.phase!=='tee'){v.setCharge(0);return;}
   const r=el.getBoundingClientRect(),shot=flickToShot(p,{w:r.width,h:r.height},v.flickCam());if(shot)shoot(shot);else v.setCharge(0);};
  const opt={passive:false} as const;
  el.addEventListener('pointerdown',down,opt);el.addEventListener('pointermove',move,opt);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
  const noScroll=(e:TouchEvent)=>{if(phaseRef.current==='playing'&&e.cancelable)e.preventDefault();};el.addEventListener('touchmove',noScroll,opt);
  const noMenu=(e:Event)=>e.preventDefault();el.addEventListener('contextmenu',noMenu);
  if(process.env.NODE_ENV!=='production')(window as unknown as {__flickit?:unknown}).__flickit={get game(){return game.current;},get phase(){return phaseRef.current;},get loop(){return raf.current!==0;},get view(){return view.current;},get audio(){return audio.current;},get stage(){return el.getBoundingClientRect();},shoot,flickToShot,solveShot};
  return()=>{ro.disconnect();window.visualViewport?.removeEventListener('resize',fit);el.removeEventListener('pointerdown',down);el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up);el.removeEventListener('touchmove',noScroll);el.removeEventListener('contextmenu',noMenu);
   if(raf.current)cancelAnimationFrame(raf.current);raf.current=0;v.dispose();view.current=null;game.current=null;audio.current?.dispose();audio.current=null;delete (window as unknown as {__flickit?:unknown}).__flickit;};
 },[shoot]);

 /* ---- keys; looked away: pause ---- */
 useEffect(()=>{
  const away=()=>pause(),hidden=()=>{if(document.hidden)pause();};
  const isUi=(e:KeyboardEvent)=>e.target instanceof HTMLElement&&!!e.target.closest('button,input,select,textarea,a,dialog');
  const map:Record<string,'left'|'right'|'up'|'down'|'q'|'e'>={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',KeyQ:'q',KeyE:'e'};
  const key=(e:KeyboardEvent)=>{if(isUi(e))return;
   if(e.code==='Escape'||e.code==='KeyP'){e.preventDefault();if(phaseRef.current==='playing')pause();else if(phaseRef.current==='paused')resume();return;}
   const g=game.current;if(phaseRef.current!=='playing'||!g)return;audio.current?.unlock();
   if(g.state.phase==='done'){if(e.code==='Enter'||e.code==='Space'){e.preventDefault();endAt.current=1;}return;}
   const m=map[e.code];if(m){e.preventDefault();keys.current[m]=true;setFinger(null);return;}
   if(e.code==='Space'||e.code==='Enter'){e.preventDefault();if(!e.repeat&&!kAim.current.on&&g.state.phase==='tee'){kAim.current.on=true;kAim.current.t0=performance.now();setFinger(null);}}};
  const keyUp=(e:KeyboardEvent)=>{const m=map[e.code];if(m){keys.current[m]=false;return;}const g=game.current,ka=kAim.current,v=view.current;if(!g||!v||phaseRef.current!=='playing'||!ka.on)return;
   if(e.code==='Space'||e.code==='Enter'){ka.on=false;const k=keys.current;shoot({power:Math.min(1,.2+(performance.now()-ka.t0)/900),yaw:v.flickCam().yaw+ka.yaw,pitch:ka.pitch,spin:k.e?.7:k.q?-.7:0,top:0});}};
  window.addEventListener('blur',away);document.addEventListener('visibilitychange',hidden);window.addEventListener('keydown',key);window.addEventListener('keyup',keyUp);
  return()=>{window.removeEventListener('blur',away);document.removeEventListener('visibilitychange',hidden);window.removeEventListener('keydown',key);window.removeEventListener('keyup',keyUp);};
 },[pause,resume,shoot]);

 const busy=entry.pending,live=phase==='playing'||phase==='paused',dailyToday=save.daily.day===today?save.daily:null,streak=today?liveStreak(save,today):0,stars=totalStars(save);
 const tap=()=>{(audio.current??=createFlickitAudio()).unlock();audio.current.tap();};
 const liveStars=starsFor(hud.level,hud.par),nextAt=liveStars<3?starScore(hud.par,liveStars+1):0;
 return <div className={`${styles.game} ${arcadeSkin.flickit} ${comicRoot}`} data-game="flickit" data-arcade-kind="flickit" data-phase={phase}>
  <aside className={styles.side} data-side="left" aria-hidden="true">
   <ComicPanel tilt={-1.5} tone="paper"><b>Flick it</b><br/>Swipe up through the ball. A faster swipe is a harder kick. A longer swipe lifts it.</ComicPanel>
   <ComicPanel tilt={1} tone="sun"><b>Bend it</b><br/>Curve your swipe and the ball curves the same way, round a wall or through a line of balloons.</ComicPanel>
   <ComicPanel tilt={-.8} tone="teal"><b>Keys</b><br/>Arrows aim and lift. Hold Space for power. Q or E to curl. P pauses.</ComicPanel>
  </aside>
  <aside className={styles.side} data-side="right" aria-hidden="true">
   <ComicPanel tilt={1.2} tone="paper"><b>Which part of the foot?</b><br/>Laces: straight and hard. Inside of the foot: bends it. Outside: bends it the other way.</ComicPanel>
   <ComicPanel tilt={-1} tone="red"><b>Trick shots</b><br/>Two things with one ball. Round the wall. In off the bar. Each one pays extra.</ComicPanel>
   <ComicPanel tilt={.8} tone="sun"><b>Stars</b><br/>Hit everything for three stars. One star takes you to the next place on the Tour.</ComicPanel>
  </aside>
  <div className={styles.stage} ref={stage} data-flickit-stage>
   <div ref={focusEl} className={styles.play} tabIndex={0} role="application" aria-label="Flick It. Swipe up through the ball to kick it. A faster swipe is harder, a longer swipe is higher, a curved swipe bends the ball. Keys: arrows aim, hold Space for power, Q or E curl."/>
   <svg className={styles.swipe} aria-hidden="true"><path ref={swipe} d=""/></svg>
   {live&&<div className={styles.strip} data-flickit-hud aria-live="polite" aria-label={`${hud.stage}. ${hud.flicks} flicks left. ${liveStars} stars.`}>
    <b className={styles.place}>{hud.stage}</b>
    <span className={styles.track} data-flickit-stars={liveStars}><Stars n={liveStars} size={18}/>{nextAt>0&&<small>{Math.max(0,nextAt-hud.level)} to go</small>}</span>
   </div>}
   {live&&<div className={styles.rack} data-flickit-flicks={hud.flicks} aria-hidden="true">{Array.from({length:hud.max},(_,i)=><i key={i} data-off={i>=hud.flicks||undefined}/>)}<small>{hud.flicks===1?'Last flick':`${hud.flicks} flicks`}</small></div>}
   {phase==='playing'&&foot&&<span className={styles.foot} key={foot.id} data-tone={foot.tone} data-flickit-foot>{foot.text}<small>{foot.sub}</small></span>}
   {phase==='playing'&&finger&&<i className={styles.finger} key={`${finger.x|0}${finger.dx|0}${hud.flicks}`} style={{left:finger.x,top:finger.y,'--fx':`${finger.dx}px`,'--fy':`${finger.dy}px`,'--fms':`${Math.round(Math.max(700,finger.ms*4+500))}ms`} as React.CSSProperties} aria-hidden="true"/>}
   {phase==='playing'&&hint&&<p className={styles.hint} data-flickit-hint>{hint}</p>}
   <div className={styles.words} aria-live="polite">{words.map(w=><span key={w.id} className={styles.word} data-teach={w.teach||undefined} style={w.x>=0?{left:w.x,top:w.y}:undefined} onAnimationEnd={()=>setWords(l=>l.filter(x=>x.id!==w.id))}>
    <ComicBurst word={w.text} size={w.teach?(w.text.length>14?19:25):w.text.length>8?16:20} tilt={w.id%2?-4:3} color={w.tone==='red'?'#f0452e':w.tone==='teal'?'#19b5a5':w.tone==='paper'?'#fff3d6':'#ffc83a'} fill={w.tone==='red'?'#fff3d6':undefined}/>
    {w.pts>0&&<b className={`${comicNumeral} ${styles.pts}`}>+{w.pts}</b>}</span>)}</div>
  </div>
  <ArcadeTopBar game="flickit" className={styles.topBar} backTitle="Back to arcade" onBack={leave} value={live||phase==='between'?hud.score:undefined} word="pts" bumpKey={hud.score} paused={phase==='paused'} canPause={live} onPause={()=>phase==='playing'?pause():resume()}/>
  {phase==='paused'&&<ArcadePauseCard game="flickit" score={`${hud.score} pts · ${hud.stage} · ${hud.flicks} ${hud.flicks===1?'flick':'flicks'} left`} status={entry.message||undefined} onResume={resume} onExit={leave} onRestart={()=>{void start(run.current.mode,run.current.stage);}} restartDisabled={busy} keys={[['Arrows','aim and lift'],['Space','hold, then kick'],['Q / E','curl'],['P','pause']]}/>}
  {phase==='menu'&&<ComicCard label="Flick It" title="Flick It" badge="Swipe to kick" badgeTone="red" best={save.best>0?`Best ${save.best}`:undefined} data-flickit-card="start">
   <FlickArt/>
   <p className={styles.learn}><b>Swipe up</b> through the ball to kick it. Swipe <b>faster</b> for power and <b>longer</b> for height. <b>Curve</b> your swipe and the ball bends. Knock over cans, ring the bell, curl it round the wall.</p>
   {pick?<div className={styles.picker} data-flickit-picker>{STAGES.map((d,i)=>{const open=stageOpen(save,i);return <button key={d.id} type="button" className={styles.stageBtn} disabled={busy||!open} data-open={open||undefined} data-flickit-stage-pick={d.id} onClick={()=>{void start('stage',i);}}><b>{i+1}. {d.name}</b>{open?<Stars n={save.stars[i]} size={15}/>:<small>One star on {STAGES[i-1].name}</small>}</button>;})}
    <ComicButton size="small" onClick={()=>{tap();setPick(false);}}>Back</ComicButton></div>
   :<>
    <div className={styles.chips}>
     <ComicStat value={save.best||'–'} label="Tour best"/>
     <ComicStat value={`${stars}/18`} label="Stars" tone={stars>0?'sun':undefined} data-flickit-starcount={stars}/>
     <ComicStat value={streak} label={streak===1?'Day in a row':'Days in a row'} tone={streak>0?'teal':undefined}/>
    </div>
    {entry.message&&<p className={styles.status} role="status">{entry.message}</p>}
    <div className={styles.actions}>
     <ComicButton variant="primary" wide disabled={busy} onClick={()=>{void start('tour',0);}} data-flickit-play autoFocus>Play the Tour<small>Six places. One star to go on</small></ComicButton>
     <ComicButton variant="teal" wide disabled={busy} onClick={()=>{void start('daily');}} data-flickit-daily>Daily Flick<small>{dailyToday?`Today’s best ${dailyToday.best}`:'Same targets for everyone today'}</small></ComicButton>
     <ComicButton size="small" onClick={()=>{tap();setPick(true);}} data-flickit-practice>Practise a place</ComicButton>
     <ComicButton size="small" onClick={()=>{tap();setScores(true);}} data-flickit-scores>Scores</ComicButton>
    </div></>}
  </ComicCard>}
  {phase==='between'&&between&&<ComicCard label="Level done" badge={STAGES.find(d=>d.id===between.result.stage)?.name} badgeTone="teal" best={`Tour ${between.total}`} data-flickit-card="between">
   <div className={styles.scoreRow}><Stars n={between.result.stars} size={44}/></div>
   <strong className={`${comicNumeral} ${styles.scoreSmall}`}>{between.result.score}</strong>
   {between.result.spare>0&&<p className={styles.status}>Cleared with {between.result.spare} {between.result.spare===1?'flick':'flicks'} to spare: +{between.result.spare*FK.spare}</p>}
   <ComicPanel tone="paper" flat className={styles.fact} data-flickit-tip><b>{between.tip.title}</b>{between.tip.line}</ComicPanel>
   <div className={styles.actions}><ComicButton variant="primary" wide onClick={nextStage} data-flickit-next autoFocus>Next: {between.next}</ComicButton></div>
  </ComicCard>}
  {phase==='over'&&result&&<ComicCard label="Full time" badge={result.mode==='daily'?'Daily Flick':result.mode==='tour'?'Tour':STAGES.find(d=>d.id===result.last.stage)?.name} badgeTone={result.mode==='daily'?'teal':'red'} best={result.mode==='daily'?`Today ${result.settled.dailyBest}`:result.mode==='tour'?`Best ${result.settled.save.best}`:undefined} data-flickit-card="results" data-flickit-score={result.total}>
   <div className={styles.scoreRow}>
    <strong className={`${comicNumeral} ${styles.score}`} data-new-best={result.settled.newBest||undefined}>{result.total}</strong>
    {result.settled.newBest&&<ComicBurst word="New best!" size={17} tilt={7} className={styles.stamp}/>}
   </div>
   {result.mode==='tour'?<div className={styles.tour} data-flickit-tour>{STAGES.map((d,i)=>{const r=result.results[i];return <span key={d.id} data-played={!!r||undefined}><small>{i+1}</small><Stars n={r?r.stars:0} size={13}/></span>;})}</div>
    :<div className={styles.scoreRow}><Stars n={result.last.stars} size={34}/></div>}
   <ComicPanel tone="sun" tilt={-1.2} className={styles.near} data-flickit-near>{result.line}</ComicPanel>
   <div className={styles.hsSlot} data-hs-slot/>
   <div className={styles.actions}>
    <ComicButton variant="primary" wide disabled={busy} onClick={()=>{void start(result.mode,run.current.stage);}} data-flickit-again autoFocus>Play again</ComicButton>
    <ComicButton size="small" disabled={busy} onClick={()=>{void start(result.mode==='daily'?'tour':'daily');}} data-flickit-other>{result.mode==='daily'?'The Tour':'Daily Flick'}</ComicButton>
    <ComicButton size="small" onClick={()=>{tap();setScores(true);}}>Scores</ComicButton>
   </div>
   <div className={styles.chips}>
    <ComicStat value={`${result.last.stats.scored}/${result.last.stats.flicks}`} label="Flicks on target"/>
    <ComicStat value={result.last.stats.bestCombo>=2?`${result.last.stats.bestCombo} hits`:'–'} label="Best flick"/>
    <ComicStat value={result.results.reduce((n,r)=>n+r.stats.curls+r.stats.arounds+r.stats.overs+r.stats.banks+r.stats.longs,0)} label="Trick shots"/>
   </div>
   <ComicPanel tone="paper" flat className={styles.fact} data-flickit-tip><b>{result.tip.title}</b>{result.tip.line}</ComicPanel>
   {(result.coins>0||entry.message)&&<p className={styles.status} role="status">{entry.message||`+${result.coins} ${result.coins===1?'coin':'coins'}`}</p>}
  </ComicCard>}
  {board&&phase==='over'&&<HighScoreEntry game="flickit" score={board.score} detail="Points for every target you hit on the six-stage Tour. One flick's second and third hits pay more, and trick shots pay extra." onClose={()=>setBoard(null)}/>}
  {scores&&<FlickItScores onClose={()=>setScores(false)}/>}
 </div>;
}
