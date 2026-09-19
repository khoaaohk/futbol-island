const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
function load(file){const mod={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:mod.exports,module:mod,Math,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});return mod.exports;}
const {createRooftopTravel}=load('lib/town/rooftopTravel.ts'),{VENUES}=load('lib/town/venues.ts'),{goalBarriersAt}=load('lib/town/goalCollisions.ts');
let cases=0;
for(const venue of VENUES)for(const end of [-1,1])for(const mode of ['walk','scooter','bike','moped']){
 const front=venue.z+end*venue.length/2,back=front+end*1.4;
 function run(x,z,dx,dz){const p={x,z},velocity={x:0,z:0},travel=createRooftopTravel([],[],p);for(let i=0;i<30;i++)travel.update(.2,p,velocity,{x:dx,z:dz,sprint:true},mode);cases++;return {p,travel,velocity};}
 const entering=run(venue.x,front-end*2,0,end);assert((entering.p.z-front)*end>0,venue.id+' mouth remains open for '+mode);assert((entering.p.z-back)*end<0,'Rear net stops exit from inside');
 for(let i=0;i<20;i++)entering.travel.update(.1,entering.p,entering.velocity,{x:0,z:-end,sprint:true},mode);assert((entering.p.z-front)*end<0,'Can return through the mouth');
 const rear=run(venue.x,back+end*1,0,-end);assert((rear.p.z-back)*end>0,'Rear net stops entry from outside');
 for(const hand of [-1,1]){
  const postX=venue.x+hand*venue.goalWidth/2;
  const post=run(postX,front-end*2,0,end);assert((post.p.z-front)*end<0,'Front post is solid');
  const side=run(postX+hand*2,front+end*.7,-hand,0);assert((side.p.x-postX)*hand>0,'Side net is solid');
 }
 assert(!entering.travel.canLand(venue.x,back),'Cannot land on rear net');
}
assert.equal(goalBarriersAt(28).length,0,'Flight above goals is clear');assert(goalBarriersAt(0).every(b=>b.floor<1),'Rooftop goals do not block street level');assert(goalBarriersAt(6.105).every(b=>b.floor>6),'Rooftop goal collision is active on the court');
console.log('PASS',cases,'goal approaches across all eight goals and four ground modes, open-mouth return, landing clearance and elevation');
