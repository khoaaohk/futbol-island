// Pass Puzzles feel (Oct 10 2026): the failure beat marks where every naive (wrong) idea was stopped, on the
// pitch and inside it, and the HUD counts passes toward the taught move. Every puzzle's naive move is played
// through the real engine. Browser check: scratchpad gamefeel/arcade-puzzle/audit.cjs. Run: node tests/pass-puzzle-feel.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,f);
const lib=f=>require(path.join(__dirname,'..','lib','passPuzzle',f));
const P=lib('index.ts'),{ALL_SCENARIOS,ALL_SOLUTIONS}=lib('catalog.ts'),{strokeForKick}=lib('coach.ts'),{isCall}=lib('packs.ts'),F=lib('feel.ts');
const playable=s=>({...s,require:{...s.require,allowDirectShot:s.require.finish==='goal'}});
function run(sc,steps){const w=P.createPuzzle(playable(sc)),ev=[];let i=0;
 for(let g=0;g<120*40;g++){const ph=w.state.phase;if(ph==='success'||ph==='fail')break;
  if(ph==='aiming'){if(i>=steps.length)break;const st=steps[i++];if(isCall(st)){w.callRun(st.call.attacker,st.call.to);continue;}if(!w.kick(P.readStroke(strokeForKick(w,st),w)))break;}
  w.step(1/120);ev.push(...w.drain());}
 return{w,ev};}
let fails=0,marked=0;const kinds={};
for(const sc of ALL_SCENARIOS){const r=ALL_SOLUTIONS[sc.id];if(!r)continue;
 const good=run(sc,r.solution);if(good.w.state.phase==='success')assert.equal(F.stopPoint(good.w,good.ev),null,`${sc.id}: a solve has no stop mark`);
 for(const naive of r.naive){const {w,ev}=run(sc,[naive]);if(w.state.phase!=='fail')continue;fails++;
  const s=F.stopPoint(w,ev),reason=w.state.result.reason;
  if(reason==='too-few-passes'){assert.equal(s,null);continue;}
  assert.ok(s,`${sc.id}: failed (${reason}) but nothing marks where`);marked++;kinds[s.kind]=(kinds[s.kind]??0)+1;
  const hw=sc.pitch.halfWidth+6,hl=sc.pitch.length/2+8;
  assert.ok(Number.isFinite(s.at.x+s.at.z)&&Math.abs(s.at.x)<=hw&&Math.abs(s.at.z)<=hl,`${sc.id}: stop mark ${JSON.stringify(s.at)} stays on the island pitch`);
  if(reason==='offside')assert.equal(s.kind,'offside');
  if(reason==='intercept'){const e=[...ev].reverse().find(e=>e.type==='intercept'||e.type==='deflect');assert.ok(e);assert.deepEqual(s.at,{x:e.at.x,z:e.at.z},`${sc.id}: the cross sits where the defender won it`);}
  if(reason==='save')assert.equal(s.kind,'save');}}
assert.ok(fails>=20&&marked>=fails*.8,`naive ideas fail and get marked (${marked}/${fails})`);
// The HUD counter: progress toward the taught move, singular/plural, capped, and a plain count for shot-only puzzles.
assert.deepEqual(F.passProgress(0,1),{count:'0/1',label:'pass',met:false});
assert.deepEqual(F.passProgress(1,2),{count:'1/2',label:'passes',met:false});
assert.deepEqual(F.passProgress(3,2),{count:'2/2',label:'passes',met:true});
assert.deepEqual(F.passProgress(1,0),{count:'1',label:'pass',met:false});
assert.deepEqual(F.passProgress(2,0),{count:'2',label:'passes',met:false});
assert.equal(F.passProgress(-1,1).count,'0/1');
// The view wires them: a fail card that waits for the beat (and can't be tapped while hidden), the gold HUD cue.
const css=fs.readFileSync(path.join(__dirname,'../components/games/PassPuzzleGame.module.css'),'utf8'),tsx=fs.readFileSync(path.join(__dirname,'../components/games/PassPuzzleGame.tsx'),'utf8');
assert.match(css,/\.failResult\{animation:puzzleFailReveal [^}]*\}/);assert.match(css,/@keyframes puzzleFailReveal\{from\{[^}]*visibility:hidden/);
assert.match(tsx,/showStop\(failStop\.current\.at,failStop\.current\.kind\)/);assert.match(tsx,/passProgress\(hud\.passes/);
console.log('PASS pass-puzzle feel: '+marked+'/'+fails+' failed naive ideas marked on the pitch '+JSON.stringify(kinds)+'; HUD move counter');
