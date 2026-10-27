// Futbol Pinball round 3 (Oct 26 2026, docs/ARCADE_PINBALL_R3_OCT26.md): hard divisions (High Press, Champions Night),
// the ladder start + unlock rules, kid helpers (beginner ball save, optional nudge, once-only tutorial), the living
// table (hot zone, hype, rondo cones, sweeper-keeper, rush clock), star-save migration, the cinematic-beat helper
// (caps, skip, reduced motion, time scale, no allocation) and its camera blend, and the simplified start card.
// Browser half: scripts/qa-pinball-r3-browser.cjs (390x844, 820x1180, 1440x900).
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path'),T=require('three');
const cache=new Map(),store=new Map(),same=(a,b,m)=>assert.equal(JSON.stringify(a),JSON.stringify(b),m);
const localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:1,target:7}}).outputText,{Math,Number,JSON,console,Map,Array,Object,String,Float32Array,Float64Array,localStorage,exports:m.exports,module:m,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});
 return m.exports;}
const P=load('lib/games/soccerPinball.ts'),Tb=load('lib/games/soccerPinballTable.ts'),M=load('lib/games/soccerPinballMissions.ts'),Ci=load('lib/games/soccerPinballCinema.ts'),Cam=load('lib/games/soccerPinballCamera.ts');
const idle={left:false,right:false};
const advance=(s,sec,input=idle,hz=120)=>{for(let i=0;i<Math.round(sec*hz);i++)P.stepPinball(s,input,1/hz);};
const goal=(s,x=180)=>{if(s.phase==='ready')P.launchPinball(s);Object.assign(s.ball,{x,y:49,vx:0,vy:-400});advance(s,.05);};

// 1. Ladder: six divisions, two hard; a run starts where the card says and climbs 2 goals per division.
assert.equal(P.PINBALL_DIVISIONS.length,6);same(P.PINBALL_DIVISIONS.map(d=>d.hard),[false,false,false,false,true,true]);
{const s=P.beginPinballRun(P.createPinballState(),{level:3});assert.equal(s.level,3);assert.equal(s.startLevel,3);assert.equal(s.defs,3,'a higher start meets the full back three');
 for(let n=0;n<4;n++){goal(s);advance(s,1.6);}assert.equal(s.level,4,'normal ladder tops out at Complete Forward');assert.equal(s.table.stars[3]&1,1,'2 goals in the top division clear it');
 assert.equal(s.table.mode,'final','clearing the top division starts the Cup Final, as before');assert.equal(P.pinballUnlockReach(s),5,'clearing Complete Forward opens the hard tier');}
{const s=P.createPinballState();for(let n=0;n<6;n++){goal(s);advance(s,1.6);}assert.equal(s.level,4,'Build Up run still caps at 4 (old behaviour)');assert.equal(P.pinballUnlockReach(s),4,'4 reached, not cleared yet');}
{const s=P.beginPinballRun(P.createPinballState(),{level:5});for(let n=0;n<2;n++){goal(s);advance(s,1.6);}assert.equal(s.level,6,'High Press climbs to Champions Night');
 for(let n=0;n<2;n++){goal(s);advance(s,1.6);}assert.equal(s.table.stars[5]&1,1,'Champions Night cleared');}
assert.equal(P.beginPinballRun(P.createPinballState(),{level:99}).level,6);assert.equal(P.beginPinballRun(P.createPinballState(),{level:0}).level,1);

