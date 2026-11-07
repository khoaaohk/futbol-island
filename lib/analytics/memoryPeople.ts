/**
 * The memory store's stand-ins for the raw-row SQL reads (Nov 6 2026, the /admin rebuild): per-day people + D1/D7 cohorts
 * (docs/analytics-proposed/analytics_daily_people.sql), the players list (analytics_players) and one player's sessions
 * (analytics_player_sessions, supabase/migrations/20261019_analytics_day_sessions.sql). Same JSON shapes as the SQL, so the
 * same parsers (day.ts shapePlayers / shapePlayer, dailyAdmin.ts) read them.
 *
 * Only for ANALYTICS_LOCAL_FILE previews and tests (store.ts createMemoryStore): production reads Supabase, and the people
 * function there stays "needs the people function" until the owner runs the proposed SQL. ANALYTICS_LOCAL_PEOPLE=off makes a
 * local preview behave like production before that SQL (the dashboard's not-installed state). Server only (node crypto).
 *
 * Privacy as in the SQL: a player is 12 hex of a further hash of the keyed player id, a session 6 hex of a hash of its id;
 * never a code, a visitor hash, an IP or a name.
 */
import {createHash} from 'crypto';
import type {BeatRow,StartRow} from './core';
import {RAW_DAYS} from './day';

type Data={starts:Record<string,StartRow>;beats:BeatRow[]};
const PT=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'});
const ptDay=(iso:string|number)=>PT.format(new Date(iso));
const addDays=(day:string,n:number)=>new Date(Date.parse(day+'T00:00:00Z')+n*86_400_000).toISOString().slice(0,10);
export const pidOf=(playerId:string)=>createHash('sha256').update(playerId+':futbol-island-player-v1','utf8').digest('hex').slice(0,12);
const sidOf=(id:string)=>createHash('sha256').update(id+':futbol-island-live-v1','utf8').digest('hex').slice(0,6);
/** The live / day / player per-session counts (analytics_session_rows). */
const COUNT_RULES:[string,(k:string)=>boolean][]=[['balls',k=>k==='su:ball_find'],['fish',k=>k==='fi:land'],['lessons',k=>k.startsWith('lo:')],['quizzes',k=>k.startsWith('lf:')],
 ['swims',k=>k==='wa:swim_start'],['paintings',k=>k==='su:easel_save'],['fruit',k=>k.startsWith('su:fruit_')],['kicks',k=>k==='su:kick_play']];

export const localPeopleOff=()=>process.env.ANALYTICS_LOCAL_PEOPLE==='off';

/** analytics_daily_people(p_from, p_to) → {days, cohorts}. */
export function memoryDailyPeople(data:Data,from:string,to:string,now=new Date()){
 const today=ptDay(now.getTime()),lo=from<to?from:to,hi=from<to?to:from;
 const s=Object.values(data.starts).map(x=>({d:ptDay(x.startedAt),pid:x.playerId??null,ret:x.returning??null}));
 const byDay=new Map<string,{sessions:number;players:Set<string>;returning:number;new:number;unknown:number}>();
 for(const x of s){if(x.d<lo||x.d>hi)continue;const r=byDay.get(x.d)??{sessions:0,players:new Set(),returning:0,new:0,unknown:0};byDay.set(x.d,r);
  r.sessions++;if(x.pid)r.players.add(x.pid);if(x.ret===true)r.returning++;else if(x.ret===false)r.new++;else r.unknown++;}
 const pd=new Map<string,Set<string>>();for(const x of s)if(x.pid){(pd.get(x.pid)??pd.set(x.pid,new Set()).get(x.pid)!).add(x.d);}
 const first=new Map<string,string>();for(const [p,ds] of pd)first.set(p,[...ds].sort()[0]);
 const cohorts=new Map<string,{players:number;d1:number;d7:number}>();
 for(const [p,d0] of first){if(d0<lo||d0>hi)continue;const c=cohorts.get(d0)??{players:0,d1:0,d7:0};cohorts.set(d0,c);c.players++;
  if(pd.get(p)!.has(addDays(d0,1)))c.d1++;if(pd.get(p)!.has(addDays(d0,7)))c.d7++;}
 return {window_days:RAW_DAYS,from:lo,to:hi,
  days:[...byDay.entries()].sort(([a],[b])=>a<b?-1:1).map(([day,r])=>({day,sessions:r.sessions,players:r.players.size,returning:r.returning,new:r.new,unknown:r.unknown})),
  cohorts:[...cohorts.entries()].sort(([a],[b])=>a<b?-1:1).map(([day,c])=>({day,players:c.players,d1:addDays(day,1)<today?c.d1:null,d7:addDays(day,7)<today?c.d7:null}))};
}

