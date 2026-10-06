// Pass Puzzles daily remix + catalog: deterministic per date, always solvable by its route, the
// shortcut still fails, generation is cheap, and the catalog/pack gates/difficulty curve hold.
// Run: node tests/pass-puzzle-daily.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,f);
const lib=f=>require(path.join(__dirname,'..','lib','passPuzzle',f));
const {dailyPuzzle,dateKey}=lib('daily.ts'),{coachRun}=lib('coach.ts'),C=lib('catalog.ts'),{DIFFICULTY}=lib('curve.ts'),{youthScenario}=lib('youth.ts');
// 1. daily: 21 days in a row
const seen=new Set();let worst=0;
for(let d=0;d<21;d++){const date=new Date(2026,9,1+d),t0=performance.now(),a=dailyPuzzle(C.DAILY_TEMPLATES,date);worst=Math.max(worst,performance.now()-t0);
 assert(a,'a daily puzzle exists for '+dateKey(date));const b=dailyPuzzle(C.DAILY_TEMPLATES,date);assert.deepEqual(a,b,'same date, same puzzle');
 assert.equal(a.scenario.id,'daily-'+dateKey(date));assert(coachRun(a.scenario,a.solution).ok,a.scenario.id+' route solves the remix');
 assert(coachRun(youthScenario(a.scenario),a.solution).ok,a.scenario.id+' also with the no-heading rule');seen.add(a.template+(a.mirrored?'-m':''));}
assert(seen.size>=6,'variety over three weeks: '+seen.size);assert(worst<1500,'daily build stays cheap ('+worst.toFixed(0)+' ms, desktop under load)');
// 2. catalog: every puzzle has a route and a rating; packs are gated by stars and ordered
for(const s of C.ALL_SCENARIOS){assert(C.ALL_SOLUTIONS[s.id],s.id+' route');assert(Number.isFinite(DIFFICULTY[s.id]),s.id+' rated (run scripts/pass-puzzle-curve.cjs)');assert([1,2,3].includes(C.pips(s.id)));}
assert.equal(C.ALL_PACKS[0].id,'first-passes');assert.equal(C.ALL_PACKS[0].gate,0,'the first pack is always open');
for(let i=1;i<C.ALL_PACKS.length;i++)assert(C.ALL_PACKS[i].order>C.ALL_PACKS[i-1].order&&C.ALL_PACKS[i].gate>=C.ALL_PACKS[i-1].gate,'gates rise along the map: '+C.ALL_PACKS[i].id);
const total=C.ALL_SCENARIOS.length*3;assert(C.ALL_PACKS.every(p=>p.gate<=total*.6),'every pack can be opened without perfect stars');
// 3. difficulty curve: inside each pack the measured rating climbs (one small dip allowed per pack)
for(const p of C.ALL_PACKS){const r=C.ALL_SCENARIOS.filter(s=>s.pack===p.id).map(s=>DIFFICULTY[s.id]);let dips=0;for(let i=1;i<r.length;i++)if(r[i]<r[i-1]-12)dips++;assert(dips<=1,`${p.id} ramps: ${r.join(' → ')}`);}
assert(DIFFICULTY['fp-find-a-friend']<=45&&DIFFICULTY['fp-far-corner']<=45,'the first two puzzles are gentle');
// 4. youth routes come from the catalog in no-heading mode
for(const s of C.ALL_SCENARIOS){const r=C.routeFor(s.id,false);assert(!r.some(k=>k.kind==='header'),s.id+' youth route has no headers');}
console.log(`PASS daily + catalog: 21 days solvable/deterministic (${seen.size} variants, worst ${worst.toFixed(0)} ms), ${C.ALL_SCENARIOS.length} puzzles rated, ${C.ALL_PACKS.length} packs gated, curve ramps`);
