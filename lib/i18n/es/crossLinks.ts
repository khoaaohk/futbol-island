import {ruleCrossLinks,termCrossLinks,type XLink} from '@/lib/site/crossLinks';
import {LINEUP_PAGES,PLANNER_PAGES} from '@/lib/site/tools/registry';
import {PRINTABLES_HUB_PATH,PRINT_FILES} from '@/lib/site/tools/printables';
import {hasEs,toEs} from '../esPaths';
import {ES_RULES,ES_TERMS} from './registry';
import {LINEUP_PAGES_ES,PLANNER_PAGES_ES,PRINTABLES_HUB_ES} from './tools';
import {NEW_TOOLS_ES} from './newTools';
import {MORE_TOOLS_ES} from './moreTools';
/**
 * The cross-cluster links of lib/site/crossLinks.ts on the Spanish pages (SEO leftovers, Nov 20 2026). The English tables stay
 * the one source: each English link is swapped for its Spanish page, with the words of that Spanish page's own record (its h1,
 * its name, its one-line summary). A target with no Spanish page gives no link (a Spanish guide never links an English page here),
 * so a new English term or rule joins the Spanish lists on the day its Spanish page ships.
 */
function esCross(x:XLink):XLink|null{
 if(!hasEs(x.path))return null;
 const r=ES_RULES().find(y=>y.path===x.path);if(r)return {path:r.esPath,name:r.h1,line:`${r.law}, con diagrama`};
 const t=ES_TERMS().find(y=>y.path===x.path);if(t)return {path:t.esPath,name:`${t.name} (término de fútbol)`,line:t.short};
 const l=LINEUP_PAGES.find(y=>y.path===x.path),le=l&&LINEUP_PAGES_ES[l.slug];if(le)return {path:toEs(x.path),name:le.h1,line:le.blurb};
 const p=PLANNER_PAGES.find(y=>y.path===x.path),pe=p&&PLANNER_PAGES_ES[p.slug];if(pe)return {path:toEs(x.path),name:pe.h1,line:pe.blurb};
 const nt=({...NEW_TOOLS_ES,...MORE_TOOLS_ES})[x.path.replace('/tools/','')];if(nt&&x.path.startsWith('/tools/'))return {path:toEs(x.path),name:nt.h1,line:nt.blurb};/* Nov 22 2026 */
 if(x.path===PRINTABLES_HUB_PATH){const h=PRINTABLES_HUB_ES(PRINT_FILES.length);return {path:toEs(x.path),name:h.h1,line:h.blurb};}
 return null;
}
const all=(l:XLink[])=>l.map(esCross).filter((x):x is XLink=>!!x);
/** A Spanish rule page's links out of its family: its coach tool, its terms, a sister rule. */
export const esRuleCrossLinks=(slug:string):XLink[]=>all(ruleCrossLinks(slug));
/** A Spanish term page's links out of its family: its rule (or two) and, for words about shape or game time, a coach tool. */
export const esTermCrossLinks=(slug:string):XLink[]=>all(termCrossLinks(slug));
