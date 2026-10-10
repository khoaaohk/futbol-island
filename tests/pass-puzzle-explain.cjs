// Pass Puzzles coaching words (Oct 9 2026): the live lane read, the "why it worked" takeaway, the
// "why it didn't" + fix, and the replay calls. Every puzzle's coach's route is played through the real
// engine, noting each release the way the arcade does. Run: node tests/pass-puzzle-explain.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,f);
const lib=f=>require(path.join(__dirname,'..','lib','passPuzzle',f));
const P=lib('index.ts'),{ALL_SCENARIOS,ALL_SOLUTIONS}=lib('catalog.ts'),{strokeForKick}=lib('coach.ts'),{isCall}=lib('packs.ts'),X=lib('explain.ts');
// shirtNumbersFor lives with the scene (three.js); a stand-in numbering keeps this test DOM-free.
const numsFor=sc=>({attackers:sc.attackers.map((_,i)=>[10,9,11,7,8,6][i]??20+i),defenders:sc.defenders.map((_,i)=>[4,5,2,3,6,8][i]??30+i),keeper:1});
const JARGON=/\b(goal-side|half-space|overload\w*|third[- ]man|channel|centre-back|full-back|lay-off|recycle|between the lines|in stride)\b/i;
const words=s=>s.split(/\s+/).filter(Boolean).length;
const playable=s=>({...s,require:{...s.require,allowDirectShot:s.require.finish==='goal'}});
function run(sc,steps){const w=P.createPuzzle(playable(sc)),ev=[],notes=[];w.on(e=>ev.push(e));let i=0;
 for(let g=0;g<120*40;g++){const ph=w.state.phase;if(ph==='success'||ph==='fail')break;
  if(ph==='aiming'){if(i>=steps.length)break;const st=steps[i++];if(isCall(st)){w.callRun(st.call.attacker,st.call.to);continue;}
   const k=P.readStroke(strokeForKick(w,st),w),p=P.predict(w,k),calls=w.state.attackers.map((a,j)=>a.call&&a.call.startAt==null?j:-1).filter(j=>j>=0);
   const n=X.noteFor(w.state,k,p,calls,w.state.chain.length>0);if(!w.kick(k))break;notes[w.inputs().length-1]=n;}
  w.step(1/120);}
 return{w,ev,notes};}
let solved=0,reasons=0,blocked=0,calls=0;const fails={};
for(const sc of ALL_SCENARIOS){const r=ALL_SOLUTIONS[sc.id],nums=numsFor(sc);
 // 1. the route: every release reads clear or tight (never blocked), and the takeaway gives reasons
 const ok=run(sc,r.solution);assert.equal(ok.w.state.phase,'success',sc.id);solved++;
 for(const f of ['7v7','9v9','11v11']){const why=X.explainSuccess(ok.notes,sc,nums,f,2);assert(why.length>=1,`${sc.id} ${f}: a reason it worked`);reasons+=why.length;
  for(const t of why){assert(!/undefined|NaN|#\?/.test(t),t);if(f==='7v7'){assert(!JARGON.test(t),`7v7 jargon: ${t}`);assert(words(t)<=14,`7v7 short: ${t}`);}}}
 // 2. the naive option: the preview says so before the release, and the fail card names who stopped it
 for(const nv of r.naive){const w=P.createPuzzle(playable(sc));if(isCall(nv))continue;const k=P.readStroke(strokeForKick(w,nv),w),p=P.predict(w,k),st=X.laneStatus(p);
  assert.equal((p.threatAt??[]).length,p.threats.length,'every threat has a reach point for the arrow');if(p.end==='intercept')assert(p.cut,'a stopped ball has a cut point');if(p.threats.length)assert(p.closest&&p.closest.slack<0,'a threat is a negative-slack defender');
  if(st==='blocked'||st==='save'||st==='offside'){blocked++;const t=X.laneWords(st,p,nums,'7v7');assert(t.length>8&&!/undefined/.test(t),t);if(st==='blocked')assert.match(t,/#\d+/,'the lane read names the defender');}
  const bad=run(sc,[nv]);const reason=bad.w.state.result?.reason;if(!reason)continue;fails[reason]=(fails[reason]??0)+1;
  const stop=bad.ev.filter(e=>['intercept','deflect','save','parry','offside'].includes(e.type)).at(-1),x=X.explainFail(reason,stop,bad.notes.at(-1),nums,'7v7');
  assert(x&&x.why&&x.fix,`${sc.id} explains a ${reason}`);if(reason==='intercept')assert.match(x.why,/#\d+/,'names the defender who cut it out');}
 // 3. replay calls: every event of the route gets a short line with shirt numbers
 const inputs=ok.w.inputs();let kick=0;for(const e of ok.ev){const line=X.replayCall(e,nums,i=>inputs[i]?.kick.receiver,kick,(inputs[kick]?.calls??[]).map(c=>c.attacker));if(e.type==='kick')kick++;if(line){calls++;assert(!/undefined|NaN/.test(line),line);}}
}
assert(blocked>=ALL_SCENARIOS.length*.6,`the preview warns before most naive passes (${blocked})`);
// 4. lane status thresholds
const base={path:[{x:0,y:0,z:0}],end:'rest',threats:[],keeperThreat:false};
assert.equal(X.laneStatus({...base,closest:{defender:0,slack:1,at:{x:0,z:0}}}),'clear');
assert.equal(X.laneStatus({...base,closest:{defender:0,slack:.2,at:{x:0,z:0}}}),'tight');
assert.equal(X.laneStatus({...base,threats:[0]}),'blocked');assert.equal(X.laneStatus({...base,end:'offside'}),'offside');assert.equal(X.laneStatus(null),null);
console.log(`PASS explain: ${solved} routes explained (${reasons} reasons over 3 formats), ${blocked} naive passes flagged before release, fails explained ${JSON.stringify(fails)}, ${calls} replay calls`);
