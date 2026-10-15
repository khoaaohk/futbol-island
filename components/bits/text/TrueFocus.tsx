'use client';
/**
 * TrueFocus. Adapted from React Bits "True Focus" by David Haz (https://reactbits.dev/text-animations/true-focus).
 * MIT + Commons Clause, Copyright (c) 2026 David Haz: components/bits/LICENSE-react-bits.md, docs/third-party.md.
 * Futbol Island: no motion/react and no endless cycle. A corner-bracket frame moves to the focused word while the other words
 * soften. The host sets `index` (e.g. each VAR replay step), or `auto` steps through the words once and rests on the last.
 * One transition per change; nothing runs at rest. Reduced motion: the frame jumps, no blur.
 */
import {useEffect,useLayoutEffect,useRef,useState,type CSSProperties,type ElementType} from 'react';
import {SrText,useTextShot,type TextShotProps} from './shared';
import s from './text.module.css';

export type TrueFocusProps=TextShotProps&{words:string[];as?:ElementType;/** Controlled focused word. */index?:number;auto?:boolean;interval?:number;
 /** px of blur on the other words (0 for none). */blur?:number;/** Frame colour (CSS colour). */accent?:string};

export default function TrueFocus({words,as:Tag='span',index,auto=false,interval=900,blur=2,accent='currentColor',className='',...shot}:TrueFocusProps){
 const ref=useRef<HTMLElement>(null),wordEls=useRef<(HTMLSpanElement|null)[]>([]);
 const {run,reduced,timers}=useTextShot(ref,shot,auto?interval*words.length:0);
 const [own,setOwn]=useState(0),[box,setBox]=useState<{x:number;y:number;w:number;h:number}|null>(null);
 const current=Math.max(0,Math.min(words.length-1,index??own));
 useEffect(()=>{
  if(!auto||!run)return;
  if(reduced){setOwn(words.length-1);return;}
  let k=0;setOwn(0);const step=()=>{k++;if(k>=words.length)return;setOwn(k);timers.after(interval,step);};timers.after(interval,step);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[auto,run,reduced]);
 useLayoutEffect(()=>{const el=wordEls.current[current];if(el)setBox({x:el.offsetLeft,y:el.offsetTop,w:el.offsetWidth,h:el.offsetHeight});},[current,words.join(' ')]);
 return <Tag ref={ref} className={`${s.focus} ${className}`} data-reduced={reduced||undefined} style={{'--t-blur':`${blur}px`,'--t-accent':accent} as CSSProperties}>
  <SrText>{words.join(' ')}</SrText>
  <span aria-hidden="true" className={s.focusBody}>
   {words.map((w,i)=><span key={i}>{i>0&&' '}<span ref={el=>{wordEls.current[i]=el;}} className={s.focusWord} data-focused={i===current||undefined}>{w}</span></span>)}
   {box&&<span className={s.focusFrame} style={{transform:`translate3d(${box.x-6}px,${box.y-4}px,0)`,width:box.w+12,height:box.h+8}}><i/><i/><i/><i/></span>}
  </span>
 </Tag>;
}
