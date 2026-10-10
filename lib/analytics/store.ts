/**
 * Analytics storage. Production uses Supabase through the server-only service-role key (RLS on, no anon access); the
 * memory store backs the tests and, with ANALYTICS_LOCAL_FILE outside Vercel, local previews of the dashboard.
 *
 * Both are append-only on the write path (one insert per event, no row locks, no read-modify-write) and aggregate on the
 * read path: Supabase in SQL (supabase/migrations/20261007_analytics.sql + 20261008_analytics_places.sql), the memory store with the TypeScript reference
 * in core.ts. tests/admin-analytics.cjs runs the SQL on a throwaway Postgres and checks it matches the reference.
 * Oct 9 2026 (20261009_analytics_counts.sql): starts may carry `flags`, beats `counts`; tests/admin-analytics-learning.cjs runs
 * all three migrations in order and checks the SQL rollup against the TypeScript one again.
 */
import {randomBytes} from 'crypto';
import * as fs from 'fs';
import type {BeatRow,CleanEvent,DailyRollup,Point,StartRow,TimeZoneMode} from './core';
import {BEAT_CAP_PER_SESSION,BEAT_WINDOW_MS,RETENTION_DAYS,SCHEMA_VERSION,SESSION_CAP_PER_VISITOR_DAY,addDays,dayBounds,dayIn,dayList,dayStartMs,deriveSessions,hourlySeries,rollupDay,rollupPacificDay} from './core';

/**
 * Oct 12 2026 (supabase/migrations/20261012_admin_pacific_time.sql): every store runs on a clock, timeMode(). 'pacific' once
 * the Pacific migration is installed (the memory store always, unless a test asks for 'utc'): days are America/Los_Angeles
 * days, the visitor salt rotates at Pacific midnight, Pacific days are frozen into their own table (analytics_daily_pt /
 * data.ptRollups) and the UTC days frozen before stay readable as legacyRollups(). 'utc' is the old behaviour throughout.
 */
export interface AnalyticsStore{
 kind:'supabase'|'memory';
 /** Which clock the days run on (cached; Supabase asks analytics_pacific_version()). */
 timeMode():Promise<TimeZoneMode>;
 /** The salt for one day (a Pacific day in Pacific mode), created on first use. Earlier days' salts are deleted by finalize(). */
 salt(day:string):Promise<string>;
 /** One append-only insert: a session start or a beat. Over-cap, late or orphan beats are dropped by the store. */
 track(ev:CleanEvent,now:Date):Promise<void>;
 /** Frozen daily rollups in [fromDay, toDay], on the store's clock. */
 rollups(fromDay:string,toDay:string):Promise<DailyRollup[]>;
 /** Frozen UTC-day rollups (analytics_daily), the only record of days older than the raw window from before Pacific time. */
 legacyRollups(fromDay:string,toDay:string):Promise<DailyRollup[]>;
 /** Rollups computed now from raw rows (raw-retained days only), not saved. */
 computeDays(fromDay:string,toDay:string,now:Date):Promise<DailyRollup[]>;
 /** Pacific mode: the rollup of sessions that started in [fromIso, toIso) of `day` (a part of a day, for like-for-like
  *  comparisons). Null in UTC mode (the old SQL has no such function). */
 computeWindow(day:string,fromIso:string,toIso:string):Promise<DailyRollup|null>;
 hourly(day:string):Promise<Point[]>;
 live(sinceIso:string):Promise<number>;
 /** Cron: freeze every final, unfrozen raw-retained day into a rollup, then purge raw rows and old salts. */
 finalize(now:Date):Promise<{frozen:string[]}>;
 /** The installed analytics SQL version (public.analytics_schema_version(); < 3 when 20261009_analytics_counts.sql is missing). */
 schemaVersion():Promise<number>;
}

/** The oldest day whose raw rows are complete and can be computed live: 14 UTC days back, or 13 Pacific days (a Pacific day
 *  straddles two UTC days, and rows purged on UTC days before the migration may have cut into the 14th). */
