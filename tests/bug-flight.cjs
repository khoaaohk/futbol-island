// Bug flight (Oct 20 2026, docs/island-jobs.md §15 "Bug flight"): realistic per-species bug models and fluid motion for the
// Summit Isle bug swarm (lib/graphics/bugModels.ts, bugFlight.ts, bugSwarm.ts). Headless:
//  1. all 20 species (and the firefly) have a full model: wings / cases / legs flagged for the shader, a triangle budget each,
//     one small shared far silhouette;
//  2. per-species caps by heat tier (12 / 10 / 8 bugs from pickBugsOnMap, 8 / 6 / 4 fireflies, 0 at tiers 3-4 / reduced motion);
//  3. the draw-call budget anywhere on the island (day: 1 far draw + species within FULL_OUT_M; night: 2);
//  4. a simulated 60 s flight of every movement style, at 60 Hz and at the far 15 Hz: no NaN, no teleport (step ≤ top speed × dt),
//     stays on its leash round home and above the ground;
//  5. sneaking: standing still or walking slowly lets you close to common bugs, running is noticed at `alert`, rare bugs are shyer;
//  6. the catching API: query (nearest first), startle, catch (hidden, then back home later), position, setSet with a fade;
//  7. no allocation in the swarm's update or the flight step.
// usage: node tests/bug-flight.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),T=req('three');
const winEvents=[];const cache=new Map();class Ev{constructor(type,o){this.type=type;this.detail=o?.detail;}}
const storage=new Map(),localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k),get length(){return storage.size;},key:i=>[...storage.keys()][i]??null};
const context=vm.createContext({console,Math,Set,Map,WeakMap,Date,JSON,Promise,queueMicrotask,performance,Float32Array,Uint8Array,Uint16Array,Uint32Array,Int32Array,Array,Object,Number,String,Error,Symbol,TextEncoder,Event:Ev,CustomEvent:Ev,
 window:{addEventListener(){},removeEventListener(){},dispatchEvent:e=>{winEvents.push(e.type);return true;},matchMedia:()=>({matches:false})},localStorage,
 document:{createElement:()=>({width:0,height:0,getContext:()=>null}),dispatchEvent:()=>true}});
function load(name){
 let file=path.isAbsolute(name)?name:path.resolve(base,name);if(!fs.existsSync(file)||fs.statSync(file).isDirectory())for(const ext of ['.ts','.tsx','.js'])if(fs.existsSync(file+ext)){file+=ext;break;}
 if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const r=id=>id==='three'?T:id.startsWith('@/')?load(id.slice(2)):id.startsWith('.')?load(path.resolve(path.dirname(file),id)):req(id);
 vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,r);cache.set(file,mod.exports);return mod.exports;}
const read=f=>fs.readFileSync(path.join(base,f),'utf8');
const SP=load('lib/town/jobs/bugSpecies.ts'),M=load('lib/graphics/bugModels.ts'),F=load('lib/graphics/bugFlight.ts'),W=load('lib/graphics/wildBugsCore.ts'),S=load('lib/graphics/bugSwarm.ts');
const SI=load('lib/town/summitIsle.ts'),V=load('lib/town/venues.ts'),floor=V.fieldSurfaceHeight;

// ---- 1. Models ----
{assert.equal(SP.BUG_SPECIES.length,20,'20 species');let total=0;
 for(const sp of [...SP.BUG_SPECIES,null]){const g=M.createBugModel(sp),name=sp?.id??'firefly',n=M.triangleCount(g);total+=n;
  assert(n>=300&&n<=1300,`${name}: ${n} triangles (300-1300)`);
  for(const a of ['position','normal','color','aWing','aMisc'])assert(g.getAttribute(a),`${name} has ${a}`);
  const wing=g.getAttribute('aWing'),misc=g.getAttribute('aMisc'),kinds=new Set(),pos=g.getAttribute('position');let legs=0;
  for(let i=0;i<wing.count;i++){kinds.add(Math.round(wing.getY(i)));if(misc.getY(i)>0)legs++;}
  for(let i=0;i<pos.count*3;i++)assert(Number.isFinite(pos.array[i]),name+' finite');
  g.computeBoundingBox();const bb=g.boundingBox,len=Math.max(bb.max.x-bb.min.x,bb.max.z-bb.min.z);assert(Math.abs(len-1)<1e-3,`${name} normalised to 1 (${len})`);
  assert(bb.min.y>-.05,`${name} stands on y = 0 (${bb.min.y.toFixed(3)})`);
  const look=sp?.look;
  if(!look||look.wings==='scaled'||look.wings==='clear'&&['dragonfly','damselfly','bee'].includes(look.body))assert(kinds.has(1)&&kinds.has(2)||kinds.has(3),`${name}: fore + hind wings flap`);
  if(look?.wings==='elytra'||!look)assert(kinds.has(3)&&kinds.has(4),`${name}: wing cases over folded hind wings`);
  if(look?.wings==='none')assert(!kinds.has(1)&&!kinds.has(2),`${name}: no wings`);
  assert(legs>0,`${name}: walking legs flagged for the shader`);
  g.dispose();}
 assert.deepEqual([...new Set(SP.BUG_SPECIES.map(s=>s.look.body))].filter(b=>!M.BUG_MODEL_BODIES.includes(b)),[],'every body type has a builder');
 const fg=M.createBugFarGeometry();assert(M.triangleCount(fg)<=80,'far silhouette ≤ 80 triangles: '+M.triangleCount(fg));
 console.log(`  models: 21 full models, ${total} triangles in all (avg ${Math.round(total/21)}), far silhouette ${M.triangleCount(fg)}`);}

