const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');
const path = require('node:path');
function load(file){const mod={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:mod,exports:mod.exports,Math,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});return mod.exports;}
const mod = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/graphics/player.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, { exports: mod.exports, module: mod, require:id=>id.startsWith('.')?load(path.resolve('lib/graphics',id+'.ts')):require(id), Math });
const { createPlayer, PLAYER_KICK_CONTACT } = mod.exports;
const rig = createPlayer('test-player', 'home');
const pelvis = rig.root.children[0];
const left = pelvis.children[1], right = pelvis.children[2];
rig.update(0, 0, 1/60, 0, true, { facing: Math.PI-.01 });
rig.update(0, 0, 1/60, 0, true, { facing: -Math.PI+.01 });
assert.ok(Math.abs(rig.root.rotation.y-Math.PI)<.025, 'Facing crosses +/- pi by the short path');
let min=Infinity, max=-Infinity;
for (let i=1; i<=240; i++) {
  rig.update(0, i/30, 1/60, i/60, true);
  min=Math.min(min,left.rotation.x);max=Math.max(max,left.rotation.x);
  rig.root.traverse(n=>assert.ok([...n.position,...n.quaternion].every(Number.isFinite),'All limb transforms remain finite'));
}
assert.ok(max-min>.2, 'Essential running animation remains active in reduced motion');
rig.update(50, 50, 1/60, 5, false);
assert.equal(rig.root.position.x,50,'Teleports retain simulation position');
rig.update(50,50,1/60,5,true,{kick:PLAYER_KICK_CONTACT,kickSide:1});
assert.ok(right.rotation.x<left.rotation.x-.2,'At contact the striking leg reaches ahead of the supporting leg');
rig.update(50,50,1/60,5,true,{receive:1,kickSide:-1});
assert.ok(left.rotation.y<-.1,'Reception opens the chosen receiving foot');
rig.update(50,50,0,5,true);
rig.root.traverse(n=>assert.ok([...n.position,...n.quaternion].every(Number.isFinite),'Zero-delta pause remains finite'));
rig.dispose();
console.log('Player mechanics: short turns, reduced-motion gait, finite limbs, teleport, kick support and receiving passed.');

