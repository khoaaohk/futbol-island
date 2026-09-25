const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('node:assert/strict'),T=require('three'),ts=require('typescript');
(async()=>{const utils=await import('three/examples/jsm/utils/BufferGeometryUtils.js'),cache=new Map(),gradient={addColorStop(){}};const ctx=new Proxy({createRadialGradient:()=>gradient},{get:(o,k)=>o[k]??(()=>{})});
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,Math,Float32Array,document:{createElement:()=>({getContext:()=>ctx})},require:id=>id==='three'?T:id.includes('BufferGeometryUtils')?utils:id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});return m.exports;}
const scene=new T.Scene(),fields=load('lib/town/fields.ts').buildFormatFields(scene),{sevenBuildOutLocalZ}=load('lib/town/buildOut.ts');
for(const [id,root] of fields.roots){
 const lines=root.children.find(o=>o.isLineSegments),a=lines.geometry.attributes.position;
 for(const side of [-1,1]){
  const z=sevenBuildOutLocalZ(side);let dashes=0;
  for(let i=0;i<a.count;i+=2)if(Math.abs(a.getZ(i)-z)<1e-5&&Math.abs(a.getZ(i+1)-z)<1e-5&&Math.abs(a.getX(i+1)-a.getX(i))<=.901)dashes++;
  if(id==='7v7')assert(dashes>20,'visible dashed line spans the 7v7 width');else assert.equal(dashes,0,'other pitches receive no build-out dashes');
 }
}
fields.dispose();console.log('PASS two shared-coordinate dashed 7v7 lines inside existing pitch line geometry, other formats unchanged');})().catch(e=>{console.error(e);process.exit(1)});
