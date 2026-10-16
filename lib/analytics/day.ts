/**
 * Players by day and by player (Oct 16 2026; user: "for players today, can we have that be clickable and into more detail and
 * list each user. same as the on now", then "i basically want to know by individual level"). Pure and client-safe: the shapes
 * and parsing of analytics_day_sessions / analytics_players / analytics_player_sessions
 * (supabase/migrations/20261019_analytics_day_sessions.sql). Server side: lib/analytics/dayAdmin.ts; the slide-out:
 * app/admin/LivePanel.tsx (modes "day", "players", "player"). Same privacy as live.ts: a 6-hex `sid` per session and 6 hex of
 * a further hash per player (12 kept for the drill-down), never a code, a raw id, an IP or a name.
 */
import {LIVE_COUNT_KEYS,arr,bool,countriesOf,num,obj,shapeLiveRow,str,talliesOf,type CountryTally,type LiveCountKey,type LiveRow,type LiveStatus,type Names,type Tally} from './live';

export const DAY_MIGRATION='supabase/migrations/20261019_analytics_day_sessions.sql',DAY_OK_ROW='OK, day sessions installed';
/** Raw rows are kept this many days (analytics_pt_finalize); older days only have their frozen totals. */
export const RAW_DAYS=14;
export const DAY_RE=/^\d{4}-\d{2}-\d{2}$/,PID_RE=/^[0-9a-f]{12}$/;

export type AreaTally={key:string;n:number|null;seconds:number};
export type Split<K extends string>=Record<K,number>;
export type RowTotals={sessions:number;players:number|null;seconds:number;byArea:AreaTally[];byCountry:CountryTally[];bySource:Tally[];byDevice:Tally[];
 returning:Split<'new'|'returning'|'unknown'>|null;code:Split<'with'|'without'|'unknown'>|null;counts:Record<string,number>};
export type DayReport=RowTotals&{status:LiveStatus;day:string;generatedAt:string;partial:boolean;oldestDay:string;tz:string|null;visitors:number;rows:LiveRow[];truncated:boolean};
export type PlayerRow={pid:string;firstSeen:string;lastSeen:string;sessions:number;daysPlayed:number;seconds:number;areas:{key:string;seconds:number}[];
 devices:string[];countries:string[];regions:string[];sources:string[];hasCode:boolean|null;returning:boolean|null;counts:Record<LiveCountKey,number>};
export type PlayersReport={status:LiveStatus;from:string;to:string;generatedAt:string;partial:boolean;oldestDay:string;players:number;sessions:number;
 unattributed:number;truncated:boolean;rows:PlayerRow[]};
export type PlayerReport=RowTotals&{status:LiveStatus;pid:string|null;generatedAt:string;firstSeen:string|null;lastSeen:string|null;daysPlayed:number;
 partial:boolean;oldestDay:string;rows:LiveRow[];truncated:boolean};

const strs=(v:unknown)=>arr(v).filter((x):x is string=>typeof x==='string'&&!!x);
const split=<K extends string>(v:unknown,keys:readonly K[]):Split<K>|null=>{const o=v&&typeof v==='object'&&!Array.isArray(v)?obj(v):null;return o?Object.fromEntries(keys.map(k=>[k,num(o[k])])) as Split<K>:null;};
const areaTallies=(v:unknown):AreaTally[]=>arr(v).map(t=>{const o=obj(t);return {key:str(o.key)||'',n:o.n===null||o.n===undefined?null:num(o.n),seconds:num(o.seconds)};}).filter(t=>t.key);
const countsOf=(v:unknown)=>Object.fromEntries(Object.entries(obj(v)).map(([k,n])=>[k,num(n)]));
function totals(r:Record<string,unknown>,names?:Names):RowTotals{
 return {sessions:num(r.sessions),players:r.players===null||r.players===undefined?null:num(r.players),seconds:num(r.seconds),byArea:areaTallies(r.by_area),
  byCountry:countriesOf(r.by_country,names),bySource:talliesOf(r.by_source),byDevice:talliesOf(r.by_device),
  returning:split(r.returning,['new','returning','unknown'] as const),code:split(r.code,['with','without','unknown'] as const),counts:countsOf(r.counts)};
}
const EMPTY_TOTALS:RowTotals={sessions:0,players:null,seconds:0,byArea:[],byCountry:[],bySource:[],byDevice:[],returning:null,code:null,counts:{}};

