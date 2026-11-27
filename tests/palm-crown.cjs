// Palm crowns on their trunks (owner Nov 27 2026, shot 212: "the leaves are not on the trunk of the tree properly"). Builds the real
// town headless (normal + battery saver) and checks every palm builder's record (lib/town/palmCrown.ts): the fronds' hub, read from
// the built frond mesh's own matrix, lies within 5 cm of the leaning trunk's real tip (from the trunk mesh's transform). Before the
// fix the hub sat on the palm's axis: up to ~0.3 m off on the tall palms. usage: node tests/palm-crown.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),T=req('three');
(async()=>{
const utils=await import(base+'/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js');
function loader(low){
 const cache=new Map(),gradient={addColorStop(){}},store={'fi2-battery-saver':low?'on':null};
 const ctx=new Proxy({measureText:t=>({width:t.length*20}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(o,k)=>o[k]??(()=>{})});
 const context=vm.createContext({console,Math,Set,Map,WeakMap,Date,JSON,Promise,performance,Float32Array,Float64Array,Uint8Array,Uint16Array,Uint32Array,Int32Array,Array,Object,Number,String,Error,Symbol,Infinity,NaN,
  window:{addEventListener(){},removeEventListener(){},matchMedia:()=>({matches:false}),location:{search:''}},localStorage:{getItem:k=>store[k]??null,setItem(){},removeItem(){}},document:{createElement:()=>({width:0,height:0,getContext:()=>ctx})}});
 function load(name){
  let file=path.isAbsolute(name)?name:path.resolve(base,name);if(!fs.existsSync(file)||fs.statSync(file).isDirectory())for(const ext of ['.ts','.tsx','.js'])if(fs.existsSync(file+ext)){file+=ext;break;}
  if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
  const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
  const r=id=>id==='three'?T:id.includes('BufferGeometryUtils')?utils:id.startsWith('@/')?load(id.slice(2)):id.endsWith('.json')?JSON.parse(fs.readFileSync(path.resolve(path.dirname(file),id),'utf8')):id.startsWith('.')?load(path.resolve(path.dirname(file),id)):req(id);
  vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,r);cache.set(file,mod.exports);return mod.exports;}
 return load;}

const A=new T.Vector3(),B=new T.Vector3(),C=new T.Vector3(),P=new T.Vector3();
/** Number of 26-connected pieces of a prop (its vertex runs' triangles sampled into a 0.3 m grid). */
for(const low of [false,true]){const load=loader(low),scene=new T.Scene();load('lib/town/world.ts').buildTown(scene);
 const list=load('lib/town/palmCrown.ts').PALM_CROWNS,by={};for(const p of list)by[p.where]=(by[p.where]||0)+1;
 const bad=list.filter(p=>!(p.gap<=.05));if(bad.length)console.log(bad.slice(0,8).map(p=>`${p.where} (${p.x.toFixed(1)},${p.z.toFixed(1)}) gap ${p.gap.toFixed(3)} m`).join('\n'));
 assert((by.world||0)>100&&(by.summit||0)>5,`palms recorded: ${JSON.stringify(by)}`);
 assert.equal(bad.length,0,`${bad.length} palm crowns off their trunk tips`);
 console.log(`PASS ${low?'battery saver':'normal'}: ${list.length} palms ${JSON.stringify(by)}, worst gap ${Math.max(...list.map(p=>p.gap)).toFixed(4)} m`);}
console.log('palm-crown: all checks passed');
})().catch(e=>{console.error(e);process.exit(1);});
