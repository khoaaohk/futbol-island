import {notFound} from 'next/navigation';
import JsonLd from '@/components/seo/JsonLd';
import {QA} from '@/components/site/LessonHub';
import {GameIntro,PlayLink,Shots} from '@/components/site/games/GameParts';
import {LinkList,Section} from '@/lib/site/GuideParts';
import {GAME_FOOT,GAME_PAGES,GAMES_HUB,gameBySlug,gameCrumbs,videoGameLd} from '@/lib/site/games';
import {breadcrumbLd,faqLd,pageMeta} from '@/lib/site/seo';
import site from '../../site.module.css';

/**
 * /games/<slug> (lib/site/games.ts): one arcade game as a reading page for search: what it is, how to play on a phone and a
 * computer, the football idea it teaches (with links to the guides), tips, how it gets harder, a note for parents and a FAQ.
 * Static and server-rendered: no game canvas, no video, no client code (AGENTS.md, phone heat). The game itself opens from the
 * gold button, at /arcade?game=<id>.
 */
export const dynamic='force-static';
export const dynamicParams=false;
export const generateStaticParams=()=>GAME_PAGES.map(g=>({slug:g.slug}));
export function generateMetadata({params}:{params:{slug:string}}){
 const g=gameBySlug(params.slug);if(!g)return {};
 return pageMeta(g.title,g.description,g.path,{whole:true,type:'website',image:{url:g.og,alt:g.ogAlt}});
}
const List=({items}:{items:readonly string[]})=><ul>{items.map(x=><li key={x}>{x}</li>)}</ul>;
export default function GamePageView({params}:{params:{slug:string}}){
 const g=gameBySlug(params.slug);if(!g)notFound();
 const crumbs=gameCrumbs({name:g.name,path:g.path});
 const others=[...GAME_PAGES.filter(x=>x!==g).map(x=>({path:x.path,name:`${x.name}: ${x.h1.split(':')[0].toLowerCase()}`,line:x.blurb})),{path:GAMES_HUB.path,name:'All seven free soccer games',line:GAMES_HUB.blurb}];
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={videoGameLd(g)}/>
  <JsonLd data={faqLd(g.faq)}/>
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
  <Section id="more" title="More free soccer games"><LinkList links={others}/></Section>
  <p className={site.caption}>{GAME_FOOT}</p>
  <p className={site.end}><PlayLink game={g}/></p>
 </>;
}
