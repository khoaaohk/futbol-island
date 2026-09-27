import data from './formatPaths.json';
import type {Format} from '../town/venues';
import type {StoryId} from './stories';
export type PathLesson={id:string;name:string;steps:number;questions:number;story?:StoryId};
export type FormatPath={format:Format;title:string;openingStory?:StoryId;chapters:{title:string;lessons:PathLesson[]}[];depth:PathLesson[]};
export const FORMAT_PATHS=data as FormatPath[];
export const FORMAT_PATH_VERSION=1;
export const FORMAT_PATH_LAUNCH='fi2-format-path-launch';
export type FormatPathLaunch={format:Format;lessonId:string;step:number;quiz:boolean;question:number;nonce:number};
/**
 * THE path "complete" rule (Paths lock states, card tiers, ride unlocks, the IDP all read it). User, Sep 26 2026: completing a
 * lesson's quiz unlocks the next stop. So a lesson is complete once every quiz question has a saved correct answer (retries
 * allowed; CARD_QUIZ_FIRST_TRY is a card rule only). Watched steps are still tracked (quests, the stop's step count, resume
 * point), but are not required: FieldLearning offers "Quiz yourself" after the child taps Next through the play, which records
 * no watched step. A lesson with no quiz questions completes when every step is watched.
 * `quiz` = resume in the quiz: the play has been watched through, or quiz answers have already been started.
 */
export function lessonEvidence(format:Format,lesson:PathLesson,steps:ReadonlySet<string>,answers:ReadonlySet<string>){
 const prefix=`${format}:${lesson.id}:`;
 const watched=Array.from({length:lesson.steps},(_,i)=>steps.has(prefix+i));
 const correct=Array.from({length:lesson.questions},(_,i)=>answers.has(prefix+i));
 const watchedAll=watched.every(Boolean),passed=correct.every(Boolean),started=correct.some(Boolean);
 const complete=lesson.questions>0?passed:watchedAll;
 return {watched:watched.filter(Boolean).length,correct:correct.filter(Boolean).length,complete,step:Math.max(0,watched.indexOf(false)),question:Math.max(0,correct.indexOf(false)),quiz:!complete&&lesson.questions>0&&(watchedAll||started)};
}
/**
 * Paths lock state for a starter stop: the first stop, a stop whose previous stop is complete, and any stop already started or
 * complete are open (nothing re-locks). "Go deeper" lessons are never locked. The Paths screen reads this.
 */
export function pathLessonLocked(path:FormatPath,lesson:PathLesson,steps:ReadonlySet<string>,answers:ReadonlySet<string>){
 const core=path.chapters.flatMap(c=>c.lessons),index=core.findIndex(l=>l.id===lesson.id);if(index<=0)return false;
 const s=lessonEvidence(path.format,lesson,steps,answers);if(s.complete||s.watched>0||s.correct>0)return false;
 return !lessonEvidence(path.format,core[index-1],steps,answers).complete;
}
export function validPathLaunch(value:unknown):value is FormatPathLaunch{
 if(!value||typeof value!=='object')return false;const v=value as FormatPathLaunch,p=FORMAT_PATHS.find(p=>p.format===v.format),l=p&&[...p.chapters.flatMap(c=>c.lessons),...p.depth].find(l=>l.id===v.lessonId);
 return !!l&&Number.isInteger(v.step)&&v.step>=0&&v.step<l.steps&&Number.isInteger(v.question)&&v.question>=0&&v.question<Math.max(1,l.questions)&&typeof v.quiz==='boolean'&&Number.isFinite(v.nonce);
}
