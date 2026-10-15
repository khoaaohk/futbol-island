'use client';
/**
 * RotatingText. Adapted from React Bits "Rotating Text" by David Haz (https://reactbits.dev/text-animations/rotating-text).
 * MIT + Commons Clause, Copyright (c) 2026 David Haz: components/bits/LICENSE-react-bits.md, docs/third-party.md.
 * Futbol Island: no motion/react. The word changes when the host changes `index` (an event), or with `auto` it steps through
 * the list `passes` times and stops on the last word (No card → Yellow → Red). The old word slides out, the new one's letters
 * slide in with a stagger (CSS). Reduced motion: the word swaps at once (auto jumps to the last word).
 */
import {useEffect,useRef,useState,type CSSProperties,type ElementType} from 'react';
import {SR_ONLY,useOneShot,useReducedMotion,useTimers,type Trigger} from '../motion';
import s from './text.module.css';

export type RotatingTextProps={texts:string[];/** Controlled word. */index?:number;/** Step through once (or `passes` times) and stop on the last word. */auto?:boolean;
 interval?:number;passes?:number;trigger?:Trigger;play?:unknown;stagger?:number;as?:ElementType;className?:string;
 /** Class per word, e.g. the card colour. */wordClassName?:(index:number)=>string|undefined;onChange?:(index:number)=>void;live?:boolean};

/** The indices auto mode shows, in order, ending on the last word. Exported for tests. */
export const autoSequence=(n:number,passes=1)=>{const out:number[]=[];for(let p=0;p<Math.max(1,passes);p++)for(let i=0;i<n;i++)out.push(i);return out;};

export default function RotatingText({texts,index,auto=false,interval=1300,passes=1,trigger='view',play,stagger=28,as:Tag='span',className='',wordClassName,onChange,live=false}:RotatingTextProps){
 const ref=useRef<HTMLElement>(null),reduced=useReducedMotion(),timers=useTimers();
 const [own,setOwn]=useState(0),[prev,setPrev]=useState<number|null>(null);
 const current=index??own,last=useRef(current);
 const run=useOneShot(ref,{trigger,play});
 const change=useRef(onChange);change.current=onChange;
 useEffect(()=>{
  if(!auto||!run)return;
  timers.clear();
  if(reduced){setOwn(texts.length-1);return;}
  const seq=autoSequence(texts.length,passes);let k=0;setOwn(seq[0]);
  const step=()=>{k++;if(k>=seq.length)return;setOwn(seq[k]);timers.after(interval,step);};
  timers.after(interval,step);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[auto,run,reduced]);
 useEffect(()=>{
  if(current===last.current)return;
  const before=last.current;last.current=current;change.current?.(current);
  if(reduced)return;
  setPrev(before);timers.after(420,()=>setPrev(p=>p===before?null:p));
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[current]);
 const word=texts[current]??'';
 return <Tag ref={ref} className={`${s.rotate} ${className}`} aria-live={live?'polite':undefined}>
  <span style={SR_ONLY}>{word}</span>
  <span aria-hidden="true" className={s.rotateStage}>
   {prev!==null&&prev!==current&&<span key={`out-${prev}-${current}`} className={`${s.rotateWord} ${s.rotateOut} ${wordClassName?.(prev)??''}`}>{texts[prev]}</span>}
   <span key={`in-${current}`} className={`${s.rotateWord} ${prev!==null?s.rotateIn:''} ${wordClassName?.(current)??''}`}>
    {Array.from(word).map((ch,i)=><span key={i} className={s.rotateChar} style={{'--i':i,'--t-step':`${stagger}ms`} as CSSProperties}>{ch===' '?' ':ch}</span>)}
   </span>
  </span>
 </Tag>;
}
