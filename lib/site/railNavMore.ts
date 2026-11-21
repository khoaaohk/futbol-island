import type {Rail,RailGroup,RailItem} from './railNav';
import {LIBRARY_PATH} from './libraryPath';
import {toEs} from '@/lib/i18n/esPaths';
import {GAME_PAGES,GAMES_HUB} from './games';
import {FORMAT_LABEL,FORMAT_ORDER,LESSONS,lessonPath} from './lessons';
import {HUBS} from './hubs';
import {esHubLink} from '@/lib/i18n/es/hubs';
import {ES_LESSONS} from '@/lib/i18n/es/lessons';
/**
 * Rails for the rest of the Library's page types (layout batch 3, Nov 20 2026; owner: "how are the internal page fixes coming
 * along? shouldn't they have side navs too?"). Same shape as lib/site/railNav.ts: the section hub and the Library pinned on top,
 * then the section's pages from the data, grouped as the data groups them. A set too big for one rail (lessons, cards, fish) lists
 * its groups and opens only the current page's group, so a rail stays under about 60 entries. Hubs use libraryRail().
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
export function lessonRail(format:string):Rail{
 const others=FORMAT_ORDER.filter(f=>f!==format).map(f=>({href:`/learn/lessons#fmt-${f}`,name:`${FORMAT_LABEL[f]} lessons`}));
 return rail('Lessons',{href:'/learn/lessons',name:'All lessons'},[
  {title:`${FORMAT_LABEL[format as keyof typeof FORMAT_LABEL]??format} lessons`,items:LESSONS.filter(l=>l.format===format).map(l=>({href:lessonPath(l.id),name:l.title}))},
  {title:'More lessons',items:[...others,...HUBS.map(h=>({href:h.path,name:h.h1}))]}]);
}
export function lessonRailEs(format:string):Rail{
 const idx=toEs('/learn/lessons'),w=(f:string)=>f==='futsal'?'futsal':FORMAT_LABEL[f as keyof typeof FORMAT_LABEL]??f;
 const hubs=HUBS.map(h=>esHubLink(h.path)).filter((x):x is NonNullable<typeof x>=>!!x).map(h=>({href:h.path,name:h.name}));
 return rail('Lecciones',{href:idx,name:'Todas las lecciones'},[
  {title:`Lecciones de ${w(format)}`,items:ES_LESSONS().filter(l=>l.format===format).map(l=>({href:l.esPath,name:l.title}))},
  {title:'Más lecciones',items:[...FORMAT_ORDER.filter(f=>f!==format).map(f=>({href:`${idx}#fmt-${f}`,name:`Lecciones de ${w(f)}`})),...hubs]}],true);
}
