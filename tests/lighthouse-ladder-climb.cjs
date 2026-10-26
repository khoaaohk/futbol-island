// East Jetty lighthouse ladder (Oct 26 2026, lib/town/lighthouseLadder.ts, lib/graphics/ladderPose.ts): the state machine through
// rooftopTravel (get on at the foot by pushing or the Climb button, climb with speed following the stick, step out onto the
// gallery, walk off and back in at the gate, climb down by tapping, SLIDE by holding down with a speed ramp and a landing squat,
// let go mid-slide to grip again), the ride rule ("Park your ride to climb"), the climbing pose (planted feet stay on their
// rungs both ways, hand over hand, no sway with reduced motion), the drawn ladder and its collisions (the ball cannot pass it),
// the camera side, the lamp and beam above the railing, and the wiring in rooftopTravel / Town.
const assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const loaded=new Map();function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const mod={exports:{}};loaded.set(file,mod.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:mod.exports,module:mod,Math,Map,Set,Uint8Array,Float32Array,Float64Array,Uint16Array,Uint32Array,Int32Array,ArrayBuffer,JSON,console,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});loaded.set(file,mod.exports);return mod.exports;}
const src=f=>fs.readFileSync(f,'utf8');
const T=require('three');
const {LIGHTHOUSE:L,lighthouseSolid,lighthouseFloor,towerSolidRadius,TOWER_FOOT_R}=load('lib/town/lighthouseGallery.ts');
const LL=load('lib/town/lighthouseLadder.ts'),{LADDER:A,ladderX,ladderZ,footX,footZ,gateX,gateZ,LADDER_FACING,createLadder}=LL;
const {fillLadderPose}=load('lib/graphics/ladderPose.ts'),{createTrickPose}=load('lib/graphics/trickPose.ts');
const W=load('lib/town/lighthouseGalleryWorld.ts');
const {createRooftopTravel}=load('lib/town/rooftopTravel.ts');
const {JETTY_BEACON,KEEPER_HUT,onEastPier}=load('lib/town/eastPier.ts');
let checks=0;const ok=(c,m)=>{assert(c,m);checks++;};
const DT=1/60,IN={x:-A.nx,z:-A.nz},OUT={x:A.nx,z:A.nz};// stick up (toward the tower, screen-up) and down (out, screen-down)
const stick=(d,k=1)=>({x:d.x*k,z:d.z*k,sprint:false});
const tower={x:JETTY_BEACON.x,z:JETTY_BEACON.z,w:TOWER_FOOT_R*2,d:TOWER_FOOT_R*2,cornerRadius:TOWER_FOOT_R};
const hut={x:KEEPER_HUT.x,z:KEEPER_HUT.z,w:KEEPER_HUT.w+.2,d:KEEPER_HUT.d+.2};
const benches=[-1,1].map(s=>({x:L.cx-.8,z:L.cz+s*5,w:2,d:.7}));
const ladderFoot={x:L.cx+A.nx*A.r,z:L.cz+A.nz*A.r,w:.6,d:.6};
const obstacles=[tower,hut,...benches,ladderFoot];
const fresh=()=>{const t=createRooftopTravel([],obstacles,{x:0,z:0}),p={x:footX+A.nx*.6,z:footZ+A.nz*.6},v={x:0,z:0};t.reset(p.x,p.z,0);return {t,p,v};};
const run=(t,p,v,input,mode,secs,until)=>{let i=0;for(;i<secs*60;i++){t.update(DT,p,v,input,mode);if(until&&until())break;}return i/60;};

// ---- Placement: on the camera side (the fixed follow camera sits at +18 x, +30 z), clear of the hut, benches and hunt ball, on
//      the plaza, just outside the gallery deck, the rails outside the tower and its corbel at every height.
{const cam=Math.hypot(18,30);ok((18*A.nx+30*A.nz)/cam>.9,'the ladder faces the follow camera (never behind the tower)');
 ok(A.r>L.galleryR+.15&&A.r-.03>towerSolidRadius(.5)+.2,'the rails stand outside the deck edge and the plinth');
 for(let y=0;y<=L.top;y+=.1)ok(A.r-.03>towerSolidRadius(y)+.15,'rails clear of the tower at '+y.toFixed(1));
 ok(onEastPier(footX,footZ)&&onEastPier(ladderX,ladderZ),'the foot is on the plaza');
 for(const o of [hut,...benches])ok(Math.abs(footX-o.x)>o.w/2+.6||Math.abs(footZ-o.z)>o.d/2+.6,'the foot is clear of the hut and benches');
 const b=load('lib/town/eastJettyBalls.ts').EAST_JETTY_BALL_SPOTS.find(s=>s.id==='jetty-lighthouse');ok(Math.hypot(b.x-footX,b.z-footZ)>1.5,'clear of the hunt ball');
 ok(Math.abs(Math.atan2(gateZ-L.cz,gateX-L.cx)-L.openAt)<1e-9&&Math.abs(A.bearing-L.openAt)<1e-12,'the ladder arrives at the railing\'s gate');}

