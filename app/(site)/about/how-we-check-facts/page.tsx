import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/site/Breadcrumbs';
import {DataTable,QuickAnswer,Section} from '@/lib/site/GuideParts';
import {IconList} from '@/components/site/PageParts';
import {FACTS_PATH,FAMILY_CHECKED,longDate,type CheckedFamily} from '@/lib/site/checked';
import {abs,breadcrumbLd,pageMeta,PUBLISHER,SITE_NAME,SITE_URL} from '@/lib/site/seo';
import styles from '../../site.module.css';

/**
 * /about/how-we-check-facts (SEO content pass, Nov 15 2026): who writes the reading pages, which sources each kind of page is checked
 * against, what "Last checked" means and the kid-safety rules for the words. Linked from every guide, card and fish page's
 * "Last checked" line (lib/site/GuideParts.tsx CheckedLine). Only states what the repo really does (sources named in the data
 * files: lib/site/rules.ts, sizes.ts, terms.ts, cardNotes.ts, fishNotes.ts). Plain text, no links out of the site.
 * Visual pass b5 (Nov 17 2026): the answer in the quick-answer card with four key facts, the rules as icon lists.
 */
export const dynamic='force-static';
const TITLE='How We Check Facts',
 DESC='How Futbol Island checks the facts on its soccer guides, player cards and fish pages: who writes them, the sources we use and our kid-safety rules.',
 H1='How we check facts';
export const metadata=pageMeta(TITLE,DESC,FACTS_PATH);
const CRUMBS=[{name:'Home',path:'/'},{name:'About',path:'/about'},{name:TITLE,path:FACTS_PATH}];
const ROWS:[string,string,CheckedFamily][]=[
 ['Soccer rules','The IFAB Laws of the Game (current edition), the FIFA Futsal Laws of the Game 2025-26, U.S. Soccer small-sided standards and US Youth Soccer playing rules. Each rule page names its Law.','rules'],
 ['Soccer terms','The same Laws for words that are rules. Everyday soccer words are given their plain meaning only, with no records or statistics.','terms'],
 ['Positions and formations','The Laws (number of players, goalkeeper rules), U.S. Soccer youth formats and the Futbol Island lessons that teach each idea.','positions'],
 ['Drills and practice plans','U.S. Soccer Grassroots play-practice-play guidance and the age-group standards. Every drill links the lesson it trains.','drills'],
 ['Ball, field and age charts','U.S. Soccer, US Youth Soccer, IFAB and FIFA. Every row of every table names its source.','sizes'],
 ['Player cards','Each career fact is checked against Wikipedia and, where one confirms it, an official club or federation page. No fact without a source.','cards'],
 ['Fish pages','Where each animal lives in the wild and its fun fact are checked against the sources named on the page.','fish'],
];
const LEAD='Every soccer guide, player card and fish page on Futbol Island is written in plain words for kids aged 7 to 12 and the grown-ups who help them. Before a page goes up, its facts are checked against the official rules or another named source, and each page shows the date it was last checked.';
export default function HowWeCheckFacts(){
 return <>
  <JsonLd data={breadcrumbLd(CRUMBS)}/>
  <JsonLd data={{'@context':'https://schema.org','@type':'AboutPage',name:H1,url:abs(FACTS_PATH),description:DESC,inLanguage:'en',
   isPartOf:{'@type':'WebSite',name:SITE_NAME,url:SITE_URL+'/'},publisher:PUBLISHER}}/>
  <header className={styles.intro}>
   <Breadcrumbs crumbs={CRUMBS}/>
   <h1 className={styles.title}>{H1}</h1>
   <QuickAnswer lead={LEAD} facts={[
    {icon:'kid',label:'Written for',value:'Ages 7 to 12'},
    {icon:'law',label:'Checked against',value:'Named sources',href:'#sources'},
    {icon:'clock',label:'Every page shows',value:'Its last-checked date',href:'#dates'},
    {icon:'shield',label:'Links for kids',value:'None that leave the site',href:'#safety'},
   ]}/>
  </header>
  <Section id="who" title="Who writes the pages">
   <p>The pages are written by the Futbol Island team, who make the game in San Diego with White Sports Ventures. The same team writes the lessons and quizzes in the game, so a page and its lesson use the same words for the same idea.</p>
   <p>We write for children first: short sentences, one idea at a time, and soccer words explained the first time they appear. Most pages say “soccer” for readers in the United States and “football” once near the top, because both names mean the same game.</p>
  </Section>
  <Section id="sources" title="What we check each page against">
   <DataTable label="Sources by kind of page" head={['Pages','Checked against','Last checked']} rows={ROWS.map(([k,src,f])=>[k,src,longDate(FAMILY_CHECKED[f])])}/>
   <p className={styles.caption}>Source names are shown as plain text, not links, so children are not sent off the site. Grown-ups can find every source by its name.</p>
  </Section>
  <Section id="rules" title="Our rules for facts">
   <IconList two items={[
    {icon:'law',text:'No fact without a source. If we cannot confirm something, we leave it out.'},
    {icon:'clock',text:'Nothing that goes stale quickly. Player cards do not say a player’s current club, and pages do not quote records that change every season.'},
    {icon:'whistle',text:'Youth soccer varies. Where leagues set their own rules, such as game length or substitutions, the page says “your league may differ” and gives the typical US youth standard.'},
    {icon:'people',text:'Real people are treated fairly: cards describe how a player played, not their private life.'},
   ]}/>
  </Section>
  <Section id="dates" title="What “Last checked” means">
   <p>The date at the bottom of a page is the day its facts were last checked against the sources, not the day the website was last updated. Where a card or a fish has its own check date, the page shows that date. Otherwise it shows the date the whole set of pages was checked.</p>
  </Section>
  <Section id="safety" title="Keeping the words safe for kids">
   <IconList items={[
    {icon:'shield',text:'Kids’ pages never send children to other websites. Links that leave Futbol Island sit behind a grown-up check in the game.'},
    {icon:'ball',text:'We follow US youth soccer’s heading rules: no heading for players aged 10 and under, and limits on heading practice at 11 and 12. Our drills never ask young players to head the ball.'},
    {icon:'noads',text:'Pages carry no pop-up or tracking ads and ask for no personal details.'},
   ]}/>
  </Section>
  <Section id="mistakes" title="Found a mistake?">
   <p>Tell us, and we will check it against the source and fix the page. Grown-ups can see who makes the game, and how to reach the team, on the <a href="/about">about page</a>. You can also read our <a href="/safe-football-game-for-kids">safety guide for parents</a>.</p>
  </Section>
 </>;
}
