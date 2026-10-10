// Arcade stage teardown (Oct 9 2026 QA). Every arcade game (tennis, pinball, runner, Strikers, Pass Puzzles) builds its renderer
// with lib/arcade/arcadeStage.ts. A heap snapshot after leaving a game showed its WebGL2 context kept alive by shared bean
// resources: beanSkin's module-level face/shirt-digit atlases (BeanMaterial.beanUniforms.*.value) hold one 'dispose' listener per
// renderer that uploaded them, and the shared bean body/limb geometries key that renderer's buffers. One live context (plus its
// GPU textures and shadow map) leaked per game visit (also via three's shared Sprite geometry and runnerTrack's shared depth material); Chrome logs "Too many active WebGL contexts" after ~16 visits.
// The fix: dispose() walks the scene BEFORE the rigs detach their meshes, and disposes every texture its materials reference,
// including uniform holders. Browser check: scratchpad ctxprobe.cjs (detached stage canvases are garbage-collected).
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const src=fs.readFileSync(path.join(__dirname,'../lib/arcade/arcadeStage.ts'),'utf8');
const body=src.slice(src.indexOf('function dispose(){'),src.indexOf('return{resetPlayers'));
assert.ok(body.length>0,'dispose() found');
const walk=body.indexOf('scene.traverse('),rigs=body.indexOf('for(const rig of islandPlayers)rig.dispose()');
assert.ok(walk>=0&&rigs>walk,'the scene walk runs before the rigs dispose (their shared bean geometries are collected)');
assert.match(body,/isTexture/,'textures referenced by the materials are collected');
assert.match(body,/\.value\)/,'uniform holders ({name:{value:texture}}, e.g. BeanMaterial.beanUniforms) are searched');
assert.match(body,/textures\.forEach\(t=>t\.dispose\(\)\)/,'and disposed');
assert.ok(body.indexOf('textures.forEach(t=>t.dispose())')<body.indexOf('renderer.dispose()'),'before the renderer itself');
assert.match(body,/o instanceof T\.Sprite/,"sprites are walked (three's Sprite geometry is one module-level BufferGeometry)");
assert.match(body,/customDepthMaterial/,'shadow-pass materials (e.g. runnerTrack bend depth material) are collected');
// Pass Puzzles builds its players outside the stage: the stage must be disposed while they are still in the scene.
const pp=fs.readFileSync(path.join(__dirname,'../lib/arcade/passPuzzleScene.ts'),'utf8'),ppd=pp.slice(pp.lastIndexOf('function dispose(){'));
const sd=ppd.indexOf('stage.dispose()'),rd=ppd.indexOf('rig.dispose()');
assert.ok(sd>=0&&rd>sd,'passPuzzleScene disposes the stage before its pooled rigs detach their meshes');
// BeanMaterial still exposes its shared atlases through beanUniforms (what the walk relies on).
const bean=fs.readFileSync(path.join(__dirname,'../lib/graphics/beanSkin.ts'),'utf8');
assert.match(bean,/beanUniforms:BeanUniforms=/,'BeanMaterial.beanUniforms');
assert.match(bean,/beanFace:\{value:kind==='body'\?beanFaceAtlas\(\):null\}/,'face atlas is a uniform value');
console.log('PASS arcade stage dispose: shared bean textures and geometries are released with each game renderer');
