/**
 * The sponsor Overview of /admin (Oct 20 2026; owner: "capture behaviour to sell sponsorships: how many games played, how many
 * t-shirts designed, cleats designed, player cards found, videos/stories watched, books purchased, read duration, quizzes taken
 * ... the data is simple, then drill in"). Built on the SERVER from the same daily rollups as the rest of the report
 * (lib/analytics/report.ts), so a number here is the sum of the counters every other card reads. Pure and client-safe (the
 * dashboard imports the types and the CSV helper); docs/admin-sponsor-insights.md says how each metric is counted.
 *
 * Trust rules (the owner shows these to a potential partner):
 *  - every metric says exactly which counters it adds up (`parts`, `how`), and nothing is estimated or extrapolated;
 *  - a total resting on fewer than MIN_SESSIONS (5) different sessions is withheld (null, "<5"), like every admin number;
 *  - a part counted by the `en:` events added on Oct 20 2026 is "not tracked yet" until the first of them arrives in the range
 *    or the period before (the build that sends them is live), so a missing feature never shows as a real zero.
 */
import type {DailyRollup,Merged} from './core';
import type {Cell} from './learning';
import {ENGAGE_ARCADE_GAMES,ENGAGE_BOOKS,ENGAGE_BOOT_MODELS,ENGAGE_BOOT_PATTERNS,ENGAGE_CARD_SOURCES,ENGAGE_CARD_TIERS,ENGAGE_JERSEY_PATTERNS,ENGAGE_READ_BUCKETS,
 EMOTE_WIRE_IDS,PARTY_LEN_BUCKETS,PARTY_PEAK_BUCKETS,PARTY_SINCE} from './countIds';

/** Oct 22 2026 (Phase B of docs/analytics-multiplayer-plan.md §8): + 'social' (Minutes with friends) and 'emotes' (Emotes used),
 *  counted by the mp: / em: ids; "not tracked yet" until the first of them arrives (PARTY_SINCE, the ENGAGE_SINCE pattern). */
export const SPONSOR_METRICS=['games','shirts','cleats','cards','watched','books','reading','quizzes','social','emotes'] as const;
export type SponsorMetricId=typeof SPONSOR_METRICS[number];
/** The day the `en:` events were added (the build that sends them). Nothing before can carry them. */
export const ENGAGE_SINCE='2026-10-20';
/** Same small-number rule as lib/analytics/learning.ts MIN_SESSIONS (repeated so the client bundle never loads the lesson text). */
export const MIN_SESSIONS=5;
/** Party-band rule (lib/analytics/partyReport.ts MIN_PARTIES): averages from the party histogram need 5 parties. */
export const MIN_PARTIES=5;
export {PARTY_SINCE};

/**
 * Which headline metric a counter id adds to (null = none). The SQL drill-down uses the same rule
 * (supabase/migrations/20261021_analytics_sponsor_split.sql analytics_sponsor_metric; tests/admin-sponsor.cjs compares them).
 * Reading time is not a counter (it is the pop-up book's foreground time), so it never comes from here.
 */
export function sponsorMetricOf(id:string):SponsorMetricId|null{
 if(/^en:game_/.test(id)||id==='su:kick_play')return 'games';
 if(id==='sh:save_jersey')return 'shirts';
 if(id==='sh:save_boots')return 'cleats';
 if(/^en:card_/.test(id))return 'cards';
 if(/^le:/.test(id)||id==='en:film_end'||/^en:bookend_/.test(id)||id==='tu:finish')return 'watched';
 if(/^en:bookbuy_/.test(id))return 'books';
 if(/^ls:/.test(id))return 'quizzes';
 return null;
}

