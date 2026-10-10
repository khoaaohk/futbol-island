/**
 * Save-code metrics for /admin (Oct 11 2026). Server only; called after the admin session check.
 *
 * Production: public.save_admin_metrics(p_from, p_to) from supabase/migrations/20261011_admin_save_metrics.sql, over PostgREST
 * with the server-only service-role key. Until that migration runs the function answers 404 and the dashboard says
 * "needs migration" (the rest of /admin is unaffected). Local previews and tests: memorySaveMetrics below, the TypeScript twin
 * of the SQL (tests/admin-save-metrics.cjs runs both on the same rows and checks they match).
 *
 * Aggregates only: counts, medians, sums. Never a code, a hash, a snapshot, a throttle bucket or anything per child.
 */
import {LIMITS,getSaveStore,monthsBefore} from './store';

export type SaveRetention={eligible:number;kept:number};
/** The raw answer, in the SQL function's own shape (snake_case), so the twin and the SQL compare one to one. */
export type RawSaveMetrics={
 today:string;from:string;to:string;
 total:number;active_1:number;active_7:number;active_30:number;returning:number;eligible:number;never_returned:number;
 retention:{d1:SaveRetention;d7:SaveRetention;d30:SaveRetention};
 median_age_days:number;median_lifetime_days:number;expiring_30:number;expiring_90:number;idle_180:number;
 syncs:number;avg_bytes:number;total_bytes:number;
 /** pg_total_relation_size('game_saves') (table + indexes + TOAST); null for the local preview store. */
 table_bytes:number|null;
 range:{created:number;returned:number;prev_created:number;prev_returned:number};
 by_day:{day:string;created:number}[];
 weeks:{week:string;created:number}[];
 throttle:{failed_tries:number;ip_locks:number;breaker_hours:number;hard_stop_hours:number;create_cap_ip:number;create_cap_day:number;mail_cap_ip:number;mail_cap_day:number;creates:number};
};
export type SaveMetricsStatus='ok'|'not-configured'|'table-missing'|'needs-migration'|'error';
export type SaveMetricsReport={status:SaveMetricsStatus;data:RawSaveMetrics|null};

const DAY=86_400_000;
const addDays=(day:string,n:number)=>new Date(Date.parse(day+'T00:00:00Z')+n*DAY).toISOString().slice(0,10);
const diffDays=(a:string,b:string)=>Math.round((Date.parse(a+'T00:00:00Z')-Date.parse(b+'T00:00:00Z'))/DAY);
/** Postgres percentile_cont(0.5): linear interpolation between the middle values; rounded to 0.1 as the SQL does. */
export function median(values:number[]):number{
 if(!values.length)return 0;
 const v=[...values].sort((a,b)=>a-b),pos=(v.length-1)/2,lo=Math.floor(pos),hi=Math.ceil(pos);
 return Math.round((v[lo]+(v[hi]-v[lo])*(pos-lo))*10)/10;
}
/** Monday of the ISO week holding `day` (Postgres date_trunc('week', …)). */
const weekStart=(day:string)=>{const d=new Date(day+'T00:00:00Z');return addDays(day,-((d.getUTCDay()+6)%7));};

type MemRow={createdOn:string;lastUsedOn:string;bytes:number;rev:number};
/** The memory store's data (lib/saves/store.ts createMemorySaveStore().data): only the fields the metrics read. */
export type MemorySaveData={saves:Record<string,MemRow>;throttle:Record<string,number>};

