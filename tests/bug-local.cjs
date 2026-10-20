// Bug squad local density and spotting FX (bug-polish, Oct 20 2026; user: "can't see bugs to catch when walking around"; measured
// 1-7 bugs within 40 m before). Headless, the real swarm (lib/graphics/bugSwarm.ts) on the real island:
//  1. during a shift, at ≥ 8 spots over every band, phone and desktop cameras: ≥ 8 bugs within 40 m (≥ the set's size when it is
//     smaller), the 20 species' homes unchanged, the heat caps 12 / 10 / 8 by tier and at least BUG_LOCAL.floor at tiers 3-4;
//  2. walking a long loop over the island: the count within 40 m never drops below 8 after the first seconds;
//  3. local spawns land out of the camera's view (when any spot is), on Summit Isle ground, and uncaught species are sent first;
//  4. FX: contact shadows / spawn rings / glints / checks within the pooled caps, 2 extra draws at most, none without a shift.
// usage: node tests/bug-local.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),T=req('three');
const cache=new Map();class Ev{constructor(type){this.type=type;}}
const storage=new Map(),localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k),get length(){return storage.size;},key:i=>[...storage.keys()][i]??null};
const context=vm.createContext({console,Math,Set,Map,WeakMap,Date,JSON,Promise,queueMicrotask,performance,Float32Array,Uint8Array,Uint16Array,Uint32Array,Int32Array,Array,Object,Number,String,Error,Symbol,TextEncoder,Event:Ev,CustomEvent:Ev,
 window:{addEventListener(){},removeEventListener(){},dispatchEvent:()=>true,matchMedia:()=>({matches:false})},localStorage,document:{createElement:()=>({width:0,height:0,getContext:()=>null}),dispatchEvent:()=>true}});
function load(name){
 let file=path.isAbsolute(name)?name:path.resolve(base,name);if(!fs.existsSync(file)||fs.statSync(file).isDirectory())for(const ext of ['.ts','.tsx','.js'])if(fs.existsSync(file+ext)){file+=ext;break;}
 if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const r=id=>id==='three'?T:id.startsWith('@/')?load(id.slice(2)):id.startsWith('.')?load(path.resolve(path.dirname(file),id)):req(id);
 vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,r);cache.set(file,mod.exports);return mod.exports;}
const SP=load('lib/town/jobs/bugSpecies.ts'),S=load('lib/graphics/bugSwarm.ts'),SI=load('lib/town/summitIsle.ts'),V=load('lib/town/venues.ts'),FX=load('lib/graphics/bugSpotFx.ts');
const floor=V.fieldSurfaceHeight,F=load('lib/graphics/bugFlight.ts');
const report=[];
// The follow camera: south-east of the player, up and back, looking at them (Town's usual framing); phone (portrait) / desktop.
function camFor(aspect){const c=new T.PerspectiveCamera(40,aspect,1,500);return c;}
function aim(c,x,z){c.position.set(x+7,floor(x,z)+11,z+13);c.lookAt(x,floor(x,z)+1,z);c.updateMatrixWorld(true);}
const inView=(c,x,z)=>{const d=new T.Vector3();c.getWorldDirection(d);const vx=x-c.position.x,vz=z-c.position.z,fl=Math.hypot(d.x,d.z),vl=Math.hypot(vx,vz);const half=Math.atan(Math.tan(c.fov*Math.PI/360)*c.aspect);return (vx*d.x+vz*d.z)/(fl*vl)>Math.cos(half);};
const near=(sw,x,z,r)=>sw.bugs.filter(b=>b.mode!==F.Mode.Hidden&&b.fade>.5&&Math.hypot(b.x-x,b.z-z)<r).length;
/** Run a shift's frames at (x, z): the swarm per frame, the local density every BUG_LOCAL.every s (like jobScene). */
function run(sw,cam,x,z,secs,o={}){const dt=1/30;let acc=0;const moved=[];
 for(let t=0;t<secs;t+=dt){if(o.walk){x+=o.walk.vx*dt;z+=o.walk.vz*dt;if(!SI.onSummitIsle(x,z)){o.walk.vx*=-1;o.walk.vz*=-1;}}
  aim(cam,x,z);sw.update({dt,x,z,night:!!o.night,tier:o.tier??0,reduced:false,busy:false,job:o.night?'fireflies':'bugs'});
  acc+=dt;if(acc>=SP.BUG_LOCAL.every){acc=0;const before=sw.bugs.map(b=>b.hx+','+b.hz);sw.ambient(x,z,{caught:o.caught??(()=>false)});
   sw.bugs.forEach((b,i)=>{if(b.hx+','+b.hz!==before[i])moved.push({id:b.id,x:b.hx,z:b.hz,view:inView(cam,b.hx,b.hz)});});}
  if(o.each)o.each(x,z,t);}
 return {x,z,moved};}
