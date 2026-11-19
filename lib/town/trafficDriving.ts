// How street traffic drives (Nov 18 2026, owner: "improving the cars and trucks movements ... make it smarter"). Pure scalar
// helpers for lib/graphics/streetTraffic.ts: every vehicle has one speed, and each thing ahead of it (a red light, a junction
// someone else holds, a car, a person, a corner) is turned into "the fastest I may go now and still deal with that comfortably".
// The lowest of those is the limit; the speed eases toward it. No vectors, no allocation, a handful of multiplies per vehicle.
export const DRIVE={
 /** Pulling away, m/s²: gentle. */accel:2.4,
 /** The braking a driver plans for, m/s²: every stop is approached along this curve. */brake:4.2,
 /** The hardest braking the speed may ever show, m/s² (something appeared close ahead). */hardBrake:12,
 /** Bumper-to-bumper gap kept behind a stopped vehicle, m. */gap:1.5,
 /** Room left in front of a person, m (from the bumper). */personGap:2.2,
 /** Speed through a right-angle turn, m/s. */turn:3.2,
 /** Speed through a U-turn at a dead end, m/s. */uTurn:2.2,
 /** A driver held by a townsperson standing in the lane for this long (s) edges past instead of jamming the town. */patience:8,
} as const;
/** The fastest speed from which a stop (or a slow-down to `exit` m/s) within `gap` metres is comfortable. */
export const stopSpeed=(gap:number,exit=0,brake:number=DRIVE.brake)=>gap<=0?exit:Math.sqrt(exit*exit+2*brake*gap);
/** Ease the speed toward the limit: gentle up, bounded down. */
export function stepSpeed(speed:number,limit:number,dt:number){
 if(limit<speed){const next=speed-DRIVE.hardBrake*dt;return next<limit?limit:next;}
 const next=speed+DRIVE.accel*dt;return next>limit?limit:next;
}
/** Speed through a bend of `angle` radians: full speed straight on, DRIVE.turn at 90°, DRIVE.uTurn turning right round. */
export function turnSpeed(cruise:number,angle:number){
 const a=Math.abs(angle)/(Math.PI/2);
 if(a<=.08)return cruise;
 const slow=a<=1?cruise+(DRIVE.turn-cruise)*a:DRIVE.turn+(DRIVE.uTurn-DRIVE.turn)*Math.min(1,a-1);
 return slow<cruise?slow:cruise;
}
/** How far ahead of the bumper a person is allowed before the car must be stopped: the stopping point for stopSpeed. */
export const personStopGap=(ahead:number,halfLength:number)=>ahead-halfLength-DRIVE.personGap;
/** Is a person in, or about to step into, the lane ahead? `ahead`/`lateral` are in the car's frame (m), `vLateral` the person's
 *  speed toward the lane centre (m/s, positive = closing). Someone standing on the kerb is not in the lane. */
export function personInLane(ahead:number,lateral:number,vLateral:number,reach:number,halfWidth:number){
 if(ahead<-.5||ahead>reach)return false;
 if(lateral<halfWidth)return true;
 return vLateral>.4&&lateral-vLateral*1.2<halfWidth&&lateral<halfWidth+4;
}
