// Pass Puzzles expansion packs + new mechanics (called runs, offside trap, hunter, recovering defenders,
// sweeper keeper, counter clock, wind, wet pitch). Run: node tests/pass-puzzle-packs.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,f);
const lib=f=>require(path.join(__dirname,'..','lib','passPuzzle',f));
const P=lib('index.ts'),{EXTRA_PACKS,EXTRA_SCENARIOS,EXTRA_SOLUTIONS,isCall}=lib('packs.ts'),{youthScenario}=lib('youth.ts'),{SCENARIOS}=lib('scenarios.ts'),{CHALLENGE_SCENARIOS}=lib('challenges.ts');
function strokeFor(w,k,{dx=0,dz=0}={}){const s=w.state,b=s.ball.p,g=w.scenario.pitch,goalZ=g.length/2,hg=g.goalWidth/2-0.25;let end;
 if(k.kind==='shot')end={x:Math.max(-hg,Math.min(hg,k.target.x+dx)),z:goalZ+2};else if((k.kind==='pass-feet'||k.kind==='header')&&k.receiver!=null){const a=s.attackers[k.receiver].p;end={x:a.x+dx,z:a.z+dz};}else end={x:k.target.x+dx,z:k.target.z+dz};
 const DX=end.x-b.x,DZ=end.z-b.z,L=Math.hypot(DX,DZ),nx=DZ/L,nz=-DX/L,bow=k.curl?Math.sign(k.curl)*(Math.abs(k.curl)*0.22*L+0.4):0,loft=k.loft>0?Math.min(1,Math.max(0.16,k.loft)):0,hold=loft>0?0.25+(loft-0.15)*0.45/0.85+0.002:0;
 const pts=[],n=Math.max(3,Math.min(24,Math.floor(L/0.5)));for(let i=0;i<=n;i++){const u=i/n,o=Math.sin(Math.PI*u)*bow;pts.push({x:b.x+DX*u+nx*o,z:b.z+DZ*u+nz*o,t:u*.4});}
 if(hold>0){for(let t=0.05;t<hold;t+=0.05)pts.push({x:end.x+0.02,z:end.z,t:.4+t});pts.push({x:end.x,z:end.z,t:.4+hold});}return pts;}
function play(sc,route,slop={}){const w=P.createPuzzle(sc),ev=[];w.on(e=>ev.push(e));let i=0;
 for(let g=0;g<120*40;g++){const ph=w.state.phase;if(ph==='success'||ph==='fail')break;
  if(ph==='aiming'){if(i>=route.length)break;const st=route[i++];if(isCall(st)){assert(w.callRun(st.call.attacker,st.call.to),'call accepted');continue;}const k=P.readStroke(strokeFor(w,st,slop),w);if(st.kind!=='pass-space')assert.equal(k.kind,st.kind,sc.id+' draws as '+st.kind);assert(w.kick(k));}
  w.step(1/120);}return{w,ev};}

/* 1. schema + reading level */
const LIM={'7v7':[12,24],'9v9':[18,30],'11v11':[22,34]},words=s=>s.split(/\s+/).filter(x=>/[A-Za-z0-9]/.test(x));
const JARGON=/\b(goal-side|half-space|overload\w*|third[- ]man|channel|press trigger|centre-back|full-back|lay-off|recycle|point of attack|between the lines|in stride|weight)\b/i;
const core=new Set([...SCENARIOS,...CHALLENGE_SCENARIOS].map(s=>s.id)),coreTitles=new Set([...SCENARIOS,...CHALLENGE_SCENARIOS].map(s=>s.title));
assert(EXTRA_PACKS.length>=4);for(const p of EXTRA_PACKS){const n=EXTRA_SCENARIOS.filter(s=>s.pack===p.id).length;assert(n>=2&&n<=6,p.id+' has 2–6 puzzles');assert(p.gate>0);}
for(const sc of EXTRA_SCENARIOS){assert(!core.has(sc.id)&&!coreTitles.has(sc.title),sc.id+' unique');assert(EXTRA_PACKS.some(p=>p.id===sc.pack));assert.equal(sc.require.offside,true,sc.id+' plays offside');assert(sc.bonus,sc.id+' has a mastery bonus');assert(EXTRA_SOLUTIONS[sc.id],sc.id+' has a route');
 for(const key of ['brief','hint'])for(const [f,[sent,tot]] of Object.entries(LIM)){const t=sc[key][f];assert(t&&words(t).length<=tot,`${sc.id} ${key} ${f} ${words(t).length} words`);for(const s of t.split(/(?<=[.!?:;])\s+/))assert(words(s).length<=sent,`${sc.id} ${key} ${f}: "${s}"`);if(f==='7v7')assert(!JARGON.test(t),`${sc.id} 7v7 jargon`);}
 assert(new Set(Object.values(sc.brief)).size===3&&new Set(Object.values(sc.hint)).size===3,sc.id+' three wordings');
 assert(sc.lesson.length>=20&&sc.lesson.length<=110,sc.id+' lesson');assert(!/flicco/i.test(JSON.stringify(sc)));}
