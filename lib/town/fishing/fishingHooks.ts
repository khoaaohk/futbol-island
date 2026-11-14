/**
 * Fishing return hooks (Nov 7 2026, docs/fishing.md "Return hooks"): reasons to come back and "catch them all", all cosmetic or
 * stamp-only. Owner rules: no leaderboards, nothing expires, no penalties or streaks, prices never move, the odds never move
 * (tests/economy.cjs §12 and tests/fishing-hooks.cjs: no hook touches catchWeights, the basket or a sell value).
 *  1. Sets: 14 Fishbook sets (6 spot sets, 3 area sets, 5 themed sets). Completing one gives a Fishbook stamp, and five of them
 *     also give a float skin (fishingLog.ts FLOAT_SKINS). Progress reads "N of M" from the Fishbook itself.
 *  2. Today's visitor: one featured species per area, the same for everyone on a Pacific day (date-seeded, hash01). Catching it
 *     stamps a "Visitor" mark on its Fishbook entry, once per species and day. It changes no odds: the banner only says where (and,
 *     for a night or sunset fish, when) to look.
 *  3. Golden variants: any Fishbook species can, very rarely (GOLDEN_CHANCE), come out golden. Stamp-only: the same fish, the same
 *     price, the same basket; a "Golden" mark in the Fishbook and a short celebratory card.
 *  4. Story chapters on repeat catches (./fishChapters.ts).
 * Pure (no storage, no React): fishingHooksStore.ts is the browser binding. The save is one small synced key, FISHING_HOOKS_KEY
 * (lib/saves/snapshot.ts SYNC_KEYS); every map is keyed by a catalogue id, so it can never grow past the catalogue (a few KB).
 */
import {FISH,isDeepSeaSpecial,isExclusive,spotById,type FishSpecies,type SpotId} from './fishCatalog';
import {LEGEND_FISH,LEGEND_INFO,isLegendId} from './legendary';
import {hash01} from './timeOfDay';
import {LEGEND_CHAPTERS,LEGEND_CHAPTER_AT,SPECIES_CHAPTERS,SPECIES_CHAPTER_AT} from './fishChapters';
import type {FloatSkin} from './fishingLog';

export const FISHING_HOOKS_KEY='fi2-fishing-hooks-v1';

