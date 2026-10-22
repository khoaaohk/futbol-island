'use client';
/**
 * The sponsor Overview (Oct 20 2026; owner: "capture behaviour to sell sponsorships ... design it so the data is simple, then
 * drill in to see additional information"). First tab of /admin: who plays (players, returning share, session length), then one
 * big card per engagement metric (total for the range, change vs the period before, a trend line). A card opens a slide-out
 * with the detail: by day, by item, by device and country (raw days only), averages and completion rates, and how it is
 * counted. Everything comes from report.sponsor (lib/analytics/sponsor.ts, built on the server); the device / country split is
 * fetched when a card opens (/api/admin/sponsor-split). Metrics that are not tracked yet say so instead of showing 0.
 */
import {useCallback,useEffect,useRef,useState} from 'react';
import type {Report} from '@/lib/analytics/core';
import {change,sponsorCsv,type SponsorMetric,type SponsorMetricId} from '@/lib/analytics/sponsor';
import type {SponsorSplit,SplitRow} from '@/lib/analytics/sponsorSplit';
import {DoneButton} from '@/components/DoneButton';
import {BarList,DayColumns,Delta,Sparkline,fmtDuration,fmtInt,fmtPct,type BarRow} from './charts';
import styles from './admin.module.css';
import panelStyles from './LivePanel.module.css';
import s from './SponsorOverview.module.css';

const DEVICE_LABEL:Record<string,string>={phone:'Phone',tablet:'Tablet',desktop:'Desktop','(unknown)':'Unknown'};
/** Phase B cards the SQL device / country split does not cover yet (it would need a new migration: Phase C). */
const NO_SPLIT=new Set<SponsorMetricId>(['social','emotes']);
const shortDay=(day:string)=>new Date(day+'T00:00:00Z').toLocaleDateString('en',{month:'short',day:'numeric',timeZone:'UTC'});
const daysBetween=(a:string,b:string)=>Math.round((Date.parse(b+'T00:00:00Z')-Date.parse(a+'T00:00:00Z'))/86_400_000)+1;
const fmtCell=(v:number|null)=>v===null?'<5':fmtInt(v);
const fmtStat=(v:number|null,f:'int'|'pct'|'min'|'dec')=>v===null?'<5 or not enough data':f==='pct'?fmtPct(v):f==='dec'?v.toFixed(1):fmtInt(v);

function barRows(items:{key:string;label:string;value:number|null;detail?:string}[]):{rows:BarRow[];hidden:number}{
 return {rows:items.filter(i=>i.value!==null&&i.value>0).map(i=>({key:i.key,label:i.label,value:i.value as number,detail:i.detail})),hidden:items.filter(i=>i.value===null).length};
}

