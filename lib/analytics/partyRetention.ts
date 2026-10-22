/**
 * Play with friends retention and virality (Oct 22 2026, Phase C of docs/analytics-multiplayer-plan.md §6). Server side: the
 * types, the parser for public.analytics_party_retention / analytics_sponsor_weekly_read
 * (supabase/migrations/20261022_analytics_party_retention.sql), the SAME computation in TypeScript (the reference the tests hold
 * the SQL to), and the loader app/api/admin/party-retention calls after the admin session check. The admin card
 * (app/admin/PartyRetentionCard.tsx) imports the TYPES only.
 *
 * OFF BY DEFAULT behind NEXT_PUBLIC_ANALYTICS_PARTY_RETENTION=1 (legal sign-off first: the report links party play to the
 * anonymous player id on the server). Off: the loader answers status 'off' without calling Supabase.
 *
 * Aggregates only: every count under MIN_RETENTION_GROUP is null, and so is a rate resting on fewer eligible players. No player
 * id, session id or per-player row is ever returned.
 */
import {rpc} from './liveAdmin';

export const MIN_RETENTION_GROUP=10;
export const RETENTION_WINDOW_DAYS=14;
export const RETENTION_MIGRATION='supabase/migrations/20261022_analytics_party_retention.sql',RETENTION_OK_ROW='OK, party retention installed';
export const RETENTION_CACHE_MS=60_000;

export type RetentionStatus='ok'|'off'|'not-configured'|'needs-migration'|'error';
export type RetentionGroup={players:number|null;d1Eligible:number|null;d1Rate:number|null;d7Eligible:number|null;d7Rate:number|null};
export type WeeklyReach={weekStart:string;sessions:number|null;players:number|null;partyPlayers:number|null;partySessions:number|null;minutes:number|null};
export type PartyRetention={status:RetentionStatus;from:string;to:string;lastCompleteDay:string;windowDays:number;minGroup:number;
 groups:{party:RetentionGroup;solo:RetentionGroup};
 newPlayers:{sessions:number|null;invited:number|null;organic:number|null};
 virality:{guestNew:number|null;created:number|null;k:number|null};
 weekly:WeeklyReach[]};

/** The one switch (the same env the client reads; inlined at build time). */
export const partyRetentionAdminOn=():boolean=>process.env.NEXT_PUBLIC_ANALYTICS_PARTY_RETENTION==='1';

const emptyGroup=():RetentionGroup=>({players:null,d1Eligible:null,d1Rate:null,d7Eligible:null,d7Rate:null});
export const emptyRetention=(status:RetentionStatus,from='',to=''):PartyRetention=>({status,from,to,lastCompleteDay:'',windowDays:RETENTION_WINDOW_DAYS,
 minGroup:MIN_RETENTION_GROUP,groups:{party:emptyGroup(),solo:emptyGroup()},newPlayers:{sessions:null,invited:null,organic:null},
 virality:{guestNew:null,created:null,k:null},weekly:[]});

const num=(v:unknown):number|null=>typeof v==='number'&&Number.isFinite(v)?v:typeof v==='string'&&v.trim()!==''&&Number.isFinite(Number(v))?Number(v):null;
const obj=(v:unknown):Record<string,unknown>=>v&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,unknown>:{};
const str=(v:unknown)=>typeof v==='string'?v:'';
/** A count is shown only at MIN_RETENTION_GROUP or more (defence in depth: the SQL already nulls smaller ones). */
const sup=(v:unknown)=>{const n=num(v);return n!==null&&n>=MIN_RETENTION_GROUP?n:null;};
const kOf=(g:number|null,c:number|null)=>g!==null&&c!==null&&c>0?Math.round(g/c*100)/100:null;

function shapeGroup(raw:unknown):RetentionGroup{
 const g=obj(raw),d1=sup(g.d1_eligible),d7=sup(g.d7_eligible);
 return {players:sup(g.players),d1Eligible:d1,d1Rate:d1===null?null:num(g.d1_rate),d7Eligible:d7,d7Rate:d7===null?null:num(g.d7_rate)};
}
/** The SQL answer (jsonb) → PartyRetention. Unknown keys are dropped, so nothing else can reach the card. */
export function shapeRetention(raw:unknown,weeklyRaw:unknown=[]):PartyRetention{
 const r=obj(raw),gr=obj(r.groups),np=obj(r.new_players),vt=obj(r.virality);
 const guestNew=sup(vt.guest_new),created=sup(vt.created);
 return {status:'ok',from:str(r.from),to:str(r.to),lastCompleteDay:str(r.last_complete_day),windowDays:num(r.window_days)??RETENTION_WINDOW_DAYS,
  minGroup:num(r.min_group)??MIN_RETENTION_GROUP,groups:{party:shapeGroup(gr.party),solo:shapeGroup(gr.solo)},
  newPlayers:{sessions:sup(np.sessions),invited:sup(np.invited),organic:sup(np.organic)},
  virality:{guestNew,created,k:kOf(guestNew,created)},weekly:shapeWeekly(weeklyRaw)};
}
export function shapeWeekly(raw:unknown):WeeklyReach[]{
 if(!Array.isArray(raw))return [];
 return raw.map(x=>{const o=obj(x),d=obj(o.data);return {weekStart:str(o.week_start),sessions:sup(d.sessions),players:sup(d.players),
  partyPlayers:sup(d.party_players),partySessions:sup(d.party_sessions),minutes:sup(d.minutes)};}).filter(w=>/^\d{4}-\d{2}-\d{2}$/.test(w.weekStart));
}

