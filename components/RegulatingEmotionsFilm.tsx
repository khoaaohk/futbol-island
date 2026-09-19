'use client';
import {DoneButton} from './DoneButton';
import {useLayoutEffect,useId,useRef,useState} from 'react';
import {holdVideoPlayback} from '@/lib/videoPlayback';
import {Icon} from './Icon';
import styles from './GritFilm.module.css';
import local from './RegulatingEmotionsFilm.module.css';

import timeline from '@/public/stories/films/regulate/timeline.json';
const CAPTIONS=timeline.cues.map(cue=>[cue.start,cue.text] as [number,string]);
export default function RegulatingEmotionsFilm({onClose,onFinish,embedded: _embedded=false,origin}:{onClose:()=>void;onFinish:()=>void;embedded?:boolean;origin?:{x:number;y:number;size:number;height:number;radius:string;color:string}}){
 const uid=useId(),dialog=useRef<HTMLDialogElement>(null),video=useRef<HTMLVideoElement>(null);
 const [entering,setEntering]=useState(!!origin),[exiting,setExiting]=useState(false);
 const release=useRef<(()=>void)|null>(null);
 const [playing,setPlaying]=useState(false),[started,setStarted]=useState(false),[completed,setCompleted]=useState(false),[time,setTime]=useState(0),[muted,setMuted]=useState(false),[error,setError]=useState(false);
 const storySource=()=>{const ratio=window.innerWidth/window.innerHeight;return '/stories/films/regulate/'+(ratio<.75?'portrait':ratio<1.34?'square':'landscape')+'.mp4?v=two-games-5-samantha-emotions';};
 const stop=()=>{release.current?.();release.current=null;};
 const finishDismiss=()=>{if(completed)onFinish();else onClose();};
 const dismiss=()=>{video.current?.pause();stop();if(origin){setEntering(false);setExiting(true);}else finishDismiss();};
 useLayoutEffect(()=>{
  const previous=document.activeElement as HTMLElement|null;dialog.current?.showModal();
  const node=video.current;let disposed=false;let introTimer:ReturnType<typeof setTimeout>|undefined;const releaseWorld=holdVideoPlayback();
  if(node){
   node.muted=false;
   try{const saved=Number(localStorage.getItem('fi2-sound-volume'));node.volume=Number.isFinite(saved)&&saved>0?Math.min(1,saved):.5;}catch{node.volume=.5;}
   node.src=storySource();
   const begin=()=>{if(disposed)return;node.play().then(()=>{if(!disposed)setStarted(true);}).catch(reason=>{if(!disposed&&reason?.name!=='AbortError'){setError(reason?.name!=='NotAllowedError');stop();}});};
   if(origin&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches)introTimer=setTimeout(begin,1350);else begin();
  }
  let pendingSeek:number|null=null,resumeAfterResize=false,resizeGeneration=0;
  const resize=()=>{
   if(!node)return;const src=storySource();if(node.getAttribute('src')===src)return;
   const at=pendingSeek??node.currentTime,resume=pendingSeek!==null?resumeAfterResize:!node.paused;
   pendingSeek=at;resumeAfterResize=resume;const generation=++resizeGeneration;
   node.pause();node.src=src;
   node.addEventListener('loadedmetadata',()=>{
    if(disposed||generation!==resizeGeneration)return;
    node.currentTime=Math.min(at,node.duration||at);pendingSeek=null;
    if(resume)void node.play().catch(reason=>{if(!disposed&&reason?.name!=='AbortError')setError(true);});
   },{once:true});
   // preload=none needs an explicit load while paused after source replacement.
   node.load();
  };
  let resizeTimer:ReturnType<typeof setTimeout>|undefined;
  const scheduleResize=()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(resize,300);};
  window.addEventListener('resize',scheduleResize);
  const hide=()=>{if(document.hidden)node?.pause();};
  const other=(event:Event)=>{if((event as CustomEvent).detail!==uid)node?.pause();};
  document.addEventListener('visibilitychange',hide);document.addEventListener('fi2-video-play',other);
  const observer=new IntersectionObserver(entries=>{if(!entries[0]?.isIntersecting)node?.pause();});if(node)observer.observe(node);
  return()=>{disposed=true;clearTimeout(introTimer);clearTimeout(resizeTimer);window.removeEventListener('resize',scheduleResize);releaseWorld();observer.disconnect();document.removeEventListener('visibilitychange',hide);document.removeEventListener('fi2-video-play',other);node?.pause();node?.removeAttribute('src');node?.load();stop();dialog.current?.close();previous?.focus?.({preventScroll:true});};
 },[uid]);
 const toggle=async()=>{
  const node=video.current;if(!node)return;
  if(!node.paused){node.pause();return;}
  if(node.ended){node.currentTime=0;setTime(0);}
  if(!node.getAttribute('src')){node.src=storySource();node.load();}
  try{const saved=localStorage.getItem('fi2-sound-volume');const volume=saved===null?.5:Number(saved);node.volume=Number.isFinite(volume)?volume>0?Math.min(1,volume):.5:.5;}catch{node.volume=.5;}setError(false);
  try{await node.play();setStarted(true);}catch{setError(true);stop();}
 };
 const replay=()=>{const node=video.current;if(!node)return;node.pause();node.currentTime=0;setTime(0);void toggle();};
 const callout=time>=timeline.emotions.anger&&time<timeline.cues[4].start?'ANGER':[...timeline.cues].reverse().find(cue=>time>=cue.start)?.title;
 return <dialog ref={dialog} className={`${styles.dialog} ${entering?styles.entering:''} ${exiting?styles.exiting:''}`} aria-labelledby={uid} data-story-view data-story-complete={completed} onCancel={e=>{e.preventDefault();e.stopPropagation();dismiss();}}>
  {(entering||exiting)&&origin&&<div className={`${styles.entryCircle} ${exiting?styles.exitCircle:''}`} aria-hidden="true" onAnimationEnd={e=>{if(exiting&&(e.animationName.includes('entryExit')||e.animationName.includes('entryFade')))finishDismiss();else if(e.animationName.includes('entryFade'))setEntering(false);}} style={{left:origin.x,top:origin.y,width:origin.size,height:origin.height,borderRadius:origin.radius,background:origin.color,'--entry-scale':Math.ceil(Math.hypot(window.innerWidth,window.innerHeight)*2/Math.min(origin.size,origin.height))} as import('react').CSSProperties}/>}
  {entering&&origin&&<div className={styles.entryButton} aria-hidden="true" style={{left:origin.x,top:origin.y,width:origin.size,height:origin.height,borderRadius:origin.radius,background:origin.color}}><svg viewBox="0 0 24 24" width="29" height="29" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4h7l2 2 2-2h7v15h-7l-2 2-2-2H3zM12 6v15M6 9h3m6 0h3M6 13h3m6 0h3"/></svg></div>}
  <video ref={video} className={styles.film} preload="none" playsInline muted={muted} aria-label="Two games: regulating emotions" aria-describedby={uid+'-caption'} onTimeUpdate={e=>setTime(e.currentTarget.currentTime)} onPlay={()=>{document.dispatchEvent(new CustomEvent('fi2-video-play',{detail:uid}));release.current??=holdVideoPlayback();setPlaying(true);}} onPause={()=>{setPlaying(false);stop();}} onEnded={()=>{setPlaying(false);setCompleted(true);stop();}} onError={()=>{setPlaying(false);setError(true);stop();}}/>
  <header className={`${styles.top} ${local.header}`}><h2 id={uid}>Regulating emotions</h2><DoneButton onDone={dismiss}/></header>
  {!started&&<picture className={styles.poster}><source media="(min-aspect-ratio: 3/4) and (max-aspect-ratio: 4/3)" srcSet="/stories/films/regulate/poster-square.jpg?v=two-games-5-samantha-emotions"/><source media="(orientation: portrait)" srcSet="/stories/films/regulate/poster-portrait.jpg?v=two-games-5-samantha-emotions"/><img src="/stories/films/regulate/poster-landscape.jpg?v=two-games-5-samantha-emotions" alt=""/></picture>}
  {started&&callout&&<div className={`${styles.callout} ${local.headline}`} aria-hidden="true">{callout}</div>}
  <div role="region" className={styles.bottom} aria-label="Story playback and captions">
   <div className={styles.controls}>
    <button type="button" onClick={completed&&time>timeline.duration-.2?dismiss:toggle}><Icon name={completed&&time>timeline.duration-.2?'check':playing?'pause':'play'}/>{completed&&time>timeline.duration-.2?'Finish story':playing?'Pause':started?'Continue':'Play story'}</button>
    {started&&<button type="button" onClick={replay} aria-label="Replay" title="Replay story"><Icon name="reset"/></button>}
    <button type="button" onClick={()=>setMuted(v=>!v)} aria-label={muted?'Turn sound on':'Mute sound'} title={muted?'Sound off':'Sound on'} aria-pressed={!muted}><span className={styles.soundIcon}><Icon name="volume"/>{muted&&<span className={styles.muteSlash}/>}</span></button>
   </div>
   <div className={styles.captionArea}><p id={uid+'-caption'} className={styles.caption}>{completed&&time>timeline.duration-.2?'Notice the feeling. Take a breath. Choose your next play.':!started?'Two games. One on the field, one in your mind.':([...CAPTIONS].reverse().find(([start])=>time>=start)?.[1])}</p></div>
   {error&&<p role="alert">The story could not play. Please try again.</p>}
  </div>
 </dialog>;
}
