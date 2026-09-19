'use client';
import OfficialClipPlayer from './OfficialClipPlayer';
import {useEffect,useId,useRef,useState} from 'react';
import type {IslandClipFeed} from '@/lib/town/islandClips';
import type {NewsLeague} from '@/lib/town/newsLeagues';
import styles from './NpcConversation.module.css';
// Cache discovery on the server. Recheck feed membership whenever a card opens.
const pending=new Map<string,Promise<IslandClipFeed>>();
function load(key:string){const existing=pending.get(key);if(existing)return existing;const task=fetch('/api/island-clips?'+key,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Unavailable');return r.json() as Promise<IslandClipFeed>;}).finally(()=>pending.delete(key));pending.set(key,task);return task;}
export default function NpcClips({league,topic,prompt,matchId,player,eager=false}:{player?:string;league?:NewsLeague;topic?:string;prompt?:string;matchId?:string;eager?:boolean}){
 const query=player?`player=${encodeURIComponent(player)}`:topic?`topic=${encodeURIComponent(topic)}`:`league=${encodeURIComponent(league??'uefa.champions')}${matchId?`&match=${encodeURIComponent(matchId)}`:''}`;
 const attempted=useRef(new Set<string>()),backupMode=useRef(false),switching=useRef(false);
 const [notice,setNotice]=useState('');
 const host=useRef<HTMLElement>(null),generation=useRef(0);
 useEffect(()=>{generation.current++;return()=>{generation.current++;};},[league,matchId,topic,player]);
 const [requested,setRequested]=useState(eager),[feed,setFeed]=useState<IslandClipFeed|null>(null),[index,setIndex]=useState(0),[playing,setPlaying]=useState(false),uid=useId();
 useEffect(()=>{attempted.current.clear();backupMode.current=false;switching.current=false;setNotice('');setFeed(null);setIndex(0);setPlaying(false);setChecking(false);setRequested(eager);},[league,matchId,topic,player,eager]);
 useEffect(()=>{if(!requested)return;let live=true;load(query).then(value=>{if(live)setFeed(value);}).catch(()=>{if(live)setFeed({items:[],unavailable:true});});return()=>{live=false;};},[requested,query]);
 useEffect(()=>{if(!playing)return;const visibility=()=>{if(document.hidden)setPlaying(false);},other=(event:Event)=>{if((event as CustomEvent).detail!==uid)setPlaying(false);};const observer=new IntersectionObserver(entries=>{if(entries[0]&&!entries[0].isIntersecting)setPlaying(false);});if(host.current)observer.observe(host.current);document.addEventListener('visibilitychange',visibility);document.addEventListener('fi2-video-play',other);return()=>{observer.disconnect();document.removeEventListener('visibilitychange',visibility);document.removeEventListener('fi2-video-play',other);};},[playing,uid]);
 const [checking,setChecking]=useState(false);
 const clip=feed?.items[index];
 const play=async()=>{if(!clip||checking)return;const current=generation.current;setChecking(true);try{const fresh=await load(backupMode.current&&!player?'backup=1':query);if(current!==generation.current)return;if(!fresh.items.some(item=>item.id===clip.id)){setFeed(fresh);setIndex(0);return;}document.dispatchEvent(new CustomEvent('fi2-video-play',{detail:uid}));setPlaying(true);}catch{if(current===generation.current)setFeed({items:[],unavailable:true});}finally{if(current===generation.current)setChecking(false);}};


 const backup=async()=>{
  if(!clip||switching.current)return;
  switching.current=true;attempted.current.add(clip.id);setPlaying(false);setChecking(true);
  setNotice('Trying another official source…');const current=generation.current;
  try{const alternatives=await load(player?query:'backup=1');if(current!==generation.current)return;
   const available=alternatives.items.filter(item=>!attempted.current.has(item.id));
   const next=available.find(item=>item.source!==clip.source)??available[0];
   if(!next){setNotice('No playable backup was found. Try again later.');return;}
   backupMode.current=true;setFeed({...alternatives,items:[next,...available.filter(item=>item.id!==next.id)]});setIndex(0);
   setNotice('Backup from '+next.source+(player?' · '+player:' · May cover a different match.'));
   // Bound automatic attempts; further attempts need a deliberate tap.
   if(attempted.current.size<3&&!document.hidden){document.dispatchEvent(new CustomEvent('fi2-video-play',{detail:uid}));setPlaying(true);}
  }catch{if(current===generation.current)setNotice('The backup source is unavailable. Try again later.');}
  finally{if(current===generation.current){switching.current=false;setChecking(false);}}
 };

 if(!requested)return <div className={styles.clip}><button type="button" onClick={()=>setRequested(true)}>{player?'Watch player highlights':'Watch match highlights'}</button></div>;
 return <section ref={host} className={styles.clip} aria-label={matchId?'Match highlights':'Watch this clip'}>{!feed?<p role="status">Finding an official clip…</p>:!clip?<p>{feed.unavailable?'The video desk is unavailable right now.':player?'Official career highlights are still being curated for this player.':'No matching clip is available from this channel right now.'}</p>:<>
 {notice&&<p role="status">{notice}</p>}
 {feed.fallback==='channel'&&<p>Latest from {clip.source} · These clips may cover a different match or topic.</p>}
 {playing?<OfficialClipPlayer id={clip.id} title={clip.title} onUnavailable={backup}/>:<button className={styles.clipPreview} type="button" disabled={checking} onClick={play}><img src={`https://i.ytimg.com/vi/${clip.id}/hqdefault.jpg`} width={480} height={270} alt="" loading="lazy"/><strong>▶ Watch this: {clip.title}</strong></button>}
 <small>{clip.source}{player&&<> · {clip.views.toLocaleString()} views{clip.durationSeconds?` · ${Math.floor(clip.durationSeconds/60)}:${String(clip.durationSeconds%60).padStart(2,'0')}`:''}</>}{clip.publishedAt&&<> · Posted {new Date(clip.publishedAt).toLocaleDateString()}</>}{!matchId&&!topic?' · Official channel':''}</small>
 <p>{(feed.fallback==='channel'?undefined:prompt)??'Watch the movement before the finish. Which teammate helps make the chance possible?'}</p>
 <div className={styles.clipActions}><button type="button" disabled={checking} onClick={backup}>Try another source</button>{playing&&<button type="button" onClick={()=>setPlaying(false)}>Close video</button>}{(!matchId||feed.fallback==='channel')&&(feed?.items.length??0)>1&&<button type="button" onClick={()=>{setPlaying(false);setIndex(i=>(i+1)%feed!.items.length);}}>Another clip</button>}<a href={`https://www.youtube.com/watch?v=${clip.id}`} target="_blank" rel="noopener noreferrer">Open on YouTube</a></div><small>If the publisher restricts playback here or in your region, try the YouTube link.</small>
 </>}</section>;
}
