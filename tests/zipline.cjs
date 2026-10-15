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
