// West Stadium, phase 1 (Nov 12 2026, docs/stadium/PLAN.md): the new west coast, Stadium Park, Stadium Plaza and the stadium's
// reserved footprint, checked against the town the game actually builds: the land and walk/flight bounds follow the new coast,
// the plaza and gate are open, nothing grows inside the bowl, the park stays inside its draw budget (west chunks only, one
// region gate hides them off screen) and the map draws the stadium. usage: node tests/west-stadium.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),T=req('three');
(async()=>{
const utils=await import(base+'/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js');
const cache=new Map(),gradient={addColorStop(){}};
const ctx=new Proxy({measureText:t=>({width:t.length*20}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(o,k)=>o[k]??(()=>{})});
const store=new Map();
const context=vm.createContext({console,Math,Set,Map,performance,Date,Float32Array,Uint8Array,Uint16Array,Uint32Array,Int32Array,
 window:{addEventListener:()=>{},removeEventListener:()=>{},matchMedia:()=>({matches:false})},
 requestAnimationFrame:()=>1,setTimeout:()=>1,setInterval:()=>1,
 localStorage:{getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v))},document:{createElement:()=>({width:0,height:0,getContext:()=>ctx})}});
function load(name){const file=path.resolve(base,name);if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,id=>id==='react'?{useSyncExternalStore:(_s,get)=>get()}:id==='three'?T:id.includes('BufferGeometryUtils')?utils:id.endsWith('.json')?require(path.resolve(path.dirname(file),id)):id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):req(id));cache.set(file,mod.exports);return mod.exports;}

const L=load('lib/town/westParkLayout.ts'),{onIsland,ISLAND_SHORE,INTERIOR_GRASS}=load('lib/town/shoreline.ts'),sim=load('lib/town/simulation.ts');
const {STADIUM:S,STADIUM_GATE:G,STADIUM_PLAZA:P,PARK_POND}=L;
// 1. Land: the stadium, park and plaza are on the island; the old west coast (x -99) is inland; the sea starts past x -332.
for(const [x,z] of [[S.x,S.z],[S.x-S.bowlW/2,S.z],[S.x,S.z-S.bowlL/2],[S.x,S.z+S.bowlL/2],[PARK_POND.x,PARK_POND.z],[P.minX,P.minZ],[-300,-150],[-250,100]])assert(onIsland(x,z),`(${x}, ${z}) is land`);
assert(!onIsland(-340,-30)&&!onIsland(-200,140)&&!onIsland(-150,-235),'sea beyond the new west, south-west and north-west coasts');
assert(Math.min(...ISLAND_SHORE.map(p=>p.x))>=sim.ISLAND_BOUNDS.minX,'ISLAND_BOUNDS takes in the new coast');
assert(sim.FLIGHT_BOUNDS.minX<=sim.ISLAND_BOUNDS.minX-50,'open sea west of the West Beach is flyable');
// The lawn keeps a West Beach of sand (not 40 m of bare sand): at the stadium's latitude the grass starts 12–25 m in from the coast.
{let coast=-400;while(!onIsland(coast,S.z))coast+=.25;const inside=(x,z)=>{let c=false;for(let i=0,j=INTERIOR_GRASS.length-1;i<INTERIOR_GRASS.length;j=i++){const a=INTERIOR_GRASS[i],b=INTERIOR_GRASS[j];if((a.z>z)!==(b.z>z)&&x<(b.x-a.x)*(z-a.z)/(b.z-a.z)+a.x)c=!c;}return c;};
 let grass=coast;while(!inside(grass,S.z))grass+=.25;assert(grass-coast>=12&&grass-coast<=25,`West Beach sand ${(grass-coast).toFixed(1)} m`);}

// 2. The built town.
const world=load('lib/town/world.ts').buildTown(new T.Scene());
const blocked=(x,z)=>sim.blocked(x,z,world.obstacles,.32);
for(const [x,z,what] of [[(P.minX+P.maxX)/2,(P.minZ+P.maxZ)/2,'plaza centre'],[-55,S.z,'plaza east end (from the x -45 street)'],[G.x+4,G.z,'in front of the gate'],[G.x-1,G.z,'through the gate'],[S.x,S.z,'centre spot'],[S.x+20,S.z-40,'on the pitch']])assert(!blocked(x,z),what+' is open');
assert(blocked(S.x-45,S.z),'the west stand is solid from the ground (walked on top, via its aisles)');
assert(blocked(PARK_POND.x,PARK_POND.z),'the pond is not walkable');
// Nothing grows on the pitch or in the stands: no tree/palm asset inside the bowl.
const trees=world.assets.filter(a=>a.kind==='tree'||a.kind==='palm');
assert(!trees.some(a=>L.inStadiumFootprint(a.x,a.z,2)),'no trees in the bowl');
assert(!trees.some(a=>a.x>P.minX-6&&a.x<P.maxX&&a.z>P.minZ-6&&a.z<P.maxZ+6),'no trees on the plaza');
const st=world.westPark;
assert(st.trees>=250&&st.trees<=340,'park trees '+st.trees);assert(st.palms>=6&&st.palms<=10,'West Beach palms '+st.palms);assert.equal(st.flags,14,'plaza flags');
// CORNER DELI and PRAÇA HOMES made way for the plaza; their neighbours stay.
const names=new Set(world.buildings.map(b=>b.name));
assert(!names.has('CORNER DELI')&&!names.has('PRAÇA HOMES')&&names.has('MAKERS HOUSE')&&names.has('THE GROCER'),'plaza replaced two west houses');

