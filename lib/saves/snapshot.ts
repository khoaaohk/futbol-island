/**
 * What a save holds (docs/accounts-design.md §4.1–§4.2, §4.6; Oct 9 2026). Pure, with a storage port, so the browser, the API
 * routes (which re-check every key) and tests/game-saves.cjs share one allowlist.
 *
 * A snapshot is `{format:1, game:'<client day>', keys:{<allowlisted localStorage key>: <raw string>}}`. Values are the raw
 * strings, so each store's own version field and sanitiser stay the source of truth when the save is loaded.
 *
 *  - SYNC: progress (lessons, coins, cards, exploration…). Only these keys, and the per-game arcade records, ever leave the
 *    device. lib/dev/unlockAll.ts's SAVE_KEY_PATTERN is the prefix rule every key below satisfies; the allowlist is explicit.
 *  - DEVICE: preferences each device keeps for itself (volume, controls, battery saver, welcome-back day…).
 *  - NEVER: session-only, developer-only and the save system's own keys (the code itself, the sync state, the backup).
 *  - Coach-plan (IDP) free text is never synced: the plan's choices travel, its typed notes and strength stay on this device.
 */
export const SNAPSHOT_FORMAT=1;
/** Doc §4.1 table A. Order follows the doc. */
export const SYNC_KEYS:readonly string[]=[
 // Character & onboarding
 'futbol-island-customization-v1','fi2-welcome-v1',
 // Lessons & quizzes (quiz growth is the migration marker that must travel with quiz progress)
 'futbol-island-quiz-progress-v1','futbol-island-quiz-growth-v1','futbol-island2.progress.v1','fi2-quiz-runs-v1','fi2-lesson-review-v1',
 'fi2-football-learning-v1','fi2-lesson-format-v1','fi2-path-format-v1','fi2-path-last-opened-v1','fi2-optional-path-stories-v1',
 'fi2-life-paths-v1','fi2-graduations-v1',
 // Exploration
 'futbol-island-quests-v1','fi2-passport-v1','fi2-club-stories-v1','fi2-matchday-coins-v1','fi2-explore-activity-v1',
 'fi2-east-pier-challenge-v1',
 'fi2-summit-kick-v1','fi2-telescope-v1',// Summit Isle (Oct 12 2026): the Summit Kick best; the telescope's glints (the telescope was removed Oct 14 2026: the key
 // stays so an older save's data still round-trips and is never dropped)
 // The museum passport (Oct 9 2026): exhibits stepped inside / finished (lib/museum/museumVisits.ts)
 'fi2-museum-visits-v1',
 // Museum mini-games (Oct 10 2026): the Legends arena progress and the best scores, small and worth keeping across devices
 // (Oct 12 2026: the back-pass press best went with its case; Stadiums of the World and Boots through time keep theirs)
 'fi2-museum-hof-arena-v1','fi2-museum-timeline-order-best','fi2-museum-stadiums-best','fi2-museum-boots-best',
 // Coins & items
 'fi2-arcade-wallet-v1','fi2-vending-v1','fi2-backpack-v1','fi2-home-decor-v1','fi2-ride-unlocks-v1','fi2-ride-unlock-announced-v1',
 'fi2-costume-milestone-v1',
 // Cards & books
 'fi2-player-cards-v1','fi2-card-offers-v1','fi2-card-trade-v1','fi2-binder-layout-v1','fi2-player-books-v1','fi2-book-checks-v1',
 'fi2-book-checks-answered-v1',
 // Jobs, fishing, food
 // fi2-market-v1 also holds today's per-good sales and part-coin tallies (Oct 14 2026 economy rebalance, docs/economy.md): synced, so a
 // second device cannot reset Rosa's same-kind ladder.
 'fi2-island-jobs-v1','fi2-garden-v1','fi2-market-v1','fi2-fishbook-v1','fi2-konbini-v1','fi2-konbini-collection-v1','fi2-konbini-ball-v1',
 'fi2-summit-forage-v1',// Summit Isle fruit trees (Oct 13 2026): fruit picked per tree (regrow clock), today's count, the tip seen
 'fi2-fishing-log-v1',// Fishing content (Oct 15 2026, docs/fishing.md "Content systems"): legends, clues, requests, the lure on the line, Fishbook rewards
 'fi2-beachcomb-v1',// Beachcombing (Oct 14 2026, docs/beachcombing.md): the Shellbook, today's taken spots, the tips seen
 'fi2-bug-book-v1',// The Bug book (Oct 20 2026, lib/town/jobs/bugBook.ts): catch counts for the 8 Summit bugs + 8 fireflies and the reward flag (≤ ~130 bytes)
 'fi2-dive-finds-v1',// Diving spots (Oct 16 2026, docs/swimming-research.md "P2 implemented"): the finds used per spot (a treasure pays once ever)
 'fi2-shop-jersey-v1','fi2-shop-boots-v1','fi2-shop-ball-v1','fi2-shop-owned-v1',// Kit Shop designs + bought items (lib/shop)
 // Arcade (plus fi2-arcade-record-<game>-v1, ARCADE_RECORD_KEY)
 'fi2-strikers-stars-v1','fi2-strikers-cup-v1','fi2-strikers-shape-v1','fi2-runner-missions-v1','fi2-runner-coach-v1','fi2-tennis-stars-v1',
 'fi2-pinball-stars-v1','fi2-pass-puzzles-v1','fi.game.runner.best',
 // Grown-ups & IDP (the IDP with its free text removed: stripIdpText). fi2-idp-v2 (Oct 9 2026) holds ids, dates and picture
 // choices only; its typed words live in the device key fi2-idp-text-v1 (DEVICE_KEYS), which never syncs.
 'fi2-grownups-format-v1','fi2-idp-plan-v1','fi2-idp-v2',
];
export const ARCADE_RECORD_KEY=/^fi2-arcade-record-[a-z0-9]{1,24}(?:-[a-z0-9]{1,24}){0,2}-v1$/;
/** Doc §4.1 table B: each device keeps its own. */
export const DEVICE_KEYS:readonly string[]=['fi2-music-enabled','fi2-bug-pill-v1','fi2-music-volume','fi2-sound-muted','fi2-sound-volume','fi2-audio-mix',
 'fi2-voice-enabled','fi2-coach-voice','fi2-controls-flipped','fi2-battery-saver','fi2-time-of-day','fi2-cards-field-v1','fi-card-dots',
 'fi2-last-visit-day-v1','fi2-bottle-open-date','fi2-idp-text-v1',
 // The energy bar (Oct 12 2026): refilled on each device's first visit of the day and redrawn as the player walks (a float),
 // so it changed on every visit without any progress and made a second copy of the island look different. Per device now.
 'fi2-fuel-v1',
 // The Kit Shop studios' phone panel size (Oct 14 2026): a per-device layout preference.
 'fi2-studio-sheet-v1',
 // The sea (Oct 15 2026): the once-per-device swim lesson toast, and the analytics "first wade / first swim" device flags.
 'fi2-swim-lesson-v1','fi2-water-firsts-v1',
 // The sea (Oct 15 2026): the once-per-device shark ("Uh oh!") and manta/whale-shark ride lesson toasts.
 'fi2-shark-lesson-v1','fi2-ride-lesson-v1','fi2-ride-steer-hint-v1','fi2-dive-hint-v1',
 // Diving spots (Oct 16 2026): the once-per-device breath (pace) lesson toast.
 'fi2-dive-lesson-v1',
 // Summit Isle tree kick (Oct 15 2026): the once-per-device strike lesson.
 'fi2-tree-kick-lesson-v1',
 // Fish stall kick (Oct 15 2026): the once-per-device shooting lesson.
 'fi2-stall-kick-lesson-v1',
 // Players in /admin (Oct 16 2026): this device's random install id (16 random bytes, lib/analytics/deviceMarks.ts). Never
 // synced, so a code restored elsewhere does not copy it; deleting the save removes it (lib/saves/client.ts deleteSave).
 'fi2-install-v1',
 // Coaches Board plays stay on the device (user, Oct 9 2026): play names are typed text and could name a child. Share links move them.
 // Summit Isle easel paintings (Oct 14 2026): child-made pictures stay on the device (never synced, never sent anywhere).
 'fi2-paintings-v1',
 // Fishing (Oct 15 2026): the first-time ghost-hand tutorial seen, and the Easy reel choice (a per-device control preference).
 'fi2-fish-tutorial-v1',
 'fi2-coach-plays-v1','fi2-arcade-boards-v1'];// arcade leaderboards: the device board, its letters and its own island-entry claims (docs/arcade-leaderboards.md)
