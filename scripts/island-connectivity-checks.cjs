// The checks run on top of island-connectivity-core.cjs: landmarks (doors, jobs, NPCs, venues, shops, vending, ball-hunt and
// bug-squad spots, ferry / pier / Cay / Summit points), authored NPC routes, path strips and their ends, the traffic network.
// Returns plain data; scripts/audit-island-connectivity.cjs formats it, tests/island-connectivity.cjs asserts on it.
const {analyse}=require('./island-connectivity-core.cjs');
const tryLoad=(a,rel,pick)=>{try{return pick(a.L(rel));}catch(e){return {error:rel+': '+e.message};}};
function landmarks(a){
 const out=[],add=(group,name,x,z,r,extra={})=>{if(Number.isFinite(x)&&Number.isFinite(z))out.push({group,name,x,z,r,...extra});};
 const w=a.world,V=a.env.venues;
 for(const d of w.destinations)add('destination',d.name,d.x,d.z,4);
 // Doors: the entry point the game measures from (front face + a step out for the authored building fronts).
 add('door','Arcade door',V.ARCADE_DOOR.x,V.ARCADE_DOOR.z,1.5);add('door','Konbini (Island Square) store door',V.STORE_DOOR.x,V.STORE_DOOR.z,1.5);add('door','Coaches Centre door',V.COACHES_DOOR.x,V.COACHES_DOOR.z,1.5);
 if(w.squareArrival)add('door','Island Square arrival',w.squareArrival.x,w.squareArrival.z,1.5);
 tryLoad(a,'lib/museum/museumDoors.ts',m=>add('door','History Museum door',m.MUSEUM_DOOR.x,m.MUSEUM_DOOR.front+.8,1.5));
 tryLoad(a,'lib/shop/shopDoors.ts',m=>add('door','Kit Shop door',m.SHOP_DOOR.x,m.SHOP_DOOR.front+.8,1.5));
 tryLoad(a,'lib/town/coralCay.ts',m=>{add('door','Coral Cay Konbini door',m.CAY_KONBINI_DOOR.x,m.CAY_KONBINI_DOOR.z+.8,1.5);add('cay','Coral Cay arrival',m.CORAL_CAY_ARRIVAL.x,m.CORAL_CAY_ARRIVAL.z,2);add('cay','Coral Cay plaza',m.CAY_PLAZA.x,m.CAY_PLAZA.z,4);});
 tryLoad(a,'lib/town/vendingPlaces.ts',m=>{add('door','Island Square Konbini front',m.ISLAND_SQUARE_KONBINI.x,m.ISLAND_SQUARE_KONBINI.front+.8,1.5);
  for(const [k,s] of Object.entries(m.cayVendingSpots||{}))add('vending','Cay vending '+k,s.x,s.z,2);try{const s=m.summitSnackSpot();add('vending','Summit snack machine',s.x,s.z,2);}catch{}});
 for(const v of V.VENUES){add('field',v.name+' centre',v.x,v.z,3);try{const e=V.venueEntrance(v);add('field',v.name+' entrance',e.x,e.z,2);}catch{}}
 tryLoad(a,'lib/town/jobs/jobCatalog.ts',m=>{for(const j of m.JOBS){add('job',j.title+' board',j.board.x,j.board.z,2.5);if(j.deliver)add('job',j.title+' drop-off ('+j.deliver.label+')',j.deliver.x,j.deliver.z,2.5);
  (j.targets||[]).forEach((t,i)=>add('job-target',j.title+' target '+(i+1),t.x,t.z,j.swing?6:2.5));}});
 tryLoad(a,'lib/town/jobs/bugSpecies.ts',m=>(m.BUG_JOB_SPOTS||[]).forEach((s,i)=>add('bug-squad','Bug squad spot '+(i+1),s.x,s.z,2.5)));
 tryLoad(a,'lib/town/jobs/garden.ts',m=>(m.GARDEN_SPOTS||[]).forEach((s,i)=>add('job-target','Garden spot '+(i+1),s.x,s.z,2.5)));
 const npcs=new Map();
 tryLoad(a,'lib/town/npcDialogues.ts',m=>m.NPC_DIALOGUES.forEach(n=>npcs.set(n.id,n)));
 tryLoad(a,'lib/town/townsfolkCast.ts',m=>m.TOWNSFOLK_CAST.forEach(n=>npcs.set(n.id,n)));
 tryLoad(a,'lib/town/practiceNpcs.ts',m=>m.PRACTICE_NPCS.forEach(n=>npcs.set(n.id,n)));
 tryLoad(a,'lib/town/courtFreestylers.ts',m=>m.COURT_FREESTYLERS.forEach(n=>npcs.set(n.id,n)));
 // An NPC is placed at the nearest walkable point within 12 m (islandNpcs.ts); the player talks from about 3 m.
 // A posed NPC (seat, lie, work spot) stays exactly where it is authored: the player must reach it within talking range. A walking
 // one is moved by the placement search to the nearest walkable point within 12 m, so it only needs walkable ground that near.
 // Boat crews (boat-*) stand on moored boats out at sea and are reached by boat, not on foot.
 for(const n of npcs.values()){const fixed=!!(n.pose||n.floor||n.seat||n.activity||n.freestyle!==undefined);add(n.id.startsWith('boat-')?'boat-crew':'npc',n.name+' ('+n.id+')',n.x,n.z,fixed?3.5:12,{fixed});}
 tryLoad(a,'lib/town/coinQuest.ts',m=>m.COIN_QUEST.forEach(s=>add('ball-hunt',s.name+' ['+s.id+', '+s.kind+']',s.x,s.z,3,{y:s.y,kind:s.kind})));
 tryLoad(a,'lib/town/eastPier.ts',m=>{add('pier','East Pier fisher spot',m.EAST_PIER_NPC_SPOTS.fisher.x,m.EAST_PIER_NPC_SPOTS.fisher.z,2);add('pier','East Pier kid spot',m.EAST_PIER_NPC_SPOTS.kid.x,m.EAST_PIER_NPC_SPOTS.kid.z,2);add('pier','East Pier kick spot',m.PIER_KICK_SPOT.x,m.PIER_KICK_SPOT.z,2);});
 tryLoad(a,'lib/town/ferryBoarding.ts',m=>{add('ferry','Ferry ramp',m.FERRY_RAMP.x,m.FERRY_RAMP.z,2);add('ferry','Ferry deck',m.FERRY_DECK.x,m.FERRY_DECK.z,4);});
 tryLoad(a,'lib/town/summitIsle.ts',m=>add('summit','Summit peak terrace',m.SUMMIT_PEAK.x,m.SUMMIT_PEAK.z,5));
 tryLoad(a,'lib/town/fishing/fishCatalog.ts',m=>m.FISH_SPOTS.filter(s=>!s.boat).forEach(s=>add('fishing','Fishing spot '+s.name,s.x,s.z,2)));
 // Vending machines Town.tsx adds (their collider centres): the player must reach the front within ~2 m.
 a.env.extraObstacles.forEach((o,i)=>add('vending','Vending/kiosk collider '+(i+1)+' @'+o.x.toFixed(1)+','+o.z.toFixed(1),o.x,o.z,Math.max(o.w,o.d)/2+1.6));
 return out;
}
function checkLandmarks(a){
 const res=[];for(const l of landmarks(a)){const n=a.nearestReach(l.x,l.z,l.r);let why='';
  if(!n){const c=a.idx(l.x,l.z),near=a.nearestReach(l.x,l.z,40);
   why=c<0?'outside grid':!a.land[c]?'in water / off land':a.floor[c]>a.ground[c]+1?'raised (roof / deck '+a.floor[c].toFixed(1)+' m)':a.clutter[c]?'inside a collider':a.wallH[c]>a.floor[c]+.35?'inside a building':a.comp[c]>=0?'on a walk area cut off from the spawn':'unreachable';
   res.push({...l,ok:false,why,nearest:near?{x:near.x,z:near.z,d:+near.d.toFixed(1)}:null});}
  else res.push({...l,ok:true,d:n.d});}
 return res;}
