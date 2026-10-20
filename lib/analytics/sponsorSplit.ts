/**
 * The sponsor Overview's "by device" and "by country" drill-downs (Oct 20 2026). Pure and client-safe: the shape the server
 * sends, the parser for the SQL answer (supabase/migrations/20261021_analytics_sponsor_split.sql analytics_sponsor_split) and
 * the same computation in TypeScript for the local preview store (ANALYTICS_LOCAL_FILE) and the tests. Raw rows only, so the
 * last 14 days at most; a row under MIN_SPLIT_SESSIONS sessions is folded into `withheld`.
 */
import type {SessionRow} from './core';
import {SPONSOR_METRICS,sponsorMetricOf,type SponsorMetricId} from './sponsor';
import type {LiveStatus} from './live';

export const MIN_SPLIT_SESSIONS=5;
export const SPLIT_MIGRATION='supabase/migrations/20261021_analytics_sponsor_split.sql',SPLIT_OK_ROW='OK, sponsor split installed';
/** Per metric: the counter sum, except `reading`, which is foreground minutes (rounded). */
export type SplitMetrics=Partial<Record<SponsorMetricId,number>>;
export type SplitRow={key:string;sessions:number;metrics:SplitMetrics};
export type SponsorSplit={status:LiveStatus;from:string;to:string;windowDays:number;minSessions:number;sessions:number;
 devices:SplitRow[];countries:SplitRow[];withheld:{devices:{sessions:number;metrics:SplitMetrics};countries:{sessions:number;metrics:SplitMetrics}}};

export const emptySplit=(status:LiveStatus,from='',to=''):SponsorSplit=>({status,from,to,windowDays:14,minSessions:MIN_SPLIT_SESSIONS,sessions:0,devices:[],countries:[],
 withheld:{devices:{sessions:0,metrics:{}},countries:{sessions:0,metrics:{}}}});

const num=(v:unknown)=>typeof v==='number'&&Number.isFinite(v)?v:Number(v)||0;
function metricsOf(raw:unknown):SplitMetrics{
 const o=raw&&typeof raw==='object'?raw as Record<string,unknown>:{},out:SplitMetrics={};
 for(const m of SPONSOR_METRICS)if(m!=='reading'&&o[m]!==undefined)out[m]=num(o[m]);
 if(o.readingMs!==undefined)out.reading=Math.round(num(o.readingMs)/60000);
 return out;
}
const rowsOf=(raw:unknown):SplitRow[]=>Array.isArray(raw)?raw.map(r=>{const o=(r||{}) as Record<string,unknown>;return {key:String(o.key??'(unknown)'),sessions:num(o.sessions),metrics:metricsOf(o.metrics)};}):[];
export function shapeSplit(raw:unknown):SponsorSplit{
 const r=(raw&&typeof raw==='object'?raw:{}) as Record<string,unknown>,w=(r.withheld||{}) as Record<string,Record<string,unknown>>;
 return {status:'ok',from:String(r.from??''),to:String(r.to??''),windowDays:num(r.window_days)||14,minSessions:num(r.min_sessions)||MIN_SPLIT_SESSIONS,sessions:num(r.sessions),
  devices:rowsOf(r.devices),countries:rowsOf(r.countries),
  withheld:{devices:{sessions:num(w.devices?.sessions),metrics:metricsOf(w.devices?.metrics)},countries:{sessions:num(w.countries?.sessions),metrics:metricsOf(w.countries?.metrics)}}};
}

/** The TypeScript reference (local store, tests): sessions already cut to the range. Same output as the SQL after shapeSplit. */
export function computeSplit(sessions:Pick<SessionRow,'device'|'country'|'counts'|'activityMs'>[],from:string,to:string):SponsorSplit{
 const per=sessions.map(s=>{const m:Record<string,number>={};
  for(const [k,v] of Object.entries(s.counts||{})){const id=sponsorMetricOf(k);if(id&&v>0)m[id]=(m[id]||0)+v;}
  const book=s.activityMs?.book||0;if(book>0)m.readingMs=book;
  return {device:s.device||'(unknown)',country:s.country||'(unknown)',m};});
 const group=(dim:'device'|'country')=>{const by=new Map<string,{sessions:number;m:Record<string,number>}>();
  for(const p of per){const g=by.get(p[dim])??{sessions:0,m:{}};g.sessions++;for(const [k,v] of Object.entries(p.m))g.m[k]=(g.m[k]||0)+v;by.set(p[dim],g);}
  const all=[...by].map(([key,g])=>({key,sessions:g.sessions,metrics:metricsOf(g.m)})).sort((a,b)=>b.sessions-a.sessions||(a.key<b.key?-1:a.key>b.key?1:0));
  const hidden=[...by].filter(([,g])=>g.sessions<MIN_SPLIT_SESSIONS),wm:Record<string,number>={};
  for(const [,g] of hidden)for(const [k,v] of Object.entries(g.m))wm[k]=(wm[k]||0)+v;
  return {rows:all.filter(r=>r.sessions>=MIN_SPLIT_SESSIONS),withheld:{sessions:hidden.reduce((a,[,g])=>a+g.sessions,0),metrics:metricsOf(wm)}};};
 const d=group('device'),c=group('country');
 return {status:'ok',from,to,windowDays:14,minSessions:MIN_SPLIT_SESSIONS,sessions:per.length,devices:d.rows,countries:c.rows,withheld:{devices:d.withheld,countries:c.withheld}};
}
