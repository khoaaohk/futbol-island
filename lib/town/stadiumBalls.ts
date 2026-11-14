/**
 * DRIP FC Stadium ball hunt (Nov 13 2026; owner: "extend the island ball hunt into the new stadium area"). Twelve balls take the
 * hunt from 116 to 128; a thirteenth (Nov 13 2026, owner: a second target on the big screen's west post) takes it to 129.
 *
 * Nov 13 2026 (owner: the loose balls on the plaza and the apron were "too easy to find"; "make them like the targets on
 * buildings", "place them as targets on the stadium" and "place some balls in the crowd"): the ids, concepts and lessons stay,
 * only the places and kinds change, so an old save's found balls stay found.
 *  - Eight WALL TARGETS on the stadium (the island's kick targets: coinQuest.ts `wall`, round high targets like the Coral Cay
 *    arch's): one on each gold gate pillar's plaza face (both sides of the entrance), on the east, west (two) and north stands' back
 *    walls, and on both of the big screen's posts (from the ground behind the south stand; the west one added later, the 129th ball). Kick the target, the ball drops in front of it.
 *  - Three CROWD balls resting on an empty seat among the fans: the seat right beside an aisle, which the crowd always leaves free
 *    (stadiumCrowd.ts crowdSeats, k 0), in a front row of the west and east stands (in front of the roof, so the roof fade never
 *    hides them) and mid-way up the open north stand. Walk up the aisle and step into the row.
 *  - Two LOOSE balls stay on the long stands' roofs (fly up and land): the target system needs a kick from the ground, and the
 *    mast heads are 30 m up.
 * Every spot is derived from the stadium's own anchors (stadiumSeats.ts STANDS / ROOF / SCREEN / GATE_ARCH_X, westParkLayout.ts
 * STADIUM / STADIUM_GATE), so a reshaped stand moves its ball with it; tests/stadium-balls.cjs re-checks every one against the town
 * the game really builds: each target on real stadium geometry and hit by a real kick from a reachable spot; each crowd ball on a
 * free seat among fans, reached by a walk up the aisle; the roof balls on the slabs.
 *
 * Lessons: thirteen stadium ideas no other ball (island or reef) teaches (tests/stadium-balls.cjs); sources in ballHuntSources.ts,
 * never in kid UI. Pure data (no three.js): the island imports it through coinQuest.ts, like every other ball.
 */
import type {CoinSpot,WallFacing} from './coinQuest';
import {STADIUM,STADIUM_GATE} from './westParkLayout';
import {STANDS,ROOF,ROW_DEPTH,SEAT_DEPTH,SEAT_TOP,SEAT_PITCH,AISLE_WIDTH,SCREEN,GATE_ARCH_X,rowHeight,standBack,standWorld,standSpans,spanSeats,type StandDef} from './stadiumSeats';

const r2=(n:number)=>Math.round(n*100)/100;
const stand=(id:StandDef['id'])=>STANDS.find(s=>s.id===id)!;
/** The roofs' walkable top (the slab's upper face, where a landing puts the feet). */
export const STADIUM_ROOF_TOP=ROOF.y+ROOF.thick/2;
/** How far in front of its target a target's ball drops (the pickup spot, on the line through the target). */
export const TARGET_DROP=2.4;
/** Wall targets' height over the ground: the gate pillars' and the back walls' (below the team-colour band at 3.6 m). */
export const PILLAR_TARGET_Y=3.4,BACK_TARGET_Y=2.6;
/** The gate pillars (stadiumWorld.ts): 1.6 m square, centred halfWidth + 0.4 either side of the walk. A target sits 0.2 m out from
 *  the pillar's middle (away from the walk; the pillar's uplight sits 0.5 m in, stadiumLights.ts, clear of the shot). */
const PILLAR_Z=STADIUM_GATE.halfWidth+.4,PILLAR_HALF=.8,PILLAR_TARGET_OUT=.2;
/** The big screen's posts (stadiumWorld.ts SCREEN_POST: radius 0.22, 1.5 m in from the screen's ends). */
export const SCREEN_POST_X=SCREEN.w/2-1.5,SCREEN_POST_R=.22;
/** The target on the screen's east post, over the ground behind the south stand (the frame's underside is at 7.6 m). */
export const SCREEN_TARGET_Y=5;