// Authored NPC routes (cafeRoutes.ts) are walked with their own travel test (onCafeRoute), not safeNpcPath: every leg is sampled
// every 0.25 m at its own height with the walking rules (blockedAt), at a slim 0.2 m body radius (an NPC, not the player's .32).
function checkRoutes(a){const out=[];const m=tryLoad(a,'lib/town/cafeRoutes.ts',x=>x);if(m.error)return [{error:m.error}];
 for(const [id,route] of Object.entries(m.CAFE_NPC_ROUTES)){const seen=new Set();route.forEach((p,i)=>{const q=route[(i+1)%route.length];const L=Math.hypot(q.x-p.x,q.z-p.z);
  for(let t=0;t<=L;t+=.25){const f=L?t/L:0,x=p.x+(q.x-p.x)*f,z=p.z+(q.z-p.z)*f,y=p.y+(q.y-p.y)*f,why=a.blockedAt(x,z,y,.2);if(why&&!seen.has(why)){seen.add(why);out.push({id,leg:i,x:+x.toFixed(2),z:+z.toFixed(2),y:+y.toFixed(2),problem:why});break;}}});}
 return out;}
// Path strips (surfaceAreas kind 'path'): share of the strip reachable, and each short end: is there walkable reachable ground
// 0.75 m past it (a path that runs into water, a wall or a prop is a dead end).
function checkPaths(a){const out=[];for(const p of a.world.surfaceAreas.filter(s=>s.kind==='path')){let n=0,r=0;
  let covered=0;for(let x=p.x-p.w/2+.25;x<p.x+p.w/2;x+=.5)for(let z=p.z-p.d/2+.25;z<p.z+p.d/2;z+=.5){const c=a.idx(x,z);if(c<0)continue;n++;if(a.reach[c])r++;if(a.floor[c]>1&&!a.summit[c])covered++;}
  // A ground path drawn under a deck or building (most of it below a surface over 1 m up) is hidden: not walked, not judged.
  if(n&&covered/n>.5){out.push({x:p.x,z:p.z,w:p.w,d:p.d,cells:n,reached:r,share:r/n,ends:[],pinch:null,hidden:true});continue;}
  const along=p.w>=p.d?'x':'z',ends=[];
  for(const s of [-1,1]){const ex=along==='x'?p.x+s*(p.w/2+.75):p.x,ez=along==='z'?p.z+s*(p.d/2+.75):p.z,half=(along==='x'?p.d:p.w)/2;let open=0,k=0,cause=new Set();
   for(let u=-half+.25;u<half;u+=.5){k++;const x=along==='x'?ex:ex+u,z=along==='z'?ez:ez+u,c=a.idx(x,z);if(c>=0&&a.reach[c])open++;else if(c<0||!a.land[c])cause.add('water');else if(a.clutter[c]){const o=a.clutterBy.get(c);cause.add('collider '+o.w.toFixed(2)+'x'+o.d.toFixed(2)+' @'+o.x.toFixed(1)+','+o.z.toFixed(1));}else if(a.wallH[c]>a.floor[c]+.35||a.wallH[c]>-1e8&&a.floor[c]>=a.wallH[c]-.01)cause.add('building');else cause.add('unreached');}
   // A path ending at a building or a hut / house collider (4 m and wider) is a doorstep, not a dead end.
   const doorstep=!open&&[...cause].every(c=>c==='building'||/^collider (\d+\.\d+)x(\d+\.\d+)/.test(c)&&Math.min(...c.match(/(\d+\.\d+)x(\d+\.\d+)/).slice(1).map(Number))>=4);
   ends.push({x:+ex.toFixed(2),z:+ez.toFixed(2),open,of:k,cause:[...cause].slice(0,3),doorstep});}
  // Pinches: along the strip, every 0.5 m cross-section's widest run of reachable ground (a prop in the middle of a walkway).
  const width=along==='x'?p.d:p.w,len=along==='x'?p.w:p.d;let pinch=null;
  for(let v=-len/2+.25;v<len/2;v+=.5){let best=0,run=0,cause='';for(let u=-width/2+.25;u<width/2;u+=.5){const x=along==='x'?p.x+v:p.x+u,z=along==='x'?p.z+u:p.z+v,c=a.idx(x,z);if(c>=0&&a.reach[c]){run+=.5;best=Math.max(best,run);}else{run=0;if(c>=0&&a.clutter[c]&&!cause){const o=a.clutterBy.get(c);cause='collider '+o.w.toFixed(2)+'x'+o.d.toFixed(2)+' @'+o.x.toFixed(2)+','+o.z.toFixed(2);}}}
   if(cause&&best<Math.min(1.5,width*.5)&&(!pinch||best<pinch.open)){const px=along==='x'?p.x+v:p.x,pz=along==='x'?p.z:p.z+v,pc=a.idx(px,pz);pinch={x:+px.toFixed(2),z:+pz.toFixed(2),open:best,width,cause,raised:pc>=0&&a.floor[pc]>a.ground[pc]+1};}}
  out.push({x:p.x,z:p.z,w:p.w,d:p.d,cells:n,reached:r,share:n?r/n:1,ends,pinch});}
 return out;}
