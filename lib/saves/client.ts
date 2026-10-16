/**
 * Save codes in the browser (docs/accounts-design.md, docs/save-codes.md; Oct 10 2026).
 *
 * ── Public API (for any page, e.g. the title screen) ─────────────────────────────────────────────────────────────────────────
 *   import {isSavingAvailable,createSave,restoreSave,applyRestoredSave,getLocalCode} from '@/lib/saves/client';
 *     isSavingAvailable(): Promise<boolean>        false until Supabase, SAVE_CODE_PEPPER and the migration are all in place
 *     createSave(): Promise<{ok:true;code} | {ok:false;reason:'unavailable'|'busy'|'error'}>
 *                                                 makes a code for THIS device's island and remembers it here
 *     restoreSave(typed:string, {grownup?}): Promise<RestoreResult>
 *                                                 downloads the island for a typed code; changes nothing yet
 *     applyRestoredSave(result, {reload=true})     swaps this device to it (a 7-day backup of the old one is kept) and reloads
 *     getLocalCode(): string|null                  this device's code, e.g. 'striker-volley-corner-4271'
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
 * (4) when the player taps something, (5) when the tab comes back while a save is waiting to be settled. Each save first
 * compares a cheap hash and sends nothing if nothing changed.
 *
 * One code is one island (user decision, Oct 12 2026): kids are never asked to choose. When two copies meet, the one played
 * most recently wins and the other is kept on this device for 7 days, for a grown-up to bring back from Settings (doc §4.4).
 */
import {INSTALL_ID_KEY,SAVE_APPLIED_KEY,SAVE_BACKUP_KEY,SAVE_CODE_KEY,SAVE_OPTOUT_KEY,SAVE_PLAYED_KEY,SAVE_SYNC_KEY,SAVE_TRIES_KEY,WALLET_KEY_NAME,KEEPALIVE_BYTES,applySnapshot,
 buildSnapshot,diffKeys,hasProgress,localKeys,playedTime,progressHash,readBackup,readSnapshot,snapshotHash,writeBackup,type Backup,type Snapshot,type StoragePort} from './snapshot';
import {compactWallet} from './walletCompact';
import {progressRank,summarise,type IslandSummary} from './summary';

export const SAVE_CHANGED='fi2-save-changed';
/** Milestones the stores already dispatch (lesson coins, graduations, stage complete, cards, purchases, daily coins). */
export const SAVE_MILESTONES=['fi2-learn-coins-earned','fi2-graduations-changed','fi2-learning-stage-complete','fi2-card-added','fi2-backpack-changed','fi2-daily-play-earned','fi2-konbini-changed'] as const;
export const MILESTONE_GAP_MS=2*60_000;
/** Client mirror of the server's limits, so a kid gets a friendly message (the server answers every failure the same way). */
export const TRIES_WINDOW_MS=10*60_000,TRIES_ASK_GROWNUP=3,TRIES_BREAK=6;

/**
 * `sent`: hashes of saves sent from `rev` whose answer may never have arrived (a page-hide save: the page can unload before the
 * reply). Written synchronously BEFORE the request, so a closing page still leaves the record. If the server later turns out
 * to hold one of these islands, it is ours, not another device's: it is adopted and this device saves on top.
 * `conflict`: the server's rev when a save met a newer island and there was no time to settle it (a page-hide save). It is
 * settled (newest wins) on the next start, the next save, or when the tab comes back. Nothing is shown to the player.
 * `p`: progressHash of the island at the last confirmed save, so a copy that adds nothing since then is never set aside.
 */
export type SyncState={rev:number;hash:string;at:number;conflict?:number;sent?:string[];p?:string};
export type SaveStatus='none'|'saved'|'saving'|'failed';
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
export function getLocalCode():string|null{const c=read(SAVE_CODE_KEY);return c&&/^[a-z]{3,9}-[a-z]{3,9}-[a-z]{3,9}-[1-9]\d{2,3}$/.test(c)?c:null;}
export function getSyncState():SyncState|null{try{const s=JSON.parse(read(SAVE_SYNC_KEY)??'null');if(!(s&&Number.isInteger(s.rev)&&s.rev>=0&&typeof s.hash==='string'))return null;
 if(s.sent!==undefined&&!(Array.isArray(s.sent)&&s.sent.every((h:unknown)=>typeof h==='string')))delete s.sent;return s;}catch{return null;}}
