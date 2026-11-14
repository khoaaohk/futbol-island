/**
 * The /admin dashboard's data (Nov 6 2026; owner: "rebuild it so I can see trends better … tell a visual story of the data …
 * daily players, returning, sessions, minutes per player … drill into each player. No goals for now.").
 *
 * ONE source: the daily data layer (daily.ts, loaded by dailyAdmin.ts loadDailyLayer), the same layer the export
 * (/api/admin/export, exportCsv.ts) writes, so a number on the dashboard equals the export's number for the same range.
 * The server (dashboardAdmin.ts) picks the series the dashboard draws (DASH_KEYS / DASH_PREFIXES) and sends them compact
 * (one value array per series over `days`); this module rebuilds them in the browser and runs the layer's own arithmetic
 * (dailyMath.ts: totals, previous period, weeks, weekdays) plus the story helpers: the takeaway sentence, the biggest movers,
 * the anomaly flags, the funnels and the cohort table. Pure and client-safe (no server imports; types only from the layer).
 *
 * Honesty rules (docs/analytics-audit-2026-11-06.md): not tracked = null, never 0; today is partial (left out of averages,
 * of sparkline ends and of multi-day comparisons); a comparison exists only when the previous period is fully tracked; exact numbers.
 * Nov 13 2026 (owner: "today so far vs all of yesterday"): a range of today alone compares with yesterday up to the same time of
 * day (DashboardData.sameTime, compareOf); a series with no such window says "comparison waits for a full day".
 */
import {aggregate,byWeekday,isTracked,previousPeriod,weekly,type Agg,type DailyPoint,type PrevPeriod,type SeriesCore,type WeekRow} from './dailyMath';

export type DashSeries={key:string;label:string;unit:string;agg:Agg;scale?:number;how:string;source:string;trackedSince:string|null;fullSince:string|null;
 /** One value per `DashboardData.days` (null = not tracked that day). */v:(number|null)[];
 /** Ratio series: [numerator, denominator] per day (null = not tracked), so any span recomputes the ratio exactly. */nd?:([number,number]|null)[]};
export type CohortRow={day:string;players:number;d1:number|null;d7:number|null};
export type PeopleStatus='ok'|'needs-sql'|'not-configured'|'error';
export type DashboardData={version:1;generatedAt:string;from:string;to:string;today:string;partialDay:string|null;timeZone:string;
 /** The range's days preceded by up to as many earlier loaded days (for the previous period); `start` = index of `from`. */
 days:string[];start:number;utcDays:string[];loadedFrom:string;
 series:Record<string,DashSeries>;
 hours:{sessions:{status:'ok'|'none';days:string[];hours:{hour:number;sessions:number}[];note:string};investor:{grid:number[][];hours:number[];total:number;note:string};note:string};
 people:{status:PeopleStatus;cohorts:CohortRow[];windowDays:number};
 gaps:{metric:string;why:string;fix:string}[];
 /** Feature start days inside the loaded days (first day a counter family was sent: countSince.generated.ts). */
 releases:{day:string;label:string}[];
 medianSessionMs:number|null;
 /** A single-day range that is today: yesterday up to the same Pacific time of day (store.computeWindow), so today so far is
  *  compared like for like (owner, Nov 13 2026). Absent when yesterday's raw rows are gone or the window is unavailable. */
 sameTime?:SameTime|null};
/** Yesterday's values from Pacific midnight to `cutIso` (the same time of day as now), per series key; `label` e.g. "5:36 pm".
 *  Series missing here (people.*: another SQL function) cannot be compared like for like: "waits for a full day". */
export type SameTime={day:string;cutIso:string;label:string;v:Record<string,number|null>;nd?:Record<string,[number,number]|null>};

