/** Island Strikers full-time coaching copy (pure, tested in tests/striker-feedback.cjs). */
/** One coaching line at full time, from how the player passed (scan habit) and finished. */
export function scanTakeaway(v:{safe:number;risky:number;clean:number;gold:number;passes:number;tried?:number;done?:number}){
 const total=v.safe+v.risky,of=(n:number)=>n===total?(total===1?'your pass':`all ${total} of your passes`):`${n} of your ${total} passes`;
 if(total===0)return 'You kept the ball yourself. Look up before you dribble: a cyan ring means a teammate is free.';
 if(v.risky>v.safe&&v.tried&&v.done===v.tried)return `${v.tried===1?'Your pass':'Your passes'} got there, but through a blocked lane. Next time look first and pick the cyan ring.`;
 if(v.risky>v.safe)return `${of(v.risky).replace(/^./,c=>c.toUpperCase())} went into a blocked lane. Look over your shoulder before the ball arrives, then pick the cyan ring.`;
 if(v.gold>0&&v.clean>0)return `Good scanning: ${of(v.safe)} went into open lanes, and ${v.clean} clean ${v.clean===1?'strike':'strikes'}. Control beats power.`;
 if(v.passes<4)return 'Your passes went into open lanes. Now play more of them: every pass pulls a defender out of shape.';
 return `Good scanning: ${of(v.safe)} went into open lanes. Keep looking before you receive.`;}
/** Full-time pass stat in plain words: "3 of 5" or "0". */
export const passLine=(done:number,tried:number)=>tried?`${done}/${tried}`:'0';
