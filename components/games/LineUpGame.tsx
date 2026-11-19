'use client';
/**
 * Line Up! (Nov 17 2026, docs/arcade-aaa/lineup-direction.md): the block-fit cabinet. Rules: lib/arcade/lineup/core.ts (pure, seeded).
 * Drawing: view.ts (2D canvas, static scene + an on-demand moving layer). Sound: audio.ts. This shell owns the drag, the keys and the cards.
 * Heat: no loop at rest. A frame is asked for only while a finger drags or an effect is still moving (view.render says so); the
 * start card, pause, results and a hidden tab draw nothing. DPR cap 2.
 * Teaches (AGENTS.md): "Fill the line. Keep your shape." A full row or column is a complete line of the team.
 * AAA pass (Nov 18 2026): the bench (drag a shape onto it, key B; 4 picks it), team lines, a magnetic snap with a tick, a cue when a
 * line is ready, a tap that never drops a piece, points that fly to the counter, the venue changing with the level, one idle nudge.
 */
import {useCallback,useEffect,useRef,useState} from 'react';
import dynamic from 'next/dynamic';
import {retryImport} from '@/lib/retryImport';
import {ArcadeTopBar} from '../arcade/ArcadeTopBar';
import {ArcadePauseCard} from '../arcade/ArcadePauseCard';
import {arcadeSkin} from './skins';
import {comicRoot,comicNumeral,ComicButton,ComicCard,ComicPanel,ComicStat,ComicBurst,ComicMedalTrack} from './comic';
import styles from './LineUpGame.module.css';
import {createLineUp,lineupDailySeed,medalFor,LU,SHAPES,KIT,MEDAL_NAMES,type LineUp,type LineEvent} from '@/lib/arcade/lineup/core';
import {createLineupView,VENUES,venueFor,type LineupView,type LineupDrag} from '@/lib/arcade/lineup/view';
import {createLineupAudio,type LineupAudio} from '@/lib/arcade/lineup/audio';
import {readLineupSave,writeLineupSave,settleLineup,nearMissLine,coachLine,liveStreak,emptyLineupSave,type LineupSave,type LineupSettled} from '@/lib/arcade/lineup/save';
import {arcadeFeedback} from '@/lib/arcade/arcadeFeedback';
import {useArcadeEntry} from '@/lib/arcade/useArcadeEntry';
import {creditRun,arcadeCoinTarget} from '@/lib/arcade/arcadeWallet';
import {saveArcadeRecord} from '@/lib/arcade/arcadeRecords';
import {beginBoardSession} from '@/lib/arcade/boardClient';
import {noteLastScore} from '@/lib/arcade/lastScore';
import {localPlayDay} from '@/lib/town/dailyPlay';
const HighScoreEntry=dynamic(()=>retryImport(()=>import('../arcade/HighScoreEntry')),{ssr:false});
const LineUpScores=dynamic(()=>retryImport(()=>import('./LineUpScores')),{ssr:false});

type Phase='menu'|'playing'|'paused'|'over';
type Hud={score:number;level:number;streak:number;lines:number;tight:number;risk:boolean;rescue:boolean};
const HUD0:Hud={score:0,level:1,streak:0,lines:0,tight:0,risk:false,rescue:false};
type Result={score:number;daily:boolean;level:number;lines:number;combo:number;streak:number;clean:number;team:number;settled:LineupSettled;near:string;coach:string;coins:number};
type Word={id:number;text:string;pts:number;x:number;y:number;tone:'sun'|'red'|'teal'|'paper';sub?:string};
export const LINEUP_COIN_REASON='Line Up!: lines cleared';
const COMBO_WORD=['','LINE UP!','DOUBLE!','TRIPLE!','FOUR LINES!','WHAT A TEAM!'];
/** Level-up callouts (Nov 17 2026): one line on what the new level brings (RAMP in core.ts). */
const LEVEL_NOTE:Record<number,string>={2:'More big shapes',3:'Odd shapes join in',4:'Afternoon. The referee walks on',7:'Sunset. Two referees now',10:'Night match. Lights on',11:'Three referees now',12:'Top level!'};
/** A press that moves less than this (CSS px) is a tap, and a tap never drops a piece (AAA pass: a tap on a tall shape used to place it). */
const TAP_SLOP=9;
const IDLE_NUDGE_MS=7000;

