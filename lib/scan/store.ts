import {isAppLang,type AppLang} from '../i18n/appLangs';
import {cleanSettings,cleanInterval,MODES,type Mode,type Result,type Settings} from './engine';
/**
 * Scan Trainer's saved data (Nov 16 2026; docs/scan-trainer/HANDOFF.md): ONE localStorage record, `fi-scan-v1`, on this device
 * only (lib/saves/snapshot.ts NEVER_KEYS: never in a save code). It holds the coach's settings, the chosen language and, per
 * display mode, the last and the best coach-tap score. No names, nothing sent. Unknown versions are ignored, never half-read.
 */
export const STORE_KEY='fi-scan-v1';
export type Lang=AppLang;
export type ModeResults={last?:Result;best?:Result};
export type Store={v:1;settings:Settings;lang?:Lang;results:Partial<Record<Mode,ModeResults>>};
export const emptyStore=():Store=>({v:1,settings:cleanSettings(null),results:{}});
const int=(v:unknown,max:number)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.min(max,Math.round(v))):null;
export function cleanResult(raw:unknown):Result|undefined{
 if(!raw||typeof raw!=='object')return undefined;const r=raw as Record<string,unknown>;
 const hit=int(r.hit,9999),total=int(r.total,9999),cues=int(r.cues,99999),sec=int(r.sec,86400);
 if(hit==null||total==null||cues==null||sec==null||hit>total)return undefined;
 const at=typeof r.at==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(r.at)?r.at:'';
 return {hit,total,cues,sec,interval:cleanInterval(r.interval),at};
}
export function cleanStore(raw:unknown):Store{
 if(!raw||typeof raw!=='object'||(raw as {v?:unknown}).v!==1)return emptyStore();
 const r=raw as Record<string,unknown>,res=(r.results&&typeof r.results==='object'?r.results:{}) as Record<string,unknown>;
 const results:Store['results']={};
 for(const m of MODES){const x=res[m] as Record<string,unknown>|undefined;if(!x||typeof x!=='object')continue;const last=cleanResult(x.last),best=cleanResult(x.best);if(last||best)results[m]={...(last?{last}:{}),...(best?{best}:{})};}
 return {v:1,settings:cleanSettings(r.settings),...(isAppLang(r.lang)?{lang:r.lang}:{}),results};
}
export function loadStore(storage:Pick<Storage,'getItem'>|null):Store{
 try{const s=storage?.getItem(STORE_KEY);return s?cleanStore(JSON.parse(s)):emptyStore();}catch{return emptyStore();}
}
export function saveStore(storage:Pick<Storage,'setItem'>|null,s:Store):boolean{
 try{storage?.setItem(STORE_KEY,JSON.stringify(s));return !!storage;}catch{return false;}
}
