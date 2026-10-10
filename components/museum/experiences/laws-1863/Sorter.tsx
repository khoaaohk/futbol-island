'use client';
import {useCallback,useEffect,useLayoutEffect,useRef,useState,type KeyboardEvent as RKeyboardEvent,type PointerEvent as RPointerEvent} from 'react';
import {museumSfx} from '@/lib/museum/museumSound';
import {SORT_CARDS,sortVerdict,type SortCard} from './sort';
import {CARD_STORY,CARD_VB} from './drawings';
import LineMorph from './LineMorph';
import {loop,rubber,spring,stepSpring} from './spring';
import s from './Experience.module.css';

/**
 * laws-1863 · "Still a rule?" (Oct 9 2026 motion pass; restyled the same day as thin line art): the visitor's first beat. A stack of
 * line-drawn cards, one 1863 Law each, each telling its rule as a tiny line story (the strokes draw on, then move: a ball goes in
 * and comes back to the centre, a leg hooks an ankle). Drag
 * (or flick) the top slip left into AMENDED or right into STILL IN FORCE, or press the two buttons / the arrow keys.
 * Motion: the slip follows the finger 1:1 (tilting with the drag, rubber-banded vertically), and the side it leans to lights up.
 * Let go past the line, or flick, and the release velocity carries into a spring that throws the slip into its tray, where it
 * shrinks into a chip (the slip becomes the chip: same ink, same words). A wrong guess lands where you put it, shakes, then the
 * chip hops across to the right tray (FLIP: First, Last, Invert, Play). Let go short of the line and the slip springs home.
 * Heat: one animation-frame chain (spring.ts) runs only while a slip is thrown or springs back, then stops; the drag itself writes a
 * transform per pointer move (no loop, no React render). Reduced motion: slips go straight into their tray.
 */
type Side='kept'|'changed';
type Placed={id:string;side:Side;guess:Side;right:boolean};
const SPRING='linear(0, 0.007, 0.029 2.2%, 0.118 4.7%, 0.625 14.4%, 0.826 19%, 0.902, 0.962, 1.008 27.3%, 1.041 31.2%, 1.05 34.5%, 1.045 38.3%, 1.016 46.5%, 0.998 55.2%, 0.994 63.5%, 1.001 80%, 1)';
const truth=(c:SortCard):Side=>c.kept?'kept':'changed';

