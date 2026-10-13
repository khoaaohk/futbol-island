/**
 * var-2018 · the VAR shift scoring (Oct 10 2026 play pass). Pure maths, no DOM, so tests/museum-exp-var-2018.cjs runs it in Node.
 * Each replay: freeze it as close to the deepest frame as you can (FREEZE_MAX, minus FREEZE_STEP per frame off), then call it
 * (CALL_PTS when right). Every nudge of a frame after the freeze costs NUDGE (the stadium is waiting); a clip never scores below 0.
 */
export const FREEZE_MAX=50,FREEZE_STEP=10,CALL_PTS=100,NUDGE=5;
export const REPLAY_FPS=12;// a 24 fps clip at half speed
export function freezePoints(framesOff:number){return Math.max(0,FREEZE_MAX-FREEZE_STEP*Math.abs(framesOff));}
export function clipPoints(framesOff:number|null,right:boolean,nudges:number){
 const p=(framesOff==null?0:freezePoints(framesOff))+(right?CALL_PTS:0)-NUDGE*nudges;return Math.max(0,p);}
export const maxShift=(n:number)=>n*(FREEZE_MAX+CALL_PTS);
/** The frame a freeze lands on, from the replay clock (ms) of a clip of `last` frames played at REPLAY_FPS. */
export const frameAt=(ms:number,last:number)=>Math.max(0,Math.min(last,Math.round(ms*REPLAY_FPS/1000)));
export function shiftVerdict(right:number,total:number,avgOff:number|null){
 if(right===total&&avgOff!=null&&avgOff<=1)return 'Sharp eyes and a steady finger. The referee can trust your checks.';
 if(right===total)return 'Every call right. Freeze closer to the deepest frame to score even more.';
 if(right>=total-1)return 'A good shift. A centimetre or two is hard: always look at the close-up.';
 return 'The goal line is tricky! Find the deepest frame, then ask: is ALL of the ball past ALL of the line?';
}
