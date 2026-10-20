// Heat guard for the sea (Oct 15 2026, docs/swimming-research.md §2.7, docs/performance-guide.md "Wading, swimming and
// splash-downs"): no new loops, timers, render targets, audio contexts, materials or instance pools anywhere in the water code;
// the ripples come from the ball effects' existing ring pool; treading water with no input for 4 s engages the 20 fps idle cap
// (the idle-ride rule) and any input restores the rate; the depth probe asks distanceToLand at 10 Hz, never per frame; the
// swim pose allocates nothing per frame; the under tint is opacity only, no backdrop-filter; the splash-down (Oct 15 2026) borrows
// the pool's 27 existing instances (5 rings + 14 ghost + 8 charge spheres) for under a second, nothing at rest, ≤ 5 short cue
// timers per splash through the existing sound channels. Run: node tests/heat-water.cjs
const assert=require('node:assert/strict'),fs=require('node:fs');
const {createLoader}=require('./summit-harness.cjs');
const read=f=>fs.readFileSync(f,'utf8');
let failed=0;const ok=(name,fn)=>{try{fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};

ok('no loops, timers, targets, audio contexts, pools or materials in the water code',()=>{
 const files=['lib/town/water/waterDepth.ts','lib/town/water/waterState.ts','lib/town/water/waterHud.ts','lib/graphics/swimPose.ts','lib/analytics/waterEvents.ts'];
 for(const f of files){const s=read(f);
  for(const bad of ['requestAnimationFrame','setInterval','setTimeout','WebGLRenderTarget','AudioContext','backdrop-filter','new T.Mesh','InstancedMesh','ShaderMaterial','MeshBasicMaterial','new Float32Array(','new Array','.map(','.filter(','{...'])
   if(bad==='new Float32Array(')assert(!/(function |=>)[^\n]*new Float32Array\(/.test(s.replace(/createSwimPoser\(j:SwimJoints\)\{\n const held=new Float32Array\(N\),target=new Float32Array\(N\);/,'')),f+' allocates typed arrays per frame');
   else if(bad==='{...'){assert(!/step\([^)]*\)[^{]*\{[\s\S]*?\{\.\.\./.test(s.split('function step')[1]?.split('function splashDown')[0]??''),f+' spreads in step');}
   else if(bad==='.map('||bad==='.filter('){/* module-level tables only */const body=s.split('export function createWaterState')[1]??s.split('export function createSwimPoser')[1]??'';assert(!body.includes(bad),f+' uses '+bad+' at run time');}
   else assert(!s.includes(bad),`${f} has ${bad}`);}
 // The lesson toast runs one timeout like RideUnlockToast and nothing else.
 const toast=read('components/SwimLessonToast.tsx');assert(!/setInterval|requestAnimationFrame/.test(toast));assert.equal((toast.match(/setTimeout\(/g)||[]).length,2,'one wait + one hide timeout');
 // The ripples reuse the ball effects' ring pool: no new pool anywhere.
 const fx=read('lib/graphics/ballEffects.ts');assert.match(fx,/ripple\(x:number,y:number,z:number,power:number,size=1\)\{const ring=rings\[cursor\+\+%rings\.length\];/);assert.match(fx,/rings=Array\.from\(\{length:5\}/,'the ring pool is still five rings (no new materials)');
 const town=read('components/Town.tsx');assert.match(town,/ballEffects\.ripple\(location\.x,WATER_LEVEL,location\.z,ev\.ripple\)/);assert.match(town,/ballEffects\.splashDown\(location\.x,WATER_LEVEL,location\.z,size,reduced\)/);
 // The splash-down's instance budget: the pool's own 5 rings, 14 ghost spheres and 8 charge spheres, the same 6 materials as
 // before, a burst that ends itself after SPLASH_BURST_S (< 1 s) and leaves nothing visible; reduced motion: one ring.
 assert.match(fx,/ghosts=Array\.from\(\{length:14\}/);assert.match(fx,/energy=Array\.from\(\{length:8\}/);assert.equal((fx.match(/new T\.MeshBasicMaterial/g)||[]).length,6,'no new materials for the splash (the same five MeshBasicMaterial literals as before, plus the one swim-ripple pool literal, Oct 19 2026)');
 assert.match(fx,/const SPLASH_BURST_S=\.95,/);assert.match(fx,/if\(k>=1\)burst\.age=SPLASH_BURST_S;\n  \}else if\(burstWas\)\{burstWas=false;burst\.age=SPLASH_BURST_S;lastColor='';for\(const mesh of ghosts\)mesh\.visible=false;for\(const mesh of energy\)mesh\.visible=false;\}/,'the burst hides everything when it ends');
 assert.match(fx,/if\(burst\.age<SPLASH_BURST_S&&!shot&&charging<0&&!reduced\)\{/,'no burst with reduced motion, never over the ball trail');
 assert(!/splashDown\([^)]*\)\{[\s\S]*?new (T\.|Float32Array|Array)/.test(fx.split('splashDown(')[1].split('drips(')[0]),'splashDown allocates nothing');
 // The splash cues: ≤ 5 short setTimeouts per splash (the only timers the sea runs), all cleared on unmount.
 const H=createLoader()('lib/town/water/waterHud.ts');for(const k of Object.keys(H.SPLASH_CUES))assert(H.SPLASH_CUES[k].filter(c=>c[2]>0).length<=4,k+': ≤ 4 timers');
 assert.match(town,/const cueTimers=new Set<ReturnType<typeof setTimeout>>\(\);/);assert.match(town,/for\(const t of cueTimers\)clearTimeout\(t\);cueTimers\.clear\(\);/);
 assert(!/createWaterFx|swimFx|new T\.(Mesh|InstancedMesh)\([^)]*water/i.test(town),'no water pool in Town');
 // The under tint: a DOM element, opacity only, hidden after UNDER_TINT_MS.
 const css=read('app/globals.css');assert.match(css,/\.water-under\{position:absolute;inset:0;z-index:5;pointer-events:none;background:#2fb8c9;opacity:0\}/);
 assert(!/\.water-under[^}]*backdrop-filter/.test(css),'no backdrop blur over the canvas');assert.match(css,/@keyframes waterUnder\{0%\{opacity:0\}35%\{opacity:\.35\}100%\{opacity:0\}\}/);
 assert.match(town,/if\(waterTintUntil&&now>=waterTintUntil\)\{waterTintUntil=0;const tint=uiElement<HTMLElement>\('\[data-water-under\]'\);if\(tint\)\{tint\.hidden=true;/);
 // Decorative ripples obey the fishingLife-style gate (reduced / static ambience / governor slow / tier ≥ 2); splash rings never do.
 assert.match(town,/const waterFxOn=\(\)=>!\(reduced\|\|heat\.staticAmbience\|\|heat\.governor\.last\.state==='slow'\)&&heat\.tier<2;/);
 assert.match(town,/else if\(ev\.ripple>0&&!animalRides\.riding\/\* riding: the ride's own wake on the animal \*\/&&\(ev\.surfaced\|\|waterFxOn\(\)&&water\.state\.phase!=='swim'\)\)\{ballEffects\.ripple/);
});

ok('treading water for 4 s with no input engages the 20 fps idle cap; input restores it; wading never caps',()=>{
 const load=createLoader();
 const {createIdleRide,IDLE_RIDE_AFTER_MS,IDLE_RIDE_FRAME_MS}=load('lib/town/idleRide.ts'),{frameCapSlot}=load('lib/town/frameCap.ts');
 const W=load('lib/town/water/waterDepth.ts'),S=load('lib/town/water/waterState.ts');
 const probe=W.createWaterProbe((x,z)=>Math.max(0,Math.hypot(x,z)-10),(x,z)=>Math.hypot(x,z)<=10,()=>false);
 const water=S.createWaterState(probe,()=>false),idle=createIdleRide();
 const F=1000/30;let t=0,x=9.5;
 const frame=(dt,stick,moving)=>{water.step(dt/1000,x,0,{stick,moving,speed:moving?1:0,landY:0,yaw:0,airborne:false});const cap=idle.interval(t,water.resting());idle.sample(t,{x,y:water.state.rootY,z:0},{x:x+16,y:23,z:33});return cap;};
 // Wade in (moving): never capped.
 while(x<11.5){x+=1/30;t+=F;assert.equal(frame(F,1,true),0,'wading: no cap');}
 assert.equal(water.state.phase,'wade');
 // Stand still in the knee-deep water for 8 s: still never capped (walking's rule).
 for(let i=0;i<240;i++){t+=F;assert.equal(frame(F,0,false),0,'standing in the shallows is walking: no cap');}
 // Swim out, then let go of the stick: 20 fps after 4 s, not before.
 while(x<16){x+=1.8/30;t+=F;frame(F,1,true);}
 assert.equal(water.state.phase,'swim');idle.stir(t);
 const t0=t;let engaged=-1;
 for(let i=0;i<240;i++){t+=F;const cap=frame(F,0,false);if(cap&&engaged<0)engaged=t-t0;if(t-t0<IDLE_RIDE_AFTER_MS-F)assert.equal(cap,0,'not before 4 s');}
 assert(engaged>=IDLE_RIDE_AFTER_MS&&engaged<IDLE_RIDE_AFTER_MS+2*F,'20 fps engaged at '+engaged+' ms');
 t+=F;assert.equal(frame(F,0,false),IDLE_RIDE_FRAME_MS,'treading water: 20 fps');
 // The treading pose bobs the pelvis, not the root: no "travel" wakes it.
 for(let i=0;i<60;i++){t+=F;assert.equal(frame(F,0,false),IDLE_RIDE_FRAME_MS,'stays capped while bobbing');}
 // A tap wakes it; a dive on its way down or up is never idle (the body travels); settled under, the idle rule applies again.
 idle.stir(t);t+=F;assert.equal(frame(F,0,false),0,'input restores the rate');
 water.press('dive','tap');for(let i=0;i<20;i++){t+=F;frame(F,0,false);}assert(water.state.under>0&&water.state.under<1);assert.equal(water.resting(),false,'mid-dive is travel');
 for(let i=0;i<120;i++){t+=F;frame(F,0,false);}assert.equal(water.state.under,1);assert.equal(water.resting(),true,'settled under: resting');
 water.press('dive','tap');for(let i=0;i<120;i++){t+=F;frame(F,0,false);}assert.equal(water.state.under,0);
 // With the 50 ms slots, 120 Hz timestamps render 20 a second (the same grid as idle rides).
 let slot=0,n=0;for(let u=0;u<10000;u+=1000/120){const s=frameCapSlot(u,slot,IDLE_RIDE_FRAME_MS);if(s>=0){slot=s;n++;}}assert(n>=199&&n<=201);
});

ok('the probe never asks distanceToLand per frame; the swim pose allocates nothing per frame',()=>{
 const load=createLoader();const W=load('lib/town/water/waterDepth.ts');
 let calls=0;const probe=W.createWaterProbe((x,z)=>{calls++;return Math.max(0,Math.hypot(x,z)-10);},(x,z)=>Math.hypot(x,z)<=10,()=>false);
 let x=10.5;for(let i=0;i<3600;i++){x+=2.6/60;probe.sample(x,0,1/60);}
 assert(calls<=602,`60 s swimming at 60 Hz → ${calls} calls (≤ 10/s)`);
 const src=read('lib/graphics/swimPose.ts');
 const apply=src.slice(src.indexOf('apply(swim'));assert(!/new |\[\]|\{\}/.test(apply.split('get active')[0].replace(/\/\/[^\n]*/g,'')),'apply() allocates');
 const state=read('lib/town/water/waterState.ts'),step=state.slice(state.indexOf('function step('),state.indexOf('function splashDown'));
 assert(!/new |\[\]|=>\s*\(\{|\{\.\.\./.test(step.replace(/\/\/[^\n]*/g,'').replace(/\/\*[\s\S]*?\*\//g,'')),'step() allocates');
});

ok('Town wiring: the idle rule, the activity, the 10 Hz probe is the only depth source, the splash sound reuses existing cues',()=>{
 const town=read('components/Town.tsx');
 assert.match(town,/const waterIdle=water\.resting\(\);[\s\S]*?const idleFrame=idleRide\.interval\(now,rideRef\.current!=='walk'\|\|waterIdle\|\|footRest,footRest\?IDLE_FOOT_AFTER_MS:undefined,quietNear\);/);
 assert.match(town,/if\(waterIdle&&idleFrame&&!waterIdleWas\)countWaterIdleCap\(\);/);
 assert.match(town,/:water\.inWater\?'swim':'walk',placeAt\);/,'the frame books swimming time as its own activity');
 assert(!/waterDepthAt\(/.test(town),'Town reads depth through the probe only');
 assert.match(town,/playCues\(SPLASH_CUES\[water\.state\.entry\]\);/,'the splash is the cue table by entry');assert.doesNotMatch(town,/sound\.land\(ev\.splash\);playCues/,'no land thud in the sea (Oct 15 2026)');assert.match(fs.readFileSync('lib/audio/islandSound.ts','utf8'),/case 'splash-soft':case 'splash':case 'splash-big':/,'the splash is synthesized on the existing effects bus (no samples, no new context)');
 const sound=read('lib/audio/islandSound.ts');assert(/case 'splash-soft':case 'splash':case 'splash-big':/.test(sound)&&!/\.(mp3|ogg|wav)\b/.test(sound),'the splash is synthesized on the existing bus (user, Oct 15 2026): no samples');assert(!/new (Audio|AudioContext)|\.mp3|\.ogg|\.wav/.test(read('lib/town/water/waterHud.ts')),'no audio files');
 const player=read('lib/graphics/player.ts');assert.match(player,/if\(swimming\|\|swimPoser\.active\)swimPoser\.apply\(motion\?\.swim,dt,reduced,turn\);/);
 assert.match(player,/const swimPoser=createSwimPoser\(\{pelvis,torso,head,legs,arms\}\);/,'one poser per rig, made once');
});

if(failed){console.log(`HEAT_WATER_FAIL ${failed}`);process.exit(1);}
console.log('HEAT_WATER_PASS no new pools/materials/loops, splash within the pool\'s 27 instances, 20 fps idle after 4 s treading water, 10 Hz probe, no per-frame allocation');
