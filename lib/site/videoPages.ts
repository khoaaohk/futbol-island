import {CHARTS} from './sizes';
import {exhibitById,exhibitPath,GALLERIES,SITE_EXHIBITS} from './exhibits';
import {GAME_FOOT,GAME_PAGES,GAMES_HUB,gameById,type GameId} from './games';
import {DEFINITION,HUB_COUNTS,hubBySlug,SAFE_GUIDE} from './hubs';
import {SAFE_FACTS,SPONSOR_BOARDS_LINE} from './safety';
import {SITE_FISH} from './fish';
import {GUIDE_VIDEOS} from './guideVideos';
import {allWatchVideos,type WatchVideo} from './videos';
/**
 * What a watch page says and links below the clip's own words (SEO phase 2, Nov 20 2026). The 24 watch pages had 61 to 82
 * unique words and two links out, so they read as thin next to the game pages. Nothing here is written per page: the words
 * are the game's own record (lib/site/games.ts: lead, skill, the first phone control, the first rule), the guide clip's own
 * caption (lib/site/guideVideos.ts) or the site's one-line definition, and every link takes its name and line from the page
 * it points to. Kept apart from lib/site/videos.ts so the pages that only list clips do not load the museum's text.
 * A link target that does not exist throws at build time. No key moments: the clips are 5 to 10 second loops with no
 * measured time marks, so none are claimed. Tests: tests/seo-media.cjs.
 */
export type WatchLink={path:string;name:string;line:string};
export type WatchAbout={title:string;lines:{label?:string;text:string}[]};
const lower=(s:string)=>s.charAt(0).toLowerCase()+s.slice(1);
const gameOf=(v:WatchVideo)=>GAME_PAGES.find(g=>g.id===v.key);
const PLAY:WatchLink={path:'/play',name:'Play Futbol Island',line:'The whole island, free in the browser'};
const HUB:WatchLink={path:GAMES_HUB.path,name:GAMES_HUB.h1,line:GAMES_HUB.blurb};
const LESSONS:WatchLink={path:'/learn/lessons',name:'Football lessons and quizzes for kids',line:'Every lesson, by team size'};
const SAFE:WatchLink={path:SAFE_GUIDE.path,name:SAFE_GUIDE.h1,line:'A parents’ guide: no accounts and no open chat'};
const game=(id:GameId):WatchLink=>{const g=gameById(id);return {path:g.path,name:`${g.name}: ${lower(g.h1.split(':')[0])}`,line:g.blurb};};
const hub=(slug:string):WatchLink=>{const h=hubBySlug(slug);if(!h)throw new Error(`videoPages: hub ${slug} does not exist`);return {path:h.path,name:h.h1,line:h.blurb};};
const exhibit=(id:string):WatchLink=>{const e=exhibitById(id);if(!e)throw new Error(`videoPages: exhibit ${id} does not exist`);return {path:exhibitPath(e.id),name:e.h1,line:`${e.galleryTitle} · ${e.year}`};};
const chart=(slug:string):WatchLink=>{const c=CHARTS.find(x=>x.slug===slug);if(!c)throw new Error(`videoPages: chart ${slug} does not exist`);return {path:c.path,name:c.h1,line:c.blurb};};
const FISHBOOK:WatchLink={path:'/fish',name:'Fishbook',line:'Every sea animal you can catch, and its football club'};
const SPOTS:WatchLink={path:'/fish/spots',name:'Fishing spots on Futbol Island',line:'Which animals bite at each spot'};
const MUSEUM:WatchLink={path:'/exhibits',name:'Football history museum',line:'Every case in the museum, as a page to read'};
/** Island clip -> the pages about the place it shows. */
const ISLAND_LINKS:Record<string,()=>WatchLink[]>={
 walk:()=>[LESSONS,SAFE],fly:()=>[LESSONS,SAFE],stadium:()=>[exhibit('stadiums'),chart('soccer-field-size-by-age')],fishing:()=>[FISHBOOK,SPOTS],
 matchmix:()=>[hub('7v7-9v9-11v11'),chart('soccer-field-size-by-age')],
 match:()=>[hub('7v7-9v9-11v11'),hub('passing-and-support')],kitstudio:()=>[exhibit('shirts'),exhibit('boots')],museum:()=>[MUSEUM,exhibit('laws-1863'),exhibit('worldcup-1930')],
 room:()=>[game('kitrush'),game('pinball')],plaza:()=>[SAFE,LESSONS],
};
const GUIDE_LINKS:Record<string,()=>WatchLink[]>={
 pass_puzzles:()=>[hub('passing-and-support'),game('puzzle'),LESSONS],quiz_question:()=>[hub('soccer-quiz-for-kids'),LESSONS],lesson_field:()=>[LESSONS,hub('soccer-quiz-for-kids'),hub('football-rules-for-kids')],
};
/* Nov 20 2026 (checked): the nine island clips all carried one shared sentence and the three lesson clips another, so the
 * pages read as copies of each other. Each clip now takes its lines from the record of the place it shows: the safety facts
 * (lib/site/safety.ts, word for word), the counts of lessons, quizzes, fish, museum cases and arcade machines, and the
 * museum case on shirts. No sentence is on two watch pages (tests/seo-media.cjs). */
