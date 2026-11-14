// QA round 1a, core island (Nov 13 2026): fixes found by the overnight play-test.
// 1. The Breath pill: after a duck-dive, the refill that lands on full always tells the HUD (it stayed up while swimming).
// 2. The first spawn is in the open square, not behind the 20 m roof terrace south of it (only the hidden-player pin showed).
// 3. The live match's "You're the keeper" banner is out of the accessibility tree while hidden.
// Run: node tests/qa-core-nov13.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const base=path.resolve(__dirname,'..'),T=require('node:module').createRequire(base+'/package.json')('three');
const G={Math,Map,Set,WeakMap,Uint8Array,Uint16Array,Uint32Array,Int8Array,Int16Array,Int32Array,Float32Array,Float64Array,console,JSON,Number,Object,Array,String,Symbol,Error,Promise,Date,RegExp,isFinite,parseFloat,parseInt};
const loaded=new Map();function load(file){file=path.resolve(base,file);if(loaded.has(file))return loaded.get(file);const mod={exports:{}};loaded.set(file,mod.exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,{...G,exports:mod.exports,module:mod,
  require:id=>id==='three'?T:id.startsWith('@/')?load(resolveTs(path.resolve(base,id.slice(2)))):id.startsWith('.')?load(resolveTs(path.resolve(path.dirname(file),id))):require(id)});loaded.set(file,mod.exports);return mod.exports;}
const resolveTs=p=>fs.existsSync(p+'.ts')?p+'.ts':fs.existsSync(p+'.tsx')?p+'.tsx':p+'/index.ts';
const read=f=>fs.readFileSync(path.join(base,f),'utf8');

// 1. Breath refill reaches the HUD at full, whatever the frame timing.
const S=load('lib/town/water/diveSession.ts');
for(const dt of [1/60,1/30,1/144,.0123]){
 const s=S.createDiveSession();
 for(let t=0;t<3;t+=dt)s.duck(dt,true);// a 3 s duck-dive drains some breath
 s.duck(dt,false);assert(s.state.breath<.999,'the duck drained breath');
 let last=null;for(let t=0;t<120&&s.state.breath<1;t+=dt){s.scan(dt,9999,9999,true);if(s.events.breathUi)last=s.state.uiBreath;}
 assert.equal(s.state.breath,1,'refilled');assert.equal(last,1,`the HUD heard the full breath (dt ${dt})`);assert.equal(s.state.uiBreath,1);
}
// 2. Spawn in the open square.
const town=read('components/Town.tsx');
assert.match(town,/const INITIAL_SPAWN=\{x:103,z:-20\};/,'spawn in the square');
// 3. Keeper banner hidden = visibility hidden.
const css=read('components/LiveJoinHud.module.css');
assert.match(css,/\.keeper\{[^}]*opacity:0;visibility:hidden;[^}]*visibility 0s linear \.2s/,'hidden banner leaves the a11y tree after its fade');
assert.match(css,/\.keeper\[data-show\]\{visibility:visible\}/);
console.log('qa-core-nov13: ok');