function beatsBy(data:Data){const m=new Map<string,BeatRow[]>();for(const b of data.beats)(m.get(b.sessionId)??m.set(b.sessionId,[]).get(b.sessionId)!).push(b);return m;}
const sumRec=(into:Record<string,number>,rec:Record<string,number>|undefined,div=1)=>{for(const [k,v] of Object.entries(rec||{}))if(Number.isFinite(v))into[k]=(into[k]||0)+v/div;};
const top=(rec:Record<string,number>)=>Object.entries(rec).sort((a,b)=>b[1]-a[1])[0]?.[0]??null;

/** One analytics_session_rows row. */
function sessionRow(s:StartRow,beats:BeatRow[],all:StartRow[],bb:Map<string,BeatRow[]>){
 const last=beats.reduce((t,b)=>b.ts>t?b.ts:t,s.startedAt),engaged=beats.reduce((a,b)=>a+(b.engagedMs||0),0);
 const areaMs:Record<string,number>={},actMs:Record<string,number>={},cnt:Record<string,number>={};
 for(const b of beats){sumRec(areaMs,b.areaMs as Record<string,number>);sumRec(actMs,b.activityMs as Record<string,number>);sumRec(cnt,b.counts);}
 const secs=(r:Record<string,number>)=>Object.fromEntries(Object.entries(r).map(([k,v])=>[k,Math.floor(v/1000)]).filter(([,v])=>(v as number)>0));
 const lastBeat=beats.slice().sort((a,b)=>a.ts<b.ts?-1:1).pop();
 const area=lastBeat?top(lastBeat.areaMs as Record<string,number>||{}):null,activity=lastBeat?top(lastBeat.activityMs as Record<string,number>||{}):null;
 const same=all.filter(o=>o.day===s.day&&o.visitorHash===s.visitorHash);
 return {sid:sidOf(s.id),started_at:s.startedAt,last_seen:last,seconds_active:Math.floor(engaged/1000),span_seconds:Math.floor((Date.parse(last)-Date.parse(s.startedAt))/1000),
  device:s.device,entry_path:s.entryPath,country:s.country,region:s.region,source:s.source,referrer_host:s.referrerHost,campaign:s.utmSource??s.utmCampaign??null,
  returning:s.returning??null,has_code:s.hasCode??null,area,activity,previous_area:null,
  spot:area==='island'&&activity&&!['walk','menu','other'].includes(activity)?activity:area,
  areas:secs(areaMs),activities:secs(actMs),counts:Object.fromEntries(COUNT_RULES.map(([k,t])=>[k,Object.entries(cnt).reduce((a,[id,n])=>t(id)?a+n:a,0)])),
  device_today_sessions:same.length,device_today_seconds:Math.floor(same.reduce((a,o)=>a+(bb.get(o.id)||[]).reduce((x,b)=>x+(b.engagedMs||0),0),0)/1000),
  pid:s.playerId?pidOf(s.playerId):null};
}
/** analytics_rows_totals(rows). */
function rowsTotals(rows:ReturnType<typeof sessionRow>[]){
 const tally=(f:(r:typeof rows[number])=>string|null)=>{const m=new Map<string,number>();for(const r of rows){const k=f(r);if(k)m.set(k,(m.get(k)||0)+1);}return [...m].sort((a,b)=>b[1]-a[1]).map(([key,n])=>({key,n}));};
 const areas=new Map<string,{n:number;seconds:number}>();for(const r of rows)for(const [k,v] of Object.entries(r.areas)){const a=areas.get(k)??{n:0,seconds:0};a.n++;a.seconds+=v as number;areas.set(k,a);}
 const countries=new Map<string,{n:number;regions:Map<string,number>}>();
 for(const r of rows){const c=r.country||'(unknown)',t=countries.get(c)??{n:0,regions:new Map()};t.n++;if(r.region)t.regions.set(r.region,(t.regions.get(r.region)||0)+1);countries.set(c,t);}
 const counts:Record<string,number>={};for(const r of rows)sumRec(counts,r.counts);
 return {sessions:rows.length,players:new Set(rows.map(r=>r.pid).filter(Boolean)).size,seconds:rows.reduce((a,r)=>a+r.seconds_active,0),
  by_area:[...areas].sort((a,b)=>b[1].seconds-a[1].seconds).map(([key,a])=>({key,n:a.n,seconds:a.seconds})),
  by_country:[...countries].sort((a,b)=>b[1].n-a[1].n).map(([country,t])=>({country,n:t.n,regions:[...t.regions].map(([region,n])=>({region,n}))})),
  by_source:tally(r=>r.campaign||r.referrer_host||'direct'),by_device:tally(r=>r.device),
  returning:{new:rows.filter(r=>r.returning===false).length,returning:rows.filter(r=>r.returning===true).length,unknown:rows.filter(r=>r.returning===null).length},
  code:{with:rows.filter(r=>r.has_code===true).length,without:rows.filter(r=>r.has_code===false).length,unknown:rows.filter(r=>r.has_code===null).length},counts};
}
const ptMidnight=(day:string)=>{for(const h of [7,8]){const t=Date.parse(day+'T00:00:00Z')+h*3_600_000;if(ptDay(t)===day&&ptDay(t-3_600_000)!==day)return t;}return Date.parse(day+'T08:00:00Z');};

