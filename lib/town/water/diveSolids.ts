/**
 * Explore: solid things in the reef room (Oct 22 2026; user: "shouldn't be able to swim through wreckage. also make sure to double check
 * all other items while swimming"). docs/swimming-research.md §13, tests/explore-life.cjs.
 *
 * A cheap analytic collision world, built ONCE per room from the same matrices the room's meshes are built with (lib/graphics/diveRoom.ts
 * adds a solid next to each solid piece: the wreck's keel, ribs, planks, posts, masts, cabins and containers; rocks and boulders; the
 * arch's stones; the sunken goal's posts and bar; crates; big brain / table corals; the chest, clam and vent). Thin things stay passable
 * (kelp, grass, fans, soft coral, pickups, finds, balls, friends, barnacles).
 *
 * The diver is a sphere of DIVE_BODY.r round the body's middle (DIVE_BODY.cy under the session's y). Each solid is grown by its own `pad`
 * (boxes and bars: the plank's own thickness is thin, so a 1.3 m gap is the narrowest the diver passes: 2 × (r + pad)). The step moves
 * the diver in sub-steps of at most DIVE_BODY.step m (no tunnelling at any frame rate) and pushes it out of every solid in reach along
 * the shortest way, removing only the inward part of the velocity, so the diver SLIDES along a plank (never a hard stop). A uniform grid
 * (DIVE_SOLID_CELL m) keeps the test to the few solids near the diver. No allocation per frame.
 */
export const DIVE_BODY={r:.5,cy:-.15,step:.25} as const;
export const DIVE_SOLID_CELL=2,DIVE_SOLID_EXTENT=42;
/** Pads (m added round a solid): bars and boxes, round shapes. */
export const DIVE_PAD={box:.15,bar:.15,round:0} as const;

/** 0 box (centre, 3 unit axes as rows, half sizes), 1 ellipsoid (centre, radii, yaw about y), 2 capsule (a, b, radius). */
export type DiveSolid={k:0|1|2;tag:string;cx:number;cy:number;cz:number;
 /** box: axes (9: ux uy uz, vx vy vz, wx wy wz) and half sizes; ellipsoid: [cos yaw, sin yaw] in ax[0..1]; capsule: b - a in ax[0..2]. */
 ax:number[];hx:number;hy:number;hz:number;pad:number;
 /** Bounding radius round (cx, cy, cz) (pad included). */
 br:number};
export type DiveSolidWorld={solids:DiveSolid[];start:Int32Array;items:Int32Array;n:number;
 /** Last query: how many solids were tested (stats / the heat note). */
 tested:number;maxTested:number};

const W=Math.round(DIVE_SOLID_EXTENT*2/DIVE_SOLID_CELL);
export function diveSolidBox(tag:string,cx:number,cy:number,cz:number,axes:readonly number[],hx:number,hy:number,hz:number,pad:number=DIVE_PAD.box):DiveSolid{
 return {k:0,tag,cx,cy,cz,ax:axes.slice(0,9),hx,hy,hz,pad,br:Math.hypot(hx,hy,hz)+pad};}
export function diveSolidRound(tag:string,cx:number,cy:number,cz:number,rx:number,ry:number,rz:number,yaw=0,pad:number=DIVE_PAD.round):DiveSolid{
 return {k:1,tag,cx,cy,cz,ax:[Math.cos(yaw),Math.sin(yaw)],hx:rx,hy:ry,hz:rz,pad,br:Math.max(rx,ry,rz)+pad};}
export function diveSolidBar(tag:string,ax:number,ay:number,az:number,bx:number,by:number,bz:number,r:number,pad:number=DIVE_PAD.bar):DiveSolid{
 const dx=bx-ax,dy=by-ay,dz=bz-az;return {k:2,tag,cx:ax,cy:ay,cz:az,ax:[dx,dy,dz],hx:r,hy:0,hz:0,pad,br:Math.hypot(dx,dy,dz)+r+pad};}

