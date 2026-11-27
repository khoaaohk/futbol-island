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
 const sz=B.treeSize(x,z);/* soft sweep Nov 27 2026: per-spot height / crown variety */assert(Math.max(-b.min.x,b.max.x,-b.min.z,b.max.z)<=2.7*s*sz.height*sz.crown,'canopy reach under 2.7 m a unit of scale (the ball: 1.8)');
 assert(Math.abs(t.top-b.max.y)<1e-6&&t.reach<=2.7*s*sz.height*sz.crown,'top / reach size the tree asset');
 assert(b.max.y<=6.4*s*sz.height&&b.min.y>=1.1*s*sz.height,`canopy height ${b.min.y.toFixed(2)}..${b.max.y.toFixed(2)} (s ${s})`);
 // flat facets: the three normals of every triangle agree
 const N=t.leaves.getAttribute('normal').array;for(let k=0;k<N.length;k+=9)assert(Math.abs(N[k]-N[k+3])+Math.abs(N[k+1]-N[k+4])+Math.abs(N[k+2]-N[k+5])<1e-5,'flat normals');
 const low=B.broadleafTree(x,z,s,{low:true});assert(low.triangles<t.triangles,'low tier is cheaper');
 maxTri=Math.max(maxTri,t.triangles);sum+=t.triangles;n++;}
assert.equal(shapes.size,B.BROADLEAF_SHAPES.length,'every shape of the kit is planted');
assert(maxTri<=160,`at most 160 triangles a tree (was 104-120), got ${maxTri}`);
const bush=B.broadleafBush(3,4,.95);assert.equal(bush.shade.length,bush.leaves.getAttribute('position').count*3);
// Leftovers B (Nov 26 2026 night): soft bushes, pine tiers and hedge clumps: tagged foliage (roof-landing / canopySurfaces NOT_ROOF reads
// 'Icosahedron' in the type), the same at the same spot, occlusion per vertex, the cheap low tier, and inside the old envelopes.
const NOT_ROOF=/Sphere|Icosahedron|Dodecahedron|Octahedron|Tetrahedron|Torus|Tube|Plane|Circle|Ring|Capsule|Lathe/,same=(a,b)=>assert.deepEqual(Array.from(a.getAttribute('position').array),Array.from(b.getAttribute('position').array),'same spot, same shape');
const kinds={bush:(x,z,o)=>B.broadleafBush(x,z,.95,{soft:true,...o}),planter:(x,z,o)=>B.broadleafBush(x,z,1,{soft:true,lobes:B.PLANTER_LOBES,...o}),ramp:(x,z,o)=>B.broadleafBush(x,z,.7,{soft:true,lobes:B.RAMP_BUSH_LOBES,stretch:[.85,1.9,.95],...o}),
 cayPair:(x,z,o)=>B.broadleafBush(x,z,1,{soft:true,lobes:B.CAY_PAIR_LOBES,...o}),cayTrio:(x,z,o)=>B.broadleafBush(x,z,1,{soft:true,lobes:B.CAY_TRIO_LOBES,...o}),pine:(x,z,o)=>B.pineTiers(x,z,1.1,o)};
const tri={};for(const [k,f] of Object.entries(kinds))for(let i=0;i<40;i++){const x=-300+i*13.7,z=-100+i*9.1,a=f(x,z,{}),b=f(x,z,{}),lo=f(x,z,{low:true});
 assert.match(a.leaves.type,NOT_ROOF,k+' is foliage to the landing code');assert.match(lo.leaves.type,NOT_ROOF);same(a.leaves,b.leaves);
 assert.equal(a.shade.length,a.leaves.getAttribute('position').count*3,k+' occlusion per vertex');assert(a.shade.every(v=>v>.3&&v<1.2),k+' occlusion range');
 assert(lo.triangles<a.triangles,k+' low tier is cheaper');tri[k]=a.triangles;}
{const p=B.pineTiers(5,6,1),sz=B.treeSize(5,6);p.leaves.computeBoundingBox();const b=p.leaves.boundingBox;assert(b.min.y>=1.6*sz.height&&b.max.y<=6.15*sz.height&&Math.max(-b.min.x,b.max.x,-b.min.z,b.max.z)<=1.95*sz.height*sz.crown,'pine inside the old cone (r 1.6, y 1.9..6.1) at its own size (soft sweep: rim droop to 1.6)');
 assert(p.triangles<=72,'pine: at most 72 triangles (soft sweep Nov 27 2026: rounded tiers, 3 x 24; was 48), got '+p.triangles);}
{const r=B.broadleafBush(55,-20,.7,{soft:true,lobes:B.RAMP_BUSH_LOBES,stretch:[.85,1.9,.95]});r.leaves.computeBoundingBox();const b=r.leaves.boundingBox;assert(b.max.y+1.55<=3.2&&b.min.y+1.55>=-.1&&b.max.x-b.min.x<=1.6,'ramp bush keeps its envelope (the jump clears it)');}
{const h=B.hedgeClump(3),h2=B.hedgeClump(3);assert.match(h.type,NOT_ROOF);same(h,h2);assert.equal(h.getAttribute('position').count/3,6);/* six-sided pyramid: blunt swells (paths-junctions) */}
console.log('  new kinds (tris):',JSON.stringify(tri));
B.setBroadleafTrees(false);assert.equal(B.broadleafTreesOn(),false);
console.log(`broadleaf trees ok: ${shapes.size} shapes, ${(sum/n).toFixed(0)} triangles a tree on average (max ${maxTri}), bush ${bush.leaves.getAttribute('position').count/3}`);
})().catch(e=>{console.error(e);process.exit(1);});
