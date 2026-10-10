/**
 * Builds the dashboard report from aggregates only: frozen daily rollups (kept for good) plus, for raw-retained days not
 * yet frozen, rollups the store computes on the fly (SQL in production). Raw rows never reach the function.
 * Oct 11 2026: also the same totals for the period just before the range (same length), for the investor overview's
 * period-over-period change (lib/analytics/overview.ts).
 */
import type {AnalyticsStore} from './store';
import {regionNamesFor} from './regions';
import {buildLearning} from './learning';
import {buildStart} from './startReport';
import {buildOverview} from './overview';
import {LIVE_WINDOW_MS,SCHEMA_VERSION,RETENTION_DAYS,addDays,dailySeries,dayList,displayDistribution,emptyReport,mergeRollups,rollupDay,utcDay,type DailyRollup,type Report} from './core';

/** The rollups for `days`: frozen ones, else computed live for raw-retained days, else empty. `stale`: a live day lacks newer keys. */
async function loadRollups(store:AnalyticsStore,days:string[],now:Date):Promise<{rollups:DailyRollup[];stale:boolean}>{
 const today=utcDay(now),oldestRaw=addDays(today,-RETENTION_DAYS);
 const byDay=new Map<string,DailyRollup>((await store.rollups(days[0],days[days.length-1])).map(r=>[r.day,r]));
 const missing=days.filter(d=>!byDay.has(d)&&d>=oldestRaw&&d<=today);
 // Storage check (Oct 9 2026): the installed SQL version, and whether a live-computed day with visits came back without the
 // learning keys (the SQL functions predate 20261009_analytics_counts.sql) or the start-page subset (20261009_analytics_start.sql). Either one shows the "storage needs update" banner.
 let stale=false;
 if(missing.length)for(const r of await store.computeDays(missing[0],missing[missing.length-1],now)){if(r.sessions>0&&(!('counts' in r)||!('start' in r)))stale=true;if(!byDay.has(r.day))byDay.set(r.day,r);}
 return {rollups:days.map(d=>byDay.get(d)??rollupDay(d,[])),stale};
}

export async function buildReport(store:AnalyticsStore|null,range:{from:string;to:string},now=new Date()):Promise<Report>{
 if(!store)return emptyReport(range.from,range.to,now,false);
 const days=dayList(range.from,range.to),today=utcDay(now),oldestRaw=addDays(today,-RETENTION_DAYS);
 const {rollups,stale}=await loadRollups(store,days,now);
 const schema=await store.schemaVersion();
 const merged=mergeRollups(rollups);
 const report:Report={...emptyReport(range.from,range.to,now,true),totals:merged.totals,distribution:displayDistribution(merged.hist),dims:merged.dims,areas:merged.areas,
  places:merged.places,activities:merged.activities,cells:merged.cells,regionNames:regionNamesFor(merged.dims.region.map(r=>r.key)),
  learning:buildLearning(merged.counts,merged.countSessions,merged.flags),start:buildStart(merged,schema,days.length),storage:{schema,needsUpdate:schema<SCHEMA_VERSION||stale}};
 // The period just before, same number of days (period-over-period change on the overview tiles). Best effort: no previous
 // numbers rather than no report.
 let prev=null;
 try{const prevDays=dayList(addDays(days[0],-days.length),addDays(days[0],-1));const p=await loadRollups(store,prevDays,now);
  prev={merged:mergeRollups(p.rollups),days:prevDays.length,from:prevDays[0],to:prevDays[prevDays.length-1]};}catch{}
 report.overview=buildOverview({merged,rollups,from:range.from,to:range.to},prev);
 if(days.length===1&&days[0]>=oldestRaw){report.series=await store.hourly(days[0]);report.granularity='hour';
  /* no future hours drawn as zeros */if(days[0]===today)report.series=report.series.slice(0,now.getUTCHours()+1);}
 else{report.series=dailySeries(rollups);report.granularity='day';}
 report.live=await store.live(new Date(now.getTime()-LIVE_WINDOW_MS).toISOString());
 if(days[0]<oldestRaw)report.notes.push(`Days older than ${RETENTION_DAYS} days come from the nightly daily totals.`);
 return report;
}
