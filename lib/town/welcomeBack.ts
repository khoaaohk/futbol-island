import {localPlayDay} from './dailyPlay';
/**
 * Welcome back (G-10, Sep 30 2026). On the first island load of a NEW local day, a returning player sees one small card:
 * a hello, ONE suggested next step (the same target as Paths' Continue, lib/paths/pathContinue.ts) and a note about today's
 * daily bonus. No streaks, no "you missed a day", nothing lost by skipping (the no-guilt rule in docs/daily-play.md and
 * RETENTION-RESEARCH.md). Stored: the last visit's local day only.
 */
export const LAST_VISIT_KEY='fi2-last-visit-day-v1';
/** Decide once per load, and remember today. A first-ever visit (no saved day) is onboarding's job, so it shows nothing. */
export function checkWelcomeBack(storage:Pick<Storage,'getItem'|'setItem'>|null,now=Date.now()):boolean{
 if(!storage)return false;const today=localPlayDay(now);let saved:string|null=null;
 try{saved=storage.getItem(LAST_VISIT_KEY);}catch{return false;}
 try{if(saved!==today)storage.setItem(LAST_VISIT_KEY,today);}catch{}
 return !!saved&&/^\d{4}-\d{2}-\d{2}$/.test(saved)&&saved<today;
}