// 2. Hard modifiers: shorter flippers (wider centre gap), shorter save, rush clock, quicker cones, sweeper, auto 2v1.
same([1,4,5,6].map(P.pinballFlipperLength),[63,63,59,57]);
assert.equal(P.pinballFlippers({left:0,right:0,level:6})[0].length,57);assert.equal(P.pinballFlippers({left:0,right:0})[0].length,63,'default stays 63');
same([1,2,3,4,5,6].map(l=>P.pinballBallSaveTime(l)),[5,4,3,2.5,2,1.5]);
{const s=P.beginPinballRun(P.createPinballState(),{level:5});P.launchPinball(s);assert.equal(s.rush,25);assert.equal(s.mbAuto,false);
 Object.assign(s.ball,{x:40,y:200,vx:0,vy:0});advance(s,.5);s.possession=-1;assert.ok(s.rush<25&&s.rush>24);assert.ok(s.table.coneSpin>0,'rondo cones turn in the hard tier');
 const before=s.score;goal(s);assert.equal(s.lastRush,true);assert.ok(s.lastGoalPoints>=500+M.RUSH_BONUS+800,'rush bonus + the High Press challenge');assert.equal(s.table.stars[4]&2,2);assert.ok(s.score>before);}
{const s=P.beginPinballRun(P.createPinballState(),{level:5});P.launchPinball(s);s.rush=0;goal(s);assert.equal(s.lastRush,false);assert.equal(s.lastChallengeBonus,0,'no rush, no challenge');}
{const s=P.createPinballState();P.launchPinball(s);advance(s,1);assert.equal(s.table.coneSpin,0,'normal divisions keep the cones still');assert.equal(s.rush,0);}
{const s=P.beginPinballRun(P.createPinballState(),{level:6});P.launchPinball(s);assert.equal(s.mbAuto,true);Object.assign(s.ball,{x:200,y:300,vx:0,vy:0});advance(s,.02);assert.equal(s.extraLive,true,'Champions Night kicks off 2v1');
 // Sweeper-keeper blocks a shot on his line.
 s.extraLive=false;s.keeper2=230;Object.assign(s.ball,{x:230,y:150,vx:0,vy:-500});const k=s.sfx.sweeper;advance(s,.08);assert.ok(s.sfx.sweeper>k,'sweeper saves');assert.ok(s.ball.vy>0,'ball comes back out');}
{const s=P.createPinballState();P.launchPinball(s);s.keeper2=230;Object.assign(s.ball,{x:230,y:150,vx:0,vy:-500});advance(s,.06);assert.equal(s.sfx.sweeper,0,'no sweeper below division 6');}
{const s=P.beginPinballRun(P.createPinballState(),{level:6});P.launchPinball(s);s.extraLive=true;s.mbAuto=false;s.phase='playing';Object.assign(s.ball,{x:180,y:49,vx:0,vy:-400});advance(s,.05);assert.equal(s.lastChallengeBonus,1000,'Champions Night challenge: a 2v1 goal');}

// 3. Kid helpers: longer save for beginners in the first two divisions only; optional nudge.
{const s=P.beginPinballRun(P.createPinballState(),{level:1,beginner:true});P.launchPinball(s);assert.equal(s.launchGrace,8);
 const t=P.beginPinballRun(P.createPinballState(),{level:3,beginner:true});P.launchPinball(t);assert.equal(t.launchGrace,3,'no beginner bonus from Play the Angles');}
{const s=P.beginPinballRun(P.createPinballState(),{nudge:false});P.launchPinball(s);Object.assign(s.ball,{x:180,y:400,vx:0,vy:200});assert.equal(P.nudgePinball(s),false,'nudge switched off');
 const t=P.beginPinballRun(P.createPinballState(),{});P.launchPinball(t);Object.assign(t.ball,{x:180,y:400,vx:0,vy:200});assert.equal(P.nudgePinball(t),true,'nudge on by default');}

// 4. Hot zone ("find the space") and hype.
{const s=P.createPinballState();P.launchPinball(s);s.hot.wait=0;Object.assign(s.ball,{x:30,y:200,vx:0,vy:0});advance(s,.02);assert.ok(s.hot.time>0,'a zone lights');
 const spot=M.HOT_SPOTS[s.hot.i],before=s.score;Object.assign(s.ball,{x:spot.x,y:spot.y,vx:0,vy:0});advance(s,.01);assert.equal(s.sfx.hot,1);assert.equal(s.cue,'hotZone');assert.ok(s.score-before>=M.HOT_POINTS);assert.ok(s.hype>.3);
 advance(s,10);assert.ok(s.hype<.3,'hype drains');}
{const s=P.createPinballState();s.combination=4;M.hypeStrike(s);assert.ok(s.hype>=.3,'combos wake the table');}

// 5. Stars: old 4-entry saves load padded and merge; nothing is lost.
store.set('fi2-pinball-stars-v1',JSON.stringify([7,3,1,1]));same(Tb.loadPinballStars(),[7,3,1,1,0,0]);
same(Tb.savePinballStars([0,0,0,0,2,1]),[7,3,1,1,2,1]);same(JSON.parse(store.get('fi2-pinball-stars-v1')),[7,3,1,1,2,1]);
store.set('fi2-pinball-stars-v1','garbage');same(Tb.loadPinballStars(),[0,0,0,0,0,0]);