/** The grid: every solid listed in each cell its reach (bound + the diver + one sub-step) touches. Built once. */
export function diveSolidWorld(solids:DiveSolid[]):DiveSolidWorld{
 const cells:number[][]=Array.from({length:W*W},()=>[]),reach=DIVE_BODY.r+DIVE_BODY.step+.3;
 solids.forEach((s,i)=>{// the solid's own x / z extent (boxes: the axes projected; bars: the segment), not its bounding sphere
  let mx=s.cx,mz=s.cz,ex=s.br,ez=s.br;const a=s.ax;
  if(s.k===0){ex=Math.abs(a[0])*s.hx+Math.abs(a[3])*s.hy+Math.abs(a[6])*s.hz+s.pad;ez=Math.abs(a[2])*s.hx+Math.abs(a[5])*s.hy+Math.abs(a[8])*s.hz+s.pad;}
  else if(s.k===1){ex=ez=Math.max(s.hx,s.hz)+s.pad;}
  else{mx=s.cx+a[0]/2;mz=s.cz+a[2]/2;ex=Math.abs(a[0])/2+s.hx+s.pad;ez=Math.abs(a[2])/2+s.hx+s.pad;}
  const x0=cellOf(mx-ex-reach),x1=cellOf(mx+ex+reach),z0=cellOf(mz-ez-reach),z1=cellOf(mz+ez+reach);
  for(let a=x0;a<=x1;a++)for(let b=z0;b<=z1;b++)cells[b*W+a].push(i);});
 const start=new Int32Array(W*W+1);let n=0;cells.forEach((c,i)=>{start[i]=n;n+=c.length;});start[W*W]=n;
 const items=new Int32Array(n);let o=0;for(const c of cells)for(const i of c)items[o++]=i;
 return {solids,start,items,n:solids.length,tested:0,maxTested:0};}
function cellOf(v:number){return Math.max(0,Math.min(W-1,Math.floor((v+DIVE_SOLID_EXTENT)/DIVE_SOLID_CELL)));}

/** Scratch (no allocation per call): the push-out of the last solidPush (x, y, z) and its depth. */
const out={x:0,y:0,z:0,d:0};
/** How far the point (px, py, pz) with radius R is inside solid s (> 0 = inside), the outward normal in `out`. */
function pen(s:DiveSolid,px:number,py:number,pz:number,R:number){
 const rr=R+s.pad;let dx=px-s.cx,dy=py-s.cy,dz=pz-s.cz;
 if(s.k===0){const a=s.ax;const lx=dx*a[0]+dy*a[1]+dz*a[2],ly=dx*a[3]+dy*a[4]+dz*a[5],lz=dx*a[6]+dy*a[7]+dz*a[8];
  const qx=Math.max(-s.hx,Math.min(s.hx,lx)),qy=Math.max(-s.hy,Math.min(s.hy,ly)),qz=Math.max(-s.hz,Math.min(s.hz,lz));
  let ex=lx-qx,ey=ly-qy,ez=lz-qz;const d=Math.hypot(ex,ey,ez);
  if(d>1e-6){if(d>=rr)return 0;ex/=d;ey/=d;ez/=d;out.d=rr-d;}
  else{// the centre is inside the box: out along the nearest face
   const fx=s.hx-Math.abs(lx),fy=s.hy-Math.abs(ly),fz=s.hz-Math.abs(lz);ex=ey=ez=0;
   if(fx<=fy&&fx<=fz){ex=lx<0?-1:1;out.d=fx+rr;}else if(fy<=fz){ey=ly<0?-1:1;out.d=fy+rr;}else{ez=lz<0?-1:1;out.d=fz+rr;}}
  out.x=ex*a[0]+ey*a[3]+ez*a[6];out.y=ex*a[1]+ey*a[4]+ez*a[7];out.z=ex*a[2]+ey*a[5]+ez*a[8];return out.d;}
 if(s.k===1){// ellipsoid (yaw only): the radial projection in the ellipsoid's unit space, normal from the gradient
  const c=s.ax[0],sn=s.ax[1],lx=dx*c-dz*sn,lz=dx*sn+dz*c,ux=lx/s.hx,uy=dy/s.hy,uz=lz/s.hz,f=Math.hypot(ux,uy,uz);
  if(f<1e-6){out.x=0;out.y=1;out.z=0;out.d=s.hy+rr;return out.d;}
  const sx=lx/f,sy=dy/f,sz=lz/f;let gx=ux/s.hx,gy=uy/s.hy,gz=uz/s.hz;const gl=Math.hypot(gx,gy,gz);gx/=gl;gy/=gl;gz/=gl;
  const along=(lx-sx)*gx+(dy-sy)*gy+(lz-sz)*gz;// signed distance from the surface along the normal (approximate)
  if(along>=rr)return 0;out.d=rr-along;out.x=gx*c+gz*sn;out.y=gy;out.z=-gx*sn+gz*c;return out.d;}
 const bx=s.ax[0],by=s.ax[1],bz=s.ax[2],L2=bx*bx+by*by+bz*bz,t=L2>0?Math.max(0,Math.min(1,(dx*bx+dy*by+dz*bz)/L2)):0;
 dx-=bx*t;dy-=by*t;dz-=bz*t;const d=Math.hypot(dx,dy,dz),r2=s.hx+rr;if(d>=r2)return 0;
 if(d<1e-6){out.x=0;out.y=1;out.z=0;}else{out.x=dx/d;out.y=dy/d;out.z=dz/d;}out.d=r2-d;return out.d;}

