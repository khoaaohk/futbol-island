// Ball skipping on the Stadium Park pond (Nov 13 2026, owner N2) and the player's pond splashes (N5): the real walking ball
// (walkBall.ts) with the pond rules (pondSkip.ts) and the real pond ellipse (westParkLayout.ts), and the real pond life
// (parkPond.ts) with a logging sink. usage: node tests/pond-skip.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),T=req('three');
(async()=>{
const utils=await import(base+'/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js');
const cache=new Map(),gradient={addColorStop(){}};
const ctx=new Proxy({measureText:t=>({width:t.length*20}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(o,k)=>o[k]??(()=>{})});
const context=vm.createContext({console,Math,Set,Map,performance,Float32Array,Uint8Array,Uint16Array,Uint32Array,Int32Array,window:{addEventListener(){},removeEventListener(){},matchMedia:()=>({matches:false})},localStorage:{getItem:()=>null,setItem(){}},document:{createElement:()=>({width:0,height:0,getContext:()=>ctx})}});
function load(name){let file=path.resolve(base,name);if(!fs.existsSync(file))file+='.ts';if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,id=>id==='react'?{useSyncExternalStore:(_s,get)=>get()}:id==='three'?T:id.includes('BufferGeometryUtils')?utils:id.endsWith('.json')?require(path.resolve(path.dirname(file),id)):id.startsWith('@/')?load(id.slice(2)):id.startsWith('.')?load(path.resolve(path.dirname(file),id)):req(id));cache.set(file,mod.exports);return mod.exports;}
const L=load('lib/town/westParkLayout.ts'),SK=load('lib/town/pondSkip.ts'),{createWalkBall}=load('lib/town/walkBall.ts'),{ballGround}=load('lib/town/ballSea.ts');
const P=L.PARK_POND,pond={level:L.POND_Y,x:P.x,z:P.z,rx:P.rx,rz:P.rz,q:L.pondQ};

// ---- 1. The rules.
assert.equal(SK.skipCount(SK.POND_SKIP.minSpeed-.1,-1),0,'too slow: no skip');
assert.equal(SK.skipCount(20,-20),0,'too steep: no skip');
assert.equal(SK.skipCount(SK.POND_SKIP.minSpeed,-1),2,'a fast low ball skips at least twice');
assert.equal(SK.skipCount(60,-1),5,'never more than five');
for(let k=1;k<5;k++)assert(SK.hopSpeed(30,k)<SK.hopSpeed(30,k-1),'each hop is lower');

/** One kick from (sx, sz) toward the pond's centre, like Town runs it; `after` overrides the launch (speed, lift). */
function kick(sx,sz,{seconds=40,speed,lift,walkAway=0}={}){
 const yaw=Math.atan2(P.x-sx,P.z-sz),ball=createWalkBall(),p={x:sx,z:sz,y:0,yaw},log={splashes:[],modes:new Set(),apex:[],floatSteps:0,inWaterFloat:true,attachedAt:-1,outAt:null,maxY:0};
 let hopTop=0,wasUp=false;
 const env={floor:()=>0,sea:ballGround,impact(){},strike(){},blocked:()=>false,pond,pondSplash:(kind,x,z,s,k)=>log.splashes.push({kind,x,z,s,k})};
 ball.reset(p);ball.shoot(p,yaw,0);let launched=false;
 for(let i=0;i<seconds*60;i++){
  if(walkAway&&ball.state.pondFloat>0){p.x-=Math.sin(yaw)*walkAway/60;p.z-=Math.cos(yaw)*walkAway/60;}
  ball.update(1/60,p,env);const st=ball.state;log.modes.add(st.mode);
  if(!launched&&st.mode==='shot'){launched=true;if(speed!==undefined){st.vx=Math.sin(yaw)*speed;st.vz=Math.cos(yaw)*speed;}if(lift!==undefined)st.vy=lift;}
  if(st.pondSkip>0&&st.pondFloat===0&&st.mode==='shot'){if(st.vy>0)wasUp=true;hopTop=Math.max(hopTop,st.y);if(wasUp&&st.vy<=0&&st.y<=L.POND_Y+.21){log.apex.push(hopTop);hopTop=0;wasUp=false;}}
  if(st.pondFloat>0){log.floatSteps++;if(L.pondQ(st.x,st.z)>=1)log.inWaterFloat=false;}
  if(log.outAt===null&&log.splashes.some(s=>s.kind==='out'))log.outAt={x:st.x,z:st.z};
  if(st.mode==='attached'&&i>60){log.attachedAt=i/60;break;}}
 return {ball,log};
}
// ---- 2. A fast low kick from the east bank: 2–5 skips with shrinking hops, a ring at each touch, then a float to the bank.
{const {log}=kick(P.x+P.rx+6,P.z);const skips=log.splashes.filter(s=>s.kind==='skip');
 assert(skips.length>=2&&skips.length<=5,`fast low ball skips 2–5 times (got ${skips.length})`);
 assert.equal(log.splashes.filter(s=>s.kind==='float').length,1,'then it settles once');
 for(const s of log.splashes.filter(s=>s.kind!=='out'))assert(L.pondQ(s.x,s.z)<1,'every touch ring is on the water');
 for(let i=1;i<log.apex.length;i++)assert(log.apex[i]<log.apex[i-1]+1e-6,'the hops shrink');
 for(let i=1;i<skips.length;i++)assert(skips[i].s<=skips[i-1].s,'and slow down');
 assert(log.floatSteps>30&&log.inWaterFloat,'it floats on the water for a while');
 assert(log.splashes.some(s=>s.kind==='out'),'it drifts to the bank and rolls out');
 assert(log.attachedAt>0,'then comes back to the player like any shot');
 console.log(`  fast: ${skips.length} skips, float ${(log.floatSteps/60).toFixed(1)} s, back at ${log.attachedAt.toFixed(1)} s`);}
// ---- 3. A slow ball just floats (no skip), drifting to the nearest bank; a steep one too.
{const {log}=kick(P.x+P.rx+1.5,P.z,{speed:5,lift:0});
 assert(!log.splashes.some(s=>s.kind==='skip'),'slow: no skip');assert.equal(log.splashes[0]?.kind,'float','slow: it floats');
 assert(log.splashes.some(s=>s.kind==='out')&&log.outAt&&Math.hypot(log.outAt.x-(P.x+P.rx),log.outAt.z-P.z)<8,'slow: it drifts to the nearest (east) bank');}
{const {log}=kick(P.x+P.rx+3,P.z,{speed:14,lift:-25});assert(!log.splashes.some(s=>s.kind==='skip'),'a steep ball does not skip');}
// ---- 4. Deterministic: the same kick skips the same way.
{const a=kick(P.x+P.rx+6,P.z).log.splashes,b=kick(P.x+P.rx+6,P.z).log.splashes;assert.deepEqual(a,b,'the same kick, the same skips');}
// ---- 5. Walking off while it floats recalls it; land shots far from the pond never see it; the sea is unchanged.
{const {log}=kick(P.x+P.rx+1.5,P.z,{speed:4,lift:0,walkAway:6});assert(log.attachedAt>0,'walking away recalls a floating ball');}
{const ball=createWalkBall(),p={x:-7,z:14,y:0,yaw:0},hits=[];const env={floor:()=>0,sea:ballGround,impact(){},strike(){},blocked:()=>false,pond,pondSplash:()=>hits.push(1)};
 ball.reset(p);ball.shoot(p,0,0);for(let i=0;i<240;i++)ball.update(1/60,p,env);assert(!hits.length,'a shot in Old Town never touches the pond');}
const src=fs.readFileSync(path.join(base,'lib/town/walkBall.ts'),'utf8');assert(/ground==='sea'&&floor<=\.25/.test(src),'the sea float is untouched');
const town=fs.readFileSync(path.join(base,'components/Town.tsx'),'utf8');
assert(/pond:ballPond,pondSplash:/.test(town)&&/pondLife\.splash\(/.test(town)&&/pondSkipEvents\.emit\(/.test(town),'Town hands the ball the pond and splashes each touch');

// ---- 6. N5: the player's splashes in the pond (parkPond.ts), with a logging sink.
const LIFE=load('lib/town/parkPond.ts'),scn=new T.Scene(),log=[];
const life=LIFE.createPondLife(scn,{phone:false,sink:{splash:(x,z,s)=>log.push(['splash',x,z,s]),ring:(x,z,r)=>log.push(['ring',x,z,r]),wake:(x,z,r,st,a)=>log.push(['wake',x,z,r,st,a])}});
const inp=o=>({x:P.x,z:P.z,speed:0,onGround:true,ballX:0,ballY:0,ballZ:0,ballOn:false,shown:true,mode:0,y:0,heading:0,riding:false,reduced:false,...o});
const geo0=scn.children.length;
/** A landing from `h` m: airborne frames falling at gravity, then on the ground in the pond. Returns the splash size logged. */
function land(h,o={}){log.length=0;let y=h,vy=0;life.update(1/60,inp({onGround:false,y,...o}));while(y>0){vy-=9.8/60;y=Math.max(0,y+vy/60);life.update(1/60,inp({onGround:y>0?false:true,y,...o}));}
 const s=log.find(e=>e[0]==='splash');return s?s[3]:0;}
for(let i=0;i<5;i++)life.update(1/60,inp({x:P.x+60}));// settle
const small=land(1.2),d1=life.fxStats.drops,big=land(9),d2=life.fxStats.drops-d1;
assert(small>0&&big>small,`landing splashes scale with the landing speed (${small.toFixed(2)} < ${big.toFixed(2)})`);
assert(log.some(e=>e[0]==='ring'),'a landing leaves a ripple ring');assert(d2>0&&life.drops.visible,'and a burst of droplets');
const landings=life.fxStats.landings;land(6,{x:P.x+P.rx+8});assert.equal(life.fxStats.landings,landings,'no splash landing on the bank');
// Walking: footstep splashes at a speed-scaled interval plus a trailing wake.
{log.length=0;const s0=life.fxStats.steps;for(let i=0;i<120;i++)life.update(1/60,inp({speed:1.6}));const slow=life.fxStats.steps-s0;
 const s1=life.fxStats.steps;for(let i=0;i<120;i++)life.update(1/60,inp({speed:3.7}));const fast=life.fxStats.steps-s1;
 assert(slow>=3&&fast>slow,`footsteps quicken with speed (${slow} → ${fast} in 2 s)`);assert(log.some(e=>e[0]==='wake'),'walking leaves a wake');}
// Riding: a continuous spray growing with speed and a V wake (two arms either side of the heading).
{const r0=life.fxStats.sprays,dA=life.fxStats.drops;for(let i=0;i<60;i++)life.update(1/60,inp({speed:5,riding:true}));const slowDrops=life.fxStats.drops-dA;
 log.length=0;const dB=life.fxStats.drops;for(let i=0;i<60;i++)life.update(1/60,inp({speed:14,riding:true,heading:.3}));const fastDrops=life.fxStats.drops-dB;
 assert(life.fxStats.sprays-r0>20,'riding sprays continuously');assert(fastDrops>slowDrops,'more spray at speed');
 const wakes=log.filter(e=>e[0]==='wake');assert(wakes.length>=8,'riding leaves a wake');
 const arms=new Set(wakes.map(w=>Math.sign(Math.sin(w[5]-(.3+Math.PI)))));assert(arms.size===2,'a V: arms on both sides');
 assert(wakes.some(w=>w[4]>2),'the arms stretch with speed');
 const walkStep=Math.max(...[...Array(1)].map(()=>1.1));assert(wakes[0][3]>walkStep*.9,'bigger than the walking wake');}
// Lite (tier 2+): half the drops; reduced: smaller; still: none; off the pond: nothing; no new objects after any amount.
{const k0=life.fxStats.drops;land(9);const full=life.fxStats.drops-k0;const k1=life.fxStats.drops;land(9,{mode:1});const lite=life.fxStats.drops-k1;
 assert(lite<=Math.ceil(full/2)+1&&lite>0,`lite halves the droplets (${full} → ${lite})`);
 const bigS=land(9),redS=land(9,{mode:2,reduced:true});assert(redS>0&&redS<bigS,'reduced motion: a smaller splash');
 land(9,{mode:2});assert(!log.length,'still mode: no splash');
 log.length=0;for(let i=0;i<60;i++)life.update(1/60,inp({x:P.x+P.rx+6,speed:3.7}));assert(!log.some(e=>e[0]==='ring'||e[0]==='wake'),'walking on the bank: no pond splashes');
 assert.equal(scn.children.length,geo0,'pooled: no new meshes');assert.equal(life.drops.count,LIFE.POND_FX.drops,'one fixed droplet pool');}
// The ball's skip touches use the same pool.
{log.length=0;life.splash(P.x,P.z,.8);assert(log.some(e=>e[0]==='splash')&&log.some(e=>e[0]==='ring'),'a skip touch: splash and ring');}
// ---- 7. Other players' splashes (pondRemote.ts): their interpolated poses drive the same pooled effects, near the pond only.
{const RP=load('lib/town/pondRemote.ts'),rp=RP.createRemotePond(life),M={Walk:0,Run:1,Scooter:2,Jetpack:5,Parachute:6,Idle:13};
 const pose=o=>({x:P.x,y:0,z:P.z,yaw:.4,speed:0,mode:M.Walk,fade:1,...o});
 /** `n` frames at 60 fps with me on the bank (the pond awake, no splashes of mine) and the remote players `poses(i)` ([id, pose] pairs). */
 const run=(n,poses,o={})=>{for(let i=0;i<n;i++){life.update(1/60,inp({x:o.me??P.x+40,mode:o.mode??0,reduced:!!o.reduced}));rp.begin(1/60,o.mode??0,!!o.reduced);for(const [id,p] of poses(i))rp.member(id,p);rp.end();}};
 const st=()=>({...rp.stats}),geoR=scn.children.length;
 // walking in the water: footsteps at a speed-scaled interval, a wake every other step
 log.length=0;let a=st();run(120,()=>[[3,pose({speed:1.6})]]);const slowR=rp.stats.steps-a.steps;
 a=st();run(120,()=>[[3,pose({speed:3.7,mode:M.Run})]]);const fastR=rp.stats.steps-a.steps;
 assert(slowR>=3&&fastR>slowR,`remote footsteps quicken with speed (${slowR} → ${fastR} in 2 s)`);assert(log.some(e=>e[0]==='ring')&&log.some(e=>e[0]==='wake'),'remote steps ring and leave a wake');
 const near=log.filter(e=>e[0]==='ring').every(e=>Math.hypot(e[1]-P.x,e[2]-P.z)<1);assert(near,'at the remote player\'s feet');
 // standing still / seated / on the bank / fading in: nothing
 a=st();run(120,()=>[[3,pose({speed:0,mode:M.Idle})],[4,pose({speed:3,seated:true})],[5,pose({x:P.x+P.rx+6,speed:3.7})],[6,pose({speed:3.7,fade:.2})]]);
 assert.equal(rp.stats.steps,a.steps,'still, seated, on the bank or fading in: no steps');
 // riding through: wheel spray + bow wake at the remote cadence
 log.length=0;a=st();const d0=life.fxStats.drops;run(60,()=>[[7,pose({speed:9,mode:M.Scooter})]]);
 assert(rp.stats.sprays-a.sprays>=5&&life.fxStats.drops>d0,'a remote rider sprays');assert(log.filter(e=>e[0]==='wake').length>=10,'and leaves a V wake');
 // arriving from the air: jetpack frames descending over the pond, then on foot inside it = one landing splash
 log.length=0;a=st();run(30,i=>[[8,pose({mode:M.Jetpack,y:6-i*.2,speed:4})]]);run(2,()=>[[8,pose({mode:M.Walk,y:0})]]);
 assert.equal(rp.stats.landings-a.landings,1,'one landing splash');const sp=log.find(e=>e[0]==='splash');assert(sp&&sp[3]>.6,'a landing crown');
 a=st();run(30,i=>[[9,pose({x:P.x+P.rx+5,mode:M.Parachute,y:6-i*.2})]]);run(2,()=>[[9,pose({x:P.x+P.rx+5,mode:M.Walk})]]);assert.equal(rp.stats.landings,a.landings,'no landing on the bank');
 // gating: me far from the pond (asleep), still mode, reduced motion (smaller), lite (fewer steps)
 log.length=0;run(120,()=>[[3,pose({speed:3.7})]],{me:P.x+300});assert(!log.length,'the pond asleep (I am far): nothing');
 log.length=0;run(120,()=>[[3,pose({speed:3.7})]],{mode:2});assert(!log.length,'still mode: nothing');
 log.length=0;run(120,()=>[[3,pose({speed:3.7})]],{mode:2,reduced:true});const redR=log.filter(e=>e[0]==='ring');assert(redR.length&&redR.every(e=>e[3]<=.56),'reduced motion: half-size rings');
 a=st();run(240,()=>[[3,pose({speed:3.7})]],{mode:1});const liteR=rp.stats.steps-a.steps;a=st();run(240,()=>[[3,pose({speed:3.7})]]);assert(liteR<rp.stats.steps-a.steps,'lite mode: sparser steps');
 // the slot pool: at most REMOTE_POND.slots tracked, freed when they leave; no new meshes
 run(2,()=>Array.from({length:12},(_,k)=>[20+k,pose({x:P.x+k*.5,speed:2})]));assert.equal(rp.stats.tracked,RP.REMOTE_POND.slots,'a fixed slot pool');
 run(1,()=>[]);assert.equal(rp.stats.tracked,0,'freed when gone');assert.equal(scn.children.length,geoR,'pooled: no new meshes');
 const tb=fs.readFileSync(path.join(base,'lib/multiplayer/townBridge.ts'),'utf8');
 assert(/party\.eachDrawn\(remotePond\.member\)/.test(town)&&/createRemotePond\(pondLife\)/.test(town),'Town feeds the drawn friends to the remote splashes');
 assert(/eachDrawn\(cb\)[\s\S]{0,200}avatars\.root\.visible/.test(tb)&&/drawnHid\.has\(id\)/.test(tb),'only the drawn set: hidden friends, indoors and a hidden friend layer are skipped');
 console.log(`  remote: steps ${slowR} → ${fastR}, sprays, landing, lite ${liteR}`);}
life.dispose();
assert(/riding:rideRef\.current!=='walk'&&rideRef\.current!=='jetpack'/.test(town)&&/y:groundY,heading:player\.root\.rotation\.y/.test(town),'Town feeds the pond the landing height, heading and ride');
console.log('pond skip + pond splashes: ok');
})().catch(e=>{console.error(e);process.exit(1);});
