'use client';
import {useEffect,useRef} from 'react';

/** Colours that read on white and cream (owner, Nov 3: nothing hard to see): pink, blue, orange, green, purple. No gold or light teal. */
const COLOURS=['#e8479b','#2f6bff','#ff7a1a','#2fb36a','#8a5cf0'];

/**
 * One highlighted word (the "free" in the hero line): fades from colour to colour every ~1.8 s. Heat rules: one element, one colour
 * transition at a time, no layout; paused while the tab is hidden and in calm mode (reduced motion, Save-Data, slow connection,
 * Battery saver) it stays one colour. The word is real text, so search engines and screen readers read it normally.
 */
export default function ColourWord({children}:{children:string}){
 const el=useRef<HTMLSpanElement>(null);
 useEffect(()=>{
  const n=el.current;if(!n)return;
  let i=0,t=0;
  const calm=()=>!!n.closest('[data-calm]')||matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tick=()=>{
   if(!document.hidden&&!calm()){i=(i+1)%COLOURS.length;n.style.color=COLOURS[i];}
   t=window.setTimeout(tick,1800);
  };
  t=window.setTimeout(tick,1200);
  return()=>clearTimeout(t);
 },[]);
 return <span ref={el} style={{color:COLOURS[0],transition:'color .9s ease'}}>{children}</span>;
}
