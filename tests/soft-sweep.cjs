// Soft island sweep (Nov 27 2026; lib/graphics/softBox.ts, `?soft=0` = before). Node = ON.
// Harness: tests/prop-reactions.cjs's (the town builds headless in a vm with canvas stubs).
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),T=req('three');

(async()=>{
const utils=await import(base+'/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js');
const cache=new Map(),gradient={addColorStop(){}};
const ctx=new Proxy({measureText:t=>({width:t.length*20}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(o,k)=>o[k]??(()=>{})});
const context=vm.createContext({console,Math,Set,Map,WeakMap,Date,JSON,Promise,performance,Float32Array,Uint8Array,Uint16Array,Uint32Array,Int32Array,Array,Object,Number,String,Error,Symbol,Infinity,NaN,
 window:{addEventListener(){},removeEventListener(){},matchMedia:()=>({matches:false})},localStorage:{getItem:()=>null,setItem(){},removeItem(){}},document:{createElement:()=>({width:0,height:0,getContext:()=>ctx})}});
function load(name){
 let file=path.isAbsolute(name)?name:path.resolve(base,name);if(!fs.existsSync(file)||fs.statSync(file).isDirectory())for(const ext of ['.ts','.tsx','.js'])if(fs.existsSync(file+ext)){file+=ext;break;}
 if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const r=id=>id==='three'?T:id.includes('BufferGeometryUtils')?utils:id.startsWith('@/')?load(id.slice(2)):id.endsWith('.json')?JSON.parse(fs.readFileSync(path.resolve(path.dirname(file),id),'utf8')):id.startsWith('.')?load(path.resolve(path.dirname(file),id)):req(id);
 vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,r);cache.set(file,mod.exports);return mod.exports;}
let failed=0;const ok=(name,fn)=>{try{fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};
const S=load('lib/graphics/softBox.ts');
ok('soft box: still a BoxGeometry, same size, outward winding, smooth normals, counted triangles',()=>{
 for(const seg of [0,1,2])for(const dome of [0,.05]){const g=new S.SoftBoxGeometry(2,.5,1,{seg,dome});assert(g instanceof T.BoxGeometry);assert.equal(g.parameters.width,2);
  const tris=g.index.count/3;assert.equal(tris,S.softBoxTriangles(seg,dome),`seg ${seg} dome ${dome}: ${tris}`);
  g.computeBoundingBox();const b=g.boundingBox;assert(Math.abs(b.max.x-1)<1e-6&&Math.abs(b.min.z+.5)<1e-6&&Math.abs(b.max.y-.25-dome)<1e-6,`bounds seg ${seg}`);
  const p=g.getAttribute('position'),n=g.getAttribute('normal'),ix=g.index.array;let vol=0;
  for(let i=0;i<ix.length;i+=3){const a=new T.Vector3().fromBufferAttribute(p,ix[i]),bb=new T.Vector3().fromBufferAttribute(p,ix[i+1]),c=new T.Vector3().fromBufferAttribute(p,ix[i+2]);vol+=a.dot(bb.clone().cross(c))/6;}
  assert(vol>0&&vol<=2*.5*1+dome*2+1e-6&&vol>.85,`volume ${vol}`);
  for(let i=0;i<n.count;i++)assert(Math.abs(new T.Vector3().fromBufferAttribute(n,i).length()-1)<1e-4);
  let s=0;for(const gr of g.groups)s+=gr.count;assert.equal(s,g.index.count);}});
let world=null;const town=()=>world??=load('lib/town/world.ts').buildTown(new T.Scene());
ok('rails: every deck / fence rail end lands on a full post (within 5 cm, post top at or above the rail)',()=>{
 const {rails,posts}=town().railAudit;assert(rails.length>12,`${rails.length} rails`);const bad=[];
 for(const [ax,az,bx,bz,y] of rails)for(const [x,z] of [[ax,az],[bx,bz]])if(!posts.some(p=>Math.hypot(p[0]-x,p[1]-z)<=.05&&p[2]>=y-.12))bad.push(`(${x.toFixed(2)}, ${z.toFixed(2)}) y ${y.toFixed(2)}`);
 assert(!bad.length,`${bad.length} rail ends without a post: ${bad.slice(0,12).join('; ')}`);});
console.log(failed?`${failed} failed`:'soft-sweep: all ok');process.exit(failed?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