/** The save system's own device keys. The code is kept here so this device can sync and show "My save code". */
/** The device's random install id for anonymous player counts (Oct 16 2026; DEVICE_KEYS above). */
export const INSTALL_ID_KEY='fi2-install-v1';
export const SAVE_CODE_KEY='fi2-save-code-v1',SAVE_SYNC_KEY='fi2-save-sync-v1',SAVE_BACKUP_KEY='fi2-save-backup-v1',
 SAVE_TRIES_KEY='fi2-save-tries-v1',SAVE_NUDGE_KEY='fi2-save-nudge-v1',SAVE_APPLIED_KEY='fi2-save-applied-v1',
 /** {hash,at}: when this device's island last changed (progressHash), so two copies can be told apart by "played last". */
 SAVE_PLAYED_KEY='fi2-save-played-v1',
 /** Set when a grown-up deletes the save (behind the ParentGate): this device is not asked for a code again. */
 SAVE_OPTOUT_KEY='fi2-save-deleted-v1';
/** Doc §4.1 table C, plus the save system's own keys. */
export const NEVER_KEYS:readonly string[]=['fi2-parent-gate-lock-v1','fi2-arcade-departure-v1','fi-card-back-tab','fi2-dev-unlock-toast',
 'fi-visit','fi-visit-off','fi2-cards-dev-v1','fi2-cards-dev-progress-v1','fi2-card-trade-dev-v1','fi2-ride-dev-paths-v1','fi2-path-art-source',
 SAVE_CODE_KEY,SAVE_SYNC_KEY,SAVE_BACKUP_KEY,SAVE_TRIES_KEY,SAVE_NUDGE_KEY,SAVE_APPLIED_KEY,SAVE_OPTOUT_KEY,SAVE_PLAYED_KEY];
