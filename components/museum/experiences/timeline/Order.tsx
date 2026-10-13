'use client';
import {useCallback,useEffect,useMemo,useRef,useState,type CSSProperties,type KeyboardEvent as RKeyboardEvent,type PointerEvent as RPointerEvent} from 'react';
import {museumSfx,unlockMuseumAudio} from '@/lib/museum/museumSound';
import StepCheck from '../modern/StepCheck';
import Ending from '../modern/Ending';
import {BEST_KEY,CLOCK_MS,HURRY_MS,SETS_REDUCED,deal,lesson,marks,move,orderCheck,setPoints,slotAt,sorted,swap,verdict,type Item} from './orderRules';
import {artifactScene} from './bench';
import Draw from './Draw';
import s from './Experience.module.css';

/**
 * timeline · "Order it" (Oct 10 2026 game; Oct 12 2026 anatomy restyle; rules in orderRules.ts). A set of the museum's cases
 * arrives as specimen CARDS on the bench, each with its artifact drawn on a turntable, the title, and the year hidden. DRAG them
 * into order, oldest first (left to right on a wide card, top to bottom on a phone), or tap two to swap, or arrow keys on a
 * focused one; then "Lock it in": the years spring up as big numerals, every card on its right step is marked in the accent,
 * the wrong ones slide to their real places, and one sentence says which came first. 50 points a right step, a perfect set
 * +100 × the streak (up to ×4), a quick perfect set a speed bonus; sixty seconds on the clock. The round ends with a quick
 * check ("Which came first?"), then the shared Ending (onFinish → the exhibit's onComplete, once).
 *
 * Heat: the clock is ONE linear Web Animation on a bar (its finish = time's up) plus one silent one for the 10-second warning;
 * both pause while the answer shows and while the tab is hidden; no frame loop and no timers here; unmount cancels them.
 * Card drawings are built once per case. Reduced motion: no clock, five sets, no speed bonus, no slides.
 */
type Phase='ready'|'play'|'reveal'|'over';
type Res={byId:Record<string,boolean>;points:number;right:number;n:number;perfect:boolean;bonus:number;quick:number;streak:number;text:string;left:number|null};
const readBest=()=>{try{return Number(localStorage.getItem(BEST_KEY))||0;}catch{return 0;}};
const saveBest=(n:number)=>{try{localStorage.setItem(BEST_KEY,String(n));}catch{/* private mode: fine */}};
const sfx=(cue:'tick'|'card'|'reveal'|'click'|'whistle'|'look')=>{try{museumSfx[cue]();}catch{/* sound is optional */}};
const AW=220,AH=170;

/** A card's picture: the case's artifact on a turntable, built once. */
function Art({id}:{id:string}){
 const items=useMemo(()=>artifactScene(id,AW,AH),[id]);
 return <svg className={`iso-svg ${s.art}`} viewBox={`0 0 ${AW} ${AH}`} aria-hidden="true"><Draw items={items}/></svg>;
}