/** analytics_players(p_from, p_to, p_limit). */
export function memoryPlayers(data:Data,from:string,to:string,now=new Date(),limit=500){
 const lo=from<to?from:to,hi=from<to?to:from,today=ptDay(now.getTime()),all=Object.values(data.starts),bb=beatsBy(data);
 const s=all.filter(x=>{const d=ptDay(x.startedAt);return d>=lo&&d<=hi;}),ps=s.filter(x=>x.playerId);
 const by=new Map<string,StartRow[]>();for(const x of ps)(by.get(x.playerId!)??by.set(x.playerId!,[]).get(x.playerId!)!).push(x);
 const rows=[...by.entries()].map(([id,ss])=>{
  const rws=ss.map(x=>sessionRow(x,bb.get(x.id)||[],all,bb)),areas:Record<string,number>={},cnt:Record<string,number>={};
  for(const r of rws){sumRec(areas,r.areas);sumRec(cnt,r.counts);}
  const firstSeen=all.filter(x=>x.playerId===id).reduce((t,x)=>x.startedAt<t?x.startedAt:t,ss[0].startedAt);
  const uniq=(f:(x:StartRow)=>string|null|undefined)=>[...new Set(ss.map(f).filter((v):v is string=>!!v))].sort();
  return {pid:pidOf(id),first_seen:firstSeen,last_seen:rws.reduce((t,r)=>r.last_seen>t?r.last_seen:t,''),sessions:ss.length,days_played:new Set(ss.map(x=>ptDay(x.startedAt))).size,
   seconds:rws.reduce((a,r)=>a+r.seconds_active,0),areas:Object.entries(areas).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,3).map(([key,seconds])=>({key,seconds})),
   devices:uniq(x=>x.device),countries:uniq(x=>x.country),regions:uniq(x=>x.country&&x.region?`${x.country}-${x.region}`:null),
   sources:uniq(x=>x.utmSource??x.utmCampaign??x.referrerHost??'direct'),has_code:ss.some(x=>x.hasCode===true)?true:ss.some(x=>x.hasCode===false)?false:null,
   returning:ss.some(x=>x.returning===true)?true:ss.some(x=>x.returning===false)?false:null,counts:cnt};
 }).sort((a,b)=>a.last_seen<b.last_seen?1:a.last_seen>b.last_seen?-1:a.pid<b.pid?-1:1);
 return {from:lo,to:hi,generated_at:now.toISOString(),window_days:RAW_DAYS,oldest_day:addDays(today,-RAW_DAYS),partial:lo<addDays(today,-RAW_DAYS),
  players:rows.length,sessions:s.length,unattributed:s.length-ps.length,truncated:rows.length>limit,rows:rows.slice(0,limit)};
}

/** analytics_player_sessions(p_pid, p_limit). */
export function memoryPlayer(data:Data,pid:string,now=new Date(),limit=200){
 const all=Object.values(data.starts),bb=beatsBy(data),today=ptDay(now.getTime());
 const mine=all.filter(x=>x.playerId&&pidOf(x.playerId)===pid),rows=mine.map(x=>sessionRow(x,bb.get(x.id)||[],all,bb)).sort((a,b)=>a.started_at<b.started_at?1:-1);
 const firstMs=mine.length?Math.min(...mine.map(x=>Date.parse(x.startedAt))):null;
 return {...rowsTotals(rows),pid:mine.length?pid:null,generated_at:now.toISOString(),window_days:RAW_DAYS,oldest_day:addDays(today,-RAW_DAYS),
  first_seen:rows.length?rows[rows.length-1].started_at:null,last_seen:rows.length?rows.reduce((t,r)=>r.last_seen>t?r.last_seen:t,''):null,
  days_played:new Set(mine.map(x=>ptDay(x.startedAt))).size,partial:firstMs!==null&&firstMs<ptMidnight(addDays(today,-13)),truncated:rows.length>limit,rows:rows.slice(0,limit)};
}