export default function SponsorOverview({report,rangeText,playerCount,countryName}:{report:Report;rangeText:string;playerCount:number|null;countryName:(code:string)=>string}){
 const sp=report.sponsor;
 const [open,setOpen]=useState<SponsorMetricId|null>(null),opener=useRef<HTMLElement|null>(null);
 const [split,setSplit]=useState<SponsorSplit|null>(null);
 const splitKey=useRef('');
 const openMetric=(id:SponsorMetricId,el:HTMLElement)=>{opener.current=el;setOpen(id);};
 const close=useCallback(()=>{setOpen(null);requestAnimationFrame(()=>opener.current?.focus({preventScroll:true}));},[]);
 useEffect(()=>{
  if(!open||!sp)return;const key=sp.from+':'+sp.to;if(splitKey.current===key)return;splitKey.current=key;setSplit(null);
  fetch(`/api/admin/sponsor-split?from=${sp.from}&to=${sp.to}`,{cache:'no-store'}).then(r=>r.ok?r.json():null)
   .then(j=>{if(splitKey.current===key)setSplit(j&&j.status?j as SponsorSplit:{status:'error'} as SponsorSplit);}).catch(()=>{if(splitKey.current===key)setSplit({status:'error'} as SponsorSplit);});
 },[open,sp]);

 if(!sp)return <section className={styles.banner}>The engagement overview is not available for this range yet.</section>;
 const n=daysBetween(sp.from,sp.to),prevLabel=n===1?'prior day':`prior ${n} days`;
 const k=sp.kpis,ret=report.sources?.status==='ok'?report.sources.returning:null;
 const srcMissing=report.sources?.status==='needs-migration'?'Needs 20261018_analytics_live.sql':report.sources&&report.sources.status!=='ok'?'Not available here (no analytics database)':null;
 const retKnown=ret&&ret.new!==null&&ret.returning!==null&&(ret.new+ret.returning)>0?ret.returning/(ret.new+ret.returning):null;
 const metric=open?sp.metrics.find(m=>m.id===open)??null:null;

 const download=()=>{
  const csv=sponsorCsv(sp,[
   {label:'Players (distinct, last 14 days of raw rows)',value:playerCount===null?'':String(playerCount)},
   {label:'Players per day (average of daily unique visitors)',value:k.perDay.toFixed(1)},
   {label:'Sessions',value:String(k.sessions)},
   {label:'Average session (foreground minutes)',value:(k.avgSessionMs/60000).toFixed(1)},
   {label:'Returning sessions (share, last 14 days of raw rows)',value:retKnown===null?'':`${Math.round(retKnown*100)}%`},
  ]);
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');
  a.href=url;a.download=`futbol-island-engagement-${sp.from}-to-${sp.to}.csv`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 };

 return <section className={`${styles.island} ${s.root}`} aria-labelledby="sec-overview">
  <div className={s.head}>
   <div className={styles.sectionHead}><h2 id="sec-overview">What players do</h2>
    <p>{rangeText}. Totals for the range, change vs {prevLabel}. Tap a card for the detail.</p></div>
   <button type="button" className={styles.secondary} onClick={download} data-sponsor-csv>Download CSV</button>
  </div>

  {!sp.engageLive&&<p className={s.pending} role="note"><b>Some numbers are not tracked yet.</b> Arcade plays, cards found, card films, pop-up books (opened, finished, bought)
   and reading-visit lengths start counting once the {shortDay(sp.engageSince)} build is live. Those cards say “Not tracked yet” instead of showing 0.</p>}

  <div className={s.audience} role="list" aria-label="Players">
   <div className={styles.tile} role="listitem"><span>Players</span><b>{playerCount===null?'—':fmtInt(playerCount)}</b><small>{playerCount===null&&srcMissing?srcMissing:`distinct players (save code or device)${n>14?', last 14 days only':''}`}</small></div>
   <div className={styles.tile} role="listitem"><span>Players per day</span><b>{fmtInt(k.perDay)}</b><Delta cur={k.perDay} prev={k.prevPerDay} label={prevLabel}/></div>
   <div className={styles.tile} role="listitem"><span>Returning players</span><b>{retKnown===null?'—':fmtPct(retKnown)}</b><small>{retKnown===null&&srcMissing?srcMissing:`of sessions from a device that played before${n>14?' (last 14 days)':''}`}</small></div>
   <div className={styles.tile} role="listitem"><span>Avg session</span><b>{k.sessions?fmtDuration(k.avgSessionMs):'—'}</b><Delta cur={k.sessions?k.avgSessionMs:null} prev={k.prevAvgSessionMs} label={prevLabel}/></div>
  </div>

  <ul className={s.metrics} aria-label="Engagement">
   {sp.metrics.map(m=><li key={m.id}><MetricCard m={m} prevLabel={prevLabel} trendDays={sp.trendDays} onOpen={el=>openMetric(m.id,el)} expanded={open===m.id}/></li>)}
  </ul>

  <details className={s.how}>
   <summary>How these are counted</summary>
   <dl>{sp.metrics.map(m=><div key={m.id}><dt>{m.label}</dt><dd>{m.how}{m.gap?<> <em>{m.gap}</em></>:null}</dd></div>)}
    <div><dt>Players, players per day, returning, avg session</dt><dd>Players = anonymous player ids (a save code, else one device) seen in the range, from the last 14 days of raw rows.
     Players per day = the average of each day’s unique visitors (complete days only). Returning = sessions from a device that had played before, over the last 14 days.
     Avg session = foreground time per session (hidden tabs and 10+ idle minutes do not count).</dd></div>
    <div><dt>Small numbers</dt><dd>A total that rests on fewer than {sp.min} different sessions is shown as “&lt;5”. Days are Pacific days (Los Angeles midnight to midnight). Nothing here is estimated or projected.</dd></div>
   </dl>
  </details>

  <MetricPanel metric={metric} onClose={close} prevLabel={prevLabel} split={split} from={sp.from} to={sp.to} today={report.time?.today??sp.to} countryName={countryName}/>
 </section>;
}

