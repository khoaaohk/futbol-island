/**
 * Soccer juggling challenge tracker (Nov 22 2026; /tools/soccer-juggling-challenge and its Spanish twin). Pure and import-free
 * (tests/more-tools.cjs): the levels, the log of attempts, personal bests, the practice streak and the weekly goal. Days are
 * whole days counted from 1970-01-01 in the player's own time zone (the page works the day out; this module never reads a
 * clock), so the streak is testable.
 * HEADING (lib/site/rules.ts, heading-rules-for-kids): US Youth Soccer Rule 305 says no heading at 10 and under in matches or
 * organised practice, and at most 25 headers a week at 11 and 12; The FA says no heading in training up to U11 and at most five
 * headers in one session a week at U12 and U13. So the head challenge is hidden unless the player is 11 or older, uses only
 * three short levels, and the page says to count every header and stay inside those limits.
 */
export type Variation='feet'|'weak'|'thigh'|'head';
export type AgeBand='10-under'|'11-12'|'13-up';
export const VARIATIONS:readonly Variation[]=['feet','weak','thigh','head'];
/** The touch targets of each challenge, easiest first. */
export const LEVELS:Record<Variation,readonly number[]>={feet:[5,10,15,20,30,40,50,75,100],weak:[5,10,15,20,30,50],thigh:[5,10,15,20,30,50],head:[3,5,10]};
export const MAX_TOUCHES=1000,MAX_LOG=300;
export const headAllowed=(age:AgeBand)=>age!=='10-under';
export const variationsFor=(age:AgeBand)=>VARIATIONS.filter(v=>v!=='head'||headAllowed(age));
export type Attempt={day:number;v:Variation;n:number};
export type JuggleState={age:AgeBand;weeklyGoal:number;log:Attempt[]};
export const NEW_STATE:JuggleState={age:'10-under',weeklyGoal:3,log:[]};
/** The example the page shows before anyone logs a try: a week of a player working up to 23 touches. Labelled "Example". */
export function exampleState(today:number):JuggleState{
 const d=(k:number)=>today-k;
 return {age:'10-under',weeklyGoal:3,log:[{day:d(9),v:'feet',n:6},{day:d(9),v:'feet',n:9},{day:d(6),v:'feet',n:12},{day:d(6),v:'weak',n:3},{day:d(2),v:'feet',n:17},{day:d(1),v:'feet',n:14},{day:d(1),v:'thigh',n:5},{day:d(0),v:'feet',n:23}]};
}
export const best=(s:JuggleState,v:Variation)=>s.log.reduce((a,x)=>x.v===v&&x.n>a?x.n:a,0);
/** The level a best touches count has reached (0 = none yet) and the next target (null when every level is done). */
export function level(v:Variation,b:number){const L=LEVELS[v];const done=L.filter(t=>b>=t).length;return {done,of:L.length,next:done<L.length?L[done]:null};}
/** Log one attempt. Returns the new state and whether it is a new personal best (and which level it just passed). */
export function logAttempt(s:JuggleState,a:Attempt):{state:JuggleState;newBest:boolean;passed:number|null}{
 const n=Math.max(0,Math.min(MAX_TOUCHES,Math.round(a.n)));if(!Number.isFinite(n)||!VARIATIONS.includes(a.v)||(a.v==='head'&&!headAllowed(s.age)))return {state:s,newBest:false,passed:null};
 const before=best(s,a.v),log=[...s.log,{day:Math.round(a.day),v:a.v,n}].slice(-MAX_LOG);
 const lb=level(a.v,before).done,la=level(a.v,n).done;
 return {state:{...s,log},newBest:n>before&&n>0,passed:la>lb?LEVELS[a.v][la-1]:null};
}
export const undo=(s:JuggleState):JuggleState=>({...s,log:s.log.slice(0,-1)});
const days=(s:JuggleState)=>[...new Set(s.log.map(x=>x.day))].sort((a,b)=>a-b);
/** Days in a row with at least one try, ending today (or yesterday: a streak is not lost until a whole day is missed). */
export function streak(s:JuggleState,today:number){const set=new Set(days(s));let d=set.has(today)?today:today-1,n=0;while(set.has(d)){n++;d--;}return n;}
/** Monday of the week that holds `day` (1970-01-01 was a Thursday). */
export const weekStart=(day:number)=>day-((day+3)%7);
/** Days practised this week (Monday to Sunday) against the weekly goal. */
export function week(s:JuggleState,today:number){const w=weekStart(today);const n=days(s).filter(d=>d>=w&&d<=today).length;return {days:n,goal:s.weeklyGoal,met:n>=s.weeklyGoal};}
/** Read a saved state back safely (anything broken becomes the empty state). */
export function readState(v:unknown):JuggleState{
 if(!v||typeof v!=='object')return NEW_STATE;const o=v as Partial<JuggleState>;
 const age:AgeBand=o.age==='11-12'||o.age==='13-up'?o.age:'10-under',goal=Number(o.weeklyGoal);
 const log=Array.isArray(o.log)?o.log.filter((x):x is Attempt=>!!x&&Number.isInteger(x.day)&&VARIATIONS.includes(x.v)&&Number.isFinite(x.n)&&x.n>=0&&x.n<=MAX_TOUCHES).slice(-MAX_LOG):[];
 return {age,weeklyGoal:Number.isInteger(goal)&&goal>=1&&goal<=7?goal:3,log};
}
/** The whole day number of a calendar date in the player's time zone (year, month 1-12, day). */
export const dayNumber=(y:number,m:number,d:number)=>Math.floor(Date.UTC(y,m-1,d)/864e5);
