// Summit Isle (Oct 12 2026): the medium island south of Coral Cay with a green 50 m peak (the Summit 5s on its top, concave slopes
// with spurs and gullies), joined to the cay by a slim sandbar; the whole map rectangle flyable. Walkable where gentle; reached on
// foot up the carved trail; solid to walkers, the jetpack and the ball; the free-play goals; the follow camera's pull-in; the build
// itself; the heat wiring.
const assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const loaded=new Map();function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const mod={exports:{}};loaded.set(file,mod.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:mod.exports,module:mod,Math,Map,Set,Uint8Array,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});loaded.set(file,mod.exports);return mod.exports;}
const S=load('lib/town/summitIsle.ts'),cay=load('lib/town/coralCay.ts');
const {stepPlayer,blocked,flightBlocked,FLIGHT_BOUNDS}=load('lib/town/simulation.ts'),{onLand,distanceToLand}=load('lib/town/landmass.ts'),{fieldSurfaceHeight}=load('lib/town/venues.ts');
const {GRID}=load('lib/analytics/islandIds.ts');
const C=S.SUMMIT_CENTER,H=S.SUMMIT_HEIGHT;

// ---- Shape: medium (between Coral Cay and the main island), where the user drew it, south of the cay.
const area=pts=>Math.abs(pts.reduce((sum,p,i)=>{const q=pts[(i+1)%pts.length];return sum+p.x*q.z-q.x*p.z;},0)/2);
const isle=area(S.SUMMIT_SHORE),cayArea=area(cay.CAY_SHORE);
assert(isle>cayArea*1.4&&isle<cayArea*2.6,`medium island: ${Math.round(isle)} m² vs Coral Cay ${Math.round(cayArea)} m²`);
assert(S.SUMMIT_BOX.minX>460&&S.SUMMIT_BOX.maxX<825&&S.SUMMIT_BOX.minZ>0&&S.SUMMIT_BOX.maxZ<260,'inside the drawn outline');
for(const p of S.SUMMIT_SHORE)assert(!cay.onCay(p.x,p.z)&&distanceToLand(p.x,p.z)<1.5,'its own coast, clear of Coral Cay');

// ---- Ground: 0 at the water; a green peak whose top is a flat just big enough for the pitch, its fence and a walkway, the slopes
// falling away from its edge (a rounded shoulder, then one long concave sweep with spurs and gullies down to the beaches);
// walkable only where gentle.
const PK=S.SUMMIT_PEAK;
assert.equal(S.summitGround(PK.x,PK.z),H);assert(H>=45,'a tall peak');
assert.equal(fieldSurfaceHeight(S.TERRACE.x,S.TERRACE.z),H,'the walked floor is the mountain');
assert.equal(fieldSurfaceHeight(103,-8),0,'the main island is untouched');
{let flat=0,maxH=0;for(let x=S.SUMMIT_BOX.minX;x<S.SUMMIT_BOX.maxX;x+=1)for(let z=S.SUMMIT_BOX.minZ;z<S.SUMMIT_BOX.maxZ;z+=1){const h=S.summitGround(x,z);maxH=Math.max(maxH,h);if(h>=H-1e-9)flat++;}
 const T=S.TERRACE,F=S.SUMMIT_FENCE;assert(maxH<=H+1e-9,'the summit is the highest point');assert.equal(S.PITCH_HEIGHT,H,'the pitch is on the summit');
 assert(flat<=4*T.a*T.b&&T.a-F.halfX<=4.5&&T.b-F.halfZ<=4.5,`a tight summit flat round the pitch (${flat} m²), not a table-top`);
 for(let d=0;d<360;d+=15){const a=d*Math.PI/180,re=S.summitEdgeRadius(a),x=T.x+Math.cos(a)*(re+20),z=T.z+Math.sin(a)*(re+20),x1=T.x+Math.cos(a)*(re+1.5),z1=T.z+Math.sin(a)*(re+1.5);
  assert(S.summitGround(x,z)<H-3,`the slope falls away from the flat at ${d}°`);assert(S.summitGround(x1,z1)>H-.6||S.SUMMIT_PATHS.some(p=>p.some(q=>Math.hypot(q.x-x1,q.z-z1)<5)),`a rounded shoulder, not a table edge, at ${d}°`);}}
