/** Riso engine — story registry. One file per story in ./stories/<id>.ts exporting `story: RisoStory`.
 * The dynamic import uses a directory context, so a story file becomes available the moment it exists
 * (missing modules resolve to "no riso story" and the old films keep loading). */
import type {RisoStory} from './story';
import narrationTiming from './data/narrationTiming.json';
export const RISO_STORY_IDS=['chalk-line','woven-court','kite-turned','futsl','place-picture','pocket-radio','signal-water','empathy','different-tides','harbour-night','unfinished-map','grit','quiet-lantern','boat-weather','more-shirt','regulate','reset','loss'] as const;
export type RisoStoryId=typeof RISO_STORY_IDS[number];
const modules=new Map<string,Promise<RisoStory|null>>();
function load(id:string):Promise<RisoStory|null>{
 if(!(RISO_STORY_IDS as readonly string[]).includes(id))return Promise.resolve(null);
 let pending=modules.get(id);
 if(!pending){
  pending=import(`./stories/${id}`).then((mod:{story?:RisoStory})=>{const story=mod?.story;if(!story||story.id!==id)return null;return withTiming(story);}).catch(()=>null);
  modules.set(id,pending);
  // a failed or missing module is retried on the next request so a story added while the app runs is picked up
  pending.then(story=>{if(!story)modules.delete(id);});
 }
 return pending;
}
function withTiming(story:RisoStory):RisoStory{
 if(story.audio.mode!=='chapters')return story;
 const timing=(narrationTiming as Record<string,number[]|undefined>)[story.id];
 return{...story,chapters:story.chapters.map((ch,i)=>({...ch,seconds:timing?.[i]??ch.seconds,audio:ch.audio?`${ch.audio}?v=mental-kokoro-heart-2`:undefined}))};
}
/** true only when lib/paths/riso/stories/<id>.ts exists and exports a valid story. */
export async function hasRisoStory(id:string){return(await load(id))!==null;}
/** Load a story (chapter durations merged from narrationTiming.json in chapters mode). Rejects when the story has not been built. */
export async function loadRisoStory(id:string):Promise<RisoStory>{const story=await load(id);if(!story)throw new Error(`Riso story "${id}" is not built yet`);return story;}
/** Resolve to the story or null without throwing. */
export const resolveRisoStory=load;
