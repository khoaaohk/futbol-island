/**
 * Fishing spots, the market stand and the shared fishing types (Nov 10 2026 load-time pass, docs/performance-guide.md):
 * the light half of fishCatalog.ts, with NO species data, so the island boot chunk (posts, prompts, minimap, presence, ambient
 * life) can place the spots without the ~190 KB species catalogue. Each spot's `weights` stay empty until fishCatalog.ts loads
 * (it fills them); only the catch code reads them, and it imports fishCatalog.ts. fishCatalog.ts re-exports everything here.
 */
import {DEEP_SEA_BOATS} from './deepSeaBoatData';
import {EAST_PIER_FISHING} from '../eastPier';
import {beachPoint} from '../summitIsle';
export type FishId=string;
export type FishRarity='common'|'uncommon'|'rare'|'legendary';
export type ShadowSize='small'|'medium'|'large'|'huge'|'giant';
/** Shadow length in metres for each size. */
export const SHADOW_LENGTH:Record<ShadowSize,number>={small:.45,medium:.7,large:1,huge:1.45,giant:1.9};
export const SHADOW_LABEL:Record<ShadowSize,string>={small:'Small shadow',medium:'Medium shadow',large:'Large shadow',huge:'Huge shadow',giant:'Giant shadow'};
export type SpotId='south-pier'|'west-pier'|'harbour-wall'|'north-rocks'|'west-cove'|'deep-sea-boat'|'east-pier'
 /** Oct 14 2026: the second deep-sea boat, west of Summit Isle (./deepSeaBoatData.ts). */
 |'deep-sea-boat-west'
 /** Oct 5 2026: three posts along the Coral Cay causeway and three round the cay's shore (see FISH_SPOTS). */
 |'causeway-gate'|'causeway-channel'|'turtle-bank'|'coral-garden'|'sharks-beach'|'farm-beach'
 /** Oct 12 2026: a rocky cove on Summit Isle's far shore, opposite the sandbar (see FISH_SPOTS). */
 |'summit-cove'
 /** Oct 13 2026: the island's other two boulder headlands, see FISH_SPOTS. */
 |'summit-lookout'|'summit-palm'
 /** Oct 14 2026: a ledge on Summit Isle's south-east shore (see FISH_SPOTS). */
 |'summit-ledge';
