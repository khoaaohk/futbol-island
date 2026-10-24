// Sky keep-up trap / re-kick variants (Oct 24 2026, owner: "the character animation must adapt to where the ball comes down and
// how it's played"): lib/town/skyKeepUpMoves.ts picks the trap (foot / thigh / chest by height) and the re-kick (instep, laces,
// knee flick, header, outside flick) from height / side / streak, never the same twice in a row; walkBall's catch uses it; the rig
// (lib/graphics/player.ts) reads it with no per-frame allocation and halves it with reduced motion. usage: node tests/keepup-sky-moves.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const M=require('../lib/town/skyKeepUpMoves.ts'),W=require('../lib/town/walkBall.ts'),read=f=>fs.readFileSync(f,'utf8');
const T=M.SKY_TRAPS,K=M.SKY_KICKS,kick=(h,side,n,prev)=>K[M.pickSkyKick(h,side,n,prev)];

// 1. Trap by height: foot low, thigh mid, chest high.
assert.equal(T[M.pickSkyTrap(.2)],'foot');assert.equal(T[M.pickSkyTrap(.5)],'foot');assert.equal(T[M.pickSkyTrap(.8)],'thigh');assert.equal(T[M.pickSkyTrap(1.2)],'chest');assert.equal(T[M.pickSkyTrap(1.7)],'chest');
// 2. Re-kick fits the height: low → instep / laces / outside; mid → knee / laces / instep / outside; head height → header first.
for(let n=0;n<12;n++)for(const side of [-1,1]){assert(['instep','laces','outside'].includes(kick(.3,side,n,-1)),'low '+n);assert(kick(.8,side,n,-1)!=='header','no header at the thigh');}
assert.equal(kick(1.6,1,0,-1),'header','head height: a header');assert.equal(kick(.8,1,0,-1),'knee','thigh height: a knee flick');assert.equal(kick(.3,1,0,-1),'instep','low: an instep lift');
// The side varies it: the same height / count on the other side starts one further on.
assert.notEqual(kick(.3,-1,0,-1),kick(.3,1,0,-1),'left vs right differ');
// 3. Never the same one twice in a row, over a long mixed run.
{let prev=-1;const seen=new Set();for(let n=1;n<200;n++){const h=[.3,.8,1.6,1.2,.5][n%5],side=n%3?1:-1,k=M.pickSkyKick(h,side,n,prev);assert.notEqual(k,prev,'repeat at '+n);seen.add(K[k]);prev=k;}
 assert.deepEqual([...seen].sort(),[...K].sort(),'all five re-kicks show up');
 for(const h of [.3,.8,1.6])for(let n=0;n<10;n++){const a=M.pickSkyKick(h,1,n,-1);assert.notEqual(M.pickSkyKick(h,1,n,a),a,'prev excluded at h='+h);}}
// 4. Short: trap + kick = 0.5 s, weights 0…1…0 in sequence, 0 outside.
{assert.equal(M.SKY_MOVE.trap+M.SKY_MOVE.kick,.5);const o={trap:0,kick:0};M.skyMoveWeights(.125,o);assert(o.trap>.99&&o.kick===0);M.skyMoveWeights(.375,o);assert(o.kick>.99&&o.trap===0);M.skyMoveWeights(.6,o);assert(o.trap===0&&o.kick===0);M.skyMoveWeights(-1,o);assert(o.trap===0&&o.kick===0);}
// 5. The ball path leaves from the matching body part.
assert.equal(M.skyKickTouch(3),'head');assert.equal(M.skyKickTouch(2),'knee');assert.equal(M.skyKickTouch(0),'foot');assert.equal(M.skyKickTouch(4),'foot');
// 6. In walkBall: a caught sky ball sets the trap / kick from where it was caught, the move clock runs 0.5 s, the wind-up shows the charge.
{const DT=1/60,flat={floor:()=>0,blocked:()=>false,impact(){},strike(){},receive(){}},S=W.KEEPUP_SKY,b=W.createWalkBall(),p={x:0,y:0,z:0,yaw:0};b.keepUp(p);let tapped=false,wind=0,caught=null;
 for(let i=0;i<60*7&&!caught;i++){if(i===72)b.keepUpRelease();wind=Math.max(wind,b.state.skyWind);
  if(b.state.mode==='sky'){const dx=b.state.skyX-p.x,dz=b.state.skyZ-p.z,d=Math.hypot(dx,dz),s=Math.min(d,5*DT);if(d>1e-6){p.x+=dx/d*s;p.z+=dz/d*s;}if(!tapped&&b.state.vy<0&&b.state.y<=S.armHigh){tapped=true;b.keepUp(p);b.keepUpRelease();}}
  const before=b.state.mode,y=b.state.y;b.update(DT,p,flat);if(before==='sky'&&b.state.mode==='juggle')caught={h:y-p.y,trap:b.state.skyTrap,kick:b.state.skyKick,age:b.state.skyMoveAge};}
 assert(wind>.9,'holding ~1 s: the wind-up reaches full ('+wind.toFixed(2)+')');assert(caught,'caught');assert.equal(caught.trap,M.pickSkyTrap(caught.h),'trap fits the catch height');assert(caught.kick>=0);
 let n=0;while(b.state.skyMoveAge>=0&&n++<60)b.update(DT,p,flat);assert(n>=28&&n<=32,'the move lasts ~0.5 s ('+n+' frames)');}
// 7. Rig wiring: one module-level weights object, reduced motion halves the poses and drops the wind-up lean.
{const rig=read('lib/graphics/player.ts');assert(/const SKY_W=\{trap:0,kick:0\};/.test(rig),'pooled weights');assert(/skyAmp=reduced\?\.5:1,skyWind=reduced\?0:/.test(rig),'reduced motion');
 assert(/skyMoveAge:rideRef\.current==='walk'\?walkBall\.state\.skyMoveAge:-1/.test(read('components/Town.tsx')),'Town feeds the rig');}
console.log('keep-up sky moves: trap by height, re-kick by height/side/streak (no repeats), 0.5 s, catch wiring, rig wiring passed');
