/**
 * Server side of the /admin dashboard (Nov 6 2026): the daily data layer (dailyAdmin.ts loadDailyLayer, the export's own
 * loader) trimmed to the series the dashboard draws (dashboard.ts wantSeries) and sent compact, plus the people status, the
 * D1/D7 cohorts and the feature start days for chart annotations. Reads only; after the admin session check.
 */
import type {AnalyticsStore} from './store';
import {addDays,dayList} from './core';
import {loadDailyLayer} from './dailyAdmin';
import type {DailyLayer} from './daily';
import {COUNT_SINCE} from './countSince.generated';
import {wantSeries,type DashSeries,type DashboardData,type PeopleStatus,type CohortRow} from './dashboard';

/** Feature launches the charts annotate: the first day a counter family was sent (countSince.generated.ts, from git). */
const RELEASES:[RegExp,string][]=[[/^en:/,'Engagement cards'],[/^su:/,'Summit Isle'],[/^wa:/,'Water and swimming'],[/^sh:/,'Kit Shop'],[/^mp:/,'Play with friends'],
 [/^em:/,'Emotes'],[/^mk:/,'Tour page at /'],[/^lm:/,'Live matches'],[/^mm:/,'Investor page'],[/^fi:start$/,'Fishing funnel']];
export function releasesFrom(since:Record<string,readonly string[]>,from:string,to:string):{day:string;label:string}[]{
 const first=new Map<string,string>();
 for(const [day,ids] of Object.entries(since))for(const id of ids)for(const [re,label] of RELEASES)if(re.test(id)&&(!first.has(label)||day<first.get(label)!))first.set(label,day);
 const firstDay=Object.keys(since).sort()[0];
 return [...first.entries()].filter(([,day])=>day>firstDay&&day>=from&&day<=to).map(([label,day])=>({day,label})).sort((a,b)=>a.day<b.day?-1:a.day>b.day?1:a.label.localeCompare(b.label));
}

/** The layer → the dashboard's compact data. `days` = the range plus up to as many loaded days before it. */
export function compactLayer(layer:DailyLayer,{peopleStatus,cohorts,medianSessionMs,now}:{peopleStatus:PeopleStatus;cohorts:CohortRow[];medianSessionMs:number|null;now:Date}):DashboardData{
 const n=dayList(layer.from,layer.to).length,lo=addDays(layer.from,-n),first=lo<layer.loadedFrom?layer.loadedFrom:lo;
 const pre=first<layer.from?dayList(first,addDays(layer.from,-1)):[],days=[...pre,...layer.days];
 const series:Record<string,DashSeries>={};
 for(const s of layer.series){if(!wantSeries(s))continue;
  const at=new Map([...s.prior,...s.points].map(p=>[p.day,p]));
  const v=days.map(d=>{const p=at.get(d);return p&&p.value!==null?Math.round(p.value*1e6)/1e6:null;});
  const ratio=s.agg==='ratio',nd=ratio?days.map(d=>{const p=at.get(d);return p&&p.num!==undefined&&p.den!==undefined?[p.num,p.den] as [number,number]:null;}):undefined;
  series[s.key]={key:s.key,label:s.label,unit:s.unit,agg:s.agg,...(s.scale?{scale:s.scale}:{}),how:s.how,source:s.source,trackedSince:s.trackedSince,fullSince:s.fullSince,v,...(nd?{nd}:{})};}
 const h=layer.hours;
 return {version:1,generatedAt:now.toISOString(),from:layer.from,to:layer.to,today:layer.today,partialDay:layer.partialDay,timeZone:layer.timeZone,
  days,start:pre.length,utcDays:layer.utcDays,loadedFrom:layer.loadedFrom,series,
  hours:{sessions:{status:h.sessions.status,days:h.sessions.days,hours:h.sessions.hours.map(r=>({hour:r.hour,sessions:r.sessions})),note:h.sessions.note},
   investor:{grid:h.investor.grid,hours:h.investor.hours,total:h.investor.total,note:h.investor.note},note:h.note},
  people:{status:peopleStatus,cohorts,windowDays:14},gaps:layer.gaps,releases:releasesFrom(COUNT_SINCE,days[0]??layer.from,layer.to),medianSessionMs};
}

export async function loadDashboard(store:AnalyticsStore,range:{from:string;to:string},now=new Date()):Promise<DashboardData>{
 const {layer,medianSessionMs,peopleStatus,cohorts}=await loadDailyLayer(store,range,now);
 return compactLayer(layer,{peopleStatus,cohorts,medianSessionMs,now});
}