/** At most this many unanswered hashes are remembered per base rev (island hide, room hide, a milestone…). */
const SENT_MAX=4;
const setSyncState=(s:SyncState|null)=>{write(SAVE_SYNC_KEY,s?JSON.stringify(s):null);emit();};
let status:SaveStatus='none';
export function saveStatus():SaveStatus{if(!getLocalCode())return 'none';if(getSyncState()?.conflict)return 'saving';return status==='none'?(getSyncState()?'saved':'failed'):status;}
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
async function post(route:string,body:Record<string,unknown>,opts?:{keepalive?:boolean;compress?:boolean}):Promise<Answer|null>;
async function post(route:string,body:Record<string,unknown>,opts:{keepalive?:boolean;compress?:boolean;signal?:AbortSignal}):Promise<Answer|null|'timeout'>;
async function post(route:string,body:Record<string,unknown>,{keepalive=false,compress=false,signal}:{keepalive?:boolean;compress?:boolean;signal?:AbortSignal}={}):Promise<Answer|null|'timeout'>{
 const text=JSON.stringify(body);
 let payload:BodyInit=text,type='application/json';
 // A page-hide save that already fits a keepalive request goes out synchronously: gzip is async, and a closing or reloading
 // page may never get back to send it.
 const small=keepalive&&new TextEncoder().encode(text).length<=KEEPALIVE_BYTES;
 if(compress&&!small){const z=await gzip(text);if(z){payload=z as unknown as BodyInit;type='application/x-fi-save+gzip';}}
 const size=typeof payload==='string'?new TextEncoder().encode(payload).length:(payload as unknown as Uint8Array).byteLength;
 if(keepalive&&size>KEEPALIVE_BYTES)return null; // too big for a page-hide request: it goes with the next visible save
 try{
  const res=await fetch(`/api/save/${route}`,{method:'POST',headers:{'Content-Type':type},body:payload,keepalive,cache:'no-store',credentials:'same-origin',...(signal?{signal}:{})});
  let json:Record<string,unknown>={};try{json=await res.json();}catch{}
  return {status:res.status,json};
 }catch{return signal?.aborted?'timeout':null;}
}

/** This device's island as it would be uploaded: allowlisted keys, coach-plan text stripped, old wallet receipts folded. */
export function currentSnapshot(now=Date.now()):Snapshot|null{
 const s=storage();if(!s)return null;
 return buildSnapshot(s,now,(k,v)=>k===WALLET_KEY_NAME?compactWallet(v,now):v);
}
const localDirty=(state:SyncState|null)=>{const snap=currentSnapshot();return !!snap&&(!state||snapshotHash(snap)!==state.hash);};

/**
 * When this device's island last changed. Looked at on every save trigger (no timer): if the progress fingerprint moved since
 * the last look, the island was played now-ish. Keys the game writes by itself don't count (PLAYED_IGNORE_KEYS).
 */
function readPlayed():{hash:string;at:number}|null{try{const v=JSON.parse(read(SAVE_PLAYED_KEY)??'null');return v&&typeof v.hash==='string'&&typeof v.at==='number'?v:null;}catch{return null;}}
export function localPlayed(snap:Snapshot|null=currentSnapshot(),now=Date.now()):number{
 if(!snap)return 0;
 const h=progressHash(snap),r=readPlayed();if(r&&r.hash===h)return r.at;
 write(SAVE_PLAYED_KEY,JSON.stringify({hash:h,at:now}));return now;
}
const notePlayed=(snap:Snapshot|null,at:number)=>{if(snap)write(SAVE_PLAYED_KEY,JSON.stringify({hash:progressHash(snap),at}));};
/** Dev only: which keys differ when two copies of an island meet (finds keys that change by themselves). */
const devDiff=(why:string,here:Record<string,string>,there:Record<string,string>)=>{
 if(process.env.NODE_ENV==='development')try{console.info(`[saves] ${why}: keys that differ`,diffKeys(here,there));}catch{}
};

