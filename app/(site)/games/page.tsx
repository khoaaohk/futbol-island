import * as ReactDOM from 'react-dom';
import JsonLd from '@/components/seo/JsonLd';
import {QA} from '@/components/site/LessonHub';
import {ClipFigure,GameFeature,GameIntro,IslandGallery,gamesCss} from '@/components/site/games/GameParts';
import {LinkList,Section} from '@/lib/site/GuideParts';
import {GAME_FOOT,GAME_PAGES,GAMES_HUB,GAMES_WORD,gameCrumbs,gameListLd} from '@/lib/site/games';
import {HERO_CLIP} from '@/lib/site/gameMedia';
import {VIDEOS_PATH,allWatchVideos} from '@/lib/site/videos';
import {breadcrumbLd,faqLd,pageMeta} from '@/lib/site/seo';
import site from '../site.module.css';

/** /games (lib/site/games.ts): every arcade game as a reading page for search, with real gameplay loops and stills
 * (lib/site/gameMedia.ts, Nov 16 2026). Static; the only client code is the clips' LoopClip. No game canvas. */
export const dynamic='force-static';
const H=GAMES_HUB;
export const metadata=pageMeta(H.title,H.description,H.path,{whole:true,type:'website',image:{url:H.og,alt:H.ogAlt}});
export default function GamesHub(){
 // The hero poster is the page's LCP: preload it at high priority (react-dom's preload, in the App Router's React).
 if(HERO_CLIP&&typeof ReactDOM.preload==='function')ReactDOM.preload(HERO_CLIP.poster,{as:'image',fetchPriority:'high'});
 const crumbs=gameCrumbs(),nVideos=allWatchVideos().length;
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={gameListLd()}/>
  <JsonLd data={faqLd(H.faq)}/>
  {/* Nov 18 2026: no VideoObject on this page; every clip's one home is its watch page, /videos/<slug> (lib/site/videos.ts) */}
  <GameIntro crumbs={crumbs} h1={H.h1} lead={H.lead}/>
  {HERO_CLIP&&<div className={`${gamesCss.bleed} ${gamesCss.hero}`}>
   <ClipFigure c={HERO_CLIP} auto priority/>
   <a className={site.cta} href={GAME_PAGES[0].play} data-play={GAME_PAGES[0].id}>Play {GAME_PAGES[0].name} now</a>
  </div>}
  <Section id="games" title={`The ${GAMES_WORD} games`}>
   {H.intro.map(x=><p key={x}>{x}</p>)}
   <ul className={`${gamesCss.features} ${gamesCss.bleed}`}>{GAME_PAGES.map((g,i)=><GameFeature key={g.id} game={g} flip={i%2===1}/>)}</ul>
  </Section>
  <Section id="island" title="Inside the island">
   <p>The arcade is one room of Futbol Island, a whole 3D island to explore. Walk or fly around it, fish from the pier, play a match on the beach, design a kit and visit the football museum.</p>
   <div className={gamesCss.bleed}><IslandGallery/></div>
   <p>Watch all {nVideos} clips, one on each page, on the <a href={VIDEOS_PATH}>Futbol Island videos</a> page.</p>
  </Section>
  <Section id="play" title="Pick a game and play">
   <ul className={gamesCss.playRow}>{GAME_PAGES.map(g=><li key={g.id}><a className={gamesCss.playNow} href={g.play}>Play {g.name}</a></li>)}</ul>
  </Section>
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
  <p className={site.caption}>{GAME_FOOT}</p>
 </>;
}
