'use client';
/**
 * The SEO tab (Nov 15 2026): Google Search Console numbers from the committed snapshot data/seo/snapshot.json (lib/seo/snapshot.ts,
 * docs/seo-snapshot.md), updated once a day by the Search Console browser run; no Google API. Next to them, our own exact
 * "Search arrivals" (SearchSection, also on the Marketing tab) for the header's range. Same tiles, cards, charts and tables as
 * the rest of /admin. A missing or malformed snapshot shows a friendly empty state and the arrivals still render.
 */
import {useState} from 'react';
import type {Report} from '@/lib/analytics/core';
import {isQuickWin,QUICK_WIN,SNAPSHOT_PATH,type SeoLoad,type SeoSnapshot,type SeoWindow} from '@/lib/seo/snapshot';
import {BarList,ChartCard,DayColumns,Delta,LineChart,fmtInt} from './charts';
import SearchSection from './SearchSection';
import SiteFunnelSection from './SiteFunnelSection';
import styles from './admin.module.css';

const day=(d:string)=>new Date(d.slice(0,10)+'T00:00:00Z').toLocaleDateString('en',{month:'short',day:'numeric',timeZone:'UTC'});
const pct1=(x:number)=>`${(Math.round(x*1000)/10).toFixed(1)}%`;
const pos=(x:number|null)=>x===null?'—':x.toFixed(1);
const dash=(x:number|null)=>x===null?'—':fmtInt(x);

type Win='h24'|'d1'|'d7'|'d28';
/** Nov 16 2026 (owner: "today, yesterday and 7 days"): the four windows, their chip names and what a change is compared with. */
const WIN:{k:Win;chip:string;span:string;prev:string}[]=[
 {k:'h24',chip:'Today',span:'last 24 hours',prev:'previous 24 hours'},
 {k:'d1',chip:'Yesterday',span:'yesterday',prev:'the day before'},
 {k:'d7',chip:'Last 7 days',span:'last 7 days',prev:'previous 7 days'},
 {k:'d28',chip:'Last 28 days',span:'last 28 days',prev:'previous 28 days'}];

function Tiles({w,span,lbl}:{w:SeoWindow;span:string;lbl:string}){
 const p=w.prev??null;
 return <div className={styles.startTiles} aria-label={`Google Search, ${span}`}>
  <div><span>Clicks</span><b data-k="seo-clicks">{fmtInt(w.clicks)}</b><Delta cur={w.clicks} prev={p?.clicks} label={lbl}/></div>
  <div><span>Impressions</span><b data-k="seo-impressions">{fmtInt(w.impressions)}</b><Delta cur={w.impressions} prev={p?.impressions} label={lbl}/></div>
  <div><span>Click-through rate</span><b data-k="seo-ctr">{pct1(w.ctr)}</b><Delta cur={w.ctr} prev={p?.ctr} label={lbl} points/></div>
  <div><span>Average position</span><b data-k="seo-position">{pos(w.position)}</b>{p&&p.position!==null&&w.position!==null
   ?<Delta cur={w.position} prev={p.position} label={lbl} goodUp={false}/>:<Delta cur={null} prev={null} label={lbl}/>}</div>
 </div>;
}

function RankTable({rows,first}:{rows:{name:string;clicks:number|null;impressions:number;position:number}[];first:string}){
 return <div className={styles.tableScroll}><table className={styles.table}>
  <thead><tr><th scope="col">{first}</th><th scope="col">Clicks</th><th scope="col">Impressions</th><th scope="col">Position</th></tr></thead>
  <tbody>{rows.map(r=><tr key={r.name}><th scope="row" className={styles.seoName}>{r.name}{isQuickWin(r.position)&&<span className={styles.seoWin} data-win>Quick win</span>}</th>
   <td>{dash(r.clicks)}</td><td>{fmtInt(r.impressions)}</td><td>{r.position.toFixed(1)}</td></tr>)}</tbody>
 </table></div>;
}

