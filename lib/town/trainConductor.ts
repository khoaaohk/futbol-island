/**
 * Conductor Kenji (Gameplay 2, owner Nov 24 2026): an original, friendly conductor in the cab. Owner, Nov 24 2026: the trains never
 * wait for people on the track (the timetable is shared by every player), so Kenji no longer pleads with someone standing in front
 * of a held train: when his train will reach the LOCAL player within trainRunning WARN_S s he shouts a quick warning (with the horn),
 * once per approach and WARN_COOLDOWN s apart. Kid-friendly; the football ones double as a nudge (scan, keep your head up).
 * Pure data and timing (no DOM, no three.js): lib/town/trainRunning.ts runs it, Town draws the bubble (chatterBubbles).
 */
import type {NpcDefinition} from './npcDialogues';
export const CONDUCTOR='Conductor Kenji';
/** The bubble's seconds; `near` (m) is kept for the cab-talk range checks. */
export const KENJI={near:14,bubbleS:3.2} as const;
/** The warning shouts (owner lines first), rotating per approach. */
export const KENJI_WARN:readonly string[]=[
 'Train coming! Hop off the track!',
 'Beep beep! Coming through!',
 'Heads up! Scan the line — train on its way!',
 'Clear the track, captain — we run on time!',
];
/** Warning n of the rotation (n counts up per warning). */
export const kenjiWarn=(n:number)=>`${CONDUCTOR}: ${KENJI_WARN[((n%KENJI_WARN.length)+KENJI_WARN.length)%KENJI_WARN.length]}`;

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
 *  - Nov 24 2026: most match sprints are short, so acceleration matters (Stølen et al. 2005, "Physiology of soccer"); outfield players
 *    run roughly 10 km a match (same source); the loop is LAP = 360 s (trainSchedule.ts).
 *  - A Japanese train crew: the driver up front and the conductor (shashō) who checks the doors and makes announcements. */
export const KENJI_NPC:NpcDefinition={id:'train-kenji',name:CONDUCTOR,role:'Island Line conductor',pursuit:'KEEPING THE ISLAND LINE ON TIME',x:0,z:0,
 character:'male',face:'warm',clothing:'classic',look:{skin:2,hair:'crop',hairColor:'#2b211c',headwear:'cap',headwearColor:'#1d2c4a',top:'#1f3352'},
 persona:'A friendly conductor who points at every signal and knows a train fact for every stop.',
 greeting:'Hello from the cab! I\'m Kenji, the conductor of the Island Line. Want a football tip while we roll?',
 lines:['Signal clear! I point and call it, every time.','Hold on to a strap round the bends!','Doors only close when the platform is clear.'],
 topics:kenjiTopics(
  ['Why do you point at everything?','It\'s called pointing and calling, "shisa kanko" in Japan. I point at each signal and say it out loud, so my eyes, hand and voice all check it. It helps crews make far fewer mistakes.','Do footballers do that?','Yes! A keeper shouts "Keeper!" when coming for the ball, so defenders don\'t crash into each other. Saying what you see helps the whole team.'],
  ['Do fans ride trains to matches?','Lots do! In Japan, Kashima Soccer Stadium Station is served mostly on match days. In England, clubs\' fans once filled "football specials", extra trains just for one match.','Why go by train?','One train carries hundreds of fans at once, so everyone arrives together and the roads stay clear.'],
  ['Why does the train start so slowly?','A heavy train speeds up gently so nobody falls over. Footballers want the opposite: a quick first step, because most sprints in a match are short.','How do I start faster?','Stay on your toes, lean forward a little and take short, quick steps before longer strides.'],
  ['How long is one loop of the island?','About 6 minutes, then round we go again. Footballers go a long way too: roughly 10 km in a 90-minute match, mixing walks, jogs and sprints.','How do they last so long?','They pace themselves, sip water at every break and rest at half-time.'],
  ['What does a conductor do?','On many Japanese trains the driver drives up front and the conductor checks the doors, makes the announcements and helps passengers.','Is that like a team?','A bit! Like a captain and a coach, two people with different jobs keep everyone safe and on time.'])};
