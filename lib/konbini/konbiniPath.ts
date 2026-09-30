/**
 * Tap-to-walk path finding for the walk-in Konbini (lib/konbini/konbiniScene.ts), pure so tests/konbini.cjs can run it.
 * Grid A* at 0.25 m over the 16 × 12.8 m floor; runs only on a tap.
 *
 * Code review Sep 29 2026, finding 4: a tap behind the counter (an enclosed, unreachable area) used to return the raw goal, so the
 * avatar walked into the counter forever and the render loop never idled. Now an unreachable goal returns the path to the closest
 * reachable cell (or [] when no cell is closer than where you stand), and `createStuckWatch` drops a target that stops getting
 * closer, so the room always goes idle.
 */
export type FloorPoint={x:number;z:number};
const S=.25,W=Math.round(16/S),H=Math.round(12.8/S);
const ix=(px:number)=>Math.round((px+8)/S),iz=(pz:number)=>Math.round((pz+6)/S),wx=(i:number)=>i*S-8,wz=(j:number)=>j*S-6;
const STEPS:[number,number][]=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];

type Node=[number,number,number];
// A binary min-heap on f (an unreachable goal explores the whole reachable floor, ~2,000 cells: a sort per step made that ~60 ms).
function push(h:Node[],n:Node){h.push(n);let i=h.length-1;while(i>0){const p=(i-1)>>1;if(h[p][0]<=h[i][0])break;[h[p],h[i]]=[h[i],h[p]];i=p;}}
function pop(h:Node[]):Node{const top=h[0],last=h.pop()!;if(h.length){h[0]=last;let i=0;for(;;){const l=2*i+1,r=l+1;let m=i;if(l<h.length&&h[l][0]<h[m][0])m=l;if(r<h.length&&h[r][0]<h[m][0])m=r;if(m===i)break;[h[m],h[i]]=[h[i],h[m]];i=m;}}return top;}
export function findFloorPath(from:FloorPoint,to:FloorPoint,blocked:(x:number,z:number)=>boolean):FloorPoint[]{
 let tx=to.x,tz=to.z;
 const sx=ix(from.x),sz=iz(from.z);let gx=ix(tx),gz=iz(tz);
 if(blocked(wx(gx),wz(gz))){let best=Infinity;for(let dj=-6;dj<=6;dj++)for(let di=-6;di<=6;di++){const a=gx+di,b=gz+dj;if(!blocked(wx(a),wz(b))){const d=di*di+dj*dj;if(d<best){best=d;tx=wx(a);tz=wz(b);}}}gx=ix(tx);gz=iz(tz);}
 const key=(i:number,j:number)=>j*(W+1)+i,start=key(sx,sz),came=new Map<number,number>(),g=new Map<number,number>([[start,0]]),open:Node[]=[[0,sx,sz]];
 const goal=key(gx,gz);const closed=new Set<number>();let found=false,guard=0,closest=start,closestH=Math.hypot(gx-sx,gz-sz);
 while(open.length&&guard++<6000){const [,ci,cj]=pop(open),ck=key(ci,cj);if(closed.has(ck))continue;closed.add(ck);if(ck===goal){found=true;break;}
  const h=Math.hypot(gx-ci,gz-cj);if(h<closestH){closestH=h;closest=ck;}
  for(const [di,dj] of STEPS){const ni=ci+di,nj=cj+dj;if(ni<0||nj<0||ni>W||nj>H||blocked(wx(ni),wz(nj)))continue;const nk=key(ni,nj),cost=g.get(ck)!+Math.hypot(di,dj);if(cost<(g.get(nk)??Infinity)){g.set(nk,cost);came.set(nk,ck);push(open,[cost+Math.hypot(gx-ni,gz-nj),ni,nj]);}}}
 // Unreachable goal: walk to the closest reachable cell instead (never into the obstacle); nothing closer → stay put.
 const end=found?goal:closest;if(end===start)return [];
 const path:FloorPoint[]=[];let k=end;while(k!==start&&came.has(k)){path.unshift({x:wx(k%(W+1)),z:wz(Math.floor(k/(W+1)))});k=came.get(k)!;}
 // Thin the grid path to corners.
 return path.filter((p,i)=>i===path.length-1||i%3===2);
}

/** Drops a walk target that has not got at least 5 cm closer for `limit` seconds (pushed against a shelf, a blocked corner). */
export function createStuckWatch(limit=.5){
 let watched:unknown=null,best=Infinity,still=0;
 return {
  /** Call each frame while walking to `target`, `d` metres away. Returns true when the target should be given up. */
  step(target:unknown,d:number,dt:number){if(target!==watched){watched=target;best=d;still=0;return false;}
   if(d<best-.05){best=d;still=0;return false;}still+=dt;return still>=limit;},
  reset(){watched=null;best=Infinity;still=0;},
 };
}
