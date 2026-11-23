import {DRILLS,drillLine} from '../drills';
import {DRILLS_ES} from '@/lib/i18n/es/drills';
import {parseTime,type CatalogDrill} from './practicePlan';
/**
 * The site's drills as the practice plan generator's catalog (Nov 22 2026): slug, name, skill, ages, the time range written on
 * the drill's own page, and its one-line summary (Spanish words from lib/i18n/es/drills.ts for the Spanish page). The generator
 * (./practicePlan.ts) is pure and takes this list as an argument; the /coach app can pass the same list. Every slug is a real
 * drill page under /learn/soccer-drills, and every one has a Spanish twin.
 */
const second=(s:string)=>((s.match(/[^.!?]+[.!?]+(?=\s|$)/g)||[s])[1]??s).trim();
export const PLAN_CATALOG:readonly CatalogDrill[]=DRILLS.map(d=>{const [minMin,maxMin]=parseTime(d.time);return {slug:d.slug,name:d.name,skill:d.skill,ages:d.ages,minMin,maxMin,line:drillLine(d)};});
export const PLAN_CATALOG_ES:readonly CatalogDrill[]=PLAN_CATALOG.map(d=>{const e=DRILLS_ES[d.slug];if(!e)throw new Error(`practice plan: drill ${d.slug} has no Spanish words`);return {...d,name:e.name,line:second(e.answer)};});
export const planCatalog=(lang:'en'|'es')=>lang==='es'?PLAN_CATALOG_ES:PLAN_CATALOG;
