import {VENUES,FIELD_SURFACE_Y,type Format} from './venues';
import type {Obstacle} from './simulation';
export const GOAL_DEPTH=1.4;
export const goalPostRadius=(format:Format)=>format==='futsal'?.055:.065;
export type GoalBarrier=Obstacle&{floor:number;top:number};
/** Open front, solid side/rear netting and posts; elevation keeps rooftop goals off the street. */
export const GOAL_BARRIERS:GoalBarrier[]=VENUES.flatMap(v=>[-1,1].flatMap(side=>{
 const front=v.z+side*v.length/2,back=front+side*GOAL_DEPTH,floor=(v.elevation??0)+FIELD_SURFACE_Y,top=floor+v.goalHeight,thickness=goalPostRadius(v.id)*2;
 return [
  ...[-1,1].map(hand=>({x:v.x+hand*v.goalWidth/2,z:(front+back)/2,w:thickness,d:GOAL_DEPTH+thickness,floor,top})),
  {x:v.x,z:back,w:v.goalWidth+thickness,d:.07,floor,top}
 ];
}));
export function goalBarriersAt(height:number){return GOAL_BARRIERS.filter(b=>height+1.7>b.floor&&height<b.top);}
