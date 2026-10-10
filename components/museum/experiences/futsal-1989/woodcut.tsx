/**
 * futsal-1989 · the woodcut kit (Oct 9 2026). The exhibit is told as a Brazilian cordel folheto: pamphlets hung on a string,
 * each with a xilogravura (woodcut) cover printed in black ink on coloured paper. This file draws that look in SVG, in the
 * real technique's terms:
 *  - the block is black; everything light is CUT away, so highlights are white gouge strokes (V-cuts, chevrons, dashes);
 *  - big black areas carry the wood grain as faint paper-coloured streaks (the `wc-grain` pattern);
 *  - every edge is slightly rough where the ink met the paper (`wc-ink`, a turbulence displacement on STATIC art only);
 *  - frames are borders of triangle teeth; suns are rings of triangle rays; type is a heavy slab like wood type.
 * All original drawing. People are the game's bean figures re-cut as woodcut silhouettes. Filters sit on still layers, so they
 * rasterise once; nothing here animates by itself.
 */
import type {ReactNode} from 'react';

export const INK='#17120e',RED='#c3301c';
/** Shared <defs>: ink-spread roughness, wood grain, hatching. Render once per SVG that needs them (ids are prefixed). */
/** `k` scales the ink roughness and the grain for drawings in other units (a court drawn in metres uses k ≈ .08). */
export function WoodDefs({id,k=1}:{id:string;k?:number}){
 return <defs>
  <filter id={`${id}-ink`} x="-5%" y="-5%" width="110%" height="110%">
   <feTurbulence type="fractalNoise" baseFrequency={.9/k} numOctaves={2} seed={19} result="n"/>
   <feDisplacementMap in="SourceGraphic" in2="n" scale={1.6*k} xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <pattern id={`${id}-grain`} width="40" height="9" patternUnits="userSpaceOnUse" patternTransform={`scale(${k})`}>
   <path d="M0 3 Q10 1.6 20 3.2 T40 2.8 M0 7.4 Q12 8.6 22 7 T40 7.6" fill="none" stroke="var(--paper,#f2c42c)" strokeOpacity=".2" strokeWidth=".55"/>
  </pattern>
  <pattern id={`${id}-hatch`} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform={`rotate(-35) scale(${k})`}>
   <rect width="5" height="5" fill="none"/><rect width="1.7" height="5" fill={INK}/>
  </pattern>
 </defs>;
}
/** A border of triangle teeth along a rectangle (the classic cut frame of a cordel cover). */
export function Teeth({x,y,w,h,size=6,fill=INK}:{x:number;y:number;w:number;h:number;size?:number;fill?:string}){
 const d:string[]=[],nx=Math.max(2,Math.round(w/size)),ny=Math.max(2,Math.round(h/size)),sx=w/nx,sy=h/ny,t=size*.8;
 for(let i=0;i<nx;i++){const a=x+i*sx;d.push(`M${a} ${y}h${sx}l${-sx/2} ${t}z`,`M${a} ${y+h}h${sx}l${-sx/2} ${-t}z`);}
 for(let i=0;i<ny;i++){const b=y+i*sy;d.push(`M${x} ${b}v${sy}l${t} ${-sy/2}z`,`M${x+w} ${b}v${sy}l${-t} ${-sy/2}z`);}
 return <path d={d.join('')} fill={fill}/>;
}
/** A carved sun: a black disc, a white cut ring, and triangle rays. */
export function Sun({cx,cy,r,rays=16}:{cx:number;cy:number;r:number;rays?:number}){
 const d:string[]=[];for(let i=0;i<rays;i++){const a=i/rays*Math.PI*2,b=a+Math.PI/rays*.55,c=a-Math.PI/rays*.55,R=r*1.75;
  d.push(`M${cx+Math.cos(c)*r*1.12} ${cy+Math.sin(c)*r*1.12}L${cx+Math.cos(a)*R} ${cy+Math.sin(a)*R}L${cx+Math.cos(b)*r*1.12} ${cy+Math.sin(b)*r*1.12}z`);}
 return <g><path d={d.join('')} fill={INK}/><circle cx={cx} cy={cy} r={r} fill={INK}/>
  <circle cx={cx} cy={cy} r={r*.7} fill="none" stroke="var(--paper,#f2c42c)" strokeWidth={r*.09} strokeDasharray={`${r*.28} ${r*.12}`}/>
  <path d={`M${cx-r*.35} ${cy-r*.1}q${r*.12} ${-r*.14} ${r*.24} 0M${cx+r*.11} ${cy-r*.1}q${r*.12} ${-r*.14} ${r*.24} 0M${cx-r*.3} ${cy+r*.28}q${r*.3} ${r*.22} ${r*.6} 0`} fill="none" stroke="var(--paper,#f2c42c)" strokeWidth={r*.08} strokeLinecap="round"/>
 </g>;
}
/** A small cut star (cordel covers scatter them in the sky). */
export const Star=({x,y,r}:{x:number;y:number;r:number})=><path d={`M${x} ${y-r}L${x+r*.28} ${y-r*.28}L${x+r} ${y}L${x+r*.28} ${y+r*.28}L${x} ${y+r}L${x-r*.28} ${y+r*.28}L${x-r} ${y}L${x-r*.28} ${y-r*.28}z`} fill={INK}/>;
/** Gouge marks: a row of short white V-cuts along a line (the texture of cleared wood next to a figure). */
export function Gouges({x,y,w,n=7,len=6,tilt=-.5}:{x:number;y:number;w:number;n?:number;len?:number;tilt?:number}){
 const d:string[]=[];for(let i=0;i<n;i++){const a=x+(i+.5)*w/n,o=(i%2?1.5:0);d.push(`M${a} ${y+o}l${tilt*len} ${len}`);}
 return <path d={d.join('')} stroke={INK} strokeWidth="1.6" strokeLinecap="round" fill="none"/>;
}
export type Pattern='plain'|'stripes'|'dots'|'chevron'|'you';
/**
 * A bean player cut in wood, seen from the front: a round body (the shirt), a small round head, two stubby legs. The shirt's
 * pattern is cut out of the black (stripes, dots, chevrons) so team-mates read apart without colour. `kick` swings a leg.
 */
