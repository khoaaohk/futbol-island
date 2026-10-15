// Summit Isle Ball Cannon (Oct 14 2026). Run: node tests/ball-cannon.cjs
//  1. placement: on the open grass above the north beach, east of where the sandbar path comes ashore; gentle ground; clear of the
//     trails (≥ 4 m), the sandbar landing, the welcome and riddle boards, the hikers, the orchard and every tree, rocks, the pitch,
//     the hidden balls / huts / caves, beach finds and fishing spots; off the bike test lines of tests/summit-rides.cjs
//  2. the firing arc points out to sea: every aim in the arc and every disc from the trap comes down in the water, never over the
//     sandbar or its path, never near the hikers
//  3. hit detection: the swept closest approach (a fast ball never skips through a disc), and every disc can be knocked out
//  4. pools: 8 balls, 6 discs, 24 shards, never more, recycled
//  5. at rest nothing runs: no rAF/timers, no pools, no store writes; seated and idle only the aim arc; pools gone after you leave
//  6. no coins, no score, no records: no wallet, no saves, nothing stored
//  7. the prompt and the seat flow (sit → aim → fire → release → hit → Back), the camera behind the barrel, the analytics counts
//  8. wiring: Town, the HUD, the static prop in the island build, npm test
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {ROOT,createLoader,browser}=require('./summit-harness.cjs');
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
let failed=0;const ok=async(name,fn)=>{try{await fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};
const T=require('three');
const load=createLoader({'three':T});
const S=load('lib/town/summitIsle.ts'),C=load('lib/town/ballCannon.ts'),W=load('lib/town/summitIsleWorld.ts'),BW=load('lib/town/ballCannonWorld.ts');
const D=Math.PI/180,L=C.cannonLayout();
// The island's colliders from the real build (stub tools), then the cannon's own pieces separately.
const obstacles=[],town=new T.Group(),mk=g=>{const m=new T.Mesh(g,new T.MeshStandardMaterial());town.add(m);return m;};
const tools={box:(w,h,d,c,x,y,z)=>{const m=mk(new T.BoxGeometry(w,h,d));m.position.set(x,y,z);return m;},cylinder:(r,h,c,x,y,z)=>{const m=mk(new T.CylinderGeometry(r,r,h,8));m.position.set(x,y,z);return m;},
 put:(g,c,x,y,z)=>{const m=mk(g);m.position.set(x,y,z);return m;},sign:(t,w,h,x,y,z)=>{const m=mk(new T.PlaneGeometry(w,h));m.position.set(x,y,z);return m;}};
W.buildSummitIsle({...tools,town,obstacles,assets:[],surfaceAreas:[]});
const before=obstacles.length;load('lib/town/summitActivitiesWorld.ts').buildSummitActivityProps({...tools,obstacles});
const mine=[];const meshesBefore=town.children.length;BW.buildBallCannonProps({...tools,obstacles:mine});const propMeshes=town.children.slice(meshesBefore);
const others=obstacles.filter(o=>!mine.some(m=>m.x===o.x&&m.z===o.z&&m.w===o.w));
const reachOf=o=>Math.hypot(o.w,o.d)/2;
/** Gap (m) from a point to the edge of the cannon's colliders. */
const gapToMine=(x,z)=>Math.min(...mine.map(o=>Math.hypot(x-o.x,z-o.z)-reachOf(o)));
const pathDist=(x,z)=>Math.min(...S.SUMMIT_PATHS.map(p=>{let b=Infinity;for(let i=1;i<p.length;i++){const a=p[i-1],c=p[i],dx=c.x-a.x,dz=c.z-a.z,l2=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/l2));b=Math.min(b,Math.hypot(x-a.x-dx*t,z-a.z-dz*t));}return b;}));
const pieces=[{x:L.x,z:L.z,r:C.CANNON.baseR,what:'cannon deck'},{x:L.trap.x,z:L.trap.z,r:.45,what:'clay trap'}];

