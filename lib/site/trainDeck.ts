/**
 * The Island Line chapter of the marketing sponsor PDF (Nov 25 2026, owner: "update the marketing pdf to include the option to have
 * branding on trains"). Printed by app/(site)/marketing/overview/page.tsx after the Kit Shop chapter; pinned by tests/marketing-page.cjs.
 *
 * Every fact here is read from the game (checked against the code Nov 25 2026):
 *  - lib/town/trainSchedule.ts: TRAIN_COUNT trains of TRAIN_CARS cars, a train every HEADWAY s at each station;
 *  - lib/town/trainTrack.ts TRAIN_STATIONS: the 5 stations; lib/town/trainRoof.ts: players ride on the roof as well as inside;
 *  - lib/town/trainWraps.ts: one kindness theme per train (WRAP_THEMES: the slogan, the boarding note, Conductor Kenji's talk), 4 panels
 *    a side on every car (PANELS) + the cab badge (BADGE), ONE canvas atlas and ONE mesh for every wrap of every train (one draw);
 *  - lib/town/trainWrapArt.ts WRAP_TILES: the crest panel (crest roundel + wordmark tab), the slogan panel (the crest beside the slogan
 *    pill), two motif panels (football objects in the club's colours); the badge is the crest in a roundel;
 *  - today every wrap is Drip FC's (lib/shop/clubArt.ts, the same crest and wordmark files the Kit Shop uses).
 * The wraps are drawn in code: a brand's wrap is a package the team builds from the brand's art, never an admin upload.
 * Not offered, because it is not built: a named train ("the <Brand> Express") on the departure boards or the map (the boards show only
 * the minutes and the destination). No prices: the packages are described, never priced.
 */
import {TRAIN_COUNT,TRAIN_CARS,HEADWAY} from '@/lib/town/trainSchedule';
import {TRAIN_STATIONS} from '@/lib/town/trainTrack';
import {PANELS,WRAP_THEMES} from '@/lib/town/trainWraps';
import {LIVERIES} from '@/lib/town/trainLiveries';
import {CLUB_NAME,SPONSOR_TAG} from '@/lib/shop/dripKit';

/** The chapter colour: train A's maroon lower body (trainLiveries.ts), the frame round its wrap panels. */
export const TRAIN_MAROON=LIVERIES[0].lower;
const themes=WRAP_THEMES.map(t=>`“${t.name}”`);
const slogan=(i:number)=>WRAP_THEMES[i].slogan.join(' ');

export const TRAIN_PITCH={
 title:'The Island Line',
 blurb:`A railway right round the island. ${TRAIN_COUNT} trains of ${TRAIN_CARS} cars run all day, and each one teaches a way to be kind in football.`,
 points:[
  `${TRAIN_STATIONS.length} stations, from North Beach to Coral Cay, with a train every ${HEADWAY/60} minutes at each`,
  'Kids ride inside with the passengers or up on the roof as it rolls',
  `Three kindness trains: ${themes.slice(0,2).join(', ')} and ${themes[2]}`,
  'Each one teaches through its wrap, the note as you board and a chat with Conductor Kenji',
 ],
};

/** Where a brand appears on a train, each with its screenshot (public/marketing/train). */
export type TrainItem={id:string;name:string;line:string;where:string;provide:string;shot:string;caption:string};
export const TRAIN_ITEMS:TrainItem[]=[
 {id:'panels',name:'Car-side wrap',shot:'wrap',caption:`Example: the ${WRAP_THEMES[0].name} train, with its “${SPONSOR_TAG}” tag`,
  line:`${['','One','Two','Three','Four','Five'][PANELS.length]??PANELS.length} panels on each side of every car: your crest over your wordmark, your crest beside the train’s slogan (“${slogan(0)}”), then two panels of football things in your colours.`,
  where:TRAIN_CARS===2?'Both sides of both cars':`Both sides of all ${TRAIN_CARS} cars`,provide:'Crest, wordmark and three colours, as for the Kit Shop'},
 {id:'badge',name:'Cab badge',shot:'badge',caption:`Example: the ${CLUB_NAME} crest over the headmark`,
  line:'A round badge with your crest on the front of each cab, over the headmark. It is the first thing kids see as a train pulls in.',
  where:'Both cab ends of the train',provide:'Nothing more: it uses your crest'},
 {id:'ride',name:'Seen all round the island',shot:'ride',caption:'Example: two trains on North Beach',
  line:`The trains never stop running, so the wraps pass the beaches, the stadium and the town all day. Players see them from the platforms, the beaches and the streets.`,
  where:`All ${TRAIN_STATIONS.length} stations and the line between`,provide:'Nothing more: it comes with the wrap'},
];

/** How train wraps work for kids (the stadium and Kit Shop rules, applied to the trains). */
export const TRAIN_RULES=[
 {title:'A lesson on every wrap',text:`Every wrap carries a kindness slogan, like “${slogan(1)}”. The note as you board and Kenji’s chat explain the football behind it.`},
 {title:'Pictures and words only',text:'No prices, no links, no “buy now” and nothing to tap through to. The trains never ask kids to buy anything.'},
 {title:'Kid-safe brands only',text:'The team agrees every brand and every panel before it goes on a train, and keeps the island’s kind, friendly look.'},
 {title:`A small “${SPONSOR_TAG}” tag`,text:`A brand’s wrap carries the same small “${SPONSOR_TAG}” tag as the stadium and the Kit Shop, so kids know whose it is.`},
 {title:'The same for every player',text:'Every player sees the same trains on the same timetable. Nothing is chosen for one child.'},
 {title:'Light on phones',text:'All three trains’ wraps are one picture sheet, drawn in a single pass. A brand’s wrap replaces the art in that sheet and adds no extra work.'},
];

/** The packages: set up with the team (the team draws the wraps from the brand's art). */
export const TRAIN_PACKAGES=[
 {id:'one',name:'One train',line:'One kindness train, both cars, both sides and both cab badges, in your crest and colours.'},
 {id:'line',name:'The whole line',line:`All ${TRAIN_COUNT} trains, each with its own kindness slogan, so your brand is on every train that pulls in.`},
] as const;
/** The trains as a package (the packages page, beside the feed logo, naming rights and the kit). */
export const TRAIN_PACKAGE={id:'train',name:'Island Line train wraps',line:`One train or all ${TRAIN_COUNT}: the car-side wrap and the cab badges, each wrap with its kindness slogan. Set up with the team, which draws the wraps from your art.`,today:`${CLUB_NAME}, all ${TRAIN_COUNT} trains`,shot:'hero'};
