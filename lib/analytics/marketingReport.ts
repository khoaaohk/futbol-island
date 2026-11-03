/**
 * The "Marketing page" tab of /admin (Nov 3 2026), built on the SERVER from the range's merged counters (core.ts mergeRollups:
 * counts = totals per id, countSessions = sessions with that id ≥ 1) and the daily rollups. Ids: lib/analytics/marketingIds.ts.
 * Small-number suppression as everywhere else on /admin (learning.ts MIN_SESSIONS): every breakdown cell resting on fewer than
 * 5 sessions is sent as null (shown "<5") and every rate needs a base of 5 or more. The headline totals (views, sessions,
 * visitors) and the daily series are page-view totals like the Overview's and are not withheld.
 * Pure and dependency-light: tests/marketing-stats.cjs drives it directly; app/admin/MarketingSection.tsx imports the types.
 */
import type {DailyRollup,Merged} from './core';
import {MIN_SESSIONS,type Cell} from './learning';
import {MK_CLICKS,MK_DEVICES,MK_MAX,MK_REFERRERS,MK_SCROLL,MK_SECTIONS,MK_SOURCES,MK_TIME_BANDS,MK_VITALS} from './marketingIds';

export type MkRow={id:string;label:string;group?:string;sessions:Cell;count:Cell;rate:number|null};
export type MkVital={id:string;label:string;good:string;poor:string;bands:{good:Cell;ni:Cell;poor:Cell};goodShare:number|null;measured:number|null};
export type MkDay={day:string;views:number;sessions:number;visitors:number;play:number;reached:number};
/** Labels that depend on the page's current content (carousel cards, slides, FAQ questions, friends steps), 1-based. */
export type MkLabels={reel:string[];slides:string[];faq:string[];steps:string[]};
export type MarketingReport={
 hasData:boolean;min:number;hidden:number;
 views:number;sessions:number;visitors:number;
 avgMs:number|null;medianBand:string|null;engagedRate:number|null;bounceRate:number|null;
 play:{sessions:Cell;ctr:number|null;reached:Cell;reachRate:number|null;overall:number|null};
 daily:MkDay[];
 time:MkRow[];scroll:MkRow[];sections:MkRow[];clicks:MkRow[];
 reel:MkRow[];slides:MkRow[];faq:MkRow[];steps:MkRow[];
 sources:MkRow[];referrers:MkRow[];devices:MkRow[];returning:MkRow[];media:MkRow[];vitals:MkVital[];
};

const ratio=(a:Cell,b:number|null|undefined):number|null=>a===null||!b||b<MIN_SESSIONS?null:Math.min(1,a/b);