/* 2. every route: solves (drawn), earns its bonus, survives a sloppy finger, replays identically; the naive option fails */
let ok=0,total=0;
for(const sc of EXTRA_SCENARIOS){const {solution,naive}=EXTRA_SOLUTIONS[sc.id];
 const r=play(sc,solution);assert.equal(r.w.state.phase,'success',`${sc.id}: ${JSON.stringify(r.w.state.result)} ${r.ev.map(e=>e.type+(e.attacker??e.defender??'')).join('>')}`);
 assert(r.w.state.result.bonus,sc.id+' the taught route earns the mastery bonus');assert(r.w.state.passes>=sc.require.minPasses);
 const rp=P.replay(r.w.attemptStart(),r.w.inputs()).run();assert.deepEqual(rp.map(e=>[e.type,e.tick]),r.ev.map(e=>[e.type,e.tick]),sc.id+' replay (with called runs)');
 if(solution.some(isCall))assert(r.w.inputs().some(i=>i.calls?.length),sc.id+' called runs are recorded with the kick');
 const n=play(sc,naive);assert.notEqual(n.w.state.phase,'success',sc.id+' naive option must fail');
 const v=[{dx:.4},{dx:-.4},{dz:.4},{dz:-.4}];let good=0;for(const s of v)if(play(sc,solution,s).w.state.phase==='success')good++;ok+=good;total+=v.length;assert(good>=v.length-1,`${sc.id} sloppy ${good}/4`);
 const y=play(youthScenario(sc),solution);assert.equal(y.w.state.phase,'success',sc.id+' also works with the no-heading rule');}
/* 3. mechanics */
const base=o=>({id:'m',pack:'t',title:'m',concept:'m',brief:{'7v7':'a','9v9':'b','11v11':'c'},hint:{'7v7':'a','9v9':'b','11v11':'c'},pitch:{halfWidth:20,length:50,goalWidth:6},carrier:0,attackers:[{x:0,z:0},{x:-6,z:4}],defenders:[{x:4,z:12}],keeper:{x:0,z:24},attempts:3,require:{minPasses:1,finish:'goal',offside:true},lesson:'mechanics test only',...o});
const pass=(x,z,o={})=>({kind:'pass-space',target:{x,z},curl:0,loft:0,power:.5,...o});
// called run: rejected for the carrier and outside aiming; moves only once the kick starts
{const w=P.createPuzzle(base({}));assert(!w.callRun(0,{x:3,z:9}),'cannot call the carrier');assert(w.callRun(1,{x:-6,z:12}));for(let i=0;i<60;i++)w.step(1/60);assert.equal(w.state.attackers[1].p.z,4,'a called run waits for the kick');
 w.kick(pass(6,6,{receiver:undefined}));for(let i=0;i<40;i++)w.step(1/60);assert(w.state.attackers[1].p.z>5,'and goes with it');assert(!w.callRun(1,{x:0,z:0}),'no calls in flight');}
