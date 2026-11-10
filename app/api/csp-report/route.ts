import {clientIp} from '@/lib/analytics/ingest';
import {MAX_REPORT_BYTES,createReportLimiter,cspKey,getReportStore,parseCspReports} from '@/lib/siteReports';

/**
 * POST /api/csp-report (Nov 10 2026): the report-only CSP's `report-uri` and `report-to` endpoint (next.config.mjs). Accepts
 * application/csp-report and application/reports+json, at most 16 KB and 10 reports a request, rate-limited per IP. Keeps only
 * daily counts of directive + blocked host + page path (lib/siteReports.ts); always answers 204 with no body.
 */
export const dynamic='force-dynamic';
export const runtime='nodejs';
const limiter=createReportLimiter();
const done=()=>new Response(null,{status:204,headers:{'Cache-Control':'no-store'}});

export async function POST(req:Request){
 const len=Number(req.headers.get('content-length')||0);
 if(len>MAX_REPORT_BYTES)return done();
 if(!limiter.allow(clientIp(req.headers),Date.now()))return done();
 let text='';try{text=await req.text();}catch{return done();}
 if(text.length>MAX_REPORT_BYTES)return done();
 const store=getReportStore();
 for(const h of parseCspReports(text))try{await store.hit('csp',cspKey(h),'');}catch{}
 return done();
}
