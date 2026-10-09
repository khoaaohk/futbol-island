/**
 * Admin analytics, pure core (Oct 7 2026). No I/O, no Node or browser APIs, so tests/admin-analytics.cjs can load it in a vm.
 *
 * Privacy contract (a kids' game, COPPA/GDPR-K minded):
 *  - no cookies or persistent ids on players' devices; the only id is a per-tab random session id in sessionStorage;
 *  - unique visitors are a salted hash (daily rotating server salt + IP + UA + host) computed on the server; the IP and UA
 *    are never stored, and the salt is deleted after a day, so a visitor cannot be followed across days;
 *  - location is country (+ region) from Vercel's geo headers, never city or coordinates;
 *  - the source is the referrer HOST plus utm_source/medium/campaign, never a full URL;
 *  - paths are mapped onto a fixed allowlist, so nothing free-form a visitor types is ever stored.
 *
 * Write path (scaling review, Oct 7 2026): append-only. A tab sends one `start` when its session begins and a few `beat`s
 * (foreground time, area split and page-view count since the last beat) on hide/pagehide plus a jittered ~3 min safety
 * ping, so ~3–6 writes per session. Nothing is read-modify-written; sessions are assembled when aggregating.
 *
 * Where on the island (Oct 8 2026, supabase/migrations/20261008_analytics_places.sql): a beat may also carry ms per named place
 * (`pl`), ms per activity (`ac`) and seconds per 20 m heat-map cell (`c`), all fixed ids from islandIds.ts. Totals only.
 *
 * Learning (Oct 9 2026, supabase/migrations/20261009_analytics_counts.sql): a beat may carry learning counters (`k`, fixed ids
 * from countIds.ts: lesson funnel stages, first-try answer indices, walkthrough steps…) and a start may carry coarse flags
 * (`f`: progress band, graduations band, settings bits, coach voice). The day's rollup adds `counts` (sums), `countSessions`
 * (sessions with each id ≥ 1, which makes funnels work without any per-session id) and `flags` (sessions per flag value).
 */
import {ACTIVITY_IDS,CELL_COUNT,MAX_BEAT_CELLS,PLACE_IDS,type ActivityId,type PlaceId} from './islandIds';
import type {LearningReport} from './learning';
import {COUNT_KEY_RE,MAX_BEAT_COUNTS,MAX_COUNT_VALUE,checkFlags,flagTallyKeys,isCountId,type StartFlags} from './countIds';

/** The analytics SQL this code expects: 3 = 20261009_analytics_counts.sql (public.analytics_schema_version()). */
export const SCHEMA_VERSION=3;
export const EVENT_TYPES=['start','beat'] as const;
export type EventType=typeof EVENT_TYPES[number];
/** Raised from 2048 (Oct 8 2026) for the place/activity/cell split: a worst-case beat (every place, every activity and 64
 *  cells) is ~3 KB; a typical one is 300–700 bytes. Unchanged for the learning counters (Oct 9 2026): the tracker fits `k`
 *  under its BEACON_BUDGET (4000 B) and carries the rest to the next beat, so no beat it sends is ever over this. */
export const MAX_BODY_BYTES=4096;
/** Most foreground time one beat can carry (the client's safety ping is ≤3.6 min apart while visible). */
export const MAX_EVENT_ENGAGED_MS=300_000;
export const MAX_BEAT_PAGEVIEWS=100;
/** Raw sessions/beats are kept this long; daily rollups are kept for good. */
export const RETENTION_DAYS=14;
/** "On now": any event from the tab in the last 5 minutes. */
export const LIVE_WINDOW_MS=300_000;
/** Abuse caps, enforced in SQL too: sessions one visitor hash can open per day, beats per session, beat window. */
// A school's iPads behind one NAT share a hash (same IP, same UA), so the per-hash cap is generous.
export const SESSION_CAP_PER_VISITOR_DAY=150;
export const BEAT_CAP_PER_SESSION=300;
export const BEAT_WINDOW_MS=24*3_600_000;
/** A session's foreground time never exceeds (last beat − start) + this slack. */
export const ENGAGED_SLACK_MS=60_000;
/** A session that never got past its first page and stayed under this long counts as a bounce. */
export const BOUNCE_MS=10_000;

export const AREAS=['island','paths','arcade','museum','konbini','controller','other'] as const;
export type Area=typeof AREAS[number];
/** The only paths that are stored. Anything else becomes "/other". */
export const KNOWN_PATHS=['/','/arcade','/museum','/konbini','/controller','/coffee'] as const;

export type Utm={source?:string;medium?:string;campaign?:string};
export type SourceClass='direct'|'search'|'social'|'referral'|'campaign';
export type Device='phone'|'tablet'|'desktop';

