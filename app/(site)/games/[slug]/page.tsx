import * as ReactDOM from 'react-dom';
import {stageShots} from '@/lib/site/gamePlay';
import KeepReading from '@/components/site/KeepReading';
import {notFound} from 'next/navigation';
import JsonLd from '@/components/seo/JsonLd';
import {QA} from '@/components/site/LessonHub';
import {GameIntro,PlayLink,Shots} from '@/components/site/games/GameParts';
import {LinkList,Section} from '@/lib/site/GuideParts';
import {ALL_GAME_PAGES,BOARD_LINE,GAME_FACTS,GAME_FOOT,GAME_PAGES,GAMES_HUB,GAMES_WORD,gameBySlug,gameCrumbs,isGameListed,learnTopic,relatedGames,videoGameLd} from '@/lib/site/games';
import {breadcrumbLd,faqLd,pageMeta,PLAY_PATH} from '@/lib/site/seo';
import site from '../../site.module.css';
import RailNav from '@/components/site/shell/RailNav';
import {gameRail} from '@/lib/site/railNavMore';

/**
 * /games/<slug> (lib/site/games.ts): one arcade game as a reading page for search: what it is, how to play on a phone and a
 * computer, the football idea it teaches (with links to the guides), tips, how it gets harder, a note for parents and a FAQ.
 * Static and server-rendered: no game canvas. Under the intro, the game's gameplay loop (tap or hover to play; LoopClip is the
 * only client code, AGENTS.md phone heat) and up to four stills (lib/site/gameMedia.ts, Nov 16 2026). The game itself opens
 * from the gold button, at /arcade?game=<id>. Nov 22 2026 (play now): the first screen under the H1 is the play stage
 * (GameParts PlayStage, lib/site/gamePlay.ts): screenshots, the big Play now button, how to play and where it runs.
 */
export const dynamic='force-static';
export const dynamicParams=false;
// Nov 21 2026: every page is built, listed or not; a game without a machine in the room yet (arcadeUnplaced) is noindex and out of
// the sitemap until it is placed (lib/site/games.ts ALL_GAME_PAGES).
export const generateStaticParams=()=>ALL_GAME_PAGES.map(g=>({slug:g.slug}));
export function generateMetadata({params}:{params:{slug:string}}){
 const g=gameBySlug(params.slug);if(!g)return {};
 const meta=pageMeta(g.title,g.description,g.path,{whole:true,type:'website',image:{url:g.og,alt:g.ogAlt}});
 return isGameListed(g.id)?meta:{...meta,robots:{index:false,follow:true}};
}
const List=({items}:{items:readonly string[]})=><ul>{items.map(x=><li key={x}>{x}</li>)}</ul>;
export default function GamePageView({params}:{params:{slug:string}}){
 const g=gameBySlug(params.slug);if(!g)notFound();
 const crumbs=gameCrumbs({name:g.name,path:g.path}),ld=videoGameLd(g);
 // Nov 22 2026 (play now): the play stage's first poster is the page's LCP; preload it at high priority (lib/site/gamePlay.ts).
 if(typeof ReactDOM.preload==='function')ReactDOM.preload(stageShots(g)[0].src,{as:'image',fetchPriority:'high'});
 // Nov 24 2026 (SEO wave 2, owner: a visible "More free games" row of 3-4 related games, the game's Learn topic and /games): one ordered
 // group, so the first seven cards are the related games, the hub, the Learn topic and the Library card (KeepReading MAIN); every other
 // game stays linked under "Show N more" (tests/seo-games.cjs: each game page links every other listed game).
 const card=(x:typeof g)=>({path:x.path,name:`${x.name}: ${x.h1.split(':')[0].toLowerCase()}`,line:x.blurb}),near=relatedGames(g),topic=learnTopic(g);
 const others=[...near.map(card),{path:GAMES_HUB.path,name:`All ${GAMES_WORD} free soccer games`,line:GAMES_HUB.blurb},{path:topic.path,name:`Learn the idea: ${topic.name}`,line:topic.line},
  ...GAME_PAGES.filter(x=>x!==g&&!near.includes(x)).map(card)];
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={ld}/>{/* Nov 18 2026: no trailer VideoObject here; the clip's one home is its watch page (lib/site/videos.ts) */}
  <JsonLd data={faqLd(g.faq)}/>
  <RailNav rail={gameRail(g.name)} current="#top"/>
  <GameIntro crumbs={crumbs} h1={g.h1} lead={g.lead} game={g}/>
  <Shots game={g}/>
  <Section id="what" title={`What is ${g.name}?`}>{g.about.map(x=><p key={x}>{x}</p>)}</Section>
  <Section id="how" title={`How to play ${g.name}`}>
   <h3 className={site.h3}>On a phone or tablet</h3><List items={g.phone}/>
   <h3 className={site.h3}>On a computer</h3><List items={g.desktop}/>
   <h3 className={site.h3}>The rules</h3><List items={g.rules}/>
  </Section>
  <Section id="teaches" title="What it teaches">
   {g.teaches.map(x=><p key={x}>{x}</p>)}
   <h3 className={site.h3}>Read and practise the same idea</h3>
   <LinkList links={g.guides}/>
  </Section>
  <Section id="tips" title="Tips to score higher"><ol>{g.tips.map(x=><li key={x}>{x}</li>)}</ol></Section>
  <Section id="harder" title="How the difficulty grows"><List items={g.harder}/></Section>
  <Section id="parents" title="For parents and coaches"><List items={g.parents}/></Section>
  <QA id="faq" title={`Questions about ${g.name}`} faq={g.faq}/>
  {/* Nov 24 2026 (SEO wave 2, owner: "these will get returning users"): only modes that exist in the game's code (lib/site/games.ts GAME_FACTS) */}
  <Section id="again" title={`Play ${g.name} again`}><p>{GAME_FACTS[g.id].back} {BOARD_LINE}</p></Section>
  <KeepReading id="more" title="More free games" groups={[{id:'more-games',links:others}]} show={near.length+3}/>
  {/* Nov 20 2026 (SEO foundation): each game page leads on to the island itself (a game page, not the home page) */}
  <Section id="island" title="Play the whole island">
   <p>{g.name} is one game in the Futbol Island arcade. The island also has lessons, quizzes, fishing and player cards. <a href={PLAY_PATH} data-island-link="">Play the whole island</a>.</p>
  </Section>
  <p className={site.caption}>{GAME_FOOT}</p>
  <p className={site.end}><PlayLink game={g}/></p>
 </>;
}
