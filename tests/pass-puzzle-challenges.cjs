const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,f);
const {createPuzzle,readStroke,replay}=require('../lib/passPuzzle/index.ts');
const {CHALLENGE_SCENARIOS,CHALLENGE_SOLUTIONS}=require('../lib/passPuzzle/challenges.ts');
function draw(w,k,slop=0){const b=w.state.ball.p;let end=k.receiver!=null&&k.kind!=='pass-space'?{...w.state.attackers[k.receiver].p}:{...k.target};if(k.kind==='shot')end.z+=2;end.x+=slop;const points=[];for(let i=0;i<=24;i++){let u=i/24;points.push({x:b.x+(end.x-b.x)*u,z:b.z+(end.z-b.z)*u,t:u*.4});}if(k.loft){const hold=.25+(k.loft-.15)*.45/.85;points.push({...end,t:.4+hold+.001});}return readStroke(points,w);}
function run(sc,route,hz=120,slop=0){const w=createPuzzle(sc),events=[];for(const k of route){if(w.state.phase!=='aiming')break;assert(w.kick(draw(w,k,slop)));for(let n=0;n<hz*15&&['windup','flight'].includes(w.state.phase);n++){w.step(1/hz);events.push(...w.drain());}}return{w,events};}
for(const sc of CHALLENGE_SCENARIOS){const {solution,naive}=CHALLENGE_SOLUTIONS[sc.id];
 for(const hz of [30,60,120])for(const slop of [-.18,0,.18]){const {w}=run(sc,solution,hz,slop);assert.equal(w.state.phase,'success',`${sc.id} ${hz}Hz aim error${slop}: ${JSON.stringify(w.state.result)}`);assert.equal(w.state.passes,3);assert.equal(w.state.result.bonus,true);const rep=replay(w.attemptStart(),w.inputs(),.38);rep.run();assert.equal(rep.world.state.phase,'success');}
 const bad=run(sc,[naive]);assert.equal(bad.w.state.phase,'fail',sc.id+' tempting direct pass must fail');assert.notEqual(bad.w.state.result.reason,'too-few-passes',sc.id+' defensive shape must stop the shortcut');
 console.log('PASS',sc.id,'three-pass route, imperfect drawn inputs at30/60/120Hz, replay, defensive shortcut',bad.w.state.result.reason);
}
