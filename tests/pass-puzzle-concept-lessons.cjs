// Pass Puzzles concept → lesson map (Nov 10 2026, arcade part 3): every scenario concept tag is named in kid words and maps to
// a concept with a real lesson, or is explicitly null. The practise link opens the lesson's reading page after two fails.
// Run: node -r ./scripts/test-ts-cache.cjs tests/pass-puzzle-concept-lessons.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,f);
const L=require('../lib/passPuzzle/conceptLessons.ts'),C=require('../lib/learning/conceptMap.ts');
const names={};for(const f of ['7v7','9v9','11v11','futsal'])for(const l of JSON.parse(fs.readFileSync(`public/lessons/${f}.json`,'utf8')))names[l.id]=l.name.replace(/\s+/g,' ').trim();
const table=fs.readFileSync('lib/analytics/learningIds.generated.ts','utf8');
// 1. Every concept tag a scenario uses is in the table (scan the scenario sources, so a new puzzle cannot slip through).
const tags=new Set();for(const f of fs.readdirSync('lib/passPuzzle'))if(f.endsWith('.ts')&&f!=='conceptLessons.ts'&&f!=='types.ts')for(const m of fs.readFileSync(`lib/passPuzzle/${f}`,'utf8').matchAll(/concept:'([a-z0-9-]+)'/g))tags.add(m[1]);
assert.ok(tags.size>=50,`found ${tags.size} scenario concepts`);
for(const t of tags)assert.ok(t in L.PUZZLE_CONCEPTS,`scenario concept ${t} has no entry (map it or set concept:null)`);
// 2. Each entry: a short kid name; concept is a real ConceptId with lessons, or explicitly null.
for(const [t,e] of Object.entries(L.PUZZLE_CONCEPTS)){
 assert.ok(e.name&&e.name.length<=40,`${t} name`);assert.ok('concept' in e,`${t} concept key`);
 if(e.concept===null)continue;
 assert.ok(C.conceptById(e.concept),`${t} → unknown concept ${e.concept}`);
 for(const f of ['7v7','9v9','11v11']){const l=L.puzzleConceptLesson(t,f);assert.ok(l,`${t} (${f}) has no lesson`);
  assert.equal(l.title,names[l.id],`${l.id} title matches public/lessons`);assert.ok(table.includes(`"${l.id}"`),`${l.id} has a reading page (LESSON_TABLE)`);
  assert.equal(l.href,`/learn/lessons/${l.id}`);}
}
for(const id of Object.keys(L.PUZZLE_LESSON_TITLES))assert.equal(L.PUZZLE_LESSON_TITLES[id],names[id],`${id} title`);
assert.equal(L.puzzleConceptLesson('curl','9v9'),null,'unmapped concepts offer no link');
assert.equal(L.puzzleConceptWords('curl','9v9').line,null);assert.equal(L.puzzleConceptWords('one-two','7v7').name,'Give and go');
// Grass formats prefer grass lessons: a 7v7 third-man fail never opens a futsal lesson.
assert.ok(!['futsal'].includes(C.splitLessonKey(C.conceptLessons('third-man','7v7',true)[0]).format));
// 3. Session counter: the link is offered on the second fail of one concept.
const m=new Map();assert.equal(L.notePuzzleFail(m,'one-two'),1);assert.equal(L.notePuzzleFail(m,'switch'),1);assert.equal(L.notePuzzleFail(m,'one-two'),L.PRACTISE_AFTER);
// 4. Wiring in the explain panel.
const view=fs.readFileSync('components/games/PassPuzzleGame.tsx','utf8');
assert.match(view,/notePuzzleFail\(conceptFails\.current,sc\.concept\)>=PRACTISE_AFTER/);
assert.match(view,/target="_blank" rel="noopener">Practise this: \{outcome\.practise\.title\}<\/a>/);
assert.match(view,/You played: <strong>\{outcome\.concept\.name\}<\/strong>/);
console.log(`pass-puzzle-concept-lessons: ok (${tags.size} tags, ${Object.values(L.PUZZLE_CONCEPTS).filter(e=>e.concept===null).length} null)`);