/** Keys the dashboard reads (the server sends these and every key under DASH_PREFIXES). */
export const K={
 players:'audience.players_per_day',sessions:'audience.sessions',pageviews:'audience.pageviews',bounce:'audience.bounce_rate',
 minutes:'audience.session_minutes',avgSession:'audience.avg_session_minutes',mpp:'audience.minutes_per_player',
 distinct:'people.players_distinct',returningShare:'people.returning_share',returning:'people.returning_sessions',fresh:'people.new_sessions',
 games:'engagement.games',cards:'engagement.cards',watched:'engagement.watched',quizzes:'engagement.quizzes',social:'engagement.social',emotes:'engagement.emotes',
 shirts:'engagement.shirts',cleats:'engagement.cleats',books:'engagement.books',reading:'engagement.reading',
 lmVisits:'live_matches.pitch_visits.all',lmJoins:'live_matches.joins.all',lmLeaves:'live_matches.leaves.all',lmSeconds:'live_matches.match_seconds.all',lmAvg:'live_matches.avg_match_seconds.all',
 lmPlayers:'live_matches.players.all',lmGoals:'live_matches.goals.all',lmReplays:'live_matches.replays.all',lmBots:'live_matches.bot_slots.all',lmHumans:'live_matches.human_slots.all',
 fishTapped:'fishing.funnel_sessions.start',fishLanded:'fishing.funnel_events.land',
 tourViews:'marketing.tour_views',tourPlay:'marketing.tour_play_sessions',investorVisits:'marketing.investor_visits',investorAvg:'marketing.investor_avg_stay_seconds',
 firstTries:'learning.first_try.tries',firstRight:'learning.first_try.share',
 titleView:'counters.st:view.sessions',titleStart:'counters.st:start.sessions',titleCreated:'counters.st:created.sessions',titlePlay:'counters.st:play_ready.sessions',
 parties:'counters.mp:in.sessions',swims:'counters.wa:swim_start.total',kicks:'counters.su:kick_play.total',balls:'counters.su:ball_find.total',emotePicks:'counters.em:pick.total',
} as const;
export const DASH_KEYS:readonly string[]=Object.values(K);
export const DASH_PREFIXES:readonly string[]=['people.','time.where_time_goes.','time.area_minutes.','learning.stage_total.','learning.first_try.','kit.','live_matches.','fishing.',
 'audience.sessions_by_device.','audience.sessions_by_source.'];
/** The dashboard's series: an explicit key, a prefix, an Overview card total (no part), or a marketing headline (not by place). */
export const wantSeries=(s:{key:string;section:string;part:string;metric:string})=>DASH_KEYS.includes(s.key)||DASH_PREFIXES.some(p=>s.key.startsWith(p))
 ||(s.section==='engagement'&&!s.part&&s.metric!=='cards_by_number')||(s.section==='marketing'&&!s.metric.includes('by_place'))||(s.section==='audience'&&!s.metric.startsWith('sessions_by_'));

// ---- rebuilding a series ---------------------------------------------------------------------------------------------------
export type Series=SeriesCore&Omit<DashSeries,'v'|'nd'>;
const cache=new WeakMap<DashboardData,Map<string,Series|null>>();
/** A series as the layer's arithmetic wants it: `points` = the range's days, `prior` = the loaded days before. null = absent. */
export function seriesOf(d:DashboardData,key:string):Series|null{
 let m=cache.get(d);if(!m){m=new Map();cache.set(d,m);}if(m.has(key))return m.get(key)!;
 const s=d.series[key];if(!s){m.set(key,null);return null;}
 const utc=new Set(d.utcDays);
 const pts=d.days.map((day,i):DailyPoint=>{const p:DailyPoint={day,value:s.v[i]??null};if(day===d.today)p.partial=true;if(utc.has(day))p.utcDay=true;
  const nd=s.nd?.[i];if(nd){p.num=nd[0];p.den=nd[1];}return p;});
 const {v:_v,nd:_nd,...meta}=s;void _v;void _nd;
 const out:Series={...meta,points:pts.slice(d.start),prior:pts.slice(0,d.start)};m.set(key,out);return out;
}
export const rangeDays=(d:DashboardData)=>d.days.length-d.start;
/** Complete days of the range (today left out). */
export const completeDays=(d:DashboardData)=>d.days.slice(d.start).filter(x=>x!==d.today);

// ---- tiles -----------------------------------------------------------------------------------------------------------------
/** A tile's comparison: the previous period (dailyMath.ts), or, for today alone, yesterday by the same time (`sameTime` = its label);
 *  'waits' = today alone with no like-for-like yesterday for this series. */
