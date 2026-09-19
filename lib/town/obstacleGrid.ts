import type {Obstacle} from './simulation';
/** Static footprints are indexed once; moving and breakable objects remain live. */
export function createObstacleGrid<T extends Obstacle>(items:T[],cellSize=16){
 let length=-1;const cells=new Map<string,T[]>(),live:T[]=[];
 const stats={queries:0,candidates:0,total:items.length};
 function rebuild(){cells.clear();live.length=0;length=items.length;stats.total=length;
  for(const o of items){if(o.dynamic||['x','z','w','d'].some(k=>Object.getOwnPropertyDescriptor(o,k)?.get)){live.push(o);continue;}
   for(let x=Math.floor((o.x-o.w/2)/cellSize);x<=Math.floor((o.x+o.w/2)/cellSize);x++)for(let z=Math.floor((o.z-o.d/2)/cellSize);z<=Math.floor((o.z+o.d/2)/cellSize);z++){const key=x+':'+z;const bucket=cells.get(key);if(bucket)bucket.push(o);else cells.set(key,[o]);}
  }
 }
 function query(x:number,z:number,radius=1){if(items.length!==length)rebuild();const found=new Set<T>();
  for(let cx=Math.floor((x-radius)/cellSize);cx<=Math.floor((x+radius)/cellSize);cx++)for(let cz=Math.floor((z-radius)/cellSize);cz<=Math.floor((z+radius)/cellSize);cz++)for(const o of cells.get(cx+':'+cz)??[])found.add(o);
  for(const o of live)if(Math.abs(o.x-x)<=o.w/2+radius&&Math.abs(o.z-z)<=o.d/2+radius)found.add(o);
  stats.queries++;stats.candidates+=found.size;return [...found];
 }
 return{query,rebuild,stats};
}
