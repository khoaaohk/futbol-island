// Broadleaf trees with volume (Nov 26 2026, lib/town/broadleafTrees.ts): the shape kit is used, a tree is the same at the same spot
// (stable between sessions and players), it stays inside today's canopy envelope (tree kicks, leaf debris, canopy hit tests), its
// facets are flat, its occlusion array matches its vertices, and the triangle budget holds. usage: node tests/broadleaf-trees.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),T=req('three');
(async()=>{
const utils=await import(base+'/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js'),mod={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(base,'lib/town/broadleafTrees.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,
 {exports:mod.exports,module:mod,Math,Float32Array,window:undefined,require:n=>n==='three'?T:utils});
const B=mod.exports;assert.equal(B.broadleafTreesOn(),true,'default on');
const shapes=new Set();let maxTri=0,sum=0,n=0;
for(let i=0;i<400;i++){const x=-330+(i*37.13)%240,z=-230+(i*53.71)%360,s=.85+(i%7)*.1;
 const t=B.broadleafTree(x,z,s),again=B.broadleafTree(x,z,s);shapes.add(t.shape);
 assert.deepEqual(Array.from(t.leaves.getAttribute('position').array),Array.from(again.leaves.getAttribute('position').array),'same spot, same tree');
 assert.equal(t.shade.length,t.leaves.getAttribute('position').count*3,'one occlusion triple per vertex');
 assert(t.shade.every(v=>v>.35&&v<1.2),'occlusion in range');
 t.leaves.computeBoundingBox();const b=t.leaves.boundingBox;
 assert(Math.max(-b.min.x,b.max.x,-b.min.z,b.max.z)<=2.7*s,'canopy reach under 2.7 m a unit of scale (the ball: 1.8)');
 assert(Math.abs(t.top-b.max.y)<1e-6&&t.reach<=2.7*s,'top / reach size the tree asset');
 assert(b.max.y<=6.4*s&&b.min.y>=1.1*s,`canopy height ${b.min.y.toFixed(2)}..${b.max.y.toFixed(2)} (s ${s})`);
 // flat facets: the three normals of every triangle agree
 const N=t.leaves.getAttribute('normal').array;for(let k=0;k<N.length;k+=9)assert(Math.abs(N[k]-N[k+3])+Math.abs(N[k+1]-N[k+4])+Math.abs(N[k+2]-N[k+5])<1e-5,'flat normals');
 const low=B.broadleafTree(x,z,s,{low:true});assert(low.triangles<t.triangles,'low tier is cheaper');
 maxTri=Math.max(maxTri,t.triangles);sum+=t.triangles;n++;}
assert.equal(shapes.size,B.BROADLEAF_SHAPES.length,'every shape of the kit is planted');
assert(maxTri<=160,`at most 160 triangles a tree (was 104-120), got ${maxTri}`);
const bush=B.broadleafBush(3,4,.95);assert.equal(bush.shade.length,bush.leaves.getAttribute('position').count*3);
B.setBroadleafTrees(false);assert.equal(B.broadleafTreesOn(),false);
console.log(`broadleaf trees ok: ${shapes.size} shapes, ${(sum/n).toFixed(0)} triangles a tree on average (max ${maxTri}), bush ${bush.leaves.getAttribute('position').count/3}`);
})().catch(e=>{console.error(e);process.exit(1);});