function checkRoads(a){const out={nodes:0,deadEnds:[],unwalkable:[]};const m=tryLoad(a,'lib/town/roadNetwork.ts',x=>x);if(m.error)return {error:m.error};
 const nodes=m.buildRoadNetwork(a.world.roads);
 // The Coral Cay ring joins the same graph at runtime (streetTraffic.ts): include it so a lane ending in nothing shows up.
 try{const cay=a.L('lib/town/cayTraffic.ts').extendRoadNetworkWithCay(nodes);out.cayRing=cay?cay.ring.length:0;}catch(e){out.cayError=e.message;}
 out.nodes=nodes.length;out.offLand=[];
 // The causeway link is drawn along CAUSEWAY_PATH (the winding causeway), not the straight chord: check those samples instead.
 let causeway=null;try{const C=a.L('lib/town/coralCay.ts');causeway={x0:C.CAUSEWAY.roadStart,x1:C.CAUSEWAY_PATH[C.CAUSEWAY_PATH.length-1].x};let off=0,unreached=0;for(const q of C.CAUSEWAY_PATH){const c=a.idx(q.x,q.z);if(c<0||!a.land[c])off++;else if(!a.reach[c]){unreached++;(out.causewayUnreached=out.causewayUnreached||[]).push({x:+q.x.toFixed(1),z:+q.z.toFixed(1),why:a.clutter[c]?'collider '+JSON.stringify(a.clutterBy.get(c)):'h'+a.floor[c]});}}out.causeway={samples:C.CAUSEWAY_PATH.length,offLand:off,unreached};}catch(e){out.causewayError=e.message;}
 for(const n of nodes)for(const l of n.links){if(l<n.id)continue;const b=nodes[l];if(causeway&&Math.abs(n.z-b.z)<.01&&Math.abs(n.z+159)<.01&&Math.min(n.x,b.x)<=230&&Math.max(n.x,b.x)>=400)continue;const L=Math.hypot(b.x-n.x,b.z-n.z);let bad=0,k=0;for(let t=0;t<=L;t+=1){const c=a.idx(n.x+(b.x-n.x)*t/L,n.z+(b.z-n.z)*t/L);k++;if(c<0||!a.land[c])bad++;}if(bad)out.offLand.push({from:{x:+n.x.toFixed(1),z:+n.z.toFixed(1)},to:{x:+b.x.toFixed(1),z:+b.z.toFixed(1)},offLandM:bad});}
 const seen=new Set(),stack=nodes.length?[nodes[0].id]:[];while(stack.length){const id=stack.pop();if(seen.has(id))continue;seen.add(id);for(const l of nodes[id].links)stack.push(l);}
 out.components=seen.size===nodes.length?1:'split ('+seen.size+' of '+nodes.length+' nodes linked to the first)';
 for(const n of nodes)if(n.links.length<2)out.deadEnds.push({x:n.x,z:n.z,links:n.links.length});
 for(const r of a.world.roads){let k=0,bad=0;for(let t=-.5;t<=.5;t+=.05){const x=r.vertical?r.x:r.x+t*r.w,z=r.vertical?r.z+t*r.d:r.z,c=a.idx(x,z);k++;if(c<0||!a.reach[c])bad++;}if(bad/k>.15)out.unwalkable.push({x:r.x,z:r.z,w:r.w,d:r.d,share:+(1-bad/k).toFixed(2)});}
 return out;}
