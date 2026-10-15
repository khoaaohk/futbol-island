'use client';
/**
 * FallingText. Adapted from React Bits "Falling Text" by David Haz (https://reactbits.dev/text-animations/falling-text).
 * MIT + Commons Clause, Copyright (c) 2026 David Haz: components/bits/LICENSE-react-bits.md, docs/third-party.md.
 * Futbol Island: no matter-js and no physics loop. Each word drops into its place and bounces with a chosen restitution
 * (a futsal ball's low bounce vs a grass ball's), once. The bounce is simulated ahead of time into WAAPI keyframes, so the
 * compositor plays it: 0 rAF. For futsal and the Weather Machine raindrops. Reduced motion: the words sit in place.
 */
import {useEffect,useRef,type ElementType} from 'react';
import {SrText,useTextShot,words,type TextShotProps} from './shared';
import s from './text.module.css';

export type FallingTextProps=TextShotProps&{text:string;as?:ElementType;/** 0..0.9: how much bounce is kept per bounce (futsal ≈ 0.2, grass ball ≈ 0.55). */restitution?:number;
 /** Drop height in px. */height?:number;stagger?:number;/** Words drawn in the accent class. */highlight?:string[];highlightClassName?:string};

/** Drop from -height to 0 under gravity, bouncing with restitution e; returns offsets (px, ≤0) sampled every 1/60 s and the ms. */
export function bounceKeyframes(height:number,e:number,g=2600){
 const ys:number[]=[];let y=-Math.abs(height),v=0,bounces=0;const dt=1/60;
 for(let i=0;i<600;i++){v+=g*dt;y+=v*dt;if(y>=0){y=0;v=-v*Math.max(0,Math.min(0.9,e));bounces++;if(Math.abs(v)<90){ys.push(0);break;}}ys.push(y);}
 if(ys[ys.length-1]!==0)ys.push(0);
 return {ys,ms:Math.round(ys.length*1000/60),bounces,peaks:peaksOf(ys)};
}
const peaksOf=(ys:number[])=>{const out:number[]=[];let seenGround=false;for(let i=1;i<ys.length-1;i++){if(ys[i]===0)seenGround=true;if(seenGround&&ys[i]<0&&ys[i]<=ys[i-1]&&ys[i]<=ys[i+1])out.push(-ys[i]);}return out;};

export default function FallingText({text,as:Tag='span',restitution=0.45,height=90,stagger=80,highlight=[],highlightClassName='',className='',...shot}:FallingTextProps){
 const ref=useRef<HTMLElement>(null),parts=words(text),body=useRef<HTMLSpanElement>(null);
 const plan=bounceKeyframes(height,restitution),count=parts.filter(p=>!/^\s+$/.test(p)).length;
 const {state,run,reduced}=useTextShot(ref,shot,plan.ms+stagger*Math.max(0,count-1)+60);
 useEffect(()=>{
  if(reduced||!run)return;
  const els=Array.from(body.current?.querySelectorAll<HTMLElement>('[data-fall]')??[]);
  const frames=plan.ys.map((y,i)=>({transform:`translate3d(0,${y.toFixed(1)}px,0)`,opacity:i===0?0:1}));
  const anims=els.map((el,i)=>el.animate?.(frames,{duration:plan.ms,delay:i*stagger,easing:'linear',fill:'backwards'}));
  return()=>anims.forEach(a=>a?.cancel());
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[run,reduced]);
 const marked=new Set(highlight.map(w=>w.toLowerCase()));
 return <Tag ref={ref} className={`${s.fall} ${className}`} data-state={state}>
  <SrText>{text}</SrText>
  <span ref={body} aria-hidden="true">{parts.map((p,i)=>/^\s+$/.test(p)?p:<span key={i} data-fall className={`${s.fallWord} ${marked.has(p.toLowerCase().replace(/[^\p{L}\p{N}]/gu,''))?highlightClassName:''}`}>{p}</span>)}</span>
 </Tag>;
}
