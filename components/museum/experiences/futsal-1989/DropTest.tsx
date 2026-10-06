'use client';
import {useState} from 'react';
import css from './futsal.module.css';
/**
 * The drop test, to scale (1 SVG unit = 1 cm): both balls fall from 2 m. The shaded bands are the allowed first-bounce
 * heights: 50–65 cm for a futsal ball (FIFA Futsal Laws, Law 2) and 120–165 cm for a FIFA Quality Pro grass ball. CSS
 * animation only, replayed per tap; with reduced motion the balls simply sit at their bounce heights.
 */
const GROUND=220,TOP=20;
export function DropTest(){
 const [n,setN]=useState(0);
 const col=(x:number,lo:number,hi:number,peak:number,fill:string,label:string,name:string)=><g>
  <rect x={x-22} y={GROUND-hi} width={44} height={hi-lo} rx={3} fill={fill} opacity={.22}/>
  <text x={x-27} y={GROUND-(lo+hi)/2+4} textAnchor="end" className={css.svgSmall}>{lo}–{hi} cm</text>
  <g key={n} className={n?css.dropping:css.resting} style={{['--peak' as string]:`${GROUND-10-peak-(TOP)}px`,['--fall' as string]:`${GROUND-10-TOP}px`}}>
   <circle cx={x} cy={TOP} r={10} fill={fill} stroke="#111" strokeWidth={1.5}/>
  </g>
  <text x={x} y={GROUND+16} textAnchor="middle" className={css.svgLabel}>{name}</text>
  <title>{label}</title>
 </g>;
 return <figure className={css.drop}>
  <svg viewBox="0 0 240 246" role="img" aria-label="Drop test from 2 metres: a futsal ball bounces back 50 to 65 centimetres, a grass ball 120 to 165 centimetres.">
   <line x1={10} x2={230} y1={TOP} y2={TOP} stroke="currentColor" strokeDasharray="3 4" opacity={.5}/>
   <text x={12} y={TOP-6} className={css.svgSmall}>2 m</text>
   {col(88,50,65,57,'#ff9f3a','Futsal ball','Futsal')}
   {col(152,120,165,142,'#ffffff','Grass ball','Grass')}
   <line x1={10} x2={230} y1={GROUND} y2={GROUND} stroke="currentColor" strokeWidth={2}/>
  </svg>
  <figcaption><button type="button" className={css.btn} onClick={()=>setN(v=>v+1)}>Drop both balls</button></figcaption>
 </figure>;
}
