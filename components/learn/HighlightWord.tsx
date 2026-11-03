'use client';
import {useEffect,useRef} from 'react';

/** Highlight colours that keep white text readable: app blue, purple, pink, green. */
const COLOURS=['#2f6bff','#8a5cf0','#e8479b','#1f9d63'];

/**
 * The highlighted "free" in the hero line (owner, Nov 3): a <mark> whose background fades between a few app colours every ~2.5 s
 * (the CSS transition does the fade; no keyframes). One element, no layout. Paused while the tab is hidden; in calm mode (reduced
 * motion, Save-Data, slow connection, Battery saver) it stays blue. The word is real text for search engines and screen readers.
 */
export default function HighlightWord({className,children}:{className?:string;children:string}){
 const el=useRef<HTMLElement>(null);
 useEffect(()=>{
  const n=el.current;if(!n)return;
  let i=0,t=0;
  const calm=()=>!!n.closest('[data-calm]')||matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tick=()=>{
   if(!document.hidden&&!calm()){i=(i+1)%COLOURS.length;n.style.backgroundColor=COLOURS[i];}
   t=window.setTimeout(tick,2500);
  };
  t=window.setTimeout(tick,1500);
  return()=>clearTimeout(t);
 },[]);
 return <mark ref={el} className={className}>{children}</mark>;
}
