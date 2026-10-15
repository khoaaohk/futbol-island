// Rides on the island friends (water P1b, Oct 15 2026; user: "when near a manta ray or whale shark, have a btn that comes up to
// say hang on, on click the drag the character through the water faster"; lib/town/water/animalRides.ts, docs/swimming-research.md
// "P1b implemented"): the prompt text and range, the 10 Hz proximity tick, attach / detach, the speed multipliers, the one-lap
// auto-end, Let go, the real manta / whale-shark hooks (held surfaced on the existing mesh, no new mesh or material), the HUD
// cluster, analytics ids and the Town wiring.
// Run: node tests/water-rides.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const base=path.resolve(__dirname,'..'),T=require('node:module').createRequire(base+'/package.json')('three');
const loaded=new Map();function load(file){file=path.resolve(base,file);if(loaded.has(file))return loaded.get(file);const mod={exports:{}};loaded.set(file,mod.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:mod.exports,module:mod,Math,Map,Set,Uint8Array,Float32Array,Float64Array,require:id=>id==='three'?T:id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});loaded.set(file,mod.exports);return mod.exports;}
const R=load('lib/town/water/animalRides.ts'),W=load('lib/town/water/waterDepth.ts'),H=load('lib/town/water/waterHud.ts');
const read=f=>fs.readFileSync(path.join(base,f),'utf8');
let failed=0;const ok=(name,fn)=>{try{fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};
const near=(a,b,eps,msg)=>assert(Math.abs(a-b)<=eps,`${msg}: ${a} vs ${b}`);

/** A fake friend on a circle of radius `r` round (cx, 0): 96 samples, like a manta loop. */
function circleFriend(kind='manta',r=30,cx=0){const points=[],n=96;for(let i=0;i<n;i++){const a=i/n*Math.PI*2;points.push({x:cx+Math.cos(a)*r,z:Math.sin(a)*r});}
 const lengths=[0];for(let i=1;i<=n;i++){const a=points[i-1],b=points[i%n];lengths.push(lengths[i-1]+Math.hypot(b.x-a.x,b.z-a.z));}
 return {kind,id:kind+'-test',points,lengths,total:lengths[n],u:0,available:true,ridden:false};}

ok('the prompt and Let go copy, the range, the speed multipliers and the lesson',()=>{
 assert.equal(R.RIDE_PROMPT,'Hang on!');assert.equal(R.LET_GO_LABEL,'Let go');
 assert.equal(R.RIDE_RANGE,5,'~5 m from the animal');
 assert.equal(R.RIDE_MULT.manta,1.6);assert.equal(R.RIDE_MULT.whale,1.3);
 near(R.rideSpeed('manta'),1.6*W.SWIM_FAST_SPEED,1e-9,'manta = 1.6 × the sprint swim');near(R.rideSpeed('whale'),1.3*W.SWIM_FAST_SPEED,1e-9,'whale shark = 1.3 × the sprint swim');
 assert(R.rideSpeed('manta')>R.rideSpeed('whale')&&R.rideSpeed('whale')>W.SWIM_FAST_SPEED,'both faster than sprinting');
 assert(R.RIDE_WAKE.whale>R.RIDE_WAKE.manta&&R.RIDE_WAKE.manta>1.25,'a bigger wake than the sprint swim, biggest behind the whale shark');
 assert.equal(`${R.RIDE_LESSON.title}: ${R.RIDE_LESSON.text[0].toLowerCase()+R.RIDE_LESSON.text.slice(1)}`,/* the toast: the title in bold, then the line */'Ride the wave: a counter-attack is fastest when you move with the play, not against it.');
 assert.equal(R.RIDE_LESSON.kind,'Coaching idea');assert.equal(R.RIDE_LESSON_KEY,'fi2-ride-lesson-v1');
 assert.equal(R.RIDE_TICK,1/W.WATER_PROBE_HZ,'the proximity test runs at the water probe rate');
});

ok('loopPoint walks the loop by arc length and gives the heading as the rig yaw',()=>{
 const sq={points:[{x:0,z:0},{x:10,z:0},{x:10,z:10},{x:0,z:10}],lengths:[0,10,20,30,40],total:40},o={x:0,z:0,yaw:0};
 R.loopPoint(sq.points,sq.lengths,sq.total,5,o);near(o.x,5,1e-9,'x');near(o.z,0,1e-9,'z');near(o.yaw,Math.PI/2,1e-9,'heading +x');
 R.loopPoint(sq.points,sq.lengths,sq.total,25,o);near(o.x,5,1e-9,'x');near(o.z,10,1e-9,'z');near(Math.abs(o.yaw),Math.PI/2,1e-9,'heading −x');
 R.loopPoint(sq.points,sq.lengths,sq.total,45,o);near(o.x,5,1e-9,'wraps past the total');
});

ok('the "Hang on!" prompt range: within 5 m of the body, swimming only, at most 10 times a second',()=>{
 const f=circleFriend('manta',30),rides=R.createAnimalRides(()=>[f]);// the manta starts at (30, 0)
 const edge=30+R.RIDE_BODY.manta+R.RIDE_RANGE;
 assert.equal(rides.scan(1/60,edge+.3,0,true),null,'just out of range: no prompt');
 rides.scan(.2,edge-.3,0,true);assert.equal(rides.state.near,f,'in range: the prompt');near(rides.state.nearDist,R.RIDE_RANGE-.3,1e-6,'distance to the body');
 // Between probe ticks nothing is recomputed (one sample per 0.1 s).
 assert.equal(rides.scan(1/60,edge+20,0,true),f,'the next frame keeps the last pick (10 Hz)');
 assert.equal(rides.scan(.1,edge+20,0,true),null,'the next tick drops it');
 rides.scan(.2,edge-1,0,true);assert.equal(rides.state.near,f);
 assert.equal(rides.scan(1/60,edge-1,0,false),null,'wading / flying / on land: no prompt at all');
 f.available=false;assert.equal(rides.scan(.2,edge-1,0,true),null,'an animal that is not drawn (far island, hot tier) never prompts');f.available=true;
 const w=circleFriend('whale',40,200),both=R.createAnimalRides(()=>[f,w]);
 both.scan(.2,240+R.RIDE_BODY.whale+4,0,true);assert.equal(both.state.near,w,'the whale shark reaches farther (its 13 m body)');
});

ok('attach: the rider is held at the grip point and dragged along the loop at 1.6× / 1.3× the sprint swim',()=>{
 for(const kind of ['manta','whale']){
  const f=circleFriend(kind,30),rides=R.createAnimalRides(()=>[f]),pos={x:30+R.RIDE_BODY[kind],z:0},vel={x:0,z:0};
  rides.scan(.2,pos.x,pos.z,true);const g=rides.grab(W.SWIM_SPEED);
  assert.equal(g.grabbed,kind);assert.equal(rides.riding,true);assert.equal(f.ridden,true,'the graphics module holds the animal');
  assert.equal(rides.scan(.2,pos.x,pos.z,true),null,'no prompt while riding');
  let maxRoll=0;for(let i=0;i<300;i++){rides.step(1/60,pos,vel);maxRoll=Math.max(maxRoll,Math.abs(rides.state.roll));}
  near(Math.hypot(vel.x,vel.z),R.rideSpeed(kind),.06*R.rideSpeed(kind),kind+' ride speed after 5 s');
  // The rider sits on the animal: the loop point plus the grip offset ahead along the heading.
  const o={x:0,z:0,yaw:0};R.loopPoint(f.points,f.lengths,f.total,f.u,o);
  near(Math.hypot(pos.x-o.x-Math.sin(o.yaw)*R.RIDE_GRIP[kind],pos.z-o.z-Math.cos(o.yaw)*R.RIDE_GRIP[kind]),0,1e-6,kind+' at the grip point');
  near(Math.atan2(vel.x,vel.z),o.yaw,1e-6,'moving along the heading');
  // A steady circle turns at v/r: the body leans into it, bounded.
  assert(maxRoll>.1&&maxRoll<=R.RIDE_ROLL_MAX+1e-9,`${kind} rolls with the turns (${maxRoll.toFixed(2)} rad)`);
 }
});

ok('one lap, then the ride ends itself (heat rule); the animal goes back to its own pace',()=>{
 const f=circleFriend('manta',30),rides=R.createAnimalRides(()=>[f]),vel={x:0,z:0};
 f.u=50;const o={x:0,z:0,yaw:0};R.loopPoint(f.points,f.lengths,f.total,f.u,o);const pos={x:o.x+1,z:o.z};rides.scan(.2,pos.x,pos.z,true);assert.equal(rides.grab(0).grabbed,'manta');let ended='',t=0;
 while(!ended&&t<120){const e=rides.step(1/60,pos,vel);ended=e.ended;t+=1/60;}
 assert.equal(ended,'lap','ended after its one lap');
 near(rides.state.travelled,f.total,R.rideSpeed('manta')/60+1e-6,'exactly one lap of the loop');
 assert(t<f.total/W.SWIM_FAST_SPEED,'quicker than sprinting the same lap');
 assert.equal(rides.riding,false);assert.equal(f.ridden,false,'released: the manta glides on by itself');
 assert(rides.events.speed>0&&Number.isFinite(rides.events.x),'the dismount knows where and how fast (the splash + the glide out)');
 const again=rides.step(1/60,pos,vel);assert.equal(again.ended,'','nothing runs after the ride');
});

ok('Let go ends early; a vanished animal lets go too',()=>{
 const f=circleFriend('whale',40),rides=R.createAnimalRides(()=>[f]),pos={x:40+R.RIDE_BODY.whale,z:0},vel={x:0,z:0};
 rides.scan(.2,pos.x,pos.z,true);rides.grab(1);for(let i=0;i<60;i++)rides.step(1/60,pos,vel);
 assert.equal(rides.letGo().ended,'off');assert.equal(f.ridden,false);assert.equal(rides.riding,false);
 assert.equal(rides.letGo().ended,'','letting go twice does nothing');
 rides.scan(.2,pos.x,pos.z,true);rides.grab(1);f.available=false;assert.equal(rides.step(1/60,pos,vel).ended,'gone');assert.equal(f.ridden,false);
 const g=R.createAnimalRides(()=>[]);assert.equal(g.grab(1).grabbed,'','nothing near: no grab');
});

ok('the real animals: every manta and the whale shark are friends; a ridden manta is held surfaced on its existing mesh (no new mesh or material)',()=>{
 const heat=load('lib/graphics/heatTier.ts');heat.forceHeatTier(0);
 const {createCayMantas}=load('lib/graphics/cayMantas.ts'),{createWhaleShark}=load('lib/graphics/whaleShark.ts');
 const scene=new T.Scene(),mantas=createCayMantas(scene,{phone:true}),whale=createWhaleShark(scene);
 const inventory=()=>{const meshes=new Set(),mats=new Set(),geos=new Set();scene.traverse(o=>{if(o.isMesh){meshes.add(o);geos.add(o.geometry);(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>mats.add(m));}});return {meshes:meshes.size,mats:mats.size,geos:geos.size};};
 const before=inventory();
 assert.equal(mantas.friends.length,mantas.islands.reduce((n,r)=>n+r.tracks.length,0),'one friend per manta loop');
 assert(mantas.friends.every(f=>f.kind==='manta'&&f.total>0&&f.lengths.length===f.points.length+1));
 assert.equal(whale.friend.kind,'whale');assert.equal(whale.friend.total,whale.friend.lengths[whale.friend.points.length]);
 // Stand by a Summit Isle manta and wake its island.
 const isle=mantas.islands.find(r=>r.island==='summit'),f=mantas.friends.find(x=>x.id===isle.tracks[0].loop.id);
 const o={x:0,z:0,yaw:0};R.loopPoint(f.points,f.lengths,f.total,f.u,o);
 const cam=new T.PerspectiveCamera(60,390/844,.1,900),frustum=new T.Frustum(),vp=new T.Matrix4();cam.position.set(o.x+10,25,o.z+20);cam.lookAt(o.x,0,o.z);cam.updateMatrixWorld();vp.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse);frustum.setFromProjectionMatrix(vp);
 const player={x:o.x+3,z:o.z};mantas.update(1/30,false,frustum,player);whale.update(1/30,false,frustum,player);
 assert.equal(f.available,true,'the near manta is available');
 const rides=R.createAnimalRides(()=>[...mantas.friends,whale.friend]);rides.scan(.2,player.x,player.z,true);assert.equal(rides.state.near,f,'the near manta prompts');
 rides.grab(2);assert.equal(isle.surface.visible,true,'held surfaced on the island\'s one surfacing mesh');
 const pos={x:player.x,z:player.z},vel={x:0,z:0},m=new T.Matrix4(),p=new T.Vector3(),s=new T.Vector3(),q=new T.Quaternion();
 for(let i=0;i<30;i++){rides.step(1/30,pos,vel);mantas.update(1/30,true/* reduced motion: the ride still moves */,new T.Frustum()/* looking away */,pos);}
 const idx=isle.tracks.indexOf(isle.tracks.find(t=>t.loop.id===f.id));
 isle.under.getMatrixAt(idx,m);m.decompose(p,q,s);assert.equal(s.x,0,'its silhouette instance is hidden while held');
 isle.surface.getMatrixAt(0,m);m.decompose(p,q,s);near(p.x,R.loopPoint(f.points,f.lengths,f.total,f.u,o).x,1e-3,'the surfaced manta is where the ride put it');near(s.x,1.2,1e-6,'full size');
 assert.deepEqual(inventory(),before,'no new mesh, material or geometry');
 rides.letGo();assert.equal(isle.surface.visible,false,'let go: the surfacing mesh hides again');
 // The whale shark: the ride owns u, the one mesh follows.
 const u0=whale.friend.u;whale.friend.ridden=true;whale.friend.u=(u0+30)%whale.friend.total;whale.update(1/30,true,new T.Frustum(),{x:whale.mesh.position.x,z:whale.mesh.position.z});
 R.loopPoint(whale.friend.points,whale.friend.lengths,whale.friend.total,whale.friend.u,o);near(whale.mesh.position.x,o.x,1e-3,'the whale shark follows the ride');near(whale.mesh.position.z,o.z,1e-3,'the whale shark follows the ride');
 whale.friend.ridden=false;assert.deepEqual(inventory(),before,'still nothing new');
 heat.forceHeatTier(null);mantas.dispose();whale.dispose();
});