/** Push the point (body centre) with radius R out of every solid near it (a few passes); writes the result into `p` and the summed push
 *  normal into `n` (n.x, n.y, n.z: zero when nothing was hit). Returns the deepest penetration found before resolving. */
export function divePushOut(w:DiveSolidWorld,p:{x:number;y:number;z:number},R:number,n:{x:number;y:number;z:number}){
 n.x=n.y=n.z=0;let deepest=0;const c=cellOf(p.z)*W+cellOf(p.x),a=w.start[c],b=w.start[c+1];w.tested=b-a;if(w.tested>w.maxTested)w.maxTested=w.tested;
 for(let pass=0;pass<6;pass++){let hit=false;
  for(let k=a;k<b;k++){const s=w.solids[w.items[k]];const dx=p.x-s.cx,dy=p.y-s.cy,dz=p.z-s.cz,lim=s.br+R;
   if(dx*dx+dy*dy+dz*dz>lim*lim)continue;
   const d=pen(s,p.x,p.y,p.z,R);if(d<=0)continue;if(d>deepest)deepest=d;hit=true;
   p.x+=out.x*(d+1e-4);p.y+=out.y*(d+1e-4);p.z+=out.z*(d+1e-4);n.x+=out.x;n.y+=out.y;n.z+=out.z;}
  if(!hit)break;}
 return deepest;}
/** Sideways only (the height is pinned: the sand or the surface): out of every solid along the push's level part, or straight away from
 *  the solid's centre when the push is (nearly) vertical (a table coral over a diver lying on the sand). */
export function divePushOutLevel(w:DiveSolidWorld,p:{x:number;y:number;z:number},R:number){
 for(let pass=0;pass<16;pass++){let hit=false;const c=cellOf(p.z)*W+cellOf(p.x),a=w.start[c],b=w.start[c+1];
  for(let k=a;k<b;k++){const s=w.solids[w.items[k]],d=pen(s,p.x,p.y,p.z,R);if(d<=0)continue;hit=true;
   let hx=out.x,hz=out.z,l=Math.hypot(hx,hz);if(l<.3){hx=p.x-(s.k===2?s.cx+s.ax[0]/2:s.cx);hz=p.z-(s.k===2?s.cz+s.ax[2]/2:s.cz);l=Math.hypot(hx,hz);if(l<1e-6){hx=1;hz=0;l=1;}}
   const m=Math.min(.25,d+1e-3);p.x+=hx/l*m;p.z+=hz/l*m;}
  if(!hit)return;}}
/** How far the point is inside the nearest solid (0 = free): the tests' check after resolving. */
export function divePenetration(w:DiveSolidWorld,x:number,y:number,z:number,R:number){
 let deepest=0;const c=cellOf(z)*W+cellOf(x);for(let k=w.start[c];k<w.start[c+1];k++){const s=w.solids[w.items[k]],dx=x-s.cx,dy=y-s.cy,dz=z-s.cz,lim=s.br+R;if(dx*dx+dy*dy+dz*dz>lim*lim)continue;const d=pen(s,x,y,z,R);if(d>deepest)deepest=d;}return deepest;}
/** The camera: the fraction (0..1) of the way from (ax, ay, az) toward (bx, by, bz) that is clear for a point of radius R (marched in
 *  DIVE_BODY.step steps; the follow camera pulls in to it so a plank never sits between the camera and the diver). */
export function diveClearFrac(w:DiveSolidWorld,ax:number,ay:number,az:number,bx:number,by:number,bz:number,R:number){
 const L=Math.hypot(bx-ax,by-ay,bz-az),n=Math.max(1,Math.ceil(L/DIVE_BODY.step));
 for(let i=1;i<=n;i++){const t=i/n;if(divePenetration(w,ax+(bx-ax)*t,ay+(by-ay)*t,az+(bz-az)*t,R)>0)return Math.max(0,(i-1)/n);}
 return 1;}