function checkTraps(a){const real=c=>a.reach[c]&&!a.back[c]&&a.standable(c);// Reached on foot but no walk back to the spawn (a drop into a pit or off a ledge with no way up).
 let n=0;const seenComp=new Set(),list=[];for(let c=0;c<a.N;c++)if(real(c))n++;
 // group trap cells coarsely (4 m tiles) for a readable list
 const tiles=new Map();for(let c=0;c<a.N;c++)if(real(c)){const x=a.minX+(c%a.W)*a.cell,z=a.minZ+Math.floor(c/a.W)*a.cell,k=Math.floor(x/8)+':'+Math.floor(z/8);const t=tiles.get(k)||{x,z,n:0,h:a.floor[c]};t.n++;tiles.set(k,t);}
 return {cells:n,area:n*a.cell*a.cell,tiles:[...tiles.values()].filter(t=>t.n*a.cell*a.cell>=1).sort((p,q)=>q.n-p.n).slice(0,25).map(t=>({x:t.x,z:t.z,area:t.n*a.cell*a.cell,height:+t.h.toFixed(2)}))};}
function groundComponents(a,minArea=2){const g=new Map();for(let c=0;c<a.N;c++){const id=a.comp[c];if(id<0)continue;const e=g.get(id)||{n:0,low:0};e.n++;if(a.floor[c]<=a.ground[c]+.5)e.low++;g.set(id,e);}
 const ground=[],roofs=[];for(const c of a.comps){if(c.area<minArea)continue;const e=g.get(c.id);(e.low/e.n>.5?ground:roofs).push(c);}
 ground.sort((p,q)=>q.area-p.area);roofs.sort((p,q)=>q.area-p.area);return {ground,roofs};}
async function runChecks(opts={}){const a=await analyse(opts);
 return {a,landmarks:checkLandmarks(a),routes:checkRoutes(a),paths:checkPaths(a),roads:checkRoads(a),traps:checkTraps(a),components:groundComponents(a)};}
module.exports={runChecks};
