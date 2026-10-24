// Sky keep-up trap / re-kick variants (Oct 24 2026, owner: "the character animation must adapt to where the ball comes down and
// how it's played"; "HIGH KICKS ARE REAL KICKS … FOOT"): lib/town/skyKeepUpMoves.ts picks the trap (foot / thigh / chest by
// height, un-pressed arrivals only) and the kick-up (FOOT only: instep, laces, outside, toe-poke) from height / side / streak,
// never the same twice in a row; the ball leaves from that foot's contact point; the rig (lib/graphics/player.ts) reads it with
// no per-frame allocation. usage: node tests/keepup-sky-moves.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const M=require('../lib/town/skyKeepUpMoves.ts'),W=require('../lib/town/walkBall.ts'),read=f=>fs.readFileSync(f,'utf8');
const T=M.SKY_TRAPS,K=M.SKY_KICKS,kick=(h,side,n,prev)=>K[M.pickSkyKick(h,side,n,prev)];

// 1. Trap by height: foot low, thigh mid, chest high.
assert.equal(T[M.pickSkyTrap(.2)],'foot');assert.equal(T[M.pickSkyTrap(.5)],'foot');assert.equal(T[M.pickSkyTrap(.8)],'thigh');assert.equal(T[M.pickSkyTrap(1.2)],'chest');assert.equal(T[M.pickSkyTrap(1.7)],'chest');
// 2. Kick-ups are foot kicks only, at any height: very low → toe-poke first; otherwise instep first. No knee / thigh / chest / header.
assert.deepEqual([...K],['instep','laces','outside','toe'],'foot kicks only');
for(let n=0;n<12;n++)for(const side of [-1,1])for(const h of [.1,.3,.5,.8,1.2,1.6,2.1])assert(['instep','laces','outside','toe'].includes(kick(h,side,n,-1)),'foot at '+h);
assert.equal(kick(.2,1,0,-1),'toe','very low: a toe-poke');assert.equal(kick(.8,1,0,-1),'instep','otherwise: the instep');
for(const k of [0,1,2,3])assert.equal(M.skyKickTouch(k),'foot');
// Contact points sit on the kicking boot: the side's hip line (or just outside it for the outside flick), at boot height, ahead.
{const o={x:0,y:0,z:0};for(const side of [-1,1])for(const k of [0,1,2,3]){M.skyKickContact(k,side,o);assert(Math.sign(o.x)===side,'kicking foot on side '+side);assert(o.y>=.25&&o.y<=.5,'boot height '+o.y);assert(o.z>=.3&&o.z<=.65,'ahead of the feet');}
 M.skyKickContact(0,1,o);assert.deepEqual(o,{x:.108,y:.48,z:.45},'instep = the juggle foot contact');}
// The side varies it: the same height / count on the other side starts one further on.
assert.notEqual(kick(.3,-1,0,-1),kick(.3,1,0,-1),'left vs right differ');
// 3. Never the same one twice in a row, over a long mixed run.
{let prev=-1;const seen=new Set();for(let n=1;n<200;n++){const h=[.3,.8,1.6,1.2,.5][n%5],side=n%3?1:-1,k=M.pickSkyKick(h,side,n,prev);assert.notEqual(k,prev,'repeat at '+n);seen.add(K[k]);prev=k;}
 assert.deepEqual([...seen].sort(),[...K].sort(),'all four foot kicks show up');
 for(const h of [.3,.8,1.6])for(let n=0;n<10;n++){const a=M.pickSkyKick(h,1,n,-1);assert.notEqual(M.pickSkyKick(h,1,n,a),a,'prev excluded at h='+h);}}