/** What the browser sends. Everything is optional except t/s/p; the server derives the rest. */
export type RawEvent={v?:number;t:EventType;s:string;p:string;r?:string;u?:Utm;e?:number;a?:Record<string,number>;n?:number;tp?:number;
 pl?:Record<string,number>;ac?:Record<string,number>;c?:Record<string,number>;
 /** Oct 9 2026: learning counters (beats) and start flags (starts). */
 k?:Record<string,number>;f?:StartFlags};
/** Seconds per heat-map cell (key = cell index as a string). */
export type CellMap=Record<string,number>;

/** What reaches the store: no IP, no user agent, no full URL. */
export type CleanEvent={
 type:EventType;session:string;path:string;day:string;visitorHash:string;
 country:string|null;region:string|null;device:Device;source:SourceClass;referrerHost:string|null;
 utmSource:string|null;utmMedium:string|null;utmCampaign:string|null;
 engagedMs:number;areaMs:Partial<Record<Area,number>>;pageviews:number;
 placeMs:Partial<Record<PlaceId,number>>;activityMs:Partial<Record<ActivityId,number>>;cells:CellMap;
 /** Oct 9 2026: allowlisted learning counters (beats) and start flags (starts); empty objects otherwise. */
 counts:Record<string,number>;flags:StartFlags;
};

const SESSION_RE=/^[A-Za-z0-9_-]{16,32}$/;
const HOST_RE=/^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;
const UTM_RE=/^[a-z0-9][a-z0-9_.+-]{0,59}$/;

