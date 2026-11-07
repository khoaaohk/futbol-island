'use client';
/**
 * "Live matches" tab (Nov 5 2026): how often players walk up to, join and play the 7v7, futsal, 9v9, 11v11 and beach matches,
 * and for how long. Everything comes from report.liveMatches, built and small-number-suppressed on the server
 * (lib/analytics/liveMatchReport.ts; ids from lib/analytics/liveMatchEvents.ts). Same tiles, cards, bars, line chart and Table
 * twins as the rest of /admin. A "player" here is a tab session (the pipeline's anonymous unit), never a person.
 */
import {useMemo,type CSSProperties} from 'react';
import type {Report} from '@/lib/analytics/core';
import type {Cell} from '@/lib/analytics/learning';
import type {LmFormat,LmRow} from '@/lib/analytics/liveMatchReport';
import {BarList,ChartCard,LineChart,fmtInt,fmtPct,type BarRow} from './charts';
import styles from './admin.module.css';

const EMPTY='No live matches in this range yet. Counting starts with the Nov 5 2026 release; a visit’s numbers arrive when the player leaves the tab, or every few minutes while they play.';
const show=(c:Cell|undefined)=>c===null?'<5':fmtInt(c??0);
const pct=(x:number|null)=>x===null?'—':fmtPct(x);
const num=(x:number|null,d=1)=>x===null?'—':x>=10?fmtInt(x):x.toFixed(d);
/** Seconds as "4 min 05 s" / "1 h 12 min" / "38 s". */
export function fmtSec(s:number|null){if(s===null)return '—';s=Math.round(s);if(s<60)return `${s} s`;if(s<3600)return `${Math.floor(s/60)} min ${String(s%60).padStart(2,'0')} s`;return `${Math.floor(s/3600)} h ${Math.round(s%3600/60)} min`;}
const COLORS=['var(--s1)','var(--s2)','var(--s3)','var(--s4)','var(--a-ink-2)'];

/** One bar per row, summed over the formats (a row is null while any format's cell is suppressed). */
function summed(formats:LmFormat[],pick:(f:LmFormat)=>LmRow[]):BarRow[]{
 const first=formats[0]?pick(formats[0]):[];
 return first.map((r,i)=>{const cells=formats.map(f=>pick(f)[i].value),hid=cells.some(c=>c===null),v=cells.reduce<number>((a,c)=>a+(c??0),0);
  return {key:r.id.replace(/^lm:[^_]+_/,''),label:r.label,value:v,text:hid&&!v?'<5':undefined,detail:hid?'some formats under 5 sessions':undefined};});
}
function BreakdownCard({title,subtitle,formats,pick,unit,wide}:{title:string;subtitle:string;formats:LmFormat[];pick:(f:LmFormat)=>LmRow[];unit:string;wide?:boolean}){
 const rows=summed(formats,pick),first=formats[0]?pick(formats[0]):[];
 return <ChartCard title={title} subtitle={subtitle} wide={wide} empty={!rows.some(r=>r.value||r.text)} emptyText="Nothing yet in this range."
  table={{columns:['',...formats.map(f=>f.label)],rows:first.map((r,i)=>[r.label,...formats.map(f=>show(pick(f)[i].value))])}}>
  <BarList rows={rows} unit={unit} share={false} limit={rows.length}/>
 </ChartCard>;
}

