import {APPROVED_ISLAND_CLIPS,type ApprovedIslandClip} from './approvedIslandClips';
import {NEWS_LEAGUES,type NewsLeague} from './newsLeagues';
import type {IslandClip,IslandClipFeed} from './islandClips';
import type {IslandNewsItem} from './islandNews';
// Resolved from the official publisher channels, September 16, 2026.
export const CLIP_CHANNELS:Record<NewsLeague,{id:string;name:string}>={
 'eng.1':{id:'UCG5qGWdu8nIRZqJ_GgDwQ-w',name:'Premier League'},'esp.1':{id:'UCTv-XvfzLX3i4IGWAm4sbmA',name:'LALIGA'},
 'jpn.1':{id:'UCmQp6ZaAejJKKkXc_Y_lh1A',name:'J.LEAGUE International'},'fra.1':{id:'UCQsH5XtIc9hONE1BQjucM0g',name:'Ligue 1'},
 'ita.1':{id:'UCBJeMCIeLQos7wacox4hmLQ',name:'Serie A'},'ger.1':{id:'UC6UL29enLNe4mqwTfAyeNuw',name:'Bundesliga'},
 'bra.1':{id:'UCdQuDaRww5NkKpQQ1BJBWww',name:'CBF / Brasil'},'uefa.champions':{id:'UCyGa1YEx9ST66rYrJTGIKOw',name:'UEFA'},
 'eng.w.1':{id:'UCnQpt1UxLq00NFULxTDHMww',name:'Barclays WSL'},'usa.1':{id:'UCSZbXT5TLLW_i-5W8FZpFsg',name:'MLS'},
};
const decode=(s:string)=>s.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');
export function parseClipFeed(xml:string,league:NewsLeague,now=Date.now(),publisher?:{id:string;name:string}):IslandClip[]{
 if(!/<feed\b/.test(xml))throw Error('Invalid video feed');const source=publisher??CLIP_CHANNELS[league];
 return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].flatMap(([,entry])=>{
  const read=(tag:string)=>decode(entry.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`))?.[1]??'');
  const id=read('yt:videoId'),title=read('title'),publishedAt=read('published'),date=Date.parse(publishedAt);
  if(read('yt:channelId')!==source.id||!/^[-\w]{11}$/.test(id)||!title||!Number.isFinite(date)||date>now||date<now-14*86400000)return [];
  // Do not present old-game retrospectives as fresh match highlights.
  if(/\b(classic|throwback|archive|full match|live stream)\b/i.test(title))return [];
  if(!publisher&&league==='uefa.champions'&&!/champions|\bucl\b/i.test(title))return [];
  if(!publisher&&league==='bra.1'&&!/brasileir|s[eé]rie a/i.test(title))return [];
  const views=Number(entry.match(/<media:statistics\s+views="(\d+)"/)?.[1]??0);
  return [{id,title:title.slice(0,240),publishedAt,source:source.name,views:Number.isFinite(views)?views:0,league}];
 }).slice(0,15);
}
const normal=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const aliases:Record<string,string[]>={'manchester united':['man utd','man united'],'manchester city':['man city'],'tottenham hotspur':['tottenham','spurs'],'wolverhampton wanderers':['wolves'],'brighton hove albion':['brighton'],'paris saint germain':['psg'],'internazionale':['inter'],'bayern munich':['bayern munchen','bayern'],'borussia dortmund':['dortmund'],'atletico madrid':['atletico de madrid'],'athletic club':['athletic bilbao'],'athletico paranaense':['athletico pr'],'flamengo':['flamengo'],'new york red bulls':['ny red bulls']};
export function clipMatchesResult(clip:IslandClip,item:IslandNewsItem){
 if(!item.match||item.match.state!=='post'||item.league!==clip.league)return false;
 const delta=Date.parse(clip.publishedAt)-Date.parse(item.publishedAt);if(delta<0||delta>48*3600000)return false;
 const title=' '+normal(clip.title)+' ';
 const hasTeam=(team:string)=>{const name=normal(team).replace(/\b(fc|cf|afc|sc)\b/g,'').replace(/\s+/g,' ').trim();return [name,...(aliases[name]??[])].some(alias=>alias.length>=4&&title.includes(' '+alias+' '));};
 return hasTeam(item.match.home)&&hasTeam(item.match.away)&&/highlight|resumen|resumo|melhores momentos|ハイライト|resume/i.test(clip.title);
}
/** Public results are filtered on every response, even when the source feed is cached. */
export function childReviewedClips(items:IslandClip[],now=Date.now(),approvals:readonly ApprovedIslandClip[]=APPROVED_ISLAND_CLIPS){
 return items.filter(clip=>{
  const source=CLIP_CHANNELS[clip.league],published=Date.parse(clip.publishedAt);
  if(!source||!Number.isFinite(published)||published>now||published<now-3*86400000)return false;
  const approval=approvals.find(entry=>entry.id===clip.id&&entry.channelId===source.id);
  if(!approval||!approval.reviewNote.trim())return false;
  const reviewed=Date.parse(approval.reviewedAt),expires=Date.parse(approval.expiresAt);
  return Number.isFinite(reviewed)&&Number.isFinite(expires)&&reviewed>=published&&reviewed<=now&&expires>now&&expires>reviewed&&expires<=reviewed+3*86400000;
 });
}
const cached=new Map<NewsLeague,{until:number;feed:IslandClipFeed}>(),pending=new Map<NewsLeague,Promise<IslandClipFeed>>();
export async function getIslandClips(league:NewsLeague):Promise<IslandClipFeed>{
 if(!(league in NEWS_LEAGUES))return {items:[],unavailable:true};const saved=cached.get(league);if(saved&&saved.until>Date.now())return saved.feed;const existing=pending.get(league);if(existing)return existing;
 const task=(async()=>{let feed:IslandClipFeed;try{const response=await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${CLIP_CHANNELS[league].id}`,{cache:'no-store',signal:AbortSignal.timeout(7000)});if(!response.ok)throw Error('Unavailable');const xml=await response.text();if(xml.length>1500000)throw Error('Oversized feed');feed={items:parseClipFeed(xml,league).sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt)),unavailable:false};}catch{feed={items:[],unavailable:true};}cached.set(league,{until:Date.now()+(feed.unavailable?60000:600000),feed});return feed;})().finally(()=>pending.delete(league));pending.set(league,task);return task;
}
