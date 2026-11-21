import RailNav from '@/components/site/shell/RailNav';
import tgt from '@/components/site/railTarget.module.css';
import {cardsHubRail} from '@/lib/site/railNavCollections';
import JsonLd from '@/components/seo/JsonLd';
import {CollectionLinks} from '@/components/site/CollectionHub';
import {CARD_COLLECTIONS} from '@/lib/site/collections';
import Breadcrumbs from '@/components/site/Breadcrumbs';
import {cardPath,SITE_CARDS} from '@/lib/site/cards';
import {ROLE_LABELS,ROLE_ORDER} from '@/lib/town/cardCollection';
import {abs,breadcrumbLd,pageMeta,SITE_NAME} from '@/lib/site/seo';
import {REFEREE_CARDS_LINK} from '@/lib/site/crossLinks';
import styles from '../site.module.css';
import {CardThumbGrid,cardLink} from '@/components/site/cards/GameCard';
import {libraryCrumbs} from '@/lib/site/libraryPath';

export const dynamic='force-static';
const PLAYERS=SITE_CARDS.filter(c=>!c.coach).length,COACHES=SITE_CARDS.length-PLAYERS;
const DESC=`The Futbol Island card binder: ${PLAYERS} player cards and ${COACHES} coach cards, from today’s stars to all-time greats, in football and futsal.`;
export const metadata=pageMeta('Football Player Cards for Kids: Today’s Stars and Greats',DESC,'/cards',{whole:true})/* Nov 20 2026: was "Player cards" */;
const CRUMBS=libraryCrumbs({name:'Cards',path:'/cards'});/* Nov 20 2026: through the Library */

export default function CardsIndex(){
 return <>
  <JsonLd data={breadcrumbLd(CRUMBS)}/>
  <JsonLd data={{'@context':'https://schema.org','@type':'ItemList',name:`${SITE_NAME} player cards`,numberOfItems:SITE_CARDS.length,
   itemListElement:SITE_CARDS.map((c,i)=>({'@type':'ListItem',position:i+1,name:`#${c.number} ${c.displayName}`,url:abs(cardPath(c.number))}))}}/>
  {/* layout batch 3 (Nov 20 2026; owner: "it should list what's on that page to smooth scroll down"): Back, Overview and this page's sections */}
  <RailNav rail={cardsHubRail(ROLE_ORDER.filter(r=>SITE_CARDS.some(c=>c.role===r)).map(r=>[`role-${r}`,ROLE_LABELS[r]??r] as const))} current="#top"/>
  <header className={styles.intro} id="top">
   <Breadcrumbs crumbs={CRUMBS}/>
   <h1 className={styles.title}>Player cards</h1>
   <p className={styles.lead}>{DESC} Every card tells you the player’s position, what they are good at and where they played.</p>
   <a className={styles.cta} href="/play">Collect cards on the island</a>
  </header>
  <CollectionLinks list={CARD_COLLECTIONS} title="Browse the cards by collection"/>
  {ROLE_ORDER.filter(role=>SITE_CARDS.some(c=>c.role===role)).map((role,idx)=>{const list=SITE_CARDS.filter(c=>c.role===role);if(!list.length)return null;return <section key={role} className={styles.section} aria-labelledby={`role-${role}`}>
   <h2 className={`${styles.h2} ${tgt.target}`} id={`role-${role}`}>{ROLE_LABELS[role]??role} <span className={styles.count}>({list.length})</span></h2>
   {/* Nov 20 2026 (owner: "the players card still doesn't have the actual card from the game"): the game's own cards at thumbnail
       size (GameCard.tsx; was text rows). Off-screen rows skip rendering, so their portraits load only as they scroll near. */}
   <CardThumbGrid links={list.map(cardLink)} eager={idx===0?8:0}/>
  </section>;})}
  {/* Nov 20 2026 (SEO foundation): the guides the cards are about, and the referee's cards for readers who wanted the rule */}
  <section className={styles.section} aria-labelledby="learn-more"><h2 className={`${styles.h2} ${tgt.target}`} id="learn-more">Keep reading</h2>
   <ul className={styles.list}>{[{path:'/learn/soccer-positions',name:'Soccer positions explained',line:'What each position on a card does'},REFEREE_CARDS_LINK,{path:'/books',name:'Football pop-up books for kids',line:'True stories about players in the binder'}]
    .map(l=><li key={l.path}><a href={l.path}><span className={styles.itemTitle}>{l.name}</span><span className={styles.itemMeta}>{l.line}</span></a></li>)}</ul>
  </section>
 </>;
}
