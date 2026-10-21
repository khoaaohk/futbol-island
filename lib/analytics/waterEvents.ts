/**
 * Water analytics call sites (Oct 15 2026; wading, swimming, splash-downs: lib/town/water, docs/swimming-research.md "P0
 * implemented"): one line at the moment an event already happens, like summitEvents.ts / shopEvents.ts. Each is a map
 * increment in the tracker (lib/analytics/tracker.ts count) and nothing else: no state, no re-render, no timer, no request.
 * Off (dev, DNT/GPC, bots, preview, labs, admin, localhost): a no-op. Ids: lib/analytics/countIds.ts WATER_COUNT_EVENTS.
 *
 * Privacy: totals only. Where a splash-down came from (a fall, a roof, a ride launch, the jetpack) and how long a swim lasted
 * (a bucket), never a position, a beach or a route. The two "first time" ids are per device (one localStorage flag) so the
 * dashboard can tell how many devices ever tried the water from how often it is used.
 */
import {count} from './tracker';
import {swimTimeBucket,type SplashSource} from '../town/water/waterState';

const FIRSTS_KEY='fi2-water-firsts-v1';
/** Which firsts this device has already sent ('w' wade, 's' swim); read once per island, written on the first of each. */
let firsts:string|null=null;
const readFirsts=()=>{if(firsts===null){try{firsts=localStorage.getItem(FIRSTS_KEY)??'';}catch{firsts='';}}return firsts;};
const markFirst=(flag:'w'|'s')=>{const f=readFirsts();if(f.includes(flag))return false;firsts=f+flag;try{localStorage.setItem(FIRSTS_KEY,firsts);}catch{}return true;};

/** The feet went into the sea: the first time on this device counts once. */
export function countWade(){if(markFirst('w'))count('wa:first_wade');}
/** A swim started (wading in past the waist, or surfacing after a splash-down). */
export function countSwimStart(){count('wa:swim_start');if(markFirst('s'))count('wa:first_swim');}
export const countSplashDown=(source:SplashSource)=>count(`wa:splash_${source}`);
export const countBackToShore=()=>count('wa:shore');
export const countSwimFast=()=>count('wa:fast');
/** Retired Oct 19 2026 (Float became Dive): kept so the history's 'wa:float' id still has its writer and label. */
export const countFloat=()=>count('wa:float');
/** Dive (Oct 19 2026, replaces Float): one per dive under. */
export const countDive=()=>count('wa:dive');
/** A swim ended after `seconds` in the water: one of the five time buckets (waterState.ts swimTimeBucket). */
export const countSwimTime=(seconds:number)=>{if(seconds>0)count(`wa:${swimTimeBucket(seconds)}`);};
/** The 20 fps idle cap engaged while treading water or floating (once per rest). */
export const countWaterIdleCap=()=>count('wa:idle_cap');
export const countSwimLesson=()=>count('wa:lesson');
/** Sharks started circling the swimmer (water P1a, lib/town/water/sharks.ts). */
export const countSharksCircle=()=>count('wa:sharks_circle');
/** The circle ended: the swimmer reached wading depth / took off, or the sharks lost interest (one id; the reason is not kept). */
export const countSharksEscape=()=>count('wa:sharks_escape');
/** Water P1b (lib/town/water/animalRides.ts): grabbed on to a manta / the whale shark; the ride ended by itself after its one
 *  lap; let go early (the Let go button, or the swim ending under it). */
export const countRideStart=(kind:'manta'|'whale')=>count(kind==='manta'?'wa:ride_manta':'wa:ride_whale');
export const countRideLap=()=>count('wa:ride_lap');
/** Oct 20 2026 (lib/town/seaLifeAreas.ts): a ride on one of the open-sea whale sharks (also counted as wa:ride_whale above), and a
 *  ray spotted (a swimmer within RAY_SPOT_RANGE of an open-sea ray; once per ray per visit). Totals only, never which area. */
export const countOpenSeaWhaleRide=()=>count('wa:ride_open_whale');
export const countRaySpot=()=>count('wa:ray_spot');
export const countRideOff=()=>count('wa:ride_off');
/** Water P2 (lib/town/water/diveSession.ts): a dive began at a spot; it ended (Surface / Escape, or the breath ran out: that one
 *  also counts wa:dive_breath_out); a find was used for the first time (once ever per find per player); the breath lesson showed.
 *  Never the spot's position or which find: totals only. */
export const countDiveStart=()=>count('wa:dive_start');
export const countDiveSurface=()=>count('wa:dive_surface');
export const countDiveFind=()=>count('wa:dive_find');
export const countDiveBreathOut=()=>count('wa:dive_breath_out');
export const countDiveLesson=()=>count('wa:dive_lesson');
/** Dive zones (Oct 20 2026): the deep level reached (once per dive), a jetpack take-off from inside a zone (R / the switcher), a dive
 *  at a wreck zone, and a wreck's cargo find used for the first time. */
/** Retired Oct 20 2026 (the reef is shallow, no deep level): kept so old rows still read; the reef crest reached is counted instead. */
export const countDiveDeep=()=>count('wa:dive_deep');
export const countDiveCrest=()=>count('wa:dive_crest');
export const countDiveFly=()=>count('wa:dive_fly');
export const countDiveWreckVisit=()=>count('wa:dive_wreck_visit');
export const countDiveWreckFind=()=>count('wa:dive_wreck_find');
/** Explore v2 (Oct 21 2026): a dive with a dart (once per dive), a dive with a pickup collected (once per dive), a zone restored (once
 *  ever per zone), a goal with the underwater ball. Totals only, `k` channel: no migration. */
export const countDiveDart=()=>count('wa:dive_dart');
export const countDivePick=()=>count('wa:dive_pick');
export const countDiveRestore=()=>count('wa:dive_restore');
export const countDiveGoal=()=>count('wa:dive_goal');
/** Tests: forget the device flags. */
export function resetWaterFirsts(){firsts=null;try{localStorage.removeItem(FIRSTS_KEY);}catch{}}
