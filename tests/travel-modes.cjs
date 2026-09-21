const assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
function load(file){const mod={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:mod.exports,module:mod,Math,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});return mod.exports;}
const {stepPlayer}=load('lib/town/simulation.ts'),{TRAVEL_MODES}=load('lib/town/travelModes.ts');
let prior=0;
for(const mode of Object.keys(TRAVEL_MODES)){
 const p={x:0,z:0},v={x:0,z:0};
 for(let i=0;i<240;i++)stepPlayer(p,v,{x:1,z:0,sprint:false},1/60,[],mode);
 assert.ok(v.x>prior,mode+' has a higher cruising speed');prior=v.x;
 assert.ok(Math.abs(v.x-TRAVEL_MODES[mode].maxSpeed)<.001,mode+' approaches configured speed');
 if(mode!=='walk'){for(let i=0;i<120;i++)stepPlayer(p,v,{x:1,z:0,sprint:true},1/60,[],mode);assert.ok(v.x<=TRAVEL_MODES[mode].maxSpeed+.001,'Riding does not get extra sprint boost');}
 for(let i=0;i<120;i++)stepPlayer(p,v,{x:0,z:0,sprint:false},1/60,[],mode);
 assert.ok(Math.hypot(v.x,v.z)<.001,mode+' stops after releasing input');
}
const p={x:0,z:0},v={x:11,z:2};
stepPlayer(p,v,{x:1,z:.2,sprint:false},.25,[{x:1,z:0,w:.02,d:10}],'moped');
assert.ok(p.x<.68,'Fast moped cannot tunnel through a thin fence');assert.ok(p.z>0,'Rider slides along obstacle');
const {createPlayer}=load('lib/graphics/player.ts'),{createVehicle}=load('lib/graphics/vehicle.ts');
const player=createPlayer('ride-test','home'),vehicle=createVehicle();
// Town renders all ground vehicles at 1.12 while the rider remains unit scale.
vehicle.root.scale.setScalar(1.12);
for(const mode of Object.keys(TRAVEL_MODES)){
 player.update(0,0,1/60,0,true,{travelMode:mode});vehicle.update(mode,0,0,player.root.rotation.y,1/60,4);
 for(const root of [player.root,vehicle.root])root.traverse(n=>assert.ok([...n.position,...n.quaternion].every(Number.isFinite),'Finite ride geometry'));
 assert.equal(vehicle.root.visible,mode!=='walk');
 if(mode!=='walk'){
   assert.equal(vehicle.root.children.filter(n=>n.visible).length,1,'Only selected ride is visible');
   if(mode==='jetpack'){assert.equal(vehicle.root.getObjectByName('jetpack').visible,true);continue;}
   player.root.updateMatrixWorld(true);
   const torso=player.root.children[0].children[0];
   const shoulders=torso.children.filter(n=>n.type==='Group'&&Math.abs(n.position.x)>.2);
   vehicle.root.updateMatrixWorld(true);
   const ride=vehicle.root.getObjectByName(mode);
   const handlebar=ride.children.find(n=>n.isMesh&&Math.abs(n.position.y-(mode==='scooter'?1.25:1.13))<1e-6&&Math.abs(n.position.z-.48)<1e-6&&Math.abs(n.position.x)<1e-6);
   assert(handlebar,'Actual vehicle handlebar exists');
   const grip=player.root.worldToLocal(handlebar.getWorldPosition(new (require('three').Vector3)()));
   for(const shoulder of shoulders){const elbow=shoulder.children.find(n=>n.type==='Group');const hand=player.root.worldToLocal(elbow.localToWorld(new (require('three').Vector3)(0,-.255,0)));assert.ok(Math.hypot(hand.y-grip.y,hand.z-grip.z)<.025,mode+' rider hands reach rendered handlebars');}
 }
}
player.dispose();vehicle.dispose();console.log('Travel modes: increasing speeds, no turbo, braking, swept fence collision, pose and visibility passed.');
