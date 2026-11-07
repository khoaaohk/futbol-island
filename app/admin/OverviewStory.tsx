'use client';
/**
 * The Overview as a trend-first story (Nov 6 2026; owner: "the dashboard should tell a visual story of the data"). Reading
 * order: the takeaway sentence → the headline tiles → players and sessions over time → where the time goes → when they play →
 * the funnels → whether they come back → what changed. Every number is the daily data layer's (lib/analytics/dashboard.ts),
 * the same as the export for the same range. Not tracked = a dash and a sentence, never a fake 0. No goals or targets.
 */
import {useMemo,useState} from 'react';
import {K,aggregate,anomalies,byWeekday,cohortTable,compareState,dailyValues,fmtDay,fmtNum,fmtPctAbs,fmtShare,fmtUnit,funnels,movers,seriesOf,takeaway,weekly,
 ANOMALY_Z,ANOMALY_MIN_REL,MOVER_MIN_BASE,type DashboardData} from '@/lib/analytics/dashboard';
import {ChartCard} from './charts';
import {FunnelBars,HeatStrip,Legend,StackedColumns,TrendChart,dayX,type XLabel} from './DashCharts';
import {TrendTile} from './TrendTiles';
import styles from './admin.module.css';
import d from './dash.module.css';

/** `fallback`: the range totals the older reads already give before the people function exists (distinct players from
 *  analytics_players, the returning share from analytics_sources_summary), shown with the people tiles' not-installed note. */
type P={data:DashboardData|null;compare:boolean;onDef:(key:string)=>void;onPlayers:()=>void;fallback?:{players:number|null;returning:number|null}};
const S1='var(--s1)',S2='var(--s2)',S3='var(--s3)',S4='var(--s4)';

export default function OverviewStory({data,compare,onDef,onPlayers,fallback}:P){
 const [weeklyView,setWeekly]=useState(false);
 const cmp=data?compareState(data):null,useCmp=compare&&!!cmp?.ok;
 const head=<div className={styles.sectionHead}><h2 id="sec-story">The story so far</h2></div>;
 if(!data)return <section className={styles.island} aria-labelledby="sec-story" aria-busy="true">{head}<p className={d.lead}>Loading the trends…</p>
  <div className={d.tiles}>{Array.from({length:10},(_,i)=><div key={i} className={d.tile}><span className={d.skelLine}/><span className={d.skel}/></div>)}</div></section>;
 const ses=seriesOf(data,K.sessions),pl=seriesOf(data,K.players),mpp=seriesOf(data,K.mpp);
 const mppNd=mpp?{num:mpp.points.reduce((a,p)=>a+(p.num??0),0)/60000,den:mpp.points.reduce((a,p)=>a+(p.den??0),0)}:null;
 const noPeople=data.people.status!=='ok';
 const peopleNote=data.people.status==='needs-sql'?'needs the people function':data.people.status==='not-configured'?'not available here':data.people.status==='error'?'could not load':'';
 return <section className={styles.island} aria-labelledby="sec-story">
  {head}
  <div data-metric="overview.story">
   <p className={d.lead} data-takeaway>{takeaway(data,useCmp)}</p>
   <p className={d.leadNote}>{rangeLine(data)} {compare&&!cmp?.ok&&cmp?<>Compare: {cmp.reason[0].toLowerCase()+cmp.reason.slice(1)} (no previous period to compare with).</>:null}</p>
  </div>

  <div className={d.tiles} aria-label="Headline numbers">
   <TrendTile data={data} seriesKey={K.players} label="Players per day" metric="overview.players_per_day" compare={useCmp} onDef={onDef}
    foot={<span>unique visitors, mean of complete days</span>}/>
   {noPeople?<PeopleTile label="Players (distinct, range)" metric="overview.players" note={peopleNote} onDef={()=>onDef(K.players)} value={fallback?.players==null?null:fmtNum(fallback.players)}/>
    :<TrendTile data={data} seriesKey={K.distinct} label="Distinct players a day" metric="overview.players" compare={useCmp} onDef={onDef} foot={<span>per day, last 14 days of raw rows</span>}/>}
   {noPeople?<PeopleTile label="Returning sessions" metric="overview.returning_sessions" note={peopleNote} onDef={()=>onDef(K.sessions)} value={fallback?.returning==null?null:fmtShare(fallback.returning)}/>
    :<TrendTile data={data} seriesKey={K.returningShare} label="Returning sessions" metric="overview.returning_sessions" compare={useCmp} onDef={onDef} foot={<span>share of sessions, last 14 days</span>}/>}
   <TrendTile data={data} seriesKey={K.sessions} label="Sessions" metric="overview.sessions" compare={useCmp} onDef={onDef}/>
   <TrendTile data={data} seriesKey={K.avgSession} label="Average session" metric="overview.avg_session" compare={useCmp} onDef={onDef}/>
   <TrendTile data={data} seriesKey={K.mpp} label="Minutes per player" metric="overview.minutes_per_player" compare={useCmp} onDef={onDef}
    foot={mppNd&&mppNd.den?<span data-mpp-formula>{fmtNum(mppNd.num,1)} session minutes ÷ {fmtNum(mppNd.den)} player-days</span>:undefined}/>
   <TrendTile data={data} seriesKey={K.lmJoins} label="Live matches joined" metric="overview.live_matches" compare={useCmp} onDef={onDef}/>
   <TrendTile data={data} seriesKey={K.fishLanded} label="Fish landed" metric="overview.fish_landed" compare={useCmp} onDef={onDef}/>
   <TrendTile data={data} seriesKey={K.cards} label="Cards found" metric="overview.cards_found" compare={useCmp} onDef={onDef}/>
   <TrendTile data={data} seriesKey={K.social} label="Minutes with friends" metric="overview.friends_minutes" compare={useCmp} onDef={onDef}/>
  </div>
  <span data-metric="overview.change_vs_prior" hidden/>

  {ses&&pl&&<MainChart data={data} weeklyView={weeklyView} setWeekly={setWeekly}/>}
  <WhereTimeGoes data={data}/>
  <WhenTheyPlay data={data}/>
  <Funnels data={data}/>
  <Retention data={data} onPlayers={onPlayers}/>
  <WhatChanged data={data} compare={useCmp} reason={cmp&&!cmp.ok?cmp.reason:null}/>
 </section>;
}

