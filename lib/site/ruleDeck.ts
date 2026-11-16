/**
 * The swipeable info deck's data shape (components/site/CardDeck.tsx; cards page Nov 16 2026, generalised the same day for the
 * back-pass, throw-in, handball and fouls pages, lib/site/rulePlay.ts). A slide is one card: a colour tone, a line icon
 * (components/site/CardIcons.tsx), a name on the front, and an explanation, an example and a "what happens" line on the back.
 * The small label at the top of each card is the deck's word for its tone ("Yellow card", "Hands allowed").
 */
export type DeckTone='yellow'|'red'|'pitch'|'gold';
export const DECK_ICONS=['dive','talk','repeat','clock','distance','enter','leave','studs','fist','spit','hand','goal','mouth','twoCards',
 'throw','head','deflect','trick','whistle','feet','spot','cross','flag','bigger','pass','shoulder','close','gloves','trip','hold','highFoot','block'] as const;
export type DeckIcon=typeof DECK_ICONS[number];
export type DeckSlide={id:string;tone:DeckTone;icon:DeckIcon;name:string;explain:string;example:string;next:string};
export type DeckWords={label:string;kinds:Partial<Record<DeckTone,string>>;flip:string;flipBack:string;prev:string;next:string;
 /** "Card {n} of {total}" */position:string;example:string;then:string;how:string};
