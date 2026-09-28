// Manhole balls: one football cover at every road junction, opened only by flying over it and dropping onto it.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),T=req('three');
(async()=>{
const utils=await import(base+'/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js');
function fixture(initial={}){
 const cache=new Map(),storage=new Map(Object.entries(initial)),gradient={addColorStop(){}};
 const ctx=new Proxy({measureText:t=>({width:t.length*20}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(o,k)=>o[k]??(()=>{})});
 const context=vm.createContext({console,Math,Set,Map,performance,Float32Array,Uint8Array,window:{addEventListener(){},removeEventListener(){},matchMedia:()=>({matches:false})},localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)},document:{createElement:()=>({width:0,height:0,getContext:()=>ctx})}});
 function load(name){const file=path.resolve(base,name);if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,id=>id==='react'?{useSyncExternalStore:(_s,get)=>get()}:id==='three'?T:id.includes('BufferGeometryUtils')?utils:id.endsWith('.json')?require(path.resolve(path.dirname(file),id)):id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):req(id));return mod.exports;}
 return {load,storage};
}
function hunt(initial){
 const f=fixture(initial),q=f.load('lib/town/coinQuest.ts'),p=f.load('lib/town/coinProgress.ts'),{createCoinHunt}=f.load('lib/graphics/coinHunt.ts');
 const collected=[],finished=[],props=[],obstacles=[],scene=new T.Scene(),h=createCoinHunt(scene,s=>collected.push(s.id),()=>{},s=>finished.push(s.id));h.connectCollisions(obstacles,props);
 return {...f,q,p,h,scene,collected,finished,props,obstacles};
}

// 1. A cover at every junction the town actually builds, and nowhere else.
const world=fixture().load('lib/town/world.ts').buildTown(new T.Scene());
const {COIN_QUEST,MANHOLE_RADIUS,COIN_STORAGE_KEY,sanitizeCoinProgress,allCostumesEarned,coinRewardEarned}=fixture().load('lib/town/coinQuest.ts');
const manholes=COIN_QUEST.filter(s=>s.manhole),others=COIN_QUEST.filter(s=>!s.manhole);
assert(world.roadJunctions.length>=20,'town has its junctions');
assert.equal(manholes.length,world.roadJunctions.length,'one manhole per junction');
for(const j of world.roadJunctions){const here=manholes.filter(s=>Math.abs(s.x-j.x)<.01&&Math.abs(s.z-j.z)<.01);assert.equal(here.length,1,`junction ${j.x},${j.z} has one cover`);}
for(const s of manholes){
 assert.equal(s.kind,'landing');assert.equal(s.y,0);assert(!s.wall&&!s.grass&&!s.parachute&&!s.ramp&&s.truck===undefined);
 assert(/fly/i.test(s.detail)&&/drop/i.test(s.detail),'clue explains fly-over and drop');
 for(const o of others.filter(o=>o.truck===undefined))assert(Math.hypot(o.x-s.x,o.z-s.z)>3,`${s.id} stays clear of ${o.id}`);
 const clear=world.roads.some(r=>Math.abs(s.x-r.x)<=r.w/2&&Math.abs(s.z-r.z)<=r.d/2);assert(clear,`${s.id} sits on the road`);
}
assert.equal(others.length,55,'the original fifty-five stay in place');assert.equal(COIN_QUEST.length,55+world.roadJunctions.length);
assert(COIN_QUEST.slice(0,55).every(s=>!s.manhole),'new balls are appended after the originals');
console.log(`PASS ${manholes.length} manhole balls, one at the centre of each road junction; total ${COIN_QUEST.length}`);

