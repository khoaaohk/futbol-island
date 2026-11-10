'use client';
/**
 * "Search arrivals" on the Marketing tab (Nov 10 2026): the stand-in for a search console, from data the site already counts.
 * Everything is report.search, built on the server (lib/analytics/searchReport.ts) with EXACT counts like the rest of this tab:
 * sessions whose first page came from a search engine or an AI assistant, by engine and by landing page, per day and per week,
 * with the first day each landing page was reached. No search words: search engines do not send them and none are read.
 * Same tiles, cards, bars, columns and Table twins as the rest of /admin.
 */
import type {Report} from '@/lib/analytics/core';
import type {SearchPeriod} from '@/lib/analytics/searchReport';
import {BarList,ChartCard,DayColumns,fmtInt} from './charts';
import styles from './admin.module.css';

const EMPTY='No arrival from a search engine or AI assistant in this range yet. Landing pages are counted from the Nov 10 2026 release; an arrival’s count comes in when the visitor leaves the tab, or every few minutes.';
const split=(p:SearchPeriod,ids:string[])=>ids.map(id=>p.byEngine[id]||0);

export default function SearchSection({report,rangeText,dayLabel}:{report:Pick<Report,'search'>;rangeText:string;dayLabel:(day:string)=>string}){
 const s=report.search;
 const head=<div className={styles.sectionHead}><h2 id="sec-search">Search arrivals</h2>
  <p>Sessions for {rangeText} whose first page came from a search engine (Google, Bing, DuckDuckGo, Yahoo, Ecosia, Brave, Yandex, Baidu) or an AI assistant
   (ChatGPT, Perplexity, Copilot, Claude, Gemini), by engine and by the page they landed on. Every number is exact. Search engines do not pass on the words
   people typed, so there are none here.</p></div>;
 if(!s||!s.hasData)return <section className={styles.island} aria-labelledby="sec-search" data-search>{head}<p className={styles.empty}>{EMPTY}</p></section>;
 const ids=s.engines.map(e=>e.id),names=s.engines.map(e=>e.label),top=s.landings[0];
 const newPages=s.landings.filter(l=>l.firstSeen&&s.daily.length&&l.firstSeen>=s.daily[0].key).length;
 return <section className={styles.island} aria-labelledby="sec-search" data-search>
  {head}
  <div className={styles.startTiles} aria-label="Search arrivals headline">
   <div><span>Search and AI arrivals</span><b data-k="se-total">{fmtInt(s.total)}</b><small>sessions, counted since {dayLabel(s.since)}</small></div>
   <div><span>From search engines</span><b data-k="se-search">{fmtInt(s.search)}</b><small>{s.engines.filter(e=>e.kind==='search').map(e=>e.label).join(', ')||'none yet'}</small></div>
   <div><span>From AI assistants</span><b data-k="se-ai">{fmtInt(s.ai)}</b><small>{s.engines.filter(e=>e.kind==='ai').map(e=>e.label).join(', ')||'none yet'}</small></div>
   <div><span>Landing pages reached</span><b data-k="se-pages">{fmtInt(s.landings.length)}</b><small>{fmtInt(newPages)} first reached in this range{top?` · most: ${top.path}`:''}</small></div>
  </div>
  <div className={styles.grid}>
   <ChartCard title="By engine" subtitle="Sessions by the search engine or AI assistant they came from" empty={!s.engines.length} emptyText="Nothing counted in this range yet."
    table={{columns:['Engine','Kind','Sessions'],rows:s.engines.map(e=>[e.label,e.kind==='ai'?'AI assistant':'Search engine',e.sessions])}}>
    <BarList rows={s.engines.map(e=>({key:e.id,label:e.label,value:e.sessions,detail:e.kind==='ai'?'AI assistant':'Search engine'}))} unit="sessions" limit={14}/>
   </ChartCard>
   <ChartCard title="By day" subtitle={s.daily.length>1?'Pacific days, the same as the rest of /admin':'One day in this range'} empty={!s.total} emptyText="Nothing counted in this range yet."
    table={{columns:['Day','All','Search','AI',...names],rows:s.daily.map(d=>[dayLabel(d.key),d.total,d.search,d.ai,...split(d,ids)])}}>
    <DayColumns unit="sessions" ariaLabel={`Search and AI arrivals by day, ${rangeText}`} rows={s.daily.map(d=>({key:d.key,label:dayLabel(d.key),value:d.total}))}/>
   </ChartCard>
   <ChartCard title="By week" subtitle="Weeks start on Monday; a week cut by the range counts only its days in the range" empty={!s.total} emptyText="Nothing counted in this range yet."
    table={{columns:['Week of','Days in range','All','Search','AI',...names],rows:s.weekly.map(w=>[dayLabel(w.key),w.days,w.total,w.search,w.ai,...split(w,ids)])}}>
    <DayColumns unit="sessions" ariaLabel={`Search and AI arrivals by week, ${rangeText}`} rows={s.weekly.map(w=>({key:w.key,label:dayLabel(w.key),value:w.total,detail:`week of ${dayLabel(w.key)} · ${w.days} ${w.days===1?'day':'days'} in range`}))}/>
   </ChartCard>
   <ChartCard title="By referring site, every tracked day" subtitle="Sessions whose referring site is a search engine or AI assistant. Counted since tracking began, so it covers days before landing pages were counted; links that hide the referrer are missing here"
    empty={!s.hosts.total} emptyText="No session with a search or AI referring site in this range."
    table={{columns:['Engine','Kind','Sessions'],rows:s.hosts.engines.map(e=>[e.label,e.kind==='ai'?'AI assistant':'Search engine',e.sessions])}}>
    <BarList rows={s.hosts.engines.map(e=>({key:e.id,label:e.label,value:e.sessions}))} unit="sessions" limit={14}/>
   </ChartCard>
   <ChartCard wide title="Landing pages" subtitle="The page a search or AI arrival opened first, with the first day it was reached (looking back up to 120 days before this range)" empty={!s.landings.length} emptyText="No landing page counted in this range yet."
    table={{columns:['Page','Sessions','First seen','Engines'],rows:s.landings.map(l=>[l.path,l.sessions,l.firstSeen?dayLabel(l.firstSeen):'—',l.engines.map(e=>`${e.label} ${e.sessions}`).join(', ')])}}>
    <BarList rows={s.landings.map(l=>({key:l.path,label:l.path,value:l.sessions,detail:`first seen ${l.firstSeen?dayLabel(l.firstSeen):'—'} · ${l.engines.map(e=>`${e.label} ${e.sessions}`).join(', ')}`}))} unit="sessions" limit={20} share={false}/>
    {s.landings.length>20&&<p className={styles.note}>Top 20 of {s.landings.length}. The table shows all.</p>}
   </ChartCard>
  </div>
 </section>;
}