export const oldestComputable=(today:string,mode:TimeZoneMode)=>addDays(today,mode==='pacific'?-(RETENTION_DAYS-1):-RETENTION_DAYS);

/**
 * A day is final (safe to freeze) once its sessions can take no more beats: beats are accepted for 24 h after a session
 * starts, so day D is final 24 h after its end (+2 h margin). Pacific: D's end is the next Los Angeles midnight, so with the
 * 10:30 UTC cron (3:30 am PDT / 2:30 am PST) D freezes two nights later; UTC: D+2 02:00 UTC with the old 02:30 UTC cron.
 * Until then the dashboard computes it live from raw rows.
 */
export const isFinal=(day:string,now:Date,mode:TimeZoneMode='pacific')=>now.getTime()>=dayStartMs(addDays(day,1),mode)+BEAT_WINDOW_MS+2*3_600_000;

/** `rollups`: UTC days frozen before Pacific time (or all frozen days in 'utc' mode); `ptRollups`: frozen Pacific days. */
type MemoryData={salts:Record<string,string>;starts:Record<string,StartRow>;beats:BeatRow[];rollups:Record<string,DailyRollup>;ptRollups:Record<string,DailyRollup>};

export function createMemoryStore(file?:string,{tz='pacific'}:{tz?:TimeZoneMode}={}):AnalyticsStore&{data:MemoryData}{
 let data:MemoryData={salts:{},starts:{},beats:[],rollups:{},ptRollups:{}};
 if(file&&fs.existsSync(file)){try{data={...data,...JSON.parse(fs.readFileSync(file,'utf8'))};}catch{}}
 const save=()=>{if(file)fs.writeFileSync(file,JSON.stringify(data));};
 const sessionsOf=(starts:StartRow[])=>{const ids=new Set(starts.map(s=>s.id));return deriveSessions(starts,data.beats.filter(b=>ids.has(b.sessionId)));};
 /** UTC mode: sessions by their day label. Pacific mode: by start time, between the first day's and the day after the last day's midnights. */
 const rawDays=(from:string,to:string)=>{
  const all=Object.values(data.starts);
  if(tz==='utc')return all.filter(s=>s.day>=from&&s.day<=to);
  const lo=dayStartMs(from,'pacific'),hi=dayStartMs(addDays(to,1),'pacific');
  return all.filter(s=>{const t=Date.parse(s.startedAt);return t>=lo&&t<hi;});
 };
 const compute=(from:string,to:string,now:Date)=>{
  const today=dayIn(tz,now),oldest=oldestComputable(today,tz),f=from<oldest?oldest:from,t=to>today?today:to;if(f>t)return [];
  const sessions=sessionsOf(rawDays(f,t));
  return dayList(f,t).map(d=>tz==='utc'?rollupDay(d,sessions):rollupPacificDay(d,sessions));
 };
 const frozen=()=>tz==='utc'?data.rollups:data.ptRollups;
 const between=(rec:Record<string,DailyRollup>,from:string,to:string)=>Object.values(rec||{}).filter(r=>r.day>=from&&r.day<=to).sort((a,b)=>a.day<b.day?-1:1);
 return {
  kind:'memory',
  get data(){return data;},
  async timeMode(){return tz;},
  async salt(day){if(!data.salts[day]){data.salts[day]=randomBytes(32).toString('hex');save();}return data.salts[day];},
  async track(ev,now){
   const t=now.toISOString();
   if(ev.type==='start'){
    if(data.starts[ev.session])return;
    if(Object.values(data.starts).filter(s=>s.day===ev.day&&s.visitorHash===ev.visitorHash).length>=SESSION_CAP_PER_VISITOR_DAY)return;
    data.starts[ev.session]={id:ev.session,day:ev.day,visitorHash:ev.visitorHash,startedAt:t,entryPath:ev.path,country:ev.country,region:ev.region,device:ev.device,
     source:ev.source,referrerHost:ev.referrerHost,utmSource:ev.utmSource,utmMedium:ev.utmMedium,utmCampaign:ev.utmCampaign,flags:ev.flags||{}};
   }else{
    const s=data.starts[ev.session];
    if(!s||now.getTime()-Date.parse(s.startedAt)>BEAT_WINDOW_MS)return;
    if(data.beats.filter(b=>b.sessionId===ev.session).length>=BEAT_CAP_PER_SESSION)return;
    data.beats.push({sessionId:ev.session,ts:t,engagedMs:ev.engagedMs,pageviews:ev.pageviews,areaMs:ev.areaMs,placeMs:ev.placeMs,activityMs:ev.activityMs,cells:ev.cells,counts:ev.counts||{}});
   }
   save();
  },
  async rollups(from,to){return between(frozen(),from,to);},
  async legacyRollups(from,to){return between(data.rollups,from,to);},
  async computeDays(from,to,now){return compute(from,to,now);},
  async computeWindow(day,fromIso,toIso){
   if(tz==='utc')return null;
   return rollupPacificDay(day,sessionsOf(rawDays(day,day)),Date.parse(fromIso),Date.parse(toIso));
  },
  async hourly(day){const starts=rawDays(day,day),ids=new Set(starts.map(s=>s.id));return hourlySeries(day,starts,data.beats.filter(b=>ids.has(b.sessionId)),tz);},
  async live(sinceIso){
   const ids=new Set(Object.values(data.starts).filter(s=>s.startedAt>=sinceIso).map(s=>s.id));
   for(const b of data.beats)if(b.ts>=sinceIso)ids.add(b.sessionId);
   return ids.size;
  },
  async finalize(now){
   const today=dayIn(tz,now),oldest=oldestComputable(today,tz),done:string[]=[],rec=frozen();
   for(const r of compute(oldest,addDays(today,-1),now))if(isFinal(r.day,now,tz)&&!rec[r.day]){rec[r.day]=r;done.push(r.day);}
   if(tz==='utc'){for(const [id,s] of Object.entries(data.starts))if(s.day<addDays(today,-RETENTION_DAYS))delete data.starts[id];}
   else{const cut=dayBounds(addDays(today,-RETENTION_DAYS),'pacific')[0];for(const [id,s] of Object.entries(data.starts))if(Date.parse(s.startedAt)<cut)delete data.starts[id];}
   data.beats=data.beats.filter(b=>data.starts[b.sessionId]);
   for(const d of Object.keys(data.salts))if(d<today)delete data.salts[d];
   save();return {frozen:done};
  },
  async schemaVersion(){return SCHEMA_VERSION;},
 };
}

