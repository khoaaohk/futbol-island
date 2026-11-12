/**
 * SERVER ONLY: the public island's numbers and kill switch for /admin (Nov 11 2026, phase 1; docs/multiplayer-public-island-plan-
 * 2026-11-11.md "Owner kill switch"). Called by app/api/admin/public-world/route.ts after the admin session check.
 *
 * Env var NAMES (server-only, never NEXT_PUBLIC_, never sent to the browser; values are set on Vercel, never read from a file):
 *   RELAY_STATS_URL, RELAY_STATS_TOKEN  the relay's GET /stats address and its STATS_TOKEN (already used by party-stats)
 *   RELAY_CONTROL_TOKEN                 the relay's CONTROL_TOKEN secret (bearer for POST /control)
 *   RELAY_CONTROL_URL (optional)        the relay's /control address; default: RELAY_STATS_URL with /stats replaced by /control
 *
 * RELAY SHAPES (relay v2.0, checked against multiplayer/relay/src/index.ts, worldLobbyCore.ts and relayStatsCore.ts on Nov 11 2026;
 * if they change, only shapePublicWorld and the two fetches below need to follow):
 *   GET  /control  (bearer CONTROL_TOKEN)  {public:boolean, tokenSet:boolean, shards:[{shard,n}], total:number}
 *   POST /control {public:boolean}         the same shape back; public:false also closes every world
 *   GET  /stats?from=D&to=D (bearer STATS_TOKEN, native)  {days:{[D]:{'rl:report_following':n,'rl:report_in_my_way':n,
 *                                          'rl:report_too_many_waves':n,'rl:report_something_else':n,'rl:quarantine':n,...}},...}
 * Missing fields read as "not reported yet" (null), never as zero, so the admin can tell the relay has not shipped them.
 * Counts only: never a name, made-up name, member id, shard name or address.
 */
import {relayStatsConfig} from './relayStatsAdmin';

export const PUBLIC_REPORT_KEYS=['following','inmyway','waves','other'] as const;
export type PublicWorldStatus={
 status:'ok'|'not-configured'|'unauthorized'|'error';
 day:string;
 /** Public worlds open for new players (the relay kill switch), or null if the relay does not report it yet. */
 open:boolean|null;
 worlds:number|null;
 players:number|null;
 /** Today's reports by reason (UTC day), null when the relay does not count them yet. */
 reports:Record<typeof PUBLIC_REPORT_KEYS[number],number>|null;
 quarantines:number|null;
 /** Whether POST /control can be called (RELAY_CONTROL_TOKEN is set). */
 canControl:boolean;
};
const n=(v:unknown)=>typeof v==='number'&&Number.isFinite(v)&&v>=0?Math.floor(v):null;
const o=(v:unknown)=>v&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,unknown>:{};
const b=(v:unknown)=>typeof v==='boolean'?v:null;

/** Admin reason key -> the relay's stats id (multiplayer/protocol/types.ts REPORT_REASON_IDS). */
export const RELAY_REPORT_IDS:Record<typeof PUBLIC_REPORT_KEYS[number],string>={following:'rl:report_following',inmyway:'rl:report_in_my_way',waves:'rl:report_too_many_waves',other:'rl:report_something_else'};
/** The ONE place that reads the relay's answers (shapes above). Pure, so tests feed it fixtures. `control` null = not fetched. */
export function shapePublicWorld(stats:unknown,control:unknown,day:string,canControl:boolean):PublicWorldStatus{
 const row=o(o(o(stats).days)[day]),c=o(control);
 const has=(id:string)=>Object.prototype.hasOwnProperty.call(row,id);
 const reports=PUBLIC_REPORT_KEYS.some(k=>has(RELAY_REPORT_IDS[k]))?Object.fromEntries(PUBLIC_REPORT_KEYS.map(k=>[k,n(row[RELAY_REPORT_IDS[k]])??0])) as PublicWorldStatus['reports']:null;
 return {status:'ok',day,canControl,
  open:b(c.public),worlds:Array.isArray(c.shards)?c.shards.length:null,players:n(c.total),
  reports,quarantines:has('rl:quarantine')?n(row['rl:quarantine'])??0:null};
}

export function publicControlConfig(env:Record<string,string|undefined>=process.env):{url:string;token:string}|null{
 const token=(env.RELAY_CONTROL_TOKEN||'').trim();if(!token)return null;
 const explicit=(env.RELAY_CONTROL_URL||'').trim(),stats=(env.RELAY_STATS_URL||'').trim();
 const url=explicit||(stats?stats.replace(/\/stats\/?$/,'')+'/control':'');
 return /^https?:\/\//.test(url)?{url,token}:null;
}

const empty=(status:PublicWorldStatus['status'],day:string,canControl:boolean):PublicWorldStatus=>({status,day,open:null,worlds:null,players:null,reports:null,quarantines:null,canControl});

type Opts={fetchImpl?:typeof fetch;now?:number;env?:Record<string,string|undefined>};
/** Today's public-world numbers: /stats for today's reports, /control for the switch and live counts (no cache: the admin
 *  opens this by hand). Never throws. Either half may be missing; the other still shows. */
export async function fetchPublicWorld({fetchImpl=fetch,now=Date.now(),env=process.env}:Opts={}):Promise<PublicWorldStatus>{
 const day=new Date(now).toISOString().slice(0,10),ctl=publicControlConfig(env),cfg=relayStatsConfig(env);
 if(!cfg&&!ctl)return empty('not-configured',day,false);
 const get=async(url:string,token:string):Promise<unknown|number>=>{
  try{const res=await fetchImpl(url,{cache:'no-store',headers:{Authorization:`Bearer ${token}`,Accept:'application/json'},signal:AbortSignal.timeout?.(5000)});
   if(!res.ok)return res.status;return JSON.parse(await res.text()||'null');}catch{return 0;}
 };
 let statsUrl='';if(cfg){const u=new URL(cfg.url);u.searchParams.set('from',day);u.searchParams.set('to',day);statsUrl=u.toString();}
 const [stats,control]=await Promise.all([cfg?get(statsUrl,cfg.token):Promise.resolve(null),ctl?get(ctl.url,ctl.token):Promise.resolve(null)]);
 const bad=(x:unknown)=>typeof x==='number';
 if((stats===null||bad(stats))&&(control===null||bad(control)))return empty([stats,control].some(x=>x===401||x===403)?'unauthorized':'error',day,!!ctl);
 return shapePublicWorld(bad(stats)?null:stats,bad(control)?null:control,day,!!ctl);
}

/** The kill switch: POST {public} to the relay's /control with the CONTROL_TOKEN bearer. */
export async function setPublicWorldOpen(open:boolean,{fetchImpl=fetch,env=process.env}:Opts={}):Promise<{ok:boolean;status:'ok'|'not-configured'|'unauthorized'|'error';open:boolean|null}>{
 const cfg=publicControlConfig(env);if(!cfg)return {ok:false,status:'not-configured',open:null};
 try{
  const res=await fetchImpl(cfg.url,{method:'POST',cache:'no-store',headers:{Authorization:`Bearer ${cfg.token}`,'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({public:open}),signal:AbortSignal.timeout?.(5000)});
  if(res.status===401||res.status===403)return {ok:false,status:'unauthorized',open:null};
  if(!res.ok)return {ok:false,status:'error',open:null};
  let j:unknown=null;try{j=JSON.parse(await res.text()||'null');}catch{}
  return {ok:true,status:'ok',open:b(o(j).public)??open};
 }catch{return {ok:false,status:'error',open:null};}
}