// 2. One instanced mesh per layer, shared material, receive-only shadows, no collision props.
{
 const t=hunt(),root=t.h.covers.root,instanced=[];root.traverse(o=>{if(o.isInstancedMesh)instanced.push(o);});
 assert.equal(instanced.length,3,'rims, covers and glints are three instanced draws');
 for(const mesh of instanced){assert.equal(mesh.count,manholes.length);assert.equal(mesh.castShadow,false);assert(!Array.isArray(mesh.material));}
 const cover=root.getObjectByName('manhole-cover-instances');assert(cover.receiveShadow&&cover.material.map&&cover.material.bumpMap,'baked shared texture and bump');assert(cover.material.polygonOffset,'cover avoids road z-fighting');
 assert.equal(root.getObjectByName('manhole-glints').visible,false,'glints start hidden');assert(root.parent===t.scene&&root.parent!==t.h.root,'street covers stay out of the pausable hunt root');
 for(const s of manholes){assert(!t.props.some(c=>c.x===s.x&&c.z===s.z),'flush cover is not a prop');assert(!t.obstacles.some(c=>c.x===s.x&&c.z===s.z),'traffic is not blocked');}
 let meshes=0;t.h.root.traverse(o=>{if(o.isMesh)meshes++;});assert(meshes<COIN_QUEST.length*3+5);t.h.dispose();
}
console.log('PASS instanced covers: three draws, shared baked texture, receive-only shadows, no traffic or landing props');

// 3. Forgiving covers (user, Sep 26 2026): walking or riding onto a cover opens it; ramp air, kicks and blind far landings do not.
{
 const t=hunt(),s=manholes[0],id=s.id;
 for(let i=0;i<30;i++)t.h.update(1/30,{x:s.x-3+i*.2,y:0,z:s.z},true,true,null,false,false);
 assert(t.p.readCoinProgress().revealed.includes(id),'walking onto the cover opens it');t.h.dispose();
 const r=hunt(),m=manholes[1];r.h.update(.1,{x:m.x+.5,y:1.5,z:m.z},true,true,'roof-ramp-finale',false,false);r.h.land({x:m.x,y:0,z:m.z});assert(!r.p.readCoinProgress().revealed.includes(m.id),'ramp air is not flight, and a ramp touchdown does not open it');
 r.h.land({x:m.x,y:0,z:m.z},true);assert(!r.p.readCoinProgress().revealed.includes(m.id),'a flight that never passed over the cover does nothing');
 assert(!r.h.hit(m.x,.3,m.z,0,-9),'kicks cannot open a manhole');assert.equal(r.collected.length,0);r.h.dispose();
}
console.log('PASS walking or riding onto a cover opens it; ramp air, kicks and unarmed flight landings do not');

// 4. Fly over, drop within the radius: cover opens once with a short tween and the ball uses the normal collection path.
{
 const t=hunt(),s=manholes[3],id=s.id;
 t.h.update(.05,{x:s.x+8,y:25,z:s.z},true,false,null,false,true);
 t.h.update(.05,{x:s.x+1,y:25,z:s.z},true,false,null,false,true);
 t.h.land({x:s.x+3.9,y:0,z:s.z},true);assert(!t.p.readCoinProgress().revealed.includes(id),'landing beyond 3.5 m misses');
 t.h.update(.05,{x:s.x,y:12,z:s.z+.5},true,false,null,false,true);
 t.h.land({x:s.x+2.4,y:0,z:s.z+2},true);assert(t.p.readCoinProgress().revealed.includes(id),'a drop anywhere within 3.5 m opens the cover');
 const i=manholes.indexOf(s);assert(t.h.covers.tweening&&!t.h.covers.isOpen(i),'short opening tween starts');
 t.h.land({x:s.x,y:0,z:s.z},true);assert.equal(t.h.stats.reveals,1,'no double open');
 for(let k=0;k<50;k++)t.h.update(1/30,{x:s.x+.8,y:0,z:s.z+.6},true,false,null,false,false);
 assert(t.h.covers.isOpen(i)&&t.h.covers.isPlain(i)&&t.h.covers.offset(i)<.01&&!t.h.covers.tweening,'collected → plain design, cover back in its rim, not tweening');
 assert.deepEqual([...t.collected],[id],'ball pops up and is collected by the shared ball-hunt path');assert(t.p.readCoinProgress().collected.includes(id));
 const writes=t.h.covers.stats.writes;for(let k=0;k<60;k++)t.h.update(1/30,{x:s.x+30,y:0,z:s.z},true,false,null,false,false);assert.equal(t.h.covers.stats.writes,writes,'no per-frame cover uploads once settled');
 for(let k=0;k<60;k++)t.h.update(1/30,{x:s.x+30,y:0,z:s.z},true,false,null,false,false);assert.deepEqual([...t.finished],[id],'lesson handoff once after effects settle');
 t.h.dispose();
 // Parachute descents count as flight too; reduced motion opens instantly.
 const r=hunt(),m=manholes[5];r.h.update(.05,{x:m.x,y:9,z:m.z},true,true,null,true);r.h.land({x:m.x,y:0,z:m.z},true);assert(r.h.covers.isOpen(manholes.indexOf(m)),'reduced motion: instant open');r.h.dispose();
}
console.log('PASS fly over + drop inside the radius opens once, tween ends, ball collected via the shared lesson/card path');

