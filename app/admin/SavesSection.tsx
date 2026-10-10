'use client';
/**
 * Save codes on /admin (Oct 11 2026): how many codes exist and come back, restores on a new device, the expiry pipeline and
 * save health. Everything comes from report.saves (lib/saves/metrics.ts, public.save_admin_metrics in
 * supabase/migrations/20261011_admin_save_metrics.sql) and report.overview (title-screen counters, "<5" below 5 sessions).
 * Aggregates only: never a code, a hash, a save's contents or anything per child.
 */
import type {Report} from '@/lib/analytics/core';
import type {RawSaveMetrics,SaveMetricsReport} from '@/lib/saves/metrics';
import type {Cell} from '@/lib/analytics/learning';
import {BarList,ChartCard,DayColumns,fmtInt,fmtPct,type DayColumn} from './charts';
import styles from './admin.module.css';

export const SAVE_MIGRATION='supabase/migrations/20261011_admin_save_metrics.sql';
export const SAVE_OK_ROW='OK, admin save metrics installed';
const show=(c:Cell)=>c===null?'<5':fmtInt(c);
const pctOr=(a:number,b:number)=>b?fmtPct(a/b):'—';
export const fmtBytes=(n:number|null)=>n===null?'—':n<1024?`${n} B`:n<1024*1024?`${(n/1024).toFixed(1)} KB`:n<1024**3?`${(n/1024/1024).toFixed(1)} MB`:`${(n/1024**3).toFixed(2)} GB`;
export const days=(n:number)=>`${n} ${n===1?'day':'days'}`;
const day=(key:string)=>new Date(key+'T00:00:00Z').toLocaleDateString('en',{month:'short',day:'numeric',timeZone:'UTC'});
export const saveData=(r:Report):RawSaveMetrics|null=>r.saves?.status==='ok'?r.saves.data:null;

/** Why the save numbers are missing, in one line (tiles and cards use it). */
export function saveGap(s:SaveMetricsReport|null|undefined):string{
 switch(s?.status){
  case 'needs-migration':return 'needs the save-metrics migration';
  case 'table-missing':return 'save table not installed';
  case 'not-configured':return 'saving not configured';
  case 'error':return 'save store did not answer';
  default:return 'no save data';
 }
}

/** The "needs migration" banner, worded like the analytics storage banners. */
export function SaveMetricsBanner({saves}:{saves:SaveMetricsReport|null|undefined}){
 if(!saves||saves.status==='ok')return null;
 if(saves.status==='needs-migration')return <section className={`${styles.banner} ${styles.bannerWarn}`} role="status" aria-labelledby="save-metrics-update">
  <h2 id="save-metrics-update">Save-code metrics need a database update</h2>
  The save table is installed but the admin metrics function is not. In the Supabase SQL editor, paste the <b>whole</b> of <code>{SAVE_MIGRATION}</code> and
  run it. Its last result must be one row reading <code>{SAVE_OK_ROW}</code>; anything else means it did not finish, and running the whole file again is safe.
  Until then saving keeps working and the save-code tiles below show “—”.
 </section>;
 return <p className={styles.note}>Save-code metrics: {saveGap(saves)}.</p>;
}

/** Codes made per day in the range (per week when the range is longer than 60 days), from created_on. */
export function NewCodesCard({d,saves}:{d:RawSaveMetrics|null;saves:SaveMetricsReport|null|undefined}){
 const byWeek=!!d&&d.by_day.length>60;
 const rows:DayColumn[]=!d?[]:byWeek?Object.values(d.by_day.reduce<Record<string,DayColumn>>((acc,r)=>{const dt=new Date(r.day+'T00:00:00Z'),w=new Date(dt.getTime()-((dt.getUTCDay()+6)%7)*86_400_000).toISOString().slice(0,10);
  (acc[w]??={key:w,label:day(w),value:0,detail:'week starting'}).value!+=r.created;return acc;},{})):d.by_day.map(r=>({key:r.day,label:day(r.day),value:r.created}));
 return <ChartCard title="New save codes" subtitle={`Codes made ${byWeek?'per week':'per day'} in this range (codes still stored; UTC days)`} empty={!d} emptyText={`Save codes: ${saveGap(saves)}.`}
  table={{columns:[byWeek?'Week of':'Day','Codes made'],rows:rows.map(r=>[r.label,r.value??0])}}>
  <DayColumns rows={rows} unit="codes made" ariaLabel="New save codes over the range"/>
 </ChartCard>;
}