export type SponsorItem={key:string;label:string;value:Cell;detail?:string};
export type SponsorBreakdown={id:string;title:string;unit:string;items:SponsorItem[];pending?:boolean;note?:string};
export type SponsorStat={label:string;value:number|null;format:'int'|'pct'|'min'|'dec';hint?:string;pending?:boolean};
export type SponsorPart={key:string;label:string;value:Cell;pending:boolean};
export type SponsorMetric={
 id:SponsorMetricId;label:string;unit:string;
 /** 'ok': every part is counted; 'partial': some parts are not tracked yet; 'none': nothing is tracked yet (no number shown). */
 status:'ok'|'partial'|'none';
 total:Cell;prev:Cell|null;
 /** One value per day of the range (or of the 7 days ending on it for ranges under a week: `trendDays`). */
 trend:Cell[];daily:{day:string;value:Cell}[];
 parts:SponsorPart[];breakdowns:SponsorBreakdown[];stats:SponsorStat[];
 how:string;gap?:string;
};
export type SponsorReport={from:string;to:string;prevFrom:string;prevTo:string;min:number;engageLive:boolean;engageSince:string;
 trendDays:string[];metrics:SponsorMetric[];
 kpis:{sessions:number;prevSessions:number|null;visitorDays:number;prevVisitorDays:number|null;perDay:number;prevPerDay:number|null;
  avgSessionMs:number;prevAvgSessionMs:number|null;engagedMs:number}};

type Counts={counts:Record<string,number>;countSessions:Record<string,number>;bookMs:number;sessions:number;visitors:number;islandMs:number};
type Labels={card?:(n:number)=>string|undefined;lesson?:(id:string)=>string|undefined;book?:(key:string)=>string|undefined;emote?:(n:number)=>string|undefined};

const sum=(rec:Record<string,number>,ids:(id:string)=>boolean)=>Object.entries(rec).reduce((a,[k,v])=>ids(k)?a+(v||0):a,0);
const maxOf=(rec:Record<string,number>,ids:(id:string)=>boolean)=>Object.entries(rec).reduce((a,[k,v])=>ids(k)?Math.max(a,v||0):a,0);
/** A total over `ids`, shown once at least MIN_SESSIONS different sessions carry one of them (the busiest id's sessions). */
function guarded(c:Counts,ids:(id:string)=>boolean):Cell{const ss=maxOf(c.countSessions,ids);return ss>=MIN_SESSIONS?sum(c.counts,ids):ss>0?null:0;}
const one=(c:Counts,id:string):Cell=>guarded(c,k=>k===id);
const pre=(p:string)=>(k:string)=>k.startsWith(p);
const ratio=(a:Cell,b:Cell)=>a===null||b===null||!b?null:a/b;
const addCells=(cells:Cell[]):Cell=>cells.some(v=>v===null)?null:cells.reduce<number>((a,v)=>a+(v||0),0);
const title=(s:string)=>s[0].toUpperCase()+s.slice(1);
/** Sessions that carried `id` (a session count), withheld under MIN_SESSIONS. */
const sess=(c:Counts,id:string):Cell=>{const s=c.countSessions[id]||0;return s>=MIN_SESSIONS?s:s>0?null:0;};
/** Party-histogram bands (one increment per party): a band under MIN_PARTIES parties is withheld; zero bands dropped. */
const partyBands=(c:Counts,bands:readonly (readonly [string,string])[]):SponsorItem[]=>bands.map(([id,label])=>{const v=c.counts['mp:'+id]||0;return {key:id,label,value:v>=MIN_PARTIES?v:v>0?null:0} as SponsorItem;}).filter(i=>i.value!==0);
const PEAK_MID:Record<string,number>={peak_1:1,peak_2:2,peak_3_4:3.5,peak_5_8:6.5,peak_9_12:10.5,peak_13_20:16.5};
/** ≈ players per party from the size bands (band midpoints), once 5+ parties are in them. */
export function avgPartySize(c:{counts:Record<string,number>}):number|null{const n=PARTY_PEAK_BUCKETS.reduce((a,[id])=>a+(c.counts['mp:'+id]||0),0);return n>=MIN_PARTIES?PARTY_PEAK_BUCKETS.reduce((a,[id])=>a+(c.counts['mp:'+id]||0)*PEAK_MID[id],0)/n:null;}
/** The emote groups (countIds.ts EMOTE_WIRE_IDS ranges): key, label, first and last local emote number. */
const EMOTE_GROUPS:readonly (readonly [string,string,number,number])[]=[['wheel','On foot (the wheel)',0,9],['ride','On a ride',60,89],['fly','Flying',20,29],['swim','Swimming',30,39],['npc','With a townsperson',40,49]];

