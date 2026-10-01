import {onCay} from './coralCay';
import {onEastPier} from './eastPier';
/**
 * Explore checklist places (G-13, Sep 30 2026): "Visit Coral Cay" and "Walk the East Jetty". Stepped from Town's existing frame
 * callback (no new loop): it looks at the player's position twice a second at most, and switches itself off for good once both
 * are done (or were already done in this save). Coral Cay counts on any ride; the jetty counts when not flying over it.
 */
export function createExploreZones(done:{cay:boolean;jetty:boolean},record:(kind:'cay'|'jetty')=>void){
 let cay=done.cay,jetty=done.jetty,wait=0;
 return {
  get finished(){return cay&&jetty;},
  step(dt:number,x:number,z:number,flying:boolean){
   if(cay&&jetty)return;wait-=dt;if(wait>0)return;wait=.5;
   if(!cay&&onCay(x,z)){cay=true;record('cay');}
   if(!jetty&&!flying&&onEastPier(x,z)){jetty=true;record('jetty');}
  },
 };
}
