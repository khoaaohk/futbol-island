import {GLOSSARY,TERMS_HUB_PATH} from '@/lib/site/terms';
import {HUBS} from '@/lib/site/hubs';
import type {SearchEntry} from '@/lib/site/searchCore';
import {hasEs,toEn,toEs} from '../esPaths';
import {ES_COMPARISONS,ES_FORMATIONS,ES_HUBS,ES_POSITIONS,ES_RULES,ES_TERMS} from './registry';
import {TERMS_HUB_ES} from './terms';
import {ES_LESSONS} from './lessons';
import {esHubLink} from './hubs';
import {TOOLS_HUB_ES} from './tools';
/**
 * The Spanish guide search index (Spanish round D, Nov 16 2026): the same shape and rules as lib/site/searchIndex.ts, built from
 * the Spanish registries, so /es/learn?q= finds Spanish names and answers and links only /es pages. Served at
 * /es/search-index.json (app/es/search-index.json/route.ts). Families without Spanish pages yet (drills, practice plans)
 * join here when they land: add them below (only paths where hasEs() is true).
 */
const cut=(x:string|undefined,max=160)=>{const s=(x??'').replace(/\s+/g,' ').trim();if(s.length<=max)return s;const i=s.lastIndexOf(' ',max-1);return s.slice(0,i>60?i:max-1)+'…';};
const cap=(x:string)=>x?x[0].toUpperCase()+x.slice(1):x;
export function buildSearchIndexEs():SearchEntry[]{
 const out:SearchEntry[]=[];
 const add=(e:SearchEntry)=>{if(e.n&&e.p&&hasEs(toEn(e.p.replace(/#.*$/,''))??'')&&!out.some(x=>x.p===e.p&&x.t===e.t))out.push({...e,s:cut(e.s),...(e.k?{k:cut(e.k,120)}:{})});};
 for(const r of ES_RULES())add({t:'Rule',n:r.name,p:r.esPath,s:r.answer,k:r.law});
 const terms=ES_TERMS();
 for(const g of GLOSSARY){const e=TERMS_HUB_ES.glossary[g.id];if(!e)continue;const page=g.to&&g.to.startsWith(TERMS_HUB_PATH+'/')&&hasEs(g.to)?toEs(g.to):`${toEs(TERMS_HUB_PATH)}#${g.id}`;
  add({t:'Term',n:e.term,p:page,s:e.def,k:terms.find(t=>t.path===g.to)?.also});}
 for(const p of ES_POSITIONS())add({t:'Position',n:cap(p.name),p:p.esPath,s:p.answer,k:[p.short,p.numberLine].filter(Boolean).join(' ')});
 for(const f of ES_FORMATIONS())add({t:'Formation',n:`Formación ${f.name}`,p:f.esPath,s:f.answer,k:`${f.format} ${f.shape} ${f.best}`});
 for(const l of ES_LESSONS())add({t:'Lesson',n:`${l.title} (${l.formatLabel})`,p:l.esPath,s:l.concept,k:[l.formatLabel,l.categoryEs,l.chapterEs].filter(Boolean).join(' ')});
 for(const h of HUBS){const x=esHubLink(h.path);if(x)add({t:'Guide',n:x.name,p:x.path,s:x.blurb});}
 for(const h of [ES_HUBS.rules,ES_HUBS.terms,ES_HUBS.positions,ES_HUBS.formations])add({t:'Guide',n:h.h1,p:h.path,s:h.description,k:h.blurb});
 for(const t of [TOOLS_HUB_ES])add({t:'Guide',n:t.h1,p:toEs('/tools'),s:t.description,k:t.crumb});
 for(const c of ES_COMPARISONS())add({t:'Guide',n:c.h1,p:c.esPath,s:c.answer});
 return out;
}
