import {sanitizePlay,uid} from './play';
import {MAX_NAME,type Play} from './types';

/**
 * The coach's plays library in localStorage, one versioned key. It is on the save-code allowlist (lib/saves/snapshot.ts,
 * docs/accounts-design.md table A), so plays travel with the player's save code. The only free text is a play's name
 * (32 characters) and 3-character chip labels; the size is capped well under the save's 256 KB per-key limit.
 *
 * Shape: {v:1, plays:[Play…], draft:Play|null, open:string|null}. `draft` is the board the coach is working on when it is
 * not (yet) a saved play; `open` is the saved play on the board, so reopening the centre lands where the coach left off.
 */
export const PLAYS_KEY='fi2-coach-plays-v1';
export const LIBRARY_VERSION=1;
export const MAX_PLAYS=40,MAX_LIBRARY_BYTES=180*1024;
export type Library={v:typeof LIBRARY_VERSION;plays:Play[];draft:Play|null;open:string|null};
export const emptyLibrary=():Library=>({v:LIBRARY_VERSION,plays:[],draft:null,open:null});
type Store=Pick<Storage,'getItem'|'setItem'>;
const store=():Store|null=>{try{return typeof localStorage==='undefined'?null:localStorage;}catch{return null;}};

export function sanitizeLibrary(raw:unknown):Library{
 if(!raw||typeof raw!=='object')return emptyLibrary();const o=raw as Record<string,unknown>;
 if(o.v!==LIBRARY_VERSION)return emptyLibrary();
 const seen=new Set<string>(),plays:Play[]=[];
 for(const p of Array.isArray(o.plays)?o.plays:[]){const s=sanitizePlay(p);if(s&&!seen.has(s.id)&&plays.length<MAX_PLAYS){seen.add(s.id);plays.push(s);}}
 const draft=sanitizePlay(o.draft);const open=typeof o.open==='string'&&seen.has(o.open)?o.open:null;
 return {v:LIBRARY_VERSION,plays,draft,open};
}
export function loadLibrary(s:Store|null=store()):Library{
 try{const raw=s?.getItem(PLAYS_KEY);return raw?sanitizeLibrary(JSON.parse(raw)):emptyLibrary();}catch{return emptyLibrary();}
}
/** Writes the library. Returns false when it would not fit (too big, or storage is full/blocked). */
export function saveLibrary(lib:Library,s:Store|null=store()):boolean{
 if(!s)return false;const json=JSON.stringify(lib);if(json.length>MAX_LIBRARY_BYTES)return false;
 try{s.setItem(PLAYS_KEY,json);return true;}catch{return false;}
}
const cleanName=(n:string)=>n.replace(/[\u0000-\u001f]/g,' ').trim().slice(0,MAX_NAME)||'My play';
/** Adds or replaces a play (newest first). */
export function upsertPlay(lib:Library,play:Play):Library{
 const p={...play,name:cleanName(play.name)},rest=lib.plays.filter(x=>x.id!==p.id);
 return {...lib,plays:[p,...rest].slice(0,MAX_PLAYS)};
}
export function deletePlay(lib:Library,id:string):Library{return {...lib,plays:lib.plays.filter(p=>p.id!==id),open:lib.open===id?null:lib.open};}
/** A copy with a new id and "(copy)" on the name, placed first. */
export function duplicatePlay(lib:Library,id:string,now=Date.now()):{lib:Library;copy:Play|null}{
 const p=lib.plays.find(x=>x.id===id);if(!p)return {lib,copy:null};
 const copy:Play={...p,id:uid('p'),name:cleanName(`${p.name.slice(0,MAX_NAME-7)} (copy)`),created:now,updated:now};
 return {lib:upsertPlay(lib,copy),copy};
}
export const renamePlay=(lib:Library,id:string,name:string):Library=>({...lib,plays:lib.plays.map(p=>p.id===id?{...p,name:cleanName(name),updated:Date.now()}:p)});
/** A fresh copy of any play (an example, a shared link) ready to save as the coach's own. */
export const copyOf=(p:Play,now=Date.now()):Play=>({...JSON.parse(JSON.stringify(p)),id:uid('p'),created:now,updated:now});
