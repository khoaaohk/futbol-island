// Reef discovery (Oct 21 2026, user: "the jetpack badge on the map for the three far zones, discovery hints for the zones"):
// lib/town/water/reefDiscovery.ts, components/ReefHintToast.tsx, the Town hook and the travel map's nearest-reef line.
const assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const base=path.resolve(__dirname,'..'),T=require('node:module').createRequire(base+'/package.json')('three');
const loaded=new Map();function load(file){file=path.resolve(base,file);if(loaded.has(file))return loaded.get(file);const mod={exports:{}};loaded.set(file,mod.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:mod.exports,module:mod,Math,Map,Set,JSON,Uint8Array,Float32Array,Float64Array,require:id=>id==='three'?T:id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):id.startsWith('@/')?load(path.resolve(base,id.slice(2)+'.ts')):require(id)});loaded.set(file,mod.exports);return mod.exports;}
const R=load('lib/town/water/reefDiscovery.ts'),Dv=load('lib/town/water/diveSpots.ts'),{SWIM_RANGE}=load('lib/town/water/waterDepth.ts'),{distanceToLand}=load('lib/town/landmass.ts');
const read=f=>fs.readFileSync(path.join(base,f),'utf8');

// 1. Far = the whole outline beyond the swim range, from the data (a moved zone is classified again).
for(const s of Dv.DIVE_SPOTS){const e=R.diveEdgeToLand(s);assert.equal(R.diveSpotFar(s),e>SWIM_RANGE,`${s.id}: edge ${e.toFixed(1)} m from land`);}
assert.deepEqual([...R.farDiveSpotIds()].sort(),['ball-crate','kelp-trawler','moon-arch']);
const cup=Dv.DIVE_SPOTS.find(s=>s.id==='captains-cup');assert.equal(R.diveSpotFar(cup),false,'Captain’s Cup is swimmable');
{const k=Dv.DIVE_SPOTS.find(s=>s.id==='kelp-trawler');assert.equal(R.diveSpotFar({...cup,x:k.x,z:k.z}),true,'the same zone moved out to the open sea is far');}
assert.equal(R.diveSpotFar(cup,()=>SWIM_RANGE+1),true,'any distance function');

// 2. Discovered from the existing saves (no new key): finds, pickups or a restore.
assert.equal(R.DIVE_FINDS_SAVE_KEY,load('lib/town/water/diveSession.ts').DIVE_FINDS_KEY,'the finds key mirrors diveSession.ts');
assert.equal(R.DIVE_REEF_KEY,'fi2-dive-reef-v1');
const saves={'fi2-dive-finds-v1':JSON.stringify({version:1,spots:{'ray-meadow':['x'],'moon-arch':[],nope:['y']}}),'fi2-dive-reef-v1':JSON.stringify({version:1,zones:{'turtle-pool':[0,2]},restored:['ball-crate','bogus']})};
assert.deepEqual([...R.discoveredFromSaves(k=>saves[k]??null)].sort(),['ball-crate','ray-meadow','turtle-pool']);
assert.equal(R.discoveredFromSaves(()=>'{broken').size,0,'broken saves: nothing explored');assert.equal(R.discoveredFromSaves(()=>null).size,0);
const snap=read('lib/saves/snapshot.ts');for(const k of ['fi2-dive-finds-v1','fi2-dive-reef-v1'])assert(snap.includes(`'${k}'`),k+' is already a synced save key');
assert(!/localStorage\.setItem/.test(read('lib/town/water/reefDiscovery.ts')),'reef discovery writes no save of its own');

// 3. Nearest undiscovered + the edge distance.
const rm=Dv.DIVE_SPOTS.find(s=>s.id==='ray-meadow');
assert.equal(R.diveEdgeDistance(rm,rm.x,rm.z),0,'inside: 0');
const n=R.nearestUndiscovered(rm.x-50,rm.z,new Set());assert.equal(n.spot.id,'ray-meadow');assert(n.distance>30&&n.distance<60);
assert.notEqual(R.nearestUndiscovered(rm.x-50,rm.z,new Set(['ray-meadow'])).spot.id,'ray-meadow','skips explored zones');
assert.equal(R.nearestUndiscovered(0,0,new Set(Dv.DIVE_SPOTS.map(s=>s.id))),null,'all explored');

// 4. The hint: 2 Hz, within REEF_HINT_RANGE of the edge, once per zone per visit, only when eligible, never inside a zone.
assert.equal(R.REEF_HINT_RANGE,300);assert.equal(R.REEF_HINT_HZ,2);assert.equal(R.REEF_HINT_MS,6000);
{const h=R.createReefHints(),none=new Set();const x=rm.x-100,z=rm.z;
 assert.equal(h.tick(.1,x,z,true,none),null,'not before the 2 Hz tick');
 assert.equal(h.tick(.5,x,z,false,none),null,'not while ineligible (job, lesson, room, walking)');
 assert.equal(h.tick(.5,x,z,true,none).id,'ray-meadow','the nearest undiscovered zone');
 const again=h.tick(.5,x,z,true,none);assert(!again||again.id!=='ray-meadow','once per zone per visit');
 const h2=R.createReefHints();assert.equal(h2.tick(.5,x,z,true,new Set(['ray-meadow']))?.id==='ray-meadow',false,'explored zones are never hinted');
 const h3=R.createReefHints();assert.equal(h3.tick(.5,rm.x,rm.z,true,new Set(Dv.DIVE_SPOTS.filter(s=>s.id!=='ray-meadow').map(s=>s.id))),null,'not from inside the zone');
 const h4=R.createReefHints();assert.equal(h4.tick(.5,-2000,-2000,true,none),null,'nothing beyond 300 m');}
// The screen bearing: ahead = 0, right = +90°.
assert(Math.abs(R.screenBearing(0,-1,1,0,0,-10))<1e-9);assert(Math.abs(R.screenBearing(0,-1,1,0,10,0)-Math.PI/2)<1e-9);
assert.match(R.reefHintText(rm,false),/Ray Meadow/);assert.match(R.reefHintText(rm,true),/fly there/);assert(R.REEF_HINT_TITLE.length<=32);

// 5. The toast: the shared toast lane and HUD slot, one wait + one hide timeout, nothing saved; the Town hook is one call.
const toast=read('components/ReefHintToast.tsx'),town=read('components/Town.tsx');
assert.match(toast,/toastLane\.request\('reef'\)/);assert.match(toast,/<HudSlot>/);assert.match(toast,/data-hud-slot="toast"/);
assert.equal((toast.match(/setTimeout\(/g)||[]).length,2,'one wait + one hide timeout');assert(!/localStorage|setInterval|requestAnimationFrame/.test(toast));
assert.match(town,/<ReefHintToast blocked=\{toastBlocked\}\/>/);assert.match(town,/const reefHints=createReefHints\(\);/);
assert.match(town,/reefHints\.step\(active&&!learning\?dt:0,location\.x,location\.z,active&&!learning&&!lessonRef\.current&&!fieldMenu\.current&&!jobActiveRef\.current&&!dive\.diving&&\(water\.swimming\|\|rideRef\.current==='jetpack'\)/,'eligible: flying or swimming, never in a job, lesson, menu or the dive');
console.log('reef-discovery ok (far: '+[...R.farDiveSpotIds()].join(', ')+')');
