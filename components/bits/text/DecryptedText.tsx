'use client';
/**
 * DecryptedText. Adapted from React Bits "Decrypted Text" by David Haz (https://reactbits.dev/text-animations/decrypted-text).
 * MIT + Commons Clause, Copyright (c) 2026 David Haz: components/bits/LICENSE-react-bits.md, docs/third-party.md.
 * Futbol Island: no motion/react, no hover modes. Scrambled letters resolve in order (start / end / centre) over a bounded
 * number of ticks (about `maxMs`), once per play. For VAR "Checking…" and Telstar TV tuning. Reduced motion: the real text.
 */
import {useEffect,useRef,useState,type ElementType} from 'react';
import {SrText,UPPER,seeded,useTextShot,type TextShotProps} from './shared';
import s from './text.module.css';

export type DecryptedTextProps=TextShotProps&{text:string;as?:ElementType;/** ms per tick */speed?:number;/** Upper bound for one play. */maxMs?:number;
 revealDirection?:'start'|'end'|'center';characters?:string};

/** Reveal order of the character positions. Exported for tests. */
export function revealOrder(len:number,dir:'start'|'end'|'center'){
 const idx=Array.from({length:len},(_,i)=>i);
 if(dir==='end')return idx.reverse();
 if(dir==='center'){const mid=(len-1)/2;return idx.sort((a,b)=>Math.abs(a-mid)-Math.abs(b-mid)||a-b);}
 return idx;
}

export default function DecryptedText({text,as:Tag='span',speed=45,maxMs=1300,revealDirection='start',characters=UPPER+'0123456789#%&',className='',...shot}:DecryptedTextProps){
 const ref=useRef<HTMLElement>(null);
 const letters=Array.from(text),order=revealOrder(letters.length,revealDirection);
 const ticks=Math.max(1,Math.min(letters.length,Math.floor(maxMs/speed))),perTick=Math.ceil(letters.length/ticks);
 const {state,run,reduced,timers}=useTextShot(ref,shot,(ticks+1)*speed);
 const scramble=(revealed:Set<number>,seed:number)=>{const r=seeded(seed);return letters.map((ch,i)=>revealed.has(i)||/\s/.test(ch)?ch:characters[Math.floor(r()*characters.length)]).join('');};
 const [shown,setShown]=useState(()=>scramble(new Set(),1));
 useEffect(()=>{
  if(reduced){setShown(text);return;}
  if(!run)return;
  const revealed=new Set<number>();let k=0;
  const tick=()=>{order.slice(k*perTick,(k+1)*perTick).forEach(i=>revealed.add(i));k++;setShown(scramble(revealed,run*131+k));if(revealed.size<letters.length)timers.after(speed,tick);};
  setShown(scramble(revealed,run*131));timers.after(speed,tick);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[run,reduced,text]);
 return <Tag ref={ref} className={`${s.decrypt} ${className}`} data-state={state}>
  <SrText>{text}</SrText>
  <span aria-hidden="true">{Array.from(shown).map((ch,i)=><span key={i} data-scrambled={ch!==letters[i]||undefined}>{ch}</span>)}</span>
 </Tag>;
}