export type Compare=(PrevPeriod&{sameTime?:string})|{status:'waits';from:string;to:string;trackedSince:string|null};
const addDay=(day:string,n:number)=>new Date(Date.parse(day+'T00:00:00Z')+n*86_400_000).toISOString().slice(0,10);
/** The range is today alone (partly over): compared with yesterday up to the same time of day, never with all of yesterday. */
export const todayAlone=(d:DashboardData)=>d.from===d.to&&d.to===d.today&&d.partialDay===d.today;
export function compareOf(d:DashboardData,s:Series):Compare{
 if(!todayAlone(d))return previousPeriod(s,d.from,d.to,d.today);
 const y=addDay(d.today,-1),st=d.sameTime;
 if(s.trackedSince&&y<s.trackedSince)return {status:'not-tracked',from:y,to:y,trackedSince:s.trackedSince};
 const v=st?.v[s.key],nd=st?.nd?.[s.key];
 if(!st||v===undefined||(s.agg==='ratio'?!nd:v===null))return {status:'waits',from:y,to:y,trackedSince:s.trackedSince};
 const prev=s.agg==='ratio'?(nd![1]?nd![0]/nd![1]*(s.scale??1):null):v,cur=aggregate(s,s.points).value;
 return {status:'ok',from:st.day,to:st.day,value:prev,current:cur,curFrom:d.today,curTo:d.today,change:prev===null||cur===null||prev===0?null:(cur-prev)/prev,sameTime:st.label};
}
/** What a delta is against, in words: "yesterday by 5:36 pm", "the 6 days before (today left out of both)", "the 7 days before". */
export function vsLabel(d:DashboardData,p:Compare|null):string{
 if(!p)return 'the period before';
 if(p.status==='ok'&&p.sameTime)return `yesterday by ${p.sameTime}`;
 if(p.status==='waits')return 'yesterday by this time';
 const n=dayCount(p.from,p.to);
 return `the ${n} day${n===1?'':'s'} before${p.status==='ok'&&d.partialDay&&p.curTo<d.to?' (today left out of both)':''}`;
}
/** How an average-of-days tile reads its days (the "mean of complete days" rule does not fit a single day). */
export const daysRule=(d:DashboardData)=>todayAlone(d)?'today so far':d.from===d.to?`${fmtDay(d.from)} only`:d.partialDay?'mean of complete days (today left out)':'mean of the days';
export const WAITS_TEXT='comparison waits for a full day';
export type Kpi={key:string;label:string;unit:string;value:number|null;prev:Compare|null;vs:string;spark:(number|null)[];sparkDays:string[];trackedSince:string|null;how:string;
 /** Tracked from after the range began: the total covers only part of it. */partFrom:string|null};
/** A tile: the range's value (the layer's rule for the series), its previous period and its complete-day sparkline. */
export function kpi(d:DashboardData,key:string):Kpi|null{
 const s=seriesOf(d,key);if(!s)return null;
 const days=s.points.filter(p=>!p.partial||s.points.length===1);
 const prev=compareOf(d,s);
 return {key,label:s.label,unit:s.unit,value:aggregate(s,s.points).value,prev,vs:vsLabel(d,prev),
  spark:days.map(p=>isTracked(p)?(p.value as number):null),sparkDays:days.map(p=>p.day),trackedSince:s.trackedSince,how:s.how,
  partFrom:s.trackedSince&&s.trackedSince>d.from?s.trackedSince:null};
}
/** Whether "compare to the previous period" can be offered: the sessions series' previous period is fully tracked. */
export function compareState(d:DashboardData):{ok:true;from:string;to:string;days:number;label:string}|{ok:false;reason:string}{
 const s=seriesOf(d,K.sessions);if(!s)return {ok:false,reason:'No sessions loaded.'};
 const p=compareOf(d,s);
 if(p.status==='ok')return {ok:true,from:p.from,to:p.to,days:dayCount(p.from,p.to),label:p.sameTime?`yesterday by ${p.sameTime}`:`${fmtDay(p.from)} – ${fmtDay(p.to)}${d.partialDay&&p.curTo<d.to?' (today left out)':''}`};
 if(p.status==='waits')return {ok:false,reason:'Comparison waits for a full day (yesterday by this time is not available)'};
 return {ok:false,reason:p.status==='not-tracked'||p.status==='not-loaded'?`Not tracked before ${fmtDay(s.trackedSince??d.loadedFrom)}`:'Nothing to compare with'};
}
export const dayCount=(from:string,to:string)=>Math.round((Date.parse(to+'T00:00:00Z')-Date.parse(from+'T00:00:00Z'))/86_400_000)+1;
/** A change worth printing: ok and both sides known. */
export const changeOf=(p:Compare|null)=>p&&p.status==='ok'&&p.value!==null&&p.current!==null?{cur:p.current,prev:p.value,change:p.change}:null;

