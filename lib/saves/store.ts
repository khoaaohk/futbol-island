/**
 * Save storage (docs/accounts-design.md §4.5; Oct 9 2026). Server only.
 *
 * Production: Supabase through the server-only service-role key, calling the security-definer functions in
 * supabase/migrations/20261010_game_saves.sql over PostgREST (fetch only: no client library, nothing shipped to the browser).
 * game_saves and save_throttle have RLS on with no policies, and anon/authenticated have no grants.
 * Tests and local previews: the memory store below, with the same rules (tests/game-saves.cjs runs both against each other).
 *
 * The code itself never reaches the store: only HMAC-SHA256(SAVE_CODE_PEPPER, normalised code) as 64 hex characters.
 * IP addresses never reach it either: throttle buckets are a day-salted hash, and each day's salt is deleted nightly.
 */
import {randomBytes} from 'crypto';
import * as fs from 'fs';

/** Throttle rules (doc §5.2). The SQL uses the same numbers; tests/game-saves.cjs checks they match. */
export const LIMITS={
 /** Failed restores/checks per IP bucket per 10 minutes, then nothing is looked up until the window rolls. Success resets. */
 ipFailures:10,ipWindowMin:10,
 /** Site-wide failures per hour that switch restore to "ask a grown-up" (grown-up requests only, and ≤ 3 failures per IP). */
 breaker:500,breakerIpFailures:3,
 /** Hard stop: past this many failures in the hour nothing is looked up at all (caps a distributed attack at ~14k a day). */
 hardStop:600,
 /** New saves per IP bucket per hour (a class of 30 behind one school IP still fits) and site-wide per day. */
 createPerIp:60,createPerDay:2000,
 /** Grown-up emails per IP bucket per hour and site-wide per day. */
 mailPerIp:3,mailPerDay:300,
} as const;

export type LookupResult={ok:true;rev:number;snapshot?:unknown}|{ok:false};
export type PutResult={ok:true;rev:number}|{ok:false;conflict:true;rev:number}|{ok:false;conflict?:false};
export interface SaveStore{
 kind:'supabase'|'memory';
 /** The installed save schema version (0 when the migration has not run). */
 schemaVersion():Promise<number>;
 salt(day:string):Promise<string>;
 /** Inserts a new save. ok:false means the hash already exists (a code collision): the route draws a new code. */
 create(hash:string,snapshot:unknown,bytes:number):Promise<{ok:boolean;rev?:number}>;
 /** Check (want=false) or restore (want=true), throttled atomically; marks the save used. */
 lookup(hash:string,bucket:string,grownup:boolean,want:boolean,now:Date):Promise<LookupResult>;
 /** Compare-and-set on rev. A missing save counts as a failed try, like a wrong restore. */
 put(hash:string,baseRev:number,snapshot:unknown,bytes:number,bucket:string,now:Date):Promise<PutResult>;
 /** Deletes a save. No answer either way; a missing save counts as a failed try. */
 remove(hash:string,bucket:string,now:Date):Promise<void>;
 /** Counts one hit in `bucket` for a window of `minutes`; false once the count is over `limit`. */
 hit(bucket:string,limit:number,minutes:number,now:Date):Promise<boolean>;
 /** Nightly: saves unused for 12 months, throttle rows older than a day, salts from before today. */
 purge(now:Date):Promise<{saves:number;throttle:number}>;
 stats():Promise<{saves:number}>;
}

const winStart=(now:Date,minutes:number)=>Math.floor(now.getTime()/(minutes*60_000))*minutes*60_000;
export const utcDay=(now:Date)=>now.toISOString().slice(0,10);
/** 12 calendar months before `day` (YYYY-MM-DD), as Postgres' `current_date - interval '12 months'` gives it. */
export function monthsBefore(day:string,months:number){
 const [y,m,d]=day.split('-').map(Number);const t=new Date(Date.UTC(y,m-1-months,1));
 const last=new Date(Date.UTC(t.getUTCFullYear(),t.getUTCMonth()+1,0)).getUTCDate();
 return new Date(Date.UTC(t.getUTCFullYear(),t.getUTCMonth(),Math.min(d,last))).toISOString().slice(0,10);
}