/** `labels` null (report.ts): every position up to MK_MAX, named “#n”; the admin route and page then name them (marketingLabels.ts). */
export function buildMarketing(m:Pick<Merged,'counts'|'countSessions'>,rollups:Pick<DailyRollup,'day'|'counts'|'countSessions'|'dims'>[],labels:MkLabels|null=null):MarketingReport{
 const c=m.counts||{},s=m.countSessions||{};let hidden=0;
 const cell=(n:number|undefined):Cell=>{const v=n||0;if(v>=MIN_SESSIONS)return v;if(v>0){hidden++;return null;}return 0;};
 const views=c['mk:view']||0,sessions=s['mk:view']||0;
 /** A row: sessions with the id, its total, and its share of the page's sessions (or of `base`). */
 const row=(id:string,label:string,group?:string,base=sessions):MkRow=>{const se=cell(s[id]),n=(s[id]||0)>=MIN_SESSIONS?(c[id]||0):(s[id]||0)>0?null:0;
  return {id,label,...(group?{group}:{}),sessions:se,count:n,rate:ratio(se,base)};};
 /** Per-view rows (counted once per view: time bands, devices, sources): the share is of views. */
 const viewRow=(id:string,label:string):MkRow=>{const n=cell(c[id]);return {id,label,sessions:cell(s[id]),count:n,rate:ratio(n,views)};};
 const list=(prefix:string,names:string[]|undefined,max:number)=>Array.from({length:names?Math.min(max,names.length):max},(_,i)=>row(`mk:${prefix}_${i+1}`,names?.[i]||`#${i+1}`));

 const daily:MkDay[]=rollups.map(r=>{const v=r.counts?.['mk:view']||0;
  return {day:r.day,views:v,sessions:r.countSessions?.['mk:view']||0,visitors:v?(r.dims?.entry?.['/']?.v||0):0,play:r.countSessions?.['mk:play']||0,reached:r.countSessions?.['mk:reached']||0};});
 const visitors=daily.reduce((a,d)=>a+d.visitors,0);

 // Time: the rounded 10-second units over every view; the median from the first-stint bands.
 const avgMs=views>=MIN_SESSIONS?Math.round((c['mk:sec10']||0)*10_000/views):null;
 const bands=MK_TIME_BANDS.map(b=>({b,n:c['mk:t_'+b[0]]||0})),banded=bands.reduce((a,x)=>a+x.n,0);
 let medianBand:string|null=null;if(banded>=MIN_SESSIONS){let run=0;for(const x of bands){run+=x.n;if(run*2>=banded){medianBand=x.b[1];break;}}}
 const engaged=c['mk:engaged']||0;
 const engagedRate=views>=MIN_SESSIONS?Math.min(1,engaged/views):null;

 const play=cell(s['mk:play']),reached=cell(s['mk:reached']);
 const report:MarketingReport={
  hasData:views>0,min:MIN_SESSIONS,hidden:0,views,sessions,visitors,
  avgMs,medianBand,engagedRate,bounceRate:engagedRate===null?null:1-engagedRate,
  play:{sessions:play,ctr:ratio(play,sessions),reached,reachRate:ratio(reached,play===null?0:play),overall:ratio(reached,sessions)},
  daily,
  time:MK_TIME_BANDS.map(b=>viewRow('mk:t_'+b[0],b[1])),
  scroll:MK_SCROLL.map(p=>row('mk:s'+p,p+'% of the page')),
  sections:MK_SECTIONS.map(([id,label])=>row('mk:v_'+id,label)),
  clicks:MK_CLICKS.map(([id,group,label])=>row('mk:c_'+id,label,group)),
  reel:list('rc',labels?.reel,MK_MAX.rc),slides:list('sl',labels?.slides,MK_MAX.sl),faq:list('faq',labels?.faq,MK_MAX.faq),steps:list('fs',labels?.steps,MK_MAX.fs),
  sources:MK_SOURCES.map(([id,label])=>viewRow('mk:src_'+id,label)),
  referrers:[...MK_REFERRERS.map(r=>viewRow('mk:ref_'+r[0],r[1])),viewRow('mk:ref_other','Other websites')],
  devices:MK_DEVICES.map(([id,label])=>viewRow('mk:d_'+id,label)),
  returning:[viewRow('mk:ret_yes','Played the game on this device before'),viewRow('mk:ret_no','New to the game on this device')],
  media:[viewRow('mk:vid_ok','A clip played'),viewRow('mk:err_img','A picture failed to load'),viewRow('mk:err_video','A clip failed to load')],
  vitals:MK_VITALS.map(([id,label,good,poor])=>{
   const g=c[`mk:${id}_good`]||0,n=c[`mk:${id}_ni`]||0,p=c[`mk:${id}_poor`]||0,all=g+n+p;
   return {id,label,good,poor,bands:{good:cell(g),ni:cell(n),poor:cell(p)},goodShare:all>=MIN_SESSIONS?g/all:null,measured:all>=MIN_SESSIONS?all:all?null:0};
  }),
 };
 report.hidden=hidden;
 return report;
}

/** Name the positional rows from the page's current content (and drop positions the page does not have). Empty lists leave “#n”. */
export function nameMarketing(r:MarketingReport|null|undefined,labels:MkLabels):void{
 if(!r)return;
 for(const k of ['reel','slides','faq','steps'] as const){const names=labels[k];if(!names.length)continue;r[k]=r[k].slice(0,names.length).map((x,i)=>({...x,label:names[i]}));}
}
