import type {FactIconKind} from '@/components/site/FactIcons';
import {FOOTER_HUBS} from './footerHubs';
import {LESSONS} from './lessons';
import {DRILLS} from './drills';
import {PLANS} from './plans';
import {FORMATIONS} from './formations';
import {POSITIONS} from './positions';
import {RULES} from './rules';
import {TERM_PAGES} from './terms';
import {TOOL_PAGES} from './tools/registry';
import {GAME_PAGES} from './games';
import {allWatchVideos} from './videos';
import {SITE_CARDS} from './cards';
import {SITE_FISH} from './fish';
import {SITE_EXHIBITS} from './exhibits';
import {BUILT_BOOKS,SITE_BOOKS,bookImage} from './books';
import {diagramUrl,formationImage} from './guides';
import {learnUrl} from './learnMedia';
/**
 * The Library at /library (owner, Nov 20 2026: one page that houses every item of the footer's link row). The items and their
 * paths are the footer's own list (lib/site/footerHubs.ts); this file adds the group, the icon, one plain line and a count.
 * Every count is the length of the data the linked page is built from, so it can never go stale; an item with no honest
 * count (age groups) has none. The Spanish hub (components/es/pages/LibraryEs.tsx) reuses the groups, icons and counts.
 */
export {LIBRARY_PATH} from './libraryPath';
export const LIBRARY_PUBLISHED='2026-11-20';
export type LibraryGroupId='game'|'train'|'play'|'collect';
export type LibraryItem={path:string;label:string;group:LibraryGroupId;icon:FactIconKind;count?:number};
/** What each count counts, by path (the same data the linked hub lists). */
export const LIBRARY_COUNTS:Readonly<Record<string,number>>={
 '/learn/lessons':LESSONS.length,'/learn/soccer-drills':DRILLS.length,'/learn/soccer-practice-plans':PLANS.length,'/learn/soccer-formations':FORMATIONS.length,
 '/learn/soccer-positions':POSITIONS.length,'/learn/soccer-rules':RULES.length,'/learn/soccer-terms':TERM_PAGES.length,
 '/tools':TOOL_PAGES.filter(t=>t.kind!=='hub'&&t.kind!=='printables').length,'/games':GAME_PAGES.length,'/videos':allWatchVideos().length,
 '/cards':SITE_CARDS.length,'/fish':SITE_FISH.length,'/exhibits':SITE_EXHIBITS.length,'/books':BUILT_BOOKS.length};
const PLACE:Readonly<Record<string,readonly [LibraryGroupId,FactIconKind]>>={
 '/learn/lessons':['game','quiz'],'/learn/soccer-rules':['game','law'],'/learn/soccer-positions':['game','shirt'],'/learn/soccer-formations':['game','lineup'],
 '/learn/soccer-terms':['game','tag'],'/learn/soccer-age-groups':['game','kid'],
 '/learn/soccer-drills':['train','cone'],'/learn/soccer-practice-plans':['train','clock'],'/tools':['train','whistle'],
 '/games':['play','ball'],'/videos':['play','eye'],
 '/cards':['collect','cards'],'/fish':['collect','fish'],'/exhibits':['collect','star'],'/books':['collect','book']};
export const LIBRARY_GROUP_ORDER:readonly LibraryGroupId[]=['game','train','play','collect'];
/** The reading order inside a group (the footer's order otherwise). */
const ORDER=Object.keys(PLACE);
export const LIBRARY_ITEMS:readonly LibraryItem[]=FOOTER_HUBS.map(([path,label])=>{
 const p=PLACE[path];if(!p)throw new Error(`lib/site/library.ts: the footer link ${path} has no place in the Library`);
 return {path,label,group:p[0],icon:p[1],count:LIBRARY_COUNTS[path]};
}).sort((a,b)=>ORDER.indexOf(a.path)-ORDER.indexOf(b.path));
export const libraryItemsIn=(g:LibraryGroupId)=>LIBRARY_ITEMS.filter(i=>i.group===g);

/** Each card's picture: the lead picture of the linked section (its hub's own diagram, screenshot or game still). Real sizes, so nothing shifts. */
export type LibraryPic={src:string;w:number;h:number;/** a 1200 x 630 diagram picture (pitch panel left, title right): the x where the pitch panel and its margin end, measured
 *  on the pictures Nov 20 2026 (430: the upright pitch of rules, terms, charts and formations; 629: the square drill grid). A small card shows
 *  exactly that panel, whole, and never a slice of the title beside it. */diagram?:number;/** object-position of a cropped photo thumb */pos?:string};
