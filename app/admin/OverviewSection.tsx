'use client';
/**
 * The investor overview on /admin (Oct 11 2026): the headline KPI tiles (this range vs the period just before it), the
 * engagement tiles, the acquisition funnel from the title screen to a day-2 return, and the Football plan usage. Analytics
 * numbers come from report.overview (lib/analytics/overview.ts; "<5" below 5 sessions), save-code numbers from report.saves
 * (lib/saves/metrics.ts). Stat tiles follow the dataviz contract: label, value, a signed delta vs a named period, a sparkline.
 */
import type {Report} from '@/lib/analytics/core';
import type {Cell} from '@/lib/analytics/learning';
import type {PeriodTotals} from '@/lib/analytics/overview';
import {BarList,ChartCard,Delta,Sparkline,fmtDuration,fmtInt,fmtPct} from './charts';
import {Steps} from './StartSection';
import {saveData,saveGap} from './SavesSection';
import styles from './admin.module.css';
import liveStyles from './LivePanel.module.css';
import type {KeyboardEvent as ReactKeyboardEvent} from 'react';

const show=(c:Cell|undefined)=>c===null||c===undefined?'<5':fmtInt(c);
const num=(c:Cell|undefined)=>c===undefined?null:c;
export const prevLabel=(days:number)=>days===1?'the day before':`the ${days} days before`;
/** Oct 12 2026: what the period before was cut to. When the range ends today, the period before stops at the same time of day
 *  (report.time.compare: 'exact' from raw rows, 'estimated' when its last day is older than the raw window). */
export function compareLabel(report:Report,days:number){
 const base=prevLabel(days),c=report.time?.compare;
 return c==='exact'?`${base}, same time of day`:c==='estimated'?`${base}, same time of day (est.)`:base;
}
const perDay=(p:PeriodTotals)=>p.perDay?.value??(p.days?p.visitors/p.days:0);
const plural=(n:number,w:string)=>`${n} ${w}${n===1?'':'s'}`;
const hours=(ms:number)=>ms>=3_600_000?`${(ms/3_600_000).toFixed(ms>=36_000_000?0:1)} h`:fmtDuration(ms);

/** Row 1: the numbers an investor reads first. One hero (players: that day, or the total over a range); everything else a stat tile. */
/** "Oct 16" for a calendar date. */
const onDay=(day:string)=>new Date(day+'T12:00:00Z').toLocaleDateString('en-US',{month:'short',day:'numeric',timeZone:'UTC'});
/** `onOpenDay` (Oct 16 2026; user: "for players today, can we have that be clickable ... and list each user"): the hero tile opens
 *  the slide-out on that day (the range's last day over a longer range), listing each session (app/admin/LivePanel.tsx). */
