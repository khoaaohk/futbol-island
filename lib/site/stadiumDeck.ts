/**
 * The DRIP FC Stadium chapter of the marketing sponsor PDF (Nov 13 2026, owner: "add the stadium and the opportunity for sponsors
 * to place their logo and branding throughout it ... show all the spots they can place it"). Printed by
 * app/(site)/marketing/overview/page.tsx; pinned by tests/marketing-page.cjs.
 *
 * Every number here comes from the game's own data: the picture shape, smallest width and sponsor count from
 * lib/stadium/sponsors/slots.ts SLOT_SPECS, the places from lib/town/stadiumSeats.ts stadiumSponsorLayout, what shows today from
 * lib/stadium/sponsors/placeholders.ts and surfaces.ts, the name from lib/stadium/dripfc.ts. Checked against the code Nov 13 2026:
 *  - the gate panel shows a welcome by default (the DRIP FC Stadium sign above it carries the name);
 *  - the roof fascia shows Footy Access by default (adidas waits until its deal is final);
 *  - the plaza flag banners are built only while a flag sponsor is booked (the deck's flag picture is example artwork);
 *  - the centre circle shows Drip FC's painted drop until a centre sponsor is booked.
 * No prices: the packages are described, never priced.
 */
import {SLOT_SPECS,aspectText,type SponsorSlot} from '@/lib/stadium/sponsors/slots';
import {STADIUM_NAME} from '@/lib/stadium/dripfc';
import {CONTACT_EMAIL} from '@/lib/site/aboutCopy';
import {SPONSOR_BOARDS_LINE} from '@/lib/site/safety';

export {STADIUM_NAME,SPONSOR_BOARDS_LINE};
/** The stadium's chapter colour: the gate sign's own green (lib/stadium/dripfc.ts drawGateSign / stadiumWorld.ts). */
export const STADIUM_GREEN='#244d49';

export const STADIUM_PITCH={
 title:STADIUM_NAME,
 blurb:'A walkable outdoor stadium in a landscaped park on the island’s new west coast. Kids walk in through the plaza, sit in the stands, watch big matches on the pitch and join live games.',
 points:[
  'Four stands, a big screen and floodlights for night matches',
  'A teaching cast: guides, coaches, referees, a camera crew, photographers and a mascot, each with a football idea to share',
  '12 ball-hunt lessons hidden round the plaza, the park, the stands and the roofs',
  'Named after its naming partner, Drip FC',
 ],
};

export type DeckSlot={pin:number;id:SponsorSlot;name:string;line:string;where:string;today:string;shot:string;example:string};
/** The six picture slots, in pin order (the overhead plan's numbers). Size and count come from SLOT_SPECS. */
export const DECK_SLOTS:DeckSlot[]=[
 {pin:1,id:'board',name:'Pitchside boards',line:'A ring of 16 boards round the pitch, facing the stands. Pictures scroll slowly and take turns, so neighbouring boards never match.',where:'Round the pitch',today:'Drip FC on every third board, Futbol Island coaching habits between',shot:'boards',example:'Example: Drip FC and Futbol Island panels'},
 {pin:2,id:'screen',name:'Big screen sponsor cards',line:'The big screen at the south end shows a full-screen sponsor card between matches. During a match it shows the score.',where:'South end, above the stand',today:'Drip FC and Futbol Island cards in turn',shot:'screen',example:'Example: a Futbol Island card'},
 {pin:3,id:'gate',name:'Gate arch panel',line:'The panel over the east entrance, right under the DRIP FC Stadium sign. Every visitor walks in beneath it.',where:'East entrance, from the plaza',today:'A “Welcome to the stadium” panel',shot:'gate',example:'Shown: the welcome panel under the stadium sign'},
 {pin:4,id:'fascia',name:'Roof fascia banners',line:'Banners along the back of both long stands’ roofs, 100 m each, seen from the plaza, the park and overhead.',where:'Back of the east and west roofs',today:'Footy Access',shot:'fascia',example:'Example: the Footy Access banner'},
 {pin:5,id:'flag',name:'Plaza flag banners',line:'Upright banners under the national flags that line Stadium Plaza on the walk in. They go up only while a flag sponsor is booked.',where:'Stadium Plaza, 14 flag poles',today:'Not shown until booked',shot:'flags',example:'Example artwork, not a real sponsor'},
 {pin:6,id:'centre',name:'Centre circle logo',line:'A round logo painted on the grass at the centre spot, seen from the stands and from the air.',where:'Centre of the pitch',today:'Drip FC’s drop, painted on the grass',shot:'centre',example:'Example: Drip FC’s drop'},
];
export const slotSize=(id:SponsorSlot)=>{const s=SLOT_SPECS[id];return `${aspectText(s.aspect)} picture, at least ${s.minWidth} px wide`;};
export const slotShare=(id:SponsorSlot)=>{const n=SLOT_SPECS[id].maxSponsors;return n===1?'1 sponsor':`Up to ${n} sponsors${SLOT_SPECS[id].rotateMs?', taking turns':''}`;};

/** The two packages that are not picture uploads: set up with the team. */
export const DECK_PACKAGES=[
 {pin:7,id:'feed',name:'Broadcast feed logo',line:'The back of the big screen faces the park. While a match is on it shows the game live, like a TV broadcast, with a score box and a logo in the top-right corner.',today:'DRIP FC',shot:'feed'},
 {pin:8,id:'naming',name:'Naming rights',line:'The stadium’s name everywhere it appears: the sign above the gate, the label on the island map, the big screen’s match header and the broadcast logo.',today:STADIUM_NAME,shot:'night'},
] as const;

/** How it works for families (lib/site/safety.ts SPONSOR_BOARDS_LINE, the privacy policy, lib/analytics/sponsorEvents.ts). */
export const STADIUM_FAMILY_RULES=[
 {title:'Pictures only',text:'No links, no tracking, no pop-ups and no video ads.'},
 {title:'Nothing to buy',text:'Nothing in the stadium asks kids to buy anything.'},
 {title:'The same for every player',text:'Every player sees the same pictures. Nothing is chosen for one child.'},
 {title:'Combined totals only',text:'Sponsors see anonymous totals of everyone together: stadium visits, pitchside boards seen and big-screen sponsor cards seen, each counted once per visit. Never anything about one child.'},
 {title:'A small “Sponsor” tag',text:'Every sponsor picture carries a small “Sponsor” tag, drawn in by the game, so an uploaded picture can never leave it out.'},
 {title:'Booked by date',text:'The team uploads each picture with a start and end date in the admin. Between bookings the slot goes back to its built-in panels.'},
];
export const STADIUM_NEXT={title:'Put your brand in the stadium',line:'Every slot and package is booked with the team. To talk about one, email',email:CONTACT_EMAIL};