// ---- 2. Caps by heat tier ----
same([0,1,2,3,4].map(tier=>W.wildBugCount({tier,reduced:false,night:false})),[12,10,8,0,0],'bugs 12 / 10 / 8 / 0 / 0');
same([0,1,2,3,4].map(tier=>W.wildBugCount({tier,reduced:false,night:true})),[8,6,4,0,0],'fireflies 8 / 6 / 4 / 0 / 0');
assert.equal(W.wildBugCount({tier:0,reduced:true,night:false}),0,'reduced motion: none');
const C=SI.SUMMIT_CENTER,on={x:640,z:180};
const frame=(sw,o,n=1,dt=1/60)=>{for(let i=0;i<n;i++)sw.update({dt,night:false,tier:0,reduced:false,busy:false,...o});};
for(const [tier,n] of [[0,12],[1,10],[2,8]]){const sc=new T.Scene(),sw=S.createBugSwarm(sc,{floor,seed:77});frame(sw,{...on,tier});
 assert.equal(sw.count,n,`tier ${tier}: ${n} bugs`);const ids=sw.ids;assert.equal(new Set(ids).size,n,'one of each species');
 for(const id of ids)assert(SP.bugHomeById(id),'at its BUG_HOMES spot: '+id);
 const bands=new Set(ids.map(id=>SP.bugHomeById(id).band));assert.equal(bands.size,4,'spread over all four bands');
 for(const b of sw.bugs){const h=SP.bugHomeById(b.id);assert(Math.hypot(b.x-h.x,b.z-h.z)<=h.wander+.01,'starts at home');}
 sw.dispose();assert.equal(sc.children.length,0,'disposed');}

// ---- 3. Draw calls ----
{const sc=new T.Scene(),sw=S.createBugSwarm(sc,{floor,seed:77});let worst=0,full=0,checked=0;
 for(let x=480;x<=780;x+=12)for(let z=10;z<=240;z+=12){if(!SI.onSummitIsle(x,z))continue;frame(sw,{x,z},2);checked++;
  const near=sw.bugs.filter(b=>Math.hypot(b.x-x,b.z-z)<W.WILD_BUG_RANGE.FULL_OUT_M).length;worst=Math.max(worst,sw.drawCalls);full=Math.max(full,near);
  assert(sw.drawCalls<=1+near,`draws ${sw.drawCalls} ≤ 1 + ${near} near species at (${x}, ${z})`);}
 assert(worst<=4,'never more than 4 bug draws on the island: '+worst);
 for(let i=0;i<60;i++)frame(sw,{...on,night:true});assert.equal(sw.set,'fireflies','night: the fireflies');assert.equal(sw.drawCalls,2,'night: two draws (bodies + glows)');
 console.log(`  draw calls: ≤ ${worst} by day over ${checked} island spots (1 far + up to ${full} full models), 2 at night`);sw.dispose();}

