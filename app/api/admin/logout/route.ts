import {cookies} from 'next/headers';
import {ADMIN_COOKIE,cookieOptions,sameOrigin} from '@/lib/analytics/adminAuth';

export const dynamic='force-dynamic';
export async function POST(req:Request){
 if(!sameOrigin(req.headers.get('origin'),req.headers.get('host')))return Response.json({error:'origin'},{status:403});
 cookies().set(ADMIN_COOKIE,'',{...cookieOptions(),maxAge:0});
 return Response.json({ok:true},{headers:{'Cache-Control':'no-store'}});
}
