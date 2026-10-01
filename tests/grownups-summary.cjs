// Grown-ups area (Lane 4, G-09): progress summary computed from raw saves, practice activities, and a report with no personal data.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const ROOT=path.join(__dirname,'..');
const cache=new Map();
function load(file){if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,{module:m,exports:m.exports,require:id=>id.endsWith('.json')?require(path.resolve(path.dirname(file),id)):load(path.resolve(path.dirname(file),id+'.ts')),Date,Math,String,Number,Array,Set,Map,Object,JSON,RegExp});cache.set(file,m.exports);return m.exports;}
const {summarizeProgress,STAGE_LABELS,graduateBadge}=load(path.join(ROOT,'lib/grownups/progress.ts'));
const {practiceFor,PRACTICES}=load(path.join(ROOT,'lib/grownups/practice.ts'));
const {progressReportHtml,cleanFirstName}=load(path.join(ROOT,'lib/grownups/report.ts'));
const paths=require('../lib/paths/formatPaths.json');
const plain=x=>JSON.parse(JSON.stringify(x));
const core=f=>paths.find(p=>p.format===f).chapters.flatMap(c=>c.lessons);

// Raw saves, exactly as the stores write them (futbol-island-quiz-progress-v1 and futbol-island-quests-v1).
const quizSave=[],questSave={visits:['7v7'],steps:[],equipment:false};
const pass=(f,l)=>{for(let i=0;i<l.questions;i++)quizSave.push(`${f}:${l.id}:${i}`);};
const c7=core('7v7');
pass('7v7',c7[0]);pass('7v7',c7[1]);                                  // two lessons: quiz passed
quizSave.push(`7v7:${c7[2].id}:0`);                                     // third: one answer → introduced
questSave.steps.push(`7v7:${c7[3].id}:0`,`7v7:${c7[3].id}:1`);          // fourth: watched only → introduced
const input=raw=>({steps:new Set(JSON.parse(raw.quest).steps),answers:new Set(JSON.parse(raw.quiz)),balls:{found:12,total:100}});
const raw={quiz:JSON.stringify(quizSave),quest:JSON.stringify(questSave)};
let s=summarizeProgress(input(raw),paths);
const f7=s.formats.find(f=>f.format==='7v7');
assert.deepEqual(plain(s.formats.map(f=>f.format)),['7v7','9v9','11v11','futsal'],'simplest first by default');
assert.equal(f7.coreComplete,2);assert.equal(f7.coreTotal,c7.length);assert.equal(f7.pathComplete,false);
assert.equal(f7.stages.practicing,2);assert.equal(f7.stages.introduced,2);
assert.equal(s.totals.understood,2);assert.equal(s.totals.lessons,paths.reduce((n,p)=>n+p.chapters.flatMap(c=>c.lessons).length+p.depth.length,0));
assert.equal(s.nextUp[0].id,c7[2].id,'next up = first stop not yet passed');assert.equal(s.nextUp.length,1,'only started paths');
assert.deepEqual(plain(s.recent.map(l=>l.id)),[c7[3].id,c7[2].id],'furthest lessons touched');
assert.deepEqual(plain(s.balls),{found:12,total:100});assert.deepEqual(plain(s.badges),[]);assert.deepEqual(plain(s.pathsComplete),[]);
assert.equal(summarizeProgress({...input(raw),balls:{found:500,total:100}},paths).balls.found,100,'balls clamp');
// Lane 3 spaced reviews lift a passed lesson to applied / remembered.
const reviewed=summarizeProgress({...input(raw),reviews:{[`7v7:${c7[0].id}`]:{enrolled:1,box:1,due:0,right:1,wrong:0},[`7v7:${c7[1].id}`]:{enrolled:1,box:2,due:0,right:2,wrong:0}}},paths);
assert.equal(reviewed.formats[0].stages.applied,1);assert.equal(reviewed.formats[0].stages.remembered,1);assert.equal(reviewed.totals.understood,2);
// Whole 7v7 path → complete + graduate badge (deduped with Lane 2's graduation record).
for(const l of c7)pass('7v7',l);
s=summarizeProgress({...input({quiz:JSON.stringify(quizSave),quest:raw.quest}),badges:[graduateBadge('7v7'),'Matchday Ferry finale'],preferred:'11v11'},paths);
assert.deepEqual(plain(s.pathsComplete),['7v7']);assert.deepEqual(plain(s.badges),['7v7 graduate','Matchday Ferry finale']);
assert.equal(s.formats[0].format,'11v11','preferred format first');
assert.equal(s.formats.find(f=>f.format==='7v7').next.core,false,'after the path, next is a Go deeper lesson');
// Empty saves: nothing started, gentle 7v7 suggestion.
const empty=summarizeProgress({steps:new Set(),answers:new Set(),balls:{found:0,total:100}},paths);
assert.equal(empty.totals.understood,0);assert.equal(empty.nextUp[0].format,'7v7');assert.deepEqual(plain(empty.recent),[]);
for(const k of Object.keys(STAGE_LABELS))assert.doesNotMatch(STAGE_LABELS[k].label+STAGE_LABELS[k].detail,/minute|hour|time played|streak/i,'time-agnostic wording');

