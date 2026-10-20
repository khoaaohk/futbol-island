// Diving spots (water P2, Oct 16 2026; user: "For the diving spots, have some type of marker on the top of the water, and also the
// water spot for the diving area should also be a different shade … build one to test first"; lib/town/water/diveSpots.ts,
// diveSession.ts, diveRuntime.ts, lib/graphics/diveRoom.ts, diveBuoys.ts; docs/swimming-research.md "P2 implemented: one spot"):
// the spot data and its verified fact, the prompt range, swim → dive → surface, breath timing, each find credited once, the room's
// budget and that dispose leaves nothing, analytics ids, the save keys, the ocean tint (zero cost at rest), precomputed fish paths.
// Oct 20 2026: seven themed zones (blob patches, two depth levels, wrecks on the biggest), 3D up / down, jetpack take-off in a zone.
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
const spot=D.diveSpotById('pauls-grotto'),Z=D.DIVE_SPOTS;
const L=load('lib/town/landmass.ts'),F=load('lib/town/fishing/fishCatalog.ts'),ZIP=load('lib/town/zipline.ts'),SIM=load('lib/town/simulation.ts');

ok('seven data-driven zones (the user’s map circles), each a unique theme id, name, reef variant and blob; the three biggest carry wrecks',()=>{
 assert.equal(Z.length,7);assert.equal(Z.map(s=>s.area).sort().join(),'1,2,3,4,5,6,7');
 for(const k of ['id','name','blob'])assert.equal(new Set(Z.map(s=>s[k])).size,7,'unique '+k);
 assert.equal(new Set(Z.map(s=>s.theme.id)).size,7,'unique theme ids');assert.equal(new Set(Z.map(s=>s.theme.signature)).size,7,'a different signature landmark / creature each');
 assert.equal(new Set(Z.map(s=>s.theme.water)).size,7,'a different water tint each');assert.equal(new Set(Z.map(s=>s.floor.kind+s.floor.edge+s.floor.deep)).size,7,'a different depth profile each');
 assert.equal(new Set(Z.map(s=>s.finds.find(f=>f.kind==='relic').title)).size,7,'a unique football find each');
 const wrecks=Z.filter(s=>s.theme.wreck),sizes=Z.map(s=>s.radius).sort((a,b)=>b-a);
 assert.equal(wrecks.length,3);for(const w of wrecks)assert(w.radius>=sizes[2],'wrecks only on the biggest zones: '+w.id);
 for(const s of Z.filter(s=>!s.theme.wreck))assert(s.radius<Math.min(...wrecks.map(w=>w.radius)),'clearly bigger blobs for wrecks');
 assert.equal(new Set(wrecks.map(w=>w.theme.wreck.style)).size,3,'each wreck its own hull style');assert.equal(new Set(wrecks.map(w=>w.theme.wreck.yaw)).size,3,'and orientation');
 for(const w of wrecks){const r=w.finds.find(f=>f.kind==='relic');assert.equal(D.diveLevelAt(r.x,r.z,w.floor),1,'the wreck’s cargo find is on the deep level: '+w.id);assert.equal(D.diveLevelAt(w.theme.wreck.x,w.theme.wreck.z,w.floor),1,'the wreck lies deep');}
 const ECON=load('lib/economy.ts');
 for(const s of Z){assert(s.radius>=12,'bigger patches (were 9 m)');const c=new T.Color(s.tint),hsl={};c.getHSL(hsl,T.SRGBColorSpace);assert(hsl.l>.55&&hsl.h>.42&&hsl.h<.6,'lighter turquoise '+s.id);
  assert(D.inDiveBlob(s,s.surface.x,s.surface.z),'you come up inside the patch');
  for(const f of s.finds)assert(Math.hypot(f.x,f.z)<D.DIVE_ROOM_R-2,'finds inside the room '+s.id+' '+f.id);
  assert.equal(JSON.stringify(s.finds.map(f=>f.kind).sort()),JSON.stringify(['burst','clam','relic','treasure']));
  for(const f of s.finds){assert(['Real football fact','Coaching idea','Island story'].includes(f.label));for(const t of [f.title,f.text,f.credit??'',f.story??'',f.prompt,f.aria])assert(!/https?:|www\.|\.com/.test(t),'no links: '+t);if(f.label==='Real football fact')assert(/^Wikipedia/.test(f.credit),'a plain-text credit');}
  for(const f of s.finds)assert((f.coins??0)<=ECON.LEARN_COINS.ball);}
 const paul=spot.finds.find(f=>f.kind==='relic');assert(read('lib/town/fishing/fishCatalog.ts').includes(paul.text),'Paul’s fact is the catalogue’s verified sentence');
});