// ---- the reference computation (tests hold the SQL to it) ----
export type RetentionSession={day:string;playerId:string|null;returning:boolean|null;counts:Record<string,number>};
const DAY=86_400_000;
export const addDays=(d:string,n:number)=>new Date(Date.parse(d+'T00:00:00Z')+n*DAY).toISOString().slice(0,10);
const r4=(x:number)=>Math.round(x*1e4)/1e4;
const has=(c:Record<string,number>,k:string)=>(c[k]||0)>0;

/** Same rules as analytics_party_retention: `today` = the UTC day the query runs; raw rows cover today-14 .. today. */
export function computeRetention(sessions:RetentionSession[],from:string,to:string,today:string):PartyRetention{
 const lo=from<=to?from:to,hi=from<=to?to:from;
 const f=lo>addDays(today,-14)?lo:addDays(today,-14),t=hi<today?hi:today,l=hi<addDays(today,-1)?hi:addDays(today,-1);
 const s=sessions.filter(x=>x.day>=f&&x.day<=t);
 const first=new Map<string,string>();
 for(const x of s)if(x.playerId&&(!first.has(x.playerId)||x.day<first.get(x.playerId)!))first.set(x.playerId,x.day);
 const acc={party:{players:0,d1n:0,d1b:0,d7n:0,d7b:0},solo:{players:0,d1n:0,d1b:0,d7n:0,d7b:0}};
 for(const [pid,c] of first){
  const mine=s.filter(x=>x.playerId===pid);
  const party=mine.some(x=>x.day===c&&has(x.counts,'mp:in'));
  const d1=mine.some(x=>x.day===addDays(c,1)),d7=mine.some(x=>x.day>=addDays(c,1)&&x.day<=addDays(c,7));
  const g=acc[party?'party':'solo'];g.players++;
  if(addDays(c,1)<=l){g.d1n++;if(d1)g.d1b++;}
  if(addDays(c,7)<=l){g.d7n++;if(d7)g.d7b++;}
 }
 const grp=(g:typeof acc.party):RetentionGroup=>{const ok=(n:number)=>n>=MIN_RETENTION_GROUP;
  return {players:ok(g.players)?g.players:null,d1Eligible:ok(g.d1n)?g.d1n:null,d1Rate:ok(g.d1n)?r4(g.d1b/g.d1n):null,
   d7Eligible:ok(g.d7n)?g.d7n:null,d7Rate:ok(g.d7n)?r4(g.d7b/g.d7n):null};};
 const fresh=s.filter(x=>x.returning===false),invited=fresh.filter(x=>has(x.counts,'mp:open_link')||has(x.counts,'mp:guest_new'));
 const total=(k:string)=>s.reduce((a,x)=>a+(x.counts[k]||0),0);
 const c=(n:number)=>n>=MIN_RETENTION_GROUP?n:null;
 const guestNew=c(total('mp:guest_new')),created=c(total('mp:created'));
 return {status:'ok',from:f,to:t,lastCompleteDay:l,windowDays:RETENTION_WINDOW_DAYS,minGroup:MIN_RETENTION_GROUP,
  groups:{party:grp(acc.party),solo:grp(acc.solo)},
  newPlayers:{sessions:c(fresh.length),invited:c(invited.length),organic:c(fresh.length-invited.length)},
  virality:{guestNew,created,k:kOf(guestNew,created)},weekly:[]};
}

// ---- the loader (server only) ----
const cache=new Map<string,{at:number;value:PartyRetention}>();
type Opts={fetchImpl?:typeof fetch;now?:number;on?:boolean};

/** Never throws. Off → 'off' (no Supabase call). Missing env → 'not-configured'; a 404 (function absent) → 'needs-migration'. */
export async function loadPartyRetention(from:string,to:string,{fetchImpl=fetch,now=Date.now(),on=partyRetentionAdminOn()}:Opts={}):Promise<PartyRetention>{
 if(!on)return emptyRetention('off',from,to);
 const key=from+':'+to,hit=cache.get(key);if(hit&&now-hit.at<RETENTION_CACHE_MS)return hit.value;
 let out:PartyRetention;
 try{
  const r=await rpc('analytics_party_retention',{p_from:from,p_to:to},fetchImpl);
  if(!r)out=emptyRetention('not-configured',from,to);
  else if(r.status===404)out=emptyRetention('needs-migration',from,to);
  else if(r.status>=400)out=emptyRetention('error',from,to);
  else{
   // Weekly sponsor reach: store any finished week not stored yet (idempotent, never overwrites), then read the newest.
   let weekly:unknown=[];
   try{await rpc('analytics_sponsor_week_snapshot',{},fetchImpl);const w=await rpc('analytics_sponsor_weekly_read',{p_limit:12},fetchImpl);if(w&&w.status<400)weekly=w.json;}catch{}
   out=shapeRetention(r.json,weekly);
  }
 }catch{out=emptyRetention('error',from,to);}
 if(out.status==='ok'){if(cache.size>100)cache.clear();cache.set(key,{at:now,value:out});}
 return out;
}
