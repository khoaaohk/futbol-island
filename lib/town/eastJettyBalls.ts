/**
 * East Jetty ball hunt (Oct 25 2026; user: "Do an audit on the different explore sites and make sure to add ball hunt in each of
 * these spots", docs/EXPLORE_BALL_HUNT_AUDIT_OCT25.md). The East Jetty was the one Explore checklist place ("Walk the East Jetty")
 * with no hunt ball. ONE loose ball rests on the lighthouse plaza at the spiral's end, so walking the whole jetty pays off. Its spot
 * is derived from eastPier.ts's anchors (the plaza centre, JETTY_BEACON, KEEPER_HUT), never typed in as world coordinates, so it
 * follows any reshaping of the jetty; tests/east-jetty-ball.cjs re-checks it is on the walkway, clear of the lighthouse, the hut,
 * the two islanders, the fishing stand and the challenge spot.
 *
 * Lesson (a new idea nothing else in the game teaches, checked as docs/explore-ball-lessons.md describes): the coin toss before
 * kick-off (IFAB Laws of the Game, Law 8; source in ballHuntSources.ts, never in kid UI).
 *
 * Pure data (no three.js): the island imports it through coinQuest.ts, like every other ball.
 */
import type {CoinSpot} from './coinQuest';
import {EAST_PIER,JETTY_BEACON} from './eastPier';

const round2=(n:number)=>Math.round(n*100)/100;
/** On the plaza, south-west of the lighthouse's foot (away from the keeper's hut on its east side and the walkway coming in from
 *  the west): `along` metres from the plaza centre at `angle` (radians, 0 = east, +z = south). */
const plaza=(angle:number,along:number)=>({x:round2(JETTY_BEACON.x+Math.cos(angle)*along),z:round2(JETTY_BEACON.z+Math.sin(angle)*along)});
const LIGHTHOUSE=plaza(2.1,Math.min(EAST_PIER.plazaR-2,JETTY_BEACON.r+3));

export const EAST_JETTY_BALL_SPOTS:CoinSpot[]=[
 {id:'jetty-lighthouse',name:'East Jetty · lighthouse plaza',...LIGHTHOUSE,y:0,kind:'hidden',loose:true,concept:'law8-coin-toss',
  near:'A ball is resting by the lighthouse. Walk over to pick it up!',
  clue:'Walk the East Jetty all the way round its spiral. Something round waits where the light shines out to sea.',
  detail:'Follow the stone jetty from the Farmers Market out to sea and round the spiral to the round plaza. The ball rests on the paving beside the lighthouse.',
  teaching:'The coin toss before kick-off. Before the match the referee tosses a coin with both captains. The team that wins picks which goal to attack first, or to take the kick-off. At half-time the teams swap ends.',lesson:'support'},
];
export const EAST_JETTY_BALL_IDS=EAST_JETTY_BALL_SPOTS.map(s=>s.id);
