// Stadium Park pond, bigger, deeper and swimmable (Nov 13 2026, owner: "a little bigger and deeper, and allow swimming in it"; an
// irregular outline; edge detail; the sea's water look; a wider beach to the south; more fruit trees). The pond's one shape
// (westParkLayout.ts pondShape / pondQ / pondEdge), its depth profile, the water model in it (waterDepth.ts PARK_POND_WATER, the
// real probe and state machine): wade in, swim, wade and walk back out, dive gating, splash-downs, rides stopping at the drop-off,
// props clear of the bigger pond, the sand strip to the sea, and the Town / map / material wiring. usage: node tests/pond-swim.cjs
const assert=require('node:assert/strict'),fs=require('node:fs');
const {createLoader}=require('./summit-harness.cjs');
const load=createLoader();
const L=load('lib/town/westParkLayout.ts'),WD=load('lib/town/water/waterDepth.ts'),S=load('lib/town/water/waterState.ts'),sim=load('lib/town/simulation.ts');
const SH=load('lib/town/shoreline.ts'),TA=load('lib/town/travelArrival.ts'),RP=load('lib/town/pondRemote.ts');
const read=f=>fs.readFileSync(f,'utf8'),P=L.PARK_POND;
let failed=0;const ok=(name,fn)=>{try{fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};

ok('the shape: bigger, irregular but smooth, one q for every test',()=>{
 assert(P.rx>=27*1.2&&P.rx<=27*1.3+.1&&P.rz>=20*1.2&&P.rz<=20*1.3+.1,'radii ~20–30% bigger than 27 × 20');
 let lo=9,hi=0,prev=L.pondShape(0),maxStep=0;
 for(let d=1;d<=360;d++){const s=L.pondShape(d*Math.PI/180);lo=Math.min(lo,s);hi=Math.max(hi,s);maxStep=Math.max(maxStep,Math.abs(s-prev));prev=s;}
 assert(hi-lo>.12,'not a plain ellipse: lobes and coves ('+lo.toFixed(3)+'…'+hi.toFixed(3)+')');assert(maxStep<.006,'smooth: under 0.6% radius change per degree');
 for(let d=0;d<360;d+=7){const a=d*Math.PI/180,e=L.pondEdge(a);assert(Math.abs(L.pondQ(e.x,e.z)-1)<1e-9,'the edge has q = 1 at '+d);
  const o=L.pondEdge(a,2);assert(Math.abs(L.pondQ(o.x,o.z,2)-1)<1e-6,'a margin moves the edge out along the radius');
  const m=L.pondEdge(a,-3);assert(Math.abs(L.pondInset(m.x,m.z)-3)<1e-6,'pondInset is metres in from the edge');
  const h={x:P.x+(e.x-P.x)*.5,z:P.z+(e.z-P.z)*.5};assert(Math.abs(L.pondQ(h.x,h.z)-.5)<1e-9,'q is linear along a ray');}
 // The north edge holds (no closer to the bowl's apron than it was), and the new water area is ~50% more.
 for(let d=0;d<360;d+=2){const e=L.pondEdge(d*Math.PI/180,L.POND_RIM);assert(!L.onApron(e.x,e.z,2),'the rim clears the apron at '+d);}
 let n=0;for(let x=-200;x<-100;x+=.5)for(let z=50;z<130;z+=.5)if(L.inPond(x,z))n++;assert(n/4>Math.PI*27*20*1.35,'water area grew: '+n/4+' m²');
});

ok('the depth profile: a wadeable shelf, a deep swimmable middle',()=>{
 const D=L.POND_DEPTH;assert.equal(L.pondDepthAt(P.x,P.z),D.deep);assert(D.deep>=2.5&&D.deep<=3.5,'2.5–3.5 m in the middle');
 for(let d=0;d<360;d+=15){const a=d*Math.PI/180;let last=-1;
  for(let i=0;i<=20;i+=.25){const p=L.pondEdge(a,-i),dep=L.pondDepthAt(p.x,p.z);if(!L.onPondJetty(p.x,p.z)){assert(dep>=last-1e-9,'deepens inward at '+d+'°');last=dep;}}
  const e=L.pondEdge(a,.01);assert.equal(L.pondDepthAt(e.x,e.z),0,'dry on the bank');
  for(const i of [3.5,4,4.5]){const p=L.pondEdge(a,-i);if(L.onPondJetty(p.x,p.z))continue;const dep=L.pondDepthAt(p.x,p.z);assert(dep>=.4&&dep<=.8,`the shelf ${i} m in is 0.4–0.8 m (${dep.toFixed(2)}) at ${d}°`);}}
 assert(L.pondDepthForInset(D.dropIn)<WD.ZONE_SWIM,'the shelf is wading water, not swimming');
 assert(L.pondDepthForInset(D.deepIn)>=D.dive,'the middle is diving water');
 assert.equal(L.pondDepthAt(L.POND_JETTY_AT.endX-L.POND_JETTY_AT.ux*.5,L.POND_JETTY_AT.endZ-L.POND_JETTY_AT.uz*.5),0,'the jetty is dry');
});

ok('wade in, swim, wade and walk back out (the real probe and water state)',()=>{
 const probe=WD.createWaterProbe(),st=S.createWaterState(probe,()=>false,()=>Infinity,(x,z)=>probe.pond?S.pondDiveRoom(x,z):NaN);
 const inp={stick:1,moving:true,speed:2,landY:0,yaw:-Math.PI/2,airborne:false},seen=[];
 const step=(x,z)=>{const ev=st.step(1/60,x,z,inp);const k=st.state.phase;if(seen.at(-1)!==k)seen.push(k);return ev;};
 const east=L.pondEdge(0,6),west=L.pondEdge(Math.PI,-6);
 for(let i=0;i<30;i++)step(east.x,east.z);assert.equal(st.state.phase,'land');
 let entered=false,started=false;for(let x=east.x;x>P.x;x-=2/60){const ev=step(x,P.z);entered||=ev.entered;started||=ev.swimStarted;
  if(st.state.phase==='wade')assert(probe.pond&&st.state.depth<WD.ZONE_SWIM+WD.WADE_HYSTERESIS+.01,'wading on the shelf');}
 assert(entered&&started,'entered the water, then started swimming');assert.equal(st.state.phase,'swim');assert(st.swimming);
 for(let i=0;i<120;i++)step(P.x,P.z);
 assert(probe.pond&&probe.level===L.POND_Y&&probe.foot===0,'the probe is in the pond: its own surface, the bank for the feet');
 assert(Math.abs(st.state.rootY-(L.POND_Y-WD.SWIM_ROOT_DEPTH))<1e-3,'the swimmer floats at the pond surface, not the sea level');
 assert(st.pose.w===1&&(st.pose.kind==='crawl'||st.pose.kind==='tread'),'the sea\'s swim pose');
 let left=false;for(let x=P.x;x<east.x;x+=2/60){const ev=step(x,P.z);left||=ev.left;}
 assert(left&&st.state.phase==='land'&&!probe.pond,'walked back out onto the bank');
 assert.equal(seen.join(),'land,wade,swim,wade,land','land → wade → swim → wade → land');
 assert(Math.abs(st.state.rootY)<1e-9,'standing on the bank');
 // A swimmer can't swim out across the bank's grass (the probe allows the pond's water only; the bank is land to climb onto).
 assert(probe.isLand(east.x,east.z)&&!probe.isLand(P.x,P.z)&&!probe.isLand(west.x,west.z),'the pond is water, the bank is land');
 // The sea's probe is untouched: no pond far from it.
 assert.equal(WD.createWaterProbe().isLand(0,0),true);
});

ok('dive: only over the deep middle, bounded above the pond bed',()=>{
 const probe=WD.createWaterProbe(),st=S.createWaterState(probe,()=>false,()=>Infinity,(x,z)=>probe.pond?S.pondDiveRoom(x,z):NaN);
 const inp={stick:0,moving:false,speed:0,landY:0,yaw:0,airborne:false};
 const at=(x,z,n=120)=>{for(let i=0;i<n;i++)st.step(1/60,x,z,inp);};
 const e=L.pondEdge(0,1);at(e.x,e.z,10);
 const swimShelf=L.pondEdge(0,-(L.POND_DEPTH.dropIn+2.2));for(let x=e.x;x>swimShelf.x;x-=.03)at(x,P.z,1);at(swimShelf.x,P.z);
 assert.equal(st.state.phase,'swim','swimming over the drop-off');assert(st.state.depth<L.POND_DEPTH.dive);assert(!st.canDive(),'Dive is greyed over the drop-off');
 assert.equal(st.press('dive','tap'),false);
 for(let x=swimShelf.x;x>P.x;x-=.05)at(x,P.z,1);at(P.x,P.z);
 assert(st.canDive()&&st.press('dive','tap'),'Dive works in the deep middle');at(P.x,P.z,300);
 const bed=-L.pondDepthAt(P.x,P.z);assert(st.state.dive>.5&&st.state.dive<=S.DIVE.depth+1e-9,'dived '+st.state.dive.toFixed(2));
 assert(st.state.rootY>=bed+S.DIVE.body-1e-6,'the body stays above the pond bed');
 // Swimming back over the shelf surfaces the dive.
 for(let x=P.x;x<swimShelf.x;x+=.05)at(x,P.z,1);at(swimShelf.x,P.z,200);assert(!st.diveActive,'surfaced over the shallows');
 assert.equal(S.pondDiveRoomFor(L.POND_DEPTH.dive-.01),0);assert(S.pondDiveRoomFor(L.POND_DEPTH.deep)>1);
});

ok('splash-downs, rides and map travel at the pond',()=>{
 assert(WD.canSplashDown(P.x,P.z),'a fall into the deep middle splashes down');
 const shelf=L.pondEdge(.3,-2);assert(!WD.canSplashDown(shelf.x,shelf.z),'onto the shelf: an ordinary landing');
 const bank=L.pondEdge(.3,4);assert(!WD.canSplashDown(bank.x,bank.z));
 // A bike rides through the shallows but stops at the drop-off, like the sea's edge; on foot you go on in.
 const run=mode=>{const p={x:L.pondEdge(Math.PI,8).x,z:P.z},v={x:0,z:0};for(let i=0;i<60*8;i++)sim.stepPlayer(p,v,{x:1,z:0,sprint:false},1/60,[],mode);return p;};
 const bike=run('bike');assert(L.inPond(bike.x,bike.z)&&L.pondDepthAt(bike.x,bike.z)<=L.POND_DEPTH.ride+.05,'the bike stops at the drop-off ('+L.pondDepthAt(bike.x,bike.z).toFixed(2)+' m)');
 const walk=run('walk');assert(L.pondDepthAt(walk.x,walk.z)>L.POND_DEPTH.ride,'on foot: on into the deep water (the water model swims you)');
 // Map travel: arriving on the pond's deep water arrives swimming; a ride arriving there is left behind.
 assert.equal(TA.travelArrival({ride:'bike',swimming:false,air:0},{groundY:0,water:true}).swimming,true);
 const town=read('components/Town.tsx');
 assert(/water:ballGround\(x,z\)==='sea'\|\|nearPond\(x,z\)&&pondDepthAt\(x,z\)>1/.test(town),'Town treats the pond as water for arrivals');
});

ok('props, paths and the beach clear of the bigger pond',()=>{
 const lines=L.parkPathLines(),pondWalk=L.PARK_TRAILS.findIndex(t=>t.id==='pond');
 for(let d=0;d<360;d+=2){const a=d*Math.PI/180,r=L.pondEdge(a,L.POND_RIM);
  assert(lines.every((l,i)=>i===pondWalk||L.segDistance(r.x,r.z,l)>L.TRAIL_WIDTH/2+1),'trails clear of the rim at '+d);
  assert(L.onGrass(r.x,r.z)&&!L.PARK_LAWNS.some(l=>Math.hypot((r.x-l.x)/l.rx,(r.z-l.z)/l.rz)<1.1),'the rim on grass, off the lawns');}
 // Nov 13 2026 (owner: "the pathway is overlapping into the pond"): no trail, round ends and half-width included, reaches the water.
 for(let d=0;d<360;d+=.5){const e=L.pondEdge(d*Math.PI/180,0);lines.forEach((l,i)=>assert(L.segDistance(e.x,e.z,l)>=L.TRAIL_WIDTH/2-.005,`path ${i} (${L.PARK_TRAILS[i]?.id??"ring"}) reaches into the water at ${d}° (${L.segDistance(e.x,e.z,l).toFixed(3)} m from its centreline)`));}
 assert(lines.every(l=>l.every(([x,z])=>!L.inPond(x,z,L.TRAIL_WIDTH/2-.01))),'no trail point within a half-width of the water');
 for(const [x,z] of L.POND_BENCHES)assert(!L.onWalkPath(x,z,.8)&&!L.inPond(x,z,L.POND_RIM+.5),'bench clear of the rim and paths');
 {const s=L.POND_SIGN;assert(!L.onParkPaving(s.x,s.z,1.6)&&!L.inPond(s.x,s.z,L.POND_RIM+1),'the LILY POND sign clear');}
 const F=load('lib/town/fishing/fishSpots.ts').spotById('park-pond'),core=load('lib/town/fishing/fishingCore.ts');
 assert(!L.inPond(F.x,F.z,L.POND_RIM+.6)&&!L.onWalkPath(F.x,F.z,.5),'the fishing stall on the grass past the rim');
 const c=core.castPoint(F,F);assert(core.inPondWater(c.x,c.z)&&!L.onPondJetty(c.x,c.z,1),'its cast lands in the water, clear of the jetty');
 assert(Math.hypot(L.POND_JETTY_AT.x-F.x,L.POND_JETTY_AT.z-F.z)<14,'the jetty is beside the fishing stall');
 for(const t of load('lib/town/stadiumOrchard.ts').stadiumOrchardTrees())assert(!L.inPond(t.x,t.z,L.POND_RIM+4),t.id+' clear of the pond');
 // The beach (owner: "extend the beach south of that"): the coast moved out, ≥ 15 m of sand between the bigger pond and the sea,
 // and the pond ≥ 30 m from the water's edge.
 for(let x=P.x-P.rx;x<=P.x+P.rx;x+=3){let z=P.z;while(L.inPond(x,z,L.POND_RIM)||z<P.z)z+=.25;const rim=z;while(L.onGrass(x,z))z+=.25;const grass=z;while(SH.onIsland(x,z))z+=.25;
  assert(z-grass>=15,`≥ 15 m of sand below the pond at x ${x} (${(z-grass).toFixed(1)})`);assert(SH.distanceToShore(x,rim)>=30,'the rim 30 m+ from the sea at x '+x);}
});

ok('pond life, remote swimmers, the map and the sea look',()=>{
 // Remote swimmers (wire mode Swim = 8, Dive = 9): no footstep splashes, like at sea.
 const calls=[];const rp=RP.createRemotePond({active:true,remoteFx:(k)=>calls.push(k)});
 for(let i=0;i<120;i++){rp.begin(1/60,0,false);rp.member(1,{x:P.x,y:-1,z:P.z,yaw:0,speed:3,mode:8,fade:1});rp.member(2,{x:P.x+3,y:-1,z:P.z,yaw:0,speed:3,mode:9,fade:1});rp.end();}
 assert.equal(calls.length,0,'no splashes for swimmers');
 const pond=read('lib/town/parkPond.ts');assert(/if\(i\.swimming\)\{wasGround=true;/.test(pond)&&/pondShape\(a\)/.test(pond),'the pond life: no walker splashes for a swimmer; the koi keep inside the real outline');
 const town=read('components/Town.tsx');
 assert(/pondLife\.update\(active\?dt:0,\{swimming:water\.swimming&&rideRef\.current==='walk'/.test(town),'Town tells the pond life the player is swimming');
 assert(/\(x,z\)=>waterProbe\.pond\?pondDiveRoom\(x,z\):NaN/.test(town)&&/waterY=waterProbe\.level\?\?WATER_LEVEL;/.test(town),'the dive bound and the water level follow the pond');
 assert(/!waterProbe\.pond\/\* no sharks in the park pond \*\//.test(town),'no sharks in the pond');
 assert(/q:\(x,z\)=>!nearPond\(x,z,1\)\?2:onPondJetty\(x,z\)\?1\.5:pondQ\(x,z\)/.test(town),'the ball skips and floats on the real outline, not on the jetty');
 const map=read('components/IslandOverview.tsx');assert(/<polygon aria-label="Lily pond" data-park-pond=""/.test(map)&&/pondEdge\(k\/72\*Math\.PI\*2\)/.test(map),'the map draws the pond\'s own outline');
 // The water's look is the sea's: the same material numbers, colour ramp and ripple tile.
 const ws=read('lib/graphics/waterSurface.ts'),pw=read('lib/graphics/pondWater.ts'),world=read('lib/town/world.ts');
 assert(/new T\.MeshStandardMaterial\(\{\.\.\.SEA_WATER_LOOK,map:waterRipples\.texture\}\)/.test(world)&&/seaRipples:waterRipples\.texture/.test(world),'the ocean and the pond share SEA_WATER_LOOK and the ripple tile');
 assert(/\{\.\.\.SEA_WATER_LOOK,transparent:true/.test(pw)&&/SEA_GLSL\.lagoon/.test(pw)&&/SEA_GLSL\.deep/.test(pw)&&/SEA_GLSL\.lagoon/.test(ws)&&/SEA_GLSL\.deep/.test(ws),'one colour ramp for both');
 const PW=load('lib/graphics/pondWater.ts');assert(PW.pondSeaDistance(L.POND_DEPTH.shelf)<=3&&PW.pondSeaDistance(L.POND_DEPTH.deep)>=24,'the shelf is the sea\'s pale shallows, the middle its teal');
 // Edge detail and the sandy shore (westPark.ts stats; one build in tests/west-stadium.cjs checks the draw budget).
 const wp=read('lib/town/westPark.ts');assert(/stats\.pondRocks\+\+/.test(wp)&&/stats\.pondReeds\+\+/.test(wp)&&/POND_JETTY_AT/.test(wp)&&/sandK\(a\)/.test(wp),'rocks, reeds, the jetty and the sandy shore are built');
});

if(failed){console.log('POND_SWIM_FAIL '+failed);process.exit(1);}
console.log('PASS pond swim: a bigger irregular pond with a wadeable shelf and a 3.2 m middle, swum like the sea, diving over the deep middle only, rides stop at the drop-off, props clear, 15 m+ of sand to the sea');
