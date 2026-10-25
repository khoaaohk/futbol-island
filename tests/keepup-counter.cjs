// Counted keep-ups + hold for higher (Oct 22 2026, owner: "the kickup on the main screen should act just like the one in the
// kombini where it counts your kickups. One minor change to both, if holding the button the kick is higher in the air"; then
// "but still keep the action of it kicking off walls if nearby"). Pure: lib/town/keepUps.ts (hold curve, pill steps), the
// island ball (lib/town/walkBall.ts keepUp / keepUpRelease: count, drop, lift, wall kicks), the Konbini ball (press /
// pressEnd), the shared best (fi2-konbini-ball-v1); plus source checks for the island and Konbini wiring and the shared pill.
// usage: node tests/keepup-counter.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const K=require('../lib/town/keepUps.ts'),W=require('../lib/town/walkBall.ts'),B=require('../lib/konbini/konbiniBall.ts');
const read=f=>fs.readFileSync(f,'utf8');

// 1. Hold → lift: 1 for a tap, monotonic, 1.6 cap from 0.6 s, finite for junk input.
{assert.equal(K.holdLift(0),1);assert.equal(K.holdLift(249),1,'a tap (< 0.25 s) is a normal kick');assert.equal(K.holdLift(600),1.6);assert.equal(K.holdLift(5000),1.6,'capped');
 assert.equal(K.holdLift(NaN),1);assert.equal(K.holdLift(-50),1);let prev=1;for(let ms=0;ms<=2000;ms+=10){const l=K.holdLift(ms);assert(l>=prev&&l<=1.6,'monotonic, capped at '+ms);prev=l;}
 assert(K.holdLift(425)>1.25&&K.holdLift(425)<1.35,'half way up the ramp');assert.equal(K.holdCharge(600),1);}

// 2. Pill steps: count up, finish on 0, restart in one frame still finishes the old run; the shared best (Konbini record).
{assert.deepEqual(K.keepUpStep(0,1),{kind:'touch',view:{n:1,live:true},finished:0});assert.equal(K.keepUpStep(4,5).kind,'touch');
 assert.deepEqual(K.keepUpStep(5,0),{kind:'end',view:{n:5,live:false},finished:5});assert.deepEqual(K.keepUpStep(0,0),{kind:'none',view:null,finished:0});
 assert.equal(K.keepUpStep(6,1).finished,6,'a same-frame restart records the old run');assert.equal(K.keepUpLinger(true),2600);assert.equal(K.keepUpLinger(false),1800);
 const mem=new Map(),st={getItem:k=>mem.has(k)?mem.get(k):null,setItem:(k,v)=>mem.set(k,String(v))};
 assert.deepEqual(B.recordStreak(5,st),{best:5,newBest:true});assert.deepEqual(B.recordStreak(3,st),{best:5,newBest:false});assert.deepEqual([...mem.keys()],['fi2-konbini-ball-v1'],'one shared key');
 assert(/'fi2-konbini-ball-v1'/.test(read('lib/saves/snapshot.ts')),'the shared best key is already classified in snapshot.ts');}

