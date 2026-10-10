'use client';
import {useEffect,useRef} from 'react';
import {springSamples} from './spring';
import s from './Experience.module.css';

/**
 * The hero: an original Art Deco travel poster of an ocean liner leaving for Montevideo (Oct 9 2026, the museum's "styles"
 * pass). Built the way 1930s liner posters were: a low horizon, a bow-on hull that towers over the viewer, flat colour planes
 * shaded with airbrushed gradients, a sunburst, and geometric smoke and sea bands. It's a drawing in that style, not a picture
 * of the real Conte Verde's livery. The entrance is one orchestrated, staggered moment (sun → rays → liner → smoke) played with
 * spring-sampled Web Animations, once; with reduced motion it's simply there. As you scroll away the liner sails off (a CSS
 * scroll-driven animation in the module, compositor-run).
 * Style references studied (techniques only, nothing copied): A. M. Cassandre's liner posters (Normandie, 1935: the bow-on
 * hull towering from a low horizon), Roger Broders' PLM railway posters (flat airbrushed colour planes), and Guillermo
 * Laborde's official poster for the 1930 World Cup (deco geometry and diagonal energy).
 */
export default function Poster(){
 const ref=useRef<SVGSVGElement>(null);
 useEffect(()=>{const svg=ref.current;if(!svg||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const p=springSamples(140,15),d=p.length*1000/60,anims:Animation[]=[];
  const run=(sel:string,frames:(t:number)=>Keyframe,delay:number,dur=d,samples=p)=>{const el=svg.querySelector<SVGElement>(sel);if(!el)return;
   try{anims.push(el.animate(samples.map(frames),{duration:dur,delay,easing:'linear',fill:'backwards'}));}catch{}};
  const lin=Array.from({length:31},(_,i)=>{const t=i/30;return 1-(1-t)**3;});
  run('[data-p=sun]',t=>({transform:`translateY(${(1-t)*120}px)`}),0);
  run('[data-p=rays]',t=>({transform:`rotate(${(1-t)*-24}deg) scale(${.6+.4*t})`,opacity:Math.min(1,t*1.4)}),120,1100,lin);
  run('[data-p=liner]',t=>({transform:`translateY(${(1-t)*260}px)`}),260);
  run('[data-p=smoke]',t=>({transform:`translate(${(1-t)*-40}px,${(1-t)*30}px)`,opacity:Math.min(1,t)}),620,900,lin);
  run('[data-p=gulls]',t=>({transform:`translate(${(1-t)*60}px,${(1-t)*-20}px)`,opacity:t}),900,800,lin);
  return()=>anims.forEach(a=>a.cancel());},[]);
 return <svg ref={ref} className={s.poster} viewBox="0 0 600 760" preserveAspectRatio="xMidYMid slice" role="img" aria-label="A poster in 1930s style: a tall ocean liner sails toward you out of a golden sunburst, on a sea of striped bands.">
  <defs>
   <linearGradient id="dSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#13203a"/><stop offset=".45" stopColor="#1f5566"/><stop offset=".72" stopColor="#e9a35b"/><stop offset=".8" stopColor="#f6d58a"/></linearGradient>
   <radialGradient id="dSun" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#fff2c4"/><stop offset=".6" stopColor="#f3b443"/><stop offset="1" stopColor="#e0573a"/></radialGradient>
   <radialGradient id="dGlow" cx=".5" cy=".62" r=".55"><stop offset="0" stopColor="#fff2c4" stopOpacity=".75"/><stop offset="1" stopColor="#fff2c4" stopOpacity="0"/></radialGradient>
   <linearGradient id="dSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1f5566"/><stop offset="1" stopColor="#0d1a30"/></linearGradient>
   {/* Airbrushed hull: lit from the sun behind-left, so the port bow catches a warm rim and the starboard falls into navy. */}
   <linearGradient id="dHullL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#3a4f73"/><stop offset=".7" stopColor="#1a2745"/><stop offset="1" stopColor="#101a30"/></linearGradient>
   <linearGradient id="dHullR" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#0b1326"/><stop offset="1" stopColor="#1c2a4a"/></linearGradient>
   <linearGradient id="dRim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f6d58a" stopOpacity=".9"/><stop offset="1" stopColor="#f6d58a" stopOpacity="0"/></linearGradient>
   <linearGradient id="dDeck" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff5df"/><stop offset=".55" stopColor="#f4e7c9"/><stop offset="1" stopColor="#b9a98a"/></linearGradient>
   <linearGradient id="dFunnel" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#f6d58a"/><stop offset=".5" stopColor="#f3b443"/><stop offset="1" stopColor="#b9772a"/></linearGradient>
   <linearGradient id="dShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0b1326" stopOpacity="0"/><stop offset="1" stopColor="#0b1326" stopOpacity=".55"/></linearGradient>
   <clipPath id="dFrame"><rect x="0" y="0" width="600" height="760"/></clipPath>
  </defs>
  <g clipPath="url(#dFrame)">
   <rect width="600" height="760" fill="url(#dSky)"/>
   {/* The sunburst: alternating wedges from a sun that sits on the horizon. */}
   <g data-p="rays" style={{transformOrigin:'300px 470px',transformBox:'view-box'}}>
    {Array.from({length:18},(_,i)=>{const a0=(i/18)*Math.PI*2,a1=a0+Math.PI/18;const R=900;
     return <path key={i} d={`M300 470 L${(300+Math.cos(a0)*R).toFixed(1)} ${(470+Math.sin(a0)*R).toFixed(1)} L${(300+Math.cos(a1)*R).toFixed(1)} ${(470+Math.sin(a1)*R).toFixed(1)}Z`} fill="#fff2c4" opacity={i%2?.07:.13}/>;})}
   </g>
   <rect width="600" height="760" fill="url(#dGlow)"/>
   <g data-p="sun"><circle cx="300" cy="470" r="118" fill="url(#dSun)"/>
    {[0,1,2,3].map(i=><rect key={i} x="150" y={486+i*14} width="300" height={4+i} fill="#e9a35b" opacity=".85"/>)}</g>
   {/* Sea: flat bands that tighten toward the horizon (deco perspective), each with a fine highlight line. */}
   <rect y="470" width="600" height="290" fill="url(#dSea)"/>
   {[0,1,2,3,4,5,6,7,8,9].map(i=>{const y=470+Math.pow(i/9,1.7)*290;return <g key={i}><rect x="0" y={y} width="600" height={2+i*.9} fill="#2f7d8c" opacity={.55-i*.03}/>
    <line x1="0" x2="600" y1={y+1} y2={y+1} stroke="#f6d58a" strokeOpacity={.28-i*.02} strokeWidth=".8"/></g>;})}
   <path d="M300 470 L560 760 L40 760Z" fill="#f6d58a" opacity=".08"/>
   {/* Smoke from the two funnels: stacked geometric arcs blowing to the left. */}
   <g data-p="smoke" fill="#f4e7c9">
    <path d="M262 168 C220 150 170 150 120 166 C160 128 222 120 270 140Z" opacity=".55"/>
    <path d="M250 120 C200 92 130 92 60 116 C110 64 200 58 262 92Z" opacity=".35"/>
    <path d="M340 150 C300 126 252 120 206 132 C246 96 312 96 350 124Z" opacity=".45"/>
   </g>
   <g data-p="gulls" fill="none" stroke="#13203a" strokeWidth="3" strokeLinecap="round" opacity=".85">
    <path d="M446 214 q10-10 20 0 q10-10 20 0"/><path d="M490 250 q7-7 14 0 q7-7 14 0"/><path d="M412 268 q6-6 12 0 q6-6 12 0"/>
   </g>
   {/* The liner, bow on. */}
   <g data-p="liner">
    <g className={s.posterLiner}>
     {/* funnels */}
     <path d="M246 150 L284 150 L290 262 L240 262Z" fill="url(#dFunnel)"/><rect x="243" y="150" width="44" height="18" fill="#13203a"/>
     <path d="M318 168 L352 168 L358 266 L312 266Z" fill="url(#dFunnel)"/><rect x="315" y="168" width="40" height="16" fill="#13203a"/>
     <path d="M246 196 L287 196" stroke="#e0573a" strokeWidth="8"/><path d="M316 210 L354 210" stroke="#e0573a" strokeWidth="7"/>
     {/* superstructure: three stepped white tiers */}
     <path d="M200 262 L400 262 L408 300 L192 300Z" fill="url(#dDeck)"/>
     <path d="M176 300 L424 300 L434 344 L166 344Z" fill="url(#dDeck)"/>
     <path d="M150 344 L450 344 L462 392 L138 392Z" fill="url(#dDeck)"/>
     {[276,318,362].map((y,r)=><g key={y} fill="#13203a" opacity=".75">{Array.from({length:9+r*2},(_,i)=>{const n=9+r*2,x0=212-r*26,x1=388+r*26;return <rect key={i} x={x0+(x1-x0)*i/(n-1)-4} y={y} width="8" height="8" rx="1"/>;})}</g>)}
     <rect x="138" y="392" width="324" height="10" fill="#e0573a"/>
     {/* the hull: two planes meeting at the stem, which comes straight at you */}
     <path d="M130 402 L300 402 L300 742 Z" fill="url(#dHullL)"/>
     <path d="M300 402 L470 402 L300 742 Z" fill="url(#dHullR)"/>
     <path d="M130 402 L160 402 L300 742 Z" fill="url(#dRim)" opacity=".55"/>
     <path d="M298 402 L302 402 L300.6 742 L299.4 742Z" fill="#f6d58a" opacity=".45"/>
     <path d="M130 402 L470 402 L452 440 L148 440Z" fill="#f4e7c9" opacity=".12"/>
     {[470,520].map(y=><circle key={y} cx={300-(742-y)*170/340*.55} cy={y} r="5" fill="#f6d58a" opacity=".8"/>)}
     <path d="M130 402 L300 742 L470 402" fill="url(#dShade)" opacity=".6"/>
     {/* the anchor and the bow wave */}
     <path d="M258 460 l8 0 l0 22 l-8 0z" fill="#0b1326"/>
     <path d="M190 742 Q245 700 300 742 Q355 700 410 742Z" fill="#f4e7c9"/>
     <path d="M150 760 Q225 712 300 750 Q375 712 450 760Z" fill="#f4e7c9" opacity=".55"/>
    </g>
   </g>
  </g>
 </svg>;
}
