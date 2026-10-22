'use client';
/**
 * The admin slide-out (Oct 15 2026: "On now"; Oct 16 2026: day, players and player views). One component, four views:
 *  - live    ("N on now" tile; user: "on click 3 on now, opens slide out to show all that info"): polls /api/admin/live every
 *            10 s while open AND the tab is visible; stops when closed, hidden or on another view.
 *  - day     (the "Players today" tile; user, Oct 16: "for players today, can we have that be clickable and into more detail and
 *            list each user. same as the on now"): every session that started on one Pacific day, with a ‹ › day stepper over
 *            the 14 kept days and a small filter row. /api/admin/day-sessions, loaded once per day (no polling).
 *  - players (the "Players" tile; user: "i basically want to know by individual level"): one row per anonymous player in the
 *            range, searchable by id, sortable. /api/admin/players.
 *  - player  (a "player #a1b2c3" link on any session card or players row): that player's totals and session history.
 *            /api/admin/player. Back returns to the view it came from.
 * Slides in from the right (full width on a phone). Closes with the shared Done control (top right, the island's rule), a swipe
 * down from the top of its list, or Escape. Data: lib/analytics/live.ts + day.ts (supabase/migrations/20261018_analytics_live.sql,
 * 20261019_analytics_day_sessions.sql); anonymous sessions and players only. The page's pull-to-refresh ignores touches inside the
 * panel (data-pull-ignore), so the two never fight.
 */
import {useCallback,useEffect,useMemo,useRef,useState,type TouchEvent as ReactTouchEvent} from 'react';
import {BackButton} from '@/components/BackButton';
import {DoneButton} from '@/components/DoneButton';
import {LIVE_COUNT_KEYS,LIVE_COUNT_LABEL,LIVE_MIGRATION,LIVE_OK_ROW,LIVE_WINDOWS,flagOf,fmtAgo,fmtSpent,sessionSource,sourceLabel,spotIcon,spotLabel,timeLine,
 type CountryTally,type LiveReport,type LiveRow,type LiveStatus,type LiveWindow,type Tally} from '@/lib/analytics/live';
import {DAY_MIGRATION,DAY_OK_ROW,RAW_DAYS,addDays,clockPT,dateClockPT,pacificDay,shortDay,
 type AreaTally,type DayReport,type PlayerReport,type PlayerRow,type PlayersReport,type RowTotals} from '@/lib/analytics/day';
import type {RelayStatsReport} from '@/lib/analytics/relayStatsTypes';
import styles from './LivePanel.module.css';

export type PanelView={mode:'live'}|{mode:'day';day:string}|{mode:'players';from:string;to:string}|{mode:'player';pid:string};
const POLL_MS=10_000,SWIPE_CLOSE_PX=90;
const DEVICE:Record<string,string>={phone:'📱 phone',tablet:'📱 tablet',desktop:'💻 desktop'};
const deviceLabel=(d:string)=>DEVICE[d]??d;
const viewKey=(v:PanelView)=>v.mode==='live'?'live':v.mode==='day'?'day:'+v.day:v.mode==='players'?`players:${v.from}:${v.to}`:'player:'+v.pid;
const viewUrl=(v:PanelView)=>v.mode==='day'?`/api/admin/day-sessions?day=${v.day}`:v.mode==='players'?`/api/admin/players?from=${v.from}&to=${v.to}`:v.mode==='player'?`/api/admin/player?pid=${v.pid}`:'';

function Strip({label,items}:{label:string;items:{key:string;text:string;sub?:string}[]}){
 return <div className={styles.strip} role="group" aria-label={label}>
  <span className={styles.stripLabel}>{label}</span>
  <ul>{items.length?items.map(i=><li key={i.key}><b>{i.text}</b>{i.sub&&<small>{i.sub}</small>}</li>):<li className={styles.none}>—</li>}</ul>
 </div>;
}
const countryItems=(cc:CountryTally[])=>cc.map(c=>({key:c.country,text:`${flagOf(c.country)} ${c.country==='(unknown)'?'unknown':c.country} ${c.n}`,
 sub:c.regions.length?c.regions.map(r=>`${r.name} ${r.n??''}`.trim()).join(', '):undefined}));
