/**
 * Sponsor engagement call sites (Oct 20 2026, docs/admin-sponsor-insights.md): one line where the event already happens, like
 * learnEvents.ts / shopEvents.ts. Each is a map increment in the tracker (lib/analytics/tracker.ts count) and nothing else: no
 * state, no request, no timer (the reading clock below only reads performance.now() at open, hide, show and close). When the
 * tracker is off (dev, DNT/GPC, bots, preview, labs, admin, localhost) every call is a no-op; an id that is not on the
 * allowlist (lib/analytics/countIds.ts ENGAGE_*) is dropped by count().
 *
 * Privacy: fixed buckets only. A design's PATTERN / boot MODEL id (never colours, names, numbers or drawings), how a card was
 * found, its tier and binder number (public footballers), a book's fixed key, a reading visit's length in four buckets.
 */
import {count} from './tracker';

/** An arcade cabinet started (each launch of a game counts once; Summit Kick rounds are su:kick_play). */
export const countArcadeGame=(game:string)=>count('en:game_'+game);
/** A saved Kit Shop design's style (alongside sh:save_jersey / sh:save_boots, which stay the totals). */
export const countJerseyStyle=(pattern:string)=>count('en:jerseyp_'+pattern);
export function countBootStyle(model:string,pattern:string){count('en:bootm_'+model);count('en:bootp_'+pattern);}
/** A card that was NOT already in the binder joined it: how (offer kind, pack, starter kit), its tier, and its binder number. */
export function countCardFound(source:string,tier:string|null,number:number){
 count('en:card_'+source);if(tier)count('en:cardtier_'+tier);
 if(Number.isInteger(number)&&number>=1&&number<=999)count('en:cardn_'+number);
}
export const countFilmOpen=()=>count('en:film_open');
export const countFilmEnd=()=>count('en:film_end');
export const countBookOpen=(book:string)=>count('en:bookopen_'+book);
export const countBookEnd=(book:string)=>count('en:bookend_'+book);
export const countBookBuy=(book:string)=>count('en:bookbuy_'+book);
/** Bucket a reading visit's foreground milliseconds (ENGAGE_READ_BUCKETS). */
export const readBucket=(ms:number)=>ms<60_000?'read_1m':ms<180_000?'read_3m':ms<600_000?'read_10m':'read_long';
/**
 * Start a reading clock for one pop-up book visit; the returned function stops it and counts its bucket once. Only time while
 * the tab is visible counts (the same rule as the dashboard's foreground minutes). Visits under 2 s (an accidental open) are
 * not counted.
 */
export function startReadClock(now:()=>number=()=>performance.now()):()=>void{
 if(typeof document==='undefined')return ()=>{};
 let total=0,since:number|null=document.visibilityState==='visible'?now():null,done=false;
 const vis=()=>{if(document.visibilityState==='visible'){if(since===null)since=now();}else if(since!==null){total+=now()-since;since=null;}};
 document.addEventListener('visibilitychange',vis);
 return ()=>{
  if(done)return;done=true;document.removeEventListener('visibilitychange',vis);
  if(since!==null)total+=now()-since;
  if(total>=2000)count('en:'+readBucket(total));
 };
}
