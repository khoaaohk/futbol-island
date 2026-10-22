/**
 * Learning analytics call sites (Oct 9 2026): one line at the moment a learning event already happens. Each is a map increment
 * in the tracker (lib/analytics/tracker.ts count) and nothing else: no state, no re-render, no timer, no request. When the
 * tracker is off (dev, DNT/GPC, bots, preview, labs, admin, localhost) every call is a no-op. Ids: lib/analytics/countIds.ts.
 */
import {count} from './tracker';
import {lessonKey,optionKey,questionKey,type LessonStage} from './countIds';
import {partyLive} from './partyEvents';

/** The welcome walkthrough was shown in this page's lifetime (so a later lesson open counts as "opened a lesson after it"). */
let walkthroughShown=false,walkthroughLesson=false;

/**
 * Learning in a party (Oct 22 2026, Phase B of docs/analytics-multiplayer-plan.md §6): while this device is in a live party
 * (partyEvents.ts partyLive), a lesson opened / quiz started / quiz finished also adds its mp: twin. Never which lesson.
 */
const PARTY_TWIN:Partial<Record<LessonStage|'lo',string>>={lo:'mp:lesson',ls:'mp:quiz',lf:'mp:quiz_done'};
const twin=(stage:LessonStage|'lo')=>{const id=PARTY_TWIN[stage];if(id&&partyLive())count(id);};
export function countLessonStage(stage:LessonStage,lessonId:string){count(lessonKey(stage,lessonId));twin(stage);}
export function countLessonOpened(lessonId:string){
 count(lessonKey('lo',lessonId));twin('lo');
 if(walkthroughShown&&!walkthroughLesson){walkthroughLesson=true;count('ob:lesson');}
}
/** The FIRST attempt at a question in a quiz run: the question, and the option index it chose (never the answer's text). */
export function countFirstTry(lessonId:string,question:number,option:number){count(questionKey(lessonId,question));count(optionKey(lessonId,question,option));}
export function countWalkthroughStep(step:string){walkthroughShown=true;count('ob:seen:'+step);}
export const countWalkthroughSkip=(step:string)=>count('ob:skip:'+step);
export const countWalkthroughExplore=()=>count('ob:explore');
export const countPathLaunch=(format:string)=>count('pf:'+format);
export const countGraduation=(key:string)=>count('gr:'+key);
export function countReview(firstTryRight:boolean){count('rv:q');if(firstTryRight)count('rv:ok');}
export const countReviewDone=()=>count('rv:done');
/** The Island Tutorial (components/IslandTutorial.tsx): opened, and its last scene reached (Replay counts again). */
export const countTutorialOpen=()=>count('tu:open');
export const countTutorialFinish=()=>count('tu:finish');
