/**
 * The party relay's `GET /stats` payload (Oct 22 2026, Phase B of docs/analytics-multiplayer-plan.md §7): the CONTRACT between the
 * relay (multiplayer/relay, its RelayStats Durable Object) and the admin (lib/analytics/relayStatsAdmin.ts, the "Health" block in
 * app/admin/FriendsSection.tsx and "Parties now" in app/admin/LivePanel.tsx). Pure and client-safe: types, the fixed bucket lists,
 * a tolerant parser (unknown keys dropped, missing numbers = 0) and a fixture. tests/admin-analytics-party.cjs keeps the error codes
 * in step with multiplayer/protocol/types.ts ErrorCode and the size / length bands in step with the client's (countIds.ts).
 *
 * Privacy: daily totals and fixed bands only. Never a party code, a name, a member id, a token, a host key or a network address,
 * and nothing per party (a party adds one increment to each band when it ends).
 *
 * Request: GET {RELAY_STATS_URL}?from=YYYY-MM-DD&to=YYYY-MM-DD with `Authorization: Bearer {RELAY_STATS_TOKEN}` (server only).
 * Response (JSON, v=1):
 *   {v:1, from, to, generatedAt: ISO time,
 *    live: {parties, players, at: ISO time} | null,          // the gauge now (null when the relay does not know)
 *    days: [{day, roomsCreated, roomsEnded, peakParties, peakPlayers,
 *            lenBuckets:{len_5m..len_long}, sizeBuckets:{peak_1..peak_13_20},
 *            connects, reconnects, failedJoins:{not_found, full, expired, locked, bad_version, bad_name, rate, origin},
 *            kicks, rotations, locks, rateLimitCloses, msgsPerPartyBuckets:{lt_1k, k1_10k, k10_50k, k50k_plus},
 *            errorsByCode:{bad_message, rate, full, not_found, expired, locked, not_host, bad_version, kicked, bad_name}}]}
 * Days are UTC days (the relay's clock). peakParties / peakPlayers are that day's highest live gauge.
 */
export const RELAY_STATS_VERSION=1;
/** Party length bands (the client's PARTY_LEN_BUCKETS ids, so relay and client numbers line up). */
export const RELAY_LEN_BUCKETS=['len_5m','len_15m','len_30m','len_60m','len_3h','len_long'] as const;
/** Party size bands: the most players at once (the client's PARTY_PEAK_BUCKETS ids). */
export const RELAY_SIZE_BUCKETS=['peak_1','peak_2','peak_3_4','peak_5_8','peak_9_12','peak_13_20'] as const;
/** Inbound messages per party (cost watch). */
export const RELAY_MSG_BUCKETS=[['lt_1k','Under 1,000'],['k1_10k','1,000–10,000'],['k10_50k','10,000–50,000'],['k50k_plus','50,000 or more']] as const;
/** Every protocol ErrorCode, snake_case (multiplayer/protocol/types.ts ErrorCode: BadMessage → bad_message …; a test checks). */
export const RELAY_ERROR_CODES=['bad_message','rate','full','not_found','expired','locked','not_host','bad_version','kicked','bad_name'] as const;
/** Why a join failed at the relay (`origin` = the worker refused the page's origin). */
export const RELAY_JOIN_FAILS=[['not_found','Code not found'],['full','Party full'],['expired','Code expired'],['locked','Party closed'],
 ['bad_version','Old game version'],['bad_name','Name refused'],['rate','Too many tries'],['origin','Unknown site']] as const;

export type RelayLenBucket=typeof RELAY_LEN_BUCKETS[number];
export type RelaySizeBucket=typeof RELAY_SIZE_BUCKETS[number];
export type RelayMsgBucket=typeof RELAY_MSG_BUCKETS[number][0];
export type RelayErrorCode=typeof RELAY_ERROR_CODES[number];
export type RelayJoinFail=typeof RELAY_JOIN_FAILS[number][0];

