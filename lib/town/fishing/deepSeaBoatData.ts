/**
 * The Deep Sea Boats (Sep 29 2026; two boats since Oct 14 2026): small moored fishing boats out in the deep open bay. Pure
 * data (no three.js) shared by the fishing rules (open water, cast point), the spot list, the 3D build (./deepSeaBoat.ts),
 * the analytics places and tests/fishing.cjs.
 *
 * Oct 14 2026 (user, on the travel map: "move the fishing boat over more to where i circled and then add a second boat to
 * the west of the mountain island"):
 * - The Deep Sea Boat moved from (282.5, -93.5) (38 m off the main island's east beach, south of the causeway) to (335, -5):
 *   the circled open bay just north of the East Jetty's spiral, between the jetty and the old mooring. The map draws world x/z
 *   straight onto its SVG (components/IslandOverview.tsx: viewBox in world metres, x → x, z → y), so the circle's map point
 *   IS the world point. ≈ 89 m off the main island's east coast, 45 m clear of the jetty's rock armour, ≈ 100 m from the
 *   nearest manta loop and 136 m from Coral Cay.
 * - The Summit Deep Boat: (385, 185), open water between the main island's south-east coast and Summit Isle's west coast,
 *   south of the East Jetty: ≈ 140 m off the main island, 90 m off Summit Isle, ≈ 68 m from the whale shark's loop and
 *   ≈ 90 m from the jetty.
 * tests/fishing.cjs re-checks both against the live coast, jetty, sea-life loops, floats and flight rules.
 *
 * Each bow points north (yaw π/2) and you cast off the starboard side, east, out over the deepest water. The open aft deck is
 * registered as a landable floor (lib/town/landableDecks.ts) while its boat is built, so the player can jetpack or
 * parachute onto it and walk; the wheelhouse and bow are not floor, so the water rule stops walking at the deck's edges.
 */
type Pt={x:number;z:number};
export type BoatSpotId='deep-sea-boat'|'deep-sea-boat-west';
/** The sea surface (world y). The hull's height scale (freeboard) is taken about it, so the waterline never moves. */
export const SEA_Y=-.43;
/** The family's base deck floor above the world origin (the full-size boat). Below the 1.2 m "on foot" limit in Town.tsx. */
export const BOAT_DECK_Y=.76;
/** The family's base hull footprint in boat-local metres (bow at +x); each boat scales it by its look (BoatLook.scale). */
export const BOAT_HULL={x0:-5.5,x1:5.7,halfBeam:1.95};
/** How far the idle red float sits off the starboard rail (Oct 13 2026 "cast farther out": 7.5 → 15.3 m). */
export const BOAT_BUOY_OFF=15.3;

/**
 * Each boat's own look (Oct 26 2026, user: "the deep-sea fishing boats look identical; give each its own variation in size and
 * colours"). Pure data, fixed per boat (no runtime randomness): one family (same hull lines, low-poly parts and vertex-colour
 * material), but its own size, paint, roof, top, mast, fenders, deck clutter and bow number. ./deepSeaBoat.ts builds the mesh from
 * it (one cached merged geometry per look) and every size-dependent rule (footprint, deck, stand, captain, prompt, swell) below
 * follows `scale`.
 */