for(let u=.05;u<1;u+=.05)assert(S.profileAt(u)<S.profileAt(u-.05)||u<.03,'the profile falls all the way down');
// A domed top (steepening away from the summit), then a concave sweep easing out to the beach.
for(const u of [.1,.2]){const d1=S.profileAt(u-.05)-S.profileAt(u),d2=S.profileAt(u)-S.profileAt(u+.05);assert(d1<d2,`domed at ${u}`);}
for(const u of [.5,.6,.7,.8]){const d1=S.profileAt(u-.05)-S.profileAt(u),d2=S.profileAt(u)-S.profileAt(u+.05);assert(d1>d2,`concave at ${u}`);}
{const vals=[];for(let d=0;d<360;d+=2){const p=S.peakPoint(d*Math.PI/180,.4);if(S.terraceWeight(p.x,p.z)>0)continue;vals.push(S.summitGround(p.x,p.z));}assert(Math.max(...vals)-Math.min(...vals)>=6,'spurs and gullies give real relief');}
let walkSteep=0,bankSteep=0,cells=0,steepBlocked=0,steep=0;const trailPts=S.SUMMIT_PATHS.flatMap(p=>p.slice(1).flatMap((q,i)=>{const a=p[i],n=Math.ceil(Math.hypot(q.x-a.x,q.z-a.z));return Array.from({length:n},(_,k)=>({x:a.x+(q.x-a.x)*k/n,z:a.z+(q.z-a.z)*k/n}));}));
const nearTrailBank=(x,z)=>trailPts.some(q=>Math.abs(q.x-x)<9&&Math.abs(q.z-z)<9&&Math.hypot(q.x-x,q.z-z)<8.6);
for(let x=S.SUMMIT_BOX.minX;x<S.SUMMIT_BOX.maxX;x+=1.5)for(let z=S.SUMMIT_BOX.minZ;z<S.SUMMIT_BOX.maxZ;z+=1.5){const h=S.summitGround(x,z);assert(h>=0&&h<=H+1e-9);
 const sl=S.summitSlope(x,z);if(sl>(nearTrailBank(x,z)?S.SUMMIT_TRAIL_BANK_SLOPE+.05:.7)&&h>1){steep++;if(!S.onSummitIsle(x,z))steepBlocked++;}
 if(!S.onSummitIsle(x,z))continue;cells++;if(nearTrailBank(x,z))bankSteep=Math.max(bankSteep,sl);else walkSteep=Math.max(walkSteep,sl);}
assert(cells>15000,'sampled the island');
assert(walkSteep<=S.SUMMIT_WALK_SLOPE+1e-9,`every walkable spot is gentler than the walk limit (${walkSteep.toFixed(3)})`);
// A trail's own cut and fill banks may be a little steeper (Oct 13 2026: never walled in; you can step or ride off it anywhere).
assert(bankSteep<=S.SUMMIT_TRAIL_BANK_SLOPE+1e-9,`trail banks within their limit (${bankSteep.toFixed(3)})`);
assert(steep>200&&steepBlocked===steep,'the steep upper slopes cannot be walked');
for(let a=0;a<Math.PI*2;a+=.05){const r=S.coastRadius(a);assert(S.summitGround(C.x+Math.cos(a)*(r+.5),C.z+Math.sin(a)*(r+.5))===0,'sea level past the coast');
 assert(S.summitGround(C.x+Math.cos(a)*(r-3),C.z+Math.sin(a)*(r-3))<.1,'a beach at the water');}
{const nearTrail=(x,z)=>S.SUMMIT_PATHS.some(path=>path.some(q=>Math.hypot(q.x-x,q.z-z)<7));
 for(let a=0;a<Math.PI*2;a+=.1){const p=S.heightPoint(a,3);if(S.onSummitIsle(p.x,p.z)||nearTrail(p.x,p.z))continue;assert(false,`walkable foothills at ${(a*180/Math.PI).toFixed(0)}°`);}}
