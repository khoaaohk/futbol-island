import type {FishId,FishRarity,FishSpecies,FishSpot} from './fishCatalog';
import {FISH,FISH_SPOTS,fishById} from './fishCatalog';
import {fishSellValue} from '../../economy';
import {applyTimeSwaps,timeSwaps,type TimeOfDayKey} from './nightFish';
import {lureById,type LureId} from './lures';
import {LEGEND_WEIGHT,legendForSpot} from './legendary';

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

// ---- Oct 15 2026 content systems (docs/fishing-research.md B3, C1, C3): what else shapes a cast's catch ----
/**
 * The catch context: the island's time of day (B3 night fish), the lure on the line (C3) and the spots whose legend's clue was
 * found and which is not caught yet (C1). (The weather was removed on 15 Oct 2026: user decision.) The browser store
 * (fishingLogStore.ts) passes the live context; pure code and tests pass one explicitly. The neutral context (day, no lure, no
 * legends) leaves every table exactly as it is.
 * In the game the live roll goes through Agent A's `fishingSession.setCatchRoll` (fishingLogStore.ts liveCatchRoll), which passes
 * the live context explicitly; no global source is registered, so fishingCore.rollCatch and every sim keep the neutral tables.
 */
export type CatchContext={time:TimeOfDayKey;lure:LureId|null;legends:readonly string[];
 /** Nov 6 2026 bad-luck protection (PITY below): casts at THIS spot without each still-uncaught legendary species, by id. The store
  *  passes only species this player has never caught (fishingLogStore.ts liveContext); absent or empty = no pity. */
 pity?:Readonly<Record<string,number>>;
 /** Nov 6 2026 (wave 3): the legends this player already caught and released, so a spot with two legends sends the next one. */
 legendsCaught?:Readonly<Record<string,number>>};
export const NEUTRAL_CONTEXT:CatchContext=Object.freeze({time:'day',lure:null,legends:Object.freeze([])}) as CatchContext;
let source:(()=>CatchContext)|null=null;
/** The browser store registers where the live context comes from (read once per bite, never per frame). */
export function setCatchContextSource(fn:(()=>CatchContext)|null){source=fn;}
export function catchContext():CatchContext{try{return source?.()??NEUTRAL_CONTEXT;}catch{return NEUTRAL_CONTEXT;}}
const hasPity=(c:CatchContext)=>!!c.pity&&Object.values(c.pity).some(n=>n>0);
const isNeutral=(c:CatchContext)=>c.time==='day'&&!c.lure&&!c.legends.length&&!hasPity(c);

/** How strongly a lure pulls its favoured kinds (inside each rarity), before the value guard. */
export const FAMILY_BOOST={lure:2.2} as const;
/** The most a family mix may move a spot's mean catch value (catalogue price and Rosa's sell value), either way. */
export const FAMILY_EV_GUARD=.025;
const evOf=(w:Record<string,number>,value:(f:FishSpecies)=>number)=>{let t=0,v=0;for(const [id,x] of Object.entries(w)){const f=fishById(id);if(!f||!(x>0))continue;t+=x;v+=x*value(f);}return t?v/t:0;};
export const meanPrice=(w:Record<string,number>)=>evOf(w,f=>f.price);
export const meanSellValue=(w:Record<string,number>)=>evOf(w,f=>fishSellValue(f));
/**
 * Family mix (the lures): inside EACH rarity, multiply the favoured kinds by `k` and scale that rarity's other kinds down
 * so the rarity's total weight is unchanged. Rarity shares never move (so BOOST_CAP is untouched). `k` is then lowered, if it has
 * to be, until the mean catch value (price and sell value) is within FAMILY_EV_GUARD of the table it started from. Pure; a fresh
 * object; a rarity with no favoured kind (or only favoured kinds) is left as it is.
 */