function MetricCard({m,prevLabel,trendDays,onOpen,expanded}:{m:SponsorMetric;prevLabel:string;trendDays:string[];onOpen:(el:HTMLElement)=>void;expanded:boolean}){
 const none=m.status==='none';
 return <button type="button" className={s.metric} data-metric={m.id} data-status={m.status} aria-haspopup="dialog" aria-expanded={expanded} onClick={e=>onOpen(e.currentTarget)}>
  <span className={s.mLabel}>{m.label}</span>
  {none?<b className={s.mNone}>Not tracked yet</b>:<b className={s.mValue}>{fmtCell(m.total)}<small> {m.unit}</small></b>}
  {none?<small className={s.mHint}>Starts counting with the new build</small>:<Delta cur={m.total} prev={m.prev} label={prevLabel}/>}
  {!none&&m.trend.length>1&&<Sparkline values={m.trend.map(v=>v??0)} label={`${m.label} by day, ${trendDays.length} days to ${trendDays[trendDays.length-1]??''}`}/>}
  <span className={s.mFoot}>{m.status==='partial'?<span className={s.badge}>Partly tracked</span>:<span/>}<span aria-hidden="true">Details ›</span></span>
 </button>;
}

function SplitBars({rows,withheld,id,label}:{rows:SplitRow[];withheld:{sessions:number};id:SponsorMetricId;label:(k:string)=>string}){
 const bars=rows.map(r=>({key:r.key,label:label(r.key),value:r.metrics[id]??0,detail:`${fmtInt(r.sessions)} sessions`})).filter(r=>r.value>0);
 if(!bars.length)return <p className={styles.note}>None in these days.</p>;
 return <>{<BarList rows={bars} unit={id==='reading'?'minutes':'total'}/>}{withheld.sessions>0&&<p className={styles.note}>{fmtInt(withheld.sessions)} sessions in groups under 5 are left out.</p>}</>;
}

