'use client';
import {useCallback,useEffect,useRef,useState,type MutableRefObject} from 'react';
import type {FieldSession,VoiceClips} from './formatLessons';
export const COACH_VOICES=[['kokoro_af_bella','Coach Bella'],['kokoro_af_heart','Coach Heart'],['kokoro_am_michael','Coach Michael'],['kokoro_af_sarah','Coach Sarah']] as const;
/** One gesture-started element reused for the entire lesson; no render loop or audio pool. */
export function useLessonVoice(session:MutableRefObject<FieldSession|null>,clips:VoiceClips|undefined,identity:string,playing:boolean,quiz:boolean,enabled:boolean,coach:string,paused=false){
 const generation=useRef(0);
 const audio=useRef<HTMLAudioElement|null>(null),[error,setError]=useState('');
 const enabledRef=useRef(enabled);enabledRef.current=enabled;
 const prime=useCallback(()=>{if(!audio.current){const a=new Audio('data:audio/wav;base64,UklGRsQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YaAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');a.preload='auto';audio.current=a;void a.play().catch(()=>{});}},[]);
 const clip=clips?.[coach];
 useEffect(()=>{const token=++generation.current;const a=audio.current,s=session.current;setError('');if(!a)return;a.pause();if(s)s.voicePending=!!clip&&enabled&&!quiz;if(!clip){a.removeAttribute('src');return;}a.src=clip.src;a.currentTime=0;
 const finish=()=>{if(session.current===s&&s)s.voicePending=false;};
 const fail=()=>{finish();setError('Recording could not play. Tap Play or turn voice on to retry.');};
 a.addEventListener('ended',finish);a.addEventListener('error',fail);
 return()=>{if(generation.current===token)generation.current++;a.pause();a.removeEventListener('ended',finish);a.removeEventListener('error',fail);};
 },[identity,clip?.src,enabled,quiz,session]);
 useEffect(()=>{const token=generation.current;const a=audio.current,s=session.current;if(!a)return;if(paused||!enabled||(!playing&&!quiz)){a.pause();if(!enabled&&s)s.voicePending=false;return;}if(!clip)return;if(s&&!quiz&&!a.ended)s.voicePending=true;
 let current=true;const play=()=>{setError('');void a.play().catch(()=>{if(!current||generation.current!==token)return;if(session.current===s&&s)s.voicePending=false;setError('Tap Play to enable recorded narration.');});};
 if(!document.hidden)play();
 const visibility=()=>{if(document.hidden)a.pause();else if(enabledRef.current&&(session.current?.playing||session.current?.quiz))play();};
 document.addEventListener('visibilitychange',visibility);return()=>{current=false;document.removeEventListener('visibilitychange',visibility);};
 },[identity,clip?.src,playing,enabled,quiz,paused,session]);
 useEffect(()=>()=>{audio.current?.pause();audio.current?.removeAttribute('src');audio.current=null;},[]);
 return {prime,coach,enabled,message:identity&&enabled?(!clip?'Original recording unavailable for this line. Read the instruction below.':error):''};
}