// offside trap: the line steps up during the wind-up
{const sc=base({defenders:[{x:-5,z:14,trap:3},{x:5,z:14,trap:3}],attackers:[{x:0,z:0},{x:0,z:13.5}]});const w=P.createPuzzle(sc);w.state.attackers[0].facing=Math.PI*.9;
 w.kick({kind:'pass-feet',target:{x:0,z:13.5},receiver:1,curl:0,loft:0,power:.45});for(let g=0;g<1200&&!w.state.result&&w.state.phase!=='aiming';g++)w.step(1/120);
 assert.equal(w.state.result?.reason,'offside','a slow release lets the trap catch a static striker');}
// hunter: closes down the receiver during the flight
{const sc=base({defenders:[{x:4,z:2,hunt:true}],attackers:[{x:0,z:0},{x:-8,z:2}]});const w=P.createPuzzle(sc);const d0=Math.hypot(4+8,2-2);w.kick({kind:'pass-feet',target:{x:-8,z:2},receiver:1,curl:0,loft:0,power:.3});for(let g=0;g<1200&&w.state.phase!=='aiming';g++)w.step(1/120);
 const d=w.state.defenders[0].p;assert(Math.hypot(d.x+8,d.z-2)<d0-4,'the hunter chases the ball to the receiver');}
// recovering defender runs back toward goal once the move starts
{const sc=base({defenders:[{x:3,z:2,recover:true}]});const w=P.createPuzzle(sc);w.kick(pass(-6,8,{receiver:1}));for(let g=0;g<120;g++)w.step(1/120);assert(w.state.defenders[0].p.z>3.5,'recovers goal-side');}
// sweeper keeper claims a through ball 12 m out; a normal keeper does not
for(const sweeper of [true,false]){const sc=base({attackers:[{x:0,z:0},{x:-8,z:2}],defenders:[{x:-15,z:0}],keeper:{x:0,z:22,sweeper}});const pr=P.predict(P.createPuzzle(sc),pass(0,10,{power:.25}));assert.equal(pr.keeperThreat,sweeper,'sweeper reach '+sweeper+' '+JSON.stringify(pr.path.at(-1)));}
// wind moves a lofted ball but not a ground pass; a wet pitch makes a ground ball run further
{const k1=pass(0,14,{loft:.8}),k0=pass(0,14);const calm=P.createPuzzle(base({defenders:[{x:-15,z:0}]})),windy=P.createPuzzle(base({defenders:[{x:-15,z:0}],weather:{wind:{x:3,z:0}}}));
 const end=(w,k)=>{const p=P.predict(w,k).path;return p[Math.min(p.length-1,40)];};
 assert(end(windy,k1).x-end(calm,k1).x>.8,'crosswind drifts a lofted ball');assert(Math.abs(end(windy,k0).x-end(calm,k0).x)<.05,'ground passes ignore the wind');
 const dry=P.createPuzzle(base({defenders:[{x:-15,z:0}],attackers:[{x:0,z:0},{x:-15,z:-10}],keeper:undefined,require:{minPasses:1,finish:'reach-zone',zone:{x:0,z:0,r:1}}})),wet=P.createPuzzle(base({defenders:[{x:-15,z:0}],attackers:[{x:0,z:0},{x:-15,z:-10}],keeper:undefined,weather:{wet:true},require:{minPasses:1,finish:'reach-zone',zone:{x:0,z:0,r:1}}}));
 const last=(w)=>{const p=P.predict(w,pass(0,12,{receiver:undefined})).path;return p[Math.min(p.length-1,90)].z;};assert(last(wet)>last(dry)+.5,'wet pitch: the ball skids on '+last(wet)+' vs '+last(dry));}
// counter clock: too slow is a timeout
{const sc=base({require:{minPasses:1,finish:'goal',offside:true,clock:1}});const w=P.createPuzzle(sc);w.kick(pass(-6,12,{receiver:1,power:.3}));for(let g=0;g<2400&&!w.state.result;g++){w.step(1/120);if(w.state.phase==='aiming')w.kick(pass(-4,20,{receiver:1,power:.3}));}assert.equal(w.state.result.reason,'timeout');}
console.log(`PASS packs: ${EXTRA_SCENARIOS.length} puzzles in ${EXTRA_PACKS.length} packs (copy rules, routes drawn, bonuses, replay with calls, naive fails, sloppy ${ok}/${total}, youth mode) + mechanics (calls, trap, hunter, recover, sweeper, wind, wet, clock)`);
