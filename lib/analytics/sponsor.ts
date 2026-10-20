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
import {ENGAGE_ARCADE_GAMES,ENGAGE_BOOKS,ENGAGE_BOOT_MODELS,ENGAGE_BOOT_PATTERNS,ENGAGE_CARD_SOURCES,ENGAGE_CARD_TIERS,ENGAGE_JERSEY_PATTERNS,ENGAGE_READ_BUCKETS} from './countIds';

export const SPONSOR_METRICS=['games','shirts','cleats','cards','watched','books','reading','quizzes'] as const;
export type SponsorMetricId=typeof SPONSOR_METRICS[number];
/** The day the `en:` events were added (the build that sends them). Nothing before can carry them. */
export const ENGAGE_SINCE='2026-10-20';
/** Same small-number rule as lib/analytics/learning.ts MIN_SESSIONS (repeated so the client bundle never loads the lesson text). */
export const MIN_SESSIONS=5;

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

type Counts={counts:Record<string,number>;countSessions:Record<string,number>;bookMs:number;sessions:number};
type Labels={card?:(n:number)=>string|undefined;lesson?:(id:string)=>string|undefined;book?:(key:string)=>string|undefined};

const sum=(rec:Record<string,number>,ids:(id:string)=>boolean)=>Object.entries(rec).reduce((a,[k,v])=>ids(k)?a+(v||0):a,0);
const maxOf=(rec:Record<string,number>,ids:(id:string)=>boolean)=>Object.entries(rec).reduce((a,[k,v])=>ids(k)?Math.max(a,v||0):a,0);
/** A total over `ids`, shown once at least MIN_SESSIONS different sessions carry one of them (the busiest id's sessions). */
function guarded(c:Counts,ids:(id:string)=>boolean):Cell{const ss=maxOf(c.countSessions,ids);return ss>=MIN_SESSIONS?sum(c.counts,ids):ss>0?null:0;}
const one=(c:Counts,id:string):Cell=>guarded(c,k=>k===id);
const pre=(p:string)=>(k:string)=>k.startsWith(p);
const ratio=(a:Cell,b:Cell)=>a===null||b===null||!b?null:a/b;
const addCells=(cells:Cell[]):Cell=>cells.some(v=>v===null)?null:cells.reduce<number>((a,v)=>a+(v||0),0);
const title=(s:string)=>s[0].toUpperCase()+s.slice(1);

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
 parts:{key:string;label:string;test:(id:string)=>boolean;engage:boolean}[];
 /** Reading: the value is minutes of foreground time, not a counter sum. */
 minutes?:boolean;
 detail:(c:Counts,live:boolean,lab:Labels,extra:Extra)=>{breakdowns:SponsorBreakdown[];stats:SponsorStat[]}};
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
];

function countsOf(m:Pick<Merged,'counts'|'countSessions'|'activities'|'totals'>):Counts{
 return {counts:m.counts||{},countSessions:m.countSessions||{},bookMs:m.activities.find(a=>a.activity==='book')?.ms||0,sessions:m.totals.sessions};
}
const rollCounts=(r:DailyRollup):Counts=>({counts:r.counts||{},countSessions:r.countSessions||{},bookMs:r.activityMs?.book||0,sessions:r.sessions});
const engageIn=(c:Record<string,number>)=>Object.keys(c).some(k=>k.startsWith('en:'));

function totalOf(d:Def,c:Counts,live:boolean):Cell{
 if(d.minutes)return c.sessions>=MIN_SESSIONS?Math.round(c.bookMs/60000):c.sessions>0?null:0;
 const parts=d.parts.filter(p=>!p.engage||live);if(!parts.length)return 0;
 return guarded(c,k=>parts.some(p=>p.test(k)));
}

export type SponsorInput={from:string;to:string;merged:Merged;rollups:DailyRollup[];
 prev:{from:string;to:string;merged:Merged}|null;trendRollups?:DailyRollup[];firstTry?:{right:number;tries:number}|null;labels?:Labels};

export function buildSponsor({from,to,merged,rollups,prev,trendRollups,firstTry=null,labels={}}:SponsorInput):SponsorReport{
 const cur=countsOf(merged),pc=prev?countsOf(prev.merged):null;
 const live=engageIn(cur.counts)||(!!pc&&engageIn(pc.counts));
 const trend=(trendRollups&&trendRollups.length>rollups.length?trendRollups:rollups);
 const act=(re:RegExp)=>merged.activities.filter(a=>re.test(a.activity)).reduce((a,r)=>a+r.ms,0);
 const extra:Extra={firstTry,arcadeMs:act(/^arcade_(?!lobby)/),studioMs:act(/^kit_studio$/)};
 const metrics=DEFS.map((d):SponsorMetric=>{
  const pending=d.parts.filter(p=>p.engage&&!live);
  const status:SponsorMetric['status']=pending.length===d.parts.length?'none':pending.length?'partial':'ok';
  const total=status==='none'?null:totalOf(d,cur,live),prevT=status==='none'||!pc?null:totalOf(d,pc,live);
  const {breakdowns,stats}=d.detail(cur,live,labels,extra);
  const parts:SponsorPart[]=d.minutes?[]:d.parts.map(p=>({key:p.key,label:p.label,pending:p.engage&&!live,value:p.engage&&!live?null:guarded(cur,p.test)}));
  if(parts.length>1)breakdowns.unshift({id:'parts',title:d.id==='games'?'By game':d.id==='cards'?'How they were found':'By kind',unit:d.unit,
   items:parts.filter(p=>!p.pending&&p.value!==0).map(p=>({key:p.key,label:p.label,value:p.value})).sort((a,b)=>(b.value??0)-(a.value??0))});
  return {id:d.id,label:d.label,unit:d.unit,status,total,prev:prevT,
   trend:status==='none'?[]:trend.map(r=>totalOf(d,rollCounts(r),live)),
   daily:status==='none'?[]:rollups.map(r=>({day:r.day,value:totalOf(d,rollCounts(r),live)})),
   parts,breakdowns,stats,how:d.how,
   gap:[pending.length?`Not tracked yet: ${pending.map(p=>p.label).join(', ')} (counted from the ${ENGAGE_SINCE} build once it is live).`:'',d.gap||''].filter(Boolean).join(' ')||undefined};
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
