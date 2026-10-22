import {cookies} from 'next/headers';
import {ADMIN_COOKIE,verifySession} from '@/lib/analytics/adminAuth';
import {validDay} from '@/lib/analytics/dayAdmin';
import {loadPartyRetention} from '@/lib/analytics/partyRetention';

/** GET /api/admin/party-retention?from=YYYY-MM-DD&to=YYYY-MM-DD: Play with friends retention and virality (Phase C,
 *  app/admin/PartyRetentionCard.tsx). Admin session only; aggregates only (groups under 10 are null); cached 60 s. Answers
 *  status 'off' without touching Supabase unless NEXT_PUBLIC_ANALYTICS_PARTY_RETENTION=1 (legal sign-off first). */
export const dynamic='force-dynamic';
export const runtime='nodejs';
const headers={'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'};

export async function GET(req:Request){
 if(!verifySession(cookies().get(ADMIN_COOKIE)?.value,Date.now()))return Response.json({error:'unauthorized'},{status:401,headers});
 const q=new URL(req.url).searchParams,from=q.get('from'),to=q.get('to');
 if(!validDay(from)||!validDay(to))return Response.json({error:'range'},{status:400,headers});
 return Response.json(await loadPartyRetention(from<=to?from:to,from<=to?to:from),{headers});
}
