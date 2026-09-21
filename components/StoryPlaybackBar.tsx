'use client';
import {useEffect,useRef,useState,type ReactNode} from 'react';
import {Icon} from './Icon';
import styles from './StoryPlaybackBar.module.css';

type Chapter={label:string;narration:string};
type Props={cue?:ReactNode;title:string;playing:boolean;started:boolean;completed:boolean;muted:boolean;time:number;duration:number;caption:string;captionId?:string;transcript:Chapter[];segments?:{label:string}[];ageNote?:string;error?:string;className?:string;chapter?:number;onToggle:()=>void;onReplay:()=>void;onMute:()=>void;onPause:()=>void;onSeekChapter?:(index:number)=>void;onSeekTime?:(time:number)=>void};
const stamp=(seconds:number)=>{const value=Math.max(0,Math.floor(Number.isFinite(seconds)?seconds:0));return `${Math.floor(value/60)}:${String(value%60).padStart(2,'0')}`;};
/** One segmented chapter bar for every story. `segments` (visual chapters) may differ from `transcript` (caption paragraphs) for single-track narration. */
export default function StoryPlaybackBar({cue,title,playing,started,completed,muted,time,duration,caption,captionId,transcript,segments,ageNote,error,className='',chapter,onToggle,onReplay,onMute,onPause,onSeekChapter,onSeekTime}:Props){
 const bar=segments??transcript;
 const [reading,setReading]=useState(false),opened=useRef(false),read=useRef<HTMLButtonElement>(null),back=useRef<HTMLButtonElement>(null);
 useEffect(()=>{if(reading){opened.current=true;back.current?.focus({preventScroll:true});}else if(opened.current)read.current?.focus({preventScroll:true});},[reading]);
 const playLabel=playing?'Pause':completed?'Replay story':started?'Continue':'Play story';
 if(reading)return <article className={styles.transcript} aria-label="Story transcript" onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();setReading(false);}}}>
  <button ref={back} className={styles.control} data-transcript-back onClick={()=>setReading(false)}>Back to story</button><h3>{title}</h3>
  {transcript.map((item,index)=><p key={index}>{item.label&&<><strong>{item.label}</strong><br/></>}{item.narration}</p>)}
  {ageNote&&<small>{ageNote}</small>}
 </article>;
 return <div role="region" className={`${styles.tray} ${className}`} data-story-playback-bar aria-label="Story playback and captions">
  {cue}
  <nav className={styles.controls} aria-label="Story playback">
   <div className={styles.transport}>
    <button className={`${styles.control} ${styles.play}`} onClick={completed?onReplay:onToggle} aria-label={playLabel}><Icon name={playing?'pause':'play'}/><span>{playLabel}</span></button>
    {started&&!completed&&<button className={`${styles.control} ${styles.replay}`} onClick={onReplay} aria-label="Replay story from beginning" title="Replay story"><Icon name="reset"/></button>}
   </div>
   <span className={styles.clock} aria-label="Elapsed and total story time">{stamp(time)} / {stamp(Math.ceil(duration))}</span>
   <div className={styles.actions}>
    <button className={styles.control} onClick={onMute} aria-label={muted?'Unmute narration':'Mute narration'} aria-pressed={!muted} title={muted?'Sound off':'Sound on'}><span className={styles.soundIcon}><Icon name="volume"/>{muted&&<span className={styles.muteSlash}/>}</span></button>
    <button ref={read} className={styles.control} data-read-story aria-label="Read story transcript" onClick={()=>{onPause();setReading(true);}}>Read</button>
   </div>
  </nav>
  {onSeekChapter?<div className={styles.progress} role="group" aria-label="Story chapters">{bar.map((item,index)=><button key={index} className={styles.dot} data-current={index===chapter} data-complete={index<(chapter??0)||completed} aria-label={`Chapter ${index+1}: ${item.label}`} aria-current={index===chapter?'step':undefined} onClick={()=>onSeekChapter(index)}/>)}</div>:onSeekTime?<input className={styles.seek} type="range" aria-label="Story progress" min={0} max={duration||1} step={.1} value={Math.min(time,duration||1)} onChange={e=>onSeekTime(Number(e.currentTarget.value))}/>:null}
  <div className={styles.captionArea}><p id={captionId} className={styles.caption}>{caption}</p></div>
  {error&&<p className={styles.notice} role="status">{error}</p>}
 </div>;
}
