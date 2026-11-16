import {COMPARISONS} from './comparisons';
import {DRILLS} from './drills';
import {FORMATIONS} from './formations';
import {GUIDE_HUBS} from './guides';
import {HUBS} from './hubs';
import {LESSONS,lessonPath} from './lessons';
import {PLANS} from './plans';
import {POSITIONS} from './positions';
import {RULES} from './rules';
import {GLOSSARY,TERMS_HUB_PATH} from './terms';
import {TOOL_HUBS} from './tools/registry';
/**
 * /learn search (seo-extras, Nov 15 2026): one small JSON index of the reading pages, built at build time from the same
 * registries the pages are made from (served static at /learn/search-index.json; read by components/site/LearnSearch.tsx).
 * Each entry: t = type (the result group), n = name, p = path, s = the answer snippet (one sentence, <= 160 chars), k = extra
 * words that should find it (format, shape, also-known-as). No external service; nothing about the reader is ever sent.
 */
import {type SearchEntry} from './searchCore';
export * from './searchCore';
const cut=(x:string|undefined,max=160)=>{const s=(x??'').replace(/\s+/g,' ').trim();if(s.length<=max)return s;const i=s.lastIndexOf(' ',max-1);return s.slice(0,i>60?i:max-1)+'…';};
const cap=(x:string)=>x?x[0].toUpperCase()+x.slice(1):x;
export function buildSearchIndex():SearchEntry[]{
 const out:SearchEntry[]=[];
 const add=(e:SearchEntry)=>{if(e.n&&e.p&&!out.some(x=>x.p===e.p&&x.t===e.t))out.push({...e,s:cut(e.s),...(e.k?{k:cut(e.k,120)}:{})});};
 for(const r of RULES)add({t:'Rule',n:r.name,p:r.path,s:r.answer,k:r.law});
 for(const g of GLOSSARY)add({t:'Term',n:g.term,p:g.to&&g.to.startsWith(TERMS_HUB_PATH+'/')?g.to:`${TERMS_HUB_PATH}#${g.id}`,s:g.def});
 for(const p of POSITIONS)add({t:'Position',n:p.name,p:p.path,s:p.answer,k:[p.short,p.numberLine].filter(Boolean).join(' ')});
 for(const f of FORMATIONS)add({t:'Formation',n:`${f.name} formation`,p:f.path,s:f.answer,k:`${f.format} ${f.shape} ${f.best}`});
 for(const d of DRILLS)add({t:'Drill',n:d.name,p:d.path,s:d.answer,k:`${d.agesText} ${d.equipment}`});
 for(const p of PLANS)add({t:'Plan',n:p.h1,p:p.path,s:p.lead,k:`${p.minutes} minutes ${p.goal}`});
 for(const l of LESSONS)add({t:'Lesson',n:`${l.title} (${l.formatLabel})`,p:lessonPath(l.id),s:l.concept,k:[l.formatLabel,l.category,l.chapter].filter(Boolean).join(' ')});
 for(const h of HUBS)add({t:'Guide',n:h.h1,p:h.path,s:h.lead,k:h.blurb});
 for(const g of GUIDE_HUBS)add({t:'Guide',n:cap(g.name),p:g.path,s:g.description,k:g.blurb});
 for(const c of COMPARISONS)add({t:'Guide',n:c.h1,p:c.path,s:c.answer});
 for(const t of TOOL_HUBS)add({t:'Guide',n:cap(t.name),p:t.path,s:t.description,k:t.blurb});
 return out;
}
