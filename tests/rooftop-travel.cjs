const assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
function load(file){const mod={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:mod.exports,module:mod,Math,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});return mod.exports;}
const {createRooftopTravel,ROOF_RECOVERY_TIME,ROOF_HANG_TIME}=load('lib/town/rooftopTravel.ts');
const roof={x:70,z:-30,w:12,d:12,height:10};
for(const mode of ['walk','scooter','bike','moped']){
 const p={x:70,z:-30},v={x:0,z:0},travel=createRooftopTravel([roof],[roof],p);
 assert.equal(travel.canLand(70,-30),true);
 travel.reset(p.x,p.z);assert.equal(travel.state.height,10);
 let fell=false,impact=false,hangFrames=0;
 for(let i=0;i<500;i++){
  travel.update(1/60,p,v,{x:1,z:0,sprint:false},mode);
  if(travel.state.hangTime>0){hangFrames++;assert.equal(travel.state.height,10,'Hang holds rooftop height');assert.equal(travel.state.verticalSpeed,0,'No gravity during hang');}
  fell ||= travel.state.falling;impact ||= travel.state.impact;
  if(impact)break;
 }
 assert.ok(fell,mode+' falls after leaving the roof');assert.ok(impact,mode+' triggers impact');
 assert.ok(hangFrames>=ROOF_HANG_TIME*60-1,'One-second cartoon hang');
 assert.equal(travel.state.height,0);const landed=p.x;
 for(let i=0;i<180;i++)travel.update(1/60,p,v,{x:1,z:0,sprint:false},mode);
 assert.equal(p.x,landed,'Movement locked through splat/recovery');
 for(let i=0;i<Math.ceil(ROOF_RECOVERY_TIME*60);i++)travel.update(1/60,p,v,{x:1,z:0,sprint:false},mode);
 assert.equal(travel.state.recovery,0);assert.ok(p.x>landed,'Movement resumes');
}
const prop={x:70,z:-30,w:2,d:2,floor:10,top:12};
const p={x:66,z:-30},v={x:0,z:0},t=createRooftopTravel([roof],[roof],p,[prop]);
assert.equal(t.canLand(70,-30),true,'Roof equipment supports landing on top');t.reset(p.x,p.z);
for(let i=0;i<90;i++)t.update(1/60,p,v,{x:1,z:0,sprint:false},'walk');
assert.ok(p.x<69,'Roof equipment blocks walking');
console.log('ROOFTOP_TRAVEL_PASS');

const block={x:70,z:-30,w:4,d:4,floor:10,top:12};const raised=createRooftopTravel([roof],[roof],{x:70,z:-30},[block]);assert.equal(raised.surface(70,-30),12);assert(raised.canLand(70,-30));assert.equal(raised.surface(74,-30),10);raised.reset(70,-30);assert.equal(raised.state.height,12);const small=createRooftopTravel([roof],[roof],{x:70,z:-30},[{...block,w:1.1,d:1.1}]);assert(small.canLand(70,-30),'Small rooftop block accepts centered landing');assert.equal(small.surface(70,-30),12);console.log('Raised rooftop blocks: surface, landing and small-block clearance passed');

const {insideObstacle,blocked}=load('lib/town/simulation.ts'),museum={x:200,z:146.5,w:18,d:40,height:18.23,cornerRadius:4};
assert(!insideObstacle(191.3,126.8,museum),'cut-away rounded corner is open');
assert(!blocked(191.3,126.8,[museum],.32),'walking clears rounded corner');
assert(insideObstacle(192.5,128,museum),'curved facade stays solid');
assert(blocked(192.5,128,[museum],.32));
const roundedRoof=createRooftopTravel([museum],[museum],{x:200,z:146.5});
assert.equal(roundedRoof.surface(191.3,126.8),0,'no invisible roof over rounded corner');
assert.equal(roundedRoof.surface(200,146.5),18.23);
assert(roundedRoof.canLand(200,146.5));
console.log('ROUNDED_MUSEUM_PASS walkable cut-away corners, solid facade and matching rooftop');

