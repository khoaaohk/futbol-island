/**
 * The weekly Sponsor report (Oct 22 2026, Phase B of docs/analytics-multiplayer-plan.md §8 'e'): one ISO week (Monday to Sunday),
 * combined totals only, built on the SERVER from the same daily rollups as the rest of /admin (app/api/admin/sponsor-report) and
 * shown on the admin "Sponsor report" tab (app/admin/SponsorReport.tsx), with a CSV export and a print stylesheet (Save as PDF).
 * Pure and client-safe (the tab imports the types and the CSV builder).
 *
 * Numbers are EXACT, like the rest of /admin (Nov 8 2026 owner ruling: exact numbers): no small-group withholding, no "<10",
 * reach (distinct players) is not rounded. A rate with nothing under it (a zero base) has no value and shows as "—".
 * Privacy: combined totals only: no per-day rows, no per-player or per-party rows, never a code, name, id or address.
 * INTERNAL DRAFT: nothing here is shared outside the company until the privacy policy wording (§13) is approved by a lawyer; the
 * view and the CSV both carry that banner.
 */
import type {DailyRollup,Merged} from './core';
import {EMOTE_WIRE_IDS,PARTY_PEAK_BUCKETS,PARTY_SINCE} from './countIds';
import type {RelayDayTotals} from './relayStatsTypes';

export const DRAFT_BANNER='Internal draft: do not share outside the company until the privacy policy wording is approved.';
export const EXPORT_LINE='Aggregate, anonymous counts; exact totals; no personal information.';
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

// ------------------------------------------------------------------------------------------------ the report
export type KpiStatus='ok'|'not_yet'|'unavailable';
export type SponsorKpi={id:string;label:string;value:number|null;prev:number|null;change:number|null;format:'int'|'pct'|'dec'|'min';
 status:KpiStatus;how:string;note?:string;
 /** Supporting numbers shown under the headline (exact). */
 sub:{label:string;value:number|null;format:'int'|'pct'|'dec'|'min';status:KpiStatus}[]};
export type SponsorBand={key:string;label:string;value:number};
export type SponsorWeekly={
 week:string;from:string;to:string;prevWeek:string;nextWeek:string;generatedAt:string;banner:string;exportLine:string;
 kpis:SponsorKpi[];partySize:{source:'relay'|'client'|'none';bands:SponsorBand[]};topEmotes:SponsorBand[];
 notes:string[];
 /** Nov 13 2026 (owner confused by "298 players" over All vs "Reach 149"): the report is its own week, whatever the range buttons say. */
 scope:string;
};
const SHORT=(d:string,o:Intl.DateTimeFormatOptions)=>new Date(d+'T12:00:00Z').toLocaleDateString('en-US',{timeZone:'UTC',...o});
/** "This report covers Week 46 (Nov 9–15); the range buttons above don't apply." (month repeated across a month end). */
export function weekScope(week:string,from:string,to:string):string{
 const same=from.slice(0,7)===to.slice(0,7),span=same?`${SHORT(from,{month:'short',day:'numeric'})}–${SHORT(to,{day:'numeric'})}`:`${SHORT(from,{month:'short',day:'numeric'})} – ${SHORT(to,{month:'short',day:'numeric'})}`;
 return `This report covers Week ${Number(week.slice(6))} (${span}); the range buttons above don’t apply.`;
}
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
/** The exact total over the ids matching `f`. */
const total=(c:In,f:(k:string)=>boolean):number=>sumIds(c.counts,f);
const id1=(id:string)=>(k:string)=>k===id;
const pre=(p:string)=>(k:string)=>k.startsWith(p);
/** Sessions carrying `id` (exact). */
const sess=(c:In,id:string):number=>c.countSessions[id]||0;
/** a ÷ b, capped at `cap`; null (no value) when either is missing or the base is 0. */
const rate=(a:number|null,b:number|null,cap=Infinity)=>a===null||b===null||!b?null:Math.min(cap,a/b);
const change=(cur:number|null,prev:number|null)=>cur===null||prev===null||!prev?null:(cur-prev)/prev;
const st=(ok=true):KpiStatus=>ok?'ok':'not_yet';
const partyIn=(c:In)=>Object.keys(c.counts).some(k=>k.startsWith('mp:')||k.startsWith('em:'));
const PEAK_MID:Record<string,number>={peak_1:1,peak_2:2,peak_3_4:3.5,peak_5_8:6.5,peak_9_12:10.5,peak_13_20:16.5};

function avgSize(bands:Record<string,number>):number|null{
 const n=PARTY_PEAK_BUCKETS.reduce((a,[id])=>a+(bands[id]||0),0);
 return n>0?PARTY_PEAK_BUCKETS.reduce((a,[id])=>a+(bands[id]||0)*PEAK_MID[id],0)/n:null;
}
const clientBands=(c:In)=>Object.fromEntries(PARTY_PEAK_BUCKETS.map(([id])=>[id,c.counts['mp:'+id]||0]));

