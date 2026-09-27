const assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
function load(file){const mod={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:mod.exports,module:mod,Math,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});return mod.exports;}
const {createRooftopTravel}=load('lib/town/rooftopTravel.ts');
const {planRoofLaunch,launchDistanceFor,LAUNCH_DISTANCE,planRoofJump,ROOF_JUMP_LIMITS,REDUCED_APEX,AIM_CONE_DEG,JUMP_LAND_TIME,roofJumpMotion,applyRoofJumpPose}=load('lib/town/rooftopJump.ts');

// Source roof spans x 64…76 at 10 m; the target sits `gap` metres east of it.
const SOURCE={x:70,z:-30,w:12,d:12,height:10};
function run({mode='walk',gap=4,height=9,input={x:1,z:0},sprint=false,frames=360,startX=70,startZ=-30}={}){
 const target={x:SOURCE.x+6+gap+6,z:-30,w:12,d:12,height};
 const p={x:startX,z:startZ},v={x:0,z:0},travel=createRooftopTravel([SOURCE,target],[SOURCE,target],p);
 travel.reset(p.x,p.z);assert.equal(travel.state.height,10);
 const out={jumped:false,fell:false,impact:false,landed:false,maxHeight:0,landing:null,target,travel,p};
 for(let i=0;i<frames;i++){
  travel.update(1/60,p,v,{...input,sprint},mode);
  if(travel.jump.started){out.kind=travel.jump.plan.kind;out.jumped=out.kind==='jump';out.launched=out.kind==='launch';out.plan=travel.jump.plan;}
  if(travel.jump.fall)out.fallStart={x:p.x,z:p.z,height:travel.state.height};
  if(travel.jump.active)out.maxHeight=Math.max(out.maxHeight,travel.state.height);
  if(travel.jump.landed&&!out.landing){out.landed=true;out.landing={x:p.x,z:p.z,height:travel.state.height};input={x:0,z:0};}
  out.fell ||= travel.state.falling;out.impact ||= travel.state.impact;
  if(out.landing&&travel.jump.landAge<0&&!travel.jump.active)break;
  if(out.impact)break;
 }
 return out;
}
const inside=(pt,o,pad=0)=>Math.abs(pt.x-o.x)<o.w/2-pad&&Math.abs(pt.z-o.z)<o.d/2-pad;

// 1. Jogging on foot (full joystick, no run button) to a lower roof 4 m away: jump, no fall, lands inside.
{const r=run({mode:'walk',gap:4,height:9});
 assert.ok(r.jumped,'foot jog jumps a 4 m gap');assert.ok(!r.fell&&!r.impact,'no hang/fall/splat');
 assert.ok(r.landing&&inside(r.landing,r.target,.8),'lands inside the target footprint');
 assert.equal(r.landing.height,9);assert.equal(r.travel.state.height,9);
 assert.ok(r.maxHeight>10.2,'arc rises above the take-off roof');}
