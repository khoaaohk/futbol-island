/**
 * DRIP FC Stadium ball hunt (Nov 13 2026; owner: "extend the island ball hunt into the new stadium area"). Twelve loose balls take
 * the hunt from 116 to 128: two on the plaza, one by the gate, three in the park (a lawn, the lily pond's south shore, the
 * south-west orchard), one on each long stand's roof (fly up and land), one in an aisle of the west, east and north stands (walk up
 * the aisle stairs) and one on the south concourse under the big screen. Every spot is derived from the stadium's own anchors
 * (stadiumSeats.ts STANDS / ROOF / SCREEN, westParkLayout.ts STADIUM / STADIUM_GATE / STADIUM_PLAZA / PARK_POND / PARK_LAWNS), so a
 * reshaped stand moves its ball with it; tests/stadium-balls.cjs re-checks every one against the town the game really builds:
 * on a walk or landing surface, reached by a walk from the plaza (or a landing from the sky), never in a seat, clear of props.
 *
 * Lessons: twelve stadium ideas no other ball (island or reef) teaches (tests/stadium-balls.cjs); sources in ballHuntSources.ts,
 * never in kid UI. All loose (no parcel, no collider: the coin hunt's one ball mesh each, like Summit Isle's huts and caves).
 *
 * Pure data (no three.js): the island imports it through coinQuest.ts, like every other ball.
 */
import type {CoinSpot} from './coinQuest';
import {STADIUM,STADIUM_GATE,STADIUM_PLAZA,PARK_POND,PARK_LAWNS} from './westParkLayout';
import {STANDS,ROOF,ROW_DEPTH,CONCOURSE_HEIGHT,rowHeight,standBack,standWorld,type StandDef} from './stadiumSeats';

const r2=(n:number)=>Math.round(n*100)/100;
const stand=(id:StandDef['id'])=>STANDS.find(s=>s.id===id)!;
/** The roofs' walkable top (the slab's upper face, where a landing puts the feet). */
export const STADIUM_ROOF_TOP=ROOF.y+ROOF.thick/2;
/** On an aisle's upper tread of row `row` (the back half of the row, at the row's own height), at aisle `aisle` of the stand. */
function aisle(id:StandDef['id'],aisleIndex:number,row:number){const s=stand(id),p=standWorld(s,s.inner+row*ROW_DEPTH+ROW_DEPTH*.75,s.aisles[aisleIndex]);return {x:r2(p.x),y:rowHeight(row),z:r2(p.z)};}
/** On a long stand's roof, half-way between its front and back edges, `along` metres from the halfway line. */
function roof(id:'west'|'east',along:number){const s=stand(id),p=standWorld(s,(ROOF.front+ROOF.back)/2,along);return {x:r2(p.x),y:STADIUM_ROOF_TOP,z:r2(p.z)};}
const SOUTH=stand('south');
/** The south concourse's middle, right under the big screen (it hangs just behind the concourse's back rail). */
const SCREEN_SPOT=(()=>{const p=standWorld(SOUTH,standBack(SOUTH)-1.5,0);return {x:r2(p.x),y:CONCOURSE_HEIGHT,z:r2(p.z)};})();
/** Beside the gate arch, on the plaza paving, a few steps north of the walk through the gate. */
const GATE_SPOT={x:STADIUM_PLAZA.minX+2,y:0,z:STADIUM_GATE.z-11};
const PLAZA_PLAN=(dx:number,dz:number)=>({x:STADIUM_PLAZA.minX+dx,y:0,z:STADIUM_PLAZA.minZ+dz});
const LAWN=PARK_LAWNS[1];
/** Off-path spots in the park: the north-east lawn's middle, the lily pond's south shore, the south-west orchard's west edge. */
const LAWN_SPOT={x:LAWN.x,y:0,z:LAWN.z},POND_SPOT={x:PARK_POND.x-10,y:0,z:PARK_POND.z+28},ORCHARD_SPOT={x:STADIUM.x+10,y:0,z:88};