const areaItems=(a:AreaTally[])=>a.map(x=>({key:x.key,text:`${spotIcon(x.key)} ${spotLabel(x.key)}${x.n!==null?` ${x.n}`:''}`.trim(),sub:fmtSpent(x.seconds)}));
const tallyItems=(t:Tally[],label:(k:string)=>string=k=>k)=>t.map(x=>({key:x.key,text:`${label(x.key)} ${x.n}`}));
/** The strips every non-live view shares (a day, a player). */
function TotalsStrips({t}:{t:RowTotals}){
 return <>
  <Strip label="Where they went" items={areaItems(t.byArea)}/>
  <Strip label="Country" items={countryItems(t.byCountry)}/>
  <Strip label="Source" items={tallyItems(t.bySource,sourceLabel)}/>
  <Strip label="New / back" items={t.returning?[{key:'n',text:`New ${t.returning.new}`},{key:'r',text:`Returning ${t.returning.returning}`},...(t.returning.unknown?[{key:'u',text:`Not said ${t.returning.unknown}`}]:[])]:[]}/>
  <Strip label="Code" items={t.code?[{key:'w',text:`Save code ${t.code.with}`},{key:'o',text:`No code ${t.code.without}`},...(t.code.unknown?[{key:'u',text:`Not said ${t.code.unknown}`}]:[])]:[]}/>
  <Strip label="Devices" items={tallyItems(t.byDevice,deviceLabel)}/>
 </>;
}

function PlayerLink({pid,onPlayer}:{pid:string|null;onPlayer?:(pid:string)=>void}){
 if(!pid||!onPlayer)return null;
 return <button type="button" className={styles.playerLink} onClick={()=>onPlayer(pid)} title="Open this player (an anonymous id, not a name)" data-pid={pid}>player #{pid.slice(0,6)}</button>;
}

function SessionCard({r,now,countryName,clock,onPlayer}:{r:LiveRow;now:number;countryName:(c:string)=>string;clock:'ago'|'time'|'date';onPlayer?:(pid:string)=>void}){
 const chips=LIVE_COUNT_KEYS.filter(k=>r.counts[k]>0);
 const where=r.country?`${flagOf(r.country)} ${countryName(r.country)}${r.regionName?` · ${r.regionName}`:''}`:'Location unknown';
 const line=timeLine(r);
 const at=(iso:string)=>clock==='ago'?fmtAgo(iso,now):clock==='date'?dateClockPT(iso):clockPT(iso);
 return <li className={styles.card} data-sid={r.sid}>
  <div className={styles.cardTop}>
   <code className={styles.sid} title="Anonymous session (a salted hash, not an id)">#{r.sid}</code>
   <span className={styles.badges}>
    {r.returning!==null&&<span className={styles.badge} data-kind={r.returning?'returning':'new'}>{r.returning?'Returning':'New'}</span>}
    {r.hasCode!==null&&<span className={styles.badge} data-kind={r.hasCode?'code':'nocode'}>{r.hasCode?'Save code':'No code'}</span>}
   </span>
   <span className={styles.spent} title="Foreground time this session (hidden tabs and idle time do not count)">{fmtSpent(r.secondsActive)}</span>
  </div>
  {clock==='ago'?<p className={styles.now}><span aria-hidden="true">{spotIcon(r.spot)}</span> <b>{spotLabel(r.spot)}</b>{r.previousArea&&<small> · before: {spotLabel(r.previousArea)}</small>}</p>
   :<p className={styles.now}><span aria-hidden="true">{spotIcon(r.spot)}</span> <small>last in</small> <b>{spotLabel(r.spot)}</b></p>}
  {line&&<p className={styles.timeLine}>{line}</p>}
  <dl className={styles.facts}>
   <div><dt>Started</dt><dd>{at(r.startedAt)}</dd></div>
   <div><dt>{clock==='ago'?'Last seen':'Ended (last seen)'}</dt><dd>{at(r.lastSeen)}</dd></div>
   <div><dt>Device</dt><dd>{deviceLabel(r.device)}</dd></div>
   <div><dt>From</dt><dd>{sourceLabel(sessionSource(r))}</dd></div>
   <div className={styles.wide}><dt>Where</dt><dd>{where}</dd></div>
   {r.deviceTodaySessions>1&&<div className={styles.wide}><dt>Same device that day</dt><dd>{fmtSpent(r.deviceTodaySeconds)} over {r.deviceTodaySessions} sessions</dd></div>}
  </dl>
  {chips.length>0&&<ul className={styles.chips} aria-label="This session">{chips.map(k=><li key={k}>{r.counts[k]} {LIVE_COUNT_LABEL[k][r.counts[k]===1?0:1]}</li>)}</ul>}
  {onPlayer&&r.pid&&<div className={styles.cardFoot}><PlayerLink pid={r.pid} onPlayer={onPlayer}/></div>}
 </li>;
}

