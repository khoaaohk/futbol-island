'use client';
import {registerIslandNarration,islandNarrationAllowed} from '../audio/islandNarration';
import {useCallback,useEffect,useRef,useState,type MutableRefObject} from 'react';
import type {FieldSession,VoiceClips} from './formatLessons';
export const COACH_VOICES=[['kokoro_af_bella','Coach Bella'],['kokoro_af_heart','Coach Heart'],['kokoro_am_michael','Coach Michael'],['kokoro_af_sarah','Coach Sarah']] as const;
const SILENT='data:audio/wav;base64,UklGRsQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YaAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
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
/** One gesture-started element reused for the entire lesson; no render loop or audio pool. */
export function useLessonVoice(session:MutableRefObject<FieldSession|null>,clips:VoiceClips|undefined,identity:string,playing:boolean,quiz:boolean,enabled:boolean,coach:string,paused=false){
 const generation=useRef(0),self=useRef({});
 const audio=useRef<HTMLAudioElement|null>(null),[error,setError]=useState('');
 // Bumped when prime() attaches the element, so the effects below load and play the current line in it. A lesson opened
 // from Paths used to mount with no element; the first Play then only played the silent primer with no 'ended' listener,
 // voicePending never cleared and the play stalled at the end of its first step until Next was pressed. The Paths tap now
 // primes the shared element (primeLessonVoice), which the effects adopt; prime() stays the fallback for other entries.
 const [primed,setPrimed]=useState(0);
 const enabledRef=useRef(enabled);enabledRef.current=enabled;
 const prime=useCallback(()=>{if(!audio.current){audio.current=primeLessonVoice();setPrimed(n=>n+1);}},[]);
 const clip=clips?.[coach];
 useEffect(()=>{const token=++generation.current;const a=audio.current??=shared,s=session.current;setError('');if(!a)return;a.pause();if(s)s.voicePending=!!clip&&enabled&&!quiz;if(!clip){a.removeAttribute('src');return;}a.src=clip.src;a.currentTime=0;
 const finish=()=>{if(session.current===s&&s)s.voicePending=false;};
 const fail=()=>{finish();setError('Recording could not play. Tap Play or turn voice on to retry.');};
 a.addEventListener('ended',finish);a.addEventListener('error',fail);
 return()=>{if(generation.current===token)generation.current++;a.pause();a.removeEventListener('ended',finish);a.removeEventListener('error',fail);};
 },[identity,clip?.src,enabled,quiz,session,primed]);
 useEffect(()=>{const token=generation.current;const a=audio.current??=shared,s=session.current;if(!a)return;if(paused||!enabled||(!playing&&!quiz)){if(speaker===self.current)speaker=null;a.pause();if(!enabled&&s)s.voicePending=false;return;}if(!clip)return;if(s&&!quiz&&!a.ended)s.voicePending=true;
 const releaseNarration=registerIslandNarration(a);let current=true;const play=()=>{if(!current||!islandNarrationAllowed())return;setError('');speaker=self.current;void a.play().then(()=>{if(!current||!islandNarrationAllowed())a.pause();}).catch(()=>{if(!current||generation.current!==token)return;if(session.current===s&&s)s.voicePending=false;setError('Tap Play to enable recorded narration.');});};
 if(!document.hidden)play();
 const visibility=()=>{if(document.hidden)a.pause();else if(enabledRef.current&&(session.current?.playing||session.current?.quiz))play();};
 document.addEventListener('visibilitychange',visibility);return()=>{current=false;if(speaker===self.current)speaker=null;releaseNarration();a.pause();document.removeEventListener('visibilitychange',visibility);};
 },[identity,clip?.src,playing,enabled,quiz,paused,session,primed]);
 // Closing the lesson unloads the line (removing src alone keeps the resource, which iOS can resume later).
 useEffect(()=>()=>{if(speaker===self.current)speaker=null;const a=audio.current;if(a){a.pause();a.removeAttribute('src');a.load();}audio.current=null;},[]);
 return {prime,coach,enabled,message:identity&&enabled?(!clip?'Original recording unavailable for this line. Read the instruction below.':error):''};
}
