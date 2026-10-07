/**
 * The ingest handler behind POST /api/visit. Framework-free so tests/admin-analytics.cjs can drive it directly.
 * Order matters: cheap refusals (not configured, preview, DNT/GPC, size, schema, bots, origin) come before the salt lookup,
 * the throttle and the single append-only store write. A beat for a beat with nothing in it is not written.
 */
import {createHash} from 'crypto';
import type {AnalyticsStore} from './store';
import {ACTIVITY_IDS,PLACE_IDS} from './islandIds';
import {MAX_BEAT_PAGEVIEWS,MAX_BODY_BYTES,clampCells,clampEngaged,clampSplit,classifySource,deviceClass,isBot,sanitizeCountry,sanitizeHost,sanitizePath,sanitizeRegion,sanitizeUtm,utcDay,validateEvent,type CleanEvent} from './core';

export type HeaderBag={get(name:string):string|null};
export type IngestResult={status:204|400|403|413|429;reason:string};

/** sha256(daily salt + IP + UA + host), truncated. The inputs are discarded right after. */
export function visitorHash(salt:string,ip:string,ua:string,host:string):string{
 return createHash('sha256').update(salt).update('\u0000').update(ip).update('\u0000').update(ua).update('\u0000').update(host).digest('hex').slice(0,32);
}

export function clientIp(h:HeaderBag):string{
 return (h.get('x-vercel-forwarded-for')||h.get('x-forwarded-for')||h.get('x-real-ip')||'').split(',')[0].trim();
}

/** A per-instance token bucket keyed by visitor hash: bursts of 20, then one event every 2 s. Bounded memory. */
export function createLimiter({capacity=20,refillPerSec=0.5,maxKeys=20_000}={}){
 const buckets=new Map<string,{tokens:number;at:number}>();
 return {
  allow(key:string,nowMs:number):boolean{
   let b=buckets.get(key);
   if(!b){if(buckets.size>=maxKeys)buckets.delete(buckets.keys().next().value as string);b={tokens:capacity,at:nowMs};buckets.set(key,b);}
   b.tokens=Math.min(capacity,b.tokens+(nowMs-b.at)/1000*refillPerSec);b.at=nowMs;
   if(b.tokens<1)return false;b.tokens-=1;return true;
  },
  size:()=>buckets.size,
 };
}
export type Limiter=ReturnType<typeof createLimiter>;

export async function handleIngest({body,headers,store,limiter,now=new Date(),vercelEnv}:{body:string;headers:HeaderBag;store:AnalyticsStore|null;limiter:Limiter;now?:Date;vercelEnv?:string}):Promise<IngestResult>{
 if(!store)return {status:204,reason:'not-configured'};
 if(vercelEnv&&vercelEnv!=='production')return {status:204,reason:'non-production'};
 // Do-Not-Track and Global Privacy Control: nothing is read, hashed or stored.
 if(headers.get('dnt')==='1'||headers.get('sec-gpc')==='1')return {status:204,reason:'dnt'};
 const length=Number(headers.get('content-length')||0);
 if(length>MAX_BODY_BYTES)return {status:413,reason:'too-large'};
 const v=validateEvent(body);
 if(!v.ok)return {status:v.reason==='too-large'?413:400,reason:v.reason};
 const ua=headers.get('user-agent')||'';
 if(isBot(ua))return {status:204,reason:'bot'};
 const host=(headers.get('host')||'').toLowerCase();
 const origin=headers.get('origin');
 if(origin&&origin!=='null'){let oh='';try{oh=new URL(origin).host.toLowerCase();}catch{}if(!host||oh!==host)return {status:403,reason:'origin'};}
 const ev=v.event,day=utcDay(now);
 const hash=visitorHash(await store.salt(day),clientIp(headers),ua,host);
 if(!limiter.allow(hash,now.getTime()))return {status:429,reason:'throttled'};
 const path=sanitizePath(ev.p),start=ev.t==='start';
 const referrerHost=start?sanitizeHost(ev.r,host):null;
 const utm=start?{source:sanitizeUtm(ev.u?.source),medium:sanitizeUtm(ev.u?.medium),campaign:sanitizeUtm(ev.u?.campaign)}:{source:null,medium:null,campaign:null};
 const {engagedMs,areaMs}=start?{engagedMs:0,areaMs:{}}:clampEngaged(ev.e,ev.a);
 const clean:CleanEvent={
  type:ev.t,session:ev.s,path,day,visitorHash:hash,
  country:sanitizeCountry(headers.get('x-vercel-ip-country')),region:sanitizeRegion(headers.get('x-vercel-ip-country-region')),
  device:deviceClass(ua,ev.tp===1),
  source:classifySource(referrerHost,{source:utm.source||undefined,medium:utm.medium||undefined,campaign:utm.campaign||undefined}),
  referrerHost,utmSource:utm.source,utmMedium:utm.medium,utmCampaign:utm.campaign,engagedMs,areaMs,pageviews:start?0:Math.min(ev.n||0,MAX_BEAT_PAGEVIEWS),
  // Where on the island: fixed ids only, each split scaled to at most the beat's (clamped) foreground time.
  placeMs:start?{}:clampSplit(ev.pl,PLACE_IDS,engagedMs),activityMs:start?{}:clampSplit(ev.ac,ACTIVITY_IDS,engagedMs),cells:start?{}:clampCells(ev.c,engagedMs),
 };
 if(!start&&!engagedMs&&!clean.pageviews)return {status:204,reason:'empty-beat'};
 await store.track(clean,now);
 return {status:204,reason:'ok'};
}