function rangeLine(data:DashboardData){
 const n=data.days.length-data.start;
 return `${fmtDay(data.from)} – ${fmtDay(data.to)} (${n} day${n===1?'':'s'}${data.partialDay?', today so far':''}), Pacific days.`;
}
function PeopleTile({label,metric,note,onDef,value}:{label:string;metric:string;note:string;onDef:()=>void;value?:string|null}){
 return <div className={d.tile} data-metric={metric} data-people-missing>
  <span>{label}</span><b>{value??'—'}</b>
  <small>{value?'The range total (last 14 days of raw rows). ':''}{note==='needs the people function'?<>A trend per day needs the people function: <code>docs/analytics-proposed/analytics_daily_people.sql</code> (not run yet). It lights up here when it exists.</>:`Per-day players ${note}.`}</small>
  <div className={d.tileFoot}><button type="button" className={d.defLink} onClick={onDef}>How it’s counted</button></div>
 </div>;
}

function MainChart({data,weeklyView,setWeekly}:{data:DashboardData;weeklyView:boolean;setWeekly:(v:boolean)=>void}){
 const ses=seriesOf(data,K.sessions)!,pl=seriesOf(data,K.players)!;
 const n=ses.points.length,canWeek=n>=14;const wk=weeklyView&&canWeek;
 const view=useMemo(()=>{
  if(wk){const ws=weekly(ses),wp=weekly(pl);
   const x:XLabel[]=ws.map(w=>({key:w.week,short:fmtDay(w.week),long:`Week of ${fmtDay(w.week)} (${w.days} day${w.days===1?'':'s'}${w.complete?'':', not a full week'})`,partial:!w.complete||undefined}));
   return {x,sessions:ws.map(w=>w.value),players:wp.map(w=>w.value),markers:[] as {index:number;label:string}[]};}
  const x=dayX(ses.points.map(p=>p.day),data.today);
  const markers=data.releases.map(r=>({index:x.findIndex(l=>l.key===r.day),label:r.label})).filter(m=>m.index>=0);
  return {x,sessions:dailyValues(ses).map(p=>p.value),players:dailyValues(pl).map(p=>p.value),markers};
 },[wk,ses,pl,data.today,data.releases]);
 const rows=view.x.map((l,i)=>[l.long+(l.partial?' (so far)':''),view.players[i]===null?'not tracked':fmtNum(view.players[i],1),view.sessions[i]===null?'not tracked':fmtNum(view.sessions[i])]);
 return <ChartCard wide title="Players and sessions" subtitle={wk?'Per Monday–Sunday week: sessions added up; players = the mean of the week’s complete days. A lighter column is a week cut by the range or today.'
  :'Per Pacific day. Columns: sessions; line: players that day (unique visitors). Dashed lines: a feature started counting (from the code’s history). Today is lighter: so far.'}
  table={{columns:[wk?'Week':'Day','Players (per day)','Sessions'],rows}}>
  <div className={d.cardTools} data-metric="overview.main_chart">
   <Legend items={[{label:'Sessions',color:S1,box:true},{label:'Players per day',color:S2}]}/>
   {canWeek&&<div className={d.toggle} role="group" aria-label="Daily or weekly"><button type="button" aria-pressed={!wk} onClick={()=>setWeekly(false)}>Daily</button><button type="button" aria-pressed={wk} onClick={()=>setWeekly(true)}>Weekly</button></div>}
  </div>
  <TrendChart x={view.x} markers={view.markers} ariaLabel={`Players per day and sessions, ${fmtDay(data.from)} to ${fmtDay(data.to)}${wk?', by week':''}`}
   series={[{key:'sessions',label:'Sessions',color:S1,kind:'bar',values:view.sessions},{key:'players',label:'Players per day',color:S2,kind:'line',values:view.players,format:v=>fmtNum(v,1)}]}/>
  {!wk&&view.markers.length>0&&<p className={styles.note}>Started counting: {view.markers.map(m=>`${m.label} (${fmtDay(view.x[m.index].key)})`).join(' · ')}.</p>}
 </ChartCard>;
}