export const IDP_KEY_NAME='fi2-idp-plan-v1',IDP2_KEY_NAME='fi2-idp-v2',WALLET_KEY_NAME='fi2-arcade-wallet-v1';
const SYNC=new Set(SYNC_KEYS);
export const isSyncKey=(key:unknown):key is string=>typeof key==='string'&&(SYNC.has(key)||ARCADE_RECORD_KEY.test(key));

/** Size caps (doc §4.1 Limits). The server enforces them too. */
export const MAX_SNAPSHOT_BYTES=512*1024,MAX_GZIP_BYTES=192*1024,MAX_KEY_BYTES=256*1024,KEEPALIVE_BYTES=64*1024;

/** `played` (ms, optional): when the island last changed on the device that saved it ("newest wins", doc §4.4). */
export type Snapshot={format:number;game:string;keys:Record<string,string>;played?:number};
export type StoragePort={getItem(k:string):string|null;setItem(k:string,v:string):void;removeItem(k:string):void;readonly length:number;key(i:number):string|null};

/** Every key currently in a storage area (localStorage is not iterable everywhere). */
export function storageKeys(s:Pick<StoragePort,'length'|'key'>):string[]{const out:string[]=[];for(let i=0;i<s.length;i++){const k=s.key(i);if(k!==null)out.push(k);}return out;}

