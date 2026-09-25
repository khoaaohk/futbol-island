const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert/strict');
const base=process.cwd(),T=require('three'),ts=require('typescript');
(async()=>{
 const utils=await import(base+'/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js');
 const cache=new Map(),gradient={addColorStop(){}};const ctx=new Proxy({measureText:t=>({width:t.length*20}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(o,k)=>o[k]??(()=>{})});
 function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,console,Math,performance,Float32Array,window:{matchMedia:()=>({matches:false})},document:{createElement:()=>({getContext:()=>ctx})},require:id=>id==='three'?T:id.includes('BufferGeometryUtils')?utils:id.endsWith('.json')?require(path.resolve(path.dirname(file),id)):id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});return m.exports;}
 const world=load(base+'/lib/town/world.ts').buildTown(new T.Scene()),{stepPlayer}=load(base+'/lib/town/simulation.ts');
 const lights=world.assets.filter(a=>a.kind==='field-light');assert.equal(lights.length,20);
 for(const light of lights){const roof=light.baseY>1,list=roof?world.roofObstacles:world.obstacles,body=list.find(o=>o.x===light.x&&o.z===light.z&&o.w===.75&&o.d===.75);assert(body,'collision matches visible pedestal');if(roof){assert(body.floor===light.baseY&&body.top>body.floor+7);assert(!world.obstacles.some(o=>o===body),'no rooftop pole in ground grid');}
  for(const mode of ['walk','bike','moped'])for(const axis of ['x','z'])for(const sign of [-1,1]){const p={x:light.x,z:light.z},v={x:0,z:0};p[axis]-=sign*3;const input={x:axis==='x'?sign:0,z:axis==='z'?sign:0,sprint:true};for(let i=0;i<120;i++)stepPlayer(p,v,input,1/30,[body],mode);assert((p[axis]-light[axis])*sign<-.37,'cannot cross pole '+mode);}
 }
 world.dispose();console.log('PASS all 20 field lights: 240 walking/bike/moped approaches, rooftop height separation');
})().catch(e=>{console.error(e);process.exit(1)});
