'use client';
import manifest from '../../public/voice/museum/manifest.json';
import {getSoundVolume,isSoundEnabled} from '../games/sound';
import {storyLineHash,storyVoiceUrl,captionMs} from './museumStories';

/**
 * The storytelling narration (Oct 4 2026): the coach voices one line per beat (Kokoro clips baked by
 * scripts/museum/kokoro-museum.py into public/voice/museum, durations in manifest.json). One reused <audio> element, loaded
 * only when a beat plays (no preloading, no timers but the beat's own). Respects the island's settings: sound muted
 * (fi2-sound-muted) or voice off (fi2-voice-enabled = 'false') → silent, and the caption is simply held long enough to read.
 */
const durations=manifest as Record<string,number>;
let audio:HTMLAudioElement|null=null;
const voiceOn=()=>{try{return isSoundEnabled()&&localStorage.getItem('fi2-voice-enabled')!=='false';}catch{return false;}};
/** Speak one line; resolves the milliseconds the caption should stay (the clip's length, or a reading time). */
export function sayLine(line:string):number{
 const sec=durations[storyLineHash(line)];
 if(!voiceOn()||!sec)return captionMs(line);
 try{audio??=new Audio();audio.pause();audio.src=storyVoiceUrl(line);audio.volume=Math.min(1,getSoundVolume()*1.6);void audio.play().catch(()=>{});}catch{return captionMs(line);}
 return Math.round(sec*1000)+250;
}
export function stopLine(){try{audio?.pause();}catch{/* nothing playing */}}
/** Test hook: is a clip baked for this line? */
export const hasVoice=(line:string)=>!!durations[storyLineHash(line)];
