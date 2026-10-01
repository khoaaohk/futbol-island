import {localPlayDay} from './dailyPlay';
/**
 * Welcome back (G-10, Sep 30 2026). On the first island load of a NEW local day, a returning player sees one small card:
 * a hello, ONE suggested next step (the same target as Paths' Continue, lib/paths/pathContinue.ts) and a note about today's
 * daily bonus. No streaks, no "you missed a day", nothing lost by skipping (the no-guilt rule in docs/daily-play.md and
 * RETENTION-RESEARCH.md). Stored: the last visit's local day only.
 */
export const LAST_VISIT_KEY='fi2-last-visit-day-v1';
/** How long the card stays on screen (user, Oct 1 2026: a note that leaves on its own, no buttons; a tap also hides it). Counted
 *  only while it is visible: covered or blocked, the dwell restarts when it is back. A little longer than a toast's 5.2 s: it has
 *  three lines to read. */
export const WELCOME_BACK_SHOW_MS=6000;
/** Saves from before welcome back (Deploy 11) have no last-visit day. Quest steps/visits or quiz answers mean the player has been
 *  here before, so a missing key is a returning player, not a first-ever visit (bug audit B14). Same strings as
 *  QUEST_STORAGE_KEY (lib/town/questProgress.ts) and QUIZ_STORAGE_KEY (lib/town/quizProgress.ts), kept here so this stays
 *  dependency-free (tests/new-player-flow.cjs checks they match). */
export const WELCOME_PROGRESS_KEYS={quest:'futbol-island-quests-v1',quiz:'futbol-island-quiz-progress-v1'} as const;
const DAY=/^\d{4}-\d{2}-\d{2}$/;
function hasSavedProgress(storage:Pick<Storage,'getItem'>):boolean{
 try{const q=JSON.parse(storage.getItem(WELCOME_PROGRESS_KEYS.quest)??'null');if(q&&typeof q==='object'&&((Array.isArray(q.steps)&&q.steps.length>0)||(Array.isArray(q.visits)&&q.visits.length>0)))return true;}catch{}
 try{const a=JSON.parse(storage.getItem(WELCOME_PROGRESS_KEYS.quiz)??'null');if(Array.isArray(a)&&a.length>0)return true;}catch{}
 return false;
}
/** Decide once per load whether the card is due. Today is recorded right away only when no card is due (same day, or a
 *  first-ever visit, which is onboarding's job). When the card IS due, today is recorded by markWelcomeBackSeen once the card
 *  actually shows, so a day the card stayed blocked (lesson, ceremony, modal) does not count as seen (bug audit B14). */
export function checkWelcomeBack(storage:Pick<Storage,'getItem'|'setItem'>|null,now=Date.now()):boolean{
 if(!storage)return false;const today=localPlayDay(now);let saved:string|null=null;
 try{saved=storage.getItem(LAST_VISIT_KEY);}catch{return false;}
 const valid=!!saved&&DAY.test(saved);
 const due=valid?saved!<today:hasSavedProgress(storage);
 if(!due&&saved!==today)markWelcomeBackSeen(storage,now);
 return due;
}
/** Remember today as seen (call when the card shows). */
export function markWelcomeBackSeen(storage:Pick<Storage,'setItem'>|null,now=Date.now()){if(!storage)return;try{storage.setItem(LAST_VISIT_KEY,localPlayDay(now));}catch{}}
