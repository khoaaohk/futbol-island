// Pass Puzzles round 3 (Oct 26 2026): the Expert tier, its unlock rules and dailies, the cinematic-beat helper,
// and the in-game wiring (Undo, clock, hint nudge, replay speed, intro tour, skip). Run: node tests/pass-puzzle-r3-expert.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,f);
const lib=f=>require(path.join(__dirname,'..','lib','passPuzzle',f));
const P=lib('index.ts'),{isCall,EXTRA_PACKS}=lib('packs.ts'),{youthScenario}=lib('youth.ts'),C=lib('catalog.ts'),D=lib('daily.ts'),X=lib('expert.ts'),{DIFFICULTY}=lib('curve.ts'),CI=lib('cinematic.ts');

function strokeFor(w,k,{dx=0,dz=0}={}){const s=w.state,b=s.ball.p,g=w.scenario.pitch,goalZ=g.length/2,hg=g.goalWidth/2-0.25;let end;
 if(k.kind==='shot')end={x:Math.max(-hg,Math.min(hg,k.target.x+dx)),z:goalZ+2};else if((k.kind==='pass-feet'||k.kind==='header')&&k.receiver!=null){const a=s.attackers[k.receiver].p;end={x:a.x+dx,z:a.z+dz};}else end={x:k.target.x+dx,z:k.target.z+dz};
 const DX=end.x-b.x,DZ=end.z-b.z,L=Math.hypot(DX,DZ),nx=DZ/L,nz=-DX/L,bow=k.curl?Math.sign(k.curl)*(Math.abs(k.curl)*0.22*L+0.4):0,loft=k.loft>0?Math.min(1,Math.max(0.16,k.loft)):0,hold=loft>0?0.25+(loft-0.15)*0.45/0.85+0.002:0;
 const pts=[],n=Math.max(3,Math.min(24,Math.floor(L/0.5)));for(let i=0;i<=n;i++){const u=i/n,o=Math.sin(Math.PI*u)*bow;pts.push({x:b.x+DX*u+nx*o,z:b.z+DZ*u+nz*o,t:u*.4});}
 if(hold>0){for(let t=0.05;t<hold;t+=0.05)pts.push({x:end.x+0.02,z:end.z,t:.4+t});pts.push({x:end.x,z:end.z,t:.4+hold});}return pts;}
function play(sc,route,slop={}){const w=P.createPuzzle(sc),ev=[];w.on(e=>ev.push(e));let i=0;
 for(let g=0;g<120*40;g++){const ph=w.state.phase;if(ph==='success'||ph==='fail')break;
  if(ph==='aiming'){if(i>=route.length)break;const st=route[i++];if(isCall(st)){assert(w.callRun(st.call.attacker,st.call.to));continue;}const k=P.readStroke(strokeFor(w,st,slop),w);if(st.kind!=='pass-space')assert.equal(k.kind,st.kind,sc.id+' draws as '+st.kind);assert(w.kick(k));}
  w.step(1/120);}return{w,ev};}

