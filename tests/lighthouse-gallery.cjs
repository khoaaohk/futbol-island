// East Jetty lighthouse gallery (Oct 26 2026, lib/town/lighthouseGallery.ts + lighthouseGalleryWorld.ts). The spiral stair was
// removed (owner: too busy); the widened top stays, reached by the ladder (tests/lighthouse-ladder-climb.cjs) or by flying.
// Checks: no stair surface or stair walls at the plaza (a plain tower: walk and ride round it), jetpack landings land on the
// gallery's ring (never in the tower or on the lantern), walking and riding round the gallery stays on it (the railing is
// closed to walking, the gate too), the railing is white in the existing palette, the lantern sits above the railing, the merged
// geometry is small, the ball's solids, the hunt ball's spot, and the runtime wiring.
const assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const loaded=new Map();function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const mod={exports:{}};loaded.set(file,mod.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:mod.exports,module:mod,Math,Map,Set,Uint8Array,Float32Array,Float64Array,Uint16Array,Uint32Array,Int32Array,ArrayBuffer,JSON,console,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});loaded.set(file,mod.exports);return mod.exports;}
const src=f=>fs.readFileSync(f,'utf8');
const T=require('three');
const LG=load('lib/town/lighthouseGallery.ts'),{LIGHTHOUSE:L,lighthouseFloor,lighthouseSolid,lighthouseConstrain,lighthouseLanding,towerSolidRadius,TOWER_FOOT_R,isLighthouseTower}=LG;
const W=load('lib/town/lighthouseGalleryWorld.ts');
const {createRooftopTravel,ROOF_RECOVERY_TIME}=load('lib/town/rooftopTravel.ts');
const {JETTY_BEACON,KEEPER_HUT,EAST_PIER,onEastPier}=load('lib/town/eastPier.ts');
const at=(a,r)=>({x:L.cx+Math.cos(a)*r,z:L.cz+Math.sin(a)*r});
const polar=p=>({r:Math.hypot(p.x-L.cx,p.z-L.cz),a:Math.atan2(p.z-L.cz,p.x-L.cx)});
const inOpening=a=>{let d=a-L.openAt;d-=Math.PI*2*Math.round(d/(Math.PI*2));return Math.abs(d)<=L.openHalf;};
let checks=0;const ok=(c,m)=>{assert(c,m);checks++;};

// ---- The stair is gone: no stair module, sign, assist or band anywhere; the plaza has no lighthouse floor or stair wall.
{for(const f of ['lib/town/lighthouseStairs.ts','lib/town/lighthouseStairsWorld.ts','tests/lighthouse-stairs-physics.cjs','tests/lighthouse-stairs-world.cjs'])ok(!fs.existsSync(f),f+' removed');
 const all=['lib/town/eastPierWorld.ts','lib/town/rooftopTravel.ts','components/Town.tsx','lib/town/eastJettyBalls.ts'].map(src).join('\n');
 ok(!/lighthouseStairs|LIGHTHOUSE_STAIRS|createLighthouseAssist|lighthouseAssist|CLIMB UP|SCAN THE PITCH|stairHeight|STAIR_SPAN/.test(all),'no stair code, assist or sign left in the wiring');
 ok(!/package\.json/.test('')&&!/lighthouse-stairs-/.test(src('package.json'))&&/node tests\/lighthouse-gallery\.cjs/.test(src('package.json')),'package.json test chain runs this test, not the stair tests');
 for(let i=0;i<72;i++)for(const r of [3.2,3.6,4.1,4.6,5.2])for(const from of [0,.3,1,2]){const q=at(i/72*Math.PI*2,r);ok(lighthouseFloor(q.x,q.z,from)===-Infinity,'no lighthouse floor at the plaza');}
 for(const [r,from] of [[1.9,0],[2.8,1],[3,5]]){const q=at(1,r);ok(lighthouseFloor(q.x,q.z,from)===-Infinity,'the gallery is not a floor from below');}
 {const q=at(0,2.2);ok(lighthouseFloor(q.x,q.z,L.top)===L.top&&lighthouseFloor(q.x,q.z,Infinity)===L.top,'the gallery is a floor from its own height and from the sky');}
 ok(lighthouseFloor(L.cx,L.cz,Infinity)===L.capTop,'from the sky over the lantern: the cap top');
 ok(lighthouseFloor(L.cx+L.galleryR+.1,L.cz,Infinity)===-Infinity,'nothing outside the gallery');
 for(let i=0;i<72;i++)for(const r of [3.3,4,4.9])for(const h of [0,.5,1.5]){const q=at(i/72*Math.PI*2,r),p={...q},v={x:-1,z:0};ok(!lighthouseConstrain(q.x,q.z,p,v,h,.32)&&p.x===q.x&&p.z===q.z,'no stair walls at the plaza');}}

