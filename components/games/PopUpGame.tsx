'use client';
/**
 * Pop-Up Shot shell (working id `popup`, Nov 21 2026, docs/arcade-aaa/popup-direction.md): a fast football shooting gallery.
 * Targets pop out of windows, hedges, bins, boats, a bus and the stands, and hide again; flick ball after ball at them for 50 s
 * (60 s in the Daily Arena). Rules: lib/arcade/popup/core.ts (pure, seeded, fixed steps). Picture: view.ts (one three.js scene, comic
 * print). Sound: audio.ts. This shell owns the finger, the keys, the clock, the words and the cards.
 * Finger: swipe anywhere; the direction is the aim, the speed is the power (how far up the screen), a bent swipe curls. A quick swipe
 * fires as soon as it is long enough, so bursts of flicks are easy. A tap on a target also sends a ball there.
 * Keys: Left / Right pick a target, Space or Enter flicks at it, P or Escape pauses.
 * Heat: the loop runs only while playing (30 draws a second on phones, 60 on desktop); cards, pause and a hidden tab sleep. Hit-stop
 * and slow motion only scale the time handed to the fixed-step core.
 * Teaches (AGENTS.md): "Look up. Pick the target. Strike." Scanning, quick decisions, accuracy, and not hitting the coach or referee.
 */
import React,{useCallback,useEffect,useRef,useState} from 'react';
import dynamic from 'next/dynamic';
import {retryImport} from '@/lib/retryImport';
import {ArcadeTopBar} from '../arcade/ArcadeTopBar';
import {ArcadePauseCard} from '../arcade/ArcadePauseCard';
import {arcadeSkin} from './skins';
import {comicRoot,comicNumeral,ComicButton,ComicCard,ComicPanel,ComicStat,ComicBurst,ComicMedalTrack} from './comic';
import styles from './PopUpGame.module.css';
import {createPopup,popupDaily,flickFromSwipe,curlFromBend,powerForReach,comboMult,medalFor,K,PU,MEDAL_NAMES,type Popup,type PopEvent} from '@/lib/arcade/popup/core';
import {ARENAS} from '@/lib/arcade/popup/arenas';
import {createPopupView,type PopupView} from '@/lib/arcade/popup/view';
import {createPopupAudio,type PopupAudio} from '@/lib/arcade/popup/audio';
import {readPopupSave,writePopupSave,settlePopup,nearMissLine,emptyPopupSave,liveStreak,type PopupSave,type PopupSettled} from '@/lib/arcade/popup/save';
import {frameCapSlot} from '@/lib/town/frameCap';
import {arcadeFeedback} from '@/lib/arcade/arcadeFeedback';
import {useArcadeEntry} from '@/lib/arcade/useArcadeEntry';
import {creditRun,arcadeCoinTarget} from '@/lib/arcade/arcadeWallet';
import {saveArcadeRecord} from '@/lib/arcade/arcadeRecords';
import {beginBoardSession} from '@/lib/arcade/boardClient';
import {noteLastScore} from '@/lib/arcade/lastScore';
import {localPlayDay} from '@/lib/town/dailyPlay';
const HighScoreEntry=dynamic(()=>retryImport(()=>import('../arcade/HighScoreEntry')),{ssr:false});
const PopUpScores=dynamic(()=>retryImport(()=>import('./PopUpScores')),{ssr:false});

type Phase='menu'|'playing'|'paused'|'over';
type Hud={score:number;left:number;combo:number;streak:number;rack:number;triple:number;quick:boolean;fire:boolean};
type Word={id:number;text:string;pts:number;tone:'sun'|'red'|'teal'|'paper';teach:boolean;x:number;y:number};
type Result={score:number;daily:boolean;arena:number;settled:PopupSettled;coins:number;line:string;acc:number;knocks:number;bestCombo:number;bestStreak:number;far:number;multis:number;accBonus:number;fairBonus:number};
type Pt={x:number;y:number;t:number};
export const POPUP_COIN_REASON='Pop-Up Shot: round';
const WORDS:Record<number,string[]>={[K.dummy]:['CLACK!','DOWN!','BONK!'],[K.peeker]:['SLAP!','GOTCHA!'],[K.armour]:['CLANG-DOWN!'],[K.balloon]:['POP!'],[K.runner]:['TUMBLE!','GOT IT!'],[K.gold]:['GOLD!'],[K.bag]:['BALLS!']};
const blankHud:Hud={score:0,left:PU.secs,combo:0,streak:0,rack:PU.rack,triple:0,quick:false,fire:false};

