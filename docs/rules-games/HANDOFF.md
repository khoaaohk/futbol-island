# Rules pages: decks and ref-call games (Nov 16 2026, branch `rules-pages`)

The yellow and red cards page's swipeable deck and "make the call" game now also run on four rule pages, in English and at
their /es twins:

| Page | Deck | Game | Choices |
| --- | --- | --- | --- |
| /learn/soccer-rules/back-pass-rule | 6 cards | Can the keeper pick it up? (13) | No, feet only / Yes, pick it up |
| /learn/soccer-rules/throw-in | 8 cards | Good throw or foul throw? (13) | Foul throw / Good throw |
| /learn/soccer-rules/handball | 7 cards | Handball or not? (13) | Not handball / Handball |
| /learn/soccer-rules/fouls-and-free-kicks | 8 cards | Direct, indirect or play on? (14) | Play on / Indirect / Direct |

## Where things are
- Content: `lib/site/rulePlay.ts` (English, with the IFAB sources in its header) and `lib/i18n/es/rulePlay.ts` (Spanish text
  only; ids, tones, icons, swipes and answers come from English, and `merge` throws on a missing or extra id).
- Shared parts: `lib/site/ruleDeck.ts` (slide shape, tones `yellow|red|pitch|gold`, the icon list), `lib/site/refCall.ts`
  (choices now have their own ids and an optional `tone`; `checkCallGame` takes 2-3 choices and 10-15 scenarios),
  `components/site/CardDeck.tsx`, `RefCallGame.tsx`, `CardIcons.tsx` (18 new icons), `RulePlaySections.tsx`.
- The cards page maps its offences onto the deck with `cardDeckOf` (lib/site/cardRules.ts); its look and data are unchanged.
- Page order on the four pages: answer, deck, diagram, game, then the usual sections. The print sheet stays the normal rule
  sheet (printSheet.module.css now keys the card-rules layout on `section[aria-labelledby=card-rules]`).
- Tests: `tests/rules-games.cjs` (in TEST_CORE_CHAIN after cards-page.cjs). No new storage keys, routes or JSON-LD types.

## Rule calls worth a second look
- Back-pass: "keeper stops a teammate's kick with a foot, then picks it up" is called a back-pass offence (common referee
  reading; the Law text says "deliberately kicked to the goalkeeper").
- Handball: "arm put down to break a fall" and "arm close to the body" are "usually not" (the 2021+ text has no list of
  exceptions; it is the "justifiable by the body movement" test). "Arms raised high when jumping to block" is called handball.
- Throw-in: a throw from the wrong place is a foul throw (Law 15: not taken correctly = the other team's throw).
- Fouls game: everything is set in midfield so "direct" is never a penalty; the back-pass scenario says "inside their own
  penalty area".
