import * as ReactDOM from 'react-dom';
import JsonLd from '@/components/seo/JsonLd';
import {QA} from '@/components/site/LessonHub';
import {ClipFigure,GameFeature,GamesHero,ISLAND_FEATURE_KEY,IslandBand,IslandGallery,gamesCss} from '@/components/site/games/GameParts';
import {LinkList,Section} from '@/lib/site/GuideParts';
import {GAME_FOOT,GAME_PAGES,GAMES_HUB,GAMES_NAMES,GAMES_WORD,gameCrumbs,gameListLd} from '@/lib/site/games';
import {HERO_CLIP,islandClips} from '@/lib/site/gameMedia';
import {VIDEOS_PATH,allWatchVideos} from '@/lib/site/videos';
import {breadcrumbLd,faqLd,pageMeta} from '@/lib/site/seo';
import site from '../site.module.css';
import lib from '@/components/site/library.module.css';
import LibraryMenuSpy from '@/components/site/LibraryMenuSpy';

/** /games (lib/site/games.ts): every arcade game as a reading page for search, with real gameplay loops and stills
 * (lib/site/gameMedia.ts, Nov 16 2026). Static; the only client code is the clips' LoopClip. No game canvas. */
export const dynamic='force-static';
const H=GAMES_HUB;
export const metadata=pageMeta(H.title,H.description,H.path,{whole:true,type:'website',image:{url:H.og,alt:H.ogAlt}});
// Batch 3 (Nov 20 2026): Overview (the hero, #top) is the first entry; the island game now lives in the hero, so it has no entry of its own.
const MENU:readonly (readonly [string,string])[]=[...GAME_PAGES.map(g=>[`#game-${g.id}`,g.name] as const),
 ['#island','Inside the island'],['#pick','Which game to start with'],['#safe','For parents and coaches'],['#faq','Questions'],['#guides','Learn the ideas']];
export default function GamesHub(){
 // The lead clip's poster (GAMES_LEAD_CLIP, in the hero) is the page's LCP: preload it at high priority.
 const top=islandClips().find(c=>c.key===ISLAND_FEATURE_KEY);
 if(top&&typeof ReactDOM.preload==='function')ReactDOM.preload(top.poster,{as:'image',fetchPriority:'high'});
 const crumbs=gameCrumbs(),nVideos=allWatchVideos().length;
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={gameListLd()}/>
  <JsonLd data={faqLd(H.faq)}/>
  {/* Nov 18 2026: no VideoObject on this page; every clip's one home is its watch page, /videos/<slug> (lib/site/videos.ts) */}
  {/* Nov 20 2026 (owner: "the games page needs a left nav too"): the Library's group menu (library.module.css .menu, LibraryMenuSpy):
      chips under the intro, from 1280 px a rail locked on the left under the header (the intro comes first by CSS order below
      that). Plain anchor links. */}
  <div className={`${lib.shelf} ${gamesCss.gshelf}`}>
   <nav className={`${lib.menu} ${gamesCss.menu}`} id="games-menu" data-rail="" aria-label="Games on this page">
    <ul><li><a href="#top" data-on="">Overview</a></li>{MENU.map(([href,label])=><li key={href}><a href={href}>{label}</a></li>)}</ul>
   </nav>
   <LibraryMenuSpy menu="games-menu"/>
   <div className={`${lib.shelfMain} ${gamesCss.gmain}`}>
    <GamesHero crumbs={crumbs} h1={H.h1} lead={H.lead} play="Play Futbol Island"/>
    <IslandBand title="Futbol Island, the main game" note={GAMES_NAMES}
     lines={['A free 3D island where you learn football by playing. Walk or fly around it, fish from the pier, design a kit and join a match on the beach.','Short lessons on real pitches teach the rules, the positions and how a team plays. It runs in the browser, with no download.']}/>
  <Section id="games" title={`The ${GAMES_WORD} arcade games`}>
   <div className={`${gamesCss.arcadeIntro} ${gamesCss.bleed}`}>
    <div>{H.intro.map(x=><p key={x}>{x}</p>)}</div>
    {HERO_CLIP&&<ClipFigure c={HERO_CLIP}/>}
   </div>
   <ul className={`${gamesCss.features} ${gamesCss.bleed}`}>{GAME_PAGES.map(g=><GameFeature key={g.id} game={g}/>)}</ul>
  </Section>
  <Section id="island" title="Inside the island">
   <p>The arcade is one room of Futbol Island, a whole 3D island to explore. Walk or fly around it, fish from the pier, play a match on the beach, design a kit and visit the football museum.</p>
   <div className={gamesCss.bleed}><IslandGallery skip={ISLAND_FEATURE_KEY}/></div>
   <p>Watch all {nVideos} clips, one on each page, on the <a href={VIDEOS_PATH}>Futbol Island videos</a> page.</p>
  </Section>
  <Section id="play" title="Pick a game and play">
   <ul className={gamesCss.playRow}>{GAME_PAGES.map(g=><li key={g.id}><a className={gamesCss.playNow} href={g.play}>Play {g.name}</a></li>)}</ul>
  </Section>
  <div className={gamesCss.lower}>
  <Section id="pick" title="Which game to start with">
   <ul>{H.pick.map(([k,v])=><li key={k}><b>{k}:</b> {v}</li>)}</ul>
  </Section>
  <Section id="safe" title="For parents and coaches">
   <ul>
    <li>Free, with no pop-up or tracking ads and nothing to buy. Coins on the island are earned by playing and learning, never bought with real money.</li>
    <li>No account, no sign-up and no open chat. A high-score board takes a few arcade-style letters only.</li>
    <li>Nothing to install: the games run in the browser on phones, tablets, Chromebooks and computers.</li>
    <li>Short sessions: a run lasts a few minutes and ends on its own.</li>
   </ul>
   <p>More detail is in the <a href="/safe-football-game-for-kids">parents’ guide</a>.</p>
  </Section>
  <QA id="faq" title="Questions about the games" faq={H.faq}/>
  <Section id="guides" title="Learn the ideas behind the games"><LinkList links={[{path:'/learn/soccer-formations',name:'Soccer formations',line:'The shapes Squad Snake builds, with a diagram of each'},{path:'/learn/soccer-positions',name:'Soccer positions',line:'What each position does and the numbers 1 to 11'},
   {path:'/learn/soccer-rules/offside',name:'The offside rule for kids',line:'The line Pass Puzzles draws on the pitch'},{path:'/learn/soccer-drills',name:'Soccer drills for kids',line:'First touch, passing, dribbling and shooting drills'},
   {path:'/learn/soccer-terms',name:'Soccer terms',line:'Give-and-go, through ball, first touch and more'},{path:'/learn/lessons',name:'All football lessons',line:'Short animated lessons with a quiz'}]}/></Section>
  </div>
  <p className={site.caption}>{GAME_FOOT}</p>{/* Nov 20 2026 evening: inside the right column, beside the rail */}
   </div>
  </div>
 </>;
}
