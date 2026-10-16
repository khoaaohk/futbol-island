/**
 * Server side of /admin's live sessions and "Where players come from" (Oct 15 2026). Server only; called after the admin session
 * check (app/api/admin/live, app/api/admin/analytics, app/admin/page.tsx), like lib/analytics/fishingAdminMetrics.ts. Calls
 * public.analytics_live_sessions / public.analytics_sources_summary (supabase/migrations/20261018_analytics_live.sql) over
 * PostgREST with the server-only service-role key. Reads only. Never throws: the status says what is missing (a 404 = the
 * migration has not run, and the panel says which file to paste).
 */
import {regionName} from './regions';
import {LIVE_WINDOWS,emptyLive,emptySources,shapeLive,shapeSources,type LiveReport,type SourcesSummary} from './live';

/** One answer per window for this long, so the panel's 10 s polls from several open tabs cost at most one RPC per 5 s. */
export const LIVE_CACHE_MS=5_000;
const cache=new Map<number,{at:number;report:LiveReport}>();
export const liveMinutes=(raw:string|null|undefined)=>{const n=Number(raw);return (LIVE_WINDOWS as readonly number[]).includes(n)?n:5;};

export async function rpc(fn:string,args:unknown,fetchImpl:typeof fetch):Promise<{status:number;json:unknown}|null>{
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)return null;
 const res=await fetchImpl(url.replace(/\/+$/,'')+'/rest/v1/rpc/'+fn,{method:'POST',cache:'no-store',
  headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify(args)});
 return {status:res.status,json:res.ok?JSON.parse(await res.text()||'null'):null};
}

export async function loadLive(minutes:number,{fetchImpl=fetch,now=Date.now()}:{fetchImpl?:typeof fetch;now?:number}={}):Promise<LiveReport>{
 const m=liveMinutes(String(minutes)),hit=cache.get(m);
 if(hit&&now-hit.at<LIVE_CACHE_MS)return hit.report;
 let report:LiveReport;
 try{
  const r=await rpc('analytics_live_sessions',{p_minutes:m},fetchImpl);
  report=!r?emptyLive('not-configured',m):r.status===404?emptyLive('needs-migration',m):r.status>=400?emptyLive('error',m):shapeLive(r.json,regionName);
 }catch{report=emptyLive('error',m);}
 if(report.status==='ok')cache.set(m,{at:now,report});
 return report;
}

export async function loadSources(from:string,to:string,fetchImpl:typeof fetch=fetch):Promise<SourcesSummary>{
 try{
  const r=await rpc('analytics_sources_summary',{p_from:from,p_to:to},fetchImpl);
  return !r?emptySources('not-configured',from,to):r.status===404?emptySources('needs-migration',from,to):r.status>=400?emptySources('error',from,to):shapeSources(r.json,regionName);
 }catch{return emptySources('error',from,to);}
}
