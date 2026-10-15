const assert=require('node:assert/strict'),T=require('three');
const {createLoader,browser}=require('./summit-harness.cjs');browser();
const S=createLoader()('lib/graphics/islandShadows.ts');
// Flat ground at several heights (the Oct 14 2026 fit follows the real ground; before it, an "elevation" camera was checked against
// y = 0 only, which is how Summit Isle's 50 m terrace slipped out of the box). tests/shadow-fit.cjs covers the real terrain.
for(const aspect of [390/844,1.25,2,2.4])for(const elevation of [0,8,28,32,50]){
 const camera=new T.PerspectiveCamera(40,aspect,.1,500);camera.position.set(18,23+elevation,30);camera.lookAt(2,elevation,-3);camera.updateMatrixWorld();
 const scene=new T.Scene(),light=new T.DirectionalLight();scene.add(light,light.target);S.createIslandShadowFit(light,()=>elevation).update(camera);scene.updateMatrixWorld(true);light.shadow.updateMatrices(light);
 for(const x of [-1,0,1])for(const y of [-1,0,1]){
  const ray=new T.Vector3(x,y,.5).unproject(camera).sub(camera.position).normalize();const ground=camera.position.clone().addScaledVector(ray,(elevation-camera.position.y)/ray.y);
  for(const height of [elevation,elevation+24]){const projected=new T.Vector3(ground.x,height,ground.z).project(light.shadow.camera);assert.ok(Math.abs(projected.x)<=1&&Math.abs(projected.y)<=1&&Math.abs(projected.z)<=1,`Shadow clipping at aspect ${aspect} elevation ${elevation}: ${projected.toArray()}`);}
 }
}
console.log('Shadow coverage: full visible ground and tall casters at any ground height, portrait through ultrawide passed.');
