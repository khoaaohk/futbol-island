/**
 * Site health reports (Nov 10 2026, security audit): CSP violation reports (app/api/csp-report) and the first-party error
 * beacon (components/ErrorBeacon.tsx -> app/api/error-report), stored as DAILY COUNTS in public.site_reports
 * (supabase/migrations/20261111_site_reports.sql) and shown on /admin's "Live now" tab (app/admin/SiteHealthSection.tsx).
 * What is kept, and nothing else:
 *   csp: key "<directive>|<blocked host>|<page path>": the directive name, the HOST of what was blocked (or inline/eval/data/
 *        blob), the page PATH (no query string, no fragment).
 *   err: key "<8-hex hash>|<route path>", label "<message first line> @ <file:line>": the hash is of (scrubbed first line +
 *        top frame file:line); the file is a same-site script path, never a URL with a query string.
 * Never a user agent, an IP, a full URL, a stack, a cookie, a save code or any id. Messages are scrubbed of URLs' queries,
 * numbers, emails, hex runs and anything shaped like a save code before they are hashed or kept.
 * Pure helpers + a small store (Supabase RPC, or per-instance memory before the migration / without a database). Server only.
 */
import {createHash} from 'crypto';

export type ReportKind='csp'|'err';
export const MAX_REPORT_BYTES=16_384;
export const MAX_REPORTS_PER_REQUEST=10;
const CODE_SHAPED=/[a-z]{3,9}-[a-z]{3,9}-[a-z]{3,9}-[1-9]\d{2,3}/gi;

