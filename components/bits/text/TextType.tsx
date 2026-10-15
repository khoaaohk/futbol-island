'use client';
/**
 * TextType. Adapted from React Bits "Text Type" by David Haz (https://reactbits.dev/text-animations/text-type).
 * MIT + Commons Clause, Copyright (c) 2026 David Haz: components/bits/LICENSE-react-bits.md, docs/third-party.md.
 * Futbol Island: no gsap. Types the text (or each sentence in turn, deleting between them) once, then stops on the last
 * sentence; no loop. The caret blinks a few times while typing and fades out after. A bounded setTimeout chain, no rAF.
 * For the Telstar TV caption and the time-wasting commentary. Reduced motion: the last sentence at once.
 */
import {useEffect,useRef,useState,type CSSProperties,type ElementType} from 'react';
import {SrText,useTextShot,type TextShotProps} from './shared';
import s from './text.module.css';

export type TextTypeProps=TextShotProps&{text:string|string[];as?:ElementType;/** ms per letter */speed?:number;deleteSpeed?:number;
 /** Hold between sentences. */pause?:number;startDelay?:number;caret?:boolean};

/** Total ms of one play (for tests and for hosts that sequence things after it). */
export function typeDuration(sentences:string[],{speed=38,deleteSpeed=16,pause=900,startDelay=0}={}){
 return startDelay+sentences.reduce((t,s,i)=>t+s.length*speed+(i<sentences.length-1?pause+s.length*deleteSpeed:0),0);
}

export default function TextType({text,as:Tag='span',speed=38,deleteSpeed=16,pause=900,startDelay=0,caret=true,className='',...shot}:TextTypeProps){
 const ref=useRef<HTMLElement>(null),list=Array.isArray(text)?text:[text],final=list[list.length-1]??'';
 const {state,run,reduced,timers}=useTextShot(ref,shot,typeDuration(list,{speed,deleteSpeed,pause,startDelay})+60);
 const [shown,setShown]=useState('');
 useEffect(()=>{
  if(reduced){setShown(final);return;}
  if(!run)return;
  setShown('');let si=0,ci=0,deleting=false;
  const tick=()=>{
   const sentence=list[si];
   if(!deleting){ci++;setShown(sentence.slice(0,ci));
    if(ci<sentence.length){timers.after(speed,tick);return;}
    if(si<list.length-1){deleting=true;timers.after(pause,tick);}return;}
   ci--;setShown(sentence.slice(0,ci));
   if(ci>0){timers.after(deleteSpeed,tick);return;}
   deleting=false;si++;timers.after(speed*3,tick);
  };
  timers.after(startDelay+speed,tick);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[run,reduced]);
 return <Tag ref={ref} className={`${s.type} ${className}`} data-state={state} style={{'--t-blinks':Math.max(2,Math.round(typeDuration(list,{speed,deleteSpeed,pause,startDelay})/530))} as CSSProperties}>
  <SrText>{list.join(' ')}</SrText>
  <span aria-hidden="true">{shown}{caret&&<span className={s.caret}/>}</span>
 </Tag>;
}