// ---- The world's colliders round the lighthouse, as eastPierWorld.ts builds them (benches back at 5 m, round plinth footprint).
const tower={x:JETTY_BEACON.x,z:JETTY_BEACON.z,w:TOWER_FOOT_R*2,d:TOWER_FOOT_R*2,cornerRadius:TOWER_FOOT_R};
ok(isLighthouseTower(tower),'the round tower footprint is recognised');
const hut={x:KEEPER_HUT.x,z:KEEPER_HUT.z,w:KEEPER_HUT.w+.2,d:KEEPER_HUT.d+.2};
const benches=[-1,1].map(s=>({x:L.cx-.8,z:L.cz+s*5,w:2,d:.7}));
const ladderFoot={x:L.cx+Math.cos(L.openAt)*L.ladderR,z:L.cz+Math.sin(L.openAt)*L.ladderR,w:.6,d:.6};
const obstacles=[tower,hut,...benches,ladderFoot];
{const w=src('lib/town/eastPierWorld.ts');
 ok(/bench\(P\.cx-\.8,P\.cz-5,-1\);bench\(P\.cx-\.8,P\.cz\+5,1\)/.test(w),'benches back at 5 m (as before the stair)');
 ok(/obstacles\.push\(\{x,z,w:TOWER_FOOT_R\*2,d:TOWER_FOOT_R\*2,cornerRadius:TOWER_FOOT_R\}\)/.test(w),'round plinth footprint');
 ok(/obstacles\.push\(\{x:x\+Math\.cos\(LIGHTHOUSE\.openAt\)\*LIGHTHOUSE\.ladderR,z:z\+Math\.sin\(LIGHTHOUSE\.openAt\)\*LIGHTHOUSE\.ladderR,w:\.6,d:\.6\}\)/.test(w),'the ladder foot is a small collider (as in this test)');
 ok(/box\(\.12,1\.9,1\.1,'#2f4f4a',x-radiusAt\(\.95\)\+\.02,1\.95,z\)/.test(w)&&/for\(const y of \[6\.2,10\.6\]\)/.test(w),'door and windows back on the west face');
 ok(/sign\('EAST JETTY LIGHTHOUSE',3,\.42,x-r-\.85,1\.2,z,/.test(w),'name board back at the foot, facing the walkway');
 ok(/buildLighthouseGallery\(put\)/.test(w)&&!/CylinderGeometry\(2\.05,2\.05/.test(w)&&!/TorusGeometry\(1\.95/.test(w),'the widened gallery replaces the old narrow one');
 ok(TOWER_FOOT_R>=L.plinthR&&TOWER_FOOT_R<=JETTY_BEACON.r+.85,'the footprint is the plinth');}

// ---- Walking and riding round the foot of the tower: a plain tower, no wedging, nothing lifts you.
for(const mode of ['walk','scooter','bike','moped'])for(const dir of [1,-1]){const t=createRooftopTravel([],obstacles,{x:0,z:0}),R0=mode==='walk'?4.2:6.4;// rides go outside the benches (as before the stair)
 const s0=Math.PI*.75,p={x:L.cx+Math.cos(s0)*R0,z:L.cz+Math.sin(s0)*R0},v={x:0,z:0};t.reset(p.x,p.z,0);let travelled=0,last=s0;
 for(let i=0;i<60*(mode==='walk'?60:20)&&travelled<Math.PI*2;i++){const a=Math.atan2(p.z-L.cz,p.x-L.cx),g=a+dir*.35,b0=Math.atan2(Math.sin(g),Math.cos(g)),R=Math.abs(b0)<.75?6.4:R0;
  t.update(1/60,p,v,{x:L.cx+Math.cos(g)*R-p.x,z:L.cz+Math.sin(g)*R-p.z,sprint:false},mode);
  const b=Math.atan2(p.z-L.cz,p.x-L.cx);let d=b-last;d=Math.atan2(Math.sin(d),Math.cos(d));travelled+=d*dir;last=b;
  ok(t.state.height<.6&&!t.state.falling&&!t.ladder.active&&polar(p).r>=TOWER_FOOT_R,`${mode} stays on the plaza, outside the plinth (walking past the ladder never climbs it)`);}
 // A ride (0.8 m radius) cannot squeeze between the keeper's hut and the plaza's edge (as before the stair): round the rest.
 ok(travelled>=(mode==='walk'?Math.PI*2:4.4),`${mode} goes ${mode==='walk'?'all the way':'the plaza side'} round the lighthouse (${dir>0?'clockwise':'anticlockwise'}, ${(travelled/Math.PI*180).toFixed(0)}°)`);}

// ---- Getting up: only by flying. Jetpack landings land on the gallery ring, never in the tower or on the lantern.
{const t=createRooftopTravel([],obstacles,{x:0,z:0});
 ok(t.canLand(L.cx+2.2,L.cz,Infinity)&&t.surface(L.cx+2.2,L.cz,Infinity)===L.top,'lands on the gallery ring at 13.6 m');
 ok(!t.canLand(L.cx,L.cz,Infinity)&&!t.canLand(L.cx+1,L.cz,Infinity),'never on the lantern');
 ok(lighthouseLanding(L.cx+2.2,L.cz,5)===false,'never from below the gallery');
 for(const [x,z] of [[L.cx,L.cz],[L.cx+.5,L.cz-.3],[L.cx+1.2,L.cz+1],[L.cx-3,L.cz-1]]){const s=t.findLanding(x,z);ok(s,'a landing is found near '+x+','+z);const {r}=polar(s),h=t.surface(s.x,s.z,Infinity);
  ok(r>=L.lanternR+.5-1e-6&&r<=L.galleryR-.5+1e-6&&h===L.top||r>L.galleryR&&h===0,`lands on the gallery or the plaza, never in the tower (r ${r.toFixed(2)}, h ${h})`);}
 ok(t.canLand(L.cx-6,L.cz,Infinity)&&t.surface(L.cx-6,L.cz,Infinity)===0,'the plaza is still a landing');
 const src0=src('components/Town.tsx');ok(/findLanding:rooftop\.findLanding/.test(src0),'the jetpack lands through rooftop.findLanding (the gallery ring rule)');}

// ---- Up there: walking and riding round the gallery stay on it: the railing (gate included) and the lantern hold; the ladder
//      takes you down (pushing out at the gate is tested in tests/lighthouse-ladder-climb.cjs).
for(const mode of ['walk','scooter','bike','moped']){const t=createRooftopTravel([],obstacles,{x:0,z:0}),p={x:L.cx-2.2,z:L.cz},v={x:0,z:0};
 t.reset(p.x,p.z,t.surface(p.x,p.z,Infinity));ok(t.state.height===L.top,mode+': a gallery landing stands at 13.6 m');
 let rMin=Infinity,rMax=0,maxSpeed=0;
 for(const dir of [[1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,0],[-.2,1],[-.2,-1],[-1,-1],[-1,1]])for(let i=0;i<60*3;i++){
  t.update(1/60,p,v,{x:dir[0],z:dir[1],sprint:true},mode);if(mode==='walk'&&t.ladder.active)break;// walked into the gate pushing out: the ladder took over (fine; tested in the ladder test)
  const {r}=polar(p);rMin=Math.min(rMin,r);rMax=Math.max(rMax,r);maxSpeed=Math.max(maxSpeed,Math.hypot(v.x,v.z));
  ok(t.state.height===L.top&&!t.state.falling,`${mode}: stays on the gallery pushing ${dir} (r ${r.toFixed(2)})`);}
 if(mode==='walk')t.ladder.cancel();
 ok(rMin>=L.lanternR+.3-1e-6&&rMax<=L.galleryR-.3+1e-6,`${mode}: between the lantern and the railing (${rMin.toFixed(2)}–${rMax.toFixed(2)})`);
 if(mode!=='walk')ok(maxSpeed<=L.maxRideSpeed*1.12,`${mode}: capped on the gallery (${maxSpeed.toFixed(1)} m/s)`);
 if(mode!=='walk')ok(!t.ladder.active,`${mode}: a ride never gets on the ladder`);}
// The railing holds at every bearing, the gate too (you leave through it on the ladder); the gate is wide enough to step through.
{const v={x:0,z:0};let held=0;
 for(let i=0;i<144;i++){const a=i/144*Math.PI*2,from=at(a,L.galleryR-.33),p=at(a,L.galleryR-.32+.1),moved=lighthouseConstrain(from.x,from.z,p,v,L.top,.32),{r}=polar(p);
  ok(moved&&r<=L.galleryR-.32+1e-6,`railing holds at ${(a*180/Math.PI).toFixed(0)}°`);held++;}
 ok(held===144,'closed all round to walking');
 ok(2*L.openHalf*L.galleryR>=.8,'the gate is wide enough to step through');
 const p=at(.5,1),from=at(.5,1.7);lighthouseConstrain(from.x,from.z,p,v,L.top,.32);ok(polar(p).r>=L.lanternR+.32-1e-6,'the lantern wall holds');}
// The lantern sits above the railing: the lamp (the beam's apex) is ≥ 0.9 m over the railing's top, its glass entirely above it.
{ok(L.lampY-.75>=L.top+L.railH+.2&&L.lampY>=L.top+L.railH+.9,`lamp ${L.lampY} m, glass from ${(L.lampY-.75).toFixed(2)} m, railing top ${L.top+L.railH} m`);
 const w=src('lib/town/eastPierWorld.ts'),wo=src('lib/town/world.ts');
 ok(/'#ffe8ae',x,lamp,z\)/.test(w)&&/const lamp=LIGHTHOUSE\.lampY/.test(w),'the lantern glass is drawn at LIGHTHOUSE.lampY');
 ok(/createLighthouseBeam\(scene,\{x:JETTY_BEACON\.x,z:JETTY_BEACON\.z\},LIGHTHOUSE\.lampY\)/.test(wo),'the beam starts at the lamp');
 ok(JETTY_BEACON.height>=L.capTop-.1&&JETTY_BEACON.height<=18,'the tower height matches the raised lantern (≤ 18 m)');
 ok(towerSolidRadius(L.top+.5)>=1.1&&towerSolidRadius(L.lampY)>=1.1&&towerSolidRadius(L.capTop-.05)>0,'the watch room, lantern and cap are solid');}

// ---- Geometry: the white railing, deck and corbel in the tower's off-white; small; no stair pieces; railing open at the west.
const rail=W.buildLighthouseRailingGeometry(),railV=rail.getAttribute('position').count;
let total=0;{const puts=[];const put=(geo,c,x,y,z)=>{const m=new T.Mesh(geo);m.position.set(x,y,z);puts.push({c,m});total+=geo.getAttribute('position').count;return m;};W.buildLighthouseGallery(put);
 ok(puts.length===4,`4 pieces: railing, ladder, deck, corbel (${puts.length})`);
 ok(puts.every(p=>p.c==='#f3ecdc'),'all in the tower\'s off-white #f3ecdc (white railing, existing palette colour)');
 ok(/'#f3ecdc'/.test(src('lib/town/eastPierWorld.ts')),'#f3ecdc is the tower\'s own white (no new colour)');
 ok(puts.every(p=>Math.abs(p.m.position.x-L.cx)<1e-9&&Math.abs(p.m.position.z-L.cz)<1e-9),'all at the tower axis: one chunk');
 ok(total<6000,`gallery + ladder under 6k vertices (${total}; the stair + gallery was 17,718)`);
 ok(!/IRON|#384443/.test(src('lib/town/lighthouseGalleryWorld.ts')),'no dark iron on the railing or the ladder');}
{const p=rail.getAttribute('position').array;let inOpen=0;for(let i=0;i<p.length;i+=3){const x=p[i],y=p[i+1],z=p[i+2];ok(Number.isFinite(x+y+z),'finite');
  ok(y>=L.top-1e-6&&y<=L.top+L.railH+1e-6,'railing between the deck and rail height');
  let d=Math.atan2(z,x)-L.openAt;d-=Math.PI*2*Math.round(d/(Math.PI*2));if(Math.abs(d)<L.openHalf-.03)inOpen++;}
 ok(inOpen===0,'nothing across the gate');}

// ---- Ball and jet dash: the tower by height, the gallery holds a ball, the railing stops it (not at the opening).
{ok(lighthouseSolid(L.cx+1.8,L.cz,5)&&!lighthouseSolid(L.cx+2.2,L.cz,5)&&!lighthouseSolid(L.cx+2,L.cz,L.top+.3),'tower solid at 5 m; the gallery is open above its floor');
 ok(lighthouseSolid(L.cx+1,L.cz,L.top+.5),'the lantern room is solid');
 const g=at(1.5,L.galleryR-.02);ok(lighthouseSolid(g.x,g.z,L.top+.5),'the gallery railing stops a ball');
 const o=at(L.openAt,L.galleryR-.02);ok(!lighthouseSolid(o.x,o.z,L.top+.5),'the gate lets a ball out (onto the ladder slab)');
 ok(lighthouseSolid(L.cx-3.4,L.cz,.5)===false&&lighthouseSolid(L.cx+2.9,L.cz,.5),'at the plaza: only the plinth (and the ladder) is solid (no stair)');
 ok(towerSolidRadius(.5)===L.plinthR&&towerSolidRadius(L.top-.1)===L.galleryR,'plinth and gallery deck radii');
 ok(lighthouseFloor(L.cx+2.2,L.cz,L.top+.2-.15,.25)===L.top,'a ball on the gallery keeps it as its floor');
 // The jetty-lighthouse hunt ball is back at its pre-stair spot (5.3 m out), on the plaza, clear of the plinth and benches.
 const b=load('lib/town/eastJettyBalls.ts').EAST_JETTY_BALL_SPOTS.find(s=>s.id==='jetty-lighthouse'),{r}=polar(b);
 ok(Math.abs(r-Math.min(EAST_PIER.plazaR-2,JETTY_BEACON.r+3))<.02,`the hunt ball is back at its pre-stair spot (r ${r.toFixed(2)})`);
 ok(onEastPier(b.x,b.z)&&r>TOWER_FOOT_R+.6&&!lighthouseSolid(b.x,b.z,.2)&&lighthouseFloor(b.x,b.z,0)===-Infinity,'on the plaza, clear of the plinth');
 ok(benches.every(o=>Math.abs(b.x-o.x)>o.w/2+.4||Math.abs(b.z-o.z)>o.d/2+.4)&&!(Math.abs(b.x-hut.x)<hut.w/2+.4&&Math.abs(b.z-hut.z)<hut.d/2+.4),'clear of the benches and the hut');
 // A walker reaches it from the plaza (walk straight at it from the west walkway end).
 const t=createRooftopTravel([],obstacles,{x:0,z:0}),s=at(Math.PI,EAST_PIER.plazaR-.6),p={...s},v={x:0,z:0};t.reset(p.x,p.z,0);let best=Infinity;
 for(let i=0;i<60*10;i++){t.update(1/60,p,v,{x:b.x-p.x,z:b.z-p.z,sprint:false},'walk');best=Math.min(best,Math.hypot(b.x-p.x,b.z-p.z));if(best<.5)break;}
 ok(best<.5,`a walker reaches the hunt ball (${best.toFixed(2)} m)`);}

// ---- Runtime wiring: rooftopTravel (gallery floor, landing, railing, ride radius/cap on the gallery) and Town (ball, jet dash,
//      ride pose, hidden marker); no per-frame allocation in the constraint.
{const r=src('lib/town/rooftopTravel.ts'),t=src('components/Town.tsx');
 ok(/lighthouseFloor\(x,z,from\)/.test(r)&&/lighthouseConstrain\(fromX,fromZ,p,v,state\.height,collisionRadius\)/.test(r)&&/lighthouseLanding\(x,z,from\)/.test(r),'rooftopTravel wiring');
 ok(/state\.height>LIGHTHOUSE\.top-1&&nearLighthouse\(p\.x,p\.z\)\)collisionRadius/.test(r),'the narrow ride radius only up on the gallery');
 ok(/floor:ballFloor/.test(t)&&/lighthouseFloor\(x,z,walkBall\.state\.y/.test(t),'the ball sees the gallery under it');
 ok(/summitSolid\(x,z,y\)\|\|lighthouseSolid\(x,z,y\)/.test(t)&&/!isLighthouseTower\(o\)/.test(t),'the ball hits the tower and railing by height');
 ok(/lighthouseSolid\(x,z,flight\.height\)/.test(t),'jet dashes stop at the tower');
 ok(/lighthouseHides\(visualLocation\.x,groundY/.test(t),'the hidden-player marker shows behind the tower');
 ok(!/new T\.|\[\]|=>\{/.test(LG.lighthouseConstrain.toString().replace(/\/\/.*$/gm,'')),'lighthouseConstrain allocates nothing');
 ok(ROOF_RECOVERY_TIME<6,'a fall (a ride switched on mid-ladder) recovers like any roof drop');}
console.log(`PASS lighthouse gallery: ${checks} checks (no stair, plain tower at the plaza, fly-up landing, gallery walk, white railing + ladder ${total} vertices vs 17,718 with the stair, ball)`);
