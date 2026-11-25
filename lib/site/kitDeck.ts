/**
 * The Kit Shop chapter of the marketing sponsor PDF and its "every way your brand can appear" page (Nov 14 2026, owner: "update the
 * sponsor deck to include the NEW Kit Shop branding, and show ALL the ways sponsors can add their branding"). Printed by
 * app/(site)/marketing/overview/page.tsx; pinned by tests/marketing-page.cjs.
 *
 * Every fact here is read from the game (checked against the code Nov 14 2026):
 *  - lib/shop/dripKit.ts: the three club stickers (CLUB_STICKERS), at most MAX_CLUB_BALL per ball, the shirt spots
 *    (JERSEY_CLUB_SPOTS), CLUB_LABEL + SPONSOR_TAG on every item, coins only;
 *  - lib/shop/boots.ts DECAL_ZONES (outside, inside, toe, heel, tongue) and the 'dripfc-home' preset (Modern Speed, "Drip FC blue");
 *  - lib/shop/jersey.ts the 'dripfc-home' shirt preset ("Drip FC home");
 *  - components/shop/JerseyStudio.tsx: the club badge is "Optional, and free on any shirt";
 *  - lib/shop/clubArt.ts: the art is a one-colour shape on a transparent background, tinted by the game; bootScene.ts draws the
 *    wordmark in a 496 px strip and the crest / icon at 232 px; lib/stadium/dripfc.ts the sizes of Drip FC's own files;
 *  - lib/graphics/clubMark.ts + lib/shop/islandGear.ts + lib/multiplayer/kit.ts: friends see the shirt crest, the boot drop and
 *    the ball's club stickers (not the shirt wordmark);
 *  - the club is ONE club in code (Drip FC): the kit is a package set up with the team, not an admin upload.
 * No prices: the packages are described, never priced. The island's gashapon, vending machines and konbini are not sponsor spaces
 * and are not listed.
 */
import {CLUB_LABEL,CLUB_NAME,CLUB_STICKERS,JERSEY_CLUB_SPOTS,MAX_CLUB_BALL,SPONSOR_TAG,CLUB_COLORS} from '@/lib/shop/dripKit';
import {DECAL_ZONES} from '@/lib/shop/boots';
import {SLOT_SPECS,type SponsorSlot} from '@/lib/stadium/sponsors/slots';
import {SPONSOR_KIT_LINE} from '@/lib/site/safety';
import {STADIUM_NAME} from '@/lib/stadium/dripfc';
import {TRAIN_COUNT} from '@/lib/town/trainSchedule';

export {CLUB_LABEL,CLUB_NAME,SPONSOR_TAG,SPONSOR_KIT_LINE};
/** The chapter colour: the club's own deep navy (CLUB_COLORS.navy). */
export const KIT_NAVY=CLUB_COLORS.navy;

const stickerNames=CLUB_STICKERS.map(s=>s.label.replace(`${CLUB_NAME} `,'')).join(', ');
const zoneNames=DECAL_ZONES.map(z=>z.label.toLowerCase());
const spotNames=JERSEY_CLUB_SPOTS.map(s=>s.label.toLowerCase()).join(' or ');

export const KIT_PITCH={
 title:'Your brand in the Kit Shop',
 blurb:'Kids design their own shirt, boots and ball in the Kit Shop, then wear them round the island. A club partner’s crest and stickers sit in the studios beside everything else, for kids to use if they want to.',
 points:[
  'Kids choose it: nothing is put on a player’s kit for them',
  'Bought with game coins only, never real money',
  `Every item is labelled “${CLUB_LABEL}” with a small “${SPONSOR_TAG}” tag`,
  'No links, no pop-ups and no push to buy',
 ],
};