const F=(src:string,panel=430):LibraryPic=>({src,w:1200,h:630,diagram:panel}),D=(file:string,panel=430):LibraryPic=>F(diagramUrl(file),panel),still=(src:string,w:number,h:number):LibraryPic=>({src:learnUrl(src),w,h});
const islandVideo=allWatchVideos().find(v=>v.group==='island')??allWatchVideos()[0],firstBook=SITE_BOOKS.find(b=>BUILT_BOOKS.includes(b.id));
export const LIBRARY_PICS:Readonly<Record<string,LibraryPic|undefined>>={
 '/learn/lessons':still('/learn/slide_stories.webp',1600,900),'/learn/soccer-rules':D('offside-rule.png'),'/learn/soccer-positions':F(formationImage('11v11-4-3-3')),
 '/learn/soccer-formations':F(formationImage('7v7-2-3-1')),'/learn/soccer-terms':D('give-and-go-term.png'),'/learn/soccer-age-groups':D('soccer-age-groups-chart.png'),
 '/learn/soccer-drills':D('sharks-and-minnows-drill.png',629),'/learn/soccer-practice-plans':D('three-v-three-game-drill.png',629),'/tools':F(formationImage('9v9-3-2-3')),
 '/games':still('/learn/slide_arcade.webp',1600,900),'/videos':islandVideo?{src:islandVideo.posterSrc,w:islandVideo.pw??islandVideo.w,h:islandVideo.ph??islandVideo.h}:undefined,
 '/cards':{...still('/learn/player_cards.webp',780,1688),pos:'50% 38%'}/* the card binder (the wide clip's still showed the town square, no cards) */,'/fish':{src:'/games/shots/fishing-1.webp',w:960,h:540},'/exhibits':still('/learn/wide_museum.webp',1920,1080),
 '/books':firstBook?{src:bookImage(firstBook),w:960,h:600}:undefined};
/** The hero's two pictures: the island from above and a lesson on the pitch. */
export const LIBRARY_HERO={main:still('/learn/montage_m.webp',1280,720),inset:still('/learn/lesson_field_45_m.webp',720,900)};
/** The first card of each group is its large one. */
export const LIBRARY_FEATURED:Readonly<Record<LibraryGroupId,string>>={game:'/learn/lessons',train:'/learn/soccer-drills',play:'/games',collect:'/books'};

/** English words. `count` turns the number into the card's small line; `line` says what it is and who it is for. */
export type LibraryWords={title:string;description:string;h1:string;lead:string;crumb:string;play:string;playLine:string;playTitle:string;heroAlt:string;insetAlt:string;
 groups:Record<LibraryGroupId,{title:string;line:string}>;items:Record<string,{name:string;line:string;alt:string;count?:(n:number)=>string}>};