export default function Sorter({reduced,onSee,onDone}:{reduced:boolean;onSee:(thread:string,year:number)=>void;onDone?:()=>void}){
 const [placed,setPlaced]=useState<Placed[]>([]),[last,setLast]=useState<Placed|null>(null),[lean,setLean]=useState<Side|null>(null),[flying,setFlying]=useState(false);
 const top=useRef<HTMLDivElement>(null),bins={kept:useRef<HTMLUListElement>(null),changed:useRef<HTMLUListElement>(null)},anim=useRef<ReturnType<typeof loop>|null>(null);
 const timers=useRef<ReturnType<typeof setTimeout>[]>([]);
 useEffect(()=>()=>{anim.current?.stop();timers.current.forEach(clearTimeout);},[]);
 const left=SORT_CARDS.filter(c=>!placed.some(p=>p.id===c.id)),card=left[0],done=!card,right=placed.filter(p=>p.right).length;

 // ---- the slip's transform (written straight to the DOM) ----
 const pos=useRef({x:spring(),y:spring()});
 const paint=useCallback((x:number,y:number,shrink=0)=>{const el=top.current;if(!el)return;const w=el.offsetWidth||300;
  el.style.transform=`translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${(x/w*14).toFixed(2)}deg) scale(${(1-shrink*.72).toFixed(3)})`;el.style.opacity=String(1-shrink*.6);
  const l:Side|null=x<-w*.18?'changed':x>w*.18?'kept':null;setLean(o=>o===l?o:l);},[]);

 /** Put the current slip in a tray: the guess lands, and a wrong guess hops to the right tray a beat later. */
 const commit=useCallback((c:SortCard,guess:Side)=>{
  const ok=truth(c)===guess,p:Placed={id:c.id,side:guess,guess,right:ok};
  setPlaced(list=>[...list,p]);setLast(p);setLean(null);setFlying(false);pos.current={x:spring(),y:spring()};
  if(ok)museumSfx.stamp();else museumSfx.look();
  if(!ok)timers.current.push(setTimeout(()=>{setPlaced(list=>list.map(x=>x.id===c.id?{...x,side:truth(c)}:x));museumSfx.flapBook();},reduced?0:650));
 },[reduced]);

 /** Throw the slip into a tray: a spring toward the tray, seeded with the release velocity; it shrinks as it gets there. */
 const throwTo=useCallback((guess:Side,vx=0,vy=0)=>{const c=card,el=top.current,bin=bins[guess].current;if(!c||flying)return;
  if(reduced||!el||!bin){commit(c,guess);return;}
  setFlying(true);anim.current?.stop();
  const a=el.getBoundingClientRect(),b=bin.getBoundingClientRect(),P=pos.current;
  // Target: the tray's next chip slot, measured from where the slip sits untransformed (its rect minus the current offset).
  const ox=a.left+a.width/2-P.x.x,oy=a.top+a.height/2-P.y.x,tx=b.left+Math.min(b.width/2,90)-ox,ty=b.top+Math.min(b.height,40)/2+12-oy;
  P.x.target=tx;P.y.target=ty;P.x.v=vx;P.y.v=vy;const d0=Math.hypot(tx-P.x.x,ty-P.y.x)||1;
  anim.current=loop(dt=>{const rx=stepSpring(P.x,dt,190,22,.5),ry=stepSpring(P.y,dt,190,22,.5),d=Math.hypot(tx-P.x.x,ty-P.y.x);
   paint(P.x.x,P.y.x,Math.min(1,Math.max(0,1-d/d0)));
   if(d<14||(rx&&ry)){commit(c,guess);return false;}return true;});
 },[card,flying,reduced,commit,paint,bins.kept,bins.changed]);// eslint-disable-line react-hooks/exhaustive-deps

 /** Let go short of the line: the slip springs home, carrying its release velocity (it can overshoot a little). */
 const home=useCallback((vx=0,vy=0)=>{const P=pos.current;anim.current?.stop();P.x.target=0;P.y.target=0;P.x.v=vx;P.y.v=vy;
  if(reduced){P.x.x=P.y.x=0;paint(0,0);return;}
  anim.current=loop(dt=>{const a=stepSpring(P.x,dt,260,20,.3),b=stepSpring(P.y,dt,260,20,.3);paint(P.x.x,P.y.x);return !(a&&b);});},[paint,reduced]);

 // ---- drag ----
 const drag=useRef<{id:number;x0:number;y0:number;x:number;y:number;t:number;vx:number;vy:number}|null>(null);
 const down=(e:RPointerEvent<HTMLDivElement>)=>{if(flying||e.button>0)return;anim.current?.stop();const P=pos.current;
  drag.current={id:e.pointerId,x0:e.clientX-P.x.x,y0:e.clientY-P.y.x,x:e.clientX,y:e.clientY,t:e.timeStamp,vx:0,vy:0};e.currentTarget.setPointerCapture(e.pointerId);e.currentTarget.dataset.drag='';};
 const move=(e:RPointerEvent<HTMLDivElement>)=>{const d=drag.current;if(!d||d.id!==e.pointerId)return;const dt=Math.max(1,e.timeStamp-d.t);
  d.vx=d.vx*.5+(e.clientX-d.x)/dt*1000*.5;d.vy=d.vy*.5+(e.clientY-d.y)/dt*1000*.5;d.x=e.clientX;d.y=e.clientY;d.t=e.timeStamp;
  const P=pos.current;P.x.x=e.clientX-d.x0;P.y.x=rubber(e.clientY-d.y0,-6,6,46);paint(P.x.x,P.y.x);};
 const up=(e:RPointerEvent<HTMLDivElement>)=>{const d=drag.current;if(!d||d.id!==e.pointerId)return;drag.current=null;delete e.currentTarget.dataset.drag;
  const w=e.currentTarget.offsetWidth||300,x=pos.current.x.x,stale=e.timeStamp-d.t>90,vx=stale?0:d.vx,vy=stale?0:d.vy;
  // Past 30% of the slip's width, or a flick faster than 650 px/s that way: it goes. Otherwise it springs home.
  const go:Side|null=e.type==='pointercancel'?null:(x<-w*.3||vx<-650)&&x<20?'changed':(x>w*.3||vx>650)&&x>-20?'kept':null;
  if(go)throwTo(go,vx,vy);else home(vx,vy);};
 const key=(e:RKeyboardEvent<HTMLDivElement>)=>{if(e.key==='ArrowLeft'){e.preventDefault();throwTo('changed');}else if(e.key==='ArrowRight'){e.preventDefault();throwTo('kept');}};

 // ---- FLIP for the chips: when a chip changes tray (or a tray reflows), it glides from where it was to where it is now ----
 const rects=useRef(new Map<string,DOMRect>());
 useLayoutEffect(()=>{const next=new Map<string,DOMRect>();
  for(const side of ['kept','changed'] as const)bins[side].current?.querySelectorAll<HTMLElement>('[data-chip]').forEach(el=>{const id=el.dataset.chip!,r=el.getBoundingClientRect(),was=rects.current.get(id);next.set(id,r);
   if(reduced)return;
   if(!was){el.animate([{transform:'scale(.35)',opacity:0},{transform:'scale(1)',opacity:1}],{duration:520,easing:SPRING});return;}
   const dx=was.left-r.left,dy=was.top-r.top;if(Math.abs(dx)<1&&Math.abs(dy)<1)return;
   el.animate([{transform:`translate(${dx}px,${dy}px)`},{transform:`translate(${dx*.5}px,${dy*.5-26}px)`,offset:.45},{transform:'none'}],{duration:620,easing:'cubic-bezier(.3,.7,.3,1)'});});
  rects.current=next;});// eslint-disable-line react-hooks/exhaustive-deps

 // The top slip enters from the stack: a short rise (the slip behind it moves up a place by CSS transition).
 useLayoutEffect(()=>{const el=top.current;if(!el)return;el.style.transform='';el.style.opacity='';if(!reduced&&placed.length)el.animate([{transform:'translateY(10px) scale(.96)'},{transform:'none'}],{duration:420,easing:SPRING});},[card?.id]);// eslint-disable-line react-hooks/exhaustive-deps
 useEffect(()=>{if(done&&placed.length===SORT_CARDS.length){museumSfx.reveal();onDone?.();}},[done]);// eslint-disable-line react-hooks/exhaustive-deps

 const reset=()=>{setPlaced([]);setLast(null);rects.current.clear();};
 const lastCard=last&&SORT_CARDS.find(c=>c.id===last.id);
 const tray=(side:Side)=>placed.filter(p=>p.side===side).map(p=>{const c=SORT_CARDS.find(x=>x.id===p.id)!;
  return <li key={p.id} data-chip={p.id} className={s.chip} data-right={p.right||undefined} data-moving={p.side!==truth(c)||undefined}>
   <button type="button" onClick={()=>setLast(p)} aria-label={`${c.short}: ${c.kept?'still in force':'amended'}. You said ${p.guess==='kept'?'still in force':'amended'}${p.right?', right':', not quite'}. Read why.`}>
    <svg aria-hidden="true" viewBox="0 0 16 16"><path pathLength={1} d={p.right?'M3 8.5l3.2 3.2L13 4.5':'M4 4l8 8M12 4l-8 8'}/></svg>{c.short}</button></li>;});

 return <section className={s.sorter} aria-labelledby="sort-title" data-lean={lean||undefined} data-done={done||undefined}>
  <header className={s.sortHead}>
   <p className={s.sortKicker}>Guess first{!done&&<span className={s.sortCount}>{placed.length+1} of {SORT_CARDS.length}</span>}</p>
   <h2 id="sort-title" className={s.sortTitle}>Which 1863 rules are <em>still</em> in today’s Laws?</h2>
   {/* The verdict sits where the instructions were, so it is always in view (the space is reserved: nothing jumps). */}
   <div className={s.sortFeedback} aria-live="polite">{lastCard&&last?<p key={last.id+placed.length} data-right={last.right||undefined}>
    <b>{last.right?'Right!':'Not quite.'}</b> {lastCard.now}
    {lastCard.thread&&lastCard.year&&<> <button type="button" className={s.seeBtn} onClick={()=>onSee(lastCard.thread!,lastCard.year!)}>See it in the rulebook ↓</button></>}
   </p>:<p className={s.sortHelp}>Drag each card to a side, or press a button.</p>}</div>
  </header>
  <div className={s.table}>
   <div className={s.bin} data-side="changed" data-hot={lean==='changed'||undefined}>
    <button type="button" className={s.binBtn} disabled={done||flying} onClick={()=>throwTo('changed')} aria-label={card?`Amended: “${card.then}” has changed since 1863`:'Amended'}>
     <b><span aria-hidden="true">← </span>Amended</b><small>changed since 1863</small></button>
    <ul ref={bins.changed} className={s.tray} aria-label="Amended rules">{tray('changed')}</ul>
   </div>
   <div className={s.stack}>
    {done?<div className={s.sortDone} role="status">
     <span className={s.sortSeal} aria-hidden="true"><svg viewBox="0 0 80 80"><path pathLength={1} d="M40 6a34 34 0 1 1-.1 0"/></svg><b>{right}/{SORT_CARDS.length}</b>right</span>
     <p className={s.sortVerdict}>{sortVerdict(right,SORT_CARDS.length)}</p>
     <p className={s.sortTake}>{SORT_CARDS.filter(c=>c.kept).length} of these {SORT_CARDS.length} rules from 1863 are still in today’s Laws. The others changed to make the game fairer and more fun.</p>
     <button type="button" className={s.sortAgain} onClick={reset}>Sort again</button>
    </div>:<>
     {left.slice(1,3).reverse().map((c,k,a)=><div key={c.id} className={s.slip} data-depth={a.length-k} aria-hidden="true"/>)}
     <div key={card.id} ref={top} className={s.slip} data-top tabIndex={0} role="group" aria-roledescription="card" aria-label={`1863, ${card.law}: ${card.then} Is it still in force today? Left arrow: amended. Right arrow: still in force.`}
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onKeyDown={key}>
      <span className={s.slipLaw}>{card.law} · 1863</span>
      {CARD_STORY[card.id]&&<LineMorph className={s.slipFig} vb={CARD_VB} drawing={CARD_STORY[card.id][0]} then={CARD_STORY[card.id][1]} thenAfter={1100} reduced={reduced}/>}
      <p className={s.slipText}>{card.then}</p>
      {/* The verdict marks draw themselves as the card leans: a tick for "still in force", a turning arrow for "amended". */}
      <span className={s.mark} data-side="changed" aria-hidden="true"><svg viewBox="0 0 28 24"><path pathLength={1} d="M4 19C9 9 15 6 23 6M18 2.5l5.5 3.5-4 5"/></svg>Amended</span>
      <span className={s.mark} data-side="kept" aria-hidden="true"><svg viewBox="0 0 28 24"><path pathLength={1} d="M4 13l6.5 6.5L24 5"/></svg>Still in force</span>
      {placed.length===0&&<span className={s.slipHint} aria-hidden="true"><i>←</i> drag me <i>→</i></span>}
     </div>
    </>}
   </div>
   <div className={s.bin} data-side="kept" data-hot={lean==='kept'||undefined}>
    <button type="button" className={s.binBtn} disabled={done||flying} onClick={()=>throwTo('kept')} aria-label={card?`Still in force: “${card.then}” is still a rule today`:'Still in force'}>
     <b>Still in force<span aria-hidden="true"> →</span></b><small>in today’s Laws</small></button>
    <ul ref={bins.kept} className={s.tray} aria-label="Rules still in force">{tray('kept')}</ul>
   </div>
  </div>
 </section>;
}
