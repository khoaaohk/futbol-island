// Explore life (Oct 21-22 2026; docs/swimming-research.md §13, docs/performance-guide.md "Explore life"): the held rise, solid
// collision, the heat savings and the realism pieces of the reef room (pure helpers, budgets, source checks).
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

ok('held rise: ▲ eases in to 2x and carries all the way to the top; ▼ is gentler; a tap is a small step; release holds',()=>{
 assert.equal(S.diveLiftSpeed(0,1),1);assert.equal(S.diveLiftSpeed(0,-1),1);assert(Math.abs(S.diveLiftSpeed(5,1)-S.DIVE_LIFT.up)<1e-9);assert(Math.abs(S.diveLiftSpeed(5,-1)-S.DIVE_LIFT.down)<1e-9);
 assert(S.DIVE_LIFT.up>S.DIVE_LIFT.down&&S.DIVE_LIFT.down>1);let p=0;for(let t=0;t<=2;t+=.05){const v=S.diveLiftSpeed(t,1);assert(v>=p-1e-12);p=v;}
 const spot=D.diveSpotById('turtle-pool'),s=S.createDiveSession();s.scan(.2,spot.x,spot.z,true);assert(s.start());
 for(let i=0;i<90;i++)s.step(1/30,{sx:0,sy:0,lift:-1});const low=s.state.y;
 s.step(1/30,{sx:0,sy:0,lift:1});s.step(1/30,{sx:0,sy:0,lift:1});s.step(1/30,{sx:0,sy:0,lift:0});const tap=s.state.y-low;assert(tap>0&&tap<.3,'a tap is a small step: '+tap.toFixed(3));
 for(let i=0;i<20;i++)s.step(1/30,{sx:0,sy:0,lift:0});const held=s.state.y;for(let i=0;i<30;i++)s.step(1/30,{sx:0,sy:0,lift:0});assert(Math.abs(s.state.y-held)<.05,'release holds the depth');
 let n=0;while(!s.state.atTop&&n<300){s.step(1/30,{sx:0,sy:0,lift:1});n++;}assert(s.state.atTop,'held ▲ reaches the top');assert(n<150,'within 5 s: '+n);
 assert(s.state.y<=D.DIVE_SURFACE_Y+1e-6,'never above the water');assert.equal(s.state.depthT,0);
});
