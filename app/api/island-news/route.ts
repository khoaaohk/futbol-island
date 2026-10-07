import {isNewsLeague} from '@/lib/town/newsLeagues';
import {NextResponse} from 'next/server';
import {getIslandNews} from '@/lib/town/islandNewsServer';
import {feedCacheHeaders} from '@/lib/town/feedCacheHeaders';
export const dynamic='force-dynamic';
export const maxDuration=30;
export async function GET(request:Request){const params=new URL(request.url).searchParams,kind=params.get('kind'),league=params.get('league');if(league&&!isNewsLeague(league))return NextResponse.json({error:'Unknown competition.'},{status:400,headers:feedCacheHeaders(false)});if(kind!=='scores'&&kind!=='transfers')return NextResponse.json({error:'Choose scores or transfers.'},{status:400,headers:feedCacheHeaders(false)});const feed=await getIslandNews(kind,league&&isNewsLeague(league)?league:undefined);return NextResponse.json(feed,{headers:feedCacheHeaders(!feed.unavailable)});}
