import type {RoadNode} from './roadNetwork';
type Point={x:number;z:number};
/** One bounded route search when a driver leaves off-road, never one search per frame. */
export function* truckRoadRouteSearch(start:Point,roads:RoadNode[],clear:(a:Point,b:Point)=>boolean){
 const goals=roads.filter(n=>n.links.length).sort((a,b)=>Math.hypot(a.x-start.x,a.z-start.z)-Math.hypot(b.x-start.x,b.z-start.z));
 type Node=Point&{ix:number;iz:number;g:number;f:number;parent:Node|null};
 const heuristic=(p:Point)=>Math.min(...goals.map(n=>Math.hypot(n.x-p.x,n.z-p.z)));
 if(!goals.length)return null;
 const first:Node={...start,ix:0,iz:0,g:0,f:heuristic(start),parent:null},open:Node[]=[first],best=new Map<string,number>([['0:0',0]]);
 // Binary heap keeps a long detour from becoming a quadratic main-thread task.
 const push=(n:Node)=>{let i=open.length;open.push(n);while(i>0){const p=(i-1)>>1;if(open[p].f<=n.f)break;open[i]=open[p];i=p;}open[i]=n;};
 const pop=()=>{const top=open[0],last=open.pop()!;if(open.length){let i=0;while(i*2+1<open.length){let child=i*2+1;if(child+1<open.length&&open[child+1].f<open[child].f)child++;if(open[child].f>=last.f)break;open[i]=open[child];i=child;}open[i]=last;}return top;};
 let visited=0;
 while(open.length&&visited++<4096){if(visited%24===0)yield;const current=pop();if(current.g>(best.get(`${current.ix}:${current.iz}`)??Infinity))continue;
  const goal=goals.find(n=>Math.hypot(n.x-current.x,n.z-current.z)<=4.5&&clear(current,n));
  if(goal){const points:Point[]=[{x:goal.x,z:goal.z}];for(let n:Node|null=current;n?.parent;n=n.parent)points.push({x:n.x,z:n.z});points.reverse();return {points,node:goal.id,visited};}
  for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){if(!dx&&!dz)continue;const ix=current.ix+dx,iz=current.iz+dz,key=`${ix}:${iz}`,g=current.g+Math.hypot(dx,dz)*3;if(g>=(best.get(key)??Infinity))continue;const next={x:start.x+ix*3,z:start.z+iz*3};if(!clear(current,next))continue;best.set(key,g);push({...next,ix,iz,g,f:g+heuristic(next),parent:current});}
 }
 return null;
}

export function findTruckRoadRoute(start:Point,roads:RoadNode[],clear:(a:Point,b:Point)=>boolean){const search=truckRoadRouteSearch(start,roads,clear);let result=search.next();while(!result.done)result=search.next();return result.value;}
