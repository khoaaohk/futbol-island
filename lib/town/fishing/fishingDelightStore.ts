'use client';
/**
 * Browser binding for the fishing delight pass (fishingDelight.ts, docs/fishing.md "Delight pass"). Event-driven only: ONE listener
 * on the fishing event API (no per-frame work, no polling), one-shot document cues for the island sound kit (which already applies
 * the Sound effects switch, the volume, the idle fade and its own rate limits; this file also sends nothing when sound is off), a
 * window event the island uses for the islanders' cheer, and the secrets save (fi2-fishing-secrets-v1, synced, two booleans).
 * Never touches the odds, the basket or a price.
 */
import {useSyncExternalStore} from 'react';
import {AMBIENT,CELEBRATION,FISHING_SECRETS_KEY,animalCue,animalCueDetail,celebrationTier,emptySecrets,glintCaught,mergeSecrets,rollBottle,sanitizeSecrets,shouldCheer,type DelightTier,type SecretsSave} from './fishingDelight';
import {fishingSession} from './fishingStore';
import {fishById} from './fishCatalog';
import {isLegendId} from './legendary';
import {lastHookEffects} from './fishingHooksStore';

/** The island asks for a cheer from a nearby islander (components/Town.tsx listens; detail {tier}). */
export const FISHING_CHEER_EVENT='fi2-fishing-cheer';
/** The world's golden glint just appeared on the water (fishingVisuals dispatches it; detail: none). */
export const FISHING_GLINT_EVENT='fi2-fishing-glint';

const soundOn=()=>{try{return localStorage.getItem('fi2-sound-muted')!=='true';}catch{return true;}};
export function playFishCue(detail:string){if(typeof document==='undefined'||!soundOn())return;try{document.dispatchEvent(new CustomEvent('fi2-job-cue',{detail}));}catch{/* sound only */}}

// ---- Session-only marks for the Fishbook (no save: they only say "this happened since you last looked") ----
const fresh=new Set<string>(),freshSets=new Set<string>();
let rev=0;const subs=new Set<()=>void>();const emit=()=>{rev++;subs.forEach(f=>f());};
export const subscribeDelight=(f:()=>void)=>{subs.add(f);return()=>{subs.delete(f);};};
export const useDelightRev=()=>useSyncExternalStore(subscribeDelight,()=>rev,()=>0);
/** Species first caught since the Fishbook last showed them (their card gets the NEW stamp thump once). */
export const freshSpecies=():ReadonlySet<string>=>fresh;
/** Sets completed since the Sets page last showed them (their card celebrates once). */
export const freshSetIds=():ReadonlySet<string>=>freshSets;
export function clearFresh(){if(!fresh.size&&!freshSets.size)return;fresh.clear();freshSets.clear();emit();}

// ---- The last catch's celebration (the catch card reads it) ----
export type LastDelight={id:string;size:number;tier:DelightTier;secret:'bottle'|'glint'|null;sets:number};
let last:LastDelight|null=null;
export const lastDelight=()=>last;

// ---- Secrets save ----
const readSaved=():SecretsSave=>{try{return sanitizeSecrets(JSON.parse(localStorage.getItem(FISHING_SECRETS_KEY)??'null'));}catch{return emptySecrets();}};
export function readSecrets():SecretsSave{return typeof window==='undefined'?emptySecrets():readSaved();}
function findSecret(kind:'bottle'|'glint'){const next=mergeSecrets(readSaved(),{...emptySecrets(),[kind]:true});try{localStorage.setItem(FISHING_SECRETS_KEY,JSON.stringify(next));}catch{/* kept for this visit only */}emit();}

let glintAt=0,pendingSecret:'glint'|null=null;
/** fishingVisuals: the golden glint appeared (cosmetic). */
export function noteGlint(now=Date.now()){glintAt=now;}

export function handleDelightEvent(e:{type:string;fish:string|null;size:number|null;isNew?:boolean;at:number},rand=Math.random){
 if(e.type==='cast'){if(glintCaught(readSecrets(),glintAt,e.at)){pendingSecret='glint';findSecret('glint');}glintAt=0;return;}
 if(e.type==='hook'){const f=e.fish?fishById(e.fish):undefined;if(f?.group==='shark')playFishCue('sting');return;}
 if(e.type!=='catch'||!e.fish||typeof e.size!=='number')return;
 const f=fishById(e.fish);if(!f)return;
 const legend=isLegendId(e.fish),hook=lastHookEffects(),mine=hook&&hook.id===e.fish&&hook.size===e.size?hook:null;
 const golden=!!mine?.effects.golden,tier=celebrationTier(f.rarity,{golden,legend});
 let secret:LastDelight['secret']=pendingSecret;pendingSecret=null;
 if(!secret&&rollBottle(readSecrets(),rand())){secret='bottle';findSecret('bottle');}
 if(e.isNew)fresh.add(e.fish);for(const s of mine?.sets??[])freshSets.add(s.id);
 last={id:e.fish,size:e.size,tier,secret,sets:mine?.sets.length??0};emit();
 playFishCue(CELEBRATION[tier].cue);
 const a=animalCue(f);if(a&&a!=='sting')playFishCue(animalCueDetail(a));
 if(mine?.sets.length)playFishCue('fish-set');
 if(shouldCheer({rarity:f.rarity,shadow:f.shadow,golden,legend})&&typeof window!=='undefined')try{window.dispatchEvent(new CustomEvent(FISHING_CHEER_EVENT,{detail:{tier}}));}catch{/* cosmetic */}
}

// ---- Wiring: one listener for the page, kept across hot updates. The hooks store's listener is registered when its module loads
// (imported above, so before this one): the golden flag and completed sets are already known when this runs. ----
type Hot={off?:()=>void};
const hot:Hot=typeof globalThis==='undefined'?{}:((globalThis as {__fi2FishingDelight?:Hot}).__fi2FishingDelight??={});
if(typeof window!=='undefined'){
 hot.off?.();
 const offEvents=fishingSession.onFishingEvent(e=>handleDelightEvent(e)),glint=()=>noteGlint();
 window.addEventListener(FISHING_GLINT_EVENT,glint);
 hot.off=()=>{offEvents();window.removeEventListener(FISHING_GLINT_EVENT,glint);};
}
export {AMBIENT};
