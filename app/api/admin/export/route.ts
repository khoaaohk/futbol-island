import {cookies} from 'next/headers';
import {ADMIN_COOKIE,verifySession} from '@/lib/analytics/adminAuth';
import {loadSessionEpoch} from '@/lib/analytics/adminSession';
import {resolveRange} from '@/lib/analytics/core';
import {getStore} from '@/lib/analytics/store';
import {loadDailyLayer} from '@/lib/analytics/dailyAdmin';
import {dailyCsv,definitionsCsv,hoursCsv,summaryCsv,type SummaryExtras} from '@/lib/analytics/exportCsv';
import {storeZip} from '@/lib/analytics/zip';
import {loadPlayers} from '@/lib/analytics/dayAdmin';
import {loadSources} from '@/lib/analytics/liveAdmin';

/**
 * GET /api/admin/export?kind=summary|daily|definitions|hours|zip|json&from=YYYY-MM-DD&to=YYYY-MM-DD (Nov 6 2026): the
 * comprehensive export of the admin Overview (lib/analytics/exportCsv.ts on the daily data layer, lib/analytics/daily.ts).
 * Admin session only, reads only, never cached. `json` is the layer itself (what the dashboard rebuild charts).
 * The Overview's older client-side "Download CSV" (sponsor.ts sponsorCsv) keeps working unchanged.
 */
export const dynamic='force-dynamic';
export const runtime='nodejs';
const noStore={'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'};
const KINDS=['summary','daily','definitions','hours','zip','json'] as const;
type Kind=typeof KINDS[number];

export async function GET(req:Request){
 await loadSessionEpoch();// Nov 10 2026: "Sign out everywhere" (lib/analytics/adminSession.ts)
 if(!verifySession(cookies().get(ADMIN_COOKIE)?.value,Date.now()))return Response.json({error:'unauthorized'},{status:401,headers:noStore});
 const q=new URL(req.url).searchParams,now=new Date();
 const kind=(KINDS as readonly string[]).includes(q.get('kind')||'')?q.get('kind') as Kind:'summary';
 const store=getStore();
 if(!store)return Response.json({error:'not-configured'},{status:503,headers:noStore});
 try{
  let mode:'pacific'|'utc'='pacific';try{mode=await store.timeMode();}catch{mode='utc';}
  const range=resolveRange({range:'custom',from:q.get('from'),to:q.get('to')},now,mode);
  const {layer,medianSessionMs}=await loadDailyLayer(store,range,now,{people:kind!=='hours'});
  if(kind==='json')return Response.json(layer,{headers:noStore});
  const extras=async():Promise<SummaryExtras>=>{
   const [pl,src]=await Promise.all([loadPlayers(range.from,range.to).catch(()=>null),loadSources(range.from,range.to).catch(()=>null)]);
   const players=pl?.status==='ok'?pl.players:null;
   const r=src?.status==='ok'?src.returning:null,known=r&&r.new!==null&&r.returning!==null&&r.new+r.returning>0?r.returning/(r.new+r.returning):null;
   return {playersDistinct:players,returningShare:known,medianSessionMs};
  };
  const base=`futbol-island-${range.from}-to-${range.to}`;
  const csv=(name:string,text:string)=>new Response(text,{headers:{...noStore,'Content-Type':'text/csv; charset=utf-8','Content-Disposition':`attachment; filename="${base}-${name}.csv"`}});
  if(kind==='daily')return csv('daily',dailyCsv(layer));
  if(kind==='definitions')return csv('definitions',definitionsCsv(layer));
  if(kind==='hours')return csv('hours',hoursCsv(layer));
  const summary=summaryCsv(layer,await extras());
  if(kind==='summary')return csv('summary',summary);
  const zip=storeZip([{name:`${base}-summary.csv`,text:summary},{name:`${base}-daily.csv`,text:dailyCsv(layer)},{name:`${base}-definitions.csv`,text:definitionsCsv(layer)},{name:`${base}-hours.csv`,text:hoursCsv(layer)}],now);
  return new Response(zip,{headers:{...noStore,'Content-Type':'application/zip','Content-Disposition':`attachment; filename="${base}.zip"`}});
 }catch{return Response.json({error:'store-unavailable'},{status:502,headers:noStore});}
}