function Warn({status,live}:{status:LiveStatus|undefined;live:boolean}){
 if(status==='needs-migration')return <p className={styles.warn} role="status">{live?'Live sessions':'This view'} need{live?'':'s'} one database update. In the Supabase SQL editor, paste the whole of <code>{live?LIVE_MIGRATION:DAY_MIGRATION}</code> and run it; its last row must read <code>{live?LIVE_OK_ROW:DAY_OK_ROW}</code>.</p>;
 if(status==='not-configured')return <p className={styles.warn} role="status">The analytics database is not configured on this server.</p>;
 if(status==='error')return <p className={styles.error} role="alert">Could not load this. Try again in a moment.</p>;
 return null;
}

/** Day mode: the filter row (country, source, code, device), all client side over the day's rows. */
type Filters={country:string;source:string;code:string;device:string};
const NO_FILTER:Filters={country:'',source:'',code:'',device:''};
function DayView({data,countryName,onPlayer,step}:{data:DayReport;countryName:(c:string)=>string;onPlayer:(pid:string)=>void;step:(n:number)=>void}){
 const [f,setF]=useState<Filters>(NO_FILTER);
 useEffect(()=>setF(NO_FILTER),[data.day]);
 const opts=useMemo(()=>{const u=(xs:(string|null)[])=>[...new Set(xs.filter((x):x is string=>!!x))].sort();
  return {country:u(data.rows.map(r=>r.country||'(unknown)')),source:u(data.rows.map(sessionSource)),device:u(data.rows.map(r=>r.device))};},[data.rows]);
 const rows=data.rows.filter(r=>(!f.country||(r.country||'(unknown)')===f.country)&&(!f.source||sessionSource(r)===f.source)&&(!f.device||r.device===f.device)
  &&(!f.code||(f.code==='yes'?r.hasCode===true:r.hasCode!==true)));
 const set=(k:keyof Filters)=>(e:{target:{value:string}})=>setF(p=>({...p,[k]:e.target.value}));
 const today=pacificDay(),oldest=addDays(today,-RAW_DAYS);
 return <>
  <div className={styles.windows} role="group" aria-label="Day">
   <button type="button" onClick={()=>step(-1)} disabled={data.day<=oldest} aria-label="Previous day">‹</button>
   <b className={styles.dayName}>{data.day===today?'Today':shortDay(data.day)}</b>
   <button type="button" onClick={()=>step(1)} disabled={data.day>=today} aria-label="Next day">›</button>
   <span className={styles.note}>{data.sessions} sessions{data.players!==null?` · ${data.players} players`:''} · {fmtSpent(data.seconds)}</span>
  </div>
  {data.partial&&<p className={styles.warn} role="status">Sessions are kept {RAW_DAYS} days, so this day only has its totals left{data.tz==='UTC'?' (a UTC day)':''}: no list of sessions, no new/returning or code split.</p>}
  <TotalsStrips t={data}/>
  {data.rows.length>0&&<div className={styles.filters} role="group" aria-label="Filter sessions">
   <select value={f.country} onChange={set('country')} aria-label="Country"><option value="">All countries</option>{opts.country.map(c=><option key={c} value={c}>{c==='(unknown)'?'unknown':`${flagOf(c)} ${countryName(c)}`}</option>)}</select>
   <select value={f.source} onChange={set('source')} aria-label="Source"><option value="">All sources</option>{opts.source.map(s=><option key={s} value={s}>{sourceLabel(s)}</option>)}</select>
   <select value={f.code} onChange={set('code')} aria-label="Save code"><option value="">Code or not</option><option value="yes">Save code</option><option value="no">No code</option></select>
   <select value={f.device} onChange={set('device')} aria-label="Device"><option value="">All devices</option>{opts.device.map(d=><option key={d} value={d}>{deviceLabel(d)}</option>)}</select>
  </div>}
  {rows.length?<ul className={styles.cards}>{rows.map(r=><SessionCard key={r.sid+r.startedAt} r={r} now={0} countryName={countryName} clock="time" onPlayer={onPlayer}/>)}</ul>
   :!data.partial&&<p className={styles.empty}>{data.rows.length?'No session matches these filters.':'Nobody played this day.'}</p>}
  {data.truncated&&<p className={styles.foot}>Showing the newest {data.rows.length} of {data.sessions} sessions.</p>}
  <p className={styles.foot}>Anonymous sessions that started this day (midnight to midnight, Pacific time), newest first; times are Pacific. Time is foreground time. A player is a save code, or one device without a code.</p>
 </>;
}

