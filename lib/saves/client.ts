/**
 * Save codes in the browser (docs/accounts-design.md, docs/save-codes.md; Oct 10 2026).
 *
 * ── Public API (for any page, e.g. app/start) ─────────────────────────────────────────────────────────────────────────
 *   import {isSavingAvailable,createSave,restoreSave,applyRestoredSave,getLocalCode} from '@/lib/saves/client';
 *     isSavingAvailable(): Promise<boolean>        false until Supabase, SAVE_CODE_PEPPER and the migration are all in place
 *     createSave(): Promise<{ok:true;code} | {ok:false;reason:'unavailable'|'busy'|'error'}>
 *                                                 makes a code for THIS device's island and remembers it here
 *     restoreSave(typed:string, {grownup?}): Promise<RestoreResult>
 *                                                 downloads the island for a typed code; changes nothing yet
 *     applyRestoredSave(result, {reload=true})     swaps this device to it (a 7-day backup of the old one is kept) and reloads
 *     getLocalCode(): string|null                  this device's code, e.g. 'striker-volley-corner-427'
 *     codeRequired(): boolean                      no code here yet (and no grown-up deleted one): ask for one before play
 *   A code is REQUIRED before playing (user decision, Oct 9 2026): render both components with `required`. If saving is down
 *   they say "Saving is taking a break — you can still play today" and hand back null/false: let the kid play.
 *   Components (both lazy-load nicely, both say "Saving isn't ready yet — you can still play" when unavailable):
 *     import SaveCodeCreate from '@/components/saves/SaveCodeCreate'
 *       props {onDone:(code:string|null)=>void; required?:boolean; onHaveCode?:()=>void; showNotNow?:boolean}
 *       null = saving is down (or "Not now" when not required): let them play
 *     import SaveCodeRestore from '@/components/saves/SaveCodeRestore'
 *       props {onDone:(restored:boolean)=>void; initialCode?:string; onCancel?:()=>void; required?:boolean}
 *       true = the player tapped Play after "Welcome back!" (the page reloads itself; onDone runs first)
 * ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * Heat (AGENTS.md, docs/performance-guide.md): no polling, no timers, no loops. Network only (1) once on start if this device
 * has a code, (2) when the tab hides, (3) after a milestone the stores already announce, at most once per 2 minutes, and
 * (4) when the player taps something. Each save first compares a cheap hash and sends nothing if nothing changed.
 */
import {SAVE_APPLIED_KEY,SAVE_BACKUP_KEY,SAVE_CODE_KEY,SAVE_OPTOUT_KEY,SAVE_SYNC_KEY,SAVE_TRIES_KEY,WALLET_KEY_NAME,KEEPALIVE_BYTES,applySnapshot,buildSnapshot,
 hasProgress,localKeys,readBackup,readSnapshot,snapshotHash,writeBackup,type Snapshot,type StoragePort} from './snapshot';
import {compactWallet} from './walletCompact';
import {summarise,type IslandSummary} from './summary';

export const SAVE_CHANGED='fi2-save-changed';
export const SAVE_CONFLICT='fi2-save-conflict';
/** Milestones the stores already dispatch (lesson coins, graduations, stage complete, cards, purchases, daily coins). */
export const SAVE_MILESTONES=['fi2-learn-coins-earned','fi2-graduations-changed','fi2-learning-stage-complete','fi2-card-added','fi2-backpack-changed','fi2-daily-play-earned','fi2-konbini-changed'] as const;
export const MILESTONE_GAP_MS=2*60_000;
/** Client mirror of the server's limits, so a kid gets a friendly message (the server answers every failure the same way). */
export const TRIES_WINDOW_MS=10*60_000,TRIES_ASK_GROWNUP=3,TRIES_BREAK=6;

export type SyncState={rev:number;hash:string;at:number;conflict?:number};
export type SaveStatus='none'|'saved'|'saving'|'failed'|'conflict';
export type RestoreResult={ok:true;code:string;rev:number;snapshot:Snapshot;summary:IslandSummary}|{ok:false;reason:'wrong'|'grownup'|'break'|'unavailable'|'newer'|'offline';until?:number};