// 3. Draw budget: everything west of x -100 is in the 50 m chunk batches (cx ≤ -3), all behind the one west region gate.
const scene=world.dynamicScenery.parent;const chunks=scene.children.filter(o=>o.isMesh&&o.name.startsWith('island-chunk-')&&+o.name.slice('island-chunk-'.length).split(':')[0]<=-3);
let tris=0;for(const m of chunks){const g=m.geometry;tris+=(g.index?g.index.count:g.getAttribute('position').count)/3;}
assert.equal(chunks.length,world.westChunkCount,'every west chunk is gated');
console.log(`west chunks (draw calls when all in view): ${chunks.length}; triangles: ${Math.round(tris)}; trees ${st.trees}, palms ${st.palms}, flags ${st.flags}, hedges ${st.hedges}, beds ${st.beds}`);
assert(chunks.length<=90,'west draw calls bounded: '+chunks.length);assert(tris<=150000,'west triangles bounded: '+Math.round(tris));
// Phase 1 (park + placeholder bowl): 66 chunks, 50,950 triangles. The stands add chunks only where the stadium reaches new cells.
console.log('stadium build:',JSON.stringify(world.stadium));assert(chunks.length<=75&&tris<=95000,'phase 2 + 3 stadium budget (chunks / triangles; phase 3 adds ~11k: seat-back tops + real goal frames)');
assert(!scene.children.some(o=>o.name==='park-pond'),'the pond is batched into its chunk (no loose mesh)');

// 4. The map draws the stadium, the park and the plaza.
const map=fs.readFileSync(path.join(base,'components/IslandOverview.tsx'),'utf8');
assert(/data-west-stadium="bowl"/.test(map)&&/data-west-stadium="park"/.test(map)&&/>STADIUM</.test(map)&&/STADIUM PLAZA/.test(map),'map shows the stadium');
assert(!/lib\/town\/westPark'/.test(map),'the map imports the three-free layout module');
console.log('west stadium phase 1: ok');

// 5. Phase 2: walking the stands (the same rooftop travel Town builds), the gate, seats, the sit state machine, landings.
const Q=load('lib/town/stadiumSeats.ts'),{createRooftopTravel}=load('lib/town/rooftopTravel.ts');
const travel=()=>createRooftopTravel([...world.buildings,...world.walkSurfaces],world.obstacles,{x:G.x+8,z:G.z},world.roofObstacles,()=>0,world.landingExclusions,world.canopies);
/** Walk (or ride) through waypoints; returns the end point, its height, the highest drop seen and whether it ever fell. */
function walk(points,mode='walk',secs=40){const t=travel(),p={x:points[0][0],z:points[0][1]},v={x:0,z:0};t.reset(p.x,p.z);let fell=false,low=Infinity,high=-Infinity,i=1,stuck=0,last={...p};
 for(let f=0;f<secs*60&&i<points.length;f++){const [tx,tz]=points[i],dx=tx-p.x,dz=tz-p.z,l=Math.hypot(dx,dz);if(l<.4){i++;continue;}
  t.update(1/60,p,v,{x:dx/l,z:dz/l,sprint:false},mode);if(t.state.falling||t.state.recovery>0)fell=true;low=Math.min(low,t.state.height);high=Math.max(high,t.state.height);
  if(f%60===59){if(Math.hypot(p.x-last.x,p.z-last.z)<.15)stuck++;else stuck=0;last={...p};if(stuck>=3)break;}}
 return {x:p.x,z:p.z,h:t.state.height,fell,low,high,reached:i>=points.length,t};}
const near=(r,x,z,m=.6)=>Math.hypot(r.x-x,r.z-z)<m;
const W=Q.STANDS[0],E=Q.STANDS[1],N=Q.STANDS[2],SO=Q.STANDS[3],CH=Q.CONCOURSE_HEIGHT,ROOF_TOP=Q.ROOF.y+Q.ROOF.thick/2;
// The plaza → the gate → the pitch-level ring → the pitch.
{const r=walk([[G.x+10,G.z],[G.x-1,G.z],[S.x+38,S.z],[S.x+20,S.z+10]]);assert(r.reached&&!r.fell&&r.high<.1,'gate → ring → pitch on the ground '+JSON.stringify({...r,t:0}));}
// Up a west aisle from the ring to the concourse, along it, down a back stair to the park: no falls, no sticking.
{const z=S.z+13,back=S.x-Q.standBack(W);const r=walk([[S.x-38,z],[S.x-40.5,z],[back+1.2,z],[back+1.2,S.z+26],[back-.5,S.z+26],[S.x-Q.stairEnd(W)-2,S.z+26]]);
 assert(r.reached&&!r.fell&&r.h<.05&&Math.abs(r.high-CH)<.01,'west: aisle up, concourse, back stair down '+JSON.stringify({...r,t:0}));}
// Every stand: up its first aisle to the concourse (smooth: no fall), then the top row is a step down from it.
for(const s of Q.STANDS){const a=s.aisles[0],p0=Q.standWorld(s,s.inner-2,a),p1=Q.standWorld(s,s.inner+.2,a),p2=Q.standWorld(s,Q.standBack(s)-1.5,a);
 const r=walk([[p0.x,p0.z],[p1.x,p1.z],[p2.x,p2.z]]);assert(r.reached&&!r.fell&&Math.abs(r.h-CH)<.01,s.id+' aisle to the concourse '+JSON.stringify({...r,t:0}));}
// Every row is a walk surface: standing on row i reads its height; a row is not climbable from the one below (aisles are).
{const t=travel();for(let i=0;i<Q.ROWS;i++){const p=Q.standWorld(W,W.inner+i*Q.ROW_DEPTH+.3,5);assert(Math.abs(t.surface(p.x,p.z,9)-Q.rowHeight(i))<1e-6,'west row '+i+' height');}
 // Nov 12 2026: a walker steps up a row from anywhere (rows carry stepUp 0.55); rides do not (they keep to the aisles).
 const r=walk([[S.x-38,S.z+5],[S.x-Q.standBack(W)+1,S.z+5]],'walk',12);assert(r.reached&&!r.fell&&Math.abs(r.h-CH)<.01,'walking straight up the rows (no aisle) reaches the concourse '+JSON.stringify({...r,t:0}));
 const ride=walk([[S.x-38,S.z+5],[S.x-50,S.z+5]],'scooter',6);assert(ride.high<.05,'a ride cannot climb the rows away from an aisle');}
// Aisles are AISLE_WIDTH (2.2 m) wide, and an off-angle joystick (14° off straight up, kids) still reaches the concourse from the
// pitch-level ring at every aisle start: no row edge stops a climb.
assert.equal(Q.AISLE_WIDTH,2.2,'2.2 m aisles');
for(const s of Q.STANDS)for(const a of [s.aisles[0],s.aisles[s.aisles.length-1]])for(const off of [-.25,.25]){
 const t=travel(),p=Q.standWorld(s,s.inner-1.5,a),toP=Q.standWorld(s,s.inner+1,a),ux=toP.x-p.x,uz=toP.z-p.z,l=Math.hypot(ux,uz),c=Math.cos(off),sn=Math.sin(off);
 const dir={x:(ux*c-uz*sn)/l,z:(ux*sn+uz*c)/l,sprint:false},pp={...p},v={x:0,z:0};t.reset(pp.x,pp.z);let fell=false,f=0;
 for(;f<20*60&&Q.standLocal(s,pp.x,pp.z).d<Q.standBack(s)-2.2;f++){t.update(1/60,pp,v,dir,'walk');if(t.state.falling||t.state.recovery>0)fell=true;}
 assert(!fell&&Math.abs(t.state.height-CH)<.01&&f<20*60,`${s.id} aisle ${a}, ${off>0?'right':'left'} of straight: off-angle climb reaches the concourse (${Q.standLocal(s,pp.x,pp.z).d.toFixed(1)} m, h ${t.state.height})`);}
// No falls off the stand ends, the concourse back or the stair sides (the rails hold a walker), from any row.
for(const [s,i] of [[W,4],[W,9],[N,6],[E,8]]){const p=Q.standWorld(s,s.inner+i*Q.ROW_DEPTH+.3,s.to-6),q=Q.standWorld(s,s.inner+i*Q.ROW_DEPTH+.3,s.to+5);
 const t=travel(),pp={...p},v={x:0,z:0};t.reset(pp.x,pp.z,Q.rowHeight(i));const dx=q.x-p.x,dz=q.z-p.z,l=Math.hypot(dx,dz);let fell=false;
 for(let f=0;f<6*60;f++){t.update(1/60,pp,v,{x:dx/l,z:dz/l,sprint:false},'walk');if(t.state.falling||t.state.recovery>0)fell=true;}
 assert(!fell&&Math.abs(t.state.height-Q.rowHeight(i))<.01,`${s.id} row ${i}: the end rail holds`);}
{const p=Q.standWorld(N,Q.standBack(N)-1,30),q=Q.standWorld(N,Q.standBack(N)+6,30);const t=travel(),pp={...p},v={x:0,z:0};t.reset(pp.x,pp.z,CH);let fell=false;
 for(let f=0;f<5*60;f++){t.update(1/60,pp,v,{x:(q.x-p.x)/7,z:(q.z-p.z)/7,sprint:false},'walk');if(t.state.falling)fell=true;}assert(!fell&&Math.abs(t.state.height-CH)<.01,'the concourse back rail holds');}
// Corners are open: from the ring out through each corner gap to the park.
for(const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]]){const r=walk([[S.x+sx*37.5,S.z+sz*50],[S.x+sx*38,S.z+sz*55],[S.x+sx*46,S.z+sz*60],[S.x+sx*60,S.z+sz*84]]);assert(r.reached&&!r.fell&&r.high<.1,'corner '+sx+','+sz+' open '+JSON.stringify({...r,t:0}));}
// Rides go up an aisle and down a back stair too (no wedging, no falls).
for(const mode of ['scooter','bike']){const z=S.z-39,back=S.x-Q.standBack(W);const r=walk([[S.x-37,z],[S.x-40.5,z],[back+1.5,z],[back+1.5,S.z-26],[back-.5,S.z-26],[S.x-Q.stairEnd(W)-2,S.z-26]],mode);
 assert(r.reached&&!r.fell&&r.h<.05,mode+' up an aisle and down a back stair '+JSON.stringify({...r,t:0}));}