/** A page path: pathname only, no query or fragment, at most 80 chars, code-shaped and long id-like segments masked. */
export function cleanPath(raw:unknown):string{
 if(typeof raw!=='string'||!raw)return '/';
 let p=raw;try{p=new URL(raw,'https://x.invalid').pathname;}catch{return '/';}
 p=p.replace(CODE_SHAPED,'*').split('/').map(s=>/^[0-9a-f-]{16,}$/i.test(s)||/^\d{4,}$/.test(s)?'*':s).join('/');
 p=p.replace(/[^A-Za-z0-9/_.\-*]/g,'').slice(0,80);
 return p.startsWith('/')?p:'/'+p;
}
/** What was blocked: a bare host, or one of the CSP keywords. */
export function cleanBlocked(raw:unknown):string{
 if(typeof raw!=='string'||!raw)return 'unknown';
 const v=raw.trim().toLowerCase();
 if(/^(inline|eval|wasm-eval|trusted-types-policy|trusted-types-sink|self)$/.test(v))return v;
 if(/^(data|blob|about|chrome-extension|moz-extension|safari-extension|safari-web-extension|filesystem|ws|wss):?/.test(v)&&!/^wss?:\/\//.test(v))
  return v.split(':')[0];
 try{const u=new URL(v);return u.hostname.replace(/[^a-z0-9.-]/g,'').slice(0,80)||'unknown';}catch{return 'unknown';}
}
export const cleanDirective=(raw:unknown)=>typeof raw==='string'&&/^[a-z-]{3,40}/.test(raw.trim().toLowerCase())?raw.trim().toLowerCase().match(/^[a-z-]{3,40}/)![0]:'unknown';

export type CspHit={directive:string;blocked:string;path:string};
/**
 * Both report formats: the old `report-uri` body ({"csp-report":{...}}, application/csp-report) and the Reporting API
 * (application/reports+json: an array of {type:"csp-violation", body:{effectiveDirective, blockedURL, documentURL}}).
 * Returns at most MAX_REPORTS_PER_REQUEST hits; anything else is ignored.
 */
export function parseCspReports(body:string):CspHit[]{
 if(typeof body!=='string'||!body||body.length>MAX_REPORT_BYTES)return [];
 let o:unknown;try{o=JSON.parse(body);}catch{return [];}
 const out:CspHit[]=[];
 const take=(r:Record<string,unknown>|null|undefined,dirKey:string[],blockedKey:string[],docKey:string[])=>{
  if(!r||typeof r!=='object'||out.length>=MAX_REPORTS_PER_REQUEST)return;
  const pick=(ks:string[])=>{for(const k of ks)if(typeof r[k]==='string')return r[k];return undefined;};
  out.push({directive:cleanDirective(pick(dirKey)),blocked:cleanBlocked(pick(blockedKey)),path:cleanPath(pick(docKey))});
 };
 if(Array.isArray(o)){for(const x of o.slice(0,MAX_REPORTS_PER_REQUEST))if(x&&typeof x==='object'&&(x as {type?:unknown}).type==='csp-violation')
  take((x as {body?:Record<string,unknown>}).body,['effectiveDirective','violatedDirective'],['blockedURL','blockedURI'],['documentURL','documentURI']);}
 else if(o&&typeof o==='object'&&'csp-report' in o)
  take((o as Record<string,Record<string,unknown>>)['csp-report'],['effective-directive','violated-directive'],['blocked-uri'],['document-uri']);
 return out;
}
export const cspKey=(h:CspHit)=>`${h.directive}|${h.blocked}|${h.path}`.slice(0,200);

/** An error message's first line with anything that could carry user data replaced. */
export function scrubMessage(raw:unknown):string{
 const line=(typeof raw==='string'?raw:'').split('\n')[0].slice(0,300);
 return line.replace(/https?:\/\/[^\s'")]+/g,u=>{try{const x=new URL(u);return x.origin+cleanPath(x.pathname);}catch{return 'URL';}})
  .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g,'EMAIL').replace(CODE_SHAPED,'CODE').replace(/\b[0-9a-f]{12,}\b/gi,'HEX').replace(/\d+/g,'N')
  .replace(/\s+/g,' ').trim().slice(0,120)||'(no message)';
}
/** The top frame as "path/file.js:line" (same-site script paths only; anything else becomes "other"). */
export function cleanFrame(file:unknown,line:unknown,siteHost?:string):string{
 if(typeof file!=='string'||!file)return 'unknown';
 let path='other';
 try{const u=new URL(file);if(!siteHost||u.host===siteHost||u.hostname==='localhost')path=cleanPath(u.pathname).replace(/^\/_next\/static\/chunks\//,'chunks/');}catch{}
 const n=Number(line);return `${path.slice(0,80)}:${Number.isInteger(n)&&n>0&&n<1e7?n:0}`;
}
export function errKey(message:string,frame:string,route:string){
 const hash=createHash('sha256').update(message+'|'+frame).digest('hex').slice(0,8);
 return {key:`${hash}|${cleanPath(route)}`.slice(0,200),label:`${message} @ ${frame}`.slice(0,240)};
}
export type ErrInput={m?:unknown;f?:unknown;l?:unknown;r?:unknown};
/** One beacon body: {m: message, f: file, l: line, r: route path}. Null when it is not that shape. */
export function parseErrorReport(body:string,siteHost?:string):{key:string;label:string}|null{
 if(typeof body!=='string'||!body||body.length>2048)return null;
 let o:ErrInput;try{o=JSON.parse(body);}catch{return null;}
 if(!o||typeof o!=='object'||Array.isArray(o))return null;
 for(const k of Object.keys(o))if(!['m','f','l','r'].includes(k))return null;
 return errKey(scrubMessage(o.m),cleanFrame(o.f,o.l,siteHost),typeof o.r==='string'?o.r:'/');
}

// ---- store ----------------------------------------------------------------------------------------------------------
export type TopRow={key:string;label:string;n:number;last:string};
export type TopResult={status:'ok'|'memory'|'needs-migration'|'error';rows:TopRow[]};
export interface ReportStore{hit(kind:ReportKind,key:string,label:string):Promise<boolean>;top(kind:ReportKind,days:number,limit:number):Promise<TopResult>}
const MEM_MAX_KEYS=500;
export function createMemoryReportStore(now=()=>new Date()):ReportStore&{data:Map<string,TopRow>}{
 const data=new Map<string,TopRow>();
 return {data,
  async hit(kind,key,label){const day=now().toISOString().slice(0,10),k=`${day}|${kind}|${key}`;const r=data.get(k);
   if(r){r.n=Math.min(r.n+1,1_000_000);return true;}
   if([...data.keys()].filter(x=>x.startsWith(`${day}|${kind}|`)).length>=MEM_MAX_KEYS)return false;
   data.set(k,{key,label,n:1,last:day});return true;},
  async top(kind,days,limit){const from=new Date(now().getTime()-(Math.max(1,Math.min(days,30))-1)*86_400_000).toISOString().slice(0,10),sum=new Map<string,TopRow>();
   for(const [k,r] of data){const [day,kd]=k.split('|');if(kd!==kind||day<from)continue;const s=sum.get(r.key);if(s){s.n+=r.n;if(day>s.last)s.last=day;}else sum.set(r.key,{...r,last:day});}
   return {status:'memory',rows:[...sum.values()].sort((a,b)=>b.n-a.n||a.key.localeCompare(b.key)).slice(0,limit)};},
 };
}
export function createSupabaseReportStore(url:string,key:string,fallback:ReportStore,fetchImpl:typeof fetch=fetch):ReportStore{
 const base=url.replace(/\/+$/,'')+'/rest/v1/rpc/',headers={apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'};
 let missing=false;
 const rpc=async(fn:string,args:object)=>{const r=await fetchImpl(base+fn,{method:'POST',headers,body:JSON.stringify(args),cache:'no-store',signal:AbortSignal.timeout(2000)});
  if(r.status===404){missing=true;return undefined;}if(!r.ok)throw new Error('site reports '+r.status);const t=await r.text();return t?JSON.parse(t):null;};
 return {
  async hit(kind,k,label){if(missing)return fallback.hit(kind,k,label);try{const v=await rpc('site_report_hit',{p_kind:kind,p_key:k,p_label:label});return v===undefined?fallback.hit(kind,k,label):v===true;}catch{return false;}},
  async top(kind,days,limit){
   try{const v=missing?undefined:await rpc('site_report_top',{p_kind:kind,p_days:days,p_limit:limit});
    if(v===undefined){const m=await fallback.top(kind,days,limit);return {status:'needs-migration',rows:m.rows};}
    return {status:'ok',rows:Array.isArray(v)?v.map((r:TopRow)=>({key:String(r.key),label:String(r.label??''),n:Number(r.n)||0,last:String(r.last??'')})):[]};}
   catch{return {status:'error',rows:[]};}
  },
 };
}
let cached:ReportStore|undefined;
export function getReportStore():ReportStore{
 if(cached)return cached;
 const mem=createMemoryReportStore(),url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 cached=url&&key?createSupabaseReportStore(url,key,mem):mem;
 return cached;
}

/** Per-instance rate limit for both report routes: bursts of 20 per IP hash, then one every 5 s; 2000 a minute site-wide. */
export function createReportLimiter({perIp=20,refillPerSec=0.2,globalPerMin=2000}={}){
 const buckets=new Map<string,{t:number;at:number}>();let win=0,count=0;
 return {allow(ip:string,nowMs:number){
  const m=Math.floor(nowMs/60_000);if(m!==win){win=m;count=0;}if(++count>globalPerMin)return false;
  const k=createHash('sha256').update('site-report\u0000'+ip).digest('hex').slice(0,20);
  let b=buckets.get(k);if(!b){if(buckets.size>=10_000)buckets.clear();b={t:perIp,at:nowMs};buckets.set(k,b);}
  b.t=Math.min(perIp,b.t+(nowMs-b.at)/1000*refillPerSec);b.at=nowMs;if(b.t<1)return false;b.t-=1;return true;}};
}