// 3. Island ball: counted juggle. Presses in the falling half count; no press → the ball drops and the run ends.
const p={x:0,y:0,z:0,yaw:0},flat={floor:()=>0,blocked:()=>false,impact(){},strike(){},receive(){}};
function island({hold=50,stopAt=6,wall=false,top=6}={}){const b=W.createWalkBall(),tgt=wall?{x:0,z:3,top}:undefined,env=wall?{...flat,blocked:(_x,z)=>z>=3}:flat;
 assert(b.keepUp(p,tgt));b.keepUpRelease();assert.equal(b.state.streak,1,'the first touch counts 1');assert(b.state.counted);
 let press=-1,last=1,peaks=[0],modes=new Set(),wallKicks=0,phase='';const seq=[1];
 for(let i=0;i<120*14;i++){const t=i/120;b.updateWallTarget(p,tgt);b.update(1/120,p,env);modes.add(b.state.mode);
  if(b.state.mode==='wall-juggle'&&b.state.wallPhase==='outbound'&&phase!=='outbound')wallKicks++;phase=b.state.wallPhase;
  const win=b.state.mode==='juggle'?b.state.jugglePhase>=.6:b.state.mode==='wall-juggle'&&b.state.wallPhase==='returning';
  if(b.state.counted&&win&&!b.keepUpHeld&&press<0&&b.state.streak<stopAt){b.keepUp(p,tgt);press=t;}
  if(press>=0&&t-press>=hold/1000){b.keepUpRelease();press=-1;}
  if(b.state.streak!==last){seq.push(b.state.streak);last=b.state.streak;peaks.push(0);}
  peaks[peaks.length-1]=Math.max(peaks[peaks.length-1],b.state.y);}
 return {b,seq,peaks,modes,wallKicks};}
{const tap=island(),held=island({hold:700});
 assert.deepEqual(tap.seq,[1,2,3,4,5,6,0],'counts each touch, then the miss ends the run');assert(tap.modes.has('drop'),'the missed ball drops');assert.equal(tap.b.state.mode,'attached','… and comes back to the feet');
 assert.deepEqual(held.seq,[1,2,3,4,5,6,0],'holding still counts');
 // The same routine touch: held flights go higher, never above the 3.04 m lob ceiling.
 for(let i=1;i<5;i++)assert(held.peaks[i]>tap.peaks[i]+.1,'held touch '+i+' higher: '+held.peaks[i].toFixed(2)+' vs '+tap.peaks[i].toFixed(2));
 assert(Math.max(...held.peaks)<=3.04+1e-6,'capped under the ceiling');
 console.log('island tap peaks',tap.peaks.slice(1,5).map(v=>v.toFixed(2)).join(' '),'| held',held.peaks.slice(1,5).map(v=>v.toFixed(2)).join(' '));
 // Early taps (rising half) do not arm; a press held into the window does (one touch per press).
 const b=W.createWalkBall();b.keepUp(p);b.keepUpRelease();for(let i=0;i<20;i++)b.update(1/120,p,flat);b.keepUp(p);b.keepUpRelease();let n=0;while(b.state.mode==='juggle'&&n++<400)b.update(1/120,p,flat);assert.equal(b.state.mode,'drop','an early tap does not keep it up');
 const h=W.createWalkBall();h.keepUp(p);h.keepUpRelease();for(let i=0;i<20;i++)h.update(1/120,p,flat);h.keepUp(p);for(let i=0;i<150;i++)h.update(1/120,p,flat);assert.equal(h.state.streak,2,'an early press held into the window arms the touch');assert(h.state.keepLift>1.5,'… lifted by the hold');
 const away={...p};let hs=false;for(let i=0;i<900&&h.state.streak;i++){if(h.state.mode==='sky')away.x=8;h.update(1/120,away,flat);hs=hs||h.state.mode==='sky';}assert(hs,'held ~0.9 s through the touch: a sky kick (tests/keepup-sky.cjs)');assert.equal(h.state.streak,0,'the player walks off: the sky ball lands, the run ends');h.keepUpRelease();
 // A held press let go before the window still arms the next touch (with its lift); kids let go early.
 {const e=W.createWalkBall();e.keepUp(p);e.keepUpRelease();for(let i=0;i<5;i++)e.update(1/120,p,flat);e.keepUp(p);for(let i=0;i<40;i++)e.update(1/120,p,flat);assert(e.state.jugglePhase<.45,'released before the window');e.keepUpRelease();let g=0;while(e.state.streak===1&&g++<400)e.update(1/120,p,flat);assert.equal(e.state.streak,2,'a held early press still counts');assert(e.state.keepLift>1.1,'… with its lift');}
 // Key auto-repeat: a second press while held is ignored (no reset of the hold).
 const r=W.createWalkBall();r.keepUp(p);assert.equal(r.keepUp(p),false,'auto-repeat ignored');r.keepUpRelease();
 // A shot or reset ends the run; the legacy juggle() stays the automatic loop.
 const s=W.createWalkBall();s.keepUp(p);s.keepUpRelease();s.shoot(p,0);assert.equal(s.state.streak,0);const a=W.createWalkBall();a.juggle(p);for(let i=0;i<1200;i++)a.update(1/120,p,flat);assert.equal(a.state.mode,'juggle','juggle() still loops by itself');assert.equal(a.state.streak,0);}

