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
export type FishId='shrimp'|'sardine'|'mackerel'|'sea-bass'|'cod'|'haddock'|'herring'|'tuna'|'shark'|'octopus';
export type FishRarity='common'|'uncommon'|'rare'|'legendary';
export type ShadowSize='small'|'medium'|'large'|'huge';
/** Shadow length in metres for each size. */
export const SHADOW_LENGTH:Record<ShadowSize,number>={small:.45,medium:.7,large:1,huge:1.45};
export const SHADOW_LABEL:Record<ShadowSize,string>={small:'Small shadow',medium:'Medium shadow',large:'Large shadow',huge:'Huge shadow'};
export type ClubLinkKind='Nickname'|'Port city'|'Fan culture'|'Football culture';
export type FishSpecies={
 id:FishId;name:string;plural:string;rarity:FishRarity;
 /** Coins per fish at the market stand (full price; the shared daily soft cap lives in lib/town/market/market.ts). */
 price:number;
 /** Size range in cm (kid-scale, roughly realistic). */
 size:[number,number];
 color:string;belly:string;
 /** Body shape for the 2D art. */
 shape:'shrimp'|'slim'|'round'|'long'|'shark'|'octopus';
 /** Size of the dark shadow it casts in the water (small / medium / large / huge), the only clue before the catch. */
 shadow:ShadowSize;
 club:{name:string;country:string;link:ClubLinkKind;nickname?:string;fact:string;source:string};
};
export const RARITY_LABEL:Record<FishRarity,string>={common:'Common catch',uncommon:'Good catch',rare:'Rare catch',legendary:'Legendary catch'};

