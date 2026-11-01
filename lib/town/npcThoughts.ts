/**
 * ENGINE STUB (Nov 1 2026): a tiny placeholder book so lib/town/npcChatter.ts builds and tests. The content agent's file REPLACES this one at merge.
 */
import type {NpcThoughtBook} from './npcChatterTypes';
export const THOUGHTS:NpcThoughtBook={
 byNpc:{
  rosa:{near:['Small steps keep the ball close.','Head up! Look before you pass.','Futsal makes quick feet.'],idle:['Cones out, bibs ready.','Who wants to play two-touch?']},
  sam:{near:['One more for pickup? Always!','Pass and move, my friend.','I scored a header today!'],idle:['Need a left winger...','Five-a-side at sunset.']},
 },
 byArea:{
  town:{near:['Nice day for a kickabout.','Mind the ball!'],idle:['I love this town square.']},
 },
 banter:[
  {id:'rosa-sam-pickup',a:'rosa',b:'sam',lines:['Playing pickup again, Sam?','Every day, Coach!','Keep your passes on the ground.','Got it, short and sharp!']},
 ],
};
