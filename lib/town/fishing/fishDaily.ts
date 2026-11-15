/**
 * The daily and weekly picks (Nov 14 2026, docs/fishing.md "Come back tomorrow"): the fish of the day and the weekly visitor, both
 * deterministic from the player's LOCAL date. Pure and tiny, and it imports nothing from the return hooks, so the market (double
 * pay for the fish of the day) and the odds stay independent of them. ./comeback.ts re-exports all of it.
 */
import {FISH,SHORE_SPOTS,spotById,type FishSpecies} from './fishCatalog';
import {dayKey,hash01} from './timeOfDay';

export const DAY=/^\d{4}-\d{2}-\d{2}$/;
type When=Date|number|string;
/** The local day (YYYY-MM-DD) of a date, a timestamp or a day string. */
export function localDay(when:When=Date.now()):string{
 if(typeof when==='string')return DAY.test(when)?when:dayKey(Date.now());
 const t=when instanceof Date?when.getTime():when;return dayKey(Number.isFinite(t)?t:Date.now());
}
const SHORE_IDS=new Set<string>(SHORE_SPOTS.map(s=>s.id));
/** Shore spots (walkable) whose own table has this species. */
const shoreSpotsOf=(f:FishSpecies)=>SHORE_SPOTS.filter(s=>f.id in s.weights).map(s=>s.id as string);

// ---- 1. Fish of the day ----
/** Pays double at every fish buyer, still counted inside the daily full-price allowance. */
export const FOTD_MULT=2;
/** Reachable from the shore, any time of day, never a legendary-rarity animal (Island Legends are not in FISH at all). */
export const FOTD_POOL:readonly FishSpecies[]=FISH.filter(f=>f.rarity!=='legendary'&&!f.when&&f.spots.some(s=>SHORE_IDS.has(s))&&shoreSpotsOf(f).length>0);
const fotdMemo={day:'',fish:FOTD_POOL[0],min:-1};
export function fishOfTheDay(when:When=Date.now()):FishSpecies{
 // The world asks every frame a shadow shows: a timestamp in the same minute reuses the last answer (no Date allocated).
 const min=typeof when==='number'?Math.floor(when/6e4):-1;if(min>=0&&min===fotdMemo.min)return fotdMemo.fish;
 const day=localDay(when);fotdMemo.min=min;if(fotdMemo.day===day)return fotdMemo.fish;
 const fish=FOTD_POOL[Math.min(FOTD_POOL.length-1,Math.floor(hash01(`fotd|${day}`)*FOTD_POOL.length))];
 fotdMemo.day=day;fotdMemo.fish=fish;return fish;
}
/** True when `id` is the fish of that local day (a bad day string is never one, so sims without a day stay neutral). */
export const isFishOfTheDay=(id:string,day:string|undefined)=>!!day&&DAY.test(day)&&fishOfTheDay(day).id===id;
/** Where to look for it: up to two shore spots by name. */
export function fotdWhere(f:FishSpecies):string{const n=shoreSpotsOf(f).slice(0,2).map(id=>spotById(id)?.name).filter(Boolean);return n.length?n.join(' or '):'the shore';}

// ---- 3. Weekly visitor (ISO week, local date) ----
/** ISO-8601 week of the local date: "2026-W46". */
export function isoWeek(when:When=Date.now()):string{
 const d=when instanceof Date?when:typeof when==='number'?new Date(when):new Date(`${localDay(when)}T12:00:00`);
 const t=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())),wd=t.getUTCDay()||7;t.setUTCDate(t.getUTCDate()+4-wd);
 const y=t.getUTCFullYear(),w=Math.ceil(((t.getTime()-Date.UTC(y,0,1))/864e5+1)/7);return `${y}-W${String(w).padStart(2,'0')}`;
}
export const VISITOR_POOL:readonly FishSpecies[]=FISH.filter(f=>(f.rarity==='rare'||f.rarity==='legendary')&&!f.when&&shoreSpotsOf(f).length>0);
/** How strongly the visitor is pulled at its spot this week (inside its rarity, value-guarded with the lure and the condition). */
export const VISITOR_BOOST=2.5;// = fishingOdds.ts FAMILY_BOOST.visitor (tests/fishing-comeback.cjs checks they match)
export type WeeklyVisitor={week:string;fish:FishSpecies;spot:string;spotName:string};
export function weeklyVisitorFor(week:string):WeeklyVisitor{
 const fish=VISITOR_POOL[Math.min(VISITOR_POOL.length-1,Math.floor(hash01(`week|${week}`)*VISITOR_POOL.length))],spots=shoreSpotsOf(fish);
 const spot=spots[Math.min(spots.length-1,Math.floor(hash01(`weekspot|${week}`)*spots.length))];
 return {week,fish,spot,spotName:spotById(spot)?.name??spot};
}
export const weeklyVisitor=(when:When=Date.now())=>weeklyVisitorFor(isoWeek(when));

