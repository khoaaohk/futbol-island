'use client';
/**
 * The weekly Sponsor report tab (Oct 22 2026, Phase B of docs/analytics-multiplayer-plan.md §8 'e'): one ISO week of combined
 * totals (reach, engagement minutes, social and emote engagement, return rate, learning), with the week before for comparison,
 * a CSV download and a print stylesheet (Print → Save as PDF; no PDF library, no server rendering). Built and suppressed on the
 * server (/api/admin/sponsor-report, lib/analytics/sponsorReport.ts): groups under 10 are withheld and reach is rounded, in the
 * view and in every export. INTERNAL DRAFT until the privacy policy wording is approved (the banner says so, on screen and on paper).
 */
import {useEffect,useState} from 'react';
import {fmtKpi,shiftWeek,sponsorWeeklyCsv,type SponsorKpi,type SponsorWeekly} from '@/lib/analytics/sponsorReport';
import styles from './admin.module.css';
import s from './SponsorReport.module.css';

/** Printing shows only the report (the rest of /admin is hidden), on A4 / Letter, two cards per row. Global by design (a <style>). */
export const PRINT_CSS=`@media print{
 body *{visibility:hidden!important}
 [data-sponsor-report],[data-sponsor-report] *{visibility:visible!important}
 [data-sponsor-report]{position:absolute;left:0;top:0;width:100%;padding:0!important;background:#fff!important;color:#000!important}
 [data-no-print]{display:none!important}
 [data-sponsor-cards]{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}
 [data-sponsor-cards]>*{break-inside:avoid;box-shadow:none!important;border:1px solid #999!important;background:#fff!important}
 [data-sponsor-draft]{border:2px solid #000!important;background:#fff!important;color:#000!important}
}
@page{size:A4;margin:12mm}`;

const fmtDay=(d:string)=>new Date(d+'T00:00:00Z').toLocaleDateString('en',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'});
const changeText=(k:SponsorKpi)=>k.change===null||k.status!=='ok'?null:`${k.change>=0?'+':''}${Math.round(k.change*100)}% vs last week`;

export default function SponsorReport({week,onWeek,initial}:{week:string;onWeek:(w:string)=>void;initial?:SponsorWeekly|null}){
 const [data,setData]=useState<SponsorWeekly|null>(initial??null),[error,setError]=useState(false);
 useEffect(()=>{
  if(initial&&initial.week===week)return;let live=true;setError(false);setData(null);
  fetch(`/api/admin/sponsor-report?week=${encodeURIComponent(week)}`,{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject(new Error(String(r.status))))
   .then(j=>{if(live)setData(j as SponsorWeekly);}).catch(()=>{if(live)setError(true);});
  return()=>{live=false;};
 },[week,initial]);
 const download=()=>{if(!data)return;
  const url=URL.createObjectURL(new Blob([sponsorWeeklyCsv(data)],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');
  a.href=url;a.download=`futbol-island-sponsor-report-${data.week}.csv`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 return <section className={`${styles.island} ${s.root}`} aria-labelledby="sec-sponsor-report" data-sponsor-report>
  <style>{PRINT_CSS}</style>
  <p className={s.draft} role="note" data-sponsor-draft><b>Internal draft: do not share outside the company until the privacy policy wording is approved.</b></p>
  <div className={s.head}>
   <div className={styles.sectionHead}><h2 id="sec-sponsor-report">Sponsor report</h2>
    <p>{data?`Week ${data.week.slice(6)} (${fmtDay(data.from)} – ${fmtDay(data.to)})`:week}. All numbers are combined totals; groups under 10 are hidden; reach is rounded. No personal data.</p></div>
   <div className={s.actions} data-no-print>
    <button type="button" className={styles.secondary} onClick={()=>onWeek(shiftWeek(week,-1))} aria-label="Previous week">‹ Prev</button>
    <button type="button" className={styles.secondary} onClick={()=>onWeek(shiftWeek(week,1))} aria-label="Next week">Next ›</button>
    <button type="button" className={styles.secondary} onClick={download} disabled={!data} data-sponsor-report-csv>CSV</button>
    <button type="button" className={styles.secondary} onClick={()=>window.print()} disabled={!data} data-sponsor-report-print>Print</button>
   </div>
  </div>
  {error&&<p className={styles.note} role="alert">Could not build this week’s report. Try again in a moment.</p>}
  {!data&&!error&&<p className={styles.note}>Loading…</p>}
  {data&&<>
   <ul className={s.cards} aria-label="Sponsor KPIs" data-sponsor-cards>
    {data.kpis.map(k=><li key={k.id} className={s.card} data-kpi={k.id} data-status={k.status}>
     <span className={s.label}>{k.label}</span>
     <b className={k.status==='ok'||k.status==='withheld'?s.value:s.none}>{fmtKpi(k.value,k.format,k.status)}{k.status==='ok'&&k.format==='min'?<small> min</small>:k.status==='ok'&&k.id==='reach'?<small> players</small>:k.status==='ok'&&k.id==='emotes'?<small> per emoter</small>:k.status==='ok'&&k.id==='learning'?<small> lessons</small>:null}</b>
     {changeText(k)&&<small className={s.change}>{changeText(k)}</small>}
     {k.sub.length>0&&<dl className={s.sub}>{k.sub.map(x=><div key={x.label}><dt>{x.label}</dt><dd>{fmtKpi(x.value,x.format,x.status)}</dd></div>)}</dl>}
     {k.note&&<small className={s.note}>{k.note}</small>}
    </li>)}
   </ul>
   <div className={s.bars}>
    <div className={s.block}><h3>Party size {data.partySize.source==='relay'?'(party service)':data.partySize.source==='client'?'(hosts’ devices)':''}</h3>
     {data.partySize.bands.length?<ul className={s.bandList}>{data.partySize.bands.map(b=><li key={b.key}><span>{b.label}</span><b>{b.value===null?`<${data.min}`:b.value}</b></li>)}</ul>
      :<p className={styles.note}>Not tracked yet for this week.</p>}</div>
    <div className={s.block}><h3>Top emotes</h3>
     {data.topEmotes.length?<ul className={s.bandList}>{data.topEmotes.map(b=><li key={b.key}><span>{b.label}</span><b>{b.value}</b></li>)}</ul>
      :<p className={styles.note}>None with {data.min}+ sessions this week.</p>}</div>
   </div>
   <details className={s.how} open>
    <summary>How these are counted</summary>
    <dl>{data.kpis.map(k=><div key={k.id}><dt>{k.label}</dt><dd>{k.how}</dd></div>)}</dl>
    <ul>{data.notes.map(n=><li key={n}>{n}</li>)}</ul>
    <p className={s.exportLine}>{data.exportLine}</p>
   </details>
  </>}
 </section>;
}
