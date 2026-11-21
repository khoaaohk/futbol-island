'use client';
/**
 * FootGolf Island shell (Nov 21 2026, docs/arcade-aaa/footgolf-direction.md): real footgolf round nine holes of the island, in 3D.
 * Pick the kick (Long kick, Chip, Pass, Putt; the game suggests one), then drag back from anywhere like a catapult: the pull is the
 * power, its angle fine-tunes the aim, let go to kick. The turn buttons swing the view; the curl dial bends the ball. 8 kicks a hole,
 * then pick up. Course = the nine holes, its points go on ONE all-time board `footgolf`; a hole can be practised alone; the Daily Hole
 * is one seeded hole a day, saved on the device with a streak.
 * Heat: the loop runs only while something moves (flyover, flight, roll, a drag, a turn) and sleeps on a still aim view, cards, pause
 * and a hidden tab; 30 draws a second on phones. Sound starts on the first tap.
 * Keys: Left / Right aim, Up / Down power, Space kicks, 1-4 pick the kick, Q / E curl, P or Escape pause.
 */
import React,{useCallback,useEffect,useRef,useState} from 'react';
import dynamic from 'next/dynamic';
import {retryImport} from '@/lib/retryImport';
import {ArcadeTopBar} from '../arcade/ArcadeTopBar';
import {ArcadePauseCard} from '../arcade/ArcadePauseCard';
import {arcadeSkin} from './skins';
import {comicRoot,comicNumeral,ComicButton,ComicCard,ComicPanel,ComicStat,ComicBurst} from './comic';
import styles from './FootGolfGame.module.css';
import {createFootGolf,predict,heightAt,surfaceAt,suggestKick,startYaw,scoreName,tipFor,HOLES,KICKS,KICK_ORDER,SURF,COURSE_PAR,FG,S,type FootGolf,type FgEvent,type FgMode,type FgResult,type FgTip,type KickKind,type Shot} from '@/lib/arcade/footgolf/core';
import {createFootgolfView,type FootgolfView} from '@/lib/arcade/footgolf/view';
import {createFootgolfAudio,type FootgolfAudio} from '@/lib/arcade/footgolf/audio';
import {readFootgolfSave,writeFootgolfSave,settleFootgolf,emptyFootgolfSave,liveStreak,type FootgolfSave,type FootgolfSettled} from '@/lib/arcade/footgolf/save';
import {frameCapSlot} from '@/lib/town/frameCap';
import {arcadeFeedback} from '@/lib/arcade/arcadeFeedback';
import {useArcadeEntry} from '@/lib/arcade/useArcadeEntry';
import {creditRun,arcadeCoinTarget} from '@/lib/arcade/arcadeWallet';
import {saveArcadeRecord} from '@/lib/arcade/arcadeRecords';
import {beginBoardSession} from '@/lib/arcade/boardClient';
import {noteLastScore} from '@/lib/arcade/lastScore';
import {localPlayDay} from '@/lib/town/dailyPlay';
const HighScoreEntry=dynamic(()=>retryImport(()=>import('../arcade/HighScoreEntry')),{ssr:false});
const FootGolfScores=dynamic(()=>retryImport(()=>import('./FootGolfScores')),{ssr:false});

type Phase='menu'|'playing'|'paused'|'between'|'over';
type Hud={hole:number;name:string;par:number;kicks:number;dist:number;lie:string;total:number;wind:number;windRel:number;phase:string};
type Word={id:number;text:string;tone:'sun'|'red'|'teal'|'paper';teach:boolean};
type Between={result:FgResult;tip:FgTip;next:string;total:number;card:FgResult[]};
type Result={mode:FgMode;total:number;results:FgResult[];tip:FgTip;settled:FootgolfSettled;coins:number;line:string};
export const FOOTGOLF_COIN_REASON='FootGolf Island: round';
const KICK_TONE:Record<KickKind,string>={long:'sun',chip:'red',pass:'teal',putt:'paper'};

function Boot({kind}:{kind:KickKind}){// a boot badge per kick: where the foot meets the ball
 const dot=kind==='long'?{cx:31,cy:15}:kind==='chip'?{cx:36,cy:24}:{cx:18,cy:20};
 return <svg viewBox="0 0 44 30" width="34" height="23" aria-hidden="true"><path d="M4 6h14l3 9c6 1 15 2 19 6 2 2 1 6-3 6H6c-2 0-3-1-3-3z" fill="#fff3d6" stroke="#231a2e" strokeWidth="2.6" strokeLinejoin="round"/>
  <path d="M6 22h33" stroke="#231a2e" strokeWidth="2"/><circle {...dot} r="5" fill={kind==='putt'?'#19b5a5':'#f0452e'} stroke="#231a2e" strokeWidth="2"/></svg>;}