const GAME_LABEL:Record<string,string>={live:'Island Strikers',runner:'Breakaway Run',tennis:'Futbol Tennis',pinball:'Futbol Pinball',puzzle:'Pass Puzzles'};
const SOURCE_LABEL:Record<string,string>={ball:'Hidden ball found',npc:'Islander gift',quiz:'Perfect quiz',explore:'Exploring',journey:'Learning Journey',story:'Story finished',path:'Path finished',pack:'Card pack',starter:'Starter kit'};
const TIER_LABEL:Record<string,string>={icon:'Icon',elite:'Elite',regular:'Regular'};

/** Items of one family `prefix+key`, each suppressed on its own sessions, busiest first; zero items dropped. */
function items(c:Counts,keys:readonly string[],prefix:string,label:(k:string)=>string,detail?:(k:string)=>string|undefined):SponsorItem[]{
 return keys.map(k=>({key:k,label:label(k),value:one(c,prefix+k),detail:detail?.(k)})).filter(i=>i.value!==0)
  .sort((a,b)=>(b.value??0)-(a.value??0)||a.label.localeCompare(b.label));
}
/** Items `prefix+key` found among the range's ids (lessons, card numbers), top `limit`. */
function itemsBy(c:Counts,prefix:string,label:(k:string)=>string,limit=10,detail?:(k:string)=>string|undefined):SponsorItem[]{
 const keys=Object.keys(c.counts).filter(k=>k.startsWith(prefix)&&/^[A-Za-z0-9_]+$/.test(k.slice(prefix.length))).map(k=>k.slice(prefix.length));
 return items(c,keys,prefix,label,detail).slice(0,limit);
}

type Def={id:SponsorMetricId;label:string;unit:string;how:string;gap?:string;
 parts:{key:string;label:string;test:(id:string)=>boolean;engage:boolean;party?:boolean}[];
 /** Reading: the value is minutes of foreground time, not a counter sum. */
 minutes?:boolean;
 detail:(c:Counts,live:boolean,lab:Labels,extra:Extra,partyLive:boolean)=>{breakdowns:SponsorBreakdown[];stats:SponsorStat[]}};
type Extra={firstTry:{right:number;tries:number}|null;arcadeMs:number;studioMs:number};