const safe=(title:string)=>{const f=SAFE_FACTS.find(x=>x.title===title);if(!f)throw new Error(`videoPages: safety fact ${title} does not exist`);return f.text;};
const hubLine=(slug:string)=>{const h=hub(slug);return `${h.name}: ${lower(h.line)}.`;};
const list=(l:string[])=>`${l.slice(0,-1).join(', ')} and ${l[l.length-1]}`;
const ISLAND_ABOUT:Record<string,()=>string[]>={
 walk:()=>[DEFINITION,safe('No accounts')],fly:()=>[safe('Free, with no pop-up or tracking ads')],plaza:()=>[safe('No open chat'),safe('Grown-ups stay in charge')],
 stadium:()=>[SPONSOR_BOARDS_LINE],fishing:()=>[`The Fishbook has a page for each of the ${SITE_FISH.length} sea animals you can catch on the island.`],
 matchmix:()=>[hubLine('7v7-9v9-11v11'),hubLine('futsal-for-kids')],
 match:()=>[hubLine('passing-and-support')],kitstudio:()=>exhibitById('shirts')!.facts.slice(1,3),
 museum:()=>{const g=GALLERIES.filter(x=>SITE_EXHIBITS.some(e=>e.gallery===x.id));return [`The museum has ${SITE_EXHIBITS.length} cases in ${g.length} galleries: ${list(g.map(x=>x.title))}.`];},
 room:()=>[`The arcade room has ${GAME_PAGES.length} machines: ${list(GAME_PAGES.map(x=>x.name))}.`],
};
const GUIDE_ABOUT:Record<string,()=>string>={
 pass_puzzles:()=>`Futbol Island has ${hub('passing-and-support').line.replace('lessons on','lessons on passing:')}.`,
 quiz_question:()=>`Futbol Island has ${HUB_COUNTS.quizzes} quizzes with ${HUB_COUNTS.questions} questions.`,
 lesson_field:()=>`Futbol Island has ${HUB_COUNTS.lessons} football lessons for 7v7, 9v9, 11v11 and futsal.`,
};
const uniq=(l:WatchLink[],skip:string[])=>l.filter((x,i,a)=>!skip.includes(x.path)&&a.findIndex(y=>y.path===x.path)===i);
/** The links under a clip: the game or guide it comes from, the matching learn pages, the games list and the island. */
export function watchLinks(v:WatchVideo):WatchLink[]{
 const g=gameOf(v);
 const own=g?[{path:g.path,name:`How to play ${g.name}`,line:g.blurb},...g.guides.slice(0,2)]
  :v.key==='hero'?[game('kitrush'),game('snake'),game('airhockey')]
  :v.group==='island'?(ISLAND_LINKS[v.key]?.()??[]):(GUIDE_LINKS[v.key]?.()??[]);
 return uniq([...own,HUB,PLAY],[v.path]);
}
/** The text under a clip's own words, from the record of the thing it shows. */
export function watchAbout(v:WatchVideo):WatchAbout{
 const g=gameOf(v);
 if(g)return {title:`About ${g.name}`,lines:[{text:g.lead},{label:'The football skill',text:`${g.skill}.`},{label:'On a phone',text:g.phone[0]},{label:'The first rule',text:g.rules[0]}]};
 if(v.key==='hero')return {title:'About the arcade games',lines:[{text:GAMES_HUB.lead},{text:GAMES_HUB.intro[1]}]};
 const guide=GUIDE_VIDEOS.find(x=>x.key===v.key);
 if(guide)return {title:'About this lesson clip',lines:[{text:guide.description},{text:(GUIDE_ABOUT[v.key]??(()=>DEFINITION))()}]};
 return {title:'About Futbol Island',lines:(ISLAND_ABOUT[v.key]?.()??[GAME_FOOT]).map(text=>({text}))};
}
/* Checked at load: every clip has links to at least three other pages. */
for(const v of allWatchVideos())if(watchLinks(v).length<3)throw new Error(`videoPages: ${v.slug} has fewer than three links`);
