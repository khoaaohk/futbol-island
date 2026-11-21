import type {Rail,RailGroup,RailItem} from './railNav';
import {LIBRARY_PATH} from './libraryPath';
import {toEs} from '@/lib/i18n/esPaths';
import {GAME_PAGES,GAMES_HUB} from './games';
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
