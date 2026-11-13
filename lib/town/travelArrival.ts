/**
 * Map travel keeps the movement mode (Nov 13 2026, owner bug: "using the map drops me back to walking"). Pure: what the player
 * is doing when they arrive at a map destination (components/Town.tsx's travel and pitch-travel blocks apply it).
 *  - walking arrives walking; a ground ride (scooter, bike, moped) arrives still riding, unless the spot is water (then swimming);
 *  - flying (the jetpack, hovering or under the parachute) arrives flying, ARRIVAL_FLIGHT.min..max m over the destination's ground
 *    (the height over the ground it had, kept in that band); a crashing jetpack ('fall') arrives walking;
 *  - swimming (or diving) arrives walking on land, swimming on water; the ride left on the sand is not brought back.
 * Multiplayer needs nothing extra: the next pose carries the mode from the ride (townBridge.ts partyLocal), and the jump itself sends
 * Warp (presence.ts islandJump / governPose), so remote players see the rider or flyer appear at the destination.
 */
import type {TravelMode} from './travelModes';

export const ARRIVAL_FLIGHT={min:8,max:40} as const;
export type ArrivalFrom={ride:TravelMode;
 /** The jetpack's phase (jetActions.state.phase): 'fall' = crashing, 'parachute' = under the canopy. */
 phase?:string;swimming:boolean;
 /** Flight height over the ground where the player left (m). */
 air:number};
export type Arrival={ride:TravelMode;flying:boolean;swimming:boolean;
 /** The flight height to set (world y), when flying. */
 flightHeight:number};
/** The arrival at a destination whose ground is at `groundY`, water or not. */
export function travelArrival(from:ArrivalFrom,dest:{groundY:number;water:boolean}):Arrival{
 if(from.ride==='jetpack'&&from.phase!=='fall'){const air=Number.isFinite(from.air)?from.air:ARRIVAL_FLIGHT.min;
  return {ride:'jetpack',flying:true,swimming:false,flightHeight:dest.groundY+Math.max(ARRIVAL_FLIGHT.min,Math.min(ARRIVAL_FLIGHT.max,air))};}
 if(from.swimming||from.ride==='jetpack')return {ride:'walk',flying:false,swimming:dest.water,flightHeight:dest.groundY};
 if(dest.water)return {ride:'walk',flying:false,swimming:true,flightHeight:dest.groundY};
 return {ride:from.ride,flying:false,swimming:false,flightHeight:dest.groundY};
}
