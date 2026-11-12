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
import {publicWorldEnabled} from '@/lib/multiplayer/publicFlag';
import type {PublicWorldStatus} from '@/lib/analytics/publicWorldAdmin';

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

/** Nov 11 2026: the public island's block sits above the party health, and only when its build flag is on (inert otherwise). */
export default function RelayHealth(props:{from:string;to:string;initial?:RelayStatsReport|null;publicInitial?:PublicWorldStatus|null}){
 return <>{publicWorldEnabled()||props.publicInitial?<PublicWorldHealth initial={props.publicInitial}/>:null}<PartyHealth {...props}/></>;
}

function PartyHealth({from,to,initial}:{from:string;to:string;initial?:RelayStatsReport|null}){
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

/**
 * Public island health (Nov 11 2026, phase 1): worlds open, players in public now, today's reports by reason, quarantines, and the
 * open / closed state with the owner's kill switch. One fetch when shown (GET /api/admin/public-world); the button POSTs there and
 * the server forwards it to the relay's /control with its CONTROL_TOKEN (server env RELAY_CONTROL_TOKEN). Counts only.
 */
const PUB_REPORT_LABEL:Record<string,string>={following:'Following',inmyway:'In my way',waves:'Too many waves',other:'Something else'};
export const PUBLIC_STATUS_TEXT:Record<string,string>={
 'not-configured':'Public island stats not configured: the server needs the relay stats address and token (see docs/multiplayer/PUBLIC-OWNER-STEPS.md).',
 unauthorized:'The relay refused the stats token.',
 error:'Could not reach the relay. Try again in a minute.',
};
export function PublicWorldHealth({initial}:{initial?:PublicWorldStatus|null}){
 const [d,setD]=useState<PublicWorldStatus|null>(initial??null);
 const [busy,setBusy]=useState(false),[msg,setMsg]=useState('');
 useEffect(()=>{
  if(initial)return;let live=true;
  fetch('/api/admin/public-world',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(j=>{if(live&&j&&j.status)setD(j as PublicWorldStatus);}).catch(()=>{});
  return()=>{live=false;};
 },[initial]);
 const flip=async(open:boolean)=>{
  if(!open&&!window.confirm('Close public islands now? Everyone in one falls back to playing on their own.'))return;
  setBusy(true);setMsg('');
  try{
   const r=await fetch('/api/admin/public-world',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({public:open})});
   const j=await r.json().catch(()=>null) as {ok?:boolean;status?:string;open?:boolean|null}|null;
   if(j?.ok){setD(x=>x?{...x,open:j.open??open}:x);setMsg(open?'Public islands are open.':'Public islands are closed.');}
   else setMsg(j?.status==='not-configured'?'Kill switch not configured: set RELAY_CONTROL_TOKEN on the server.':j?.status==='unauthorized'?'The relay refused the control token.':'The relay did not answer. Try again.');
  }catch{setMsg('The relay did not answer. Try again.');}
  setBusy(false);
 };
 const head=<div className={styles.sectionHead}><h3 id="public-world-heading">Public island (other players)</h3>
  <p>Live from the relay, today (UTC){d?.day?` ${d.day}`:''}. Counts only: never a name, a made-up name or an address.</p></div>;
 if(!d)return <div data-public-world data-status="loading" aria-labelledby="public-world-heading">{head}<p className={styles.note}>Loading…</p></div>;
 if(d.status!=='ok')return <div data-public-world data-status={d.status} aria-labelledby="public-world-heading">{head}<p className={styles.note} role="note">{PUBLIC_STATUS_TEXT[d.status]??PUBLIC_STATUS_TEXT.error}</p></div>;
 const v=(x:number|null)=>x===null?'—':fmtInt(x),total=d.reports?Object.values(d.reports).reduce((a,b)=>a+b,0):null;
 const state=d.open===null?'Not reported':d.open?'Open':'Closed';
 return <div data-public-world data-status="ok" aria-labelledby="public-world-heading">{head}
  <div className={styles.startTiles} aria-label="Public island health">
   <div><span>Public islands</span><b data-public-open={String(d.open)}>{state}</b><small>{v(d.worlds)} worlds open now</small></div>
   <div><span>Players in public now</span><b>{v(d.players)}</b><small>across every shared island</small></div>
   <div><span>Reports today</span><b>{v(total)}</b><small>{d.reports?Object.entries(d.reports).map(([k,n])=>`${PUB_REPORT_LABEL[k]??k} ${fmtInt(n)}`).join(' · '):'not reported by the relay yet'}</small></div>
   <div><span>Quarantines today</span><b>{v(d.quarantines)}</b><small>players hidden from everyone after 2+ reports</small></div>
  </div>
  <p className={styles.note}>
   {d.canControl?<>
    {d.open!==false&&<button type="button" className={styles.secondary} disabled={busy} data-public-close onClick={()=>flip(false)}>Close public islands</button>}
    {d.open!==true&&<button type="button" className={styles.primary} disabled={busy} data-public-open-btn onClick={()=>flip(true)}>Open public islands</button>}
   </>:'Kill switch not configured: set RELAY_CONTROL_TOKEN on the server.'}
   {msg?<> <span role="status">{msg}</span></>:null}
  </p>
 </div>;
}
