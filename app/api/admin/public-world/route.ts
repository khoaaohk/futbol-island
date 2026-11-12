import {cookies} from 'next/headers';
import {ADMIN_COOKIE,sameOrigin,verifySession} from '@/lib/analytics/adminAuth';
import {loadSessionEpoch} from '@/lib/analytics/adminSession';
import {fetchPublicWorld,setPublicWorldOpen} from '@/lib/analytics/publicWorldAdmin';

/**
 * Nov 11 2026 (public island, phase 1). GET /api/admin/public-world: today's public-world numbers from the relay (worlds open,
 * players in public now, reports by reason, quarantines, open/closed). POST {public:boolean}: the owner's kill switch, forwarded
 * to the relay's POST /control with the CONTROL_TOKEN bearer (env var RELAY_CONTROL_TOKEN, lib/analytics/publicWorldAdmin.ts).
 * Admin session only; the POST is same-origin only. The token never reaches the browser. Counts only.
 */
export const dynamic='force-dynamic';
export const runtime='nodejs';
const headers={'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'};

async function authed(){await loadSessionEpoch();return verifySession(cookies().get(ADMIN_COOKIE)?.value,Date.now());}
export async function GET(){
 if(!await authed())return Response.json({error:'unauthorized'},{status:401,headers});
 return Response.json(await fetchPublicWorld(),{headers});
}
export async function POST(req:Request){
 if(!sameOrigin(req.headers.get('origin'),req.headers.get('host')))return Response.json({error:'origin'},{status:403,headers});
 if(!await authed())return Response.json({error:'unauthorized'},{status:401,headers});
 const text=await req.text();if(text.length>64)return Response.json({error:'too-large'},{status:413,headers});
 let open:unknown;try{open=(JSON.parse(text) as {public?:unknown}).public;}catch{}
 if(typeof open!=='boolean')return Response.json({error:'body'},{status:400,headers});
 const r=await setPublicWorldOpen(open);
 return Response.json(r,{status:r.ok?200:r.status==='not-configured'?409:502,headers});
}
