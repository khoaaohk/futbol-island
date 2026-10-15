'use client';
/**
 * Browser binding for fishing: the Fishbook in localStorage, and landed fish going into the shared farmers-market basket
 * (lib/town/market/market.ts via the island wallet bridge in lib/town/jobs/islandWallet.ts — imported, never edited here).
 * No timers or polling: everything runs on a catch or a storage event.
 */
import {useSyncExternalStore} from 'react';
import {FISHBOOK_STORAGE_KEY,emptyFishbook,mergeFishbooks,recordCatch,sanitizeFishbook,type Fishbook} from './fishingCore';
import type {FishId} from './fishCatalog';
import {islandMarket} from '../jobs/islandWallet';
import {signalExplore} from '../exploreSignals';

const server=emptyFishbook();let state=server,loaded=false;const listeners=new Set<()=>void>();
const readSaved=()=>{try{return sanitizeFishbook(JSON.parse(localStorage.getItem(FISHBOOK_STORAGE_KEY)??'null'));}catch{return emptyFishbook();}};
export function readFishbook():Fishbook{if(!loaded&&typeof window!=='undefined'){loaded=true;state=readSaved();}return state;}
const emit=()=>listeners.forEach(fn=>fn());
const storage=(e:StorageEvent)=>{if(e.key===FISHBOOK_STORAGE_KEY||e.key===null){loaded=false;readFishbook();emit();}};
export function subscribeFishbook(fn:()=>void){listeners.add(fn);if(listeners.size===1)window.addEventListener('storage',storage);return()=>{listeners.delete(fn);if(!listeners.size)window.removeEventListener('storage',storage);};}
export const useFishbook=()=>useSyncExternalStore(subscribeFishbook,readFishbook,()=>server);

export type LandResult={isNew:boolean;isBiggest:boolean;inBasket:boolean};
/** Log the catch (merging with another tab's save) and put the fish in the market basket if there is room. */
export function landFish(id:FishId,size:number,now=Date.now()):LandResult{
 const r=recordCatch(mergeFishbooks(readFishbook(),readSaved()),id,size,now);
 state=r.book;try{localStorage.setItem(FISHBOOK_STORAGE_KEY,JSON.stringify(r.book));}catch{}emit();signalExplore('fish');
 let added=0;try{added=islandMarket.gather(id,1);}catch{}
 return {isNew:r.isNew,isBiggest:r.isBiggest,inBasket:added>0};
}

// ---- The live session singleton (HUD <-> island loop). Sounds reuse the island sound system's document cues. ----
import {createFishingSession,type FishCue} from './fishingSession';
/**
 * Sounds (Oct 14 2026 polish: "subtle sounds for the cast whoosh, plop, reel click, splash and catch"): every cue reuses the island
 * sound kit's existing document events (no new audio context, no new voices; islandSound.ts rate-limits each one and keeps them
 * quiet): the cast is a soft whoosh (job 'throw'), the float landing a plop (path 'undock'), each reel tap a small click (job 'snip'),
 * the bite a plunge plus a splash hiss (job 'swish'), the catch the finish jingle plus a splash as it leaves the water.
 * Haptics: a short pulse on the bite (scaled by its shadow since Oct 15 2026) and a little double pulse on the catch, where the browser supports navigator.vibrate (not with
 * reduced motion), the same pattern the arcade uses.
 */
const CUES:Record<FishCue,readonly (readonly [string,string])[]>={tick:[['fi2-path-cue','path-pop']],splash:[['fi2-path-cue','undock']],
 plunge:[['fi2-path-cue','swipe-left'],['fi2-job-cue','swish']],cast:[['fi2-job-cue','throw']],fanfare:[['fi2-story-cue','finish'],['fi2-job-cue','swish']],reel:[['fi2-job-cue','snip']],
 // Oct 15 2026 (A5, B1): the warning twang before an idle escape, a slip's tug, a run's rush of water.
 twang:[['fi2-job-cue','spring']],slip:[['fi2-job-cue','tug']],run:[['fi2-job-cue','swish']]};
/** Haptics (A1, Oct 15 2026, Animal Crossing's pattern): a 6 ms tick on each nibble, the bite pulse grows with the shadow
 *  (`plunge` 14 ms for a small shadow + BITE_HAPTIC_STEP per size class, up to 30 ms for a giant), a twang before an escape. */