type Sort='last'|'time'|'sessions';
function PlayersView({data,onPlayer}:{data:PlayersReport;onPlayer:(pid:string)=>void}){
 const [q,setQ]=useState(''),[sort,setSort]=useState<Sort>('last');
 const term=q.trim().toLowerCase().replace(/^#/,'');
 const rows=data.rows.filter(p=>!term||p.pid.startsWith(term)).sort((a,b)=>sort==='time'?b.seconds-a.seconds:sort==='sessions'?b.sessions-a.sessions:b.lastSeen.localeCompare(a.lastSeen));
 return <>
  <div className={styles.windows} role="group" aria-label="Sort">
   {([['last','Last seen'],['time','Time'],['sessions','Sessions']] as const).map(([k,l])=><button key={k} type="button" aria-pressed={sort===k} onClick={()=>setSort(k)}>{l}</button>)}
  </div>
  <input className={styles.search} type="search" inputMode="text" autoComplete="off" spellCheck={false} placeholder="Find a player id (e.g. a1b2)" value={q} onChange={e=>setQ(e.target.value)} aria-label="Find a player by id"/>
  {data.partial&&<p className={styles.warn} role="status">Sessions are kept {RAW_DAYS} days: players from before {shortDay(data.oldestDay)} are not listed.</p>}
  {rows.length?<ul className={styles.cards}>{rows.map(p=><PlayerCard key={p.pid} p={p} onPlayer={onPlayer}/>)}</ul>:<p className={styles.empty}>{data.rows.length?'No player id starts with that.':'No players in this range.'}</p>}
  <p className={styles.foot}>{data.players} players over {data.sessions} sessions{data.unattributed?` (${data.unattributed} sessions from older tabs have no player id)`:''}. A player is a save code (on every device that uses it), or one device without a code; ids are anonymous numbers, never a name.</p>
 </>;
}
function PlayerCard({p,onPlayer}:{p:PlayerRow;onPlayer:(pid:string)=>void}){
 const chips=LIVE_COUNT_KEYS.filter(k=>p.counts[k]>0);
 return <li className={styles.card} data-pid={p.pid}>
  <button type="button" className={styles.cardButton} onClick={()=>onPlayer(p.pid)} aria-label={`Open player ${p.pid.slice(0,6)}`}>
   <div className={styles.cardTop}>
    <code className={styles.sid}>player #{p.pid.slice(0,6)}</code>
    <span className={styles.badges}>
     {p.returning!==null&&<span className={styles.badge} data-kind={p.returning?'returning':'new'}>{p.returning?'Returning':'New'}</span>}
     {p.hasCode!==null&&<span className={styles.badge} data-kind={p.hasCode?'code':'nocode'}>{p.hasCode?'Save code':'No code'}</span>}
    </span>
    <span className={styles.spent}>{fmtSpent(p.seconds)}</span>
   </div>
   <p className={styles.timeLine}>{p.sessions} session{p.sessions===1?'':'s'} · {p.daysPlayed} day{p.daysPlayed===1?'':'s'} · last seen {dateClockPT(p.lastSeen)}</p>
   {p.areas.length>0&&<p className={styles.timeLine}>{p.areas.map(a=>`${spotLabel(a.key)} ${fmtSpent(a.seconds)}`).join(' · ')}</p>}
   <p className={styles.timeLine}>{[p.devices.map(deviceLabel).join(', '),p.countries.map(c=>`${flagOf(c)} ${c}`).join(' '),p.sources.map(sourceLabel).join(', ')].filter(Boolean).join(' · ')}</p>
   {chips.length>0&&<ul className={styles.chips}>{chips.map(k=><li key={k}>{p.counts[k]} {LIVE_COUNT_LABEL[k][p.counts[k]===1?0:1]}</li>)}</ul>}
  </button>
 </li>;
}
function PlayerView({data,countryName}:{data:PlayerReport;countryName:(c:string)=>string}){
 if(!data.pid)return <p className={styles.empty}>No sessions for this player in the last {RAW_DAYS} days.</p>;
 return <>
  <dl className={`${styles.facts} ${styles.summary}`}>
   <div><dt>First seen{data.partial?' (kept rows)':''}</dt><dd>{dateClockPT(data.firstSeen)}</dd></div>
   <div><dt>Last seen</dt><dd>{dateClockPT(data.lastSeen)}</dd></div>
   <div><dt>Days played</dt><dd>{data.daysPlayed}</dd></div>
   <div><dt>Sessions</dt><dd>{data.sessions}</dd></div>
   <div><dt>Total time</dt><dd>{fmtSpent(data.seconds)}</dd></div>
   <div><dt>Save code</dt><dd>{data.code&&data.code.with>0?'Yes':'No'}</dd></div>
  </dl>
  {data.partial&&<p className={styles.warn} role="status">Sessions are kept {RAW_DAYS} days: this player may have played before {shortDay(data.oldestDay)}.</p>}
  <TotalsStrips t={data}/>
  <ul className={styles.cards}>{data.rows.map(r=><SessionCard key={r.sid+r.startedAt} r={r} now={0} countryName={countryName} clock="date"/>)}</ul>
  {data.truncated&&<p className={styles.foot}>Showing the newest {data.rows.length} of {data.sessions} sessions.</p>}
  <p className={styles.foot}>One anonymous player: a save code, or one device without a code. Times are Pacific; time is foreground time.</p>
 </>;
}

type Loaded={key:string;data:DayReport|PlayersReport|PlayerReport|null;error:boolean};

export default function LivePanel({view,onClose,countryName}:{view:PanelView|null;onClose:()=>void;countryName:(c:string)=>string}){
 const open=view!==null;
 const [stack,setStack]=useState<PanelView[]>(view?[view]:[]);
 const [minutes,setMinutes]=useState<LiveWindow>(5),[data,setData]=useState<LiveReport|null>(null),[error,setError]=useState(''),[now,setNow]=useState(()=>Date.now());
 const [loaded,setLoaded]=useState<Loaded|null>(null);
 const [drag,setDrag]=useState(0);
 const body=useRef<HTMLDivElement>(null),done=useRef<HTMLButtonElement>(null),startY=useRef<number|null>(null),seq=useRef(0),vseq=useRef(0);
 // A new open (or a different tile) starts a fresh stack.
 useEffect(()=>{if(view)setStack([view]);},[view]);
 const cur=stack[stack.length-1]??view??{mode:'live'} as PanelView;
 const isLive=open&&cur.mode==='live';
 const push=useCallback((v:PanelView)=>{setStack(s=>[...s,v]);body.current?.scrollTo({top:0});},[]);
 const back=useCallback(()=>{setStack(s=>s.length>1?s.slice(0,-1):s);},[]);
 const replace=useCallback((v:PanelView)=>setStack(s=>[...s.slice(0,-1),v]),[]);
 const openPlayer=useCallback((pid:string)=>push({mode:'player',pid}),[push]);

 const load=useCallback(async(m:number)=>{
  const id=++seq.current;
  try{
   const res=await fetch(`/api/admin/live?minutes=${m}`,{cache:'no-store'});
   if(!res.ok)throw new Error(String(res.status));
   const next=await res.json() as LiveReport;
   if(id===seq.current){setData(next);setError('');setNow(Date.now());}
  }catch{if(id===seq.current)setError('Could not load live sessions. Trying again in a moment.');}
 },[]);

 // Live: poll while open, on the live view and visible; a hidden tab holds no timer.
 useEffect(()=>{
  if(!isLive)return;
  let timer:ReturnType<typeof setInterval>|null=null;
  const arm=()=>{if(timer||document.visibilityState!=='visible')return;void load(minutes);timer=setInterval(()=>void load(minutes),POLL_MS);};
  const disarm=()=>{if(timer){clearInterval(timer);timer=null;}};
  const vis=()=>document.visibilityState==='visible'?arm():disarm();
  arm();document.addEventListener('visibilitychange',vis);
  return()=>{disarm();document.removeEventListener('visibilitychange',vis);};
 },[isLive,minutes,load]);
 // "Parties now" (Oct 22 2026, Phase B): the relay's live gauge via /api/admin/party-stats (cached 60 s on the server), refreshed
 // once a minute while the live view is open and visible. Nothing when the relay's stats are not configured.
 const [parties,setParties]=useState<RelayStatsReport|null>(null);
 useEffect(()=>{
  if(!isLive)return;let gone=false;
  const get=()=>{if(document.visibilityState!=='visible')return;const d=pacificDay();fetch(`/api/admin/party-stats?from=${d}&to=${d}`,{cache:'no-store'}).then(r=>r.ok?r.json():null).then(j=>{if(!gone&&j&&j.status)setParties(j as RelayStatsReport);}).catch(()=>{});};
  get();const t=setInterval(get,60_000);return()=>{gone=true;clearInterval(t);};
 },[isLive]);
 // "3 min ago" keeps moving between polls (a 1 s tick only while the live view is open and visible).
 useEffect(()=>{if(!isLive)return;const t=setInterval(()=>{if(document.visibilityState==='visible')setNow(Date.now());},1000);return()=>clearInterval(t);},[isLive]);
 // Day / players / player: one load per view (the server caches 30 s); no polling.
 const key=open?viewKey(cur):'';
 useEffect(()=>{
  if(!open||cur.mode==='live')return;
  const id=++vseq.current,url=viewUrl(cur);
  setLoaded(l=>l&&l.key===key?l:{key,data:null,error:false});
  (async()=>{
   try{const res=await fetch(url,{cache:'no-store'});if(!res.ok)throw new Error(String(res.status));const j=await res.json();if(id===vseq.current)setLoaded({key,data:j,error:false});}
   catch{if(id===vseq.current)setLoaded({key,data:null,error:true});}
  })();
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[open,key]);
 useEffect(()=>{
  if(!open)return;
  const k=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();onClose();}};
  document.addEventListener('keydown',k);
  const raf=requestAnimationFrame(()=>done.current?.focus({preventScroll:true}));
  return()=>{document.removeEventListener('keydown',k);cancelAnimationFrame(raf);};
 },[open,onClose]);
 useEffect(()=>{if(!open)setDrag(0);},[open]);

 // Swipe down from the top of the list (or the header) closes it.
 const onTouchStart=(e:ReactTouchEvent)=>{startY.current=(body.current?.scrollTop??0)<=0&&e.touches.length===1?e.touches[0].clientY:null;};
 const onTouchMove=(e:ReactTouchEvent)=>{if(startY.current===null)return;const dy=e.touches[0].clientY-startY.current;if(dy<=0||(body.current?.scrollTop??0)>0){setDrag(0);if(dy<0)startY.current=null;return;}setDrag(Math.min(dy*0.6,160));};
 const onTouchEnd=()=>{if(startY.current!==null&&drag>=SWIPE_CLOSE_PX*0.6)onClose();startY.current=null;setDrag(0);};

 const rows=data?.rows??[],cc=data?.byCountry??[];
 const status=data?.status;
 const got=loaded&&loaded.key===key?loaded:null,vd=got?.data as (DayReport|PlayersReport|PlayerReport|null|undefined);
 const vStatus=vd?.status;
 const title=cur.mode==='live'?'On now':cur.mode==='day'?`Players · ${cur.day===pacificDay()?'today':shortDay(cur.day)}`:cur.mode==='players'?'Players':`Player #${cur.pid.slice(0,6)}`;
 const count=cur.mode==='live'?(data?status==='ok'?data.sessions:'—':'…'):vd&&vStatus==='ok'?(cur.mode==='players'?(vd as PlayersReport).players:cur.mode==='day'?(vd as DayReport).sessions:''):got?'—':'…';
 return <div className={styles.root} data-mode={cur.mode} data-open={open} aria-hidden={!open} data-pull-ignore>
  <div className={styles.scrim} onClick={onClose}/>
  <section className={styles.panel} role="dialog" aria-modal="true" aria-labelledby="live-title" style={drag?{transform:`translateY(${drag}px)`,transition:'none'}:undefined}
   onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} onTouchCancel={onTouchEnd}>
   <header className={styles.head}>
    {open&&stack.length>1&&<BackButton key={stack.length} onBack={back}/>}
    <h2 id="live-title">{cur.mode==='live'&&<i className={styles.dot} aria-hidden="true"/>}{title} <span className={styles.count}>{count}</span></h2>
    {open&&<DoneButton ref={done} onDone={onClose}/>}
   </header>
   <div className={styles.body} ref={body}>
    {cur.mode==='live'&&<>
     <div className={styles.windows} role="group" aria-label="Window">
      {LIVE_WINDOWS.map(w=><button key={w} type="button" aria-pressed={minutes===w} onClick={()=>{setMinutes(w);}}>{w} min</button>)}
      <span className={styles.note}>{data?.status==='ok'?`updated ${fmtAgo(data.generatedAt,now)}`:''}</span>
     </div>
     {error&&<p className={styles.error} role="alert">{error}</p>}
     <PartiesNow data={parties}/>
     {status!=='ok'&&<Warn status={status} live/>}
     {status==='ok'&&<>
      <Strip label="Where" items={(data!.byArea).map(a=>({key:a.key,text:`${spotIcon(a.key)} ${spotLabel(a.key)} ${a.n}`}))}/>
      <Strip label="Country" items={countryItems(cc)}/>
      <Strip label="Source" items={tallyItems(data!.bySource,sourceLabel)}/>
      {rows.length?<ul className={styles.cards}>{rows.map(r=><SessionCard key={r.sid+r.startedAt} r={r} now={now} countryName={countryName} clock="ago" onPlayer={openPlayer}/>)}</ul>
       :<p className={styles.empty}>Nobody right now.</p>}
      <p className={styles.foot}>Anonymous sessions with anything sent in the last {data!.minutes} min. Time is foreground time; a tab reports every few minutes and when it is hidden, so the newest minutes arrive late. Location is the country and region a device connects from, never a city or an address.</p>
     </>}
     {!data&&!error&&<p className={styles.empty}>Loading…</p>}
    </>}
    {cur.mode!=='live'&&<>
     {got?.error&&<p className={styles.error} role="alert">Could not load this. Try again in a moment.</p>}
     {vd&&vStatus!=='ok'&&<Warn status={vStatus} live={false}/>}
     {vd&&vStatus==='ok'&&cur.mode==='day'&&<DayView data={vd as DayReport} countryName={countryName} onPlayer={openPlayer} step={n=>replace({mode:'day',day:addDays(cur.day,n)})}/>}
     {vd&&vStatus==='ok'&&cur.mode==='players'&&<PlayersView data={vd as PlayersReport} onPlayer={openPlayer}/>}
     {vd&&vStatus==='ok'&&cur.mode==='player'&&<PlayerView data={vd as PlayerReport} countryName={countryName}/>}
     {!got?.data&&!got?.error&&<p className={styles.empty}>Loading…</p>}
    </>}
   </div>
  </section>
 </div>;
}

/** "Parties now": live parties and players in parties from the relay's gauge (Phase B); a quiet note when it is not configured. */
export function PartiesNow({data}:{data:RelayStatsReport|null}){
 if(!data)return null;
 if(data.status!=='ok'||!data.live)return <p className={styles.foot} data-parties-now={data.status}>Parties now: {data.status==='not-configured'?'relay stats not configured':'not available'}.</p>;
 return <dl className={`${styles.facts} ${styles.summary}`} data-parties-now="ok">
  <div><dt>Parties now</dt><dd>{data.live.parties}</dd></div>
  <div><dt>Players in parties</dt><dd>{data.live.players}</dd></div>
  {data.totals&&<div><dt>Peak today (relay)</dt><dd>{data.totals.peakParties} parties · {data.totals.peakPlayers} players</dd></div>}
 </dl>;
}
