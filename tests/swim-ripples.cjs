// Swim ripples (Oct 19 2026, lib/graphics/swimRipples.ts + ballEffects.swimRipple): the static foot ring is hidden in the sea and
// thin rings spread from the hands per arm entry. Run: node tests/swim-ripples.cjs
const assert=require('node:assert/strict'),fs=require('node:fs');
const {createLoader}=require('./summit-harness.cjs');
const load=createLoader();
const R=load('lib/graphics/swimRipples.ts'),T=require('three');
let failed=0;const ok=(name,fn)=>{try{fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};
const mk=()=>{const calls=[];const r=R.createSwimRipples({spawn:(...a)=>calls.push(a)});const s={on:true,kind:'crawl',phase:Math.PI*3,effort:1,fast:0,under:0,x:5,z:7,yaw:0,mode:0};return {calls,r,s};};
/** Advance the stroke clock at `rate` rad/s for `sec` seconds at 60 Hz. */
const run=(t,rate,sec)=>{for(let i=0;i<sec*60;i++){t.s.phase=(t.s.phase+rate/60)%(Math.PI*2*6);t.r.update(1/60,t.s);}};

ok('one ripple per arm entry (every π of the stroke clock), at the entering hand, alternating sides',()=>{
 const t=mk();t.r.update(1/60,t.s);assert.equal(t.calls.length,0,'the first frame only latches the stroke index');
 run(t,5.5,2);const strokes=Math.floor(5.5*2/Math.PI);assert(Math.abs(t.calls.length-strokes)<=1,t.calls.length+' vs '+strokes);
 const xs=new Set(t.calls.map(c=>Math.sign(c[0]-5)));assert(xs.has(1)&&xs.has(-1),'both hands');
 assert(t.calls.every(c=>Math.abs(c[1]-7-.5)<1e-9),'a half metre ahead of the swimmer (yaw 0 faces +z)');
 const full=mk();run(full,9,3);assert(full.calls.filter(c=>c[5]===1).length/3>=2,'2-3 a second at full effort');});
ok('ripple spec: reach ≤ 1.6 m, opacity ≤ .35, finite life; standing still stops the stroke ripples',()=>{
 const t=mk();run(t,5.5,3);for(const c of t.calls){assert(c[2]<=1.6+1e-9&&c[2]>=1,'reach '+c[2]);assert(c[4]<=.35+1e-9);assert(c[3]>.5&&c[3]<2);}
 const n=t.calls.length;run(t,0,2);assert.equal(t.calls.length,n,'a frozen clock spawns nothing');});
ok('treading every .8 s, floating slower, diving / not swimming / other poses nothing',()=>{
 const t=mk();t.s.kind='tread';run(t,0,4);assert(t.calls.length>=4&&t.calls.length<=6,'tread '+t.calls.length);
 const f=mk();f.s.kind='float';run(f,0,4);assert(f.calls.length>=2&&f.calls.length<=3&&f.calls[0][4]<t.calls[0][4],'float faint');
 for(const edit of [s=>{s.under=.5;},s=>{s.on=false;},s=>{s.kind='entry';},s=>{s.kind='hold';}]){const q=mk();edit(q.s);q.s.kind==='crawl'&&(q.s.kind='tread');run(q,5,3);assert.equal(q.calls.length,0);}});
ok('Swim fast spawns no stretched ring pair any more (Nov 17 2026: the V is the ocean shader wake, swimFx.ts)',()=>{
 const t=mk();t.s.fast=1;run(t,9,3);assert(t.calls.length>=6);assert(t.calls.every(c=>c[5]===1&&c[6]===0),'round rings only');});
ok('heat: lite = one slow ripple every 2 s (never overlapping), reduced motion = a static faint ring, no strokes',()=>{
 const t=mk();t.s.mode=1;run(t,9,6);assert(t.calls.length>=2&&t.calls.length<=3);assert(t.calls.every(c=>c[3]<=R.SWIM_RIPPLE.lite&&c[7]===0));
 const q=mk();q.s.mode=2;run(q,0,5);assert(q.calls.length>=1&&q.calls.every(c=>c[7]===1&&c[4]<=.2));});
// ---- Nov 17 2026 (docs/graphics/island-graphics-plan-nov17.md, batch A): the rings and the wake are ocean-shader uniforms.
const FX=load('lib/graphics/swimFx.ts');
const fakeU=()=>{const v=()=>({v:[0,0,0,0],set(x,y,z,w){this.v=[x,y,z,w];}});return {uSwimRing:{value:Array.from({length:FX.SWIM_FX.rings},v)},uSwimWake:{value:v()},uSwimFx:{value:v()}};};
const inBounds=u=>{const [cx,cz,r2]=u.uSwimFx.value.v;for(const r of u.uSwimRing.value){const [x,z,rad,a]=r.v;if(a>0)assert(Math.hypot(x-cx,z-cz)+rad+FX.SWIM_FX.width<=Math.sqrt(r2)+1e-6,'ring outside the bounds circle');}};
ok('swimFx rings: 5 pooled + the collar slot, grow in world space, fade to nothing, and the gate uniform closes',()=>{
 const u=fakeU(),fx=FX.createSwimFx(u);assert.equal(FX.SWIM_FX.rings,6);
 assert.equal(fx.update(.016),0);assert.deepEqual(u.uSwimFx.value.v,[0,0,0,0],'nothing live: the shader branch is off');
 for(let i=0;i<20;i++)fx.ring(i,0,1.6,1,1);assert.equal(fx.update(.016),5,'never more than the pool');assert.equal(u.uSwimRing.value[5].v[3],0,'the last slot is the collar');
 assert(u.uSwimFx.value.v[2]>0);inBounds(u);
 const a=FX.createSwimFx(fakeU()),ua=fakeU(),b=FX.createSwimFx(ua);void a;b.ring(3,4,1.6,1,1);b.update(.1);const r0=ua.uSwimRing.value[0].v.slice();
 b.wake(.3,true,50,50,1,0);b.update(.3);const r1=ua.uSwimRing.value[0].v;assert.equal(r1[0],3);assert.equal(r1[1],4,'world space: the swimmer moving does not drag it');
 assert(r1[2]>r0[2]&&r1[2]<=1.6+1e-6,'it spreads');inBounds(ua);
 b.wake(1,false,50,50,0,0);for(let i=0;i<120;i++)b.update(1/60);assert.equal(b.live,0);assert.deepEqual(ua.uSwimRing.value[0].v,[0,0,0,0]);assert.equal(ua.uSwimFx.value.v[2],0,'all gone: gate closed again');
 const o={r:0,a:0};FX.swimRingAt(.5,1,1,1,o);assert.equal(o.r,1,'a still ring holds its size (reduced motion)');FX.swimRingAt(1,1.6,1,0,o);assert(Math.abs(o.r-1.6)<1e-9&&o.a===0);
 fx.ring(0,0,1,0,1);fx.ring(0,0,1,1,0);/* no life / no strength: ignored */});
ok('swimFx wake: grows as the swimmer moves, trails behind on a towed tail, bends on a turn, fades when they stop',()=>{
 const u=fakeU(),fx=FX.createSwimFx(u);let x=0,z=0;
 fx.wake(1/60,true,x,z,1,0);fx.update(1/60);assert.equal(u.uSwimFx.value.v[3],0,'no wake before the first stroke of distance');
 for(let i=0;i<180;i++){z+=1.4/60;fx.wake(1/60,true,x,z,1,0);fx.update(1/60);}
 const w=u.uSwimWake.value.v,len=1/Math.hypot(w[2],w[3]);assert(fx.wakeK>.6&&u.uSwimFx.value.v[3]>.6,'strength '+fx.wakeK);
 assert(Math.abs(len-FX.SWIM_FX.wakeLen[0])<1e-3,'tail towed at the wake length, '+len);assert(w[3]<0&&Math.abs(w[2])<1e-6,'behind the swimmer (heading +z)');
 assert(Math.abs(w[0]-x)<1e-6&&Math.abs(w[1]-z)<1e-6);inBounds(u);{const [cx,cz,r2]=u.uSwimFx.value.v;assert(Math.hypot(x-cx,z-cz)<Math.sqrt(r2)&&Math.hypot(x-cx,z-len-cz)<Math.sqrt(r2),'head and tail inside the bounds');}
 for(let i=0;i<20;i++){x+=1.4/60;fx.wake(1/60,true,x,z,1,0);fx.update(1/60);}/* a right-angle turn */
 const t=u.uSwimWake.value.v;assert(t[3]<0&&t[2]<0&&Math.abs(t[3])>Math.abs(t[2]),'the tail lags the turn: still mostly behind the old heading');
 for(let i=0;i<180;i++){x+=1.4/60;fx.wake(1/60,true,x,z,1,1);fx.update(1/60);}assert(Math.abs(1/Math.hypot(u.uSwimWake.value.v[2],u.uSwimWake.value.v[3])-FX.SWIM_FX.wakeLen[1])<1e-3,'Swim fast: a longer wake');
 for(let i=0;i<60;i++){fx.wake(1/60,true,x,z,0,0);fx.update(1/60);}assert.equal(u.uSwimFx.value.v[3],0,'stopped: faded inside a second');
 fx.collar(1,true,1,2,1);fx.update(.016);assert(fx.collarOn&&u.uSwimRing.value[5].v[3]>0&&u.uSwimRing.value[5].v[0]===1);assert(u.uSwimFx.value.v[2]>0);
 fx.collar(1,false,0,0,0);fx.update(.016);assert(!fx.collarOn);assert.equal(u.uSwimFx.value.v[2],0);});
ok('no ring meshes left, nothing allocates per frame, the shader block is ALU only behind one uniform gate',()=>{
 const be=load('lib/graphics/ballEffects.ts').createBallEffects();assert.equal(be.root.children.filter(o=>o.name==='swim-ripple').length,0);assert.equal(be.swimRipple,undefined);be.dispose();
 const src=fs.readFileSync('lib/graphics/swimRipples.ts','utf8');const body=src.split('export function createSwimRipples')[1];
 assert(!/new T\.|new Array|\.map\(|\.filter\(|\[\.\.\.|\{\.\.\./.test(body.replace(/const reset=.*/,'')),'the scheduler allocates nothing per frame');
 const fxSrc=fs.readFileSync('lib/graphics/swimFx.ts','utf8'),api=fxSrc.slice(fxSrc.indexOf(' return {\n  /** A ring at'));assert(api.length>500&&!/new |\.map\(|\.filter\(|\[\.\.\.|\{\.\.\./.test(api),'swimFx allocates nothing after create');
 const W=load('lib/graphics/waterSurface.ts');assert(!/texture2D|texture\(/.test(W.SWIM_FX_GLSL),'no texture read');assert.equal(W.SWIM_FX_UNIFORMS.uSwimRing.value.length,6);
 const ws=fs.readFileSync('lib/graphics/waterSurface.ts','utf8');assert.equal((ws.match(/vec2 swimFx\(/g)||[]).length,1);assert.equal((ws.match(/=swimFx\(/g)||[]).length,1,'defined once, called once');
 assert.match(ws,/if\(uSwimFx\.z>0\.\)\{vec2 fd=vWaterXZ-uSwimFx\.xy;if\(dot\(fd,fd\)<uSwimFx\.z\)\{/,'uniform gate, then the bounds circle, then the block');
 const bean=fs.readFileSync('lib/graphics/beanSkin.ts','utf8');assert.match(bean,/const BEAN_WOBBLE_VERTEX=\/\* glsl \*\/`\nif\(beanUnder>0\.\)\{/,'leg wobble only inside the swimming player\'s uniform branch');
 assert.match(bean,/fl\*beanUnder\*/,'the water line scales with beanUnder (0 on land and for every other bean)');});
ok('ride-splash pool: the pond rings and the swim spray are two more sources of the same pool (no new draw), gated by mode',()=>{
 const RS=load('lib/graphics/rideSplash.ts'),rs=RS.createRideSplash(()=>null);
 rs.begin(.016,3);rs.ring(1,0,2,1.2,1,.4);assert.equal(rs.alive,1);rs.end();assert(rs.mesh.visible&&rs.mesh.count===1);
 assert.equal(rs.spray(0,0,0,0,0,1,6,1,2,.2,.1),0,'off');assert.equal(rs.spray(1,0,0,0,0,1,6,1,2,.2,.1),0,'reduced motion: no droplets');
 assert.equal(rs.spray(2,0,0,0,0,1,6,1,2,.2,.1),3,'lite: half');assert.equal(rs.spray(3,0,0,0,0,1,6,1,2,.2,.1),6);
 for(let i=0;i<40;i++)rs.spray(3,0,0,0,0,1,6,1,2,.2,.1);rs.begin(.016,3);rs.end();assert(rs.alive<=RS.RIDE_SPLASH.cap&&rs.mesh.count<=RS.RIDE_SPLASH.cap,'the cap holds');
 for(let i=0;i<200;i++){rs.begin(.016,3);rs.end();}assert.equal(rs.alive,0);assert.equal(rs.mesh.visible,false,'empty pool: no draw');rs.dispose();});
ok('Town wiring: foot ring hidden while swimming, scheduler fed from the pose + tier gate, old arm splash / wake pair gone',()=>{
 const town=fs.readFileSync('components/Town.tsx','utf8');
 assert.match(town,/ring\.visible=!fieldMenu\.current&&!vendingHide&&rideRef\.current!=='jetpack'&&(?:!party\?\.meRing&&)?!\(water\.inWater&&water\.state\.phase==='swim'\)/);
 assert.match(town,/swimRipples\.update\(dt,si\)/);assert.match(town,/si\.mode=reduced\?2:waterFxOn\(\)\?0:1/);assert.match(town,/si\.phase=p\.phase/);
 assert(!/if\(ev\.stroke\)ballEffects\.ripple/.test(town));
 const doc=fs.readFileSync('docs/performance-guide.md','utf8');assert(/Swim ripples/.test(doc));});
if(failed){console.log(failed+' failed');process.exit(1);}console.log('swim ripples ok');
