import {buildFeed,feedCacheControl,getSponsorStore} from '@/lib/stadium/sponsors/store';
import {pacificToday} from '@/lib/stadium/sponsors/slots';

/**
 * GET /api/stadium-sponsors (Nov 12 2026): the active stadium sponsor pictures for the game (lib/stadium/sponsors). Public,
 * read with the anon key (row-level security returns active rows only), cached at the CDN (feedCacheControl). With no table
 * yet, no rows, no database or any error it answers {placeholder:true, entries:[]} and the game shows its own panels. No cookies,
 * no query parameters, nothing about the caller is read or kept.
 */
export const dynamic='force-dynamic';
export const runtime='nodejs';

export async function GET(){
 const now=new Date(),store=getSponsorStore();
 const r=store?await store.readActive():{status:'unconfigured' as const,rows:[]};
 const feed=store&&r.status==='ok'?buildFeed(r.rows,store,pacificToday(now.getTime()),now.toISOString()):{placeholder:true,generatedAt:now.toISOString(),entries:[]};
 return Response.json(feed,{headers:{'Cache-Control':feedCacheControl(feed.placeholder),'X-Robots-Tag':'noindex'}});
}