/** What kind of sea animal it is (sharks reel like legendary animals: 10-14 taps). */
export const RARITY_LABEL:Record<FishRarity,string>={common:'Common catch',uncommon:'Good catch',rare:'Rare catch',legendary:'Legendary catch'};

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
 /** Internal multiplier (never shown) per rarity at this spot (Oct 14 2026, the deep-sea boats: "increase the probability of
  *  bigger fish on boats since it's in deep sea"). Absent = 1. Hotspot boosts stack on top of it, capped (fishingAim.ts). */
 rarityBoost?:Partial<Record<FishRarity,number>>;
 /** Seconds added to every wait for a bite (Oct 14 2026: deep water, the fish rise from far below). The economy's
  *  compensation for the boats' bigger catches (docs/economy.md): the same coins a minute, give or take a few percent. */
 biteDelay?:number;
 /** Off the main island: on the Coral Cay causeway's sand banks or round the cay's shore (Oct 5 2026), or on Summit Isle's
  *  own shore (Oct 12 2026). The Fishbook groups these by place; absent = a main-island spot. */
 area?:'causeway'|'cay'|'summit';
 /** Oct 14 2026: the open-sea boats (both deep-sea boats). The Fishbook groups their catches as "Deep sea". */
 deep?:boolean;
 /** Underwater look (Oct 13 2026, "fix all the fishing spots so they don't all look the same"): the spot's reef theme in
  *  underwater.ts REEF_THEMES (layout, reef palette, sand and water tint, fish, signature prop). Every spot has its own. */
 reef?:string;
};
// Summit Isle's cove (Oct 12 2026, user: "a rocky cove on the far side, for 2-3 new fish species"): placed from that island's
// own exported helpers (beachPoint, never fixed coordinates), so it follows any reshaping of the coast. Bearing 2.3 rad round
// SUMMIT_CENTER is one of the three headlands summitIsleWorld.ts already piles boulders on (the same `[a0,count]` list that
// bakes rock outcrops into the scenery), so the cove's "rocky" story matches what is actually built there; far round the coast
// from the sandbar's landing (bearing ≈ -1.79 rad, on the opposite side of the island). The standing spot sits just up the
// sand from the waterline (back .18 of the beach width, like the cay's beach spots); the float lands further past the
// waterline (back -.8, Oct 13 2026: "cast farther out" — ≈2.0× the old -.3, still checked open water, clear of the sandbar).
const SUMMIT_COVE_BEARING=2.3;
const SUMMIT_COVE_STAND=beachPoint(SUMMIT_COVE_BEARING,.18),SUMMIT_COVE_BUOY=beachPoint(SUMMIT_COVE_BEARING,-.8);
// Lookout Rocks and Palm Point (Oct 13 2026, "add two more fishing spots on the mountain island"): the island's other two
// boulder headlands from summitIsleWorld.ts's own `[a0,count]` list (bearing 2.3 is Boulder Cove above; -.5 has 5 boulders on
// a straight beach, 3.9 has 4 on a curving one with a lone dune palm). Stand and buoy come from the same beachPoint helper,
// on the headland's own bearing ray like the cove, but set further back up the beach (.34 / .44 of the beach width instead
// of the cove's .18) so the standing spot clears every boulder's footprint on that ray instead of landing on the nearest one.
// Buoys moved from -.3 to -.9 / -1.0 (same day, "cast farther out"): ≈1.9-2.0× the old cast, open water the whole way.
const SUMMIT_PALM_BEARING=-.5,SUMMIT_LOOKOUT_BEARING=3.9;
const SUMMIT_PALM_STAND=beachPoint(SUMMIT_PALM_BEARING,.34),SUMMIT_PALM_BUOY=beachPoint(SUMMIT_PALM_BEARING,-.9);
const SUMMIT_LOOKOUT_STAND=beachPoint(SUMMIT_LOOKOUT_BEARING,.44),SUMMIT_LOOKOUT_BUOY=beachPoint(SUMMIT_LOOKOUT_BEARING,-1);
// Drop-off Ledge (Oct 14 2026): bearing 54° round SUMMIT_CENTER (atan2(z, x), 90° is south), same beachPoint helper.
const SUMMIT_LEDGE_BEARING=54*Math.PI/180;
const SUMMIT_LEDGE_STAND=beachPoint(SUMMIT_LEDGE_BEARING,.3),SUMMIT_LEDGE_BUOY=beachPoint(SUMMIT_LEDGE_BEARING,-.9);
/** The deep-sea boats' rarity boost (internal, never shown) and their slower bite (seconds), see FISH_SPOTS. */
export const DEEP_BOOST:Partial<Record<FishRarity,number>>={common:.85,uncommon:1.15,rare:1.6,legendary:1.6};
export const DEEP_BITE_DELAY=8;
// Oct 13 2026 ("fix all the fishing spots to be casting farther out, to see more of the ocean and a little deeper"): every
// spot's buoy moved to roughly 1.6-2.2x its old distance from the stand (tests/fishing.cjs checks each is still in open
// water, clear of rocks, piers and the sandbar). castPoint (fishingCore.ts) now casts to the buoy's own distance (capped
// by what is actually open water), so this is the one lever that makes the live cast land farther too.
export const FISH_SPOTS:(FishSpot&{id:SpotId})[]=[
 {id:'south-pier',name:'South Pier Fishing Station',x:217,z:212.6,buoy:{x:217,z:241.5},
  reef:'barnacle-pilings',weights:{},story:'The old fishing station at the end of the South Pier. Mackerel shoals pass here.'},
 {id:'west-pier',name:'Lifebuoy Point',x:63,z:212.6,buoy:{x:63,z:239.3},
  reef:'lifebuoy-lagoon',weights:{},story:'Beside the red lifebuoy on the western boardwalk. Shrimp love the warm shallows.'},
 {id:'harbour-wall',name:'Harbour Wall',x:237.2,z:66,buoy:{x:264.8,z:66},
  reef:'harbour-fan-wall',weights:{},story:'The stone harbour wall behind the farmers market. Deep, cold water for cod and haddock.',camera:{lift:1.6,out:0,look:0}},
 {id:'north-rocks',name:'North Beach Rocks',x:60,z:-238,buoy:{x:60,z:-266.9},
  reef:'tidepool-flat',weights:{},story:'Tide-pool rocks at the quiet end of North Beach. Octopuses hide in the cracks.'},
 {id:'west-cove',name:'West Cove',x:-95.5,z:24,buoy:{x:-122.4,z:24},
  reef:'stream-channel',weights:{},story:'A windy cove on the west coast where a little stream meets the sea, so river fish swim in beside the rays and sharks.'},
 // Deep Sea Boats (Sep 29 2026; moved and joined by a second boat Oct 14 2026, ./deepSeaBoatData.ts): moored out in the deep
 // open bay, reached by jetpack or parachute. Stand on the aft deck and cast off the starboard (east, seaward) side. Deep water
 // (Oct 14 2026, user: "increase the probability of bigger fish on boats since it's in deep sea"): rare and legendary catches
 // twice as likely, uncommon a little more, commons a quarter less (DEEP_BOOST), and each bite takes a few seconds longer to
 // rise from the deep (DEEP_BITE_DELAY), so coins per minute stay close to the shore's (docs/economy.md, tests/economy.cjs).
 ...DEEP_SEA_BOATS.map((b,i)=>({id:b.spotId,name:i?'Summit Deep Boat':'Deep Sea Boat',deep:true,x:b.stand.x,z:b.stand.z,buoy:{x:b.buoy.x,z:b.buoy.z},
  reef:i?'abyss-green':'blue-abyss',weights:{},story:i?'A second little fishing boat, moored in the deep channel west of Summit Isle. Green, deep water where tuna, sailfish and marlin hunt the bait balls.':'A little fishing boat moored far out in the deep blue bay, north of the East Jetty. Squid, marlin and stranger things swim far below.',
  camera:{lift:1.6,out:4,look:.5},boat:{floor:b.deckY,prompt:b.prompt},shallowFactor:.5,rarityBoost:DEEP_BOOST,biteDelay:DEEP_BITE_DELAY}) as FishSpot&{id:SpotId}),
 // East Jetty (Sep 29 2026 as the East Pier; spiral jetty Sep 30, lib/town/eastPier.ts): the outer east curve of the spiral off the farmers market. No specials of its
 // own: a table between the shore and the deep sea, built from species already in the game (the four shared commons, herring,
 // cod and haddock, plus the odd tuna or octopus that swims in from deeper water). Mean catch ≈ 4.05 coins (shore ≈ 4.0).
 {id:'east-pier',name:'East Jetty Spiral',x:EAST_PIER_FISHING.x,z:EAST_PIER_FISHING.z,buoy:{...EAST_PIER_FISHING.buoy},
  reef:'jetty-kelp',weights:{},story:'The outer curve of the spiral at the end of the East Jetty, out past the farmers market. Deeper water than the shore, so a tuna or an octopus sometimes swims by.'},
 // ---- Coral Cay causeway and cay shore (Oct 5 2026, user: "add more fishing spots along the bridge road and coral cay island").
 // Like the East Jetty: no specials of their own, tables built from the ten shared species to fit the water (sandy shallows
 // vs the open channel under the causeway), each mean catch 3.75–4.26 coins (shore ≈ 4.0; tests/fishing.cjs). Names and
 // stories are island stories (game fiction). Placement (tests/fishing.cjs checks it against coralCay.ts):
 // - causeway posts stand on the widest sand banks, 1.6 m inside the walkable edge and 9+ m off the road's centre (lanes are
 //   ±2 m, lamps 6.65 m, all left clear), between the friendly sharks' patrol stretches (buoys ≥ 9 m from every loop) and
 //   clear of the bank palms, umbrellas and ball-hunt balls;
 // - cay posts stand a fifth of the way up the beach from the waterline, casting square to the coast, away from the court,
 //   the farm fence and track, the hostel, the huts and the Sharks Beach sign, vending machine and ball.
 // causeway-gate and causeway-channel sit right along the friendly sharks' patrol stretch (buoys must stay ≥ 9 m from
 // every loop point, tests/fishing.cjs): past about 9-10 m out, the straight cast line runs alongside the patrol rather
 // than away from it, so these two only gained a modest ~1.1-1.2x (their farthest point that still clears the sharks);
 // turtle-bank is clear of the patrol and reaches the full ~2.1x.
 {id:'causeway-gate',name:'Seawall Gate Sands',area:'causeway',x:254.8,z:-169.2,buoy:{x:253.7,z:-178.6},
  reef:'seawall-rubble',weights:{},story:'A sandy bank just past the seawall gate, where the causeway leaves the main island. Shrimp dart about in the warm shallows, and an octopus hides in the seawall stones.'},
 {id:'causeway-channel',name:'Channel Bend',area:'causeway',x:359.2,z:-176.1,buoy:{x:354.6,z:-166.8},
  reef:'channel-tables',weights:{},story:'The causeway\'s big bend over the deepest water between the two islands. Shoals swim through the open channel, and now and then a tuna or a little shark follows them.'},
 {id:'turtle-bank',name:'Turtle Bank',area:'causeway',x:486.2,z:-124.8,buoy:{x:494.5,z:-108.4},
  reef:'turtle-meadow',weights:{},story:'A wide sand bank on the last stretch to Coral Cay, looking out toward Turtle Sandbar. Clear, sandy shallows where young sharks cruise past.'},
 {id:'coral-garden',name:'Coral Garden Beach',area:'cay',x:514.8,z:-226.5,buoy:{x:508.4,z:-245.1},
  reef:'pink-ring',weights:{},story:'The quiet north-west beach of Coral Cay. Coral grows just offshore, so octopuses and little sharks come hunting.'},
 {id:'sharks-beach',name:'Sharks Beach Point',area:'cay',x:697.3,z:-200.2,buoy:{x:700.5,z:-216.1},
  reef:'sunlit-patches',weights:{},story:'The east end of Sharks Beach, a long kick from the beach-soccer court. The open sea starts here, so tuna and little sharks swim close in.'},
 {id:'farm-beach',name:'Farm Beach',area:'cay',x:651,z:-68.1,buoy:{x:664.9,z:-55.1},
  reef:'fruit-garden',weights:{},story:'The sunny south beach below Coral Cay Farm. Cod and haddock nose along the sandy bottom, and the farmers swap fruit for the catch.'},
 // ---- Summit Isle (Oct 12 2026, user: "a rocky cove on the far side, with 2-3 new fish species"). Its own specials only
 // (like the main six shore spots), not the shared causeway/cay table: the cove is a destination catch, not a passing visitor.
 {id:'summit-cove',name:'Boulder Cove',area:'summit',x:SUMMIT_COVE_STAND.x,z:SUMMIT_COVE_STAND.z,buoy:{x:SUMMIT_COVE_BUOY.x,z:SUMMIT_COVE_BUOY.z},
  reef:'boulder-cove',weights:{},story:'A rocky cove on Summit Isle’s far shore, piled with boulders, right round the coast from the sandbar. Shy animals shelter in the cracks between the rocks.'},
 // Lookout Rocks and Palm Point (Oct 13 2026): the island's other two boulder headlands, each with its own exclusive catch
 // like the cove, not the shared causeway/cay table.
 {id:'summit-palm',name:'Palm Point',area:'summit',x:SUMMIT_PALM_STAND.x,z:SUMMIT_PALM_STAND.z,buoy:{x:SUMMIT_PALM_BUOY.x,z:SUMMIT_PALM_BUOY.z},
  reef:'palm-staghorn',weights:{},story:'A curving beach on Summit Isle’s shore, shaded by a lone dune palm where five boulders break the swell. Shore crabs work the sand between them.'},
 {id:'summit-lookout',name:'Lookout Rocks',area:'summit',x:SUMMIT_LOOKOUT_STAND.x,z:SUMMIT_LOOKOUT_STAND.z,buoy:{x:SUMMIT_LOOKOUT_BUOY.x,z:SUMMIT_LOOKOUT_BUOY.z},
  reef:'lookout-bommies',weights:{},story:'Four boulders set out like stepping stones along a straight stretch of beach, in sight of the island’s old lookout. Shoals of silvery fish pass close to shore here.'},
 // Drop-off Ledge (Oct 14 2026, user: "add one more fishing spot to the mountain island on the southeast side"): the south-east
 // shore at bearing 54° (SUMMIT_LEDGE_BEARING), in the gap between the south-east sharks' patrol (34–58°, 29 m+ out) and the
 // south bay's mantas; ≈ 21 m from where the sea cave stood until Oct 15 2026 (it is now on the north-west beach), ≈ 30 m from the beach hut. A shore spot with shore odds: like the East Jetty,
 // no specials of its own, a table of the shared species that fits a rocky ledge over deeper water (no shrimp; cod, haddock and
 // a little shark), mean catch ≈ the shore's.
 {id:'summit-ledge',name:'Drop-off Ledge',area:'summit',x:SUMMIT_LEDGE_STAND.x,z:SUMMIT_LEDGE_STAND.z,buoy:{x:SUMMIT_LEDGE_BUOY.x,z:SUMMIT_LEDGE_BUOY.z},
  reef:'ledge-dropoff',weights:{},story:'A rocky ledge on Summit Isle’s south-east shore, where the sand stops and the sea drops away into deep blue. Cod and haddock nose along the edge, and now and then a little shark patrols it.'},
];

/**
 * Internal catch weights by rarity (code + docs only, NEVER shown to kids): commons are easy, each rarer tier is
 * progressively harder to meet. A species may override its weight with `weight`.
 */
export const RARITY_WEIGHT:Record<FishRarity,number>={common:40,uncommon:12,rare:4,legendary:1.2};
/** The shore spots (fishing posts), without the boat. */
export const SHORE_SPOTS=FISH_SPOTS.filter(s=>!s.boat);
export const spotById=(id:string)=>FISH_SPOTS.find(s=>s.id===id);
/** The deep-sea boat spots. */
export const BOAT_SPOTS=FISH_SPOTS.filter(s=>s.deep);

/**
 * THE farmers-market sell stand (fish, produce, cards): the existing CITRUS & FRUIT stall of lib/town/farmersMarket.ts
 * (stall 2, x 230 z 35) — the same stall the island jobs produce sale points at (lib/town/jobs/jobCatalog.ts MARKET_STALL),
 * so there is one stall, not two. Rosa is the seated vendor already modelled there.
 */
export const MARKET_STAND={x:230,z:35,front:{x:225.2,z:35},seller:'Rosa'};