// Mount beside either railing: walking fits here but the full ride radius does not.
for(const mode of ['scooter','bike','moped'])for(const side of [-1,1])for(const direction of [-1,1]){
 const landing={x:70,z:-30,w:3,d:30,height:10,stepAccess:true};
 const rails=[-1,1].map(side=>({x:70+side*1.5,z:-30,w:.13,d:30,floor:10,top:11.3}));
 const p={x:70+side*1.05,z:-30},v={x:0,z:0},travel=createRooftopTravel([landing],[landing],p,rails);
 travel.reset(p.x,p.z);
 travel.update(1/60,p,v,{x:0,z:direction,sprint:false},'walk');
 const start=p.z;
 for(let i=0;i<20;i++)travel.update(1/60,p,v,{x:0,z:direction,sprint:false},mode);
 assert((p.z-start)*direction>1,mode+' keeps moving after mounting beside a rail');
 assert(!travel.state.falling);
 for(let i=0;i<30;i++)travel.update(1/60,p,v,{x:side,z:0,sprint:false},mode);
 assert(Math.abs(p.x-70)<1.12,'retained walking clearance still blocks the rail');
 for(let i=0;i<15;i++)travel.update(1/60,p,v,{x:-side,z:0,sprint:false},mode);
 for(let i=0;i<30;i++)travel.update(1/60,p,v,{x:side,z:0,sprint:false},mode);
 assert(Math.abs(p.x-70)<.65,'full ride clearance returns after moving clear');
}
console.log('STAIR_MOUNT_PASS both rails, both directions, every ride, barriers and restored clearance');

const low={x:70,z:-30,w:14,d:14,height:9},high={x:70,z:-34,w:14,d:6,height:18};
const overlap=createRooftopTravel([low,high],[low,high],{x:70,z:-30});
assert(!overlap.canLand(70,-30.5),'lower roof landing cannot overlap the taller wall');
assert(overlap.canLand(70,-29),'clear lower roof landing remains available');
const tread={x:70,z:-30,w:3,d:.45,height:9,stepAccess:true};
const stairLanding=createRooftopTravel([tread],[tread],{x:70,z:-30},[{x:71.5,z:-30,w:.13,d:3,floor:9,top:10.3}]);
assert(!stairLanding.canLand(71,-30),'narrow tread must not shrink clearance against its railing');
assert(stairLanding.canLand(70,-30));
console.log('LANDING_CLEARANCE_PASS taller adjacent walls and stair rails');

const furnishedRoof={x:70,z:-30,w:20,d:20,height:9};
const cafeFurniture=[{x:70,z:-30,w:2,d:2,floor:9,top:10,noLanding:true},{x:75,z:-30,w:4.7,d:4.7,floor:9,top:12.2,noLanding:true}];
const cafeLanding=createRooftopTravel([furnishedRoof],[furnishedRoof],{x:70,z:-30},cafeFurniture);
for(const x of [70,75]){assert(!cafeLanding.canLand(x,-30),'table and umbrella are not landing pads');const safe=cafeLanding.findLanding(x,-30);assert(safe&&cafeLanding.canLand(safe.x,safe.z));assert.equal(cafeLanding.surface(safe.x,safe.z),9);}
console.log('CAFE_LANDING_PASS tables and umbrellas redirect to clear roof');
const seamSteps=Array.from({length:40},(_,i)=>({x:57+(i+.5)*.4,z:179,w:.4,d:4,height:(40-i)*10.23/41,stepAccess:true}));const seamTravel=createRooftopTravel(seamSteps,seamSteps,{x:67,z:179});for(let i=1;i<40;i++){const x=57+i*.4;assert(seamTravel.surface(x,179)>0,'exact tread seam retains stair support');seamTravel.reset(x,179);assert(seamTravel.state.height>0);}console.log('STAIR_SEAMS_PASS no ground-height holes between treads');
