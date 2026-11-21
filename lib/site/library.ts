import type {FactIconKind} from '@/components/site/FactIcons';
import {FOOTER_HUBS} from './footerHubs';
import {LESSONS,lessonPath} from './lessons';
import {DRILLS,SKILLS,drillsBySkill} from './drills';
import {PLANS} from './plans';
import {FORMATIONS} from './formations';
import {POSITIONS} from './positions';
import {RULES,RULES_HUB} from './rules';
import {TERM_PAGES} from './terms';
import {TOOL_PAGES} from './tools/registry';
import {GAME_PAGES} from './games';
import {VIDEO_GROUPS,allWatchVideos} from './videos';
import {SITE_CARDS} from './cards';
import {SITE_FISH} from './fish';
import {GALLERIES,SITE_EXHIBITS,exhibitPath} from './exhibits';
import {CARD_COLLECTIONS,FISH_COLLECTIONS} from './collections';
import {BUILT_BOOKS,SITE_BOOKS,bookImage,bookPath} from './books';
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
 groups:Record<LibraryGroupId,{title:string;line:string}>;items:Record<string,{name:string;line:string;alt:string;count?:(n:number)=>string;/** 1-2 more sentences on what is inside (checked against the pages, Nov 20 2026) */more:string;/** the section's one button */cta:(n?:number)=>string}>};
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
  '/learn/lessons':{alt:'A lesson in the game: two teams on a pitch with the coach line under it',name:'Lessons',line:'Short football lessons with a quiz. For kids who want to learn the game.',count:n=>`${n} lessons`,more:'Each lesson plays one idea on a pitch in three steps and says what the coach would say. There are lessons for 7v7, 9v9, 11v11 and futsal.',cta:n=>`See all ${n} lessons`},
  '/learn/soccer-rules':{alt:'Diagram of the offside rule',name:'Rules',line:'Offside, throw-ins, fouls and more, with a diagram. For kids, parents and new coaches.',count:n=>`${n} rules`,more:'Each page also says what the referee looks for and the common mix-ups. They are sorted into restarts, fouls, offside and the goalkeeper, and youth soccer.',cta:n=>`See all ${n} rules`},
  '/learn/soccer-positions':{alt:'Diagram of the eleven positions in a 4-3-3',name:'Positions',line:'What each player does and where they stand. For kids finding their place on the team.',count:n=>`${n} positions`,more:'Each page shows where the player stands, what they do with and without the ball, three habits to practise and their shirt number.',cta:n=>`See all ${n} positions`},
  '/learn/soccer-formations':{alt:'Diagram of the 2-3-1 formation for 7v7',name:'Formations',line:'Team shapes for 7v7, 9v9, 11v11 and futsal, each with a diagram. For coaches and curious kids.',count:n=>`${n} formations`,more:'Each page shows who plays where, the strengths and weak spots of the shape, and how it moves when your team has the ball.',cta:n=>`See all ${n} formations`},
  '/learn/soccer-terms':{alt:'Diagram of a give-and-go',name:'Soccer terms',line:'Football words explained in one or two sentences. For anyone new to the game.',count:n=>`${n} soccer terms`,more:'Each word has a diagram, how to do it, the common mistakes and how it works in 7v7, 9v9, 11v11 and futsal.',cta:n=>`See all ${n} soccer terms`},
  '/learn/soccer-age-groups':{alt:'Chart of soccer age groups',name:'Age groups',line:'What U6, U8, U10 and U12 mean and how the game grows with age. For parents.',more:'A chart for the 2026-27 season shows each age group by birth year, how to find your child’s group and which size of game each one plays.',cta:()=>'Open the age group chart'},
  '/learn/soccer-drills':{alt:'Setup diagram of the Sharks and Minnows drill',name:'Drills',line:'Fun drills with a setup diagram and coaching points. For coaches and parents.',count:n=>`${n} drills`,more:'Each one also says how to run it and how to make it easier or harder. They are sorted by skill, from dribbling to goalkeeping.',cta:n=>`Open the ${n} drills`},
  '/learn/soccer-practice-plans':{alt:'Setup diagram of a 3v3 game',name:'Practice plans',line:'Full practices from warm-up to final game, ready to run. For volunteer coaches.',count:n=>`${n} practice plans`,more:'Each plan is a timed practice with the equipment, coach notes and what to do if it is going badly. There are plans for U6, U8, U10 and U12.',cta:n=>`Open the ${n} practice plans`},
  '/tools':{alt:'Diagram of a 9v9 lineup in a 3-2-3',name:'Coach tools',line:'Lineup builders, playing time planners and field diagrams to print. For coaches.',count:n=>`${n} tools and printables`,more:'They are free, need no account and keep your players’ names on your own device. A scanning trainer helps players learn to look around.',cta:()=>'Open the coach tools'},
  '/games':{alt:'A match on a neon pitch in the Futbol Island arcade, Gold against Blue, seen from above',name:'Games',line:'Free arcade games about passing, shape and quick thinking. For kids.',count:n=>`${n} games`,more:'Each game has its own page with how to play on a phone or a computer, the rules and the football idea it teaches.',cta:n=>`See all ${n} games`},
  '/videos':{alt:'The town square on Futbol Island from above, with a welcome message on the screen',name:'Videos',line:'Short clips of the games, the island and the lessons. For kids and parents who want a look first.',count:n=>`${n} videos`,more:'Each clip has its own page, so you can see a game or a lesson before you play it.',cta:n=>`Watch the ${n} videos`},
  '/cards':{alt:'A binder page of nine player cards in the game',name:'Player cards',line:'Football players to collect, each with a position and a play to learn. For kids.',count:n=>`${n} player cards`,more:'Each card also lists the player’s strengths. Collections gather the strikers, the goalkeepers, women’s football legends, World Cup winners and more.',cta:n=>`See all ${n} player cards`},
  '/fish':{alt:'Fishing from the pier on Futbol Island',name:'Fishbook',line:'Every fish you can catch from the island, and where it lives. For kids who like to explore.',count:n=>`${n} fish`,more:'Collections gather the sharks, the crabs and shellfish, and the octopuses, squid and rays, and one page lists what to catch at each fishing spot.',cta:()=>'Open the Fishbook'},
  '/exhibits':{alt:'Inside the football museum on Futbol Island',name:'Museum',line:'Moments from football history, told simply. For kids and families.',count:n=>`${n} exhibits`,more:'The exhibits sit in galleries such as the Laws of the Game, World Cup history, balls and kits, and legends, each with the year it happened.',cta:n=>`See all ${n} exhibits`},
  '/books':{alt:'An open pop-up story book',name:'Story books',line:'Pop-up story books about football players. For kids who like to read.',count:n=>`${n} story books`,more:'Each book tells one player’s story in short chapters, and you can read it right on the page. Its sources are listed at the end.',cta:n=>`Read the ${n} story books`}}};
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