/** A row of four footballs on one joined slab (a line of the pitch), then the empty square that finishes it: the start card's picture of a line. */
function LineArt(){
 const star='M0 -10 L2.9 -4 L9.5 -3.1 L4.7 1.5 L5.9 8.1 L0 5 L-5.9 8.1 L-4.7 1.5 L-9.5 -3.1 L-2.9 -4Z';
 return <svg className={styles.art} viewBox="0 0 200 52" aria-hidden="true">
  <rect x="7.5" y="7.5" width="147" height="33" rx="8" fill="#62508f" stroke="#231a2e" strokeWidth="3"/>
  {[0,1,2,3].map(i=>{const k=[0,1,2,3][i];return <g key={i} transform={`translate(${24+i*38} 24)`}>
   <circle r="14.5" fill={KIT[k]} stroke="#231a2e" strokeWidth="2.6"/>
   {k===0&&<path d={star} fill="#fffaf0" stroke="#231a2e" strokeWidth="1.4" strokeLinejoin="round"/>}
   {k===1&&<g transform="rotate(-34)"><rect x="-14" y="-4.5" width="28" height="9" fill="#fffaf0"/><rect x="-14" y="-1.2" width="28" height="2.4" fill="#231a2e"/></g>}
   {k===2&&<><path d="M-14 1 Q0 9 14 1 L14 5 Q0 13 -14 5Z" fill="#d98a1c"/><circle cx="-6" cy="5" r="1.6" fill="#fffaf0"/><circle cx="0" cy="6.6" r="1.6" fill="#fffaf0"/><circle cx="6" cy="5" r="1.6" fill="#fffaf0"/></>}
   {k===3&&<><rect x="-3.2" y="-7" width="6.4" height="14" rx="3" fill="#fffaf0" stroke="#231a2e" strokeWidth="1.2"/><path d="M-5 -4 L5 -2 M5 -4 L-5 -2 M-5 1 L5 3 M5 1 L-5 3" stroke="#231a2e" strokeWidth="1.2"/></>}
   <ellipse cx="-6" cy="-7" rx="3.6" ry="2" transform="rotate(-40 -6 -7)" fill="#fff"/>
  </g>;})}
  <rect x="158" y="8" width="32" height="32" rx="8" fill="none" stroke="#231a2e" strokeWidth="3" strokeDasharray="5 4"/>
  <path d="M178 48 L156 48" stroke="#231a2e" strokeWidth="3" strokeLinecap="round"/><path d="M162 43 L155 48 L162 53" fill="none" stroke="#231a2e" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"/>
 </svg>;
}
function Medal({level,on}:{level:number;on:boolean}){return <span className={styles.medal} data-level={level} data-on={on||undefined} aria-hidden="true"><i/></span>;}

