/**
 * The Bug book (Oct 20 2026, user: "saved bug collection book"; catching lane the same day: 20 bug pages + 8 firefly pages keyed by
 * species id): every species the player has ever caught, remembered across shifts and sessions and synced with the save
 * (lib/saves/snapshot.ts SYNC_KEYS `fi2-bug-book-v1`; the key is kept, the content is version 2). Pure, with a storage port.
 *
 * Save (v2): `{"version":2,"bugs":{id:count},"fireflies":{id:count},"squad":[ids],"squads":n,"reward":bool,"nightReward":bool}`.
 * Only caught species are stored (counts capped at 9999), so the full book is ~600 bytes, far under the 192 KB gzip cap.
 *  - `squad`: the species caught in the CURRENT squad (each species once per squad completion); all 20 = the squad is complete
 *    (the release shows the 20-bug formation), then it starts again and `squads` counts completions.
 *  - The story on a catch card rotates with the species' catch count (storyFor), so no extra state is stored.
 *  - v1 saves (two index-ordered arrays of eight counts) migrate through LEGACY_BUG_IDS / LEGACY_FIREFLY_IDS (bugScout.ts).
 * Rewards (lib/town/jobs/bugBookReward.ts): all 20 bugs = `learn:book:bug-book` (once ever), all 8 fireflies =
 * `learn:book:bug-book-night` (once ever), and NEW_SPECIES_COINS for each species' first catch (`learn:book:bug-new-<id>`).
 * UI: components/BugBook.tsx, opened with OPEN_BUG_BOOK from the bug jobs' cards.
 */
import {BUG_SQUAD,FIREFLY_CALLS,LEGACY_BUG_IDS,LEGACY_FIREFLY_IDS} from './bugScout';
import {fireflyById} from './bugSpecies';

export const BUG_BOOK_KEY='fi2-bug-book-v1';
/** Window event: open the Bug book from anywhere (the job cards, the payday card). */
export const OPEN_BUG_BOOK='fi2-open-bug-book';
/** Document event (jobScene cue): the book was just completed (`detail`: 'complete' = 20 bugs, 'night' = 8 fireflies). */
export const BUG_BOOK_COMPLETE_EVENT='fi2-bug-book-complete';
/** Document event (jobScene cue): a species caught for the first time ever (`detail`: its id): the UI pays NEW_SPECIES_COINS. */
export const BUG_NEW_SPECIES_EVENT='fi2-bug-new-species';
/** The learning-coin ids for the completion bonuses (lib/town/learnCoins.ts kind `book`). */
export const BUG_BOOK_REWARD_ID='bug-book';
export const BUG_BOOK_NIGHT_REWARD_ID='bug-book-night';
export const bugNewRewardId=(id:string)=>`bug-new-${id}`;
export const BUG_IDS:readonly string[]=BUG_SQUAD.map(b=>b.id);
export const FIREFLY_IDS:readonly string[]=FIREFLY_CALLS.map(f=>f.id);
export const BUG_BOOK_SIZE=BUG_IDS.length+FIREFLY_IDS.length;
const COUNT_CAP=9999;

