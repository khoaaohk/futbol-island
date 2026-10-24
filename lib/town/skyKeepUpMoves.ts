/**
 * Sky keep-up moves (Oct 24 2026, owner: "the character animation must adapt to where the ball comes down and how it's played";
 * then: "when the player is HOLDING or pressing as the ball arrives … NO soft trap: kicks it back up right away in one motion …
 * if the player is NOT holding/pressing … do a trap with chest, thigh or foot"). Pure, no DOM / three.js (tests/keepup-sky-moves.cjs).
 * When a sky ball arrives at the player (lib/town/walkBall.ts catchSky / trapSky):
 *  RE-KICK (pressed / held) — straight back up in one motion, ALWAYS with the foot (owner: "HIGH KICKS ARE REAL KICKS … FOOT"):
 *           instep lift, laces pop-up, outside-foot flick, toe-poke pop, on the left or right foot by the ball's side, picked
 *           from height / side / streak and never the same one twice in a row. No trap pose, no thigh / knee / chest / header.
 *           The ball leaves from that foot's contact point (skyKickContact), the spot the rig's pose for it reaches.
 *  TRAP (no press) — the body part that fits the ball's height over the feet: foot (low), thigh (mid), chest (high), on the side
 *           the ball is on; the ball settles at the feet and the next press kicks it up again (the count goes on).
 * Football teaching: a first touch that cushions the ball uses the surface that meets it (chest, thigh, foot); a high kick is
 * a foot volley — instep for height and control, laces for power, the outside of the foot, a toe-poke when it is very low.
 */
export const SKY_TRAPS=['foot','thigh','chest'] as const;
export const SKY_KICKS=['instep','laces','outside','toe'] as const;
export type SkyTrap=typeof SKY_TRAPS[number];export type SkyKick=typeof SKY_KICKS[number];
/** Seconds: the trap (cushion, un-pressed arrival only) and the re-kick follow-through. Heights (m over the feet) for the bands. */
export const SKY_MOVE={trap:.35,kick:.3,thighFrom:.55,chestFrom:1.05,lowKick:.4} as const;
export function pickSkyTrap(height:number):number{return height>=SKY_MOVE.chestFrom?2:height>=SKY_MOVE.thighFrom?1:0;}
// Candidate re-kicks per band (indices into SKY_KICKS), most fitting first; the streak cycles through them.
const LOW=[3,1,0,2] as const,MID=[0,2,1,3] as const;
/** The re-kick for a catch at `height`, on `side` (−1 left / 1 right of the facing), at count `streak`; never `prev` again. */
export function pickSkyKick(height:number,side:number,streak:number,prev:number):number{
 const list=height>=SKY_MOVE.lowKick?MID:LOW,n=list.length;
 // The side shifts the cycle (a ball on the left starts one further on), so left/right catches vary too.
 let i=((Math.floor(Math.abs(streak))+(side<0?1:0))%n+n)%n;if(list[i]===prev)i=(i+1)%n;return list[i];
}
/** The routine touch a re-kick maps to (walkBall's JUGGLE_ROUTINE kinds): always the foot. */
export const skyKickTouch=(_kick:number)=>'foot' as const;
/** Where the ball sits on the kicking boot for each kick (player-local m: x right, y up from the feet, z forward), matching the
 *  rig poses in lib/graphics/player.ts (hip at side·0.108; instep = the juggle foot contact). Writes `out`, no allocation. */
export function skyKickContact(kick:number,side:number,out:{x:number;y:number;z:number}){
 const s=side<0?-1:1;
 if(kick===1){out.x=s*.108;out.y=.4;out.z=.6;}else if(kick===2){out.x=s*.41;out.y=.42;out.z=.36;}else if(kick===3){out.x=s*.108;out.y=.32;out.z=.58;}else{out.x=s*.108;out.y=.48;out.z=.45;}
 return out;
}
/** Pose weights for the player rig at `age` s after the arrival. `trapped` (an un-pressed arrival): the trap 0…1…0 over
 *  SKY_MOVE.trap, no kick. Otherwise the immediate re-kick: already up at contact (the ball leaves at age 0), easing down over
 *  SKY_MOVE.kick, no trap. No allocation. */
export function skyMoveWeights(age:number,out:{trap:number;kick:number},trapped=false){
 if(trapped){const t=age/SKY_MOVE.trap;out.trap=t>=0&&t<1?Math.sin(t*Math.PI):0;out.kick=0;return out;}
 const k=age/SKY_MOVE.kick;out.trap=0;out.kick=k>=0&&k<1?Math.sin(Math.PI*(.4+.6*k)):0;return out;
}
