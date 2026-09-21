import {UPCOMING_STORIES} from './upcomingStories';

export const OPTIONAL_STORY_KEY='fi2-optional-path-stories-v1';
const ids=Object.values(UPCOMING_STORIES).flatMap(stories=>stories.map(story=>story.id));
type ProgressStorage=Pick<Storage,'getItem'|'setItem'>;

/** Optional films never contribute to tactical lesson unlocks. */
export function readOptionalStoryProgress(value:unknown):string[]{
 return Array.isArray(value)?ids.filter(id=>value.includes(id)):[];
}
export function loadOptionalStoryProgress(storage?:ProgressStorage):string[]{
 try{return readOptionalStoryProgress(JSON.parse((storage??window.localStorage).getItem(OPTIONAL_STORY_KEY)??'[]'));}catch{return [];}
}
export function completeOptionalStory(id:string,current:readonly string[],storage?:ProgressStorage):string[]{
 const done=readOptionalStoryProgress([...loadOptionalStoryProgress(storage),...current,...(ids.includes(id)?[id]:[])]);
 try{(storage??window.localStorage).setItem(OPTIONAL_STORY_KEY,JSON.stringify(done));}catch{}
 return done;
}