export function buildSponsorWeekly({week,now=new Date(),merged,prev,players,prevPlayers,returning,relay,emoteLabel}:SponsorWeekInput):SponsorWeekly{
 const r=weekRange(week)!,c=inOf(merged),p=prev?inOf(prev):null;
 const partyLive=r.to>=PARTY_SINCE&&(partyIn(c)||(!!p&&partyIn(p)));
 const minutes=(x:In)=>Math.round(x.engagedMs/60000);
 const reach=players,prevReach=prevPlayers;
 const mins=minutes(c),prevMins=p?minutes(p):null;
 const kpis:SponsorKpi[]=[];
 kpis.push({id:'reach',label:'Reach',value:reach,prev:prevReach,change:change(reach,prevReach),format:'int',status:players===null?'unavailable':'ok',
  how:'Distinct anonymous players in the week (a save code, else one device), exact.',
  note:players===null?'Reach needs the raw rows of the last 14 days; older weeks are not available until weekly snapshots are kept.':undefined,sub:[]});
 kpis.push({id:'minutes',label:'Engagement minutes',value:mins,prev:prevMins,change:change(mins,prevMins),format:'min',status:'ok',
  how:'Foreground minutes on the island, in the arcade and the museum (hidden tabs and 10+ idle minutes do not count).',
  sub:[{label:'Minutes per player',value:rate(mins,players),format:'dec',status:players===null?'unavailable':'ok'},
   {label:'Sessions',value:c.sessions,format:'int',status:'ok'}]});
 // Social: minutes in a party, their share of island minutes, players per party, sessions that played with friends.
 const social=(x:In)=>total(x,id1('mp:min'));
 const sMin=partyLive?social(c):null,sPrev=partyLive&&p?social(p):null,islandMin=Math.round(c.islandMs/60000);
 const relaySize=relay?avgSize(relay.sizeBuckets):null,clientSize=avgSize(clientBands(c));
 const inParty=sess(c,'mp:in'),created=total(c,id1('mp:created'));
 kpis.push({id:'social',label:'Social engagement',value:sMin,prev:sPrev,change:change(sMin,sPrev),format:'min',status:st(partyLive),
  how:'Minutes played together in a Play with friends party (each device counts its own whole foreground minutes). Party size is players at once, from the party service when it reports (else from the host’s device).',
  sub:[{label:'Share of island minutes',value:rate(sMin,islandMin,1),format:'pct',status:st(partyLive)},
   {label:'Average party size',value:relaySize??clientSize,format:'dec',status:st(partyLive)},
   {label:'Sessions with friends',value:rate(inParty,c.sessions,1),format:'pct',status:st(partyLive)},
   {label:'Parties per active player',value:rate(created,players),format:'dec',status:players===null?'unavailable':st(partyLive)}]});
 // Emotes: per emoting session and the share of sessions that emoted.
 const picks=partyLive?total(c,id1('em:pick')):null,emoting=sess(c,'em:reach_1');
 const per=rate(picks,emoting),pPicks=p&&partyLive?total(p,id1('em:pick')):null,pPer=p?rate(pPicks,sess(p,'em:reach_1')):null;
 kpis.push({id:'emotes',label:'Emote engagement',value:per,prev:pPer,change:change(per,pPer),format:'dec',status:st(partyLive),
  how:'Preset emotes played per session that used them (a wave, a high five, a dance …), and the share of sessions that emoted. Never who an emote was aimed at.',
  sub:[{label:'Sessions that emoted',value:rate(emoting,c.sessions,1),format:'pct',status:st(partyLive)},
   {label:'Emotes played',value:picks,format:'int',status:st(partyLive)}]});
 // Return rate (raw rows only).
 const ret=returning?.share??null;
 kpis.push({id:'return',label:'Return rate',value:ret,prev:null,change:null,format:'pct',status:ret===null?'unavailable':'ok',
  how:'Share of sessions from a device that had played before (from the raw rows of the last 14 days).',
  note:!returning||returning.share===null?'Not available for this week (needs the raw rows of the last 14 days).':undefined,sub:[]});
 // Learning: lessons watched to the end, quizzes taken and finished, learning in a party.
 const lessons=total(c,pre('le:')),opened=total(c,pre('lo:')),quizzes=total(c,pre('ls:')),done=total(c,pre('lf:')),pLessons=p?total(p,pre('le:')):null;
 const together=partyLive?total(c,k=>k==='mp:lesson'||k==='mp:quiz'):null;
 kpis.push({id:'learning',label:'Learning engagement',value:lessons,prev:pLessons,change:change(lessons,pLessons),format:'int',status:'ok',
  how:'Lesson videos watched to the END (le:); lessons opened (lo:, the count on the player cards: an opened lesson may not be finished); lesson quizzes started and finished; lessons and quizzes started while playing with friends.',
  sub:[{label:'Lessons opened',value:opened,format:'int',status:'ok'},{label:'Quizzes taken',value:quizzes,format:'int',status:'ok'},{label:'Quizzes finished',value:done,format:'int',status:'ok'},
   {label:'Learning with friends',value:together,format:'int',status:st(partyLive)}]});
 // Party size bands (relay when it reports parties, else the hosts' devices), exact.
 const relayParties=relay?Object.values(relay.sizeBuckets).reduce((a,b)=>a+b,0):0;
 const src:'relay'|'client'|'none'=relayParties>0?'relay':partyLive?'client':'none';
 const raw=src==='relay'?relay!.sizeBuckets as Record<string,number>:clientBands(c);
 const bands=src==='none'?[]:PARTY_PEAK_BUCKETS.map(([id,label])=>{const v=raw[id]||0;return {key:id,label,value:v};});
 const topEmotes=!partyLive?[]:EMOTE_WIRE_IDS.map(n=>({key:'e'+n,label:emoteLabel?.(n)??`Emote ${n}`,value:c.counts['em:e'+n]||0}))
  .filter(b=>b.value>0).sort((a,b)=>b.value-a.value).slice(0,5);
 // Audit Nov 6 2026: a week still in progress (today is inside it) was compared with the whole of last week, so every change read
 // low (a Friday showed about −26% on flat traffic). Its changes are withheld until the week has ended.
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Los_Angeles'}).format(now),inProgress=today>=r.from&&today<=r.to;
 if(inProgress)for(const k of kpis)k.change=null;
 return {week,from:r.from,to:r.to,prevWeek:shiftWeek(week,-1),nextWeek:shiftWeek(week,1),generatedAt:now.toISOString(),banner:DRAFT_BANNER,exportLine:EXPORT_LINE,
  kpis,partySize:{source:src,bands},topEmotes,scope:weekScope(week,r.from,r.to),
  notes:[...(inProgress?[`This week is still in progress (to ${today}, Pacific): the change vs last week is shown once the week has ended.`]:[]),'Visitors with Do Not Track or Global Privacy Control are not counted, so every figure is a floor. No sampling, nothing estimated.',
   'Party sizes from the hosts’ devices miss parties whose host tab was closed abruptly; the party service’s own totals are used when available.',
   `Play with friends and emote numbers start ${PARTY_SINCE}; earlier weeks say “not tracked yet”.`,
   'Days are Pacific days; the week runs Monday to Sunday.']};
}

