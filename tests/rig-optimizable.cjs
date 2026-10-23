// The player rig's update() must stay small enough for V8's optimising compiler (heat QA, Oct 22 2026). It had grown to ~93 KB of
// bytecode (V8 never optimises a function over 60 KB), so every rig (you, townsfolk, visitors, shoppers, party friends) ran in the
// baseline tier and boxed every float: ~25 KB of garbage per rig per frame (~11-26 MB/s on the island in headless Chrome). The leg
// pass and the big mode blocks are now their own inner functions. This test runs the rig in a child node with natives syntax: the
// update must reach the optimised tier and allocate far less per call.
const assert=require('node:assert/strict'),{spawnSync}=require('node:child_process'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const probe=`
const fs=require('fs'),ts=require('typescript'),path=require('path'),T=require('three');const ROOT=${JSON.stringify(ROOT)};const loaded=new Map();
function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const m={exports:{}};loaded.set(file,m.exports);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 new Function('module','exports','require',code)(m,m.exports,n=>{if(n==='three')return T;if(n.startsWith('.')||n.startsWith('@/')){const base=n.startsWith('@/')?path.join(ROOT,n.slice(2)):path.resolve(path.dirname(file),n);for(const ext of ['.ts','.tsx','/index.ts',''])if(fs.existsSync(base+ext)&&fs.statSync(base+ext).isFile())return load(base+ext);}return require(n);});
 loaded.set(file,m.exports);return m.exports;}
const {createPlayer}=load(path.join(ROOT,'lib/graphics/player.ts'));
const rig=createPlayer('npc-3','neutral',true,true),motion={travelMode:'walk',facing:0,called:0};let t=0;
const step=()=>{t+=1/60;motion.called=(t%4)<1?.8:0;rig.update(Math.sin(t)*3,Math.cos(t)*3,1/60,t,false,motion);};
for(let i=0;i<30000;i++)step();
const status=%GetOptimizationStatus(rig.update);
const insp=require('inspector'),s=new insp.Session();s.connect();
s.post('HeapProfiler.startSampling',{samplingInterval:1024,includeObjectsCollectedByMinorGC:true,includeObjectsCollectedByMajorGC:true},()=>{
 const N=4000;for(let i=0;i<N;i++)step();
 s.post('HeapProfiler.stopSampling',(e,r)=>{const bytes=r.profile.samples.reduce((a,x)=>a+x.size,0)/N;console.log(JSON.stringify({status,bytes}));});
});`;
const r=spawnSync(process.execPath,['--allow-natives-syntax','-e',probe],{cwd:ROOT,encoding:'utf8',timeout:120000,env:{...process.env,NODE_PATH:path.join(ROOT,'node_modules')}});
const line=(r.stdout||'').trim().split('\n').pop();
assert.equal(r.status,0,r.stderr);
const {status,bytes}=JSON.parse(line);
assert(status&(1<<4),`rig.update reaches the optimised tier (status ${status.toString(2)}): keep it under V8's 60 KB bytecode limit`);
assert(bytes<12000,`rig.update allocates ${bytes.toFixed(0)} B per call (was ~25 KB unoptimised)`);
// The emote camera's ray test: no closure per ray x solid, no Math.hypot (it boxes its arguments).
const cam=require('node:fs').readFileSync(path.join(ROOT,'lib/town/emoteCamClear.ts'),'utf8');
assert(!/const slab = \(/.test(cam)&&/const T01 = new Float64Array\(2\)/.test(cam)&&!/Math\.hypot/.test(cam),'emoteCamClear allocates nothing per ray');
console.log(`RIG_OPTIMIZABLE_PASS optimised, ${bytes.toFixed(0)} B per update`);
