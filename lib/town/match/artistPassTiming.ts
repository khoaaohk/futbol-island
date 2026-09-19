export const PASS_CONTACT_PHASE=.36;
export const passKickDuration=(duration:number)=>Math.min(.5,Math.max(.12,duration*.6));
export const passContactTime=(duration:number)=>PASS_CONTACT_PHASE*passKickDuration(duration);
export function artistBallContact(x:number,z:number,heading:number,foot=1,pull=0){return {x:x+Math.sin(heading)*(.66-pull)-Math.cos(heading)*.12*foot,z:z+Math.cos(heading)*(.66-pull)+Math.sin(heading)*.12*foot};}
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
export const smooth=(v:number)=>{v=clamp(v);return v*v*(3-2*v);};
export function plantWeight(progress:number){return smooth(progress/.12)*(1-smooth((progress-.72)/.28));}
export function strikeWeight(progress:number){return smooth((progress-.16)/.20)*(1-smooth((progress-.36)/.18));}