// 5. Glint: only unfound covers, only for a nearby flyer, and matrix writes only on state changes.
{
 const t=hunt(),s=manholes[7],i=manholes.indexOf(s),glints=t.h.covers.root.getObjectByName('manhole-glints');
 t.h.update(.05,{x:s.x+20,y:0,z:s.z},true,false,null,false,false);assert(!t.h.covers.glinting(i),'walkers see no glint');
 t.h.update(.05,{x:s.x+20,y:25,z:s.z},true,false,null,false,true);assert(!t.h.covers.glinting(i)&&!glints.visible,'no glint even for a nearby flyer (keeps the search a challenge)');
 const writes=t.h.covers.stats.writes;for(let k=0;k<30;k++)t.h.update(1/30,{x:s.x+20,y:25,z:s.z},true,false,null,false,true);assert.equal(t.h.covers.stats.writes,writes,'static glint: no per-frame writes');
 t.h.update(.05,{x:s.x+300,y:25,z:s.z},true,false,null,false,true);assert(!t.h.covers.glinting(i),'distant flyer sees no glint');
 t.h.update(.05,{x:s.x+20,y:25,z:s.z},true,false,null,false,true);t.h.update(.05,{x:s.x,y:25,z:s.z},false,false);assert(!glints.visible,'paused hunt hides glints');
 t.h.update(.05,{x:s.x,y:25,z:s.z},true,false,null,false,true);t.h.land({x:s.x,y:0,z:s.z},true);assert(!t.h.covers.glinting(i),'found covers stop glinting');
 t.h.update(.05,{x:s.x+10,y:25,z:s.z},true,false,null,false,true);assert(!t.h.covers.glinting(i));t.h.dispose();
}
console.log('PASS glints: flying + nearby + unfound only, static, hidden while paused');
// 5b. Landing target (user, Sep 25 2026): Town draws its red landing marker on a cover only while a flyer hovers right on top of it.
{const t=hunt(),s=manholes[9],over=()=>t.h.manholeTarget();
 t.h.update(.05,{x:s.x+6,y:0,z:s.z},true,false,null,false,false);assert.equal(over(),null,'no target while walking');
 t.h.update(.05,{x:s.x+5,y:20,z:s.z},true,false,null,false,true);assert.equal(over(),null,'no target for a nearby flyer (not overhead)');
 t.h.update(.05,{x:s.x+4.8,y:20,z:s.z},true,false,null,false,true);assert.equal(over(),null,'no target just outside the 4.5 m ring zone');
 t.h.update(.05,{x:s.x+.6,y:20,z:s.z-.4},true,false,null,false,true);assert.equal(JSON.stringify(over()),JSON.stringify({x:s.x,z:s.z}),'target on the cover when hovering overhead');
 assert(!t.h.covers.glinting(manholes.indexOf(s)),'still no glint');
 t.h.update(.05,{x:s.x+5.5,y:20,z:s.z},true,false,null,false,true);assert.ok(over(),'held while a released jetpack drifts (within 6 m)');
 t.h.update(.05,{x:s.x+9,y:20,z:s.z},true,false,null,false,true);assert.ok(over(),'lingers briefly after a fast fly-over');
 for(let k=0;k<20;k++)t.h.update(.05,{x:s.x+9,y:20,z:s.z},true,false,null,false,true);assert.equal(over(),null,'then lets go');
 t.h.update(.05,{x:s.x+2,y:20,z:s.z},true,false,null,false,true);assert.ok(over(),'back within 4.5 m');
 t.h.update(.05,{x:s.x,y:20,z:s.z},false,false);assert.equal(over(),null,'paused hunt: no target');
 t.h.update(.05,{x:s.x,y:20,z:s.z},true,false,null,false,true);t.h.land({x:s.x,y:0,z:s.z},true);t.h.update(.05,{x:s.x,y:20,z:s.z},true,false,null,false,true);assert.equal(over(),null,'opened covers get no target');
 t.h.dispose();}
{const town=fs.readFileSync(path.join(base,'components/Town.tsx'),'utf8'),marker=fs.readFileSync(path.join(base,'lib/graphics/landingMarker.ts'),'utf8');
 assert(!/emphasis/.test(marker)&&/landingMarker\.update\(landingPreview,flight\.height,rooftop\.surface,showLanding&&!overPickup,elapsed,reduced,showLanding&&!overPickup&&coinHunt\.manholeTarget\(\)\?3\.2:1\)/.test(town)&&/root\.scale\.setScalar\(\(reduced\?1:\.9\+pulse\*\.18\)\*size\)/.test(marker),'the manhole uses the standard landing ring, only scaled to sit around the rim');
 assert(!/manholeTilt|MANHOLE_LOOK/.test(town),'the view does not change over a manhole');
 assert(!/manholeTarget\(\)\?\?rooftop\.findLanding/.test(town)&&!/location\.x=cover\.x/.test(town),'no snap or steering onto the cover');}
