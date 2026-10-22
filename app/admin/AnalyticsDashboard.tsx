'use client';
import {useCallback,useEffect,useLayoutEffect,useMemo,useRef,useState,type CSSProperties} from 'react';
import {useRouter} from 'next/navigation';
import {BackButton} from '@/components/BackButton';
import type {Report,Row} from '@/lib/analytics/core';
import {BarList,ChartCard,Columns,LineChart,fmtDuration,fmtInt,fmtPct,type BarRow} from './charts';
import IslandSection from './IslandSection';
import SummitKitSection from './SummitKitSection';
import FishingSection from './FishingSection';
import WaterSection from './WaterSection';
import FriendsSection from './FriendsSection';
import EmoteSection from './EmoteSection';
import LearningSection from './LearningSection';
import StartSection from './StartSection';
import {EngagementTiles,HeadlineTiles,InvestorFunnel,PlanCard} from './OverviewSection';
import {ComingBackCard,NewCodesCard,RestoresCard,RetentionCard,SaveHealthCard,SaveMetricsBanner,SaveStorageCard,WeeklyCodesCard,saveData} from './SavesSection';
import RegionCard from './RegionCard';
import PullToRefresh from './PullToRefresh';
import LivePanel,{type PanelView} from './LivePanel';
import SourcesSection from './SourcesSection';
import liveStyles from './LivePanel.module.css';
import styles from './admin.module.css';
import SponsorOverview from './SponsorOverview';
import SponsorReport from './SponsorReport';
import {isoWeekOf} from '@/lib/analytics/sponsorReport';
import so from './SponsorOverview.module.css';

type Preset='today'|'yesterday'|'7d'|'30d'|'90d'|'all'|'custom';
const PRESETS:{id:Preset;label:string}[]=[{id:'today',label:'Today'},{id:'yesterday',label:'Yesterday'},{id:'7d',label:'7 days'},{id:'30d',label:'30 days'},{id:'90d',label:'90 days'},{id:'all',label:'All'},{id:'custom',label:'Custom'}];
/** Oct 20 2026: tabs instead of one long page (owner: "fix the admin portal so it's easier to find this"). Overview = the sponsor
 *  view (SponsorOverview.tsx); Engagement = engagement, product usage and the learning / title-screen detail; Players = headline,
 *  acquisition and save health; Live = who is on now and each day's players. The sections keep their investor order in source. */
type Tab='overview'|'engagement'|'players'|'live'|'report';
/** Oct 22 2026: + Sponsor report (SponsorReport.tsx, Phase B of docs/analytics-multiplayer-plan.md §8): the weekly sponsor view. */
const TABS:[Tab,string][]=[['overview','Overview'],['engagement','Engagement'],['players','Players'],['live','Live'],['report','Sponsor report']];
const SOURCE_LABEL:Record<string,string>={direct:'Direct',search:'Search',social:'Social',referral:'Referral',campaign:'Campaign'};
const DEVICE_LABEL:Record<string,string>={phone:'Phone',tablet:'Tablet',desktop:'Desktop'};
const AREA_LABEL:Record<string,string>={island:'Island',paths:'Paths',arcade:'Arcade',museum:'Museum',konbini:'Konbini',shop:'Kit Shop',controller:'Phone controller',other:'Other pages'};
const PAGE_LABEL:Record<string,string>={'/':'Title screen and island (/)','/arcade':'Arcade','/museum':'Museum','/konbini':'Konbini','/shop':'Kit Shop','/controller':'Phone controller','/coffee':'Support page','/start':'Old landing page (/start, removed Oct 9 2026)','/other':'Other'};

let regionNames:Intl.DisplayNames|null=null;
function countryName(code:string){
 if(!/^[A-Z]{2}$/.test(code))return code==='(unknown)'?'Unknown':code;
 try{regionNames??=new Intl.DisplayNames(['en'],{type:'region'});return regionNames.of(code)||code;}catch{return code;}
}
/** Day keys are calendar dates ('YYYY-MM-DD', formatted as such). Hour keys: Pacific mode sends the ISO instant each hour
 *  starts (Oct 12 2026), shown as the Los Angeles wall-clock hour, with PDT/PST on a DST day where 1 am happens twice or
 *  2 am never does; the pre-migration UTC mode sends 'YYYY-MM-DDTHH' UTC hours. */