/** The true split by area (they add up to session time) and, inside the island, the activities with their own counters. */
function WhereTimeGoes({data}:{data:DashboardData}){
 const A=(a:string)=>seriesOf(data,'time.area_minutes.'+a);
 const parts=[{key:'island',label:'Island',color:S1,ids:['island']},{key:'arcade',label:'Arcade',color:S2,ids:['arcade']},
  {key:'learn',label:'Paths and museum',color:S3,ids:['paths','museum']},{key:'other',label:'Shops and other pages',color:S4,ids:['konbini','shop','controller','other']}];
 const x=dayX(data.days.slice(data.start),data.today);
 const ser=parts.map(p=>({key:p.key,label:p.label,color:p.color,values:x.map((_,i)=>{let any=false,sum=0;for(const id of p.ids){const v=A(id)?.points[i]?.value;if(v!==null&&v!==undefined){any=true;sum+=v;}}return any?sum:null;})}));
 const tot=(vals:(number|null)[])=>vals.reduce<number>((a,v)=>a+(v??0),0),all=ser.reduce((a,s)=>a+tot(s.values),0);
 const inside:[string,string,string][]=[['time.where_time_goes.matches','Live matches','exact seconds'],['time.where_time_goes.fishing','Fishing','activity time'],
  ['time.where_time_goes.learning','Learning (lessons, quizzes, Paths, museum)','activity time'],['time.where_time_goes.friends','With friends','whole party minutes'],['time.where_time_goes.arcade_games','Arcade games only','the five games, lobby left out']];
 return <ChartCard wide title="Where time goes" subtitle="Foreground minutes per day by area (these add up to all session time). On the right: activities measured inside that time; they overlap, so they are not a split."
  empty={!all} emptyText="No session minutes in this range yet."
  table={{columns:['Day',...ser.map(s=>s.label+' (min)'),'Total'],rows:x.map((l,i)=>[l.long,...ser.map(s=>s.values[i]===null?'not tracked':fmtNum(s.values[i],0)),fmtNum(ser.reduce((a,s)=>a+(s.values[i]??0),0),0)])}}>
  <div className={d.split} data-metric="overview.where_time_goes">
   <div><Legend items={ser.map(s=>({label:`${s.label} ${all?Math.round(tot(s.values)/all*100):0}%`,color:s.color,box:true}))}/>
    <StackedColumns x={x} series={ser} unit="minutes" ariaLabel="Minutes per day by area, stacked"/></div>
   <ul className={d.mini} aria-label="Inside the island and the arcade">
    {inside.map(([key,label,note])=>{const s=seriesOf(data,key),v=s?aggregate(s,s.points).value:null;
     return <li key={key} data-series={key}><span>{label}</span><b>{v===null?'—':`${fmtNum(v,0)} min`}</b>
      <small>{v===null?`Not tracked in this range${s?.trackedSince?` (from ${fmtDay(s.trackedSince)})`:''}.`:`${note}${all&&v!==null?` · ${Math.round(v/all*1000)/10}% of all minutes`:''}${s?.trackedSince&&s.trackedSince>data.from?` · from ${fmtDay(s.trackedSince)}`:''}`}</small></li>;})}
    <li><span>Cards, emotes, swims</span><b>—</b><small>Counted as events, not minutes: no minutes counter of their own (their time is inside the island).</small></li>
   </ul>
  </div>
 </ChartCard>;
}

