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
/** Deck floor above the world origin (the sea surface is at y -0.43). Below the 1.2 m "on foot" limit in Town.tsx. */
export const BOAT_DECK_Y=.76;
/** Hull footprint in boat-local metres (bow at +x). */
export const BOAT_HULL={x0:-5.5,x1:5.7,halfBeam:1.95};
/** How far the idle red float sits off the starboard rail (Oct 13 2026 "cast farther out": 7.5 → 15.3 m). */
export const BOAT_BUOY_OFF=15.3;

export type DeepSeaBoat={
 spotId:BoatSpotId;mooring:Pt;yaw:number;
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
function makeBoat(spotId:BoatSpotId,mooring:Pt,yaw:number):DeepSeaBoat{
 const C=Math.cos(yaw),S=Math.sin(yaw);
 const toWorld=(lx:number,lz:number)=>({x:mooring.x+lx*C+lz*S,z:mooring.z-lx*S+lz*C});
 const toLocal=(x:number,z:number)=>{const dx=x-mooring.x,dz=z-mooring.z;return {x:dx*C-dz*S,z:dx*S+dz*C};};
 const pts=[[BOAT_HULL.x0,-BOAT_HULL.halfBeam],[BOAT_HULL.x0,BOAT_HULL.halfBeam],[BOAT_HULL.x1,-BOAT_HULL.halfBeam],[BOAT_HULL.x1,BOAT_HULL.halfBeam]].map(([a,b])=>toWorld(a,b));
 return {spotId,mooring,yaw,toWorld,toLocal,
  deck:{id:spotId,...toWorld(-2.4,0),w:5.2,d:2.9,yaw,height:BOAT_DECK_Y},
  afloat:{x0:Math.min(...pts.map(p=>p.x))-.5,x1:Math.max(...pts.map(p=>p.x))+.5,z0:Math.min(...pts.map(p=>p.z))-.5,z1:Math.max(...pts.map(p=>p.z))+.5},
  stand:toWorld(-2.4,.5),buoy:toWorld(-2.4,BOAT_BUOY_OFF),prompt:{...toWorld(-3.2,1.5),y:3.2},
  onHull(x,z){const p=toLocal(x,z);return p.x>BOAT_HULL.x0&&p.x<BOAT_HULL.x1&&Math.abs(p.z)<BOAT_HULL.halfBeam;}};
}
/** Rotation about y (three.js convention, also landableDecks' yaw): local +x (the bow) points to world -z (north). */
export const BOAT_YAW=Math.PI/2;
export const DEEP_SEA_BOATS:readonly DeepSeaBoat[]=[
 makeBoat('deep-sea-boat',{x:335,z:-5},BOAT_YAW),
 makeBoat('deep-sea-boat-west',{x:385,z:185},BOAT_YAW),
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
