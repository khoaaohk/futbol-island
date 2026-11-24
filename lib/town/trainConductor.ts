/**
 * Conductor Kenji (Gameplay 2, owner Nov 24 2026): an original, friendly conductor who leans out of the cab when someone stands in
 * front of a train that is stopped or held for them. A short quiet toot and a speech bubble from the cab with a rotating playful line
 * (kid-friendly; the football ones double as a nudge about the game: waiting for the whistle, staying onside, keeping your line),
 * a second, more urgent line after KENJI.hurryAt s, and at KENJI.stepOffAt s the line's existing "Please step off the track" slide.
 * A cooldown keeps a player who hops on and off the track from hearing him every few seconds. Remote players only hear the horn.
 * Pure data and timing (no DOM, no three.js): lib/town/trainRunning.ts runs it, Town draws the bubble (chatterBubbles).
 */
import type {NpcDefinition} from './npcDialogues';
export const CONDUCTOR='Conductor Kenji';
/** Seconds into the hold: first toot + line, the hurry line, the step-off slide (trainRunning STEP_OFF_AFTER); quiet seconds after. */
export const KENJI={hurryAt:3,stepOffAt:5,cooldown:15,near:14,bubbleS:3.2} as const;
export const KENJI_LINES:readonly string[]=[
 'Hey there! We\'ve got a schedule to keep!',
 'Beep beep! The 3:10 to Coral Cay can\'t wait!',
 'Even Messi waits for the whistle. Off the track, please!',
 'Nice moves — now please step aside, superstar!',
 'Stay behind the yellow line, like staying onside!',
 'Great first touch! Now take it to the platform, please!',
];
export const KENJI_HURRY:readonly string[]=[
 'Still there? Two quick steps to the side and we\'re off!',
 'Ref\'s looking at his watch! Off the track, please!',
 'Clear the track, captain — your team is waiting!',
];
/** Line n of the rotation (n counts up per hold, so every hold gets the next one). */
export const kenjiLine=(n:number,hurry=false)=>{const a=hurry?KENJI_HURRY:KENJI_LINES;return `${CONDUCTOR}: ${a[((n%a.length)+a.length)%a.length]}`;};

/** Gameplay 4 (owner, Nov 24 2026: "can we see the conductor and talk to him"): Kenji sits at the desk in the leading cab (car 0's
 *  cab, the +z end: the Island Line runs one way round the loop), on the driver's seat (trainCarModel: seat box at x −0.45, z 5.05,
 *  facing +z). Car-local root spot; lib/graphics/trainKenji.ts draws him with the island's own NPC rig; his bubble (above) rises from
 *  over this spot. You talk to him from the aisle at the cab partition (TALK_U m of it). */
export const KENJI_SEAT={x:-.45,z:5.2,talkU:1.5} as const;
const kenjiTopics=(...t:[string,string,string,string][])=>t.map((x,i)=>({id:'k'+i,question:x[0],answer:x[1],followUp:{question:x[2],answer:x[3]}}));
/** Kenji's talk (Town's usual slide-out). Facts, kid-friendly and checked:
 *  - pointing and calling (shisa kanko): Japanese rail staff point at and call out each check; studies credit it with far fewer
 *    mistakes (https://en.wikipedia.org/wiki/Pointing_and_calling). A keeper's "Keeper!" call is the same idea: say what you see.
 *  - Kashima Soccer Stadium Station (Kashima Line) is served mainly on match days (https://en.wikipedia.org/wiki/Kashima_Soccer_Stadium_Station).
 *  - England's "football specials": extra trains that carried away fans to a match (https://en.wikipedia.org/wiki/Football_special).
 *  - A Japanese train crew: the driver up front and the conductor (shashō) who checks the doors and makes announcements. */
export const KENJI_NPC:NpcDefinition={id:'train-kenji',name:CONDUCTOR,role:'Island Line conductor',pursuit:'KEEPING THE ISLAND LINE ON TIME',x:0,z:0,
 character:'male',face:'warm',clothing:'classic',look:{skin:2,hair:'crop',hairColor:'#2b211c',headwear:'cap',headwearColor:'#1d2c4a',top:'#1f3352'},
 persona:'A friendly conductor who points at every signal and knows a train fact for every stop.',
 greeting:'Hello from the cab! I\'m Kenji, the conductor of the Island Line. Want a train fact while we roll?',
 lines:['Signal clear! I point and call it, every time.','Hold on to a strap round the bends!','Doors only close when the platform is clear.'],
 topics:kenjiTopics(
  ['Why do you point at everything?','It\'s called pointing and calling, "shisa kanko" in Japan. I point at each signal and say it out loud, so my eyes, hand and voice all check it. It helps crews make far fewer mistakes.','Do footballers do that?','Yes! A keeper shouts "Keeper!" when coming for the ball, so defenders don\'t crash into each other. Saying what you see helps the whole team.'],
  ['Do fans ride trains to matches?','Lots do! In Japan, Kashima Soccer Stadium Station is served mostly on match days. In England, clubs\' fans once filled "football specials", extra trains just for one match.','Why go by train?','One train carries hundreds of fans at once, so everyone arrives together and the roads stay clear.'],
  ['What does a conductor do?','On many Japanese trains the driver drives up front and the conductor checks the doors, makes the announcements and helps passengers.','Is that like a team?','A bit! Like a captain and a coach, two people with different jobs keep everyone safe and on time.'])};
