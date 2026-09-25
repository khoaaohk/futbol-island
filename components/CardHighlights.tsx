'use client';
import {useEffect,useId,useState} from 'react';
import OfficialClipPlayer from './OfficialClipPlayer';
import type {IslandClip,IslandClipFeed} from '@/lib/town/islandClips';
import styles from './PlayerCard.module.css';

/** One shared request per player while it is in flight (the server caches the feeds). */
const pending=new Map<string,Promise<IslandClipFeed>>();
function load(player:string){const key=`player=${encodeURIComponent(player)}`,existing=pending.get(key);if(existing)return existing;
 const task=fetch(`/api/island-clips?${key}`,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Unavailable');return r.json() as Promise<IslandClipFeed>;}).finally(()=>pending.delete(key));
 pending.set(key,task);return task;}
const time=(s?:number)=>s?`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`:'';

/**
 * A player's official highlight clips, inline on the back of their card (Top Plays tab): small thumbnail rows (lazy, low-res),
 * tap a row to play it here. Same rules as the old sheet (NpcClips): the feed is fetched only when this mounts (the tab is open
 * on the back), membership is rechecked when Play is tapped, one video plays at a time across the app ('fi2-video-play'), and a
 * hidden page stops it. Unmounting (another tab, the card turned over or closed) removes the player.
 */
export default function CardHighlights({player}:{player:string}){
 const [feed,setFeed]=useState<IslandClipFeed|null>(null),[playing,setPlaying]=useState<IslandClip|null>(null),[checking,setChecking]=useState(false),[notice,setNotice]=useState(''),uid=useId();
 useEffect(()=>{let live=true;setFeed(null);setPlaying(null);setNotice('');
  load(player).then(value=>{if(live)setFeed(value);}).catch(()=>{if(live)setFeed({items:[],unavailable:true});});return ()=>{live=false;};},[player]);
 useEffect(()=>{if(!playing)return;const hidden=()=>{if(document.hidden)setPlaying(null);},other=(event:Event)=>{if((event as CustomEvent).detail!==uid)setPlaying(null);};
  document.addEventListener('visibilitychange',hidden);document.addEventListener('fi2-video-play',other);
  return ()=>{document.removeEventListener('visibilitychange',hidden);document.removeEventListener('fi2-video-play',other);};},[playing,uid]);
 const play=async(clip:IslandClip)=>{if(checking)return;setChecking(true);setNotice('');
  try{const fresh=await load(player);if(!fresh.items.some(item=>item.id===clip.id)){setFeed(fresh);setNotice('That clip is no longer listed. Try another.');return;}
   document.dispatchEvent(new CustomEvent('fi2-video-play',{detail:uid}));setPlaying(clip);}
  catch{setNotice('The video desk is unavailable right now.');}finally{setChecking(false);}};
 if(!feed)return <p className={styles.clipNote} role="status">Finding official clips…</p>;
 const clips=feed.items.slice(0,6);
 if(!clips.length)return <p className={styles.clipNote}>{feed.unavailable?'The video desk is unavailable right now.':'Official career highlights are still being curated for this player.'}</p>;
 return <div className={styles.clips}>
  {playing&&<div className={styles.clipPlayer}>
   <OfficialClipPlayer id={playing.id} title={playing.title} onUnavailable={()=>setNotice('This clip can’t play here. Try YouTube or another clip.')}/>
   <div className={styles.clipBar}><button type="button" onClick={event=>{event.stopPropagation();setPlaying(null);}}>Close video</button><a href={`https://www.youtube.com/watch?v=${playing.id}`} target="_blank" rel="noopener noreferrer" onClick={event=>event.stopPropagation()}>Open on YouTube ↗</a></div>
  </div>}
  {notice&&<p className={styles.clipNote} role="status">{notice}</p>}
  <ul className={styles.clipList} aria-label={`${player} highlights`}>
   {clips.map(clip=><li key={clip.id}><button type="button" disabled={checking} aria-current={playing?.id===clip.id||undefined} onClick={event=>{event.stopPropagation();void play(clip);}}>
    <img src={`https://i.ytimg.com/vi/${clip.id}/mqdefault.jpg`} width={80} height={45} alt="" loading="lazy" decoding="async"/>
    <span><b>{clip.title}</b><small>{clip.source}{clip.durationSeconds?` · ${time(clip.durationSeconds)}`:''}</small></span>
   </button></li>)}
  </ul>
  <p className={styles.clipNote}>Official channels. If a clip is blocked in your region, use the YouTube link.</p>
 </div>;
}
