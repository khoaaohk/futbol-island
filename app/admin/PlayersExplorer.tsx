'use client';
/**
 * Player drill-in (Nov 6 2026; owner: "I want to drill into each player as well"). The Players list (sortable, filterable,
 * searchable by anonymous id prefix, like the Oct 16 players slide-out) and one player's detail: timeline, minutes by area,
 * returning pattern, progress, device class and country / region. Reads the existing /api/admin/players and /api/admin/player
 * (lib/analytics/dayAdmin.ts → analytics_players / analytics_player_sessions, the Oct 16 privacy rules: an anonymous 12-hex id,
 * never a code, name, IP or user agent). Raw rows are kept 14 days, so a player's history here is the last 14 days only.
 * "Every session" opens the Oct 16 slide-out (LivePanel.tsx, player mode) with each session to the second.
 */
import {useEffect,useMemo,useState} from 'react';
import type {PlayerReport,PlayersReport,PlayerRow} from '@/lib/analytics/day';
import {RAW_DAYS,addDays,dateClockPT,fmtClock,pacificDay,shortDay} from '@/lib/analytics/day';
import {LIVE_COUNT_KEYS,LIVE_COUNT_LABEL} from '@/lib/analytics/live';
import {fmtDay} from '@/lib/analytics/dashboard';
import {BarList} from './charts';
import {TrendChart,dayX} from './DashCharts';
import styles from './admin.module.css';
import d from './dash.module.css';

type Sort='last'|'first'|'minutes'|'sessions'|'days';
const SORTS:[Sort,string][]=[['last','Last seen'],['minutes','Minutes'],['sessions','Sessions'],['days','Days'],['first','First seen']];
const DEVICE:Record<string,string>={phone:'Phone',tablet:'Tablet',desktop:'Desktop'};
const mins=(s:number)=>Math.round(s/6)/10;
const STATUS_TEXT:Record<string,string>={'not-configured':'Not available here: the players list reads the analytics database (Supabase).','needs-migration':'Needs supabase/migrations/20261019_analytics_day_sessions.sql.',error:'Could not load the players just now. Try Refresh.'};

