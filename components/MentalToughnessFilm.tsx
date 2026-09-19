'use client';
import {BackButton} from './BackButton';
import {DoneButton} from './DoneButton';
import {useEffect,useId,useRef,useState} from 'react';
import {holdVideoPlayback} from '@/lib/videoPlayback';
import {Icon} from './Icon';
import shell from './BallHuntLesson.module.css';
import modal from './ModalShell.module.css';
import store from './IslandStore.module.css';
import styles from './MentalToughnessFilm.module.css';

const CAPTIONS=[
 'Mental toughness means handling hard moments and choosing your next useful action.',
 'In futbol, mistakes and pressure happen. Luna misses and feels upset.',
 'Being tough does not mean hiding feelings or never asking for help.',
 'One mistake is not your whole game. Remember what you can learn.',
 'First, notice the feeling. Relax your shoulders and breathe out slowly.',
 'Choose a reset word: “Next.” Bring your attention back to the game.',
 'Why does this matter? Frustration can distract you from teammates and space.',
 'Focus on what you can control: move into space and offer support.',
 'Try one useful action. A calm first touch can start the next play.',
 'Ask a teammate or coach for help. Mental toughness grows with support.',
 'Practice the reset: notice, breathe, choose. Use it after mistakes or losses.',
 'You can feel disappointed and still take a helpful next step.' 
];
export default function MentalToughnessFilm({onClose,onFinish,embedded=false}:{onClose:()=>void;onFinish:()=>void;embedded?:boolean}){
 const uid=useId(),dialog=useRef<HTMLDialogElement>(null),root=useRef<HTMLDivElement>(null),video=useRef<HTMLVideoElement>(null);
 const release=useRef<(()=>void)|null>(null);
 const [playing,setPlaying]=useState(false),[started,setStarted]=useState(false),[completed,setCompleted]=useState(false),[time,setTime]=useState(0),[muted,setMuted]=useState(false),[error,setError]=useState(false);
 const stop=()=>{release.current?.();release.current=null;};
 const dismiss=()=>{video.current?.pause();stop();if(completed)onFinish();else onClose();};
 useEffect(()=>{
  const previous=document.activeElement as HTMLElement|null,outer=embedded?root.current?.closest('dialog'):dialog.current,label=outer?.getAttribute('aria-labelledby');
  if(embedded){outer?.setAttribute('aria-labelledby',uid);root.current?.querySelector<HTMLButtonElement>('button')?.focus({preventScroll:true});}else dialog.current?.showModal();
  try{setMuted(localStorage.getItem('fi2-sound-muted')==='true');}catch{}
  const node=video.current;
  const hide=()=>{if(document.hidden)node?.pause();};
  const other=(event:Event)=>{if((event as CustomEvent).detail!==uid)node?.pause();};
  document.addEventListener('visibilitychange',hide);document.addEventListener('fi2-video-play',other);
  const observer=new IntersectionObserver(entries=>{if(!entries[0]?.isIntersecting)node?.pause();});if(node)observer.observe(node);
  return()=>{observer.disconnect();document.removeEventListener('visibilitychange',hide);document.removeEventListener('fi2-video-play',other);node?.pause();node?.removeAttribute('src');node?.load();stop();if(embedded&&label)outer?.setAttribute('aria-labelledby',label);if(!embedded)dialog.current?.close();previous?.focus?.({preventScroll:true});};
 },[embedded,uid]);
 const toggle=async()=>{
  const node=video.current;if(!node)return;
  if(!node.paused){node.pause();return;}
  if(node.ended){node.currentTime=0;setTime(0);}
  if(!node.getAttribute('src')){node.src='/stories/films/mental-toughness.mp4?v=atlas-layers-8';node.load();}
  try{const saved=localStorage.getItem('fi2-sound-volume');const volume=saved===null?.5:Number(saved);node.volume=Number.isFinite(volume)?Math.max(0,Math.min(1,volume)):.5;}catch{node.volume=.5;}setError(false);
  try{await node.play();setStarted(true);}catch{setError(true);stop();}
 };
 const content=<section className={`${shell.panel} ${modal.shell}`}>
  <header className={modal.header}>{embedded&&<BackButton className={store.close} onBack={dismiss}/>}<h2 id={uid} className={styles.title}>11v11 · Mental Toughness</h2><DoneButton className={store.close} onDone={dismiss}/></header>
  <div className={`${modal.body} ${styles.body}`}>
   <div className={styles.film}>
    <video ref={video} className={styles.video} poster="/stories/films/mental-toughness.jpg?v=atlas-layers-8" preload="none" playsInline muted={muted} aria-label="Mental toughness: Luna finds her next useful moment" aria-describedby={uid+'-caption'} onTimeUpdate={e=>setTime(e.currentTarget.currentTime)} onPlay={()=>{document.dispatchEvent(new CustomEvent('fi2-video-play',{detail:uid}));release.current??=holdVideoPlayback();setPlaying(true);}} onPause={()=>{setPlaying(false);stop();}} onEnded={()=>{setPlaying(false);setCompleted(true);stop();}} onError={()=>{setPlaying(false);setError(true);stop();}}/>
    <div id={uid+'-caption'} className={styles.caption}>{!started?'Mental toughness: finding your next useful action.':CAPTIONS[Math.min(11,Math.floor(time/5))]}</div>
    <div className={styles.controls}>
     <button type="button" onClick={toggle}>{playing?'Pause':completed&&time>=59.9?'Replay':started?'Continue':'Play story'}</button>
     <progress value={time} max={60} aria-label="Story progress"/>
     <button type="button" onClick={()=>setMuted(v=>!v)} aria-pressed={muted}>{muted?'Sound off':'Sound on'}</button>
    </div>
   </div>
   {error&&<p role="alert">The story could not play. Try Play story again.</p>}
  </div>
  <footer className={styles.footer}><button type="button" className={shell.primary} onClick={dismiss}>Done</button></footer>
 </section>;
 if(embedded)return <div ref={root} className={styles.embedded} data-story-view data-story-complete={completed} onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();dismiss();}}}>{content}</div>;
 return <dialog ref={dialog} className={store.dialog} aria-labelledby={uid} onCancel={e=>{e.preventDefault();dismiss();}} onClick={e=>{if(e.target===e.currentTarget)dismiss();}}>{content}</dialog>;
}