// ---- 4. 60 s flights: no NaN, no teleport ----
{const moves=Object.keys(F.FLIGHT_PROFILES);let maxStep=0;
 for(const move of moves)for(const dt of [1/60,1/15]){
  const h=SP.BUG_HOMES[moves.indexOf(move)%SP.BUG_HOMES.length],b=F.createFlightBug({id:move,move,x:h.x,z:h.z,wander:h.wander,alert:4,sneak:.6,seed:moves.indexOf(move)*31+7},floor);
  let px=h.x+15,pz=h.z,prev={x:b.x,y:b.y,z:b.z};
  for(let t=0;t<60;t+=dt){
   // The player wanders, and twice runs straight at the bug.
   const run=(t>10&&t<14)||(t>40&&t<43),tx=run?b.x:h.x+Math.cos(t*.3)*12,tz=run?b.z:h.z+Math.sin(t*.3)*12,sp=run?3.7:1.2,d=Math.hypot(tx-px,tz-pz)||1,stepLen=Math.min(d,sp*dt);
   px+=(tx-px)/d*stepLen;pz+=(tz-pz)/d*stepLen;
   F.stepBug(b,dt,{px,pz,pspeed:sp,floor});
   for(const k of ['x','y','z','vx','vy','vz','yaw','pitch','roll','flap','fhz','famp','fbase','open','leg','legAmp'])assert(Number.isFinite(b[k]),`${move}: ${k} finite at ${t.toFixed(2)} s`);
   const step=Math.hypot(b.x-prev.x,b.y-prev.y,b.z-prev.z);maxStep=Math.max(maxStep,step/dt);
   assert(step<=F.BUG_MAX_SPEED*dt+.05,`${move} @${Math.round(1/dt)} Hz: step ${step.toFixed(3)} m at ${t.toFixed(2)} s (no teleport)`);
   assert(Math.hypot(b.x-h.x,b.z-h.z)<=h.wander+F.BUG_MAX_SPEED*dt+5.5,`${move}: stays near home`);
   assert(b.y>=floor(b.x,b.z)-.02,`${move}: never under the ground`);
   assert(Math.abs(b.pitch)<1.3&&Math.abs(b.roll)<1,`${move}: body pitch / roll stay sane`);
   prev={x:b.x,y:b.y,z:b.z};}}
 console.log(`  flights: ${moves.length} movement styles × 60 s at 60 Hz and 15 Hz, top speed seen ${maxStep.toFixed(2)} m/s (cap ${F.BUG_MAX_SPEED})`);}

// ---- 5. Sneaking ----
{assert.equal(F.noticeRadius(2,0,1.3),0,'common bugs: walk right up');assert.equal(F.noticeRadius(2,0,3.7),2,'common bugs notice a runner at alert');
 assert(F.noticeRadius(5,.85,1.3)>F.noticeRadius(4,.65,1.3),'legendary shyer than rare');assert(F.noticeRadius(4,.65,0)<F.noticeRadius(4,.65,1.3),'standing still is sneakier than walking');
 const h=SP.bugHomeById('stag-beetle'),sp=SP.bugSpeciesById('stag-beetle');// rare: alert 4, sneak .65
 const make=()=>F.createFlightBug({id:'s',move:sp.move,x:h.x,z:h.z,wander:h.wander,alert:sp.alert,sneak:sp.sneak,seed:5},floor);
 const approach=(speed,stopAt)=>{const b=make();let px=b.x+8,pz=b.z,fled=false;for(let i=0;i<600;i++){const d=Math.hypot(px-b.x,pz-b.z);if(d>stopAt){const k=Math.min(d-stopAt,speed/60)/d;px+=(b.x-px)*k;pz+=(b.z-pz)*k;}
  if(F.stepBug(b,1/60,{px,pz,pspeed:d>stopAt?speed:0,floor}))fled=true;}return {fled,b,px,pz};};
 assert.equal(approach(1.2,2.4).fled,false,'sneaking slowly to 2.4 m of a rare beetle and standing still: it stays');
 const run=approach(3.7,2.4);assert.equal(run.fled,true,'running at it: noticed and it flees');
 const c=SP.bugSpeciesById('ladybug'),ch=SP.bugHomeById('ladybug'),lb=F.createFlightBug({id:'l',move:c.move,x:ch.x,z:ch.z,wander:ch.wander,alert:c.alert,sneak:c.sneak,seed:3},floor);
 let noticed=false;for(let i=0;i<300;i++)noticed=F.stepBug(lb,1/60,{px:lb.x+.6,pz:lb.z,pspeed:1.3,floor})||noticed;assert.equal(noticed,false,'a common ladybird lets a walking kid stand right by it');
 // A startled bug moves away smoothly from the player.
 const b=make(),d0=Math.hypot(b.x-(h.x+1),b.z-h.z);F.startle(b,h.x+1,h.z,floor);let maxS=0,p0={x:b.x,z:b.z};for(let i=0;i<120;i++){F.stepBug(b,1/60,{px:h.x+1,pz:h.z,pspeed:0,floor});maxS=Math.max(maxS,Math.hypot(b.x-p0.x,b.z-p0.z));p0={x:b.x,z:b.z};}
 assert(Math.hypot(b.x-(h.x+1),b.z-h.z)>d0+.5,'startled: it got farther away');assert(maxS<F.BUG_MAX_SPEED/60+.01,'smoothly (no jump)');}