// Landings: a parachute / jetpack over the open north stand comes down on the stand (its concourse) or the ground beside it, never
// in a gap between rows; over a roofed stand, on the roof or beside it.
{const t=travel();for(const [x,z] of [[S.x+5,S.z-63],[S.x-20,S.z-68],[S.x-47,S.z+10],[S.x+20,S.z+64]]){const at=t.canLand(x,z,Infinity)?{x,z}:t.findLanding(x,z);assert(at,'a landing near '+x+','+z);
  const h=t.surface(at.x,at.z,Infinity),ok=h<.05||Math.abs(h-CH)<.01||h>12||Array.from({length:Q.ROWS},(_,i)=>Q.rowHeight(i)).some(r=>Math.abs(r-h)<.01);
  assert(ok&&Math.hypot(at.x-x,at.z-z)<14,`landing near ${x},${z} → ${JSON.stringify(at)} at ${h.toFixed(2)} m`);}}

// Roofs (Nov 12 2026, QA: the follow camera saw only the roof over a walker in the long stands): each roof is one mesh of its own
// (2 draws), not in a chunk batch; it fades while the player is under it or the camera-to-player line crosses it, and back when
// clear; still a landing surface from the sky.
{const RF=world.stadiumRoofs,roofs=[];scene.traverse(o=>{if(o.name&&o.name.startsWith('stadium-roof-'))roofs.push(o);});
 assert.equal(roofs.length,2,'two roof meshes');assert(roofs.every(m=>m.isMesh&&!Array.isArray(m.material)&&m.material.transparent),'one draw each, fadeable');
 assert(!chunks.some(m=>m.name.includes('roof')),'not merged into a chunk');
 const off={x:18,y:23,z:30};// walkCameraOffset (desktop)
 const view=(x,y,z,cam)=>{for(let i=0;i<30;i++)RF.update(1/30,x,y,z,...(cam??[x+off.x,y+off.y,z+off.z]));return RF.opacity;};
 const at=(s,row,a)=>{const p=Q.standWorld(s,s.inner+row*Q.ROW_DEPTH+.3,a);return [p.x,Q.rowHeight(row),p.z];};
 let o=view(...at(E,7,10));assert(o[1]<.25&&o[0]===1,'east row 7, under the east roof: it fades (the west one does not) '+o);
 o=view(S.x,0,S.z);assert(o[0]===1&&o[1]===1,'back on the pitch: both roofs solid again '+o);
 o=view(...at(W,8,-20));assert(o[0]<.25,'west row 8, under the west roof: it fades '+o);
 o=view(...at(E,1,10));assert(o[1]<.25,'east row 1 (in front of the roof): the camera line crosses it, it fades '+o);
 o=view(S.x+S.pitchW/2,0,S.z+5);assert(o[1]===1,'on the east touchline: the narrower roof hides nothing, stays solid '+o);
 {const [x,y,z]=at(E,7,10);o=view(x,ROOF_TOP+2,z);assert(o[1]===1,'a jetpack above the roof sees it solid (to land on) '+o);}
 {const seat=Q.nearestSeat(...((p)=>[p.x,p.z])(Q.standWorld(E,E.inner+7*Q.ROW_DEPTH+.3,10)),Q.rowHeight(7)),c=Q.seatView(seat);
  o=view(seat.x,seat.y,seat.z,[c.x,c.y,c.z]);assert(o[1]===1,'seated (stand view under the roof): the roof stays '+o);}
 const t=travel();for(const s of [W,E]){const p=Q.standWorld(s,(Q.ROOF.front+Q.ROOF.back)/2,0);
  assert(t.canLand(p.x,p.z,Infinity),s.id+' roof: a landing from the sky');assert(Math.abs(t.surface(p.x,p.z,Infinity)-ROOF_TOP)<.01,s.id+' roof: lands on the slab top');
  assert(Math.abs(t.surface(p.x,p.z,Q.rowHeight(8))-Q.rowHeight(8))<.01||t.surface(p.x,p.z,Q.rowHeight(8))<ROOF_TOP-1,s.id+' roof: walkers under it stay on the stand');}}
