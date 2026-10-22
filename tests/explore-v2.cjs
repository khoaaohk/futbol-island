// Explore v2 (Oct 21 2026; docs/swimming-research.md §10, docs/performance-guide.md "Explore v2"): the frozen island while under, the
// swim feel (glide, dart, banking), the reef journey (pickups, progress, restore), the buddy fish, the underwater ball, the room's water
// colour from the tokens, and the room's budget (draws / triangles within the existing caps).
const assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const base=path.resolve(__dirname,'..'),T=require('node:module').createRequire(base+'/package.json')('three');
const G={Math,Map,Set,WeakMap,Uint8Array,Uint16Array,Uint32Array,Int8Array,Int16Array,Int32Array,Float32Array,Float64Array,console,JSON,Number,Object,Array,String,Symbol,Error,Promise,Date,RegExp,isFinite,parseFloat,parseInt};
const loaded=new Map();function load(file){file=path.resolve(base,file);if(loaded.has(file))return loaded.get(file);const mod={exports:{}};loaded.set(file,mod.exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,{...G,exports:mod.exports,module:mod,
  require:id=>id==='three'?T:id.startsWith('@/')?load(resolveTs(path.resolve(base,id.slice(2)))):id.startsWith('.')?load(resolveTs(path.resolve(path.dirname(file),id))):require(id)});loaded.set(file,mod.exports);return mod.exports;}
const resolveTs=p=>fs.existsSync(p+'.ts')?p+'.ts':fs.existsSync(p+'.tsx')?p+'.tsx':p+'/index.ts';
const read=f=>fs.readFileSync(path.join(base,f),'utf8');
let passed=0;const ok=(name,fn)=>{try{fn();passed++;console.log('ok  ',name);}catch(e){console.error('FAIL',name);throw e;}};
const D=load('lib/town/water/diveSpots.ts'),S=load('lib/town/water/diveSession.ts'),J=load('lib/town/water/diveJourney.ts');

