import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/site/Breadcrumbs';
import {PRIVACY_CONTACT} from '@/components/privacy/PrivacyPolicy';
import {GROWN_UPS as G,NONPROFITS,WSV_LINKS} from '@/lib/site/aboutCopy';
import {SPONSOR_BOARDS_LINE} from '@/lib/site/safety';
import {LESSONS} from '@/lib/site/lessons';
import {SITE_FISH} from '@/lib/site/fish';
import {SITE_CARDS} from '@/lib/site/cards';
import {SITE_EXHIBITS} from '@/lib/site/exhibits';
import {breadcrumbLd,pageMeta,siteLd} from '@/lib/site/seo';
import {SAFE_TRUST} from '@/lib/site/safety';
import {QA} from '@/components/site/LessonHub';
import {IconList,PictureTiles,SHOTS,TrustTiles} from '@/components/site/PageParts';
import styles from '../site.module.css';

/**
 * /about (Oct 16 2026): what Futbol Island is, in plain words, for parents, coaches, search engines and AI assistants.
 * The grown-ups copy and partner links come from lib/site/aboutCopy.ts (the same words as the title screen's For grown-ups
 * sheet); privacy statements follow components/privacy/PrivacyPolicy.tsx and must never say more than it does.
 * Visual pass b5 (Nov 17 2026): trust tiles under the title, "What it teaches" as picture tiles (the game's own screenshots),
 * "How it works" as an icon list and the FAQ as the site's collapsible rows. Same words as before.
 */
export const dynamic='force-static';
const DESC='Futbol Island is a free football learning game for kids aged 7 to 12. Explore an island and learn positions, tactics, rules and football history through short lessons and quizzes. No pop-up or tracking ads, no open chat, no accounts.';
// the search-result description is kept under 155 characters; the page lead above stays the full sentence
const META='A free football learning game for kids aged 7 to 12: explore an island and learn positions, tactics, rules and football history.';
export const metadata=pageMeta('About Futbol Island: A Free Football Game for Kids',META,'/about',{whole:true})/* Nov 20 2026: was "About" (21 characters with the site name) */;
const CRUMBS=[{name:'Home',path:'/'},{name:'About',path:'/about'}];
const CONTACT=PRIVACY_CONTACT?`Privacy questions and requests: ${PRIVACY_CONTACT}.`:'A contact address for privacy questions will be listed on the privacy page. Meanwhile, “Delete my save” in the game removes a save straight away.';
const FAQ:[string,string][]=[
 ['What age is Futbol Island for?','Kids aged about 7 to 12, and the parents, carers and coaches who help them.'],
 ['How much does it cost?',`Nothing. ${G.free} There are no pop-up or tracking ads, and the island’s coins are earned by playing, never bought. Donations to local non-profits sit behind a grown-up check.`],
 ['What devices does it work on?','It plays in the web browser on phones, tablets and computers, with nothing to download. It is made for phones first.'],
 ['Is it private and safe for kids?',`${G.privacy} Links that leave the site are behind a grown-up check. The privacy policy explains exactly what is kept and for how long.`],
 ['How do we contact you?',CONTACT],
];