type Row={hash:string;snapshot:unknown;bytes:number;rev:number;createdOn:string;lastUsedOn:string;codeVersion:number;guardianId:null};
type MemoryData={saves:Record<string,Row>;throttle:Record<string,number>;salts:Record<string,string>};

export function createMemorySaveStore(file?:string):SaveStore&{data:MemoryData}{
 let data:MemoryData={saves:{},throttle:{},salts:{}};
 // File mode re-reads before every call: Next can load this module once per route bundle, and each copy must see the others' writes.
 const load=()=>{if(file&&fs.existsSync(file)){try{data={saves:{},throttle:{},salts:{},...JSON.parse(fs.readFileSync(file,'utf8'))};}catch{}}};
 load();
 const save=()=>{if(file)fs.writeFileSync(file,JSON.stringify(data));};
 const tkey=(bucket:string,win:number)=>`${bucket}|${win}`;
 const count=(bucket:string,minutes:number,now:Date)=>data.throttle[tkey(bucket,winStart(now,minutes))]??0;
 const bump=(bucket:string,minutes:number,now:Date)=>{const k=tkey(bucket,winStart(now,minutes));data.throttle[k]=(data.throttle[k]??0)+1;return data.throttle[k];};
 /** Mirrors save_allowed() in the SQL. */
 const allowed=(bucket:string,grownup:boolean,now:Date)=>{
  const ip=count('f:'+bucket,LIMITS.ipWindowMin,now),glob=count('f:global',60,now);
  if(ip>=LIMITS.ipFailures||glob>=LIMITS.hardStop)return false;
  if(glob>=LIMITS.breaker&&(!grownup||ip>=LIMITS.breakerIpFailures))return false;
  return true;
 };
 const fail=(bucket:string,now:Date)=>{bump('f:'+bucket,LIMITS.ipWindowMin,now);bump('f:global',60,now);};
 return {
  kind:'memory',
  get data(){return data;},
  async schemaVersion(){load();return 1;},
  async salt(day){load();if(!data.salts[day]){data.salts[day]=randomBytes(32).toString('hex');save();}return data.salts[day];},
  async create(hash,snapshot,bytes){load();
   if(data.saves[hash])return {ok:false};
   const day=utcDay(new Date());
   data.saves[hash]={hash,snapshot:JSON.parse(JSON.stringify(snapshot)),bytes,rev:1,createdOn:day,lastUsedOn:day,codeVersion:1,guardianId:null};save();return {ok:true,rev:1};
  },
  async lookup(hash,bucket,grownup,want,now){load();
   if(!allowed(bucket,grownup,now)){save();return {ok:false};}
   const row=data.saves[hash];
   if(!row){fail(bucket,now);save();return {ok:false};}
   row.lastUsedOn=utcDay(now);delete data.throttle[tkey('f:'+bucket,winStart(now,LIMITS.ipWindowMin))];save();
   return want?{ok:true,rev:row.rev,snapshot:JSON.parse(JSON.stringify(row.snapshot))}:{ok:true,rev:row.rev};
  },
  async put(hash,baseRev,snapshot,bytes,bucket,now){load();
   if(!allowed(bucket,true,now))return {ok:false};
   const row=data.saves[hash];
   if(!row){fail(bucket,now);save();return {ok:false};}
   row.lastUsedOn=utcDay(now);
   if(row.rev!==baseRev){save();return {ok:false,conflict:true,rev:row.rev};}
   row.snapshot=JSON.parse(JSON.stringify(snapshot));row.bytes=bytes;row.rev++;save();return {ok:true,rev:row.rev};
  },
  async remove(hash,bucket,now){load();
   if(!allowed(bucket,true,now))return;
   if(data.saves[hash])delete data.saves[hash];else fail(bucket,now);save();
  },
  async hit(bucket,limit,minutes,now){load();const n=bump(bucket,minutes,now);save();return n<=limit;},
  async purge(now){load();
   const cutoff=monthsBefore(utcDay(now),12);let saves=0,throttle=0;
   for(const [h,r] of Object.entries(data.saves))if(r.lastUsedOn<cutoff){delete data.saves[h];saves++;}
   for(const k of Object.keys(data.throttle)){const win=Number(k.split('|').pop());if(win<now.getTime()-86_400_000){delete data.throttle[k];throttle++;}}
   for(const d of Object.keys(data.salts))if(d<utcDay(now))delete data.salts[d];
   save();return {saves,throttle};
  },
  async stats(){load();return {saves:Object.keys(data.saves).length};},
 };
}