/** The TypeScript twin of public.save_admin_metrics(p_from, p_to). */
export function memorySaveMetrics(data:MemorySaveData,pFrom:string,pTo:string,now:Date):RawSaveMetrics{
 const t=now.toISOString().slice(0,10);
 let f=pFrom<pTo?pFrom:pTo,e=pFrom>pTo?pFrom:pTo;if(e>t)e=t;if(f>e)f=e;if(diffDays(e,f)>399)f=addDays(e,-399);
 const len=diffDays(e,f)+1,pf=addDays(f,-len),pe=addDays(f,-1);
 const rows=Object.values(data.saves);
 const n=(p:(r:MemRow)=>boolean)=>rows.filter(p).length;
 const ret=(d:number):SaveRetention=>({eligible:n(r=>r.createdOn<=addDays(t,-d)),kept:n(r=>r.createdOn<=addDays(t,-d)&&r.lastUsedOn>=addDays(r.createdOn,d))});
 const exp=(d:number)=>{const cut=monthsBefore(addDays(t,d),12);return n(r=>r.lastUsedOn<=cut);};
 const since=now.getTime()-DAY,th={failed_tries:0,ip_locks:0,breaker_hours:0,hard_stop_hours:0,create_cap_ip:0,create_cap_day:0,mail_cap_ip:0,mail_cap_day:0,creates:0};
 for(const [k,v] of Object.entries(data.throttle||{})){
  const i=k.lastIndexOf('|'),bucket=k.slice(0,i).slice(0,48),win=Number(k.slice(i+1));if(!(win>=since))continue;
  if(bucket==='f:global'){th.failed_tries+=v;if(v>=LIMITS.breaker)th.breaker_hours++;if(v>=LIMITS.hardStop)th.hard_stop_hours++;}
  else if(bucket.startsWith('f:ip:')&&v>=LIMITS.ipFailures)th.ip_locks++;
  else if(bucket==='c:global'){th.creates+=v;if(v>LIMITS.createPerDay)th.create_cap_day++;}
  else if(bucket.startsWith('c:ip:')&&v>LIMITS.createPerIp)th.create_cap_ip++;
  else if(bucket==='m:global'){if(v>LIMITS.mailPerDay)th.mail_cap_day++;}
  else if(bucket.startsWith('m:ip:')&&v>LIMITS.mailPerIp)th.mail_cap_ip++;
 }
 const days:string[]=[];for(let d=f;d<=e;d=addDays(d,1))days.push(d);
 const w0=weekStart(t),weeks=Array.from({length:12},(_,i)=>addDays(w0,-7*(11-i)));
 const inRange=(r:MemRow,a:string,b:string)=>r.createdOn>=a&&r.createdOn<=b;
 return {
  today:t,from:f,to:e,
  total:rows.length,active_1:n(r=>r.lastUsedOn>=t),active_7:n(r=>r.lastUsedOn>=addDays(t,-6)),active_30:n(r=>r.lastUsedOn>=addDays(t,-29)),
  returning:n(r=>r.lastUsedOn>r.createdOn),eligible:n(r=>r.createdOn<t),never_returned:n(r=>r.createdOn<t&&r.lastUsedOn<=r.createdOn),
  retention:{d1:ret(1),d7:ret(7),d30:ret(30)},
  median_age_days:median(rows.map(r=>diffDays(t,r.createdOn))),median_lifetime_days:median(rows.map(r=>diffDays(r.lastUsedOn,r.createdOn))),
  expiring_30:exp(30),expiring_90:exp(90),idle_180:n(r=>r.lastUsedOn<addDays(t,-180)),
  syncs:rows.reduce((a,r)=>a+r.rev-1,0),avg_bytes:rows.length?Math.round(rows.reduce((a,r)=>a+r.bytes,0)/rows.length):0,total_bytes:rows.reduce((a,r)=>a+r.bytes,0),
  table_bytes:null,
  range:{created:n(r=>inRange(r,f,e)),returned:n(r=>inRange(r,f,e)&&r.lastUsedOn>r.createdOn),prev_created:n(r=>inRange(r,pf,pe)),prev_returned:n(r=>inRange(r,pf,pe)&&r.lastUsedOn>r.createdOn)},
  by_day:days.map(day=>({day,created:n(r=>r.createdOn===day)})),
  weeks:weeks.map(week=>({week,created:n(r=>r.createdOn>=week&&r.createdOn<addDays(week,7))})),
  throttle:th,
 };
}

/** Numbers from PostgREST may arrive as strings (bigint) or with a trailing .0: normalise the whole answer. */
export function normaliseMetrics(raw:unknown):RawSaveMetrics{
 const fix=(v:unknown):unknown=>Array.isArray(v)?v.map(fix):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,fix(x)])):typeof v==='string'&&/^-?\d+(\.\d+)?$/.test(v)?Number(v):v;
 return fix(raw) as RawSaveMetrics;
}

/** Calls save_admin_metrics over PostgREST. Throws 'needs-migration' when the function is missing (404). */
export async function supabaseSaveMetrics(url:string,serviceKey:string,from:string,to:string,fetchImpl:typeof fetch=fetch):Promise<RawSaveMetrics>{
 const res=await fetchImpl(url.replace(/\/+$/,'')+'/rest/v1/rpc/save_admin_metrics',{method:'POST',cache:'no-store',
  headers:{apikey:serviceKey,Authorization:`Bearer ${serviceKey}`,'Content-Type':'application/json'},body:JSON.stringify({p_from:from,p_to:to})});
 if(res.status===404)throw new Error('needs-migration');
 if(!res.ok)throw new Error(`save metrics ${res.status}`);
 return normaliseMetrics(JSON.parse(await res.text()));
}

/** The save-code block of the admin report for [from, to]. Never throws: the status says what is missing. */
export async function loadSaveMetrics(from:string,to:string,now=new Date()):Promise<SaveMetricsReport>{
 const store=getSaveStore();
 if(!store)return {status:'not-configured',data:null};
 let version=0;try{version=await store.schemaVersion();}catch{}
 if(version<1)return {status:'table-missing',data:null};
 try{
  if(store.kind==='memory')return {status:'ok',data:memorySaveMetrics((store as unknown as {data:MemorySaveData}).data,from,to,now)};
  return {status:'ok',data:await supabaseSaveMetrics(process.env.NEXT_PUBLIC_SUPABASE_URL||'',process.env.SUPABASE_SERVICE_ROLE_KEY||'',from,to)};
 }catch(e){return {status:(e as Error)?.message==='needs-migration'?'needs-migration':'error',data:null};}
}
