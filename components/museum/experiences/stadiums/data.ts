import type {MuseumSource} from '@/lib/endgame/museum';
/**
 * stadiums · "Stadiums of the World" (Oct 12 2026; replaces the yellow and red cards case. User: "replace the yellow and red cards
 * with stadiums of the world", "show a bunch of stadiums and breakdown how they are built").
 *
 * Seven famous stadiums, each drawn as a Paper isometric model that comes apart into five layers (the ground, the pitch, the
 * stands, the roof, the outside). Every number a kid sees here is from the stadium's Wikipedia article (checked Oct 12 2026), and
 * seat counts are shown rounded ("about 73,000") because they change after every rebuild. The models are drawings, not survey
 * plans: their sizes are in metres and in proportion, with the pitch's layers drawn thicker so you can see them.
 */
export type LayerId='ground'|'pitch'|'stands'|'roof'|'outside';
/** Bottom to top: the order the model snaps back together in "Build it". */
export const LAYERS:readonly LayerId[]=['ground','pitch','stands','roof','outside'];
export const LAYER_NAME:Readonly<Record<LayerId,string>>={ground:'Foundations',pitch:'The pitch',stands:'The stands',roof:'The roof',outside:'The outside'};

/** One tier of seats: `rows` steps (each step stands for a few real rows), each `run` m deep and `rise` m high. An upper tier
 *  starts `overhang` m in front of the tier below's back edge (a cantilever) and `gap` m above its top. */
export type Tier={rows:number;run:number;rise:number;overhang?:number;gap?:number;tint?:string};
export type OutsideKind='columns'|'fins'|'glass'|'cushions'|'pylons'|'towers'|'tent';
export type Stadium={
 id:string;name:string;city:string;country:string;opened:number;
 /** Seats today (the article's figure), shown rounded. */
 seats:number;
 /** A famous match or record, one line. */
 famous:string;
 /** The one thing that gives it away, for the "Which stadium?" round. */
 clue:string;
 /** Plan: the inner edge of the stands (the pitch surround) as an oval or a rounded rectangle, half-sizes in metres. */
 shape:'oval'|'rect';ax:number;ay:number;rc:number;
 tiers:Tier[];
 /** Roof ring: from `dIn` m out from the inner edge to `over` m past the stands' back, `lift` m above the top step. */
 roof:{dIn:number;over:number;lift:number;rise:number;kind:'membrane'|'steel'|'cushion'};
 /** Signature roof parts (drawn with the roof layer). */
 arch?:boolean;girders?:boolean;slide?:boolean;
 outside:OutsideKind;
 /** A stand painted in a real colour (Dortmund's Yellow Wall: the south end). */
 wall?:{side:'south';color:string};
 /** Colour only where colour is the point (the Yellow Wall's pylons, Munich's glowing cushions, Milan's red girders, Qatar's tent). */
 color?:string;
 lines:Readonly<Record<LayerId,string>>;
 source:MuseumSource;
};
const W=(page:string,title=page.replace(/_/g,' ')):MuseumSource=>({title:`Wikipedia · ${decodeURIComponent(title)}`,url:`https://en.wikipedia.org/wiki/${page}`});

/** Shared kid lines for the two layers every stadium has the same way. */
const GROUND='Concrete feet and a thick slab spread the stadium’s huge weight into the ground, so it never sinks.';
const PITCH='Under the grass: sand for the roots, gravel, and pipes that drain the rain away.';

