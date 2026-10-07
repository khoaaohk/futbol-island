import {MAX_BODY_BYTES} from '@/lib/analytics/core';
import {createLimiter,handleIngest} from '@/lib/analytics/ingest';
import {getStore} from '@/lib/analytics/store';

/**
 * First-party, cookie-free visit counter (components/VisitTracker.tsx). Always answers 204 with no body unless the payload is
 * malformed, too large or throttled, so a beacon never learns anything. Without SUPABASE_SERVICE_ROLE_KEY it does nothing.
 * One append-only insert per request; roll-ups and purges run in the nightly cron (app/api/cron/analytics), never here.
 * Recommended on top: a Vercel WAF rate-limit rule on /api/visit (~10 requests/min per IP).
 */
export const dynamic='force-dynamic';
export const runtime='nodejs';
const limiter=createLimiter();
const done=(status:number)=>new Response(null,{status,headers:{'Cache-Control':'no-store'}});

async function readCapped(req:Request,cap:number):Promise<string|null>{
 if(!req.body)return '';
 const reader=req.body.getReader(),chunks:Uint8Array[]=[];let n=0;
 for(;;){const {done:end,value}=await reader.read();if(end)break;n+=value.byteLength;if(n>cap){void reader.cancel();return null;}chunks.push(value);}
 return new TextDecoder().decode(Buffer.concat(chunks));
}

export async function POST(req:Request){
 const store=getStore();
 if(!store)return done(204);
 const body=await readCapped(req,MAX_BODY_BYTES);
 if(body===null)return done(413);
 try{
  const r=await handleIngest({body,headers:req.headers,store,limiter,vercelEnv:process.env.VERCEL_ENV});
  return done(r.status);
 }catch{return done(204);}
}
