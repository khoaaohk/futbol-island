'use client';
import {useEffect,useRef} from 'react';
import {springLinear} from '../modern/tokens';
import s from './Experience.module.css';

/**
 * The hero artwork (Oct 10 2026 modern pass, replaces the Art Deco poster). An abstract composition of the voyage:
 *  - a small ink dot top right (Genoa) and a large blue disc bottom left (Montevideo), joined by one hairline arc: the crossing;
 *  - thirteen small squares along the bottom: the 13 teams, the four that sailed on the ship filled blue;
 *  - the year as a big Swiss numeral.
 * Entrance: ONE orchestrated, finite WAAPI pass (the arc draws by stroke-dashoffset, the disc scales up on a spring, the squares
 * arrive 50 ms apart). No loop; skipped entirely with reduced motion (the composition is complete as drawn).
 */
const SHIP=[4,6,9,12];// Belgium, Brazil, France, Romania sit at these places in the row (purely visual order)
export default function Composition(){
 const ref=useRef<SVGSVGElement>(null);
 useEffect(()=>{const svg=ref.current;if(!svg||typeof matchMedia==='undefined'||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const ease=springLinear(200,.8),run=(sel:string,k:Keyframe[],o:KeyframeAnimationOptions)=>svg.querySelectorAll<SVGElement>(sel).forEach((el,i)=>{try{el.animate(k,{fill:'backwards',easing:ease,...o,delay:Number(o.delay??0)+i*50});}catch{}});
  run('[data-c="arc"]',[{strokeDashoffset:1},{strokeDashoffset:0}],{duration:1400,delay:250,easing:'cubic-bezier(.3,0,.2,1)'});
  run('[data-c="sun"]',[{transform:'scale(.6)',opacity:0},{transform:'none',opacity:1}],{duration:900,delay:120});
  run('[data-c="dot"]',[{opacity:0},{opacity:1}],{duration:400});
  run('[data-c="sq"]',[{transform:'translateY(14px)',opacity:0},{transform:'none',opacity:1}],{duration:700,delay:700});
 },[]);
 return <svg ref={ref} className={s.composition} viewBox="0 0 400 400" role="img" aria-label="An abstract composition: a small dot for Genoa joined by one long arc to a large blue disc for Montevideo, and thirteen squares for the thirteen teams, four of them blue for the teams that sailed.">
  <circle data-c="sun" cx="132" cy="262" r="96" fill="var(--accent)" style={{transformOrigin:'132px 262px'}}/>
  <path data-c="arc" d="M332 64 C 300 170, 220 210, 160 236" fill="none" stroke="var(--ink)" strokeWidth="1.5" pathLength={1} strokeDasharray="1 1"/>
  <circle data-c="dot" cx="332" cy="64" r="7" fill="var(--ink)"/>
  <circle cx="332" cy="64" r="15" fill="none" stroke="var(--hair)" strokeWidth="1"/>
  <g>{Array.from({length:13},(_,i)=><rect key={i} data-c="sq" x={20+i*28.5} y={378} width="16" height="16" fill={SHIP.includes(i)?'var(--accent)':'none'} stroke={SHIP.includes(i)?'var(--accent)':'var(--ink)'} strokeWidth="1.5"/>)}</g>
  <text x="388" y="352" textAnchor="end" className={s.compYear}>1930</text>
 </svg>;
}
