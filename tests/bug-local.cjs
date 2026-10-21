// Bug squad local density and spotting FX (bug-polish, Oct 20 2026; user: "can't see bugs to catch when walking around"; measured
// 1-7 bugs within 40 m before). Headless, the real swarm (lib/graphics/bugSwarm.ts) on the real island:
//  1. during a shift, at ≥ 8 spots over every band, phone and desktop cameras: ≥ 8 bugs within 40 m (≥ the set's size when it is
//     smaller), the 20 species' homes unchanged, the heat caps 12 / 10 / 8 by tier and at least BUG_LOCAL.floor at tiers 3-4;
//  2. walking a long loop over the island: the count within 40 m never drops below 8 after the first seconds;
//  3. local spawns land out of the camera's view (when any spot is), on Summit Isle ground, and uncaught species are sent first;
//  4. the one spotting cue (Oct 20 2026 playtest): a single halo on the nearest uncaught bug (no shadows, rings, '!', glints or checks),
//     never on a caught species, never without a body; caught species are never sent over;
//  5. every shown bug has a built model and its draw is not culled (the near model's sphere follows the bug: the stale sphere left
//     only the check mark on screen); the far silhouette is ≥ 14 px tall at 40 m on a phone;
//  6. catch simulation (bugCatch.ts rules on the real swarm): every species, a child walking up then pressing Swing at 2-8 m.
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
 assert.equal(sent.filter(id=>caughtIds.has(id)).length,0,'caught species are never sent over');
 report.push(`caught 4: sent ${sent.length} (${sent.filter(id=>caughtIds.has(id)).length} caught: never)`);sw.dispose();}

// ---- 4. The one cue: a halo on the nearest uncaught bug ----
{const sc=new T.Scene(),sw=S.createBugSwarm(sc,{floor,seed:77}),cam=camFor(1.78);sw.setCamera(cam);const s=spots[1];let maxH=0,maxD=0,frames=0,withHalo=0;
 const caughtIds=new Set();sw.update({dt:1/30,x:s.x,z:s.z,night:false,tier:0,reduced:false,busy:false,job:'bugs'});sw.ids.slice(0,3).forEach(id=>caughtIds.add(id));sw.ambient(s.x,s.z,{caught:id=>caughtIds.has(id)});// a shift starts with an empty jar; here 3 are already in it
 const m4=new T.Matrix4(),hp=new T.Vector3();
 run(sw,cam,s.x,s.z,8,{caught:id=>caughtIds.has(id),each:(x,z)=>{frames++;const h=sw.spotFx.halo;maxH=Math.max(maxH,h.count);maxD=Math.max(maxD,sw.drawCalls);
  if(h.count){withHalo++;h.getMatrixAt(0,m4);hp.setFromMatrixPosition(m4);
   const b=sw.bugs.filter(b=>b.mode!==F.Mode.Hidden).sort((p,q)=>Math.hypot(p.x-hp.x,p.z-hp.z)-Math.hypot(q.x-hp.x,q.z-hp.z))[0];
   assert(b&&Math.hypot(b.x-hp.x,b.z-hp.z)<.01,'the halo sits on a shown bug');assert(!caughtIds.has(b.id),'never on a caught species');
   assert(Math.hypot(b.x-x,b.z-z)<=FX.SPOT_FX.haloRange,'within the halo range');}}});
 assert(maxH<=1,'one halo at most');assert(withHalo>frames*.5,`the halo is up most of the shift (${withHalo}/${frames})`);
 assert(!sw.root.getObjectByName('bug-spot-marks')&&!sw.root.getObjectByName('bug-spot-ground'),'no shadows, rings, "!", glints or checks');
 sw.update({dt:1/30,x:s.x,z:s.z,night:false,tier:0,reduced:false,busy:false,job:null});assert.equal(sw.spotFx.counts.halo,0,'no cue without a shift');
 report.push(`cue: one halo (≤ ${maxH}), up ${Math.round(withHalo/frames*100)}% of frames, ≤ ${maxD} draws in all`);sw.dispose();}