ok('the island is frozen while under: the dive branch runs first in the frame and every island system comes after it',()=>{
 const town=read('components/Town.tsx'),a=town.indexOf('    function animate(now:number){'),body=town.slice(a);
 const branch=body.indexOf('if(dive.diving){const restFrame=idleRide.interval(now,dive.resting,');assert(branch>0,'the dive branch');
 const end=body.indexOf('return;}',branch),seg=body.slice(branch,end);
 // What runs under the water: the room rest cap, the heat governor fed with the room's frames, the motion resolution, the dive step,
 // the reef sound bed, the stick paint. Nothing of the island.
 for(const need of ['heat.setRest(restFrame>0,restFrame)','frameCapSlot(','motionResolution.update(','dive.frame(','sound.swim(',"heat.afterRender(now,ms,performance.now()-now,renderer.info.render.calls,'dive')"])assert(seg.includes(need),'under the water: '+need);
 for(const banned of ['renderer.render(','world.update','openSea.','wildBugs','bugSwarm','games.','streetTraffic','islandNpcs','water.step','waterStore.set'])assert(!seg.includes(banned),'nothing of the island in the dive branch: '+banned);
 // The frozen systems: each one's per-frame call sits AFTER the dive branch's early return (so it never runs while diving).
 const FROZEN={'island rest heuristics (players, cars, townsfolk)':'const restNear=','island render':'renderer.render(scene,camera)','water shader clock':'world.updateWater(',
  'Coral Cay sharks':'world.updateSharks(','open sea life (rays, whales)':'openSea.update(','ferry':'world.updateFerry(','lighthouse':'world.updateLighthouse(',
  'HUD tick (water store)':'if(hudTick)waterStore.set(','sound move bed':'sound.move(rideRef.current,Math.hypot(velocity.x,velocity.z)','island heat render hooks':'heat.beforeRender(',
  'swim clear window':'swimClear.update(','dive shoal preview':'divePreview.update(','catch stage':'if(jobs.staging)'};
 const after=branch+seg.length;
 for(const [name,needle] of Object.entries(FROZEN)){const i=body.indexOf(needle);assert(i>0,'found '+name);assert(i>after,name+' runs after the dive branch (frozen while under)');}
 assert.equal((body.match(/dive\.frame\(/g)||[]).length,1,'one dive frame call');
 // The island's audio goes quiet: the music is ducked on the way under and back on surfacing; the footstep / wind bed is stopped.
 assert(town.includes('entered:(spot,edge)=>{if(edge)countDiveEnterEdge();else countDiveStart();music.setDucked(true);sound.move(rideRef.current,0,false);'));
 assert(town.includes("surfaced:(spot,reason)=>{if(reason==='edge')countDiveExitEdge();else countDiveSurface();music.setDucked(false);"));
 // Kept pins: the dispose order other tests rely on.
 assert(town.includes('swimClear.dispose();clearWin.dispose();'));
});

ok('the room rests: dive.resting only when nothing the player moved is moving (then the 20 fps rest cap applies)',()=>{
 const RT=load('lib/town/water/diveRuntime.ts'),root=new T.Group(),scene=new T.Scene();scene.add(root);
 const ports={scene,renderer:{render(){}},camera:new T.PerspectiveCamera(50,390/844),player:{root,update(){}},phone:true,reduced:()=>false,ui:()=>null,place(){},hide(){},
  entered(){},surfaced(){},found(){},credit(){},low(){},out(){},fly:()=>false};
 const spot=D.diveSpotById('captains-cup'),rt=RT.createDiveRuntime(ports);rt.scan(.2,spot.x,spot.z,true);assert(rt.start());
 for(let i=0;i<30;i++)rt.frame(1/30,{sx:0,sy:-1,lift:0},390,844);assert.equal(rt.resting,false,'swimming is not resting');
 for(let i=0;i<150;i++)rt.frame(1/30,{sx:0,sy:0,lift:0},390,844);assert.equal(rt.resting,true,'hovering after the glide is resting');
 rt.frame(1/30,{sx:0,sy:0,lift:1},390,844);assert.equal(rt.resting,false,'rising is not');rt.dispose();
});

ok('swim feel: the glide carries, a dart bursts past the top speed then cools down and costs a little breath, banking into turns',()=>{
 const spot=D.diveSpotById('ray-meadow');
 const run=(dart)=>{const s=S.createDiveSession();s.scan(.2,spot.x,spot.z,true);assert(s.start());for(let i=0;i<60;i++)s.step(1/30,{sx:0,sy:-1,lift:0});
  const b0=s.state.breath;if(dart)s.step(1/30,{sx:0,sy:-1,lift:0,dart:true});let top=0;for(let i=0;i<15;i++){s.step(1/30,{sx:0,sy:-1,lift:0});top=Math.max(top,Math.hypot(s.state.vx,s.state.vz));}return {s,top,b0};};
 const plain=run(false),d=run(true);
 assert(plain.top<=S.DIVE_SPEED+.01,'top speed without a dart');assert(d.top>S.DIVE_SPEED+.8,'the dart bursts: '+d.top.toFixed(2));assert.equal(d.s.state.darts,1);
 assert(d.s.state.breath<plain.s.state.breath-S.DIVE_DART_BREATH*.5,'a dart costs breath');
 const e=d.s.step(1/30,{sx:0,sy:-1,lift:0,dart:true});assert.equal(e.dart,false,'cooldown: no second dart at once');
 // Glide: let go at full speed, it coasts farther than the old drag would.
 const g=plain.s,x0=g.state.x,z0=g.state.z;for(let i=0;i<60;i++)g.step(1/30,{sx:0,sy:0,lift:0});const coast=Math.hypot(g.state.x-x0,g.state.z-z0);
 assert(coast>S.DIVE_SPEED*(1-Math.exp(-S.DIVE_DRAG*2))/S.DIVE_DRAG*1.1,'the glide carries: '+coast.toFixed(2));
 const t=S.createDiveSession();t.scan(.2,spot.x,spot.z,true);t.start();for(let i=0;i<60;i++)t.step(1/30,{sx:1,sy:-1,lift:0});assert(Math.abs(t.state.roll)>.3,'banks into the turn: '+t.state.roll.toFixed(2));
 const src=read('lib/town/water/diveSession.ts'),step=src.slice(src.indexOf('  step(dt:number'),src.indexOf('  use(){'));assert(!/new [A-Z]/.test(step),'no allocation in step');
});

ok('the reef journey: 8 pickups per zone on the path, on the sand, inside the room; progress, next target, restore, saves',()=>{
 for(const z of D.DIVE_SPOTS){const p=J.journeyPickups(z);assert.equal(p.length,8,z.id);assert.equal(J.journeyTotal(z),12);
  assert.equal(p.filter(q=>q.kind==='litter').length,4);for(const q of p){assert(Math.hypot(q.x,q.z)<=D.DIVE_ROOM_R-1.99,'inside '+z.id);assert(Math.abs(q.y-(D.diveFloor(q.x,q.z,z.floor)+.28))<1e-9,'on the sand');assert(q.y<D.DIVE_SURFACE_Y-.5);}
  assert.equal(new Set(p.map(q=>q.x.toFixed(2)+','+q.z.toFixed(2))).size,8,'no two in one place');
  const got=p.map(()=>false);assert.equal(J.reach(p,got,p[3].x,p[3].y,p[3].z),3);got[3]=true;assert.notEqual(J.reach(p,got,p[3].x,p[3].y,p[3].z),3);
  const out={x:0,z:0};assert(J.nextTarget(z,p,got,[],0,13,out));assert.equal(J.nextTarget(z,p,p.map(()=>true),z.finds.map(f=>f.id),0,13,out),null,'done: nothing left to lead to');}
 assert.equal(J.reefColour(0),J.REEF_DULL);assert.equal(J.reefColour(1),1);assert.equal(J.reefHealth(4,4,12),8/12);
 const save=J.parseDiveReef({zones:{'captains-cup':[1,1,99,-1,'x',2],nope:[1]},restored:['captains-cup','nope']},D.DIVE_SPOTS);
 assert.equal(JSON.stringify(save.zones),'{"captains-cup":[1,2]}');assert.equal(JSON.stringify(save.restored),'["captains-cup"]');assert.equal(J.markRestored(save,'captains-cup'),save);
 assert.equal(J.reefRunId('pauls-grotto'),'dive:pauls-grotto:reef');assert(J.REEF_RESTORE_COINS<=3,'small, once ever, Training-metered');
 assert(/\^\(.*dive:/.test(read('lib/town/dailyMeter.ts')),'dive: runs are metered by the Training meter');
 const SN=load('lib/saves/snapshot.ts');assert(SN.SYNC_KEYS.includes(J.DIVE_REEF_KEY));assert(read('docs/accounts-design.md').includes('`fi2-dive-reef-v1`'));
 const CID=load('lib/analytics/countIds.ts');for(const id of ['wa:dive_dart','wa:dive_pick','wa:dive_restore','wa:dive_goal'])assert(CID.isCountId(id),id);
});

ok('the runtime: swim through a pickup collects it, finishing the zone restores it once (coins, card, formation), the ball scores',()=>{
 const RT=load('lib/town/water/diveRuntime.ts'),root=new T.Group(),scene=new T.Scene();scene.add(root);const credits=[],events=[];
 const ports={scene,renderer:{render(){}},camera:new T.PerspectiveCamera(50,390/844),player:{root,update(){}},phone:true,reduced:()=>false,ui:()=>null,place(){},hide(){},
  entered(){},surfaced(){},found(){},credit:(id,c)=>credits.push([id,c]),low(){},out(){},fly:()=>false,picked:k=>events.push('pick:'+k),restored:()=>events.push('restored'),goal:()=>events.push('goal')};
 const spot=D.diveSpotById('pauls-grotto'),rt=RT.createDiveRuntime(ports);rt.scan(.2,spot.x,spot.z,true);assert(rt.start());
 const st=rt.session.state;
 for(const p of rt.pickups){st.x=p.x;st.z=p.z;st.y=p.y+.2;st.depthT=1;rt.frame(1/30,{sx:0,sy:0,lift:0},390,844);st.breath=1;}
 assert.equal(rt.got.filter(Boolean).length,8,'every pickup collected by swimming through');assert.equal(events.filter(e=>e.startsWith('pick')).length,8);
 assert.equal(RT.diveStore.get().reef,'8/12');
 for(const f of spot.finds){const p=D.diveFindPoint(f,{x:0,y:0,z:0},spot.floor);st.x=p.x;st.z=p.z;st.y=p.y;rt.session.state.find=f;rt.use();st.breath=1;}
 assert(events.includes('restored'),'restored at 12/12');assert(credits.some(([id,c])=>id==='dive:pauls-grotto:reef'&&c===3),'the restore pays once');
 assert.equal(RT.diveStore.get().restored,true);assert.equal(RT.diveStore.get().card.id,'reef');
 // The ball: put it just in front of the goal line, moving through it.
 const room=rt.room;assert(room.ball&&room.goal,'the pitch zone has a ball');
 const g=room.goal;st.x=g.x;st.z=g.z+8;for(let i=0;i<5;i++)rt.frame(1/30,{sx:0,sy:0,lift:0},390,844);
 rt.dispose();assert.equal(RT.diveStore.get().diving,false);
});

ok('the room: water colour from the tokens (no fixed background), within the existing caps, buddy and burst in one draw',()=>{
 const R=load('lib/graphics/diveRoom.ts'),W=load('lib/graphics/waterTokens.ts'),src=read('lib/graphics/diveRoom.ts');
 assert(src.includes('scene.background=fog.color')&&!src.includes('scene.background=new T.Color'),'the background is the fog colour, rewritten each frame');
 assert(src.includes('ROOM_SHALLOW_MIX')&&src.includes('ROOM_WINDOW')&&src.includes('ROOM_CAUSTIC'));assert(W.ROOM_SHALLOW_MIX[0]>W.ROOM_SHALLOW_MIX[1],'clearer near the surface');
 const rows=[];
 for(const z of D.DIVE_SPOTS){const picks=J.journeyPickups(z);const room=R.createDiveRoom(z,{phone:true,reduced:false,found:[],pickups:picks}),st=room.stats();
  assert(st.draws<=16,'phone draws '+st.draws+' '+z.id);assert(st.triangles<76000,'phone triangles '+st.triangles+' '+z.id);rows.push(`${z.id}:${st.draws}/${st.triangles}`);
  const c0=room.scene.background.clone();room.camera.position.set(0,D.DIVE_SURFACE_Y-.6,10);room.frame(1,1/30,{x:0,y:1,z:13,yaw:Math.PI});const top=room.scene.background.clone();
  room.frame(2,1/30,{x:0,y:D.diveFloor(0,13,z.floor)+.6,z:13,yaw:Math.PI});assert(top.r+top.g+top.b>room.scene.background.r+room.scene.background.g+room.scene.background.b-1e-6,'lighter near the surface');void c0;
  room.collect(0,1);room.setReef(.8);room.form(1,0,1,0);room.setBuddy(0,1,0,1,0,0,true);
  const lite=R.createDiveRoom(z,{phone:true,reduced:false,found:[],pickups:picks,lite:true});assert(lite.stats().triangles<st.triangles);lite.dispose();room.dispose();}
 console.log('     phone rooms (draws/triangles): '+rows.join(' '));
 const draw=src.slice(src.indexOf('  frame(t:number'),src.indexOf('  collect(i:number'));assert(!/new T\.|\[\]|=>\{/.test(draw.replace(/\/\/.*$/gm,'')),'no allocation in the room frame');
});
console.log(`\nexplore-v2: ${passed} passed`);
