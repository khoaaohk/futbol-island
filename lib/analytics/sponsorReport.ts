/**
 * The weekly Sponsor report (Oct 22 2026, Phase B of docs/analytics-multiplayer-plan.md §8 'e'): one ISO week (Monday to Sunday),
 * combined totals only, built on the SERVER from the same daily rollups as the rest of /admin (app/api/admin/sponsor-report) and
 * shown on the admin "Sponsor report" tab (app/admin/SponsorReport.tsx), with a CSV export and a print stylesheet (Save as PDF).
 * Pure and client-safe (the tab imports the types and the CSV builder).
 *
 * Sponsor-grade privacy (stricter than the internal sections, plan §2 rule 4):
 *  - a number resting on fewer than SPONSOR_MIN (10) sessions (or 10 parties, or 10 players) is withheld ("<10"), in the view and
 *    in every export; a rate needs 10+ behind both of its numbers;
 *  - reach (distinct players) is rounded: to the nearest 10 under 1,000, else to the nearest 100;
 *  - combined totals only: no per-day rows, no per-player or per-party rows, never a code, name, id or address.
 * INTERNAL DRAFT: nothing here is shared outside the company until the privacy policy wording (§13) is approved by a lawyer; the
 * view and the CSV both carry that banner.
 */
import type {DailyRollup,Merged} from './core';
import {EMOTE_WIRE_IDS,PARTY_PEAK_BUCKETS,PARTY_SINCE} from './countIds';
import type {RelayDayTotals} from './relayStatsTypes';

export const SPONSOR_MIN=10;
export const DRAFT_BANNER='Internal draft: do not share outside the company until the privacy policy wording is approved.';
export const EXPORT_LINE='Aggregate, anonymous counts; groups under 10 withheld; no personal information.';
const WEEK_RE=/^(\d{4})-W(\d{2})$/;

// ------------------------------------------------------------------------------------------------ ISO weeks (UTC date maths)
const dayMs=86_400_000;
const toDay=(t:number)=>new Date(t).toISOString().slice(0,10);
const parseDay=(d:string)=>Date.parse(d+'T00:00:00Z');
/** The ISO week ('2026-W43') holding `day`. */
export function isoWeekOf(day:string):string{
 const t=parseDay(day),dow=(new Date(t).getUTCDay()+6)%7,thu=t+(3-dow)*dayMs,y=new Date(thu).getUTCFullYear();
 const jan4=Date.UTC(y,0,4),w1=jan4-((new Date(jan4).getUTCDay()+6)%7)*dayMs;
 return `${y}-W${String(Math.floor((thu-w1)/(7*dayMs))+1).padStart(2,'0')}`;
}
/** Monday and Sunday of an ISO week; null for a malformed week. */
export function weekRange(week:string):{from:string;to:string}|null{
 const m=WEEK_RE.exec(week||'');if(!m)return null;
 const y=Number(m[1]),w=Number(m[2]);if(w<1||w>53)return null;
 const jan4=Date.UTC(y,0,4),mon=jan4-((new Date(jan4).getUTCDay()+6)%7)*dayMs+(w-1)*7*dayMs;
 const from=toDay(mon);if(isoWeekOf(from)!==week)return null;
 return {from,to:toDay(mon+6*dayMs)};
}
export const shiftWeek=(week:string,n:number)=>{const r=weekRange(week);return r?isoWeekOf(toDay(parseDay(r.from)+n*7*dayMs)):week;};
export const validWeek=(w:string|null|undefined):w is string=>!!w&&weekRange(w)!==null;

/** Reach rounding for sponsors: nearest 10 under 1,000, else nearest 100. */
export const roundReach=(n:number)=>n<1000?Math.round(n/10)*10:Math.round(n/100)*100;

// ------------------------------------------------------------------------------------------------ the report
export type KpiStatus='ok'|'withheld'|'not_yet'|'unavailable';
export type SponsorKpi={id:string;label:string;value:number|null;prev:number|null;change:number|null;format:'int'|'pct'|'dec'|'min';
 status:KpiStatus;how:string;note?:string;
 /** Supporting numbers shown under the headline (already suppressed). */
 sub:{label:string;value:number|null;format:'int'|'pct'|'dec'|'min';status:KpiStatus}[]};
