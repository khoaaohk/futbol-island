'use client';
/**
 * The party relay's "Health" block in "Friends & parties" (Oct 22 2026, Phase B of docs/analytics-multiplayer-plan.md §7): connect
 * success, failed joins by reason, kicks / new codes / closes per party, messages per party (cost watch), refusals by error code,
 * and the relay's own (authoritative) party size and length bands. One fetch per range from /api/admin/party-stats (the server
 * holds the relay's token and caches 60 s); no polling. "Relay stats not configured" until RELAY_STATS_URL / RELAY_STATS_TOKEN are
 * set on the server. Daily totals only: never a code, a name or an address.
 */
import {useEffect,useState} from 'react';
import {RELAY_ERROR_CODES,RELAY_JOIN_FAILS,RELAY_LEN_BUCKETS,RELAY_MSG_BUCKETS,RELAY_SIZE_BUCKETS,relayHealth,type RelayStatsReport} from '@/lib/analytics/relayStatsTypes';
import {PARTY_LEN_BUCKETS,PARTY_PEAK_BUCKETS} from '@/lib/analytics/countIds';
import {BarList,ChartCard,fmtInt,fmtPct,type BarRow} from './charts';
import styles from './admin.module.css';

const SIZE_LABEL=Object.fromEntries(PARTY_PEAK_BUCKETS) as Record<string,string>,LEN_LABEL=Object.fromEntries(PARTY_LEN_BUCKETS) as Record<string,string>;
const ERR_LABEL:Record<string,string>={bad_message:'Bad message',rate:'Too fast',full:'Party full',not_found:'Code not found',expired:'Code expired',locked:'Party closed',not_host:'Host-only action',bad_version:'Old game version',kicked:'Removed by host',bad_name:'Name refused'};
const rows=(rec:Record<string,number>,keys:readonly string[],label:(k:string)=>string):BarRow[]=>keys.map(k=>({key:k,label:label(k),value:rec[k]||0}));
/** Relay status → the words the admin sees (exported for the tests). */
export const RELAY_STATUS_TEXT:Record<string,string>={
 'not-configured':'Relay stats not configured. Set RELAY_STATS_URL and RELAY_STATS_TOKEN on the server (the relay’s /stats address and its STATS_TOKEN secret).',
 unauthorized:'The relay refused the stats token. Check that RELAY_STATS_TOKEN matches the relay’s STATS_TOKEN secret.',
 error:'Could not reach the relay’s stats. Try again in a minute.',
};

export function useRelayStats(from:string,to:string,initial?:RelayStatsReport|null){
 const [data,setData]=useState<RelayStatsReport|null>(initial??null);
 useEffect(()=>{
  if(initial)return;let live=true;setData(null);
  fetch(`/api/admin/party-stats?from=${from}&to=${to}`,{cache:'no-store'}).then(r=>r.ok?r.json():null)
   .then(j=>{if(live)setData(j&&j.status?j as RelayStatsReport:{status:'error',from,to,generatedAt:'',live:null,days:[],totals:null});})
   .catch(()=>{if(live)setData({status:'error',from,to,generatedAt:'',live:null,days:[],totals:null});});
  return()=>{live=false;};
 },[from,to,initial]);
 return data;
}

