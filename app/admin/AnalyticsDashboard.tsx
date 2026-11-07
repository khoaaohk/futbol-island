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
import LiveMatchesSection from './LiveMatchesSection';
import EmoteSection from './EmoteSection';
import PartyRetentionCard from './PartyRetentionCard';
import LearningSection from './LearningSection';
import StartSection from './StartSection';
import MarketingSection from './MarketingSection';
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
import OverviewStory from './OverviewStory';
import PlayersExplorer from './PlayersExplorer';
import ExportControl from './ExportControl';
import {TrendStrip} from './TrendTiles';
import {DefinitionsPanel,MetricIndexPanel} from './DefinitionsPanel';
import {K,compareState,fmtDay,type DashboardData} from '@/lib/analytics/dashboard';
import {DASH_TABS,OLD_TAB,type DashTab} from '@/lib/analytics/metricIndex';
import dd from './dash.module.css';
import {isoWeekOf} from '@/lib/analytics/sponsorReport';
import so from './SponsorOverview.module.css';

type Preset='today'|'yesterday'|'7d'|'14d'|'30d'|'90d'|'all'|'custom';
const PRESETS:{id:Preset;label:string}[]=[{id:'today',label:'Today'},{id:'yesterday',label:'Yesterday'},{id:'7d',label:'7 days'},{id:'14d',label:'14 days'},{id:'30d',label:'30 days'},{id:'90d',label:'90 days'},{id:'all',label:'All'},{id:'custom',label:'Custom'}];
/** Nov 6 2026 (owner: "rebuild it so I can see trends better"): the dashboard opens on the last 30 days; a reload or a pull comes back to it. */
const DEFAULT_RANGE:Preset='30d';
/** Oct 20 2026: tabs instead of one long page (owner: "fix the admin portal so it's easier to find this"). Overview = the sponsor
 *  view (SponsorOverview.tsx); Engagement = engagement, product usage and the learning / title-screen detail; Players = headline,
 *  acquisition and save health; Live = who is on now and each day's players. The sections keep their investor order in source. */
/** Oct 22 2026: + Sponsor report (SponsorReport.tsx, Phase B of docs/analytics-multiplayer-plan.md §8): the weekly sponsor view.
 *  Nov 6 2026 (the trend rebuild): nine tabs (lib/analytics/metricIndex.ts DASH_TABS); the old Engagement tab's sections moved to
 *  Players and retention, Learning, Island and games and Fishing; old #hashes still open the right tab (OLD_TAB). */
