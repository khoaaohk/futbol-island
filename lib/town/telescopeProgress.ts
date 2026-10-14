/**
 * The telescope hunt's saved progress in the browser (fi2-telescope-v1, synced with the save code) and a subscribable view of it
 * for the map marks (components/TelescopeGlintMarks.tsx). Read once, written only when a glint is spotted or collected or a
 * landmark is first named. Rules: lib/town/telescope.ts.
 */
import {useSyncExternalStore} from 'react';
import {TELESCOPE_SAVE_KEY,emptyTelescopeSave,sanitizeTelescope,type TelescopeSave} from './telescope';

let state:TelescopeSave|null=null;const listeners=new Set<()=>void>();const SERVER=emptyTelescopeSave();
export function readTelescope():TelescopeSave{
 if(state)return state;
 if(typeof window==='undefined')return SERVER;
 try{state=sanitizeTelescope(JSON.parse(localStorage.getItem(TELESCOPE_SAVE_KEY)??'null'));}catch{state=emptyTelescopeSave();}
 return state;
}
export function writeTelescope(next:TelescopeSave){
 if(next===state)return;state=next;
 try{localStorage.setItem(TELESCOPE_SAVE_KEY,JSON.stringify(next));}catch{/* private mode: this visit only */}
 listeners.forEach(fn=>fn());
}
const storage=(e:StorageEvent)=>{if(e.key===TELESCOPE_SAVE_KEY||e.key===null){state=null;listeners.forEach(fn=>fn());}};
export function subscribeTelescope(fn:()=>void){listeners.add(fn);if(listeners.size===1)window.addEventListener('storage',storage);return()=>{listeners.delete(fn);if(!listeners.size)window.removeEventListener('storage',storage);};}
export const useTelescope=()=>useSyncExternalStore(subscribeTelescope,readTelescope,()=>SERVER);