/**
 * Coach-plan notes are child-typed free text (a name, a school…), so they never leave the device (doc §4.6). The structured
 * choices stay: the focus, review ticks, reflection tags, the strength's corner. A note with no tag has nothing left and is
 * dropped. Works on any shape (unknown fields are kept unless they are text), so an older or newer IDP version is still safe.
 */
export function stripIdpText(raw:string):string|null{
 let v:unknown;try{v=JSON.parse(raw);}catch{return null;}
 if(!v||typeof v!=='object'||Array.isArray(v))return null;
 const blank=(x:unknown):unknown=>{
  if(Array.isArray(x))return x.map(blank);
  if(!x||typeof x!=='object')return typeof x==='string'&&x.length>40?'':x;
  const o:Record<string,unknown>={};
  for(const [k,val] of Object.entries(x as Record<string,unknown>))o[k]=k==='text'||k==='note'||k==='notes'&&typeof val==='string'?'':blank(val);
  return o;
 };
 const out=blank(v) as {plan?:{notes?:unknown[]}|null};
 if(out.plan&&Array.isArray(out.plan.notes))out.plan.notes=out.plan.notes.filter(n=>!!n&&typeof n==='object'&&typeof (n as {tag?:unknown}).tag==='string');
 return JSON.stringify(out);
}

/** Puts this device's typed IDP text back onto a downloaded plan, note by note id (and the strength if the corner matches). */
export function mergeIdpText(downloaded:string,local:string|null):string{
 if(!local)return downloaded;
 try{
  const d=JSON.parse(downloaded),l=JSON.parse(local);
  const texts=new Map<string,string>();for(const n of l?.plan?.notes??[])if(n&&typeof n.id==='string'&&typeof n.text==='string')texts.set(n.id,n.text);
  if(d?.plan&&Array.isArray(d.plan.notes))d.plan.notes=d.plan.notes.map((n:{id?:string;text?:string})=>n&&n.id&&texts.has(n.id)&&!n.text?{...n,text:texts.get(n.id)}:n);
  if(d?.plan?.strength&&l?.plan?.strength&&d.plan.strength.corner===l.plan.strength.corner&&!d.plan.strength.text&&typeof l.plan.strength.text==='string')d.plan.strength={...d.plan.strength,text:l.plan.strength.text};
  // Local-only notes (typed here, with no tag) come back too, so restoring onto this device never loses its own notes.
  if(d?.plan&&l?.plan&&d.plan.goalId===l.plan.goalId){const ids=new Set((d.plan.notes??[]).map((n:{id?:string})=>n?.id));for(const n of l.plan.notes??[])if(n&&!ids.has(n.id))d.plan.notes=[...(d.plan.notes??[]),n];}
  return JSON.stringify(d);
 }catch{return downloaded;}
}

/**
 * Validates and cleans a snapshot's keys (client before upload, server before storing): allowlisted keys with string values
 * under the per-key cap only, IDP text stripped. Returns null for a snapshot that is not an object of strings.
 */
export function cleanKeys(keys:unknown):Record<string,string>|null{
 if(!keys||typeof keys!=='object'||Array.isArray(keys))return null;
 const out:Record<string,string>={};
 for(const [k,v] of Object.entries(keys as Record<string,unknown>)){
  if(!isSyncKey(k)||typeof v!=='string'||v.length>MAX_KEY_BYTES)continue;
  if(k===IDP_KEY_NAME||k===IDP2_KEY_NAME){const s=stripIdpText(v);if(s!==null)out[k]=s;continue;}
  out[k]=v;
 }
 return out;
}

