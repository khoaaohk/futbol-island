/**
 * Admin sign-in for /admin. One shared password (ADMIN_PASSWORD, server env only), a signed httpOnly session cookie and a
 * per-instance lockout. The cookie key is derived from the password (or ADMIN_SESSION_SECRET when set), so changing the
 * password signs everyone out. This is the only cookie the site sets, and only for whoever signs in to /admin.
 * Nov 10 2026 (abuse audit): ADMIN_SESSION_SECRET (optional, 32+ chars recommended) keys the cookie instead of the password,
 * and a stored SESSION EPOCH (supabase/migrations/20261111_admin_session_epoch.sql, read by lib/analytics/adminSession.ts) is
 * mixed into the key: "Sign out everywhere" bumps it, so every cookie signed before stops working on every instance (within
 * 15 s, the epoch cache). Epoch 0 gives the same key as before, so existing sessions survive the deploy. The lockout is per
 * IP (5 tries / 15 min here, plus 20 / hour across instances in lib/analytics/adminSession.ts) with a site-wide ceiling raised
 * from 50 to 1000 failures / 15 min, so one guesser can no longer lock the owner out.
 */
import {createHash,createHmac,randomBytes,timingSafeEqual} from 'crypto';

export const ADMIN_COOKIE='fi_admin';
export const SESSION_TTL_MS=12*3_600_000;
export const MIN_PASSWORD_LENGTH=12;
const MAX_FAILS=5,LOCK_MS=15*60_000;
export const GLOBAL_MAX_FAILS=1000;

/** The session epoch this instance last read (lib/analytics/adminSession.ts loadSessionEpoch keeps it fresh). */
let epochNow=0;
export const sessionEpoch=()=>epochNow;
export function setSessionEpoch(v:number){if(Number.isInteger(v)&&v>=0)epochNow=v;}

export function adminPassword(env:Record<string,string|undefined>=process.env):string|null{
 const p=env.ADMIN_PASSWORD;return p&&p.length>=MIN_PASSWORD_LENGTH?p:null;
}

const sha=(s:string)=>createHash('sha256').update(s).digest();
/** Constant-time: both sides are hashed to 32 bytes first, so neither the length nor the content leaks through timing. */
export function passwordMatches(input:string,actual:string):boolean{
 return timingSafeEqual(sha(input),sha(actual));
}

function key(env:Record<string,string|undefined>=process.env,epoch=0):Buffer|null{
 const pw=adminPassword(env);if(!pw)return null;
 return createHmac('sha256',env.ADMIN_SESSION_SECRET||pw).update('futbol-island admin session v1'+(epoch>0?':epoch '+epoch:'')).digest();
}
const b64=(b:Buffer)=>b.toString('base64url');

export function signSession(nowMs:number,env:Record<string,string|undefined>=process.env,epoch=sessionEpoch()):string|null{
 const k=key(env,epoch);if(!k)return null;
 const payload=`${nowMs+SESSION_TTL_MS}.${b64(randomBytes(12))}`;
 return `${payload}.${b64(createHmac('sha256',k).update(payload).digest())}`;
}

export function verifySession(token:string|undefined|null,nowMs:number,env:Record<string,string|undefined>=process.env,epoch=sessionEpoch()):boolean{
 const k=key(env,epoch);if(!k||!token||token.length>200)return false;
 const i=token.lastIndexOf('.');if(i<0)return false;
 const payload=token.slice(0,i),sig=Buffer.from(token.slice(i+1),'base64url');
 const want=createHmac('sha256',k).update(payload).digest();
 if(sig.length!==want.length||!timingSafeEqual(sig,want))return false;
 const exp=Number(payload.split('.')[0]);
 return Number.isFinite(exp)&&exp>nowMs&&exp<=nowMs+SESSION_TTL_MS;
}

export function cookieOptions(){
 return {httpOnly:true,secure:true,sameSite:'strict' as const,path:'/',maxAge:SESSION_TTL_MS/1000};
}

/** Failed sign-ins per client (an IP hash, kept in memory only) plus a global ceiling against spread-out guessing. */
export function createLockout(){
 const fails=new Map<string,{n:number;until:number;first:number}>();
 let global:{n:number;first:number}={n:0,first:0};
 const id=(ip:string)=>createHash('sha256').update('lockout\u0000'+ip).digest('hex').slice(0,24);
 return {
  locked(ip:string,nowMs:number):boolean{
   if(global.n>=GLOBAL_MAX_FAILS&&nowMs-global.first<LOCK_MS)return true;
   const f=fails.get(id(ip));return !!f&&f.until>nowMs;
  },
  fail(ip:string,nowMs:number){
   if(nowMs-global.first>=LOCK_MS)global={n:0,first:nowMs};global.n++;
   const k=id(ip);const f=fails.get(k);
   const next=f&&nowMs-f.first<LOCK_MS?{...f,n:f.n+1}:{n:1,until:0,first:nowMs};
   if(next.n>=MAX_FAILS)next.until=nowMs+LOCK_MS;
   if(fails.size>5000)fails.clear();fails.set(k,next);
  },
  succeed(ip:string){fails.delete(id(ip));},
  /** Nov 10 2026: lock one IP for `ms` (its cross-instance hourly budget ran out: lib/analytics/adminSession.ts loginBudget). */
  lockFor(ip:string,nowMs:number,ms:number){if(fails.size>5000)fails.clear();fails.set(id(ip),{n:MAX_FAILS,until:nowMs+ms,first:nowMs});},
 };
}

/** Same-origin check for the admin POSTs (with SameSite=Strict this blocks cross-site form posts). */
export function sameOrigin(origin:string|null,host:string|null):boolean{
 if(!origin||!host)return false;
 try{return new URL(origin).host.toLowerCase()===host.toLowerCase();}catch{return false;}
}

/** Vercel Cron's `Authorization: Bearer $CRON_SECRET`, compared in constant time. No secret (or a short one): refuse. */
export function cronAuthorized(header:string|null,secret:string|undefined):boolean{
 if(!secret||secret.length<16||!header)return false;
 return timingSafeEqual(sha(header),sha(`Bearer ${secret}`));
}