// ---------------------------------------------------------------------------------------------------------------------
// Supabase (PostgREST over fetch: no client library state, no realtime socket, nothing shipped to the browser). Every read
// is a SQL aggregate; raw rows never leave the database.
// ---------------------------------------------------------------------------------------------------------------------

/** How long a "still on UTC" answer is trusted before asking again (the switch to Pacific is one-way and cached for good). */
export const TIME_MODE_TTL_MS=10*60_000;

export function createSupabaseStore(url:string,serviceKey:string,fetchImpl:typeof fetch=fetch):AnalyticsStore{
 const base=url.replace(/\/+$/,'')+'/rest/v1';
 const headers={apikey:serviceKey,Authorization:`Bearer ${serviceKey}`,'Content-Type':'application/json'};
 const saltCache=new Map<string,string>();
 let mode:{v:TimeZoneMode;at:number}|null=null;
 async function call(path:string,init:RequestInit={}){
  const res=await fetchImpl(base+path,{...init,headers:{...headers,...(init.headers as Record<string,string>||{})},cache:'no-store'});
  if(!res.ok)throw new Error(`analytics store ${res.status}`);
  const text=await res.text();return text?JSON.parse(text):null;
 }
 const rpc=(fn:string,args:unknown)=>call('/rpc/'+fn,{method:'POST',body:JSON.stringify(args)});
 async function timeMode():Promise<TimeZoneMode>{
  if(mode&&(mode.v==='pacific'||Date.now()-mode.at<TIME_MODE_TTL_MS))return mode.v;
  // A missing function answers 404 → still UTC. Any other failure keeps the last known answer (or UTC), so a hiccup never
  // flips the ingest's salt day back and forth.
  try{mode={v:Number(await rpc('analytics_pacific_version',{}))>=1?'pacific':'utc',at:Date.now()};}
  catch(e){if(/ 404$/.test(String((e as Error)?.message)))mode={v:'utc',at:Date.now()};else return mode?.v??'utc';}
  return mode.v;
 }
 const frozenRows=async(table:string,fromDay:string,toDay:string)=>{
  const rows=await call(`/${table}?select=day,data&day=gte.${fromDay}&day=lte.${toDay}&order=day.asc`) as {day:string;data:DailyRollup}[];
  return rows.map(r=>({...r.data,day:r.day}));
 };
 return {
  kind:'supabase',
  timeMode,
  async salt(day){
   const hit=saltCache.get(day);if(hit)return hit;
   const salt=await rpc('analytics_salt',{p_day:day}) as string;
   if(saltCache.size>4)saltCache.clear();saltCache.set(day,salt);return salt;
  },
  async track(ev){
   await rpc('analytics_ingest',{p:{type:ev.type,session:ev.session,path:ev.path,day:ev.day,visitor_hash:ev.visitorHash,country:ev.country,region:ev.region,device:ev.device,source:ev.source,
    referrer_host:ev.referrerHost,utm_source:ev.utmSource,utm_medium:ev.utmMedium,utm_campaign:ev.utmCampaign,engaged_ms:ev.engagedMs,pageviews:ev.pageviews,area_ms:ev.areaMs,
    place_ms:ev.placeMs,activity_ms:ev.activityMs,cells:ev.cells,
    // Oct 9 2026: ignored by the ingest of older migrations (so this ships safely before 20261009_analytics_counts.sql runs).
    counts:ev.counts,flags:ev.flags}});
  },
  async rollups(fromDay,toDay){return frozenRows(await timeMode()==='pacific'?'analytics_daily_pt':'analytics_daily',fromDay,toDay);},
  async legacyRollups(fromDay,toDay){return frozenRows('analytics_daily',fromDay,toDay);},
  async computeDays(fromDay,toDay){return (await rpc(await timeMode()==='pacific'?'analytics_pt_days':'analytics_days',{p_from:fromDay,p_to:toDay}) as DailyRollup[]|null)||[];},
  async computeWindow(day,fromIso,toIso){if(await timeMode()!=='pacific')return null;return await rpc('analytics_window_rollup',{p_day:day,p_lo:fromIso,p_hi:toIso}) as DailyRollup|null;},
  async hourly(day){return (await rpc(await timeMode()==='pacific'?'analytics_pt_hourly':'analytics_hourly',{p_day:day}) as Point[]|null)||[];},
  async live(sinceIso){return Number(await rpc('analytics_live',{p_since:sinceIso}))||0;},
  async finalize(now){
   const m=await timeMode();
   const frozen=await rpc(m==='pacific'?'analytics_pt_finalize':'analytics_finalize',{p_today:dayIn(m,now)}) as string[]|null;return {frozen:frozen||[]};
  },
  // A missing function (migration not run) answers 404, which reads as version 2 (the places migration).
  async schemaVersion(){try{return Number(await rpc('analytics_schema_version',{}))||2;}catch{return 2;}},
 };
}

let cached:AnalyticsStore|null|undefined;
/**
 * The configured store, or null (the ingest route then no-ops and the dashboard says "not configured").
 * SUPABASE_SERVICE_ROLE_KEY is read on the server only; it is never prefixed NEXT_PUBLIC_.
 * ANALYTICS_LOCAL_FILE is a local-preview store and is ignored on Vercel.
 */
export function getStore():AnalyticsStore|null{
 if(cached!==undefined)return cached;
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY,local=process.env.ANALYTICS_LOCAL_FILE;
 if(local&&!process.env.VERCEL)cached=createMemoryStore(local);
 else if(url&&key)cached=createSupabaseStore(url,key);
 else cached=null;
 return cached;
}
