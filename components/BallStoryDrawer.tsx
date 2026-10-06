'use client';
import {useEffect,useRef,useState} from 'react';
import {DoneButton} from './DoneButton';
import slide from './DrawerSlide.module.css';
import {DRAWER_SLIDE_OUT_MS,showDrawer} from './drawerSlide';
import styles from './BallStoryDrawer.module.css';
import type {WcBall} from '@/lib/museum/wcBalls/catalog';
import {ballDecals} from '@/lib/museum/wcBalls/designs';
import {BALL_MODELS} from '@/lib/museum/wcBalls/models';

/**
 * "The story of this ball" as a slide-out (Oct 5 2026, user: "the story of this ball should open up a slideout"). The island's
 * shared right-side drawer slide (DrawerSlide.module.css + showDrawer, like the island pocket), dressed in the ball gallery's
 * white studio look: the year and host, the ball's facts, maker and panels, its sources and the credits for its model/printing.
 * The gallery's ball keeps turning behind the tint. Escape or Done slides it closed.
 */
export default function BallStoryDrawer({ball,onClose}:{ball:WcBall;onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null),done=useRef<HTMLButtonElement>(null),timer=useRef<ReturnType<typeof setTimeout>>(),closing=useRef(false);
 const [leaving,setLeaving]=useState(false);
 useEffect(()=>{if(dialog.current)showDrawer(dialog.current,done.current);return()=>clearTimeout(timer.current);},[]);
 const close=()=>{if(closing.current)return;closing.current=true;if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){onClose();return;}setLeaving(true);timer.current=setTimeout(onClose,DRAWER_SLIDE_OUT_MS);};
 const model=BALL_MODELS[ball.id],printing=Array.from(new Set(ballDecals(ball.id).map(d=>d.credit).filter(Boolean)));
 return <dialog ref={dialog} className={`${styles.dialog} ${slide.drawer} ${leaving?slide.leaving:slide.entering}`} data-ball-story={ball.id} aria-labelledby="ball-story-title"
  onCancel={e=>{e.preventDefault();close();}} onPointerDown={e=>{if(e.target===e.currentTarget)close();}}>
  <section className={`${styles.panel} ${slide.panel}`}>
   <header className={styles.head}>
    <div><span className={styles.eyebrow}>{ball.year} · {ball.host}</span><h2 id="ball-story-title">{ball.name}</h2>
     {(ball.maker||ball.panels)&&<p className={styles.meta}>{[ball.maker,ball.panels].filter(Boolean).join(' · ')}</p>}</div>
    <DoneButton ref={done} onDone={close}/>
   </header>
   <ol className={styles.facts}>{ball.facts.map((f,i)=><li key={f}><span aria-hidden="true">{String(i+1).padStart(2,'0')}</span><p>{f}</p></li>)}</ol>
   {ball.sources.length>0&&<details className={styles.more}><summary>Sources</summary><ul>{ball.sources.map(s=><li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a></li>)}</ul></details>}
   <details className={styles.more}><summary>Credits</summary><ul>
    {model&&<li>3D model: <a href={model.credit.url} target="_blank" rel="noopener noreferrer">“{model.credit.title}”</a> by {model.credit.author}, {model.credit.licence}{model.credit.changed?` (${model.credit.changed})`:''}</li>}
    {printing.map(c=><li key={c}>Printing from {c}</li>)}
    {!model&&!printing.length&&<li>Drawn for Futbol Island from the ball’s design patents and photos.</li>}
    <li>adidas, FIFA and ball names are trademarks of their owners. Shown for football history; Futbol Island is not affiliated with them.</li></ul></details>
  </section>
 </dialog>;
}
