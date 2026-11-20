/**
 * "New update ready" (site health pass, Nov 20 2026).
 *
 * Every release renames the hashed JS/CSS chunks. A tab opened on an older release still asks for its own chunk names when the
 * player first opens a lazy part (a panel, a machine, an arcade game). Once that old release is no longer served, the request
 * 404s, webpack rejects with "Loading chunk N failed" and the part never opens (the admin Site health panel showed ~30 such rows
 * across ten webpack runtimes on Nov 15-17, the busiest release days).
 *
 * This module notices a newer release and recovers without losing progress:
 * - The page knows its own build id (NEXT_PUBLIC_BUILD_ID, set in next.config.mjs). /api/build-id answers with the live one.
 * - It asks when the tab comes back (visibilitychange / focus), at most once every CHECK_MIN_MS, and at once (at most every
 *   FORCED_MIN_MS) after a chunk fails to load. No timers, no polling, no per-frame work.
 * - When a newer release is live it reloads by itself ONLY at a safe moment: the tab is hidden, or the player has not touched
 *   the page yet. Otherwise components/NetSaveNotice.tsx shows "New update ready. Tap to refresh." and the player chooses.
 * - Loop guard: at most one automatic reload per target build id per tab session (sessionStorage). Without sessionStorage it
 *   never reloads by itself (the prompt still works).
 * Saves live in local storage / the save server, so a reload keeps the island.
 */
export const BUILD_ID:string=(typeof process!=='undefined'&&process.env.NEXT_PUBLIC_BUILD_ID)||'';
export const CHECK_MIN_MS=5*60_000;
export const FORCED_MIN_MS=20_000;
export const RELOAD_KEY='fi2-update-reloaded'/* sessionStorage, this tab only */;
export const UPDATE_TITLE='New update ready.';
export const UPDATE_TEXT='Tap to refresh.';

const CHUNK_RE=/ChunkLoadError|Loading (CSS )?chunk \S+ failed|dynamically imported module|Importing a module script failed/i;
/** A failed download of a JS or CSS chunk (webpack, mini-css, native ES modules), not a bug in the game's code. */
export function isChunkLoadError(e:unknown):boolean{
 if(!e||typeof e!=='object')return false;
 const x=e as {name?:unknown;message?:unknown;code?:unknown};
 return x.code==='CSS_CHUNK_LOAD_FAILED'||CHUNK_RE.test(`${String(x.name??'')} ${String(x.message??'')}`);
}

export type UpdateEnv={
 now():number;
 /** The live build id, or null when it cannot be read (offline, server error). */
 fetchId():Promise<string|null>;
 hidden():boolean;
 /** The player has pressed, tapped or typed on this page. */
 started():boolean;
 session():Pick<Storage,'getItem'|'setItem'>|null;
 reload():void;
};
export type UpdateWatch={
 check(force?:boolean):Promise<boolean>;
 ready():boolean;
 subscribe(f:()=>void):()=>void;
 /** Reloads now if a newer release is live and it is a safe moment (and not already reloaded for it). */
 tryAutoReload():boolean;
};

export function createUpdateWatch(current:string,env:UpdateEnv):UpdateWatch{
 let isReady=false,liveId='',lastCheck=-Infinity,inflight:Promise<boolean>|null=null;
 const subs=new Set<()=>void>();
 const tryAutoReload=()=>{
  if(!isReady||!(env.hidden()||!env.started()))return false;
  const s=env.session();if(!s)return false;
  try{if(s.getItem(RELOAD_KEY)===liveId)return false;s.setItem(RELOAD_KEY,liveId);}catch{return false;}
  env.reload();return true;
 };
 const check=(force=false):Promise<boolean>=>{
  if(isReady)return Promise.resolve(true);
  if(!current)return Promise.resolve(false);
  if(inflight)return inflight;
  const t=env.now();if(t-lastCheck<(force?FORCED_MIN_MS:CHECK_MIN_MS))return Promise.resolve(false);
  lastCheck=t;
  inflight=env.fetchId().then(id=>{
   if(id&&id!==current){isReady=true;liveId=id;subs.forEach(f=>f());tryAutoReload();}
   return isReady;
  },()=>false).finally(()=>{inflight=null;});
  return inflight;
 };
 return {check,ready:()=>isReady,subscribe(f){subs.add(f);return()=>{subs.delete(f);};},tryAutoReload};
}

let watch:UpdateWatch|null=null;
let installed=false;
/** The page's watch (browser only). */
export function updateWatch():UpdateWatch|null{
 if(watch||typeof window==='undefined')return watch;
 let touched=false;
 const mark=()=>{touched=true;};
 for(const t of ['pointerdown','keydown','touchstart'])window.addEventListener(t,mark,{capture:true,once:true,passive:true});
 watch=createUpdateWatch(BUILD_ID,{
  now:()=>Date.now(),
  fetchId:()=>fetch('/api/build-id',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(j=>j&&typeof j.id==='string'&&j.id?j.id:null,()=>null),
  hidden:()=>document.visibilityState==='hidden',
  started:()=>touched,
  session:()=>{try{return window.sessionStorage;}catch{return null;}},
  reload:()=>window.location.reload(),
 });
 return watch;
}
/** One-time listeners: check when the tab returns, reload when it is hidden and an update is waiting. Event-driven only. */
export function installUpdateWatch(){
 const w=updateWatch();if(!w||installed)return;installed=true;
 const onVis=()=>{if(document.visibilityState==='hidden')w.tryAutoReload();else void w.check();};
 document.addEventListener('visibilitychange',onVis);
 window.addEventListener('focus',()=>{void w.check();});
 // A chunk nobody waits on (a warm-up import, webpack's own prefetch) failing is the first sign of a new release. The beacon
 // still reports it (not marked handled).
 window.addEventListener('unhandledrejection',ev=>{if(navigator.onLine!==false&&isChunkLoadError(ev.reason))void w.check(true);});
}
/** A lazy part failed twice (lib/retryImport.ts): true when a newer release explains it (the prompt or a safe reload follows). */
export function chunkFailedForUpdate(err:unknown):Promise<boolean>{
 const w=isChunkLoadError(err)?updateWatch():null;
 return w?w.check(true):Promise.resolve(false);
}
