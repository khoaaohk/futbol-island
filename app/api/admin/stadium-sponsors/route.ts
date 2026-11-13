import {cookies} from 'next/headers';
import {ADMIN_COOKIE,sameOrigin,verifySession} from '@/lib/analytics/adminAuth';
import {loadSessionEpoch} from '@/lib/analytics/adminSession';
import {adminList,adminRemove,adminUpload} from '@/lib/stadium/sponsors/admin';
import {getSponsorStore} from '@/lib/stadium/sponsors/store';

/**
 * /admin stadium sponsors (Nov 12 2026; app/admin/StadiumSponsorsSection.tsx, lib/stadium/sponsors/admin.ts).
 * GET: every row with its picture URL. POST (multipart: slot, label, starts_on, ends_on, position, file): upload a picture to a
 * slot. DELETE ?id=<uuid>: remove a row and its file. Admin session only, like every /api/admin route; POST and DELETE are
 * same-origin only. Needs supabase/migrations/20261118_stadium_sponsors.sql (the owner runs it).
 */
export const dynamic='force-dynamic';
export const runtime='nodejs';
const headers={'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'};
const MAX_BODY=1_200_000;

async function authed(){await loadSessionEpoch();return verifySession(cookies().get(ADMIN_COOKIE)?.value,Date.now());}
const deny=(error:string,status:number)=>Response.json({ok:false,error},{status,headers});

export async function GET(){
 if(!await authed())return deny('unauthorized',401);
 const a=await adminList(getSponsorStore());
 return Response.json(a.body,{status:a.status,headers});
}
export async function POST(req:Request){
 if(!sameOrigin(req.headers.get('origin'),req.headers.get('host')))return deny('origin',403);
 if(!await authed())return deny('unauthorized',401);
 if(Number(req.headers.get('content-length')||MAX_BODY+1)>MAX_BODY)return deny('too-large',413);
 let form:FormData;try{form=await req.formData();}catch{return deny('form',400);}
 const file=form.get('file');
 const f=file&&typeof file!=='string'?{type:file.type,size:file.size,bytes:file.size<=MAX_BODY?new Uint8Array(await file.arrayBuffer()):new Uint8Array(0)}:null;
 const a=await adminUpload(getSponsorStore(),{slot:form.get('slot'),label:form.get('label'),starts_on:form.get('starts_on'),ends_on:form.get('ends_on'),position:form.get('position'),file:f});
 return Response.json(a.body,{status:a.status,headers});
}
export async function DELETE(req:Request){
 if(!sameOrigin(req.headers.get('origin'),req.headers.get('host')))return deny('origin',403);
 if(!await authed())return deny('unauthorized',401);
 const a=await adminRemove(getSponsorStore(),new URL(req.url).searchParams.get('id'));
 return Response.json(a.body,{status:a.status,headers});
}
