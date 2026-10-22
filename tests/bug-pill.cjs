// Bug squad pill regression (Oct 21 2026; user, twice: "the bar is missing for bug squad, I don't know how many I have caught and
// can't exit") and the Night squad ("job is not working in night mode ... to catch bugs", "more fireflies on the mountain island").
// usage: node tests/bug-pill.cjs
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
const SP=load('lib/town/jobs/bugSpecies.ts'),S=load('lib/graphics/bugSwarm.ts'),SI=load('lib/town/summitIsle.ts'),V=load('lib/town/venues.ts'),F=load('lib/graphics/bugFlight.ts');
const floor=V.fieldSurfaceHeight;
const read=f=>fs.readFileSync(path.join(base,f),'utf8');
const UI=load('lib/town/jobs/bugUi.ts');
// ---- 1. The pill invariant (pure): a squad run only renders visible states; the watchdog's calls ----
{const same=(a,b,m)=>assert.deepEqual(a,b,m);
 same(['chip','tip','full','fading','',undefined].map(p=>UI.pillShown(true,p,'fading')),['chip','tip','full','chip','chip','chip'],'a squad pill never renders fading / stale');
 assert.equal(UI.pillShown(false,'chip','fading'),'fading','other jobs keep their fade');
 assert.equal(UI.pillCount({value:3,total:5,squad:{value:10,total:20}}),'10/20','day: the squad count');
 assert.equal(UI.pillCount({value:3,total:5,squad:{value:6,total:8}}),'6/8','night: N/8');
 assert.equal(UI.pillCount({value:2,total:5,phase:'deliver'}),'5/5');
 const base0={running:true,staging:false,dialog:false,exists:true,visible:true,stackHidden:false};
 assert.equal(UI.pillWatch(base0),'ok');assert.equal(UI.pillWatch({...base0,running:false,visible:false}),'ok','no run: nothing to do');
 assert.equal(UI.pillWatch({...base0,visible:false,staging:true}),'wait','the catch stage / release hides it on purpose');
 assert.equal(UI.pillWatch({...base0,visible:false,dialog:true}),'wait','a dialog covers it on purpose');
 assert.equal(UI.pillWatch({...base0,visible:false}),'reset','in the stack but not visible: reset the pill state');
 assert.equal(UI.pillWatch({...base0,visible:false,stackHidden:true}),'detach','the stack is hidden by a stuck flag: draw it on its own');
 assert.equal(UI.pillWatch({...base0,exists:false,visible:false}),'detach','missing: draw it on its own');
 assert(UI.PILL_WATCH_MS>=400&&UI.PILL_WATCH_MS<=1000,'about 2 Hz, no per-frame work');}
