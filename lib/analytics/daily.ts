/**
 * The DAILY DATA LAYER of /admin (Nov 6 2026; owner: "make the analytics trend-ready and the export comprehensive"). One
 * per-Pacific-day series for every headline metric the dashboard shows and for every counter id in countIds.ts, built from
 * the same daily rollups as the report (report.ts loadRollups → core.ts DailyRollup), plus the helpers a chart needs:
 * totals, weekly roll-ups, day-of-week and hour-of-day aggregates and an honest previous period. The comprehensive export
 * (app/api/admin/export, lib/analytics/exportCsv.ts) and the coming dashboard rebuild read THIS, so a number has one rule.
 *
 * Honesty rules (docs/analytics-audit-2026-11-06.md):
 *  - "not tracked" is null, never a fake 0. A series' `trackedSince` is the day its counters were introduced (the git
 *    history of countIds.ts: countSince.generated.ts, scripts/gen-count-since.cjs), or the first day that carries real data
 *    for it when that is earlier, never before TRACKING_START. Audience series start on the first day with a session. A day
 *    whose rollup lacks the field (frozen before the field existed) is null too.
 *  - today is `partial` (flagged on the point) and left out of averages; sums keep it ("today so far"), like the report;
 *  - a previous period exists only when every one of its days is tracked;
 *  - Pacific days (the store's clock); a day frozen before the Pacific migration is a UTC day standing in, flagged `utcDay`.
 *  - exact numbers: no small-number masking here (owner, Nov 6 2026: the export is admin-only and carries no personal data);
 *    the dashboard's own cards keep their `<5` rule until the owner decides otherwise.
 * Pure and dependency-light (no server imports): tests/admin-analytics-daily.cjs drives it directly.
 */
import type {DailyRollup,Point,TimeZoneMode} from './core';
import {AREAS,DIMS,TRACKING_START,dayList} from './core';
import {ACTIVITIES,PLACES} from './islandIds';
import {BEACH_COUNT_EVENTS,EMOTE_COUNT_EVENTS,ENGAGE_CARD_NUMBER_RE,FISHING_COUNT_EVENTS,FIXED_COUNT_IDS,IDP_COUNT_EVENTS,LESSON_STAGES,LIVE_MATCH_FORMATS,
 PARTY_COUNT_EVENTS,PARTY_RETENTION_EVENTS,SANDBAR_COUNT_EVENTS,SHOP_COUNT_EVENTS,SUMMIT_COUNT_EVENTS,TUTORIAL_COUNT_EVENTS,WATER_COUNT_EVENTS,lmId,type LiveMatchFormat} from './countIds';
import {COUNT_SINCE} from './countSince.generated';
import {SPONSOR_DEFS} from './sponsor';
import {LM_FORMAT_LABEL,lmSeconds} from './liveMatchReport';
import {mmSeconds} from './marketingVisitReport';
import {WEEKDAYS,hourId,isGeo} from './marketingVisitGeo';
import {MK_CLICKS} from './marketingIds';
import {LESSON_TEXT} from './learningText.generated';

import {aggregate,byWeekday,previousPeriod,totalOf,weekly,type Agg,type DailyPoint,type PrevPeriod,type WeekRow} from './dailyMath';
// The arithmetic lives in dailyMath.ts (Nov 6 2026: the dashboard runs it in the browser); re-exported so callers keep one import.
export {aggregate,byWeekday,previousPeriod,totalOf,weekly};
export type {Agg,DailyPoint,PrevPeriod,WeekRow};
export type DailySeries={
 /** `${section}.${metric}` or `${section}.${metric}.${part}`: stable, the export's and the charts' handle. */
 key:string;section:string;metric:string;part:string;label:string;unit:string;agg:Agg;
 /** Ratio series: num ÷ den × scale (e.g. ms → minutes). */
 scale?:number;
 /** Plain English: how it is counted (the Definitions sheet). `source`: the counter ids or rollup field behind it. */
 how:string;source:string;
 /** First tracked day (null: never tracked in the loaded days). `fullSince`: when a total's last part started (parts
  *  introduced later make the days in between a partial total). `sinceFrom`: how trackedSince was found. */
 trackedSince:string|null;fullSince:string|null;sinceFrom:'introduced'|'first-data'|'tracking-start'|'first-session';
 /** The range's days. `prior`: the loaded days before the range (for previousPeriod), oldest first. */
 points:DailyPoint[];prior:DailyPoint[]};
export type HourRow={hour:number;sessions:number;visitors:number;pageviews:number};
export type HourAggregates={
 /** Session starts by Pacific hour of day, summed over the range's raw-retained days (the last 14: older days are frozen day
  *  totals with no time of day). `days`: the days that went in. */
 sessions:{status:'ok'|'none';days:string[];hours:HourRow[];note:string};
 /** Investor page (/marketing) visits by Pacific weekday (0 = Sunday) × hour, every day of the range (mm:h_ counters). */
 investor:{weekdays:readonly string[];grid:number[][];hours:number[];total:number;note:string};
 note:string};
export type TrackingGap={metric:string;why:string;fix:string};
export type DailyLayer={version:1;from:string;to:string;today:string;timeZone:'America/Los_Angeles'|'UTC';
 /** The range's last day when it is today (partly over), else null. */
 partialDay:string|null;days:string[];utcDays:string[];loadedFrom:string;
 series:DailySeries[];hours:HourAggregates;gaps:TrackingGap[];notExported:{family:string;why:string}[]};

/** People per day from raw rows (the proposed SQL docs/analytics-proposed/analytics_daily_people.sql; null until it runs). */
export type PeopleDay={day:string;players:number;sessions:number;returning:number;fresh:number;unknown:number};

