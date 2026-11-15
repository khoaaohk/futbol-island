/**
 * Fishing reach (Nov 14 2026, docs/fishing.md "Reach and fixes"): getting more players to a first catch.
 * Admin data Nov 1–14: 6 of 100 new players fished on day 1, yet returners spend the 3rd-most time fishing.
 *
 * - "Go fishing" (the in-island Welcome back note's suggestion, the island map): `requestGoFishing` asks Town to travel to the
 *   nearest shore spot (`goFishingTarget`; Town.tsx listens for GO_FISHING_EVENT), or to a named fish's spot when given ids.
 * - First catch guaranteed: until this device has landed a fish (FIRST_CATCH_KEY, a DEVICE key) and while the Fishbook is empty,
 *   the live roll returns the spot's most common common (`firstCatchFish`). Commons never run, so the fight is short.
 * - Spot discovery: a player who has never fished sees a bigger bob and ripples on a float within DISCOVER_RANGE (fishingWorld.ts).
 * - The run hint: the first run on this device shows a short "let go" card (RUN_HINT_KEY, a DEVICE key).
 *
 * Pure helpers on top, a tiny browser binding below (no timers, no frame work: one cached boolean).
 */
import {FISH_SPOTS,type FishSpot} from './fishSpots';
import {fishById} from './fishCatalog';

export const FIRST_CATCH_KEY='fi2-fish-first-catch-v1';
export const RUN_HINT_KEY='fi2-fish-run-hint-v1';
export const GO_FISHING_EVENT='fi2-go-fishing';
/** Metres from a float where a never-fished player sees the discovery ripples. */
export const DISCOVER_RANGE=8;
const FISHBOOK_KEY='fi2-fishbook-v1';

/** Shore spots a "Go fishing" can land at: every post on land or a pier (never a moored boat: it needs its deck built). */
export const GO_FISHING_SPOTS=FISH_SPOTS.filter(s=>!s.boat);
/** The nearest shore spot to (x, z). */
export function nearestFishingSpot(x:number,z:number,spots:readonly FishSpot[]=GO_FISHING_SPOTS):FishSpot{
 let best=spots[0],d=Infinity;for(const s of spots){const e=Math.hypot(s.x-x,s.z-z);if(e<d){d=e;best=s;}}return best;
}
/**
 * Where a Go fishing lands: the nearest of `spotIds` when it names shore spots (the Welcome back note's "Fish of the day" /
 * "weekly visitor" travel to THAT fish's spot, even across the island, e.g. Palm Point on Summit Isle), else the nearest spot.
 */
export function goFishingTarget(x:number,z:number,spotIds?:readonly string[]|null):FishSpot{
 const named=spotIds?.length?GO_FISHING_SPOTS.filter(s=>spotIds.includes(s.id)):[];
 return nearestFishingSpot(x,z,named.length?named:GO_FISHING_SPOTS);
}
export type GoFishingDetail={spots?:readonly string[]};
/** The guaranteed first catch at a spot: its highest-weighted common species (ties: catalogue order). Deterministic. */
export function firstCatchFish(spot:Pick<FishSpot,'weights'>):string|null{
 let best:string|null=null,w=-1;for(const [id,v] of Object.entries(spot.weights)){if(fishById(id)?.rarity!=='common'||!(v>0))continue;if(v>w){w=v;best=id;}}return best;
}
/** A first catch is still owed: this device never landed one and the Fishbook (synced) has no species. */
export const firstCatchOwed=(deviceDone:boolean,bookSpecies:number)=>!deviceDone&&bookSpecies<=0;

// ---- Browser binding ----
let cached:boolean|null=null;
const ls=(k:string)=>{try{return localStorage.getItem(k);}catch{return null;}};
function bookSpecies():number{try{const b=JSON.parse(ls(FISHBOOK_KEY)??'null') as {species?:Record<string,unknown>}|null;return b&&b.species&&typeof b.species==='object'?Object.keys(b.species).length:0;}catch{return 0;}}
/** True while this device has never landed a fish (cached; cleared by `markFirstCatch`). */
export function isNewAngler():boolean{if(cached===null){cached=typeof window!=='undefined'&&firstCatchOwed(ls(FIRST_CATCH_KEY)==='1',bookSpecies());}return cached;}
/** The first fish landed on this device: remember it. Returns true only the first time. */
export function markFirstCatch():boolean{const first=ls(FIRST_CATCH_KEY)!=='1';try{localStorage.setItem(FIRST_CATCH_KEY,'1');}catch{/* private mode */}cached=false;return first;}
/** The run hint is shown once per device. */
export const runHintSeen=()=>ls(RUN_HINT_KEY)==='1';
export function markRunHint(){try{localStorage.setItem(RUN_HINT_KEY,'1');}catch{/* private mode */}}

/** Ask the island to take the player fishing (Town.tsx listens): the nearest spot, or the nearest of `spots` (goFishingTarget). */
export function requestGoFishing(spots?:readonly string[]){try{window.dispatchEvent(new CustomEvent<GoFishingDetail>(GO_FISHING_EVENT,{detail:spots?.length?{spots}:{}}));}catch{/* no window */}}
