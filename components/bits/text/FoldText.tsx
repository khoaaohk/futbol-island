'use client';
/**
 * FoldText. Adapted from React Bits "Fold Text" by David Haz (https://reactbits.dev/text-animations/fold-text).
 * MIT + Commons Clause, Copyright (c) 2026 David Haz: components/bits/LICENSE-react-bits.md, docs/third-party.md.
 * Futbol Island: lines (split on "\n") or words unfold from a hinge like paper, with a crease shadow that fades, once.
 * CSS rotateX/rotateY + opacity, no gsap/ScrollTrigger. For the Laws of 1863 sheet. Reduced motion: flat at once.
 */
import {useRef,type CSSProperties,type ElementType} from 'react';
import {SrText,useTextShot,words,type TextShotProps} from './shared';
import s from './text.module.css';

export type FoldTextProps=TextShotProps&{text:string;as?:ElementType;by?:'lines'|'words';hinge?:'top'|'left';stagger?:number;duration?:number};

export default function FoldText({text,as:Tag='span',by='lines',hinge='top',stagger=140,duration=750,className='',...shot}:FoldTextProps){
 const ref=useRef<HTMLElement>(null);
 const parts=by==='lines'?text.split('\n'):words(text);
 const count=parts.filter(p=>!/^\s+$/.test(p)).length;
 const {state,run}=useTextShot(ref,shot,duration+stagger*Math.max(0,count-1)+40);
 let n=0;
 return <Tag ref={ref} className={`${s.fold} ${className}`} data-state={state} data-hinge={hinge} data-by={by} style={{'--t-dur':`${duration}ms`,'--t-step':`${stagger}ms`} as CSSProperties}>
  <SrText>{text.replace(/\n/g,' ')}</SrText>
  <span key={run} aria-hidden="true" className={s.foldBody}>{parts.map((p,i)=>/^\s+$/.test(p)?p:<span key={i} className={s.foldPart} style={{'--i':n++} as CSSProperties}>{p}</span>)}</span>
 </Tag>;
}