export function sanitizePath(raw:unknown):string{
 if(typeof raw!=='string')return '/other';
 const p=raw.split(/[?#]/)[0].toLowerCase().replace(/\/+$/,'')||'/';
 if((KNOWN_PATHS as readonly string[]).includes(p))return p;
 // Sub-routes keep only their known top-level segment (e.g. /coffee/checkout → /coffee).
 const top='/'+(p.split('/')[1]||'');
 return (KNOWN_PATHS as readonly string[]).includes(top)&&top!=='/'?top:'/other';
}

/** The referrer host only: lower-case, no "www.", no port, no path. Our own host means "internal" (null). */
export function sanitizeHost(raw:unknown,ownHost?:string|null):string|null{
 if(typeof raw!=='string'||!raw)return null;
 let h=raw.trim().toLowerCase();
 if(h.includes('/')||h.includes('@')||h.includes(':')){try{h=new URL(h.includes('://')?h:'https://'+h).hostname;}catch{return null;}}
 h=h.replace(/^www\./,'').replace(/\.$/,'');
 if(!HOST_RE.test(h))return null;
 const own=(ownHost||'').toLowerCase().split(':')[0].replace(/^www\./,'');
 if(own&&h===own)return null;
 return h;
}

export function sanitizeUtm(raw:unknown):string|null{
 if(typeof raw!=='string')return null;
 const v=raw.trim().toLowerCase().replace(/\s+/g,'-').slice(0,60);
 return UTM_RE.test(v)?v:null;
}

const SEARCH=[/(^|\.)google\.[a-z.]+$/,/(^|\.)bing\.com$/,/(^|\.)duckduckgo\.com$/,/(^|\.)yahoo\.[a-z.]+$/,/(^|\.)ecosia\.org$/,/(^|\.)baidu\.com$/,/(^|\.)yandex\.[a-z.]+$/,/^search\.brave\.com$/,/(^|\.)kagi\.com$/,/(^|\.)startpage\.com$/,/(^|\.)naver\.com$/,/(^|\.)qwant\.com$/,/(^|\.)kiddle\.co$/];
const SOCIAL=[/(^|\.)facebook\.com$/,/^fb\.(com|me)$/,/(^|\.)instagram\.com$/,/^t\.co$/,/(^|\.)twitter\.com$/,/^x\.com$/,/(^|\.)tiktok\.com$/,/(^|\.)youtube\.com$/,/^youtu\.be$/,/(^|\.)reddit\.com$/,/(^|\.)pinterest\.[a-z.]+$/,/(^|\.)linkedin\.com$/,/^lnkd\.in$/,/(^|\.)whatsapp\.(com|net)$/,/(^|\.)snapchat\.com$/,/(^|\.)discord(app)?\.com$/,/(^|\.)threads\.net$/,/^bsky\.app$/,/(^|\.)telegram\.(org|me)$/,/^t\.me$/,/(^|\.)messenger\.com$/];

export function classifySource(referrerHost:string|null,utm:Utm|null|undefined):SourceClass{
 if(utm&&(utm.source||utm.medium||utm.campaign))return 'campaign';
 if(!referrerHost)return 'direct';
 if(SEARCH.some(re=>re.test(referrerHost)))return 'search';
 if(SOCIAL.some(re=>re.test(referrerHost)))return 'social';
 return 'referral';
}

/** Coarse class from the UA on the server; the UA itself is discarded. `touch` (maxTouchPoints>1) separates iPadOS from a Mac. */
export function deviceClass(ua:string|null|undefined,touch=false):Device{
 const u=ua||'';
 if(/iPad|Tablet|PlayBook|Silk|Kindle|SM-T\d|Nexus (7|9|10)/i.test(u))return 'tablet';
 if(/Android/i.test(u)&&!/Mobile/i.test(u))return 'tablet';
 if(/Macintosh/i.test(u)&&touch)return 'tablet';
 if(/Mobi|iPhone|iPod|Android|Windows Phone/i.test(u))return 'phone';
 return 'desktop';
}

export function isBot(ua:string|null|undefined):boolean{
 const u=ua||'';
 return !u||/bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|monitor|uptime|curl|wget|python|httpclient|go-http|java\/|axios|node-fetch|playwright|puppeteer|phantom/i.test(u);
}

export function sanitizeCountry(raw:string|null|undefined):string|null{const v=(raw||'').toUpperCase();return /^[A-Z]{2}$/.test(v)&&v!=='XX'?v:null;}
export function sanitizeRegion(raw:string|null|undefined):string|null{const v=(raw||'').toUpperCase();return /^[A-Z0-9]{1,3}$/.test(v)?v:null;}

export type Validated={ok:true;event:RawEvent}|{ok:false;reason:string};

/** Strict schema: unknown keys, wrong types and out-of-range numbers are rejected rather than repaired. */
export function validateEvent(body:string):Validated{
 if(typeof body!=='string'||!body)return {ok:false,reason:'empty'};
 if(byteLength(body)>MAX_BODY_BYTES)return {ok:false,reason:'too-large'};
 let o:unknown;try{o=JSON.parse(body);}catch{return {ok:false,reason:'json'};}
 if(!o||typeof o!=='object'||Array.isArray(o))return {ok:false,reason:'shape'};
 const r=o as Record<string,unknown>;
 const allowed=new Set(['v','t','s','p','r','u','e','a','n','tp','pl','ac','c','k','f']);
 for(const k of Object.keys(r))if(!allowed.has(k))return {ok:false,reason:'unknown-key'};
 if(!(EVENT_TYPES as readonly unknown[]).includes(r.t))return {ok:false,reason:'type'};
 if(typeof r.s!=='string'||!SESSION_RE.test(r.s))return {ok:false,reason:'session'};
 if(typeof r.p!=='string'||r.p.length>200||!r.p.startsWith('/'))return {ok:false,reason:'path'};
 if(r.r!==undefined&&(typeof r.r!=='string'||r.r.length>253))return {ok:false,reason:'referrer'};
 if(r.e!==undefined&&(typeof r.e!=='number'||!Number.isFinite(r.e)||r.e<0||r.e>3_600_000))return {ok:false,reason:'engaged'};
 if(r.tp!==undefined&&r.tp!==0&&r.tp!==1)return {ok:false,reason:'touch'};
 if(r.u!==undefined){
  if(!r.u||typeof r.u!=='object'||Array.isArray(r.u))return {ok:false,reason:'utm'};
  for(const [k,v] of Object.entries(r.u as Record<string,unknown>))if(!['source','medium','campaign'].includes(k)||typeof v!=='string'||v.length>100)return {ok:false,reason:'utm'};
 }
 if(r.a!==undefined){
  if(!r.a||typeof r.a!=='object'||Array.isArray(r.a))return {ok:false,reason:'areas'};
  const entries=Object.entries(r.a as Record<string,unknown>);
  if(entries.length>AREAS.length)return {ok:false,reason:'areas'};
  for(const [k,v] of entries)if(!(AREAS as readonly string[]).includes(k)||typeof v!=='number'||!Number.isFinite(v)||v<0||v>3_600_000)return {ok:false,reason:'areas'};
 }
 if(r.n!==undefined&&(typeof r.n!=='number'||!Number.isInteger(r.n)||r.n<0||r.n>MAX_BEAT_PAGEVIEWS))return {ok:false,reason:'pageviews'};
 // Place / activity / cell split: fixed ids only, and no bucket can hold more than the beat's own foreground time.
 const limit=bucketLimitMs(typeof r.e==='number'?r.e:0);
 for(const [key,ids,reason] of [['pl',PLACE_IDS,'places'],['ac',ACTIVITY_IDS,'activities']] as const){
  const o=r[key];if(o===undefined)continue;
  if(!o||typeof o!=='object'||Array.isArray(o))return {ok:false,reason};
  const entries=Object.entries(o as Record<string,unknown>);if(entries.length>ids.length)return {ok:false,reason};
  for(const [k,v] of entries)if(!(ids as readonly string[]).includes(k)||typeof v!=='number'||!Number.isFinite(v)||v<0||v>limit)return {ok:false,reason};
 }
 if(r.c!==undefined){
  if(!r.c||typeof r.c!=='object'||Array.isArray(r.c))return {ok:false,reason:'cells'};
  const entries=Object.entries(r.c as Record<string,unknown>);if(entries.length>MAX_BEAT_CELLS)return {ok:false,reason:'cells'};
  for(const [k,v] of entries)if(!/^(0|[1-9][0-9]{0,3})$/.test(k)||Number(k)>=CELL_COUNT||typeof v!=='number'||!Number.isInteger(v)||v<1||v*1000>limit)return {ok:false,reason:'cells'};
 }
 // Learning counters: an object of ≤ MAX_BEAT_COUNTS well-formed ids, whole numbers 1..MAX_COUNT_VALUE. An id with the right
 // shape that is not (or no longer) on the allowlist is dropped later by clampCounts, never a reason to lose the beat: a tab
 // left open across a content deploy may still name a lesson that was removed.
 if(r.k!==undefined){
  if(!r.k||typeof r.k!=='object'||Array.isArray(r.k))return {ok:false,reason:'counts'};
  const entries=Object.entries(r.k as Record<string,unknown>);if(entries.length>MAX_BEAT_COUNTS)return {ok:false,reason:'counts'};
  for(const [k,v] of entries)if(!COUNT_KEY_RE.test(k)||typeof v!=='number'||!Number.isInteger(v)||v<1||v>MAX_COUNT_VALUE)return {ok:false,reason:'counts'};
 }
 if(r.f!==undefined&&!checkFlags(r.f))return {ok:false,reason:'flags'};
 if(r.t==='start'&&(r.e!==undefined||r.a!==undefined||r.n!==undefined||r.pl!==undefined||r.ac!==undefined||r.c!==undefined||r.k!==undefined))return {ok:false,reason:'start-engaged'};
 if(r.t==='beat'&&(r.r!==undefined||r.u!==undefined||r.f!==undefined))return {ok:false,reason:'beat-source'};
 return {ok:true,event:r as unknown as RawEvent};
}

function byteLength(s:string){let n=0;for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);n+=c<0x80?1:c<0x800?2:c>=0xd800&&c<0xdc00?(i++,4):3;}return n;}