export default function About(){
 return <>
  <JsonLd data={siteLd()}/>
  <JsonLd data={breadcrumbLd(CRUMBS)}/>
  <JsonLd data={{'@context':'https://schema.org','@type':'FAQPage',mainEntity:FAQ.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))}}/>
  <header className={styles.intro}>
   <Breadcrumbs crumbs={CRUMBS}/>
   <h1 className={styles.title}>About Futbol Island</h1>
   <p className={styles.lead}>{DESC}</p>
   <a className={styles.cta} href="/play">Start Playing</a>
   <p className={styles.caption}>Want the tour first? <a href="/">See what’s inside the game</a>: every feature and the football idea it teaches.</p>
  </header>
  <TrustTiles items={SAFE_TRUST} label="Futbol Island at a glance"/>

  <section className={styles.section} aria-labelledby="who"><h2 className={styles.h2} id="who">Who it is for</h2>
   <p>Kids who love football (soccer) and want to understand the game better: where to stand, when to pass, how a team keeps its shape. It is also for parents, carers and coaches who want a calm way for children to learn the ideas behind the game between practices.</p>
  </section>

  <section className={styles.section} aria-labelledby="why"><h2 className={styles.h2} id="why">{G.whyTitle}</h2><p>{G.why}</p></section>

  <section className={styles.section} aria-labelledby="learn"><h2 className={styles.h2} id="learn">What it teaches</h2>
   <p>{G.learns}</p>
   <PictureTiles items={[
    {href:'/learn/lessons',title:`${LESSONS.length} short lessons`,line:'Positions and tactics in 7v7, 9v9, 11v11 and futsal. Each one plays out on a pitch with moving players, a coach explains every step, and a quick quiz checks the idea.',shot:SHOTS.lessons,alt:'A lesson in the game: a play unfolds on the pitch, then a quiz asks why the right run works.'},
    {href:'/cards',title:`${SITE_CARDS.length} player and coach cards`,line:'Club history and football culture, one card at a time, to collect in a binder.',shot:SHOTS.cards,alt:'The card binder in the game: a mystery card opens and a player card flies into the binder.'},
    {href:'/fish',title:`${SITE_FISH.length} sea animals`,line:'To catch, each linked to a real club, team or football story from the sea. Fishing doubles as a goalkeeper lesson: stay set, don’t bite on a feint, then react fast.',shot:SHOTS.fishing,alt:'Fishing at the beach in the game: the line goes tight and a mackerel is reeled in.'},
    {href:'/exhibits',title:`${SITE_EXHIBITS.length} museum exhibits`,line:'World Cup history, balls and kits, legends, football’s firsts and the science of the game.',shot:SHOTS.museum,alt:'The football museum in the game: a case with a throw-in display and the Ballon d’Or.'},
   ]}/>
   <IconList items={[
    {icon:'law',title:'The rules:',text:'the Laws of the Game, from offside and the penalty kick to throw-ins and free kicks, in the lessons and the museum.'},
    {icon:'ball',title:'The hidden-ball hunt:',text:'balls are hidden all around the island, and every ball you find teaches one football idea.'},
    {icon:'star',title:'The arcade:',text:'five football games, one skill at a time.'},
   ]}/>
  </section>

  <section className={styles.section} aria-labelledby="how"><h2 className={styles.h2} id="how">How it works</h2>
   <IconList two items={[
    {icon:'coin',title:G.free,text:G.freeWhy},
    {icon:'phone',title:'Phone first.',text:'It runs in the web browser on phones, tablets and computers. No download, no sign-up.'},
    {icon:'noads',title:'No pop-up or tracking ads, no open chat.',text:<>There is no free-text chat with other players and no pop-up, video or tracking advertising. {SPONSOR_BOARDS_LINE}</>},
    {icon:'key',title:'Save codes, not accounts.',text:<>{G.privacy} The code carries no personal details.</>},
    {icon:'shield',title:'For grown-ups.',text:<>The title screen has a For grown-ups page and the full <a href="/privacy">privacy policy</a>.</>},
   ]}/>
  </section>

  <section className={styles.section} aria-labelledby="partners"><h2 className={styles.h2} id="partners">{G.partnerTitle}</h2>
   <p>{G.partnerLead}<b>{G.partnerName}</b>{G.partnerRest}</p>
   <ul>{WSV_LINKS.map(l=><li key={l.href}><a href={l.href} rel="noopener noreferrer">{l.label}</a></li>)}</ul>
   <h3 className={styles.h3}>{G.nonprofitsTitle}</h3>
   <p>{G.nonprofitsLead}{NONPROFITS.map(n=>n.name).join(', ').replace(/, ([^,]+)$/,' and $1')}, all in San Diego.</p>
   <ul>{NONPROFITS.map(n=><li key={n.name}><a href={n.href} rel="noopener noreferrer">{n.name}</a></li>)}</ul>
  </section>

  <QA id="faq" title="Questions grown-ups ask" faq={FAQ.map(([q,a])=>({q,a}))}>
   <p className={styles.caption}><a href="/privacy">Read the privacy policy</a></p>
  </QA>
 </>;
}
