import {cookies} from 'next/headers';
import {ADMIN_COOKIE,cookieOptions,readSession,renewSession,sameOrigin,verifySession} from '@/lib/analytics/adminAuth';
import {loadSessionEpoch} from '@/lib/analytics/adminSession';

/** Nov 16 2026: POST = sliding renewal of a REMEMBERED admin session ("Remember this device for 30 days"). /admin calls it on
 *  load only when its remembered session has under 7 days left; it re-issues the token for 30 more days with the current epoch.
 *  A plain 12 h session is never extended. Same-origin only, the session is checked like every /api/admin route. */
export const dynamic='force-dynamic';
export const runtime='nodejs';
const headers={'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'};
export async function POST(req:Request){
 if(!sameOrigin(req.headers.get('origin'),req.headers.get('host')))return Response.json({error:'origin'},{status:403,headers});
 await loadSessionEpoch();
 const now=Date.now();
 if(!verifySession(cookies().get(ADMIN_COOKIE)?.value,now))return Response.json({error:'unauthorized'},{status:401,headers});
 const token=cookies().get(ADMIN_COOKIE)?.value,s=readSession(token,now);
 if(!s)return Response.json({error:'unauthorized'},{status:401,headers});
 const fresh=renewSession(token,now);
 if(!fresh)return Response.json({ok:true,remembered:s.remember,until:s.remember?s.exp:null,renewed:false},{headers});
 cookies().set(ADMIN_COOKIE,fresh,cookieOptions(true));
 return Response.json({ok:true,remembered:true,until:readSession(fresh,now)?.exp??null,renewed:true},{headers});
}
