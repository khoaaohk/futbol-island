// A lesson started from a pitch card returns to the pitch when closed, not the Paths sheet (Oct 26 2026, owner).
// Run: node tests/pitch-lesson-return.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const m={exports:{}};vm.runInNewContext(ts.transpileModule(read('lib/paths/lessonReturn.ts'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports});
const R=m.exports;
assert.equal(R.lessonCloseTarget({from:'pitch'}),'pitch');
assert.equal(R.lessonCloseTarget({}),'paths');assert.equal(R.lessonCloseTarget(null),'paths');assert.equal(R.lessonCloseTarget(undefined),'paths');
assert.equal(R.lessonCloseLabel({from:'pitch'},'back'),'Back to the pitch');assert.equal(R.lessonCloseLabel(null,'back'),'Back to Paths');
assert.equal(R.lessonCloseLabel({from:'pitch'},'save'),'Save and return to the pitch');
assert.equal(JSON.stringify(R.withLaunchSource({a:1},'pitch')),'{"a":1,"from":"pitch"}');assert.equal(JSON.stringify(R.withLaunchSource({a:1})),'{"a":1}');
// Wiring: the pitch card tags its launch, chained lessons keep the tag, Town only reopens Paths for non-pitch launches.
assert.match(read('components/FieldPathCard.tsx'),/launchPathLesson\([^)]*'pitch'\)/,'pitch card launches with from=pitch');
assert.match(read('lib/paths/pathLaunch.ts'),/withLaunchSource\(pathLaunchDetail\(/);
assert.ok(read('components/FieldLearning.tsx').includes('quizAnswers,pathRequest.from)'),'Next lesson keeps the source');
const town=read('components/Town.tsx');
assert.match(town,/const back=lessonCloseTarget\(formatPathRequest\);[^}]*if\(back==='paths'\)\{setPathsRequest/,'Town reopens Paths only for non-pitch lessons');
console.log('pitch-lesson-return ok');