export type BoatLook={
 /** Stable cache key and test signature. */
 key:string;
 /** Hull length (x), beam (z) and freeboard (height above the sea) against the family's base boat. */
 scale:{length:number;beam:number;freeboard:number};
 /** Hull paint: topsides, the boot stripe at the waterline, the sheer stripe along the topsides, the gunwale/rail trim. */
 hull:string;boot:string;stripe:string;trim:string;
 deck:string;seam:string;
 /** Wheelhouse walls, the band round its foot, its roof and roof edge. */
 cabin:string;cabinBand:string;roof:string;roofEdge:string;
 /** A striped sun top over the wheelhouse roof (two colours), or none. */
 canopy:readonly [string,string]|null;
 /** Mast dressing: a football flag with outrigger poles, or a short mast with a long pennant. */
 mast:'flag-outriggers'|'pennant';flag:string;flagMark:string;
 /** Fenders on the port side, the life ring's two colours. */
 fender:string;ring:readonly [string,string];
 /** Deck clutter: the cooler and tackle box, or stacked fish boxes and a net pile. */
 clutter:'cooler'|'fish-boxes';
 /** Rod holders along the starboard rail and on the transom. */
 rods:{side:number;transom:number};
 /** The number painted on the bow board (both sides). */
 number:string;
 /** Swell multiplier: a smaller boat rides the same sea a little livelier (still inside BOAT_LIMITS). */
 swell:number;
};
export const BOAT_LOOKS:readonly BoatLook[]=[
 // The Deep Sea Boat (Captain Marina): the full-size family boat, cream hull, red boot, gold sheer stripe, teal trim, clay roof.
 {key:'marina-11',scale:{length:1,beam:1,freeboard:1},hull:'#f3ecdb',boot:'#b8483a',stripe:'#e0b04a',trim:'#2f6f73',deck:'#c9a172',seam:'#9c7650',
  cabin:'#f6f1e3',cabinBand:'#477c6a',roof:'#bd7657',roofEdge:'#a9654a',canopy:null,mast:'flag-outriggers',flag:'#3f7a78',flagMark:'#fff6e6',
  fender:'#e0513f',ring:['#e0513f','#fff3df'],clutter:'cooler',rods:{side:3,transom:2},number:'11',swell:1},
 // The Summit Deep Boat (Skipper Kofi): a smaller, livelier boat, sea-blue hull, navy boot, cream stripe, sunny trim, teal roof
 // under a red-and-cream sun top, yellow fenders, fish boxes and a net.
 {key:'kofi-10',scale:{length:.8,beam:.9,freeboard:.9},hull:'#4a8bb5',boot:'#243846',stripe:'#f3ecdb',trim:'#e8c25a',deck:'#b8895b',seam:'#8a6544',
  cabin:'#f3ecdb',cabinBand:'#4a8bb5',roof:'#2f6f73',roofEdge:'#255a5d',canopy:['#d9573f','#fff3df'],mast:'pennant',flag:'#e8c25a',flagMark:'#d9573f',
  fender:'#f0c23e',ring:['#ef8a3a','#fff3df'],clutter:'fish-boxes',rods:{side:2,transom:1},number:'10',swell:1.15},
];
/** A base-boat height (y, metres above the world origin) on a boat of this look. */
export const lookY=(look:BoatLook,y:number)=>SEA_Y+(y-SEA_Y)*look.scale.freeboard;

