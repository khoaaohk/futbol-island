// The water model (Oct 15 2026, lib/town/water/waterDepth.ts; docs/swimming-research.md §2.1): the virtual shelf off the
// analytic distance to land, the wade zones with hysteresis, the 60 m splash-down rule (decision 4), the 10 Hz probe and the
// swim step's speeds. Run: node tests/water-depth.cjs
const assert=require('node:assert/strict');
const {createLoader}=require('./summit-harness.cjs');
const load=createLoader();
const W=load('lib/town/water/waterDepth.ts'),{SEA_LEVEL}=load('lib/town/ballSea.ts'),{onLand,distanceToLand}=load('lib/town/landmass.ts'),{flightBlocked}=load('lib/town/simulation.ts');
let failed=0;const ok=(name,fn)=>{try{fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};

ok('the water level is the ocean plane',()=>{assert.equal(W.WATER_LEVEL,SEA_LEVEL);assert.equal(W.SWIM_ROOT_Y,SEA_LEVEL-W.SWIM_ROOT_DEPTH);});
ok('the decisions are named constants',()=>{assert.equal(W.SPLASH_ANYWHERE,true,'decision 4 (widened Oct 15 2026): splash-downs over any open water inside the flyable world');assert.equal(W.BALL_STAYS_ON_SAND,true,'decision 3');assert.equal(W.SWIM_RANGE,60);});

ok('depth: 0 on land, the shelf slope off it, capped at DEPTH_MAX',()=>{
 assert.equal(W.depthForDistance(0),0);assert.equal(W.depthForDistance(1),W.SHELF_SLOPE);assert.equal(W.depthForDistance(100),W.DEPTH_MAX);
 assert.equal(W.waterDepthAt(85,-35),0,'the island square is dry');
 // North Beach: step off the coast and the water deepens with the distance to land.
 const z0=-243.5;let z=z0;while(onLand(60,z))z-=.25;
 const d1=W.waterDepthAt(60,z-1),d2=W.waterDepthAt(60,z-3),d3=W.waterDepthAt(60,z-60);
 assert(d1>0&&d1<d2&&d2<=W.DEPTH_MAX&&d3===W.DEPTH_MAX,`deepens offshore ${d1} ${d2} ${d3}`);
 assert(Math.abs(d1-Math.min(W.DEPTH_MAX,W.SHELF_SLOPE*distanceToLand(60,z-1)))<1e-9,'the shelf is the slope times the distance');
 // Chest deep (the swim line) about 2.2 m out.
 assert(W.depthForDistance(W.ZONE_SWIM/W.SHELF_SLOPE)>=W.ZONE_SWIM&&W.ZONE_SWIM/W.SHELF_SLOPE<2.5,'swimming from ~2.2 m out');
});

ok('zones with hysteresis: no flicker on a line',()=>{
 assert.equal(W.wadeZone(0,'none'),'none');assert.equal(W.wadeZone(.001,'none'),'ankle');
 assert.equal(W.wadeZone(.1,'none'),'ankle');assert.equal(W.wadeZone(.4,'none'),'knee');assert.equal(W.wadeZone(.8,'none'),'waist');assert.equal(W.wadeZone(1.2,'none'),'swim');
 // Going deeper: the knee line (0.25) is crossed only at 0.25 + 0.05.
 assert.equal(W.wadeZone(.26,'ankle'),'ankle','just over the line stays ankle');assert.equal(W.wadeZone(.31,'ankle'),'knee');
 // Coming back: the knee zone is left only below 0.25 − 0.05.
 assert.equal(W.wadeZone(.24,'knee'),'knee','just under the line stays knee');assert.equal(W.wadeZone(.19,'knee'),'ankle');
 assert.equal(W.wadeZone(.98,'swim'),'swim');assert.equal(W.wadeZone(.94,'swim'),'waist');assert.equal(W.wadeZone(1.02,'waist'),'waist');assert.equal(W.wadeZone(1.06,'waist'),'swim');
 // A jump of several zones at once lands on the right one.
 assert.equal(W.wadeZone(1.5,'ankle'),'swim');assert.equal(W.wadeZone(0,'swim'),'none');
 // Oscillating 0.02 m round the knee line never changes the zone.
 let zone='ankle';for(let i=0;i<200;i++){zone=W.wadeZone(.25+(i%2?.02:-.02),zone);assert.equal(zone,'ankle');}
 assert.equal(W.wadeSpeedScale('ankle'),.9);assert.equal(W.wadeSpeedScale('knee'),.7);assert.equal(W.wadeSpeedScale('waist'),.5);assert.equal(W.wadeSpeedScale('swim'),1);
 assert.equal(W.wadeRootY(.4),W.WADE_FOOT_Y-.4);
});

ok('splash-downs: any knee-deep open water inside the flyable world, however far from land (no 60 m range)',()=>{
 const z0=-243.5;let z=z0;while(onLand(60,z))z-=.25;
 assert.equal(W.canSplashDown(60,z+2),false,'on the beach: no');
 assert.equal(W.canSplashDown(60,z-.3),false,'ankle water: an ordinary landing');
 assert.equal(W.canSplashDown(60,z-2),true,'knee deep and more: yes');
 assert.equal(W.canSplashDown(60,z-30),true,'30 m out: yes');
 const far={x:60,z:z-59.5},farther={x:60,z:z-61};
 assert(distanceToLand(far.x,far.z)<=60&&distanceToLand(farther.x,farther.z)>60);
 if(!flightBlocked(far.x,far.z))assert.equal(W.canSplashDown(far.x,far.z),true,'59.5 m: yes');
 if(!flightBlocked(farther.x,farther.z))assert.equal(W.canSplashDown(farther.x,farther.z),true,'61 m: a splash too (a far drop must never leave a kid standing in the sea)');
 // Any point past wading depth inside the flyable world: the state machine swims there (tests/water-swim.cjs pins the HUD side).
 for(const dz of [5,20,45,80,120]){const p={x:60,z:z-dz};if(flightBlocked(p.x,p.z))continue;assert.equal(W.canSplashDown(p.x,p.z),true,dz+' m out: a splash');}
 assert.equal(W.canSplashDown(-160,0),false,'outside the flyable world: no');
});

ok('the probe asks distanceToLand at most 10 times a second and never on land',()=>{
 let calls=0;const probe=W.createWaterProbe((x,z)=>{calls++;return Math.max(0,Math.hypot(x,z)-10);},(x,z)=>Math.hypot(x,z)<=10,()=>false);
 for(let i=0;i<600;i++)probe.sample(5,0,1/60);
 assert.equal(calls,0,'on land: no distance calls');assert.equal(probe.depth,0);assert.equal(probe.land,true);
 // Walk out at 1 m/s for 10 s: one call at the coast crossing, then ~10 a second.
 let x=9.9;for(let i=0;i<600;i++){x+=1/60;probe.sample(x,0,1/60);}
 assert(calls>=95&&calls<=104,`10 s in the water → ${calls} calls (≈ 100)`);
 assert(probe.depth>0&&Math.abs(probe.d-(x-10))<=.2,'the sample is at most 0.1 s stale at 1 m/s');
 // The allowed test uses the cached distance as a bound: inside the range no extra call; past it, none either when clearly out.
 const before=calls;assert.equal(probe.allowed(15,0),true);assert.equal(calls,before,'no call inside the bound');
 assert.equal(probe.allowed(5,0),false,'land is not swimmable water');
 assert.equal(probe.allowed(200,0),false,'far outside the range');assert.equal(calls,before+1,'a far point needs one exact call (the swimmer never probes one: its steps are ≤ 0.05 m)');
 // Dropped beyond the range (a far splash-down): only inward steps are allowed, so the swimmer can always come home.
 probe.sample(100,0,1,true);assert.equal(probe.allowed(100.5,0),false,'farther out: no');assert.equal(probe.allowed(99.5,0),true,'toward land: yes');assert.equal(probe.allowed(100,.3),true,'sideways (no farther): yes');
 // Right at the edge one exact call decides.
 probe.sample(69,0,1,true);const b2=calls;assert.equal(probe.allowed(70.5,0),false);assert.equal(probe.allowed(69.5,0),true);assert(calls>b2,'an exact call at the edge');
 probe.reset();assert.equal(probe.land,true);
});

ok('the swim step: crawl SWIM_SPEED, Swim fast SWIM_FAST_SPEED (3.7 / 6.2 since Oct 15 2026), momentum, the soft 60 m edge',()=>{
 const allowed=(x,z)=>Math.hypot(x,z)>10&&Math.hypot(x,z)<=70,land=(x,z)=>Math.hypot(x,z)<=10;
 const p={x:20,z:0},v={x:0,z:0};
 for(let i=0;i<600;i++)W.swimStep(p,v,{x:1,z:0},false,1/60,allowed,land,Math.hypot(p.x,p.z)-10);
 assert(Math.abs(Math.hypot(v.x,v.z)-W.SWIM_SPEED)<.02,'crawl speed '+Math.hypot(v.x,v.z));
 p.x=12;p.z=0;/* back from the edge: at 6.2 m/s the sprint covers the 70 m test sea in ~9 s (Oct 15 2026) */
 for(let i=0;i<300;i++)W.swimStep(p,v,{x:1,z:0},true,1/60,allowed,land,0);
 assert(Math.abs(Math.hypot(v.x,v.z)-W.SWIM_FAST_SPEED)<.02,'fast '+Math.hypot(v.x,v.z));
 // Release: it brakes at SWIM_BRAKE (carries momentum for a moment), never stops dead.
 const v0=Math.hypot(v.x,v.z);W.swimStep(p,v,{x:0,z:0},false,.1,allowed,land,0);const v1=Math.hypot(v.x,v.z);
 assert(v1<v0&&v1>v0*.7,'momentum '+v1);
 for(let i=0;i<300;i++)W.swimStep(p,v,{x:0,z:0},false,1/60,allowed,land,0);assert(Math.hypot(v.x,v.z)<.01,'comes to rest');
 // A half stick swims slower; a diagonal is normalised.
 v.x=v.z=0;p.x=20;for(let i=0;i<600;i++)W.swimStep(p,v,{x:.5,z:0},false,1/60,allowed,land,0);assert(Math.abs(Math.hypot(v.x,v.z)-W.SWIM_SPEED*.5)<.02);
 // The edge: at 58 m out the current slows the swimmer; the range itself stops the outward step and slides along it.
 v.x=v.z=0;p.x=66;p.z=0;for(let i=0;i<600;i++)W.swimStep(p,v,{x:1,z:0},false,1/60,allowed,land,Math.hypot(p.x,p.z)-10);
 assert(Math.hypot(p.x,p.z)<=70.001,'never past the range '+Math.hypot(p.x,p.z));
 v.x=v.z=0;p.x=66;const s=W.swimStep(p,v,{x:1,z:0},true,1,allowed,land,58);assert(s<W.SWIM_FAST_SPEED*.75,'slower near the edge '+s);
 // Land ahead is allowed (the climb-out); it does not block the step.
 p.x=10.5;p.z=0;v.x=-1;v.z=0;W.swimStep(p,v,{x:-1,z:0},false,.5,allowed,land,0);assert(p.x<10.5,'stepped toward the sand');
 // No allocation: the same objects, nothing returned but a number.
 assert.equal(typeof s,'number');
});

if(failed){console.log(`WATER_DEPTH_FAIL ${failed}`);process.exit(1);}
console.log('WATER_DEPTH_PASS shelf depth, zones + hysteresis, 60 m rule, 10 Hz probe, swim speeds');