export const emptyDay=(status:LiveStatus,day=''):DayReport=>({...EMPTY_TOTALS,status,day,generatedAt:new Date(0).toISOString(),partial:false,oldestDay:'',tz:null,visitors:0,rows:[],truncated:false});
export function shapeDay(raw:unknown,names?:Names):DayReport{
 const r=obj(raw);
 return {...totals(r,names),status:'ok',day:str(r.day)||'',generatedAt:str(r.generated_at)||new Date().toISOString(),partial:r.partial===true,
  oldestDay:str(r.oldest_day)||'',tz:str(r.tz),visitors:num(r.visitors),rows:arr(r.rows).map(x=>shapeLiveRow(x,names)),truncated:r.truncated===true};
}
export const emptyPlayers=(status:LiveStatus,from='',to=''):PlayersReport=>({status,from,to,generatedAt:new Date(0).toISOString(),partial:false,oldestDay:'',players:0,sessions:0,unattributed:0,truncated:false,rows:[]});
export function shapePlayers(raw:unknown):PlayersReport{
 const r=obj(raw);
 return {status:'ok',from:str(r.from)||'',to:str(r.to)||'',generatedAt:str(r.generated_at)||new Date().toISOString(),partial:r.partial===true,oldestDay:str(r.oldest_day)||'',
  players:num(r.players),sessions:num(r.sessions),unattributed:num(r.unattributed),truncated:r.truncated===true,
  rows:arr(r.rows).map((x):PlayerRow=>{const o=obj(x),c=obj(o.counts);
   return {pid:typeof o.pid==='string'&&PID_RE.test(o.pid)?o.pid:'',firstSeen:str(o.first_seen)||'',lastSeen:str(o.last_seen)||'',sessions:num(o.sessions),
    daysPlayed:num(o.days_played),seconds:num(o.seconds),areas:arr(o.areas).map(a=>{const q=obj(a);return {key:str(q.key)||'',seconds:num(q.seconds)};}).filter(a=>a.key),
    devices:strs(o.devices),countries:strs(o.countries),regions:strs(o.regions),sources:strs(o.sources),hasCode:bool(o.has_code),returning:bool(o.returning),
    counts:Object.fromEntries(LIVE_COUNT_KEYS.map(k=>[k,num(c[k])])) as Record<LiveCountKey,number>};}).filter(p=>p.pid)};
}
export const emptyPlayer=(status:LiveStatus,pid:string|null=null):PlayerReport=>({...EMPTY_TOTALS,status,pid,generatedAt:new Date(0).toISOString(),firstSeen:null,lastSeen:null,daysPlayed:0,partial:false,oldestDay:'',rows:[],truncated:false});
export function shapePlayer(raw:unknown,names?:Names):PlayerReport{
 const r=obj(raw),pid=typeof r.pid==='string'&&PID_RE.test(r.pid)?r.pid:null;
 return {...totals(r,names),status:'ok',pid,generatedAt:str(r.generated_at)||new Date().toISOString(),firstSeen:str(r.first_seen),lastSeen:str(r.last_seen),
  daysPlayed:num(r.days_played),partial:r.partial===true,oldestDay:str(r.oldest_day)||'',rows:arr(r.rows).map(x=>shapeLiveRow(x,names)),truncated:r.truncated===true};
}

// ---- Days (Pacific calendar dates as YYYY-MM-DD) -------------------------------------------------------------------------------
export const addDays=(day:string,n:number)=>{const t=Date.parse(day+'T12:00:00Z');return Number.isFinite(t)?new Date(t+n*86_400_000).toISOString().slice(0,10):day;};
/** Today in Los Angeles. */
export const pacificDay=(ms=Date.now())=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(ms));
/** "Thu Oct 16". */
export const shortDay=(day:string)=>{const t=Date.parse(day+'T12:00:00Z');return Number.isFinite(t)?new Date(t).toLocaleDateString('en-US',{timeZone:'UTC',weekday:'short',month:'short',day:'numeric'}):day;};
/** "3:42 pm" in Los Angeles. */
export const clockPT=(iso:string|null|undefined)=>{const t=Date.parse(iso||'');return Number.isFinite(t)?new Date(t).toLocaleTimeString('en-US',{timeZone:'America/Los_Angeles',hour:'numeric',minute:'2-digit'}).toLowerCase():'—';};
/** "Oct 16, 3:42 pm" in Los Angeles. */
export const dateClockPT=(iso:string|null|undefined)=>{const t=Date.parse(iso||'');return Number.isFinite(t)?`${new Date(t).toLocaleDateString('en-US',{timeZone:'America/Los_Angeles',month:'short',day:'numeric'})}, ${clockPT(iso)}`:'—';};