ok('the blob outline: an irregular noise-perturbed outline (not a circle), containment matches the outline, the shader uses the same formula',()=>{
 for(const s of Z){let lo=Infinity,hi=0;for(let a=0;a<72;a++){const t=a/72*Math.PI*2,r=D.diveBlobR(s,t);lo=Math.min(lo,r);hi=Math.max(hi,r);
   assert(D.inDiveBlob(s,s.x+Math.cos(t)*r*.98,s.z+Math.sin(t)*r*.98),'just inside the outline');assert(!D.inDiveBlob(s,s.x+Math.cos(t)*r*1.02,s.z+Math.sin(t)*r*1.02),'just outside');}
  assert(hi/lo>1.25,'irregular, not a circle: '+s.id+' '+(hi/lo).toFixed(2));assert(hi<=s.radius*D.DIVE_BLOB_MAX,'inside the quick-reject reach');}
 assert.equal(D.diveSpotAt(spot.x,spot.z)?.id,spot.id);assert.equal(D.diveSpotAt(spot.x+spot.radius*D.DIVE_BLOB_MAX+.1,spot.z),null);
 const ws=read('lib/graphics/waterSurface.ts');assert(ws.includes('b.x*sin(2.*a+b.w)+b.y*sin(3.*a+1.7*b.w+1.)+b.z*sin(5.*a+2.3*b.w+2.)'),'the shader blob = diveBlobR');
 assert(read('lib/town/water/diveSpots.ts').includes('a2*Math.sin(2*angle+p)+a3*Math.sin(3*angle+1.7*p+1)+a5*Math.sin(5*angle+2.3*p+2)'));
});

ok('placement: every zone is open sea (no land, jetty or deck in the blob), clear of fishing floats / stands and the zipline, in the flight bounds; swimmable inside the blob',()=>{
 const zt=ZIP.ZIP_ANCHOR_TOWER,zr=ZIP.ZIP_ANCHOR_ROOF,segD=(x,z)=>{const dx=zr.x-zt.x,dz=zr.z-zt.z,t=Math.max(0,Math.min(1,((x-zt.x)*dx+(z-zt.z)*dz)/(dx*dx+dz*dz)));return Math.hypot(x-zt.x-dx*t,z-zt.z-dz*t);};
 const B=SIM.FLIGHT_BOUNDS;
 for(const s of Z){const reach=s.radius*D.DIVE_BLOB_MAX;assert(!L.onLand(s.x,s.z),'centre in water '+s.id);
  for(let a=0;a<48;a++)for(const k of [.33,.66,1,1.15]){const t=a/48*Math.PI*2,r=D.diveBlobR(s,t)*k;assert(!L.onLand(s.x+Math.cos(t)*r,s.z+Math.sin(t)*r),'no land / jetty / deck in or by the blob: '+s.id);}
  for(const f of F.FISH_SPOTS){assert(Math.hypot(f.buoy.x-s.x,f.buoy.z-s.z)>reach+10,'clear of the fishing float '+f.id+' / '+s.id);assert(Math.hypot(f.x-s.x,f.z-s.z)>reach+8,'clear of the stand / boat '+f.id+' / '+s.id);}
  assert(segD(s.x,s.z)>reach+10,'clear of the zipline line '+s.id);
  assert(s.x-reach>B.minX&&s.x+reach<B.maxX&&s.z-reach>B.minZ&&s.z+reach<B.maxZ,'inside the flyable world '+s.id);
  assert(W.waterDepthAt(s.x,s.z)>=W.ZONE_SWIM+W.WADE_HYSTERESIS,'swimming depth '+s.id);
  const p=W.createWaterProbe();p.sample(s.x,s.z,1,true);assert(p.allowed(s.x+1,s.z+1),'swimmable inside the blob (a Drop in reaches far zones): '+s.id);}
});