// ── Create ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
/** How long "Get my code" waits before handing back 'timeout' (the screen offers Try again or playing without a code). */
export const CREATE_TIMEOUT_MS=15_000;
export async function createSave({timeoutMs=CREATE_TIMEOUT_MS}:{timeoutMs?:number}={}):Promise<{ok:true;code:string}|{ok:false;reason:'unavailable'|'busy'|'error'|'timeout'}>{
 const existing=getLocalCode();if(existing)return {ok:true,code:existing};
 const snap=currentSnapshot();if(!snap)return {ok:false,reason:'error'};
 // One user-initiated request, aborted by the platform's own timer signal (no timer of ours stays armed).
 const signal=typeof AbortSignal!=='undefined'&&typeof AbortSignal.timeout==='function'?AbortSignal.timeout(timeoutMs):undefined;
 const r=await post('create',{snapshot:{...snap,played:localPlayed(snap)}},{compress:true,signal});
 if(r==='timeout')return {ok:false,reason:'timeout'};
 if(!r)return {ok:false,reason:'error'};
 if(r.status===503)return {ok:false,reason:'unavailable'};
 if(r.status===429)return {ok:false,reason:'busy'};
 if(r.json.ok!==true||typeof r.json.code!=='string')return {ok:false,reason:'error'};
 write(SAVE_CODE_KEY,r.json.code);write(SAVE_OPTOUT_KEY,null);setSyncState({rev:Number(r.json.rev)||1,hash:snapshotHash(snap),at:Date.now(),p:progressHash(snap)});localPlayed(snap);setStatus('saved');
 return {ok:true,code:r.json.code};
}

// ── Sync ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
/** One save job at a time in this tab: the start check and the saves never interleave (a save landing mid-check looked like
 * another device). Other tabs are covered by the shared `sent` list and by re-reading the sync state after each download. */
let inFlight:Promise<SaveStatus>|null=null,booting:Promise<BootResult>|null=null,lastAttempt=0,suspended=false,hiddenAt=0;
/** A tab back after at least this long away asks the server once more (another device may have played meanwhile). */
export const RESUME_CHECK_MS=60_000;
/**
 * Saves now if anything changed. `hide`: the tab is going away (keepalive, ≤ 64 KB). `milestone`: at most once per 2 minutes
 * (an earlier milestone's change is carried by the next one, or by the next hide: no timer is armed).
 */