function MetricPanel({metric,onClose,prevLabel,split,from,to,today,countryName}:{metric:SponsorMetric|null;onClose:()=>void;prevLabel:string;split:SponsorSplit|null;from:string;to:string;today:string;countryName:(c:string)=>string}){
 const done=useRef<HTMLButtonElement>(null),open=!!metric;
 const [last,setLast]=useState<SponsorMetric|null>(metric);
 useEffect(()=>{if(metric)setLast(metric);},[metric]);
 useEffect(()=>{if(!open)return;requestAnimationFrame(()=>done.current?.focus({preventScroll:true}));
  const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();onClose();}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[open,onClose]);
 const m=metric??last;
 const oldest=(()=>{const t=Date.parse(today+'T00:00:00Z')-13*86_400_000;return new Date(t).toISOString().slice(0,10);})();
 const ch=m?change(m.total,m.prev):null;
 return <div className={panelStyles.root} data-open={open} data-pull-ignore aria-hidden={!open}>
  <div className={panelStyles.scrim} onClick={onClose}/>
  <aside className={panelStyles.panel} role="dialog" aria-modal="true" aria-labelledby="sponsor-panel-title">
   <div className={panelStyles.head}><h2 id="sponsor-panel-title">{m?.label??''}</h2>{open&&<DoneButton ref={done} onDone={onClose}/>}</div>
   {m&&<div className={panelStyles.body} data-sponsor-panel={m.id}>
    <div className={s.pTotal}>
     {m.status==='none'?<b className={s.mNone}>Not tracked yet</b>:<b>{fmtCell(m.total)} <small>{m.unit}</small></b>}
     {m.status!=='none'&&<span><Delta cur={m.total} prev={m.prev} label={prevLabel}/>{m.prev!==null&&ch!==null?<small className={styles.note}> (was {fmtCell(m.prev)})</small>:null}</span>}
     <small className={styles.note}>{from===to?shortDay(from):`${shortDay(from)} – ${shortDay(to)}`}</small>
    </div>
    {m.gap&&<p className={s.pending}>{m.gap}</p>}

    {m.status!=='none'&&m.daily.length>1&&<section className={s.block}><h3>By day</h3>
     {m.daily.some(d=>d.value)?<DayColumns rows={m.daily.map(d=>({key:d.day,label:shortDay(d.day),value:d.value}))} unit={m.unit} ariaLabel={`${m.label} by day`}/>
      :<p className={styles.note}>{m.daily.some(d=>d.value===null)?'Every day is under 5 sessions on its own, so the days are not shown one by one (the range total above is).':'None on any day in this range.'}</p>}</section>}

    {m.stats.length>0&&<section className={s.block}><h3>Averages and rates</h3>
     <dl className={s.stats}>{m.stats.map(st=><div key={st.label}><dt>{st.label}</dt><dd>{st.pending?'Not tracked yet':fmtStat(st.value,st.format)}</dd>{st.hint&&<small>{st.hint}</small>}</div>)}</dl></section>}

    {m.breakdowns.map(b=>{const {rows,hidden}=barRows(b.items);
     return <section key={b.id} className={s.block}><h3>{b.title}</h3>
      {b.pending?<p className={styles.note}>Not tracked yet: starts counting with the new build.</p>
       :rows.length?<BarList rows={rows} unit={b.unit}/>:<p className={styles.note}>{hidden?'Every item is under 5 sessions so far.':'None in this range.'}</p>}
      {!b.pending&&rows.length>0&&hidden>0&&<p className={styles.note}>{hidden} more under 5 sessions not shown.</p>}
      {b.note&&<p className={styles.note}>{b.note}</p>}
     </section>;})}

    <section className={s.block}><h3>By device and country</h3>
     {NO_SPLIT.has(m.id)?<p className={styles.note} data-split-na>Not split by device or country yet: the split covers the content cards (games to quizzes). Party and emote totals are shown above.</p>
      :!split?<p className={styles.note}>Loading…</p>
      :split.status==='needs-migration'?<p className={s.pending}>Needs <code>supabase/migrations/20261021_analytics_sponsor_split.sql</code> in Supabase (its last row reads <code>OK, sponsor split installed</code>).</p>
      :split.status==='not-configured'?<p className={styles.note}>Needs the analytics store (not configured here).</p>
      :split.status!=='ok'?<p className={styles.note}>Could not load the split. Try again in a moment.</p>
      :m.status==='none'?<p className={styles.note}>Not tracked yet.</p>
      :<>
       <p className={styles.note}>{from<oldest?`From the last 14 days only (${shortDay(oldest)} – ${shortDay(to)}): older days keep daily totals, not each session’s device or country.`:'Sessions in this range.'}</p>
       <h4 className={s.sub}>Device</h4><SplitBars rows={split.devices} withheld={split.withheld.devices} id={m.id} label={k=>DEVICE_LABEL[k]||k}/>
       <h4 className={s.sub}>Country</h4><SplitBars rows={split.countries} withheld={split.withheld.countries} id={m.id} label={countryName}/>
      </>}
    </section>

    <section className={s.block}><h3>How it is counted</h3><p className={s.howText}>{m.how}</p>
     <p className={styles.note}>Totals resting on fewer than 5 different sessions show as “&lt;5”. Nothing here is estimated.</p></section>
   </div>}
  </aside>
 </div>;
}
