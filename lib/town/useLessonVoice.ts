'use client';
import {registerIslandNarration,islandNarrationAllowed} from '../audio/islandNarration';
import {mediaUrl} from '../media/mediaUrl';
import {useCallback,useEffect,useRef,useState,type MutableRefObject} from 'react';
import type {FieldSession,VoiceClips} from './formatLessons';
export const COACH_VOICES=[['kokoro_af_bella','Coach Bella'],['kokoro_af_heart','Coach Heart'],['kokoro_am_michael','Coach Michael'],['kokoro_af_sarah','Coach Sarah']] as const;
const SILENT='data:audio/wav;base64,UklGRsQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YaAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
let shared:HTMLAudioElement|null=null;
/** The lesson (hook instance) that has asked the shared element to speak right now, or null. Anything else that starts it
 * (iOS resuming an interrupted element when the app returns, a lock-screen / headphone play command, a stray play()) is
 * paused at once: lesson narration only sounds while its lesson is open and playing (user report Sep 26 2026: "plays audio
 * leaking when just standing there on the island"). */
let speaker:object|null=null;
/** True while an open lesson's voice line is sounding (the island idle fade waits for it). */
export const lessonVoiceSpeaking=()=>!!speaker&&!!shared&&!shared.paused&&!shared.ended;
const guard=(event:Event)=>{const a=event.currentTarget as HTMLAudioElement;if(!speaker&&!a.currentSrc.startsWith('data:'))a.pause();};
/**
 * The page's one lesson-voice element, created and unlocked (a silent play) inside a user gesture. Call it synchronously from
 * the tap that opens a lesson (Town's Paths / journey launch listeners), so a lesson that opens straight into narration, such as
 * a quiz resumed from Paths, can speak without another tap (iOS only lets an element play later if it first played in a gesture).
 */
export function primeLessonVoice():HTMLAudioElement|null{
 if(typeof window==='undefined')return null;
 if(!shared){shared=new Audio(SILENT);shared.preload='auto';shared.addEventListener('play',guard);void shared.play().catch(()=>{});}
 return shared;
}

/* Lesson voice packs (Oct 7 2026, docs/performance-guide.md). A lesson's core lines for the chosen coach are one file
 * (scripts/build-lesson-packs.cjs): the element loads it once and each line is a seek to its start plus a stop at its end,
 * instead of one request per line. Lines between are 0.512 s of silence, so a late stop never reaches the next line. */
/** Seek this far before a line: the seek lands in the silent gap (and the line's priming frame), never on the onset. */
export const PACK_LEAD=0.05;
/** One lesson's pack for one coach: line hash[:8] → [start, end] seconds in it. */
export type VoicePack={src:string;lines:Record<string,[number,number]>};
type PackIndex={promise:Promise<void>;value?:Record<string,VoicePack>|null};
const indexes=new Map<string,PackIndex>();
/** The coach's offset maps for one format (public/voice/packs/<coach>/<format>.json, a few KB), fetched once per page when a
 * lesson screen opens with voice on. A missing or broken map means single-line files, as before. */
export function loadVoicePacks(format:string,coach:string):PackIndex{
 if(typeof window==='undefined')return {promise:Promise.resolve(),value:null};
 const key=coach+'/'+format;let entry=indexes.get(key);
 if(!entry){const e:PackIndex={promise:Promise.resolve()};indexes.set(key,e);entry=e;
  e.promise=fetch(mediaUrl(`/voice/packs/${coach}/${format}.json`)).then(r=>r.ok?r.json():null).then((v:unknown)=>{e.value=v&&typeof v==='object'?v as Record<string,VoicePack>:null;},()=>{e.value=null;});}
 return entry;
}
/** How long the first line waits for its format's map before it plays its own file instead. */
export const PACK_INDEX_WAIT_MS=2000;
/** Packs that failed to load in this page: their lines use the single-line files from then on. */
export const failedPacks=new Set<string>();
export type PackSegment={src:string;start:number;end:number};
/** Where `clip` sits in the lesson's pack, or null to play the line's own file: no pack, a line the pack doesn't hold
 * (wrong-answer explanations), a re-voiced line whose duration no longer matches the pack, or a pack that failed. */
