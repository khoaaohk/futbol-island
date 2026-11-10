import {cookies} from 'next/headers';
import {ADMIN_COOKIE,cookieOptions,sameOrigin,verifySession} from '@/lib/analytics/adminAuth';
import {bumpSessionEpoch,loadSessionEpoch} from '@/lib/analytics/adminSession';

/** Nov 10 2026: POST = "Sign out everywhere". Bumps the stored session epoch (supabase/migrations/20261111_admin_session_epoch.sql),
 *  so every admin cookie signed before stops working on every instance within 15 s; this browser is signed out too. */
export const dynamic='force-dynamic';
export const runtime='nodejs';
const headers={'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'};
export async function POST(req:Request){
 if(!sameOrigin(req.headers.get('origin'),req.headers.get('host')))return Response.json({error:'origin'},{status:403,headers});
 await loadSessionEpoch();
 if(!verifySession(cookies().get(ADMIN_COOKIE)?.value,Date.now()))return Response.json({error:'unauthorized'},{status:401,headers});
 const r=await bumpSessionEpoch();
 if(r==='missing')return Response.json({ok:false,error:'migration',need:'20261111_admin_session_epoch.sql'},{status:409,headers});
 if(r==='unavailable')return Response.json({ok:false,error:'unavailable'},{status:503,headers});
 cookies().set(ADMIN_COOKIE,'',{...cookieOptions(),maxAge:0});
 return Response.json({ok:true,epoch:r},{headers});
}
