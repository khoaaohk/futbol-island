/**
 * Summit Isle ball hunt (Oct 15 2026, user: "add more balls to the mountain island. add 15 more balls. figure out creative ways
 * to add that and for players to interact to find them", then "add a few hut buildings on the mountain island, to have balls
 * there" and "also make this have a few hidden caves that have balls"). Fifteen balls take the hunt from 100 to 115, each found
 * through something Summit Isle already does:
 *  - up the fruit trees (2): the ball is stuck in the canopy; kick your ball at the trunk (or shake the tree on a fruit day) and it
 *    drops (Town's ball-collision hook and fruitTrees.ts' shake call coinHunt.treeHit);
 *  - from the air (2): a ball resting on the sunset hut's roof tip (glide down onto it with the parachute) and a padded crate on
 *    the summit's north rim (land on it from the jetpack, or kick its target), the hunt's classic landing box;
 *  - four huts (fisher's, hikers' rest, beach hut, sunset hut) and two caves (hillside, sea cave): built here as data, baked by
 *    summitIsleWorld.ts into the island's existing prop pieces (no new draw call), each with a ball at its doorway, porch,
 *    window shelf or just inside;
 *  - the riddle board at the sandbar landing (3): its riddles point to the lookout cairn, Lookout Rocks and the summit bend;
 *  - Summit Kick (1): a round with at least SCORE_BALL_HOOPS hoops pops a ball out of the kick post;
 *  - the whale-shark buoy (1, parachute or kick) and a sky ball over the south-east slopes (1, parachute).
 * Every position is checked against the built island by tests/summit-balls.cjs (trails, the pitch, the kiosk, the lookout,
 * fishing posts, NPCs, the orchard, beach finds, spacing, reachability). Lessons: ballHuntLessons.ts; sources: ballHuntSources.ts.
 *
 * Pure data (no three.js): the island imports it through coinQuest.ts, like every other ball.
 */
import type {CoinSpot} from './coinQuest';
import {summitGround,distanceToSummitShore,SUMMIT_VISUAL_DROP} from './summitIsle';

type Pt={x:number;z:number};
const round2=(n:number)=>Math.round(n*100)/100;
const unit=(x:number,z:number):Pt=>{const l=Math.hypot(x,z)||1;return {x:round2(x/l),z:round2(z/l)};};
const add=(p:Pt,d:Pt,k:number):Pt=>({x:round2(p.x+d.x*k),z:round2(p.z+d.z*k)});
/** A walked ground spot (the coin hunt compares the player's walked height with `y`). */
const ground=(p:Pt)=>({x:p.x,z:p.z,y:round2(summitGround(p.x,p.z))});
/** Downhill, numerically (a hillside cave opens down the slope, toward the follow camera on the south-east face). */
const downhill=(p:Pt)=>{const e=.8;return unit(summitGround(p.x-e,p.z)-summitGround(p.x+e,p.z),summitGround(p.x,p.z-e)-summitGround(p.x,p.z+e));};
/** Toward the nearest waterline (a sea cave opens onto the beach). */
const seaward=(p:Pt)=>{const e=1;return unit(distanceToSummitShore(p.x-e,p.z)-distanceToSummitShore(p.x+e,p.z),distanceToSummitShore(p.x,p.z-e)-distanceToSummitShore(p.x,p.z+e));};

// ---- Huts: round thatched huts in Coral Cay's style (stucco drum, dark doorway, straw cone), smaller. -----------------------
export const SUMMIT_HUT_RADIUS=2.3;
export type SummitHut={id:'fisher'|'rest'|'beach'|'sunset';name:string;x:number;z:number;/** the doorway faces this way */door:Pt;
 /** the beach hut's window with a shelf (its ball sits on the sill) */window?:Pt;/** the rest hut's thatched porch and bench */porch?:boolean};
export const SUMMIT_HUTS:readonly SummitHut[]=[
 // Boulder Cove's fisher: the door faces the sea, away from the follow camera, so you walk round the hut to find the ball.
 {id:'fisher',name:'Fisher’s hut',x:559,z:216,door:unit(-81,86)},
 // On the east foothills, below the east beach path: a porch and a bench facing the camera, the ball under the bench.
 {id:'rest',name:'Hikers’ rest hut',x:752,z:110,door:unit(1,1),porch:true},
 // Above the south beach: door east, a window with a shelf facing the beach.
 {id:'beach',name:'Beach hut',x:689,z:222.5,door:{x:1,z:0},window:{x:0,z:1}},
 // On the west lawn above the whale shark's sea, facing the sunset: a ball rests on its roof tip (parachute only).
 {id:'sunset',name:'Sunset hut',x:505,z:175,door:unit(-1,.25)},
];
/** Hut shape (m): the drum rises HUT_WALL over the highest ground round it, the eave ring and the straw cone sit on top. The build
 *  (summitIsleWorld.ts) and the roof ball both use hutRoofTip, so the ball always sits on the cone's tip. */
