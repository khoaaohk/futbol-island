/**
 * The admin "Live matches" tab (Nov 5 2026), built on the SERVER from the range's merged counters (core.ts mergeRollups: counts =
 * totals per id, countSessions = tab sessions with that id ≥ 1) and the daily rollups. Ids: countIds.ts LIVE_MATCH_COUNT_IDS,
 * sent by lib/analytics/liveMatchEvents.ts. Pure and client-safe (app/admin/LiveMatchesSection.tsx imports the types).
 *
 * "Players" are tab sessions (the pipeline's only anonymous unit in the rollups): a session that joined a format at least once.
 * A per-person count over weeks would need the keyed player id joined to match play, which (like the party retention report,
 * Phase C) is not done without a legal sign-off; "how often" is matches per playing session, sessions with 1+ / 3+ / 10+
 * matches and matches per week over the range.
 *
 * Small numbers, like the other gameplay sections (Friends & parties, Fishing): a count resting on fewer than MIN_SESSIONS (5)
 * sessions is sent as null ("<5"); the averages and medians need MIN_MATCHES finished matches. Time is exact to the second
 * (60·min + sec over the finished matches); the median is read inside the length bands (linear within the band holding the
 * middle match), and the longest is the top band reached (a single exact longest match is never sent).
 */
import type {DailyRollup,Merged} from './core';
import {type Cell} from './learning';
/** Exact counts (owner Nov 5 2026: 'dont show <5, show exact'): a count is shown from the first session; set to 5 to hide small numbers again like Fishing / Friends. */
const MIN_SESSIONS=1;
import {LIVE_MATCH_FORMATS,LM_END_REASONS,LM_LEN_BANDS,LM_REACH,LM_ROLES,LM_WITH_BANDS,lmId,type LiveMatchFormat} from './countIds';

export const LM_SINCE='2026-11-05';
/** Goals, replays and slots (LM_MATCH_EVENTS) began on this day. */
export const LM_EXTRAS_SINCE='2026-11-06';
export const MIN_MATCHES=1;
export const LM_FORMAT_LABEL:Record<LiveMatchFormat,string>={'7v7':'7v7','futsal':'Futsal','9v9':'9v9','11v11':'11v11','beach':'Beach soccer','stadium':'Stadium'};
const ROLE_LABEL:Record<string,string>={gk:'Goalkeeper',def:'Defender',mid:'Midfield',fwd:'Forward'};

export type LmRow={id:string;label:string;value:Cell};
export type LmFormat={format:LiveMatchFormat;label:string;
 visits:Cell;visitSessions:Cell;joins:Cell;players:Cell;leaves:Cell;
 /** Joins per pitch visit (can pass 100% when a player rejoins in one visit), and the share of visiting sessions that joined. */
 joinRate:number|null;conversion:number|null;playsPerPlayer:number|null;
 seconds:Cell;minutes:number|null;avgSec:number|null;medianSec:number|null;medianBand:string|null;longestBand:string|null;
 shared:Cell;sharedRate:number|null;
 /** Nov 6 2026 (countIds.ts LM_MATCH_EVENTS): goals for / against the player's side while on, goal replays shown / skipped, AI and
  *  human slots summed over joins (÷ joins = the average match a player stepped into). Exact. */
 goalsFor:Cell;goalsAgainst:Cell;replays:Cell;replaySkips:Cell;botSlots:Cell;humanSlots:Cell;botsPerJoin:number|null;humansPerJoin:number|null;
 roles:LmRow[];len:LmRow[];with:LmRow[];ends:LmRow[]};
export type LmDay={day:string;joins:Record<LiveMatchFormat,Cell>;minutes:Record<LiveMatchFormat,Cell>;visits:number;allJoins:number;allMinutes:number};
export type LiveMatchReport={status:'not_yet'|'empty'|'ok';since:string;partial:boolean;min:number;minMatches:number;hidden:number;days:number;
 sessions:number;formats:LmFormat[];
 totals:{visits:Cell;joins:Cell;players:Cell;minutes:number|null;avgSec:number|null;medianSec:number|null;joinRate:number|null;
  playsPerPlayer:number|null;matchesPerWeek:number|null;minutesPerWeek:number|null;playShare:number|null;reach:LmRow[];
  goalsFor:Cell;goalsAgainst:Cell;replays:Cell;replaySkips:Cell;botSlots:Cell;humanSlots:Cell;botsPerJoin:number|null;humansPerJoin:number|null;
  /** The first day the goal / replay / slot ids were sent (days before cannot be compared). */extrasSince:string};
 daily:LmDay[]};

