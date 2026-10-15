'use client';
/**
 * "Where players come from" (Oct 15 2026): for the selected days, sessions by country (tap a country for its states/provinces),
 * by source (a link's tag such as the QR card's ?from=flyer, else the referring site's host, else direct), new vs returning
 * devices and with vs without a save code. From report.sources (lib/analytics/liveAdmin.ts loadSources →
 * public.analytics_sources_summary, supabase/migrations/20261018_analytics_live.sql). Aggregates only; any row under 3 sessions
 * is hidden ("<3"), like the fishing section under 5. Raw rows are kept 14 days, so older days in a range add nothing here.
 */
import {useState} from 'react';
import type {Report} from '@/lib/analytics/core';
import {LIVE_MIGRATION,LIVE_OK_ROW,flagOf,sourceLabel} from '@/lib/analytics/live';
import {BarList,ChartCard,fmtInt,type BarRow} from './charts';
import styles from './admin.module.css';

const show=(n:number|null)=>n===null?'<3':fmtInt(n);
const share=(a:number|null,b:number|null)=>a===null||b===null||!(a+b)?'—':`${Math.round(100*a/(a+b))}%`;

export default function SourcesSection({report,countryName}:{report:Report;countryName:(c:string)=>string}){
 const s=report.sources,[openCountry,setOpenCountry]=useState<string|null>(null);
 const countries=s?.countries??[],sources=s?.sources??[];
 const srcRows:BarRow[]=sources.map(t=>({key:t.key,label:sourceLabel(t.key),value:t.n}));
 return <section className={styles.island} aria-labelledby="sources-heading" data-sources>
  <div className={styles.sectionHead}>
   <h2 id="sources-heading">Where players come from</h2>
   <p>Sessions by country and region, by the link or site they came from, new vs returning devices, and with or without a save code.
    Anonymous totals from the last {s?.windowDays??14} days of raw data; any row under {s?.minSessions??3} sessions is hidden.</p>
  </div>
  {s?.status==='needs-migration'&&<section className={`${styles.banner} ${styles.bannerWarn}`} role="status">
   This section needs one database update. In the Supabase SQL editor, paste the <b>whole</b> of <code>{LIVE_MIGRATION}</code> and run it. Its last result must be one row reading <code>{LIVE_OK_ROW}</code>; running it again is safe.
  </section>}
  <div className={styles.startTiles} aria-label="New or returning, save code">
   <div><span>Sessions</span><b>{s?.status==='ok'?fmtInt(s.sessions):'—'}</b><small>in {report.from===report.to?'this day':'these days'}</small></div>
   <div><span>New vs returning</span><b>{s?show(s.returning.new):'—'} · {s?show(s.returning.returning):'—'}</b><small>{s?share(s.returning.returning,s.returning.new):'—'} returning{s&&s.returning.unknown?` · ${show(s.returning.unknown)} not known`:''}</small></div>
   <div><span>With a save code</span><b>{s?show(s.code.with):'—'} · {s?show(s.code.without):'—'}</b><small>{s?share(s.code.with,s.code.without):'—'} with a code{s&&s.code.unknown?` · ${show(s.code.unknown)} not known`:''}</small></div>
   <div><span>Hidden small rows</span><b>{s?fmtInt(s.countriesSuppressed)+' · '+fmtInt(s.sourcesSuppressed):'—'}</b><small>sessions in countries · sources under 3</small></div>
  </div>
  <div className={styles.grid}>
   <ChartCard title="Top countries" subtitle="Sessions; tap a country for its regions" empty={!countries.length} emptyText="No country with 3 or more sessions in this range yet."
    table={{columns:['Country','Region','Sessions'],rows:countries.flatMap(c=>[[countryName(c.country),'',c.n],...c.regions.map(r=>['',r.name,show(r.n)])])}}>
    <ul className={styles.countryList}>{countries.slice(0,12).map(c=>{const open=openCountry===c.country;return <li key={c.country}>
     <button type="button" aria-expanded={open} onClick={()=>setOpenCountry(open?null:c.country)} disabled={!c.regions.length}>
      <span>{flagOf(c.country)} {c.country==='(unknown)'?'Unknown':countryName(c.country)}</span><b>{fmtInt(c.n)}</b></button>
     {open&&<ul>{c.regions.map(r=><li key={r.region}><span>{r.name}</span><b>{show(r.n)}</b></li>)}</ul>}
    </li>;})}</ul>
   </ChartCard>
   <ChartCard title="Top sources" subtitle="Sessions by link tag (?from= / utm_source), else referring site, else direct" empty={!srcRows.length} emptyText="No source with 3 or more sessions in this range yet."
    table={{columns:['Source','Sessions'],rows:srcRows.map(r=>[r.label,r.value])}}>
    <BarList rows={srcRows} unit="sessions" limit={10}/>
   </ChartCard>
  </div>
 </section>;
}
