// Island settings → Live matches → 11v11 for grown-ups (Nov 7 2026): the 11v11 live match's balance, `kid` (default: the Tier 2
// kid-friendly balance) or `adult` (the honest tuning: the original HUMAN_DEFENCE 11v11 row, no HUMAN_SIDE boosts;
// lib/town/match/humanDefence.ts). A device setting (DEVICE_KEYS in lib/saves/snapshot.ts), read by fieldRuntime.joinMatch on the
// device that runs the match's sim (the owner) when the first human joins: friends' screens are puppets that never step, so a
// shared match always plays the owner's mode. One store per page (dev hot reload), like the other live-match toggles.
import type { ElevenMode } from "./humanDefence";
const KEY='fi2-match-11-mode-v1';
type Store={mode:ElevenMode|null;subs:Set<()=>void>};
const store:Store=((globalThis as {__fi2Match11Mode?:Store}).__fi2Match11Mode??={mode:null,subs:new Set()});
export function elevenMode():ElevenMode{if(store.mode===null){store.mode='kid';try{if(localStorage.getItem(KEY)==='adult')store.mode='adult';}catch{}}return store.mode;}
export function setElevenMode(mode:ElevenMode){store.mode=mode;try{localStorage.setItem(KEY,mode);}catch{}store.subs.forEach(f=>f());}
export function subscribeElevenMode(f:()=>void){store.subs.add(f);return ()=>{store.subs.delete(f);};}