const near='A ball is resting here. Walk over to pick it up!';
export const STADIUM_BALL_SPOTS:CoinSpot[]=[
 {id:'stadium-gate',name:'DRIP FC Stadium · by the gate',...GATE_SPOT,kind:'hidden',loose:true,stadium:true,concept:'world-stewards',near:'A ball is resting by the stadium gate. Walk over to pick it up!',
  clue:'Stand by the DRIP FC Stadium gate. The people who look after fans wait here on matchday.',
  detail:'Walk across the plaza to the big gate in the east stand. The ball rests on the paving just north of the gate arch.',
  teaching:'Find a steward if you need help. Stewards in bright jackets stand at every gate and stairway. They keep the exits clear, help fans find their seats and look after anyone who is lost.',lesson:'support'},
 {id:'stadium-plaza-flags',name:'Stadium Plaza · by the flags',...PLAZA_PLAN(40,8),kind:'hidden',loose:true,stadium:true,concept:'world-walk-out',near,
  clue:'Walk the Stadium Plaza where the flags of many countries fly. Teams line up like these flags before a big match.',
  detail:'On the plaza, look along the north row of flag poles, about half-way between the gate and the street. The ball rests on the paving.',
  teaching:'Walk out together, line up and shake hands. Before a big match both teams walk onto the pitch side by side, stand in a line for the anthems, then shake hands to show respect.',lesson:'support'},
 {id:'stadium-plaza-street',name:'Stadium Plaza · street end',...PLAZA_PLAN(70,34),kind:'hidden',loose:true,stadium:true,concept:'law7-added-time',near,
  clue:'The Stadium Plaza’s street end, near the PLAZA sign. Late fans rush in here, worried they have missed the end.',
  detail:'Go to the east end of the plaza, near the street. The ball rests on the paving on the south side, between a bench and a planter.',
  teaching:'Added time makes up for lost time. When play stops for injuries, goals or substitutes, the referee adds that time on at the end of the half. A board shows the extra minutes.',lesson:'support'},
 {id:'stadium-lawn',name:'Stadium Park · north lawn',...LAWN_SPOT,kind:'hidden',loose:true,stadium:true,concept:'world-pitch-stripes',near,
  clue:'North of the plaza, the park has a wide mown lawn. Groundstaff would love it.',
  detail:'Take the trail north from the plaza and step off it onto the big oval lawn on your left. The ball rests in the middle of the grass.',
  teaching:'Pitch stripes come from the mower. Groundstaff mow one strip going up the pitch and the next coming back. The grass leans different ways, so some stripes look pale and some look dark.',lesson:'support'},
 {id:'stadium-pond',name:'Stadium Park · lily pond shore',...POND_SPOT,kind:'hidden',loose:true,stadium:true,concept:'law8-centre-circle',near,
  clue:'The lily pond in Stadium Park is round, like a circle on a pitch. Look on its far shore.',
  detail:'Walk round the lily pond to its south shore, on the grass between the water and the beach. The ball rests on the lawn, not in the water.',
  teaching:'Stay out of the circle at kick-off. The centre circle reaches 9.15 metres from the centre spot. At kick-off, the other team waits outside it until the ball is kicked and moves.',lesson:'support'},
 {id:'stadium-orchard',name:'Stadium Park · south-west orchard',...ORCHARD_SPOT,kind:'hidden',loose:true,stadium:true,concept:'law17-corner-arc',near,
  clue:'Behind the stadium’s south end grows an orchard of mango and guava trees. A ball sits at its corner.',
  detail:'Leave the ring path at the stadium’s south-west corner and walk into the orchard. The ball rests on the grass at the orchard’s west edge.',
  teaching:'Put the ball in the corner arc. For a corner kick, the ball sits inside the little quarter-circle by the corner flag. The flag stays where it is: never pull it out to make room.',lesson:'support'},
 {id:'stadium-west-roof',name:'DRIP FC Stadium · west stand roof',...roof('west',20),kind:'hidden',loose:true,stadium:true,concept:'law1-goal-line-tech',near:'A ball is resting on the roof. Walk over to pick it up!',
  clue:'High above the west stand, on the roof itself, something watches the goal lines.',
  detail:'Fly up over the west stand with your jetpack and land on its flat roof. The ball rests on the roof, a little south of the middle.',
  teaching:'Goal-line technology sees what eyes can’t. Cameras high in the stadium watch the goal line. When the whole ball crosses it, the referee’s watch buzzes “GOAL” within a second.',lesson:'movement'},
 {id:'stadium-east-roof',name:'DRIP FC Stadium · east stand roof',...roof('east',-30),kind:'hidden',loose:true,stadium:true,concept:'world-floodlights',near:'A ball is resting on the roof. Walk over to pick it up!',
  clue:'Up on the east stand’s roof, high enough to light the whole pitch at night.',
  detail:'Fly up over the east stand with your jetpack and land on its flat roof. The ball rests on the roof, north of the gate.',
  teaching:'Floodlights turn night into day. Bright lamps on tall masts and roofs light the pitch from every side, so players see the ball, shadows stay small and fans can enjoy night matches.',lesson:'movement'},
 {id:'stadium-west-stand',name:'DRIP FC Stadium · west stand aisle',...aisle('west',1,6),kind:'hidden',loose:true,stadium:true,concept:'world-all-seater',near,
  clue:'Inside the stadium, the west stand has thousands of numbered seats. A ball is waiting in one of its aisles.',
  detail:'Walk into the stadium and climb an aisle of the west stand. The ball rests on the aisle steps, about half-way up, north of the halfway line.',
  teaching:'Every fan has a seat. Many big stadiums are all-seater: instead of crowded standing terraces, each fan has their own numbered seat, so the crowd is spread out and safer.',lesson:'support'},
 {id:'stadium-east-stand',name:'DRIP FC Stadium · east stand aisle',...aisle('east',3,3),kind:'hidden',loose:true,stadium:true,concept:'rules-technical-area',near,
  clue:'In the east stand, near the front, a ball looks down on where the coaches stand.',
  detail:'Walk into the stadium and climb the east stand’s southern aisle. The ball rests on the aisle steps, a few rows up from the pitch.',
  teaching:'Coaches stay in the technical area. Each team bench has a marked box beside the pitch. The coach stays inside it, and only one person at a time may stand and call out instructions.',lesson:'support'},
 {id:'stadium-north-stand',name:'DRIP FC Stadium · north stand aisle',...aisle('north',0,7),kind:'hidden',loose:true,stadium:true,concept:'law4-kit-colours',near,
  clue:'The north stand is yellow and blue, behind one goal. Away fans often sit at the ends.',
  detail:'Walk into the stadium and climb the north stand’s western aisle. The ball rests on the aisle steps, near the top rows.',
  teaching:'Away kits stop a colour clash. Both teams must wear colours that are easy to tell apart, and different from the referee’s. If both teams play in red, the away team usually changes kit.',lesson:'support'},
 {id:'stadium-screen',name:'DRIP FC Stadium · under the big screen',...SCREEN_SPOT,kind:'hidden',loose:true,stadium:true,concept:'law6-var-review',near,
  clue:'The big screen at the south end shows replays. Something waits right under it.',
  detail:'Climb any aisle of the south stand to the walkway at the top. The ball rests in the middle of the walkway, right under the big screen.',
  teaching:'VAR checks the big moments. A video assistant referee watches replays of goals, penalties, straight red cards and mistaken identity. The referee can look at a screen, then decides.',lesson:'support'},
];
export const STADIUM_BALL_IDS=STADIUM_BALL_SPOTS.map(s=>s.id);