/** Most any one place/activity/cell bucket may claim in a beat: its foreground time + 10% + 5 s (rounding and sample slack). */
export const bucketLimitMs=(e:number)=>Math.max(0,e)*1.1+5000;

/** Scale a split down so it never adds up to more than `total` (ms); unknown ids and non-positive values are dropped. */
export function clampSplit<K extends string>(split:Record<string,number>|undefined,ids:readonly K[],total:number):Partial<Record<K,number>>{
 const entries=Object.entries(split||{}).filter(([k,v])=>(ids as readonly string[]).includes(k)&&typeof v==='number'&&v>0);
 const sum=entries.reduce((n,[,v])=>n+v,0),scale=sum>total&&sum>0?total/sum:1,out:Partial<Record<K,number>>={};
 for(const [k,v] of entries){const n=Math.floor(v*scale);if(n>0)out[k as K]=n;}
 return out;
}
/** Heat-map cells: valid indices only, the busiest MAX_BEAT_CELLS, whole seconds, adding up to at most the beat's time. */
export function clampCells(c:Record<string,number>|undefined,engagedMs:number):CellMap{
 const entries=Object.entries(c||{}).filter(([k,v])=>/^(0|[1-9][0-9]{0,3})$/.test(k)&&Number(k)<CELL_COUNT&&Number.isInteger(v)&&v>0)
  .sort((a,b)=>b[1]-a[1]||Number(a[0])-Number(b[0])).slice(0,MAX_BEAT_CELLS);
 const sum=entries.reduce((n,[,v])=>n+v,0),cap=Math.floor(engagedMs/1000),scale=sum>cap&&sum>0?cap/sum:1,out:CellMap={};
 for(const [k,v] of entries){const n=Math.floor(v*scale);if(n>0)out[k]=n;}
 return out;
}

/** Learning counters: allowlisted ids only (see countIds.ts), whole numbers capped at MAX_COUNT_VALUE, at most MAX_BEAT_COUNTS. */
export function clampCounts(k:Record<string,number>|undefined):Record<string,number>{
 const out:Record<string,number>={};let n=0;
 for(const [id,v] of Object.entries(k||{})){if(n>=MAX_BEAT_COUNTS)break;if(!isCountId(id)||!Number.isInteger(v)||v<1)continue;out[id]=Math.min(v,MAX_COUNT_VALUE);n++;}
 return out;
}

/** Clamp the engaged time and per-area split of one heartbeat. The area total never exceeds the event total. */
export function clampEngaged(e:number|undefined,a:Record<string,number>|undefined):{engagedMs:number;areaMs:Partial<Record<Area,number>>}{
 const engagedMs=Math.round(Math.min(Math.max(e||0,0),MAX_EVENT_ENGAGED_MS));
 const areaMs:Partial<Record<Area,number>>={};
 const entries=Object.entries(a||{}).filter(([k,v])=>(AREAS as readonly string[]).includes(k)&&v>0);
 const sum=entries.reduce((n,[,v])=>n+v,0);
 const scale=sum>engagedMs&&sum>0?engagedMs/sum:1;
 for(const [k,v] of entries)areaMs[k as Area]=Math.round(v*scale);
 return {engagedMs,areaMs};
}

