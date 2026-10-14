/**
 * Island Tutorial audio helpers that the Paths card needs before the tutorial chunk has loaded (kept tiny: the timing JSON only).
 * iOS Safari only lets a page start sound inside the tap that asked for it, and the tutorial arrives a moment later (next/dynamic),
 * so the "Island Tutorial" tap creates the narration element and starts the first line itself; the tutorial then adopts it.
 */
import {getSoundVolume,isSoundEnabled} from '@/lib/games/sound';
import timing from './islandTutorialTiming.json';

/** The tutorial always starts with its narration playing (Oct 14 2026, user: "don't mute at the beginning, play audio"): opening
 *  it is the ask. The tutorial's speaker button still mutes it for that viewing. */
export function narrationOn(){return true;}
/** The narration volume: the app's sound volume, or a sensible level when that is off or 0 (the tutorial is opened on purpose). */
export function narrationVolume(){try{return isSoundEnabled()&&getSoundVolume()>0?getSoundVolume():.8;}catch{return .8;}}
/** The versioned URL of a scene's clip (the same string IslandTutorial sets as the element's source). */
export function tutorialClipUrl(id:string){const clip=(timing as {scenes:Record<string,{src:string;sha256:string}>}).scenes[id];return clip?`${clip.src}?v=${clip.sha256.slice(0,10)}`:'';}
/** Called inside the tap: an Audio element already playing the first line, or null when narration is off. */
export function primeTutorialNarration(firstScene:string){
 if(!narrationOn())return null;const src=tutorialClipUrl(firstScene);if(!src)return null;
 const media=new Audio(src);media.preload='auto';media.volume=narrationVolume();media.dataset.scene=src;
 void media.play().catch(()=>{});return media;
}