// ---- counter introduction days -------------------------------------------------------------------------------------------
const INTRO=new Map<string,string>();
for(const [d,ids] of Object.entries(COUNT_SINCE))for(const id of ids)INTRO.set(id,d);
/** Id families the allowlist accepts by shape (not listed in FIXED_COUNT_IDS), their first day and how they are exported. */
export const DYNAMIC_FAMILIES:readonly {family:string;re:RegExp;sample:string;since:string;exported:string|null}[]=[
 {family:'lo:/le:/ls:/lf:/la:<lesson>',re:/^l[oesfa]:[A-Za-z0-9_]+$/,sample:'le:learn7_roles',since:'2026-10-08',exported:'learning.lesson_<stage>.<lesson> (lessons with data) and learning.stage_total.<stage>'},
 {family:'q:<lesson>:<question>',re:/^q:/,sample:'q:learn7_roles:0',since:'2026-10-08',exported:null},
 {family:'o:<lesson>:<question>:<option>',re:/^o:/,sample:'o:learn7_roles:0:0',since:'2026-10-08',exported:null},
 {family:'en:cardn_<n>',re:ENGAGE_CARD_NUMBER_RE,sample:'en:cardn_1',since:'2026-10-20',exported:'engagement.cards_by_number.<n> (numbers with data)'},
 {family:'mm:g_/gm_/gx_<place> (server-added)',re:/^mm:g[mx]?_/,sample:'mm:g_us_ca',since:'2026-11-05',exported:'marketing.investor_visits_by_place / investor_stay_seconds_by_place'},
 {family:'mm:h_<weekday>_<hour> (server-added)',re:/^mm:h_/,sample:'mm:h_0_00',since:'2026-11-05',exported:'hours.investor (weekday × hour grid, the whole range)'},
];
/** Families on the allowlist that the daily CSV does not carry one by one (documented in the Definitions sheet). */
export const NOT_EXPORTED:readonly {family:string;why:string}[]=[
 {family:'q:<lesson>:<question>',why:'Per-question first tries (about 500 ids): exported as totals (learning.first_try.tries); the per-question view is the Learning tab.'},
 {family:'o:<lesson>:<question>:<option>',why:'Which option a first try chose (about 1,800 ids): exported as learning.first_try.right (the correct option); the distractor view is the Learning tab.'},
];
/** The day a counter id was introduced (null: unknown id). */
export function introducedOn(id:string):string|null{
 const d=INTRO.get(id);if(d)return d;
 return DYNAMIC_FAMILIES.find(f=>f.re.test(id))?.since??null;
}
const maxDay=(a:string,b:string)=>a>b?a:b;
/** First and last introduction day of the counters a test accepts (fixed ids and dynamic families' samples). */
function sinceOfTest(test:(id:string)=>boolean):{since:string;full:string}|null{
 const days=[...FIXED_COUNT_IDS.filter(test).map(id=>INTRO.get(id)||TRACKING_START),...DYNAMIC_FAMILIES.filter(f=>test(f.sample)).map(f=>f.since)];
 if(!days.length)return null;days.sort();return {since:days[0],full:days[days.length-1]};
}

// ---- labels for raw counters --------------------------------------------------------------------------------------------
const LABELS=new Map<string,string>();
const addLabels=(prefix:string,rows:readonly (readonly [string,string,...unknown[]])[])=>{for(const [e,l] of rows)LABELS.set(prefix+e,l);};
addLabels('sh:',SHOP_COUNT_EVENTS);addLabels('sb:',SANDBAR_COUNT_EVENTS);addLabels('su:',SUMMIT_COUNT_EVENTS);addLabels('bc:pickup_',BEACH_COUNT_EVENTS);
addLabels('tu:',TUTORIAL_COUNT_EVENTS);addLabels('fi:',FISHING_COUNT_EVENTS);addLabels('wa:',WATER_COUNT_EVENTS);addLabels('ip:',IDP_COUNT_EVENTS);
addLabels('mp:',PARTY_COUNT_EVENTS);addLabels('mp:',PARTY_RETENTION_EVENTS);addLabels('em:',EMOTE_COUNT_EVENTS);
export const counterLabel=(id:string)=>LABELS.get(id)??id;

// ---- the catalog ------------------------------------------------------------------------------------------------------
type X={r:DailyRollup;c:Record<string,number>;s:Record<string,number>};
type Need='counts'|'activityMs'|'placeMs';
type Def={section:string;metric:string;part?:string;label:string;unit:string;agg:Agg;how:string;source:string;
 /** Introduction day (TRACKING_START when the field has always been there). */since:string;full?:string;need?:Need;
 /** Audience series: tracked from the first day with a session (as "Players per day" always was, report.ts perDayOf). */
 firstSession?:boolean;
 value?:(x:X)=>number;num?:(x:X)=>number;den?:(x:X)=>number;scale?:number};
const MIN=60_000;
const sumIds=(rec:Record<string,number>,test:(id:string)=>boolean)=>{let a=0;for(const k in rec)if(test(k))a+=rec[k]||0;return a;};
const add=(rec:Record<string,number>|undefined,k:string)=>rec?.[k]||0;

/** Correct option per question (the first-try "right" count), from the generated lesson text. */
let CORRECT:Set<string>|null=null;
const correctIds=()=>CORRECT??=new Set(LESSON_TEXT.flatMap(([,id,,qs])=>qs.map(([,,correct],i)=>`o:${id}:${i}:${correct}`)));

