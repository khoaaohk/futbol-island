import type {NpcDefinition} from './npcDialogues';
import {EAST_PIER_NPC_SPOTS as S} from './eastPier';
/**
 * East Jetty islanders (Sep 29 2026; moved onto the spiral jetty Sep 30): a fisher by the fishing post on the spiral's outer
 * east curve and a kid practising keep-ups on the straight.
 * They use the standard NPC slide-out conversation and the shared townsfolk runtime (drawn, posed and routined only when near
 * and on screen; lib/graphics/islandNpcs.ts). Facts checked Sep 29 2026:
 *  - Bar-Eli et al. (2007), "Action bias among elite soccer goalkeepers: The case of penalty kicks", J. Economic Psychology
 *    28(5): 286 penalty kicks; keepers almost always dive, yet staying in the centre was optimal. Already cited by the fishing
 *    keeper lesson (lib/town/fishing/fishCatalog.ts KEEPER_LESSONS).
 *  - FIFA Training Centre, "Creating chances and finishing (Urias)": "Place shots either side of the goalkeeper to increase the
 *    chances of scoring, which ultimately boosts confidence."
 *    https://www.fifatrainingcentre.com/en/practice/elite-sessions/in-possession/creating-chances-and-finishing.php
 *  - IFAB Laws of the Game, Law 9 (the ball is out when the whole ball crosses the goal line or touchline) and Law 15 (a throw-in
 *    goes to the opponents of the player who last touched the ball; the thrower faces the field, has part of each foot on or
 *    behind the touchline, and throws with both hands from behind and over the head). https://www.theifab.com/laws/latest/
 * Keep-up and ready-stance tips are coaching advice, not rules, and are phrased that way.
 */
export const EAST_PIER_NPCS:NpcDefinition[]=[
 {id:'pier-nell',name:'Nell',role:'Pier fisher',pursuit:'FISHING OFF THE PIER',x:S.fisher.x,z:S.fisher.z,character:'female',face:'deep',clothing:'coast',
  greeting:'Hello! I fish off the spiral at the end of the East Jetty, and I used to keep goal for my town team. Both are about waiting for the right moment. What would you like to know?',topics:[
  {id:'wait',question:'Is fishing like goalkeeping?',answer:'A bit! A nibble is like a striker’s feint. Scientists who studied 286 penalties found keepers nearly always dive, yet staying in the middle would have saved the most. So stay set until the float really goes under.',
   followUp:{question:'How do keepers stay ready?',answer:'Many coaches teach a ready stance: on your toes, knees soft, weight a little forward and eyes on the ball. From there you can push off either way.'}},
  {id:'ring',question:'What is the ring out in the water?',answer:'That is the Jetty Shooting Challenge. Stand on the painted spot on the spiral’s north curve, pick your spot, turn to face it and kick. Land the ball inside the ring and it moves somewhere new.',
   followUp:{question:'Why does the ring keep moving?',answer:'So you practise choosing a target every time. FIFA coaches say placing your shot either side of the goalkeeper gives you a better chance of scoring. Aim first, then strike.'}},
 ]},
 {id:'pier-ollie',name:'Ollie',role:'Keep-ups on the jetty',pursuit:'KEEP-UPS BY THE SEA',x:S.kid.x,z:S.kid.z,character:'male',face:'warm',clothing:'sunset',body:'slim',freestyle:1,workYaw:Math.PI/2,
  greeting:'Twenty-two, twenty-three… oops! I practise keep-ups out here every day. It is windy, so I have to keep the ball close. Want some tips?',topics:[
  {id:'start',question:'How do I start keep-ups?',answer:'Drop the ball, tap it up once with your laces and catch it. When that feels easy, try two touches before the catch. Keep your ankle firm and your toes pointing a little up.',
   followUp:{question:'How do keep-ups help in a match?',answer:'They practise soft touches and balance, so a bouncing pass is easier to control. In a game you usually take one or two touches, then pass or dribble.'}},
  {id:'sea',question:'What if my ball goes in the sea?',answer:'Out here it floats back to you. On a real pitch the ball is only out when the WHOLE ball has crossed the line. Then it is a throw-in, a goal kick or a corner.',
   followUp:{question:'Who takes the throw-in?',answer:'The other team from whoever touched it last. Face the pitch, keep part of both feet on or behind the line, and throw with both hands from behind your head.'}},
 ]},
];
