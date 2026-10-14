/**
 * Island Tutorial (Oct 13 2026; user: "make a tutorial … a riso animation that shows what this island is, how to walk, fly, jobs,
 * explore, museums, fishing … with audio, and text below for people hard of hearing").
 *
 * The script lives in islandTutorial.json (chapters → scenes, one idea each). scripts/build-tutorial-narration.py voices every
 * line with the local Kokoro model (af_heart, the path films' narrator) into public/stories/island-tutorial/<id>.m4a and writes
 * islandTutorialTiming.json (clip seconds + the sha256 of the line it voiced, so a stale clip fails tests/island-tutorial.cjs).
 * A scene lasts its clip plus a short breath; muted, the same seconds drive the captions.
 */
import script from './islandTutorial.json';
import timing from './islandTutorialTiming.json';
import {tutorialClipUrl} from './tutorialAudio';

export type TutorialArt='island'|'walk'|'ride'|'fly'|'map'|'jobs'|'spend'|'arcade'|'explore'|'museum'|'fishing'|'people'|'learn';
export type TutorialChapter={id:string;title:string};
export type TutorialScene={id:string;chapter:string;headline:string;narration:string;art:TutorialArt;audio:string;clip:number;seconds:number};

/** The breath after each line before the next scene, in seconds. */
export const SCENE_BREATH=.9;
type Clip={src:string;duration:number;sha256:string};
const clips=(timing as {scenes:Record<string,Clip>}).scenes;

export const TUTORIAL_CHAPTERS:readonly TutorialChapter[]=script.chapters;
export const TUTORIAL_SCENES:readonly TutorialScene[]=script.scenes.map(scene=>{
 const clip=clips[scene.id];
 // Captions-only fallback when a clip is missing: about 2.4 words a second, the narrator's pace.
 const clipSeconds=clip?.duration??Math.max(4,(scene.narration).split(/\s+/).length/2.4);
 return {...scene,art:scene.art as TutorialArt,audio:tutorialClipUrl(scene.id),clip:clipSeconds,seconds:Math.round((clipSeconds+SCENE_BREATH)*100)/100};
});
export const TUTORIAL_SECONDS=TUTORIAL_SCENES.reduce((sum,scene)=>sum+scene.seconds,0);
/** The first scene of each chapter (the chapter jump list). */
export const chapterStart=(chapter:string)=>TUTORIAL_SCENES.findIndex(scene=>scene.chapter===chapter);