// Seats: the nearest free seat, facing the pitch; the sit state machine never traps.
{const p=Q.standWorld(W,W.inner+3*Q.ROW_DEPTH+.3,5.1),seat=Q.nearestSeat(p.x,p.z,Q.rowHeight(3));assert(seat&&seat.stand==='west'&&seat.row===3,'a seat on the row you stand on');
 const fx=Math.sin(seat.yaw),fz=Math.cos(seat.yaw);assert(fx*(S.x-seat.x)+fz*(S.z-seat.z)>0&&Math.abs(fz)<1e-9,'the seat faces the pitch');
 const taken=Q.nearestSeat(p.x,p.z,Q.rowHeight(3),new Set([seat.id]));assert(taken&&taken.id!==seat.id,'an occupied seat is skipped');
 assert(!Q.nearestSeat(p.x,p.z,Q.rowHeight(3)+3),'no seat from far above (flying over)');assert(!Q.nearestSeat(S.x,S.z,0),'no seat on the pitch');
 for(const s of Q.STANDS){const c=Q.standWorld(s,s.inner+2*Q.ROW_DEPTH+.4,s.from+3),st=Q.nearestSeat(c.x,c.z,Q.rowHeight(2));assert(st&&st.stand===s.id,'seats in the '+s.id+' stand');
  const fx=Math.sin(st.yaw),fz=Math.cos(st.yaw);assert(fx*(S.x-st.x)+fz*(S.z-st.z)>0,s.id+' seat faces in');const view=Q.seatView(st);assert(Math.hypot(view.lx-S.x,view.lz-S.z)<Math.hypot(view.x-S.x,view.z-S.z),s.id+' view looks at the pitch');}
 // The seat's root is on its row's walk surface (the seated pose rests on the strip there).
 const t=travel();assert(Math.abs(t.surface(seat.x,seat.z,9)-seat.y)<1e-6,'seat root on its row');
 const m=Q.createSitMachine();assert(Q.sitDown(m,seat,false)&&m.phase==='sitting');for(let i=0;i<40;i++)Q.stepSit(m,1/60,{push:0,walk:true,away:false,reduced:false});assert.equal(m.phase,'seated');
 assert(!Q.sitDown(m,seat,false),'already seated');Q.stepSit(m,1/60,{push:.9,walk:true,away:false,reduced:false});assert.equal(m.phase,'rising','the stick gets you up');
 for(let i=0;i<40;i++)Q.stepSit(m,1/60,{push:0,walk:true,away:false,reduced:false});assert(m.phase==='standing'&&!m.seat&&m.blend===0,'standing again');
 for(const why of [{walk:false},{away:true}]){const k=Q.createSitMachine();Q.sitDown(k,seat,true);assert.equal(k.phase,'seated','reduced motion: no ease');Q.stepSit(k,1/60,{push:0,walk:true,away:false,reduced:true,...why});assert.equal(k.phase,'standing','a ride / teleport gets you up at once');}
 console.log('seats:',Q.seatCount());assert(Q.seatCount()>3000,'thousands of seats (a grid, no meshes)');}
// The sponsor layout matches the geometry and passes the sponsor module's own check; boards leave walk gaps.
{const l=Q.stadiumSponsorLayout();assert.equal(load('lib/stadium/sponsors/layout.ts').layoutProblems(l).join(','),'');assert.equal(l.flags.length,14);assert.equal(l.fascia.length,2);
 assert(!blocked(S.x-35.5,S.z-25),'a gap between two side boards is open');assert(blocked(S.x-35.5,S.z-37.5),'a board is solid');
 assert(Q.inGate(G.x-5,G.z)&&!Q.inGate(G.x+5,G.z),'through the gate');}
