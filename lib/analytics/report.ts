/**
 * Builds the dashboard report from aggregates only: frozen daily rollups (kept for good) plus, for raw-retained days not
 * yet frozen, rollups the store computes on the fly (SQL in production). Raw rows never reach the function.
 * Oct 11 2026: also the same totals for the period just before the range (same length), for the investor overview's
 * period-over-period change (lib/analytics/overview.ts).
 *
 * Oct 12 2026 (Pacific time + accuracy pass, supabase/migrations/20261012_admin_pacific_time.sql):
 *  - days are America/Los_Angeles days once the store says so (store.timeMode()); until the migration runs, UTC days;
 *  - a Pacific day older than the raw window that was frozen before the migration only exists as a UTC-day total: it is
 *    used in its place and marked (time.utcDays, Point.utcDay), never silently mixed in;
 *  - like-for-like comparisons: when the range ends today, the period before is cut at the same time of day (from raw rows,
 *    exact) or, when its last day is older than the raw window, that day is scaled to the share of a day that has passed
 *    (time.compare 'estimated'); before, a partial today was compared with a whole day and every delta read low;
 *  - "Players per day" averages COMPLETE days only (not today's partial count) and starts at the first tracked day when the
 *    range reaches back before tracking began (zero days before launch no longer drag the average down).
 */
import type {AnalyticsStore} from './store';
import {oldestComputable} from './store';
import {regionNamesFor} from './regions';
import {buildLearning} from './learning';
import {buildStart} from './startReport';
import {buildOverview,type PerDay} from './overview';
import {buildSponsor} from './sponsor';
import {sponsorLabels} from './sponsorLabels';
import {buildEmotes,buildParty} from './partyReport';
import {emoteLabels} from './emoteLabels';
import {LIVE_WINDOW_MS,SCHEMA_VERSION,addDays,dailySeries,dayBounds,dayIn,dayList,displayDistribution,emptyReport,hoursInDay,mergeRollups,rollupDay,
 type DailyRollup,type Report,type ReportTime,type TimeZoneMode} from './core';

/** The rollups for `days`: frozen ones, else computed live for raw-retained days, else (Pacific mode) the UTC-day total frozen
 *  before the migration, else empty. `stale`: a live day lacks newer keys. */
async function loadRollups(store:AnalyticsStore,days:string[],now:Date,mode:TimeZoneMode):Promise<{rollups:DailyRollup[];stale:boolean}>{
 const today=dayIn(mode,now),oldestRaw=oldestComputable(today,mode);
 const byDay=new Map<string,DailyRollup>((await store.rollups(days[0],days[days.length-1])).map(r=>[r.day,r]));
 const missing=days.filter(d=>!byDay.has(d)&&d>=oldestRaw&&d<=today);
 // Storage check (Oct 9 2026): the installed SQL version, and whether a live-computed day with visits came back without the
 // learning keys (the SQL functions predate 20261009_analytics_counts.sql) or the start-page subset (20261009_analytics_start.sql). Either one shows the "storage needs update" banner.
 let stale=false;
 if(missing.length)for(const r of await store.computeDays(missing[0],missing[missing.length-1],now)){if(r.sessions>0&&(!('counts' in r)||!('start' in r)))stale=true;if(!byDay.has(r.day))byDay.set(r.day,r);}
 if(mode==='pacific'){
  const old=days.filter(d=>!byDay.has(d)&&d<oldestRaw);
  if(old.length)for(const r of await store.legacyRollups(old[0],old[old.length-1]))if(old.includes(r.day)&&!byDay.has(r.day))byDay.set(r.day,{...r,tz:'UTC'});
 }
 return {rollups:days.map(d=>byDay.get(d)??rollupDay(d,[])),stale};
}

/** Every count in a rollup times f (strings and flags untouched): an estimate of part of a day from the whole day. */
export function scaleRollup(r:DailyRollup,f:number):DailyRollup{
 const scale=(v:unknown,key=''):unknown=>key==='day'||key==='tz'||key==='exactVisitors'?v:typeof v==='number'?v*f:Array.isArray(v)?v.map(x=>scale(x)):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,scale(x,k)])):v;
 return scale(r) as DailyRollup;
}

/**
 * Players per day: the average of the daily unique visitors over COMPLETE days. A range that ends today leaves today out
 * (unless it is only today); leading days with no sessions are left out when nothing at all was recorded before the range
 * (tracking had not started). `skip`/`take` say which positions were averaged, so the period before uses the same ones.
 */
export function perDayOf(rollups:DailyRollup[],{partialToday,trackedBefore}:{partialToday:boolean;trackedBefore:boolean}):PerDay&{skip:number;take:number}{
 let take=rollups.length;if(partialToday&&take>1)take--;
 let skip=0;if(!trackedBefore)while(skip<take-1&&rollups[skip].sessions===0)skip++;
 const used=rollups.slice(skip,take),visitorDays=used.reduce((a,r)=>a+r.visitors,0);
 return {value:used.length?visitorDays/used.length:0,days:used.length,visitorDays,skip,take};
}

