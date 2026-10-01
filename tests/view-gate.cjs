// View gate (heat audit Sep 30 2026, "only what's in view"): per render, static chunks and units whose sun-swept volume misses the
// camera frustum are hidden, everything else is untouched, and visibility is restored exactly (also after an exception).
const fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript'),T=require('three'),assert=require('node:assert/strict');
const load=file=>{const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,require});return m.exports;};
const {createViewGate}=load('lib/graphics/viewGate.ts');
const scene=new T.Scene(),sun=new T.DirectionalLight();sun.position.set(-20,20,0);sun.target.position.set(0,0,0);scene.add(sun,sun.target);
const camera=new T.PerspectiveCamera(50,1,.1,400);camera.position.set(0,10,20);camera.lookAt(0,0,0);camera.updateMatrixWorld();
const chunk=(name,x,z,h=1)=>{const g=new T.BoxGeometry(4,h,4);g.translate(x,h/2,z);const m=new T.Mesh(g,new T.MeshBasicMaterial());m.name=name;m.matrixAutoUpdate=false;scene.add(m);return m;};
const near=chunk('island-chunk-0:0:a:true',0,0),nearB=chunk('island-chunk-0:0:b:false',1,1),far=chunk('island-chunk-6:0:a:true',300,0);
// out of view up-sun, but a 30 m tower whose shadow falls into the view: must stay (as the shadow culling keeps it)
const tower=chunk('island-chunk--1:0:a:true',-40,0,30),lowUpSun=chunk('island-chunk--2:0:a:true',-60,0,1);
const appHidden=chunk('island-chunk-6:1:a:true',300,60);appHidden.visible=false;
const other=new T.Mesh(new T.BoxGeometry(),new T.MeshBasicMaterial());other.name='not-a-chunk';other.position.set(300,0,0);scene.add(other);
const folk=new T.Group();folk.name='island-townsfolk';scene.add(folk);
const rig=(x,z)=>{const g=new T.Group();g.position.set(x,0,z);const body=new T.Mesh(new T.BoxGeometry(.6,1.8,.4),new T.MeshBasicMaterial());body.position.y=.9;g.add(body);folk.add(g);return g;};
const inView=rig(2,0),edge=rig(-14,0),away=rig(0,300),upSun=rig(-40,0);scene.updateMatrixWorld(true);
let seen=null,fail=false;const renderer={render(s,c){seen=s===scene?{near:near.visible,nearB:nearB.visible,far:far.visible,tower:tower.visible,lowUpSun:lowUpSun.visible,appHidden:appHidden.visible,other:other.visible,inView:inView.visible,edge:edge.visible,away:away.visible,upSun:upSun.visible}:'other-scene';if(fail)throw Error('render failure');}};
const original=renderer.render,gate=createViewGate(renderer,scene,sun);gate.addUnitRoots([folk]);
assert.equal(gate.stats.regions,5,'one region per 50 m chunk key');
renderer.render(scene,camera);
assert.deepEqual(seen,{near:true,nearB:true,far:false,tower:true,lowUpSun:false,appHidden:false,other:true,inView:true,edge:true,away:false,upSun:false},
 'off-view chunks and units hidden for the render; in-view ones and casters whose shadow reaches the view kept; non-chunks untouched');
assert.equal(gate.stats.chunks,2);assert.equal(gate.stats.units,2);
assert(far.visible&&lowUpSun.visible&&away.visible&&upSun.visible,'visibility restored after the render');
assert.equal(appHidden.visible,false,'an object the app hid stays hidden (never restored to visible)');
fail=true;assert.throws(()=>renderer.render(scene,camera));assert(far.visible&&away.visible,'restored after an exception');fail=false;
renderer.render(new T.Scene(),camera);assert.equal(seen,'other-scene');assert.equal(gate.stats.chunks,0,'other scenes pass straight through');
away.position.set(1,0,1);renderer.render(scene,camera);assert.equal(seen.away,true,'a unit that walks into view is drawn the same frame');
camera.position.set(300,10,20);camera.lookAt(300,0,0);renderer.render(scene,camera);assert.equal(seen.far,true,'turning the camera shows the far chunk at once');assert.equal(seen.near,false);
sun.position.set(20,20,0);camera.position.set(0,10,20);camera.lookAt(0,0,0);renderer.render(scene,camera);assert.equal(seen.tower,false,'sweeps follow a new sun direction');
gate.setEnabled(false);renderer.render(scene,camera);assert(seen.far&&seen.tower&&seen.away!==false,'disabled: the full scene renders');
gate.dispose();assert.equal(renderer.render,original,'dispose restores render');
// Town wiring and the world's empty-group prune
const town=fs.readFileSync(path.join(__dirname,'..','components/Town.tsx'),'utf8');
assert.match(town,/createViewGate\(renderer,scene,sun\);viewGate\.addUnitRoots\(\[islandNpcs\.root,streetTraffic\.root,coinHunt\.root\]\)/,'Town gates townsfolk, traffic and ball-hunt spots');
assert.match(town,/viewGate\.dispose\(\)/);
assert.match(fs.readFileSync(path.join(__dirname,'..','lib/town/world.ts'),'utf8'),/o\.type==='Group'&&!o\.name&&empty\(o\)\)\{o\.removeFromParent\(\)/,'world prunes only unnamed, fully empty groups');
assert.match(fs.readFileSync(path.join(__dirname,'..','lib/graphics/islandNpcs.ts'),'utf8'),/o\.geometry=RELEASED;o\.matrixAutoUpdate=false;o\.matrixWorldAutoUpdate=false;/,'released townsfolk meshes freeze their matrices');
console.log('PASS view gate: off-view chunks/units hidden per render, shadow-reaching casters kept, exact restoration, wiring');
