// Sky keep-ups (Oct 24 2026, owner: "allow the keep ups to be kicked up way in the air … by holding the btn down … above the
// Konbini store height and a little higher, they can run and see a red mark where the ball is going to land, to chase it and
// try to keep the keep-up going"). Pure physics in lib/town/walkBall.ts (KEEPUP_SKY, skyCharge, predictSkyLanding, inSkyCatch,
// the 'sky' mode) + source checks for the Town wiring (one pooled red mark, reduced motion / Battery saver: no pulse).
// usage: node tests/keepup-sky.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const W=require('../lib/town/walkBall.ts'),K=W.KEEPUP_SKY,read=f=>fs.readFileSync(f,'utf8');
const DT=1/60,flat={floor:()=>0,blocked:()=>false,impact(){},strike(){},receive(){}};

// 1. Constants: apex = the Konbini roof (konbiniDoors KONBINI_BUILDINGS.main.h) + 3 m; the charge curve.
{const roof=Number(/main:\{x:71,z:-58,w:10,d:10,h:([0-9.]+)\}/.exec(read('lib/konbini/konbiniDoors.ts'))[1]);
 assert.equal(W.KONBINI_ROOF,roof,'KONBINI_ROOF matches the Konbini building height');assert.equal(K.apex,roof+9,'the one tunable SKY_MAX_APEX: roof + 9 m');assert.equal(W.SKY_MAX_APEX,K.apex);
 assert.equal(W.skyCharge(0),0);assert.equal(W.skyCharge(600),0,'the normal (1.6x) held kick stays a normal keep-up');assert.equal(W.skyCharge(K.start),0);
 assert.equal(W.skyCharge(1000),1,'full at ~1 s');assert.equal(W.skyCharge(5000),1);assert.equal(W.skyCharge(NaN),0);
 assert.equal(W.keepUpChargeRing(500),.5);assert.equal(W.keepUpChargeRing(2000),1);}

// A run: the starting press held `hold` ms from the feet (arms touch 2; ≥ ~1 s → a full sky kick). `move(b,p)` steers the player;
// `tap` presses the keep-up button (100 ms tap) once the falling sky ball is under armHigh, as a player timing the catch would.
function run({hold=1200,env=flat,move=null,tap=false,frames=60*8}={}){
 const b=W.createWalkBall(),p={x:0,y:0,z:0,yaw:0},log={launch:null,land:null,apex:0,catches:0,modes:[]};let t=0,held=true,prev=b.state.mode,prevStreak=1,tapAt=-1,tapped=false;
 assert(b.keepUp(p));
 for(let i=0;i<frames;i++){t+=DT;if(held&&t*1000>=hold){b.keepUpRelease();held=false;}
  if(tap&&!held&&b.state.mode==='sky'&&!tapped&&b.state.vy<0&&b.state.y<=p.y+K.armHigh-.3){b.keepUp(p);tapped=true;tapAt=t;}
  if(tapAt>=0&&t-tapAt>=.1){b.keepUpRelease();tapAt=-1;}
  move?.(b,p,t);b.update(DT,p,env);const m=b.state.mode;
  if(m==='sky'&&prev!=='sky')log.launch={t,x:b.state.x,y:b.state.y,z:b.state.z,predX:b.state.skyX,predY:b.state.skyY,predZ:b.state.skyZ,predT:b.state.skyLeft,streak:b.state.streak};
  if(m==='sky')log.apex=Math.max(log.apex,b.state.y);
  if(prev==='sky'&&m==='drop'&&!log.land)log.land={t,x:b.state.x,y:b.state.y,z:b.state.z};
  if(prev==='sky'&&m!=='sky'&&m!=='drop'||prev==='sky'&&m==='sky'&&b.state.streak>prevStreak){log.catches++;log.caughtAt=b.state.streak;log.caughtCounted=b.state.counted;}
  if(m!==prev)log.modes.push(m);prev=m;prevStreak=b.state.streak;}
 return {b,p,log};}
const chase=(b,p)=>{if(b.state.mode!=='sky')return;const dx=b.state.skyX-p.x,dz=b.state.skyZ-p.z,d=Math.hypot(dx,dz),s=Math.min(d,5*DT);if(d>1e-6){p.x+=dx/d*s;p.z+=dz/d*s;}};

