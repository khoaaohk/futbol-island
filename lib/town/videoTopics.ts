import {APPROVED_ISLAND_CLIPS} from './approvedIslandClips';
import type {ApprovedIslandClip} from './approvedIslandClips';
import {recentIslandClips} from './islandClips';
import type {IslandClip} from './islandClips';
// Exact publisher IDs, resolved from canonical YouTube channel metadata.
const UEFA='UCyGa1YEx9ST66rYrJTGIKOw',ESPN='UC6c1z7bA__85CIWZ_jpCK-Q',CBS='UCET00YnetHT7tOpu12v8jxg';
export const VIDEO_TOPICS:Record<string,{channel:string;source:string}>=Object.fromEntries([
 ...['scanning','support','pressing','finishing','teamwork'].map(topic=>[`uefa-${topic}`,{channel:UEFA,source:'UEFA'}]),
 ...['goals','analysis','skills'].map(topic=>[`espn-${topic}`,{channel:ESPN,source:'ESPN FC'}]),
 ['ucl-final-result',{channel:UEFA,source:'UEFA'}],
 ['ucl-final-discussion',{channel:CBS,source:'CBS Sports Golazo'}],
]);
// Curated metadata avoids searching/fetching ten feeds. Reviews must explicitly
// tag the concept and verify latest-final claims. No entry is auto-approved.
export function reviewedTopicClips(topic:string,now=Date.now(),approvals:readonly ApprovedIslandClip[]=APPROVED_ISLAND_CLIPS):IslandClip[]{
 const source=VIDEO_TOPICS[topic];if(!source)return [];
 return approvals.filter(c=>{
  const published=Date.parse(c.publishedAt??''),reviewed=Date.parse(c.reviewedAt),expires=Date.parse(c.expiresAt);
  return c.channelId===source.channel&&c.topics?.includes(topic)&&/^[-\w]{11}$/.test(c.id)&&!!c.title?.trim()&&!!c.reviewNote.trim()&&published<=now&&published>=now-3*86400000&&reviewed>=published&&reviewed<=now&&expires>now&&expires<=reviewed+3*86400000;
 }).sort((a,b)=>Date.parse(b.publishedAt!)-Date.parse(a.publishedAt!)).slice(0,5).map(c=>({id:c.id,title:c.title!,publishedAt:c.publishedAt!,source:source.source,views:0,league:'uefa.champions'}));
}

// On-demand official publisher feeds; shared across residents using the same channel.
const channelCache=new Map<string,{until:number;items:IslandClip[];unavailable:boolean}>();
const channelPending=new Map<string,Promise<{items:IslandClip[];unavailable:boolean}>>();
export async function getTopicClips(topic:string,all=false){
 const source=VIDEO_TOPICS[topic];if(!source)return {items:[],unavailable:true};
 const saved=channelCache.get(source.channel);if(saved&&saved.until>Date.now())return select(saved);
 let task=channelPending.get(source.channel);
 if(!task){task=(async()=>{try{const response=await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${source.channel}`,{cache:'no-store',signal:AbortSignal.timeout(7000)});if(!response.ok)throw Error('Unavailable');const xml=await response.text();if(xml.length>1500000)throw Error('Oversized');const {parseClipFeed}=await import('./islandClipsServer');const items=parseClipFeed(xml,'uefa.champions',Date.now(),{id:source.channel,name:source.source});const feed={items,unavailable:false};channelCache.set(source.channel,{...feed,until:Date.now()+600000});return feed;}catch{const feed={items:[],unavailable:true};channelCache.set(source.channel,{...feed,until:Date.now()+60000});return feed;}})().finally(()=>channelPending.delete(source.channel));channelPending.set(source.channel,task);}
 return select(await task);
 function select(feed:{items:IslandClip[];unavailable:boolean}){const patterns:Record<string,RegExp>={'ucl-final-result':/champions|ucl|final/i,'ucl-final-discussion':/champions|ucl|final/i,'uefa-scanning':/scan|vision|awareness|analysis|training/i,'uefa-support':/pass|support|tactic|analysis|training/i,'uefa-pressing':/press|defen|tactic|analysis/i,'uefa-finishing':/finish|goal|shoot|strik/i,'uefa-teamwork':/team|assist|pass|training/i,'espn-goals':/goal|highlight/i,'espn-analysis':/react|analysis|discuss|debate/i,'espn-skills':/skill|dribbl|assist|goal/i};const recent=recentIslandClips(feed.items);const matches=all?recent:recent.filter(c=>patterns[topic]?.test(c.title));return {...feed,items:(matches.length?matches:recent).slice(0,all?15:5),fallback:matches.length?undefined:'channel' as const};}
}
