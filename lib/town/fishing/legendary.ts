import type {AnimalGroup,FishShape,FishSpecies,SpotId} from './fishCatalog';

/**
 * C1 (docs/fishing-research.md): Island Legends. One named giant per fishing spot (18), each with a short island story (GAME
 * FICTION) and a real football "legend" fact (REAL, sourced; the same teaching-hook pattern as the deep-sea creatures: the fact
 * never claims the animal). Checked 15 Oct 2026 against the pages in `source` (polite fetches, one at a time).
 *
 * How they work (fishingOdds.ts, fishingLog.ts):
 *  - A legend is NOT in FISH: it is never a market good (Rosa cannot buy it), never in the Fishbook species count, never in a
 *    spot's weight table. `fishById` resolves it (fishCatalog.ts) so the live session can fight it like any catch.
 *  - It only swims once its clue is found: finishing an islander request that points to its spot, or catching 3 different kinds
 *    at that spot (the spot's notes). Then it joins that spot's catch at a small fixed weight until it is caught ONCE; after that
 *    it never comes back (it was released).
 *  - Caught once, then RELEASED: zero coin impact by design (tests/economy.cjs §12 asserts no legend is a good or sellable).
 *  - Fight: `fightProfileFor(id)` returns 'legend' for Agent A's tension fight (3 runs and a leap; on a slip it rests, it never
 *    escapes for good) — the profile id is the only hook the fight needs.
 */
export type LegendInfo={spot:SpotId;title:string;story:string;clue:string};
type Def={spot:SpotId;name:string;title:string;group:AnimalGroup;shape:FishShape;size:[number,number];color:string;belly:string;story:string;clue:string;
 club:FishSpecies['club']};
