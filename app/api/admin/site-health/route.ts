import {cookies} from 'next/headers';
import {ADMIN_COOKIE,verifySession} from '@/lib/analytics/adminAuth';
import {loadSessionEpoch} from '@/lib/analytics/adminSession';
import {getReportStore} from '@/lib/siteReports';

/** GET /api/admin/site-health?days=7 (Nov 10 2026): the top 20 error beacons and CSP reports over the last 1-30 days
 *  (app/admin/SiteHealthSection.tsx). Admin session only. Daily counts only (lib/siteReports.ts). */
export const dynamic='force-dynamic';
export const runtime='nodejs';
const headers={'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'};
export async function GET(req:Request){
 await loadSessionEpoch();
 if(!verifySession(cookies().get(ADMIN_COOKIE)?.value,Date.now()))return Response.json({error:'unauthorized'},{status:401,headers});
 const d=Number(new URL(req.url).searchParams.get('days')),days=Number.isInteger(d)&&d>=1&&d<=30?d:7,store=getReportStore();
 const [err,csp]=await Promise.all([store.top('err',days,20),store.top('csp',days,20)]);
 return Response.json({days,err,csp},{headers});
}