// 4. Wall kicks still happen in a counted run, a touched rebound counts +1, an untouched one drops; holding kicks higher.
{const tap=island({wall:true}),held=island({wall:true,hold:700});
 assert(tap.modes.has('wall-juggle')&&tap.wallKicks>=5,'near a wall the keep-up kicks off it ('+tap.wallKicks+' kicks)');assert.deepEqual(tap.seq,[1,2,3,4,5,6,0],'each touched rebound counts, the untouched one ends it');assert(tap.modes.has('drop'));
 const avg=a=>a.slice(1,5).reduce((x,y)=>x+y,0)/4;assert(avg(held.peaks)>avg(tap.peaks)+.3,'held wall kicks go higher');assert(Math.max(...held.peaks)<=6-.25+.05,'under the wall top');
 const low=island({wall:true,hold:700,top:2.2});assert(Math.max(...low.peaks)<=2.2-.25+.05,'a low wall caps the held kick');
 console.log('wall tap peaks',tap.peaks.slice(1,5).map(v=>v.toFixed(2)).join(' '),'| held',held.peaks.slice(1,5).map(v=>v.toFixed(2)).join(' '));}

// 5. Konbini: a tap in the window touches on release (normal rise); a press held in (or early into) the window touches higher at the foot.
{const ev=[],k=B.createKonbiniBall([],e=>ev.push(e)),me={x:0,z:0,yaw:0},step=()=>k.update(1/60,me);
 assert(k.press(me));k.pressEnd();let apexTap=0,g=0;while(!(k.state.vy<0&&k.state.y<=B.KEEPUP.window-.05)&&g++<200){step();apexTap=Math.max(apexTap,k.state.y);}
 assert(k.press(me),'in-window press accepted');assert.equal(k.state.streak,1,'… the touch waits for the release');k.pressEnd();assert.equal(k.state.streak,2,'a tap touches on release');
 g=0;while(k.state.vy>0&&g++<200)step();assert.equal(k.press(me),false,'early press: no touch yet');let apexHeld=0;g=0;while(k.state.streak===2&&g++<400)step();assert.equal(k.state.streak,3,'held into the window: touches at the foot');
 g=0;while(k.state.vy>0&&g++<400){step();apexHeld=Math.max(apexHeld,k.state.y);}k.pressEnd();
 assert(apexHeld>apexTap+.2,'held kick higher: '+apexHeld.toFixed(2)+' vs '+apexTap.toFixed(2));assert(apexHeld<B.KEEPUP.contact+B.KEEPUP.rise*1.6+.25,'capped (still catchable)');
 g=0;while(!(k.state.vy<0&&k.state.y<=B.KEEPUP.window-.05)&&g++<400)step();assert(k.press(me),'the next touch is reachable');k.pressEnd();assert.equal(k.state.streak,4);
 {const k3=B.createKonbiniBall([]);k3.press(me);k3.pressEnd();let g3=0,top=0;while(!(k3.state.vy<0&&k3.state.y<=B.KEEPUP.window-.05)&&g3++<200)k3.update(1/60,me);
  k3.press(me);g3=0;while(k3.state.streak===1&&g3++<200)k3.update(1/60,me);assert.equal(k3.state.streak,2,'held in-window press touches at the foot');
  g3=0;while(k3.state.vy>0&&g3++<400){k3.update(1/60,me);top=Math.max(top,k3.state.y);}k3.pressEnd();assert(top>=apexTap-.01,'held in-window press: not lower ('+top.toFixed(2)+'; the full lift needs ~0.6 s of hold, so press early and hold)');
  const k4=B.createKonbiniBall([]);k4.press(me);k4.pressEnd();g3=0;while(!(k4.state.vy<0&&k4.state.y<=B.KEEPUP.contact-.05)&&g3++<200)k4.update(1/60,me);assert(k4.press(me)&&k4.state.streak===2,'below the foot: touches at once');k4.pressEnd();}
 {const k5=B.createKonbiniBall([]);k5.press(me);k5.pressEnd();for(let i=0;i<2;i++)k5.update(1/60,me);k5.press(me);for(let i=0;i<20;i++)k5.update(1/60,me);assert(k5.state.vy>0,'still rising at the release');k5.pressEnd();let g5=0;while(k5.state.streak===1&&g5++<200)k5.update(1/60,me);assert.equal(k5.state.streak,2,'Konbini: a held early press let go still touches at the foot');assert(k5.state.lift>1.05);}
 const e2=[],k2=B.createKonbiniBall([],e=>e2.push(e));k2.tap(me);for(let i=0;i<5;i++)k2.update(1/60,me);k2.press(me);k2.pressEnd();assert.equal(e2.at(-1).type,'early','an early tap released early is still just early');
 console.log('konbini apex tap',apexTap.toFixed(2),'held',apexHeld.toFixed(2));}

