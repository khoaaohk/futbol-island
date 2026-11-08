// Island life (Nov 8 2026, owner: "make the island feel more alive without adding more heat" + "improve the bug details and their
// movements so it's more natural; show the details when walking, scootering and closer up"). Pure / source level, headless:
//  1. island wind (lib/graphics/islandWind.ts): patches existing materials only (no new material / mesh / draw), weights from the
//     prop's own height, eases to still and stops its clock under reduced motion / static ambience / a slow governor;
//  2. world.ts + groundDecals.ts wiring: only the plain-paint chunk material and the tuft decals, no new meshes or materials;
//  3. bug LOD: the full-detail radius rides with speed (walk 14 m, scooter / bike farther, capped inside NEAR_M), nearest
//     NEAR_DETAIL_MAX species only, day draws never above 1 + that cap, a rider passing a bug sees it in full beyond 14 m;
//  4. garden company: caps by tier / phone, none with reduced motion or at tiers 3-4, never queried or caught, sits out a shift,
//     deterministic per seed;
//  5. natural motion: irregular wing beats, non-periodic weave, crawler stop-go pauses, dragonfly hover scans, all deterministic;
//  6. sleeping: nothing built away from Summit Isle or with reduced motion; no per-frame allocation in the new code paths.
// usage: node tests/island-life.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),T=req('three');
const cache=new Map();class Ev{constructor(type,o){this.type=type;this.detail=o?.detail;}}
const storage=new Map(),localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k),get length(){return storage.size;},key:i=>[...storage.keys()][i]??null};
const context=vm.createContext({console,Math,Set,Map,WeakMap,Date,JSON,Promise,queueMicrotask,performance,Float32Array,Uint8Array,Uint16Array,Uint32Array,Int32Array,Array,Object,Number,String,Error,Symbol,TextEncoder,Event:Ev,CustomEvent:Ev,
 window:{addEventListener(){},removeEventListener(){},dispatchEvent:()=>true,matchMedia:()=>({matches:false})},localStorage,
 document:{createElement:()=>({width:0,height:0,getContext:()=>null}),dispatchEvent:()=>true}});
function load(name){
 let file=path.isAbsolute(name)?name:path.resolve(base,name);if(!fs.existsSync(file)||fs.statSync(file).isDirectory())for(const ext of ['.ts','.tsx','.js'])if(fs.existsSync(file+ext)){file+=ext;break;}
 if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const r=id=>id==='three'?T:id.startsWith('@/')?load(id.slice(2)):id.startsWith('.')?load(path.resolve(path.dirname(file),id)):req(id);
 vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,r);cache.set(file,mod.exports);return mod.exports;}
const read=f=>fs.readFileSync(path.join(base,f),'utf8');
const IW=load('lib/graphics/islandWind.ts'),F=load('lib/graphics/bugFlight.ts'),W=load('lib/graphics/wildBugsCore.ts'),S=load('lib/graphics/bugSwarm.ts');
const SP=load('lib/town/jobs/bugSpecies.ts'),SI=load('lib/town/summitIsle.ts'),V=load('lib/town/venues.ts'),floor=V.fieldSurfaceHeight;