/** Pure (tests): the list after the filters and the sort. */
export function filterPlayers(rows:PlayerRow[],{q,ret,cohort,sort,from}:{q:string;ret:'all'|'returning'|'new';cohort:'all'|'new'|'before';sort:Sort;from:string}):PlayerRow[]{
 const term=q.trim().toLowerCase().replace(/^#/,'').replace(/^player\s*#?/,'');
 const firstDay=(p:PlayerRow)=>p.firstSeen?pacificDay(Date.parse(p.firstSeen)):'';
 return rows.filter(p=>(!term||p.pid.startsWith(term))&&(ret==='all'||(ret==='returning'?p.returning===true:p.returning===false))
  &&(cohort==='all'||(cohort==='new'?firstDay(p)>=from:firstDay(p)<from)))
  .sort((a,b)=>sort==='minutes'?b.seconds-a.seconds:sort==='sessions'?b.sessions-a.sessions:sort==='days'?b.daysPlayed-a.daysPlayed:sort==='first'?a.firstSeen.localeCompare(b.firstSeen):b.lastSeen.localeCompare(a.lastSeen)||a.pid.localeCompare(b.pid));
}

export default function PlayersExplorer({from,to,stamp,onSessions,countryName}:{from:string;to:string;stamp:string;onSessions:(pid:string)=>void;countryName:(c:string)=>string}){
 const [list,setList]=useState<PlayersReport|null>(null),[err,setErr]=useState(false);
 const [q,setQ]=useState(''),[ret,setRet]=useState<'all'|'returning'|'new'>('all'),[cohort,setCohort]=useState<'all'|'new'|'before'>('all'),[sort,setSort]=useState<Sort>('last');
 const [pid,setPid]=useState<string|null>(null),[limit,setLimit]=useState(25);
 useEffect(()=>{let gone=false;setList(null);setErr(false);
  fetch(`/api/admin/players?from=${from}&to=${to}`,{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject()).then(j=>{if(!gone)setList(j as PlayersReport);}).catch(()=>{if(!gone)setErr(true);});
  return()=>{gone=true;};},[from,to,stamp]);
 const rows=useMemo(()=>list?.status==='ok'?filterPlayers(list.rows,{q,ret,cohort,sort,from}):[],[list,q,ret,cohort,sort,from]);
 useEffect(()=>{setLimit(25);},[q,ret,cohort,sort]);
 return <section className={styles.island} aria-labelledby="sec-players-list" data-metric="players.list">
  <div className={styles.sectionHead}><h2 id="sec-players-list">Players</h2>
   <p>One row per anonymous player in this range (a save code on every device that uses it, or one device without a code). Tap a player for their timeline. Raw rows are kept {RAW_DAYS} days, so only the last {RAW_DAYS} days have players.</p></div>
  <div className={styles.card}>
   {!list&&!err&&<p className={styles.note} aria-busy="true">Loading players…</p>}
   {err&&<p className={d.state} role="alert">Could not load the players. Try Refresh.</p>}
   {list&&list.status!=='ok'&&<p className={d.state}>{STATUS_TEXT[list.status]??'Not available.'}</p>}
   {list?.status==='ok'&&<>
    <div className={d.pControls} role="group" aria-label="Find and sort players">
     <input className={d.search} type="search" inputMode="text" autoComplete="off" spellCheck={false} placeholder="Player id (e.g. a1b2)" value={q} onChange={e=>setQ(e.target.value)} aria-label="Find a player by id"/>
     <select className={d.select} value={sort} onChange={e=>setSort(e.target.value as Sort)} aria-label="Sort by">{SORTS.map(([k,l])=><option key={k} value={k}>Sort: {l}</option>)}</select>
     <select className={d.select} value={ret} onChange={e=>setRet(e.target.value as typeof ret)} aria-label="Returning or new"><option value="all">All players</option><option value="returning">Returning</option><option value="new">New</option></select>
     <select className={d.select} value={cohort} onChange={e=>setCohort(e.target.value as typeof cohort)} aria-label="First seen"><option value="all">Any first day</option><option value="new">New in range</option><option value="before">Seen before</option></select>
    </div>
    {list.partial&&<p className={styles.note}>Players from before {shortDay(list.oldestDay)} are not listed (raw rows are kept {RAW_DAYS} days).</p>}
    <p className={styles.note} data-players-count>{rows.length===list.rows.length?`${list.players} players`:`${rows.length} of ${list.players} players`} over {list.sessions} sessions{list.unattributed?` (${list.unattributed} sessions from older tabs have no player id)`:''}.</p>
    {rows.length?<ul className={d.pList}>
     <li aria-hidden="true"><div className={`${d.pRow} ${d.pHead}`}><span>Player</span><span>Last seen</span><span>Minutes</span><span>Sessions</span><span>Days</span><span>First seen</span></div></li>
     {rows.slice(0,limit).map(p=><li key={p.pid}><button type="button" className={d.pRow} aria-current={pid===p.pid} onClick={()=>setPid(p.pid)} data-pid={p.pid}
      aria-label={`Player ${p.pid.slice(0,6)}: ${mins(p.seconds)} minutes over ${p.sessions} sessions, last seen ${dateClockPT(p.lastSeen)}`}>
      <span className={d.pid}>#{p.pid.slice(0,6)}{p.returning===false?' · new':''}</span><span>{dateClockPT(p.lastSeen)}</span><span>{mins(p.seconds)}</span><span>{p.sessions}</span><span>{p.daysPlayed}</span><span>{p.firstSeen?fmtDay(pacificDay(Date.parse(p.firstSeen))):'—'}</span>
     </button></li>)}
    </ul>:<p className={styles.empty}>{list.rows.length?'No player matches these filters.':'No players in this range.'}</p>}
    {rows.length>limit&&<button type="button" className={styles.secondary} onClick={()=>setLimit(l=>l+50)}>Show 50 more ({rows.length-limit} left)</button>}
   </>}
  </div>
  {pid&&<PlayerDetail key={pid} pid={pid} onSessions={()=>onSessions(pid)} onClose={()=>setPid(null)} countryName={countryName}/>}
 </section>;
}

export function PlayerDetail({pid,onSessions,onClose,countryName}:{pid:string;onSessions:()=>void;onClose:()=>void;countryName:(c:string)=>string}){
 const [p,setP]=useState<PlayerReport|null>(null),[err,setErr]=useState(false);
 useEffect(()=>{let gone=false;fetch(`/api/admin/player?pid=${pid}`,{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject()).then(j=>{if(!gone)setP(j as PlayerReport);}).catch(()=>{if(!gone)setErr(true);});return()=>{gone=true;};},[pid]);
 useEffect(()=>{document.getElementById('player-detail')?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});},[p]);
 const today=pacificDay(),days=useMemo(()=>Array.from({length:RAW_DAYS},(_,i)=>addDays(today,i-RAW_DAYS+1)),[today]);
 const view=useMemo(()=>p?.status==='ok'&&p.pid?playerView(p,days,countryName):null,[p,days,countryName]);
 return <section className={styles.card} id="player-detail" aria-labelledby="player-title" data-metric="players.detail">
  <div className={styles.cardHead}><div><h2 id="player-title">Player #{pid.slice(0,6)}</h2><p>Anonymous id (a further hash of the save code or device): no name, IP, user agent or code is kept. The last {RAW_DAYS} days only.</p></div>
   <button type="button" className={styles.tableToggle} onClick={onClose}>Close</button></div>
  {!p&&!err&&<p className={styles.note} aria-busy="true">Loading…</p>}
  {err&&<p className={d.state} role="alert">Could not load this player. Try again.</p>}
  {p&&p.status!=='ok'&&<p className={d.state}>{STATUS_TEXT[p.status]??'Not available.'}</p>}
  {p?.status==='ok'&&!p.pid&&<p className={styles.empty}>No sessions for this player in the last {RAW_DAYS} days.</p>}
  {view&&p&&<div className={d.detail}>
   <dl className={d.facts}>
    <div><dt>First seen{p.partial?' (kept rows)':''}</dt><dd>{dateClockPT(p.firstSeen)}</dd></div>
    <div><dt>Last seen</dt><dd>{dateClockPT(p.lastSeen)}</dd></div>
    <div><dt>Days played</dt><dd>{p.daysPlayed} <small>of the {RAW_DAYS} kept days</small></dd></div>
    <div><dt>Sessions</dt><dd>{p.sessions} <small>{view.avg} min on average</small></dd></div>
    <div><dt>Minutes played</dt><dd>{mins(p.seconds)} <small>{fmtClock(p.seconds)} foreground</small></dd></div>
    <div><dt>Returning pattern</dt><dd>{view.pattern}<small>{view.gapText}</small></dd></div>
    <div><dt>Device class</dt><dd>{view.devices||'—'}</dd></div>
    <div><dt>Where</dt><dd>{view.places||'—'}<small>country and region only</small></dd></div>
   </dl>
   {p.partial&&<p className={styles.note}>This player may have played before {shortDay(p.oldestDay)}: raw rows are kept {RAW_DAYS} days.</p>}
   <div className={d.stackSm}><h3 className={styles.miniHead}>Sessions per day</h3>
    <TrendChart x={dayX(days,today)} height={170} ariaLabel={`Player ${pid.slice(0,6)}: sessions per day, last ${RAW_DAYS} days`}
     series={[{key:'s',label:'Sessions',color:'var(--s1)',kind:'bar',values:view.perDay}]}/></div>
   <div className={styles.grid}>
    <div className={d.stackSm}><h3 className={styles.miniHead}>Minutes by area</h3>
     <BarList rows={view.areas.filter(a=>a.value>0)} unit="minutes" format={v=>String(v)} limit={8}/>
     <p className={styles.note}>Live matches and minutes with friends are counters on the session, not kept per player: not shown here (the Live matches and Island tabs have them in total).</p></div>
    <div className={d.stackSm}><h3 className={styles.miniHead}>Progress in these days</h3>
     <ul className={d.chips} data-player-progress>{LIVE_COUNT_KEYS.map(k=><li key={k} data-zero={!p.counts[k]||undefined}>{p.counts[k]||0} {LIVE_COUNT_LABEL[k][(p.counts[k]||0)===1?0:1]}</li>)}</ul>
     <p className={styles.note}>Lessons = opened, quizzes = finished. Cards found are counted for everyone, not per player.</p></div>
   </div>
   <button type="button" className={styles.secondary} onClick={onSessions} style={{justifySelf:'start'}}>Every session ›</button>
  </div>}
 </section>;
}

/** Pure (tests): the detail panel's numbers from one player's report. */
export function playerView(p:PlayerReport,days:string[],countryName:(c:string)=>string=c=>c){
 const perDayMap=new Map<string,number>();for(const r of p.rows){const dd=pacificDay(Date.parse(r.startedAt));perDayMap.set(dd,(perDayMap.get(dd)||0)+1);}
 const played=days.filter(x=>perDayMap.has(x)),gaps:number[]=[];for(let i=1;i<played.length;i++)gaps.push(Math.round((Date.parse(played[i])-Date.parse(played[i-1]))/86_400_000)-1);
 const area=(k:string)=>p.rows.reduce((a,r)=>a+(r.areas[k]||0),0),act=(ks:string[])=>p.rows.reduce((a,r)=>a+ks.reduce((b,k)=>b+(r.activities[k]||0),0),0);
 const m=(s:number)=>Math.round(s/6)/10;
 const areas=[{key:'island',label:'Island (all island time)',value:m(area('island'))},{key:'fishing',label:'Fishing (inside the island)',value:m(act(['fishing']))},
  {key:'learning',label:'Learning (lessons, quizzes, Paths, museum)',value:m(act(['lesson','quiz'])+area('paths')+area('museum'))},
  {key:'arcade',label:'Arcade',value:m(area('arcade'))},{key:'shops',label:'Shops and other pages',value:m(area('konbini')+area('shop')+area('controller')+area('other'))}];
 const devices=[...new Set(p.rows.map(r=>DEVICE[r.device]??r.device))].join(', ');
 const places=[...new Set(p.rows.map(r=>[r.country?countryName(r.country):null,r.regionName||r.region].filter(Boolean).join(' · ')).filter(Boolean))].slice(0,3).join('; ');
 return {perDay:days.map(x=>perDayMap.get(x)??0),areas,devices,places,avg:p.sessions?Math.round(p.seconds/p.sessions/6)/10:0,
  pattern:played.length<=1?'One day':`${played.length} days`,gapText:played.length<=1?'not back yet in the kept days':`longest gap ${Math.max(...gaps)} day${Math.max(...gaps)===1?'':'s'}, came back ${played.length-1} time${played.length===2?'':'s'}`};
}
