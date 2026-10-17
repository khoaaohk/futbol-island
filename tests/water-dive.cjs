// Diving spots (water P2, Oct 16 2026; user: "For the diving spots, have some type of marker on the top of the water, and also the
// water spot for the diving area should also be a different shade … build one to test first"; lib/town/water/diveSpots.ts,
// diveSession.ts, diveRuntime.ts, lib/graphics/diveRoom.ts, diveBuoys.ts; docs/swimming-research.md "P2 implemented: one spot"):
// the spot data and its verified fact, the prompt range, swim → dive → surface, breath timing, each find credited once, the room's
// budget and that dispose leaves nothing, analytics ids, the save keys, the ocean tint (zero cost at rest), precomputed fish paths.
// Run: node tests/water-dive.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const base=path.resolve(__dirname,'..'),T=require('node:module').createRequire(base+'/package.json')('three');
const G={Math,Map,Set,WeakMap,Uint8Array,Uint16Array,Uint32Array,Int8Array,Int16Array,Int32Array,Float32Array,Float64Array,console,JSON,Number,Object,Array,String,Symbol,Error,Promise,Date,RegExp,isFinite,parseFloat,parseInt};
const loaded=new Map();function load(file){file=path.resolve(base,file);if(loaded.has(file))return loaded.get(file);const mod={exports:{}};loaded.set(file,mod.exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,{...G,exports:mod.exports,module:mod,
  require:id=>id==='three'?T:id.startsWith('@/')?load(resolveTs(path.resolve(base,id.slice(2)))):id.startsWith('.')?load(resolveTs(path.resolve(path.dirname(file),id))):require(id)});loaded.set(file,mod.exports);return mod.exports;}
