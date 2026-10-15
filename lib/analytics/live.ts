/**
 * Live sessions and where players come from (Oct 15 2026; user: "on click 3 on now, opens slide out to show all that info", "how
 * much time they have spent so far", "if they are a returning user with saved codes or not"). Pure and client-safe: the shapes,
 * the parsing of the two SQL functions' JSON (supabase/migrations/20261018_analytics_live.sql) and the labels. The server side
 * (fetch + cache, behind the admin session) is lib/analytics/liveAdmin.ts; the panel is app/admin/LivePanel.tsx.
 *
 * Privacy: a session is a 6-hex `sid` (a salted hash made in SQL, never the session id or the visitor hash); location is a
 * country and a region code; a source is a site's host or a link's tag; returning / save code are yes/no marks. No IP, no city,
 * no name, no code.
 */
export const LIVE_WINDOWS=[2,5,15] as const;
export type LiveWindow=typeof LIVE_WINDOWS[number];
export const LIVE_MIGRATION='supabase/migrations/20261018_analytics_live.sql',LIVE_OK_ROW='OK, live sessions installed';
export const LIVE_COUNT_KEYS=['balls','fish','lessons','quizzes','swims','paintings','fruit','kicks'] as const;
export type LiveCountKey=typeof LIVE_COUNT_KEYS[number];
export const LIVE_COUNT_LABEL:Record<LiveCountKey,[string,string]>={balls:['ball','balls'],fish:['fish','fish'],lessons:['lesson','lessons'],
 quizzes:['quiz','quizzes'],swims:['swim','swims'],paintings:['painting','paintings'],fruit:['fruit','fruit'],kicks:['kick round','kick rounds']};
export type LiveStatus='ok'|'not-configured'|'needs-migration'|'error';

export type LiveRow={sid:string;startedAt:string;lastSeen:string;
 /** Foreground seconds (the beats' engaged time: hidden tabs and 10+ idle minutes do not count). */secondsActive:number;
 /** Wall-clock seconds from the start to the last beat. */spanSeconds:number;
 device:string;country:string|null;region:string|null;regionName:string|null;source:string;referrerHost:string|null;campaign:string|null;
 returning:boolean|null;hasCode:boolean|null;area:string|null;activity:string|null;previousArea:string|null;spot:string|null;
 /** Seconds per area / per activity in this session. */areas:Record<string,number>;activities:Record<string,number>;
 counts:Record<LiveCountKey,number>;
 /** Sessions and foreground seconds today that share this session's visitor hash (the same network + browser today). */
 deviceTodaySessions:number;deviceTodaySeconds:number};
export type Tally={key:string;n:number};
export type CountryTally={country:string;n:number;regions:{region:string;name:string;n:number|null}[]};
export type LiveReport={status:LiveStatus;minutes:number;generatedAt:string;sessions:number;byArea:Tally[];byCountry:CountryTally[];bySource:Tally[];rows:LiveRow[]};
export type SourcesSummary={status:LiveStatus;from:string;to:string;windowDays:number;minSessions:number;sessions:number;
 countries:CountryTally[];countriesSuppressed:number;sources:Tally[];sourcesSuppressed:number;
 returning:{new:number|null;returning:number|null;unknown:number|null};code:{with:number|null;without:number|null;unknown:number|null}};

const obj=(v:unknown)=>v&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,unknown>:{};
const arr=(v:unknown)=>Array.isArray(v)?v:[];
const num=(v:unknown)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.floor(v)):typeof v==='string'&&/^\d+(\.\d+)?$/.test(v)?Math.floor(Number(v)):0;
const nul=(v:unknown)=>v===null||v===undefined?null:num(v);
const str=(v:unknown)=>typeof v==='string'&&v?v:null;
const bool=(v:unknown)=>typeof v==='boolean'?v:null;
const secs=(v:unknown)=>Object.fromEntries(Object.entries(obj(v)).map(([k,s])=>[k,num(s)]).filter(([,s])=>(s as number)>0));
type Names=(country:string,code:string)=>string;
const regionsOf=(v:unknown,country:string,names?:Names)=>arr(v).map(r=>{const o=obj(r),region=str(o.region)||'';return {region,name:names&&/^[A-Z]{2}$/.test(country)?names(country,region):region,n:nul(o.n)};}).filter(r=>r.region);
const countriesOf=(v:unknown,names?:Names):CountryTally[]=>arr(v).map(c=>{const o=obj(c),country=str(o.country)||'(unknown)';return {country,n:num(o.n),regions:regionsOf(o.regions,country,names)};});
const talliesOf=(v:unknown):Tally[]=>arr(v).map(t=>{const o=obj(t);return {key:str(o.key)||'',n:num(o.n)};}).filter(t=>t.key);