export const LIBRARY_EN:LibraryWords={
 title:'Futbol Island Library: Lessons, Drills, Rules, Games',
 description:'Everything Futbol Island teaches, on one page: free football lessons, rules, positions, drills, practice plans, games and story books for kids 7 to 12.',
 h1:'The Futbol Island library',crumb:'Library',
 lead:'Futbol Island teaches kids aged 7 to 12 how football (soccer) works: the rules, the positions, how a team keeps its shape and how to pass, defend and score. Parents and coaches get drills, practice plans and tools to print. Everything here is free to read and use.',
 play:'Play the game',heroAlt:'Futbol Island from above: a town square, a small caged pitch and players walking around',insetAlt:'The Island paths screen in the game: a path of lessons with tabs for 7v7, 9v9, 11v11 and Futsal',playTitle:'Play it on the island',playLine:'Every lesson here also plays out on a pitch in the game, with moving players and a short quiz. It is free and runs in the web browser.',
 groups:{
  game:{title:'Learn the game',line:'Start here. Short lessons and clear answers on how football works.'},
  train:{title:'Train',line:'For coaches and parents. Ready to use at practice or at home.'},
  play:{title:'Play and watch',line:'Free games that practise one idea each, and short clips of the island.'},
  collect:{title:'Collect and explore',line:'Things to find on the island, with a page to read about each one.'}},
 items:{
  '/learn/lessons':{alt:'A lesson in the game: two teams on a pitch with the coach line under it',name:'Lessons',line:'Short football lessons with a quiz. For kids who want to learn the game.',count:n=>`${n} lessons`},
  '/learn/soccer-rules':{alt:'Diagram of the offside rule',name:'Rules',line:'Offside, throw-ins, fouls and more, with a diagram. For kids, parents and new coaches.',count:n=>`${n} rules`},
  '/learn/soccer-positions':{alt:'Diagram of the eleven positions in a 4-3-3',name:'Positions',line:'What each player does and where they stand. For kids finding their place on the team.',count:n=>`${n} positions`},
  '/learn/soccer-formations':{alt:'Diagram of the 2-3-1 formation for 7v7',name:'Formations',line:'Team shapes for 7v7, 9v9, 11v11 and futsal, each with a diagram. For coaches and curious kids.',count:n=>`${n} formations`},
  '/learn/soccer-terms':{alt:'Diagram of a give-and-go',name:'Soccer terms',line:'Football words explained in one or two sentences. For anyone new to the game.',count:n=>`${n} soccer terms`},
  '/learn/soccer-age-groups':{alt:'Chart of soccer age groups',name:'Age groups',line:'What U6, U8, U10 and U12 mean and how the game grows with age. For parents.'},
  '/learn/soccer-drills':{alt:'Setup diagram of the Sharks and Minnows drill',name:'Drills',line:'Fun drills with a setup diagram and coaching points. For coaches and parents.',count:n=>`${n} drills`},
  '/learn/soccer-practice-plans':{alt:'Setup diagram of a 3v3 game',name:'Practice plans',line:'Full practices from warm-up to final game, ready to run. For volunteer coaches.',count:n=>`${n} practice plans`},
  '/tools':{alt:'Diagram of a 9v9 lineup in a 3-2-3',name:'Coach tools',line:'Lineup builders, playing time planners and field diagrams to print. For coaches.',count:n=>`${n} tools and printables`},
  '/games':{alt:'A match on a neon pitch in the Futbol Island arcade, Gold against Blue, seen from above',name:'Games',line:'Free arcade games about passing, shape and quick thinking. For kids.',count:n=>`${n} games`},
  '/videos':{alt:'The town square on Futbol Island from above, with a welcome message on the screen',name:'Videos',line:'Short clips of the games, the island and the lessons. For kids and parents who want a look first.',count:n=>`${n} videos`},
  '/cards':{alt:'A binder page of nine player cards in the game',name:'Player cards',line:'Football players to collect, each with a position and a play to learn. For kids.',count:n=>`${n} player cards`},
  '/fish':{alt:'Fishing from the pier on Futbol Island',name:'Fishbook',line:'Every fish you can catch from the island, and where it lives. For kids who like to explore.',count:n=>`${n} fish`},
  '/exhibits':{alt:'Inside the football museum on Futbol Island',name:'Museum',line:'Moments from football history, told simply. For kids and families.',count:n=>`${n} exhibits`},
  '/books':{alt:'An open pop-up story book',name:'Story books',line:'Pop-up story books about football players. For kids who like to read.',count:n=>`${n} story books`}}};
for(const i of LIBRARY_ITEMS)if(!LIBRARY_EN.items[i.path])throw new Error(`lib/site/library.ts: no words for ${i.path}`);

/** The page as the template reads it (components/site/LibraryPage.tsx): groups of cards, the first card of each group large. */
export type LibraryCard={href:string;name:string;line:string;alt:string;count?:string;pic?:LibraryPic;icon:FactIconKind};
export type LibraryGroup={id:string;title:string;line:string;cards:LibraryCard[]};
export function libraryCard(i:LibraryItem,w:LibraryWords['items'][string],href:string,n:number|undefined=i.count):LibraryCard{
 return {href,name:w.name,line:w.line,alt:w.alt,count:n!==undefined&&w.count?w.count(n):undefined,pic:LIBRARY_PICS[i.path],icon:i.icon};
}
const featuredFirst=(items:readonly LibraryItem[],g:LibraryGroupId)=>[...items].sort((a,b)=>Number(b.path===LIBRARY_FEATURED[g])-Number(a.path===LIBRARY_FEATURED[g]));
export const libraryItemsFeaturedFirst=(g:LibraryGroupId)=>featuredFirst(libraryItemsIn(g),g);
export const libraryGroups=():LibraryGroup[]=>LIBRARY_GROUP_ORDER.map(g=>({id:g,...LIBRARY_EN.groups[g],cards:libraryItemsFeaturedFirst(g).map(i=>libraryCard(i,LIBRARY_EN.items[i.path],i.path))}));
