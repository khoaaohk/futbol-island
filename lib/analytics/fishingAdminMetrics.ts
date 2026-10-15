/**
 * Fights per fishing session for /admin (Oct 15 2026). Server only; called after the admin session check, like
 * lib/arcade/kickAdminMetrics.ts and lib/saves/metrics.ts. Calls public.analytics_fishing_summary (supabase/migrations/
 * 20261017_analytics_fishing.sql) over PostgREST with the server-only service-role key: how many sessions fished, how many fights
 * they started and how those sessions split by fights (1 / 2–3 / 4–6 / 7+). This is the one fishing number the day rollups
 * cannot give (they keep totals and "sessions with the id", never a per-session count), so it reads the raw beats, which the
 * nightly purge keeps for RAW_WINDOW_DAYS. Everything else about fishing is in report.overview.fishing (lib/analytics/overview.ts).
 *
 * Aggregates only: counts of sessions and fights, never a session id, a fish or a spot. Small numbers (under MIN_SESSIONS
 * sessions) are suppressed to null like the rest of /admin. Never throws: the status says what is missing, and the section shows
 * a banner naming the migration when the function is not installed.
 */
import {MIN_SESSIONS} from './learning';

export type FishingAdminStatus='ok'|'not-configured'|'needs-migration'|'error';
export type FightBucket='1'|'2-3'|'4-6'|'7+';
export const FIGHT_BUCKETS:readonly FightBucket[]=['1','2-3','4-6','7+'];
export type FishingAdminMetrics={status:FishingAdminStatus;
 /** Sessions that started at least one fight in range (null = suppressed or unknown). */sessions:number|null;
 fights:number|null;landed:number|null;
 /** Sessions by how many fights they started. */buckets:Record<FightBucket,number|null>|null;
 /** How many days of raw beats the function can see (older days are frozen into rollups without per-session counts). */windowDays:number};
export const RAW_WINDOW_DAYS=14;
export const FISHING_MIGRATION='supabase/migrations/20261017_analytics_fishing.sql',FISHING_OK_ROW='OK, fishing analytics installed';
const empty=(status:FishingAdminStatus):FishingAdminMetrics=>({status,sessions:null,fights:null,landed:null,buckets:null,windowDays:RAW_WINDOW_DAYS});
export const EMPTY_FISHING_METRICS=empty('not-configured');

const num=(v:unknown)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.floor(v)):typeof v==='string'&&/^\d+$/.test(v)?Number(v):0;
/** Shape the function's JSON into the report, suppressing small numbers: under MIN_SESSIONS fishing sessions everything is null;
 *  a bucket under MIN_SESSIONS sessions is null. Pure (tests). */
export function shapeFishingMetrics(raw:unknown):FishingAdminMetrics{
 const r=raw&&typeof raw==='object'?raw as Record<string,unknown>:{};
 const sessions=num(r.sessions),fights=num(r.fights),landed=num(r.landed),b=r.buckets&&typeof r.buckets==='object'?r.buckets as Record<string,unknown>:{};
 if(sessions<MIN_SESSIONS)return {status:'ok',sessions:sessions>0?null:0,fights:sessions>0?null:0,landed:sessions>0?null:0,buckets:null,windowDays:num(r.window_days)||RAW_WINDOW_DAYS};
 const buckets=Object.fromEntries(FIGHT_BUCKETS.map(k=>{const n=num(b[k]);return [k,n>=MIN_SESSIONS?n:n>0?null:0];})) as Record<FightBucket,number|null>;
 return {status:'ok',sessions,fights,landed,buckets,windowDays:num(r.window_days)||RAW_WINDOW_DAYS};
}

export async function loadFishingMetrics(from:string,to:string,fetchImpl:typeof fetch=fetch):Promise<FishingAdminMetrics>{
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)return EMPTY_FISHING_METRICS;
 try{
  const res=await fetchImpl(url.replace(/\/+$/,'')+'/rest/v1/rpc/analytics_fishing_summary',{method:'POST',cache:'no-store',
   headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({p_from:from,p_to:to})});
  if(res.status===404)return empty('needs-migration');// the function is not installed yet
  if(!res.ok)throw new Error('fishing metrics '+res.status);
  return shapeFishingMetrics(JSON.parse(await res.text()));
 }catch{return empty('error');}
}
