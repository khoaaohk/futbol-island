'use client';
/**
 * Trend tiles (Nov 6 2026, the /admin rebuild): a number for the range (the daily layer's rule for that series: a sum, a ratio
 * of sums, or the mean of complete days), its change vs the previous period when Compare is on and that period is fully
 * tracked (else why not, in words; today alone: vs yesterday by the same time, else "comparison waits for a full day"), a sparkline of complete days (gaps where a day was not tracked) and a link to its
 * Definitions row. Owner decision (Nov 6 2026): sparklines and deltas on the tiles, no goals or targets. Exact numbers.
 */
import type {ReactNode} from 'react';
import {WAITS_TEXT,fmtDay,fmtPctAbs,fmtUnit,kpi,type DashboardData,type Kpi} from '@/lib/analytics/dashboard';
import {GapSpark} from './DashCharts';
import d from './dash.module.css';

/** Measures where a fall is the good direction. */
const DOWN_GOOD=new Set(['audience.bounce_rate','live_matches.goals_against.all','live_matches.replay_skips.all']);

export function DeltaLine({k,compare}:{k:Kpi;compare:boolean}){
 if(!compare)return null;
 const p=k.prev;
 if(!p||p.status==='none')return <small className={d.delta}>— nothing to compare with</small>;
 if(p.status==='waits')return <small className={d.delta} data-compare-waits title="Today so far is compared only with yesterday up to the same time; this measure has no such count yet">— {WAITS_TEXT}</small>;
 if(p.status!=='ok')return <small className={d.delta}>— not tracked before {fmtDay(p.trackedSince??'')}</small>;
 if(p.value===null||p.current===null)return <small className={d.delta}>— nothing to compare with</small>;
 const label=k.vs;
 if(p.value===0)return <small className={d.delta} data-tone="flat">{p.current>0?`+${fmtUnit(p.current,k.unit)} (new) vs ${label}`:`± 0 vs ${label}`}</small>;
 const ch=(p.current-p.value)/p.value,good=DOWN_GOOD.has(k.key)?ch<0:ch>0,flat=Math.abs(ch)<0.005;
 return <small className={d.delta} data-tone={flat?'flat':good?'good':'bad'} data-vs={label} title={p.sameTime?`${fmtUnit(p.current,k.unit)} today so far vs ${fmtUnit(p.value,k.unit)} on ${fmtDay(p.from)} by ${p.sameTime}`:`${fmtUnit(p.current,k.unit)} (${fmtDay(p.curFrom)} – ${fmtDay(p.curTo)}) vs ${fmtUnit(p.value,k.unit)} (${fmtDay(p.from)} – ${fmtDay(p.to)})`}>
  <span aria-hidden="true">{flat?'•':ch>0?'▲':'▼'}</span> {flat?'±0%':(ch>0?'+':'−')+fmtPctAbs(ch)} vs {label} <span className={d.sr}>({fmtUnit(p.value,k.unit)} before)</span></small>;
}

/** One tile. `metric`: its data-metric id (the metric index). `foot`: extra footnote (e.g. how minutes per player is computed). */
export function TrendTile({data,seriesKey,label,metric,compare,onDef,foot,format}:{data:DashboardData|null;seriesKey:string;label?:string;metric?:string;compare:boolean;onDef:(key:string)=>void;foot?:ReactNode;format?:(v:number)=>string}){
 const k=data?kpi(data,seriesKey):null;
 const name=label??k?.label??seriesKey;
 if(!data)return <div className={d.tile} data-metric={metric} aria-busy="true"><span>{name}</span><span className={d.skel}/><span className={d.skelLine}/></div>;
 if(!k)return <div className={d.tile} data-metric={metric} data-series={seriesKey}><span>{name}</span><b>—</b><small>Not in this data (not tracked here).</small></div>;
 const v=k.value===null?'—':format?format(k.value):fmtUnit(k.value,k.unit);
 return <div className={d.tile} data-metric={metric} data-series={seriesKey} data-value={k.value===null?'':String(k.value)}>
  <span>{name}</span>
  <b>{v}</b>
  <DeltaLine k={k} compare={compare}/>
  <GapSpark values={k.spark} label={`${name} per day, ${k.sparkDays.length} complete days`}/>
  <div className={d.tileFoot}>
   {k.value===null?<span>Not tracked in this range{k.trackedSince?` (from ${fmtDay(k.trackedSince)})`:''}.</span>
    :k.partFrom?<span>Counted from {fmtDay(k.partFrom)} only.</span>:null}
   {foot}
   <button type="button" className={d.defLink} onClick={()=>onDef(seriesKey)} aria-label={`How ${name} is counted`}>How it’s counted</button>
  </div>
 </div>;
}

/** A row of trend tiles for a tab's key numbers. */
export function TrendStrip({data,items,compare,onDef,title,note,four}:{data:DashboardData|null;items:{key:string;label?:string;metric?:string;format?:(v:number)=>string}[];compare:boolean;onDef:(key:string)=>void;title:string;note?:ReactNode;four?:boolean}){
 return <section aria-label={title} className={d.stripSec}>
  <div className={d.tiles+' '+(four||(items.length%5!==0&&items.length%4===0)?d.tiles4:'')}>
   {items.map(i=><TrendTile key={i.key} data={data} seriesKey={i.key} label={i.label} metric={i.metric} compare={compare} onDef={onDef} format={i.format}/>)}
  </div>
  {note&&<p className={d.leadNote}>{note}</p>}
 </section>;
}
