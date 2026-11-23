import {gameLengths} from './registry';
import {GUIDE_FORMATS} from '../pitch';
import {makeSchedule} from './roundRobin';
import {KIDS,STANDARD,SHUTTLE_M,type Level} from './beepTest';
import type {NewToolWords,ToolTable} from './newTools';
import {moreRows} from './moreToolTables';
/**
 * The numbers in the three new tool pages' tables, computed from the tools' own code and the sourced age-group chart, so a
 * table can never disagree with its tool (Nov 22 2026). The words of each table (label, head) stay in the page data.
 */
type Lang='en'|'es';
const fmt=(es:boolean,n:number,d=1)=>es?n.toFixed(d).replace('.',','):n.toFixed(d);
/** The timer's presets: every US youth game length by format (lib/site/sizes.ts through gameLengths()), plus futsal-free custom. */
export function timerPresets(lang:Lang){
 const es=lang==='es';
 return GUIDE_FORMATS.filter(f=>f!=='futsal').flatMap(f=>gameLengths(f).map(g=>({id:`${f}-${g.periods}x${g.periodMin}`,periods:g.periods,periodMin:g.periodMin,ages:es?g.ages.replace(' to ',' a '):g.ages,format:f,
  label:`${g.ages} · ${f} · ${g.periods} × ${g.periodMin} min`,word:g.periods===4?(es?'cuartos':'quarters'):(es?'tiempos':'halves')})));
}
const levelRows=(levels:readonly Level[],es:boolean)=>{let m=0;return levels.map(l=>{m+=l.shuttles*SHUTTLE_M;return [String(l.level),`${fmt(es,l.kmh)} km/h`,String(l.shuttles),`${fmt(es,l.shuttleSec,2)} s`,`${m.toLocaleString(es?'es':'en-US')} m`];});};
export function filledTables(p:NewToolWords,lang:Lang):Record<string,ToolTable>{
 const es=lang==='es',out:Record<string,ToolTable>={};
 for(const sec of p.sections){if(!sec.table)continue;let rows:string[][]=sec.table.rows;
  if(p.slug==='soccer-match-timer'&&sec.id==='lengths')rows=timerPresets(lang).map(x=>[x.ages,x.format,`${x.periods} ${x.word} × ${x.periodMin} min`,`${x.periods*x.periodMin} min`]);
  if(p.slug==='soccer-tournament-schedule-maker'&&sec.id==='sizes')rows=[3,4,5,6,7,8,10,12].map(n=>{const teams=Array.from({length:n},(_,i)=>`T${i+1}`),slots=(f:number)=>String(makeSchedule({teams,fields:f,matchMin:12,breakMin:3,startMin:0}).slots.length);
   return [String(n),String(n*(n-1)/2),slots(1),slots(2),slots(3)];});
  if(p.slug==='soccer-beep-test')rows=levelRows(sec.id==='kids'?KIDS:STANDARD,es);
  rows=moreRows(p.slug,sec.id,lang)??rows;
  out[sec.id]={...sec.table,rows};}
 return out;
}