export function HeadlineTiles({report,onOpenDay}:{report:Report;onOpenDay?:(day:string)=>void}){
 const o=report.overview,c=o?.current,p=o?.previous??null,d=saveData(report),gap=saveGap(report.saves);
 const len=c?.days||1,label=compareLabel(report,len),partial=!!report.time?.partialToday;
 const r=d?.retention,ret=(k:'d1'|'d7'|'d30')=>r&&r[k].eligible?fmtPct(r[k].kept/r[k].eligible):'—';
 const restored=num(c?.steps['st:restored']),restoredPrev=num(p?.steps['st:restored']);
 // Players per day (Oct 12 2026): complete days only. A 7-day range that ends today averages its 6 finished days (today so far
 // is shown beside it), and the period before averages the same 6 positions a week earlier.
 const per=c?.perDay,single=len===1,full=len-(partial?1:0);
 const perLabel=single?label:`the same ${per?.days??full} days ${len===7?'a week':plural(len,'day')} earlier`;
 // New save codes: like for like when the range ends today (its complete days vs as many days before; lib/saves/metrics.ts).
 const sc=report.saves?.compare;
 return <section className={styles.kpis8} aria-label="Headline numbers">
  <div className={`${styles.tile} ${styles.hero} ${onOpenDay?liveStyles.hero:''}`} data-day-tile={report.to}
   {...(onOpenDay?{role:'button',tabIndex:0,'aria-haspopup':'dialog' as const,'aria-label':`${single?(partial?'Players today so far':`Players on ${onDay(report.to)}`):'Players, total'}: open each player's sessions${single?'':` on ${onDay(report.to)}`}`,
    onClick:()=>onOpenDay(report.to),onKeyDown:(e:ReactKeyboardEvent)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onOpenDay(report.to);}}}:{})}>
   <span>{single?(partial?'Players today so far':`Players on ${onDay(report.to)}`):'Players, total'}</span>
   <b>{c?fmtInt(single?Math.round(perDay(c)):c.visitors):'0'}</b>
   <small>{single?'unique visitors':`players added up day by day over ${plural(len,'day')}${partial?' (today so far included)':''}: someone who plays on 3 days counts 3 times · about ${fmtInt(Math.round(perDay(c!)))} a day`} · a visitor is one device and network on one day</small>
   {/* Totals (user, Oct 13 2026: "change that to total ... easier to understand than per day"); the change compares the same complete days, so a range that ends today isn't unfairly behind. */}
   {c&&<Delta cur={single?perDay(c):perDay(c)*(per?.days??full)} prev={p?(single?perDay(p):perDay(p)*(per?.days??full)):null} label={perLabel}/>}
   <Sparkline values={report.series.map(s=>s.visitors)} label="Visitors over the range"/>
   {onOpenDay&&<span className={liveStyles.more} aria-hidden="true">{single?'Tap for each player ›':`Tap for each player on ${onDay(report.to)} ›`}</span>}
  </div>
  <div className={styles.tile}><span>Active save codes, 7 days</span><b>{d?fmtInt(d.active_7):'—'}</b>
   <small>{d?`weekly active · today ${fmtInt(d.active_1)} · 30 days ${fmtInt(d.active_30)} (UTC dates)`:gap}</small></div>
  <div className={styles.tile}><span>New save codes</span><b>{d?fmtInt(d.range.created):'—'}</b>
   {!d?<small>{gap}</small>:sc?<Delta cur={sc.created} prev={sc.prevCreated} label={`${plural(sc.days,'complete day')} vs the ${sc.days} before`}/>
    :d.to===d.today&&d.from===d.to?<small>today so far (UTC date)</small>:<Delta cur={d.range.created} prev={d.range.prev_created} label={prevLabel(len)}/>}
   {d&&<Sparkline values={d.by_day.map(x=>x.created)} label="New save codes per day"/>}</div>
  {/* Returning (Oct 20 2026): range-aware. Codes made before the range whose last use falls inside it. Only the LATEST use date is stored. */}
  <div className={styles.tile}><span>Returning save codes</span><b>{d?fmtInt(d.range.returning??0):'—'}</b>
   {!d?<small>{gap}</small>:d.range.returning===undefined?<small>run supabase/migrations/20261020_admin_save_returning_range.sql to count this range</small>
    :<><small>{d.from===d.to?(d.to===d.today?'made before today and used today':'made before this day and used on it'):'came back in this range, made before it'} (UTC dates; only the latest use date of each code is stored, so a code used again later counts in the later range)</small>
     <Delta cur={d.range.returning} prev={d.range.prev_returning} label={prevLabel(len)}/></>}
   {d&&<small>all time {fmtInt(d.returning)} · {d.eligible?fmtPct(d.returning/d.eligible):'—'} of codes made before today came back on a later day</small>}</div>
  <div className={styles.tile}><span>Day-7 retention (rolling)</span><b>{d?ret('d7'):'—'}</b>
   <small>{d?`codes used again 7+ days after they were made · day 1 ${ret('d1')} · day 30 ${ret('d30')}`:gap}</small></div>
  <div className={styles.tile}><span>Save codes stored</span><b>{d?fmtInt(d.total):'—'}</b>
   <small>{d?'all codes still kept (unused ones go after 12 months)':gap}</small></div>
  <div className={styles.tile}><span>Sessions</span><b>{fmtInt(report.totals.sessions)}</b>
   {c?<Delta cur={c.sessions} prev={p?.sessions??null} label={label}/>:<small>one per browser tab visit</small>}</div>
  <div className={styles.tile}><span>Time played</span><b>{hours(report.totals.engagedMs)}</b>
   {c?<Delta cur={c.engagedMs} prev={p?.engagedMs??null} label={label}/>:<small>foreground time</small>}</div>
  <div className={styles.tile}><span>Restores on a new device</span><b>{show(restored??0)}</b>
   {restored!==null&&restoredPrev!==null?<Delta cur={restored} prev={restoredPrev} label={label}/>:<small>“I have a save code” worked (sessions)</small>}</div>
 </section>;
}

