import {FORMAT_PATHS,lessonEvidence} from '@/lib/paths/formatPaths';
import {sanitizeQuestEvidence} from '@/lib/town/questModel';
import {QUEST_STORAGE_KEY} from '@/lib/town/questProgress';
import {QUIZ_STORAGE_KEY} from '@/lib/town/quizProgress';

/**
 * Starter-lesson progress per path, read ONCE when the room opens (no polling, no subscription): the same stores and the same
 * "complete" rule as the Paths screen and graduationSync. Used only to tell an unearned plinth what to do next.
 */
export type PathProgress={done:number;total:number;names:Record<string,string>};
export function readPathProgress():Record<string,PathProgress>{
 let steps=new Set<string>(),answers=new Set<string>();
 try{steps=new Set(sanitizeQuestEvidence(JSON.parse(localStorage.getItem(QUEST_STORAGE_KEY)??'null')).steps);}catch{/* no saved progress */}
 try{const saved=JSON.parse(localStorage.getItem(QUIZ_STORAGE_KEY)??'[]');if(Array.isArray(saved))answers=new Set(saved.filter((k:unknown):k is string=>typeof k==='string'));}catch{/* none */}
 const out:Record<string,PathProgress>={};
 for(const path of FORMAT_PATHS){const core=path.chapters.flatMap(c=>c.lessons);
  out[path.format]={total:core.length,done:core.filter(l=>lessonEvidence(path.format,l,steps,answers).complete).length,names:Object.fromEntries(core.map(l=>[l.id,l.name]))};}
 return out;
}
/** Lesson names only (no storage), for the first render before progress is read. */
export const lessonNames=():Record<string,PathProgress>=>Object.fromEntries(FORMAT_PATHS.map(p=>{const core=p.chapters.flatMap(c=>c.lessons);return [p.format,{done:0,total:core.length,names:Object.fromEntries(core.map(l=>[l.id,l.name]))}];}));
