import {cookies} from 'next/headers';
import {ADMIN_COOKIE,verifySession} from '@/lib/analytics/adminAuth';
import {validDay} from '@/lib/analytics/dayAdmin';
import {loadRelayStats} from '@/lib/analytics/relayStatsAdmin';

/**
 * GET /api/admin/party-stats?from=YYYY-MM-DD&to=YYYY-MM-DD: the party relay's daily totals and live gauge (FriendsSection "Health",
 * LivePanel "Parties now"). Admin session only; the relay's bearer token stays on the server (lib/analytics/relayStatsAdmin.ts);
 * cached 60 s. Totals and fixed bands only: never a code, name or address.
 */
export const dynamic='force-dynamic';
export const runtime='nodejs';
const headers={'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'};

export async function GET(req:Request){
 if(!verifySession(cookies().get(ADMIN_COOKIE)?.value,Date.now()))return Response.json({error:'unauthorized'},{status:401,headers});
 const q=new URL(req.url).searchParams,from=q.get('from'),to=q.get('to');
 if(!validDay(from)||!validDay(to))return Response.json({error:'range'},{status:400,headers});
 return Response.json(await loadRelayStats(from<=to?from:to,from<=to?to:from),{headers});
}
