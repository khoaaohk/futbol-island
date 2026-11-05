type Placement={shotHeight:number;fromY:number;goalY:number;aimX:number};
export const shotProgress=(k:Placement,y:number)=>Math.max(0,Math.min(1,(y-k.fromY)/(k.goalY-k.fromY||1)));
export function shotHeightAt(k:Placement,p:number,goalHeight:number){
 const target=Math.max(0,goalHeight-.295-.19-.06)*k.shotHeight;
 return target*p+Math.min(.3,target*.2)*4*p*(1-p);
}
/** Sim field units (270-wide field) of the sim's goal half-width (matchSim GHALF). */
export const SIM_GOAL_HALF=19;
/** World metres from the goal centre where a shot aimed at sim x `aimX` is drawn crossing the line: the sim's GHALF is
 *  mapped onto the real goal mouth inside the posts (ball radius + post inset), on every venue. The aim marks use this. */
export const shotMouthX=(aimX:number,goalWidth:number)=>(aimX-135)/SIM_GOAL_HALF*(goalWidth/2-.19-.08);
export function shotOffsetAt(k:Placement,p:number,goalWidth:number,width:number){
 const intended=shotMouthX(k.aimX,goalWidth);
 return (intended-(k.aimX-135)*width/250)*p*p*(3-2*p);
}
