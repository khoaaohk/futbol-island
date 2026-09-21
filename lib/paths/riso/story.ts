/** Riso engine — story types and the chapter player helpers every story uses. */
import type {Sheet,SheetSpec} from './sheet';
import {PASSAGE,forwardPassage,passageArrival} from './passage';
/** A headline is 1–2 words; `{text, at}` shows it `at` seconds into its chapter. */
export type HeadlineSpec=string|{text:string;at?:number};
/** A cue is a word onset in the shipped audio. `headline` (track-mode stories) lets a cue change the 1–2 word overlay. */
export type Cue={at:number;words:string;headline?:string};
/** `label` names the chapter in the transcript and chapter dots; `headline` is the optional 1–2 word overlay (most chapters have none). */
export type Chapter={label:string;narration:string;seconds:number;audio?:string;start?:number;cues:Cue[];headline?:HeadlineSpec};
/** Track mode: visual chapters (media seconds) drive scenes, passages, registration seed and headline; caption chapters only carry text. */
export type VisualChapter={start:number;headline?:HeadlineSpec;cues?:Cue[];label?:string};
export type RisoFrame={sheet:Sheet;time:number;chapter:number;chapterTime:number;progress:number;seconds:number;cue:number;cueTime:number;reducedMotion:boolean;width:number;height:number;
 /** caption chapter index when it differs from `chapter` (track mode with visualChapters); equals `chapter` otherwise */
 captionChapter?:number};
export type RisoStory={id:string;format:'futsal'|'7v7'|'9v9'|'11v11';title:string;theme:string;ageNote:string;
 spec:SheetSpec;audio:{mode:'chapters'}|{mode:'track';src:string;duration:number};
 chapters:Chapter[];draw:(f:RisoFrame)=>void;
 /** Track mode only: when present the player runs f.chapter/chapterTime/headline/registration/passages on these; captions keep story.chapters. */
 visualChapters?:VisualChapter[];
 /** Micro-interaction: called after draw() for every live touch (world coords through the transform draw() left active; age 0..0.8 s; seed stable per touch;
  * `frame` = the frame just drawn). Reduced motion: age is always 0 (one static mark). */
 touch?:(sheet:Sheet,x:number,y:number,age:number,seed:number,frame?:RisoFrame)=>void};
