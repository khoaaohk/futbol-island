import type {FishId,FishRarity,FishSpot} from './fishCatalog';
import {fishById} from './fishCatalog';

/**
 * Hotspot odds (Oct 14 2026, user: "update the fishing to be able to cast in certain spots to try and catch bigger fish").
 * Internal only, NEVER shown (like RARITY_WEIGHT). A cast that lands on a hotspot (fishingAim.ts: a drop-off, ripples,
 * diving birds, a reef edge, a passing shadow, a bait ball) multiplies the rarer weights by up to HOTSPOT_BOOST; on top of a
 * spot's own `rarityBoost` (the deep-sea boats) the combined multiplier never passes BOOST_CAP, so boat + hotspot stack
 * sensibly instead of compounding. docs/economy.md has the coins-a-minute check (tests/economy.cjs).
 */
export const HOTSPOT_BOOST:Record<FishRarity,number>={common:1,uncommon:1.25,rare:1.75,legendary:1.75};
/** The most any rarity's weight can be multiplied by, spot boost × hotspot boost together. */
export const BOOST_CAP=2;
/** The multiplier a hotspot adds at strength `hot` (0..1) at this spot, after the cap. */
export function hotFactor(spot:Pick<FishSpot,'rarityBoost'>,rarity:FishRarity,hot:number){
 const h=Math.max(0,Math.min(1,hot)),base=spot.rarityBoost?.[rarity]??1,want=base*(1+(HOTSPOT_BOOST[rarity]-1)*h);
 return Math.max(base,Math.min(BOOST_CAP,want))/base;
}
/** The spot's weights for a cast on a hotspot (a fresh object, once per bite: no per-frame work). */
export function catchWeights(spot:FishSpot,hot:number):Record<FishId,number>{
 if(!(hot>0))return spot.weights;
 const out:Record<FishId,number>={};
 for(const [id,w] of Object.entries(spot.weights)){const f=fishById(id);out[id]=w*(f?hotFactor(spot,f.rarity,hot):1);}
 return out;
}
