/**
 * The Deep Sea Boat (Sep 29 2026): a small moored fishing boat in the open water between the main island's east coast and
 * the Coral Cay causeway. Pure data (no three.js) shared by the fishing rules (open water, cast point), the spot list, the
 * 3D build (./deepSeaBoat.ts) and tests/fishing.cjs.
 *
 * Position (Sep 29 2026, third placement, user: "move the boat here" on a jetpack screenshot): (282.5, -93.5). Derived
 * by reproducing the user's view (2000x1185 viewport, jetpack at 34 m over (321.5, -54.3), fitted so the boat and its
 * red float land on the pixels in their screenshot) and unprojecting the centre of their red circle onto the sea plane.
 * It is ~38 m off the main island's east beach (far outside the 5 m shallow band), ~62 m from the causeway and its banks,
 * ~38 m from the nearest causeway shark patrol point, and the deck plus a 12 m ring of fishing water is inside the flight
 * zone. It is west of Coral Cay's `isInSouthSeaBlock` (x >= 300); the user's placement overrides that rule. Coral Cay's
 * `CAY_LANDMARKS.deepSeaMooring` is no longer used by the boat. tests/fishing.cjs re-checks these rules.
 *
 * The bow points north, along the coast (BOAT_YAW); the starboard side, where you cast, faces east, out to sea. The open
 * aft deck is registered as a landable floor (lib/town/landableDecks.ts) while the boat exists, so the player can jetpack
 * or parachute onto it and walk; the wheelhouse and bow are not floor, so the existing water rule stops walking at the
 * deck's edges.
 */
export const BOAT_SPOT_ID='deep-sea-boat';
export const BOAT_MOORING={x:282.5,z:-93.5};
/** Rotation about y (three.js convention, also landableDecks' yaw): local +x (the bow) points to world -z (north). */
export const BOAT_YAW=Math.PI/2;
const C=Math.cos(BOAT_YAW),S=Math.sin(BOAT_YAW);
/** Boat-local (bow +x, starboard +z) to world. */
export const boatToWorld=(lx:number,lz:number)=>({x:BOAT_MOORING.x+lx*C+lz*S,z:BOAT_MOORING.z-lx*S+lz*C});
/** World to boat-local. */
export const worldToBoat=(x:number,z:number)=>{const dx=x-BOAT_MOORING.x,dz=z-BOAT_MOORING.z;return {x:dx*C-dz*S,z:dx*S+dz*C};};
/** Deck floor above the world origin (the sea surface is at y -0.43). Below the 1.2 m "on foot" limit in Town.tsx. */
export const BOAT_DECK_Y=.76;
/** Hull footprint in boat-local metres (bow at +x). */
export const BOAT_HULL={x0:-5.5,x1:5.7,halfBeam:1.95};
/** The open aft deck the player can stand on (inside the bulwarks, clear of the wheelhouse), world coordinates. */
export const BOAT_DECK={id:'deep-sea-boat',...boatToWorld(-2.4,0),w:5.2,d:2.9,yaw:BOAT_YAW,height:BOAT_DECK_Y};
/** The hull in world coordinates (the float and fish shadows never go here). */
export const onBoatHull=(x:number,z:number)=>{const p=worldToBoat(x,z);return p.x>BOAT_HULL.x0&&p.x<BOAT_HULL.x1&&Math.abs(p.z)<BOAT_HULL.halfBeam;};
/** Axis-aligned world box round the hull plus a margin: open-water exclusion (like the moored ferry's) and desktop hover. */
export const BOAT_AFLOAT=(()=>{const pts=[[BOAT_HULL.x0,-BOAT_HULL.halfBeam],[BOAT_HULL.x0,BOAT_HULL.halfBeam],[BOAT_HULL.x1,-BOAT_HULL.halfBeam],[BOAT_HULL.x1,BOAT_HULL.halfBeam]].map(([a,b])=>boatToWorld(a,b));
 return {x0:Math.min(...pts.map(p=>p.x))-.5,x1:Math.max(...pts.map(p=>p.x))+.5,z0:Math.min(...pts.map(p=>p.z))-.5,z1:Math.max(...pts.map(p=>p.z))+.5};})();
/** The fishing stand on the deck and the red float marker off the starboard side. */
export const BOAT_STAND=boatToWorld(-2.4,.5),BOAT_BUOY=boatToWorld(-2.4,7.5);
/** Where the "Fish" prompt floats: over the rod holders on the starboard rail. */
export const BOAT_PROMPT={...boatToWorld(-3.2,1.5),y:3.2};
