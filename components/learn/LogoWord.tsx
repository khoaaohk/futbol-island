'use client';
import {useEffect,useRef} from 'react';

/** Bright app colours (no black or dark greens, owner Nov 3): pink, sea blue, orange flag, teal water, pitch green, purple, sun gold. */
const COLOURS=['#e8479b','#2f6bff','#ff7a1a','#14b8c8','#2fb36a','#8a5cf0','#f2b01e'];

/**
 * The bar logo (owner, Nov 3 2026): every letter takes a random app colour on its own slow timer. Heat rules: a handful of tiny glyphs,
 * one colour transition each every 1.5 to 3.5 s, no layout; it stops when the tab is hidden and in calm mode (reduced motion, Save-Data,
 * slow connection, Battery saver) the word stays one colour.
 */
export default function LogoWord({text}:{text:string}){
 const box=useRef<HTMLSpanElement>(null);
 useEffect(()=>{
  const el=box.current;if(!el)return;
  const letters=[...el.querySelectorAll<HTMLElement>('[data-l]')];
  const timers:number[]=[];
  const calm=()=>!!el.closest('[data-calm]')||matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tick=(l:HTMLElement)=>{
   if(!document.hidden&&!calm()){
    const now=l.style.color;let c=now;
    while(c===now)c=COLOURS[Math.floor(Math.random()*COLOURS.length)];
    l.style.color=c;
   }
   timers.push(window.setTimeout(()=>tick(l),1500+Math.random()*2000));
  };
  letters.forEach(l=>{if(!calm())l.style.color=COLOURS[Math.floor(Math.random()*COLOURS.length)];timers.push(window.setTimeout(()=>tick(l),1500+Math.random()*2000));});
  return()=>timers.forEach(clearTimeout);
 },[]);
 return <span ref={box} aria-hidden="true">{[...text].map((ch,i)=>ch===' '?' ':<span key={i} data-l="" style={{color:'#e8479b',transition:'color .9s ease'}}>{ch}</span>)}</span>;
}