export type SponsorBand={key:string;label:string;value:number|null};
export type SponsorWeekly={
 week:string;from:string;to:string;prevWeek:string;nextWeek:string;generatedAt:string;min:number;banner:string;exportLine:string;
 kpis:SponsorKpi[];partySize:{source:'relay'|'client'|'none';bands:SponsorBand[]};topEmotes:SponsorBand[];
 notes:string[];
};
type In={counts:Record<string,number>;countSessions:Record<string,number>;sessions:number;engagedMs:number;islandMs:number};
export type SponsorWeekInput={
 week:string;now?:Date;
 merged:Pick<Merged,'counts'|'countSessions'|'totals'|'areas'>;prev:Pick<Merged,'counts'|'countSessions'|'totals'|'areas'>|null;
 /** Distinct anonymous players in the week (raw rows, last 14 days only): null when not available for this week. */
 players:number|null;prevPlayers:number|null;
 /** Share of sessions from a device that played before (raw rows): null when not available. */
 returning:{share:number|null;sessions:number}|null;
 /** The party relay's totals for the week (authoritative party sizes), or null. */
 relay:RelayDayTotals|null;
 emoteLabel?:(n:number)=>string|undefined;
};

const inOf=(m:SponsorWeekInput['merged']):In=>({counts:m.counts||{},countSessions:m.countSessions||{},sessions:m.totals.sessions,engagedMs:m.totals.engagedMs,
 islandMs:m.areas?.find(a=>a.area==='island')?.ms||0});
const sumIds=(r:Record<string,number>,f:(k:string)=>boolean)=>Object.entries(r).reduce((a,[k,v])=>f(k)?a+(v||0):a,0);
const maxIds=(r:Record<string,number>,f:(k:string)=>boolean)=>Object.entries(r).reduce((a,[k,v])=>f(k)?Math.max(a,v||0):a,0);
/** A total over `f`, shown once SPONSOR_MIN different sessions carry the busiest of its ids. */
function total(c:In,f:(k:string)=>boolean):number|null{return maxIds(c.countSessions,f)>=SPONSOR_MIN?sumIds(c.counts,f):maxIds(c.countSessions,f)>0?null:0;}
const id1=(id:string)=>(k:string)=>k===id;
const pre=(p:string)=>(k:string)=>k.startsWith(p);
/** Sessions carrying `id`, withheld under SPONSOR_MIN. */
const sess=(c:In,id:string):number|null=>{const s=c.countSessions[id]||0;return s>=SPONSOR_MIN?s:s>0?null:0;};
const rate=(a:number|null,b:number|null)=>a===null||b===null||!b?null:a/b;
const change=(cur:number|null,prev:number|null)=>cur===null||prev===null||!prev?null:(cur-prev)/prev;
const st=(v:number|null,ok=true):KpiStatus=>!ok?'not_yet':v===null?'withheld':'ok';
const partyIn=(c:In)=>Object.keys(c.counts).some(k=>k.startsWith('mp:')||k.startsWith('em:'));
const PEAK_MID:Record<string,number>={peak_1:1,peak_2:2,peak_3_4:3.5,peak_5_8:6.5,peak_9_12:10.5,peak_13_20:16.5};

function avgSize(bands:Record<string,number>):number|null{
 const n=PARTY_PEAK_BUCKETS.reduce((a,[id])=>a+(bands[id]||0),0);
 return n>=SPONSOR_MIN?PARTY_PEAK_BUCKETS.reduce((a,[id])=>a+(bands[id]||0)*PEAK_MID[id],0)/n:null;
}
const clientBands=(c:In)=>Object.fromEntries(PARTY_PEAK_BUCKETS.map(([id])=>[id,c.counts['mp:'+id]||0]));

