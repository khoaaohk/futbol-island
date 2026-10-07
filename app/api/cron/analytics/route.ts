import {cronAuthorized} from '@/lib/analytics/adminAuth';
import {getStore} from '@/lib/analytics/store';

/**
 * Nightly analytics housekeeping (vercel.json crons, 02:30 UTC): freeze final days into daily rollups, purge raw rows older
 * than 14 days and every salt from before today. Vercel Cron sends `Authorization: Bearer $CRON_SECRET`; without the
 * secret configured the route refuses to run.
 */
export const dynamic='force-dynamic';
export const runtime='nodejs';
export async function GET(req:Request){
 if(!cronAuthorized(req.headers.get('authorization'),process.env.CRON_SECRET))return Response.json({error:'unauthorized'},{status:401});
 const store=getStore();
 if(!store)return Response.json({ok:true,skipped:'not-configured'});
 try{const r=await store.finalize(new Date());return Response.json({ok:true,frozen:r.frozen},{headers:{'Cache-Control':'no-store'}});}
 catch{return Response.json({error:'store-unavailable'},{status:502});}
}