// ---- the story -------------------------------------------------------------------------------------------------------------
/** Series compared for "what changed most" (the owner's core measures and the main activities). */
export const MOVER_KEYS:readonly string[]=[K.players,K.sessions,K.avgSession,K.mpp,K.pageviews,K.returningShare,K.distinct,K.games,K.cards,K.watched,K.quizzes,K.social,K.emotes,
 K.lmJoins,K.fishLanded,K.tourViews,K.investorVisits,K.firstTries];
/** Movers need a base: sums with fewer than this in the previous period are left out (a 1 → 3 is not "+200%"). */
export const MOVER_MIN_BASE=5;
export type Mover={key:string;label:string;unit:string;cur:number;prev:number;change:number};
export function movers(d:DashboardData,keys:readonly string[]=MOVER_KEYS):Mover[]{
 const out:Mover[]=[];
 for(const key of keys){const s=seriesOf(d,key);if(!s)continue;const c=changeOf(compareOf(d,s));
  if(!c||c.change===null)continue;if(s.agg==='sum'&&c.prev<MOVER_MIN_BASE)continue;out.push({key,label:s.label,unit:s.unit,cur:c.cur,prev:c.prev,change:c.change});}
 return out.sort((a,b)=>Math.abs(b.change)-Math.abs(a.change)||a.key.localeCompare(b.key));
}
/** Series checked for unusual days. */
export const ANOMALY_KEYS:readonly string[]=[K.players,K.sessions,K.avgSession,K.mpp,K.games,K.cards,K.lmJoins,K.fishLanded,K.social];
/** A day is flagged when it sits more than ANOMALY_Z scaled MADs from the range's median (MAD × 1.4826 ≈ one standard deviation
 *  for normal data, but not pulled by the outliers themselves). Needs ANOMALY_MIN_DAYS complete tracked days and a MAD above 0. */
export const ANOMALY_Z=2,ANOMALY_MIN_DAYS=7;
/** …and at least this far from the median in relative terms (a very steady series, e.g. average session over hundreds of
 *  sessions, has a tiny MAD; a 4% wobble there is not news). */
export const ANOMALY_MIN_REL=0.2;
export type Anomaly={key:string;label:string;unit:string;day:string;value:number;median:number;z:number;dir:'spike'|'drop'};
const median=(xs:number[])=>{const a=[...xs].sort((x,y)=>x-y),n=a.length;return n?n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2:0;};
export function robustFlags(points:{day:string;value:number}[],z=ANOMALY_Z):{day:string;value:number;median:number;z:number}[]{
 if(points.length<ANOMALY_MIN_DAYS)return [];
 const vs=points.map(p=>p.value),m=median(vs),mad=median(vs.map(v=>Math.abs(v-m)))*1.4826;
 if(!(mad>0))return [];
 return points.map(p=>({day:p.day,value:p.value,median:m,z:(p.value-m)/mad})).filter(p=>Math.abs(p.z)>z&&Math.abs(p.value-m)>=ANOMALY_MIN_REL*Math.abs(m));
}
export function anomalies(d:DashboardData,keys:readonly string[]=ANOMALY_KEYS):Anomaly[]{
 const out:Anomaly[]=[];
 for(const key of keys){const s=seriesOf(d,key);if(!s)continue;
  // The first tracked day is left out: a counter ships mid-day, so its first day is short by design, not news.
  const pts=s.points.filter(p=>!p.partial&&isTracked(p)&&p.value!==null&&p.day!==s.trackedSince).map(p=>({day:p.day,value:p.value as number}));
  for(const f of robustFlags(pts))out.push({key,label:s.label,unit:s.unit,...f,dir:f.z>0?'spike':'drop'});}
 return out.sort((a,b)=>Math.abs(b.z)-Math.abs(a.z)||a.day.localeCompare(b.day));
}