function GolfArt(){return <svg className={styles.art} viewBox="0 0 260 120" aria-hidden="true">
 <rect x="2" y="2" width="256" height="116" fill="#8fd4ee" stroke="#231a2e" strokeWidth="4"/><path d="M2 70C60 54 120 58 170 66s70 0 86-6v58H2z" fill="#3f9a50" stroke="#231a2e" strokeWidth="4"/>
 <path d="M30 104C60 74 130 70 214 80" fill="none" stroke="#5cc063" strokeWidth="20" strokeLinecap="round"/><ellipse cx="206" cy="80" rx="30" ry="9" fill="#8ee07a" stroke="#231a2e" strokeWidth="3"/>
 <path d="M44 98C70 30 150 18 200 76" fill="none" stroke="#fff3d6" strokeWidth="4" strokeDasharray="2 10" strokeLinecap="round"/>
 <g stroke="#231a2e" strokeWidth="3"><path d="M206 80V38" /><path d="M206 38l22 7-22 7z" fill="#f0452e"/><ellipse cx="206" cy="80" rx="6" ry="2" fill="#231a2e"/><circle cx="44" cy="98" r="9" fill="#fffaf0"/>
 <rect x="138" y="58" width="12" height="16" fill="#fff3d6"/><path d="M134 58h20l-10-12z" fill="#f0452e"/></g></svg>;}
function WindSock({speed,rel}:{speed:number;rel:number}){return <span className={styles.wind} data-footgolf-wind={speed.toFixed(1)} aria-label={`Wind ${speed.toFixed(0)} metres a second`}>
 <svg viewBox="-20 -20 40 40" width="34" height="34" aria-hidden="true" style={{rotate:`${rel}rad`}}><circle r="17" fill="#fff3d6" stroke="#231a2e" strokeWidth="3"/><path d="M0 12V-8M-7 -2L0-12 7-2" fill="none" stroke={speed>3.5?'#f0452e':'#19b5a5'} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
 <b>{speed<.5?'Calm':`${speed.toFixed(0)} m/s`}</b></span>;}

