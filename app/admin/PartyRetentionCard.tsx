'use client';
/**
 * "Friends & coming back" (Oct 22 2026, Phase C of docs/analytics-multiplayer-plan.md §6): do players who play with friends come
 * back more (D1 / D7, party vs solo), how many new players arrive through an invite vs on their own, new players per hosted
 * party, and the weekly reach kept for sponsors. Data: /api/admin/party-retention (lib/analytics/partyRetention.ts), aggregates
 * only; a number resting on fewer than 10 players shows as "<10".
 *
 * HIDDEN unless the build sets NEXT_PUBLIC_ANALYTICS_PARTY_RETENTION=1 (legal sign-off first), and then it fetches nothing until
 * it renders. Types only from the server module (no server code in the client bundle).
 */
import {useEffect,useState} from 'react';
import type {PartyRetention,RetentionGroup} from '@/lib/analytics/partyRetention';
import {fmtInt,fmtPct} from './charts';
import styles from './admin.module.css';

const MIGRATION='20261022_analytics_party_retention.sql';
export const partyRetentionCardOn=()=>process.env.NEXT_PUBLIC_ANALYTICS_PARTY_RETENTION==='1';
const n=(v:number|null)=>v===null?'<10':fmtInt(v);
const rate=(v:number|null)=>v===null?'—':fmtPct(v);

function Group({label,g}:{label:string;g:RetentionGroup}){
 return <div data-retention-group={label}><span>{label}</span><b>{rate(g.d1Rate)} <small>next day</small></b>
  <small>{rate(g.d7Rate)} back within 7 days</small>
  <small>{n(g.players)} players · {n(g.d1Eligible)} / {n(g.d7Eligible)} with a finished D1 / D7 window</small></div>;
}

/** The card for a loaded answer (also the fixture render in tests/admin-party-retention.cjs). */
export function PartyRetentionView({data}:{data:PartyRetention|null}){
 const head=<div className={styles.sectionHead}>
  <h2 id="retention-heading">Friends &amp; coming back</h2>
  <p>Do players who play with friends come back more often, and how many new players arrive through an invite? Rates over the last
   14 days only, for players whose first day here in the range has a finished return window. Totals and rates only: never who played
   with whom. A number resting on fewer than 10 players shows as “&lt;10”.</p>
 </div>;
 if(!data||data.status!=='ok'){
  const why=!data?'Loading…':data.status==='needs-migration'||data.status==='not-configured'
   ?<>Not available yet: run <code>{MIGRATION}</code> in Supabase (see “Supabase steps for the owner” in docs/analytics-multiplayer-plan.md).</>
   :data.status==='off'?'Not available yet: switched off until the legal sign-off.':'Not available yet: the report could not be read. Try again in a minute.';
  return <section className={styles.island} aria-labelledby="retention-heading" data-party-retention data-status={data?.status??'loading'}>{head}
   <p className={styles.banner} role="note">{why}</p></section>;
 }
 const {groups,newPlayers:np,virality:v}=data;
 const invShare=np.invited!==null&&np.sessions?np.invited/np.sessions:null;
 return <section className={styles.island} aria-labelledby="retention-heading" data-party-retention data-status="ok">
  {head}
  <div className={styles.startTiles} aria-label="Coming back: party vs solo">
   <Group label="Played in a party" g={groups.party}/>
   <Group label="Played solo" g={groups.solo}/>
   <div data-retention-new><span>New players</span><b>{n(np.sessions)}</b>
    <small>{n(np.invited)} invited ({invShare===null?'—':fmtPct(invShare)}) · {n(np.organic)} on their own</small></div>
   <div data-retention-k><span>New players per party</span><b>{v.k===null?'—':v.k.toFixed(2)}</b>
    <small>{n(v.guestNew)} new guests / {n(v.created)} parties started</small></div>
  </div>
  {data.weekly.length>0&&<div className={styles.tile} data-retention-weekly>
   <span>Weekly reach (kept for sponsor reports)</span>
   <table className={styles.note} style={{width:'100%',textAlign:'left'}}><thead><tr><th>Week of</th><th>Players</th><th>In a party</th><th>Minutes</th></tr></thead>
    <tbody>{data.weekly.map(w=><tr key={w.weekStart}><td>{w.weekStart}</td><td>{n(w.players)}</td><td>{n(w.partyPlayers)}</td><td>{n(w.minutes)}</td></tr>)}</tbody></table>
   <small>Rounded: nearest 10 under 1,000, else nearest 100.</small>
  </div>}
  <p className={styles.note}>Last finished day counted: {data.lastCompleteDay}. D1 = played again the next day; D7 = played again within 7 days.
   The group is set by the player’s first day in the range (a party that day, or not).</p>
 </section>;
}

/** Mounted on the Engagement tab. Renders nothing (and fetches nothing) while the Phase C switch is off. */
export default function PartyRetentionCard({from,to}:{from:string;to:string}){
 const on=partyRetentionCardOn();
 const [data,setData]=useState<PartyRetention|null>(null);
 useEffect(()=>{
  if(!on)return;
  let live=true;setData(null);
  fetch(`/api/admin/party-retention?from=${from}&to=${to}`,{cache:'no-store'}).then(r=>r.ok?r.json():null)
   .then(j=>{if(live)setData(j??{status:'error'} as PartyRetention);},()=>{if(live)setData({status:'error'} as PartyRetention);});
  return()=>{live=false;};
 },[on,from,to]);
 if(!on)return null;
 return <PartyRetentionView data={data}/>;
}