// ---- 1. Sets ----
export type FishSet={id:string;kind:'spot'|'area'|'theme';title:string;blurb:string;stamp:string;float?:FloatSkin;species:readonly string[]};
const own=(spots:readonly string[])=>FISH.filter(f=>isExclusive(f)&&spots.includes(f.spots[0])).map(f=>f.id);
const spotSet=(id:SpotId):FishSet=>{const name=spotById(id)?.name??id;return {id:`spot-${id}`,kind:'spot',title:`${name} specials`,blurb:`Every animal that lives only at ${name}. A full squad for one ground.`,stamp:`${name} stamp`,species:own([id])};};
export const FISH_SETS:readonly FishSet[]=[
 spotSet('south-pier'),spotSet('west-pier'),spotSet('harbour-wall'),spotSet('north-rocks'),spotSet('west-cove'),spotSet('east-pier'),
 {id:'area-causeway',kind:'area',title:'Causeway posts',blurb:'The specials of Seawall Gate Sands, Channel Bend and Turtle Bank.',stamp:'Causeway stamp',species:own(['causeway-gate','causeway-channel','turtle-bank'])},
 {id:'area-cay',kind:'area',title:'Coral Cay beaches',blurb:'The specials of Coral Garden Beach, Sharks Beach Point and Farm Beach.',stamp:'Coral Cay stamp',float:'coral',species:own(['coral-garden','sharks-beach','farm-beach'])},
 {id:'area-summit',kind:'area',title:'Summit Isle shore',blurb:'The specials of Boulder Cove, Palm Point, Lookout Rocks and Drop-off Ledge.',stamp:'Summit Isle stamp',species:own(['summit-cove','summit-palm','summit-lookout','summit-ledge'])},
 // Nov 13 2026: the north-west coast round the DRIP FC Stadium.
 {id:'area-northwest',kind:'area',title:'Stadium coast',blurb:'The specials of North Point, Stadium Rocks and Sunset Shoals, round the DRIP FC Stadium.',stamp:'Stadium coast stamp',species:own(['north-point','stadium-rocks','sunset-shoals'])},
 {id:'theme-shared',kind:'theme',title:'The shared ten',blurb:'The ten animals you can meet at lots of spots. A good first team.',stamp:'First team stamp',species:FISH.filter(f=>!f.when&&!isExclusive(f)&&!isDeepSeaSpecial(f)).map(f=>f.id)},
 {id:'theme-deep',kind:'theme',title:'Deep sea specials',blurb:'Everything that only bites out on the deep-sea boats.',stamp:'Deep sea stamp',float:'abyss',species:FISH.filter(isDeepSeaSpecial).map(f=>f.id)},
 {id:'theme-night',kind:'theme',title:'Night and sunset fish',blurb:'Animals that only come out at sunset or at night. Switch the island time to meet them.',stamp:'Night owl stamp',float:'moon',species:FISH.filter(f=>!!f.when).map(f=>f.id)},
 {id:'theme-sharks',kind:'theme',title:'Every shark',blurb:'Every shark in the Fishbook. Sharks pull hard: a long hunt.',stamp:'Shark spotter stamp',float:'fin',species:FISH.filter(f=>f.group==='shark').map(f=>f.id)},
 {id:'theme-claws',kind:'theme',title:'Crabs and lobsters',blurb:'Every crab and lobster: walk sideways, defend the box.',stamp:'Claws stamp',float:'shell',species:FISH.filter(f=>f.group==='crab'||f.group==='lobster').map(f=>f.id)},
];
const SET_IDS=new Set(FISH_SETS.map(s=>s.id));
export const setById=(id:string)=>FISH_SETS.find(s=>s.id===id);
type BookLike={species:Partial<Record<string,{count:number}|undefined>>};
/** "N of M" for one set, from the Fishbook. */
export const setProgress=(set:FishSet,book:BookLike)=>({got:set.species.filter(id=>(book.species[id]?.count??0)>0).length,total:set.species.length});
export const setComplete=(set:FishSet,book:BookLike)=>{const p=setProgress(set,book);return p.total>0&&p.got>=p.total;};
/** The floats a save's completed sets have earned. */
export const setFloats=(sets:readonly string[])=>FISH_SETS.filter(s=>s.float&&sets.includes(s.id)).map(s=>s.float!);

// ---- 2. Today's visitor (Pacific day, the same for everyone) ----
export type VisitorArea={id:'main'|'cay'|'summit'|'deep';name:string;spots:readonly SpotId[]};
export const VISITOR_AREAS:readonly VisitorArea[]=[
 {id:'main',name:'Main island',spots:['south-pier','west-pier','harbour-wall','north-rocks','west-cove','east-pier','park-pond','north-point','stadium-rocks','sunset-shoals']},
 {id:'cay',name:'Causeway and Coral Cay',spots:['causeway-gate','causeway-channel','turtle-bank','coral-garden','sharks-beach','farm-beach']},
 {id:'summit',name:'Summit Isle',spots:['summit-cove','summit-palm','summit-lookout','summit-ledge']},
 {id:'deep',name:'Deep-sea boats',spots:['deep-sea-boat','deep-sea-boat-west']},
];
export const areaForSpot=(spot:string)=>VISITOR_AREAS.find(a=>(a.spots as readonly string[]).includes(spot));
/** A visitor is one of the area's own animals, never a legendary-rarity one (a gentle goal, not a wall). */
const POOLS:Record<VisitorArea['id'],FishSpecies[]>=Object.fromEntries(VISITOR_AREAS.map(a=>[a.id,FISH.filter(f=>f.rarity!=='legendary'&&(a.id==='deep'?isDeepSeaSpecial(f):isExclusive(f)&&(a.spots as readonly string[]).includes(f.spots[0])))])) as Record<VisitorArea['id'],FishSpecies[]>;
export const visitorPool=(area:VisitorArea['id'])=>POOLS[area];
let PT:Intl.DateTimeFormat|null=null;
/** The Pacific day (YYYY-MM-DD, America/Los_Angeles), so every player shares the same visitors at the same moment. */
export function pacificDay(now:number):string{
 try{PT??=new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'});
  const p=Object.fromEntries(PT.formatToParts(new Date(now)).map(x=>[x.type,x.value]));if(p.year&&p.month&&p.day)return `${p.year}-${p.month}-${p.day}`;}catch{/* no Intl time zones */}
 return new Date(now-8*3600e3).toISOString().slice(0,10);
}
/** Today's visitor for an area (deterministic: the day and the area only). */
export function visitorFor(area:VisitorArea['id'],day:string):FishSpecies|undefined{const pool=POOLS[area];if(!pool?.length)return undefined;return pool[Math.min(pool.length-1,Math.floor(hash01(`visitor|${area}|${day}`)*pool.length))];}
export const visitorsFor=(day:string)=>VISITOR_AREAS.map(a=>({area:a,fish:visitorFor(a.id,day)})).filter((v):v is {area:VisitorArea;fish:FishSpecies}=>!!v.fish);
/** Where to look: the spot's name (and the time, for a night or sunset fish). Words only, never odds. */
export function visitorHint(f:FishSpecies):string{
 const where=isDeepSeaSpecial(f)?'out on the deep-sea boats':`at ${spotById(f.spots[0])?.name??'its spot'}`;
 return f.when?`Look ${where}, at ${f.when==='night'?'night':'sunset'}.`:`Look ${where}.`;
}