function Snapshot({s,summary,warnings}:{s:SeoSnapshot;summary:string[];warnings:string[]}){
 const [win,setWin]=useState<Win>(()=>(WIN.find(o=>o.k!=='d28'&&s.windows[o.k])??WIN[3]).k);
 const cur=WIN.find(o=>o.k===win)!,span=cur.span;
 const w=s.windows[win]??null,h=s.history,ix=s.index;
 const q=s.topQueries.map(r=>({name:r.query,clicks:r.clicks,impressions:r.impressions,position:r.position}));
 const pg=s.topPages.map(r=>({name:r.path,clicks:r.clicks,impressions:r.impressions,position:r.position}));
 const histTable={columns:['Snapshot day','Clicks','Impressions','CTR','Position','Indexed'],rows:h.map(r=>[day(r.day),r.clicks,r.impressions,r.ctr==null?'—':pct1(r.ctr),pos(r.position),r.indexed==null?'—':r.indexed])};
 const log=[...s.workLog].reverse();
 const reqTotal=s.workLog.reduce((a,r)=>a+r.requested.length,0);
 return <>
  <div className={styles.card} aria-label="What's happening" data-seo-summary>
   <div className={styles.cardHead}><div><h2>What’s happening</h2><p>Worked out from the numbers below.</p></div></div>
   <div className={styles.seoSummary}>{summary.map((l,i)=><p key={i}>{l}</p>)}</div>
   {warnings.length>0&&<p className={styles.note}>Snapshot notes: {warnings.join('; ')}.</p>}
  </div>
  <div className={styles.seoWindows} role="group" aria-label="Search Console window">
   {WIN.map(o=><button key={o.k} type="button" className={styles.chip} aria-pressed={win===o.k} disabled={!s.windows[o.k]} data-win={o.k} onClick={()=>setWin(o.k)}>{o.chip}</button>)}
  </div>
  {w&&<Tiles w={w} span={span} lbl={cur.prev}/>}
  <p className={styles.note} data-win-note>{win==='h24'?'Google’s fresh numbers for the last 24 hours, read on '+day(s.asOf)+'; they fill in over the next two days.'
   :win==='d1'&&s.windows.d1?`${day(s.windows.d1.day)}, as Google showed it on ${day(s.asOf)}; the newest days can still grow a little.`
   :`To ${day(s.gscDataThrough)}, Google’s finished data.`}{w&&(w.queries!==undefined||w.pages!==undefined)&&<> {w.queries!==undefined&&`${fmtInt(w.queries)} different searches`}{w.queries!==undefined&&w.pages!==undefined&&' · '}{w.pages!==undefined&&`${fmtInt(w.pages)} pages shown in Google`}.</>}</p>
  <div className={styles.grid}>
   <ChartCard title="Impressions by snapshot day" subtitle="Google's headline number on each day the snapshot was taken" table={histTable} empty={!h.length} emptyText="No snapshot day recorded yet.">
    <DayColumns unit="impressions" ariaLabel="Google impressions by snapshot day" rows={h.map(r=>({key:r.day,label:day(r.day),value:r.impressions,detail:`${fmtInt(r.clicks)} clicks · position ${pos(r.position)}`}))}/>
   </ChartCard>
   <ChartCard title="Clicks by snapshot day" subtitle="Visits Google sent, as Search Console reports them" table={histTable} empty={!h.length} emptyText="No snapshot day recorded yet.">
    <DayColumns unit="clicks" ariaLabel="Google clicks by snapshot day" rows={h.map(r=>({key:r.day,label:day(r.day),value:r.clicks,detail:`${fmtInt(r.impressions)} impressions`}))}/>
   </ChartCard>
   {s.daily.length>0&&<ChartCard wide title="Clicks and impressions per day" subtitle="Google's daily numbers from the Performance report"
    table={{columns:['Day','Clicks','Impressions'],rows:s.daily.map(d=>[day(d.day),d.clicks,d.impressions])}}>
    <LineChart labels={s.daily.map(d=>day(d.day))} ariaLabel="Google clicks and impressions per day"
     series={[{key:'impressions',label:'Impressions',color:'var(--s1)'},{key:'clicks',label:'Clicks',color:'var(--s2)'}]}
     values={{impressions:s.daily.map(d=>d.impressions),clicks:s.daily.map(d=>d.clicks)}}/>
   </ChartCard>}
   <ChartCard wide title="Top searches" subtitle={`What people typed when Google showed the site. Quick win = position ${QUICK_WIN.from}-${QUICK_WIN.to}: close to the top, a better page could lift it. — = clicks not shown by Google`}
    table={{columns:['Search','Clicks','Impressions','Position'],rows:s.topQueries.map(r=>[r.query,dash(r.clicks),r.impressions,r.position.toFixed(1)])}} empty={!q.length} emptyText="No search recorded in this snapshot.">
    <RankTable rows={q} first="Search"/>
   </ChartCard>
   <ChartCard wide title="Top pages" subtitle={`Pages Google showed most, with their average position. Quick win = position ${QUICK_WIN.from}-${QUICK_WIN.to}`}
    table={{columns:['Page','Clicks','Impressions','Position'],rows:s.topPages.map(r=>[r.path,dash(r.clicks),r.impressions,r.position.toFixed(1)])}} empty={!pg.length} emptyText="No page recorded in this snapshot.">
    <RankTable rows={pg} first="Page"/>
   </ChartCard>
   <ChartCard title="Indexing" subtitle={`Google's Pages report, data from ${day(ix.asOf)}${ix.previous?` (was ${fmtInt(ix.previous.indexed)} indexed on ${day(ix.previous.asOf)})`:''}`}
    table={{columns:['Status','Pages','Validation'],rows:[['Indexed',ix.indexed,'—'],...ix.reasons.map(r=>[r.reason,r.pages,r.validation??'—'])]}}>
    <div className={styles.startTiles} data-seo-index style={{gridTemplateColumns:'repeat(2,minmax(0,1fr))'}}>
     <div><span>Indexed</span><b data-k="seo-indexed">{fmtInt(ix.indexed)}</b><small>pages on Google</small></div>
     <div><span>Not indexed</span><b data-k="seo-not-indexed">{fmtInt(ix.notIndexed)}</b><small>pages Google knows of</small></div>
    </div>
    <BarList rows={ix.reasons.map(r=>({key:r.reason,label:r.reason,value:r.pages,detail:r.validation?`validation: ${r.validation}`:undefined}))} unit="pages" limit={10}/>
    {ix.reasons.filter(r=>r.validation).map(r=><p key={r.reason} className={styles.note}>{r.reason}: fix validation {(r.validation??'').toLowerCase().replace(/(\d{4}-\d{2}-\d{2})/,m=>day(m))}{r.examples?.length?` (${r.examples.join(', ')})`:''}.</p>)}
   </ChartCard>
   <ChartCard title="Sitemaps" subtitle="When Google last read each sitemap and how many addresses it found"
    table={{columns:['Sitemap','Last read','Status','Discovered'],rows:s.sitemaps.map(m=>[m.path,m.lastRead?day(m.lastRead):'—',m.status,m.discovered])}} empty={!s.sitemaps.length} emptyText="No sitemap recorded.">
    <div className={styles.tableScroll}><table className={styles.table}>
     <thead><tr><th scope="col">Sitemap</th><th scope="col">Last read</th><th scope="col">Status</th><th scope="col">Discovered</th></tr></thead>
     <tbody>{s.sitemaps.map(m=><tr key={m.path}><th scope="row" className={styles.seoName}>{m.path}</th><td>{m.lastRead?day(m.lastRead):'—'}</td><td>{m.status}</td><td>{fmtInt(m.discovered)}</td></tr>)}</tbody>
    </table></div>
   </ChartCard>
   <ChartCard wide title="Indexing requests" subtitle={`The daily run's work, newest first: ${fmtInt(reqTotal)} pages requested over ${s.workLog.length} ${s.workLog.length===1?'day':'days'} (about 8 a day is Google's limit)`}
    table={{columns:['Day','Requested','Already on Google','Pages','Note'],rows:log.map(r=>[day(r.day),r.requested.length,r.alreadyIndexed,r.requested.join(', '),r.note??''])}} empty={!log.length} emptyText="No indexing request logged yet.">
    <div className={styles.tableScroll}><table className={styles.table}>
     <thead><tr><th scope="col">Day</th><th scope="col">Requested</th><th scope="col">Already on Google</th><th scope="col" className={styles.seoLeft}>Pages and notes</th></tr></thead>
     <tbody>{log.map(r=><tr key={r.day}><th scope="row">{day(r.day)}</th><td>{r.requested.length}</td><td>{r.alreadyIndexed}</td>
      <td className={styles.seoLeft}><span className={styles.seoPaths}>{r.requested.join(', ')}</span>{r.note&&<small className={styles.seoLogNote}>{r.note}</small>}</td></tr>)}</tbody>
    </table></div>
   </ChartCard>
  </div>
 </>;
}

