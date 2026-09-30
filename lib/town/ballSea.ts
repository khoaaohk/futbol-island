/**
 * Kicking the ball out to sea (Sep 29 2026, user: "allow kicking the ball out to the ocean"). The walking ball may leave any
 * coast, beach, the causeway deck or a sandbar and fly over open water with its normal physics. Over water it splashes, floats
 * and bobs for a moment, then returns to the player (walkBall.ts `recall`). Past the flyable zone's edge it is recalled at once,
 * so a ball is never lost at sea. Pure point tests only: no loop, no state.
 */
import {onLand} from './landmass';
import {flightBlocked} from './simulation';

/** The ocean surface (world.ts places the water plane at y −0.43). */
export const SEA_LEVEL=-.43;
export type BallGround='land'|'sea'|'edge';
/** Land (the islands, causeway, sandbars, ferry gangway, landable decks), open sea inside the flyable zone, or beyond its edge. */
export function ballGround(x:number,z:number):BallGround{
 if(onLand(x,z))return 'land';
 return flightBlocked(x,z)?'edge':'sea';
}
/** The one-line teaching note shown the first time a ball goes into the sea each session.
 *  IFAB Laws of the Game, Law 9 (The Ball In and Out of Play): the ball is out when it has wholly passed over the goal line or
 *  touchline; play restarts with a throw-in, goal kick or corner kick (https://www.theifab.com/laws/latest/the-ball-in-and-out-of-play/). */
export const OUT_OF_PLAY_NOTE='Out of play! On a real pitch the ball is out once the WHOLE ball crosses the line: throw-in, goal kick or corner.';
