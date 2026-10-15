'use client';
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {registerIslandNarration,islandNarrationAllowed} from '@/lib/audio/islandNarration';
import {narrationOn,narrationVolume} from '@/lib/tutorial/tutorialAudio';
import {TUTORIAL_SCENES} from '@/lib/tutorial/islandTutorial';
import IslandTutorialArt from './IslandTutorialArt';
import {countTutorialFinish,countTutorialOpen} from '@/lib/analytics/learnEvents';
import styles from './IslandTutorial.module.css';

type Status='playing'|'paused'|'finished';

/**
 * The Island Tutorial plays inside the Paths hero card (it replaces the card's content, same box). Scenes are flat riso SVG art
 * with a few CSS transform loops; narration is one <audio> element; captions are always on under the art.
 *
 * Heat: nothing exists until the card's "Island Tutorial" button mounts this (next/dynamic). No requestAnimationFrame at all:
 * a single setTimeout ends each scene, and every CSS loop pauses (animation-play-state) whenever playback is paused, finished,
 * the tab is hidden or the card is scrolled off-screen. Closing unmounts it, which stops and releases the audio.
 */
export default function IslandTutorial({onClose,primed}:{onClose:()=>void;primed?:HTMLAudioElement|null}){
 const root=useRef<HTMLDivElement>(null),audio=useRef<HTMLAudioElement|null>(null);
 const [index,setIndex]=useState(0),[status,setStatus]=useState<Status>('playing'),[run,setRun]=useState(0);
 const [muted,setMuted]=useState(()=>!narrationOn()),[awake,setAwake]=useState(true),[audioFailed,setAudioFailed]=useState(false);
 // Seconds already played of the current scene (kept across pause, mute and visibility changes).
 const clock=useRef({key:'',elapsed:0});
 const scene=TUTORIAL_SCENES[index],last=TUTORIAL_SCENES.length-1;
 const active=status==='playing'&&awake;

 // One audio element for the tutorial's lifetime (the one the opening tap primed, see lib/tutorial/tutorialAudio.ts), released on close.
 useEffect(()=>{
  const media=primed??new Audio();media.preload='auto';media.volume=narrationVolume();audio.current=media;
  const release=registerIslandNarration(media),fail=()=>{if(media.getAttribute('src'))setAudioFailed(true);};media.addEventListener('error',fail);
  root.current?.focus({preventScroll:true});
  return()=>{release();media.removeEventListener('error',fail);media.pause();delete media.dataset.scene;media.removeAttribute('src');media.load();audio.current=null;};
 // eslint-disable-next-line react-hooks/exhaustive-deps -- adopted once
 },[]);
 // Admin analytics (map increments only): the tutorial opened, and its last scene reached.
 useEffect(()=>{countTutorialOpen();},[]);
 useEffect(()=>{if(status==='finished')countTutorialFinish();},[status]);
 // Sleep while the tab is hidden or the card is off-screen; wake where it left off.
 useEffect(()=>{const node=root.current;if(!node)return;let onScreen=true;
  const update=()=>setAwake(onScreen&&!document.hidden);
  const observer=typeof IntersectionObserver==='undefined'?null:new IntersectionObserver(entries=>{onScreen=Boolean(entries[0]?.isIntersecting);update();});observer?.observe(node);
  document.addEventListener('visibilitychange',update);return()=>{observer?.disconnect();document.removeEventListener('visibilitychange',update);};},[]);
 // The scene clock: one timer per playing stretch. Narration (when sound is on) plays alongside from the same offset; the scene
 // waits for a late clip to finish so a line is never cut, and a muted scene follows its caption timing (the same seconds).
 useEffect(()=>{
  const media=audio.current,key=`${run}:${index}`,c=clock.current;if(c.key!==key){c.key=key;c.elapsed=0;}
  if(!active)return;
  const started=performance.now();let done=false,timer:ReturnType<typeof setTimeout>|undefined,wait:ReturnType<typeof setTimeout>|undefined;
  const end=()=>{if(done)return;done=true;if(index<last)setIndex(index+1);else setStatus('finished');};
  const voiced=Boolean(media&&!muted&&scene.audio&&c.elapsed<scene.clip-.05&&islandNarrationAllowed());
  if(media&&voiced){
   if(media.dataset.scene!==scene.audio){media.dataset.scene=scene.audio;media.src=scene.audio;setAudioFailed(false);}
   try{media.currentTime=c.elapsed;}catch{}
   media.muted=false;void media.play().catch(error=>{if(error?.name==='NotAllowedError')setMuted(true);else if(error?.name!=='AbortError')setAudioFailed(true);});
  }
  const finishLine=()=>{if(media&&voiced&&!media.paused&&!media.ended){const ended=()=>setTimeout(end,250);media.addEventListener('ended',ended,{once:true});wait=setTimeout(end,4000);}else end();};
  timer=setTimeout(finishLine,Math.max(0,scene.seconds-c.elapsed)*1000);
  return()=>{done=true;clearTimeout(timer);clearTimeout(wait);c.elapsed=Math.min(scene.seconds,c.elapsed+(performance.now()-started)/1000);media?.pause();};
 },[active,index,run,muted,scene,last]);
 // Prefetch the next line while this one plays (one small clip, browser cache only).
 useEffect(()=>{if(!active||muted)return;const next=TUTORIAL_SCENES[index+1];if(!next?.audio)return;const t=setTimeout(()=>{const link=document.createElement('link');link.rel='prefetch';link.as='audio';link.href=next.audio;document.head.appendChild(link);setTimeout(()=>link.remove(),30000);},1500);return()=>clearTimeout(t);},[active,muted,index]);

 const go=(next:number)=>{const i=Math.max(0,Math.min(last,next));setIndex(i);setRun(r=>r+1);if(status==='finished')setStatus('playing');};
 const toggle=()=>{if(status==='finished'){replay();return;}setStatus(status==='playing'?'paused':'playing');};
 const replay=()=>{setIndex(0);setRun(r=>r+1);setStatus('playing');};
 const keys=(e:React.KeyboardEvent)=>{
  if(e.key==='Escape'){e.preventDefault();e.stopPropagation();onClose();return;}
  e.stopPropagation();// Settings' dialog and the island must not see keys typed in the tutorial
  if(e.target instanceof HTMLElement&&e.target.closest('button'))return;
  if(e.key==='ArrowRight'){e.preventDefault();go(index+1);}else if(e.key==='ArrowLeft'){e.preventDefault();go(index-1);}else if(e.key===' '){e.preventDefault();toggle();}
 };

 return <div ref={root} className={styles.tutorial} data-island-tutorial="" data-status={status} data-active={active} data-scene={scene.id} role="region" aria-label="Island Tutorial" tabIndex={-1} onKeyDown={keys}>
  <header className={styles.top}>
   <h3 className={styles.title}>Island Tutorial</h3>
   <button type="button" className={styles.mute} onClick={()=>setMuted(m=>!m)} aria-pressed={muted} aria-label={muted?'Turn narration on':'Mute narration'}>
    {muted?<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/></svg>:<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>}
   </button>
   <button type="button" className={styles.close} onClick={onClose} aria-label="Close Island Tutorial" data-ui-sound="collapse"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg></button>
  </header>
  <div className={styles.stage}>
   <IslandTutorialArt key={`${run}:${index}`} art={scene.art} className={styles.art}/>
   <p className={styles.headline} data-text={scene.headline} key={`h${run}:${index}`} aria-hidden="true">{scene.headline}</p>
   {status==='finished'&&<div className={styles.endCard}>
    <button type="button" onClick={replay} className={styles.replay}>Watch again</button>
    <button type="button" onClick={onClose} className={styles.back}>Back to my island</button>
   </div>}
  </div>
  <div className={styles.caption} data-tutorial-caption="" aria-live="polite">
   <p key={`c${run}:${index}`}>{scene.narration}</p>
   {audioFailed&&!muted&&<small>Narration couldn’t load. The captions keep going.</small>}
  </div>
  <div className={styles.progress} role="group" aria-label="Tutorial scenes">
   {TUTORIAL_SCENES.map((s,i)=>{const chapterBreak=i>0&&s.chapter!==TUTORIAL_SCENES[i-1].chapter;
    return <button type="button" key={s.id} data-chapter-start={chapterBreak||undefined} data-state={i<index||status==='finished'?'done':i===index?'now':'next'} aria-current={i===index?'step':undefined} aria-label={`Scene ${i+1}: ${s.headline}`} onClick={()=>go(i)}>
     <span>{i===index&&status!=='finished'&&<i key={`${run}:${index}`} style={{'--scene-seconds':`${s.seconds}s`} as CSSProperties}/>}</span>
    </button>;})}
  </div>
  <div className={styles.controls}>
   <button type="button" onClick={()=>go(index-1)} disabled={index===0} aria-label="Previous scene"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
   <button type="button" className={styles.play} onClick={toggle} aria-label={status==='playing'?'Pause':status==='finished'?'Replay tutorial':'Play'}>
    {status==='playing'?<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor"/></svg>:status==='finished'?<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M5 12a7 7 0 1 0 2.2-5.1M5 4v4h4" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></svg>:<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M8 5l11 7-11 7z" fill="currentColor"/></svg>}
   </button>
   <button type="button" onClick={()=>go(index+1)} disabled={index===last} aria-label="Next scene"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
  </div>
 </div>;
}