const resolveTs=p=>fs.existsSync(p+'.ts')?p+'.ts':fs.existsSync(p+'.tsx')?p+'.tsx':p+'/index.ts';
const read=f=>fs.readFileSync(path.join(base,f),'utf8');
let failed=0;const ok=(name,fn)=>{try{fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};
const near=(a,b,eps,msg)=>assert(Math.abs(a-b)<=eps,`${msg}: ${a} vs ${b}`);

const D=load('lib/town/water/diveSpots.ts'),S=load('lib/town/water/diveSession.ts'),W=load('lib/town/water/waterDepth.ts'),H=load('lib/town/water/waterHud.ts');
const spot=D.DIVE_SPOTS[0];

ok('ONE spot to test first: Paul’s Grotto off North Beach Rocks, a 8–10 m patch with a lighter turquoise tint',()=>{
 assert.equal(D.DIVE_SPOTS.length,1);assert.equal(spot.id,'pauls-grotto');
 assert(spot.radius>=8&&spot.radius<=10,'patch radius ~8-10 m');
 const c=new T.Color(spot.tint),hsl={};c.getHSL(hsl,T.SRGBColorSpace);assert(hsl.l>.55&&hsl.h>.42&&hsl.h<.55,'lighter turquoise');
 assert(Math.hypot(spot.surface.x-spot.x,spot.surface.z-spot.z)<spot.radius*.5,'you come up beside the buoy, inside the patch');
 assert(D.DIVE_SPOTS.length<=D.DIVE_SLOTS,'every spot has a shader slot');
});

ok('the fact is the one already verified in the repo (fishCatalog.ts Paul the Octopus), plain-text credit, labelled; no links in kid copy',()=>{
 const cat=read('lib/town/fishing/fishCatalog.ts');assert(cat.includes(spot.fact.text),'the same sentence as the verified catalogue fact');
 assert(cat.includes("source:'https://en.wikipedia.org/wiki/Paul_the_Octopus'"),'its source in the catalogue');assert(/Wikipedia/.test(spot.fact.credit));
 const relic=spot.finds.find(f=>f.kind==='relic');assert.equal(relic.label,'Real football fact');assert.equal(relic.text,spot.fact.text);assert.equal(relic.credit,spot.fact.credit);
 assert(/^Island story/.test(relic.story),'the octopus under the goal is labelled island fiction');
 for(const f of spot.finds){assert(['Real football fact','Coaching idea','Island story'].includes(f.label));for(const t of [f.title,f.text,f.credit??'',f.story??'',f.prompt,f.aria])assert(!/https?:|www\.|\.com/.test(t),'no links: '+t);}
 assert(!/https?:/.test(spot.story+spot.lesson+spot.fact.credit));
 assert.equal(JSON.stringify(spot.finds.map(f=>f.kind).sort()),JSON.stringify(['burst','clam','relic','treasure']),'relic, coral burst, clam, treasure');
 const ECON=load('lib/economy.ts');for(const f of spot.finds)assert((f.coins??0)<=ECON.LEARN_COINS.ball,'never more than a hidden ball');
 assert.equal(spot.finds.find(f=>f.kind==='treasure').coins,3,'a small metered value, like a beachcombing find');
});

ok('placement: open water inside the swim range, clear of the fishing float and every shark / manta / whale-shark loop',()=>{
 const L=load('lib/town/landmass.ts'),M=load('lib/town/mantaLoops.ts'),C=load('lib/town/coralCay.ts'),SS=load('lib/town/summitSeaLife.ts'),F=load('lib/town/fishing/fishCatalog.ts');
 for(let a=0;a<16;a++){const x=spot.x+Math.cos(a/16*Math.PI*2)*spot.radius,z=spot.z+Math.sin(a/16*Math.PI*2)*spot.radius;
  assert(!L.onLand(x,z),'the whole patch is sea');assert(W.waterDepthAt(x,z)>=W.ZONE_SWIM+W.WADE_HYSTERESIS,'swimming depth over the whole patch');}
 const d=L.distanceToLand(spot.x,spot.z);assert(d+spot.radius<W.SWIM_RANGE,'inside the swim range');assert(d>spot.radius+5,'the patch stays off the shore strip');
 const fish=F.FISH_SPOTS.find(s=>s.id===spot.near);assert(fish,'the nearby fishing spot');assert(Math.hypot(fish.buoy.x-spot.x,fish.buoy.z-spot.z)>spot.radius+10,'a cast never lands in the patch');
 for(const s of F.FISH_SPOTS)assert(Math.hypot(s.buoy.x-spot.x,s.buoy.z-spot.z)>spot.radius+10,'clear of every fishing float: '+s.id);
 const loops=[...M.MANTA_LOOPS.map(l=>l.points),...C.SHARK_LOOPS.map(l=>l.points||l),...SS.SUMMIT_SHARK_LOOPS.map(l=>l.points||l)];
 for(const pts of loops)for(const p of pts)assert(Math.hypot(p.x-spot.x,p.z-spot.z)>60,'far from the sea-life loops');
});

ok('the Dive prompt range: inside the patch, swimming only, at the probe rate (10 Hz)',()=>{
 assert.equal(D.DIVE_PROMPT,'Dive');assert.equal(S.DIVE_TICK,1/W.WATER_PROBE_HZ);
 assert.equal(D.diveSpotAt(spot.x,spot.z)?.id,spot.id);assert.equal(D.diveSpotAt(spot.x+spot.radius-.1,spot.z)?.id,spot.id);assert.equal(D.diveSpotAt(spot.x+spot.radius+.1,spot.z),null);
 const s=S.createDiveSession();assert.equal(s.scan(.01,spot.x,spot.z,true)?.id,spot.id,'the first scan is immediate');
 assert.equal(s.scan(.05,spot.x+30,spot.z,true)?.id,spot.id,'between ticks the last answer stands (10 Hz, not per frame)');
 assert.equal(s.scan(.06,spot.x+30,spot.z,true),null,'the next tick sees the swimmer left the patch');
 s.scan(.2,spot.x,spot.z,true);assert.equal(s.scan(.01,spot.x,spot.z,false),null,'only while swimming');
});

ok('swim → dive → surface: Dive needs the patch; the room comes up; Surface drifts up, then the island',()=>{
 const s=S.createDiveSession();
 assert.equal(s.start(),false,'not in a patch');
 s.scan(.2,spot.x,spot.z,false);assert.equal(s.state.near,null,'not while wading / riding');
 s.scan(.2,spot.x,spot.z,true);assert.equal(s.state.near?.id,spot.id);assert.equal(s.ready,true);
 assert.equal(s.start(),true);assert.equal(s.events.started,true);assert.equal(s.diving,true);assert.equal(s.state.phase,'diving');
 near(s.state.y,S.DIVE_START.y,1e-9,'starts under the surface');
 s.scan(.2,spot.x,spot.z,true);assert.equal(s.state.near,null,'no Dive prompt while under');
 for(let i=0;i<60;i++)s.step(1/30,{sx:0,sy:-1,lift:0});assert(s.state.z<S.DIVE_START.z-1,'the stick swims forward along the facing (toward the relic)');
 assert(s.state.y<D.DIVE_SURFACE_Y-D.DIVE_CEILING_GAP+1e-6&&s.state.y>D.diveFloor(s.state.x,s.state.z)+D.DIVE_FLOOR_GAP*.8-1e-6,'auto-level keeps clear of the sand and the surface');
 s.surface('tap');assert.equal(s.state.phase,'rising');let surfaced='';for(let i=0;i<40&&!surfaced;i++){s.step(1/30,{sx:0,sy:0,lift:0});surfaced=s.events.surfaced;}
 assert.equal(surfaced,'tap');assert.equal(s.diving,false);assert.equal(s.state.spot,null);
 // leave: a map trip or the island unmounting ends it at once
 s.scan(.2,spot.x,spot.z,true);s.start();s.surface('leave');assert.equal(s.events.surfaced,'leave');assert.equal(s.diving,false);
});

ok('breath: 45 s at an easy swim, 75 s gliding, 25 s pushing; a calm note at 20 %; at 0 a gentle float up (no harm); refills at the surface',()=>{
 assert.equal(S.BREATH_SECONDS,45);assert.deepEqual({...S.BREATH_DRAIN},{glide:.6,swim:1,push:1.8});assert.equal(S.BREATH_LOW,.2);
 const run=(input)=>{const s=S.createDiveSession();s.scan(.2,spot.x,spot.z,true);s.start();let t=0,low=-1;while(s.state.phase==='diving'&&t<200){s.step(.05,input);t+=.05;if(s.events.low&&low<0)low=t;}return {t,low,s};};
 const glide=run({sx:0,sy:0,lift:0}),swim=run({sx:0,sy:-.5,lift:0}),push=run({sx:0,sy:-1,lift:0});
 near(glide.t,75,.2,'gliding lasts 75 s');near(swim.t,45,.2,'an easy swim 45 s');near(push.t,25,.2,'pushing all the way 25 s');
 near(swim.low,45*.8,.2,'the low note at 20 %');
 assert.equal(push.s.state.phase,'rising','the breath running out floats you up');let ev='';for(let i=0;i<40&&!ev;i++){push.s.step(1/30,{sx:0,sy:0,lift:0});ev=push.s.events.surfaced;}assert.equal(ev,'breath');
 const s=push.s;assert(s.state.breath<.01);s.scan(.2,spot.x,spot.z,true);assert.equal(s.ready,false,'catch your breath first');assert.equal(s.start(),false);
 for(let t=0;t<S.BREATH_REFILL_S*S.BREATH_MIN_DIVE+.3;t+=.1)s.scan(.1,spot.x,spot.z,true);assert.equal(s.ready,true,'a quarter breath after ~1.5 s at the surface');
 for(let t=0;t<S.BREATH_REFILL_S;t+=.1)s.scan(.1,spot.x,spot.z,true);near(s.state.breath,1,1e-9,'full after 6 s');
 assert.equal(S.DIVE_LESSON.kind,'Coaching idea');assert.equal(S.DIVE_LESSON_KEY,'fi2-dive-lesson-v1');assert(/breath/i.test(S.DIVE_LESSON.title+S.DIVE_LESSON.text));
});

ok('each find is credited once (and once ever, by the save); the treasure is a metered `dive:` wallet run',()=>{
 let save=S.parseDiveFinds(null);const s=S.createDiveSession(D.DIVE_SPOTS,id=>save.spots[id]??[]);s.scan(.2,spot.x,spot.z,true);s.start();
 const treasure=spot.finds.find(f=>f.kind==='treasure'),p=D.diveFindPoint(treasure);
 s.state.x=p.x;s.state.y=p.y;s.state.z=p.z;s.step(1/30,{sx:0,sy:0,lift:0});assert.equal(s.state.find?.id,'treasure','in reach');
 let e=s.use();assert.equal(e.find,'treasure');assert.equal(e.firstFind,true);assert.equal(e.coins,3);save=S.addDiveFind(save,spot.id,'treasure');
 e=s.use();assert.equal(e.firstFind,false);assert.equal(e.coins,0,'not twice in one dive');
 const s2=S.createDiveSession(D.DIVE_SPOTS,id=>save.spots[id]??[]);s2.scan(.2,spot.x,spot.z,true);s2.start();s2.state.x=p.x;s2.state.y=p.y;s2.state.z=p.z;s2.step(1/30,{sx:0,sy:0,lift:0});
 e=s2.use();assert.equal(e.firstFind,false,'not again next dive');assert.equal(e.coins,0);
 // out of reach: nothing
 s2.state.x=p.x+5;s2.step(1/30,{sx:0,sy:0,lift:0});assert.equal(s2.use().find,'');
 assert.equal(JSON.stringify(S.parseDiveFinds({spots:{'pauls-grotto':['relic','relic','nope',3],'elsewhere':['x']}})),JSON.stringify({version:1,spots:{'pauls-grotto':['relic']}}),'the save is sanitised');
 const M=load('lib/town/dailyMeter.ts');const id=S.diveRunId(spot.id,'treasure');assert.equal(id,'dive:pauls-grotto:treasure');assert.equal(M.isTrainingRun(id,'island'),true,'metered by the Training meter');
});

ok('the room: rich but bounded — ≤ 30 draws, many coral pieces, 40–80 fish in ≥ 3 schools as INSTANCED draws with precomputed paths',()=>{
 const R=load('lib/graphics/diveRoom.ts');
 for(const phone of [false,true]){const room=R.createDiveRoom(spot,{phone,reduced:false,found:[]}),st=room.stats();
  assert(st.draws<=30,'draws '+st.draws);assert(st.fish>=40&&st.fish<=80,'fish '+st.fish);assert(st.triangles<(phone?80000:110000),'triangles '+st.triangles);
  const fish=[];room.scene.traverse(o=>{if(o.name.startsWith('dive-fish-'))fish.push(o);});
  const schools=fish.filter(m=>m.geometry.instanceCount>=6);assert(schools.length>=3,'≥ 3 schools');
  for(const m of fish){assert(m.geometry.isInstancedBufferGeometry,'instanced: '+m.name);for(const a of ['aPA','aPB','aPC','aPD'])assert(m.geometry.getAttribute(a)?.isInstancedBufferAttribute,'path attribute '+a);}
  // Precomputed: frames only move the time uniform; no per-fish attribute is ever rewritten.
  const before=fish.map(m=>m.geometry.getAttribute('aPA').version);for(let i=0;i<10;i++)room.frame(i/30,1/30,{x:0,y:6,z:3,yaw:Math.PI});
  assert.deepEqual(fish.map(m=>m.geometry.getAttribute('aPA').version),before);near(room.uTime.value,9/30,1e-9,'one uniform write per frame');
  assert(room.scene.fog&&room.scene.fog.isFog,'fog for depth');let lights=0,shadows=0;room.scene.traverse(o=>{if(o.isLight){lights++;assert(o.isHemisphereLight,'one hemisphere light');}if(o.castShadow||o.receiveShadow)shadows++;});
  assert.equal(lights,1);assert.equal(shadows,0,'no shadows');
  const names=[];room.scene.traverse(o=>names.push(o.name));for(const n of ['dive-reef','dive-sway','dive-rays','dive-surface','dive-bubbles','dive-clam-lid','dive-pearl','dive-coin','dive-fish-ray','dive-fish-grouper','dive-fish-burst'])assert(names.includes(n),n);
  room.dispose();}
 const src=read('lib/graphics/diveRoom.ts');assert(/dvPath/.test(src)&&/uDiveTime/.test(src),'paths evaluated in the vertex shader');assert(/const coralCount=phone\?100:120/.test(src),'many coral pieces');
 for(const kind of ['branching','brain','table','tube','finger'])assert(src.includes('// '+kind),'coral kind '+kind);
 assert(!/Matrix4\(\)\.compose|setMatrixAt/.test(src.slice(src.indexOf('frame(t:number'))),'no per-fish matrices in the frame');
});

ok('dispose leaves no meshes, materials, geometries or timers (the runtime with a fake renderer)',()=>{
 const RT=load('lib/town/water/diveRuntime.ts');
 const islandScene=new T.Scene(),root=new T.Group();islandScene.add(root);let renders=0;
 const ports={scene:islandScene,renderer:{render:()=>{renders++;}},camera:new T.PerspectiveCamera(50,390/844),player:{root,update:()=>{}},phone:true,reduced:()=>false,
  ui:()=>null,place:()=>{},hide:()=>{},entered:()=>{},surfaced:()=>{},found:()=>{},credit:()=>{},low:()=>{},out:()=>{}};
 let entered=0,surfaced='';ports.entered=()=>entered++;ports.surfaced=(_,r)=>{surfaced=r;};
 const rt=RT.createDiveRuntime(ports);rt.scan(.2,spot.x,spot.z,true);assert.equal(rt.start(),true);assert.equal(entered,1);
 const room=rt.room;assert(room&&root.parent===room.scene,'the rig dives into the room');
 const res=new Set();room.scene.traverse(o=>{if(o.geometry)res.add(o.geometry);const m=o.material;if(m)(Array.isArray(m)?m:[m]).forEach(x=>res.add(x));});
 let freed=0;for(const r of res)r.addEventListener('dispose',()=>freed++);
 for(let i=0;i<20;i++)rt.frame(1/30,{sx:0,sy:-1,lift:0},390,844);assert.equal(renders,20,'one room render per frame');
 rt.surface();for(let i=0;i<40&&rt.diving;i++)rt.frame(1/30,{sx:0,sy:0,lift:0},390,844);
 assert.equal(rt.diving,false);assert.equal(surfaced,'tap');assert.equal(rt.room,null);assert.equal(root.parent,islandScene,'the rig is back on the island');
 assert.equal(freed,res.size,`every room geometry and material disposed (${freed}/${res.size})`);assert.equal(room.scene.children.length,0,'the room scene is empty');assert.equal(room.disposed,true);
 // Unmount while diving: up at once, nothing left.
 rt.scan(.2,spot.x,spot.z,true);for(let t=0;t<7;t+=.1)rt.scan(.1,spot.x,spot.z,true);assert.equal(rt.start(),true);const r2=rt.room;rt.dispose();assert.equal(r2.disposed,true);assert.equal(root.parent,islandScene);assert.equal(surfaced,'leave');
 for(const f of ['lib/town/water/diveSpots.ts','lib/town/water/diveSession.ts','lib/town/water/diveRuntime.ts','lib/graphics/diveRoom.ts','lib/graphics/diveBuoys.ts'])
  assert(!/setTimeout|setInterval|requestAnimationFrame|WebGLRenderTarget|AudioContext|backdrop-filter/.test(read(f)),'no timers, loops, render targets or audio contexts: '+f);
});

ok('the surface cues: the ocean tint is a uniform in the existing shader (no second pass), written once; the buoy is one instanced draw that bobs in the shader',()=>{
 const WS=load('lib/graphics/waterSurface.ts');assert.equal(WS.WATER_UNIFORMS.uDiveSpots.value.length,D.DIVE_SLOTS);
 for(const v of WS.WATER_UNIFORMS.uDiveSpots.value)assert.equal(v.w,0,'off until set: zero cost (one compare per slot)');
 WS.setDiveSpots(D.DIVE_SPOTS);const v=WS.WATER_UNIFORMS.uDiveSpots.value[0];assert.deepEqual([v.x,v.y,v.z,v.w],[spot.x,spot.z,spot.radius,1]);
 assert.equal('#'+WS.WATER_UNIFORMS.uDiveTint.value[0].getHexString(),spot.tint);assert.equal(WS.WATER_UNIFORMS.uDiveSpots.value[1].w,0);
 const ws=read('lib/graphics/waterSurface.ts');assert(/uniform vec4 uDiveSpots\[\$\{DIVE_SLOTS\}\]/.test(ws)&&/for\(int i=0;i<\$\{DIVE_SLOTS\};i\+\+\)\{vec4 sp=uDiveSpots\[i\];if\(sp\.w>0\.\)/.test(ws),'one branch per slot in the ocean shader');
 assert(!/uDiveSpots/.test(ws.slice(ws.indexOf('export const SHORE_GLSL'),ws.indexOf('export const SHORE_LAND_LIFT'))),'ocean only, not the shore strips');
 const town=read('components/Town.tsx');assert.equal((town.match(/setDiveSpots\(/g)||[]).length,1,'set once at build');
 assert(!/setDiveSpots/.test(town.slice(town.indexOf('function animate('))),'never per frame');
 const B=load('lib/graphics/diveBuoys.ts'),b=B.createDiveBuoys(D.DIVE_SPOTS);assert(b.root.isInstancedMesh);assert.equal(b.root.count,D.DIVE_SPOTS.length);assert.equal(b.root.castShadow,false);assert.equal(b.root.receiveShadow,false);
 assert(b.triangles<400,'a tiny mesh: '+b.triangles);assert(/uWaterTime/.test(read('lib/graphics/diveBuoys.ts')),'bobs on the water clock (only while the island draws a frame)');
 b.near(spot.x+500,spot.z);assert.equal(b.root.visible,false,'hidden far away');b.near(spot.x,spot.z+30);assert.equal(b.root.visible,true);
 // red-and-white flag colours present
 const col=b.root.geometry.getAttribute('color');let red=0,white=0;for(let i=0;i<col.count;i++){const r=col.getX(i),g=col.getY(i),bb=col.getZ(i);if(r>.6&&g<.2&&bb<.2)red++;if(r>.85&&g>.85&&bb>.75)white++;}assert(red>0&&white>0,'a red-and-white dive flag');
 b.dispose();
});

ok('the HUD: Surface is the one icon-only action while diving (Space / Escape); the find prompt reuses the island prompt style',()=>{
 assert.equal(H.waterButtonsFor({inWater:true,swimming:true,flyOk:true,diving:true}),H.DIVING_BUTTONS);assert.equal(H.DIVE_SURFACE.id,'surface');assert.equal(H.DIVE_SURFACE.icon,'surface');
 assert.equal(H.DIVING_BUTTONS.filter(b=>b.slot!=='ride').length,1,'one action');
 assert(/WATER_IDS=new Set\(\[[^\]]*'surface'/.test(read('components/JobActionButton.tsx')),'icon-only');assert(/surface:'M12 21V7/.test(read('components/TravelIcon.tsx')));
 const town=read('components/Town.tsx');assert(/className="store-enter-prompt" data-dive-go=""/.test(town),'the floating prompt (the Hang on! button style)');
 assert(/dive\.key\(e,true,keys\)\)return;[^]*?if\(waterKey\(e,true\)\)return;/.test(town),'the dive keys run before the water keys');
 assert(/k==='escape'/.test(read('lib/town/water/diveRuntime.ts')),'Escape surfaces');
});

ok('Town wiring: the dive frame replaces the island frame, idles at 20 fps, disposes on unmount and on a map trip',()=>{
 const town=read('components/Town.tsx'),anim=town.slice(town.indexOf('function animate('));
 const dive=anim.indexOf('if(dive.diving){'),island=anim.indexOf('renderer.render(scene,camera)');assert(dive>0&&dive<island,'the dive branch returns before the island steps or renders');
 assert(/dive\.frame\(active\?dt:0/.test(anim),'menus hold the dive');assert(/const waterIdle=water\.resting\(\);[^\n]*idleRide\.interval\(now,rideRef\.current!=='walk'\|\|waterIdle\)/.test(anim)&&/resting\(\)\{return state\.phase==='swim'/.test(read('lib/town/water/waterState.ts')),'the 20 fps idle rule covers diving (the swim phase holds while under)');
 assert(/!waterIdleWas&&!dive\.diving\)countWaterIdleCap/.test(anim),'a dive is not counted as treading water');
 assert(/dive\.dispose\(\);diveBuoys\.dispose\(\);/.test(town),'disposed on unmount');assert(/if\(dive\.diving\)dive\.dispose\(\)/.test(town),'a map trip from under the water comes up at once');
 assert(/dive\.scan\(dt,location\.x,location\.z,water\.inWater&&water\.state\.phase==='swim'&&!animalRides\.riding\)/.test(town),'the 10 Hz patch test only while swimming');
 assert(/<SwimLessonToast blocked=\{toastBlocked\} which="dive"\/>/.test(town)&&/<DiveHud\/>/.test(town));
});

ok('analytics: wa:dive_start / dive_surface / dive_find / dive_breath_out / dive_lesson on the learning-counter channel, and a Dives tile',()=>{
 const C=load('lib/analytics/countIds.ts');for(const id of ['dive_start','dive_surface','dive_find','dive_breath_out','dive_lesson']){assert(C.WATER_COUNT_EVENTS.some(([e])=>e===id),id);assert.equal(C.isCountId('wa:'+id),true,id);}
 const ev=read('lib/analytics/waterEvents.ts');for(const id of ['dive_start','dive_surface','dive_find','dive_breath_out','dive_lesson'])assert(ev.includes(`'wa:${id}'`),id);
 const admin=read('app/admin/WaterSection.tsx');assert(/<span>Dives<\/span>/.test(admin)&&/wa:dive_start/.test(admin)&&/wa:dive_breath_out/.test(admin));
 assert(/countDiveLesson/.test(read('components/SwimLessonToast.tsx')));
});

ok('saves: the finds are a SYNC key (with its docs row), the lesson flag a DEVICE key',()=>{
 const SN=load('lib/saves/snapshot.ts');assert(SN.SYNC_KEYS.includes(S.DIVE_FINDS_KEY));assert.equal(S.DIVE_FINDS_KEY,'fi2-dive-finds-v1');
 assert(SN.DEVICE_KEYS.includes(S.DIVE_LESSON_KEY));assert.equal(SN.isSyncKey(S.DIVE_LESSON_KEY),false);
 const doc=read('docs/accounts-design.md');assert(doc.includes('`fi2-dive-finds-v1`')&&doc.includes('`fi2-dive-lesson-v1`'));
});

if(failed){console.log(`\n${failed} failed`);process.exit(1);}console.log('\nwater-dive: all passed');