// ---- 6. The catching API ----
{const sc=new T.Scene(),sw=S.createBugSwarm(sc,{floor,seed:77});frame(sw,on);const id=sw.ids[0],b=sw.bugs[0],out={x:0,y:0,z:0};
 frame(sw,{x:b.x+3,z:b.z},2);
 const hits=sw.query(b.x,b.y,b.z,3);assert(hits.length>=1&&hits[0].id===id&&hits[0].kind==='bug'&&hits[0].species.id===id,'query finds it, nearest first');
 for(let i=1;i<hits.length;i++)assert(hits[i].dist>=hits[i-1].dist);
 assert.equal(sw.position(id,out),out);assert(Math.abs(out.x-b.x)<1e-9,'position(): the zoom camera target');
 const before=Math.hypot(b.x-(b.x+3),0);assert.equal(sw.startle(id,{x:b.x+1,z:b.z}),true);
 const got=sw.catch(id);assert(got&&got.species.id===id&&Number.isFinite(got.x),'catch(): where and what');
 assert.equal(sw.catch(id),null,'caught once');assert.equal(sw.query(got.x,got.y,got.z,5).some(h=>h.id===id),false,'caught bugs leave query');assert.equal(sw.position(id,out),null);
 frame(sw,{x:got.x+3,z:got.z},Math.ceil((F.BUG_RESPAWN_S+2)*60));assert(sw.position(id,out),'a new one turns up at its home later');
 sw.setSet('fireflies');let sawFade=false;for(let i=0;i<30;i++){frame(sw,on);if(sw.set==='bugs'&&sw.root)sawFade=true;}
 for(let i=0;i<60;i++)frame(sw,on);assert(sawFade,'fades the bugs out first');assert.equal(sw.set,'fireflies','setSet swaps to the fireflies');
 const f=sw.query(sw.bugs[0].x,sw.bugs[0].y,sw.bugs[0].z,1)[0];assert(f&&f.kind==='firefly'&&f.call&&f.call.id===sw.bugs[0].id,'fireflies answer query with their call');
 // Running past a bug: it flutters, counted, and the hint goes out once a visit.
 sw.setSet('bugs');for(let i=0;i<90;i++)frame(sw,on);sw.resetHint();winEvents.length=0;const t=sw.bugs[0];let x=t.x+6;
 for(let i=0;i<60;i++){x-=3.7/60;frame(sw,{x,z:t.z});}
 assert.equal(winEvents.filter(e=>e===W.WILD_BUG_HINT).length,1,'a runner scares it: one hint');
 sw.dispose();assert.equal(sc.children.length,0);}

// ---- 7. No allocation per frame ----
{const src=read('lib/graphics/bugSwarm.ts'),loop=src.slice(src.indexOf(' function update('),src.indexOf(' function flutter('));
 assert(!/\bnew (?!Event\(WILD_BUG_HINT)|\[\]|[(=,]\s*\{\s*\w+:/.test(loop.replace(/build\([^)]*\)/g,'')),'no allocation in the swarm update');
 const fl=read('lib/graphics/bugFlight.ts'),step=fl.slice(fl.indexOf('export function stepBug'),fl.indexOf('/** Catch:'));
 assert(!/\bnew |\[[^\]]*,[^\]]*\]\s*\)|[(=,]\s*\{\s*\w+:/.test(step),'no allocation in the flight step');
 const town=read('components/Town.tsx');assert.match(town,/wildBugs\.update\(\{dt:[^}]*night:timeRef\.current==='night',sunset:timeRef\.current==='sunset',tier:heat\.tier,reduced,busy:!!jobs\.run\}\)/,'Town drives it');}
console.log('PASS bug flight: 20 species + firefly modelled (wings, cases, legs), caps 12/10/8 + fireflies 8/6/4, draw budget, 60 s flights with no NaN or teleport, sneaking vs running, the catching API, no per-frame allocation');
function same(a,b,m){assert.deepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)),m);}