/* 1. packs, ladder and unlock rules (extend the old ones; old ids untouched) */
assert.equal(X.EXPERT_PACKS.length,2);const gates=X.EXPERT_PACKS.map(p=>p.gate);
const coreMax=Math.max(...C.ALL_PACKS.filter(p=>p.tier!=='expert').map(p=>p.gate)),coreStars=C.ALL_SCENARIOS.filter(s=>!s.id.startsWith('ex-')).length*3;
assert(gates[0]>coreMax&&gates[1]>gates[0]&&gates[1]<=coreStars*.6,`expert gates ${gates} sit above the core gates (${coreMax}) and stay reachable from core stars (${coreStars})`);
assert.equal(C.EXPERT_GATE,gates[0]);assert(C.isExpertPack('expert-combos')&&!C.isExpertPack('first-passes'));
assert(X.EXPERT_PACKS.every(p=>p.order>Math.max(...EXTRA_PACKS.map(q=>q.order))&&p.tier==='expert'),'expert packs sit at the top of the map');
assert.deepEqual(C.MAP_ORDER.slice(-6).map(s=>s.pack),['expert-combos','expert-combos','expert-combos','expert-final','expert-final','expert-final']);
// Old save: a full core run opens Expert only by stars; nextOnMap reports the gate at the end of the core map.
const lastCore=C.MAP_ORDER.filter(s=>!s.id.startsWith('ex-')).at(-1);const nx=C.nextOnMap(lastCore.id,10);assert(nx&&'locked' in nx&&nx.locked.id==='expert-combos'&&nx.need===gates[0]-10);
assert('scenario' in C.nextOnMap(lastCore.id,gates[0]));
/* 2. copy rules + one kid-friendly idea line per new concept */
const words=s=>s.split(/\s+/).filter(x=>/[A-Za-z0-9]/.test(x)),LIM={'7v7':[12,24],'9v9':[18,30],'11v11':[22,34]};
const JARGON=/\b(goal-side|half-space|overload\w*|third[- ]man|channel|press trigger|centre-back|full-back|lay-off|recycle|point of attack|between the lines|in stride|weight)\b/i;
const known=new Set(C.ALL_SCENARIOS.filter(s=>!s.id.startsWith('ex-')).map(s=>s.title));
for(const sc of X.EXPERT_SCENARIOS){assert(!known.has(sc.title),sc.id+' unique title');assert.equal(sc.require.offside,true);assert(sc.bonus);
 for(const key of ['brief','hint'])for(const [f,[sent,tot]] of Object.entries(LIM)){const t=sc[key][f];assert(words(t).length<=tot,`${sc.id} ${key} ${f}`);for(const s of t.split(/(?<=[.!?:;])\s+/))assert(words(s).length<=sent,`${sc.id} ${key} ${f}: "${s}"`);if(f==='7v7')assert(!JARGON.test(t),sc.id+' 7v7 jargon');}
 const idea=X.EXPERT_CONCEPTS[sc.concept];assert(idea&&words(idea).length<=14&&!JARGON.test(idea),sc.id+' has a short idea line');
 assert(sc.lesson.length>=20&&sc.lesson.length<=110);
 // Hard = at least one of: 3+ passes, a moving defender (hunt/recover/trap), or the clock.
 assert(sc.require.minPasses>=3||sc.defenders.some(d=>d.hunt||d.recover||d.trap)||sc.require.clock,sc.id+' is actually hard');}
/* 3. every route solves when drawn, earns the bonus, survives a sloppy finger, replays identically; naive fails; youth mode works */
let sloppy=0;
for(const sc of X.EXPERT_SCENARIOS){const {solution,naive}=X.EXPERT_SOLUTIONS[sc.id];
 const r=play(sc,solution);assert.equal(r.w.state.phase,'success',`${sc.id}: ${JSON.stringify(r.w.state.result)}`);assert(r.w.state.result.bonus,sc.id+' bonus');
 if(sc.require.clock)assert(r.w.state.t<=sc.require.clock,sc.id+' beats the clock');
 const rp=P.replay(r.w.attemptStart(),r.w.inputs()).run();assert.deepEqual(rp.map(e=>[e.type,e.tick]),r.ev.map(e=>[e.type,e.tick]),sc.id+' replay');
 assert.notEqual(play(sc,naive).w.state.phase,'success',sc.id+' naive fails');
 let good=0;for(const s of [{dx:.4},{dx:-.4},{dz:.4},{dz:-.4}])if(play(sc,solution,s).w.state.phase==='success')good++;sloppy+=good;assert(good>=3,`${sc.id} sloppy ${good}/4`);
 assert.equal(play(youthScenario(sc),solution).w.state.phase,'success',sc.id+' youth');
 assert(Number.isFinite(DIFFICULTY[sc.id]),sc.id+' rated');}