export function familyMix(w:Record<string,number>,favors:(f:FishSpecies)=>boolean,k:number):Record<string,number>{
 return familyMixes(w,[{favors,k}]);
}
/** Several family mixes at once, guarded TOGETHER against the starting table (`ref`), so the pulls never stack past the guard:
 *  when they would, every pull is eased back by the same fraction. (One mix today, the lure; kept general.) */
export function familyMixes(w:Record<string,number>,mixes:readonly {favors:(f:FishSpecies)=>boolean;k:number}[],ref:Record<string,number>=w):Record<string,number>{
 if(!mixes.length)return w;
 const one=(src:Record<string,number>,favors:(f:FishSpecies)=>boolean,kk:number)=>{
  const tiers=new Map<FishRarity,{fav:string[];other:string[];total:number;favW:number}>();
  for(const [id,x] of Object.entries(src)){const f=fishById(id);if(!f||!(x>0))continue;let t=tiers.get(f.rarity);if(!t)tiers.set(f.rarity,t={fav:[],other:[],total:0,favW:0});
   t.total+=x;if(favors(f)){t.fav.push(id);t.favW+=x;}else t.other.push(id);}
  const out={...src};
  for(const t of tiers.values()){if(!t.fav.length||!t.other.length)continue;
   // the favoured share grows by kk (never the whole rarity); the rest shrink so the rarity's total is unchanged
   const favShare=Math.min(.9,t.favW*kk/t.total),fs=favShare*t.total/t.favW,os=(1-favShare)*t.total/(t.total-t.favW);
   for(const id of t.fav)out[id]=src[id]*fs;for(const id of t.other)out[id]=src[id]*os;}
  return out;};
 const at=(s:number)=>mixes.reduce((acc,m)=>one(acc,m.favors,1+(m.k-1)*s),w);
 const p0=meanPrice(ref),s0=meanSellValue(ref),ok=(o:Record<string,number>)=>Math.abs(meanPrice(o)-p0)<=p0*FAMILY_EV_GUARD&&Math.abs(meanSellValue(o)-s0)<=s0*FAMILY_EV_GUARD;
 const full=at(1);if(ok(full))return full;
 let lo=0,hi=1;for(let i=0;i<14;i++){const m=(lo+hi)/2;if(ok(at(m)))lo=m;else hi=m;}
 return lo>.001&&ok(at(lo))?at(lo):{...w};
}
/**
 * Legendary bad-luck protection (Nov 6 2026, fishing audit item 6). Before this a still-uncaught special such as the Great White
 * (0.33 % a cast at Harbour Wall) took about 300 casts, 2+ hours at one spot, with no help at all. Now each cast at a spot WITHOUT a
 * legendary species this player has never caught adds PITY.rate to that species' weight multiplier there, up to PITY.cap (3×, reached
 * after ~330 casts); catching it clears the count, and once a species is in the Fishbook it never gets pity again. Internal only:
 * no numbers or bars are ever shown to kids.
 *  - Long-run value: pity exists only before a species' FIRST catch, so every table is exactly as before once it is caught; the
 *    most it can ever add is that one catch arriving sooner (one legendary in place of one common, once per species).
 *  - Per cast it is also value-guarded: eased back until the spot's mean catch (catalogue price and sell value) is at most
 *    PITY.evGuard above the table before the time swaps and the lure (the same reference the lure guard uses), so night fish,
 *    a lure and pity together stay inside the ±3 % guard of tests/economy.cjs §12.
 *  - Sharks stay hard: every legendary gets the same ramp, so the sharks keep their (lowest) place; they still take 150+ casts
 *    on average (tests/fishing-sell-pity.cjs simulates it).
 */
