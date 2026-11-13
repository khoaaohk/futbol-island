import {cookies} from 'next/headers';
import {ADMIN_COOKIE,verifySession} from '@/lib/analytics/adminAuth';
import {loadSessionEpoch} from '@/lib/analytics/adminSession';
import {validDay} from '@/lib/analytics/dayAdmin';
import {loadPlayModes} from '@/lib/analytics/playModesAdmin';

/** GET /api/admin/play-modes?from=YYYY-MM-DD&to=YYYY-MM-DD: sessions, minutes, players and returning sessions per play mode (Public /
 *  Just me / Party) for those Pacific days (app/admin/LivePanel.tsx day view, app/admin/PlayModesCard.tsx). Admin session only;
 *  aggregates only; cached 30 s on the server. */
export const dynamic='force-dynamic';
export const runtime='nodejs';
const headers={'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'};

export async function GET(req:Request){
 await loadSessionEpoch();// Nov 10 2026: "Sign out everywhere" (lib/analytics/adminSession.ts)
 if(!verifySession(cookies().get(ADMIN_COOKIE)?.value,Date.now()))return Response.json({error:'unauthorized'},{status:401,headers});
 const q=new URL(req.url).searchParams,from=q.get('from'),to=q.get('to');
 if(!validDay(from)||!validDay(to))return Response.json({error:'range'},{status:400,headers});
 return Response.json(await loadPlayModes(from<=to?from:to,from<=to?to:from),{headers});
}