/** What a scene's draw receives besides the sheet and its local time t. Read cues from here, never from the outer frame. */
export type SceneContext={t:number;cue:number;cueTime:number;seconds:number;reduced:boolean;chapter:number;frame:RisoFrame};
/** One chapter's composition. `aperture(t)` names the material the camera travels into at the chapter's end (omit on the last chapter). */
export type Scene={draw:(s:Sheet,t:number,c:SceneContext)=>void;aperture?:(t:number)=>Path2D;still?:number};
/** Chapter start offsets (seconds). */
export function chapterStarts(story:RisoStory){if(story.audio.mode==='track')return story.chapters.map((ch,i)=>ch.start??story.chapters.slice(0,i).reduce((a,c)=>a+c.seconds,0));return story.chapters.reduce<number[]>((a,c)=>[...a,a[a.length-1]+c.seconds],[0]).slice(0,-1);}
export function storyDuration(story:RisoStory){return story.audio.mode==='track'?story.audio.duration:Math.round(story.chapters.reduce((a,c)=>a+c.seconds,0)*1000)/1000;}
export function chapterSeconds(story:RisoStory,index:number){if(story.audio.mode==='track'){const starts=chapterStarts(story);return(index+1<starts.length?starts[index+1]:story.audio.duration)-starts[index];}return story.chapters[index].seconds;}
export function cueAt(cues:Cue[],t:number){let cue=-1;for(let i=0;i<cues.length;i++)if(cues[i].at<=t+1e-9)cue=i;return{cue,cueTime:cue<0?t:t-cues[cue].at};}
/** Everything the frame needs from a story time (chapter can be forced by the player, which advances chapters on narration end). */
export function frameFor(story:RisoStory,time:number,chapterIndex?:number){
 const starts=chapterStarts(story);let chapter=chapterIndex??0;
 if(chapterIndex===undefined){for(let i=0;i<starts.length;i++)if(time>=starts[i])chapter=i;}
 chapter=Math.max(0,Math.min(story.chapters.length-1,chapter));
 const seconds=chapterSeconds(story,chapter),chapterTime=Math.max(0,Math.min(seconds,time-starts[chapter])),progress=seconds>0?chapterTime/seconds:0,{cue,cueTime}=cueAt(story.chapters[chapter].cues,chapterTime);
 return{chapter,chapterTime,progress,seconds,cue,cueTime};
}
const visualCache=new WeakMap<RisoStory,RisoStory>();
/** The story whose `chapters` are the playback chapters: `visualChapters` (track mode) mapped to Chapter, else the story itself. Stable identity per story. */
export function visualStory(story:RisoStory):RisoStory{
 if(!story.visualChapters||story.audio.mode!=='track')return story;
 let v=visualCache.get(story);
 if(!v){const vc=story.visualChapters,duration=story.audio.duration;
  v={...story,visualChapters:undefined,chapters:vc.map((c,i)=>({label:c.label??(typeof c.headline==='string'?c.headline:c.headline?.text)??`Scene ${i+1}`,narration:'',start:c.start,seconds:+(((vc[i+1]?.start??duration)-c.start).toFixed(3)),cues:c.cues??[],headline:c.headline}))};
  visualCache.set(story,v);}
 return v;
}
/** The chapters playback runs on (scenes, passages, registration seed, headline): visual chapters when declared, else story.chapters. */
export const playbackChapters=(story:RisoStory)=>visualStory(story).chapters;
/** The headline text to show for a chapter at chapterTime (string | {text,at} | cue headline), '' when none. */
export function headlineAt(chapter:Chapter,chapterTime:number){
 const cue=[...chapter.cues].reverse().find(c=>c.headline!==undefined&&c.at<=chapterTime+1e-9);if(cue)return cue.headline??'';
 const h=chapter.headline;if(!h)return'';if(typeof h==='string')return h;return chapterTime+1e-9>=(h.at??0)?h.text:'';
}
export type ResolvedFrame={chapter:number;chapterTime:number;progress:number;seconds:number;cue:number;cueTime:number;captionChapter:number;headline:string};
/** The player's view of a story time: playback chapter (forced by index for chapters mode), caption chapter, headline. Scripts use the same call. */
export function resolveFrame(story:RisoStory,time:number,chapterIndex?:number):ResolvedFrame{
 const v=visualStory(story),f=frameFor(v,time,chapterIndex);
 const captionChapter=v===story?f.chapter:frameFor(story,time).chapter;
 return{...f,captionChapter,headline:headlineAt(v.chapters[f.chapter],f.chapterTime)};
}
/** trackChapters(story, f): adopt visual chapters in a track-mode story with one line — `const v=trackChapters(story,f); playChapters(v.story,v.frame,SCENES)`.
 * When the player already resolved the frame on visual chapters (f.captionChapter set) the frame passes through; otherwise it is remapped from f.time. */
export function trackChapters(story:RisoStory,f:RisoFrame):{story:RisoStory;frame:RisoFrame}{
 const v=visualStory(story);if(v===story||f.captionChapter!==undefined)return{story:v,frame:f};
 const r=frameFor(v,f.time);return{story:v,frame:{...f,chapter:r.chapter,chapterTime:r.chapterTime,progress:r.progress,seconds:r.seconds,cue:r.cue,cueTime:r.cueTime,captionChapter:f.chapter}};
}
/** playChapters(story, f, scenes): draws the current scene at its chapterTime; in the last .65 s runs the forward passage into the next
 * scene; applies the arrival scale for chapters after the first; reduced motion draws one representative still per chapter. */
export function playChapters(story:RisoStory,f:RisoFrame,scenes:Scene[]){
 const {sheet,chapter:i}=f,scene=scenes[i];if(!scene)throw new Error(`riso: story ${story.id} has no scene ${i}`);
 const ctx=(index:number,t:number):SceneContext=>{const seconds=chapterSeconds(story,index),{cue,cueTime}=cueAt(story.chapters[index].cues,t);return{t,cue,cueTime,seconds,reduced:f.reducedMotion,chapter:index,frame:f};};
 if(f.reducedMotion){const t=scene.still??f.seconds*.55;sheet.arrival=1;sheet.camera(sheet.cx,sheet.cy,1,0);scene.draw(sheet,t,ctx(i,t));return;}
 const depart=f.seconds-PASSAGE.departure,next=scenes[i+1];
 sheet.arrival=i>0?passageArrival(f.chapterTime):1;sheet.camera(sheet.cx,sheet.cy,1,0);
 if(scene.aperture&&next&&f.chapterTime>=depart){
  const progress=(f.chapterTime-depart)/PASSAGE.departure;
  forwardPassage(sheet,{aperture:scene.aperture(f.chapterTime),from:t=>scene.draw(sheet,t,ctx(i,t)),to:t=>next.draw(sheet,t,ctx(i+1,t))},progress,f.chapterTime,0);
 }else scene.draw(sheet,f.chapterTime,ctx(i,f.chapterTime));
}
