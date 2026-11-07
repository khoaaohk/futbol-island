/**
 * The comprehensive admin export (Nov 6 2026), built from the daily data layer (lib/analytics/daily.ts) only, so every number
 * here has the same rule as the layer the dashboard will chart. Pure: app/api/admin/export/route.ts serves it,
 * tests/admin-analytics-daily.cjs parses it.
 *  1. summaryCsv     one row per headline metric (and its parts): the total, its window (the range, or "not tracked before
 *                    <date>"), the previous period of the same number of complete days, the change, how it is counted;
 *  2. dailyCsv       tidy: date,section,metric,part,value,unit,tracked_since,partial_day for every series and day;
 *  3. definitionsCsv every series: how it is counted, its roll-up, its source ids, tracked since; then the tracking gaps;
 *  (+ hoursCsv: the hour-of-day panels; all four in one ZIP via zip.ts).
 * EXACT numbers (owner decision Nov 6 2026 for the export: admin-only, no personal data): no "<5". An empty value = not tracked.
 */
import {aggregate,previousPeriod,totalOf,type DailyLayer,type DailySeries} from './daily';

const q=(v:unknown)=>{const s=v===null||v===undefined?'':String(v);return /[",\n\r]/.test(s)?`"${s.replace(/"/g,'""')}"`:s;};
const toCsv=(rows:unknown[][])=>rows.map(r=>r.map(q).join(',')).join('\n')+'\n';
/** Exact to 6 decimals (minutes from milliseconds, ratios); integers as they are. */
export const num=(v:number|null|undefined)=>v===null||v===undefined||!Number.isFinite(v)?'':Number.isInteger(v)?String(v):String(Math.round(v*1e6)/1e6);
const dec2=(v:number|null)=>v===null?'':Number.isInteger(v)?String(v):v.toFixed(2);
const shown=(v:number|null,unit:string)=>v===null?'':unit==='share'?`${Math.round(v*1000)/10}%`:dec2(v);

export const DAILY_COLUMNS=['date','section','metric','part','value','unit','tracked_since','partial_day'] as const;
/** The raw counter section only lists ids with a non-zero day in the range (the Definitions sheet lists every one). */
const listed=(s:DailySeries)=>s.section!=='counters'||s.points.some(p=>(p.value??0)!==0);

export function dailyCsv(layer:DailyLayer):string{
 const rows:unknown[][]=[[...DAILY_COLUMNS]];
 for(const s of layer.series){if(!listed(s))continue;
  for(const p of s.points)rows.push([p.day,s.section,s.metric,s.part,num(p.value),s.unit,s.trackedSince??'',p.partial?'true':'false']);}
 return toCsv(rows);
}

const AGG_TEXT={sum:'sum of the days (today so far included)',ratio:'Σ numerator ÷ Σ denominator over the days',avg:'average of complete days (today left out)'} as const;
export function definitionsCsv(layer:DailyLayer):string{
 const rows:unknown[][]=[['section','metric','part','key','label','how_counted','unit','aggregation','window','source','tracked_since','fully_tracked_since','tracked_since_rule','in_daily_csv']];
 const RULE={'introduced':'the day its counters were introduced (git history of countIds.ts)','first-data':'the first day with data (earlier than its introduction)','tracking-start':'tracking start (Oct 7 2026)','first-session':'the first day with a session'};
 for(const s of layer.series)rows.push([s.section,s.metric,s.part,s.key,s.label,s.how,s.unit,AGG_TEXT[s.agg],
  s.section==='people'?'per Pacific day, raw rows (last 14 days)':'per Pacific day (America/Los_Angeles midnight to midnight)',s.source,s.trackedSince??'not tracked',s.fullSince??'',RULE[s.sinceFrom],
  listed(s)?'yes':'no: zero on every day of the range']);
 rows.push([]);rows.push(['tracking_gap','metric','','','','why','','','','fix']);
 for(const g of layer.gaps)rows.push(['tracking_gap',g.metric,'','','',g.why,'','','',g.fix]);
 rows.push([]);rows.push(['not_exported','family','','','','why']);
 for(const n of layer.notExported)rows.push(['not_exported',n.family,'','','',n.why]);
 rows.push([]);rows.push(['note','Days are Pacific days; the range\'s last day is partial when it is today (partial_day=true). An empty value = not tracked that day (never a made-up 0). Exact numbers: no small-number masking in this admin-only export.']);
 return toCsv(rows);
}

export function hoursCsv(layer:DailyLayer):string{
 const h=layer.hours,rows:unknown[][]=[['panel','weekday','hour','sessions','visitors','pageviews','visits','note']];
 for(const r of h.sessions.hours)rows.push(['session_starts','all',r.hour,r.sessions,r.visitors,r.pageviews,'',h.sessions.note+(h.sessions.days.length?` Days: ${h.sessions.days[0]} to ${h.sessions.days[h.sessions.days.length-1]}.`:'')]);
 h.investor.grid.forEach((row,w)=>row.forEach((n,hr)=>rows.push(['investor_page',h.investor.weekdays[w],hr,'','','',n,''])));
 rows.push(['note','','','','','','',h.note]);
 return toCsv(rows);
}

/** Extras the layer cannot know (raw-row SQL over the last 14 days), shown with their own window. */
export type SummaryExtras={playersDistinct:number|null;returningShare:number|null;medianSessionMs:number|null};

/** The summary rows, in the order of the Overview. */
const SUMMARY_KEYS:{key:string;label?:string}[]=[
 {key:'audience.players_per_day',label:'Players per day (average of daily unique visitors, complete days)'},{key:'audience.sessions'},
 {key:'audience.avg_session_minutes'},{key:'audience.session_minutes'},{key:'audience.minutes_per_player'},{key:'audience.pageviews'},{key:'audience.bounce_rate'},
];
const SUMMARY_SECTIONS=['engagement','kit','where_time_goes','live_matches','fishing','marketing'];

export function summaryCsv(layer:DailyLayer,extras:SummaryExtras):string{
 const {from,to,today}=layer,n=layer.days.length,partial=!!layer.partialDay;
 const rows:unknown[][]=[['Futbol Island engagement summary',`${from} to ${to}`,`${n} Pacific day${n===1?'':'s'}`,partial?`${to} is today (partly over): totals include it so far; averages and the previous-period comparison use complete days only`:'all days complete'],[],
  ['Metric','Part','Total','Unit','Window','Previous period','Previous total','Change','How it is counted']];
 const raw14='last 14 days of raw rows inside the range';
 rows.push(['Players (distinct player ids: save code, else device)','',extras.playersDistinct===null?'not available':extras.playersDistinct,'players',raw14,'','','','Sessions without a player id are left out. From analytics_players (raw rows).']);
 const row=(s:DailySeries,label?:string)=>{
  const t=totalOf(s),p=previousPeriod(s,from,to,today);
  const tracked=s.trackedSince;
  const win=!tracked?'not tracked in this range':tracked>to?`not tracked before ${tracked}`:tracked>from?`${tracked} to ${to} (not tracked before ${tracked})`:`${from} to ${to}`;
  const winFull=s.fullSince&&s.fullSince>from?`${win}; every part counted from ${s.fullSince}`:win;
  const prevWin=p.status==='ok'?`${p.from} to ${p.to}${p.curTo!==to?` vs ${p.curFrom} to ${p.curTo}`:''}`:p.status==='not-tracked'?`not tracked before ${p.trackedSince}`:p.status==='not-loaded'?'not loaded':'not tracked';
  rows.push([label??(s.part?s.label.split(': ')[0]:s.label),s.part?s.label.split(': ').slice(1).join(': ')||s.part:'',t.value===null?'not tracked':shown(t.value,s.unit),s.unit,winFull,prevWin,
   p.status==='ok'?shown(p.value,s.unit):'',p.status==='ok'&&p.change!==null?`${Math.round(p.change*100)}%`:'',s.how]);};
 for(const k of SUMMARY_KEYS){const s=layer.series.find(x=>x.key===k.key);if(s)row(s,k.label);}
 rows.push(['Returning sessions (share of sessions with the mark)','',extras.returningShare===null?'not available':`${Math.round(extras.returningShare*1000)/10}%`,'share',raw14,'','','','Sessions from a device that played before ÷ sessions that sent the mark; from analytics_sources_summary (raw rows).']);
 if(extras.medianSessionMs!==null)rows.push(['Median session','',dec2(extras.medianSessionMs/60000),'minutes',`${from} to ${to}`,'','','','Estimated inside 22 length buckets (core.ts histMedianMs); averages are exact.']);
 for(const sec of SUMMARY_SECTIONS){rows.push([]);
  const list=sec==='where_time_goes'?layer.series.filter(s=>s.metric==='where_time_goes'):sec==='live_matches'?layer.series.filter(s=>s.section===sec&&s.part==='all'):
   sec==='marketing'?layer.series.filter(s=>s.section===sec&&!s.metric.endsWith('_by_place')):layer.series.filter(s=>s.section===sec&&s.metric!=='cards_by_number');
  for(const s of list)row(s);}
 rows.push([],['Exact numbers (no small-number masking): this export is admin-only and carries no personal data. Days are Pacific days. "Not tracked" = the counters did not exist yet (never shown as 0). The daily CSV has every day; the Definitions CSV says how each series is counted.']);
 return toCsv(rows);
}

/** For the tests and the route: the ratio/avg-aware span value (re-exported so callers need one import). */
export {aggregate};
