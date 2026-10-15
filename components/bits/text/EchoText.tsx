'use client';
/**
 * EchoText. Adapted from React Bits "Echo Text" by David Haz (https://reactbits.dev/text-animations/echo-text).
 * MIT + Commons Clause, Copyright (c) 2026 David Haz: components/bits/LICENSE-react-bits.md, docs/third-party.md.
 * Futbol Island: no cursor tracking and no loop. Fading copies of the word ring out from it (mode "out", like a stadium
 * chant) or fly in and settle into it (mode "in"), once per play. CSS transform/opacity on aria-hidden layers.
 * For the Women's World Cup 1991 "Akers". Reduced motion: just the word.
 */
import {useRef,type CSSProperties,type ElementType} from 'react';
import {SrText,useTextShot,type TextShotProps} from './shared';
import s from './text.module.css';

export type EchoTextProps=TextShotProps&{text:string;as?:ElementType;echoes?:number;/** em between echoes */offset?:number;direction?:'right'|'left'|'up'|'down';
 mode?:'out'|'in';duration?:number;stagger?:number;/** Echo colour (CSS colour, default the text colour). */tint?:string};

const VEC={right:[1,0],left:[-1,0],up:[0,-1],down:[0,1]} as const;

export default function EchoText({text,as:Tag='span',echoes=3,offset=0.28,direction='right',mode='out',duration=900,stagger=110,tint,className='',...shot}:EchoTextProps){
 const ref=useRef<HTMLElement>(null);
 const {state,run}=useTextShot(ref,shot,duration+stagger*Math.max(0,echoes-1)+40);
 const [dx,dy]=VEC[direction];
 return <Tag ref={ref} className={`${s.echo} ${className}`} data-state={state} data-mode={mode} style={{'--t-dur':`${duration}ms`,'--t-step':`${stagger}ms`,'--t-tint':tint??'currentColor'} as CSSProperties}>
  <span className={s.echoMain}>{text}</span>
  {state==='run'&&<span key={run} aria-hidden="true">{Array.from({length:echoes},(_,k)=><span key={k} className={s.echoLayer}
   style={{'--i':k,'--ex':`${dx*offset*(k+1)}em`,'--ey':`${dy*offset*(k+1)}em`,'--eo':(0.55*(1-k/(echoes+1))).toFixed(2)} as CSSProperties}>{text}</span>)}</span>}
 </Tag>;
}