// 4. Short: a trap (un-pressed arrival) is 0…1…0 over SKY_MOVE.trap with no kick; a pressed arrival has NO trap phase, the
//    re-kick pose is already up at contact and eases out over SKY_MOVE.kick.
{const o={trap:0,kick:0};M.skyMoveWeights(M.SKY_MOVE.trap/2,o,true);assert(o.trap>.99&&o.kick===0,'trap pose');M.skyMoveWeights(M.SKY_MOVE.trap+.01,o,true);assert(o.trap===0&&o.kick===0);
 M.skyMoveWeights(0,o);assert(o.trap===0&&o.kick>.9,'re-kick up at contact, no trap');M.skyMoveWeights(.05,o);assert(o.kick>.99);M.skyMoveWeights(M.SKY_MOVE.kick+.01,o);assert(o.trap===0&&o.kick===0);
 M.skyMoveWeights(-1,o);assert(o.trap===0&&o.kick===0);assert(M.SKY_MOVE.trap<=.4&&M.SKY_MOVE.kick<=.3,'short');}
// 5. The ball path leaves from the matching body part.
assert.equal(M.skyKickTouch(0),'foot');assert.equal(M.skyKickTouch(3),'foot');
// 6. In walkBall: a PRESSED arrival kicks it straight back up (sky → sky, skyTrap −1, the re-kick picked, ~0.3 s pose); an
//    UN-PRESSED arrival is trapped with the part for its height (chest / thigh / foot, ~0.35 s cushion) and settles at the feet.
{const DT=1/60,flat={floor:()=>0,blocked:()=>false,impact(){},strike(){},receive(){}},S=W.KEEPUP_SKY;
 const arrive=press=>{const b=W.createWalkBall(),p={x:0,y:0,z:0,yaw:0};b.keepUp(p);let tapped=false,wind=0,got=null,prev=1;
  for(let i=0;i<60*7&&!got;i++){if(i===72)b.keepUpRelease();wind=Math.max(wind,b.state.skyWind);
   if(b.state.mode==='sky'){const dx=b.state.skyX-p.x,dz=b.state.skyZ-p.z,d=Math.hypot(dx,dz),s=Math.min(d,5*DT);if(d>1e-6){p.x+=dx/d*s;p.z+=dz/d*s;}if(press&&!tapped&&b.state.vy<0&&b.state.y<=S.armHigh){tapped=true;b.keepUp(p);b.keepUpRelease();}}
   const before=b.state.mode;b.update(DT,p,flat);const h=b.state.y-p.y;
   if(before==='sky'&&(b.state.mode==='attached'||b.state.mode==='sky'&&b.state.streak>prev))got={h,mode:b.state.mode,trap:b.state.skyTrap,kick:b.state.skyKick,age:b.state.skyMoveAge};prev=b.state.streak;}
  let n=0;while(b.state.skyMoveAge>=0&&n++<60)b.update(DT,p,flat);return {wind,got,n};};
 const k=arrive(true);assert(k.wind>.9,'holding ~1 s: the wind-up reaches full ('+k.wind.toFixed(2)+')');assert(k.got,'kicked');assert.equal(k.got.mode,'sky','pressed: straight back up');assert.equal(k.got.trap,-1,'pressed: no trap');assert(k.got.kick>=0);
 assert(k.n>=16&&k.n<=20,'the re-kick pose lasts ~0.3 s ('+k.n+' frames)');
 const t=arrive(false);assert(t.got,'trapped');assert.equal(t.got.mode,'attached','un-pressed: trapped at the feet');assert.equal(t.got.trap,M.pickSkyTrap(t.got.h),'trap fits the catch height ('+t.got.h.toFixed(2)+' m → '+T[t.got.trap]+')');
 assert(t.n>=19&&t.n<=23,'the trap lasts ~0.35 s ('+t.n+' frames)');}
// 7. Rig wiring: one module-level weights object, reduced motion halves the poses and drops the wind-up lean.
{const rig=read('lib/graphics/player.ts');assert(/const SKY_W=\{trap:0,kick:0\};/.test(rig),'pooled weights');assert(/skyAmp=reduced\?\.5:1,skyWind=reduced\?0:/.test(rig),'reduced motion');
 assert(/skyMoveAge:rideRef\.current==='walk'\?walkBall\.state\.skyMoveAge:-1/.test(read('components/Town.tsx')),'Town feeds the rig');}
console.log('keep-up sky moves: trap by height (un-pressed only), re-kick by height/side/streak (no repeats, no trap when pressed), short poses, catch wiring, rig wiring passed');