export async function buildReport(store:AnalyticsStore|null,range:{from:string;to:string},now=new Date()):Promise<Report>{
 if(!store)return emptyReport(range.from,range.to,now,false);
 const mode=await store.timeMode();
 const days=dayList(range.from,range.to),today=dayIn(mode,now),oldestRaw=oldestComputable(today,mode),len=days.length;
 const {rollups,stale}=await loadRollups(store,days,now,mode);
 const schema=await store.schemaVersion();
 const merged=mergeRollups(rollups);
 const partialToday=days[len-1]===today;
 const time:ReportTime={mode,today,partialToday,utcDays:rollups.filter(r=>r.tz==='UTC').map(r=>r.day),
  inexactVisitorDays:rollups.filter(r=>r.exactVisitors===false&&r.sessions>0).map(r=>r.day),
  dstDays:days.map(day=>({day,hours:hoursInDay(day,mode)})).filter(d=>d.hours!==24),compare:partialToday?'exact':'none'};
 const report:Report={...emptyReport(range.from,range.to,now,true),totals:merged.totals,distribution:displayDistribution(merged.hist),dims:merged.dims,areas:merged.areas,
  places:merged.places,activities:merged.activities,cells:merged.cells,regionNames:regionNamesFor(merged.dims.region.map(r=>r.key)),
  learning:buildLearning(merged.counts,merged.countSessions,merged.flags),start:buildStart(merged,schema,days.length),
  storage:{schema,needsUpdate:schema<SCHEMA_VERSION||stale,pacific:mode==='pacific'},time};

 // The period just before, same number of days (period-over-period change on the overview tiles). When this range ends today
 // its last day is only partly over, so the period before is cut at the same point of its last day. Best effort: no previous
 // numbers rather than no report.
 let prev=null,prevFull:DailyRollup[]|null=null;
 try{
  const prevDays=dayList(addDays(days[0],-len),addDays(days[0],-1));const p=await loadRollups(store,prevDays,now,mode);
  prevFull=p.rollups;let pr=p.rollups;
  if(partialToday){
   const elapsed=Math.max(0,now.getTime()-dayBounds(today,mode)[0]),last=prevDays[len-1],[a,b]=dayBounds(last,mode),cut=Math.min(b,a+elapsed);
   const part=last>=oldestRaw?await store.computeWindow(last,new Date(a).toISOString(),new Date(cut).toISOString()):null;
   if(part)pr=[...pr.slice(0,-1),part];
   else{
    // Older than the raw window (30/90-day ranges): scale that day by the share of yesterday's sessions that had started by
    // this time of day (the day's shape), or by the share of the day's hours when yesterday cannot tell.
    let f=(cut-a)/(b-a);const y=addDays(today,-1);
    if(y>=oldestRaw){const [ya,yb]=dayBounds(y,mode),yPart=await store.computeWindow(y,new Date(ya).toISOString(),new Date(Math.min(yb,ya+elapsed)).toISOString());
     const yFull=yPart?(await loadRollups(store,[y],now,mode)).rollups[0]:null;if(yPart&&yFull&&yFull.sessions>0)f=yPart.sessions/yFull.sessions;}
    pr=[...pr.slice(0,-1),scaleRollup(pr[len-1],f)];time.compare='estimated';
   }
  }
  prev={merged:mergeRollups(pr),rollups:pr,days:prevDays.length,from:prevDays[0],to:prevDays[prevDays.length-1]};
 }catch{}
 const trackedBefore=!prev||(prevFull||[]).some(r=>r.sessions>0);
 const curPer=perDayOf(rollups,{partialToday,trackedBefore});
 // The period before averages the same positions (its own last day is complete, so it is the full rollup there).
 let prevPer:PerDay|null=null;
 if(prev&&prevFull){const used=(len===1?prev.rollups:prevFull).slice(curPer.skip,curPer.take),vd=used.reduce((a,r)=>a+r.visitors,0);prevPer={value:used.length?vd/used.length:0,days:used.length,visitorDays:vd};}
 report.overview=buildOverview({merged,rollups,from:range.from,to:range.to,perDay:curPer},prev&&prevPer?{...prev,perDay:prevPer}:null);
 // Oct 20 2026: the sponsor Overview (lib/analytics/sponsor.ts) from the same rollups. A range under a week also gets the 7 days
 // ending on its last day for the tiles' trend lines (best effort: without them the trend is just the range).
 let trendRollups:DailyRollup[]|undefined;
 if(len<7)try{trendRollups=(await loadRollups(store,dayList(addDays(range.to,-6),range.to),now,mode)).rollups;}catch{}
 report.sponsor=buildSponsor({from:range.from,to:range.to,merged,rollups,prev:prev?{from:prev.from,to:prev.to,merged:prev.merged}:null,
  trendRollups,firstTry:report.overview.current.firstTry,labels:sponsorLabels});

 // Oct 22 2026: Play with friends and emotes (lib/analytics/partyReport.ts), same rollups.
 report.party=buildParty(merged,range,rollups);report.emotes=buildEmotes(merged,range,emoteLabels());

 if(len===1&&days[0]>=oldestRaw){report.series=await store.hourly(days[0]);report.granularity='hour';
  /* no future hours drawn as zeros */if(days[0]===today)report.series=report.series.slice(0,Math.floor((now.getTime()-dayBounds(today,mode)[0])/3_600_000)+1);}
 else{report.series=dailySeries(rollups);report.granularity='day';}
 report.live=await store.live(new Date(now.getTime()-LIVE_WINDOW_MS).toISOString());
 if(days[0]<oldestRaw)report.notes.push(`Days older than ${oldestRaw===addDays(today,-13)?13:14} days come from the nightly daily totals.`);
 return report;
}

/** The route and the page: resolve the range on the store's clock, then build. */
export async function buildReportFor(store:AnalyticsStore|null,resolve:(mode:TimeZoneMode)=>{from:string;to:string},now=new Date()):Promise<Report>{
 let mode:TimeZoneMode='pacific';if(store)try{mode=await store.timeMode();}catch{mode='utc';}
 return buildReport(store,resolve(mode),now);
}
