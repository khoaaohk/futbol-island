'use client';
/**
 * "Marketing page" tab (Nov 3 2026): how the tour page at `/` performs. Everything comes from report.marketing, built and
 * small-number-suppressed on the server (lib/analytics/marketingReport.ts): a null cell rests on fewer than 5 sessions in the
 * range and shows as "<5". Same tiles, cards, bars, step chart, line chart and Table twins as the rest of /admin.
 */
import {useMemo,type CSSProperties} from 'react';
import type {Report} from '@/lib/analytics/core';
import type {Cell} from '@/lib/analytics/learning';
import type {MkRow} from '@/lib/analytics/marketingReport';
import {BarList,ChartCard,LineChart,fmtDuration,fmtInt,fmtPct,type BarRow} from './charts';
import {Steps} from './StartSection';
import styles from './admin.module.css';

const EMPTY='No marketing-page visits in this range yet. Counting starts with the Nov 3 2026 release; a visit’s numbers arrive when the visitor leaves the tab, or every few minutes.';
const show=(c:Cell)=>c===null?'<5':fmtInt(c);
const pct=(x:number|null)=>x===null?'—':fmtPct(x);
const bar=(r:MkRow,by:'sessions'|'count'='sessions'):BarRow=>{const v=r[by];return {key:r.id,label:r.label,value:v??0,text:v===null?'<5':undefined,
 detail:v===null?'fewer than 5 sessions':r.rate!==null?`${fmtPct(r.rate)} of ${by==='count'?'views':'sessions'}`:undefined};};
const table=(rows:MkRow[],first='Name',by:'sessions'|'count'='sessions')=>({columns:[first,by==='count'?'Views':'Sessions',...(by==='sessions'?['Taps / times']:[]),'Share'],
 rows:rows.map(r=>[r.group?`${r.group} · ${r.label}`:r.label,show(r[by]),...(by==='sessions'?[show(r.count)]:[]),pct(r.rate)])});
const any=(rows:MkRow[],by:'sessions'|'count'='sessions')=>rows.some(r=>r[by]!==0);

function Card({title,subtitle,rows,by='sessions',unit,first,limit=12,wide,ordered}:{title:string;subtitle:string;rows:MkRow[];by?:'sessions'|'count';unit:string;first?:string;limit?:number;wide?:boolean;ordered?:boolean}){
 const sorted=ordered?rows:[...rows].sort((a,b)=>(b[by]??2.5)-(a[by]??2.5));
 return <ChartCard title={title} subtitle={subtitle} wide={wide} empty={!any(rows,by)} emptyText="Nothing yet in this range." table={table(rows,first,by)}>
  <BarList rows={sorted.filter(r=>r[by]!==0).map(r=>bar(r,by))} unit={unit} limit={limit} share={false}/>
 </ChartCard>;
}