// 2. Level roof (same height) is fine; a slightly higher roof within tolerance too.
{const r=run({gap:3,height:10});assert.ok(r.jumped&&!r.fell,'level roof jump');}
{const r=run({gap:3,height:10.3});assert.ok(r.jumped&&!r.fell,'within same-height tolerance');}
// 3. Bike to a lower roof 7 m away: too far on foot, fine on a bike.
{const r=run({mode:'bike',gap:7,height:8.5});
 assert.ok(r.jumped&&!r.fell,'bike clears 7 m');assert.ok(inside(r.landing,r.target,.8),'bike lands inside footprint');}
{const r=run({mode:'walk',gap:7,height:8.5});assert.ok(!r.jumped&&r.fell,'7 m is too far on foot: falls as today');}
{const r=run({mode:'scooter',gap:6.5,height:9});assert.ok(r.jumped&&!r.fell,'scooter clears 6.5 m');}
{const r=run({mode:'moped',gap:7.5,height:9});assert.ok(r.jumped&&!r.fell,'moped clears 7.5 m');}
// 4. A higher roof: no jump (its wall stops you, exactly as before).
{const r=run({mode:'walk',gap:3,height:11});assert.ok(!r.jumped,'no jump up to a higher roof');}
{const r=run({mode:'bike',gap:3,height:12});assert.ok(!r.jumped,'no bike jump up to a higher roof');}
// 5. Gap too wide.
{const r=run({mode:'walk',gap:5.6,height:9});assert.ok(!r.jumped&&r.fell,'5.6 m too far for a jog');}
{const r=run({mode:'walk',gap:5.6,height:9,sprint:true});assert.ok(r.jumped&&!r.fell,'Shift sprint reaches 5.6 m');}
{const r=run({mode:'bike',gap:9,height:9});assert.ok(!r.jumped&&r.fell,'9 m too far even on a bike');}
// 6. Walking slowly (half stick) off the edge keeps the fall.
{const r=run({mode:'walk',gap:3,height:9,input:{x:.5,z:0}});assert.ok(!r.jumped&&r.fell,'slow walk falls');}
{const r=run({mode:'bike',gap:3,height:9,input:{x:.25,z:0}});assert.ok(!r.jumped&&r.fell,'slow bike roll falls');}
// 7. Aim cone ±32° off the edge normal.
{const a=20*Math.PI/180,r=run({gap:3,height:9,input:{x:Math.cos(a),z:Math.sin(a)},startZ:-32});assert.ok(r.jumped,'20° off the normal still jumps');}
{const a=40*Math.PI/180,r=run({gap:3,height:9,input:{x:Math.cos(a),z:Math.sin(a)},startX:72,startZ:-33.5});assert.ok(!r.jumped,'40° off the normal does not jump');}
{const a=31*Math.PI/180,r=run({gap:3,height:9,input:{x:Math.cos(a),z:Math.sin(a)},startZ:-33});assert.ok(r.jumped,'31° (a single arrow key under the fixed camera yaw) still jumps');}
assert.equal(AIM_CONE_DEG,32);
// 8. Too big a drop is a fall, not a jump.
{const r=run({gap:3,height:4});assert.ok(!r.jumped&&r.fell,'6 m drop falls');}
// 9. Planner details: reduced motion shortens the arc; landing is canLand-checked.
{const target={x:86,z:-30,w:12,d:12,height:9},roofs=[SOURCE,target];
 const surface=(x,z)=>{let h=0;for(const o of roofs)if(Math.abs(x-o.x)<o.w/2&&Math.abs(z-o.z)<o.d/2)h=Math.max(h,o.height);return h;};
 const q={x:76.1,z:-30,vx:3.7,vz:0,height:10,mode:'walk',source:SOURCE,surface,ground:()=>0,canLand:(x,z)=>surface(x,z)>0};
 const full=planRoofJump({...q,reduced:false}),reduced=planRoofJump({...q,reduced:true});
 assert.ok(full&&reduced);assert.ok(Math.abs(reduced.apex-(REDUCED_APEX+.1))<1e-9);assert.ok(reduced.duration<full.duration);assert.ok(Math.abs(full.apex-(ROOF_JUMP_LIMITS.walk.apex+.3))<1e-9);
 assert.ok(Math.abs(full.gap-3.9)<.3,'gap measured across');assert.equal(full.drop,1);
 assert.equal(planRoofJump({...q,canLand:()=>false}),null,'no safe landing: no jump');
 assert.equal(planRoofJump({...q,mode:'jetpack'}),null);
 // Obstacle standing on the target just inside its edge that the arc cannot clear.
 const tall={x:81,z:-30,w:1,d:12,height:11.5};roofs.push(tall);assert.equal(planRoofJump({...q,reduced:false}),null,'blocked by a tall prop');}
// 10. Rig inputs: foot jump pose + landing squash; ride hop pitch.
{const state={active:true,t:.5,landAge:-1,plan:{mode:'walk'},started:false,landed:false};
 {const m=roofJumpMotion(state,'walk');assert.ok(Math.abs(m.progress-.47)<1e-9&&m.height===.35);}assert.equal(roofJumpMotion(state,'bike'),undefined);
 const pl={rotation:{x:0},scale:{x:1,y:1,z:1}},ve={rotation:{x:0},scale:{x:1,y:1,z:1}};
 applyRoofJumpPose({...state,t:.05,plan:{mode:'bike'}},'bike',false,pl,ve);assert.ok(pl.rotation.x<-.2&&ve.rotation.x<-.2,'nose up off the lip');
 const pl2={rotation:{x:0},scale:{x:1,y:1,z:1}},ve2={rotation:{x:0},scale:{x:1,y:1,z:1}};
 applyRoofJumpPose({active:false,t:1,landAge:JUMP_LAND_TIME/2,plan:{mode:'bike'}},'bike',false,pl2,ve2);assert.ok(pl2.scale.y<.9,'landing squash');
 const pl3={rotation:{x:0},scale:{x:1,y:1,z:1}};applyRoofJumpPose({active:false,t:1,landAge:JUMP_LAND_TIME/2,plan:{mode:'bike'}},'bike',true,pl3,{rotation:{x:0},scale:{x:1,y:1,z:1}});assert.ok(pl3.scale.y>pl2.scale.y,'reduced motion squashes less');}
// 11. Reset mid-air cancels the jump.
{const target={x:86,z:-30,w:12,d:12,height:9},p={x:70,z:-30},v={x:0,z:0},t=createRooftopTravel([SOURCE,target],[SOURCE,target],p);t.reset(p.x,p.z);
 for(let i=0;i<200&&!t.jump.active;i++)t.update(1/60,p,v,{x:1,z:0,sprint:false},'walk');assert.ok(t.jump.active);t.reset(70,-30);assert.equal(t.jump.active,false);assert.equal(t.state.height,10);}
