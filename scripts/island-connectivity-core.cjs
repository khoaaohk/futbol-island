// Island walk-connectivity analysis (Oct 22 2026). Rasterises where a walking player can stand from the SAME collision the game
// uses (simulation.ts groundBlocked: shoreline / Coral Cay / Summit land, landable decks, the ferry ramp; world.ts obstacles plus the
// vending machines and fishing kiosks Town.tsx adds; rooftopTravel.ts surface heights: buildings, walk surfaces and stairs, ride
// ramps, field heights) on a square grid, then flood-fills from the spawn with the walking rules of rooftopTravel.update:
// a building-like collider (a roof / walk surface footprint) blocks only when it stands more than STEP above the walker, other
// colliders block on the ground (not on a raised surface), a step up is at most STEP, a step down is any height (a drop).
// Swimming is NOT counted: this is reachability on foot. Summit Isle ground has no slope limit (groundBlocked), so heights are
// ignored between Summit ground cells. Pure Node: used by scripts/audit-island-connectivity.cjs and tests/island-connectivity.cjs.
const {loadIslandWorld}=require('./island-world-load.cjs');
const STEP=.35,RADIUS=.32;
async function analyse({cell=.5,base=process.cwd()}={}){
 const t0=Date.now();
 const env=await loadIslandWorld(base),{world,sim,L,obstacles}=env;
 const tLoad=Date.now()-t0;
 let ramps=[];try{const R=L('lib/town/rideRamps.ts');ramps=[...R.planRideRamps(world.roads,world.obstacles,world.surfaceAreas.filter(a=>a.kind==='path')),...R.planRoofRamps(world.buildings)];env.rampSurface=(x,z)=>R.rampSurface(ramps,x,z);}catch(e){console.error('ride ramps not loaded:',e.message);env.rampSurface=()=>0;}
 const roofs=[...world.buildings,...world.walkSurfaces];
 const rooftop=L('lib/town/rooftopTravel.ts').createRooftopTravel(roofs,obstacles,{x:103,z:-8},world.roofObstacles,(x,z)=>env.rampSurface(x,z),world.landingExclusions,world.canopies);
 const {fieldSurfaceHeight}=env.venues;const {onSummitGround}=L('lib/town/summitIsle.ts');
 // Colliders: building-like (footprint of a roof or walk surface: blocks only when taller than the walker + STEP) or clutter.
 const fp=o=>[o.x,o.z,o.w,o.d].join(':'),roofByFp=new Map(roofs.map(r=>[fp(r),r]));
 const minX=-104,maxX=812,minZ=-268,maxZ=252,W=Math.ceil((maxX-minX)/cell)+1,H=Math.ceil((maxZ-minZ)/cell)+1,N=W*H;
 const BK=4,bw=Math.ceil((maxX-minX)/BK)+1,bh=Math.ceil((maxZ-minZ)/BK)+1,buckets=new Array(bw*bh);
 const solids=obstacles.map(o=>({x:o.x,z:o.z,w:o.w,d:o.d,cornerRadius:o.cornerRadius,src:o,roof:roofByFp.get(fp(o))})).filter(o=>o.w>0&&o.d>0);
 const props=world.roofObstacles.map(o=>({x:o.x,z:o.z,w:o.w,d:o.d,floor:o.floor,top:o.top,prop:true}));
 for(const o of [...solids,...props]){const pad=RADIUS+.01;
  for(let bx=Math.max(0,Math.floor((o.x-o.w/2-pad-minX)/BK));bx<=Math.min(bw-1,Math.floor((o.x+o.w/2+pad-minX)/BK));bx++)
   for(let bz=Math.max(0,Math.floor((o.z-o.d/2-pad-minZ)/BK));bz<=Math.min(bh-1,Math.floor((o.z+o.d/2+pad-minZ)/BK));bz++){const k=bz*bw+bx;(buckets[k]||(buckets[k]=[])).push(o);}}
 // Buckets with a roof / walk surface / ride ramp nearby: only there can the floor differ from fieldSurfaceHeight.
 const raised=new Uint8Array(bw*bh),mark=(x0,x1,z0,z1)=>{for(let bx=Math.max(0,Math.floor((x0-minX)/BK));bx<=Math.min(bw-1,Math.floor((x1-minX)/BK));bx++)for(let bz=Math.max(0,Math.floor((z0-minZ)/BK));bz<=Math.min(bh-1,Math.floor((z1-minZ)/BK));bz++)raised[bz*bw+bx]=1;};
 for(const r of [...roofs,...world.roofObstacles])mark(r.x-r.w/2-.5,r.x+r.w/2+.5,r.z-r.d/2-.5,r.z+r.d/2+.5);
 for(const r of ramps){const e=r.length+r.width+1;mark(r.x-e,r.x+e,r.z-e,r.z+e);}
 const land=new Uint8Array(N),clutter=new Uint8Array(N),floor=new Float32Array(N),ground=new Float32Array(N),wallH=new Float32Array(N).fill(-1e9),summit=new Uint8Array(N);
 const propBands=new Map(),clutterBy=new Map();
 // groundBlocked(x,z,[]) with shoreline.onIsland's even-odd polygon test done once per row (scanline crossings, the same
 // comparison per edge), which is ~20x faster; checked against groundBlocked itself on random points below.
 const shore=L('lib/town/shoreline.ts'),S=L('lib/town/summitIsle.ts'),C=L('lib/town/coralCay.ts'),D=L('lib/town/landableDecks.ts'),F=L('lib/town/ferryBoarding.ts'),B=sim.ISLAND_BOUNDS;
 const poly=shore.ISLAND_SHORE;
 function rowCrossings(z){const xs=[];for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a.z>z)!==(b.z>z))xs.push((b.x-a.x)*(z-a.z)/(b.z-a.z)+a.x);}return xs;}
 const islandRow=(xs,x)=>{let inside=false;for(const cx of xs)if(x<cx)inside=!inside;return inside;};
 // Coral Cay / Summit / sandbar land only near where a 3 m sample grid found some (dilated one sample each way): skips the
 // causeway / sandbar tests (several us each) on open sea. Features narrower than 3 m could be missed; none exist (the
 // causeway and sandbar stops are many metres wide; the landable decks are always tested).
 const CS=3,cw=Math.ceil((maxX-minX)/CS)+2,ch=Math.ceil((maxZ-minZ)/CS)+2,coarse=new Uint8Array(cw*ch),near=new Uint8Array(cw*ch),xsLand=(x,z)=>S.onSummitGround(x,z)||C.onCayLand(x,z)||S.onSummitLand(x,z);
 for(let a=0;a<cw;a++){const x=minX+a*CS;if(x<200)continue;for(let b=0;b<ch;b++)if(xsLand(x,minZ+b*CS))coarse[b*cw+a]=1;}
 for(let a=0;a<cw;a++)for(let b=0;b<ch;b++)if(coarse[b*cw+a])for(let da=-1;da<=1;da++)for(let db=-1;db<=1;db++){const aa=a+da,bb=b+db;if(aa>=0&&bb>=0&&aa<cw&&bb<ch)near[bb*cw+aa]=1;}
 const nearCay=(x,z)=>near[Math.floor((z-minZ)/CS+.5)*cw+Math.floor((x-minX)/CS+.5)]===1||near[Math.floor((z-minZ)/CS)*cw+Math.floor((x-minX)/CS)]===1;
 const terrainOpen=(x,z,xs)=>{if(x>=200&&nearCay(x,z)&&xsLand(x,z))return true;if(D.onLandableDeck(x,z))return true;
  return (islandRow(xs,x)||F.onFerryBoarding(x,z))&&x>=B.minX&&x<=B.maxX&&z>=B.minZ&&z<=B.maxZ;};
 let seed=12345;const rnd=()=>(seed=(seed*1103515245+12345)%2147483648)/2147483648;for(let k=0;k<1500;k++){const x=minX+rnd()*(maxX-minX),z=minZ+rnd()*(maxZ-minZ);if(terrainOpen(x,z,rowCrossings(z))===sim.groundBlocked(x,z,[],RADIUS))throw new Error('scanline land test disagrees with groundBlocked at '+x+','+z);}
 for(let j=0;j<H;j++){const z=minZ+j*cell,xs=rowCrossings(z);for(let i=0;i<W;i++){const x=minX+i*cell,c=j*W+i;
  if(!terrainOpen(x,z,xs))continue;land[c]=1;
  summit[c]=x>=200&&nearCay(x,z)&&onSummitGround(x,z)?1:0;
  const bk=Math.floor((z-minZ)/BK)*bw+Math.floor((x-minX)/BK);
  ground[c]=fieldSurfaceHeight(x,z);floor[c]=raised[bk]||D.onLandableDeck(x,z)?rooftop.surface(x,z):ground[c];
  const list=buckets[bk];if(!list)continue;
  for(const o of list){if(!sim.insideObstacle(x,z,o,RADIUS))continue;
   if(o.prop){let b=propBands.get(c);if(!b)propBands.set(c,b=[]);b.push(o);}
   else if(o.roof){if(o.roof.height>wallH[c])wallH[c]=o.roof.height;}
   else{clutter[c]=1;if(!clutterBy.has(c))clutterBy.set(c,o.src);}}
 }}
 const tRaster=Date.now()-t0-tLoad;
 const idx=(x,z)=>{const i=Math.round((x-minX)/cell),j=Math.round((z-minZ)/cell);return i<0||j<0||i>=W||j>=H?-1:j*W+i;};
 // Can a walker standing on cell a (at its floor) move to the neighbour b?
 // Stairs: treads are 0.45 m deep, so a 0.5 m grid can skip one and see a 0.6 m rise between neighbours. A rise up to 2*STEP is
 // accepted when the true surface halfway between the two cells is within STEP of both (the tread the grid skipped).
 const cellX=c=>minX+(c%W)*cell,cellZ=c=>minZ+Math.floor(c/W)*cell;
 function canStep(a,b){if(!land[b])return false;const h=floor[a];
  const elevated=h>ground[a]+1;
  if(clutter[b]&&!elevated)return false;
  const bands=propBands.get(b);if(bands)for(const p of bands)if(h>=p.floor-.2&&h<p.top)return false;
  // Walls are tested at the height the walker has once it has stepped onto b (the game moves in small substeps and lifts the
  // walker onto each tread as it goes, so the next tread's padded collider is compared with the tread it stands on).
  const hb=Math.max(h,floor[b]);
  if(summit[a]&&summit[b]&&wallH[b]<=hb+STEP)return true;
  if(floor[b]-h<=STEP)return wallH[b]<=hb+STEP;
  if(floor[b]-h>2*STEP)return false;
  const hm=rooftop.surface((cellX(a)+cellX(b))/2,(cellZ(a)+cellZ(b))/2);
  return hm-h<=STEP&&floor[b]-hm<=STEP&&wallH[b]<=hb+STEP;}
 const NB=[1,-1,W,-W];
 function flood(seeds,reverse=false){const seen=new Uint8Array(N),q=new Int32Array(N);let qh=0,qt=0;
  for(const s of seeds)if(s>=0&&land[s]&&!seen[s]){seen[s]=1;q[qt++]=s;}
  while(qh<qt){const a=q[qh++],ai=a%W;for(const d of NB){const b=a+d;if(b<0||b>=N)continue;if((d===1&&ai===W-1)||(d===-1&&ai===0))continue;if(seen[b])continue;
   if(reverse?canStep(b,a):canStep(a,b)){seen[b]=1;q[qt++]=b;}}}
  return seen;}
 const spawn={x:103,z:-8},spawnCell=idx(spawn.x,spawn.z);
 const reach=flood([spawnCell]);
 const back=flood([spawnCell],true);
 // Components of standable cells (a cell is standable when a walker can be there at all: land, and not inside clutter at its floor).
 const standable=c=>land[c]&&!(clutter[c]&&!(floor[c]>ground[c]+1))&&!(wallH[c]>floor[c]+STEP);
 const comp=new Int32Array(N).fill(-1),comps=[];
 {const q=new Int32Array(N);for(let s=0;s<N;s++){if(comp[s]>=0||!standable(s)||reach[s])continue;const id=comps.length;let qh=0,qt=0;q[qt++]=s;comp[s]=id;let n=0,sx=0,sz=0,minx=1e9,maxx=-1e9,minz=1e9,maxz=-1e9,maxH=-1e9;
  while(qh<qt){const a=q[qh++];n++;const ax=minX+(a%W)*cell,az=minZ+Math.floor(a/W)*cell;sx+=ax;sz+=az;minx=Math.min(minx,ax);maxx=Math.max(maxx,ax);minz=Math.min(minz,az);maxz=Math.max(maxz,az);maxH=Math.max(maxH,floor[a]);const ai=a%W;
   for(const d of NB){const b=a+d;if(b<0||b>=N||(d===1&&ai===W-1)||(d===-1&&ai===0))continue;if(comp[b]>=0||reach[b]||!standable(b))continue;if(canStep(a,b)||canStep(b,a)){comp[b]=id;q[qt++]=b;}}}
  comps.push({id,cells:n,area:n*cell*cell,cx:sx/n,cz:sz/n,minx,maxx,minz,maxz,maxH,sample:{x:minX+(s%W)*cell,z:minZ+Math.floor(s/W)*cell}});}}
 // Height-aware point test with the walking rules (for authored 3D NPC lanes): what stops a walker of `radius` standing at h.
 function blockedAt(x,z,h,radius=RADIUS){const i=Math.floor((x-minX)/BK),j=Math.floor((z-minZ)/BK);if(i<0||j<0||i>=bw||j>=bh)return 'outside';
  const elevated=h>fieldSurfaceHeight(x,z)+1;const hit=[];
  for(const o of buckets[j*bw+i]||[]){if(!sim.insideObstacle(x,z,o,radius))continue;
   if(o.prop){if(h>=o.floor-.2&&h<o.top)return 'roof prop '+o.w.toFixed(2)+'x'+o.d.toFixed(2)+' @'+o.x.toFixed(2)+','+o.z.toFixed(2);}
   else if(o.roof){if(o.roof.height>h+STEP)return 'building/wall (top '+o.roof.height.toFixed(2)+') @'+o.x.toFixed(2)+','+o.z.toFixed(2);}
   else if(!elevated)return 'collider '+o.w.toFixed(2)+'x'+o.d.toFixed(2)+' @'+o.x.toFixed(2)+','+o.z.toFixed(2);}
  return '';}
 // Nearest reachable cell to a point (within r metres); null when none.
 function nearestReach(x,z,r){let best=null,bd=1e9;const n=Math.ceil(r/cell);const ci=Math.round((x-minX)/cell),cj=Math.round((z-minZ)/cell);
  for(let dj=-n;dj<=n;dj++)for(let di=-n;di<=n;di++){const i=ci+di,j=cj+dj;if(i<0||j<0||i>=W||j>=H)continue;const c=j*W+i;if(!reach[c])continue;const d=Math.hypot(di,dj)*cell;if(d<=r&&d<bd){bd=d;best={x:minX+i*cell,z:minZ+j*cell,d,height:floor[c]};}}
  return best;}
 const tFlood=Date.now()-t0-tLoad-tRaster;
 let reachCount=0,standCount=0;for(let c=0;c<N;c++){if(reach[c])reachCount++;if(standable(c))standCount++;}
 return {env,world,sim,L,cell,minX,minZ,W,H,N,land,clutter,clutterBy,floor,ground,wallH,summit,reach,back,comp,comps,idx,canStep,standable,nearestReach,blockedAt,flood,spawn,spawnCell,reachCount,standCount,rooftop,ramps,timing:{load:tLoad,raster:tRaster,flood:tFlood}};
}
module.exports={analyse,STEP,RADIUS};