/**
 * The page's sections (Nov 20 2026 night; owner: "each of the side nav should smooth scroll the user down to that section. each
 * section is a little information about that section then cta to drill into internal page"). One section per item, in the menu's
 * order (lib/site/railNav.ts RAIL_ORDER): the card's picture, name, count and line, the words' `more`, a few example pages and one
 * button into the section. The examples come from the section's own data, picked the same way every build (the first page of each
 * of the hub's groups where it has them, else the first pages in the hub's order), so they are always real pages.
 */
export type LibraryLink={href:string;name:string};
export type LibrarySection=LibraryCard&{id:string;more:string;cta:string;examples:LibraryLink[]};
/** The section's anchor on the Library (#rules, #story-books ...): the same in both languages. */
export const LIBRARY_IDS:Readonly<Record<string,string>>={'/learn/lessons':'lessons','/learn/soccer-rules':'rules','/learn/soccer-terms':'soccer-terms','/learn/soccer-drills':'drills',
 '/learn/soccer-positions':'positions','/learn/soccer-formations':'formations','/learn/soccer-practice-plans':'practice-plans','/tools':'coach-tools','/learn/soccer-age-groups':'age-groups',
 '/games':'games','/videos':'videos','/cards':'player-cards','/books':'story-books','/fish':'fishbook','/exhibits':'museum'};