/** Reads this device's allowlisted keys. `transform` (wallet compaction) may rewrite a value before upload. */
export function buildSnapshot(storage:Pick<StoragePort,'getItem'|'length'|'key'>,now:number,transform?:(key:string,value:string)=>string):Snapshot{
 const keys:Record<string,string>={};
 for(const k of storageKeys(storage).filter(isSyncKey).sort()){
  let v:string|null=null;try{v=storage.getItem(k);}catch{}
  if(v===null)continue;
  if(transform)try{v=transform(k,v);}catch{}
  keys[k]=v;
 }
 return {format:SNAPSHOT_FORMAT,game:new Date(now).toISOString().slice(0,10),keys:cleanKeys(keys)??{}};
}

/** FNV-1a 32-bit over the keys in sorted order: the cheap "did anything change since the last save" check (doc §4.3). */
export function snapshotHash(s:Pick<Snapshot,'keys'>):string{
 let h=0x811c9dc5;
 const feed=(t:string)=>{for(let i=0;i<t.length;i++){h^=t.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}h^=0;h=Math.imul(h,0x01000193)>>>0;};
 for(const k of Object.keys(s.keys).sort()){feed(k);feed(s.keys[k]);}
 return h.toString(16).padStart(8,'0');
}
/**
 * Synced keys a game writes by itself (on load, per day, when something is merely seen), not because the player did anything.
 * They still travel with the island, but they never make it count as "played more recently" (doc §4.4).
 */
export const PLAYED_IGNORE_KEYS:readonly string[]=[
 // Re-rolled or stamped just by looking: card offers (re-rolled on view), backpack/vending "seen" and "found" marks
 'fi2-card-offers-v1','fi2-backpack-v1','fi2-vending-v1',
 // Derived from other progress on load (counted there already) or announced-once flags written on mount
 'fi2-ride-unlocks-v1','fi2-ride-unlock-announced-v1','fi2-costume-milestone-v1','fi2-graduations-v1','futbol-island-quiz-growth-v1',
 // Migrations and preferences written on mount: the IDP v1 mirror, the inferred path/lesson format, onboarding done
 'fi2-idp-plan-v1','fi2-path-format-v1','fi2-lesson-format-v1','fi2-grownups-format-v1','fi2-welcome-v1',
];
/** snapshotHash without PLAYED_IGNORE_KEYS: the "did the player change anything" fingerprint behind the played time. */
export function progressHash(s:Pick<Snapshot,'keys'>):string{
 const keys:Record<string,string>={};for(const [k,v] of Object.entries(s.keys))if(!PLAYED_IGNORE_KEYS.includes(k))keys[k]=v;
 return snapshotHash({keys});
}
/** Keys whose values differ between two islands (for the dev-only log and tests). */
export function diffKeys(a:Record<string,string>,b:Record<string,string>):string[]{
 return [...new Set([...Object.keys(a),...Object.keys(b)])].filter(k=>a[k]!==b[k]).sort();
}
/** When an island was last played: its `played` stamp, else the start of the day it was saved (older saves). */
export function playedTime(s:Pick<Snapshot,'played'|'game'>):number{
 if(typeof s.played==='number'&&s.played>0)return s.played;
 const d=Date.parse(`${s.game}T00:00:00Z`);return Number.isFinite(d)?d:0;
}
export const snapshotBytes=(s:Snapshot)=>new TextEncoder().encode(JSON.stringify(s)).length;

/** Validates a downloaded snapshot. `newer` means a later game wrote it: ask for a refresh and never overwrite anything. */
export function readSnapshot(v:unknown):{ok:true;snapshot:Snapshot}|{ok:false;newer:boolean}{
 if(!v||typeof v!=='object')return {ok:false,newer:false};
 const s=v as Partial<Snapshot>;
 if(typeof s.format!=='number')return {ok:false,newer:false};
 if(s.format>SNAPSHOT_FORMAT)return {ok:false,newer:true};
 const keys=cleanKeys(s.keys);if(!keys)return {ok:false,newer:false};
 const played=typeof s.played==='number'&&Number.isFinite(s.played)&&s.played>0?Math.floor(s.played):undefined;
 return {ok:true,snapshot:{format:SNAPSHOT_FORMAT,game:typeof s.game==='string'?s.game.slice(0,10):'',keys,...(played?{played}:{})}};
}