function WhenTheyPlay({data}:{data:DashboardData}){
 const ses=seriesOf(data,K.sessions);if(!ses)return null;
 const wd=byWeekday(ses),order=[1,2,3,4,5,6,0],h=data.hours.sessions;
 const hoursCells=h.hours.map(r=>({key:String(r.hour),label:r.hour===0?'12a':r.hour<12?`${r.hour}a`:r.hour===12?'12p':`${r.hour-12}p`,value:h.status==='ok'?r.sessions:null,detail:`${r.hour}:00–${r.hour}:59 Pacific`}));
 return <div className={styles.grid} data-metric="overview.when">
  <ChartCard title="Day of the week" subtitle="Average sessions on each weekday (complete days of the range; a weekday with no complete day shows a dash)."
   table={{columns:['Weekday','Average sessions','Days'],rows:order.map(i=>[wd[i].label,wd[i].value===null?'—':fmtNum(wd[i].value,1),wd[i].days])}}>
   <HeatStrip cells={order.map(i=>({key:wd[i].label,label:wd[i].label,value:wd[i].value,detail:`${wd[i].days} day${wd[i].days===1?'':'s'}`}))} unit="sessions a day" ariaLabel="Average sessions by weekday"/>
  </ChartCard>
  <ChartCard title="Hour of the day" subtitle={h.status==='ok'?`Session starts by Pacific hour over ${h.days.length} day${h.days.length===1?'':'s'} (raw rows: the last 14 days only). No other counter keeps a time of day.`:'Hours exist only for the last 14 days (raw rows); this range has none.'}
   table={{columns:['Hour (Pacific)','Session starts'],rows:h.hours.map(r=>[`${r.hour}:00`,h.status==='ok'?r.sessions:'—'])}}>
   <HeatStrip cells={hoursCells} unit="session starts" columns={12} ariaLabel="Session starts by hour of day, Pacific"/>
  </ChartCard>
 </div>;
}

function Funnels({data}:{data:DashboardData}){
 const f=funnels(data);
 const card=(title:string,sub:string,steps:typeof f.onboarding,metric:string,extra?:string)=>{const since=(steps as {since?:string|null}).since;
  return <ChartCard title={title} subtitle={sub+(since?` Counted from ${fmtDay(since)}, when every step was tracked.`:'')} empty={!steps.some(s=>s.value)} emptyText="Nothing in this range yet (or not tracked yet)."
   table={{columns:['Step','Count','Unit','Of the step before'],rows:steps.map(s=>[s.label,s.value===null?'—':s.value,s.unit,s.fromPrev===null?'—':fmtShare(s.fromPrev)])}}>
   <div data-metric={metric}><FunnelBars steps={steps} ariaLabel={title}/>{extra&&<p className={styles.note}>{extra}</p>}</div>
  </ChartCard>;};
 const c=cohortTable(data);
 return <div className={d.grid3}>
  {card('New players: title screen to island','Sessions at each step (a session counts once per step).',f.onboarding,'overview.funnel_onboarding',
   c.d1?`Came back the next day: ${fmtNum(c.d1.n)} of ${fmtNum(c.d1.of)} new players (${fmtShare(c.d1.n/c.d1.of)}), from the cohorts below.`:data.people.status==='ok'?undefined:'Coming back the next day needs the people function (Retention below).')}
  {card('Fishing: tap to landed','Sessions that reached each step (the fishing funnel counters).',f.fishing,'overview.funnel_fishing')}
  {card('Live matches: visit to finish','Pitch visits (the Learn + Play bar), matches joined, matches finished with their time counted. Events, not people.',f.matches,'overview.funnel_matches')}
 </div>;
}

