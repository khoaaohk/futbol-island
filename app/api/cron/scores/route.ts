import {NextResponse} from 'next/server';
import {isCronAuthorized} from '@/lib/town/cronAuth';
import {refreshIslandNewsStore} from '@/lib/town/islandNewsServer';
// Vercel Cron (every 5 minutes): refreshes the shared score/news store that /api/island-news and /api/island-clips read, so
// visitors never fan out to football-data.org / ESPN while the store is warm. Protected by CRON_SECRET.
export const dynamic='force-dynamic';
export const runtime='nodejs';
export const maxDuration=120;
export async function GET(request:Request){
 if(!isCronAuthorized(request.headers.get('authorization')))return NextResponse.json({error:'unauthorized'},{status:401,headers:{'Cache-Control':'no-store'}});
 const result=await refreshIslandNewsStore();
 // One line per run so the Vercel logs show which store was used ('runtime' = shared across instances) and the source health.
 console.log(`[cron/scores] store=${result.store} footballData=${result.footballData}`);
 return NextResponse.json({ok:true,...result},{headers:{'Cache-Control':'no-store'}});
}
