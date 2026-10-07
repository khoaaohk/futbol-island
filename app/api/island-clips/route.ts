import {VIDEO_PLAYERS,getPlayerClips} from '@/lib/town/playerClips';
import {recentIslandClips} from '@/lib/town/islandClips';
import {VIDEO_TOPICS,getTopicClips} from '@/lib/town/videoTopics';
import {NextResponse} from 'next/server';
import {isNewsLeague} from '@/lib/town/newsLeagues';
import {getIslandClips,clipMatchesResult} from '@/lib/town/islandClipsServer';
import {getIslandNews} from '@/lib/town/islandNewsServer';
import {feedCacheHeaders} from '@/lib/town/feedCacheHeaders';
export const dynamic='force-dynamic';
export const maxDuration=30;
const send=(body:{unavailable?:boolean}&Record<string,unknown>)=>NextResponse.json(body,{headers:feedCacheHeaders(!body.unavailable)});
const fail=(error:string)=>NextResponse.json({error},{status:400,headers:feedCacheHeaders(false)});
export async function GET(request:Request){
 const params=new URL(request.url).searchParams,league=params.get('league'),match=params.get('match');
 const player=params.get('player');
 if(player){if(!VIDEO_PLAYERS.has(player))return fail('Unknown player.');return send(await getPlayerClips(player));}
 const topic=params.get('topic');
 if(params.get('backup')==='1'){const feeds=await Promise.all([getTopicClips('espn-goals'),getTopicClips('espn-analysis'),getTopicClips('ucl-final-discussion')]);const items=recentIslandClips(feeds.flatMap(feed=>feed.items),Date.now(),feeds.some(feed=>feed.fallback==='curated'));return send({items,unavailable:feeds.every(feed=>feed.unavailable),fallback:'channel'});}
 if(topic){if(!Object.prototype.hasOwnProperty.call(VIDEO_TOPICS,topic))return fail('Unknown video topic.');return send(await getTopicClips(topic));}
 if(!league||!isNewsLeague(league)||match&&!/^[\w-]{1,80}$/.test(match))return fail('Choose a supported competition and match.');
 const cached=await getIslandClips(league);const feed={...cached,items:recentIslandClips(cached.items,Date.now(),cached.fallback==='curated')};
 // The match lookup reads the shared score store (refreshed by the cron), so it does not fan out to the score sources.
 if(match){const scores=await getIslandNews('scores',league),item=[...scores.items,...(scores.lastResults??[])].find(item=>item.id===match);const matches=item?feed.items.filter(clip=>clipMatchesResult(clip,item)).slice(0,1):[];return send({...feed,items:matches.length?matches:feed.items.slice(0,5),fallback:matches.length?undefined:feed.fallback??'channel'});}
 return send({...feed,items:feed.items.slice(0,5)});
}
