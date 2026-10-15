/**
 * A ball kicked into Rosa's fish stall (user Oct 15 2026: "add animation when kicking the ball against the fish stall").
 * The wobble itself is the 'stall' row in lib/graphics/propReactions.ts (the stall is baked into the merged island chunks;
 * lib/town/farmersMarket.ts tags it); the cue is the 'stall' case in lib/audio/islandSound.ts; components/Town.tsx adds a few
 * water droplets from the ball-effects ring pool and this one line. Pure, so tests can drive it.
 *
 * The first hit on a device shows the shooting lesson (the forage note's tip style, like the Summit tree kick); after that,
 * Rosa says one friendly line now and then (at most every ROSA_LINE_GAP_S), never on every kick.
 */
export const STALL_KICK_LESSON='Pick your spot: aim for a corner of the target, not the middle. Corners are the hardest to save.';
export const STALL_KICK_LESSON_KEY='fi2-stall-kick-lesson-v1';
export const ROSA_LINES=['Rosa: Whoa! Mind my fish!','Rosa: Great power! Save it for the goal.','Rosa: Ha! The fish felt that one.','Rosa: Careful, the ice is slippery!'] as const;
export const ROSA_LINE_GAP_S=20;

export type StallNotePorts={seen:()=>boolean;mark:()=>void};
/** What to say for a stall hit at `now` (seconds): the lesson once per device, else a Rosa line if the last line was long
 *  enough ago, else nothing. `state.last` is the time of the last line (-Infinity at start); `state.n` picks the next line. */
export function stallKickNote(now:number,state:{last:number;n:number},ports:StallNotePorts):{text:string;tip:boolean}|null{
 if(!ports.seen()){ports.mark();state.last=now;return {text:STALL_KICK_LESSON,tip:true};}
 if(now-state.last<ROSA_LINE_GAP_S)return null;
 state.last=now;const text=ROSA_LINES[state.n++%ROSA_LINES.length];return {text,tip:false};
}
/** localStorage ports (private mode: the lesson may show again next visit). */
export const stallLessonStorage:StallNotePorts={
 seen:()=>{try{return localStorage.getItem(STALL_KICK_LESSON_KEY)==='1';}catch{return true;}},
 mark:()=>{try{localStorage.setItem(STALL_KICK_LESSON_KEY,'1');}catch{/* private mode */}},
};
