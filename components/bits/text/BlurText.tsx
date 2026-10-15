'use client';
/**
 * BlurText. Adapted from React Bits "Blur Text" (and the "Scroll Reveal" idea) by David Haz (https://reactbits.dev/text-animations/blur-text).
 * MIT + Commons Clause, Copyright (c) 2026 David Haz: components/bits/LICENSE-react-bits.md, docs/third-party.md.
 * Futbol Island: CSS one-shot (no motion/react, no gsap). Words or letters rise in and un-blur with a stagger, once.
 * For wall labels and story beats. Reduced motion: the text is simply there.
 */
import {useRef,type CSSProperties,type ElementType} from 'react';
import {SrText,useTextShot,words,type TextShotProps} from './shared';
import s from './text.module.css';

export type BlurTextProps=TextShotProps&{text:string;as?:ElementType;by?:'words'|'letters';/** ms between parts */stagger?:number;duration?:number;blur?:boolean;direction?:'up'|'down'};

export default function BlurText({text,as:Tag='span',by='words',stagger=70,duration=600,blur=true,direction='up',className='',...shot}:BlurTextProps){
 const ref=useRef<HTMLElement>(null);
 const parts=by==='letters'?Array.from(text):words(text);
 const animated=parts.filter(p=>!/^\s+$/.test(p)).length;
 const {state,run}=useTextShot(ref,shot,duration+stagger*Math.max(0,animated-1)+40);
 let n=0;
 return <Tag ref={ref} className={`${s.blur} ${className}`} data-state={state} data-blur={blur||undefined} data-dir={direction}
  style={{'--t-dur':`${duration}ms`} as CSSProperties}>
  <SrText>{text}</SrText>
  <span key={run} aria-hidden="true">{parts.map((p,i)=>/^\s+$/.test(p)?p:<span key={i} className={s.part} style={{'--i':n++,'--t-step':`${stagger}ms`} as CSSProperties}>{p}</span>)}</span>
 </Tag>;
}
