import {FORMAT_PATHS,lessonEvidence,type FormatPath,type PathLesson} from './formatPaths';
import type {Format} from '../town/venues';
/**
 * ONE first path and ONE "Continue" rule (G-02, G-12; Sep 30 2026). Pure: no React, no browser globals (storage is passed in).
 *
 * Every surface agrees that new players start on 7v7, the simplest format (all Beginner lessons, plain words): onboarding
 * ("Paths start with 7v7…"), the island field card near spawn (Old Town Ground, 7v7), the Paths screen and the welcome-back card.
 * The 11-a-side ladder follows the youth pathway 7v7 → 9v9 → 11v11. Futsal is its own game (5-a-side on a court, with its own
 * role names: fixo, ala, pivot), so it sits last in the tabs: always open, never the default.
 */
export const DEFAULT_PATH_FORMAT:Format='7v7';
export const PATH_ORDER:readonly Format[]=['7v7','9v9','11v11','futsal'];
export const PATHS_IN_ORDER:FormatPath[]=PATH_ORDER.map(format=>FORMAT_PATHS.find(p=>p.format===format)!).filter(Boolean);
/** The Paths tab the player last chose (QuestLearningPath writes it). */
export const PATH_FORMAT_KEY='fi2-path-format-v1';
/** The lesson last opened per format ({format: lessonId}), so Continue resumes it. */
export const PATH_LAST_OPENED_KEY='fi2-path-last-opened-v1';

export type ContinueTarget=
 |{kind:'lesson';format:Format;lesson:PathLesson;index:number;label:'Start here'|'Continue where you left off'|'Up next'}
 |{kind:'complete';format:Format;next:Format|null};

const coreOf=(path:FormatPath)=>path.chapters.flatMap(c=>c.lessons);
export const pathComplete=(path:FormatPath,steps:ReadonlySet<string>,answers:ReadonlySet<string>)=>coreOf(path).every(l=>lessonEvidence(path.format,l,steps,answers).complete);

/**
 * Where "Continue" goes: always a REQUIRED (starter) lesson, never an optional story or a "Go deeper" lesson.
 *  1. the starter lesson last opened in this path, if it is not complete yet ("Continue where you left off");
 *  2. otherwise the first starter lesson that is not complete ("Start here" when nothing has begun, else "Up next");
 *  3. a finished path points at the next unfinished path in PATH_ORDER (null when every path is done).
 */
export function pathContinue(path:FormatPath,steps:ReadonlySet<string>,answers:ReadonlySet<string>,lastOpenedId?:string|null):ContinueTarget{
 const core=coreOf(path),status=(l:PathLesson)=>lessonEvidence(path.format,l,steps,answers);
 const last=lastOpenedId?core.find(l=>l.id===lastOpenedId):undefined;
 if(last&&!status(last).complete)return {kind:'lesson',format:path.format,lesson:last,index:core.indexOf(last),label:'Continue where you left off'};
 const next=core.find(l=>!status(l).complete);
 if(next){
  const untouched=!last&&core.every(l=>{const s=status(l);return !s.complete&&s.watched===0&&s.correct===0;});
  return {kind:'lesson',format:path.format,lesson:next,index:core.indexOf(next),label:untouched?'Start here':'Up next'};
 }
 return {kind:'complete',format:path.format,next:nextPathFormat(path.format,steps,answers)};
}
/** The next path to try after `format` (PATH_ORDER, wrapping), skipping finished ones; null when all four are finished. */
export function nextPathFormat(format:Format,steps:ReadonlySet<string>,answers:ReadonlySet<string>):Format|null{
 const at=PATH_ORDER.indexOf(format);
 for(let i=1;i<PATH_ORDER.length;i++){const f=PATH_ORDER[(at+i)%PATH_ORDER.length],p=FORMAT_PATHS.find(x=>x.format===f);if(p&&!pathComplete(p,steps,answers))return f;}
 return null;
}
/**
 * QA11 legacy saves: until Sep 30 2026 Paths opened on futsal and saved the tab only when the player switched, so a save with
 * no saved tab may have been playing any path. With no saved tab, open the path with the most recent activity, else the most
 * progress; ties go to PATH_ORDER (7v7 first, futsal last). null for a new player. QuestLearningPath writes the result once.
 *  - Recent activity: a path with a last-opened lesson (Paths records it on every open; there are no timestamps, so when
 *    several paths have one, progress decides between them).
 *  - Progress: starter lessons complete, then any watched step or right answer (starter or Go deeper).
 * QA11 C-5: this used to check futsal first, so a save that had passed 7v7 lessons (and one futsal lesson) was sent to futsal 1.
 */
export function inferredPathFormat(storage:Pick<Storage,'getItem'>|null|undefined,steps:ReadonlySet<string>=new Set(),answers:ReadonlySet<string>=new Set()):Format|null{
 const last=savedLastOpened(storage);
 const score=(f:Format)=>{const p=FORMAT_PATHS.find(x=>x.format===f);if(!p)return [0,0] as const;let done=0,touched=0;
  for(const l of coreOf(p)){const e=lessonEvidence(f,l,steps,answers);if(e.complete)done++;touched+=e.watched+e.correct;}
  for(const l of p.depth){const e=lessonEvidence(f,l,steps,answers);touched+=e.watched+e.correct;}
  return [done,touched] as const;};
 const better=(a:Format,b:Format)=>{const x=score(a),y=score(b);return x[0]!==y[0]?x[0]>y[0]:x[1]>y[1];};
 const pick=(list:Format[])=>list.reduce<Format|null>((best,f)=>best===null||better(f,best)?f:best,null);
 const opened=PATH_ORDER.filter(f=>typeof last[f]==='string'&&!!last[f]);
 if(opened.length)return pick(opened);
 const started=PATH_ORDER.filter(f=>{const [done,touched]=score(f);return done>0||touched>0;});
 return started.length?pick(started):null;
}
/** The format Paths opens on: the saved tab, else the path that already has progress (legacy saves), else 7v7 for a new player. */
export function savedPathFormat(storage:Pick<Storage,'getItem'>|null|undefined,steps?:ReadonlySet<string>,answers?:ReadonlySet<string>):Format{
 try{const saved=storage?.getItem(PATH_FORMAT_KEY);if(saved&&PATH_ORDER.includes(saved as Format))return saved as Format;}catch{}
 return inferredPathFormat(storage,steps,answers)??DEFAULT_PATH_FORMAT;
}
export function savedLastOpened(storage:Pick<Storage,'getItem'>|null|undefined):Record<string,string>{
 try{const v=JSON.parse(storage?.getItem(PATH_LAST_OPENED_KEY)??'{}');return v&&typeof v==='object'&&!Array.isArray(v)?v:{};}catch{return {};}
}
/** The one suggested next step outside Paths (welcome-back card): the saved path's Continue target. */
export function suggestedNextStep(storage:Pick<Storage,'getItem'>|null|undefined,steps:ReadonlySet<string>,answers:ReadonlySet<string>):ContinueTarget{
 const format=savedPathFormat(storage,steps,answers),path=FORMAT_PATHS.find(p=>p.format===format)!;
 const target=pathContinue(path,steps,answers,savedLastOpened(storage)[format]);
 if(target.kind==='complete'&&target.next){const nextPath=FORMAT_PATHS.find(p=>p.format===target.next)!;return pathContinue(nextPath,steps,answers,savedLastOpened(storage)[target.next]);}
 return target;
}