// ---- 3. Golden variants ----
/** About one Fishbook catch in 150 comes out golden. Cosmetic only: nothing else about the catch changes. */
export const GOLDEN_CHANCE=1/150;
export const rollGolden=(rand:number)=>Number.isFinite(rand)&&rand>=0&&rand<GOLDEN_CHANCE;

// ---- 4. Story chapters ----
/** The chapters a species has unlocked at `count` catches: its fish tale first, then chapters 2 and 3. */
export function speciesChapters(f:Pick<FishSpecies,'id'|'story'>,count:number):{unlocked:string[];total:number;next:number|null}{
 const all=[f.story??'',...(SPECIES_CHAPTERS[f.id]??[])].filter(Boolean),at=SPECIES_CHAPTER_AT.slice(0,all.length);
 const n=at.filter(c=>count>=c).length;return {unlocked:all.slice(0,n),total:all.length,next:n<all.length?at[n]:null};
}
/** A legend's chapters: its island story at the release, then 5 and 15 more catches at its spot. */
export function legendChapters(id:string,released:boolean,seen:number):{unlocked:string[];total:number;next:number|null}{
 const info=LEGEND_INFO[id];if(!info)return {unlocked:[],total:0,next:null};
 const all=[info.story,...(LEGEND_CHAPTERS[id]??[])];if(!released)return {unlocked:[],total:all.length,next:null};
 const n=LEGEND_CHAPTER_AT.slice(0,all.length).filter(c=>seen>=c).length;return {unlocked:all.slice(0,n),total:all.length,next:n<all.length?LEGEND_CHAPTER_AT[n]:null};
}

// ---- The save ----
export type HooksSave={version:1;
 /** Sets completed and claimed (stamp shown, float granted). */
 sets:string[];
 /** Visitor marks: species → how many days it was caught as the visitor, and the last such Pacific day. */
 visits:Record<string,{n:number;day:string}>;
 /** Golden catches per species (stamp-only). */
 golden:Record<string,number>;
 /** Catches at a released legend's spot since its release (its "seen again" chapters). */
 legendSeen:Record<string,number>};
