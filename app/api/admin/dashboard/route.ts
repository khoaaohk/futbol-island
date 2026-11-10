import {cookies} from 'next/headers';
import {ADMIN_COOKIE,verifySession} from '@/lib/analytics/adminAuth';
import {loadSessionEpoch} from '@/lib/analytics/adminSession';
import {resolveRange} from '@/lib/analytics/core';
import {getStore} from '@/lib/analytics/store';
import {loadDashboard} from '@/lib/analytics/dashboardAdmin';

/**
 * GET /api/admin/dashboard?range=today|7d|14d|30d|90d|all|custom&from=&to= (Nov 6 2026): the /admin dashboard's trend data, the
 * daily data layer trimmed to the series the tabs draw (lib/analytics/dashboardAdmin.ts). The same layer as /api/admin/export,
 * so the dashboard and the export agree. Admin session only, reads only, never cached.
 */
export const dynamic='force-dynamic';
export const runtime='nodejs';
const headers={'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'};

export async function GET(req:Request){
 await loadSessionEpoch();// Nov 10 2026: "Sign out everywhere" (lib/analytics/adminSession.ts)
 if(!verifySession(cookies().get(ADMIN_COOKIE)?.value,Date.now()))return Response.json({error:'unauthorized'},{status:401,headers});
 const q=new URL(req.url).searchParams,now=new Date(),store=getStore();
 if(!store)return Response.json({error:'not-configured'},{status:503,headers});
 try{
  let mode:'pacific'|'utc'='pacific';try{mode=await store.timeMode();}catch{mode='utc';}
  const range=resolveRange({range:q.get('range'),from:q.get('from'),to:q.get('to')},now,mode);
  return Response.json(await loadDashboard(store,range,now),{headers});
 }catch{return Response.json({error:'store-unavailable'},{status:502,headers});}
}
