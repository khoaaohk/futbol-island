'use client';
import {useEffect,useRef,useState} from 'react';
import type {CardDeckWords,CardOffence} from '@/lib/site/cardRules';
import {fill} from '@/lib/site/refCall';
import CardIconSvg from './CardIcons';
import s from './cardDeck.module.css';
/**
 * The swipeable info deck (cards page, Nov 16 2026; reusable for any list of cards with a front and a back). The server renders
 * every card as a plain list item with ALL its words (name, explanation, example, what happens next), so search engines,
 * screen readers without the deck, no-JavaScript visitors and print all get the full list. After hydration the same list
 * becomes a deck: one card at a time, flip with a tap / Enter / Space (the Flip button), swipe left or right (pointer events,
 * a quick flick counts), the arrow buttons or the keyboard's left / right arrows, position dots and a polite live region
 * ("Card 3 of 14"). Reduced motion: no flip turn and no slide travel, a short cross-fade instead (cardDeck.module.css).
 * No timers, no scroll listeners, nothing stored or sent.
 */
const FLICK=.35;/* px per ms: a quick flick turns the card even when the drag is short */
export default function CardDeck({id,cards,words}:{id:string;cards:readonly CardOffence[];words:CardDeckWords}){
 const [ready,setReady]=useState(false);
 const [index,setIndex]=useState(0);
 const [flipped,setFlipped]=useState<ReadonlySet<number>>(()=>new Set());
 const [dx,setDx]=useState(0);
 const drag=useRef<{x:number;y:number;t:number;lastX:number;lastT:number;v:number;on:boolean;pid:number}|null>(null);
 const moved=useRef(false),viewport=useRef<HTMLDivElement>(null),track=useRef<HTMLOListElement>(null),keyMove=useRef(false);
 useEffect(()=>{setReady(true);},[]);
 const total=cards.length;
 const go=(n:number,fromKey=false)=>{const k=Math.max(0,Math.min(total-1,n));keyMove.current=fromKey;setIndex(k);};
 /* After the arrows move the deck, keep keyboard focus on the new card's Flip button (the old card becomes inert). */
 useEffect(()=>{if(!ready||!keyMove.current)return;keyMove.current=false;
  track.current?.querySelector<HTMLButtonElement>(`[data-slide="${index}"] button`)?.focus({preventScroll:true});},[index,ready]);
 const flip=(i:number)=>setFlipped(f=>{const n=new Set(f);if(n.has(i))n.delete(i);else n.add(i);return n;});
 const onDown=(e:React.PointerEvent)=>{if(e.pointerType==='mouse'&&e.button!==0)return;
  drag.current={x:e.clientX,y:e.clientY,t:e.timeStamp,lastX:e.clientX,lastT:e.timeStamp,v:0,on:false,pid:e.pointerId};moved.current=false;};
 const onMove=(e:React.PointerEvent)=>{const d=drag.current;if(!d||d.pid!==e.pointerId)return;
  const ddx=e.clientX-d.x,ddy=e.clientY-d.y;
  if(!d.on){if(Math.abs(ddx)<10)return;if(Math.abs(ddy)>Math.abs(ddx)){drag.current=null;return;}/* a vertical move is a page scroll */
   d.on=true;moved.current=true;viewport.current?.setPointerCapture(e.pointerId);}
  const dt=Math.max(1,e.timeStamp-d.lastT);d.v=(e.clientX-d.lastX)/dt;d.lastX=e.clientX;d.lastT=e.timeStamp;
  const edge=(index===0&&ddx>0)||(index===total-1&&ddx<0);setDx(edge?ddx/3:ddx);};/* rubber band at the ends */
 const onUp=(e:React.PointerEvent)=>{const d=drag.current;drag.current=null;if(!d||!d.on){setDx(0);return;}
  const w=viewport.current?.clientWidth??320,ddx=e.clientX-d.x;
  if(ddx<-w*.22||d.v<-FLICK)go(index+1);else if(ddx>w*.22||d.v>FLICK)go(index-1);
  setDx(0);};
 const onKey=(e:React.KeyboardEvent)=>{if(e.key==='ArrowRight'){e.preventDefault();go(index+1,true);}else if(e.key==='ArrowLeft'){e.preventDefault();go(index-1,true);}};
 const pos=(n:number)=>fill(words.position,{n,total});
 const kind=(c:CardOffence)=>c.color==='red'?words.red:words.yellow;
 return <div className={s.deck} data-card-deck="" data-playbar-hide="" data-ready={ready?'':undefined} role="region" aria-roledescription="carousel" aria-label={words.label} onKeyDown={ready?onKey:undefined}>
  {ready&&<p className={s.how} id={`${id}-how`}>{words.how}</p>}
  <div ref={viewport} className={s.viewport} onPointerDown={ready?onDown:undefined} onPointerMove={ready?onMove:undefined} onPointerUp={ready?onUp:undefined} onPointerCancel={ready?onUp:undefined}
   onClickCapture={e=>{if(moved.current){e.preventDefault();e.stopPropagation();moved.current=false;}}}>
   <ol ref={track} className={s.track} data-dragging={dx!==0?'':undefined} style={ready?{transform:`translate3d(calc(${-index*100}% + ${dx}px),0,0)`}:undefined}>
    {cards.map((c,i)=>{const hide=ready&&i!==index,on=flipped.has(i),back=`${id}-back-${i}`;
     return <li key={c.id} className={s.slide} data-slide={i} data-current={ready&&i===index?'':undefined} role="group" aria-roledescription="card" aria-label={`${pos(i+1)}: ${kind(c)}, ${c.name}`}
      aria-hidden={hide||undefined} {...(hide?{inert:''} as Record<string,string>:{})}>
      <div className={s.card} data-color={c.color} data-flipped={on?'':undefined} onClick={ready?()=>flip(i):undefined}>
       <div className={s.front} aria-hidden={ready&&on?true:undefined}>
        <span className={s.kind}>{kind(c)}</span>
        <div className={s.face}><CardIconSvg icon={c.icon} className={s.icon}/><h3 className={s.name}>{c.name}</h3></div>
       </div>
       <div className={s.back} id={back} aria-hidden={ready&&!on?true:undefined}>
        <p className={s.backName}>{c.name}</p>
        <p>{c.explain}</p>
        <p><b>{words.example}:</b> {c.example}</p>
        <p><b>{words.then}:</b> {c.next}</p>
       </div>
       {ready&&<button type="button" className={s.flip} aria-pressed={on} aria-controls={back} onClick={e=>{e.stopPropagation();flip(i);}}>{on?words.flipBack:words.flip}<span className={s.sr}>: {c.name}</span></button>}
      </div>
     </li>;})}
   </ol>
  </div>
  {ready&&<div className={s.controls}>
   <button type="button" className={s.arrow} onClick={()=>go(index-1)} disabled={index===0} aria-label={words.prev}><span aria-hidden="true">←</span></button>
   <div className={s.dots} aria-hidden="true">{cards.map((c,i)=><span key={c.id} className={s.dot} data-color={c.color} data-on={i===index?'':undefined}/>)}</div>
   <button type="button" className={s.arrow} onClick={()=>go(index+1)} disabled={index===total-1} aria-label={words.next}><span aria-hidden="true">→</span></button>
  </div>}
  {ready&&<p className={s.status} aria-live="polite" aria-atomic="true">{pos(index+1)}: {cards[index].name}</p>}
 </div>;
}