const firstOfEach=<T,K>(xs:readonly T[],key:(x:T)=>K,n=4)=>xs.filter((x,i)=>xs.findIndex(y=>key(y)===key(x))===i).slice(0,n);
const CARD_PICKS=['strikers','goalkeepers','women','world-cup-winners'];
/** The example pages of a section (English names and paths). */
export function libraryExamples(path:string):LibraryLink[]{
 switch(path){
  case '/learn/lessons':return LESSONS.slice(0,4).map(x=>({href:lessonPath(x.id),name:x.title}));
  case '/learn/soccer-rules':return RULES_HUB.groups.slice(0,4).map(g=>({href:g.rules[0].path,name:g.rules[0].name}));
  case '/learn/soccer-terms':return TERM_PAGES.slice(0,4).map(x=>({href:x.path,name:x.name}));
  case '/learn/soccer-drills':return SKILLS.map(k=>drillsBySkill(k.id)[0]).filter(Boolean).slice(0,4).map(x=>({href:x.path,name:x.name}));
  case '/learn/soccer-positions':return POSITIONS.slice(0,4).map(x=>({href:x.path,name:x.name}));
  case '/learn/soccer-formations':return firstOfEach(FORMATIONS,x=>x.format).map(x=>({href:x.path,name:x.name}));
  case '/learn/soccer-practice-plans':return firstOfEach(PLANS,x=>x.age).map((a,k)=>{const of=PLANS.filter(x=>x.age===a.age),x=of[k%of.length];return {href:x.path,name:x.name};});// one plan per age, a different theme each
  case '/tools':return firstOfEach(TOOL_PAGES.filter(t=>t.kind!=='hub'&&t.kind!=='printables'),x=>x.kind).map(x=>({href:x.path,name:x.name}));
  case '/learn/soccer-age-groups':return [['chart','The age group chart'],['how','Find your child’s age group'],['formats','Which game each age group plays'],['faq','Questions about age groups']].map(([id,name])=>({href:`${path}#${id}`,name}));
  case '/games':return GAME_PAGES.slice(0,4).map(x=>({href:x.path,name:x.name}));
  case '/videos':{const vs=allWatchVideos();return VIDEO_GROUPS.map(g=>vs.find(v=>v.group===g.id)).filter(v=>!!v).map(v=>({href:v!.path,name:v!.title}));}
  case '/cards':return CARD_PICKS.map(s=>CARD_COLLECTIONS.find(c=>c.slug===s)).filter(c=>!!c).map(c=>({href:c!.path,name:c!.crumb}));
  case '/fish':return FISH_COLLECTIONS.slice(0,4).map(c=>({href:c.path,name:c.crumb}));
  case '/exhibits':return GALLERIES.slice(0,4).map(g=>SITE_EXHIBITS.find(e=>e.gallery===g.id)).filter(e=>!!e).map(e=>({href:exhibitPath(e!.id),name:e!.title}));
  case '/books':return SITE_BOOKS.filter(b=>BUILT_BOOKS.includes(b.id)).slice(0,4).map(b=>({href:bookPath(b.id),name:b.player}));
 }
 return [];
}
export function librarySection(i:LibraryItem,w:LibraryWords['items'][string],href:string,n:number|undefined,examples:LibraryLink[]):LibrarySection{
 return {...libraryCard(i,w,href,n),id:LIBRARY_IDS[i.path],more:w.more,cta:w.cta(n),examples};
}
/** The English sections, in the footer's order (the page sorts them into the menu's order). */
export const librarySections=():LibrarySection[]=>LIBRARY_ITEMS.map(i=>librarySection(i,LIBRARY_EN.items[i.path],i.path,i.count,libraryExamples(i.path)));
for(const i of LIBRARY_ITEMS)if(!LIBRARY_IDS[i.path])throw new Error(`lib/site/library.ts: no section id for ${i.path}`);