(async()=>{
await ok('placement: the grass above the north beach, east of the sandbar landing, gentle and walkable',()=>{
 const land=S.SUMMIT_LANDMARKS.sandbarLanding;
 assert(S.onSummitIsle(L.x,L.z)&&S.onSummitIsle(L.trap.x,L.trap.z),'on the island');
 assert(L.x>land.x+10&&L.x<land.x+30&&L.z>land.z+3&&L.z<land.z+16,`east of the landing, a little up the slope (${(L.x-land.x).toFixed(1)}, ${(L.z-land.z).toFixed(1)} from it)`);
 // Just above the beach: on the grass, not the sand, and well below the steep slopes.
 assert(L.ground>.3&&L.ground<2.5,`on the grass just above the beach (ground ${L.ground.toFixed(2)} m)`);
 let coast=L.z;while(S.onSummitLand(L.x,coast))coast-=.5;assert(L.z-coast>14&&L.z-coast<32,`${(L.z-coast).toFixed(0)} m up from the water`);
 for(const p of [...pieces,{...L.seat,what:'seat'}])assert(S.summitSlope(p.x,p.z)<=C.CANNON.maxSlope+.02,`${p.what||'seat'}: gentle ground (${S.summitSlope(p.x,p.z).toFixed(2)})`);
 // The deck sits level: its top over the highest ground under its rim; its stone footing reaches the lowest.
 let hi=-Infinity;for(let a=0;a<16;a++)hi=Math.max(hi,S.summitGround(L.x+Math.cos(a/16*Math.PI*2)*C.CANNON.baseR,L.z+Math.sin(a/16*Math.PI*2)*C.CANNON.baseR));assert(L.deck>=hi&&L.deck-hi<.3,'a level deck');
 assert(Math.abs(L.seat.ground+C.CANNON.seatY-(L.seat.ground+.64))<1e-9,'the seat top is the bench pose height (BENCH_SEAT_Y)');
 // You can walk up to it and step off it: the stand spot is walkable and clear.
 assert(S.onSummitIsle(L.stand.x,L.stand.z)&&!obstacles.some(o=>Math.abs(L.stand.x-o.x)<o.w/2+.3&&Math.abs(L.stand.z-o.z)<o.d/2+.3),'the stand spot is walkable and clear');
 assert(Math.hypot(L.stand.x-L.x,L.stand.z-L.z)<C.CANNON.reach,'and within reach of the prompt');
 assert(propMeshes.length>=15&&propMeshes.length<=40,`a modest static prop (${propMeshes.length} palette parts, batched)`);
});

await ok('clearances: trails, landing, boards, hikers, orchard, rocks, pitch, balls, huts, caves, beach finds, fishing',()=>{
 const N=load('lib/town/summitIsleNpcs.ts'),B=load('lib/town/summitBalls.ts'),BC=load('lib/town/beachcombing.ts'),FC=load('lib/town/fishing/fishCatalog.ts'),O=load('lib/town/summitOrchard.ts');
 const land=S.SUMMIT_LANDMARKS.sandbarLanding;
 for(const p of pieces){const at=`${p.what} (${p.x.toFixed(1)}, ${p.z.toFixed(1)})`;
  assert(pathDist(p.x,p.z)-p.r>=4,`${at}: ≥ 4 m from every trail (${(pathDist(p.x,p.z)-p.r).toFixed(1)})`);assert(S.summitTrailDistance(p.x,p.z)>=4+p.r,`${at}: off the carved trail`);
  assert(Math.hypot(p.x-land.x,p.z-land.z)>=12,`${at}: clear of the sandbar landing`);
  assert(Math.hypot(p.x-(land.x+5),p.z-(land.z+3))>=7,`${at}: clear of the welcome board`);
  assert(Math.hypot(p.x-B.RIDDLE_BOARD.x,p.z-B.RIDDLE_BOARD.z)>=8,`${at}: clear of the riddle board`);
  for(const n of N.SUMMIT_ISLE_NPCS)assert(Math.hypot(p.x-n.x,p.z-n.z)>=8,`${at}: clear of ${n.id}`);
  for(const t of W.SUMMIT_TREE_SITES)assert(Math.hypot(p.x-t.x,p.z-t.z)-p.r>=3,`${at}: clear of the ${t.form??t.kind} at ${t.x.toFixed(1)},${t.z.toFixed(1)}`);
  for(const r of W.SUMMIT_ROCK_SITES)assert(Math.hypot(p.x-r.x,p.z-r.z)-p.r-r.reach>=3,`${at}: clear of a rock`);
  assert(!O.nearPitch(p.x,p.z,10),`${at}: far from the pitch fence`);
  for(const s of B.SUMMIT_BALL_SPOTS)assert(Math.hypot(p.x-s.x,p.z-s.z)>=6,`${at}: clear of the hidden ball ${s.id}`);
  for(const tr of Object.values(B.TREE_BALL_TREES))assert(Math.hypot(p.x-tr.x,p.z-tr.z)>=6,`${at}: clear of a ball tree`);
  for(const h of B.SUMMIT_HUTS)assert(Math.hypot(p.x-h.x,p.z-h.z)>=15,`${at}: clear of the ${h.id} hut`);
  for(const c of B.SUMMIT_CAVES)assert(Math.hypot(p.x-c.x,p.z-c.z)>=15,`${at}: clear of the ${c.id} cave`);
  for(const f of FC.FISH_SPOTS)if(f.area==='summit')assert(Math.hypot(p.x-f.x,p.z-f.z)>=20,`${at}: clear of the fishing spot ${f.id}`);
  for(const z of BC.BEACH_ZONES)if(z.island==='summit')for(const c of BC.zoneCandidates(z))assert(Math.hypot(p.x-c.x,p.z-c.z)-p.r>=1.5,`${at}: clear of the beach find spot ${c.key}`);
  // The other Summit Isle activities (the telescope, the Summit Kick post) keep their own spots.
  {const k=load('lib/town/summitKick.ts').kickLayout().post;assert(Math.hypot(p.x-k.x,p.z-k.z)>=20,`${at}: clear of the kick post`);
   if(fs.existsSync(path.join(ROOT,'lib/town/telescope.ts'))){const sp=load('lib/town/telescope.ts').telescopeSpot();assert(Math.hypot(p.x-sp.x,p.z-sp.z)>=20,`${at}: clear of the telescope`);}}
  for(const o of others)assert(Math.hypot(p.x-o.x,p.z-o.z)-p.r-reachOf(o)>=1.5,`${at}: clear of the collider at ${o.x.toFixed(1)},${o.z.toFixed(1)}`);}
 // The orchard plants keep their trees (it is planned before the cannon is built: no tree moved).
 assert(O.planOrchard(()=>false,[]).length>0);
});

await ok('the bike test lines (tests/summit-rides.cjs) pass clear of the cannon',()=>{
 const PK=S.SUMMIT_PEAK,F=S.SUMMIT_FENCE,PI=S.SUMMIT_PITCH,LM=S.SUMMIT_LANDMARKS,GO={x:LM.gate.x,z:LM.gate.z+1.5};
 const START=[];for(let k=0;k<16;k++){const a=k/16*Math.PI*2;START.push(S.heightPoint(a,k%2?14:30));}START.push({x:716,z:98},{x:548,z:126});
 // Down: radially from the peak to the beach (toBeach); up: straight at the gate (the fence detours go round the pitch, far away).
 let nearest=Infinity;
 for(const s of START){const a=Math.atan2(s.z-PK.z,s.x-PK.x),b=S.beachPoint(a,.5);
  for(let t=0;t<=1;t+=.005){const x=s.x+(b.x-s.x)*t,z=s.z+(b.z-s.z)*t;nearest=Math.min(nearest,gapToMine(x,z));}
  for(let t=0;t<=1;t+=.005){const x=s.x+(GO.x-s.x)*t,z=s.z+(GO.z-s.z)*t;nearest=Math.min(nearest,gapToMine(x,z));}}
 assert(nearest>=2.5,`every line passes ≥ 2.5 m from the cannon's colliders (closest ${nearest.toFixed(1)} m; a ride's radius is 0.8 m)`);
 // The foothill slope lines too (beach → 6 m up, every 20°).
 for(let deg=0;deg<360;deg+=20){const a=deg*D,b=S.beachPoint(a,1.2),top=S.heightPoint(a,6);for(let t=0;t<=1;t+=.02)assert(gapToMine(b.x+(top.x-b.x)*t,b.z+(top.z-b.z)*t)>1,`the ${deg}° foothill line`);}
});

await ok('the firing arc points out to sea: every ball and disc comes down in the water, away from the sandbar and the hikers',()=>{
 const N=load('lib/town/summitIsleNpcs.ts'),bar=S.SANDBAR_PATH,barSide=(x,z)=>{const f=S.sandbarFrame(x,z);return f.dist-S.sandbarHalfWidth(f.s)-S.SANDBAR_SKIRT;};
 const pathMaxX=Math.max(...S.SUMMIT_PATHS[0].map(p=>p.x));
 const check=(f,what)=>{const l=C.flightLanding(f);assert(l,`${what}: comes down`);assert(l.sea,`${what}: lands in the sea (${l.x.toFixed(1)}, ${l.z.toFixed(1)})`);
  const p={x:0,y:0,z:0};let minBar=Infinity;for(let u=0;u<=l.t;u+=1/60){C.flightAt(f,f.t0+u,p);if(!S.onSummitIsle(p.x,p.z))minBar=Math.min(minBar,barSide(p.x,p.z));// over the bar or the sea (not the island's own beach)

   assert(p.x>pathMaxX+5,`${what}: never over the sandbar path's side of the beach`);for(const n of N.SUMMIT_ISLE_NPCS)if(u>.2)assert(Math.hypot(p.x-n.x,p.z-n.z)>8,`${what}: never near ${n.id}`);}
  assert(minBar>=6,`${what}: ≥ 6 m clear of the sandbar's sand (${minBar.toFixed(1)})`);
  // Out to sea: the landing is north of the cannon (toward the open water), within the arc's spread.
  assert(l.z<L.z-20,`${what}: northward, out over the water`);return l;};
 const A=C.CANNON;
 for(let y=-A.arc;y<=A.arc+1e-9;y+=A.arc/4)for(let p=A.pitchMin;p<=A.pitchMax+1e-9;p+=5){const aim=C.clampAim({yaw:y*D,pitch:p*D});check(C.fireBall(L,aim,0),`ball yaw ${y.toFixed(1)}° pitch ${p}°`);}
 // The clamps: nothing beyond the arc.
 const wide=C.clampAim({yaw:3,pitch:3}),low=C.clampAim({yaw:-3,pitch:-3});
 assert.equal(wide.yaw,A.arc*D);assert.equal(wide.pitch,A.pitchMax*D);assert.equal(low.yaw,-A.arc*D);assert.equal(low.pitch,A.pitchMin*D);
 assert(A.bearing-A.arc>=-15&&A.bearing+A.arc<=60,'the arc stays between north-north-west and north-east (away from the sandbar to the west)');
 let topLo=Infinity,topHi=0;for(let n=0;n<200;n++){const f=C.throwDisc(L,n,0),l=check(f,'disc '+n);let top=0;const p={x:0,y:0,z:0};for(let u=0;u<l.t;u+=.02)top=Math.max(top,C.flightAt(f,u,p).y);topLo=Math.min(topLo,top);topHi=Math.max(topHi,top);
  assert(l.t>=2&&l.t<=4.5,`disc ${n}: in the air ${l.t.toFixed(1)} s (time to aim)`);}
 assert(topLo>4&&topHi<14,`discs rise 4–14 m (${topLo.toFixed(1)}–${topHi.toFixed(1)})`);
 assert.deepEqual(C.throwDisc(L,7,0),C.throwDisc(L,7,0),'a disc throw is deterministic');assert.notDeepEqual(C.throwDisc(L,7,0).v,C.throwDisc(L,8,0).v,'and varied');
 // Frame-rate independent: closed-form flights are the same at 20, 30 and 60 fps.
 const f=C.fireBall(L,C.startAim(),0),at=C.flightAt(f,1.2);for(const fps of [20,30,60]){let t=0;for(let i=0;i<Math.round(1.2*fps);i++)t+=1/fps;assert(Math.hypot(C.flightAt(f,t).x-at.x,C.flightAt(f,t).y-at.y)<1e-6);}
});

await ok('hit detection: swept closest approach, no tunnelling, every disc can be knocked out',()=>{
 const v=(x,y,z)=>({x,y,z});
 assert(Math.abs(C.sweptDistance(v(0,0,0),v(10,0,0),v(5,1,0),v(5,1,0))-1)<1e-9,'passing 1 m from a still disc');
 assert(C.discHit(v(-10,0,0),v(10,0,0),v(0,.5,0),v(0,.5,0)),'a fast ball crossing a disc within one frame is a hit (no skipping through)');
 assert(!C.discHit(v(-10,0,0),v(10,0,0),v(0,2,0),v(0,2,0)),'2 m away is a miss');
 assert(C.discHit(v(0,0,0),v(1,0,0),v(1,0,1),v(0,0,0)),'two moving things that meet mid-frame');
 assert(!C.discHit(v(0,0,0),v(1,0,0),v(0,0,5),v(1,0,5)),'side by side, 5 m apart');
 // Every one of the first 12 discs can be hit by some aim and firing moment (30 fps, the runtime's frame test).
 for(let n=0;n<12;n++){const d=C.throwDisc(L,n,0),dl=C.flightLanding(d);let hit=false;
  for(let tf=.2;tf<dl.t-.3&&!hit;tf+=.1)for(let y=-25;y<=25&&!hit;y+=2.5)for(let p=10;p<=40&&!hit;p+=2.5){const b=C.fireBall(L,C.clampAim({yaw:y*D,pitch:p*D}),tf);
   const b0={x:0,y:0,z:0},b1={x:0,y:0,z:0},d0={x:0,y:0,z:0},d1={x:0,y:0,z:0};for(let t=tf;t<tf+3&&t<dl.t;t+=1/30){C.flightAt(b,t,b0);C.flightAt(b,t+1/30,b1);C.flightAt(d,t,d0);C.flightAt(d,t+1/30,d1);if(C.discHit(b0,b1,d0,d1)){hit=true;break;}}}
  assert(hit,`disc ${n} can be knocked out`);}
 assert(C.CANNON.hitR>=C.CANNON.ballR+C.CANNON.discR,'the hit reach covers the ball and the disc (and a little more for young players)');
});

// ---- The runtime on real three.js with browser stubs.
async function runtime(){
 const env=browser(),T3=await import('three'),BGU=await import('three/examples/jsm/utils/BufferGeometryUtils.js'),counts=[];
 const rl=createLoader({'three':T3,'three/examples/jsm/utils/BufferGeometryUtils.js':BGU,'analytics/summitEvents':{countCannonSit:()=>counts.push('su:cannon_sit'),countCannonHit:()=>counts.push('su:cannon_hit')}});
 return {env,T:T3,rl,counts,mod:rl('lib/graphics/ballCannon.ts'),store:rl('lib/town/ballCannonStore.ts')};
}
const portLog=()=>{const log={teleports:[],kicks:0,impacts:0,splashes:0};return {log,ports:{teleport:(x,z,yaw)=>log.teleports.push({x,z,yaw}),kick:()=>log.kicks++,impact:()=>log.impacts++,splash:()=>log.splashes++}};};

await ok('at rest nothing runs; seated and idle only the aim arc; pools exist only while needed (8 balls, 6 discs, 24 shards)',async()=>{
 const {env,T:T3,mod,store}=await runtime(),scene=new T3.Scene(),camera=new T3.PerspectiveCamera(40,390/844,1,500);camera.position.set(L.x+17,L.ground+23,L.z+31.5);camera.lookAt(L.x,L.ground,L.z);camera.updateMatrixWorld();
 const {ports,log}=portLog(),gun=mod.createBallCannon(scene,ports);const el={hidden:true,dataset:{},style:{}};let writes=0;const off=store.cannonStore.subscribe(()=>writes++);
 const ctx=(x,z,extra={})=>({dt:1/30,reduced:false,camera,width:390,height:844,x,z,onFoot:true,canEnter:true,focusKey:null,ui:()=>el,place(){},hide(e,h){e.hidden=h;},...extra});
 await env.watchTimers(async()=>{for(let i=0;i<120;i++){gun.update(ctx(120,40));gun.applyCamera(camera,1/30,false);gun.holdPlayer({x:0,z:0,kick:false,juggle:false},new Set(),1/30);}});
 assert.equal(env.counts.raf+env.counts.timeout+env.counts.interval,0,'no rAF or timers');assert.equal(scene.children.length,0,'on the main island: nothing in the scene at all');
 for(let i=0;i<60;i++)gun.update(ctx(L.x+40,L.z));
 assert.deepEqual(scene.children.map(c=>c.name),['ball-cannon-barrel'],'on Summit Isle at rest: only the barrel (the prop\'s turning piece)');
 const barrel=scene.children[0],m0=barrel.matrixWorld.clone();assert.equal(barrel.castShadow,false,'no shadow draw');assert.equal(barrel.matrixAutoUpdate,false,'its matrix is written only when it turns');
 assert.equal(writes,0,'no store writes at rest');assert.equal(gun.busy,false);
 // Sit, then idle: the pools are built but hidden (nothing drawn), only the aim arc shows.
 gun.update(ctx(L.stand.x,L.stand.z));store.cannonActions.sit();assert.equal(gun.seated,true);
 const names=()=>scene.children.filter(c=>c.visible).map(c=>c.name).sort();
 for(let i=0;i<30;i++){gun.holdPlayer({x:0,z:0,kick:false,juggle:false},new Set(),1/30);gun.update(ctx(L.seat.x,L.seat.z));}
 assert.deepEqual(names(),['ball-cannon-aim','ball-cannon-barrel'],'seated and idle: the barrel and the aim arc only');
 const balls=scene.getObjectByName('ball-cannon-balls'),discs=scene.getObjectByName('ball-cannon-discs'),shards=scene.getObjectByName('ball-cannon-shards');
 assert(balls.isInstancedMesh&&discs.isInstancedMesh&&shards.isInstancedMesh,'three instanced pools');
 assert.equal(balls.instanceMatrix.count,8);assert.equal(discs.instanceMatrix.count,6);assert.equal(shards.instanceMatrix.count,24);
 assert(!balls.castShadow&&!discs.castShadow&&!shards.castShadow,'no shadow draws');
 assert(barrel.matrixWorld.equals(m0),'the barrel did not move while idle');
 // Spam: never more than the pools hold.
 let maxB=0,maxD=0,maxS=0;
 for(let i=0;i<300;i++){if(i%3===0)store.cannonActions.fire();if(i%7===0)store.cannonActions.release(2);gun.update(ctx(L.seat.x,L.seat.z));maxB=Math.max(maxB,balls.count);maxD=Math.max(maxD,discs.count);maxS=Math.max(maxS,shards.count);}
 assert(maxB<=8&&maxB>=4&&maxD<=6&&maxD>=1&&maxS<=24,`pools hold (balls ${maxB}/8, discs ${maxD}/6, shards ${maxS}/24)`);
 assert(log.kicks>10&&log.splashes>0,'the cannon thumps, balls splash down');
 // Leave: the flights finish, then everything but the barrel goes.
 store.cannonActions.leave();for(let i=0;i<30*8;i++)gun.update(ctx(L.stand.x,L.stand.z,{onFoot:false}));
 assert.deepEqual(scene.children.map(c=>c.name),['ball-cannon-barrel'],'after the last ball lands: the pools are disposed');assert.equal(gun.busy,false);
 off();gun.dispose();assert.equal(scene.children.length,0,'nothing left behind');
});

await ok('the seat flow: prompt → sit → aim → fire → release → knock out → Back; camera behind the barrel; counts',async()=>{
 const {env,T:T3,mod,store,counts}=await runtime(),scene=new T3.Scene(),camera=new T3.PerspectiveCamera(40,390/844,1,500);camera.position.set(L.x+17,L.ground+23,L.z+31.5);camera.lookAt(L.x-16,L.ground,L.z-33);camera.updateMatrixWorld();
 const {ports,log}=portLog(),gun=mod.createBallCannon(scene,ports);const el={hidden:true,dataset:{},style:{}};
 const ctx=(x,z,extra={})=>({dt:1/30,reduced:false,camera,width:390,height:844,x,z,onFoot:true,canEnter:true,focusKey:null,ui:()=>el,place(){},hide(e,h){e.hidden=h;},...extra});
 // The prompt: only on foot, nearby, and when the arbiter gives it the focus.
 assert.equal(gun.update(ctx(L.x+10,L.z)),null,'not from 10 m');
 assert.equal(gun.update(ctx(L.stand.x,L.stand.z,{onFoot:false})),null,'not from a ride or the jetpack');
 const want=gun.update(ctx(L.stand.x,L.stand.z));assert.equal(want?.key,mod.CANNON_FOCUS_KEY,'wants the focus beside it');assert.equal(el.hidden,true,'hidden until the arbiter picks it');
 gun.update(ctx(L.stand.x,L.stand.z,{focusKey:mod.CANNON_FOCUS_KEY}));assert.equal(el.hidden,false,'Sit in the ball cannon');
 // Sit: into the seat on the next tick, the player held, the sitting pose facing the barrel.
 store.cannonActions.sit();assert.equal(store.cannonStore.get().seated,true);assert.deepEqual(counts,['su:cannon_sit'],'analytics: one su:cannon_sit');
 const input={x:0,z:0,kick:true,juggle:true,shotPower:.7};assert.equal(gun.holdPlayer(input,new Set(),1/30),true,'the walk is skipped');
 assert.equal(input.kick,false);assert.equal(input.shotPower,0);assert.equal(log.teleports.length,1);assert(Math.hypot(log.teleports[0].x-L.seat.x,log.teleports[0].z-L.seat.z)<1e-9,'moved into the seat');
 const m=gun.pose({dribbling:true,juggle:.3,kick:.5},1);assert(m.trick&&m.trick.w===1&&m.trick.pelvisY>.6,'the sitting pose');assert.equal(m.facing,C.aimYaw(gun.aim));assert.equal(m.dribbling,false);assert.equal(m.kick,undefined);
 gun.update(ctx(L.seat.x,L.seat.z));assert.equal(el.hidden,true,'no prompt while seated');
 // The camera eases in behind the barrel and opens the lens a little on a portrait phone.
 for(let i=0;i<30;i++)gun.applyCamera(camera,1/30,false);
 const J=L.joint,d=C.aimDir(gun.aim),back={x:camera.position.x-J.x,z:camera.position.z-J.z};
 assert(back.x*d.x+back.z*d.z< -4.5,'behind the barrel');assert(camera.position.y>J.y&&camera.position.y<J.y+3,'a little above it');assert.equal(Math.round(camera.fov),58,'a wider lens on a portrait phone');
 const fwd=new T3.Vector3(0,0,-1).applyQuaternion(camera.quaternion);assert(fwd.x*d.x+fwd.z*d.z>.9,'looking where the barrel points');
 // Aim: drag and keys, clamped to the arc.
 const a0=gun.aim;store.cannonActions.aim(200,0);assert(gun.aim.yaw<a0.yaw,'drag right: the barrel turns right (east)');store.cannonActions.aim(-5000,-5000);assert.equal(gun.aim.yaw,C.CANNON.arc*D);assert.equal(gun.aim.pitch,C.CANNON.pitchMax*D);
 gun.holdPlayer({x:0,z:0,kick:false,juggle:false},new Set(['arrowright']),1);assert(gun.aim.yaw<C.CANNON.arc*D,'arrow keys turn it too');
 gun.holdPlayer({x:0,z:0,kick:false,juggle:false},new Set(['arrowdown']),5);assert.equal(gun.aim.pitch,C.CANNON.pitchMin*D,'down to the lowest');
 // Release a disc, fire at it with the aim and moment that hits it: it shatters ("Nice!"), the ball flies on into the sea.
 const n=0,disc=C.throwDisc(L,n,0),dl=C.flightLanding(disc);let plan=null;
 for(let tf=.3;tf<dl.t-.3&&!plan;tf+=1/30)for(let y=-25;y<=25&&!plan;y+=1)for(let p=10;p<=40&&!plan;p+=1){const aim=C.clampAim({yaw:y*D,pitch:p*D}),b=C.fireBall(L,aim,tf);let hit=false;
  for(let t=tf;t<tf+2.5;t+=1/30)if(C.discHit(C.flightAt(b,t),C.flightAt(b,t+1/30),C.flightAt(disc,t),C.flightAt(disc,t+1/30))){hit=true;break;}if(hit)plan={tf,aim};}
 assert(plan,'a hitting shot exists for the first disc');
 // Set the aim by dragging from the current one (the HUD's command), release, wait, fire.
 const k=C.CANNON.dragDegPerPx*D;store.cannonActions.aim(-(plan.aim.yaw-gun.aim.yaw)/k,-(plan.aim.pitch-gun.aim.pitch)/(k*.7));
 assert(Math.abs(gun.aim.yaw-plan.aim.yaw)<1e-6&&Math.abs(gun.aim.pitch-plan.aim.pitch)<1e-6,'aimed');
 // The disc leaves on the update after the release; the ball is fired `tf` later (frames of 1/30 s).
 store.cannonActions.release(1);let fired=false,frames=0;const start=gun.update(ctx(L.seat.x,L.seat.z));void start;
 for(let i=0;i<150;i++){frames++;if(!fired&&(frames-1)/30>=plan.tf-1e-6){store.cannonActions.fire();fired=true;}gun.update(ctx(L.seat.x,L.seat.z));if(store.cannonStore.get().hits)break;}
 const v=store.cannonStore.get();assert.equal(v.hits,1,'the disc is knocked out');assert.equal(v.word,'Nice!','a cheerful word, nothing more');assert(counts.includes('su:cannon_hit'),'analytics: su:cannon_hit');
 assert(env.counts.events.some(e=>e==='fi2-vending-cue:pop'),'a pop');assert(scene.getObjectByName('ball-cannon-shards').count>=3,'a little shard burst');
 for(let i=0;i<120;i++)gun.update(ctx(L.seat.x,L.seat.z));assert(log.splashes>=1,'the ball flies on and splashes into the sea');assert.equal(scene.getObjectByName('ball-cannon-shards').count,0,'the shards are gone within a second');
 // Back: out beside the seat, the follow camera eases back and the lens is restored.
 store.cannonActions.leave();assert.equal(store.cannonStore.get().seated,false);gun.holdPlayer({x:0,z:0,kick:false,juggle:false},new Set(),1/30);
 const out=log.teleports[log.teleports.length-1];assert(Math.hypot(out.x-L.stand.x,out.z-L.stand.z)<1e-9,'stepped off beside the deck');
 gun.applyCamera(camera,1/30,false);assert.equal(camera.fov,40,'the normal lens');
 assert.equal(gun.holdPlayer({x:0,z:0,kick:true,juggle:false},new Set(),1/30),false,'walking again');
 // Reduced motion: fewer, shorter shards.
 gun.dispose();
});

await ok('no coins, no score, no records',async()=>{
 const src=['lib/town/ballCannon.ts','lib/graphics/ballCannon.ts','lib/town/ballCannonStore.ts','components/BallCannonHud.tsx','lib/town/ballCannonWorld.ts'].map(f=>read(f).replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm,'')).join('\n');
 assert(!/arcadeWallet|creditRun|creditOnce|learnCoins|coinProgress|recordCoin|localStorage|sessionStorage|boardClient|HighScore|newBest|bestScore|score/i.test(src),'no wallet, coins, saves, boards or best scores');
 assert(!/requestAnimationFrame|setInterval|setTimeout/.test(src),'no loops or timers of its own');
 const view=load('lib/town/ballCannonStore.ts').cannonStore.get();assert.deepEqual(Object.keys(view).sort(),['hits','seated','shots','word'],'the HUD shows only the seat state and a cheer');
 const {env,T:T3,mod,store}=await runtime(),gun=mod.createBallCannon(new T3.Scene(),portLog().ports),camera=new T3.PerspectiveCamera();
 gun.update({dt:1/30,reduced:true,camera,width:390,height:844,x:L.stand.x,z:L.stand.z,onFoot:true,canEnter:true,focusKey:null,ui:()=>null,place(){},hide(){}});store.cannonActions.sit();
 for(let i=0;i<200;i++){if(i%5===0)store.cannonActions.fire();if(i%20===0)store.cannonActions.release(1);gun.update({dt:1/30,reduced:true,camera,width:390,height:844,x:L.seat.x,z:L.seat.z,onFoot:false,canEnter:true,focusKey:null,ui:()=>null,place(){},hide(){}});}
 assert.equal(env.store.size,0,'nothing written to storage');gun.dispose();
});

await ok('wiring: Town, the HUD, the island build, analytics, npm test',()=>{
 const town=read('components/Town.tsx');
 for(const re of [/const cannon=createBallCannon\(scene,/,/if\(cannon\.holdPlayer\(input\.current,keys,dt\)\)\{velocity\.x=velocity\.z=0;return;\}/,/cannon\.pose\(withJob\(/,/cannon\.applyCamera\(camera,dt,reduced\)/,/const cannonWant=cannon\.update\(/,/if\(cannonWant\)cands\.push\(\{kind:'enter',key:cannonWant\.key,distance:cannonWant\.distance\}\)/,/cannon\.dispose\(\)/,/<BallCannonHud\/>/])assert.match(town,re);
 const hud=read('components/BallCannonHud.tsx');
 for(const s of ['data-ball-cannon-sit','Sit in the ball cannon','BackButton','data-ball-cannon-fire','data-ball-cannon-release','data-ball-cannon-pull','store-enter-prompt'])assert(hud.includes(s),'HUD: '+s);
 const css=read('components/BallCannonHud.module.css');
 assert(/\.fire\{[^}]*width:104px;height:104px/.test(css)&&/\.disc\{[^}]*min-height:48px/.test(css),'big targets (≥ 44 px)');
 assert(/:has\(\.hud\)[^{]*\.touch-controls/.test(css),'the joystick hides while seated');
 assert(/var\(--btn-gold\)/.test(css)&&/var\(--btn-mint\)/.test(css)&&/translate:0 var\(--btn-press\)/.test(css),'the shared button tokens (docs/ui/BUTTONS.md)');
 assert(/prefers-reduced-motion/.test(css),'reduced motion: a shorter cheer');
 assert(/buildBallCannonProps\(\{box,cylinder,put,obstacles\}\)/.test(read('lib/town/summitActivitiesWorld.ts')),'the static prop joins the island build (batched)');
 const ids=load('lib/analytics/countIds.ts');assert(ids.isCountId('su:cannon_sit')&&ids.isCountId('su:cannon_hit'),'the counts are accepted');
 assert(/count\('su:cannon_sit'\)/.test(read('lib/analytics/summitEvents.ts')));
 assert(/node tests\/ball-cannon\.cjs/.test(read('package.json')),'in npm test');
});
console.log(failed?`\nball-cannon: ${failed} failed`:'\nball-cannon: all passed');process.exit(failed?1:0);
})();
