/** Small inline icons for wwc-1991's buttons (consistent 2 px strokes, currentColor). */
export function Chevron({left}:{left?:boolean}){return <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d={left?'M11 3.5 5.5 9l5.5 5.5':'M7 3.5 12.5 9 7 14.5'} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>;}
export function Play(){return <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M3.5 2.2v9.6a.6.6 0 0 0 .9.5l7.6-4.8a.6.6 0 0 0 0-1L4.4 1.7a.6.6 0 0 0-.9.5Z" fill="currentColor"/></svg>;}
export function Pause(){return <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><rect x="2.5" y="2" width="3.2" height="10" rx="1" fill="currentColor"/><rect x="8.3" y="2" width="3.2" height="10" rx="1" fill="currentColor"/></svg>;}
export function Again(){return <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true"><path d="M13 8a5 5 0 1 1-1.6-3.7M13 2.5v3h-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;}
/** The five-point "first star": a soft bloom, rays and a crisp gold star. Its ignition is pure CSS (see .ignite in the module). */
export function FirstStar({className}:{className?:string}){
 return <svg className={className} viewBox="-50 -50 100 100" aria-hidden="true">
  <defs><radialGradient id="wwcBloom"><stop offset="0" stopColor="#fff6d6" stopOpacity=".95"/><stop offset=".25" stopColor="#ffd56b" stopOpacity=".55"/><stop offset="1" stopColor="#ffd56b" stopOpacity="0"/></radialGradient>
   <linearGradient id="wwcStarFill" x1="0" y1="-1" x2="0" y2="1"><stop offset="0" stopColor="#fff3c4"/><stop offset=".55" stopColor="#ffd56b"/><stop offset="1" stopColor="#e9a93a"/></linearGradient></defs>
  <circle r="50" fill="url(#wwcBloom)" data-part="bloom"/>
  <g data-part="rays" stroke="#ffe9a8" strokeLinecap="round">{Array.from({length:12},(_,i)=><line key={i} x1="0" y1={i%2?-24:-27} x2="0" y2={i%2?-34:-46} strokeWidth={i%2?.8:1.3} strokeOpacity={i%2?.45:.7} transform={`rotate(${i*30})`}/>)}</g>
  <path data-part="star" d="M0-19 5.6-6.4 19.2-5.9 8.6 3 12.3 16.1 0 8.6-12.3 16.1-8.6 3-19.2-5.9-5.6-6.4Z" fill="url(#wwcStarFill)" stroke="#fff5d0" strokeWidth=".8" strokeLinejoin="round"/>
 </svg>;
}
