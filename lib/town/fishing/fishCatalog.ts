/**
 * Fishing catalogue: species, their football links and the island's fishing spots.
 *
 * Football learning (AGENTS.md): every species is linked to a REAL club whose nickname, city or fan culture comes from the
 * sea, with one verified fact and its source (checked Sep 27 2026, see docs/fishing.md). Which fish swim at which island
 * spot, and the spot names, are ORIGINAL GAME FICTION — the UI labels the two differently ("Real football fact" vs
 * "Island story").
 *
 * Prices are in-game coins, fixed per species (never real money, never tied to size or luck). Rarity is shown only as a
 * word ("Common catch" … "Legendary catch"); the weights below are internal and never displayed.
 */
import {SPECIAL_FISH} from './fishSpecials';
import {DEEP_SEA_FISH} from './deepSeaFish';
import {BOAT_BUOY,BOAT_DECK_Y,BOAT_PROMPT,BOAT_SPOT_ID,BOAT_STAND} from './deepSeaBoatData';
import {EAST_PIER_FISHING} from '../eastPier';
export type FishId=string;
export type FishRarity='common'|'uncommon'|'rare'|'legendary';
export type ShadowSize='small'|'medium'|'large'|'huge'|'giant';
/** Shadow length in metres for each size. */
export const SHADOW_LENGTH:Record<ShadowSize,number>={small:.45,medium:.7,large:1,huge:1.45,giant:1.9};
export const SHADOW_LABEL:Record<ShadowSize,string>={small:'Small shadow',medium:'Medium shadow',large:'Large shadow',huge:'Huge shadow',giant:'Giant shadow'};
export type SpotId='south-pier'|'west-pier'|'harbour-wall'|'north-rocks'|'west-cove'|'deep-sea-boat'|'east-pier'
 /** Oct 5 2026: three posts along the Coral Cay causeway and three round the cay's shore (see FISH_SPOTS). */
 |'causeway-gate'|'causeway-channel'|'turtle-bank'|'coral-garden'|'sharks-beach'|'farm-beach';
/** What kind of sea animal it is (sharks reel like legendary animals: 10-14 taps). */
/** Fish (incl. sharks, rays, eels, seahorses) plus a few crustaceans, shellfish and the octopus. NO marine mammals or reptiles (user decision, Sep 28 2026; tests/fishing.cjs keeps a denylist). */
export type AnimalGroup='fish'|'shark'|'ray'|'eel'|'crab'|'lobster'|'shellfish'|'octopus'|'squid'|'seahorse';
export type FishShape='shrimp'|'slim'|'round'|'long'|'shark'|'octopus'|'crab'|'lobster'|'ray'|'eel'|'squid'|'seahorse'|'shell'|'hammerhead'|'billfish'|'angler'|'mola';
export type ClubLinkKind='Nickname'|'Port city'|'Fan culture'|'Football culture'|'Crest'|'Mascot'|'Club name';
export type FishSpecies={
 id:FishId;name:string;plural:string;rarity:FishRarity;
 group:AnimalGroup;
 /** A deep-sea / offshore creature: the Deep Sea Boat's catch table favours these (docs/fishing.md). */
 deepSea?:boolean;
 /** Where it can be caught. One spot = a spot-exclusive special (docs/fishing.md). Which animal lives where is island fiction. */
 spots:SpotId[];
 /** Optional internal catch weight (overrides RARITY_WEIGHT; never shown). */
 weight?:number;
 /** Coins per fish at the market stand (full price; the shared daily soft cap lives in lib/town/market/market.ts). */
 price:number;
 /** Size range in cm (kid-scale, roughly realistic). */
 size:[number,number];
 color:string;belly:string;
 /** Body shape for the 2D art. */
 shape:FishShape;
 /** Size of the dark shadow it casts in the water (small / medium / large / huge), the only clue before the catch. */
 shadow:ShadowSize;
 club:{name:string;country:string;link:ClubLinkKind;nickname?:string;fact:string;
  /** Main source URL (data/docs only: kids see a plain "Source: …" credit, never a link). */
  source:string;
  /** Further source URLs that back the fact (data/docs only). */
  sources?:string[];
  /** Plain-text credit shown to kids, e.g. "Wikipedia (Italian)". Defaults to the source's site name. */
  credit?:string};
};
export const RARITY_LABEL:Record<FishRarity,string>={common:'Common catch',uncommon:'Good catch',rare:'Rare catch',legendary:'Legendary catch'};