ok('the Dive prompt range: inside the blob, swimming only, at the probe rate (10 Hz); the ocean slots take the nearest zones',()=>{
 assert.equal(D.DIVE_PROMPT,'Dive');assert.equal(S.DIVE_TICK,1/W.WATER_PROBE_HZ);
 const s=S.createDiveSession();assert.equal(s.scan(.01,spot.x,spot.z,true)?.id,spot.id,'the first scan is immediate');
 assert.equal(s.scan(.05,spot.x+40,spot.z,true)?.id,spot.id,'between ticks the last answer stands');assert.equal(s.scan(.06,spot.x+40,spot.z,true),null);
 s.scan(.2,spot.x,spot.z,true);assert.equal(s.scan(.01,spot.x,spot.z,false),null,'only while swimming');
 const out=[];D.nearestDiveSpots(spot.x,spot.z,out);assert.equal(out.length,D.DIVE_SLOTS);assert.equal(out[0].id,spot.id);
 const WS=load('lib/graphics/waterSurface.ts');WS.setDiveSpots(out);const v=WS.WATER_UNIFORMS.uDiveSpots.value[0];assert.deepEqual([v.x,v.y,v.z,v.w],[spot.x,spot.z,spot.radius,1]);
 const bp=WS.WATER_UNIFORMS.uDiveBlob.value[0].toArray();D.diveBlobParams(spot.blob).forEach((x,i)=>near(bp[i],x,1e-9,'blob param'));
});

ok('two depth levels: the shelf and the deep level; up / down is clamped per level (over that level’s sand, under the surface)',()=>{
 for(const z of Z){const f=z.floor;assert.equal(D.diveLevelAt(0,13,f),0,'the start is over the shelf '+z.id);
  let deepPts=0;for(let x=-20;x<=20;x+=2)for(let zz=-20;zz<=20;zz+=2)if(Math.hypot(x,zz)<D.DIVE_ROOM_R-3&&D.diveLevelAt(x,zz,f)===1){deepPts++;assert(D.diveFloor(x,zz,f)<D.diveFloor(0,13,f)-f.deep*.4,'the deep level is lower');}
  assert(deepPts>15,'a real deep level '+z.id);}
 assert(D.DIVE_ROOM_R>=24,'a larger room (was 15 m)');
 const zone=D.diveSpotById('captains-cup'),s=S.createDiveSession();s.scan(.2,zone.x,zone.z,true);assert(s.start());
 for(let i=0;i<200;i++)s.step(1/30,{sx:0,sy:0,lift:-1});const shelfMin=D.diveDepthRange(s.state.x,s.state.z,zone.floor).min;
 near(s.state.y,shelfMin,.05,'clamped at the shelf floor');assert.equal(s.state.level,0);
 for(let i=0;i<300;i++)s.step(1/30,{sx:0,sy:0,lift:1});near(s.state.y,D.DIVE_SURFACE_Y-D.DIVE_CEILING_GAP,.02,'clamped under the surface');
 s.state.x=-6;s.state.z=-14;s.state.vx=s.state.vz=0;assert.equal(D.diveLevelAt(-6,-14,zone.floor),1);for(let i=0;i<500;i++)s.step(1/30,{sx:0,sy:0,lift:-1});
 near(s.state.y,D.diveDepthRange(-6,-14,zone.floor).min,.05,'clamped at the deep floor');assert(s.state.y<shelfMin-4,'deeper than the shelf allows');assert.equal(s.state.level,1);
 const y=s.state.y+2;s.state.y=y;s.state.vy=0;s.state.breath=1;for(let i=0;i<60;i++)s.step(1/30,{sx:0,sy:0,lift:0});near(s.state.y,y,.01,'holds its depth');
 const rt=read('lib/town/water/diveRuntime.ts');assert(rt.includes("(diveLift.up?1:0)-(diveLift.down?1:0)"),'the phone ▲ ▼ feed the same lift');assert(rt.includes("k==='q'||k==='z'"),'Q / Z on desktop (the room’s keys run first)');
 const hud=read('components/DiveHud.tsx');assert(hud.includes('data-dive-depth={dir}')&&hud.includes('onPointerDown={hold(dir,true)}'),'held ▲ ▼');assert(!/<small>|<span>/.test(hud.slice(hud.indexOf('const depthBtn'),hud.indexOf('return <>'))),'icon-only');
});

