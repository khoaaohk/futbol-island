type Placement={shotHeight:number;fromY:number;goalY:number;aimX:number};
export const shotProgress=(k:Placement,y:number)=>Math.max(0,Math.min(1,(y-k.fromY)/(k.goalY-k.fromY||1)));
export function shotHeightAt(k:Placement,p:number,goalHeight:number){
 const target=Math.max(0,goalHeight-.295-.19-.06)*k.shotHeight;
 return target*p+Math.min(.3,target*.2)*4*p*(1-p);
}
export function shotOffsetAt(k:Placement,p:number,goalWidth:number,width:number){
 const intended=(k.aimX-135)/19*(goalWidth/2-.19-.08);
 return (intended-(k.aimX-135)*width/250)*p*p*(3-2*p);
}
