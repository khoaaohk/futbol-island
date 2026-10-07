import {cookies} from 'next/headers';
import {ADMIN_COOKIE,verifySession} from '@/lib/analytics/adminAuth';
import {resolveRange} from '@/lib/analytics/core';
import {buildReport} from '@/lib/analytics/report';
import {getStore} from '@/lib/analytics/store';

export const dynamic='force-dynamic';
export const runtime='nodejs';
const headers={'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'};

export async function GET(req:Request){
 if(!verifySession(cookies().get(ADMIN_COOKIE)?.value,Date.now()))return Response.json({error:'unauthorized'},{status:401,headers});
 const q=new URL(req.url).searchParams;
 const range=resolveRange({range:q.get('range'),from:q.get('from'),to:q.get('to')},new Date());
 try{return Response.json(await buildReport(getStore(),range),{headers});}
 catch{return Response.json({error:'store-unavailable'},{status:502,headers});}
}