function PopArt(){return <svg className={styles.art} viewBox="0 0 260 120" aria-hidden="true">
 <rect x="2" y="2" width="256" height="116" fill="#f6a968" stroke="#231a2e" strokeWidth="4"/><path d="M2 92h256v26H2z" fill="#d9c7a3" stroke="#231a2e" strokeWidth="4"/>
 <g stroke="#231a2e" strokeWidth="3"><rect x="150" y="14" width="96" height="78" fill="#e9a45e"/><rect x="162" y="26" width="30" height="28" fill="#3a2f58"/><rect x="204" y="26" width="30" height="28" fill="#3a2f58"/><rect x="160" y="54" width="34" height="8" fill="#19b5a5"/><rect x="202" y="54" width="34" height="8" fill="#f0452e"/>
  <rect x="170" y="30" width="16" height="22" fill="#f0452e"/><circle cx="178" cy="40" r="5" fill="#fff3d6"/><rect x="24" y="62" width="66" height="30" fill="#f0452e"/><rect x="30" y="66" width="54" height="10" fill="#bfe9f5"/><circle cx="38" cy="92" r="6" fill="#231a2e"/><circle cx="76" cy="92" r="6" fill="#231a2e"/>
  <rect x="94" y="48" width="18" height="24" fill="#19b5a5"/><circle cx="103" cy="58" r="5" fill="#fff3d6"/><ellipse cx="128" cy="34" rx="10" ry="12" fill="#ff65c8"/><circle cx="110" cy="106" r="9" fill="#fffaf0"/></g>
 <path d="M110 100C118 60 150 44 176 42" fill="none" stroke="#fff3d6" strokeWidth="4" strokeDasharray="2 9" strokeLinecap="round"/><path d="M112 100C112 80 106 66 103 60" fill="none" stroke="#fff3d6" strokeWidth="4" strokeDasharray="2 9" strokeLinecap="round"/></svg>;}

