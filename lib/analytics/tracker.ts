/**
 * Browser side of the visit counter (Oct 7 2026). Mounted once by components/VisitTracker.tsx in production on Vercel.
 *
 * Privacy: no cookies, no localStorage. The only id is a random per-tab session id in sessionStorage (it dies with the tab,
 * and a tab idle for 30 min starts a new one). Nothing is sent under Do-Not-Track / Global Privacy Control, to automated
 * browsers (Playwright), in ?preview=all testing sessions or on the *-lab review pages.
 *
 * Requests: one `start` when a session begins, then a `beat` (foreground ms, area split, page views since the last beat)
 * on visibilitychange→hidden and pagehide, plus a safety beat every 3 min ±20% jitter while visible. That is ~3–6 small
 * sendBeacon writes per session; later page views ride along in the next beat instead of sending their own request.
 *
 * Heat budget: no render work (the component returns null). At most one timer, and only while the tab is visible and
 * someone touched it in the last 10 minutes; hidden or idle tabs hold no timer at all.
 *
 * Where on the island (Oct 8 2026): the same beat also carries foreground time per named place (`pl`), per activity (`ac`)
 * and seconds per 20 m heat-map cell (`c`, top MAX_BEAT_CELLS). No new requests, no timers, no frame loop: the island's
 * existing frame calls islandFrame() (two comparisons per frame; a position sample every ~5 s), components call
 * enterActivity() when they open (a module variable, like enterArea), and the split happens in flush(). Only totals per
 * fixed id leave the tab: never a position list, an order of places or a time per position. Time with no input or movement
 * for ACTIVITY_IDLE_MS is booked as `idle` and never counted toward a place or a cell.
 *
 * Learning counters (Oct 9 2026): count(id,n) adds n to a module map (no re-render, no timer, no request) at the moment a
 * learning event already happens (a lesson opens, a quiz answer is picked, a walkthrough step shows…). The map rides along in
 * the next beat as `k:{id:n}`: fixed ids from countIds.ts only, the busiest MAX_BEAT_COUNTS, and only as many as keep the
 * beacon under BEACON_BUDGET bytes; the rest carry to the next beat (a hide also drains up to MAX_DRAIN_BEATS extra small
 * beats, so a tab that closes keeps its counts). A session's start may carry `f`, coarse progress/settings buckets read once
 * by startFlags.ts (VisitTracker passes it in; this file reads no storage of the game's).
 */
import type {Area} from './core';
import {MAX_BEAT_COUNTS,MAX_COUNT_VALUE,isCountId,type StartFlags} from './countIds';
import {ACTIVITY_IDS,ACTIVITY_IDLE_MS,MAX_BEAT_CELLS,PASSIVE_ACTIVITIES,SAMPLE_MAX_MS,SAMPLE_MS,cellOf,type ActivityId,type PlaceId} from './islandIds';

export const ENDPOINT='/api/visit';
export const PING_MS=180_000;
export const PING_JITTER=0.2;
export const IDLE_MS=10*60_000;
export const SESSION_IDLE_MS=30*60_000;
export const MAX_PINGS=80;// 4 h of safety beats per session; the hide/pagehide beat still counts the rest
const SESSION_KEY='fi-visit',SKIP_KEY='fi-visit-off';
/** A beacon never grows past this (the server's MAX_BODY_BYTES is 4096; the rest is slack). Counts are fitted under it. */
export const BEACON_BUDGET=4000;
/** Extra count-only beats a hide may send when the counts did not all fit (each still one small sendBeacon). */
export const MAX_DRAIN_BEATS=2;

