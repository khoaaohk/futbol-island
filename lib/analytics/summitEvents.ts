/**
 * Summit Isle and Sandbar analytics call sites (Oct 15 2026): one line at the moment an event already happens, like
 * learnEvents.ts / shopEvents.ts. Each is a map increment in the tracker (lib/analytics/tracker.ts count) and nothing else:
 * no state, no re-render, no timer, no request. Off (dev, DNT/GPC, bots, preview, labs, admin, localhost): a no-op.
 *
 * This file imports the island's geometry (lib/town/summitIsle.ts), so — like islandPlaces.ts — it must only be loaded with
 * the island itself, never from the every-page tracker bundle (tests/admin-analytics-places.cjs checks that tracker.ts,
 * islandIds.ts and core.ts stay geometry-free; this file is a sibling, not an import of theirs).
 *
 * Privacy: totals only. Fruit kind and shake method, which of the four summit fishing spots, which travel mode — never a
 * position, a time, or anything that could rebuild a route.
 */
import {count} from './tracker';
import {onSummitIsle,onSummitSandbar} from '../town/summitIsle';
import type {FruitKind} from '../town/summitForage';

export const countKickPlay=()=>count('su:kick_play');
/** A zipline ride from Summit Isle to the Coral Cay Hostel roof (lib/graphics/zipline.ts, Oct 14 2026). */
export const countZiplineRide=()=>count('su:zipline_ride');
/** The Summit Isle painting easel (lib/graphics/paintEasel.ts, components/PaintEasel.tsx): sat down to paint, and a painting saved.
 *  Totals only; the paintings themselves never leave the device. */
export const countEaselOpen=()=>count('su:easel_open');
export const countEaselSave=()=>count('su:easel_save');
/** The Summit Isle Ball Cannon (lib/graphics/ballCannon.ts, Oct 14 2026): sitting down, and a clay disc knocked out. Totals only. */
export const countCannonSit=()=>count('su:cannon_sit');
export const countCannonHit=()=>count('su:cannon_hit');
/** A Summit Isle hidden ball collected (lib/graphics/coinHunt.ts, Oct 15 2026): which one is never sent. */
export const countSummitBall=()=>count('su:ball_find');
/** A kicked ball dropping fruit vs the player shaking the tree by hand (lib/graphics/fruitTrees.ts drop() call sites). */
export const countFruitShake=(kind:FruitKind,method:'hand'|'ball')=>count(`su:fruit_${kind}:${method}`);
const FISH_SPOT_EVENT:Record<string,string>={'summit-cove':'su:fish_cove','summit-palm':'su:fish_palm','summit-lookout':'su:fish_look','summit-ledge':'su:fish_ledge'};
/** A fish landed at one of Summit Isle's four spots (fishCatalog.ts ids; Drop-off Ledge since Oct 14 2026); other spots are left out. */
export function countSummitFishCatch(spotId:string|null|undefined){
 const id=spotId&&FISH_SPOT_EVENT[spotId];if(id)count(id);
}
export function countKioskPurchase(price:number){
 count('su:kiosk_buy');
 if(Number.isFinite(price)&&price>0)count('su:kiosk_coin',Math.max(1,Math.round(price)));
}

/**
 * Sandbar crossings and how players arrive on Summit Isle (walking/riding the Sandbar vs jetpack/parachute): a tiny state
 * machine called from the island's existing per-frame block (components/Town.tsx, right beside islandFrame()), throttled to
 * once a second of its own (never per frame): onSummitSandbar/onSummitIsle box-reject first, so the cost off the island is a
 * few comparisons a second. Counts only the moment of arrival (false → true), never a position or a route.
 */
export function createSummitTravelTracker(){
 let onBar=false,onIsle=false,acc=0;
 return {
  sample(x:number,z:number,flying:boolean,dt:number){
   acc+=dt;if(acc<1)return;acc=0;
   const bar=onSummitSandbar(x,z);if(bar&&!onBar)count('sb:cross');onBar=bar;
   const isle=onSummitIsle(x,z);if(isle&&!onIsle)count(flying?'su:arrive_fly':'su:arrive_walk');onIsle=isle;
  },
  reset(){onBar=false;onIsle=false;acc=0;},
 };
}
