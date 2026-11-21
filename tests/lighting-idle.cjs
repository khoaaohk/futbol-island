const fs=require('fs'),vm=require('vm'),ts=require('typescript'),T=require('three'),assert=require('node:assert/strict');
const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/graphics/islandLighting.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,require});
const scene=new T.Scene();scene.background=new T.Color();const hemi=new T.HemisphereLight(),sun=new T.DirectionalLight(),renderer={toneMappingExposure:1};const lighting=m.exports.createIslandLighting(scene,hemi,sun,renderer);
let writes=0;for(const color of [scene.background,hemi.color,hemi.groundColor,sun.color]){const lerp=color.lerp;color.lerp=function(...args){writes++;return lerp.apply(this,args);};}
// Nov 21 2026 (zero-heat graphics batch 1, light ratio): day hemi 1.5 / sun 3.7 (was 1.6 / 3.4), sunset 1.3 / 3.45 (was 1.45 / 3.2), night hemi .9 with a
// bluer fill '8098c8' / '3c4660' (was 1.15, '9fb0cf' / '4a5163'): the numbers in lib/graphics/islandLighting.ts, intended.
lighting.update('day',0,true);assert.equal(scene.background.getHexString(),'a9d4ed');assert.equal(hemi.intensity,1.5);assert.equal(sun.intensity,3.7);assert.equal(renderer.toneMappingExposure,1);const initial=writes;for(let i=0;i<600;i++)lighting.update('day',1/30);assert.equal(writes,initial,'Settled lighting sleeps');
const day=scene.background.clone();lighting.update('night',1/30);assert(!scene.background.equals(day),'Mode changes wake lighting');assert(!scene.background.equals(new T.Color('#0d1830')),'Transition remains gradual');
for(let i=0;i<600;i++)lighting.update('night',1/30);assert(scene.background.equals(new T.Color('#0d1830')));assert.equal(renderer.toneMappingExposure,.98);assert.equal(hemi.intensity,.9);assert.equal(sun.intensity,.85);assert.equal(hemi.color.getHexString(),'8098c8');assert.equal(hemi.groundColor.getHexString(),'3c4660');assert.equal(sun.color.getHexString(),'a8bce6');const settledWrites=writes;for(let i=0;i<600;i++)lighting.update('night',1/30);assert.equal(writes,settledWrites);
lighting.update('sunset',0,true);assert(scene.background.equals(new T.Color('#efb477')),'Reduced motion switches immediately');assert.equal(hemi.intensity,1.3);assert.equal(sun.intensity,3.45);assert.equal(renderer.toneMappingExposure,1);lighting.update('day',0,true);assert.equal(hemi.intensity,1.5);assert.equal(sun.intensity,3.7);assert.equal(renderer.toneMappingExposure,1);

lighting.update('day',0,true);
for(let i=0;i<90;i++)lighting.update('night',1/30);
assert.equal(sun.intensity,.85,'lighting reaches exact target before the three-second menu sleep');
const menuWrites=writes;lighting.update('night',1/30);assert.equal(writes,menuWrites,'resuming a settled menu does not restart lighting work');
console.log('PASS lighting sleeps, wakes, smoothly transitions, honors immediate changes and settles before menu sleep');