// The ladder climbs: each expert pack in measured-difficulty order, and the tier is harder than the first packs on average.
for(const p of X.EXPERT_PACKS){const r=X.EXPERT_SCENARIOS.filter(s=>s.pack===p.id).map(s=>DIFFICULTY[s.id]);assert.deepEqual(r,[...r].sort((a,b)=>a-b),p.id+' teaching order follows difficulty');}
const avg=ids=>ids.reduce((n,id)=>n+DIFFICULTY[id],0)/ids.length;
assert(avg(X.EXPERT_SCENARIOS.map(s=>s.id))>avg(C.ALL_SCENARIOS.filter(s=>s.pack==='first-passes').map(s=>s.id))+20,'expert is clearly harder than the first pack');
/* 4. dailies: the expert pool validates every day; weekends only, and only once Expert is open */
for(let i=0;i<60;i++){const d=new Date(2026,9,1+i);const p=D.dailyPuzzle(C.EXPERT_DAILY_TEMPLATES,d);assert(p,'expert daily '+D.dateKey(d));assert(p.template.startsWith('ex-'));}
const sat=new Date(2026,9,31),mon=new Date(2026,10,2);assert(C.hardDailyDay(sat,gates[0])&&!C.hardDailyDay(sat,gates[0]-1)&&!C.hardDailyDay(mon,200));
/* 5. cinematic helper */
{const c=CI.createCinematic(false);assert.equal(c.timeScale,1);assert.equal(c.active,false);
 c.play('strike',3,4);let minScale=1,maxPush=0;const f0=c.focus;for(let i=0;i<180;i++){c.update(1/60);minScale=Math.min(minScale,c.timeScale);maxPush=Math.max(maxPush,c.push);}
 assert(minScale>=CI.MIN_SCALE&&minScale<.6,'strike slows to '+minScale);assert(maxPush>0&&maxPush<=CI.MAX_PUSH);assert.equal(c.focus,f0,'focus object reused (no allocation)');
 assert.equal(c.timeScale,1,'back to 1x');assert.equal(c.push,0,'back to wide');assert.equal(c.active,false,'sleeps');
 assert(CI.zoomFor(1)<=1.12+1e-9,'camera zoom change stays within 12%');
 // focus moves with a capped speed (no jump)
 c.play('arrive',0,0);c.update(1/60);c.follow(20,0);c.update(1/60);assert(c.focus.x<=CI.FOCUS_SPEED*1.2/60+1e-6,'capped whip');
 // skip: instant 1x and wide
 c.skip();assert.equal(c.timeScale,1);assert.equal(c.push,0);assert.equal(c.active,false);
 // the slow-mo budget per attempt: a flurry of beats cannot keep the game slow
 let slowTime=0;for(let i=0;i<20;i++){c.play('arrive',0,0);for(let k=0;k<30;k++){c.update(1/60);if(c.timeScale<.99)slowTime+=1/60;}}
 assert(slowTime<CI.SLOW_BUDGET+1.2,'slow-mo budget caps '+slowTime.toFixed(2));c.resetBudget();c.skip();
 // intro: two stops then wide, within ~2.5 s
 c.intro(0,0,5,10);let t=0;while(c.active&&t<5){c.update(1/60);t+=1/60;}assert(t>1.2&&t<3,'intro tour lasts '+t.toFixed(2));assert.equal(c.timeScale,1,'intro never slows time');
 // reduced motion: a plain cut
 const r=CI.createCinematic(true);r.play('goal',1,1);r.update(1/60);assert.equal(r.timeScale,1);assert.equal(r.push,0);r.intro(0,0,4,4);assert.equal(r.active,false);
 // every beat's hold is a hard cap under a second
 for(const [k,b] of Object.entries(CI.BEATS))assert(b.hold<=1&&b.push<=CI.MAX_PUSH&&b.slow>=CI.MIN_SCALE,k);}
/* 6. wiring in the game (source checks) */
const src=fs.readFileSync(path.join(__dirname,'..','components','games','PassPuzzleGame.tsx'),'utf8'),css=fs.readFileSync(path.join(__dirname,'..','components','games','PassPuzzleGame.module.css'),'utf8');
assert(/world\.step\(now<hitStop\.current\?0:dt\*cine\.timeScale\)/.test(src),'live sim runs at the beat time scale');
assert(/if\(cine\.active\|\|finishAt\.current\)skipCine\.current\(\)/.test(src),'any tap skips a beat');
assert(/cine\.play\('strike'/.test(src)&&/cine\.play\('arrive'/.test(src)&&/cine\.play\('goal'/.test(src)&&/cine\.play\('hint'/.test(src)&&/cine\.intro\(/.test(src),'strike, arrive, goal, hint and intro beats');
assert(/e\.type==='kick'&&!replayRef\.current\)\{arrived\.current=false;cine\.play/.test(src),'beats are live-only (replays keep their own camera)');
assert(/data-undo onClick=\{rewindPass\}/.test(src),'Undo in play');assert(/data-nudge=/.test(src)&&/ppNudge/.test(css),'hint nudge');
assert(/data-clock/.test(src)&&/\.clockChip::before\{content:'⏱ ' attr\(data-left\)\}/.test(css),'counter clock chip (no React text mutation)');
assert(/replay:v\.replay==='1x'\|\|v\.replay==='slow'\?v\.replay:undefined/.test(src),'replay speed is remembered with a safe read (old saves load unchanged)');
assert(/data-expert-tile/.test(src)&&/corePacks\.map/.test(src),'Expert sits behind one tile; the 2x5 core grid stays');
assert(/RUN_GRAB=2\.1,BALL_GRAB=2\.4/.test(src),'more forgiving grab radii');
assert(/\.undo\{[^}]*width:64px;height:64px/.test(css),'Undo is a 64px target');
assert(/@media\(prefers-reduced-motion:no-preference\)\{\.soClose/.test(css),'try-again wobble respects reduced motion');
console.log(`PASS pass-puzzle r3: ${X.EXPERT_SCENARIOS.length} expert puzzles in ${X.EXPERT_PACKS.length} packs (gates ${gates.join('/')}, sloppy ${sloppy}/${X.EXPERT_SCENARIOS.length*4}), expert dailies 60/60, cinematic helper + wiring`);