ok('swim → dive → surface, and the deep level is counted once per dive',()=>{
 const s=S.createDiveSession();assert.equal(s.start(),false,'not in a patch');
 s.scan(.2,spot.x,spot.z,true);assert.equal(s.start(),true);assert.equal(s.state.phase,'diving');near(s.state.y,S.DIVE_START.y,1e-9,'starts under the surface');
 for(let i=0;i<60;i++)s.step(1/30,{sx:0,sy:-1,lift:0});assert(s.state.z<S.DIVE_START.z-1,'the stick swims forward');
 s.surface('tap');assert.equal(s.state.phase,'rising');let surfaced='';for(let i=0;i<40&&!surfaced;i++){s.step(1/30,{sx:0,sy:0,lift:0});surfaced=s.events.surfaced;}assert.equal(surfaced,'tap');
 s.scan(.2,spot.x,spot.z,true);for(let t=0;t<7;t+=.1)s.scan(.1,spot.x,spot.z,true);s.start();s.surface('leave');assert.equal(s.events.surfaced,'leave');assert.equal(s.diving,false);
 const z=D.diveSpotById('kelp-trawler'),s2=S.createDiveSession();s2.scan(.2,z.x,z.z,true);s2.start();s2.state.x=3;s2.state.z=-7;let deep=0;for(let i=0;i<400;i++){s2.step(1/30,{sx:0,sy:0,lift:-1});if(s2.events.deep)deep++;}assert.equal(deep,1,'wa:dive_deep once');
});

ok('breath: the pace lesson (glide > swim > push) and it respects depth (deeper drains faster); a gentle float up at 0; refills at the surface',()=>{
 assert.equal(S.BREATH_SECONDS,45);assert.deepEqual({...S.BREATH_DRAIN},{glide:.6,swim:1,push:1.8});assert(S.DIVE_DEPTH_DRAIN>0);
 const run=(input,setup)=>{const s=S.createDiveSession();s.scan(.2,spot.x,spot.z,true);s.start();if(setup)setup(s);let t=0;while(s.state.phase==='diving'&&t<300){s.step(.05,input);t+=.05;}return {t,s};};
 const glide=run({sx:0,sy:0,lift:0}),swim=run({sx:0,sy:-.5,lift:0}),push=run({sx:0,sy:-1,lift:0});
 assert(glide.t>swim.t&&swim.t>push.t,'pace: '+[glide.t,swim.t,push.t].map(x=>x.toFixed(1)));assert(glide.t>55&&glide.t<76&&push.t>15&&push.t<26,'times '+[glide.t,push.t]);
 const shallow=run({sx:0,sy:0,lift:0},s=>{s.state.y=D.DIVE_SURFACE_Y-1;}),deep=run({sx:0,sy:0,lift:0},s=>{s.state.x=0;s.state.z=-9;s.state.y=D.diveDepthRange(0,-9,spot.floor).min;});
 assert(deep.t<shallow.t*.85,'deeper drains faster: '+deep.t.toFixed(1)+' vs '+shallow.t.toFixed(1));
 assert.equal(push.s.state.phase,'rising');let ev='';for(let i=0;i<40&&!ev;i++){push.s.step(1/30,{sx:0,sy:0,lift:0});ev=push.s.events.surfaced;}assert.equal(ev,'breath');
 const s=push.s;s.scan(.2,spot.x,spot.z,true);assert.equal(s.ready,false);for(let t=0;t<S.BREATH_REFILL_S+.3;t+=.1)s.scan(.1,spot.x,spot.z,true);near(s.state.breath,1,1e-9,'full after 6 s');
 assert.equal(S.DIVE_LESSON.kind,'Coaching idea');assert.equal(S.DIVE_LESSON_KEY,'fi2-dive-lesson-v1');
});

ok('each find is credited once (and once ever, by the save); the treasure is a metered `dive:` wallet run',()=>{
 let save=S.parseDiveFinds(null);const s=S.createDiveSession(D.DIVE_SPOTS,id=>save.spots[id]??[]);s.scan(.2,spot.x,spot.z,true);s.start();
 const treasure=spot.finds.find(f=>f.kind==='treasure'),p=D.diveFindPoint(treasure,undefined,spot.floor);
 s.state.x=p.x;s.state.y=p.y;s.state.z=p.z;s.step(1/30,{sx:0,sy:0,lift:0});assert.equal(s.state.find?.id,'treasure','in reach');
 let e=s.use();assert.equal(e.firstFind,true);assert.equal(e.coins,3);save=S.addDiveFind(save,spot.id,'treasure');e=s.use();assert.equal(e.coins,0,'not twice');
 assert.equal(JSON.stringify(S.parseDiveFinds({spots:{'pauls-grotto':['relic','relic','nope',3],'elsewhere':['x']}})),JSON.stringify({version:1,spots:{'pauls-grotto':['relic']}}),'the save is sanitised');
 const M=load('lib/town/dailyMeter.ts');assert.equal(M.isTrainingRun(S.diveRunId(spot.id,'treasure'),'island'),true,'metered by the Training meter');
});