export function buildSponsorWeekly({week,now=new Date(),merged,prev,players,prevPlayers,returning,relay,emoteLabel}:SponsorWeekInput):SponsorWeekly{
 const r=weekRange(week)!,c=inOf(merged),p=prev?inOf(prev):null;
 const partyLive=r.to>=PARTY_SINCE&&(partyIn(c)||(!!p&&partyIn(p)));
 const minutes=(x:In)=>x.sessions>=SPONSOR_MIN?Math.round(x.engagedMs/60000):x.sessions>0?null:0;
 const reach=players===null?null:players>=SPONSOR_MIN?roundReach(players):null,prevReach=prevPlayers===null?null:prevPlayers>=SPONSOR_MIN?roundReach(prevPlayers):null;
 const mins=minutes(c),prevMins=p?minutes(p):null;
 const kpis:SponsorKpi[]=[];
 kpis.push({id:'reach',label:'Reach',value:reach,prev:prevReach,change:change(reach,prevReach),format:'int',status:players===null?'unavailable':st(reach),
  how:`Distinct anonymous players in the week (a save code, else one device), rounded to the nearest 10 under 1,000 and to the nearest 100 above.`,
  note:players===null?'Reach needs the raw rows of the last 14 days; older weeks are not available until weekly snapshots are kept.':undefined,sub:[]});
 kpis.push({id:'minutes',label:'Engagement minutes',value:mins,prev:prevMins,change:change(mins,prevMins),format:'min',status:st(mins),
  how:'Foreground minutes on the island, in the arcade and the museum (hidden tabs and 10+ idle minutes do not count).',
  sub:[{label:'Minutes per player',value:mins===null||!players||players<SPONSOR_MIN?null:mins/players,format:'dec',status:players===null?'unavailable':st(mins===null||!players||players<SPONSOR_MIN?null:1)},
   {label:'Sessions',value:c.sessions>=SPONSOR_MIN?c.sessions:null,format:'int',status:st(c.sessions>=SPONSOR_MIN?1:null)}]});
 // Social: minutes in a party, their share of island minutes, players per party, sessions that played with friends.
 const social=(x:In)=>total(x,id1('mp:min'));
 const sMin=partyLive?social(c):null,sPrev=partyLive&&p?social(p):null,islandMin=Math.round(c.islandMs/60000);
 const relaySize=relay?avgSize(relay.sizeBuckets):null,clientSize=avgSize(clientBands(c));
 const inParty=sess(c,'mp:in'),created=total(c,id1('mp:created'));
 kpis.push({id:'social',label:'Social engagement',value:sMin,prev:sPrev,change:change(sMin,sPrev),format:'min',status:st(sMin,partyLive),
  how:'Minutes played together in a Play with friends party (each device counts its own whole foreground minutes). Party size is players at once, from the party service when it reports (else from the host’s device).',
  sub:[{label:'Share of island minutes',value:sMin===null||!islandMin?null:Math.min(1,sMin/islandMin),format:'pct',status:st(sMin===null||!islandMin?null:1,partyLive)},
   {label:'Average party size',value:relaySize??clientSize,format:'dec',status:st(relaySize??clientSize,partyLive)},
   {label:'Sessions with friends',value:inParty===null||c.sessions<SPONSOR_MIN?null:Math.min(1,inParty/c.sessions),format:'pct',status:st(inParty===null||c.sessions<SPONSOR_MIN?null:1,partyLive)},
   {label:'Parties per active player',value:created===null||!players||players<SPONSOR_MIN?null:created/players,format:'dec',status:players===null?'unavailable':st(created===null||!players||players<SPONSOR_MIN?null:1,partyLive)}]});
 // Emotes: per emoting session and the share of sessions that emoted.
 const picks=partyLive?total(c,id1('em:pick')):null,emoting=sess(c,'em:reach_1');
 const per=rate(picks,emoting),pPicks=p&&partyLive?total(p,id1('em:pick')):null,pPer=p?rate(pPicks,sess(p,'em:reach_1')):null;
 kpis.push({id:'emotes',label:'Emote engagement',value:per,prev:pPer,change:change(per,pPer),format:'dec',status:st(per,partyLive),
  how:'Preset emotes played per session that used them (a wave, a high five, a dance …), and the share of sessions that emoted. Never who an emote was aimed at.',
  sub:[{label:'Sessions that emoted',value:emoting===null||c.sessions<SPONSOR_MIN?null:Math.min(1,emoting/c.sessions),format:'pct',status:st(emoting===null||c.sessions<SPONSOR_MIN?null:1,partyLive)},
   {label:'Emotes played',value:picks,format:'int',status:st(picks,partyLive)}]});
 // Return rate (raw rows only).
 const ret=returning&&returning.share!==null&&returning.sessions>=SPONSOR_MIN?returning.share:null;
 kpis.push({id:'return',label:'Return rate',value:ret,prev:null,change:null,format:'pct',status:!returning||returning.share===null?'unavailable':st(ret),
  how:'Share of sessions from a device that had played before (from the raw rows of the last 14 days).',
  note:!returning||returning.share===null?'Not available for this week (needs the raw rows of the last 14 days).':undefined,sub:[]});
 // Learning: lessons watched to the end, quizzes taken and finished, learning in a party.
 const lessons=total(c,pre('le:')),quizzes=total(c,pre('ls:')),done=total(c,pre('lf:')),pLessons=p?total(p,pre('le:')):null;
 const together=partyLive?total(c,k=>k==='mp:lesson'||k==='mp:quiz'):null;
 kpis.push({id:'learning',label:'Learning engagement',value:lessons,prev:pLessons,change:change(lessons,pLessons),format:'int',status:st(lessons),
  how:'Lesson videos watched to the end; lesson quizzes started and finished; lessons and quizzes started while playing with friends.',
  sub:[{label:'Quizzes taken',value:quizzes,format:'int',status:st(quizzes)},{label:'Quizzes finished',value:done,format:'int',status:st(done)},
   {label:'Learning with friends',value:together,format:'int',status:st(together,partyLive)}]});
 // Party size bands (relay when it reports parties, else the hosts' devices): a band under 10 parties is withheld.
 const relayParties=relay?Object.values(relay.sizeBuckets).reduce((a,b)=>a+b,0):0;
 const src:'relay'|'client'|'none'=relayParties>0?'relay':partyLive?'client':'none';
 const raw=src==='relay'?relay!.sizeBuckets as Record<string,number>:clientBands(c);
 const bands=src==='none'?[]:PARTY_PEAK_BUCKETS.map(([id,label])=>{const v=raw[id]||0;return {key:id,label,value:v>=SPONSOR_MIN?v:v>0?null:0};});
 const topEmotes=!partyLive?[]:EMOTE_WIRE_IDS.map(n=>({key:'e'+n,label:emoteLabel?.(n)??`Emote ${n}`,value:(c.countSessions['em:e'+n]||0)>=SPONSOR_MIN?c.counts['em:e'+n]||0:null}))
  .filter(b=>b.value!==null&&b.value>0).sort((a,b)=>(b.value??0)-(a.value??0)).slice(0,5);
 return {week,from:r.from,to:r.to,prevWeek:shiftWeek(week,-1),nextWeek:shiftWeek(week,1),generatedAt:now.toISOString(),min:SPONSOR_MIN,banner:DRAFT_BANNER,exportLine:EXPORT_LINE,
  kpis,partySize:{source:src,bands},topEmotes,
  notes:['Visitors with Do Not Track or Global Privacy Control are not counted, so every figure is a floor. No sampling, nothing estimated.',
   'Party sizes from the hosts’ devices miss parties whose host tab was closed abruptly; the party service’s own totals are used when available.',
   `Play with friends and emote numbers start ${PARTY_SINCE}; earlier weeks say “not tracked yet”.`,
   'Days are Pacific days; the week runs Monday to Sunday.']};
}