export function syncNow(reason:'hide'|'milestone'|'manual'='manual'):Promise<SaveStatus>{
 const code=getLocalCode();if(!code||suspended)return Promise.resolve(saveStatus());
 const now=Date.now();
 // Going away: note when (for the check on coming back) and when this island last changed (for "newest wins").
 if(reason==='hide'){hiddenAt=now;localPlayed(currentSnapshot(now),now);}
 if(booting)return booting.then(()=>saveStatus());
 if(inFlight)return inFlight;
 if(reason==='milestone'&&now-lastAttempt<MILESTONE_GAP_MS)return Promise.resolve(saveStatus());
 const state=getSyncState();if(!state)return Promise.resolve(saveStatus());
 // A copy still waiting to be settled: settle it first (newest wins), unless the page is going away.
 if(state.conflict){if(reason==='hide')return Promise.resolve(saveStatus());
  inFlight=settle(code,{canReload:false}).then(()=>saveStatus()).finally(()=>{inFlight=null;});return inFlight;}
 const snap=currentSnapshot(now);if(!snap)return Promise.resolve(saveStatus());
 const hash=snapshotHash(snap);if(hash===state.hash)return Promise.resolve(saveStatus());
 lastAttempt=now;
 inFlight=send(code,state,snap,hash,reason).finally(()=>{inFlight=null;});
 return inFlight;
}
async function send(code:string,state:SyncState,snap:Snapshot,hash:string,reason:'hide'|'milestone'|'manual'):Promise<SaveStatus>{
 // Remember what we are sending before we send it: a page-hide save can land on the server while its page unloads unanswered.
 const sending:SyncState={...state,sent:[...(state.sent??[]).filter(h=>h!==hash),hash].slice(-SENT_MAX)};
 write(SAVE_SYNC_KEY,JSON.stringify(sending));
 const body={...snap,played:localPlayed(snap)};
 if(reason!=='hide')setStatus('saving');
 let st=sending;
 for(let attempt=0;attempt<2;attempt++){
  const r=await post('sync',{code,baseRev:st.rev,snapshot:body},{compress:true,keepalive:reason==='hide'});
  if(r?.json.ok===true&&Number.isInteger(r.json.rev)){setSyncState({rev:r.json.rev as number,hash,at:Date.now(),p:progressHash(snap)});setStatus('saved');return 'saved';}
  if(!(r?.json.conflict===true&&Number.isInteger(r.json.rev)))break;
  const theirs=r.json.rev as number;
  // Another tab of this island may already have saved and moved the number on: nothing to settle, the next save carries this.
  const fresh=getSyncState();
  if(fresh&&fresh.rev>=theirs&&!fresh.conflict){
   if(fresh.hash===hash||reason==='hide'||attempt>0){setStatus('saved');return 'saved';}
   st={...fresh,sent:union(fresh.sent,st.sent)};write(SAVE_SYNC_KEY,JSON.stringify(st));continue;}
  // Page going away: no time to download. Remember it; the next start (or the tab coming back) settles it, quietly.
  if(reason==='hide'){setSyncState({...(fresh??st),sent:union(fresh?.sent,st.sent),conflict:theirs});return 'saving';}
  if(attempt===0){const got=await settleWith(code,{canReload:false,sent:st.sent});if(got!=='retry')return saveStatus();
   const next=getSyncState();if(!next||next.conflict)break;if(next.hash===hash){setStatus('saved');return 'saved';}
   st={...next,sent:[hash]};write(SAVE_SYNC_KEY,JSON.stringify(st));continue;}
  break;
 }
 setStatus('failed');return 'failed';
}
const union=(a?:string[],b?:string[])=>[...new Set([...(a??[]),...(b??[])])].slice(-SENT_MAX*2);

export type BootResult='none'|'same'|'reloading'|'failed';
/**
 * One check when the island starts (doc §4.4). The server has a newer save and this device changed nothing since its last
 * save: take it quietly (apply and reload once, behind the loading screen). Both changed: newest wins, quietly too.
 */
export function bootCheck():Promise<BootResult>{
 const code=getLocalCode();if(!code)return Promise.resolve('none');
 if(booting)return booting;
 booting=(async():Promise<BootResult>=>{
  if(inFlight)await inFlight.catch(()=>null);
  const state=getSyncState();
  if(state?.conflict)return settleBoot(code);
  const r=await post('check',{code});
  if(!r||r.json.ok!==true||!Number.isInteger(r.json.rev)){setStatus('failed');return 'failed';}
  const rev=r.json.rev as number,fresh=getSyncState();
  if(fresh&&rev<=fresh.rev){setStatus('saved');return 'same';}
  // No record of the last save here (cleared state) but real progress on this device: never overwrite it unseen.
  if(fresh?localDirty(fresh):deviceHasProgress())return settleBoot(code);
  const got=await downloadOwn(code);if(!got)return 'failed';
  applyRestoredSave({ok:true,code,rev:got.rev,snapshot:got.snapshot,summary:summarise(got.snapshot.keys)},{backup:false});
  return 'reloading';
 })().finally(()=>{booting=null;});
 return booting;
}
const settleBoot=async(code:string):Promise<BootResult>=>{const r=await settle(code,{canReload:true});return r==='reloading'?'reloading':r==='failed'?'failed':'same';};
/**
 * The tab came back (SaveSync calls this on visibilitychange → visible), or a room page opened. A copy waiting to be settled
 * is settled now. One `check` runs as on start when an earlier save was never answered (`sent`: a page-hide save whose page
 * unloaded first; in the rooms that is every page-hide save), or after a minute or more away, so a device left open adopts
 * what another device played meanwhile before the player carries on here (no timer: two timestamps compared).
 */
