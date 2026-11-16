import CardDeck from '@/components/site/CardDeck';
import RefCallGame from '@/components/site/RefCallGame';
import {Section} from '@/lib/site/GuideParts';
import {checkCallGame} from '@/lib/site/refCall';
import type {RulePlayContent} from '@/lib/site/rulePlay';
/**
 * The back-pass, throw-in, handball and fouls pages' deck and game (Nov 16 2026), shared by the English pages and their Spanish
 * twins: the content comes in as data (lib/site/rulePlay.ts or lib/i18n/es/rulePlay.ts). The same two client islands as the
 * yellow and red cards page (components/site/CardRulesSections.tsx); the deck's whole list is in the server HTML.
 */
export function RulePlayDeck({c}:{c:RulePlayContent}){
 return <Section id={c.deck.id} title={c.deck.title}>
  <p>{c.deck.intro}</p>
  <CardDeck id="deck" cards={c.slides} words={c.deck.words}/>
 </Section>;
}
export function RulePlayGame({c,lang}:{c:RulePlayContent;lang?:'es'}){
 return <RefCallGame game={checkCallGame(c.game)} lang={lang}/>;
}
