const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
function load(file){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,require:id=>load(path.resolve(path.dirname(file),id+'.ts'))});return m.exports;}
const idp=load('lib/coaches/idp.ts'),paths=require('../lib/paths/formatPaths.json');
const {IDP_GOALS,IDP_KEY,IDP_REVIEW_DAYS,IDP_NOTE_MAX,emptyIdp,sanitizeIdp,chooseGoal,addNote,removeNote,reviewPlan,endPlan,reviewDue,loadIdp,saveIdp,goalsFor}=idp;

// Every goal links only to lessons that exist in its own format's path, and every format offers a choice.
for(const g of IDP_GOALS){const p=paths.find(p=>p.format===g.format),ids=[...p.chapters.flatMap(c=>c.lessons),...p.depth].map(l=>l.id);
 assert.ok(g.lessons.length>0,g.id);for(const l of g.lessons)assert.ok(ids.includes(l),`${g.id} → ${l} missing from ${g.format}`);
 for(const k of ['title','why','tryIt','parentCue'])assert.ok(g[k].length>8,`${g.id}.${k}`);}
assert.equal(new Set(IDP_GOALS.map(g=>g.id)).size,IDP_GOALS.length,'unique goal ids');
for(const f of ['futsal','7v7','9v9','11v11'])assert.ok(goalsFor(f).length>=3,`${f} has choices`);
// 7v7 goals stay the simplest to read.
const words=f=>{const g=goalsFor(f);return g.reduce((n,x)=>n+x.title.split(' ').length,0)/g.length;};
assert.ok(words('7v7')<=words('11v11'),'7v7 wording no longer than 11v11');

// One active focus; switching archives; re-choosing keeps notes.
let s=chooseGoal(emptyIdp(),'7-look',1000);
assert.equal(s.plan.goalId,'7-look');assert.equal(s.plan.reviewAt,1000+IDP_REVIEW_DAYS*864e5);
s=addNote(s,'player','  I   looked twice  ',2000);assert.equal(s.plan.notes[0].text,'I looked twice');
s=addNote(s,'coach','Saw you check your shoulder on the goal kick. Next: turn when free.',3000);
assert.equal(addNote(s,'player','   ',4000),s,'blank notes are ignored');
assert.equal(chooseGoal(s,'7-look',5000),s,'same focus keeps its notes');
assert.equal(chooseGoal(s,'nope',5000),s,'unknown goal ignored');
assert.equal(addNote(s,'player','x'.repeat(500),6000).plan.notes.at(-1).text.length,IDP_NOTE_MAX);
const switched=chooseGoal(s,'7-open',7000);
assert.equal(switched.plan.notes.length,0);assert.deepEqual(Array.from(switched.history.map(h=>h.goalId)),['7-look']);
assert.equal(removeNote(s,'player-2000').plan.notes.length,1);

// Review window.
assert.equal(reviewDue(s.plan,s.plan.reviewAt-1),false);assert.equal(reviewDue(s.plan,s.plan.reviewAt),true);
assert.equal(reviewPlan(s,9e12).plan.reviewAt,9e12+IDP_REVIEW_DAYS*864e5);
const ended=endPlan(s,8000);assert.equal(ended.plan,null);assert.equal(ended.history.at(-1).closedAt,8000);

// Sanitising and storage.
for(const bad of [null,42,'x',{},{plan:{goalId:'nope',setAt:1,reviewAt:2}},{plan:{goalId:'7-look',setAt:-1,reviewAt:2}}])assert.equal(sanitizeIdp(bad).plan,null);
const dirty=sanitizeIdp({plan:{goalId:'9-scan',setAt:1,reviewAt:2,notes:[{id:'a',kind:'parent',at:1,text:'no'},{id:'b',kind:'coach',at:1,text:' ok '},null]},history:[{goalId:'x',setAt:1,closedAt:2},{goalId:'9-cover',setAt:1,closedAt:2}]});
assert.deepEqual(Array.from(dirty.plan.notes.map(n=>n.text)),['ok'],'only player/coach notes survive');assert.deepEqual(Array.from(dirty.history.map(h=>h.goalId)),['9-cover']);
const values=new Map(),storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
for(const raw of ['{broken','null','42'])values.set(IDP_KEY,raw),assert.equal(loadIdp(storage).plan,null);
saveIdp(s,storage);assert.equal(JSON.stringify(loadIdp(storage)),JSON.stringify(s),'restores after reopening');
const blocked={getItem(){throw Error('denied')},setItem(){throw Error('denied')}};
assert.equal(loadIdp(blocked).plan,null);saveIdp(s,blocked);
assert.deepEqual([...values.keys()],[IDP_KEY],'IDP writes only its own key');
console.log(`PASS ${IDP_GOALS.length} IDP goals link to real lessons; one focus, notes, review window, sanitising and denied storage`);