// 2. Apex and hang time: a ~1 s hold → the ball tops out a little over the Konbini roof and hangs 3+ s; it lands 1.5-2 m away.
{const {b,log}=run();assert(log.launch,'sky kick launched');assert.equal(log.launch.streak,2,'the sky kick is touch 2');
 assert(log.apex>=K.apex-.05&&log.apex<=K.apex+.05,'apex '+log.apex.toFixed(2)+' ≈ roof + 9 = '+K.apex);
 assert(log.land,'landed');const hang=log.land.t-log.launch.t;assert(hang>=3&&hang<5,'hang time '+hang.toFixed(2)+' s (3-5)');
 // 3. The landing prediction made at launch IS the landing.
 const err=Math.hypot(log.land.x-log.launch.predX,log.land.z-log.launch.predZ);assert(err<.05,'predicted landing = actual ('+err.toFixed(3)+' m)');
 assert(Math.abs(hang-log.launch.predT)<=DT*1.5,'predicted time = actual');const drift=Math.hypot(log.launch.predX,log.launch.predZ);
 assert(drift>=1.45&&drift<=2.05,'lands ~1.5-2 m away ('+drift.toFixed(2)+'), never back on the player');assert(drift>K.catchRadius,'outside the catch radius of a still player');
 assert.equal(b.state.streak,0,'a still player misses: the run ends (as today)');assert(b.state.mode!=='sky');
 console.log('sky: apex',log.apex.toFixed(2),'m, hang',hang.toFixed(2),'s, lands',drift.toFixed(2),'m ahead, catch radius',K.catchRadius,'m');}
// A short hold stays a normal keep-up (no sky); a partial charge goes less high.
{const {log}=run({hold:300,frames:200});assert(!log.launch,'a short hold is the normal keep-up');
 const half=W.createWalkBall(),p={x:0,y:0,z:0,yaw:0};half.keepUp(p);let t=0,apex=0,sky=false;for(let i=0;i<60*6;i++){t+=DT;if(Math.abs(t-.1)<DT/2)half.keepUpRelease();if(i===12)half.keepUp(p);if(i===12+50)half.keepUpRelease();half.update(DT,p,flat);if(half.state.mode==='sky'){sky=true;apex=Math.max(apex,half.state.y);}}
 assert(sky,'a ~0.85 s hold: a partial sky kick');assert(apex<K.apex-.3,'a partial charge goes less high ('+apex.toFixed(2)+')');}

// 4. Chase + press: running to the mark AND tapping as it comes down catches it (+1, the run goes on); at the mark without a press it drops.
{const {b,log}=run({frames:60*7,move:chase,tap:true});assert.equal(log.catches,1,'ran to the mark + tapped: caught');assert(log.modes.includes('juggle'),'back to the juggle');assert(log.caughtCounted&&log.caughtAt===3,'count 3 and going ('+log.caughtAt+')');assert.equal(b.state.streak,0,'no press for the next touch: it drops as today');
 const lazy=run({frames:60*7,move:chase});assert.equal(lazy.log.catches,0,'at the mark but no press: no auto-catch');assert.equal(lazy.b.state.streak,0);
 const still=run({frames:60*7,tap:true});assert.equal(still.log.catches,0,'pressed but did not run: missed');assert.equal(still.b.state.streak,0);
 let upTap=false;const early=run({frames:60*7,move:(b,p)=>{chase(b,p);if(b.state.mode==='sky'&&b.state.vy>0&&!upTap){upTap=true;b.keepUp(p);b.keepUpRelease();}}});assert.equal(early.log.catches,0,'a tap on the way up does not arm the catch');}
{// Catch then charge again: a press held ~1 s from the catch through the next touch → a second sky kick.
 const b=W.createWalkBall(),p={x:0,y:0,z:0,yaw:0};b.keepUp(p);let launches=0,prev='',pressed=false,tapped=false;
 for(let i=0;i<60*16;i++){if(i===72)b.keepUpRelease();chase(b,p);
  if(b.state.mode==='sky'&&!tapped&&b.state.vy<0&&b.state.y<=p.y+K.armHigh-.3){tapped=true;b.keepUp(p);}
  b.update(DT,p,flat);if(prev==='sky'&&b.state.mode==='juggle'&&!pressed){pressed=true;b.keepUpRelease();b.keepUp(p);}if(b.state.mode==='sky'&&prev!=='sky')launches++;if(launches>=2&&pressed)b.keepUpRelease();prev=b.state.mode;if(launches>=2)break;}
 assert.equal(launches,2,'caught, charged again, second sky kick');assert(b.state.streak>=4,'the count carries on ('+b.state.streak+')');}

