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
import {sanitizeFishbook} from '../town/fishing/fishingCore';
import {FISH_SETS,setProgress} from '../town/fishing/fishingHooks';
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

/** Fishbook progress: species caught and the set closest to done (1–3 left, at least one caught). Pure. */
export function fishingFacts(book:unknown):NonNullable<WelcomeFacts['fishing']>{
 const b=sanitizeFishbook(book),species=Object.values(b.species).filter(e=>(e?.count??0)>0).length;
 let near:{title:string;left:number}|null=null;
 for(const s of FISH_SETS){const p=setProgress(s,b),left=p.total-p.got;if(p.got>0&&left>0&&left<=3&&(!near||left<near.left))near={title:s.title,left};}
 // TODO(fish-comeback merge): fishOfDay / visitorLeaving / sunsetSpot from lib/town/fishing/comeback.ts.
 return {species,nearSet:near};
}

export function readWelcomeFacts(storage:Pick<Storage,'getItem'>|null,steps:ReadonlySet<string>,answers:ReadonlySet<string>,tally:Tally,today:number,now=Date.now()):WelcomeFacts{
 const f:WelcomeFacts={weekend:[0,6].includes(new Date(now).getDay())};
 try{f.fishing=fishingFacts(JSON.parse(storage?.getItem('fi2-fishbook-v1')??'null'));}catch{}
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