/** Row 2: how much they play and learn. */
export function EngagementTiles({report}:{report:Report}){
 const t=report.totals,o=report.overview,c=o?.current,p=o?.previous??null,label=compareLabel(report,c?.days||1);
 const spp=(x:{sessions:number;visitors:number})=>x.visitors?x.sessions/x.visitors:0;
 const ft=c?.firstTry,ftPrev=p?.firstTry;
 return <div className={styles.startTiles} aria-label="Engagement">
  <div><span>Sessions per visitor a day</span><b>{spp(t).toFixed(2)}</b>{c?<Delta cur={spp(c)} prev={p?spp(p):null} label={label}/>:<small>sessions ÷ daily unique visitors</small>}</div>
  <div><span>Median visit</span><b>{fmtDuration(t.medianMs)}</b><small>average {fmtDuration(t.avgMs)}</small>{c&&<Delta cur={c.medianMs} prev={p?.medianMs??null} label={label}/>}</div>
  <div><span>Page views</span><b>{fmtInt(t.pageviews)}</b><small>{t.sessions?(t.pageviews/t.sessions).toFixed(1):'0'} per session</small></div>
  <div><span>Bounce rate</span><b>{fmtPct(t.bounceRate)}</b><small>one page and under 10 s</small></div>
  <div><span>Lessons finished</span><b>{show(c?.lessonsFinished)}</b>{c&&c.lessonsFinished!==null&&p&&p.lessonsFinished!==null?<Delta cur={c.lessonsFinished} prev={p.lessonsFinished} label={label}/>:<small>quizzes finished</small>}</div>
  <div><span>Quiz answers right first try</span><b>{ft?fmtPct(ft.right/ft.tries):'—'}</b>{ft&&ftPrev?<Delta cur={ft.right/ft.tries} prev={ftPrev.right/ftPrev.tries} label={label} points/>:<small>{ft?`${fmtInt(ft.tries)} first tries`:'no quiz answers yet'}</small>}</div>
  <div><span>Perfect quizzes</span><b>{show(c?.perfectQuizzes)}</b><small>all right first try · of {show(c?.lessonsFinished)} finished</small></div>
  <div><span>Paths lessons launched</span><b>{show(c?.pathsLaunched)}</b><small>graduations {show(c?.graduations)} (sessions)</small></div>
 </div>;
}

/** Title screen → Start → code made → “I saved it” → island, then the day-2 return from save codes made in the range. */
export function InvestorFunnel({report}:{report:Report}){
 const o=report.overview,s=o?.current.steps,d=saveData(report);
 const steps=s?[['st:view','Saw the title screen'],['st:start','Pressed Start'],['st:created','Save code made'],['st:saved','“I saved it” (code check passed)'],['st:play_ready','Went to the island (Play)']].map(([id,label])=>({id,label,sessions:s[id]??0})):[];
 const empty=!s||!steps.some(x=>x.sessions!==0);
 return <ChartCard wide title="New-player funnel" subtitle="Sessions at each step in this range, then save codes made in the range that came back on a later day. Bars are scaled to the first step; the drop from the step before is on the right."
  empty={empty&&!d} emptyText="No title-screen visits in this range yet."
  table={{columns:['Step','Count','Unit'],rows:[...steps.map(x=>[x.label,show(x.sessions),'sessions']),['Came back on a later day (so far)',d?`${fmtInt(d.range.returned)} of ${fmtInt(d.range.created)}`:'—','save codes made in the range']]}}>
  {!empty&&<Steps steps={steps}/>}
  <p className={styles.note}>Came back on a later day (any later day so far, not only day 2): <b>{d?fmtInt(d.range.returned):'—'}</b> of <b>{d?fmtInt(d.range.created):'—'}</b> save codes made in this range were used again on a later day{d&&d.range.created?<> (<b>{fmtPct(d.range.returned/d.range.created)}</b>; the range before: {d.range.prev_created?fmtPct(d.range.prev_returned/d.range.prev_created):'—'}, whose codes have had longer to come back)</>:null}.
   {!d&&<> Save codes: {saveGap(report.saves)}.</>} Codes made on the last day of the range have not had a later day yet. Save-code days are UTC dates.</p>
 </ChartCard>;
}

/** The Football plan (development plan) moments, sessions per event. */
export function PlanCard({report}:{report:Report}){
 const rows=(report.overview?.plan||[]).filter(r=>r.sessions!==0);
 return <ChartCard title="Football plan" subtitle="Sessions with each development-plan moment in this range (totals only: never which goal, mission or note)" empty={!rows.length} emptyText="No Football plan use in this range yet."
  table={{columns:['Moment','Sessions'],rows:rows.map(r=>[r.label,show(r.sessions)])}}>
  <BarList rows={rows.map(r=>({key:r.id,label:r.label,value:r.sessions??0,text:r.sessions===null?'<5':undefined,detail:r.sessions===null?'fewer than 5 sessions':undefined}))} unit="sessions" limit={8}/>
 </ChartCard>;
}
