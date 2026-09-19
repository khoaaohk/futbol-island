import {NEWS_LEAGUES,type NewsLeague} from './newsLeagues';
import type {IslandNewsFeed,IslandNewsItem,IslandNewsKind} from './islandNews';
const TTL=5*60*1000;
const cache=new Map<string,{expires:number;feed:IslandNewsFeed}>();
const pending=new Map<string,Promise<IslandNewsFeed>>();
const leagues=Object.keys(NEWS_LEAGUES);
function safeUrl(value:unknown,domains:string[]):string|null{try{const url=new URL(String(value));return url.protocol==='https:'&&domains.some(domain=>url.hostname===domain||url.hostname.endsWith('.'+domain))?url.href:null;}catch{return null;}}
async function fetchSource(url:string){const response=await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(7000),headers:{Accept:'application/json, application/rss+xml, text/xml','User-Agent':'FutbolIsland/1.0'}});if(!response.ok)throw new Error('Source unavailable');return response;}
export function parseScoreboard(data:any,league:string,now:number):IslandNewsItem[]{
 if(!Array.isArray(data?.events))throw new Error('Invalid scoreboard');
 return (Array.isArray(data?.events)?data.events:[]).flatMap((event:any)=>{
  const competition=event.competitions?.[0],teams=competition?.competitors;if(!Array.isArray(teams)||teams.length!==2)return [];
  const home=teams.find((team:any)=>team.homeAway==='home'),away=teams.find((team:any)=>team.homeAway==='away'),date=Date.parse(event.date),status=competition.status??event.status;
  const url=safeUrl(event.links?.find((link:any)=>safeUrl(link.href,['espn.com']))?.href,['espn.com']);
  if(!home?.team?.displayName||!away?.team?.displayName||!url||!Number.isFinite(date)||date<now-7*86400000||date>now+48*3600000)return [];
  const state=status?.type?.state,score=state==='in'||state==='post'?`${home.score??'–'} – ${away.score??'–'}`:'vs';
  const goals=(Array.isArray(competition.details)?competition.details:[]).filter((goal:any)=>goal.scoringPlay===true&&!goal.shootout).flatMap((goal:any)=>{
   const player=goal.athletesInvolved?.[0]?.displayName,minute=goal.clock?.displayValue,team=teams.find((t:any)=>String(t.id)===String(goal.team?.id))?.team?.displayName;
   return typeof player==='string'&&typeof minute==='string'&&team?[{player,minute,team,ownGoal:goal.ownGoal===true,penalty:goal.penaltyKick===true}]:[];
  });
  const match={home:home.team.displayName,away:away.team.displayName,homeScore:String(home.score??'–'),awayScore:String(away.score??'–'),state:String(state??'pre'),goals,goalsComplete:Number.isFinite(Number(home.score))&&Number.isFinite(Number(away.score))&&goals.length===Number(home.score)+Number(away.score)};
  return [{league,match,id:String(event.id),title:`${home.team.displayName} ${score} ${away.team.displayName}`,url,source:'ESPN',publishedAt:new Date(date).toISOString(),detail:`${data.leagues?.[0]?.name??league} · ${status?.type?.shortDetail??status?.type?.description??'Scheduled'}`}];
 });
}
function decodeXml(value:string){return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/&#(x[0-9a-f]+|[0-9]+);/gi,(_,code)=>{const number=code[0].toLowerCase()==='x'?parseInt(code.slice(1),16):Number(code);return number>0&&number<=0x10ffff?String.fromCodePoint(number):'';}).replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/<[^>]*>/g,'').trim();}
export function parseTransferRss(xml:string,source:'BBC Sport'|'The Guardian',now:number):IslandNewsItem[]{
 if(!/<rss\b/i.test(xml))throw new Error('Invalid news feed');
 const read=(item:string,tag:string)=>decodeXml(item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`,'i'))?.[1]??'');
 return Array.from(xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)).flatMap((match)=>{const item=match[1],title=read(item,'title'),url=safeUrl(read(item,'link'),source==='BBC Sport'?['bbc.co.uk','bbc.com']:['theguardian.com']),published=Date.parse(read(item,'pubDate'));
  if(!title||!url||!Number.isFinite(published)||published<now-7*86400000||published>now+5*60000)return [];
  if(source==='BBC Sport'&&!/transfer|signing|signs|signed|loan|gossip|contract|deal|bid/i.test(title))return [];
  return [{id:url,title,url,source,publishedAt:new Date(published).toISOString(),detail:'Transfer report · may include speculation'}];
 });
}
async function load(kind:IslandNewsKind,selectedLeague?:NewsLeague):Promise<IslandNewsFeed>{
 const now=Date.now();let results:PromiseSettledResult<IslandNewsItem[]>[];
 if(kind==='scores'){
  const day=(time:number)=>new Date(time).toISOString().slice(0,10).replace(/-/g,'');
  // Soccer scoreboards accept individual days, not date ranges. Fetch only the
  // chosen league, with at most three server requests in flight, then cache it.
  const jobs=selectedLeague?Array.from({length:9},(_,i)=>({league:selectedLeague,date:day(now+(i-7)*86400000)})):leagues.map(league=>({league,date:''}));
  results=[];
  for(let i=0;i<jobs.length;i+=3){const batch=await Promise.allSettled(jobs.slice(i,i+3).map(async({league,date})=>parseScoreboard(await(await fetchSource(`https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/scoreboard${date?`?dates=${date}&limit=100`:''}`)).json(),league,now)));results.push(...batch);} 
 }else results=await Promise.allSettled([['https://feeds.bbci.co.uk/sport/football/rss.xml','BBC Sport'],['https://www.theguardian.com/football/transfer-window/rss','The Guardian']].map(async([url,source])=>parseTransferRss(await(await fetchSource(url)).text(),source as 'BBC Sport'|'The Guardian',now)));
 const successes=results.filter((result):result is PromiseFulfilledResult<IslandNewsItem[]>=>result.status==='fulfilled');
 const items=successes.flatMap(result=>result.value);const unique=Array.from(new Map(items.map(item=>[item.id,item])).values());
 if(kind==='scores')unique.sort((a,b)=>{const rank=(item:IslandNewsItem)=>/\d['’]|half|HT|LIVE/i.test(item.detail)?0:Date.parse(item.publishedAt)<=now?1:2;return rank(a)-rank(b)||Math.abs(now-Date.parse(a.publishedAt))-Math.abs(now-Date.parse(b.publishedAt));});else unique.sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt));
 return {kind,fetchedAt:new Date(now).toISOString(),items:unique.slice(0,kind==='scores'?48:8),unavailable:successes.length===0,partial:successes.length<results.length};
}
export async function getIslandNews(kind:IslandNewsKind,league?:NewsLeague){const key=kind+':'+(kind==='scores'?league??'all':'all'),saved=cache.get(key);if(saved&&saved.expires>Date.now())return saved.feed;const active=pending.get(key);if(active)return active;const task=load(kind,league).then(feed=>{cache.set(key,{feed,expires:Date.now()+(feed.unavailable?30000:TTL)});return feed;}).finally(()=>pending.delete(key));pending.set(key,task);return task;}