// The pitch, its run-off and the fence stand on the flat terrace, with a walkway outside the fence.
const P=S.SUMMIT_PITCH,F=S.SUMMIT_FENCE;
for(const sx of [-1,1])for(const sz of [-1,1])assert.equal(S.summitGround(P.x+sx*(F.halfX+1),P.z+sz*(F.halfZ+1)),S.PITCH_HEIGHT,'a walkway round the fence');
assert(P.length>=30&&P.length<=40&&P.width>=18&&P.width<=25,'small-sided pitch size');

// ---- Walk from Coral Cay across the sandbar, along the foothills, up the switchback trail and through the gate onto the pitch.
{const p={x:607,z:-84},v={x:0,z:0};assert(cay.onCay(p.x,p.z)&&!blocked(p.x,p.z,[]),'start on the cay beach');
 const route=[...S.SANDBAR_PATH.map(q=>({x:q.x,z:q.z})),...S.SUMMIT_PATHS[0],...S.SUMMIT_PATHS[1],S.SUMMIT_LANDMARKS.gate,{x:P.x,z:P.z+4}];
 for(const target of route){for(let i=0;i<60*20&&Math.hypot(target.x-p.x,target.z-p.z)>.5;i++){const d=Math.hypot(target.x-p.x,target.z-p.z);stepPlayer(p,v,{x:(target.x-p.x)/d,z:(target.z-p.z)/d,sprint:false},1/60,S.SUMMIT_OBSTACLES);}
  assert(Math.hypot(target.x-p.x,target.z-p.z)<=.5,`walked to ${target.x.toFixed(1)},${target.z.toFixed(1)} (stuck at ${p.x.toFixed(1)},${p.z.toFixed(1)})`);}
 assert.equal(fieldSurfaceHeight(p.x,p.z),S.PITCH_HEIGHT,'on the Summit 5s');}
// Solid ground: walkers (and sprinters) heading straight for the summit from every side follow the surface up (never stepping up
// through it: a walker's height is the surface, and it never jumps). Since Oct 13 2026 (user: "still stuck and can't go up the
// mountain", "some areas can't go down") the grass is never a wall: they reach the top (the hill assist in rooftopTravel turns
// steep climbs across the slope; stepPlayer alone, here, goes straight up).
for(let d=0;d<360;d+=10){const a=d*Math.PI/180,start=S.heightPoint(a,2),p={x:start.x,z:start.z},v={x:0,z:0};let prev=S.summitGround(p.x,p.z),jump=0;
 for(let i=0;i<60*40;i++){const dx=PK.x-p.x,dz=PK.z-p.z,l=Math.hypot(dx,dz)||1;stepPlayer(p,v,{x:dx/l,z:dz/l,sprint:i%2===0},1/60,[]);const h=S.summitGround(p.x,p.z);jump=Math.max(jump,h-prev);prev=h;}
 assert(prev>=H-1,`walking at the summit from ${d}° reaches the top (${prev.toFixed(1)} m)`);assert(jump<.5,`no step up through the ground from ${d}° (${jump.toFixed(2)} m)`);}
// The walking ball and a drifting parachute meet the mountain where its surface stands above them.
{const p=S.peakPoint(-Math.PI/2,.12),g=S.summitGround(p.x,p.z);assert(S.summitSolid(p.x,p.z,g-2)&&!S.summitSolid(p.x,p.z,g+1)&&!S.summitSolid(103,-8,0),'solid below its surface only');}
for(const q of S.SANDBAR_PATH)assert(onLand(q.x,q.z)&&!blocked(q.x,q.z,[]),'the whole sandbar is walkable');
{const q=S.SANDBAR_PATH[25];assert(!onLand(q.x+6,q.z)&&!onLand(q.x-6,q.z),'a slim sandbar: sea 6 m either side of its middle');
 assert(S.sandbarHalfWidth(q.s)<=3.5&&S.sandbarHalfWidth(q.s)-.8>=1.5,'3–5 m of walkable sand');}