export function packSegment(pack:VoicePack|undefined,clip:{src:string;duration:number}|undefined):PackSegment|null{
 if(!pack||!clip||failedPacks.has(pack.src))return null;
 // map keys are the first 8 hex digits of the line's file name (its text hash)
 const hash=/\/([0-9a-f]{16})\.m4a(?:\?|$)/.exec(clip.src)?.[1],span=hash?pack.lines[hash.slice(0,8)]:undefined;
 if(!span)return null;
 const [start,end]=span;
 // lesson JSON durations are rounded to 0.01 s; a re-voiced line differs by far more
 return end>start&&Math.abs(end-start-clip.duration)<.01?{src:pack.src,start,end}:null;
}
type PackLine=PackSegment&{done:boolean;timer:ReturnType<typeof setTimeout>|null};

/** One gesture-started element reused for the entire lesson; no render loop or audio pool. */
export function useLessonVoice(session:MutableRefObject<FieldSession|null>,clips:VoiceClips|undefined,identity:string,playing:boolean,quiz:boolean,enabled:boolean,coach:string,paused=false,format?:string,lessonId?:string){
 const generation=useRef(0),self=useRef({});
 const audio=useRef<HTMLAudioElement|null>(null),[error,setError]=useState('');
 // Bumped when prime() attaches the element, so the effects below load and play the current line in it. A lesson opened
 // from Paths used to mount with no element; the first Play then only played the silent primer with no 'ended' listener,
 // voicePending never cleared and the play stalled at the end of its first step until Next was pressed. The Paths tap now
 // primes the shared element (primeLessonVoice), which the effects adopt; prime() stays the fallback for other entries.
 const [primed,setPrimed]=useState(0);
 // Bumped when a pack fails to load, so this line (and the rest of the lesson) re-renders onto the single-line files.
 const [packFailures,setPackFailures]=useState(0);
 const enabledRef=useRef(enabled);enabledRef.current=enabled;
 const line=useRef<PackLine|null>(null);
 const prime=useCallback(()=>{if(!audio.current){audio.current=primeLessonVoice();setPrimed(n=>n+1);}},[]);
 // A slot with no duration is a changed line still waiting to be voiced (scripts/plays/kokoro-lessons.py fills it): show the text, don't
 // try to play a file that isn't there.
 const slot=clips?.[coach],clip=slot&&slot.duration>0?slot:undefined;
 // The pack map: requested as soon as the lesson screen renders with voice on (cached for the page). A line that arrives
 // while it is still loading waits for it (narration is held, the step waits as it does for any line) for at most
 // PACK_INDEX_WAIT_MS; after that this lesson uses the single-line files, so a late map never restarts a line mid-way.
 const indexKey=format&&enabled?coach+'/'+format:'',index=indexKey?loadVoicePacks(format!,coach):undefined;
 const [,setIndexTick]=useState(0),gaveUp=useRef(new Set<string>());
 const waiting=!!index&&index.value===undefined&&!gaveUp.current.has(indexKey)&&!!clip;
 useEffect(()=>{if(!index||index.value!==undefined)return;let live=true;
  const t=setTimeout(()=>{if(!live)return;gaveUp.current.add(indexKey);setIndexTick(n=>n+1);},PACK_INDEX_WAIT_MS);
  void index.promise.then(()=>{if(!live)return;clearTimeout(t);setIndexTick(n=>n+1);});
  return()=>{live=false;clearTimeout(t);};
 },[index,indexKey]);
 const seg=waiting||gaveUp.current.has(indexKey)?null:packSegment(index?.value?.[lessonId??''],clip);
 useEffect(()=>{const token=++generation.current;const a=audio.current??=shared,s=session.current;setError('');if(!a)return;a.pause();line.current=null;if(s)s.voicePending=!!clip&&enabled&&!quiz;if(!clip){a.removeAttribute('src');return;}
 // Voice off: nothing is fetched (turning it on re-runs this effect and loads the line).
 if(!enabled||waiting)return;
 const finish=()=>{if(session.current===s&&s)s.voicePending=false;};
 const fail=()=>{finish();setError('Recording could not play. Tap Play or turn voice on to retry.');};
 if(!seg){
  a.src=mediaUrl(clip.src);a.currentTime=0;
  a.addEventListener('ended',finish);a.addEventListener('error',fail);
  return()=>{if(generation.current===token)generation.current++;a.pause();a.removeEventListener('ended',finish);a.removeEventListener('error',fail);};
 }
 // Pack line: keep the pack loaded across lines (preload='auto' fetches it once, on demand, for this lesson and coach only),
 // seek to the line, and stop at its end. The stop timer is armed by 'playing'/'seeked' and cleared by 'pause'; it checks the
 // media clock when it fires and re-arms for any remainder (a stall). 'timeupdate' and 'ended' are backstops. No polling.
 const url=mediaUrl(seg.src),st:PackLine={...seg,done:false,timer:null};line.current=st;
 if(a.getAttribute('src')!==url)a.src=url;
 const seek=()=>{try{a.currentTime=Math.max(0,st.start-PACK_LEAD);}catch{/* not seekable yet: loadedmetadata retries */}};
 const clear=()=>{if(st.timer){clearTimeout(st.timer);st.timer=null;}};
 const stop=()=>{clear();if(st.done)return;st.done=true;a.pause();finish();};
 const arm=()=>{clear();if(a.paused||st.done||a.seeking)return;const left=(st.end-a.currentTime)/(a.playbackRate||1);if(left<=.02){stop();return;}st.timer=setTimeout(()=>{st.timer=null;if(a.currentTime>=st.end-.02)stop();else arm();},left*1000);};
 const tick=()=>{if(!st.done&&!a.seeking&&a.currentTime>=st.end)stop();};
 const broken=()=>{clear();failedPacks.add(seg.src);setPackFailures(n=>n+1);};
 if(a.readyState>=1)seek();else a.addEventListener('loadedmetadata',seek,{once:true});
 a.addEventListener('playing',arm);a.addEventListener('seeked',arm);a.addEventListener('pause',clear);a.addEventListener('timeupdate',tick);a.addEventListener('ended',stop);a.addEventListener('error',broken);
 return()=>{if(generation.current===token)generation.current++;clear();a.pause();if(line.current===st)line.current=null;
  a.removeEventListener('loadedmetadata',seek);a.removeEventListener('playing',arm);a.removeEventListener('seeked',arm);a.removeEventListener('pause',clear);a.removeEventListener('timeupdate',tick);a.removeEventListener('ended',stop);a.removeEventListener('error',broken);};
 },[identity,clip?.src,seg?.src,seg?.start,waiting,enabled,quiz,session,primed,packFailures]);
 useEffect(()=>{const token=generation.current;const a=audio.current??=shared,s=session.current;if(!a)return;if(paused||!enabled||(!playing&&!quiz)){if(speaker===self.current)speaker=null;a.pause();if(!enabled&&s)s.voicePending=false;return;}if(!clip)return;
 // A pack line that already reached its end counts as ended, like a single file's `ended`.
 const ended=()=>line.current?line.current.done:a.ended;
 if(s&&!quiz&&!ended())s.voicePending=true;
 if(waiting)return;
 const releaseNarration=registerIslandNarration(a);let current=true;const play=()=>{if(!current||!islandNarrationAllowed())return;setError('');speaker=self.current;
  // play() on an ended single file starts it again from the top; a finished pack line does the same.
  const st=line.current;if(st?.done){st.done=false;try{a.currentTime=Math.max(0,st.start-PACK_LEAD);}catch{}}
  void a.play().then(()=>{if(!current||!islandNarrationAllowed())a.pause();}).catch(()=>{if(!current||generation.current!==token)return;if(session.current===s&&s)s.voicePending=false;setError('Tap Play to enable recorded narration.');});};
 if(!document.hidden)play();
 const visibility=()=>{if(document.hidden)a.pause();else if(enabledRef.current&&(session.current?.playing||session.current?.quiz))play();};
 document.addEventListener('visibilitychange',visibility);return()=>{current=false;if(speaker===self.current)speaker=null;releaseNarration();a.pause();document.removeEventListener('visibilitychange',visibility);};
 },[identity,clip?.src,seg?.src,seg?.start,waiting,playing,enabled,quiz,paused,session,primed,packFailures]);
 // Closing the lesson unloads the line (removing src alone keeps the resource, which iOS can resume later).
 useEffect(()=>()=>{if(speaker===self.current)speaker=null;const a=audio.current;if(a){a.pause();a.removeAttribute('src');a.load();}audio.current=null;line.current=null;},[]);
 return {prime,coach,enabled,message:identity&&enabled?(!clip?'No voice for this line yet. Read it below.':error):''};
}