function catalog(rollups:DailyRollup[]):Def[]{
 const defs:Def[]=[];const T=TRACKING_START;
 const keysOf=(get:(r:DailyRollup)=>Record<string,unknown>|undefined)=>{const k=new Set<string>();for(const r of rollups)for(const x of Object.keys(get(r)||{}))k.add(x);return [...k].sort();};

 // Audience (Players tab, Overview tiles).
 defs.push(
  {section:'audience',metric:'players_per_day',label:'Players (unique visitors that day)',unit:'players',agg:'avg',firstSession:true,since:T,source:'rollup.visitors',
   how:'Distinct anonymous visitors in the Pacific day (one-way daily hash; the salt is deleted every night, so days cannot be linked). Over a span: the average of complete days (today left out), from the first day with a session.',value:x=>x.r.visitors},
  {section:'audience',metric:'sessions',label:'Sessions',unit:'sessions',agg:'sum',firstSession:true,since:T,source:'rollup.sessions',how:'Tab sessions that started in the Pacific day.',value:x=>x.r.sessions},
  {section:'audience',metric:'pageviews',label:'Page views',unit:'views',agg:'sum',firstSession:true,since:T,source:'rollup.pageviews',how:'Page views of the day’s sessions.',value:x=>x.r.pageviews},
  {section:'audience',metric:'bounce_rate',label:'Bounce rate',unit:'share',agg:'ratio',firstSession:true,since:T,source:'rollup.bounces / rollup.sessions',how:'Sessions with at most one page and under 10 s of foreground time, as a share of sessions.',num:x=>x.r.bounces,den:x=>x.r.sessions},
  {section:'audience',metric:'session_minutes',label:'Session minutes (total)',unit:'minutes',agg:'sum',firstSession:true,since:T,source:'rollup.engagedMs',how:'Foreground minutes of the day’s sessions (hidden tabs and 10+ idle minutes do not count).',value:x=>x.r.engagedMs/MIN},
  {section:'audience',metric:'avg_session_minutes',label:'Average session',unit:'minutes',agg:'ratio',firstSession:true,since:T,source:'rollup.engagedMs / rollup.sessions',how:'Foreground minutes ÷ sessions (exact; the Overview’s “Avg session”).',num:x=>x.r.engagedMs,den:x=>x.r.sessions,scale:1/MIN},
  {section:'audience',metric:'minutes_per_player',label:'Minutes per player',unit:'minutes',agg:'ratio',firstSession:true,since:T,source:'rollup.engagedMs / rollup.visitors',how:'Foreground minutes ÷ unique visitors of the day (over a span: ÷ visitor-days).',num:x=>x.r.engagedMs,den:x=>x.r.visitors,scale:1/MIN},
 );
 const DIM_HOW:Record<string,string>={country:'country from the network (2 letters)',region:'country-state/province',source:'direct / search / social / referral / campaign',referrer:'the linking site’s host',campaign:'utm campaign · source / medium',device:'phone / tablet / desktop',entry:'the first page of the session'};
 for(const dim of DIMS)for(const k of keysOf(r=>r.dims?.[dim]))defs.push({section:'audience',metric:'sessions_by_'+dim,part:k,label:`Sessions by ${dim}: ${k}`,unit:'sessions',agg:'sum',firstSession:true,since:T,source:`rollup.dims.${dim}`,
  how:`Sessions by ${DIM_HOW[dim]}. Each day keeps its top ${dim==='region'?1000:100} keys.`,value:x=>x.r.dims?.[dim]?.[k]?.s||0});

 // Engagement: the Overview cards and their parts, from the same definitions (sponsor.ts SPONSOR_DEFS). Exact.
 for(const d of SPONSOR_DEFS){
  if(d.minutes){defs.push({section:'engagement',metric:d.id,label:d.label,unit:d.unit,agg:'sum',since:'2026-10-08',need:'activityMs',source:'rollup.activityMs.book',how:d.how,value:x=>add(x.r.activityMs as Record<string,number>,'book')/MIN});continue;}
  const all=(k:string)=>d.parts.some(p=>p.test(k)),sn=sinceOfTest(all)||{since:T,full:T};
  defs.push({section:'engagement',metric:d.id,label:d.label,unit:d.unit,agg:'sum',since:sn.since,full:sn.full,need:'counts',source:partSource(all),how:d.how+(d.gap?' '+d.gap:''),value:x=>sumIds(x.c,all)});
  if(d.parts.length>1)for(const p of d.parts){const ps=sinceOfTest(p.test)||sn;
   defs.push({section:'engagement',metric:d.id,part:p.key,label:`${d.label}: ${p.label}`,unit:d.unit,agg:'sum',since:ps.since,full:ps.full,need:'counts',source:partSource(p.test),how:`${p.label} (part of “${d.label}”).`,value:x=>sumIds(x.c,p.test)});}
 }
 for(const k of keysOf(r=>r.counts).filter(k=>ENGAGE_CARD_NUMBER_RE.test(k)))
  defs.push({section:'engagement',metric:'cards_by_number',part:k.slice('en:cardn_'.length),label:`Card #${k.slice(9)} found`,unit:'cards',agg:'sum',since:'2026-10-20',need:'counts',source:k,how:'Times this binder card number joined a binder (new cards only).',value:x=>add(x.c,k)});
 // Kit (designs saved and purchases), exact.
 for(const [kind,label] of [['jersey','Jersey'],['boots','Boots'],['ball','Ball']] as const){
  defs.push({section:'kit',metric:'designs_saved',part:kind,label:`${label} designs saved`,unit:'designs',agg:'sum',since:introducedOn('sh:save_'+kind)||T,need:'counts',source:'sh:save_'+kind,how:`A ${kind} design saved to a slot in the Kit Shop studio (re-saving counts again).`,value:x=>add(x.c,'sh:save_'+kind)});
  defs.push({section:'kit',metric:'purchases',part:kind,label:`${label} bought`,unit:'purchases',agg:'sum',since:introducedOn('sh:buy_'+kind)||T,need:'counts',source:'sh:buy_'+kind,how:`A ${kind} bought with coins in the Kit Shop.`,value:x=>add(x.c,'sh:buy_'+kind)});
 }

 // Where time goes: areas (the dashboard's "Where they spend time"), activities and island places.
 for(const a of AREAS)defs.push({section:'time',metric:'area_minutes',part:a,label:`Minutes: ${a}`,unit:'minutes',agg:'sum',since:T,source:`rollup.areaMs.${a}`,how:`Foreground minutes in the ${a} area (by page / mode; the “Where they spend time” chart).`,value:x=>add(x.r.areaMs as Record<string,number>,a)/MIN});
 for(const [a,label] of ACTIVITIES)defs.push({section:'time',metric:'activity_minutes',part:a,label:`Minutes: ${label}`,unit:'minutes',agg:'sum',since:a==='kit_shop'||a==='kit_studio'?'2026-10-16':'2026-10-08',need:'activityMs',source:`rollup.activityMs.${a}`,how:`Foreground minutes doing: ${label}.`,value:x=>add(x.r.activityMs as Record<string,number>,a)/MIN});
 for(const [p,label] of PLACES)defs.push({section:'time',metric:'place_minutes',part:p,label:`Minutes at ${label}`,unit:'minutes',agg:'sum',since:p.startsWith('summit_')?'2026-10-15':'2026-10-08',need:'placeMs',source:`rollup.placeMs.${p}`,how:`Foreground minutes at ${label} (island play time, idle excluded).`,value:x=>add(x.r.placeMs as Record<string,number>,p)/MIN});
 const LEARN_ACTS=ACTIVITIES.map(a=>a[0]).filter(a=>a==='lesson'||a==='quiz'||a==='paths'||a==='museum_hall'||a.startsWith('exhibit_'));
 const actSum=(x:X,ids:readonly string[])=>ids.reduce((n,a)=>n+add(x.r.activityMs as Record<string,number>,a),0);
 const ARCADE_ACTS=ACTIVITIES.map(a=>a[0]).filter(a=>a.startsWith('arcade_'));
 defs.push(
  {section:'time',metric:'where_time_goes',part:'island',label:'Where time goes: the island',unit:'minutes',agg:'sum',since:T,source:'rollup.areaMs.island',how:'Foreground minutes on the island (/play). Matches, fishing, friends and island lessons below are INSIDE this time: the parts overlap, they are not a split.',value:x=>add(x.r.areaMs as Record<string,number>,'island')/MIN},
  {section:'time',metric:'where_time_goes',part:'matches',label:'Where time goes: live matches',unit:'minutes',agg:'sum',since:'2026-11-05',need:'counts',source:'lm:<format>_min, lm:<format>_sec',how:'Minutes playing live matches (60·min + sec over every format, exact to the second; on the island).',value:x=>LIVE_MATCH_FORMATS.reduce((n,f)=>n+lmSeconds(x.c,f),0)/60},
  {section:'time',metric:'where_time_goes',part:'fishing',label:'Where time goes: fishing',unit:'minutes',agg:'sum',since:'2026-10-08',need:'activityMs',source:'rollup.activityMs.fishing',how:'Foreground minutes in the fishing activity (on the island).',value:x=>add(x.r.activityMs as Record<string,number>,'fishing')/MIN},
  {section:'time',metric:'where_time_goes',part:'arcade',label:'Where time goes: arcade',unit:'minutes',agg:'sum',since:T,source:'rollup.areaMs.arcade',how:'Foreground minutes in the arcade (/arcade: the lobby and the five games).',value:x=>add(x.r.areaMs as Record<string,number>,'arcade')/MIN},
  {section:'time',metric:'where_time_goes',part:'arcade_games',label:'Where time goes: arcade games only',unit:'minutes',agg:'sum',since:'2026-10-08',need:'activityMs',source:ARCADE_ACTS.map(a=>'activityMs.'+a).join(' + '),how:'Foreground minutes inside the five arcade games (the lobby left out).',value:x=>actSum(x,ARCADE_ACTS.filter(a=>a!=='arcade_lobby'))/MIN},
  {section:'time',metric:'where_time_goes',part:'learning',label:'Where time goes: learning',unit:'minutes',agg:'sum',since:'2026-10-08',need:'activityMs',source:LEARN_ACTS.map(a=>'activityMs.'+a).join(' + '),how:'Foreground minutes watching a lesson, in a quiz, on Paths, and in the History Museum (hall and exhibits).',value:x=>actSum(x,LEARN_ACTS)/MIN},
  {section:'time',metric:'where_time_goes',part:'friends',label:'Where time goes: with friends',unit:'minutes',agg:'sum',since:introducedOn('mp:min')||'2026-10-22',need:'counts',source:'mp:min',how:'Whole foreground minutes in a live Play with friends party (each device counts its own completed minutes).',value:x=>add(x.c,'mp:min')},
 );

 // Learning: lesson stages (totals and per lesson with data) and first tries.
 for(const [st,label] of LESSON_STAGES){const re=new RegExp(`^${st}:[A-Za-z0-9_]+$`);
  defs.push({section:'learning',metric:'stage_total',part:st,label:`Lessons: ${label}`,unit:'events',agg:'sum',since:'2026-10-08',need:'counts',source:`${st}:<lesson>`,how:`${label}, every lesson added up (replays count again).`,value:x=>sumIds(x.c,k=>re.test(k))});
  for(const k of keysOf(r=>r.counts).filter(k=>re.test(k)))defs.push({section:'learning',metric:'lesson_'+st,part:k.slice(3),label:`${label}: ${k.slice(3)}`,unit:'events',agg:'sum',since:'2026-10-08',need:'counts',source:k,how:`${label} for this lesson.`,value:x=>add(x.c,k)});
 }
 defs.push(
  {section:'learning',metric:'first_try',part:'tries',label:'Quiz questions answered (first try)',unit:'answers',agg:'sum',since:'2026-10-08',need:'counts',source:'q:<lesson>:<question>',how:'First attempts at a quiz question, every question added up (the Learning tab only uses questions with 5+ sessions; this is all of them).',value:x=>sumIds(x.c,k=>k.startsWith('q:'))},
  {section:'learning',metric:'first_try',part:'right',label:'Quiz questions right first try',unit:'answers',agg:'sum',since:'2026-10-08',need:'counts',source:'o:<lesson>:<question>:<correct option>',how:'First attempts that chose the correct option.',value:x=>{const ok=correctIds();return sumIds(x.c,k=>k.startsWith('o:')&&ok.has(k));}},
  {section:'learning',metric:'first_try',part:'share',label:'First-try answers right',unit:'share',agg:'ratio',since:'2026-10-08',need:'counts',source:'o:<correct> / q:*',how:'Right first try ÷ first tries.',num:x=>{const ok=correctIds();return sumIds(x.c,k=>k.startsWith('o:')&&ok.has(k));},den:x=>sumIds(x.c,k=>k.startsWith('q:'))},
 );

 // Live matches, per format and all formats (exact).
 const lmS=(id:string)=>introducedOn(id)||'2026-11-05';
 for(const f of [...LIVE_MATCH_FORMATS,'all' as const]){
  const fs:readonly LiveMatchFormat[]=f==='all'?LIVE_MATCH_FORMATS:[f],L=f==='all'?'all formats':LM_FORMAT_LABEL[f],ev=(e:string)=>(x:X)=>fs.reduce((n,g)=>n+add(x.c,lmId(g,e)),0);
  const src=(e:string)=>f==='all'?`lm:<format>_${e}`:lmId(f,e),since=lmS(lmId(fs[0],'visit'));
  defs.push(
   {section:'live_matches',metric:'pitch_visits',part:f,label:`Pitch visits: ${L}`,unit:'visits',agg:'sum',since,need:'counts',source:src('visit'),how:'The Learn + Play bar appeared at the pitch (once per visit; a step-off under 60 s is the same visit).',value:ev('visit')},
   {section:'live_matches',metric:'joins',part:f,label:`Matches joined: ${L}`,unit:'matches',agg:'sum',since,need:'counts',source:src('join'),how:'Start pressed and a slot taken (a rejoin counts again).',value:ev('join')},
   {section:'live_matches',metric:'leaves',part:f,label:`Matches finished: ${L}`,unit:'matches',agg:'sum',since,need:'counts',source:src('leave'),how:'Matches left (Leave/Esc, pulled off, or the tab closed): the matches whose time is counted.',value:ev('leave')},
   {section:'live_matches',metric:'match_seconds',part:f,label:`Match time: ${L}`,unit:'seconds',agg:'sum',since,need:'counts',source:`${src('min')} ×60 + ${src('sec')}`,how:'Foreground seconds in a match (exact to the second, capped at 2 h a match).',value:x=>fs.reduce((n,g)=>n+lmSeconds(x.c,g),0)},
   {section:'live_matches',metric:'avg_match_seconds',part:f,label:`Average match: ${L}`,unit:'seconds',agg:'ratio',since,need:'counts',source:'match_seconds / leaves',how:'Match seconds ÷ finished matches.',num:x=>fs.reduce((n,g)=>n+lmSeconds(x.c,g),0),den:ev('leave')},
   // Nov 6 2026 (countIds.ts LM_MATCH_EVENTS): goals while on, replays, slots at the join. Exact, from their own first day.
   ...([['goals','goal_for+goal_against','Goals while on','goals','Goals in the match while the player was on (both sides).'],['goals_for','goal_for','Goals for the player’s side','goals','Goals for the player’s side while they were on.'],
    ['goals_against','goal_against','Goals against the player’s side','goals','Goals against the player’s side while they were on.'],['replays','replay','Goal replays shown','replays','Goal replays that started on the player’s screen.'],
    ['replay_skips','replay_skip','Goal replays skipped','replays','Goal replays the player skipped (Skip, a tap or a key).'],['bot_slots','slots_bot','AI players at the join (slots)','slots','AI players on the match when the player joined, summed over joins (÷ joins = per match).'],
    ['human_slots','slots_human','Humans at the join (slots)','slots','Humans on the match when the player joined (them included), summed over joins.']] as const).map(([metric,evs,label,unit,how]):Def=>{
     const es=evs.split('+'),g=(x:X)=>es.reduce((n,e)=>n+ev(e)(x),0);
     return {section:'live_matches',metric,part:f,label:`${label}: ${L}`,unit,agg:'sum',since:lmS(lmId(fs[0],es[0])),need:'counts',source:es.map(src).join(' + '),how,value:g};}),
   {section:'live_matches',metric:'players',part:f,label:`Players (sessions that joined): ${L}`,unit:'sessions',agg:'sum',since,need:'counts',source:f==='all'?'sessions with lm:reach_1':`sessions with ${lmId(f,'join')}`,how:'Tab sessions that joined at least once (a tab session is the only unit; not people). Over days: session-days.',value:x=>f==='all'?add(x.s,'lm:reach_1'):add(x.s,lmId(f,'join'))},
  );
 }

 // Fishing funnel (exact, the fi: ids of Nov 6 2026 and the older ones).
 for(const [st,label] of [['start','Fish tapped'],['cast','Cast'],['bite','Bite'],['hook_spin','Hooked'],['land','Landed']] as const){
  const id='fi:'+st,since=introducedOn(id)||T;
  defs.push({section:'fishing',metric:'funnel_sessions',part:st,label:`Fishing funnel (sessions): ${label}`,unit:'sessions',agg:'sum',since,need:'counts',source:`sessions with ${id}`,how:`Tab sessions that reached “${label}” at least once (over days: session-days).`,value:x=>add(x.s,id)},
   {section:'fishing',metric:'funnel_events',part:st,label:`Fishing funnel (events): ${label}`,unit:'events',agg:'sum',since,need:'counts',source:id,how:`Times “${label}” happened.`,value:x=>add(x.c,id)});
 }

 // Marketing: the tour page `/` (mk:) and the investor page /marketing (mm:), exact.
 const PLAY_TAPS=MK_CLICKS.filter(c=>c[1]==='Play').map(c=>'mk:c_'+c[0]),mkS=introducedOn('mk:view')||'2026-11-03',mmS=introducedOn('mm:view')||'2026-11-05';
 defs.push(
  {section:'marketing',metric:'tour_views',label:'Tour page views (/)',unit:'views',agg:'sum',since:mkS,need:'counts',source:'mk:view',how:'Views of the tour page at `/`.',value:x=>add(x.c,'mk:view')},
  {section:'marketing',metric:'tour_sessions',label:'Tour page sessions (/)',unit:'sessions',agg:'sum',since:mkS,need:'counts',source:'sessions with mk:view',how:'Tab sessions that viewed the tour page.',value:x=>add(x.s,'mk:view')},
  {section:'marketing',metric:'tour_avg_seconds',label:'Tour page: average time per view',unit:'seconds',agg:'ratio',since:mkS,need:'counts',source:'(10·mk:sec10 + mk:sec1) / mk:view',how:'Foreground seconds on the page ÷ views.',num:x=>10*add(x.c,'mk:sec10')+add(x.c,'mk:sec1'),den:x=>add(x.c,'mk:view')},
  {section:'marketing',metric:'tour_play_sessions',label:'Tour page: sessions that tapped Play',unit:'sessions',agg:'sum',since:mkS,need:'counts',source:'sessions with mk:play',how:'Tab sessions that tapped a Play button on `/`.',value:x=>add(x.s,'mk:play')},
  {section:'marketing',metric:'tour_play_taps',label:'Tour page: Play taps',unit:'taps',agg:'sum',since:mkS,need:'counts',source:PLAY_TAPS.join(' + '),how:'Every Play tap on `/`.',value:x=>PLAY_TAPS.reduce((n,id)=>n+add(x.c,id),0)},
  {section:'marketing',metric:'tour_reached_play',label:'Tour page: arrived at /play',unit:'sessions',agg:'sum',since:mkS,need:'counts',source:'sessions with mk:reached',how:'Tabs that tapped Play on `/` and arrived at /play.',value:x=>add(x.s,'mk:reached')},
  {section:'marketing',metric:'tour_played',label:'Tour page: then played',unit:'sessions',agg:'sum',since:mkS,need:'counts',source:'sessions with mk:played',how:'Of those, the tabs that then actually played.',value:x=>add(x.s,'mk:played')},
  {section:'marketing',metric:'investor_visits',label:'Investor page visits (/marketing)',unit:'visits',agg:'sum',since:mmS,need:'counts',source:'mm:view',how:'Views of the unlisted /marketing page.',value:x=>add(x.c,'mm:view')},
  {section:'marketing',metric:'investor_stay_seconds',label:'Investor page: stay (total)',unit:'seconds',agg:'sum',since:mmS,need:'counts',source:'60·mm:min + 10·mm:sec10 + mm:sec1',how:'Foreground seconds on /marketing (exact, capped at 30 min a view).',value:x=>mmSeconds(x.c)},
  {section:'marketing',metric:'investor_avg_stay_seconds',label:'Investor page: average stay',unit:'seconds',agg:'ratio',since:mmS,need:'counts',source:'stay seconds / mm:view',how:'Stay seconds ÷ visits.',num:x=>mmSeconds(x.c),den:x=>add(x.c,'mm:view')},
 );
 for(const k of keysOf(r=>r.counts)){const g=/^mm:g_(.+)$/.exec(k)?.[1];if(!g||!isGeo(g))continue;
  defs.push({section:'marketing',metric:'investor_visits_by_place',part:g,label:`Investor page visits from ${g}`,unit:'visits',agg:'sum',since:'2026-11-05',need:'counts',source:k,how:'Visits by US state (us_<state>), US without a state (us), other country (o_<country>) or unknown (other), from the request’s network headers.',value:x=>add(x.c,k)},
   {section:'marketing',metric:'investor_stay_seconds_by_place',part:g,label:`Investor page stay from ${g}`,unit:'seconds',agg:'sum',since:'2026-11-05',need:'counts',source:`60·mm:gm_${g} + 10·mm:gx_${g}`,how:'Stay seconds from that place (±5 s per beat).',value:x=>60*add(x.c,'mm:gm_'+g)+10*add(x.c,'mm:gx_'+g)});}

 // Every fixed counter, raw: its total and the sessions that carried it (so a new counter always shows up here).
 for(const id of FIXED_COUNT_IDS){const since=INTRO.get(id)||TRACKING_START,label=counterLabel(id);
  defs.push({section:'counters',metric:id,part:'total',label:`${label} (total)`,unit:'events',agg:'sum',since,need:'counts',source:id,how:`Sum of ${id} over the day’s sessions.`,value:x=>add(x.c,id)},
   {section:'counters',metric:id,part:'sessions',label:`${label} (sessions)`,unit:'sessions',agg:'sum',since,need:'counts',source:`sessions with ${id}`,how:`Tab sessions that sent ${id} at least once (over days: session-days).`,value:x=>add(x.s,id)});}
 return defs;
}
/** The fixed ids a test accepts (and dynamic families), for the Definitions sheet. */
function partSource(test:(id:string)=>boolean):string{
 const ids=FIXED_COUNT_IDS.filter(test),fam=DYNAMIC_FAMILIES.filter(f=>test(f.sample)).map(f=>f.family);
 return [...(ids.length>8?[`${ids.length} ids: ${ids.slice(0,6).join(', ')}, …`]:ids),...fam].join(' + ');
}

