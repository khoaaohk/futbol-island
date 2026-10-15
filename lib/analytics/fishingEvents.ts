/**
 * Fishing analytics call sites (Oct 15 2026, with the spin reel): one map increment in the tracker (lib/analytics/tracker.ts
 * count) at the moment an event already happens, like shopEvents.ts / summitEvents.ts: no state, no re-render, no timer, no
 * request, nothing per frame. Off (dev, DNT/GPC, bots, preview, labs, admin, localhost): every call is a no-op.
 *
 * Everything but the lure and the Fishbook button rides the fishing session's Event API (lib/town/fishing/fishingSession.ts,
 * docs/fishing.md "Event API"): `wireFishingAnalytics` listens once per page (kept across hot updates) for hook / catch / escape.
 * Ids: lib/analytics/countIds.ts FISHING_COUNT_EVENTS. Shown in /admin by app/admin/FishingSection.tsx.
 *
 * Privacy: totals only. Which lure (one of four fixed football techniques), landed / escaped / missed, a slip
 * count bucket, runs stopped vs spun through, an average-spin-rate bucket. Never which fish, which spot, a size, a time or a
 * position.
 */
import {count} from './tracker';
import {FISHING_LURE_IDS} from './countIds';
import type {FishingEvent} from '../town/fishing/fishingSession';
import type {FightStats} from '../town/fishing/fishingFight';

/** A lure put on the line (by id), or taken off (`null`). */
export function countLureChosen(id:string|null){
 count(id&&(FISHING_LURE_IDS as readonly string[]).includes(id)?`fi:lure_${id}`:'fi:lure_none');
}
/** The Fishbook opened from the fishing HUD's (bottom-left) button. */
export const countFishbookOpen=()=>count('fi:book');

/** Slip buckets: 0 / 1 / 2 / 3+ per spin fight. */
export const slipBucket=(slips:number)=>slips<=0?'fi:slips_0':slips===1?'fi:slips_1':slips===2?'fi:slips_2':'fi:slips_3plus';
/** Average spin rate buckets (0..1 of a full spin, fishingFight.ts FULL_SPIN_S): slow < 0.45, mid < 0.8, full otherwise. */
export const SPIN_SLOW=.45,SPIN_FULL=.8;
export const spinBucket=(avg:number)=>avg<SPIN_SLOW?'fi:spin_slow':avg<SPIN_FULL?'fi:spin_mid':'fi:spin_full';
/** One finished spin fight (landed or escaped): its slip bucket, its runs by outcome, its spin-rate bucket (only if it spun at all). */
export function countFightStats(f:FightStats){
 count(slipBucket(f.slips));
 if(f.runsStopped>0)count('fi:run_stopped',f.runsStopped);
 if(f.runsSpun>0)count('fi:run_spun',f.runsSpun);
 if(f.spinAvg>0)count(spinBucket(f.spinAvg));
}
/** The Event API listener: a hook starts a fight , a catch lands it, an escape after a hook loses it, a bite
 *  missed (too early / too late) before any hook. Pure given the event; `wireFishingAnalytics` binds it to the live session. */
export function onFishingAnalyticsEvent(e:Pick<FishingEvent,'type'|'hooked'|'fight'>){
 if(e.type==='hook')count('fi:hook_spin');
 else if(e.type==='catch'){count('fi:land');if(e.fight)countFightStats(e.fight);}
 else if(e.type==='escape'){if(e.hooked){count('fi:escape');if(e.fight)countFightStats(e.fight);}else count('fi:miss');}
}
type Hot={off?:()=>void};
const hot:Hot=typeof globalThis==='undefined'?{}:((globalThis as {__fi2FishingAnalytics?:Hot}).__fi2FishingAnalytics??={});
/** Subscribe once per page (a hot update re-subscribes with the newest code). Returns the unsubscribe. */
export function wireFishingAnalytics(session:{onFishingEvent(fn:(e:FishingEvent)=>void):()=>void}){
 hot.off?.();hot.off=session.onFishingEvent(onFishingAnalyticsEvent);return hot.off;
}
