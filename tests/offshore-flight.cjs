const assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
function load(file){const mod={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:mod.exports,module:mod,Math,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});return mod.exports;}
const {stepPlayer,flightBlocked,blocked,FLIGHT_BOUNDS}=load('lib/town/simulation.ts');
const {createRooftopTravel}=load('lib/town/rooftopTravel.ts');
const landing=createRooftopTravel([],[],{x:0,z:0});
for(const [x,z,dx,dz] of [[-80,0,-1,0],[225,0,1,0],[60,-220,0,-1],[160,200,0,1]]){
 const p={x,z},v={x:0,z:0};let crossed=false;
 for(let i=0;i<1200;i++){stepPlayer(p,v,{x:dx,z:dz,sprint:false},1/60,[],'jetpack');if(blocked(p.x,p.z,[],0))crossed=true;assert(!flightBlocked(p.x,p.z));}
 assert(crossed,'can fly offshore on every coast');assert(blocked(p.x,p.z,[],0),'outer flight edge is water');
 assert(flightBlocked(p.x+dx,p.z+dz),'flight stops at expanded boundary');
 const safe=landing.findLanding(p.x,p.z);assert(safe&&landing.canLand(safe.x,safe.z),'safe shore remains within landing range');
 const ground={x,z},gv={x:0,z:0};for(let i=0;i<1200;i++)stepPlayer(ground,gv,{x:dx,z:dz,sprint:true},1/60,[],'walk');assert(!blocked(ground.x,ground.z,[],0),'walking stays on land');
}
assert(flightBlocked(FLIGHT_BOUNDS.maxX+10,0));
console.log('PASS offshore flight on four coasts, outer boundary, safe shore landing, walking coastline');
