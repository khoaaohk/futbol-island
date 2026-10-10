'use client';
import {memo,useEffect,useRef,useState} from 'react';
import {mountFigure,type FigureDef,type FigureHandle} from './hairline/figure';
import styles from './Experience.module.css';
/**
 * One era's picture on the scroll: a hairline figure drawn as a hakubyō ink-line painting. It is mounted only while the era is
 * active or a neighbour (`live`); when it scrolls out of that window it is destroyed once it is well off screen (≈ 650 ms), so at
 * most three figures exist. Painted in ink only; the colour on the scroll comes from the clouds and the seals.
 */
function FigureSlot({def,live,active,label}:{def:FigureDef;live:boolean;active:boolean;label:string}){
 const host=useRef<HTMLDivElement>(null),fig=useRef<FigureHandle|null>(null),activeRef=useRef(active);activeRef.current=active;
 const [mounted,setMounted]=useState(live);
 useEffect(()=>{if(live){setMounted(true);return;}const t=setTimeout(()=>setMounted(false),650);return()=>clearTimeout(t);},[live]);
 useEffect(()=>{const el=host.current;if(!mounted||!el)return;const h=mountFigure(el,def,activeRef.current);fig.current=h;
  return()=>{h.destroy();fig.current=null;};},[mounted,def]);
 useEffect(()=>{fig.current?.setActive(active);},[active,mounted]);
 return <div className={styles.slot} data-active={active||undefined} data-tl-figure={mounted?'on':'off'} aria-hidden={active?undefined:true}>
  <div ref={host} className={styles.fig} role="img" aria-label={label}/>
 </div>;
}
export default memo(FigureSlot);
