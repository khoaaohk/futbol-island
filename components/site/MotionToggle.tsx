'use client';
import {useEffect,useRef,useState} from 'react';
import styles from '@/app/(site)/site.module.css';
/**
 * Play / pause for an animated scene diagram (Nov 15 2026; components/site/AnimatedScene.tsx). It only flips attributes on the
 * figure: `data-paused` (the reader pressed Pause) and `data-away` (the diagram is off screen, so a loop nobody sees never runs:
 * phone heat, AGENTS.md). The motion itself is CSS. Under prefers-reduced-motion the CSS shows the still picture and hides this.
 */
export default function MotionToggle({name,lang}:{name:string;lang?:'es'}){/* lang (Nov 15 2026): the Spanish pages' words */
 const es=lang==='es';
 const ref=useRef<HTMLButtonElement>(null),[paused,setPaused]=useState(false);
 useEffect(()=>{ref.current?.closest('[data-anim]')?.toggleAttribute('data-paused',paused);},[paused]);
 useEffect(()=>{
  const host=ref.current?.closest('[data-anim]');if(!host||typeof IntersectionObserver==='undefined')return;
  const io=new IntersectionObserver(([e])=>host.toggleAttribute('data-away',!e.isIntersecting));io.observe(host);return()=>io.disconnect();
 },[]);
 return <button ref={ref} type="button" className={styles.animBtn} aria-label={es?`${paused?'Reproducir':'Pausar'} la animación: ${name}`:`${paused?'Play':'Pause'} the ${name} animation`} onClick={()=>setPaused(p=>!p)} data-motion-toggle="">
  <span aria-hidden="true" className={styles.animIco} data-ico={paused?'play':'pause'}/>{/* a CSS shape, not an <svg>: page SVGs are diagrams with title/desc */}
  {es?(paused?'Reproducir':'Pausar'):(paused?'Play':'Pause')}
 </button>;
}
