/**
 * Conductor Kenji (Gameplay 2, owner Nov 24 2026): an original, friendly conductor who leans out of the cab when someone stands in
 * front of a train that is stopped or held for them. A short quiet toot and a speech bubble from the cab with a rotating playful line
 * (kid-friendly; the football ones double as a nudge about the game: waiting for the whistle, staying onside, keeping your line),
 * a second, more urgent line after KENJI.hurryAt s, and at KENJI.stepOffAt s the line's existing "Please step off the track" slide.
 * A cooldown keeps a player who hops on and off the track from hearing him every few seconds. Remote players only hear the horn.
 * Pure data and timing (no DOM, no three.js): lib/town/trainRunning.ts runs it, Town draws the bubble (chatterBubbles).
 */
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
