'use client';
/**
 * Definitions and the metric index (Nov 6 2026, the /admin rebuild). Definitions: every series the dashboard draws, with how
 * it is counted, its source, its unit and roll-up, and the day it started counting (the export's Definitions CSV has every
 * series of the layer). Each tile's "How it's counted" opens this list on its row. The metric index: every number the old
 * tabs showed (lib/analytics/metricIndex.ts) and where it is now, one tap away.
 */
import {useEffect,useMemo} from 'react';
import {fmtDay,type DashboardData} from '@/lib/analytics/dashboard';
import {DASH_TABS,METRIC_INDEX,type DashTab} from '@/lib/analytics/metricIndex';
import d from './dash.module.css';
import so from './SponsorOverview.module.css';

const SECTION:Record<string,string>={audience:'Players and sessions',people:'People (raw rows, 14 days)',engagement:'Engagement cards',time:'Where time goes',learning:'Learning',
 live_matches:'Live matches',fishing:'Fishing',marketing:'Marketing',kit:'Kit Shop',counters:'Raw counters'};
const AGG:Record<string,string>={sum:'added up over days',ratio:'a ratio of the day sums',avg:'the mean of complete days'};

export function DefinitionsPanel({data,open,onToggle,target}:{data:DashboardData|null;open:boolean;onToggle:(v:boolean)=>void;target:string|null}){
 const list=useMemo(()=>data?Object.values(data.series).sort((a,b)=>a.key.localeCompare(b.key)):[],[data]);
 useEffect(()=>{if(!open||!target)return;const el=document.getElementById('def-'+target);if(el){el.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});(el as HTMLElement).focus?.({preventScroll:true});}},[open,target]);
 return <details className={so.how} id="definitions" open={open} onToggle={e=>onToggle((e.currentTarget as HTMLDetailsElement).open)} data-metric="overview.definitions">
  <summary>Definitions: how each trend is counted ({list.length})</summary>
  {data&&<>
   <p className={d.leadNote}>Days are Pacific days. Not tracked = empty (never 0). Today is partial: left out of averages and comparisons. Exact numbers (admin only). The Export’s Definitions CSV lists every series of the layer.</p>
   <dl className={d.defs}>{list.map(s=><div key={s.key} id={'def-'+s.key} tabIndex={-1} data-target={target===s.key||undefined}>
    <dt>{s.label}<small style={{display:'block',fontWeight:400,color:'var(--a-muted)'}}>{SECTION[s.key.split('.')[0]]??s.key.split('.')[0]} · {s.unit}</small></dt>
    <dd>{s.how}<small>Source: {s.source}. Over several days: {AGG[s.agg]}. Tracked since {s.trackedSince?fmtDay(s.trackedSince):'—'}{s.fullSince?`, every part from ${fmtDay(s.fullSince)}`:''}.</small></dd>
   </div>)}</dl>
   {data.gaps.length>0&&<><h3 style={{margin:'14px 0 4px',fontSize:15}}>Not tracked (gaps)</h3>
    <dl className={d.defs}>{data.gaps.map(g=><div key={g.metric}><dt>{g.metric}</dt><dd>{g.why}<small>Fix: {g.fix}</small></dd></div>)}</dl></>}
  </>}
 </details>;
}

export function MetricIndexPanel({onGo}:{onGo:(tab:DashTab)=>void}){
 const tabName=Object.fromEntries(DASH_TABS) as Record<DashTab,string>;
 return <details className={so.how} id="metric-index" data-metric="overview.metric_index">
  <summary>Metric index: where every number from the old tabs is now ({METRIC_INDEX.length})</summary>
  <div className={d.tableWrap}><table className={d.tbl}>
   <thead><tr><th scope="col">Number</th><th scope="col" className={d.l}>Was on</th><th scope="col" className={d.l}>Now</th></tr></thead>
   <tbody>{METRIC_INDEX.map(m=><tr key={m.id} data-index-id={m.id}><td className={d.l}>{m.label}</td><td className={d.l}>{m.was}</td>
    <td className={d.l}><button type="button" className={d.linkBtn} onClick={()=>onGo(m.tab)}>{tabName[m.tab]}</button> · {m.where}</td></tr>)}</tbody>
  </table></div>
 </details>;
}
