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
import {NIGHT_FISH} from './nightFish';
import {LEGEND_FISH} from './legendary';
import {SIGNATURE_FISH_WAVE1,SIGNATURE_FISH_WAVE2,SIGNATURE_FISH_WAVE3} from './shoreSignatures';
import {POND_FISH} from './pondFish';
import {NORTH_WEST_FISH} from './northWestFish';
import {FISH_STORIES} from './fishStories';
import {BOAT_SPOT_IDS} from './deepSeaBoatData';
import {FISH_SPOTS,RARITY_WEIGHT,type FishId,type FishRarity,type ShadowSize,type SpotId} from './fishSpots';
// Spots, the market stand and the shared types live in ./fishSpots.ts (no species data, boot-safe); re-exported for existing imports.
export * from './fishSpots';
/** Fish (incl. sharks, rays, eels, seahorses) plus a few crustaceans, shellfish and the octopus. NO marine mammals or reptiles (user decision, Sep 28 2026; tests/fishing.cjs keeps a denylist). */
export type AnimalGroup='fish'|'shark'|'ray'|'eel'|'crab'|'lobster'|'shellfish'|'octopus'|'squid'|'seahorse';
export type FishShape='shrimp'|'slim'|'round'|'long'|'shark'|'octopus'|'crab'|'lobster'|'ray'|'eel'|'squid'|'seahorse'|'shell'|'hammerhead'|'billfish'|'angler'|'mola';
export type ClubLinkKind='Nickname'|'Port city'|'Fan culture'|'Football culture'|'Crest'|'Mascot'|'Club name'
 /** Nov 6 2026 review (owner rule: a dish, a place name or a national fish is NOT a football link). When no club, team, mascot
  *  or player is tied to the animal, the fact is split and labelled: "Fun fish fact: <the animal> Football: <a real football
  *  fact about that place's team>". The Fishbook tag then reads "Fun fish fact + real football fact". */
 |'Fun fish fact';
/** Every link kind (tests and docs). */
export const CLUB_LINK_KINDS:readonly ClubLinkKind[]=['Nickname','Port city','Fan culture','Football culture','Crest','Mascot','Club name','Fun fish fact'];
/** Nov 6 2026 review: the real football thing each fact is about. Its `name` must appear word for word in the fact
 *  (tests/fishing-signatures.cjs), so every catch names a club, team, stadium, mascot, player, tournament, chant or federation. */
export type FootballEntityKind='club'|'national-team'|'stadium'|'mascot'|'player'|'tournament'|'chant'|'federation';
export const FOOTBALL_ENTITY_KINDS:readonly FootballEntityKind[]=['club','national-team','stadium','mascot','player','tournament','chant','federation'];
export type FishSpecies={
 id:FishId;name:string;plural:string;rarity:FishRarity;
 group:AnimalGroup;
 /** A deep-sea / offshore creature: the Deep Sea Boat's catch table favours these (docs/fishing.md). */
 deepSea?:boolean;
 /** Oct 15 2026 (B3, ./nightFish.ts): only comes out at this time of the island's Day / Sunset / Night setting. Never in a spot's
  *  static `weights`: at its time it takes the place of a resting day fish of the same rarity (fishingOdds.ts catchWeights). */
 when?:'night'|'sunset';
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
  /** The football entity the fact names (required for every Fishbook species by the tests; optional for Island Legends). */
  entity?:{kind:FootballEntityKind;name:string};
  /** Main source URL (data/docs only: kids see a plain "Source: …" credit, never a link). */
  source:string;
  /** Further source URLs that back the fact (data/docs only). */
  sources?:string[];
  /** Plain-text credit shown to kids, e.g. "Wikipedia (Italian)". Defaults to the source's site name. */
  credit?:string};
 /** Nov 6 2026: a 2-3 sentence kid-friendly "fish tale" tying the animal to the football fact (./fishStories.ts for the original
  *  species, inline for the signature species). Shown on the catch card and the Fishbook. */
 story?:string;
};

