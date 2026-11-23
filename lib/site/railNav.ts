import {RULES,RULES_HUB} from './rules';
import {TERM_PAGES,TERMS_HUB} from './terms';
import {DRILLS_HUB,SKILLS,drillsBySkill} from './drills';
import {POSITIONS,POSITIONS_HUB} from './positions';
import {FORMATIONS,FORMATIONS_HUB} from './formations';
import {LIBRARY_PATH} from './libraryPath';
import {libraryGroups} from './library';
import {toEs} from '@/lib/i18n/esPaths';
import {playLessonHref} from './playLinks';
import {PLAY_PATH} from './seo';
import {ES_FORMATIONS,ES_HUBS,ES_POSITIONS,ES_RULES,ES_TERMS} from '@/lib/i18n/es/registry';
import {ES_DRILLS,ES_DRILL_HUBS} from '@/lib/i18n/es/drillsRegistry';
/**
 * What the left rail (from 1280 px) and the chip bar (below it) list on the guide pages (layout batch 2, Nov 20 2026; owner: "fix
 * all the layout so it's easy to navigate"). An inner page lists the other pages of its section, in the data's own groups where it
 * has them (rules by hub group, drills by skill, formations by game size); a section hub lists the Library's groups and sections.
 * Every list comes from the data, so a new page shows up in the rail by itself.
 */
export type RailItem={href:string;name:string};
export type RailGroup={title?:string;items:RailItem[]};
export type Rail={label:string;up:RailItem[];groups:RailGroup[]};
export type RailFamily='rules'|'terms'|'drills'|'positions'|'formations';
const byName=(a:RailItem,b:RailItem)=>a.name.localeCompare(b.name);
const LIB_EN={href:LIBRARY_PATH,name:'Library'},LIB_ES={href:toEs(LIBRARY_PATH),name:'Biblioteca'};
const FORMAT_ORDER=['7v7','8v8','9v9','11v11','futsal'] as const;

export function sectionRail(family:RailFamily):Rail{
 switch(family){
  case 'rules':return {label:'Soccer rules',up:[{href:RULES_HUB.path,name:'All soccer rules'},LIB_EN],groups:RULES_HUB.groups.map(g=>({title:g.title,items:g.rules.map(r=>({href:r.path,name:r.name}))}))};
  case 'terms':return {label:'Soccer terms',up:[{href:TERMS_HUB.path,name:'All soccer terms'},LIB_EN],groups:[{items:TERM_PAGES.map(t=>({href:t.path,name:t.name})).sort(byName)}]};
  case 'drills':return {label:'Soccer drills',up:[{href:DRILLS_HUB.path,name:'All soccer drills'},LIB_EN],groups:SKILLS.map(s=>({title:s.name,items:drillsBySkill(s.id).map(d=>({href:d.path,name:d.name}))})).filter(g=>g.items.length)};
  case 'positions':return {label:'Soccer positions',up:[{href:POSITIONS_HUB.path,name:'All soccer positions'},LIB_EN],groups:[{items:POSITIONS.map(p=>({href:p.path,name:p.name}))}]};
  case 'formations':return {label:'Soccer formations',up:[{href:FORMATIONS_HUB.path,name:'All soccer formations'},LIB_EN],
   groups:FORMAT_ORDER.map(f=>({title:f==='futsal'?'Futsal':f,items:FORMATIONS.filter(x=>x.format===f).map(x=>({href:x.path,name:x.name}))})).filter(g=>g.items.length)};
 }
}
export function sectionRailEs(family:RailFamily):Rail{
 const H=ES_HUBS;
 switch(family){
  case 'rules':return {label:H.rules.crumb,up:[{href:H.rules.path,name:'Todas las reglas'},LIB_ES],groups:[{items:ES_RULES().map(r=>({href:r.esPath,name:r.name}))}]};
  case 'terms':return {label:H.terms.crumb,up:[{href:H.terms.path,name:'Todos los términos'},LIB_ES],groups:[{items:ES_TERMS().map(t=>({href:t.esPath,name:t.name})).sort(byName)}]};
  case 'drills':{const ds=ES_DRILLS(),skills=[...new Set(ds.map(d=>d.skillName))];
   return {label:ES_DRILL_HUBS.drills.crumb,up:[{href:ES_DRILL_HUBS.drills.path,name:'Todos los ejercicios'},LIB_ES],groups:skills.map(s=>({title:s,items:ds.filter(d=>d.skillName===s).map(d=>({href:d.esPath,name:d.name}))}))};}
  case 'positions':return {label:H.positions.crumb,up:[{href:H.positions.path,name:'Todas las posiciones'},LIB_ES],groups:[{items:ES_POSITIONS().map(p=>({href:p.esPath,name:p.name}))}]};
  case 'formations':{const fs=ES_FORMATIONS();return {label:H.formations.crumb,up:[{href:H.formations.path,name:'Todas las formaciones'},LIB_ES],
   groups:FORMAT_ORDER.map(f=>({title:f==='futsal'?'Fútbol sala':f==='8v8'?'Fútbol 8':f,items:fs.filter(x=>x.format===f).map(x=>({href:x.esPath,name:x.name}))})).filter(g=>g.items.length)};}
 }
}
/** The order of the sections in every Library menu (owner, Nov 20 2026: "put them in the best order you think for SEO"). The pages people
 * search for most come first (lessons, rules, terms, drills, positions, formations), then the coach pages, then play and watch, then the
 * collections, whose pages answer few football searches. Order in a menu weighs little with search engines; this mostly decides which
 * links a reader meets first. Spanish paths sort by their English path. */
export const RAIL_ORDER=['/learn/lessons','/learn/soccer-rules','/learn/soccer-terms','/learn/soccer-drills','/learn/soccer-positions','/learn/soccer-formations',
 '/learn/soccer-practice-plans','/tools','/learn/soccer-age-groups','/games','/videos','/cards','/books','/fish','/exhibits'] as const;
export function railOrder<T extends {href:string}>(items:T[]):T[]{
 const at=(h:string)=>{const i=(RAIL_ORDER as readonly string[]).indexOf(h.replace(/^\/es(?=\/)/,''));return i<0?RAIL_ORDER.length:i;};
 return items.map((x,i)=>[x,i] as const).sort((a,b)=>at(a[0].href)-at(b[0].href)||a[1]-b[1]).map(x=>x[0]);
}
/** A section hub's rail: the Library's groups and sections, so a reader can hop between sections. */
export function libraryRail(groups:{title:string;cards:{href:string;name:string}[]}[]=libraryGroups(),es=false):Rail{
 return {label:es?'Biblioteca':'Library',up:[es?LIB_ES:LIB_EN],groups:[{items:railOrder(groups.flatMap(g=>g.cards.map(c=>({href:c.href,name:c.name}))))}]};// one flat list, no group names (owner, Nov 20 2026: "ungroup the side nav")
}
/** The onward row under a guide page's H1 (lib/site/GuideParts.tsx OnwardRow): the page's own lesson in the game, and the Library. */
export const onwardFor=(lesson?:{id:string}|null,es=false)=>({play:{href:lesson?playLessonHref(lesson.id):PLAY_PATH,label:es?'Pruébalo en el juego':'Try it in the game'},
 library:es?{href:toEs(LIBRARY_PATH),name:'Todo en la Biblioteca'}:{href:LIBRARY_PATH,name:'Everything in the Library'}});