// The runtime Town drives (stadiumSit.ts): the prompt, Sit, held by the seat, the stick gets up; never trapped.
{const {createStadiumSit,SIT_KEY}=load('lib/town/stadiumSit.ts');let wakes=0;const sit=createStadiumSit({parent:new T.Group(),wake:()=>wakes++});
 assert.equal(sit.want(0,0,0,true),null,'nothing far away');
 const p=Q.standWorld(W,W.inner+5*Q.ROW_DEPTH+.3,8),h=Q.rowHeight(5),w=sit.want(p.x,p.z,h,true);assert(w&&w.key===SIT_KEY&&w.distance<1.6,'Sit offered on a row');
 assert.equal(sit.want(p.x,p.z,h,false),null,'not while riding / falling / in a menu');sit.want(p.x,p.z,h,true);
 const seat=sit.press(true);assert(seat&&sit.seated&&sit.trick()&&sit.trick().w===1,'seated (reduced motion: at once)');assert(wakes>0,'wakes the loop');
 const input={x:0,z:0,kick:true,juggle:false};assert(sit.holdPlayer(1/60,input,new Set(),{walk:true,x:seat.x,z:seat.z,reduced:true})&&!input.kick,'held: kicks off');
 assert.deepEqual({...sit.want(seat.x,seat.z,seat.y,true)},{key:SIT_KEY,distance:0},'the prompt stays (Stand up)');
 assert(!sit.holdPlayer(1/60,{x:0,z:1,kick:false,juggle:false},new Set(),{walk:true,x:seat.x,z:seat.z,reduced:true})&&!sit.seated&&!sit.trick(),'the stick gets up');
 sit.want(p.x,p.z,h,true);sit.press(false);assert.equal(sit.phase,'sitting');for(let i=0;i<60;i++)sit.holdPlayer(1/60,{x:0,z:0,kick:false,juggle:false},new Set(),{walk:true,x:sit.seat.x,z:sit.seat.z,reduced:false});
 assert.equal(sit.phase,'seated','eases in');assert(!sit.holdPlayer(1/60,{x:0,z:0,kick:false,juggle:false},new Set(['w']),{walk:true,x:sit.seat.x,z:sit.seat.z,reduced:false}),'a key gets up');
 for(let i=0;i<60;i++)sit.holdPlayer(1/60,{x:0,z:0,kick:false,juggle:false},new Set(),{walk:true,x:0,z:0,reduced:false});assert(sit.phase==='standing'&&!sit.trick(),'eased out');
 {const c=new T.PerspectiveCamera(40,1,1,500);sit.want(p.x,p.z,h,true);sit.press(true);sit.applyCamera(c);assert(c.far<=200,'seated: the far plane comes in (heat)');
  const f=new T.Vector3(0,0,-1).applyQuaternion(c.quaternion),st=sit.seat;assert(f.x*(S.x-st.x)+f.z*(S.z-st.z)>0,'the stand view looks at the pitch');
  sit.holdPlayer(1/60,{x:1,z:0,kick:false,juggle:false},new Set(),{walk:true,x:st.x,z:st.z,reduced:true});sit.applyCamera(c);assert.equal(c.far,500,'standing: the far plane restored');}
 const cam=new T.PerspectiveCamera();cam.position.set(1,2,3);sit.applyCamera(cam);assert.deepEqual(cam.position.toArray(),[1,2,3],'standing: the camera is untouched');}
