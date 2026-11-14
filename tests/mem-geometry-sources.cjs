// Memory pass (QA Nov 14 2026, round 4, heap snapshot at a phone viewport): ~325 MB of ArrayBuffers with only ~95 MB of geometry in
// the scene. Three holders of CPU-side geometry that is never drawn again were let go:
// 1. lib/town/world.ts static batching kept every piece's world-space clone (batch.geometries, ~22k) and the original meshes it
//    replaced reachable after the merge (~70 MB). The lists are cleared once the vertex runs (kick reactions, gashapon) are built.
// 2. createPlayer kept the source parts batchRigidMeshes merged away (~12 per rig) in its dispose list.
// 3. islandNpcs / remoteAvatars release a bean rig's hidden classic body for one empty geometry, but the rig's dispose list still
//    held the old geometries (~0.3 MB per townsperson / friend). forgetRigGeometry() drops them from the list.
// Nothing that reads geometry later changes: the merged chunk buffers (raycasts, prop reactions, gashapon runs) are untouched.
// usage: node tests/mem-geometry-sources.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),ts=require('typescript'),T=require('three');
const ROOT=path.join(__dirname,'..'),loaded=new Map();
function load(file){file=path.resolve(ROOT,file);if(loaded.has(file))return loaded.get(file);const m={exports:{}};loaded.set(file,m.exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,
  {module:m,exports:m.exports,Math,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+(fs.existsSync(path.resolve(path.dirname(file),id+'.ts'))?'.ts':'.tsx'))):require(id)});
 loaded.set(file,m.exports);return m.exports;}
let n=0;const t=(name,fn)=>{try{fn();n++;}catch(e){console.error('FAIL',name);throw e;}};
const CS=load('lib/graphics/characterStyle.ts'),P=load('lib/graphics/player.ts'),BM=load('lib/graphics/batchMeshes.ts');
const inTree=root=>{const s=new Set();root.traverse(o=>{if(o.geometry)s.add(o.geometry);});return s;};
/** Every geometry rig.dispose() disposes. */
function disposedBy(rig){const seen=new Set(),orig=T.BufferGeometry.prototype.dispose;T.BufferGeometry.prototype.dispose=function(){seen.add(this);return orig.call(this);};try{rig.dispose();}finally{T.BufferGeometry.prototype.dispose=orig;}return seen;}

t('batchRigidMeshes reports the source geometries it took out of the tree',()=>{
 const g=new T.Group(),m=new T.MeshStandardMaterial(),a=new T.Mesh(new T.BoxGeometry(),m),b=new T.Mesh(new T.SphereGeometry(1,8,6),m),c=new T.Mesh(new T.BoxGeometry(),new T.MeshStandardMaterial());g.add(a,b,c);
 const removed=[],owned=BM.batchRigidMeshes(g,removed);
 assert.equal(owned.length,1);assert.deepEqual(new Set(removed),new Set([a.geometry,b.geometry]));assert.equal(c.parent,g,'a lone material stays');
 assert.equal(BM.batchRigidMeshes(new T.Group()).length,0,'the second argument is optional');
});
for(const style of ['classic','bean'])t(`${style} rig: the dispose list holds no geometry outside the rig (merged-away parts let go)`,()=>{
 CS.setCharacterStyle(style);const rig=P.createPlayer('mem-'+style,'home',true);CS.setCharacterStyle(undefined);
 const tree=inTree(rig.root),gone=disposedBy(rig);
 const outside=[...gone].filter(g=>!tree.has(g)&&!(g.name||'').length);
 // shared spine surfaces (acquireSpineSurfaces) and the shirt-number panel may be outside the tree; merged-away parts (position counts of
 // the classic primitives) must not be.
 assert.ok(outside.length<=4,`${outside.length} geometries outside the tree in the dispose list`);
 // the merged joint meshes are drawn: every merged geometry in the tree is disposed with the rig
 for(const g of tree)if(g.getAttribute('position')&&!g.index&&g.getAttribute('position').count>300)assert.ok(gone.has(g),'merged joint geometry still disposed with the rig');
});
t('forgetRigGeometry: a released classic part is no longer held (or disposed again) by its rig',()=>{
 CS.setCharacterStyle('bean');const rig=P.createPlayer('mem-release','home',true);CS.setCharacterStyle(undefined);
 const EMPTY=new T.BufferGeometry(),released=[];
 rig.root.traverse(o=>{if(o.isMesh&&o.userData.beanHidden){released.push(o.geometry);o.geometry.dispose();P.forgetRigGeometry(rig.root,o.geometry);o.geometry=EMPTY;}});
 assert.ok(released.length>20,'a bean rig hides its classic body');
 const gone=disposedBy(rig);for(const g of released)assert.ok(!gone.has(g),'released geometry left the list');
 P.forgetRigGeometry(new T.Group(),EMPTY);// unknown root: no-op
});
t('the island bridges call forgetRigGeometry where they release hidden classic parts',()=>{
 for(const f of ['lib/graphics/islandNpcs.ts','lib/graphics/remoteAvatars.ts']){const s=fs.readFileSync(path.join(ROOT,f),'utf8');
  assert.match(s,/o\.geometry\.dispose\(\);forgetRigGeometry\(root,o\.geometry\);o\.geometry=RELEASED;/,f);}
});
t('world.ts: the static batching source lists are cleared after the last reader',()=>{
 const s=fs.readFileSync(path.join(ROOT,'lib/town/world.ts'),'utf8');
 const clear=s.indexOf('for(const batch of batches.values())batch.geometries.length=0;batches.clear();original.length=0;propRecords.clear();gashaponPieces.clear();');
 assert.ok(clear>0,'cleared');
 const last=Math.max(s.lastIndexOf('of gashaponPieces'),s.lastIndexOf('of propRecords'),s.lastIndexOf('batch.geometries['),s.lastIndexOf('of original'));
 assert.ok(last<clear,'no reader after the clear');
 assert.ok(!/\b(batches|original|propRecords|gashaponPieces)\b[.[)]|of (batches|original|propRecords|gashaponPieces)\b/.test(s.slice(clear+200,s.indexOf('\nexport',clear)>0?s.indexOf('\nexport',clear):undefined)),'none used later in buildTown');
 assert.match(s,/mesh\.userData\.pieces=\{starts:batch\.starts,kinds:batch\.kinds\}/,'the merged chunks keep their own starts / kinds');
});
console.log(`mem-geometry-sources: ${n} checks passed`);
