import {onCay} from './coralCay';
import {onEastPier} from './eastPier';
import {inStadiumFootprint} from './westParkLayout';
/**
 * Explore checklist places (G-13, Sep 30 2026): "Visit Coral Cay" and "Walk the East Jetty"; Nov 13 2026: "Visit the stadium".
 * Stepped from Town's existing frame callback (no new loop): it looks at the player's position twice a second at most, and switches
 * itself off for good once all are done (or were already done in this save). Coral Cay counts on any ride; the jetty and the stadium
 * count when not flying (the stadium: on foot or a ride inside the bowl's walls, 4 m in, so the gate's arch is not enough).
 */
export const inStadiumBowl=(x:number,z:number)=>inStadiumFootprint(x,z,-4);
export function createExploreZones(done:{cay:boolean;jetty:boolean;stadium?:boolean},record:(kind:'cay'|'jetty'|'stadium')=>void){
 let cay=done.cay,jetty=done.jetty,stadium=!!done.stadium,wait=0;
 return {
  get finished(){return cay&&jetty&&stadium;},
  step(dt:number,x:number,z:number,flying:boolean){
   if(cay&&jetty&&stadium)return;wait-=dt;if(wait>0)return;wait=.5;
   if(!cay&&onCay(x,z)){cay=true;record('cay');}
   if(!jetty&&!flying&&onEastPier(x,z)){jetty=true;record('jetty');}
   if(!stadium&&!flying&&inStadiumBowl(x,z)){stadium=true;record('stadium');}
  },
 };
}