export type BuildInput={rollups:DailyRollup[];from:string;to:string;today:string;mode?:TimeZoneMode;
 /** store.hourly(day) for raw-retained days of the range (optional: without it the hour-of-day panel says so). */
 hourly?:{day:string;points:Point[]}[];
 /** Per-day people from the proposed SQL (optional). */people?:PeopleDay[]|null};

/**
 * Builds the layer. `rollups`: every day from the first day you want considered (ideally TRACKING_START, so trackedSince and
 * previous periods can look back) to `to`, one per day (report.ts loadRollups / loadRangeMerged give exactly that).
 */
export function buildDailyLayer({rollups,from,to,today,mode='pacific',hourly=[],people=null}:BuildInput):DailyLayer{
 const byDay=new Map(rollups.map(r=>[r.day,r]));
 const loaded=[...byDay.keys()].sort(),loadedFrom=loaded[0]??from;
 const days=dayList(from,to),allDays=dayList(loadedFrom<from?loadedFrom:from,to);
 const firstSession=loaded.find(d=>(byDay.get(d)?.sessions||0)>0)??null;
 const series:DailySeries[]=[];
 for(const d of catalog(days.map(x=>byDay.get(x)).filter((r):r is DailyRollup=>!!r))){
  const at=(day:string):DailyPoint=>{
   const r=byDay.get(day);const p:DailyPoint={day,value:null};if(day===today)p.partial=true;
   if(!r||(d.need&&r[d.need]===undefined))return p;if(r.tz==='UTC')p.utcDay=true;
   const x={r,c:r.counts||{},s:r.countSessions||{}};
   if(d.agg==='ratio'){const num=d.num!(x),den=d.den!(x);p.num=num;p.den=den;p.value=den?num/den*(d.scale??1):null;}
   else p.value=d.value!(x);
   return p;};
  const raw=allDays.map(at);
  // trackedSince: the introduction day, or the first day with data when that is earlier; never before tracking began.
  let since=d.since,sinceFrom:DailySeries['sinceFrom']=d.since===TRACKING_START?'tracking-start':'introduced';
  if(d.firstSession){since=firstSession??d.since;sinceFrom=firstSession?'first-session':'tracking-start';}
  else{const first=raw.find(p=>(p.value??0)>0||(p.num??0)>0)?.day;if(first&&first<since){since=first;sinceFrom='first-data';}}
  // Nothing is tracked before the first day with any session (the store's real start), whatever the code's history says.
  if(firstSession&&since<firstSession){since=firstSession;sinceFrom='first-session';}
  if(since<TRACKING_START)since=TRACKING_START;
  for(const p of raw)if(p.day<since){p.value=null;delete p.num;delete p.den;}
  const tracked=raw.some(p=>p.value!==null||p.den!==undefined);
  series.push({key:[d.section,d.metric,d.part].filter(Boolean).join('.'),section:d.section,metric:d.metric,part:d.part??'',label:d.label,unit:d.unit,agg:d.agg,...(d.scale?{scale:d.scale}:{}),how:d.how,source:d.source,
   trackedSince:tracked||since<=to?since:null,fullSince:d.full&&d.full>since?d.full:null,sinceFrom,
   points:raw.filter(p=>p.day>=from),prior:raw.filter(p=>p.day<from)});
 }
 if(people&&people.length){const pd=new Map(people.map(p=>[p.day,p]));
  const ps=(metric:string,label:string,unit:string,agg:Agg,how:string,f:(p:PeopleDay)=>{value?:number;num?:number;den?:number}):DailySeries=>{
   const pt=(day:string):DailyPoint=>{const p=pd.get(day),o:DailyPoint={day,value:null};if(day===today)o.partial=true;if(!p)return o;const v=f(p);
    if(agg==='ratio'){o.num=v.num!;o.den=v.den!;o.value=v.den?v.num!/v.den:null;}else o.value=v.value!;return o;};
   const first=people.map(p=>p.day).sort()[0];
   return {key:'people.'+metric,section:'people',metric,part:'',label,unit,agg,how:how+' Raw rows: the last 14 days only.',source:'analytics_daily_people (proposed SQL)',trackedSince:first,fullSince:null,sinceFrom:'first-data',
    points:days.map(pt),prior:allDays.filter(d=>d<from).map(pt)};};
  series.push(ps('players_distinct','Players (distinct player ids)','players','avg','Distinct anonymous player ids (save code, else device) with a session that day; sessions without an id left out.',p=>({value:p.players})),
   ps('returning_share','Returning sessions','share','ratio','Sessions from a device that had played before ÷ sessions that sent the mark (unknown left out).',p=>({num:p.returning,den:p.returning+p.fresh})),
   ps('returning_sessions','Returning sessions (count)','sessions','sum','Sessions marked returning.',p=>({value:p.returning})),
   ps('new_sessions','New sessions (count)','sessions','sum','Sessions marked new (first visit on the device).',p=>({value:p.fresh})));
 }
 return {version:1,from,to,today,timeZone:mode==='utc'?'UTC':'America/Los_Angeles',partialDay:days[days.length-1]===today?today:null,days,
  utcDays:days.filter(d=>byDay.get(d)?.tz==='UTC'),loadedFrom,series,hours:hourAggregates(days,byDay,hourly),gaps:trackingGaps(!!(people&&people.length)),notExported:[...NOT_EXPORTED]};
}