for(const path of S.SUMMIT_PATHS){let rise=0,len=0;for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],d=Math.hypot(b.x-a.x,b.z-a.z),dh=Math.abs(S.summitGround(b.x,b.z)-S.summitGround(a.x,a.z));rise+=dh;len+=d;assert(dh/(d||1)<=S.SUMMIT_WALK_SLOPE,'paths stay within the walk limit');}
 assert(rise/len<.2,'paths climb gently on average');
 for(const q of path)assert(S.onSummitIsle(q.x,q.z),'every path point is walkable');}
// The fence keeps players (and the walking ball, which uses the same obstacles) on the pitch, except through the gate.
{const p={x:P.x,z:P.z},v={x:0,z:0};for(let i=0;i<60*8;i++)stepPlayer(p,v,{x:-1,z:0,sprint:false},1/60,S.SUMMIT_OBSTACLES);assert(p.x>P.x-F.halfX,'the west fence stops you');}
assert(blocked(P.x-F.halfX,P.z,S.SUMMIT_OBSTACLES,.19)&&blocked(P.x,P.z-F.halfZ,S.SUMMIT_OBSTACLES,.19)&&!blocked((F.gate.x0+F.gate.x1)/2,P.z+F.halfZ,S.SUMMIT_OBSTACLES,.19),'fence solid, gate open');
// The follow camera dollies in rather than looking through rock.
assert.equal(S.summitCameraPull(103,-8,0,121,23,22),1,'no change away from the island');
{const p=S.heightPoint(-Math.PI/2,14),h=S.summitGround(p.x,p.z);assert(S.summitCameraPull(p.x,p.z,h,p.x+18,h+23,p.z+30)<1,'pulled in on the north slopes, with the peak between camera and player');}

// ---- Free-play goals (Town's walking ball): between the posts and under the bar counts; wide or over does not.
{const gx=P.x-P.length/2,y=S.PITCH_HEIGHT;assert(S.summitGoalCrossed({x:gx+1,z:P.z},{x:gx-.3,z:P.z+.5},y+.5),'a shot into the west goal');
 assert(!S.summitGoalCrossed({x:gx+1,z:P.z+4},{x:gx-.3,z:P.z+4},y+.5),'wide of the post');
 assert(!S.summitGoalCrossed({x:gx+1,z:P.z},{x:gx-.3,z:P.z},y+P.goalHeight+.4),'over the bar');
 assert(!S.summitGoalCrossed({x:100,z:0},{x:100,z:-1},.3),'nowhere near');}

// ---- Flight: the island and ~45 m of sea round it are flyable; the border stays inside the maps' extent and heat-map grid.
for(const p of S.SUMMIT_SHORE)assert(!flightBlocked(p.x,p.z),'the coast is flyable');
for(let a=0;a<Math.PI*2;a+=.1){const r=S.coastRadius(a),x=C.x+Math.cos(a)*(r+40),z=C.z+Math.sin(a)*(r+40);assert(!flightBlocked(x,z),`40 m off the beach (${x.toFixed(0)},${z.toFixed(0)}) is flyable`);}
for(const [x,z] of [[870,140],[820,305],[650,302],[862,260]])assert(flightBlocked(x,z),`beyond the new border (${x},${z})`);
assert(FLIGHT_BOUNDS.maxX<=864&&FLIGHT_BOUNDS.maxZ<=300,'map extent unchanged');
assert(GRID.x0+GRID.cols*GRID.size>=FLIGHT_BOUNDS.maxX&&GRID.z0+GRID.rows*GRID.size>=FLIGHT_BOUNDS.maxZ,'the heat-map grid still covers the flyable world');