export default function PopUpGame({onExit}:{onExit:()=>void}){
 const [phase,setPhase]=useState<Phase>('menu'),phaseRef=useRef<Phase>('menu');
 const [hud,setHud]=useState<Hud>(blankHud),hudRef=useRef(hud),hudAt=useRef(0);
 const [save,setSave]=useState<PopupSave>(emptyPopupSave),[result,setResult]=useState<Result|null>(null),[today,setToday]=useState(''),[pick,setPick]=useState(0);
 const [board,setBoard]=useState<{score:number}|null>(null),[scores,setScores]=useState(false),[words,setWords]=useState<Word[]>([]),[hint,setHint]=useState(''),[count,setCount]=useState('');
 const entry=useArcadeEntry('popup');
 const stage=useRef<HTMLDivElement>(null),focusEl=useRef<HTMLDivElement>(null),swipe=useRef<SVGPathElement>(null),reticle=useRef<HTMLElement>(null);
 const game=useRef<Popup|null>(null),view=useRef<PopupView|null>(null),audio=useRef<PopupAudio|null>(null);
 const raf=useRef(0),last=useRef(0),slot=useRef(0),frameMs=useRef(1000/30),stopUntil=useRef(0),slowUntil=useRef(0),goAt=useRef(0),endAt=useRef(0),wordId=useRef(0),misses=useRef(0),keySel=useRef(-1),keyMode=useRef(false);
 const run=useRef({id:'',daily:false,day:'',arena:0,done:true,first:false});
 const path=useRef<Pt[]>([]),pid=useRef(-1),fired=useRef(false),reduced=useRef(false),frameRef=useRef<(t:number)=>void>(()=>{});
 const change=useCallback((p:Phase)=>{phaseRef.current=p;setPhase(p);},[]);
 useEffect(()=>{const s=readPopupSave();setSave(s);setToday(localPlayDay(Date.now()));let best=0,bi=0;ARENAS.forEach((a,i)=>{if((s.arenas[a.id]??0)>best){best=s.arenas[a.id];bi=i;}});setPick(bi);},[]);
 useEffect(()=>{if(!hint)return;const t=setTimeout(()=>setHint(''),3800);return()=>clearTimeout(t);},[hint]);
 const kick=useCallback(()=>{if(!raf.current&&phaseRef.current==='playing'){last.current=0;slot.current=0;raf.current=requestAnimationFrame(t=>frameRef.current(t));}},[]);
 const say=useCallback((text:string,pts:number,tone:Word['tone'],teach=false,at?:{x:number;y:number})=>{const w:Word={id:++wordId.current,text,pts,tone,teach,x:at?.x??-1,y:at?.y??-1};
  setWords(list=>{const keep=list.filter(x=>!(teach&&x.teach)).slice(-4);if(w.x>=0){const y0=Math.max(120,w.y),free=(y:number)=>y>=110&&!keep.some(q=>!q.teach&&q.x>=0&&Math.abs(q.x-w.x)<130&&Math.abs(q.y-y)<58);w.y=[0,-62,62,-124].map(d=>y0+d).find(free)??y0;}return [...keep,w];});},[]);
 const syncHud=useCallback((force=false)=>{const g=game.current;if(!g)return;const s=g.state,now=performance.now();if(!force&&now-hudAt.current<100)return;hudAt.current=now;
  const n:Hud={score:s.score,left:Math.ceil(s.left),combo:s.combo,streak:s.streak,rack:s.rack,triple:s.triple,quick:s.quickT>0,fire:s.fire},h=hudRef.current;
  if(n.score!==h.score||n.left!==h.left||n.combo!==h.combo||n.streak!==h.streak||n.rack!==h.rack||n.triple!==h.triple||n.quick!==h.quick||n.fire!==h.fire){hudRef.current=n;setHud(n);}},[]);

 /* ---- the round's end: save, coins, board (once per round) ---- */
 const finish=useCallback(()=>{
  const g=game.current,r=run.current;if(!g||r.done)return;r.done=true;const s=g.state,st=s.stats,score=s.score;
  const before=readPopupSave(),settled=settlePopup(before,{score,daily:r.daily,day:r.day,arena:ARENAS[r.arena].id,stats:{...st}});writePopupSave(settled.save);setSave(settled.save);
  saveArcadeRecord('popup',score);if(r.daily)noteLastScore('popup_daily',score,settled.dailyBest);
  const coins=arcadeCoinTarget('popup',{points:score});if(coins>0)void creditRun(r.id,'popup',coins,POPUP_COIN_REASON);
  setResult({score,daily:r.daily,arena:r.arena,settled,coins,line:nearMissLine({score,best:settled.previousBest,newBest:settled.newBest,stats:st}),acc:st.flicks?Math.round(st.hits/st.flicks*100):0,knocks:st.knocks,bestCombo:st.bestCombo,bestStreak:st.bestStreak,far:st.far,multis:st.multis,accBonus:st.accBonus,fairBonus:st.fairBonus});
  if(score>0)setBoard({score});if(settled.newBest||settled.newMedal)arcadeFeedback(null,'goal');
  path.current=[];setWords([]);setHint('');setCount('');change('over');
 },[change]);

 /* ---- one rules event: sound, haptics, words, hit-stop, slow motion ---- */
 const onEvent=useCallback((e:PopEvent)=>{
  const a=audio.current,v=view.current,g=game.current;if(!g)return;v?.onEvent(e);const now=performance.now(),calm=reduced.current;
  const at=()=>{const p=v?.project(e.x,e.y+.7,e.z),w=stage.current?.clientWidth??390;return p&&p.on?{x:Math.max(70,Math.min(w-70,p.x)),y:p.y}:undefined;};
  switch(e.type){
   case 'pop':a?.pop(e.kind);break;
   case 'flick':a?.flick(e.a,e.b);arcadeFeedback(null,'collect');break;
   case 'knock':{a?.knock(e.kind,e.a);const big=e.kind===K.gold||e.kind===K.armour||(e.b&4)!==0;if(!calm)stopUntil.current=now+(big?105:65);arcadeFeedback(null,e.a>=3?'combo':'collect');
    const list=WORDS[e.kind]??['DOWN!'];let word=list[(e.points/10+e.kind)%list.length|0];if(e.b&1)word='SNAP! '+word;if(e.b&4)word='LONG ONE! '+word;
    say(word,e.points,e.kind===K.gold?'sun':e.a>=4?'red':e.b&8?'teal':'paper',false,at());
    if(e.a>=3&&e.a%2===1)say(`COMBO x${comboMult(e.a).toFixed(2).replace(/0$/,'').replace(/\.0$/,'')}`,0,'red',true);misses.current=0;break;}
   case 'hit':a?.clang();say('CLANG! ONE MORE',e.points,'paper',false,at());break;
   case 'friend':a?.whistle();arcadeFeedback(null,'slam');if(!calm)stopUntil.current=now+140;say(e.b%2?'NOT THE COACH!':'NOT THE REFEREE!',0,'red',true);setHint('Look first: the coach and the referee are on your team. Streak lost.');break;
   case 'multi':a?.multi(e.a);arcadeFeedback(null,'perfect');if(!calm)slowUntil.current=now+700;say(`${e.a} AT ONCE!`,e.points,'sun',true);break;
   case 'miss':a?.miss();misses.current++;if(misses.current===3)setHint('Pick one target, then swipe at it. Faster = further.');break;
   case 'empty':a?.empty();if(g.state.rack<=0)setHint('Out of balls! Wait a moment: the rack refills.');break;
   case 'thud':a?.thud(e.a);break;
   case 'power':a?.power(e.a);arcadeFeedback(null,'combo');say(e.a===1?'TRIPLE BALL!':'QUICK RACK!',0,'teal',true);break;
   case 'fire':a?.fire();say('ON FIRE! x1.5',0,'red',true);break;
   case 'tick':a?.tick(e.a);break;
   case 'over':a?.over();endAt.current=now+(calm?700:1500);say('FULL TIME!',0,'sun',true);break;
  }
 },[say]);

 /* ---- a flick ---- */
 const aspect=()=>{const el=stage.current;return el?Math.max(.2,el.clientWidth/Math.max(1,el.clientHeight)):.5;};
 const fire=useCallback((ang:number,power:number,curl:number)=>{const g=game.current;if(!g||phaseRef.current!=='playing'||performance.now()<goAt.current)return;
  const n=g.flick(ang,power,curl,aspect());g.drain(onEvent);if(n>0&&run.current.first&&g.state.stats.flicks===1)setHint('');syncHud(true);},[onEvent,syncHud]);

 /* ---- the loop ---- */
 useEffect(()=>{frameRef.current=(now:number)=>{
  raf.current=0;const g=game.current,v=view.current;if(phaseRef.current!=='playing'||!g||!v)return;
  const next=frameCapSlot(now,slot.current,frameMs.current);if(next<0){raf.current=requestAnimationFrame(t=>frameRef.current(t));return;}slot.current=next;
  const dt=last.current?Math.min(.1,(now-last.current)/1000):1/60;last.current=now;
  if(goAt.current&&now>=goAt.current){goAt.current=0;setCount('GO!');audio.current?.start();setTimeout(()=>setCount(c=>c==='GO!'?'':c),600);}
  if(!goAt.current&&now>=stopUntil.current){g.advance(dt*(now<slowUntil.current?.35:1));g.drain(onEvent);}
  // the keyboard target ring
  {const el=reticle.current;if(el){const s=g.state,t=keyMode.current&&keySel.current>=0?s.targets[keySel.current]:null;if(t&&t.on&&t.st!==4&&t.st!==3){const p=v.project(t.x,g.center(t),t.z);el.style.translate=`${p.x}px ${p.y}px`;el.dataset.on='1';}else{delete el.dataset.on;if(t&&keyMode.current)keySel.current=-1;}}}
  v.render(g,now/1000);syncHud();
  if(g.state.over&&endAt.current&&now>=endAt.current){endAt.current=0;finish();return;}
  raf.current=requestAnimationFrame(t=>frameRef.current(t));
 };},[finish,onEvent,syncHud]);

 /* ---- start ---- */
 const start=useCallback(async(daily:boolean,arenaIx=pick)=>{
  (audio.current??=createPopupAudio()).unlock();
  const id=await entry.enter();if(!id)return;
  const day=localPlayDay(Date.now()),d=popupDaily(day),arena=daily?d.arena:arenaIx,seed=daily?d.seed:1+Math.floor(Math.random()*2_000_000_000),sv=readPopupSave();
  const g=game.current=createPopup({seed,arena,daily});run.current={id,daily,day,arena,done:false,first:sv.plays===0};beginBoardSession('popup');
  stopUntil.current=0;slowUntil.current=0;endAt.current=0;misses.current=0;keySel.current=-1;
  view.current?.setArena(arena,true);audio.current?.hush(false);g.drain(()=>{});setResult(null);setBoard(null);setWords([]);setToday(day);
  goAt.current=performance.now()+(reduced.current?400:1150);setCount('READY?');setHint(sv.plays<3?'Swipe up at a target. A faster swipe goes further. You can tap a target too.':'');
  hudRef.current={...blankHud,left:g.dur};setHud(hudRef.current);change('playing');kick();focusEl.current?.focus({preventScroll:true});
 },[change,entry,kick,pick]);
 const pause=useCallback(()=>{if(phaseRef.current!=='playing')return;if(raf.current)cancelAnimationFrame(raf.current);raf.current=0;path.current=[];pid.current=-1;swipe.current?.setAttribute('d','');audio.current?.hush(true);change('paused');},[change]);
 const resume=useCallback(()=>{if(phaseRef.current!=='paused')return;audio.current?.unlock();audio.current?.hush(false);change('playing');kick();},[change,kick]);
 const leave=useCallback(()=>{if(raf.current)cancelAnimationFrame(raf.current);raf.current=0;onExit();},[onExit]);

 /* ---- the 3D view, size, the finger ---- */
 useEffect(()=>{
  const el=stage.current;if(!el)return;
  reduced.current=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile=matchMedia('(pointer: coarse)').matches;frameMs.current=1000/(mobile?30:60);
  let v:PopupView;try{v=view.current=createPopupView(el,{reduced:reduced.current,mobile});}catch{return;}
  const fit=()=>{const r=el.getBoundingClientRect();v.resize(Math.max(1,r.width),Math.max(1,r.height),window.devicePixelRatio||1);if(phaseRef.current!=='playing')v.render(game.current,performance.now()/1000);};
  // the menu shows the picked arena once (one draw), then sleeps
  v.setArena(0,false);fit();v.render(null,0);
  const ro=new ResizeObserver(fit);ro.observe(el);window.visualViewport?.addEventListener('resize',fit);
  const local=(e:PointerEvent):Pt=>{const r=el.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top,t:performance.now()};};
  const draw=()=>{const p=path.current,s=swipe.current;if(!s)return;let d='';for(let i=Math.max(0,p.length-20);i<p.length;i++)d+=`${d?'L':'M'}${p[i].x.toFixed(1)} ${p[i].y.toFixed(1)}`;s.setAttribute('d',d);s.dataset.live='1';};
  /** The swipe so far as a flick: the last 280 ms of the path (a slow start does not slow the kick), its bend as the curl. */
  const asFlick=(p:Pt[])=>{const q=p[p.length-1];let i0=0;while(i0<p.length-2&&q.t-p[i0].t>280)i0++;const s0=p[i0],dx=q.x-s0.x,dy=q.y-s0.y,H=el.clientHeight||1,f=flickFromSwipe(dx,dy,Math.max(16,q.t-s0.t),H);if(!f)return null;
   const m=p[Math.floor((i0+p.length-1)/2)],len=Math.hypot(dx,dy)||1,bend=((m.x-s0.x)*(-dy)+(m.y-s0.y)*dx)/len/len;return {...f,curl:curlFromBend(bend)};};
  const down=(e:PointerEvent)=>{if(phaseRef.current!=='playing'||(e.pointerType==='mouse'&&e.button!==0)||(e.target instanceof Element&&e.target.closest('button')))return;
   e.preventDefault();audio.current?.unlock();keyMode.current=false;try{el.setPointerCapture(e.pointerId);}catch{/* fine without */}pid.current=e.pointerId;fired.current=false;path.current=[local(e)];draw();};
  const move=(e:PointerEvent)=>{if(e.pointerId!==pid.current)return;e.preventDefault();const p=path.current,q=local(e);p.push(q);if(p.length>40)p.shift();draw();
   // a quick, long-enough swipe fires at once (no waiting for the finger to lift): bursts of flicks
   if(!fired.current){const s0=p[0],H=el.clientHeight||1;if(Math.hypot(q.x-s0.x,q.y-s0.y)>H*.2){const f=asFlick(p);if(f&&f.speed>1.3){fired.current=true;fire(f.ang,f.power,f.curl);}}}};
  const up=(e:PointerEvent)=>{if(e.pointerId!==pid.current)return;pid.current=-1;try{el.releasePointerCapture(e.pointerId);}catch{/* gone */}const p=path.current;path.current=[];if(swipe.current)delete swipe.current.dataset.live;
   if(e.type==='pointercancel'||phaseRef.current!=='playing'||fired.current)return;p.push(local(e));const H=el.clientHeight||1,s0=p[0],q=p[p.length-1];
   if(Math.hypot(q.x-s0.x,q.y-s0.y)<H*.035&&q.t-s0.t<350){// a tap: send the ball to the point (the aim help picks the target there)
    const [bx0,by0,bz0]=v.arena.ball,b=v.project(bx0,by0,bz0),vx=(q.x-b.x)/H,vy=(b.y-q.y)/H;if(vy<=.02)return;fire(Math.atan2(vx,vy),powerForReach(Math.hypot(vx,vy)),0);return;}
   const f=asFlick(p);if(f)fire(f.ang,f.power,f.curl);};
  const opt={passive:false} as const;
  el.addEventListener('pointerdown',down,opt);el.addEventListener('pointermove',move,opt);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
  const noScroll=(e:TouchEvent)=>{if(phaseRef.current==='playing'&&e.cancelable)e.preventDefault();};el.addEventListener('touchmove',noScroll,opt);
  const noMenu=(e:Event)=>e.preventDefault();el.addEventListener('contextmenu',noMenu);
  if(process.env.NODE_ENV!=='production')(window as unknown as {__popup?:unknown}).__popup={get game(){return game.current;},get phase(){return phaseRef.current;},get loop(){return raf.current!==0;},get view(){return view.current;},get stage(){return el.getBoundingClientRect();},fire,aspect};
  return()=>{ro.disconnect();window.visualViewport?.removeEventListener('resize',fit);el.removeEventListener('pointerdown',down);el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up);el.removeEventListener('touchmove',noScroll);el.removeEventListener('contextmenu',noMenu);
   if(raf.current)cancelAnimationFrame(raf.current);raf.current=0;v.dispose();view.current=null;game.current=null;audio.current?.dispose();audio.current=null;delete (window as unknown as {__popup?:unknown}).__popup;};
 },[fire]);
 // the start card shows the picked arena behind it
 useEffect(()=>{const v=view.current;if(!v||phase!=='menu')return;v.setArena(pick,false);v.render(null,0);},[pick,phase]);

 /* ---- keys; looked away: pause ---- */
 useEffect(()=>{
  const away=()=>pause(),hidden=()=>{if(document.hidden)pause();};
  const isUi=(e:KeyboardEvent)=>e.target instanceof HTMLElement&&!!e.target.closest('button,input,select,textarea,a,dialog');
  const open=()=>{const g=game.current,v=view.current;if(!g||!v)return [] as number[];const s=g.state;return s.targets.map((t,i)=>({t,i})).filter(({t})=>t.on&&t.st!==4&&t.st!==3&&t.e>.3).sort((a,b)=>v.project(a.t.x,0,a.t.z).x-v.project(b.t.x,0,b.t.z).x).map(o=>o.i);};
  const key=(e:KeyboardEvent)=>{if(isUi(e))return;
   if(e.code==='Escape'||e.code==='KeyP'){e.preventDefault();if(phaseRef.current==='playing')pause();else if(phaseRef.current==='paused')resume();return;}
   const g=game.current;if(phaseRef.current!=='playing'||!g)return;audio.current?.unlock();
   if(e.code==='ArrowLeft'||e.code==='ArrowRight'||e.code==='KeyA'||e.code==='KeyD'){e.preventDefault();keyMode.current=true;const l=open();if(!l.length){keySel.current=-1;return;}const at=l.indexOf(keySel.current),dir=e.code==='ArrowLeft'||e.code==='KeyA'?-1:1;keySel.current=l[at<0?(dir>0?0:l.length-1):(at+dir+l.length)%l.length];return;}
   if(e.code==='Space'||e.code==='Enter'){e.preventDefault();if(e.repeat)return;keyMode.current=true;let i=keySel.current;const l=open();if(i<0||!l.includes(i)){// nearest open target that is not a friend
     let best=-1,bd=1e9;for(const j of l){const t=g.state.targets[j];if(t.kind===K.friend)continue;const d=Math.hypot(t.x-g.arena.ball[0],t.z-g.arena.ball[2]);if(d<bd){bd=d;best=j;}}i=best;keySel.current=i;}
    if(i<0)return;const a=g.aimOf(g.state.targets[i],aspect());fire(a.ang,a.power,0);}};
  window.addEventListener('blur',away);document.addEventListener('visibilitychange',hidden);window.addEventListener('keydown',key);
  return()=>{window.removeEventListener('blur',away);document.removeEventListener('visibilitychange',hidden);window.removeEventListener('keydown',key);};
 },[pause,resume,fire]);

 const busy=entry.pending,live=phase==='playing'||phase==='paused',dailyToday=save.daily.day===today?save.daily:null,streak=today?liveStreak(save,today):0;
 const D=today?popupDaily(today):null,r=run.current,A=ARENAS[live?r.arena:pick];
 const tap=()=>{(audio.current??=createPopupAudio()).unlock();audio.current.tap();};
 return <div className={`${styles.game} ${arcadeSkin.popup} ${comicRoot}`} data-game="popup" data-arcade-kind="popup" data-phase={phase}>
  <div className={styles.stage} ref={stage} data-popup-stage>
   <div ref={focusEl} className={styles.play} tabIndex={0} role="application" aria-label="Pop-Up Shot. Targets pop out and hide again. Swipe up at a target to kick a ball at it, or tap it. Do not hit the coach or the referee. Keys: Left and Right pick a target, Space kicks."/>
   <svg className={styles.swipe} aria-hidden="true"><path ref={swipe} d=""/></svg>
   <i ref={reticle} className={styles.reticle} aria-hidden="true"/>
   {live&&<div className={styles.strip} data-popup-hud aria-live="off">
    <b className={styles.place}>{r.daily?'Daily Arena':A.name}</b>
    <span className={`${comicNumeral} ${styles.clock}`} data-low={hud.left<=10||undefined} data-popup-clock={hud.left}>{hud.left}</span>
   </div>}
   {live&&hud.combo>=2&&<span className={styles.combo} key={`c${hud.combo}`} data-popup-combo={hud.combo}><b>x{comboMult(hud.combo).toFixed(2).replace(/0$/,'')}</b><small>{hud.combo} combo</small></span>}
   {live&&<div className={styles.rack} data-popup-rack={hud.rack} data-quick={hud.quick||undefined} aria-label={`${hud.rack} balls ready`}>{Array.from({length:PU.rack},(_,i)=><i key={i} data-off={i>=hud.rack||undefined}/>)}<small>{hud.quick?'Quick rack!':hud.rack===0?'Refilling':'Balls'}</small></div>}
   {live&&(hud.streak>=3||hud.fire)&&<span className={styles.streak} data-fire={hud.fire||undefined} data-popup-streak={hud.streak}>{hud.fire?'On fire':'Streak'} <b>{hud.streak}</b></span>}
   {live&&hud.triple>0&&<span className={styles.power} data-popup-triple={hud.triple}>Triple ball <b>{hud.triple}</b></span>}
   {phase==='playing'&&count&&<span className={styles.count} key={count} data-popup-count>{count}</span>}
   {phase==='playing'&&hint&&<p className={styles.hint} data-popup-hint>{hint}</p>}
   <div className={styles.words} aria-live="polite">{words.map(w=><span key={w.id} className={styles.word} data-teach={w.teach||undefined} style={w.x>=0?{left:w.x,top:w.y}:undefined} onAnimationEnd={()=>setWords(l=>l.filter(x=>x.id!==w.id))}>
    <ComicBurst word={w.text} size={w.teach?(w.text.length>14?18:23):w.text.length>9?15:19} tilt={w.id%2?-4:3} color={w.tone==='red'?'#f0452e':w.tone==='teal'?'#19b5a5':w.tone==='paper'?'#fff3d6':'#ffc83a'} fill={w.tone==='red'||w.tone==='teal'?'#fff3d6':undefined}/>
    {w.pts>0&&<b className={`${comicNumeral} ${styles.pts}`}>+{w.pts}</b>}</span>)}</div>
  </div>
  <ArcadeTopBar game="popup" className={styles.topBar} backTitle="Back to arcade" onBack={leave} value={live?hud.score:undefined} word="pts" bumpKey={hud.score} paused={phase==='paused'} canPause={live} onPause={()=>phase==='playing'?pause():resume()}/>
  {phase==='paused'&&<ArcadePauseCard game="popup" score={`${hud.score} pts · ${A.name} · ${hud.left} s left`} status={entry.message||undefined} onResume={resume} onExit={leave} onRestart={()=>{void start(r.daily,r.arena);}} restartDisabled={busy} keys={[['Swipe','kick at a target'],['Left / Right','pick a target'],['Space','kick'],['P','pause']]}/>}
  {phase==='menu'&&<ComicCard label="Pop-Up Shot" title="Pop-Up Shot" badge="Look up. Strike." badgeTone="red" best={save.best>0?`Best ${save.best}`:undefined} data-popup-card="start">
   <PopArt/>
   <p className={styles.learn}>Targets <b>pop out</b> of windows, bins, boats and the stands, then hide again. <b>Swipe up at one</b> to kick a ball at it: faster goes further. Knock them down one after another for a combo. <b>Never hit the coach or the referee.</b></p>
   <div className={styles.picker} data-popup-arenas>{ARENAS.map((a,i)=><button key={a.id} type="button" aria-pressed={pick===i} className={styles.arenaBtn} onClick={()=>{tap();setPick(i);}} data-popup-arena={a.id}><b>{a.name}</b><small>{save.arenas[a.id]?`Best ${save.arenas[a.id]}`:a.line}</small></button>)}</div>
   {entry.message&&<p className={styles.status} role="status">{entry.message}</p>}
   <div className={styles.actions}>
    <ComicButton variant="primary" wide disabled={busy} onClick={()=>{void start(false);}} data-popup-play autoFocus>Play<small>{ARENAS[pick].name} · {PU.secs} seconds</small></ComicButton>
    <ComicButton variant="teal" wide disabled={busy} onClick={()=>{void start(true);}} data-popup-daily>Daily Arena<small>{D?`${ARENAS[D.arena].name} · ${PU.dailySecs} s${dailyToday?.counted?` · today ${dailyToday.best}`:''}`:'The same for everyone today'}</small></ComicButton>
    <ComicButton size="small" onClick={()=>{tap();setScores(true);}} data-popup-scores>Scores</ComicButton>
    <ComicStat value={streak} label={streak===1?'Daily day':'Daily days'} tone={streak>0?'teal':undefined}/>
   </div>
  </ComicCard>}
  {phase==='over'&&result&&<ComicCard label="Full time" badge={result.daily?'Daily Arena':ARENAS[result.arena].name} badgeTone={result.daily?'teal':'red'} best={result.settled.newBest?undefined:`Best ${result.settled.save.best}`} data-popup-card="results" data-popup-score={result.score}>
   <div className={styles.scoreRow}>
    <strong className={`${comicNumeral} ${styles.score}`} data-new-best={result.settled.newBest||undefined}>{result.score}</strong>
    {result.settled.newBest&&<ComicBurst word="New best!" size={17} tilt={7} className={styles.stamp}/>}
   </div>
   <ComicMedalTrack score={result.score} best={result.settled.previousBest} medals={PU.medals} names={MEDAL_NAMES} data-popup-medal={medalFor(result.score)}/>
   <ComicPanel tone="sun" tilt={-1.2} className={styles.near} data-popup-near>{result.line}</ComicPanel>
   <div className={styles.hsSlot} data-hs-slot/>
   <div className={styles.actions}>
    <ComicButton variant="primary" wide disabled={busy} onClick={()=>{void start(result.daily,result.arena);}} data-popup-again autoFocus>Play again</ComicButton>
    <ComicButton size="small" onClick={()=>{tap();setResult(null);setBoard(null);change('menu');}} data-popup-menu>Arenas</ComicButton>
    <ComicButton size="small" onClick={()=>{tap();setScores(true);}}>Scores</ComicButton>
   </div>
   <div className={styles.chips}>
    <ComicStat value={result.knocks} label="Knocked down"/>
    <ComicStat value={`${result.acc}%`} label="On target"/>
    <ComicStat value={result.bestCombo} label="Best combo"/>
    <ComicStat value={result.bestStreak} label="Best streak"/>
   </div>
   {(result.accBonus>0||result.fairBonus>0)&&<p className={styles.bonus} data-popup-bonus>{result.accBonus>0&&<span>Accuracy +{result.accBonus}</span>}{result.fairBonus>0&&<span>Fair Play +{result.fairBonus}</span>}</p>}
   <ComicPanel tone="paper" flat className={styles.fact} data-popup-tip><b>{result.settled.tip.title}</b>{result.settled.tip.line}</ComicPanel>
   {(result.coins>0||entry.message)&&<p className={styles.status} role="status">{entry.message||`+${result.coins} ${result.coins===1?'coin':'coins'}`}</p>}
  </ComicCard>}
  {board&&phase==='over'&&<HighScoreEntry game="popup" score={board.score} detail="Points for every target knocked down: more for far ones, fast ones (SNAP) and combos, a bonus for accuracy and Fair Play." onClose={()=>setBoard(null)}/>}
  {scores&&<PopUpScores onClose={()=>setScores(false)}/>}
 </div>;
}
