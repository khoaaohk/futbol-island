/**
 * Pure, client-safe adapter: the relay's NATIVE `GET /stats` answer ({from,to,days:Record<day,Row>,totals,live:{parties,players}},
 * where a Row is flat `rl:*` counters, see multiplayer/relay/src/relayStatsCore.ts) -> the admin's v:1 shape
 * (lib/analytics/relayStatsTypes.ts). No import from multiplayer/relay: the ids are written out here and a test (admin-analytics-party)
 * feeds a real relayStatsCore fixture through it. Tolerant: an answer already in the admin shape (days is an array) passes through.
 * Only allow-listed `rl:*` ids are read, so nothing else (a code, a name, an address) can reach the report.
 */
const num=(v:unknown)=>typeof v==='number'&&Number.isFinite(v)&&v>0?Math.floor(v):0;
const obj=(v:unknown)=>v&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,unknown>:{};

export function adaptRelayDay(day:string,rowRaw:unknown):Record<string,unknown>{
 const r=obj(rowRaw),g=(id:string)=>num(r['rl:'+id]);
 const pick=(pairs:readonly (readonly [string,string])[])=>Object.fromEntries(pairs.map(([k,id])=>[k,g(id)]));
 return {
  day,roomsCreated:g('created'),roomsEnded:g('ended_host')+g('ended_expired')+g('ended_empty'),
  peakParties:g('live_parties_max'),peakPlayers:g('live_players_max'),
  lenBuckets:pick(['len_5m','len_15m','len_30m','len_60m','len_3h','len_long'].map(k=>[k,k] as const)),
  sizeBuckets:pick(['peak_1','peak_2','peak_3_4','peak_5_8','peak_9_12','peak_13_20'].map(k=>[k,k] as const)),
  connects:g('welcome'),reconnects:g('resume'),
  failedJoins:{not_found:g('fail_not_found'),full:g('fail_full'),expired:g('fail_expired'),locked:g('fail_locked')+g('fail_closed'),
   bad_version:g('err_bad_version'),bad_name:g('fail_bad_name'),rate:g('fail_rate_limited')+g('join_rate')+g('create_rate'),origin:g('origin_refused')},
  kicks:g('kick'),rotations:g('rotate'),locks:g('lock'),rateLimitCloses:g('rate_close'),
  msgsPerPartyBuckets:pick([['lt_1k','msgs_lt_1k'],['k1_10k','msgs_k1_10k'],['k10_50k','msgs_k10_50k'],['k50k_plus','msgs_k50k_plus']]),
  errorsByCode:Object.fromEntries(['bad_message','rate','full','not_found','expired','locked','not_host','bad_version','kicked','bad_name'].map(k=>[k,g('err_'+k)])),
 };
}

/** Relay-native -> admin v:1 (anything else is returned unchanged for the tolerant parser). */
export function adaptRelayNative(raw:unknown,now:number=Date.now()):unknown{
 const o=obj(raw);
 if(!raw||typeof raw!=='object'||Array.isArray(o.days)||!o.days||typeof o.days!=='object')return raw;
 const at=new Date(now).toISOString(),lv=obj(o.live);
 const days=Object.keys(obj(o.days)).sort().map(d=>adaptRelayDay(d,obj(o.days)[d]));
 return {v:1,from:o.from,to:o.to,generatedAt:at,
  live:o.live&&typeof o.live==='object'?{parties:num(lv.parties),players:num(lv.players),at}:null,days};
}