export const emptyLive=(status:LiveStatus,minutes=5):LiveReport=>({status,minutes,generatedAt:new Date(0).toISOString(),sessions:0,byArea:[],byCountry:[],bySource:[],rows:[]});
/** analytics_live_sessions' JSON → the panel's report. Pure (tests). `names` turns a region code into its name (server only). */
export function shapeLive(raw:unknown,names?:Names):LiveReport{
 const r=obj(raw);
 const rows=arr(r.rows).map((x):LiveRow=>{const o=obj(x),c=obj(o.counts),country=str(o.country),region=str(o.region);
  return {sid:(str(o.sid)||'').replace(/[^0-9a-f]/g,'').slice(0,6),startedAt:str(o.started_at)||'',lastSeen:str(o.last_seen)||str(o.started_at)||'',
   secondsActive:num(o.seconds_active),spanSeconds:num(o.span_seconds),device:str(o.device)||'unknown',country,region,
   regionName:country&&region?(names?names(country,region):region):null,source:str(o.source)||'direct',referrerHost:str(o.referrer_host),campaign:str(o.campaign),
   returning:bool(o.returning),hasCode:bool(o.has_code),area:str(o.area),activity:str(o.activity),previousArea:str(o.previous_area),spot:str(o.spot),
   areas:secs(o.areas),activities:secs(o.activities),counts:Object.fromEntries(LIVE_COUNT_KEYS.map(k=>[k,num(c[k])])) as Record<LiveCountKey,number>,
   deviceTodaySessions:num(o.device_today_sessions),deviceTodaySeconds:num(o.device_today_seconds)};});
 return {status:'ok',minutes:num(r.minutes)||5,generatedAt:str(r.generated_at)||new Date().toISOString(),sessions:num(r.sessions),
  byArea:talliesOf(r.by_area),byCountry:countriesOf(r.by_country,names),bySource:talliesOf(r.by_source),rows};
}
export const emptySources=(status:LiveStatus,from='',to=''):SourcesSummary=>({status,from,to,windowDays:14,minSessions:3,sessions:0,countries:[],countriesSuppressed:0,
 sources:[],sourcesSuppressed:0,returning:{new:null,returning:null,unknown:null},code:{with:null,without:null,unknown:null}});
/** analytics_sources_summary's JSON → the day view's section. Pure (tests). */
export function shapeSources(raw:unknown,names?:Names):SourcesSummary{
 const r=obj(raw),rt=obj(r.returning),cd=obj(r.code);
 return {status:'ok',from:str(r.from)||'',to:str(r.to)||'',windowDays:num(r.window_days)||14,minSessions:num(r.min_sessions)||3,sessions:num(r.sessions),
  countries:countriesOf(r.countries,names),countriesSuppressed:num(r.countries_suppressed),sources:talliesOf(r.sources),sourcesSuppressed:num(r.sources_suppressed),
  returning:{new:nul(rt.new),returning:nul(rt.returning),unknown:nul(rt.unknown)},code:{with:nul(cd.with),without:nul(cd.without),unknown:nul(cd.unknown)}};
}