export const utcDay=(d:Date|number|string)=>new Date(d).toISOString().slice(0,10);
export const addDays=(day:string,n:number)=>utcDay(Date.parse(day+'T00:00:00Z')+n*86_400_000);
export function dayList(from:string,to:string):string[]{const out:string[]=[];for(let d=from;d<=to&&out.length<400;d=addDays(d,1))out.push(d);return out;}

// ---------------------------------------------------------------------------------------------------------------------
// Aggregation
// ---------------------------------------------------------------------------------------------------------------------

export type SessionRow={
 id:string;day:string;visitorHash:string;startedAt:string;lastSeenAt:string;engagedMs:number;pageviews:number;entryPath:string;
 country:string|null;region:string|null;device:Device;source:SourceClass;referrerHost:string|null;
 utmSource:string|null;utmMedium:string|null;utmCampaign:string|null;areaMs:Partial<Record<Area,number>>;
 placeMs:Partial<Record<PlaceId,number>>;activityMs:Partial<Record<ActivityId,number>>;cells:CellMap;
 counts:Record<string,number>;flags:StartFlags;
};
/** Append-only rows: one per session start, one per beat. */
export type StartRow={id:string;day:string;visitorHash:string;startedAt:string;entryPath:string;country:string|null;region:string|null;device:Device;source:SourceClass;referrerHost:string|null;utmSource:string|null;utmMedium:string|null;utmCampaign:string|null;
 /** Oct 9 2026; absent on starts stored before the learning counters. */
 flags?:StartFlags};
export type BeatRow={sessionId:string;ts:string;engagedMs:number;pageviews:number;areaMs:Partial<Record<Area,number>>;
 /** Oct 8 2026; absent on beats stored before the place split. */
 placeMs?:Partial<Record<PlaceId,number>>;activityMs?:Partial<Record<ActivityId,number>>;cells?:CellMap;
 /** Oct 9 2026; absent on beats stored before the learning counters. */
 counts?:Record<string,number>};

/** Assemble sessions from append-only rows, with the same rules as the SQL (public.analytics_day). */
export function deriveSessions(starts:StartRow[],beats:BeatRow[]):SessionRow[]{
 const by=new Map<string,BeatRow[]>();for(const b of beats)(by.get(b.sessionId)??by.set(b.sessionId,[]).get(b.sessionId)!).push(b);
 return starts.map(st=>{
  const bs=by.get(st.id)||[];let e=0,pv=1,last=Date.parse(st.startedAt);const areaMs:Partial<Record<Area,number>>={},placeMs:Record<string,number>={},activityMs:Record<string,number>={},cells:CellMap={},counts:Record<string,number>={};
  for(const b of bs){addInto(counts,b.counts);e+=b.engagedMs;pv+=b.pageviews;last=Math.max(last,Date.parse(b.ts));for(const [k,v] of Object.entries(b.areaMs||{}))areaMs[k as Area]=(areaMs[k as Area]||0)+(v||0);
   addInto(placeMs,b.placeMs);addInto(activityMs,b.activityMs);addInto(cells,b.cells);}
  const cap=Math.max(0,last-Date.parse(st.startedAt))+ENGAGED_SLACK_MS;
  return {...st,flags:st.flags||{},engagedMs:bs.length?Math.min(e,cap):0,pageviews:pv,lastSeenAt:new Date(last).toISOString(),areaMs,placeMs,activityMs,cells,counts};
 });
}

function addInto(to:Record<string,number>,from:Record<string,number|undefined>|undefined){for(const [k,v] of Object.entries(from||{}))if(v)to[k]=(to[k]||0)+v;}

export const DIMS=['country','region','source','referrer','campaign','device','entry'] as const;
export type Dim=typeof DIMS[number];
/** sessions, visitors (unique per day; summed across days) and page views. */
export type Counts={s:number;v:number;pv:number};
export type DailyRollup={
 day:string;visitors:number;sessions:number;pageviews:number;bounces:number;engagedMs:number;
 hist:number[];dims:Record<Dim,Record<string,Counts>>;areaMs:Partial<Record<Area,number>>;
 /** Oct 8 2026 (absent in rollups frozen before): ms per place and the sessions that spent any time there, ms per
  *  activity, and seconds per heat-map cell, all summed over the day. */
 placeMs?:Partial<Record<PlaceId,number>>;placeSessions?:Partial<Record<PlaceId,number>>;activityMs?:Partial<Record<ActivityId,number>>;cells?:CellMap;
 /** Oct 9 2026 (absent in rollups frozen before, or computed by SQL functions from before 20261009_analytics_counts.sql):
  *  learning counter sums, sessions with each counter ≥ 1, and sessions per start-flag value (flagTallyKeys). */
 counts?:Record<string,number>;countSessions?:Record<string,number>;flags?:Record<string,number>;
};