export default function Order({pool,reduced,onFinish,onClose}:{pool:readonly Item[];reduced:boolean;onFinish:(score:number)=>void;onClose:()=>void}){
 const seed=useRef(Date.now());
 const [phase,setPhase]=useState<Phase>('ready');
 const [k,setK]=useState(0);
 const [dealt,setDealt]=useState<Item[]>(()=>deal(pool,0,seed.current));
 const [order,setOrder]=useState<Item[]>(dealt);
 const [preview,setPreview]=useState<Item[]|null>(null);
 const [res,setRes]=useState<Res|null>(null);
 const [score,setScore]=useState(0),[streak,setStreak]=useState(0),[bestStreak,setBestStreak]=useState(0),[perfects,setPerfects]=useState(0),[placed,setPlaced]=useState(0);
 const [checked,setChecked]=useState(false);
 const [best,setBest]=useState(0),[newBest,setNewBest]=useState(false),[hurry,setHurry]=useState(false),[sel,setSel]=useState<number|null>(null),[dragId,setDragId]=useState<string|null>(null);
 const phaseRef=useRef(phase);phaseRef.current=phase;const orderRef=useRef(order);orderRef.current=order;
 const bar=useRef<HTMLSpanElement>(null),hurryEl=useRef<HTMLSpanElement>(null),list=useRef<HTMLOListElement>(null);
 const clock=useRef<Animation[]>([]),setStart=useRef(0),scoreRef=useRef(0),wantClock=useRef(false);scoreRef.current=score;

 useEffect(()=>{setBest(readBest());},[]);
 const now=()=>Number(clock.current[0]?.currentTime??0);
 const stopClock=useCallback(()=>{clock.current.forEach(a=>a.cancel());clock.current=[];},[]);
 useEffect(()=>stopClock,[stopClock]);
 const end=useCallback(()=>{if(phaseRef.current==='over')return;phaseRef.current='over';setPhase('over');stopClock();sfx('whistle');
  const sc=scoreRef.current,b=readBest();if(sc>b){saveBest(sc);setNewBest(true);}setBest(Math.max(b,sc));},[stopClock]);
 // The round ends with its quick check; onFinish (the exhibit's onComplete) comes only once it is answered.
 const check=useMemo(()=>orderCheck(pool,seed.current+k),[pool,phase==='over',k]);// eslint-disable-line react-hooks/exhaustive-deps
 const endRef=useRef(end);endRef.current=end;
 /** The round's clock: one linear scaleX animation (its finish = time's up) and one silent one for the 10-second warning. */
 const startClock=()=>{stopClock();setHurry(false);if(reduced)return;const b=bar.current,h=hurryEl.current;if(!b||typeof b.animate!=='function')return;
  const a=b.animate([{transform:'scaleX(1)'},{transform:'scaleX(0)'}],{duration:CLOCK_MS,easing:'linear',fill:'forwards'});
  a.onfinish=()=>{if(clock.current[0]===a)endRef.current();};clock.current=[a];
  if(h){const w=h.animate([{opacity:0},{opacity:0}],{duration:CLOCK_MS-HURRY_MS});w.onfinish=()=>{if(clock.current[0]===a){setHurry(true);sfx('tick');}};clock.current.push(w);}};
 const pauseClock=()=>clock.current.forEach(a=>{if(a.playState==='running')a.pause();});
 const playClock=()=>clock.current.forEach(a=>{if(a.playState==='paused')a.play();});
 useEffect(()=>{const vis=()=>{if(document.visibilityState!=='visible')pauseClock();else if(phaseRef.current==='play')playClock();};
  document.addEventListener('visibilitychange',vis);return()=>document.removeEventListener('visibilitychange',vis);});
 useEffect(()=>{if(phase==='play'&&wantClock.current){wantClock.current=false;startClock();}});// eslint-disable-line react-hooks/exhaustive-deps
 const begin=()=>{unlockMuseumAudio();sfx('card');wantClock.current=true;phaseRef.current='play';setPhase('play');setStart.current=0;};
 const lock=()=>{if(phaseRef.current!=='play')return;const o=orderRef.current,m=marks(o);
  const ms=reduced?null:Math.max(0,now()-setStart.current),p=setPoints(m,streak,ms);
  pauseClock();phaseRef.current='reveal';setPhase('reveal');setSel(null);
  setRes({byId:Object.fromEntries(o.map((x,j)=>[x.id,m[j]])),points:p.points,right:p.right,n:m.length,perfect:p.perfect,bonus:p.bonus,quick:p.quick,streak:p.streak,text:lesson(o),left:reduced?null:Math.max(0,Math.round((CLOCK_MS-now())/1000))});
  setScore(x=>x+p.points);setStreak(p.streak);setBestStreak(b=>Math.max(b,p.streak));setPlaced(n=>n+p.right);if(p.perfect)setPerfects(n=>n+1);
  sfx(p.perfect?'reveal':'card');
  if(!p.perfect)setOrder(sorted(o));};
 const next=()=>{if(phaseRef.current!=='reveal')return;if(reduced&&k+1>=SETS_REDUCED){end();return;}
  const d=deal(pool,k+1,seed.current,dealt.map(x=>x.id));sfx('click');
  setK(k+1);setDealt(d);setOrder(d);setRes(null);phaseRef.current='play';setPhase('play');setStart.current=now();playClock();};
 const again=()=>{sfx('click');stopClock();seed.current=Date.now();const d=deal(pool,0,seed.current);
  setK(0);setDealt(d);setOrder(d);setRes(null);setChecked(false);setScore(0);setStreak(0);setBestStreak(0);setPerfects(0);setPlaced(0);setNewBest(false);
  wantClock.current=true;phaseRef.current='play';setPhase('play');setStart.current=0;};
 useEffect(()=>{if(phase==='reveal')document.querySelector<HTMLElement>('[data-tl-order-next]')?.focus({preventScroll:true});},[phase]);

 // ---- drag a card to a new step (along the list's axis); tap two to swap; arrows move the focused one ----
 const drag=useRef<{pid:number;from:number;p0:number;row:number;moved:boolean;el:HTMLElement;slot:number;id:string;x:boolean}|null>(null);
 const axisX=()=>{const l=list.current;return !!l&&getComputedStyle(l).getPropertyValue('--axis').trim()==='x';};
 const rowOf=(el:HTMLElement,x:boolean)=>{const r=el.getBoundingClientRect(),l=list.current,gap=l?parseFloat(getComputedStyle(l).getPropertyValue('--gap'))||12:12;return (x?r.width:r.height)+gap;};
 const down=(ev:RPointerEvent<HTMLButtonElement>,i:number,id:string)=>{if(phaseRef.current!=='play'||ev.button>0)return;unlockMuseumAudio();
  try{ev.currentTarget.setPointerCapture(ev.pointerId);}catch{/* fine */}const x=axisX(),li=ev.currentTarget.parentElement as HTMLElement;
  drag.current={pid:ev.pointerId,from:i,p0:x?ev.clientX:ev.clientY,row:rowOf(li,x),moved:false,el:ev.currentTarget,slot:i,id,x};};
 const moveP=(ev:RPointerEvent<HTMLButtonElement>)=>{const d=drag.current;if(!d||d.pid!==ev.pointerId)return;const dv=(d.x?ev.clientX:ev.clientY)-d.p0;
  if(!d.moved){if(Math.abs(dv)<6)return;d.moved=true;setDragId(d.id);setSel(null);}
  const n=orderRef.current.length,v=Math.max(-d.from*d.row-d.row*.4,Math.min((n-1-d.from)*d.row+d.row*.4,dv));d.el.style.transform=d.x?`translate3d(${Math.round(v)}px,0,0) scale(1.03)`:`translate3d(0,${Math.round(v)}px,0) scale(1.03)`;
  const sl=slotAt(v,d.row,d.from,n);if(sl!==d.slot){d.slot=sl;setPreview(move(orderRef.current,d.from,sl));sfx('tick');}};
 const up=(ev:RPointerEvent<HTMLButtonElement>,i:number)=>{const d=drag.current;if(!d||d.pid!==ev.pointerId)return;drag.current=null;
  if(d.moved){d.el.style.transform='';setDragId(null);setPreview(null);if(d.slot!==d.from)setOrder(o=>move(o,d.from,d.slot));return;}
  if(phaseRef.current!=='play')return;
  if(sel===null){setSel(i);sfx('tick');}else if(sel===i)setSel(null);else{setOrder(o=>swap(o,sel,i));setSel(null);sfx('click');}};
 const cancel=()=>{const d=drag.current;if(!d||!d.moved)return;drag.current=null;d.el.style.transform='';setDragId(null);setPreview(null);};
 const key=(ev:RKeyboardEvent<HTMLButtonElement>,i:number)=>{if(phaseRef.current!=='play')return;const n=order.length;
  if((ev.key==='ArrowUp'||ev.key==='ArrowLeft')&&i>0){ev.preventDefault();setOrder(o=>move(o,i,i-1));sfx('tick');}
  else if((ev.key==='ArrowDown'||ev.key==='ArrowRight')&&i<n-1){ev.preventDefault();setOrder(o=>move(o,i,i+1));sfx('tick');}};

 const shown=preview??order,n=dealt.length;
 const line=res?[`+${res.points}`,`${res.right} of ${res.n} right`,res.bonus?`streak ×${Math.min(4,res.streak)} +${res.bonus}`:'',res.quick?`quick +${res.quick}`:''].filter(Boolean).join(' · '):'';

 return <div className={s.order} data-tl-order={phase} role="group" aria-label="Order it: put the cases in order, oldest first">
  {phase!=='over'?<>
   <div className={s.orderTop}>
    <p className={s.orderStat}><b data-tl-order-score={score}>{score}</b><span>Score</span></p>
    <p className={s.orderStat}><b data-tl-order-streak={streak}>{streak}</b><span>Streak</span></p>
    <p className={s.orderStat}><b>{k+1}{reduced?`/${SETS_REDUCED}`:''}</b><span>Set</span></p>
    {!reduced&&<span className={s.clock} data-hurry={hurry||undefined} aria-hidden="true"><span ref={bar} className={s.clockFill}/><span ref={hurryEl} className={s.hurryProbe}/></span>}
   </div>
   <p className={s.orderSay} role="status" data-perfect={res?.perfect||undefined}>{res&&phase==='reveal'?<><b>{line}</b> {res.text}{res.left!=null&&<> {res.left} s left.</>}</>
    :phase==='ready'?<>Put the cases in order, the <b>oldest</b> first. Drag them, or tap two to swap. {reduced?'Five sets, no clock.':'Sixty seconds!'}</>:<>Oldest first. Drag a case to move it, then lock it in.</>}</p>
   <div className={s.track}>
    <span className={s.end} aria-hidden="true">Oldest</span>
    <ol ref={list} className={s.carts} data-phase={phase} style={{'--n':n} as CSSProperties} aria-label="Oldest first">
     {dealt.map(x=>{const i=dragId===x.id&&drag.current?drag.current.from:shown.indexOf(x),mk=res?.byId[x.id];
      return <li key={x.id} className={s.slot} data-still={dragId===x.id||undefined} style={{'--slot':i} as CSSProperties}>
       <button type="button" className={s.cart} data-tl-order-card={x.id} data-drag={dragId===x.id||undefined} data-sel={sel===i||undefined}
        data-mark={res?(mk?'right':'wrong'):undefined} disabled={phase==='ready'} aria-pressed={sel===i}
        aria-label={`${x.title}. Step ${i+1} of ${n}.${res?` ${x.year}.`:' Drag, or use the arrow keys, to move it.'}`}
        onPointerDown={ev=>down(ev,i,x.id)} onPointerMove={moveP} onPointerUp={ev=>up(ev,i)} onPointerCancel={cancel} onLostPointerCapture={cancel} onKeyDown={ev=>key(ev,i)}>
        <span className={s.cartNo} aria-hidden="true">{String(i+1).padStart(2,'0')}</span>
        <Art id={x.id}/>
        <span className={s.cartTitle}>{x.title}</span>
        <span className={s.cartYear} aria-hidden="true">{res?<b data-tl-order-year>{x.year}</b>:'????'}</span>
       </button>
      </li>;})}
    </ol>
    <span className={s.end} aria-hidden="true">Newest</span>
   </div>
  </>
  :<div className={s.summary} data-tl-order-summary aria-live="polite">
    <p className={s.kicker}>Time’s up · {verdict(score)}</p>
    <p className={s.score}><b data-tl-order-final={score}>{score}</b><span>{newBest?'A new best score!':`Best: ${best}`}</span></p>
    <p className={s.body}><b>{perfects}</b> sets in perfect order · <b>{placed}</b> cases on the right step · <b>{bestStreak}</b> perfect in a row</p>
    <p className={s.body}>Football changed one idea at a time: first the rules were written down, then came the World Cup, cards, new games for everyone, and the video referee. Each change came after the one before.</p>
    {!checked?<StepCheck items={[check]} kicker={()=> 'Quick check'} doneLabel="Finish" onPick={ok=>sfx(ok?'reveal':'look')} onDone={()=>{setChecked(true);onFinish(scoreRef.current);}}/>
     :<Ending reached art={<svg className="iso-svg" viewBox={`0 0 ${AW} ${AH}`} aria-hidden="true"><Draw items={artifactScene('worldcup-1930',AW,AH)}/></svg>}
       seen="You’ve put football’s story in order, from the first Laws to the video referee."
       take="Football keeps changing one idea at a time. Try one new idea in your next game."/>}
  </div>}
  <div className={s.orderBtns}>
   {phase==='ready'&&<button type="button" className={s.btn} data-museum-own-cue data-tl-order-start onClick={begin} autoFocus>Start the clock</button>}
   {phase==='play'&&<button type="button" className={s.btn} data-museum-own-cue data-tl-order-lock onClick={lock}>Lock it in</button>}
   {phase==='reveal'&&<button type="button" className={s.btn} data-museum-own-cue data-tl-order-next onClick={next}>{reduced&&k+1>=SETS_REDUCED?'See your score':'Next set'}</button>}
   {phase==='over'&&<button type="button" className={s.btn} data-museum-own-cue data-tl-order-again onClick={again}>Play again</button>}
   <button type="button" className={s.ghost} data-tl-order-close onClick={()=>{sfx('click');stopClock();onClose();}}>Back to the bench</button>
  </div>
 </div>;
}
