/**
 * Fights per fishing session for /admin (Oct 15 2026). Server only; called after the admin session check, like
 * lib/arcade/kickAdminMetrics.ts and lib/saves/metrics.ts. Calls public.analytics_fishing_summary (supabase/migrations/
 * 20261017_analytics_fishing.sql) over PostgREST with the server-only service-role key: how many sessions fished, how many fights
 * they started and how those sessions split by fights (1 / 2–3 / 4–6 / 7+). This is the one fishing number the day rollups
 * cannot give (they keep totals and "sessions with the id", never a per-session count), so it reads the raw beats, which the
 * nightly purge keeps for RAW_WINDOW_DAYS. Everything else about fishing is in report.overview.fishing (lib/analytics/overview.ts).
 * Nov 6 2026: public.analytics_fishing_sessions (supabase/migrations/20261106_analytics_fishing_sessions.sql, additive) is read
 * first: it also counts the sessions that fished but never hooked a fish (bucket '0'); the funnel itself is lib/analytics/fishingFunnel.ts.
 *
 * Aggregates only: counts of sessions and fights, never a session id, a fish or a spot. Exact counts since Nov 6 2026 (owner
 * rule, Nov 5 2026: "dont show <5, show exact"). Never throws: the status says what is missing, and the section shows
 * a banner naming the migration when the function is not installed.
 */

export type FishingAdminStatus='ok'|'not-configured'|'needs-migration'|'error';
export type FightBucket='0'|'1'|'2-3'|'4-6'|'7+';
/** '0' (Nov 6 2026, analytics_fishing_sessions): sessions that fished but never hooked a fish. */
export const FIGHT_BUCKETS:readonly FightBucket[]=['0','1','2-3','4-6','7+'];
export type FishingAdminMetrics={status:FishingAdminStatus;
 /** Sessions that started at least one fight in range. */sessions:number|null;
 fights:number|null;landed:number|null;
 /** Sessions by how many fights they started ('0' only with the Nov 6 2026 function). */buckets:Partial<Record<FightBucket,number|null>>|null;
 /** Nov 6 2026 (analytics_fishing_sessions): sessions that fished at all (tapped Fish, cast, fought or landed), those that never
  *  hooked a fish, and those that cast but never hooked. null until FISHING_SESSIONS_MIGRATION has run (`sessionsStatus`). */
 fished:number|null;neverHooked:number|null;castNeverHooked:number|null;sessionsStatus:FishingAdminStatus;
 /** How many days of raw beats the function can see (older days are frozen into rollups without per-session counts). */windowDays:number};
export const RAW_WINDOW_DAYS=14;
export const FISHING_MIGRATION='supabase/migrations/20261017_analytics_fishing.sql',FISHING_OK_ROW='OK, fishing analytics installed';
export const FISHING_SESSIONS_MIGRATION='supabase/migrations/20261106_analytics_fishing_sessions.sql',FISHING_SESSIONS_OK_ROW='OK, fishing sessions installed';
const empty=(status:FishingAdminStatus):FishingAdminMetrics=>({status,sessions:null,fights:null,landed:null,buckets:null,fished:null,neverHooked:null,castNeverHooked:null,sessionsStatus:status,windowDays:RAW_WINDOW_DAYS});
export const EMPTY_FISHING_METRICS=empty('not-configured');

const num=(v:unknown)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.floor(v)):typeof v==='string'&&/^\d+$/.test(v)?Number(v):0;
/** Shape analytics_fishing_summary's JSON into the report. Exact counts (owner rule, Nov 5 2026: no "<5"). Pure (tests). */
export function shapeFishingMetrics(raw:unknown):FishingAdminMetrics{
 const r=raw&&typeof raw==='object'?raw as Record<string,unknown>:{};
 const b=r.buckets&&typeof r.buckets==='object'?r.buckets as Record<string,unknown>:{};
 const buckets=Object.fromEntries(FIGHT_BUCKETS.filter(k=>k!=='0').map(k=>[k,num(b[k])])) as Partial<Record<FightBucket,number>>;
 return {status:'ok',sessions:num(r.sessions),fights:num(r.fights),landed:num(r.landed),buckets,fished:null,neverHooked:null,castNeverHooked:null,sessionsStatus:'needs-migration',windowDays:num(r.window_days)||RAW_WINDOW_DAYS};
}
/** Shape analytics_fishing_sessions's JSON (Nov 6 2026): every session that fished, with the never-hooked ones. Pure (tests). */
export function shapeFishingSessions(raw:unknown):FishingAdminMetrics{
 const r=raw&&typeof raw==='object'?raw as Record<string,unknown>:{};
 const b=r.buckets&&typeof r.buckets==='object'?r.buckets as Record<string,unknown>:{};
 const buckets=Object.fromEntries(FIGHT_BUCKETS.map(k=>[k,num(b[k])])) as Record<FightBucket,number>;
 const fished=num(r.sessions);
 return {status:'ok',sessions:fished-buckets['0'],fights:num(r.fights),landed:num(r.landed),buckets,fished,neverHooked:num(r.never_hooked),castNeverHooked:num(r.cast_never_hooked),sessionsStatus:'ok',windowDays:num(r.window_days)||RAW_WINDOW_DAYS};
}

async function rpc(name:string,from:string,to:string,fetchImpl:typeof fetch,url:string,key:string){
 const res=await fetchImpl(url.replace(/\/+$/,'')+'/rest/v1/rpc/'+name,{method:'POST',cache:'no-store',
  headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({p_from:from,p_to:to})});
 if(res.status===404)return null;// the function is not installed yet
 if(!res.ok)throw new Error(name+' '+res.status);
 return JSON.parse(await res.text()) as unknown;
}
/** Nov 6 2026: analytics_fishing_sessions first (it counts sessions that never hooked a fish); without it, the Oct 15 summary,
 *  with `sessionsStatus` 'needs-migration' so the section names FISHING_SESSIONS_MIGRATION. */
export async function loadFishingMetrics(from:string,to:string,fetchImpl:typeof fetch=fetch):Promise<FishingAdminMetrics>{
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)return EMPTY_FISHING_METRICS;
 try{
  const v2=await rpc('analytics_fishing_sessions',from,to,fetchImpl,url,key);
  if(v2!==null)return shapeFishingSessions(v2);
  const v1=await rpc('analytics_fishing_summary',from,to,fetchImpl,url,key);
  return v1===null?empty('needs-migration'):shapeFishingMetrics(v1);
 }catch{return empty('error');}
}