const HAPTIC:Partial<Record<FishCue,number|number[]>>={tick:6,plunge:14,fanfare:[10,40,18],twang:[8,40,8],slip:20,run:10};
export const BITE_HAPTIC_STEP=4;
/** The haptic pattern for a cue (`strength` = the bite's shadow size step 0..4). */
export const hapticFor=(kind:FishCue,strength=0):number|number[]|undefined=>kind==='plunge'?14+BITE_HAPTIC_STEP*Math.max(0,Math.min(4,strength)):HAPTIC[kind];
let lastHaptic=0;
function fishHaptic(kind:FishCue,strength=0){const p=hapticFor(kind,strength);if(p===undefined||typeof navigator==='undefined'||typeof navigator.vibrate!=='function')return;
 const now=Date.now();if(now-lastHaptic<150&&kind!=='plunge')return;try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;lastHaptic=now;navigator.vibrate(p);}catch{/* no haptics */}}
/**
 * ONE session per page, kept on globalThis so it survives hot updates (Sep 29 2026 fix, "the fishing for the boat doesn't
 * work"). A hot update of any module under this one (catalogue, boat data …) re-ran this file and made a SECOND session:
 * the HUD's Fish button then started the new one while the island loop (created once by Town's mount effect) kept stepping
 * the old one, so the prompt showed but fishing never began until a full reload. The land/cue callbacks go through
 * `hot` so the shared session always uses the newest module code.
 */
type HotFishing={session?:ReturnType<typeof createFishingSession>;land?:typeof landFish;cue?:(kind:FishCue,strength?:number)=>void};
const hot:HotFishing=typeof globalThis==='undefined'?{}:((globalThis as {__fi2Fishing?:HotFishing}).__fi2Fishing??={});
hot.land=landFish;
hot.cue=(kind,strength)=>{try{for(const [name,detail] of CUES[kind])document.dispatchEvent(new CustomEvent(name,{detail:kind==='reel'&&strength!==undefined?{cue:detail,gain:.5+Math.max(0,Math.min(1,strength))}:detail}));}catch{}fishHaptic(kind,strength);};// the reel's ratchet carries its spin rate as a gain (islandSound.ts jobCue)
export const fishingSession=hot.session??=createFishingSession(
 (id,size)=>{const r=hot.land!(id,size);return {isNew:r.isNew,isBiggest:r.isBiggest,inBasket:r.inBasket};},
 (kind,strength)=>hot.cue!(kind,strength),
);
/** The event API (docs/fishing.md "Event API", ./fishingSession.ts): subscribe to cast / bite / hook / catch / escape … */
export const onFishingEvent:typeof fishingSession.onFishingEvent=fn=>fishingSession.onFishingEvent(fn);
/** A4: the biggest size this player has landed of a species (cm, 0 = never caught); the catch card's RECORD stamp is a new one. */
export const bestSize=(id:FishId)=>readFishbook().species[id]?.biggest??0;

// ---- Device preferences (Oct 15 2026): the first-time tutorial, per device (lib/saves/snapshot.ts DEVICE_KEYS;
// docs/accounts-design.md table B). No timers: read once, written on change. (The Easy reel option was removed: the spin fight is the only reel.) ----
export const FISH_TUTORIAL_KEY='fi2-fish-tutorial-v1';
const prefListeners=new Set<()=>void>();let prefs:{tutorialDone:boolean}|null=null;
const SERVER_PREFS={tutorialDone:true};
function readPrefs(){if(prefs)return prefs;if(typeof window==='undefined')return SERVER_PREFS;
 let done=false;try{done=localStorage.getItem(FISH_TUTORIAL_KEY)==='1';}catch{/* private mode */}
 prefs={tutorialDone:done};return prefs;}
const setPrefs=(patch:Partial<NonNullable<typeof prefs>>)=>{prefs={...readPrefs(),...patch};prefListeners.forEach(f=>f());};
export const fishingPrefs=()=>readPrefs();
export const subscribeFishingPrefs=(fn:()=>void)=>{prefListeners.add(fn);return()=>{prefListeners.delete(fn);};};
export const useFishingPrefs=()=>useSyncExternalStore(subscribeFishingPrefs,readPrefs,()=>SERVER_PREFS);
/** The ghost-hand tutorial runs once per device (the first fishing session); B may offer a replay from the Fishbook. */
export function finishFishingTutorial(){try{localStorage.setItem(FISH_TUTORIAL_KEY,'1');}catch{/* private mode */}setPrefs({tutorialDone:true});}
export function resetFishingTutorial(){try{localStorage.removeItem(FISH_TUTORIAL_KEY);}catch{/* private mode */}setPrefs({tutorialDone:false});}
