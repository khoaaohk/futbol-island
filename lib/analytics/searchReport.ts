/**
 * "Search arrivals" on /admin's Marketing tab (Nov 10 2026): the stand-in for a search console, built only from what the site
 * already counts. Pure (tests/seo-discovery.cjs drives it); built on the server from the range's daily rollups.
 *   - arrivals by ENGINE and by LANDING PAGE, per day and per Monday week, from the se:<landing>:<engine> counters
 *     (searchIds.ts; counted since SEARCH_SINCE). One count = one tab session whose first page came from that engine.
 *   - first seen: the first day a landing page got a search arrival, over the range and the earlier days handed in.
 *   - by referring host: sessions whose referrer host is a search engine or AI assistant, from the rollups' referrer dimension.
 *     That one exists for every day since tracking began, so it also covers days before the counters (no landing page there).
 * EXACT numbers, like the rest of the Marketing tab. No search words anywhere: search engines do not send them.
 */
import type {DailyRollup} from './core';
import {ENGINES,SEARCH_SINCE,engineKind,engineLabel,engineOf,landingPath,parseSearchId,type EngineKind} from './searchIds';

export type SearchEngineRow={id:string;label:string;kind:EngineKind;sessions:number};
export type SearchLanding={path:string;sessions:number;firstSeen:string|null;engines:{id:string;label:string;sessions:number}[]};
export type SearchPeriod={key:string;days:number;total:number;search:number;ai:number;byEngine:Record<string,number>};
export type SearchReport={
 hasData:boolean;since:string;
 total:number;search:number;ai:number;
 engines:SearchEngineRow[];landings:SearchLanding[];
 /** One row per day of the range, and per week (key = the week's Monday; `days` = how many of its days are in the range). */
 daily:SearchPeriod[];weekly:SearchPeriod[];
 /** From the referrer dimension (every tracked day): sessions per engine and per day. */
 hosts:{total:number;engines:SearchEngineRow[];daily:{day:string;total:number}[]};
};
type Roll=Pick<DailyRollup,'day'|'counts'>&{dims?:Partial<Pick<DailyRollup['dims'],'referrer'>>};

/** The Monday of a day's week (YYYY-MM-DD, calendar arithmetic only). */
export function weekStart(day:string):string{
 const t=Date.parse(day+'T00:00:00Z'),dow=(new Date(t).getUTCDay()+6)%7;
 return new Date(t-dow*86_400_000).toISOString().slice(0,10);
}
const ORDER=new Map(ENGINES.map((e,i)=>[e[0],i]));
const rows=(by:Record<string,number>):SearchEngineRow[]=>Object.entries(by).filter(([,n])=>n>0).map(([id,sessions])=>({id,label:engineLabel(id),kind:engineKind(id) as EngineKind,sessions}))
 .sort((a,b)=>b.sessions-a.sessions||(ORDER.get(a.id)??99)-(ORDER.get(b.id)??99));
const period=(key:string):SearchPeriod=>({key,days:0,total:0,search:0,ai:0,byEngine:{}});
function addTo(p:SearchPeriod,engine:string,n:number){p.total+=n;if(engineKind(engine)==='ai')p.ai+=n;else p.search+=n;p.byEngine[engine]=(p.byEngine[engine]||0)+n;}

export function buildSearch(rollups:readonly Roll[],earlier:readonly Pick<DailyRollup,'day'|'counts'>[]=[]):SearchReport{
 const byEngine:Record<string,number>={},land=new Map<string,{n:number;by:Record<string,number>}>(),first=new Map<string,string>();
 const daily:SearchPeriod[]=[],weeks=new Map<string,SearchPeriod>();
 const hostBy:Record<string,number>={},hostDaily:{day:string;total:number}[]=[];
 const seen=(key:string,day:string)=>{const f=first.get(key);if(!f||day<f)first.set(key,day);};
 for(const r of earlier)for(const [id,n] of Object.entries(r.counts||{})){const p=n>0?parseSearchId(id):null;if(p)seen(p.key,r.day);}
 for(const r of [...rollups].sort((a,b)=>a.day<b.day?-1:1)){
  const d=period(r.day),wk=weekStart(r.day),w=weeks.get(wk)??weeks.set(wk,period(wk)).get(wk)!;d.days=1;w.days++;
  for(const [id,n] of Object.entries(r.counts||{})){
   const p=n>0?parseSearchId(id):null;if(!p)continue;
   addTo(d,p.engine,n);addTo(w,p.engine,n);byEngine[p.engine]=(byEngine[p.engine]||0)+n;seen(p.key,r.day);
   const l=land.get(p.key)??land.set(p.key,{n:0,by:{}}).get(p.key)!;l.n+=n;l.by[p.engine]=(l.by[p.engine]||0)+n;
  }
  daily.push(d);
  let ht=0;for(const [host,c] of Object.entries(r.dims?.referrer||{})){const e=engineOf(host),n=c?.s||0;if(e&&n>0){hostBy[e]=(hostBy[e]||0)+n;ht+=n;}}
  hostDaily.push({day:r.day,total:ht});
 }
 const engines=rows(byEngine),total=engines.reduce((a,e)=>a+e.sessions,0),ai=engines.filter(e=>e.kind==='ai').reduce((a,e)=>a+e.sessions,0);
 const landings:SearchLanding[]=[...land].map(([key,l])=>({path:landingPath(key),sessions:l.n,firstSeen:first.get(key)??null,engines:rows(l.by).map(e=>({id:e.id,label:e.label,sessions:e.sessions}))}))
  .sort((a,b)=>b.sessions-a.sessions||(a.path<b.path?-1:1));
 const hostEngines=rows(hostBy),hostTotal=hostEngines.reduce((a,e)=>a+e.sessions,0);
 return {hasData:total>0||hostTotal>0,since:SEARCH_SINCE,total,search:total-ai,ai,engines,landings,daily,weekly:[...weeks.values()],hosts:{total:hostTotal,engines:hostEngines,daily:hostDaily}};
}
