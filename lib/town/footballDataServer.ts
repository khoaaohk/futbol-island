// Server only: football-data.org v4 scores provider (imported by lib/town/islandNewsServer.ts, which only API routes import).
// The token is read from process.env.FOOTBALL_DATA_TOKEN on the server and sent only in the X-Auth-Token header to
// api.football-data.org; it is never part of a response, a log line or the client bundle. Docs: docs/product-decisions.md.
import type {IslandNewsItem,MatchGoal} from './islandNews';
import type {NewsLeague} from './newsLeagues';
/** Our league ids -> football-data.org competition codes. Only competitions in the free tier (football-data.org/coverage):
 * WSL (eng.w.1), MLS (usa.1) and J.League (jpn.1) are paid-tier there, so they stay on the secondary source. */
export const FOOTBALL_DATA_CODES:Partial<Record<NewsLeague,string>>={'eng.1':'PL','esp.1':'PD','ita.1':'SA','ger.1':'BL1','fra.1':'FL1','uefa.champions':'CL','bra.1':'BSA'};
/** Required by football-data.org's terms (section 7.1): shown wherever its scores appear. */
export const FOOTBALL_DATA_ATTRIBUTION='Football data provided by the Football-Data.org API';
export const FOOTBALL_DATA_SOURCE='football-data.org';
const API='https://api.football-data.org/v4';
/** Free tier: 10 requests/minute. We keep one in reserve because the provider's minute window is not aligned with ours. */
export const FOOTBALL_DATA_PER_MINUTE=9;
const WINDOW=60000,MAX_WAIT=12000;
/** Overridable in tests (fake time). */
export const footballDataClock={now:()=>Date.now(),sleep:(ms:number)=>new Promise<void>(resolve=>setTimeout(resolve,ms))};
const sent:number[]=[];let blockedUntil=0,queue:Promise<void>=Promise.resolve();
const inflight=new Map<string,Promise<any>>();
let warnedMissing=false;
export function footballDataToken(){const token=process.env.FOOTBALL_DATA_TOKEN?.trim();if(!token&&!warnedMissing){warnedMissing=true;console.warn('[island-news] FOOTBALL_DATA_TOKEN is not set; using the secondary scores source');}return token||undefined;}
export const footballDataCode=(league:NewsLeague)=>FOOTBALL_DATA_CODES[league];
/** Test helper: forget the request window and backoff. */
export function resetFootballDataBudget(){sent.length=0;blockedUntil=0;queue=Promise.resolve();inflight.clear();warnedMissing=false;}
/** Waits for a slot in the rolling one-minute budget (FIFO), or rejects when the wait would outlast the API route. */
function reserve():Promise<void>{
 const turn=queue.then(async()=>{
  for(;;){const now=footballDataClock.now();while(sent.length&&sent[0]<=now-WINDOW)sent.shift();
   const wait=Math.max(blockedUntil-now,sent.length>=FOOTBALL_DATA_PER_MINUTE?sent[0]+WINDOW-now:0);
   if(wait<=0){sent.push(now);return;}
   if(wait>MAX_WAIT)throw new Error('football-data.org request budget used; try again shortly');
   await footballDataClock.sleep(wait);
  }
 });
 queue=turn.catch(()=>{});return turn;
}
/** One GET, shared by every caller asking for the same URL while it is in flight. */
export function footballDataGet(path:string,token:string):Promise<any>{
 const active=inflight.get(path);if(active)return active;
 const task=(async()=>{
  await reserve();
  const response=await fetch(API+path,{cache:'no-store',signal:AbortSignal.timeout(7000),headers:{Accept:'application/json','X-Auth-Token':token,'User-Agent':'FutbolIsland/1.0'}} as RequestInit);
  const reset=Number(response.headers?.get?.('X-RequestCounter-Reset')),left=Number(response.headers?.get?.('X-Requests-Available-Minute'));
  const resetMs=(Number.isFinite(reset)&&reset>0?Math.min(reset,120):60)*1000;
  if(response.status===429){blockedUntil=footballDataClock.now()+resetMs;console.warn('[island-news] source HTTP 429 api.football-data.org; backing off',Math.round(resetMs/1000)+'s');throw new Error('Source rate limited');}
  if(response.headers?.get?.('X-Requests-Available-Minute')!=null&&left<=0)blockedUntil=Math.max(blockedUntil,footballDataClock.now()+resetMs);
  if(!response.ok){console.warn('[island-news] source HTTP',response.status,'api.football-data.org');throw new Error('Source unavailable');}
  return response.json();
 })().finally(()=>inflight.delete(path));
 inflight.set(path,task);return task;
}
const LIVE=new Set(['IN_PLAY','PAUSED','LIVE']),CALLED_OFF=new Set(['POSTPONED','SUSPENDED','CANCELLED']);
const n=(value:unknown)=>typeof value==='number'&&Number.isFinite(value)?value:null;
/** Score after regular + extra time (v4's fullTime also counts shoot-out goals). */
function finalScore(score:any){
 const full=score?.fullTime,regular=score?.regularTime,extra=score?.extraTime;
 if(score?.duration==='PENALTY_SHOOTOUT'&&n(regular?.home)!=null&&n(regular?.away)!=null)return {home:n(regular.home)!+(n(extra?.home)??0),away:n(regular.away)!+(n(extra?.away)??0)};
 return {home:n(full?.home),away:n(full?.away)};
}
/** v4 match list -> island items. Same rules as the ESPN parser: a kickoff window, real team names, and a verified result
 * only when FINISHED with both full-time scores (matchStory.isVerifiedResult also requires a past kickoff). */
