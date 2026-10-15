// The Summit Isle → Coral Cay Hostel zipline (Oct 14 2026; user: "add a zipline that goes all the way to coral island … while
// sliding down there is animations", then "have the zipline go all the way to the top of Cay guesthouse"). Run: node tests/zipline.cjs
//  1. placement: the tower on the old telescope stand (the lookout's north-west shoulder), clear of the trail, the pitch fence, the
//     flag and cairn, the kiosk, the kick post, the easel, the cannon, the orchard; the deck on the hostel roof, clear of its roof
//     tank and room; nothing of it in the water (no poles: the whale shark's and the mantas' loops, the boats and floats keep theirs)
//  2. the cable: sags (a parabola), steep off the tower, flattening into the roof; its rider's feet (with the swing) clear the
//     terrain, the sea, every tree, palm, building, roof prop and the hostel's own sign and roof all the way
//  3. walking: up the tower's step to the launch spot; on the roof from the landing to the stair, down the stair to the path
//     (never a fall); the roof and deck are landable for the jetpack and parachute
//  4. the ride: ~10–15 s, accelerating then easing into the landing; the runtime on real three.js: nothing at rest (no rAF, timers,
//     meshes), the prompt, clip-on → ride → landing on the deck (walkable), effects only during the ride, the tab hiding finishes it
//     on the deck, a map trip abandons it, analytics counted once
//  5. the camera: replayed through Town's pipeline (60 Hz ticks drawn interpolated) at 20/30/60/120 fps with jitter: smooth
//  6. heat and wiring: the cable is a few short tube pieces in the static batches, ≤ 2 sign draws; Town, world, the maps, analytics
//  7. smoothness on phones (Oct 15 2026): drawn in step with the screen under a phone's uneven frames (20/24/30 fps capped, 60/120
//     desktop), the look-around (eased, soft edges, back to the middle, frame-rate independent, drag + fling, keys), and the ride
//     counting as active (no idle cap, no governor tier change, a held shadow box, late frames keep their time)
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const {createLoader,browser}=require('./summit-harness.cjs');
const ROOT=path.join(__dirname,'..');const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
let failed=0;const ok=async(name,fn)=>{try{await fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};

// The whole island, built the way the game builds it (world.ts in a sandbox with canvas stubs), for clearances and walking.
async function buildWorld(){
 const req=require('node:module').createRequire(ROOT+'/package.json'),T=req('three');
 const utils=await import(ROOT+'/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js');
 const cache=new Map(),gradient={addColorStop(){}};
 const ctx=new Proxy({measureText:t=>({width:t.length*20}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(o,k)=>o[k]??(()=>{})});
 const context=vm.createContext({console,Math,Set,Map,performance,Float32Array,Uint8Array,Uint16Array,Uint32Array,window:{addEventListener(){},removeEventListener(){},matchMedia:()=>({matches:false})},localStorage:{getItem:()=>null,setItem(){}},document:{createElement:()=>({width:0,height:0,getContext:()=>ctx})}});
 const resolve=(file,id)=>{const base=id.startsWith('@/')?path.join(ROOT,id.slice(2)):path.resolve(path.dirname(file),id);for(const e of ['.ts','.tsx','/index.ts',''])if(fs.existsSync(base+e)&&fs.statSync(base+e).isFile())return base+e;throw new Error('cannot resolve '+id);};
 function load(name){const file=path.resolve(ROOT,name);if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
  const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
  vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,id=>id==='react'?{useSyncExternalStore:(_s,get)=>get()}:id==='three'?T:id.includes('BufferGeometryUtils')?utils:id.endsWith('.json')?require(path.resolve(path.dirname(file),id)):id.startsWith('.')||id.startsWith('@/')?load(resolve(file,id)):req(id));
  cache.set(file,mod.exports);return mod.exports;}
 const world=load('lib/town/world.ts').buildTown(new T.Scene());
 return {T,load,world};
}

(async()=>{
const {T,load,world}=await buildWorld();
const Z=load('lib/town/zipline.ts'),ZW=load('lib/town/ziplineWorld.ts'),S=load('lib/town/summitIsle.ts'),CC=load('lib/town/coralCay.ts'),V=load('lib/town/venues.ts'),SIM=load('lib/town/simulation.ts');
const {createRooftopTravel}=load('lib/town/rooftopTravel.ts');
const samples=Z.cableSamples(600);
const planDist=(x,z)=>{let best=Infinity,at=null;for(const s of samples){const d=Math.hypot(s.x-x,s.z-z);if(d<best){best=d;at=s;}}return {d:best,at};};

await ok('placement: the tower on the old telescope stand, clear of the summit\'s things; the deck on the hostel roof',()=>{
 const L=S.SUMMIT_LANDMARKS.lookout,t=Z.ZIP_TOWER;
 assert.deepEqual([t.x,t.z],[L.x-9.2,L.z-1.75],'the tower stands on the removed telescope\'s spot (lookout + (-9.2, -1.75))');
 assert(Math.hypot(t.x-602.8,t.z-101.45)<.01,'(602.8, 101.45) on today\'s island');
 assert(S.onSummitIsle(t.x,t.z)&&t.deck-t.ground<2.2&&t.deck>S.SUMMIT_HEIGHT*.9&&t.steps.length>=2,'on the summit\'s shoulder, the deck a few steps up');
 assert(S.summitTrailDistance(t.x,t.z)>5,'off the trails');
 const P=S.SUMMIT_PITCH,F=S.SUMMIT_FENCE,h=Z.ZIP_PLATFORM.size/2+1;
 assert(Math.abs(t.x-P.x)>F.halfX+h||Math.abs(t.z-P.z)>F.halfZ+h,'outside the pitch fence');
 assert(Math.hypot(t.x-L.x,t.z-L.z)>=8&&Math.hypot(t.x-(L.x+3.6),t.z-L.z)>=10,'clear of the flag and the cairn');
 const kick=load('lib/town/summitKick.ts').kickLayout(),snack=load('lib/town/vendingPlaces.ts').summitSnackSpot();
 assert(Math.hypot(t.x-kick.post.x,t.z-kick.post.z)>15&&Math.hypot(t.x-snack.x,t.z-snack.z)>12,'clear of the kick post and the kiosk');
 try{const E=load('lib/town/paintEasel.ts').easelSpot();assert(Math.hypot(t.x-E.x,t.z-E.z)>=8,'clear of the painting easel');}catch(e){if(!/cannot resolve/.test(String(e)))throw e;}
 try{const C=load('lib/town/ballCannon.ts').cannonLayout();assert(Math.hypot(t.x-C.x,t.z-C.z)>=15,'clear of the ball cannon');}catch(e){if(!/cannot resolve/.test(String(e)))throw e;}
 // The roof deck: on the hostel roof, clear of its tank and stepped roof room (the roof props the world scan found).
 const H=CC.HOSTEL,D=Z.ZIP_DECK;
 assert(D.x-D.w/2>H.x-H.w/2&&D.x+D.w/2<=H.x+H.w/2+.01&&D.z-D.d/2>H.z-H.d/2&&D.z+D.d/2<H.z+H.d/2,'the deck is on the hostel roof');
 assert.equal(Z.HOSTEL_ROOF,world.buildings.find(b=>b.name==='CORAL CAY HOSTEL').height,'the roof height is the building\'s');
 const own=new Set(['deck','rail']);
 for(const o of world.roofObstacles.filter(o=>Math.abs(o.floor-Z.HOSTEL_ROOF)<.01&&Math.abs(o.x-H.x)<H.w/2&&Math.abs(o.z-H.z)<H.d/2&&o.w>=.5&&o.d>=.5&&o.top<Z.HOSTEL_ROOF+2&&o.w<7))
  if(o.top-o.floor>.9&&!(Math.abs(o.x-Z.ZIP_ANCHOR_ROOF.x)<.3))assert(Math.abs(o.x-D.x)>=o.w/2+D.w/2||Math.abs(o.z-D.z)>=o.d/2+D.d/2,`the deck clears the roof prop at (${o.x.toFixed(1)}, ${o.z.toFixed(1)})`);
 void own;
 assert(Math.abs(Z.ZIP_LAND.x-D.x)<D.w/2-.6&&Math.abs(Z.ZIP_LAND.z-D.z)<D.d/2-.6,'the rider lets go on the deck');
 // Nothing of the zipline stands in the water: the tower on Summit Isle, the deck and stair on and against the hostel.
 const CL=load('lib/town/coralCay.ts');assert(CL.onCay(Z.ZIP_STAIR.bottom.x,Z.ZIP_STAIR.bottom.z)&&CL.inHostelArea(Z.ZIP_STAIR.bottom.x,Z.ZIP_STAIR.bottom.z),'the stair ends on the hostel\'s lawn');
 assert(CL.distanceToCayShore(Z.ZIP_STAIR.bottom.x,Z.ZIP_STAIR.bottom.z)>15,'well inland');
 // The sea life, boats and floats keep their water: no pole anywhere, the structures are all on land.
 const shark=load('lib/town/summitSeaLife.ts').WHALE_SHARK_LOOP.points,mantas=load('lib/town/mantaLoops.ts').MANTA_LOOPS.flatMap(m=>m.points);
 const structures=[{x:t.x,z:t.z},{x:D.x,z:D.z},Z.ZIP_STAIR.bottom];
 for(const p of structures){for(const q of [...shark,...mantas])assert(Math.hypot(p.x-q.x,p.z-q.z)>20,'no structure near a sea-life loop');}
 const boats=load('lib/town/fishing/deepSeaBoatData.ts').DEEP_SEA_BOATS;for(const b of boats){const d=planDist(b.mooring.x,b.mooring.z).d;assert(d>60,`the cable is far from the ${b.spotId} (${d.toFixed(0)} m)`);}
 const fish=load('lib/town/fishing/fishCatalog.ts').FISH_SPOTS;for(const f of fish)for(const p of structures)assert(Math.hypot(f.x-p.x,f.z-p.z)>12,`clear of the ${f.id} fishing spot`);
 // Hidden balls on the ground keep a clear berth from the tower, the deck and the stair.
 const quest=load('lib/town/coinQuest.ts').COIN_QUEST;for(const b of quest){if(b.y>2&&!(Math.abs(b.x-D.x)<10&&Math.abs(b.z-D.z)<10))continue;for(const p of structures)assert(Math.hypot(b.x-p.x,b.z-p.z)>4||Math.abs(b.y-(p===structures[1]?D.height:0))>3,`clear of the ${b.id} ball`);}
});

await ok('the cable: a sagging span, steep off the tower and easing into the roof; the rider clears everything below it',()=>{
 assert(Z.ZIP_SPAN>200&&Z.ZIP_SPAN<260,'one long span to Coral Cay ('+Z.ZIP_SPAN.toFixed(0)+' m)');
 const mid=Z.cableAt(.5),straight=(Z.cableAt(0).y+Z.cableAt(1).y)/2;assert(Math.abs(straight-mid.y-Z.ZIP_SAG)<1e-9&&Z.ZIP_SAG>=3,'sags at mid-span');
 assert(Z.cableGrade(0)<-.2&&Z.cableGrade(1)>-.12&&Z.cableGrade(1)<0,'steep off the tower, flattening (still downhill) into the roof');
 for(let i=1;i<samples.length;i++)assert(samples[i].cable<samples[i-1].cable,'always downhill');
 // Endpoints: the rider stands on the tower deck at the launch and on the roof deck at the landing.
 assert(Math.abs(Z.cableAt(0).y-Z.ZIP_HANG-Z.ZIP_TOWER.deck)<1e-9&&Math.abs(Z.cableAt(1).y-Z.ZIP_HANG-Z.ZIP_DECK.height)<1e-9,'feet on the decks at both ends');
 // Terrain and water (the feet include a 0.3 m swing allowance; the sea's surface is at y 0).
 let terrain=Infinity,launch=Infinity,sea=Infinity;
 for(const s of samples){if(s.t>.965)continue;const g=V.fieldSurfaceHeight(s.x,s.z),off=s.t*Z.ZIP_SPAN;if(off<1.5)continue;
  if(g>.2){if(off<6)launch=Math.min(launch,s.feet-g);else terrain=Math.min(terrain,s.feet-g);}else sea=Math.min(sea,s.feet);}
 assert(launch>=1.5,`≥ 1.5 m over the grass just off the platform (${launch.toFixed(2)})`);
 assert(terrain>=2,`≥ 2 m over the slope and beaches (${terrain.toFixed(2)})`);assert(sea>=8,`high over the water (${sea.toFixed(1)} m)`);
 // Trees, palms and every other prop with a canopy, along the whole line.
 for(const a of world.assets){if(!a.canopyHeight)continue;const r=Math.max(a.visualW??0,a.visualD??0,a.w??0)/2,{d,at}=planDist(a.x,a.z);if(d>r+1.2||at.t<.01)continue;
  assert(at.feet>a.canopyHeight+1,`${a.kind} at (${a.x.toFixed(1)}, ${a.z.toFixed(1)}) top ${a.canopyHeight.toFixed(1)}: feet at ${at.feet.toFixed(1)}`);}
 // Buildings: every one but the hostel by 2 m; the hostel's south roof edge, where the rider comes in, by ≥ 0.4 m (with the swing
 // allowance), and over its roof the feet (no allowance) stay above the roof until the deck.
 const H0=CC.HOSTEL,edge=H0.z+H0.d/2;
 for(const b of world.buildings){if(b.name==='CORAL CAY HOSTEL')continue;let worst=Infinity;for(const s of samples){if(Math.abs(s.x-b.x)<b.w/2+1&&Math.abs(s.z-b.z)<b.d/2+1)worst=Math.min(worst,s.feet-b.height);}
  if(worst===Infinity)continue;assert(worst>=2,`${b.name}: feet ${worst.toFixed(2)} m above its roof`);}
 {let atEdge=Infinity,over=Infinity;for(const s of samples){if(Math.abs(s.z-edge)<1)atEdge=Math.min(atEdge,s.feet-Z.HOSTEL_ROOF);if(s.z<edge&&s.t<1)over=Math.min(over,s.feet+.3-Z.HOSTEL_ROOF);}
  assert(atEdge>=.4,`over the hostel's south roof edge by ${atEdge.toFixed(2)} m`);assert(over>=Z.ZIP_DECK.height-Z.HOSTEL_ROOF-1e-9,`above the roof until the deck (${over.toFixed(2)})`);}
 // Roof props and rails (everything but the zipline's own deck pieces at the very end).
 for(const o of world.roofObstacles){for(const s of samples){if(s.t>.985||s.t<.004)continue;if(Math.abs(s.x-o.x)<o.w/2+.5&&Math.abs(s.z-o.z)<o.d/2+.5)assert(s.feet>o.top+.3,`roof prop at (${o.x.toFixed(1)}, ${o.z.toFixed(1)}) top ${o.top.toFixed(1)} under the rider (${s.feet.toFixed(2)})`);}}
 // On the roof the rider's body (feet to hands) passes clear of the deck's own rails, mast and sign until the stop.
 for(const o of world.roofObstacles){if(Math.abs(o.floor-(Z.HOSTEL_ROOF-.1))>.05)continue;for(const s of samples){if(s.t<.95||s.t>1)continue;const feet=s.feet+.3;
  if(feet<o.top&&feet+1.9>o.floor)assert(Math.abs(s.x-o.x)>o.w/2+.35||Math.abs(s.z-o.z)>o.d/2+.35,`the rider passes clear of the deck prop at (${o.x.toFixed(1)}, ${o.z.toFixed(1)})`);}}
 // The hostel's big sign on the south parapet (x 550.8–561.2, up to y 9.35): the rider passes east of it.
 const H=CC.HOSTEL,front=H.z+H.d/2-.4;const at=samples.reduce((b,s)=>Math.abs(s.z-front)<Math.abs(b.z-front)?s:b);
 assert(at.x-.5>H.x+5.2+.8,`the rider passes ${(at.x-.5-(H.x+5.2)).toFixed(1)} m east of the hostel's sign`);
});

await ok('walking: up the tower step to the launch, down from the roof deck by the stair (no falls); roofs stay landable',()=>{
 const roofTravel=()=>createRooftopTravel([...world.buildings,...world.walkSurfaces],world.obstacles,{x:0,z:0},world.roofObstacles,()=>0,world.landingExclusions);
 const walk=(rt,p,targets,limit=60*30)=>{const v={x:0,z:0};let i=0,fell=false,maxDrop=0;for(const t of targets){for(;i<limit;i++){const dx=t.x-p.x,dz=t.z-p.z,d=Math.hypot(dx,dz);if(d<.35)break;
    rt.update(1/60,p,v,{x:dx/d,z:dz/d,sprint:false},'walk');if(rt.state.falling||rt.state.recovery>0)fell=true;}}return {fell,ticks:i};};
 // The tower: from the grass east of the step, up onto the deck and to the launch spot.
 {const rt=roofTravel(),t=Z.ZIP_TOWER,p={x:t.x+Z.ZIP_PLATFORM.size/2+2.2,z:t.z};rt.reset(p.x,p.z);
  // In over the step's south half (the gantry's posts stand either side of the cable), then to the launch spot.
  const r=walk(rt,p,[{x:t.x+.9,z:t.z+.9},{x:Z.ZIP_LAUNCH.x+.2,z:t.z+.5},{x:Z.ZIP_LAUNCH.x,z:Z.ZIP_LAUNCH.z+.3}]);
  assert(!r.fell,'no fall');assert(Math.hypot(p.x-Z.ZIP_LAUNCH.x,p.z-Z.ZIP_LAUNCH.z-.3)<.5,`reached the launch spot (${p.x.toFixed(2)}, ${p.z.toFixed(2)})`);assert(Math.abs(rt.state.height-t.deck)<.01,'standing on the deck');}
 // The roof: from the landing, east onto the stair's top landing, then down the treads to the path by the verandah.
 {const rt=roofTravel(),L=Z.ZIP_LAND,St=Z.ZIP_STAIR,p={x:L.x,z:L.z};rt.reset(p.x,p.z);
  assert(Math.abs(rt.state.height-Z.ZIP_DECK.height)<.01,'the landing spot is the deck\'s height (walkable: never under the roof)');
  assert(rt.canLand(L.x,L.z)&&rt.canLand(Z.ZIP_DECK.x,Z.ZIP_DECK.z+1.2)&&rt.canLand(CC.HOSTEL.x-4,CC.HOSTEL.z+3),'the deck and the roof are landable (jetpack, parachute)');
  const r=walk(rt,p,[{x:St.landing.x,z:St.landing.z},{x:St.treads[0].x,z:St.treads[0].z},{x:St.bottom.x,z:St.bottom.z},{x:St.bottom.x+1,z:St.bottom.z+2}]);
  assert(!r.fell,'down the stair without a fall');assert(rt.state.height<.05&&p.z>St.bottom.z,`down on the ground by the verandah (height ${rt.state.height.toFixed(2)}, z ${p.z.toFixed(1)})`);
  // And back up again from the path.
  const back=walk(rt,p,[{x:St.bottom.x,z:St.bottom.z},{x:St.treads[0].x,z:St.treads[0].z},{x:St.landing.x,z:St.landing.z},{x:Z.ZIP_DECK.x,z:Z.ZIP_DECK.z+1}]);
  assert(!back.fell&&Math.abs(rt.state.height-Z.ZIP_DECK.height)<.01,'and back up to the deck');}
 // Stair geometry: every rise ≤ 0.35 (the walk solver's step), the outer handrail barrier.
 const St=Z.ZIP_STAIR;assert(St.rise<=.3+1e-9&&St.treads.length>=24,'a real stair: '+St.treads.length+' treads of '+St.rise.toFixed(3)+' m');
 assert(world.roofObstacles.some(o=>Math.abs(o.x-St.rail)<.01&&o.d>9),'a handrail barrier along the outer side');
});

// Oct 14 2026, user: "riding gets stuck going down here" (a bike at the top of the hostel's outside stair). The stair is 1.6 m
// between the wall and its handrail, a ride's 0.8 m collision radius each side, so a ride wedged at the top (and its foot, beside
// the wall, turned a ride away at the bottom). On and next to steps a ride narrows to RIDE_STAIR_RADIUS (rooftopTravel.ts).
await ok('riding and walking down and up the hostel stair: no stall, no fall, at 20/30/60 fps',()=>{
 const {RIDE_STAIR_RADIUS}=load('lib/town/rooftopTravel.ts');assert(RIDE_STAIR_RADIUS<=.5,'a ride narrows on steps');
 const St=Z.ZIP_STAIR,down=[{x:Z.ZIP_LAND.x,z:Z.ZIP_LAND.z},{x:St.landing.x,z:St.landing.z},{x:St.treads[0].x,z:St.treads[0].z},{x:St.bottom.x,z:St.bottom.z},{x:St.bottom.x+1,z:St.bottom.z+2}];
 const drive=(mode,route,fps)=>{const rt=createRooftopTravel([...world.buildings,...world.walkSurfaces],world.obstacles,{x:0,z:0},world.roofObstacles,()=>0,world.landingExclusions,world.canopies);
  const p={...route[0]},v={x:0,z:0},stick={x:0,z:0,sprint:false};rt.reset(p.x,p.z);let k=1,acc=0,ticks=0,slow=0,worst=0,fell=false;
  for(let f=0;f<fps*30&&k<route.length;f++){while(k<route.length&&Math.hypot(route[k].x-p.x,route[k].z-p.z)<.4)k++;if(k>=route.length)break;const dx=route[k].x-p.x,dz=route[k].z-p.z,d=Math.hypot(dx,dz);stick.x=dx/d;stick.z=dz/d;
   acc+=1/fps;while(acc>=1/60-1e-9){acc-=1/60;rt.update(1/60,p,v,stick,mode);ticks++;if(rt.state.falling||rt.state.recovery>0)fell=true;if(ticks>30&&Math.hypot(v.x,v.z)<.5)slow++;else slow=0;worst=Math.max(worst,slow/60);}}
  return {done:k>=route.length,secs:ticks/60,worst,fell,h:rt.state.height};};
 for(const mode of ['bike','scooter','moped','walk'])for(const fps of [20,30,60]){
  const d=drive(mode,down,fps);assert(d.done&&!d.fell&&d.h<.05,`${mode} @${fps} fps: down the stair to the path (${d.done?d.secs.toFixed(1)+' s':'stuck'}, height ${d.h.toFixed(2)})`);
  assert(d.worst<=.25,`${mode} @${fps} fps: never stalls going down (${d.worst.toFixed(2)} s)`);
  const u=drive(mode,[...down].reverse(),fps);assert(u.done&&!u.fell&&Math.abs(u.h-Z.ZIP_DECK.height)<.01,`${mode} @${fps} fps: up the stair to the deck (${u.done?u.secs.toFixed(1)+' s':'stuck'}, height ${u.h.toFixed(2)})`);
  assert(u.worst<=.25,`${mode} @${fps} fps: never stalls going up (${u.worst.toFixed(2)} s)`);}
});

await ok('the ride: ~10–15 s, quick off the tower, easing into the roof',()=>{
 const R=Z.ZIP_RIDE,total=R.clip+R.seconds+R.land;assert(total>=10&&total<=16,'ride time '+total.toFixed(1)+' s');
 let last=-1;for(let i=0;i<=500;i++){const f=Z.rideProgress(i/500);assert(f>=last-1e-12,'monotonic');last=f;}
 assert.equal(Z.rideProgress(0),0);assert(Math.abs(Z.rideProgress(1)-1)<1e-9);
 const v=i=>Z.rideSpeed(i/100);let peak=0;for(let i=0;i<=100;i++)if(v(i)>v(peak))peak=i;
 assert(peak>=25&&peak<=50,'the top speed comes in the first half (τ '+peak/100+')');assert(Z.rideSpeed(.97)<Z.ZIP_TOP_SPEED*.35&&Z.rideSpeed(1)<.01,'eases into the landing');
 assert(Z.ZIP_TOP_SPEED<=30&&Z.ZIP_SPAN/R.seconds>=12,'fun, not frightening: top '+Z.ZIP_TOP_SPEED.toFixed(1)+' m/s, average '+(Z.ZIP_SPAN/R.seconds).toFixed(1));
 const p=Z.ridePoint(R.seconds*.5);assert(Math.abs(p.feet.y-(p.trolley.y-Z.ZIP_HANG))<1e-9,'the rider hangs under the trolley');
});

// ---- The runtime on real three.js (ESM), with browser stubs that count frame loops and timers.
const env=browser();const T3=await import('three');
const counted=[];
const rl=createLoader({'three':T3,'analytics/summitEvents':{countZiplineRide:()=>counted.push('su:zipline_ride')}});
const ZR=rl('lib/graphics/zipline.ts'),ZS=rl('lib/town/zipline.ts');
function makeRuntime(opts={}){
 const scene=new T3.Scene(),log={placed:[],landed:[],touch:0,whoosh:0,dismount:0},loc={x:0,z:0,y:0};
 const zip=ZR.createZipline(scene,{place:(x,z,y)=>{loc.x=x;loc.z=z;loc.y=y;log.placed.push({x,z,y});},land:(x,z,yaw)=>{loc.x=x;loc.z=z;loc.y=ZS.ZIP_DECK.height;log.landed.push({x,z,yaw});},
  dismount:()=>{log.dismount++;return true;},where:()=>({...loc}),touchdown:()=>{log.touch++;},whoosh:()=>{log.whoosh++;},busy:()=>false,...opts});
 const btn={hidden:true,dataset:{},style:{setProperty(){},getPropertyValue(){return '';}}};
 const camera=new T3.PerspectiveCamera(40,390/844,.5,500);camera.position.set(loc.x+16,loc.y+23,loc.z+33);camera.lookAt(loc.x,loc.y,loc.z);camera.updateMatrixWorld();
 const ctx=(x,z,extra={})=>({x,z,onFoot:true,onRide:false,canEnter:true,reduced:false,camera,width:390,height:844,focusKey:'zipline',ui:()=>btn,place(){},hide(e,h){e.hidden=h;},...extra});
 const player=new T3.Object3D();
 return {scene,zip,log,loc,btn,camera,ctx,player};
}
const input=()=>({x:0,z:0,kick:false,juggle:false});

await ok('runtime: nothing at rest; the prompt; clip on → ride → land on the deck; effects only while riding',async()=>{
 const r=makeRuntime(),{zip,scene,log,loc,ctx,btn,camera,player}=r;
 const before=scene.children.length;
 await env.watchTimers(async()=>{for(let i=0;i<300;i++){assert.equal(zip.update(ctx(100,-20)),null);assert.equal(zip.holdPlayer(input(),new Set(),1/60),false);zip.pose(player,.5,1/60,false);zip.applyCamera(camera,1/60,false);}});
 assert.equal(env.counts.raf,0,'no rAF');assert.equal(env.counts.timeout+env.counts.interval,0,'no timers');assert.equal(scene.children.length,before,'no meshes at rest');
 // Near the tower: the prompt (on foot, and from a ground ride a little further out).
 const L=ZS.ZIP_LAUNCH;loc.x=L.x+2.2;loc.z=L.z+.4;loc.y=ZS.ZIP_TOWER.deck-.3;camera.position.set(loc.x+16,loc.y+23,loc.z+33);camera.lookAt(loc.x,loc.y,loc.z);camera.updateMatrixWorld();
 assert.equal(zip.update(ctx(loc.x,loc.z))?.key,'zipline');assert.equal(btn.hidden,false,'"Ride the zipline" shows');
 assert.equal(zip.update(ctx(L.x+20,L.z)),null,'not from far away');
 assert.equal(zip.update(ctx(L.x+3.9,L.z,{onFoot:false,onRide:true}))?.key,'zipline','from a scooter or bike too');
 zip.update(ctx(loc.x,loc.z));
 // Tap: clip on, ride, land.
 ZS.zipActions.ride();assert.equal(zip.phase,'clip');assert.equal(counted.length,1,'su:zipline_ride counted');assert(scene.children.length>before,'the trolley and speed lines appear');
 assert.equal(ZS.zipStore.get().riding,true);
 const keys=new Set();let ticks=0,maxGap=0,prev=null,lowest=Infinity,lines=null,views=0;
 while(zip.phase!=='idle'&&ticks<60*40){const held=zip.holdPlayer({...input(),kick:true},keys,1/60);assert(held,'the ride holds the player every tick');ticks++;
  zip.pose(player,1,1/60,false);zip.applyCamera(camera,1/60,false);
  if(zip.phase==='ride'){const p=log.placed[log.placed.length-1];if(prev)maxGap=Math.max(maxGap,Math.hypot(p.x-prev.x,p.z-prev.z));prev=p;lowest=Math.min(lowest,p.y);
   // The ride camera looks down the cable toward Coral Cay (not back at the tower), level, with the rider in view.
   if(zip.stats.blend>=1){const f=new T3.Vector3();camera.getWorldDirection(f);assert(f.x*ZS.ZIP_DIR.x+f.z*ZS.ZIP_DIR.z>.6&&f.y<-.05,'looking ahead and down the cable');
    const side=new T3.Vector3(1,0,0).applyQuaternion(camera.quaternion);assert(Math.abs(side.y)<.02,'a level horizon');
    const r=player.position.clone().project(camera);assert(Math.abs(r.x)<.8&&Math.abs(r.y)<.8&&r.z<1,'the rider is on screen');views++;}
   lines=scene.getObjectByName('zipline-speed-lines')??lines;}}
 const secs=ticks/60,R=ZS.ZIP_RIDE;assert(Math.abs(secs-(R.clip+R.seconds+R.land))<.1,'the ride took '+secs.toFixed(2)+' s');
 assert(maxGap<ZS.ZIP_TOP_SPEED/60+.05,'moves smoothly along the cable (≤ '+maxGap.toFixed(2)+' m a tick)');
 assert(lowest>=ZS.ZIP_DECK.height-.01,'never below the roof deck');
 assert.equal(log.landed.length,1,'lands once');assert.deepEqual([log.landed[0].x,log.landed[0].z],[ZS.ZIP_LAND.x,ZS.ZIP_LAND.z],'on the roof deck');
 assert.equal(log.touch,1,'landing dust once');assert(log.whoosh>=2,'whooshes at the launch and at speed');
 assert(views>600,'the ride camera checked over the ride');assert(lines,'speed lines while riding');assert.equal(scene.children.length,before,'everything is disposed after the ride');
 assert.equal(ZS.zipStore.get().riding,false);assert.match(ZS.zipStore.get().note,/Coral Cay Hostel roof/);
 // The camera eases back to the follow camera, then stops touching it.
 for(let i=0;i<120;i++)zip.applyCamera(camera,1/60,false);assert.equal(zip.stats.blend,0,'blended back');
 const q=camera.quaternion.clone();zip.applyCamera(camera,1/60,false);assert(q.equals(camera.quaternion),'idle: the camera is untouched');
});

await ok('runtime: the hop-off from a ride, the tab hiding mid-ride (finishes on the deck), a map trip (abandons), reduced motion',async()=>{
 {const r=makeRuntime(),{zip,log,loc,ctx}=r,L=ZS.ZIP_LAUNCH;loc.x=L.x+3.5;loc.z=L.z;zip.update(ctx(loc.x,loc.z,{onFoot:false,onRide:true}));
  assert.equal(zip.ride(),true);assert.equal(log.dismount,1,'hops off the ride first');assert.equal(zip.phase,'arriving');
  zip.holdPlayer(input(),new Set(),1/60);zip.update(ctx(loc.x,loc.z));assert.equal(zip.phase,'clip','then clips on, on foot');zip.dispose();}
 {const r=makeRuntime(),{zip,log,loc,ctx,scene}=r,L=ZS.ZIP_LAUNCH;loc.x=L.x+1;loc.z=L.z;zip.update(ctx(loc.x,loc.z));zip.ride();
  for(let i=0;i<60*5;i++)zip.holdPlayer(input(),new Set(),1/60);assert.equal(zip.phase,'ride');
  document.hidden=true;document.dispatchEvent({type:'visibilitychange'});document.hidden=false;
  assert.equal(zip.phase,'idle','the tab hiding ends the ride');assert.equal(log.landed.length,1,'on the deck at once');assert.equal(scene.children.length,0,'nothing left behind');zip.dispose();}
 {const r=makeRuntime(),{zip,log,loc,ctx}=r,L=ZS.ZIP_LAUNCH;loc.x=L.x+1;loc.z=L.z;zip.update(ctx(loc.x,loc.z));zip.ride();
  for(let i=0;i<60*3;i++)zip.holdPlayer(input(),new Set(),1/60);loc.x=100;loc.z=-35;// a map trip
  assert.equal(zip.holdPlayer(input(),new Set(),1/60),false);assert.equal(zip.phase,'idle','a map trip mid-ride ends it where you went');assert.equal(log.landed.length,0);zip.dispose();}
 {const r=makeRuntime(),{zip,loc,ctx,player}=r,L=ZS.ZIP_LAUNCH;loc.x=L.x+1;loc.z=L.z;zip.update(ctx(loc.x,loc.z,{reduced:true}));zip.ride();let maxRoll=0,maxSwing=0;
  for(let i=0;i<60*15&&zip.phase!=='idle';i++){zip.holdPlayer(input(),new Set(),1/60);zip.pose(player,1,1/60,true);maxRoll=Math.max(maxRoll,Math.abs(zip.drawn.roll));maxSwing=Math.max(maxSwing,Math.abs(zip.drawn.swing));}
  assert.equal(maxRoll,0,'reduced motion: no sway');assert(maxSwing<.25,'reduced motion: a calm swing ('+maxSwing.toFixed(2)+')');zip.dispose();}
});

await ok('the camera: smooth through Town\'s pipeline at 20 / 30 / 60 / 120 fps with frame jitter',()=>{
 function run(fps,jitterMs,seed=7){let s=seed;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;
  const r=makeRuntime(),{zip,loc,ctx,camera,player}=r,L=ZS.ZIP_LAUNCH;loc.x=L.x+1;loc.z=L.z+.5;loc.y=ZS.ZIP_TOWER.deck;
  zip.update(ctx(loc.x,loc.z));zip.ride();let acc=0,t=0;const frames=[];const prevLoc={...loc};
  while(t<20&&(zip.phase!=='idle'||zip.stats.blend>0)){const ms=1000/fps+(rnd()-.5)*2*jitterMs,dt=Math.min(ms/1000,.05);t+=dt;acc+=dt;
   while(acc>=1/60){prevLoc.x=loc.x;prevLoc.z=loc.z;zip.holdPlayer(input(),new Set(),1/60);acc-=1/60;}
   const blend=acc*60,vx=prevLoc.x+(loc.x-prevLoc.x)*blend,vz=prevLoc.z+(loc.z-prevLoc.z)*blend;
   // Town's follow camera (eased at 4/s toward the walk offset), then the zipline's camera over it.
   const k=1-Math.exp(-dt*4);camera.position.x+=(vx+16-camera.position.x)*k;camera.position.z+=(vz+33-camera.position.z)*k;camera.position.y+=(loc.y+23-camera.position.y)*k;
   camera.lookAt(camera.position.x-16,camera.position.y-23,camera.position.z-33);
   zip.pose(player,blend,dt,false);zip.applyCamera(camera,dt,false);
   frames.push({t,dt,ride:zip.phase==='ride',p:camera.position.clone(),rp:player.position.clone(),tp:new T3.Vector3(zip.drawn.px,zip.drawn.py,zip.drawn.pz)});}
  let cam=0,rel=0,at=0,swingJerk=0;
  for(let i=2;i<frames.length;i++){const a=frames[i-2],b=frames[i-1],f=frames[i];if(!a.ride||!f.ride)continue;
   const v1=b.p.clone().sub(a.p).divideScalar(b.dt),v2=f.p.clone().sub(b.p).divideScalar(f.dt),dv=v2.sub(v1).length();if(dv>cam){cam=dv;at=i;}
   // The trolley holds still on screen (the camera rides with it), and the rider's swing under it has no frame-to-frame kicks.
   const o1=b.tp.clone().sub(b.p),o2=f.tp.clone().sub(f.p);rel=Math.max(rel,o2.sub(o1).length());
   const s0=a.rp.clone().sub(a.tp),s1=b.rp.clone().sub(b.tp),s2=f.rp.clone().sub(f.tp);swingJerk=Math.max(swingJerk,s2.sub(s1).divideScalar(f.dt).sub(s1.clone().sub(s0).divideScalar(b.dt)).length());}
  zip.dispose();if(process.env.ZIPDBG)console.log(fps,'max at frame',at,'of',frames.length,frames[at]&&frames[at].t);return {cam,rel,swingJerk,frames:frames.length};}
 const worst={cam:0,rel:0,swing:0};
 for(const [fps,jit] of [[20,0],[30,0],[30,4],[60,0],[60,1.5],[120,.5]]){const m=run(fps,jit);worst.cam=Math.max(worst.cam,m.cam);worst.rel=Math.max(worst.rel,m.rel);worst.swing=Math.max(worst.swing,m.swingJerk);
  assert(m.cam<=3,`${fps} fps ±${jit} ms: the camera's velocity changes by ≤ ${m.cam.toFixed(2)} m/s a frame`);
  assert(m.rel<=.02,`${fps} fps: the trolley holds still on screen (offset change ${m.rel.toFixed(3)} m a frame)`);
  assert(m.swingJerk<=1.2,`${fps} fps: the swing under it is smooth (${m.swingJerk.toFixed(2)} m/s change a frame)`);}
 console.log(`  camera: worst velocity change ${worst.cam.toFixed(2)} m/s a frame; trolley on screen ${worst.rel.toFixed(4)} m; swing ${worst.swing.toFixed(2)} m/s`);
});

// ---- Smoothness on real phones (Oct 15 2026, user on an iPhone: "when using the zipline, it can still be a little jittery. also
// when moving around while on the zipline should be smoother"). Town's pipeline replayed as a phone runs it: a 60 Hz rAF stream
// whose callback timestamps wobble by a few ms, Town's frame cap (frameCapSlot) choosing the rendered frames, slow frames that miss
// a refresh, each frame SHOWN on the refresh after its callback's; Town's dt (clamped to FRAME_DT_MAX) feeds the 60 Hz ticks. The
// metric is the second difference of what is drawn, against the times the frames are shown.
const FC=rl('lib/town/frameCap.ts');
function frameClock(kind,seed=5){let s=seed;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;const gauss=()=>{let u=0;for(let i=0;i<6;i++)u+=rnd();return (u-3)/Math.sqrt(.5);};
 const V=1000/60;let vs=0,slot=0,busy=0,tp=0;const late=()=>rnd()<.08?4+rnd()*6:Math.min(9,.5+Math.abs(gauss())*2.2);
 const phone=(cap,slowP,slowMs)=>()=>{for(;;){vs++;const t=vs*V;if(t<busy)continue;const ts=t+late(),sl=FC.frameCapSlot(ts,slot,cap);if(sl<0)continue;slot=sl;if(rnd()<slowP)busy=ts+slowMs;return {shown:(vs+1)*V,ts};}};
 return {phone30:phone(1000/30,.05,40),phone24:phone(1000/24,.05,40),phone20:phone(1000/20,.05,55),
  desktop60:()=>{tp+=16.67+(rnd()-.5)*4;return {shown:tp,ts:tp};},desktop120:()=>{tp+=8.33+(rnd()-.5)*2;return {shown:tp,ts:tp};}}[kind];}
/** A ride through Town's order (ticks → motion → follow camera → pose → the ride camera), frames from `frameClock(kind)`. */
function townRide(kind,{seed=5,lookInput=null,keysAt=null,onFrame=null,until=null,width=390}={}){
 const next=frameClock(kind,seed),r=makeRuntime(),{zip,loc,ctx,camera,player,scene}=r,L=ZS.ZIP_LAUNCH;loc.x=L.x+1;loc.z=L.z+.5;loc.y=ZS.ZIP_TOWER.deck;
 zip.update(ctx(loc.x,loc.z,{width}));zip.ride();let acc=0,last=0,sim=0,ticks=0;const prevLoc={...loc},frames=[],inp=input(),keys=new Set();
 while(sim<22&&(zip.phase!=='idle'||zip.stats.blend>0)&&!(until&&until(sim,zip))){const f=next(),dt=Math.max(0,Math.min((f.ts-last)/1000,FC.FRAME_DT_MAX));last=f.ts;sim+=dt;acc+=dt;
  if(lookInput)inp.x=lookInput(sim,zip);keys.clear();if(keysAt){const k=keysAt(sim);if(k)keys.add(k);}
  while(acc>=1/60){prevLoc.x=loc.x;prevLoc.z=loc.z;zip.holdPlayer(inp,keys,1/60);ticks++;acc-=1/60;}
  const blend=acc*60,vx=prevLoc.x+(loc.x-prevLoc.x)*blend,vz=prevLoc.z+(loc.z-prevLoc.z)*blend;zip.motion({},blend);
  const k=1-Math.exp(-dt*4);camera.position.x+=(vx+16-camera.position.x)*k;camera.position.z+=(vz+33-camera.position.z)*k;camera.position.y+=(loc.y+23-camera.position.y)*k;
  camera.lookAt(camera.position.x-16,camera.position.y-23,camera.position.z-33);zip.pose(player,blend,dt,false);zip.applyCamera(camera,dt,false);
  const tr=scene.getObjectByName('zipline-trolley'),h=scene.getObjectByName('zipline-handle'),st=scene.getObjectByName('strap0');
  const fr={shown:f.shown/1000,sim,town:(ticks-1+blend)/60,drawnT:zip.drawn.t,ride:zip.phase==='ride'&&zip.stats.blend>=1,cam:camera.position.clone(),q:camera.quaternion.clone(),
   rider:player.position.clone(),tr:tr&&tr.position.clone(),h:h&&h.position.clone(),st:st&&st.position.clone(),look:zip.look.x,lookV:zip.look.v,hy:zip.rigPose.hy};
  frames.push(fr);if(onFrame)onFrame(fr,zip,r);}
 return {frames,zip,r};}
const pct=(a,p)=>{const v=[...a].sort((x,y)=>x-y);return v.length?v[Math.min(v.length-1,Math.floor(v.length*p))]:0;};
/** Max and p95 of |Δv| between consecutive frames (m/s), v over the SHOWN interval; `get` picks a vector (null = skip). */
function jerk(frames,get){const out=[];for(let i=2;i<frames.length;i++){const a=frames[i-2],b=frames[i-1],c=frames[i];if(!a.ride||!c.ride)continue;const pa=get(a),pb=get(b),pc=get(c);if(!pa||!pb||!pc)continue;
 out.push(pc.clone().sub(pb).divideScalar(c.shown-b.shown).sub(pb.clone().sub(pa).divideScalar(b.shown-a.shown)).length());}return {max:Math.max(0,...out),p95:pct(out,.95),n:out.length};}
/** Frame-to-frame change (ms) of the drawn instant's offset from the shown time: 0 = drawn exactly in step with the screen. */
function timing(frames,key){const out=[];for(let i=1;i<frames.length;i++){const a=frames[i-1],b=frames[i];if(!a.ride||!b.ride)continue;out.push(Math.abs((b[key]-b.shown)-(a[key]-a.shown))*1000);}return {max:Math.max(0,...out),p95:pct(out,.95)};}

await ok('jitter: rider, trolley, handle, straps and camera drawn in step with the screen at 20 / 24 / 30 fps on a phone and 60 / 120 fps (uneven frames)',()=>{
 const limits={phone30:{cam:6,camP:1.6},phone24:{cam:5,camP:1.2},phone20:{cam:10,camP:3},desktop60:{cam:.6,camP:.4},desktop120:{cam:.6,camP:.4}};
 const rows=[];
 for(const kind of Object.keys(limits)){const {frames,zip}=townRide(kind),L=limits[kind];
  const rel=key=>f=>f[key]?f[key].clone().sub(f.cam):null,cam=jerk(frames,f=>f.cam),rider=jerk(frames,rel('rider')),tro=jerk(frames,rel('tr')),hand=jerk(frames,rel('h')),strap=jerk(frames,rel('st'));
  const drawnT=timing(frames,'drawnT'),townT=timing(frames,'town');
  assert(cam.n>100,kind+': the ride was measured');
  assert(cam.max<=L.cam&&cam.p95<=L.camP,`${kind}: the camera's velocity changes by ≤ ${cam.max.toFixed(2)} m/s a frame (p95 ${cam.p95.toFixed(2)}; ≤ ${L.cam} / ${L.camP})`);
  assert(tro.max<1e-6,`${kind}: the trolley holds still on screen (the camera rides with it)`);
  for(const [name,m] of [['rider',rider],['handle',hand],['strap',strap]])assert(m.max<=1.2,`${kind}: the ${name} moves smoothly on screen (≤ ${m.max.toFixed(2)} m/s change a frame)`);
  if(kind.startsWith('phone'))assert(drawnT.p95<=townT.p95*.5,`${kind}: the drawn instant follows the screen (p95 ${drawnT.p95.toFixed(2)} ms of wobble a frame vs Town's instant ${townT.p95.toFixed(2)} ms)`);
  else assert(drawnT.max<=townT.max+1e-6,`${kind}: desktop timestamps are exact: drawn at Town's instant`);
  rows.push(`${kind} cam ${cam.max.toFixed(2)}/${cam.p95.toFixed(2)} m/s, rider ${rider.max.toFixed(2)}, timing ${drawnT.p95.toFixed(2)} ms (Town's instant ${townT.p95.toFixed(2)})`);zip.dispose();}
 console.log('  '+rows.join('\n  '));
 // Every drawn part reads the same instant: the handle is the bar the hands hold, the trolley is the drawn trolley, the straps run
 // from the trolley's underside to the bar's ends; the ride camera is a pure function of the same drawn state.
 townRide('phone30',{onFrame:(f,z,r)=>{if(!f.tr)return;assert(f.h.distanceTo(z.bar.mid)<1e-9,'the handle is the drawn bar');
  assert(Math.hypot(f.tr.x-z.drawn.px,f.tr.y-z.drawn.py,f.tr.z-z.drawn.pz)<1e-9,'the trolley is the drawn trolley');
  const st=r.scene.getObjectByName('strap1');if(st){const top=new T3.Vector3(0,-st.scale.y/2,0).applyQuaternion(st.quaternion).add(st.position);assert(Math.abs(top.y-(z.drawn.py-ZS.ZIP_TROLLEY_DROP))<.01,'the strap hangs from the drawn trolley');}},until:s=>s>6}).zip.dispose();
 // The ride clock (lib/town/zipline.ts): exact desktop timestamps pass straight through; a snap on a stall or going back in time.
 const c=ZS.createRideClock();let t=0;for(let i=0;i<60;i++){t+=1/60+(i%3-1)*.001;assert.equal(c.step(t),t,'fast displays: Town\'s instant');}
 assert.equal(c.step(t),t,'the same instant twice (motion, then pose): the same answer');assert.equal(c.step(t-.2),t-.2,'back in time: snaps');
 for(let i=0;i<20;i++){t+=1/30;c.step(t);}t+=.5;assert.equal(c.step(t),t,'a stall: snaps');
 // Speed lines: on screen from the clip-on (one transparent streak, so the shader compiles then, not mid-ride when they appear).
 {const r=makeRuntime(),{zip,loc,ctx}=r,L=ZS.ZIP_LAUNCH;loc.x=L.x+1;loc.z=L.z;zip.update(ctx(loc.x,loc.z));zip.ride();zip.holdPlayer(input(),new Set(),1/60);zip.pose(r.player,1,1/60,false);
  const lines=r.scene.getObjectByName('zipline-speed-lines');assert(lines&&lines.visible&&lines.count>=1&&lines.material.opacity===0,'the speed lines are drawn (invisible) from the clip-on');
  // A frame drawn before the first tick shows the rider at the clip-on spot, never at the origin.
  const r2=makeRuntime();r2.loc.x=L.x+1;r2.loc.z=L.z;r2.loc.y=ZS.ZIP_TOWER.deck;r2.zip.update(r2.ctx(r2.loc.x,r2.loc.z));r2.zip.ride();r2.zip.pose(r2.player,.3,1/120,false);
  assert(r2.player.position.distanceTo(new T3.Vector3(L.x+1,ZS.ZIP_TOWER.deck,L.z))<.6,'drawn before the first tick: at the clip-on spot ('+r2.player.position.toArray().map(v=>v.toFixed(1))+')');zip.dispose();r2.zip.dispose();}
});

await ok('look-around: eased (no kick), soft at the edges, back to the middle on release, the same at 20–120 fps; drag with a fling; keys',()=>{
 const Z2=ZS,LIM=Z2.ZIP_LOOK.limit;
 // The stick: full right from 3 s to 5 s, released; at every frame rate.
 const curves={};
 for(const kind of ['phone20','phone30','desktop60','desktop120']){const {frames,zip}=townRide(kind,{lookInput:t=>t>3&&t<5?1:0,until:t=>t>8});
  let maxAcc=0,peak=0,overshoot=0;for(let i=1;i<frames.length;i++){const a=frames[i-1],b=frames[i],dt=b.sim-a.sim;if(dt>0)maxAcc=Math.max(maxAcc,Math.abs(b.lookV-a.lookV)/dt);peak=Math.max(peak,b.look);if(b.sim>5)overshoot=Math.min(overshoot,b.look);}
  assert(maxAcc<=18,`${kind}: the look accelerates smoothly (≤ ${maxAcc.toFixed(1)} rad/s²; no jump in its speed as the thumb lands or lifts)`);
  assert(peak>.75*LIM&&peak<LIM,`${kind}: a full stick looks well round (${peak.toFixed(2)} rad), softly short of the ${LIM} rad edge`);
  assert(overshoot>-.03,`${kind}: no swing past the middle on the way back (${overshoot.toFixed(3)})`);
  const end=frames[frames.length-1];assert(Math.abs(end.look)<.03,`${kind}: back to the default view 3 s after release (${end.look.toFixed(3)})`);
  curves[kind]=frames;zip.dispose();}
 // Frame-rate independent: the look at the same moments agrees across 20 → 120 fps.
 const at=(fr,t)=>{let best=fr[0];for(const f of fr)if(Math.abs(f.sim-t)<Math.abs(best.sim-t))best=f;return best.look;};
 for(const t of [3.3,3.8,4.5,5.3,6]){const vals=Object.values(curves).map(fr=>at(fr,t));assert(Math.max(...vals)-Math.min(...vals)<.09,`at ${t} s the look agrees across frame rates (${vals.map(v=>v.toFixed(2)).join(' / ')})`);}
 // Right is right: a + look turns the camera's view toward its own right; the rider's head turns the same way.
 {const fr=curves.desktop60,a=fr.find(f=>f.sim>2.9&&f.ride),b=fr.find(f=>f.sim>4.6);const fa=new T3.Vector3(0,0,-1).applyQuaternion(a.q),fb=new T3.Vector3(0,0,-1).applyQuaternion(b.q),right=new T3.Vector3(1,0,0).applyQuaternion(a.q);
  assert(fb.sub(fa).dot(right)>.2,'stick right: the view turns right');assert(b.hy<a.hy-.3,'… and the rider\'s head turns right with it');}
 // The stick's walk floor (shapeStick) is taken back out: the look starts from zero as the thumb leaves the dead zone.
 const WC=rl('lib/town/walkControl.ts'),o={x:0,z:0};WC.shapeStick(WC.STICK_DEAD_ZONE+.01,0,o);assert(o.x>.3&&Z2.stickLook(o.x,o.z)<.03,'just past the dead zone: a tiny look, not a third of it');
 WC.shapeStick(1,0,o);assert(Math.abs(Z2.stickLook(o.x,o.z)-1)<1e-9,'full stick: full look');
 // The soft edge: tanh, slope 1 in the middle, never past the limit.
 assert(Math.abs(Z2.softLook(.01)-.01)<1e-5&&Z2.softLook(50)<=LIM&&Z2.softLook(-50)>=-LIM,'soft limit');
 // Drag (a finger on a 390 px phone): a swipe right over 70 % of the screen width looks round to ~the stick's full aim; dragging far
 // past the edge eases into it (no hard stop: the look's speed falls smoothly); a fling carries on after the finger lifts, then the
 // view eases back to the middle.
 for(const [width,kind] of [[390,'phone30'],[1440,'desktop60']]){
  // A long swipe: to the edge, softly.
  const swipe=(until,speed)=>{let x=100,t=0,lifted=null,liftAt=0,afterLift=0,peak=0,edgeStep=0,prevV=null;
   const {frames,zip}=townRide(kind,{width,until:s=>s>9,onFrame:(f,z)=>{const ms=f.sim*1000;
    if(f.sim>3&&f.sim<until&&z.phase==='ride'){if(!z.look.dragging){z.drag.start(7,x,ms);}else{x+=width*speed*(f.sim-(t||f.sim));z.drag.move(7,x,ms);}t=f.sim;}
    else if(f.sim>=until&&z.look.dragging){z.drag.end(7,ms);lifted=f.look;liftAt=f.sim;}
    if(lifted!==null&&f.sim<liftAt+.4)afterLift=Math.max(afterLift,f.look-lifted);peak=Math.max(peak,f.look);
    if(prevV!==null&&f.look>.6*LIM)edgeStep=Math.max(edgeStep,Math.abs(f.lookV-prevV));prevV=f.lookV;}});
   zip.dispose();return {peak,edgeStep,afterLift,end:frames[frames.length-1].look};};
  const long=swipe(4.2,1.4);
  assert(long.peak<LIM&&long.peak>.8*LIM,`${width} px: a long swipe looks round to the edge, softly (${long.peak.toFixed(2)} of ${LIM})`);
  assert(long.edgeStep<.6,`${width} px: no snap at the edge (look speed changes ≤ ${long.edgeStep.toFixed(2)} rad/s a frame there)`);
  assert(Math.abs(long.end)<.04,`${width} px: and the view eases back to the middle (${long.end.toFixed(3)})`);
  // A flick: the look carries on after the finger lifts, then comes back.
  const flick=swipe(3.2,1);
  assert(flick.afterLift>.02,`${width} px: a flick carries on after the finger lifts (+${flick.afterLift.toFixed(3)} rad)`);
  assert(Math.abs(flick.end)<.04,`${width} px: then back to the middle (${flick.end.toFixed(3)})`);}
 // Sensitivity: the drag's aim per pixel is set by the screen width (≤ 900 px), so a phone and a desktop feel the same.
 {const r=makeRuntime(),{zip,loc,ctx}=r,L=ZS.ZIP_LAUNCH;loc.x=L.x+1;loc.z=L.z;zip.update(ctx(loc.x,loc.z));zip.ride();zip.holdPlayer(input(),new Set(),1/60);
  zip.drag.start(1,0,0);zip.drag.move(1,.7*390,400);assert(Math.abs(zip.look.aim-Z2.ZIP_LOOK.drag)<1e-9,'390 px: 70 % of the width = the full aim');
  zip.drag.move(2,9999,500);assert(Math.abs(zip.look.aim-Z2.ZIP_LOOK.drag)<1e-9,'another finger is ignored');zip.drag.end(1,900);assert(!zip.look.dragging,'lifted (held still first: no fling)');
  // The window's pointer listeners: a drag that starts on the scene (the canvas), not on the HUD; only while riding.
  const ev=(type,id,x,tag='CANVAS')=>window.dispatchEvent({type,pointerId:id,clientX:x,timeStamp:1000+x,button:0,target:{tagName:tag}});
  ev('pointerdown',3,10,'BUTTON');assert(!zip.look.dragging,'a HUD button is not a drag');ev('pointerdown',3,10);assert(zip.look.dragging,'the scene is');ev('pointermove',3,60);ev('pointerup',3,60);assert(!zip.look.dragging);
  zip.finishNow();ev('pointerdown',4,10);assert(!zip.look.dragging,'off the cable a drag does nothing');zip.dispose();}
 // Keys: → held looks right, ← left; let go and it comes back.
 {const {frames,zip}=townRide('desktop60',{keysAt:t=>t>3&&t<4.5?'arrowright':t>6&&t<7?'a':null,until:t=>t>9.5});
  const peakR=Math.max(...frames.map(f=>f.look)),peakL=Math.min(...frames.map(f=>f.look));assert(peakR>.6&&peakL<-.4,`keys look both ways (${peakR.toFixed(2)}, ${peakL.toFixed(2)})`);
  assert(Math.abs(frames[frames.length-1].look)<.05,'and back');zip.dispose();}
 // Reduced motion: the same look, slower.
 {const r=makeRuntime(),{zip,loc,ctx,camera}=r,L=ZS.ZIP_LAUNCH;loc.x=L.x+1;loc.z=L.z;zip.update(ctx(loc.x,loc.z));zip.ride();const inp={...input(),x:1};
  for(let i=0;i<30;i++){zip.holdPlayer(inp,new Set(),1/60);zip.pose(r.player,1,1/60,true);zip.applyCamera(camera,1/60,true);}const red=zip.look.x;zip.dispose();
  const q=makeRuntime();q.loc.x=L.x+1;q.loc.z=L.z;q.zip.update(q.ctx(q.loc.x,q.loc.z));q.zip.ride();for(let i=0;i<30;i++){q.zip.holdPlayer(inp,new Set(),1/60);q.zip.pose(q.player,1,1/60,false);q.zip.applyCamera(q.camera,1/60,false);}
  assert(red<q.zip.look.x&&red>0,'reduced motion: a gentler turn');q.zip.dispose();}
});

await ok('the ride counts as active: no idle 20 fps cap, no governor tier change and a held shadow box mid-ride; late frames keep their time',()=>{
 const town=read('components/Town.tsx');
 // The idle-ride cap only ever applies on a ride (rideRef ≠ walk); the zipline is ridden on foot (a scooter or bike hops off first)
 // and R / the ride button cannot change the ride in mid-air.
 assert(town.includes("idleRide.interval(now,rideRef.current!=='walk'||waterIdle)"),'Town: the idle cap is for rides (and treading water, Oct 15 2026) only');
 assert(/dismount:\(\)=>\{if\(rideRef\.current==='walk'\|\|rideRef\.current==='jetpack'\)return false;selectRide\('walk'\)/.test(town),'the zipline starts on foot');
 assert(town.includes('hold:on=>{heat.hold(on);islandShadowFit.hold(on);}'),'Town: the ride holds the governor and the shadow box');
 {const holds=[];const r=makeRuntime({hold:on=>holds.push(on)}),{zip,loc,ctx}=r,L=ZS.ZIP_LAUNCH;loc.x=L.x+1;loc.z=L.z;zip.update(ctx(loc.x,loc.z));zip.ride();
  while(zip.phase!=='idle')zip.holdPlayer(input(),new Set(),1/60);zip.dispose();
  assert.deepEqual(holds,[true,false],'held from the clip-on to the landing, once');
  const h2=[];const q=makeRuntime({hold:on=>h2.push(on)});q.loc.x=L.x+1;q.loc.z=L.z;q.zip.update(q.ctx(q.loc.x,q.loc.z));q.zip.ride();q.zip.finishNow();q.zip.ride();q.zip.update(q.ctx(q.loc.x,q.loc.z));q.zip.dispose();
  assert.equal(h2[h2.length-1],false,'and released however the ride ends');}
 assert(town.includes('Math.min(ms/1000,FRAME_DT_MAX)')&&Math.abs(FC.FRAME_DT_MAX-1/15)<1e-12,'Town: a late frame keeps its time (dt up to 1/15 s)');
 // The idle-ride cap replayed over a ride (no input for 15 s, on foot: the zipline is never "a ride sitting still"), on the 30 fps
 // phone cap; then the same seconds sitting still on a scooter DO drop to 20 fps (the check sees the cap).
 const IR=rl('lib/town/idleRide.ts');
 const replay=(riding)=>{const idle=IR.createIdleRide();let slot=0,rendered=0,capped=0;const p={x:0,y:0,z:0};
  for(let k=1;k<=60*15;k++){const now=k*1000/60;const iv=idle.interval(now,riding);if(iv)capped++;const sl=FC.frameCapSlot(now,slot,Math.max(iv,1000/30));if(sl<0)continue;slot=sl;rendered++;idle.sample(now,p,p);}
  return {fps:rendered/15,capped};};
 const zipRun=replay(false),still=replay(true);assert(zipRun.capped===0&&zipRun.fps>29,`on the zipline: ${zipRun.fps.toFixed(1)} fps, never the idle cap`);assert(still.capped>0&&still.fps<26,`the check sees the cap (still on a scooter: ${still.fps.toFixed(1)} fps)`);
 // The governor (lib/graphics/islandHeat.ts): severely slow frames for 40 s while held change nothing; released, the same frames do.
 window.location??={search:''};const HT=rl('lib/graphics/heatTier.ts'),{createIslandHeat}=rl('lib/graphics/islandHeat.ts');HT.forceHeatTier(null);HT.setGovernorTier(0);
 const sun={shadow:{mapSize:{x:1024,set(x){this.x=x;}},map:null,normalBias:.01}},heat=createIslandHeat({renderer:{shadowMap:{autoUpdate:true,needsUpdate:false}},sun,resolution:{setLimit(){}},npcs:{setDrawDistance(){}},traffic:{cars:[],rider:{index:-1}},governed:true});
 let now=0;const feed=(secs,held)=>{heat.hold(held);for(let i=0;i<secs*8;i++){now+=125;heat.afterRender(now,125,5,300,'');}};
 feed(40,true);assert.equal(heat.tier,0,'held: no tier change mid-ride');assert.equal(heat.governor.changes,0);
 feed(40,false);assert(heat.tier>0,'released: the governor judges again ('+heat.tier+')');heat.dispose();HT.setGovernorTier(0);
 // The shadow box over a ride (the camera dropping 40 m and the look swinging round): held, it only grows (a couple of re-sizes);
 // free, it re-sizes (shadow texels changing size) over and over.
 const SH=rl('lib/graphics/islandShadows.ts');
 const fits=held=>{const light=new T3.DirectionalLight();light.shadow.mapSize.set(1024,1024);const fit=SH.createIslandShadowFit(light);let first=-1;
  const {zip}=townRide('phone30',{lookInput:t=>t>4&&t<6?1:t>7&&t<8?-1:0,onFrame:(f,z,r)=>{if(z.phase==='idle')return;fit.hold(held&&z.active);fit.update(r.camera);if(first<0)first=fit.stats.resizes;}});zip.dispose();return fit.stats.resizes-first;};
 const heldN=fits(true),freeN=fits(false);assert(heldN<=4&&freeN>=heldN*3,`shadow box re-sizes during a ride: ${heldN} held vs ${freeN} free`);
 console.log(`  idle cap: ${zipRun.fps.toFixed(1)} fps on the zipline (still on a scooter: ${still.fps.toFixed(1)}); shadow re-sizes ${heldN} (free: ${freeN})`);
});

// ---- The grip, the body and the ride actions (Oct 14 2026, user after riding it: "the arms are not on the handle", "the body needs
// to animate with the movements more", "when ziplining, remove the actions and change those to three different actions").
const CS=rl('lib/graphics/characterStyle.ts'),PL=rl('lib/graphics/player.ts');
/** A whole ride through Town's order (tick → motion → player.update → pose) on the REAL character rig, drawn at `fps` (the tick stays
 *  60 Hz), with `act(tick, zip)` pressing actions. Every drawn frame: both mittens' middles against the drawn bar. */
function rigRide({style='bean',fps=60,reduced=false,act=()=>{},onFrame=()=>{}}={}){
 CS.setCharacterStyle(style);const rig=PL.createPlayer('you','home',true,true);CS.setCharacterStyle(undefined);
 const r=makeRuntime(),{zip,loc,ctx,scene}=r,L=ZS.ZIP_LAUNCH;scene.add(rig.root);loc.x=L.x+1;loc.z=L.z;loc.y=ZS.ZIP_TOWER.deck;
 zip.update(ctx(loc.x,loc.z,{reduced}));zip.ride();
 const el=[rig.root.getObjectByName('left-elbow'),rig.root.getObjectByName('right-elbow')],g=new T3.Vector3(),d=new T3.Vector3();
 const out={grip:0,along:0,checked:0,waveChecked:0,frames:0,ticks:0,log:[]};let acc=0,t=0,tick=0;
 while(zip.phase!=='idle'&&t<40){const dt=1/fps;t+=dt;acc+=dt;
  while(acc>=1/60-1e-9){act(tick,zip);zip.holdPlayer(input(),new Set(),1/60);tick++;acc-=1/60;
   out.log.push({tick,phase:zip.phase,swing:zip.drawn.swing,speed:zip.drawn.speed,rate:zip.stats.rate,placedY:loc.y});}
  const k=Math.min(1,acc*60),m=zip.motion({},k);rig.update(loc.x,loc.z,dt,t,reduced,m);zip.pose(rig.root,k,dt,reduced);rig.root.updateWorldMatrix(true,true);out.frames++;
  const pose=zip.rigPose,b=zip.bar;onFrame(zip,pose,rig);
  if(zip.active&&pose.w>=.999)for(let i=0;i<2;i++){const side=i?1:-1;if(side===pose.free&&pose.wave>0){out.waveChecked++;continue;}
   el[i].localToWorld(g.set(...PL.ZIP_GRIP_POINT));d.copy(g).sub(b.mid);const along=d.dot(b.dir);d.addScaledVector(b.dir,-along);
   out.grip=Math.max(out.grip,d.length());out.along=Math.max(out.along,Math.abs(along-side*ZS.ZIP_GRIP.half));out.checked++;}}
 out.ticks=tick;out.zip=zip;out.r=r;out.rig=rig;return out;}

await ok('the grip: both hands close round the bar at the same two points every drawn frame (bean and classic, 30–120 fps, spin, tuck, wave)',()=>{
 for(const [style,fps] of [['bean',60],['bean',30],['bean',120],['classic',45]]){
  const o=rigRide({style,fps,act:(t,z)=>{if(t===150)z.press('tuck','down');if(t===260)z.press('spin','tap');if(t===330)z.press('tuck','up');if(t===420)z.press('wave','tap');if(t===600)z.press('spin','tap');}});
  assert(o.checked>fps*12,`${style} ${fps} fps: the hands were checked over the ride (${o.checked})`);
  assert(o.grip<=.02,`${style} ${fps} fps: each mitten's middle is on the bar's line (worst ${(o.grip*100).toFixed(2)} cm)`);
  assert(o.along<=.02,`${style} ${fps} fps: at the same point along it, no sliding (worst ${(o.along*100).toFixed(2)} cm)`);
  assert(o.waveChecked>0&&o.zip.stats.waves===1&&o.zip.stats.spins===2,'the wave and both spins happened');
  console.log(`  grip ${style} ${fps} fps: worst ${(o.grip*1000).toFixed(1)} mm off the bar, ${(o.along*1000).toFixed(1)} mm along it (${o.checked} hand checks)`);
  o.zip.dispose();}
 // The handle: an orange T-bar with grip sleeves at the hands, hung by two straps from the trolley's underside, built only while riding.
 const r=makeRuntime(),{zip,loc,ctx,scene}=r,L=ZS.ZIP_LAUNCH;loc.x=L.x+1;loc.z=L.z;zip.update(ctx(loc.x,loc.z));zip.ride();for(let i=0;i<120;i++){zip.holdPlayer(input(),new Set(),1/60);zip.pose(r.player,1,1/60,false);}
 const h=scene.getObjectByName('zipline-handle');assert(h&&scene.getObjectByName('strap0')&&scene.getObjectByName('strap1'),'the handle and its straps');
 assert(h.position.distanceTo(zip.bar.mid)<1e-9,'the handle is drawn where the hands grip');
 const tr=scene.getObjectByName('zipline-trolley');assert(Math.abs(tr.position.y-ZS.ZIP_TROLLEY_DROP-ZS.ZIP_STRAP-h.position.y)<.25,'it hangs a short strap under the trolley');zip.dispose();
});

await ok('the body moves with the ride: the swing answers the push and the brake; legs kick, trail, tuck and reach for the deck; head and torso',()=>{
 const seen={launchHip:[],tuckKnee:0,reachHip:9,headDown:0,torsoBack:0,legTrail:0,bounce:0};
 const o=rigRide({fps:60,act:(t,z)=>{if(t===48+60*3)z.press('tuck','down');if(t===48+60*4.5)z.press('tuck','up');},onFrame:(z,p)=>{
  if(z.phase==='ride'){const rt=z.stats.busyTicks/60-ZS.ZIP_RIDE.clip;if(rt<1.4)seen.launchHip.push(p.hipL);
   if(rt>3.6&&rt<4.4)seen.tuckKnee=Math.max(seen.tuckKnee,p.kneeL);if(rt<.5)seen.torsoBack=Math.min(seen.torsoBack,p.tx);
   if(rt>4&&rt<8)seen.headDown=Math.max(seen.headDown,p.hx);}
  if(z.phase==='land'||z.phase==='ride'&&z.drawn.speed<2&&z.stats.busyTicks>400)seen.reachHip=Math.min(seen.reachHip,p.hipL);}});
 const ride=o.log.filter(l=>l.phase==='ride');
 const early=ride.slice(5,60),brake=ride.filter((l,i)=>i>ride.length*.62&&i<ride.length*.9);
 const mean=a=>a.reduce((s,l)=>s+l.swing,0)/a.length;
 assert(mean(early)>.03,'off the tower the feet trail behind the hands (swing '+mean(early).toFixed(3)+')');
 assert(mean(brake)<-.01,'into the brake they swing forward (swing '+mean(brake).toFixed(3)+')');
 // The swing follows the acceleration (a pendulum driven by it): positive correlation over the ride.
 const accs=[],sw=[];for(let i=1;i<ride.length;i++){accs.push((ride[i].speed-ride[i-1].speed)*60);sw.push(ride[i].swing);}
 const avg=a=>a.reduce((s,v)=>s+v,0)/a.length,ma=avg(accs),ms=avg(sw);let cov=0,va=0,vs=0;for(let i=0;i<accs.length;i++){cov+=(accs[i]-ma)*(sw[i]-ms);va+=(accs[i]-ma)**2;vs+=(sw[i]-ms)**2;}
 const corr=cov/Math.sqrt(va*vs);assert(corr>.5,'the swing answers the acceleration (correlation '+corr.toFixed(2)+')');
 const lo=Math.min(...seen.launchHip),hi=Math.max(...seen.launchHip);assert(hi-lo>.5,'the legs kick and cycle off the tower (hip range '+(hi-lo).toFixed(2)+' rad)');
 assert(seen.tuckKnee>1.6,'Tuck pulls the knees up ('+seen.tuckKnee.toFixed(2)+')');assert(seen.reachHip<-.45,'the legs stretch out for the deck ('+seen.reachHip.toFixed(2)+')');
 assert(seen.headDown>.2,'the head looks ahead and down at the water');assert(seen.torsoBack<-.1,'a lean back off the tower');
 assert(Math.min(...o.log.map(l=>l.placedY))>=ZS.ZIP_DECK.height-.01,'never below the roof deck');
 // Frame-rate independent: the physics lives on the 60 Hz tick; drawing (any number of frames, any blend) never changes it.
 {const r=makeRuntime(),{zip,loc,ctx}=r,L=ZS.ZIP_LAUNCH;loc.x=L.x+1;loc.z=L.z;zip.update(ctx(loc.x,loc.z));zip.ride();for(let i=0;i<300;i++)zip.holdPlayer(input(),new Set(),1/60);
  zip.pose(r.player,1,0,false);const a={...zip.drawn},p=r.player.position.clone();for(let i=0;i<20;i++){zip.motion({},i/20);zip.pose(r.player,i/20,1/240,false);}zip.pose(r.player,1,0,false);
  assert.deepEqual({...zip.drawn},a,'drawing frames leaves the ride state alone');assert(r.player.position.distanceTo(p)<1e-9);zip.dispose();}
 // Reduced motion: damped (half the swing, no sway, gentler legs) — the grip holds just the same.
 const red=rigRide({fps:60,reduced:true});assert(red.grip<=.02&&red.along<=.02,'reduced motion: hands on the bar');
 const full=Math.max(...ride.map(l=>Math.abs(l.swing))),calm=Math.max(...red.log.filter(l=>l.phase==='ride').map(l=>Math.abs(l.swing)));
 assert(calm<full*.6,'reduced motion: a damped swing ('+calm.toFixed(2)+' vs '+full.toFixed(2)+')');o.zip.dispose();red.zip.dispose();
});

await ok('the three ride actions: Tuck (faster, within the safe top speed, never into the brake), Spin, Wave; keys; nothing stops or moves the landing',()=>{
 assert.deepEqual(ZS.ZIP_BUTTONS.map(b=>[b.id,b.slot,b.key]),[['tuck','shoot','Space'],['spin','juggle','Q'],['wave','ride','E']],'three actions in the cluster\'s three slots');
 assert(ZS.ZIP_BUTTONS[0].hold&&!ZS.ZIP_BUTTONS[1].hold&&!ZS.ZIP_BUTTONS[2].hold,'Tuck is held; Spin and Wave are taps');
 const icons=read('components/TravelIcon.tsx');for(const b of ZS.ZIP_BUTTONS)assert(new RegExp(`\\b${b.icon}:'M`).test(icons),'a line icon for '+b.id);
 assert(/tuck:'Tuck',spin:'Spin',wave:'Wave'/.test(read('components/JobActionButton.tsx')),'short words under the icons');
 // Base ride vs a ride with Tuck held all the way and every action pressed every tick.
 function run(act){const r=makeRuntime(),{zip,loc,ctx,log}=r,L=ZS.ZIP_LAUNCH;loc.x=L.x+1;loc.z=L.z;loc.y=ZS.ZIP_TOWER.deck;zip.update(ctx(loc.x,loc.z));zip.ride();
  let ticks=0,top=0,lastF=-1,back=0,rateAfter=1,maxRate=1;
  while(zip.phase!=='idle'&&ticks<60*40){act(ticks,zip);zip.holdPlayer(input(),new Set(),1/60);ticks++;zip.pose(r.player,1,1/60,false);
   if(zip.phase==='ride'){top=Math.max(top,zip.drawn.speed);const f=Math.hypot(zip.drawn.px-ZS.ZIP_LAUNCH.x,zip.drawn.pz-ZS.ZIP_LAUNCH.z);if(f<lastF-1e-9)back++;lastF=f;maxRate=Math.max(maxRate,zip.stats.rate);
    const tau=(Math.hypot(zip.drawn.px-ZS.ZIP_LAUNCH.x,zip.drawn.pz-ZS.ZIP_LAUNCH.z))/ZS.ZIP_SPAN;if(tau>.86)rateAfter=Math.max(rateAfter,zip.stats.rate);}}
  const out={ticks,top,back,maxRate,rateAfter,landed:log.landed.slice(),touch:log.touch,stats:{...zip.stats},minY:Math.min(...log.placed.map(p=>p.y))};zip.dispose();return out;}
 const base=run(()=>{});
 const mash=run((t,z)=>{z.press('tuck','down');z.press('spin','tap');z.press('wave','tap');z.key({code:'KeyR',key:'r',repeat:false,preventDefault(){}},true);});
 assert(mash.maxRate>1.08,'Tuck speeds the ride up ('+mash.maxRate.toFixed(3)+'×)');assert(mash.top<=ZS.ZIP_TUCK.maxSpeed+1e-6&&mash.top>base.top,'… a little, never above '+ZS.ZIP_TUCK.maxSpeed+' m/s ('+mash.top.toFixed(1)+' vs '+base.top.toFixed(1)+')');
 assert(mash.rateAfter<1.01,'… and never into the brake to the roof ('+mash.rateAfter.toFixed(3)+')');
 assert(mash.ticks<base.ticks&&mash.ticks>base.ticks*.85,'a shorter ride, not a different one ('+mash.ticks+' vs '+base.ticks+' ticks)');
 assert.equal(mash.back,0,'nothing pulls the rider back up the cable');assert(mash.stats.spins>=2&&mash.stats.waves>=2,'spins and waves happen (one at a time)');
 for(const o of [base,mash]){assert.equal(o.landed.length,1);assert.deepEqual([o.landed[0].x,o.landed[0].z],[ZS.ZIP_LAND.x,ZS.ZIP_LAND.z],'the same landing on the deck');assert.equal(o.touch,1);assert(o.minY>=ZS.ZIP_DECK.height-.01);}
 // Spin: one 360° turn, eased, then square again; refused at the very end. Wave: up and back to the bar before the landing.
 {const r=makeRuntime(),{zip,loc,ctx}=r,L=ZS.ZIP_LAUNCH;loc.x=L.x+1;loc.z=L.z;zip.update(ctx(loc.x,loc.z));zip.ride();for(let i=0;i<120;i++)zip.holdPlayer(input(),new Set(),1/60);
  zip.press('spin','tap');let maxSpin=0,ticks=0;while(zip.drawn.spin>=0&&ticks<200){zip.holdPlayer(input(),new Set(),1/60);zip.pose(r.player,1,1/60,false);maxSpin=Math.max(maxSpin,zip.drawn.spin);ticks++;if(ticks>5&&zip.drawn.spin===0)break;}
  assert(maxSpin>Math.PI*1.9&&Math.abs(ticks/60-ZS.ZIP_SPIN.seconds)<.1,'a full turn in '+(ticks/60).toFixed(2)+' s');
  zip.press('wave','tap');let maxWave=0;for(let i=0;i<60*3;i++){zip.holdPlayer(input(),new Set(),1/60);zip.motion({},1);maxWave=Math.max(maxWave,zip.rigPose.wave);}assert(maxWave>.95&&zip.rigPose.wave===0,'the wave comes and goes');
  while(zip.phase==='ride'&&zip.drawn.speed>3)zip.holdPlayer(input(),new Set(),1/60);const n=zip.stats.spins;zip.press('spin','tap');zip.press('wave','tap');
  assert.equal(zip.stats.spins,n,'no spin in the last seconds');let w=0;while(zip.phase!=='idle'){zip.holdPlayer(input(),new Set(),1/60);zip.motion({},1);w=Math.max(w,zip.rigPose.wave);}assert.equal(w,0,'no wave into the landing');zip.dispose();}
 // Keys (Town's keydown/keyup hand them over first while riding): Space/1 hold-tuck, Q/2 spin, E/3 wave; R and J are the ride's.
 {const r=makeRuntime(),{zip,loc,ctx}=r,L=ZS.ZIP_LAUNCH;loc.x=L.x+1;loc.z=L.z;zip.update(ctx(loc.x,loc.z));const ev=(code,key,repeat=false)=>({code,key,repeat,preventDefault(){this.prevented=true;}});
  assert.equal(zip.key(ev('Space',' '),true),false,'at rest the keys are the island\'s');zip.ride();for(let i=0;i<90;i++)zip.holdPlayer(input(),new Set(),1/60);
  assert.equal(zip.key(ev('Space',' '),true),true);for(let i=0;i<60;i++)zip.holdPlayer(input(),new Set(),1/60);assert(zip.stats.rate>1.02,'Space holds a tuck');zip.key(ev('Space',' '),false);
  assert.equal(zip.key(ev('KeyQ','q'),true),true);assert.equal(zip.stats.spins,1,'Q spins');for(let i=0;i<90;i++)zip.holdPlayer(input(),new Set(),1/60);
  assert.equal(zip.key(ev('Digit3','3'),true),true);assert.equal(zip.stats.waves,1,'3 waves');
  const rk=ev('KeyR','r');assert.equal(zip.key(rk,true),true);assert(rk.prevented,'R cannot change the ride in mid-air');assert.equal(zip.key(ev('ArrowLeft','ArrowLeft'),true),false,'the arrows still look around');zip.dispose();}
 // The HUD: while riding the cluster IS the three actions (same component, classes and slots), and the normal ones come back after.
 const town=read('components/Town.tsx');
 assert(/const actionCluster:readonly JobButton\[\]\|null=zipRiding\?ZIP_BUTTONS:waterCluster\?\?jobButtons;/.test(town),'Town: the zipline\'s actions replace the cluster while riding (the water\'s after it, Oct 15 2026)');
 assert(/useSyncExternalStore\(zipStore\.subscribe,\(\)=>zipStore\.get\(\)\.riding,\(\)=>false\)/.test(town),'… from the store (written only on changes)');
 assert(['travel-mode','touch-shoot','touch-juggle'].every(c=>town.includes(`className="${c}" onPress={pressCluster}/>`)),'… with the job cluster\'s button in the ride, shoot and juggle slots');
 assert(/if\(zipline\.key\(e,true\)\)return;/.test(town)&&/if\(zipline\.key\(e,false\)\)return;/.test(town),'Town hands the keys to the ride first');
 const r=makeRuntime(),{zip,loc,ctx}=r,L=ZS.ZIP_LAUNCH;loc.x=L.x+1;loc.z=L.z;zip.update(ctx(loc.x,loc.z));zip.ride();assert.equal(ZS.zipStore.get().riding,true,'riding: the zipline actions show');
 while(zip.phase!=='idle')zip.holdPlayer(input(),new Set(),1/60);assert.equal(ZS.zipStore.get().riding,false,'landed: the normal actions are back');
 ZS.zipActions.press('spin','tap');assert.equal(zip.stats.spins,0,'the buttons do nothing off the cable');zip.dispose();
});

await ok('heat: the ride\'s maths only while riding, no allocation per tick or frame, nothing at rest',()=>{
 const src=read('lib/graphics/zipline.ts').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm,'');
 const body=(start,end)=>{const a=src.indexOf(start),b=src.indexOf(end,a+start.length);assert(a>=0&&b>a,'found '+start);return src.slice(a,b);};
 for(const [name,code] of [['sample',body('function sample(','let lastUpdate')],['interp',body('function interp(','function onKey')],['placeBody',body('function placeBody(','const barMid')],
  ['holdPlayer',body('holdPlayer(','motion<')],['motion',body('motion<','pose(player')],['pose',body('pose(player','applyCamera(')]])
  assert(!/\bnew\s|\{\.\.\.|\[\.\.\.|\.map\(|\.filter\(|=>\s*\(?\{/.test(code.replace(/streak\(l,/g,'')),name+': no allocation per tick/frame');
 assert(!/requestAnimationFrame|setInterval|setTimeout/.test(src),'no loop or timer of its own');
 // At rest: motion() hands Town's motion back untouched, pose() leaves the player alone, the keys pass through.
 const r=makeRuntime(),{zip,player}=r,m={facing:1};player.position.set(1,2,3);
 assert.equal(zip.motion(m,.5),m);assert.deepEqual(m,{facing:1},'motion untouched at rest');zip.pose(player,.5,1/60,false);assert.deepEqual(player.position.toArray(),[1,2,3],'the player untouched at rest');
 assert.equal(zip.key({code:'KeyQ',key:'q',repeat:false,preventDefault(){}},true),false);zip.dispose();
 // The rig's grip solve: preallocated temporaries, no allocation inside it.
 const pl=read('lib/graphics/player.ts'),a=pl.indexOf('const poseZipBody='),b=pl.indexOf('/** Freestyle trick pose',a);assert(a>0&&b>a);assert(!/\bnew\s|\{\.\.\./.test(pl.slice(a,b)),'player.ts: the grip solve allocates nothing');
});

await ok('heat: a few short tube pieces in the static batches, nothing animated at rest; wiring',()=>{
 const pieces=ZW.cablePieces();assert.equal(pieces.length,ZW.CABLE_PIECES);
 let tris=0;for(const p of pieces){const g=p.geometry;tris+=(g.index?g.index.count:g.getAttribute('position').count)/3;const box=new T.Box3().setFromBufferAttribute(g.getAttribute('position'));assert(box.max.x-box.min.x<50&&box.max.z-box.min.z<50,'each piece fits a 50 m batch cell');g.dispose();}
 assert(tris<=600,'the whole cable is '+tris+' triangles');
 const z=read('lib/town/ziplineWorld.ts');assert((z.match(/sign\(/g)||[]).length===2,'two signs (each one small textured draw)');
 const zr=read('lib/graphics/zipline.ts').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm,'');assert(!/requestAnimationFrame|setInterval|setTimeout/.test(zr),'no loop or timer of its own');
 assert(/InstancedMesh/.test(zr)&&/dispose3d\(\)/.test(zr),'the speed lines are one instanced mesh, disposed after each ride');
 const town=read('components/Town.tsx');
 for(const re of [/createZipline\(scene/,/zipline\.holdPlayer\(input\.current,keys,dt\)/,/zipline\.motion\(/,/zipline\.pose\(player\.root/,/zipline\.applyCamera\(camera/,/zipline\.update\(/,/zipline\.dispose\(\)/,/<ZiplineHud\/>/,/key:zipWant\.key/])assert(re.test(town),'Town: '+re);
 assert(!/TelescopeView|scopeHidPlayer|telescope'/.test(town),'the telescope is gone from Town');
 assert(/buildZiplineProps\(/.test(read('lib/town/world.ts'))&&/ziplineRails/.test(read('lib/town/world.ts')),'world.ts builds the props and their rails');
 assert(/<ZiplineMapMark/.test(read('components/IslandOverview.tsx'))&&/strokeDasharray/.test(read('components/ZiplineMapMark.tsx')),'a dashed line and a start badge on the maps');
 assert(/count\('su:zipline_ride'\)/.test(read('lib/analytics/summitEvents.ts'))&&/'zipline_ride'/.test(read('lib/analytics/countIds.ts')),'analytics: su:zipline_ride');
 assert(!fs.existsSync(path.join(ROOT,'lib/town/telescope.ts'))&&!fs.existsSync(path.join(ROOT,'components/TelescopeView.tsx')),'the telescope files are gone');
 assert(/node tests\/zipline\.cjs/.test(read('package.json'))&&!/tests\/telescope\.cjs/.test(read('package.json')),'npm test runs this, not the telescope test');
 const fuel=read('lib/graphics/zipline.ts');assert(!/fuel/i.test(fuel.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm,'')),'free: gravity, no fuel');
});

console.log(failed?`\nzipline: ${failed} failed`:'\nzipline: all passed');
process.exit(failed?1:0);
})();