const facingOf=(s:StandDef):WallFacing=>s.axis==='x'?(s.out>0?'east':'west'):(s.out>0?'south':'north');
type Target=Pick<CoinSpot,'x'|'y'|'z'|'wall'>;
/** A round high target on a stand's back wall (the team band's face), `along` metres from the stand's middle; the ball drops on the ground in front. */
function backWall(id:StandDef['id'],along:number):Target{const s=stand(id),d=standBack(s)+.06,w=standWorld(s,d,along),p=standWorld(s,d+TARGET_DROP,along);
 return {x:r2(p.x),y:0,z:r2(p.z),wall:{x:r2(w.x),y:BACK_TARGET_Y,z:r2(w.z),high:true,round:true,facing:facingOf(s)}};}
/** A round high target on a gate pillar's plaza (east) face: side -1 the north pillar, +1 the south one. */
function pillar(side:-1|1):Target{const x=GATE_ARCH_X+PILLAR_HALF,z=STADIUM_GATE.z+side*(PILLAR_Z+PILLAR_TARGET_OUT);
 return {x:r2(x+TARGET_DROP),y:0,z:r2(z),wall:{x:r2(x),y:PILLAR_TARGET_Y,z:r2(z),high:true,round:true,facing:'east'}};}
/** The big screen's east post, on its south face (the side the park sees, with the screen's back picture above): shot at from the
 *  ground behind the south stand, the ball drops there. (Not from the concourse: the stands are solid to a kicked ball, so a
 *  kick on a stand never leaves the foot.) */
function screenTarget(side:-1|1):Target{const x=STADIUM.x+side*SCREEN_POST_X,z=STADIUM.z+SCREEN.z+SCREEN_POST_R;
 return {x:r2(x),y:0,z:r2(z+TARGET_DROP),wall:{x:r2(x),y:SCREEN_TARGET_Y,z:r2(z),high:true,round:true,facing:'south'}};}
/** Nov 13 2026 (owner: "a second hidden ball target on the left screen post"): the west post's twin of the east one, at the same
 *  height and facing. Seen from the viewing area (looking north at the screen's back face) the west post is on the left. */
const SCREEN_TARGET=screenTarget(1),SCREEN_WEST_TARGET=screenTarget(-1);
/** On the seat right beside aisle `aisle` (its centre, stand-local metres) on its `side` (-1 / +1 along), in row `row`: the seat
 *  the crowd always leaves free (stadiumCrowd.ts), with fans beside and behind it. The ball rests on the seat pad. */
export function crowdSeat(id:StandDef['id'],aisle:number,side:-1|1,row:number){const s=stand(id);
 const span=standSpans(s).seats.find(([a0,a1])=>Math.abs((side>0?a0:a1)-(aisle+side*AISLE_WIDTH/2))<.01)!,{n,start}=spanSeats(span[0],span[1]);
 const along=side>0?start:start+(n-1)*SEAT_PITCH,p=standWorld(s,s.inner+row*ROW_DEPTH+SEAT_DEPTH-.04,along);
 return {x:r2(p.x),y:r2(rowHeight(row)+SEAT_TOP),z:r2(p.z)};}
/** On a long stand's roof, half-way between its front and back edges, `along` metres from the halfway line. */
function roof(id:'west'|'east',along:number){const s=stand(id),p=standWorld(s,(ROOF.front+ROOF.back)/2,along);return {x:r2(p.x),y:STADIUM_ROOF_TOP,z:r2(p.z)};}

