// Phone 30 fps cap (lib/town/frameCap.ts): fixed 33.3 ms slots for 60/90/120 Hz timestamps with jitter and dropped
// frames; never above 30 in any second; the old remainder cap is kept here as the regression reference.
const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('node:assert/strict');
const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/town/frameCap.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{module:m,exports:m.exports});
const {frameCapSlot,PHONE_FRAME_MS:I}=m.exports;
let seed=1;const rnd=()=>{seed=(seed*1103515245+12345)%2147483648;return seed/2147483648;};
const oldCap=(now,st)=>{if(now-st.l<I-1)return false;st.l=now-Math.max(0,(now-st.l)%I);return true;};
const newCap=(now,st)=>{const s=frameCapSlot(now,st.l);if(s<0)return false;st.l=s;return true;};
/** Feed `secs` of vsync timestamps at `hz` (uniform ±jitter ms, `drop` = chance a vsync is missed, `cost` = ms the main
 * thread is busy after a rendered frame). Returns fps, the most frames in any 1 s window and the rendered-frame gaps. */
function run(cap,hz,{jitter=0,drop=0,cost=0,secs=60,s0=1}={}){seed=s0;const P=1000/hz,st={l:0},win=[],gaps=[];let n=0,max1s=0,prev=null,busy=0;
 for(let v=1;v*P<secs*1000;v++){if(drop&&rnd()<drop)continue;const now=1000+v*P+(rnd()*2-1)*jitter;if(now<busy)continue;
  if(!cap(now,st))continue;n++;if(prev!==null)gaps.push(now-prev);prev=now;busy=now+cost;win.push(now);while(win[0]<=now-1000)win.shift();max1s=Math.max(max1s,win.length);}
 return {fps:n/secs,max1s,gaps};}
const cases=[];
for(const hz of [60,90,120])for(const jitter of [0,.05,.3,1,2])for(const drop of [0,.05])cases.push({hz,jitter,drop});
let oldWorst=0;
for(const c of cases){for(const s0 of [1,2,3]){
 const r=run(newCap,c.hz,{...c,s0}),label=JSON.stringify({...c,s0});
 assert(Math.abs(r.fps-30)<=0.1+(c.drop?0.2:0),`${label}: ${r.fps} fps`);
 assert(r.max1s<=31,`${label}: ${r.max1s} frames in one second`);
 if(!c.drop&&c.jitter<=.3)for(const g of r.gaps)assert(g>I-1&&g<I+1,`${label}: uneven gap ${g}`);
 oldWorst=Math.max(oldWorst,run(oldCap,c.hz,{...c,s0}).fps);}}
assert(oldWorst>40,`old cap reference no longer reproduces the bug (${oldWorst})`);
// Slow frames: the cap never adds frames, it only lets through what the device can draw.
for(const [hz,cost,fps] of [[60,20,30],[60,40,20],[120,20,30],[120,40,24]])assert(Math.abs(run(newCap,hz,{jitter:.3,cost}).fps-fps)<0.1,`${hz} Hz, ${cost} ms frames`);
// Wake from sleep / first frame: renders at once, then keeps 33.3 ms slots from there (no catch-up burst).
assert.equal(frameCapSlot(5000,0),5000);
assert.equal(frameCapSlot(9000,5000),9000);
assert.equal(frameCapSlot(9016.7,9000),-1);
assert.equal(frameCapSlot(9033.2,9000),9000+I);
// A late frame keeps the grid (no drift up or down); a missed slot resyncs to now.
assert.equal(frameCapSlot(9040,9000),9000+I);
assert.equal(frameCapSlot(9070,9000),9070);
// The simulation still measures real time: summed rendered gaps equal elapsed time, so the fixed 1/60 physics step
// (Town.tsx accumulator) advances the same distance per second at 30 fps.
{const r=run(newCap,120,{jitter:.3,secs:10});const total=r.gaps.reduce((a,b)=>a+b,0);assert(Math.abs(total-(10000-2*I))<40,`elapsed ${total}`);}
console.log(`PASS frame cap: 30.0 fps at 60/90/120 Hz with jitter and dropped vsyncs (old cap up to ${oldWorst.toFixed(1)} fps), even 33.3 ms gaps, wake/resync, slow frames`);
