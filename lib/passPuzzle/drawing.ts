import type {StrokePoint} from './types';
/** Keep a long gesture bounded without ever freezing its live endpoint. */
export function appendStroke(points:StrokePoint[],point:StrokePoint){
 if(points.length>=128){let write=1;for(let read=2;read<points.length-1;read+=2)points[write++]=points[read];points[write++]=points[points.length-1];points.length=write;}
 points.push(point);
}

export type PointerFilter={x:number;y:number;rawX:number;rawY:number;t:number;vx:number;vy:number};
export const createPointerFilter=(x:number,y:number,t:number):PointerFilter=>({x,y,rawX:x,rawY:y,t,vx:0,vy:0});
/** One-Euro filter: quiet near a target, responsive during a deliberate sweep.
 * Screen pixels keep the same touch tolerance at every camera zoom. */
export function filterPointer(s:PointerFilter,x:number,y:number,t:number){
 // Browsers can repeat the final coalesced sample as the parent pointer event.
 // Filtering it twice invents elapsed time and makes drag lag depend on the
 // number of dispatched events. Older samples must not rewind the filter.
 if(!Number.isFinite(x+y+t)||t<=s.t)return s;
 const dt=Math.max(1/240,Math.min(.05,(t-s.t)/1000)),alpha=(hz:number)=>1-Math.exp(-2*Math.PI*hz*dt),v=alpha(8);
 s.vx+=((x-s.rawX)/dt-s.vx)*v;s.vy+=((y-s.rawY)/dt-s.vy)*v;
 const a=alpha(3.5+.035*Math.hypot(s.vx,s.vy));s.x+=(x-s.x)*a;s.y+=(y-s.y)*a;s.rawX=x;s.rawY=y;s.t=t;return s;
}