export const FISH:FishSpecies[]=[
 {id:'shrimp',name:'Brown Shrimp',plural:'Brown Shrimp',rarity:'common',group:'shellfish',spots:['south-pier','west-pier','harbour-wall','north-rocks','west-cove','east-pier','causeway-gate','turtle-bank','coral-garden','sharks-beach','farm-beach','summit-lookout'],price:3,size:[5,9],color:'#a07a58',belly:'#e6cfae',shape:'shrimp',shadow:'small',
  club:{name:'Southend United',country:'England',link:'Nickname',entity:{kind:'club',name:'Southend United'},nickname:'The Shrimpers',
   fact:'Southend United are "The Shrimpers" because nearby Leigh-on-Sea had lots of shrimp-fishing boats, and a shrimp is on the club badge.',
   source:'https://en.wikipedia.org/wiki/Southend_United_F.C.'}},
 {id:'sardine',name:'Sardine',plural:'Sardines',rarity:'common',group:'fish',spots:['south-pier','west-pier','harbour-wall','north-rocks','west-cove','deep-sea-boat','deep-sea-boat-west','east-pier','causeway-gate','causeway-channel','turtle-bank','coral-garden','sharks-beach','farm-beach','summit-ledge','summit-lookout','north-point','stadium-rocks','sunset-shoals'],price:3,size:[12,22],color:'#6f8fa6',belly:'#dfe7ea',shape:'slim',shadow:'small',
  club:{name:'Santos FC',country:'Brazil',link:'Nickname',entity:{kind:'club',name:'Santos'},nickname:'Peixe (Fish)',
   fact:'In 1933 rival fans teased port-city Santos as "fishmongers", so Santos fans proudly took the nickname "Peixe" (Fish). Pelé played there from 1956 to 1974.',
   source:'https://en.wikipedia.org/wiki/Santos_FC'}},
 {id:'mackerel',name:'Mackerel',plural:'Mackerel',rarity:'common',group:'fish',spots:['south-pier','west-pier','harbour-wall','north-rocks','west-cove','deep-sea-boat','deep-sea-boat-west','east-pier','causeway-gate','causeway-channel','turtle-bank','coral-garden','sharks-beach','farm-beach','summit-ledge','summit-palm','north-point','stadium-rocks','sunset-shoals'],price:4,size:[25,40],color:'#3f7a78',belly:'#e4ecd9',shape:'slim',shadow:'medium',
  club:{name:'Celta Vigo',country:'Spain',link:'Port city',entity:{kind:'club',name:'Celta Vigo'},
   fact:'Celta Vigo\'s home city, Vigo, has Europe\'s biggest fishing port: almost a million tonnes of fish arrive there every year.',
   source:'https://www.fao.org/newsroom/story/Not-business-as-usual-in-Europe-s-largest-fishing-port/en'}},
 {id:'sea-bass',name:'Sea Bass',plural:'Sea Bass',rarity:'common',group:'fish',spots:['south-pier','west-pier','harbour-wall','north-rocks','west-cove','east-pier','causeway-gate','causeway-channel','turtle-bank','coral-garden','sharks-beach','farm-beach','summit-ledge','summit-palm','north-point','stadium-rocks','sunset-shoals'],price:4,size:[30,60],color:'#8a9aa0',belly:'#eef0e6',shape:'round',shadow:'medium',
  club:{name:'Olympique de Marseille',country:'France',link:'Nickname',entity:{kind:'club',name:'Les Phocéens'},nickname:'Les Phocéens',
   fact:'Marseille are "Les Phocéens", after the Greek sailors from Phocaea who founded the port about 600 BC. In 1993 OM became the first French club to win the Champions League.',
   source:'https://en.wikipedia.org/wiki/Olympique_de_Marseille'}},
 {id:'herring',name:'Herring',plural:'Herring',rarity:'uncommon',group:'fish',spots:['west-pier','harbour-wall','east-pier','causeway-gate','causeway-channel','turtle-bank','sharks-beach'],price:5,size:[20,35],color:'#5d7f99',belly:'#e8eef0',shape:'slim',shadow:'small',
  club:{name:'FC St. Pauli',country:'Germany',link:'Fan culture',entity:{kind:'club',name:'FC St. Pauli'},
   fact:'FC St. Pauli come from Hamburg\'s harbour district. Fans started waving a skull-and-crossbones pirate flag in the 1980s, and the club now uses it as a logo.',
   source:'https://en.wikipedia.org/wiki/Skull_and_crossbones_(fraternities_and_sports)'}},
 {id:'cod',name:'Cod',plural:'Cod',rarity:'uncommon',group:'fish',spots:['harbour-wall','west-cove','east-pier','causeway-channel','farm-beach','summit-ledge'],price:6,size:[40,90],color:'#9b8a5e',belly:'#efe6c8',shape:'round',shadow:'large',
  club:{name:'Fleetwood Town',country:'England',link:'Fan culture',entity:{kind:'club',name:'Fleetwood Town'},nickname:'The Cod Army',
   fact:'Fleetwood Town\'s fans are the "Cod Army" because Fleetwood grew up as a big deep-sea fishing port.',
   source:'https://en.wikipedia.org/wiki/Fleetwood_Town_F.C.'}},
 {id:'haddock',name:'Haddock',plural:'Haddock',rarity:'uncommon',group:'fish',spots:['harbour-wall','west-cove','east-pier','causeway-gate','coral-garden','farm-beach','summit-ledge'],price:6,size:[35,70],color:'#6d6f73',belly:'#e9e7df',shape:'round',shadow:'medium',
  club:{name:'Grimsby Town',country:'England',link:'Fan culture',entity:{kind:'club',name:'Grimsby Town'},nickname:'The Mariners',
   fact:'Grimsby Town, "The Mariners", have fans who wave inflatable fish called "Harry Haddock", a tradition that began at FA Cup matches in 1989.',
   source:'https://gtfc.co.uk/the-return-of-harry-haddock/'}},
 {id:'tuna',name:'Bluefin Tuna',plural:'Bluefin Tuna',rarity:'rare',group:'fish',deepSea:true,spots:['south-pier','harbour-wall','west-cove','deep-sea-boat','deep-sea-boat-west','east-pier','causeway-channel','sharks-beach'],price:9,size:[80,160],color:'#2f4f78',belly:'#d9e2e6',shape:'long',shadow:'huge',
  club:{name:'Yokohama F. Marinos',country:'Japan',link:'Port city',entity:{kind:'club',name:'Marinos'},nickname:'Marinos',
   fact:'"Marinos" means sailors in Spanish, chosen because Yokohama is a big international port. The club mascot is a seagull called Marinos-kun.',
   source:'https://www.f-marinos.com/en/club'}},
 {id:'shark',name:'Little Shark',plural:'Little Sharks',rarity:'rare',group:'shark',spots:['west-pier','north-rocks','west-cove','causeway-channel','turtle-bank','coral-garden','sharks-beach','summit-ledge'],price:10,size:[50,90],color:'#7c8b96',belly:'#e4e9ea',shape:'shark',shadow:'large',
  club:{name:'Junior de Barranquilla',country:'Colombia',link:'Nickname',entity:{kind:'club',name:'Los Tiburones'},nickname:'Los Tiburones',
   fact:'Junior, from Barranquilla on Colombia\'s Caribbean coast, are nicknamed "Los Tiburones": The Sharks.',
   source:'https://en.wikipedia.org/wiki/Atl%C3%A9tico_Junior'}},
 {id:'octopus',name:'Octopus',plural:'Octopuses',rarity:'legendary',group:'octopus',deepSea:true,spots:['south-pier','west-pier','north-rocks','deep-sea-boat','deep-sea-boat-west','east-pier','causeway-gate','coral-garden'],price:12,size:[40,100],color:'#c9655a',belly:'#f1b39b',shape:'octopus',shadow:'large',
  club:{name:'Paul the Octopus',country:'Germany',link:'Football culture',entity:{kind:'tournament',name:'2010 World Cup'},
   fact:'At the 2010 World Cup, Paul the Octopus from Sea Life Oberhausen picked the winner of all seven Germany matches and the final: 8 out of 8!',
   source:'https://en.wikipedia.org/wiki/Paul_the_Octopus'}},
];
// The 50 spot-exclusive specials (10 per spot) with their verified football stories: ./fishSpecials.ts.
FISH.push(...SPECIAL_FISH);
// The Deep Sea Boat's own deep-sea specials (squid, lanternfish, grouper, sailfish, anglerfish, swordfish, marlin, sunfish): ./deepSeaFish.ts.
FISH.push(...DEEP_SEA_FISH);
// Oct 15 2026 (B3): the night and sunset fish (./nightFish.ts). They are Fishbook species and market goods like any other fish.
FISH.push(...NIGHT_FISH);
// Nov 6 2026: the signature species, wave 1 of 3 (./shoreSignatures.ts): about 4 per spot for the first six shore spots.
FISH.push(...SIGNATURE_FISH_WAVE1);
// Nov 6 2026: wave 2 of 3, the three causeway posts and the three Coral Cay beaches (4 each).
FISH.push(...SIGNATURE_FISH_WAVE2);
// Nov 6 2026: wave 3 of 3, Summit Isle's four shore spots (4 each) and the two deep-sea boats (13 shared deep-sea specials).
FISH.push(...SIGNATURE_FISH_WAVE3);
// Nov 13 2026: the Stadium Park pond's fresh-water koi and perch (./pondFish.ts), the only species past the 150 of the three waves.
FISH.push(...POND_FISH);
// Nov 13 2026: the north-west coast's three spots (North Point, Stadium Rocks, Sunset Shoals), spot-only (./northWestFish.ts).
FISH.push(...NORTH_WEST_FISH);
// Every species has its fish tale (the signature species carry theirs inline).
for(const f of FISH)if(!f.story)f.story=FISH_STORIES[f.id];
// Island Legends (C1, ./legendary.ts) are NOT in FISH (never sold, never counted): only fishById resolves them, for the live fight.
const BY_ID=new Map([...FISH,...LEGEND_FISH].map(f=>[f.id,f]));
export const fishById=(id:string)=>BY_ID.get(id);
export const isFishId=(id:unknown):id is FishId=>typeof id==='string'&&BY_ID.has(id);
/** A Fishbook species (in FISH): an Island Legend resolves through fishById for its fight but is never one (it is released). */
const BOOK_IDS=new Set(FISH.map(f=>f.id));
export const isFishbookSpecies=(id:string)=>BOOK_IDS.has(id);