/** The one-sentence takeaway at the top of the Overview, built from the numbers only. */
export function takeaway(d:DashboardData,compare:boolean):string{
 const ses=seriesOf(d,K.sessions),pl=seriesOf(d,K.players),mpp=seriesOf(d,K.mpp);
 if(!ses||!pl)return 'No data for this range yet.';
 const tot=aggregate(ses,ses.points).value??0;if(!tot)return `No sessions in ${rangePhrase(d)} yet.`;
 const ppd=aggregate(pl,pl.points).value,mp=mpp?aggregate(mpp,mpp.points).value:null,n=completeDays(d).length;
 const base=`${fmtNum(ppd,1)} visitors (devices) a day${n?` over ${n} complete day${n===1?'':'s'}`:' (today so far)'}, ${fmtNum(tot)} sessions${mp!==null?`, ${fmtNum(mp,1)} minutes per player`:''}`;
 if(compare){const pp=compareOf(d,pl),pc=changeOf(pp),sc=changeOf(compareOf(d,ses));
  if(pc&&pc.change!==null&&pp.status==='ok'){const top=movers(d).find(m=>m.key!==K.players&&m.key!==K.sessions);
   return `Visitors (devices) per day ${pc.change>=0?'up':'down'} ${fmtPctAbs(pc.change)} to ${fmtNum(pc.cur,1)} vs ${vsLabel(d,pp)}`+
    `${sc&&sc.change!==null?`; sessions ${sc.change>=0?'up':'down'} ${fmtPctAbs(sc.change)}`:''}`+
    `${top?`; the biggest change: ${lowerFirst(top.label)} ${top.change>=0?'+':'−'}${fmtPctAbs(top.change)}`:''}.`;}}
 if(compare&&todayAlone(d)&&compareOf(d,pl).status==='waits')return `${base}; the ${WAITS_TEXT}.`;
 const busiest=ses.points.filter(p=>!p.partial&&p.value!==null).sort((a,b)=>(b.value as number)-(a.value as number)||a.day.localeCompare(b.day))[0];
 return `${base}${busiest?`; the busiest day was ${fmtDay(busiest.day)} (${fmtNum(busiest.value)} sessions)`:''}.`;
}
const lowerFirst=(s:string)=>s&&s[0]===s[0].toUpperCase()&&s[1]!==s[1]?.toUpperCase()?s[0].toLowerCase()+s.slice(1):s;
const rangePhrase=(d:DashboardData)=>d.from===d.to?fmtDay(d.from):`${fmtDay(d.from)} – ${fmtDay(d.to)}`;

// ---- funnels ---------------------------------------------------------------------------------------------------------------
export type FunnelStep={key:string;label:string;value:number|null;unit:string;fromPrev:number|null};
/** A funnel's steps over the SAME days: from the day its last step started counting (a step tracked for longer, e.g. fish landed
 *  since Oct 15 against Fish tapped since Nov 6, would otherwise out-count the step before it). `since`: that day, or null. */
