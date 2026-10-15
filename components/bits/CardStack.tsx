'use client';
/**
 * CardStack. Adapted from React Bits "Card Swap" and "Stack" by David Haz (https://reactbits.dev/components/card-swap,
 * https://reactbits.dev/components/stack, https://github.com/DavidHDev/react-bits). MIT + Commons Clause,
 * Copyright (c) 2026 David Haz: see components/bits/LICENSE-react-bits.md and docs/third-party.md.
 *
 * Futbol Island adaptation (Oct 10 2026, first client: the card-pack reveal):
 *  - A real deck: the top card plus up to `visible - 1` cards fanned behind it, and the card just dealt kept for its exit.
 *  - Swipe / fling the top card left for the next card, right for the previous one; tap it (or use the host's buttons/keys).
 *  - No autoplay, no timers, no animation loop: every move is a CSS transform/opacity transition, and a drag writes the top card's
 *    transform straight from pointermove. 0 rAF, at rest and in motion. No motion/gsap/@hugeicons dependency.
 *  - prefers-reduced-motion: instant moves (no fan tilt, no fly-out).
 *  - Accessible: the top card is a real button (Enter/Space), the cards behind are aria-hidden, optional Left/Right keys.
 */
import {useRef,type CSSProperties,type KeyboardEvent,type PointerEvent,type ReactNode} from 'react';
import styles from './CardStack.module.css';

export type CardStackProps={
 count:number;
 index:number;
 onIndexChange:(index:number)=>void;
 /** Draws card i. `top` is true for the card on top. */
 renderCard:(index:number,top:boolean)=>ReactNode;
 /** Group label, e.g. "Your card pack". */
 label:string;
 /** Button label for the top card. */
 topLabel?:(index:number)=>string;
 /** Tap / Enter / Space on the top card (default: next card). */
 onTapTop?:()=>void;
 visible?:number;
 /** Handle Left/Right on the stack itself (off when the host already handles them). */
 keyboard?:boolean;
 threshold?:number;
 className?:string;
 style?:CSSProperties;
};

/** Where a card sits at depth d (0 = top, >0 behind, <0 dealt). Exported for tests. */
export function stackPose(depth:number,exitDir:number){
 if(depth===0)return {transform:'none',opacity:1};
 if(depth<0)return {transform:`translate3d(${exitDir*125}%,-6%,0) rotate(${exitDir*16}deg)`,opacity:0};
 const tilt=(depth%2?1:-1)*(1.6+depth*1.2);
 return {transform:`translate3d(${depth*7}px,${depth*9}px,0) scale(${(1-depth*0.05).toFixed(3)}) rotate(${tilt.toFixed(1)}deg)`,opacity:depth<3?1:0};
}

export default function CardStack({count,index,onIndexChange,renderCard,label,topLabel,onTapTop,visible=3,keyboard=true,threshold=70,className='',style}:CardStackProps){
 const exitDir=useRef<Record<number,number>>({}),drag=useRef<{id:number;x:number;y:number;on:boolean;t:number;dx:number;lx:number;lt:number}|null>(null),swiped=useRef(false);
 const go=(next:number,dir:number)=>{if(next<0||next>=count)return false;if(next>index)exitDir.current[index]=dir;onIndexChange(next);return true;};
 const first=Math.max(0,index-1),last=Math.min(count-1,index+visible-1);
 const ids:number[]=[];for(let i=last;i>=first;i--)ids.push(i);// back to front

 const onDown=(e:PointerEvent<HTMLButtonElement>)=>{if(e.button!==0)return;swiped.current=false;drag.current={id:e.pointerId,x:e.clientX,y:e.clientY,on:false,t:e.timeStamp,dx:0,lx:e.clientX,lt:e.timeStamp};};
 const onMove=(e:PointerEvent<HTMLButtonElement>)=>{
  const d=drag.current;if(!d||d.id!==e.pointerId)return;
  const dx=e.clientX-d.x,dy=e.clientY-d.y;
  if(!d.on){if(Math.abs(dy)>12&&Math.abs(dy)>Math.abs(dx)){drag.current=null;return;}if(Math.abs(dx)<6)return;
   d.on=true;e.currentTarget.setPointerCapture(e.pointerId);e.currentTarget.dataset.dragging='true';}
  d.dx=dx;if(e.timeStamp-d.lt>24){d.lx=e.clientX;d.lt=e.timeStamp;}
  e.currentTarget.style.transform=`translate3d(${dx}px,${dy*0.15}px,0) rotate(${(dx*0.06).toFixed(2)}deg)`;
 };
 const onUp=(e:PointerEvent<HTMLButtonElement>)=>{
  const d=drag.current;if(!d||d.id!==e.pointerId)return;drag.current=null;
  const el=e.currentTarget;delete el.dataset.dragging;if(el.hasPointerCapture(e.pointerId))el.releasePointerCapture(e.pointerId);
  if(!d.on)return;
  swiped.current=true;
  const v=(e.clientX-d.lx)/Math.max(1,e.timeStamp-d.lt);// px/ms over the last moment
  const fling=e.type!=='pointercancel'&&(Math.abs(d.dx)>threshold||Math.abs(v)>0.55);
  const moved=fling&&(d.dx<0?go(index+1,-1):go(index-1,1));
  if(!moved)el.style.transform='none';// spring back (React's own value is already 'none')
 };
 const onKeyDown=(e:KeyboardEvent<HTMLDivElement>)=>{
  if(!keyboard)return;
  if(e.key==='ArrowRight'){e.preventDefault();go(index+1,-1);}else if(e.key==='ArrowLeft'){e.preventDefault();go(index-1,1);}
 };

 return <div className={`${styles.stack} ${className}`} style={style} role="group" aria-roledescription="card stack" aria-label={label} onKeyDown={onKeyDown} data-card-stack>
  {ids.map(i=>{
   const depth=i-index,pose=stackPose(depth,exitDir.current[i]??-1),top=depth===0;
   const cardStyle={transform:pose.transform,opacity:pose.opacity,zIndex:depth<0?50:30-depth} as CSSProperties;
   // One element type for every depth, so a card keeps its DOM node (and its transition) as it moves up, out and back.
   return <button key={i} type="button" className={`${styles.card} ${top?styles.top:''}`} style={cardStyle} data-stack-index={i} data-depth={depth}
    tabIndex={top?0:-1} aria-hidden={top?undefined:true} aria-label={top?(topLabel?.(i)??`Card ${i+1} of ${count}`):undefined}
    onPointerDown={top?onDown:undefined} onPointerMove={top?onMove:undefined} onPointerUp={top?onUp:undefined} onPointerCancel={top?onUp:undefined}
    onClick={top?()=>{if(swiped.current){swiped.current=false;return;}if(onTapTop)onTapTop();else go(index+1,-1);}:undefined}>
    {renderCard(i,top)}
   </button>;
  })}
 </div>;
}
