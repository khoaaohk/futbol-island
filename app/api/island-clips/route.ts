import {VIDEO_PLAYERS,getPlayerClips} from '@/lib/town/playerClips';
import {recentIslandClips} from '@/lib/town/islandClips';
import {VIDEO_TOPICS,getTopicClips} from '@/lib/town/videoTopics';
import {NextResponse} from 'next/server';
import {isNewsLeague} from '@/lib/town/newsLeagues';
import {getIslandClips,clipMatchesResult} from '@/lib/town/islandClipsServer';
import {getIslandNews} from '@/lib/town/islandNewsServer';
export const dynamic='force-dynamic';
export const maxDuration=30;
export async function GET(request:Request){
 const params=new URL(request.url).searchParams,league=params.get('league'),match=params.get('match');
 const player=params.get('player');
 if(player){if(!VIDEO_PLAYERS.has(player))return NextResponse.json({error:'Unknown player.'},{status:400});return NextResponse.json(await getPlayerClips(player),{headers:{'Cache-Control':'no-store'}});}
 const topic=params.get('topic');
 if(params.get('backup')==='1'){const feeds=await Promise.all([getTopicClips('espn-goals'),getTopicClips('espn-analysis'),getTopicClips('ucl-final-discussion')]);const items=recentIslandClips(feeds.flatMap(feed=>feed.items));return NextResponse.json({items,unavailable:feeds.every(feed=>feed.unavailable),fallback:'channel'},{headers:{'Cache-Control':'no-store'}});}
 if(topic){if(!Object.prototype.hasOwnProperty.call(VIDEO_TOPICS,topic))return NextResponse.json({error:'Unknown video topic.'},{status:400});return NextResponse.json(await getTopicClips(topic),{headers:{'Cache-Control':'no-store'}});}
 if(!league||!isNewsLeague(league)||match&&!/^[\w-]{1,80}$/.test(match))return NextResponse.json({error:'Choose a supported competition and match.'},{status:400});
 const cached=await getIslandClips(league);const feed={...cached,items:recentIslandClips(cached.items)};
 if(match){const scores=await getIslandNews('scores',league),item=scores.items.find(item=>item.id===match);const matches=item?feed.items.filter(clip=>clipMatchesResult(clip,item)).slice(0,1):[];return NextResponse.json({...feed,items:matches.length?matches:feed.items.slice(0,5),fallback:matches.length?undefined:'channel'},{headers:{'Cache-Control':'no-store'}});}
 return NextResponse.json({...feed,items:feed.items.slice(0,5)},{headers:{'Cache-Control':'no-store'}});
}
