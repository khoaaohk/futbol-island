import {useSyncExternalStore} from 'react';
import {sanitizeGraduations,emptyGraduations,type GraduationRecord} from './graduationModel';

/**
 * Browser wiring for the graduation record (pure model: graduationModel.ts). One small localStorage key; subscriptions only
 * (a window event for this tab, `storage` for other tabs), no polling. Kept free of the lesson/path imports so the saved-look
 * sanitiser (customization.ts) can read it without pulling the curriculum in.
 */
export const GRADUATION_KEY='fi2-graduations-v1';
export const GRADUATIONS_CHANGED='fi2-graduations-changed';
function storage():Storage|null{try{return typeof localStorage==='undefined'?null:localStorage;}catch{return null;}}
let memory:string|null=null;
const raw=()=>{const s=storage();try{return s?s.getItem(GRADUATION_KEY)??memory:memory;}catch{return memory;}};
export function readGraduations():GraduationRecord{try{return sanitizeGraduations(JSON.parse(raw()??'null'));}catch{return emptyGraduations();}}
export function writeGraduations(record:GraduationRecord){
 const value=JSON.stringify(record);memory=value;try{storage()?.setItem(GRADUATION_KEY,value);}catch{/* this visit still knows */}
 if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent(GRADUATIONS_CHANGED));
}
/** Read-modify-write against the freshest saved value (another tab may have added one). No-op when nothing changes. */
export function updateGraduations(change:(record:GraduationRecord)=>GraduationRecord):GraduationRecord{
 const before=readGraduations(),after=change(before);if(after!==before)writeGraduations(after);return after;
}
function subscribe(fn:()=>void){
 if(typeof window==='undefined')return()=>{};
 const onStorage=(e:StorageEvent)=>{if(e.key===null||e.key===GRADUATION_KEY)fn();};
 window.addEventListener(GRADUATIONS_CHANGED,fn);window.addEventListener('storage',onStorage);
 return()=>{window.removeEventListener(GRADUATIONS_CHANGED,fn);window.removeEventListener('storage',onStorage);};
}
const EMPTY=JSON.stringify(emptyGraduations());
/** Live record (raw-string snapshot, so it only re-renders when the saved value changes). */
export function useGraduations():GraduationRecord{
 const value=useSyncExternalStore(subscribe,()=>raw()??EMPTY,()=>EMPTY);
 return parseCached(value);
}
let cacheKey='',cacheValue=emptyGraduations();
function parseCached(value:string){if(value!==cacheKey){cacheKey=value;try{cacheValue=sanitizeGraduations(JSON.parse(value));}catch{cacheValue=emptyGraduations();}}return cacheValue;}

/** Window event other surfaces use to open endgame places without importing Town: Paths (optionally on a format), the Ferry,
 *  the Museum, the Coaches Centre, or a certificate viewer. Town and GraduationHost listen. */
export const ENDGAME_OPEN='fi2-endgame-open';
export type EndgameOpen={target:'paths';format?:string}|{target:'ferry'}|{target:'museum'}|{target:'coaches'}|{target:'certificate';id:string};
export function openEndgame(detail:EndgameOpen){if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent(ENDGAME_OPEN,{detail}));}
