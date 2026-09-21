const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
function load(file){const mod={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:mod.exports,module:mod,Math,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});return mod.exports;}
const {truckHitsCharacter,truckGoalClear,TRUCK_GOALS}=load('lib/town/truckCollisions.ts');
assert(truckHitsCharacter({x:0,z:0},{x:0,z:4},0,{x:0,y:.1,z:2}),'boost swept impact');
assert(truckHitsCharacter({x:0,z:4},{x:0,z:0},0,{x:0,y:.1,z:2}),'reverse impact');
assert(truckHitsCharacter({x:0,z:0},{x:4,z:0},Math.PI/2,{x:2,y:.1,z:0}),'sideways heading');
assert(!truckHitsCharacter({x:0,z:0},{x:0,z:4},0,{x:2,y:.1,z:2}),'nearby pedestrian clear');
assert(!truckHitsCharacter({x:0,z:0},{x:0,z:4},0,{x:0,y:6,z:2}),'roof player unaffected');
assert.equal(TRUCK_GOALS.length,6,'rooftop futsal goals excluded');
for(const g of TRUCK_GOALS)for(const yaw of [0,Math.PI/2,Math.PI/4]){assert(!truckGoalClear(g.x,g.z,yaw));assert(truckGoalClear(g.x+g.w/2+4,g.z,yaw));}
console.log('PASS swept boost/reverse/turn truck impacts, vertical separation, all ground goals block truck');
const {rideHitsCharacter}=load('lib/town/truckCollisions.ts');
for(const kind of ['scooter','bike','moped']){
 assert(rideHitsCharacter({x:0,z:0},{x:0,y:0,z:4},0,{x:0,y:.1,z:2},kind),kind+' swept contact');
 assert(rideHitsCharacter({x:0,z:4},{x:0,y:0,z:0},0,{x:0,y:.1,z:2},kind),kind+' reverse contact');
 assert(!rideHitsCharacter({x:0,z:0},{x:0,y:0,z:4},0,{x:1.1,y:.1,z:2},kind),kind+' narrow footprint');
 assert(!rideHitsCharacter({x:0,z:0},{x:0,y:0,z:4},0,{x:0,y:6,z:2},kind),kind+' vertical separation');
 assert(rideHitsCharacter({x:0,z:0},{x:0,y:6,z:4},0,{x:0,y:6.1,z:2},kind),kind+' same roof contact');
 assert(!rideHitsCharacter({x:0,z:0},{x:0,y:0,z:100},0,{x:0,y:.1,z:50},kind),kind+' teleport excluded');
}
console.log('PASS scooter/bike/moped swept contact, reverse, narrow footprint, roof separation and teleport guard');