// ---- 2. Source: the watchdog, the dock, the End button's count, the vending flag cap, Esc and the two-tap confirm ----
{const J=read('components/IslandJobs.tsx'),town=read('components/Town.tsx'),css=read('components/IslandJobs.module.css'),g=read('app/globals.css');
 assert.match(J,/const id=window\.setInterval\(\(\)=>\{try\{/,'a watchdog');assert.match(J,/const call=pillWatch\(\{running:!!getJobRuntime\(\)\?\.run,/,'it asks pillWatch');assert.match(J,/\},PILL_WATCH_MS\);\n  return\(\)=>window\.clearInterval\(id\);\},\[squadKey\]\);/,'at 2 Hz, only while a squad shift runs');
 assert.match(J,/__fi2PillRescues/,'it counts its rescues (debug)');assert.match(J,/setPill\('chip'\);setPanel\('full'\)/,'it resets the pill state');
 assert.match(J,/data-job-panel=\{pillShown\(!!a\.squad,pill,panel\)\}/,'the panel state goes through the invariant');
 assert.match(J,/a\.squad&&pillDocked\?<div className=\{styles\.pillDock\} data-pill-dock>\{panelEl\}<\/div>:<HudSlot>\{panelEl\}<\/HudSlot>/,'docked on its own when the stack fails');
 assert.match(css,/\.pillDock\{position:fixed;/);assert.match(css,/\.pillDock>\.hud\{[^}]*visibility:visible!important;opacity:1!important/);
 assert.match(J,/dialog\[open\]/,'native dialogs (Bug book) count as covering it on purpose');
 assert.match(J,/e\.key==='Escape'[\s\S]{0,300}endJob\(\)/,'Esc still ends the shift');
 assert.match(J,/if\(r&&r\.def\.swing&&r\.got\.some\(Boolean\)&&!endAsk\)\{setEndAsk\(true\);return;\}/,'the two-tap Sure? confirm stays');
 assert.match(town,/bc=a\?\.squad\?pillCount\(a\):''/,'Town mirrors the count');
 assert.match(town,/<b className="job-end-count" data-job-end-count aria-hidden="true">\{bugCount\}<\/b>/,'the End button carries the count');
 assert.match(town,/<small>\{bugEndAsk\?'Sure\?':'End'\}<\/small>/,'End keeps its Sure?');
 assert.match(g,/\.job-end-mini \.job-end-count\{/);
 assert.match(town,/leaveTimer\.current=setTimeout\(done,1600\)/,'the vending leaving flag clears itself (it hid the whole HUD stack when stuck)');
 assert.equal((town.match(/if\(!open\)leaveVending\(\);/g)||[]).length,2,'both machines use it');}
// ---- 3. Night flow (pure, the real swarm and catch rules): the job def, the fireflies, catching ----
{const C=load('lib/town/jobs/jobCatalog.ts'),BS=load('lib/town/jobs/bugScout.ts'),K=load('lib/town/jobs/bugCatch.ts'),WC=load('lib/graphics/wildBugsCore.ts');
 const night=C.jobVariant('bug-scout','night'),day=C.jobVariant('bug-scout','day');
 assert(night&&night.prop==='firefly'&&night.set==='fireflies'&&night.swing,'night: the firefly squad');assert(day&&day.set==='bugs','day: the bugs');
 assert.equal(C.jobVariant('bug-scout','fireflies').id,night.id,'view.active.set resolves');assert.equal(BS.activeSet('night'),'fireflies');assert.equal(BS.activeSet('sunset'),'bugs');
 assert.equal(night.targets.length,8,'8 calls');
 const calls=new Set(SP.FIREFLY_SET.map(f=>f.id));
 const homes=S.fireflyHomes(48);assert.equal(homes.length,48);assert.equal(new Set(homes.map(h=>h.id)).size,48,'unique ids');
 for(const h of homes){assert(calls.has(h.call),'every firefly is one of the 8 calls');assert(SI.onSummitIsle(h.x,h.z),'on Summit Isle');assert(!SP.inBugNorthZone(h.x,h.z)||SP.onSummitSand(h.x,h.z),'nothing north of the summit but the sand');}
 const dt=1/30,sc=new T.Scene(),sw=S.createBugSwarm(sc,{floor,seed:5}),s0={x:606,z:140};
 sw.update({dt,x:s0.x,z:s0.z,night:true,tier:0,reduced:false,busy:false,job:'fireflies'});assert.equal(sw.set,'fireflies');assert.equal(sw.count,48,'48 on a cool desktop');assert.equal(sw.drawCalls<=2,true,'one body draw + one glow draw');
 {const p=S.createBugSwarm(new T.Scene(),{floor,seed:5});p.update({dt,x:s0.x,z:s0.z,night:true,tier:4,reduced:false,busy:false,phone:true,job:'fireflies'});assert(p.count>=4,'Battery saver: a shift keeps ≥ 4 catchable');p.dispose();}
 // Walk up (running 4.5 m/s, and walking 1.6 m/s) and Cup at 1, 2, 3 m.
 const pos={x:0,y:0,z:0};let ok=0,n=0;
 for(const speed of [4.5,1.6])for(const D of [1,2,3])for(let k=0;k<6;k++){const b=sw.bugs[(k*7+D)%sw.bugs.length];sw.bugs.forEach(o=>{if(o!==b)F.hideBug(o,1e6);});F.placeHome(b,floor);b.fade=1;
  const a=k*2.4+D;let x=b.x+Math.sin(a)*12,z=b.z+Math.cos(a)*12;
  for(let t=0;t<.5;t+=dt)sw.update({dt,x,z,night:true,tier:0,reduced:false,busy:false,job:'fireflies'});
  for(let t=0;t<20&&Math.hypot(b.x-x,b.z-z)>D;t+=dt){const l=Math.hypot(b.x-x,b.z-z);x+=(b.x-x)/l*speed*dt;z+=(b.z-z)/l*speed*dt;sw.update({dt,x,z,night:true,tier:0,reduced:false,busy:false,job:'fireflies'});}
  const py=floor(x,z),tgt=K.autoAim(sw.query(x,py,z,K.AUTO_AIM_RANGE+3),x,z,K.headingTo(x,z,b.x,b.z));n++;if(!tgt)continue;assert(tgt.kind==='firefly'&&calls.has(tgt.call.id),'the hit carries its call');sw.hold(tgt.id,K.SWING.hit+.15);
  let si=0,seenIn=false;const c={x:0,y:0,z:0};
  for(let t=0;t<K.SWING.hit+1e-6;t+=dt){sw.update({dt,x,z,night:true,tier:0,reduced:false,busy:false,job:'fireflies'});
   while(si<K.SWING_SAMPLES.length&&t+dt>=K.SWING_SAMPLES[si]){si++;if(sw.position(tgt.id,pos)&&K.inSweep(K.lungeCentre(x,py,z,pos.x,pos.z,c),pos,false,K.LOCKED_SLACK))seenIn=true;}}
  sw.position(tgt.id,pos);K.lungeCentre(x,py,z,pos.x,pos.z,c);const hits=sw.query(x,py,z,12);let res=K.swingResult(hits,c,tgt.id);if(seenIn&&(!res||res.id!==tgt.id))res=hits.find(h=>h.id===tgt.id)??res;
  if(res&&res.id===b.id){ok++;const got=sw.catch(b.id);assert(got&&got.kind==='firefly'&&calls.has(got.call.id),'caught: a firefly call');}
  F.placeHome(b,floor);}
 assert(ok/n>=.95,`night catch rate at 1-3 m: ${ok}/${n}`);sw.dispose();
 console.log(`PASS bug pill: the pill invariant + 2 Hz watchdog + dock, the End button count, the vending flag cap; night: the firefly squad def, 48 fireflies (8 calls, unique ids, on the island), caught ${ok}/${n} at 1-3 m running and walking`);}