/** The last 12 weeks, whatever the range: the growth trend. */
export function WeeklyCodesCard({d,saves}:{d:RawSaveMetrics|null;saves:SaveMetricsReport|null|undefined}){
 const rows:DayColumn[]=(d?.weeks||[]).map(w=>({key:w.week,label:day(w.week),value:w.created,detail:'week starting (Mon)'}));
 const last=rows[rows.length-1]?.value??0,before=rows[rows.length-2]?.value??0;
 return <ChartCard title="Save codes per week" subtitle="New codes in each of the last 12 weeks (Monday to Sunday, the current week so far). Not scoped by the date range." empty={!d} emptyText={`Save codes: ${saveGap(saves)}.`}
  table={{columns:['Week of','Codes made'],rows:rows.map(r=>[r.label,r.value??0])}}>
  <div className={styles.lengthStats}><span>This week so far <b>{fmtInt(last)}</b></span><span>Last week <b>{fmtInt(before)}</b></span><span>12 weeks <b>{fmtInt(rows.reduce((a,r)=>a+(r.value??0),0))}</b></span></div>
  <DayColumns rows={rows} unit="codes made" ariaLabel="New save codes per week, last 12 weeks"/>
 </ChartCard>;
}

/** Rolling retention of save codes: of codes at least N days old, the share used again N or more days after they were made. */
export function RetentionCard({d,saves}:{d:RawSaveMetrics|null;saves:SaveMetricsReport|null|undefined}){
 const rows=d?([['d1','Day 1','used again a day or more later'],['d7','Day 7','used again 7+ days later'],['d30','Day 30','used again 30+ days later']] as const).map(([k,label,what])=>{const r=d.retention[k];
  return {key:k,label,value:r.eligible?r.kept/r.eligible:0,text:r.eligible?undefined:'—',detail:`${fmtInt(r.kept)} of ${fmtInt(r.eligible)} codes ${what}`,r};}):[];
 return <ChartCard title="Retention (save codes)" subtitle="Of the codes at least 1, 7 or 30 days old, the share used again that many days or more after they were made (rolling retention)" empty={!d} emptyText={`Save codes: ${saveGap(saves)}.`}
  table={{columns:['Day','Retained','Codes used again','Codes old enough'],rows:rows.map(r=>[r.label,r.r.eligible?fmtPct(r.value):'—',r.r.kept,r.r.eligible])}}>
  <BarList rows={rows.map(({r,...x})=>x)} format={fmtPct} unit="retained" share={false}/>
  <p className={styles.note}>Save codes are the only thing that links one player across days (visits are counted with a salt that is deleted every night). Players who never make a code are not in these numbers.</p>
 </ChartCard>;
}

/** Who comes back: active codes, returning codes, early churn and lifetime. */
export function ComingBackCard({d,saves}:{d:RawSaveMetrics|null;saves:SaveMetricsReport|null|undefined}){
 return <ChartCard title="Save codes coming back" subtitle="Unique codes by when they were last used (restored, checked or synced), as of today (UTC)" empty={!d} emptyText={`Save codes: ${saveGap(saves)}.`}
  table={{columns:['Measure','Codes','Share'],rows:d?[['Used today',d.active_1,pctOr(d.active_1,d.total)],['Used in the last 7 days',d.active_7,pctOr(d.active_7,d.total)],['Used in the last 30 days',d.active_30,pctOr(d.active_30,d.total)],
   ['Returning (used on a later day)',d.returning,pctOr(d.returning,d.eligible)+' of codes made before today'],['Never came back (made before today)',d.never_returned,pctOr(d.never_returned,d.eligible)+' of codes made before today'],
   ['Made in this range',d.range.created,'—'],['… and came back',d.range.returned,pctOr(d.range.returned,d.range.created)],['Made in the period before',d.range.prev_created,'—'],['… and came back',d.range.prev_returned,pctOr(d.range.prev_returned,d.range.prev_created)],
   ['Median lifetime (days from made to last used)',d.median_lifetime_days,'—'],['Median code age (days)',d.median_age_days,'—'],['Codes stored',d.total,'—']]:[]}}>
  {d&&<dl className={styles.statList}>
   <div><dt>Active today</dt><dd>{fmtInt(d.active_1)}<small>daily active codes</small></dd></div>
   <div><dt>Active, 7 days</dt><dd>{fmtInt(d.active_7)}<small>weekly active codes · 30 days {fmtInt(d.active_30)}</small></dd></div>
   <div><dt>Returning codes</dt><dd>{fmtInt(d.returning)}<small>{pctOr(d.returning,d.eligible)} of {fmtInt(d.eligible)} made before today</small></dd></div>
   <div><dt>Never came back</dt><dd>{fmtInt(d.never_returned)}<small>{pctOr(d.never_returned,d.eligible)} · early churn</small></dd></div>
   <div><dt>Made in this range, came back</dt><dd>{fmtInt(d.range.returned)}<small>of {fmtInt(d.range.created)} ({pctOr(d.range.returned,d.range.created)}); before: {pctOr(d.range.prev_returned,d.range.prev_created)}</small></dd></div>
   <div><dt>Median lifetime</dt><dd>{days(d.median_lifetime_days)}<small>made → last used · median age {days(d.median_age_days)}</small></dd></div>
  </dl>}
 </ChartCard>;
}

