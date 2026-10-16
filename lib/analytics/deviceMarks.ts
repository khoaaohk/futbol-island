/**
 * Device marks (Oct 15 2026; user: "also if they are a returning user with saved codes or not"; /admin's live sessions). Read ONCE
 * when a session starts (components/VisitTracker.tsx passes this to the tracker) and sent as two yes/no answers, never the values
 * behind them: has this device played here before (a last-visit day, saved quest steps or quiz answers, or a save code exist),
 * and is a save code active on it. The /privacy page (§7) and docs/accounts-design.md §4.6 say so; Do-Not-Track / Global Privacy
 * Control still send nothing at all. readDeviceMarks writes nothing and its marks never carry the last-visit day, the code or a count (the separate player key below, Oct 16 2026, does send the code for one-way hashing). Kept apart from
 * startFlags.ts on purpose (those flags still never carry a returning-visitor signal; tests/admin-analytics-learning.cjs).
 */
import {FLAG_KEYS} from './startFlags';
import {INSTALL_ID_KEY} from '../saves/snapshot';

/** The game's own keys (tests/admin-analytics-live.cjs checks they match the code that writes them). */
export const MARK_KEYS={lastVisit:'fi2-last-visit-day-v1',quest:'futbol-island-quests-v1',quiz:FLAG_KEYS.quiz,code:'fi2-save-code-v1'} as const;
const CODE_RE=/^[a-z]{3,9}-[a-z]{3,9}-[a-z]{3,9}-[1-9]\d{2,3}$/;
const DAY_RE=/^\d{4}-\d{2}-\d{2}$/;

/** Two booleans for a session's start: `returning` (this device has played before) and `hasCode` (a save code is active). */
export function readDeviceMarks(storage:Pick<Storage,'getItem'>|null):{returning:boolean;hasCode:boolean}|null{
 if(!storage)return null;
 const get=(k:string)=>{try{return storage.getItem(k);}catch{return null;}};
 const hasCode=CODE_RE.test(get(MARK_KEYS.code)||'');
 let progress=false;
 try{const q=JSON.parse(get(MARK_KEYS.quest)??'null');progress=!!(q&&typeof q==='object'&&((Array.isArray(q.steps)&&q.steps.length)||(Array.isArray(q.visits)&&q.visits.length)));}catch{}
 try{const a=JSON.parse(get(MARK_KEYS.quiz)??'null');progress=progress||(Array.isArray(a)&&a.length>0);}catch{}
 return {returning:hasCode||progress||DAY_RE.test(get(MARK_KEYS.lastVisit)||''),hasCode};
}

/**
 * Players (Oct 16 2026; user: "i basically want to know by individual level"). The one player key a session's start sends: the
 * save code when one is active (the server turns it into a keyed one-way id, as the save store does, and drops it), else this
 * device's install id: 16 random bytes made once and kept in fi2-install-v1 (a DEVICE key: never synced; deleting the save
 * removes it). Not a name, account, network address or location. `random(16)` is crypto.getRandomValues in the browser.
 */
export function readPlayerKey(storage:Pick<Storage,'getItem'|'setItem'>|null,random:(n:number)=>Uint8Array):{pc:string}|{pi:string}|null{
 if(!storage)return null;
 const get=(k:string)=>{try{return storage.getItem(k);}catch{return null;}};
 const code=get(MARK_KEYS.code)||'';
 if(CODE_RE.test(code))return {pc:code};
 let id=get(INSTALL_ID_KEY)||'';
 if(!/^[0-9a-f]{32}$/.test(id)){
  id=[...random(16)].map(b=>b.toString(16).padStart(2,'0')).join('');
  if(!/^[0-9a-f]{32}$/.test(id))return null;
  try{storage.setItem(INSTALL_ID_KEY,id);}catch{return null;}
 }
 return {pi:id};
}
