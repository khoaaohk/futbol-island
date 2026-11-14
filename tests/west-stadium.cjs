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
assert(!onIsland(-340,-30)&&!onIsland(-200,165)/* Nov 13 2026: the coast below the pond moved out ~20 m */&&!onIsland(-150,-235),'sea beyond the new west, south-west and north-west coasts');
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
assert(!blocked(PARK_POND.x,PARK_POND.z)&&L.pondDepthAt(PARK_POND.x,PARK_POND.z)===L.POND_DEPTH.deep,'the pond is open water (no collider; Nov 13 2026: POND_DEPTH.deep in the middle, swimmable: tests/pond-swim.cjs)');
// Nothing grows on the pitch or in the stands: no tree/palm asset inside the bowl.
const trees=world.assets.filter(a=>a.kind==='tree'||a.kind==='palm');
assert(!trees.some(a=>L.inStadiumFootprint(a.x,a.z,2)),'no trees in the bowl');
assert(!trees.some(a=>a.x>P.minX-6&&a.x<P.maxX&&a.z>P.minZ-6&&a.z<P.maxZ+6),'no trees on the plaza');
const st=world.westPark;
console.log('park trees',st.trees,'palms',st.palms);assert.equal(st.flags,14,'plaza flags');
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
console.log('stadium build:',JSON.stringify(world.stadium));// Nov 13 2026 (owner): the machine row under the big screen adds ~14.4k triangles to the stadium cell's existing batches (the four
// gashapons' shared island model, lib/graphics/gashaponMesh.ts; no new chunk or draw call): 95k → 98k.
// Nov 13 2026 (release3, measured): main 57 chunks / 81,902 tris; + the bigger pond, jetty, reeds, rocks and orchard (pond-swim) 63 / 85,352;
// + the machine row (screen-shops) 59 / 96,338; both together 65 / 99,788. Budget 98k → 102k (~2% margin).
assert(chunks.length<=75&&tris<=102000,'phase 2 + 3 stadium budget (chunks / triangles; phase 3 adds ~11k: seat-back tops + real goal frames; the screen machines ~14k; the pond and orchard ~3.5k)');
assert(!scene.children.some(o=>o.name==='park-pond'),'the pond is batched into its chunk (no loose mesh)');

