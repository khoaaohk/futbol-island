'use client';
/**
 * "Investor page visits" on the Marketing tab (Nov 5 2026, owner: "show what state and time they came, and how long they stayed
 * on the marketing site"): the unlisted /marketing page only. Everything is report.marketingVisits, built on the server
 * (lib/analytics/marketingVisitReport.ts) with EXACT counts like the rest of this tab. Times are Pacific, the same clock as
 * every day on /admin. Same tiles, cards, bars, columns and Table twins as the rest of /admin; the weekday × hour table uses the
 * island heat ramp (--h0…--h4).
 */
import type {CSSProperties} from 'react';
import type {Report} from '@/lib/analytics/core';
import type {MarketingVisitReport} from '@/lib/analytics/marketingVisitReport';
import {ChartCard,Columns,DayColumns,fmtInt,fmtPct} from './charts';
import styles from './admin.module.css';

const EMPTY='No visits to /marketing in this range yet. Counting starts with the Nov 5 2026 release; a visit’s numbers arrive when the visitor leaves the tab, or every few minutes.';
const pct=(x:number|null)=>x===null?'—':fmtPct(x);
/** "2 min 15 s", "38 s", "1 h 12 min", "—". */
export function fmtStay(s:number|null):string{
 if(s===null)return '—';if(s<60)return `${s} s`;
 if(s<3600){const m=Math.floor(s/60),r=s%60;return r?`${m} min ${r} s`:`${m} min`;}
 const h=Math.floor(s/3600),m=Math.round(s%3600/60);return m?`${h} h ${m} min`:`${h} h`;
}
/** 0 → "12a", 13 → "1p". */
export const hourLabel=(h:number)=>`${h%12||12}${h<12?'a':'p'}`;
const hourLong=(h:number)=>`${hourLabel(h)}m–${hourLabel((h+1)%24)}m`;
/** The heat bin (0–4) of a cell against the busiest cell; null for 0. */
export const heatBin=(n:number,max:number)=>n<=0||max<=0?null:Math.min(4,Math.floor(n/max*5-1e-9));

function HeatTable({v}:{v:MarketingVisitReport}){
 const max=Math.max(0,...v.grid.flat());
 return <div className={styles.tableScroll}>
  <table className={styles.mvHeat} aria-label="Visits by day of week and hour, Pacific time">
   <thead><tr><th scope="col">Day</th>{v.hours.map((_,h)=><th key={h} scope="col">{h%3===0?hourLabel(h):<span className={styles.mvSr}>{hourLabel(h)}</span>}</th>)}<th scope="col">All</th></tr></thead>
   <tbody>{v.grid.map((row,d)=><tr key={d}><th scope="row">{v.weekdays[d]}</th>
    {row.map((n,h)=>{const b=heatBin(n,max);return <td key={h} data-bin={b??''} title={`${v.weekdays[d]} ${hourLong(h)}: ${fmtInt(n)} visits`}
     style={b===null?undefined:{'--cell':`var(--h${b})`} as CSSProperties}>{n||''}</td>;})}
    <td className={styles.mvAll}>{fmtInt(row.reduce((a,x)=>a+x,0))}</td></tr>)}</tbody>
  </table>
 </div>;
}