function steps(d:DashboardData,list:[string,string,string][]):FunnelStep[]&{since?:string|null}{
 const ss=list.map(([key])=>seriesOf(d,key)),since=ss.reduce<string|null>((a,s)=>s?.trackedSince&&(!a||s.trackedSince>a)?s.trackedSince:a,null);
 let prev:number|null=null;
 const out:FunnelStep[]&{since?:string|null}=list.map(([key,label,unit],i)=>{const s=ss[i];
  const v=s&&since&&since<=d.to?aggregate(s,s.points.filter(p=>p.day>=since)).value:null;
  const r:FunnelStep={key,label,value:v,unit,fromPrev:prev!==null&&v!==null&&prev>0?v/prev:null};prev=v;return r;});
 out.since=since&&since>d.from?since:null;return out;
}
export const funnels=(d:DashboardData)=>({
 onboarding:steps(d,[[K.titleView,'Saw the title screen','sessions'],[K.titleStart,'Pressed Start','sessions'],[K.titleCreated,'Save code made','sessions'],[K.titlePlay,'Went to the island','sessions']]),
 fishing:steps(d,[['fishing.funnel_sessions.start','Fish tapped','sessions'],['fishing.funnel_sessions.cast','Cast','sessions'],['fishing.funnel_sessions.bite','Bite','sessions'],
  ['fishing.funnel_sessions.hook_spin','Hooked','sessions'],['fishing.funnel_sessions.land','Landed','sessions']]),
 matches:steps(d,[[K.lmVisits,'Pitch visits','visits'],[K.lmJoins,'Joined a match','matches'],[K.lmLeaves,'Finished (time counted)','matches']]),
});
/** Cohorts that started inside the range, with D1 / D7 shares (null while the day has not ended). */
export function cohortTable(d:DashboardData){
 const rows=d.people.cohorts.filter(c=>c.day>=d.from&&c.day<=d.to);
 const sum=(f:(c:CohortRow)=>number|null)=>{const ok=rows.filter(c=>f(c)!==null);return ok.length?{n:ok.reduce((a,c)=>a+(f(c) as number),0),of:ok.reduce((a,c)=>a+c.players,0)}:null;};
 return {rows:rows.map(c=>({...c,d1Share:c.d1===null||!c.players?null:c.d1/c.players,d7Share:c.d7===null||!c.players?null:c.d7/c.players})),d1:sum(c=>c.d1),d7:sum(c=>c.d7)};
}

// ---- charts ----------------------------------------------------------------------------------------------------------------
export {weekly,byWeekday,aggregate,previousPeriod};
export type {WeekRow,PrevPeriod,DailyPoint};
/** Daily values for a chart (null = not tracked; today flagged partial). */
export const dailyValues=(s:Series)=>s.points.map(p=>({day:p.day,value:isTracked(p)?(p.value as number):null,partial:!!p.partial}));

// ---- formatting (exact numbers: admin only) --------------------------------------------------------------------------------
export function fmtNum(v:number|null|undefined,dec=0):string{
 if(v===null||v===undefined||!Number.isFinite(v))return '—';
 const r=Math.abs(v)>=100?Math.round(v):Number(v.toFixed(dec));
 return new Intl.NumberFormat('en-US',{maximumFractionDigits:Math.abs(v)>=100?0:dec,minimumFractionDigits:0}).format(r);
}
export const fmtPctAbs=(x:number)=>`${Math.abs(x*100)>=10?Math.round(Math.abs(x*100)):Math.round(Math.abs(x*1000))/10}%`;
export const fmtShare=(x:number|null|undefined)=>x===null||x===undefined||!Number.isFinite(x)?'—':`${Math.round(x*1000)/10}%`;
export const fmtDay=(day:string)=>{const t=Date.parse(day+'T12:00:00Z');return Number.isFinite(t)?new Date(t).toLocaleDateString('en-US',{timeZone:'UTC',month:'short',day:'numeric'}):day;};
/** A value in its unit: minutes as "5.3 min", seconds as "2 min 30 s", shares as "42.1%", counts exact. */
export function fmtUnit(v:number|null|undefined,unit:string):string{
 if(v===null||v===undefined||!Number.isFinite(v))return '—';
 if(unit==='share')return fmtShare(v);
 if(unit==='seconds'){const s=Math.round(v);return s<60?`${s} s`:s<3600?`${Math.floor(s/60)} min ${String(s%60).padStart(2,'0')} s`:`${Math.floor(s/3600)} h ${String(Math.round(s%3600/60)).padStart(2,'0')} min`;}
 if(unit==='minutes')return `${fmtNum(v,1)} min`;
 return fmtNum(v,v%1?1:0);
}
