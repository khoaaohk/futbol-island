import {cookies} from 'next/headers';
import {ADMIN_COOKIE,verifySession} from '@/lib/analytics/adminAuth';
import {liveMinutes,loadLive} from '@/lib/analytics/liveAdmin';

/** GET /api/admin/live?minutes=2|5|15: the "On now" slide-out (app/admin/LivePanel.tsx). Admin session only; cached 5 s on the server. */
export const dynamic='force-dynamic';
export const runtime='nodejs';
const headers={'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'};

export async function GET(req:Request){
 if(!verifySession(cookies().get(ADMIN_COOKIE)?.value,Date.now()))return Response.json({error:'unauthorized'},{status:401,headers});
 return Response.json(await loadLive(liveMinutes(new URL(req.url).searchParams.get('minutes'))),{headers});
}
