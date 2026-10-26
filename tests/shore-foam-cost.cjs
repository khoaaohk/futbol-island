// Shore foam pass (Oct 26 2026, docs/SHORE_FOAM_OCT26.md): the island swash got wave sets, a high-water mark, lacy break-up and
// player / ball interaction WITHOUT more cost. This pins the cost caps: no new mesh or draw call, the same texture reads per strip
// fragment (none of the lace far away), a tiny fixed ring buffer, heat / reduced-motion gating, and no allocation per frame.
// Run: node --expose-gc tests/shore-foam-cost.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const T=require('three');
const {createLoader}=require('./summit-harness.cjs');
const load=createLoader();
const F=load('lib/graphics/shoreFoamFx.ts'),W=load('lib/graphics/waterSurface.ts');
const C=F.SHORE_FOAM;
const src=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
let failed=0;const ok=(name,fn)=>{try{fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};
// A straight beach: land for z < 0, the drawn waterline at z = 0 (+ sea), flat sand; a deck (raised) for x > 100.
const field={distance:(x,z)=>z,lift:(x,z)=>x>100?1.2:.05};
const SAND=.05-.42;
const fresh=()=>({uFoamFxOn:{value:0},uFoamPlayer:{value:new T.Vector4()},uFoamRings:{value:Array.from({length:C.rings},()=>new T.Vector4())}});
const make=(f=field)=>{const u=fresh();return {u,fx:F.createShoreFoamFx(()=>f,u)};};
// One frame: player at (px, pz) walking `speed` along +x, ball at (bx, by, bz).
const step=(fx,{mode=3,px=0,py=SAND,pz=-.5,speed=2,bx=50,by=SAND+.11,bz=-10,bs=0,free=true,cam=40,dt=1/60}={})=>fx.update(dt,mode,px,py,pz,speed,Math.PI/2,bx,by,bz,bs,free,cam);

ok('cost caps: a 4-slot ring buffer, uniforms only (no mesh, no texture, no draw call)',()=>{
 assert(C.rings<=4,'rings '+C.rings);
 const m=src('lib/graphics/shoreFoamFx.ts');
 assert(!/new T\.(Mesh|InstancedMesh|Points|BufferGeometry|DataTexture|WebGLRenderTarget|\w*Material)\b/.test(m),'shoreFoamFx creates no mesh, geometry, texture or material');
 assert.equal(Object.keys(F.SHORE_FOAM_UNIFORMS).length,3);assert.equal(F.SHORE_FOAM_UNIFORMS.uFoamRings.value.length,C.rings);
 assert(/for\(int i=0;i<4;i\+\+\)/.test(F.SHORE_FOAM_GLSL),'fixed 4-iteration loop in the shader');
 const shore=src('lib/graphics/islandShore.ts');
 assert.equal((shore.match(/new T\.Mesh\(/g)||[]).length,1,'still one strip mesh per 128 m tile (no extra foam mesh)');
 assert.equal((shore.match(/new T\.MeshLambertMaterial\(/g)||[]).length,1,'one shared strip material');
 assert.equal((shore.match(/new T\.DataTexture\(/g)||[]).length,2,'two baked textures (field + lace), unchanged');
 const town=src('components/Town.tsx');
 assert.equal((town.match(/shoreFoam\.update\(/g)||[]).length,1,'one update per frame');
 assert(/shoreFoam\.update\(active\?dt:0,shoreFoamMode\(heat\.tier,heat\.saver,reduced\)/.test(town),'heat tier, Battery saver and reduced motion gate it');
 assert(/return\(\)=>\{[^\n]*shoreFoam\.reset\(\)/.test(town),'reset on unmount');});

ok('strip shader: same texture reads (field + ONE lace fetch), none of the lace past STRIP_FAR, interaction on a uniform branch',()=>{
 const shore=src('lib/graphics/islandShore.ts'),glsl=shore.slice(shore.indexOf('const STRIP_GLSL='),shore.indexOf('/** The island shoreline: call'));
 // Tropical water (Oct 26 2026, docs/TROPICAL_WATER_OCT26.md): the field read moved to the vertex shader (vSh), none per fragment.
 assert.equal((glsl.match(/isleSample\(/g)||[]).length,0,'no field read per fragment');assert(/vSh=vec4\(sh\.gba/.test(shore),'field read once per vertex');
 assert.equal((glsl.match(/texture(2D|Grad)?\(uWaterNoise/g)||[]).length,1,'one lace fetch (four noises in its RGBA)');
 assert(/if\(vFar<\.999\)\{?lz=/.test(glsl),'the lace fetch is skipped far from the camera');
 assert(/if\(uFoamFxOn>\.5\)/.test(glsl),'interaction block behind a uniform branch');
 assert(/if\(uSunGlitter>0\.\)\{[^}]*sparkle=/.test(glsl),'glints (phone + desktop since the tropical pass) behind the glitter gate, inside the near lace branch');
 assert(/if\(uWaterDetail<\.5\)\{\s*\/\/[^\n]*\n\s*e=-\.25;rush=\.5;/.test(glsl),'detail 0 (reduced motion / hot) keeps the still path with no fetch');
 const {STRIP_FAR}=load('lib/graphics/islandShore.ts');assert(STRIP_FAR.near>=40&&STRIP_FAR.far>STRIP_FAR.near,'far fade starts past the ~40 m island camera');});

ok('swash clock: warped but never backwards, seamless at the water clock wrap, set on the clock step (no per-fragment divide)',()=>{
 let last=-1;for(let t=0;t<=W.WATER_WRAP;t+=.05){const c=W.swashClock(t);assert(c>last,'monotonic at '+t);last=c;}
 assert(Math.abs(W.swashClock(W.WATER_WRAP)-Math.round(W.swashClock(W.WATER_WRAP)))<1e-6,'whole number of waves at the wrap');
 assert(Math.abs(W.WATER_WRAP/W.SWASH_WARP.period-Math.round(W.WATER_WRAP/W.SWASH_WARP.period))<1e-9,'warp period divides the wrap');
 // Wave gaps vary (irregular period).
 const gaps=[];let prev=0;for(let t=0;t<200;t+=.01){if(Math.floor(W.swashClock(t))>Math.floor(W.swashClock(prev)))gaps.push(t);prev=t;}
 const d=gaps.slice(1).map((g,i)=>g-gaps[i]);assert(Math.min(...d)<5&&Math.max(...d)>6.5,'gaps '+Math.min(...d).toFixed(2)+'..'+Math.max(...d).toFixed(2));
 W.WATER_UNIFORMS.uWaterTime.value=0;W.stepWaterTime(.04,false);assert.equal(W.WATER_UNIFORMS.uSwashClock.value,W.swashClock(.04));
 W.stepWaterTime(.04,true);assert.equal(W.WATER_UNIFORMS.uSwashClock.value,W.swashClock(.04),'held when still');
 for(const f of ['lib/graphics/waterSurface.ts','lib/graphics/islandShore.ts','lib/town/fishing/shoreWater.ts','lib/town/fishing/underwater.ts'])assert(!/(uWaterTime|\bt)\/SWASH_P\b/.test(src(f)),f+' reads uSwashClock');});

ok('interaction: parting in the swash only (not dry sand, decks, mid-air or far camera); rings from steps; one spray per drop',()=>{
 let {u,fx}=make();for(let i=0;i<60;i++)step(fx);assert(u.uFoamPlayer.value.z>.9&&u.uFoamFxOn.value===1,'parting in the swash');assert(fx.live>0,'footstep rings');
 ({u,fx}=make());for(let i=0;i<60;i++)step(fx,{pz:-4});assert.equal(u.uFoamFxOn.value,0,'dry sand: off');
 ({u,fx}=make());for(let i=0;i<60;i++)step(fx,{px:120});assert.equal(u.uFoamFxOn.value,0,'deck: off');
 ({u,fx}=make());for(let i=0;i<60;i++)step(fx,{py:SAND+2});assert.equal(u.uFoamFxOn.value,0,'in the air: off');
 ({u,fx}=make());for(let i=0;i<60;i++)step(fx,{cam:120});assert.equal(u.uFoamFxOn.value,0,'camera far: off');
 ({u,fx}=make(null));for(let i=0;i<60;i++)step(fx);assert.equal(u.uFoamFxOn.value,0,'before the bake: off');
 // Ball dropped into the swash: one big ring + one spray; a second drop inside sprayEvery gets no spray.
 ({u,fx}=make());let sprays=0;
 for(let i=0;i<20;i++)sprays+=step(fx,{px:0,pz:-8,bx:5,bz:0,by:SAND+2})?1:0;
 sprays+=step(fx,{px:0,pz:-8,bx:5,bz:0,by:SAND+.11})?1:0;assert.equal(sprays,1,'one spray on the drop');
 for(let i=0;i<5;i++)step(fx,{px:0,pz:-8,bx:5,bz:0,by:SAND+2});sprays+=step(fx,{px:0,pz:-8,bx:5,bz:0,by:SAND+.11})?1:0;assert.equal(sprays,1,'throttled');
 // Never more live rings than slots, whatever is thrown at it.
 ({u,fx}=make());let peak=0;for(let i=0;i<600;i++){step(fx,{speed:8,bx:2,bz:0,bs:9,by:SAND+(i%7?.11:2)});peak=Math.max(peak,fx.live);}assert(peak<=C.rings,'peak '+peak);
 for(let i=0;i<200;i++)step(fx,{pz:-6});assert.equal(fx.live,0);assert.equal(u.uFoamFxOn.value,0,'fades back to off');});

ok('heat / motion gating: off in Battery saver and tier >= 3, calm (parting only) in reduced motion, no spray at tier 2',()=>{
 assert.equal(F.shoreFoamMode(0,true,false),0);assert.equal(F.shoreFoamMode(3,false,false),0);assert.equal(F.shoreFoamMode(4,false,true),0);
 assert.equal(F.shoreFoamMode(1,false,true),1);assert.equal(F.shoreFoamMode(2,false,false),2);assert.equal(F.shoreFoamMode(0,false,false),3);
 let {u,fx}=make();for(let i=0;i<60;i++)step(fx,{mode:0});assert.equal(u.uFoamFxOn.value,0);
 ({u,fx}=make());for(let i=0;i<60;i++)step(fx,{mode:1});assert(u.uFoamPlayer.value.z>.9,'calm keeps the parting');assert.equal(fx.live,0,'calm: no rings');assert.equal(fx.stats.rings,0);
 ({u,fx}=make());let s=0;for(let i=0;i<10;i++)step(fx,{mode:2,pz:-8,bx:5,bz:0,by:SAND+2});s+=step(fx,{mode:2,pz:-8,bx:5,bz:0,by:SAND+.11})?1:0;assert.equal(s,0,'lite: no spray');assert(fx.stats.rings>0,'lite: rings');});

ok('no per-frame allocation: a minute of wading and kicking keeps the heap flat',()=>{
 if(typeof global.gc!=='function'){console.log('     (run with --expose-gc for the heap check; skipped)');return;}
 const {fx}=make(),frame=i=>step(fx,{px:i*.03%40,speed:3+(i%5),bx:2+(i%40)*.1,bz:(i%9)*.2-.5,bs:4,by:SAND+(i%50<3?2:.11)});
 for(let i=0;i<3000;i++)frame(i);global.gc();const before=process.memoryUsage().heapUsed;
 for(let i=0;i<60000;i++)frame(i);global.gc();const grew=process.memoryUsage().heapUsed-before;
 assert(grew<64*1024,'heap grew '+grew+' B over 60k frames');});

if(failed){console.log(failed+' failed');process.exit(1);}console.log('shore-foam-cost: all ok');