export default function FootGolfGame({onExit}:{onExit:()=>void}){
 const [phase,setPhase]=useState<Phase>('menu'),phaseRef=useRef<Phase>('menu');
 const blank:Hud={hole:0,name:'',par:3,kicks:0,dist:0,lie:'Tee',total:0,wind:0,windRel:0,phase:'aim'};
 const [hud,setHud]=useState<Hud>(blank),hudRef=useRef(hud);
 const [save,setSave]=useState<FootgolfSave>(emptyFootgolfSave),[result,setResult]=useState<Result|null>(null),[between,setBetween]=useState<Between|null>(null),[today,setToday]=useState('');
 const [board,setBoard]=useState<{score:number}|null>(null),[scores,setScores]=useState(false),[words,setWords]=useState<Word[]>([]),[pick,setPick]=useState(false);
 const [kind,setKind]=useState<KickKind>('long'),kindRef=useRef<KickKind>('long'),[curl,setCurl]=useState(0),curlRef=useRef(0),[power,setPower]=useState(-1),[hint,setHint]=useState(''),[foot,setFoot]=useState<{id:number;text:string;sub:string;tone:string}|null>(null),[flying,setFlying]=useState(false);
 const entry=useArcadeEntry('footgolf');
 const stage=useRef<HTMLDivElement>(null),focusEl=useRef<HTMLDivElement>(null);
 const game=useRef<FootGolf|null>(null),view=useRef<FootgolfView|null>(null),audio=useRef<FootgolfAudio|null>(null);
 const raf=useRef(0),last=useRef(0),slot=useRef(0),frameMs=useRef(1000/30),endAt=useRef(0),wordId=useRef(0),acc=useRef({t:0}),stillAt=useRef(0),run=useRef({id:'',mode:'course' as FgMode,day:'',done:true,hole:0}),kicks=useRef(0);
 const aim=useRef({yaw:0,base:0}),drag=useRef<{id:number;x:number;y:number;px:number;py:number}|null>(null),turn=useRef(0),keys=useRef({left:false,right:false,up:false,down:false}),kPower=useRef(-1),ghostBuf=useRef(new Float32Array(90*3)),dirty=useRef(true);
 const reduced=useRef(false),frameRef=useRef<(t:number)=>void>(()=>{});
 const change=useCallback((p:Phase)=>{phaseRef.current=p;setPhase(p);},[]);
 useEffect(()=>{setSave(readFootgolfSave());setToday(localPlayDay(Date.now()));},[]);
 useEffect(()=>{if(!hint)return;const t=setTimeout(()=>setHint(''),5500);return()=>clearTimeout(t);},[hint]);
 useEffect(()=>{if(!foot)return;const t=setTimeout(()=>setFoot(null),1800);return()=>clearTimeout(t);},[foot]);
 const kick=useCallback(()=>{stillAt.current=0;if(!raf.current&&phaseRef.current==='playing'){last.current=0;slot.current=0;raf.current=requestAnimationFrame(t=>frameRef.current(t));}},[]);
 const say=useCallback((text:string,tone:Word['tone'],teach=false)=>{if(!text)return;const w:Word={id:++wordId.current,text,tone,teach};setWords(l=>[...l.filter(x=>!(teach&&x.teach)).slice(-2),w]);},[]);
 const pickKind=useCallback((k:KickKind)=>{kindRef.current=k;setKind(k);view.current?.setAim(aim.current.yaw,k);dirty.current=true;},[]);
 const syncHud=useCallback(()=>{const g=game.current,v=view.current;if(!g)return;const s=g.state,H=s.hole,ws=Math.hypot(H.wind[0],H.wind[1]),wa=Math.atan2(H.wind[0],-H.wind[1]);
  const n:Hud={hole:s.ix+1,name:H.def.name,par:H.def.par,kicks:s.kicks,dist:Math.round(g.cupDist()),lie:SURF[s.lie].name,total:s.total,wind:Math.round(ws*10)/10,windRel:Math.round((wa-aim.current.yaw)*20)/20,phase:s.phase},h=hudRef.current;
  if(n.hole!==h.hole||n.kicks!==h.kicks||n.dist!==h.dist||n.lie!==h.lie||n.total!==h.total||n.windRel!==h.windRel||n.phase!==h.phase||n.name!==h.name){hudRef.current=n;setHud(n);}
  const f=!!v?.flying;setFlying(p=>p===f?p:f);},[]);
 /** A fresh aim at a new lie: point the view, suggest the kick. */
 const newAim=useCallback(()=>{const g=game.current;if(!g)return;const y=startYaw(g.state);aim.current={yaw:y,base:y};const k=suggestKick(g.state);pickKind(k);setCurl(0);curlRef.current=0;kPower.current=-1;setPower(-1);dirty.current=true;},[pickKind]);
 const shotNow=useCallback((p:number):Shot=>({kind:kindRef.current,power:p,yaw:aim.current.yaw,curl:curlRef.current}),[]);
 /** the dotted preview: the real physics, full on holes 1-3, 60% on 4-6, 35% on 7-9 (and the Daily Hole) */
 const preview=useCallback((p:number)=>{const g=game.current,v=view.current;if(!g||!v)return;v.setCharge(p<0||g.state.phase!=='aim'?0:p);if(p<0||g.state.phase!=='aim'){v.setPreview(ghostBuf.current,0,false);return;}
  const frac=g.state.mode==='daily'?.35:g.state.hole.def.preview,n=predict(g.state,shotNow(p),ghostBuf.current,frac);v.setPreview(ghostBuf.current,n,frac>=1);},[shotNow]);

 /* ---- the round's end: save, coins, board (once per round) ---- */
 const finish=useCallback(()=>{
  const g=game.current,r=run.current;if(!g||r.done)return;r.done=true;const s=g.state,total=s.total,results=s.results.map(x=>({...x})),lastR=results[results.length-1];
  const complete=r.mode!=='course'||results.length===HOLES.length;
  const settled=settleFootgolf(readFootgolfSave(),{mode:r.mode,day:r.day,total,results,complete});writeFootgolfSave(settled.save);setSave(settled.save);
  if(r.mode==='course'&&complete)saveArcadeRecord('footgolf',total);else if(r.mode==='daily')noteLastScore('footgolf_daily',total,settled.dailyBest);
  const coins=arcadeCoinTarget('footgolf',{points:total});if(coins>0)void creditRun(r.id,'footgolf',coins,FOOTGOLF_COIN_REASON);
  const kicksAll=results.reduce((a,x)=>a+x.kicks,0),parAll=results.reduce((a,x)=>a+x.par,0),toPar=kicksAll-parAll;
  const line=settled.newBest&&settled.previousBest>0?`New best by ${total-settled.previousBest} points.`:r.mode==='course'?(toPar<0?`${-toPar} under par round the island. Brilliant.`:toPar===0?'Level par round the island. Now beat it.':`${toPar} over par. Read the ground and weight the last pass.`)
   :lastR.holed?`${scoreName(lastR.kicks,lastR.par)} in ${lastR.kicks}. Can you do it in fewer?`:'Picked up. Try the safe target next time.';
  setResult({mode:r.mode,total,results,tip:tipFor(lastR),settled,coins,line});
  if(r.mode==='course'&&complete&&total>0)setBoard({score:total});
  if(settled.newBest)arcadeFeedback(null,'goal');
  setWords([]);setHint('');setBetween(null);change('over');
 },[change]);

 /* ---- one rules event: sound, haptics, words ---- */
 const onEvent=useCallback((e:FgEvent)=>{
  const a=audio.current,v=view.current,g=game.current;if(!g)return;v?.onEvent(e);
  switch(e.type){
   case 'kick':{const k=KICK_ORDER[e.k];a?.kick(Math.min(1,e.a/KICKS[k].max),e.k);arcadeFeedback(null,e.a>18?'shot':'collect');kicks.current++;
    setFoot({id:kicks.current,text:KICKS[k].foot,sub:KICKS[k].name+(curlRef.current&&k!=='putt'?curlRef.current>0?', curling right':', curling left':''),tone:KICK_TONE[k]});setHint('');break;}
   case 'land':case 'bounce':a?.thud(e.a,e.k);break;
   case 'plug':a?.thud(e.a,S.sand);say(e.word,'paper',true);break;
   case 'splash':a?.splash();arcadeFeedback(null,'slam');say(e.word,'teal',true);break;
   case 'oob':a?.thud(3,0);arcadeFeedback(null,'slam');say(e.word,'paper',true);break;
   case 'leaves':a?.leaves();say(e.word,'paper');break;
   case 'wall':if(e.a>1.5)a?.wall(e.k);break;
   case 'check':say(e.word,'teal');break;
   case 'rim':a?.rim();break;
   case 'lip':a?.lip();arcadeFeedback(null,'collect');say(e.word,'red',true);break;
   case 'hop':a?.lip();say(e.word,'red',true);break;
   case 'cup':a?.cup();arcadeFeedback(null,'goal');if(e.k===1)say(e.word,'sun');break;// a rolled-in ball: the hole's own word (Par, Birdie, Ace) follows
   case 'hole':case 'pickup':{const par=g.state.hole.def.par;a?.result(e.type==='pickup'?1:e.a-par);endAt.current=performance.now()+(reduced.current?700:1900);say(e.word.toUpperCase(),e.type==='pickup'?'paper':e.a<par?'red':'sun',true);break;}
   case 'stop':break;
   case 'tee':a?.tee(Math.hypot(g.state.hole.wind[0],g.state.hole.wind[1])/5);break;
  }
 },[say]);

 /* ---- a kick ---- */
 const shoot=useCallback((p:number)=>{const g=game.current;if(!g||p<.04)return;if(!g.kick(shotNow(Math.min(1,p))))return;view.current?.setPreview(ghostBuf.current,0,false);setPower(-1);kPower.current=-1;kick();},[shotNow,kick]);

 /* ---- the loop ---- */
 useEffect(()=>{frameRef.current=(now:number)=>{
  raf.current=0;const g=game.current,v=view.current;if(phaseRef.current!=='playing'||!g||!v)return;
  const next=frameCapSlot(now,slot.current,frameMs.current);if(next<0){raf.current=requestAnimationFrame(t=>frameRef.current(t));return;}slot.current=next;
  const dt=last.current?Math.min(.1,(now-last.current)/1000):1/30;last.current=now;const s=g.state,before=s.phase;
  if(!v.flying){g.advance(dt,acc.current);g.drain(onEvent);}
  if(s.phase==='aim'&&before!=='aim')newAim();
  // turning (buttons or keys) and keyboard power
  const k=keys.current,t=turn.current+(k.right?1:0)-(k.left?1:0);if(s.phase==='aim'&&t){aim.current.yaw+=t*dt*(kindRef.current==='putt'?.45:.8);v.setAim(aim.current.yaw,kindRef.current);dirty.current=true;}
  if(s.phase==='aim'&&(k.up||k.down)){kPower.current=Math.max(0,Math.min(1,(kPower.current<0?.5:kPower.current)+((k.up?1:0)-(k.down?1:0))*dt*.6));setPower(kPower.current);dirty.current=true;}
  if(dirty.current&&s.phase==='aim'&&!v.flying){dirty.current=false;const d=drag.current;preview(d?Math.max(0,pullPower(d)):kPower.current);}
  v.render(g,now/1000);syncHud();
  if(s.phase==='done'&&endAt.current&&now>=endAt.current){endAt.current=0;
   if(s.over){finish();return;}
   const r=s.results[s.results.length-1];setBetween({result:{...r},tip:tipFor(r),next:HOLES[s.order[s.ix+1]].name,total:s.total,card:s.results.map(x=>({...x}))});setWords([]);setFoot(null);change('between');return;}
  // sleep on a still aim view (nothing moves until a touch or a key)
  const still=s.phase==='aim'&&!v.flying&&!drag.current&&!t&&!k.up&&!k.down;if(still){if(!stillAt.current)stillAt.current=now;else if(now-stillAt.current>1400)return;}else stillAt.current=0;
  raf.current=requestAnimationFrame(t2=>frameRef.current(t2));
 };},[finish,onEvent,syncHud,change,newAim,preview]);
 const pullPower=(d:{x:number;y:number;px:number;py:number})=>{const el=stage.current,m=el?Math.min(el.clientWidth,el.clientHeight):400,len=Math.hypot(d.x-d.px,d.y-d.py);return Math.min(1,len/(m*.38));};

 /* ---- start / next hole ---- */
 const begin=useCallback((g:FootGolf)=>{game.current=g;view.current?.setHole(g);g.drain(onEvent);acc.current={t:0};newAim();setHint(g.state.hole.def.lesson);syncHud();change('playing');kick();focusEl.current?.focus({preventScroll:true});},[change,kick,newAim,onEvent,syncHud]);
 const start=useCallback(async(mode:FgMode,hole=0)=>{
  (audio.current??=createFootgolfAudio()).unlock();
  const id=await entry.enter();if(!id)return;
  const day=localPlayDay(Date.now()),seed=1+Math.floor(Math.random()*2_000_000_000);
  run.current={id,mode,day,done:false,hole};kicks.current=0;endAt.current=0;
  if(mode==='course')beginBoardSession('footgolf');
  audio.current?.hush(false);setResult(null);setBetween(null);setBoard(null);setWords([]);setToday(day);setFoot(null);setPick(false);
  begin(createFootGolf({mode,seed,hole,day}));
 },[entry,begin]);
 const nextHole=useCallback(()=>{const g=game.current;if(!g||phaseRef.current!=='between')return;audio.current?.unlock();if(!g.next()){finish();return;}setBetween(null);begin(g);},[begin,finish]);
 const pause=useCallback(()=>{if(phaseRef.current!=='playing')return;if(raf.current)cancelAnimationFrame(raf.current);raf.current=0;drag.current=null;turn.current=0;setPower(-1);audio.current?.hush(true);change('paused');},[change]);
 const resume=useCallback(()=>{if(phaseRef.current!=='paused')return;audio.current?.unlock();audio.current?.hush(false);change('playing');kick();},[change,kick]);
 const leave=useCallback(()=>{if(raf.current)cancelAnimationFrame(raf.current);raf.current=0;onExit();},[onExit]);

 /* ---- the 3D view, size, the drag ---- */
 useEffect(()=>{
  const el=stage.current;if(!el)return;
  reduced.current=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile=matchMedia('(pointer: coarse)').matches;frameMs.current=1000/(mobile?30:60);
  let v:FootgolfView;try{v=view.current=createFootgolfView(el,{reduced:reduced.current,mobile});}catch{return;}
  const fit=()=>{const r=el.getBoundingClientRect();v.resize(Math.max(1,r.width),Math.max(1,r.height),window.devicePixelRatio||1);const g=game.current;if(g&&phaseRef.current!=='playing')v.render(g,performance.now()/1000);else kick();};
  // the menu shows hole 1 from high up once (a few draws), then sleeps
  {const idle=createFootGolf({mode:'hole',seed:3,hole:0});v.setHole(idle);fit();for(let i=0;i<3;i++)v.render(idle,i*.5);}
  const ro=new ResizeObserver(fit);ro.observe(el);window.visualViewport?.addEventListener('resize',fit);
  const local=(e:PointerEvent)=>{const r=el.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};};
  const down=(e:PointerEvent)=>{if(phaseRef.current!=='playing'||(e.pointerType==='mouse'&&e.button!==0)||(e.target instanceof Element&&e.target.closest('button')))return;
   const g=game.current;if(!g)return;e.preventDefault();audio.current?.unlock();if(v.flying){v.skipFlyover();kick();return;}if(g.state.phase==='done'){endAt.current=1;kick();return;}if(g.state.phase!=='aim')return;
   try{el.setPointerCapture(e.pointerId);}catch{/* fine without */}const p=local(e);drag.current={id:e.pointerId,x:p.x,y:p.y,px:p.x,py:p.y};kPower.current=-1;kick();};
  const move=(e:PointerEvent)=>{const d=drag.current;if(!d||e.pointerId!==d.id)return;e.preventDefault();const p=local(e);d.px=p.x;d.py=p.y;
   // the pull's angle fine-tunes the aim (a catapult: pull back-left to send it right)
   const ang=Math.atan2(d.x-d.px,d.py-d.y),pw=pullPower(d);if(pw>.05)aim.current.yaw=aim.current.base+Math.max(-.6,Math.min(.6,ang))*(kindRef.current==='putt'?.25:.45);
   setPower(pw);dirty.current=true;kick();};
  const up=(e:PointerEvent)=>{const d=drag.current;if(!d||e.pointerId!==d.id)return;drag.current=null;try{el.releasePointerCapture(e.pointerId);}catch{/* gone */}
   const pw=pullPower(d);setPower(-1);if(e.type==='pointercancel'||phaseRef.current!=='playing'||pw<.06){aim.current.yaw=aim.current.base;view.current?.setPreview(ghostBuf.current,0,false);dirty.current=true;kick();return;}aim.current.base=aim.current.yaw;shoot(pw);};
  const opt={passive:false} as const;
  el.addEventListener('pointerdown',down,opt);el.addEventListener('pointermove',move,opt);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
  const noScroll=(e:TouchEvent)=>{if(phaseRef.current==='playing'&&e.cancelable)e.preventDefault();};el.addEventListener('touchmove',noScroll,opt);
  const noMenu=(e:Event)=>e.preventDefault();el.addEventListener('contextmenu',noMenu);
  if(process.env.NODE_ENV!=='production')(window as unknown as {__footgolf?:unknown}).__footgolf={get game(){return game.current;},get phase(){return phaseRef.current;},get loop(){return raf.current!==0;},get view(){return view.current;},get aim(){return aim.current;},shoot,setKind:pickKind,wake:kick,placeBall:(x:number,z:number)=>{const g=game.current;if(!g||g.state.phase!=='aim')return;const b=g.state.ball;b.x=x;b.z=z;b.y=heightAt(g.state.hole,x,z)+FG.R;g.state.lie=surfaceAt(g.state.hole,x,z);newAim();view.current?.setAim(aim.current.yaw,kindRef.current);kick();},loadHole:(i:number)=>{run.current={...run.current,mode:'hole',done:false,hole:i};begin(createFootGolf({mode:'hole',seed:9,hole:i}));}};
  return()=>{ro.disconnect();window.visualViewport?.removeEventListener('resize',fit);el.removeEventListener('pointerdown',down);el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up);el.removeEventListener('touchmove',noScroll);el.removeEventListener('contextmenu',noMenu);
   if(raf.current)cancelAnimationFrame(raf.current);raf.current=0;v.dispose();view.current=null;game.current=null;audio.current?.dispose();audio.current=null;delete (window as unknown as {__footgolf?:unknown}).__footgolf;};
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[shoot]);

 /* ---- keys; looked away: pause ---- */
 useEffect(()=>{
  const away=()=>pause(),hidden=()=>{if(document.hidden)pause();};
  const isUi=(e:KeyboardEvent)=>e.target instanceof HTMLElement&&!!e.target.closest('button,input,select,textarea,a,dialog');
  const map:Record<string,'left'|'right'|'up'|'down'>={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down'};
  const key=(e:KeyboardEvent)=>{if(isUi(e)&&e.code!=='Space')return;
   if(e.code==='Escape'||e.code==='KeyP'){e.preventDefault();if(phaseRef.current==='playing')pause();else if(phaseRef.current==='paused')resume();return;}
   const g=game.current,v=view.current;if(phaseRef.current!=='playing'||!g||!v)return;audio.current?.unlock();
   if(v.flying&&(e.code==='Space'||e.code==='Enter')){e.preventDefault();v.skipFlyover();kick();return;}
   if(g.state.phase==='done'){if(e.code==='Enter'||e.code==='Space'){e.preventDefault();endAt.current=1;kick();}return;}
   const m=map[e.code];if(m){e.preventDefault();keys.current[m]=true;kick();return;}
   const n=['Digit1','Digit2','Digit3','Digit4'].indexOf(e.code);if(n>=0){pickKind(KICK_ORDER[n]);kick();return;}
   if(e.code==='KeyQ'||e.code==='KeyE'){const c=Math.max(-2,Math.min(2,curlRef.current+(e.code==='KeyE'?1:-1)));curlRef.current=c;setCurl(c);dirty.current=true;kick();return;}
   if((e.code==='Space'||e.code==='Enter')&&!e.repeat&&g.state.phase==='aim'){e.preventDefault();if(kPower.current<0){kPower.current=.5;setPower(.5);dirty.current=true;kick();}else{aim.current.base=aim.current.yaw;shoot(kPower.current);}}};
  const keyUp=(e:KeyboardEvent)=>{const m=map[e.code];if(m){keys.current[m]=false;if(m==='left'||m==='right')aim.current.base=aim.current.yaw;}};
  window.addEventListener('blur',away);document.addEventListener('visibilitychange',hidden);window.addEventListener('keydown',key);window.addEventListener('keyup',keyUp);
  return()=>{window.removeEventListener('blur',away);document.removeEventListener('visibilitychange',hidden);window.removeEventListener('keydown',key);window.removeEventListener('keyup',keyUp);};
 },[pause,resume,shoot,pickKind,kick]);

 const busy=entry.pending,live=phase==='playing'||phase==='paused',dailyToday=save.daily.day===today?save.daily:null,streak=today?liveStreak(save,today):0;
 const tap=()=>{(audio.current??=createFootgolfAudio()).unlock();audio.current.tap();};
 const holding=(d:number)=>({onPointerDown:(e:React.PointerEvent)=>{e.preventDefault();turn.current=d;kick();},onPointerUp:()=>{turn.current=0;aim.current.base=aim.current.yaw;},onPointerLeave:()=>{if(turn.current===d){turn.current=0;aim.current.base=aim.current.yaw;}},onPointerCancel:()=>{turn.current=0;}});
 const aiming=phase==='playing'&&hud.phase==='aim'&&!flying,card=(list:readonly FgResult[],cur=-1)=><div className={styles.card} data-footgolf-card-strip>{HOLES.map((h,i)=>{const r=list.find(x=>x.ix===i);return <span key={h.id} data-cur={i===cur||undefined} data-played={!!r||undefined} data-to={r?Math.sign(r.kicks-r.par):undefined}><small>{i+1}</small><b>{r?(r.holed?r.kicks:'X'):'·'}</b><i>{h.par}</i></span>;})}</div>;
 return <div className={`${styles.game} ${arcadeSkin.footgolf} ${comicRoot}`} data-game="footgolf" data-arcade-kind="footgolf" data-phase={phase}>
  <div className={styles.stage} ref={stage} data-footgolf-stage>
   <div ref={focusEl} className={styles.play} tabIndex={0} role="application" aria-label="FootGolf Island. Drag back from anywhere and let go to kick: the longer the pull, the harder the kick. Keys: left and right aim, up and down power, Space kicks, 1 to 4 pick the kick, Q and E curl."/>
   {live&&<div className={styles.strip} data-footgolf-hud aria-live="polite" aria-label={`Hole ${hud.hole}, ${hud.name}, par ${hud.par}. ${hud.kicks} kicks. ${hud.dist} metres to the cup.`}>
    <b className={styles.place}><span className={comicNumeral}>{run.current.mode==='course'?hud.hole:'★'}</span>{hud.name}</b>
    <span className={styles.track}>Par {hud.par}<em>·</em>{hud.dist} m<em>·</em>Kick {Math.min(FG.maxKicks,hud.kicks+(hud.phase==='aim'?1:0))}/{FG.maxKicks}</span>
   </div>}
   {live&&<div className={styles.side} aria-hidden="true"><WindSock speed={hud.wind} rel={hud.windRel}/><span className={styles.lie} data-lie={hud.lie}>{hud.lie}</span></div>}
   {phase==='playing'&&flying&&<p className={styles.hint} data-footgolf-flyover>Tap to skip the flyover</p>}
   {aiming&&hint&&power<0&&<p className={styles.hint} data-footgolf-hint>{hint}</p>}
   {aiming&&power>=0&&<div className={styles.meter} data-footgolf-power={Math.round(power*100)} aria-hidden="true"><i style={{scale:`${Math.max(.02,power)} 1`}}/><b>{Math.round(power*100)}%</b></div>}
   {phase==='playing'&&foot&&<span className={styles.foot} key={foot.id} data-tone={foot.tone} data-footgolf-foot>{foot.text}<small>{foot.sub}</small></span>}
   {aiming&&<div className={styles.controls} data-footgolf-controls>
    <div className={styles.kicks} role="radiogroup" aria-label="Kick">{KICK_ORDER.map((k,i)=><button key={k} type="button" role="radio" aria-checked={kind===k} className={styles.kick} data-on={kind===k||undefined} data-footgolf-kick={k} onClick={()=>{tap();pickKind(k);kick();}} title={`${KICKS[k].name} (${i+1}): ${KICKS[k].line}`}><Boot kind={k}/><b>{KICKS[k].name}</b></button>)}</div>
    <div className={styles.row}>
     <button type="button" className={styles.turn} aria-label="Turn left" {...holding(-1)}><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M15 4L7 12l8 8" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
     {kind!=='putt'?<div className={styles.dial} role="group" aria-label="Curl">
      <button type="button" aria-label="Curl left" onClick={()=>{const c=Math.max(-2,curl-1);curlRef.current=c;setCurl(c);dirty.current=true;kick();}}>−</button>
      <span data-footgolf-curl={curl}>{[-2,-1,0,1,2].map(c=><i key={c} data-on={c===curl||undefined}/>)}<small>{curl===0?'No curl':curl<0?'Curl left':'Curl right'}</small></span>
      <button type="button" aria-label="Curl right" onClick={()=>{const c=Math.min(2,curl+1);curlRef.current=c;setCurl(c);dirty.current=true;kick();}}>+</button>
     </div>:<p className={styles.read}>Read the arrows: the ball rolls downhill</p>}
     <button type="button" className={styles.turn} aria-label="Turn right" {...holding(1)}><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M9 4l8 8-8 8" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
    </div>
    <p className={styles.pull}>Drag back anywhere, let go to kick</p>
   </div>}
   <div className={styles.words} aria-live="polite">{words.map(w=><span key={w.id} className={styles.word} data-teach={w.teach||undefined} onAnimationEnd={()=>setWords(l=>l.filter(x=>x.id!==w.id))}>
    <ComicBurst word={w.text} size={w.teach?(w.text.length>12?20:26):18} tilt={w.id%2?-4:3} color={w.tone==='red'?'#f0452e':w.tone==='teal'?'#19b5a5':w.tone==='paper'?'#fff3d6':'#ffc83a'} fill={w.tone==='red'||w.tone==='teal'?'#fff3d6':undefined}/></span>)}</div>
  </div>
  <ArcadeTopBar game="footgolf" className={styles.topBar} backTitle="Back to arcade" onBack={leave} value={live||phase==='between'?hud.total:undefined} word="pts" bumpKey={hud.total} paused={phase==='paused'} canPause={live} onPause={()=>phase==='playing'?pause():resume()}/>
  {phase==='paused'&&<ArcadePauseCard game="footgolf" score={`Hole ${hud.hole} · ${hud.name} · ${hud.kicks} ${hud.kicks===1?'kick':'kicks'}`} status={entry.message||undefined} onResume={resume} onExit={leave} onRestart={()=>{void start(run.current.mode,run.current.hole);}} restartDisabled={busy} keys={[['Left / Right','aim'],['Up / Down','power'],['Space','kick'],['1-4','pick the kick'],['Q / E','curl'],['P','pause']]}/>}
  {phase==='menu'&&<ComicCard label="FootGolf Island" title="FootGolf Island" badge="Nine holes" badgeTone="teal" best={save.best>0?`Best ${save.best}`:undefined} data-footgolf-card="start">
   <GolfArt/>
   <p className={styles.learn}>Kick a football round the island into a big cup in as <b>few kicks</b> as you can. Drag back to kick. Use your <b>laces</b> to go far, a <b>chip</b> to go over, the <b>inside of the foot</b> to roll it in.</p>
   {pick?<div className={styles.picker} data-footgolf-picker>{HOLES.map((h,i)=><button key={h.id} type="button" className={styles.holeBtn} disabled={busy} data-footgolf-hole-pick={h.id} onClick={()=>{void start('hole',i);}}><b>{i+1}. {h.name}</b><small>Par {h.par}{save.holes[i]?` · best ${save.holes[i]}`:''}</small></button>)}
    <ComicButton size="small" onClick={()=>{tap();setPick(false);}}>Back</ComicButton></div>
   :<>
    <div className={styles.chips}>
     <ComicStat value={save.best||'–'} label="Round best"/>
     <ComicStat value={save.bestKicks?`${save.bestKicks}`:'–'} label={`Kicks (par ${COURSE_PAR})`} tone={save.bestKicks?'sun':undefined}/>
     <ComicStat value={streak} label={streak===1?'Day in a row':'Days in a row'} tone={streak>0?'teal':undefined}/>
    </div>
    {entry.message&&<p className={styles.status} role="status">{entry.message}</p>}
    <div className={styles.actions}>
     <ComicButton variant="primary" wide disabled={busy} onClick={()=>{void start('course',0);}} data-footgolf-play autoFocus>Play the course<small>Nine holes round the island</small></ComicButton>
     <ComicButton variant="teal" wide disabled={busy} onClick={()=>{void start('daily');}} data-footgolf-daily>Daily Hole<small>{dailyToday?`Today: ${dailyToday.kicks} ${dailyToday.kicks===1?'kick':'kicks'}`:'One hole, the same for everyone today'}</small></ComicButton>
     <ComicButton size="small" onClick={()=>{tap();setPick(true);}} data-footgolf-practice>Practise a hole</ComicButton>
     <ComicButton size="small" onClick={()=>{tap();setScores(true);}} data-footgolf-scores>Scores</ComicButton>
    </div></>}
  </ComicCard>}
  {phase==='between'&&between&&<ComicCard label="Hole done" badge={`Hole ${between.result.ix+1}`} badgeTone={between.result.kicks<between.result.par?'red':'teal'} best={`${between.total} pts`} data-footgolf-card="between">
   <div className={styles.scoreRow}><ComicBurst word={scoreName(between.result.kicks,between.result.par)} size={30} tilt={-3}/></div>
   <strong className={`${comicNumeral} ${styles.scoreSmall}`}>{between.result.holed?between.result.kicks:'X'}<small> / par {between.result.par}</small></strong>
   <p className={styles.status}>+{between.result.points} points{between.result.air?' · flew it in +300':''}{between.result.longPutt?' · long one +100':''}</p>
   {card(between.card,between.result.ix)}
   <ComicPanel tone="paper" flat className={styles.fact} data-footgolf-tip><b>{between.tip.title}</b>{between.tip.line}</ComicPanel>
   <div className={styles.actions}><ComicButton variant="primary" wide onClick={nextHole} data-footgolf-next autoFocus>Next: {between.next}</ComicButton></div>
  </ComicCard>}
  {phase==='over'&&result&&<ComicCard label="Round over" badge={result.mode==='daily'?'Daily Hole':result.mode==='course'?'The course':HOLES[result.results[0]?.ix??0].name} badgeTone={result.mode==='daily'?'teal':'red'} best={result.mode==='daily'?`Today ${result.settled.dailyBest}`:result.mode==='course'?`Best ${result.settled.save.best}`:undefined} data-footgolf-card="results" data-footgolf-score={result.total}>
   <div className={styles.scoreRow}>
    <strong className={`${comicNumeral} ${styles.score}`} data-new-best={result.settled.newBest||undefined}>{result.total}</strong>
    {result.settled.newBest&&<ComicBurst word="New best!" size={17} tilt={7} className={styles.stamp}/>}
   </div>
   {result.mode==='course'?card(result.results):<div className={styles.scoreRow}><ComicBurst word={scoreName(result.results[0].kicks,result.results[0].par)} size={24}/></div>}
   <ComicPanel tone="sun" tilt={-1.2} className={styles.near} data-footgolf-near>{result.line}</ComicPanel>
   <div className={styles.hsSlot} data-hs-slot/>
   <div className={styles.actions}>
    <ComicButton variant="primary" wide disabled={busy} onClick={()=>{void start(result.mode,run.current.hole);}} data-footgolf-again autoFocus>Play again</ComicButton>
    <ComicButton size="small" disabled={busy} onClick={()=>{void start(result.mode==='daily'?'course':'daily');}} data-footgolf-other>{result.mode==='daily'?'The course':'Daily Hole'}</ComicButton>
    <ComicButton size="small" onClick={()=>{tap();setScores(true);}}>Scores</ComicButton>
   </div>
   <ComicPanel tone="paper" flat className={styles.fact} data-footgolf-tip><b>{result.tip.title}</b>{result.tip.line}</ComicPanel>
   {(result.coins>0||entry.message)&&<p className={styles.status} role="status">{entry.message||`+${result.coins} ${result.coins===1?'coin':'coins'}`}</p>}
  </ComicCard>}
  {board&&phase==='over'&&<HighScoreEntry game="footgolf" score={board.score} detail="Points for every hole of the nine: 500 at par, 200 more for every kick under it, extra for flying it in or holing a long one." onClose={()=>setBoard(null)}/>}
  {scores&&<FootGolfScores onClose={()=>setScores(false)}/>}
 </div>;
}
