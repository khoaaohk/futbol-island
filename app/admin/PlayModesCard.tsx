'use client';
/**
 * "Players by mode" (Nov 13 2026; owner: the Players and retention tab split by Public / Just me / Party). Players per play mode in
 * the range, with each mode's sessions, minutes and returning share (the share of its sessions marked returning). A session that
 * switched mode counts once per mode it played. Data: /api/admin/play-modes (lib/analytics/playModes.ts), aggregates only, the
 * kept raw rows (14 days). Days before Nov 13 2026 have no mode data: the card says so instead of showing zeros.
 * The existing ChartCard + BarList (no new chart type). Types only from the client-safe module.
 */
import {useEffect,useState} from 'react';
import {MODES_MIGRATION,MODE_SINCE_TEXT,modeCoverage,modeRows,type PlayModes} from '@/lib/analytics/playModes';
import {BarList,ChartCard,fmtInt,fmtPct} from './charts';
import styles from './admin.module.css';

/** The card for a loaded answer (also the fixture render in tests/admin-analytics-modes.cjs). */
export function PlayModesView({from,to,data}:{from:string;to:string;data:PlayModes|null}){
 const cover=modeCoverage(from,to),rows=data&&data.status==='ok'?modeRows(data.totals):[];
 const why=cover==='none'?`${MODE_SINCE_TEXT}.`:!data?'Loading…':data.status==='needs-migration'||data.status==='not-configured'
  ?`Not available yet: run ${MODES_MIGRATION.split('/').pop()} in Supabase.`:data.status!=='ok'?'Could not be read. Try again in a minute.':'No mode data in this range yet.';
 const unknown=data&&data.status==='ok'?data.totals.sessions-data.totals.withMode:0;
 const sub=`Players per play mode, ${from===to?from:`${from} to ${to}`}, with sessions, minutes and the share of sessions that were returning.`
  +(cover==='some'?` ${MODE_SINCE_TEXT}: earlier days are not counted.`:'')+(unknown>0?` ${fmtInt(unknown)} sessions with no mode (older tabs, no beat).`:'');
 return <div data-play-modes data-status={data?.status??'loading'} data-cover={cover}>
  <ChartCard title="Players by mode" subtitle={sub} empty={!rows.length} emptyText={why}
   table={{columns:['Mode','Players','Sessions','Minutes','Returning share'],rows:rows.map(m=>[m.label,m.players,m.sessions,Math.round(m.seconds/60),m.returningShare===null?'—':fmtPct(m.returningShare)])}}>
   <BarList unit="players" share={false} rows={rows.map(m=>({key:m.key,label:m.label,value:m.players,
    detail:`${fmtInt(m.sessions)} sessions · ${fmtInt(Math.round(m.seconds/60))} min · ${m.returningShare===null?'—':fmtPct(m.returningShare)} returning`}))}/>
   <p className={styles.note} data-mode-returning>Returning share: {rows.map(m=>`${m.label} ${m.returningShare===null?'—':fmtPct(m.returningShare)}`).join(' · ')} (of each mode’s sessions).</p>
  </ChartCard>
 </div>;
}

export default function PlayModesCard({from,to}:{from:string;to:string}){
 const [data,setData]=useState<PlayModes|null>(null);
 const none=modeCoverage(from,to)==='none';
 useEffect(()=>{
  if(none)return;
  let live=true;setData(null);
  fetch(`/api/admin/play-modes?from=${from}&to=${to}`,{cache:'no-store'}).then(r=>r.ok?r.json():null)
   .then(j=>{if(live)setData(j??{status:'error'} as PlayModes);},()=>{if(live)setData({status:'error'} as PlayModes);});
  return()=>{live=false;};
 },[from,to,none]);
 return <PlayModesView from={from} to={to} data={data}/>;
}
