'use client';
import {useEffect,useRef,useState} from 'react';
import styles from './ArcadeLoading.module.css';
import LoadingBeanCast from './LoadingBeanCast';

function Machine({x,y,color,title,index}:{x:number;y:number;color:string;title:string;index:number}){
 return <g transform={`translate(${x} ${y})`}><g className={styles.machine} data-arcade-loading-machine={index}>
  <path d="M0 15 99 0 123 22 123 209 24 224 0 204Z" fill="#14292c"/>
  <path d="M99 0 123 22 123 209 99 193Z" fill="#102022"/>
  <path d="M0 15 99 0 99 193 24 207 0 192Z" fill="#21162e" stroke={color} strokeWidth="2"/>
  <path d="M8 26 89 14 89 37 8 49Z" fill="#162e31"/>
  <text x="47" y="36" textAnchor="middle" transform="rotate(-8 47 36)" fontSize="9" fontWeight="bold" fill="#fff0cb">{title}</text>
  <path d="M10 58 88 45 81 115 17 126Z" fill="#071e23" stroke={color} strokeWidth="3"/>
  <path d="m21 71 57-9-5 40-47 9Z" fill="#4c8072"/>
  <path d="m49 67-4 39m-20-17 49-8" fill="none" stroke="#b6d6aa" strokeWidth="1.5"/>
  <ellipse cx="48" cy="86" rx="9" ry="8" fill="none" stroke="#b6d6aa"/>
  <circle cx="39" cy="90" r="4" fill="#ebc35d"/><circle cx="60" cy="77" r="4" fill="#e59a83"/><circle cx="49" cy="95" r="2" fill="#fff2d2"/>
  <path d="m17 126 64-11 18 19-82 14Z" fill="#655076"/>
  <path d="m34 137 0-13" stroke="#182a2e" strokeWidth="4"/><circle cx="34" cy="122" r="5" fill="#e78c77"/>
  <ellipse cx="67" cy="130" rx="5" ry="3" fill="#df906c"/><ellipse cx="80" cy="127" rx="5" ry="3" fill="#749ba9"/>
  <path d="m24 159 62-11v31l-62 11Z" fill="#1d3839"/><path d="m49 165 15-2" stroke="#e4c369" strokeWidth="3"/>
 </g></g>;
}
/** Static SVG illustration: no game engine, audio, preview scenes or animation loop. */
export default function ArcadeLoading({exiting=false}:{exiting?:boolean}){
 const [variation,setVariation]=useState(0),picked=useRef(false);
 useEffect(()=>{if(picked.current)return;picked.current=true;let next=Math.floor(Math.random()*5);try{const prior=sessionStorage.getItem('fi2-arcade-loader-cast');if(prior!==null)next=(Number(prior)+1)%5;sessionStorage.setItem('fi2-arcade-loader-cast',String(next));}catch{}setVariation(next);},[]);
 return <div className={`${styles.screen} ${exiting?styles.exiting:''}`} data-arcade-loading data-cast-variation={variation} role="status" aria-label="Loading the arcade">
  <div className={styles.copy}><h2>Arcade</h2><span className="island-loading-track" aria-hidden="true"><span/></span></div>
  <div className={styles.castLayer} data-arcade-loading-items><LoadingBeanCast variant="arcade" variation={variation}/></div>
  <svg className={styles.art} viewBox="0 0 760 440" role="img" aria-label="Colorful football arcade machines" xmlns="http://www.w3.org/2000/svg">
   <g className={styles.scenery}><path d="M56 270 381 190 719 274 409 407Z" fill="#251a3b"/><path d="m56 270 353 137v18L56 288Zm353 137 310-133v17L409 425Z" fill="#122c30"/>
   <path d="m120 288 280 100m-195-126 280 90m-192-112 280 86m-191-108 280 83" stroke="#563b70" strokeWidth="2"/>
   </g><Machine index={0} x={112} y={112} color="#ff65c8" title="STRIKERS"/>
   <Machine index={1} x={308} y={74} color="#b991ff" title="TENNIS"/>
   <Machine index={2} x={507} y={113} color="#60e9f2" title="PINBALL"/>
   <g className={styles.scenery}><path d="m92 90 112-27m299 0 127 32" stroke="#60e9f2" strokeWidth="4" strokeLinecap="round" opacity=".55"/>
   <g fill="#f2d086"><circle cx="257" cy="87" r="4"/><circle cx="465" cy="87" r="4"/><circle cx="86" cy="135" r="3"/><circle cx="650" cy="145" r="3"/></g></g>
  </svg>
 </div>;
}
