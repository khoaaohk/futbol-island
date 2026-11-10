/**
 * Gashapon analytics call sites (owner, Nov 8 2026): one map increment in the tracker (lib/analytics/tracker.ts `count`) at the
 * moment the thing happens, like fishingEvents.ts: no state beyond a per-open throttle, no re-render, no timer, no request.
 * Off (dev, DNT/GPC, bots, preview, labs, admin, localhost): every call is a no-op inside `count`.
 * Ids: lib/analytics/countIds.ts GASHAPON_COUNT_IDS (gs:*). Generic key/value counters: no new table or migration.
 *
 * Privacy (a kids' game): totals only. Which machine and toy (fixed catalogue ids), the rarity word, new vs repeat, the coins a
 * spin cost and refunded as sums (never a balance), where the viewer opened from, squeeze / poke / tap totals (≤ 3 of each kind
 * per viewer open), and a found-count band when the shelf opens. Never a player, a time, a position or an order of events.
 *
 *   gashapon_spin          → gs:spin, gs:spin_<machine>, gs:t_<toy>, gs:r_<rarity>, gs:new | gs:dup, gs:coins (+cost), gs:refund (+refund)
 *   gashapon_toy_viewed    → gs:view_result | gs:view_shelf, gs:v_<toy>
 *   gashapon_toy_interact  → gs:squeeze | gs:poke | gs:tap, gs:i_<toy> once per open   (throttled: `createInteractCounter`, 3 per kind per open)
 *                            gs:act_<kind> (round 3C, Nov 9 2026): a kind's own interaction (puzzle, windup, spintop, bobble, capsule,
 *                            mechanism, charm, figure), same throttle
 *   gashapon_shelf_open    → gs:shelf, gs:found_<band>
 */
import {count} from './tracker';
import {gsKey,GASHAPON_ACT_KINDS} from './countIds';

export function countGashaponSpin(e:{machine:string;toy:string;rarity:string;isNew:boolean;refund:number;coins:number}){
 count('gs:spin');count('gs:spin_'+gsKey(e.machine));count('gs:t_'+gsKey(e.toy));count('gs:r_'+e.rarity);count(e.isNew?'gs:new':'gs:dup');
 const coins=Math.floor(Number(e.coins)||0),refund=Math.floor(Number(e.refund)||0);if(coins>0)count('gs:coins',coins);if(refund>0)count('gs:refund',refund);
}
export function countToyViewed(toy:string,source:'result'|'shelf'){count(source==='shelf'?'gs:view_shelf':'gs:view_result');count('gs:v_'+gsKey(toy));}
/** One per viewer open: at most `cap` counts of each kind (so a child poking 200 times is still 3). */
export type InteractKind='squeeze'|'poke'|'tap'|`act_${(typeof GASHAPON_ACT_KINDS)[number][0]}`;
export function createInteractCounter(toy:string,cap=3){
 const n=new Map<string,number>();
 let any=false;
 // gs:i_<toy>: once per open, on the first touch of any kind (opens in which the toy was played with).
 return (kind:InteractKind)=>{if(kind.startsWith('act_')&&!GASHAPON_ACT_KINDS.some(([k])=>'act_'+k===kind))return false;const c=n.get(kind)??0;if(c>=cap)return false;n.set(kind,c+1);count('gs:'+kind);if(!any){any=true;count('gs:i_'+gsKey(toy));}return true;};
}
export const foundBand=(found:number)=>found<=0?'found_0':found<=5?'found_1_5':found<=20?'found_6_20':found<=50?'found_21_50':found<84?'found_51_83':'found_all';
export function countShelfOpen(found:number){count('gs:shelf');count('gs:'+foundBand(found));}