const DEFS:Def[]=[
 {id:'games',label:'Games played',unit:'plays',
  how:'One play each time a player starts an arcade cabinet (Island Strikers, Breakaway Run, Futbol Tennis, Futbol Pinball, Pass Puzzles), plus each Summit Kick round. Replays count again.',
  gap:'Island matches, Rooftop Knockout, beach soccer and fishing are not counted as games.',
  parts:[...ENGAGE_ARCADE_GAMES.map(g=>({key:g,label:GAME_LABEL[g],test:(k:string)=>k==='en:game_'+g,engage:true})),{key:'summit_kick',label:'Summit Kick',test:(k:string)=>k==='su:kick_play',engage:false}],
  detail:(c,live,_l,x)=>({breakdowns:[],stats:[{label:'Arcade minutes',value:Math.round(x.arcadeMs/60000),format:'min',hint:'Foreground minutes inside arcade games'}]})},
 {id:'shirts',label:'T-shirts designed',unit:'designs',
  how:'One each time a jersey design is saved to a slot in the Kit Shop’s Jersey Studio (re-saving counts again). Buying is counted separately.',
  parts:[{key:'save',label:'Jersey designs saved',test:k=>k==='sh:save_jersey',engage:false}],
  detail:(c,live)=>{const opens=one(c,'sh:open_jersey'),saves=one(c,'sh:save_jersey');
   return {breakdowns:[{id:'style',title:'By pattern',unit:'designs',pending:!live,items:items(c,ENGAGE_JERSEY_PATTERNS,'en:jerseyp_',title)}],
    stats:[{label:'Studio opens',value:opens,format:'int'},{label:'Saved per open',value:ratio(saves,opens),format:'pct'},{label:'Jerseys bought',value:one(c,'sh:buy_jersey'),format:'int'}]};}},
 {id:'cleats',label:'Cleats designed',unit:'designs',
  how:'One each time a boot design is saved to a slot in the Kit Shop’s Boot Studio (re-saving counts again). Buying is counted separately.',
  parts:[{key:'save',label:'Boot designs saved',test:k=>k==='sh:save_boots',engage:false}],
  detail:(c,live)=>{const opens=one(c,'sh:open_boots'),saves=one(c,'sh:save_boots');
   return {breakdowns:[{id:'model',title:'By boot model',unit:'designs',pending:!live,items:items(c,ENGAGE_BOOT_MODELS,'en:bootm_',title)},
     {id:'pattern',title:'By pattern',unit:'designs',pending:!live,items:items(c,ENGAGE_BOOT_PATTERNS,'en:bootp_',title)}],
    stats:[{label:'Studio opens',value:opens,format:'int'},{label:'Saved per open',value:ratio(saves,opens),format:'pct'},{label:'Boots bought',value:one(c,'sh:buy_boots'),format:'int'}]};}},
 {id:'cards',label:'Player cards found',unit:'cards',
  how:'One each time a card that was not already in the player’s binder joins it: picked from a card offer (hidden balls, islander gifts, perfect quizzes, exploring, stories, paths), opened from a card pack, or the starter kit. Duplicates are not counted.',
  parts:ENGAGE_CARD_SOURCES.map(s=>({key:s,label:SOURCE_LABEL[s],test:(k:string)=>k==='en:card_'+s,engage:true})),
  detail:(c,live,l)=>({breakdowns:[
   {id:'top',title:'Most found cards',unit:'times found',pending:!live,items:itemsBy(c,'en:cardn_',k=>l.card?.(Number(k))??`Card #${k}`)},
   {id:'tier',title:'By tier',unit:'cards',pending:!live,note:'Offer cards only (packs and the starter kit have no tier here).',items:items(c,ENGAGE_CARD_TIERS,'en:cardtier_',k=>TIER_LABEL[k])}],stats:[]})},
 {id:'watched',label:'Videos & stories watched',unit:'finished',
  how:'Watched to the end: a lesson video, a card film, a pop-up book read to its last page, or the Island Tutorial. Opening without finishing is shown separately as “started”.',
  parts:[{key:'lesson',label:'Lesson videos',test:pre('le:'),engage:false},{key:'film',label:'Card films',test:k=>k==='en:film_end',engage:true},
   {key:'book',label:'Pop-up books',test:pre('en:bookend_'),engage:true},{key:'tutorial',label:'Island Tutorial',test:k=>k==='tu:finish',engage:false}],
  detail:(c,live,l)=>{const opened=addCells([guarded(c,pre('lo:')),guarded(c,k=>k==='tu:open'),...(live?[one(c,'en:film_open'),guarded(c,pre('en:bookopen_'))]:[])]);
   const done=addCells([guarded(c,pre('le:')),one(c,'tu:finish'),...(live?[one(c,'en:film_end'),guarded(c,pre('en:bookend_'))]:[])]);
   return {breakdowns:[{id:'lessons',title:'Most watched lessons',unit:'watched to the end',items:itemsBy(c,'le:',k=>l.lesson?.(k)??k)},
     {id:'books',title:'Most finished books',unit:'read to the end',pending:!live,items:items(c,ENGAGE_BOOKS,'en:bookend_',k=>l.book?.(k)??title(k))}],
    stats:[{label:'Started',value:opened,format:'int',hint:live?undefined:'Lessons and the tutorial only until the new build is live'},{label:'Finished per start',value:ratio(done,opened),format:'pct'}]};}},
 {id:'books',label:'Books purchased',unit:'books',
  how:'One each time a pop-up book is bought with coins from an island vending machine. The free starter book is not counted.',
  parts:[{key:'buy',label:'Books bought',test:pre('en:bookbuy_'),engage:true}],
  detail:(c,live,l)=>{const t=guarded(c,pre('en:bookbuy_'));
   return {breakdowns:[{id:'book',title:'By book',unit:'bought',pending:!live,items:items(c,ENGAGE_BOOKS,'en:bookbuy_',k=>l.book?.(k)??title(k))}],
    stats:[{label:'Coins spent on books',value:t===null?null:t*100,format:'int',hint:'Each book costs 100 coins',pending:!live}]};}},
 {id:'reading',label:'Read time',unit:'minutes',minutes:true,
  how:'Foreground minutes with a pop-up book open (the tab visible; idle tabs and hidden time do not count). The same clock as “Where they spend time”.',
  parts:[{key:'time',label:'Minutes reading',test:()=>false,engage:false}],
  detail:(c,live,l)=>{const opens=guarded(c,pre('en:bookopen_'));
   return {breakdowns:[{id:'length',title:'Length of a reading visit',unit:'visits',pending:!live,items:items(c,ENGAGE_READ_BUCKETS.map(([b])=>b),'en:',k=>ENGAGE_READ_BUCKETS.find(([b])=>b===k)![1])},
     {id:'opened',title:'Most opened books',unit:'opens',pending:!live,items:items(c,ENGAGE_BOOKS,'en:bookopen_',k=>l.book?.(k)??title(k))}],
    stats:[{label:'Book opens',value:opens,format:'int',pending:!live},{label:'Average minutes per open',value:live&&opens?c.bookMs/60000/opens:null,format:'dec',pending:!live}]};}},
 {id:'quizzes',label:'Quizzes taken',unit:'quizzes',
  how:'One each time a lesson quiz is started (a replay counts again). Finished, perfect and first-try scores are shown in the detail.',
  parts:[{key:'start',label:'Quizzes started',test:pre('ls:'),engage:false}],
  detail:(c,_live,l,x)=>{const st=guarded(c,pre('ls:')),fin=guarded(c,pre('lf:')),all=guarded(c,pre('la:'));
   return {breakdowns:[{id:'top',title:'Most taken quizzes',unit:'started',items:itemsBy(c,'ls:',k=>l.lesson?.(k)??k,10,k=>{const s=c.counts['ls:'+k]||0,f=c.counts['lf:'+k]||0;return s?`${Math.round(Math.min(1,f/s)*100)}% finished`:undefined;})}],
    stats:[{label:'Finished',value:fin,format:'int'},{label:'Finished per start',value:ratio(fin,st),format:'pct'},{label:'All right first try',value:all,format:'int'},
     {label:'First-try answers right',value:x.firstTry&&x.firstTry.tries?x.firstTry.right/x.firstTry.tries:null,format:'pct',hint:'Every question’s first attempt, questions with 5+ sessions'}]};}},
 {id:'social',label:'Minutes with friends',unit:'minutes',
  how:'Whole foreground minutes played while in a live Play with friends party (each player’s own device counts its own minutes once each minute is complete; hidden tabs do not count). Never a party code, a name or who played with whom.',
  gap:'Party sizes come from the host’s device when a party ends (approximate until the party service’s own totals are live).',
  parts:[{key:'min',label:'Minutes in a party',test:k=>k==='mp:min',engage:false,party:true}],
  detail:(c,_live,_l,_x,pl)=>{const mins=one(c,'mp:min'),created=one(c,'mp:created'),inParty=sess(c,'mp:in'),islandMin=Math.round(c.islandMs/60000);
   return {breakdowns:[{id:'size',title:'Party size',unit:'parties',pending:!pl,note:`One per party, from the host’s device; bands under ${MIN_PARTIES} parties are withheld.`,items:partyBands(c,PARTY_PEAK_BUCKETS)},
     {id:'length',title:'Party length',unit:'parties',pending:!pl,items:partyBands(c,PARTY_LEN_BUCKETS)}],
    stats:[{label:'Share of island minutes in a party',value:mins===null||!islandMin?null:Math.min(1,mins/islandMin),format:'pct',pending:!pl},
     {label:'Average party size',value:avgPartySize(c),format:'dec',hint:`Players at once, from the size bands (${MIN_PARTIES}+ parties)`,pending:!pl},
     {label:'Parties per active player',value:created===null||!c.visitors?null:created/c.visitors,format:'dec',hint:'Parties started ÷ daily players (visitor-days)',pending:!pl},
     {label:'Sessions in a party',value:inParty,format:'int',pending:!pl},{label:'Share of sessions in a party',value:inParty===null||!c.sessions?null:Math.min(1,inParty/c.sessions),format:'pct',pending:!pl}]};}},
 {id:'emotes',label:'Emotes used',unit:'emotes',
  how:'One each time a player plays a preset emote (a wave, a high five, a dance, a trick on a ride …) and it is accepted. Preset emotes only: never who an emote was aimed at.',
  parts:EMOTE_GROUPS.map(([key,label,a,b])=>({key,label,test:(k:string)=>{const m=/^em:e(\d+)$/.exec(k);return !!m&&Number(m[1])>=a&&Number(m[1])<=b;},engage:false,party:true})),
  detail:(c,_live,l,_x,pl)=>{const picks=one(c,'em:pick'),emoting=sess(c,'em:reach_1');
   return {breakdowns:[{id:'top',title:'Most used emotes',unit:'times',pending:!pl,items:items(c,EMOTE_WIRE_IDS.map(String),'em:e',k=>l.emote?.(Number(k))??`Emote ${k}`).slice(0,10)}],
    stats:[{label:'Emotes per active player',value:picks===null||!c.visitors?null:picks/c.visitors,format:'dec',hint:'Emotes ÷ daily players (visitor-days)',pending:!pl},
     {label:'Emote engagement (sessions that emoted)',value:emoting===null||!c.sessions?null:Math.min(1,emoting/c.sessions),format:'pct',pending:!pl},
     {label:'Emotes per emoting session',value:ratio(picks,emoting),format:'dec',pending:!pl},
     {label:'A townsperson answered',value:ratio(one(c,'em:to_npc'),picks),format:'pct',pending:!pl}]};}},
];