// 12. Edge launch (rides, no roof in reach): hop outward a vehicle-dependent distance, then today's hang/fall/splat.
{const {createRooftopTravel:mk}=load('lib/town/rooftopTravel.ts');const dist={};
 for(const mode of ['scooter','bike','moped']){
  const p={x:70,z:-30},v={x:0,z:0},t=mk([SOURCE],[SOURCE],p);t.reset(p.x,p.z);let plan=null,fallAt=null,hang=0,impact=false,maxH=0,airFrames=0;
  for(let i=0;i<900&&!impact;i++){t.update(1/60,p,v,{x:1,z:0,sprint:false},mode);if(t.jump.started)plan=t.jump.plan;if(t.jump.active){airFrames++;maxH=Math.max(maxH,t.state.height);assert.equal(t.state.falling,false);}if(t.jump.fall)fallAt=p.x;if(t.state.hangTime>0)hang++;impact ||= t.state.impact;}
  assert.ok(plan&&plan.kind==='launch',mode+' launches off the edge');assert.ok(maxH>10.5,mode+' rises on the hop');assert.ok(fallAt!==null,mode+' hands over to the fall mid-air');
  assert.ok(hang>=59,mode+' keeps the cartoon hang');assert.ok(impact,mode+' keeps the ground splat');assert.equal(t.state.height,0);
  dist[mode]=fallAt-76;assert.ok(Math.abs(dist[mode]-plan.gap)<.5,mode+' fall starts at the end of the arc');}
 assert.ok(dist.scooter<dist.bike&&dist.bike<dist.moped,'scooter < bike < moped: '+JSON.stringify(dist));
 assert.ok(dist.scooter>2.2&&dist.moped<=LAUNCH_DISTANCE.moped+.5);
 // Slow rolling off and walking still just fall.
 for(const [mode,x] of [['bike',.25],['scooter',.3],['walk',1]]){const p={x:70,z:-30},v={x:0,z:0},t=mk([SOURCE],[SOURCE],p);t.reset(p.x,p.z);let started=false,fell=false;
  for(let i=0;i<400&&!fell;i++){t.update(1/60,p,v,{x,z:0,sprint:false},mode);started ||= t.jump.started;fell ||= t.state.falling;}
  assert.ok(fell&&!started,mode+' at x='+x+' falls without a launch');}
 // A taller building 3 m ahead: the arc is clamped short of it, never inside it, and the rider ends on the ground.
 {const wall={x:70+6+3+6,z:-30,w:12,d:12,height:14},p={x:70,z:-30},v={x:0,z:0},t=mk([SOURCE,wall],[SOURCE,wall],p);t.reset(p.x,p.z);let plan=null,maxX=0,impact=false;
  for(let i=0;i<900&&!impact;i++){t.update(1/60,p,v,{x:1,z:0,sprint:false},'moped');if(t.jump.started)plan=t.jump.plan;maxX=Math.max(maxX,p.x);impact ||= t.state.impact;if(t.state.falling&&t.state.hangTime===0)v.x=0;}
  assert.ok(!plan||plan.kind==='launch');assert.ok(maxX<wall.x-wall.w/2,'never carried into the taller building ('+maxX.toFixed(2)+')');assert.equal(t.state.height,0);}
}
// 13. Launch planner: distances, reduced motion, landing on a lower roof in reach, clamps.
{const surfaceOf=roofs=>(x,z)=>{let h=0;for(const o of roofs)if(Math.abs(x-o.x)<o.w/2&&Math.abs(z-o.z)<o.d/2)h=Math.max(h,o.height);return h;};
 const lone=surfaceOf([SOURCE]),q={x:76.1,z:-30,vx:20,vz:0,height:10,mode:'bike',source:SOURCE,surface:lone,ground:()=>0,canLand:(x,z)=>lone(x,z)>0,reduced:false};
 const full=planRoofLaunch(q,20),red=planRoofLaunch({...q,reduced:true},20);
 assert.equal(full.kind,'launch');assert.ok(Math.abs(full.gap-6)<1e-6,'bike 6 m at top speed');assert.ok(red.gap<full.gap&&red.apex<full.apex,'reduced motion: shorter, lower');
 assert.ok(launchDistanceFor('bike',7,20)<launchDistanceFor('bike',20,20),'slower run-up, shorter hop');
 assert.equal(planRoofLaunch({...q,vx:5},20),null,'below ride speed: no launch');
 assert.equal(planRoofLaunch({...q,mode:'walk',vx:6},6),null,'on foot: no launch');
 assert.equal(planRoofLaunch({...q,vx:2,vz:19.9},20),null,'grazing the edge: no launch');
 assert.ok(planRoofLaunch({...q,blockedAt:(x)=>x>79},20).gap<=79-76.1-1.5+.2,'clamped short of a ground obstacle / the shore');
 // A lower roof 1 m away but only 3 m wide sits under the end of the hop at 40° (outside the jump cone): land on it.
 const low={x:79.6,z:-26,w:3,d:14,height:9},both=surfaceOf([SOURCE,low]),a=40*Math.PI/180;
 const landing=planRoofLaunch({...q,vx:20*Math.cos(a),vz:20*Math.sin(a),surface:both,canLand:(x,z)=>both(x,z)>0},20);
 assert.ok(landing&&landing.kind==='jump'&&landing.h1===9,'forgiving: the hop lands on a lower roof in reach');}
console.log('ROOFTOP_JUMP_PASS');