// Spots: one per home band and between them, each nudged onto walkable ground (≥ 8 spots).
const byBand=['high','trail','water','meadow'].map(b=>SP.BUG_HOMES.filter(h=>h.band===b)),order=[];for(let i=0;i<8;i++)for(const l of byBand)if(l[i])order.push(l[i]);
const spots=[];for(const h of order){if(spots.length>=10)break;const s={x:h.x+9,z:h.z+7};if(!SI.onSummitIsle(s.x,s.z)){s.x=h.x;s.z=h.z;}
 if(spots.some(p=>Math.hypot(p.x-s.x,p.z-s.z)<30))continue;spots.push({...s,band:h.band});}
assert(spots.length>=8,'≥ 8 measuring spots: '+spots.length);assert.equal(new Set(spots.map(s=>s.band)).size,4,'spots over all four bands');
const homes0=JSON.stringify(SP.BUG_HOMES);

// ---- 1. Every spot, phone and desktop, by heat tier ----
for(const [view,aspect] of [['phone',.46],['desktop',1.78]]){const counts=[];let out=0,all=0;
 for(const s of spots){const sc=new T.Scene(),sw=S.createBugSwarm(sc,{floor,seed:77}),cam=camFor(aspect);sw.setCamera(cam);
  const r=run(sw,cam,s.x,s.z,6);const n=near(sw,s.x,s.z,40);counts.push(n);
  assert(n>=8,`${view} @ (${s.x},${s.z}) ${s.band}: ${n} bugs within 40 m (≥ 8)`);assert.equal(sw.count,12,'tier 0 cap 12');
  for(const m of r.moved){all++;if(!m.view)out++;assert(SI.onSummitIsle(m.x,m.z),'spawn on Summit Isle ground');}
  sw.dispose();}
 assert(all>0&&out/all>=.9,`${view}: local spawns out of the camera's view (${out}/${all})`);
 report.push(`${view}: bugs within 40 m at ${spots.length} spots: ${counts.join(', ')} (min ${Math.min(...counts)}); ${out}/${all} spawns out of view`);}
assert.equal(JSON.stringify(SP.BUG_HOMES),homes0,'the 20 species homes are unchanged');
for(const [tier,cap] of [[1,10],[2,8],[3,8],[4,8]]){const s=spots[2],sc=new T.Scene(),sw=S.createBugSwarm(sc,{floor,seed:77}),cam=camFor(1.78);sw.setCamera(cam);
 run(sw,cam,s.x,s.z,6,{tier});assert.equal(sw.count,cap,`tier ${tier}: ${cap} out`);assert(cap>=SP.BUG_LOCAL.floor,'tiers 3-4 keep at least BUG_LOCAL.floor during a shift');
 const n=near(sw,s.x,s.z,40);assert(n>=Math.min(8,cap),`tier ${tier}: ${n} within 40 m`);report.push(`tier ${tier}: ${cap} out, ${n} within 40 m`);sw.dispose();}
// Without a shift the wild bugs keep their old caps (none at tiers 3-4) and no local density / FX.
{const sc=new T.Scene(),sw=S.createBugSwarm(sc,{floor,seed:77});sw.update({dt:1/30,x:spots[0].x,z:spots[0].z,night:false,tier:3,reduced:false,busy:false});assert.equal(sw.count,0,'no shift, tier 3: none');sw.dispose();}