ok('HUD: riding swaps the water cluster for the single Let go action (icon-only), the prompt is the island prompt style',()=>{
 const b=H.waterButtonsFor({inWater:true,swimming:true,flyOk:true,riding:true});
 assert.equal(b,H.RIDING_BUTTONS);assert.equal(JSON.stringify(b.filter(x=>x.enabled).map(x=>x.id)),'["letgo"]','one live action: Let go');
 assert.equal(H.RIDE_LET_GO.label,'Let go');assert.equal(H.RIDE_LET_GO.icon,'letgo');
 assert.equal(H.waterButtonsFor({inWater:true,swimming:true,flyOk:false,riding:false}),H.WATER_BUTTONS,'not riding: the swim cluster as before');
 const job=read('components/JobActionButton.tsx');assert(/WATER_IDS=new Set\(\[[^\]]*'letgo'/.test(job),'Let go is icon-only like the other water buttons');
 assert(/letgo:'M/.test(read('components/TravelIcon.tsx')),'the Let go icon exists');
 const town=read('components/Town.tsx');
 assert(/<button type="button" className="store-enter-prompt" data-ride-grab=""[^>]*onClick=\{\(\)=>rideActions\.current\(\)\}>\{RIDE_PROMPT\}<\/button>/.test(town),'the floating prompt is a store-enter-prompt button (the Talk / Fish / Sell style and press rule)');
 assert(/cands\.push\(\{kind:'enter',key:rideWant\.key/.test(town),'the prompt competes in the HUD arbiter like the other proximity actions');
 assert(/<SwimLessonToast blocked=\{toastBlocked\} which="ride"\/>/.test(town)&&/which==='ride'\?waterStore\.get\(\)\.rideLesson/.test(read('components/SwimLessonToast.tsx')),'the lesson toast, once per device');
});

ok('heat + wiring: the scan on the probe tick only, the ride step only while riding, no timers, no new meshes',()=>{
 const src=read('lib/town/water/animalRides.ts');
 assert(!/setTimeout|setInterval|requestAnimationFrame|new T\.|from 'three'/.test(src),'pure: no timers, loops or three.js');
 const town=read('components/Town.tsx');
 assert(/animalRides\.scan\(dt,location\.x,location\.z,water\.inWater&&water\.state\.phase==='swim'\)/.test(town),'the scan runs only while swimming (10 Hz inside)');
 assert(/if\(animalRides\.riding&&water\.swimming&&rideRef\.current==='walk'\)\{rideEnded\(animalRides\.step\(dt,location,velocity\)\)/.test(town),'the ride drives the movement');
 assert(/pose\.kind='hold'/.test(town)&&/s\.kind==='hold'/.test(read('lib/graphics/swimPose.ts')),'the hold-on pose');
 assert(/pose\.kind='hold';pose\.effort=rs\.roll;pose\.fast=0;ev\.wake=false;ev\.stroke=0;/.test(town),'the swim strokes\' wake is off while riding (the ride has its own)');
 assert(/RIDE_CAM_LIFT/.test(town),'a slightly higher follow while riding');
 assert(/countRideStart\(re\.grabbed\)/.test(town)&&/countRideLap\(\)/.test(town)&&/countRideOff\(\)/.test(town),'analytics at the grab, the lap and the early let go');
 const ids=load('lib/analytics/countIds.ts');for(const id of ['wa:ride_manta','wa:ride_whale','wa:ride_lap','wa:ride_off'])assert(ids.FIXED_COUNT_IDS.includes(id),id+' is a known counter');
 assert(/counters[\s\S]*ride the[\s\S]*existing learning-counter channel \(`k`\) and need no migration/.test(read('supabase/migrations/20261017_analytics_water.sql')),'wa: ids ride the k channel (no migration)');
 assert(/wa:ride_manta/.test(read('app/admin/WaterSection.tsx')),'the admin Water section shows the rides');
 assert(/ride\.cjs|water-rides\.cjs/.test(read('package.json')),'registered in npm test');
});

if(failed){console.log(`\n${failed} failed`);process.exit(1);}
console.log('\nwater-rides: all passed');