/** Each Kit Shop placement with its screenshot (public/marketing/kit), what it is, and what the sponsor provides. */
export type KitItem={id:string;name:string;line:string;provide:string;where:string;shot:string;caption:string};
const ART='One-colour shape on a transparent background (PNG or WebP); the game tints it';
export const KIT_ITEMS:KitItem[]=[
 {id:'ball',name:'Ball stickers',shot:'ball',caption:'Example: Drip FC stickers in the Ball studio',
  line:`A club tab in the Ball studio’s sticker tray: ${stickerNames.toLowerCase()}. Up to ${MAX_CLUB_BALL} per ball, and kids drag, size and turn each one.`,
  provide:`${ART}: a crest, a wordmark (about 4:1) and a small icon`,where:'Ball studio, then the player’s ball on the island'},
 {id:'boots',name:'Boot stickers',shot:'boots',caption:'Example: the Drip FC tab in the Boot studio',
  line:`The same three stickers in the Boot studio, for the ${zoneNames.slice(0,2).join(' and ')} sides, the ${zoneNames[2]}, the ${zoneNames[3]} and the ${zoneNames[4]}.`,
  provide:`The same art; the game draws the wordmark up to 496 px wide and the crest and icon at 232 px, so send at least that`,where:'Boot studio, then the player’s boots'},
 {id:'shirt',name:'Shirt crest and wordmark',shot:'shirt',caption:'Example: the Drip FC crest and wordmark on a shirt',
  line:`The club crest on the ${spotNames}, and the wordmark across the front, in place of the shirt sponsor. Optional, and free on any shirt.`,
  provide:`The crest and wordmark as above, plus three club colours (Drip FC: ${CLUB_COLORS.blue}, ${CLUB_COLORS.navy}, ${CLUB_COLORS.white})`,where:'Jersey studio, then the player’s shirt'},
 {id:'ready',name:'Ready-made kit',shot:'ready',caption:'Example: the Drip FC tiles with the Sponsor tag',
  line:'One-tap designs in the club’s colours: the “Drip FC home” shirt and the “Drip FC blue” Modern Speed boots, the drop on both sides. Priced in coins like any other design.',
  provide:'The club colours and the art above; the team builds the designs',where:'The preset tiles in the Jersey and Boot studios'},
 {id:'seen',name:'Seen by others',shot:'island',caption:'Example: a player in Drip FC kit on the island',
  line:'Players wear their kit round the shared island, so friends playing together see it too: the shirt crest, the drop on the boots and the club stickers on the ball.',
  provide:'Nothing more: it comes with the kit',where:'On every player who chose the kit'},
];
/** What a club partner sends, once, for the whole Kit Shop (Drip FC's own files, lib/stadium/dripfc.ts, as the example). */
export const KIT_ART=[
 {name:'Crest',spec:'Square-ish, at least 232 px',example:'Drip FC: 179 × 226 px'},
 {name:'Wordmark',spec:'About 4:1, at least 496 px wide',example:'Drip FC: 800 × 197 px'},
 {name:'Icon',spec:'Small and bold, at least 232 px',example:'Drip FC: the drop, 217 × 273 px'},
 {name:'Colours',spec:'Three: main, dark and light',example:'Drip FC: club blue, navy, white'},
];
/** How the kit works for kids (the honesty rules, lib/shop/dripKit.ts header). */
export const KIT_RULES=[
 {title:'Kids choose it',text:'Club kit is one choice among many in each studio. Nothing is added to a player’s kit for them, and a shirt without it looks as it always did.'},
 {title:'Game coins only',text:'Kit is bought only with coins earned on the island, at the usual rates. The shirt badge is free. There is no real money anywhere in the game.'},
 {title:`Labelled “${SPONSOR_TAG}”`,text:`Every club item and sticker tray says “${CLUB_LABEL}” with a small “${SPONSOR_TAG}” tag, so kids know whose it is.`},
 {title:'No links, no pressure',text:'Words and pictures only: nothing to tap through to a website, no pop-ups and nothing that asks kids to buy.'},
];

// ---- every way your brand can appear ------------------------------------------------------------------------------------------
const share=(id:SponsorSlot)=>{const n=SLOT_SPECS[id].maxSponsors;return n===1?'1 sponsor':`Up to ${n} sponsors${SLOT_SPECS[id].rotateMs?', in turn':''}`;};
export type Placement={id:string;name:string;where:string;share:string};
export const PLACEMENT_GROUPS:{id:string;title:string;line:string;items:Placement[]}[]=[
 {id:'stadium',title:STADIUM_NAME,line:'Pictures booked by date in the admin, plus two packages set up with the team.',items:[
  {id:'naming',name:'Naming rights',where:'The gate sign, the island map, the big screen’s match header and the broadcast logo',share:'1 sponsor'},
  {id:'gate',name:'Gate arch panel',where:'Over the east entrance, under the stadium sign',share:share('gate')},
  {id:'fascia',name:'Roof fascia banners',where:'Back of the two long stands’ roofs',share:share('fascia')},
  {id:'board',name:'Pitchside boards',where:'The ring of 16 boards round the pitch',share:share('board')},
  {id:'screen',name:'Big screen sponsor cards',where:'The south big screen, between matches',share:share('screen')},
  {id:'feed',name:'Broadcast feed logo',where:'Top right of the live match feed, back of the big screen',share:'1 sponsor'},
  {id:'centre',name:'Centre circle logo',where:'Painted on the grass at the centre spot',share:share('centre')},
  {id:'flag',name:'Plaza flag banners',where:'Under the flags lining Stadium Plaza, while booked',share:share('flag')},
 ]},
 {id:'kit',title:'Kit Shop',line:'Optional club kit kids choose, built by the team with one club partner.',items:[
  {id:'ball',name:'Ball stickers',where:`Ball studio, up to ${MAX_CLUB_BALL} per ball, seen on the island`,share:'1 club partner'},
  {id:'boots',name:'Boot stickers',where:'Boot studio: sides, heel, toe and tongue',share:'1 club partner'},
  {id:'shirt',name:'Shirt crest and wordmark',where:'Jersey studio: chest or sleeve, wordmark across the front',share:'1 club partner'},
  {id:'ready',name:'Ready-made kit',where:'A home shirt and boots in the club’s colours',share:'1 club partner'},
 ]},
 {id:'train',title:'Island Line trains',line:'Kindness wraps on the trains, drawn by the team from your art.',items:[
  {id:'panels',name:'Car-side wrap',where:'Crest, slogan and motif panels on both sides of both cars',share:`Per train, up to ${TRAIN_COUNT}`},
  {id:'badge',name:'Cab badge',where:'Your crest on the front of each cab',share:'Comes with the wrap'},
 ]},
];
/** Every placement id the overview page lists (the test checks the stadium ones against SLOT_SPECS). */
export const ALL_PLACEMENT_IDS=PLACEMENT_GROUPS.flatMap(g=>g.items.map(i=>i.id));

/** The kit as a package (the packages page, beside the feed logo and naming rights). */
export const KIT_PACKAGE={id:'kit',name:'Club kit in the Kit Shop',line:'Stickers for balls and boots, the crest and wordmark on shirts, and a ready-made home shirt and boots, all in the club’s colours. Set up with the team; it sits naturally with naming rights.',today:CLUB_NAME,shot:'ready'};