// ---- 2. Walking a long loop ----
{const sc=new T.Scene(),sw=S.createBugSwarm(sc,{floor,seed:77}),cam=camFor(.46);sw.setCamera(cam);let min=99,samples=0,acc=0;const s=spots[3];
 run(sw,cam,s.x,s.z,4);run(sw,cam,s.x,s.z,60,{walk:{vx:1.3,vz:-.9},each:(x,z,t)=>{acc+=1/30;if(t>3&&acc>=2){acc=0;samples++;min=Math.min(min,near(sw,x,z,40));}}});
 assert(min>=8,`walking: never fewer than 8 within 40 m (min ${min} over ${samples} samples)`);report.push(`walking 60 s at 1.6 m/s: min ${min} within 40 m over ${samples} samples`);sw.dispose();}

// ---- 3. Uncaught species first ----
{const sc=new T.Scene(),sw=S.createBugSwarm(sc,{floor,seed:77}),cam=camFor(1.78);sw.setCamera(cam);const s=spots[5];
 sw.update({dt:1/30,x:s.x,z:s.z,night:false,tier:0,reduced:false,busy:false,job:'bugs'});const caughtIds=new Set(sw.ids.slice(0,4));
 const r=run(sw,cam,s.x,s.z,6,{caught:id=>caughtIds.has(id)});const sent=r.moved.map(m=>m.id),firstCaught=sent.findIndex(id=>caughtIds.has(id));
 // Every uncaught species not already near was sent before any caught one.
 const uncaughtSent=new Set(sent.filter(id=>!caughtIds.has(id)));
 if(firstCaught>=0)for(const id of sw.ids)if(!caughtIds.has(id))assert(uncaughtSent.has(id)||sw.bugs.find(b=>b.id===id)&&Math.hypot(sw.bugs.find(b=>b.id===id).hx-s.x,sw.bugs.find(b=>b.id===id).hz-s.z)<40,'uncaught '+id+' sent (or already near) before a caught one');
 report.push(`caught 4: sent ${sent.length} (${sent.filter(id=>caughtIds.has(id)).length} caught, shown with a check)`);sw.dispose();}

// ---- 4. FX budget ----
{const sc=new T.Scene(),sw=S.createBugSwarm(sc,{floor,seed:77}),cam=camFor(1.78);sw.setCamera(cam);const s=spots[1];let maxG=0,maxM=0,maxD=0,rings=0;
 run(sw,cam,s.x,s.z,8,{each:()=>{const c=sw.spotFx.counts;maxG=Math.max(maxG,c.ground);maxM=Math.max(maxM,c.marks);maxD=Math.max(maxD,sw.drawCalls);}});
 assert(maxG>0&&maxG<=sw.count*2,`ground FX within the pool (${maxG} ≤ ${sw.count*2})`);assert(maxM>0&&maxM<=sw.count,`marks within the pool (${maxM} ≤ ${sw.count})`);
 // the shadow sits on the ground under a flying bug; glints only within SPOT_FX.glintRange.
 assert.equal(FX.SPOT_FX.glintRange,25);
 sw.update({dt:1/30,x:s.x,z:s.z,night:false,tier:0,reduced:false,busy:false,job:null});assert.equal(sw.spotFx.counts.ground+sw.spotFx.counts.marks,0,'no FX without a shift');
 report.push(`FX: ≤ ${maxG} ground marks, ≤ ${maxM} glints/checks, ≤ ${maxD} draws in all`);sw.dispose();}
// Night shift: fireflies get the same local density.
{const sc=new T.Scene(),sw=S.createBugSwarm(sc,{floor,seed:77}),cam=camFor(.46);sw.setCamera(cam);const s=spots[4];run(sw,cam,s.x,s.z,6,{night:true});
 const n=near(sw,s.x,s.z,40);assert(n>=Math.min(8,sw.count),`night: ${n} fireflies within 40 m`);report.push(`night: ${n}/${sw.count} fireflies within 40 m`);sw.dispose();}
// Wiring: the job calls the local density on its throttle; Town hands the swarm the camera.
{const js=fs.readFileSync(path.join(base,'lib/town/jobs/jobScene.ts'),'utf8'),town=fs.readFileSync(path.join(base,'components/Town.tsx'),'utf8');
 assert(/recallAcc>=BUG_LOCAL\.every/.test(js)&&/sw\.ambient\(p\.x,p\.z/.test(js),'jobScene: local density every BUG_LOCAL.every s');assert(/wildBugs\.setCamera\(camera\)/.test(town),'Town: swarm camera');}
console.log('bug local density ok\n  '+report.join('\n  '));
