/**
 * Grown-ups progress summary (G-09). Pure: computed from the device's existing saves (path steps, quiz answers, ball hunt,
 * Learning Journeys) so tests can feed it raw save data. Time-agnostic on purpose: no minutes played, no streaks, no dates of play.
 * "Complete" is THE path rule (lessonEvidence: every quiz question answered correctly on this device). It shows understanding in
 * the app, never football ability.
 */
import {FORMAT_PATHS,lessonEvidence,type FormatPath,type PathLesson} from '../paths/formatPaths';
import {STAGES,stageOf,type ReviewRecord,type Stage} from '../learning/review';
import type {Format} from '../town/venues';

/** Mastery stages are Lane 3's (lib/learning/review.ts: new → introduced → practicing → applied → remembered); the wording here
 *  is for grown-ups. Practicing and beyond = the lesson quiz is passed (THE path complete rule). */
export type LessonStage=Stage;
export const STAGE_ORDER:LessonStage[]=[...STAGES].reverse();
export const STAGE_LABELS:Record<LessonStage,{label:string;detail:string}>={
 remembered:{label:'Remembered',detail:'Still right at two spaced reviews, days apart.'},
 applied:{label:'Applied',detail:'Right again in a new setting: a spaced review or a book check.'},
 practicing:{label:'Quiz passed',detail:'Every quiz question answered correctly. Retries are part of learning.'},
 introduced:{label:'Introduced',detail:'Watched or tried some of it.'},
 new:{label:'Not started',detail:'Not opened yet.'},
};
export const isUnderstood=(s:LessonStage)=>s==='practicing'||s==='applied'||s==='remembered';
export const FORMAT_ORDER:Format[]=['7v7','9v9','11v11','futsal'];
export type LessonRef={format:Format;id:string;name:string;core:boolean;stage:LessonStage};
export type FormatSummary={format:Format;title:string;coreTotal:number;coreComplete:number;depthTotal:number;depthComplete:number;pathComplete:boolean;started:boolean;stages:Record<LessonStage,number>;next:LessonRef|null;lessons:LessonRef[]};
/** `reviews`: Lane 3's spaced-review records keyed `format:lessonId` (optional). `badges`: extra badge labels (graduations). */
export type ProgressInput={steps:ReadonlySet<string>;answers:ReadonlySet<string>;balls:{found:number;total:number};journeys?:{title:string;status:string}[];badges?:string[];preferred?:Format|null;reviews?:Readonly<Record<string,ReviewRecord>>};
export type ProgressSummary={formats:FormatSummary[];totals:Record<LessonStage,number>&{lessons:number;understood:number};pathsComplete:Format[];balls:{found:number;total:number};journeys:{title:string;status:string}[];badges:string[];nextUp:LessonRef[];recent:LessonRef[]};

export function lessonStage(format:Format,lesson:PathLesson,steps:ReadonlySet<string>,answers:ReadonlySet<string>,review?:ReviewRecord):LessonStage{
 return stageOf(lessonEvidence(format,lesson,steps,answers),review);
}
export const graduateBadge=(title:string)=>`${title} graduate`;
const emptyStages=():Record<LessonStage,number>=>({new:0,introduced:0,practicing:0,applied:0,remembered:0});
/** Formats in the grown-up's preferred order: their chosen format first, then simplest to fullest. */
export const orderedFormats=(preferred?:Format|null)=>preferred?[preferred,...FORMAT_ORDER.filter(f=>f!==preferred)]:FORMAT_ORDER;

export function summarizeProgress(input:ProgressInput,paths:FormatPath[]=FORMAT_PATHS):ProgressSummary{
 const {steps,answers}=input;const totals={...emptyStages(),lessons:0,understood:0};
 const formats=orderedFormats(input.preferred).flatMap(format=>{
  const p=paths.find(p=>p.format===format);if(!p)return [];
  const core=p.chapters.flatMap(c=>c.lessons),stages=emptyStages();
  const lessons:LessonRef[]=[...core.map(l=>({l,core:true})),...p.depth.map(l=>({l,core:false}))].map(({l,core})=>({format,id:l.id,name:l.name,core,stage:lessonStage(format,l,steps,answers,input.reviews?.[`${format}:${l.id}`])}));
  for(const l of lessons){stages[l.stage]++;totals[l.stage]++;totals.lessons++;if(isUnderstood(l.stage))totals.understood++;}
  const coreRefs=lessons.filter(l=>l.core),depthRefs=lessons.filter(l=>!l.core);
  const coreComplete=coreRefs.filter(l=>isUnderstood(l.stage)).length,pathComplete=coreRefs.length>0&&coreComplete===coreRefs.length;
  const next=coreRefs.find(l=>!isUnderstood(l.stage))??depthRefs.find(l=>!isUnderstood(l.stage))??null;
  return [{format,title:p.title,coreTotal:coreRefs.length,coreComplete,depthTotal:depthRefs.length,depthComplete:depthRefs.filter(l=>isUnderstood(l.stage)).length,pathComplete,started:lessons.some(l=>l.stage!=='new'),stages,next,lessons}];
 });
 const started=formats.filter(f=>f.started);
 // Next up: the next stop in every started path (or the preferred/simplest path when nothing is started yet).
 const nextUp=(started.length?started:formats.slice(0,1)).flatMap(f=>f.next?[f.next]:[]).slice(0,3);
 // What they've been learning: the furthest lessons touched in each started path (no timestamps exist, by design).
 const recent=started.flatMap(f=>f.lessons.filter(l=>l.stage!=='new').slice(-2).reverse()).slice(0,4);
 const pathsComplete=formats.filter(f=>f.pathComplete).map(f=>f.format);
 const badges=[...new Set([...(input.badges??[]),...pathsComplete.map(f=>graduateBadge(formats.find(x=>x.format===f)!.title))])];
 return {formats,totals,pathsComplete,balls:{found:Math.max(0,Math.min(input.balls.found,input.balls.total)),total:input.balls.total},journeys:input.journeys??[],badges,nextUp,recent};
}
