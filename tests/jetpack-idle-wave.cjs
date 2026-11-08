// Jetpack idle gestures (owner, Nov 8 2026): hovering idle on the jetpack plays a wave, then random arm variations with no back-to-back repeat.
// Pure logic in lib/town/jetpackIdleWave.ts + wiring checks on the source (Town.tsx, remoteAvatars.ts, jetpackIdlePose.ts).
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const ROOT=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
function load(file){const m={exports:{}};vm.runInNewContext(ts.transpileModule(read(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,Math});return m.exports;}
let n=0;const t=(name,fn)=>{try{fn();n++;}catch(e){console.error('FAIL',name);throw e;}};
const W=load('lib/town/jetpackIdleWave.ts'),DT=1/60;
const run=(s,secs,ok,reduced=false,cb)=>{for(let i=0;i<Math.round(secs/DT);i++){stepIdleWave(s,ok,reduced);cb&&cb(s);}};
function stepIdleWave(s,ok,reduced){return W.stepIdleWave(s,DT,ok,reduced);}

t('the picker opens with a wave and never repeats the last gesture',()=>{
 assert.equal(W.pickGesture(-1,.7),W.IDLE_GESTURE.Wave);
 for(let last=0;last<W.IDLE_GESTURE_COUNT;last++)for(let r=0;r<1;r+=.001){const k=W.pickGesture(last,r);assert.notEqual(k,last);assert(k>=0&&k<W.IDLE_GESTURE_COUNT);}
 const seen=new Set();for(let r=0;r<1;r+=.01)seen.add(W.pickGesture(0,r));assert.equal(seen.size,W.IDLE_GESTURE_COUNT-1,'every other gesture reachable');
 assert.equal(W.GESTURE_SECONDS.length,W.IDLE_GESTURE_COUNT);for(const d of W.GESTURE_SECONDS)assert(d>=1.5&&d<=3);
});
t('only triggers after IDLE_DELAY of idle hover, then loops with gaps and no back-to-back repeat',()=>{
 for(const seed of [1,7,99,123456]){const s=W.createIdleWave(seed);
  run(s,W.IDLE_DELAY-.1,true);assert.equal(s.kind,-1);assert.equal(s.w,0);
  run(s,.2,true);assert.equal(s.kind,W.IDLE_GESTURE.Wave,'the first gesture is the wave');
  const order=[];let prev=-1,gapStart=-1,clock=0;
  run(s,120,true,false,x=>{clock+=DT;if(x.kind!==prev){if(x.kind>=0){order.push(x.kind);if(gapStart>=0){const g=clock-gapStart;assert(g>=W.GAP_MIN-.05&&g<=W.GAP_MAX+.05,'gap '+g);}}else gapStart=clock;prev=x.kind;}assert(x.w>=0&&x.w<=1);});
  assert(order.length>=10);for(let i=1;i<order.length;i++)assert.notEqual(order[i],order[i-1],'no repeat '+order.join(','));
  assert(new Set(order).size>=4,'variety');}
});
t('the weight eases in and out of each gesture',()=>{
 const s=W.createIdleWave(3);run(s,W.IDLE_DELAY+DT*2,true);assert.equal(s.kind,0);assert(s.w<.1);run(s,.5,true);assert(s.w>.95);
 let max=0;while(s.kind>=0){stepIdleWave(s,true,false);if(s.kind>=0&&s.dur-s.age<.05)max=Math.max(max,s.w);}assert(max<.1,'eased out');
});
t('input (or anything else) cancels: blended out within 0.2 s and the idle clock restarts',()=>{
 const s=W.createIdleWave(5);run(s,W.IDLE_DELAY+1,true);assert(s.kind>=0&&s.w>.9);
 run(s,.2,false);assert.equal(s.w,0);assert.equal(s.kind,-1);
 run(s,W.IDLE_DELAY-.2,true);assert.equal(s.kind,-1,'needs a fresh idle delay');
 run(s,.3,true);assert.equal(s.kind,W.IDLE_GESTURE.Wave,'a new spell opens with the wave again');
});
t('Nov 8 2026: the cancel fade is 0.15 s of REAL time even when the frame dt is clamped (slow frames)',()=>{
 const s=W.createIdleWave(5);run(s,W.IDLE_DELAY+1,true);assert(s.kind>=0&&s.w>.9);
 // 6 fps real (0.166 s frames) with the 1/15 s clamp: one real frame already covers the whole fade
 W.stepIdleWave(s,1/15,false,false,1/6);assert.equal(s.w,0);W.stepIdleWave(s,1/15,false,false,1/6);assert.equal(s.kind,-1);
 const r=W.createIdleWave(5);run(r,W.IDLE_DELAY+1,true);let real=0;while(r.w>0&&real<1){W.stepIdleWave(r,1/30,false,false,1/30);real+=1/30;}assert(real<=W.CANCEL_FADE+1/30+1e-9,'gone within CANCEL_FADE (+ the frame it lands in): '+real);
});
t('reduced motion: no gestures ever, and a playing one stops at once',()=>{
 const s=W.createIdleWave(9);run(s,30,true,true,x=>assert.equal(x.w,0));assert.equal(s.kind,-1);
 run(s,W.IDLE_DELAY+1,true);assert(s.kind>=0);stepIdleWave(s,true,true);assert.equal(s.w,0);assert.equal(s.kind,-1);
});
t('wiring: Town gates on jetpack idle and reuses the emote arm keyframes; friends use mode + speed only; no per-frame allocation',()=>{
 const town=read('components/Town.tsx'),remote=read('lib/graphics/remoteAvatars.ts'),pose=read('lib/graphics/jetpackIdlePose.ts'),pure=read('lib/town/jetpackIdleWave.ts');
 assert.match(town,/stepIdleWave\(idleWave,active\?dt:0,ok,reduced,active\?ms\/1000:0\)/);/* Nov 8 2026: the real frame time drives the cancel fade */
 const gate=/const ok=([^;]+);if\(stepIdleWave/.exec(town)[1];
 for(const need of ["rideRef.current==='jetpack'",'!steering','!input.current.sprint',"!keys.has('shift')",'IDLE_SPEED',"jetActions.state.phase==='idle'",'emoteFx.kind<0','!moveFx.s','!water.inWater'])assert(gate.includes(need),need);
 assert.match(pose,/applyRideEmote\(root, 0,/);assert.match(pose,/from '.\/celebrations'/);
 assert.match(remote,/stepIdleWave\(iw,idleStep,mode===Mode\.Jetpack&&!shield&&pose\.speed<IDLE_SPEED&&e\.emote<0/);
 assert.doesNotMatch(pose,/\bnew [A-Z]|\[\s*\]|\{\s*\}\s*[,;)]/);assert.doesNotMatch(pure.replace(/export function createIdleWave[\s\S]*?\n}\n/,''),/\bnew [A-Z]|return \{/);
 assert.doesNotMatch(read('multiplayer/protocol/types.ts'),/idleWave|IdleGesture/i,'no new network fields');
});
console.log(`jetpack-idle-wave: ${n} passed`);
