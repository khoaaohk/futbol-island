/**
 * Server side of the per-mode split (Nov 13 2026; lib/analytics/playModes.ts). Server only; called after the admin session check
 * (app/api/admin/play-modes). Calls public.analytics_play_modes (supabase/migrations/20261120_analytics_play_modes.sql) over
 * PostgREST with the service-role key, like dayAdmin.ts. Reads only, never throws: a 404 = the migration has not run (the UI
 * says which file to paste). A range entirely before MODE_DATA_SINCE never calls Supabase. Each answer is cached 30 s.
 */
import {rpc} from './liveAdmin';
import {MODE_DATA_SINCE,emptyModes,shapeModes,type PlayModes} from './playModes';

export const MODES_CACHE_MS=30_000;
const cache=new Map<string,{at:number;value:PlayModes}>();

export async function loadPlayModes(from:string,to:string,{fetchImpl=fetch,now=Date.now()}:{fetchImpl?:typeof fetch;now?:number}={}):Promise<PlayModes>{
 if(to<MODE_DATA_SINCE)return emptyModes('ok',from,to);// nothing to read: the days before the beat carried a mode
 const key=from+':'+to,hit=cache.get(key);if(hit&&now-hit.at<MODES_CACHE_MS)return hit.value;
 let out:PlayModes;
 try{const r=await rpc('analytics_play_modes',{p_from:from,p_to:to},fetchImpl);
  out=!r?emptyModes('not-configured',from,to):r.status===404?emptyModes('needs-migration',from,to):r.status>=400?emptyModes('error',from,to):shapeModes(r.json);}
 catch{out=emptyModes('error',from,to);}
 if(out.status==='ok'){if(cache.size>100)cache.clear();cache.set(key,{at:now,value:out});}
 return out;
}