// ---- Phase 3a: the stadium as a live venue, real goals, the big screen, watching from the seats, the map destination ----------
{const V=load('lib/town/venues.ts'),v=V.liveVenueById('stadium');
 assert(v&&v.x===S.x&&v.z===S.z&&v.width===S.pitchW&&v.length===S.pitchL&&v.players===11&&v.goalWidth===7.32&&v.goalHeight===2.44,'the stadium venue: 63 × 100 m at the pitch, 11 a side, full-size goals');
 assert(!V.VENUES.some(x=>x.id==='stadium'),'a live venue only: lessons, quests and coin routes do not move');
 assert.equal(V.simFormat('stadium'),'11v11');assert.equal(V.simFormat('beach'),'beach');
 assert(Math.abs((v.elevation??0)+V.FIELD_SURFACE_Y-V.STADIUM_PITCH_Y)<1e-9,'rigs and goal frames stand on the stadium grass');
 assert.equal(load('lib/town/liveJoin.ts').joinableFormat('stadium'),true,'joinable like the other pitches');
 const P=load('multiplayer/protocol/types.ts'),N=load('lib/town/match/matchNet.ts');
 assert.deepEqual([...P.MATCH_FIELDS],['7v7','futsal','9v9','11v11','beach','stadium'],'field id 5 appended (old ids keep their meaning)');assert.deepEqual([...N.NET_FIELDS],[...P.MATCH_FIELDS]);
 const {MatchSim}=load('lib/town/match/matchSim.ts'),m=new MatchSim(7,'stadium'),e=new MatchSim(7,'11v11');
 assert.equal(m.ids.length,22,'22 players');assert.equal(m.goalVenue.id,'stadium','its own goals');assert.equal(m.useOffside,true,'11v11 laws');
 assert.deepEqual(m.T,e.T,'the 11v11 tuning');for(let i=0;i<600;i++)m.step(1/30);assert(Number.isFinite(m.ball.x)&&Number.isFinite(m.ball.y),'plays');
 // The island scene: the real goal frames and nets, their colliders (side and back nets block, the mouth is open).
 const nets=scene.getObjectByName('stadium-goal-nets');assert(nets&&nets.isLineSegments,'one LineSegments for both nets');
 for(const sz of [-1,1]){const gz=S.z+sz*S.pitchL/2;assert(blocked(S.x,gz+sz*load('lib/town/goalCollisions.ts').GOAL_DEPTH),'the back net blocks');assert(!blocked(S.x,gz-sz*.8),'the goal mouth is open');}
 assert.equal(world.stadium.seatsStrips,570,'3 pieces per row and block: cushion, low back, per-seat tops');}
{const Q2=load('lib/town/stadiumSeats.ts'),st=Q2.nearestSeat(...Object.values(Q2.standWorld(W,W.inner+4*Q2.ROW_DEPTH+.3,6)),Q2.rowHeight(4)),a=Q2.seatView(st),b=Q2.seatView(st,true);
 const back=(o)=>Math.hypot(o.x-st.x,o.z-st.z);assert(b.y>a.y+.8&&back(b)>back(a)+.5,'portrait phone: the stand view is higher and further back');
 const out={x:0,z:0};Q2.followLook(a,null,out);assert(out.x===a.lx&&out.z===a.lz,'no match: the seat\'s pitch point');
 Q2.followLook(a,{x:S.x+20,z:S.z-40},out);assert(Math.hypot(out.x-(S.x+20),out.z-(S.z-40))<Math.hypot(a.lx-(S.x+20),a.lz-(S.z-40)),'a match: toward the ball');}
{const SS=load('lib/town/stadiumScreen.ts');assert.equal(SS.screenMinute(0),1,"the first minute is 1' (never 0')");assert.equal(SS.screenMinute(59),1);assert.equal(SS.screenMinute(61),2);
 const {createStadiumSit}=load('lib/town/stadiumSit.ts'),parent=new T.Group(),sit=createStadiumSit({parent,wake:()=>{}});
 const p=Q.standWorld(W,W.inner+5*Q.ROW_DEPTH+.3,8),h=Q.rowHeight(5);
 const el={hidden:true,dataset:{},textContent:'',setAttribute(k,val){this[k]=val;}},show=()=>sit.prompt(el,true,cam,800,600,()=>{},(x,hid)=>{x.hidden=hid;});
 const cam=new T.PerspectiveCamera(40,1,1,500);cam.position.set(p.x-20,h+5,p.z);cam.lookAt(p.x,h,p.z);cam.updateMatrixWorld();
 sit.want(p.x,p.z,h,true);sit.match(null,0);show();assert.equal(el.textContent,'Sit','no match: Sit');
 const screen=()=>parent.getObjectByName('stadium-score-screen');assert(!screen()||!screen().visible,'no match: no score plane');
 const match={sim:{score:{gold:1,blue:0},clock:125},ball:{position:{x:S.x+15,z:S.z-30}}};
 sit.match(match,1000);show();assert.equal(el.textContent,'Sit and watch','a match on: Sit and watch');assert(screen()&&screen().visible,'the score plane shows near the stadium');
 const tex=screen().material.map,v0=tex.version;sit.match(match,1500);sit.match(match,2600);assert.equal(tex.version,v0,'unchanged score / minute: no redraw');
 match.sim.score.blue=1;sit.match(match,3000);const v1=tex.version;assert(v1>v0,'a goal redraws');match.sim.clock=185;sit.match(match,3400);assert.equal(tex.version,v1,'at most 1 Hz');sit.match(match,4100);assert(tex.version>v1,'the minute ticks over');
 sit.want(0,0,0,true);sit.match(match,9000);assert(!screen().visible,'far away: hidden');
 // Seated with a match on: the stand view turns toward the ball, smoothly.
 sit.want(p.x,p.z,h,true);sit.match(match,9100);sit.press(true);const c=new T.PerspectiveCamera(40,1,1,500);sit.applyCamera(c,1/60);const f0=new T.Vector3(0,0,-1).applyQuaternion(c.quaternion);
 match.ball.position.x=S.x+25;match.ball.position.z=S.z+45;sit.match(match,9200);sit.applyCamera(c,1/60);const f1=new T.Vector3(0,0,-1).applyQuaternion(c.quaternion);
 for(let i=0;i<240;i++){sit.match(match,9200+i*16);sit.applyCamera(c,1/60);}const f2=new T.Vector3(0,0,-1).applyQuaternion(c.quaternion);
 assert(f0.angleTo(f2)>.2,'it follows the ball');assert(f0.angleTo(f1)<f0.angleTo(f2)*.1,'one frame: a small part of the turn (smooth)');
 const pc=new T.PerspectiveCamera(40,.5,1,500);sit.applyCamera(pc,1/60);assert(pc.position.y>c.position.y-1e-6,'portrait: from the raised view');}
// The map and travel: a Stadium destination like the other places.
assert(/id:'stadium',label:'STADIUM GATE',point:STADIUM_ARRIVAL/.test(map)&&/\|'summit'\|'stadium';/.test(map),'the map has a Stadium destination');
{const town=fs.readFileSync(path.join(base,'components/Town.tsx'),'utf8');assert(/travel\.current==='stadium'\?STADIUM_ARRIVAL/.test(town)&&/destination==='stadium'\)go\(destination\)/.test(town),'travel lands at the stadium gate');
 assert(L.STADIUM_ARRIVAL.x>L.STADIUM_GATE.x&&onIsland(L.STADIUM_ARRIVAL.x,L.STADIUM_ARRIVAL.z)&&!blocked(L.STADIUM_ARRIVAL.x,L.STADIUM_ARRIVAL.z),'the arrival is open plaza outside the gate');}
