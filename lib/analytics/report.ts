/**
 * Builds the dashboard report from aggregates only: frozen daily rollups (kept for good) plus, for raw-retained days not
 * yet frozen, rollups the store computes on the fly (SQL in production). Raw rows never reach the function.
 */
import type {AnalyticsStore} from './store';
import {regionNamesFor} from './regions';
import {LIVE_WINDOW_MS,RETENTION_DAYS,addDays,dailySeries,dayList,displayDistribution,emptyReport,mergeRollups,rollupDay,utcDay,type DailyRollup,type Report} from './core';

export async function buildReport(store:AnalyticsStore|null,range:{from:string;to:string},now=new Date()):Promise<Report>{
 if(!store)return emptyReport(range.from,range.to,now,false);
 const days=dayList(range.from,range.to),today=utcDay(now),oldestRaw=addDays(today,-RETENTION_DAYS);
 const byDay=new Map<string,DailyRollup>((await store.rollups(days[0],days[days.length-1])).map(r=>[r.day,r]));
 const missing=days.filter(d=>!byDay.has(d)&&d>=oldestRaw&&d<=today);
 if(missing.length)for(const r of await store.computeDays(missing[0],missing[missing.length-1],now))if(!byDay.has(r.day))byDay.set(r.day,r);
 const rollups=days.map(d=>byDay.get(d)??rollupDay(d,[]));
 const merged=mergeRollups(rollups);
 const report:Report={...emptyReport(range.from,range.to,now,true),totals:merged.totals,distribution:displayDistribution(merged.hist),dims:merged.dims,areas:merged.areas,
  places:merged.places,activities:merged.activities,cells:merged.cells,regionNames:regionNamesFor(merged.dims.region.map(r=>r.key))};
 if(days.length===1&&days[0]>=oldestRaw){report.series=await store.hourly(days[0]);report.granularity='hour';
  /* no future hours drawn as zeros */if(days[0]===today)report.series=report.series.slice(0,now.getUTCHours()+1);}
 else{report.series=dailySeries(rollups);report.granularity='day';}
 report.live=await store.live(new Date(now.getTime()-LIVE_WINDOW_MS).toISOString());
 if(days[0]<oldestRaw)report.notes.push(`Days older than ${RETENTION_DAYS} days come from the nightly daily totals.`);
 return report;
}