export default function MarketingVisitsSection({report,rangeText,dayLabel}:{report:Pick<Report,'marketingVisits'>;rangeText:string;dayLabel:(day:string)=>string}){
 const v=report.marketingVisits;
 const head=<div className={styles.sectionHead}><h2 id="sec-marketing-visits">Investor page visits</h2>
  <p>The unlisted page at futbolisland.app/marketing for {rangeText}: where visitors were (US state, or country outside the US), when they came
   (Pacific time, the same clock as the rest of /admin) and how long the page was on their screen. Every number is exact; a visit is one page load.</p></div>;
 if(!v||!v.hasData)return <section className={styles.island} aria-labelledby="sec-marketing-visits">{head}<p className={styles.empty}>{EMPTY}</p></section>;
 const top=v.places.slice(0,12),multi=v.daily.length>1;
 return <section className={styles.island} aria-labelledby="sec-marketing-visits">
  {head}
  <div className={styles.startTiles} aria-label="Investor page headline">
   <div><span>Visits</span><b data-k="mv-views">{fmtInt(v.views)}</b><small>{v.places.length} {v.places.length===1?'place':'places'}{top[0]?` · most from ${top[0].label}`:''}</small></div>
   <div><span>Average stay</span><b data-k="mv-avg">{fmtStay(v.avgSec)}</b><small>to the second · tab in view only, 30 min cap</small></div>
   <div><span>Median stay</span><b data-k="mv-median">{v.medianSec===null?'—':`≈ ${fmtStay(v.medianSec)}`}</b><small>estimated inside its band ({v.medianBand??'—'})</small></div>
   <div><span>Bounced</span><b data-k="mv-bounce">{pct(v.bounceRate)}</b><small>{fmtInt(v.bounced)} of {fmtInt(v.banded)} visits left in under 10 s</small></div>
  </div>
  <div className={styles.grid}>
   <ChartCard title="Where they came from" subtitle="Visits by US state (or country outside the US), with the average stay" empty={!top.length}
    table={{columns:['Place','Code','Visits','Share','Average stay'],rows:v.places.map(p=>[p.label,p.code,p.visits,pct(p.share),fmtStay(p.avgSec)])}}>
    <ul className={styles.mvPlaces}>{top.map(p=><li key={p.geo} aria-label={`${p.label}: ${fmtInt(p.visits)} visits, average stay ${fmtStay(p.avgSec)}`}>
     <span className={styles.mvName}>{p.label}</span><span className={styles.mvAvg}>avg {fmtStay(p.avgSec)}</span>
     <span className={styles.barTrack}><span className={styles.barFill} style={{width:`calc((100% - 64px) * ${p.visits/Math.max(1,top[0].visits)})`}}/><span className={styles.barValue}>{fmtInt(p.visits)}</span></span>
    </li>)}</ul>
    {v.places.length>top.length&&<p className={styles.note}>Top {top.length} of {v.places.length}. The table shows all.</p>}
   </ChartCard>
   <ChartCard title="How long they stayed" subtitle={`Average ${fmtStay(v.avgSec)} · median ≈ ${fmtStay(v.medianSec)} · ${pct(v.bounceRate)} bounced (under 10 s)`} empty={!v.banded}
    table={{columns:['Stay','Visits','Share'],rows:v.bands.map(b=>[b.label,b.visits,pct(b.share)])}}>
    <Columns unit="visits" rows={v.bands.map(b=>({label:b.label,value:b.visits}))}/>
   </ChartCard>
   <ChartCard title="Visits by hour of day" subtitle="Pacific time (PT), all days in the range added up" empty={!v.timed}
    table={{columns:['Hour (PT)','Visits','Share'],rows:v.hours.map((n,h)=>[hourLong(h),n,v.timed?fmtPct(n/v.timed):'—'])}}>
    <DayColumns unit="visits" ariaLabel={`Investor page visits by Pacific hour, ${rangeText}`} rows={v.hours.map((n,h)=>({key:'h'+h,label:hourLabel(h),value:n,detail:hourLong(h)+' PT'}))}/>
   </ChartCard>
   <ChartCard title="Visits by day" subtitle={multi?'Pacific days, the same as the rest of /admin':'One day in this range'} empty={!v.daily.some(d=>d.views)}
    table={{columns:['Day','Visits'],rows:v.daily.map(d=>[dayLabel(d.day),d.views])}}>
    <DayColumns unit="visits" ariaLabel={`Investor page visits by day, ${rangeText}`} rows={v.daily.map(d=>({key:d.day,label:dayLabel(d.day),value:d.views}))}/>
   </ChartCard>
   <ChartCard wide title="Day of week and hour" subtitle="Visits in each Pacific weekday and hour; darker is busier (the busiest cell is the darkest)" empty={!v.timed}
    table={{columns:['Day',...v.hours.map((_,h)=>hourLabel(h)),'All'],rows:v.grid.map((row,d)=>[v.weekdays[d],...row,row.reduce((a,x)=>a+x,0)])}}>
    <HeatTable v={v}/>
   </ChartCard>
  </div>
 </section>;
}
