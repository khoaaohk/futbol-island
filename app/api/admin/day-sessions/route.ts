import {cookies} from 'next/headers';
import {ADMIN_COOKIE,verifySession} from '@/lib/analytics/adminAuth';
import {loadDay,validDay} from '@/lib/analytics/dayAdmin';

/** GET /api/admin/day-sessions?day=YYYY-MM-DD: every session of that Pacific day (app/admin/LivePanel.tsx, day mode). Admin session only; cached 30 s on the server. */
export const dynamic='force-dynamic';
export const runtime='nodejs';
const headers={'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'};

export async function GET(req:Request){
 if(!verifySession(cookies().get(ADMIN_COOKIE)?.value,Date.now()))return Response.json({error:'unauthorized'},{status:401,headers});
 const day=new URL(req.url).searchParams.get('day');
 if(!validDay(day))return Response.json({error:'day'},{status:400,headers});
 return Response.json(await loadDay(day),{headers});
}
