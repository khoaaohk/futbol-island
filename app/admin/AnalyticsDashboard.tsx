'use client';
import {useCallback,useEffect,useMemo,useRef,useState,type CSSProperties} from 'react';
import {useRouter} from 'next/navigation';
import {BackButton} from '@/components/BackButton';
import type {Report,Row} from '@/lib/analytics/core';
import {BarList,ChartCard,Columns,LineChart,fmtDuration,fmtInt,fmtPct,type BarRow} from './charts';
import IslandSection from './IslandSection';
import RegionCard from './RegionCard';
import styles from './admin.module.css';

type Preset='today'|'7d'|'30d'|'custom';
const PRESETS:{id:Preset;label:string}[]=[{id:'today',label:'Today'},{id:'7d',label:'7 days'},{id:'30d',label:'30 days'},{id:'custom',label:'Custom'}];
const SOURCE_LABEL:Record<string,string>={direct:'Direct',search:'Search',social:'Social',referral:'Referral',campaign:'Campaign'};
const DEVICE_LABEL:Record<string,string>={phone:'Phone',tablet:'Tablet',desktop:'Desktop'};
const AREA_LABEL:Record<string,string>={island:'Island',paths:'Paths',arcade:'Arcade',museum:'Museum',konbini:'Konbini',controller:'Phone controller',other:'Other pages'};
const PAGE_LABEL:Record<string,string>={'/':'Island (/)','/arcade':'Arcade','/museum':'Museum','/konbini':'Konbini','/controller':'Phone controller','/coffee':'Support page','/other':'Other'};

let regionNames:Intl.DisplayNames|null=null;
function countryName(code:string){
 if(!/^[A-Z]{2}$/.test(code))return code==='(unknown)'?'Unknown':code;
 try{regionNames??=new Intl.DisplayNames(['en'],{type:'region'});return regionNames.of(code)||code;}catch{return code;}
}
const dayLabel=(key:string,hourly:boolean)=>hourly?`${key.slice(11,13)}:00`:new Date(key+'T00:00:00Z').toLocaleDateString('en',{month:'short',day:'numeric',timeZone:'UTC'});

const tableOf=(rows:Row[],label:(k:string)=>string)=>({columns:['Name','Visitors','Sessions','Page views'],rows:rows.map(r=>[label(r.key),r.visitors,r.sessions,r.pageviews])});
const barsOf=(rows:Row[],label:(k:string)=>string,metric:'visitors'|'sessions'='visitors'):BarRow[]=>rows.map(r=>({key:r.key,label:label(r.key),value:r[metric]}));