ok('every zone’s room: rich but bounded by the same caps (draws, triangles, fish), instanced fish with precomputed paths; lite is lighter; cost flat across zones',()=>{
 const R=load('lib/graphics/diveRoom.ts');const tris=[];
 for(const z of Z)for(const phone of [false,true]){const room=R.createDiveRoom(z,{phone,reduced:false,found:[]}),st=room.stats();
  assert(st.draws<=30,'draws '+st.draws+' '+z.id);assert(st.fish>=8&&st.fish<=R.DIVE_CAPS.fish,'fish '+st.fish+' '+z.id);assert(st.triangles<(phone?80000:110000),'triangles '+st.triangles+' '+z.id);if(phone)tris.push(z.id+':'+st.draws+'/'+st.triangles);
  const fish=[];room.scene.traverse(o=>{if(o.name.startsWith('dive-fish-'))fish.push(o);});
  for(const m of fish)assert(m.geometry.isInstancedBufferGeometry,'instanced: '+m.name);
  const before=fish.map(m=>m.geometry.getAttribute('aPA').version);for(let i=0;i<5;i++)room.frame(i/30,1/30,{x:0,y:6,z:13,yaw:Math.PI});assert.deepEqual(fish.map(m=>m.geometry.getAttribute('aPA').version),before);
  let lights=0;room.scene.traverse(o=>{if(o.isLight)lights++;});assert.equal(lights,1);
  const lite=R.createDiveRoom(z,{phone,reduced:false,found:[],lite:true});assert(lite.stats().triangles<st.triangles,'lite (heat tier 2+ / Battery saver) is lighter '+z.id);lite.dispose();
  room.dispose();}
 const t=tris.map(x=>+x.split('/')[1]);assert(Math.max(...t)/Math.min(...t)<2.4&&Math.max(...t)<80000,'cost bounded the same way in every zone (the caps): '+tris.join(' '));console.log('     phone rooms (draws/triangles): '+tris.join(' '));
 const src=read('lib/graphics/diveRoom.ts');for(const kind of ['galleon','trawler','cargo','trophy','kitbag','balls'])assert(src.includes(kind),kind);assert(!/skeleton|skull/i.test(src),'kid-friendly wrecks');
});

