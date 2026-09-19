const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function load(file){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:m.exports,module:m,require});return m.exports;}
const burst=load('lib/graphics/sonicBurst.ts').createSonicBurst();
for(const soft of [false,true,false]){
 burst.trigger(0,28,0,0,false,'#b8fff0',soft);
 const versions=burst.root.children.map(m=>m.material.version);
 for(let i=0;i<20;i++){burst.trigger(0,28,0,0,false,'#96ff96',soft);burst.update(.1,false);}
 assert.deepEqual(burst.root.children.map(m=>m.material.version),versions,'repeated boosts reuse material programs');
 assert(burst.root.children.some(m=>m.visible),'boost still visible');
}
burst.dispose();
const forbidden=new Proxy({},{get(){throw Error('disabled cache accessed renderer');}});
const cache=load('lib/graphics/staticShadowCache.ts').createStaticShadowCache(forbidden,forbidden,forbidden,false);
cache.invalidate();cache.dispose();assert.equal(cache.stats.builds,0);
console.log('BOOST_RENDER_WORK_PASS: repeated boosts reuse materials; disabled cache leaves renderer untouched');
