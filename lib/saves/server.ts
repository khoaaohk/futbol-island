/**
 * The save API behind POST /api/save/{create,check,sync,restore,delete,email} (docs/accounts-design.md §4.5, §5; Oct 9 2026).
 * Framework-free, so tests/game-saves.cjs drives it directly; the route files only read the capped body and call handleSave.
 *
 * Rules:
 *  - The code travels only in the JSON body, never in a URL, a header or a log line. It is hashed at once with
 *    HMAC-SHA256(SAVE_CODE_PEPPER, "v1:" + normal form) and the plain code is dropped (except `create`, which returns it once).
 *  - No "this code exists" signal: a wrong code, an unknown code and a throttled request get the same status, the same body
 *    (`{ok:false}`) and the same timing (every code-bearing answer waits until MIN_ANSWER_MS after the request started).
 *    `delete` always answers `{ok:true}`. `email` answers `{ok:true}` for an unknown code too (it simply sends nothing).
 *  - Throttles live in the database (save_throttle) so every serverless instance shares them: per day-salted IP bucket and
 *    site-wide (lib/saves/store.ts LIMITS).
 *  - Every key in an uploaded snapshot is checked against the allowlist again, and coach-plan text is stripped again.
 */
import {createHash,createHmac,randomInt as cryptoRandomInt} from 'crypto';
import {gunzipSync} from 'zlib';
import {CODE_VERSION,displayCode,formatCode,generateCode,isNormalCode,parseCode} from './code';
import {MAX_GZIP_BYTES,MAX_SNAPSHOT_BYTES,readSnapshot,type Snapshot} from './snapshot';
import {LIMITS,utcDay,type SaveStore} from './store';
import {EMAIL_SUBJECT,emailText,validEmail,type EmailProvider} from './email';

export type SaveRoute='create'|'check'|'sync'|'restore'|'delete'|'email';
export const SAVE_ROUTES:readonly SaveRoute[]=['create','check','sync','restore','delete','email'];
export type HeaderBag={get(name:string):string|null};
export type SaveDeps={store:SaveStore|null;pepper:string|undefined;email?:EmailProvider|null;now?:()=>Date;sleep?:(ms:number)=>Promise<void>;randomInt?:(max:number)=>number;minAnswerMs?:number};
export type SaveAnswer={status:number;body:Record<string,unknown>};

/** Every answer that depends on a code waits until this long after the request began (doc §5.2 "small fixed delay"). */
export const MIN_ANSWER_MS=350;
/** The pepper must be a real secret: at least 32 characters (e.g. `openssl rand -base64 48`). */
export const MIN_PEPPER_LENGTH=32;
/** Raw request bodies: a gzip upload, or plain JSON when the browser has no CompressionStream. */
export const MAX_REQUEST_BYTES=MAX_SNAPSHOT_BYTES+16*1024;
export const FAIL={ok:false} as const;

export const codeHash=(pepper:string,normal:string)=>createHmac('sha256',pepper).update(`v${CODE_VERSION}:${normal}`).digest('hex');
export const pepperOk=(p:string|undefined):p is string=>typeof p==='string'&&p.length>=MIN_PEPPER_LENGTH;
export function clientIp(h:HeaderBag):string{return (h.get('x-vercel-forwarded-for')||h.get('x-forwarded-for')||h.get('x-real-ip')||'').split(',')[0].trim();}
/** 'ip:' + sha256(today's random salt + IP), truncated. The IP itself is never stored; the salt is deleted nightly. */
export const ipBucket=(salt:string,ip:string)=>'ip:'+createHash('sha256').update(salt).update('\u0000').update(ip).digest('hex').slice(0,32);

/** Decodes a request body: gzip (application/x-fi-save+gzip) or JSON. Null when too big, broken or not an object. */
export function decodeBody(bytes:Uint8Array,contentType:string|null):Record<string,unknown>|null{
 try{
  let text:string;
  if((contentType||'').includes('gzip')){
   if(bytes.byteLength>MAX_GZIP_BYTES)return null;
   text=gunzipSync(bytes,{maxOutputLength:MAX_REQUEST_BYTES}).toString('utf8');
  }else{if(bytes.byteLength>MAX_REQUEST_BYTES)return null;text=Buffer.from(bytes).toString('utf8');}
  const v=JSON.parse(text);return v&&typeof v==='object'&&!Array.isArray(v)?v:null;
 }catch{return null;}
}

/** The snapshot as it will be stored (allowlisted keys only, coach-plan text stripped), or why not. */
export function storedSnapshot(v:unknown):{ok:true;snapshot:Snapshot;bytes:number}|{ok:false;reason:'bad'|'newer'|'too-big'}{
 const r=readSnapshot(v);if(!r.ok)return {ok:false,reason:r.newer?'newer':'bad'};
 const bytes=Buffer.byteLength(JSON.stringify(r.snapshot));
 return bytes>MAX_SNAPSHOT_BYTES?{ok:false,reason:'too-big'}:{ok:true,snapshot:r.snapshot,bytes};
}

const sameOrigin=(h:HeaderBag)=>{const origin=h.get('origin');if(!origin||origin==='null')return true;try{return new URL(origin).host.toLowerCase()===(h.get('host')||'').toLowerCase();}catch{return false;}};