// ---- 5. Every shown bug is a drawn body ----
{const sc=new T.Scene(),sw=S.createBugSwarm(sc,{floor,seed:77}),cam=camFor(.46);sw.setCamera(cam);const fr=new T.Frustum(),pm=new T.Matrix4();let checked=0,maxD=0;
 for(const s of spots.slice(0,6))run(sw,cam,s.x,s.z,5,{each:()=>{maxD=Math.max(maxD,sw.drawCalls);
  pm.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse);fr.setFromProjectionMatrix(pm);
  for(const o of sw.root.children){if(!o.isInstancedMesh||!o.name.startsWith('bug-')||o.name==='bug-swarm-far'||o.name.startsWith('bug-spot')||!o.visible)continue;
   const b=sw.bugs.find(b=>'bug-'+b.id===o.name);assert(b&&b.mode!==F.Mode.Hidden,'a shown full model is a live bug');
   const sph=o.boundingSphere.clone().applyMatrix4(o.matrixWorld);assert(sph.distanceToPoint(new T.Vector3(b.x,b.y,b.z))<=0,'the culling sphere holds the bug ('+o.name+')');
   if(fr.containsPoint(new T.Vector3(b.x,b.y,b.z))){assert(fr.intersectsObject(o),'a bug in view is never culled ('+o.name+')');checked++;}}}});
 // every slot has its built model; each shown bug is either its full model or a far instance
 for(const id of sw.ids)assert(sw.root.getObjectByName('bug-'+id),'built model for '+id);
 // the far silhouette at 40 m on a phone (fov 40, 844 px tall): the smallest species, at the far boost, ≥ 14 px
 const W=load('lib/graphics/wildBugsCore.ts'),minSize=Math.min(...SP.BUG_SPECIES.map(b=>W.bugVisualSize(b.look.size))),boost=1.45;
 // Oct 21 2026: believable sizes (gentle × 1.0-1.3 boost by size class); the halo carries the readability, not the body
 const maxSize=Math.max(...SP.BUG_SPECIES.map(b=>W.bugVisualSize(b.look.size)));assert(minSize>=.2&&maxSize<=.8,`island sizes believable: ${minSize.toFixed(2)}-${maxSize.toFixed(2)} m`);
 for(const b of SP.BUG_SPECIES){const k=W.bugVisualSize(b.look.size)/b.look.size;assert(k>=1-1e-9&&k<=1.3+1e-9,'readability boost 1.0-1.3 for '+b.id);}
 const tiny=SP.BUG_SPECIES.find(b=>b.look.body==='ant'),fly=SP.BUG_SPECIES.find(b=>b.look.body==='dragonfly');assert(W.bugVisualSize(tiny.look.size)<W.bugVisualSize(fly.look.size)*.6,'an ant is much smaller than a dragonfly');
 const ppm=(d)=>844/(2*d*Math.tan(20*Math.PI/180)),px=minSize*boost*ppm(40);assert(px>=8,`silhouette at 40 m: ${px.toFixed(1)} px`);
 const hpx=FX.haloSize(minSize)*ppm(FX.SPOT_FX.haloRange);assert(hpx>=50,`halo on the nearest bug at its 30 m range: ${hpx.toFixed(0)} px`);
 report.push(`bodies: ${checked} in-view full models all drawn (sphere follows the bug), ≤ ${maxD} draws; sizes ${minSize.toFixed(2)}-${maxSize.toFixed(2)} m; smallest at 40 m ≈ ${px.toFixed(0)} px, halo at 30 m ≈ ${hpx.toFixed(0)} px (phone)`);sw.dispose();}