// ---- Labels (the panel and the day section) ---------------------------------------------------------------------------------
/** Link tags with a friendlier name (the printed QR card is https://futbolisland.app/?from=flyer). */
const TAG_LABEL:Record<string,string>={flyer:'flyer QR'};
export const sourceLabel=(key:string|null|undefined)=>!key||key==='direct'?'direct':TAG_LABEL[key]??key;
export const sessionSource=(r:Pick<LiveRow,'campaign'|'referrerHost'>)=>r.campaign||r.referrerHost||'direct';
/** Regional-indicator flag from an ISO-2 code ("US" → 🇺🇸); empty for anything else. */
export function flagOf(code:string|null|undefined):string{
 if(!code||!/^[A-Z]{2}$/.test(code))return '';
 return String.fromCodePoint(...[...code].map(ch=>0x1F1E6+ch.charCodeAt(0)-65));
}
const SPOT_LABEL:Record<string,string>={island:'island',paths:'paths',arcade:'arcade',museum:'museum',konbini:'konbini',shop:'kit shop',controller:'phone controller',other:'other page',
 starting:'just arrived',walk:'island',ride:'riding',fly:'flying',boat:'on a boat',swim:'swimming',fishing:'fishing',job:'island job',lesson:'lesson',watch:'watching a match',quiz:'quiz',
 book:'pop-up book',cards:'cards',films:'card films',vending:'vending machine',talk:'talking to islanders',coaches:'Coaches Centre',menu:'menus',idle:'idle',
 arcade_lobby:'arcade',arcade_live:'Island Strikers',arcade_runner:'Breakaway Run',arcade_tennis:'Futbol Tennis',arcade_pinball:'Futbol Pinball',arcade_puzzle:'Pass Puzzles',
 museum_hall:'museum',konbini_shop:'konbini',kit_shop:'kit shop',kit_studio:'kit studio'};
export const spotLabel=(k:string|null|undefined)=>!k?'just arrived':SPOT_LABEL[k]??(k.startsWith('exhibit_')?'museum exhibit':k.replace(/_/g,' '));
/** The island's own icons where one fits (emoji, no images to load). */
const SPOT_ICON:Record<string,string>={island:'🏝️',walk:'🏝️',fishing:'🎣',swim:'🏊',boat:'⛵',fly:'🪂',ride:'🛴',lesson:'📖',quiz:'❓',watch:'⚽',arcade:'🕹️',museum:'🏛️',
 konbini:'🏪',shop:'👕',kit_shop:'👕',kit_studio:'🎨',paths:'🧭',cards:'🃏',book:'📚',talk:'💬',coaches:'📋',job:'🧰',controller:'📱',starting:'👋'};
export const spotIcon=(k:string|null|undefined)=>!k?'👋':SPOT_ICON[k]??(k.startsWith('arcade_')?'🕹️':k.startsWith('exhibit_')?'🏛️':'');
/** "45 s", "12 min", "1 h 05". */
export function fmtSpent(seconds:number):string{
 const s=Math.max(0,Math.round(seconds));
 if(s<60)return `${s} s`;
 const m=Math.floor(s/60);if(m<60)return `${m} min`;
 return `${Math.floor(m/60)} h ${String(m%60).padStart(2,'0')}`;
}
/** "just now", "40 s ago", "3 min ago", "1 h 05 ago". */
export function fmtAgo(iso:string,nowMs:number):string{
 const t=Date.parse(iso);if(!Number.isFinite(t))return '—';
 const s=Math.max(0,(nowMs-t)/1000);return s<10?'just now':`${fmtSpent(s)} ago`;
}
/** The top few activities of a session as "island 8 min · fishing 4 min" (idle left out; walking counts as the island). */
export function timeLine(r:Pick<LiveRow,'activities'|'areas'>,max=4):string{
 const by=new Map<string,number>();
 const src=Object.keys(r.activities).length?r.activities:r.areas;
 for(const [k,s] of Object.entries(src)){if(k==='idle'||k==='other')continue;const label=spotLabel(k);by.set(label,(by.get(label)||0)+s);}
 return [...by.entries()].filter(([,s])=>s>=30).sort((a,b)=>b[1]-a[1]).slice(0,max).map(([l,s])=>`${l} ${fmtSpent(s)}`).join(' · ');
}
