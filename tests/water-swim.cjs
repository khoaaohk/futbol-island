// The water state machine and HUD (Oct 15 2026, lib/town/water/waterState.ts, waterHud.ts; docs/swimming-research.md §2.1–2.3):
// land → wade → swim → back out, the ball parked on the sand (decision 3), the action swap (the ride switcher: swim + jetpack
// only), the splash-down sequence (fall / roof / launch / jetpack "Drop in") and its splash + cue, Float (tap) and the lazy
// circle (hold), Sprint, reduced motion, analytics buckets and the Town wiring.
// Run: node tests/water-swim.cjs
const assert=require('node:assert/strict'),fs=require('node:fs');
const {createLoader}=require('./summit-harness.cjs');
const load=createLoader();
const W=load('lib/town/water/waterDepth.ts'),S=load('lib/town/water/waterState.ts'),H=load('lib/town/water/waterHud.ts');
let failed=0;const ok=(name,fn)=>{try{fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};

// A round island of radius 10 at the origin; the sea everywhere else inside the world.
const island=()=>W.createWaterProbe((x,z)=>Math.max(0,Math.hypot(x,z)-10),(x,z)=>Math.hypot(x,z)<=10,()=>false);
const input=(o={})=>({stick:0,moving:false,speed:0,landY:0,yaw:Math.PI/2,airborne:false,...o});
/** Walk the state from x0 to x1 along z=0 at `mps`, stepping at 60 Hz; returns every event raised. */
function walk(water,x0,x1,mps,extra={}){const raised=[];let x=x0;const dir=Math.sign(x1-x0);
 while(dir>0?x<x1:x>x1){x+=dir*mps/60;const ev=water.step(1/60,x,0,input({stick:1,moving:true,speed:mps,...extra}));
  for(const k of Object.keys(ev))if(ev[k])raised.push(k+(typeof ev[k]==='number'?':'+ev[k].toFixed(2):''));}
 return {x,raised};}

ok('land → ankle → knee → waist → swim, then back out: zones, root height, speeds, the pose, the events',()=>{
 let reduced=false;const water=S.createWaterState(island(),()=>reduced);
 assert.equal(water.inWater,false);assert.equal(water.speedScale,1);
 // Walking on the sand: nothing happens, the last dry spot is remembered.
 for(let i=0;i<30;i++)water.step(1/60,9.5,0,input({landY:.1}));
 assert.equal(water.state.phase,'land');assert.equal(water.state.rootY,.1);
 const {raised}=walk(water,9.5,10.4,1);
 assert(raised.includes('entered'),'entered the shallows: '+raised);assert.equal(water.state.phase,'wade');assert.equal(water.state.zone,'ankle');
 assert.equal(water.speedScale,W.WADE_SPEED.ankle);
 // The ball is parked on the last dry spot, its lead turned to stay on land (the walker faced the sea: yaw π/2 = +x).
 const park=water.state.park;assert(park&&Math.hypot(park.x,park.z)<=10,'parked on land');
 assert(Math.hypot(park.x+Math.sin(park.yaw)*.56,park.z+Math.cos(park.yaw)*.56)<=10,'the ball\'s 0.56 m lead stays on the sand');
 // Deeper: the zones in order, the root lowering onto the shelf, ripples while moving.
 const r2=walk(water,10.4,11.2,1);assert.equal(water.state.zone,'knee');assert.equal(water.speedScale,W.WADE_SPEED.knee);assert(r2.raised.some(e=>e.startsWith('ripple')),'wading ripples');
 walk(water,11.2,12,1);assert.equal(water.state.zone,'waist');assert.equal(water.speedScale,W.WADE_SPEED.waist);
 assert(water.state.rootY<W.WADE_FOOT_Y-.5&&water.state.rootY>W.wadeRootY(W.DEPTH_MAX),'the root is down on the shelf: '+water.state.rootY);
 assert.equal(water.pose.w,0,'no swim pose while wading');assert.equal(water.swimming,false);
 const r3=walk(water,12,13,1);assert(r3.raised.includes('swimStarted'),'swimStarted: '+r3.raised);assert.equal(water.state.phase,'swim');assert.equal(water.swimming,true);
 assert.equal(water.speedScale,1,'swimming has its own step');
 // Swim out 10 m: the crawl pose, its stroke clock moving, crawl ripples; the root settles on the swim line.
 const r4=walk(water,13,23,1.8);assert.equal(water.pose.kind,'crawl');assert(water.pose.phase>0);assert(r4.raised.filter(e=>e==='wake').length>=5&&r4.raised.filter(e=>e.startsWith('stroke')).length>=3,'the wake and the strokes: '+r4.raised.filter(e=>e==='wake'||e.startsWith('stroke')).length);
 assert(Math.abs(water.state.rootY-W.SWIM_ROOT_Y)<.01,'root on the swim line '+water.state.rootY);
 // Stop: treading water; resting = the idle rule may apply.
 for(let i=0;i<60;i++)water.step(1/60,23,0,input());assert.equal(water.pose.kind,'tread');assert.equal(water.resting(),true);
 // Float: a little bob under, then the back float; stick input ends it.
 assert.equal(water.press('float','tap'),true);assert.equal(water.events.floated,false,'a press raises its event on the next step');
 assert.equal(water.step(1/60,23,0,input()).floated,true);assert.equal(water.step(1/60,23,0,input()).floated,false,'once');assert.equal(water.state.floating,true);assert.equal(water.pose.kind,'float');assert(water.state.rootY<=W.SWIM_ROOT_Y);
 for(let i=0;i<60;i++)water.step(1/60,23,0,input());assert(Math.abs(water.state.rootY-W.SWIM_ROOT_Y)<.05,'back up after the bob');
 water.step(1/60,23,0,input({stick:.5}));assert.equal(water.state.floating,false,'the stick ends the float');
 // Swim fast: the hold, only while swimming and moving.
 water.press('swimfast','down');assert.equal(water.step(1/60,23,0,input({stick:1,moving:true,speed:2.6})).sped,true);assert.equal(water.pose.fast,1);assert.equal(water.pose.kind,'crawl');
 water.press('swimfast','up');water.step(1/60,23,0,input({stick:1,moving:true,speed:1.8}));assert.equal(water.pose.fast,0);
 // Float held (user, Oct 15 2026: "holding floats makes you float in a circle"): a hold past FLOAT_HOLD_S starts the lazy circle on
 // the back (one turn per CIRCLE_PERIOD s, soft rings), the stick is ignored, resting() is false; release = treading again.
 for(let i=0;i<30;i++)water.step(1/60,23,0,input());assert.equal(water.state.floating,false);
 assert.equal(water.press('float','down'),true);for(let i=0;i<10;i++)water.step(1/60,23,0,input());assert.equal(water.state.circling,false,'not yet: a tap window');
 let circled=false,rings=0,headings=[];for(let i=0;i<Math.round(S.CIRCLE_PERIOD*60);i++){const ev=water.step(1/60,23,0,input({stick:1}));if(ev.circled)circled=true;if(ev.ripple)rings++;if(i%60===0)headings.push(Math.atan2(water.state.circleZ,water.state.circleX));}
 assert(circled,'the circle event');assert.equal(water.state.circling,true);assert.equal(water.state.floating,true,'on the back');assert.equal(water.pose.kind,'float');assert.equal(water.resting(),false,'drifting round is travel, not idle');
 assert(rings>=5&&rings<=8,'soft rings while circling: '+rings);assert(Math.hypot(water.state.circleX,water.state.circleZ)>.99,'a unit heading');
 assert(new Set(headings.map(h=>Math.round(h*2))).size>=5,'the heading sweeps round: '+headings.map(h=>h.toFixed(1)));
 assert(S.CIRCLE_PERIOD>=6&&S.CIRCLE_PERIOD<=8&&S.CIRCLE_INPUT>0&&S.CIRCLE_INPUT<1,'one turn per 6–8 s at a slow drift');
 assert.equal(water.press('float','up'),true);assert.equal(water.state.circling,false);assert.equal(water.state.floating,false,'release: treading');water.step(1/60,23,0,input());assert.equal(water.pose.kind,'tread');
 // A short press is the tap: on the back; a second short press: off again.
 water.press('float','down');water.step(1/60,23,0,input());water.press('float','up');water.step(1/60,23,0,input());assert.equal(water.state.floating,true,'a short press floats');
 water.press('float','down');water.step(1/60,23,0,input());water.press('float','up');assert.equal(water.state.floating,false,'and again: treading');
 // Swim and wade back in: swim → waist → … → land; the swim's seconds come out once; the ball park is released.
 const r5=walk(water,23,12,1.8);assert(r5.raised.some(e=>e.startsWith('swimSeconds')),'swim time on leaving the swim zone: '+r5.raised.join(' '));assert.equal(water.state.phase,'wade');
 const r6=walk(water,12,9.5,1);assert(r6.raised.includes('left'),'left the water');assert.equal(water.state.phase,'land');assert.equal(water.state.park,null);assert.equal(water.inWater,false);assert.equal(typeof water.backToShore,'undefined','no auto-swim to shore any more (the jetpack and swimming cover it)');
 assert.equal(water.pose.w,0);assert.equal(water.state.rootY,0,'the land height again');
});

ok('the wake and the strokes while swimming; Fly up: the jetpack takes off out of the water',()=>{
 const water=S.createWaterState(island(),()=>false);
 walk(water,9.5,14,1);assert.equal(water.state.phase,'swim');
 // Four seconds of crawl: wake pairs every WAKE_STEP, an arm splash per stroke alternating sides; faster on Swim fast.
 const count=(fast,seconds)=>{if(fast)water.press('swimfast','down');else water.press('swimfast','up');let wakes=0,strokes=0,sides=new Set();
  for(let i=0;i<seconds*60;i++){const ev=water.step(1/60,20,0,input({stick:1,moving:true,speed:fast?3.1:1.8}));if(ev.wake)wakes++;if(ev.stroke){strokes++;sides.add(ev.stroke);}}return {wakes,strokes,sides};};
 const slow=count(false,4),fast=count(true,4);
 assert(slow.wakes>=9&&slow.wakes<=12,'wake pairs at ~0.38 s: '+slow.wakes);assert(slow.strokes>=5&&slow.strokes<=9,'strokes: '+slow.strokes);assert.deepEqual([...slow.sides].sort(),[-1,1],'both arms');
 assert(fast.wakes>slow.wakes&&fast.strokes>slow.strokes,'Swim fast: a quicker wake and stroke');
 assert(W.SWIM_FAST_SPEED/W.SWIM_SPEED>=1.6&&W.SWIM_FAST_SPEED/W.SWIM_SPEED<=1.8,'Swim fast is 1.6–1.8× the crawl');
 // Treading: soft rings only, no wake.
 water.press('swimfast','up');let wakes=0,rings=0;for(let i=0;i<300;i++){const ev=water.step(1/60,20,0,input());if(ev.wake||ev.stroke)wakes++;if(ev.ripple)rings++;}assert.equal(wakes,0);assert(rings>=2&&rings<=4,'tread rings '+rings);
 // Reduced motion: the stroke clock stands still, so no arm splashes; the wake pairs still mark the way (the host gates them off anyway).
 const still=S.createWaterState(island(),()=>true);walk(still,9.5,14,1);let strokes=0;for(let i=0;i<240;i++){if(still.step(1/60,20,0,input({stick:1,moving:true,speed:1.8})).stroke)strokes++;}assert.equal(strokes,0);
 // Fly up: only in the water; raised on the next step as `flew`, the water state ends cleanly (no park, dry).
 assert.equal(S.createWaterState(island(),()=>false).takeOff(),false,'not in the water: nothing');
 assert.equal(water.takeOff(),true);const ev=water.step(1/60,20,0,input());
 assert.equal(ev.flew,true);assert.equal(ev.left,true);assert.equal(water.inWater,false);assert.equal(water.state.park,null);assert.equal(water.pose.w,0);
 assert.equal(water.step(1/60,20,0,input({airborne:true})).flew,false,'once');
 // The ride switcher in the water (user, Oct 15 2026: "don't allow walking, biking, scooter or moped. change icon to swimming and
 // jetpack only"): the ride slot is the swim icon; with fuel a tap is the jetpack (fly up), without fuel the same swim icon answers
 // with a hint (aria-disabled); never walk / scooter / bike / moped. The same two choices while wading.
 const fly=H.waterButtonsFor({inWater:true,swimming:true,flyOk:true}),noFuel=H.waterButtonsFor({inWater:true,swimming:true,flyOk:false}),wadeFly=H.waterButtonsFor({inWater:true,swimming:false,flyOk:true});
 assert.deepEqual(fly.map(b=>b.id),['swimfast','float','swimride']);assert.deepEqual(fly.map(b=>b.slot),['shoot','juggle','ride']);assert.equal(fly[2].icon,'swim');assert.equal(fly[2].enabled,true);assert.match(fly[2].label,/jetpack/i);
 assert.deepEqual(noFuel.map(b=>b.id),['swimfast','float','swimride']);assert.equal(noFuel[2].icon,'swim');assert.equal(noFuel[2].enabled,false,'no fuel: the jetpack is not offered (the swim icon stays, with a hint)');
 assert.equal(wadeFly[2].id,'swimride');assert.equal(wadeFly[2].enabled,true);
 for(const row of [fly,noFuel,wadeFly])for(const b of row){assert(!['walk','scooter','bike','moped'].includes(b.icon),'no land ride in the water: '+b.icon);assert.notEqual(b.id,'shore','To shore is gone from the cluster');}
 assert.equal(H.waterKeyAction('KeyR','r'),'swimride','R (the land ride key) is the switcher');assert.equal(H.waterKeyAction('KeyE','e'),'swimride');
 // Water actions show only their icon (user, Oct 15 2026): the caption is skipped for the water ids.
 assert.match(fs.readFileSync('components/JobActionButton.tsx','utf8'),/WATER_IDS\.has\(b\.id\)\?null:<small>/,'water buttons are icon-only');
 const words=fs.readFileSync('components/JobActionButton.tsx','utf8');assert(/\bswimride:'/.test(words));assert.match(words,/WATER_IDS=new Set\(\['swimfast','float','swimride'(,'letgo')?(,'tuck','spin','wave')?\]\)/);/* + water P1b's Let go */
 const town=fs.readFileSync('components/Town.tsx','utf8');assert.match(town,/const flyUp=\(\)=>\{if\(!water\.inWater\|\|rideRef\.current!=='walk'\|\|!fuelStore\.canUse\('jetpack'\)\)return false;/,'fuel-gated');
 // QA Oct 16 2026: the gate must not raise the land fuel notice ("Walk to a Konbini…"), which hid SWIM_RIDE_NOTE from a swimmer.
 assert.doesNotMatch(town.match(/const flyUp=[^\n]*/)[0],/fuelAllowsRide/,'the swim switcher uses the silent fuel check, so SWIM_RIDE_NOTE is the one note');
 assert.match(town,/rooftop\.reset\(x,z,water\.state\.rootY\);/,'the climb starts from the water line');
 assert.match(town,/if\(id==='swimride'\)\{if\(phase!=='tap'\)return;if\(flyUp\(\)\)\{tapHaptic\(\);sound\.ui\('click'\);\}else fuelStore\.say\('No fuel',SWIM_RIDE_NOTE\);return;\}/,'the switcher: fly up, or the hint');
 assert.match(town,/const selectRide=\(mode:TravelMode\)=>\{if\(waterStore\.get\(\)\.inWater\)return;/,'no land ride can be picked in the water');
 assert.match(town,/if\(id==='swimfast'\|\|id==='float'\)\{if\(down&&!e\.repeat\)waterActions\.press\(id,'down'\);else if\(!down\)waterActions\.press\(id,'up'\);\}/,'Q is a hold too');
 // A scooter / bike / moped that splashes down swims (walk), and the ride comes back on the first dry step (cheaper than parking it).
 assert.match(town,/if\(rideRef\.current!=='walk'\)\{if\(rideRef\.current!=='jetpack'\)rideBeforeWater=rideRef\.current;rideRef\.current='walk';setRideMode\('walk'\);\}/,'a mid-ride drop swims');
 assert.match(town,/if\(ev\.left&&rideBeforeWater\)\{const m=rideBeforeWater;rideBeforeWater=null;if\(rideRef\.current==='walk'&&rideAllowed\(m,jobActiveRef\.current\)&&fuelAllowsRide\(m\)\)\{rideRef\.current=m;setRideMode\(m\);\}\}/,'handed back on the sand');
 assert.match(town,/if\(water\.state\.circling\)\{mx=water\.state\.circleX\*CIRCLE_INPUT;mz=water\.state\.circleZ\*CIRCLE_INPUT;\}/,'the circle steers the swim step');assert(!/backToShore|state\.shore/.test(town),'no auto-swim left in Town');
 assert.match(town,/if\(waterKey\(e,true\)\)return;[^\n]*if\(e\.target instanceof HTMLButtonElement&&\['Enter',' '\]\.includes\(e\.key\)\)return;/,'water keys before the focused-button rule');
 assert.match(town,/if\(\(ev\.wake\|\|ev\.stroke\)&&waterFxOn\(\)\)/,'the wake obeys the fx gate');
});

ok('hysteresis holds the zone on the line',()=>{
 const water=S.createWaterState(island(),()=>false);
 walk(water,9.5,10.8,1);assert.equal(water.state.zone,'knee');// 0.36 m: past the line plus the hysteresis
 // Shuffle ±0.08 m round the knee line (0.25 m ⇔ 10.556 m): the zone never flickers (it would take < 0.20 m to leave knee).
 const zones=new Set();for(let i=0;i<120;i++){water.step(1/60,10.556+(i%2?.08:-.08),0,input({stick:1,moving:true,speed:1}));zones.add(water.state.zone);}
 assert.deepEqual([...zones],['knee']);
});

ok('the HUD: Swim ride · Sprint (hold) · Float (tap / hold) while swimming; Sprint and Float wait while wading; nothing on land',()=>{
 assert.equal(H.waterButtonsFor({inWater:false,swimming:false,flyOk:false}),null);
 const swim=H.waterButtonsFor({inWater:true,swimming:true,flyOk:false});
 assert.deepEqual(swim.map(b=>b.slot),['shoot','juggle','ride']);const wade=H.waterButtonsFor({inWater:true,swimming:false,flyOk:false});assert.deepEqual(swim.map(b=>b.id),['swimfast','float','swimride']);
 assert.equal(swim[0].hold,true,'Sprint is a hold');assert.equal(swim[1].hold,true,'Float is a hold too (tap = on the back, hold = the circle)');assert.match(swim[1].label,/circle/);
 assert.deepEqual(wade.map(b=>b.enabled),[false,false,false],'wading without fuel: nothing live (the stick walks you out)');
 assert.deepEqual(swim.map(b=>b.key),['Space','Q','R'],'Space / Q as the zipline, R the ride key');
 assert.equal(H.waterKeyAction('Space',' '),'swimfast');assert.equal(H.waterKeyAction('KeyQ','q'),'float');assert.equal(H.waterKeyAction('KeyJ','j'),'float');assert.equal(H.waterKeyAction('KeyE','e'),'swimride');assert.equal(H.waterKeyAction('KeyR','r'),'swimride');assert.equal(H.waterKeyAction('KeyW','w'),null,'the stick keys stay the stick');
 // The store writes only on changes.
 let n=0;const off=H.waterStore.subscribe(()=>n++);H.waterStore.set({inWater:true});H.waterStore.set({inWater:true});assert.equal(n,1);H.waterStore.set({inWater:true,swimming:true});assert.equal(n,2);H.waterStore.reset();assert.equal(n,3);off();
 // Every icon the buttons name exists, and every id has a short word under it.
 const icons=fs.readFileSync('components/TravelIcon.tsx','utf8'),words=fs.readFileSync('components/JobActionButton.tsx','utf8');
 for(const b of swim){assert(icons.includes(` ${b.icon}:'`),'icon '+b.icon);assert(new RegExp(`\\b${b.id}:'`).test(words),'word for '+b.id);}
 assert.equal(H.SWIM_LESSON.kind,'Coaching idea','the lesson is labelled a coaching metaphor, not a fact');
});

ok('splash-downs: the dip, the tint, the surface, the entry style by source; reduced motion is instant',()=>{
 for(const reduced of [false,true]){
  const water=S.createWaterState(island(),()=>reduced);
  water.splashDown(30,0,'dropin',28,0);
  assert.equal(water.state.phase,'under');assert.equal(water.state.entry,'clean','a high jetpack drop enters clean');
  {const ev=water.step(1/60,30,0,input());assert.equal(ev.splash>0,true,'the splash is raised on the step after the hit');assert.equal(ev.tint,!reduced,'the tint only without reduced motion');assert.equal(water.step(1/60,30,0,input()).splash,0,'once');}
  assert.equal(water.inWater,true);assert.equal(water.swimming,true);assert.equal(water.state.park,null,'no dry spot known: the host parks the ball at the nearest landing');
  let deepest=0,t=0;const raised=[];
  while(water.state.phase!=='swim'&&t<5){const ev=water.step(1/60,30,0,input());t+=1/60;deepest=Math.min(deepest,water.state.rootY-W.SWIM_ROOT_Y);for(const k of Object.keys(ev))if(ev[k])raised.push(k);}
  assert.equal(water.state.phase,'swim','surfaced into treading water');assert(raised.includes('surfaced')&&raised.includes('swimStarted'),raised.join(' '));
  if(reduced){assert.equal(deepest,0,'no dip');assert(t<.6,'a short cross-fade: '+t.toFixed(2));assert.equal(water.state.camDip,0);}
  else{assert(deepest<-S.UNDER_DEPTH*.9,'went under '+deepest);assert(t>1&&t<1.6,'down 0.35 s, up 0.5 s, shake 0.4 s: '+t.toFixed(2));}
  assert.equal(water.pose.kind,'tread');
 }
 const entries=(source,height,canopy)=>{const w=S.createWaterState(island(),()=>false);w.splashDown(30,0,source,height,0,canopy);return w.state.entry;};
 assert.equal(entries('fall',20,true),'belly','a cut canopy belly-flops');assert.equal(entries('launch',4,false),'belly','a ride launch arrives flat');
 assert.equal(entries('roof',1.5,false),'feet','a short drop goes in feet first');assert.equal(entries('roof',4,false),'belly');
 assert.equal(entries('dropin',6,false),'feet','a low jetpack drop');
 // A belly-flop: the camera shake and the dazed face are short and bounded.
 const w=S.createWaterState(island(),()=>false);w.splashDown(30,0,'launch',4,0);assert.equal(w.state.shake,S.BELLY_SHAKE_TIME);assert.equal(w.state.dazed,S.BELLY_DAZED);
 for(let i=0;i<60;i++)w.step(1/60,30,0,input());assert.equal(w.state.shake,0);assert(w.state.dazed<.01);
 assert(S.CAM_DIP<=1.2&&S.BELLY_SHAKE<=.08);
 assert.equal(S.UNDER_TINT_MS,450);
});

ok('time buckets and the reset',()=>{
 assert.equal(S.swimTimeBucket(3),'time_10s');assert.equal(S.swimTimeBucket(10),'time_30s');assert.equal(S.swimTimeBucket(59),'time_60s');assert.equal(S.swimTimeBucket(100),'time_120s');assert.equal(S.swimTimeBucket(500),'time_long');
 const water=S.createWaterState(island(),()=>false);walk(water,9.5,14,1);assert.equal(water.state.phase,'swim');water.reset();assert.equal(water.state.phase,'land');assert.equal(water.inWater,false);
});

ok('Town wiring: the cluster swap, the parked ball, no kicks in the sea, the splash paths, the keys',()=>{
 const town=fs.readFileSync('components/Town.tsx','utf8');
 assert.match(town,/const actionCluster:readonly JobButton\[\]\|null=zipRiding\?ZIP_BUTTONS:waterCluster\?\?jobButtons;/,'the water cluster takes the slots');
 assert.match(town,/else if\(waterCluster\)waterActions\.press\(b\.id as WaterActionId,phase\)/);
 assert.match(town,/data-water-actions=\{waterCluster\?'':undefined\}/);
 assert.match(town,/const ballPlayer=water\.inWater&&BALL_STAYS_ON_SAND&&water\.state\.park\?water\.state\.park:/,'decision 3: the ball follows the parked spot');
 assert.match(town,/&&!jobFrame\.ball&&!water\.inWater\)\{/,'no dribble sync while in the sea');
 assert.match(town,/if\(jobButtonsRef\.current\|\|water\.inWater\)\{input\.current\.kick=input\.current\.juggle=false;/,'kick and juggle off in the water');
 assert.match(town,/const selectRide=\(mode:TravelMode\)=>\{if\(waterStore\.get\(\)\.inWater\)return;/,'no ride change from the water');
 assert.match(town,/if\(result\.landed&&result\.splash\)\{/,'the jetpack fall / cut canopy lands in the sea');
 assert.match(town,/splashSource='dropin';jetActions\.crash\(flight\.height\)/,'the jetpack "Drop in"');
 assert.match(town,/splash:canSplashDown\}\);flight\.height=result\.height;/,'the fall asks the 60 m rule');
 assert.match(town,/const src:SplashSource=launchFall\?'launch':'roof';rooftop\.state\.impact=false;rooftop\.state\.recovery=0;/,'rooftop jumps and ride launches: no knockdown in the water');
 assert.match(town,/rooftop\.setSplashTest\(canSplashDown\)/,'ride launches may end over splashable water');
 assert.match(town,/if\(waterKey\(e,true\)\)return;/);assert.match(town,/if\(waterKey\(e,false\)\)return;/);
 assert.match(town,/groundBlocked\(bx,bz,\[\],0\)&&!\(rideRef\.current==='walk'&&waterProbe\.allowed\(bx,bz\)\)\)sound\.boundary\(\)/,'the boundary sound stays on land');
 assert.match(town,/swimStep\(location,velocity,\{x:holdStill\?0:mx,z:holdStill\?0:mz\},water\.state\.fast,dt,waterWalk\.allow,onLand,waterProbe\.d\)/,'the swim step');
 assert.match(town,/rideRef\.current==='walk'\?waterWalk:undefined\)/,'wading passes the water test to the walker only');
 assert.match(town,/groundY=water\.state\.rootY;/,'the root lowers onto the shelf / the swim line');
 assert.match(town,/swim:water\.pose\.w>0\?water\.pose:undefined/,'the rig gets the swim pose');
 assert.match(town,/camTarget\.y\+=water\.state\.camDip;/,'the camera dips with the splash');
 assert.match(town,/camera\.position\.y<WATER_LEVEL\+\.25\)camera\.position\.y=WATER_LEVEL\+\.25;/,'the eye never goes under the sea');
 assert.match(town,/<SwimLessonToast blocked=\{toastBlocked\}\/>/);assert.match(town,/data-water-under hidden/);
 assert.match(town,/\$\{waterView\.dropIn\?DROP_IN_LABEL\+'\. ':''\}Change ride/,'the travel button says Drop in in its accessible name (icon only on screen, user Oct 15 2026)');assert.doesNotMatch(town,/<small>\{DROP_IN_LABEL\}<\/small>/,'no Drop in caption');
 // The sim: the walker's step takes the water test only after the ground says blocked (no extra cost on land).
 const sim=fs.readFileSync('lib/town/simulation.ts','utf8');assert.match(sim,/groundBlocked\(x,z,obstacles,collisionRadius\)&&!\(water&&water\(x,z\)\)/);
 const jump=fs.readFileSync('lib/town/rooftopJump.ts','utf8');assert.match(jump,/q\.blockedAt\?\.\(x,z\) && !q\.canSplash\?\.\(x,z\)/);
 const jet=fs.readFileSync('lib/town/jetpackActions.ts','utf8');assert.match(jet,/if\(env\.splash\?\.\(p\.x,p\.z\)\)\{const drop=state\.startHeight,canopy=canopyCut;reset\(\);return\{height:floor,landed:true,splash:true,drop,canopy\};\}/);
});

ok('any position past wading depth is the swim state, by every route (never deep water with the land cluster)',()=>{
 // Oct 15 2026 (user screenshot: far out in the open sea with the land HUD). Whatever put the body there, the next water step past
 // the swim line is inWater && swimming, and the HUD cluster for that view is the water cluster.
 const routes={
  'walked / teleported from land':w=>{w.step(1/60,5,0,input({landY:0}));},
  'a map trip straight into the sea':w=>{w.reset();},
  'an airborne fall that just landed':w=>{w.step(1/60,5,0,input({landY:0}));for(let i=0;i<30;i++)w.step(1/60,90,0,input({airborne:true}));},
  'a splash-down far out':w=>{w.step(1/60,5,0,input({landY:0}));w.splashDown(90,0,'fall',8,0);for(let i=0;i<120;i++)w.step(1/60,90,0,input());},
 };
 for(const [name,setup] of Object.entries(routes))for(const d of [12,40,90,200]){
  const w=S.createWaterState(island(),()=>false);setup(w);w.step(1/60,10+d,0,input());
  assert.equal(w.inWater&&w.swimming,true,`${name}, ${d} m out: swimming`);assert.equal(w.state.phase==='swim'||w.state.phase==='under'||w.state.phase==='surface',true,name);
  const cluster=H.waterButtonsFor({inWater:w.inWater,swimming:w.swimming,flyOk:false});assert(cluster&&cluster.every(b=>['swimfast','float','swimride'].includes(b.id)),name+': the water cluster');}
 // Airborne over the sea is the only exception (the landing decides), and it ends the moment the body is not airborne.
 const w=S.createWaterState(island(),()=>false);w.step(1/60,5,0,input({landY:0}));w.step(1/60,80,0,input({airborne:true}));assert.equal(w.inWater,false,'airborne: wait for the landing');w.step(1/60,80,0,input());assert.equal(w.swimming,true,'landed: swimming');
 // The Town side: every landing path asks canSplashDown, which has no range any more (tests/water-depth.cjs), and the HUD store
 // is written from water.inWater / water.swimming on the HUD tick.
 const town=fs.readFileSync('components/Town.tsx','utf8');assert.match(town,/if\(hudTick\)waterStore\.set\(\{inWater:water\.inWater,swimming:water\.swimming,flyOk:fuelStore\.canUse\('jetpack'\),dropIn:/);
 assert(!/SPLASH_RANGE/.test(fs.readFileSync('lib/town/water/waterDepth.ts','utf8')),'no splash range');
});

ok('the splash: its size by drop and entry, the burst from the ring pool, a cue per entry through the existing sound channels',()=>{
 // Feet first from low < a belly-flop < a clean dive from ≥ 12 m, and a higher drop is bigger.
 assert(S.SPLASH_SCALE.feet<S.SPLASH_SCALE.belly&&S.SPLASH_SCALE.belly<S.SPLASH_SCALE.clean);
 const power=(source,h,canopy)=>{const w=S.createWaterState(island(),()=>false);w.splashDown(30,0,source,h,0,canopy);return w.step(1/60,30,0,input()).splash;};
 assert(power('roof',1.5)<power('roof',6)&&power('roof',6)<power('dropin',28),'bigger with the drop');
 for(const [source,h,canopy] of [['fall',20,true],['roof',4,false],['launch',4,false],['dropin',28,false]])assert(power(source,h,canopy)>0,'a splash event on the '+source+' path');
 // The cue table: existing island sound cue names only (fi2-job-cue / fi2-path-cue), no new audio, bounded delays; a plip on surfacing.
 const sound=fs.readFileSync('lib/audio/islandSound.ts','utf8'),jobCues=new Set([...sound.matchAll(/case '([a-z-]+)':/g)].map(m=>m[1])),pathCues=new Set(['dock','undock','swipe-right','swipe-left','path-pop','page']);
 for(const entry of ['feet','belly','clean']){const cues=H.SPLASH_CUES[entry];assert(cues.length>=1&&cues.length<=5,entry+': 1–5 cues');assert(cues.every(c=>c[0]==='fi2-job-cue'&&/^splash(-soft|-big)?$/.test(c[1])),entry+': the synthesized splash cues only (Oct 15 2026)');
  for(const [event,detail,delay] of cues){assert(event==='fi2-job-cue'?jobCues.has(detail):event==='fi2-path-cue'&&pathCues.has(detail),`${entry}: ${event} ${detail} exists`);assert(delay>=0&&delay<=400,'a short delay');}}
 assert(H.SPLASH_CUES.clean.length>=H.SPLASH_CUES.belly.length&&H.SPLASH_CUES.belly.length>H.SPLASH_CUES.feet.length,'bigger entries have more to hear');
 assert(/case 'splash-soft':case 'splash':case 'splash-big':/.test(sound)&&!/\.(mp3|ogg|wav)\b/.test(sound),'the splash is synthesized in islandSound.ts (user, Oct 15 2026), no samples');
 for(const [event,detail] of H.SURFACE_CUES)assert(event==='fi2-path-cue'&&pathCues.has(detail));
 // The Town wiring: the crown + burst sized by the entry, the thud, the cues, a DOM event a page probe can count; drips on surfacing.
 const town=fs.readFileSync('components/Town.tsx','utf8');
 assert.match(town,/const size=\(\.6\+ev\.splash\*\.9\)\*SPLASH_SCALE\[water\.state\.entry\];ballEffects\.splashDown\(location\.x,WATER_LEVEL,location\.z,size,reduced\);/);
 assert.match(town,/playCues\(SPLASH_CUES\[water\.state\.entry\]\);\/\*[^*]*\*\/document\.dispatchEvent\(new CustomEvent\('fi2-water-splash',/);
 assert.match(town,/if\(ev\.surfaced\)\{ballEffects\.drips\(location\.x,WATER_LEVEL,location\.z,reduced\);playCues\(SURFACE_CUES\);\}/);
 assert.match(town,/for\(const t of cueTimers\)clearTimeout\(t\);cueTimers\.clear\(\);/,'cue timers cleared on unmount');
 // The pool: the splash borrows the five rings, the 14 ghost spheres and the 8 charge spheres; reduced motion = one ring.
 const fx=fs.readFileSync('lib/graphics/ballEffects.ts','utf8');assert.match(fx,/splashDown\(x:number,y:number,z:number,size:number,reduced:boolean\)\{/);assert.match(fx,/crown\(true,\.9\*s,1\.3\*s,\.03,0\);\n   if\(reduced\)return;/,'reduced motion: one foam ring, then out');
 assert.match(fx,/const SPLASH_BURST_S=\.95,DROPS=ghosts\.length\+energy\.length,seeds=new Float32Array\(DROPS\*4\);/,'the burst seeds live in one typed array made once');
 assert(!/splashDown\([^)]*\)\{[^}]*new /.test(fx),'no allocation at the hit');
});

if(failed){console.log(`WATER_SWIM_FAIL ${failed}`);process.exit(1);}
console.log('WATER_SWIM_PASS land→wade→swim→out, parked ball, swim+jetpack switcher, Float hold circle, splash-downs anywhere + splash/cue, reduced motion, wiring');
