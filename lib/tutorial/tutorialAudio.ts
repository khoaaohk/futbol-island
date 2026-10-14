/**
 * Island Tutorial audio helpers that the Paths card needs before the tutorial chunk has loaded (kept tiny: the timing JSON only).
 * iOS Safari only lets a page start sound inside the tap that asked for it, and the tutorial arrives a moment later (next/dynamic),
 * so the "Island Tutorial" tap creates the narration element and starts the first line itself; the tutorial then adopts it.
 */
import {getSoundVolume,isSoundEnabled} from '@/lib/games/sound';
import timing from './islandTutorialTiming.json';

/** Narration starts on only when the app's settings allow it: sound not muted, volume above 0, and the voice setting on (the same
 *  rule as the museum's narration, lib/museum/museumVoice.ts). The tutorial's speaker button changes it for one viewing only. */
export function narrationOn(){try{return isSoundEnabled()&&getSoundVolume()>0&&localStorage.getItem('fi2-voice-enabled')!=='false';}catch{return false;}}
/** The versioned URL of a scene's clip (the same string IslandTutorial sets as the element's source). */
export function tutorialClipUrl(id:string){const clip=(timing as {scenes:Record<string,{src:string;sha256:string}>}).scenes[id];return clip?`${clip.src}?v=${clip.sha256.slice(0,10)}`:'';}
/** Called inside the tap: an Audio element already playing the first line, or null when narration is off. */
export function primeTutorialNarration(firstScene:string){
 if(!narrationOn())return null;const src=tutorialClipUrl(firstScene);if(!src)return null;
 const media=new Audio(src);media.preload='auto';media.volume=getSoundVolume();media.dataset.scene=src;
 void media.play().catch(()=>{});return media;
}