export const HUT_WALL=2.3,HUT_CONE=1.8,HUT_CONE_LIFT=1.03;
/** Highest drawn ground under a hut's wall (16 points round it). */
export function hutGroundTop(h:Pt){let hi=-Infinity;for(let a=0;a<16;a++)hi=Math.max(hi,summitGround(h.x+Math.cos(a/16*Math.PI*2)*SUMMIT_HUT_RADIUS,h.z+Math.sin(a/16*Math.PI*2)*SUMMIT_HUT_RADIUS)-SUMMIT_VISUAL_DROP);return hi;}
/** The straw cone's tip (drawn height). */
export const hutRoofTip=(h:Pt)=>hutGroundTop(h)+HUT_WALL+HUT_CONE_LIFT+HUT_CONE/2;
// ---- Caves: a shallow walk-in alcove of low-poly boulders built onto the ground (no hole in the terrain), open toward the camera.
export type SummitCave={id:'hill'|'sea';name:string;x:number;z:number;/** the mouth faces this way (out of the cave) */mouth:Pt};
const HILL_CAVE={x:706,z:191},SEA_CAVE={x:746,z:237};
export const SUMMIT_CAVES:readonly SummitCave[]=[
 {id:'hill',name:'Hillside cave',...HILL_CAVE,mouth:downhill(HILL_CAVE)},
 {id:'sea',name:'Sea cave',...SEA_CAVE,mouth:seaward(SEA_CAVE)},
];
/** Cave shape (m): the mouth's two side boulders sit CAVE_SIDE either side of the centre line, the back boulder CAVE_BACK behind. */
export const CAVE_SIDE=2.2,CAVE_BACK=3.4,CAVE_BALL_IN=.9;
/** The riddle board at the sandbar landing: a notice board beside the trailhead (baked, no text texture; the riddles show in
 *  the coin-hunt hint when you stand at it). */
export const RIDDLE_BOARD={x:616.5,z:29,yaw:Math.PI*.15} as const;
export const RIDDLE_REACH=3.2;
/** Summit Kick: a round with at least this many hoops pops the kick-post ball out. */
export const SCORE_BALL_HOOPS=3;
/** The two tree balls' trees (orchard plants from summitOrchard.ts' plan; tests/summit-balls.cjs checks they are still there). */
export const TREE_BALL_TREES={mango:{x:626.13,z:37.14,top:4.93},shore:{x:771.62,z:173.39,top:5.35}} as const;

const hut=(id:SummitHut['id'])=>SUMMIT_HUTS.find(h=>h.id===id)!;
const cave=(id:SummitCave['id'])=>SUMMIT_CAVES.find(c=>c.id===id)!;
const inCave=(c:SummitCave)=>add(c,c.mouth,-CAVE_BALL_IN);
const H=SUMMIT_HUT_RADIUS;

