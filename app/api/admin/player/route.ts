import {cookies} from 'next/headers';
import {ADMIN_COOKIE,verifySession} from '@/lib/analytics/adminAuth';
import {loadPlayer} from '@/lib/analytics/dayAdmin';
import {PID_RE} from '@/lib/analytics/day';

/** GET /api/admin/player?pid=<12 hex>: one anonymous player's sessions and totals (LivePanel.tsx, player mode). Admin session only; cached 30 s. */
export const dynamic='force-dynamic';
export const runtime='nodejs';
const headers={'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'};

export async function GET(req:Request){
 if(!verifySession(cookies().get(ADMIN_COOKIE)?.value,Date.now()))return Response.json({error:'unauthorized'},{status:401,headers});
 const pid=new URL(req.url).searchParams.get('pid')||'';
 if(!PID_RE.test(pid))return Response.json({error:'pid'},{status:400,headers});
 return Response.json(await loadPlayer(pid),{headers});
}
