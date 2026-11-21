import type {Rail,RailGroup,RailItem} from './railNav';
import {railId} from './railId';
import {LIBRARY_PATH} from './libraryPath';
import {toEs} from '@/lib/i18n/esPaths';
import {GAME_PAGES,GAMES_HUB} from './games';
import {FORMAT_LABEL,FORMAT_ORDER,LESSONS,lessonPath} from './lessons';
import {HUBS} from './hubs';
import {esHubLink} from '@/lib/i18n/es/hubs';
import {ES_LESSONS} from '@/lib/i18n/es/lessons';
import {PLANS,PLANS_HUB} from './plans';
import {ES_DRILL_HUBS,ES_PLANS} from '@/lib/i18n/es/drillsRegistry';
/**
 * Rails for the rest of the Library's page types (layout batch 3, Nov 20 2026; owner: "how are the internal page fixes coming
 * along? shouldn't they have side navs too?"). Same shape as lib/site/railNav.ts: the section hub and the Library pinned on top,
 * then the section's pages from the data, grouped as the data groups them. A set too big for one rail (lessons, cards, fish) lists
 * its groups and opens only the current page's group, so a rail stays under about 60 entries. A hub shows the same rail as its
 * pages, itself marked at the top (owner, Nov 20 2026: "soccer rules left nav is confusing. it still has the options from the main
 * library"); a big set's hub lists its groups.
 */
const LIB_EN:RailItem={href:LIBRARY_PATH,name:'Library'},LIB_ES:RailItem={href:toEs(LIBRARY_PATH),name:'Biblioteca'};
const lib=(es=false)=>es?LIB_ES:LIB_EN;
const rail=(label:string,hub:RailItem,groups:RailGroup[],es=false):Rail=>({label,up:[hub,lib(es)],groups:groups.filter(g=>g.items.length)});

/** /games/<slug>: all games, the Library, then the eleven games. */
export function gamesRail():Rail{
 return rail('Soccer games',{href:GAMES_HUB.path,name:'All games'},[{items:GAME_PAGES.map(g=>({href:g.path,name:g.name}))}]);
}

/** A lesson page (96 lessons, too many for one rail): its own format's lessons open (18 to 26), then the other formats (links to
 *  their part of the lessons index) and the lesson topic pages. */
export function lessonRail(format?:string):Rail{
 const others=FORMAT_ORDER.filter(f=>f!==format).map(f=>({href:`/learn/lessons#fmt-${f}`,name:`${FORMAT_LABEL[f]} lessons`}));
 return rail('Lessons',{href:'/learn/lessons',name:'All lessons'},[
  {title:format?`${FORMAT_LABEL[format as keyof typeof FORMAT_LABEL]??format} lessons`:undefined,items:LESSONS.filter(l=>l.format===format).map(l=>({href:lessonPath(l.id),name:l.title}))},
  {title:format?'More lessons':undefined,items:[...others,...HUBS.map(h=>({href:h.path,name:h.h1}))]}]);
}
export function lessonRailEs(format?:string):Rail{
 const idx=toEs('/learn/lessons'),w=(f:string)=>f==='futsal'?'futsal':FORMAT_LABEL[f as keyof typeof FORMAT_LABEL]??f;
 const hubs=HUBS.map(h=>esHubLink(h.path)).filter((x):x is NonNullable<typeof x>=>!!x).map(h=>({href:h.path,name:h.name}));
 return rail('Lecciones',{href:idx,name:'Todas las lecciones'},[
  {title:format?`Lecciones de ${w(format)}`:undefined,items:ES_LESSONS().filter(l=>l.format===format).map(l=>({href:l.esPath,name:l.title}))},
  {title:format?'Más lecciones':undefined,items:[...FORMAT_ORDER.filter(f=>f!==format).map(f=>({href:`${idx}#fmt-${f}`,name:`Lecciones de ${w(f)}`})),...hubs]}],true);
}

/** A practice plan (12): the plans in age order, each with its age in its name (the chip bar shows no group names). */
export function planRail():Rail{
 return rail('Practice plans',{href:PLANS_HUB.path,name:'All practice plans'},[{items:PLANS.map(p=>({href:p.path,name:p.name}))}]);
}
export function planRailEs():Rail{
 const h=ES_DRILL_HUBS.plans;
 return rail(h.crumb,{href:h.path,name:'Todos los planes'},[{items:ES_PLANS().map(p=>({href:p.esPath,name:p.name}))}],true);
}

/** A hub's rail mirrors the hub page (owner, Nov 20 2026: "the side nav always shows what is on the page you are looking at"): Overview
 *  (#top, the head) then the page's own cards and rows as in-page anchors, in the page's groups, with only the Library pinned on top
 *  (the hub is the page itself). Pass current="#top" to RailNav; LibraryMenuSpy lights the entry on screen and glides on a tap. */
export function hubRail(label:string,groups:RailGroup[],es=false):Rail{
 return {label,up:[lib(es)],groups:[{items:[{href:'#top',name:es?'Resumen':'Overview'}]},...groups.filter(g=>g.items.length)]};
}
/** A rail entry for a hub card or row given `ids={prefix}` (components/site/HubParts.tsx CardGrid, LinkList, DrillList). */
export const anchor=(prefix:string,path:string,name:string):RailItem=>({href:`#${railId(prefix,path)}`,name});
/** A rail entry for a section heading already on the page. */
export const sec=(id:string,name:string):RailItem=>({href:`#${id}`,name});
