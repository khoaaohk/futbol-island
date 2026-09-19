const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),cache=new Map();
function load(file){if(cache.has(file))return cache.get(file);const mod={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:mod.exports,module:mod,Math,console,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):req(id)});cache.set(file,mod.exports);return mod.exports;}
const {createPlayer}=load(base+'/lib/graphics/player.ts'),{CLUB_COSTUMES}=load(base+'/lib/town/costumes.ts'),{DEFAULT_CUSTOMIZATION:D}=load(base+'/lib/town/customization.ts');
const crypto=require('node:crypto'),seen=new Map();let maxMeshes=0,maxTriangles=0;
for(const id of [...CLUB_COSTUMES.map(c=>c.id),'matchday-fox']){
 for(const character of ['male','female']){
  const rig=createPlayer('head-review','home');rig.setAppearance({...D,character,costume:id});
  const head=rig.root.getObjectByName('player-head'),group=head.children.find(n=>n.userData.costumeId===id);
  assert(group,'head attachment '+id);assert.equal(group.position.y,.26,'shoulder clearance offset preserved');
  assert.deepEqual(group.scale.toArray(),[2.3203125,2.1796875,2.25],'oversized head scale preserved');
  assert(group.children.length<=5,'at most original five head material draws');
  const hash=crypto.createHash('sha256');let triangles=0,meshes=0;
  for(const mesh of group.children){const p=mesh.geometry.getAttribute('position');hash.update(Buffer.from(p.array.buffer));for(const value of p.array)assert(Number.isFinite(value));}
  const signature=hash.digest('hex');if(character==='male'){assert(!seen.has(signature),id+' must have a distinct head shape, without relying on color');seen.set(signature,id);}
  rig.root.traverse(n=>{if(n.isMesh&&n.userData.costumeId===id){meshes++;triangles+=n.geometry.getAttribute('position').count/3;}});
  maxMeshes=Math.max(maxMeshes,meshes);maxTriangles=Math.max(maxTriangles,triangles);
  const cached=group;rig.setAppearance({...D,character,costume:id});assert.equal(head.children.find(n=>n.userData.costumeId===id),cached);
  for(const travelMode of ['walk','bike','moped','scooter','jetpack']){rig.update(2,3,.016,1,false,{travelMode});rig.root.updateWorldMatrix(true,true);rig.root.traverse(n=>assert(n.matrixWorld.elements.every(Number.isFinite)));}
  rig.dispose();assert.equal(group.parent,null,'head disposed');
 }
}
assert.equal(seen.size,24);console.log('PASS 24 palette-independent head shapes; male/female, all ride transforms, cached geometry, existing scale/offset, dispose. Max',maxMeshes,'meshes /',maxTriangles,'triangles per costume');
