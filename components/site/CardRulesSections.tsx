import CardDeck from '@/components/site/CardDeck';
import RefCallGame from '@/components/site/RefCallGame';
import {DataTable,Section} from '@/lib/site/GuideParts';
import type {CardRulesContent} from '@/lib/site/cardRules';
import {checkCallGame} from '@/lib/site/refCall';
import styles from '@/app/(site)/site.module.css';
/**
 * The yellow and red cards page's own sections (cards page, Nov 16 2026), shared by the English page and its Spanish twin:
 * the content comes in as data (lib/site/cardRules.ts or lib/i18n/es/cardRules.ts). Server components; the deck and the game
 * are the two client islands, and the deck's whole list is in the server HTML.
 */
export function CardRulesTop({c}:{c:CardRulesContent}){
 const N=c.next;
 return <>
  <Section id={c.deck.id} title={c.deck.title}>
   <p>{c.deck.intro}</p>
   <CardDeck id="deck" cards={c.offences} words={c.deck.words}/>
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
 </>;
}
export function CardRulesGame({c,lang}:{c:CardRulesContent;lang?:'es'}){
 return <RefCallGame game={checkCallGame(c.game)} lang={lang}/>;
}
export function CardRulesSide({c,checked}:{c:CardRulesContent;checked:string}){
 return <Section id={c.side.id} title={c.side.title}>
  <ul className={styles.stack}>{c.side.items.map(x=><li key={x.q} className={styles.card}><h3 className={styles.h3}>{x.q}</h3><p>{x.a}</p></li>)}</ul>
  <p className={styles.caption}>{c.sources.line} {c.sources.links.map((l,i)=><span key={l.url}>{i>0?' · ':''}<a href={l.url} rel="noopener">{l.name}</a></span>)}. {checked}</p>
 </Section>;
}