function countsOf(m:Pick<Merged,'counts'|'countSessions'|'activities'|'totals'>&{areas?:Merged['areas']}):Counts{
 return {counts:m.counts||{},countSessions:m.countSessions||{},bookMs:m.activities.find(a=>a.activity==='book')?.ms||0,sessions:m.totals.sessions,
  visitors:m.totals.visitors||0,islandMs:m.areas?.find(a=>a.area==='island')?.ms||0};
}
const rollCounts=(r:DailyRollup):Counts=>({counts:r.counts||{},countSessions:r.countSessions||{},bookMs:r.activityMs?.book||0,sessions:r.sessions,visitors:r.visitors||0,islandMs:r.areaMs?.island||0});
const engageIn=(c:Record<string,number>)=>Object.keys(c).some(k=>k.startsWith('en:'));
const partyIn=(c:Record<string,number>)=>Object.keys(c).some(k=>k.startsWith('mp:')||k.startsWith('em:'));

function totalOf(d:Def,c:Counts,live:boolean,pending:(p:Def['parts'][number])=>boolean=p=>p.engage&&!live):Cell{
 if(d.minutes)return c.sessions>=MIN_SESSIONS?Math.round(c.bookMs/60000):c.sessions>0?null:0;
 const parts=d.parts.filter(p=>!pending(p));if(!parts.length)return 0;
 return guarded(c,k=>parts.some(p=>p.test(k)));
}

