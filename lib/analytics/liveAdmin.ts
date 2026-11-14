/**
 * Server side of /admin's live sessions and "Where players come from" (Oct 15 2026). Server only; called after the admin session
 * check (app/api/admin/live, app/api/admin/analytics, app/admin/page.tsx), like lib/analytics/fishingAdminMetrics.ts. Calls
 * public.analytics_live_sessions / public.analytics_sources_summary (supabase/migrations/20261018_analytics_live.sql) over
 * PostgREST with the server-only service-role key. Reads only. Never throws: the status says what is missing (a 404 = the
 * migration has not run, and the panel says which file to paste).
 */
import {createHash} from 'crypto';
import {regionName} from './regions';
import {playModeOf} from './countIds';
import {pageKeyIn} from './pageKeys';
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
 if(report.status==='ok'&&report.rows.some(x=>x.mode===null))report=await withModes(report,m,{fetchImpl,now});
 if(report.status==='ok')cache.set(m,{at:now,report});
 return report;
}

/** The live RPC's `sid` for a raw session id (the same salted hash as analytics_session_rows in SQL). Server only. */
export const liveSid=(id:string)=>createHash('sha256').update(id+':futbol-island-live-v1','utf8').digest('hex').slice(0,6);
/** At most this many of the window's newest beats are read for their play mode (one small read per 5 s cache miss). */
export const MODE_BEATS_LIMIT=2000;
/**
 * Nov 13 2026: each live row's play mode, with NO migration. The ingest stores the beat's mode as the counter pm:<s|w|p> in
 * analytics_beats.counts; this reads the window's beats (service role, newest first), keeps each session's newest beat that
 * carries one, and matches it to the RPC's rows by the same 6-hex sid. Only the letter (and the page key, pageKeys.ts) leaves
 * this function: no session id, no other counter. Never throws: on any failure the rows keep mode null ("Mode unknown").
 */
export async function withModes(report:LiveReport,minutes:number,{fetchImpl=fetch,now=Date.now()}:{fetchImpl?:typeof fetch;now?:number}={}):Promise<LiveReport>{
 try{
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key)return report;
  const since=new Date(now-minutes*60_000).toISOString();
  const res=await fetchImpl(url.replace(/\/+$/,'')+`/rest/v1/analytics_beats?select=session_id,counts&ts=gte.${encodeURIComponent(since)}&order=ts.desc,id.desc&limit=${MODE_BEATS_LIMIT}`,
   {method:'GET',cache:'no-store',headers:{apikey:key,Authorization:`Bearer ${key}`}});
  if(!res.ok)return report;
  const beats=JSON.parse(await res.text()||'null');if(!Array.isArray(beats))return report;
  // Nov 13 2026: the same read also gives each session's page (the newest beat's pg:<key>, pageKeys.ts; a fixed route family).
  const bySid=new Map<string,NonNullable<ReturnType<typeof playModeOf>>>(),pageBySid=new Map<string,string>();
  for(const b of beats){
   if(!b||typeof b!=='object'||typeof b.session_id!=='string')continue;
   const sid=liveSid(b.session_id);
   if(!bySid.has(sid)){const mode=playModeOf(b.counts);if(mode)bySid.set(sid,mode);}
   if(!pageBySid.has(sid)){const page=pageKeyIn(b.counts);if(page)pageBySid.set(sid,page);}
  }
  if(!bySid.size&&!pageBySid.size)return report;
  return {...report,rows:report.rows.map(r=>{const mode=r.mode??bySid.get(r.sid)??null,page=pageBySid.get(r.sid)??r.page;return mode===r.mode&&page===r.page?r:{...r,mode,page};})};
 }catch{return report;}
}

export async function loadSources(from:string,to:string,fetchImpl:typeof fetch=fetch):Promise<SourcesSummary>{
 try{
  const r=await rpc('analytics_sources_summary',{p_from:from,p_to:to},fetchImpl);
  return !r?emptySources('not-configured',from,to):r.status===404?emptySources('needs-migration',from,to):r.status>=400?emptySources('error',from,to):shapeSources(r.json,regionName);
 }catch{return emptySources('error',from,to);}
}
