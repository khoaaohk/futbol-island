'use client';
import {useEffect,useRef,useState} from 'react';
import {DoneButton} from '@/components/DoneButton';
import slide from '@/components/DrawerSlide.module.css';
import {DRAWER_SLIDE_OUT_MS,showDrawer} from '@/components/drawerSlide';
import type {Exhibit} from '@/lib/endgame/museum';
import {HISTORY,MODEL_NOTE,RESEARCH,SOURCES} from './content';
import styles from './StoryDrawer.module.css';

/**
 * penalty-1891 · the story as a slide-out (Oct 5 2026, user: "the story should also open as a slideout"). The island's shared
 * right-side drawer (DrawerSlide.module.css + showDrawer, as in the World Cup ball gallery's BallStoryDrawer): a native modal
 * <dialog> over a tint, Done slides it closed, Escape or a tap outside closes it. Full width on phones. It holds McCrum's story,
 * the rule's history, what studies found, the "practice model" note and every source.
 */
export default function StoryDrawer({exhibit,onClose}:{exhibit:Exhibit;onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null),done=useRef<HTMLButtonElement>(null),timer=useRef<ReturnType<typeof setTimeout>>(),closing=useRef(false);
 const [leaving,setLeaving]=useState(false);
 useEffect(()=>{if(dialog.current)showDrawer(dialog.current,done.current);return()=>clearTimeout(timer.current);},[]);
 const close=()=>{if(closing.current)return;closing.current=true;if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){onClose();return;}setLeaving(true);timer.current=setTimeout(onClose,DRAWER_SLIDE_OUT_MS);};
 return <dialog ref={dialog} className={`${styles.dialog} ${slide.drawer} ${leaving?slide.leaving:slide.entering}`} data-penalty-story aria-labelledby="penalty-story-title"
  onCancel={e=>{e.preventDefault();close();}} onPointerDown={e=>{if(e.target===e.currentTarget)close();}}>
  <section className={`${styles.panel} ${slide.panel}`}>
   <header className={styles.head}>
    <div><span className={styles.eyebrow}>{exhibit.year} · Milford, County Armagh</span><h2 id="penalty-story-title">{exhibit.title}</h2></div>
    <DoneButton ref={done} onDone={close}/>
   </header>
   <ol className={styles.facts}>{[...exhibit.facts,...HISTORY].map((f,i)=><li key={f}><span aria-hidden="true">{String(i+1).padStart(2,'0')}</span><p>{f}</p></li>)}</ol>
   <h3 className={styles.h3}>Where to aim? What studies found</h3>
   <ul className={styles.list}>{RESEARCH.map(f=><li key={f}>{f}</li>)}</ul>
   <h3 className={styles.h3}>About this game</h3>
   <p className={styles.note}>{MODEL_NOTE} The players are the island’s own characters.</p>
   <p className={styles.take}><b>Take it to your game:</b> {exhibit.forYourGame}</p>
   <details className={styles.more}><summary>Sources</summary><ul>{[...exhibit.sources,...SOURCES].map(s=><li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a></li>)}</ul></details>
  </section>
 </dialog>;
}
