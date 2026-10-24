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
// Phone landscape framing (batch 2, Oct 23 2026): a pure function of aspect + pointer + mode.
W.walkCameraOffset(2.17,c);assert(near(c.x,18)&&near(c.z,30),'2.17 landscape keeps the established offset direction');
const DIST=Math.hypot(18,23,30),EMOTE_MAX=18,EMOTE_CLOSE=14,PORT=.46;
// Phone predicate: touch phones in either orientation; tablets and fine pointers are not phones.
for(const [w,h] of [[393,852],[852,393],[667,375],[932,430],[956,440],[375,667]])assert(W.isPhoneViewport(w,h,true),`${w}x${h} touch is a phone`);
for(const [w,h] of [[1024,768],[1194,834],[1366,1024]])assert(!W.isPhoneViewport(w,h,true),`${w}x${h} tablet is not a phone`);
assert(!W.isPhoneViewport(852,393,false)&&!W.isPhoneViewport(2560,1080,false),'fine pointer is never a phone');
// Portrait, square and every fine-pointer (desktop, wide desktop) window: unchanged distance.
for(const a of [.46,1,1.3,1.78,2.17,2.4,3.5])for(const m of ['walk','swim','dive','ride','fly'])assert.equal(W.cameraDollyFor(a,false,m),1,`fine ${a} ${m} unchanged`);
for(const m of ['walk','swim','dive','ride','fly']){assert.equal(W.cameraDollyFor(.46,true,m),1,'portrait phone unchanged');assert.equal(W.cameraDollyFor(1,true,m),1,'square unchanged');}
// Landscape phones: visible width ~2x portrait (not 4.7x), player >= 32 px, camera stays farther than the emote zoom.
const px=(w,h,d)=>42/852*h/d;// the player's height in px: 42 px at 393x852 and the portrait distance, x 1/dolly
for(const [a,h] of [[1.3,600],[1.78,375],[2.17,393],[2.17,430],[2.4,393]]){
  const d=W.cameraDollyFor(a,true,'walk'),width=a*d/PORT;
  assert(d<1&&d>=1/W.LANDSCAPE_FRAME.maxDolly-1e-12,`${a}: dollied in, capped`);
  assert(width>=1.6&&width<=2.4,`${a}: world width ${width.toFixed(2)}x portrait`);
  assert(DIST*d>EMOTE_MAX-.6&&DIST*d>EMOTE_CLOSE+3,`${a}: camera ${(DIST*d).toFixed(1)} m, the emote zoom still zooms in`);
  if(h<=430)assert(px(a*h,h,d)>=32,`${a}x${h}: player ${px(a*h,h,d).toFixed(0)} px >= 32`);
}
assert(2.17*W.cameraDollyFor(2.17,true)/PORT<=2.0,'iPhone 15 landscape: <= 2.0x the portrait width');
// Monotonic and continuous in aspect (no step at the 1.3 ramp end, nothing below 1.0).
let prev=1;for(let a=.4;a<=3;a+=.005){const d=W.cameraDollyFor(a,true);assert(d<=prev+1e-12,'wider never farther');assert(prev-d<.02,`continuous at ${a.toFixed(3)}`);prev=d;}
// Per mode: ride / fly keep a little more look-ahead (a shorter dolly), walk / swim / dive share one rule.
const dw=W.cameraDollyFor(2.17,true,'walk');for(const m of ['swim','dive'])assert.equal(W.cameraDollyFor(2.17,true,m),dw);
for(const m of ['ride','fly']){const d=W.cameraDollyFor(2.17,true,m);assert(d>dw&&d<1,`${m} dollies a little less`);}
// Rotation mid-play: eased (~0.4 s), no frame-to-frame jump, no overshoot; first frame and reduced motion snap.
{const e=W.createDollyEase();assert.equal(e.update(1,1/60),1,'first update takes the goal');
 const goal=W.cameraDollyFor(2.17,true);let x=1,maxStep=0,t=0,settled=-1;
 for(let i=0;i<120;i++){const n=e.update(goal,1/60);t+=1/60;maxStep=Math.max(maxStep,Math.abs(n-x));assert(n<=1+1e-12&&n>=goal-1e-12,'no overshoot');x=n;if(settled<0&&Math.abs(x-goal)<.03*(1-goal))settled=t;}
 assert(maxStep*DIST<2.2,`max camera step ${(maxStep*DIST).toFixed(2)} m per 60 fps frame`);
 assert(Math.abs(e.update(goal,1/60)-1)>0&&settled>.25&&settled<=.45,`settles in ~0.4 s (${settled.toFixed(2)} s)`);
 const first=W.createDollyEase();first.update(1,1/60);assert(Math.abs(first.update(goal,1/60)-1)*DIST<.8,'the first frame after a rotate starts gently (< 0.8 m)');
 // back to portrait: same ease the other way; a 30 fps phone and a long hitch stay bounded
 const b=W.createDollyEase();b.update(goal,1/30);let y=goal,big=0;for(let i=0;i<30;i++){const n=b.update(1,1/30);big=Math.max(big,Math.abs(n-y));y=n;}assert(big*DIST<4.2&&near(y,1,1e-3),'30 fps: bounded steps, back to portrait');
 const h=W.createDollyEase();h.update(1,1/60);const hv=h.update(goal,5);assert(hv>=goal-1e-12&&hv<=1,'a long hitch is clamped, never overshoots');
 const r=W.createDollyEase();r.update(1,1/60);assert.equal(r.update(goal,1/60,true),goal,'reduced motion snaps');}
console.log('WALK_CONTROL_PASS');
