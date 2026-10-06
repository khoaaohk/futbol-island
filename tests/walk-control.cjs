// Walking controller feel (A7, Oct 2026): stick dead zone + walk floor, portrait camera centring, look-ahead,
// and the hidden-behind-a-building probe. Run: node tests/walk-control.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
function load(file){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,Math,require});return m.exports;}
const W=load(path.join(__dirname,'../lib/town/walkControl.ts'));const near=(a,b,e=1e-9)=>Math.abs(a-b)<=e;
// Stick: resting thumbs do nothing; any deliberate push walks at least ~1.3 m/s; full tilt is full speed; direction is analog.
const o={x:9,z:9};
for(const m of[0,.05,.1,.12]){W.shapeStick(m,0,o);assert.equal(o.x,0);assert.equal(o.z,0);}
W.shapeStick(.121,0,o);assert(o.x>=W.STICK_WALK_FLOOR&&o.x<W.STICK_WALK_FLOOR+.01,'just past the dead zone = the walk floor');
assert(W.STICK_WALK_FLOOR*3.7>1.25&&W.STICK_WALK_FLOOR*3.7<1.45,'walk floor is a natural slow walk');
W.shapeStick(1,0,o);assert(near(o.x,1));W.shapeStick(.6,.8,o);assert(near(Math.hypot(o.x,o.z),1));assert(near(Math.atan2(o.z,o.x),Math.atan2(.8,.6)),'analog direction kept');
let last=0;for(let m=.13;m<=1;m+=.01){W.shapeStick(0,-m,o);const e=Math.hypot(o.x,o.z);assert(e>=last-1e-12&&e<=1+1e-12,'monotonic, capped');last=e;}
const d=Math.SQRT1_2*.5;W.shapeStick(d,d,o);assert(near(o.x,o.z),'diagonals stay diagonal');
// Camera: portrait centres the player (offset parallel to the fixed view direction (16,23,33)); desktop keeps (18,30).
const c={x:0,z:0};
W.walkCameraOffset(390/844,c);assert(near(c.x,16)&&near(c.z,33));assert(near(c.x/c.z,16/33),'portrait offset is on the view axis');
W.walkCameraOffset(1280/800,c);assert(near(c.x,18)&&near(c.z,30));W.walkCameraOffset(844/390,c);assert(near(c.x,18)&&near(c.z,30));
W.walkCameraOffset(1.05,c);assert(c.x>16&&c.x<18&&c.z>30&&c.z<33,'square views blend');
// Look-ahead cancels the eased follow's lag (rate 4 => v/4) and is capped.
W.walkCameraLead(3.7,0,c);assert(near(c.x,3.7*W.WALK_CAMERA_LEAD)&&c.z===0);assert(c.x>=3.7/4*.9&&c.x<=3.7/4*1.4);
W.walkCameraLead(0,-30,c);assert(near(Math.hypot(c.x,c.z),W.WALK_CAMERA_LEAD_MAX));W.walkCameraLead(0,0,c);assert(c.x===0&&c.z===0);
// Segment/box and the probe.
const box={x:0,z:5,w:4,d:2,floor:0,top:9};
assert(W.segmentHitsBox(0,1,0,0,30,40,box),'a tall building between player and camera blocks');
assert(!W.segmentHitsBox(0,1,0,0,30,40,{...box,top:2}),'a low wall under the sight line does not');
assert(!W.segmentHitsBox(0,1,0,0,30,40,{...box,x:6}),'a building off to the side does not');
assert(!W.segmentHitsBox(0,1,0,0,30,40,{...box,z:-5}),'a building behind the player does not');
let queries=0;const probe=W.createOcclusionProbe((x,z,r)=>{queries++;return[box];});
const cam=[16,24,33].map((v,i)=>[0,1,0][i]+v);// camera above/behind (+x,+z)
const hidden=probe.update(1,0,0,0,...cam);// player at origin, building on the camera side?
const blocker={x:3,z:6,w:6,d:3,floor:0,top:9};const p2=W.createOcclusionProbe(()=>[blocker]);
assert.equal(p2.update(1,0,0,0,16,23,33),true,'hidden behind a 9 m building on the camera side');
const p3=W.createOcclusionProbe(()=>[{...blocker,top:1}]);assert.equal(p3.update(1,0,0,0,16,23,33),false,'a 1 m planter does not hide the head');
// Throttled: one query per interval, the answer is held in between.
queries=0;const p4=W.createOcclusionProbe(()=>{queries++;return[];});for(let i=0;i<60;i++)p4.update(1/60,0,0,0,16,23,33);assert(queries>=5&&queries<=8,'~6 Hz, not per frame: '+queries);
p2.reset();assert.equal(p2.hidden,false);
assert.equal(typeof hidden,'boolean');
console.log('WALK_CONTROL_PASS');
