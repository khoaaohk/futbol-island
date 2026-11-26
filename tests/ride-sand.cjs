// Riding on sand (owner, Nov 25 2026: "add animation for when riding on the sand that it kicks up the sand. also when riding on the
// sand it slows down the speed of each a bit compared to riding normally"; lib/town/rideSand.ts + rideSplash.ts sand()): the sand
// test (beaches, Coral Cay, the sandbars, Summit Isle; never roads, paths or the railway), the eased ~15 % slower top speed and
// softer pull-away (walking unchanged), and the pooled sand spray (speed-scaled, more on turns / braking, off for reduced motion
// and the hot tiers, nothing when stopped). Run: node tests/ride-sand.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createLoader}=require('./summit-harness.cjs');
const load=createLoader();
const RS=load('lib/town/rideSand.ts'),SP=load('lib/graphics/rideSplash.ts'),SIM=load('lib/town/simulation.ts'),TM=load('lib/town/travelModes.ts');
const SH=load('lib/town/shoreline.ts'),CC=load('lib/town/coralCay.ts'),SI=load('lib/town/summitIsle.ts'),TT=load('lib/town/trainTrack.ts');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
let failed=0;const ok=(name,fn)=>{try{fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};
const C=RS.RIDE_SAND;
ok('constants: 12–18 % slower top speed, softer acceleration, ~0.3 s ease',()=>{
 assert(C.speed>=.82&&C.speed<=.88,'top speed scale');assert(C.accel<1&&C.accel>=.7,'softer acceleration');near(C.ease,.3,.05);
});
function near(a,b,e){assert(Math.abs(a-b)<=e,`${a} vs ${b}`);}
ok('the sand test: main beach ring, Coral Cay, the sandbars, Summit beach are sand; lawn and sea are not',()=>{
 // Main island: a point a few metres inside each of several shore vertices is beach; the island centre is lawn.
 let beach=0,n=0;for(let i=0;i<SH.SHORE_SAND.length;i+=Math.max(1,Math.floor(SH.SHORE_SAND.length/24))){const s=SH.SHORE_SAND[i],o=s.outer,q=s.inner,x=o.x+(q.x-o.x)*.5,z=o.z+(q.z-o.z)*.5;n++;if(RS.naturalSand(x,z))beach++;}
 assert(beach>=n*.8,`main beach ring midpoints on sand (${beach}/${n})`);
 assert(!RS.naturalSand(0,0),'the island centre is lawn');assert(!RS.naturalSand(0,-400),'open sea');
 for(const s of CC.SANDBARS)assert(RS.naturalSand(s.x,s.z),s.name+' is sand');
 // The beach court sits inside the cay's lawn outline: it counts through its 'sand' surface area (coralCayWorld.ts), as in Town.
 const K=CC.BEACH_COURT;assert(RS.createRideSand([],[{x:K.x,z:K.z,w:K.length+16,d:K.width+13}]).at(K.x,K.z),'the beach court');
 // Summit: just inside the waterline, all round.
 let sb=0;for(let k=0;k<12;k++){const a=k/12*Math.PI*2,r=SI.coastRadius(a)-SI.beachWidth(a)*.4,x=SI.SUMMIT_CENTER.x+Math.cos(a)*r,z=SI.SUMMIT_CENTER.z+Math.sin(a)*r;if(RS.naturalSand(x,z))sb++;}
 assert(sb>=9,`Summit beach (${sb}/12)`);
 assert(!RS.naturalSand(SI.SUMMIT_CENTER.x,SI.SUMMIT_CENTER.z),'the summit top is not sand');
});
ok('paved and the railway are never sand; a sand surface area always is',()=>{
 const s=SH.SHORE_SAND[3],x=(s.outer.x+s.inner.x)/2,z=(s.outer.z+s.inner.z)/2;assert(RS.naturalSand(x,z));
 assert.equal(RS.createRideSand([]).at(x,z),true);
 assert.equal(RS.createRideSand([{x,z,w:6,d:6}]).at(x,z),false,'a road / path rect over the beach');
 // A track point: never sand, whatever is under it.
 let checked=0;for(let i=0;i<TT.TRACK.n;i+=40){const tx=TT.TRACK.x[i],tz=TT.TRACK.z[i];assert.equal(RS.createRideSand([]).at(tx,tz),false,'track at '+tx.toFixed(0)+','+tz.toFixed(0));checked++;}
 assert(checked>5);
 assert.equal(RS.createRideSand([],[{x:0,z:0,w:4,d:4}]).at(0,0),true,'a sand area on the lawn');
});
ok('the ease: 1 → 0.85 over ~0.3 s with no jump, back out the same; walking / flying eases straight out',()=>{
 const e=RS.createSandEase(()=>true);let prev=1,maxStep=0,t=0;
 while(t<.5){const o=e.step(1/60,t*10,0);maxStep=Math.max(maxStep,Math.abs(o.speed-prev));prev=o.speed;t+=1/60;if(t<.25)assert(o.speed>C.speed+1e-6,'not yet fully eased at '+t.toFixed(2));}
 near(prev,C.speed,1e-9);assert(maxStep<.03,'smooth per frame: '+maxStep.toFixed(4));
 const off=RS.createSandEase(()=>false);assert.equal(off.step(1/60,0,0).speed,1);
 const w=RS.createSandEase(()=>true);for(let i=0;i<60;i++)w.step(1/60,0,0,false);assert.equal(w.out.speed,1,'inactive: no slowdown');
 // The cached lookup: no new lookup while within the reuse distance.
 let calls=0;const c=RS.createSandEase(()=>{calls++;return true;});for(let i=0;i<30;i++)c.step(1/60,i*.01,0);assert.equal(calls,1);
});
ok('stepPlayer: top speed scales with the sand factor, acceleration softens, braking and walking unchanged',()=>{
 const run=(mode,scale,accel,sec=3)=>{const p={x:0,z:0},v={x:0,z:0};let t05=0;for(let i=0;i<sec*60;i++){SIM.stepPlayer(p,v,{x:1,z:0,sprint:false},1/60,[],mode,undefined,scale,0,undefined,accel);if(i===29)t05=Math.hypot(v.x,v.z);}return {top:Math.hypot(v.x,v.z),t05};};
 for(const m of ['scooter','bike','moped']){const hard=run(m,1,1),sand=run(m,C.speed,C.accel);near(sand.top/hard.top,C.speed,.01);assert(sand.t05<hard.t05*C.speed+1e-6,m+' softer pull-away');}
 near(run('walk',1,1).top,TM.TRAVEL_MODES.walk.maxSpeed,.01);
 const src=read('lib/town/rooftopTravel.ts');assert(src.includes("ground&&mode!=='walk'&&mode!=='jetpack'?ground.speed:1"),'walking and the jetpack ignore the sand');
});
ok('spray: pooled in the splash mesh, nothing standing still, scales with speed, more on turns and braking, off for reduced motion / hot tiers',()=>{
 assert.equal(RS.sandSprayStrength(0,0,0),0);assert.equal(RS.sandSprayStrength(1.5,2,10),0,'creeping: nothing');
 const cruise=RS.sandSprayStrength(12,0,0);assert(cruise>0);assert(RS.sandSprayStrength(20,0,0)>cruise);
 assert(RS.sandSprayStrength(12,2,0)>cruise*1.3,'turns');assert(RS.sandSprayStrength(12,0,12)>cruise*1.3,'braking');
 const sp=SP.createRideSplash(()=>null);const go=(mode,speed,str,sec=1)=>{let n=0;for(let i=0;i<sec*60;i++){sp.begin(1/60,mode);n+=sp.sand(0,i*speed/60,0,0,Math.PI/2,speed,str);sp.end();}return n;};
 const full=go(3,14,RS.sandSprayStrength(14,0,0));assert(full>8&&full<40,'a light spray: '+full+' grains/s');
 assert(sp.alive<=SP.RIDE_SPLASH.cap);
 assert(go(2,14,RS.sandSprayStrength(14,0,0))<full,'tier 2: thinned');
 assert.equal(go(1,14,1),0,'reduced motion: none');assert.equal(go(0,14,1),0,'battery saver / tier 3+: none');
 assert.equal(go(3,0,RS.sandSprayStrength(0,0,0)),0,'stopped: none');
 const s=read('lib/graphics/rideSplash.ts');assert(s.includes('col=vFx.x>.12?uSand:uDrop'),'the same shader program, one more uniform');
});
ok('Town wiring: the ride feeds the sand ease into rooftop.update and the spray into the splash pool (me + 2 friends)',()=>{
 const t=read('components/Town.tsx');
 assert(t.includes("sandEase.step(dt,location.x,location.z,(rm==='scooter'||rm==='bike'||rm==='moped')"));
 assert(t.includes("rideRef.current==='walk'?waterWalk:undefined,sandEase.out)"));
 assert(t.includes('if(wet<=.02&&sandEase.out.on)rideSplash.sand(0,'));assert(t.includes('rideSplash.sand(1+i,'));
 assert(t.includes("createRideSand([...world.roads,...world.surfaceAreas.filter(a=>a.kind!=='sand')]"));
});
if(failed){console.log(failed+' failed');process.exit(1);}console.log('ride-sand: all passed');
