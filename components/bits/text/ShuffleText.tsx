'use client';
/**
 * ShuffleText. Adapted from React Bits "Shuffle" by David Haz (https://reactbits.dev/text-animations/shuffle).
 * MIT + Commons Clause, Copyright (c) 2026 David Haz: components/bits/LICENSE-react-bits.md, docs/third-party.md.
 * Futbol Island: no gsap / SplitText / ScrambleText plugins. Every letter is a short reel of random letters that spins down and
 * lands on the real one, staggered, once per play (a CSS transform). For penalty results (GOAL / SAVED / MISSED): pass
 * trigger="manual" and play={result}. Reduced motion: the word at once.
 */
import {useRef,type CSSProperties,type ElementType} from 'react';
import {SrText,UPPER,seeded,useTextShot,type TextShotProps} from './shared';
import s from './text.module.css';

export type ShuffleTextProps=TextShotProps&{text:string;as?:ElementType;/** Random letters before each lands. */shuffles?:number;duration?:number;stagger?:number;
 direction?:'up'|'down';charset?:string};

/** The reel for one letter: `shuffles` random letters, then the real one. Exported for tests. */
export function reelFor(ch:string,shuffles:number,rand:()=>number,charset=UPPER){
 if(/\s/.test(ch))return [ch];
 return [...Array.from({length:shuffles},()=>charset[Math.floor(rand()*charset.length)]),ch];
}

export default function ShuffleText({text,as:Tag='span',shuffles=5,duration=620,stagger=40,direction='up',charset=UPPER,className='',...shot}:ShuffleTextProps){
 const ref=useRef<HTMLElement>(null),letters=Array.from(text);
 const {state,run}=useTextShot(ref,shot,duration+stagger*Math.max(0,letters.length-1)+40);
 const rand=seeded(run*977+text.length);
 return <Tag ref={ref} className={`${s.shuffle} ${className}`} data-state={state} data-dir={direction} style={{'--t-dur':`${duration}ms`,'--t-step':`${stagger}ms`} as CSSProperties}>
  <SrText>{text}</SrText>
  <span key={run} aria-hidden="true">{letters.map((ch,i)=>{const reel=reelFor(ch,state==='done'?0:shuffles,rand,charset);
   return reel.length===1?<span key={i} className={s.cell}>{ch===' '?' ':ch}</span>
    :<span key={i} className={s.cell}><span className={s.reel} style={{'--i':i,'--n':reel.length-1} as CSSProperties}>{(direction==='up'?reel:[...reel].reverse()).map((c,k)=><span key={k}>{c}</span>)}</span></span>;})}</span>
 </Tag>;
}