/** Fine session-length buckets in seconds (bucket i is [EDGES[i], EDGES[i+1]); the last is open). Used for the median. */
export const LENGTH_EDGES=[0,5,10,15,20,30,45,60,90,120,180,240,300,420,600,900,1200,1800,2700,3600,5400,7200,10800];
/** The coarse distribution shown on the dashboard; every edge is also a fine edge. */
export const DISPLAY_BUCKETS:{label:string;lo:number;hi:number}[]=[
 {label:'Under 10 s',lo:0,hi:10},{label:'10–30 s',lo:10,hi:30},{label:'30 s–1 min',lo:30,hi:60},{label:'1–3 min',lo:60,hi:180},
 {label:'3–10 min',lo:180,hi:600},{label:'10–30 min',lo:600,hi:1800},{label:'30–60 min',lo:1800,hi:3600},{label:'1 h+',lo:3600,hi:Infinity},
];
export function lengthBucket(ms:number):number{const s=Math.max(0,ms)/1000;let i=0;while(i+1<LENGTH_EDGES.length&&s>=LENGTH_EDGES[i+1])i++;return i;}

export const isBounce=(s:Pick<SessionRow,'pageviews'|'engagedMs'>)=>s.pageviews<=1&&s.engagedMs<BOUNCE_MS;
const TOP_N=100;
/** Regions keep many more keys per day so the per-country breakdown can list every state/province seen (Oct 8 2026). */
export const REGION_TOP_N=1000;
const emptyDims=()=>Object.fromEntries(DIMS.map(d=>[d,{}])) as Record<Dim,Record<string,Counts>>;

export function dimKeys(s:SessionRow):Record<Dim,string|null>{
 const utm=s.utmSource||s.utmMedium||s.utmCampaign;
 return {
  country:s.country||'(unknown)',
  region:s.country&&s.region?`${s.country}-${s.region}`:null,
  source:s.source,
  referrer:s.referrerHost,
  campaign:utm?`${s.utmCampaign||'(no campaign)'} · ${s.utmSource||'—'} / ${s.utmMedium||'—'}`:null,
  device:s.device,
  entry:s.entryPath,
 };
}

/** One UTC day of raw sessions → its rollup. Visitors are distinct hashes (the hash only lives for that day anyway). */
export function rollupDay(day:string,sessions:SessionRow[]):DailyRollup{
 const r:DailyRollup={day,visitors:0,sessions:0,pageviews:0,bounces:0,engagedMs:0,hist:LENGTH_EDGES.map(()=>0),dims:emptyDims(),areaMs:{},placeMs:{},placeSessions:{},activityMs:{},cells:{},counts:{},countSessions:{},flags:{}};
 const placeMs=r.placeMs as Record<string,number>,placeSessions=r.placeSessions as Record<string,number>;
 const visitors=new Set<string>(),dimVisitors=new Map<string,Set<string>>();
 for(const s of sessions){
  if(s.day!==day)continue;
  r.sessions++;r.pageviews+=s.pageviews;r.engagedMs+=s.engagedMs;if(isBounce(s))r.bounces++;
  r.hist[lengthBucket(s.engagedMs)]++;visitors.add(s.visitorHash);
  const keys=dimKeys(s);
  for(const dim of DIMS){const key=keys[dim];if(key==null)continue;
   const c=(r.dims[dim][key]??={s:0,v:0,pv:0});c.s++;c.pv+=s.pageviews;
   const id=dim+'\u0000'+key;let set=dimVisitors.get(id);if(!set)dimVisitors.set(id,set=new Set());
   if(!set.has(s.visitorHash)){set.add(s.visitorHash);c.v++;}}
  for(const [a,ms] of Object.entries(s.areaMs||{}))if(ms)r.areaMs[a as Area]=(r.areaMs[a as Area]||0)+ms;
  for(const [p,ms] of Object.entries(s.placeMs||{}))if(ms){placeMs[p]=(placeMs[p]||0)+ms;placeSessions[p]=(placeSessions[p]||0)+1;}
  addInto(r.activityMs as Record<string,number>,s.activityMs);addInto(r.cells!,s.cells);
  for(const [id,n] of Object.entries(s.counts||{}))if(n>0){r.counts![id]=(r.counts![id]||0)+n;r.countSessions![id]=(r.countSessions![id]||0)+1;}
  if(s.flags&&Object.keys(s.flags).length)for(const k of flagTallyKeys(s.flags))r.flags![k]=(r.flags![k]||0)+1;
 }
 r.visitors=visitors.size;
 for(const dim of DIMS)r.dims[dim]=trimTop(r.dims[dim],dim==='region'?REGION_TOP_N:TOP_N);
 return r;
}

/** Keep the top n keys by sessions (ties by key), like the SQL's `order by s desc, k limit 100`. */
function trimTop(rec:Record<string,Counts>,n:number):Record<string,Counts>{
 return Object.fromEntries(Object.entries(rec).sort((a,b)=>b[1].s-a[1].s||(a[0]<b[0]?-1:a[0]>b[0]?1:0)).slice(0,n));
}

