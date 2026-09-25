'use client';
import {useEffect,useLayoutEffect,useRef} from 'react';
import type React from 'react';
import {useSceneryRest} from '@/lib/sceneryRest';
import journey from './IslandJourney.module.css';

const useIsoLayoutEffect=typeof window==='undefined'?useEffect:useLayoutEffect;

/** One moving piece: an HTML layer over the art holding its own full-art <svg> (same viewBox and placement as the static art,
 * so the browser snaps it to exactly the same pixels), animated with a CSS transform about `origin` (viewBox units). Chrome
 * never composites animations on SVG elements, so the same loops on SVG children restyled, laid out and repainted the whole
 * illustration 60 times a second. */
function Piece({origin,className,style,children}:{origin:[number,number];className?:string;style?:React.CSSProperties;children:React.ReactNode}){
 return <div className={`${journey.artPiece} ${className??''}`} data-origin={origin.join(' ')} style={style}>
  <svg viewBox="0 0 420 300" aria-hidden="true">{children}</svg>
 </div>;
}

/**
 * The Paths landing illustration (island, sun, ball, flag). The ball rolls, the flag flaps and the sun pulses behind its halo
 * as before; each moving shape is its own composited layer over the static art (rotation origins measured on resize only).
 * The loops rest after 6 s without interaction (lib/sceneryRest.ts) and stop for reduced motion.
 */
export default function JourneyArrivalArt({className}:{className:string}){
 const ref=useRef<HTMLDivElement>(null);
 useIsoLayoutEffect(()=>{const el=ref.current;if(!el)return;
  // Each piece turns about its shape's point at the art's `meet` placement (measured on resize only; computed width and
  // height are the fractional layout size, unaffected by the dialog's entry transform).
  const fit=()=>{const cs=getComputedStyle(el),w=parseFloat(cs.width)||el.clientWidth,h=parseFloat(cs.height)||el.clientHeight,s=Math.min(w/420,h/300),ox=(w-420*s)/2,oy=(h-300*s)/2;
   for(const piece of el.querySelectorAll<HTMLElement>('[data-origin]')){const [cx,cy]=piece.dataset.origin!.split(' ').map(Number);piece.style.transformOrigin=`${(ox+cx*s).toFixed(3)}px ${(oy+cy*s).toFixed(3)}px`;}};
  fit();const observer=typeof ResizeObserver==='undefined'?null:new ResizeObserver(fit);observer?.observe(el);return ()=>observer?.disconnect();},[]);
 useSceneryRest(ref,journey.artRest);
 // The ball pattern's fill-box centre (-39..42, -40..42 → 1.5, 1) through translate(334 181) rotate(-12).
 const ballC:[number,number]=[334+1.5*Math.cos(Math.PI/15)+1*Math.sin(Math.PI/15),181-1.5*Math.sin(Math.PI/15)+1*Math.cos(Math.PI/15)];
 return <div ref={ref} className={`${className} ${journey.artStage}`} aria-hidden="true">
  <svg className={journey.artLayer} viewBox="0 0 420 300"><path d="M16 174C72 112 145 107 230 145S355 171 394 146Q416 132 416 163L409 248Q407 280 373 284C253 295 146 278 51 287Q16 291 13 259L8 204Q7 187 16 174Z" fill="#1255ee"/><path d="M16 236Q110 150 260 220T410 208" fill="none" stroke="#faf2da" strokeWidth="13" strokeLinecap="round"/><path d="M38 174Q18 111 91 101Q137 62 194 119Q254 143 197 185Q100 238 38 174Z" fill="#ffd03e"/><path d="M60 158Q49 112 104 121Q136 95 170 136Q207 161 167 176Q94 204 60 158" fill="#087451"/><path d="M100 178Q138 166 125 147T176 135" fill="none" stroke="#fff0cc" strokeWidth="9" strokeLinecap="round"/><g transform="translate(334 181) rotate(-12)"><ellipse cx="0" cy="61" rx="38" ry="8" fill="#073e38" opacity=".15"/><circle r="43" fill="#fff2d3"/></g></svg>
  {/* The sun sits clear of the island shapes, so drawing it above them paints the same pixels. */}
  <Piece origin={[320,65]} className={journey.sunHalo} style={{opacity:.28}}><circle cx="320" cy="65" r="48" fill="#ffd03e"/></Piece>
  <Piece origin={[320,65]} className={journey.sunCore}><circle cx="320" cy="65" r="48" fill="#ffd03e"/></Piece>
  <Piece origin={ballC} className={journey.ballSpin}><g transform="translate(334 181) rotate(-12)"><path d="M0-17L17-5L11 15H-11L-17-5Z M-14-40L-8-29L-26-19L-38-20 M36-24L25-18L30 4L42 9 M25 35L18 24L-5 30L-8 42 M-39 17L-27 12L-14 30L-20 38" fill="#173e37"/><path d="M0-17L-8-29M17-5L30 4M11 15L18 24M-11 15L-27 12M-17-5L-26-19" fill="none" stroke="#173e37" strokeWidth="2"/></g></Piece>
  {/* What was drawn over the ball stays over it. */}
  <svg className={journey.artLayer} viewBox="0 0 420 300"><path d="M180 167Q204 241 293 204" fill="none" stroke="#faf2da" strokeWidth="3" strokeDasharray="5 9"/><circle cx="125" cy="148" r="9" fill="#fa8bd2"/></svg>
  <Piece origin={[121,106]} className={journey.flagWave}><path d="M121 123v-34l26 9-26 10" fill="#ff6230" stroke="#173e37" strokeWidth="3"/></Piece>
 </div>;
}
