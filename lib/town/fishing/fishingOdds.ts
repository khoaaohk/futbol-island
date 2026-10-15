import type {FishId,FishRarity,FishSpecies,FishSpot} from './fishCatalog';
import {FISH,FISH_SPOTS,fishById} from './fishCatalog';
import {fishSellValue} from '../../economy';
import {applyTimeSwaps,timeSwaps,type TimeOfDayKey} from './nightFish';
import {WEATHER_FAVORS,type Weather} from './weather';
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

// ---- Oct 15 2026 content systems (docs/fishing-research.md B3, C1, C3, C4): what else shapes a cast's catch ----
/**
 * The catch context: the island's time of day (B3 night fish), the day's weather (C4), the lure on the line (C3) and the spots
 * whose legend's clue was found and which is not caught yet (C1). The browser store (fishingLog.ts) registers a source; pure
 * code and tests pass one explicitly. The neutral context (day, clear, no lure, no legends) leaves every table exactly as it is.
 * In the game the live roll goes through Agent A's `fishingSession.setCatchRoll` (fishingLogStore.ts liveCatchRoll), which passes
 * the live context explicitly; no global source is registered, so fishingCore.rollCatch and every sim keep the neutral tables.
 */
export type CatchContext={time:TimeOfDayKey;weather:Weather;lure:LureId|null;legends:readonly string[]};
export const NEUTRAL_CONTEXT:CatchContext=Object.freeze({time:'day',weather:'clear',lure:null,legends:Object.freeze([])}) as CatchContext;
let source:(()=>CatchContext)|null=null;
/** The browser store registers where the live context comes from (read once per bite, never per frame). */
export function setCatchContextSource(fn:(()=>CatchContext)|null){source=fn;}
export function catchContext():CatchContext{try{return source?.()??NEUTRAL_CONTEXT;}catch{return NEUTRAL_CONTEXT;}}
const isNeutral=(c:CatchContext)=>c.time==='day'&&c.weather==='clear'&&!c.lure&&!c.legends.length;

/** How strongly a lure or the weather pulls its favoured kinds (inside each rarity), before the value guard. */
export const FAMILY_BOOST={lure:2.2,weather:1.6} as const;
/** The most a family mix may move a spot's mean catch value (catalogue price and Rosa's sell value), either way. */
export const FAMILY_EV_GUARD=.025;
const evOf=(w:Record<string,number>,value:(f:FishSpecies)=>number)=>{let t=0,v=0;for(const [id,x] of Object.entries(w)){const f=fishById(id);if(!f||!(x>0))continue;t+=x;v+=x*value(f);}return t?v/t:0;};
export const meanPrice=(w:Record<string,number>)=>evOf(w,f=>f.price);
export const meanSellValue=(w:Record<string,number>)=>evOf(w,f=>fishSellValue(f));
/**
 * Family mix (lures and weather): inside EACH rarity, multiply the favoured kinds by `k` and scale that rarity's other kinds down
 * so the rarity's total weight is unchanged. Rarity shares never move (so BOOST_CAP is untouched). `k` is then lowered, if it has
 * to be, until the mean catch value (price and sell value) is within FAMILY_EV_GUARD of the table it started from. Pure; a fresh
 * object; a rarity with no favoured kind (or only favoured kinds) is left as it is.
 */
export function familyMix(w:Record<string,number>,favors:(f:FishSpecies)=>boolean,k:number):Record<string,number>{
 return familyMixes(w,[{favors,k}]);
}
/** Several family mixes at once (the weather, then the lure), guarded TOGETHER against the starting table, so a weather and a lure
 *  never stack past the guard: when they would, both pulls are eased back by the same fraction. */
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
/** True while a legend is in this spot's water for this context (found, not caught yet). */
export const legendSwims=(spot:Pick<FishSpot,'id'>,ctx:CatchContext)=>ctx.legends.includes(spot.id)&&!!legendForSpot(spot.id);

/** The spot's weights for a cast (a fresh object, once per bite: no per-frame work). `hot`: on a hotspot (0..1). `ctx`: time,
 *  weather, lure and legends (defaults to the live context; the neutral one returns the spot's own table untouched). */
export function catchWeights(spot:FishSpot,hot:number,ctx:CatchContext=catchContext()):Record<FishId,number>{
 if(!(hot>0)&&isNeutral(ctx))return spot.weights;
 let out:Record<FishId,number>=spot.weights;
 if(hot>0){out={};for(const [id,w] of Object.entries(spot.weights)){const f=fishById(id);out[id]=w*(f?hotFactor(spot,f.rarity,hot):1);}}
 const before=out;
 // B3: night / sunset fish take the place of a resting day fish of their rarity (never on the deep-sea boats).
 if(ctx.time!=='day'&&!spot.deep)out=applyTimeSwaps(out,timeSwaps(spot.id,ctx.time,spot.weights,FISH,fishById));
 // C4 then C3: the family mix (never rarity, value-guarded).
 const wf=WEATHER_FAVORS[ctx.weather],lure=ctx.lure?lureById(ctx.lure):undefined,mixes=[];
 if(wf)mixes.push({favors:wf,k:FAMILY_BOOST.weather});if(lure)mixes.push({favors:lure.favors,k:FAMILY_BOOST.lure});
 if(mixes.length)out=familyMixes(out,mixes,before);
 // C1: a found legend joins at a small fixed weight (worth 0 coins: never sold, so it can only lower the mean value).
 if(legendSwims(spot,ctx)){const L=legendForSpot(spot.id)!;out=out===spot.weights?{...out}:out;out[L.id]=LEGEND_WEIGHT*(1+.5*Math.max(0,Math.min(1,hot)));}
 return out;
}
/** Where a time species actually comes, at its time (Fishbook "Found at"): every spot where it has a day fish to stand in for. */
export function timeSpotsFor(id:string):string[]{
 const f=fishById(id);if(!f)return [];const time=(f.when??'night') as TimeOfDayKey;
 return FISH_SPOTS.filter(s=>!s.deep).filter(s=>timeSwaps(s.id,time,s.weights,FISH,fishById).some(x=>x.add===id)).map(s=>s.id);
}