/**
 * Goalkeeper lessons for the beats of a catch: fishing needs the same patience, focus and timing as goalkeeping.
 * The nibble lesson cites Bar-Eli et al. (2007), a study of 286 penalty kicks.
 */
export const KEEPER_LESSONS={
 cast:{title:'Set your stance',text:'Feet steady, eyes on the float — like a keeper getting set before the shot.'},
 nibble:{title:'A nibble is a feint',text:'Scientists who studied 286 penalties found keepers nearly always dive early, yet staying put would have saved the most. Wait for the real bite!',source:'https://www.sciencedirect.com/science/article/abs/pii/S0167487006001048'},
 scared:{title:'Dived too early',text:'The fish sold you a feint, like a striker\'s dummy. Stay set until the float really goes under.'},
 escaped:{title:'A touch too late',text:'Keepers wait on their toes, weight forward, ready to spring. React the moment the float plunges.'},
 /** Nov 6 2026: a HOOKED fish that swam off because the reel stopped turning (not a late reaction). */
 lost:{title:'Keep spinning!',text:'After a save, a keeper holds the ball tight so nobody scores the rebound. Once a fish is hooked, keep the reel turning until it is in.'},
 caught:{title:'Great reactions!',text:'Patience, then a quick reaction: that is how keepers save shots too.'},
} as const;

for(const spot of FISH_SPOTS)for(const f of FISH)if(f.spots.includes(spot.id)&&!f.when)spot.weights[f.id]=(f.weight??RARITY_WEIGHT[f.rarity])*(spot.shallowFactor&&!f.deepSea?spot.shallowFactor:1)*(spot.rarityBoost?.[f.rarity]??1);
/** Species that live only at one spot (the spot's specials). */
export const isExclusive=(f:FishSpecies)=>f.spots.length===1;
/** The deep-sea boats' shared specials (Oct 14 2026: both boats fish the same deep water): species found only on the boats. */
export const isDeepSeaSpecial=(f:FishSpecies)=>f.spots.length>0&&f.spots.every(id=>BOAT_SPOT_IDS.includes(id));
