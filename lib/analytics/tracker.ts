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
 */
import type {Area} from './core';

export const ENDPOINT='/api/visit';
export const PING_MS=180_000;
export const PING_JITTER=0.2;
export const IDLE_MS=10*60_000;
export const SESSION_IDLE_MS=30*60_000;
export const MAX_PINGS=80;// 4 h of safety beats per session; the hide/pagehide beat still counts the rest
const SESSION_KEY='fi-visit',SKIP_KEY='fi-visit-off';

export type TrackerEnv={
 window:Pick<Window,'addEventListener'|'removeEventListener'|'setTimeout'|'clearTimeout'|'location'>&{doNotTrack?:string|null};
 document:Pick<Document,'addEventListener'|'removeEventListener'|'visibilityState'|'referrer'>;
 navigator:{doNotTrack?:string|null;globalPrivacyControl?:boolean;webdriver?:boolean;maxTouchPoints?:number;sendBeacon?:(url:string,data:BodyInit)=>boolean};
 storage:Pick<Storage,'getItem'|'setItem'>|null;
 now:()=>number;
 random:(n:number)=>Uint8Array;
 fetch?:typeof fetch;
 allowLocalhost?:boolean;
};

let currentOverride:Area|null=null;
const overrideListeners=new Set<()=>void>();
/** Lets a surface without its own route (the Paths menu over the island) attribute its foreground time. Returns a cleanup. */
export function enterArea(area:Area):()=>void{
 for(const l of overrideListeners)l();currentOverride=area;
 return()=>{if(currentOverride!==area)return;for(const l of overrideListeners)l();currentOverride=null;};
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
  const t=env.now(),end=Math.min(t,lastInput+IDLE_MS),ms=Math.max(0,end-visibleSince);
  visibleSince=t;if(!ms)return;
  acc+=ms;const area=currentOverride??areaOf(path);areaAcc[area]=(areaAcc[area]||0)+ms;
 }
 /** Send what accumulated since the last beat; nothing at all when there is under a second and no page view. */
 function beat(){
  flush();
  if(acc<1000&&!pend)return;
  const a:Record<string,number>={};for(const [k,v] of Object.entries(areaAcc))if(v)a[k]=Math.round(v);
  send({v:1,t:'beat',s:session,p:path,e:Math.round(acc),a,n:Math.min(pend,100)});
  acc=0;pend=0;for(const k of Object.keys(areaAcc))delete areaAcc[k as Area];
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
  }
  send(body);schedule();
 }
 const onInput=()=>{const t=env.now();if(visibleSince!==null&&t-lastInput>IDLE_MS){flush();visibleSince=t;}lastInput=t;schedule();};
 const onHide=()=>{beat();visibleSince=null;stopTimer();};
 function onVisibility(){
  if(d.visibilityState==='visible'){
   if(visibleSince!==null)return;
   const old=session;loadSession();
   lastInput=env.now();visibleSince=env.now();
   if(session!==old){lastPv={path:'',at:-1e9};pageview(path);}else schedule();
  }else onHide();
 }
 overrideListeners.add(flush);
 loadSession();
 d.addEventListener('visibilitychange',onVisibility);
 w.addEventListener('pagehide',onHide);
 w.addEventListener('pointerdown',onInput,{capture:true,passive:true});
 w.addEventListener('keydown',onInput,{capture:true,passive:true});
 return {
  pageview,
  stop(){overrideListeners.delete(flush);stopTimer();d.removeEventListener('visibilitychange',onVisibility);w.removeEventListener('pagehide',onHide);w.removeEventListener('pointerdown',onInput,{capture:true});w.removeEventListener('keydown',onInput,{capture:true});},
  /** Test hooks. */
  state:()=>({session,timer:timer!==null,acc,pend,pings,path}),
 };
}