/** "I have a save code" that worked, per day (sessions on the title screen; a restore is a player on a new device or browser). */
export function RestoresCard({report}:{report:Report}){
 const o=report.overview,rows:DayColumn[]=(o?.daily||[]).map(r=>({key:r.day,label:day(r.day),value:r.restored,detail:`codes made ${show(r.created)} · fails ${show(r.restoreFails)}`}));
 const empty=!o||o.daily.every(r=>r.restored===0&&r.created===0);
 return <ChartCard title="Restores on a new device" subtitle="Sessions where “I have a save code” worked, per day. A day with fewer than 5 shows a dashed stub and “<5”." empty={empty}
  emptyText="No save-code restores in this range yet."
  table={{columns:['Day','Restored','Restore failed','Codes made','Welcome back (code already here)','Saving break shown'],rows:(o?.daily||[]).map(r=>[day(r.day),show(r.restored),show(r.restoreFails),show(r.created),show(r.returning),show(r.breaks)])}}>
  <DayColumns rows={rows} unit="restores" ariaLabel="Restores on a new device per day"/>
  {o&&<p className={styles.note}>In this range: <b>{show(o.current.steps['st:restored'])}</b> restored, <b>{show(o.current.steps['st:restore_fail'])}</b> sessions with a failed try (wrong code, offline or too many tries).</p>}
 </ChartCard>;
}

type Level='good'|'warning'|'critical';
const STATUS_TEXT:Record<Level,string>={good:'OK',warning:'Watch',critical:'Act'};
const STATUS_ICON:Record<Level,string>={good:'✓',warning:'!',critical:'×'};
function Status({level}:{level:Level}){return <><span className={styles.statusIcon} data-s={level} aria-hidden="true">{STATUS_ICON[level]}</span><b>{STATUS_TEXT[level]}</b></>;}