console.log('west stadium phase 3a: ok');
// ---- Phase 3b: the crowd, goal frames that stop the ball, portrait framing, exhibitions, the crowd sound -------------------------
{const C=load('lib/town/stadiumCrowd.ts'),SS=load('lib/town/stadiumScreen.ts'),seats=Q.seatCount(),fans=C.crowdSeats();
 const share=f=>C.crowdCount(fans,f)/seats,desk=share(C.crowdFill(false,0)),phone=share(C.crowdFill(true,0)),hot=share(C.crowdFill(true,2)),saver=share(C.crowdFill(false,4));
 console.log(`crowd: ${fans.length} fans max; desktop ${(desk*100).toFixed(0)}%, phone ${(phone*100).toFixed(0)}%, phone tier 2 ${(hot*100).toFixed(0)}%, saver ${(saver*100).toFixed(0)}% of ${seats} seats; desktop ${C.crowdCount(fans,C.crowdFill(false,0))*C.FAN_TRIS} tris`);
 assert(desk>=.3&&desk<=.4,'desktop fills 30–40 % of the seats');assert(phone<desk*.75&&hot<phone&&saver<hot,'fewer fans on phones and under heat pressure');
 assert(C.crowdCount(fans,C.crowdFill(false,0))*C.FAN_TRIS<=40000,'crowd triangles bounded (desktop ≤ 40k)');
 const g=C.fanGeometry();assert.equal(g.index.count/3,C.FAN_TRIS,'20 triangles a fan');g.dispose();
 // Seats by the aisles stay free (the end seat of every span), and every fan sits on a real seat.
 for(const s of Q.STANDS)for(const a of s.aisles)assert(!fans.some(f=>{const l=Q.standLocal(s,f.x,f.z);return l.d>s.inner-.1&&l.d<s.inner+Q.ROWS*Q.ROW_DEPTH&&Math.abs(l.a-a)<Q.AISLE_WIDTH/2+Q.SEAT_PITCH*1.4;}),`${s.id} aisle ${a}: free seats beside it`);
 // One instanced draw, built only near the stadium, hidden far away, culled off screen; a goal bounces it via uniforms only.
 const parent=new T.Group(),crowd=C.createStadiumCrowd(parent,false);crowd.update(400,0,0,false,1/60,false);assert(!crowd.mesh&&parent.children.length===0,'far away: nothing built');
 crowd.update(60,S.x+30,S.z,false,1/60,false);const mesh=crowd.mesh;assert(mesh&&mesh.isInstancedMesh&&mesh.visible&&parent.children.length===1&&!mesh.castShadow,'near: one instanced mesh, no shadow pass');
 assert.equal(mesh.count,C.crowdCount(fans,C.crowdFill(false,0)));const m0=mesh.instanceMatrix.version;
 const cam=new T.PerspectiveCamera(40,1,1,500);cam.position.set(S.x+150,2,S.z);cam.lookAt(S.x+400,2,S.z);cam.updateMatrixWorld();const fr=new T.Frustum().setFromProjectionMatrix(new T.Matrix4().multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse));
 assert(mesh.frustumCulled&&!fr.intersectsObject(mesh),'looking away from the stadium: culled (0 draws)');cam.lookAt(S.x,2,S.z);cam.updateMatrixWorld();fr.setFromProjectionMatrix(new T.Matrix4().multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse));assert(fr.intersectsObject(mesh),'looking at it: drawn');
 const sh={uniforms:{},vertexShader:'#include <color_vertex>\n#include <begin_vertex>'};mesh.material.onBeforeCompile(sh);const U=sh.uniforms;assert(/uCheer/.test(sh.vertexShader)&&/uClear/.test(sh.vertexShader),'bounce and clearing in the shader');
 for(let i=0;i<30;i++)crowd.update(60,S.x+30,S.z,false,1/60,false);assert.equal(U.uCheer.value,0,'no goal: still');crowd.cheer();crowd.update(60,S.x+30,S.z,false,.3,false);assert(U.uCheer.value>0,'a goal: the stands bounce');
 for(let i=0;i<200;i++)crowd.update(60,S.x+30,S.z,false,1/60,false);assert(U.uCheer.value===0&&!crowd.cheering,'the cheer ends');assert.equal(mesh.instanceMatrix.version,m0,'no per-instance CPU work');
 crowd.cheer();crowd.update(60,S.x+30,S.z,false,.3,true);assert.equal(U.uCheer.value,0,'reduced motion: no bounce');
 {const F=U.uClearF.value;assert(Array.isArray(F)&&F.length>=4&&/uClearF/.test(sh.vertexShader),'friends clear too');crowd.update(60,S.x,S.z,false,1/60,false,[{x:S.x-45,z:S.z}]);assert(F[0].z>0&&F[0].x===S.x-45&&F[1].z<0,'a seated friend: the fan in their seat clears');crowd.update(60,S.x,S.z,false,1/60,false,[]);assert(F[0].z<0,'friend stood up: the fan comes back');}crowd.update(60,S.x-45,S.z,true,1/60,false);assert(U.uClear.value.z>0&&U.uClear.value.x===S.x-45,'up in the stands: the fans round me clear');crowd.update(60,S.x,S.z,false,1/60,false);assert(U.uClear.value.z<0,'on the pitch: nobody cleared');
 crowd.update(400,0,0,false,1/60,false);assert(!mesh.visible,'far away: hidden');crowd.dispose();assert(parent.children.length===0);
 // The goal frames stop a free ball (sweepGoalFrame's default list now has the stadium); the mouth stays open.
 const GC=load('lib/town/goalCollisions.ts'),V=load('lib/town/venues.ts'),v=V.liveVenueById('stadium'),hit={},y0=V.STADIUM_PITCH_Y;
 for(const sz of [-1,1]){const gz=S.z+sz*S.pitchL/2;
  assert(GC.sweepGoalFrame({x:S.x+v.goalWidth/2,y:y0+1,z:gz-sz*2},{x:S.x+v.goalWidth/2,y:y0+1,z:gz+sz*2},.2,hit),'a shot at the post hits it');assert.equal(hit.part,'post');
  assert(GC.sweepGoalFrame({x:S.x,y:y0+v.goalHeight,z:gz-sz*2},{x:S.x,y:y0+v.goalHeight,z:gz+sz*2},.2,hit)&&hit.part==='crossbar','the bar');
  assert(!GC.sweepGoalFrame({x:S.x,y:y0+1,z:gz-sz*2},{x:S.x,y:y0+1,z:gz+sz*.5},.2,hit),'the goal mouth is open');}
 // Portrait phone framing: from every stand-facing seat in the end stands, the centre spot and the whole big screen stay in frame
 // wherever the ball is, and the sitter's head stays below the bottom edge.
 const aspect=390/844,pc=new T.PerspectiveCamera(Q.PORTRAIT_FOV,aspect,1,175),out={x:0,y:0,z:0},ndc=new T.Vector3();
 const inFrame=(x,y,z)=>{ndc.set(x,y,z).project(pc);return Math.abs(ndc.x)<=1&&Math.abs(ndc.y)<=1&&ndc.z<1;};
 for(const along of [-30,-8,0,8,30])for(const row of [0,5,9]){const N=Q.STANDS[2],p=Q.standWorld(N,N.inner+row*Q.ROW_DEPTH+.3,along),st=Q.nearestSeat(p.x,p.z,Q.rowHeight(row));assert(st,'a north seat');
  const view=Q.seatView(st,true);for(const ball of [null,{x:S.x-30,z:S.z+48},{x:S.x+30,z:S.z-48},{x:S.x+30,z:S.z+48}]){
   Q.portraitLook(view,st,ball,aspect,out);pc.position.set(view.x,view.y,view.z);pc.lookAt(out.x,out.y,out.z);pc.updateMatrixWorld();
   const sz=S.z+Q.SCREEN.z;assert(inFrame(S.x,0,S.z),`seat ${st.id} ball ${JSON.stringify(ball)}: centre spot in frame`);
   for(const [dx,dy] of [[-1,-1],[1,-1],[-1,1],[1,1]])assert(inFrame(S.x+dx*Q.SCREEN.w/2,Q.SCREEN.y+dy*Q.SCREEN.h/2,sz),`seat ${st.id}: the big screen in frame`);
   ndc.set(st.x,st.y+1.5,st.z).project(pc);assert(ndc.y< -1||ndc.z>1,'the sitter\'s head is out of frame');}}
 // The south stand has the big screen behind it: the portrait view still looks at the pitch (centre spot in frame, not sky).
 for(const along of [-30,0,30])for(const row of [0,5,9]){const Sn=Q.STANDS[3],p=Q.standWorld(Sn,Sn.inner+row*Q.ROW_DEPTH+.3,along),st=Q.nearestSeat(p.x,p.z,Q.rowHeight(row));assert(st,'a south seat');
  const view=Q.seatView(st,true);for(const ball of [null,{x:S.x+30,z:S.z-48}]){Q.portraitLook(view,st,ball,aspect,out);pc.position.set(view.x,view.y,view.z);pc.lookAt(out.x,out.y,out.z);pc.updateMatrixWorld();
   assert(inFrame(S.x,0,S.z),`south seat ${st.id}: centre spot in frame`);}}
 {const sit=load('lib/town/stadiumSit.ts').createStadiumSit({parent:new T.Group(),wake:()=>{}}),N=Q.STANDS[2],p=Q.standWorld(N,N.inner+5*Q.ROW_DEPTH+.3,4),h=Q.rowHeight(5);
  sit.want(p.x,p.z,h,true);sit.press(true);const c=new T.PerspectiveCamera(40,aspect,1,500);sit.applyCamera(c,1/60);assert.equal(c.fov,Q.PORTRAIT_FOV,'seated on a portrait phone: the wider view');
  sit.holdPlayer(1/60,{x:1,z:0,kick:false,juggle:false},new Set(),{walk:true,x:sit.seat.x,z:sit.seat.z,reduced:true});sit.applyCamera(c,1/60);assert.equal(c.fov,40,'standing: the FOV restored');}
 // Exhibitions: no human in the match = EXHIBITION on the screen and the pitch bar; the cheer and the crowd sound near the pitch.
 assert.equal(SS.screenText({home:'Red',away:'Blue',gold:1,blue:0,minute:12,exhibition:true}),"EXHIBITION · RED 1-0 BLUE 12'");
 let goals=0;const sit=load('lib/town/stadiumSit.ts').createStadiumSit({parent:new T.Group(),wake:()=>{},goal:()=>goals++}),M=load('lib/town/stadiumSit.ts');
 const tagEl={textContent:''},actEl={textContent:''},bar={querySelector:q=>q==='[data-bar-tag]'?tagEl:actEl,setAttribute(){}};
 const match={sim:{score:{gold:0,blue:0},clock:5},ball:{position:{x:S.x,z:S.z}},humans:new Map(),puppet:null};
 sit.want(S.x+30,S.z,0,true);sit.match(match,0);sit.bar(bar);assert(sit.exhibition&&/EXHIBITION/.test(tagEl.textContent)&&/watch/.test(actEl.textContent),'all-AI: an exhibition');
 assert(sit.ambience>.9,'by the pitch: the crowd loop at full');match.sim.score.gold=1;sit.match(match,100);assert(goals===1&&sit.crowd.cheering,'a goal: the cheer and the bounce');
 match.humans.set('me',{});sit.match(match,200);sit.bar(bar);assert(!sit.exhibition&&/BIG MATCH/.test(tagEl.textContent),'a player in it: a big match');
 sit.want(S.x+140,S.z,0,true);sit.match(match,300);assert.equal(sit.ambience,0,'far from the pitch: silent');assert.equal(M.ambienceLevel(S.x+S.pitchW/2+59,S.z)>0,true,'within ~60 m of the pitch: audible');
 sit.match(null,400);assert.equal(sit.ambience,0,'no match: silent');}
console.log('west stadium phase 3b: ok');
// The map draws four stands with open corners.
assert(/data-stadium-stand=/.test(map),'the map draws the stands');
console.log('west stadium phase 2: ok');
})().catch(e=>{console.error(e);process.exit(1);});