const storage=():StoragePort|null=>{try{return typeof localStorage==='undefined'?null:localStorage;}catch{return null;}};
const read=(k:string)=>{try{return storage()?.getItem(k)??null;}catch{return null;}};
const write=(k:string,v:string|null)=>{try{const s=storage();if(!s)return;if(v===null)s.removeItem(k);else s.setItem(k,v);}catch{}};
const emit=()=>{if(typeof window!=='undefined')window.dispatchEvent(new Event(SAVE_CHANGED));};

/**
 * A save code is required before playing (user decision, Oct 9 2026): true while this device has no code, unless a grown-up
 * deleted its save (that choice is respected). Hosts also check isSavingAvailable(): when saving is down, kids still play.
 */
export function codeRequired():boolean{return !getLocalCode()&&read(SAVE_OPTOUT_KEY)===null;}
export function getLocalCode():string|null{const c=read(SAVE_CODE_KEY);return c&&/^[a-z]{3,9}-[a-z]{3,9}-[a-z]{3,9}-[1-9]\d{2}$/.test(c)?c:null;}
export function getSyncState():SyncState|null{try{const s=JSON.parse(read(SAVE_SYNC_KEY)??'null');return s&&Number.isInteger(s.rev)&&s.rev>=0&&typeof s.hash==='string'?s:null;}catch{return null;}}
const setSyncState=(s:SyncState|null)=>{write(SAVE_SYNC_KEY,s?JSON.stringify(s):null);emit();};
let status:SaveStatus='none';
export function saveStatus():SaveStatus{if(!getLocalCode())return 'none';if(getSyncState()?.conflict)return 'conflict';return status==='none'?(getSyncState()?'saved':'failed'):status;}
const setStatus=(s:SaveStatus)=>{status=s;emit();};

// ── Availability ───────────────────────────────────────────────────────────────────────────────────────────────────────
let statusPromise:Promise<{saving:boolean;email:boolean}>|null=null;
/** Asked once per page, when a save screen is about to show (one small GET, cached at the edge for a minute). */
export function savingStatus():Promise<{saving:boolean;email:boolean}>{
 statusPromise??=fetch('/api/save/status',{cache:'no-store'}).then(r=>r.ok?r.json():{saving:false,email:false}).then(j=>({saving:j?.saving===true,email:j?.email===true})).catch(()=>{statusPromise=null;return {saving:false,email:false};});
 return statusPromise;
}
export const isSavingAvailable=()=>savingStatus().then(s=>s.saving);

