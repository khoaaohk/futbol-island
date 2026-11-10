import {clientIp} from '@/lib/analytics/ingest';
import {createReportLimiter,getReportStore,parseErrorReport} from '@/lib/siteReports';

/**
 * POST /api/error-report (Nov 10 2026): the first-party error beacon (components/ErrorBeacon.tsx, at most 3 per tab session).
 * Body {m, f, l, r}: message, top-frame file, line, route path; at most 2 KB, same-site only, rate-limited per IP. Kept as a
 * daily count keyed by a short hash of the scrubbed first line + file:line, plus the route path (lib/siteReports.ts).
 */
export const dynamic='force-dynamic';
export const runtime='nodejs';
const limiter=createReportLimiter();
const done=()=>new Response(null,{status:204,headers:{'Cache-Control':'no-store'}});

export async function POST(req:Request){
 const origin=req.headers.get('origin'),host=req.headers.get('host')||'';
 if(origin&&origin!=='null'){try{if(new URL(origin).host!==host)return done();}catch{return done();}}
 if(Number(req.headers.get('content-length')||0)>2048)return done();
 if(!limiter.allow(clientIp(req.headers),Date.now()))return done();
 let text='';try{text=await req.text();}catch{return done();}
 const r=parseErrorReport(text,host);
 if(r)try{await getReportStore().hit('err',r.key,r.label);}catch{}
 return done();
}