ok('dispose leaves no meshes, materials, geometries or timers (the runtime with a fake renderer)',()=>{
 const RT=load('lib/town/water/diveRuntime.ts');
 const islandScene=new T.Scene(),root=new T.Group();islandScene.add(root);let renders=0;
 const ports={scene:islandScene,renderer:{render:()=>{renders++;}},camera:new T.PerspectiveCamera(50,390/844),player:{root,update:()=>{}},phone:true,reduced:()=>false,
  ui:()=>null,place:()=>{},hide:()=>{},entered:()=>{},surfaced:()=>{},found:()=>{},credit:()=>{},low:()=>{},out:()=>{},fly:()=>false};
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

ok('jetpack takeoff in the zone: R and the switcher fly up from under the water (fuel allowing); the dive keys never swallow R',()=>{
 const RT=load('lib/town/water/diveRuntime.ts');const islandScene=new T.Scene(),root=new T.Group();islandScene.add(root);let flew=0,surfaced='',rt=null;
 const ports={scene:islandScene,renderer:{render:()=>{}},camera:new T.PerspectiveCamera(50,1),player:{root,update:()=>{}},phone:true,reduced:()=>false,ui:()=>null,place:()=>{},hide:()=>{},entered:()=>{},surfaced:(_,r)=>{surfaced=r;},found:()=>{},credit:()=>{},low:()=>{},out:()=>{},fly:()=>{flew++;return rt.exitForFlight();}};
 rt=RT.createDiveRuntime(ports);rt.scan(.2,spot.x,spot.z,true);assert(rt.start());
 const key=(k)=>({key:k,code:'Key'+k.toUpperCase(),repeat:false,preventDefault(){}});
 assert.equal(rt.key(key('r'),true,new Set()),true,'R is handled by the dive: it asks for the jetpack');assert.equal(flew,1);
 assert.equal(rt.diving,false,'out of the room at once');assert.equal(surfaced,'fly');assert.equal(root.parent,islandScene,'the rig is back on the island');
 assert.equal(rt.key(key('r'),true,new Set()),false,'at the surface R is the island’s again');
 const town=read('components/Town.tsx');
 assert(town.includes("const flyFromReef=()=>{if(!dive.diving||!water.inWater||rideRef.current!=='walk'||!fuelStore.canUse('jetpack'))return false;if(!dive.exitForFlight())return false;if(flyUp()){countDiveFly();return true;}"),'fuel-gated, then the normal fly-up');
 assert(town.includes("else if(id==='swimride'){if(flyFromReef())"),'the switcher in the room flies');assert(town.includes('fly:()=>flyFromReef()'),'R in the room flies');
 assert.equal(H.waterButtonsFor({inWater:true,swimming:true,flyOk:true,reef:true}),H.REEF_BUTTONS_FLY);assert.equal(H.REEF_BUTTONS_FLY.find(b=>b.slot==='ride').enabled,true,'the switcher is live in the zone');
 assert.equal(H.waterButtonsFor({inWater:true,swimming:true,flyOk:false,reef:true}),H.REEF_BUTTONS);assert.equal(H.DIVE_SURFACE.id,'surface');
 assert(/WATER_IDS=new Set\(\[[^\]]*'surface'/.test(read('components/JobActionButton.tsx')),'icon-only');
});

ok('Town wiring: the dive frame replaces the island frame, disposes on unmount and on a map trip; the slots follow the player on the HUD tick',()=>{
 const town=read('components/Town.tsx'),anim=town.slice(town.indexOf('function animate('));
 const dive=anim.indexOf('if(dive.diving){'),island=anim.indexOf('renderer.render(scene,camera)');assert(dive>0&&dive<island,'the dive branch returns before the island steps or renders');
 assert(/dive\.frame\(active\?dt:0/.test(anim),'menus hold the dive');assert(/!waterIdleWas&&!dive\.diving\)countWaterIdleCap/.test(anim));
 assert(/dive\.dispose\(\);diveBuoys\.dispose\(\);/.test(town));assert(/if\(dive\.diving\)dive\.dispose\(\)/.test(town));
 assert(town.includes('diveBuoys.near(location.x,location.z);dive.slots(location.x,location.z);'),'nearest zones into the shader slots on the HUD tick');
 assert(/<DiveHud\/>/.test(town));
});

ok('analytics: wa:dive_* ids kept, new ones (deep, fly, wreck visit / find) registered and on the admin tile (no migration: TS registry)',()=>{
 const C=load('lib/analytics/countIds.ts'),ev=read('lib/analytics/waterEvents.ts'),admin=read('app/admin/WaterSection.tsx');
 for(const id of ['dive_start','dive_surface','dive_find','dive_breath_out','dive_lesson','dive_deep','dive_fly','dive_wreck_visit','dive_wreck_find']){assert(C.WATER_COUNT_EVENTS.some(([e])=>e===id),id);assert.equal(C.isCountId('wa:'+id),true,id);assert(ev.includes(`'wa:${id}'`),id);assert(admin.includes(`'wa:${id}'`),'admin '+id);}
});

ok('saves: the finds are a SYNC key (with its docs row), the lesson flag a DEVICE key',()=>{
 const SN=load('lib/saves/snapshot.ts');assert(SN.SYNC_KEYS.includes(S.DIVE_FINDS_KEY));assert.equal(S.DIVE_FINDS_KEY,'fi2-dive-finds-v1');
 assert(SN.DEVICE_KEYS.includes(S.DIVE_LESSON_KEY));assert.equal(SN.isSyncKey(S.DIVE_LESSON_KEY),false);
 const doc=read('docs/accounts-design.md');assert(doc.includes('`fi2-dive-finds-v1`')&&doc.includes('`fi2-dive-lesson-v1`'));
});

if(failed){console.log(`\n${failed} failed`);process.exit(1);}console.log('\nwater-dive: all passed');
