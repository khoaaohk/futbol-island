/**
 * Sky keep-up moves (Oct 24 2026, owner: "the character animation must adapt to where the ball comes down and how it's played").
 * Pure, no DOM / three.js (tests/keepup-sky-moves.cjs). When a sky ball is caught (lib/town/walkBall.ts catchSky):
 *  TRAP  — the body part that fits the ball's height over the feet: foot (low), thigh (mid), chest (high); the side the ball is on.
 *  RE-KICK — how it goes back up: instep lift, laces pop-up, knee/thigh flick, header (high, near the head), outside-foot flick,
 *           picked from height / side / streak and never the same one twice in a row.
 * Each phase is short (SKY_MOVE.trap + SKY_MOVE.kick = 0.5 s) so the streak timing stays playable. Football teaching: the first
 * touch (trap) uses the surface that meets the ball, then the touch back up is chosen for where the ball sits.
 */
export const SKY_TRAPS=['foot','thigh','chest'] as const;
export const SKY_KICKS=['instep','laces','knee','header','outside'] as const;
export type SkyTrap=typeof SKY_TRAPS[number];export type SkyKick=typeof SKY_KICKS[number];
/** Seconds: the trap (cushion), then the re-kick. Heights (m over the feet) for the trap bands and the header. */
export const SKY_MOVE={trap:.25,kick:.25,thighFrom:.55,chestFrom:1.05,headerFrom:1.45} as const;
export function pickSkyTrap(height:number):number{return height>=SKY_MOVE.chestFrom?2:height>=SKY_MOVE.thighFrom?1:0;}
// Candidate re-kicks per band (indices into SKY_KICKS), most fitting first; the streak cycles through them.
const LOW=[0,1,4] as const,MID=[2,1,0,4] as const,HIGH=[3,2,1] as const;
/** The re-kick for a catch at `height`, on `side` (−1 left / 1 right of the facing), at count `streak`; never `prev` again. */
export function pickSkyKick(height:number,side:number,streak:number,prev:number):number{
 const list=height>=SKY_MOVE.headerFrom?HIGH:height>=SKY_MOVE.thighFrom?MID:LOW,n=list.length;
 // The side shifts the cycle (a ball on the left starts one further on), so left/right catches vary too.
 let i=((Math.floor(Math.abs(streak))+(side<0?1:0))%n+n)%n;if(list[i]===prev)i=(i+1)%n;return list[i];
}
/** The routine touch the ball leaves from for a re-kick (walkBall's JUGGLE_ROUTINE kinds), so the ball path matches the body part. */
export const skyKickTouch=(kick:number)=>kick===2?'knee':kick===3?'head':'foot';
/** Pose weights for the player rig at `age` s after the catch: trap 0…1…0 over the trap, then kick 0…1…0. No allocation. */
export function skyMoveWeights(age:number,out:{trap:number;kick:number}){
 const t=age/SKY_MOVE.trap,k=(age-SKY_MOVE.trap)/SKY_MOVE.kick;
 out.trap=t>=0&&t<1?Math.sin(t*Math.PI):0;out.kick=k>=0&&k<1?Math.sin(k*Math.PI):0;return out;
}
