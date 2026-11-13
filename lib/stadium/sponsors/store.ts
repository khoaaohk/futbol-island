/**
 * Stadium sponsor storage (Nov 12 2026; server only). The table and bucket come from
 * supabase/migrations/20261118_stadium_sponsors.sql (the owner runs it). Plain PostgREST / Storage REST calls, like the other
 * stores (lib/siteReports.ts).
 *  - The public read (GET /api/stadium-sponsors) uses the ANON key, so row-level security decides what is public: active rows only.
 *  - /admin writes use the service-role key (RLS gives anon and signed-in users no write at all).
 * Until the migration runs, a read answers {status:'missing'} and the game shows the placeholders.
 */
import {SPONSOR_BUCKET,isActiveOn,isSponsorSlot,type SponsorEntry,type SponsorFeed,type SponsorRow} from './slots';

export type ReadStatus='ok'|'missing'|'error'|'unconfigured';
export type SponsorStore={
 readActive():Promise<{status:ReadStatus;rows:SponsorRow[]}>;
 listAll():Promise<{status:ReadStatus;rows:SponsorRow[]}>;
 upload(path:string,bytes:Uint8Array,type:string):Promise<boolean>;
 removeObject(path:string):Promise<boolean>;
 insert(row:Omit<SponsorRow,'id'|'created_at'>):Promise<SponsorRow|null>;
 remove(id:string):Promise<SponsorRow|null>;
 publicUrl(path:string):string;
};

const COLS='id,slot,label,image_path,starts_on,ends_on,position,created_at';
/** PostgREST says the table is not there (404, or PGRST205 "could not find the table"). */
const isMissing=async(r:Response)=>{if(r.status===404)return true;if(r.status!==400&&r.status!==406)return false;try{const j=await r.clone().json();return j?.code==='PGRST205'||j?.code==='42P01';}catch{return false;}};
const rowsOf=(v:unknown):SponsorRow[]=>Array.isArray(v)?v.filter(r=>r&&isSponsorSlot(r.slot)&&typeof r.image_path==='string').map(r=>({id:String(r.id),slot:r.slot,label:String(r.label??''),image_path:r.image_path,starts_on:String(r.starts_on),ends_on:r.ends_on==null?null:String(r.ends_on),position:Number(r.position)||0,created_at:r.created_at?String(r.created_at):undefined})):[];

export function createSupabaseSponsorStore(url:string,anonKey:string|null,serviceKey:string|null,fetchImpl:typeof fetch=fetch):SponsorStore{
 const base=url.replace(/\/$/,'');
 const h=(key:string,extra:Record<string,string>={})=>({apikey:key,Authorization:'Bearer '+key,...extra});
 const get=async(key:string|null,q:string)=>{
  if(!key)return {status:'unconfigured' as const,rows:[]};
  try{const r=await fetchImpl(`${base}/rest/v1/stadium_sponsors?select=${COLS}&order=slot.asc,position.asc,created_at.desc${q}`,{headers:h(key),cache:'no-store',signal:AbortSignal.timeout(3000)});
   if(await isMissing(r))return {status:'missing' as const,rows:[]};if(!r.ok)return {status:'error' as const,rows:[]};
   return {status:'ok' as const,rows:rowsOf(await r.json())};}
  catch{return {status:'error' as const,rows:[]};}
 };
 const obj=(path:string)=>`${base}/storage/v1/object/${SPONSOR_BUCKET}/${path.split('/').map(encodeURIComponent).join('/')}`;
 return {
  readActive:()=>get(anonKey,'&limit=64'),
  listAll:()=>get(serviceKey,'&limit=200'),
  async upload(path,bytes,type){
   if(!serviceKey)return false;
   try{const r=await fetchImpl(obj(path),{method:'POST',headers:h(serviceKey,{'Content-Type':type,'x-upsert':'false','cache-control':'max-age=31536000'}),body:bytes as unknown as BodyInit,signal:AbortSignal.timeout(15000)});return r.ok;}catch{return false;}
  },
  async removeObject(path){
   if(!serviceKey)return false;
   try{const r=await fetchImpl(obj(path),{method:'DELETE',headers:h(serviceKey),signal:AbortSignal.timeout(5000)});return r.ok;}catch{return false;}
  },
  async insert(row){
   if(!serviceKey)return null;
   try{const r=await fetchImpl(`${base}/rest/v1/stadium_sponsors?select=${COLS}`,{method:'POST',headers:h(serviceKey,{'Content-Type':'application/json',Prefer:'return=representation'}),body:JSON.stringify(row),signal:AbortSignal.timeout(5000)});
    if(!r.ok)return null;return rowsOf(await r.json())[0]??null;}catch{return null;}
  },
  async remove(id){
   if(!serviceKey)return null;
   try{const r=await fetchImpl(`${base}/rest/v1/stadium_sponsors?id=eq.${encodeURIComponent(id)}&select=${COLS}`,{method:'DELETE',headers:h(serviceKey,{Prefer:'return=representation'}),signal:AbortSignal.timeout(5000)});
    if(!r.ok)return null;return rowsOf(await r.json())[0]??null;}catch{return null;}
  },
  publicUrl:path=>`${base}/storage/v1/object/public/${SPONSOR_BUCKET}/${path.split('/').map(encodeURIComponent).join('/')}`,
 };
}

let cached:SponsorStore|null|undefined;
/** null without a Supabase URL (local dev without env): the API serves placeholders and /admin says so. */
export function getSponsorStore():SponsorStore|null{
 if(cached!==undefined)return cached;
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 cached=url?createSupabaseSponsorStore(url,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||null,process.env.SUPABASE_SERVICE_ROLE_KEY||null):null;
 return cached;
}

/** The game's feed from the rows (dates checked again here: the CDN copy may be up to an hour old, RLS already filtered). */
export function buildFeed(rows:readonly SponsorRow[],store:Pick<SponsorStore,'publicUrl'>,today:string,nowIso:string):SponsorFeed{
 const entries:SponsorEntry[]=rows.filter(r=>isActiveOn(r,today)).map(r=>({id:r.id,slot:r.slot,label:r.label,image:store.publicUrl(r.image_path),position:r.position}));
 return {placeholder:!entries.length,generatedAt:nowIso,entries};
}

/** Cache headers for GET /api/stadium-sponsors: long at the CDN, short in the browser; the placeholder answer re-checks sooner. */
export function feedCacheControl(placeholder:boolean){
 return placeholder?'public, max-age=300, s-maxage=900, stale-while-revalidate=3600':'public, max-age=900, s-maxage=3600, stale-while-revalidate=86400';
}
