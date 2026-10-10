import {crescent,sawRing,starPath} from './papercut';
/** Small inline icons for wwc-1991's buttons (consistent 2 px strokes, currentColor). */
export function Chevron({left}:{left?:boolean}){return <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d={left?'M11 3.5 5.5 9l5.5 5.5':'M7 3.5 12.5 9 7 14.5'} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>;}
export function Play(){return <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M3.5 2.2v9.6a.6.6 0 0 0 .9.5l7.6-4.8a.6.6 0 0 0 0-1L4.4 1.7a.6.6 0 0 0-.9.5Z" fill="currentColor"/></svg>;}
export function Pause(){return <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><rect x="2.5" y="2" width="3.2" height="10" rx="1" fill="currentColor"/><rect x="8.3" y="2" width="3.2" height="10" rx="1" fill="currentColor"/></svg>;}
export function Again(){return <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true"><path d="M13 8a5 5 0 1 1-1.6-3.7M13 2.5v3h-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;}
/** The "first star", cut from paper: a toothed gold medallion behind a red five-point star with a crescent cut. Its ignition is
 *  pure CSS (see .ignite in the module). */
export function FirstStar({className}:{className?:string}){
 return <svg className={className} viewBox="-50 -50 100 100" aria-hidden="true">
  <path data-part="bloom" d={sawRing(0,0,46,5,30)} fill="#f2b705"/>
  <g data-part="rays" fill="#fff4dc">{Array.from({length:10},(_,i)=><path key={i} d={crescent(Math.cos(i/10*Math.PI*2)*37,Math.sin(i/10*Math.PI*2)*37,4,i/10*Math.PI*2,.5)}/>)}</g>
  <path data-part="star" d={starPath(28)} fill="#c8102e" fillRule="evenodd" stroke="#7a0c16" strokeWidth=".8" strokeLinejoin="round"/>
 </svg>;
}