export const FISH:FishSpecies[]=[
 {id:'shrimp',name:'Brown Shrimp',plural:'Brown Shrimp',rarity:'common',group:'shellfish',spots:['south-pier','west-pier','harbour-wall','north-rocks','west-cove','east-pier','causeway-gate','turtle-bank','coral-garden','sharks-beach','farm-beach'],price:3,size:[5,9],color:'#a07a58',belly:'#e6cfae',shape:'shrimp',shadow:'small',
  club:{name:'Southend United',country:'England',link:'Nickname',nickname:'The Shrimpers',
   fact:'Southend United are "The Shrimpers" because nearby Leigh-on-Sea had lots of shrimp-fishing boats, and a shrimp is on the club badge.',
   source:'https://en.wikipedia.org/wiki/Southend_United_F.C.'}},
 {id:'sardine',name:'Sardine',plural:'Sardines',rarity:'common',group:'fish',spots:['south-pier','west-pier','harbour-wall','north-rocks','west-cove','deep-sea-boat','east-pier','causeway-gate','causeway-channel','turtle-bank','coral-garden','sharks-beach','farm-beach'],price:3,size:[12,22],color:'#6f8fa6',belly:'#dfe7ea',shape:'slim',shadow:'small',
  club:{name:'Santos FC',country:'Brazil',link:'Nickname',nickname:'Peixe (Fish)',
   fact:'In 1933 rival fans teased port-city Santos as "fishmongers", so Santos fans proudly took the nickname "Peixe" (Fish). Pelé played there from 1956 to 1974.',
   source:'https://en.wikipedia.org/wiki/Santos_FC'}},
 {id:'mackerel',name:'Mackerel',plural:'Mackerel',rarity:'common',group:'fish',spots:['south-pier','west-pier','harbour-wall','north-rocks','west-cove','deep-sea-boat','east-pier','causeway-gate','causeway-channel','turtle-bank','coral-garden','sharks-beach','farm-beach'],price:4,size:[25,40],color:'#3f7a78',belly:'#e4ecd9',shape:'slim',shadow:'medium',
  club:{name:'Celta Vigo',country:'Spain',link:'Port city',
   fact:'Celta Vigo\'s home city, Vigo, has Europe\'s biggest fishing port: almost a million tonnes of fish arrive there every year.',
   source:'https://www.fao.org/newsroom/story/Not-business-as-usual-in-Europe-s-largest-fishing-port/en'}},
 {id:'sea-bass',name:'Sea Bass',plural:'Sea Bass',rarity:'common',group:'fish',spots:['south-pier','west-pier','harbour-wall','north-rocks','west-cove','east-pier','causeway-gate','causeway-channel','turtle-bank','coral-garden','sharks-beach','farm-beach'],price:4,size:[30,60],color:'#8a9aa0',belly:'#eef0e6',shape:'round',shadow:'medium',
  club:{name:'Olympique de Marseille',country:'France',link:'Nickname',nickname:'Les Phocéens',
   fact:'Marseille are "Les Phocéens", after the Greek sailors from Phocaea who founded the port about 600 BC. In 1993 OM became the first French club to win the Champions League.',
   source:'https://en.wikipedia.org/wiki/Olympique_de_Marseille'}},
 {id:'herring',name:'Herring',plural:'Herring',rarity:'uncommon',group:'fish',spots:['west-pier','harbour-wall','east-pier','causeway-gate','causeway-channel','turtle-bank','sharks-beach'],price:5,size:[20,35],color:'#5d7f99',belly:'#e8eef0',shape:'slim',shadow:'small',
  club:{name:'FC St. Pauli',country:'Germany',link:'Fan culture',
   fact:'FC St. Pauli come from Hamburg\'s harbour district. Fans started waving a skull-and-crossbones pirate flag in the 1980s, and the club now uses it as a logo.',
   source:'https://en.wikipedia.org/wiki/Skull_and_crossbones_(fraternities_and_sports)'}},
 {id:'cod',name:'Cod',plural:'Cod',rarity:'uncommon',group:'fish',spots:['harbour-wall','west-cove','east-pier','causeway-channel','farm-beach'],price:6,size:[40,90],color:'#9b8a5e',belly:'#efe6c8',shape:'round',shadow:'large',
  club:{name:'Fleetwood Town',country:'England',link:'Fan culture',nickname:'The Cod Army',
   fact:'Fleetwood Town\'s fans are the "Cod Army" because Fleetwood grew up as a big deep-sea fishing port.',
   source:'https://en.wikipedia.org/wiki/Fleetwood_Town_F.C.'}},
 {id:'haddock',name:'Haddock',plural:'Haddock',rarity:'uncommon',group:'fish',spots:['harbour-wall','west-cove','east-pier','causeway-gate','coral-garden','farm-beach'],price:6,size:[35,70],color:'#6d6f73',belly:'#e9e7df',shape:'round',shadow:'medium',
  club:{name:'Grimsby Town',country:'England',link:'Fan culture',nickname:'The Mariners',
   fact:'Grimsby Town, "The Mariners", have fans who wave inflatable fish called "Harry Haddock", a tradition that began at FA Cup matches in 1989.',
   source:'https://gtfc.co.uk/the-return-of-harry-haddock/'}},
 {id:'tuna',name:'Bluefin Tuna',plural:'Bluefin Tuna',rarity:'rare',group:'fish',deepSea:true,spots:['south-pier','harbour-wall','west-cove','deep-sea-boat','east-pier','causeway-channel','sharks-beach'],price:9,size:[80,160],color:'#2f4f78',belly:'#d9e2e6',shape:'long',shadow:'huge',
  club:{name:'Yokohama F. Marinos',country:'Japan',link:'Port city',nickname:'Marinos',
   fact:'"Marinos" means sailors in Spanish, chosen because Yokohama is a big international port. The club mascot is a seagull called Marinos-kun.',
   source:'https://www.f-marinos.com/en/club'}},
 {id:'shark',name:'Little Shark',plural:'Little Sharks',rarity:'rare',group:'shark',spots:['west-pier','north-rocks','west-cove','causeway-channel','turtle-bank','coral-garden','sharks-beach'],price:10,size:[50,90],color:'#7c8b96',belly:'#e4e9ea',shape:'shark',shadow:'large',
  club:{name:'Junior de Barranquilla',country:'Colombia',link:'Nickname',nickname:'Los Tiburones',
   fact:'Junior, from Barranquilla on Colombia\'s Caribbean coast, are nicknamed "Los Tiburones": The Sharks.',
   source:'https://en.wikipedia.org/wiki/Atl%C3%A9tico_Junior'}},
 {id:'octopus',name:'Octopus',plural:'Octopuses',rarity:'legendary',group:'octopus',deepSea:true,spots:['south-pier','west-pier','north-rocks','deep-sea-boat','east-pier','causeway-gate','coral-garden'],price:12,size:[40,100],color:'#c9655a',belly:'#f1b39b',shape:'octopus',shadow:'large',
  club:{name:'Paul the Octopus',country:'Germany',link:'Football culture',
   fact:'At the 2010 World Cup, Paul the Octopus from Sea Life Oberhausen picked the winner of all seven Germany matches and the final: 8 out of 8!',
   source:'https://en.wikipedia.org/wiki/Paul_the_Octopus'}},
];
// The 50 spot-exclusive specials (10 per spot) with their verified football stories: ./fishSpecials.ts.
FISH.push(...SPECIAL_FISH);
// The Deep Sea Boat's own deep-sea specials (squid, lanternfish, grouper, sailfish, anglerfish, swordfish, marlin, sunfish): ./deepSeaFish.ts.
FISH.push(...DEEP_SEA_FISH);
const BY_ID=new Map(FISH.map(f=>[f.id,f]));
export const fishById=(id:string)=>BY_ID.get(id);
export const isFishId=(id:unknown):id is FishId=>typeof id==='string'&&BY_ID.has(id);