const kick='A football target! Back away and hold Kick for a high shot.',seat='A ball is resting on a seat among the fans. Step into the row to pick it up!';
const T={kind:'kick' as const,stadium:true},C={kind:'hidden' as const,loose:true,stadium:true};
export const STADIUM_BALL_SPOTS:CoinSpot[]=[
 {id:'stadium-gate',name:'DRIP FC Stadium · north gate pillar',...pillar(-1),...T,concept:'world-stewards',near:kick,
  clue:'Look up at the gold gate pillars of DRIP FC Stadium. The people who look after fans wait here on matchday.',
  detail:'Stand on the plaza, east of the gate, and face the north gold pillar. Find the round target on its east face, hold Kick for a high shot, then collect the ball below it.',
  teaching:'Find a steward if you need help. Stewards in bright jackets stand at every gate and stairway. They keep the exits clear, help fans find their seats and look after anyone who is lost.',lesson:'support'},
 {id:'stadium-plaza-flags',name:'DRIP FC Stadium · south gate pillar',...pillar(1),...T,concept:'world-walk-out',near:kick,
  clue:'The teams walk out through a big entrance side by side. Look up at the other gold pillar of the DRIP FC gate.',
  detail:'Stand on the plaza, east of the gate, and face the south gold pillar. Find the round target on its east face, hold Kick for a high shot, then collect the ball below it.',
  teaching:'Walk out together, line up and shake hands. Before a big match both teams walk onto the pitch side by side, stand in a line for the anthems, then shake hands to show respect.',lesson:'support'},
 {id:'stadium-plaza-street',name:'DRIP FC Stadium · east stand back wall',...backWall('east',-44),...T,concept:'law7-added-time',near:kick,
  clue:'Late fans rush round the outside of the east stand, worried they have missed the end. A target waits on its back wall.',
  detail:'From the gate, walk north along the outside of the east stand to its far end. Face the stand’s red back wall, find the round target on its east face and hold Kick for a high shot.',
  teaching:'Added time makes up for lost time. When play stops for injuries, goals or substitutes, the referee adds that time on at the end of the half. A board shows the extra minutes.',lesson:'support'},
 {id:'stadium-lawn',name:'DRIP FC Stadium · north stand back wall',...backWall('north',-4),...T,concept:'world-pitch-stripes',near:kick,
  clue:'Behind the north stand, the park’s groundstaff mow the grass in stripes. Look for a target on the stand’s back wall.',
  detail:'Walk round the outside of the stadium to the north stand. Face its yellow back wall, find the round target near the middle, a little west of it, and hold Kick for a high shot.',
  teaching:'Pitch stripes come from the mower. Groundstaff mow one strip going up the pitch and the next coming back. The grass leans different ways, so some stripes look pale and some look dark.',lesson:'support'},
 {id:'stadium-pond',name:'DRIP FC Stadium · west stand back wall, halfway',...backWall('west',4),...T,concept:'law8-centre-circle',near:kick,
  clue:'Behind the west stand, level with the halfway line and its centre circle, a target hides on the back wall.',
  detail:'Walk round to the outside of the west stand. Face its blue back wall near the middle, a little south of the halfway line, find the round target and hold Kick for a high shot.',
  teaching:'Stay out of the circle at kick-off. The centre circle reaches 9.15 metres from the centre spot. At kick-off, the other team waits outside it until the ball is kicked and moves.',lesson:'support'},
 {id:'stadium-orchard',name:'DRIP FC Stadium · west stand back wall, south corner',...backWall('west',44),...T,concept:'law17-corner-arc',near:kick,
  clue:'Near the stadium’s south-west corner, by the orchard, the west stand ends. A target waits near its corner.',
  detail:'Walk round to the outside of the west stand and go to its south end, near the orchard. Face the blue back wall, find the round target and hold Kick for a high shot.',
  teaching:'Put the ball in the corner arc. For a corner kick, the ball sits inside the little quarter-circle by the corner flag. The flag stays where it is: never pull it out to make room.',lesson:'support'},
 {id:'stadium-west-roof',name:'DRIP FC Stadium · west stand roof',...roof('west',20),kind:'hidden',loose:true,stadium:true,concept:'law1-goal-line-tech',near:'A ball is resting on the roof. Walk over to pick it up!',
  clue:'High above the west stand, on the roof itself, something watches the goal lines.',
  detail:'Fly up over the west stand with your jetpack and land on its flat roof. The ball rests on the roof, a little south of the middle.',
  teaching:'Goal-line technology sees what eyes can’t. Cameras high in the stadium watch the goal line. When the whole ball crosses it, the referee’s watch buzzes “GOAL” within a second.',lesson:'movement'},
 {id:'stadium-east-roof',name:'DRIP FC Stadium · east stand roof',...roof('east',-30),kind:'hidden',loose:true,stadium:true,concept:'world-floodlights',near:'A ball is resting on the roof. Walk over to pick it up!',
  clue:'Up on the east stand’s roof, high enough to light the whole pitch at night.',
  detail:'Fly up over the east stand with your jetpack and land on its flat roof. The ball rests on the roof, north of the gate.',
  teaching:'Floodlights turn night into day. Bright lamps on tall masts and roofs light the pitch from every side, so players see the ball, shadows stay small and fans can enjoy night matches.',lesson:'movement'},
 {id:'stadium-west-stand',name:'DRIP FC Stadium · west stand seat',...crowdSeat('west',13,1,1),...C,concept:'world-all-seater',near:seat,
  clue:'The west stand has thousands of numbered seats, and one of them is holding a ball instead of a fan.',
  detail:'Walk into the stadium and climb the west stand’s aisle just south of the halfway line. In the second row, the seat right beside the aisle has a ball on it.',
  teaching:'Every fan has a seat. Many big stadiums are all-seater: instead of crowded standing terraces, each fan has their own numbered seat, so the crowd is spread out and safer.',lesson:'support'},
 {id:'stadium-east-stand',name:'DRIP FC Stadium · east stand seat',...crowdSeat('east',-39,1,1),...C,concept:'rules-technical-area',near:seat,
  clue:'Near the front of the east stand, a ball sits among the fans, watching the coaches on the touchline.',
  detail:'Walk into the stadium and climb the east stand’s northern aisle. In the second row, look at the seat beside the aisle on its south side.',
  teaching:'Coaches stay in the technical area. Each team bench has a marked box beside the pitch. The coach stays inside it, and only one person at a time may stand and call out instructions.',lesson:'support'},
 {id:'stadium-north-stand',name:'DRIP FC Stadium · north stand seat',...crowdSeat('north',0,-1,5),...C,concept:'law4-kit-colours',near:seat,
  clue:'The north stand is yellow and blue, behind one goal. Fans in every colour sit there, and one seat holds a ball.',
  detail:'Walk into the stadium and climb the north stand’s middle aisle to the sixth row. The ball is on the seat beside the aisle, on its west side.',
  teaching:'Away kits stop a colour clash. Both teams must wear colours that are easy to tell apart, and different from the referee’s. If both teams play in red, the away team usually changes kit.',lesson:'support'},
 {id:'stadium-screen',name:'DRIP FC Stadium · big screen post',...SCREEN_TARGET,...T,concept:'law6-var-review',near:kick,
  clue:'The big screen at the south end shows replays. A target hides on one of the posts that hold it up.',
  detail:'Walk round the outside of the stadium to the south end, behind the south stand. Find the round target on the big screen’s east post, back away to the south and hold Kick for a high shot.',
  teaching:'VAR checks the big moments. A video assistant referee watches replays of goals, penalties, straight red cards and mistaken identity. The referee can look at a screen, then decides.',lesson:'support'},
 // Nov 13 2026 (owner): the 129th ball, on the screen's west (left) post. Appended last, so saved ids keep their order.
 {id:'stadium-screen-west',name:'DRIP FC Stadium · big screen west post',...SCREEN_WEST_TARGET,...T,concept:'world-match-clock',near:kick,
  clue:'The big screen has two posts. The other one hides a target too, under the score and the clock that every fan checks.',
  detail:'Walk round the outside of the stadium to the south end, behind the south stand. Find the round target on the big screen’s west post, on the left as you face the screen, back away to the south and hold Kick for a high shot.',
  teaching:'The scoreboard tells everyone the story. It shows both teams, the score and the match clock, which counts up from 0 to 45 minutes in the first half and from 45 to 90 in the second.',lesson:'support'},
];
export const STADIUM_BALL_IDS=STADIUM_BALL_SPOTS.map(s=>s.id);
