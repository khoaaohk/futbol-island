'use client';
/**
 * The Overview's comprehensive export (Nov 6 2026): a date range and four downloads from /api/admin/export (the daily data
 * layer, lib/analytics/daily.ts; files: lib/analytics/exportCsv.ts). Plain links, so the browser saves the file itself; the
 * admin cookie goes with them. Exact numbers (no "<5"): owner decision for the admin-only export.
 */
import {useEffect,useState} from 'react';
import styles from './admin.module.css';
import s from './ExportControl.module.css';

const FILES=[
 {kind:'summary',label:'Summary CSV',hint:'One row per metric, its window and the period before'},
 {kind:'daily',label:'Daily CSV',hint:'Every metric, every day (date, section, metric, part, value …)'},
 {kind:'definitions',label:'Definitions CSV',hint:'How each number is counted, and the gaps'},
 {kind:'zip',label:'All files (ZIP)',hint:'The three files plus hours of the day'},
] as const;

export default function ExportControl({from,to,today}:{from:string;to:string;today:string}){
 const [a,setA]=useState(from),[b,setB]=useState(to);
 useEffect(()=>{setA(from);setB(to);},[from,to]);
 const lo=a<=b?a:b,hi=a<=b?b:a,valid=/^\d{4}-\d{2}-\d{2}$/.test(lo)&&/^\d{4}-\d{2}-\d{2}$/.test(hi);
 const href=(kind:string)=>`/api/admin/export?kind=${kind}&from=${lo}&to=${hi}`;
 return <section className={s.root} aria-labelledby="export-title">
  <div className={s.text}><h3 id="export-title">Export</h3>
   <p>Exact numbers for any range, per Pacific day. Days before a number was tracked are left empty, not 0.</p></div>
  <div className={`${styles.custom} ${s.range}`} role="group" aria-label="Export range">
   <label>From<input type="date" value={a} min="2026-10-07" max={today} onChange={e=>setA(e.target.value)} data-export-from/></label>
   <label>To<input type="date" value={b} min="2026-10-07" max={today} onChange={e=>setB(e.target.value)} data-export-to/></label>
  </div>
  <ul className={s.files}>
   {FILES.map(f=><li key={f.kind}>
    <a className={`${styles.secondary} ${s.btn}`} href={valid?href(f.kind):undefined} aria-disabled={!valid} download data-export={f.kind}>{f.label}</a>
    <small>{f.hint}</small></li>)}
  </ul>
 </section>;
}