// ---- Climb up: push into the foot (no button), climb with a full stick, step out onto the gallery.
{const {t,p,v}=fresh();
 run(t,p,v,stick(IN),'walk',2,()=>t.ladder.active);ok(t.ladder.active,'pushing into the foot gets on');
 run(t,p,v,stick(IN),'walk',1,()=>t.ladder.state.phase==='climb');ok(t.ladder.state.phase==='climb'&&Math.hypot(p.x-ladderX,p.z-ladderZ)<1e-6,'on the ladder, at its line');
 let last=t.state.height,mono=true,secs=0;for(let i=0;i<60*20&&t.ladder.state.phase==='climb';i++){t.update(DT,p,v,stick(IN),'walk');secs+=DT;if(t.state.height<last-1e-9)mono=false;last=t.state.height;ok(!t.state.falling&&v.x===0&&v.z===0,'no fall, no drift on the ladder');}
 ok(mono,'climbing only goes up');ok(Math.abs(secs-L.top/A.climbSpeed)<.3,`full stick climbs at ${A.climbSpeed} m/s (${secs.toFixed(1)} s for ${L.top} m)`);
 ok(t.ladder.state.phase==='topOut','at the top it steps out');
 run(t,p,v,stick(IN),'walk',2,()=>!t.ladder.active);
 ok(!t.ladder.active&&t.state.height===L.top&&Math.hypot(p.x-gateX,p.z-gateZ)<.05,'standing on the gallery inside the gate');
 // Walk round the gallery freely (away from the gate): stays up, never back on the ladder.
 for(const d of [{x:-1,z:0},{x:0,z:-1},{x:1,z:-.3}]){run(t,p,v,stick(d),'walk',2);ok(!t.ladder.active&&t.state.height===L.top,'walks round the gallery');}
 // A half stick climbs at half speed.
 const f=fresh();run(f.t,f.p,f.v,stick(IN),'walk',2,()=>f.t.ladder.state.phase==='climb');const h0=f.t.state.height;run(f.t,f.p,f.v,stick(IN,.5),'walk',2);
 ok(Math.abs((f.t.state.height-h0)/2-A.climbSpeed*.5)<.05,'speed follows the stick ('+((f.t.state.height-h0)/2).toFixed(2)+' m/s at half stick)');
 // Stick released: holds on, still.
 const h1=f.t.state.height;run(f.t,f.p,f.v,stick(IN,0),'walk',1);ok(f.t.state.height===h1&&f.t.ladder.active,'stick released: holds on where it is');}

// ---- The Climb button at the foot, and Climb down at the gate (no pushing).
{const {t,p,v}=fresh();t.ladder.request();t.update(DT,p,v,stick(IN,0),'walk');ok(t.ladder.active,'Climb (button) gets on at the foot');
 const g=fresh();g.t.reset(gateX-A.nx*.3,gateZ-A.nz*.3,L.top);g.p.x=gateX-A.nx*.3;g.p.z=gateZ-A.nz*.3;g.t.ladder.request();g.t.update(DT,g.p,g.v,stick(IN,0),'walk');
 ok(g.t.ladder.state.phase==='topIn','Climb down (button) at the gate backs out onto the ladder');
 const far=fresh();far.t.reset(L.cx-5.5,L.cz,0);far.p.x=L.cx-5.5;far.p.z=L.cz;far.t.ladder.request();far.t.update(DT,far.p,far.v,stick(IN,0),'walk');ok(!far.t.ladder.active,'the button does nothing away from the ladder');}