// 4. The map draws the stadium, the park and the plaza.
const map=fs.readFileSync(path.join(base,'components/IslandOverview.tsx'),'utf8');
assert(/data-west-stadium="bowl"/.test(map)&&/data-west-stadium="park"/.test(map)&&/PLAZA_LABEL/.test(map)&&!/STADIUM PLAZA/.test(map),'map shows the stadium and the Plaza (no "Stadium" in front, Nov 13 2026)');
assert(!/>STADIUM</.test(map),'no separate big STADIUM word: the name is the tappable place label (Drip FC, Nov 13 2026)');
assert(!/lib\/town\/westPark'/.test(map),'the map imports the three-free layout module');
console.log('west stadium phase 1: ok');

// ---- Stadium Park rework (Nov 13 2026, owner A–G): apron, trails, pond, palms, sign, lawns, map -----------------------------------
{const Q2=load('lib/town/stadiumSeats.ts'),WP=load('lib/town/westPark.ts'),{distanceToShore}=load('lib/town/shoreline.ts');
 const lines=L.parkPathLines(),trailLines=L.PARK_TRAILS.map(t=>L.pathPoints(t.curve)),ring=L.ringPoints();
 const trailD=(x,z,except=-1)=>Math.min(...lines.map((l,i)=>i===except?Infinity:L.segDistance(x,z,l)));
 // A. One continuous walk from the plaza through the gate to the pitch-level ring: paving at every 0.5 m (three lines across
 // the gate's width), and every back stair's foot and every open corner lands on the apron.
 for(const dz of [-5,0,5])for(let x=(P.minX+P.maxX)/2;x>Q2.GATE_ARCH_X-6;x-=.5)assert(L.onParkPaving(x,G.z+dz),`paving from the plaza to the gate at x ${x}, z ${G.z+dz}`);
 for(const s of Q2.STANDS)for(const a of s.stairs){const f=Q2.standWorld(s,Q2.stairEnd(s)+.6,a);assert(L.onApron(f.x,f.z)&&!blocked(f.x,f.z),`${s.id} stair at ${a}: its foot lands on the apron`);}
 for(const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]])for(const k of [0,.5,.75])assert(L.onApron(S.x+sx*(46+14*k),S.z+sz*(60+24*k)),'corner '+sx+','+sz+' paved out to the ring');
 // The plaza's edge meets the apron (no grass strip): the apron reaches past the plaza's west edge along its whole width.
 for(let z=P.minZ;z<=P.maxZ;z+=2)assert(L.onApron(P.minX+1,z),'apron under the plaza west edge at z '+z);
 // H. The plaza meets the x -45 street's sidewalk with no grass strip: paving (a path surface) at every point across the gap.
 {const road=world.roads.find(r=>r.vertical&&Math.abs(r.x+45)<1);const kerb=road.x-road.w/2;assert(WP.PLAZA_PAVING_EAST>kerb&&WP.PLAZA_PAVING_EAST<kerb+1,'plaza paving tucks under the sidewalk');
  for(let z=P.minZ+.5;z<P.maxZ;z+=3)for(let x=P.maxX;x<kerb+.5;x+=.25)assert(world.surfaceAreas.some(a=>a.kind==='path'&&Math.abs(x-a.x)<=a.w/2&&Math.abs(z-a.z)<=a.d/2),`paving between the plaza and the sidewalk at (${x}, ${z})`);
  assert(!/'#d9c8a2'/.test(fs.readFileSync(path.join(base,'lib/town/westPark.ts'),'utf8')),'no part-length centre band on the plaza');}
 // B. Trails: smooth (no kink over 9° between 1.2 m steps), one width, and every end is on the beach or a named destination.
 const ends=[];
 L.PARK_TRAILS.forEach((t,i)=>{const pts=trailLines[i];
  for(let k=1;k<pts.length-1;k++){const a=Math.atan2(pts[k][1]-pts[k-1][1],pts[k][0]-pts[k-1][0]),b=Math.atan2(pts[k+1][1]-pts[k][1],pts[k+1][0]-pts[k][0]);assert(Math.abs(Math.atan2(Math.sin(b-a),Math.cos(b-a)))<9*Math.PI/180,t.id+' smooth at point '+k);}
  for(const [end,kind] of [[pts[0],t.from],[pts[pts.length-1],t.to]]){const [x,z]=end;ends.push([t.id,kind,x,z]);
   const ok=kind==='beach'?L.onBeach(x,z)&&L.trailBeachRun(pts).at(-1)>=5:kind==='ring'?L.segDistance(x,z,ring)<.3:kind==='plaza'?x>=P.minX&&x<=P.maxX&&z>=P.minZ&&z<=P.maxZ:
    kind==='trail'?Math.min(...trailLines.map((l,j)=>j===i?Infinity:L.segDistance(x,z,l)))<.3:kind==='pond'?L.pondQ(x,z,L.POND_RIM+.2)<1&&!L.inPond(x,z,L.TRAIL_WIDTH/2-.01):false;// on the rim's outer edge, its cap clear of the water
   assert(ok,`${t.id} ends at ${kind} (${x.toFixed(1)}, ${z.toFixed(1)})`);}
  assert(!pts.some(([x,z])=>L.inPond(x,z,1)),t.id+' keeps out of the water');});
 // Every trail heading for the coast (its far end within 35 m of the sea) runs onto the beach; the beach ends blend to sand.
 for(const t of L.PARK_TRAILS){const e=t.curve[3];if(distanceToShore(e[0],e[1])<35)assert.equal(t.to,'beach',t.id+' heads for the coast and reaches the beach');}
 assert(L.PARK_TRAILS.filter(t=>t.to==='beach').length>=5&&WP.TRAIL_BEACH.blend>=5,'the coast-bound trails blend into the sand');
 assert(/strokeWidth=\{TRAIL_WIDTH\}/.test(map)&&/parkPathLines\(\)/.test(map)&&/data-west-stadium="apron"/.test(map),'the map draws the world\'s own trail points, width and the apron');
 // C. The pond: bigger (grown south, toward the coast), its rim clear of the apron, the plaza and the beach.
 const PD=L.PARK_POND;assert(PD.rx>=33&&PD.rz>=25&&PD.z+PD.rz>=110,'a bigger pond (Nov 13 2026: ~25% more again), grown south toward the coast');
 for(let a=0;a<360;a+=3){const t=a*Math.PI/180,{x,z}=L.pondEdge(t,L.POND_RIM),o=L.pondEdge(t,L.POND_RIM+3);// the pond's own outline
  assert(!L.onApron(x,z,2)&&L.onGrass(x,z)&&L.onGrass(o.x,o.z),'pond rim on grass, clear of the apron, at '+a+'°');}
 assert(!sim.blocked(PD.x+PD.rx*.5,PD.z,world.obstacles,.32)&&L.pondWade(L.pondEdge(0,-.5).x,PD.z)<.1,'wade in from the bank (shallow at the edge)');
 // No props on paths or in the pond (benches, signs, lamps, planters, trees, palms): every park collider and tree outside the
 // bowl and off the plaza is clear of the water (and its rim), every trail, the ring and the apron.
 const park=o=>o.x<-100&&!L.inStadiumFootprint(o.x,o.z,3)&&!(o.x>P.minX-1.5&&o.x<P.maxX+1.5&&o.z>P.minZ-1.5&&o.z<P.maxZ+1.5);
 const props=[...world.obstacles.filter(o=>park(o)&&!o.dynamic&&(o.w??0)<30),...world.assets.filter(a=>park(a)&&['tree','palm','bench','planter','lamp','sign'].includes(a.kind))];
 let checked=0;for(const o of props){const half=Math.max(o.w??0,o.d??0)/2;checked++;
  assert(L.pondQ(o.x,o.z,L.POND_RIM+half)>=1,`prop at (${o.x.toFixed(1)}, ${o.z.toFixed(1)}) in the pond`);
  assert(!L.onWalkPath(o.x,o.z,half),`prop at (${o.x.toFixed(1)}, ${o.z.toFixed(1)}) on a path (a trail, the ring, the apron or the pond rim)`);}
 assert(checked>200,'props checked '+checked);
 {const s=L.POND_SIGN;assert(!L.onParkPaving(s.x,s.z,1.6)&&!L.inPond(s.x,s.z,L.POND_RIM+1)&&trailD(s.x,s.z)<7,'LILY POND sign on the verge beside the pond walk');}
 // Ground patches (lawns) never meet a path, the apron, the plaza or the pond, and lie on the lawn.
 for(const l of L.PARK_LAWNS)for(let a=0;a<64;a++)for(const k of [0,.5,1]){const t=a/64*Math.PI*2,x=l.x+Math.cos(t)*l.rx*k,z=l.z+Math.sin(t)*l.rz*k;
  assert(!L.onParkPaving(x,z,1)&&!L.inPond(x,z,L.POND_RIM+1)&&L.onGrass(x,z),`lawn at ${l.x},${l.z} meets paving or water at (${x.toFixed(0)}, ${z.toFixed(0)})`);}
 assert.equal(st.hedges,0,'no straight hedge rows (one lay in the pond, two across lawns)');
 // D. The West Beach: every park tree on the sand or along the grass edge is a palm (the broadleaf trees stay inland).
 const parkTrees=world.assets.filter(a=>a.kind==='tree'&&a.x<-100);
 assert(!parkTrees.some(a=>!L.onGrass(a.x,a.z)||L.grassEdgeDistance(a.x,a.z)<WP.PALM_EDGE_M),'no broadleaf / conifer tree on the beach or its edge row');
 const palms=world.assets.filter(a=>a.kind==='palm'&&a.x<-100);assert(palms.length>=40&&palms.every(a=>distanceToShore(a.x,a.z)>=12),'West Beach palms '+palms.length+' (dry sand / edge row)');
 assert(st.trees>=150&&st.trees<=340&&st.trees+st.palms<=340,'park trees '+st.trees+', palms '+st.palms);
 // G. The plaza is just "Plaza" in the world too.
 assert.equal(L.PLAZA_LABEL,'PLAZA');assert(!/STADIUM PLAZA/.test(fs.readFileSync(path.join(base,'lib/town/westPark.ts'),'utf8')),'in-world sign says PLAZA');
 // Pond life: wired in Town; near the pond the koi and dragonflies show and move, far away they hide; a ball dropping in the
 // water splashes (the shared splash and ripple pools) and the koi bolt; still mode holds everything (no splash).
 const town=fs.readFileSync(path.join(base,'components/Town.tsx'),'utf8');
 assert(/createPondLife\(scene,/.test(town)&&/pondLife\.update\(/.test(town)&&/pondLife\.wade\(/.test(town)&&/disposers\.add\(\(\)=>pondLife\.dispose\(\)\)/.test(town),'pond life wired into Town');
 const ps=fs.readFileSync(path.join(base,'lib/town/parkPond.ts'),'utf8');assert(/reefFishModel\('koi'\)/.test(ps)&&/createBugModel\(/.test(ps)&&/InstancedMesh\(fishGeo/.test(ps)&&/InstancedMesh\(flyGeo/.test(ps),'koi and dragonflies reuse the island models, instanced');
 const LIFE=load('lib/town/parkPond.ts'),scn=new T.Scene(),log=[];const life=LIFE.createPondLife(scn,{phone:false,sink:{splash:(x,z,s)=>log.push(['splash',x,z,s]),ring:(x,z,r)=>log.push(['ring',x,z,r])}});
 const inp=(o)=>({x:PD.x+40,z:PD.z,speed:0,onGround:true,ballX:0,ballY:0,ballZ:0,ballOn:false,shown:true,mode:0,...o});
 life.update(1/60,inp({x:500,z:500}));assert(!life.fish.visible&&!life.flies.visible,'far: hidden');
 const f0=new T.Matrix4();life.fish.getMatrixAt(0,f0);const p0=new T.Vector3().setFromMatrixPosition(f0);
 for(let i=0;i<60;i++)life.update(1/60,inp());assert(life.fish.visible&&life.flies.visible,'near: koi and dragonflies show');
 const f1=new T.Matrix4();life.fish.getMatrixAt(0,f1);assert(new T.Vector3().setFromMatrixPosition(f1).distanceTo(p0)>.05,'the koi swim');
 life.update(1/60,inp({ballOn:true,ballX:PD.x,ballZ:PD.z,ballY:1}));life.update(1/60,inp({ballOn:true,ballX:PD.x,ballZ:PD.z,ballY:.2}));assert(log.some(e=>e[0]==='splash'),'a ball landing in the pond splashes');
 log.length=0;for(let i=0;i<90;i++)life.update(1/60,inp({x:PD.x,z:PD.z,speed:2.5}));assert(log.some(e=>e[0]==='ring')&&log.some(e=>e[0]==='splash'),'wading in: a splash, then ripples');
 log.length=0;life.update(1/60,inp({mode:2,ballOn:true,ballX:PD.x,ballZ:PD.z,ballY:1}));life.update(1/60,inp({mode:2,ballOn:true,ballX:PD.x,ballZ:PD.z,ballY:.2}));assert(!log.length,'still mode: no splash');
 life.update(1/60,inp({mode:1}));assert(!life.flies.visible&&life.fish.count===LIFE.POND_LIFE.koi[1],'lite: fewer koi, no dragonflies');
 life.dispose();
 console.log(`stadium park: ok (props checked ${checked}, palms ${palms.length}, park trees ${parkTrees.length}, trail ends ${ends.map(e=>e[0]+':'+e[1]).join(' ')})`);}

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
// Owner, Nov 13 2026: walking on a roof into the tall fascia banner frame must stop at it, never sink through the banner.
{const R=Q.STANDS.find(q=>q.roof),top=Q.ROOF.y+Q.ROOF.thick/2,p=Q.standWorld(R,(Q.ROOF.front+Q.ROOF.back)/2,0),q=Q.standWorld(R,Q.ROOF.back+4,0);
 const t=travel(),pp={...p},v={x:0,z:0};t.reset(pp.x,pp.z,top);const dx=q.x-p.x,dz=q.z-p.z,l=Math.hypot(dx,dz);let fell=false;
 for(let f=0;f<6*60;f++){t.update(1/60,pp,v,{x:dx/l,z:dz/l,sprint:false},'walk');if(t.state.falling)fell=true;}
 const backX=Q.standWorld(R,Q.ROOF.back-.12,0);assert(!fell&&Math.abs(t.state.height-top)<.05,'roof walker stays on the roof at the fascia frame');
 assert(Math.hypot(pp.x-p.x,pp.z-p.z)<Math.hypot(backX.x-p.x,backX.z-p.z),'stopped before the banner frame');}
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
 {const [x,,z]=at(E,7,10),feet=Q.ROOF.y+Q.ROOF.thick/2;for(const [dx,dz] of [[0,0],[3,-20],[-2,25]]){o=view(x+dx,feet,z+dz);assert(o[1]===1,'standing ON the east roof (landed): it stays solid '+o);}}
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
// Polish Nov 13 2026: the aisle centre finds a seat on every row and at any depth in the row; the concourse back and the pitch ring do not; the prompt
// sits above the player (never on them) and joins the HUD arbiter within ~250 ms.
{const {createStadiumSit,HOT_HUD_MS}=load('lib/town/stadiumSit.ts');
 for(const st of Q.STANDS)for(const a of st.aisles)for(let i=0;i<Q.ROWS;i++)for(const f of [.05,.35,.65,.95]){
  const p=Q.standWorld(st,st.inner+(i+f)*Q.ROW_DEPTH,a),hs=[Q.rowHeight(i),Q.rowHeight(i)-Q.TREAD_RISE];
  for(const h of hs){const s=Q.nearestSeat(p.x,p.z,h);assert(s&&s.stand===st.id&&s.row===i,`aisle centre ${st.id} ${a} row ${i} f ${f} h ${h}: a seat in the row beside it`);}}
 for(const st of Q.STANDS){const a=st.aisles[st.aisles.length>>1],back=Q.standWorld(st,st.inner+Q.ROWS*Q.ROW_DEPTH+1.2,a),back2=Q.standWorld(st,Q.standBack(st)-1,a),ring=Q.standWorld(st,st.inner-2,a);
  assert.equal(Q.nearestSeat(back.x,back.z,Q.CONCOURSE_HEIGHT),null,`${st.id}: no prompt on the concourse back`);assert.equal(Q.nearestSeat(back2.x,back2.z,Q.CONCOURSE_HEIGHT),null);
  assert.equal(Q.nearestSeat(ring.x,ring.z,0),null,`${st.id}: no prompt on the pitch ring`);
  const pitch=Q.standWorld(st,st.inner-.3,a);assert.equal(Q.nearestSeat(pitch.x,pitch.z,0),null,'no prompt on the grass at the front row');}
 // The prompt hangs above the player's head on screen (phone), not on them.
 const sit=createStadiumSit({parent:new T.Group(),wake:()=>{}}),W2=Q.STANDS[0],p=Q.standWorld(W2,W2.inner+5*Q.ROW_DEPTH+.65,6),h=Q.rowHeight(5);
 const cam=new T.PerspectiveCamera(40,.5,.5,300);cam.position.set(p.x+9,h+7,p.z);cam.lookAt(p.x,h,p.z);cam.updateMatrixWorld();
 let at=null;const el={hidden:true,dataset:{},textContent:'',setAttribute(){}};sit.want(p.x,p.z,h,true);sit.prompt(el,true,cam,400,800,(e,x,y)=>{at={x,y};},(e,hid)=>{e.hidden=hid;});
 const feet=new T.Vector3(p.x,h,p.z).project(cam),head=new T.Vector3(p.x,h+1.7,p.z).project(cam);assert(at,'placed');
 assert(at.y<=(1-head.y)*400-8,'the Sit button\'s anchor (its bottom edge) is above the player\'s head on screen: '+at.y+' vs '+(1-head.y)*400);assert(at.y<(1-feet.y)*400);
 // Timing: the bowl runs the HUD tick fast (the arbiter sees the Sit offer within one tick of stopping); off the stadium, no extra cost.
 assert(HOT_HUD_MS<=100,'the bowl HUD tick is at most 100 ms (well inside 250 ms with the arbiter\'s one tick)');
 sit.want(0,0,0,true);assert.equal(sit.hot,false,'far from the stadium: the normal 150 ms tick');sit.want(S.x+300,S.z,2,true);assert.equal(sit.hot,false);
 sit.want(p.x,p.z,h,true);assert.equal(sit.hot,true,'in the bowl, up on a row: the fast tick');
 const arb=load('lib/ui/hudStack.ts').createFocusArbiter();let now=1000,shown=-1;const ctx={ridingTruck:false,flying:false,jobActive:false,inGarden:false};
 for(let t=0;t<600&&shown<0;t+=16){now=1000+t;if(t%HOT_HUD_MS<16||t===0){const w=sit.want(p.x,p.z,h,true);if(arb.choose(w?[{kind:'enter',key:w.key,distance:w.distance}]:[],ctx,now)?.key===w.key)shown=t;}}
 assert(shown>=0&&shown<=250,'the Sit offer wins the arbiter within 250 ms: '+shown);}
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
assert(/id:'stadium',label:'DRIP FC STADIUM',point:STADIUM_ARRIVAL/.test(map)&&!/STADIUM GATE/.test(map)&&/id==='stadium'\?'DRIP FC Stadium'/.test(map)&&/\|'summit'\|'stadium';/.test(map),'the map has a Stadium destination');
{const town=fs.readFileSync(path.join(base,'components/Town.tsx'),'utf8');assert(/travel\.current==='stadium'\?STADIUM_ARRIVAL/.test(town)&&/destination==='stadium'\)go\(destination\)/.test(town),'travel lands at the stadium gate');
 assert(L.STADIUM_ARRIVAL.x>L.STADIUM_GATE.x&&onIsland(L.STADIUM_ARRIVAL.x,L.STADIUM_ARRIVAL.z)&&!blocked(L.STADIUM_ARRIVAL.x,L.STADIUM_ARRIVAL.z),'the arrival is open plaza outside the gate');}
console.log('west stadium phase 3a: ok');
// ---- Phase 3b: the crowd, goal frames that stop the ball, portrait framing, exhibitions, the crowd sound -------------------------
{const src=fs.readFileSync(path.join(base,'lib/town/stadiumCrowd.ts'),'utf8');assert(!/'[^'\n`]*\$\{[A-Z_]+\}[^'\n`]*'/.test(src),'crowd shader strings: no ${} inside a plain quoted string (it reaches GLSL literally and the crowd never draws)');}
{const C=load('lib/town/stadiumCrowd.ts'),SS=load('lib/town/stadiumScreen.ts'),seats=Q.seatCount(),fans=C.crowdSeats();
 const share=f=>C.crowdCount(fans,f)/seats,desk=share(C.crowdFill(false,0)),phone=share(C.crowdFill(true,0)),hot=share(C.crowdFill(true,2)),saver=share(C.crowdFill(false,4));
 console.log(`crowd: ${fans.length} fans max; desktop ${(desk*100).toFixed(0)}%, phone ${(phone*100).toFixed(0)}%, phone tier 2 ${(hot*100).toFixed(0)}%, saver ${(saver*100).toFixed(0)}% of ${seats} seats; desktop ${C.crowdCount(fans,C.crowdFill(false,0))*C.FAN_TRIS} tris`);
 assert(desk>=.3&&desk<=.4,'desktop fills 30–40 % of the seats');assert(phone<desk*.75&&hot<phone&&saver<hot,'fewer fans on phones and under heat pressure');
 // Nov 13 2026: mini beans (60–80 triangles each: body, arms, scarf); the whole crowd stays bounded.
 assert(C.crowdCount(fans,C.crowdFill(false,0))*C.FAN_TRIS<=140000,'crowd triangles bounded (desktop ≤ 140k)');
 assert(C.crowdCount(fans,C.crowdFill(true,0))*C.FAN_TRIS<=90000,'crowd triangles bounded (phone ≤ 90k)');
 const g=C.fanGeometry();assert.equal(g.index.count/3,C.FAN_TRIS,'FAN_TRIS triangles a bean');assert(C.FAN_TRIS>=60&&C.FAN_TRIS<=80,'tri budget 60–80');
 assert(g.getAttribute('position').count<=60,'≤ 60 vertices a bean');assert(g.getAttribute('aFan')&&!g.getAttribute('uv'),'part attribute, no uv');
 {const a=g.getAttribute('aFan'),parts=new Set();for(let i=0;i<a.count;i++)parts.add(a.getX(i));assert.deepEqual([...parts].sort(),[0,1,2],'body, arms, scarf');}
 assert(g.boundingBox.max.y>=1.2,'bounds cover a standing bean with its arms up');g.dispose();
 // Seats by the aisles stay free (the end seat of every span), and every fan sits on a real seat.
 for(const s of Q.STANDS)for(const a of s.aisles)assert(!fans.some(f=>{const l=Q.standLocal(s,f.x,f.z);return l.d>s.inner-.1&&l.d<s.inner+Q.ROWS*Q.ROW_DEPTH&&Math.abs(l.a-a)<Q.AISLE_WIDTH/2+Q.SEAT_PITCH*1.4;}),`${s.id} aisle ${a}: free seats beside it`);
 // One instanced draw, built only near the stadium, hidden far away, culled off screen; a goal bounces it via uniforms only.
 const parent=new T.Group(),crowd=C.createStadiumCrowd(parent,false);crowd.update(400,0,0,false,1/60,false);assert(!crowd.mesh&&parent.children.length===0,'far away: nothing built');
 crowd.update(60,S.x+30,S.z,false,1/60,false);const mesh=crowd.mesh;assert(mesh&&mesh.isInstancedMesh&&mesh.visible&&parent.children.length===2&&!mesh.castShadow,'near: one instanced mesh (plus the flags), no shadow pass');
 assert(crowd.flags&&!crowd.flags.isInstancedMesh&&!crowd.flags.castShadow&&crowd.flags.visible,'the stand flags: one merged mesh, no shadows');
 assert.equal(mesh.count,C.crowdCount(fans,C.crowdFill(false,0)));const m0=mesh.instanceMatrix.version;
 const cam=new T.PerspectiveCamera(40,1,1,500);cam.position.set(S.x+150,2,S.z);cam.lookAt(S.x+400,2,S.z);cam.updateMatrixWorld();const fr=new T.Frustum().setFromProjectionMatrix(new T.Matrix4().multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse));
 assert(mesh.frustumCulled&&!fr.intersectsObject(mesh),'looking away from the stadium: culled (0 draws)');cam.lookAt(S.x,2,S.z);cam.updateMatrixWorld();fr.setFromProjectionMatrix(new T.Matrix4().multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse));assert(fr.intersectsObject(mesh),'looking at it: drawn');
 const sh={uniforms:{},vertexShader:'#include <color_vertex>\n#include <beginnormal_vertex>\n#include <begin_vertex>',fragmentShader:'#include <color_fragment>'};mesh.material.onBeforeCompile(sh);const U=sh.uniforms;assert(/uCheer/.test(sh.vertexShader)&&/uClear/.test(sh.vertexShader),'bounce and clearing in the shader');
 for(let i=0;i<30;i++)crowd.update(60,S.x+30,S.z,false,1/60,false);assert.equal(U.uCheer.value,0,'no goal: still');crowd.cheer();crowd.update(60,S.x+30,S.z,false,.3,false);assert(U.uCheer.value>0,'a goal: the stands bounce');
 for(let i=0;i<200;i++)crowd.update(60,S.x+30,S.z,false,1/60,false);assert(U.uCheer.value===0&&!crowd.cheering,'the cheer ends');assert.equal(mesh.instanceMatrix.version,m0,'no per-instance CPU work');
 crowd.cheer();crowd.update(60,S.x+30,S.z,false,.3,true);assert.equal(U.uCheer.value,0,'reduced motion: no bounce');
 {const F=U.uClearF.value;assert(Array.isArray(F)&&F.length>=4&&/uClearF/.test(sh.vertexShader),'friends clear too');crowd.update(60,S.x,S.z,false,1/60,false,[{x:S.x-45,z:S.z}]);assert(F[0].z>0&&F[0].x===S.x-45&&F[1].z<0,'a seated friend: the fan in their seat clears');crowd.update(60,S.x,S.z,false,1/60,false,[]);assert(F[0].z<0,'friend stood up: the fan comes back');}crowd.update(60,S.x-45,S.z,true,1/60,false);assert(U.uClear.value.z>0&&U.uClear.value.x===S.x-45,'up in the stands: the fans round me clear');crowd.update(60,S.x,S.z,false,1/60,false);assert(U.uClear.value.z<0,'on the pitch: nobody cleared');
 crowd.update(400,0,0,false,1/60,false);assert(!mesh.visible&&!crowd.flags.visible,'far away: hidden');crowd.dispose();assert(parent.children.length===0);
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
// ---- DRIP FC Stadium (Nov 13 2026, owner): the name, the gate sign, the painted centre drop, the roof frames ------------------------
{const D=load('lib/stadium/dripfc.ts'),V=load('lib/town/venues.ts'),SS=load('lib/town/stadiumScreen.ts'),W=load('lib/town/stadiumWorld.ts'),Q=load('lib/town/stadiumSeats.ts');
 assert.equal(D.STADIUM_NAME,'DRIP FC Stadium');assert.equal(V.liveVenueById('stadium').name,'DRIP FC Stadium','the venue name the player sees');
 assert(SS.stadiumBarText(false).tag.startsWith('DRIP FC STADIUM')&&SS.stadiumBarText(true).tag.startsWith('DRIP FC STADIUM'),'pitch bar');
 const src=f=>fs.readFileSync(path.join(base,f),'utf8');
 assert(/\['stadium','DRIP FC Stadium \(bowl & pitch\)'\]/.test(src('lib/analytics/islandIds.ts')),'admin place label renamed, id kept');
 for(const f of ['lib/town/venues.ts','lib/town/stadiumSit.ts','lib/town/stadiumScreen.ts','components/IslandOverview.tsx','lib/analytics/islandIds.ts'])assert(!/West Coast Stadium|WEST COAST STADIUM/.test(src(f)),f+': old name gone');
 // Assets: same origin, small, no link to the club anywhere in the game code.
 let bytes=0;for(const u of [...Object.values(D.DRIP_FC_ART),D.PITCH_DROP]){assert(/^\/stadium\/(dripfc|footyaccess)\/[a-z-]+\.webp$/.test(u));bytes+=fs.statSync(path.join(base,'public',u)).size;}
 assert(bytes<150e3,'Drip FC art '+bytes+' B');
 for(const f of ['lib/stadium/dripfc.ts','lib/stadium/sponsors/placeholders.ts','lib/town/stadiumWorld.ts'])assert(!/https?:|dripfcofficial|adidas\.com/.test(src(f)),f+': pictures only, no links');
 // Gate sign: ONE line, the wordmark then "Stadium" on the same baseline (lettered "DRIP FC" until the picture loads).
 const calls=[],c={measureText:t=>({width:t.length*10}),fillRect(){},drawImage:(...a)=>calls.push(['img',...a]),fillText:(t,x,y)=>calls.push(['text',t,x,y])};
 D.drawGateSign(c,512,87,{width:800,height:197});const img=calls.find(k=>k[0]==='img'),txt=calls.find(k=>k[0]==='text');
 assert(img&&txt&&txt[1]==='Stadium'&&txt[2]>img[2]+img[4]-1,'wordmark, then Stadium to its right');
 assert(Math.abs((img[3]+img[5]*D.WORDMARK_CAP)-txt[3])<.5,'same baseline as the wordmark letters');
 calls.length=0;D.drawGateSign(c,512,87,null);assert.deepEqual(calls.map(k=>k[1]),['DRIP FC','Stadium'],'lettered fallback reads DRIP FC Stadium');
 assert(/dressGateSign\(skip\(sign\(STADIUM_NAME,/.test(src('lib/town/stadiumWorld.ts')),'the gate sign is the stadium name');
 // The painted drop: one flat quad in the centre circle, ~70% of its diameter, white semi-transparent lit paint, no depth fight.
 const logo=scene.getObjectByName('stadium-pitch-logo');assert(logo&&logo.isMesh,'the centre drop mesh');
 const m=logo.material,b=new T.Box3().setFromObject(logo),sz=b.getSize(new T.Vector3());
 assert(m.isMeshLambertMaterial&&m.transparent&&!m.depthWrite&&m.polygonOffset&&m.polygonOffsetFactor<0,'lit (no night glow), transparent, depthWrite off, polygon offset');
 assert(m.opacity>=.35&&m.opacity<=.45&&m.color.getHexString()==='ffffff','white paint at 35-45%');
 assert(Math.abs(logo.position.x-S.x)<1e-6&&Math.abs(logo.position.z-S.z)<1e-6&&sz.y<1e-6,'flat on the centre spot');
 assert(Math.abs(sz.z/(2*8.66)-.7)<.02&&sz.x<sz.z,'about 70% of the circle, upright along the pitch (width along the halfway line)');
 assert(logo.position.y>-.034&&logo.position.y<0,'just above the line paint');
 assert(logo.userData.ownDraw&&!logo.castShadow,'its own single draw, no shadow');
 // Roof frames stand proud of the slab (no coplanar faces), and the fascia banner proud of the frame, on both roofs.
 assert(Q.FRAME_PROUD>=.02&&Q.FASCIA_PROUD>=.08);const lay=Q.stadiumSponsorLayout();
 for(const f of lay.fascia)assert(Math.abs(Math.abs(f.x)-(Q.ROOF.back+Q.FRAME_PROUD+Q.FASCIA_PROUD))<1e-9,'fascia banner off the frame face');
 // Nov 13 2026: the taller banner (1.6–2× the old 1.6 m) sits inside the taller frame's face; the frame keeps clear of the slab.
 for(const f of lay.fascia){assert(f.h>=2.56&&f.h<=3.2,'taller fascia banner');assert(f.y-f.h/2>Q.ROOF.y-Q.ROOF.frameBelow&&f.y+f.h/2<Q.ROOF.y+Q.ROOF.frameAbove,'banner inside the frame');}
 assert(Q.ROOF.frameAbove-Q.ROOF.thick/2>1&&Q.ROOF.frameBelow-Q.ROOF.thick/2>.5,'frame clears the slab top and underside');
 for(const r of W.createRoofFade?[0,1]:[]){const roof=scene.getObjectByName('stadium-roof-'+Q.STANDS.filter(q=>q.roof)[r].id),pos=roof.geometry.getAttribute('position'),xs=new Set();
  for(let i=0;i<pos.count;i++)xs.add(Math.round((pos.getX(i)+roof.position.x)*1000));
  const back=Q.standWorld(Q.STANDS.filter(q=>q.roof)[r],Q.ROOF.back,0).x;assert(xs.has(Math.round(back*1000))&&xs.has(Math.round((back+Math.sign(back-S.x)*Q.FRAME_PROUD)*1000)),'roof '+r+': slab back face and the frame face are apart');}
 console.log('drip fc stadium: ok');}

// 6. Night (Nov 13 2026, owner: the floodlights were paint and the pitch was dark): the stadium joins the island pitches' night
// lighting (fieldLighting.ts): lit lenses + one glow draw, the four pooled real spots (no extra light) at the mast heads while the
// player is in or near the bowl, and the night blend reaching the stadium paint and turf through one uniform (stadiumNight.ts).
{const N=load('lib/town/stadiumNight.ts'),chunkMats=scene.children.filter(o=>o.isMesh&&o.name.startsWith('island-chunk-')).map(o=>o.material);
 const nightMats=chunkMats.filter(m=>m.customProgramCacheKey().includes('stadium-night'));
 assert(nightMats.length>=3,'the stadium paint (shadowed + line markings) and turf batches carry the night fill: '+nightMats.length);
 assert(nightMats.some(m=>m.vertexColors)&&nightMats.some(m=>!m.vertexColors),'paint twin and tinted turf');
 for(const m of new Set(nightMats)){const sh={uniforms:{},vertexShader:T.ShaderLib.physical.vertexShader,fragmentShader:T.ShaderLib.physical.fragmentShader};m.onBeforeCompile(sh,null);
  assert(sh.uniforms.uStadiumNight===N.STADIUM_NIGHT&&/vStadiumY=transformed\.y/.test(sh.vertexShader)&&/uStadiumNight\*/.test(sh.fragmentShader),'night patch lands in the shader');}
 const fscene=new T.Scene(),fields=load('lib/town/fields.ts').buildFormatFields(fscene),cam=new T.PerspectiveCamera(50,1,.1,800);cam.position.set(S.x+60,40,S.z);cam.lookAt(S.x,0,S.z);cam.updateMatrixWorld();
 const pool=fscene.getObjectByName('field-floodlight-pool'),lights=pool.children.filter(o=>o.isLight),lens=fscene.getObjectByName('stadium-floodlight-panels'),glow=fscene.getObjectByName('stadium-floodlight-glow');
 assert.equal(lights.length,4,'still four pooled lights');assert(lens&&glow&&glow.isPoints,'lens mesh + glow points');assert.equal(lens.geometry.index.count/3,4*12*12,'4 heads × 12 lenses');
 fields.updateLighting('day',cam,null,1/30,true,false,{x:S.x,y:0,z:S.z});assert.equal(N.STADIUM_NIGHT.value,0);assert(!glow.visible);
 fields.updateLighting('night',cam,null,.2,true,false,{x:S.x-40,y:6,z:S.z+10});// seated in the west stand
 assert.equal(pool.userData.active,'stadium','the pool covers the stadium from the stands');assert(lights.every(l=>l.intensity>0&&l.position.y>25&&!l.castShadow));
 const Q=load('lib/town/stadiumSeats.ts');assert.equal(new Set(lights.map(l=>{const m=Q.MASTS.reduce((a,b)=>Math.hypot(b.x-l.position.x,b.z-l.position.z)<Math.hypot(a.x-l.position.x,a.z-l.position.z)?b:a);assert(Math.hypot(m.x-l.position.x,m.z-l.position.z)<2,'a spot at each mast head');return m;})).size,4);
 assert.equal(N.STADIUM_NIGHT.value,1,'night blend reaches the stadium');assert.equal(lens.material.emissiveIntensity,2.1);assert(glow.visible&&glow.material.opacity>0);
 for(const [dz,y] of [[30,0],[55,0],[0,50]]){fields.updateLighting('night',cam,null,.2,true,false,{x:S.x,y,z:S.z-S.bowlL/2-dz});assert.equal(pool.userData.active,'stadium','still lit '+dz+' m outside the bowl / flying at '+y+' m');}
 fields.updateLighting('night',cam,null,.2,true,false,{x:S.x,y:0,z:S.z-S.bowlL/2-90});assert.notEqual(pool.userData.active,'stadium','far from the stadium releases the pool');
 for(let i=0;i<400;i++)fields.updateLighting('day',cam,null,1/30);assert.equal(N.STADIUM_NIGHT.value,0);assert(!glow.visible);assert.equal(pool.visible,false);
 fields.dispose();console.log('west stadium night lighting: ok');}

// 7. Night lights (Nov 13 2026, owner: "make the stadium look alive at night", stadiumLights.ts): roof lamps in the roof meshes,
// one lamp-hardware mesh (posts, uplights, bollards, gate lamps) and one additive glow mesh (beams, haze, pools, washes), all on the
// shared night factor; no real light; the posts stand off every path with colliders and their pools join the night pools.
{const N=load('lib/town/stadiumNight.ts'),SL=load('lib/town/stadiumLights.ts'),Q=load('lib/town/stadiumSeats.ts'),lights=world.stadiumLights,st=lights.stats;
 const lamps=scene.getObjectByName('stadium-night-lamps'),glow=scene.getObjectByName('stadium-night-glow');
 const kinds={};for(const p of lights.posts)kinds[p.kind]=(kinds[p.kind]??0)+1;
 console.log('stadium night lights:',JSON.stringify(st),'posts',JSON.stringify(kinds));
 assert(lamps&&glow&&lamps.isMesh&&glow.isMesh&&lamps.userData.ownDraw&&glow.userData.ownDraw,'two meshes of their own (2 draws), never batched');
 assert(!lamps.castShadow&&!glow.castShadow&&!glow.material.depthWrite&&glow.material.blending===T.AdditiveBlending,'no shadows; the glow is additive');
 // The lenses: aGlow vertices in the lamp mesh and in both roofs, lit by the night factor (the shared uniform) through one patch.
 const fake=m=>{const sh={uniforms:{},vertexShader:T.ShaderLib.physical.vertexShader,fragmentShader:T.ShaderLib.physical.fragmentShader};m.onBeforeCompile(sh,null);return sh;};
 const lit=g=>{const a=g.getAttribute('aGlow');let n=0;for(let i=0;i<a.count;i++)n+=a.getX(i)>.5?1:0;return n;};
 {const sh=fake(lamps.material);assert(sh.uniforms.uStadiumNight===N.STADIUM_NIGHT&&/vGlow\*uStadiumNight/.test(sh.fragmentShader),'lamp lenses glow on the night factor');assert(lit(lamps.geometry)>0);}
 for(const s of Q.STANDS.filter(q=>q.roof)){const roof=scene.getObjectByName('stadium-roof-'+s.id),sh=fake(roof.material);
  assert(sh.uniforms.uStadiumNight===N.STADIUM_NIGHT&&/vGlow\*uStadiumNight/.test(sh.fragmentShader),s.id+' roof lamps glow on the night factor');
  assert.equal(lit(roof.geometry),SL.roofLampAlongs().length*36,s.id+' roof: a row of lamps in the roof mesh itself (they fade with it)');
  const pos=roof.geometry.getAttribute('position'),a=roof.geometry.getAttribute('aGlow');let ymin=Infinity,ymax=-Infinity;
  for(let i=0;i<pos.count;i++)if(a.getX(i)>.5){const y=pos.getY(i)+roof.position.y;ymin=Math.min(ymin,y);ymax=Math.max(ymax,y);}
  assert(ymax<=Q.ROOF.y-Q.ROOF.thick/2+1e-6&&ymin>=Q.ROOF.y-Q.FRONT_FRAME.below-.01,'hung under the slab, no lower than the front frame');}
 // Day: the factor is 0 (lenses dark) and the glow is hidden; night: shown. Phones on heat tier 2+ keep only the lamps.
 N.setStadiumNight(0,false);assert(!glow.visible,'no glow by day');N.setStadiumNight(1,false);assert(glow.visible,'glow at night');
 N.setStadiumNight(1,true);assert(!glow.visible,'hidden in a lesson view');N.setStadiumNight(0,false);
 assert(glow.material.uniforms.uNight===N.STADIUM_NIGHT&&glow.material.uniforms.uRoofFade===world.stadiumRoofs.fade,'glow reads the night factor and the roof fade');
 assert(SL.beamsAllowed(false,4)&&SL.beamsAllowed(true,1)&&!SL.beamsAllowed(true,2)&&!SL.beamsAllowed(true,4),'phones at tier 2+: no beams');
 assert.equal(st.beams,Math.ceil(SL.roofLampAlongs().length/2)*2,'a beam from every other roof lamp, both roofs');
 // The roof beams fade with their roof: under the west roof, seen from above, the west fade drops; walking away, it is back to 1.
 {const W0=Q.STANDS[0],p=Q.standWorld(W0,50,0),R=world.stadiumRoofs;R.update(1,p.x,3,p.z,p.x+2,40,p.z+2,true);
  assert(R.fade.value.x<.5&&R.fade.value.y===1,'west beams fade with the west roof');R.update(1,S.x,0,S.z-200,S.x,20,S.z-190,true);assert.equal(R.fade.value.x,1);}
 // No new real light: nothing in the lights meshes, no light anywhere near the stadium in the built town.
 let near=0;scene.traverse(o=>{if(o.isLight){const v=o.getWorldPosition(new T.Vector3());if(Math.abs(v.x-S.x)<200&&Math.abs(v.z-S.z)<200)near++;}});
 assert.equal(near,0,'no real light in the stadium area');assert(!lamps.children.length&&!glow.children.length);
 // Posts: round the plaza, the apron and the trails; off every path and the plaza, out of the pond, clear of signs, flags, trees and
 // orchards; 12 m apart; each with a collider and a night pool (one pool batch).
 assert(kinds.plaza>=6&&kinds.apron>=8&&kinds.trail>=12,'posts on every kind of edge');
 // Nov 13 2026: all 10 plaza posts stand (5 a side, evenly spaced, clear of flags, benches and beds; the old list lost 4 to spacing).
 {const pl=lights.posts.filter(p=>p.kind==='plaza');assert.equal(pl.length,10,'10 plaza posts');
  for(const z of [P.minZ-SL.STADIUM_LAMPS.plazaOut,P.maxZ+SL.STADIUM_LAMPS.plazaOut]){const xs=pl.filter(p=>p.z===z).map(p=>p.x).sort((a,b)=>a-b);
   assert.equal(xs.length,5,'5 posts on each long edge');const gaps=xs.slice(1).map((x,i)=>x-xs[i]);assert(Math.max(...gaps)-Math.min(...gaps)<1e-6,'evenly spaced: '+gaps);}
  const props=world.obstacles.filter(o=>o.x<-40&&o.w!==SL.LAMP_POST.collider);
  for(const p of pl)assert(!props.some(o=>Math.abs(p.x-o.x)<o.w/2+.5&&Math.abs(p.z-o.z)<o.d/2+.5),`plaza post (${p.x}, ${p.z}) clear of benches, beds and flags`);}
 const trees=world.assets.filter(a=>a.kind==='tree'||a.kind==='palm'),flags=Q.plazaFlagPoles();
 for(const p of lights.posts){const at=`post (${p.x.toFixed(1)}, ${p.z.toFixed(1)})`;
  assert(!L.onParkPaving(p.x,p.z,SL.LAMP_POST.collider)&&!L.onWalkPath(p.x,p.z,.5),at+' on a path or the plaza');
  assert(!L.inPond(p.x,p.z,L.POND_RIM+1)&&!L.inStadiumFootprint(p.x,p.z,2)&&L.onGrass(p.x,p.z),at+' in the pond, the bowl or on the beach');
  assert(L.PARK_SIGNS.every(([x,z])=>Math.hypot(p.x-x,p.z-z)>=4)&&flags.every(f=>Math.hypot(p.x-f.x,p.z-f.z)>=2),at+' by a sign or flag');
  assert(trees.every(t=>Math.hypot(p.x-t.x,p.z-t.z)>=(t.visualW??1)/2+.4),at+' under a tree');
  assert(world.obstacles.some(o=>o.x===p.x&&o.z===p.z&&o.w===SL.LAMP_POST.collider),at+' has a collider');
  assert(lights.posts.every(q=>q===p||Math.hypot(p.x-q.x,p.z-q.z)>=12),at+' 12 m from the next');}
 {const night=scene.getObjectByName('night-atmosphere'),sites=night.userData.lampSites.filter(s=>s.chunk==='stadium'),pool=scene.getObjectByName('night-pool-chunk-stadium');
  // Nov 13 2026: plus one warm pool in front of the machine row under the big screen (lib/town/stadiumShops.ts), in the same batch.
  const SS=load('lib/town/stadiumShops.ts'),row=sites.filter(q=>q.x===SS.STADIUM_SHOP_X&&Math.abs(q.z-SS.STADIUM_SHOP_WALL_Z-2.4)<.01);assert.equal(row.length,1,'one pool for the machine row');
  assert.equal(sites.length-row.length,lights.posts.length,'every post has a light site');assert(pool&&pool.isInstancedMesh&&pool.count===sites.length,'one pool batch for the stadium posts and the machine row');}
 // Bollards at the foot of every back stair, clear of the stair's walk line; the gate sign lights up at night.
 assert.equal(st.bollards,Q.STANDS.reduce((n,s)=>n+s.stairs.length*2,0));
 for(const s of Q.STANDS)for(const a of s.stairs){const f=Q.standWorld(s,Q.stairEnd(s)+.6,a);assert(!blocked(f.x,f.z),'stair foot open');}
 world.updateTrafficSignals('night');assert(world.stadiumGateSign.emissiveIntensity>0&&world.stadiumGateSign.emissiveMap,'the DRIP FC Stadium sign glows at night');
 world.updateTrafficSignals('day');assert.equal(world.stadiumGateSign.emissiveIntensity,0,'and is plain by day');
 // The light on the stadium itself is in the paint patch (seat pools, beam hits, wall washes): 0 draws.
 {const m=scene.children.find(o=>o.isMesh&&o.name.startsWith('island-chunk-')&&o.material.customProgramCacheKey().includes('stadium-night')).material,sh=fake(m);
  assert(/inLong/.test(sh.fragmentShader)&&/washL/.test(sh.fragmentShader)&&/vStadiumW/.test(sh.vertexShader),'seat pools, beam hits and wall washes in the stadium paint');}
 // Cost: 2 draws (+ 1 pool batch at night), bounded triangles, nothing per frame (uniform writes only).
 assert(st.lampTriangles<=14000&&st.glowTriangles<=600,'bounded: '+st.lampTriangles+' / '+st.glowTriangles+' triangles');
 console.log('west stadium night lights: ok');}
})().catch(e=>{console.error(e);process.exit(1);});
