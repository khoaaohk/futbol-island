// Futbol Tennis round 3: the cinematic beat helper (lib/arcade/tennisCinema.ts). Slow-mo ramps back to 1x, hard caps
// on length and frequency, any tap skips, the rival's incoming ball cancels slow-mo, reduced motion = flash only.
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
function load(file){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.resolve(file),'utf8'),{compilerOptions:{module:1,target:7}}).outputText,{exports:m.exports,module:m,Math,Number,JSON,console,require});return m.exports;}
const {createTennisCinema,TENNIS_BEAT:B}=load('lib/arcade/tennisCinema.ts');
const dt=1/60;
function run(c,seconds,opts={}){const trace=[];for(let t=0;t<seconds;t+=dt)trace.push({...c.update(dt,!!opts.charging,!!opts.serving,!!opts.rivalBall)});return trace;}

// 1. A full strike beat: dips to the slow scale, holds within the cap, ramps back to exactly 1.
let c=createTennisCinema(false);run(c,7);assert(c.strike(1),'first strike beat starts');
let tr=run(c,2);const min=Math.min(...tr.map(s=>s.scale));
assert(Math.abs(min-B.slowScale)<1e-9,`slows to ${B.slowScale}x`);assert(min>=.25&&min<=.4,'slow-mo stays in the 0.25–0.4x band');
const slowFrames=tr.filter(s=>s.scale<B.slowScale+.01).length*dt;assert(slowFrames<=B.slowMax+.02,`slow part ≤ ${B.slowMax}s real (${slowFrames.toFixed(2)})`);assert(slowFrames>=.3);
assert.equal(tr.at(-1).scale,1,'clock is back to 1x');assert.equal(tr.at(-1).close,0,'camera back to the rally shot');assert(!c.active()||tr.at(-1).follow<1);
// smooth: no frame-to-frame jump in scale bigger than a ramp step allows
for(let i=1;i<tr.length;i++)assert(Math.abs(tr[i].scale-tr[i-1].scale)<.2,'scale eases, no snaps');
assert(Math.max(...tr.map(s=>s.close))<=B.close+1e-9,'close-up weight capped');assert(Math.max(...tr.map(s=>s.push))<=B.pushMax+1e-9,'push ≤ 10% dolly');
assert(tr.some(s=>s.follow>.9),'the look target whips to the ball');

// 2. Frequency cap: a second strike within slowGap gets no slow-mo (at most a push-in).
assert.equal(c.strike(1),false,'no second slow-mo inside the gap');tr=run(c,1.5);assert(tr.every(s=>s.scale===1),'clock untouched');
run(c,B.slowGap);assert(c.strike(.5),'after the gap a new beat is allowed');

// 3. Skip: a tap hands the clock back within ~0.12 s.
c=createTennisCinema(false);run(c,7);c.strike(1);run(c,.15);c.skip();tr=run(c,.2);assert.equal(tr.at(-1).scale,1,'tap skips the slow-mo');assert(tr.at(-1).close<.01);

// 4. Never during the critical return: the rival's ball coming at you cancels slow-mo at once.
c=createTennisCinema(false);run(c,7);c.strike(1);run(c,.1);tr=run(c,.2,{rivalBall:true});assert.equal(tr.at(-1).scale,1,'rival return → full speed');

// 5. Push-ins: capped frequency, settle back to 0, no slow-mo.
c=createTennisCinema(false);run(c,3);assert(c.push(1));tr=run(c,1.2);assert(tr.every(s=>s.scale===1));assert(Math.max(...tr.map(s=>s.push))>.05);assert.equal(tr.at(-1).push,0,'settles');
assert(c.push(1)===false||true);c=createTennisCinema(false);run(c,3);c.push(1);assert.equal(c.push(1),false,'one push-in per gap');

// 6. Wind-up: your serve wind-up swings gently into the 3/4 shot; a rally wind-up only dollies a little; no slow-mo.
c=createTennisCinema(false);tr=run(c,1,{charging:true,serving:true});assert(tr.every(s=>s.scale===1));assert(tr.at(-1).close>.3&&tr.at(-1).close<=B.serveClose+1e-9);
c=createTennisCinema(false);tr=run(c,1,{charging:true});assert.equal(tr.at(-1).close,0,'rally wind-up keeps the wide view');assert(tr.at(-1).push>0&&tr.at(-1).push<=B.pushMax*.36);

// 7. Reduced motion: no slow-mo, no zoom, no push: a short flash instead, which fades.
c=createTennisCinema(true);assert.equal(c.strike(1),false);tr=run(c,1);assert(tr.every(s=>s.scale===1&&s.close===0&&s.push===0),'reduced: camera and clock untouched');
assert(tr[0].flash>0,'reduced: a gentle flash');assert.equal(tr.at(-1).flash,0);c.push(1);tr=run(c,1,{charging:true,serving:true});assert(tr.every(s=>s.close===0&&s.push===0));

// 8. Allocation: update returns the same pooled object every frame.
c=createTennisCinema(false);const a=c.update(dt,false,false,false),b=c.update(dt,false,false,false);assert.equal(a,b,'no per-frame allocation');
console.log('TENNIS_R3_CINEMA_PASS slow-mo band + ramps back to 1x, caps, skip, rival-return cancel, push-ins, wind-up, reduced motion, pooled state');
