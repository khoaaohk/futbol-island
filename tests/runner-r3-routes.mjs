// Breakaway Run round 3 (Oct 26 2026): route ladder, height field, terrain table, boss keeper finish,
// forgiveness windows, hard modifiers, stars/unlocks and the cinematic beat helper.
import '../scripts/register-local-ts.mjs';
import assert from 'node:assert/strict';
const Route=await import('../components/games/runnerRoute.ts');
const R=await import('../lib/arcade/runnerGame.ts');
const Mo=await import('../lib/arcade/runnerModes.ts');
const C=await import('../lib/arcade/runnerCinema.ts');
const H=await import('../lib/arcade/runnerHud.ts');
const fs=await import('node:fs');
const {routeHeight,routeGrade,routeGradeChange,terrainAt,terrainFeel,TERRAINS,TERRAIN_IDS,TERRAIN_ZONE,TERRAIN_BLEND,ROUTE_RISE_CAP,routeSegmentAt}=Route;
const {createRunnerGame,tickRunner,runnerJump,runnerSlide,runnerShoot,runnerOver,runnerOutro,RUNNER_BOSS_KEEPER,JUMP_V}={...R,JUMP_V:15};
const {RUNNER_MODES,RUNNER_MODE_ORDER,selectRunnerMode,applyRunnerRoute,runnerRunStars,recordRunnerStars,resetRunnerRoutes,readRunnerRoutes,isRunnerModeOpen,defaultRunnerMode}=Mo;
const game=(mode,extra={})=>{selectRunnerMode(mode);const s=createRunnerGame();Object.assign(s,extra);return s;};
const run=(s,seconds,hz=60,each)=>{for(let i=0;i<seconds*hz;i++){each?.(s,i);tickRunner(s,1/hz);}};
const def=(role,z,lane=0,extra={})=>({kind:'defender',lane,z,role,passed:false,openLane:0,...extra});

// 1. Height field: one continuous function of route position, its slope is the grade, slopes are capped, and
//    hard routes are clearly steeper. Finite routes end on a climb to a flat goal line.
const peakGrade=(from,to)=>{let g=0;for(let s=from;s<to;s+=1)g=Math.max(g,Math.abs(routeGrade(s)));return g;};
const peaks={};
for(const id of RUNNER_MODE_ORDER){applyRunnerRoute(id);const end=RUNNER_MODES[id].finish||2400;let prev=routeHeight(0),lo=0,hi=0;
 for(let s=.5;s<end+60;s+=.5){const h=routeHeight(s);assert(Math.abs(h-prev)<.15,`${id}: height continuous at ${s}`);
  const mid=routeGrade(s-.25);assert(Math.abs((h-prev)/.5-mid)<.02,`${id}: grade is the slope of the height at ${s}`);prev=h;lo=Math.min(lo,h);hi=Math.max(hi,h);}
 const g=peakGrade(0,end);peaks[id]=g;assert(g<=ROUTE_RISE_CAP*1.5/60+1e-9&&g<.22,`${id}: grade capped (${g.toFixed(3)})`);
 assert(hi-lo>6,`${id}: real hills and valleys (${(hi-lo).toFixed(1)} m of relief)`);
 for(let s=0;s<30;s++)assert.equal(routeGrade(s),0,`${id}: flat kick-off`);
 if(RUNNER_MODES[id].finish){const f=RUNNER_MODES[id].finish;let climb=0;for(let s=f-170;s<f-40;s++)if(routeGrade(s)>.02)climb++;
  assert(climb>80,`${id}: a final hill to the goal line (${climb} m climbing)`);assert(Math.abs(routeGrade(f))<.03,`${id}: the goal line itself is level`);}}
const mean=id=>{applyRunnerRoute(id);let a=0;for(let s=0;s<1200;s++)a+=Math.abs(routeGrade(s));return a/1200;};const means={warmup:mean('warmup'),classic:mean('classic'),night:mean('night'),storm:mean('storm')};
assert(means.night>means.classic*1.2&&means.storm>means.night*1.1,'hard routes have steeper hills: '+JSON.stringify(means));assert(peaks.storm>=peaks.classic);
assert(peaks.warmup<peaks.classic,'the Warm-up is gentler');
// Crest change sign: negative over a crest.
applyRunnerRoute('classic');{let crest=0;for(let s=200;s<2000;s++){if(routeGrade(s)>0&&routeGrade(s+1)<=0){crest=s;break;}}assert(crest&&routeGradeChange(crest)<0,'crests are detected');}

