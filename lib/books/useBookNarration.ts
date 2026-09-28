'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {getSoundVolume,isSoundEnabled} from '../games/sound';
import {REGISTRY_NARRATION} from './registry.generated';
import {registerIslandNarration,islandNarrationAllowed} from '../audio/islandNarration';
type Cue={text:string;start:number;duration:number};
type Track={src:string;duration:number;cues:Cue[]};
const MANIFESTS=REGISTRY_NARRATION as unknown as Record<string,{pages:Record<string,Track>}>;
/** Coach Bella tracks for one book (sentence cues drive captions and the paper timeline). */
export const bookTracks=(bookId:string):Record<string,Track>=>MANIFESTS[bookId]?.pages??{};
type View={page:string;playing:boolean;started:boolean;completed:boolean;time:number;duration:number;error:string};
const fresh=(page:string,tracks:Record<string,Track>):View=>({page,playing:false,started:false,completed:false,time:0,duration:tracks[page]?.duration??0,error:''});
/** One on-demand media element, driven by native media events. Never a RAF/timer.
 * Turning, Read (onPause), hiding and closing silence it without auto-resume. */
export function useBookNarration(pageId:string,bookId='messi'){
 const tracks=bookTracks(bookId);
 const [view,setView]=useState<View>(()=>fresh(pageId,tracks)),[muted,setMuted]=useState(()=>!isSoundEnabled()||getSoundVolume()===0);
 const media=useRef<HTMLAudioElement|null>(null),disposeMedia=useRef<()=>void>(()=>{}),epoch=useRef(0),currentPage=useRef(pageId),muteRef=useRef(muted);
 currentPage.current=pageId;muteRef.current=muted;
 const onPause=useCallback(()=>{epoch.current++;media.current?.pause();setView(v=>v.playing?{...v,playing:false}:v);},[]);
 useEffect(()=>{setView(fresh(pageId,tracks));const hidden=()=>{if(document.hidden)onPause();};document.addEventListener('visibilitychange',hidden);window.addEventListener('pagehide',onPause);
  return()=>{epoch.current++;disposeMedia.current();disposeMedia.current=()=>{};document.removeEventListener('visibilitychange',hidden);window.removeEventListener('pagehide',onPause);};
 },[pageId,bookId,onPause]);// eslint-disable-line react-hooks/exhaustive-deps
 const play=useCallback((restart=false)=>{
  const track=tracks[pageId];if(!track){setView(v=>({...v,error:'Voice is unavailable. Choose Read for the complete story.'}));return;}
  if(document.hidden||!islandNarrationAllowed())return;
  let voice=media.current;
  if(!voice){voice=new Audio();const element=voice;media.current=element;const releaseNarration=registerIslandNarration(element);element.preload='none';element.src=track.src;
   const update=()=>{if(currentPage.current!==pageId)return;setView(v=>({...v,page:pageId,time:element.currentTime||0,duration:Number.isFinite(element.duration)?element.duration:track.duration}));};
   const started=()=>{if(currentPage.current!==pageId||document.hidden){element.pause();return;}setView(v=>({...v,page:pageId,playing:true,started:true,completed:false,error:''}));};
   const paused=()=>{if(currentPage.current===pageId)setView(v=>({...v,playing:false}));};
   const ended=()=>{if(currentPage.current===pageId)setView(v=>({...v,playing:false,completed:true,time:Number.isFinite(element.duration)?element.duration:track.duration}));};
   const failed=()=>{if(currentPage.current===pageId)setView(v=>({...v,playing:false,error:'Voice could not load. Try Play again or choose Read.'}));};
   element.addEventListener('timeupdate',update);element.addEventListener('loadedmetadata',update);element.addEventListener('playing',started);element.addEventListener('pause',paused);element.addEventListener('ended',ended);element.addEventListener('error',failed);
   disposeMedia.current=()=>{releaseNarration();element.removeEventListener('timeupdate',update);element.removeEventListener('loadedmetadata',update);element.removeEventListener('playing',started);element.removeEventListener('pause',paused);element.removeEventListener('ended',ended);element.removeEventListener('error',failed);element.pause();element.removeAttribute('src');element.load();if(media.current===element)media.current=null;};
  }
  voice.muted=muteRef.current;voice.volume=getSoundVolume();if(restart||voice.ended)voice.currentTime=0;if(voice.error)voice.load();const token=++epoch.current,element=voice;
  setView(v=>({...v,page:pageId,started:true,completed:false,error:''}));
  void element.play().then(()=>{if(token!==epoch.current||currentPage.current!==pageId||document.hidden)element.pause();}).catch(error=>{if(token!==epoch.current||currentPage.current!==pageId||error?.name==='AbortError')return;setView(v=>({...v,playing:false,error:'Tap Play to hear the story, or choose Read.'}));});
 },[pageId,bookId]);// eslint-disable-line react-hooks/exhaustive-deps
 const onToggle=useCallback(()=>{if(media.current&&!media.current.paused)onPause();else play();},[onPause,play]);
 const onReplay=useCallback(()=>play(true),[play]);
 const onMute=useCallback(()=>{const next=!muteRef.current;muteRef.current=next;setMuted(next);if(media.current)media.current.muted=next;},[]);
 const onSeekTime=useCallback((time:number)=>{const voice=media.current;if(!voice||!Number.isFinite(time))return;const limit=Number.isFinite(voice.duration)?voice.duration:tracks[pageId]?.duration??0;voice.currentTime=Math.max(0,Math.min(limit,time));setView(v=>({...v,time:voice.currentTime,completed:false}));},[pageId,bookId]);// eslint-disable-line react-hooks/exhaustive-deps
 const bookRef=useRef(bookId);bookRef.current=bookId;
 const readClock=useCallback(()=>{const voice=media.current,track=bookTracks(bookRef.current)[currentPage.current],cues=track?.cues??[],time=voice?.currentTime??0;return{time,duration:voice&&Number.isFinite(voice.duration)?voice.duration:track?.duration??0,playing:!!voice&&!voice.paused&&!voice.ended&&!document.hidden,cueIndex:Math.max(0,cues.findLastIndex(c=>time>=c.start)),cueCount:cues.length};},[]);
 const current=view.page===pageId?view:fresh(pageId,tracks),cues=tracks[pageId]?.cues??[],cue=cues.findLast(c=>current.time>=c.start)??cues[0];
 return{...current,muted,readClock,caption:cue?.text??'',captionStart:cue?.start??0,captionDuration:cue?.duration??0,onToggle,onReplay,onPause,onMute,onSeekTime};
}