export async function handleSave(route:SaveRoute,req:{bytes:Uint8Array;contentType:string|null;headers:HeaderBag},deps:SaveDeps):Promise<SaveAnswer>{
 const now=deps.now??(()=>new Date()),sleep=deps.sleep??(ms=>new Promise(r=>setTimeout(r,ms)));
 const started=Date.now(),minMs=deps.minAnswerMs??MIN_ANSWER_MS;
 const padded=async(a:SaveAnswer)=>{const wait=started+minMs-Date.now();if(wait>0)await sleep(wait);return a;};
 if(!SAVE_ROUTES.includes(route))return {status:404,body:{ok:false}};
 if(!sameOrigin(req.headers))return {status:403,body:{ok:false}};
 const {store,pepper}=deps;
 if(!store||!pepperOk(pepper))return {status:503,body:{ok:false,unavailable:true}};
 if(route==='email'&&!deps.email)return {status:503,body:{ok:false,unavailable:true}};
 if(req.bytes.byteLength>((req.contentType||'').includes('gzip')?MAX_GZIP_BYTES:MAX_REQUEST_BYTES))return {status:413,body:{ok:false,tooBig:true}};
 const body=decodeBody(req.bytes,req.contentType);
 if(!body)return {status:400,body:{ok:false}};
 try{
  const t=now(),bucket=ipBucket(await store.salt(utcDay(t)),clientIp(req.headers));
  if(route==='create'){
   const snap=storedSnapshot(body.snapshot??{format:1,game:'',keys:{}});
   if(!snap.ok)return {status:snap.reason==='too-big'?413:400,body:{ok:false,tooBig:snap.reason==='too-big'||undefined,newer:snap.reason==='newer'||undefined}};
   // Creation caps (not code-dependent, so they may say "busy").
   if(!await store.hit('c:'+bucket,LIMITS.createPerIp,60,t)||!await store.hit('c:global',LIMITS.createPerDay,1440,t))return {status:429,body:{ok:false,busy:true}};
   const rand=deps.randomInt??(max=>cryptoRandomInt(max));
   for(let i=0;i<5;i++){
    const code=generateCode(rand),normal=formatCode(code);
    const r=await store.create(codeHash(pepper,normal),snap.snapshot,snap.bytes);
    if(r.ok)return {status:200,body:{ok:true,code:normal,rev:r.rev??1}};
   }
   return {status:503,body:{ok:false}};
  }
  // Every other route carries a code. A code that doesn't parse is a wrong code: same answer, same timing.
  const parsed=route==='restore'||route==='email'?parseCode(typeof body.code==='string'?body.code:''):isNormalCode(body.code)?parseCode(body.code):null;
  if(route==='email'&&!validEmail(body.email))return {status:400,body:{ok:false,badEmail:true}};
  if(route==='email'&&(!await store.hit('m:'+bucket,LIMITS.mailPerIp,60,t)||!await store.hit('m:global',LIMITS.mailPerDay,1440,t)))return {status:429,body:{ok:false,busy:true}};
  // A code that can't parse still costs a failed try (the store counts it), so typing junk is no faster than guessing.
  const hash=parsed?codeHash(pepper,formatCode(parsed)):'0'.repeat(64);
  if(route==='sync'){
   const snap=storedSnapshot(body.snapshot);
   if(!snap.ok)return {status:snap.reason==='too-big'?413:400,body:{ok:false,tooBig:snap.reason==='too-big'||undefined,newer:snap.reason==='newer'||undefined}};
   const base=Number(body.baseRev);if(!Number.isInteger(base)||base<1)return {status:400,body:{ok:false}};
   const r=await store.put(hash,base,snap.snapshot,snap.bytes,bucket,t);
   return padded({status:200,body:r.ok?{ok:true,rev:r.rev}:'conflict' in r&&r.conflict?{ok:false,conflict:true,rev:r.rev}:FAIL});
  }
  if(route==='delete'){await store.remove(hash,bucket,t);return padded({status:200,body:{ok:true}});}
  if(route==='check'){const r=await store.lookup(hash,bucket,false,false,t);return padded({status:200,body:r.ok?{ok:true,rev:r.rev}:FAIL});}
  if(route==='restore'){
   const r=await store.lookup(hash,bucket,body.grownup===true,true,t);
   return padded({status:200,body:r.ok?{ok:true,rev:r.rev,snapshot:r.snapshot}:FAIL});
  }
  // email: look the code up (a grown-up is sending), send once, and forget the address.
  const r=await store.lookup(hash,bucket,true,false,t);
  if(!r.ok||!parsed)return padded({status:200,body:{ok:true}});
  const display=displayCode(parsed);
  const sent=await deps.email!.send({to:body.email as string,subject:EMAIL_SUBJECT,text:emailText(display),secret:display});
  return padded({status:200,body:sent?{ok:true}:{ok:false,failed:true}});
 }catch{
  // No error detail ever leaves (or is logged): it could hold a hash or an address.
  return {status:503,body:{ok:false,unavailable:true}};
 }
}

/** For GET /api/save/status: is saving set up (store + pepper + migration), and is the grown-up email set up? */
export async function saveStatus(deps:Pick<SaveDeps,'store'|'pepper'|'email'>):Promise<{saving:boolean;email:boolean}>{
 if(!deps.store||!pepperOk(deps.pepper))return {saving:false,email:false};
 let v=0;try{v=await deps.store.schemaVersion();}catch{}
 return {saving:v>=1,email:v>=1&&!!deps.email};
}
