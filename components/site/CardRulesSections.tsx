import CardDeck from '@/components/site/CardDeck';
import RefCallGame from '@/components/site/RefCallGame';
import {Bullets,DataTable,Section} from '@/lib/site/GuideParts';
import {cardDeckOf,type CardRulesContent} from '@/lib/site/cardRules';
import {checkCallGame} from '@/lib/site/refCall';
import styles from '@/app/(site)/site.module.css';
/**
 * The yellow and red cards page's own sections (cards page, Nov 16 2026), shared by the English page and its Spanish twin:
 * the content comes in as data (lib/site/cardRules.ts or lib/i18n/es/cardRules.ts). Server components; the deck and the game
 * are the two client islands, and the deck's whole list is in the server HTML.
 */
export function CardRulesTop({c}:{c:CardRulesContent}){
 const N=c.next,d=cardDeckOf(c);
 return <>
  <Section id={c.deck.id} title={c.deck.title}>
   <p>{c.deck.intro}</p>
   <CardDeck id="deck" cards={d.slides} words={d.words}/>
   <p className={styles.caption}>{c.deck.extra}</p>
  </Section>
  <Section id={N.id} title={N.title}>
   <div className={styles.pair}>
    {[N.yellow,N.red].map(b=><div key={b.title} className={styles.card}><h3 className={styles.h3}>{b.title}</h3><ul>{b.points.map(p=><li key={p}>{p}</li>)}</ul></div>)}
   </div>
  </Section>
  <Section id={c.compare.id} title={c.compare.title}>
   <DataTable label={c.compare.title} head={c.compare.head} rows={c.compare.rows}/>
  </Section>
  <Section id={c.youth.id} title={c.youth.title}>
   <Bullets items={c.youth.points}/>
   <p className={styles.caption}><a href={c.youth.link.path}>{c.youth.link.name}</a>: {c.youth.link.line}.</p>
  </Section>
 </>;
}
export function CardRulesGame({c,lang}:{c:CardRulesContent;lang?:'es'}){
 return <RefCallGame game={checkCallGame(c.game)} lang={lang}/>;
}
/** The sources line under the page's one FAQ. The side questions (c.side.items) are no longer a second FAQ block (visual pass,
 *  Nov 17 2026): the page passes them to QA's `more`, so they sit in the same collapsible list after the FAQPage questions. */
export function CardRulesSources({c,checked}:{c:CardRulesContent;checked:string}){
 return <p className={styles.caption}>{c.sources.line} {c.sources.links.map((l,i)=><span key={l.url}>{i>0?' · ':''}<a href={l.url} rel="noopener">{l.name}</a></span>)}. {checked}</p>;
}