// 5. Catch zone: the ball falling between catchLow and catchHigh, within catchRadius (1 m) of the feet.
{const P={x:0,y:0,z:0};assert.equal(K.catchRadius,1);assert(W.inSkyCatch(.9,.8,0,-5,P),'0.9 m away at knee height: in the zone');assert(!W.inSkyCatch(1.1,.8,0,-5,P),'1.1 m: outside');
 assert(!W.inSkyCatch(0,.8,0,3,P),'rising: no catch');assert(!W.inSkyCatch(0,K.catchHigh+.2,0,-5,P),'still too high');assert(!W.inSkyCatch(0,.05,0,-5,P),'on the ground: too late');
 // In the sim (with the tap): standing 0.6 m off the landing spot → caught; 1.3 m off → dropped.
 const at=off=>run({tap:true,frames:60*7,move:(b,p)=>{if(b.state.mode==='sky'&&b.state.y<3){const vx=b.state.vx,vz=b.state.vz,v=Math.hypot(vx,vz)||1;p.x=b.state.skyX+(-vz/v)*off;p.z=b.state.skyZ+(vx/v)*off;}}});
 assert.equal(at(.6).log.catches,1,'0.6 m off: caught');const miss=at(1.3);assert.equal(miss.log.catches,0,'1.3 m off: missed');assert.equal(miss.b.state.streak,0);}

// 6. Any ground: a 0.8 m step ahead (prediction = landing); sea / a roof ahead → another heading; nowhere valid → a normal touch.
{const terrace={...flat,floor:(x,z)=>z>1.2?.8:0},{log}=run({env:terrace});assert(log.land&&Math.abs(log.land.y-(.8+.2))<.02,'landed on the step');
 assert(Math.hypot(log.land.x-log.launch.predX,log.land.z-log.launch.predZ)<.05,'step: predicted = actual');
 const seaAhead={...flat,sea:(x,z)=>z>1?'sea':'land'},sa=run({env:seaAhead});assert(sa.log.launch&&sa.log.launch.predZ<=1,'sea ahead: it lands on dry land instead ('+sa.log.launch.predZ.toFixed(2)+')');
 const roofAhead={...flat,floor:(x,z)=>z>1?5:0},ra=run({env:roofAhead});assert(ra.log.launch&&ra.log.launch.predZ<=1,'a roof ahead: never lands up where the player cannot go');
 const island={...flat,sea:(x,z)=>Math.hypot(x,z)>1.2?'sea':'land'},none=run({env:island,frames:150});assert(!none.log.launch,'no valid spot: a normal lifted keep-up, no sky kick');assert(none.b.state.streak>=2||none.log.modes.includes('drop'));}

