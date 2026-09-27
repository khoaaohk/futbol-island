"use client";
import {useEffect,useRef,type ReactNode} from 'react';
import styles from './IslandMapFrame.module.css';

/** Fixed radar shell with the existing show/hide animation. */
export function IslandMapFrame({children,open=true}:{children:ReactNode;open?:boolean}) {
  const ref=useRef<HTMLDivElement>(null);
  const motion=useRef<Animation|null>(null);
  useEffect(()=>{const el=ref.current;if(!el)return;const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches,style=getComputedStyle(el),from=motion.current?{opacity:style.opacity,scale:style.scale,translate:style.translate}:{opacity:0,scale:'.88',translate:'0 12px'};motion.current?.cancel();motion.current=el.animate([from,open?{opacity:1,scale:'1',translate:'0 0'}:{opacity:0,scale:'.88',translate:'0 12px'}],{duration:reduced?0:240,easing:'cubic-bezier(.22,.68,0,1)',fill:'both'});},[open]);
  useEffect(()=>()=>motion.current?.cancel(),[]);
  return <div ref={ref} className={styles.frame} aria-label="Pitch radar" role="region" aria-hidden={!open} style={{pointerEvents:open?'auto':'none'}}>{children}</div>;
}
