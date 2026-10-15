'use client';
/**
 * ShinyText. Adapted from React Bits "Shiny Text" by David Haz (https://reactbits.dev/text-animations/shiny-text).
 * MIT + Commons Clause, Copyright (c) 2026 David Haz: components/bits/LICENSE-react-bits.md, docs/third-party.md.
 * Futbol Island: one sweep of light across the text (or `passes` sweeps), then plain text again: no infinite shimmer, no
 * pointer following, no rAF. For reward and stamp moments. Reduced motion: plain text.
 */
import {useRef,type CSSProperties,type ElementType,type ReactNode} from 'react';
import {useTextShot,type TextShotProps} from './shared';
import s from './text.module.css';

export type ShinyTextProps=TextShotProps&{children:ReactNode;as?:ElementType;passes?:number;duration?:number;/** Shine colour (CSS colour). */shine?:string};

export default function ShinyText({children,as:Tag='span',passes=1,duration=1400,shine='#ffffff',className='',...shot}:ShinyTextProps){
 const ref=useRef<HTMLElement>(null),n=Math.max(1,Math.min(3,Math.round(passes)));
 const {state,run}=useTextShot(ref,{trigger:'view',...shot},duration*n+40);
 return <Tag ref={ref} key={run} className={`${s.shiny} ${className}`} data-state={state} style={{'--t-dur':`${duration}ms`,'--t-passes':n,'--t-shine':shine} as CSSProperties}>{children}</Tag>;
}