// ── Transport ──────────────────────────────────────────────────────────────────────────────────────────────────────────
async function gzip(text:string):Promise<Uint8Array|null>{
 if(typeof CompressionStream==='undefined')return null;
 try{const stream=new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'));return new Uint8Array(await new Response(stream).arrayBuffer());}catch{return null;}
}
type Answer={status:number;json:Record<string,unknown>};
async function post(route:string,body:Record<string,unknown>,{keepalive=false,compress=false}={}):Promise<Answer|null>{
 const text=JSON.stringify(body);
 let payload:BodyInit=text,type='application/json';
 // A page-hide save that already fits a keepalive request goes out synchronously: gzip is async, and a closing or reloading
 // page may never get back to send it.
 const small=keepalive&&new TextEncoder().encode(text).length<=KEEPALIVE_BYTES;
 if(compress&&!small){const z=await gzip(text);if(z){payload=z as unknown as BodyInit;type='application/x-fi-save+gzip';}}
 const size=typeof payload==='string'?new TextEncoder().encode(payload).length:(payload as unknown as Uint8Array).byteLength;
 if(keepalive&&size>KEEPALIVE_BYTES)return null; // too big for a page-hide request: it goes with the next visible save
 try{
  const res=await fetch(`/api/save/${route}`,{method:'POST',headers:{'Content-Type':type},body:payload,keepalive,cache:'no-store',credentials:'same-origin'});
  let json:Record<string,unknown>={};try{json=await res.json();}catch{}
  return {status:res.status,json};
 }catch{return null;}
}

/** This device's island as it would be uploaded: allowlisted keys, coach-plan text stripped, old wallet receipts folded. */
export function currentSnapshot(now=Date.now()):Snapshot|null{
 const s=storage();if(!s)return null;
 return buildSnapshot(s,now,(k,v)=>k===WALLET_KEY_NAME?compactWallet(v,now):v);
}
const localDirty=(state:SyncState|null)=>{const snap=currentSnapshot();return !!snap&&(!state||snapshotHash(snap)!==state.hash);};

// ── Create ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
export async function createSave():Promise<{ok:true;code:string}|{ok:false;reason:'unavailable'|'busy'|'error'}>{
 const existing=getLocalCode();if(existing)return {ok:true,code:existing};
 const snap=currentSnapshot();if(!snap)return {ok:false,reason:'error'};
 const r=await post('create',{snapshot:snap},{compress:true});
 if(!r)return {ok:false,reason:'error'};
 if(r.status===503)return {ok:false,reason:'unavailable'};
 if(r.status===429)return {ok:false,reason:'busy'};
 if(r.json.ok!==true||typeof r.json.code!=='string')return {ok:false,reason:'error'};
 write(SAVE_CODE_KEY,r.json.code);write(SAVE_OPTOUT_KEY,null);setSyncState({rev:Number(r.json.rev)||1,hash:snapshotHash(snap),at:Date.now()});setStatus('saved');
 return {ok:true,code:r.json.code};
}

// ── Sync ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
let inFlight:Promise<SaveStatus>|null=null,lastAttempt=0,suspended=false;
/**
 * Saves now if anything changed. `hide`: the tab is going away (keepalive, ≤ 64 KB). `milestone`: at most once per 2 minutes
 * (an earlier milestone's change is carried by the next one, or by the next hide: no timer is armed).
 */
export function syncNow(reason:'hide'|'milestone'|'manual'='manual'):Promise<SaveStatus>{
 const code=getLocalCode();if(!code||suspended)return Promise.resolve(saveStatus());
 if(inFlight)return inFlight;
 const now=Date.now();
 if(reason==='milestone'&&now-lastAttempt<MILESTONE_GAP_MS)return Promise.resolve(saveStatus());
 const state=getSyncState();if(!state||state.conflict)return Promise.resolve(saveStatus());
 const snap=currentSnapshot(now);if(!snap)return Promise.resolve(saveStatus());
 const hash=snapshotHash(snap);if(hash===state.hash)return Promise.resolve(saveStatus());
 lastAttempt=now;
 inFlight=(async():Promise<SaveStatus>=>{
  if(reason!=='hide')setStatus('saving');
  const r=await post('sync',{code,baseRev:state.rev,snapshot:snap},{compress:true,keepalive:reason==='hide'});
  if(r?.json.ok===true&&Number.isInteger(r.json.rev)){setSyncState({rev:r.json.rev as number,hash,at:Date.now()});setStatus('saved');return 'saved';}
  if(r?.json.conflict===true&&Number.isInteger(r.json.rev)){setSyncState({...state,conflict:r.json.rev as number});setStatus('conflict');window.dispatchEvent(new Event(SAVE_CONFLICT));return 'conflict';}
  setStatus('failed');return 'failed';
 })().finally(()=>{inFlight=null;});
 return inFlight;
}

/**
 * One check when the island starts (doc §4.4). The server has a newer save and this device changed nothing since its last
 * save: take it quietly (apply and reload once, behind the loading screen). Both changed: ask "Which island do you want?".
 */
export async function bootCheck():Promise<'none'|'same'|'reloading'|'conflict'|'failed'>{
 const code=getLocalCode();if(!code)return 'none';
 const state=getSyncState();
 if(state?.conflict){window.dispatchEvent(new Event(SAVE_CONFLICT));return 'conflict';}
 const r=await post('check',{code});
 if(!r||r.json.ok!==true||!Number.isInteger(r.json.rev)){setStatus('failed');return 'failed';}
 const rev=r.json.rev as number;
 if(state&&rev<=state.rev){setStatus('saved');return 'same';}
 const now=currentSnapshot(),nowHash=now?snapshotHash(now):'';
 // No record of the last save here (cleared state) but real progress on this device: never overwrite it quietly.
 if(state?localDirty(state):deviceHasProgress()){
  // Both sides changed, unless the saved island is in fact the same as this one (typically our own page-hide save, whose
  // answer never came back because the page closed): then just take its number.
  const saved=await downloadOwn(code);if(!saved)return 'failed';
  if(snapshotHash(saved.snapshot)===nowHash){setSyncState({rev:saved.rev,hash:nowHash,at:Date.now()});setStatus('saved');return 'same';}
  lastConflict=saved;
  setSyncState({...(state??{rev:0,hash:'',at:0}),conflict:rev});window.dispatchEvent(new Event(SAVE_CONFLICT));return 'conflict';}
 const got=await downloadOwn(code);if(!got)return 'failed';
 applyRestoredSave({ok:true,code,rev:got.rev,snapshot:got.snapshot,summary:summarise(got.snapshot.keys)},{backup:false});
 return 'reloading';
}
async function downloadOwn(code:string):Promise<{rev:number;snapshot:Snapshot}|null>{
 const r=await post('restore',{code});
 if(!r||r.json.ok!==true)return null;
 const s=readSnapshot(r.json.snapshot);if(!s.ok)return null;
 return {rev:Number(r.json.rev),snapshot:s.snapshot};
}

// ── Restore ────────────────────────────────────────────────────────────────────────────────────────────────────────────
function recentFails(now:number):number[]{try{const v=JSON.parse(read(SAVE_TRIES_KEY)??'[]');return Array.isArray(v)?v.filter((t:unknown)=>typeof t==='number'&&now-t<TRIES_WINDOW_MS):[];}catch{return [];}}
const noteFail=(now:number)=>{const f=[...recentFails(now),now].slice(-TRIES_BREAK);write(SAVE_TRIES_KEY,JSON.stringify(f));return f;};
/** Before a try: 'break' after 6 wrong tries in 10 minutes, 'grownup' after 3 (until a grown-up passes the gate). */
export function restoreGate(now=Date.now(),grownup=false):{kind:'ok'}|{kind:'grownup'}|{kind:'break';until:number}{
 const f=recentFails(now);
 if(f.length>=TRIES_BREAK)return {kind:'break',until:f[0]+TRIES_WINDOW_MS};
 if(f.length>=TRIES_ASK_GROWNUP&&!grownup)return {kind:'grownup'};
 return {kind:'ok'};
}
export async function restoreSave(typed:string,{grownup=false}:{grownup?:boolean}={}):Promise<RestoreResult>{
 const now=Date.now(),gate=restoreGate(now,grownup);
 if(gate.kind==='break')return {ok:false,reason:'break',until:gate.until};
 if(gate.kind==='grownup')return {ok:false,reason:'grownup'};
 const {normaliseCode}=await import('./code');
 const code=normaliseCode(typed);
 const fail=():RestoreResult=>{const f=noteFail(Date.now());return f.length>=TRIES_BREAK?{ok:false,reason:'break',until:f[0]+TRIES_WINDOW_MS}:f.length>=TRIES_ASK_GROWNUP&&!grownup?{ok:false,reason:'grownup'}:{ok:false,reason:'wrong'};};
 if(!code)return fail();
 const r=await post('restore',{code,grownup});
 if(!r)return {ok:false,reason:'offline'};
 if(r.status===503)return {ok:false,reason:'unavailable'};
 if(r.json.ok!==true)return fail();
 const s=readSnapshot(r.json.snapshot);
 if(!s.ok)return s.newer?{ok:false,reason:'newer'}:fail();
 write(SAVE_TRIES_KEY,null);
 return {ok:true,code,rev:Number(r.json.rev)||1,snapshot:s.snapshot,summary:summarise(s.snapshot.keys)};
}
/** Does this device already have an island worth keeping (doc §3.3 "This device has an island too")? */
export function deviceHasProgress():boolean{const s=storage();return !!s&&hasProgress(localKeys(s));}
export function deviceSummary():IslandSummary{const s=storage();return summarise(s?localKeys(s):{});}

/** Replaces this device's island with a downloaded one, keeps the old one 7 days, remembers the code, then reloads. */
export function applyRestoredSave(r:Extract<RestoreResult,{ok:true}>,{reload=true,backup=true}:{reload?:boolean;backup?:boolean}={}){
 const s=storage();if(!s)return;
 suspended=true;
 const now=Date.now();
 if(backup&&deviceHasProgress())writeBackup(s,now);
 applySnapshot(s,r.snapshot);
 if(read('fi2-welcome-v1')===null)write('fi2-welcome-v1','completed');
 write(SAVE_CODE_KEY,r.code);write(SAVE_OPTOUT_KEY,null);
 const snap=currentSnapshot(now);
 write(SAVE_SYNC_KEY,JSON.stringify({rev:r.rev,hash:snap?snapshotHash(snap):'',at:now}));
 write(SAVE_TRIES_KEY,null);
 // Other open tabs of the island reload too (SaveSync listens), so no tab merges its old ledger into the new one.
 write(SAVE_APPLIED_KEY,String(now));
 if(reload&&typeof location!=='undefined')location.reload();
}

// ── Two devices ────────────────────────────────────────────────────────────────────────────────────────────────────────
export type Conflict={rev:number;snapshot:Snapshot;here:IslandSummary;saved:IslandSummary};
/** The saved island downloaded by the start check, reused by the chooser (one download, not two). */
let lastConflict:{rev:number;snapshot:Snapshot}|null=null;
export async function loadConflict():Promise<Conflict|null>{
 const code=getLocalCode(),state=getSyncState();if(!code||!state)return null;
 const got=lastConflict??await downloadOwn(code);lastConflict=null;if(!got)return null;
 return {rev:got.rev,snapshot:got.snapshot,here:deviceSummary(),saved:summarise(got.snapshot.keys)};
}
/** "Keep this one": the saved island becomes the 7-day backup and this device's island is saved over it. */
export async function keepThisIsland(c:Conflict):Promise<boolean>{
 const s=storage(),code=getLocalCode(),state=getSyncState();if(!s||!code||!state)return false;
 writeBackup(s,Date.now(),c.snapshot.keys);
 setSyncState({...state,rev:c.rev,conflict:undefined,hash:''});
 return (await syncNow('manual'))==='saved';
}
/** "Use the saved one": this device's island becomes the backup and the saved one loads. */
export function chooseSavedIsland(c:Conflict){const code=getLocalCode();if(code)applyRestoredSave({ok:true,code,rev:c.rev,snapshot:c.snapshot,summary:c.saved});}

// ── Backup, delete, email ──────────────────────────────────────────────────────────────────────────────────────────────
export function swapBackup(){const s=storage();return s?readBackup(s,Date.now()):null;}
/** "Undo swap": the backed-up island comes back (and is saved on the next save, so the server follows). */
export function undoSwap(){
 const s=storage(),b=s?readBackup(s,Date.now()):null;if(!s||!b)return false;
 suspended=true;
 const current=localKeys(s);try{const idp=s.getItem('fi2-idp-plan-v1');if(idp!==null)current['fi2-idp-plan-v1']=idp;}catch{}
 applySnapshot(s,{format:1,game:'',keys:b.keys});
 write(SAVE_BACKUP_KEY,null);
 writeBackup(s,Date.now(),current);
 write(SAVE_APPLIED_KEY,String(Date.now()));
 location.reload();return true;
}
/** Deletes the save from the server (doc §4.7). This device keeps its game; the code is forgotten here. */
export async function deleteSave():Promise<boolean>{
 const code=getLocalCode();if(!code)return true;
 const r=await post('delete',{code});
 if(!r||r.json.ok!==true)return false;
 write(SAVE_CODE_KEY,null);write(SAVE_SYNC_KEY,null);write(SAVE_OPTOUT_KEY,new Date().toISOString().slice(0,10));setStatus('none');return true;
}
/** One email with the code to the address a grown-up typed. The address is sent once and kept nowhere (not even here). */
export async function sendCodeToGrownup(email:string):Promise<'sent'|'failed'|'busy'|'bad-email'|'unavailable'>{
 const code=getLocalCode();if(!code)return 'failed';
 const r=await post('email',{code,email});
 if(!r)return 'failed';
 if(r.status===503)return 'unavailable';
 if(r.status===429)return 'busy';
 if(r.json.badEmail)return 'bad-email';
 return r.json.ok===true?'sent':'failed';
}

// ── #save=… links from a printed code card's QR (the fragment never reaches a server or a log) ────────────────────────────
let pendingCode:string|null=null;
export function takeSaveFragment():string|null{
 if(typeof location==='undefined')return null;
 const m=/^#save=([a-z-]{8,40}\d{3})$/i.exec(location.hash);
 if(!m)return null;
 try{history.replaceState(history.state,'',location.pathname+location.search);}catch{}
 pendingCode=m[1].toLowerCase();return pendingCode;
}
/** A code from a QR link waiting for the restore screen (the welcome screen takes it when it opens). */
export const pendingRestoreCode=()=>pendingCode;
export const clearPendingRestoreCode=()=>{pendingCode=null;};