/**
 * Replaces this device's progress with a snapshot: every allowlisted key is set to the snapshot's value or removed when the
 * snapshot has none, so the island is exactly the saved one. Device and session keys are untouched; this device's own IDP
 * text is put back onto the plan.
 */
export function applySnapshot(storage:StoragePort,snapshot:Snapshot){
 const localIdp=(()=>{try{return storage.getItem(IDP_KEY_NAME);}catch{return null;}})();
 for(const k of storageKeys(storage))if(isSyncKey(k)&&!(k in snapshot.keys))try{storage.removeItem(k);}catch{}
 for(const [k,v] of Object.entries(snapshot.keys))if(isSyncKey(k))try{storage.setItem(k,k===IDP_KEY_NAME?mergeIdpText(v,localIdp):v);}catch{}
}

/** The 7-day on-device copy kept when a swap replaces this device's island (doc §3.3, §4.4). */
export const BACKUP_DAYS=7;
/** `played`: when that island was last played (shown to a grown-up as "Restore the other island from <date>"). */
export type Backup={at:number;keys:Record<string,string>;played?:number};
export function writeBackup(storage:StoragePort,now:number,keys?:Record<string,string>,played?:number){
 const k=keys??buildSnapshot(storage,now).keys;
 // The local copy keeps this device's IDP text: it never leaves the device.
 if(!keys){try{const idp=storage.getItem(IDP_KEY_NAME);if(idp!==null)k[IDP_KEY_NAME]=idp;}catch{}}
 try{storage.setItem(SAVE_BACKUP_KEY,JSON.stringify({at:now,keys:k,...(played?{played}:{})}));return true;}catch{return false;}
}
export function readBackup(storage:Pick<StoragePort,'getItem'|'removeItem'>,now:number):Backup|null{
 let b:Backup|null=null;try{b=JSON.parse(storage.getItem(SAVE_BACKUP_KEY)??'null');}catch{}
 if(!b||typeof b.at!=='number'||!b.keys||typeof b.keys!=='object')return null;
 if(now-b.at>BACKUP_DAYS*864e5){try{storage.removeItem(SAVE_BACKUP_KEY);}catch{}return null;}
 return b;
}

/** "This device has an island too": real progress beyond a fresh start (the welcome coins and a chosen look don't count). */
export function hasProgress(keys:Record<string,string|null|undefined>):boolean{
 const json=(k:string)=>{try{return JSON.parse(keys[k]??'null');}catch{return null;}};
 const quiz=json('futbol-island-quiz-progress-v1');if(Array.isArray(quiz)&&quiz.length)return true;
 const quests=json('futbol-island-quests-v1');if(quests&&((Array.isArray(quests.steps)&&quests.steps.length)||(Array.isArray(quests.visits)&&quests.visits.length)))return true;
 // The starter kit (3 cards in the Backpack, the welcome coins) is not progress: every new device has it.
 const starter=new Set<string>(json('fi2-backpack-v1')?.starter?.cards??[]);
 const cards=json('fi2-player-cards-v1');if(Array.isArray(cards)&&cards.some(c=>!starter.has(c)))return true;
 const wallet=json(WALLET_KEY_NAME);
 if(wallet&&wallet.runs&&typeof wallet.runs==='object')for(const id of Object.keys(wallet.runs))if(!id.startsWith('island-starter-coins')&&!id.startsWith('daily-play:'))return true;
 const fish=json('fi2-fishbook-v1');if(fish&&typeof fish==='object'&&Object.keys(fish.species??fish.caught??{}).length)return true;
 return false;
}
export function localKeys(storage:Pick<StoragePort,'getItem'|'length'|'key'>):Record<string,string>{return buildSnapshot(storage,0).keys;}