// 2. Terrain table: every route uses known terrains, surface feel stays fair, and blends across zone changes.
for(const id of TERRAIN_IDS){const t=TERRAINS[id];assert(t.speed>=.92&&t.speed<=1.05,`${id}: speed within fair band`);assert(t.grip>=.82&&t.grip<=1,`${id}: grip within fair band`);assert(/^#[0-9a-f]{6}$/i.test(t.road)&&t.name&&t.tip,`${id}: look + tip`);}
for(const id of RUNNER_MODE_ORDER){applyRunnerRoute(id);const m=RUNNER_MODES[id];assert(m.terrains.every(t=>TERRAIN_IDS.includes(t)));assert(new Set(m.terrains).size>=2,`${id}: at least two terrain types`);
 const seen=new Set();const f={speed:1,grip:1};let prev=terrainFeel(0,{...f}).speed;
 for(let s=0;s<(m.finish||1500);s+=.5){seen.add(terrainAt(s));const v=terrainFeel(s,f).speed;assert(Math.abs(v-prev)<.01,`${id}: surface feel blends at ${s}`);prev=v;}
 assert(seen.size>=Math.min(3,new Set(m.terrains).size),`${id}: the route visits several terrains`);}
assert.equal(TERRAIN_ZONE,240);assert(TERRAIN_BLEND>=10);

// 3. Route ladder: lives, pace, start stage and modifiers per route; the classic route keeps its rules.
{const w=game('warmup'),c=game('classic'),n=game('night'),st=game('storm');
 assert.equal(w.lives,5);assert.equal(w.maxLives,5);assert(w.paceMul<1&&w.gapMul>1,'Warm-up is slower with more space');
 assert.equal(c.lives,3);assert.equal(c.paceMul,1);assert.equal(c.finish,0);assert.equal(c.seed,47,'classic keeps its authored seed');
 assert.equal(n.level,3);assert.equal(st.level,4);assert(n.paceMul>1&&st.paceMul>n.paceMul&&st.gapMul<n.gapMul&&n.gapMul<1,'hard routes are faster and tighter');
 assert(n.moving>0&&n.doubleJump&&n.hazards&&n.bossKeeper&&!n.combos&&st.combos,'hard modifiers');
 assert.match(H.runnerHud(w).detail,/♥♥♥♥♥/,'five hearts on the Warm-up');assert.match(H.runnerHud(n).detail,/\/1500 m/,'route progress on finite routes');}

// 4. Gentle refills: a goal after a lost chance wins a heart back on the Warm-up (every 3 goals on the classic run).
{const s=game('warmup',{spawn:99,nextGoal:1e6,lives:4,refillCount:0});s.objects=[{kind:'goal',lane:0,z:-14,passed:false,openLane:0}];runnerShoot(s);run(s,1);
 assert.equal(s.goals,1);assert.equal(s.lives,5,'heart back after one goal');assert.equal(s.heartsBack,1);
 const c=game('classic',{spawn:99,nextGoal:1e6,lives:2});for(let g=0;g<3;g++){c.objects=[{kind:'goal',lane:0,z:-14,passed:false,openLane:0}];c.shotCooldown=0;c.balls=1;runnerShoot(c);run(c,1);}
 assert.equal(c.goals,3);assert.equal(c.lives,3,'classic: three goals win one heart back');}

// 5. Forgiveness: a late jump (coyote time) and a lane cut already on its way out still beat the tackle.
{const s=game('classic',{spawn:99,nextGoal:1e6});s.objects=[def('jockey',-.3,0,{read:1,aim:0,tackle:.1})];runnerJump(s);tickRunner(s,1/60);run(s,.6);
 assert.equal(s.lives,3,'a jump pressed at the moment of contact still clears it');
 const g=game('classic',{spawn:99,nextGoal:1e6});g.objects=[def('jockey',-.5,0,{read:1,aim:0})];g.lane=1;g.cutAge=0;g.prevLane=1;run(g,.6);
 assert.equal(g.lives,3,'a lane cut on its way out counts');assert(g.graceSaves+g.nearMisses>=1);
 const late=game('classic',{spawn:99,nextGoal:1e6});late.objects=[def('jockey',-.3,0,{read:1,aim:0,tackle:.1})];run(late,.6);assert.equal(late.lives,2,'no input still loses the chance');}

// 6. Double jump (hard routes only), big air downhill.
{const n=game('night',{spawn:99,nextGoal:1e6});runnerJump(n);run(n,.15);const vy=n.vy;runnerJump(n);assert(n.vy>vy&&n.doubleJumps===1,'double jump in the air');runnerJump(n);assert.equal(n.doubleJumps,1,'only one double jump');
 const c=game('classic',{spawn:99,nextGoal:1e6});runnerJump(c);run(c,.15);runnerJump(c);assert.equal(c.doubleJumps,0);assert.equal(c.queuedMove,'jump','classic keeps the landing buffer');
 applyRunnerRoute('storm');let down=0;for(let d=300;d<1600;d++)if(routeGrade(d)<-.1){down=d;break;}assert(down,'storm has steep descents');
 const d=game('storm',{spawn:99,nextGoal:1e6,distance:down});tickRunner(d,1/60);runnerJump(d);assert(d.vy>15*1.12,'bigger jump downhill');}

// 7. Storm gauntlet: jump the slide tackles, then slide under the line. Both answers work; standing still does not.
{const make=()=>{const s=game('storm',{nextGoal:1e6,wave:3,spawn:0});s.objects=[];tickRunner(s,1/60);return s;};
 const s=make();const t=s.objects.filter(o=>o.gauntlet);assert.equal(t.length,6,'two full lines');assert(t.slice(0,3).every(o=>o.role==='tackler')&&t.slice(3).every(o=>o.role==='jockey'));
 s.lives=3;s.spawn=99;let jumped=false,slid=false;run(s,6,60,g=>{const near=g.objects.find(o=>o.gauntlet&&!o.passed);if(!near)return;const ct=-near.z/g.speed;
  if(near.role==='tackler'&&!jumped&&ct<.25){runnerJump(g);jumped=true;}if(near.role==='jockey'&&!slid&&!g.jumping&&ct<.3){runnerSlide(g);slid=true;}});
 assert(jumped&&slid);assert.equal(s.lives,3,'jump then slide clears the gauntlet');
 const idle=make();idle.spawn=99;run(idle,6);assert(idle.lives<3,'the gauntlet needs an answer');}

// 8. Drifting defenders sway, then SET at least 26 m out and keep that lane; hard routes only.
{const s=game('night',{nextGoal:1e6});s.objects=[];let drifters=0;for(let i=0;i<12;i++){s.spawn=0;tickRunner(s,1/60);}drifters=s.objects.filter(o=>o.drift!==undefined).length;assert(drifters>0,'night spawns drifting defenders');
 const c=game('classic',{nextGoal:1e6});for(let i=0;i<12;i++){c.spawn=0;tickRunner(c,1/60);}assert.equal(c.objects.filter(o=>o.drift!==undefined).length,0,'classic has none');
 const d=game('night',{spawn:99,nextGoal:1e6,lives:1e6});d.objects=[def('jockey',-60,0,{drift:1,driftEnd:1,driftClock:0})];let setZ=null;
 run(d,3,60,g=>{const o=g.objects[0];if(o&&o.drift===undefined&&setZ===null)setZ=o.z;});assert(setZ!==null&&setZ<=-25&&setZ>=-27.5,`sets at ${setZ}`);}

// 9. Magnet power-up and rolling balls.
{const s=game('classic',{spawn:99,nextGoal:1e6});s.objects=[{kind:'magnet',lane:0,z:-.4,passed:false,openLane:0},{kind:'coin',lane:1,z:-12,passed:false,openLane:0}];run(s,1.2);
 assert.equal(s.magnets,1);assert.equal(s.collected,1,'the magnet pulls a side-lane ball in');
 const r=game('night',{spawn:99,nextGoal:1e6});r.objects=[{kind:'roller',lane:0,z:-6,x:-2.2,roll:5.2,passed:false,openLane:0}];run(r,.2);runnerJump(r);run(r,1);assert.equal(r.rollersJumped,1,'jump the loose ball');
 const t=game('night',{spawn:99,nextGoal:1e6,balls:2});t.objects=[{kind:'roller',lane:0,z:-6,x:-2.2,roll:5.2,passed:false,openLane:0}];run(t,1.2);assert.equal(t.balls,1,'a loose ball trips you (a ball, never a heart)');assert.equal(t.lives,3);}

// 10. Goal-line finish: final hill (balls refilled, nothing spawns), boss keeper, three tries, then full time.
{const s=game('night',{lives:1e6});s.distance=s.finish-205;s.balls=0;run(s,1);assert.equal(s.finishPhase,'hill');assert(s.balls>=3,'balls refilled for the final hill');
 const before=s.objects.filter(o=>o.kind==='defender'&&!o.passed).length;for(let i=0;i<60*15&&s.finishPhase!=='keeper';i++)tickRunner(s,1/60);assert.equal(s.finishPhase,'keeper');
 assert(s.objects.filter(o=>o.kind==='defender'&&!o.passed).length<=before,'no new defenders on the final hill');
 const goal=s.objects.find(o=>o.kind==='goal'&&o.final);assert(goal&&goal.keeper,'boss keeper on the goal line');
 // Wait until the keeper is far from the runner's lane, shoot to the open side.
 let shot=false;run(s,6,60,g=>{const o=g.objects.find(o=>o.kind==='goal'&&o.final&&!o.passed);if(!o||shot)return;if(o.z>-20&&o.z<-10&&Math.abs((o.kx??0)-g.x)>2.4){runnerShoot(g);shot=true;}else if(o.z>-22)g.lane=(o.kx??0)>0?-1:1;});
 assert(s.won,'beat the boss keeper');run(s,3);assert(s.finished);for(let i=0;i<200;i++)runnerOutro(s,1/60);assert(runnerOver(s),'full time after the finish beat');
 assert.deepEqual(runnerRunStars(s),[true,true,false],'finish + boss (hearts lost via test lives)');
 const miss=game('storm',{lives:1e6});miss.distance=miss.finish-205;run(miss,40,30,g=>{g.balls=0;});assert(miss.finished&&!miss.won,'three misses still finish the route');assert.equal(miss.bossTries,RUNNER_BOSS_KEEPER.tries);
 const w=game('warmup',{lives:5});w.distance=w.finish-62;run(w,.2);const wg=w.objects.find(o=>o.kind==='goal'&&o.final);assert(wg&&!wg.keeper&&wg.openLane===0,'Warm-up ends with an open goal, centre lane');}

// 11. Seeded per-run shuffle is deterministic; classic order is untouched.
{const lanes=seed=>{const s=game('storm',{nextGoal:1e6,seed,lives:1e6});const out=[];for(let i=0;i<14;i++){s.spawn=0;s.objects=[];tickRunner(s,1/60);out.push(s.readLane);}return out.join();};
 assert.equal(lanes(101),lanes(101));assert.notEqual(lanes(101),lanes(202),'different runs shuffle differently');}

// 12. Stars and unlocks: own storage key, existing players keep access, the ladder opens with stars.
{resetRunnerRoutes({v:1,mode:'warmup',stars:{warmup:0,classic:0,night:0,storm:0},played:0});
 assert(!isRunnerModeOpen('night',1)&&isRunnerModeOpen('night',3),'night: locked for new players, open for stage-3 records');assert(!isRunnerModeOpen('storm',6));
 assert.equal(defaultRunnerMode(false),'warmup','first-timers start on the Warm-up');assert.equal(defaultRunnerMode(true),'classic','existing players keep the classic run');
 const r=recordRunnerStars({mode:'warmup',finished:true,won:true,goals:2,level:3,hits:0,lives:5});assert.equal(r.count,3);assert(isRunnerModeOpen('night',1),'two stars open Night Derby');
 recordRunnerStars({mode:'night',finished:true,won:true,goals:1,level:6,hits:1,lives:2});assert.equal(readRunnerRoutes().stars.night,2);assert(isRunnerModeOpen('storm',1),'two night stars open the Storm Final');
 recordRunnerStars({mode:'night',finished:false,won:false,goals:0,level:3,hits:3,lives:0});assert.equal(readRunnerRoutes().stars.night,2,'a worse run never lowers stars');
 assert.deepEqual(runnerRunStars({mode:'classic',finished:false,won:false,goals:5,level:6,hits:2,lives:0}),[true,true,true]);}

// 13. Cinematic beats: slow only after the input resolved, capped length, one slow per 6 s, tap to skip, reduced = off.
{const c=C.createRunnerCinema(false);assert(c.trigger('dodge'));let min=1;for(let t=0;t<1.5;t+=1/60){c.step(1/60);min=Math.min(min,c.timeScale());}
 assert(Math.abs(min-C.CINEMA_BEATS.dodge.slow)<.02,'dodge slows to .45');assert.equal(c.timeScale(),1,'back to full speed');assert(!c.active());
 c.trigger('hurdle');c.step(.2);assert.equal(c.timeScale(),1,'a second slow beat inside 6 s plays at full speed');assert(c.zoom()>0,'but keeps its camera move');
 for(let t=0;t<7;t+=.1)c.step(.1);c.trigger('hurdle');c.step(.1);assert(c.timeScale()<.6,'slow allowed again after 6 s');c.skip();c.step(C.CINEMA.skipRamp+.01);assert.equal(c.timeScale(),1,'tap to skip');
 for(const [k,b] of Object.entries(C.CINEMA_BEATS)){assert(b.slow>=C.CINEMA.minSlow,`${k}: slow floor`);assert(b.zoom<=1);}
 const long=C.createRunnerCinema(false);long.trigger('duel');let t=0;while(long.active()&&t<5){long.step(1/60);t+=1/60;}assert(t<=C.CINEMA.maxBeat+.05,`beats are capped (${t.toFixed(2)} s)`);
 const r=C.createRunnerCinema(true);assert.equal(r.trigger('duel'),false);r.step(.1);assert.equal(r.timeScale(),1);assert.equal(r.zoom(),0,'reduced motion: no slow-mo, no zoom');
 assert(C.CINEMA.maxFov<=.12,'FOV change <= 12 %');}

// 14. Long hard runs stay bounded and reach the goal line (lives pinned high: a wiring check, not a skill check).
for(const id of ['night','storm','warmup']){const s=game(id,{lives:1e6});let most=0;for(let i=0;i<60*240&&!s.finished;i++){if(i%40===0)runnerShoot(s);tickRunner(s,1/60);most=Math.max(most,s.objects.length);}
 assert(s.finished,`${id}: the route reaches full time`);assert(most<34,`${id}: bounded objects (${most})`);assert(s.terrainChanges>=2,`${id}: terrain zones change along the route`);}

// 15. Source contract: kid pad sizes, the menu replaces the shared card for the runner, no per-frame allocation hints.
{const css=fs.readFileSync('components/games/RunnerControls.module.css','utf8');for(const [cls,px] of [['lane',72],['jump',64],['slide',64],['skill',64],['shoot',88]])assert(new RegExp(`\\.${cls}\\.${cls}\\{[^}]*width:${px}px`).test(css),`${cls} is ${px}px`);
 assert(/touch-action:none/.test(css));const g=fs.readFileSync('components/games/ArcadeGame3D.tsx','utf8');assert(/<RunnerControls /.test(g)&&/<RunnerMenu /.test(g));
 const menu=fs.readFileSync('components/games/RunnerMenu.module.css','utf8');assert(/\.play\{[^}]*min-height:64px/.test(menu)&&/\.small\{[^}]*min-height:52px/.test(menu)&&/\.route\{[^}]*min-height:60px/.test(menu));
 const scen=fs.readFileSync('lib/arcade/runnerScenery.ts','utf8');const upd=scen.slice(scen.indexOf('function update('),scen.indexOf('function reset('));assert(!/new T\.|`/.test(upd),'scenery update allocates nothing');
 const cin=fs.readFileSync('lib/arcade/runnerCinema.ts','utf8');assert(!/new |\[\]|\{\}/.test(cin.slice(cin.indexOf('function step('),cin.indexOf('function reset('))),'cinema step allocates nothing');}
selectRunnerMode('classic');
console.log('PASS runner r3 routes: height field, terrain table, route ladder, refills, coyote/lane grace, double jump, gauntlet, drifting defenders, magnet, rollers, boss keeper finish, seeded shuffle, stars/unlocks, cinematic beats, kid pad');
