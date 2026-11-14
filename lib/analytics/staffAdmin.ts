/**
 * Server side of staff exclusion (Nov 13 2026): the list of excluded player hashes in public.analytics_excluded (supabase/
 * migrations/20261121_analytics_staff_exclusion.sql), read and written over PostgREST with the server-only service-role key,
 * after the admin session check (app/api/admin/staff/route.ts). The SQL read functions leave those players out of every number
 * (raw rows of the last 14 days at once; frozen days once analytics_recompute_rollups has run).
 *
 * Stored: a 6–12 hex prefix of the admin pid (what /admin shows as "#1537da") and a short label. Never a code, a code hash or an
 * install id: "This device is mine" sends this device's player key (lib/analytics/deviceMarks.ts readPlayerKey, the same key a
 * session start carries), and the server turns it into the device's pids for this 90-day period and the one before
 * (lib/analytics/playerId.ts) and keeps only those.
 */
import {derivePlayerId,adminPid,envSecrets,PERIOD_DAYS,type PlayerSecrets} from './playerId';
import {addDays,dayIn} from './core';

export type StaffRow={pid:string;label:string|null;addedAt:string};
export type StaffStatus='ok'|'needs-migration'|'not-configured'|'error';
export type StaffList={status:StaffStatus;rows:StaffRow[];
 /** Days before this Pacific day may still include staff visits (frozen before the exclusion, raw rows gone); null = none known. */
 cleanFrom:string|null;
 /** The oldest day analytics_recompute_rollups can still fix (Pacific today − 13). */
 oldestFixable:string};
export const STAFF_MIGRATION='supabase/migrations/20261121_analytics_staff_exclusion.sql';

/** A pid prefix as typed or shown ("#1537DA" → "1537da"), or null. */
export function cleanPid(v:unknown):string|null{
 if(typeof v!=='string')return null;const s=v.trim().replace(/^#/,'').toLowerCase();
 return /^[0-9a-f]{6,12}$/.test(s)?s:null;
}
/** This device's admin pids (this period and the one before), from its player key; [] without a key or a secret. */
export function devicePids(key:{ph?:string;pi?:string},secrets:PlayerSecrets=envSecrets(),nowMs=Date.now()):string[]{
 const out:string[]=[];
 for(const t of [nowMs,nowMs-PERIOD_DAYS*86_400_000]){const id=derivePlayerId(key,secrets,t);if(id&&!out.includes(adminPid(id)))out.push(adminPid(id));}
 return out;
}

function conf(){const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;return url&&key?{base:url.replace(/\/+$/,'')+'/rest/v1',key}:null;}
async function rest(path:string,init:RequestInit,fetchImpl:typeof fetch){
 const c=conf();if(!c)return null;
 return fetchImpl(c.base+path,{...init,cache:'no-store',headers:{apikey:c.key,Authorization:`Bearer ${c.key}`,'Content-Type':'application/json',...(init.headers as Record<string,string>||{})}});
}
/** A missing table answers 404 (PostgREST) or 42P01 in the body. */
const missing=async(r:Response)=>r.status===404||/42P01|does not exist/.test(await r.clone().text().catch(()=>''));

export async function listStaff(fetchImpl:typeof fetch=fetch,now=new Date()):Promise<StaffList>{
 const oldestFixable=addDays(dayIn('pacific',now),-13);
 try{
  const r=await rest('/analytics_excluded?select=pid,label,added_at&order=added_at.asc',{method:'GET'},fetchImpl);
  if(!r)return {status:'not-configured',rows:[],cleanFrom:null,oldestFixable};
  if(!r.ok)return {status:await missing(r)?'needs-migration':'error',rows:[],cleanFrom:null,oldestFixable};
  const rows=((await r.json()) as {pid:string;label:string|null;added_at:string}[]).map(x=>({pid:x.pid,label:x.label,addedAt:x.added_at}));
  // The newest frozen Pacific day computed before the exclusion (no staffExcluded mark): days up to it may include staff.
  let cleanFrom:string|null=null;
  const f=await rest('/analytics_daily_pt?select=day&data->>staffExcluded=is.null&order=day.desc&limit=1',{method:'GET'},fetchImpl);
  if(f?.ok){const d=(await f.json()) as {day:string}[];if(d[0]?.day)cleanFrom=addDays(d[0].day,1);}
  return {status:'ok',rows,cleanFrom,oldestFixable};
 }catch{return {status:'error',rows:[],cleanFrom:null,oldestFixable};}
}
export async function addStaff(pids:string[],label:string|null,fetchImpl:typeof fetch=fetch):Promise<StaffStatus>{
 if(!pids.length)return 'error';
 try{
  const r=await rest('/analytics_excluded?on_conflict=pid',{method:'POST',headers:{Prefer:'resolution=ignore-duplicates,return=minimal'},
   body:JSON.stringify(pids.map(pid=>({pid,label:label?label.slice(0,80):null})))},fetchImpl);
  if(!r)return 'not-configured';if(r.ok)return 'ok';return await missing(r)?'needs-migration':'error';
 }catch{return 'error';}
}
export async function removeStaff(pids:string[],fetchImpl:typeof fetch=fetch):Promise<StaffStatus>{
 if(!pids.length)return 'error';
 try{
  const r=await rest(`/analytics_excluded?pid=in.(${pids.join(',')})`,{method:'DELETE',headers:{Prefer:'return=minimal'}},fetchImpl);
  if(!r)return 'not-configured';if(r.ok)return 'ok';return await missing(r)?'needs-migration':'error';
 }catch{return 'error';}
}