export const emptyHooks=():HooksSave=>({version:1,sets:[],visits:{},golden:{},legendSeen:{}});
const whole=(v:unknown,max:number)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.min(max,Math.floor(v))):0;
const BOOK=new Set(FISH.map(f=>f.id));
const DAY=/^\d{4}-\d{2}-\d{2}$/;
export const LEGEND_SEEN_MAX=99;
export function sanitizeHooks(value:unknown):HooksSave{
 const v=value&&typeof value==='object'?value as Partial<HooksSave>:{},out=emptyHooks();
 out.sets=Array.isArray(v.sets)?[...new Set(v.sets.filter((s):s is string=>typeof s==='string'&&SET_IDS.has(s)))]:[];
 if(v.visits&&typeof v.visits==='object')for(const [id,e] of Object.entries(v.visits))if(BOOK.has(id)&&e&&typeof e==='object'){const n=whole((e as {n:unknown}).n,1e5),day=(e as {day:unknown}).day;if(n>0&&typeof day==='string'&&DAY.test(day))out.visits[id]={n,day};}
 if(v.golden&&typeof v.golden==='object')for(const [id,n] of Object.entries(v.golden))if(BOOK.has(id)){const c=whole(n,1e5);if(c>0)out.golden[id]=c;}
 if(v.legendSeen&&typeof v.legendSeen==='object')for(const [id,n] of Object.entries(v.legendSeen))if(isLegendId(id)){const c=whole(n,LEGEND_SEEN_MAX);if(c>0)out.legendSeen[id]=c;}
 return out;
}
/** Two tabs / a downloaded save: keep the larger of everything (nothing earned is ever lost). */
export function mergeHooks(a:HooksSave,b:HooksSave):HooksSave{
 const visits:HooksSave['visits']={};for(const id of new Set([...Object.keys(a.visits),...Object.keys(b.visits)])){const x=a.visits[id],y=b.visits[id];visits[id]=!x?y!:!y?x:{n:Math.max(x.n,y.n),day:x.day>y.day?x.day:y.day};}
 const max=(p:Record<string,number>,q:Record<string,number>)=>Object.fromEntries([...new Set([...Object.keys(p),...Object.keys(q)])].map(k=>[k,Math.max(p[k]??0,q[k]??0)]));
 return {version:1,sets:[...new Set([...a.sets,...b.sets])],visits,golden:max(a.golden,b.golden),legendSeen:max(a.legendSeen,b.legendSeen)};
}
/** Claim every set the Fishbook now completes (idempotent). Returns the newly completed sets. */
export function claimSets(save:HooksSave,book:BookLike):{save:HooksSave;done:FishSet[]}{
 const done=FISH_SETS.filter(s=>!save.sets.includes(s.id)&&setComplete(s,book));
 return done.length?{save:{...save,sets:[...save.sets,...done.map(s=>s.id)]},done}:{save,done};
}

export type HookCatch={id:string;spot:string;
 /** The species' Fishbook count AFTER this catch (the Fishbook records before the catch event fires). */
 count:number;now:number;
 /** One random number for the golden roll (0..1). */
 rand:number;
 /** Legends caught and released (fishingLog.ts `legends`). */
 released:Readonly<Record<string,unknown>>};
export type HookEffects={golden:boolean;visitor:boolean;chapter:{n:number;text:string}|null;legendChapter:{id:string;n:number;text:string}|null};
/** One landed catch: the golden roll, the visitor mark, a new story chapter. Pure. Changes nothing about the catch itself. */
export function hookCatch(save0:HooksSave,c:HookCatch):{save:HooksSave;effects:HookEffects}{
 let save=save0;const effects:HookEffects={golden:false,visitor:false,chapter:null,legendChapter:null};
 if(isLegendId(c.id))return {save,effects};// a legend's release is its own moment (the fishing log's toast); chapter 1 is its story
 if(BOOK.has(c.id)){
  if(rollGolden(c.rand)){effects.golden=true;save={...save,golden:{...save.golden,[c.id]:Math.min(1e5,(save.golden[c.id]??0)+1)}};}
  const area=areaForSpot(c.spot),day=pacificDay(c.now);
  if(area&&visitorFor(area.id,day)?.id===c.id&&save.visits[c.id]?.day!==day){effects.visitor=true;save={...save,visits:{...save.visits,[c.id]:{n:(save.visits[c.id]?.n??0)+1,day}}};}
  const i=(SPECIES_CHAPTER_AT as readonly number[]).indexOf(c.count),text=i>0?SPECIES_CHAPTERS[c.id]?.[i-1]:undefined;
  if(text)effects.chapter={n:i+1,text};
 }
 // A released legend at this spot is "seen again" as the player keeps fishing there.
 for(const L of LEGEND_FISH){if(L.spots[0]!==c.spot||!c.released[L.id])continue;
  const seen=Math.min(LEGEND_SEEN_MAX,(save.legendSeen[L.id]??0)+1);if(seen===(save.legendSeen[L.id]??0))continue;
  save={...save,legendSeen:{...save.legendSeen,[L.id]:seen}};
  const i=(LEGEND_CHAPTER_AT as readonly number[]).indexOf(seen),text=i>0?LEGEND_CHAPTERS[L.id]?.[i-1]:undefined;
  if(text&&!effects.legendChapter)effects.legendChapter={id:L.id,n:i+1,text};}
 return {save,effects};
}