export type SponsorInput={from:string;to:string;merged:Merged;rollups:DailyRollup[];
 prev:{from:string;to:string;merged:Merged}|null;trendRollups?:DailyRollup[];firstTry?:{right:number;tries:number}|null;labels?:Labels};

export function buildSponsor({from,to,merged,rollups,prev,trendRollups,firstTry=null,labels={}}:SponsorInput):SponsorReport{
 const cur=countsOf(merged),pc=prev?countsOf(prev.merged):null;
 const live=engageIn(cur.counts)||(!!pc&&engageIn(pc.counts));
 const partyLive=partyIn(cur.counts)||(!!pc&&partyIn(pc.counts));
 const isPending=(p:Def['parts'][number])=>(p.engage&&!live)||(!!p.party&&!partyLive);
 const trend=(trendRollups&&trendRollups.length>rollups.length?trendRollups:rollups);
 const act=(re:RegExp)=>merged.activities.filter(a=>re.test(a.activity)).reduce((a,r)=>a+r.ms,0);
 const extra:Extra={firstTry,arcadeMs:act(/^arcade_(?!lobby)/),studioMs:act(/^kit_studio$/)};
 const metrics=DEFS.map((d):SponsorMetric=>{
  const pending=d.parts.filter(isPending);
  const status:SponsorMetric['status']=pending.length===d.parts.length?'none':pending.length?'partial':'ok';
  const total=status==='none'?null:totalOf(d,cur,live,isPending),prevT=status==='none'||!pc?null:totalOf(d,pc,live,isPending);
  const {breakdowns,stats}=d.detail(cur,live,labels,extra,partyLive);
  const parts:SponsorPart[]=d.minutes?[]:d.parts.map(p=>({key:p.key,label:p.label,pending:isPending(p),value:isPending(p)?null:guarded(cur,p.test)}));
  if(parts.length>1)breakdowns.unshift({id:'parts',title:d.id==='games'?'By game':d.id==='cards'?'How they were found':'By kind',unit:d.unit,
   items:parts.filter(p=>!p.pending&&p.value!==0).map(p=>({key:p.key,label:p.label,value:p.value})).sort((a,b)=>(b.value??0)-(a.value??0))});
  return {id:d.id,label:d.label,unit:d.unit,status,total,prev:prevT,
   trend:status==='none'?[]:trend.map(r=>totalOf(d,rollCounts(r),live,isPending)),
   daily:status==='none'?[]:rollups.map(r=>({day:r.day,value:totalOf(d,rollCounts(r),live,isPending)})),
   parts,breakdowns,stats,how:d.how,
   gap:[pending.length?`Not tracked yet: ${pending.map(p=>p.label).join(', ')} (counted from the ${pending.some(p=>p.party)?PARTY_SINCE:ENGAGE_SINCE} build once it is live).`:'',d.gap||''].filter(Boolean).join(' ')||undefined};
 });
 const t=merged.totals,pt=prev?.merged.totals;
 return {from,to,prevFrom:prev?.from??'',prevTo:prev?.to??'',min:MIN_SESSIONS,engageLive:live,engageSince:ENGAGE_SINCE,
  trendDays:trend.map(r=>r.day),metrics,
  kpis:{sessions:t.sessions,prevSessions:pt?pt.sessions:null,visitorDays:t.visitors,prevVisitorDays:pt?pt.visitors:null,
   perDay:rollups.length?t.visitors/rollups.length:0,prevPerDay:pt&&rollups.length?pt.visitors/rollups.length:null,
   avgSessionMs:t.sessions?t.engagedMs/t.sessions:0,prevAvgSessionMs:pt&&pt.sessions?pt.engagedMs/pt.sessions:null,engagedMs:t.engagedMs}};
}