// ---- hour of day ----------------------------------------------------------------------------------------------------
const PT_HOUR=new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',hour:'numeric',hourCycle:'h23'});
function hourAggregates(days:string[],byDay:Map<string,DailyRollup>,hourly:{day:string;points:Point[]}[]):HourAggregates{
 const inRange=new Set(days),rows:HourRow[]=Array.from({length:24},(_,hour)=>({hour,sessions:0,visitors:0,pageviews:0})),used:string[]=[];
 for(const h of hourly){if(!inRange.has(h.day))continue;used.push(h.day);
  for(const p of h.points){const hr=p.key.length>13?Number(PT_HOUR.format(new Date(p.key))):Number(p.key.slice(11,13));const row=rows[hr%24];row.sessions+=p.sessions;row.visitors+=p.visitors;row.pageviews+=p.pageviews;}}
 const grid=WEEKDAYS.map((_,dow)=>Array.from({length:24},(_,h)=>days.reduce((n,d)=>n+(byDay.get(d)?.counts?.[hourId(dow,h)]||0),0)));
 const hours=Array.from({length:24},(_,h)=>grid.reduce((a,r)=>a+r[h],0));
 return {sessions:{status:used.length?'ok':'none',days:used.sort(),hours:rows,
   note:used.length?'Session starts by Pacific hour, summed over the raw-retained days of the range (visitors: unique per hour per day, added up). A 25-hour DST day puts both 1 am hours in hour 1.':'No raw-retained day in this range: hours exist only for the last 14 days (older days are frozen day totals).'},
  investor:{weekdays:WEEKDAYS,grid,hours,total:hours.reduce((a,x)=>a+x,0),note:'Investor page visits by Pacific weekday × hour of the first beat (mm:h_ ids, added by the server).'},
  note:'Only session starts (raw rows, last 14 days) and the investor page have a time of day. Every other counter is a day total: no hour-of-day for them.'};
}

