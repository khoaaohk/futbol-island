import data from './formatPaths.json';
import type {Format} from '../town/venues';
import type {StoryId} from './stories';
export type PathLesson={id:string;name:string;steps:number;questions:number;story?:StoryId};
export type FormatPath={format:Format;title:string;openingStory?:StoryId;chapters:{title:string;lessons:PathLesson[]}[];depth:PathLesson[]};
export const FORMAT_PATHS=data as FormatPath[];
export const FORMAT_PATH_VERSION=1;
export const FORMAT_PATH_LAUNCH='fi2-format-path-launch';
export type FormatPathLaunch={format:Format;lessonId:string;step:number;quiz:boolean;question:number;nonce:number};
export function lessonEvidence(format:Format,lesson:PathLesson,steps:ReadonlySet<string>,answers:ReadonlySet<string>){
 const prefix=`${format}:${lesson.id}:`;
 const watched=Array.from({length:lesson.steps},(_,i)=>steps.has(prefix+i));
 const correct=Array.from({length:lesson.questions},(_,i)=>answers.has(prefix+i));
 return {watched:watched.filter(Boolean).length,correct:correct.filter(Boolean).length,complete:watched.every(Boolean)&&correct.every(Boolean),step:Math.max(0,watched.indexOf(false)),question:Math.max(0,correct.indexOf(false)),quiz:watched.every(Boolean)&&!correct.every(Boolean)};
}
export function validPathLaunch(value:unknown):value is FormatPathLaunch{
 if(!value||typeof value!=='object')return false;const v=value as FormatPathLaunch,p=FORMAT_PATHS.find(p=>p.format===v.format),l=p&&[...p.chapters.flatMap(c=>c.lessons),...p.depth].find(l=>l.id===v.lessonId);
 return !!l&&Number.isInteger(v.step)&&v.step>=0&&v.step<l.steps&&Number.isInteger(v.question)&&v.question>=0&&v.question<Math.max(1,l.questions)&&typeof v.quiz==='boolean'&&Number.isFinite(v.nonce);
}