console.log('PASS manhole landing ring: 4.5 m lock, holds within 6 m, lingers, gone once opened; standard ring, no view change, no snap');
// 5c. Collected covers stay as plain street covers (user, Sep 25 2026): reduced motion snaps there, a reload shows them plain.
{const r=hunt(),m=manholes[6],i=manholes.indexOf(m);
 r.h.update(.05,{x:m.x,y:9,z:m.z},true,true,null,false,true);r.h.land({x:m.x,y:0,z:m.z},true);assert(r.h.covers.isOpen(i)&&!r.h.covers.isPlain(i),'reduced motion: open at once, ball design until collected');
 r.h.update(.7,{x:m.x,y:0,z:m.z},true,true);assert(r.p.readCoinProgress().collected.includes(m.id)&&r.h.covers.isPlain(i)&&r.h.covers.offset(i)<.01&&!r.h.covers.tweening,'reduced motion: collected → plain cover in its rim at once');
 r.h.update(.05,{x:m.x,y:20,z:m.z},true,true,null,false,true);assert.equal(r.h.manholeTarget(),null,'no landing target on a collected cover');assert(!r.h.covers.glinting(i),'no glint on a collected cover');
 const saved=r.storage.get(COIN_STORAGE_KEY);r.h.dispose();
 const again=hunt({[COIN_STORAGE_KEY]:saved});assert(again.h.covers.isPlain(i)&&again.h.covers.offset(i)<.01&&!again.h.covers.tweening,'reload: the collected cover is plain and closed');
 assert(manholes.filter((_,k)=>k!==i).every((_,k,all)=>!again.h.covers.isPlain(manholes.indexOf(all[k]))),'other covers keep the football design');
 const w=again.h.covers.stats.writes;for(let k=0;k<30;k++)again.h.update(1/30,{x:m.x+40,y:0,z:m.z},true,false);assert.equal(again.h.covers.stats.writes,w,'no per-frame writes once settled');again.h.dispose();}
console.log('PASS collected manholes: plain cover back in its rim, reduced-motion snap, persists on reload, no target or glint');