export default function MarketingSection({report,rangeText,dayLabel}:{report:Report;rangeText:string;dayLabel:(day:string)=>string}){
 const m=report.marketing;
 const labels=useMemo(()=>(m?.daily??[]).map(d=>dayLabel(d.day)),[m]);// eslint-disable-line react-hooks/exhaustive-deps
 const values=useMemo(()=>({views:(m?.daily??[]).map(d=>d.views),visitors:(m?.daily??[]).map(d=>d.visitors),play:(m?.daily??[]).map(d=>d.play)}),[m]);
 if(!m||!m.hasData)return <section className={styles.island} aria-labelledby="sec-marketing">
  <div className={styles.sectionHead}><h2 id="sec-marketing">Marketing page</h2><p>The tour page at futbolisland.app/ for {rangeText}.</p></div>
  <p className={styles.empty}>{EMPTY}</p>
 </section>;
 const multi=m.daily.length>1,clicks=m.clicks.filter(r=>r.count!==0);
 return <section className={styles.island} aria-labelledby="sec-marketing">
  <div className={styles.sectionHead}><h2 id="sec-marketing">Marketing page</h2>
   <p>The tour page at futbolisland.app/ for {rangeText}: who visits, how long they stay, what they look at and tap, and how many go on to play.
    {m.hidden?` ${m.hidden} small numbers (under ${m.min} sessions) show as “<5”.`:''}</p></div>
  <div className={styles.startTiles} aria-label="Marketing page headline">
   <div><span>Visits</span><b>{fmtInt(m.views)}</b><small>{fmtInt(m.sessions)} sessions</small></div>
   <div><span>Unique visitors</span><b>{fmtInt(m.visitors)}</b><small>{multi?'visitor-days, ':''}landed on the page</small></div>
   <div><span>Average time on page</span><b>{m.avgMs===null?'—':fmtDuration(m.avgMs)}</b><small>median {m.medianBand??'—'} (first look)</small></div>
   <div><span>Bounce rate</span><b>{pct(m.bounceRate)}</b><small>left in under 10 s without a tap</small></div>
   <div><span>Play click-through</span><b>{pct(m.play.ctr)}</b><small>{show(m.play.sessions)} sessions tapped a Play</small></div>
   <div><span>Reached the game</span><b>{pct(m.play.reachRate)}</b><small>{show(m.play.reached)} of the Play taps arrived at /play</small></div>
   <div><span>Visit to game</span><b>{pct(m.play.overall)}</b><small>sessions that went on to /play</small></div>
   <div><span>Engaged visits</span><b>{pct(m.engagedRate)}</b><small>10 s or more, or a tap</small></div>
  </div>
  <ChartCard wide title="Visits by day" subtitle="Visits, unique visitors who landed on the page, and sessions that tapped a Play" empty={!m.daily.some(d=>d.views)}
   table={{columns:['Day','Visits','Unique visitors','Sessions','Tapped Play','Reached /play'],rows:m.daily.map((d,i)=>[labels[i],d.views,d.visitors,d.sessions,d.play,d.reached])}}>
   <ul className={styles.legend}>
    <li><i style={{'--key':'var(--s1)'} as CSSProperties}/>Visits</li>
    <li><i style={{'--key':'var(--s2)'} as CSSProperties}/>Unique visitors</li>
    <li><i style={{'--key':'var(--s3)'} as CSSProperties}/>Tapped Play</li>
   </ul>
   <LineChart labels={labels} values={values} ariaLabel={`Marketing page visits, visitors and Play taps, ${rangeText}`}
    series={[{key:'views',label:'Visits',color:'var(--s1)'},{key:'visitors',label:'Unique visitors',color:'var(--s2)'},{key:'play',label:'Tapped Play',color:'var(--s3)'}]}/>
  </ChartCard>
  <div className={styles.grid}>
   <ChartCard title="Scroll depth" subtitle="Sessions that scrolled at least this far" empty={!any(m.scroll)} emptyText="Nothing yet in this range." table={table(m.scroll,'Depth')}>
    <Steps steps={[{id:'view',label:'Opened the page',sessions:m.sessions>=m.min?m.sessions:null},...m.scroll.map(r=>({id:r.id,label:r.label,sessions:r.sessions}))]}/>
   </ChartCard>
   <Card title="Sections seen" subtitle="Share of sessions that had half of each section on screen" rows={m.sections} unit="sessions" first="Section" limit={11}/>
   <Card wide title="What they tap" subtitle={`Sessions with each tap (the table also has the total taps). ${clicks.length} kinds of tap in this range.`} rows={m.clicks} unit="sessions" first="Tap" limit={16}/>
   <Card title="Carousel cards viewed" subtitle="See it in action: sessions that saw each card while the carousel was on screen" rows={m.reel} unit="sessions" first="Card"/>
   <Card title="Slideshow slides viewed" subtitle="Even more to explore: sessions that saw each slide" rows={m.slides} unit="sessions" first="Slide"/>
   <Card title="FAQ questions opened" subtitle="Questions grown-ups ask: sessions that opened each one" rows={m.faq} unit="sessions" first="Question"/>
   <Card title="Friends steps seen" subtitle="Play with a friend in 3 steps: sessions that reached each step" rows={m.steps} unit="sessions" first="Step" ordered/>
   <Card title="Where visits come from" subtitle="Share of visits by source" rows={m.sources} by="count" unit="visits" first="Source"/>
   <Card title="Referring sites" subtitle="Named search engines, AI assistants and social apps (never the full address)" rows={m.referrers} by="count" unit="visits" first="Site"/>
   <Card title="Devices" subtitle="Share of visits by device" rows={m.devices} by="count" unit="visits" first="Device"/>
   <Card title="New or returning" subtitle="Whether this device had played the game before" rows={m.returning} by="count" unit="visits" first="Device"/>
   <Card title="Time on page" subtitle="First look, until the tab was hidden or left" rows={m.time} by="count" unit="visits" first="Length" limit={6} ordered/>
   <Card title="Pictures and clips" subtitle="Visits where a clip played, or a picture or clip failed to load" rows={m.media} by="count" unit="visits" first="Media"/>
   <ChartCard wide title="Core Web Vitals" subtitle="Share of measured visits in Google’s “good” band (good / needs improvement / poor)" empty={!m.vitals.some(v=>v.measured)}
    emptyText="No measurements yet (browsers without the Performance API send none)."
    table={{columns:['Metric','Good','Needs improvement','Poor','Good share'],rows:m.vitals.map(v=>[v.label,show(v.bands.good),show(v.bands.ni),show(v.bands.poor),pct(v.goodShare)])}}>
    <BarList share={false} unit="good" format={n=>fmtPct(n/100)} rows={m.vitals.map(v=>({key:v.id,label:`${v.label} (good ≤ ${v.good})`,value:v.goodShare===null?0:Math.round(v.goodShare*100),
     text:v.goodShare===null?(v.measured===0?'—':'<5'):undefined,detail:v.measured?`${fmtInt(v.measured)} visits measured`:undefined}))}/>
   </ChartCard>
  </div>
 </section>;
}
