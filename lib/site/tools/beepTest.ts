/**
 * Beep test (20 m multistage shuttle run) for kids (Nov 22 2026; /tools/soccer-beep-test). Pure and import-free
 * (tests/new-tools.cjs).
 * STANDARD: the common 20 m table (8.0 km/h at level 1, 9.0 km/h at level 2, then 0.5 km/h more each level of about one
 * minute; shuttles per level as published by Top End Sports, https://www.topendsports.com/testing/beep-table.htm, the same
 * speeds as the British National Coaching Foundation and Australian versions listed at
 * https://www.topendsports.com/testing/beep-variations.htm; Léger's original started at 8.5 km/h:
 * https://pubmed.ncbi.nlm.nih.gov/3184250/).
 * KIDS: a Futbol Island practice version, NOT a standard test: the same 20 m lane, starting at 6.0 km/h and adding 0.5 km/h
 * each level, each level about a minute long. Results from it are not comparable to published norms; the page says so.
 */
export type Level={level:number;kmh:number;shuttles:number;shuttleSec:number};
export const SHUTTLE_M=20;
const sec=(kmh:number)=>Math.round(SHUTTLE_M/(kmh/3.6)*100)/100;
const STD_SHUTTLES=[7,8,8,9,9,10,10,11,11,11,12,12,13,13,13,14,14,15,15,16,16];
export const STANDARD:readonly Level[]=STD_SHUTTLES.map((shuttles,i)=>{const kmh=i===0?8:8.5+0.5*i;return {level:i+1,kmh,shuttles,shuttleSec:sec(kmh)};});
export const KIDS:readonly Level[]=Array.from({length:15},(_,i)=>{const kmh=6+0.5*i,s=sec(kmh);return {level:i+1,kmh,shuttles:Math.max(5,Math.round(60/s)),shuttleSec:s};});
export type Mode='kids'|'standard';
export const levelsFor=(m:Mode)=>m==='kids'?KIDS:STANDARD;
/** Every shuttle's end time from the start, in seconds, with its level and number in the level. */
export type Beat={t:number;level:number;shuttle:number;levelEnd:boolean};
export function beats(levels:readonly Level[]):Beat[]{
 const out:Beat[]=[];let t=0;
 for(const L of levels)for(let s=1;s<=L.shuttles;s++){t=Math.round((t+L.shuttleSec)*1000)/1000;out.push({t,level:L.level,shuttle:s,levelEnd:s===L.shuttles});}
 return out;
}
/** Where the test is after `t` seconds: the shuttle being run now, how far through it (0-1), and what has been completed. */
export function at(levels:readonly Level[],bs:readonly Beat[],t:number){
 const i=bs.findIndex(b=>b.t>t);
 if(i<0){const last=bs[bs.length-1];return {done:true,level:last.level,shuttle:last.shuttle,progress:1,completed:bs.length,kmh:levels[levels.length-1].kmh};}
 const b=bs[i],startT=i>0?bs[i-1].t:0;
 return {done:false,level:b.level,shuttle:b.shuttle,progress:(t-startT)/(b.t-startT),completed:i,kmh:levels[b.level-1].kmh};
}
/** A result the usual way, "level.shuttle" of the last COMPLETED shuttle ("5.3"), and the distance run. */
export function score(bs:readonly Beat[],completed:number){
 if(completed<=0)return {label:'0',level:0,shuttle:0,metres:0};
 const b=bs[Math.min(completed,bs.length)-1];
 return {label:`${b.level}.${b.shuttle}`,level:b.level,shuttle:b.shuttle,metres:Math.min(completed,bs.length)*SHUTTLE_M};
}
/** Total time to finish every level, in seconds. */
export const totalSec=(levels:readonly Level[])=>{const b=beats(levels);return b[b.length-1].t;};