// 6. Progress persists and old saves migrate.
{
 const t=hunt(),s=manholes[2];t.h.update(.05,{x:s.x,y:20,z:s.z},true,true,null,false,true);t.h.land({x:s.x,y:0,z:s.z},true);
 const saved=Object.fromEntries(t.storage);t.h.dispose();
 const again=hunt(saved);assert(again.h.covers.isOpen(manholes.indexOf(s)),'opened cover stays open after reload');assert(!again.h.covers.isOpen(manholes.indexOf(manholes[1])));
 assert.equal(JSON.parse(saved[COIN_STORAGE_KEY]).version,4);again.h.dispose();
 const ids=COIN_QUEST.map(s=>s.id),first55=ids.slice(0,55);
 const oldComplete=sanitizeCoinProgress({version:3,revealed:first55,collected:first55,hint:null,celebrated:true,rewardUnlocked:false});
 assert.equal(oldComplete.version,4);assert.equal(oldComplete.collected.length,55);assert(coinRewardEarned(oldComplete)&&allCostumesEarned(oldComplete),'finished 55-ball saves keep fox and costumes');assert(!oldComplete.celebrated,'the new 80-ball finale is still ahead');
 const oldPartial=sanitizeCoinProgress({version:3,collected:first55.slice(0,54)});assert.equal(oldPartial.collected.length,54);assert(!allCostumesEarned(oldPartial)&&!coinRewardEarned(oldPartial),'unfinished old saves keep their progress only');
 assert(!allCostumesEarned(sanitizeCoinProgress({version:4,collected:first55})),'new saves need every ball, manholes included');
 assert(allCostumesEarned(sanitizeCoinProgress({version:4,collected:ids})));
 const env=hunt({[COIN_STORAGE_KEY]:JSON.stringify({version:3,revealed:first55,collected:first55,hint:null,celebrated:true})});assert(allCostumesEarned(env.p.readCoinProgress()));
 env.h.update(.05,{x:manholes[0].x,y:20,z:manholes[0].z},true,true,null,false,true);env.h.land({x:manholes[0].x,y:0,z:manholes[0].z},true);env.h.update(.7,{x:manholes[0].x,y:0,z:manholes[0].z},true,true);
 const persisted=sanitizeCoinProgress(JSON.parse(env.storage.get(COIN_STORAGE_KEY)));assert.equal(persisted.collected.length,56);assert(allCostumesEarned(persisted),'migrated reward survives the next save');env.h.dispose();
}
console.log('PASS manhole progress persists in the existing storage key; version 3 saves migrate without losing rewards');

// 7. Lessons: one new, schema-valid, unique lesson per manhole.
{
 const {BALL_HUNT_LESSONS,BALL_HUNT_PRACTICE,ballLessonFrame}=fixture().load('lib/town/ballHuntLessons.ts');
 const title=s=>s.teaching.slice(0,s.teaching.indexOf('.')).toLowerCase();
 const oldTitles=new Set(others.map(title)),oldKinds=new Set(others.map(s=>BALL_HUNT_LESSONS[s.id].kind)),kinds=new Set();
 for(const s of manholes){
  const l=BALL_HUNT_LESSONS[s.id];assert(l,`${s.id} has a lesson`);assert(!oldTitles.has(title(s)),`${s.id} repeats an existing topic`);
  assert(title(s).length>8&&s.teaching.length>120,'title plus a full explanation');assert(/above|bird|look|see|picture/i.test(s.teaching),'from-above theme');
  assert(!oldKinds.has(l.kind)&&!kinds.has(l.kind),`${s.id} has its own diagram`);kinds.add(l.kind);
  assert.equal(l.steps.length,3);assert.equal(new Set(l.steps).size,3);assert.equal(l.actions.length,2);assert(l.steps.every(x=>x.length>20));
  assert(typeof BALL_HUNT_PRACTICE[s.id]==='string'&&BALL_HUNT_PRACTICE[s.id].length>30,'practice prompt');
  // Scene frames (Sep 28 2026 renderer): bounded tokens, plain SVG routes, marks on the pitch.
  for(let step=0;step<3;step++){const f=ballLessonFrame(l.kind,step);assert(f.nodes.length>=3&&f.nodes.length<=12);assert(f.arrows.length<=8);assert(f.nodes.some(n=>n.role==='team'));
   for(const n of f.nodes){assert(['team','opponent','ball'].includes(n.role));assert(n.x>=16&&n.x<=314&&n.y>=20&&n.y<=222,`${s.id} node ${n.id} visible`);}
   for(const d of [...f.arrows.map(a=>a.d),...f.lanes.map(a=>a.d),...f.hints])assert(/^M[-\d. MLQH]+$/.test(d),`${s.id} path is plain SVG`);
   for(const z of f.zones)assert(z.x>=14&&z.y>=20&&z.x+z.w<=316&&z.y+z.h<=234,`${s.id} zone on the pitch`);}
 }
 assert.equal(new Set(COIN_QUEST.map(s=>s.teaching)).size,COIN_QUEST.length);assert.equal(new Set(COIN_QUEST.map(title)).size,COIN_QUEST.length,'every lesson title is unique');
}
console.log('PASS 25 new from-above lessons: schema-valid diagrams, own visual kind, unique titles and practice prompts');
})().catch(e=>{console.error(e);process.exit(1);});