export function Bean({x,y,s=1,pattern='plain',number,kick=0,flip=false,ink=INK,children}:{x:number;y:number;s?:number;pattern?:Pattern;number?:string|number;kick?:number;flip?:boolean;ink?:string;children?:ReactNode}){
 // A light bean (the other team, a keeper) is printed as an outline with black cuts; a dark one has paper-coloured cuts.
 const light=ink!==INK,P=light?INK:'var(--paper,#f2c42c)',st=light?{stroke:INK,strokeWidth:2.2,strokeLinejoin:'round' as const}:{};
 return <g transform={`translate(${x} ${y}) scale(${flip?-s:s} ${s})`}>
  {/* legs (one may kick) */}
  <path d="M-6 14 l-1.5 11 h5 l1 -11z" fill={INK}/>
  <g transform={`rotate(${-kick*40} 5 14)`}><path d="M3 14 l1.5 11 h6 l-1 -3 h-1.5 l-.5 -8z" fill={INK}/></g>
  {/* body: the bean */}
  <path d="M0 -14 C11 -14 14 -4 13.5 4 C13 13 7 17 0 17 C-7 17 -13 13 -13.5 4 C-14 -4 -11 -14 0 -14z" fill={pattern==='you'?RED:ink} {...st}/>
  {pattern==='stripes'&&<path d="M-6 -11v25M0 -13v29M6 -11v25" stroke={P} strokeWidth="1.6"/>}
  {pattern==='dots'&&<g fill={P}>{[[-6,-4],[0,-8],[6,-4],[-6,6],[0,2],[6,6],[0,11]].map(([a,b],i)=><circle key={i} cx={a} cy={b} r="1.5"/>)}</g>}
  {pattern==='chevron'&&<path d="M-11 -2l11 7l11 -7M-11 6l11 7l11 -7" fill="none" stroke={P} strokeWidth="1.7"/>}
  {pattern==='plain'&&<path d="M-9 -6q3 -5 8 -6M-10 2q1 -3 3 -5" fill="none" stroke={P} strokeWidth="1.3" strokeLinecap="round"/>}
  {number!=null&&<text x="0" y="8" textAnchor="middle" fontSize="13" fill={P} style={{fontFamily:'var(--slab)'}}>{number}</text>}
  {/* head with a cut smile and eyes */}
  <circle cx="0" cy="-21" r="7.5" fill={ink} {...st}/>
  <path d="M-3 -22.5v1.6M3 -22.5v1.6M-3 -18.4q3 2.2 6 0" stroke={P} strokeWidth="1.2" strokeLinecap="round" fill="none"/>
  {children}
 </g>;
}
/** A futsal ball cut in wood: black with white panel cuts. `grass` gives the bigger white grass ball with black cuts. */
export function WoodBall({r,grass=false}:{r:number;grass?:boolean}){
 const P='var(--paper,#f2c42c)',fg=grass?INK:P,bg=grass?'#fffaf0':INK;
 const pent=(cx:number,cy:number,k:number)=>{let d='';for(let i=0;i<5;i++){const a=-Math.PI/2+i/5*Math.PI*2;d+=`${i?'L':'M'}${cx+Math.cos(a)*k} ${cy+Math.sin(a)*k}`;}return d+'z';};
 return <g>
  <circle r={r} fill={bg} stroke={INK} strokeWidth={r*.12}/>
  <path d={pent(0,0,r*.3)} fill={fg}/>
  {[0,1,2,3,4].map(i=>{const a=-Math.PI/2+i/5*Math.PI*2;return <path key={i} d={`M${Math.cos(a)*r*.3} ${Math.sin(a)*r*.3}L${Math.cos(a)*r*.86} ${Math.sin(a)*r*.86}`} stroke={fg} strokeWidth={r*.1}/>;})}
  {!grass&&<path d={`M${-r*.62} ${-r*.42}q${r*.2} ${-r*.3} ${r*.5} ${-r*.36}`} stroke={P} strokeWidth={r*.09} fill="none" strokeLinecap="round"/>}
 </g>;
}