// ------------------------------------------------------------------------------------------------ display + CSV
export function fmtKpi(v:number|null,f:SponsorKpi['format'],status:KpiStatus='ok'):string{
 if(status==='not_yet')return 'not tracked yet';if(status==='unavailable')return 'not available';
 if(v===null)return `<${SPONSOR_MIN}`;
 if(f==='pct')return `${Math.round(v*100)}%`;if(f==='dec')return v.toFixed(1);
 return new Intl.NumberFormat('en').format(Math.round(v));
}
/** One row per KPI and its supporting numbers: KPI, value, previous week, change, how counted. Withheld = "<10". */
export function sponsorWeeklyCsv(r:SponsorWeekly):string{
 const q=(v:unknown)=>{const s=v===null||v===undefined?'':String(v);return /[",\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s;};
 const rows:unknown[][]=[[r.banner],[`Futbol Island sponsor report`,`${r.week} (${r.from} to ${r.to})`],[r.exportLine],[],['KPI','Value','Previous week','Change','How it is counted']];
 for(const k of r.kpis){
  rows.push([k.label,fmtKpi(k.value,k.format,k.status),k.prev===null||k.status!=='ok'?'':fmtKpi(k.prev,k.format),k.change===null?'':`${Math.round(k.change*100)}%`,k.how+(k.note?' '+k.note:'')]);
  for(const s of k.sub)rows.push([`  ${s.label}`,fmtKpi(s.value,s.format,s.status),'','','']);
 }
 if(r.partySize.bands.length){rows.push([],[`Party size (${r.partySize.source==='relay'?'party service':'hosts’ devices'})`,'Parties']);for(const b of r.partySize.bands)rows.push([b.label,b.value===null?`<${SPONSOR_MIN}`:b.value]);}
 if(r.topEmotes.length){rows.push([],['Top emotes','Times played']);for(const b of r.topEmotes)rows.push([b.label,b.value]);}
 rows.push([],...r.notes.map(n=>[n]),[r.exportLine]);
 return rows.map(x=>x.map(q).join(',')).join('\n')+'\n';
}
/** The rollups of the week, merged: the route uses lib/analytics/report.ts loadWeek; tests build them from fixtures. */
export type WeekRollups={merged:Merged;rollups:DailyRollup[]};
