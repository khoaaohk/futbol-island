/**
 * The on-device activity tally behind the smart Welcome back note (Nov 14 2026, docs/welcome-suggestions.md). Pure: no storage,
 * no React (tallyLive.ts is the browser binding). A few numbers per interest: decayed minutes, decayed actions (times started)
 * and the last day each was played. It REUSES the analytics beat's activity classification (lib/analytics/islandIds.ts
 * ACTIVITIES) but never leaves the device: it is one small synced save key (WELCOME_TALLY_KEY in lib/saves/snapshot.ts
 * SYNC_KEYS), so it follows a save code; without one it stays in this browser. Never sent to analytics.
 */
import type {ActivityId} from '../analytics/islandIds';

export const INTERESTS=['fishing','lessons','arcade','roam','kit'] as const;
export type Interest=typeof INTERESTS[number];
export const INTEREST_INDEX:Record<Interest,number>={fishing:0,lessons:1,arcade:2,roam:3,kit:4};
export const WELCOME_TALLY_KEY='fi2-welcome-tally-v1';
/** Recency decay per whole day since the last decay: a visit 5 days ago counts about 44%, 14 days ago about 10%. */
export const DAY_DECAY=0.85;
/** One action (starting an interest) is worth this many minutes in the score: a quick visit still says "I like this". */
export const ACTION_WEIGHT=3;
/** A single unbroken segment is capped (the beat's IDLE_MS): a tab left open on a menu does not count for hours. */
export const SEGMENT_CAP_MIN=10;

/** v1. `d` the day number of the last decay, `m`/`a` minutes and actions per interest (INTERESTS order, one decimal), `l` the
 *  last day number each interest was played (0 = never), `st` the lesson streak [days, last lesson day], `fav` the arcade
 *  cabinet played last (the Kit Shop's last visit is l[4]). ~120 bytes. */
export type Tally={v:1;d:number;m:number[];a:number[];l:number[];st:[number,number];fav:string|null};
export const emptyTally=():Tally=>({v:1,d:0,m:[0,0,0,0,0],a:[0,0,0,0,0],l:[0,0,0,0,0],st:[0,0],fav:null});

/** Local day number (days since 1970-01-01 in the device's own time zone). */
export function dayNumber(now:number):number{const t=new Date(now);return Math.floor(Date.UTC(t.getFullYear(),t.getMonth(),t.getDate())/864e5);}

/** The interest an activity belongs to, or null (menus, talking, cards, the museum, idle…). */
export function interestOf(a:ActivityId|string|null|undefined):Interest|null{
 if(!a)return null;
 if(a==='fishing')return 'fishing';
 if(a==='lesson'||a==='quiz'||a==='paths'||a==='coaches')return 'lessons';
 if(a.startsWith('arcade_'))return 'arcade';
 if(a==='walk'||a==='ride'||a==='fly'||a==='swim'||a==='boat')return 'roam';
 if(a==='kit_shop'||a==='kit_studio')return 'kit';
 return null;
}
/** The arcade cabinet of an arcade activity ('arcade_puzzle' → 'puzzle'; 'arcade_live' is Kit Rush now), or null. */
export function cabinetOf(a:string|null|undefined):string|null{
 if(!a||!a.startsWith('arcade_')||a==='arcade_lobby')return null;
 const c=a.slice(7);return c==='live'?'kitrush':c;
}

const num=(v:unknown,max:number)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.min(max,v)):0;
const r1=(x:number)=>Math.round(x*10)/10;
const five=(v:unknown,max:number)=>{const a=Array.isArray(v)?v:[];return INTERESTS.map((_,i)=>r1(num(a[i],max)));};
const day=(v:unknown)=>Math.floor(num(v,1e6));
/** Never throws; anything odd becomes an empty slot. Also the save-code sanitiser (lib/saves/snapshot.ts cleanKeys). */
export function sanitizeTally(raw:unknown):Tally{
 if(!raw||typeof raw!=='object'||(raw as {v?:unknown}).v!==1)return emptyTally();
 const o=raw as Record<string,unknown>,st=Array.isArray(o.st)?o.st:[];
 return {v:1,d:day(o.d),m:five(o.m,1e5),a:five(o.a,1e4),l:(Array.isArray(o.l)?o.l:[]).slice(0,5).map(day).concat([0,0,0,0,0]).slice(0,5),
  st:[Math.floor(num(st[0],999)),day(st[1])],fav:typeof o.fav==='string'&&/^[a-z]{1,12}$/.test(o.fav)?o.fav:null};
}
/** A sanitised JSON string for a save-code value, or null when it is not a tally. */
export function cleanTallyRaw(v:string):string|null{try{return JSON.stringify(sanitizeTally(JSON.parse(v)));}catch{return null;}}

/** Recency decay up to `today` (whole days since the last decay). Pure. */
export function decayTally(t:Tally,today:number):Tally{
 if(!t.d){return {...t,d:today};}
 const days=today-t.d;if(days<=0)return t;
 const f=Math.pow(DAY_DECAY,Math.min(days,60));
 return {...t,d:today,m:t.m.map(x=>r1(x*f)),a:t.a.map(x=>r1(x*f))};
}
/** Minutes played in an interest (decay first). */
export function addMinutes(t0:Tally,i:Interest,min:number,today:number):Tally{
 const t=decayTally(t0,today),k=INTEREST_INDEX[i],m=[...t.m],l=[...t.l];
 m[k]=r1(m[k]+Math.max(0,Math.min(SEGMENT_CAP_MIN,min)));l[k]=today;return {...t,m,l};
}
/** An interest started (one action). Lessons keep the day streak; an arcade cabinet becomes the favourite. */
export function addAction(t0:Tally,i:Interest,today:number,cabinet?:string|null):Tally{
 const t=decayTally(t0,today),k=INTEREST_INDEX[i],a=[...t.a],l=[...t.l];
 a[k]=r1(a[k]+1);l[k]=today;
 let st=t.st;
 if(i==='lessons'&&st[1]!==today)st=[st[1]===today-1?st[0]+1:1,today];
 return {...t,a,l,st,fav:cabinet&&/^[a-z]{1,12}$/.test(cabinet)?cabinet:t.fav};
}
/** The lesson streak still alive today: n days, `today` true when a lesson already ran today. 0 when it is broken. */
export function lessonStreak(t:Tally,today:number):{days:number;today:boolean}{
 const [n,last]=t.st;if(last===today)return {days:n,today:true};if(last===today-1)return {days:n,today:false};return {days:0,today:false};
}
/** Score per interest (decayed to `today`): minutes + ACTION_WEIGHT × actions + `boost` (taps on its suggestions). */
export function interestScores(t0:Tally,today:number,boost:Partial<Record<Interest,number>>={}):Record<Interest,number>{
 const t=decayTally(t0,today);
 return Object.fromEntries(INTERESTS.map((i,k)=>[i,r1(t.m[k]+ACTION_WEIGHT*t.a[k]+(boost[i]??0))])) as Record<Interest,number>;
}
/** Interests by score, best first; ties keep INTERESTS order. Interests with no score at all are left out. */
export function rankInterests(s:Record<Interest,number>):Interest[]{
 return INTERESTS.filter(i=>s[i]>0).sort((x,y)=>s[y]-s[x]||INTEREST_INDEX[x]-INTEREST_INDEX[y]);
}
