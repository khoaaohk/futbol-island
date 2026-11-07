import {cookies} from 'next/headers';
import {ADMIN_COOKIE,adminPassword,verifySession} from '@/lib/analytics/adminAuth';
import {resolveRange} from '@/lib/analytics/core';
import {buildReportFor} from '@/lib/analytics/report';
import {getStore} from '@/lib/analytics/store';
import {saveAdminLine} from '@/lib/saves/admin';
import {loadSaveMetrics} from '@/lib/saves/metrics';
import {loadSummitKickMetrics} from '@/lib/arcade/kickAdminMetrics';
import {loadFishingMetrics} from '@/lib/analytics/fishingAdminMetrics';
import {loadSources} from '@/lib/analytics/liveAdmin';
import {labelMarketing} from '@/lib/analytics/marketingLabels';
import {loadDashboard} from '@/lib/analytics/dashboardAdmin';
import type {DashboardData} from '@/lib/analytics/dashboard';
import AdminLogin from './AdminLogin';
import AnalyticsDashboard from './AnalyticsDashboard';

export const dynamic='force-dynamic';
export const runtime='nodejs';

/** /admin: protected on the server. Opens on the last 30 days on every load or reload (Nov 6 2026, the trend rebuild; Today
 *  until then, Oct 15 2026). The report and the trend data (the daily layer) are built in parallel on the server, so the first
 *  paint has the charts. Without a valid signed session cookie only the sign-in card is rendered. */
export default async function AdminPage(){
 if(!adminPassword()||!verifySession(cookies().get(ADMIN_COOKIE)?.value,Date.now()))return <AdminLogin configured={!!adminPassword()}/>;
 const now=new Date(),store=getStore();
 const dashP:Promise<DashboardData|null>=store?(async()=>{let mode:'pacific'|'utc'='pacific';try{mode=await store.timeMode();}catch{mode='utc';}
  return loadDashboard(store,resolveRange({range:'30d'},now,mode),now);})().catch(()=>null):Promise.resolve(null);
 let report;
 try{report=await buildReportFor(store,mode=>resolveRange({range:'30d'},now,mode),now);}
 catch{const {emptyReport}=await import('@/lib/analytics/core');const r=resolveRange({range:'30d'},now);report={...emptyReport(r.from,r.to,now,true),notes:['The analytics store did not answer. The numbers below are empty until it does.']};}
 // Save-code metrics (Oct 11 2026): aggregates only, after the session check; never throws (the status says what is missing).
 report.saves=await loadSaveMetrics(report.from,report.to,now);
 report.summitKick=await loadSummitKickMetrics(report.from,report.to);
 report.fishing=await loadFishingMetrics(report.from,report.to);
 report.sources=await loadSources(report.from,report.to);
 labelMarketing(report.marketing);// Nov 3 2026: the Marketing page tab's card, slide, FAQ and step names
 return <AnalyticsDashboard initial={report} initialDash={await dashP} initialRange="30d" saves={await saveAdminLine()}/>;
}