// ---- 1. Island wind ----
{const U=IW.ISLAND_WIND;U.uWindT.value=0;U.uWindAmp.value=0;
 for(let i=0;i<300;i++)IW.stepIslandWind(1/30,false);
 assert(Math.abs(U.uWindAmp.value-IW.WIND_AMP)<.005,'eases up to WIND_AMP: '+U.uWindAmp.value);assert(U.uWindT.value>9,'clock runs');
 assert(IW.WIND_AMP<=.2,'subtle: ≤ 0.2 m at weight 1');
 const t0=U.uWindT.value;IW.stepIslandWind(0,false);assert.equal(U.uWindT.value,t0,'dt 0 (no rendered frame): nothing moves');
 for(let i=0;i<400;i++)IW.stepIslandWind(1/30,true);assert.equal(U.uWindAmp.value,0,'still (reduced / static ambience / slow): eases to 0');
 const t1=U.uWindT.value;for(let i=0;i<30;i++)IW.stepIslandWind(1/30,true);assert.equal(U.uWindT.value,t1,'still: the clock stops');
 // weights from the prop's own height, flagged; unmarked UVs never match the flag
 const g=new T.CylinderGeometry(.2,.2,6,6);g.translate(0,3,0);IW.markSway(g,0,6,IW.WIND_SWAY_KINDS.palm);const uv=g.getAttribute('uv'),p=g.getAttribute('position');
 for(let i=0;i<p.count;i++){assert.equal(uv.getY(i),IW.SWAY_FLAG);const k=p.getY(i)/6;assert(Math.abs(uv.getX(i)-k*k)<1e-6,'weight (y/h)²');}
 assert(IW.SWAY_FLAG<-500,'flag far outside real UVs');
 // material hook: same material back, idempotent, splices the shader, no extra objects
 const m=new T.MeshStandardMaterial();assert.equal(IW.patchIslandWind(m),m,'patches in place (no new material)');const hook=m.onBeforeCompile;IW.patchIslandWind(m);assert.equal(m.onBeforeCompile,hook,'idempotent');
 const sh={uniforms:{},vertexShader:'#include <common>\nvoid main(){\n#include <project_vertex>\n}'};m.onBeforeCompile(sh);
 assert(/islandWind\(/.test(sh.vertexShader)&&/uv\.y<-500\./.test(sh.vertexShader)&&sh.uniforms.uWindT===U.uWindT,'paint hook: flagged vertices only, shared clock');
 const tm=new T.MeshLambertMaterial();IW.patchTuftWind(tm);const ts2={uniforms:{},vertexShader:'#include <common>\n#include <project_vertex>'};tm.onBeforeCompile(ts2);assert(/position\.y\*\.45/.test(ts2.vertexShader),'tufts: blade tips only');
 assert(/USE_INSTANCING[\s\S]*islandWind/.test(sh.vertexShader),'sway applied after the instance matrix (world space)');
 const src=read('lib/graphics/islandWind.ts'),step=src.slice(src.indexOf('export function stepIslandWind'),src.indexOf('/** Mark one'));
 assert(!/\bnew |\[\]|\{\s*\w+:/.test(step),'no allocation in the per-frame wind step');}

// ---- 2. Wiring: existing materials only ----
{const w=read('lib/town/world.ts');
 assert.match(w,/shared=m\.clone\(\);shared\.color\.set\(0xffffff\);shared\.vertexColors=true;patchIslandWind\(shared\);/,'chunk paint material patched once, where it is made');
 assert.match(w,/updateWater:\(dt:number,still:boolean\)=>\{stepWaterTime\(dt,still\);stepIslandWind\(dt,still\);\}/,'wind clock rides the water step (same still flag, rendered frames only)');
 const block=w.slice(w.indexOf('// Island wind (Nov 8 2026'),w.indexOf('// Island wind (Nov 8 2026')+700);
 assert(!/new T\.(Mesh|InstancedMesh|\w*Material)\b/.test(block),'no mesh or material in the wind marking');
 assert.match(block,/shared\.has\(piece\.batch\.material\)/,'only plain-paint chunk pieces are marked');
 const d=read('lib/graphics/groundDecals.ts');assert.equal((d.match(/new T\.InstancedMesh/g)||[]).length,1,'decals: still one InstancedMesh per kind (no new mesh)');
 assert.match(d,/if\(label==='tufts'\)patchTuftWind\(mat\)/,'only the tuft decal material sways');
 assert.deepEqual(Object.keys(IW.WIND_SWAY_KINDS).sort(),['bush','palm','tree'],'trees, palms and bushes sway; signs, lamps, benches stay still');}

// ---- 3. Ride-aware LOD ----
{const r=W.fullDetailRadius;assert.equal(r(0),W.WILD_BUG_RANGE.FULL_IN_M,'standing: 14 m');assert.equal(r(1.3),W.WILD_BUG_RANGE.FULL_IN_M,'walking: 14 m');
 assert(r(6)>22,'scooter pace: farther ('+r(6)+')');assert(r(10)>=r(6),'monotonic');assert(r(99)<=W.WILD_BUG_RANGE.NEAR_M-3,'capped inside NEAR_M (every-frame stepping)');
 assert.equal(r(NaN),W.WILD_BUG_RANGE.FULL_IN_M,'NaN safe');assert(W.NEAR_DETAIL_MAX.desktop<=3&&W.NEAR_DETAIL_MAX.phone<=W.NEAR_DETAIL_MAX.desktop,'near-detail caps');}
const frame=(sw,o,n=1,dt=1/60)=>{for(let i=0;i<n;i++)sw.update({dt,night:false,tier:0,reduced:false,busy:false,...o});};
{const sc=new T.Scene(),sw=S.createBugSwarm(sc,{floor,seed:77});let worst=0,seenFar=0,checked=0;
 for(const phone of [false,true])for(let x=480;x<=780;x+=12)for(let z=10;z<=240;z+=12){if(!SI.onSummitIsle(x,z))continue;frame(sw,{x,z,phone},2);checked++;
  worst=Math.max(worst,sw.drawCalls);assert(sw.drawCalls<=1+W.NEAR_DETAIL_MAX[phone?'phone':'desktop'],`draws ${sw.drawCalls} at (${x}, ${z}) phone ${phone}`);}
 assert(worst<=4,'never above the bug-flight budget of 4: '+worst);
 // A rider at 8 m/s passing every bug: the detail radius grows and full models draw beyond the walking 14 m.
 for(const b of sw.bugs){const x0=b.x-40,z0=b.z+6;for(let i=0;i<300;i++){const x=x0+8*i/60;frame(sw,{x,z:z0});
   if(sw.detail.inM>W.WILD_BUG_RANGE.FULL_IN_M+5&&sw.detail.species>0){const nearest=Math.min(...[...sw.bugs,...sw.company].map(o=>Math.hypot(o.x-x,o.z-z0)));if(nearest>W.WILD_BUG_RANGE.FULL_IN_M+1)seenFar++;}}}
 assert(seenFar>0,'riding: bugs show in full detail beyond the walking radius');
 // Standing still the radius returns to 14 m.
 for(let i=0;i<120;i++)frame(sw,{x:640,z:180});assert(sw.detail.inM<W.WILD_BUG_RANGE.FULL_IN_M+.5,'standing: back to 14 m');
 console.log(`  LOD: ≤ ${worst} day draws over ${checked} spots (desktop + phone); a rider sees full detail beyond 14 m (${seenFar} frames)`);sw.dispose();}

// ---- 4. Garden company ----
{assert.deepEqual([0,1,2,3,4].map(t=>W.gardenCompanyCount({tier:t,reduced:false})),[6,4,2,0,0],'desktop by tier');
 assert.deepEqual([0,1,2].map(t=>W.gardenCompanyCount({tier:t,reduced:false,phone:true})),[4,2,0],'phone by tier');
 assert.equal(W.gardenCompanyCount({tier:0,reduced:true}),0,'reduced motion: none');
 let any=0;for(const seed of [77,5,123,999]){const sc=new T.Scene(),sw=S.createBugSwarm(sc,{floor,seed});frame(sw,{x:640,z:180});
  const lovers=sw.ids.filter(id=>W.GARDEN_MOVES.includes(SP.BUG_SPECIES.find(s=>s.id===id).move));
  assert(sw.company.length<=6&&(lovers.length===0)===(sw.company.length===0),`seed ${seed}: company only of today's flower lovers`);any+=sw.company.length;
  for(const c of sw.company){assert(lovers.includes(c.id.split('~')[0]),'a copy of a flower lover');assert(SI.onSummitIsle(c.hx,c.hz),'on Summit Isle');
   assert(!sw.query(c.x,c.y,c.z,.01).some(h=>h.id===c.id),'never queried');assert.equal(sw.catch(c.id),null,'never caught');}
  assert.equal(sw.count,sw.ids.length,'company is not in the catchable set');
  // deterministic: a second swarm with the same seed puts the same company in the same places after the same frames
  const sc2=new T.Scene(),sw2=S.createBugSwarm(sc2,{floor,seed});frame(sw2,{x:640,z:180});frame(sw,{x:640,z:180},90);frame(sw2,{x:640,z:180},90);
  assert.deepEqual(sw.company.map(b=>[b.id,+b.x.toFixed(6),+b.z.toFixed(6)]),sw2.company.map(b=>[b.id,+b.x.toFixed(6),+b.z.toFixed(6)]),'deterministic per seed');
  // a Bug squad shift: company sits out (the far draw holds only catchable bugs)
  frame(sw,{x:640,z:180,job:'bugs'},3);assert(sw.far.count<=sw.count,'shift: company hidden');
  sw.dispose();sw2.dispose();}
 assert(any>0,'some seeds bring garden company');
 const sc=new T.Scene(),sw=S.createBugSwarm(sc,{floor,seed:77});frame(sw,{x:640,z:180,tier:3});assert.equal(sw.company.length,0,'tier 3: none');sw.dispose();}

// ---- 5. Natural motion ----
{const mk=(move,seed)=>{const h=SP.BUG_HOMES[0];return F.createFlightBug({id:move,move,x:h.x,z:h.z,wander:6,alert:3,sneak:.5,seed},floor);};
 const ctx={px:9999,pz:9999,pspeed:0,floor};
 // butterflies: irregular wing beat in flight (rate varies), and the weave is not a fixed sine (lateral period varies)
 {const b=mk('butterfly-glide',11);const hz=[];for(let i=0;i<60*40;i++){F.stepBug(b,1/60,ctx);if(b.mode===0&&b.gliding<=0)hz.push(b.fhz);}
  const mean=hz.reduce((a,v)=>a+v,0)/hz.length,sd=Math.sqrt(hz.reduce((a,v)=>a+(v-mean)**2,0)/hz.length);
  assert(hz.length>100&&sd/mean>.05,'butterfly wing beat varies (cv '+(sd/mean).toFixed(3)+')');
  assert(F.FLIGHT_PROFILES['butterfly-glide'].figure8>0,'butterflies weave lazy figure-eights');}
 // two butterflies with different seeds never flap in lock-step
 {const a=mk('butterfly-glide',1),b=mk('butterfly-glide',2);assert(a.nf!==b.nf||a.np!==b.np,'own rhythm per bug');}
 // beetles walk in stop-go bursts: walking frames include near-still moments
 {const b=mk('beetle-trundle',21);let walk=0,still=0;for(let i=0;i<60*60;i++){F.stepBug(b,1/60,ctx);if(b.mode===3){walk++;if(Math.hypot(b.vx,b.vz)<F.FLIGHT_PROFILES['beetle-trundle'].walk*.4)still++;}}
  assert(walk>200&&still>walk*.08,`beetle stop-go: ${still}/${walk} slow walking frames`);}
 // dragonflies scan while hovering (heading changes with no travel), bees wobble
 {const b=mk('dragonfly-dart',31);let scans=0,prev=b.yaw;for(let i=0;i<60*60;i++){F.stepBug(b,1/60,ctx);if(b.mode===1&&Math.abs(b.yaw-prev)>.004)scans++;prev=b.yaw;}assert(scans>0,'dragonfly hover scans');}
 assert(F.FLIGHT_PROFILES['bee-hover'].buzz>0&&F.FLIGHT_PROFILES['bee-hover'].perchP>.2,'bees buzz-wobble and dip into flowers more');
 // deterministic
 {const a=mk('bee-hover',41),b=mk('bee-hover',41);for(let i=0;i<600;i++){F.stepBug(a,1/60,ctx);F.stepBug(b,1/60,ctx);}assert.equal(a.x,b.x);assert.equal(a.roll,b.roll);}
 const fl=read('lib/graphics/bugFlight.ts'),wob=fl.slice(fl.indexOf('export function wob'),fl.indexOf('export function createFlightBug'));assert(!/\bnew |\[\]|\{\s*\w+:/.test(wob),'wob(): no allocation');}

// ---- 6. Sleeping ----
{const sc=new T.Scene(),sw=S.createBugSwarm(sc,{floor,seed:77});frame(sw,{x:0,z:0},5);assert.equal(sw.set,null,'main island: nothing built');assert.equal(sc.children.length,0);
 frame(sw,{x:640,z:180,reduced:true},5);assert.equal(sw.set,null,'reduced motion: nothing built');
 frame(sw,{x:640,z:180},2);assert.equal(sw.set,'bugs');frame(sw,{x:640,z:180,tier:3},2);assert.equal(sw.set,null,'heat tier 3: dropped');sw.dispose();
 const src=read('lib/graphics/bugSwarm.ts'),loop=src.slice(src.indexOf(' function update('),src.indexOf(' function flutter('));
 assert(!/\bnew (?!Event\(WILD_BUG_HINT)|\[\]|[(=,]\s*\{\s*\w+:|fullDetailRadius\([^)]*\)\./.test(loop.replace(/build\([^)]*\)/g,'')),'no allocation in the swarm update');}

console.log('PASS island life: wind on existing materials only (eases still under reduced / static / slow), ride-aware bug LOD within the draw budget, garden company (decoration, sits out shifts, deterministic), natural bug motion, sleeping, no per-frame allocation');
