// Map travel keeps the movement mode (Nov 13 2026, owner bug N4): walking stays walking, a ride arrives riding, flying arrives
// flying at a sensible height over the destination, swimming arrives walking on land (swimming on water). Pure rules
// (lib/town/travelArrival.ts), Town's wiring, and the multiplayer pose after the jump (townBridge partyLocal mode, presence.ts
// islandJump → Warp, governPose keeps the Warp). usage: node tests/travel-keeps-mode.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const ROOT=path.join(__dirname,'..'),req=require('node:module').createRequire(ROOT+'/package.json'),cache=new Map();
const resolve=(from,id)=>{const b=id.startsWith('@/')?path.join(ROOT,id.slice(2)):path.resolve(path.dirname(from),id);for(const f of [b,b+'.ts',b+'.tsx',path.join(b,'index.ts')])if(fs.existsSync(f)&&fs.statSync(f).isFile())return f;throw new Error('cannot resolve '+id);};
const mem=()=>{const m=new Map();return{getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)};};
function load(file){file=path.isAbsolute(file)?file:path.join(ROOT,file);if(cache.has(file))return cache.get(file).exports;const mod={exports:{}};cache.set(file,mod);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,jsx:ts.JsxEmit.React}}).outputText;
 vm.runInNewContext(code,{exports:mod.exports,module:mod,Math,JSON,Set,Map,WeakMap,Object,Array,Number,String,Symbol,Promise,Error,console,Date,Float32Array,Float64Array,Uint8Array,Uint16Array,Uint32Array,Int16Array,Int32Array,
  process:{env:{}},performance:{now:()=>0},localStorage:mem(),sessionStorage:mem(),window:new EventTarget(),EventTarget,Event,CustomEvent:class extends Event{},URL,
  require:id=>id.startsWith('.')||id.startsWith('@/')?load(resolve(file,id)):req(id)});return mod.exports;}

const A=load('lib/town/travelArrival.ts'),land={groundY:.4,water:false},sea={groundY:-.4,water:true};
// ---- 1. Each mode.
assert.deepEqual({...A.travelArrival({ride:'walk',swimming:false,air:0},land)},{ride:'walk',flying:false,swimming:false,flightHeight:.4},'walking stays walking');
for(const r of ['scooter','bike','moped']){const a=A.travelArrival({ride:r,swimming:false,air:0},land);assert(a.ride===r&&!a.flying&&!a.swimming,r+' arrives still riding');
 assert.equal(A.travelArrival({ride:r,swimming:false,air:0},sea).swimming,true,r+' onto water: swimming');}
{const a=A.travelArrival({ride:'jetpack',phase:'idle',swimming:false,air:22},land);assert(a.flying&&a.ride==='jetpack','flying arrives flying');assert.equal(a.flightHeight,22.4,'at the height over the ground it had');
 const low=A.travelArrival({ride:'jetpack',phase:'idle',swimming:false,air:1},{groundY:30,water:false});assert.equal(low.flightHeight,30+A.ARRIVAL_FLIGHT.min,'never skimming the destination (a hill)');
 const high=A.travelArrival({ride:'jetpack',phase:'idle',swimming:false,air:300},land);assert.equal(high.flightHeight,.4+A.ARRIVAL_FLIGHT.max,'nor lost in the sky');
 assert(A.travelArrival({ride:'jetpack',phase:'parachute',swimming:false,air:12},land).flying,'under the parachute: arrives flying');
 assert(A.travelArrival({ride:'jetpack',phase:'idle',swimming:false,air:NaN},land).flightHeight>=.4+A.ARRIVAL_FLIGHT.min,'a bad height still lands sensibly');
 assert.equal(A.travelArrival({ride:'jetpack',phase:'fall',swimming:false,air:5},land).ride,'walk','a crashing jetpack arrives on foot');}
{const a=A.travelArrival({ride:'walk',swimming:true,air:0},land);assert(a.ride==='walk'&&!a.swimming,'swimming to land: walking');
 assert(A.travelArrival({ride:'walk',swimming:true,air:0},sea).swimming,'swimming to water: swimming');}

// ---- 2. Town: both map trips (a place and a pitch) read the mode before the jump and apply it after; no forced walk.
const town=fs.readFileSync(path.join(ROOT,'components/Town.tsx'),'utf8');
const block=(start)=>{const i=town.indexOf(start);assert(i>=0,start);return town.slice(i,town.indexOf('\n',i));};
for(const b of [block('if(travel.current){const from=travelFrom();'),block('if(fieldTravel.current){const from=travelFrom();')]){
 assert(!/rideRef\.current='walk'/.test(b),'a map trip no longer forces walking');assert(/applyArrival\(from,/.test(b),'it applies the arrival');}
assert(/const travelFrom=\(\):ArrivalFrom=>\(\{ride:rideRef\.current,phase:jetActions\.state\.phase,swimming:/.test(town),'the mode is read from the ride, the jetpack phase and the water');
assert(/if\(a\.flying\)\{jetActions\.reset\(\);[^}]*flight\.height=flight\.startHeight=a\.flightHeight/.test(town),'flying: the flight height is set over the destination');
assert(/if\(from\.swimming\)\{.*water\.reset\(\);rideBeforeWater=null/.test(town),'swimming: dry again, the old ride not brought back');

// ---- 3. Multiplayer: the pose after the jump carries the kept mode, and the jump sends Warp.
const P=load('lib/multiplayer/presence.ts'),B=load('lib/multiplayer/townBridge.ts'),{Mode}=load('multiplayer/protocol/index.ts');
const want={walk:Mode.Idle,scooter:Mode.Scooter,bike:Mode.Bike,moped:Mode.Moped,jetpack:Mode.Jetpack};
for(const [ride,mode] of Object.entries(want)){
 const before={x:-7,z:14},after={x:-197,z:-30},y=ride==='jetpack'?24:0;
 const o=B.partyLocal(after,{position:{y},rotation:{y:0}},{x:0,z:0},ride,false,false,false);assert.equal(o.mode,mode,ride+': the pose after the trip carries the mode');
 assert(P.islandJump(before.x,before.z,after.x,after.z,1/60),ride+': the trip is a jump (Warp)');
 const g=P.poseGovernor();const first=[before.x*10,y*10,before.z*10,0,0,mode,0,0];P.commitPose(g,P.governPose(g,first,0),0);
 const body=[after.x*10,y*10,after.z*10,0,0,mode,0,0],out=P.governPose(g,body,100);
 assert(out[7]&1,ride+': the governor sends it as a Warp');assert.equal(out[5],mode,ride+': mode intact');assert.equal(out[0],after.x*10,ride+': at the destination, not clamped');}
assert.equal(B.partyLocal({x:-197,z:-30},{position:{y:0},rotation:{y:0}},{x:0,z:0},'walk',false,false,false).mode,Mode.Idle,'swimmer arriving on land: on foot (not Swim)');
console.log('travel keeps mode: ok');
