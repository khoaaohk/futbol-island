/**
 * Soccer match timer and scoreboard (Nov 22 2026; /tools/soccer-match-timer). Pure and import-free (tests/new-tools.cjs).
 * Time is kept as timestamps, never by counting ticks: the clock is `banked + (now - startedAt)`, so it stays right when the
 * phone locks, the tab sleeps or the page reloads (the component saves this state on the device). The component only redraws
 * while the page is visible (AGENTS.md: nothing runs when hidden).
 */
export type Setup={periods:number;periodMin:number;breakMin:number;subEvery:number};
export type Phase='ready'|'running'|'paused'|'break'|'done';
export type Clock={setup:Setup;period:number;phase:Phase;banked:number;startedAt:number|null;breakAt:number|null;added:number[];goals:[number,number];events:{t:number;period:number;team:0|1}[]};
export const MIN=60000;
export const clampSetup=(s:Partial<Setup>):Setup=>({periods:[1,2,3,4].includes(Number(s.periods))?Number(s.periods):2,periodMin:Math.max(1,Math.min(60,Math.round(Number(s.periodMin)||25))),
 breakMin:Math.max(0,Math.min(30,Math.round(Number(s.breakMin)||0))),subEvery:Math.max(0,Math.min(30,Math.round(Number(s.subEvery)||0)))});
export const newClock=(setup:Setup):Clock=>({setup:clampSetup(setup),period:0,phase:'ready',banked:0,startedAt:null,breakAt:null,added:Array(clampSetup(setup).periods).fill(0),goals:[0,0],events:[]});
/** Time played in the current period, in ms. */
export const elapsed=(c:Clock,now:number)=>c.banked+(c.startedAt!==null?Math.max(0,now-c.startedAt):0);
/** Length of the current period with its added time, in ms. */
export const periodLength=(c:Clock)=>(c.setup.periodMin+(c.added[c.period]??0))*MIN;
export const remaining=(c:Clock,now:number)=>periodLength(c)-elapsed(c,now);
export const start=(c:Clock,now:number):Clock=>c.phase==='running'||c.phase==='done'?c:{...c,phase:'running',startedAt:now,breakAt:null,
 ...(c.phase==='break'?{period:c.period+1,banked:0}:{})};
export const pause=(c:Clock,now:number):Clock=>c.phase!=='running'?c:{...c,phase:'paused',banked:elapsed(c,now),startedAt:null};
/** Whistle for the end of the period: a break before the next one, or the end of the game. */
export const endPeriod=(c:Clock,now:number):Clock=>{
 if(c.phase==='done'||c.phase==='break')return c;
 const banked=elapsed(c,now),last=c.period>=c.setup.periods-1;
 return {...c,banked,startedAt:null,phase:last?'done':'break',breakAt:last?null:now};
};
/** Added (stoppage) time for the current period, in whole minutes, never below zero. */
export const addTime=(c:Clock,min:number):Clock=>{const added=c.added.slice();added[c.period]=Math.max(0,Math.min(15,(added[c.period]??0)+min));return {...c,added};};
export const goal=(c:Clock,team:0|1,now:number,delta:1|-1=1):Clock=>{
 const goals:[number,number]=[c.goals[0],c.goals[1]];if(delta<0&&goals[team]===0)return c;goals[team]+=delta;
 const events=delta>0?[...c.events,{t:Math.floor(elapsed(c,now)/MIN),period:c.period,team}]:(()=>{const e=c.events.slice();for(let i=e.length-1;i>=0;i--)if(e[i].team===team){e.splice(i,1);break;}return e;})();
 return {...c,goals,events};
};
/** Minutes in a period at which a substitution reminder sounds (every N minutes, not at 0 and not at the final whistle). */
export const subMarks=(s:Setup)=>{if(!s.subEvery)return [] as number[];const out:number[]=[];for(let m=s.subEvery;m<s.periodMin;m+=s.subEvery)out.push(m);return out;};
/** The next reminder after `ms` played, in ms, or null. */
export const nextSub=(s:Setup,ms:number)=>{const m=subMarks(s).find(x=>x*MIN>ms);return m===undefined?null:m*MIN;};
/** Which marks (ms) a redraw stepped over between two readings of the clock: the component beeps once for each. */
export const crossed=(marks:readonly number[],from:number,to:number)=>marks.filter(m=>m>from&&m<=to);
export type PeriodWord='half'|'quarter'|'third'|'period';
export const periodWord=(periods:number):PeriodWord=>periods===2?'half':periods===4?'quarter':periods===3?'third':'period';
/** "25:00", "-1:05" (added time shown past zero), "90:12". */
export const mmss=(ms:number)=>{const neg=ms<0,s=Math.floor(Math.abs(ms)/1000+(neg?0:.999));return `${neg?'+':''}${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;};
/** Total length of a game in minutes (without breaks or added time), for the page's table. */
export const gameMinutes=(s:Setup)=>s.periods*s.periodMin;
/** A saved clock read back from storage: anything malformed gives null. */
export function readClock(raw:unknown):Clock|null{
 if(!raw||typeof raw!=='object')return null;const c=raw as Clock;
 if(!c.setup||!['ready','running','paused','break','done'].includes(c.phase)||!Array.isArray(c.goals)||!Array.isArray(c.added))return null;
 const setup=clampSetup(c.setup);if(!(c.period>=0&&c.period<setup.periods))return null;
 return {setup,period:c.period,phase:c.phase,banked:Number(c.banked)||0,startedAt:typeof c.startedAt==='number'?c.startedAt:null,breakAt:typeof c.breakAt==='number'?c.breakAt:null,
  added:setup.periods===c.added.length?c.added.map(x=>Number(x)||0):Array(setup.periods).fill(0),goals:[Number(c.goals[0])||0,Number(c.goals[1])||0],events:Array.isArray(c.events)?c.events.slice(0,200):[]};
}