export function resumeCheck():Promise<SaveStatus|BootResult>{
 const code=getLocalCode();if(!code||suspended||booting||inFlight)return Promise.resolve(saveStatus());
 const away=hiddenAt>0&&Date.now()-hiddenAt>=RESUME_CHECK_MS;hiddenAt=0;
 const st=getSyncState();
 if(st?.conflict){inFlight=settle(code,{canReload:true}).then(()=>saveStatus()).finally(()=>{inFlight=null;});return inFlight;}
 return away||!!st?.sent?.length?bootCheck():Promise.resolve(saveStatus());
}
/** settleWith, then this device's island is saved on top when it was kept. */
async function settle(code:string,o:{canReload:boolean}){
 const r=await settleWith(code,o);if(r!=='retry')return r;
 const st=getSyncState(),snap=currentSnapshot();if(!st||!snap)return 'failed' as const;
 const hash=snapshotHash(snap);if(hash!==st.hash)await send(code,st,snap,hash,'manual');else setStatus('saved');
 return 'kept' as const;
}

/**
 * Two copies of one island meet (doc §4.4). One download, then:
 *  1. the server holds this island, our last save, or one this device sent (its answer lost): take its number, save on top;
 *  2. otherwise the copy played most recently wins (a copy with no progress never beats one with progress; a tie on the
 *     clock goes to more progress); the other is kept on this device for 7 days.
 *     Coins are never added across copies: one whole island is kept, the other is set aside whole.
 * The saved copy winning means a reload: done at a start or when the tab comes back, otherwise left for then.
 */