/**
 * Goalkeeper lessons for the beats of a catch: fishing needs the same patience, focus and timing as goalkeeping.
 * The nibble lesson cites Bar-Eli et al. (2007), a study of 286 penalty kicks.
 */
export const KEEPER_LESSONS={
 cast:{title:'Set your stance',text:'Feet steady, eyes on the float — like a keeper getting set before the shot.'},
 nibble:{title:'A nibble is a feint',text:'Scientists who studied 286 penalties found keepers nearly always dive early, yet staying put would have saved the most. Wait for the real bite!',source:'https://www.sciencedirect.com/science/article/abs/pii/S0167487006001048'},
 scared:{title:'Dived too early',text:'The fish sold you a feint, like a striker\'s dummy. Stay set until the float really goes under.'},
 escaped:{title:'A touch too late',text:'Keepers wait on their toes, weight forward, ready to spring. React the moment the float plunges.'},
 caught:{title:'Great reactions!',text:'Patience, then a quick reaction: that is how keepers save shots too.'},
} as const;

export type FishSpot={
 id:string;name:string;
 /** Where the child stands (walkable) and where the float lands (water). */
 x:number;z:number;buoy:{x:number;z:number};
 /** Internal catch weights (never shown), built from each species' `spots` and rarity (RARITY_WEIGHT) below. */
 weights:Record<FishId,number>;
 /** Island-story blurb (game fiction). */
 story:string;
 /** Optional camera nudge for the low fishing shot (metres): e.g. lift over a harbour wall. */
 camera?:{lift?:number;out?:number;look?:number};
 /** A spot on a moored boat (no fishing post): its floor height and where the Fish prompt floats. */
 boat?:{floor:number;prompt:{x:number;y:number;z:number}};
 /** Internal multiplier (never shown) for species that are NOT deep-sea creatures at this spot: the boat keeps a few bait fish. */
 shallowFactor?:number;
 /** Off the main island: on the Coral Cay causeway's sand banks or round the cay's shore (Oct 5 2026). The Fishbook groups
  *  these as "Coral Cay" places; absent = a main-island spot. */
 area?:'causeway'|'cay';
};
export const FISH_SPOTS:(FishSpot&{id:SpotId})[]=[
 {id:'south-pier',name:'South Pier Fishing Station',x:217,z:212.6,buoy:{x:217,z:226},
  weights:{},story:'The old fishing station at the end of the South Pier. Mackerel shoals pass here.'},
 {id:'west-pier',name:'Lifebuoy Point',x:63,z:212.6,buoy:{x:63,z:225},
  weights:{},story:'Beside the red lifebuoy on the western boardwalk. Shrimp love the warm shallows.'},
 {id:'harbour-wall',name:'Harbour Wall',x:237.2,z:66,buoy:{x:250,z:66},
  weights:{},story:'The stone harbour wall behind the farmers market. Deep, cold water for cod and haddock.',camera:{lift:3.2,out:-2,look:.9}},
 {id:'north-rocks',name:'North Beach Rocks',x:60,z:-238,buoy:{x:60,z:-252},
  weights:{},story:'Tide-pool rocks at the quiet end of North Beach. Octopuses hide in the cracks.'},
 {id:'west-cove',name:'West Cove',x:-95.5,z:24,buoy:{x:-108,z:24},
  weights:{},story:'A windy cove on the west coast where a little stream meets the sea, so river fish swim in beside the rays and sharks.'},
 // Deep Sea Boat (Sep 29 2026): moored off the main island's east coast, south of the Coral Cay causeway; reached by jetpack
 // only. Stand on the aft deck and cast off the starboard (east, seaward) side. About three casts in four bring a deep-sea creature (internal).
 {id:BOAT_SPOT_ID,name:'Deep Sea Boat',x:BOAT_STAND.x,z:BOAT_STAND.z,buoy:{x:BOAT_BUOY.x,z:BOAT_BUOY.z},
  weights:{},story:'A little fishing boat moored far out in deep blue water. Squid, marlin and stranger things swim far below.',
  camera:{lift:1.6,out:4,look:.5},boat:{floor:BOAT_DECK_Y,prompt:BOAT_PROMPT},shallowFactor:.5},
 // East Jetty (Sep 29 2026 as the East Pier; spiral jetty Sep 30, lib/town/eastPier.ts): the outer east curve of the spiral off the farmers market. No specials of its
 // own: a table between the shore and the deep sea, built from species already in the game (the four shared commons, herring,
 // cod and haddock, plus the odd tuna or octopus that swims in from deeper water). Mean catch ≈ 4.05 coins (shore ≈ 4.0).
 {id:'east-pier',name:'East Jetty Spiral',x:EAST_PIER_FISHING.x,z:EAST_PIER_FISHING.z,buoy:{...EAST_PIER_FISHING.buoy},
  weights:{},story:'The outer curve of the spiral at the end of the East Jetty, out past the farmers market. Deeper water than the shore, so a tuna or an octopus sometimes swims by.'},
 // ---- Coral Cay causeway and cay shore (Oct 5 2026, user: "add more fishing spots along the bridge road and coral cay island").
 // Like the East Jetty: no specials of their own, tables built from the ten shared species to fit the water (sandy shallows
 // vs the open channel under the causeway), each mean catch 3.75–4.26 coins (shore ≈ 4.0; tests/fishing.cjs). Names and
 // stories are island stories (game fiction). Placement (tests/fishing.cjs checks it against coralCay.ts):
 // - causeway posts stand on the widest sand banks, 1.6 m inside the walkable edge and 9+ m off the road's centre (lanes are
 //   ±2 m, lamps 6.65 m, all left clear), between the friendly sharks' patrol stretches (buoys ≥ 9 m from every loop) and
 //   clear of the bank palms, umbrellas and ball-hunt balls;
 // - cay posts stand a fifth of the way up the beach from the waterline, casting square to the coast, away from the court,
 //   the farm fence and track, the hostel, the huts and the Sharks Beach sign, vending machine and ball.
 {id:'causeway-gate',name:'Seawall Gate Sands',area:'causeway',x:254.8,z:-169.2,buoy:{x:253.8,z:-177.7},
  weights:{},story:'A sandy bank just past the seawall gate, where the causeway leaves the main island. Shrimp dart about in the warm shallows, and an octopus hides in the seawall stones.'},
 {id:'causeway-channel',name:'Channel Bend',area:'causeway',x:359.2,z:-176.1,buoy:{x:355.4,z:-168.4},
  weights:{},story:'The causeway\'s big bend over the deepest water between the two islands. Shoals swim through the open channel, and now and then a tuna or a little shark follows them.'},
 {id:'turtle-bank',name:'Turtle Bank',area:'causeway',x:486.2,z:-124.8,buoy:{x:490.1,z:-117.1},
  weights:{},story:'A wide sand bank on the last stretch to Coral Cay, looking out toward Turtle Sandbar. Clear, sandy shallows where young sharks cruise past.'},
 {id:'coral-garden',name:'Coral Garden Beach',area:'cay',x:514.8,z:-226.5,buoy:{x:511.8,z:-235.2},
  weights:{},story:'The quiet north-west beach of Coral Cay. Coral grows just offshore, so octopuses and little sharks come hunting.'},
 {id:'sharks-beach',name:'Sharks Beach Point',area:'cay',x:697.3,z:-200.2,buoy:{x:698.8,z:-207.7},
  weights:{},story:'The east end of Sharks Beach, a long kick from the beach-soccer court. The open sea starts here, so tuna and little sharks swim close in.'},
 {id:'farm-beach',name:'Farm Beach',area:'cay',x:651,z:-68.1,buoy:{x:657.5,z:-62},
  weights:{},story:'The sunny south beach below Coral Cay Farm. Cod and haddock nose along the sandy bottom, and the farmers swap fruit for the catch.'},
];
/**
 * Internal catch weights by rarity (code + docs only, NEVER shown to kids): commons are easy, each rarer tier is
 * progressively harder to meet. A species may override its weight with `weight`.
 */
export const RARITY_WEIGHT:Record<FishRarity,number>={common:40,uncommon:12,rare:4,legendary:1.2};
for(const spot of FISH_SPOTS)for(const f of FISH)if(f.spots.includes(spot.id))spot.weights[f.id]=(f.weight??RARITY_WEIGHT[f.rarity])*(spot.shallowFactor&&!f.deepSea?spot.shallowFactor:1);
/** The shore spots (fishing posts), without the boat. */
export const SHORE_SPOTS=FISH_SPOTS.filter(s=>!s.boat);
export const spotById=(id:string)=>FISH_SPOTS.find(s=>s.id===id);
/** Species that live only at one spot (the spot's specials). */
export const isExclusive=(f:FishSpecies)=>f.spots.length===1;

/**
 * THE farmers-market sell stand (fish, produce, cards): the existing CITRUS & FRUIT stall of lib/town/farmersMarket.ts
 * (stall 2, x 230 z 35) — the same stall the island jobs produce sale points at (lib/town/jobs/jobCatalog.ts MARKET_STALL),
 * so there is one stall, not two. Rosa is the seated vendor already modelled there.
 */
export const MARKET_STAND={x:230,z:35,front:{x:225.2,z:35},seller:'Rosa'};
