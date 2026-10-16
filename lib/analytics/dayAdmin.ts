/**
 * Server side of /admin's day, players and player views (Oct 16 2026). Server only; called after the admin session check
 * (app/api/admin/day-sessions, /players, /player). Calls analytics_day_sessions / analytics_players / analytics_player_sessions
 * (supabase/migrations/20261019_analytics_day_sessions.sql) over PostgREST with the service-role key, like liveAdmin.ts. Reads
 * only, never throws (a 404 = the migration has not run, and the panel says which file to paste). Each answer is cached 30 s.
 */
import {regionName} from './regions';
import {rpc} from './liveAdmin';
import type {LiveStatus} from './live';
import {DAY_RE,PID_RE,emptyDay,emptyPlayer,emptyPlayers,shapeDay,shapePlayer,shapePlayers,type DayReport,type PlayerReport,type PlayersReport} from './day';

export const DAY_CACHE_MS=30_000;
const cache=new Map<string,{at:number;value:unknown}>();
type Opts={fetchImpl?:typeof fetch;now?:number};

async function cached<T extends {status:LiveStatus}>(key:string,{fetchImpl=fetch,now=Date.now()}:Opts,fn:string,args:unknown,shape:(j:unknown)=>T,empty:(s:LiveStatus)=>T):Promise<T>{
 const hit=cache.get(key);if(hit&&now-hit.at<DAY_CACHE_MS)return hit.value as T;
 let out:T;
 try{const r=await rpc(fn,args,fetchImpl);out=!r?empty('not-configured'):r.status===404?empty('needs-migration'):r.status>=400?empty('error'):shape(r.json);}
 catch{out=empty('error');}
 if(out.status==='ok'){if(cache.size>200)cache.clear();cache.set(key,{at:now,value:out});}
 return out;
}
export const validDay=(d:string|null|undefined):d is string=>!!d&&DAY_RE.test(d)&&Number.isFinite(Date.parse(d+'T12:00:00Z'));

export function loadDay(day:string,o:Opts={}):Promise<DayReport>{
 return cached('d:'+day,o,'analytics_day_sessions',{p_day:day,p_limit:500},j=>shapeDay(j,regionName),s=>emptyDay(s,day));
}
export function loadPlayers(from:string,to:string,o:Opts={}):Promise<PlayersReport>{
 return cached(`p:${from}:${to}`,o,'analytics_players',{p_from:from,p_to:to,p_limit:500},shapePlayers,s=>emptyPlayers(s,from,to));
}
export function loadPlayer(pid:string,o:Opts={}):Promise<PlayerReport>{
 if(!PID_RE.test(pid))return Promise.resolve(emptyPlayer('ok',null));
 return cached('i:'+pid,o,'analytics_player_sessions',{p_pid:pid,p_limit:200},j=>shapePlayer(j,regionName),s=>emptyPlayer(s,pid));
}
