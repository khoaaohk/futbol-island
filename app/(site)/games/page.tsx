import JsonLd from '@/components/seo/JsonLd';
import {QA} from '@/components/site/LessonHub';
import {GameIntro,GameRow,gamesCss} from '@/components/site/games/GameParts';
import {LinkList,Section} from '@/lib/site/GuideParts';
import {GAME_FOOT,GAME_PAGES,GAMES_HUB,gameCrumbs,gameListLd} from '@/lib/site/games';
import {breadcrumbLd,faqLd,pageMeta} from '@/lib/site/seo';
import site from '../site.module.css';

/** /games (lib/site/games.ts): the six arcade games as a reading page for search. Static, no client code, no game canvas. */
export const dynamic='force-static';
const H=GAMES_HUB;
export const metadata=pageMeta(H.title,H.description,H.path,{whole:true,type:'website',image:{url:H.og,alt:H.ogAlt}});
export default function GamesHub(){
 const crumbs=gameCrumbs();
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={gameListLd()}/>
  <JsonLd data={faqLd(H.faq)}/>
  <GameIntro crumbs={crumbs} h1={H.h1} lead={H.lead}/>
  <Section id="games" title="The six games">
   {H.intro.map(x=><p key={x}>{x}</p>)}
   <ul className={gamesCss.games}>{GAME_PAGES.map(g=><GameRow key={g.id} game={g}/>)}</ul>
  </Section>
  <Section id="pick" title="Which game to start with">
   <ul>{H.pick.map(([k,v])=><li key={k}><b>{k}:</b> {v}</li>)}</ul>
  </Section>
  <Section id="safe" title="For parents and coaches">
   <ul>
    <li>Free, with no advertising and nothing to buy. Coins on the island are earned by playing and learning, never bought with real money.</li>
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