// ---- tracking gaps --------------------------------------------------------------------------------------------------
function trackingGaps(havePeople:boolean):TrackingGap[]{
 const SQL='docs/analytics-proposed/analytics_daily_people.sql (proposed, not applied)';
 return [
  ...(havePeople?[]:[
   {metric:'Players (distinct player ids) per day',why:'The rollups keep unique VISITORS per day (daily hash); distinct player ids per day live only in raw rows (14 days) and no SQL returns them per day.',fix:SQL},
   {metric:'Returning / new sessions per day',why:'is_returning is on raw session rows only; analytics_sources_summary returns one range total (and hides values under 3).',fix:SQL}]),
  {metric:'Cohorts / retention D1, D7',why:'Days cannot be linked in the rollups (the salt is deleted nightly). Player ids link days only inside the 14-day raw window.',fix:SQL+': D1/D7 for cohorts that started inside the window (first-seen is approximate: a player seen before the window looks new).'},
  {metric:'Cohorts / retention D30',why:'Raw rows are kept 14 days, so nothing can link a player 30 days apart.',fix:'Owner + policy decision: keep a per-player first-seen / last-seen day beyond 14 days (a new table and migration), or accept D1/D7 only.'},
  {metric:'Live matches: per-person matches; goals, replays and slots before Nov 6 2026',why:'Tab sessions are the only unit in the rollups. Goals, replays and AI / human slots (lm:<f>_goal_for … _slots_human) started Nov 6 2026.',fix:'Per person: the keyed player id joined to match play (legal sign-off, like party retention). Earlier days: not recoverable.'},
  {metric:'Live matches before Nov 5 2026',why:'The lm: ids started Nov 5 (LM_SINCE).',fix:'None (not recoverable).'},
  {metric:'Hour of day for counters',why:'Beats are rolled up per day; only session starts (raw, 14 days) and investor-page visits (mm:h_) keep an hour.',fix:'Per-hour rollups would need a new rollup table and migration.'},
  {metric:'Median session length per day',why:'Estimated inside length buckets (core.ts histMedianMs); not a daily series here (medians cannot be added).',fix:'The range median stays in the summary; a daily median could be added from rollup.hist if wanted.'},
  {metric:'Party retention by day',why:'analytics_party_retention runs on UTC "today" (audit, not fixed) and is a range report.',fix:'New migration (audit item).'},
 ];
}

// ---- helpers for charts and the export ------------------------------------------------------------------------------------
export const seriesByKey=(layer:DailyLayer,key:string)=>layer.series.find(s=>s.key===key)??null;
