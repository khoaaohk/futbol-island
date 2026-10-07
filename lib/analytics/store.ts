/**
 * Analytics storage. Production uses Supabase through the server-only service-role key (RLS on, no anon access); the
 * memory store backs the tests and, with ANALYTICS_LOCAL_FILE outside Vercel, local previews of the dashboard.
 *
 * Both are append-only on the write path (one insert per event, no row locks, no read-modify-write) and aggregate on the
 * read path: Supabase in SQL (supabase/migrations/20261007_analytics.sql), the memory store with the TypeScript reference
 * in core.ts. tests/admin-analytics.cjs runs the SQL on a throwaway Postgres and checks it matches the reference.
 */
import {randomBytes} from 'crypto';
import * as fs from 'fs';
import type {BeatRow,CleanEvent,DailyRollup,Point,StartRow} from './core';
import {BEAT_CAP_PER_SESSION,BEAT_WINDOW_MS,RETENTION_DAYS,SESSION_CAP_PER_VISITOR_DAY,addDays,dayList,deriveSessions,hourlySeries,rollupDay,utcDay} from './core';

export interface AnalyticsStore{
 kind:'supabase'|'memory';
 /** The salt for one UTC day, created on first use. Earlier days' salts are deleted by finalize(). */
 salt(day:string):Promise<string>;
 /** One append-only insert: a session start or a beat. Over-cap, late or orphan beats are dropped by the store. */
 track(ev:CleanEvent,now:Date):Promise<void>;
 /** Frozen daily rollups in [fromDay, toDay]. */
 rollups(fromDay:string,toDay:string):Promise<DailyRollup[]>;
 /** Rollups computed now from raw rows (raw-retained days only), not saved. */
 computeDays(fromDay:string,toDay:string,now:Date):Promise<DailyRollup[]>;
 hourly(day:string):Promise<Point[]>;
 live(sinceIso:string):Promise<number>;
 /** Cron: freeze every final, unfrozen raw-retained day into a rollup, then purge raw rows and old salts. */
 finalize(now:Date):Promise<{frozen:string[]}>;
}

/**
 * A day is final (safe to freeze) once its sessions can take no more beats: beats are accepted for 24 h after a session
 * starts, so day D is final at D+2 00:00 UTC (+2 h margin). With the 02:30 UTC cron, D freezes two nights later; until then
 * the dashboard computes it live from raw rows.
 */
export const isFinal=(day:string,now:Date)=>now.getTime()>=Date.parse(addDays(day,1)+'T00:00:00Z')+BEAT_WINDOW_MS+2*3_600_000;

type MemoryData={salts:Record<string,string>;starts:Record<string,StartRow>;beats:BeatRow[];rollups:Record<string,DailyRollup>};

export function createMemoryStore(file?:string):AnalyticsStore&{data:MemoryData}{
 let data:MemoryData={salts:{},starts:{},beats:[],rollups:{}};
 if(file&&fs.existsSync(file)){try{data={...data,...JSON.parse(fs.readFileSync(file,'utf8'))};}catch{}}
 const save=()=>{if(file)fs.writeFileSync(file,JSON.stringify(data));};
 const rawDays=(from:string,to:string)=>{
  const starts=Object.values(data.starts).filter(s=>s.day>=from&&s.day<=to),ids=new Set(starts.map(s=>s.id));
  return {starts,beats:data.beats.filter(b=>ids.has(b.sessionId))};
 };
 const compute=(from:string,to:string,now:Date)=>{
  const oldest=addDays(utcDay(now),-RETENTION_DAYS),f=from<oldest?oldest:from;if(f>to)return [];
  const {starts,beats}=rawDays(f,to),sessions=deriveSessions(starts,beats);
  return dayList(f,to).map(d=>rollupDay(d,sessions));
 };
 return {
  kind:'memory',
  get data(){return data;},
  async salt(day){if(!data.salts[day]){data.salts[day]=randomBytes(32).toString('hex');save();}return data.salts[day];},
  async track(ev,now){
   const t=now.toISOString();
   if(ev.type==='start'){
    if(data.starts[ev.session])return;
    if(Object.values(data.starts).filter(s=>s.day===ev.day&&s.visitorHash===ev.visitorHash).length>=SESSION_CAP_PER_VISITOR_DAY)return;
    data.starts[ev.session]={id:ev.session,day:ev.day,visitorHash:ev.visitorHash,startedAt:t,entryPath:ev.path,country:ev.country,region:ev.region,device:ev.device,
     source:ev.source,referrerHost:ev.referrerHost,utmSource:ev.utmSource,utmMedium:ev.utmMedium,utmCampaign:ev.utmCampaign};
   }else{
    const s=data.starts[ev.session];
    if(!s||now.getTime()-Date.parse(s.startedAt)>BEAT_WINDOW_MS)return;
    if(data.beats.filter(b=>b.sessionId===ev.session).length>=BEAT_CAP_PER_SESSION)return;
    data.beats.push({sessionId:ev.session,ts:t,engagedMs:ev.engagedMs,pageviews:ev.pageviews,areaMs:ev.areaMs});
   }
   save();
  },
  async rollups(from,to){return Object.values(data.rollups).filter(r=>r.day>=from&&r.day<=to).sort((a,b)=>a.day<b.day?-1:1);},
  async computeDays(from,to,now){return compute(from,to,now);},
  async hourly(day){const {starts,beats}=rawDays(day,day);return hourlySeries(day,starts,beats);},
  async live(sinceIso){
   const ids=new Set(Object.values(data.starts).filter(s=>s.startedAt>=sinceIso).map(s=>s.id));
   for(const b of data.beats)if(b.ts>=sinceIso)ids.add(b.sessionId);
   return ids.size;
  },
  async finalize(now){
   const today=utcDay(now),oldest=addDays(today,-RETENTION_DAYS),frozen:string[]=[];
   for(const r of compute(oldest,addDays(today,-1),now))if(isFinal(r.day,now)&&!data.rollups[r.day]){data.rollups[r.day]=r;frozen.push(r.day);}
   for(const [id,s] of Object.entries(data.starts))if(s.day<oldest)delete data.starts[id];
   data.beats=data.beats.filter(b=>data.starts[b.sessionId]);
   for(const d of Object.keys(data.salts))if(d<today)delete data.salts[d];
   save();return {frozen};
  },
 };
}