export function createSupabaseSaveStore(url:string,serviceKey:string,fetchImpl:typeof fetch=fetch):SaveStore{
 const base=url.replace(/\/+$/,'')+'/rest/v1';
 const headers={apikey:serviceKey,Authorization:`Bearer ${serviceKey}`,'Content-Type':'application/json'};
 const saltCache=new Map<string,string>();
 // Errors carry the status only: never a body, a code hash or a URL with data in it.
 async function rpc<T>(fn:string,args:Record<string,unknown>):Promise<T>{
  const res=await fetchImpl(`${base}/rpc/${fn}`,{method:'POST',headers,body:JSON.stringify(args),cache:'no-store'});
  if(!res.ok)throw new Error(`save store ${res.status}`);
  const text=await res.text();return (text?JSON.parse(text):null) as T;
 }
 return {
  kind:'supabase',
  // A missing function (migration not run) answers 404: read as 0, and the game says "Saving isn't ready yet".
  async schemaVersion(){try{return Number(await rpc('save_schema_version',{}))||0;}catch{return 0;}},
  async salt(day){const hit=saltCache.get(day);if(hit)return hit;const s=await rpc<string>('save_salt',{p_day:day});if(saltCache.size>4)saltCache.clear();saltCache.set(day,s);return s;},
  async create(hash,snapshot,bytes){const r=await rpc<{ok:boolean;rev?:number}>('save_create',{p_hash:hash,p_snapshot:snapshot,p_bytes:bytes});return r?.ok?{ok:true,rev:r.rev}:{ok:false};},
  async lookup(hash,bucket,grownup,want){const r=await rpc<LookupResult>('save_lookup',{p_hash:hash,p_bucket:bucket,p_grownup:grownup,p_want:want});return r&&r.ok?r:{ok:false};},
  async put(hash,baseRev,snapshot,bytes,bucket){const r=await rpc<PutResult>('save_put',{p_hash:hash,p_base_rev:baseRev,p_snapshot:snapshot,p_bytes:bytes,p_bucket:bucket});return r??{ok:false};},
  async remove(hash,bucket){await rpc('save_delete',{p_hash:hash,p_bucket:bucket});},
  async hit(bucket,limit,minutes){return (await rpc<boolean>('save_hit',{p_bucket:bucket,p_limit:limit,p_minutes:minutes}))===true;},
  async purge(){const r=await rpc<{saves:number;throttle:number}>('save_purge',{});return {saves:Number(r?.saves)||0,throttle:Number(r?.throttle)||0};},
  async stats(){const r=await rpc<{saves:number}>('save_stats',{});return {saves:Number(r?.saves)||0};},
 };
}

let cached:SaveStore|null|undefined;
/**
 * The configured store, or null (the save routes answer "unavailable" and the game hides or explains saving).
 * Uses the same Supabase project and server-only key as the analytics (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY).
 * SAVE_LOCAL_FILE is a local-preview store (a JSON file) and is ignored on Vercel.
 */
export function getSaveStore():SaveStore|null{
 if(cached!==undefined)return cached;
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY,local=process.env.SAVE_LOCAL_FILE;
 if(local&&!process.env.VERCEL)cached=createMemorySaveStore(local);
 else if(url&&key)cached=createSupabaseSaveStore(url,key);
 else cached=null;
 return cached;
}