/** Save health: rate limits and the breaker (last 24 h of throttle counters), the saving-break card and failed restores (range). */
export function SaveHealthCard({report}:{report:Report}){
 const d=saveData(report),o=report.overview,t=d?.throttle;
 const lvl=(n:number,warn:number,crit:number):Level=>n>=crit?'critical':n>=warn?'warning':'good';
 const rows:[string,string,Level|null,string][]=[
  ...(t?[
   ['Failed code tries, last 24 h',fmtInt(t.failed_tries),lvl(t.failed_tries,1000,5000),'wrong or unknown codes site-wide (the breaker trips at 500 in one hour)'] as [string,string,Level,string],
   ['IP buckets locked, last 24 h',fmtInt(t.ip_locks),lvl(t.ip_locks,5,50),'hit 10 failed tries in 10 minutes'] as [string,string,Level,string],
   ['Hours over the breaker',fmtInt(t.breaker_hours),lvl(t.breaker_hours,1,3),'restore switched to “ask a grown-up”'] as [string,string,Level,string],
   ['Hours at the hard stop',fmtInt(t.hard_stop_hours),lvl(t.hard_stop_hours,1,1),'no lookups at all'] as [string,string,Level,string],
   ['Create caps hit, last 24 h',fmtInt(t.create_cap_ip+t.create_cap_day),lvl(t.create_cap_ip+t.create_cap_day,1,t.create_cap_day?1:10),`${fmtInt(t.create_cap_ip)} IP bucket-hours over 60 · ${t.create_cap_day?'site-wide day cap (2,000) hit':'site-wide day cap not hit'} · ${fmtInt(t.creates)} create calls`] as [string,string,Level,string],
   ['Email caps hit, last 24 h',fmtInt(t.mail_cap_ip+t.mail_cap_day),lvl(t.mail_cap_ip+t.mail_cap_day,1,t.mail_cap_day?1:10),'grown-up emails: 3 per IP an hour, 300 a day'] as [string,string,Level,string],
  ]:[]),
  ['“Saving is taking a break” shown',o?show(o.current.steps['st:break']):'—',null,'sessions in this range (the title screen could not reach saving)'],
  ['Played on through the break',o?show(o.current.steps['st:play_break']):'—',null,'sessions in this range'],
  ['Restore tries that failed',o?show(o.current.steps['st:restore_fail']):'—',null,'sessions in this range'],
 ];
 return <ChartCard title="Save health" subtitle="Rate limits and the breaker (last 24 hours, from the throttle counters) and the saving-break card (this range)"
  table={{columns:['Measure','Value','Status','What it means'],rows:rows.map(([a,b,l,c])=>[a,b,l?STATUS_TEXT[l]:'—',c])}}>
  {!t&&<p className={styles.note}>Rate-limit numbers: {saveGap(report.saves)}.</p>}
  <div className={styles.tableScroll}><table className={styles.table}>
   <thead><tr><th scope="col">Measure</th><th scope="col">Value</th><th scope="col">Status</th></tr></thead>
   <tbody>{rows.map(([a,b,l,c])=><tr key={a}><th scope="row" style={{fontWeight:400,fontSize:14,color:'inherit'}}>{a}<br/><small className={styles.note}>{c}</small></th><td>{b}</td><td style={{whiteSpace:'nowrap'}}>{l?<Status level={l}/>:'—'}</td></tr>)}</tbody>
  </table></div>
  <p className={styles.note}>The game does not report background sync failures yet; failed tries above include syncs and checks for a code that no longer exists.</p>
 </ChartCard>;
}

/** Storage: snapshot size, total stored, syncs, and the 12-month expiry pipeline. */
export function SaveStorageCard({d,saves}:{d:RawSaveMetrics|null;saves:SaveMetricsReport|null|undefined}){
 return <ChartCard title="Save storage and expiry" subtitle="Snapshot sizes, syncs, and codes the nightly purge deletes after 12 months unused" empty={!d} emptyText={`Save codes: ${saveGap(saves)}.`}
  table={{columns:['Measure','Value'],rows:d?[['Codes stored',fmtInt(d.total)],['Average snapshot',fmtBytes(d.avg_bytes)],['Snapshots in total',fmtBytes(d.total_bytes)],['Table on disk (with indexes)',fmtBytes(d.table_bytes)],
   ['Syncs (saves after the first)',fmtInt(d.syncs)],['Syncs per code',d.total?(d.syncs/d.total).toFixed(1):'—'],['Expiring within 30 days',fmtInt(d.expiring_30)],['Expiring within 90 days',fmtInt(d.expiring_90)],['Unused for 6+ months',fmtInt(d.idle_180)],['Median code age (days)',String(d.median_age_days)]]:[]}}>
  {d&&<dl className={styles.statList}>
   <div><dt>Average snapshot</dt><dd>{fmtBytes(d.avg_bytes)}<small>cap 512 KB</small></dd></div>
   <div><dt>Storage used</dt><dd>{fmtBytes(d.table_bytes??d.total_bytes)}<small>{d.table_bytes===null?'snapshots (local preview)':`table + indexes · snapshots ${fmtBytes(d.total_bytes)}`}</small></dd></div>
   <div><dt>Syncs</dt><dd>{fmtInt(d.syncs)}<small>{d.total?(d.syncs/d.total).toFixed(1):'0'} per code</small></dd></div>
   <div><dt>Median code age</dt><dd>{days(d.median_age_days)}<small>since it was made</small></dd></div>
   <div><dt>Expiring in 30 days</dt><dd>{fmtInt(d.expiring_30)}<small>90 days: {fmtInt(d.expiring_90)}</small></dd></div>
   <div><dt>Unused 6+ months</dt><dd>{fmtInt(d.idle_180)}<small>deleted at 12 months unless used</small></dd></div>
  </dl>}
 </ChartCard>;
}
