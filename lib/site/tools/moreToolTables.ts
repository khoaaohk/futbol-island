import {CLUB_WORDS,NOTES} from './teamNames';
import {AGE_LENGTH,PLAN_AGES,PLAN_LENGTHS} from './practicePlan';
import {FORMATS,show,type FieldFormat} from './fieldSizes';
import {LEVELS,VARIATIONS,type Variation} from './juggling';
/**
 * The numbers in the five second-batch tool pages' tables (Nov 22 2026), computed from the tools' own data so a table can never
 * disagree with its tool. Read by ./newToolTables.ts filledTables(); the table's label and head stay in the page words.
 */
type Lang='en'|'es';
const n=(es:boolean,v:number)=>es?String(v).replace('.',','):String(v);
const YEARS:Record<string,[string,string]>={U6:['5 and 6','5 y 6 años'],U8:['7 and 8','7 y 8 años'],U10:['9 and 10','9 y 10 años'],U12:['11 and 12','11 y 12 años']};
export const VARIATION_NAME:Record<Lang,Record<Variation,string>>={en:{feet:'Both feet',weak:'Weak foot only',thigh:'Thighs only',head:'Head (age 11 and over)'},es:{feet:'Los dos pies',weak:'Solo el pie malo',thigh:'Solo los muslos',head:'Cabeza (desde 11 años)'}};
export function whoPlays(f:FieldFormat,lang:Lang){const es=lang==='es',a=(s:string)=>es?s.replace(' to ',' a ').replace(' and up',' en adelante').replace(' and ',' y '):s;
 const parts=[f.ages.us&&(es?`EE. UU.: ${a(f.ages.us)}`:`US: ${f.ages.us}`),f.ages.en&&(es?`Inglaterra: ${a(f.ages.en)}`:`England: ${f.ages.en}`)].filter(Boolean);
 return parts.length?parts.join('; '):(es?'Todas las edades':'All ages');}
export function moreRows(slug:string,id:string,lang:Lang):string[][]|null{
 const es=lang==='es';
 if(slug==='soccer-team-name-generator'&&id==='origins')return [...CLUB_WORDS.filter(c=>c.id!=='fc'&&c.id!=='city').map(c=>[es&&c.es!==c.en?`${c.es} (${c.en})`:c.en,NOTES[lang][c.id]]),[es?'Fire (fuego)':'Fire',NOTES[lang].fire]];
 if(slug==='soccer-practice-plan-generator'&&id==='lengths')return PLAN_AGES.map(a=>{const [lo,hi]=AGE_LENGTH[a],ok=PLAN_LENGTHS.filter(m=>m>=lo&&m<=hi);
  return [a,es?YEARS[a][1]:`ages ${YEARS[a][0]}`,lo===hi?`${lo} min`:(es?`${lo} a ${hi} min`:`${lo} to ${hi} min`),ok.join(es?' o ':' or ')+' min'];});
 if(slug==='youth-soccer-field-size-guide'&&id==='sizes')return FORMATS.map(f=>{const u=f.unit,g=f.goal.u==='ft'?'ft':'m';
  const goal=`${n(es,f.goalRec?.w??f.goal.w)} x ${n(es,f.goalRec?.h??f.goal.h)} ${g}${f.goalRec?(es?` (máx. ${n(es,f.goal.w)} x ${n(es,f.goal.h)})`:` (max ${f.goal.w} x ${f.goal.h})`):''}`;
  return [f.id,whoPlays(f,lang),`${f.length[0]}-${f.length[1]} x ${f.width[0]}-${f.width[1]} ${u}`,goal,f.ball==='futsal'?(es?'Balón de futsal (62-64 cm)':'Futsal ball (62-64 cm)'):(es?`Talla ${f.ball}`:`Size ${f.ball}`)];});
 if(slug==='youth-soccer-field-size-guide'&&id==='markings')return FORMATS.filter(f=>f.penaltyArea).map(f=>{const u=f.unit,d=(v?:number)=>v===undefined?'—':`${n(es,show(v,u,u))} ${u}`;
  return [f.id,`${n(es,f.penaltyArea!.depth)} x ${n(es,f.penaltyArea!.width)} ${u}`,f.goalArea?`${f.goalArea.depth} x ${f.goalArea.width} ${u}`:'—',d(f.penaltyMark)+(f.secondMark?(es?` (2.º punto ${f.secondMark} m)`:` (second mark ${f.secondMark} m)`):''),f.circle?(es?`${d(f.circle)} de radio`:`${d(f.circle)} radius`):'—'];});
 if(slug==='soccer-juggling-challenge'&&id==='levels')return VARIATIONS.map(v=>[VARIATION_NAME[lang][v],LEVELS[v].join(', ')]);
 return null;
}