export default function LineUpGame({onExit}:{onExit:()=>void}){
 const [phase,setPhase]=useState<Phase>('menu'),phaseRef=useRef<Phase>('menu');
 const [hud,setHud]=useState<Hud>(HUD0),hudRef=useRef(hud);
 const [save,setSave]=useState<LineupSave>(emptyLineupSave),[result,setResult]=useState<Result|null>(null),[today,setToday]=useState('');
 const [board,setBoard]=useState<{score:number}|null>(null),[scores,setScores]=useState(false),[words,setWords]=useState<Word[]>([]),[refTip,setRefTip]=useState(false);
 const entry=useArcadeEntry('lineup');
 const stage=useRef<HTMLDivElement>(null),bg=useRef<HTMLCanvasElement>(null),fg=useRef<HTMLCanvasElement>(null),probe=useRef<HTMLElement>(null);
 const game=useRef<LineUp|null>(null),view=useRef<LineupView|null>(null),audio=useRef<LineupAudio|null>(null);
 const raf=useRef(0),endAt=useRef(0),wordId=useRef(0),run=useRef({id:'',daily:false,day:'',done:true});
 const drag=useRef<(LineupDrag&{pointer:number;touch:boolean;px:number;py:number;moved:boolean;lines:number})|null>(null),idle=useRef(0),cursor=useRef<{slot:number;x:number;y:number}|null>(null);
 const reduced=useRef(false),fitRef=useRef<()=>void>(()=>{}),frameRef=useRef<(t:number)=>void>(()=>{});

 const change=useCallback((p:Phase)=>{phaseRef.current=p;setPhase(p);},[]);
 useEffect(()=>{setSave(readLineupSave());setToday(localPlayDay(Date.now()));},[]);
 const kick=useCallback(()=>{if(!raf.current&&phaseRef.current==='playing')raf.current=requestAnimationFrame(t=>frameRef.current(t));},[]);

 /* ---- the run's end: save, coins, board (once per run) ---- */
 const finish=useCallback(()=>{
  const g=game.current,r=run.current;if(!g||r.done)return;r.done=true;const s=g.state,score=s.score,stats={...s.stats};
  const settled=settleLineup(readLineupSave(),{score,daily:r.daily,day:r.day,stats,level:s.level});writeLineupSave(settled.save);setSave(settled.save);
  if(!r.daily)saveArcadeRecord('lineup',score);else noteLastScore('lineup_daily',score,settled.dailyBest);
  const coins=arcadeCoinTarget('lineup',{points:score});if(coins>0)void creditRun(r.id,'lineup',coins,LINEUP_COIN_REASON);
  const filled=s.grid.reduce((a,v)=>a+(v?1:0),0);
  setResult({score,daily:r.daily,level:s.level,lines:stats.lines,combo:stats.bestCombo,streak:stats.bestStreak,clean:stats.cleanSheets,team:stats.teamLines,settled,coins,
   near:nearMissLine({score,best:settled.previousBest,newBest:settled.newBest,daily:r.daily,stats}),coach:coachLine(stats,filled)});
  if(score>0&&(!r.daily||settled.dailyFirst))setBoard({score});
  if(settled.newMedal||settled.newBest){audio.current?.medal(Math.max(1,settled.medal));arcadeFeedback(null,'goal');}
  drag.current=null;cursor.current=null;view.current?.clear();setWords([]);change('over');
 },[change]);

 const say=useCallback((text:string,pts:number,cells:number[],tone:Word['tone'],sub?:string,top=false)=>{const v=view.current;if(!v)return;const L=v.layout,N=LU.size;
  const cx=cells.length?cells.reduce((a,i)=>a+i%N,0)/cells.length:N/2,cy=cells.length?cells.reduce((a,i)=>a+Math.floor(i/N),0)/cells.length:N/2;
  const w:Word={id:++wordId.current,text,pts,x:Math.max(90,Math.min(L.w-90,L.bx+(cx+.5)*L.cell)),y:top?L.by-L.cell*1.35:L.by+(cy+.5)*L.cell,tone,sub};setWords(list=>[...list.slice(-2),w]);},[]);

 /* ---- one rules event: picture, sound, haptics, words ---- */
 const onEvent=useCallback((e:LineEvent)=>{
  const a=audio.current;view.current?.onEvent(e);
  switch(e.type){
   case 'place':a?.drop(e.cells.length);break;
   case 'clear':{a?.clear(e.a,e.b,e.team.length);arcadeFeedback(null,e.a>=2||e.team.length?'goal':'combo');const team=e.team.length>0;
    say((team&&e.a===1?'TEAM LINE!':COMBO_WORD[Math.min(COMBO_WORD.length-1,e.a)])+(e.b>=2?` x${e.b}`:''),e.points,e.cells,team?'teal':e.a>=2?'red':'sun',team?(e.a===1?'Six of one ball: +'+LU.teamPts:'Team line: +'+LU.teamPts*e.team.length):undefined);
    // the points fly from the line up to the counter
    const v=view.current;if(v){const L=v.layout,N=LU.size,cx=e.cells.reduce((q,i)=>q+i%N,0)/e.cells.length,cy=e.cells.reduce((q,i)=>q+Math.floor(i/N),0)/e.cells.length;v.flyPoints(L.bx+(cx+.5)*L.cell,L.by+(cy+.5)*L.cell,L.w/2,(probe.current?.offsetHeight??56)*.6,e.a+e.team.length+(e.b>=2?1:0));}break;}
   case 'clean':a?.clean();arcadeFeedback(null,'perfect');say('CLEAN SHEET!',e.points,[],'teal');break;
   case 'deal':a?.deal();break;
   case 'refOn':a?.whistle();arcadeFeedback(null,'slam');setRefTip(true);break;
   case 'refOff':a?.refOff();{const g=game.current;if(g&&!g.state.ref.some(v=>v>0))setRefTip(false);}break;
   case 'level':{const changed=view.current?.setLevel(e.a);if(changed)a?.venue();else a?.level();say(`LEVEL ${e.a}`,0,[],'teal',LEVEL_NOTE[e.a]??(changed?VENUES[venueFor(e.a)].name:'Tougher shapes'),true);break;}
   case 'hold':a?.hold(e.b>0);arcadeFeedback(null,'combo');break;
   case 'streakLost':a?.streakLost();break;
   case 'over':a?.over();arcadeFeedback(null,'slam');endAt.current=performance.now()+(reduced.current?600:1700);say('NO ROOM!',0,[],'paper','No shape fits the gaps',true);break;
  }
 },[say]);
 const sync=useCallback(()=>{const g=game.current;if(!g)return;let placed=false,cleared=false;g.drain(e=>{if(e.type==='place')placed=true;else if(e.type==='clear')cleared=true;onEvent(e);});const s=g.state,h=hudRef.current;
  // near miss: a line that is one ball short shows its last gap, with a soft two-note cue
  if(placed&&!cleared&&!s.over&&view.current?.markGaps(g))audio.current?.near();
  // danger (Nov 17 2026): a tray shape has no room left anywhere; one warning pip when it starts
  const tight=s.over?0:[...s.tray,s.bench].filter(p=>p!==null&&!g.fitsAnywhere(p.shape)).length;if(tight>h.tight)audio.current?.tight();
  // the streak is one placement from ending: say so once (a low tick), and the chip shows it
  const risk=!s.over&&s.streak>=2&&s.miss>0;if(risk&&!h.risk)audio.current?.risk();
  if(h.score!==s.score||h.level!==s.level||h.streak!==s.streak||h.lines!==s.stats.lines||h.tight!==tight||h.risk!==risk||h.rescue!==s.rescue){const n={score:s.score,level:s.level,streak:s.streak,lines:s.stats.lines,tight,risk,rescue:s.rescue};hudRef.current=n;setHud(n);}
  // one nudge of the tray after a few idle seconds (a single short wobble; nothing loops)
  clearTimeout(idle.current);if(!s.over)idle.current=window.setTimeout(()=>{if(phaseRef.current==='playing'&&!drag.current){view.current?.nudge();kick();}},IDLE_NUDGE_MS);
  kick();},[kick,onEvent]);

 /* ---- frames on demand ---- */
 useEffect(()=>{frameRef.current=(now:number)=>{
  raf.current=0;const g=game.current,v=view.current;if(phaseRef.current!=='playing'||!g||!v)return;
  const busy=v.render(g,drag.current,cursor.current);
  if(g.state.over&&endAt.current&&now>=endAt.current){finish();return;}
  if(busy||g.state.over)raf.current=requestAnimationFrame(t=>frameRef.current(t));
 };},[finish]);

 /* ---- start / restart: one tap, straight onto the pitch ---- */
 const start=useCallback(async(daily:boolean)=>{
  (audio.current??=createLineupAudio()).unlock();
  const id=await entry.enter();if(!id)return;
  const day=localPlayDay(Date.now()),seed=daily?lineupDailySeed(day):1+Math.floor(Math.random()*2_000_000_000);
  game.current=createLineUp({seed,daily});run.current={id,daily,day,done:false};
  if(!daily||readLineupSave().daily.day!==day||!readLineupSave().daily.counted)beginBoardSession('lineup');
  view.current?.reset();endAt.current=0;drag.current=null;cursor.current=null;setResult(null);setBoard(null);setWords([]);setToday(day);
  game.current.drain(e=>{if(e.type==='deal')view.current?.onEvent(e);});audio.current?.deal();hudRef.current=HUD0;setHud(HUD0);
  change('playing');kick();
 },[change,entry,kick]);
 const pause=useCallback(()=>{if(phaseRef.current!=='playing')return;if(raf.current)cancelAnimationFrame(raf.current);raf.current=0;clearTimeout(idle.current);
  const d=drag.current;if(d){view.current?.flyBack(d.slot,d.x,d.y);drag.current=null;}change('paused');},[change]);
 const resume=useCallback(()=>{if(phaseRef.current!=='paused')return;audio.current?.unlock();change('playing');kick();},[change,kick]);
 const leave=useCallback(()=>{if(raf.current)cancelAnimationFrame(raf.current);raf.current=0;onExit();},[onExit]);

 /* ---- canvases, size, drag ---- */
 useEffect(()=>{
  const el=stage.current,b=bg.current,f=fg.current;if(!el||!b||!f)return;
  reduced.current=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const v=view.current=createLineupView(b,f,{reduced:reduced.current});let left=0,top=0;
  const fit=()=>{const r=el.getBoundingClientRect(),vv=window.visualViewport,cut=Math.max(0,Math.round(r.bottom-(vv?vv.offsetTop+vv.height:window.innerHeight)));el.style.setProperty('--lu-cut',`${cut}px`);
   left=r.left;top=r.top;v.resize(Math.max(1,r.width),Math.max(1,r.height-cut),Math.min(2,window.devicePixelRatio||1),(probe.current?.offsetHeight??56)+44);
   const g=game.current;if(g&&phaseRef.current!=='menu')v.render(g,drag.current,cursor.current);};
  fitRef.current=fit;fit();const ro=new ResizeObserver(fit);ro.observe(el);window.visualViewport?.addEventListener('resize',fit);
  /** Puts the dragged piece where the finger is: lifted above a finger (so the thumb never hides it), centred under a mouse. */
  const aim=(cx:number,cy:number)=>{const d=drag.current,g=game.current;if(!d||!g)return;const p=g.pieceAt(d.slot);if(!p)return;const sh=SHAPES[p.shape],c=v.layout.cell,x=cx-left,y=cy-top;
   if(!d.moved&&Math.hypot(cx-d.px,cy-d.py)>TAP_SLOP)d.moved=true;
   d.x=x-sh.w*c/2;d.y=d.touch?y-sh.h*c-c*1.1:y-sh.h*c/2;const was=d.cell;
   // the bench takes a tray piece when the finger itself is inside its bay (a lifted tall piece hangs over the pitch then: the bench wins)
   d.bench=d.slot!==LU.bench&&d.moved&&v.overBench(x,y);const cell=d.bench?null:v.magnet(g,p.shape,d.x,d.y);d.cell=cell;
   if(cell){const pr=g.preview(d.slot,cell.x,cell.y);d.ok=pr.ok;d.rows=pr.rows;d.cols=pr.cols;d.team=pr.team;}else{d.ok=false;d.rows=[];d.cols=[];d.team=[];}
   // a tick as the ghost snaps to a new square, and a rising cue the moment a line is ready to clear
   if(cell&&d.ok&&d.moved&&(!was||was.x!==cell.x||was.y!==cell.y))audio.current?.snap();
   const lines=d.ok?d.rows.length+d.cols.length+d.team.length*10:0;if(lines!==d.lines){if(lines>d.lines){audio.current?.ready(d.rows.length+d.cols.length,d.team.length>0);arcadeFeedback(null,'combo');}d.lines=lines;}
   kick();};
  const down=(e:PointerEvent)=>{if(phaseRef.current!=='playing'||(e.pointerType==='mouse'&&e.button!==0)||(e.target instanceof Element&&e.target.closest('button')))return;
   const g=game.current;if(!g)return;e.preventDefault();audio.current?.unlock();if(g.state.over){endAt.current=1;kick();return;}
   if(drag.current)return;{const rr=el.getBoundingClientRect();left=rr.left;top=rr.top;}// the page may have moved without resizing (desktop centring)
   const slot=v.slotAt(e.clientX-left,e.clientY-top),p=slot>=0?g.pieceAt(slot):null;if(!p)return;clearTimeout(idle.current);
   const from=v.trayRect(slot,p.shape);cursor.current=null;drag.current={slot,x:0,y:0,cell:null,ok:false,rows:[],cols:[],team:[],bench:false,t0:performance.now(),fx:from.x,fy:from.y,fs:from.s,pointer:e.pointerId,touch:e.pointerType!=='mouse',px:e.clientX,py:e.clientY,moved:false,lines:0};
   try{el.setPointerCapture(e.pointerId);}catch{/* fine without */}audio.current?.lift(SHAPES[p.shape].n);aim(e.clientX,e.clientY);};
  const move=(e:PointerEvent)=>{const d=drag.current;if(!d||e.pointerId!==d.pointer)return;e.preventDefault();aim(e.clientX,e.clientY);};
  const up=(e:PointerEvent)=>{const d=drag.current,g=game.current;if(!d||e.pointerId!==d.pointer||!g)return;if(e.type==='pointerup')aim(e.clientX,e.clientY);// the release point decides
   drag.current=null;try{el.releasePointerCapture(e.pointerId);}catch{/* gone */}
   const done=e.type==='pointerup'&&d.moved;// a tap (no real move) and a cancelled touch never drop a piece
   if(done&&d.cell&&d.ok&&g.place(d.slot,d.cell.x,d.cell.y)){sync();return;}
   if(done&&d.bench){const back=g.state.bench,br=back?v.trayRect(LU.bench,back.shape):null;if(g.hold(d.slot)){v.flyBack(LU.bench,d.x,d.y);if(br&&g.state.tray[d.slot])v.flyBack(d.slot,br.x,br.y,br.s);sync();return;}}
   if(done&&d.cell){audio.current?.nope();arcadeFeedback(null,'slam');}
   // back to the bay from where it is drawn now (a tap has barely left it)
   {const u=Math.min(1,(performance.now()-d.t0)/110),k=1-(1-u)*(1-u);v.flyBack(d.slot,d.fx+(d.x-d.fx)*k,d.fy+(d.y-d.fy)*k,d.fs+(v.layout.cell-d.fs)*k);}kick();};
  const opt={passive:false} as const;
  el.addEventListener('pointerdown',down,opt);el.addEventListener('pointermove',move,opt);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
  const noScroll=(e:TouchEvent)=>{if(phaseRef.current==='playing'&&e.cancelable)e.preventDefault();};el.addEventListener('touchmove',noScroll,opt);
  const noMenu=(e:Event)=>e.preventDefault();f.addEventListener('contextmenu',noMenu);
  if(process.env.NODE_ENV!=='production')(window as unknown as {__lineup?:unknown}).__lineup={get game(){return game.current;},get phase(){return phaseRef.current;},get loop(){return raf.current!==0;},get layout(){return view.current?.layout;},get audio(){return audio.current;},get stage(){return el.getBoundingClientRect();},get view(){return view.current;},shape:(i:number)=>SHAPES[i],sync:()=>sync(),get cursor(){return cursor.current;},get drag(){return drag.current;}};
  return()=>{ro.disconnect();window.visualViewport?.removeEventListener('resize',fit);el.removeEventListener('pointerdown',down);el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up);el.removeEventListener('touchmove',noScroll);f.removeEventListener('contextmenu',noMenu);
   if(raf.current)cancelAnimationFrame(raf.current);raf.current=0;clearTimeout(idle.current);v.dispose();view.current=null;game.current=null;audio.current?.dispose();audio.current=null;fitRef.current=()=>{};delete (window as unknown as {__lineup?:unknown}).__lineup;};
 },[kick,sync]);

 /* ---- keys: 1 2 3 pick a shape, arrows move it, Enter or Space places it; P / Escape pause; looked away: pause ---- */
 useEffect(()=>{
  const away=()=>pause(),hidden=()=>{if(document.hidden)pause();};
  const key=(e:KeyboardEvent)=>{if(e.target instanceof HTMLElement&&e.target.closest('button,input,select,textarea,a,dialog'))return;
   if(e.code==='Escape'||e.code==='KeyP'){e.preventDefault();if(phaseRef.current==='playing')pause();else if(phaseRef.current==='paused')resume();return;}
   const g=game.current;if(phaseRef.current!=='playing'||!g||drag.current)return;audio.current?.unlock();
   if(g.state.over){if(e.code==='Enter'||e.code==='Space'){e.preventDefault();endAt.current=1;kick();}return;}
   const N=LU.size,tray=g.state.tray,pick=(slot:number)=>{const p=g.pieceAt(slot);if(!p)return;const sh=SHAPES[p.shape],old=cursor.current;cursor.current={slot,x:Math.min(N-sh.w,old?.x??Math.floor((N-sh.w)/2)),y:Math.min(N-sh.h,old?.y??Math.floor((N-sh.h)/2))};audio.current?.lift(sh.n);kick();};
   const digit=['Digit1','Digit2','Digit3','Digit4'].indexOf(e.code);if(digit>=0){e.preventDefault();pick(digit);return;}
   const cur=cursor.current;
   // B parks the picked tray shape on the bench (or swaps it with the one there)
   if(e.code==='KeyB'){e.preventDefault();const slot=cur&&cur.slot<LU.tray?cur.slot:tray.findIndex(Boolean);if(slot>=0&&g.hold(slot)){cursor.current=null;const next=[0,1,2,3].find(k=>g.pieceAt(k));sync();if(next!==undefined)pick(next);}return;}
   if(e.code==='Tab'&&!e.shiftKey&&cur){e.preventDefault();for(let k=1;k<=4;k++)if(g.pieceAt((cur.slot+k)%4)){pick((cur.slot+k)%4);break;}return;}
   const mv:Record<string,[number,number]>={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1],KeyA:[-1,0],KeyD:[1,0],KeyW:[0,-1],KeyS:[0,1]};
   if(mv[e.code]){e.preventDefault();if(!cur){const first=[0,1,2,3].find(k=>g.pieceAt(k));if(first!==undefined)pick(first);return;}const p=g.pieceAt(cur.slot);if(!p)return;const sh=SHAPES[p.shape];
    cur.x=Math.max(0,Math.min(N-sh.w,cur.x+mv[e.code][0]));cur.y=Math.max(0,Math.min(N-sh.h,cur.y+mv[e.code][1]));kick();return;}
   if((e.code==='Enter'||e.code==='Space')&&cur){e.preventDefault();if(g.place(cur.slot,cur.x,cur.y)){const next=[0,1,2,3].find(k=>g.pieceAt(k))??-1;cursor.current=next>=0?{slot:next,x:cur.x,y:cur.y}:null;if(cursor.current){const sh=SHAPES[g.pieceAt(next)!.shape];cursor.current.x=Math.min(N-sh.w,cur.x);cursor.current.y=Math.min(N-sh.h,cur.y);}sync();}else{audio.current?.nope();}}
  };
  window.addEventListener('blur',away);document.addEventListener('visibilitychange',hidden);window.addEventListener('keydown',key);
  return()=>{window.removeEventListener('blur',away);document.removeEventListener('visibilitychange',hidden);window.removeEventListener('keydown',key);};
 },[kick,pause,resume,sync]);

 const streak=today?liveStreak(save,today):0,dailyToday=save.daily.day===today?save.daily:null,busy=entry.pending,live=phase==='playing'||phase==='paused';
 const tap=()=>{(audio.current??=createLineupAudio()).unlock();audio.current.tap();};
 const best=save.best,gap=best>0&&hud.score<best?best-hud.score:0;
 return <div className={`${styles.game} ${arcadeSkin.lineup} ${comicRoot}`} data-game="lineup" data-arcade-kind="lineup" data-phase={phase}>
  <aside className={styles.side} data-side="left" aria-hidden="true">
   <ComicPanel tilt={-1.5} tone="paper"><b>Drag a shape</b><br/>Drop it on the pitch. Fill a whole row or column to clear it.</ComicPanel>
   <ComicPanel tilt={1} tone="sun"><b>Combo</b><br/>Clear two lines with one shape for more points.</ComicPanel>
   <ComicPanel tilt={-.8} tone="teal"><b>Keys</b><br/>1 2 3 pick a shape. Arrows move it. Enter places it. B parks it on the bench. 4 picks the bench.</ComicPanel>
  </aside>
  <aside className={styles.side} data-side="right" aria-hidden="true">
   <ComicPanel tilt={1.2} tone="paper" className={styles.sideMedals}><b>Medals</b>{LU.medals.map((m,i)=><span key={m}><Medal level={i+1} on/>{MEDAL_NAMES[i]}<em>{m}</em></span>)}</ComicPanel>
   <ComicPanel tilt={-1} tone="teal"><b>The bench</b><br/>Drag a shape to the bench to keep it for later. It holds one shape.</ComicPanel>
   <ComicPanel tilt={.8} tone="sun"><b>Team line</b><br/>Six of the same ball in one line score more.</ComicPanel>
   <ComicPanel tilt={-1} tone="red"><b>The referee</b><br/>From level 4 a referee stands on one square. The number shows how many moves until they leave.</ComicPanel>
  </aside>
  <div className={styles.stage} ref={stage} data-lineup-stage>
   <i ref={probe} className={styles.probe} aria-hidden="true"/>
   <canvas ref={bg} className={styles.scene} aria-hidden="true"/>
   <canvas ref={fg} className={styles.play} tabIndex={0} aria-label="Line Up! pitch. Drag a shape from the tray onto the pitch, or press 1, 2 or 3, the arrow keys and Enter. Press B to park a shape on the bench and 4 to pick it up."/>
   {live&&<div className={styles.strip} data-lineup-hud aria-live="polite" aria-label={`Level ${hud.level}. ${hud.lines} lines.${hud.streak>=2?` Streak ${hud.streak}.`:''}`}>
    <b className={styles.lv}>L{hud.level}</b>
    <span className={styles.stripItem}><small>Lines</small>{hud.lines}</span>
    <span className={styles.stripItem} data-lineup-best><small>{gap>0?'To best':'Best'}</small>{gap>0?gap:Math.max(best,hud.score)}</span>
    {hud.streak>=2&&<span className={styles.streak} key={`${hud.streak}${hud.risk?'r':''}`} data-lineup-streak={hud.streak} data-risk={hud.risk||undefined}>{hud.risk?`x${hud.streak} · clear now!`:`Streak x${hud.streak}`}</span>}
   </div>}
   {live&&save.plays===0&&hud.score===0?<p className={`${styles.refTip} ${styles.hint}`} data-lineup-hint><i aria-hidden="true"/>Drag a shape up onto the pitch</p>
    :live&&hud.rescue?<p className={`${styles.refTip} ${styles.tight}`} data-lineup-rescue>No room! Drag that shape to the bench.</p>
    :live&&hud.tight>0?<p className={`${styles.refTip} ${styles.tight}`} data-lineup-tight>Tight! {hud.tight===1?'One shape has':'Some shapes have'} no room. Clear a line.</p>
    :live&&refTip&&hud.level<6&&<p className={styles.refTip} data-lineup-reftip>The referee blocks a square. Play around them.</p>}
   <div className={styles.words} aria-live="polite">{words.map(w=><span key={w.id} className={styles.word} style={{left:w.x,top:w.y}} onAnimationEnd={()=>setWords(l=>l.filter(x=>x.id!==w.id))}>
    <ComicBurst word={w.text} size={w.text.length>10?17:21} tilt={w.id%2?-4:3} color={w.tone==='red'?'#f0452e':w.tone==='teal'?'#19b5a5':w.tone==='paper'?'#fff3d6':'#ffc83a'} fill={w.tone==='red'?'#fff3d6':undefined}/>
    {w.pts>0&&<b className={`${comicNumeral} ${styles.pts}`}>+{w.pts}</b>}{w.sub&&<em className={styles.sub}>{w.sub}</em>}</span>)}</div>
  </div>
  <ArcadeTopBar game="lineup" className={styles.topBar} backTitle="Back to arcade" onBack={leave} value={live?hud.score:undefined} word="pts" bumpKey={hud.score} paused={phase==='paused'} canPause={live} onPause={()=>phase==='playing'?pause():resume()}/>
  {phase==='paused'&&<ArcadePauseCard game="lineup" score={`${hud.score} pts · Level ${hud.level} · ${hud.lines} lines`} status={entry.message||undefined} onResume={resume} onExit={leave} onRestart={()=>{void start(run.current.daily);}} restartDisabled={busy} keys={[['Drag','place a shape'],['1 2 3','pick'],['Enter','place'],['B','bench'],['P','pause']]}/>}
  {phase==='menu'&&<ComicCard label="Line Up!" title="Line Up!" badge="Fill the line" badgeTone="teal" best={best>0?`Best ${best}`:undefined} data-lineup-card="start">
   <LineArt/>
   <p className={styles.learn}>Drag a shape of footballs onto the pitch. Fill a whole row or column: the line clears and scores. Clear two at once for a <b>combo</b>. Park one shape on the <b>bench</b> for later. The game ends when no shape fits.</p>
   <div className={styles.chips}>
    <ComicStat value={best||'–'} label="Best"/>
    <ComicStat value={<span className={styles.medalRow}>{[1,2,3].map(l=><Medal key={l} level={l} on={save.medal>=l}/>)}</span>} label={save.medal?MEDAL_NAMES[save.medal-1]:'No medal yet'}/>
    <ComicStat value={streak} label={streak===1?'Day in a row':'Days in a row'} tone={streak>0?'sun':undefined} data-lineup-streakdays={streak}/>
   </div>
   {entry.message&&<p className={styles.status} role="status">{entry.message}</p>}
   <div className={styles.actions}>
    <ComicButton variant="primary" wide disabled={busy} onClick={()=>{void start(false);}} data-lineup-play autoFocus>Play</ComicButton>
    <ComicButton variant="teal" wide disabled={busy} onClick={()=>{void start(true);}} data-lineup-daily>Daily Line-Up<small>{dailyToday?.counted?`Today’s best ${dailyToday.best} · practice`:'Same shapes for everyone today'}</small></ComicButton>
    <ComicButton size="small" onClick={()=>{tap();setScores(true);}} data-lineup-scores>Scores</ComicButton>
   </div>
  </ComicCard>}
  {phase==='over'&&result&&<ComicCard label="Full time" badge={result.daily?'Daily Line-Up':'Full time'} badgeTone={result.daily?'teal':'red'} best={result.daily?`Today ${result.settled.dailyBest}`:`Best ${result.settled.save.best}`} data-lineup-card="results" data-lineup-score={result.score}>
   <div className={styles.scoreRow}>
    <strong className={`${comicNumeral} ${styles.score}`} data-new-best={result.settled.newBest||undefined}>{result.score}</strong>
    {result.settled.newBest&&<ComicBurst word="New best!" size={17} tilt={7} className={styles.stamp}/>}
   </div>
   <div className={styles.medalRow} data-lineup-medal={result.settled.medal} role="img" aria-label={result.settled.medal?`${MEDAL_NAMES[result.settled.medal-1]} medal`:'No medal this time'}>{[1,2,3].map(l=><Medal key={l} level={l} on={medalFor(result.score)>=l}/>)}<em>{result.settled.medal?MEDAL_NAMES[result.settled.medal-1]:'No medal yet'}</em></div>
   <ComicMedalTrack score={result.score} best={result.settled.previousBest} medals={LU.medals} names={MEDAL_NAMES} data-lineup-track/>
   <ComicPanel tone="sun" tilt={-1.2} className={styles.near} data-lineup-near>{result.near}</ComicPanel>
   <div className={styles.hsSlot} data-hs-slot/>
   <div className={styles.actions}>
    <ComicButton variant="primary" wide disabled={busy} onClick={()=>{void start(result.daily);}} data-lineup-again autoFocus>Play again</ComicButton>
    <ComicButton size="small" disabled={busy} onClick={()=>{void start(!result.daily);}} data-lineup-other>{result.daily?'Endless':'Daily Line-Up'}</ComicButton>
    <ComicButton size="small" onClick={()=>{tap();setScores(true);}}>Scores</ComicButton>
   </div>
   <div className={styles.chips}>
    <ComicStat value={result.lines} label="Lines"/>
    <ComicStat value={result.streak} label="Best streak"/>
    <ComicStat value={result.team} label="Team lines"/>
    <ComicStat value={result.level} label="Level"/>
   </div>
   <p className={styles.coach}>{result.coach}</p>
   <ComicPanel tone="paper" flat className={styles.fact} data-lineup-fact><b>{result.settled.tip.title}</b>{result.settled.tip.line}</ComicPanel>
   {(result.coins>0||entry.message)&&<p className={styles.status} role="status">{entry.message||`+${result.coins} ${result.coins===1?'coin':'coins'}`}{result.daily&&!result.settled.dailyFirst&&!entry.message?' · practice run (your first run today is on the board)':''}</p>}
  </ComicCard>}
  {board&&phase==='over'&&<HighScoreEntry game="lineup" score={board.score} detail="Points for balls placed and lines cleared. Combos and streaks score more." onClose={()=>setBoard(null)}/>}
  {scores&&<LineUpScores onClose={()=>setScores(false)}/>}
 </div>;
}