/** Signed change (null when there is nothing honest to compare with: withheld, no previous period, or a previous zero). */
export function change(cur:Cell,prev:Cell|null):number|null{
 if(cur===null||prev===null||prev===undefined||prev===0)return null;
 return (cur-prev)/prev;
}

/** The Overview as CSV (one row per metric, then its parts): what the "Download CSV" button saves. */
export function sponsorCsv(r:SponsorReport,extra:{label:string;value:string}[]=[]):string{
 const q=(v:unknown)=>{const s=v===null||v===undefined?'':String(v);return /[",\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s;};
 const cell=(v:Cell)=>v===null?'<5':String(v);
 const rows:unknown[][]=[['Futbol Island engagement',`${r.from} to ${r.to}`,'previous period',`${r.prevFrom} to ${r.prevTo}`],[],
  ['Metric','Part','Total','Previous period','Change','Unit','Status','How it is counted']];
 for(const m of r.metrics){
  const ch=change(m.total,m.prev);
  rows.push([m.label,'',m.status==='none'?'not tracked yet':cell(m.total),m.status==='none'||m.prev===null?'':cell(m.prev),ch===null?'':`${Math.round(ch*100)}%`,m.unit,m.status,m.how+(m.gap?' '+m.gap:'')]);
  for(const p of m.parts)if(m.parts.length>1)rows.push(['',p.label,p.pending?'not tracked yet':cell(p.value),'','',m.unit,'','']);
 }
 if(extra.length){rows.push([]);for(const e of extra)rows.push([e.label,'',e.value]);}
 rows.push([],[`Totals under ${r.min} sessions are shown as <5. Days are Pacific days.`]);
 return rows.map(r=>r.map(q).join(',')).join('\n')+'\n';
}
