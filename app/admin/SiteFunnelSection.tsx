'use client';
/**
 * "Site pages to Play" on the Marketing and SEO tabs (Nov 20 2026): one table, a row per public section of the site plus the
 * Coach app and Scan Trainer, answering "do the reading pages bring players?". Everything is report.siteFunnel, built on the
 * server (lib/analytics/siteFunnelReport.ts) with EXACT counts like the rest of these tabs. Totals per section only: never a
 * page, a visitor or search words. Same section head, table and note styles as the rest of /admin.
 */
import type {Report} from '@/lib/analytics/core';
import type {SfRow} from '@/lib/analytics/siteFunnelReport';
import {fmtInt} from './charts';
import styles from './admin.module.css';

const pct=(v:number|null)=>v===null?'—':`${Math.round(v*1000)/10}%`;
const per=(v:number|null)=>v===null?'—':v>=100?fmtInt(Math.round(v)):String(Math.round(v*10)/10);
const COLUMNS=['Section','Views','Play taps','Tap rate','Reached /play','From search','Played','Played per 1,000 views'];

function Line({r,strong}:{r:SfRow;strong?:boolean}){
 const w=strong?{fontWeight:700}:undefined;
 return <tr data-sf-row={r.id} style={w}>
  <th scope="row" style={{fontWeight:strong?700:400,fontSize:14,color:'inherit'}}>{r.label}</th>
  <td data-k="views">{fmtInt(r.views)}</td><td data-k="taps">{fmtInt(r.taps)}</td><td>{pct(r.tapRate)}</td>
  <td data-k="reached">{fmtInt(r.reached)}</td><td data-k="reached-search">{r.reachedSearch===null?'—':fmtInt(r.reachedSearch)}</td>
  <td data-k="played">{fmtInt(r.played)}</td><td>{per(r.playedPer1000)}</td>
 </tr>;
}

export default function SiteFunnelSection({report,rangeText,dayLabel}:{report:Pick<Report,'siteFunnel'>;rangeText:string;dayLabel:(day:string)=>string}){
 const f=report.siteFunnel;
 const head=<div className={styles.sectionHead}><h2 id="sec-sitefunnel">Site pages to Play</h2>
  <p>For {rangeText}: how many times the pages of each part of the site were opened, how many of those views tapped a link to the game, how many
   tabs then arrived at /play, and how many really played (pressed Play on the title screen and entered the game). Every number is exact
   and is a total for the whole section: no page, visitor or search words. Counted since {dayLabel(f?.since??'2026-11-20')}.</p></div>;
 if(!f||!f.hasData)return <section className={styles.island} aria-labelledby="sec-sitefunnel" data-site-funnel>{head}
  <p className={styles.empty}>No view of a site page counted in this range yet. These totals start with the Nov 20 2026 release; a count comes in when the visitor leaves the tab, or every few minutes.</p></section>;
 return <section className={styles.island} aria-labelledby="sec-sitefunnel" data-site-funnel>
  {head}
  <div className={`${styles.card} ${styles.wide}`}>
   <div className={styles.tableScroll} style={{maxHeight:'none'}}><table className={styles.table}>
    <thead><tr>{COLUMNS.map(c=><th key={c} scope="col">{c}</th>)}</tr></thead>
    <tbody>{f.rows.map(r=><Line key={r.id} r={r}/>)}</tbody>
    <tfoot><Line r={f.total} strong/><Line r={f.home}/></tfoot>
   </table></div>
   <p className={styles.note}>Sorted by views. Tap rate = Play taps ÷ views (one tap counted per view at most). “Reached /play” counts a tab that arrived within
    10 minutes of its tap; “Played” is that tab entering the game, once per tab. “From search” is the part of “Reached /play” whose visit began on a
    search engine or AI assistant; it is a lowest figure, because a page reload forgets where the visit began. Spanish pages count with their English
    section. The home page row is its own funnel from the Marketing page section above and is not in the total. Each day’s raw totals are in the header’s
    Export (daily CSV, counters named sf:).</p>
  </div>
 </section>;
}
