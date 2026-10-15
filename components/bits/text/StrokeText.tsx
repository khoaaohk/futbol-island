'use client';
/**
 * StrokeText. Adapted from React Bits "Stroke Text" by David Haz (https://reactbits.dev/text-animations/stroke-text).
 * MIT + Commons Clause, Copyright (c) 2026 David Haz: components/bits/LICENSE-react-bits.md, docs/third-party.md.
 * Futbol Island: SVG text whose outline draws on (stroke-dashoffset), then the ink fills in, once. No gsap. For the Laws of 1863
 * rule titles. One line; it scales down to fit its column. Reduced motion: drawn and filled at once.
 */
import {useLayoutEffect,useRef,useState,type CSSProperties,type ElementType} from 'react';
import {SrText,useTextShot,type TextShotProps} from './shared';
import s from './text.module.css';

export type StrokeTextProps=TextShotProps&{text:string;as?:ElementType;fontSize?:number;fontWeight?:number|string;strokeWidth?:number;
 /** Outline and fill colour (any CSS colour, default currentColor). */color?:string;drawMs?:number;fillDelayMs?:number;fillMs?:number;fontFamily?:string};

export default function StrokeText({text,as:Tag='span',fontSize=44,fontWeight=800,strokeWidth=1.4,color='currentColor',drawMs=1300,fillDelayMs=900,fillMs=500,fontFamily,className='',...shot}:StrokeTextProps){
 const ref=useRef<HTMLElement>(null),textEl=useRef<SVGTextElement>(null),[width,setWidth]=useState(Math.ceil(text.length*fontSize*0.62));
 const {state,run}=useTextShot(ref,shot,Math.max(drawMs,fillDelayMs+fillMs)+40);
 useLayoutEffect(()=>{const w=textEl.current?.getComputedTextLength?.();if(w&&w>0)setWidth(Math.ceil(w+strokeWidth*4));},[text,fontSize,fontWeight,fontFamily,strokeWidth]);
 const h=Math.ceil(fontSize*1.28),dash=Math.round(fontSize*5);
 return <Tag ref={ref} className={`${s.stroke} ${className}`} data-state={state}
  style={{'--t-draw':`${drawMs}ms`,'--t-fill-delay':`${fillDelayMs}ms`,'--t-fill':`${fillMs}ms`,'--t-dash':dash} as CSSProperties}>
  <SrText>{text}</SrText>
  <svg key={run} aria-hidden="true" viewBox={`0 0 ${width} ${h}`} width={width} height={h} style={{maxWidth:'100%',height:'auto'}} focusable="false">
   <text ref={textEl} x={strokeWidth*2} y={Math.round(fontSize*0.98)} fontSize={fontSize} fontWeight={fontWeight} fontFamily={fontFamily??'inherit'}
    stroke={color} strokeWidth={strokeWidth} fill={color} strokeLinejoin="round" strokeDasharray={dash} className={s.strokeText}>{text}</text>
  </svg>
 </Tag>;
}