export type RelayDayTotals={
 day:string;
 roomsCreated:number;roomsEnded:number;
 /** That day's highest number of live parties / players in parties at once. */
 peakParties:number;peakPlayers:number;
 lenBuckets:Record<RelayLenBucket,number>;sizeBuckets:Record<RelaySizeBucket,number>;
 /** Sockets that joined a party (welcome), and reconnects within the resume window. */
 connects:number;reconnects:number;
 failedJoins:Record<RelayJoinFail,number>;
 kicks:number;rotations:number;locks:number;
 /** Sockets closed for sending too fast. */
 rateLimitCloses:number;
 msgsPerPartyBuckets:Record<RelayMsgBucket,number>;
 errorsByCode:Record<RelayErrorCode,number>;
};
export type RelayStatsPayload={v:number;from:string;to:string;generatedAt:string;live:{parties:number;players:number;at:string}|null;days:RelayDayTotals[]};

/** What the admin route returns: the payload plus where it came from. */
export type RelayStatsStatus='ok'|'not-configured'|'unauthorized'|'error';
export type RelayStatsReport={status:RelayStatsStatus;from:string;to:string;generatedAt:string;live:RelayStatsPayload['live'];days:RelayDayTotals[];totals:RelayDayTotals|null};

const num=(v:unknown)=>typeof v==='number'&&Number.isFinite(v)&&v>=0?Math.floor(v):0;
const obj=(v:unknown)=>v&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,unknown>:{};
const DAY_RE=/^\d{4}-\d{2}-\d{2}$/;
function rec<K extends string>(keys:readonly K[],raw:unknown):Record<K,number>{const o=obj(raw);return Object.fromEntries(keys.map(k=>[k,num(o[k])])) as Record<K,number>;}
const keysOf=<T extends readonly (readonly [string,string])[]>(l:T)=>l.map(([k])=>k) as T[number][0][];

/** An all-zero day. */
export function emptyRelayDay(day:string):RelayDayTotals{return shapeRelayDay({day});}
/** One day from the relay, tolerant: unknown keys are dropped (so no code or name can pass through), missing numbers are 0. */
export function shapeRelayDay(raw:unknown):RelayDayTotals{
 const o=obj(raw);
 return {day:typeof o.day==='string'&&DAY_RE.test(o.day)?o.day:'',roomsCreated:num(o.roomsCreated),roomsEnded:num(o.roomsEnded),peakParties:num(o.peakParties),peakPlayers:num(o.peakPlayers),
  lenBuckets:rec(RELAY_LEN_BUCKETS,o.lenBuckets),sizeBuckets:rec(RELAY_SIZE_BUCKETS,o.sizeBuckets),connects:num(o.connects),reconnects:num(o.reconnects),
  failedJoins:rec(keysOf(RELAY_JOIN_FAILS),o.failedJoins),kicks:num(o.kicks),rotations:num(o.rotations),locks:num(o.locks),rateLimitCloses:num(o.rateLimitCloses),
  msgsPerPartyBuckets:rec(keysOf(RELAY_MSG_BUCKETS),o.msgsPerPartyBuckets),errorsByCode:rec(RELAY_ERROR_CODES,o.errorsByCode)};
}
/** The range's totals: sums, except the peaks, which are the highest day. */
export function sumRelayDays(days:RelayDayTotals[]):RelayDayTotals|null{
 if(!days.length)return null;
 const out=emptyRelayDay('');out.day=days.length===1?days[0].day:`${days[0].day}..${days[days.length-1].day}`;
 for(const d of days){
  for(const k of ['roomsCreated','roomsEnded','connects','reconnects','kicks','rotations','locks','rateLimitCloses'] as const)out[k]+=d[k];
  out.peakParties=Math.max(out.peakParties,d.peakParties);out.peakPlayers=Math.max(out.peakPlayers,d.peakPlayers);
  for(const k of ['lenBuckets','sizeBuckets','failedJoins','msgsPerPartyBuckets','errorsByCode'] as const){const t=out[k] as Record<string,number>,s=d[k] as Record<string,number>;for(const b of Object.keys(t))t[b]+=s[b]||0;}
 }
 return out;
}
/** The whole payload → the admin report (status 'ok'); anything malformed gives an empty, still-'ok' report. */
export function shapeRelayStats(raw:unknown,from='',to=''):RelayStatsReport{
 const o=obj(raw),lv=obj(o.live);
 const days=(Array.isArray(o.days)?o.days:[]).map(shapeRelayDay).filter(d=>d.day).sort((a,b)=>a.day.localeCompare(b.day));
 const live=o.live&&typeof o.live==='object'?{parties:num(lv.parties),players:num(lv.players),at:typeof lv.at==='string'?lv.at:''}:null;
 return {status:'ok',from:typeof o.from==='string'&&DAY_RE.test(o.from)?o.from:from,to:typeof o.to==='string'&&DAY_RE.test(o.to)?o.to:to,
  generatedAt:typeof o.generatedAt==='string'?o.generatedAt:new Date(0).toISOString(),live,days,totals:sumRelayDays(days)};
}
export const emptyRelayStats=(status:RelayStatsStatus,from='',to=''):RelayStatsReport=>({status,from,to,generatedAt:new Date(0).toISOString(),live:null,days:[],totals:null});

