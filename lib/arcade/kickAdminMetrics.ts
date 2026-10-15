/**
 * Summit Kick plays and best score for /admin (Oct 15 2026). Server only; called after the admin session check, like
 * lib/saves/metrics.ts. Reads straight off the public arcade leaderboard (supabase/migrations/20261013_arcade_leaderboards.sql,
 * 20261014_summit_kick_board.sql: public.arcade_scores, game = 'kick'), over PostgREST with the server-only service-role key —
 * the same table the Arcade's own high-score board reads, so no new migration or table is needed for this.
 *
 * Aggregates only: a play count and the best score in range. Never an entry's initials, icon or day.
 * Never throws: the status says what is missing, and /admin shows "—" rather than break.
 */
export type KickAdminStatus='ok'|'not-configured'|'error';
export type KickAdminMetrics={status:KickAdminStatus;plays:number|null;best:number|null};
export const EMPTY_KICK_METRICS:KickAdminMetrics={status:'not-configured',plays:null,best:null};

/** The total row count from a PostgREST `Content-Range` response header, e.g. "0-9/42" (or "star/42" with no rows requested). */
function rangeTotal(header:string|null):number|null{
 if(!header)return null;const i=header.lastIndexOf('/');if(i<0)return null;
 const n=Number(header.slice(i+1));return Number.isFinite(n)?n:null;
}

export async function loadSummitKickMetrics(from:string,to:string,fetchImpl:typeof fetch=fetch):Promise<KickAdminMetrics>{
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)return EMPTY_KICK_METRICS;
 try{
  const base=url.replace(/\/+$/,'')+'/rest/v1/arcade_scores';
  const q=`game=eq.kick&played_on=gte.${encodeURIComponent(from)}&played_on=lte.${encodeURIComponent(to)}`;
  const headers={apikey:key,Authorization:`Bearer ${key}`};
  const bestRes=await fetchImpl(`${base}?${q}&select=score&order=score.desc&limit=1`,{headers,cache:'no-store'});
  if(bestRes.status===404)return EMPTY_KICK_METRICS;// the table isn't there yet (20261013 not run)
  if(!bestRes.ok)throw new Error('kick metrics '+bestRes.status);
  const rows=await bestRes.json() as {score:number}[];
  const countRes=await fetchImpl(`${base}?${q}&select=id&limit=1`,{headers:{...headers,Prefer:'count=exact'},cache:'no-store'});
  const plays=countRes.ok?rangeTotal(countRes.headers.get('content-range')):null;
  return {status:'ok',plays,best:rows[0]?.score??0};
 }catch{return {status:'error',plays:null,best:null};}
}
