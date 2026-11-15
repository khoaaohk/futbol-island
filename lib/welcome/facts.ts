/**
 * Gathers the plain WelcomeFacts (lib/welcome/hooks.ts) from this device's save, once, when the Welcome back note opens. Reads
 * only: the Fishbook and its sets, the Paths Continue target and lesson evidence, the arcade's "Today" card, the tally. Never
 * throws (a store that fails to read leaves its facts out). Nothing here is sent anywhere.
 */
import type {WelcomeFacts,LessonFact} from './hooks';
import {lessonStreak,type Tally} from './tally';
import {kitNewsFor} from './kitNews';
import {suggestedNextStep,PATHS_IN_ORDER} from '../paths/pathContinue';
import {lessonEvidence,type PathLesson} from '../paths/formatPaths';
import {TIME_KEY} from '../town/fishing/timeOfDay';
import {FISHING_HOOKS_KEY} from '../town/fishing/fishingHooks';
import {COMEBACK_KEY} from '../town/fishing/comeback';
import {fishingFacts} from './fishingFacts';
export {fishingFacts,visitorDaysLeft,VISITOR_LEAVING_DAYS,type FishingFactsInput} from './fishingFacts';
import {readArcadeToday,dailyRunOpen} from '../arcade/arcadeToday';
import {TODAY_CABINETS,todayChallenge,weekDays,pennantLit,type TodayCabinet} from '../arcade/arcadeTodayCore';
import {arcadeCabinets} from '../arcade/arcadeCatalog';
import {localPlayDay} from '../town/dailyPlay';

/** About 15 seconds a lesson step (narrated plays): a 9-step lesson reads "2 min". */
export const lessonMinutes=(l:Pick<PathLesson,'steps'>)=>Math.max(1,Math.round(l.steps*15/60));
/** The passing lesson behind Pass Puzzles in each path (cross nudge for arcade fans). */
export const PASSING_LESSON:Record<string,string>={'7v7':'prn_7_support','9v9':'prn_9_support',futsal:'prn_f_support','11v11':'e_thirdman'};
const fact=(format:string,l:PathLesson):LessonFact=>({format,lessonId:l.id,name:l.name,minutes:lessonMinutes(l)});
const nameOf=(id:string)=>arcadeCabinets.find(c=>c.id===id)?.name??null;

export function readWelcomeFacts(storage:Pick<Storage,'getItem'>|null,steps:ReadonlySet<string>,answers:ReadonlySet<string>,tally:Tally,today:number,now=Date.now()):WelcomeFacts{
 const f:WelcomeFacts={weekend:[0,6].includes(new Date(now).getDay())};
 try{const j=(k:string)=>{try{return JSON.parse(storage?.getItem(k)??'null');}catch{return null;}};
  f.fishing=fishingFacts(j('fi2-fishbook-v1'),{now,comeback:j(COMEBACK_KEY),hooks:j(FISHING_HOOKS_KEY),time:storage?.getItem(TIME_KEY)??''/* only a sunset the player chose: the island's default time is sunset, so the default must not fire the hook for everyone */});}catch{}
 try{
  const t=suggestedNextStep(storage,steps,answers),s=lessonStreak(tally,today);
  if(t.kind==='lesson'){
   const path=PATHS_IN_ORDER.find(p=>p.format===t.format),core=path?path.chapters.flatMap(c=>c.lessons):[];
   const left=core.filter(l=>!lessonEvidence(t.format,l,steps,answers).complete).length;
   const pid=PASSING_LESSON[t.format],pl=path?[...core,...path.depth].find(l=>l.id===pid):undefined;
   f.lessons={next:fact(t.format,t.lesson),pathTitle:t.format,leftInPath:left,streak:s.days,lessonToday:s.today,passing:pl?fact(t.format,pl):null};
  }
 }catch{}
 try{
  const day=localPlayDay(now),save=readArcadeToday(),fav=tally.fav&&(TODAY_CABINETS as readonly string[]).includes(tally.fav)?tally.fav as TodayCabinet:null;
  const cab:TodayCabinet=fav&&(fav!=='runner'||dailyRunOpen())?fav:'puzzle',ch=todayChallenge(day,cab);
  f.arcade={fav:fav&&nameOf(fav)?{game:fav,name:nameOf(fav)!}:null,challenge:{game:cab,name:nameOf(cab)??'the arcade',line:ch.line,done:(save.done[day]??[]).includes(cab)},
   weekDays:weekDays(save,day),pennantLit:pennantLit(save,day)};
 }catch{}
 f.kit={news:kitNewsFor(tally.l[4],today),visited:tally.l[4]>0};
 return f;
}