export const FISH:FishSpecies[]=[
 {id:'shrimp',name:'Brown Shrimp',plural:'Brown Shrimp',rarity:'common',price:3,size:[5,9],color:'#d99a74',belly:'#f3c9a5',shape:'shrimp',shadow:'small',
  club:{name:'Southend United',country:'England',link:'Nickname',nickname:'The Shrimpers',
   fact:'Southend United are "The Shrimpers" because nearby Leigh-on-Sea had lots of shrimp-fishing boats, and a shrimp is on the club badge.',
   source:'https://en.wikipedia.org/wiki/Southend_United_F.C.'}},
 {id:'sardine',name:'Sardine',plural:'Sardines',rarity:'common',price:3,size:[12,22],color:'#6f8fa6',belly:'#dfe7ea',shape:'slim',shadow:'small',
  club:{name:'Santos FC',country:'Brazil',link:'Nickname',nickname:'Peixe (Fish)',
   fact:'In 1933 rival fans teased port-city Santos as "fishmongers", so Santos fans proudly took the nickname "Peixe" (Fish). Pelé played there from 1956 to 1974.',
   source:'https://en.wikipedia.org/wiki/Santos_FC'}},
 {id:'mackerel',name:'Mackerel',plural:'Mackerel',rarity:'common',price:4,size:[25,40],color:'#3f7a78',belly:'#e4ecd9',shape:'slim',shadow:'medium',
  club:{name:'Celta Vigo',country:'Spain',link:'Port city',
   fact:'Celta Vigo\'s home city, Vigo, has Europe\'s biggest fishing port: almost a million tonnes of fish arrive there every year.',
   source:'https://www.fao.org/newsroom/story/Not-business-as-usual-in-Europe-s-largest-fishing-port/en'}},
 {id:'sea-bass',name:'Sea Bass',plural:'Sea Bass',rarity:'common',price:4,size:[30,60],color:'#8a9aa0',belly:'#eef0e6',shape:'round',shadow:'medium',
  club:{name:'Olympique de Marseille',country:'France',link:'Nickname',nickname:'Les Phocéens',
   fact:'Marseille are "Les Phocéens", after the Greek sailors from Phocaea who founded the port about 600 BC. In 1993 OM became the first French club to win the Champions League.',
   source:'https://en.wikipedia.org/wiki/Olympique_de_Marseille'}},
 {id:'herring',name:'Herring',plural:'Herring',rarity:'uncommon',price:5,size:[20,35],color:'#5d7f99',belly:'#e8eef0',shape:'slim',shadow:'small',
  club:{name:'FC St. Pauli',country:'Germany',link:'Fan culture',
   fact:'FC St. Pauli come from Hamburg\'s harbour district. Fans started waving a skull-and-crossbones pirate flag in the 1980s, and the club now uses it as a logo.',
   source:'https://en.wikipedia.org/wiki/Skull_and_crossbones_(fraternities_and_sports)'}},
 {id:'cod',name:'Cod',plural:'Cod',rarity:'uncommon',price:6,size:[40,90],color:'#9b8a5e',belly:'#efe6c8',shape:'round',shadow:'large',
  club:{name:'Fleetwood Town',country:'England',link:'Fan culture',nickname:'The Cod Army',
   fact:'Fleetwood Town\'s fans are the "Cod Army" because Fleetwood grew up as a big deep-sea fishing port.',
   source:'https://en.wikipedia.org/wiki/Fleetwood_Town_F.C.'}},
 {id:'haddock',name:'Haddock',plural:'Haddock',rarity:'uncommon',price:6,size:[35,70],color:'#6d6f73',belly:'#e9e7df',shape:'round',shadow:'medium',
  club:{name:'Grimsby Town',country:'England',link:'Fan culture',nickname:'The Mariners',
   fact:'Grimsby Town, "The Mariners", have fans who wave inflatable fish called "Harry Haddock", a tradition that began at FA Cup matches in 1989.',
   source:'https://gtfc.co.uk/the-return-of-harry-haddock/'}},
 {id:'tuna',name:'Bluefin Tuna',plural:'Bluefin Tuna',rarity:'rare',price:9,size:[80,160],color:'#2f4f78',belly:'#d9e2e6',shape:'long',shadow:'huge',
  club:{name:'Yokohama F. Marinos',country:'Japan',link:'Port city',nickname:'Marinos',
   fact:'"Marinos" means sailors in Spanish, chosen because Yokohama is a big international port. The club mascot is a seagull called Marinos-kun.',
   source:'https://www.f-marinos.com/en/club'}},
 {id:'shark',name:'Little Shark',plural:'Little Sharks',rarity:'rare',price:10,size:[50,90],color:'#7c8b96',belly:'#e4e9ea',shape:'shark',shadow:'large',
  club:{name:'Junior de Barranquilla',country:'Colombia',link:'Nickname',nickname:'Los Tiburones',
   fact:'Junior, from Barranquilla on Colombia\'s Caribbean coast, are nicknamed "Los Tiburones": The Sharks.',
   source:'https://en.wikipedia.org/wiki/Atl%C3%A9tico_Junior'}},
 {id:'octopus',name:'Octopus',plural:'Octopuses',rarity:'legendary',price:12,size:[40,100],color:'#c9655a',belly:'#f1b39b',shape:'octopus',shadow:'large',
  club:{name:'Paul the Octopus',country:'Germany',link:'Football culture',
   fact:'At the 2010 World Cup, Paul the Octopus from Sea Life Oberhausen picked the winner of all seven Germany matches and the final: 8 out of 8!',
   source:'https://en.wikipedia.org/wiki/Paul_the_Octopus'}},
];
export const fishById=(id:string)=>FISH.find(f=>f.id===id);
export const isFishId=(id:unknown):id is FishId=>typeof id==='string'&&FISH.some(f=>f.id===id);

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
 /** Internal catch weights (never shown). Every species appears at one spot at least. */
 weights:Partial<Record<FishId,number>>;
 /** Island-story blurb (game fiction). */
 story:string;
 /** Optional camera nudge for the low fishing shot (metres): e.g. lift over a harbour wall. */
 camera?:{lift?:number;out?:number;look?:number};
};
export const FISH_SPOTS:FishSpot[]=[
 {id:'south-pier',name:'South Pier Fishing Station',x:217,z:212.6,buoy:{x:217,z:226},
  weights:{sardine:30,mackerel:30,'sea-bass':24,tuna:7,octopus:3},story:'The old fishing station at the end of the South Pier. Mackerel shoals pass here.'},
 {id:'west-pier',name:'Lifebuoy Point',x:63,z:212.6,buoy:{x:63,z:225},
  weights:{shrimp:34,sardine:26,herring:20,shark:6,octopus:2},story:'Beside the red lifebuoy on the western boardwalk. Shrimp love the warm shallows.'},
 {id:'harbour-wall',name:'Harbour Wall',x:237.2,z:66,buoy:{x:250,z:66},
  weights:{cod:26,haddock:24,herring:22,mackerel:20,tuna:6},story:'The stone harbour wall behind the farmers market. Deep, cold water for cod and haddock.',camera:{lift:3.2,out:-2,look:.9}},
 {id:'north-rocks',name:'North Beach Rocks',x:60,z:-238,buoy:{x:60,z:-252},
  weights:{shrimp:30,'sea-bass':28,sardine:22,octopus:4,shark:4},story:'Tide-pool rocks at the quiet end of North Beach. Octopuses hide in the cracks.'},
 {id:'west-cove',name:'West Cove',x:-95.5,z:24,buoy:{x:-108,z:24},
  weights:{cod:24,haddock:22,'sea-bass':22,shark:8,tuna:4},story:'A windy cove on the west coast where bigger fish come close to shore.'},
];
export const spotById=(id:string)=>FISH_SPOTS.find(s=>s.id===id);

/**
 * THE farmers-market sell stand (fish, produce, cards): the existing CITRUS & FRUIT stall of lib/town/farmersMarket.ts
 * (stall 2, x 230 z 35) — the same stall the island jobs produce sale points at (lib/town/jobs/jobCatalog.ts MARKET_STALL),
 * so there is one stall, not two. Rosa is the seated vendor already modelled there.
 */
export const MARKET_STAND={x:230,z:35,front:{x:225.2,z:35},seller:'Rosa'};