export default function SeoSection({seo,report,rangeText,dayLabel}:{seo:SeoLoad|null;report:Pick<Report,'search'|'siteFunnel'>;rangeText:string;dayLabel:(day:string)=>string}){
 const s=seo&&seo.status==='ok'?seo.data:null;
 const google=report.search?.engines.find(e=>e.id==='google')?.sessions??0;
 return <>
  <section className={styles.island} aria-labelledby="sec-seo" data-seo>
   <div className={styles.sectionHead}><h2 id="sec-seo">Google Search</h2>
    {s?<p className={styles.seoAsOf} data-seo-asof>As of {day(s.asOf)} · Google data through {day(s.gscDataThrough)}</p>
     :<p>Clicks, impressions, searches and indexing from Google Search Console, copied once a day into the site.</p>}</div>
   {s&&seo?.status==='ok'?<Snapshot s={s} summary={seo.summary} warnings={seo.warnings}/>
    :<div className={styles.card} data-seo-empty>
     <p className={styles.empty}>{seo?.status==='invalid'?'The Search Console snapshot could not be read, so there are no Google numbers to show today.':'No Search Console snapshot yet. The Google numbers appear here after the daily Search Console run saves one.'}</p>
     {seo?.status==='invalid'&&<p className={styles.note}>Run <b>node scripts/seo-snapshot.mjs</b> to see what is wrong in {SNAPSHOT_PATH}: {seo.errors.slice(0,3).join('; ')}{seo.errors.length>3?` (+${seo.errors.length-3} more)`:''}.</p>}
    </div>}
   <div className={styles.grid} data-seo-compare>
    <div className={styles.card} aria-label="Google says">
     <div className={styles.cardHead}><div><h2>Google says</h2><p>{s?`Search Console, last ${s.windows.d28?28:7} days to ${day(s.gscDataThrough)}`:'Search Console'}</p></div></div>
     <div className={styles.startTiles} style={{gridTemplateColumns:'repeat(2,minmax(0,1fr))'}}>
      <div><span>Clicks from Google</span><b>{s&&(s.windows.d28||s.windows.d7)?fmtInt((s.windows.d28||s.windows.d7)!.clicks):'—'}</b><small>as Google counts them</small></div>
      <div><span>Impressions</span><b>{s&&(s.windows.d28||s.windows.d7)?fmtInt((s.windows.d28||s.windows.d7)!.impressions):'—'}</b><small>times the site was shown</small></div>
     </div>
    </div>
    <div className={styles.card} aria-label="We counted">
     <div className={styles.cardHead}><div><h2>We counted</h2><p>Our own search arrivals, {rangeText} (the range above)</p></div></div>
     <div className={styles.startTiles} style={{gridTemplateColumns:'repeat(2,minmax(0,1fr))'}}>
      <div><span>Arrivals from Google</span><b data-k="seo-our-google">{fmtInt(google)}</b><small>sessions that started on Google</small></div>
      <div><span>All search and AI</span><b>{fmtInt(report.search?.total??0)}</b><small>every engine and assistant</small></div>
     </div>
    </div>
   </div>
  </section>
  <SearchSection report={report} rangeText={rangeText} dayLabel={dayLabel}/>
  <SiteFunnelSection report={report} rangeText={rangeText} dayLabel={dayLabel}/>
 </>;
}
