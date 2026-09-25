import type {Venue} from './venues';
/** Called only on a shot request. Assist a goal the player is already facing from inside its pitch. */
export function goalFinish(p:{x:number;y:number;z:number;yaw:number},power:number,venues:readonly Venue[]){
 let best:{x:number;y:number;z:number}|undefined,nearest=Infinity;
 for(const v of venues){
  if(Math.abs(p.y-(v.elevation??0))>.4||Math.abs(p.x-v.x)>v.width/2||Math.abs(p.z-v.z)>v.length/2)continue;
  for(const end of [-1,1]){
   const z=v.z+end*v.length/2,dx=v.x-p.x,dz=z-p.z,d=Math.hypot(dx,dz);
   if(d<2||d>30||d>=nearest||(dx*Math.sin(p.yaw)+dz*Math.cos(p.yaw))/d<Math.cos(.32))continue;
   // The input's intersection with the goal line chooses the left/right corner.
   const aimX=p.x+Math.sin(p.yaw)*(dz/Math.cos(p.yaw));
   const side=aimX>=v.x?1:-1,charge=Math.max(0,Math.min(1,power));
   best={x:v.x+side*(v.goalWidth/2-.2-.12),z,y:(v.elevation??0)+.35+(v.goalHeight-.2-.12-.35)*charge};nearest=d;
  }
 }
 return best;
}
