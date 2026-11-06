// Island settings → Live matches → Match effects (Nov 5 2026, docs/join-live-game-design.md "Kick effects"): Full (default) or
// Light. Light keeps the information (the thin ball line, the long ball's landing ring, "got it" and tackle rings) and drops the
// ribbon trails, ghost balls and kick flares for older phones. Reduced motion trims further on its own (lib/town/matchEffects.ts).
// A device setting (DEVICE_KEYS in lib/saves/snapshot.ts). One store per page (dev hot reload), like the other live-match toggles.
export type MatchFxLevel='full'|'light';
const KEY='fi2-match-fx-v1';
type Store={level:MatchFxLevel|null;subs:Set<()=>void>};
const store:Store=((globalThis as {__fi2MatchFx?:Store}).__fi2MatchFx??={level:null,subs:new Set()});
export function matchFxLevel():MatchFxLevel{if(store.level===null){store.level='full';try{if(localStorage.getItem(KEY)==='light')store.level='light';}catch{}}return store.level;}
export function setMatchFxLevel(level:MatchFxLevel){store.level=level;try{localStorage.setItem(KEY,level);}catch{}store.subs.forEach(f=>f());}
export function subscribeMatchFx(f:()=>void){store.subs.add(f);return ()=>{store.subs.delete(f);};}