/** Where each ball sits and how it is found. `concept` tags the one idea each teaches (tests/summit-balls.cjs: no overlap). */
export const SUMMIT_BALL_SPOTS:CoinSpot[]=[
 // ── Up the fruit trees (2) ──
 {id:'summit-mango',name:'Summit Isle · trailhead mango tree',...ground({x:628.5,z:37.1}),kind:'kick',summit:true,reveal:'tree',tree:TREE_BALL_TREES.mango,concept:'law8-dropped-ball',
  near:'Something round is stuck up in this mango tree! Kick your ball at the trunk, or shake the tree on a fruit day.',
  clue:'Near the start of the Summit Isle trail, a mango tree is hiding more than mangoes.',
  detail:'Walk up from the sandbar landing to the umbrella-shaped mango tree beside the trail. Kick your ball at its trunk (or shake it when it has fruit) and the hidden ball drops.',
  teaching:'A dropped ball goes back to its team. If the referee stops play for an injury, they drop the ball for the team that touched it last, and everyone else stands at least 4 metres away.',lesson:'support'},
 {id:'summit-shore-mango',name:'Summit Isle · east shore mango tree',...ground({x:772.5,z:175.6}),kind:'kick',summit:true,reveal:'tree',tree:TREE_BALL_TREES.shore,concept:'law12-careless-challenge',
  near:'Something round is stuck up in this mango tree! Kick your ball at the trunk, or shake the tree on a fruit day.',
  clue:'On Summit Isle’s east shore, one round mango tree has a ball tangled in its leaves.',
  detail:'Follow the beach south from the east beach path. Find the round mango tree on the grass above the sand and kick your ball at its trunk.',
  teaching:'Play the ball, not the player. Tripping, pushing or kicking an opponent carelessly is a foul. The other team gets a free kick, or a penalty if it happens in your own penalty area.',lesson:'support'},
 // ── From the air (2): the sunset hut's roof tip (parachute) and a padded landing crate on the summit's north rim ──
 {id:'summit-hut-roof',name:'Summit Isle · sunset hut roof',x:505,z:175,y:round2(hutRoofTip({x:505,z:175})+SUMMIT_VISUAL_DROP),coinY:.36,kind:'hidden',summit:true,parachute:true,concept:'law16-goal-kick',
  near:'A ball is resting on the hut’s roof! Open your parachute above it and glide down onto the tip.',
  clue:'On Summit Isle’s west lawn, the sunset hut wears a ball on the tip of its straw roof.',
  detail:'Fly to the round hut on the west lawn, above the whale shark’s sea. Rise above it, open your parachute and steer down onto the very tip of the roof.',
  teaching:'A goal kick is in play as soon as it moves. Your keeper can pass to a teammate inside the penalty area, but the other team must wait outside the area until the ball is kicked.',lesson:'support'},
 {id:'summit-north-rim',name:'Summit Isle · summit’s north rim',...ground({x:660,z:120}),kind:'landing',summit:true,concept:'law5-referee-decides',
  clue:'On the summit, east of the pitch, a padded crate sits on the grass at the very top of the mountain.',
  detail:'Walk round the Summit 5s fence to its east side. Land on the padded crate from the jetpack, or face it and kick its target.',
  teaching:'The referee has the final say. Their decisions stand even if you disagree, and arguing can earn a yellow card. Play on and think about the next ball.',lesson:'support'},
 // ── At the huts (3; the sunset hut's roof ball is above) ──
 {id:'summit-fisher-hut',name:'Summit Isle · fisher’s hut',...ground(add(hut('fisher'),hut('fisher').door,H+.35)),kind:'hidden',summit:true,loose:true,concept:'keeper-set-position',
  clue:'A fisher’s hut near Boulder Cove keeps its door facing the sea.',
  detail:'Go to the round hut on the grass above Boulder Cove, in the south-west. Walk round to its doorway on the sea side.',
  teaching:'Set your feet before the shot. A keeper who is still moving can’t push off, so take a small hop and land on your toes, knees bent, hands ready, as the shooter strikes.',lesson:'support'},
 {id:'summit-rest-hut',name:'Summit Isle · hikers’ rest hut',...ground(add(hut('rest'),hut('rest').door,H+.75)),kind:'hidden',summit:true,loose:true,concept:'team-encourage',
  clue:'Tired hikers rest on a porch bench below the east beach path. Something rolled under it.',
  detail:'Find the round hut with a thatched porch on the east foothills, below the path from the east beach. Look under the bench on its porch.',
  teaching:'Lift a teammate after a mistake. Say “Unlucky, go again!” or give a thumbs up. Players who feel supported try again sooner, and the whole team plays braver.',lesson:'support'},
 {id:'summit-beach-hut',name:'Summit Isle · beach hut window',...ground(add(hut('beach'),hut('beach').window!,H+.25)),kind:'hidden',summit:true,loose:true,coinY:1.42,concept:'skill-disguise-pass',
  clue:'A beach hut above the south beach has something resting on its window shelf.',
  detail:'Walk along the grass above Summit Isle’s south beach to the round hut. Its window faces the sea, and the ball sits on the shelf.',
  teaching:'Look one way, pass the other. Defenders read your eyes and hips, so look at one teammate, then turn your hips late and pass to another. A little disguise wins a free pass.',lesson:'support'},
 // ── In the caves (2) ──
 {id:'summit-hill-cave',name:'Summit Isle · hillside cave',...ground(inCave(cave('hill'))),kind:'hidden',summit:true,loose:true,concept:'law4-shin-guards',
  clue:'Boulders on the south-east slope hide a small cave. Peek inside!',
  detail:'Climb the grassy south-east slope halfway up the mountain. Look for a pile of big boulders with a dark opening, and walk in.',
  teaching:'Shin guards on, jewellery off. The Laws say every player wears shin guards covered by their socks, and takes off watches, earrings and bracelets so nobody gets hurt.',lesson:'support'},
 {id:'summit-sea-cave',name:'Summit Isle · sea cave',...ground(inCave(cave('sea'))),kind:'hidden',summit:true,loose:true,concept:'law17-corner-goal',
  clue:'At the back of the south-east beach, rocks make a little sea cave.',
  detail:'Walk the south-east beach of Summit Isle. Where big rocks sit at the back of the sand, step into the cave mouth that faces the waves.',
  teaching:'You can score straight from a corner. A corner kick that curls into the goal without anyone touching it counts. Keepers, guard your near post when the corner swings in.',lesson:'support'},
 // ── Riddle board balls (3): the board at the sandbar landing reads out their riddles ──
 {id:'summit-cairn',name:'Summit Isle · lookout cairn',...ground({x:615.6,z:101.6}),kind:'hidden',summit:true,loose:true,riddle:'Where a red flag flies and five stones stand in a stack, look behind the pile and bring a ball back.',concept:'law8-kickoff-goal',
  clue:'Where a red flag flies and five stones stand in a stack, look behind the pile and bring a ball back.',
  detail:'Climb to the top of Summit Isle. By the lookout flag on the pitch’s north-west corner, look behind the stone cairn.',
  teaching:'A kick-off can go straight in. The ball must be kicked and clearly move, and a goal counts if it flies straight into the other team’s net. Try it when their keeper stands far out!',lesson:'support'},
 {id:'summit-lookout-rocks',name:'Summit Isle · Lookout Rocks',...ground({x:552,z:29.5}),kind:'hidden',summit:true,loose:true,riddle:'Four big boulders sit where the fishers cast. Find the last one in the row, and look past.',concept:'law3-eleven-players',
  clue:'Four big boulders sit where the fishers cast. Find the last one in the row, and look past.',
  detail:'Walk the north-west beach to Lookout Rocks, the row of boulders by the fishing spot. The ball is on the sand beside the last boulder.',
  teaching:'Eleven players a side, one is the keeper. In an 11-a-side match each team has up to eleven players, including a goalkeeper, and a match can’t carry on if a team has fewer than seven.',lesson:'support'},
 {id:'summit-bend',name:'Summit Isle · summit bend',...ground({x:617,z:150}),kind:'hidden',summit:true,loose:true,riddle:'The trail swings round just before the top. Step off the path where the hikers stop.',concept:'law12-handball',
  clue:'The trail swings round just before the top. Step off the path where the hikers stop.',
  detail:'Follow the trail up until it bends round onto the summit, south-west of the pitch. The ball rests on the grass just off the bend.',
  teaching:'Keep your arms close when you block. It is handball if you touch the ball on purpose with your hand or arm, or your arm makes your body bigger. Tuck your arms in.',lesson:'support'},
 // ── Summit Kick (1): won, then collected at the kick post ──
 {id:'summit-kick-bonus',name:'Summit Isle · Summit Kick prize',x:645.5,z:132.8,y:50,kind:'kick',summit:true,reveal:'score',coinY:3.4,concept:'skill-side-foot-pass',
  near:`Hit ${SCORE_BALL_HOOPS} hoops in one Summit Kick round to win the hidden ball!`,
  clue:`Hit ${SCORE_BALL_HOOPS} or more hoops in one Summit Kick round on the summit.`,
  detail:`Start a Summit Kick round at the post by the pitch gate. Pop at least ${SCORE_BALL_HOOPS} of the five hoops in one round and a ball pops out of the kick post.`,
  teaching:'Pass with the inside of your foot. Put your standing foot beside the ball, pointing at your target, lock your ankle and push through the middle of the ball. It is the most accurate kick.',lesson:'support'},
 // ── Out at sea and up in the sky (2) ──
 {id:'summit-whale-buoy',name:'Summit Isle · whale-shark buoy',x:476,z:60,y:0,kind:'hidden',summit:true,parachute:true,buoy:true,concept:'skill-cruyff-turn',
  near:'Open your parachute above the buoy and glide down over it.',
  clue:'From the summit lookout, a red buoy bobs in the whale shark’s sea, off the north-west coast.',
  detail:'Fly out west from the north-west beach toward the whale shark. Open your parachute above the red buoy and steer down over it.',
  teaching:'Escape with a Cruyff turn. Pretend to pass or shoot, then drag the ball behind your standing leg with the inside of your foot and spin away. Johan Cruyff made it famous in 1974.',lesson:'movement'},
 {id:'summit-sky',name:'Summit Isle · eagle’s sky',x:720,z:215,y:80,kind:'hidden',summit:true,parachute:true,concept:'law13-indirect-free-kick',
  clue:'High above Summit Isle’s south-east slopes, a ball floats where the eagles fly.',
  detail:'Use your flight launch to rise high above the south-east slopes, then open your parachute and steer down through the floating ball.',
  teaching:'An indirect free kick needs a second touch. The referee raises an arm high, and the ball must touch another player before a goal can count. Pass it short first, then shoot!',lesson:'movement'},
];
/** Every Summit Isle ball id, in hunt order (tests and the save migration). */
export const SUMMIT_BALL_IDS=SUMMIT_BALL_SPOTS.map(s=>s.id);
/** The riddle board's text: the riddles of the balls still to find (all found: a well-done line). */
export function riddleBoardText(found:ReadonlySet<string>){
 const open=SUMMIT_BALL_SPOTS.filter(s=>s.riddle&&!found.has(s.id));
 return open.length?'Riddle board · '+open.map((s,i)=>`${i+1}. ${s.riddle}`).join(' '):'Riddle board · You solved every riddle. Well done, explorer!';
}
