'use client';
/**
 * "Public island: with vs without other players" (Nov 12 2026, phase 2): the holdout reading. Built on the server
 * (lib/analytics/holdoutReport.ts) from the range's daily totals; this card only shows it. Rendered only when the report says the
 * reading is on (NEXT_PUBLIC_PUBLIC_HOLDOUT_READING=1, after legal sign-off); off, it renders nothing. Totals only.
 */
import type {HoldoutReport,HoldoutArmRow} from '@/lib/analytics/holdoutReport';
import {fmtInt,fmtPct} from './charts';
import styles from './admin.module.css';

const ARM_LABEL={on:'Started with other players',hold:'Started as Just me (holdout)'} as const;
function Arm({r}:{r:HoldoutArmRow}){
 return <div data-holdout-arm={r.arm}><span>{ARM_LABEL[r.arm]}</span><b>{fmtInt(r.visits)} <small>visits</small></b>
  <small>{r.minutesPerVisit===null?'—':r.minutesPerVisit.toFixed(1)} island min per visit · {r.returningShare===null?'—':fmtPct(r.returningShare)} returning</small></div>;
}
export default function HoldoutCard({h}:{h?:HoldoutReport|null}){
 if(!h||h.status==='off')return null;
 return <section className={styles.island} aria-labelledby="holdout-heading" data-public-holdout data-status={h.status}>
  <div className={styles.sectionHead}><h3 id="holdout-heading">Public island: with and without other players</h3>
   <p>About 1 device in 10 starts as Just me. Each visit counts in the way it started, even after a switch. Totals only.</p></div>
  {h.status==='empty'?<p className={styles.note} role="note">No visits counted in this range yet.</p>:
   <div className={styles.startTiles} aria-label="Holdout arms">
    {h.arms.map(r=><Arm key={r.arm} r={r}/>)}
    <div data-holdout-share><span>Holdout share of visits</span><b>{h.holdShare===null?'—':fmtPct(h.holdShare)}</b><small>expected about 10%</small></div>
   </div>}
 </section>;
}