/** Derived health numbers for the admin (null when there is nothing to divide by). */
export function relayHealth(t:RelayDayTotals){
 const failed=Object.values(t.failedJoins).reduce((a,b)=>a+b,0),parties=t.roomsEnded||t.roomsCreated;
 const sized=Object.values(t.sizeBuckets).reduce((a,b)=>a+b,0);
 const MID:Record<RelaySizeBucket,number>={peak_1:1,peak_2:2,peak_3_4:3.5,peak_5_8:6.5,peak_9_12:10.5,peak_13_20:16.5};
 return {
  connectSuccess:t.connects+failed>0?t.connects/(t.connects+failed):null,failed,
  kicksPerParty:parties?t.kicks/parties:null,rotationsPerParty:parties?t.rotations/parties:null,
  avgSize:sized?RELAY_SIZE_BUCKETS.reduce((a,b)=>a+t.sizeBuckets[b]*MID[b],0)/sized:null,sizedParties:sized,
 };
}

/** A fixture in the exact shape the relay sends (tests, the admin preview without a relay). */
export function relayStatsFixture(from='2026-10-19',days=7):RelayStatsPayload{
 const list:RelayDayTotals[]=[];
 for(let i=0;i<days;i++){
  const day=new Date(Date.parse(from+'T12:00:00Z')+i*86_400_000).toISOString().slice(0,10),k=i+1;
  list.push({day,roomsCreated:40+k*3,roomsEnded:38+k*3,peakParties:6+k,peakPlayers:18+k*2,
   lenBuckets:{len_5m:8,len_15m:12+k,len_30m:9,len_60m:5,len_3h:3,len_long:1},sizeBuckets:{peak_1:6,peak_2:14+k,peak_3_4:10,peak_5_8:6,peak_9_12:2,peak_13_20:0},
   connects:120+k*8,reconnects:14,failedJoins:{not_found:5,full:1,expired:2,locked:1,bad_version:0,bad_name:1,rate:0,origin:0},
   kicks:2,rotations:3,locks:4,rateLimitCloses:0,msgsPerPartyBuckets:{lt_1k:10,k1_10k:20+k,k10_50k:7,k50k_plus:1},
   errorsByCode:{bad_message:0,rate:0,full:1,not_found:5,expired:2,locked:1,not_host:0,bad_version:0,kicked:2,bad_name:1}});
 }
 return {v:RELAY_STATS_VERSION,from:list[0]?.day??from,to:list[list.length-1]?.day??from,generatedAt:'2026-10-25T12:00:00.000Z',live:{parties:7,players:23,at:'2026-10-25T12:00:00.000Z'},days:list};
}
