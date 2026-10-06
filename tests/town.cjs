const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
const vm=require('node:vm');
const output=ts.transpileModule(fs.readFileSync('lib/town/simulation.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const travelMod={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/town/travelModes.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:travelMod.exports,module:travelMod});
const shoreMod={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/town/shoreline.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:shoreMod.exports,module:shoreMod,Math});
const ferryMod={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/town/ferryBoarding.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:ferryMod.exports,module:ferryMod,Math});
const decksMod={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/town/landableDecks.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:decksMod.exports,module:decksMod,Math});
// The East Pier registers its two decks with the same registry (eastPier.ts, imported by simulation.ts for its side effect).
const pierMod={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/town/eastPier.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:pierMod.exports,module:pierMod,Math,require:id=>{if(id==='./landableDecks')return decksMod.exports;throw new Error(id);}});
const cayMod={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/town/coralCay.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:cayMod.exports,module:cayMod,Math});
const mod={exports:{}};vm.runInNewContext(output,{exports:mod.exports,module:mod,Math,require:id=>{if(id==='./travelModes')return travelMod.exports;if(id==='./shoreline')return shoreMod.exports;if(id==='./ferryBoarding')return ferryMod.exports;if(id==='./coralCay')return cayMod.exports;if(id==='./landableDecks')return decksMod.exports;if(id==='./eastPier')return pierMod.exports;throw new Error(id);}});
const {stepPlayer,blocked,districtAt,DISTRICTS,clearSpotNear}=mod.exports;
function run(input,steps=120){const pos={x:0,z:0},v={x:0,z:0};for(let i=0;i<steps;i++)stepPlayer(pos,v,input,1/60,[]);return {pos,v};}
const straight=run({x:1,z:0,sprint:false});const diagonal=run({x:1,z:1,sprint:false});
assert.ok(Math.abs(Math.hypot(diagonal.pos.x,diagonal.pos.z)-straight.pos.x)<.0001,'Diagonal movement must not be faster');
assert.ok(run({x:1,z:0,sprint:true}).pos.x>straight.pos.x,'Sprint increases speed');
const pos={x:0,z:0},velocity={x:0,z:0};for(let i=0;i<240;i++)stepPlayer(pos,velocity,{x:1,z:1,sprint:false},1/60,[{x:2,z:0,w:1,d:40}]);
assert.ok(pos.x<=1.18,'Player cannot enter a wall');assert.ok(pos.z>5,'Player slides along a wall');
for(let i=0;i<120;i++)stepPlayer(pos,velocity,{x:0,z:0,sprint:false},1/60,[]);assert.ok(Math.hypot(velocity.x,velocity.z)<.001,'Player decelerates to rest');
assert.equal(blocked(-103,0,[]),true);assert.equal(blocked(0,-260,[]),true);assert.equal(blocked(0,-206,[]),false,'Expanded north beach stays walkable');
for(const [key,value] of Object.entries(DISTRICTS))assert.equal(districtAt(value.z),key,'Destinations land in the right district');
// A1 (Oct 3 2026 play-through): map travel to 7v7 landed at venueEntrance (11, -47.875), inside the Old Town Ground vending
// machine's box (11, -48, 2.01 x 1.74): hidden and stuck. The arrival must step out to the nearest clear spot, camera side first.
{const machine=[{x:11,z:-48,w:2.01,d:1.74}];assert.equal(blocked(11,-47.875,machine,.32),true,'the old 7v7 arrival is inside the machine');
 const spot=clearSpotNear(11,-47.875,machine);assert.equal(blocked(spot.x,spot.z,machine,.5),false,'arrival is clear');
 assert.ok(Math.hypot(spot.x-11,spot.z+47.875)<2,'arrival stays beside the pitch entrance');assert.ok(spot.z>-47.875,'arrival steps out on the camera side');
 let moved=1;for(let i=0;i<60;i++){const p={...spot},v={x:0,z:0};stepPlayer(p,v,{x:0,z:1,sprint:false},1/60,machine);moved=Math.hypot(p.x-spot.x,p.z-spot.z);}assert.ok(moved>0,'the player can walk away from the arrival');
 const free=clearSpotNear(11,-40,machine);assert.equal(free.x,11);assert.equal(free.z,-40,'a clear arrival is unchanged');}
console.log('Town simulation: diagonal speed, sprint, collision, wall sliding, braking, boundaries, travel and clear arrivals passed.');
const {crossedGoal}=mod.exports;
assert.equal(crossedGoal({x:11,z:4},{x:11,z:3}),true,'Shot crossing goal line scores');
assert.equal(crossedGoal({x:11,z:3},{x:11,z:4}),false,'Entering from behind the goal does not score');
assert.equal(crossedGoal({x:15,z:4},{x:15,z:3}),false,'Wide shot does not score');
assert.equal(crossedGoal({x:11,z:3},{x:11,z:3}),false,'Stationary ball cannot score repeatedly');
assert.equal(crossedGoal({x:11,z:-49},{x:11,z:-50}),true,'Night court goal works');
console.log('Goal detection: forward crossing, direction, posts, stationary ball and night court passed.');
const learning=ts.transpileModule(fs.readFileSync('lib/town/learning.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const lessonMod={exports:{}};vm.runInNewContext(learning,{exports:lessonMod.exports,module:lessonMod,Math});
const {passingLane}=lessonMod.exports;
assert.equal(passingLane({x:11,z:9}).open,false,'Defender blocks initial position');
assert.equal(passingLane({x:5,z:9}).open,true,'Left passing angle opens');
assert.equal(passingLane({x:17,z:9}).open,true,'Right passing angle opens');
assert.equal(passingLane({x:11,z:21}).open,false,'Standing on the passer is not a solution');
assert.equal(passingLane({x:11,z:18}).open,false,'Walking through the defender cannot bypass the exercise');
assert.equal(passingLane({x:-3,z:9}).open,false,'Outside the court is not a valid solution');
assert.ok(Number.isFinite(passingLane({x:11,z:21}).clearance),'Zero-length passing lane stays finite');
console.log('Learning: blocked lane, two valid angles, court bounds and invalid shortcuts passed.');