const PT='America/Los_Angeles';
const dayLabel=(key:string,hourly:boolean,zone=false)=>!hourly?new Date(key.slice(0,10)+'T00:00:00Z').toLocaleDateString('en',{month:'short',day:'numeric',timeZone:'UTC'})
 :key.length<=13?`${key.slice(11,13)}:00`
 :new Date(key).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hourCycle:'h23',timeZone:PT,...(zone?{timeZoneName:'short'}:{})});
/** Today's date in Los Angeles (the browser may be anywhere). */
const pacificToday=()=>{try{return new Intl.DateTimeFormat('en-CA',{timeZone:PT,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}catch{return new Date().toISOString().slice(0,10);}};

const tableOf=(rows:Row[],label:(k:string)=>string,visitors='Visitors')=>({columns:['Name',visitors,'Sessions','Page views'],rows:rows.map(r=>[label(r.key),r.visitors,r.sessions,r.pageviews])});
const barsOf=(rows:Row[],label:(k:string)=>string,metric:'visitors'|'sessions'='visitors'):BarRow[]=>rows.map(r=>({key:r.key,label:label(r.key),value:r[metric]}));

const shortDay=(day:string)=>new Date(day+'T00:00:00Z').toLocaleDateString('en',{month:'short',day:'numeric',timeZone:'UTC'});
const dayRun=(days:string[])=>days.length===1?shortDay(days[0]):`${days.length} days (${shortDay(days[0])} – ${shortDay(days[days.length-1])})`;


/** `saves`: the save-code status line from the server (app/admin/page.tsx; counts only, never a code or a save's contents). */
export default function AnalyticsDashboard({initial,initialRange,saves}:{initial:Report;initialRange:Preset;saves?:string}){
 const router=useRouter();
 const [report,setReport]=useState(initial),[preset,setPreset]=useState<Preset>(initialRange),[loading,setLoading]=useState(false),[error,setError]=useState('');
 const [from,setFrom]=useState(initial.from),[to,setTo]=useState(initial.to);
 const [updatedAt,setUpdatedAt]=useState<number|null>(null);
 // Oct 15 2026: the "N on now" tile opens the live slide-out (LivePanel.tsx). Oct 16 2026: the players hero tile opens the same
 // slide-out on that day ("day" view), and the "N players" tile on the range's players ("players" view; each opens a player).
 const [panel,setPanel]=useState<PanelView|null>(null),liveTile=useRef<HTMLButtonElement>(null),opener=useRef<HTMLElement|null>(null);
 const openPanel=useCallback((v:PanelView)=>{opener.current=document.activeElement instanceof HTMLElement?document.activeElement:liveTile.current;setPanel(v);},[]);
 const closeLive=useCallback(()=>{setPanel(null);requestAnimationFrame(()=>(opener.current??liveTile.current)?.focus({preventScroll:true}));},[]);
 // Distinct players in the range (the "N players" tile): /api/admin/players, cached 30 s on the server.
 const [playerCount,setPlayerCount]=useState<number|null>(null);
 useEffect(()=>{
  let gone=false;setPlayerCount(null);
  fetch(`/api/admin/players?from=${report.from}&to=${report.to}`,{cache:'no-store'}).then(r=>r.ok?r.json():null)
   .then(j=>{if(!gone&&j&&j.status==='ok'&&typeof j.players==='number')setPlayerCount(j.players);}).catch(()=>{});
  return()=>{gone=true;};
 },[report.from,report.to,report.generatedAt]);
 const [tab,setTabState]=useState<Tab>('overview');
 const [week,setWeek]=useState<string|null>(null);// the Sponsor report's ISO week (null = the week holding today)
 // The tab lives in the URL hash (#engagement …) so a reload or a shared link opens the same tab.
 useEffect(()=>{const h=location.hash.slice(1);if(TABS.some(([t])=>t===h))setTabState(h as Tab);},[]);
 // The tab toggle's moving pill (Oct 21 2026, owner: "animate the toggle ... have that animate and move over"): one absolutely placed
 // indicator slides and resizes to the selected tab; measured after layout, again on resize and when fonts load. It does not slide
 // on the first paint (`ready` turns the transition on after the first measure).
 const tabsEl=useRef<HTMLDivElement>(null),[pill,setPill]=useState<{x:number;w:number;ready:boolean}|null>(null);
 useLayoutEffect(()=>{
  const measure=()=>{const el=tabsEl.current?.querySelector<HTMLElement>(`[data-tab="${tab}"]`);if(!el)return;setPill(p=>p&&p.x===el.offsetLeft&&p.w===el.offsetWidth?p:{x:el.offsetLeft,w:el.offsetWidth,ready:!!p});};
  measure();
  const raf=requestAnimationFrame(()=>setPill(p=>p?{...p,ready:true}:p));
  window.addEventListener('resize',measure);const fonts=(document as Document&{fonts?:{ready:Promise<unknown>}}).fonts;fonts?.ready.then(measure).catch(()=>{});
  return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',measure);};
 },[tab]);
 const setTab=(t:Tab)=>{setTabState(t);try{history.replaceState(null,'',t==='overview'?location.pathname+location.search:'#'+t);}catch{}};
 const query=useRef(`range=${initialRange}`);
 // The first paint's data came from the server moments ago; stamp it client-side once mounted (avoids an SSR/client
 // Date.now() hydration mismatch).
 useEffect(()=>{setUpdatedAt(Date.now());},[]);

 const load=useCallback(async(q:string)=>{
  query.current=q;setLoading(true);setError('');
  try{
   const res=await fetch(`/api/admin/analytics?${q}`,{cache:'no-store'});
   if(res.status===401){router.refresh();return;}
   if(!res.ok)throw new Error();
   const next=await res.json() as Report;if(query.current===q){setReport(next);setUpdatedAt(Date.now());}
  }catch{setError('Could not load the numbers. Try again in a moment.');}
  finally{if(query.current===q)setLoading(false);}
 },[router]);
 // Pull-to-refresh (mobile, drag down from the top): re-fetches through this same `load`, never a page reload, so
 // the admin session and the current date-range filter survive.
 // Pull-to-refresh is the phone's page reload, so like a reload it always comes back to Today (Oct 15 2026, user request).
 const pullRefresh=useCallback(()=>{setPreset('today');return load('range=today');},[load]);

 // Refresh once a minute while this tab is visible and the range includes today ("on now" stays current).
 useEffect(()=>{
  let timer:ReturnType<typeof setTimeout>|null=null;
  const today=report.time?.mode==='utc'?new Date().toISOString().slice(0,10):pacificToday();
  const arm=()=>{if(timer||document.visibilityState!=='visible'||report.to<today)return;timer=setTimeout(()=>{timer=null;void load(query.current);},60_000);};
  const vis=()=>{if(document.visibilityState==='visible')arm();else if(timer){clearTimeout(timer);timer=null;}};
  arm();document.addEventListener('visibilitychange',vis);
  return()=>{if(timer)clearTimeout(timer);document.removeEventListener('visibilitychange',vis);};
 },[report,load]);

 const choose=(p:Preset)=>{setPreset(p);if(p!=='custom')void load(`range=${p}`);};
 const applyCustom=()=>void load(`range=custom&from=${from}&to=${to}`);
 const logout=async()=>{await fetch('/api/admin/logout',{method:'POST'}).catch(()=>{});router.refresh();};

 const hourly=report.granularity==='hour',tm=report.time,pacific=tm?.mode!=='utc',clock=pacific?'Pacific time':'UTC';
 const t=report.totals,d=report.dims,empty=t.sessions===0;
 const dst=!!tm?.dstDays.length;
 const labels=useMemo(()=>report.series.map(p=>dayLabel(p.key,hourly,dst)+(p.utcDay?'*':'')),[report.series,hourly,dst]);
 const tipLabels=useMemo(()=>report.series.map((p,i)=>p.utcDay?`${labels[i].slice(0,-1)} (UTC day)`:labels[i]),[report.series,labels]);
 // Visitors are unique per day: over a longer range the dimension tables add days up, so they are visitor-days.
 const vUnit=report.from===report.to?'visitors':'visitor-days',vCol=report.from===report.to?'Visitors':'Visitor-days';
 const values=useMemo(()=>({visitors:report.series.map(p=>p.visitors),sessions:report.series.map(p=>p.sessions),pageviews:report.series.map(p=>p.pageviews)}),[report.series]);
 const rangeText=report.from===report.to?dayLabel(report.from,false):`${dayLabel(report.from,false)} – ${dayLabel(report.to,false)}`;
 const sources=Object.keys(SOURCE_LABEL).map(k=>d.source.find(r=>r.key===k)??{key:k,visitors:0,sessions:0,pageviews:0});
 const areaTotal=report.areas.reduce((a,r)=>a+r.ms,0);
 const sd=saveData(report);

 return <main className={styles.page}>
  <PullToRefresh onRefresh={pullRefresh} loading={loading} updated={updatedAt}/>
  {/* Corners as in the main app and the museum exhibits: Back top left, Log out top right (24/20 px, 16/16 on phones). */}
  <div className={styles.cornerLeft}><BackButton onBack={()=>router.push('/')}/></div>
  <div className={styles.cornerRight}><button type="button" className={styles.secondary} onClick={logout}>Log out</button></div>
  <div className={styles.wrap}>
   <header className={styles.header}>
    <span aria-hidden="true"/>
    <h1><small>Admin</small>Analytics</h1>
   </header>

   <div className={so.tabs} role="tablist" aria-label="Admin sections" ref={tabsEl}>
    {pill&&<span className={so.tabPill} data-ready={pill.ready?'true':'false'} aria-hidden="true" style={{width:pill.w,transform:`translateX(${pill.x}px)`}}/>}
    {TABS.map(([id,label])=><button key={id} type="button" role="tab" id={'tab-'+id} aria-selected={tab===id} aria-controls="admin-tabpanel" className={so.tab} data-tab={id} onClick={()=>setTab(id)}>{label}</button>)}
   </div>

   <div className={styles.filters} role="group" aria-label="Date range">
    {PRESETS.map(p=><button key={p.id} type="button" className={styles.chip} aria-pressed={preset===p.id} onClick={()=>choose(p.id)}>{p.label}</button>)}
    {preset==='custom'&&<form className={styles.custom} onSubmit={e=>{e.preventDefault();applyCustom();}}>
     <label>From<input type="date" value={from} max={to} onChange={e=>setFrom(e.target.value)} required/></label>
     <label>To<input type="date" value={to} min={from} onChange={e=>setTo(e.target.value)} required/></label>
     <button type="submit" className={styles.primary}>Show</button>
    </form>}
    <span className={styles.spacer}/>
    {updatedAt!=null&&<span className={styles.utc} data-updated-at>Updated {new Date(updatedAt).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hourCycle:'h23'})}</span>}
    <button type="button" ref={liveTile} className={`${styles.live} ${liveStyles.tile}`} data-live-tile aria-haspopup="dialog" aria-expanded={panel?.mode==='live'} onClick={()=>openPanel({mode:'live'})}
     data-tip="Tabs that sent anything in the last 5 minutes. Tap for who is on now." title="Tabs that sent anything in the last 5 minutes. Tap for who is on now."><i aria-hidden="true"/>{fmtInt(report.live)} on now</button>
    <button type="button" className={`${styles.live} ${liveStyles.tile}`} data-players-tile aria-haspopup="dialog" aria-expanded={panel?.mode==='players'}
     onClick={()=>openPanel({mode:'players',from:report.from,to:report.to})} title="Anonymous players in this range (a save code, or one device without one). Tap for each player.">
     {playerCount===null?'Players':`${fmtInt(playerCount)} player${playerCount===1?'':'s'}`} ›</button>
   </div>
   <div className={styles.utcRow}><p className={styles.utc}>{rangeText}{tm?.partialToday?' (today so far)':''} · days and hours in {pacific?'Pacific time (midnight to midnight, Los Angeles; PDT or PST)':'UTC'}{loading?' · loading…':''}</p>{report.notes.map(n=><p key={n} className={styles.utc}>{n}</p>)}</div>

   {!report.configured&&<section className={styles.banner}>
    <h2>Analytics storage is not configured</h2>
    Add <code>SUPABASE_SERVICE_ROLE_KEY</code> to the server environment and run <code>supabase/migrations/20261007_analytics.sql</code>, <code>20261008_analytics_places.sql</code>, <code>20261009_analytics_counts.sql</code> and <code>20261009_analytics_start.sql</code> in Supabase, in that order.
    Until then the game sends visits to a route that quietly does nothing.
   </section>}
   {report.configured&&report.storage?.needsUpdate&&report.storage.schema>=3&&<section className={`${styles.banner} ${styles.bannerWarn}`} role="status" aria-labelledby="storage-update">
    <h2 id="storage-update">Storage needs an update for the Start page</h2>
    The database is missing the start-page split (analytics schema {report.storage.schema}, this app needs 4). In the Supabase SQL editor, paste the
    <b> whole</b> of <code>supabase/migrations/20261009_analytics_start.sql</code> and run it. Its last result must be one row reading
    <code>OK, start page installed (analytics schema 4)</code>; anything else means it did not finish, and running the whole file again is safe.
    Until then everything keeps counting, including the start-page taps; only the start-page countries, sources and devices stay empty.
   </section>}
   {report.configured&&report.storage?.needsUpdate&&report.storage.schema<3&&<section className={`${styles.banner} ${styles.bannerWarn}`} role="status" aria-labelledby="storage-update">
    <h2 id="storage-update">Storage needs an update for Learning</h2>
    The database is missing the learning counters (analytics schema {report.storage.schema}, this app needs 3). In the Supabase SQL editor, paste the
    <b> whole</b> of <code>supabase/migrations/20261009_analytics_counts.sql</code> and run it. Its last result must be one row reading
    <code>OK, counts installed (analytics schema 3)</code>; anything else means it did not finish, and running the whole file again is safe.
    Until then visits, places and everything above keep counting; only the Learning section stays empty. Then run
    <code>20261009_analytics_start.sql</code> the same way (its last row: <code>OK, start page installed (analytics schema 4)</code>).
   </section>}
   {report.configured&&report.storage?.pacific===false&&<section className={`${styles.banner} ${styles.bannerWarn}`} role="status" aria-labelledby="pacific-update">
    <h2 id="pacific-update">Days are still UTC days</h2>
    The database does not have Pacific-time days yet, so every day below runs midnight to midnight UTC (5 pm to 5 pm Pacific in summer, 4 pm to 4 pm in winter).
    In the Supabase SQL editor, paste the <b>whole</b> of <code>supabase/migrations/20261012_admin_pacific_time.sql</code> and run it. Its last result must be one row reading
    <code>OK, admin pacific time installed</code>; anything else means it did not finish, and running the whole file again is safe.
    Within ten minutes the dashboard switches to Pacific days (the last 14 days are rebuilt exactly from raw rows) and the visitor count starts rotating at Pacific midnight.
   </section>}
   {error&&<section className={styles.banner} role="alert">{error}</section>}

   {/* Oct 11 2026: ordered for investors, most important first (headline → engagement → acquisition → product → save health → detail);
       Oct 20 2026: each section shows on its tab (TABS above). */}
   <div className={`${styles.stack} ${loading?styles.loading:''}`} aria-busy={loading} role="tabpanel" id="admin-tabpanel" aria-labelledby={'tab-'+tab}>
    {tab==='overview'&&<SponsorOverview report={report} rangeText={rangeText} playerCount={playerCount} countryName={countryName}/>}
    {tab==='report'&&<SponsorReport week={week??isoWeekOf(tm?.today??report.to)} onWeek={setWeek}/>}
    {tab==='live'&&<section className={styles.island} aria-labelledby="sec-live">
     <div className={styles.sectionHead}><h2 id="sec-live">Live</h2><p>Who is playing right now, and each day’s players one by one (anonymous; the last 14 days).</p></div>
     <div className={so.liveGrid}>
      <button type="button" className={so.liveCard} aria-haspopup="dialog" onClick={()=>openPanel({mode:'live'})}><span>On now</span><b>{fmtInt(report.live)}</b><small>Tabs that sent anything in the last 5 minutes. Tap for each session.</small></button>
      <button type="button" className={so.liveCard} aria-haspopup="dialog" onClick={()=>openPanel({mode:'day',day:tm?.today??report.to})}><span>Today’s players</span><b>Today ›</b><small>Every session that started today, newest first.</small></button>
      <button type="button" className={so.liveCard} aria-haspopup="dialog" onClick={()=>openPanel({mode:'players',from:report.from,to:report.to})}><span>Players in this range</span><b>{playerCount===null?'Players':fmtInt(playerCount)} ›</b><small>One row per anonymous player; tap one for their sessions.</small></button>
     </div>
    </section>}
    {tab==='players'&&    <section className={styles.island} aria-labelledby="sec-headline">
     <div className={styles.sectionHead}><h2 id="sec-headline">Headline</h2>
      <p>Players, save codes and growth for {rangeText}, each compared with the same number of days just before. Save-code counts (active, returning, retention, stored) are as of today.</p></div>
     <HeadlineTiles report={report} onOpenDay={day=>openPanel({mode:'day',day})}/>
     <ChartCard wide title="Visitors, sessions and page views" subtitle={`${hourly?'By hour':'By day'} (${clock}${tm?.utcDays.length?'; * = a UTC day, frozen before Pacific time':''}). Visitors are unique per ${hourly?'hour':'day'}.`} empty={empty}
      table={{columns:[hourly?`Hour (${clock})`:'Day','Visitors','Sessions','Page views'],rows:report.series.map((p,i)=>[tipLabels[i],p.visitors,p.sessions,p.pageviews])}}>
      <ul className={styles.legend}>
       <li><i style={{'--key':'var(--s1)'} as CSSProperties}/>Visitors</li>
       <li><i style={{'--key':'var(--s2)'} as CSSProperties}/>Sessions</li>
       <li><i style={{'--key':'var(--s3)'} as CSSProperties}/>Page views</li>
      </ul>
      <LineChart labels={labels} tipLabels={tipLabels} values={values} ariaLabel={`Visitors, sessions and page views, ${rangeText}, ${clock}`}
       series={[{key:'visitors',label:'Visitors',color:'var(--s1)'},{key:'sessions',label:'Sessions',color:'var(--s2)'},{key:'pageviews',label:'Page views',color:'var(--s3)'}]}/>
     </ChartCard>
     <div className={styles.grid}>
      <WeeklyCodesCard d={sd} saves={report.saves}/>
      <RetentionCard d={sd} saves={report.saves}/>
     </div>
    </section>}

    {tab==='engagement'&&    <section className={styles.island} aria-labelledby="sec-engagement">
     <div className={styles.sectionHead}><h2 id="sec-engagement">Engagement</h2>
      <p>How long and how often they play, what they learn, and which save codes keep coming back.</p></div>
     <EngagementTiles report={report}/>
     <div className={styles.grid}>
      <ComingBackCard d={sd} saves={report.saves}/>
      <RestoresCard report={report}/>
      <ChartCard wide title="Time on site" subtitle="Foreground time per session (hidden tabs and 10+ idle minutes don't count)" empty={empty}
       table={{columns:['Length','Sessions'],rows:report.distribution.map(b=>[b.label,b.sessions])}}>
       <div className={styles.lengthStats}><span>Median <b>{fmtDuration(t.medianMs)}</b></span><span>Average <b>{fmtDuration(t.avgMs)}</b></span><span>Bounce <b>{fmtPct(t.bounceRate)}</b></span></div>
       <Columns rows={report.distribution.map(b=>({label:b.label,value:b.sessions}))} unit="sessions"/>
      </ChartCard>
     </div>
    </section>}

    {tab==='players'&&    <section className={styles.island} aria-labelledby="sec-acquisition">
     <div className={styles.sectionHead}><h2 id="sec-acquisition">Acquisition</h2>
      <p>From the title screen to a code that comes back, and where visitors come from.</p></div>
     <InvestorFunnel report={report}/>
     <div className={styles.grid}>
      <NewCodesCard d={sd} saves={report.saves}/>
      <ChartCard title="Where they come from" subtitle={`${vCol} by source`} empty={empty}
       table={{columns:['Source',vCol,'Sessions','Page views'],rows:sources.map(r=>[SOURCE_LABEL[r.key],r.visitors,r.sessions,r.pageviews])}}>
       <BarList rows={barsOf(sources,k=>SOURCE_LABEL[k]||k)} unit={vUnit}/>
      </ChartCard>
      <ChartCard title="Countries" subtitle={`${vCol} by country`} empty={empty} table={tableOf(d.country,countryName,vCol)}>
       <BarList rows={barsOf(d.country,countryName)} unit={vUnit}/>
      </ChartCard>
      <RegionCard report={report} empty={empty} countryName={countryName}/>
      <ChartCard title="Referring sites" subtitle={`${vCol} by referrer (host only)`} empty={empty||!d.referrer.length} table={tableOf(d.referrer,k=>k,vCol)}>
       <BarList rows={barsOf(d.referrer,k=>k)} unit={vUnit}/>
      </ChartCard>
      <ChartCard title="Campaigns" subtitle={`${vCol} by utm_campaign · source / medium`} empty={empty||!d.campaign.length} table={tableOf(d.campaign,k=>k,vCol)}>
       <BarList rows={barsOf(d.campaign,k=>k)} unit={vUnit}/>
      </ChartCard>
      <ChartCard title="Devices" subtitle={`${vCol} by device class`} empty={empty} table={tableOf(d.device,k=>DEVICE_LABEL[k]||k,vCol)}>
       <BarList rows={barsOf(d.device,k=>DEVICE_LABEL[k]||k)} unit={vUnit}/>
      </ChartCard>
      <ChartCard title="Entry pages" subtitle="Sessions by the page they started on" empty={empty} table={tableOf(d.entry,k=>PAGE_LABEL[k]||k)}>
       <BarList rows={barsOf(d.entry,k=>PAGE_LABEL[k]||k,'sessions')} unit="sessions"/>
      </ChartCard>
     </div>
     <SourcesSection report={report} countryName={countryName}/>
    </section>}

    {tab==='engagement'&&    <section className={styles.island} aria-labelledby="sec-product">
     <div className={styles.sectionHead}><h2 id="sec-product">Product usage</h2>
      <p>Which parts of the game get used: places on the island (Coaches Board included), the arcade, the museum and the Football plan.</p></div>
     <div className={styles.grid}>
      <ChartCard title="Where they spend time" subtitle="Foreground minutes by area" empty={empty||!report.areas.length}
       table={{columns:['Area','Minutes','Share'],rows:report.areas.map(a=>[AREA_LABEL[a.area]||a.area,Math.round(a.ms/60000),areaTotal?fmtPct(a.ms/areaTotal):'0%'])}}>
       <BarList rows={report.areas.map(a=>({key:a.area,label:AREA_LABEL[a.area]||a.area,value:Math.round(a.ms/60000)}))} unit="minutes"/>
      </ChartCard>
      <PlanCard report={report}/>
     </div>
     <IslandSection report={report}/>
     <SummitKitSection report={report}/>
     <FishingSection report={report}/>
     <WaterSection report={report}/>
     <FriendsSection report={report}/>
     <EmoteSection report={report}/>
    </section>}

    {tab==='players'&&    <section className={styles.island} aria-labelledby="sec-health">
     <div className={styles.sectionHead}><h2 id="sec-health">Save health and operations</h2>
      <p>Rate limits, the breaker, the saving-break card, storage and the 12-month expiry pipeline.</p>
      {saves&&<p className={styles.note} data-save-status>{saves}</p>}</div>
     <SaveMetricsBanner saves={report.saves}/>
     <div className={styles.grid}>
      <SaveHealthCard report={report}/>
      <SaveStorageCard d={sd} saves={report.saves}/>
     </div>
    </section>}

    {tab==='engagement'&&    <section className={styles.island} aria-labelledby="sec-detail">
     <div className={styles.sectionHead}><h2 id="sec-detail">Detail</h2>
      <p>The full title-screen breakdown (every funnel, For grown-ups, donations, privacy) and the learning detail (lesson funnels, question analysis, settings).</p></div>
     <StartSection report={report} countryName={countryName}/>
     <LearningSection report={report}/>
    </section>}
   </div>
  </div>
  <LivePanel view={panel} onClose={closeLive} countryName={countryName}/>
 </main>;
}
