/**
 * Server side of the daily data layer (Nov 6 2026): loads every day's rollup from TRACKING_START to the range's end (the same
 * loader as the report, report.ts loadRangeMerged, so frozen / live-computed / UTC stand-in days are the report's own), the
 * hourly session starts of the range's raw-retained days, and, once the proposed SQL has run, per-day people from raw rows.
 * Reads only. Called after the admin session check (app/api/admin/export).
 */
import type {AnalyticsStore} from './store';
import {oldestComputable} from './store';
import {TRACKING_START,addDays,dayIn,dayList,histMedianMs,mergeRollups} from './core';
import {loadRangeMerged} from './report';
import {buildDailyLayer,type DailyLayer,type PeopleDay} from './daily';
import {rpc} from './liveAdmin';
import {localPeopleOff,memoryDailyPeople} from './memoryPeople';

export type DailyPeopleStatus='ok'|'needs-sql'|'not-configured'|'error';

/** A D1 / D7 cohort row (the proposed SQL's `cohorts`): players first seen that day (inside the 14-day raw window) and how many
 *  played again the next day / 7 days later; null while that day has not ended. */
export type CohortRow={day:string;players:number;d1:number|null;d7:number|null};
/** Parses analytics_daily_people's JSON (the proposed SQL, or the memory store's stand-in). */
export function shapeDailyPeople(json:unknown):{days:PeopleDay[];cohorts:CohortRow[]}{
 const o=(json&&typeof json==='object'?json:{}) as {days?:unknown;cohorts?:unknown};
 const list=(v:unknown)=>Array.isArray(v)?(v as Record<string,unknown>[]).filter(x=>x&&typeof x.day==='string'):[];
 const n=(v:unknown)=>Number.isFinite(Number(v))?Number(v):0,nn=(v:unknown)=>v===null||v===undefined?null:n(v);
 return {days:list(o.days).map(x=>({day:String(x.day),players:n(x.players),sessions:n(x.sessions),returning:n(x.returning),fresh:n(x.new),unknown:n(x.unknown)})),
  cohorts:list(o.cohorts).map(x=>({day:String(x.day),players:n(x.players),d1:nn(x.d1),d7:nn(x.d7)}))};
}
/** Per-day people (docs/analytics-proposed/analytics_daily_people.sql). Until that function exists: 'needs-sql', no rows. */
export async function loadDailyPeople(from:string,to:string,fetchImpl:typeof fetch=fetch):Promise<{status:DailyPeopleStatus;days:PeopleDay[];cohorts:CohortRow[]}>{
 try{
  const r=await rpc('analytics_daily_people',{p_from:from,p_to:to},fetchImpl);
  if(!r)return {status:'not-configured',days:[],cohorts:[]};if(r.status===404)return {status:'needs-sql',days:[],cohorts:[]};if(r.status>=400)return {status:'error',days:[],cohorts:[]};
  return {status:'ok',...shapeDailyPeople(r.json)};
 }catch{return {status:'error',days:[],cohorts:[]};}
}

export async function loadDailyLayer(store:AnalyticsStore,range:{from:string;to:string},now=new Date(),{people=true}:{people?:boolean}={}):Promise<{layer:DailyLayer;medianSessionMs:number|null;peopleStatus:DailyPeopleStatus;cohorts:CohortRow[]}>{
 const mode=await store.timeMode(),today=dayIn(mode,now),start=range.from<TRACKING_START?range.from:TRACKING_START;
 const {rollups}=await loadRangeMerged(store,start,range.to,now);
 const oldestRaw=oldestComputable(today,mode);
 const hourly:{day:string;points:Awaited<ReturnType<AnalyticsStore['hourly']>>}[]=[];
 for(const day of dayList(range.from,range.to))if(day>=oldestRaw&&day<=today)try{hourly.push({day,points:await store.hourly(day)});}catch{}
 // People for the range and the same number of days before it (the previous period; raw rows reach back 14 days only).
 const peopleFrom=addDays(range.from,-dayList(range.from,range.to).length);
 let p:{status:DailyPeopleStatus;days:PeopleDay[];cohorts:CohortRow[]}=people?await loadDailyPeople(peopleFrom,range.to):{status:'not-configured',days:[],cohorts:[]};
 // A local preview's memory store (no Supabase): its raw rows answer the same question (memoryPeople.ts; off with ANALYTICS_LOCAL_PEOPLE=off).
 if(people&&p.status==='not-configured'&&store.kind==='memory'&&!localPeopleOff())
  p={status:'ok',...shapeDailyPeople(memoryDailyPeople((store as unknown as {data:Parameters<typeof memoryDailyPeople>[0]}).data,peopleFrom,range.to,now))};
 const layer=buildDailyLayer({rollups,from:range.from,to:range.to,today,mode,hourly,people:p.days});
 const inRange=rollups.filter(r=>r.day>=range.from&&r.day<=range.to),m=mergeRollups(inRange);
 return {layer,medianSessionMs:m.totals.sessions?histMedianMs(m.hist):null,peopleStatus:p.status,cohorts:p.cohorts};
}
