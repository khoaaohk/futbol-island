/**
 * The holo foil a card wears in the game (live since Oct 8 2026, docs/performance-guide.md "Holo foil on the live cards"): the
 * pattern from the card's position (lib/graphics/holoFoil/patterns.ts), the strength from its value tier, and the user's
 * per-pattern intensity. One frozen object per card, so memoised cards (the binder's pockets) keep their props equal.
 * Reads the tier data directly (cardTiers.json + tierFromDemand) instead of lib/town/cardTiers.ts, so the vending and market
 * reveals don't pull in the paths progress code.
 */
import tiers from './cardTiers.json';
import {tierFromDemand} from './cardRewards';
import {CARD_ENTRIES,COACH_ROLE,isCoachCard} from './cardCollection';
import {PATTERN_INTENSITY,patternForRole,type HoloPattern,type HoloTier} from '@/lib/graphics/holoFoil/patterns';

export type CardFoil={readonly pattern:HoloPattern;readonly tier:HoloTier;readonly intensity:number};
type TierData={thresholds:{icon:number;elite:number};overrides:Record<string,string>;cards:Record<string,{demand:number}>};
const T=tiers as TierData;
const ROLE=new Map(CARD_ENTRIES.map(e=>[e.name,e.role]));
const cache=new Map<string,CardFoil>();
export function cardFoil(name:string):CardFoil{
 let foil=cache.get(name);if(foil)return foil;
 const pattern=patternForRole(isCoachCard(name)?COACH_ROLE:ROLE.get(name));
 foil=Object.freeze({pattern,tier:tierFromDemand(T.cards[name]?.demand,T.thresholds,T.overrides[name]),intensity:PATTERN_INTENSITY[pattern]});
 cache.set(name,foil);return foil;
}
/** Which tiers wear the CSS foil on small cards (binder pockets, vending and market reveals): Elite and Icon. With all tiers a
 *  full phone binder spread painted noticeably more on page turns (Paint +28 %, Layerize +48 %, Commit +94 %; docs/performance-guide.md
 *  "Holo foil on the live cards", Oct 8 2026), so Regular cards keep the plain mini card; they still get the foil on the big card. */
export const MINI_FOIL_TIERS:ReadonlySet<HoloTier>=new Set<HoloTier>(['elite','icon']);
export const miniFoil=(name:string):CardFoil|null=>{const foil=cardFoil(name);return MINI_FOIL_TIERS.has(foil.tier)?foil:null;};
