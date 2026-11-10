import {cookies} from 'next/headers';
import {ADMIN_COOKIE,verifySession} from '@/lib/analytics/adminAuth';
import {loadSessionEpoch} from '@/lib/analytics/adminSession';
import {validDay} from '@/lib/analytics/dayAdmin';
import {loadSponsorSplit} from '@/lib/analytics/sponsorAdmin';

/** GET /api/admin/sponsor-split?from=YYYY-MM-DD&to=YYYY-MM-DD: the sponsor Overview's device / country drill-down (app/admin/SponsorOverview.tsx). Admin session only; aggregates only; cached 30 s. */
export const dynamic='force-dynamic';
export const runtime='nodejs';
const headers={'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'};

export async function GET(req:Request){
 await loadSessionEpoch();// Nov 10 2026: "Sign out everywhere" (lib/analytics/adminSession.ts)
 if(!verifySession(cookies().get(ADMIN_COOKIE)?.value,Date.now()))return Response.json({error:'unauthorized'},{status:401,headers});
 const q=new URL(req.url).searchParams,from=q.get('from'),to=q.get('to');
 if(!validDay(from)||!validDay(to))return Response.json({error:'range'},{status:400,headers});
 return Response.json(await loadSponsorSplit(from<=to?from:to,from<=to?to:from),{headers});
}
