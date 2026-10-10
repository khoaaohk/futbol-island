import {cronAuthorized} from '@/lib/analytics/adminAuth';
import {getStore} from '@/lib/analytics/store';
import {getSaveStore} from '@/lib/saves/store';

/**
 * Nightly housekeeping (vercel.json crons, 10:30 UTC = 3:30 am PDT / 2:30 am PST since Oct 12 2026, so it runs just after
 * Pacific midnight whatever the season; it was 02:30 UTC, the middle of the Pacific evening):
 *  - analytics: freeze final days into daily rollups (Pacific days once 20261012_admin_pacific_time.sql is installed), purge
 *    raw rows older than 14 days and every salt from before today (the Pacific today);
 *  - save codes (Oct 10 2026, docs/save-codes.md): delete saves not used for 12 months, throttle rows older than a day and
 *    old IP-bucket salts (save_purge). Skipped quietly until the save migration has run.
 * Vercel Cron sends `Authorization: Bearer $CRON_SECRET`; without the secret configured the route refuses to run.
 */
export const dynamic='force-dynamic';
export const runtime='nodejs';
async function purgeSaves(){
 const saves=getSaveStore();if(!saves)return 'not-configured';
 try{if(await saves.schemaVersion()<1)return 'not-installed';const r=await saves.purge(new Date());return r;}catch{return 'store-unavailable';}
}
export async function GET(req:Request){
 if(!cronAuthorized(req.headers.get('authorization'),process.env.CRON_SECRET))return Response.json({error:'unauthorized'},{status:401});
 const saves=await purgeSaves();
 const store=getStore();
 if(!store)return Response.json({ok:true,skipped:'not-configured',saves});
 try{const r=await store.finalize(new Date());return Response.json({ok:true,frozen:r.frozen,saves},{headers:{'Cache-Control':'no-store'}});}
 catch{return Response.json({error:'store-unavailable',saves},{status:502});}
}
