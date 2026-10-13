'use client';
import {useEffect,useState,type RefObject} from 'react';

/** An element's size in CSS px, live (one ResizeObserver, released on unmount). The SVG viewBox is exactly this, so a drawing
 *  fills its card pixel for pixel. Shared by hall-of-fame and timeline (Oct 12 2026 consolidation). */
export function useSize(el:RefObject<HTMLElement|null>){
 const [s,setS]=useState({w:0,h:0});
 useEffect(()=>{const node=el.current;if(!node)return;const read=()=>{const r=node.getBoundingClientRect();setS(o=>Math.round(r.width)===o.w&&Math.round(r.height)===o.h?o:{w:Math.round(r.width),h:Math.round(r.height)});};read();
  if(typeof ResizeObserver==='undefined'){window.addEventListener('resize',read);return()=>window.removeEventListener('resize',read);}
  const ro=new ResizeObserver(read);ro.observe(node);return()=>ro.disconnect();},[el]);
 return s;
}