// 6. Source checks: the shared pill, the island wiring, the Konbini wiring, the charge ring.
{const town=read('components/Town.tsx'),room=read('components/KonbiniRoom.tsx'),scene=read('lib/konbini/konbiniScene.ts'),css=read('app/globals.css'),pill=read('components/KeepUpCounter.tsx');
 assert(/export default function KeepUpCounter/.test(pill)&&/Keep-ups: <b>\{n\}<\/b>/.test(pill)&&/★ New best!/.test(pill)&&/best \{best\}/.test(pill),'one pill component');
 assert(/<KeepUpCounter key=\{'streak-'\+streak\.key\} className=\{styles\.streak\}/.test(room)&&!/Keep-ups: <b>\{streak\.n\}/.test(room),'the Konbini renders the shared pill (its own position class)');
 assert(/<KeepUpCounter key=\{'keepups-'\+keepUps\.key\} placement="island" data-hud-slot="task"/.test(town),'the island pill sits in the HUD stack task slot');
 assert(/walkBall\.keepUp\(ballPlayer,wallTarget\?\?undefined\)/.test(town)&&/if\(!keys\.has\('j'\)&&!keepUpHeld\.current\)walkBall\.keepUpRelease\(\);/.test(town),'island: press with the wall target (wall kicks kept), release on button / J up');
 assert(/keepUpStep\(hudStreak,walkBall\.state\.streak\)/.test(town)&&/recordStreak\(step\.finished\)/.test(town)&&/readBallRecord\(\)\.best/.test(town),'island: count polled on the HUD tick, best shared with the Konbini');
 assert(/onPointerUp=\{e=>\{keepUpHeld\.current=false;/.test(town)&&/keepUpHeld\.current=true/.test(town),'island: the hold is tracked for touch, pen and mouse');
 assert(/kb\.press\(bp\(\)\)/.test(scene)&&/else if\(e\.type==='keyup'\)keepUpEnd\(\)/.test(scene)&&/room\.current\?\.keepUpEnd\(\)/.test(room),'Konbini: press / release (button and J)');
 assert(/\.touch-juggle\[data-holding="true"\]:not\(\[data-keepup-button\]\)\{animation:keepup-charge \.6s linear forwards\}/.test(css)&&/steps\(1,end\)/.test(css),'Konbini 0.6 s outline fill, reduced-motion safe');
 // Audit Oct 24 P0 #5: the island button (data-keepup-button) has only its 1.6 s ring, no 0.6 s outline that reads "full" too early.
 assert(!/\.touch-juggle\[data-holding="true"\]\{/.test(css),'no un-scoped outline fill (island excluded)');
 assert(/prefers-reduced-motion:reduce\)\{\.pill/.test(read('components/KeepUpCounter.module.css')),'pill animations off with reduced motion');}
// 7. Late-tap grace (audit Oct 24 P0 #1): a press up to KEEPUP_LATE (0.15 s) after the touch moment still counts; 0.2 s drops.
{assert.equal(W.KEEPUP_LATE,.15);const H=1/120;
 // The touch frame from a run pressed in time (identical start), then the same run pressed `off` s after that moment.
 const start=wall=>{const b=W.createWalkBall(),tgt=wall?{x:0,z:3,top:6}:undefined,env=wall?{...flat,blocked:(_x,z)=>z>=3}:flat;b.keepUp(p,tgt);b.keepUpRelease();return {b,tgt,env};};
 const win=b=>b.state.mode==='juggle'?b.state.jugglePhase>=.6:b.state.mode==='wall-juggle'&&b.state.wallPhase==='returning';
 const touchFrame=wall=>{const {b,tgt,env}=start(wall);let pressed=false;for(let i=0;i<1200;i++){b.updateWallTarget(p,tgt);if(!pressed&&win(b)){b.keepUp(p,tgt);b.keepUpRelease();pressed=true;}b.update(H,p,env);if(b.state.streak===2)return i;}throw new Error('no touch');};
 const late=(wall,off)=>{const T=touchFrame(wall),at=T+Math.round(off/H),{b,tgt,env}=start(wall);let dropped=false;
  for(let i=0;i<=at+2;i++){b.updateWallTarget(p,tgt);if(i===at){b.keepUp(p,tgt);b.keepUpRelease();}b.update(H,p,env);dropped=dropped||b.state.mode==='drop';if(b.state.streak===2)break;}
  return {b,dropped,tgt,env};};
 for(const wall of [false,true]){const what=wall?'wall return':'juggle';
  for(const off of [.05,.1,.14]){const r=late(wall,off);assert.equal(r.b.state.streak,2,what+': a tap '+off+' s late still counts');assert(!r.dropped,what+': no drop');}
  const r2=late(wall,.2);assert(r2.dropped,what+': 0.2 s late drops the ball');assert.notEqual(r2.b.state.streak,2,what+': 0.2 s late does not count');
  // and the run goes on after a late touch: the next in-time press counts too.
  const r=late(wall,.1);let pressed=false;for(let i=0;i<600&&r.b.state.streak===2;i++){r.b.updateWallTarget(p,r.tgt);if(!pressed&&win(r.b)&&r.b.state.streak===2){r.b.keepUp(p,r.tgt);r.b.keepUpRelease();pressed=true;}r.b.update(H,p,r.env);}
  assert.equal(r.b.state.streak,3,what+': the run goes on after the late touch');}
 // A late dip stays small (contact − 0.15 m at most) and mashing is unaffected (tests above: one press per window).
 console.log('late grace: +0.05/0.1/0.14 s count, +0.2 s drops (juggle and wall)');}

// 8. Stray Kick guard (audit Oct 24 P0 #3): Kick / ride presses within 350 ms of a keep-up press during a run are ignored.
{assert.equal(W.KEEPUP_STRAY_MS,350);const S=W.strayAfterKeepUpPress;
 assert.equal(S(true,1000+349,1000),true,'349 ms after a keep-up press in a run: ignored');assert.equal(S(true,1000+120,1000),true);
 assert.equal(S(true,1000+350,1000),false,'350 ms+: a deliberate shot');assert.equal(S(false,1000+100,1000),false,'no run: never ignored');
 const town=read('components/Town.tsx'),css=read('app/globals.css');
 assert(/const strayAfterKeepUp=\(\)=>strayAfterKeepUpPress\(keepUpBusy\.current,performance\.now\(\),keepUpPressAt\.current\);/.test(town),'Town: busy = the run, the press time from the keep-up button');
 assert(/const actionDown=\([^)]*\)=>\{if\(action==='kick'&&strayAfterKeepUp\(\)\)\{e\.preventDefault\(\);return;\}/.test(town)&&/const actionClick=\([^)]*\)=>\{if\(action==='kick'&&strayAfterKeepUp\(\)\)return;/.test(town),'Kick down / click guarded');
 assert(/onPointerDown=\{e=>travelControlDown\(e,guardedCycleRide\)\} onClick=\{e=>travelControlClick\(e,guardedCycleRide\)\}/.test(town),'ride switch guarded');
 assert(/keepUpHeld\.current=true;keepUpPressAt\.current=performance\.now\(\);/.test(town),'the keep-up press time is recorded');
 // Colour: the island keep-up is sky blue (#9fd8ff, dark icon), not the Shoot colour; phones: 20 px between Keep-up and Shoot.
 assert(/\.town-app \.travel-actions \.touch-juggle\[data-keepup-button\]\{background:#9fd8ff [^}]*color:#17323b!important/.test(css),'sky-blue keep-up');
 assert(/\.travel-actions\[data-emote-grid\]\{grid-template-columns:var\(--action-size\) var\(--action-size\) calc\(var\(--action-size\) \+ var\(--keepup-shoot-extra,8px\)\)\}/.test(css)&&/\{gap:8px;--keepup-shoot-extra:12px\}/.test(css),'12+8 / 8+12 = 20 px gap');}
console.log('keep-up counter: hold curve, pill steps + shared best, island counted juggle (drop, lift, wall kicks), Konbini hold, wiring passed');
