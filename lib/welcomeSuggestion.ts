/**
 * The in-island "Welcome back!" note's "for you" suggestion (Nov 14 2026, docs/fishing.md "Reach and fixes"): ONE extra line in
 * the note (components/WelcomeBack.tsx). The note stays a note, not a menu (owner, Oct 1 2026: no buttons): with a suggestion the
 * whole note is the tap target ("Tap here to go fishing!"). Decided on this device from the local save only, never sent anywhere.
 * Fishing is the first and only kind for now; later kinds (the next Paths lesson, the daily arcade puzzle, the Kit Shop) add a
 * case to `pickWelcomeSuggestion` and an action in WelcomeBack.tsx. Free of the game's catalogues (pure, tests).
 */
export type WelcomeSuggestionKind='fishing';
export type WelcomeSuggestion={kind:WelcomeSuggestionKind;line:string;action:'go-fishing'};
/** What the suggestion reads from the local save. */
export type WelcomeSave={fishbookSpecies:number};
/** Below this many Fishbook species, the card suggests fishing (most players never find it: 6 of 100 on day 1). */
export const FISHING_SUGGEST_BELOW=5;

/** The one suggestion for this save, or null. Pure (tests). */
export function pickWelcomeSuggestion(save:WelcomeSave|null):WelcomeSuggestion|null{
 if(!save)return null;
 if(save.fishbookSpecies<FISHING_SUGGEST_BELOW)return {kind:'fishing',line:'Fish are biting today. Tap here to go fishing!',action:'go-fishing'};
 return null;
}
/** Read the local save (the Fishbook's species count). Never throws. */
export function readWelcomeSave():WelcomeSave|null{
 try{const b=JSON.parse(localStorage.getItem('fi2-fishbook-v1')??'null') as {species?:Record<string,unknown>}|null;
  return {fishbookSpecies:b&&b.species&&typeof b.species==='object'?Object.keys(b.species).length:0};}catch{return null;}
}
