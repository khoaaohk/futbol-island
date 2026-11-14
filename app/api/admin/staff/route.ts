import {cookies} from 'next/headers';
import {ADMIN_COOKIE,sameOrigin,verifySession} from '@/lib/analytics/adminAuth';
import {loadSessionEpoch} from '@/lib/analytics/adminSession';
import {addStaff,cleanPid,devicePids,listStaff,removeStaff} from '@/lib/analytics/staffAdmin';
import {INSTALL_ID_RE} from '@/lib/analytics/core';
import {PLAYER_HASH_RE} from '@/lib/analytics/playerHash';

/**
 * Staff exclusion (Nov 13 2026, lib/analytics/staffAdmin.ts). GET: the excluded hashes and the "may include staff visits" cut-off.
 * POST {pid} excludes a player card's #hash; POST {device:{ph}|{pi},label} excludes THIS device (its pids for this period and
 * the one before; the key itself is not stored). DELETE {pid} or {device} counts them again. Admin session only, same origin.
 */
export const dynamic='force-dynamic';
export const runtime='nodejs';
const headers={'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'};

async function guard(req:Request,write:boolean){
 if(write&&!sameOrigin(req.headers.get('origin'),req.headers.get('host')))return Response.json({error:'origin'},{status:403,headers});
 await loadSessionEpoch();
 if(!verifySession(cookies().get(ADMIN_COOKIE)?.value,Date.now()))return Response.json({error:'unauthorized'},{status:401,headers});
 return null;
}
/** The pids a request names: one #hash, or this device's key → its pids. */
function pidsOf(body:unknown):string[]{
 const b=body&&typeof body==='object'?body as Record<string,unknown>:{};
 const one=cleanPid(b.pid);if(one)return [one];
 const d=b.device&&typeof b.device==='object'?b.device as Record<string,unknown>:null;
 if(d&&typeof d.ph==='string'&&PLAYER_HASH_RE.test(d.ph))return devicePids({ph:d.ph});
 if(d&&typeof d.pi==='string'&&INSTALL_ID_RE.test(d.pi))return devicePids({pi:d.pi});
 return [];
}
const label=(v:unknown)=>typeof v==='string'?v.replace(/[^\w .,'()#:-]/g,'').trim().slice(0,80)||null:null;

export async function GET(req:Request){
 const g=await guard(req,false);if(g)return g;
 return Response.json(await listStaff(),{headers});
}
export async function POST(req:Request){
 const g=await guard(req,true);if(g)return g;
 const body=await req.json().catch(()=>null),pids=pidsOf(body);
 if(!pids.length)return Response.json({ok:false,error:'no-id'},{status:400,headers});
 const st=await addStaff(pids,label((body as Record<string,unknown>)?.label));
 return Response.json({ok:st==='ok',status:st,pids},{status:st==='ok'?200:st==='needs-migration'?409:503,headers});
}
export async function DELETE(req:Request){
 const g=await guard(req,true);if(g)return g;
 const body=await req.json().catch(()=>null),pids=pidsOf(body);
 if(!pids.length)return Response.json({ok:false,error:'no-id'},{status:400,headers});
 const st=await removeStaff(pids);
 return Response.json({ok:st==='ok',status:st,pids},{status:st==='ok'?200:st==='needs-migration'?409:503,headers});
}
