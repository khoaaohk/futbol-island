import {artistBallContact,smooth,PASS_CONTACT_PHASE} from './artistPassTiming';
type Point={x:number;y:number};
/** Pick once at reception: keep the intended run unless pressure makes a nearby
 * angle safer. Human input remains authoritative in the caller. */
export function firstTouchDirection(origin:Point,direction:Point,opponents:readonly Point[]){
 const length=Math.hypot(direction.x,direction.y)||1,ux=direction.x/length,uy=direction.y/length;
 let best={x:ux,y:uy},score=-Infinity;
 for(const angle of [0,-.65,.65]){
  const x=ux*Math.cos(angle)-uy*Math.sin(angle),y=ux*Math.sin(angle)+uy*Math.cos(angle);
  let clearance=24;
  for(const foe of opponents)clearance=Math.min(clearance,Math.hypot(origin.x+x*8-foe.x,origin.y+y*8-foe.y));
  const value=clearance-Math.abs(angle)*5;
  if(value>score){score=value;best={x,y};}
 }
 return best;
}
/** One bounded contact point shared by the visible live ball and receiving boot. */
export function liveTouchContact(x:number,z:number,heading:number,side:number,remaining:number,offsetX:number,offsetZ:number){
 const contact=artistBallContact(x,z,heading,side),length=Math.hypot(offsetX,offsetZ);
 const weight=smooth(remaining),scale=length>.18?.18/length:1;
 return {x:contact.x+offsetX*scale*weight,z:contact.z+offsetZ*scale*weight};
}
/** The live simulation releases immediately; start the visible kick at contact,
 * then play the recovery instead of showing a late backswing. */
export function livePassKick(remaining:number){return (1-PASS_CONTACT_PHASE)*Math.max(0,Math.min(1,remaining));}
