"use client";
import {Icon} from './Icon';

import {useEffect,useRef,useState,type ReactNode,type PointerEvent,type KeyboardEvent} from 'react';
import styles from './IslandMapFrame.module.css';

type Point={x:number;y:number};
type View={position:Point|null;rotated:boolean;width:number;height:number};
const viewport=()=>({x:window.visualViewport?.offsetLeft??0,y:window.visualViewport?.offsetTop??0,width:window.visualViewport?.width??window.innerWidth,height:window.visualViewport?.height??window.innerHeight});
const clamp=(p:Point,width:number,height:number):Point=>{const v=viewport();return{x:Math.max(v.x+8,Math.min(v.x+Math.max(8,v.width-width-8),p.x)),y:Math.max(v.y+8,Math.min(v.y+Math.max(8,v.height-height-8),p.y))};};

/** Existing radar shell, with viewport-safe controls shared by Explore map content. */
export function IslandMapFrame({children,open=true}:{children:ReactNode;open?:boolean}) {
  const ref=useRef<HTMLDivElement>(null);
  const motion=useRef<Animation|null>(null);
  useEffect(()=>{const el=ref.current;if(!el)return;const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches,style=getComputedStyle(el),from=motion.current?{opacity:style.opacity,scale:style.scale,translate:style.translate}:{opacity:0,scale:'.88',translate:'0 12px'};motion.current?.cancel();motion.current=el.animate([from,open?{opacity:1,scale:'1',translate:'0 0'}:{opacity:0,scale:'.88',translate:'0 12px'}],{duration:reduced?0:240,easing:'cubic-bezier(.22,.68,0,1)',fill:'both'});},[open]);
  useEffect(()=>()=>motion.current?.cancel(),[]);
  const drag=useRef<{id:number;dx:number;dy:number;button:HTMLButtonElement}|null>(null);
  const [view,setView]=useState<View>({position:null,rotated:false,width:150,height:200});
  const release=()=>{const d=drag.current;drag.current=null;if(d){try{if(d.button.hasPointerCapture(d.id))d.button.releasePointerCapture(d.id);}catch{/* pointer already cancelled */}}};
  useEffect(()=>{
    const measure=()=>{const el=ref.current;if(!el)return;const width=el.offsetWidth,height=el.offsetHeight;setView(old=>{const position=old.position?clamp(old.position,old.rotated?height:width,old.rotated?width:height):null;if(old.width===width&&old.height===height&&position?.x===old.position?.x&&position?.y===old.position?.y)return old;return{...old,width,height,position};});};
    const hidden=()=>{if(document.hidden)release();};
    const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(measure):null;
    if(ref.current)observer?.observe(ref.current);measure();
    window.addEventListener('resize',measure);window.visualViewport?.addEventListener('resize',measure);
    window.addEventListener('blur',release);document.addEventListener('visibilitychange',hidden);
    return()=>{observer?.disconnect();window.removeEventListener('resize',measure);window.visualViewport?.removeEventListener('resize',measure);window.removeEventListener('blur',release);document.removeEventListener('visibilitychange',hidden);release();};
  },[]);
  const rotate=()=>{release();const el=ref.current;if(!el)return;const box=el.getBoundingClientRect(),width=el.offsetWidth,height=el.offsetHeight;setView(old=>{const rotated=!old.rotated,w=rotated?height:width,h=rotated?width:height;return{width,height,rotated,position:clamp({x:box.x+(box.width-w)/2,y:box.y+(box.height-h)/2},w,h)};});};
  const start=(event:PointerEvent<HTMLButtonElement>)=>{
    if(event.button!==0||drag.current)return;
    event.preventDefault();event.stopPropagation();const box=ref.current?.getBoundingClientRect();if(!box)return;
    event.currentTarget.focus({preventScroll:true});event.currentTarget.setPointerCapture(event.pointerId);
    drag.current={id:event.pointerId,dx:event.clientX-box.left,dy:event.clientY-box.top,button:event.currentTarget};
    setView(old=>({...old,position:clamp({x:box.left,y:box.top},box.width,box.height)}));
  };
  const move=(event:PointerEvent<HTMLButtonElement>)=>{const d=drag.current;if(!d||d.id!==event.pointerId)return;event.preventDefault();event.stopPropagation();setView(old=>({...old,position:clamp({x:event.clientX-d.dx,y:event.clientY-d.dy},old.rotated?old.height:old.width,old.rotated?old.width:old.height)}));};
  const end=(event:PointerEvent<HTMLButtonElement>)=>{if(drag.current?.id===event.pointerId)release();};
  const keyboard=(event:KeyboardEvent<HTMLButtonElement>)=>{
    const directions:Record<string,Point>={ArrowLeft:{x:-1,y:0},ArrowRight:{x:1,y:0},ArrowUp:{x:0,y:-1},ArrowDown:{x:0,y:1}};
    const delta=directions[event.key];if(!delta)return;
    event.preventDefault();event.stopPropagation();const box=ref.current?.getBoundingClientRect();if(!box)return;
    const step=event.shiftKey?30:10;
    setView(old=>({...old,position:clamp({x:box.left+delta.x*step,y:box.top+delta.y*step},old.rotated?old.height:old.width,old.rotated?old.width:old.height)}));
  };
  // Position stores the visible bounding box, not the rotated layout rectangle.
  const dx=view.rotated?(view.width-view.height)/2:0,dy=-dx;
  const buttonStyle={transform:`rotate(${view.rotated?90:0}deg)`};
  return <div ref={ref} className={styles.frame} aria-label="Pitch radar" role="region" aria-hidden={!open} style={{pointerEvents:open?'auto':'none',...(view.position?{position:'fixed',left:view.position.x-dx,top:view.position.y-dy,right:'auto',bottom:'auto'}:{}),transform:`rotate(${view.rotated?-90:0}deg)`}}>
    {children}
    <button type="button" className={`${styles.control} ${styles.rotate}`} style={buttonStyle} onClick={rotate} data-tip="Rotate" aria-label="Rotate radar" aria-pressed={view.rotated}><Icon name={view.rotated?'rotate':'reset'}/></button>
    <button type="button" className={`${styles.control} ${styles.drag}`} style={buttonStyle} onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end} onKeyDown={keyboard} data-tip="Drag to move the radar · arrow keys also move it" aria-label="Move radar using drag or arrow keys"><Icon name="move"/></button>
  </div>;
}
