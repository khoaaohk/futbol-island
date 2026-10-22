/**
 * SERVER ONLY: the party relay's daily totals for /admin (Oct 22 2026, Phase B of docs/analytics-multiplayer-plan.md §7). Called by
 * app/api/admin/party-stats/route.ts after the admin session check. Fetches `GET {RELAY_STATS_URL}?from&to` with
 * `Authorization: Bearer {RELAY_STATS_TOKEN}`; both are server-only env vars (never NEXT_PUBLIC_, never sent to the browser).
 * Without them the status is 'not-configured' and the admin says "Relay stats not configured". Reads only, never throws, one
 * answer per range for 60 s (the admin's polls and several open tabs cost at most one relay request a minute per range).
 * RELAY_STATS_FIXTURE=1 (local preview only) answers with lib/analytics/relayStatsTypes.ts relayStatsFixture() instead.
 */
import {emptyRelayStats,relayStatsFixture,shapeRelayStats,type RelayStatsReport} from './relayStatsTypes';

export const RELAY_STATS_CACHE_MS=60_000;
const cache=new Map<string,{at:number;value:RelayStatsReport}>();

export function relayStatsConfig(env:Record<string,string|undefined>=process.env):{url:string;token:string}|null{
 const url=(env.RELAY_STATS_URL||'').trim(),token=(env.RELAY_STATS_TOKEN||'').trim();
 if(!url||!token||!/^https?:\/\//.test(url))return null;
 return {url,token};
}

export async function loadRelayStats(from:string,to:string,{fetchImpl=fetch,now=Date.now(),env=process.env}:{fetchImpl?:typeof fetch;now?:number;env?:Record<string,string|undefined>}={}):Promise<RelayStatsReport>{
 const key=from+':'+to,hit=cache.get(key);if(hit&&now-hit.at<RELAY_STATS_CACHE_MS)return hit.value;
 let out:RelayStatsReport;
 if(env.RELAY_STATS_FIXTURE==='1'&&env.NODE_ENV!=='production')out=shapeRelayStats(relayStatsFixture(from,Math.min(14,Math.max(1,Math.round((Date.parse(to)-Date.parse(from))/86_400_000)+1))),from,to);
 else{
  const cfg=relayStatsConfig(env);
  if(!cfg)return emptyRelayStats('not-configured',from,to);
  try{
   const u=new URL(cfg.url);u.searchParams.set('from',from);u.searchParams.set('to',to);
   const res=await fetchImpl(u.toString(),{cache:'no-store',headers:{Authorization:`Bearer ${cfg.token}`,Accept:'application/json'},signal:AbortSignal.timeout?.(5000)});
   out=res.status===401||res.status===403?emptyRelayStats('unauthorized',from,to):!res.ok?emptyRelayStats('error',from,to):shapeRelayStats(JSON.parse(await res.text()||'null'),from,to);
  }catch{out=emptyRelayStats('error',from,to);}
 }
 if(out.status==='ok'){if(cache.size>50)cache.clear();cache.set(key,{at:now,value:out});}
 return out;
}
/** Tests: forget the cache. */
export function resetRelayStatsCache(){cache.clear();}