// ------------------------------------------------------------------------------------------------ display + CSV
export function fmtKpi(v:number|null,f:SponsorKpi['format'],status:KpiStatus='ok'):string{
 if(status==='not_yet')return 'not tracked yet';if(status==='unavailable')return 'not available';
 if(v===null)return '—';
 if(f==='pct')return `${Math.round(v*100)}%`;if(f==='dec')return v.toFixed(1);
 return new Intl.NumberFormat('en').format(Math.round(v));
}
/** One row per KPI and its supporting numbers: KPI, value, previous week, change, how counted. Exact numbers; "—" = no value (a zero base). */
export function sponsorWeeklyCsv(r:SponsorWeekly):string{
 const q=(v:unknown)=>{const s=v===null||v===undefined?'':String(v);return /[",\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s;};
 const rows:unknown[][]=[[r.banner],[`Futbol Island sponsor report`,`${r.week} (${r.from} to ${r.to})`],[r.exportLine],[],['KPI','Value','Previous week','Change','How it is counted']];
 for(const k of r.kpis){
  rows.push([k.label,fmtKpi(k.value,k.format,k.status),k.prev===null||k.status!=='ok'?'':fmtKpi(k.prev,k.format),k.change===null?'':`${Math.round(k.change*100)}%`,k.how+(k.note?' '+k.note:'')]);
  for(const s of k.sub)rows.push([`  ${s.label}`,fmtKpi(s.value,s.format,s.status),'','','']);
 }
 if(r.partySize.bands.length){rows.push([],[`Party size (${r.partySize.source==='relay'?'party service':'hosts’ devices'})`,'Parties']);for(const b of r.partySize.bands)rows.push([b.label,b.value]);}
 if(r.topEmotes.length){rows.push([],['Top emotes','Times played']);for(const b of r.topEmotes)rows.push([b.label,b.value]);}
 rows.push([],...r.notes.map(n=>[n]),[r.exportLine]);
 return rows.map(x=>x.map(q).join(',')).join('\n')+'\n';
}
/** The rollups of the week, merged: the route uses lib/analytics/report.ts loadWeek; tests build them from fixtures. */
export type WeekRollups={merged:Merged;rollups:DailyRollup[]};
