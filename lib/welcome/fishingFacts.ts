/**
 * The Welcome back note's fishing facts (Nov 14 2026, docs/welcome-suggestions.md + docs/fishing.md "Come back tomorrow"): the
 * Fishbook and the come-back picks from lib/town/fishing/comeback.ts, turned into WelcomeFacts['fishing'] for lib/welcome/hooks.ts.
 * Pure (no storage: facts.ts reads the saves and passes them in), so tests/fishing-reach.cjs loads it directly.
 */
import type {WelcomeFacts} from './hooks';
import {sanitizeFishbook} from '../town/fishing/fishingCore';
import {sanitizeHooks} from '../town/fishing/fishingHooks';
import {fishOfTheDay,isoWeek,localDay,nearlyDoneSets,sanitizeComeback,weeklyVisitor} from '../town/fishing/comeback';
import {FISH} from '../town/fishing/fishCatalog';
import {SHORE_SPOTS,spotById} from '../town/fishing/fishSpots';

/** Shore spots (walkable, a Go fishing can land there) whose table has this species. */
const shoreSpotsOf=(id:string)=>SHORE_SPOTS.filter(s=>id in s.weights).map(s=>s.id as string);
/** Days the weekly visitor has left, today included (ISO weeks end on Sunday: Monday 7 … Sunday 1). */
export const visitorDaysLeft=(now:number)=>8-(new Date(now).getDay()||7);
/** The visitor note shows in its last days only ("leaves in 2 days"). */
export const VISITOR_LEAVING_DAYS=3;
export type FishingFactsInput={now?:number;
 /** fi2-fishing-comeback-v1 (the fish of the day / the visitor caught today / this week). */
 comeback?:unknown;
 /** fi2-fishing-hooks-v1 (claimed sets). */
 hooks?:unknown;
 /** The island's Day / Sunset / Night mode (fi2-time-of-day). */
 time?:string|null};

/**
 * Fishbook progress and the come-back picks (lib/town/fishing/comeback.ts): species caught, the set closest to done (1–3 left,
 * at least one caught, via nearlyDoneSets), the fish of the day (until caught today), the weekly visitor in its last days (until
 * caught this week), and a sunset fish still to catch while the island is at sunset. Spots are shore spot ids, so a tap can travel
 * to THAT fish (lib/welcome/act.ts). Pure.
 */
export function fishingFacts(book:unknown,o:FishingFactsInput={}):NonNullable<WelcomeFacts['fishing']>{
 const now=o.now??Date.now(),b=sanitizeFishbook(book),species=Object.values(b.species).filter(e=>(e?.count??0)>0).length;
 const caught=(id:string)=>(b.species[id]?.count??0)>0,claimed=sanitizeHooks(o.hooks).sets,cb=sanitizeComeback(o.comeback);
 const ns=nearlyDoneSets({book:b,claimed},3).find(s=>s.got>0),nearSet=ns?{title:ns.set.title,left:ns.left}:null;
 const fd=fishOfTheDay(localDay(now)),fdSpots=shoreSpotsOf(fd.id);
 const fishOfDay=cb.fotdDay!==localDay(now)&&fdSpots.length?{name:fd.name,spots:fdSpots}:null;
 const v=weeklyVisitor(now),days=visitorDaysLeft(now);
 const visitorLeaving=cb.visitorWeek!==isoWeek(now)&&days<=VISITOR_LEAVING_DAYS?{name:v.fish.name,days,spot:v.spot}:null;
 // Sunset fish join a spot through their own `spots` list (nightFish.ts), not the day weights.
 let sunsetSpot:{name:string;spot:string}|null=null;
 if(o.time==='sunset')for(const f of FISH){if(f.when!=='sunset'||caught(f.id))continue;const sp=f.spots.find(id=>SHORE_SPOTS.some(x=>x.id===id)),n=sp&&spotById(sp)?.name;if(sp&&n){sunsetSpot={name:n,spot:sp};break;}}
 return {species,nearSet,fishOfDay,visitorLeaving,sunsetSpot};
}