for(const stretch of [0,.25,.5,.75,1,.5,0]){
 rig.update(0,0,1/60,0,false,{travelMode:'moped',mopedSuperman:stretch,facing:0});rig.root.updateMatrixWorld(true);
 for(const side of ['left','right']){const elbow=rig.root.getObjectByName(side+'-elbow'),hand=rig.root.worldToLocal(elbow.localToWorld(elbow.position.clone().set(0,-.265,0)));assert(Math.hypot(hand.y-1.13*1.12,hand.z-.48*1.12)<.04,'hands stay at handlebar grips through extension and return');}
 assert(Math.abs(pelvis.position.y-(1+.35*stretch))<.001);
}
console.log('MOPED_SUPERMAN_PASS grip anchoring, rider extension and seated return');
{
const riding=createPlayer('ride-sway','home');let swayMin=1,swayMax=-1;
for(let i=0;i<180;i++){riding.update(i*20/60,0,1/60,i/60,false,{travelMode:'bike'});swayMin=Math.min(swayMin,riding.bikeRoll);swayMax=Math.max(swayMax,riding.bikeRoll);}
assert(swayMin<-.04&&swayMax>.04,'bike visibly sways in both directions');assert(Math.max(Math.abs(swayMin),swayMax)<=.07);
for(let i=0;i<120;i++)riding.update(179*20/60,0,1/60,3+i/60,false,{travelMode:'bike'});assert(Math.abs(riding.bikeRoll)<.001,'sway settles when stopped');
riding.update(0,0,1/60,0,false,{parachute:true,travelMode:'walk'});const lh=riding.root.getObjectByName('left-hip'),rh=riding.root.getObjectByName('right-hip');let min=1,max=-1;
for(let i=0;i<150;i++){riding.update(0,0,1/60,i/60,false,{parachute:true,travelMode:'walk'});min=Math.min(min,lh.rotation.x);max=Math.max(max,lh.rotation.x);assert(Math.abs(lh.rotation.x+rh.rotation.x+.24)<.0001,'legs alternate');}
assert(max-min>.4,'parachute legs have visible swing');const paused=lh.rotation.x;riding.update(0,0,0,99,false,{parachute:true,travelMode:'walk'});assert.equal(lh.rotation.x,paused,'paused leg motion stays still');riding.update(0,0,1/60,100,true,{parachute:true,travelMode:'walk'});assert.equal(lh.rotation.x,-.12,'reduced motion uses resting pose');riding.dispose();
console.log('RIDE_SWAY_PARACHUTE_PASS alternating motion, bounded bike lean, stop, pause and reduced motion');

}
{
const T=require('three'),cached=createPlayer('cached-rig','home');
for(const costume of ['none','arsenal','barcelona','none'])for(const character of ['male','female']){
 cached.setAppearance({costume,character,face:'light',body:'strong',clothing:'coast'});
 for(const motion of [{travelMode:'bike'},{travelMode:'moped',mopedSuperman:1},{travelMode:'walk',parachute:true},{travelMode:'walk',wallSplat:true}]){
  cached.update(1,2,1/60,2,false,motion);cached.root.updateMatrixWorld(true);let checked=0;
  cached.root.traverse(o=>{if(!o.isMesh)return;assert.equal(o.matrixAutoUpdate,false);const expected=new T.Matrix4().compose(o.position,o.quaternion,o.scale);assert.deepEqual(o.matrix.elements,expected.elements,'cached local matrix matches current shape');expected.premultiply(o.parent.matrixWorld);for(let i=0;i<16;i++)assert(Math.abs(expected.elements[i]-o.matrixWorld.elements[i])<1e-10,'joint motion reaches cached mesh');checked++;});assert(checked>30);
 }
}
cached.dispose();console.log('CACHED_RIG_PASS costume changes, body settings and animated joint world matrices');
}
{
for(const mode of ['scooter','bike','moped']){const rider=createPlayer('ride-legs-'+mode,'home'),knee=rider.root.getObjectByName('right-knee');let low=Infinity,high=-Infinity;for(let i=0;i<180;i++){rider.update(i*.1,0,1/60,i/60,false,{travelMode:mode,facing:0});if(i>30){low=Math.min(low,knee.rotation.x);high=Math.max(high,knee.rotation.x);}}assert(high-low>.015,mode+' legs move while riding');const still=knee.rotation.x;rider.update(17.9,0,0,100,false,{travelMode:mode,facing:0});assert.equal(knee.rotation.x,still,'paused ride freezes leg motion');let left=0,right=0;for(let i=0;i<45;i++){rider.update(18+i*.1,0,1/60,4+i/60,false,{travelMode:mode,facing:.9});left=Math.min(left,rider.rideTurnRoll);}for(let i=0;i<45;i++){rider.update(22.5+i*.1,0,1/60,5+i/60,false,{travelMode:mode,facing:-.9});right=Math.max(right,rider.rideTurnRoll);}assert(left<-.03&&right>.03,mode+' leans into both turns');assert(left>=-.24&&right<=.24);rider.update(26.9,0,1/60,6,true,{travelMode:mode,facing:0});assert.equal(rider.rideTurnRoll,0);rider.dispose();}
console.log('RIDE_LEGS_TURNS_PASS leg movement, bidirectional lean, pause and reduced motion');
}

