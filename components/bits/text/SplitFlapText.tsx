'use client';
/**
 * SplitFlapText. Adapted from React Bits "Split Flap Text" by David Haz (https://reactbits.dev/text-animations/split-flap-text).
 * MIT + Commons Clause, Copyright (c) 2026 David Haz: components/bits/LICENSE-react-bits.md, docs/third-party.md.
 * Futbol Island: a departures board / scoreboard. Each tile flips through a few characters and lands, left to right, once per
 * play (no cycling, no loop option). A bounded setTimeout chain drives the ticks; each flip is a CSS rotateX. Changing `text`
 * flips from the old text to the new one (a scoreboard update). Reduced motion: the new text at once.
 */
import {useEffect,useRef,useState,type CSSProperties,type ElementType} from 'react';
import {DIGITS,SrText,UPPER,seeded,useTextShot,type TextShotProps} from './shared';
import s from './text.module.css';

export type SplitFlapTextProps=TextShotProps&{text:string;as?:ElementType;/** Characters a tile flips through. */charset?:string;
 /** Flips per tile before it lands. */flips?:number;/** ms per flip. */interval?:number;/** Ticks between neighbouring tiles. */stagger?:number;
 /** Pad with spaces to a fixed width (a board). */padTo?:number};

/** The frames of one play: frames[k][i] is tile i at tick k; the last frame is the target. Exported for tests. */
export function flapFrames(from:string,to:string,{charset=UPPER+DIGITS,flips=5,stagger=1,seed=1}:{charset?:string;flips?:number;stagger?:number;seed?:number}={}){
 const len=Math.max(from.length,to.length),src=from.padEnd(len),dst=to.padEnd(len),rand=seeded(seed),frames:string[][]=[];
 const ticks=(len-1)*stagger+flips+1;
 const noise=Array.from({length:len},()=>Array.from({length:flips},()=>charset[Math.floor(rand()*charset.length)]));
 for(let k=0;k<=ticks;k++)frames.push(Array.from({length:len},(_,i)=>{const t=k-i*stagger;if(src[i]===dst[i])return dst[i];if(t<0)return src[i];if(t>=flips)return dst[i];return dst[i]===' '&&t===flips-1?' ':noise[i][t];}));
 return frames;
}

export default function SplitFlapText({text,as:Tag='span',charset=UPPER+DIGITS,flips=5,interval=60,stagger=1,padTo,className='',trigger='view',play,onDone}:SplitFlapTextProps){
 const target=(padTo?text.padEnd(padTo):text).toUpperCase();
 const ref=useRef<HTMLElement>(null),prev=useRef(target.replace(/\S/g,' ')),[tiles,setTiles]=useState<string[]>(()=>Array.from(prev.current));
 const frames=useRef<string[][]>([]);
 // A changed text replays (manual boards pass play={text}); view/mount play the first time.
 const {state,run,reduced,timers}=useTextShot(ref,{trigger,play:trigger==='manual'?play:target},0);
 useEffect(()=>{
  if(reduced){setTiles(Array.from(target));prev.current=target;return;}
  if(!run)return;
  frames.current=flapFrames(prev.current,target,{charset,flips,stagger,seed:run*7919+target.length});prev.current=target;
  let k=0;const tick=()=>{setTiles(frames.current[k]);k++;if(k<frames.current.length)timers.after(interval,tick);else onDone?.();};
  timers.clear();tick();
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[run,reduced]);
 return <Tag ref={ref} className={`${s.flap} ${className}`} data-state={state} style={{'--t-flip':`${Math.round(interval*1.6)}ms`} as CSSProperties}>
  <SrText>{text}</SrText>
  <span aria-hidden="true" className={s.flapRow}>{tiles.map((ch,i)=><span key={i} className={s.tile} data-space={ch===' '||undefined}><span key={ch} className={s.glyph}>{ch===' '?' ':ch}</span></span>)}</span>
 </Tag>;
}