export type BugBookSave={version:2;bugs:Record<string,number>;fireflies:Record<string,number>;squad:string[];squads:number;reward:boolean;nightReward:boolean};
export const emptyBugBook=():BugBookSave=>({version:2,bugs:{},fireflies:{},squad:[],squads:0,reward:false,nightReward:false});
const n=(x:unknown)=>typeof x==='number'&&Number.isFinite(x)?Math.max(0,Math.min(COUNT_CAP,Math.floor(x))):0;
function countsById(v:unknown,ids:readonly string[],legacy:readonly string[]):Record<string,number>{
 const out:Record<string,number>={};
 if(Array.isArray(v)){v.forEach((x,i)=>{const id=legacy[i],c=n(x);if(id&&c&&ids.includes(id))out[id]=Math.min(COUNT_CAP,(out[id]??0)+c);});return out;}
 if(v&&typeof v==='object')for(const id of ids){const c=n((v as Record<string,unknown>)[id]);if(c)out[id]=c;}
 return out;
}
/** Any save (v1 arrays by index, v2 by id, or junk) → a clean v2 save. */
export function sanitizeBugBook(v:unknown):BugBookSave{
 const o=v&&typeof v==='object'?v as Record<string,unknown>:{};
 const bugs=countsById(o.bugs,BUG_IDS,LEGACY_BUG_IDS),fireflies=countsById(o.fireflies,FIREFLY_IDS,LEGACY_FIREFLY_IDS);
 const squad=Array.isArray(o.squad)?[...new Set(o.squad.filter((x):x is string=>typeof x==='string'&&BUG_IDS.includes(x)))]:o.version===2?[]:Object.keys(bugs);
 return {version:2,bugs,fireflies,squad:squad.length>=BUG_IDS.length?[]:squad,squads:n(o.squads),reward:o.reward===true,nightReward:o.nightReward===true};
}
type Port={get:()=>string|null;set:(v:string)=>void};
const local:Port={get:()=>localStorage.getItem(BUG_BOOK_KEY),set:v=>localStorage.setItem(BUG_BOOK_KEY,v)};
export function readBugBook(port:Port=local):BugBookSave{try{return sanitizeBugBook(JSON.parse(port.get()??'null'));}catch{return emptyBugBook();}}
export function writeBugBook(s:BugBookSave,port:Port=local){try{port.set(JSON.stringify(s));}catch{/* private mode: the catch still counts this visit */}}
export const bugsCaught=(s:BugBookSave)=>BUG_IDS.filter(id=>(s.bugs[id]??0)>0).length;
export const firefliesCaught=(s:BugBookSave)=>FIREFLY_IDS.filter(id=>(s.fireflies[id]??0)>0).length;
export const caughtKinds=(s:BugBookSave)=>bugsCaught(s)+firefliesCaught(s);
/** The 20-bug book is complete (the one-time "Full squad" bonus). */
export const bugBookComplete=(s:BugBookSave)=>bugsCaught(s)>=BUG_IDS.length;
export const nightBookComplete=(s:BugBookSave)=>firefliesCaught(s)>=FIREFLY_IDS.length;
export type BugCatchRecord={save:BugBookSave;count:number;first:boolean;completed:boolean;nightCompleted:boolean;squadNew:boolean;squadComplete:boolean;squadSize:number};
/** A catch on a shift, by species / call id. `first` = first ever; `squadComplete` = this catch filled the 20th squad page (the
 *  squad then starts again, `squads` +1). `completed` / `nightCompleted` = this catch completed the 20 bugs / the 8 fireflies. */
export function recordBugCatch(kind:'bug'|'firefly',id:string,port:Port=local):BugCatchRecord{
 const s=readBugBook(port),ids=kind==='bug'?BUG_IDS:FIREFLY_IDS,map=kind==='bug'?s.bugs:s.fireflies;
 if(!ids.includes(id))return {save:s,count:0,first:false,completed:false,nightCompleted:false,squadNew:false,squadComplete:false,squadSize:s.squad.length};
 const was=bugBookComplete(s),wasNight=nightBookComplete(s),first=!map[id];map[id]=Math.min(COUNT_CAP,(map[id]??0)+1);
 let squadNew=false,squadComplete=false;
 if(kind==='bug'&&!s.squad.includes(id)){s.squad.push(id);squadNew=true;if(s.squad.length>=BUG_IDS.length){squadComplete=true;s.squads=Math.min(COUNT_CAP,s.squads+1);}}
 const squadSize=s.squad.length;if(squadComplete)s.squad=[];
 writeBugBook(s,port);
 return {save:s,count:map[id],first,completed:!was&&bugBookComplete(s),nightCompleted:!wasNight&&nightBookComplete(s),squadNew,squadComplete,squadSize};
}
/** Mark a completion bonus as shown (the wallet's own idempotent id is what guarantees it pays once). */
export function markBugBookReward(port:Port=local,night=false){const s=readBugBook(port);if(night?s.nightReward:s.reward)return s;if(night)s.nightReward=true;else s.reward=true;writeBugBook(s,port);return s;}

/** The book's pages, by species id: each bug's name, squad role and football lesson, its real stories; each firefly's call. */
export type BugBookPage={kind:'bug'|'firefly';id:string;index:number;name:string;role:string;lesson:string;/** a firefly call's coaching idea (the lesson) */idea?:string;color:string;span:number;length:number;stories:readonly {text:string;source:string}[]};
const lessonOf=(note:string)=>note.replace(/^[^!]*in the jar! /,'');
export const BUG_BOOK_PAGES:readonly BugBookPage[]=[
 ...BUG_SQUAD.map((b,i)=>({kind:'bug' as const,id:b.id,index:i,name:b.name,role:b.role,lesson:lessonOf(b.note),color:b.color,span:b.span,length:b.length,stories:b.stories})),
 ...FIREFLY_CALLS.map((f,i)=>({kind:'firefly' as const,id:f.id,index:i,name:f.name,role:f.role,lesson:lessonOf(f.note),idea:fireflyById(f.id)?.idea,color:f.color,span:f.span,length:f.length,stories:f.stories})),
];
export const pageCaught=(s:BugBookSave,p:BugBookPage)=>(p.kind==='bug'?s.bugs:s.fireflies)[p.id]??0;
