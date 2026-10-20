/**
 * Server side of the sponsor Overview's device / country drill-down (Oct 20 2026). Server only; called after the admin session
 * check (app/api/admin/sponsor-split). Supabase: public.analytics_sponsor_split over PostgREST with the service-role key, like
 * liveAdmin.ts (a 404 = 20261021_analytics_sponsor_split.sql has not run, and the panel says so). The local preview store
 * (ANALYTICS_LOCAL_FILE) computes the same thing in TypeScript. Reads only, never throws, cached 30 s.
 */
import {rpc} from './liveAdmin';
import {deriveSessions,type BeatRow,type StartRow} from './core';
import {getStore} from './store';
import {computeSplit,emptySplit,shapeSplit,type SponsorSplit} from './sponsorSplit';

const cache=new Map<string,{at:number;value:SponsorSplit}>();
export const SPLIT_CACHE_MS=30_000;

export async function loadSponsorSplit(from:string,to:string,{fetchImpl=fetch,now=Date.now()}:{fetchImpl?:typeof fetch;now?:number}={}):Promise<SponsorSplit>{
 const key=from+':'+to,hit=cache.get(key);if(hit&&now-hit.at<SPLIT_CACHE_MS)return hit.value;
 let out:SponsorSplit;
 try{
  const store=getStore();
  if(store?.kind==='memory'){
   const data=(store as unknown as {data:{starts:Record<string,StartRow>;beats:BeatRow[]}}).data;
   const starts=Object.values(data.starts).filter(s=>s.day>=from&&s.day<=to),ids=new Set(starts.map(s=>s.id));
   out=computeSplit(deriveSessions(starts,data.beats.filter(b=>ids.has(b.sessionId))),from,to);
  }else{
   const r=await rpc('analytics_sponsor_split',{p_from:from,p_to:to},fetchImpl);
   out=!r?emptySplit('not-configured',from,to):r.status===404?emptySplit('needs-migration',from,to):r.status>=400?emptySplit('error',from,to):shapeSplit(r.json);
  }
 }catch{out=emptySplit('error',from,to);}
 if(out.status==='ok'){if(cache.size>100)cache.clear();cache.set(key,{at:now,value:out});}
 return out;
}
