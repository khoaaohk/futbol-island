'use client';
import {memo,useEffect,useRef,useState} from 'react';
import {mountFigure,type FigureDef,type FigureHandle} from './hairline/figure';
import styles from './Experience.module.css';
/**
 * One era's place on the wall. The hairline figure is mounted only while the era is active or a neighbour (`live`); when it
 * slides out of that window it is destroyed once its exit transition has played (≈ 650 ms), so at most three figures exist.
 */
function FigureSlot({def,offset,live,active,label}:{def:FigureDef;offset:number;live:boolean;active:boolean;label:string}){
 const host=useRef<HTMLDivElement>(null),fig=useRef<FigureHandle|null>(null),activeRef=useRef(active);activeRef.current=active;
 const [mounted,setMounted]=useState(live);
 useEffect(()=>{if(live){setMounted(true);return;}const t=setTimeout(()=>setMounted(false),650);return()=>clearTimeout(t);},[live]);
 useEffect(()=>{const el=host.current;if(!mounted||!el)return;const h=mountFigure(el,def,activeRef.current);fig.current=h;
  return()=>{h.destroy();fig.current=null;};},[mounted,def]);
 useEffect(()=>{fig.current?.setActive(active);},[active,mounted]);
 return <div className={styles.slot} data-off={Math.max(-2,Math.min(2,offset))} data-tl-figure={mounted?'on':'off'} aria-hidden={active?undefined:true}>
  <div ref={host} className={styles.fig} role="img" aria-label={label}/>
 </div>;
}
export default memo(FigureSlot);
