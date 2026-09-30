// Street traffic on the Coral Cay causeway (Sep 29 2026): extends the island road graph (roadNetwork.ts) with ONE long
// link from the Community Hall junction to a one-way roundabout on the cay (plus a boulevard spur). The causeway link has
// a custom lane curve that follows the winding road (`laneCurve`), so opposing cars never meet at mid-road nodes;
// streetTraffic.ts otherwise treats it like any street (lane offset, junction boxes, turn choices) and skips the
// `forbidden` transitions (the ring's wrong way). No new per-frame work.
import type {RoadNode} from './roadNetwork';
import {CAUSEWAY_PATH,ROUNDABOUT,CAY_BOULEVARD,CAUSEWAY,offsetPoint} from './coralCay';
type P={x:number;z:number};
export type CayTraffic={forbidden:Set<string>;ring:number[];
 /** One-way ring nodes with no crossing traffic: not junction boxes. The two arm nodes keep their own (unmerged) boxes. */
 unguarded:Set<number>;armBoxes:Set<number>;spurEnd:number;junction:number;
 /** Lane points (right-hand lane, 2 m off the centre line) for a custom link, in travel order; null for ordinary links. */
 laneCurve:(from:number,to:number)=>P[]|null};
export const CAY_LANE_OFFSET=2;
export function extendRoadNetworkWithCay(nodes:RoadNode[]):CayTraffic|null{
 const junction=nodes.find(n=>Math.hypot(n.x-CAUSEWAY.roadStart+4,n.z-CAUSEWAY.z)<.6);
 if(!junction)return null;
 const add=(x:number,z:number)=>{const n:RoadNode={id:nodes.length,x,z,links:[]};nodes.push(n);return n;};
 const link=(a:RoadNode,b:RoadNode)=>{if(!a.links.includes(b.id))a.links.push(b.id);if(!b.links.includes(a.id))b.links.push(a.id);};
 const R=ROUNDABOUT;
 // Ring nodes in circulation order: angle decreasing from west (180°) through south (90°) = anticlockwise on the map.
 const ring=Array.from({length:R.nodes},(_,i)=>{const a=Math.PI-i*2*Math.PI/R.nodes;return add(R.x+Math.cos(a)*R.nodeRadius,R.z+Math.sin(a)*R.nodeRadius);});
 for(let i=0;i<ring.length;i++)link(ring[i],ring[(i+1)%ring.length]);
 const west=ring[0];link(junction,west);
 // Boulevard spur east towards the plaza (a dead end: cars turn there and come back round).
 const east=ring[R.nodes/2],spur=add(CAY_BOULEVARD.x1-4,CAY_BOULEVARD.z);link(east,spur);
 const forbidden=new Set<string>();for(let i=0;i<ring.length;i++)forbidden.add(`${ring[(i+1)%ring.length].id}:${ring[i].id}`);
 // Eastbound lane points along the causeway, between the junction box and the ring's west arm (4 m clear of each node).
 const run=CAUSEWAY_PATH.filter(p=>p.x>junction.x+4&&p.x<west.x-R.roadOuter+R.nodeRadius-1.5);
 const eastbound=run.map(p=>offsetPoint(p,CAY_LANE_OFFSET)),westbound=run.slice().reverse().map(p=>offsetPoint(p,-CAY_LANE_OFFSET));
 return {forbidden,ring:ring.map(n=>n.id),unguarded:new Set(ring.filter(n=>n!==west&&n!==east).map(n=>n.id)),armBoxes:new Set([west.id,east.id]),spurEnd:spur.id,junction:junction.id,
  laneCurve:(from,to)=>from===junction.id&&to===west.id?eastbound:from===west.id&&to===junction.id?westbound:null};
}
