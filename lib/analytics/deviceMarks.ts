/**
 * Device marks (Oct 15 2026; user: "also if they are a returning user with saved codes or not"; /admin's live sessions). Read ONCE
 * when a session starts (components/VisitTracker.tsx passes this to the tracker) and sent as two yes/no answers, never the values
 * behind them: has this device played here before (a last-visit day, saved quest steps or quiz answers, or a save code exist),
 * and is a save code active on it. The /privacy page (§7) and docs/accounts-design.md §4.6 say so; Do-Not-Track / Global Privacy
 * Control still send nothing at all. Nothing is written. Not sent: the last-visit day itself, the code, any count. Kept apart from
 * startFlags.ts on purpose (those flags still never carry a returning-visitor signal; tests/admin-analytics-learning.cjs).
 */
import {FLAG_KEYS} from './startFlags';

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