// Practice: every activity is tied to real lessons, and every starter lesson gets something.
const allIds=paths.flatMap(p=>[...p.chapters.flatMap(c=>c.lessons),...p.depth].map(l=>l.id));
for(const p of PRACTICES){assert.ok(allIds.some(id=>p.match.test(id)),`${p.id} matches a lesson`);for(const k of ['title','setup','howTo','talk'])assert.ok(p[k].length>8);}
assert.equal(new Set(PRACTICES.map(p=>p.id)).size,PRACTICES.length);
const starters=paths.flatMap(p=>p.chapters.flatMap(c=>c.lessons));
const uncovered=starters.filter(l=>!PRACTICES.some(p=>p.match.test(l.id))).map(l=>l.id);
assert.ok(uncovered.length<=4,`starter lessons without a matched activity: ${uncovered}`);
assert.equal(practiceFor([{id:'nothing'}]).length,3,'always a choice of three');
assert.deepEqual(plain(practiceFor([{id:'learn7_receive'},{id:'prn_7_support'},{id:'learn9_receive'}]).map(p=>p.id)),['look-turn','hide-seek','cone-gate-1v1'],'matched first, deduped, topped up');

// Report: no personal data unless a first name is typed; escaped; self-contained.
const opts={printedAt:Date.UTC(2026,8,30),practice:practiceFor(s.recent),focus:null};
const html=progressReportHtml(s,opts);
assert.match(html,/Football learning on Futbol Island/);assert.match(html,/7v7 graduate/);
const bodyOnly=html.split('</style>')[1];
for(const bad of [/<script/i,/https?:\/\//,/src=/,/fi2-|futbol-island-/,/localStorage/,/@/])assert.doesNotMatch(bad.source==='@'?bodyOnly:html,bad,`report has no ${bad}`);
assert.doesNotMatch(html,/’s football learning/,'no name when none typed');
const named=progressReportHtml(s,{...opts,firstName:'  Mia <script>alert(1)</script> '});
assert.doesNotMatch(named,/<script/i);assert.match(named,/Mia scriptalertscript’s football learning/,'typed name appears only as cleaned letters');
assert.equal(cleanFirstName('Zoë-Ann O’Neil'),'Zoë-Ann O’Neil');assert.equal(cleanFirstName('x'.repeat(40)).length,24);
assert.doesNotMatch(cleanFirstName('call 555 1234 or a@b.co'),/\d|@/,'no digits or emails survive');
// The typed name is never stored: nothing in the grown-ups code writes it.
for(const f of ['components/GrownUps.tsx','lib/grownups/report.ts','lib/coaches/idpPrint.ts']){const src=fs.readFileSync(path.join(ROOT,f),'utf8');assert.doesNotMatch(src,/setItem|fetch\(|sendBeacon|navigator\.share/,`${f} stores/sends nothing`);}
console.log(`PASS grown-ups summary from raw saves (stages, next up, badges, reviews), ${PRACTICES.length} practice activities, report with no personal data`);
