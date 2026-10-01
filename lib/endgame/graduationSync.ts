import {FORMAT_PATHS,type PathLesson} from '../paths/formatPaths';
import {pathProgressFrom} from '../town/cardTiers';
import {sanitizeQuestEvidence} from '../town/questModel';
import {QUEST_STORAGE_KEY} from '../town/questProgress';
import {QUIZ_STORAGE_KEY} from '../town/quizProgress';
import {mergeFinished,type GradFormat} from './graduationModel';
import {updateGraduations} from './graduationStore';

/**
 * Derives graduations from the saved path progress (the same stores and "complete" rule the Paths screen reads) and saves any
 * new ones. Called by GraduationHost on load and whenever quest/quiz progress changes, so a save that finished paths before this
 * update graduates retroactively on its first load. Returns the formats graduated by this call.
 */
export function finishedFormatsFromStorage():string[]{
 try{
  const steps=new Set(sanitizeQuestEvidence(JSON.parse(localStorage.getItem(QUEST_STORAGE_KEY)??'null')).steps);
  const saved=JSON.parse(localStorage.getItem(QUIZ_STORAGE_KEY)??'[]'),answers=new Set<string>(Array.isArray(saved)?saved.filter((k:unknown):k is string=>typeof k==='string'):[]);
  return pathProgressFrom(steps,answers).finished;
 }catch{return [];}
}
export function syncGraduations(finished:readonly string[]=finishedFormatsFromStorage(),now=Date.now()):GradFormat[]{
 let added:GradFormat[]=[];
 updateGraduations(record=>{const merged=mergeFinished(record,finished,now);added=merged.added;return merged.record;});
 return added;
}
/** The 12 starter lessons of a format: the "what you learned" list on certificates and in the credits. */
export function starterLessons(format:string):PathLesson[]{return FORMAT_PATHS.find(p=>p.format===format)?.chapters.flatMap(c=>c.lessons)??[];}
