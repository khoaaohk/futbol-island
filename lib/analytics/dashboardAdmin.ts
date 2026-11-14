/**
 * Server side of the /admin dashboard (Nov 6 2026): the daily data layer (dailyAdmin.ts loadDailyLayer, the export's own
 * loader) trimmed to the series the dashboard draws (dashboard.ts wantSeries) and sent compact, plus the people status, the
 * D1/D7 cohorts and the feature start days for chart annotations. Reads only; after the admin session check.
 */
import type {AnalyticsStore} from './store';
import {oldestComputable} from './store';
import {addDays,dayBounds,dayList,type DailyRollup} from './core';
import {loadDailyLayer} from './dailyAdmin';
import {buildDailyLayer,type DailyLayer} from './daily';
import {COUNT_SINCE} from './countSince.generated';
import {wantSeries,type DashSeries,type DashboardData,type PeopleStatus,type CohortRow,type SameTime} from './dashboard';

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

/** "5:36 pm" (Pacific). */
export const clockLabel=(ms:number)=>new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',hour:'numeric',minute:'2-digit',hour12:true}).format(new Date(ms)).replace(/[\s\u202f]+/g,' ').toLowerCase();
/**
 * Today alone, like for like (Nov 13 2026; owner: the story compared today so far with ALL of yesterday): yesterday's rollup
 * from Pacific midnight to the same time of day (store.computeWindow, the old report's rule: report.ts), run through the layer's
 * own catalog so every series reads its yesterday-by-now value. null when yesterday's raw rows are gone or the store cannot
 * cut a window (UTC mode). people.* series are not here (another SQL function, whole days only): they "wait for a full day".
 */
export async function sameTimeOf(store:AnalyticsStore,layer:DailyLayer,rollups:DailyRollup[],keys:ReadonlySet<string>,now:Date):Promise<SameTime|null>{
 const today=layer.today,y=addDays(today,-1);
 if(layer.timeZone!=='America/Los_Angeles'||y<oldestComputable(today,'pacific'))return null;
 const [a]=dayBounds(today,'pacific'),[ya,yb]=dayBounds(y,'pacific'),cut=Math.min(yb,ya+Math.max(0,now.getTime()-a));
 const part=await store.computeWindow(y,new Date(ya).toISOString(),new Date(cut).toISOString());if(!part)return null;
 const L=buildDailyLayer({rollups:[...rollups.filter(r=>r.day!==y),{...part,day:y}],from:y,to:today,today,mode:'pacific'});
 const v:Record<string,number|null>={},nd:Record<string,[number,number]|null>={};
 for(const s of L.series){if(!keys.has(s.key))continue;const p=s.points[0];if(!p||p.day!==y)continue;
  v[s.key]=p.value===null?null:Math.round(p.value*1e6)/1e6;if(s.agg==='ratio')nd[s.key]=p.num!==undefined&&p.den!==undefined?[p.num,p.den]:null;}
 return {day:y,cutIso:new Date(cut).toISOString(),label:clockLabel(cut),v,nd};
}

export async function loadDashboard(store:AnalyticsStore,range:{from:string;to:string},now=new Date()):Promise<DashboardData>{
 const {layer,medianSessionMs,peopleStatus,cohorts,rollups}=await loadDailyLayer(store,range,now);
 const data=compactLayer(layer,{peopleStatus,cohorts,medianSessionMs,now});
 if(layer.partialDay&&layer.from===layer.to)try{data.sameTime=await sameTimeOf(store,layer,rollups,new Set(Object.keys(data.series)),now);}catch{data.sameTime=null;}
 return data;
}