// 6. Cinematic beats: caps, skip, reduced motion, envelope, time scale.
{const c=Ci.createPinballCinema(false),s=P.createPinballState();s.phase='playing';
 assert.ok(Ci.triggerCinema(c,'keeper',180,83));assert.equal(Ci.triggerCinema(c,'drain',180,500),false,'one beat at a time');
 const scales=[];for(let i=0;i<50;i++){Ci.stepPinballCinema(c,1/60,s);scales.push(Ci.cinemaTimeScale(c));}
 assert.ok(Math.min(...scales)>=.4-1e-9&&Math.min(...scales)<.45,'slows to .4x');assert.equal(scales.at(-1),1,'back to 1x when it ends');assert.equal(Ci.cinemaActive(c),false);
 assert.equal(Ci.triggerCinema(c,'drain',180,500),false,'slow-mo at most once per 6 s');
 for(let i=0;i<6*60;i++)Ci.stepPinballCinema(c,1/60,s);assert.ok(Ci.triggerCinema(c,'drain',180,500));
 Ci.stepPinballCinema(c,.05,s);assert.ok(Ci.cinemaTimeScale(c)<1);Ci.skipCinema(c);assert.equal(Ci.cinemaTimeScale(c),1,'a flipper press ends the slow-mo at once');
 for(let i=0;i<30;i++)Ci.stepPinballCinema(c,1/60,s);assert.equal(Ci.cinemaActive(c),false,'the camera eases back after a skip');
 assert.ok(Ci.triggerCinema(c,'goal',180,60),'camera-only beats have their own (shorter) gap');assert.equal(Ci.cinemaTimeScale(c),1,'goal replay push never slows the sim');}
{const c=Ci.createPinballCinema(true);for(const k of Object.keys(Ci.CINEMA_BEATS))assert.equal(Ci.triggerCinema(c,k,180,300),false,'reduced motion: no beats');}
for(const [k,b] of Object.entries(Ci.CINEMA_BEATS)){assert.ok(b.dur<=1.6&&b.k<=.34,`${k} is short and gentle`);assert.ok(b.slow>=.3,`${k} never slower than .3x`);}
// Watcher: a charged launch, a tip near miss and a shot on goal start the right beats.
{const c=Ci.createPinballCinema(false),s=P.createPinballState();s.plunger=1;P.launchPinball(s,1);Ci.watchPinballCinema(c,s);assert.equal(c.kind,'launch');}
{const c=Ci.createPinballCinema(false),s=P.createPinballState();P.launchPinball(s);Ci.watchPinballCinema(c,s);s.sfx.tip++;Ci.watchPinballCinema(c,s);assert.equal(c.kind,'drain');}
{const c=Ci.createPinballCinema(false),s=P.createPinballState();P.launchPinball(s);Object.assign(s.ball,{x:150,y:180,vx:0,vy:-600});Ci.watchPinballCinema(c,s);assert.equal(c.kind,'keeper');}
// Sim: a resting flipper tip clipped by a falling ball counts as a near miss.
{const s=P.createPinballState();P.launchPinball(s);const f=P.pinballFlippers(s)[0],tx=f.x+Math.cos(f.angle)*f.length,ty=f.y+Math.sin(f.angle)*f.length;Object.assign(s.ball,{x:tx+2,y:ty-12,vx:0,vy:300});advance(s,.1);assert.ok(s.sfx.tip>=1,'tip near miss detected');}
// No allocation in the per-frame cinema path.
{const src=fs.readFileSync('lib/games/soccerPinballCinema.ts','utf8'),body=src.slice(src.indexOf('export function skipCinema'));assert.doesNotMatch(body,/new |\.clone\(|\{\.\.\.|\[\]|=>\s*\(\{/,'cinema per-frame path allocates nothing');}
{const src=fs.readFileSync('lib/games/soccerPinballHype.ts','utf8'),body=src.slice(src.indexOf(' function update('));assert.doesNotMatch(body,/new |\.clone\(|\{\.\.\.|\[\]/,'hype update allocates nothing');}

// 7. Camera + beat: the push lands, the ball stays above the pads, then it returns home.
{const [w,h]=[390,844],camera=new T.PerspectiveCamera(38,w/h,.1,180),cam=Cam.createPinballCamera(camera,true,false);cam.fit(w,h);const layout=Cam.pinballCameraLayout(w,h,true),v=new T.Vector3();
 const s=P.createPinballState();s.phase='playing';Object.assign(s.ball,{x:150,y:540,vx:0,vy:300});const c=Ci.createPinballCinema(false);cam.snap(s);const k0=cam.info().k;
 Ci.triggerCinema(c,'drain',150,540);let peak=0,saw=false;for(let i=0;i<30;i++){Ci.stepPinballCinema(c,1/60,s);cam.update(1/60,s,c);peak=Math.max(peak,cam.info().k);saw=saw||cam.shot()==='cinema';v.set((s.ball.x-180)/30,.25,(s.ball.y-310)/30).project(camera);assert.ok((1-v.y)/2*h<=layout.safeBottom+2,'ball stays above the pads');}
 assert.ok(peak>k0+.05,'beat pushes in');assert.ok(saw,'shot reports the beat');for(let i=0;i<120;i++){Ci.stepPinballCinema(c,1/60,s);cam.update(1/60,s,c);}assert.notEqual(cam.shot(),'cinema','and settles back');}
{const camera=new T.PerspectiveCamera(38,390/844,.1,180),cam=Cam.createPinballCamera(camera,true,true);cam.fit(390,844);const s=P.createPinballState();s.phase='playing';const c=Ci.createPinballCinema(false);Ci.triggerCinema(c,'keeper',180,83);cam.snap(s);const before=camera.position.clone();for(let i=0;i<20;i++){Ci.stepPinballCinema(c,1/60,s);cam.update(1/60,s,c);}assert.ok(camera.position.distanceTo(before)<1e-6,'reduced-motion camera ignores beats');}

// 8. Start card + wiring (source checks; the browser half is scripts/qa-pinball-r3-browser.cjs).
{const card=fs.readFileSync('components/games/PinballCard.tsx','utf8'),css=fs.readFileSync('components/games/PinballCard.module.css','utf8'),tsx=fs.readFileSync('components/games/ArcadeGame3D.tsx','utf8'),games=fs.readFileSync('lib/arcade/arcadeGames.ts','utf8');
 assert.equal((card.match(/className=\{styles\.play\}/g)||[]).length,1,'one primary button');
 assert.match(card,/role="radiogroup" aria-label="Start division"/);assert.match(card,/PINBALL_DIVISIONS\.map/);assert.match(card,/aria-label="Options"/);assert.match(card,/Nudge button/);
 assert.match(card,/fi2-pinball-tutorial-v1/);assert.match(css,/\.ladder button\{[^}]*min-height:56px/);assert.match(css,/\.play\{[^}]*min-height:80px/);assert.match(css,/\.row button\{[^}]*width:52px;height:52px/);
 assert.match(tsx,/\{card&&!\(phase==='paused'&&!error\)&&<div className=\{styles\.overlay\}>\{kind==='runner'&&!error\?<RunnerMenu [\s\S]*?:kind==='tennis'&&!error\?<TennisCard [\s\S]*?\/>:kind==='pinball'&&!error\?<PinballCard /,'pinball gets its own card in the card chain; tennis and runner keep theirs');
 assert.match(tsx,/beginPinballRun\(game\.current\.state\.pinball,\{level:pinballSetup\.current\?\.level/);assert.match(tsx,/pinballUnlockReach\(runtime\.state\.pinball\)/);
 assert.match(games,/dt\*pinballTimeScale\(pinballFeel\)\*cinemaTimeScale\(pinballCine\)/,'slow-mo applied to the pinball sim only');
 assert.match(games,/if\(input\.left\|\|input\.right\)skipCinema\(pinballCine\)/,'held flippers skip the slow-mo');assert.match(games,/if\(id===0\|\|id===1\)\{skipCinema\(pinballCine\)/,'taps skip it too');}
console.log('PASS pinball r3: 6-division ladder + unlocks, hard modifiers (flippers, rush, rondo cones, sweeper, 2v1), kid helpers, hot zone + hype, star migration, cinematic beats (caps/skip/reduced/no alloc), camera blend, start card');
