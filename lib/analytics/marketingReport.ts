/**
 * The "Marketing page" tab of /admin (Nov 3 2026), built on the SERVER from the range's merged counters (core.ts mergeRollups:
 * counts = totals per id, countSessions = sessions with that id ≥ 1) and the daily rollups. Ids: lib/analytics/marketingIds.ts.
 * Exact numbers (owner, Nov 4 2026): this is the owner's own signed-in admin, so no small-number suppression here — every count
 * is sent as it is (a Cell is never null in this report) and a rate is null only when its base is 0. The privacy rules stay on
 * the ingest side (DNT / GPC send nothing; fixed buckets only, marketingIds.ts). Time on page is exact to the second
 * (mk:sec10 + mk:sec1); the median stays a band because the first stint is only ever sent as a band (mk:t_<band>).
 * Pure and dependency-light: tests/marketing-stats.cjs drives it directly; app/admin/MarketingSection.tsx imports the types.
 */
import type {DailyRollup,Merged} from './core';
import type {Cell} from './learning';
import {MK_CLICKS,MK_DEVICES,MK_MAX,MK_REFERRERS,MK_SCROLL,MK_SECTIONS,MK_SOURCES,MK_TIME_BANDS,MK_VITALS} from './marketingIds';

export type MkRow={id:string;label:string;group?:string;sessions:Cell;count:Cell;rate:number|null};
export type MkVital={id:string;label:string;good:string;poor:string;bands:{good:Cell;ni:Cell;poor:Cell};goodShare:number|null;measured:number|null};
export type MkDay={day:string;views:number;sessions:number;visitors:number;play:number;playTaps:number;reached:number;played:number};
/** Labels that depend on the page's current content (carousel cards, slides, FAQ questions, friends steps), 1-based. */
export type MkLabels={reel:string[];slides:string[];faq:string[];steps:string[]};
export type MarketingReport={
 hasData:boolean;
 views:number;sessions:number;visitors:number;
 /** Average foreground seconds per view, whole seconds; null without views. */avgSeconds:number|null;
 avgMs:number|null;medianBand:string|null;engagedRate:number|null;bounceRate:number|null;
 /** The Play funnel, exact: sessions that tapped a Play on `/` (and the total Play taps), of those the tabs that arrived at /play,
  *  and of those the tabs that then actually played. */
 play:{sessions:Cell;taps:number;ctr:number|null;reached:Cell;reachRate:number|null;played:Cell;playRate:number|null;overall:number|null;playedOverall:number|null};
 daily:MkDay[];
 time:MkRow[];scroll:MkRow[];sections:MkRow[];clicks:MkRow[];
 reel:MkRow[];slides:MkRow[];faq:MkRow[];steps:MkRow[];
 sources:MkRow[];referrers:MkRow[];devices:MkRow[];returning:MkRow[];media:MkRow[];vitals:MkVital[];
};

const ratio=(a:Cell,b:number|null|undefined):number|null=>a===null||!b?null:Math.min(1,a/b);
const PLAY_TAPS=MK_CLICKS.filter(c=>c[1]==='Play').map(c=>'mk:c_'+c[0]);

/** `labels` null (report.ts): every position up to MK_MAX, named “#n”; the admin route and page then name them (marketingLabels.ts). */
export function buildMarketing(m:Pick<Merged,'counts'|'countSessions'>,rollups:Pick<DailyRollup,'day'|'counts'|'countSessions'|'dims'>[],labels:MkLabels|null=null):MarketingReport{
 const c=m.counts||{},s=m.countSessions||{};
 const cell=(n:number|undefined):Cell=>n||0;
 const views=c['mk:view']||0,sessions=s['mk:view']||0;
 /** A row: sessions with the id, its total, and its share of the page's sessions (or of `base`). */
 const row=(id:string,label:string,group?:string,base=sessions):MkRow=>{const se=cell(s[id]),n=cell(c[id]);
  return {id,label,...(group?{group}:{}),sessions:se,count:n,rate:ratio(se,base)};};
 /** Per-view rows (counted once per view: time bands, devices, sources): the share is of views. */
 const viewRow=(id:string,label:string):MkRow=>{const n=cell(c[id]);return {id,label,sessions:cell(s[id]),count:n,rate:ratio(n,views)};};
 const list=(prefix:string,names:string[]|undefined,max:number)=>Array.from({length:names?Math.min(max,names.length):max},(_,i)=>row(`mk:${prefix}_${i+1}`,names?.[i]||`#${i+1}`));

 const daily:MkDay[]=rollups.map(r=>{const v=r.counts?.['mk:view']||0;
  return {day:r.day,views:v,sessions:r.countSessions?.['mk:view']||0,visitors:v?(r.dims?.entry?.['/']?.v||0):0,play:r.countSessions?.['mk:play']||0,
   playTaps:PLAY_TAPS.reduce((a,id)=>a+(r.counts?.[id]||0),0),reached:r.countSessions?.['mk:reached']||0,played:r.countSessions?.['mk:played']||0};});
 const visitors=daily.reduce((a,d)=>a+d.visitors,0);

 // Time: whole seconds over every view (10·sec10 + sec1), to the second; the median from the first-stint bands.
 const avgSeconds=views?Math.round(((c['mk:sec10']||0)*10+(c['mk:sec1']||0))/views):null,avgMs=avgSeconds===null?null:avgSeconds*1000;
 const bands=MK_TIME_BANDS.map(b=>({b,n:c['mk:t_'+b[0]]||0})),banded=bands.reduce((a,x)=>a+x.n,0);
 let medianBand:string|null=null;if(banded>0){let run=0;for(const x of bands){run+=x.n;if(run*2>=banded){medianBand=x.b[1];break;}}}
 const engaged=c['mk:engaged']||0;
 const engagedRate=views?Math.min(1,engaged/views):null;

 const play=cell(s['mk:play']),reached=cell(s['mk:reached']),played=cell(s['mk:played']),taps=PLAY_TAPS.reduce((a,id)=>a+(c[id]||0),0);
 const report:MarketingReport={
  hasData:views>0,views,sessions,visitors,
  avgSeconds,avgMs,medianBand,engagedRate,bounceRate:engagedRate===null?null:1-engagedRate,
  play:{sessions:play,taps,ctr:ratio(play,sessions),reached,reachRate:ratio(reached,play),played,playRate:ratio(played,reached),
   overall:ratio(reached,sessions),playedOverall:ratio(played,sessions)},
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
   return {id,label,good,poor,bands:{good:cell(g),ni:cell(n),poor:cell(p)},goodShare:all?g/all:null,measured:all};
  }),
 };
 return report;
}

/** Name the positional rows from the page's current content (and drop positions the page does not have). Empty lists leave “#n”. */
export function nameMarketing(r:MarketingReport|null|undefined,labels:MkLabels):void{
 if(!r)return;
 for(const k of ['reel','slides','faq','steps'] as const){const names=labels[k];if(!names.length)continue;r[k]=r[k].slice(0,names.length).map((x,i)=>({...x,label:names[i]}));}
}
