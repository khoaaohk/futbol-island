import {cookies} from 'next/headers';
import {ADMIN_COOKIE,adminPassword,verifySession} from '@/lib/analytics/adminAuth';
import {resolveRange} from '@/lib/analytics/core';
import {buildReport} from '@/lib/analytics/report';
import {getStore} from '@/lib/analytics/store';
import AdminLogin from './AdminLogin';
import AnalyticsDashboard from './AnalyticsDashboard';

export const dynamic='force-dynamic';
export const runtime='nodejs';

/** /admin: protected on the server. Without a valid signed session cookie only the sign-in card is rendered. */
export default async function AdminPage(){
 if(!adminPassword()||!verifySession(cookies().get(ADMIN_COOKIE)?.value,Date.now()))return <AdminLogin configured={!!adminPassword()}/>;
 const now=new Date();
 let report;
 try{report=await buildReport(getStore(),resolveRange({range:'7d'},now),now);}
 catch{const {emptyReport}=await import('@/lib/analytics/core');const r=resolveRange({range:'7d'},now);report={...emptyReport(r.from,r.to,now,true),notes:['The analytics store did not answer. The numbers below are empty until it does.']};}
 return <AnalyticsDashboard initial={report} initialRange="7d"/>;
}
