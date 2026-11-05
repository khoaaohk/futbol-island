/**
 * Investor page visits (Nov 5 2026, owner: "for the marketing tab in admin, add a section to show what state and time they came,
 * and how long they stayed on the marketing site"). Counts ONLY the unlisted /marketing page (app/(site)/marketing/page.tsx):
 * not the tour page at `/` (that is mk:, marketingIds.ts) and not the overview PDF. The page itself stays script-free: the
 * site-wide visit counter (components/VisitTracker.tsx) starts this watcher while the path is /marketing.
 *
 * The browser sends four kinds of fixed id on the existing beat (`k:{id:n}`, tracker.ts → /api/visit → daily rollups):
 *   mm:view                       one per page load of /marketing
 *   mm:min + mm:sec10 + mm:sec1   foreground time in whole seconds as minutes, tens (0–5) and units (0–9) per booking, so
 *                                 60·min + 10·sec10 + sec1 = seconds, exact; capped at MM_CAP_S per view. Booked on every hide
 *                                 and on pagehide (visibilitychange / the tracker's onPageHide hook, as the live-match leave).
 *   mm:t_<band>                   the visit's time band (MM_BANDS), booked once, at its first hide or pagehide
 * WHERE and WHEN are added on the SERVER by the ingest (lib/analytics/marketingVisitGeo.ts) from Vercel's geo headers and the
 * beat's arrival time: the browser never learns or sends its state, and no IP, city or coordinate is ever stored.
 *
 * Privacy (a kids' game; this page is read by grown-ups): totals per fixed id only. Never a referrer, text, position, order of
 * events or an id of anyone. Nothing at all is sent under Do-Not-Track / GPC, to bots, in previews, on localhost or from an
 * admin tab (the tracker is off and count() does nothing).
 * No import of tracker.ts here (countIds.ts imports these ids, and tracker.ts imports countIds.ts): VisitTracker passes count
 * and onPageHide in.
 */

import {MARKETING_PATH} from '../site/marketing';

export const MM_PATH=MARKETING_PATH;
/** One view never books more than this (30 min): a tab left open on the page is not reading. */
export const MM_CAP_S=30*60;
/** Stay bands, in seconds: [id, label, lo, hi). */
export const MM_BANDS=[['0_10','Under 10 s',0,10],['10_30','10–30 s',10,30],['30_60','30 s – 1 min',30,60],['60_180','1–3 min',60,180],
 ['180_600','3–10 min',180,600],['600','10 min or more',600,MM_CAP_S]] as const;
export const MARKETING_VISIT_COUNT_IDS:readonly string[]=['mm:view','mm:min','mm:sec10','mm:sec1',...MM_BANDS.map(b=>'mm:t_'+b[0])];

/** The band id for a stay of `sec` seconds (capped). */
export function stayBand(sec:number):string{
 const s=Math.min(MM_CAP_S,Math.max(0,sec));return (MM_BANDS.find(b=>s>=b[2]&&s<b[3])??MM_BANDS[MM_BANDS.length-1])[0];
}
/** Seconds as the three booking ids: minutes, tens (0–5), units (0–9). */
export function splitSeconds(sec:number):{min:number;sec10:number;sec1:number}{
 const s=Math.max(0,Math.floor(sec));return {min:Math.floor(s/60),sec10:Math.floor(s%60/10),sec1:s%10};
}

export type MmEnv={
 document:Pick<Document,'addEventListener'|'removeEventListener'|'visibilityState'>;
 now:()=>number;
 /** tracker.count. */
 count:(id:string,n?:number)=>void;
 /** tracker.onPageHide: runs before the tab's last beat. */
 onPageHide:(fn:()=>void)=>()=>void;
};

/** Count one view of /marketing and its foreground time. Returns stop() (books the time, as when leaving the page). */
export function watchMarketingVisit(env:MmEnv):()=>void{
 const d=env.document,count=env.count;
 count('mm:view');
 let fg=0,since:number|null=d.visibilityState==='visible'?env.now():null,booked=0,banded=false;
 const settle=()=>{
  if(since!==null){fg+=Math.max(0,env.now()-since);since=null;}
  const secs=Math.min(MM_CAP_S,Math.floor(fg/1000));
  if(secs>booked){const p=splitSeconds(secs-booked);if(p.min)count('mm:min',p.min);if(p.sec10)count('mm:sec10',p.sec10);if(p.sec1)count('mm:sec1',p.sec1);booked=secs;}
  if(!banded){banded=true;count('mm:t_'+stayBand(fg/1000));}
 };
 const onVis=()=>{if(d.visibilityState==='visible'){if(since===null)since=env.now();}else settle();};
 // Capture, so the time is booked before the tracker's own hide beat reads the counts (at the target, capture runs first).
 d.addEventListener('visibilitychange',onVis,{capture:true});
 const offHide=env.onPageHide(settle);
 return ()=>{settle();d.removeEventListener('visibilitychange',onVis,{capture:true});offHide();};
}
