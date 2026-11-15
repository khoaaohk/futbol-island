/**
 * The sea's condition (Nov 14 2026, docs/fishing.md "Come back tomorrow"): one of six for each 3-hour block of the LOCAL day,
 * deterministic from the date and hour. It nudges which families bite (fishingOdds.ts catchWeights: a family mix inside each
 * rarity, value-guarded with the lure; rarity shares never move) and tints the water a little (waterMood.ts). Pure, tiny, and it
 * imports nothing from the return hooks, so the odds stay independent of them (tests/fishing-hooks.cjs).
 */
import type {FishSpecies} from './fishCatalog';
import {dayKey,hash01} from './timeOfDay';

const DAY=/^\d{4}-\d{2}-\d{2}$/;
type When=Date|number|string;
const toDate=(when:When)=>when instanceof Date?when:typeof when==='number'?new Date(when):new Date(`${DAY.test(when)?when:dayKey(Date.now())}T12:00:00`);
export type ConditionId='calm'|'breeze'|'mist'|'high-tide'|'low-tide'|'drizzle';
export type Condition={id:ConditionId;name:string;
 /** One plain line for the HUD and the Fishbook. Words only, never odds. */
 line:string;
 /** The families that come closer (inside each rarity only). */
 favors:(f:FishSpecies)=>boolean;
 /** A light water hint (scales the existing water uniforms once a session: waterMood.ts). */
 mood:{clear:number;tint:[number,number,number]}};
export const CONDITIONS:readonly Condition[]=[
 {id:'calm',name:'Calm water',line:'Calm water: seahorses, rays and shellfish come in close.',favors:f=>f.group==='seahorse'||f.group==='ray'||f.group==='shellfish',mood:{clear:1.06,tint:[1,1,1]}},
 {id:'breeze',name:'Fresh breeze',line:'A fresh breeze: fast, slim swimmers are about.',favors:f=>f.shape==='slim'||f.shape==='long'||f.shape==='billfish',mood:{clear:1,tint:[.98,1,1.02]}},
 {id:'mist',name:'Sea mist',line:'Sea mist: eels, squid and octopuses creep out.',favors:f=>f.group==='eel'||f.group==='squid'||f.group==='octopus',mood:{clear:.86,tint:[.94,.96,.98]}},
 {id:'high-tide',name:'High tide',line:'High tide: big round fish swim up to the posts.',favors:f=>f.shape==='round'||f.shape==='angler'||f.shape==='mola',mood:{clear:.97,tint:[.97,.99,1.03]}},
 {id:'low-tide',name:'Low tide',line:'Low tide: crabs and lobsters wander over the rocks.',favors:f=>f.group==='crab'||f.group==='lobster',mood:{clear:1.03,tint:[1.03,1.01,.97]}},
 {id:'drizzle',name:'Soft rain',line:'Soft rain: little fish jump for the raindrops.',favors:f=>f.shadow==='small'&&f.group==='fish',mood:{clear:.92,tint:[.95,.97,1]}},
];
export const conditionById=(id:string|undefined)=>CONDITIONS.find(c=>c.id===id);
export const CONDITION_HOURS=3;
/** How strongly a condition pulls its families (before the shared value guard, fishingOdds.ts FAMILY_EV_GUARD). */
export const CONDITION_BOOST=1.8;
const rawCondition=(day:string,block:number)=>Math.floor(hash01(`cond|${day}|${block}`)*CONDITIONS.length)%CONDITIONS.length;
/** The condition for a local day and hour (0..23). Never the same as the raw pick of the block before (a change every 3 hours). */
export function conditionFor(day:string,hour:number):Condition{
 const b=Math.max(0,Math.min(23,Math.floor(hour)))/CONDITION_HOURS|0;let i=rawCondition(day,b);
 if(i===rawCondition(day,b-1))i=(i+1)%CONDITIONS.length;return CONDITIONS[i];
}
export function conditionAt(when:When=Date.now()):Condition{
 const d=toDate(when);
 return conditionFor(dayKey(d.getTime()),d.getHours());
}

