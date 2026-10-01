// Parental gate (lib/parentGate.ts, components/ParentGate.tsx) and where it guards grown-up areas (Lane 4, G-09 / G-17).
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const ROOT=path.join(__dirname,'..');
function load(file){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,require:id=>id.endsWith('.json')?require(path.resolve(path.dirname(file),id)):load(path.resolve(path.dirname(file),id+'.ts')),Date,Math});return m.exports;}
const gate=load(path.join(ROOT,'lib/parentGate.ts'));
const {makeGateQuestion,checkGateAnswer,parentGatePassed,passParentGate,resetParentGate,GATE_PASS_MS,GATE_MAX_TRIES,GATE_COOLDOWN_MS}=gate;

// Questions: written in words, 6–12 × 3–9, across the whole random range.
const seen=new Set();
for(const r of [0,.1,.25,.5,.75,.9,.9999]){const q=makeGateQuestion(()=>r);
 assert.ok(q.a>=6&&q.a<=12&&q.b>=3&&q.b<=9,`range ${q.a}x${q.b}`);assert.match(q.text,/^What is [a-z]+ times [a-z]+\?$/);assert.doesNotMatch(q.text,/\d/,'no digits: must be read');seen.add(q.a*q.b);}
assert.ok(seen.size>3,'questions vary');
// Blocks wrong, empty and odd input; unblocks the right number.
const q={a:7,b:8};
for(const bad of ['', ' ', '55', '57', 'fifty-six', '5 6', '-56', '56.0', '1e2', '0x38', '5600'])assert.equal(checkGateAnswer(q,bad),false,`blocks "${bad}"`);
for(const good of ['56',' 56 ','056'])assert.equal(checkGateAnswer(q,good),true,`unblocks "${good}"`);
// Session memory: in memory only, expires.
resetParentGate();assert.equal(parentGatePassed(1000),false,'locked by default');
passParentGate(1000);assert.equal(parentGatePassed(1000+GATE_PASS_MS-1),true,'remembered briefly');assert.equal(parentGatePassed(1000+GATE_PASS_MS),false,'expires');
resetParentGate();assert.equal(parentGatePassed(2000),false);
assert.ok(GATE_MAX_TRIES>=2&&GATE_COOLDOWN_MS>=10000,'retries are limited');
// QA11 B-1: the cooldown lives in module memory, so a closed-and-reopened (or a different) gate still waits it out.
{const {recordGateWrong,gateLockedUntil,gateWrongTries}=gate;resetParentGate();
 let r;for(let i=0;i<GATE_MAX_TRIES;i++)r=recordGateWrong(5000+i);
 assert.equal(r.lockedUntil,5000+GATE_MAX_TRIES-1+GATE_COOLDOWN_MS,'the last wrong try starts the cooldown');
 assert.equal(gateLockedUntil(6000),r.lockedUntil,'a new gate instance sees the same lockout');
 assert.equal(recordGateWrong(6000).lockedUntil,r.lockedUntil,'more tries while locked do not extend or reset it');
 assert.equal(gateLockedUntil(r.lockedUntil),0,'it ends after the cooldown');assert.equal(gateWrongTries(r.lockedUntil),0,'with a fresh count');
 recordGateWrong(1);passParentGate(2);assert.equal(gateWrongTries(3),0,'a pass clears the count');resetParentGate();}
const libSrc=fs.readFileSync(path.join(ROOT,'lib/parentGate.ts'),'utf8');
assert.doesNotMatch(libSrc,/localStorage|sessionStorage|document\.cookie|fetch\(/,'gate stores and sends nothing');

// Component: passes only on a correct answer; Guard shows children only after a pass.
const comp=fs.readFileSync(path.join(ROOT,'components/ParentGate.tsx'),'utf8');
assert.match(comp,/if\(checkGateAnswer\(q,answer\)\)\{passParentGate\(\);onPass\(\);return;\}/,'onPass only after a correct answer');
assert.equal((comp.match(/onPass\(\)/g)||[]).length,1,'no other path calls onPass');
assert.match(comp,/return open\?<>\{children\}<\/>:<ParentGate /,'Guard renders the gate until passed');
assert.doesNotMatch(comp,/localStorage|fetch\(/,'component stores and sends nothing');

// Server render: the gate shows, the guarded content does not (nothing leaks before a pass).
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
function loadTsx(file){const m={exports:{}};const out=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 vm.runInNewContext(out,{module:m,exports:m.exports,require:id=>id.endsWith('.module.css')?new Proxy({},{get:(_,k)=>String(k)}):id==='@/lib/parentGate'?gate:require(id),Date,Math});return m.exports;}
const ParentGate=loadTsx(path.join(ROOT,'components/ParentGate.tsx')).default;
const html=renderToStaticMarkup(React.createElement(ParentGate.Guard,{reason:'Test'},React.createElement('div',{id:'secret'},'SECRET')));
assert.match(html,/data-parent-gate/);assert.doesNotMatch(html,/SECRET/,'guarded content hidden before the gate');
assert.match(html,/Kids, ask a grown-up/);
// QA11: two gates on one screen get their own ids (label/aria links stay correct); the cooldown counts down with a 1 s tick
// that only runs while waiting and is cleared with the cooldown.
{const two=renderToStaticMarkup(React.createElement('div',null,React.createElement(ParentGate,{onPass(){}}),React.createElement(ParentGate,{onPass(){}})));
 const ids=[...two.matchAll(/ id="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,6);assert.equal(new Set(ids).size,6,'ids are unique per gate');
 for(const m of two.matchAll(/(?:for|aria-labelledby|aria-describedby)="([^"]+)"/g))assert(ids.includes(m[1]),`${m[0]} points at a real id`);
 assert.match(comp,/useEffect\(\(\)=>\{if\(!waitUntil\)return;[^\n]*const tick=setInterval\(\(\)=>setNow\(Date\.now\(\)\),1000\);return\(\)=>\{clearTimeout\(t\);clearInterval\(tick\);\};\},\[waitUntil\]\);/,'1 s countdown only while cooling down, then cleared');
 assert.equal((comp.match(/setInterval\(/g)||[]).length,1,'no other interval');}

// Where the gate is used.
const coaches=fs.readFileSync(path.join(ROOT,'components/CoachesCentre.tsx'),'utf8');
assert.match(coaches,/export const IDP_ENABLED=true;/,'IDP is on');
assert.match(coaches,/<ParentGate\.Guard[^\n]*?><IdpPlan /,'IDP sits behind the gate');
assert.equal((coaches.match(/<IdpPlan /g)||[]).length,1,'no ungated IdpPlan');
const grown=fs.readFileSync(path.join(ROOT,'components/GrownUps.tsx'),'utf8');
assert.match(grown,/\{!unlocked\?<ParentGate\.Guard/,'grown-ups area opens on the gate');
assert.doesNotMatch(grown,/href="http/,'no external links in the grown-ups area');
console.log('PASS parent gate: word questions, blocks wrong/odd input, unblocks the answer, in-memory expiry, Guard hides content; IDP on and gated; grown-ups gated');