export default function LiveMatchesSection({report,rangeText,dayLabel}:{report:Report;rangeText:string;dayLabel:(day:string)=>string}){
 const r=report.liveMatches;
 const labels=useMemo(()=>(r?.daily??[]).map(d=>dayLabel(d.day)),[r]);// eslint-disable-line react-hooks/exhaustive-deps
 const values=useMemo(()=>Object.fromEntries((r?.formats??[]).map(f=>[f.format,(r?.daily??[]).map(d=>d.joins[f.format]??0)])),[r]);
 const head=<div className={styles.sectionHead}><h2 id="sec-live-matches">Live matches</h2>
  <p>Players walking up to a pitch (its Learn + Play bar appeared), pressing Start to join the match, and how long they played, for {rangeText}.
   A “player” is one browser tab (no person is followed across visits); time is foreground play only, capped at 2 hours a match.
   {' '}{(r?.min??5)>1?<>Counts resting on fewer than {r?.min??5} sessions show as “&lt;5”.</>:'Every count is exact (no small-number hiding).'}</p></div>;
 if(!r||r.status!=='ok')return <section className={styles.island} aria-labelledby="sec-live-matches">{head}
  <p className={styles.empty}>{r?.status==='not_yet'?`Not tracked yet: live match counting starts on ${r.since}.`:EMPTY}</p></section>;
 const t=r.totals,f=r.formats,multi=r.daily.length>1;
 return <section className={styles.island} aria-labelledby="sec-live-matches">{head}
  {r.partial&&<p className={styles.note}>Counting started on {r.since}: days before it in this range have no live match numbers.</p>}
  <div className={`${styles.startTiles} ${styles.lmTiles}`} aria-label="Live matches headline">
   <div><span>Pitch visits</span><b>{show(t.visits)}</b><small>{pct(t.joinRate)} became a match (joins per visit)</small></div>
   <div><span>Matches joined</span><b>{show(t.joins)}</b><small>{num(t.matchesPerWeek)} a week over {r.days} day{r.days===1?'':'s'}</small></div>
   <div><span>Players</span><b>{show(t.players)}</b><small>tabs that joined a match · {pct(t.playShare)} of {fmtInt(r.sessions)} sessions{r.partial?` since ${r.since}`:''}</small></div>
   <div><span>Matches per player</span><b>{num(t.playsPerPlayer)}</b><small>per visit that played</small></div>
   <div><span>Minutes played</span><b>{t.minutes===null?'—':fmtInt(t.minutes)}</b><small>{t.minutesPerWeek===null?'':`${fmtInt(t.minutesPerWeek)} a week`}</small></div>
   <div><span>Average match</span><b>{fmtSec(t.avgSec)}</b><small>median about {fmtSec(t.medianSec)}</small></div>
  </div>

  <ChartCard wide title="By format" subtitle="Visits, joins, players and time for each pitch (the Table button shows the same numbers as a plain table)"
   table={{columns:['Format','Pitch visits','Joins','Join rate','Players','Matches per player','Minutes','Average','Median','Longest band','With friends'],
    rows:f.map(x=>[x.label,show(x.visits),show(x.joins),pct(x.joinRate),show(x.players),num(x.playsPerPlayer),x.minutes===null?'<5':fmtInt(x.minutes),fmtSec(x.avgSec),fmtSec(x.medianSec),x.longestBand??'—',pct(x.sharedRate)])}}>
   <div className={styles.lmFormats}>
    {f.map(x=><div key={x.format} data-format={x.format}>
     <span>{x.label}</span><b>{show(x.joins)}</b><small>joins from {show(x.visits)} visits · {pct(x.joinRate)}</small>
     <dl>
      <div><dt>Players</dt><dd>{show(x.players)}</dd></div>
      <div><dt>Per player</dt><dd>{num(x.playsPerPlayer)}</dd></div>
      <div><dt>Minutes</dt><dd>{x.minutes===null?'<5':fmtInt(x.minutes)}</dd></div>
      <div><dt>Average</dt><dd>{fmtSec(x.avgSec)}</dd></div>
      <div><dt>Median</dt><dd>{fmtSec(x.medianSec)}</dd></div>
      <div><dt>Longest</dt><dd>{x.longestBand??'—'}</dd></div>
     </dl>
    </div>)}
   </div>
  </ChartCard>

  <ChartCard wide title="Matches by day" subtitle="Matches joined each day, per format (the table also has the minutes played)" empty={!r.daily.some(d=>d.allJoins)}
   table={{columns:['Day',...f.map(x=>`${x.label} joins`),...f.map(x=>`${x.label} min`),'Pitch visits'],rows:r.daily.map((d,i)=>[labels[i],...f.map(x=>show(d.joins[x.format])),...f.map(x=>show(d.minutes[x.format])),d.visits])}}>
   <ul className={styles.legend}>{f.map((x,i)=><li key={x.format}><i style={{'--key':COLORS[i]} as CSSProperties}/>{x.label}</li>)}</ul>
   {multi?<LineChart labels={labels} values={values} ariaLabel={`Live matches joined per day by format, ${rangeText}`} series={f.map((x,i)=>({key:x.format,label:x.label,color:COLORS[i]}))}/>
    :<BarList rows={f.map(x=>({key:x.format,label:x.label,value:r.daily[0]?.joins[x.format]??0}))} unit="matches" share={false} limit={5}/>}
  </ChartCard>

  <ChartCard wide title="Goals, replays and who was on" subtitle={`Goals in the matches while the player was on (for and against their side), goal replays shown and skipped, and the AI and human players on the match when they joined. Counting began ${t.extrasSince}; joins before it have no slot numbers.`}
   empty={![t.goalsFor,t.goalsAgainst,t.replays,t.botSlots,t.humanSlots].some(v=>v)} emptyText={`Not tracked before ${t.extrasSince}: no goals, replays or slots in this range yet.`}
   table={{columns:['Format','Goals for','Goals against','Replays shown','Replays skipped','AI players per join','Humans per join'],
    rows:[...f.map(x=>[x.label,show(x.goalsFor),show(x.goalsAgainst),show(x.replays),show(x.replaySkips),num(x.botsPerJoin),num(x.humansPerJoin)]),['All formats',show(t.goalsFor),show(t.goalsAgainst),show(t.replays),show(t.replaySkips),num(t.botsPerJoin),num(t.humansPerJoin)]]}}>
   <div className={styles.lmFormats} data-metric="matches.goals_replays_slots">
    {f.map(x=><div key={x.format} data-format={x.format}>
     <span>{x.label}</span><b>{show(x.goalsFor===null||x.goalsAgainst===null?null:(x.goalsFor??0)+(x.goalsAgainst??0))}</b><small>goals while on</small>
     <dl>
      <div><dt>For / against</dt><dd>{show(x.goalsFor)} / {show(x.goalsAgainst)}</dd></div>
      <div><dt>Replays shown</dt><dd>{show(x.replays)}</dd></div>
      <div><dt>Skipped</dt><dd>{show(x.replaySkips)}</dd></div>
      <div><dt>AI per join</dt><dd>{num(x.botsPerJoin)}</dd></div>
      <div><dt>Humans per join</dt><dd>{num(x.humansPerJoin)}</dd></div>
     </dl>
    </div>)}
   </div>
  </ChartCard>

  <div className={styles.grid}>
   <ChartCard title="How often" subtitle="Visits (tabs) that played 1+, 3+ or 10+ live matches" empty={!t.reach.some(x=>x.value!==0)} emptyText="Nothing yet in this range."
    table={{columns:['Matches in a visit','Visits'],rows:t.reach.map(x=>[x.label,show(x.value)])}}>
    <BarList rows={t.reach.map(x=>({key:x.id,label:x.label,value:x.value??0,text:x.value===null?'<5':undefined}))} unit="visits" share={false} limit={3}/>
   </ChartCard>
   <BreakdownCard title="Match length" subtitle="Finished matches by how long they were played (all formats; the table splits them)" formats={f} pick={x=>x.len} unit="matches"/>
   <BreakdownCard title="Position picked" subtitle="The role taken at Start: keeper, defender, midfield or forward" formats={f} pick={x=>x.roles} unit="joins"/>
   <BreakdownCard title="With friends" subtitle="Other people on the same match at its busiest (a number, never who)" formats={f} pick={x=>x.with} unit="matches"/>
   <BreakdownCard title="How matches ended" subtitle="Leave or Esc, pulled off by the game, or the tab closed mid-match" formats={f} pick={x=>x.ends} unit="matches" wide/>
  </div>
 </section>;
}
