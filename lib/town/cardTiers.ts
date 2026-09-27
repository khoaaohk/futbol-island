import data from './cardTiers.json';
import {FORMAT_PATHS,lessonEvidence} from '../paths/formatPaths';
import {sanitizeQuestEvidence} from './questModel';
import {QUEST_STORAGE_KEY} from './questProgress';
import {QUIZ_STORAGE_KEY} from './quizProgress';
import {tierFromDemand,type CardTier} from './cardRewards';

/**
 * Card value tiers and the path progress that unlocks them (docs/card-rewards.md "Value tiers"). The tier data (a fan-demand
 * judgement score and a short reason per card) is lib/town/cardTiers.json; the unlock rules are in cardRewards.ts.
 */
type TierData={thresholds:{icon:number;elite:number};overrides:Record<string,string>;cards:Record<string,{demand:number;why:string}>};
const TIERS=data as TierData;
export const cardDemand=(name:string)=>TIERS.cards[name]?.demand;
export const cardTier=(name:string):CardTier=>tierFromDemand(cardDemand(name),TIERS.thresholds,TIERS.overrides[name]);

export type PathProgress={best:number;finished:string[];byFormat:Record<string,number>};
/** Starter-lesson progress per path, with the same "complete" rule as the Paths screen (lessonEvidence: every quiz
 *  question answered correctly, retries allowed; a lesson without a quiz needs every step watched). `best` is the furthest path (0–1); `finished` the paths fully complete. */
export function pathProgressFrom(steps:ReadonlySet<string>,answers:ReadonlySet<string>):PathProgress{
 const byFormat:Record<string,number>={};const finished:string[]=[];
 for(const path of FORMAT_PATHS){
  const core=path.chapters.flatMap(chapter=>chapter.lessons);if(!core.length)continue;
  const done=core.filter(lesson=>lessonEvidence(path.format,lesson,steps,answers).complete).length;
  byFormat[path.format]=done/core.length;if(done===core.length)finished.push(path.format);
 }
 return {best:Math.max(0,...Object.values(byFormat)),finished,byFormat};
}

/** Dev-only preview of the tier gates (docs/card-rewards.md): `?cardpath=85` pretends the furthest path is 85% complete (0–100),
 *  `?cardpath=off` goes back. Remembered in localStorage; always ignored in production builds. */
export const CARD_DEV_PROGRESS_KEY='fi2-cards-dev-progress-v1';
export function cardDevProgress():number|null{
 if(process.env.NODE_ENV==='production'||typeof window==='undefined')return null;
 try{
  const value=new URLSearchParams(location.search).get('cardpath');
  if(value==='off')localStorage.removeItem(CARD_DEV_PROGRESS_KEY);else if(value!==null&&Number.isFinite(Number(value)))localStorage.setItem(CARD_DEV_PROGRESS_KEY,String(Math.max(0,Math.min(100,Number(value)))));
  const saved=localStorage.getItem(CARD_DEV_PROGRESS_KEY);return saved===null?null:Number(saved)/100;
 }catch{return null;}
}

/** The furthest path's progress (0–1) on this device right now, read straight from storage (so other tabs' progress counts). */
export function readPathProgress():number{
 const dev=cardDevProgress();if(dev!==null)return dev;
 if(typeof window==='undefined')return 0;
 try{
  const steps=new Set(sanitizeQuestEvidence(JSON.parse(localStorage.getItem(QUEST_STORAGE_KEY)??'null')).steps);
  const saved=JSON.parse(localStorage.getItem(QUIZ_STORAGE_KEY)??'[]'),answers=new Set<string>(Array.isArray(saved)?saved.filter((key:unknown):key is string=>typeof key==='string'):[]);
  return pathProgressFrom(steps,answers).best;
 }catch{return 0;}
}