const W='https://en.wikipedia.org/wiki/';
const DEFS:Def[]=[
 {spot:'south-pier',name:'Old Three-Cups',title:'The pier\'s giant tuna',group:'fish',shape:'long',size:[260,300],color:'#2d4f7c',belly:'#f0d77a',
  story:'A giant tuna with three gold stripes that has circled the South Pier since the old fishing station was built.',clue:'Old fishers say a shadow with three gold stripes passes the South Pier.',
  club:{name:'Pelé',country:'Brazil',link:'Football culture',fact:'Pelé is the only player to win the World Cup three times: in 1958, 1962 and 1970.',source:W+'Pel%C3%A9'}},
 {spot:'west-pier',name:'The Black Spider',title:'Lifebuoy Point\'s great octopus',group:'octopus',shape:'octopus',size:[180,220],color:'#2d2a33',belly:'#7b6e86',
  story:'A huge dark octopus under the boardwalk. Eight long arms catch anything that comes near, like a keeper who stops every shot.',clue:'Something with eight long arms guards the water under the Lifebuoy Point boardwalk.',
  club:{name:'Lev Yashin',country:'Soviet Union',link:'Football culture',nickname:'The Black Spider',fact:'Goalkeeper Lev Yashin, the "Black Spider", is the only keeper ever to win the Ballon d\'Or, in 1963.',source:W+'Lev_Yashin'}},
 {spot:'harbour-wall',name:'Old Captain',title:'The harbour\'s ancient grouper',group:'fish',shape:'round',size:[190,230],color:'#5e5440',belly:'#d6c69a',
  story:'A grouper so old that it has watched over the harbour wall for longer than anyone can remember.',clue:'The harbour keepers say an old grouper has lived by the wall for years and years.',
  club:{name:'Sir Alex Ferguson',country:'Scotland',link:'Football culture',fact:'Sir Alex Ferguson managed Manchester United for more than 26 years, from 1986 to 2013.',source:W+'Alex_Ferguson'}},
 {spot:'north-rocks',name:'Iron Claws',title:'The rock pools\' giant crab',group:'crab',shape:'crab',size:[90,110],color:'#8a3b2c',belly:'#e9b48f',
  story:'A giant crab in the deepest crack of the tide-pool rocks. Its claws snap shut faster than you can blink.',clue:'Big claw marks have been seen in the sand by the North Beach rock pools.',
  club:{name:'Gordon Banks',country:'England',link:'Football culture',fact:'At the 1970 World Cup, England keeper Gordon Banks dived to push away a Pelé header. Many call it the greatest save ever.',source:W+'Gordon_Banks'}},
 {spot:'west-cove',name:'The Invincible',title:'West Cove\'s great wobbegong',group:'shark',shape:'shark',size:[290,320],color:'#6b5a3a',belly:'#d8c79a',
  story:'A patterned carpet shark that lies on the cove floor. Nobody has ever got past it, and nobody has ever beaten it.',clue:'Divers at West Cove talk about a patterned shark that never loses.',
  club:{name:'Arsenal',country:'England',link:'Football culture',nickname:'The Invincibles',fact:'Arsenal went the whole 2003–04 Premier League season unbeaten, 38 games, so they were called "The Invincibles".',source:W+'2003%E2%80%9304_Arsenal_F.C._season'}},
 {spot:'deep-sea-boat',name:'The Golden Marlin',title:'The deep bay\'s golden marlin',group:'fish',shape:'billfish',size:[420,480],color:'#c99a2e',belly:'#f6e3a0',
  story:'A marlin that shines gold in the sun, far out in the deep blue bay. It has won every race against the boats.',clue:'The boat\'s crew have spotted a golden fin far out in the blue bay.',
  club:{name:'Lionel Messi',country:'Argentina',link:'Football culture',fact:'Lionel Messi has won the Ballon d\'Or eight times, more than any other player.',source:W+'Lionel_Messi'}},
 {spot:'deep-sea-boat-west',name:'Record Breaker',title:'The deep channel\'s giant swordfish',group:'fish',shape:'billfish',size:[430,470],color:'#3f5a72',belly:'#d7e2ea',
  story:'A swordfish in the green channel west of Summit Isle that keeps breaking every fishing record.',clue:'The skipper says a swordfish in the green channel breaks every record.',
  club:{name:'Christine Sinclair',country:'Canada',link:'Football culture',fact:'Canada\'s Christine Sinclair scored 190 goals for her country, more than any other international player.',source:W+'Christine_Sinclair'}},
 {spot:'east-pier',name:'The Dribbler',title:'The jetty\'s great ray',group:'ray',shape:'ray',size:[300,340],color:'#3a4d5c',belly:'#e3ecef',
  story:'A huge ray that weaves in and out of the spiral jetty\'s posts and never touches one.',clue:'Something wide weaves between the posts at the end of the East Jetty.',
  club:{name:'Diego Maradona',country:'Argentina',link:'Football culture',fact:'At the 1986 World Cup, Diego Maradona dribbled from his own half past England\'s players and scored. It was voted the Goal of the Century.',source:W+'Argentina_v_England_(1986_FIFA_World_Cup)'}},
 {spot:'causeway-gate',name:'The Shoal Queen',title:'The seawall\'s silver queen',group:'fish',shape:'slim',size:[90,110],color:'#7c95ab',belly:'#eef3f5',
  story:'A giant silver herring that leads a shoal of thousands past the seawall gate, like a crowd following its team.',clue:'Thousands of silver fish follow one giant past the seawall gate.',
  club:{name:'Dick, Kerr Ladies',country:'England',link:'Football culture',fact:'On Boxing Day 1920 about 53,000 people watched the Dick, Kerr Ladies play at Goodison Park in Liverpool.',source:W+'Dick,_Kerr_Ladies_F.C.'}},
 {spot:'causeway-channel',name:'Sixteen Stripes',title:'The channel\'s striped tuna',group:'fish',shape:'long',size:[250,290],color:'#294a6e',belly:'#dbe4ea',
  story:'A tuna with sixteen silver stripes that races through the channel under the causeway.',clue:'Someone counted sixteen stripes on a huge fish under the causeway\'s big bend.',
  club:{name:'Miroslav Klose',country:'Germany',link:'Football culture',fact:'Germany\'s Miroslav Klose scored 16 goals at men\'s World Cups. That was the record for twelve years, until 2026.',source:W+'Miroslav_Klose'}},
 {spot:'turtle-bank',name:'The Underdog',title:'Turtle Bank\'s surprising shark',group:'shark',shape:'shark',size:[170,200],color:'#7d8c96',belly:'#e8edee',
  story:'A shark nobody thought much of, until it grew into the biggest fish on the sand bank.',clue:'The kids on Turtle Sandbar say a little shark grew up to be the biggest of all.',
  club:{name:'Leicester City',country:'England',link:'Football culture',fact:'Almost nobody expected it, but Leicester City won the Premier League in 2015–16.',source:W+'2015%E2%80%9316_Leicester_City_F.C._season'}},
 {spot:'coral-garden',name:'Queen of the Reef',title:'Coral Cay\'s royal parrotfish',group:'fish',shape:'round',size:[130,160],color:'#3fae9a',belly:'#f2c6d8',
  story:'A rainbow parrotfish that rules the coral garden and has been seen at more reefs than any other fish.',clue:'A rainbow-coloured giant has been seen nibbling the coral off Coral Garden Beach.',
  club:{name:'Marta',country:'Brazil',link:'Football culture',fact:'Brazil\'s Marta has scored 17 goals at Women\'s World Cups, more than any other player at that tournament.',source:W+'Marta_(footballer)'}},
 {spot:'sharks-beach',name:'Twin Header',title:'Sharks Beach\'s great hammerhead',group:'shark',shape:'hammerhead',size:[380,420],color:'#6f7f8c',belly:'#e3e8ea',
  story:'A hammerhead that turns its wide head left and right to find food, two at a time.',clue:'Swimmers at Sharks Beach saw a wide head turning left and right far out.',
  club:{name:'Zinedine Zidane',country:'France',link:'Football culture',fact:'Zinedine Zidane scored two headers in the 1998 World Cup final as France beat Brazil 3–0.',source:W+'1998_FIFA_World_Cup_final'}},
 {spot:'farm-beach',name:'The Lisbon Lion',title:'Farm Beach\'s lionfish',group:'fish',shape:'round',size:[60,75],color:'#b9573a',belly:'#f4dccb',
  story:'A giant striped lionfish that spreads its fins like a mane in the sandy water off Farm Beach.',clue:'The farmers say a fish with a mane of fins swims off their beach.',
  club:{name:'Celtic',country:'Scotland',link:'Football culture',nickname:'The Lisbon Lions',fact:'In 1967 Celtic became the first British club to win the European Cup. The team are remembered as the Lisbon Lions.',source:W+'Lisbon_Lions'}},
 {spot:'summit-cove',name:'The First Champion',title:'Boulder Cove\'s ancient fish',group:'fish',shape:'round',size:[180,200],color:'#46516b',belly:'#c9d0dc',
  story:'An ancient fish older than the boulders in the cove. It was the first fish ever seen there.',clue:'Something very old hides between the boulders of Boulder Cove.',
  club:{name:'Uruguay',country:'Uruguay',link:'Football culture',fact:'Uruguay hosted the very first World Cup in 1930, and won it.',source:W+'1930_FIFA_World_Cup'}},
 {spot:'summit-palm',name:'Five-Crown Crab',title:'Palm Point\'s crowned crab',group:'crab',shape:'crab',size:[80,95],color:'#c4553b',belly:'#f2c29a',
  story:'A crab with five white spots like crowns on its shell, the king of the sand round the lone palm.',clue:'A crab with five white crowns walks the sand at Palm Point.',
  club:{name:'Real Madrid',country:'Spain',link:'Football culture',fact:'Real Madrid won the first five European Cups in a row, from 1956 to 1960.',source:W+'Real_Madrid_CF'}},
 {spot:'summit-lookout',name:'Back-to-Back',title:'Lookout Rocks\' twin-finned barracuda',group:'fish',shape:'long',size:[190,210],color:'#7b8892',belly:'#e6eaec',
  story:'A barracuda with two tall fins on its back that patrols the stepping-stone boulders.',clue:'The lookout spotted a fish with two tall back fins by the boulders.',
  club:{name:'Nottingham Forest',country:'England',link:'Football culture',fact:'Managed by Brian Clough, Nottingham Forest won the European Cup two years in a row, in 1979 and 1980.',source:W+'Nottingham_Forest_F.C.'}},
 {spot:'summit-ledge',name:'The Leaper',title:'The ledge\'s high-jumping sailfish',group:'fish',shape:'billfish',size:[330,360],color:'#2e4b78',belly:'#d8e1ea',
  story:'A sailfish that leaps high out of the water at the drop-off, higher than any fish on the island.',clue:'Something leaps high out of the deep water past Drop-off Ledge.',
  club:{name:'Cristiano Ronaldo',country:'Portugal',link:'Football culture',fact:'Cristiano Ronaldo has scored more goals for his country than any other men\'s player.',source:W+'Cristiano_Ronaldo'}},
];
export const legendId=(spot:string)=>`legend-${spot}`;
/** The 18 legends as species objects (resolved by fishById so the live session can fight them). Never in FISH. */
export const LEGEND_FISH:FishSpecies[]=DEFS.map(d=>({id:legendId(d.spot),name:d.name,plural:d.name,rarity:'legendary',group:d.group,spots:[d.spot],
 price:0,size:d.size,color:d.color,belly:d.belly,shape:d.shape,shadow:'giant',club:d.club}));
export const LEGEND_INFO:Readonly<Record<string,LegendInfo>>=Object.fromEntries(DEFS.map(d=>[legendId(d.spot),{spot:d.spot,title:d.title,story:d.story,clue:d.clue}]));
const LEGEND_IDS=new Set(LEGEND_FISH.map(f=>f.id));
export const isLegendId=(id:unknown):id is string=>typeof id==='string'&&LEGEND_IDS.has(id);
export const legendForSpot=(spot:string)=>LEGEND_FISH.find(f=>f.spots[0]===spot);
/** Internal weight (never shown) a found-but-uncaught legend adds at its spot. Small: a hunt, not a gift. */
export const LEGEND_WEIGHT=2.5;
/** Agent A's fight profile hook: legends fight with the 'legend' profile (3 runs and a leap; they rest on a slip, never escape). */
export const LEGEND_FIGHT_PROFILE='legend' as const;
export const fightProfileFor=(id:string):typeof LEGEND_FIGHT_PROFILE|undefined=>isLegendId(id)?LEGEND_FIGHT_PROFILE:undefined;
/** Distinct kinds a player must have caught at a spot before its legend's clue turns up by itself. */
export const LEGEND_CLUE_KINDS=3;
