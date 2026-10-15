/**
 * Kit Shop analytics call sites (Oct 15 2026): one line at the moment an event already happens, like learnEvents.ts. Each is
 * a map increment in the tracker (lib/analytics/tracker.ts count) and nothing else: no state, no re-render, no timer, no
 * request. When the tracker is off (dev, DNT/GPC, bots, preview, labs, admin, localhost) every call is a no-op.
 *
 * Privacy: item KIND only (jersey / boots / ball), never a design, a colour, a name or a number. `spend` carries the price
 * (coins), never which item. Ids: lib/analytics/countIds.ts SHOP_COUNT_EVENTS.
 */
import {count} from './tracker';
/** The three studios. Repeated here instead of imported (lib/shop has the real one) so this file never reads anything about
 * what a player bought (tests/shop-room.cjs checks that only lib/shop/*, components/shop/* and the save sync do). */
export type ShopKind='jersey'|'boots'|'ball';

export const countStudioOpen=(kind:ShopKind)=>count(`sh:open_${kind}`);
export const countDesignSave=(kind:ShopKind)=>count(`sh:save_${kind}`);
/**
 * A real purchase (coins charged), not re-picking an already-owned design. `spend`'s count is the price itself: count()
 * accumulates it (capped at 10,000) and the tracker sends it in ≤50-a-beat chunks (tracker.ts takeCounts), so a big price
 * still arrives in full over a few beats; the day's total in the dashboard adds every beat up, so nothing is lost.
 */
export function countPurchase(kind:ShopKind,price:number){
 count(`sh:buy_${kind}`);
 if(Number.isFinite(price)&&price>0)count('sh:spend',Math.max(1,Math.round(price)));
}
export const countMyKitOpen=()=>count('sh:mykit');