type Tab=DashTab;
const TABS:[Tab,string][]=DASH_TABS;
const SOURCE_LABEL:Record<string,string>={direct:'Direct',search:'Search',social:'Social',referral:'Referral',campaign:'Campaign'};
const DEVICE_LABEL:Record<string,string>={phone:'Phone',tablet:'Tablet',desktop:'Desktop'};
const AREA_LABEL:Record<string,string>={island:'Island',paths:'Paths',arcade:'Arcade',museum:'Museum',konbini:'Konbini',shop:'Kit Shop',controller:'Phone controller',other:'Other pages'};
const PAGE_LABEL:Record<string,string>={'/':'Home: the feature tour (/; the title screen and island until Nov 3 2026)','/play':'Title screen and island (/play)','/arcade':'Arcade','/museum':'Museum','/konbini':'Konbini','/shop':'Kit Shop','/controller':'Phone controller','/coffee':'Support page','/start':'Old landing page (/start, removed Oct 9 2026)','/other':'Other'};

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
export default function AnalyticsDashboard({initial,initialDash,initialRange,saves}:{initial:Report;initialDash?:DashboardData|null;initialRange:Preset;saves?:string}){
 const router=useRouter();
 // The trend data (the daily layer, lib/analytics/dashboard.ts): loaded with the report, for the same range, in parallel.
 const [dash,setDash]=useState<DashboardData|null>(initialDash??null),[dashError,setDashError]=useState(false);
 const [compare,setCompare]=useState(true),[defsOpen,setDefsOpen]=useState(false),[defTarget,setDefTarget]=useState<string|null>(null);
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
 useEffect(()=>{const h=location.hash.slice(1),t=TABS.some(([x])=>x===h)?h as Tab:OLD_TAB[h];if(t)setTabState(t);},[]);
 // The tab toggle's moving pill (Oct 21 2026, owner: "animate the toggle ... have that animate and move over"): one absolutely placed
 // indicator slides and resizes to the selected tab; measured after layout, again on resize and when fonts load. It does not slide
 // on the first paint (`ready` turns the transition on after the first measure).
 const tabsEl=useRef<HTMLDivElement>(null),[pill,setPill]=useState<{x:number;w:number;ready:boolean}|null>(null);
 useLayoutEffect(()=>{
  const measure=()=>{const el=tabsEl.current?.querySelector<HTMLElement>(`[data-tab="${tab}"]`);if(!el)return;
   // Nine tabs scroll sideways inside their own row on a phone: keep the selected one in view (the page never scrolls sideways).
   const row=tabsEl.current!;if(el.offsetLeft<row.scrollLeft||el.offsetLeft+el.offsetWidth>row.scrollLeft+row.clientWidth)row.scrollLeft=Math.max(0,el.offsetLeft-16);
   setPill(p=>p&&p.x===el.offsetLeft&&p.w===el.offsetWidth?p:{x:el.offsetLeft,w:el.offsetWidth,ready:!!p});};
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

 const load=useCallback(async(q:string,{trends=true}:{trends?:boolean}={})=>{
  query.current=q;setLoading(true);setError('');
  // The report (every tab's sections) and the trend data (the daily layer) for the same range, fetched together: no waterfall.
  const trend=trends?fetch(`/api/admin/dashboard?${q}`,{cache:'no-store'}).then(r=>r.ok?r.json() as Promise<DashboardData>:Promise.reject(r.status)).catch(()=>null):null;
  try{
   const res=await fetch(`/api/admin/analytics?${q}`,{cache:'no-store'});
   if(res.status===401){router.refresh();return;}
   if(!res.ok)throw new Error();
   const next=await res.json() as Report;if(query.current===q){setReport(next);setUpdatedAt(Date.now());}
  }catch{setError('Could not load the numbers. Try again in a moment.');}
  finally{
   if(trend){const t=await trend;if(query.current===q){if(t)setDash(t);setDashError(!t);}}
   if(query.current===q)setLoading(false);}
 },[router]);
 // Pull-to-refresh (mobile, drag down from the top): re-fetches through this same `load`, never a page reload, so
 // the admin session and the current date-range filter survive.
 // Pull-to-refresh is the phone's page reload, so like a reload it always comes back to Today (Oct 15 2026, user request).
 // Nov 6 2026: a reload now opens on the last 30 days (DEFAULT_RANGE), so a pull, "like a reload", comes back to it.
 const pullRefresh=useCallback(()=>{setPreset(DEFAULT_RANGE);return load('range='+DEFAULT_RANGE);},[load]);
 const refresh=()=>void load(query.current);

 // Refresh once a minute while this tab is visible and the range includes today ("on now" stays current).
 // The trend data (a heavier read) refreshes every fifth tick only: the minute refresh is for "on now" and today's counts.
 const ticks=useRef(0);
 useEffect(()=>{
  let timer:ReturnType<typeof setTimeout>|null=null;
  const today=report.time?.mode==='utc'?new Date().toISOString().slice(0,10):pacificToday();
  const arm=()=>{if(timer||document.visibilityState!=='visible'||report.to<today)return;timer=setTimeout(()=>{timer=null;ticks.current++;void load(query.current,{trends:ticks.current%5===0});},60_000);};
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
 const cmp=dash?compareState(dash):null,useCmp=compare&&!!cmp?.ok;
 const rt=report.sources?.status==='ok'?report.sources.returning:null,retShare=rt&&rt.new!==null&&rt.returning!==null&&rt.new+rt.returning>0?rt.returning/(rt.new+rt.returning):null;
 const openDef=(key:string)=>{setDefTarget(key);setDefsOpen(true);if(tab!=='overview')setTab('overview');};
 const strip=(title:string,items:{key:string;label?:string;metric?:string}[],note?:string)=><TrendStrip data={dash} items={items} compare={useCmp} onDef={openDef} title={title} note={note}/>;

 return <main className={styles.page} data-compare={useCmp?'on':'off'}>
  <PullToRefresh onRefresh={pullRefresh} loading={loading} updated={updatedAt}/>
  {/* Corners as in the main app and the museum exhibits: Back top left, Log out top right (24/20 px, 16/16 on phones). */}
  <div className={styles.cornerLeft}><BackButton onBack={()=>router.push('/play')}/></div>
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

   {/* Nov 6 2026: one header for every tab: range, compare, refresh, export; the range and compare apply to every tab. */}
   <div className={styles.filters} role="group" aria-label="Date range">
    {PRESETS.map(p=><button key={p.id} type="button" className={styles.chip} aria-pressed={preset===p.id} onClick={()=>choose(p.id)}>{p.label}</button>)}
    {preset==='custom'&&<form className={styles.custom} onSubmit={e=>{e.preventDefault();applyCustom();}}>
     <label>From<input type="date" value={from} max={to} onChange={e=>setFrom(e.target.value)} required/></label>
     <label>To<input type="date" value={to} min={from} onChange={e=>setTo(e.target.value)} required/></label>
     <button type="submit" className={styles.primary}>Show</button>
    </form>}
   </div>
   <div className={dd.bar}>
    <label className={dd.compare} data-off={cmp&&!cmp.ok?'':undefined} title={cmp&&!cmp.ok?cmp.reason:'Each trend against the same number of complete days just before'}>
     <input type="checkbox" checked={useCmp} disabled={!cmp?.ok} onChange={e=>setCompare(e.target.checked)} data-compare-toggle/>
     {cmp&&!cmp.ok?`Compare: ${cmp.reason[0].toLowerCase()+cmp.reason.slice(1)}`:cmp?.ok?`Compare with ${fmtDay(cmp.from)} – ${fmtDay(cmp.to)}`:'Compare to the previous period'}
    </label>
    <button type="button" className={styles.secondary} onClick={refresh} disabled={loading} data-refresh>{loading?'Loading…':'Refresh'}</button>
    <span className={styles.spacer}/>
    {updatedAt!=null&&<span className={styles.utc} data-updated-at>Updated {new Date(updatedAt).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hourCycle:'h23'})}</span>}
    <button type="button" ref={liveTile} className={`${styles.live} ${liveStyles.tile}`} data-live-tile aria-haspopup="dialog" aria-expanded={panel?.mode==='live'} onClick={()=>openPanel({mode:'live'})}
     data-tip="Tabs that sent anything in the last 5 minutes. Tap for who is on now." title="Tabs that sent anything in the last 5 minutes. Tap for who is on now."><i aria-hidden="true"/>{fmtInt(report.live)} on now</button>
    <button type="button" className={`${styles.live} ${liveStyles.tile}`} data-players-tile aria-haspopup="dialog" aria-expanded={panel?.mode==='players'}
     onClick={()=>openPanel({mode:'players',from:report.from,to:report.to})} title="Anonymous players in this range (a save code, or one device without one). Tap for each player.">
     {playerCount===null?'Players':`${fmtInt(playerCount)} player${playerCount===1?'':'s'}`} ›</button>
   </div>
   <div className={styles.utcRow}><p className={styles.utc}>{rangeText}{tm?.partialToday?' (today so far: a partial day, left out of averages and comparisons)':''} · days and hours in {pacific?'Pacific time (midnight to midnight, Los Angeles; PDT or PST)':'UTC'}{loading?' · loading…':''}</p>{report.notes.map(n=><p key={n} className={styles.utc}>{n}</p>)}</div>
   <details className={dd.exportBox} data-header-export><summary>Export (CSV and ZIP, exact numbers)</summary>
    <ExportControl from={report.from} to={report.to} today={tm?.today??report.to}/></details>

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

   {dashError&&<section className={styles.banner} role="status">The trend charts could not load just now (the sections below still show this range). Try Refresh.</section>}

   {/* Oct 11 2026: ordered for investors, most important first (headline → engagement → acquisition → product → save health → detail);
       Oct 20 2026: each section shows on its tab (TABS above). Nov 6 2026: each tab opens with its trends (TrendStrip, the daily
       layer); every older section and number is kept (data-metric ids: lib/analytics/metricIndex.ts, tests/admin-dashboard.cjs). */}
   <div className={`${styles.stack} ${loading?styles.loading:''}`} aria-busy={loading} role="tabpanel" id="admin-tabpanel" aria-labelledby={'tab-'+tab}>
    {tab==='overview'&&<OverviewStory data={dash} compare={useCmp} onDef={openDef} onPlayers={()=>setTab('players')} fallback={{players:playerCount,returning:retShare}}/>}
    {tab==='overview'&&<div className={dd.mx} data-metric="overview.cards"><span className={dd.mx} data-metric="overview.export"/>
    {tab==='overview'&&<SponsorOverview report={report} rangeText={rangeText} playerCount={playerCount} countryName={countryName}/>}
    </div>}
    {tab==='overview'&&<DefinitionsPanel data={dash} open={defsOpen} onToggle={setDefsOpen} target={defTarget}/>}
    {tab==='overview'&&<MetricIndexPanel onGo={t=>{setTab(t);window.scrollTo({top:0});}}/>}

    {tab==='matches'&&strip('Live matches trends',[{key:K.lmJoins,label:'Matches joined'},{key:K.lmVisits,label:'Pitch visits'},{key:K.lmSeconds,label:'Match time'},{key:K.lmGoals,label:'Goals while on',metric:'matches.goals'},{key:K.lmReplays,label:'Goal replays shown'}],
     'Exact counts from Nov 5 2026 (goals, replays and slots from Nov 6 2026); the section below has every format.')}
    {tab==='matches'&&<div className={dd.mx} data-metric="matches.section"><LiveMatchesSection report={report} rangeText={rangeText} dayLabel={k=>dayLabel(k,false)}/></div>}
    {tab==='fishing'&&strip('Fishing trends',[{key:'fishing.funnel_sessions.start',label:'Sessions that tapped Fish'},{key:'fishing.funnel_sessions.land',label:'Sessions that landed a fish'},{key:K.fishLanded,label:'Fish landed'},{key:'time.where_time_goes.fishing',label:'Fishing minutes'}],
     'The funnel counters started Nov 6 2026; fish landed and fishing minutes go back further.')}
    {tab==='fishing'&&<div className={dd.mx} data-metric="engagement.fishing"><FishingSection report={report}/></div>}
    {tab==='marketing'&&strip('Marketing trends',[{key:K.tourViews,label:'Tour page views (/)'},{key:K.tourPlay,label:'Tour: sessions that tapped Play'},{key:'marketing.tour_avg_seconds',label:'Tour: time per view'},{key:K.investorVisits,label:'Investor page visits'},{key:K.investorAvg,label:'Investor page: average stay'}])}
    {tab==='marketing'&&<div className={dd.mx} data-metric="marketing.section"><span className={dd.mx} data-metric="marketing.visits"/><MarketingSection report={report} rangeText={rangeText} dayLabel={k=>dayLabel(k,false)}/></div>}
    {tab==='report'&&<div className={dd.mx} data-metric="report.weekly">
    {tab==='report'&&<SponsorReport week={week??isoWeekOf(tm?.today??report.to)} onWeek={setWeek}/>}
    </div>}
    {tab==='live'&&<section className={styles.island} aria-labelledby="sec-live" data-metric="live.on_now">
     <div className={styles.sectionHead}><h2 id="sec-live">Live now</h2><p>Who is playing right now, and each day’s players one by one (anonymous; the last 14 days).</p></div>
     <div className={so.liveGrid}>
      <button type="button" className={so.liveCard} aria-haspopup="dialog" onClick={()=>openPanel({mode:'live'})}><span>On now</span><b>{fmtInt(report.live)}</b><small>Tabs that sent anything in the last 5 minutes. Tap for each session.</small></button>
      <button type="button" className={so.liveCard} aria-haspopup="dialog" onClick={()=>openPanel({mode:'day',day:tm?.today??report.to})}><span>Today’s players</span><b>Today ›</b><small>Every session that started today, newest first.</small></button>
      <button type="button" className={so.liveCard} aria-haspopup="dialog" onClick={()=>openPanel({mode:'players',from:report.from,to:report.to})}><span>Players in this range</span><b>{playerCount===null?'Players':fmtInt(playerCount)} ›</b><small>One row per anonymous player; tap one for their sessions.</small></button>
     </div>
    </section>}

    {tab==='players'&&strip('Players trends',[{key:K.players,label:'Players per day'},...(dash?.people.status==='ok'?[{key:K.distinct,label:'Distinct players a day'},{key:K.returningShare,label:'Returning sessions'},{key:K.fresh,label:'New sessions'}]:[]),{key:K.sessions,label:'Sessions'},{key:K.mpp,label:'Minutes per player'},{key:K.avgSession,label:'Average session'},{key:K.bounce,label:'Bounce rate'}],
     dash&&dash.people.status!=='ok'?'Distinct players, returning and new sessions per day need the people function (docs/analytics-proposed/analytics_daily_people.sql, not run yet); they appear here by themselves once it exists.':'Distinct players, returning and new: raw rows, the last 14 days only.')}
    {tab==='players'&&<PlayersExplorer from={report.from} to={report.to} stamp={report.generatedAt} onSessions={pid=>openPanel({mode:'player',pid})} countryName={countryName}/>}
    {tab==='players'&&    <section className={styles.island} aria-labelledby="sec-headline">
     <div className={styles.sectionHead}><h2 id="sec-headline">Headline</h2>
      <p>Players, save codes and growth for {rangeText}, each compared with the same number of days just before. Save-code counts (active, returning, retention, stored) are as of today.</p></div>
     <div className={dd.mx} data-metric="players.headline"><HeadlineTiles report={report} onOpenDay={day=>openPanel({mode:'day',day})}/></div>
     <div className={dd.mx} data-metric="players.visitors_chart">
     <ChartCard wide title="Visitors, sessions and page views" subtitle={`${hourly?'By hour':'By day'} (${clock}${tm?.utcDays.length?'; * = a UTC day, frozen before Pacific time':''}). Visitors are unique per ${hourly?'hour':'day'}.`} empty={empty}
      table={{columns:[hourly?`Hour (${clock})`:'Day','Visitors','Sessions','Page views'],rows:report.series.map((p,i)=>[tipLabels[i],p.visitors,p.sessions,p.pageviews])}}>
      <ul className={styles.legend}>
       <li><i style={{'--key':'var(--s1)'} as CSSProperties}/>Visitors</li>
       <li><i style={{'--key':'var(--s2)'} as CSSProperties}/>Sessions</li>
       <li><i style={{'--key':'var(--s3)'} as CSSProperties}/>Page views</li>
      </ul>
      <LineChart labels={labels} tipLabels={tipLabels} values={values} ariaLabel={`Visitors, sessions and page views, ${rangeText}, ${clock}`}
       series={[{key:'visitors',label:'Visitors',color:'var(--s1)'},{key:'sessions',label:'Sessions',color:'var(--s2)'},{key:'pageviews',label:'Page views',color:'var(--s3)'}]}/>
     </ChartCard></div>
     <div className={styles.grid}>
      <div className={dd.mx} data-metric="players.weekly_codes"><WeeklyCodesCard d={sd} saves={report.saves}/></div>
      <div className={dd.mx} data-metric="players.retention"><RetentionCard d={sd} saves={report.saves}/></div>
     </div>
    </section>}

    {tab==='players'&&    <section className={styles.island} aria-labelledby="sec-engagement">
     <div className={styles.sectionHead}><h2 id="sec-engagement">Engagement</h2>
      <p>How long and how often they play, and which save codes keep coming back.</p></div>
     <div className={dd.mx} data-metric="engagement.tiles"><EngagementTiles report={report}/></div>
     <div className={styles.grid}>
      <div className={dd.mx} data-metric="engagement.coming_back"><ComingBackCard d={sd} saves={report.saves}/></div>
      <div className={dd.mx} data-metric="engagement.restores"><RestoresCard report={report}/></div>
      <div className={dd.mx} data-metric="engagement.time_on_site">
      <ChartCard wide title="Time on site" subtitle="Foreground time per session (hidden tabs and 10+ idle minutes don't count)" empty={empty}
       table={{columns:['Length','Sessions'],rows:report.distribution.map(b=>[b.label,b.sessions])}}>
       <div className={styles.lengthStats}><span>Median <b>{fmtDuration(t.medianMs)}</b></span><span>Average <b>{fmtDuration(t.avgMs)}</b></span><span>Bounce <b>{fmtPct(t.bounceRate)}</b></span></div>
       <Columns rows={report.distribution.map(b=>({label:b.label,value:b.sessions}))} unit="sessions"/>
      </ChartCard></div>
     </div>
    </section>}

    {tab==='players'&&    <section className={styles.island} aria-labelledby="sec-acquisition">
     <div className={styles.sectionHead}><h2 id="sec-acquisition">Acquisition</h2>
      <p>From the title screen to a code that comes back, and where visitors come from.</p></div>
     <div className={dd.mx} data-metric="players.new_player_funnel"><InvestorFunnel report={report}/></div>
     <div className={styles.grid}>
      <div className={dd.mx} data-metric="players.new_codes"><NewCodesCard d={sd} saves={report.saves}/></div>
      <div className={dd.mx} data-metric="players.sources"><ChartCard title="Where they come from" subtitle={`${vCol} by source`} empty={empty}
       table={{columns:['Source',vCol,'Sessions','Page views'],rows:sources.map(r=>[SOURCE_LABEL[r.key],r.visitors,r.sessions,r.pageviews])}}>
       <BarList rows={barsOf(sources,k=>SOURCE_LABEL[k]||k)} unit={vUnit}/>
      </ChartCard></div>
      <div className={dd.mx} data-metric="players.countries"><ChartCard title="Countries" subtitle={`${vCol} by country`} empty={empty} table={tableOf(d.country,countryName,vCol)}>
       <BarList rows={barsOf(d.country,countryName)} unit={vUnit}/>
      </ChartCard></div>
      <div className={dd.mx} data-metric="players.region"><RegionCard report={report} empty={empty} countryName={countryName}/></div>
      <div className={dd.mx} data-metric="players.referrers"><ChartCard title="Referring sites" subtitle={`${vCol} by referrer (host only)`} empty={empty||!d.referrer.length} table={tableOf(d.referrer,k=>k,vCol)}>
       <BarList rows={barsOf(d.referrer,k=>k)} unit={vUnit}/>
      </ChartCard></div>
      <div className={dd.mx} data-metric="players.campaigns"><ChartCard title="Campaigns" subtitle={`${vCol} by utm_campaign · source / medium`} empty={empty||!d.campaign.length} table={tableOf(d.campaign,k=>k,vCol)}>
       <BarList rows={barsOf(d.campaign,k=>k)} unit={vUnit}/>
      </ChartCard></div>
      <div className={dd.mx} data-metric="players.devices"><ChartCard title="Devices" subtitle={`${vCol} by device class`} empty={empty} table={tableOf(d.device,k=>DEVICE_LABEL[k]||k,vCol)}>
       <BarList rows={barsOf(d.device,k=>DEVICE_LABEL[k]||k)} unit={vUnit}/>
      </ChartCard></div>
      <div className={dd.mx} data-metric="players.entry"><ChartCard title="Entry pages" subtitle="Sessions by the page they started on" empty={empty} table={tableOf(d.entry,k=>PAGE_LABEL[k]||k)}>
       <BarList rows={barsOf(d.entry,k=>PAGE_LABEL[k]||k,'sessions')} unit="sessions"/>
      </ChartCard></div>
     </div>
     <div className={dd.mx} data-metric="players.sources_section"><SourcesSection report={report} countryName={countryName}/></div>
    </section>}

    {tab==='island'&&strip('Island and games trends',[{key:K.games,label:'Games played',metric:'overview.games'},{key:K.cards,label:'Cards found'},{key:K.emotes,label:'Emotes used',metric:'overview.emotes'},{key:K.social,label:'Minutes with friends'},{key:K.swims,label:'Swims'},{key:K.shirts,label:'T-shirts designed',metric:'overview.kit'},{key:'time.area_minutes.island',label:'Island minutes'},{key:'time.where_time_goes.arcade_games',label:'Arcade game minutes'}])}
    {tab==='island'&&    <section className={styles.island} aria-labelledby="sec-product">
     <div className={styles.sectionHead}><h2 id="sec-product">Product usage</h2>
      <p>Which parts of the game get used: places on the island (Coaches Board included), the arcade, the museum and the Football plan.</p></div>
     <div className={styles.grid}>
      <div className={dd.mx} data-metric="engagement.areas"><ChartCard title="Where they spend time" subtitle="Foreground minutes by area" empty={empty||!report.areas.length}
       table={{columns:['Area','Minutes','Share'],rows:report.areas.map(a=>[AREA_LABEL[a.area]||a.area,Math.round(a.ms/60000),areaTotal?fmtPct(a.ms/areaTotal):'0%'])}}>
       <BarList rows={report.areas.map(a=>({key:a.area,label:AREA_LABEL[a.area]||a.area,value:Math.round(a.ms/60000)}))} unit="minutes"/>
      </ChartCard></div>
      <div className={dd.mx} data-metric="engagement.plan"><PlanCard report={report}/></div>
     </div>
     <div className={dd.mx} data-metric="engagement.island"><IslandSection report={report}/></div>
     <div className={dd.mx} data-metric="engagement.summit_kit"><SummitKitSection report={report}/></div>
     <div className={dd.mx} data-metric="engagement.water"><WaterSection report={report}/></div>
     <div className={dd.mx} data-metric="engagement.friends"><FriendsSection report={report}/></div>
     <div className={dd.mx} data-metric="engagement.emotes"><EmoteSection report={report}/></div>
     <div className={dd.mx} data-metric="engagement.party_retention"><PartyRetentionCard from={report.from} to={report.to}/></div>
     <p className={styles.note}>Fishing has its own tab now (Fishing).</p>
    </section>}

    {tab==='players'&&    <section className={styles.island} aria-labelledby="sec-health" data-metric="players.save_health">
     <div className={styles.sectionHead}><h2 id="sec-health">Save health and operations</h2>
      <p>Rate limits, the breaker, the saving-break card, storage and the 12-month expiry pipeline.</p>
      {saves&&<p className={styles.note} data-save-status>{saves}</p>}</div>
     <SaveMetricsBanner saves={report.saves}/>
     <div className={styles.grid}>
      <SaveHealthCard report={report}/>
      <SaveStorageCard d={sd} saves={report.saves}/>
     </div>
    </section>}

    {tab==='players'&&    <section className={styles.island} aria-labelledby="sec-onboarding" data-metric="engagement.start">
     <div className={styles.sectionHead}><h2 id="sec-onboarding">Onboarding detail</h2>
      <p>The full title-screen breakdown: every funnel, For grown-ups, donations and privacy.</p></div>
     <StartSection report={report} countryName={countryName}/>
    </section>}

    {tab==='learning'&&strip('Learning trends',[{key:'learning.stage_total.lo',label:'Lessons opened'},{key:'learning.stage_total.le',label:'Lessons watched to the end'},{key:K.quizzes,label:'Quizzes taken',metric:'overview.quizzes'},{key:K.firstRight,label:'First-try answers right'},{key:K.watched,label:'Videos & stories',metric:'overview.watched'},{key:'time.where_time_goes.learning',label:'Learning minutes'},{key:'learning.stage_total.lf',label:'Quizzes finished'},{key:K.firstTries,label:'First-try answers'}])}
    {tab==='learning'&&    <section className={styles.island} aria-labelledby="sec-detail" data-metric="engagement.learning">
     <div className={styles.sectionHead}><h2 id="sec-detail">Learning detail</h2>
      <p>Lesson funnels, question analysis and settings.</p></div>
     <LearningSection report={report}/>
    </section>}
   </div>
  </div>
  <LivePanel view={panel} onClose={closeLive} countryName={countryName}/>
 </main>;
}