export const STADIUMS:readonly Stadium[]=[
 {id:'maracana',name:'Maracanã',city:'Rio de Janeiro',country:'Brazil',opened:1950,seats:73139,
  famous:'1950 World Cup: 199,854 people watched Uruguay beat Brazil 2–1.',clue:'It was built for the 1950 World Cup, and almost 200,000 people once squeezed in.',
  shape:'oval',ax:92,ay:66,rc:0,tiers:[{rows:6,run:5,rise:2.3},{rows:6,run:5.4,rise:3,overhang:4,gap:3}],
  roof:{dIn:14,over:3,lift:7,rise:3,kind:'membrane'},outside:'columns',
  lines:{ground:GROUND,pitch:PITCH,stands:'Two rings of seats in a big oval. The top ring leans out over the bottom one.',
   roof:'A tight white skin of fabric, stretched on cables, keeps the rain off almost every seat.',outside:'A ring of concrete columns holds the stands up from outside.'},
  source:W('Maracan%C3%A3_Stadium','Maracanã Stadium')},
 {id:'wembley',name:'Wembley',city:'London',country:'England',opened:2007,seats:90000,
  famous:'Women’s Euro 2022 final: England 2–1 Germany, in front of 87,192 fans.',clue:'A giant white arch, 133 metres tall, holds up its roof.',
  shape:'rect',ax:64,ay:46,rc:26,tiers:[{rows:5,run:5,rise:2.4},{rows:4,run:5,rise:2.8,overhang:3,gap:4},{rows:5,run:5.2,rise:3.4,overhang:4,gap:4}],
  roof:{dIn:10,over:4,lift:8,rise:5,kind:'steel'},arch:true,outside:'glass',
  lines:{ground:GROUND,pitch:PITCH,stands:'Three tiers of seats wrap all the way round, 90,000 of them.',
   roof:'The arch holds up the whole north roof and most of the south roof, with steel cables.',outside:'A wall of glass and metal panels closes the bowl in.'},
  source:W('Wembley_Stadium')},
 {id:'azteca',name:'Estadio Azteca',city:'Mexico City',country:'Mexico',opened:1966,seats:87523,
  famous:'Two World Cup finals: Brazil 4–1 Italy in 1970, Argentina 3–2 West Germany in 1986.',clue:'The first stadium to host two World Cup finals.',
  shape:'rect',ax:66,ay:46,rc:40,tiers:[{rows:7,run:5,rise:2.5},{rows:2,run:4,rise:3,overhang:0,gap:3},{rows:5,run:5,rise:3.4,overhang:3,gap:3}],
  roof:{dIn:20,over:3,lift:6,rise:4,kind:'steel'},outside:'fins',
  lines:{ground:GROUND,pitch:PITCH,stands:'A steep lower bowl, a ring of boxes, then a high upper tier close to the pitch.',
   roof:'A ring of roof shades the top seats from the hot Mexico City sun.',outside:'A ring of tall concrete columns stands around the outside.'},
  source:W('Estadio_Azteca')},
 {id:'allianz',name:'Allianz Arena',city:'Munich',country:'Germany',opened:2005,seats:75024,
  famous:'Opening match of the 2006 World Cup: Germany 4–2 Costa Rica.',clue:'Its outside is made of air cushions that glow red, blue or white.',
  shape:'rect',ax:62,ay:44,rc:22,tiers:[{rows:5,run:4.6,rise:2.6},{rows:4,run:4.6,rise:3,overhang:3,gap:4},{rows:5,run:4.8,rise:3.6,overhang:3,gap:4}],
  roof:{dIn:8,over:6,lift:6,rise:4,kind:'cushion'},outside:'cushions',color:'#e4322b',
  lines:{ground:GROUND,pitch:PITCH,stands:'Three steep tiers, so every fan sits close to the pitch.',
   roof:'The roof is clear air cushions too, letting light reach the grass.',outside:'2,760 cushions of thin plastic foil, blown up with air. Lights inside make them glow.'},
  source:W('Allianz_Arena')},
 {id:'dortmund',name:'Signal Iduna Park',city:'Dortmund',country:'Germany',opened:1974,seats:81365,
  famous:'The south stand, the Yellow Wall, holds 24,454 standing fans.',clue:'Its south stand, the Yellow Wall, is the biggest standing terrace in European football.',
  shape:'rect',ax:60,ay:42,rc:6,tiers:[{rows:6,run:5,rise:2.5},{rows:5,run:5.4,rise:3.2,overhang:2,gap:3}],
  roof:{dIn:12,over:3,lift:7,rise:3,kind:'steel'},outside:'pylons',color:'#f2c230',wall:{side:'south',color:'#f2c230'},
  lines:{ground:GROUND,pitch:PITCH,stands:'Four big stands hug the pitch. The south one is one giant, steep standing terrace.',
   roof:'A steel roof covers the stands, held by cables from outside.',outside:'Tall yellow towers stand outside and hold the roof up with steel cables.'},
  source:W('Westfalenstadion','Westfalenstadion (Signal Iduna Park)')},
 {id:'sansiro',name:'San Siro',city:'Milan',country:'Italy',opened:1926,seats:75817,
  famous:'Home of two clubs at once: AC Milan and Inter.',clue:'Eleven towers with spiral ramps stand around it.',
  shape:'rect',ax:62,ay:44,rc:20,tiers:[{rows:5,run:5,rise:2.4},{rows:4,run:5,rise:3,overhang:3,gap:3},{rows:4,run:5,rise:3.4,overhang:3,gap:4}],
  roof:{dIn:12,over:3,lift:6,rise:2,kind:'steel'},girders:true,outside:'towers',color:'#e4322b',
  lines:{ground:GROUND,pitch:PITCH,stands:'Three tiers. The top one was added for the 1990 World Cup.',
   roof:'Big red steel girders sit on four corner towers and carry the roof.',outside:'Eleven concrete towers wrapped in spiral ramps lead fans up to the top tier.'},
  source:W('San_Siro')},
 {id:'albayt',name:'Al Bayt Stadium',city:'Al Khor',country:'Qatar',opened:2021,seats:68895,
  famous:'Opening match of the 2022 World Cup: Qatar 0–2 Ecuador.',clue:'It is shaped like a desert tent, with black, white and red stripes.',
  shape:'rect',ax:62,ay:44,rc:30,tiers:[{rows:6,run:5,rise:2.4},{rows:5,run:5.2,rise:3.1,overhang:3,gap:4}],
  roof:{dIn:6,over:4,lift:6,rise:5,kind:'membrane'},slide:true,outside:'tent',color:'#8e2b2b',
  lines:{ground:GROUND,pitch:PITCH,stands:'Rows of seats on all four sides, close to the pitch.',
   roof:'A roof that can slide shut over the pitch, to keep out the sun and the weather.',outside:'A huge tent of fabric, striped like the tents of Qatar’s desert people.'},
  source:W('Al_Bayt_Stadium')},
];
export const stadiumById=(id:string)=>STADIUMS.find(s=>s.id===id)??STADIUMS[0];
/** "about 73,000" (seat counts change with every rebuild, so the game shows them rounded to the nearest thousand). */
export const aboutSeats=(n:number)=>`about ${(Math.round(n/1000)*1000).toLocaleString('en-GB')}`;