/** Median from a histogram, interpolated inside the bucket that holds the middle session. */
export function histMedianMs(hist:number[]):number{
 const n=hist.reduce((a,b)=>a+b,0);if(!n)return 0;
 const target=n/2;let cum=0;
 for(let i=0;i<hist.length;i++){const c=hist[i];if(!c)continue;
  if(cum+c>=target){const lo=LENGTH_EDGES[i],hi=LENGTH_EDGES[i+1];if(hi===undefined)return lo*1000;return Math.round((lo+(hi-lo)*((target-cum)/c))*1000);}
  cum+=c;}
 return LENGTH_EDGES[LENGTH_EDGES.length-1]*1000;
}

export function displayDistribution(hist:number[]):{label:string;sessions:number}[]{
 return DISPLAY_BUCKETS.map(b=>({label:b.label,sessions:hist.reduce((n,c,i)=>LENGTH_EDGES[i]>=b.lo&&LENGTH_EDGES[i]<b.hi?n+c:n,0)}));
}

export type Row={key:string;sessions:number;visitors:number;pageviews:number};
export type Totals={visitors:number;sessions:number;pageviews:number;bounceRate:number;avgMs:number;medianMs:number;engagedMs:number};
export type PlaceRow={place:PlaceId;ms:number;sessions:number};
export type ActivityRow={activity:ActivityId;ms:number};
export type Merged={totals:Totals;hist:number[];dims:Record<Dim,Row[]>;areas:{area:Area;ms:number}[];
 places:PlaceRow[];activities:ActivityRow[];cells:[number,number][];
 /** Learning totals over the range (raw; lib/analytics/learning.ts suppresses small cells before anything leaves the server). */
 counts:Record<string,number>;countSessions:Record<string,number>;flags:Record<string,number>};

export function mergeRollups(rollups:DailyRollup[]):Merged{
 const hist=LENGTH_EDGES.map(()=>0),dims=emptyDims(),areaMs:Partial<Record<Area,number>>={},placeMs:Record<string,number>={},placeSessions:Record<string,number>={},activityMs:Record<string,number>={},cells:CellMap={};
 const counts:Record<string,number>={},countSessions:Record<string,number>={},flags:Record<string,number>={};
 let visitors=0,sessions=0,pageviews=0,bounces=0,engagedMs=0;
 for(const r of rollups){
  visitors+=r.visitors;sessions+=r.sessions;pageviews+=r.pageviews;bounces+=r.bounces;engagedMs+=r.engagedMs;
  r.hist.forEach((c,i)=>{if(i<hist.length)hist[i]+=c;});
  for(const dim of DIMS)for(const [k,c] of Object.entries(r.dims?.[dim]||{})){const t=(dims[dim][k]??={s:0,v:0,pv:0});t.s+=c.s;t.v+=c.v;t.pv+=c.pv;}
  for(const [a,ms] of Object.entries(r.areaMs||{}))areaMs[a as Area]=(areaMs[a as Area]||0)+(ms||0);
  addInto(placeMs,r.placeMs);addInto(placeSessions,r.placeSessions);addInto(activityMs,r.activityMs);addInto(cells,r.cells);
  addInto(counts,r.counts);addInto(countSessions,r.countSessions);addInto(flags,r.flags);
 }
 const rows=(rec:Record<string,Counts>)=>Object.entries(rec).map(([key,c])=>({key,sessions:c.s,visitors:c.v,pageviews:c.pv})).sort((a,b)=>b.visitors-a.visitors||b.sessions-a.sessions||a.key.localeCompare(b.key));
 return {
  totals:{visitors,sessions,pageviews,engagedMs,bounceRate:sessions?bounces/sessions:0,avgMs:sessions?Math.round(engagedMs/sessions):0,medianMs:histMedianMs(hist)},
  hist,dims:Object.fromEntries(DIMS.map(d=>[d,rows(dims[d])])) as Record<Dim,Row[]>,
  areas:(Object.entries(areaMs) as [Area,number][]).filter(([,ms])=>ms>0).map(([area,ms])=>({area,ms})).sort((a,b)=>b.ms-a.ms),
  places:Object.entries(placeMs).filter(([p,ms])=>ms>0&&(PLACE_IDS as readonly string[]).includes(p)).map(([p,ms])=>({place:p as PlaceId,ms,sessions:placeSessions[p]||0})).sort((a,b)=>b.ms-a.ms||a.place.localeCompare(b.place)),
  activities:Object.entries(activityMs).filter(([a,ms])=>ms>0&&(ACTIVITY_IDS as readonly string[]).includes(a)).map(([a,ms])=>({activity:a as ActivityId,ms})).sort((a,b)=>b.ms-a.ms||a.activity.localeCompare(b.activity)),
  cells:Object.entries(cells).map(([k,s])=>[Number(k),s] as [number,number]).filter(([k,s])=>s>0&&k>=0&&k<CELL_COUNT).sort((a,b)=>a[0]-b[0]),
  counts,countSessions,flags,
 };
}