// 7. Walls: the sky ball rebounds off a building (up or down), the mark moves to the rebound's landing, and the run keeps going;
//    chase the new mark + tap → caught, the same count. A wall kick then a sky kick (and back) all add to one streak.
{const wallZ=1.4,building={...flat,blocked:(x,z,y)=>z>wallZ&&y<30};let rePred=null,launchPred=null;
 const r=run({env:building,tap:true,frames:60*7,move:(b,p)=>{if(b.state.mode==='sky'){launchPred=launchPred||{x:b.state.skyX,z:b.state.skyZ};if(b.state.skyZ<wallZ)rePred={x:b.state.skyX,z:b.state.skyZ};}chase(b,p);}});
 assert(r.log.launch,'launched toward the building');assert(launchPred.z<=wallZ,'the probe keeps the landing outside the building');}
{// Force a hit: aim straight ahead into a wall the probe cannot see from the landing spot (a thin, tall wall between).
 const thin={...flat,blocked:(x,z,y)=>z>1&&z<1.3&&y<30};let preds=[];
 const r=run({env:thin,tap:true,frames:60*7,move:(b,p)=>{if(b.state.mode==='sky'){const last=preds[preds.length-1];if(!last||Math.abs(last.z-b.state.skyZ)>1e-6)preds.push({x:b.state.skyX,z:b.state.skyZ});}chase(b,p);}});
 if(r.log.launch&&r.log.launch.predZ>1.3){assert(preds.length>=2,'the mark moved after the rebound');assert(preds[preds.length-1].z<1,'… to the near side of the wall');
  assert.equal(r.log.catches,1,'chased the rebound + tapped: caught');assert.equal(r.log.caughtAt,3,'the streak kept going through the rebound');}
 else assert(r.log.launch,'(the probe picked a heading clear of the wall)');
 console.log('rebound: marks',preds.map(q=>q.z.toFixed(2)).join(' → '));}
{// Rebound landing = prediction after the hit (a still player, no catch).
 const thin={...flat,blocked:(x,z,y)=>z>1&&z<1.3&&y<30},b=W.createWalkBall(),p={x:0,y:0,z:0,yaw:0};b.keepUp(p);let last=null,land=null,prev='';
 for(let i=0;i<60*8;i++){if(i===72)b.keepUpRelease();b.update(DT,p,thin);if(b.state.mode==='sky')last={x:b.state.skyX,z:b.state.skyZ};if(prev==='sky'&&b.state.mode==='drop')land={x:b.state.x,z:b.state.z};prev=b.state.mode;}
 assert(land&&Math.hypot(land.x-last.x,land.z-last.z)<.05,'the last mark is where it lands');}
{// Wall kick → sky kick → catch → wall kick again: one streak.
 const tgt={x:0,z:3,top:6},env={...flat,blocked:(_x,z)=>z>=3},b=W.createWalkBall(),p={x:0,y:0,z:0,yaw:0};
 assert(b.keepUp(p,tgt));let t=0,held=true,prev='',seen=[],tap=-1,skyAt=0,caught=0;
 for(let i=0;i<60*14;i++){t+=DT;if(b.state.mode!=='sky')b.updateWallTarget(p,b.state.mode==='juggle'||b.state.mode==='wall-juggle'?tgt:undefined);
  if(held&&b.state.mode==='sky'){b.keepUpRelease();held=false;}
  if(b.state.mode==='sky'){chase(b,p);if(tap<0&&b.state.vy<0&&b.state.y<=p.y+K.armHigh-.3){b.keepUp(p);tap=t;}}
  // after the catch: tap in each window (wall rebound coming back / falling half), as in tests/keepup-counter.cjs
  const win=b.state.mode==='juggle'?b.state.jugglePhase>=.6:b.state.mode==='wall-juggle'&&b.state.wallPhase==='returning';
  if(caught&&b.state.counted&&win&&!b.keepUpHeld&&tap<0){b.keepUp(p);tap=t;}
  if(tap>=0&&t-tap>=.1&&b.state.mode!=='sky'){b.keepUpRelease();tap=-1;}
  b.update(DT,p,env);const m=b.state.mode;if(m!==prev)seen.push(m);if(m==='sky'&&prev!=='sky')skyAt=b.state.streak;if(prev==='sky'&&m!=='sky'&&m!=='drop')caught=b.state.streak;prev=m;if(caught&&b.state.streak>=caught+2)break;}
 assert.equal(seen[0],'wall-juggle','it starts with a wall kick');assert(skyAt===2,'the held press turned the wall rebound into a sky kick (touch '+skyAt+')');
 assert(caught===3,'caught: 3');assert(b.state.streak>=5&&seen.lastIndexOf('wall-juggle')>seen.indexOf('sky'),'… then wall kicks again, same streak ('+b.state.streak+'; '+seen.join('>')+')');}


// 7. Town wiring: one pooled red mark (created once, no per-frame allocation), reduced motion / Battery saver: no pulse.
{const town=read('components/Town.tsx');
 assert(/const skyMark=new T\.Mesh\(/.test(town),'one pooled mark mesh');assert.equal((town.match(/new T\.Mesh\(skyMarkGeometry/g)||[]).length,1);
 assert(/walkBall\.state\.mode==='sky'/.test(town),'the frame loop reads the sky mode');assert(/skyPulse=!reduced&&!batterySaverOn\(\)/.test(town),'no pulse with reduced motion / Battery saver');
 assert(/nextJuggling=rideRef\.current==='walk'&&\(walkBall\.state\.mode==='juggle'\|\|walkBall\.state\.mode==='wall-juggle'\|\|walkBall\.state\.mode==='sky'\)/.test(town),'the keep-up button stays a keep-up button while the ball is up');}
console.log('keep-up sky: apex roof + 9 m, 3-5 s hang, any ground (sea / roof probes), wall rebounds + mixed wall/sky streaks, prediction = landing, 1.5-2 m landing offset, chase + press to catch + charge again, 1 m catch zone, terrain, wiring passed');