// ---------------------------------------------------------------------------------------------------------------------
// Supabase (PostgREST over fetch: no client library state, no realtime socket, nothing shipped to the browser). Every read
// is a SQL aggregate; raw rows never leave the database.
// ---------------------------------------------------------------------------------------------------------------------

export function createSupabaseStore(url:string,serviceKey:string,fetchImpl:typeof fetch=fetch):AnalyticsStore{
 const base=url.replace(/\/+$/,'')+'/rest/v1';
 const headers={apikey:serviceKey,Authorization:`Bearer ${serviceKey}`,'Content-Type':'application/json'};
 const saltCache=new Map<string,string>();
 async function call(path:string,init:RequestInit={}){
  const res=await fetchImpl(base+path,{...init,headers:{...headers,...(init.headers as Record<string,string>||{})},cache:'no-store'});
  if(!res.ok)throw new Error(`analytics store ${res.status}`);
  const text=await res.text();return text?JSON.parse(text):null;
 }
 const rpc=(fn:string,args:unknown)=>call('/rpc/'+fn,{method:'POST',body:JSON.stringify(args)});
 return {
  kind:'supabase',
  async salt(day){
   const hit=saltCache.get(day);if(hit)return hit;
   const salt=await rpc('analytics_salt',{p_day:day}) as string;
   if(saltCache.size>4)saltCache.clear();saltCache.set(day,salt);return salt;
  },
  async track(ev){
   await rpc('analytics_ingest',{p:{type:ev.type,session:ev.session,path:ev.path,day:ev.day,visitor_hash:ev.visitorHash,country:ev.country,region:ev.region,device:ev.device,source:ev.source,
    referrer_host:ev.referrerHost,utm_source:ev.utmSource,utm_medium:ev.utmMedium,utm_campaign:ev.utmCampaign,engaged_ms:ev.engagedMs,pageviews:ev.pageviews,area_ms:ev.areaMs}});
  },
  async rollups(fromDay,toDay){
   const rows=await call(`/analytics_daily?select=day,data&day=gte.${fromDay}&day=lte.${toDay}&order=day.asc`) as {day:string;data:DailyRollup}[];
   return rows.map(r=>({...r.data,day:r.day}));
  },
  async computeDays(fromDay,toDay){return (await rpc('analytics_days',{p_from:fromDay,p_to:toDay}) as DailyRollup[]|null)||[];},
  async hourly(day){return (await rpc('analytics_hourly',{p_day:day}) as Point[]|null)||[];},
  async live(sinceIso){return Number(await rpc('analytics_live',{p_since:sinceIso}))||0;},
  async finalize(now){const frozen=await rpc('analytics_finalize',{p_today:utcDay(now)}) as string[]|null;return {frozen:frozen||[]};},
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
