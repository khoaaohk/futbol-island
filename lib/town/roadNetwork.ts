import {onIsland} from './shoreline';
export type TrafficRoad={x:number;z:number;w:number;d:number;vertical:boolean};
export type RoadNode={id:number;x:number;z:number;links:number[]};
/** Split the authored streets at their intersections and shared endpoints. */
export function buildRoadNetwork(roads:TrafficRoad[]):RoadNode[]{
 const points=new Map<string,{x:number;z:number}>(),add=(x:number,z:number)=>{if(onIsland(x,z))points.set(x.toFixed(3)+':'+z.toFixed(3),{x,z});};
 for(const r of roads){if(r.vertical){add(r.x,r.z-r.d/2);add(r.x,r.z+r.d/2);}else{add(r.x-r.w/2,r.z);add(r.x+r.w/2,r.z);}}
 for(const a of roads.filter(r=>r.vertical))for(const b of roads.filter(r=>!r.vertical)){if(Math.abs(a.x-b.x)<=b.w/2+.01&&Math.abs(b.z-a.z)<=a.d/2+.01)add(a.x,b.z);}
 const nodes=[...points.values()].map((p,id)=>({...p,id,links:[] as number[]}));
 for(const r of roads){const line=nodes.filter(p=>r.vertical?Math.abs(p.x-r.x)<.01&&Math.abs(p.z-r.z)<=r.d/2+.01:Math.abs(p.z-r.z)<.01&&Math.abs(p.x-r.x)<=r.w/2+.01).sort((a,b)=>r.vertical?a.z-b.z:a.x-b.x);
  for(let i=1;i<line.length;i++){const a=line[i-1],b=line[i];if(Math.hypot(a.x-b.x,a.z-b.z)<.1)continue;if(!a.links.includes(b.id))a.links.push(b.id);if(!b.links.includes(a.id))b.links.push(a.id);}
 }
 return nodes;
}