export const PITY={rate:.006,cap:3,evGuard:.029,maxCount:400} as const;
export const pityMultiplier=(n:number)=>Math.min(PITY.cap,1+PITY.rate*Math.max(0,Math.min(PITY.maxCount,n||0)));
/** The species at this spot that can gain pity: its legendary-rarity animals. */
export const pitySpecies=(spot:Pick<FishSpot,'weights'>)=>Object.keys(spot.weights).filter(id=>fishById(id)?.rarity==='legendary');
/** Apply pity (counts by id) to a table, value-guarded against `ref`. Pure; a fresh object (or `w` itself when nothing applies). */
export function applyPity(w:Record<string,number>,pity:Readonly<Record<string,number>>,ref:Record<string,number>=w):Record<string,number>{
 const ids=Object.keys(pity).filter(id=>pity[id]>0&&w[id]>0&&fishById(id)?.rarity==='legendary');if(!ids.length)return w;
 const at=(s:number)=>{const o={...w};for(const id of ids)o[id]=w[id]*(1+(pityMultiplier(pity[id])-1)*s);return o;};
 const p0=meanPrice(ref),v0=meanSellValue(ref),ok=(o:Record<string,number>)=>meanPrice(o)-p0<=p0*PITY.evGuard&&meanSellValue(o)-v0<=v0*PITY.evGuard;
 const full=at(1);if(ok(full))return full;if(!ok(w))return w;
 let lo=0,hi=1;for(let i=0;i<14;i++){const m=(lo+hi)/2;if(ok(at(m)))lo=m;else hi=m;}
 return lo>.001?at(lo):w;
}
/** True while a legend is in this spot's water for this context (found, not caught yet). */
export const legendSwims=(spot:Pick<FishSpot,'id'>,ctx:CatchContext)=>ctx.legends.includes(spot.id)&&!!legendForSpot(spot.id,ctx.legendsCaught);

/** The spot's weights for a cast (a fresh object, once per bite: no per-frame work). `hot`: on a hotspot (0..1). `ctx`: time,
 *  lure and legends (defaults to the live context; the neutral one returns the spot's own table untouched). */
export function catchWeights(spot:FishSpot,hot:number,ctx:CatchContext=catchContext()):Record<FishId,number>{
 if(!(hot>0)&&isNeutral(ctx))return spot.weights;
 let out:Record<FishId,number>=spot.weights;
 if(hot>0){out={};for(const [id,w] of Object.entries(spot.weights)){const f=fishById(id);out[id]=w*(f?hotFactor(spot,f.rarity,hot):1);}}
 const before=out;
 // B3: night / sunset fish take the place of a resting day fish of their rarity (never on the deep-sea boats).
 if(ctx.time!=='day'&&!spot.deep)out=applyTimeSwaps(out,timeSwaps(spot.id,ctx.time,spot.weights,FISH,fishById));
 // C3: the lure's family mix (never rarity, value-guarded against the table before the time swaps).
 const lure=ctx.lure?lureById(ctx.lure):undefined;
 if(lure)out=familyMixes(out,[{favors:lure.favors,k:FAMILY_BOOST.lure}],before);
 // Nov 6 2026: bad-luck protection for still-uncaught legendaries (value-guarded against the same reference).
 if(ctx.pity)out=applyPity(out,ctx.pity,before);
 // C1: a found legend joins at a small fixed weight (worth 0 coins: never sold, so it can only lower the mean value).
 if(legendSwims(spot,ctx)){const L=legendForSpot(spot.id,ctx.legendsCaught)!;out=out===spot.weights?{...out}:out;out[L.id]=LEGEND_WEIGHT*(1+.5*Math.max(0,Math.min(1,hot)));}
 return out;
}
/** Where a time species actually comes, at its time (Fishbook "Found at"): every spot where it has a day fish to stand in for. */
export function timeSpotsFor(id:string):string[]{
 const f=fishById(id);if(!f)return [];const time=(f.when??'night') as TimeOfDayKey;
 return FISH_SPOTS.filter(s=>!s.deep).filter(s=>timeSwaps(s.id,time,s.weights,FISH,fishById).some(x=>x.add===id)).map(s=>s.id);
}