export default function AnalyticsDashboard({initial,initialRange}:{initial:Report;initialRange:Preset}){
 const router=useRouter();
 const [report,setReport]=useState(initial),[preset,setPreset]=useState<Preset>(initialRange),[loading,setLoading]=useState(false),[error,setError]=useState('');
 const [from,setFrom]=useState(initial.from),[to,setTo]=useState(initial.to);
 const query=useRef(`range=${initialRange}`);

 const load=useCallback(async(q:string)=>{
  query.current=q;setLoading(true);setError('');
  try{
   const res=await fetch(`/api/admin/analytics?${q}`,{cache:'no-store'});
   if(res.status===401){router.refresh();return;}
   if(!res.ok)throw new Error();
   const next=await res.json() as Report;if(query.current===q)setReport(next);
  }catch{setError('Could not load the numbers. Try again in a moment.');}
  finally{if(query.current===q)setLoading(false);}
 },[router]);

 // Refresh once a minute while this tab is visible and the range includes today ("on now" stays current).
 useEffect(()=>{
  let timer:ReturnType<typeof setTimeout>|null=null;
  const today=new Date().toISOString().slice(0,10);
  const arm=()=>{if(timer||document.visibilityState!=='visible'||report.to<today)return;timer=setTimeout(()=>{timer=null;void load(query.current);},60_000);};
  const vis=()=>{if(document.visibilityState==='visible')arm();else if(timer){clearTimeout(timer);timer=null;}};
  arm();document.addEventListener('visibilitychange',vis);
  return()=>{if(timer)clearTimeout(timer);document.removeEventListener('visibilitychange',vis);};
 },[report,load]);

 const choose=(p:Preset)=>{setPreset(p);if(p!=='custom')void load(`range=${p}`);};
 const applyCustom=()=>void load(`range=custom&from=${from}&to=${to}`);
 const logout=async()=>{await fetch('/api/admin/logout',{method:'POST'}).catch(()=>{});router.refresh();};

 const hourly=report.granularity==='hour';
 const t=report.totals,d=report.dims,empty=t.sessions===0;
 const labels=useMemo(()=>report.series.map(p=>dayLabel(p.key,hourly)),[report.series,hourly]);
 const values=useMemo(()=>({visitors:report.series.map(p=>p.visitors),sessions:report.series.map(p=>p.sessions),pageviews:report.series.map(p=>p.pageviews)}),[report.series]);
 const rangeText=report.from===report.to?dayLabel(report.from,false):`${dayLabel(report.from,false)} – ${dayLabel(report.to,false)}`;
 const sources=Object.keys(SOURCE_LABEL).map(k=>d.source.find(r=>r.key===k)??{key:k,visitors:0,sessions:0,pageviews:0});
 const areaTotal=report.areas.reduce((a,r)=>a+r.ms,0);

 return <main className={styles.page}>
  {/* Corners as in the main app and the museum exhibits: Back top left, Log out top right (24/20 px, 16/16 on phones). */}
  <div className={styles.cornerLeft}><BackButton onBack={()=>router.push('/')}/></div>
  <div className={styles.cornerRight}><button type="button" className={styles.secondary} onClick={logout}>Log out</button></div>
  <div className={styles.wrap}>
   <header className={styles.header}>
    <span aria-hidden="true"/>
    <h1><small>Admin</small>Island visitors</h1>
   </header>

   <div className={styles.filters} role="group" aria-label="Date range">
    {PRESETS.map(p=><button key={p.id} type="button" className={styles.chip} aria-pressed={preset===p.id} onClick={()=>choose(p.id)}>{p.label}</button>)}
    {preset==='custom'&&<form className={styles.custom} onSubmit={e=>{e.preventDefault();applyCustom();}}>
     <label>From<input type="date" value={from} max={to} onChange={e=>setFrom(e.target.value)} required/></label>
     <label>To<input type="date" value={to} min={from} onChange={e=>setTo(e.target.value)} required/></label>
     <button type="submit" className={styles.primary}>Show</button>
    </form>}
    <span className={styles.spacer}/>
    <span className={styles.live} data-tip="Tabs that sent anything in the last 5 minutes" title="Tabs that sent anything in the last 5 minutes"><i aria-hidden="true"/>{fmtInt(report.live)} on now</span>
   </div>
   <div className={styles.utcRow}><p className={styles.utc}>{rangeText} · days and hours in UTC{loading?' · loading…':''}</p>{report.notes.map(n=><p key={n} className={styles.utc}>{n}</p>)}</div>

   {!report.configured&&<section className={styles.banner}>
    <h2>Analytics storage is not configured</h2>
    Add <code>SUPABASE_SERVICE_ROLE_KEY</code> to the server environment and run <code>supabase/migrations/20261007_analytics.sql</code> and <code>20261008_analytics_places.sql</code> in Supabase.
    Until then the game sends visits to a route that quietly does nothing.
   </section>}
   {error&&<section className={styles.banner} role="alert">{error}</section>}

   <div className={`${styles.stack} ${loading?styles.loading:''}`} aria-busy={loading}>
    <section className={styles.kpis} aria-label="Totals">
     <div className={`${styles.tile} ${styles.hero}`}><span>Visitors</span><b>{fmtInt(t.visitors)}</b><small>unique per day, added up over the range</small></div>
     <div className={styles.tile}><span>Sessions</span><b>{fmtInt(t.sessions)}</b><small>one per browser tab visit</small></div>
     <div className={styles.tile}><span>Page views</span><b>{fmtInt(t.pageviews)}</b><small>{t.sessions?(t.pageviews/t.sessions).toFixed(1):'0'} per session</small></div>
     <div className={styles.tile}><span>Median visit</span><b>{fmtDuration(t.medianMs)}</b><small>average {fmtDuration(t.avgMs)}</small></div>
     <div className={styles.tile}><span>Bounce rate</span><b>{fmtPct(t.bounceRate)}</b><small>one page and under 10 s</small></div>
    </section>

    <ChartCard wide title="Visitors, sessions and page views" subtitle={hourly?'By hour (UTC)':'By day (UTC)'} empty={empty}
     table={{columns:[hourly?'Hour':'Day','Visitors','Sessions','Page views'],rows:report.series.map((p,i)=>[labels[i],p.visitors,p.sessions,p.pageviews])}}>
     <ul className={styles.legend}>
      <li><i style={{'--key':'var(--s1)'} as CSSProperties}/>Visitors</li>
      <li><i style={{'--key':'var(--s2)'} as CSSProperties}/>Sessions</li>
      <li><i style={{'--key':'var(--s3)'} as CSSProperties}/>Page views</li>
     </ul>
     <LineChart labels={labels} values={values} ariaLabel={`Visitors, sessions and page views, ${rangeText}`}
      series={[{key:'visitors',label:'Visitors',color:'var(--s1)'},{key:'sessions',label:'Sessions',color:'var(--s2)'},{key:'pageviews',label:'Page views',color:'var(--s3)'}]}/>
    </ChartCard>

    <div className={styles.grid}>
     <ChartCard title="Time on site" subtitle="Foreground time per session (hidden tabs and 10+ idle minutes don't count)" empty={empty}
      table={{columns:['Length','Sessions'],rows:report.distribution.map(b=>[b.label,b.sessions])}}>
      <div className={styles.lengthStats}><span>Median <b>{fmtDuration(t.medianMs)}</b></span><span>Average <b>{fmtDuration(t.avgMs)}</b></span><span>Bounce <b>{fmtPct(t.bounceRate)}</b></span></div>
      <Columns rows={report.distribution.map(b=>({label:b.label,value:b.sessions}))} unit="sessions"/>
     </ChartCard>

     <ChartCard title="Countries" subtitle="Visitors by country" empty={empty} table={tableOf(d.country,countryName)}>
      <BarList rows={barsOf(d.country,countryName)} unit="visitors"/>
     </ChartCard>

     <ChartCard title="Where they come from" subtitle="Visitors by source" empty={empty}
      table={{columns:['Source','Visitors','Sessions','Page views'],rows:sources.map(r=>[SOURCE_LABEL[r.key],r.visitors,r.sessions,r.pageviews])}}>
      <BarList rows={barsOf(sources,k=>SOURCE_LABEL[k]||k)} unit="visitors"/>
     </ChartCard>

     <ChartCard title="Referring sites" subtitle="Visitors by referrer (host only)" empty={empty||!d.referrer.length} table={tableOf(d.referrer,k=>k)}>
      <BarList rows={barsOf(d.referrer,k=>k)} unit="visitors"/>
     </ChartCard>

     <ChartCard title="Campaigns" subtitle="utm_campaign · source / medium" empty={empty||!d.campaign.length} table={tableOf(d.campaign,k=>k)}>
      <BarList rows={barsOf(d.campaign,k=>k)} unit="visitors"/>
     </ChartCard>

     <ChartCard title="Devices" subtitle="Visitors by device class" empty={empty} table={tableOf(d.device,k=>DEVICE_LABEL[k]||k)}>
      <BarList rows={barsOf(d.device,k=>DEVICE_LABEL[k]||k)} unit="visitors"/>
     </ChartCard>

     <ChartCard title="Entry pages" subtitle="Sessions by the page they started on" empty={empty} table={tableOf(d.entry,k=>PAGE_LABEL[k]||k)}>
      <BarList rows={barsOf(d.entry,k=>PAGE_LABEL[k]||k,'sessions')} unit="sessions"/>
     </ChartCard>

     <ChartCard title="Where they spend time" subtitle="Foreground minutes by area" empty={empty||!report.areas.length}
      table={{columns:['Area','Minutes','Share'],rows:report.areas.map(a=>[AREA_LABEL[a.area]||a.area,Math.round(a.ms/60000),areaTotal?fmtPct(a.ms/areaTotal):'0%'])}}>
      <BarList rows={report.areas.map(a=>({key:a.area,label:AREA_LABEL[a.area]||a.area,value:Math.round(a.ms/60000)}))} unit="minutes"/>
     </ChartCard>

     <RegionCard report={report} empty={empty} countryName={countryName}/>
    </div>

    <IslandSection report={report}/>
   </div>
  </div>
 </main>;
}
