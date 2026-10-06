// Pass Puzzles offside (Law 11): judged when the ball is played, penalised on the offside player's touch.
// Run: node tests/pass-puzzle-offside.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,f);
const P=require(path.join(__dirname,'..','lib','passPuzzle','index.ts'));
const {SCENARIOS,SCENARIO_SOLUTIONS}=require(path.join(__dirname,'..','lib','passPuzzle','scenarios.ts'));
const {CHALLENGE_SCENARIOS,CHALLENGE_SOLUTIONS}=require(path.join(__dirname,'..','lib','passPuzzle','challenges.ts'));

// A through ball: the striker runs in behind a flat back line at z 14 (second-last opponent; the keeper is last).
const through=(runnerZ,extra={})=>({id:'t-offside',pack:'t',title:'t',concept:'t',brief:{'7v7':'a','9v9':'b','11v11':'c'},hint:{'7v7':'a','9v9':'b','11v11':'c'},
 pitch:{halfWidth:25,length:60,goalWidth:7.32},carrier:0,attackers:[{x:0,z:6},{x:3,z:runnerZ,run:{delay:0,path:[{x:3,z:22}]}}],
 defenders:[{x:-6,z:14},{x:9,z:14}],keeper:{x:0,z:29},attempts:3,require:{minPasses:1,finish:'reach-zone',zone:{x:3,z:20,r:4},offside:true,...extra},lesson:'t'});
const ball=(target,o={})=>({kind:'pass-space',target,receiver:1,curl:0,loft:0,power:.5,...o});
function play(sc,kicks){const w=P.createPuzzle(sc),ev=[];w.on(e=>ev.push(e));let i=0;
 for(let g=0;g<120*20;g++){const ph=w.state.phase;if(ph==='success'||ph==='fail')break;if(ph==='aiming'){if(i>=kicks.length)break;assert(w.kick(kicks[i++]));}w.step(1/120);}return{w,ev};}

// 1. Onside runner (starts a step behind the line, goes with the pass) is fine.
{const {w,ev}=play(through(13),[ball({x:3,z:19.5})]);assert.equal(w.state.phase,'success',JSON.stringify(w.state.result));assert(!ev.some(e=>e.type==='offside'));}
// 2. Already past the line when the ball is played: flagged on the first touch, and the preview says so.
{const sc=through(15.2),w0=P.createPuzzle(sc),pr=P.predict(w0,ball({x:3,z:19.5}));
 assert.equal(pr.end,'offside');assert.deepEqual(pr.offside,[1]);assert(Math.abs(pr.offsideLine-14)<.3,'line is the second-last opponent: '+pr.offsideLine);
 const {w,ev}=play(sc,[ball({x:3,z:19.5})]);assert.equal(w.state.result.reason,'offside');const off=ev.find(e=>e.type==='offside');assert(off&&off.attacker===1);}
// 3. Timing: the same run is onside for a quick pass and offside for a pass that needs a long turn (a late release).
{const sc=through(13.6),quick=play(sc,[ball({x:3,z:19.5})]);assert.equal(quick.w.state.phase,'success','a quick release keeps the runner onside');
 const turned={...sc,attackers:[{...sc.attackers[0]},sc.attackers[1]]};const w=P.createPuzzle(turned);w.state.attackers[0].facing=Math.PI*.95;// facing his own goal: a long turn
 const k=ball({x:3,z:19.5});assert(w.turnFor(k).windup>.5,'a big turn costs a long wind-up');assert.equal(P.predict(w,k).end,'offside','the preview warns that the late ball is offside');
 w.kick(k);for(let g=0;g<2400&&!w.state.result;g++)w.step(1/120);assert.equal(w.state.result.reason,'offside','a late release catches the runner offside');}
// 4. Level is onside; behind the ball is onside; own half is never offside.
{const level={...through(14),attackers:[{x:0,z:6},{x:3,z:14.05}],require:{minPasses:1,finish:'reach-zone',zone:{x:3,z:14,r:3},offside:true}};
 assert.equal(play(level,[{kind:'pass-feet',target:{x:3,z:14.05},receiver:1,curl:0,loft:0,power:.3}]).w.state.phase,'success','level with the line counts as onside');
 const own={...through(13),attackers:[{x:0,z:-10},{x:3,z:-2,run:{delay:0,path:[{x:3,z:6}]}}],defenders:[{x:-6,z:-4},{x:9,z:-4}],require:{minPasses:1,finish:'reach-zone',zone:{x:3,z:4,r:4},offside:true}};
 assert.notEqual(play(own,[ball({x:3,z:4})]).w.state.result?.reason,'offside','a runner who starts in his own half is onside');
 const back={...through(13),attackers:[{x:0,z:16},{x:-5,z:15.5}],defenders:[{x:6,z:14},{x:9,z:12}],require:{minPasses:1,finish:'reach-zone',zone:{x:-5,z:15.5,r:3},offside:true}};
 assert.equal(play(back,[{kind:'pass-feet',target:{x:-5,z:15.5},receiver:1,curl:0,loft:0,power:.25}]).w.state.phase,'success','a square/back pass behind the ball is onside');}
// 5. Off by default: scenarios without require.offside (the coach lesson) never call it.
{const sc=through(15.2,{offside:undefined});const {w,ev}=play(sc,[ball({x:3,z:19.5})]);assert(!ev.some(e=>e.type==='offside'));assert.notEqual(w.state.result?.reason,'offside');assert.equal(P.predict(P.createPuzzle(sc),ball({x:3,z:19.5})).offside,undefined);}
// 6. Replay is identical, including the offside call.
{const {w,ev}=play(through(15.2),[ball({x:3,z:19.5})]);const rp=P.replay(w.attemptStart(),w.inputs()).run();assert.deepEqual(rp.map(e=>[e.type,e.tick]),ev.map(e=>[e.type,e.tick]));}
// 7. Every arcade puzzle plays offside, and no stored route passes to a player who was offside.
for(const [list,sols] of [[SCENARIOS,SCENARIO_SOLUTIONS],[CHALLENGE_SCENARIOS,CHALLENGE_SOLUTIONS]])for(const sc of list){
 assert.equal(sc.require.offside,true,sc.id+' plays offside');
 const {w,ev}=play(sc,sols[sc.id].solution);assert(!ev.some(e=>e.type==='offside'),sc.id+' route is onside');assert.equal(w.state.phase,'success',sc.id);}
console.log('PASS offside: onside run, flagged run + preview + line, late release, level/behind/own half, opt-in, replay, all 23 routes onside');
