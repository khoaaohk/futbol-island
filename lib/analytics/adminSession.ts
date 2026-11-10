/**
 * Admin session epoch + cross-instance login budget (Nov 10 2026, abuse audit). Server only.
 * loadSessionEpoch(): every admin page/route awaits it right before verifySession; it refreshes this instance's copy of the
 * stored epoch (supabase/migrations/20261111_admin_session_epoch.sql) at most every 15 s, with a 1.5 s timeout. If the table is
 * missing the epoch stays 0 (the old behaviour); on a database error the last known epoch is kept.
 * bumpSessionEpoch(): "Sign out everywhere" (/api/admin/signout-all). Returns the new epoch, or 'missing' before the migration.
 * loginBudget(ip): 20 failed sign-ins per IP per hour across ALL instances (the save store's save_hit throttle, salted day IP
 * hash), on top of the per-instance lockout. Without a database it allows (the in-memory lockout still applies).
 */
import {setSessionEpoch,sessionEpoch} from './adminAuth';
import {getSaveStore} from '../saves/store';
import {ipBucket} from '../saves/server';

const FRESH_MS=15_000,TIMEOUT_MS=1_500;
export const LOGIN_FAILS_PER_IP_HOUR=20;
let loadedAt=-Infinity,inflight:Promise<number>|null=null;

function db(){const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;return url&&key?{url:url.replace(/\/+$/,'')+'/rest/v1/rpc/',key}:null;}
async function rpc(fn:string):Promise<{status:number;value:unknown}>{
 const d=db();if(!d)return {status:0,value:null};
 const res=await fetch(d.url+fn,{method:'POST',headers:{apikey:d.key,Authorization:`Bearer ${d.key}`,'Content-Type':'application/json'},body:'{}',cache:'no-store',signal:AbortSignal.timeout(TIMEOUT_MS)});
 if(!res.ok)return {status:res.status,value:null};
 const t=await res.text();return {status:200,value:t?JSON.parse(t):null};
}

export async function loadSessionEpoch(nowMs=Date.now()):Promise<number>{
 if(nowMs-loadedAt<FRESH_MS)return sessionEpoch();
 if(!inflight)inflight=(async()=>{
  try{const r=await rpc('admin_session_epoch');
   if(r.status===200&&Number.isInteger(Number(r.value)))setSessionEpoch(Number(r.value));
   loadedAt=Date.now();// a 404 (no migration) or no database: epoch stays as it is (0 unless bumped here)
  }catch{/* keep the last known epoch; try again on the next request */}
  finally{inflight=null;}
  return sessionEpoch();
 })();
 return inflight;
}

export async function bumpSessionEpoch():Promise<number|'missing'|'unavailable'>{
 try{const r=await rpc('admin_bump_session_epoch');
  if(r.status===404)return 'missing';
  if(r.status!==200||!Number.isInteger(Number(r.value)))return 'unavailable';
  setSessionEpoch(Number(r.value));loadedAt=Date.now();return Number(r.value);
 }catch{return 'unavailable';}
}

/** Counts one failed sign-in for this IP across instances; false once the IP is over its hourly budget. */
export async function loginBudget(ip:string,now=new Date()):Promise<boolean>{
 const store=getSaveStore();if(!store)return true;
 try{const bucket=ipBucket(await store.salt(now.toISOString().slice(0,10)),ip);return await store.hit('a:'+bucket,LOGIN_FAILS_PER_IP_HOUR,60,now);}
 catch{return true;}
}