// ---- 6. Catch simulation: walk up at 1.6 m/s, press Swing at d m (auto-aim, hold, samples, lunge) ----
{const K=load('lib/town/jobs/bugCatch.ts'),dt=1/30,rates={};const fast=new Set(['monarch','swallowtail','blue-morph','dragonfly','moth','bumblebee','honeybee']);
 const seen=new Set();const swarms=[];for(const time of ['day','sunset'])for(let seed=1;seen.size<20&&seed<400;seed++){const ids=SP.pickBugsOnMap(seed,0,time).map(b=>b.id);if(ids.some(id=>!seen.has(id))){ids.forEach(id=>seen.add(id));swarms.push({seed,time});}}
 assert.equal(seen.size,20,'all 20 species covered');const pos={x:0,y:0,z:0};
 for(const {seed,time} of swarms){const sunset=time==='sunset';const sc=new T.Scene(),sw=S.createBugSwarm(sc,{floor,seed});sw.reseed(seed);const s=spots[0];sw.update({dt,x:s.x,z:s.z,night:false,sunset,tier:0,reduced:false,busy:false,job:'bugs'});
  for(const id of sw.ids){const sp=SP.BUG_SPECIES.find(b=>b.id===id);if(rates[id])continue;rates[id]={};
   for(const D of [2,4,5,6,8]){let ok=0,n=0;
    for(let k=0;k<10;k++){// the others away; this one settled at home; the child walks up from 14 m
     sw.bugs.forEach(b=>{if(b.id!==id)F.hideBug(b,1e6);});const b=sw.bugs.find(b=>b.id===id);F.placeHome(b,floor);b.fade=1;
     const a=k*2.4+D,px0=b.x+Math.sin(a)*14,pz0=b.z+Math.cos(a)*14;let x=px0,z=pz0;
     for(let t=0;t<.5;t+=dt)sw.update({dt,x,z,night:false,sunset,tier:0,reduced:false,busy:false,job:'bugs'});
     for(let t=0;t<20&&Math.hypot(b.x-x,b.z-z)>D;t+=dt){const l=Math.hypot(b.x-x,b.z-z);x+=(b.x-x)/l*1.6*dt;z+=(b.z-z)/l*1.6*dt;sw.update({dt,x,z,night:false,sunset,tier:0,reduced:false,busy:false,job:'bugs'});}
     const yaw=K.headingTo(x,z,b.x,b.z)+((k%3)-1)*.6,py=floor(x,z);
     const tgt=K.autoAim(sw.query(x,py,z,K.AUTO_AIM_RANGE+3),x,z,yaw);n++;if(!tgt)continue;sw.hold(tgt.id,K.SWING.hit+.15);
     let si=0,seenIn=false,c={x:0,y:0,z:0};
     for(let t=0;t<K.SWING.hit+1e-6;t+=dt){sw.update({dt,x,z,night:false,sunset,tier:0,reduced:false,busy:false,job:'bugs'});
      while(si<K.SWING_SAMPLES.length&&t+dt>=K.SWING_SAMPLES[si]){si++;if(sw.position(tgt.id,pos)&&K.inSweep(K.lungeCentre(x,py,z,pos.x,pos.z,c),pos,false,K.LOCKED_SLACK))seenIn=true;}}
     sw.position(tgt.id,pos);K.lungeCentre(x,py,z,pos.x,pos.z,c);const hits=sw.query(x,py,z,12);let res=K.swingResult(hits,c,tgt.id);if(seenIn&&(!res||res.id!==tgt.id))res=hits.find(h=>h.id===tgt.id)??res;
     if(res&&res.id===id)ok++;}
    rates[id][D]=ok/n;}}
  sw.dispose();}
 const fails=[];for(const [id,r] of Object.entries(rates)){if(r[2]<.95||r[4]<.95||r[5]<.95)fails.push(id+' ≤5 m '+[r[2],r[4],r[5]].join('/'));if(r[8]<.8)fails.push(id+' 8 m '+r[8]);}
 assert.equal(fails.length,0,'catch rates: '+fails.join('; '));
 const avg=D=>Math.round(Object.values(rates).reduce((a,r)=>a+r[D],0)/Object.keys(rates).length*100);
 const fastMin=D=>Math.round(Math.min(...[...fast].map(id=>rates[id][D]))*100);
 report.push(`catch sim (20 species × 10 walk-ups): mean ${[2,4,5,6,8].map(D=>D+' m '+avg(D)+'%').join(', ')}; fast fliers min ${[2,4,6,8].map(D=>D+' m '+fastMin(D)+'%').join(', ')}`);}
// Night shift: fireflies get the same local density.
{const sc=new T.Scene(),sw=S.createBugSwarm(sc,{floor,seed:77}),cam=camFor(.46);sw.setCamera(cam);const s=spots[4];run(sw,cam,s.x,s.z,6,{night:true});
 const n=near(sw,s.x,s.z,40);assert(n>=Math.min(8,sw.count),`night: ${n} fireflies within 40 m`);report.push(`night: ${n}/${sw.count} fireflies within 40 m`);sw.dispose();}
// Wiring: the job calls the local density on its throttle; Town hands the swarm the camera.
{const js=fs.readFileSync(path.join(base,'lib/town/jobs/jobScene.ts'),'utf8'),town=fs.readFileSync(path.join(base,'components/Town.tsx'),'utf8');
 assert(/recallAcc>=BUG_LOCAL\.every/.test(js)&&/sw\.ambient\(p\.x,p\.z/.test(js),'jobScene: local density every BUG_LOCAL.every s');assert(/wildBugs\.setCamera\(camera\)/.test(town),'Town: swarm camera');}
console.log('bug local density ok\n  '+report.join('\n  '));