/** The middle match's length in seconds, read inside the bands (null under MIN_MATCHES matches). Pure (tests). */
export function bandMedian(counts:number[]):number|null{
 const n=counts.reduce((a,b)=>a+b,0);if(n<MIN_MATCHES)return null;
 let before=0;for(let i=0;i<LM_LEN_BANDS.length;i++){const c=counts[i]||0;if(c>0&&before+c>=n/2){const lo=i?LM_LEN_BANDS[i-1][2]:0,hi=LM_LEN_BANDS[i][2];return Math.round(lo+(hi-lo)*Math.max(0,Math.min(1,(n/2-before)/c)));}before+=c;}
 return null;
}
const ratio=(a:Cell|number,b:Cell|number)=>a===null||b===null||!b?null:a/b;
/** A format's match time in whole seconds (60·lm:<f>_min + lm:<f>_sec): the one rule for this tab and the daily layer (daily.ts). */
export const lmSeconds=(c:Record<string,number>,f:LiveMatchFormat)=>(c[lmId(f,'min')]||0)*60+(c[lmId(f,'sec')]||0);

export function buildLiveMatches(m:Pick<Merged,'counts'|'countSessions'|'totals'>,range:{from:string;to:string},rollups:(Pick<DailyRollup,'day'|'counts'|'countSessions'>&{sessions?:number})[]=[]):LiveMatchReport{
 const C=m.counts||{},S=m.countSessions||{};let hidden=0;
 /** A count shown only when the sessions behind it reach MIN_SESSIONS. */
 const guarded=(id:string,c=C,s=S,tally=true):Cell=>{const se=s[id]||0;if(se>=MIN_SESSIONS)return c[id]||0;if(se>0){if(tally)hidden++;return null;}return 0;};
 const sess=(id:string):Cell=>{const v=S[id]||0;if(v>=MIN_SESSIONS)return v;if(v>0){hidden++;return null;}return 0;};
 const row=(id:string,label:string):LmRow=>({id,label,value:guarded(id)});
 // Audit Nov 6 2026: rates per week and the play share count only the days since counting began (LM_SINCE). A 30-day range
 // that reaches back before it used to divide by all 30 days (and all their sessions), so they read many times too low.
 const since=rollups.filter(r=>r.day>=LM_SINCE),days=Math.max(1,since.length);
 const sessionsSince=since.length&&since.every(r=>typeof r.sessions==='number')?since.reduce((a,r)=>a+(r.sessions as number),0):m.totals?.sessions??0;
 let allSec=0,allLeaves=0;const allBands=LM_LEN_BANDS.map(()=>0);
 const formats:LmFormat[]=LIVE_MATCH_FORMATS.map(f=>{
  const id=(e:string)=>lmId(f,e),leavesRaw=C[id('leave')]||0,secRaw=lmSeconds(C,f);
  const bands=LM_LEN_BANDS.map(([b])=>C[id(b)]||0),ok=leavesRaw>=MIN_MATCHES&&(S[id('leave')]||0)>=MIN_SESSIONS;
  allSec+=secRaw;allLeaves+=leavesRaw;bands.forEach((n,i)=>allBands[i]+=n);
  const visits=guarded(id('visit')),joins=guarded(id('join')),players=sess(id('join')),visitSessions=sess(id('visit')),leaves=guarded(id('leave'));
  const minutesSeen=(S[id('min')]||0)+(S[id('sec')]||0)>0,seconds:Cell=ok?secRaw:secRaw>0||minutesSeen?(hidden++,null):0;
  const medianSec=ok?bandMedian(bands):null,top=bands.map((n,i)=>n>0?i:-1).filter(i=>i>=0).pop();
  let mb:string|null=null;if(medianSec!==null){for(const b of LM_LEN_BANDS)if(medianSec<=b[2]){mb=b[1];break;}}
  const shared=leaves===null?null:LM_WITH_BANDS.slice(1).reduce((a,[b])=>a+(C[id(b)]||0),0);
  return {format:f,label:LM_FORMAT_LABEL[f],visits,visitSessions,joins,players,leaves,
   joinRate:ratio(joins,visits),conversion:visitSessions===null||players===null||!visitSessions?null:Math.min(1,players/visitSessions),playsPerPlayer:ratio(joins,players),
   seconds,minutes:seconds===null?null:Math.round(seconds/60),avgSec:ok?Math.round(secRaw/leavesRaw):null,medianSec,medianBand:mb,longestBand:ok&&top!==undefined?LM_LEN_BANDS[top][1]:null,
   shared,sharedRate:ratio(shared,leaves),
   goalsFor:guarded(id('goal_for')),goalsAgainst:guarded(id('goal_against')),replays:guarded(id('replay')),replaySkips:guarded(id('replay_skip')),
   botSlots:guarded(id('slots_bot')),humanSlots:guarded(id('slots_human')),botsPerJoin:null,humansPerJoin:null,
   roles:LM_ROLES.map(r=>row(id('role_'+r),ROLE_LABEL[r])),len:LM_LEN_BANDS.map(([b,l])=>row(id(b),l)),
   with:LM_WITH_BANDS.map(([b,l])=>row(id(b),l)),ends:LM_END_REASONS.map(([b,l])=>row(id(b),l))};
 });
 // Slots per join: only over the joins on days that could send slots (LM_EXTRAS_SINCE on; earlier joins have none). Without
 // daily rollups (a test calling with merged counts only), every join counts.
 const extraDays=rollups.filter(r=>r.day>=LM_EXTRAS_SINCE),joinsSince=(f:LiveMatchFormat)=>rollups.length?extraDays.reduce((a,r)=>a+((r.counts||{})[lmId(f,'join')]||0),0):C[lmId(f,'join')]||0;
 for(const x of formats){const j=joinsSince(x.format);x.botsPerJoin=x.botSlots===null||!j?null:x.botSlots/j;x.humansPerJoin=x.humanSlots===null||!j?null:x.humanSlots/j;}
 const allJoinsSince=LIVE_MATCH_FORMATS.reduce((a,f)=>a+joinsSince(f),0);
 const sum=(k:'visits'|'joins'|'goalsFor'|'goalsAgainst'|'replays'|'replaySkips'|'botSlots'|'humanSlots'):Cell=>formats.some(x=>x[k]===null)?null:formats.reduce((a,x)=>a+(x[k] as number),0);
 const players=sess('lm:reach_1'),joins=sum('joins'),visits=sum('visits'),okAll=allLeaves>=MIN_MATCHES&&!formats.some(x=>x.seconds===null);
 const minutes=okAll?Math.round(allSec/60):null;
 const daily:LmDay[]=rollups.map(r=>{const c=r.counts||{},s=r.countSessions||{};
  const joinsD={} as Record<LiveMatchFormat,Cell>,minD={} as Record<LiveMatchFormat,Cell>;let v=0,j=0,mi=0;
  for(const f of LIVE_MATCH_FORMATS){joinsD[f]=guarded(lmId(f,'join'),c,s,false);
   const ms=Math.max(s[lmId(f,'min')]||0,s[lmId(f,'leave')]||0),raw=Math.round(lmSeconds(c,f)/60);
   minD[f]=ms>=MIN_SESSIONS?raw:ms>0?null:0;
   const gv=guarded(lmId(f,'visit'),c,s,false);v+=gv??0;j+=joinsD[f]??0;mi+=minD[f]??0;}
  return {day:r.day,joins:joinsD,minutes:minD,visits:v,allJoins:j,allMinutes:mi};});
 const r:LiveMatchReport={
  status:range.to<LM_SINCE?'not_yet':Object.keys(C).some(k=>k.startsWith('lm:'))?'ok':'empty',since:LM_SINCE,partial:range.from<LM_SINCE&&range.to>=LM_SINCE,
  min:MIN_SESSIONS,minMatches:MIN_MATCHES,hidden:0,days,sessions:sessionsSince,formats,
  totals:{visits,joins,players,minutes,avgSec:okAll?Math.round(allSec/allLeaves):null,medianSec:okAll?bandMedian(allBands):null,joinRate:ratio(joins,visits),
   playsPerPlayer:ratio(joins,players),matchesPerWeek:joins===null?null:joins/days*7,minutesPerWeek:minutes===null?null:minutes/days*7,
   playShare:players===null||!sessionsSince?null:Math.min(1,players/sessionsSince),
   reach:LM_REACH.map(n=>({id:'lm:reach_'+n,label:`${n}+ match${n===1?'':'es'} in a visit`,value:sess('lm:reach_'+n)})),
   goalsFor:sum('goalsFor'),goalsAgainst:sum('goalsAgainst'),replays:sum('replays'),replaySkips:sum('replaySkips'),botSlots:sum('botSlots'),humanSlots:sum('humanSlots'),
   botsPerJoin:null,humansPerJoin:null,extrasSince:LM_EXTRAS_SINCE},
  daily,
 };
 r.hidden=hidden;
 {const t=r.totals;t.botsPerJoin=t.botSlots===null||!allJoinsSince?null:t.botSlots/allJoinsSince;t.humansPerJoin=t.humanSlots===null||!allJoinsSince?null:t.humanSlots/allJoinsSince;}
 return r;
}