export type DeepSeaBoat={
 spotId:BoatSpotId;mooring:Pt;yaw:number;look:BoatLook;
 /** This boat's hull footprint (boat-local, scaled) and deck floor height (at rest). */
 hull:{x0:number;x1:number;halfBeam:number};deckY:number;
 /** Boat-local points: the fishing stand and where the captain stands. */
 standLocal:Pt;captainLocal:Pt;
 /** Boat-local (bow +x, starboard +z) to world, and back. */
 toWorld(lx:number,lz:number):Pt;toLocal(x:number,z:number):Pt;
 /** The open aft deck the player can stand on (inside the bulwarks, clear of the wheelhouse), world coordinates. */
 deck:{id:string;x:number;z:number;w:number;d:number;yaw:number;height:number};
 /** Axis-aligned world box round the hull plus a margin: open-water exclusion and desktop hover. */
 afloat:{x0:number;x1:number;z0:number;z1:number};
 /** The fishing stand on the deck, the red float off the starboard side and where the "Fish" prompt floats. */
 stand:Pt;buoy:Pt;prompt:Pt&{y:number};
 onHull(x:number,z:number):boolean;
};
function makeBoat(spotId:BoatSpotId,mooring:Pt,yaw:number,look:BoatLook):DeepSeaBoat{
 const C=Math.cos(yaw),S=Math.sin(yaw),L=look.scale.length,W=look.scale.beam;
 const toWorld=(lx:number,lz:number)=>({x:mooring.x+lx*C+lz*S,z:mooring.z-lx*S+lz*C});
 const toLocal=(x:number,z:number)=>{const dx=x-mooring.x,dz=z-mooring.z;return {x:dx*C-dz*S,z:dx*S+dz*C};};
 const hull={x0:BOAT_HULL.x0*L,x1:BOAT_HULL.x1*L,halfBeam:BOAT_HULL.halfBeam*W},deckY=lookY(look,BOAT_DECK_Y);
 // The base deck runs x -5.0..0.2 (stern bulwark to the wheelhouse door), z ±1.45; it scales with the hull.
 const deckCx=-2.4*L,deckFront=.2*L,standLocal={x:deckCx,z:.5*W};
 // The captain: 0.35 m aft of the deck's front edge (by the wheelhouse door) on the port side, whatever the size.
 const captainLocal={x:deckFront-.35,z:-1.1*W};
 const pts=[[hull.x0,-hull.halfBeam],[hull.x0,hull.halfBeam],[hull.x1,-hull.halfBeam],[hull.x1,hull.halfBeam]].map(([a,b])=>toWorld(a,b));
 return {spotId,mooring,yaw,look,hull,deckY,standLocal,captainLocal,toWorld,toLocal,
  deck:{id:spotId,...toWorld(deckCx,0),w:5.2*L,d:2.9*W,yaw,height:deckY},
  afloat:{x0:Math.min(...pts.map(p=>p.x))-.5,x1:Math.max(...pts.map(p=>p.x))+.5,z0:Math.min(...pts.map(p=>p.z))-.5,z1:Math.max(...pts.map(p=>p.z))+.5},
  stand:toWorld(standLocal.x,standLocal.z),buoy:toWorld(deckCx,BOAT_BUOY_OFF),prompt:{...toWorld(-3.2*L,1.5*W),y:lookY(look,3.2)},
  onHull(x,z){const p=toLocal(x,z);return p.x>hull.x0&&p.x<hull.x1&&Math.abs(p.z)<hull.halfBeam;}};
}
/** Rotation about y (three.js convention, also landableDecks' yaw): local +x (the bow) points to world -z (north). */
export const BOAT_YAW=Math.PI/2;
export const DEEP_SEA_BOATS:readonly DeepSeaBoat[]=[
 makeBoat('deep-sea-boat',{x:335,z:-5},BOAT_YAW,BOAT_LOOKS[0]),
 makeBoat('deep-sea-boat-west',{x:385,z:185},BOAT_YAW,BOAT_LOOKS[1]),
];
export const BOAT_SPOT_IDS:readonly string[]=DEEP_SEA_BOATS.map(b=>b.spotId);
export const boatBySpot=(id:string)=>DEEP_SEA_BOATS.find(b=>b.spotId===id);
/** Any boat's hull in world coordinates (the float and fish shadows never go there). */
export const onBoatHull=(x:number,z:number)=>DEEP_SEA_BOATS.some(b=>b.onHull(x,z));
/** Every boat's open-water exclusion box. */
export const BOAT_AFLOATS=DEEP_SEA_BOATS.map(b=>b.afloat);

// ---- The first boat (the original Deep Sea Boat), kept under its old names for existing callers and tests.
const FIRST=DEEP_SEA_BOATS[0];
export const BOAT_SPOT_ID=FIRST.spotId;
export const BOAT_MOORING=FIRST.mooring;
export const boatToWorld=FIRST.toWorld,worldToBoat=FIRST.toLocal;
export const BOAT_DECK=FIRST.deck;
export const BOAT_AFLOAT=FIRST.afloat;
export const BOAT_STAND=FIRST.stand,BOAT_BUOY=FIRST.buoy;
export const BOAT_PROMPT=FIRST.prompt;