// ---- Wiring and heat: one ground material, its own region gate, shore bake bounds, maps.
{const src=fs.readFileSync('lib/town/summitIsleWorld.ts','utf8'),world=fs.readFileSync('lib/town/world.ts','utf8'),shore=fs.readFileSync('lib/graphics/islandShore.ts','utf8');
 assert.equal((src.match(/new T\.MeshStandardMaterial/g)||[]).length,2,'two vertex-colour materials: ground (no shadows cast) and baked props');
 assert(/castShadow=false;m\.receiveShadow=true;town\.add\(m\)/.test(src)&&/m\.castShadow=true;m\.receiveShadow=true;town\.add\(m\)/.test(src),'ground receives shadows only; props cast them');
 assert(!/requestAnimationFrame|setInterval|update\(/.test(src),'no per-frame work');
 assert(world.includes('buildSummitIsle(')&&world.includes('isleRegion')&&world.includes('summitIsle.lampSites')&&world.includes('...summitIsle.materials'),'built in buildTown, gated by its own region box, lamps join the night pools');
 const m=shore.match(/MIN_X=(-?\d+),MIN_Z=(-?\d+),SIZE_X=(\d+),SIZE_Z=(\d+)/);const [,x0,z0,sx,sz]=m.map(Number);
 assert(x0+sx>=S.SUMMIT_BOX.maxX+20&&z0+sz>=S.SUMMIT_BOX.maxZ+20&&sx%2===0&&sz%2===0,'the shore bake covers the island and its shallows');
 const map=fs.readFileSync('components/IslandOverview.tsx','utf8');assert(map.includes('<SummitIsleMap'),'drawn on both maps');
 // The Summit 5s is a travel destination on the map (Oct 13 2026, user: "make the 5v5 field clickable to be transported there"):
 // the destination helper's button props on the pitch group, a padded tap area, and Town moving the player to the gate.
 {const sm=fs.readFileSync('components/SummitIsleMap.tsx','utf8'),town=fs.readFileSync('components/Town.tsx','utf8');
  assert(/MapDestination=[^;]*'summit'/.test(map)&&map.includes("pitchProps={destination('summit','Summit 5s')}"),'Summit 5s is a map destination ("Travel to Summit 5s")');
  assert(sm.includes('{...pitchProps}')&&sm.includes('pitch-tap'),'the pitch group carries the button props and a padded tap area');
  assert(town.includes("destination==='summit'||destination==='shop')go(destination)")&&town.includes("travel.current==='summit'?SUMMIT_LANDMARKS.gate"),'Town travels to the summit gate');
  const g=S.SUMMIT_LANDMARKS.gate;assert(S.onSummitIsle(g.x,g.z)&&!blocked(g.x,g.z,S.SUMMIT_OBSTACLES,.5),'the gate is walkable ground outside the fence');}
 assert(!/^import /m.test(fs.readFileSync('lib/town/coralCay.ts','utf8')),'coralCay.ts stays import-free (tests load it on its own)');
 const town=fs.readFileSync('components/Town.tsx','utf8');assert(town.includes('summitGoalCrossed(previousBall,orb,walkBall.state.y)'),'free-play goals counted');}
// ---- Flying: the jetpack at its 28 m cruise rises smoothly over the 50 m peak and settles back down after it (smoothness in
// detail: tests/summit-flight-smooth.cjs).
{const dt=1/30;for(const deg of [0,30,60,90,120,150,180,210,240,270,300,330])for(const base of [12,28,40]){const lift=S.createSummitFlightLift(),a=deg*Math.PI/180;let x=S.SUMMIT_PEAK.x-Math.cos(a)*230,z=S.SUMMIT_PEAK.z-Math.sin(a)*230,worst=Infinity,top=0,maxRate=0,prev=base;
  for(let i=0;i<30*22;i++){x+=Math.cos(a)*34*dt;z+=Math.sin(a)*34*dt;const h=base+lift.update(x,z,Math.cos(a)*34,Math.sin(a)*34,base,dt);worst=Math.min(worst,h-S.summitGround(x,z));top=Math.max(top,h);if(i)maxRate=Math.max(maxRate,Math.abs(h-prev)/dt);prev=h;}
  assert(worst>=2.4,`flying in from ${deg}° at ${base} m never enters the rock (closest ${worst.toFixed(1)} m)`);assert(top>=H+5,'clears the summit');assert(prev<base+1,'back to cruise height past the island');assert(maxRate<=S.FLIGHT_MAX_RISE+.5,`no jumps (${maxRate.toFixed(1)} m/s)`);}
 assert.equal(S.createSummitFlightLift().update(103,-8,10,0,28,dt),0,'no lift away from the island');}

// ---- The 3D build runs (stub tools, no DOM): a throw here once stopped the whole island loading.
{const T=require('three'),W=load('lib/town/summitIsleWorld.ts'),town=new T.Group(),mk=g=>{const m=new T.Mesh(g,new T.MeshStandardMaterial());town.add(m);return m;};
 const tools={box:(w,h,d,c,x,y,z)=>{const m=mk(new T.BoxGeometry(w,h,d));m.position.set(x,y,z);return m;},cylinder:(r,h,c,x,y,z)=>{const m=mk(new T.CylinderGeometry(r,r,h,10));m.position.set(x,y,z);return m;},
  sign:(t,w,h,x,y,z)=>{const m=mk(new T.PlaneGeometry(w,h));m.position.set(x,y,z);return m;},town,obstacles:[],assets:[],surfaceAreas:[]};
 const out=W.buildSummitIsle(tools);let tris=0;town.traverse(o=>{if(o.isMesh)tris+=(o.geometry.index?o.geometry.index.count:o.geometry.getAttribute('position').count)/3;});
 assert(out.lampSites.length===2&&out.materials.length===2,'two floodlight pools, two materials');
 assert(tris>15000&&tris<60000,`a modest triangle budget for the whole island (${tris})`);
 for(const o of tools.obstacles)assert(Number.isFinite(o.x)&&Number.isFinite(o.z)&&o.w>0&&o.d>0,'obstacles are finite boxes');
 // Nothing the build puts down blocks the sandbar or the trails (a driftwood log once sat across the slim sandbar).
 const {insideObstacle}=load('lib/town/simulation.ts');
 const along=[];for(const line of [S.SANDBAR_PATH,...S.SUMMIT_PATHS])for(let i=1;i<line.length;i++){const a=line[i-1],c=line[i],n=Math.max(1,Math.ceil(Math.hypot(c.x-a.x,c.z-a.z)/.5));for(let k=0;k<=n;k++)along.push({x:a.x+(c.x-a.x)*k/n,z:a.z+(c.z-a.z)*k/n});}
 for(const q of along)for(const o of tools.obstacles)assert(!insideObstacle(q.x,q.z,o,.32),`the way is clear at ${q.x.toFixed(1)},${q.z.toFixed(1)}`);
 town.traverse(o=>{if(o.isMesh){const p=o.geometry.getAttribute('position');for(let i=0;i<p.count;i++)assert(Number.isFinite(p.getX(i))&&Number.isFinite(p.getY(i))&&Number.isFinite(p.getZ(i)),'finite vertices in '+o.name);}});}
console.log(`PASS Summit Isle: ${Math.round(isle)} m² (${(isle/cayArea).toFixed(2)}× Coral Cay), green ${H} m peak with the Summit 5s on its top, concave ridged slopes; the carved trail walked from the cay over the ${Math.round(S.SANDBAR_LENGTH)} m sandbar to the pitch; solid to walkers, flyers and the ball; flyable out to the map's edge`);
