/**
 * The Bug book (Oct 20 2026, user: "saved bug collection book"): every Bug squad bug and every firefly call the player has ever
 * caught, remembered across shifts and sessions and synced with the save (lib/saves/snapshot.ts SYNC_KEYS `fi2-bug-book-v1`).
 * Pure, with a storage port, no three.js. Tiny on purpose: two arrays of eight catch counts and a reward flag
 * (`{"version":1,"bugs":[…8],"fireflies":[…8],"reward":false}`, at most ~130 bytes), so it barely touches the 192 KB gzip cap.
 *
 * Catches are recorded by lib/town/jobs/jobScene.ts the moment a bug drifts into the jar. Completing the book (all eight bugs
 * and all eight fireflies) pays a one-time learning bonus (LEARN_COINS.book through the wallet's creditOnce, id
 * `learn:book:bug-book`, so it can never pay twice even across devices) and shows the "Full squad" sticker on the book's cover.
 * UI: components/BugBook.tsx, opened with OPEN_BUG_BOOK from the bug jobs' cards.
 */
import {BUG_SQUAD,FIREFLY_CALLS} from './bugScout';

export const BUG_BOOK_KEY='fi2-bug-book-v1';
/** Window event: open the Bug book from anywhere (the job cards, the payday card). */
export const OPEN_BUG_BOOK='fi2-open-bug-book';
/** Document event (jobScene cue): the book was just completed (the UI pays the one-time bonus). */
export const BUG_BOOK_COMPLETE_EVENT='fi2-bug-book-complete';
/** The learning-coin id for the completion bonus (lib/town/learnCoins.ts kind `book`). */
export const BUG_BOOK_REWARD_ID='bug-book';
export const BUG_BOOK_SIZE=BUG_SQUAD.length+FIREFLY_CALLS.length;
const COUNT_CAP=9999;

export type BugBookSave={version:1;bugs:number[];fireflies:number[];reward:boolean};
export const emptyBugBook=():BugBookSave=>({version:1,bugs:BUG_SQUAD.map(()=>0),fireflies:FIREFLY_CALLS.map(()=>0),reward:false});
const counts=(v:unknown,n:number)=>Array.from({length:n},(_,i)=>{const x=Array.isArray(v)?v[i]:0;return typeof x==='number'&&Number.isFinite(x)?Math.max(0,Math.min(COUNT_CAP,Math.floor(x))):0;});
export function sanitizeBugBook(v:unknown):BugBookSave{
 const o=v&&typeof v==='object'?v as Partial<BugBookSave>:{};
 return {version:1,bugs:counts(o.bugs,BUG_SQUAD.length),fireflies:counts(o.fireflies,FIREFLY_CALLS.length),reward:o.reward===true};
}
type Port={get:()=>string|null;set:(v:string)=>void};
const local:Port={get:()=>localStorage.getItem(BUG_BOOK_KEY),set:v=>localStorage.setItem(BUG_BOOK_KEY,v)};
export function readBugBook(port:Port=local):BugBookSave{try{return sanitizeBugBook(JSON.parse(port.get()??'null'));}catch{return emptyBugBook();}}
export function writeBugBook(s:BugBookSave,port:Port=local){try{port.set(JSON.stringify(s));}catch{/* private mode: the catch still counts this visit */}}
export const caughtKinds=(s:BugBookSave)=>s.bugs.filter(n=>n>0).length+s.fireflies.filter(n=>n>0).length;
export const bugBookComplete=(s:BugBookSave)=>caughtKinds(s)>=BUG_BOOK_SIZE;
/** A catch on a shift: counted in the book. `completed` is true only on the catch that fills the last empty page. */
export function recordBugCatch(kind:'bug'|'firefly',index:number,port:Port=local):{save:BugBookSave;first:boolean;completed:boolean}{
 const s=readBugBook(port),list=kind==='bug'?s.bugs:s.fireflies;
 if(!Number.isInteger(index)||index<0||index>=list.length)return {save:s,first:false,completed:false};
 const was=bugBookComplete(s),first=list[index]===0;list[index]=Math.min(COUNT_CAP,list[index]+1);writeBugBook(s,port);
 return {save:s,first,completed:!was&&bugBookComplete(s)};
}
/** Mark the completion bonus as shown (the wallet's own idempotent id is what guarantees it pays once). */
export function markBugBookReward(port:Port=local){const s=readBugBook(port);if(s.reward)return s;s.reward=true;writeBugBook(s,port);return s;}

/** The book's pages: each bug's name and football position, each firefly's call, and the lesson from its catch note. */
export type BugBookPage={kind:'bug'|'firefly';index:number;name:string;role:string;lesson:string;color:string;span:number;length:number};
const NAMES=['Goalie Ladybug','Pill-bug Centre-back','Full-back Grasshopper','Midfield Dragonfly','Football Butterfly','Captain Monarch','Striker Beetle','Referee Bumblebee'];
const ROLES=['Goalkeeper (GK)','Centre-back (defender)','Full-back (defender)','Midfielder','Winger','Captain','Striker','Referee (Law 5)'];
const lessonOf=(note:string)=>note.replace(/^[^!]*in the jar! /,'');
export const BUG_BOOK_PAGES:readonly BugBookPage[]=[
 ...BUG_SQUAD.map((b,i)=>({kind:'bug' as const,index:i,name:NAMES[i]??`Bug ${i+1}`,role:ROLES[i]??'Squad player',lesson:lessonOf(b.note),color:b.color,span:b.span,length:b.length})),
 ...FIREFLY_CALLS.map((f,i)=>({kind:'firefly' as const,index:i,name:`“${(f.hint.match(/"([^"]+)"/)??['',`Call ${i+1}`])[1]}” firefly`,role:'Football call',lesson:lessonOf(f.note),color:f.color,span:f.span,length:f.length})),
];
export const pageCaught=(s:BugBookSave,p:BugBookPage)=>(p.kind==='bug'?s.bugs:s.fireflies)[p.index]??0;