/** The pitch, as built under the grass (the layers' names and order: GeoSmart, "the hidden engineering beneath every World Cup
 *  stadium"). Real layers are a few centimetres to about a metre thick; the model draws each about 1.5 m so they show. */
export const PITCH_LAYERS=[
 {id:'drains',name:'Drain pipes',line:'A net of pipes carries rain water away.',color:'#b9a68a'},
 {id:'gravel',name:'Gravel',line:'Gravel lets water run down evenly. Warm pipes can sit on top.',color:'#b4b3ad'},
 {id:'sand',name:'Sand root zone',line:'Sand, not soil: it drains fast and the roots grow deep.',color:'#e3d4ab'},
 {id:'grass',name:'Grass',line:'Mown in stripes, with the lines painted on.',color:'#6aa363'},
] as const;

export const BEATS=[
 {when:'Rio, 1950',head:'The biggest crowd',text:'199,854 people squeezed into the brand-new Maracanã to watch the 1950 World Cup decider.'},
 {when:'Every stadium',head:'Built in layers',text:'Under every stadium are foundations. On top: the pitch, the stands, the roof and the outside.'},
 {when:'Your turn',head:'Take them apart',text:'Turn seven famous stadiums, pull them apart, snap one back together, then spot them from a clue.'},
] as const;

/** The quick check at the end (StepCheck). */
export const CHECK={q:'Which part of a stadium goes at the very bottom?',options:['The roof','The foundations','The seats'] as const,answer:1,
 why:'The foundations spread the stadium’s huge weight into the ground. Everything else stands on them.'};

/** Best score (synced: lib/saves/snapshot.ts SYNC_KEYS). */
export const BEST_KEY='fi2-museum-stadiums-best';

/** Sources beyond the case's own (the pitch layers, foundations). */
export const EXTRA_SOURCES:readonly MuseumSource[]=[
 {title:'GeoSmart · More than just grass: the hidden engineering beneath every World Cup stadium',url:'https://geosmartinfo.co.uk/blog/more-than-just-grass-the-hidden-engineering-beneath-every-world-cup-stadium/'},
 W('Deep_foundation'),
 ...STADIUMS.map(s=>s.source),
];