export type Point={key:string;visitors:number;sessions:number;pageviews:number};

/** Hourly series for one UTC day: sessions and visitors by start hour; page views = each start plus beats' counts by hour. */
export function hourlySeries(day:string,starts:StartRow[],beats:BeatRow[]):Point[]{
 const pts:Point[]=Array.from({length:24},(_,h)=>({key:`${day}T${String(h).padStart(2,'0')}`,visitors:0,sessions:0,pageviews:0}));
 const seen=pts.map(()=>new Set<string>()),ids=new Set<string>();
 for(const s of starts){if(s.day!==day)continue;ids.add(s.id);const h=new Date(s.startedAt).getUTCHours();pts[h].sessions++;pts[h].pageviews++;if(!seen[h].has(s.visitorHash)){seen[h].add(s.visitorHash);pts[h].visitors++;}}
 for(const b of beats){if(!ids.has(b.sessionId)||utcDay(b.ts)!==day)continue;pts[new Date(b.ts).getUTCHours()].pageviews+=b.pageviews;}
 return pts;
}

export const dailySeries=(rollups:DailyRollup[]):Point[]=>rollups.map(r=>({key:r.day,visitors:r.visitors,sessions:r.sessions,pageviews:r.pageviews}));

export type Report={
 configured:boolean;from:string;to:string;granularity:'hour'|'day';generatedAt:string;live:number;
 series:Point[];totals:Totals;distribution:{label:string;sessions:number}[];dims:Record<Dim,Row[]>;areas:{area:Area;ms:number}[];
 places:PlaceRow[];activities:ActivityRow[];cells:[number,number][];
 /** Full names for the region keys in dims.region ("US-CA" → "California"), filled on the server (regions.ts). */
 regionNames:Record<string,string>;
 notes:string[];
 /** Oct 9 2026: the Learning section (built and small-number-suppressed on the server, lib/analytics/learning.ts). */
 learning:LearningReport|null;
 /** Database functions version (3 = 20261009_analytics_counts.sql installed); `needsUpdate` drives the /admin banner. */
 storage:{schema:number;needsUpdate:boolean};
};

export function emptyReport(from:string,to:string,now:Date,configured:boolean):Report{
 const m=mergeRollups([]);
 return {configured,from,to,granularity:from===to?'hour':'day',generatedAt:now.toISOString(),live:0,series:[],totals:m.totals,distribution:displayDistribution(m.hist),dims:m.dims,areas:m.areas,
  places:m.places,activities:m.activities,cells:m.cells,regionNames:{},notes:[],learning:null,storage:{schema:SCHEMA_VERSION,needsUpdate:false}};
}

/** Resolve a preset or custom range to inclusive UTC days. Custom ranges are capped at 366 days and never end after today. */
export function resolveRange(q:{range?:string|null;from?:string|null;to?:string|null},now:Date):{from:string;to:string}{
 const today=utcDay(now),day=/^\d{4}-\d{2}-\d{2}$/;
 switch(q.range){
  case 'today':return {from:today,to:today};
  case '30d':return {from:addDays(today,-29),to:today};
  case 'custom':{
   let from=q.from&&day.test(q.from)&&!isNaN(Date.parse(q.from))?q.from:addDays(today,-6);
   let to=q.to&&day.test(q.to)&&!isNaN(Date.parse(q.to))?q.to:today;
   if(from>to)[from,to]=[to,from];
   if(to>today)to=today;if(from>to)from=to;
   if(dayList(from,to).length>366)from=addDays(to,-365);
   return {from,to};
  }
  default:return {from:addDays(today,-6),to:today};
 }
}

/**
 * Per-country state/province breakdown (Oct 8 2026) from the region rows ("US-CA"): the countries that have any region,
 * by visitors, and for one country ALL its regions with full names (`names` from the report; the code when missing).
 */
export function regionCountries(rows:Row[]):{country:string;visitors:number;sessions:number}[]{
 const by=new Map<string,{country:string;visitors:number;sessions:number}>();
 for(const r of rows){const c=r.key.slice(0,2);if(!/^[A-Z]{2}-/.test(r.key))continue;const t=by.get(c)??{country:c,visitors:0,sessions:0};t.visitors+=r.visitors;t.sessions+=r.sessions;by.set(c,t);}
 return [...by.values()].sort((a,b)=>b.visitors-a.visitors||b.sessions-a.sessions||a.country.localeCompare(b.country));
}
export function regionsOf(rows:Row[],country:string,names:Record<string,string>):(Row&{code:string;name:string})[]{
 return rows.filter(r=>r.key.startsWith(country+'-')).map(r=>({...r,code:r.key.slice(3),name:names[r.key]||r.key.slice(3)}))
  .sort((a,b)=>b.visitors-a.visitors||b.sessions-a.sessions||a.name.localeCompare(b.name));
}
