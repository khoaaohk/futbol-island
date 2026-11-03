'use client';
import {useEffect,useRef,useState} from 'react';

/** Bright app colours for the hero name; the first one is what the server renders. */
const COLOURS=['#e8479b','#ff7a1a','#2fb36a','#14b8c8','#2f6bff','#8a5cf0'];

/**
 * The hero title's name (owner, Nov 3 2026): "Futbol Island." is the one coloured part of the headline and it rotates through the app colours,
 * cross-fading (colour transition .9 s) every ~2.6 s. Stops when the tab is hidden; calm mode (reduced motion, Save-Data, slow connection,
 * Battery saver) keeps the first colour.
 */
export default function HeroName({text}:{text:string}){
 const [i,setI]=useState(0);
 const box=useRef<HTMLSpanElement>(null);
 useEffect(()=>{
  const el=box.current;if(!el)return;
  const calm=()=>!!el.closest('[data-calm]')||matchMedia('(prefers-reduced-motion: reduce)').matches;
  const t=window.setInterval(()=>{if(!document.hidden&&!calm())setI(n=>(n+1)%COLOURS.length);},2600);
  return()=>clearInterval(t);
 },[]);
 return <span ref={box} className="nowrap-name" style={{whiteSpace:'nowrap',color:COLOURS[i],transition:'color .9s ease'}}>{text}</span>;
}