// Attention is bounded, freezes with pause, and never overrides ride/reduced poses.
{
 const watched=createPlayer('attention','home'),plain=createPlayer('attention','home');
 for(let i=0;i<45;i++){watched.update(0,0,1/60,0,false,{facing:0,lookX:5,lookZ:2});plain.update(0,0,1/60,0,false,{facing:0});}
 const head=watched.root.getObjectByName('player-head'),baseline=plain.root.getObjectByName('player-head');
 assert(head.rotation.y-baseline.rotation.y>.45&&Math.abs(head.rotation.y)<=.65,'head follows nearby ball within bounds');
 const frozen=head.rotation.y;watched.update(0,0,0,0,false,{facing:0,lookX:5,lookZ:2});assert.equal(head.rotation.y,frozen,'attention freezes while paused');
 for(let i=0;i<90;i++)watched.update(0,0,1/60,0,false,{facing:0});assert(Math.abs(head.rotation.y-baseline.rotation.y)<.001,'attention eases back when no longer involved');
 watched.update(0,0,1/60,0,true,{facing:0,lookX:5,lookZ:2});assert.equal(head.rotation.y,0,'reduced motion disables attention');
 watched.update(.1,.1,1/60,0,false,{facing:1,resumePose:true});assert.equal(watched.root.rotation.y,1,'offscreen resume synchronizes heading without catch-up');
 watched.dispose();plain.dispose();
 const a=createPlayer('receive-pass','home'),b=createPlayer('receive-pass','home');
 a.update(0,0,0,0,true,{kick:PLAYER_KICK_CONTACT,receive:1});b.update(0,0,0,0,true,{kick:PLAYER_KICK_CONTACT});
 for(const side of ['left','right'])for(const joint of ['hip','knee','ankle'])assert.deepEqual(a.root.getObjectByName(`${side}-${joint}`).quaternion.toArray(),b.root.getObjectByName(`${side}-${joint}`).quaternion.toArray(),'kick takes priority at contact');
 a.dispose();b.dispose();
 console.log('ATTENTION_TRANSITION_PASS bounded gaze, pause, release, reduced motion, resume and receiving-to-kick priority');
}

const airRig=createPlayer('parachute-juggle','home'),THREE=require('three'),handsA=[new THREE.Vector3(),new THREE.Vector3()],handsB=[new THREE.Vector3(),new THREE.Vector3()],footA=new THREE.Vector3(),footB=new THREE.Vector3();
airRig.update(0,0,0,0,true,{travelMode:'jetpack',parachute:true,facing:0});airRig.handPositions(...handsA);airRig.ballContact(1,footA);airRig.update(0,0,0,0,true,{travelMode:'jetpack',parachute:true,facing:0,parachuteJuggle:{phase:.16,side:1}});airRig.handPositions(...handsB);airRig.ballContact(1,footB);assert(handsA[0].distanceTo(handsB[0])<1e-8&&handsA[1].distanceTo(handsB[1])<1e-8,'air juggling preserves canopy grips');assert(footA.distanceTo(footB)>.05,'air juggling moves kicking foot');airRig.dispose();console.log('Airborne juggling: foot tap visible, canopy grips preserved.');

const continuityRig=createPlayer('air-juggle-continuity','home');function sampleAirBall(phase,side){continuityRig.update(0,0,0,0,true,{travelMode:'jetpack',parachute:true,facing:0,parachuteJuggle:{phase,side}});const from=new THREE.Vector3(),to=new THREE.Vector3();continuityRig.ballContact(side,from);continuityRig.ballContact(-side,to);return from.lerp(to,phase);}assert(sampleAirBall(.99999,1).distanceTo(sampleAirBall(0,-1))<.001,'alternating-foot arc remains continuous at wrap');continuityRig.dispose();console.log('Airborne ball arc endpoints join without a foot-switch jump.');