export type TrackerEnv={
 window:Pick<Window,'addEventListener'|'removeEventListener'|'setTimeout'|'clearTimeout'|'location'>&{doNotTrack?:string|null};
 document:Pick<Document,'addEventListener'|'removeEventListener'|'visibilityState'|'referrer'>;
 navigator:{doNotTrack?:string|null;globalPrivacyControl?:boolean;webdriver?:boolean;maxTouchPoints?:number;sendBeacon?:(url:string,data:BodyInit)=>boolean};
 storage:Pick<Storage,'getItem'|'setItem'>|null;
 now:()=>number;
 random:(n:number)=>Uint8Array;
 fetch?:typeof fetch;
 /** Coarse progress/settings buckets for the session's start (lib/analytics/startFlags.ts). Called once per new session. */
 flags?:()=>StartFlags|null;
 allowLocalhost?:boolean;
};

let currentOverride:Area|null=null;
const overrideListeners=new Set<()=>void>();
/** Lets a surface without its own route (the Paths menu over the island) attribute its foreground time. Returns a cleanup. */
export function enterArea(area:Area):()=>void{
 for(const l of overrideListeners)l();currentOverride=area;
 return()=>{if(currentOverride!==area)return;for(const l of overrideListeners)l();currentOverride=null;};
}

/** Activities pushed by open components (top wins); `frameMode` is what the island's frame says the player is doing. */
const activityStack:{id:ActivityId}[]=[];
let frameMode:ActivityId|null=null;
let live:{flush():void;sample(x:number,z:number,lookup:(x:number,z:number)=>PlaceId):void;now():number}|null=null;
let nextSample=-Infinity;
const VALID_ACTIVITY=new Set<string>(ACTIVITY_IDS);
/** A component that is open (pop-up book, arcade game, exhibit, menu…) attributes its time to `id`. Returns a cleanup. */
export function enterActivity(id:ActivityId):()=>void{
 if(!VALID_ACTIVITY.has(id))id='other';
 const token={id};live?.flush();activityStack.push(token);
 return()=>{const i=activityStack.indexOf(token);if(i<0)return;live?.flush();activityStack.splice(i,1);};
}
/**
 * Called from the island's existing frame (components/Town.tsx), never from a loop of its own. `mode` is the frame's base
 * activity (walk/ride/fly/lesson/quiz/watch); `lookup` maps x/z to a place (lib/analytics/islandPlaces.ts, island bundle
 * only). Does nothing when the tracker is off (dev, DNT, preview…). Per frame: a comparison; every SAMPLE_MS: one sample.
 */
export function islandFrame(x:number,z:number,mode:ActivityId,lookup:(x:number,z:number)=>PlaceId){
 if(!live)return;
 if(mode!==frameMode){live.flush();frameMode=mode;}
 const t=live.now();if(t<nextSample)return;nextSample=t+SAMPLE_MS;
 live.sample(x,z,lookup);
}

/** Learning counters waiting for the next beat (id → n). Only filled while a tracker runs. */
const countAcc=new Map<string,number>();
/**
 * Count a learning event: a map increment and nothing else (no state, no timer, no request). Unknown ids are ignored, so a
 * lesson that is not in the generated allowlist (a Learning Journey's practice scene) is simply not counted.
 */
export function count(id:string,n=1){
 if(!live||!Number.isInteger(n)||n<1||!isCountId(id))return;
 countAcc.set(id,Math.min(10_000,(countAcc.get(id)||0)+n));
}
/** Take the busiest counts that fit in `room` bytes (≤ MAX_BEAT_COUNTS ids, ≤ MAX_COUNT_VALUE each); the rest stay for later.
 *  (Exported for tests: the heaviest real beat, every place + every activity + 64 cells + 64 count ids, is ~3.9 KB, so this
 *  byte guard only binds on beats heavier than the game produces today.) */
export function takeCounts(room:number):Record<string,number>|null{
 if(!countAcc.size)return null;
 const sorted=[...countAcc].sort((a,b)=>b[1]-a[1]||(a[0]<b[0]?-1:a[0]>b[0]?1:0)).slice(0,MAX_BEAT_COUNTS);
 const out:Record<string,number>={};let bytes=6;// ,"k":{}
 for(const [id,n] of sorted){const v=Math.min(n,MAX_COUNT_VALUE),add=id.length+String(v).length+4;if(bytes+add>room)break;bytes+=add;out[id]=v;}
 if(!Object.keys(out).length)return null;
 for(const [id,v] of Object.entries(out)){const left=(countAcc.get(id)||0)-v;if(left>0)countAcc.set(id,left);else countAcc.delete(id);}
 return out;
}

