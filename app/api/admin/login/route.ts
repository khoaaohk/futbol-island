import {cookies} from 'next/headers';
import {ADMIN_COOKIE,adminPassword,cookieOptions,createLockout,passwordMatches,sameOrigin,signSession} from '@/lib/analytics/adminAuth';
import {clientIp} from '@/lib/analytics/ingest';

export const dynamic='force-dynamic';
export const runtime='nodejs';
const lockout=createLockout();
const json=(status:number,body:object)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'}});

export async function POST(req:Request){
 if(!sameOrigin(req.headers.get('origin'),req.headers.get('host')))return json(403,{error:'origin'});
 const actual=adminPassword();
 if(!actual)return json(503,{error:'not-configured'});
 const ip=clientIp(req.headers),now=Date.now();
 if(lockout.locked(ip,now))return json(429,{error:'locked'});
 let password='';
 try{const text=await req.text();if(text.length>512)return json(413,{error:'too-large'});const b=JSON.parse(text);if(typeof b?.password==='string')password=b.password;}catch{return json(400,{error:'bad-request'});}
 if(!passwordMatches(password,actual)){
  lockout.fail(ip,now);
  await new Promise(r=>setTimeout(r,400));
  return json(lockout.locked(ip,now)?429:401,{error:lockout.locked(ip,now)?'locked':'wrong'});
 }
 lockout.succeed(ip);
 cookies().set(ADMIN_COOKIE,signSession(now)!,cookieOptions());
 return json(200,{ok:true});
}