function Retention({data,onPlayers}:{data:DashboardData;onPlayers:()=>void}){
 const c=cohortTable(data),st=data.people.status;
 return <ChartCard wide title="Do they come back?" subtitle="New players by the day they were first seen, and how many played again the next day (D1) and 7 days later (D7). First seen = within the 14 days of raw rows, so the earliest cohorts read high."
  table={{columns:['First seen','New players','Back next day (D1)','D1 %','Back on day 7 (D7)','D7 %'],rows:c.rows.map(r=>[fmtDay(r.day),r.players,r.d1===null?'not yet':r.d1,fmtShare(r.d1Share),r.d7===null?'not yet':r.d7,fmtShare(r.d7Share)])}}
  empty={st==='ok'&&!c.rows.length} emptyText="No new players inside the raw-row window for this range.">
  <div data-metric="overview.cohorts">
   {st!=='ok'?<p className={d.state} data-people-missing><b>Needs the people function.</b> Cohorts link a player’s days, which only the raw rows (kept 14 days) can do. Run <code>docs/analytics-proposed/analytics_daily_people.sql</code> in Supabase (proposed, not run yet) and this table fills in by itself.{st==='error'?' (The function did not answer just now.)':''}</p>
   :<div className={d.tableWrap}><table className={d.tbl}>
    <thead><tr><th scope="col">First seen</th><th scope="col">New players</th><th scope="col">D1</th><th scope="col">D7</th></tr></thead>
    <tbody>{c.rows.map(r=><tr key={r.day}><th scope="row" style={{fontWeight:400}}>{fmtDay(r.day)}</th><td>{fmtNum(r.players)}</td>
     <td>{r.d1===null?<span title="that day has not ended">not yet</span>:<>{fmtNum(r.d1)} <small>({fmtShare(r.d1Share)})</small></>}</td>
     <td>{r.d7===null?<span title="day 7 has not ended">not yet</span>:<>{fmtNum(r.d7)} <small>({fmtShare(r.d7Share)})</small></>}</td></tr>)}
     <tr><th scope="row">All cohorts</th><td>{fmtNum(c.rows.reduce((a,r)=>a+r.players,0))}</td><td>{c.d1?`${fmtNum(c.d1.n)} of ${fmtNum(c.d1.of)} (${fmtShare(c.d1.n/c.d1.of)})`:'—'}</td><td>{c.d7?`${fmtNum(c.d7.n)} of ${fmtNum(c.d7.of)} (${fmtShare(c.d7.n/c.d7.of)})`:'—'}</td></tr>
    </tbody></table></div>}
   <p className={styles.note}><b>D30: not available</b>: raw rows are kept 14 days, so nothing links a player 30 days apart (a policy decision). <button type="button" className={d.linkBtn} onClick={onPlayers}>See each player</button></p>
  </div>
 </ChartCard>;
}

function WhatChanged({data,compare,reason}:{data:DashboardData;compare:boolean;reason:string|null}){
 const mv=compare?movers(data).slice(0,6):[],an=anomalies(data).slice(0,6);
 return <ChartCard wide title="What changed" subtitle={`Biggest moves vs the period before (sums with under ${MOVER_MIN_BASE} before are left out), and unusual days: more than ${ANOMALY_Z} scaled MADs and ${Math.round(ANOMALY_MIN_REL*100)}% from the range’s median day (robust: one big day cannot hide another). No goals or targets.`}
  table={{columns:['Kind','Measure','Day or period','Value','Compared with'],rows:[...mv.map(m=>['Change',m.label,'range',fmtUnit(m.cur,m.unit),`${fmtUnit(m.prev,m.unit)} (${m.change>=0?'+':'−'}${fmtPctAbs(m.change)})`]),
   ...an.map(a=>[a.dir==='spike'?'Spike':'Drop',a.label,fmtDay(a.day),fmtUnit(a.value,a.unit),`median ${fmtUnit(a.median,a.unit)}`])]}}>
  <div className={d.changes} data-metric="overview.what_changed">
   <div className={d.stackSm}><h3 className={styles.miniHead}>Biggest movers</h3>
    {!compare?<p className={styles.note}>{reason?`${reason}: no previous period to compare with.`:'Turn on Compare to see the changes.'}</p>
     :mv.length?<ul className={d.moves}>{mv.map(m=><li key={m.key}><span>{m.label}</span><b className={d.delta} data-tone={m.key==='audience.bounce_rate'?(m.change<0?'good':'bad'):m.change>0?'good':'bad'}>{m.change>0?'▲ +':'▼ −'}{fmtPctAbs(m.change)}</b>
      <small>{fmtUnit(m.cur,m.unit)} vs {fmtUnit(m.prev,m.unit)}</small></li>)}</ul>:<p className={styles.note}>Nothing comparable moved.</p>}</div>
   <div className={d.stackSm}><h3 className={styles.miniHead}>Unusual days</h3>
    {an.length?<ul className={d.moves}>{an.map(a=><li key={a.key+a.day}><span>{a.label}: {a.dir} on {fmtDay(a.day)}</span><b>{fmtUnit(a.value,a.unit)}</b>
     <small>median day {fmtUnit(a.median,a.unit)} · {Math.abs(a.z).toFixed(1)} scaled MADs {a.dir==='spike'?'above':'below'}</small></li>)}</ul>
     :<p className={styles.note}>No day stands out{completeLen(data)<7?' (needs 7 or more complete days)':''}.</p>}</div>
  </div>
 </ChartCard>;
}
const completeLen=(data:DashboardData)=>data.days.slice(data.start).filter(x=>x!==data.today).length;