const areaOf=(path:string):Area=>{const top='/'+(path.split('/')[1]||'');return top==='/'?'island':top==='/arcade'?'arcade':top==='/museum'?'museum':top==='/konbini'?'konbini':top==='/controller'?'controller':'other';};

/** Why this browser sends nothing, or null when it may count. */
export function skipReason(env:TrackerEnv):string|null{
 const n=env.navigator;
 if(n.doNotTrack==='1'||n.doNotTrack==='yes'||env.window.doNotTrack==='1'||n.globalPrivacyControl===true)return 'dnt';
 if(n.webdriver)return 'automation';
 const {hostname,pathname,search}=env.window.location;
 if(!env.allowLocalhost&&/^(localhost|127\.|0\.0\.0\.0|\[::1\]|192\.168\.|10\.)/.test(hostname))return 'local';
 if(/-lab(\/|$)/.test(pathname))return 'lab';
 if(/^\/admin(\/|$)/.test(pathname))return 'admin';
 const q=new URLSearchParams(search);
 if(q.get('preview')==='all'||q.has('unlock')||q.has('testCoins')){try{env.storage?.setItem(SKIP_KEY,'1');}catch{}return 'preview';}
 try{if(env.storage?.getItem(SKIP_KEY)==='1')return 'preview';}catch{}
 return null;
}