export default function RelayHealth({from,to,initial}:{from:string;to:string;initial?:RelayStatsReport|null}){
 const d=useRelayStats(from,to,initial);
 const head=<div className={styles.sectionHead}><h3 id="relay-health-heading">Health (party service)</h3>
  <p>From the party relay itself (authoritative): daily totals for {from===to?from:`${from} to ${to}`} (UTC days). Never a code, a name or an address.</p></div>;
 if(!d)return <div data-relay-health data-status="loading" aria-labelledby="relay-health-heading">{head}<p className={styles.note}>Loading…</p></div>;
 if(d.status!=='ok')return <div data-relay-health data-status={d.status} aria-labelledby="relay-health-heading">{head}<p className={styles.note} role="note">{RELAY_STATUS_TEXT[d.status]??RELAY_STATUS_TEXT.error}</p></div>;
 const t=d.totals;
 if(!t||!t.roomsCreated&&!t.connects)return <div data-relay-health data-status="empty" aria-labelledby="relay-health-heading">{head}<p className={styles.note}>No parties on the relay in this range.</p></div>;
 const h=relayHealth(t),failRows=rows(t.failedJoins,RELAY_JOIN_FAILS.map(([k])=>k),k=>RELAY_JOIN_FAILS.find(([x])=>x===k)![1]);
 return <div data-relay-health data-status="ok" aria-labelledby="relay-health-heading">{head}
  <div className={styles.startTiles} aria-label="Party service health">
   <div><span>Connect success</span><b>{h.connectSuccess===null?'—':fmtPct(h.connectSuccess)}</b><small>{fmtInt(t.connects)} joined · {fmtInt(h.failed)} failed · {fmtInt(t.reconnects)} reconnects</small></div>
   <div><span>Parties (relay)</span><b>{fmtInt(t.roomsCreated)}</b><small>{fmtInt(t.roomsEnded)} ended · peak {fmtInt(t.peakParties)} at once ({fmtInt(t.peakPlayers)} players)</small></div>
   <div><span>Party size (relay)</span><b>{h.avgSize===null?'—':`≈${h.avgSize.toFixed(1)}`}</b><small>over {fmtInt(h.sizedParties)} ended parties</small></div>
   <div><span>Host actions per party</span><b>{h.kicksPerParty===null?'—':h.kicksPerParty.toFixed(2)}</b><small>removals · {h.rotationsPerParty===null?'—':h.rotationsPerParty.toFixed(2)} new codes · {fmtInt(t.locks)} closes · {fmtInt(t.rateLimitCloses)} closed for flooding</small></div>
  </div>
  <div className={styles.grid}>
   <ChartCard title="Failed joins (relay)" subtitle="Why a join did not work, as the relay saw it" table={{columns:['Reason','Times'],rows:failRows.map(r=>[r.label,fmtInt(r.value)])}}>
    <BarList rows={failRows} unit="times" share={false} limit={failRows.length}/>
   </ChartCard>
   <ChartCard title="Refusals by error code" subtitle="Every error the relay sent" table={{columns:['Code','Times'],rows:RELAY_ERROR_CODES.map(k=>[ERR_LABEL[k]??k,fmtInt(t.errorsByCode[k])])}}>
    <BarList rows={rows(t.errorsByCode,RELAY_ERROR_CODES,k=>ERR_LABEL[k]??k)} unit="times" share={false} limit={RELAY_ERROR_CODES.length}/>
   </ChartCard>
   <ChartCard title="Party size (relay)" subtitle="Most players at once, one per ended party" table={{columns:['Size','Parties'],rows:RELAY_SIZE_BUCKETS.map(k=>[SIZE_LABEL[k],fmtInt(t.sizeBuckets[k])])}}>
    <BarList rows={rows(t.sizeBuckets,RELAY_SIZE_BUCKETS,k=>SIZE_LABEL[k])} unit="parties" limit={RELAY_SIZE_BUCKETS.length}/>
   </ChartCard>
   <ChartCard title="Party length (relay)" subtitle="How long each party ran" table={{columns:['Length','Parties'],rows:RELAY_LEN_BUCKETS.map(k=>[LEN_LABEL[k],fmtInt(t.lenBuckets[k])])}}>
    <BarList rows={rows(t.lenBuckets,RELAY_LEN_BUCKETS,k=>LEN_LABEL[k])} unit="parties" limit={RELAY_LEN_BUCKETS.length}/>
   </ChartCard>
   <ChartCard title="Messages per party" subtitle="Cost watch: inbound messages over a party's life" table={{columns:['Messages','Parties'],rows:RELAY_MSG_BUCKETS.map(([k,l])=>[l,fmtInt(t.msgsPerPartyBuckets[k])])}}>
    <BarList rows={RELAY_MSG_BUCKETS.map(([k,l])=>({key:k,label:l,value:t.msgsPerPartyBuckets[k]}))} unit="parties" limit={RELAY_MSG_BUCKETS.length}/>
   </ChartCard>
  </div>
 </div>;
}