async function settleWith(code:string,{canReload,sent=[]}:{canReload:boolean;sent?:string[]}):Promise<'kept'|'reloading'|'waiting'|'failed'|'retry'>{
 const saved=await downloadOwn(code);if(!saved){setStatus('failed');return 'failed';}
 const s=storage(),here=currentSnapshot();if(!s||!here){setStatus('failed');return 'failed';}
 const st=getSyncState(),h=snapshotHash(saved.snapshot),hereHash=snapshotHash(here);
 const ours=h===hereHash||h===st?.hash||union(st?.sent,sent).includes(h);
 const p=progressHash(saved.snapshot);
 if(ours){
  setSyncState({rev:saved.rev,hash:h,at:Date.now(),p});
  if(h===hereHash){setStatus('saved');return 'kept';}
  return 'retry';
 }
 devDiff('two copies met',here.keys,saved.snapshot.keys);
 const herePlayed=localPlayed(here),therePlayed=playedTime(saved.snapshot);
 // A copy with no progress at all never beats one with progress, whatever the clocks say (a device that only looked around).
 const hereReal=hasProgress(here.keys),thereReal=hasProgress(saved.snapshot.keys);
 const keepHere=hereReal!==thereReal?hereReal:herePlayed!==therePlayed?herePlayed>therePlayed:progressRank(here.keys)>=progressRank(saved.snapshot.keys);
 if(keepHere){
  // Set aside only a copy with something of its own (not one that differs just in keys the game writes by itself), so a
  // trivial copy never pushes out a real one.
  if(p!==progressHash(here))writeBackup(s,Date.now(),saved.snapshot.keys,therePlayed);
  setSyncState({rev:saved.rev,hash:h,at:Date.now(),p});
  return 'retry';
 }
 if(!canReload){setSyncState({...(st??{rev:0,hash:'',at:0}),conflict:saved.rev});setStatus('saving');return 'waiting';}
 // This device's copy is set aside, unless it holds nothing beyond what it last saved (that copy was kept wherever it lost).
 applyRestoredSave({ok:true,code,rev:saved.rev,snapshot:saved.snapshot,summary:summarise(saved.snapshot.keys)},{herePlayed,backup:st?.p!==progressHash(here)});
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
export function applyRestoredSave(r:Extract<RestoreResult,{ok:true}>,{reload=true,backup=true,herePlayed}:{reload?:boolean;backup?:boolean;herePlayed?:number}={}){
 const s=storage();if(!s)return;
 suspended=true;
 const now=Date.now();
 const before=currentSnapshot(now);
 if(backup&&deviceHasProgress()&&(!before||progressHash(before)!==progressHash(r.snapshot)))writeBackup(s,now,undefined,herePlayed??localPlayed(before));
 applySnapshot(s,r.snapshot);
 if(read('fi2-welcome-v1')===null)write('fi2-welcome-v1','completed');
 write(SAVE_CODE_KEY,r.code);write(SAVE_OPTOUT_KEY,null);
 const snap=currentSnapshot(now);
 write(SAVE_SYNC_KEY,JSON.stringify({rev:r.rev,hash:snap?snapshotHash(snap):'',at:now,...(snap?{p:progressHash(snap)}:{})}));
 // The island keeps its own "last played" time: loading it here is not playing it.
 notePlayed(snap,playedTime(r.snapshot)||now);
 write(SAVE_TRIES_KEY,null);
 // Other open tabs of the island reload too (SaveSync listens), so no tab merges its old ledger into the new one.
 write(SAVE_APPLIED_KEY,String(now));
 if(reload&&typeof location!=='undefined')location.reload();
}

// ── Backup, delete, email ──────────────────────────────────────────────────────────────────────────────────────────────
/** The other copy of the island kept on this device for 7 days (after a restore, or after two copies met), if any. */
export function swapBackup():(Backup&{summary:IslandSummary;playedOn:number})|null{
 const s=storage(),b=s?readBackup(s,Date.now()):null;if(!b)return null;
 return {...b,summary:summarise(b.keys),playedOn:b.played??b.at};
}
/**
 * "Restore the other island" (a grown-up, behind the gate): the backed-up island comes back and becomes the newest copy, so the
 * next save puts it on the server; the island it replaces becomes the backup (so this can be undone the same way).
 */
export function undoSwap(){
 const s=storage(),b=s?readBackup(s,Date.now()):null;if(!s||!b)return false;
 suspended=true;
 const now=Date.now(),herePlayed=localPlayed();
 const current=localKeys(s);try{const idp=s.getItem('fi2-idp-plan-v1');if(idp!==null)current['fi2-idp-plan-v1']=idp;}catch{}
 applySnapshot(s,{format:1,game:'',keys:b.keys});
 write(SAVE_BACKUP_KEY,null);
 writeBackup(s,now,current,herePlayed);
 notePlayed(currentSnapshot(now),now);
 write(SAVE_APPLIED_KEY,String(now));
 location.reload();return true;
}
/** Deletes the save from the server (doc §4.7). This device keeps its game; the code is forgotten here. */
export async function deleteSave():Promise<boolean>{
 const code=getLocalCode();if(!code)return true;
 const r=await post('delete',{code});
 if(!r||r.json.ok!==true)return false;
 write(SAVE_CODE_KEY,null);write(SAVE_SYNC_KEY,null);write(INSTALL_ID_KEY,null);write(SAVE_OPTOUT_KEY,new Date().toISOString().slice(0,10));setStatus('none');return true;
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
 const m=/^#save=([a-z-]{8,40}\d{3,4})$/i.exec(location.hash);
 if(!m)return null;
 try{history.replaceState(history.state,'',location.pathname+location.search);}catch{}
 pendingCode=m[1].toLowerCase();return pendingCode;
}
/** A code from a QR link waiting for the restore screen (the welcome screen takes it when it opens). */
export const pendingRestoreCode=()=>pendingCode;
export const clearPendingRestoreCode=()=>{pendingCode=null;};
