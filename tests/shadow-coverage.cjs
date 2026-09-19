const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),T=require('three');
const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/graphics/islandShadows.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,require,Math});
for(const aspect of [390/844,1.25,2,2.4])for(const elevation of [0,8,28,32]){
 const camera=new T.PerspectiveCamera(40,aspect,.1,500);camera.position.set(18,23+elevation,30);camera.lookAt(2,elevation,-3);camera.updateMatrixWorld();
 const scene=new T.Scene(),light=new T.DirectionalLight();scene.add(light,light.target);light.position.set(-288,252,198);m.exports.fitIslandShadows(light,camera,elevation);scene.updateMatrixWorld(true);light.shadow.updateMatrices(light);
 for(const x of [-1,0,1])for(const y of [-1,0,1])for(const floor of [-8,0]){
  const ray=new T.Vector3(x,y,.5).unproject(camera).sub(camera.position).normalize();const ground=camera.position.clone().addScaledVector(ray,(floor-camera.position.y)/ray.y);
  for(const height of [floor,24]){const projected=new T.Vector3(ground.x,height,ground.z).project(light.shadow.camera);assert.ok(Math.abs(projected.x)<=1&&Math.abs(projected.y)<=1&&Math.abs(projected.z)<=1,`Shadow clipping at aspect${aspect}: ${projected.toArray()}`);}
 }
}
console.log('Shadow coverage: full visible ground and tall casters, portrait through ultrawide passed.');
