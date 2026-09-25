import type {NpcPoint} from './npcBehavior';
/** Authored walking lanes through the two real stair openings, not shortcuts across roofs. */
export type CafeWaypoint=NpcPoint&{pause?:number};
function route(lane:number){
 const east=211.5+lane,west=194.3+lane;
 const up:CafeWaypoint[]=[{x:200+lane,y:0,z:168.5+lane,pause:5},{x:east,y:0,z:168.5+lane},{x:east,y:0,z:164.4}];
 for(let i=30;i>=0;i--)up.push({x:east,y:9.23-i*9.23/31,z:150+(i+.5)*.45});
 up.push({x:east,y:9.23,z:148.75+lane},{x:206+lane,y:9.23,z:148.75+lane},{x:200+lane,y:9.23,z:148.1+lane,pause:4},
  {x:197+lane,y:9.23,z:151+lane},{x:197+lane,y:9.23,z:162.4+lane},{x:west,y:9.23,z:162.4+lane},{x:west,y:9.23,z:161.8});
 for(let i=30;i>=0;i--)up.push({x:west,y:18.23-i*9/31,z:147.5+(i+.5)*.45});
 up.push({x:west,y:18.23,z:146.5},{x:west,y:18.23,z:143.7+lane},{x:200+lane,y:18.23,z:141.5+lane},{x:200+lane,y:18.23,z:136+lane,pause:7});
 return [...up,...up.slice(1,-1).reverse().map(p=>({...p}))];
}
export const CAFE_NPC_ROUTES:Record<string,CafeWaypoint[]>={
 'cafe-bela':route(-.65),
 'cafe-oren':route(.65),
};
// Route legs are authored and checked against scenery. A walking step must stay on
// one leg in 3D, so neither greeting nor a routine reset can cut across a railing.
export function onCafeRoute(a:NpcPoint,b:NpcPoint,route:readonly NpcPoint[],waypoint?:number){
 const on=(p:NpcPoint,u:NpcPoint,v:NpcPoint)=>{const dx=v.x-u.x,dy=v.y-u.y,dz=v.z-u.z,len=dx*dx+dy*dy+dz*dz,t=Math.max(0,Math.min(1,((p.x-u.x)*dx+(p.y-u.y)*dy+(p.z-u.z)*dz)/(len||1)));return Math.hypot(p.x-u.x-dx*t,p.y-u.y-dy*t,p.z-u.z-dz*t)<.085;};
 const indices=waypoint===undefined?route.map((_,i)=>i):[(waypoint+route.length-1)%route.length,waypoint];
 return indices.some(i=>{const u=route[i],v=route[(i+1)%route.length];return on(a,u,v)&&on(b,u,v);});
}
