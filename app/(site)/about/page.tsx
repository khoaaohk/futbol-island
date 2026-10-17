import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/site/Breadcrumbs';
import {PRIVACY_CONTACT} from '@/components/privacy/PrivacyPolicy';
import {GROWN_UPS as G,NONPROFITS,WSV_LINKS} from '@/lib/site/aboutCopy';
import {LESSONS} from '@/lib/site/lessons';
import {SITE_FISH} from '@/lib/site/fish';
import {SITE_CARDS} from '@/lib/site/cards';
import {SITE_EXHIBITS} from '@/lib/site/exhibits';
import {breadcrumbLd,pageMeta,siteLd} from '@/lib/site/seo';
import {preloadIslandBrush} from '@/lib/islandBrushPreload';
import styles from '../site.module.css';

/**
 * /about (Oct 16 2026): what Futbol Island is, in plain words, for parents, coaches, search engines and AI assistants.
 * The grown-ups copy and partner links come from lib/site/aboutCopy.ts (the same words as the title screen's For grown-ups
 * sheet); privacy statements follow components/privacy/PrivacyPolicy.tsx and must never say more than it does.
 */
export const dynamic='force-static';
const DESC='Futbol Island is a free football learning game for kids aged 7 to 12. Explore an island and learn positions, tactics, rules and football history through short lessons and quizzes. No ads, no chat, no accounts.';
export const metadata=pageMeta('About',DESC,'/about');
const CRUMBS=[{name:'Home',path:'/'},{name:'About',path:'/about'}];
const CONTACT=PRIVACY_CONTACT?`Privacy questions and requests: ${PRIVACY_CONTACT}.`:'A contact address for privacy questions will be listed on the privacy page. Meanwhile, “Delete my save” in the game removes a save straight away.';
const FAQ:[string,string][]=[
 ['What age is Futbol Island for?','Kids aged about 7 to 12, and the parents, carers and coaches who help them.'],
 ['How much does it cost?',`Nothing. ${G.free} There are no ads, and the island’s coins are earned by playing, never bought. Donations to local non-profits sit behind a grown-up check.`],
 ['What devices does it work on?','It plays in the web browser on phones, tablets and computers, with nothing to download. It is made for phones first.'],
 ['Is it private and safe for kids?',`${G.privacy} Links that leave the site are behind a grown-up check. The privacy policy explains exactly what is kept and for how long.`],
 ['How do we contact you?',CONTACT],
];

export default function About(){
 preloadIslandBrush();
 return <>
  <JsonLd data={siteLd()}/>
  <JsonLd data={breadcrumbLd(CRUMBS)}/>
  <JsonLd data={{'@context':'https://schema.org','@type':'FAQPage',mainEntity:FAQ.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))}}/>
  <Breadcrumbs crumbs={CRUMBS}/>
  <h1>About Futbol Island</h1>
  <p className={styles.lead}>{DESC}</p>
  <p><a className={styles.play} href="/">Play Futbol Island</a></p>

  <section aria-labelledby="who"><h2 id="who">Who it is for</h2>
   <p>Kids who love football (soccer) and want to understand the game better: where to stand, when to pass, how a team keeps its shape. It is also for parents, carers and coaches who want a calm, ad-free way for children to learn the ideas behind the game between practices.</p>
  </section>

  <section aria-labelledby="why"><h2 id="why">{G.whyTitle}</h2><p>{G.why}</p></section>

  <section aria-labelledby="learn"><h2 id="learn">What it teaches</h2>
   <p>{G.learns}</p>
   <ul>
    <li><b>Positions and tactics:</b> <a href="/learn">{LESSONS.length} short lessons</a> in 7v7, 9v9, 11v11 and futsal. Each one plays out on a pitch with moving players, a coach explains every step, and a quick quiz checks the idea.</li>
    <li><b>The rules:</b> the Laws of the Game, from offside and the penalty kick to throw-ins and free kicks, in the lessons and the museum.</li>
    <li><b>The keeper’s mindset:</b> fishing on the island doubles as a goalkeeper lesson: stay set, don’t bite on a feint, then react fast.</li>
    <li><b>The hidden-ball hunt:</b> balls are hidden all around the island, and every ball you find teaches one football idea.</li>
    <li><b>Club history and football culture:</b> <a href="/fish">{SITE_FISH.length} sea animals</a> to catch, each linked to a real club, team or football story from the sea, and <a href="/cards">{SITE_CARDS.length} player and coach cards</a> to collect.</li>
    <li><b>The museum:</b> <a href="/exhibits">{SITE_EXHIBITS.length} exhibits</a> on World Cup history, balls and kits, legends, football’s firsts and the science of the game.</li>
    <li><b>The arcade:</b> five football games, one skill at a time.</li>
   </ul>
  </section>

  <section aria-labelledby="how"><h2 id="how">How it works</h2>
   <ul>
    <li><b>{G.free}</b> {G.freeWhy}</li>
    <li><b>Phone first.</b> It runs in the web browser on phones, tablets and computers. No download, no sign-up.</li>
    <li><b>No ads, no chat.</b> There is no chat with other players and no advertising.</li>
    <li><b>Save codes, not accounts.</b> {G.privacy} The code carries no personal details.</li>
    <li><b>For grown-ups.</b> The title screen has a For grown-ups page and the full <a href="/privacy">privacy policy</a>.</li>
   </ul>
  </section>

  <section aria-labelledby="partners"><h2 id="partners">{G.partnerTitle}</h2>
   <p>{G.partnerLead}<b>{G.partnerName}</b>{G.partnerRest}</p>
   <ul>{WSV_LINKS.map(l=><li key={l.href}><a href={l.href} rel="noopener noreferrer">{l.label}</a></li>)}</ul>
   <h3>{G.nonprofitsTitle}</h3>
   <p>{G.nonprofitsLead}{NONPROFITS.map(n=>n.name).join(', ').replace(/, ([^,]+)$/,' and $1')}, all in San Diego.</p>
   <ul>{NONPROFITS.map(n=><li key={n.name}><a href={n.href} rel="noopener noreferrer">{n.name}</a></li>)}</ul>
  </section>

  <section aria-labelledby="faq"><h2 id="faq">Questions grown-ups ask</h2>
   {FAQ.map(([q,a])=><div key={q} className={styles.card}><h3>{q}</h3><p>{a}</p></div>)}
   <p><a href="/privacy">Read the privacy policy</a></p>
  </section>
 </>;
}
