// Kicked vending machines (user, Sep 29 2026; simplified to shake + vibrate + thunk the same day; lib/graphics/vendingKick.ts):
// hit threshold, per-machine cooldown, shake lifetime, idle sleep, exact restore, and no flare/flicker/tips left over.
// usage: node tests/vending-kick.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path'),T=require('three');
const root=path.join(__dirname,'..');
const mod={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,'lib/graphics/vendingKick.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,
 {module:mod,exports:mod.exports,require:id=>require(id),Math,Number,String,Object,Array,Uint8Array,Float32Array,document:undefined});
const K=mod.exports;

// Two machines on the shared material, as vendingMachines.ts builds them (matrixAutoUpdate off, base at the feet).
const scene=new T.Scene(),material=new T.MeshStandardMaterial({color:'#ffffff'});
const size={w:1.69,d:1.118,h:2.756};
const machines=[{x:10,y:0,z:5,yaw:0},{x:-20,y:1,z:40,yaw:Math.PI/2}];
const entries=machines.map(m=>{const mesh=new T.Mesh(new T.BoxGeometry(1,1,1),material);mesh.position.set(m.x,m.y,m.z);mesh.rotation.y=m.yaw;mesh.updateMatrix();mesh.matrixAutoUpdate=false;scene.add(mesh);return {machine:m,mesh};});
const kick=K.createVendingKick({scene,entries,material,size,host:null});
const baseline=entries.map(e=>e.mesh.matrix.clone()),sceneChildren=scene.children.length;

// 1. Hit detection: the body (rotated footprint + height), not beside or above it.
assert.equal(kick.hitAt(10,1,5.5),0,'front face of machine 0');
assert.equal(kick.hitAt(10,1,5+size.d/2+.25),0,'ball touching the front (ball radius pad)');
assert.equal(kick.hitAt(10,size.h+2,5),-1,'a lob over the top does not count');
assert.equal(kick.hitAt(13,1,5),-1,'beside the machine');
assert.equal(kick.hitAt(-20+size.d/2+.2,2,40),1,'rotated machine: its side is the short axis');
assert.equal(kick.hitAt(-20+size.w/2+.2,2,40),-1,'rotated machine: the long axis runs along z');

// 2. Threshold: gentle touches (walking up to buy, a soft roll) never set it off.
for(const speed of [0,1,3.5,6,8.9,NaN])assert.equal(kick.kick(0,speed),false,'no reaction at '+speed+' m/s');
assert.equal(kick.kick(-1,40),false,'no machine, no reaction');
assert.equal(kick.active,false);
for(let i=0;i<30;i++)kick.update(1/60);
assert.equal(kick.stats.activeUpdates,0);assert.equal(kick.stats.transformWrites,0);
assert.ok(entries[0].mesh.matrix.equals(baseline[0]));

// 3. A shot sets it off: shake + vibrate, then idle again inside VENDING_KICK_TOTAL, restored exactly.
assert.equal(kick.kick(0,42),true,'a 42 m/s shot reacts');
assert.equal(kick.kick(0,60),false,'cooldown: a second hit straight away does nothing');
let moved=false,t=0;const dt=1/30;
while(t<1.5){kick.update(dt);t+=dt;if(!entries[0].mesh.matrix.equals(baseline[0]))moved=true;
 if(t>K.VENDING_KICK_TOTAL+.05)assert.equal(kick.active,false,'idle by '+K.VENDING_KICK_TOTAL+' s');}
assert.ok(moved,'the machine shook');
assert.ok(entries[0].mesh.matrix.equals(baseline[0]),'transform restored exactly');
assert.equal(entries[0].mesh.material,material,'material untouched (no flicker)');
assert.ok(entries[1].mesh.matrix.equals(baseline[1]),'the other machine never moved');
const writes=kick.stats.transformWrites;for(let i=0;i<60;i++)kick.update(dt);
assert.equal(kick.stats.transformWrites,writes,'no transform writes once idle');

// 4. Cooldown is per machine and runs on the effect clock; paused frames (dt=0) don't advance it.
assert.equal(kick.kick(1,30),true,'machine 1 has its own cooldown');
for(let i=0;i<60;i++)kick.update(0);
assert.equal(kick.kick(0,30),false,'paused frames do not count toward the cooldown');
for(let i=0;i<120;i++)kick.update(1/30);
assert.equal(kick.kick(0,30),true,'machine 0 ready again after its cooldown');
for(let i=0;i<60;i++)kick.update(1/30);assert.equal(kick.active,false);

// 5. Nothing added to the scene; no flare, flicker, bubble or tips remain.
assert.equal(scene.children.length,sceneChildren);
const src=fs.readFileSync(path.join(root,'lib/graphics/vendingKick.ts'),'utf8');
assert.doesNotMatch(src,/SHOOTING_TIPS|MeshBasicMaterial|createElement|bubble/,'the simplified kick has no flare, flicker or display text');

// 6. Reduced motion: no shake, still restores.
const calm=K.createVendingKick({entries,size});calm.kick(0,50);let calmMoved=false;
for(let i=0;i<40;i++){calm.update(1/30,undefined,true);if(!entries[0].mesh.matrix.equals(baseline[0]))calmMoved=true;}
assert.equal(calmMoved,false,'reduced motion: the machine does not shake');
kick.dispose();calm.dispose();
console.log('Vending kick: threshold, per-machine cooldown, shake/vibrate lifetime, idle sleep, exact restore, no flare/flicker/tips, reduced motion passed.');