const spiralRig=createPlayer('spiral-juggle','home');
const spiralPelvis=spiralRig.root.getObjectByName('player-pelvis'),spiralTorso=spiralRig.root.getObjectByName('armor-torso');
spiralRig.update(0,0,1/60,0,false,{parachute:true,parachuteSpin:1,parachuteJuggle:{phase:.16,side:1}});
assert(spiralPelvis.rotation.y<-.1&&spiralTorso.rotation.y>.2,'hips trail while shoulders counter-twist through spin');
const spinHands=[new THREE.Vector3(),new THREE.Vector3()];spiralRig.handPositions(...spinHands);
assert(spinHands.every(v=>Number.isFinite(v.length())&&v.y>1.3),'both hands remain raised for suspension lines');
function spinBall(phase,side){spiralRig.update(0,0,0,0,false,{parachute:true,parachuteSpin:1,parachuteJuggle:{phase,side}});const a=new THREE.Vector3(),b=new THREE.Vector3();spiralRig.ballContact(side,a);spiralRig.ballContact(-side,b);return a.lerp(b,phase);}
assert(spinBall(.99999,1).distanceTo(spinBall(0,-1))<.001,'juggling stays continuous while counter-twisting');
spiralRig.update(0,0,1/60,0,true,{parachute:true,parachuteSpin:1});assert.equal(spiralPelvis.rotation.y,0,'reduced motion removes spin pose');
spiralRig.dispose();console.log('Spiral juggling: counter-twist, raised grips, continuous touches and reduced motion passed.');

const flightRig=createPlayer('flight-flow','home',true,true);
const joint=name=>flightRig.root.getObjectByName(name);
const flightSample=(time,extra={},reduced=false)=>flightRig.update(0,0,1/60,time,reduced,{travelMode:'jetpack',facing:0,flight:{bob:0,pitch:.35,roll:0,compression:0,thrust:1,secondary:0,phase:'cruise',progress:1,acceleration:0,turn:0,...extra}});
let kneeMin=Infinity,kneeMax=-Infinity;
for(let i=0;i<180;i++){flightSample(i/60);kneeMin=Math.min(kneeMin,joint('left-knee').rotation.x);kneeMax=Math.max(kneeMax,joint('left-knee').rotation.x);}
assert(kneeMax-kneeMin>.08,'cruising knees flow instead of locking');
const normalKnee=joint('left-knee').rotation.x;
for(let i=0;i<60;i++)flightSample(3+i/60,{acceleration:1,turn:1});
assert(joint('left-knee').rotation.x>normalKnee+.05,'acceleration draws knees back');
assert(joint('player-head').rotation.y>.2&&joint('left-hip').rotation.y<-.05,'head leads turn while hips trail');
assert(Math.abs(joint('left-hand').rotation.x)>.05,'hands follow acceleration');
const paused=joint('left-knee').rotation.x;
flightRig.update(0,0,0,4,false,{travelMode:'jetpack',flight:{phase:'cruise',progress:1,pitch:0,compression:0,thrust:1,acceleration:-1,turn:-1}});
assert.equal(joint('left-knee').rotation.x,paused,'paused flight holds joint inertia');
for(let i=0;i<60;i++)flightSample(4+i/60,{phase:'landing',progress:.82,compression:.17,pitch:0});
assert(joint('left-knee').rotation.x>.65,'landing absorbs impact through knees');
for(let i=0;i<60;i++)flightSample(5+i/60,{phase:'landing',progress:1,compression:0,pitch:0});
assert(joint('left-knee').rotation.x<.16,'landing settles into standing pose');
flightRig.update(0,0,1/60,6,true,{travelMode:'walk',facing:0});
assert.equal(joint('left-ankle').rotation.z,0,'flight ankle bank clears when walking');
assert.equal(joint('left-hand').rotation.x,0,'flight hand rotation clears when walking');
flightSample(7,{pitch:.4,turn:1});
assert(Math.abs(joint('left-shoulder').rotation.y)>.05,'cruise twists shoulder yaw');
flightRig.update(0,0,1/60,7,true,{travelMode:'walk',facing:0});
assert.equal(joint('left-shoulder').rotation.y,0,'walking clears cruise shoulder twist');
assert.equal(joint('right-shoulder').rotation.y,0,'both shoulders return to walking alignment');
flightRig.dispose();console.log('FLIGHT_FLOW_PASS knees, acceleration, turning, hands, pause, landing absorption and walking reset');
