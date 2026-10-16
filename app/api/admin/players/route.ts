import {cookies} from 'next/headers';
import {ADMIN_COOKIE,verifySession} from '@/lib/analytics/adminAuth';
import {loadPlayers,validDay} from '@/lib/analytics/dayAdmin';

/** GET /api/admin/players?from=YYYY-MM-DD&to=YYYY-MM-DD: one row per anonymous player in the range (LivePanel.tsx, players mode). Admin session only; cached 30 s. */
export const dynamic='force-dynamic';
export const runtime='nodejs';
const headers={'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'};

export async function GET(req:Request){
 if(!verifySession(cookies().get(ADMIN_COOKIE)?.value,Date.now()))return Response.json({error:'unauthorized'},{status:401,headers});
 const q=new URL(req.url).searchParams,from=q.get('from'),to=q.get('to');
 if(!validDay(from)||!validDay(to))return Response.json({error:'range'},{status:400,headers});
 return Response.json(await loadPlayers(from<=to?from:to,from<=to?to:from),{headers});
}