export function parseFootballDataMatches(data:any,leagueFor:(code:string)=>NewsLeague|undefined,now:number,maxAgeDays=7):IslandNewsItem[]{
 if(!Array.isArray(data?.matches))throw new Error('Invalid match list');
 return data.matches.flatMap((m:any):IslandNewsItem[]=>{
  const league=leagueFor(String(m?.competition?.code??data?.competition?.code??'')),date=Date.parse(m?.utcDate),status=String(m?.status??'');
  const home=m?.homeTeam?.shortName||m?.homeTeam?.name,away=m?.awayTeam?.shortName||m?.awayTeam?.name;
  if(!league||typeof home!=='string'||typeof away!=='string'||!Number.isFinite(date)||date<now-maxAgeDays*86400000||date>now+48*3600000||m?.id==null)return [];
  const finished=status==='FINISHED'||status==='AWARDED',live=LIVE.has(status),off=CALLED_OFF.has(status),score=finalScore(m.score);
  const state=finished?'post':live?'in':off?'postponed':'pre',shown=finished||live;
  const homeScore=shown&&score.home!=null?String(score.home):'–',awayScore=shown&&score.away!=null?String(score.away):'–';
  // Scorers are paid-tier data; parse them when present, otherwise the story says the details are unavailable.
  const goals:MatchGoal[]=(Array.isArray(m.goals)?m.goals:[]).flatMap((g:any)=>{const player=g?.scorer?.name,minute=n(g?.minute),team=g?.team?.id===m.homeTeam?.id?home:g?.team?.id===m.awayTeam?.id?away:undefined;
   return typeof player==='string'&&minute!=null&&team?[{player,minute:`${minute}'${n(g.injuryTime)?`+${g.injuryTime}'`:''}`,team,ownGoal:g.type==='OWN',penalty:g.type==='PENALTY'}]:[];});
  const total=Number(homeScore)+Number(awayScore);
  const label=finished?(m.score?.duration==='PENALTY_SHOOTOUT'?'FT (penalties)':m.score?.duration==='EXTRA_TIME'?'AET':'FT'):live?'LIVE':off?status[0]+status.slice(1).toLowerCase():'Scheduled';
  return [{league,id:'fd-'+m.id,title:`${home} ${shown?`${homeScore} – ${awayScore}`:'vs'} ${away}`,url:'',source:FOOTBALL_DATA_SOURCE,publishedAt:new Date(date).toISOString(),
   detail:`${m.competition?.name??data?.competition?.name??league} · ${label}`,
   match:{home,away,homeScore,awayScore,state,completed:finished&&score.home!=null&&score.away!=null,goals,goalsComplete:finished&&Number.isFinite(total)&&goals.length===total}}];
 });
}
const ymd=(time:number)=>new Date(time).toISOString().slice(0,10);
/** Past week + the next 48 hours, one request (results, live games and fixtures; the window stays under ten days). */
export function footballDataWeekPath(codes:string[],now:number){
 const range=`dateFrom=${ymd(now-7*86400000)}&dateTo=${ymd(now+2*86400000)}`;
 return codes.length===1?`/competitions/${codes[0]}/matches?${range}`:`/matches?competitions=${codes.join(',')}&${range}`;
}
/** This season's finished matches (one request), for the "no game this week" fallback. */
export const footballDataFinishedPath=(code:string)=>`/competitions/${code}/matches?status=FINISHED`;
/** This season's scheduled matches (one request), only when the season has no recent finished match. */
export const footballDataScheduledPath=(code:string)=>`/competitions/${code}/matches?status=SCHEDULED`;
