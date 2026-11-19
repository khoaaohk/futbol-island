// Working traffic lights (Nov 18 2026, owner: "make the lights work so cars go on red, yellow, and green light ... not increase heat").
// Pure timing and decisions, no three.js: lib/graphics/streetTraffic.ts asks it what an approach shows and whether a car must stop;
// lib/graphics/trafficSignalLamps.ts paints the lamps (one instanced draw for every lamp on the island).
//
// A junction with three or more streets runs a fixed two-phase cycle: the north-south street (axis 'z') has green, then yellow,
// then everything is red for a moment, then the east-west street (axis 'x') has its turn. The light is a pure function of the
// traffic clock and the junction's offset, so nothing is stored or stepped per junction. Opposing streets can never be green or
// yellow together: their windows are half a cycle apart with an all-red gap on both sides. Corners and dead ends (two streets or
// fewer: nothing to cross) flash yellow, as real off-peak signals do. The roundabout has no heads and stays a yield roundabout.
import type {RoadNode} from './roadNetwork';
export const SIGNAL_GREEN=8,SIGNAL_YELLOW=2,SIGNAL_ALL_RED=1.5,SIGNAL_HALF=SIGNAL_GREEN+SIGNAL_YELLOW+SIGNAL_ALL_RED,SIGNAL_CYCLE=SIGNAL_HALF*2;
export const RED=0,YELLOW=1,GREEN=2,FLASH_PERIOD=1.6;
export type SignalLight=0|1|2;
/** 'x': traffic driving along an east-west street; 'z': along a north-south street. */
export type SignalAxis='x'|'z';
/** One hanging signal head: where its three lamps are, which way they face, which junction and street it serves. */
export type SignalHead={x:number;y:number;z:number;yaw:number;jx:number;jz:number;axis:SignalAxis};
/** Each junction starts its cycle at a different moment (so the town is not one big green wave), fixed by where it is. */
export const signalOffset=(x:number,z:number)=>{const h=Math.abs(Math.round(x)*7+Math.round(z)*13)%46;return h/46*SIGNAL_CYCLE;};
export function signalLight(time:number,offset:number,axis:SignalAxis):SignalLight{
 let t=(time+offset+(axis==='x'?SIGNAL_HALF:0))%SIGNAL_CYCLE;if(t<0)t+=SIGNAL_CYCLE;
 return t<SIGNAL_GREEN?GREEN:t<SIGNAL_GREEN+SIGNAL_YELLOW?YELLOW:RED;
}
/** The flashing yellow of an uncontrolled corner: on for the first half of each period. */
export const flashOn=(time:number)=>{let t=time%FLASH_PERIOD;if(t<0)t+=FLASH_PERIOD;return t<FLASH_PERIOD/2;};
/** Must a car `distanceToLine` metres short of the stop line, doing `speed`, stop? Red: yes. Yellow: only if it can stop
 *  comfortably (at `brake` m/s²); otherwise it clears the junction. Past the line it always carries on and clears. */
export function signalStop(light:SignalLight,distanceToLine:number,speed:number,brake:number){
 if(light===GREEN||distanceToLine<=0)return false;
 if(light===RED)return true;
 return speed*speed/(2*brake)<=distanceToLine;
}
/** Which road nodes are run by lights: a node with three or more streets that has at least one head. Returns the cycle offset
 *  per node id, or -1 where there are no working lights. */
export function signalledNodes(nodes:RoadNode[],heads:readonly SignalHead[]){
 const offsets=new Float64Array(nodes.length).fill(-1);
 for(const n of nodes)if(n.links.length>=3&&heads.some(h=>Math.abs(h.jx-n.x)<.6&&Math.abs(h.jz-n.z)<.6))offsets[n.id]=signalOffset(n.x,n.z);
 return offsets;
}
/** One head per approach at every node with two or more streets, hung on the far side of the crossing over the incoming lane
 *  (the same places lib/town/world.ts hangs the island's heads). For tests and tools; the game passes world.signalHeads. */
export function signalHeadsForNodes(nodes:RoadNode[]):SignalHead[]{
 const heads:SignalHead[]=[];
 for(const n of nodes){if(n.links.length<2)continue;
  for(const id of n.links){const from=nodes[id],dx=from.x-n.x,dz=from.z-n.z,length=Math.hypot(dx,dz);if(length<12||Math.abs(dx)>1&&Math.abs(dz)>1)continue;
   const ux=dx/length,uz=dz/length,axis:SignalAxis=Math.abs(dx)>Math.abs(dz)?'x':'z';
   // Travel direction is (-ux,-uz); the head hangs 5.3 m past the centre, 2 m to the driver's right, facing back at the driver.
   heads.push({x:n.x-ux*5.3+uz*2,y:5.5,z:n.z-uz*5.3-ux*2,yaw:Math.atan2(ux,uz),jx:n.x,jz:n.z,axis});}}
 return heads;
}