export function startTracker(env:TrackerEnv){
 if(skipReason(env))return null;
 const {window:w,document:d,navigator:n}=env;
 let session='',isNew=false,path='/',lastPv={path:'',at:-1e9};
 let visibleSince:number|null=d.visibilityState==='visible'?env.now():null,lastInput=env.now();
 let timer:number|null=null,pings=0;
 let acc=0,pend=0;const areaAcc:Partial<Record<Area,number>>={};
 // Where on the island: the current place (from the last sample), per-place / per-activity ms and per-cell ms since the last beat.
 let place:PlaceId|null=null,lastActive=env.now(),lastSampleAt=-1,lastX=NaN,lastZ=NaN;
 const placeAcc:Partial<Record<PlaceId,number>>={},activityAcc:Partial<Record<ActivityId,number>>={},cellAcc=new Map<number,number>();
 const add=<K extends string>(o:Partial<Record<K,number>>,k:K,ms:number)=>{o[k]=(o[k]||0)+ms;};
 /** What the player is doing now: the top open component, else the island frame's base, else the page. */
 function activityNow(area:Area):ActivityId{
  if(activityStack.length)return activityStack[activityStack.length-1].id;
  switch(area){
   case 'island':return frameMode==='walk'&&place==='deep_sea_boat'?'boat':frameMode??'other';
   case 'paths':return 'paths';case 'arcade':return 'arcade_lobby';case 'museum':return 'museum_hall';
   case 'konbini':return 'konbini_shop';case 'controller':return 'controller';default:return 'other';
  }
 }
 /** Place time and heat-map cells count only in the island's world view: not in menus or Paths, and never idle. */
 const inWorld=(area:Area)=>area==='island'&&!activityStack.some(a=>a.id==='menu'||a.id==='paths');
 const idleCut=(act:ActivityId)=>PASSIVE_ACTIVITIES.includes(act)?IDLE_MS:ACTIVITY_IDLE_MS;

 const newId=()=>{let s='';for(const x of env.random(22))s+='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'[x&63];return s;};
 function loadSession(){
  const wall=Date.now();
  try{const raw=env.storage?.getItem(SESSION_KEY);if(raw){const o=JSON.parse(raw);if(typeof o.id==='string'&&wall-o.at<SESSION_IDLE_MS){session=o.id;isNew=false;return;}}}catch{}
  session=newId();isNew=true;pings=0;
 }
 const touchSession=()=>{try{env.storage?.setItem(SESSION_KEY,JSON.stringify({id:session,at:Date.now()}));}catch{}};

 function send(body:Record<string,unknown>){
  const json=JSON.stringify(body);touchSession();
  try{if(n.sendBeacon&&n.sendBeacon(ENDPOINT,json))return;}catch{}
  try{void env.fetch?.(ENDPOINT,{method:'POST',body:json,keepalive:true,headers:{'Content-Type':'text/plain'}}).catch(()=>{});}catch{}
 }
 /** Move the visible-and-active time since the last flush into the counters, attributed to the current area. */
 function flush(){
  if(visibleSince===null)return;
  const t=env.now(),end=Math.min(t,lastInput+IDLE_MS),from=visibleSince,ms=Math.max(0,end-from);
  visibleSince=t;if(!ms)return;
  acc+=ms;const area=currentOverride??areaOf(path);areaAcc[area]=(areaAcc[area]||0)+ms;
  // Split the same span into active (→ activity, and place when in the world) and idle (no input/movement for a while).
  const act=activityNow(area),activeMs=Math.max(0,Math.min(end,Math.max(from,lastActive+idleCut(act)))-from);
  if(activeMs>0){add(activityAcc,act,activeMs);if(place&&inWorld(area))add(placeAcc,place,activeMs);}
  if(ms-activeMs>0)add(activityAcc,'idle',ms-activeMs);
 }
 /** Input or movement: book any idle stretch before it ends. */
 function markActive(t:number){if(t-lastActive>ACTIVITY_IDLE_MS)flush();lastActive=t;}
 /** One island sample (every ~5 s from the island's frame): movement counts as activity, the place may change, and the
  *  time since the last sample (capped, so a sleeping frame loop adds nothing) goes to the 20 m cell under the player. */
 function sample(x:number,z:number,lookup:(x:number,z:number)=>PlaceId){
  const t=env.now();
  if(Number.isFinite(lastX)&&Math.hypot(x-lastX,z-lastZ)>1)markActive(t);
  lastX=x;lastZ=z;
  const p=lookup(x,z);if(p!==place){flush();place=p;}
  const gap=lastSampleAt<0?SAMPLE_MS:Math.min(SAMPLE_MAX_MS,t-lastSampleAt);lastSampleAt=t;
  const area=currentOverride??areaOf(path);
  if(visibleSince===null||!inWorld(area)||t-lastActive>idleCut(activityNow(area)))return;
  const c=cellOf(x,z);if(c>=0)cellAcc.set(c,(cellAcc.get(c)||0)+gap);
 }
 /** Send what accumulated since the last beat; nothing at all when there is under a second and no page view. */
 function beat(){
  flush();
  if(acc<1000&&!pend&&!countAcc.size)return;
  const round=(o:Record<string,number|undefined>)=>{const r:Record<string,number>={};for(const [k,v] of Object.entries(o)){const n=Math.round(v||0);if(n>0)r[k]=n;}return r;};
  const a=round(areaAcc),body:Record<string,unknown>={v:1,t:'beat',s:session,p:path,e:Math.round(acc),a,n:Math.min(pend,100)};
  const pl=round(placeAcc),ac=round(activityAcc);if(Object.keys(pl).length)body.pl=pl;if(Object.keys(ac).length)body.ac=ac;
  // Heat-map cells: whole seconds, the busiest MAX_BEAT_CELLS only (keeps the beacon small).
  const cells=[...cellAcc].map(([k,ms])=>[k,Math.round(ms/1000)] as const).filter(([,s])=>s>0).sort((x,y)=>y[1]-x[1]||x[0]-y[0]).slice(0,MAX_BEAT_CELLS);
  if(cells.length)body.c=Object.fromEntries(cells);
  const k=takeCounts(BEACON_BUDGET-JSON.stringify(body).length);if(k)body.k=k;
  send(body);
  acc=0;pend=0;for(const o of [areaAcc,placeAcc,activityAcc] as Record<string,number>[])for(const k of Object.keys(o))delete o[k];cellAcc.clear();
 }
 const stopTimer=()=>{if(timer!==null){w.clearTimeout(timer);timer=null;}};
 function schedule(){
  if(timer!==null||d.visibilityState!=='visible'||pings>=MAX_PINGS||env.now()-lastInput>IDLE_MS)return;
  const jitter=1-PING_JITTER+2*PING_JITTER*(env.random(1)[0]/255);
  timer=w.setTimeout(()=>{timer=null;pings++;beat();schedule();},Math.round(PING_MS*jitter));
 }
 function pageview(p:string){
  const t=env.now();
  if(p===lastPv.path&&t-lastPv.at<1000)return;// React strict-mode double effects
  if(/^\/admin(\/|$)|-lab(\/|$)/.test(p))return;
  flush();path=p;lastPv={path:p,at:t};
  if(!isNew){pend++;schedule();return;}// rides along in the next beat
  const body:Record<string,unknown>={v:1,t:'start',s:session,p};
  {
   isNew=false;
   try{const host=new URL(d.referrer).hostname;if(host&&host!==w.location.hostname)body.r=host;}catch{}
   const q=new URLSearchParams(w.location.search),u:Record<string,string>={};
   for(const k of ['source','medium','campaign']){const v=q.get('utm_'+k);if(v)u[k]=v.slice(0,100);}
   if(Object.keys(u).length)body.u=u;
   if((n.maxTouchPoints||0)>1)body.tp=1;
   try{const f=env.flags?.();if(f&&Object.keys(f).length)body.f=f;}catch{}
  }
  send(body);schedule();
 }
 const onInput=()=>{const t=env.now();if(visibleSince!==null&&t-lastInput>IDLE_MS){flush();visibleSince=t;}lastInput=t;markActive(t);schedule();};
 /** Counts that did not fit the hide beat go out in up to MAX_DRAIN_BEATS small count-only beats (no time, no page views). */
 const drain=()=>{for(let i=0;i<MAX_DRAIN_BEATS&&countAcc.size;i++){const body:Record<string,unknown>={v:1,t:'beat',s:session,p:path};const k=takeCounts(BEACON_BUDGET-JSON.stringify(body).length);if(!k)break;body.k=k;send(body);}};
 const onHide=()=>{beat();drain();visibleSince=null;stopTimer();};
 function onVisibility(){
  if(d.visibilityState==='visible'){
   if(visibleSince!==null)return;
   const old=session;loadSession();
   lastInput=lastActive=env.now();visibleSince=env.now();
   if(session!==old){lastPv={path:'',at:-1e9};pageview(path);}else schedule();
  }else onHide();
 }
 overrideListeners.add(flush);
 live={flush,sample,now:env.now};nextSample=-Infinity;
 loadSession();
 d.addEventListener('visibilitychange',onVisibility);
 w.addEventListener('pagehide',onHide);
 w.addEventListener('pointerdown',onInput,{capture:true,passive:true});
 w.addEventListener('keydown',onInput,{capture:true,passive:true});
 return {
  pageview,
  stop(){overrideListeners.delete(flush);live=null;countAcc.clear();stopTimer();d.removeEventListener('visibilitychange',onVisibility);w.removeEventListener('pagehide',onHide);w.removeEventListener('pointerdown',onInput,{capture:true});w.removeEventListener('keydown',onInput,{capture:true});},
  /** Test hooks. */
  state:()=>({session,timer:timer!==null,acc,pend,pings,path,place,activity:activityNow(currentOverride??areaOf(path)),cells:cellAcc.size,counts:Object.fromEntries(countAcc)}),
 };
}
