import {cookies} from 'next/headers';
import {ADMIN_COOKIE,verifySession} from '@/lib/analytics/adminAuth';
import {resolveRange} from '@/lib/analytics/core';
import {buildReportFor} from '@/lib/analytics/report';
import {getStore} from '@/lib/analytics/store';
import {loadSaveMetrics} from '@/lib/saves/metrics';
import {loadSummitKickMetrics} from '@/lib/arcade/kickAdminMetrics';
import {loadFishingMetrics} from '@/lib/analytics/fishingAdminMetrics';
import {loadSources} from '@/lib/analytics/liveAdmin';

export const dynamic='force-dynamic';
export const runtime='nodejs';
const headers={'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'};

export async function GET(req:Request){
 if(!verifySession(cookies().get(ADMIN_COOKIE)?.value,Date.now()))return Response.json({error:'unauthorized'},{status:401,headers});
 const q=new URL(req.url).searchParams,now=new Date();
 // Oct 12 2026: presets and custom dates resolve on the store's clock (Pacific days once 20261012_admin_pacific_time.sql runs).
 try{const report=await buildReportFor(getStore(),mode=>resolveRange({range:q.get('range'),from:q.get('from'),to:q.get('to')},now,mode),now);
  report.saves=await loadSaveMetrics(report.from,report.to,now);
  report.summitKick=await loadSummitKickMetrics(report.from,report.to);
  report.fishing=await loadFishingMetrics(report.from,report.to);
  report.sources=await loadSources(report.from,report.to);
  return Response.json(report,{headers});}
 catch{return Response.json({error:'store-unavailable'},{status:502,headers});}
}