// ---- Down by tapping (a light stick, never a slide), from pushing out at the gate; a soft step off at the foot.
{const {t,p,v}=fresh();t.reset(gateX,gateZ,L.top);p.x=gateX;p.z=gateZ;
 run(t,p,v,stick(OUT),'walk',1,()=>t.ladder.active);ok(t.ladder.state.phase==='topIn','pushing out at the gate gets on (facing the ladder)');
 run(t,p,v,stick(OUT,.5),'walk',2,()=>t.ladder.state.phase==='climb');
 let slid=false,mono=true,last=t.state.height;for(let i=0;i<60*25&&t.ladder.state.phase==='climb';i++){t.update(DT,p,v,stick(OUT,.5),'walk');if(t.ladder.state.phase==='slide')slid=true;if(t.state.height>last+1e-9)mono=false;last=t.state.height;}
 ok(!slid&&mono,'a light hold down climbs down rung by rung (no slide)');ok(t.ladder.state.phase==='land'&&t.ladder.state.impact===0,'a gentle landing at the foot');
 run(t,p,v,stick(OUT,0),'walk',1,()=>!t.ladder.active);ok(!t.ladder.active&&t.state.height===0&&!t.state.falling&&t.state.recovery===0,'steps off onto the plaza, no fall, no daze');
 ok(Math.hypot(p.x-footX,p.z-footZ)<.15,'standing at the foot');
 // Pushing down at the very bottom while climbing steps off too.
 const f=fresh();run(f.t,f.p,f.v,stick(IN),'walk',1,()=>f.t.ladder.state.phase==='climb');run(f.t,f.p,f.v,stick(IN),'walk',.3);run(f.t,f.p,f.v,stick(OUT,.5),'walk',3,()=>!f.t.ladder.active);ok(!f.t.ladder.active&&f.t.state.height===0,'down at the bottom steps off');}

// ---- SLIDE: hold down firmly. A short hold first (tapping never slides), then a speed ramp to the cap, faster than climbing;
//      a squat at the bottom; letting go mid-slide grips again.
{const {t,p,v}=fresh();t.reset(gateX,gateZ,L.top);p.x=gateX;p.z=gateZ;run(t,p,v,stick(OUT),'walk',2,()=>t.ladder.state.phase==='climb');
 let held=0;while(t.ladder.state.phase==='climb'&&held<2){t.update(DT,p,v,stick(OUT),'walk');held+=DT;}
 ok(t.ladder.state.phase==='slide'&&Math.abs(held-A.slideHold)<.05,`a slide after holding down ${held.toFixed(2)} s`);
 const speeds=[];let secs=0;while(t.ladder.state.phase==='slide'&&secs<10){t.update(DT,p,v,stick(OUT),'walk');if(t.ladder.state.phase==='slide')speeds.push(-t.ladder.state.speed);secs+=DT;}
 ok(speeds.every((s,i)=>i===0||s>=speeds[i-1]-1e-9),'the slide speeds up smoothly (never jerks back)');
 ok(Math.max(...speeds)<=A.slideMax+1e-9&&Math.max(...speeds)>A.climbSpeed*2,`ramps to ${Math.max(...speeds).toFixed(1)} m/s (cap ${A.slideMax})`);
 ok(speeds[1]-speeds[0]<=A.slideAccel*DT+1e-6,'a ramp, not a jump in speed');
 ok(secs<L.top/A.climbSpeed*.6,`faster than climbing down (${secs.toFixed(1)} s)`);
 ok(t.ladder.state.phase==='land'&&t.ladder.state.impact>.3,'a squat landing after a fast slide');
 const pose=createTrickPose();let minPelvis=1;while(t.ladder.active){t.update(DT,p,v,stick(OUT,0),'walk');fillLadderPose(pose,t.ladder.state,false);if(t.ladder.active)minPelvis=Math.min(minPelvis,pose.pelvisY);}
 ok(minPelvis<.75,'the landing squats ('+minPelvis.toFixed(2)+')');ok(t.state.height===0&&!t.state.falling&&t.state.recovery===0,'stands up on the plaza');
 // Let go mid-slide: the hands grip again quickly and it holds on.
 const g=fresh();g.t.reset(gateX,gateZ,L.top);g.p.x=gateX;g.p.z=gateZ;run(g.t,g.p,g.v,stick(OUT),'walk',3,()=>g.t.ladder.state.phase==='slide');run(g.t,g.p,g.v,stick(OUT),'walk',.8);
 const t0=run(g.t,g.p,g.v,stick(OUT,0),'walk',2,()=>g.t.ladder.state.phase==='climb');ok(g.t.ladder.state.phase==='climb'&&t0<.6&&g.t.state.height>1,`letting go grips again in ${t0.toFixed(2)} s`);}

// ---- Rides cannot climb: pushing a ride into the foot only raises the note (once per push), never gets on.
for(const mode of ['scooter','bike','moped']){const t=createRooftopTravel([],obstacles,{x:0,z:0}),p={x:footX+A.nx*1,z:footZ+A.nz*1},v={x:0,z:0};t.reset(p.x,p.z,0);
 run(t,p,v,stick(IN),mode,2);ok(!t.ladder.active&&t.state.height<.4,mode+' never gets on');ok(t.ladder.state.rideBlocked===1,mode+': one "Park your ride to climb" note per push ('+t.ladder.state.rideBlocked+')');
 t.ladder.request();t.update(DT,p,v,stick(IN,0),mode);ok(!t.ladder.active,mode+': the button does nothing on a ride');}
