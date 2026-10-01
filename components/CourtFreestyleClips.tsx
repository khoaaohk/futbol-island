'use client';
import {useEffect,useState} from 'react';
import OfficialClipPlayer from './OfficialClipPlayer';
import {FREESTYLE_CLIPS,freestyleClipStart} from '@/lib/town/courtFreestylers';
import styles from './NpcConversation.module.css';
export default function CourtFreestyleClips({clipId,variant}:{clipId?:string;variant:number}){
 const [index,setIndex]=useState(()=>freestyleClipStart(clipId,variant)),[playing,setPlaying]=useState(false),[unavailable,setUnavailable]=useState(false);
 const clip=FREESTYLE_CLIPS[index];
 useEffect(()=>{const stop=()=>{if(document.hidden)setPlaying(false);};document.addEventListener('visibilitychange',stop);return()=>document.removeEventListener('visibilitychange',stop);},[]);
 return <section className={styles.clip} aria-label="Freestyle clips" data-freestyle-clips>
 <p>{clip.prompt}</p>
 {playing?<OfficialClipPlayer id={clip.id} title={clip.title} onUnavailable={()=>{setPlaying(false);setUnavailable(true);}}/>:<button type="button" className={styles.clipPreview} onClick={()=>{setUnavailable(false);setPlaying(true);}}><img src={`https://i.ytimg.com/vi/${clip.id}/hqdefault.jpg`} width={480} height={270} loading="lazy" alt=""/><strong>Watch {clip.title}</strong></button>}
 <small>{clip.source}</small>
 {unavailable&&<p role="status">This publisher’s clip could not play here. You can open it on YouTube.</p>}
 <div className={styles.clipActions}>{playing&&<button type="button" onClick={()=>setPlaying(false)}>Stop video</button>}<button type="button" onClick={()=>{setPlaying(false);setUnavailable(false);setIndex(i=>(i+1)%FREESTYLE_CLIPS.length);}}>Another freestyle clip</button><a href={`https://www.youtube.com/watch?v=${clip.id}`} target="_blank" rel="noopener noreferrer">Open on YouTube</a></div>
 </section>;
}
