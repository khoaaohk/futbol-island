/**
 * Fishing "come back tomorrow" features (Nov 14 2026, docs/fishing.md "Come back tomorrow"). Pure: no storage, no React, no timers
 * (comebackStore.ts is the browser binding). Every rule is deterministic from the player's LOCAL date (and hour), so the same day
 * always gives the same answer, and other features (the per-player welcome-back note) can call these helpers as hooks:
 *  - fishOfTheDay(date): one reachable, non-legendary species a local day. Rosa pays double for it (inside the shared daily
 *    soft cap, lib/town/market/market.ts), its shadow glows faintly.
 *  - conditionAt(date): the sea's condition for a 3-hour block (calm water, sea mist, high tide …). It nudges which families bite
 *    (fishingOdds.ts familyMixes: never a rarity share, value-guarded); a plain line in the HUD and a light water tint.
 *  - weeklyVisitor(date): one Rare / Legendary-rarity species at a named spot for an ISO week (a value-guarded nudge there).
 *  - setsProgress / nearlyDoneSets: the Fishbook sets (fishingHooks.ts FISH_SETS) with progress, and the ones close to done.
 *  - newRecord: a personal best per species (the Fishbook's `biggest`, already in the synced save).
 * The small save `fi2-fishing-comeback-v1` (synced, lib/saves/snapshot.ts) only remembers which day / week the player caught the
 * fish of the day / the visitor (for the "Caught ✓" marks and one analytics count each), so it stays ~120 bytes.
 */
import {FISH_SETS,setProgress as oneSetProgress,type FishSet} from './fishingHooks';
import {DAY,fishOfTheDay,isoWeek,localDay,weeklyVisitorFor} from './fishDaily';
export {FOTD_MULT,FOTD_POOL,VISITOR_BOOST,VISITOR_POOL,fishOfTheDay,fotdWhere,isFishOfTheDay,isoWeek,localDay,weeklyVisitor,weeklyVisitorFor,type WeeklyVisitor} from './fishDaily';
// ---- 2. Conditions: ./fishConditions.ts (the odds read it; it imports nothing from the hooks) ----
export {CONDITIONS,CONDITION_BOOST,CONDITION_HOURS,conditionAt,conditionById,conditionFor,type Condition,type ConditionId} from './fishConditions';

// ---- 4. Sets (the Fishbook sets live in fishingHooks.ts) ----
type BookLike={species:Partial<Record<string,{count:number;biggest?:number}|undefined>>};
export type SetState={set:FishSet;got:number;total:number;left:number;done:boolean};
/** Every set with its progress (`claimed`: the hooks save's completed sets). */
export function setsProgress(save:{book:BookLike;claimed?:readonly string[]}):SetState[]{
 return FISH_SETS.map(set=>{const p=oneSetProgress(set,save.book);return {set,got:p.got,total:p.total,left:p.total-p.got,done:p.got>=p.total||!!save.claimed?.includes(set.id)};});
}
/** The brief's name for the same helper. */
export const setProgress=setsProgress;
/** Sets one to `maxLeft` animals from done, the closest first (a welcome-back note's "2 more for the Reef sharks set"). */
export function nearlyDoneSets(save:{book:BookLike;claimed?:readonly string[]},maxLeft=2):SetState[]{
 return setsProgress(save).filter(s=>!s.done&&s.left>0&&s.left<=maxLeft).sort((a,b)=>a.left-b.left||b.got-a.got);
}

// ---- 5. Personal bests (the Fishbook's `biggest`) ----
/** A new record when this species was caught before and this one is bigger. */
export const newRecord=(prevBest:number|undefined,size:number)=>(prevBest??0)>0&&size>(prevBest??0);
export const personalBest=(book:BookLike,id:string)=>book.species[id]?.biggest??0;

// ---- The save ----
export const COMEBACK_KEY='fi2-fishing-comeback-v1';
export type ComebackSave={version:1;
 /** The last local day the fish of the day was caught, and on how many days in all. */
 fotdDay:string;fotdDays:number;
 /** The last ISO week the weekly visitor was caught, and in how many weeks in all. */
 visitorWeek:string;visitorWeeks:number};
export const emptyComeback=():ComebackSave=>({version:1,fotdDay:'',fotdDays:0,visitorWeek:'',visitorWeeks:0});
const WEEK=/^\d{4}-W\d{2}$/;
const whole=(v:unknown)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.min(1e5,Math.floor(v))):0;
export function sanitizeComeback(value:unknown):ComebackSave{
 const v=value&&typeof value==='object'?value as Partial<ComebackSave>:{};
 return {version:1,fotdDay:typeof v.fotdDay==='string'&&DAY.test(v.fotdDay)?v.fotdDay:'',fotdDays:whole(v.fotdDays),
  visitorWeek:typeof v.visitorWeek==='string'&&WEEK.test(v.visitorWeek)?v.visitorWeek:'',visitorWeeks:whole(v.visitorWeeks)};
}
export function mergeComeback(a:ComebackSave,b:ComebackSave):ComebackSave{
 return {version:1,fotdDay:a.fotdDay>b.fotdDay?a.fotdDay:b.fotdDay,fotdDays:Math.max(a.fotdDays,b.fotdDays),
  visitorWeek:a.visitorWeek>b.visitorWeek?a.visitorWeek:b.visitorWeek,visitorWeeks:Math.max(a.visitorWeeks,b.visitorWeeks)};
}
export type ComebackEffects={fotd:boolean;fotdFirstToday:boolean;visitor:boolean;record:boolean};
/** One landed catch. Pure. `prevBest`: this species' best before the catch (0 = first one). */
export function comebackCatch(save:ComebackSave,c:{id:string;spot:string;size:number;now:number;prevBest?:number}):{save:ComebackSave;effects:ComebackEffects}{
 const day=localDay(c.now),week=isoWeek(c.now),fotd=fishOfTheDay(day).id===c.id,v=weeklyVisitorFor(week);
 const visitor=v.fish.id===c.id&&v.spot===c.spot&&save.visitorWeek!==week,first=fotd&&save.fotdDay!==day;
 let next=save;
 if(first)next={...next,fotdDay:day,fotdDays:Math.min(1e5,next.fotdDays+1)};
 if(visitor)next={...next,visitorWeek:week,visitorWeeks:Math.min(1e5,next.visitorWeeks+1)};
 return {save:next,effects:{fotd,fotdFirstToday:first,visitor,record:newRecord(c.prevBest,c.size)}};
}