// The ride switch (or Fly) mid-ladder lets go: cancel() hands the player back.
{const {t,p,v}=fresh();run(t,p,v,stick(IN),'walk',3);ok(t.ladder.active,'on the ladder');t.ladder.cancel();ok(!t.ladder.active,'cancel lets go');
 ok(/if\(rideRef\.current!=='walk'&&rooftop\.ladder\.active\)rooftop\.ladder\.cancel\(\)/.test(src('components/Town.tsx')),'Town lets go when a ride or Fly is chosen');}

// ---- The pose: planted feet stay on their rungs both ways, hand over hand (opposite hand with foot), sway off with reduced
//      motion, slide = crossed feet + both hands out on the rails, facing the tower. No allocation.
{const s={phase:'climb',y:5,speed:1.8,t:0,cycle:0,holdDown:0,impact:0,fromX:0,fromZ:0,k:0,rideBlocked:0,rungs:0,slides:0,landed:0},p=createTrickPose();
 for(const dir of [1,-1]){let prev=null;for(let i=0;i<200;i++){const dy=dir*.01;s.y+=dy;s.cycle+=dy/(2*A.rungStep);s.speed=dir*1.8;fillLadderPose(p,s,false);
   const f=s.cycle-Math.floor(s.cycle),world=s.y+p.legs[0].y;if(prev!==null&&f<.69&&prev.f<.69&&Math.abs(f-prev.f)<.1)ok(Math.abs(world-prev.world)<1e-6,`a planted foot stays on its rung (${dir>0?'up':'down'})`);prev={f,world};}}
 s.cycle=.1;ok(fillLadderPose(p,s,false)===1,'climb pose on');
 s.cycle=.8;fillLadderPose(p,s,false);ok(p.legs[0].y>p.legs[1].y-.3&&p.arms[1].sx<-2,'the stepping foot rises with the opposite hand reaching');
 s.cycle=.3;fillLadderPose(p,s,false);ok(Math.abs(p.pelvisRoll)>.01,'a slight hip sway');fillLadderPose(p,s,true);ok(p.pelvisRoll===0&&p.pelvisYaw===0,'no sway with reduced motion');
 s.speed=-1.8;fillLadderPose(p,s,false);ok(p.headPitch>0,'looks down going down');s.speed=1.8;fillLadderPose(p,s,false);ok(p.headPitch<0,'looks up going up');
 s.phase='slide';fillLadderPose(p,s,false);ok(p.legs[0].x>0&&p.legs[1].x<0&&p.legs[0].toe>.3,'sliding: feet crossed and off the rungs');ok(p.arms[0].sz>=.25&&p.arms[1].sz>=.25&&p.arms[0].sx<-1.4,'sliding: both hands out on the side rails');
 s.phase='off';ok(fillLadderPose(p,s,false)===0,'off the ladder: no pose (the rig fades it out)');
 ok(Math.abs(LADDER_FACING-Math.atan2(L.cx-ladderX,L.cz-ladderZ))<1e-9,'faces the tower on the ladder');
 const body=fillLadderPose.toString();ok(!/new |\[\]|\{\}/.test(body),'fillLadderPose allocates nothing');
 const step=createLadder().step.toString().replace(/\/\/.*$/gm,'');ok(!/new |\[\]/.test(step),'the ladder step allocates nothing');}

// ---- Drawn: one white merged geometry, rails from the plaza to grab handles above the deck, rungs every 0.3 m, stand-offs that
//      end at the tower, nothing in the gate's walking gap above the deck. The ball cannot pass through it (a slab).
{const g=W.buildLadderGeometry(),pos=g.getAttribute('position').array;let maxY=0,minY=9,inGap=0;const ux=Math.cos(L.openAt),uz=Math.sin(L.openAt);
 for(let i=0;i<pos.length;i+=3){const x=pos[i],y=pos[i+1],z=pos[i+2],out=x*ux+z*uz,side=-x*uz+z*ux,r=Math.hypot(x,z);maxY=Math.max(maxY,y);minY=Math.min(minY,y);
  ok(r>=towerSolidRadius(y)-.08,'nothing inside the tower (stand-offs end at its skin)');if(y>L.top+.05&&Math.abs(side)<A.half-.05)inGap++;ok(out<=A.r+.04,'nothing outside the rails');}
 ok(Math.abs(minY)<1e-6&&Math.abs(maxY-(L.top+A.railAbove))<1e-6,`rails from the plaza to ${A.railAbove} m above the deck`);
 ok(inGap===0,'nothing across the gap you step through at the top');
 ok(W.LADDER_RUNGS.length>=40&&W.LADDER_RUNGS.every((y,i)=>i===0||Math.abs(y-W.LADDER_RUNGS[i-1]-A.rungStep)<1e-9)&&W.LADDER_RUNGS[W.LADDER_RUNGS.length-1]<L.top,'rungs every 0.3 m up to the deck');
 ok(pos.length/3<2500,`a slim ladder (${pos.length/3} vertices)`);
 const puts=[];W.buildLighthouseGallery((geo,c,x,y,z)=>{puts.push(c);return new T.Mesh(geo);});ok(puts.every(c=>c==='#f3ecdc'),'white, the tower\'s own colour (one batch, no new material)');
 for(const y of [.5,3.33,7.1,13]){ok(lighthouseSolid(L.cx+ux*A.r,L.cz+uz*A.r,y)&&lighthouseSolid(L.cx+ux*A.r-uz*.2,L.cz+uz*A.r+ux*.2,y),'the ball meets the ladder at '+y);}
 ok(!lighthouseSolid(L.cx+ux*(A.r+.4),L.cz+uz*(A.r+.4),2),'just in front of the ladder is free');
 ok(lighthouseFloor(footX,footZ,0)===-Infinity,'no stair-like floor at the foot');}

// ---- The lamp and its beam sit above the railing: the beam's apex at LIGHTHOUSE.lampY, every part of the sweep within the
//      gallery's radius well above the railing's top and the deck, no shadow from it, no scene light.
{const lh=load('lib/graphics/lighthouseBeam.ts'),scene=new T.Scene(),beam=lh.createLighthouseBeam(scene,{x:L.cx,z:L.cz},L.lampY);
 ok(beam.group.position.y===L.lampY&&L.lampY-(L.top+L.railH)>=.9,`the beam starts at the lamp (${L.lampY} m, ${(L.lampY-L.top-L.railH).toFixed(2)} m over the railing)`);
 const pos=beam.beam.geometry.getAttribute('position').array,idx=beam.beam.geometry.getIndex().array;let lowest=Infinity;
 for(let k=0;k<idx.length;k+=3)for(let a=0;a<3;a++)for(let b=0;b<3;b++)for(let s=0;s<=1;s+=.01){// points on each triangle's edges and medians
  const i=idx[k+a]*3,j=idx[k+b]*3,x=pos[i]+(pos[j]-pos[i])*s,y=pos[i+1]+(pos[j+1]-pos[i+1])*s,z=pos[i+2]+(pos[j+2]-pos[i+2])*s;
  if(Math.hypot(x,z)<=L.galleryR+.3)lowest=Math.min(lowest,L.lampY+y);}
 ok(lowest>L.top+L.railH+.25,`the beam clears the railing (lowest ${lowest.toFixed(2)} m within the gallery vs railing top ${L.top+L.railH} m)`);
 ok(beam.beam.castShadow===false&&beam.halo.castShadow===false,'the beam casts no shadow');let lights=0;scene.traverse(o=>{if(o.isLight)lights++;});ok(lights===0,'no scene light');beam.dispose();}

// ---- Wiring.
{const r=src('lib/town/rooftopTravel.ts'),t=src('components/Town.tsx');
 ok(/if\(ladder\.step\(dt,p,v,input\.x,input\.z,mode,state\.height,state\.falling\)\)\{state\.height=ladder\.state\.y;state\.air=false;return;\}/.test(r)&&/ladder\.cancel\(\)/.test(r)&&/return \{state,ladder,/.test(r),'rooftopTravel runs the ladder (and reset lets go)');
 ok(/trick:onLadder\?ladderPose:undefined/.test(t)&&/facing:onLadder\?LADDER_FACING:/.test(t),'Town poses and turns the climber');
 ok(/data-ladder-go/.test(t)&&/'Climb down':'Climb'/.test(t)&&/key:'ladder'/.test(t),'the Climb / Climb down prompt');
 ok(/Park your ride to climb/.test(t)&&/sound\.stair\('walk'/.test(t)&&/sound\.boost\('forward'\)/.test(t)&&/sound\.land\(ls\.impact\)/.test(t),'the ride note and the sounds (rung tread, slide whoosh, landing)');}
console.log(`PASS lighthouse ladder: ${checks} checks (climb, step out, tap down, slide ramp + squat, ride rule, pose, drawing, ball, beam above the railing)`);
